// Extracts figure images from book.pdf by rendering pages and recording
// drawImage calls, then cropping each figure into public/images/
const fs = require("fs");
const path = require("path");
const { createCanvas, Image } = require("@napi-rs/canvas");

const FIGURE_PAGES = {
  203: [], 204: ["6-1", "6-2"], 205: ["6-3"], 209: ["6-4"], 210: ["6-5"],
  212: ["6-6", "6-7"],
  240: ["7-1"], 242: ["7-2"],
  264: ["8-1"], 270: ["8-2"], 272: ["8-3"], 277: ["8-4"], 282: ["8-5"],
  305: ["9-1", "9-2"], 306: ["9-3"],
};

const SCALE = 2;

async function main() {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = new Uint8Array(fs.readFileSync(path.join(__dirname, "..", "book.pdf")));
  const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;

  const outDir = path.join(__dirname, "..", "public", "images");
  fs.mkdirSync(outDir, { recursive: true });

  const report = [];

  for (const [pageStr, figIds] of Object.entries(FIGURE_PAGES)) {
    if (!figIds.length) continue;
    const pageNum = Number(pageStr);
    const page = await doc.getPage(pageNum);
    const viewport = page.getViewport({ scale: SCALE });

    const canvas = createCanvas(viewport.width, viewport.height);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, viewport.width, viewport.height);

    // Record drawImage calls to locate figure bitmaps
    const rects = [];
    const origDrawImage = ctx.drawImage.bind(ctx);
    ctx.drawImage = function (...args) {
      try {
        const img = args[0];
        let dx = 0, dy = 0, dw = img.width || 1, dh = img.height || 1;
        if (args.length >= 9) {
          dx = args[5]; dy = args[6]; dw = args[7]; dh = args[8];
        } else if (args.length >= 5) {
          dx = args[1]; dy = args[2]; dw = args[3]; dh = args[4];
        } else if (args.length >= 3) {
          dx = args[1]; dy = args[2];
        }
        // Map dest coords through the current transform (CTM)
        const t = ctx.getTransform ? ctx.getTransform() : { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
        const pts = [
          [dx, dy], [dx + dw, dy], [dx, dy + dh], [dx + dw, dy + dh],
        ].map(([x, y]) => [t.a * x + t.c * y + t.e, t.b * x + t.d * y + t.f]);
        const xs = pts.map((p) => p[0]);
        const ys = pts.map((p) => p[1]);
        const rx = Math.min(...xs), ry = Math.min(...ys);
        const rw = Math.max(...xs) - rx, rh = Math.max(...ys) - ry;
        rects.push({ x: rx, y: ry, w: rw, h: rh });
      } catch (e) {}
      return origDrawImage(...args);
    };

    await page.render({ canvasContext: ctx, viewport, intent: "print" }).promise;

    // Merge overlapping rects and filter out tiny ones
    const big = rects
      .filter((r) => r.w > 60 * SCALE && r.h > 60 * SCALE)
      .map((r) => ({
        x: r.x, y: r.y, w: r.w, h: r.h,
        x2: r.x + r.w, y2: r.y + r.h,
      }));
    big.sort((a, b) => a.y - b.y);
    const merged = [];
    for (const r of big) {
      const last = merged[merged.length - 1];
      if (last && r.x < last.x2 && r.x2 > last.x && r.y < last.y2 && r.y2 > last.y) {
        last.x = Math.min(last.x, r.x);
        last.y = Math.min(last.y, r.y);
        last.x2 = Math.max(last.x2, r.x2);
        last.y2 = Math.max(last.y2, r.y2);
        last.w = last.x2 - last.x;
        last.h = last.y2 - last.y;
      } else {
        merged.push({ ...r });
      }
    }

    report.push({ page: pageNum, drawImageCalls: rects.length, bigRects: merged.length });
    console.log(`page ${pageNum}: ${rects.length} drawImage calls -> ${merged.length} figure regions, expected ${figIds.length}`);

    if (merged.length >= figIds.length) {
      // Take the largest regions (skip full-page background)
      const usable = merged.filter((r) => r.w < viewport.width * 0.99 || r.h < viewport.height * 0.99);
      usable.sort((a, b) => a.y - b.y);
      const picked = usable.slice(0, figIds.length).sort((a, b) => a.y - b.y);
      figIds.forEach((figId, i) => {
        const r = picked[i];
        if (!r) return;
        const pad = 2;
        const cw = createCanvas(Math.round(r.w + pad * 2), Math.round(r.h + pad * 2));
        const cctx = cw.getContext("2d");
        cctx.fillStyle = "#ffffff";
        cctx.fillRect(0, 0, cw.width, cw.height);
        cctx.drawImage(canvas, Math.round(r.x - pad), Math.round(r.y - pad), Math.round(r.w + pad * 2), Math.round(r.h + pad * 2), 0, 0, cw.width, cw.height);
        const outFile = path.join(outDir, `fig-${figId}.png`);
        fs.writeFileSync(outFile, cw.toBuffer("image/png"));
        console.log(`   saved fig-${figId}.png (${Math.round(r.w)}x${Math.round(r.h)})`);
      });
    } else {
      console.log(`   MISMATCH: expected ${figIds.length} figures, found ${merged.length}`);
    }
  }
  console.log("Done");
}

main().catch((e) => { console.error(e); process.exit(1); });
