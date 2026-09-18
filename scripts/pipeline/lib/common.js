// Shared helpers for the book pipeline scripts.
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..", "..");

function readConfig() {
  const cfgPath = path.join(ROOT, "books.config.json");
  if (!fs.existsSync(cfgPath)) {
    console.error("books.config.json not found at repo root.");
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(cfgPath, "utf8").replace(/^\uFEFF/, ""));
}

function getBook(config, id) {
  const book = (config.books || []).find((b) => b.id === id);
  if (!book) {
    console.error(`Book "${id}" not found in books.config.json. Available: ${(config.books || []).map((b) => b.id).join(", ") || "(none)"}`);
    process.exit(1);
  }
  return book;
}

// Escape a string for embedding inside a TypeScript template literal.
function escapeTs(s) {
  return s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

function escapeJsonForJs(s) {
  return JSON.stringify(s);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function wordCount(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

// Reading time: ~210 wpm, minimum 1 minute.
function readingTime(text) {
  return Math.max(1, Math.round(wordCount(text) / 210));
}

function writeIfChanged(file, content) {
  if (fs.existsSync(file) && fs.readFileSync(file, "utf8") === content) return false;
  fs.writeFileSync(file, content, "utf8");
  return true;
}

// Idempotently add an import + array entry to data/sampleBooks.ts.
function registerInSampleBooks(indexFileRel, exportName) {
  const regPath = path.join(ROOT, "data", "sampleBooks.ts");
  let src = fs.readFileSync(regPath, "utf8");

  const importLine = `import { ${exportName} } from "./${indexFileRel.replace(/^data\//, "").replace(/\.ts$/, "")}";`;
  if (!src.includes(importLine)) {
    const lastImport = src.lastIndexOf("import ");
    const endLine = src.indexOf("\n", lastImport);
    src = src.slice(0, endLine + 1) + importLine + "\n" + src.slice(endLine + 1);
  }

  if (!src.includes(exportName + ",")) {
    src = src.replace(/\n\];/, `  ${exportName},\n];`);
  }

  fs.writeFileSync(regPath, src, "utf8");
  console.log(`Registered ${exportName} in data/sampleBooks.ts`);
}

module.exports = {
  ROOT,
  readConfig,
  getBook,
  escapeTs,
  escapeJsonForJs,
  ensureDir,
  wordCount,
  readingTime,
  writeIfChanged,
  registerInSampleBooks,
};
