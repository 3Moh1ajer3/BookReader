# Agent Guide — Context & Workflow Rules

> **Read order for any task:** 1) `AGENTS.md` → 2) this file → 3) `docs/ARCHITECTURE.md` →
> 4) the files you will edit. For book-related tasks also read `docs/BOOK_PIPELINE.md`.

## 1. Mandatory Verification Loop (ALWAYS)

After **any** code change:

```
npm run lint
npm run build
npm run book:validate     # if data/ or chapter content changed
```

All three must pass. There is no test suite; lint + build + validate are the safety net.

## 2. Context Loading

- Small codebase (< ~25 source files). It is usually cheaper to read the whole relevant
  area than to guess. Always read `types/reader.ts` before creating/editing data shapes.
- Ignore `node_modules/`, `.next/`, `out/`, and root `scripts/*.js` (legacy one-offs —
  reference only). The active tooling lives in `scripts/pipeline/`.
- `data/` files are large. Read the **first ~50 lines** of a chapter file to learn the
  format; never paste whole chapters into context unnecessarily.

## 3. Non-Negotiable Rules

1. **localStorage only.** Never add a remote database, auth service, or telemetry.
2. **RTL/LTR contract.** Code blocks, inline code, terminal snippets, and tables are
   ALWAYS `dir="ltr"`, left-aligned. Persian headings/paragraphs are `dir="rtl"`,
   right-aligned. Any parser/renderer change must preserve both paths.
3. **Server-only AI.** `@google/genai` and `process.env.GEMINI_API_KEY` only inside
   `app/api/…/route.ts`. Every AI route needs a graceful offline fallback.
4. **Icons:** named imports from `lucide-react`. No custom SVG icons.
5. **Animations:** import from `motion/react` (never `framer-motion`).
6. **Registry:** a book that is not in `data/sampleBooks.ts` does not exist in the UI.
7. **Stable IDs.** `Book.id` and `Chapter.id` keys persist user progress in localStorage;
   renaming them destroys user data. Never rename existing ids.
8. **No comments** in code unless the file already uses them; match surrounding style.
9. Windows + PowerShell 5.1 environment. Use `cmd1; if ($?) { cmd2 }`, not `&&`.

## 4. Pre-Flight Checklist (before declaring a task done)

- [ ] `npm run lint` clean
- [ ] `npm run build` passes
- [ ] `npm run book:validate` passes (if `data/` touched)
- [ ] RTL rendering still correct (visually or by inspecting `ChapterViewer` logic)
- [ ] No secrets in code; `GEMINI_API_KEY` only read server-side
- [ ] New components follow existing patterns (client components, `motion/react`, `cn()`)

## 5. Common Tasks — Recipes

### Add a new book (English + Persian)
→ `docs/BOOK_PIPELINE.md`. Summary: put PDF in repo root → add entry in
`books.config.json` → `npm run book:extract -- --book <id>` → fix markdown →
`npm run book:build -- --book <id>` → `npm run book:validate` → translation loop with
`book:translate:prep` / `book:translate:build`.

### Modify reader rendering
Read `components/ChapterViewer.tsx` fully first. The parser splits on double newlines;
block prefixes: `#`, `##`, `###`, `> `, ` ``` `, `| … |`, `* `. Keep every block type
working for both `language: "en"` and `"fa"` books.

### Change UI / add component
Copy the closest existing component's structure (modal vs drawer vs navbar), use
`cn()` from `lib/utils.ts`, `motion/react` for animation, `lucide-react` named icons.

### Debugging data issues
`npm run book:validate` reports: unbalanced code fences, broken inline code, empty
chapters, missing images referenced by `/images/...`, and reading-time mismatches.

## 6. Known Gotchas

- **Bidi word-order bug:** `ChapterViewer` wraps each word in its own span for tap-to-translate. Inside an RTL paragraph this can visually scramble a multi-word English phrase ("the book is" → "is book the"). The fix already in place: consecutive same-script tokens are grouped into directional runs isolated with `dir` + `unicode-bidi: isolate` (`renderInteractiveTokens`). If you add a new renderer that splits text into word spans, replicate this run-grouping or the bug returns.
- `pdfjs-dist` is used **both** client-side (BookImporterModal) and in pipeline scripts
  (legacy build via `pdfjs-dist/legacy/build/pdf.mjs`). Don't mix import styles.
- Persian chapter files must escape backticks and `${` inside template literals — the
  build script handles this; hand-edits must too.
- `public/api/translate.php` is dead legacy from static export; the live API is the
  Next.js route. Don't "fix" the PHP file.
- `out/` is a stale static export; `npm run build` writes `.next/`. Neither is source.
- Book `description` fields are written in Persian even for English books (intentional —
  matches the library UI). Keep that convention.
- Library backups (`lib/exportImport.ts`) merge by `id` and never overwrite existing
  items; the format is versioned, so bump `LIBRARY_EXPORT_VERSION` when the shape changes.
