"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldAlert,
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
  CheckCircle2,
  AlertTriangle,
  Flame,
  Eye,
  Sliders,
  PlusCircle,
  Edit3,
  Layers,
  Cpu,
  Activity,
  FileWarning,
  ChevronLeft,
  X,
} from "lucide-react";
import {
  NewsArticle,
  DEFAULT_NEWS_ARTICLES,
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
}

type NewsCategoryFilter = "all" | "urgent" | "zeroday" | "malware" | "apt" | "cloud";
type SeverityFilter = "ALL" | "CRITICAL" | "HIGH" | "MEDIUM";
type ReaderCanvasTheme = "slate" | "oled" | "sepia" | "light";

const toPersianDigits = (num: number | string): string => {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(num).replace(/\d/g, (d) => persianDigits[Number(d)]);
};

export const ThreatRadarSection: React.FC<ThreatRadarSectionProps> = ({
  onBackToHome,
  onOpenConsultation,
  isAdmin,
  onOpenAdminCms,
  initialNewsSlug,
}) => {
  const [articles, setArticles] = useState<NewsArticle[]>(DEFAULT_NEWS_ARTICLES);
  const [categoryFilter, setCategoryFilter] = useState<NewsCategoryFilter>("all");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("ALL");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [onlySaved, setOnlySaved] = useState<boolean>(false);
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

  // Professional Reader & SOC Analyst tools
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
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = JSON.parse(localStorage.getItem("roham_radar_saved_news") || "[]");
        if (Array.isArray(saved)) return saved;
      } catch {}
    }
    return [];
  });
  const [checkedMitigations, setCheckedMitigations] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState<boolean>(false);

  // Load dynamic news articles from MySQL / contentStore
  useEffect(() => {
    let cancelled = false;
    fetchContentStore().then((res) => {
      if (!cancelled && res.newsArticles.length > 0) {
        const visible = isAdmin
          ? res.newsArticles
          : res.newsArticles.filter((n) => n.status !== "draft");
        setArticles(visible.length > 0 ? visible : DEFAULT_NEWS_ARTICLES);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  // Browser back/forward support for full-page news reports
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      const urlNews = params.get("news");
      setActiveNewsSlug(urlNews || null);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const activeArticle = useMemo(() => {
    if (!activeNewsSlug) return null;
    return (
      articles.find((a) => a.slug === activeNewsSlug || a.id === activeNewsSlug) || null
    );
  }, [articles, activeNewsSlug]);

  // Reading progress listener when viewing a full news report
  useEffect(() => {
    if (!activeArticle) return;
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)));
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [activeArticle]);

  const handleOpenArticle = (article: NewsArticle) => {
    setActiveNewsSlug(article.slug);
    incrementContentView("news", article.id);
    setArticles((prev) =>
      prev.map((item) => (item.id === article.id ? { ...item, views: (item.views || 0) + 1 } : item))
    );
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("news", article.slug);
      window.history.pushState({}, "", url.toString());
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCloseArticle = () => {
    setActiveNewsSlug(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("news");
      window.history.pushState({}, "", url.toString());
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const toggleSaveArticle = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSavedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem("roham_radar_saved_news", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleCopyText = (key: string, text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 2200);
    }
  };

  const handleShareArticle = (article: NewsArticle, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof window === "undefined") return;
    const shareUrl = `${window.location.origin}/radar?news=${encodeURIComponent(article.slug)}`;
    handleCopyText(`share-${article.id}`, `${article.title}\n${shareUrl}`);
  };

  const updateTheme = (theme: ReaderCanvasTheme) => {
    setCanvasTheme(theme);
    try {
      localStorage.setItem("roham_blog_reader_theme", theme);
    } catch {}
  };

  const updateFontSize = (size: number) => {
    const clamped = Math.min(22, Math.max(14, size));
    setFontSize(clamped);
    try {
      localStorage.setItem("roham_blog_reader_fontsize", String(clamped));
    } catch {}
  };

  // Filtered news list
  const filteredArticles = useMemo(() => {
    return articles.filter((item) => {
      if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
      if (severityFilter !== "ALL" && item.severity !== severityFilter) return false;
      if (selectedTag && !(item.tags || []).includes(selectedTag)) return false;
      if (onlySaved && !savedIds.includes(item.id)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = item.title.toLowerCase().includes(q);
        const inSub = (item.subtitle || "").toLowerCase().includes(q);
        const inSum = item.summary.toLowerCase().includes(q);
        const inCve = (item.cveIds || []).some((c) => c.toLowerCase().includes(q));
        const inTags = (item.tags || []).some((t) => t.toLowerCase().includes(q));
        const inProds = (item.affectedProducts || []).some((p) => p.toLowerCase().includes(q));
        return inTitle || inSub || inSum || inCve || inTags || inProds;
      }
      return true;
    });
  }, [articles, categoryFilter, severityFilter, selectedTag, onlySaved, savedIds, searchQuery]);

  const leadBreakingArticle = useMemo(() => {
    return (
      filteredArticles.find((a) => a.isBreaking) ||
      filteredArticles[0] ||
      articles[0] ||
      null
    );
  }, [filteredArticles, articles]);

  const streamArticles = useMemo(() => {
    if (!leadBreakingArticle) return filteredArticles;
    // When filters or search are active, show all matching in stream; otherwise exclude lead hero from duplicate top position
    if (
      categoryFilter !== "all" ||
      severityFilter !== "ALL" ||
      selectedTag !== null ||
      onlySaved ||
      searchQuery.trim() !== ""
    ) {
      return filteredArticles;
    }
    return filteredArticles.filter((a) => a.id !== leadBreakingArticle.id);
  }, [
    filteredArticles,
    leadBreakingArticle,
    categoryFilter,
    severityFilter,
    selectedTag,
    onlySaved,
    searchQuery,
  ]);

  const allTags = useMemo(() => {
    const counts: Record<string, number> = {};
    articles.forEach((a) => {
      (a.tags || []).forEach((t) => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([t]) => t);
  }, [articles]);

  const getSeverityBadgeStyle = (severity: NewsArticle["severity"]) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-rose-950/90 text-rose-300 border-rose-700/70";
      case "HIGH":
        return "bg-amber-950/90 text-amber-300 border-amber-700/70";
      default:
        return "bg-blue-950/90 text-blue-300 border-blue-700/70";
    }
  };

  const getSeverityPersianLabel = (severity: NewsArticle["severity"]) => {
    switch (severity) {
      case "CRITICAL":
        return "بحرانی (CRITICAL)";
      case "HIGH":
        return "شدت بالا (HIGH)";
      default:
        return "متوسط (MEDIUM)";
    }
  };

  // ============================================================================
  // VIEW 1: FULL-PAGE THREAT INTELLIGENCE & NEWS REPORT VIEW (ZERO POPUPS)
  // ============================================================================
  if (activeArticle) {
    const currentIndex = articles.findIndex((a) => a.id === activeArticle.id);
    const prevArticle = currentIndex > 0 ? articles[currentIndex - 1] : null;
    const nextArticle =
      currentIndex >= 0 && currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null;
    const relatedArticles = articles
      .filter((a) => a.id !== activeArticle.id)
      .sort((a, b) => (a.category === activeArticle.category ? -1 : 1))
      .slice(0, 3);

    const mitigations = activeArticle.mitigationSteps || [];
    const completedMitigationsCount = mitigations.filter(
      (_, idx) => checkedMitigations[`${activeArticle.id}-${idx}`]
    ).length;

    const themeClasses: Record<
      ReaderCanvasTheme,
      { wrapper: string; surface: string; text: string; subtext: string; border: string }
    > = {
      slate: {
        wrapper: "bg-slate-950 text-slate-100",
        surface: "bg-slate-900/90 border-slate-800",
        text: "text-slate-200",
        subtext: "text-slate-400",
        border: "border-slate-800",
      },
      oled: {
        wrapper: "bg-black text-zinc-100",
        surface: "bg-zinc-950 border-zinc-800/90",
        text: "text-zinc-200",
        subtext: "text-zinc-400",
        border: "border-zinc-800",
      },
      sepia: {
        wrapper: "bg-[#f8f1e0] text-[#261f16]",
        surface: "bg-[#efe5ce] border-[#d8c9a8]",
        text: "text-[#2c2419]",
        subtext: "text-[#63533d]",
        border: "border-[#d8c9a8]",
      },
      light: {
        wrapper: "bg-slate-50 text-slate-900",
        surface: "bg-white border-slate-200",
        text: "text-slate-800",
        subtext: "text-slate-500",
        border: "border-slate-200",
      },
    };

    const currentTheme = themeClasses[canvasTheme];
    const isLightMode = canvasTheme === "light" || canvasTheme === "sepia";

    return (
      <article
        id="radar-full-article-view"
        className={`min-h-screen pb-20 transition-colors duration-200 ${currentTheme.wrapper}`}
        style={{ direction: "rtl" }}
      >
        {/* Top Reading Progress Bar */}
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-slate-900/50">
          <div
            className="h-full bg-gradient-to-l from-rose-500 via-amber-400 to-emerald-400 transition-all duration-150"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        {/* Sticky Newsroom Action Bar */}
        <div
          className={`sticky top-0 z-30 border-b backdrop-blur-md transition-colors ${
            isLightMode
              ? "bg-white/90 border-slate-200 text-slate-800"
              : "bg-slate-950/90 border-slate-800/90 text-slate-200"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                onClick={handleCloseArticle}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-xs"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>بازگشت به رادار اخبار</span>
              </button>

              <span className="text-slate-500 hidden md:inline">/</span>
              <span className="text-xs font-semibold truncate hidden md:inline opacity-85">
                {activeArticle.title}
              </span>
            </div>

            {/* Right Controls: Reader Theme, Font Size, Save, Share, Print */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {isAdmin && onOpenAdminCms && (
                <button
                  onClick={onOpenAdminCms}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-bold hover:bg-amber-500/25 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>ویرایش در CMS</span>
                </button>
              )}

              <button
                onClick={() => setMobileSettingsOpen(!mobileSettingsOpen)}
                className={`p-2 rounded-xl border text-xs flex items-center gap-1 cursor-pointer ${
                  isLightMode
                    ? "bg-slate-100 border-slate-300 text-slate-700"
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
                }`}
                title="تنظیمات نمایش و اندازه قلم"
              >
                <Sliders className="w-3.5 h-3.5 text-emerald-500" />
                <span className="hidden sm:inline">تنظیمات مطالعه</span>
              </button>

              <button
                onClick={() => toggleSaveArticle(activeArticle.id)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  savedIds.includes(activeArticle.id)
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                    : isLightMode
                      ? "bg-slate-100 border-slate-300 text-slate-700"
                      : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
                }`}
                title="ذخیره در لیست گزارش‌های منتخب"
              >
                <Bookmark className="w-4 h-4" />
              </button>

              <button
                onClick={(e) => handleShareArticle(activeArticle, e)}
                className={`px-2.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                  isLightMode
                    ? "bg-slate-100 border-slate-300 text-slate-700"
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
                }`}
                title="کپی لینک مستقیم گزارش خبری"
              >
                {copiedKey === `share-${activeArticle.id}` ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500 hidden sm:inline">کپی شد</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">اشتراک‌گذاری</span>
                  </>
                )}
              </button>

              <button
                onClick={() => typeof window !== "undefined" && window.print()}
                className={`hidden sm:flex p-2 rounded-xl border cursor-pointer ${
                  isLightMode
                    ? "bg-slate-100 border-slate-300 text-slate-700"
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
                }`}
                title="چاپ بولتن امنیتی / ذخیره PDF"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Collapsible Reader Appearance Settings Drawer */}
          {mobileSettingsOpen && (
            <div
              className={`border-t px-4 py-3 ${
                isLightMode ? "bg-slate-100 border-slate-200" : "bg-slate-900 border-slate-800"
              }`}
            >
              <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold">تم صفحه مطالعه:</span>
                  {(
                    [
                      { id: "slate", label: "تیره استاندارد" },
                      { id: "oled", label: "مشکی OLED" },
                      { id: "sepia", label: "کاغذی گرم" },
                      { id: "light", label: "روشن" },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => updateTheme(t.id)}
                      className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
                        canvasTheme === t.id
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-800/20 hover:bg-slate-800/40"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold">اندازه متن ({toPersianDigits(fontSize)}px):</span>
                  <button
                    onClick={() => updateFontSize(fontSize - 1)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 text-white font-bold cursor-pointer"
                  >
                    A-
                  </button>
                  <button
                    onClick={() => updateFontSize(fontSize + 1)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 text-white font-bold cursor-pointer"
                  >
                    A+
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main 2-Column News & Threat Intelligence Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Main Editorial Story Column (8 cols) */}
            <div className="lg:col-span-8 min-w-0">
              {/* Unboxed Editorial Metadata Line */}
              <div className="flex flex-wrap items-center gap-2.5 text-xs mb-4">
                <span
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold border font-mono ${getSeverityBadgeStyle(
                    activeArticle.severity
                  )}`}
                >
                  {getSeverityPersianLabel(activeArticle.severity)}
                </span>
                <span className="font-bold text-emerald-500">{activeArticle.categoryLabel}</span>
                <span aria-hidden="true" className="opacity-40">
                  ·
                </span>
                <span className={`flex items-center gap-1 tabular-nums ${currentTheme.subtext}`}>
                  <Clock className="w-3.5 h-3.5" />
                  {activeArticle.date}
                </span>
                <span aria-hidden="true" className="opacity-40">
                  ·
                </span>
                <span className={currentTheme.subtext}>زمان مطالعه: {activeArticle.readTime}</span>
                {activeArticle.views && (
                  <>
                    <span aria-hidden="true" className="opacity-40">
                      ·
                    </span>
                    <span className={`flex items-center gap-1 ${currentTheme.subtext}`}>
                      <Eye className="w-3.5 h-3.5" />
                      {toPersianDigits(activeArticle.views)} بازدید
                    </span>
                  </>
                )}
              </div>

              {/* Headline */}
              <h1
                className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-[1.35] mb-4"
                style={{ textWrap: "balance" }}
              >
                {activeArticle.title}
              </h1>

              {/* Subtitle / Deck */}
              {activeArticle.subtitle && (
                <p
                  className={`text-base sm:text-lg leading-relaxed mb-6 font-medium ${currentTheme.subtext}`}
                >
                  {activeArticle.subtitle}
                </p>
              )}

              {/* Author & Source Byline */}
              <div
                className={`py-4 px-5 rounded-2xl border mb-8 flex flex-wrap items-center justify-between gap-4 ${currentTheme.surface}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm shrink-0">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold">{activeArticle.author}</div>
                    <div className={`text-[11px] font-mono ${currentTheme.subtext}`}>
                      Source: {activeArticle.source || "Roham Threat Intelligence"}
                    </div>
                  </div>
                </div>

                {activeArticle.cveIds && activeArticle.cveIds.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5" style={{ direction: "ltr" }}>
                    {activeArticle.cveIds.map((cve) => (
                      <span
                        key={cve}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-amber-400 font-mono text-xs font-bold"
                      >
                        {cve}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile-Only Quick Threat Dossier Card */}
              <div
                className={`lg:hidden p-5 rounded-2xl border mb-8 space-y-3 ${currentTheme.surface}`}
              >
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-2.5">
                  <span className="text-xs font-extrabold text-amber-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    شناسنامه فنی تهدید (Threat Dossier)
                  </span>
                  {activeArticle.cvssScore && (
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-700/50 text-xs font-mono font-bold">
                      CVSS {activeArticle.cvssScore}
                    </span>
                  )}
                </div>
                {activeArticle.exploitStatus && (
                  <div className="text-xs">
                    <span className={currentTheme.subtext}>وضعیت اکسپلویت: </span>
                    <span className="font-bold text-rose-400">{activeArticle.exploitStatus}</span>
                  </div>
                )}
                {activeArticle.affectedProducts && activeArticle.affectedProducts.length > 0 && (
                  <div className="space-y-1">
                    <div className={`text-[11px] ${currentTheme.subtext}`}>
                      سامانه‌ها و محصولات تحت تاثیر:
                    </div>
                    <div className="flex flex-wrap gap-1.5" style={{ direction: "ltr" }}>
                      {activeArticle.affectedProducts.map((prod) => (
                        <span
                          key={prod}
                          className="px-2 py-0.5 rounded bg-slate-950/90 text-slate-200 border border-slate-800 text-[11px] font-mono"
                        >
                          {prod}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Key Highlights Box (The Hacker News style "Key Takeaways / نکات کلیدی خبر") */}
              {activeArticle.keyHighlights && activeArticle.keyHighlights.length > 0 && (
                <div
                  className={`p-6 rounded-2xl border mb-8 space-y-3.5 ${
                    isLightMode
                      ? "bg-emerald-50/70 border-emerald-200"
                      : "bg-emerald-950/20 border-emerald-500/30"
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-extrabold text-emerald-400">
                    <Flame className="w-4 h-4 shrink-0" />
                    <span>خلاصه مدیریتی و نکات کلیدی این گزارش (Key Highlights)</span>
                  </div>
                  <ul className="space-y-2.5">
                    {activeArticle.keyHighlights.map((hl, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed"
                      >
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                          {toPersianDigits(i + 1)}
                        </span>
                        <span className={currentTheme.text}>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Cover Image if available */}
              {activeArticle.coverImage && (
                <figure className={`rounded-2xl overflow-hidden border mb-8 ${currentTheme.surface}`} style={{ maxWidth: "68ch" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeArticle.coverImage}
                    alt={activeArticle.title}
                    referrerPolicy="no-referrer"
                    className="w-full max-h-[380px] object-cover"
                  />
                  {activeArticle.downloadedImages?.[0]?.localPath && (
                    <figcaption className={`px-4 py-2 text-[11px] font-mono border-t border-slate-800/60 ${currentTheme.subtext} flex items-center justify-between`}>
                      <span>تصویر مستند گزارش خبری</span>
                      <span dir="ltr">{activeArticle.downloadedImages[0].localPath}</span>
                    </figcaption>
                  )}
                </figure>
              )}

              {/* Lead Summary Paragraph */}
              <div
                className={`leading-[1.95] mb-8 font-medium ${currentTheme.text}`}
                style={{ fontSize: `${fontSize + 1}px`, maxWidth: "68ch" }}
              >
                {activeArticle.summary}
              </div>

              {/* Multi-Section Deep Technical News Body */}
              <div className="space-y-10" style={{ fontSize: `${fontSize}px`, maxWidth: "68ch" }}>
                {activeArticle.sections.map((sec, idx) => (
                  <section
                    key={idx}
                    id={`news-sec-${idx}`}
                    className="space-y-4 scroll-mt-24"
                  >
                    <h2 className="text-lg sm:text-2xl font-extrabold tracking-tight flex items-center gap-2.5 pt-2">
                      <span className="w-2 h-6 rounded-full bg-emerald-500 shrink-0" />
                      <span>{sec.heading}</span>
                    </h2>

                    <div className="space-y-4">
                      {sec.paragraphs.map((p, pIdx) => (
                        <p
                          key={pIdx}
                          className={`leading-[1.95] ${currentTheme.text}`}
                        >
                          {p}
                        </p>
                      ))}
                    </div>

                    {/* Section Downloaded Image / Technical Figure */}
                    {sec.imageUrl && (
                      <figure className={`rounded-2xl overflow-hidden border my-5 ${currentTheme.surface}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={sec.imageUrl}
                          alt={sec.imageAlt || sec.heading}
                          referrerPolicy="no-referrer"
                          className="w-full max-h-[380px] object-cover"
                        />
                        {sec.imageAlt && (
                          <figcaption className={`px-4 py-2.5 text-xs border-t border-slate-800/60 ${currentTheme.subtext}`}>
                            {sec.imageAlt}
                          </figcaption>
                        )}
                      </figure>
                    )}

                    {/* Technical Code / Payload / Log Block */}
                    {sec.codeSnippet && (
                      <div
                        className="my-5 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-100 shadow-lg"
                        style={{ direction: "ltr", textAlign: "left" }}
                      >
                        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                          <div className="flex items-center gap-2">
                            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="uppercase font-bold text-emerald-400">
                              {sec.codeLanguage || "payload / log"}
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              handleCopyText(`code-${idx}`, sec.codeSnippet || "")
                            }
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] cursor-pointer transition-colors"
                          >
                            {copiedKey === `code-${idx}` ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Snippet</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-4 sm:p-5 text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed text-emerald-100">
                          <code>{sec.codeSnippet}</code>
                        </pre>
                      </div>
                    )}

                    {/* Callout / Advisory Note */}
                    {sec.callout && (
                      <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/30 border border-amber-500/40 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-xs sm:text-sm leading-relaxed text-amber-200 font-medium">
                          {sec.callout}
                        </p>
                      </div>
                    )}
                  </section>
                ))}
              </div>

              {/* Indicators of Compromise (IoCs) & Threat Hunting Table */}
              {activeArticle.iocs && activeArticle.iocs.length > 0 && (
                <section
                  id="news-iocs"
                  className="mt-12 pt-8 border-t border-slate-800/80 space-y-4 scroll-mt-24"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg sm:text-xl font-extrabold flex items-center gap-2">
                      <FileWarning className="w-5 h-5 text-rose-400" />
                      <span>شاخص‌های آلودگی و شکار تهدید (Indicators of Compromise - IoCs)</span>
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                      SOC / SIEM Ready
                    </span>
                  </div>

                  <p className={`text-xs sm:text-sm ${currentTheme.subtext}`}>
                    تیم‌های مرکز عملیات امنیت (SOC) و شکار تهدید می‌توانند از الگوها و مقادیر زیر برای جستجو در لاگ‌های EDR، Sysmon و فایروال استفاده کنند:
                  </p>

                  <div className="space-y-3">
                    {activeArticle.iocs.map((ioc, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border transition-all ${currentTheme.surface}`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] font-mono font-bold">
                            {ioc.type}
                          </span>
                          <button
                            onClick={() => handleCopyText(`ioc-${idx}`, ioc.value)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-mono cursor-pointer"
                          >
                            {copiedKey === `ioc-${idx}` ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">کپی شد</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>کپی شاخص (Copy IoC)</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div
                          className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto mb-2"
                          style={{ direction: "ltr", textAlign: "left" }}
                        >
                          {ioc.value}
                        </div>

                        <div className={`text-xs ${currentTheme.subtext}`}>{ioc.description}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Interactive Mitigation & Defensive Checklist */}
              {mitigations.length > 0 && (
                <section
                  id="news-mitigations"
                  className="mt-12 p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border border-emerald-500/40 space-y-5 scroll-mt-24 text-slate-100"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-base sm:text-lg">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <span>چک‌لیست عملیاتی پیشگیری و ایمن‌سازی (Mitigation Playbook)</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        گام‌های زیر را برای ایمن‌سازی زیرساخت خود بررسی و تیک بزنید:
                      </p>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 shrink-0 self-start">
                      {toPersianDigits(completedMitigationsCount)} از{" "}
                      {toPersianDigits(mitigations.length)} اقدام تکمیل شد
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {mitigations.map((step, idx) => {
                      const key = `${activeArticle.id}-${idx}`;
                      const isDone = !!checkedMitigations[key];
                      return (
                        <label
                          key={idx}
                          onClick={() =>
                            setCheckedMitigations((prev) => ({ ...prev, [key]: !prev[key] }))
                          }
                          className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                            isDone
                              ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-200"
                              : "bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-200"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isDone}
                            onChange={() => {}}
                            className="mt-1 w-4 h-4 rounded accent-emerald-500 shrink-0"
                          />
                          <span
                            className={`text-xs sm:text-sm leading-relaxed ${
                              isDone ? "line-through opacity-75" : ""
                            }`}
                          >
                            {step}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Chronological Incident Timeline */}
              {activeArticle.timeline && activeArticle.timeline.length > 0 && (
                <section
                  id="news-timeline"
                  className="mt-12 pt-8 border-t border-slate-800/80 space-y-5 scroll-mt-24"
                >
                  <h3 className="text-lg font-extrabold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-amber-400" />
                    <span>تایم‌لاین رخداد و سیر زمانی کشف تهدید</span>
                  </h3>

                  <div className="relative pr-4 border-r-2 border-emerald-500/40 space-y-4">
                    {activeArticle.timeline.map((item, idx) => (
                      <div key={idx} className="relative">
                        <span className="absolute -right-[21px] top-1.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-slate-950" />
                        <div className={`p-4 rounded-2xl border ${currentTheme.surface}`}>
                          <div className="text-xs font-bold text-emerald-400 mb-1">
                            {item.time}
                          </div>
                          <div className={`text-xs sm:text-sm ${currentTheme.text}`}>
                            {item.event}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Article Tags */}
              {activeArticle.tags && activeArticle.tags.length > 0 && (
                <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                  <span className={`text-xs font-bold ${currentTheme.subtext}`}>برچسب‌ها:</span>
                  {activeArticle.tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSelectedTag(tag);
                        handleCloseArticle();
                      }}
                      className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono cursor-pointer transition-colors"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}

              {/* Next / Previous News Report Navigation */}
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {prevArticle ? (
                  <button
                    onClick={() => handleOpenArticle(prevArticle)}
                    className={`p-4 rounded-2xl border text-right transition-all cursor-pointer group ${currentTheme.surface} hover:border-emerald-500/50`}
                  >
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                      <span>گزارش قبلی</span>
                    </div>
                    <div className="text-xs sm:text-sm font-bold group-hover:text-emerald-400 transition-colors line-clamp-2">
                      {prevArticle.title}
                    </div>
                  </button>
                ) : (
                  <div />
                )}

                {nextArticle && (
                  <button
                    onClick={() => handleOpenArticle(nextArticle)}
                    className={`p-4 rounded-2xl border text-right transition-all cursor-pointer group ${currentTheme.surface} hover:border-emerald-500/50`}
                  >
                    <div className="text-[11px] text-slate-400 flex items-center justify-end gap-1 mb-1">
                      <span>گزارش بعدی</span>
                      <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="text-xs sm:text-sm font-bold group-hover:text-emerald-400 transition-colors line-clamp-2">
                      {nextArticle.title}
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* Sticky Desktop Threat Intelligence Dossier Sidebar (4 cols) */}
            <aside className="hidden lg:block lg:col-span-4 sticky top-20 space-y-6">
              {/* Threat Intelligence Dossier Card */}
              <div className={`p-6 rounded-3xl border space-y-5 ${currentTheme.surface}`}>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-rose-400" />
                    <h3 className="text-sm font-extrabold">پرونده فنی تهدید (Threat Dossier)</h3>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold border ${getSeverityBadgeStyle(
                      activeArticle.severity
                    )}`}
                  >
                    {activeArticle.severity}
                  </span>
                </div>

                <div className="space-y-3.5 text-xs">
                  {activeArticle.cvssScore && (
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/90 border border-slate-800">
                      <span className="text-slate-400">امتیاز شدت آسیب‌پذیری (CVSS):</span>
                      <span className="text-sm font-black font-mono text-rose-400">
                        {activeArticle.cvssScore} / 10
                      </span>
                    </div>
                  )}

                  {activeArticle.exploitStatus && (
                    <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-1">
                      <div className="text-[11px] text-rose-300 font-bold">وضعیت بهره‌برداری در حیات وحش:</div>
                      <div className="text-xs text-rose-200 font-semibold">
                        {activeArticle.exploitStatus}
                      </div>
                    </div>
                  )}

                  {activeArticle.cveIds && activeArticle.cveIds.length > 0 && (
                    <div className="space-y-1.5">
                      <div className={currentTheme.subtext}>شناسه‌های CVE / MITRE ATT&CK:</div>
                      <div className="flex flex-wrap gap-1.5" style={{ direction: "ltr" }}>
                        {activeArticle.cveIds.map((id) => (
                          <span
                            key={id}
                            className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-amber-400 font-mono text-xs font-bold"
                          >
                            {id}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeArticle.affectedProducts && activeArticle.affectedProducts.length > 0 && (
                    <div className="space-y-1.5">
                      <div className={currentTheme.subtext}>بسترها و محصولات هدف:</div>
                      <ul className="space-y-1.5" style={{ direction: "ltr", textAlign: "left" }}>
                        {activeArticle.affectedProducts.map((prod) => (
                          <li
                            key={prod}
                            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-[11px] flex items-center gap-2"
                          >
                            <Cpu className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{prod}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Quick Section Jump in Article */}
                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-emerald-400 mb-2">
                    دسترسی سریع به بخش‌های گزارش:
                  </div>
                  {activeArticle.sections.map((sec, idx) => (
                    <a
                      key={idx}
                      href={`#news-sec-${idx}`}
                      className="block text-xs text-slate-400 hover:text-emerald-400 transition-colors py-1 truncate"
                    >
                      • {sec.heading}
                    </a>
                  ))}
                  {activeArticle.iocs && activeArticle.iocs.length > 0 && (
                    <a
                      href="#news-iocs"
                      className="block text-xs text-rose-400 hover:text-rose-300 font-semibold py-1"
                    >
                      • شاخص‌های آلودگی (IoCs)
                    </a>
                  )}
                  {mitigations.length > 0 && (
                    <a
                      href="#news-mitigations"
                      className="block text-xs text-emerald-400 hover:text-emerald-300 font-semibold py-1"
                    >
                      • چک‌لیست اقدام و پیشگیری (Mitigation)
                    </a>
                  )}
                </div>
              </div>

              {/* Emergency Incident Response CTA */}
              {onOpenConsultation && (
                <div className="p-6 rounded-3xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/30 space-y-3">
                  <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <Radio className="w-4 h-4 animate-pulse" />
                    <span>نیاز به بررسی فوری یا پاسخ به رخداد دارید؟</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    تیم پاسخ به رخداد و شکار تهدید رهام آماده بررسی لاگ‌ها، ارزیابی آسیب‌پذیری و استقرار آنتی‌استیلر در سازمان شماست.
                  </p>
                  <button
                    onClick={onOpenConsultation}
                    className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer transition-colors"
                  >
                    درخواست مشاوره و بررسی امنیتی
                  </button>
                </div>
              )}

              {/* Related News Bulletins */}
              {relatedArticles.length > 0 && (
                <div className={`p-5 rounded-3xl border space-y-3.5 ${currentTheme.surface}`}>
                  <h4 className="text-xs font-extrabold text-slate-300">
                    سایر بولتن‌های خبری مرتبط
                  </h4>
                  <div className="space-y-3">
                    {relatedArticles.map((rel) => (
                      <div
                        key={rel.id}
                        onClick={() => handleOpenArticle(rel)}
                        className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all group"
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                          <span className="text-emerald-400">{rel.categoryLabel}</span>
                          <span>{rel.severity}</span>
                        </div>
                        <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 line-clamp-2 leading-snug">
                          {rel.title}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </article>
    );
  }

  // ============================================================================
  // VIEW 2: MAIN CYBERSECURITY NEWSROOM & THREAT RADAR PORTAL (/radar)
  // ============================================================================
  return (
    <section id="radar" className="py-10 sm:py-16 bg-slate-950 min-h-screen text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        {/* Top Navigation Breadcrumb + Admin CMS Action */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            {onBackToHome && (
              <>
                <button
                  onClick={onBackToHome}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer flex items-center gap-1.5"
                >
                  <span>صفحه اصلی رهام</span>
                </button>
                <span>/</span>
              </>
            )}
            <span className="text-slate-200 font-semibold">
              رادار اخبار امنیت سایبری و هوش تهدیدات (Threat Intelligence Newsroom)
            </span>
          </div>

          {isAdmin && onOpenAdminCms && (
            <button
              onClick={onOpenAdminCms}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/15 border border-amber-500/40 hover:bg-amber-500/25 text-amber-300 text-xs font-bold cursor-pointer transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>انتشار خبر جدید / مدیریت رادار (CMS)</span>
            </button>
          )}
        </div>

        {/* Live Threat Ticker Banner */}
        <div className="p-3 sm:px-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-bold flex items-center gap-1.5 shrink-0">
              <Radio className="w-3.5 h-3.5 animate-pulse text-rose-400" />
              <span>وضعیت تهدیدات: بالا</span>
            </span>
            <p className="text-xs text-slate-300 truncate">
              جدیدترین بولتن: کمپین‌های فعال ClickFix استیلر LummaC2 و آسیب‌پذیری‌های روز صفر گیت‌وی‌های سازمانی
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 shrink-0">
            <span>{toPersianDigits(articles.length)} گزارش تحلیلی کامل</span>
            <span>·</span>
            <span className="text-emerald-400">همگام با دیتابیس MySQL</span>
          </div>
        </div>

        {/* Newsroom Header & Search Controls */}
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400">
                <Radio className="w-4 h-4" />
                <span>ROHAM CYBERSECURITY NEWSROOM & THREAT RADAR</span>
              </div>
              <h1
                className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.2]"
                style={{ textWrap: "balance" }}
              >
                اخبار تخصصی امنیت سایبری، کالبدشکافی بدافزارها و هشدارهای روز صفر
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                هر گزارش شامل تحلیل کامل فنی، کدها و پیلودهای حمله، شاخص‌های آلودگی (IoCs) قابل کپی برای تیم‌های SOC و چک‌لیست گام‌به‌گام ایمن‌سازی در یک صفحه اختصاصی و خوانا است.
              </p>
            </div>

            {/* Search Input */}
            <div className="w-full lg:w-80 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="جستجوی خبر، CVE، نام بدافزار یا محصول..."
                  className="w-full pr-10 pl-8 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:outline-none text-xs text-white placeholder-slate-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filter Bar: Categories + Severity + Bookmarks */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-900">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {(
                [
                  { id: "all", label: "همه اخبار و گزارش‌ها" },
                  { id: "urgent", label: "هشدارهای فوری (SOC)" },
                  { id: "zeroday", label: "آسیب‌پذیری روز صفر (0-Day)" },
                  { id: "malware", label: "تحلیل بدافزار و استیلر" },
                  { id: "apt", label: "باج‌افزار و حملات APT" },
                  { id: "cloud", label: "امنیت ابری و زنجیره تامین" },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    categoryFilter === cat.id
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {/* Severity Filter */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px]">
                {(["ALL", "CRITICAL", "HIGH"] as const).map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setSeverityFilter(sev)}
                    className={`px-2.5 py-1 rounded-lg font-mono font-bold cursor-pointer transition-colors ${
                      severityFilter === sev
                        ? sev === "CRITICAL"
                          ? "bg-rose-600 text-white"
                          : sev === "HIGH"
                            ? "bg-amber-600 text-white"
                            : "bg-slate-700 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {sev === "ALL" ? "همه سطوح" : sev}
                  </button>
                ))}
              </div>

              {/* Saved Filter */}
              <button
                onClick={() => setOnlySaved(!onlySaved)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-colors ${
                  onlySaved
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>ذخیره‌شده‌ها ({toPersianDigits(savedIds.length)})</span>
              </button>
            </div>
          </div>

          {selectedTag && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">فیلتر برچسب فعال:</span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-700/50 font-mono flex items-center gap-1.5">
                #{selectedTag}
                <button
                  onClick={() => setSelectedTag(null)}
                  className="hover:text-white cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            </div>
          )}
        </div>

        {/* Lead Breaking Threat Story (Only shown when default view is active) */}
        {leadBreakingArticle &&
          categoryFilter === "all" &&
          severityFilter === "ALL" &&
          !selectedTag &&
          !onlySaved &&
          !searchQuery.trim() && (
            <div
              onClick={() => handleOpenArticle(leadBreakingArticle)}
              className="group rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-rose-950/25 border border-slate-800 hover:border-emerald-500/60 p-6 sm:p-8 lg:p-10 transition-all cursor-pointer shadow-2xl"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex flex-wrap items-center gap-2.5 text-xs">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold border ${getSeverityBadgeStyle(
                        leadBreakingArticle.severity
                      )}`}
                    >
                      {getSeverityPersianLabel(leadBreakingArticle.severity)}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold">
                      {leadBreakingArticle.categoryLabel}
                    </span>
                    <span className="text-slate-400 tabular-nums">{leadBreakingArticle.date}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-400">مطالعه: {leadBreakingArticle.readTime}</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white group-hover:text-emerald-300 transition-colors leading-snug">
                    {leadBreakingArticle.title}
                  </h2>

                  {leadBreakingArticle.subtitle && (
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                      {leadBreakingArticle.subtitle}
                    </p>
                  )}

                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed line-clamp-3">
                    {leadBreakingArticle.summary}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2" style={{ direction: "ltr" }}>
                      {(leadBreakingArticle.cveIds || []).map((cve) => (
                        <span
                          key={cve}
                          className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-amber-400 font-mono text-xs font-bold"
                        >
                          {cve}
                        </span>
                      ))}
                      {leadBreakingArticle.cvssScore && (
                        <span className="px-2.5 py-1 rounded-lg bg-rose-950/80 border border-rose-800/60 text-rose-300 font-mono text-xs font-bold">
                          CVSS {leadBreakingArticle.cvssScore}
                        </span>
                      )}
                    </div>

                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 group-hover:bg-emerald-500 text-white text-xs font-bold transition-colors">
                      <span>مطالعه گزارش کامل، IoCها و چک‌لیست دفاعی</span>
                      <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>

                {/* Right Highlights Preview Box */}
                <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-950/90 border border-slate-800/90 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-400 border-b border-slate-800 pb-2.5">
                    <span className="flex items-center gap-1.5">
                      <Flame className="w-4 h-4" />
                      نکات کلیدی این بولتن
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">THREAT BRIEF</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
                    {(leadBreakingArticle.keyHighlights || []).slice(0, 3).map((hl, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span className="line-clamp-2">{hl}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-400">
                    <span>شاخص‌های شکار تهدید (IoCs):</span>
                    <span className="font-mono text-rose-400 font-bold">
                      {toPersianDigits((leadBreakingArticle.iocs || []).length)} مورد ثبت‌شده
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Main Newsroom Feed + Intelligence Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* News Stream Column (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>فید کامل گزارش‌های خبری و بولتن‌های امنیتی</span>
              </h3>
              <span className="text-xs text-slate-400">
                نمایش {toPersianDigits(filteredArticles.length)} گزارش
              </span>
            </div>

            {streamArticles.length === 0 ? (
              <div className="p-12 rounded-3xl bg-slate-900/50 border border-slate-800 text-center space-y-3">
                <p className="text-sm font-bold text-slate-300">
                  گزارشی منطبق با فیلتر یا عبارت جستجوی شما یافت نشد.
                </p>
                <button
                  onClick={() => {
                    setCategoryFilter("all");
                    setSeverityFilter("ALL");
                    setSelectedTag(null);
                    setOnlySaved(false);
                    setSearchQuery("");
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                >
                  نمایش همه اخبار رادار
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {streamArticles.map((article) => (
                  <article
                    key={article.id}
                    onClick={() => handleOpenArticle(article)}
                    className="group p-5 sm:p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition-all cursor-pointer space-y-4"
                  >
                    {/* Metadata Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getSeverityBadgeStyle(
                            article.severity
                          )}`}
                        >
                          {article.severity}
                        </span>
                        <span className="text-emerald-400 font-bold">{article.categoryLabel}</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-slate-400 tabular-nums">{article.date}</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-slate-400">{article.readTime}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {article.cvssScore && (
                          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-rose-400 font-mono text-[11px] font-bold">
                            CVSS {article.cvssScore}
                          </span>
                        )}
                        <button
                          onClick={(e) => toggleSaveArticle(article.id, e)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            savedIds.includes(article.id)
                              ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                          }`}
                          title="ذخیره گزارش"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Title & Summary */}
                    <div className="space-y-2">
                      <h3 className="text-base sm:text-xl font-extrabold text-white group-hover:text-emerald-300 transition-colors leading-snug">
                        {article.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed line-clamp-2">
                        {article.summary}
                      </p>
                    </div>

                    {/* Bottom Bar: CVEs, IoC count, and Full-Page Link */}
                    <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        {(article.cveIds || []).slice(0, 2).map((cve) => (
                          <span
                            key={cve}
                            className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-400 font-mono text-[11px]"
                            style={{ direction: "ltr" }}
                          >
                            {cve}
                          </span>
                        ))}
                        {article.iocs && article.iocs.length > 0 && (
                          <span className="text-[11px] text-slate-400">
                            شامل {toPersianDigits(article.iocs.length)} شاخص IoC و{" "}
                            {toPersianDigits((article.mitigationSteps || []).length)} راهکار دفاعی
                          </span>
                        )}
                      </div>

                      <span className="font-bold text-emerald-400 group-hover:text-emerald-300 flex items-center gap-1">
                        <span>ورود به صفحه کامل گزارش خبری</span>
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar: Active CVE Matrix, Popular Bulletins, and Tags (4 cols) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Active Threat & CVE Radar Widget */}
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>جدول آسیب‌پذیری‌ها و تکنیک‌های فعال</span>
                </h4>
                <span className="text-[10px] font-mono text-emerald-400">LIVE MATRIX</span>
              </div>

              <div className="space-y-2.5">
                {articles.slice(0, 5).map((art) => (
                  <div
                    key={art.id}
                    onClick={() => handleOpenArticle(art)}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800/90 hover:border-emerald-500/40 cursor-pointer transition-all flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div
                        className="text-xs font-mono font-bold text-amber-400 truncate"
                        style={{ direction: "ltr", textAlign: "right" }}
                      >
                        {(art.cveIds && art.cveIds[0]) || art.category.toUpperCase()}
                      </div>
                      <div className="text-[11px] text-slate-300 truncate">{art.title}</div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 border ${getSeverityBadgeStyle(
                        art.severity
                      )}`}
                    >
                      {art.cvssScore ? `CVSS ${art.cvssScore}` : art.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Topics & Threat Tags */}
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
              <h4 className="text-sm font-extrabold text-white">برچسب‌های تخصصی شکار تهدید</h4>
              <div className="flex flex-wrap gap-1.5">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-mono cursor-pointer transition-colors ${
                      selectedTag === tag
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-950 border border-slate-800 text-slate-300 hover:border-emerald-500/40"
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Enterprise Advisory Callout */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 space-y-3">
              <div className="text-xs font-extrabold text-emerald-400">
                دفاع پیشگیرانه در برابر استیلرها و تهدیدات روز
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                بیش از ۷۰٪ حوادث بررسی‌شده در رادار تهدیدات رهام با سرقت کوکی‌های مرورگر و توکن‌های نشست آغاز می‌شوند. آنتی‌استیلر رهام زنجیره حمله را در همان ثانیه اول متوقف می‌کند.
              </p>
              {onOpenConsultation && (
                <button
                  onClick={onOpenConsultation}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer transition-colors"
                >
                  دریافت مشاوره امن‌سازی سازمان
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};
