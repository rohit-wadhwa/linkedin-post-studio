/**
 * LinkedIn Post Studio - Background Service Worker
 * Handles extension lifecycle, context menus, and messaging.
 */

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Initialize default settings
    chrome.storage.local.set({
      lps_settings: {
        toolbarEnabled: true,
        keyboardShortcuts: true,
        autoStats: true,
        theme: 'light',
      },
    });

    console.log('LinkedIn Post Studio installed successfully.');
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'GET_SETTINGS':
      chrome.storage.local.get('lps_settings', (result) => {
        sendResponse(result.lps_settings || {});
      });
      return true; // async response

    case 'SAVE_SETTINGS':
      chrome.storage.local.set({ lps_settings: message.settings }, () => {
        sendResponse({ success: true });
      });
      return true;

    case 'GET_STATS':
      chrome.storage.local.get('lps_usage_stats', (result) => {
        sendResponse(result.lps_usage_stats || { postsFormatted: 0, templatesUsed: 0 });
      });
      return true;

    case 'INCREMENT_STAT':
      chrome.storage.local.get('lps_usage_stats', (result) => {
        const stats = result.lps_usage_stats || { postsFormatted: 0, templatesUsed: 0 };
        if (message.stat in stats) {
          stats[message.stat]++;
        }
        chrome.storage.local.set({ lps_usage_stats: stats }, () => {
          sendResponse(stats);
        });
      });
      return true;

    default:
      break;
  }
});
