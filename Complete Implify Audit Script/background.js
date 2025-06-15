// This background script listens for the shortcut and tells the content script to act.
console.log("BACKGROUND SCRIPT (v6 Final) loaded.");

chrome.commands.onCommand.addListener((command) => {
  if (command === "paste_and_search") {
    // When the shortcut is pressed, find the active tab...
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        // ...and send a message to the content script running on that tab.
        chrome.tabs.sendMessage(tabs[0].id, { type: 'pasteAndSearch' });
      }
    });
  }
});