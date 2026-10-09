# Agent Guide — Context & Workflow Rules

> **Read order for any task:** 
> 1) `AGENTS.md` → 2) `docs/AGENT_GUIDE.md` → 3) `docs/ARCHITECTURE.md` → 4) the files you edit.
> For book-related tasks, also refer to `docs/BOOK_PIPELINE.md`.

---

## 1. Verification Loop (Fast & Reliable)

Always execute checks in this sequence:

```bash
npm run lint           # Fast syntax & type check (~2-3s)
npm run book:validate  # Run only if data/ or chapter content changed (~2s)
npm run build          # Next.js static production export check
```

In the AI Studio environment, run `compile_applet` at the conclusion of your code edits.

---

## 2. Core Architecture Invariants

1. **Static Export Frontend + PHP Backend:**
   - The Next.js frontend builds as a static export (`output: 'export'` in `next.config.ts`) ready for deployment into cPanel `public_html/`.
   - All backend APIs reside in `public/api/*.php` and connect to the MySQL database (`corpel_roham`).
   - Do NOT create `app/api/*` Node.js server routes. The project uses pure PHP on the host for all backend needs.

2. **Clean Direct API Calls (`lib/authSync.ts` & `lib/contentStore.ts`):**
   - The frontend communicates directly with `/api/*.php` endpoints using standard `fetch` with Bearer tokens.
   - Do NOT introduce fake local database emulation layers or mock data fallbacks in the client.

3. **Bilingual RTL/LTR Strict Contract:**
   - In `components/ChapterViewer.tsx`:
     - Persian text, titles, and paragraphs **MUST** render with `dir="rtl"` and proper Persian font (`Vazirmatn`).
     - Technical code blocks (```` ```...``` ````), inline code (`` `...` ``), terminal commands, and markdown tables **MUST ALWAYS** render with `dir="ltr"` and `font-mono`.
     - Boundary punctuation must stay in the outer RTL context.

4. **Icons & Animations:**
   - Import icons exclusively from `lucide-react` using named imports. Never write inline SVG icons.
   - Import animations exclusively from `motion/react`.

5. **Stability of IDs:**
   - `Book.id` and `Chapter.id` keys map directly to user reading progress. Never rename existing IDs without an explicit migration path.

---

## 3. Pre-Flight Checklist

Before completing any task, ensure:
- [ ] `npm run lint` finishes with 0 errors.
- [ ] `npm run build` or `compile_applet` succeeds cleanly.
- [ ] No server-side Node.js assumptions or `app/api` routes are introduced.
- [ ] RTL and LTR formatting remains intact across reader components.
- [ ] All API communication goes through `public/api/*.php`.
