/**
 * LinkedIn Post Studio - Content Script
 * Detects the LinkedIn post editor and injects the formatting toolbar.
 *
 * KEY DESIGN NOTE (March 2026):
 * LinkedIn moved their post-creation modal into a Shadow DOM hosted by
 * `#interop-outlet`.  Standard `document.querySelector` cannot reach elements
 * inside a Shadow DOM, so every DOM query in this script must search both the
 * light DOM **and** any known shadow roots.
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Debug helper — enable in DevTools: window.__LPS_DEBUG = true
  // ---------------------------------------------------------------------------
  function lpsDebug(...args) {
    if (window.__LPS_DEBUG) {
      console.log('[LPS]', ...args);
    }
  }

  // ---------------------------------------------------------------------------
  // Shadow DOM helpers
  // ---------------------------------------------------------------------------

  /**
   * Known Shadow DOM host selectors that LinkedIn uses.
   * If LinkedIn adds more shadow hosts in the future, add their selectors here.
   */
  const SHADOW_HOSTS = ['#interop-outlet'];

  /**
   * Collect all roots (document + open shadow roots) to search.
   */
  function getSearchRoots() {
    const roots = [document];
    for (const hostSel of SHADOW_HOSTS) {
      const host = document.querySelector(hostSel);
      if (host && host.shadowRoot) {
        roots.push(host.shadowRoot);
      }
    }
    return roots;
  }

  /**
   * querySelector that pierces known shadow roots.
   * Returns the first match across all roots.
   */
  function deepQuery(selector) {
    for (const root of getSearchRoots()) {
      const el = root.querySelector(selector);
      if (el) return el;
    }
    return null;
  }

  /**
   * querySelectorAll that pierces known shadow roots.
   * Returns a flat array of all matches across all roots.
   */
  function deepQueryAll(selector) {
    const results = [];
    for (const root of getSearchRoots()) {
      results.push(...root.querySelectorAll(selector));
    }
    return results;
  }

  // ---------------------------------------------------------------------------
  // Selectors
  // ---------------------------------------------------------------------------
  const SELECTORS = {
    editorContainer: [
      '.share-creation-state__text-editor .ql-editor',
      '.share-creation-state__text-editor [contenteditable="true"]',
      '.ql-editor[contenteditable="true"]',
      '.editor-content [contenteditable="true"]',
      '.share-creation-state__text-editor',
      '.ql-editor',
      '.artdeco-modal [contenteditable="true"][role="textbox"]',
      '.artdeco-modal [contenteditable="true"][data-placeholder]',
      '.artdeco-modal [contenteditable="true"]',
      '.share-box--is-open [contenteditable="true"]',
      '[contenteditable="true"][role="textbox"][aria-label]',
      '[contenteditable="true"][role="textbox"]',
    ].join(', '),

    shareBox:
      '.share-box-feed-entry__trigger, .share-creation-state, .share-box',
    modalEditor: '.share-creation-state__text-editor .ql-editor',
    postModal:
      '.share-box--is-open, .artdeco-modal--layer-default, .artdeco-modal, [role="dialog"]',

    // Parent containers for toolbar insertion (ordered by specificity)
    toolbarParent: [
      '.share-creation-state',
      '.share-box--is-open .share-box__header',
      '.artdeco-modal__content',
      '.artdeco-modal',
      '[role="dialog"]',
    ],
  };

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  let toolbarInjected = false;
  let toolbarInjecting = false;
  let currentEditor = null;
  let numberedBulletCounter = 0;
  let settings = {
    toolbarEnabled: true,
    keyboardShortcuts: true,
    autoStats: true,
    theme: 'light',
  };

  // ---------------------------------------------------------------------------
  // Settings
  // ---------------------------------------------------------------------------
  function loadSettings() {
    chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (result) => {
      if (result) {
        Object.assign(settings, result);
      }
    });
  }

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.lps_settings) {
      const newSettings = changes.lps_settings.newValue;
      if (newSettings) {
        Object.assign(settings, newSettings);
        applySettings();
      }
    }
  });

  function applySettings() {
    // Toolbar may live inside a shadow root — use deepQuery
    const toolbar = deepQuery('.lps-toolbar');
    if (toolbar) {
      if (settings.toolbarEnabled) {
        toolbar.style.removeProperty('display');
      } else {
        toolbar.style.setProperty('display', 'none', 'important');
      }
    }
    const stats = deepQuery('.lps-stats');
    if (stats) {
      stats.style.display = settings.autoStats ? '' : 'none';
    }
  }

  function incrementStat(stat) {
    chrome.runtime.sendMessage({ type: 'INCREMENT_STAT', stat });
  }

  // ---------------------------------------------------------------------------
  // Editor detection
  // ---------------------------------------------------------------------------

  /**
   * Find the active LinkedIn post editor element.
   * Searches both the light DOM and known shadow roots.
   */
  function findEditor() {
    const candidates = deepQueryAll(SELECTORS.editorContainer);
    lpsDebug('findEditor: candidates found =', candidates.length);

    // Pass 1 — prefer elements inside a modal/dialog context that are large enough
    for (const el of candidates) {
      const rect = el.getBoundingClientRect();
      if (rect.width < 200 || rect.height < 40) {
        lpsDebug('findEditor: skipping small element', rect.width, rect.height);
        continue;
      }
      if (
        el.closest('.artdeco-modal') ||
        el.closest('[role="dialog"]') ||
        el.closest('.share-creation-state') ||
        el.closest('.share-box--is-open')
      ) {
        lpsDebug('findEditor: matched inside modal/dialog', el);
        return el;
      }
    }

    // Pass 2 — any reasonably-sized candidate
    for (const el of candidates) {
      const rect = el.getBoundingClientRect();
      if (rect.width >= 200 && rect.height >= 40) {
        lpsDebug('findEditor: fallback match', el);
        return el;
      }
    }

    lpsDebug('findEditor: no valid editor found');
    return null;
  }

  // ---------------------------------------------------------------------------
  // Toolbar injection
  // ---------------------------------------------------------------------------

  function checkAndInjectToolbar() {
    const editor = findEditor();
    if (editor && !toolbarInjected && !toolbarInjecting) {
      currentEditor = editor;
      injectToolbar(editor);
    }

    // Reset when editor disappears (modal closed)
    if (!editor && (toolbarInjected || toolbarInjecting)) {
      toolbarInjected = false;
      toolbarInjecting = false;
      currentEditor = null;
      numberedBulletCounter = 0;
    }
  }

  /**
   * Find the best DOM node to insert the toolbar into/before.
   */
  function findToolbarInsertionPoint(editor) {
    // Option A — walk up from the editor into a known container
    for (const sel of SELECTORS.toolbarParent) {
      const container = editor.closest(sel);
      if (container) {
        lpsDebug('findToolbarInsertionPoint: matched', sel);
        return { parent: container, reference: container.firstChild };
      }
    }

    // Option B — insert right before the editor's own parent
    if (editor.parentElement) {
      lpsDebug('findToolbarInsertionPoint: using editor.parentElement');
      return { parent: editor.parentElement, reference: editor };
    }

    return null;
  }

  /**
   * Inject the formatting toolbar above the editor.
   * Handles Shadow DOM by injecting the toolbar *inside* the same shadow tree
   * where the editor lives, and also injects styles if needed.
   */
  function injectToolbar(editor, retryCount) {
    if (!editor.isConnected) {
      lpsDebug('injectToolbar: editor disconnected');
      toolbarInjecting = false;
      return;
    }
    if (!settings.toolbarEnabled) {
      lpsDebug('injectToolbar: disabled in settings');
      return;
    }

    toolbarInjecting = true;

    const insertion = findToolbarInsertionPoint(editor);
    if (!insertion) {
      lpsDebug('injectToolbar: no insertion point');
      toolbarInjecting = false;
      return;
    }

    const { parent: parentContainer, reference } = insertion;

    // Duplicate guard — search inside the same root as the editor
    const editorRoot = editor.getRootNode();
    if (
      parentContainer.querySelector('.lps-toolbar') ||
      (editorRoot && editorRoot.querySelector && editorRoot.querySelector('.lps-toolbar'))
    ) {
      lpsDebug('injectToolbar: already present');
      toolbarInjected = true;
      toolbarInjecting = false;
      return;
    }

    const createFn = window.LinkedInPostStudio?.createToolbar;
    if (!createFn) {
      const attempt = retryCount || 0;
      if (attempt < 20) {
        lpsDebug('injectToolbar: createToolbar not ready, retry', attempt);
        setTimeout(() => injectToolbar(editor, attempt + 1), 150);
      } else {
        lpsDebug('injectToolbar: gave up waiting for createToolbar');
        toolbarInjecting = false;
      }
      return;
    }

    // If the editor lives in a Shadow DOM, the extension's styles.css is NOT
    // automatically applied there.  We need to inject them manually.
    injectStylesIntoShadowRoot(editor);

    const toolbar = createFn(editor);
    if (toolbar) {
      lpsDebug(
        'injectToolbar: inserting into',
        parentContainer.className || parentContainer.tagName
      );
      parentContainer.insertBefore(toolbar, reference);
      toolbarInjected = true;
      applySettings();
    }
    toolbarInjecting = false;
  }

  /**
   * If `element` lives inside a ShadowRoot, inject our extension stylesheet
   * so the toolbar renders correctly.  No-op if already injected or if the
   * element is in the light DOM.
   */
  function injectStylesIntoShadowRoot(element) {
    const root = element.getRootNode();
    if (!(root instanceof ShadowRoot)) return; // light DOM — styles already loaded
    if (root.querySelector('style[data-lps-styles]')) return; // already injected

    lpsDebug('injectStylesIntoShadowRoot: injecting styles');

    // Fetch our bundled CSS from the extension
    const cssURL = chrome.runtime.getURL('styles.css');
    fetch(cssURL)
      .then((r) => r.text())
      .then((css) => {
        const style = document.createElement('style');
        style.setAttribute('data-lps-styles', 'true');
        style.textContent = css;
        root.prepend(style);
        lpsDebug('injectStylesIntoShadowRoot: styles injected');
      })
      .catch((err) => {
        lpsDebug('injectStylesIntoShadowRoot: failed', err);
      });
  }

  // ---------------------------------------------------------------------------
  // Observation — watch for editor appearance
  // ---------------------------------------------------------------------------

  function observeEditorAppearance() {
    let debounceTimer = null;

    // Observe the light DOM (document.body)
    const bodyObserver = new MutationObserver(() => {
      if (debounceTimer) return;
      debounceTimer = setTimeout(() => {
        debounceTimer = null;
        checkAndInjectToolbar();
      }, 100);
    });
    bodyObserver.observe(document.body, { childList: true, subtree: true });

    // Also observe inside known shadow roots — their mutations do NOT
    // bubble up to the light-DOM MutationObserver.
    function observeShadowRoots() {
      for (const hostSel of SHADOW_HOSTS) {
        const host = document.querySelector(hostSel);
        if (host && host.shadowRoot && !host.__lpsObserving) {
          lpsDebug('observeEditorAppearance: attaching observer to shadow root', hostSel);
          const shadowObserver = new MutationObserver(() => {
            if (debounceTimer) return;
            debounceTimer = setTimeout(() => {
              debounceTimer = null;
              checkAndInjectToolbar();
            }, 100);
          });
          shadowObserver.observe(host.shadowRoot, { childList: true, subtree: true });
          host.__lpsObserving = true;
        }
      }
    }

    observeShadowRoots();

    // Initial check
    checkAndInjectToolbar();

    // Periodic fallback — handles late shadow root creation and SPA nav
    setInterval(() => {
      observeShadowRoots(); // re-attach if shadow hosts appeared late
      if (!toolbarInjected && !toolbarInjecting) {
        lpsDebug('observeEditorAppearance: periodic re-check');
        checkAndInjectToolbar();
      }
    }, 2000);
  }

  // ---------------------------------------------------------------------------
  // Editor API (consumed by toolbar-ui.js, template-manager.js)
  // ---------------------------------------------------------------------------

  function getActiveEditor() {
    if (currentEditor && currentEditor.isConnected) return currentEditor;
    currentEditor = findEditor();
    return currentEditor;
  }

  function insertTextAtCursor(text) {
    const editor = getActiveEditor();
    if (!editor) return;

    editor.focus();

    // Shadow DOM selection support — same pattern as applyUnicodeFormat
    const editorRoot = editor.getRootNode();
    let selection = null;

    if (editorRoot instanceof ShadowRoot && editorRoot.getSelection) {
      selection = editorRoot.getSelection();
    }
    if (!selection || !selection.rangeCount) {
      selection = window.getSelection();
    }

    // If no valid selection, or selection is outside the editor, place cursor
    // at the end of the editor content.
    let range;
    if (selection && selection.rangeCount) {
      range = selection.getRangeAt(0);
      // Verify the range is inside the editor
      if (!editor.contains(range.commonAncestorContainer)) {
        lpsDebug('insertTextAtCursor: selection outside editor, moving to end');
        range = document.createRange();
        range.selectNodeContents(editor);
        range.collapse(false); // collapse to end
        selection.removeAllRanges();
        selection.addRange(range);
      }
    } else {
      lpsDebug('insertTextAtCursor: no selection, creating at end');
      range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false); // collapse to end
      if (!selection) return;
      selection.removeAllRanges();
      selection.addRange(range);
    }

    // Delete any selected content (relevant when replacing selected text)
    if (!range.collapsed) {
      range.deleteContents();
    }

    // In contenteditable, '\n' in a text node renders as whitespace, not a
    // line break.  Split on newlines and insert <br> elements between parts.
    const parts = text.split('\n');
    const frag = document.createDocumentFragment();
    let lastNode = null;

    parts.forEach((part, i) => {
      if (i > 0) {
        const br = document.createElement('br');
        frag.appendChild(br);
        lastNode = br;
      }
      if (part) {
        const tn = document.createTextNode(part);
        frag.appendChild(tn);
        lastNode = tn;
      }
    });

    range.insertNode(frag);

    // Place cursor after the last inserted node
    if (lastNode) {
      range.setStartAfter(lastNode);
      range.setEndAfter(lastNode);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    editor.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // Unicode Mathematical Alphanumeric ranges for formatting
  const UNICODE_RANGES = {
    bold:       { upper: 0x1d400, lower: 0x1d41a, digitStart: 0x1d7ce },
    italic:     { upper: 0x1d434, lower: 0x1d44e },
    boldItalic: { upper: 0x1d468, lower: 0x1d482 },
  };

  function applyUnicodeFormat(type) {
    const editor = getActiveEditor();
    lpsDebug('applyUnicodeFormat called, type:', type, 'editor:', !!editor);
    if (!editor) { lpsDebug('no editor found'); return; }

    // In Shadow DOM, window.getSelection() may not see the selection.
    // Try the shadow root's getSelection() first if available.
    const editorRoot = editor.getRootNode();
    let selection = null;

    if (editorRoot instanceof ShadowRoot && editorRoot.getSelection) {
      selection = editorRoot.getSelection();
      lpsDebug('using shadowRoot.getSelection(), type:', selection?.type);
    }

    // Fallback to window.getSelection()
    if (!selection || !selection.rangeCount || selection.isCollapsed) {
      selection = window.getSelection();
      lpsDebug('using window.getSelection(), type:', selection?.type);
    }

    if (!selection || !selection.rangeCount || selection.isCollapsed) {
      lpsDebug('no valid selection, aborting');
      return;
    }

    const selectedText = selection.toString();

    // Toggle logic: if text is already in the target format, revert to plain.
    // If text is in any other Unicode format, revert to plain first then apply.
    const detectedFormat = detectUnicodeFormat(selectedText);
    let formatted;
    if (detectedFormat === type) {
      // Already this format — toggle OFF (revert to normal)
      formatted = revertFromUnicode(selectedText);
      lpsDebug('toggle OFF:', type, selectedText, '→', formatted);
    } else if (detectedFormat && detectedFormat !== type) {
      // In a different format — revert first, then apply new format
      const plain = revertFromUnicode(selectedText);
      formatted = convertToUnicode(plain, type);
      lpsDebug('switch format:', detectedFormat, '→', type, selectedText, '→', formatted);
    } else {
      // Plain text — apply format
      formatted = convertToUnicode(selectedText, type);
      lpsDebug('apply format:', type, selectedText, '→', formatted);
    }

    const range = selection.getRangeAt(0);
    range.deleteContents();
    const textNode = document.createTextNode(formatted);
    range.insertNode(textNode);

    // Re-select the formatted text so the user sees what was changed
    // and can toggle again without re-selecting manually.
    range.setStartBefore(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);

    editor.dispatchEvent(new Event('input', { bubbles: true }));
    incrementStat('postsFormatted');
  }

  function convertToUnicode(text, type) {
    const map = UNICODE_RANGES[type];
    if (!map) return text;

    return Array.from(text)
      .map((char) => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90 && map.upper)
          return String.fromCodePoint(map.upper + (code - 65));
        if (code >= 97 && code <= 122 && map.lower)
          return String.fromCodePoint(map.lower + (code - 97));
        if (code >= 48 && code <= 57 && map.digitStart)
          return String.fromCodePoint(map.digitStart + (code - 48));
        return char;
      })
      .join('');
  }

  /**
   * Detect if text is already in a Unicode formatted style.
   * Checks the first formatted character to determine the format.
   * Returns 'bold', 'italic', 'boldItalic', or null if plain.
   * Note: assumes homogeneous formatting within the selection — mixed-format
   * text (e.g., bold + italic chars) returns the format of the first match.
   */
  function detectUnicodeFormat(text) {
    for (const char of text) {
      const cp = char.codePointAt(0);
      // Skip non-letter characters (spaces, punctuation, emoji, etc.)
      if (cp < 0x1d400) continue;

      // Bold uppercase: U+1D400–U+1D419, lowercase: U+1D41A–U+1D433
      if ((cp >= 0x1d400 && cp <= 0x1d419) || (cp >= 0x1d41a && cp <= 0x1d433)) return 'bold';
      // Bold digits: U+1D7CE–U+1D7D7
      if (cp >= 0x1d7ce && cp <= 0x1d7d7) return 'bold';
      // Italic uppercase: U+1D434–U+1D44D, lowercase: U+1D44E–U+1D467
      if ((cp >= 0x1d434 && cp <= 0x1d44d) || (cp >= 0x1d44e && cp <= 0x1d467)) return 'italic';
      // Bold-Italic uppercase: U+1D468–U+1D481, lowercase: U+1D482–U+1D49B
      if ((cp >= 0x1d468 && cp <= 0x1d481) || (cp >= 0x1d482 && cp <= 0x1d49b)) return 'boldItalic';
    }
    return null;
  }

  /**
   * Revert Unicode-formatted text back to plain ASCII.
   * Handles bold, italic, and bold-italic ranges.
   */
  function revertFromUnicode(text) {
    return Array.from(text)
      .map((char) => {
        const cp = char.codePointAt(0);

        // Bold uppercase → A-Z
        if (cp >= 0x1d400 && cp <= 0x1d419) return String.fromCharCode(65 + (cp - 0x1d400));
        // Bold lowercase → a-z
        if (cp >= 0x1d41a && cp <= 0x1d433) return String.fromCharCode(97 + (cp - 0x1d41a));
        // Bold digits → 0-9
        if (cp >= 0x1d7ce && cp <= 0x1d7d7) return String.fromCharCode(48 + (cp - 0x1d7ce));

        // Italic uppercase → A-Z
        if (cp >= 0x1d434 && cp <= 0x1d44d) return String.fromCharCode(65 + (cp - 0x1d434));
        // Italic lowercase → a-z
        if (cp >= 0x1d44e && cp <= 0x1d467) return String.fromCharCode(97 + (cp - 0x1d44e));

        // Bold-Italic uppercase → A-Z
        if (cp >= 0x1d468 && cp <= 0x1d481) return String.fromCharCode(65 + (cp - 0x1d468));
        // Bold-Italic lowercase → a-z
        if (cp >= 0x1d482 && cp <= 0x1d49b) return String.fromCharCode(97 + (cp - 0x1d482));

        return char;
      })
      .join('');
  }

  function insertBullet(type) {
    if (type === 'numbered') {
      numberedBulletCounter++;
      insertTextAtCursor('\n' + numberedBulletCounter + '. ');
      return;
    }
    const markers = { bullet: '• ', arrow: '→ ', dash: '— ', check: '✓ ' };
    insertTextAtCursor('\n' + (markers[type] || '• '));
  }

  function resetNumberedCounter() {
    numberedBulletCounter = 0;
  }

  function insertSeparator(style) {
    const separators = {
      line: '\n———————————————\n',
      dots: '\n• • • • • • • • • •\n',
      stars: '\n✦ ✦ ✦ ✦ ✦\n',
      wave: '\n〰〰〰〰〰〰〰〰〰〰\n',
    };
    insertTextAtCursor(separators[style] || separators.line);
  }

  /**
   * Insert a formatted link reference into the editor.
   * LinkedIn does not support clickable hyperlinks in post text,
   * so we insert a readable URL reference format instead.
   */
  function insertLink() {
    const url = prompt('Enter URL:');
    if (!url || !url.trim()) return;

    const label = prompt('Enter link label (optional — leave blank to show URL only):');
    let linkText;
    if (label && label.trim()) {
      linkText = '\n🔗 ' + label.trim() + ' → ' + url.trim() + '\n';
    } else {
      linkText = '\n🔗 ' + url.trim() + '\n';
    }
    insertTextAtCursor(linkText);
  }

  /**
   * Remove a link reference pattern from the current selection.
   * Strips the 🔗 prefix and → URL suffix, leaving just the label text.
   */
  function removeLink() {
    const editor = getActiveEditor();
    if (!editor) return;

    const editorRoot = editor.getRootNode();
    let selection = null;
    if (editorRoot instanceof ShadowRoot && editorRoot.getSelection) {
      selection = editorRoot.getSelection();
    }
    if (!selection || !selection.rangeCount) {
      selection = window.getSelection();
    }
    if (!selection || !selection.rangeCount) return;

    const selectedText = selection.toString();
    if (!selectedText) {
      alert('Select a link reference (🔗 ...) to remove it.');
      return;
    }

    // Strip link formatting: "🔗 Label → URL" → "Label"  or  "🔗 URL" → ""
    let cleaned = selectedText.replace(/🔗\s*/, '');
    const arrowIdx = cleaned.indexOf(' → ');
    if (arrowIdx !== -1) {
      cleaned = cleaned.substring(0, arrowIdx).trim();
    } else {
      // No arrow means it was URL-only, remove entirely
      cleaned = '';
    }

    const range = selection.getRangeAt(0);
    range.deleteContents();
    if (cleaned) {
      range.insertNode(document.createTextNode(cleaned));
    }
    editor.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function getEditorStats() {
    const editor = getActiveEditor();
    if (!editor) return { chars: 0, words: 0, lines: 0 };
    const text = editor.innerText || '';
    return {
      chars: text.length,
      words: text.trim() ? text.trim().split(/\s+/).length : 0,
      lines: text.split('\n').length,
    };
  }

  // ---------------------------------------------------------------------------
  // Bootstrap
  // ---------------------------------------------------------------------------
  loadSettings();

  window.LinkedInPostStudio = window.LinkedInPostStudio || {};
  Object.assign(window.LinkedInPostStudio, {
    findEditor,
    getActiveEditor,
    insertTextAtCursor,
    applyUnicodeFormat,
    detectUnicodeFormat,
    revertFromUnicode,
    insertBullet,
    insertSeparator,
    insertLink,
    removeLink,
    getEditorStats,
    incrementStat,
    resetNumberedCounter,
    settings,
    SELECTORS,
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeEditorAppearance);
  } else {
    observeEditorAppearance();
  }
})();
