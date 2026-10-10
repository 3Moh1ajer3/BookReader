"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Radio,
  Clock,
  Search,
  ArrowLeft,
  ArrowRight,
  Copy,
  Check,
  Bookmark,
  Share2,
  Printer,
  Terminal,
  Eye,
  Sliders,
  Edit3,
  ChevronLeft,
  ExternalLink,
  X,
  Sparkles,
  Tag,
  List,
} from "lucide-react";
import {
  NewsArticle,
  ContentCategory,
  DEFAULT_NEWS_ARTICLES,
  DEFAULT_CATEGORIES,
  fetchContentStore,
  incrementContentView,
} from "@/lib/contentStore";

export type { NewsArticle };

interface ThreatRadarSectionProps {
  onBackToHome?: () => void;
  onOpenReader?: () => void;
  onOpenConsultation?: () => void;
  onOpenEarlyAccess?: () => void;
  isAdmin?: boolean;
  onOpenAdminCms?: () => void;
  initialNewsSlug?: string | null;
  portalTheme?: "light" | "dark";
}

type ReaderCanvasTheme = "slate" | "oled" | "sepia" | "light";

const toPersianDigits = (num: number | string): string => {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(num).replace(/\d/g, (d) => persianDigits[Number(d)]);
};

export const ThreatRadarSection: React.FC<ThreatRadarSectionProps> = ({
  onBackToHome,
  isAdmin,
  onOpenAdminCms,
  initialNewsSlug,
  portalTheme = "light",
}) => {
  const isDark = portalTheme === "dark";
  const [articles, setArticles] = useState<NewsArticle[]>(DEFAULT_NEWS_ARTICLES);
  const [categories, setCategories] = useState<ContentCategory[]>(DEFAULT_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>("همه");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeNewsSlug, setActiveNewsSlug] = useState<string | null>(() => {
    if (initialNewsSlug) return initialNewsSlug;
    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams(window.location.search);
        return params.get("news");
      } catch {}
    }
    return null;
  });

  // Reader Canvas Themes (Identical to Blog Reader)
  const [canvasTheme, setCanvasTheme] = useState<ReaderCanvasTheme>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedTheme = localStorage.getItem("roham_blog_reader_theme") as ReaderCanvasTheme | null;
        if (savedTheme && ["slate", "oled", "sepia", "light"].includes(savedTheme)) {
          return savedTheme;
        }
      } catch {}
    }
    return portalTheme === "dark" ? "slate" : "light";
  });

  const [fontSize, setFontSize] = useState<number>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedSize = Number(localStorage.getItem("roham_blog_reader_fontsize"));
        if (savedSize >= 14 && savedSize <= 24) return savedSize;
      } catch {}
    }
    return 17;
  });

  const [savedIds, setSavedIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = JSON.parse(localStorage.getItem("roham_saved_news_articles") || "[]");
        if (Array.isArray(saved)) return saved;
      } catch {}
    }
    return [];
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedCodeKey, setCopiedCodeKey] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [activeSectionId, setActiveSectionId] = useState<string>("");
  const [mobileTocOpen, setMobileTocOpen] = useState<boolean>(false);
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState<boolean>(false);

  // Load content & categories
  useEffect(() => {
    let cancelled = false;
    fetchContentStore().then((res) => {
      if (!cancelled) {
        if (res.newsArticles && res.newsArticles.length > 0) {
          const visible = isAdmin
            ? res.newsArticles
            : res.newsArticles.filter((n) => n.status !== "draft");
          setArticles(visible.length > 0 ? visible : DEFAULT_NEWS_ARTICLES);
        }
        if (res.categories && res.categories.length > 0) {
          setCategories(res.categories);
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  // Sync browser URL
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setActiveNewsSlug(params.get("news"));
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const activeArticle = useMemo(() => {
    if (!activeNewsSlug) return null;
    return articles.find((a) => a.slug === activeNewsSlug || a.id === activeNewsSlug) || null;
  }, [articles, activeNewsSlug]);

  // Reading scroll listener
  useEffect(() => {
    if (!activeArticle || typeof window === "undefined") return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
      setScrollProgress(pct);

      const secs = activeArticle.content?.sections || activeArticle.sections || [];
      for (let i = secs.length - 1; i >= 0; i--) {
        const secId = secs[i].id || `sec-${i}`;
        const el = document.getElementById(secId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 180) {
            setActiveSectionId(secId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeArticle]);

  // Record view count
  useEffect(() => {
    if (!activeArticle) return;
    try {
      const viewedKey = `roham_viewed_news_${activeArticle.id}`;
      if (!sessionStorage.getItem(viewedKey)) {
        sessionStorage.setItem(viewedKey, "1");
        incrementContentView("news", activeArticle.id);
      }
    } catch {}
  }, [activeArticle]);

  const handleOpenArticle = (slug: string) => {
    setActiveNewsSlug(slug);
    if (typeof window !== "undefined") {
      const cleanPath = `/radar?news=${encodeURIComponent(slug)}`;
      window.history.pushState(null, "", cleanPath);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCloseArticle = () => {
    setActiveNewsSlug(null);
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/radar");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleToggleSave = (articleId: string) => {
    setSavedIds((prev) => {
      const exists = prev.includes(articleId);
      const next = exists ? prev.filter((id) => id !== articleId) : [...prev, articleId];
      try {
        localStorage.setItem("roham_saved_news_articles", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleCopyLink = () => {
    if (typeof window === "undefined" || !activeArticle) return;
    const url = `${window.location.origin}/radar?news=${encodeURIComponent(activeArticle.slug)}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(activeArticle.id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  const copyCodeBlock = (key: string, code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCodeKey(key);
      setTimeout(() => setCopiedCodeKey(null), 2500);
    });
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  const handleShare = async () => {
    if (!activeArticle || typeof window === "undefined") return;
    const url = `${window.location.origin}/radar?news=${encodeURIComponent(activeArticle.slug)}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: activeArticle.title,
          text: activeArticle.summary,
          url,
        });
      } catch {}
    } else {
      handleCopyLink();
    }
  };

  // Canvas Theme styling tokens (identically aligned with Blog)
  const themeClasses: Record<
    ReaderCanvasTheme,
    {
      bg: string;
      surface: string;
      body: string;
      heading: string;
      muted: string;
      border: string;
      accent: string;
      callout: string;
    }
  > = {
    light: {
      bg: "bg-[#FDFCFB] text-slate-800",
      surface: "bg-white",
      body: "text-[#2B3545] leading-[2.05]",
      heading: "text-[#0F172A]",
      muted: "text-slate-500",
      border: "border-slate-200/90",
      accent: "text-emerald-700",
      callout: "bg-emerald-50/80 border-emerald-300 text-emerald-950",
    },
    slate: {
      bg: "bg-[#090D16] text-slate-200",
      surface: "bg-[#0E1526]",
      body: "text-slate-300 leading-[2.05]",
      heading: "text-white",
      muted: "text-slate-400",
      border: "border-slate-800",
      accent: "text-emerald-400",
      callout: "bg-emerald-950/40 border-emerald-800/80 text-emerald-200",
    },
    oled: {
      bg: "bg-black text-zinc-200",
      surface: "bg-zinc-950",
      body: "text-zinc-300 leading-[2.05]",
      heading: "text-white",
      muted: "text-zinc-500",
      border: "border-zinc-800",
      accent: "text-emerald-400",
      callout: "bg-zinc-900 border-zinc-700 text-zinc-100",
    },
    sepia: {
      bg: "bg-[#FAF4EB] text-[#2C241B]",
      surface: "bg-[#F4ECE0]",
      body: "text-[#3D3226] leading-[2.05]",
      heading: "text-[#1C150C]",
      muted: "text-[#7A6B58]",
      border: "border-[#E3D6C3]",
      accent: "text-[#A05C1C]",
      callout: "bg-[#EFE4D2] border-[#D4C3A9] text-[#2C241B]",
    },
  };

  const tc = themeClasses[canvasTheme];

  // Filter articles
  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      // Category filter
      if (selectedCategory !== "همه") {
        const catMatch =
          a.category === selectedCategory ||
          a.categoryLabel === selectedCategory ||
          a.categoryId === selectedCategory;
        if (!catMatch) return false;
      }
      // Tag filter
      if (selectedTag) {
        const kws = a.keywords || a.tags || [];
        if (!kws.some((k) => k.toLowerCase() === selectedTag.toLowerCase())) return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = a.title.toLowerCase().includes(q);
        const inSummary = a.summary.toLowerCase().includes(q);
        const inSub = (a.subtitle || "").toLowerCase().includes(q);
        const inKws = (a.keywords || a.tags || []).some((k) => k.toLowerCase().includes(q));
        if (!inTitle && !inSummary && !inSub && !inKws) return false;
      }
      return true;
    });
  }, [articles, selectedCategory, selectedTag, searchQuery]);

  // Extract all unique keywords for filter chips
  const allKeywords = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => {
      (a.keywords || a.tags || []).forEach((k) => set.add(k));
    });
    return Array.from(set).slice(0, 14);
  }, [articles]);

  // ============================================================================
  // FULL EDITORIAL ARTICLE VIEW (IDENTICAL BEAUTIFUL STRUCTURE TO BLOG)
  // ============================================================================
  if (activeArticle) {
    const articleSections =
      activeArticle.content?.sections ||
      activeArticle.sections.map((s, idx) => ({
        id: s.id || `sec-${idx}`,
        heading: s.heading,
        paragraphs: s.paragraphs,
        codeSnippet: s.codeSnippet,
        codeLanguage: s.codeLanguage,
        callout: s.callout,
        calloutType: s.calloutType,
        imageUrl: s.imageUrl,
        imageAlt: s.imageAlt,
        table: s.table,
      }));

    const articleTldr =
      activeArticle.tldr && activeArticle.tldr.length > 0
        ? activeArticle.tldr
        : activeArticle.keyHighlights && activeArticle.keyHighlights.length > 0
        ? activeArticle.keyHighlights
        : [];

    const articleKeywords = activeArticle.keywords || activeArticle.tags || [];

    return (
      <article
        id="roham-news-reader-view"
        className={`min-h-screen transition-colors duration-200 ${tc.bg} pb-24`}
        style={{ direction: "rtl" }}
      >
        {/* Sticky Reading Top Bar */}
        <div
          className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
            canvasTheme === "light"
              ? "bg-white/95 border-slate-200/90 shadow-2xs"
              : canvasTheme === "sepia"
              ? "bg-[#FAF4EB]/95 border-[#E3D6C3] shadow-2xs"
              : "bg-slate-950/95 border-slate-800/90 shadow-lg"
          }`}
        >
          {/* Scroll Progress Bar */}
          <div
            className="h-1 bg-gradient-to-l from-emerald-500 to-teal-400 transition-all duration-100"
            style={{ width: `${scrollProgress}%` }}
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
            {/* Right: Back to News List */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleCloseArticle}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 text-xs font-bold transition-colors cursor-pointer group"
                title="بازگشت به فهرست اخبار امنیت"
              >
                <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform" />
                <span>اخبار امنیت</span>
              </button>

              <span className={`text-xs font-bold truncate max-w-xs sm:max-w-md hidden md:block ${tc.heading}`}>
                {activeArticle.title}
              </span>
            </div>

            {/* Left: Reading controls (Theme, Font, Share, Print) */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Theme Picker */}
              <div className="flex items-center p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs gap-1">
                {(["light", "slate", "sepia", "oled"] as ReaderCanvasTheme[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setCanvasTheme(t);
                      try {
                        localStorage.setItem("roham_blog_reader_theme", t);
                      } catch {}
                    }}
                    className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                      canvasTheme === t
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {t === "light" ? "روشن" : t === "slate" ? "تاریک" : t === "sepia" ? "سپیا" : "سیاه"}
                  </button>
                ))}
              </div>

              {/* Font Size Buttons */}
              <div className="hidden sm:flex items-center p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs gap-1 font-mono">
                <button
                  onClick={() => setFontSize((s) => Math.max(14, s - 1))}
                  className="px-2 py-1 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 font-bold cursor-pointer"
                  title="کاهش اندازه فونت"
                >
                  A-
                </button>
                <span className="text-[11px] px-1 text-slate-500">{fontSize}</span>
                <button
                  onClick={() => setFontSize((s) => Math.min(24, s + 1))}
                  className="px-2 py-1 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 font-bold cursor-pointer"
                  title="افزایش اندازه فونت"
                >
                  A+
                </button>
              </div>

              {/* Bookmark */}
              <button
                onClick={() => handleToggleSave(activeArticle.id)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  savedIds.includes(activeArticle.id)
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : "border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="نشان‌گذاری خبر"
              >
                <Bookmark className="w-4 h-4" />
              </button>

              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                title="کپی لینک مستقیم خبر"
              >
                {copiedId === activeArticle.id ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>

              {/* Print */}
              <button
                onClick={handlePrint}
                className="hidden sm:flex p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                title="چاپ یا ذخیره PDF"
              >
                <Printer className="w-4 h-4" />
              </button>

              {/* Share */}
              <button
                onClick={handleShare}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                title="اشتراک‌گذاری"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {isAdmin && onOpenAdminCms && (
                <button
                  onClick={onOpenAdminCms}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-500 dark:text-amber-400 text-xs font-bold cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">ویرایش در CMS</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Full-Page Editorial Layout (Matching Blog Structure Exactly) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
          {/* Article Header Block */}
          <header className={`pb-8 sm:pb-10 border-b ${tc.border} max-w-4xl`}>
            {/* Metadata Kicker */}
            <div className={`flex flex-wrap items-center gap-2.5 text-xs font-medium mb-4 ${tc.muted}`}>
              <span className={`font-bold ${tc.accent}`}>
                {activeArticle.categoryLabel || activeArticle.category}
              </span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{activeArticle.date}</span>
              <span aria-hidden="true">·</span>
              <span>زمان مطالعه: {activeArticle.readTime}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 tabular-nums">
                <Eye className="w-3.5 h-3.5" />
                {toPersianDigits(activeArticle.views || 180)} بازدید
              </span>
            </div>

            <h1
              className={`text-2xl sm:text-4xl lg:text-[40px] font-black tracking-tight leading-[1.35] mb-4 ${tc.heading}`}
              style={{ textWrap: "balance" }}
            >
              {activeArticle.title}
            </h1>

            {activeArticle.subtitle && (
              <p className={`text-base sm:text-xl leading-relaxed font-medium mb-6 ${tc.muted}`}>
                {activeArticle.subtitle}
              </p>
            )}

            {/* Author / Source Byline */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  R
                </div>
                <div>
                  <div className={`text-xs sm:text-sm font-bold ${tc.heading}`}>
                    {activeArticle.author || "تحریریه امنیت رهام"}
                  </div>
                  <div className={`text-[11px] font-mono ${tc.muted}`}>
                    {activeArticle.source ? `منبع: ${activeArticle.source}` : "Roham Threat Intel"}
                  </div>
                </div>
              </div>

              {/* Tag preview */}
              {articleKeywords.length > 0 && (
                <div className={`flex flex-wrap items-center gap-2 text-xs font-mono ${tc.muted}`}>
                  {articleKeywords.slice(0, 3).map((kw, i) => (
                    <React.Fragment key={kw}>
                      {i > 0 && <span aria-hidden="true">·</span>}
                      <span>#{kw}</span>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </header>

          {/* 12-Column Grid: 8 Cols Prose Stream + 4 Cols Sticky TOC */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-8 sm:pt-10 items-start">
            {/* Main Reading Column (8 Cols) */}
            <div className="lg:col-span-8 space-y-10 min-w-0">
              {/* Executive Summary / TL;DR Box (خلاصه خبر و نکات کلیدی) */}
              {articleTldr.length > 0 && (
                <div className={`p-6 sm:p-7 rounded-2xl border ${tc.surface} ${tc.border} space-y-3`}>
                  <div className={`text-xs sm:text-sm font-extrabold flex items-center gap-2 ${tc.accent}`}>
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>خلاصه خبر و یافته‌های کلیدی (TL;DR)</span>
                  </div>
                  <ul className="space-y-2.5">
                    {articleTldr.map((item, idx) => (
                      <li
                        key={idx}
                        className={`text-xs sm:text-sm leading-relaxed flex items-start gap-2.5 ${tc.body}`}
                      >
                        <span className={`font-mono font-bold shrink-0 mt-0.5 ${tc.accent}`}>
                          {toPersianDigits(idx + 1)}.
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Cover Image */}
              {activeArticle.coverImage && (
                <figure className={`rounded-2xl overflow-hidden border ${tc.border} ${tc.surface}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeArticle.coverImage}
                    alt={activeArticle.title}
                    referrerPolicy="no-referrer"
                    className="w-full max-h-[420px] object-cover"
                  />
                </figure>
              )}

              {/* Lead Intro Paragraph */}
              {activeArticle.content?.intro && activeArticle.content.intro.trim().length > 0 && (
                <div
                  className={`leading-[1.95] font-medium border-r-4 border-emerald-500 pr-4 sm:pr-5 whitespace-pre-line ${tc.body}`}
                  style={{ fontSize: `${fontSize + 1}px` }}
                >
                  {activeArticle.content.intro}
                </div>
              )}

              {/* Structured Article Sections */}
              <div className="space-y-12">
                {articleSections.map((sec, idx) => {
                  const sectionAnchor = sec.id || `sec-${idx}`;
                  const codeKey = `${activeArticle.id}-code-${idx}`;
                  return (
                    <section key={sectionAnchor} id={sectionAnchor} className="space-y-5 scroll-mt-32">
                      {sec.heading && sec.heading.trim().length > 0 && (
                        <h2 className={`text-xl sm:text-2xl font-extrabold tracking-tight leading-snug pt-2 ${tc.heading}`}>
                          {sec.heading}
                        </h2>
                      )}

                      <div className="space-y-4">
                        {sec.paragraphs.map((p, pIdx) => {
                          if (p.startsWith("> ")) {
                            return (
                              <blockquote
                                key={pIdx}
                                className={`border-r-4 border-emerald-500 pr-4 py-1.5 my-3 italic ${tc.muted}`}
                                style={{ fontSize: `${fontSize}px` }}
                              >
                                {p.replace(/^>\s*/, "")}
                              </blockquote>
                            );
                          }
                          return (
                            <p
                              key={pIdx}
                              className={`leading-[2.05] whitespace-pre-line ${tc.body}`}
                              style={{ fontSize: `${fontSize}px` }}
                            >
                              {p}
                            </p>
                          );
                        })}
                      </div>

                      {/* Section Image */}
                      {sec.imageUrl && (
                        <figure className={`rounded-2xl overflow-hidden border my-5 ${tc.border} ${tc.surface}`}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={sec.imageUrl}
                            alt={sec.imageAlt || sec.heading}
                            referrerPolicy="no-referrer"
                            className="w-full max-h-[440px] object-contain bg-slate-950/40"
                          />
                          {sec.imageAlt && (
                            <figcaption className={`px-4 py-2.5 text-xs border-t ${tc.border} ${tc.muted}`}>
                              {sec.imageAlt}
                            </figcaption>
                          )}
                        </figure>
                      )}

                      {/* Code Block (LTR) */}
                      {sec.codeSnippet && (
                        <div
                          className="rounded-2xl overflow-hidden border border-slate-800 bg-[#090D16] text-slate-100 font-mono text-xs sm:text-[13px] my-6 shadow-xl"
                          style={{ direction: "ltr", textAlign: "left" }}
                        >
                          <div className="bg-slate-900/95 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="uppercase font-semibold text-emerald-400">
                                {sec.codeLanguage || "code"}
                              </span>
                            </div>
                            <button
                              onClick={() => copyCodeBlock(codeKey, sec.codeSnippet!)}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] transition-colors cursor-pointer"
                            >
                              {copiedCodeKey === codeKey ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-emerald-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="p-4 sm:p-5 text-emerald-300/95 overflow-x-auto leading-relaxed">
                            <code>{sec.codeSnippet}</code>
                          </pre>
                        </div>
                      )}

                      {/* Technical Table */}
                      {sec.table && sec.table.headers.length > 0 && (
                        <div className={`overflow-x-auto rounded-2xl border my-6 ${tc.border}`}>
                          <table className="w-full text-right text-xs sm:text-sm border-collapse">
                            <thead>
                              <tr className={`${tc.surface} border-b ${tc.border}`}>
                                {sec.table.headers.map((h, hIdx) => (
                                  <th key={hIdx} className={`py-3 px-4 font-bold whitespace-nowrap ${tc.heading}`}>
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-500/15">
                              {sec.table.rows.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-emerald-500/5 transition-colors">
                                  {row.map((cell, cIdx) => (
                                    <td
                                      key={cIdx}
                                      className={`py-3 px-4 leading-relaxed tabular-nums ${
                                        cIdx === 0 ? `font-mono font-bold ${tc.accent}` : tc.body
                                      }`}
                                    >
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Callout */}
                      {sec.callout && (
                        <div
                          className={`p-4 sm:p-5 rounded-2xl border my-5 leading-relaxed text-xs sm:text-sm ${
                            sec.calloutType === "warning"
                              ? "bg-amber-500/10 border-amber-500/40 text-amber-900 dark:text-amber-200"
                              : tc.callout
                          }`}
                        >
                          {sec.callout}
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>

              {/* Conclusion */}
              {activeArticle.content?.conclusion && (
                <section className={`p-6 sm:p-8 rounded-2xl border ${tc.surface} ${tc.border} space-y-3`}>
                  <h3 className={`text-base font-extrabold ${tc.heading}`}>جمع‌بندی و دیدگاه تحلیلی</h3>
                  <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-line ${tc.body}`}>
                    {activeArticle.content.conclusion}
                  </p>
                </section>
              )}

              {/* Source Reference if available */}
              {(activeArticle.sourceUrl || activeArticle.source) && (
                <section className={`p-5 sm:p-6 rounded-2xl border ${tc.surface} ${tc.border} space-y-3`}>
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-xs sm:text-sm font-extrabold flex items-center gap-2 ${tc.heading}`}>
                      <ExternalLink className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>منبع اصلی خبر (Source Reference)</span>
                    </h4>
                    {activeArticle.source && (
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[11px] font-mono">
                        {activeArticle.source}
                      </span>
                    )}
                  </div>
                  {activeArticle.sourceUrl && (
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono" style={{ direction: "ltr", textAlign: "left" }}>
                      <a
                        href={activeArticle.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 underline break-all flex items-center gap-1.5"
                      >
                        <span>{activeArticle.sourceUrl}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    </div>
                  )}
                </section>
              )}

              {/* PROMINENT KEYWORDS SECTION (کلیدواژه‌ها) - Requested specifically by user! */}
              {articleKeywords.length > 0 && (
                <section className={`p-6 sm:p-7 rounded-2xl border ${tc.surface} ${tc.border} space-y-3.5`}>
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <h4 className={`text-xs sm:text-sm font-extrabold ${tc.heading}`}>
                      کلیدواژه‌های این گزارش:
                    </h4>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {articleKeywords.map((kw) => (
                      <span
                        key={kw}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                          isDark
                            ? "bg-slate-900 border-slate-800 text-emerald-300 hover:border-emerald-500/50"
                            : "bg-white border-slate-200 text-emerald-800 shadow-2xs hover:border-emerald-300"
                        }`}
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Next & Previous News Navigator */}
              <div className={`pt-6 border-t ${tc.border} flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold`}>
                <button
                  onClick={handleCloseArticle}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>بازگشت به فهرست اخبار امنیت</span>
                </button>
              </div>
            </div>

            {/* Sidebar Column (4 Cols): TOC & Metadata */}
            <aside className="hidden lg:block lg:col-span-4 sticky top-24 space-y-6">
              {/* Table of Contents Box */}
              {articleSections.length > 0 && (
                <div className={`p-6 rounded-2xl border ${tc.surface} ${tc.border} space-y-4`}>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <List className="w-4 h-4 text-emerald-500" />
                    <span>فهرست سرفصل‌های خبر</span>
                  </div>
                  <nav className="space-y-1.5 text-xs">
                    {articleSections.map((sec, idx) => {
                      const secId = sec.id || `sec-${idx}`;
                      const isActive = activeSectionId === secId;
                      return (
                        <a
                          key={secId}
                          href={`#${secId}`}
                          className={`block py-1.5 px-3 rounded-lg transition-colors leading-relaxed ${
                            isActive
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border-r-2 border-emerald-500"
                              : `${tc.muted} hover:text-slate-900 dark:hover:text-white`
                          }`}
                        >
                          {sec.heading || `بخش ${idx + 1}`}
                        </a>
                      );
                    })}
                  </nav>
                </div>
              )}

              {/* Quick Info Box */}
              <div className={`p-6 rounded-2xl border ${tc.surface} ${tc.border} space-y-3 text-xs`}>
                <div className={`font-bold ${tc.heading}`}>مشخصات انتشار</div>
                <div className="space-y-2 text-slate-500 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>دسته‌بندی:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {activeArticle.categoryLabel || activeArticle.category}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>تاریخ:</span>
                    <span className="font-mono">{activeArticle.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>زمان تخمینی:</span>
                    <span>{activeArticle.readTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>بازدید:</span>
                    <span className="font-mono">{toPersianDigits(activeArticle.views || 180)}</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </article>
    );
  }

  // ============================================================================
  // NEWS ARTICLES LIST VIEW (اخبار امنیت)
  // ============================================================================
  return (
    <div className="space-y-10 pb-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      {/* Top Header */}
      <div className="space-y-4 text-right">
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold">
          <Radio className="w-4 h-4 animate-pulse" />
          <span>مرکز تحقیقات امنیت و دفاع سایبری رهام</span>
          <span aria-hidden="true">·</span>
          <span>Security News & Intelligence</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              اخبار امنیت
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              پوشش موثق و فنی تازه‌ترین اخبار امنیت سایبری، تحلیل هشدارهای فوری، گزارش‌های رخداد و راهنمای ایمن‌سازی برای جامعه فنی و سازمان‌ها.
            </p>
          </div>

          {isAdmin && onOpenAdminCms && (
            <button
              onClick={onOpenAdminCms}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-700 dark:text-amber-300 font-bold text-xs cursor-pointer self-start sm:self-auto"
            >
              <Edit3 className="w-4 h-4 text-amber-500" />
              <span>مدیریت اخبار در پنل</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        {/* Dynamic Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => {
              setSelectedCategory("همه");
              setSelectedTag(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === "همه" && !selectedTag
                ? "bg-emerald-700 text-white shadow-sm"
                : isDark
                ? "bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700"
                : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
            }`}
          >
            همه اخبار ({articles.length})
          </button>

          {categories.map((cat) => {
            const count = articles.filter(
              (a) => a.category === cat.name || a.category === cat.slug || a.categoryLabel === cat.name
            ).length;
            const isActive = selectedCategory === cat.name || selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  setSelectedTag(null);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-emerald-700 text-white shadow-sm"
                    : isDark
                    ? "bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700"
                    : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
                }`}
              >
                <span>{cat.name}</span>
                {count > 0 && <span className="opacity-70 mr-1.5 font-mono text-[11px]">({count})</span>}
              </button>
            );
          })}
        </div>

        {/* Search Input & Keyword Chips */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در متن یا تیتر اخبار..."
              className={`w-full pr-10 pl-4 py-2.5 rounded-xl text-xs focus:outline-none transition-colors ${
                isDark
                  ? "bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:border-emerald-500"
                  : "bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-600 shadow-2xs"
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Keywords Chips */}
          {allKeywords.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-400 text-[11px] font-mono">کلیدواژه‌ها:</span>
              {allKeywords.slice(0, 6).map((kw) => (
                <button
                  key={kw}
                  onClick={() => setSelectedTag(selectedTag === kw ? null : kw)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors cursor-pointer ${
                    selectedTag === kw
                      ? "bg-emerald-600 text-white"
                      : isDark
                      ? "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  #{kw}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className={`p-16 text-center rounded-3xl border ${isDark ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"}`}>
          <Radio className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">خبری یافت نشد</h3>
          <p className="text-xs text-slate-500 mt-1">
            با معیارهای جستجوی فعلی نتیجه‌ای وجود ندارد. فیلترها را پاک کنید.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("همه");
              setSelectedTag(null);
              setSearchQuery("");
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
          >
            نمایش همه اخبار
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => {
            const kws = article.keywords || article.tags || [];
            return (
              <div
                key={article.id}
                onClick={() => handleOpenArticle(article.slug)}
                className={`p-6 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                  isDark
                    ? "bg-slate-900/70 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md shadow-xs"
                }`}
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      {article.categoryLabel || article.category}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">{article.date}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors line-clamp-2">
                    {article.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {article.summary}
                  </p>

                  {/* Keywords Preview */}
                  {kws.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {kws.slice(0, 3).map((kw) => (
                        <span
                          key={kw}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-400"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{article.readTime}</span>
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold group-hover:underline flex items-center gap-1">
                    <span>مطالعه کامل خبر</span>
                    <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
