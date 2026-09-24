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
import { buildExportPayload, downloadJson, parseImportPayload, mergeById } from "@/lib/exportImport";
import { Sparkles, Languages, CheckCircle2, X } from "lucide-react";
import { RohamHeader } from "@/components/roham/RohamHeader";
import { HeroSection } from "@/components/roham/HeroSection";
import { AntiStealerSection } from "@/components/roham/AntiStealerSection";
import { ServicesSection } from "@/components/roham/ServicesSection";
import { CoursesSection, Course } from "@/components/roham/CoursesSection";
import { BlogSection } from "@/components/roham/BlogSection";
import { LibraryShowcaseSection } from "@/components/roham/LibraryShowcaseSection";
import { ThreatRadarSection } from "@/components/roham/ThreatRadarSection";
import { RiskAssessmentTool } from "@/components/roham/RiskAssessmentTool";
import { RohamFooter } from "@/components/roham/RohamFooter";
import { EarlyAccessModal } from "@/components/roham/EarlyAccessModal";
import { ConsultationModal } from "@/components/roham/ConsultationModal";
import { CourseEnrollModal } from "@/components/roham/CourseEnrollModal";

export default function Home() {
  const [, startTransition] = useTransition();

  // View state: Roham Enterprise Portal or Reader
  const [activeView, setActiveView] = useState<"portal" | "reader">("portal");
  const [isEarlyAccessOpen, setIsEarlyAccessOpen] = useState(false);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [isCourseEnrollOpen, setIsCourseEnrollOpen] = useState(false);
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState<Course | null>(null);

  // Books State
  const [books] = useState<Book[]>(SAMPLE_BOOKS);

  const [activeBookId, setActiveBookId] = useState<string>(() => SAMPLE_BOOKS[0].id);
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

    if (activeView === "portal") {
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

  // URL Hash navigation listener (#reader vs #portal)
  useEffect(() => {
    const handleHash = () => {
      if (typeof window !== "undefined") {
        if (window.location.hash === "#reader") {
          setActiveView("reader");
        } else if (window.location.hash === "#portal") {
          setActiveView("portal");
        }
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
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
  const activeChapter = activeBook.chapters.find((c) => c.id === activeChapterId) || activeBook.chapters[0];

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

  // Navigation between Roham Portal and Reader
  const handleOpenReader = (bookId?: string) => {
    if (bookId) {
      const targetBook = books.find((b) => b.id === bookId);
      if (targetBook) {
        setActiveBookId(targetBook.id);
        setActiveChapterId(targetBook.chapters[0].id);
      }
    }
    setActiveView("reader");
    if (typeof window !== "undefined") {
      window.location.hash = "reader";
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBackToPortal = () => {
    setActiveView("portal");
    if (typeof window !== "undefined") {
      window.location.hash = "portal";
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Render Roham Security Enterprise Portal
  if (activeView === "portal") {
    return (
      <div
        id="roham-portal"
        className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans"
        style={{ direction: "rtl" }}
      >
        <RohamHeader
          onOpenReader={() => handleOpenReader()}
          onOpenConsultation={() => setIsConsultationOpen(true)}
          onOpenEarlyAccess={() => setIsEarlyAccessOpen(true)}
        />

        <main className="flex-1 w-full">
          <HeroSection
            onOpenEarlyAccess={() => setIsEarlyAccessOpen(true)}
            onOpenReader={() => handleOpenReader()}
            onScrollToAntiStealer={() => {
              const el = document.getElementById("anti-stealer");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
          />

          <AntiStealerSection onOpenEarlyAccess={() => setIsEarlyAccessOpen(true)} />

          <ServicesSection onOpenConsultation={() => setIsConsultationOpen(true)} />

          <CoursesSection
            onOpenEnrollModal={(course) => {
              setSelectedCourseForEnroll(course);
              setIsCourseEnrollOpen(true);
            }}
            onOpenConsultation={() => setIsConsultationOpen(true)}
            onOpenReader={() => handleOpenReader()}
          />

          <BlogSection
            onOpenReader={() => handleOpenReader()}
            onOpenConsultation={() => setIsConsultationOpen(true)}
          />

          <LibraryShowcaseSection onOpenReader={handleOpenReader} />

          <ThreatRadarSection />

          <RiskAssessmentTool
            onOpenConsultation={() => setIsConsultationOpen(true)}
            onOpenEarlyAccess={() => setIsEarlyAccessOpen(true)}
          />
        </main>

        <RohamFooter
          onOpenReader={() => handleOpenReader()}
          onOpenConsultation={() => setIsConsultationOpen(true)}
          onOpenEarlyAccess={() => setIsEarlyAccessOpen(true)}
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
      />

      {/* Helpful Quick Tip Banner */}
      {showWelcomeTip && (
        <div
          id="welcome-guide-banner"
          className="max-w-3xl mx-auto mt-4 px-4 sm:px-6 py-3 rounded-2xl bg-blue-50/90 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-blue-900 dark:text-blue-200 text-xs flex items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-2 duration-300"
          style={{ direction: "rtl" }}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>
              <strong>راهنمای سریع مطالعه:</strong> روی هر کلمه انگلیسی کلیک یا لمس کنید تا بلافاصله ترجمه فارسی، تلفظ صوتی و توضیح مفهومی آن را مشاهده کنید. کدهای برنامه‌نویسی نیز دارای رنگ‌آمیزی اختصاصی (Syntax Highlighting) هستند. از دکمه «زبان» در نوار بالا می‌توانید کل کتاب را بین نسخه انگلیسی و دو ترجمه فارسی جابه‌جا کنید: «ترجمه استاد GLM» و «ترجمه استاد Gemini». توجه: در دو فصل اول، متن هر دو ترجمه یکسان است.
            </span>
          </div>
          <button
            onClick={() => setShowWelcomeTip(false)}
            className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
          >
            متوجه شدم
          </button>
        </div>
      )}

      {/* Main Chapter Content */}
      <main className="flex-1 w-full">
        <ChapterViewer
          chapter={activeChapter}
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

      {/* Table of Contents & Book Switcher Drawer */}
      <TableOfContentsDrawer
        isOpen={isTocOpen}
        onClose={() => setIsTocOpen(false)}
        books={books}
        activeBook={activeBook}
        activeChapter={activeChapter}
        onSelectBook={(b) => {
          setActiveBookId(b.id);
          setActiveChapterId(b.chapters[0].id);
        }}
        onSelectChapter={(ch) => {
          setActiveChapterId(ch.id);
        }}
        onBackToPortal={handleBackToPortal}
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
    </div>
  );
}
