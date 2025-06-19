// Content script for Implify Audit Extension

class ImplifyAuditExtension {
  constructor() {
    this.isSearching = false;
    this.isDownloading = false;
  }

  // Utility function to wait for element
  async waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkElement = () => {
        const element = document.querySelector(selector);
        if (element) {
          resolve(element);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        } else {
          setTimeout(checkElement, 100);
        }
      };
      
      checkElement();
    });
  }

  // Utility function to wait for icon readiness
  async waitForIconReady(iconElement, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkReady = () => {
        // Check if icon is NOT loading and NOT disabled
        const hasSpinner = iconElement.querySelector('i.fa-spinner, i.fa-circle-notch, svg.animate-spin');
        const isDisabled = iconElement.getAttribute('aria-disabled') === 'true';
        
        if (!hasSpinner && !isDisabled) {
          resolve(true);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Icon did not become ready within timeout'));
        } else {
          setTimeout(checkReady, 100);
        }
      };
      
      checkReady();
    });
  }

  // Check if text looks like an ID (contains "-" or is a number)
  isValidMemberId(text) {
    if (!text) return false;
    text = text.trim();
    return text.includes('-') || !isNaN(text);
  }

  // Search for member using clipboard content
  async searchMember() {
    if (this.isSearching) {
      console.log('Search already in progress');
      return;
    }

    this.isSearching = true;
    console.log('Starting member search...');

    try {
      // Read clipboard
      const clipboardText = await navigator.clipboard.readText();
      console.log('Clipboard content:', clipboardText);

      if (!clipboardText.trim()) {
        throw new Error('Clipboard is empty');
      }

      // Find search input
      const searchInput = document.querySelector('#search-options, #search-options-large');
      if (!searchInput) {
        throw new Error('Search input not found');
      }

      // Clear any existing results first
      const existingResults = document.querySelectorAll('div.link-primary.cursor-pointer');
      console.log(`Clearing ${existingResults.length} existing results`);

      // Clear and set value with more thorough clearing
      searchInput.value = '';
      searchInput.focus();
      
      // Wait a moment for clearing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      searchInput.value = clipboardText.trim();
      console.log('Set search input to:', searchInput.value);

      // Dispatch multiple events to ensure SPA recognizes the change
      const inputEvent = new Event('input', { bubbles: true });
      const changeEvent = new Event('change', { bubbles: true });
      searchInput.dispatchEvent(inputEvent);
      searchInput.dispatchEvent(changeEvent);

      // Wait a moment before submitting
      await new Promise(resolve => setTimeout(resolve, 200));

      // Find and click submit button
      const submitButton = searchInput.parentElement.querySelector('button[type="submit"]');
      if (!submitButton) {
        throw new Error('Submit button not found');
      }

      submitButton.click();
      console.log('Search submitted for:', clipboardText.trim());

      // Wait for results and click appropriate result
      await this.clickSearchResult(clipboardText.trim());

    } catch (error) {
      console.error('Search failed:', error);
      alert(`Search failed: ${error.message}`);
    } finally {
      this.isSearching = false;
    }
  }

  // Click on the search result that looks like an ID
  async clickSearchResult(expectedId) {
    try {
      console.log('Waiting for NEW search results for ID:', expectedId);
      
      // Wait a bit longer for new results to load
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Wait for search results to appear and be different from before
      let attempts = 0;
      let results = [];
      
      while (attempts < 20) { // 20 attempts = 2 seconds
        results = document.querySelectorAll('div.link-primary.cursor-pointer');
        
        if (results.length > 0) {
          // Check if any result matches our expected ID
          const matchingResult = Array.from(results).find(result => {
            const text = result.textContent.trim();
            return text === expectedId || (this.isValidMemberId(text) && text.includes(expectedId));
          });
          
          if (matchingResult) {
            console.log('Found matching result for expected ID:', expectedId);
            break;
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      console.log(`Found ${results.length} search results after waiting`);

      // Look for exact match first
      for (const result of results) {
        const text = result.textContent.trim();
        console.log('Checking result text:', text);
        
        if (text === expectedId) {
          console.log('Found EXACT match, clicking on result:', text);
          result.click();
          return;
        }
      }

      // If no exact match, look for partial match or valid ID
      for (const result of results) {
        const text = result.textContent.trim();
        
        if (this.isValidMemberId(text) && (text.includes(expectedId) || expectedId.includes(text))) {
          console.log('Found PARTIAL match, clicking on result:', text);
          result.click();
          return;
        }
      }

      // Last resort - any valid ID
      for (const result of results) {
        const text = result.textContent.trim();
        
        if (this.isValidMemberId(text)) {
          console.log('Found valid ID (last resort), clicking on result:', text);
          result.click();
          return;
        }
      }

      throw new Error(`No matching result found for ID: ${expectedId}`);
    } catch (error) {
      console.error('Failed to click search result:', error);
      throw error;
    }
  }

  // Download assessment PDF
  async downloadAssessmentPdf() {
    try {
      console.log('Downloading assessment PDF...');
      
      const pdfIcon = await this.waitForElement('#pdfdownload-icon', 10000);
      await this.waitForIconReady(pdfIcon);
      
      pdfIcon.click();
      console.log('Assessment PDF download triggered');
      
    } catch (error) {
      console.error('Failed to download assessment PDF:', error);
      throw error;
    }
  }

  // Download notes PDF
  async downloadNotesPdf() {
    try {
      console.log('Downloading notes PDF...');
      
      // First, try to find the userNotes button directly (it might be visible on page)
      let userNotesButton = document.querySelector('#userNotes');
      
      if (!userNotesButton) {
        console.log('userNotes button not visible, looking for Actions dropdown...');
        
        // Find and click Actions button to reveal dropdown
        const actionsButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
          btn.textContent.includes('Actions')
        );
        
        if (actionsButtons.length === 0) {
          throw new Error('Actions button not found');
        }
        
        actionsButtons[0].click();
        console.log('Actions dropdown opened');
        
        // Wait for userNotes button to appear in dropdown
        userNotesButton = await this.waitForElement('#userNotes', 5000);
      }
      
      console.log('Found userNotes button, clicking...');
      userNotesButton.click();
      console.log('User notes button clicked - side panel should be opening');
      
      // Wait longer for the side panel to fully load and render
      console.log('Waiting for side panel to load...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Wait for and click notes PDF download icon
      const notesPdfIcon = await this.waitForElement('#pdfdownload-icon-notes', 15000);
      console.log('Notes PDF icon found, checking if ready...');
      await this.waitForIconReady(notesPdfIcon);
      
      notesPdfIcon.click();
      console.log('Notes PDF download triggered');
      
    } catch (error) {
      console.error('Failed to download notes PDF:', error);
      throw error;
    }
  }

  // Download both documents
  async downloadDocuments() {
    if (this.isDownloading) {
      console.log('Download already in progress');
      return;
    }

    this.isDownloading = true;
    console.log('Starting document downloads...');

    try {
      // Download assessment PDF first
      await this.downloadAssessmentPdf();
      
      // Wait a bit between downloads
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Download notes PDF
      await this.downloadNotesPdf();
      
      console.log('All documents downloaded successfully');
      
    } catch (error) {
      console.error('Document download failed:', error);
      alert(`Document download failed: ${error.message}`);
    } finally {
      this.isDownloading = false;
    }
  }
}

// Initialize extension
const extension = new ImplifyAuditExtension();

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'searchMember') {
    extension.searchMember();
  } else if (request.action === 'downloadDocuments') {
    extension.downloadDocuments();
  }
});

// Log when content script loads
console.log('Implify Audit Extension content script loaded');