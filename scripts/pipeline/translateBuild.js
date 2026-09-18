// Merges translated chunks (translations/<id>/done/) into final chapter markdown,
// then builds the FA book (chapters + index) into the configured translation output.
//
// Usage:
//   npm run book:translate:build -- --book <id> [--register]
const fs = require("fs");
const path = require("path");
const { ROOT, readConfig, getBook, ensureDir } = require("./lib/common");

const args = process.argv.slice(2);
const bookId = args[args.indexOf("--book") + 1];
if (!bookId) { console.error("Usage: node scripts/pipeline/translateBuild.js --book <id> [--register]"); process.exit(1); }

const book = getBook(readConfig(), bookId);
const doneDir = path.join(ROOT, "translations", book.id, "done");
const finalDir = path.join(ROOT, "translations", book.id, "final");
ensureDir(finalDir);

if (!fs.existsSync(doneDir)) { console.error(`No done/ folder at ${doneDir}`); process.exit(1); }

const { execFileSync } = require("child_process");

let missing = 0;
for (const ch of book.source.chapters) {
  const parts = fs.readdirSync(doneDir)
    .filter((f) => f.startsWith(`${ch.file}--part-`) && f.endsWith(".md"))
    .sort((a, b) => {
      const pa = Number(a.match(/part-(\d+)/)?.[1] || 0);
      const pb = Number(b.match(/part-(\d+)/)?.[1] || 0);
      return pa - pb;
    });

  if (!parts.length) {
    console.error(`MISSING translation: no parts for ${ch.file} in done/`);
    missing++;
    continue;
  }

  const merged = parts.map((p) => fs.readFileSync(path.join(doneDir, p), "utf8").trim()).join("\n\n");
  fs.writeFileSync(path.join(finalDir, `${ch.file}.md`), merged + "\n", "utf8");
  console.log(`merged ${ch.file}: ${parts.length} part(s), ${merged.split(/\s+/).length} words`);
}

if (missing) {
  console.error(`\n${missing} chapter(s) still untranslated — build aborted.`);
  process.exit(1);
}

console.log(`\nBuilding FA book into ${book.translation.chapterDir} ...`);
execFileSync("node", [
  path.join(__dirname, "buildBook.js"),
  "--book", bookId,
  "--fa",
  ...(args.includes("--register") ? ["--register"] : []),
], { stdio: "inherit" });
