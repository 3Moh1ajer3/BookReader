// Config-driven PDF extractor: book.pdf -> tmp_books/<id>/*.md (+ figure images).
// Generic rewrite of the legacy scripts/extractStructured.js + extractFigures.js.
//
// Usage:
//   node scripts/pipeline/extractPdf.js --book <id>              # extract text
//   node scripts/pipeline/extractPdf.js --book <id> --figures    # also extract figure images
//   node scripts/pipeline/extractPdf.js --book <id> --analyze P1 P2   # font-size stats for pages (calibration)
const fs = require("fs");
const path = require("path");
const { ROOT, readConfig, getBook, ensureDir } = require("./lib/common");

async function loadPdf(pdfPath) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = new Uint8Array(fs.readFileSync(path.join(ROOT, pdfPath)));
  return pdfjs.getDocument({ data, useSystemFonts: true }).promise;
}

async function getPageLines(doc, pageNum) {
  const page = await doc.getPage(pageNum);
  const content = await page.getTextContent();
  const items = content.items
    .filter((it) => it.str && it.str.trim())
    .map((it) => ({
      str: it.str,
      x: it.transform[4],
      y: it.transform[5],
      w: it.width || 0,
      size: Math.hypot(it.transform[0], it.transform[1]) * 10,
      font: it.fontName,
      mono: (content.styles[it.fontName] || {}).fontFamily === "monospace",
    }));

  items.sort((a, b) => b.y - a.y || a.x - a.x);
  const lines = [];
  for (const it of items) {
    const last = lines[lines.length - 1];
    if (last && Math.abs(last.y - it.y) < 3) last.items.push(it);
    else lines.push({ y: it.y, items: [it] });
  }

  return lines
    .map((line) => {
      line.items.sort((a, b) => a.x - b.x);
      let text = "";
      let prev = null;
      for (const it of line.items) {
        if (prev) {
          const gap = it.x - (prev.x + prev.w);
          const fontChanged = it.font !== prev.font;
          const addSpace =
            (gap > it.size * 0.2 || fontChanged) &&
            !/\s$/.test(text) &&
            !/^\s/.test(it.str) &&
            !/[-\u2010\u2011]$/.test(text) &&
            !/^[.,;:)\]}!?]/.test(it.str) &&
            !/[(\[{]$/.test(text);
          if (addSpace) text += " ";
        }
        text += it.str;
        prev = it;
      }
      text = text.replace(/\s+/g, " ").trim();
      const real = line.items.filter((it) => it.str.trim());
      return {
        page: pageNum,
        text,
        x: real[0].x,
        y: line.y,
        size: Math.max(...real.map((i) => i.size)),
        dominant: real.sort((a, b) => b.str.length - a.str.length)[0].font,
        monoChars: real.filter((i) => i.mono).reduce((s, i) => s + i.str.length, 0),
        totalChars: real.reduce((s, i) => s + i.str.length, 0),
      };
    })
    .filter((l) => l.text.length > 0)
    .map((l) => ({ ...l, isMono: l.monoChars / l.totalChars > 0.8 }));
}

async function analyze(doc, pages) {
  const stats = {};
  for (const p of pages) {
    const lines = await getPageLines(doc, p);
    for (const l of lines) {
      const bucket = Math.round(l.size);
      if (!stats[bucket]) stats[bucket] = { count: 0, samples: [] };
      stats[bucket].count++;
      if (stats[bucket].samples.length < 3) stats[bucket].samples.push(`p${p}: ${l.text.slice(0, 70)}`);
    }
  }
  console.log("font-size | lines | samples");
  console.log("-".repeat(72));
  for (const [size, s] of Object.entries(stats).sort((a, b) => b[0] - a[0])) {
    console.log(`${size.padStart(9)} | ${String(s.count).padStart(5)} | ${s.samples[0]}`);
    s.samples.slice(1).forEach((x) => console.log(`${" ".repeat(12)}| ${x}`));
  }
  console.log("\nPick bodyFontSize / quoteFontSize / titleFontSize / yBounds from this table + books.config.json");
}

async function extractText(book) {
  const src = book.source;
  const noise = (src.noisePatterns || []).map((p) => new RegExp(p, "i"));
  const [yMin, yMax] = src.yBounds || [55, 740];
  const [bodyMin, bodyMax] = src.bodyFontSize || [95, 112];
  const [qMin, qMax] = src.quoteFontSize || [86, 95];
  const titleSize = src.titleFontSize || 150;

  const doc = await loadPdf(book.pdfPath);
  const maxPage = Math.max(...src.chapters.map((c) => c.pages[1]));
  const pageCache = {};
  for (let p = 1; p <= maxPage; p++) pageCache[p] = await getPageLines(doc, p);

  const outDir = path.join(ROOT, book.output.tmpDir || path.join("tmp_books", book.id));
  ensureDir(outDir);

  for (const ch of src.chapters) {
    const [start, end] = ch.pages;
    const all = [];
    for (let p = start; p <= end; p++) {
      for (const l of pageCache[p]) {
        if (l.y > yMax || l.y < yMin) continue; // running header / footer
        if (noise.some((re) => re.test(l.text))) continue;
        if (/\d{1,3}\s*(Chapter|Part)\b/i.test(l.text)) continue;
        if (l.size > titleSize) continue; // giant decorative chapter number
        all.push(l);
      }
    }

    const bodyLines = all.filter((l) => !l.isMono && l.size >= bodyMin && l.size <= bodyMax);
    const colLeft = bodyLines.length ? Math.min(...bodyLines.map((l) => l.x)) : 0;

    const out = [];
    let para = [];
    let quote = [];
    let inCode = false;

    const flushPara = () => {
      if (para.length) {
        out.push(para.join(" ").replace(/\s+/g, " ").trim());
        out.push("");
        para = [];
      }
    };
    const flushQuote = () => {
      if (quote.length) {
        out.push("> " + quote.join(" ").replace(/\s+/g, " ").trim());
        out.push("");
        quote = [];
      }
    };
    const closeCode = () => {
      if (inCode) {
        out.push("```");
        out.push("");
        inCode = false;
      }
    };

    for (const l of all) {
      // Very large sans = chapter/section decorative title -> skip (titles come from config)
      if (l.size >= titleSize) { flushPara(); flushQuote(); closeCode(); continue; }

      // Epigraph / quote
      if (l.size >= qMin && l.size < qMax && !l.isMono && !/\d/.test(l.text) && l.text.length < 200) {
        closeCode(); flushPara(); quote.push(l.text); continue;
      }

      // Code / mono block
      if (l.isMono) {
        flushPara(); flushQuote();
        if (!inCode) { out.push("```"); out.push(""); inCode = true; }
        out.push(l.text);
        continue;
      }
      if (inCode) { out.push("```"); out.push(""); inCode = false; }

      // Bulleted list (hanging indent far right of column edge)
      if (l.x > colLeft + 30 && /^[•·\-–]/.test(l.text)) {
        flushPara();
        out.push("* " + l.text.replace(/^[•·\-–]\s*/, ""));
        out.push("");
        continue;
      }

      // Table rows
      if (/\t|\s{2,}\|\s{2,}|^\|/.test(l.text) && /(\||\t)/.test(l.text)) {
        flushPara();
        out.push("| " + l.text.split(/\s*\|\s*|\t+/).filter(Boolean).join(" | ") + " |");
        out.push("");
        continue;
      }

      // Indented continuation of a list item
      if (l.x > colLeft + 30 && out.length && /^\* /.test(out[out.length - 2] || "")) {
        out[out.length - 2] += " " + l.text;
        continue;
      }

      flushQuote();
      para.push(l.text);
      // Paragraph break: short last line or clearly indented new first line
      const words = l.text.split(/\s+/).length;
      if (words < 8 || l.x > colLeft + 30) { flushPara(); }
    }
    flushPara(); flushQuote(); closeCode();

    let md = out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
    fs.writeFileSync(path.join(outDir, `${ch.file}.md`), md, "utf8");
    console.log(`${ch.file}: ${md.split(/\s+/).length} words <- pages ${start}-${end}`);
  }
  console.log(`\nMarkdown written to ${path.relative(ROOT, outDir)}\nNext: review the .md files, then run: npm run book:build -- --book ${book.id}`);
}

async function extractFigures(book) {
  const figCfg = book.source.figures;
  if (!figCfg || !Object.keys(figCfg).length) {
    console.log("No 'figures' config for this book — skipping.");
    return;
  }
  const { createCanvas } = require("@napi-rs/canvas");
  const SCALE = 2;
  const doc = await loadPdf(book.pdfPath);
  const outDir = path.join(ROOT, "public", "images");
  ensureDir(outDir);

  for (const [pageStr, figIds] of Object.entries(figCfg)) {
    if (!figIds.length) continue;
    const pageNum = Number(pageStr);
    const page = await doc.getPage(pageNum);
    const viewport = page.getViewport({ scale: SCALE });

    const canvas = createCanvas(viewport.width, viewport.height);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, viewport.width, viewport.height);

    const rects = [];
    const origDrawImage = ctx.drawImage.bind(ctx);
    ctx.drawImage = function (...args) {
      try {
        const img = args[0];
        let dx = 0, dy = 0, dw = img.width || 1, dh = img.height || 1;
        if (args.length >= 9) { dx = args[5]; dy = args[6]; dw = args[7]; dh = args[8]; }
        else if (args.length >= 5) { dx = args[1]; dy = args[2]; dw = args[3]; dh = args[4]; }
        else if (args.length >= 3) { dx = args[1]; dy = args[2]; }
        const t = ctx.getTransform ? ctx.getTransform() : { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
        const pts = [[dx, dy], [dx + dw, dy], [dx, dy + dh], [dx + dw, dy + dh]]
          .map(([x, y]) => [t.a * x + t.c * y + t.e, t.b * x + t.d * y + t.f]);
        const xs = pts.map((p) => p[0]);
        const ys = pts.map((p) => p[1]);
        const rx = Math.min(...xs), ry = Math.min(...ys);
        rects.push({ x: rx, y: ry, w: Math.max(...xs) - rx, h: Math.max(...ys) - ry });
      } catch (e) {}
      return origDrawImage(...args);
    };

    await page.render({ canvasContext: ctx, viewport, intent: "print" }).promise;

    const big = rects
      .filter((r) => r.w > 60 * SCALE && r.h > 60 * SCALE)
      .map((r) => ({ ...r, x2: r.x + r.w, y2: r.y + r.h }));
    big.sort((a, b) => a.y - b.y);
    const merged = [];
    for (const r of big) {
      const last = merged[merged.length - 1];
      if (last && r.x < last.x2 && r.x2 > last.x && r.y < last.y2 && r.y2 > last.y) {
        last.x = Math.min(last.x, r.x); last.y = Math.min(last.y, r.y);
        last.x2 = Math.max(last.x2, r.x2); last.y2 = Math.max(last.y2, r.y2);
        last.w = last.x2 - last.x; last.h = last.y2 - last.y;
      } else merged.push({ ...r });
    }

    console.log(`page ${pageNum}: ${rects.length} drawImage calls -> ${merged.length} regions, expected ${figIds.length}`);
    if (merged.length >= figIds.length) {
      const usable = merged.filter((r) => r.w < viewport.width * 0.99 || r.h < viewport.height * 0.99);
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
        fs.writeFileSync(path.join(outDir, `fig-${figId}.png`), cw.toBuffer("image/png"));
        console.log(`   saved fig-${figId}.png (${Math.round(r.w)}x${Math.round(r.h)})`);
      });
    } else {
      console.log(`   MISMATCH: expected ${figIds.length}, found ${merged.length} — adjust figure pages in books.config.json`);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const get = (flag) => { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : null; };
  const bookId = get("--book");
  if (!bookId) { console.error("Usage: node scripts/pipeline/extractPdf.js --book <id> [--figures] [--analyze P1 P2 ...]"); process.exit(1); }

  const book = getBook(readConfig(), bookId);
  const doc = await loadPdf(book.pdfPath);

  const ai = args.indexOf("--analyze");
  if (ai >= 0) {
    const pages = args.slice(ai + 1).map(Number).filter(Boolean);
    await analyze(doc, pages.length ? pages : [1, 5, 10]);
    return;
  }

  await extractText(book);
  if (args.includes("--figures")) await extractFigures(book);
}

main().catch((e) => { console.error(e); process.exit(1); });
