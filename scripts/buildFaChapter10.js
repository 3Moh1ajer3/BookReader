const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

const name = "10";
const title = "فصل ۱۰: فراتر از روز صفر (Beyond Day Zero)";

let md = fs.readFileSync(path.join(ROOT, "tmp_fa", `chapter${name}.md`), "utf8");

let content = md
  .replace(/\r\n/g, "\n")
  .replace(/```[ \t]*\n\s*```[ \t]*(\n\s*```[ \t]*)+/g, "```")
  .replace(/```\n+```/g, "```")
  .trim();

const escapeTs = (s) => s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");

const words = content.split(/\s+/).length;
const readingTime = Math.max(5, Math.round(words / 160));

const ts = `import { Chapter } from "@/types/reader";

export const CHAPTER_10_FA: Chapter = {
  id: "ch-10",
  title: "${title}",
  readingTimeMinutes: ${readingTime},
  content: \`${escapeTs(content)}\`,
};
`;

fs.writeFileSync(path.join(ROOT, "data", "book_fa", `chapter10.ts`), ts, "utf8");
console.log(`FA chapter${name}: ${words} words, ${readingTime} min`);
