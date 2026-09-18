# Book Pipeline — Adding a New Book (End-to-End)

Reusable, config-driven tooling lives in `scripts/pipeline/`. All commands take the
book id from `books.config.json` (root).

```
PDF ──book:extract──► tmp_books/<id>/*.md ──book:build──► data/<dir>/*.ts + index ──register──► sampleBooks.ts
                                     │
                                     └──book:translate:prep──► translations/<id>/{chunks,prompts}
                                                                    │ (LLM/agent translates each chunk)
                                                                    ▼
                                              translations/<id>/done ──book:translate:build──► data/<dir>_fa
```

## One-time setup per book

1. Drop the PDF in the repo root (e.g. `newbook.pdf`).
2. **Calibrate the extractor.** Look at font-size stats for a few pages to set
   thresholds:
   ```
   npm run book:extract -- --book <id> --analyze 5 30 60
   ```
   Fill in `bodyFontSize`, `quoteFontSize`, `titleFontSize`, `yBounds` from the table.
3. Add an entry to `books.config.json`:
   ```jsonc
   {
     "id": "newbook",                          // stable! keys user progress
     "pdfPath": "newbook.pdf",
     "source": {
       "chapters": [                            // page ranges per chapter (PDF page numbers)
         { "file": "frontMatter", "title": "Front Matter", "pages": [1, 10], "isSpecial": true },
         { "file": "chapter0", "title": "Chapter 0: ...", "pages": [11, 40] }
       ],
       "noisePatterns": ["^Page \\\\d+$"],       // running headers/footers to drop
       "bodyFontSize": [95, 112],
       "quoteFontSize": [86, 95],
       "titleFontSize": 150,
       "yBounds": [55, 740],
       "figures": { "120": ["3-1", "3-2"] }    // page -> figure ids to crop (optional)
     },
     "output": {                               // English book target
       "tmpDir": "tmp_books/newbook",
       "chapterDir": "data/newbook",
       "indexFile": "data/newbookBook.ts",
       "exportName": "NEWBOOK_BOOK",
       "book": { "id": "newbook", "title": "...", "author": "...",
                 "description": "...", "language": "en", "coverGradient": "from-... to-..." }
     },
     "translation": {                          // Persian book target
       "chapterDir": "data/newbook_fa",
       "indexFile": "data/newbookBookFa.ts",
       "exportName": "NEWBOOK_BOOK_FA",
       "book": { "id": "newbook-fa", "title": "...", "author": "...",
                 "description": "...", "language": "fa", "coverGradient": "..." }
     }
   }
   ```
   Per-chapter you may add `"titleFa": "فصل صفر: ..."` for Persian titles.

## English edition (near-automatic)

```powershell
npm run book:extract -- --book newbook --figures   # PDF -> tmp_books/newbook/*.md (+ public/images)
# REVIEW the .md files: fix headings, table glitches, figure positions.
# Insert images in markdown as: ![Figure 3-1](/images/fig-3-1.png)
npm run book:build -- --book newbook --register    # md -> data/newbook/*.ts + index + registry
npm run book:validate                              # structural checks
npm run lint; if ($?) { npm run build }
```
Open `http://localhost:3000`, pick the book, skim a few chapters.

## Persian edition (semi-automatic: chunked AI translation + human review)

```powershell
npm run book:translate:prep -- --book newbook          # -> translations/newbook/{chunks,prompts}
```
For each `prompts/*.prompt.md`: give it to the translating agent/LLM and save the answer
as the **same filename** in `translations/newbook/done/`. (An agent can batch this:
"translate all prompts in translations/newbook/prompts to done/, obeying the prompt
rules".) Keep the `chunks/` + `prompts/` dirs gitignored; keep `done/` and `final/`.

```powershell
npm run book:translate:build -- --book newbook --register   # merge -> data/newbook_fa + registry
npm run book:validate
npm run lint; if ($?) { npm run build }
```

## Validation coverage (`npm run book:validate`)

- unbalanced code fences / stray backticks (breaks rendering)
- missing chapter id, empty content, reading-time drift (>30%)
- image refs pointing at files that don't exist in `public/`
- FA books: paragraphs that look untranslated, ALL-CAPS English headings

## Rules for stability

- **Never** change `Book.id`/`Chapter.id` of a published book (orphans user progress).
- Chapter ids are generated as `ch-<n>` for `chapterN` files and the file name for
  special chapters (`frontMatter`, `resources`) — matches the existing books.
- Legacy one-off scripts in `scripts/` (root) are reference-only. Don't extend them.
