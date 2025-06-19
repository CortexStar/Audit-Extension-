// Background script for Implify Audit Extension
chrome.commands.onCommand.addListener((command) => {
  if (command === 'search-member') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      
      // Check if we're on a valid domain
      if (tab.url.includes('implify.groundgame.health') || tab.url.includes('implify.ai')) {
        // Check if we're on workspace page
        if (tab.url.includes('/workspace')) {
          chrome.tabs.sendMessage(tab.id, { action: 'searchMember' });
        } else {
          // Navigate to workspace first
          const baseUrl = tab.url.includes('implify.groundgame.health') 
            ? 'https://implify.groundgame.health/workspace'
            : 'https://implify.ai/workspace';
          
          chrome.tabs.update(tab.id, { url: baseUrl }, () => {
            // Wait for page load then trigger search
            setTimeout(() => {
              chrome.tabs.sendMessage(tab.id, { action: 'searchMember' });
            }, 2000);
          });
        }
      } else {
        console.log('Extension only works on Implify domains');
      }
    });
  }
});

// Listen for tab navigation to detect member pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Check if we're on a member page (not workspace)
    if ((tab.url.includes('implify.groundgame.health') || tab.url.includes('implify.ai')) 
        && !tab.url.includes('/workspace')) {
      
      // Wait for SPA to finish rendering then trigger download
      setTimeout(() => {
        chrome.tabs.sendMessage(tabId, { action: 'downloadDocuments' });
      }, 2500);
    }
  }
});