"use client";

import React, { useState } from "react";
import { Book, Chapter, ReaderPreferences } from "@/types/reader";
import {
  Menu,
  Settings,
  Highlighter,
  Bookmark,
  Sun,
  Moon,
  Coffee,
  Languages,
  Shield,
  ArrowRight,
  Database,
  Type,
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
  onBackToPortal?: () => void;
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
  onBackToPortal,
}) => {
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
      className="sticky top-0 z-40 w-full backdrop-blur-md border-b transition-colors border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-slate-950/95 shadow-xs"
    >
      {/* Scroll Progress Bar */}
      <div
        id="reading-progress-bar"
        className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Zone 1: Unmistakable Roham Brand Anchor + Portal Link */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden shrink-0">
          {onBackToPortal && (
            <button
              id="back-to-roham-portal-btn"
              onClick={onBackToPortal}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/40 hover:border-emerald-400 text-white transition-all shadow-sm group cursor-pointer"
              title="بازگشت به صفحه اصلی و پورتال امنیت رهام (Roham Security)"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                <Shield className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex flex-col text-right leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black tracking-wider text-emerald-400 font-mono">ROHAM</span>
                  <span className="text-[10px] text-slate-400 font-medium">· پورتال رهام</span>
                </div>
                <span className="text-[10px] text-slate-400 hidden md:inline">کتابخانه پژوهش و امنیت سایبری</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 group-hover:-translate-x-0.5 transition-all mr-0.5 shrink-0" />
            </button>
          )}

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block shrink-0" />

          {/* Book & Chapter TOC Button */}
          <button
            id="open-toc-btn"
            onClick={onOpenToc}
            className="flex items-center gap-2 p-1.5 pr-2.5 pl-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800 text-right cursor-pointer"
            title="مشاهده فهرست فصل‌ها و تغییر کتاب"
          >
            <Menu className="w-4 h-4 text-emerald-500 shrink-0" />
            <div className="flex flex-col truncate max-w-[140px] sm:max-w-[200px] lg:max-w-[280px]">
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {book.title}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {currentChapter.title}
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Clean, Organized Reading Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Language Switcher (EN <-> FA) */}
          {isDayZeroBook && onToggleBookLanguage && (
            <button
              id="toggle-book-language-btn"
              onClick={onToggleBookLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-all border border-emerald-300/70 dark:border-emerald-800/70 shadow-xs cursor-pointer"
              title="تغییر ترجمه کتاب (فارسی / انگلیسی)"
            >
              <Languages className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="hidden sm:inline">{targetLanguageLabel || "نسخه دیگر"}</span>
              <span className="sm:hidden text-[11px]">زبان</span>
            </button>
          )}

          {/* Highlights & Notes */}
          <button
            id="open-highlights-btn"
            onClick={onOpenHighlights}
            className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
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
            className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            title="واژه‌نامه و لغات ذخیره شده"
          >
            <Bookmark className="w-4 h-4 text-blue-500" />
            {savedWordsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                {savedWordsCount}
              </span>
            )}
          </button>

          {/* Quick Theme Toggle */}
          <button
            id="quick-theme-toggle-btn"
            onClick={cycleTheme}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={`تغییر تم (فعلی: ${preferences.theme})`}
          >
            {getThemeIcon()}
          </button>

          {/* Quick Data Backup Modal */}
          <button
            id="open-library-data-btn"
            onClick={onOpenLibrary}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors hidden sm:block cursor-pointer"
            title="پشتیبان‌گیری از یادداشت‌ها و هایلایت‌ها"
          >
            <Database className="w-4 h-4 text-indigo-500" />
          </button>

          {/* Full Typography & Reading Settings Modal */}
          <button
            id="open-reader-settings-btn"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all border border-slate-200/80 dark:border-slate-700/80 cursor-pointer"
            title="تنظیمات قلم، اندازه متن و حالت مطالعه"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="hidden md:inline">تنظیمات</span>
          </button>
        </div>
      </div>
    </header>
  );
};
