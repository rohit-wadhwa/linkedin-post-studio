/**
 * LinkedIn Post Studio - Content Script
 * Detects the LinkedIn post editor and injects the formatting toolbar.
 */

(function () {
  'use strict';

  const SELECTORS = {
    // LinkedIn post editor selectors (multiple selectors for resilience against LinkedIn DOM changes)
    editorContainer: [
      '.share-creation-state__text-editor .ql-editor',
      '.share-creation-state__text-editor [contenteditable="true"]',
      '.ql-editor[contenteditable="true"]',
      '[contenteditable="true"][role="textbox"]',
      '.share-creation-state__text-editor',
      '.editor-content [contenteditable="true"]',
      '.ql-editor',
    ].join(', '),
    shareBox: '.share-box-feed-entry__trigger, .share-creation-state',
    modalEditor: '.share-creation-state__text-editor .ql-editor',
    postModal: '.share-box--is-open, .artdeco-modal--layer-default, .artdeco-modal',
  };

  let toolbarInjected = false;
  let toolbarInjecting = false; // Prevents duplicate retry chains
  let currentEditor = null;
  let settings = {
    toolbarEnabled: true,
    keyboardShortcuts: true,
    autoStats: true,
    theme: 'light',
  };

  /**
   * Load settings from background service worker.
   */
  function loadSettings() {
    chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (result) => {
      if (result) {
        Object.assign(settings, result);
      }
    });
  }

  /**
   * Listen for settings changes from popup.
   */
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.lps_settings) {
      const newSettings = changes.lps_settings.newValue;
      if (newSettings) {
        Object.assign(settings, newSettings);
        applySettings();
      }
    }
  });

  /**
   * Apply current settings to the UI.
   */
  function applySettings() {
    const toolbar = document.querySelector('.lps-toolbar');
    if (toolbar) {
      if (settings.toolbarEnabled) {
        toolbar.style.removeProperty('display');
      } else {
        toolbar.style.setProperty('display', 'none', 'important');
      }
    }
    const stats = document.querySelector('.lps-stats');
    if (stats) {
      stats.style.display = settings.autoStats ? '' : 'none';
    }
  }

  /**
   * Send a stat increment to background.
   */
  function incrementStat(stat) {
    chrome.runtime.sendMessage({ type: 'INCREMENT_STAT', stat });
  }

  /**
   * Find the active LinkedIn post editor element.
   */
  function findEditor() {
    return document.querySelector(SELECTORS.editorContainer);
  }

  /**
   * Try to detect and inject toolbar into an editor if present.
   */
  function checkAndInjectToolbar() {
    const editor = findEditor();
    if (editor && !toolbarInjected && !toolbarInjecting) {
      currentEditor = editor;
      injectToolbar(editor);
    }

    // Reset if editor is removed (modal closed)
    if (!editor && (toolbarInjected || toolbarInjecting)) {
      toolbarInjected = false;
      toolbarInjecting = false;
      currentEditor = null;
      numberedBulletCounter = 0;
    }
  }

  /**
   * Wait for the LinkedIn post modal/editor to appear,
   * then inject the toolbar. Uses debounce to avoid excessive DOM queries.
   */
  function observeEditorAppearance() {
    let debounceTimer = null;

    const observer = new MutationObserver(() => {
      if (debounceTimer) return;
      debounceTimer = setTimeout(() => {
        debounceTimer = null;
        checkAndInjectToolbar();
      }, 100);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Initial check — editor may already be present when scripts load
    checkAndInjectToolbar();
  }

  /**
   * Inject the formatting toolbar above the editor.
   * Retries if createToolbar is not yet available (toolbar-ui.js still loading).
   */
  function injectToolbar(editor, retryCount) {
    // Guard against stale editor references (e.g., modal closed during retry)
    if (!editor.isConnected) {
      toolbarInjecting = false;
      return;
    }

    if (!settings.toolbarEnabled) return;

    toolbarInjecting = true;

    // Find the best parent container to place toolbar
    const parentContainer =
      editor.closest('.share-creation-state') ||
      editor.closest('.artdeco-modal__content') ||
      editor.closest('.artdeco-modal') ||
      editor.parentElement;

    if (!parentContainer) {
      toolbarInjecting = false;
      return;
    }

    // Avoid duplicate injection
    if (parentContainer.querySelector('.lps-toolbar')) {
      toolbarInjected = true;
      toolbarInjecting = false;
      return;
    }

    const createFn = window.LinkedInPostStudio?.createToolbar;
    if (!createFn) {
      // toolbar-ui.js may not have loaded yet — retry a few times
      const attempt = retryCount || 0;
      if (attempt < 10) {
        setTimeout(() => injectToolbar(editor, attempt + 1), 100);
      } else {
        toolbarInjecting = false;
      }
      return;
    }

    const toolbar = createFn(editor);
    if (toolbar) {
      parentContainer.insertBefore(toolbar, parentContainer.firstChild);
      toolbarInjected = true;
      applySettings();
    }
    toolbarInjecting = false;
  }

  /**
   * Get the currently active editor element.
   * Validates that the cached editor is still in the DOM.
   */
  function getActiveEditor() {
    if (currentEditor && currentEditor.isConnected) {
      return currentEditor;
    }
    currentEditor = findEditor();
    return currentEditor;
  }

  /**
   * Insert text at the cursor position in the editor.
   */
  function insertTextAtCursor(text) {
    const editor = getActiveEditor();
    if (!editor) return;

    editor.focus();
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    range.deleteContents();

    const textNode = document.createTextNode(text);
    range.insertNode(textNode);

    // Move cursor after inserted text
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);

    // Trigger input event so LinkedIn registers the change
    editor.dispatchEvent(new Event('input', { bubbles: true }));
  }

  /**
   * Apply Unicode formatting to selected text.
   * LinkedIn doesn't support HTML bold/italic, so we use Unicode characters.
   */
  function applyUnicodeFormat(type) {
    const editor = getActiveEditor();
    if (!editor) return;

    const selection = window.getSelection();
    if (!selection.rangeCount || selection.isCollapsed) return;

    const selectedText = selection.toString();
    const formatted = convertToUnicode(selectedText, type);

    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(formatted));

    editor.dispatchEvent(new Event('input', { bubbles: true }));

    incrementStat('postsFormatted');
  }

  /**
   * Convert text to Unicode bold, italic, or bold-italic characters.
   */
  function convertToUnicode(text, type) {
    const maps = {
      bold: {
        upper: 0x1D400, // 𝐀
        lower: 0x1D41A, // 𝐚
        digitStart: 0x1D7CE, // 𝟎
      },
      italic: {
        upper: 0x1D434, // 𝐴
        lower: 0x1D44E, // 𝑎
      },
      boldItalic: {
        upper: 0x1D468, // 𝑨
        lower: 0x1D482, // 𝒂
      },
    };

    const map = maps[type];
    if (!map) return text;

    return Array.from(text)
      .map((char) => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90 && map.upper) {
          return String.fromCodePoint(map.upper + (code - 65));
        }
        if (code >= 97 && code <= 122 && map.lower) {
          return String.fromCodePoint(map.lower + (code - 97));
        }
        if (code >= 48 && code <= 57 && map.digitStart) {
          return String.fromCodePoint(map.digitStart + (code - 48));
        }
        return char;
      })
      .join('');
  }

  // Track numbered bullet counter per editor session
  let numberedBulletCounter = 0;

  /**
   * Insert a bullet list marker at the current line.
   */
  function insertBullet(type) {
    if (type === 'numbered') {
      numberedBulletCounter++;
      insertTextAtCursor('\n' + numberedBulletCounter + '. ');
      return;
    }

    const markers = {
      bullet: '• ',
      arrow: '→ ',
      dash: '— ',
      check: '✓ ',
    };

    const marker = markers[type] || '• ';
    insertTextAtCursor('\n' + marker);
  }

  /**
   * Reset the numbered bullet counter (e.g., when editor closes).
   */
  function resetNumberedCounter() {
    numberedBulletCounter = 0;
  }

  /**
   * Insert a separator/divider line.
   */
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
   * Get word and character count from the editor.
   */
  function getEditorStats() {
    const editor = getActiveEditor();
    if (!editor) return { chars: 0, words: 0, lines: 0 };

    const text = editor.innerText || '';
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text.split('\n').length;

    return { chars, words, lines };
  }

  // Load settings on init
  loadSettings();

  // Expose API for toolbar-ui.js and template-manager.js
  window.LinkedInPostStudio = window.LinkedInPostStudio || {};
  Object.assign(window.LinkedInPostStudio, {
    findEditor,
    getActiveEditor,
    insertTextAtCursor,
    applyUnicodeFormat,
    insertBullet,
    insertSeparator,
    getEditorStats,
    incrementStat,
    resetNumberedCounter,
    settings,
    SELECTORS,
  });

  // Start observing
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeEditorAppearance);
  } else {
    observeEditorAppearance();
  }
})();
