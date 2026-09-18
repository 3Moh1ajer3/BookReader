"use client";

import React from "react";
import { Book, Chapter, ReaderPreferences } from "@/types/reader";
import {
  Menu,
  Settings,
  Highlighter,
  Bookmark,
  Maximize2,
  Minimize2,
  Type,
  Sun,
  Moon,
  Coffee,
  Languages,
  Database,
} from "lucide-react";

interface ReaderNavbarProps {
  book: Book;
  currentChapter: Chapter;
  preferences: ReaderPreferences;
  onUpdatePreferences: (prefs: Partial<ReaderPreferences>) => void;
  onOpenToc: () => void;
  onOpenSettings: () => void;
  onOpenHighlights: () => void;
  onOpenVocabulary: () => void;
  onOpenLibrary: () => void;
  highlightsCount: number;
  savedWordsCount: number;
  scrollProgress: number;
  onToggleBookLanguage?: () => void;
  isDayZeroBook?: boolean;
  targetLanguageLabel?: string;
}

export const ReaderNavbar: React.FC<ReaderNavbarProps> = ({
  book,
  currentChapter,
  preferences,
  onUpdatePreferences,
  onOpenToc,
  onOpenSettings,
  onOpenHighlights,
  onOpenVocabulary,
  onOpenLibrary,
  highlightsCount,
  savedWordsCount,
  scrollProgress,
  onToggleBookLanguage,
  isDayZeroBook,
  targetLanguageLabel,
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const cycleTheme = () => {
    const order: Array<ReaderPreferences["theme"]> = ["light", "sepia", "dark", "oled"];
    const nextIdx = (order.indexOf(preferences.theme) + 1) % order.length;
    onUpdatePreferences({ theme: order[nextIdx] });
  };

  const getThemeIcon = () => {
    switch (preferences.theme) {
      case "light":
        return <Sun className="w-4 h-4 text-amber-500" />;
      case "sepia":
        return <Coffee className="w-4 h-4 text-amber-700" />;
      case "dark":
        return <Moon className="w-4 h-4 text-blue-400" />;
      case "oled":
        return <Moon className="w-4 h-4 text-slate-100" />;
    }
  };

  return (
    <header
      id="reader-navbar"
      className="sticky top-0 z-40 w-full backdrop-blur-md border-b transition-colors border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90"
    >
      {/* Scroll Progress Bar */}
      <div
        id="reading-progress-bar"
        className="h-1 bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2">
        {/* Right Section: TOC and Book Title */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
          <button
            id="open-toc-btn"
            onClick={onOpenToc}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 shrink-0"
            title="فهرست فصل‌های کتاب"
          >
            <Menu className="w-5 h-5" />
            <span className="hidden md:inline text-xs font-semibold">فهرست فصل‌ها</span>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block shrink-0" />

          <div className="flex flex-col truncate">
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
              {book.title}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {currentChapter.title}
            </span>
          </div>
        </div>

        {/* Left Section: Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Quick Font Size Buttons */}
          <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 text-xs">
            <button
              id="font-size-dec-btn"
              onClick={() => onUpdatePreferences({ fontSize: Math.max(14, preferences.fontSize - 1) })}
              className="px-2 py-1 rounded hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
              title="کوچک‌تر کردن متن"
            >
              A-
            </button>
            <span className="px-1.5 font-mono text-[11px] text-slate-500">{preferences.fontSize}px</span>
            <button
              id="font-size-inc-btn"
              onClick={() => onUpdatePreferences({ fontSize: Math.min(26, preferences.fontSize + 1) })}
              className="px-2 py-1 rounded hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
              title="بزرگ‌تر کردن متن"
            >
              A+
            </button>
          </div>

          {/* Quick Theme Toggle */}
          <button
            id="quick-theme-toggle-btn"
            onClick={cycleTheme}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={`تغییر تم (فعلی: ${preferences.theme})`}
          >
            {getThemeIcon()}
          </button>

          {/* Highlights & Notes */}
          <button
            id="open-highlights-btn"
            onClick={onOpenHighlights}
            className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
            title="هایلایت‌ها و یادداشت‌ها"
          >
            <Highlighter className="w-4 h-4 text-amber-500" />
            {highlightsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                {highlightsCount}
              </span>
            )}
          </button>

          {/* Saved Vocabulary */}
          <button
            id="open-vocabulary-btn"
            onClick={onOpenVocabulary}
            className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
            title="واژه‌نامه و لغات ذخیره شده"
          >
            <Bookmark className="w-4 h-4 text-blue-500" />
            {savedWordsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                {savedWordsCount}
              </span>
            )}
          </button>

          {/* Language Switcher (EN <-> FA) */}
          {isDayZeroBook && onToggleBookLanguage && (
            <button
              id="toggle-book-language-btn"
              onClick={onToggleBookLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-all border border-emerald-200/70 dark:border-emerald-800/70 shadow-xs cursor-pointer"
              title="تغییر زبان کتاب (انگلیسی / فارسی)"
            >
              <Languages className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{targetLanguageLabel || "نسخه دیگر"}</span>
            </button>
          )}

          {/* Library Data (export / import) */}
          <button
            id="open-library-data-btn"
            onClick={onOpenLibrary}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
            title="پشتیبان‌گیری و بازیابی داده‌ها (هایلایت، یادداشت، واژه‌ها)"
          >
            <Database className="w-4 h-4 text-indigo-500" />
          </button>

          {/* Typography Settings */}
          <button
            id="open-reader-settings-btn"
            onClick={onOpenSettings}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
            title="تنظیمات قلم و ظاهر مطالعه"
          >
            <Type className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            id="toggle-fullscreen-btn"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors hidden md:block"
            title="حالت تمام صفحه"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
