// Compares each site chapter against the corresponding PDF page range
// and reports coverage as the percentage of PDF word 5-grams found in the site text.
const fs = require("fs");
const path = require("path");

const pages = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "tmp_pdf_pages.json"), "utf8"));

const ranges = {
  frontMatter: [13, 28],
  "chapter0": [29, 38],
  "chapter1": [41, 66],
  "chapter2": [67, 100],
  "chapter3": [101, 132],
  "chapter4": [135, 172],
  "chapter5": [173, 198],
  "chapter6": [199, 228],
  "chapter7": [231, 258],
  "chapter8": [259, 284],
  "chapter9": [285, 310],
  "chapter10": [311, 325],
};

const siteDir = path.join(__dirname, "..", "data", "book");

const clean = (s) =>
  s
    .toLowerCase()
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[*_`>#|>-]/g, " ")
    .replace(/[\u0600-\u06FF]/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ");

const words = (s) => clean(s).split(" ").filter((w) => w.length > 1);

const ngrams = (ws, n) => {
  const set = new Set();
  for (let i = 0; i <= ws.length - n; i++) set.add(ws.slice(i, i + n).join(" "));
  return set;
};

const N = 5;
const report = {};

for (const [name, [start, end]] of Object.entries(ranges)) {
  const pdfText = pages.slice(start - 1, end).join("\n");
  const pdfWords = words(pdfText);

  let siteFile;
  if (name === "frontMatter") siteFile = path.join(siteDir, "frontMatter.ts");
  else siteFile = path.join(siteDir, `${name}.ts`);

  const siteRaw = fs.readFileSync(siteFile, "utf8");
  const siteWords = words(siteRaw);

  const pdfGrams = ngrams(pdfWords, N);
  const siteGrams = ngrams(siteWords, N);

  let found = 0;
  for (const g of pdfGrams) if (siteGrams.has(g)) found++;

  const pct = pdfGrams.size ? (found / pdfGrams.size) * 100 : 0;
  report[name] = {
    pdfPages: `${start}-${end}`,
    pdfWords: pdfWords.length,
    siteWords: siteWords.length,
    pdfNgrams: pdfGrams.size,
    coverage: pct.toFixed(1) + "%",
  };
}

console.table(report);
fs.writeFileSync(path.join(__dirname, "..", "tmp_coverage.json"), JSON.stringify(report, null, 2));
