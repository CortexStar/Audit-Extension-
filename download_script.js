// Worker Script 2: Click Downloads
console.log("Download Script Injected.");

(async () => {
  function waitForElement(selector, timeout = 8000) {
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

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  console.log("--- Starting PDF download sequence ---");
  
  // Trigger Assessment Download
  const assessmentIcon = await waitForElement('#pdfdownload-icon');
  if (assessmentIcon) {
    console.log("Clicking Assessment PDF Icon.");
    assessmentIcon.click();
  }

  await sleep(500); // Pause to let the first action settle

  // Trigger Notes Download
  const allButtons = Array.from(document.querySelectorAll('button'));
  const actionsButton = allButtons.find(button => button.textContent.trim().includes('Actions'));
  if (actionsButton) {
    actionsButton.click();
    await sleep(200);
    const notesButton = await waitForElement('#userNotes');
    if (notesButton) {
      notesButton.click();
      await sleep(500);
      const notesPdfIconInSidebar = await waitForElement('#pdfdownload-icon-notes');
      if (notesPdfIconInSidebar) {
        notesPdfIconInSidebar.click();
        console.log("Final download click issued.");
      }
    }
  }
})();