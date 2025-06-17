// Worker Script 1: Search and Click
console.log("Search/Click Script Injected.");

(async () => {
  function waitForElement(selector, timeout = 7000) {
    return new Promise(resolve => {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const element = document.querySelector(selector);
        if (element) {
          clearInterval(interval);
          resolve(element);
        } else if (Date.now() - startTime > timeout) {
          clearInterval(interval);
          resolve(null);
        }
      }, 150);
    });
  }

  // 1. Paste and search
  const searchInput = await waitForElement('#search-options, #search-options-large');
  if (!searchInput) return;
  const searchButton = searchInput.parentElement.querySelector('button[type="submit"]');
  searchInput.value = await navigator.clipboard.readText();
  searchInput.dispatchEvent(new Event('input', { bubbles: true }));
  if (searchButton) searchButton.click();
  
  // 2. Wait for and click the result
  const searchResultLink = await waitForElement('div.link-primary.cursor-pointer');
  if (searchResultLink) {
    const text = searchResultLink.textContent.trim();
    if (text.includes('-') || !isNaN(parseInt(text))) {
      console.log("Search result found. Clicking to navigate...");
      searchResultLink.click();
    }
  }
})();