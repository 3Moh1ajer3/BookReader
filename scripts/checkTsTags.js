const fs = require("fs");
const files = [
  "data/book_fa/chapter2.ts",
  "data/book_fa/chapter3.ts",
  "data/book/chapter1.ts",
  "data/book/chapter2.ts",
  "data/book/chapter7.ts",
];
for (const f of files) {
  const lines = fs.readFileSync(f, "utf8").split("\n");
  const tags = lines
    .filter((l) => l.startsWith("\\`\\`\\`") || l.startsWith("```"))
    .map((l) => l.replace(/\\/g, "").replace("```", "").trim() || "(empty)");
  const counts = {};
  tags.forEach((x) => (counts[x] = (counts[x] || 0) + 1));
  console.log(f, "fence lines:", tags.length, JSON.stringify(counts));
}
