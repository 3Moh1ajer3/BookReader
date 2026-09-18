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

export default function Home() {
  const [, startTransition] = useTransition();

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

  // Translation request handler
  const fetchTranslation = useCallback(async (textToTranslate: string, contextString: string) => {
    setTranslationLoading(true);
    setLastSelectedText(textToTranslate);

    try {
      const res = await fetch(
        process.env.NEXT_PUBLIC_TRANSLATE_ENDPOINT || "api/translate.php",
        {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToTranslate,
          context: contextString,
        }),
      });

      if (!res.ok) throw new Error("Translation failed");
      const data: TranslationResult = await res.json();
      setActiveTranslation(data);
    } catch (e: any) {
      console.error(e);
      // Fallback
      setActiveTranslation({
        text: textToTranslate,
        persianTranslation: "ترجمه در دسترس نیست",
        explanation: "لطفاً مجدداً امتحان کنید یا ارتباط اینترنت را بررسی نمایید.",
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
