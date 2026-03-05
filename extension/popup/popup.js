/**
 * LinkedIn Post Studio - Popup Script
 * Manages the extension popup UI interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  loadStats();
  setupEventListeners();
});

/**
 * Load and apply saved settings.
 */
function loadSettings() {
  chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (settings) => {
    if (!settings) return;
    document.getElementById('toggle-toolbar').checked = settings.toolbarEnabled !== false;
    document.getElementById('toggle-shortcuts').checked = settings.keyboardShortcuts !== false;
    document.getElementById('toggle-stats').checked = settings.autoStats !== false;
  });
}

/**
 * Load usage stats.
 */
function loadStats() {
  chrome.runtime.sendMessage({ type: 'GET_STATS' }, (stats) => {
    if (!stats) return;
    document.getElementById('stat-posts').textContent = stats.postsFormatted || 0;
    document.getElementById('stat-templates').textContent = stats.templatesUsed || 0;
  });
}

/**
 * Set up event listeners for popup controls.
 */
function setupEventListeners() {
  // Settings toggles
  const toggleIds = ['toggle-toolbar', 'toggle-shortcuts', 'toggle-stats'];
  const settingKeys = ['toolbarEnabled', 'keyboardShortcuts', 'autoStats'];

  toggleIds.forEach((id, index) => {
    document.getElementById(id).addEventListener('change', (e) => {
      chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (settings) => {
        settings = settings || {};
        settings[settingKeys[index]] = e.target.checked;
        chrome.runtime.sendMessage({ type: 'SAVE_SETTINGS', settings });
      });
    });
  });

  // Open LinkedIn
  document.getElementById('btn-open-linkedin').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://www.linkedin.com/feed/' });
  });

  // Manage templates - switch to LinkedIn tab or open it
  document.getElementById('btn-manage-templates').addEventListener('click', () => {
    chrome.tabs.query({ url: 'https://www.linkedin.com/*' }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.update(tabs[0].id, { active: true });
      } else {
        chrome.tabs.create({ url: 'https://www.linkedin.com/feed/' });
      }
    });
  });

  // Export templates
  document.getElementById('btn-export-templates').addEventListener('click', () => {
    chrome.storage.local.get('lps_templates', (result) => {
      const templates = result.lps_templates || [];
      const blob = new Blob([JSON.stringify(templates, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'linkedin-post-studio-templates.json';
      a.click();
      URL.revokeObjectURL(url);
    });
  });

  // Import templates
  document.getElementById('btn-import-templates').addEventListener('click', () => {
    document.getElementById('import-file').click();
  });

  document.getElementById('import-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (!Array.isArray(imported)) {
          alert('Invalid template file format.');
          return;
        }

        chrome.storage.local.get('lps_templates', (result) => {
          const existing = result.lps_templates || [];
          const merged = [...existing, ...imported.map((t) => ({
            ...t,
            id: 'tpl-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
          }))];
          chrome.storage.local.set({ lps_templates: merged }, () => {
            alert(`Imported ${imported.length} templates successfully!`);
          });
        });
      } catch (err) {
        alert('Failed to parse template file.');
      }
    };
    reader.readAsText(file);
  });
}
