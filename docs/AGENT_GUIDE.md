# Agent Guide — Context & Workflow Rules

> **Read order for any task:** 1) `AGENTS.md` → 2) this file → 3) `docs/ARCHITECTURE.md` →
> 4) the files you will edit. For book-related tasks also read `docs/BOOK_PIPELINE.md`.

## 1. Mandatory Verification Loop (ALWAYS)

Run the fast checks first, and defer heavy builds to the end:

```bash
npm run lint           # Fast syntax & type check (~2-3s)
npm run book:validate  # Run only if data/ or chapter content changed (~2s)
npm run build          # Full Next.js production build (~35-45s) — run at final verification
```

In AI Studio preview, use `compile_applet` at the end of code changes. Avoid running full `next build` inside rapid diagnostic loops as it causes 40+ second delays and context bloat.

## 2. Context Loading

- Dual-domain codebase:
  1. **Roham Cyber Security Portal** (`components/roham/*`, `lib/contentStore.ts`): Anti-stealer, SOC advisory, Threat Radar, Blog, Courses, Smart Publisher panel.
  2. **Interactive Vulnerability Research Reader** (`components/ChapterViewer.tsx`, `data/book*`): Bilingual reader, highlighting, vocabulary, TOC.
- Small codebase (< ~25 primary application source files). Read `types/reader.ts` before creating/editing data shapes.
- Ignore `node_modules/`, `.next/`, `out/`, and root `scripts/*.js` (legacy one-offs — reference only). Active book tooling lives in `scripts/pipeline/`.
- `data/` files are large. Read the **first ~50 lines** of a chapter file to learn format; never load whole chapters into context unnecessarily.

## 3. Non-Negotiable Rules

1. **Next.js 15 App Router Server Architecture:**
   - Production builds write to `.next/`.
   - **DO NOT** add `output: "export"` to `next.config.ts`. The application has dynamic server API routes (`app/api/*`). Forcing static export breaks Next.js App Router and causes prerender failures.
   - The `out/` folder was a historical static export snapshot and is gitignored. Do not expect `npm run build` to output to `out/`.
2. **localStorage & Offline-first Persistence:**
   - All client user state (progress, highlights, vocab, prefs, publisher drafts) persists in `localStorage`.
   - In production cPanel hosting, client interacts with PHP backend in `public/api/*.php` with transparent fallback to `localStorage`.
   - Never add Firebase, Supabase, or external databases unless explicitly requested.
3. **RTL/LTR contract:** Code blocks, inline code, terminal snippets, and tables are
   ALWAYS `dir="ltr"`, left-aligned. Persian headings/paragraphs are `dir="rtl"`,
   right-aligned. Any parser/renderer change must preserve both paths.
4. **Server-only AI:** `@google/genai` and `process.env.GEMINI_API_KEY` only inside
   `app/api/…/route.ts`. Every AI route needs a graceful offline fallback.
5. **Icons:** named imports from `lucide-react`. No custom SVG icons.
6. **Animations:** import from `motion/react` (never `framer-motion`).
7. **Registry:** a book that is not in `data/sampleBooks.ts` does not exist in the UI.
8. **Stable IDs.** `Book.id` and `Chapter.id` keys persist user progress in localStorage;
   renaming them destroys user data. Never rename existing ids.
9. **No comments** in code unless the file already uses them; match surrounding style.
10. **Environment:** When in Linux bash environments, use standard bash syntax (`&&`). In Windows PowerShell, use PowerShell syntax (`cmd1; if ($?) { cmd2 }`).

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

- **Bidi mixed-script & punctuation handling:** `ChapterViewer` isolates embedded English phrases (`dir="ltr"` + `unicode-bidi: isolate`) within Persian RTL blocks so multi-word English phrases ("the book is") are never scrambled. Crucially, sentence punctuation (parentheses `()`, quotes `""`, brackets `[]`, colons, Persian commas) is kept in the base RTL context rather than swallowed into the LTR isolate; this allows the browser's Unicode Bidi Brackets Algorithm (BBA) to properly pair brackets and prevent inverted punctuation like `("(" why`. Never absorb boundary punctuation into directional isolates.
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
