// Builds chapter .ts files + book index from tmp markdown, and (optionally) registers
// the book in data/sampleBooks.ts.
//
// Usage:
//   npm run book:build -- --book <id>            # build EN chapters from tmp_books/<id>/*.md
//   npm run book:build -- --book <id> --register # also add to data/sampleBooks.ts
//   npm run book:build -- --book <id> --fa       # build FA chapters from translations/<id>/final/*.md
const fs = require("fs");
const path = require("path");
const {
  ROOT, readConfig, getBook, escapeTs, escapeJsonForJs, ensureDir,
  readingTime, registerInSampleBooks,
} = require("./lib/common");

const args = process.argv.slice(2);
const bookId = args[args.indexOf("--book") + 1];
if (!bookId) {
  console.error("Usage: node scripts/pipeline/buildBook.js --book <id> [--register] [--fa]");
  process.exit(1);
}
const doRegister = args.includes("--register");
const buildFa = args.includes("--fa");

const book = getBook(readConfig(), bookId);
const out = buildFa ? book.translation : book.output;
const tmpDir = buildFa
  ? path.join(ROOT, "translations", book.id, "final")
  : path.join(ROOT, book.output.tmpDir || path.join("tmp_books", book.id));

if (!fs.existsSync(tmpDir)) {
  console.error(`Source markdown dir not found: ${path.relative(ROOT, tmpDir)}`);
  process.exit(1);
}

const chapterDir = path.join(ROOT, out.chapterDir);
ensureDir(chapterDir);
const chapterPrefix = buildFa ? (out.chapterPrefix || "chapter") : "chapter";

const indexImports = [];
const indexChapters = [];

for (const ch of book.source.chapters) {
  const mdPath = path.join(tmpDir, `${ch.file}.md`);
  if (!fs.existsSync(mdPath)) {
    console.error(`MISSING: ${path.relative(ROOT, mdPath)} — cannot build chapter.`);
    process.exit(1);
  }

  let content = fs.readFileSync(mdPath, "utf8")
    .replace(/```[ \t]*\n\s*```[ \t]*(\n\s*```[ \t]*)+/g, "```")
    .replace(/```\n+```/g, "```")
    .trim();

  // If the markdown has no top-level heading, inject the configured title.
  if (!/^# /m.test(content)) content = `# ${ch.title}\n\n${content}`;

  const words = content.split(/\s+/).filter(Boolean).length;
  const rt = readingTime(content);
  const num = ch.file.replace(/^chapter/, "").toUpperCase();
  const exportName = buildFa
    ? `${ch.isSpecial ? (ch.file === "frontMatter" ? "FRONT_MATTER_CHAPTER" : "RESOURCES_CHAPTER") : `CHAPTER_${num}`}_FA`
    : `${ch.isSpecial ? (ch.file === "frontMatter" ? "FRONT_MATTER_CHAPTER" : "RESOURCES_CHAPTER") : `CHAPTER_${num}`}`;

  // Chapter ids follow the existing convention (ch-0, ch-1, ...) — NEVER change the
  // pattern for existing books: localStorage reading progress is keyed by these ids.
  const chapterId = ch.isSpecial ? ch.file : `ch-${ch.file.replace(/^chapter/, "")}`;

  const ts = `import { Chapter } from "@/types/reader";

export const ${exportName}: Chapter = {
  id: "${chapterId}",
  title: ${escapeJsonForJs(buildFa ? ch.titleFa || ch.title : ch.title)},
  readingTimeMinutes: ${rt},
  content: \`${escapeTs(content)}\`,
};
`;

  fs.writeFileSync(path.join(chapterDir, `${ch.file}.ts`), ts, "utf8");
  console.log(`${ch.file}: ${words} words, ${rt} min -> ${path.join(out.chapterDir, ch.file + ".ts")}`);

  indexImports.push(`import { ${exportName} } from "./${out.chapterDir.replace(/^data\//, "")}/${ch.file}";`);
  indexChapters.push(exportName);
}

const b = out.book;
const indexTs = `${indexImports.join("\n")}
import { Book } from "@/types/reader";

export const ${out.exportName}: Book = {
  id: ${escapeJsonForJs(b.id)},
  title: ${escapeJsonForJs(b.title)},
  author: ${escapeJsonForJs(b.author)},
  description: ${escapeJsonForJs(b.description)},
  language: "${b.language}",
  coverGradient: ${escapeJsonForJs(b.coverGradient)},
  chapters: [
${indexChapters.map((c) => `    ${c},`).join("\n")}
  ],
};
`;

const indexFile = path.join(ROOT, out.indexFile);
fs.writeFileSync(indexFile, indexTs, "utf8");
console.log(`\nBook index written: ${path.relative(ROOT, indexFile)}`);

if (doRegister) {
  registerInSampleBooks(out.indexFile, out.exportName);
} else {
  console.log(`(add  import { ${out.exportName} } from "@/data/sampleBooks";  manually, or re-run with --register)`);
}
