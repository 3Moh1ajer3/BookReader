// Splits English chapter markdown into review-sized chunks and generates a
// ready-to-use translation prompt for each chunk.
//
// Usage:
//   npm run book:translate:prep -- --book <id> [--words 1200]
//
// Output:
//   translations/<id>/chunks/ch-N--part-1.md          (source to translate)
//   translations/<id>/prompts/ch-N--part-1.prompt.md  (prompt for the LLM/agent)
//
// Workflow: give each prompt to your translator agent/LLM, save the translated
// output into translations/<id>/done/ch-N--part-1.md (same filename), review,
// then run: npm run book:translate:build -- --book <id>
const fs = require("fs");
const path = require("path");
const { ROOT, readConfig, getBook, ensureDir } = require("./lib/common");

const args = process.argv.slice(2);
const bookId = args[args.indexOf("--book") + 1];
const wi = args.indexOf("--words");
const CHUNK_WORDS = wi >= 0 ? Number(args[wi + 1]) : 1200;

const book = getBook(readConfig(), bookId);
const srcDir = path.join(ROOT, book.output.tmpDir || path.join("tmp_books", book.id));
const chunksDir = path.join(ROOT, "translations", book.id, "chunks");
const promptsDir = path.join(ROOT, "translations", book.id, "prompts");
const doneDir = path.join(ROOT, "translations", book.id, "done");
ensureDir(chunksDir); ensureDir(promptsDir); ensureDir(doneDir);

// Split markdown into blocks, keeping code blocks atomic.
function splitBlocks(md) {
  const blocks = [];
  let current = [];
  let inCode = false;
  for (const line of md.split("\n")) {
    if (/^```/.test(line.trim())) inCode = !inCode;
    if (!inCode && line.trim() === "") {
      blocks.push(current.join("\n"));
      current = [];
    } else {
      current.push(line);
    }
  }
  if (current.length) blocks.push(current.join("\n"));
  return blocks.filter((b) => b.trim());
}

const PROMPT_TEMPLATE = (bookTitle, chunk) => `# Translation Task

Translate the markdown chunk below from English to **Persian (فارسی)** for the book
"${bookTitle}".

## Rules (follow ALL of them)

1. **Complete translation — no omissions.** Translate every sentence. Never summarize,
   skip, or add content.
2. **Technical terms:** keep standard security/engineering terms recognizable. On first
   use, write: معادل فارسی (English Term). After that, prefer the Persian equivalent.
   Terms that are conventionally left in English (tool names: Ghidra, AFL++; protocol
   names; CVE ids) stay in English.
3. **Code blocks, inline code, file paths, shell commands, table cells with code, and
   code identifiers MUST remain in English, byte-for-byte identical.** Never translate
   anything inside \`\`\` fences or \`backticks\`.
4. **Keep the exact markdown structure:** same headings (\`#\` levels), \`>\` quotes,
   \`|\` tables, \`*\` lists, \`---\` separators, \`![...](/images/...)\` images, \`**bold**\`/\`*italic*\`.
5. Write fluent, professional Persian (نه ترجمه تحت‌اللفظی) — right-reading and natural,
   matching the register of a technical book published by a reputable publisher.
6. Numbers inside Persian prose may be Persian digits; anything inside code/tables stays ASCII.
7. Output ONLY the translated markdown — no explanations, no code fences around the whole answer.

## Source chunk

\`\`\`markdown
${chunk}
\`\`\`
`;

let chunkIndex = 0;
for (const ch of book.source.chapters) {
  const mdPath = path.join(srcDir, `${ch.file}.md`);
  if (!fs.existsSync(mdPath)) {
    console.error(`MISSING source: ${mdPath} — run book:extract first.`);
    process.exit(1);
  }
  const md = fs.readFileSync(mdPath, "utf8");
  const blocks = splitBlocks(md);

  let part = 1;
  let buf = [];
  let bufWords = 0;
  const flush = () => {
    if (!buf.length) return;
    const name = `${ch.file}--part-${part}.md`;
    const chunk = buf.join("\n\n");
    fs.writeFileSync(path.join(chunksDir, name), chunk, "utf8");
    fs.writeFileSync(path.join(promptsDir, name.replace(/\.md$/, ".prompt.md")), PROMPT_TEMPLATE(book.output.book.title, chunk), "utf8");
    console.log(`${name}: ${chunk.split(/\s+/).length} words`);
    part++; chunkIndex++; buf = []; bufWords = 0;
  };

  for (const b of blocks) {
    const w = b.split(/\s+/).length;
    if (bufWords + w > CHUNK_WORDS && bufWords > 0) flush();
    buf.push(b); bufWords += w;
  }
  flush();
}

console.log(`\n${chunkIndex} chunk(s) prepared.`);
console.log(`1. Translate each file in translations/${book.id}/prompts/ (via LLM/agent).`);
console.log(`2. Save results as the SAME filename in translations/${book.id}/done/`);
console.log(`3. Review, then run: npm run book:translate:build -- --book ${bookId}`);
