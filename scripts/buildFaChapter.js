// Builds data/book_fa/chapterN.ts from tmp_fa/chapterN.md
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

const name = process.argv[2]; // e.g. "2"
const title = process.argv[3];
if (!name || !title) {
  console.log("Usage: node buildFaChapter.js <num> <title>");
  process.exit(1);
}

const md = fs.readFileSync(path.join(ROOT, "tmp_fa", `chapter${name}.md`), "utf8");

let content = md
  .replace(/```[ \t]*\r?\n\s*```[ \t]*(\r?\n\s*```[ \t]*)+/g, "```")
  .replace(/```\r?\n+```/g, "```")
  .replace(/\r\n/g, "\n")
  .trim();

const escapeTs = (s) => s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");

const words = content.split(/\s+/).length;
const readingTime = Math.max(5, Math.round(words / 160));

const ts = `import { Chapter } from "@/types/reader";

export const CHAPTER_${name}_FA: Chapter = {
  id: "ch-${name}",
  title: "${title}",
  readingTimeMinutes: ${readingTime},
  content: \`${escapeTs(content)}\`,
};
`;

fs.writeFileSync(path.join(ROOT, "data", "book_fa", `chapter${name}.ts`), ts, "utf8");
console.log(`FA chapter${name}: ${words} words, ${readingTime} min`);
