// Finds chapter/part boundary pages in the extracted PDF text
const fs = require("fs");
const path = require("path");

const pages = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "tmp_pdf_pages.json"), "utf8"));

const patterns = [
  /^[\s]*DAY ZERO\s*$/im,
  /^[\s]*TAINT ANALYSIS\s*$/im,
  /^[\s]*MAPPING CODE TO ATTACK SURFACE\s*$/im,
  /^[\s]*AUTOMATED VARIANT ANALYSIS\s*$/im,
  /^[\s]*BINARY TAXONOMY\s*$/im,
  /^[\s]*SOURCE AND SINK DISCOVERY\s*$/im,
  /^[\s]*HYBRID ANALYSIS IN REVERSE ENGINEERING\s*$/im,
  /^[\s]*QUICK AND DIRTY FUZZING\s*$/im,
  /^[\s]*COVERAGE-GUIDED FUZZING\s*$/im,
  /^[\s]*FUZZING EVERYTHING\s*$/im,
  /^[\s]*BEYOND DAY ZERO\s*$/im,
  /PART (I|II|III|IV)\b/i,
  /^[\s]*FOREWORD\b/im,
  /^[\s]*INTRODUCTION\b/im,
  /^[\s]*RESOURCES\b/im,
  /^[\s]*INDEX\b/im,
];

pages.forEach((p, idx) => {
  const lines = p.split("\n").map((l) => l.trim());
  const hits = [];
  for (let li = 0; li < Math.min(lines.length, 12); li++) {
    for (const pat of patterns) {
      if (pat.test(lines[li]) && lines[li].length < 60) {
        hits.push(`L${li}: "${lines[li]}"`);
        break;
      }
    }
  }
  if (hits.length) console.log(`Page ${idx + 1} -> ${hits.join(" | ")}`);
});
