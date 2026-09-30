"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  Clock,
  ArrowLeft,
  ArrowRight,
  Share2,
  Bookmark,
  CheckCircle,
  ShieldAlert,
  Terminal,
  Search,
  Copy,
  Check,
  List,
  Sliders,
  Printer,
  Eye,
  PlusCircle,
  Edit3,
  ExternalLink,
  ChevronLeft,
  X,
  Sparkles,
  FileText,
} from "lucide-react";
import {
  BlogPost,
  DEFAULT_BLOG_POSTS,
  fetchContentStore,
  incrementContentView,
} from "@/lib/contentStore";

export type { BlogPost };
export const BLOG_POSTS = DEFAULT_BLOG_POSTS;

interface BlogSectionProps {
  onOpenReader?: (bookId?: string, chapterId?: string) => void;
  onOpenConsultation?: () => void;
  onBackToHome?: () => void;
  isAdmin?: boolean;
  onOpenAdminCms?: () => void;
  initialPostSlug?: string | null;
}

type ReaderCanvasTheme = "slate" | "oled" | "sepia" | "light";

const toPersianDigits = (num: number | string): string => {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(num).replace(/\d/g, (d) => persianDigits[Number(d)]);
};

export const BlogSection: React.FC<BlogSectionProps> = ({
  onOpenReader,
  onBackToHome,
  isAdmin,
  onOpenAdminCms,
  initialPostSlug,
}) => {
  const [posts, setPosts] = useState<BlogPost[]>(DEFAULT_BLOG_POSTS);
  const [selectedCategory, setSelectedCategory] = useState<string>("همه");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");
  const [searchQuery, setSearchQuery] = useState("");
  const [activePostSlug, setActivePostSlug] = useState<string | null>(() => {
    if (initialPostSlug) return initialPostSlug;
    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams(window.location.search);
        return params.get("post");
      } catch {}
    }
    return null;
  });

  // Reader customization states (persisted in localStorage for professional readers)
  const [canvasTheme, setCanvasTheme] = useState<ReaderCanvasTheme>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedTheme = localStorage.getItem("roham_blog_reader_theme") as ReaderCanvasTheme | null;
        if (savedTheme && ["slate", "oled", "sepia", "light"].includes(savedTheme)) {
          return savedTheme;
        }
      } catch {}
    }
    return "slate";
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
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedBookmarks = JSON.parse(localStorage.getItem("roham_blog_bookmarks") || "[]");
        if (Array.isArray(savedBookmarks)) return savedBookmarks;
      } catch {}
    }
    return [];
  });
  const [checkedTakeaways, setCheckedTakeaways] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedCodeKey, setCopiedCodeKey] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [activeSectionId, setActiveSectionId] = useState<string>("");
  const [mobileTocOpen, setMobileTocOpen] = useState<boolean>(false);
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState<boolean>(false);

  // Load dynamic posts from MySQL / contentStore
  useEffect(() => {
    let cancelled = false;
    fetchContentStore().then((res) => {
      if (!cancelled && res.blogPosts.length > 0) {
        const visible = isAdmin
          ? res.blogPosts
          : res.blogPosts.filter((p) => p.status !== "draft");
        setPosts(visible.length > 0 ? visible : DEFAULT_BLOG_POSTS);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  // Sync browser back/forward navigation for full-page article view
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setActivePostSlug(params.get("post"));
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const activeArticle = useMemo(
    () => posts.find((p) => p.slug === activePostSlug || p.id === activePostSlug) || null,
    [posts, activePostSlug]
  );

  // Track reading progress & active section in Full-Page Article mode
  useEffect(() => {
    if (!activeArticle || typeof window === "undefined") return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
      setScrollProgress(pct);

      for (let i = activeArticle.content.sections.length - 1; i >= 0; i--) {
        const sec = activeArticle.content.sections[i];
        const el = document.getElementById(sec.id || `sec-${i}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 160) {
            setActiveSectionId(sec.id || `sec-${i}`);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeArticle]);

  const openArticlePage = (post: BlogPost) => {
    setActivePostSlug(post.slug);
    setActiveSectionId(post.content.sections[0]?.id || "sec-0");
    setMobileTocOpen(false);
    incrementContentView("blog", post.id);
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, views: (p.views || 0) + 1 } : p))
    );
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("post", post.slug);
      window.history.pushState(null, "", url.toString());
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const closeArticlePage = () => {
    setActivePostSlug(null);
    setMobileTocOpen(false);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("post");
      window.history.pushState(null, "", url.pathname + url.search);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleThemeChange = (next: ReaderCanvasTheme) => {
    setCanvasTheme(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("roham_blog_reader_theme", next);
    }
  };

  const handleFontSizeChange = (delta: number) => {
    setFontSize((prev) => {
      const next = Math.min(23, Math.max(14, prev + delta));
      if (typeof window !== "undefined") {
        localStorage.setItem("roham_blog_reader_fontsize", String(next));
      }
      return next;
    });
  };

  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      if (typeof window !== "undefined") {
        localStorage.setItem("roham_blog_bookmarks", JSON.stringify(next));
      }
      return next;
    });
  };

  const copyArticleLink = (post: BlogPost, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof window !== "undefined") {
      const shareUrl = `${window.location.origin}/blog?post=${encodeURIComponent(post.slug)}`;
      navigator.clipboard.writeText(shareUrl).catch(() => {});
      setCopiedId(post.id);
      setTimeout(() => setCopiedId(null), 2200);
    }
  };

  const copyCodeBlock = (key: string, code: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(code).catch(() => {});
      setCopiedCodeKey(key);
      setTimeout(() => setCopiedCodeKey(null), 2000);
    }
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSectionId(sectionId);
    setMobileTocOpen(false);
    if (typeof window !== "undefined") {
      const el = document.getElementById(sectionId);
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 110;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }
  };

  const categories = [
    "همه",
    "استیلر و بدافزار",
    "دفاع و هاردنینگ",
    "هویت و سشن‌ها",
    "تحقیقات زیرودی",
    "نشان‌شده‌ها",
  ];

  const allTags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const list = posts.filter((post) => {
      const matchesCategory =
        selectedCategory === "همه"
          ? true
          : selectedCategory === "نشان‌شده‌ها"
          ? bookmarkedIds.includes(post.id)
          : post.category === selectedCategory;

      const matchesTag = !selectedTag || post.tags.includes(selectedTag);

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === "" ||
        post.title.toLowerCase().includes(q) ||
        (post.subtitle || "").toLowerCase().includes(q) ||
        post.summary.toLowerCase().includes(q) ||
        post.tags.some((t) => t.toLowerCase().includes(q)) ||
        post.content.sections.some(
          (s) =>
            s.heading.toLowerCase().includes(q) ||
            (s.codeSnippet || "").toLowerCase().includes(q)
        );

      return matchesCategory && matchesTag && matchesSearch;
    });

    if (sortBy === "popular") {
      return [...list].sort((a, b) => (b.views || 0) - (a.views || 0));
    }
    return list;
  }, [posts, selectedCategory, selectedTag, searchQuery, sortBy, bookmarkedIds]);

  const featuredPost = useMemo(
    () => filteredPosts.find((p) => p.isFeatured) || filteredPosts[0] || null,
    [filteredPosts]
  );

  const remainingPosts = useMemo(
    () =>
      featuredPost && selectedCategory === "همه" && !searchQuery && !selectedTag
        ? filteredPosts.filter((p) => p.id !== featuredPost.id)
        : filteredPosts,
    [filteredPosts, featuredPost, selectedCategory, searchQuery, selectedTag]
  );

  const topReadPosts = useMemo(
    () => [...posts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 4),
    [posts]
  );

  // ============================================================================
  // MODE A: FULL-PAGE DEDICATED TECHNICAL ARTICLE READER (NO POPUP!)
  // ============================================================================
  if (activeArticle) {
    const activeIndex = posts.findIndex((p) => p.id === activeArticle.id);
    const prevPost = activeIndex > 0 ? posts[activeIndex - 1] : null;
    const nextPost = activeIndex >= 0 && activeIndex < posts.length - 1 ? posts[activeIndex + 1] : null;
    const isBookmarked = bookmarkedIds.includes(activeArticle.id);

    const themeClasses: Record<
      ReaderCanvasTheme,
      {
        wrapper: string;
        surface: string;
        border: string;
        heading: string;
        body: string;
        muted: string;
        accent: string;
      }
    > = {
      slate: {
        wrapper: "bg-slate-950 text-slate-100",
        surface: "bg-slate-900/80",
        border: "border-slate-800",
        heading: "text-white",
        body: "text-slate-200",
        muted: "text-slate-400",
        accent: "text-emerald-400",
      },
      oled: {
        wrapper: "bg-black text-zinc-100",
        surface: "bg-zinc-950",
        border: "border-zinc-800/90",
        heading: "text-white",
        body: "text-zinc-200",
        muted: "text-zinc-400",
        accent: "text-emerald-400",
      },
      sepia: {
        wrapper: "bg-[#FBF8F1] text-[#26221E]",
        surface: "bg-[#F2ECE1]",
        border: "border-[#E0D6C5]",
        heading: "text-[#141210]",
        body: "text-[#2B2622]",
        muted: "text-[#6E655B]",
        accent: "text-emerald-800",
      },
      light: {
        wrapper: "bg-white text-slate-900",
        surface: "bg-slate-50",
        border: "border-slate-200",
        heading: "text-slate-950",
        body: "text-slate-800",
        muted: "text-slate-500",
        accent: "text-emerald-700",
      },
    };

    const tc = themeClasses[canvasTheme];

    return (
      <article
        className={`min-h-screen transition-colors duration-200 pb-24 lg:pb-20 ${tc.wrapper}`}
        style={{ direction: "rtl" }}
      >
        {/* Top Smooth Reading Progress Bar */}
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-slate-800/40 pointer-events-none">
          <div
            className="h-full bg-emerald-500 transition-transform duration-150 origin-right"
            style={{ transform: `scaleX(${scrollProgress / 100})` }}
          />
        </div>

        {/* Sticky Editorial Reader Utility Bar */}
        <div
          className={`sticky top-16 z-30 border-b backdrop-blur-md transition-colors ${tc.surface} ${tc.border}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
            {/* Right: Back to Blog Index + Breadcrumb */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={closeArticlePage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shrink-0 cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>بازگشت به وبلاگ</span>
              </button>
              <span className={`hidden md:inline text-xs truncate ${tc.muted}`}>
                {activeArticle.category} · {activeArticle.title}
              </span>
            </div>

            {/* Left: Reading Comfort Controls (Theme, Font Size, Share, Print) */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Desktop Theme Switcher */}
              <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-slate-950/20 border border-slate-500/20 text-[11px]">
                {(
                  [
                    { id: "slate", label: "تیره" },
                    { id: "oled", label: "OLED" },
                    { id: "sepia", label: "کاغذی" },
                    { id: "light", label: "روشن" },
                  ] as { id: ReaderCanvasTheme; label: string }[]
                ).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleThemeChange(t.id)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      canvasTheme === t.id
                        ? "bg-emerald-600 text-white"
                        : `${tc.muted} hover:opacity-80`
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Desktop Font Size Controls */}
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-950/20 border border-slate-500/20 text-xs">
                <button
                  onClick={() => handleFontSizeChange(-1)}
                  className={`px-1.5 font-bold cursor-pointer ${tc.muted} hover:opacity-100`}
                  title="کوچک کردن قلم"
                >
                  A-
                </button>
                <span className={`text-[11px] font-mono tabular-nums px-1 ${tc.muted}`}>
                  {toPersianDigits(fontSize)}
                </span>
                <button
                  onClick={() => handleFontSizeChange(1)}
                  className={`px-1.5 font-bold cursor-pointer ${tc.muted} hover:opacity-100`}
                  title="بزرگ کردن قلم"
                >
                  A+
                </button>
              </div>

              <button
                onClick={() => toggleBookmark(activeArticle.id)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${tc.border} ${
                  isBookmarked ? "text-amber-500 bg-amber-500/10" : tc.muted
                }`}
                title={isBookmarked ? "حذف نشان" : "نشان کردن مقاله"}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-amber-500" : ""}`} />
              </button>

              <button
                onClick={() => copyArticleLink(activeArticle)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${tc.border} ${tc.muted}`}
                title="کپی لینک مستقیم مقاله"
              >
                {copiedId === activeArticle.id ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={() => typeof window !== "undefined" && window.print()}
                className={`hidden sm:flex p-2 rounded-xl border transition-colors cursor-pointer ${tc.border} ${tc.muted}`}
                title="چاپ یا ذخیره PDF مقاله"
              >
                <Printer className="w-4 h-4" />
              </button>

              {isAdmin && onOpenAdminCms && (
                <button
                  onClick={onOpenAdminCms}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-bold cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">ویرایش در CMS</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Full-Page Editorial Layout: 12 Columns on Desktop */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
          {/* Article Header Block */}
          <header className={`pb-8 sm:pb-10 border-b ${tc.border} max-w-4xl`}>
            {/* Clean unboxed metadata kicker */}
            <div className={`flex flex-wrap items-center gap-2.5 text-xs font-medium mb-4 ${tc.muted}`}>
              <span className={`font-bold ${tc.accent}`}>{activeArticle.category}</span>
              <span aria-hidden="true">·</span>
              <span>سطح فنی: {activeArticle.difficulty || "تخصصی"}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{activeArticle.date}</span>
              <span aria-hidden="true">·</span>
              <span>زمان مطالعه: {activeArticle.readTime}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 tabular-nums">
                <Eye className="w-3.5 h-3.5" />
                {toPersianDigits(activeArticle.views || 120)} بازدید
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

            {/* Author & Research Unit Byline */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 font-bold text-sm">
                  R
                </div>
                <div>
                  <div className={`text-xs sm:text-sm font-bold ${tc.heading}`}>
                    {activeArticle.author}
                  </div>
                  <div className={`text-[11px] font-mono ${tc.muted}`}>
                    {activeArticle.authorRole}
                  </div>
                </div>
              </div>

              {/* Unboxed Tag List */}
              <div className={`flex flex-wrap items-center gap-2 text-xs font-mono ${tc.muted}`}>
                {activeArticle.tags.map((tag, i) => (
                  <React.Fragment key={tag}>
                    {i > 0 && <span aria-hidden="true">·</span>}
                    <span>#{tag}</span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </header>

          {/* 12-Column Asymmetric Body: 8 Cols Reading Stream + 4 Cols Sticky TOC & Context Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-8 sm:pt-10 items-start">
            {/* Main Prose Column (8 Cols) */}
            <div className="lg:col-span-8 space-y-10 min-w-0">
              {/* Executive Summary / TL;DR Box */}
              {activeArticle.tldr && activeArticle.tldr.length > 0 && (
                <div
                  className={`p-6 sm:p-7 rounded-2xl border ${tc.surface} ${tc.border} space-y-3`}
                >
                  <div className={`text-xs sm:text-sm font-extrabold flex items-center gap-2 ${tc.accent}`}>
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>خلاصه مدیریتی و یافته‌های کلیدی مقاله (TL;DR)</span>
                  </div>
                  <ul className="space-y-2.5">
                    {activeArticle.tldr.map((item, idx) => (
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

              {/* Cover Image if available */}
              {activeArticle.coverImage && (
                <figure className={`rounded-2xl overflow-hidden border ${tc.border} ${tc.surface}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeArticle.coverImage}
                    alt={activeArticle.title}
                    referrerPolicy="no-referrer"
                    className="w-full max-h-[420px] object-cover"
                  />
                  {activeArticle.downloadedImages?.[0]?.localPath && (
                    <figcaption className={`px-4 py-2.5 text-[11px] font-mono border-t ${tc.border} ${tc.muted} flex items-center justify-between`}>
                      <span>تصویر شاخص مقاله</span>
                      <span dir="ltr">{activeArticle.downloadedImages[0].localPath}</span>
                    </figcaption>
                  )}
                </figure>
              )}

              {/* Lead Introduction Paragraph */}
              <div
                className={`leading-[1.95] font-medium border-r-4 border-emerald-500 pr-4 sm:pr-5 ${tc.body}`}
                style={{ fontSize: `${fontSize + 1}px` }}
              >
                {activeArticle.content.intro}
              </div>

              {/* Technical Article Sections */}
              <div className="space-y-12">
                {activeArticle.content.sections.map((sec, idx) => {
                  const sectionAnchor = sec.id || `sec-${idx}`;
                  const codeKey = `${activeArticle.id}-code-${idx}`;
                  return (
                    <section
                      key={sectionAnchor}
                      id={sectionAnchor}
                      className="space-y-5 scroll-mt-32"
                    >
                      <h2
                        className={`text-xl sm:text-2xl font-extrabold tracking-tight leading-snug pt-2 ${tc.heading}`}
                      >
                        {sec.heading}
                      </h2>

                      <div className="space-y-4">
                        {sec.paragraphs.map((p, pIdx) => (
                          <p
                            key={pIdx}
                            className={`leading-[1.95] ${tc.body}`}
                            style={{ fontSize: `${fontSize}px` }}
                          >
                            {p}
                          </p>
                        ))}
                      </div>

                      {/* Section Downloaded Image / Technical Figure */}
                      {sec.imageUrl && (
                        <figure className={`rounded-2xl overflow-hidden border my-5 ${tc.border} ${tc.surface}`}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={sec.imageUrl}
                            alt={sec.imageAlt || sec.heading}
                            referrerPolicy="no-referrer"
                            className="w-full max-h-[400px] object-cover"
                          />
                          {sec.imageAlt && (
                            <figcaption className={`px-4 py-2.5 text-xs border-t ${tc.border} ${tc.muted}`}>
                              {sec.imageAlt}
                            </figcaption>
                          )}
                        </figure>
                      )}

                      {/* Interactive Code / Terminal Block (Always LTR) */}
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
                              <span>·</span>
                              <span>Roham Technical Snippet</span>
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
                                  <span>Copy Code</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="p-4 sm:p-5 text-emerald-300/95 overflow-x-auto leading-relaxed">
                            <code>{sec.codeSnippet}</code>
                          </pre>
                        </div>
                      )}

                      {/* Structured Technical Table */}
                      {sec.table && sec.table.headers.length > 0 && (
                        <div className={`overflow-x-auto rounded-2xl border my-6 ${tc.border}`}>
                          <table className="w-full text-right text-xs sm:text-sm border-collapse">
                            <thead>
                              <tr className={`${tc.surface} border-b ${tc.border}`}>
                                {sec.table.headers.map((h, hIdx) => (
                                  <th
                                    key={hIdx}
                                    className={`py-3 px-4 font-bold whitespace-nowrap ${tc.heading}`}
                                  >
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

                      {/* Technical Callout / Advisory */}
                      {sec.callout && (
                        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs sm:text-sm flex items-start gap-3 leading-relaxed">
                          <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                          <div className={canvasTheme === "light" || canvasTheme === "sepia" ? "text-amber-950 font-medium" : "text-amber-200"}>
                            {sec.callout}
                          </div>
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>

              {/* Analytical Conclusion */}
              <section className={`pt-8 border-t ${tc.border} space-y-3`}>
                <h3 className={`text-xl font-extrabold ${tc.heading}`}>جمع‌بندی و نتیجه‌گیری فنی</h3>
                <p
                  className={`leading-[1.95] ${tc.body}`}
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {activeArticle.content.conclusion}
                </p>
              </section>

              {/* Interactive Actionable Takeaways Checklist */}
              <section className={`p-6 sm:p-8 rounded-2xl border ${tc.surface} ${tc.border} space-y-4`}>
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-sm sm:text-base font-extrabold flex items-center gap-2 ${tc.accent}`}>
                    <CheckCircle className="w-5 h-5 shrink-0" />
                    <span>چک‌لیست عملیاتی دفاعی (قابل تیک زدن جهت ممیزی امنیت شما)</span>
                  </h4>
                  <span className={`text-[11px] font-mono ${tc.muted}`}>
                    Interactive Audit Checklist
                  </span>
                </div>
                <div className="space-y-2.5">
                  {activeArticle.content.actionableTakeaways.map((item, i) => {
                    const key = `${activeArticle.id}-takeaway-${i}`;
                    const isChecked = !!checkedTakeaways[key];
                    return (
                      <label
                        key={key}
                        onClick={() =>
                          setCheckedTakeaways((prev) => ({ ...prev, [key]: !prev[key] }))
                        }
                        className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                          isChecked
                            ? "bg-emerald-500/10 border-emerald-500/40"
                            : `${tc.border} hover:border-emerald-500/40`
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-1 w-4 h-4 accent-emerald-600 rounded shrink-0"
                        />
                        <span
                          className={`text-xs sm:text-sm leading-relaxed ${
                            isChecked ? "line-through opacity-70" : tc.body
                          }`}
                        >
                          {item}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </section>

              {/* References if available */}
              {activeArticle.content.references && activeArticle.content.references.length > 0 && (
                <section className={`pt-6 border-t ${tc.border} space-y-3`}>
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${tc.muted}`}>
                    منابع، مستندات و ارجاعات استاندارد
                  </h4>
                  <ul className="space-y-2 text-xs font-mono" style={{ direction: "ltr", textAlign: "left" }}>
                    {activeArticle.content.references.map((ref, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="text-emerald-500">[{idx + 1}]</span>
                        <span className={tc.body}>{ref.title}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Previous & Next Article Full-Page Navigation */}
              <nav className={`pt-8 border-t ${tc.border} grid grid-cols-1 sm:grid-cols-2 gap-4`}>
                {prevPost ? (
                  <button
                    onClick={() => openArticlePage(prevPost)}
                    className={`p-5 rounded-2xl border text-right transition-all cursor-pointer group ${tc.surface} ${tc.border} hover:border-emerald-500/50`}
                  >
                    <div className={`text-xs flex items-center gap-1 mb-2 ${tc.muted}`}>
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>مقاله قبلی</span>
                    </div>
                    <div className={`text-sm font-bold line-clamp-2 group-hover:text-emerald-400 transition-colors ${tc.heading}`}>
                      {prevPost.title}
                    </div>
                  </button>
                ) : (
                  <div />
                )}

                {nextPost && (
                  <button
                    onClick={() => openArticlePage(nextPost)}
                    className={`p-5 rounded-2xl border text-right transition-all cursor-pointer group ${tc.surface} ${tc.border} hover:border-emerald-500/50`}
                  >
                    <div className={`text-xs flex items-center justify-end gap-1 mb-2 ${tc.muted}`}>
                      <span>مقاله بعدی</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </div>
                    <div className={`text-sm font-bold line-clamp-2 group-hover:text-emerald-400 transition-colors ${tc.heading}`}>
                      {nextPost.title}
                    </div>
                  </button>
                )}
              </nav>
            </div>

            {/* Sticky Right Sidebar on Desktop (4 Cols): Interactive TOC + Book Bridge */}
            <aside className="hidden lg:block lg:col-span-4 sticky top-36 space-y-6">
              {/* Interactive Table of Contents */}
              <div className={`p-6 rounded-2xl border ${tc.surface} ${tc.border} space-y-4`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-xs font-extrabold flex items-center gap-2 ${tc.heading}`}>
                    <List className="w-4 h-4 text-emerald-500" />
                    <span>فهرست بخش‌های این مقاله</span>
                  </h3>
                  <span className={`text-[11px] font-mono tabular-nums ${tc.muted}`}>
                    {toPersianDigits(Math.round(scrollProgress))}%
                  </span>
                </div>

                <nav className="space-y-1.5">
                  {activeArticle.content.sections.map((sec, idx) => {
                    const secId = sec.id || `sec-${idx}`;
                    const isCurrent = activeSectionId === secId;
                    return (
                      <button
                        key={secId}
                        onClick={() => scrollToSection(secId)}
                        className={`w-full text-right px-3 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-start gap-2 ${
                          isCurrent
                            ? "bg-emerald-600/15 text-emerald-400 font-bold border-r-2 border-emerald-500"
                            : `${tc.muted} hover:opacity-100`
                        }`}
                      >
                        <span className="leading-relaxed line-clamp-2">{sec.heading}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Bridge to Full Book Chapter */}
              {onOpenReader && (
                <div className={`p-6 rounded-2xl border ${tc.surface} ${tc.border} space-y-3`}>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-500">
                    <BookOpen className="w-4 h-4" />
                    <span>مطالعه عمیق‌تر در کتابخانه رهام</span>
                  </div>
                  <p className={`text-xs leading-relaxed ${tc.muted}`}>
                    مباحث پایه‌ای و کدهای کامل مرتبط با این مقاله در کتاب ۱۱ فصلی «از روز صفر تا روز صفر» همراه با پادکست صوتی تشریح شده است.
                  </p>
                  <button
                    onClick={() => onOpenReader("from-day-zero-fa", activeArticle.relatedChapterId)}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>ورود به کتابخوان دوزبانه</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </aside>
          </div>
        </div>

        {/* Mobile Sticky Bottom Reader Bar (Under 15% Viewport Cap) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-4 py-2.5 flex items-center justify-between gap-2 text-xs text-slate-200">
          <button
            onClick={closeArticlePage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 font-semibold"
          >
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            <span>فهرست مقالات</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setMobileTocOpen(!mobileTocOpen);
                setMobileSettingsOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 font-semibold"
            >
              <List className="w-3.5 h-3.5 text-emerald-400" />
              <span>سرفصل‌ها ({toPersianDigits(Math.round(scrollProgress))}٪)</span>
            </button>

            <button
              onClick={() => {
                setMobileSettingsOpen(!mobileSettingsOpen);
                setMobileTocOpen(false);
              }}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
              title="تنظیمات قلم و تم مطالعه"
            >
              <Sliders className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>

        {/* Mobile TOC Bottom Sheet */}
        {mobileTocOpen && (
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end"
            onClick={() => setMobileTocOpen(false)}
          >
            <div
              className="w-full bg-slate-950 border-t border-slate-800 rounded-t-3xl p-5 space-y-4 max-h-[70vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-sm font-bold text-white">فهرست بخش‌های مقاله</span>
                <button onClick={() => setMobileTocOpen(false)} className="p-1 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                {activeArticle.content.sections.map((sec, idx) => {
                  const secId = sec.id || `sec-${idx}`;
                  return (
                    <button
                      key={secId}
                      onClick={() => scrollToSection(secId)}
                      className="w-full text-right p-3 rounded-xl bg-slate-900/90 text-xs text-slate-200 font-medium"
                    >
                      {sec.heading}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Reading Settings Sheet */}
        {mobileSettingsOpen && (
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end"
            onClick={() => setMobileSettingsOpen(false)}
          >
            <div
              className="w-full bg-slate-950 border-t border-slate-800 rounded-t-3xl p-5 space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-sm font-bold text-white">تنظیمات نمایش و خوانایی مقاله</span>
                <button onClick={() => setMobileSettingsOpen(false)} className="p-1 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-xs text-slate-400 block">تم پس‌زمینه مطالعه:</span>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {(
                    [
                      { id: "slate", label: "تیره" },
                      { id: "oled", label: "مشکی OLED" },
                      { id: "sepia", label: "کاغذی گرم" },
                      { id: "light", label: "روشن روز" },
                    ] as { id: ReaderCanvasTheme; label: string }[]
                  ).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleThemeChange(t.id)}
                      className={`py-2.5 rounded-xl border font-bold ${
                        canvasTheme === t.id
                          ? "bg-emerald-600 border-emerald-500 text-white"
                          : "bg-slate-900 border-slate-800 text-slate-300"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">اندازه فونت متن:</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleFontSizeChange(-1)}
                    className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold text-xs"
                  >
                    کوچک‌تر (A-)
                  </button>
                  <span className="text-xs font-mono text-emerald-400">
                    {toPersianDigits(fontSize)}px
                  </span>
                  <button
                    onClick={() => handleFontSizeChange(1)}
                    className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold text-xs"
                  >
                    بزرگ‌تر (A+)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </article>
    );
  }

  // ============================================================================
  // MODE B: EDITORIAL FRONT-PAGE & TECHNICAL RESEARCH CATALOG (/blog)
  // ============================================================================
  return (
    <section id="blog" className="py-10 sm:py-16 bg-slate-950 border-b border-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Breadcrumb + Admin CMS Quick Action */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          {onBackToHome ? (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <button
                onClick={onBackToHome}
                className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer flex items-center gap-1.5"
              >
                <span>صفحه اصلی رهام</span>
              </button>
              <span aria-hidden="true">/</span>
              <span className="text-slate-300">وبلاگ مهندسی و تحقیقات امنیت سایبری</span>
            </div>
          ) : (
            <div />
          )}

          {onOpenAdminCms && (
            <button
              onClick={onOpenAdminCms}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/15 border border-emerald-500/30 hover:bg-emerald-600/25 text-emerald-300 text-xs font-bold transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>مدیریت و انتشار مقاله جدید (CMS)</span>
            </button>
          )}
        </div>

        {/* Editorial Masthead & Search Bar */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-slate-800/90 mb-8">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <FileText className="w-4 h-4" />
              <span>پایگاه مقالات مهندسی، کالبدشکافی بدافزار و معماری دفاع سایبری رهام</span>
            </div>
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight"
              style={{ textWrap: "balance" }}
            >
              وبلاگ تخصصی و پژوهش‌های فنی رهام
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              مقالات عمیق، کدهای اثبات مفهوم، کالبدشکافی گام‌به‌گام استیلرها و راهنماهای عملی هاردنینگ؛ طراحی‌شده برای مطالعه طولانی و راحت روی دسکتاپ و موبایل.
            </p>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو در عنوان، کدها، تگ‌ها (مثلاً DPAPI)..."
                className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl pr-10 pl-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs shrink-0">
              <button
                onClick={() => setSortBy("latest")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  sortBy === "latest" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                جدیدترین‌ها
              </button>
              <button
                onClick={() => setSortBy("popular")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  sortBy === "popular" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                پربازدیدترین‌ها
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setSelectedTag(null);
              }}
              className={`px-4 py-2 rounded-xl transition-all font-semibold whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {cat}
              {cat === "نشان‌شده‌ها" && bookmarkedIds.length > 0 && (
                <span className="mr-1.5 font-mono">({toPersianDigits(bookmarkedIds.length)})</span>
              )}
            </button>
          ))}
        </div>

        {/* Active Tag Filter Banner */}
        {selectedTag && (
          <div className="mb-6 flex items-center justify-between px-4 py-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs">
            <span>
              فیلتر فعال بر اساس تگ فنی: <strong className="text-emerald-400 font-mono">#{selectedTag}</strong>
            </span>
            <button
              onClick={() => setSelectedTag(null)}
              className="text-slate-300 hover:text-white font-semibold cursor-pointer"
            >
              حذف فیلتر ✕
            </button>
          </div>
        )}

        {/* TIER 1 SALIENCE: Lead Featured Technical Essay */}
        {featuredPost && selectedCategory === "همه" && !searchQuery && !selectedTag && (
          <div
            onClick={() => openArticlePage(featuredPost)}
            className="mb-12 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/25 border border-slate-800 hover:border-emerald-500/50 p-6 sm:p-10 transition-all duration-200 cursor-pointer group"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                {/* Clean unboxed metadata */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span className="text-emerald-400 font-bold">مقاله برگزیده پژوهشی</span>
                  <span aria-hidden="true">·</span>
                  <span>{featuredPost.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>سطح: {featuredPost.difficulty}</span>
                  <span aria-hidden="true">·</span>
                  <span>{featuredPost.date}</span>
                  <span aria-hidden="true">·</span>
                  <span>{featuredPost.readTime} مطالعه</span>
                </div>

                <h2
                  className="text-2xl sm:text-3xl font-black text-white group-hover:text-emerald-300 transition-colors leading-snug"
                  style={{ textWrap: "balance" }}
                >
                  {featuredPost.title}
                </h2>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  {featuredPost.subtitle || featuredPost.summary}
                </p>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
                  <div>
                    <span className="text-slate-200 font-bold">{featuredPost.author}</span>
                    <span className="mx-2">·</span>
                    <span className="font-mono">{featuredPost.authorRole}</span>
                  </div>

                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 group-hover:bg-emerald-500 text-white font-bold transition-colors">
                    <span>ورود به صفحه کامل مقاله</span>
                    <ArrowLeft className="w-4 h-4" />
                  </span>
                </div>
              </div>

              {/* Right Column: TL;DR Preview Box */}
              <div className="lg:col-span-4 rounded-2xl bg-slate-950/90 border border-slate-800/90 p-5 space-y-3">
                <div className="text-xs font-bold text-emerald-400 flex items-center justify-between">
                  <span>در این مقاله فنی می‌خوانید:</span>
                  <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                    {toPersianDigits(featuredPost.content.sections.length)} بخش تخصصی
                  </span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                  {featuredPost.content.sections.slice(0, 4).map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-mono">0{idx + 1}.</span>
                      <span className="line-clamp-1">{s.heading.replace(/^[۰-۹0-9]+\.\s*/, "")}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TIER 2 & 3: 12-Column Editorial Feed (8 Cols Stream + 4 Cols Research Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Articles Stream (8 Cols) */}
          <div className="lg:col-span-8 space-y-5">
            {remainingPosts.map((post) => {
              const isBookmarked = bookmarkedIds.includes(post.id);
              return (
                <article
                  key={post.id}
                  onClick={() => openArticlePage(post)}
                  className="group p-6 sm:p-7 rounded-2xl bg-slate-900/65 border border-slate-800/90 hover:border-emerald-500/50 hover:bg-slate-900 transition-all duration-200 cursor-pointer space-y-4"
                >
                  {/* Unboxed Metadata Line (Zero Pill Discipline) */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-emerald-400 font-bold">{post.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{post.difficulty || "تخصصی"}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{post.date}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {post.readTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 tabular-nums">
                      <span>{toPersianDigits(post.views || 100)} بازدید</span>
                    </div>
                  </div>

                  {/* Headline */}
                  <h3
                    className="text-lg sm:text-xl font-extrabold text-white group-hover:text-emerald-300 transition-colors leading-snug"
                    style={{ textWrap: "balance" }}
                  >
                    {post.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3">
                    {post.summary}
                  </p>

                  {/* Footer: Author, Tags, and Full-Page Link */}
                  <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="font-semibold text-slate-200">{post.author}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-[11px] text-slate-500">
                        {post.tags.slice(0, 3).map((t) => `#${t}`).join("  ")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => copyArticleLink(post, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        title="کپی لینک مستقیم"
                      >
                        {copiedId === post.id ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Share2 className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={(e) => toggleBookmark(post.id, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="نشان کردن مقاله"
                      >
                        <Bookmark
                          className={`w-4 h-4 ${isBookmarked ? "fill-amber-400 text-amber-400" : ""}`}
                        />
                      </button>
                      <span className="flex items-center gap-1 text-emerald-400 font-bold pr-2 group-hover:-translate-x-1 transition-transform">
                        <span>مطالعه در صفحه کامل</span>
                        <ChevronLeft className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}

            {filteredPosts.length === 0 && (
              <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800 p-8 space-y-4">
                <p className="text-slate-400 text-sm">هیچ مقاله‌ای با فیلتر یا عبارت جستجوی شما یافت نشد.</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("همه");
                    setSelectedTag(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  نمایش همه مقالات
                </button>
              </div>
            )}
          </div>

          {/* Right Sidebar (4 Cols): Trending Research, Technical Tags, Book Reader Gateway */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* 1. Most Read Research Articles */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="text-sm font-extrabold text-white border-b border-slate-800 pb-3">
                پرمطالعه‌ترین مقالات فنی
              </h3>
              <div className="space-y-4">
                {topReadPosts.map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => openArticlePage(item)}
                    className="group flex items-start gap-3 cursor-pointer"
                  >
                    <span className="font-mono text-sm font-bold text-emerald-500/80 tabular-nums shrink-0 mt-0.5">
                      0{idx + 1}.
                    </span>
                    <div className="space-y-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition-colors leading-relaxed line-clamp-2">
                        {item.title}
                      </h4>
                      <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                        {item.category} · {toPersianDigits(item.views || 100)} بازدید
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Interactive Technical Topic Filter */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="text-sm font-extrabold text-white border-b border-slate-800 pb-3">
                کلیدواژه‌ها و تگ‌های تخصصی
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                      selectedTag === tag
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Book Reader Bridge */}
            {onOpenReader && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-emerald-950/30 border border-emerald-500/30 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <BookOpen className="w-4 h-4" />
                  <span>مرجع کامل پژوهش آسیب‌پذیری</span>
                </div>
                <h4 className="text-sm font-extrabold text-white">
                  کتاب دوزبانه «از روز صفر تا روز صفر»
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  همراه با ترجمه لحظه‌ای، هایلایت ابری و پادکست صوتی فارسی برای تمامی ۱۱ فصل.
                </p>
                <button
                  onClick={() => onOpenReader()}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>ورود به کتابخوان رهام</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
};
