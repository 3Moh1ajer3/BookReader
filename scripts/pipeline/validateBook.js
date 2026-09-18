// Validates generated book data for rendering-safety issues.
//
// Usage:
//   npm run book:validate            # validate everything under data/
//   npm run book:validate -- --dir data/book
const fs = require("fs");
const path = require("path");
const { ROOT } = require("./lib/common");

const args = process.argv.slice(2);
const di = args.indexOf("--dir");
const targetDirs = di >= 0
  ? [path.join(ROOT, args[di + 1])]
  : fs.readdirSync(path.join(ROOT, "data"), { withFileTypes: true })
      .filter((d) => d.isDirectory() && d.name.startsWith("book"))
      .map((d) => path.join(ROOT, "data", d.name));

let errors = 0;
let warnings = 0;

function report(file, level, msg) {
  const rel = path.relative(ROOT, file);
  console.log(`  ${level.toUpperCase()}: ${rel}: ${msg}`);
  if (level === "error") errors++;
  else warnings++;
}

for (const dir of targetDirs) {
  if (!fs.existsSync(dir)) { console.log(`skip (missing): ${dir}`); continue; }
  console.log(`\nValidating ${path.relative(ROOT, dir)}/`);

  const isFa = /book_fa/.test(dir);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".ts"));

  for (const f of files) {
    const file = path.join(dir, f);
    const src = fs.readFileSync(file, "utf8");

    const idMatch = src.match(/id:\s*"([^"]+)"/);
    if (!idMatch) report(file, "error", "chapter has no id");

    const rtMatch = src.match(/readingTimeMinutes:\s*(\d+)/);
    if (!rtMatch || Number(rtMatch[1]) < 1) report(file, "error", "readingTimeMinutes missing or < 1");

    const contentMatch = src.match(/content:\s*`(.*)`\s*,?\s*\r?\n\};/s);
    if (!contentMatch) { report(file, "error", "content template literal not parseable"); continue; }
    const content = contentMatch[1].replace(/\\`/g, "`").replace(/\r/g, "");

    // Unescaped backticks / template expressions would break the TS build, but the
    // content itself can still be structurally broken:
    const fences = (content.match(/^```/gm) || []).length;
    if (fences % 2 !== 0) report(file, "error", `unbalanced code fences (${fences} fence lines)`);

    let inFence = false;
    for (const [i, line] of content.split("\n").entries()) {
      if (/^```/.test(line.trim())) { inFence = !inFence; continue; }
      if (inFence) continue; // code block contents may contain any number of backticks
      const ticks = (line.match(/`/g) || []).length;
      if (ticks % 2 !== 0)
        report(file, "warning", `odd number of backticks on content line ${i + 1}: ${line.slice(0, 60)}`);
    }

    if (!content.trim()) report(file, "error", "empty content");

    // Reading time sanity (content words vs declared minutes)
    if (rtMatch) {
      const words = content.split(/\s+/).filter(Boolean).length;
      const expected = Math.max(1, Math.round(words / 210));
      const declared = Number(rtMatch[1]);
      if (Math.abs(expected - declared) > Math.max(2, expected * 0.3))
        report(file, "warning", `readingTimeMinutes=${declared} but ~${expected} expected for ${words} words`);
    }

    // Image references exist
    for (const m of content.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
      const img = m[1];
      if (img.startsWith("/")) {
        if (!fs.existsSync(path.join(ROOT, "public", img)))
          report(file, "error", `image not found: ${img}`);
      }
    }

    // FA books: detect leftover untranslated long English paragraphs
    if (isFa) {
      let leftovers = 0;
      for (const block of content.split(/\n{2,}/)) {
        if (/^```|^>|\|/.test(block.trim())) continue;
        const clean = block.replace(/[*_`#>-]/g, " ");
        const asciiWords = (clean.match(/[A-Za-z]{3,}/g) || []).length;
        const faWords = (clean.match(/[\u0600-\u06FF]{2,}/g) || []).length;
        if (asciiWords > 25 && asciiWords > faWords * 3) leftovers++;
      }
      if (leftovers > 0)
        report(file, "warning", `${leftovers} paragraph(s) look untranslated (mostly English)`);
    }

    // FA content must not contain raw LTR-only markdown artifacts like un-translated headings in ALL CAPS
    if (isFa && /^#\s+[A-Z0-9 :,'&()-]+$/m.test(content))
      report(file, "warning", "ALL-CAPS English heading found in FA book (likely untranslated)");
  }
}

console.log(`\n${errors} error(s), ${warnings} warning(s)`);
process.exit(errors ? 1 : 0);
