// Extracts per-page text from book.pdf into temp JSON for comparison
const fs = require("fs");
const path = require("path");

async function main() {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = new Uint8Array(fs.readFileSync(path.join(__dirname, "..", "book.pdf")));
  const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;

  console.log(`Pages: ${doc.numPages}`);
  const pages = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    // Reconstruct lines using transform Y positions
    let lastY = null;
    let text = "";
    for (const item of content.items) {
      if (!item.str) continue;
      const y = item.transform[5];
      if (lastY !== null && Math.abs(y - lastY) > 2) text += "\n";
      else if (text && !text.endsWith(" ") && !text.endsWith("\n")) text += " ";
      text += item.str;
      lastY = y;
    }
    pages.push(text);
    if (i % 50 === 0) console.log(`  page ${i}...`);
  }

  fs.writeFileSync(
    path.join(__dirname, "..", "tmp_pdf_pages.json"),
    JSON.stringify(pages, null, 0),
    "utf8"
  );
  console.log("Done -> tmp_pdf_pages.json");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
