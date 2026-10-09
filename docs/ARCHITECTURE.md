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

### Frontend Runtime (Client-Side)

| File / Folder | Purpose |
|---|---|
| `app/page.tsx` | Main orchestrator: switches views between Roham Cyber Portal, Technical Reader, and Admin Panel. |
| `app/[section]/page.tsx` | Clean URL routing for portal tabs (`/blog`, `/courses`, `/radar`, `/anti-stealer`, `/services`). |
| `app/layout.tsx` | Root layout with font imports (Vazirmatn & JetBrains Mono) and metadata. |
| `components/ChapterViewer.tsx` | Markdown-ish reader rendering engine. Owns RTL/LTR detection, code blocks, tables, quotes, figures. |
| `components/AdminPanel.tsx` | Administrator console connected directly to `api/admin.php`. |
| `components/roham/*` | Components of the Roham Enterprise Security Portal. |
| `lib/authSync.ts` | Pure client API connector for authentication, leads, and reading sync via PHP endpoints. |
| `lib/contentStore.ts` | Content store connector communicating with `api/content.php` (MySQL-backed). |
| `lib/exportStandaloneHtml.ts`| Generates self-contained, single-file offline HTML exports of books. |
| `lib/exportImport.ts` | Portable JSON backup & restore for reader notes, highlights, and vocabulary. |
| `types/reader.ts` | TypeScript interfaces for `Book`, `Chapter`, `Highlight`, `SavedWord`, etc. |

### Backend API (PHP on cPanel)

| File (`public/api/`) | Responsibility |
|---|---|
| `config.php` | MySQL database credentials (`corpel_roham`), token secrets, and default admin configuration. |
| `db.php` | MySQL PDO connection helper, automatic schema initialization, and auth verification. |
| `auth.php` | User registration, login, profile update, and active session check (`me`). |
| `sync.php` | Cloud synchronization of reading progress, highlights, and vocabulary per user account. |
| `content.php` | CRUD operations for cybersecurity blog posts and threat radar alerts. |
| `leads.php` | Lead capture for consultation requests, course enrollments, and beta signups. |
| `translate.php` | Offline technical dictionary lookups and context translation. |
| `admin.php` | Administrative dashboard metrics, user role management, and site settings. |
| `public-config.php` | Publicly accessible site settings (announcements, registration flags). |
| `schema.sql` | SQL table schemas for MySQL database import. |

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

---

## 4. State & Persistence Principles

1. **Direct Backend Authority:** All persistent data (accounts, leads, cloud sync, articles) lives in the cPanel MySQL database via PHP endpoints.
2. **Local Session Caching:** User tokens (`roham_auth_token`) and cached user identities (`roham_auth_user_cache`) are stored in browser `localStorage` to maintain sessions across page reloads.
3. **No Mock/Emulated DB Layers:** The client does not maintain parallel fake databases. Any server response or error is transparently reported.
4. **Bilingual RTL/LTR Isolation:** Code blocks, monospace snippets, and tables are strictly `dir="ltr"`. Persian text is strictly `dir="rtl"`.
