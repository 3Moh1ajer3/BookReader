const fs = require("fs");
let t = fs.readFileSync("tmp_fa/chapter3.md", "utf8");
const marker = "resolve languages'.";
const i = t.indexOf(marker);
if (i < 0) {
  console.log("marker not found");
  process.exit(1);
}
const before = t.slice(0, i + marker.length);
let after = t.slice(i + marker.length);
// Normalize whatever broken fence follows the newline into a proper ```
after = after.replace(/^[\r\n]+\s*`+\s*'?\s*[\r\n]*/, "\n```\n");
fs.writeFileSync("tmp_fa/chapter3.md", before + after, "utf8");
const check = fs.readFileSync("tmp_fa/chapter3.md", "utf8");
console.log("tail now:", JSON.stringify(check.slice(-90)));
