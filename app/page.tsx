"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import { Book, Chapter, ReaderPreferences, Highlight, SavedWord, TranslationResult } from "@/types/reader";
import { SAMPLE_BOOKS } from "@/data/sampleBooks";
import { ChapterViewer } from "@/components/ChapterViewer";
import { ReaderNavbar } from "@/components/ReaderNavbar";
import { TableOfContentsDrawer } from "@/components/TableOfContentsDrawer";
import { ReaderSettingsModal } from "@/components/ReaderSettingsModal";
import { HighlightsDrawer } from "@/components/HighlightsDrawer";
import { VocabularyDrawer } from "@/components/VocabularyDrawer";
import { TranslationCard } from "@/components/TranslationCard";
import { ChapterBottomBar } from "@/components/ChapterBottomBar";
import { LibraryDataModal } from "@/components/LibraryDataModal";
import { ReaderLibraryHome } from "@/components/ReaderLibraryHome";
import { AuthAccountModal } from "@/components/AuthAccountModal";
import { AdminPanel } from "@/components/AdminPanel";
import {
  RohamUser,
  SiteSettings,
  fetchCurrentUser,
  fetchPublicSiteConfig,
  pushCloudSync,
} from "@/lib/authSync";
import { buildExportPayload, downloadJson, parseImportPayload, mergeById } from "@/lib/exportImport";
import { Sparkles, Languages, CheckCircle2, X, Megaphone } from "lucide-react";
import { RohamHeader, RohamTab } from "@/components/roham/RohamHeader";
import { HomeOverview } from "@/components/roham/HomeOverview";
import { AntiStealerSection } from "@/components/roham/AntiStealerSection";
import { ServicesSection } from "@/components/roham/ServicesSection";
import { CoursesSection, Course } from "@/components/roham/CoursesSection";
import { BlogSection } from "@/components/roham/BlogSection";
import { ThreatRadarSection } from "@/components/roham/ThreatRadarSection";
import { RohamFooter } from "@/components/roham/RohamFooter";
import { EarlyAccessModal } from "@/components/roham/EarlyAccessModal";
import { ConsultationModal } from "@/components/roham/ConsultationModal";
import { CourseEnrollModal } from "@/components/roham/CourseEnrollModal";

export default function Home() {
  const [, startTransition] = useTransition();

  // View state: Roham Enterprise Portal, Reader Library Home, Book Reader, or Admin Panel
  const [activeView, setActiveView] = useState<"portal" | "reader-library" | "reader" | "admin">("portal");
  const [activeTab, setActiveTab] = useState<RohamTab>("home");
  const [isEarlyAccessOpen, setIsEarlyAccessOpen] = useState(false);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [isCourseEnrollOpen, setIsCourseEnrollOpen] = useState(false);
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState<Course | null>(null);

  // User Auth & Cloud Sync State
  const [currentUser, setCurrentUser] = useState<RohamUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  // Books State
  const [books] = useState<Book[]>(SAMPLE_BOOKS);

  const [activeBookId, setActiveBookId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("smart_reader_dayzero_translation");
        if (saved && SAMPLE_BOOKS.some((b) => b.id === saved)) {
          return saved;
        }
      } catch {}
    }
    return "from-day-zero-to-zero-day-fa";
  });
  const [activeChapterId, setActiveChapterId] = useState<string>(() => SAMPLE_BOOKS[0].chapters[0].id);

  // Reader Preferences with lazy initializer
  const [preferences, setPreferences] = useState<ReaderPreferences>(() => {
    const defaultPrefs: ReaderPreferences = {
      fontSize: 18,
      fontFamily: "sans",
      lineHeight: 1.8,
      contentWidth: "normal",
      theme: "sepia",
      tapToTranslate: true,
      codeTheme: "dark",
      autoPronounce: false,
    };
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("smart_reader_prefs");
        if (saved) return { ...defaultPrefs, ...JSON.parse(saved) };
      } catch {}
    }
    return defaultPrefs;
  });

  // Highlights & Vocabulary with lazy initializers
  const [highlights, setHighlights] = useState<Highlight[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("smart_reader_highlights");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  const [savedWords, setSavedWords] = useState<SavedWord[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("smart_reader_vocab");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  // Translation State
  const [activeTranslation, setActiveTranslation] = useState<TranslationResult | null>(null);
  const [translationLoading, setTranslationLoading] = useState(false);
  const [lastSelectedText, setLastSelectedText] = useState("");

  // Drawers & Modals
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHighlightsOpen, setIsHighlightsOpen] = useState(false);
  const [isVocabularyOpen, setIsVocabularyOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  // Scroll Progress
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showWelcomeTip, setShowWelcomeTip] = useState(true);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("smart_reader_prefs", JSON.stringify(preferences));
    } catch {}
  }, [preferences]);

  // Synchronize active theme with <html> element
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;

    if (activeView === "portal" || activeView === "admin") {
      root.classList.remove("theme-light", "theme-sepia", "theme-oled");
      root.classList.add("theme-dark", "dark");
      root.style.colorScheme = "only dark";
      return;
    }

    const theme = preferences.theme;
    const isDark = theme === "dark" || theme === "oled";

    // Clean previous theme classes
    root.classList.remove("theme-light", "theme-sepia", "theme-dark", "theme-oled", "dark");
    root.classList.add(`theme-${theme}`);

    // Toggle .dark class based strictly on the reader theme
    if (isDark) {
      root.classList.add("dark");
      root.style.colorScheme = "only dark";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "only light";
    }

    // Set meta color-scheme
    let metaScheme = document.querySelector('meta[name="color-scheme"]');
    if (!metaScheme) {
      metaScheme = document.createElement("meta");
      metaScheme.setAttribute("name", "color-scheme");
      document.head.appendChild(metaScheme);
    }
    metaScheme.setAttribute("content", isDark ? "dark" : "light");

    // Dynamic mobile address bar color matching reader background
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement("meta");
      metaThemeColor.setAttribute("name", "theme-color");
      document.head.appendChild(metaThemeColor);
    }
    const themeBgColors: Record<string, string> = {
      light: "#f8fafc",
      sepia: "#fbf0d9",
      dark: "#0f172a",
      oled: "#000000",
    };
    metaThemeColor.setAttribute("content", themeBgColors[theme] || "#f8fafc");
  }, [preferences.theme, activeView]);

  // Clean Path URL navigation listener (no # hashes in URL)
  useEffect(() => {
    const syncFromUrl = () => {
      if (typeof window === "undefined") return;
      const hash = window.location.hash.replace(/^#/, "");
      let pathname = window.location.pathname.replace(/\/+$/, "") || "/";

      // Automatically clean any legacy # hash into a clean path
      if (hash) {
        const cleanPath = hash === "portal" || hash === "home" ? "/" : `/${hash}`;
        window.history.replaceState(null, "", cleanPath);
        pathname = cleanPath;
      }

      if (pathname === "/reader" || pathname === "/library") {
        setActiveView("reader-library");
      } else if (
        pathname === "/from-day-zero-to-zero-day" ||
        pathname === "/book"
      ) {
        setActiveView("reader");
      } else if (pathname === "/admin") {
        setActiveView("admin");
      } else {
        setActiveView("portal");
        if (pathname === "/anti-stealer") setActiveTab("anti-stealer");
        else if (pathname === "/courses") setActiveTab("courses");
        else if (pathname === "/blog") setActiveTab("blog");
        else if (pathname === "/radar") setActiveTab("radar");
        else if (pathname === "/services") setActiveTab("services");
        else setActiveTab("home");
      }
    };

    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("smart_reader_highlights", JSON.stringify(highlights));
    } catch {}
  }, [highlights]);

  useEffect(() => {
    try {
      localStorage.setItem("smart_reader_vocab", JSON.stringify(savedWords));
    } catch {}
  }, [savedWords]);

  // Scroll progress listener
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const percent = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
        setScrollProgress(percent);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Active Book and Chapter
  const activeBook = books.find((b) => b.id === activeBookId) || books[0];
  const rawActiveChapter = activeBook.chapters.find((c) => c.id === activeChapterId) || activeBook.chapters[0];
  const canonicalSlug = activeBook.id.replace(/-fa(-gemini)?$/, "");
  const podcastOverrideUrl =
    siteSettings?.podcastOverrides?.[`${canonicalSlug}:${rawActiveChapter.id}`] ||
    rawActiveChapter.podcastUrl;
  const activeChapter: Chapter = podcastOverrideUrl
    ? { ...rawActiveChapter, podcastUrl: podcastOverrideUrl }
    : rawActiveChapter;

  // Apply cloud sync data from a logged-in user (merging highlights & vocabulary safely)
  const applyUserSyncData = useCallback((user: RohamUser) => {
    setCurrentUser(user);
    const sync = user.syncData;
    if (!sync) return;

    if (sync.preferences) {
      setPreferences((prev) => ({ ...prev, ...sync.preferences }));
    }
    if (Array.isArray(sync.highlights) && sync.highlights.length > 0) {
      setHighlights((prev) => mergeById(prev, sync.highlights));
    }
    if (Array.isArray(sync.savedWords) && sync.savedWords.length > 0) {
      setSavedWords((prev) => mergeById(prev, sync.savedWords));
    }
    if (sync.updatedAt) {
      setLastSyncedAt(sync.updatedAt);
    }
  }, []);

  // Load initial public site config & current logged-in user session
  useEffect(() => {
    fetchPublicSiteConfig()
      .then((cfg) => {
        setSiteSettings(cfg);
      })
      .catch(() => {});

    fetchCurrentUser()
      .then((user) => {
        if (user) {
          applyUserSyncData(user);
        }
      })
      .catch(() => {});
  }, [applyUserSyncData]);

  // Manual & Automatic Cloud Sync handler
  const triggerCloudSync = useCallback(
    async (mode: "merge" | "overwrite" = "overwrite") => {
      if (!currentUser) return;
      setIsSyncing(true);
      try {
        const res = await pushCloudSync({
          mode,
          preferences,
          highlights,
          savedWords,
          readingProgress: [
            {
              bookId: activeBook.id,
              chapterId: activeChapter.id,
              scrollProgress,
              updatedAt: new Date().toISOString(),
            },
          ],
        });
        if (res.ok && res.syncData) {
          setLastSyncedAt(res.syncData.updatedAt);
        }
      } finally {
        setIsSyncing(false);
      }
    },
    [currentUser, preferences, highlights, savedWords, activeBook.id, activeChapter.id, scrollProgress]
  );

  // Automatically sync to server when user changes chapter, highlights, vocabulary, or preferences
  useEffect(() => {
    if (!currentUser) return;
    const timer = setTimeout(() => {
      pushCloudSync({
        mode: "overwrite",
        preferences,
        highlights,
        savedWords,
        readingProgress: [
          {
            bookId: activeBook.id,
            chapterId: activeChapter.id,
            scrollProgress,
            updatedAt: new Date().toISOString(),
          },
        ],
      })
        .then((res) => {
          if (res.ok && res.syncData) {
            setLastSyncedAt(res.syncData.updatedAt);
          }
        })
        .catch(() => {});
    }, 1200);
    return () => clearTimeout(timer);
  }, [currentUser, preferences, highlights, savedWords, activeBook.id, activeChapter.id, scrollProgress]);

  // Update preferences helper
  const handleUpdatePreferences = (newPrefs: Partial<ReaderPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...newPrefs }));
  };

  // Translation request handler (PHP backend with direct Google Translate client fallback)
  const fetchTranslation = useCallback(async (textToTranslate: string, contextString: string) => {
    setTranslationLoading(true);
    setLastSelectedText(textToTranslate);

    try {
      // اول تلاش برای دریافت از اندپوینت هاست PHP
      const res = await fetch(
        process.env.NEXT_PUBLIC_TRANSLATE_ENDPOINT || "api/translate.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: textToTranslate,
            context: contextString,
          }),
        }
      );

      if (res.ok) {
        const data: TranslationResult = await res.json();
        if (data && data.persianTranslation) {
          setActiveTranslation(data);
          return;
        }
      }
      throw new Error("PHP endpoint unreachable or returned empty");
    } catch {
      // در صورت عدم پاسخ هاست یا حالت پیش‌نمایش لوکال، مستقیماً از Google Translate کلاینت دریافت می‌شود
      try {
        const gUrl = `https://translate.googleapis.com/translate_a/single?client=dict-chrome-ex&sl=auto&tl=fa&dt=t&dt=bd&dt=rm&q=${encodeURIComponent(textToTranslate)}`;
        const gRes = await fetch(gUrl);
        if (gRes.ok) {
          const json = await gRes.json();
          if (Array.isArray(json) && Array.isArray(json[0])) {
            let translated = "";
            for (const part of json[0]) {
              if (typeof part[0] === "string") translated += part[0];
            }

            let phonetic: string | undefined = undefined;
            if (json[0].length > 0) {
              const last = json[0][json[0].length - 1];
              if (last && typeof last[3] === "string") phonetic = last[3];
              else if (last && typeof last[2] === "string") phonetic = last[2];
            }

            const synonyms: string[] = [];
            let partOfSpeech: string | undefined = undefined;
            if (Array.isArray(json[1])) {
              const posMap: Record<string, string> = {
                noun: "اسم (Noun)",
                verb: "فعل (Verb)",
                adjective: "صفت (Adjective)",
                adverb: "قید (Adverb)",
                preposition: "حرف اضافه",
                conjunction: "حرف ربط",
                pronoun: "ضمیر",
                phrase: "اصطلاح / عبارت",
              };
              const posList: string[] = [];
              for (const item of json[1]) {
                const enPos = (item[0] || "").toLowerCase();
                if (posMap[enPos]) posList.push(posMap[enPos]);
                if (Array.isArray(item[1])) {
                  for (const s of item[1]) {
                    if (typeof s === "string" && !synonyms.includes(s)) {
                      synonyms.push(s);
                    }
                  }
                }
              }
              if (posList.length > 0) partOfSpeech = posList.slice(0, 2).join("، ");
            }

            setActiveTranslation({
              text: textToTranslate,
              persianTranslation: translated || textToTranslate,
              phonetic,
              partOfSpeech,
              explanation: synonyms.length > 0 ? `سایر معانی در دیکشنری: ${synonyms.slice(0, 5).join("، ")}` : "ترجمه Google Translate",
              synonyms: synonyms.slice(0, 6),
              examples: [],
            });
            return;
          }
        }
      } catch {}

      // فال‌بک نهایی
      setActiveTranslation({
        text: textToTranslate,
        persianTranslation: `ترجمه «${textToTranslate}»`,
        explanation: "سرویس ترجمه در دسترس نیست. لطفاً اتصال اینترنت خود را بررسی نمایید.",
        examples: [],
      });
    } finally {
      setTranslationLoading(false);
    }
  }, []);

  const handleWordClick = (word: string, surroundingSentence: string) => {
    setShowWelcomeTip(false);
    fetchTranslation(word, surroundingSentence);
  };

  const handleSelectionAction = (selectedText: string, action: "translate" | "highlight" | "note") => {
    setShowWelcomeTip(false);
    if (action === "translate") {
      fetchTranslation(selectedText, selectedText);
    } else if (action === "highlight") {
      const newHl: Highlight = {
        id: `hl-${Date.now()}`,
        bookId: activeBook.id,
        chapterId: activeChapter.id,
        text: selectedText,
        color: "yellow",
        createdAt: new Date().toISOString(),
      };
      setHighlights((prev) => [newHl, ...prev]);
    } else if (action === "note") {
      const noteContent = window.prompt("یادداشت خود را برای این متن وارد کنید:");
      if (noteContent) {
        const newHl: Highlight = {
          id: `hl-${Date.now()}`,
          bookId: activeBook.id,
          chapterId: activeChapter.id,
          text: selectedText,
          color: "blue",
          note: noteContent,
          createdAt: new Date().toISOString(),
        };
        setHighlights((prev) => [newHl, ...prev]);
      }
    }
  };

  const handleSaveWord = (trans: TranslationResult) => {
    const isAlreadySaved = savedWords.some((w) => w.word.toLowerCase() === trans.text.toLowerCase());
    if (isAlreadySaved) {
      setSavedWords((prev) => prev.filter((w) => w.word.toLowerCase() !== trans.text.toLowerCase()));
      return;
    }

    const newSaved: SavedWord = {
      id: `w-${Date.now()}`,
      word: trans.text,
      translation: trans.persianTranslation,
      explanation: trans.explanation || "",
      phonetic: trans.phonetic,
      partOfSpeech: trans.partOfSpeech,
      bookTitle: activeBook.title,
      savedAt: new Date().toISOString(),
    };
    setSavedWords((prev) => [newSaved, ...prev]);
  };

  const handleAddHighlightFromCard = (color: "yellow" | "green" | "blue" | "pink" | "purple") => {
    if (!lastSelectedText) return;
    const newHl: Highlight = {
      id: `hl-${Date.now()}`,
      bookId: activeBook.id,
      chapterId: activeChapter.id,
      text: lastSelectedText,
      color,
      createdAt: new Date().toISOString(),
    };
    setHighlights((prev) => [newHl, ...prev]);
  };

  const handleAddNoteFromCard = () => {
    if (!lastSelectedText) return;
    const noteText = window.prompt("یادداشت خود را برای این عبارت وارد کنید:");
    if (noteText) {
      const newHl: Highlight = {
        id: `hl-${Date.now()}`,
        bookId: activeBook.id,
        chapterId: activeChapter.id,
        text: lastSelectedText,
        color: "yellow",
        note: noteText,
        createdAt: new Date().toISOString(),
      };
      setHighlights((prev) => [newHl, ...prev]);
    }
  };

  const isDayZeroBook = [
    "from-day-zero-to-zero-day",
    "from-day-zero-to-zero-day-fa",
    "from-day-zero-to-zero-day-fa-gemini",
  ].includes(activeBook.id);

  const DAY_ZERO_TRANSLATIONS = [
    { bookId: "from-day-zero-to-zero-day", label: "نسخه انگلیسی (English)" },
    { bookId: "from-day-zero-to-zero-day-fa", label: "ترجمه استاد GLM" },
    { bookId: "from-day-zero-to-zero-day-fa-gemini", label: "ترجمه استاد Gemini" },
  ];

  const [isTranslationPickerOpen, setIsTranslationPickerOpen] = useState(false);

  const targetLanguageLabel =
    activeBook.id === "from-day-zero-to-zero-day"
      ? "مشاهده نسخه فارسی"
      : activeBook.id === "from-day-zero-to-zero-day-fa-gemini"
        ? "ترجمه استاد Gemini"
        : "ترجمه استاد GLM";

  const handleSelectDayZeroTranslation = (bookId: string) => {
    if (bookId === activeBook.id) {
      setIsTranslationPickerOpen(false);
      return;
    }
    const targetBook = books.find((b) => b.id === bookId);
    if (targetBook) {
      const currentIdx = activeBook.chapters.findIndex((c) => c.id === activeChapterId);
      setActiveBookId(targetBook.id);
      if (currentIdx >= 0 && targetBook.chapters[currentIdx]) {
        setActiveChapterId(targetBook.chapters[currentIdx].id);
      } else {
        setActiveChapterId(targetBook.chapters[0].id);
      }
      try {
        localStorage.setItem("smart_reader_dayzero_translation", bookId);
      } catch {}
    }
    setIsTranslationPickerOpen(false);
  };

  const handleToggleDayZeroLanguage = () => {
    setIsTranslationPickerOpen(true);
  };

  const isWordSaved = activeTranslation
    ? savedWords.some((w) => w.word.toLowerCase() === activeTranslation.text.toLowerCase())
    : false;

  // Library data export / import
  const handleExportLibrary = () => {
    const data = buildExportPayload(highlights, savedWords);
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    downloadJson(data, `reader-library-${stamp}.json`);
    return { ok: true, message: "فایل پشتیبان با موفقیت ساخته و دانلود شد." };
  };

  const handleImportLibrary = (file: File) => {
    return file
      .text()
      .then((text) => {
        const { highlights: importedHighlights, savedWords: importedWords } = parseImportPayload(text);
        const newHighlights = mergeById(highlights, importedHighlights);
        const newWords = mergeById(savedWords, importedWords);
        setHighlights(newHighlights);
        setSavedWords(newWords);
        return {
          ok: true,
          message: `${newHighlights.length - highlights.length} هایلایت و ${newWords.length - savedWords.length} واژه جدید بارگذاری شد.`,
        };
      })
      .catch((e: Error) => ({ ok: false, message: e.message || "بارگذاری ناموفق بود." }));
  };

  // Navigation between Roham Portal, Reader Library Home, and Book Reader (clean paths without #)
  const handleOpenReader = (bookId?: string) => {
    if (bookId) {
      const targetBook = books.find((b) => b.id === bookId);
      if (targetBook) {
        setActiveBookId(targetBook.id);
        setActiveChapterId(targetBook.chapters[0].id);
      }
    }
    setActiveView("reader-library");
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/reader");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleEnterBook = () => {
    setActiveView("reader");
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/from-day-zero-to-zero-day");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNavigate = (tab: RohamTab) => {
    setActiveView("portal");
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const nextPath = tab === "home" ? "/" : `/${tab}`;
      window.history.pushState(null, "", nextPath);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBackToPortal = () => {
    handleNavigate("home");
  };

  const handleOpenAdmin = () => {
    setActiveView("admin");
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/admin");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleJumpToChapter = (bookId: string, chapterId: string) => {
    setActiveBookId(bookId);
    setActiveChapterId(chapterId);
    handleEnterBook();
  };

  const globalAuthModal = (
    <AuthAccountModal
      isOpen={isAuthModalOpen}
      onClose={() => setIsAuthModalOpen(false)}
      currentUser={currentUser}
      onAuthSuccess={(user) => {
        applyUserSyncData(user);
      }}
      onLogout={() => {
        setCurrentUser(null);
        setLastSyncedAt(null);
      }}
      onTriggerManualSync={() => triggerCloudSync("merge")}
      isSyncing={isSyncing}
      lastSyncedAt={lastSyncedAt}
      highlights={highlights}
      savedWords={savedWords}
      preferences={preferences}
      books={books}
      onJumpToChapter={handleJumpToChapter}
      onOpenAdminPanel={handleOpenAdmin}
    />
  );

  // Render Admin Panel View (/admin)
  if (activeView === "admin") {
    return (
      <>
        <AdminPanel
          currentUser={currentUser}
          books={books}
          onBackToPortal={handleBackToPortal}
          onOpenReader={() => handleOpenReader()}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onSettingsUpdated={(newSettings) => setSiteSettings(newSettings)}
        />
        {globalAuthModal}
      </>
    );
  }

  // Render Roham Security Enterprise Portal
  if (activeView === "portal") {
    return (
      <div
        id="roham-portal"
        className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans"
        style={{ direction: "rtl" }}
      >
        {siteSettings?.announcementEnabled && siteSettings.announcementText && (
          <div className="w-full bg-gradient-to-l from-emerald-950 via-slate-900 to-emerald-950 border-b border-emerald-500/30 px-4 py-2 text-xs text-slate-200">
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center">
              <Megaphone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              {siteSettings.announcementBadge && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                  {siteSettings.announcementBadge}
                </span>
              )}
              <span>{siteSettings.announcementText}</span>
            </div>
          </div>
        )}

        <RohamHeader
          activeTab={activeTab}
          onSelectTab={handleNavigate}
          onOpenReader={() => handleOpenReader()}
          onOpenConsultation={() => setIsConsultationOpen(true)}
          onOpenEarlyAccess={() => setIsEarlyAccessOpen(true)}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenAdmin={handleOpenAdmin}
        />

        <main className="flex-1 w-full animate-in fade-in duration-200">
          {activeTab === "home" && (
            <HomeOverview
              onNavigate={handleNavigate}
              onOpenReader={() => handleOpenReader()}
              onOpenEarlyAccess={() => setIsEarlyAccessOpen(true)}
              onOpenConsultation={() => setIsConsultationOpen(true)}
            />
          )}

          {activeTab === "anti-stealer" && (
            <AntiStealerSection
              onOpenEarlyAccess={() => setIsEarlyAccessOpen(true)}
              onBackToHome={() => handleNavigate("home")}
            />
          )}

          {activeTab === "courses" && (
            <CoursesSection
              onOpenEnrollModal={(course) => {
                setSelectedCourseForEnroll(course);
                setIsCourseEnrollOpen(true);
              }}
              onOpenConsultation={() => setIsConsultationOpen(true)}
              onOpenReader={() => handleOpenReader()}
              onBackToHome={() => handleNavigate("home")}
            />
          )}

          {activeTab === "blog" && (
            <BlogSection
              onOpenReader={() => handleOpenReader()}
              onOpenConsultation={() => setIsConsultationOpen(true)}
              onBackToHome={() => handleNavigate("home")}
            />
          )}

          {activeTab === "radar" && (
            <ThreatRadarSection
              onBackToHome={() => handleNavigate("home")}
            />
          )}

          {activeTab === "services" && (
            <ServicesSection
              onOpenConsultation={() => setIsConsultationOpen(true)}
              onBackToHome={() => handleNavigate("home")}
            />
          )}
        </main>

        <RohamFooter
          onOpenReader={() => handleOpenReader()}
          onOpenConsultation={() => setIsConsultationOpen(true)}
          onOpenEarlyAccess={() => setIsEarlyAccessOpen(true)}
          onNavigate={handleNavigate}
        />

        {/* Global Modals for Roham Site */}
        <EarlyAccessModal
          isOpen={isEarlyAccessOpen}
          onClose={() => setIsEarlyAccessOpen(false)}
        />
        <ConsultationModal
          isOpen={isConsultationOpen}
          onClose={() => setIsConsultationOpen(false)}
        />
        <CourseEnrollModal
          isOpen={isCourseEnrollOpen}
          onClose={() => {
            setIsCourseEnrollOpen(false);
            setSelectedCourseForEnroll(null);
          }}
          selectedCourse={selectedCourseForEnroll}
        />
        {globalAuthModal}
      </div>
    );
  }

  // Render Reader Library Home Page (with the Reader's own format & theme)
  if (activeView === "reader-library") {
    return (
      <div className={`theme-${preferences.theme}`}>
        <ReaderLibraryHome
          book={activeBook}
          preferences={preferences}
          onUpdatePreferences={handleUpdatePreferences}
          onSelectBook={handleEnterBook}
          onBackToPortal={handleBackToPortal}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenHighlights={() => setIsHighlightsOpen(true)}
          onOpenVocabulary={() => setIsVocabularyOpen(true)}
          onOpenLibraryData={() => setIsLibraryOpen(true)}
          highlightsCount={highlights.filter((h) => h.bookId === activeBook.id).length}
          savedWordsCount={savedWords.length}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenAdmin={handleOpenAdmin}
        />

        <ReaderSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          preferences={preferences}
          onUpdatePreferences={handleUpdatePreferences}
        />

        <HighlightsDrawer
          isOpen={isHighlightsOpen}
          onClose={() => setIsHighlightsOpen(false)}
          highlights={highlights.filter((h) => h.bookId === activeBook.id)}
          chapters={activeBook.chapters}
          onDeleteHighlight={(id) => setHighlights((prev) => prev.filter((h) => h.id !== id))}
          onUpdateNote={(id, note) => {
            setHighlights((prev) =>
              prev.map((h) => (h.id === id ? { ...h, note } : h))
            );
          }}
          onNavigateToChapter={(chapterId) => {
            setActiveChapterId(chapterId);
            setIsHighlightsOpen(false);
            handleEnterBook();
          }}
        />

        <VocabularyDrawer
          isOpen={isVocabularyOpen}
          onClose={() => setIsVocabularyOpen(false)}
          savedWords={savedWords}
          onDeleteWord={(id) => setSavedWords((prev) => prev.filter((w) => w.id !== id))}
        />

        <LibraryDataModal
          isOpen={isLibraryOpen}
          onClose={() => setIsLibraryOpen(false)}
          highlightsCount={highlights.length}
          savedWordsCount={savedWords.length}
          onExport={handleExportLibrary}
          onImport={handleImportLibrary}
        />
        {globalAuthModal}
      </div>
    );
  }

  // Render Full Interactive Technical Reader
  return (
    <div
      id="app-root"
      className={`min-h-screen flex flex-col transition-colors duration-200 theme-${preferences.theme}`}
      style={{
        backgroundColor: "var(--bg-reader)",
        color: "var(--text-main)",
      }}
    >
      {/* Top Reading Navbar */}
      <ReaderNavbar
        book={activeBook}
        currentChapter={activeChapter}
        preferences={preferences}
        onUpdatePreferences={handleUpdatePreferences}
        onOpenToc={() => setIsTocOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHighlights={() => setIsHighlightsOpen(true)}
        onOpenVocabulary={() => setIsVocabularyOpen(true)}
        onOpenLibrary={() => setIsLibraryOpen(true)}
        highlightsCount={highlights.filter((h) => h.bookId === activeBook.id).length}
        savedWordsCount={savedWords.length}
        scrollProgress={scrollProgress}
        isDayZeroBook={isDayZeroBook}
        targetLanguageLabel={targetLanguageLabel}
        onToggleBookLanguage={handleToggleDayZeroLanguage}
        onBackToPortal={handleBackToPortal}
        onBackToLibrary={() => handleOpenReader()}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Helpful Quick Tip Banner */}
      {showWelcomeTip && (
        <div
          id="welcome-guide-banner"
          className="max-w-3xl mx-3 sm:mx-auto mt-3 sm:mt-4 px-3 sm:px-5 py-2.5 rounded-2xl bg-blue-50/90 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-blue-900 dark:text-blue-200 text-xs flex items-center justify-between gap-2 sm:gap-3 shadow-xs animate-in fade-in slide-in-from-top-2 duration-300"
          style={{ direction: "rtl" }}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="text-[11px] sm:text-xs leading-relaxed">
              <strong>راهنمای سریع:</strong> با کلیک یا لمس هر کلمه، ترجمه و تلفظ آن را ببینید. برای تنظیم اندازه قلم و تم از نوار پایین صفحه استفاده کنید.
            </span>
          </div>
          <button
            onClick={() => setShowWelcomeTip(false)}
            className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0 px-2.5 py-1 rounded-lg bg-blue-100/80 dark:bg-blue-900/80 cursor-pointer"
          >
            بستن
          </button>
        </div>
      )}

      {/* Main Chapter Content */}
      <main className="flex-1 w-full">
        <ChapterViewer
          chapter={activeChapter}
          bookId={activeBook.id}
          preferences={preferences}
          highlights={highlights}
          onWordClick={handleWordClick}
          onSelectionAction={handleSelectionAction}
        />

        {/* Chapter Navigation Bottom Bar */}
        <ChapterBottomBar
          currentChapter={activeChapter}
          chapters={activeBook.chapters}
          onSelectChapter={(ch) => {
            startTransition(() => {
              setActiveChapterId(ch.id);
            });
          }}
          onBackToPortal={handleBackToPortal}
        />
      </main>

      {/* Translation Bottom Sheet / Card */}
      <TranslationCard
        translation={activeTranslation}
        loading={translationLoading}
        onClose={() => setActiveTranslation(null)}
        onSaveWord={handleSaveWord}
        onAddHighlight={handleAddHighlightFromCard}
        onAddNote={handleAddNoteFromCard}
        isSaved={isWordSaved}
      />

      {/* Table of Contents Drawer */}
      <TableOfContentsDrawer
        isOpen={isTocOpen}
        onClose={() => setIsTocOpen(false)}
        activeBook={activeBook}
        activeChapter={activeChapter}
        onSelectChapter={(ch) => {
          setActiveChapterId(ch.id);
        }}
        onBackToPortal={handleBackToPortal}
        onBackToLibrary={() => handleOpenReader()}
      />

      {/* Typography & Reading Settings Modal */}
      <ReaderSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        preferences={preferences}
        onUpdatePreferences={handleUpdatePreferences}
      />

      {/* Highlights & Notes Drawer */}
      <HighlightsDrawer
        isOpen={isHighlightsOpen}
        onClose={() => setIsHighlightsOpen(false)}
        highlights={highlights.filter((h) => h.bookId === activeBook.id)}
        chapters={activeBook.chapters}
        onDeleteHighlight={(id) => setHighlights((prev) => prev.filter((h) => h.id !== id))}
        onUpdateNote={(id, note) => {
          setHighlights((prev) =>
            prev.map((h) => (h.id === id ? { ...h, note } : h))
          );
        }}
        onNavigateToChapter={(chapterId) => {
          setActiveChapterId(chapterId);
        }}
      />

      {/* Saved Vocabulary Drawer */}
      <VocabularyDrawer
        isOpen={isVocabularyOpen}
        onClose={() => setIsVocabularyOpen(false)}
        savedWords={savedWords}
        onDeleteWord={(id) => setSavedWords((prev) => prev.filter((w) => w.id !== id))}
      />

      {/* Library Data (export / import) Modal */}
      <LibraryDataModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        highlightsCount={highlights.length}
        savedWordsCount={savedWords.length}
        onExport={handleExportLibrary}
        onImport={handleImportLibrary}
      />

      {/* Day Zero Translation Picker Modal */}
      {isTranslationPickerOpen && (
        <div
          id="translation-picker-backdrop"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsTranslationPickerOpen(false)}
        >
          <div
            id="translation-picker-dialog"
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
            style={{ direction: "rtl" }}
          >
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Languages className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-base sm:text-lg">انتخاب ترجمه یا زبان</h3>
              </div>
              <button
                id="close-translation-picker-btn"
                onClick={() => setIsTranslationPickerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 sm:p-4 space-y-2">
              <p className="text-xs text-slate-500 dark:text-slate-400 px-1 pb-1">
                فصل فعلی در نسخه انتخابی حفظ می‌شود:
              </p>
              {DAY_ZERO_TRANSLATIONS.map((option) => {
                const isActive = option.bookId === activeBook.id;
                return (
                  <button
                    key={option.bookId}
                    id={`translation-option-${option.bookId}`}
                    onClick={() => handleSelectDayZeroTranslation(option.bookId)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                        : "bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-400 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Languages
                        className={`w-4 h-4 ${
                          isActive
                            ? "text-emerald-100"
                            : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      />
                      <span>{option.label}</span>
                    </span>
                    {isActive && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {globalAuthModal}
    </div>
  );
}
