// Builds data/book/chapter{2..10}.ts from tmp_chapters/*.md
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const TITLES = {
  chapter1: "Chapter 1: Taint Analysis",
  chapter2: "Chapter 2: Mapping Code to Attack Surface",
  chapter3: "Chapter 3: Automated Variant Analysis",
  chapter4: "Chapter 4: Binary Taxonomy",
  chapter5: "Chapter 5: Source and Sink Discovery",
  chapter6: "Chapter 6: Hybrid Analysis in Reverse Engineering",
  chapter7: "Chapter 7: Quick and Dirty Fuzzing",
  chapter8: "Chapter 8: Coverage-Guided Fuzzing",
  chapter9: "Chapter 9: Fuzzing Everything",
  chapter10: "Chapter 10: Beyond Day Zero",
};

const HEADINGS = {
  chapter1: "# PART I: CODE REVIEW\n## 1: TAINT ANALYSIS",
  chapter2: "## 2: MAPPING CODE TO ATTACK SURFACE",
  chapter3: "## 3: AUTOMATED VARIANT ANALYSIS",
  chapter4: "# PART II: REVERSE ENGINEERING\n## 4: BINARY TAXONOMY",
  chapter5: "## 5: SOURCE AND SINK DISCOVERY",
  chapter6: "## 6: HYBRID ANALYSIS IN REVERSE ENGINEERING",
  chapter7: "# PART III: FUZZING\n## 7: QUICK AND DIRTY FUZZING",
  chapter8: "## 8: COVERAGE-GUIDED FUZZING",
  chapter9: "## 9: FUZZING EVERYTHING",
  chapter10: "## 10: BEYOND DAY ZERO",
};

const escapeTs = (s) => s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");

for (const [name, title] of Object.entries(TITLES)) {
  const num = name.replace("chapter", "");
  const md = fs.readFileSync(path.join(ROOT, "tmp_chapters", `${name}.md`), "utf8");

  // Clean up consecutive/empty code fences
  let content = md
    .replace(/```[ \t]*\n\s*```[ \t]*(\n\s*```[ \t]*)+/g, "```")
    .replace(/```\n+```/g, "```")
    .trim();

  content = `${HEADINGS[name]}\n\n${content}`;

  const words = content.split(/\s+/).length;
  const readingTime = Math.max(5, Math.round(words / 210));

  const ts = `import { Chapter } from "@/types/reader";

export const CHAPTER_${num}: Chapter = {
  id: "ch-${num}",
  title: "${title}",
  readingTimeMinutes: ${readingTime},
  content: \`${escapeTs(content)}\`,
};
`;

  fs.writeFileSync(path.join(ROOT, "data", "book", `chapter${num}.ts`), ts, "utf8");
  console.log(`${name}: ${words} words, ${readingTime} min -> chapter${num}.ts`);
}
console.log("Done");
