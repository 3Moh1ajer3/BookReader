# AGENTS.md - System & Coding Guidelines for AI Agents

Welcome to the **Roham Cyber Security Portal & Interactive Technical Reader** codebase.
This project is built with Next.js 15+ (React 19, Tailwind CSS v4) for the frontend (exported statically) and a dedicated **PHP 8.x + MySQL backend** for hosting on cPanel.

This document serves as the single source of truth for autonomous AI agents (e.g., Claude Code, Cursor, Windsurf, Devin, Copilot, Antigravity) to understand, modify, test, and extend this codebase reliably and simply.

---

## 1. Project Overview & Architecture

### Core Purpose
- **Roham Cyber Security Portal:** Comprehensive cybersecurity platform featuring Anti-Stealer research, SOC advisory, Threat Radar breaking alerts, technical deep-dive blog, training courses, and enterprise consultation intake.
- **Rich Technical Reader:** Advanced e-reader designed for engineering/security books (such as *From Day Zero to Zero Day*), with syntax-highlighted code blocks, tables, callouts, and bilingual (EN / FA) synchronization.
- **Admin Management Console:** Unified administrative panel for managing users, roles, leads, content publishing, and site settings.
- **Pure Single Backend (PHP + MySQL):** All API services and persistence are powered by PHP endpoints under `public/api/` connected to a MySQL database on cPanel. There are no redundant Node.js API routes or fake local DB emulation layers.

### Tech Stack
- **Frontend Framework:** Next.js 15+ (App Router) + React 19
- **Export Target:** Static HTML export (`output: 'export'` in `next.config.ts`)
- **Backend Stack:** PHP 8.x + MySQL (PDO) located in `public/api/*.php`
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`) with `@tailwindcss/typography`
- **Icons:** `lucide-react` (Strictly named imports; do not create custom SVG icons)
- **Animations:** `motion` (`motion/react`)

---

## 2. Directory Structure & Key Files

```
├── app/
│   ├── [section]/page.tsx      # Dynamic clean URL route handler (/blog, /courses, /radar, etc.)
│   ├── globals.css             # Tailwind v4 import & font definitions
│   ├── layout.tsx              # Root layout, Google Fonts (Vazirmatn & JetBrains Mono)
│   ├── not-found.tsx           # Custom 404 page
│   └── page.tsx                # Main portal & reader application orchestrator
├── components/
│   ├── AdminPanel.tsx          # Comprehensive cPanel management console
│   ├── AuthAccountModal.tsx    # User login & registration modal dialog
│   ├── ChapterViewer.tsx       # Reader rendering engine (RTL/LTR, code, quotes, tables)
│   ├── ReaderNavbar.tsx        # Top reader header with progress, theme, font size, language
│   ├── roham/                  # Roham Cyber Portal modular components
│   └── ...
├── data/
│   ├── book/                   # English chapters of "From Day Zero to Zero Day"
│   ├── book_fa/                # Complete Persian translation chapters
│   ├── sampleBooks.ts          # Registry of all available books (SAMPLE_BOOKS)
│   └── cyberContent.ts         # Base cybersecurity articles & catalog data
├── lib/
│   ├── authSync.ts             # Direct client-side API connector for PHP auth & sync
│   ├── contentStore.ts         # Direct connector for PHP content & threat radar
│   ├── exportStandaloneHtml.ts # Standalone offline HTML book generator
│   └── utils.ts                # Classnames merger (clsx + tailwind-merge)
├── public/
│   ├── api/                    # Pure PHP 8.x + MySQL Backend
│   │   ├── admin.php           # Admin metrics, user CRUD, settings
│   │   ├── auth.php            # User authentication (register, login, me, profile)
│   │   ├── config.php          # MySQL connection settings & auth secret
│   │   ├── content.php         # Blog posts and threat radar articles API
│   │   ├── db.php              # PDO helper & table auto-initialization
│   │   ├── leads.php           # Consultation, course, and beta lead submission
│   │   ├── public-config.php   # Public site settings (announcements, flags)
│   │   ├── schema.sql          # Relational MySQL table schema
│   │   ├── sync.php            # Cloud sync of reading progress, highlights, vocab
│   │   └── translate.php       # Technical offline dictionary & translation endpoint
│   ├── podcasts/               # Audio podcast files for book chapters
│   └── roham-cpanel-deploy.zip # Deployable archive for cPanel public_html
├── docs/
│   ├── ARCHITECTURE.md         # File map, dependency graph, system architecture
│   ├── AGENT_GUIDE.md          # Context loading order, mandatory checklists
│   └── BOOK_PIPELINE.md        # Step-by-step guide for adding new books
└── AGENTS.md                   # This instruction file
```

---

## 3. Critical Rules & Invariants

When editing or extending this codebase, agents **MUST** follow these rules:

### 1. Single Pure Backend (PHP + MySQL)
- The backend is written in PHP (`public/api/*.php`) and communicates with MySQL (`corpel_roham`).
- Do NOT add Node.js server routes under `app/api/`.
- Do NOT introduce fake local database emulation layers or mock database fallbacks.
- Front-end API connectors (`lib/authSync.ts`, `lib/contentStore.ts`) must communicate directly with `/api/*.php`.

### 2. Dual-Language & Smart RTL/LTR Handling
- Chapters and articles can be in English (`en`) or Persian (`fa`).
- Code blocks (```` ```...``` ````), inline code (`` `...` ``), terminal commands, and technical tables **MUST ALWAYS** maintain `dir="ltr"` and `font-mono`.
- Persian titles and paragraphs **MUST** have `dir="rtl"` and right alignment.

### 3. Verification & Build
- Always run `npm run lint` for fast type & syntax checking.
- Run `npm run build` to verify the static production export.
- When adding icons from Lucide, use named imports: `import { ShieldCheck, Users } from "lucide-react";`.
- For animations, import from `motion/react`, never legacy `framer-motion`.
