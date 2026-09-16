// Inserts figure image markdown before figure captions in chapter md files.
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

const FA_DIGITS = { "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4", "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9" };
const toAscii = (s) => s.replace(/[۰-۹]/g, (d) => FA_DIGITS[d]);

function processFile(file, captionRegex, altLabel) {
  let md = fs.readFileSync(file, "utf8");
  const lines = md.split("\n");
  let count = 0;
  let lastNonBlank = "";
  const out = lines.map((line) => {
    const trimmed = line.trim();
    const m = captionRegex.exec(trimmed);
    if (m && !/^\!\[/.test(trimmed) && lastNonBlank !== `![${altLabel} ${m[1]}](/images/fig-${toAscii(m[1])}.png)`) {
      const figId = toAscii(m[1]);
      count++;
      lastNonBlank = `![${altLabel} ${m[1]}](/images/fig-${figId}.png)`;
      return `![${altLabel} ${m[1]}](/images/fig-${figId}.png)\n\n${line}`;
    }
    if (trimmed !== "") lastNonBlank = trimmed;
    return line;
  });
  fs.writeFileSync(file, out.join("\n"), "utf8");
  console.log(`${file}: ${count} figures inserted`);
}

// EN chapters
for (const ch of ["6", "7", "8", "9"]) {
  processFile(
    path.join(ROOT, "tmp_chapters", `chapter${ch}.md`),
    /^\*Figure (\d+-\d+):/,
    "Figure"
  );
}

// FA chapters
for (const ch of ["6", "7"]) {
  processFile(
    path.join(ROOT, "tmp_fa", `chapter${ch}.md`),
    /^\*شکل ([۰-۹]+-[۰-۹]+):/,
    "شکل"
  );
}
console.log("Done");
