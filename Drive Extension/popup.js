document.getElementById("run").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    world: "ISOLATED",
    files: ["jspdf.umd.min.js"]
  });

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    world: "ISOLATED",
    func: generatePdf
  });
});

function generatePdf() {
  if (!window.jspdf || typeof window.jspdf.jsPDF !== "function") {
    console.error("jsPDF UMD not loaded correctly", window.jspdf);
    alert("jsPDF failed to load — wrong build file");
    return;
  }

  const pdf = new window.jspdf.jsPDF();

  for (const img of document.images) {
    if (!img.src?.startsWith("blob:")) continue;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    const imgData = canvas.toDataURL("image/jpeg", 1.0);

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = (canvas.height * pageWidth) / canvas.width;

    pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, pageHeight);
    pdf.addPage();
  }

  if (pdf.getNumberOfPages() > 1) {
    pdf.deletePage(pdf.getNumberOfPages());
  }

  pdf.save("download.pdf");
}
