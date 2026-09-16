// Locates chapter start pages by scanning every page for chapter title patterns
const fs = require("fs");
const path = require("path");

const pages = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "tmp_pdf_pages.json"), "utf8"));

const chapters = [
  { name: "Ch0 Day Zero", re: /^0\s*$/im, title: /DAY\s*ZERO/i },
  { name: "Ch1 Taint", re: /^1\s*$/im, title: /T\s*A\s*I\s*N\s*T\s*A?\s*N/i },
  { name: "Ch2 Mapping", re: /^2\s*$/im, title: /M\s*A\s*P\s*P\s*I\s*N\s*G/i },
  { name: "Ch3 Automated", re: /^3\s*$/im, title: /A\s*U\s*T\s*O\s*M\s*A\s*T\s*E\s*D/i },
  { name: "Ch4 Binary Tax", re: /^4\s*$/im, title: /B\s*I\s*N\s*A\s*R\s*Y/i },
  { name: "Ch5 Source/Sink", re: /^5\s*$/im, title: /S\s*O\s*U\s*R\s*C\s*E/i },
  { name: "Ch6 Hybrid", re: /^6\s*$/im, title: /H\s*Y\s*B\s*R\s*I\s*D/i },
  { name: "Ch7 QuickDirty", re: /^7\s*$/im, title: /Q\s*U\s*I\s*C\s*K/i },
  { name: "Ch8 Coverage", re: /^8\s*$/im, title: /C\s*O\s*V\s*E\s*R\s*A\s*G\s*E/i },
  { name: "Ch9 Fuzzing Ev", re: /^9\s*$/im, title: /F\s*U\s*Z\s*Z\s*I\s*N\s*G/i },
  { name: "Ch10 Beyond", re: /^10\s*$/im, title: /B\s*E\s*Y\s*O\s*N\s*D/i },
  { name: "Resources", re: /.*/, title: /^R\s*E\s*S\s*O\s*U\s*R\s*C\s*E\s*S/im },
  { name: "Intro", re: /.*/, title: /^I\s*N\s*T\s*R\s*O\s*D\s*U\s*C\s*T\s*I\s*O\s*N/im },
];

for (const ch of chapters) {
  for (let i = 0; i < pages.length; i++) {
    const lines = pages[i].split("\n").map((l) => l.trim()).filter(Boolean);
    for (let li = 0; li < Math.min(lines.length, 6); li++) {
      if (ch.re.test(lines[li]) && ch.title.test(lines.slice(li, li + 3).join(" "))) {
        console.log(`${ch.name}: page ${i + 1} (line ${li}: "${lines[li]}")`);
        i = pages.length;
        break;
      }
    }
  }
}
