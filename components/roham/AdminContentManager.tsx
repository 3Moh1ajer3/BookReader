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
} from "lucide-react";
import {
  BlogPost,
  BlogSectionItem,
  NewsArticle,
  NewsSectionItem,
  NewsIoC,
  fetchContentStore,
  adminSaveBlogPost,
  adminDeleteBlogPost,
  adminSaveNewsArticle,
  adminDeleteNewsArticle,
  adminResetDefaultContent,
} from "@/lib/contentStore";

interface AdminContentManagerProps {
  onOpenBlogPost?: (slug: string) => void;
  onOpenNewsArticle?: (slug: string) => void;
}

export const AdminContentManager: React.FC<AdminContentManagerProps> = ({
  onOpenBlogPost,
  onOpenNewsArticle,
}) => {
  const [cmsSubTab, setCmsSubTab] = useState<"blog" | "news">("blog");
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  // Editor state
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [editingNews, setEditingNews] = useState<NewsArticle | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchContentStore().then((res) => {
      if (!cancelled) {
        setBlogPosts(res.blogPosts);
        setNewsArticles(res.newsArticles);
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
  // BLOG CRUD HANDLERS
  // ============================================================================
  const handleStartNewBlog = () => {
    const nowId = `post-${Date.now()}`;
    setEditingBlog({
      id: nowId,
      title: "",
      subtitle: "",
      slug: `roham-article-${Date.now().toString().slice(-5)}`,
      summary: "",
      category: "استیلر و بدافزار",
      readTime: "۸ دقیقه",
      date: "مهر ۱۴۰۴",
      author: "تیم پژوهش امنیت سایبری رهام",
      authorRole: "Roham Threat Research Labs",
      difficulty: "تخصصی (Deep-Dive)",
      tags: ["Infostealer", "Hardening"],
      status: "published",
      isFeatured: false,
      views: 1,
      relatedChapterId: "chapter-1",
      tldr: [
        "نکته کلیدی اول خلاصه مدیریتی مقاله در اینجا قرار می‌گیرد.",
        "نکته کلیدی دوم جهت مطالعه سریع مدیران فنی.",
      ],
      content: {
        intro: "",
        sections: [
          {
            id: "sec-1",
            heading: "۱. بخش اول: کالبدشکافی فنی و معماری",
            paragraphs: [""],
            codeSnippet: "",
            codeLanguage: "bash",
            callout: "",
          },
        ],
        conclusion: "",
        actionableTakeaways: [
          "اقدام دفاعی اول در چک‌لیست پایانی مقاله",
          "اقدام دفاعی دوم جهت امن‌سازی ایستگاه کاری",
        ],
      },
    });
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog) return;
    if (!editingBlog.title.trim() || !editingBlog.summary.trim()) {
      showToast("error", "لطفاً عنوان و خلاصه مقاله را وارد نمایید.");
      return;
    }

    setSaving(true);
    const cleanPost: BlogPost = {
      ...editingBlog,
      slug:
        editingBlog.slug.trim() ||
        `article-${Date.now().toString().slice(-6)}`,
      tldr: editingBlog.tldr.map((t) => t.trim()).filter(Boolean),
      tags: editingBlog.tags.map((t) => t.trim()).filter(Boolean),
      content: {
        ...editingBlog.content,
        actionableTakeaways: editingBlog.content.actionableTakeaways
          .map((a) => a.trim())
          .filter(Boolean),
        sections: editingBlog.content.sections.map((s, idx) => ({
          ...s,
          id: s.id || `sec-${idx + 1}`,
          paragraphs: s.paragraphs.map((p) => p.trim()).filter(Boolean),
        })),
      },
    };

    const res = await adminSaveBlogPost(cleanPost);
    setSaving(false);
    if (res.ok) {
      if (res.blogPosts) setBlogPosts(res.blogPosts);
      setEditingBlog(null);
      showToast("success", res.message || "مقاله ذخیره شد.");
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
  // NEWS CRUD HANDLERS
  // ============================================================================
  const handleStartNewNews = () => {
    const nowId = `news-${Date.now()}`;
    setEditingNews({
      id: nowId,
      slug: `security-advisory-${Date.now().toString().slice(-5)}`,
      title: "",
      subtitle: "",
      category: "urgent",
      categoryLabel: "هشدار فوری و فعال",
      severity: "CRITICAL",
      status: "published",
      isBreaking: false,
      date: "مهر ۱۴۰۴",
      readTime: "۵ دقیقه",
      author: "تحریریه امنیت سایبری و هوش تهدیدات رهام",
      source: "Roham Threat Intel / CERT",
      views: 1,
      cveIds: ["CVE-2025-XXXX"],
      cvssScore: "9.4",
      affectedProducts: ["Windows 10 / 11", "Chromium Browsers"],
      exploitStatus: "در حال بهره‌برداری فعال در حیات‌وحش",
      summary: "",
      keyHighlights: [
        "یافته کلیدی اول این گزارش خبری برای مدیران امنیت",
        "یافته کلیدی دوم در خصوص نحوه انتشار یا بهره‌برداری",
      ],
      sections: [
        {
          heading: "کالبدشکافی فنی حمله و بردار نفوذ",
          paragraphs: [""],
          codeSnippet: "",
          codeLanguage: "powershell",
          callout: "",
        },
      ],
      iocs: [
        {
          type: "Process/Command",
          value: "powershell.exe -w hidden -enc ...",
          description: "الگوی اجرای دستور مشکوک در سیستم مقصد",
        },
      ],
      mitigationSteps: [
        "اعمال فوری آخرین وصله امنیتی منتشرشده توسط سازنده",
        "پایش لاگ‌های SIEM و مسدودسازی شاخص‌های آلودگی (IoCs)",
      ],
      timeline: [{ time: "مهر ۱۴۰۴", event: "ثبت و انتشار بولتن امنیتی در رادار رهام" }],
      tags: ["ZeroDay", "SOC Alert"],
    });
  };

  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNews) return;
    if (!editingNews.title.trim() || !editingNews.summary.trim()) {
      showToast("error", "لطفاً عنوان و خلاصه گزارش خبری را وارد نمایید.");
      return;
    }

    const catLabels: Record<NewsArticle["category"], string> = {
      urgent: "هشدار فوری و فعال",
      zeroday: "آسیب‌پذیری روز صفر (0-Day)",
      malware: "بدافزار و استیلر",
      apt: "حملات هدفمند و APT",
      cloud: "امنیت ابری و زنجیره تامین",
    };

    setSaving(true);
    const cleanArticle: NewsArticle = {
      ...editingNews,
      categoryLabel: catLabels[editingNews.category] || editingNews.categoryLabel,
      slug:
        editingNews.slug.trim() ||
        `news-${Date.now().toString().slice(-6)}`,
      cveIds: editingNews.cveIds.map((c) => c.trim()).filter(Boolean),
      affectedProducts: editingNews.affectedProducts.map((p) => p.trim()).filter(Boolean),
      keyHighlights: editingNews.keyHighlights.map((k) => k.trim()).filter(Boolean),
      mitigationSteps: editingNews.mitigationSteps.map((m) => m.trim()).filter(Boolean),
      tags: editingNews.tags.map((t) => t.trim()).filter(Boolean),
      sections: editingNews.sections.map((s) => ({
        ...s,
        paragraphs: s.paragraphs.map((p) => p.trim()).filter(Boolean),
      })),
      iocs: editingNews.iocs.filter((i) => i.value.trim() !== ""),
    };

    const res = await adminSaveNewsArticle(cleanArticle);
    setSaving(false);
    if (res.ok) {
      if (res.newsArticles) setNewsArticles(res.newsArticles);
      setEditingNews(null);
      showToast("success", res.message || "گزارش خبری ذخیره شد.");
    } else {
      showToast("error", res.error || "خطا در ذخیره گزارش خبری");
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
          : "خبر به حالت پیش‌نویس درآمد."
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
  // RENDER: BLOG POST EDITOR FORM
  // ============================================================================
  if (editingBlog) {
    return (
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-extrabold text-white">
              ویرایشگر تخصصی مقالات وبلاگ فنی رهام
            </h2>
          </div>
          <button
            onClick={() => setEditingBlog(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>انصراف و بازگشت</span>
          </button>
        </div>

        <form onSubmit={handleSaveBlog} className="space-y-6 text-xs">
          {/* Basic Meta Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="font-bold text-slate-300 block">عنوان اصلی مقاله *</label>
              <input
                type="text"
                required
                value={editingBlog.title}
                onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                placeholder="مثال: کالبدشکافی عمیق بدافزارهای استیلر مدرن..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="font-bold text-slate-300 block">زیرعنوان تحلیلی (Subtitle)</label>
              <input
                type="text"
                value={editingBlog.subtitle}
                onChange={(e) => setEditingBlog({ ...editingBlog, subtitle: e.target.value })}
                placeholder="توضیح تکمیلی زیر عنوان اصلی در هدر مقاله..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 block">دسته‌بندی تخصصی</label>
              <select
                value={editingBlog.category}
                onChange={(e) => setEditingBlog({ ...editingBlog, category: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="استیلر و بدافزار">استیلر و بدافزار</option>
                <option value="دفاع و هاردنینگ">دفاع و هاردنینگ</option>
                <option value="هویت و سشن‌ها">هویت و سشن‌ها</option>
                <option value="تحقیقات زیرودی">تحقیقات زیرودی</option>
              </select>
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
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
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
                style={{ direction: "ltr", textAlign: "left" }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-emerald-400 font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">زمان مطالعه</label>
                <input
                  type="text"
                  value={editingBlog.readTime}
                  onChange={(e) => setEditingBlog({ ...editingBlog, readTime: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">تاریخ انتشار</label>
                <input
                  type="text"
                  value={editingBlog.date}
                  onChange={(e) => setEditingBlog({ ...editingBlog, date: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 block">نویسنده / واحد پژوهشی</label>
              <input
                type="text"
                value={editingBlog.author}
                onChange={(e) => setEditingBlog({ ...editingBlog, author: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 block">
                برچسب‌ها (جداشده با کاما انگلیسی ,)
              </label>
              <input
                type="text"
                value={editingBlog.tags.join(", ")}
                onChange={(e) =>
                  setEditingBlog({
                    ...editingBlog,
                    tags: e.target.value.split(",").map((s) => s.trim()),
                  })
                }
                style={{ direction: "ltr", textAlign: "left" }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 font-mono"
              />
            </div>
          </div>

          {/* Status & Featured Toggles */}
          <div className="flex flex-wrap items-center gap-6 p-4 rounded-xl bg-slate-950 border border-slate-800">
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
              <span className="font-bold text-amber-300">
                نمایش به عنوان مقاله ویژه سرخط (Featured Spotlight)
              </span>
            </label>
          </div>

          {/* Summary & Intro */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 block">
                چکیده کوتاه مقاله (نمایش در کارت‌های صفحه اصلی وبلاگ) *
              </label>
              <textarea
                rows={2}
                required
                value={editingBlog.summary}
                onChange={(e) => setEditingBlog({ ...editingBlog, summary: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-slate-200 leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-emerald-400 block">
                خلاصه مدیریتی مقاله (TL;DR — هر خط یک نکته کلیدی)
              </label>
              <textarea
                rows={3}
                value={editingBlog.tldr.join("\n")}
                onChange={(e) =>
                  setEditingBlog({ ...editingBlog, tldr: e.target.value.split("\n") })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-slate-200 leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 block">مقدمه تحلیلی مقاله (Intro)</label>
              <textarea
                rows={3}
                value={editingBlog.content.intro}
                onChange={(e) =>
                  setEditingBlog({
                    ...editingBlog,
                    content: { ...editingBlog.content, intro: e.target.value },
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-slate-200 leading-relaxed"
              />
            </div>
          </div>

          {/* Dynamic Article Sections */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-extrabold text-white">
                بخش‌ها و سرفصل‌های تخصصی مقاله ({editingBlog.content.sections.length})
              </label>
              <button
                type="button"
                onClick={() => {
                  const nextSec: BlogSectionItem = {
                    id: `sec-${editingBlog.content.sections.length + 1}`,
                    heading: `${editingBlog.content.sections.length + 1}. عنوان بخش جدید`,
                    paragraphs: [""],
                    codeSnippet: "",
                    codeLanguage: "bash",
                    callout: "",
                  };
                  setEditingBlog({
                    ...editingBlog,
                    content: {
                      ...editingBlog.content,
                      sections: [...editingBlog.content.sections, nextSec],
                    },
                  });
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 font-bold cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>افزودن بخش جدید به مقاله</span>
              </button>
            </div>

            {editingBlog.content.sections.map((sec, sIdx) => (
              <div
                key={sIdx}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-emerald-400 font-bold">
                    Section #{sIdx + 1}
                  </span>
                  {editingBlog.content.sections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const next = editingBlog.content.sections.filter((_, i) => i !== sIdx);
                        setEditingBlog({
                          ...editingBlog,
                          content: { ...editingBlog.content, sections: next },
                        });
                      }}
                      className="text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                    >
                      <MinusCircle className="w-3.5 h-3.5" />
                      <span>حذف این بخش</span>
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={sec.heading}
                  onChange={(e) => {
                    const next = [...editingBlog.content.sections];
                    next[sIdx] = { ...sec, heading: e.target.value };
                    setEditingBlog({
                      ...editingBlog,
                      content: { ...editingBlog.content, sections: next },
                    });
                  }}
                  placeholder="عنوان این بخش (در فهرست مطالب کناری مقاله نمایش داده می‌شود)"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-bold"
                />

                <div className="space-y-1">
                  <label className="text-slate-400 block">
                    متن پاراگراف‌ها (هر خط یک پاراگراف مستقل)
                  </label>
                  <textarea
                    rows={4}
                    value={sec.paragraphs.join("\n")}
                    onChange={(e) => {
                      const next = [...editingBlog.content.sections];
                      next[sIdx] = { ...sec, paragraphs: e.target.value.split("\n") };
                      setEditingBlog({
                        ...editingBlog,
                        content: { ...editingBlog.content, sections: next },
                      });
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-200 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-1 space-y-1">
                    <label className="text-slate-400 block">زبان قطعه کد (اختیاری)</label>
                    <input
                      type="text"
                      value={sec.codeLanguage || ""}
                      onChange={(e) => {
                        const next = [...editingBlog.content.sections];
                        next[sIdx] = { ...sec, codeLanguage: e.target.value };
                        setEditingBlog({
                          ...editingBlog,
                          content: { ...editingBlog.content, sections: next },
                        });
                      }}
                      placeholder="python, sql, bash..."
                      style={{ direction: "ltr", textAlign: "left" }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-mono"
                    />
                  </div>
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-slate-400 block">قطعه کد فنی یا دستور ترمینال (LTR)</label>
                    <textarea
                      rows={3}
                      value={sec.codeSnippet || ""}
                      onChange={(e) => {
                        const next = [...editingBlog.content.sections];
                        next[sIdx] = { ...sec, codeSnippet: e.target.value };
                        setEditingBlog({
                          ...editingBlog,
                          content: { ...editingBlog.content, sections: next },
                        });
                      }}
                      style={{ direction: "ltr", textAlign: "left" }}
                      className="w-full bg-black border border-slate-800 rounded-xl p-3 text-emerald-300 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-amber-400 block">نکته هشدار یا باکس Callout (اختیاری)</label>
                  <input
                    type="text"
                    value={sec.callout || ""}
                    onChange={(e) => {
                      const next = [...editingBlog.content.sections];
                      next[sIdx] = { ...sec, callout: e.target.value };
                      setEditingBlog({
                        ...editingBlog,
                        content: { ...editingBlog.content, sections: next },
                      });
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-amber-200"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Conclusion & Takeaways */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 block">جمع‌بندی نهایی مقاله</label>
              <textarea
                rows={3}
                value={editingBlog.content.conclusion}
                onChange={(e) =>
                  setEditingBlog({
                    ...editingBlog,
                    content: { ...editingBlog.content, conclusion: e.target.value },
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-slate-200 leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-emerald-400 block">
                چک‌لیست عملیاتی دفاعی در پایان مقاله (هر خط یک مورد)
              </label>
              <textarea
                rows={3}
                value={editingBlog.content.actionableTakeaways.join("\n")}
                onChange={(e) =>
                  setEditingBlog({
                    ...editingBlog,
                    content: {
                      ...editingBlog.content,
                      actionableTakeaways: e.target.value.split("\n"),
                    },
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-slate-200 leading-relaxed"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setEditingBlog(null)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "در حال ذخیره در دیتابیس..." : "ذخیره و انتشار مقاله وبلاگ"}</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ============================================================================
  // RENDER: SECURITY NEWS ARTICLE EDITOR FORM
  // ============================================================================
  if (editingNews) {
    return (
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <Radio className="w-5 h-5 text-rose-400" />
            <h2 className="text-base font-extrabold text-white">
              ویرایشگر گزارش‌های خبری و بولتن رادار تهدیدات رهام
            </h2>
          </div>
          <button
            onClick={() => setEditingNews(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>انصراف و بازگشت</span>
          </button>
        </div>

        <form onSubmit={handleSaveNews} className="space-y-6 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="font-bold text-slate-300 block">تیتر اصلی خبر یا بولتن امنیتی *</label>
              <input
                type="text"
                required
                value={editingNews.title}
                onChange={(e) => setEditingNews({ ...editingNews, title: e.target.value })}
                placeholder="مثال: هشدار فوری: موج جدید حملات بدافزار استیلر..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="font-bold text-slate-300 block">لید / زیرعنوان خبر (Subtitle)</label>
              <input
                type="text"
                value={editingNews.subtitle}
                onChange={(e) => setEditingNews({ ...editingNews, subtitle: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 block">دسته‌بندی رادار خبری</label>
              <select
                value={editingNews.category}
                onChange={(e) =>
                  setEditingNews({
                    ...editingNews,
                    category: e.target.value as NewsArticle["category"],
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
              >
                <option value="urgent">هشدار فوری و فعال (Urgent)</option>
                <option value="zeroday">آسیب‌پذیری روز صفر (0-Day)</option>
                <option value="malware">بدافزار و استیلر (Malware)</option>
                <option value="apt">حملات هدفمند و APT</option>
                <option value="cloud">امنیت ابری و زنجیره تامین</option>
              </select>
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
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
              >
                <option value="CRITICAL">بحرانی (CRITICAL)</option>
                <option value="HIGH">شدت بالا (HIGH)</option>
                <option value="MEDIUM">متوسط (MEDIUM)</option>
                <option value="INFO">اطلاع‌رسانی (INFO)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 block">
                شناسه‌های CVE یا تکنیک MITRE (جداشده با کاما)
              </label>
              <input
                type="text"
                value={editingNews.cveIds.join(", ")}
                onChange={(e) =>
                  setEditingNews({
                    ...editingNews,
                    cveIds: e.target.value.split(",").map((s) => s.trim()),
                  })
                }
                style={{ direction: "ltr", textAlign: "left" }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-emerald-400 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">امتیاز CVSS</label>
                <input
                  type="text"
                  value={editingNews.cvssScore || ""}
                  onChange={(e) => setEditingNews({ ...editingNews, cvssScore: e.target.value })}
                  placeholder="9.8"
                  style={{ direction: "ltr", textAlign: "left" }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-rose-400 font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">تاریخ و ساعت</label>
                <input
                  type="text"
                  value={editingNews.date}
                  onChange={(e) => setEditingNews({ ...editingNews, date: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 block">وضعیت اکسپلویت در حیات‌وحش</label>
              <input
                type="text"
                value={editingNews.exploitStatus}
                onChange={(e) =>
                  setEditingNews({ ...editingNews, exploitStatus: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-rose-300"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 block">
                محصولات تحت تاثیر (جداشده با کاما)
              </label>
              <input
                type="text"
                value={editingNews.affectedProducts.join(", ")}
                onChange={(e) =>
                  setEditingNews({
                    ...editingNews,
                    affectedProducts: e.target.value.split(",").map((s) => s.trim()),
                  })
                }
                style={{ direction: "ltr", textAlign: "left" }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 font-mono"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap items-center gap-6 p-4 rounded-xl bg-slate-950 border border-slate-800">
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
              <span className="font-bold text-slate-200">انتشار عمومی در رادار تهدیدات</span>
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
              <span className="font-bold text-rose-400">
                نمایش در نوار خبر فوری بالای رادار (Breaking Threat)
              </span>
            </label>
          </div>

          {/* Summary & Highlights */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 block">خلاصه اصلی گزارش خبری *</label>
              <textarea
                rows={3}
                required
                value={editingNews.summary}
                onChange={(e) => setEditingNews({ ...editingNews, summary: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-slate-200 leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-emerald-400 block">
                نکات کلیدی خبر (Key Highlights — هر خط یک نکته)
              </label>
              <textarea
                rows={3}
                value={editingNews.keyHighlights.join("\n")}
                onChange={(e) =>
                  setEditingNews({
                    ...editingNews,
                    keyHighlights: e.target.value.split("\n"),
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-slate-200 leading-relaxed"
              />
            </div>
          </div>

          {/* News Story Sections */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-extrabold text-white">
                بخش‌های تحلیلی متن خبر ({editingNews.sections.length})
              </label>
              <button
                type="button"
                onClick={() => {
                  const nextSec: NewsSectionItem = {
                    heading: "بخش جدید تحلیل فنی",
                    paragraphs: [""],
                    codeSnippet: "",
                    codeLanguage: "powershell",
                    callout: "",
                  };
                  setEditingNews({
                    ...editingNews,
                    sections: [...editingNews.sections, nextSec],
                  });
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 font-bold cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>افزودن بخش به متن خبر</span>
              </button>
            </div>

            {editingNews.sections.map((sec, sIdx) => (
              <div
                key={sIdx}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-emerald-400 font-bold">
                    Story Block #{sIdx + 1}
                  </span>
                  {editingNews.sections.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setEditingNews({
                          ...editingNews,
                          sections: editingNews.sections.filter((_, i) => i !== sIdx),
                        })
                      }
                      className="text-rose-400 flex items-center gap-1 cursor-pointer"
                    >
                      <MinusCircle className="w-3.5 h-3.5" />
                      <span>حذف</span>
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={sec.heading}
                  onChange={(e) => {
                    const next = [...editingNews.sections];
                    next[sIdx] = { ...sec, heading: e.target.value };
                    setEditingNews({ ...editingNews, sections: next });
                  }}
                  placeholder="تیتر فرعی بخش"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-bold"
                />

                <textarea
                  rows={3}
                  value={sec.paragraphs.join("\n")}
                  onChange={(e) => {
                    const next = [...editingNews.sections];
                    next[sIdx] = { ...sec, paragraphs: e.target.value.split("\n") };
                    setEditingNews({ ...editingNews, sections: next });
                  }}
                  placeholder="متن گزارش (هر خط یک پاراگراف)"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-200 leading-relaxed"
                />

                <textarea
                  rows={2}
                  value={sec.codeSnippet || ""}
                  onChange={(e) => {
                    const next = [...editingNews.sections];
                    next[sIdx] = { ...sec, codeSnippet: e.target.value };
                    setEditingNews({ ...editingNews, sections: next });
                  }}
                  placeholder="نمونه دستور، لاگ یا کوئری شکار تهدید (اختیاری - LTR)"
                  style={{ direction: "ltr", textAlign: "left" }}
                  className="w-full bg-black border border-slate-800 rounded-xl p-3 text-emerald-300 font-mono"
                />
              </div>
            ))}
          </div>

          {/* IoCs & Mitigations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-rose-400">شاخص‌های آلودگی (IoCs)</label>
                <button
                  type="button"
                  onClick={() =>
                    setEditingNews({
                      ...editingNews,
                      iocs: [
                        ...editingNews.iocs,
                        { type: "SHA-256", value: "", description: "" },
                      ],
                    })
                  }
                  className="text-emerald-400 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>افزودن IoC</span>
                </button>
              </div>
              <div className="space-y-2">
                {editingNews.iocs.map((ioc, iIdx) => (
                  <div
                    key={iIdx}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={ioc.type}
                        onChange={(e) => {
                          const next = [...editingNews.iocs];
                          next[iIdx] = { ...ioc, type: e.target.value };
                          setEditingNews({ ...editingNews, iocs: next });
                        }}
                        placeholder="نوع (SHA-256, Domain...)"
                        style={{ direction: "ltr", textAlign: "left" }}
                        className="w-1/3 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-emerald-400 font-mono"
                      />
                      <input
                        type="text"
                        value={ioc.value}
                        onChange={(e) => {
                          const next = [...editingNews.iocs];
                          next[iIdx] = { ...ioc, value: e.target.value };
                          setEditingNews({ ...editingNews, iocs: next });
                        }}
                        placeholder="مقدار شاخص..."
                        style={{ direction: "ltr", textAlign: "left" }}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-amber-300 font-mono"
                      />
                    </div>
                    <input
                      type="text"
                      value={ioc.description}
                      onChange={(e) => {
                        const next = [...editingNews.iocs];
                        next[iIdx] = { ...ioc, description: e.target.value };
                        setEditingNews({ ...editingNews, iocs: next });
                      }}
                      placeholder="توضیح شاخص آلودگی..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-emerald-400 block">
                گام‌های مهار و امن‌سازی (هر خط یک اقدام عملیاتی)
              </label>
              <textarea
                rows={6}
                value={editingNews.mitigationSteps.join("\n")}
                onChange={(e) =>
                  setEditingNews({
                    ...editingNews,
                    mitigationSteps: e.target.value.split("\n"),
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-slate-200 leading-relaxed"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setEditingNews(null)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "در حال ذخیره در دیتابیس..." : "ذخیره و انتشار در رادار خبری"}</span>
            </button>
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
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <span>سیستم مدیریت محتوای پویا (CMS) — وبلاگ تخصصی و رادار اخبار</span>
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            تمامی مقالات وبلاگ و اخبار امنیتی در جدول <code className="text-emerald-400 font-mono">roham_content</code> دیتابیس MySQL هاست شما ذخیره می‌شوند و به صورت تمام‌صفحه قابل مطالعه و اشتراک‌گذاری هستند.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <button
              onClick={() => setCmsSubTab("blog")}
              className={`px-3.5 py-2 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                cmsSubTab === "blog"
                  ? "bg-emerald-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>مقالات وبلاگ ({blogPosts.length})</span>
            </button>
            <button
              onClick={() => setCmsSubTab("news")}
              className={`px-3.5 py-2 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                cmsSubTab === "news"
                  ? "bg-rose-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>اخبار و رادار تهدیدات ({newsArticles.length})</span>
            </button>
          </div>

          {cmsSubTab === "blog" ? (
            <button
              onClick={handleStartNewBlog}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>نوشتن مقاله جدید</span>
            </button>
          ) : (
            <button
              onClick={handleStartNewNews}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>انتشار خبر امنیتی جدید</span>
            </button>
          )}

          <button
            onClick={handleResetAllDefaults}
            className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-xs cursor-pointer"
            title="بازنشانی مقالات پیش‌فرض"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

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
                    onClick={() => setEditingBlog(post)}
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
                    onClick={() => setEditingNews(article)}
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
