const fs = require("fs");
const p1 = fs.readFileSync("tmp_fa/chapter2_p1.md", "utf8").replace(/^\uFEFF/, "").trimEnd();
const full = fs.readFileSync("tmp_fa/chapter2.md", "utf8");
const idx = full.indexOf("```csharp");
if (idx < 0) {
  console.log("boundary not found");
  process.exit(1);
}
const suffix = full.slice(idx);
fs.writeFileSync("tmp_fa/chapter2.md", p1 + "\n\n" + suffix, "utf8");
const check = fs.readFileSync("tmp_fa/chapter2.md", "utf8");
console.log("start:", check.slice(0, 90));
console.log("mid check:", check.slice(check.length - 120));
console.log("chars:", check.length);
