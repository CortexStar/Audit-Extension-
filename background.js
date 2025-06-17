// background.js (v17.4) - "Director" with Dashboard Reset command
// This version correctly handles workflows started from any page by adding
// a delay to account for SPA rendering time after navigation.
// It also adds a new command to reset to the workspace dashboard.

console.log("BACKGROUND SCRIPT (Director v17.4) loaded.");

/**
 * Listener for all registered commands.
 * This now handles both the main workflow and the new dashboard navigation.
 */
chrome.commands.onCommand.addListener((command, tab) => {
  // --- Main Workflow Trigger ---
  if (command === "start_workflow") {
    console.log(`Workflow triggered for tab: ${tab.id}. Starting process.`);
    startWorkflowForTab(tab.id);
  }

  // --- NEW: Dashboard Navigation Trigger (for Alt+Shift+H) ---
  if (command === "go_to_dashboard") {
    // Check the current tab's URL to determine the correct dashboard.
    const currentUrl = tab.url;

    if (currentUrl.includes("https://implify.ai/")) {
      const dashboardUrl = "https://implify.ai/workspace";
      console.log(`[Tab ${tab.id}] Navigating to AI dashboard: ${dashboardUrl}`);
      chrome.tabs.update(tab.id, { url: dashboardUrl });

    } else if (currentUrl.includes("https://implify.groundgame.health/")) {
      const dashboardUrl = "https://implify.groundgame.health/workspace";
      console.log(`[Tab ${tab.id}] Navigating to Groundgame dashboard: ${dashboardUrl}`);
      chrome.tabs.update(tab.id, { url: dashboardUrl });

    } else {
      console.log(`[Tab ${tab.id}] Dashboard shortcut used on a non-target page.`);
    }
  }
});


/**
 * Manages a single, isolated workflow for a given tab.
 * It adds a temporary navigation listener and cleans it up once its job is done.
 * @param {number} tabId - The ID of the tab where the workflow should run.
 */
function startWorkflowForTab(tabId) {

  /**
   * This is the specific listener for this one workflow instance.
   * It will be added when the workflow starts and removed when it completes.
   * @param {object} details - The details of the navigation event.
   */
  const historyStateListener = (details) => {
    // Filter events to match our specific criteria:
    // 1. The event must be for the tab we started the workflow on.
    // 2. The URL must now contain '/memberinfo', indicating successful navigation.
    if (details.tabId === tabId && details.url.includes('/memberinfo')) {
      console.log(`[Tab ${tabId}] Member page navigation detected. URL: ${details.url}`);
      
      // --- CRITICAL CLEANUP STEP ---
      // Remove the listener immediately to prevent any potential for it to fire multiple times.
      // Once we have our signal, its job is done.
      console.log(`[Tab ${tabId}] Navigation confirmed. Removing listener before script injection.`);
      chrome.webNavigation.onHistoryStateUpdated.removeListener(historyStateListener);

      // --- TIMING FIX FOR SPA RACE CONDITION ---
      // A deliberate delay is ESSENTIAL here. The onHistoryStateUpdated event fires before
      // the SPA's JavaScript has finished re-rendering the page and attaching its own event handlers.
      // This delay gives the page time to become fully interactive before we try to click things.
      setTimeout(() => {
        console.log(`[Tab ${tabId}] Delay complete. Injecting download_script.js.`);
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ["download_script.js"]
        });
      }, 800); // 800ms delay. This provides a safe buffer for the page to re-render.
    }
  };

  // Add the specific, temporary listener for this workflow instance.
  console.log(`[Tab ${tabId}] Attaching temporary webNavigation listener.`);
  chrome.webNavigation.onHistoryStateUpdated.addListener(historyStateListener);

  // Now that the listener "trap" is set, inject the first script to initiate the search.
  console.log(`[Tab ${tabId}] Injecting content_script.js to start the search.`);
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ["content_script.js"]
  }, (injectionResults) => {
    if (chrome.runtime.lastError) {
      console.error(`[Tab ${tabId}] Failed to inject content_script.js: ${chrome.runtime.lastError.message}`);
      // If the first script fails to inject, we must clean up the listener.
      chrome.webNavigation.onHistoryStateUpdated.removeListener(historyStateListener);
      console.log(`[Tab ${tabId}] Cleaned up listener due to injection failure.`);
    }
  });
}