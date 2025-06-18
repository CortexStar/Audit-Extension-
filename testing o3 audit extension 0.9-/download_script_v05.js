{ // ── Private scope to avoid leaking globals ──────────────────────────────

  console.log("Sequential Downloader Script v4.2 (with ready-check) running…");

  /* ─────────── Helper UI ─────────── */
  function showStatus(message, isError = false, duration = 4000) {
    let box = document.getElementById("simplify-downloader-status");
    if (!box) {
      box = document.createElement("div");
      box.id = "simplify-downloader-status";
      Object.assign(box.style, {
        position: "fixed", top: "20px", right: "20px",
        color: "#fff", padding: "15px", borderRadius: "8px",
        zIndex: 99999, fontSize: "16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
      });
      document.body.appendChild(box);
    }
    box.textContent = message;
    box.style.backgroundColor = isError ? "#dc3545" : "#28a745";
    box.style.display = "block";
    setTimeout(() => { box.style.display = "none"; }, duration);
  }

  /* ─────────── DOM helpers ─────────── */
  function waitForElement(selector, timeout = 5000) {
    return new Promise(resolve => {
      const start = Date.now();
      const t = setInterval(() => {
        const el = document.querySelector(selector);
        if (el) {
          clearInterval(t);
          resolve(el);
        } else if (Date.now() - start > timeout) {
          clearInterval(t);
          resolve(null);
        }
      }, 100);
    });
  }

  /** Polls until the PDF icon is no longer in “spinner / disabled” state. */
  async function waitUntilIconReady(icon, maxMs = 15000) {
    const start = Date.now();
    while (Date.now() - start < maxMs) {
      const stillSpinning =
        icon.querySelector("i.fa-spinner, i.fa-circle-notch, svg.animate-spin") ||
        icon.getAttribute("aria-disabled") === "true";
      if (!stillSpinning) return true;
      await new Promise(r => setTimeout(r, 200));
    }
    return false;           // Timed out
  }

  /* ─────────── Main workflow ─────────── */
  async function runDownloadSequence() {
    showStatus("Starting automated sequence…");

    // — Step 1: Assessment PDF —
    const assessmentIcon = await waitForElement("#pdfdownload-icon");
    if (assessmentIcon) {
      const ready = await waitUntilIconReady(assessmentIcon);
      if (!ready) {
        showStatus("Assessment icon never became ready; aborting.", true);
        return;
      }
      console.log("Assessment icon ready → clicking.");
      assessmentIcon.click();
    } else {
      showStatus("Error: Assessment icon not found.", true);
      return;
    }

    // — Step 2: Notes PDF —
    const actionsBtn = Array.from(document.querySelectorAll("button"))
      .find(btn => btn.textContent.trim().includes("Actions"));
    if (!actionsBtn) {
      showStatus("Error: 'Actions' dropdown not found.", true);
      return;
    }
    actionsBtn.click();

    const notesBtn = await waitForElement("#userNotes");
    if (!notesBtn) {
      showStatus("Error: 'Notes' button not found.", true);
      return;
    }
    notesBtn.click();

    const notesIcon = await waitForElement("#pdfdownload-icon-notes");
    if (!notesIcon) {
      showStatus("Error: Notes PDF icon not found.", true);
      return;
    }
    console.log("Notes icon found → clicking.");
    notesIcon.click();

    showStatus("All download commands issued!");
  }

  runDownloadSequence();

} // ── End private scope ───────────────────────────────────────────────────
