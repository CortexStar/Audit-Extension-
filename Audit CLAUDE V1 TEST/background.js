// Background script for Implify Audit Extension

// Track tabs that should *not* trigger auto-downloads
const skipDownloadTabs = new Set();

/**
 * Helper: perform navigation (if needed) and send the search message.
 * @param {chrome.tabs.Tab} tab
 */
function startSearch(tab) {
  // Already on workspace page → just send the search message
  if (tab.url.includes('/workspace')) {
    chrome.tabs.sendMessage(tab.id, { action: 'searchMember' });
    return;
  }

  // Otherwise, navigate to workspace first, then search
  const baseUrl = tab.url.includes('implify.groundgame.health')
    ? 'https://implify.groundgame.health/workspace'
    : 'https://implify.ai/workspace';

  chrome.tabs.update(tab.id, { url: baseUrl }, () => {
    // Wait for SPA to load before searching
    setTimeout(() => {
      chrome.tabs.sendMessage(tab.id, { action: 'searchMember' });
    }, 2000);
  });
}

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command !== 'search-member' && command !== 'search-member-info') return;

  const shouldDownload = command === 'search-member';

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];

    // Only operate on Implify domains
    if (
      tab.url.includes('implify.groundgame.health') ||
      tab.url.includes('implify.ai')
    ) {
      // Record download preference for this tab
      if (shouldDownload) {
        skipDownloadTabs.delete(tab.id);
      } else {
        skipDownloadTabs.add(tab.id);
      }

      startSearch(tab);
    } else {
      console.log('Extension only works on Implify domains');
    }
  });
});

// After page navigation completes, decide whether to download
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.url) return;

  // Member pages are any Implify URL *not* containing /workspace
  const isMemberPage =
    (tab.url.includes('implify.groundgame.health') ||
      tab.url.includes('implify.ai')) &&
    !tab.url.includes('/workspace');

  if (!isMemberPage) return;

  // If this tab was flagged to skip downloads, remove the flag and exit
  if (skipDownloadTabs.has(tabId)) {
    skipDownloadTabs.delete(tabId);
    return;
  }

  // Otherwise, trigger the usual download workflow
  setTimeout(() => {
    chrome.tabs.sendMessage(tabId, { action: 'downloadDocuments' });
  }, 2500);
});
