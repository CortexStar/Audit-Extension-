// Popup script for Implify Audit Extension

document.addEventListener('DOMContentLoaded', () => {
  const statusDiv = document.getElementById('status');
  const statusText = document.getElementById('status-text');
  const searchBtn = document.getElementById('search-btn');
  const downloadBtn = document.getElementById('download-btn');

  // Check current tab and update UI
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    const url = tab.url;
    
    if (url.includes('implify.groundgame.health') || url.includes('implify.ai')) {
      statusDiv.className = 'status active';
      
      if (url.includes('/workspace')) {
        statusText.textContent = '✓ Ready to search on workspace page';
        searchBtn.disabled = false;
      } else {
        statusText.textContent = '✓ Ready to download on member page';
        downloadBtn.disabled = false;
      }
    } else {
      statusDiv.className = 'status inactive';
      statusText.textContent = '✗ Navigate to Implify platform first';
    }
  });

  // Search button click handler
  searchBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'searchMember' });
      window.close();
    });
  });

  // Download button click handler
  downloadBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'downloadDocuments' });
      window.close();
    });
  });
});