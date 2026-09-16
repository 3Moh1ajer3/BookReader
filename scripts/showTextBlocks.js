const fs = require("fs");
const file = process.argv[2];
const t = fs.readFileSync(file, "utf8");
let idx = 0;
let i = 0;
while (true) {
  const open = t.indexOf("```", idx);
  if (open < 0) break;
  const nl = t.indexOf("\n", open);
  const close = t.indexOf("```", nl);
  if (close < 0) break;
  const lang = t.slice(open + 3, nl).trim();
  const content = t.slice(nl + 1, close).trim();
  if (lang === "text" || lang === "") {
    i++;
    console.log(`--- text block #${i} ---`);
    console.log(content.split("\n").slice(0, 4).join("\n").slice(0, 200));
    console.log("");
  }
  idx = close + 3;
}
