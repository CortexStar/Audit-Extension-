// background.js (v18 – Resilient, adapted for v0.9)

console.log("BACKGROUND SCRIPT (Director v18 - Resilient) loaded.");

const activeWorkflowListeners = {};

chrome.commands.onCommand.addListener((command, tab) => {
  if (command === "start_workflow") {
    console.log(`Workflow triggered for tab: ${tab.id}. Starting process.`);
    startWorkflowForTab(tab.id);
  }

  if (command === "go_to_dashboard") {
    const currentUrl = tab.url;
    if (currentUrl.includes("https://implify.ai/")) {
      chrome.tabs.update(tab.id, { url: "https://implify.ai/workspace" });
    } else if (currentUrl.includes("https://implify.groundgame.health/")) {
      chrome.tabs.update(tab.id, { url: "https://implify.groundgame.health/workspace" });
    }
  }
});

function startWorkflowForTab(tabId) {
  // clean up any lingering listener for this tab
  if (activeWorkflowListeners[tabId]) {
    chrome.webNavigation.onHistoryStateUpdated.removeListener(
      activeWorkflowListeners[tabId]
    );
    delete activeWorkflowListeners[tabId];
  }

  const historyStateListener = (details) => {
    if (details.tabId === tabId && details.url.includes("/memberinfo")) {
      console.log(`[Tab ${tabId}] Member page navigation detected.`);

      // remove listener after first successful fire
      chrome.webNavigation.onHistoryStateUpdated.removeListener(
        activeWorkflowListeners[tabId]
      );
      delete activeWorkflowListeners[tabId];

      // delay for SPA render
      setTimeout(() => {
        console.log(`[Tab ${tabId}] Injecting download worker (v0.5).`);
        chrome.scripting.executeScript({
          target: { tabId },
          files: ["download_script_v05.js"]          // ← *** only change ***
        });
      }, 800);
    }
  };

  activeWorkflowListeners[tabId] = historyStateListener;
  chrome.webNavigation.onHistoryStateUpdated.addListener(historyStateListener);

  console.log(`[Tab ${tabId}] Injecting search worker.`);
  chrome.scripting.executeScript({
    target: { tabId },
    files: ["content_script.js"]
  });
}
