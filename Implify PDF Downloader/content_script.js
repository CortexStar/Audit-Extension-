{ // Start of the private scope to prevent re-declaration errors
  
  console.log("Sequential Downloader Script v4.1 - Final running...");

  // A function to show status messages on the page
  function showStatus(message, isError = false, duration = 4000) {
    let statusDiv = document.getElementById('simplify-downloader-status');
    if (!statusDiv) {
      statusDiv = document.createElement('div');
      statusDiv.id = 'simplify-downloader-status';
      Object.assign(statusDiv.style, {
        position: 'fixed', top: '20px', right: '20px',
        color: 'white', padding: '15px', borderRadius: '8px',
        zIndex: '99999', fontSize: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
      });
      document.body.appendChild(statusDiv);
    }
    statusDiv.textContent = message;
    statusDiv.style.backgroundColor = isError ? '#dc3545' : '#28a745';
    statusDiv.style.display = 'block';
    setTimeout(() => { statusDiv.style.display = 'none'; }, duration);
  }

  // Patiently waits for an element to appear on the page
  function waitForElement(selector, timeout = 5000) {
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
      }, 100); // Check every 100ms
    });
  }

  // --- Main function to run the full sequence ---
  async function findAndClickSequence() {
    showStatus('Starting automated sequence...');

    // --- Part 1: Download Assessment PDF (Immediate Action) ---
    const assessmentIcon = await waitForElement('#pdfdownload-icon');
    if (assessmentIcon) {
      console.log("Found Assessment PDF icon. Clicking...");
      assessmentIcon.click();
    } else {
      showStatus('Error: Could not find Assessment PDF icon.', true);
    }

    // --- Part 2: The Notes PDF Workflow ---
    
    // Step A: Find and click the 'Actions' dropdown.
    // Since it has no ID, we find it by its text content.
    const allButtons = Array.from(document.querySelectorAll('button'));
    const actionsButton = allButtons.find(button => button.textContent.trim().includes('Actions'));
    
    if (!actionsButton) {
      showStatus("Error: Could not find the 'Actions' dropdown.", true);
      return;
    }
    console.log("Found 'Actions' dropdown. Clicking...");
    actionsButton.click();
    
    // Step B: Find and click the 'Notes' button in the dropdown using its unique ID.
    const notesButton = await waitForElement('#userNotes');

    if (!notesButton) {
      showStatus("Error: Could not find the 'Notes' button in the dropdown.", true);
      return;
    }
    console.log("Found 'Notes' button. Clicking to open sidebar...");
    notesButton.click();

    // Step C: Wait for and click the final PDF icon in the sidebar.
    const notesPdfIconInSidebar = await waitForElement('#pdfdownload-icon-notes');
    if (!notesPdfIconInSidebar) {
      showStatus('Error: Sidebar opened, but could not find Notes PDF icon.', true);
      return;
    }
    console.log("Found Notes PDF icon in sidebar. Clicking...");
    notesPdfIconInSidebar.click();
    
    showStatus('All download commands issued!', false);
  }

  // Run the main function
  findAndClickSequence();

} // End of the private scope