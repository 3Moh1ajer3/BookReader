const fs = require("fs");
const files = [
  "tmp_chapters/chapter1.md",
  "tmp_chapters/chapter2.md",
  "tmp_chapters/chapter3.md",
  "tmp_chapters/chapter4.md",
  "tmp_chapters/chapter5.md",
  "tmp_chapters/chapter6.md",
  "tmp_chapters/chapter7.md",
  "tmp_chapters/chapter8.md",
  "tmp_chapters/chapter9.md",
  "tmp_chapters/chapter10.md",
  "tmp_fa/chapter2.md",
  "tmp_fa/chapter3.md",
];
for (const f of files) {
  const t = fs.readFileSync(f, "utf8");
  // count block-level tags by pairing fences sequentially
  let idx = 0;
  const tags = [];
  while (true) {
    const open = t.indexOf("```", idx);
    if (open < 0) break;
    const nl = t.indexOf("\n", open);
    const close = t.indexOf("```", nl);
    if (close < 0) {
      tags.push("UNPAIRED!");
      break;
    }
    tags.push(t.slice(open + 3, nl).trim() || "(empty)");
    idx = close + 3;
  }
  const counts = {};
  tags.forEach((x) => (counts[x] = (counts[x] || 0) + 1));
  const unpaired = tags.includes("UNPAIRED!");
  console.log(f.replace("tmp_", ""), JSON.stringify(counts), unpaired ? "!! UNPAIRED FENCE" : "");
}
