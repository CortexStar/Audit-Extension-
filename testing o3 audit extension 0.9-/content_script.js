// Worker Script 1: Search and Click (v0.7, untouched)
console.log("Search/Click Script Injected.");

(async () => {
  function waitForElement(selector, timeout = 7000) {
    return new Promise((resolve) => {
      const start = Date.now();
      const timer = setInterval(() => {
        const el = document.querySelector(selector);
        if (el) {
          clearInterval(timer);
          resolve(el);
        } else if (Date.now() - start > timeout) {
          clearInterval(timer);
          resolve(null);
        }
      }, 150);
    });
  }

  // 1 · populate search box from clipboard and trigger search
  const searchInput = await waitForElement("#search-options, #search-options-large");
  if (!searchInput) return;
  const searchBtn = searchInput.parentElement.querySelector('button[type="submit"]');
  searchInput.value = await navigator.clipboard.readText();
  searchInput.dispatchEvent(new Event("input", { bubbles: true }));
  if (searchBtn) searchBtn.click();

  // 2 · wait for first result and click it
  const link = await waitForElement("div.link-primary.cursor-pointer");
  if (link) {
    const txt = link.textContent.trim();
    if (txt.includes("-") || !isNaN(parseInt(txt))) {
      console.log("Search result found. Clicking …");
      link.click();
    }
  }
})();
