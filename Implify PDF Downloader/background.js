// Listens for the command defined in manifest.json
chrome.commands.onCommand.addListener((command) => {
  if (command === "download_and_zip") { // The command name is kept for simplicity
    // Get the currently active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        // Inject our single content script
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ["content_script.js"]
        });
      }
    });
  }
});