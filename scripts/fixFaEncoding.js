const fs = require("fs");
let t = fs.readFileSync("tmp_fa/chapter2.md", "utf8");
const idx = t.indexOf("```csharp");
if (idx < 0) {
  console.log("boundary not found");
  process.exit(1);
}
let prefix = t.slice(0, idx);
const suffix = t.slice(idx);
if (prefix.includes("\u00d9") || prefix.includes("\u00d8")) {
  prefix = Buffer.from(prefix.replace(/^\uFEFF/, ""), "latin1").toString("utf8");
}
fs.writeFileSync("tmp_fa/chapter2.md", prefix + suffix, "utf8");
const check = fs.readFileSync("tmp_fa/chapter2.md", "utf8");
console.log("start:", check.slice(0, 100));
console.log("chars:", check.length);
