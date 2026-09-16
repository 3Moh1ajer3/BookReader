// Dedupes consecutive identical figure image lines (allowing blank lines between)
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

const files = [
  "tmp_chapters/chapter6.md",
  "tmp_chapters/chapter7.md",
  "tmp_chapters/chapter8.md",
  "tmp_chapters/chapter9.md",
  "tmp_fa/chapter6.md",
  "tmp_fa/chapter7.md",
];

for (const rel of files) {
  const file = path.join(ROOT, rel);
  const lines = fs.readFileSync(file, "utf8").split("\n");
  const out = [];
  let lastImage = "";
  let removed = 0;
  for (const line of lines) {
    const m = /^\!\[([^\]]*)\]\(([^)]+)\)\s*$/.exec(line.trim());
    if (m) {
      if (line.trim() === lastImage) {
        removed++;
        continue;
      }
      lastImage = line.trim();
    } else if (line.trim() !== "") {
      lastImage = "";
    }
    out.push(line);
  }
  fs.writeFileSync(file, out.join("\n"), "utf8");
  const images = out.filter((l) => /^\!\[/.test(l.trim())).length;
  console.log(`${rel}: removed ${removed} duplicates, ${images} images remain`);
}
