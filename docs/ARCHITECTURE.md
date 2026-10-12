# Architecture Reference

> **Authoritative map of the codebase.**
> Pair this with `docs/AGENT_GUIDE.md` (workflow rules) and `docs/BOOK_PIPELINE.md` (adding new books).

---

## 1. High-Level System Architecture

This application consists of two streamlined, tightly decoupled layers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Next.js 15+ Frontend (React 19)                      │
│     Exported Static HTML/JS/CSS (output: 'export' in next.config.ts)   │
│                                                                        │
│   ├── Roham Security Portal (Overview, Threat Radar, Blog, Courses)    │
│   ├── Technical Reader Engine (ChapterViewer, RTL/LTR, Highlights)     │
│   └── Admin Management Console (Users, Leads, CMS, Settings)           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Direct HTTP Fetch (JSON)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   PHP 8.x + MySQL Backend (cPanel)                     │
│                        (public/api/*.php)                              │
│                                                                        │
│   ├── auth.php            (Bcrypt auth, JWT/HMAC token, sessions)      │
│   ├── sync.php            (Cloud reading progress, highlights, vocab)  │
│   ├── content.php         (Articles, threat radar news, auto-seed)     │
│   ├── leads.php           (Consultations, enrollments, beta leads)     │
│   ├── translate.php       (Technical dictionary & translation)         │
│   ├── admin.php           (Dashboard metrics, user management)         │
│   ├── config.php & db.php (PDO connection to MySQL `corpel_roham`)     │
│   └── schema.sql          (Clean relational database schema)           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Map & File Relationships

| File / Folder | Purpose |
|---|---|
| `app/page.tsx` | Main orchestrator: switches views between Roham Cyber Portal, Technical Reader, and Admin Panel. |
| `app/[section]/page.tsx` | Clean URL routing for portal tabs (`/blog`, `/courses`, `/radar`, `/anti-stealer`, `/services`). |
| `app/layout.tsx` | Root layout with font imports (Vazirmatn & JetBrains Mono) and metadata. |
| `components/ChapterViewer.tsx` | Markdown-ish reader rendering engine. Owns RTL/LTR detection, code blocks, tables, quotes, figures. |
| `components/AdminPanel.tsx` | Administrator console connected directly to `api/admin.php`. |
| `components/roham/AdminContentManager.tsx` | CMS & Post Manager v2.0 with Markdown editor, Live Preview, and unified `upsert_content` client. |
| `components/roham/MarkdownPreview.tsx` | Secure, syntax-highlighted client-side live preview component for Markdown content. |
| `components/roham/*` | Components of the Roham Enterprise Security Portal (Blog, Radar, Anti-Stealer, Courses, etc.). |
| `lib/authSync.ts` | Pure client API connector for authentication, leads, and reading sync via PHP endpoints. |
| `lib/contentStore.ts` | Content store connector communicating with `api/content.php` (MySQL-backed) supporting v2.0 `upsert_content`. |
| `lib/exportStandaloneHtml.ts`| Generates self-contained, single-file offline HTML exports of books. |
| `lib/exportImport.ts` | Portable JSON backup & restore for reader notes, highlights, and vocabulary. |
| `types/reader.ts` | TypeScript interfaces for `Book`, `Chapter`, `Highlight`, `SavedWord`, etc. |

### Backend API (PHP on cPanel)

| File (`public/api/`) | Responsibility |
|---|---|
| `config.php` | MySQL database credentials (`corpel_roham`), token secrets, API keys, and default admin configuration. |
| `db.php` | MySQL PDO connection helper, automatic schema initialization, and auth verification. |
| `content.php` | REST API gateway for content actions (`upsert_content`, `get_all`, `schema`, `openapi`, legacy mapping). |
| `content-service.php` | Core v2.0 engine: Markdown parser, XSS sanitizer, JSON Schema validator, Idempotency, Rate Limiting & Audit Logging. |
| `schema.sql` / `migration.sql` | Normalized relational schema (`contents`, `categories`, `tags`, `content_tags`, `content_audit_logs`, `content_idempotency`). |
| `migrate.php` | Automated migration CLI/API migrating legacy nested JSON posts to normalized v2 schema. |
| `auto-publisher.php` | Automated agent daemon for automated AI threat intel harvesting and posting. |
| `auth.php` | User registration, login, profile update, and active session check (`me`). |
| `sync.php` | Cloud synchronization of reading progress, highlights, and vocabulary per user account. |
| `leads.php` | Lead capture for consultation requests, course enrollments, and beta signups. |
| `translate.php` | Offline technical dictionary lookups and context translation. |
| `admin.php` | Administrative dashboard metrics, user role management, and site settings. |
| `public-config.php` | Publicly accessible site settings (announcements, registration flags). |

---

## 3. Data Flow

### Book Pipeline Flow
```
book.pdf
   │  (scripts/pipeline/extractPdf.js — config-driven, pdfjs-dist)
   ▼
tmp_books/<bookId>/*.md            ← intermediate markdown
   │  (scripts/pipeline/buildBook.js)
   ▼
data/<bookFolder>/chapterN.ts      ← typed Chapter objects
data/<bookId>Book.ts               ← Book object (imports all chapters)
   │  (registered in data/sampleBooks.ts)
   ▼
data/sampleBooks.ts  ──►  app/page.tsx  ──►  components/ChapterViewer.tsx
```

### Content Ingestion Flow (v2.0 REST API & Admin CMS)
```
AI Bot / Script / Admin Panel
   │
   │  POST /api/content.php (action: upsert_content)
   │  Headers: X-API-KEY / Bearer, Idempotency-Key
   ▼
public/api/content.php  (Gateway, Route Dispatcher)
   │
   ▼
public/api/content-service.php
   ├── 1. Rate Limiting Check (Token Bucket / Sliding Window)
   ├── 2. Idempotency Key Validation (Returns cached response if duplicate)
   ├── 3. JSON Schema & Data Type Validation
   ├── 4. Markdown Parsing (RohamMarkdown) & XSS Sanitization
   ├── 5. Server-side Slug, ISO 8601 Timestamp & Category Normalization
   ├── 6. Normalized DB Persistence (contents, categories, tags, content_tags)
   └── 7. Audit Logging (content_audit_logs)
   │
   ▼
Next.js Frontend (BlogSection / ThreatRadarSection / AdminContentManager)
   ├── Renders verified HTML & MarkdownPreview
   └── Preserves RTL Persian typography with LTR code fences
```

---

## 4. State & Persistence Principles

1. **Direct Backend Authority:** All persistent data (accounts, leads, cloud sync, articles, radar news) lives in the cPanel MySQL database (`corpel_roham`) via PHP endpoints.
2. **Normalized Content Architecture:** Articles are stored with clean metadata and `body_markdown`, with server-rendered `rendered_html` for high-performance reading and SEO.
3. **Local Session Caching:** User tokens (`roham_auth_token`) and cached user identities (`roham_auth_user_cache`) are stored in browser `localStorage` to maintain sessions across page reloads.
4. **No Mock/Emulated DB Layers:** The client does not maintain parallel fake databases. Any server response or error is transparently reported.
5. **Bilingual RTL/LTR Isolation:** Code blocks, monospace snippets, and tables are strictly `dir="ltr"`. Persian text is strictly `dir="rtl"`.
6. **Backward Compatibility Guarantee:** Legacy actions `save_blog` and `save_news` are mapped transparently into `upsert_content`.
