// Scans pages of chapters 5-10 for raster images and figure captions
const fs = require("fs");
(async () => {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = new Uint8Array(fs.readFileSync("book.pdf"));
  const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;

  const RANGES = {
    5: [173, 198],
    6: [199, 228],
    7: [231, 258],
    8: [259, 284],
    9: [285, 310],
    10: [311, 325],
  };

  for (const [ch, [start, end]] of Object.entries(RANGES)) {
    let found = [];
    for (let p = start; p <= end; p++) {
      const page = await doc.getPage(p);
      const ops = await page.getOperatorList();
      const imgOps = [pdfjs.OPS.paintImageXObject, pdfjs.OPS.paintImageXObjectRepeat, pdfjs.OPS.paintInlineImageXObject, pdfjs.OPS.paintJpegXObject];
      let imgCount = 0;
      for (const fn of imgOps) {
        for (let i = 0; i < ops.fnArray.length; i++) {
          if (ops.fnArray[i] === fn) imgCount++;
        }
      }
      const content = await page.getTextContent();
      const captions = content.items
        .map((i) => i.str)
        .filter((s) => /Figure \d+-\d+/.test(s));
      if (imgCount > 0 || captions.length) {
        found.push(`p${p}: imgs=${imgCount} captions=[${captions.join(" , ").slice(0, 80)}]`);
      }
    }
    console.log(`Chapter ${ch}: ${found.length} pages with imgs/captions`);
    found.forEach((f) => console.log("  " + f));
  }
})().catch((e) => { console.error(e); process.exit(1); });
