// Prints first 8 lines of given pages to locate chapter starts
const fs = require("fs");
const path = require("path");

const pages = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "tmp_pdf_pages.json"), "utf8"));

const targets = process.argv.slice(2).map(Number);
for (const t of targets) {
  const lines = pages[t - 1].split("\n").map((l) => l.trim()).filter(Boolean);
  console.log(`--- Page ${t} ---`);
  console.log(lines.slice(0, 8).join(" | "));
  console.log("");
}
