/**
 * LinkedIn Post Studio - Toolbar UI
 * Creates and manages the formatting toolbar injected into LinkedIn.
 */

(function () {
  'use strict';

  const LPS = window.LinkedInPostStudio || {};

  /**
   * Create the main toolbar element.
   */
  function createToolbar(editor) {
    const toolbar = document.createElement('div');
    toolbar.className = 'lps-toolbar';
    toolbar.setAttribute('role', 'toolbar');
    toolbar.setAttribute('aria-label', 'LinkedIn Post Studio Toolbar');

    // Formatting buttons group
    const formatGroup = createButtonGroup('Format', [
      { label: 'B', title: 'Bold (Ctrl+B)', action: () => LPS.applyUnicodeFormat('bold'), className: 'lps-btn-bold' },
      { label: 'I', title: 'Italic (Ctrl+I)', action: () => LPS.applyUnicodeFormat('italic'), className: 'lps-btn-italic' },
      { label: 'BI', title: 'Bold Italic', action: () => LPS.applyUnicodeFormat('boldItalic'), className: 'lps-btn-bold-italic' },
    ]);

    // List buttons group
    const listGroup = createButtonGroup('Lists', [
      { label: '•', title: 'Bullet point', action: () => LPS.insertBullet('bullet') },
      { label: '→', title: 'Arrow point', action: () => LPS.insertBullet('arrow') },
      { label: '—', title: 'Dash point', action: () => LPS.insertBullet('dash') },
      { label: '✓', title: 'Check mark', action: () => LPS.insertBullet('check') },
    ]);

    // Separator buttons group
    const sepGroup = createButtonGroup('Separators', [
      { label: '—', title: 'Line separator', action: () => LPS.insertSeparator('line') },
      { label: '•••', title: 'Dot separator', action: () => LPS.insertSeparator('dots') },
      { label: '✦', title: 'Star separator', action: () => LPS.insertSeparator('stars') },
    ]);

    // Templates dropdown
    const templateBtn = createDropdownButton('Templates', openTemplatePanel);

    // Preview toggle
    const previewBtn = createToolbarButton('Preview', 'Toggle live preview', togglePreview);
    previewBtn.classList.add('lps-btn-preview');

    // Stats display
    const statsDisplay = document.createElement('span');
    statsDisplay.className = 'lps-stats';
    statsDisplay.textContent = '0 words | 0 chars';

    // Assemble toolbar
    toolbar.appendChild(formatGroup);
    toolbar.appendChild(createDivider());
    toolbar.appendChild(listGroup);
    toolbar.appendChild(createDivider());
    toolbar.appendChild(sepGroup);
    toolbar.appendChild(createDivider());
    toolbar.appendChild(templateBtn);
    toolbar.appendChild(previewBtn);
    toolbar.appendChild(statsDisplay);

    // Update stats on editor input
    if (editor) {
      editor.addEventListener('input', () => updateStats(statsDisplay));
      // Initial stats
      updateStats(statsDisplay);
    }

    // Keyboard shortcuts
    setupKeyboardShortcuts(editor);

    return toolbar;
  }

  /**
   * Create a group of toolbar buttons.
   */
  function createButtonGroup(label, buttons) {
    const group = document.createElement('div');
    group.className = 'lps-btn-group';
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', label);

    buttons.forEach((btn) => {
      const button = createToolbarButton(btn.label, btn.title, btn.action);
      if (btn.className) button.classList.add(btn.className);
      group.appendChild(button);
    });

    return group;
  }

  /**
   * Create a single toolbar button.
   */
  function createToolbarButton(label, title, onClick) {
    const button = document.createElement('button');
    button.className = 'lps-btn';
    button.textContent = label;
    button.title = title;
    button.type = 'button';
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    });
    return button;
  }

  /**
   * Create a dropdown trigger button.
   */
  function createDropdownButton(label, onClick) {
    const button = createToolbarButton(label + ' ▾', 'Open ' + label.toLowerCase(), onClick);
    button.classList.add('lps-btn-dropdown');
    return button;
  }

  /**
   * Create a visual divider for the toolbar.
   */
  function createDivider() {
    const div = document.createElement('span');
    div.className = 'lps-divider';
    return div;
  }

  /**
   * Update the word/char count display.
   */
  function updateStats(statsEl) {
    const stats = LPS.getEditorStats();
    statsEl.textContent = `${stats.words} words | ${stats.chars} chars`;
  }

  /**
   * Open the template management panel.
   */
  function openTemplatePanel() {
    const existing = document.querySelector('.lps-template-panel');
    if (existing) {
      existing.remove();
      return;
    }

    const panel = document.createElement('div');
    panel.className = 'lps-template-panel lps-panel';

    const header = document.createElement('div');
    header.className = 'lps-panel-header';
    header.innerHTML = '<span>Templates</span>';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'lps-panel-close';
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => panel.remove());
    header.appendChild(closeBtn);

    const content = document.createElement('div');
    content.className = 'lps-panel-content';

    panel.appendChild(header);
    panel.appendChild(content);

    // Load templates
    if (LPS.loadTemplates) {
      LPS.loadTemplates().then((templates) => {
        renderTemplateList(content, templates);
      });
    } else {
      content.innerHTML = '<p class="lps-empty">No templates yet. Add one below.</p>';
    }

    // Add template button
    const addBtn = document.createElement('button');
    addBtn.className = 'lps-btn lps-btn-add-template';
    addBtn.textContent = '+ New Template';
    addBtn.addEventListener('click', () => openTemplateEditor(content));
    panel.appendChild(addBtn);

    // Insert panel near toolbar
    const toolbar = document.querySelector('.lps-toolbar');
    if (toolbar) {
      toolbar.parentElement.insertBefore(panel, toolbar.nextSibling);
    } else {
      document.body.appendChild(panel);
    }
  }

  /**
   * Render the list of saved templates.
   */
  function renderTemplateList(container, templates) {
    container.innerHTML = '';

    if (!templates || templates.length === 0) {
      container.innerHTML = '<p class="lps-empty">No templates saved yet.</p>';
      return;
    }

    templates.forEach((tpl) => {
      const item = document.createElement('div');
      item.className = 'lps-template-item';

      const name = document.createElement('span');
      name.className = 'lps-template-name';
      name.textContent = tpl.name;

      const category = document.createElement('span');
      category.className = 'lps-template-category';
      category.textContent = tpl.category || 'General';

      const actions = document.createElement('div');
      actions.className = 'lps-template-actions';

      const insertBtn = document.createElement('button');
      insertBtn.className = 'lps-btn lps-btn-sm';
      insertBtn.textContent = 'Insert';
      insertBtn.addEventListener('click', () => {
        LPS.insertTextAtCursor(tpl.content);
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'lps-btn lps-btn-sm lps-btn-danger';
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', () => {
        if (LPS.deleteTemplate) {
          LPS.deleteTemplate(tpl.id).then((updatedTemplates) => {
            renderTemplateList(container, updatedTemplates);
          });
        }
      });

      actions.appendChild(insertBtn);
      actions.appendChild(deleteBtn);

      item.appendChild(name);
      item.appendChild(category);
      item.appendChild(actions);
      container.appendChild(item);
    });
  }

  /**
   * Open the template editor form.
   */
  function openTemplateEditor(container) {
    const existing = container.querySelector('.lps-template-editor');
    if (existing) return;

    const editor = document.createElement('div');
    editor.className = 'lps-template-editor';

    editor.innerHTML = `
      <input type="text" class="lps-input" placeholder="Template name" id="lps-tpl-name" />
      <select class="lps-select" id="lps-tpl-category">
        <option value="General">General</option>
        <option value="Post Hooks">Post Hooks</option>
        <option value="CTAs">CTAs</option>
        <option value="Hashtags">Hashtags</option>
        <option value="Poll Intros">Poll Intros</option>
      </select>
      <textarea class="lps-textarea" placeholder="Template content..." id="lps-tpl-content" rows="4"></textarea>
      <div class="lps-template-editor-actions">
        <button class="lps-btn lps-btn-primary" id="lps-tpl-save">Save</button>
        <button class="lps-btn" id="lps-tpl-cancel">Cancel</button>
      </div>
    `;

    container.appendChild(editor);

    editor.querySelector('#lps-tpl-save').addEventListener('click', () => {
      const name = editor.querySelector('#lps-tpl-name').value.trim();
      const category = editor.querySelector('#lps-tpl-category').value;
      const content = editor.querySelector('#lps-tpl-content').value;

      if (!name || !content) return;

      if (LPS.saveTemplate) {
        LPS.saveTemplate({ name, category, content }).then((templates) => {
          editor.remove();
          renderTemplateList(container, templates);
        });
      }
    });

    editor.querySelector('#lps-tpl-cancel').addEventListener('click', () => {
      editor.remove();
    });
  }

  /**
   * Toggle the live preview panel.
   */
  function togglePreview() {
    const existing = document.querySelector('.lps-preview-panel');
    if (existing) {
      existing.remove();
      return;
    }

    const panel = document.createElement('div');
    panel.className = 'lps-preview-panel lps-panel';

    const header = document.createElement('div');
    header.className = 'lps-panel-header';
    header.innerHTML = '<span>Post Preview</span>';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'lps-panel-close';
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => panel.remove());
    header.appendChild(closeBtn);

    const viewToggle = document.createElement('div');
    viewToggle.className = 'lps-view-toggle';
    viewToggle.innerHTML = `
      <button class="lps-btn lps-btn-sm lps-active" data-view="desktop">Desktop</button>
      <button class="lps-btn lps-btn-sm" data-view="mobile">Mobile</button>
    `;

    const previewContent = document.createElement('div');
    previewContent.className = 'lps-preview-content lps-preview-desktop';

    panel.appendChild(header);
    panel.appendChild(viewToggle);
    panel.appendChild(previewContent);

    // Toggle desktop/mobile view
    viewToggle.addEventListener('click', (e) => {
      const view = e.target.dataset?.view;
      if (!view) return;
      viewToggle.querySelectorAll('.lps-btn').forEach((b) => b.classList.remove('lps-active'));
      e.target.classList.add('lps-active');
      previewContent.className = `lps-preview-content lps-preview-${view}`;
    });

    // Live update preview
    const editor = LPS.getActiveEditor();
    if (editor) {
      const updatePreview = () => {
        const text = editor.innerText || '';
        previewContent.innerHTML = formatPreviewText(text);
      };
      editor.addEventListener('input', updatePreview);
      updatePreview();
    }

    // Insert near toolbar
    const toolbar = document.querySelector('.lps-toolbar');
    if (toolbar) {
      toolbar.parentElement.insertBefore(panel, toolbar.nextSibling);
    } else {
      document.body.appendChild(panel);
    }
  }

  /**
   * Format text for preview display, mimicking LinkedIn's rendering.
   */
  function formatPreviewText(text) {
    if (!text) return '<p class="lps-preview-empty">Start typing to see preview...</p>';

    return text
      .split('\n')
      .map((line) => {
        if (!line.trim()) return '<br>';
        const escaped = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<p>${escaped}</p>`;
      })
      .join('');
  }

  /**
   * Set up keyboard shortcuts for formatting.
   */
  function setupKeyboardShortcuts(editor) {
    if (!editor) return;

    editor.addEventListener('keydown', (e) => {
      // Only handle if Ctrl/Cmd is pressed
      if (!(e.ctrlKey || e.metaKey)) return;

      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          LPS.applyUnicodeFormat('bold');
          break;
        case 'i':
          e.preventDefault();
          LPS.applyUnicodeFormat('italic');
          break;
      }
    });
  }

  // Expose toolbar creation
  LPS.createToolbar = createToolbar;
  window.LinkedInPostStudio = LPS;
})();
