// Extracts structured chapter markdown from book.pdf using font identification.
// Font ids are classified globally (body / bold-heading / italic / link / mono),
// then lines are classified and merged into markdown.
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
  /^Chapter \d+$/i,
];

async function getPageLines(doc, pageNum) {
  const page = await doc.getPage(pageNum);
  const content = await page.getTextContent();
  const styles = content.styles;

  const items = content.items
    .filter((it) => it.str && it.str.length > 0)
    .map((it) => ({
      str: it.str,
      x: it.transform[4],
      y: it.transform[5],
      w: it.width || it.str.length * 5,
      size: Math.hypot(it.transform[0], it.transform[1]) * 10,
      font: it.fontName,
      id: it.fontName + "@" + Math.round(Math.hypot(it.transform[0], it.transform[1]) * 10),
    }))
    .filter((it) => it.str.trim().length > 0 || it.str === " ");

  // group into lines
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
      // join items using actual widths
      let text = "";
      let prev = null;
      for (const it of line.items) {
        if (prev) {
          const gap = it.x - (prev.x + prev.w);
          if (gap > it.size * 0.25 && !/\s$/.test(text) && !/^\s/.test(it.str)) text += " ";
        }
        text += it.str;
        prev = it;
      }
      text = text.replace(/\s+/g, " ").trim();
      const real = line.items.filter((it) => it.str.trim());
      const byFont = {};
      for (const it of real) byFont[it.font] = (byFont[it.font] || 0) + it.str.length;
      const dominant = Object.entries(byFont).sort((a, b) => b[1] - a[1])[0][0];
      return {
        text,
        x: real[0].x,
        y: line.y,
        size: Math.max(...real.map((i) => i.size)),
        dominant,
        fonts: Object.keys(byFont),
        fullFont: Object.keys(byFont).length === 1 ? Object.keys(byFont)[0] : null,
      };
    })
    .filter((l) => l.text.length > 0);
}

async function main() {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = new Uint8Array(fs.readFileSync(path.join(__dirname, "..", "book.pdf")));
  const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;

  const allPages = {};
  for (let p = 1; p <= doc.numPages; p++) allPages[p] = await getPageLines(doc, p);

  // ---- global font classification ----
  const fontChars = {};
  const fontFamilies = {};
  for (const lines of Object.values(allPages)) {
    for (const l of lines) {
      fontChars[l.dominant] = (fontChars[l.dominant] || 0) + l.text.length;
      for (const f of l.fonts) fontFamilies[f] = fontFamilies[f] || (l.fonts.length === 1 ? null : null);
    }
  }

  // Determine mono ids via styles family on a sample; determine body id = most chars
  const bodyId = Object.entries(fontChars).sort((a, b) => b[1] - a[1])[0][0];

  // Mono detection: use styles fontFamily
  const monoIds = new Set();
  const boldIds = new Set();
  const italicIds = new Set();
  const linkIds = new Set();

  // sample font family map from one page's content.styles (stable across doc)
  const sample = await (await doc.getPage(70)).getTextContent();
  for (const [fname, st] of Object.entries(sample.styles)) {
    const fam = st.fontFamily || "";
    if (fam === "monospace") monoIds.add(fname);
  }

  // For other ids at body size: check usage pattern across sample chapters
  const idStats = {};
  for (const lines of Object.values(allPages)) {
    for (const l of lines) {
      if (Math.abs(l.size - 100) > 1 && Math.abs(l.size - 85) > 1) continue;
      const st = idStats[l.dominant] || (idStats[l.dominant] = { full: 0, inline: 0, sample: "", spaces: 0, chars: 0 });
      st.chars += l.text.length;
      st.spaces += (l.text.match(/ /g) || []).length;
      if (l.fonts.length === 1 && l.fonts[0] === l.dominant && l.text.length < 75) st.full++;
      else st.inline++;
      if (st.sample.length < 60) st.sample += " " + l.text;
    }
  }

  for (const [id, st] of Object.entries(idStats)) {
    if (id === bodyId || monoIds.has(id)) continue;
    const spaceRatio = st.spaces / Math.max(1, st.chars);
    const urlish = /http|www\.|\.(com|dev|org|net|io)\b/.test(st.sample) && spaceRatio < 0.08;
    if (urlish) linkIds.add(id);
    else if (st.full > st.inline) boldIds.add(id);
    else italicIds.add(id);
  }

  console.log("bodyId:", bodyId);
  console.log("monoIds:", [...monoIds]);
  console.log("boldIds:", [...boldIds].map((b) => b + " -> " + (idStats[b] ? idStats[b].sample.slice(0, 40) : "")));
  console.log("italicIds:", [...italicIds].map((b) => b + " -> " + (idStats[b] ? idStats[b].sample.slice(0, 40) : "")));
  console.log("linkIds:", [...linkIds]);

  fs.writeFileSync(
    path.join(__dirname, "..", "tmp_fonts.json"),
    JSON.stringify({ bodyId, monoIds: [...monoIds], boldIds: [...boldIds], italicIds: [...italicIds], linkIds: [...linkIds] }, null, 2)
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
