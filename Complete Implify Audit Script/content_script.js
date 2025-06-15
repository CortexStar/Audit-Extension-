// Final Version: Handles both domains and consecutive searches.
console.log("Simplify Orchestrator Script v7 Loaded...");

// --- LISTENER FOR THE PASTE-AND-SEARCH COMMAND ---
chrome.runtime.onMessage.addListener(async (message) => {
  if (message.type === 'pasteAndSearch') {
    console.log("Paste and Search command received.");
    
    // This selector finds the input field on EITHER domain.
    const searchInput = document.querySelector('#search-options, #search-options-large');
    
    // The submit button seems to be consistent.
    const searchButton = searchInput ? searchInput.parentElement.querySelector('button[type="submit"]') : null;

    if (searchInput && searchButton) {
      try {
        // Reset the click-prevention flag every time a new search is initiated.
        hasClickedThisSearchResult = false;
        
        const clipboardText = await navigator.clipboard.readText();
        console.log(`Pasting "${clipboardText}" into search bar.`);
        
        searchInput.value = clipboardText;
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        searchButton.click();
      } catch (err) {
        console.error('Failed to read clipboard or execute search:', err);
        alert('Could not read from clipboard. Please ensure you have granted the permission.');
      }
    } else {
      console.error("Could not find the search input or submit button on this page.");
    }
  }
});


// --- THE AUTO-CLICK OBSERVER ---
// This part watches for the result of the search we just started.
let hasClickedThisSearchResult = false;

const observer = new MutationObserver(() => {
  if (hasClickedThisSearchResult) return;

  if (document.getElementById('fullNameid')) {
    // We are on a member page, so reset the flag for the next search.
    hasClickedThisSearchResult = false;
    return;
  }

  const searchResultLink = document.querySelector('div.link-primary.cursor-pointer');
  if (searchResultLink) {
    const text = searchResultLink.textContent.trim();
    if (text.includes('-') || !isNaN(parseInt(text))) {
      console.log("Search result found! Clicking automatically.", searchResultLink);
      hasClickedThisSearchResult = true;
      searchResultLink.click();
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });