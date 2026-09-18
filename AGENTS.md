# AGENTS.md - System & Coding Guidelines for AI Agents

Welcome to the **Interactive Smart Book Reader & Vulnerability Research Library** codebase.
This project is an advanced, offline-first e-reader web application built with Next.js 15, React 19, Tailwind CSS v4, and Google Gemini.

This document serves as the single source of truth for autonomous AI agents (e.g., Claude Code, Cursor, Windsurf, Devin, Copilot, Antigravity) to understand, modify, test, and extend this codebase reliably.

---

## 1. Project Overview & Architecture

### Core Purpose
- **Rich Offline-Ready Technical Reader:** Designed for reading dense engineering/security books (like *From Day Zero to Zero Day*), with syntax-highlighted code blocks, tables, and callouts.
- **Bilingual (EN / FA) Synchronized Reading:** Full English and Persian editions with 1-click chapter-synced language switching and dynamic bidirectional layout (smart RTL/LTR detection).
- **Interactive Reading Utilities:**
  - Instant word/sentence selection with AI translation (`/api/gemini/translate`) and built-in offline dictionary fallback.
  - Sentence & paragraph highlighting with 4 color codes.
  - Vocabulary book (Flashcards / Saved Words) persisted in `localStorage`.
  - Offline Single-File HTML exporter (`lib/exportStandaloneHtml.ts`).
  - Client-side PDF-to-Chapters extraction using `pdfjs-dist`.

### Tech Stack
- **Framework:** Next.js 15+ (App Router) + React 19
- **Language:** TypeScript 5.9 (Strict mode)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`) with `@tailwindcss/typography`
- **Icons:** `lucide-react` (Strictly do not generate custom SVG icons)
- **Animations:** `motion` (`motion/react`)
- **AI SDK:** `@google/genai` (Server-side API routes only, never expose `GEMINI_API_KEY` on client)

---

## 2. Directory Structure & Key Files

\`\`\`
├── app/
│   ├── api/
│   │   └── gemini/
│   │       └── translate/route.ts  # Server-side translation & explanation via Gemini
│   ├── globals.css                 # Tailwind v4 import & font definitions
│   ├── layout.tsx                  # Root layout, Google Fonts (Vazirmatn & JetBrains Mono)
│   └── page.tsx                    # Main reader application container & state orchestration
├── components/
│   ├── BookImporterModal.tsx       # PDF / EPUB / Text extraction modal
│   ├── BookSelectorModal.tsx       # Book library switcher modal
│   ├── ChapterViewer.tsx           # High-performance reader rendering engine (RTL/LTR, code, quotes)
│   ├── DictionaryDrawer.tsx        # Saved words & vocabulary review drawer
│   ├── HighlightsDrawer.tsx        # Saved highlights & reader notes manager
│   ├── ReaderNavbar.tsx            # Top header with progress bar, theme, font size, language toggle
│   ├── SearchModal.tsx             # Full-text in-book search dialog
│   └── TableOfContentsDrawer.tsx   # Sidebar / Drawer for navigating chapters
├── data/
│   ├── book/                       # English chapters of "From Day Zero to Zero Day"
│   │   ├── chapter0.ts .. chapter10.ts
│   │   ├── frontMatter.ts
│   │   └── resources.ts
│   ├── book_fa/                    # Complete Persian translation chapters
│   │   ├── chapter0.ts .. chapter10.ts
│   │   ├── frontMatter.ts
│   │   └── resources.ts
│   ├── fromDayZeroBook.ts          # English book definition object
│   ├── fromDayZeroBookFa.ts        # Persian book definition object
│   └── sampleBooks.ts              # Registry of all available books (SAMPLE_BOOKS)
├── lib/
│   ├── exportStandaloneHtml.ts     # Generates self-contained, offline single-file HTML exports
│   └── utils.ts                    # Classnames merger (`clsx` + `tailwind-merge`)
├── types/
│   └── reader.ts                   # Core TypeScript interfaces: Book, Chapter, Highlight, SavedWord, etc.
├── scripts/pipeline/               # REUSABLE, config-driven book tooling (extract/build/validate/translate)
├── books.config.json               # Per-book pipeline configuration (PDF path, page ranges, metadata)
├── docs/
│   ├── ARCHITECTURE.md             # File map, dependency graph, content format spec
│   ├── AGENT_GUIDE.md              # Context loading order, mandatory checklists, gotchas
│   └── BOOK_PIPELINE.md            # Step-by-step guide for adding new books
├── metadata.json                   # App title, description, and AI Studio capabilities
└── AGENTS.md                       # This instruction file
```

**Note:** `scripts/*.js` in the repo root are legacy one-off scripts from the first book.
Do not extend them — all book tooling goes through `scripts/pipeline/` (`npm run book:*`).

---

## 3. Critical Architectural Rules & Invariants

When editing or extending this codebase, agents **MUST** follow these rules:

### 1. Zero-Telemetry & Offline-First Persistence
- All user state (reading progress, active book/chapter, highlights, saved vocabulary, font size, theme) lives in `localStorage` through React state hydration in `app/page.tsx`.
- Never introduce remote databases (e.g. Firebase, Supabase) unless explicitly requested by the user.

### 2. Dual-Language & RTL/LTR Handling
- Chapters can be in English (`language: "en"`) or Persian (`language: "fa"`).
- `components/ChapterViewer.tsx` detects Persian/Arabic unicode ranges (`/[\u0600-\u06FF]/`) on a per-block and per-heading basis.
- Code blocks (\`\`\`...\`\`\`), inline code (\`...\`), terminal prompts, and technical tables **MUST ALWAYS** maintain `dir="ltr"` and `text-align: left`.
- Headings and paragraphs in Persian **MUST** have `dir="rtl"` and `text-align: right`.

### 3. Server-Side AI Protocol
- Never call the Gemini API directly from client components.
- The route `app/api/gemini/translate/route.ts` handles AI translation and explanations using `@google/genai` with `process.env.GEMINI_API_KEY`.
- Always provide a resilient offline fallback if `GEMINI_API_KEY` is not present or if the network request fails.

### 4. Code Quality & Build Verification
- Always run `npm run lint` and `npm run build` after changes to confirm that TypeScript types, JSX elements, and imports are valid.
- When importing from Lucide, use named imports: `import { BookOpen, Search } from "lucide-react";`.
- For animations, import from `motion/react`, never legacy `framer-motion`.

### 5. Documentation Discipline (MUST)
Agents MUST consult the docs at the right moments and keep them true:

**When to read `docs/` (before acting):**
- **`docs/ARCHITECTURE.md`** — before any cross-file change, refactor, new feature, or new component. Gives the file map, dependency graph, content format, and extension points.
- **`docs/AGENT_GUIDE.md`** — on EVERY task: context-loading order, mandatory verification loop, gotchas.
- **`docs/BOOK_PIPELINE.md`** — for any book-related change (adding/extending/validating books).

**When to UPDATE `docs/` (after major changes):**
- Adding/removing/renaming a file or directory → update the map in `docs/ARCHITECTURE.md`.
- Changing data shapes, content format, or persistence keys → update `docs/ARCHITECTURE.md`.
- Changing the rendering/RTL pipeline, API routes, or build process → update `docs/ARCHITECTURE.md` and/or `docs/AGENT_GUIDE.md`.
- Changing book tooling/config or npm `book:*` scripts → update `docs/BOOK_PIPELINE.md`.
- Changing agent work rules → update `AGENTS.md` and the mirrors (`.cursorrules`, `.clinerules`, `.windsurfrules`, `.github/copilot-instructions.md`).
- Introducing a brand-new concept/workflow → add a short section to the most relevant doc instead of inventing a new file.

If a task introduces a change so large that the existing docs would mislead the next agent, **updating the docs is part of the task**, not a follow-up.

---

## 4. Common Agentic Workflows

### Adding a New Book (config-driven pipeline)
Follow `docs/BOOK_PIPELINE.md` end-to-end. Summary:
1. Add the book entry (PDF path, page ranges, metadata) to `books.config.json`.
2. `npm run book:extract -- --book <id>` → review/fix the generated markdown in `tmp_books/<id>/`.
3. `npm run book:build -- --book <id> --register` → chapter/index .ts files + auto-registration in `data/sampleBooks.ts`.
4. Persian edition: `npm run book:translate:prep` → translate chunks → `npm run book:translate:build --register`.
5. Always finish with `npm run book:validate`, `npm run lint`, `npm run build`.

### Manual (rare) book edits
1. Create chapter files in `data/<book_folder>/`.
2. Define the book export object conforming to the `Book` interface in `types/reader.ts`.
3. Register the book in `data/sampleBooks.ts` array.

### Modifying the Reader Rendering Engine
- Inspect `components/ChapterViewer.tsx`.
- The parser splits content by double newlines into blocks (`#`, `##`, `###`, `> `, \`\`\`code\`\`\`, `| table |`, and `* list`).
- When adding new markdown features, ensure both LTR and RTL cases are handled gracefully.

### Updating the Single-File HTML Exporter
- Inspect `lib/exportStandaloneHtml.ts`.
- The function generates a self-contained HTML document with inlined CSS, scripts, and full book data, allowing users to save and read offline on any device.
