// Final structured extractor: book.pdf -> tmp_chapters/<name>.md
// Line-level classification using fonts, sizes, indent and y-position.
const fs = require("fs");
const path = require("path");

const RANGES = {
  frontMatter: [13, 28],
  chapter0: [29, 38],
  chapter1: [41, 66],
  chapter2: [67, 100],
  chapter3: [101, 132],
  chapter4: [135, 172],
  chapter5: [173, 198],
  chapter6: [199, 228],
  chapter7: [231, 258],
  chapter8: [259, 284],
  chapter9: [285, 310],
  chapter10: [311, 325],
};

const NOISE = [
  /^From Day Zero to Zero Day$/i,
  /^Page \d+$/i,
  /^\d{1,3}$/,
  /^www\.nostarch\.com/i,
  /^Chapter \d+:.*?\s+\d+$/i,
  /^\d+\s+\|?\s*$/,
];

const CAPTION_RE = /^(Figure|Table|Listing|NOTE|TIP|WARNING|NOTES?)\b/i;

async function main() {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = new Uint8Array(fs.readFileSync(path.join(__dirname, "..", "book.pdf")));
  const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;

  async function getPageLines(pageNum) {
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

    items.sort((a, b) => b.y - a.y || a.x - b.x);
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

  // Cache all pages in ranges
  const pageCache = {};
  const maxPage = Math.max(...Object.values(RANGES).map((r) => r[1]));
  for (let p = 1; p <= maxPage; p++) pageCache[p] = await getPageLines(p);

  // Per-page body font id (font resource names are per-page and can collide)
  const pageBodyId = {};
  for (const [p, lines] of Object.entries(pageCache)) {
    const counts = {};
    for (const l of lines) {
      if (l.size >= 95 && l.size <= 112 && !l.isMono) {
        counts[l.dominant] = (counts[l.dominant] || 0) + l.text.length;
      }
    }
    pageBodyId[p] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
  }

  const outDir = path.join(__dirname, "..", "tmp_chapters");
  fs.mkdirSync(outDir, { recursive: true });

  for (const [name, [start, end]] of Object.entries(RANGES)) {
    const all = [];
    for (let p = start; p <= end; p++) {
      for (const l of pageCache[p]) {
        if (l.y > 740 || l.y < 55) continue; // running header / footer
        if (NOISE.some((re) => re.test(l.text))) continue;
        if (/\d{1,3}\s*(Chapter|Part)\b/i.test(l.text)) continue; // footer remnants
        if (l.size > 400) continue; // giant chapter number
        all.push(l);
      }
    }

    const bodyLines = all.filter((l) => !l.isMono && l.size >= 95 && l.size <= 112);
    const colLeft = Math.min(...bodyLines.map((l) => l.x));

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

    for (let i = 0; i < all.length; i++) {
      const l = all[i];
      const next = all[i + 1];
      const pageBody = pageBodyId[l.page];

      // Chapter title (very large sans)
      if (l.size >= 150) {
        flushPara();
        flushQuote();
        closeCode();
        continue;
      }

      // Epigraph / quote (slightly smaller sans than body)
      if (l.size >= 86 && l.size < 95 && !l.isMono && !/\d/.test(l.text) && l.text.length < 200) {
        closeCode();
        flushPara();
        quote.push(l.text);
        continue;
      }

      // Chapter opening paragraphs (larger body style)
      if (l.size >= 110 && l.size < 150) {
        closeCode();
        flushQuote();
        para.push(l.text);
        continue;
      }

      // Code listing (predominantly monospace)
      if (l.isMono) {
        flushPara();
        flushQuote();
        if (!inCode) {
          out.push("```");
          inCode = true;
        }
        out.push(l.text);
        if (!next || !next.isMono) {
          out.push("```");
          out.push("");
          inCode = false;
        }
        continue;
      }
      closeCode();

      // Headings: bold font (different from this page's body font), short
      const isHeading =
        l.dominant !== pageBody &&
        l.size < 110 &&
        l.text.length < 80 &&
        l.text.includes(" ") &&
        !/[.,;:]$/.test(l.text) &&
        !CAPTION_RE.test(l.text) &&
        /^[A-Z"'(\u201C]/.test(l.text) &&
        l.text.replace(/[^\d.]/g, "").length / l.text.length < 0.3 &&
        !/https?:\/\/|www\./i.test(l.text);

      if (isHeading) {
        flushPara();
        flushQuote();
        out.push("### " + l.text);
        out.push("");
        continue;
      }

      // Captions / notes -> italic paragraph
      if (CAPTION_RE.test(l.text)) {
        flushPara();
        flushQuote();
        out.push("*" + l.text + "*");
        out.push("");
        continue;
      }

      // Body paragraph: indent marks new paragraph
      const indented = l.x > colLeft + 8;
      if (indented && para.length > 0) flushPara();
      para.push(l.text);
    }
    flushPara();
    flushQuote();
    closeCode();

    const md = out
      .join("\n")
      .replace(/(\w)-\s+(?=[a-z])/g, "$1")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    fs.writeFileSync(path.join(outDir, `${name}.md`), md, "utf8");
    console.log(`${name}: ${md.split(/\s+/).length} words`);
  }
  console.log("Done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
