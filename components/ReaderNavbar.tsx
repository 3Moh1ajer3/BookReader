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
  BookOpen,
  ChevronLeft,
  X,
  Sliders,
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
  const [mobileQuickSheetOpen, setMobileQuickSheetOpen] = useState(false);

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
    <>
      {/* Top Header: Sticky and Responsive */}
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

        {/* Desktop Navigation (>= 768px) */}
        <div className="hidden md:flex max-w-7xl mx-auto px-6 h-16 items-center justify-between gap-4">
          {/* Zone 1: Roham Brand Anchor + Portal Link + TOC */}
          <div className="flex items-center gap-3 overflow-hidden">
            {onBackToPortal && (
              <button
                id="back-to-roham-portal-btn"
                onClick={onBackToPortal}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/40 hover:border-emerald-400 text-white transition-all shadow-sm group cursor-pointer shrink-0"
                title="بازگشت به وب‌سایت اصلی امنیت رهام (Roham Security)"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                  <Shield className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex flex-col text-right leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black tracking-wider text-emerald-400 font-mono">ROHAM</span>
                    <span className="text-[10px] text-slate-400 font-medium">· پورتال رهام</span>
                  </div>
                  <span className="text-[10px] text-slate-400">کتابخانه پژوهش و امنیت سایبری</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 group-hover:-translate-x-0.5 transition-all mr-0.5 shrink-0" />
              </button>
            )}

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 shrink-0" />

            {/* Book & Chapter TOC Button */}
            <button
              id="open-toc-btn"
              onClick={onOpenToc}
              className="flex items-center gap-2 p-1.5 pr-2.5 pl-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800 text-right cursor-pointer"
              title="مشاهده فهرست فصل‌ها و تغییر کتاب"
            >
              <Menu className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="flex flex-col truncate max-w-[220px] lg:max-w-[320px]">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {book.title}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {currentChapter.title}
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Desktop Reading Toolbar */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Language Switcher (EN <-> FA) */}
            {isDayZeroBook && onToggleBookLanguage && (
              <button
                id="toggle-book-language-btn"
                onClick={onToggleBookLanguage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-all border border-emerald-300/70 dark:border-emerald-800/70 shadow-xs cursor-pointer"
                title="تغییر ترجمه کتاب (فارسی / انگلیسی)"
              >
                <Languages className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{targetLanguageLabel || "نسخه دیگر"}</span>
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
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="پشتیبان‌گیری از یادداشت‌ها و هایلایت‌ها"
            >
              <Database className="w-4 h-4 text-indigo-500" />
            </button>

            {/* Full Typography & Reading Settings Modal */}
            <button
              id="open-reader-settings-btn"
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all border border-slate-200/80 dark:border-slate-700/80 cursor-pointer"
              title="تنظیمات قلم، اندازه متن و ظاهر مطالعه"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>تنظیمات</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar (< 768px): Ultra-Compact, Ergonomic, Non-Overflowing */}
        <div className="flex md:hidden h-14 px-3 items-center justify-between gap-2 w-full">
          {/* Right: Compact Roham Brand Button */}
          {onBackToPortal ? (
            <button
              onClick={onBackToPortal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-400 font-bold text-xs shrink-0 cursor-pointer shadow-xs active:scale-95 transition-transform"
              title="بازگشت به وب‌سایت اصلی رهام"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono text-[11px] font-black tracking-wider">ROHAM</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-emerald-500 font-mono font-bold text-xs">
              <Shield className="w-4 h-4" />
              <span>ROHAM</span>
            </div>
          )}

          {/* Center: Tap-Friendly Chapter Header (Truncated) */}
          <button
            onClick={onOpenToc}
            className="flex-1 min-w-0 mx-1 px-2.5 py-1.5 rounded-lg bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 text-right cursor-pointer"
            title="مشاهده فهرست فصل‌ها"
          >
            <div className="truncate text-center">
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate block">
                {currentChapter.title}
              </span>
            </div>
          </button>

          {/* Left: Quick Actions Cluster */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Language Switcher Badge on Mobile */}
            {isDayZeroBook && onToggleBookLanguage && (
              <button
                onClick={onToggleBookLanguage}
                className="p-1.5 px-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300/80 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer active:scale-95"
                title="تغییر ترجمه"
              >
                <Languages className="w-3 h-3 text-emerald-500" />
                <span>زبان</span>
              </button>
            )}

            {/* Quick Theme Toggle */}
            <button
              onClick={cycleTheme}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="تغییر تم"
            >
              {getThemeIcon()}
            </button>

            {/* Open Mobile Reading Control Sheet */}
            <button
              onClick={() => setMobileQuickSheetOpen(true)}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
              title="ابزارها و تنظیمات مطالعه"
            >
              <Sliders className="w-4 h-4 text-emerald-500" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Reading Bar: Always Accessible With One Thumb (< 768px) */}
      <nav
        id="mobile-bottom-reading-nav"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800/90 px-3 py-2 flex items-center justify-around shadow-lg"
        style={{ direction: "rtl" }}
      >
        {/* 1. TOC */}
        <button
          onClick={onOpenToc}
          className="flex flex-col items-center gap-0.5 text-slate-600 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 cursor-pointer active:scale-95"
        >
          <Menu className="w-4 h-4" />
          <span className="text-[10px] font-medium">فصل‌ها</span>
        </button>

        {/* 2. Highlights */}
        <button
          onClick={onOpenHighlights}
          className="relative flex flex-col items-center gap-0.5 text-slate-600 dark:text-slate-400 hover:text-amber-500 cursor-pointer active:scale-95"
        >
          <Highlighter className="w-4 h-4 text-amber-500" />
          <span className="text-[10px] font-medium">یادداشت</span>
          {highlightsCount > 0 && (
            <span className="absolute -top-1 -right-2 min-w-[14px] h-3.5 px-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">
              {highlightsCount}
            </span>
          )}
        </button>

        {/* 3. Vocabulary */}
        <button
          onClick={onOpenVocabulary}
          className="relative flex flex-col items-center gap-0.5 text-slate-600 dark:text-slate-400 hover:text-blue-500 cursor-pointer active:scale-95"
        >
          <Bookmark className="w-4 h-4 text-blue-500" />
          <span className="text-[10px] font-medium">واژه‌ها</span>
          {savedWordsCount > 0 && (
            <span className="absolute -top-1 -right-2 min-w-[14px] h-3.5 px-0.5 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
              {savedWordsCount}
            </span>
          )}
        </button>

        {/* 4. Font Size Quick Adjust */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 rounded-lg p-0.5 border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => onUpdatePreferences({ fontSize: Math.max(14, preferences.fontSize - 1) })}
            className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 active:scale-95"
            title="کوچک‌تر کردن قلم"
          >
            A-
          </button>
          <span className="font-mono text-[10px] text-slate-500 px-0.5">{preferences.fontSize}</span>
          <button
            onClick={() => onUpdatePreferences({ fontSize: Math.min(26, preferences.fontSize + 1) })}
            className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 active:scale-95"
            title="بزرگ‌تر کردن قلم"
          >
            A+
          </button>
        </div>

        {/* 5. Full Settings */}
        <button
          onClick={onOpenSettings}
          className="flex flex-col items-center gap-0.5 text-slate-600 dark:text-slate-400 hover:text-emerald-500 cursor-pointer active:scale-95"
        >
          <Settings className="w-4 h-4" />
          <span className="text-[10px] font-medium">تنظیمات</span>
        </button>
      </nav>

      {/* Mobile Quick Control Bottom Sheet Drawer */}
      {mobileQuickSheetOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center animate-in fade-in duration-150"
          onClick={() => setMobileQuickSheetOpen(false)}
          style={{ direction: "rtl" }}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 p-5 space-y-5 shadow-2xl animate-in slide-in-from-bottom-5 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Handle & Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  ابزارهای مطالعه و ظاهر کتابخوان رهام
                </h3>
              </div>
              <button
                onClick={() => setMobileQuickSheetOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Theme Selector with 4 Cards */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                پوسته و رنگ پس‌زمینه
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(["light", "sepia", "dark", "oled"] as const).map((t) => {
                  const labels = { light: "روشن", sepia: "کاغذی", dark: "تیره", oled: "مشکی" };
                  const bgs = {
                    light: "bg-slate-50 text-slate-900 border-slate-300",
                    sepia: "bg-[#fbf0d9] text-[#433422] border-[#d8c5a5]",
                    dark: "bg-slate-900 text-slate-100 border-slate-700",
                    oled: "bg-black text-white border-zinc-800",
                  };
                  const isSelected = preferences.theme === t;
                  return (
                    <button
                      key={t}
                      onClick={() => onUpdatePreferences({ theme: t })}
                      className={`py-2 px-1 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 transition-all ${bgs[t]} ${
                        isSelected ? "ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900 shadow-sm" : ""
                      }`}
                    >
                      <span>{labels[t]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Font Size Slider / Buttons */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>اندازه متن</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {preferences.fontSize} پیکسل
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onUpdatePreferences({ fontSize: Math.max(14, preferences.fontSize - 1) })}
                  className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 text-center active:scale-95"
                >
                  A- کوچک‌تر
                </button>
                <button
                  onClick={() => onUpdatePreferences({ fontSize: Math.min(26, preferences.fontSize + 1) })}
                  className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 text-center active:scale-95"
                >
                  A+ بزرگ‌تر
                </button>
              </div>
            </div>

            {/* Quick Actions List */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <button
                onClick={() => {
                  setMobileQuickSheetOpen(false);
                  onOpenLibrary();
                }}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center justify-center gap-2"
              >
                <Database className="w-3.5 h-3.5 text-indigo-500" />
                <span>پشتیبان‌گیری داده‌ها</span>
              </button>

              <button
                onClick={() => {
                  setMobileQuickSheetOpen(false);
                  onOpenSettings();
                }}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center justify-center gap-2"
              >
                <Type className="w-3.5 h-3.5 text-emerald-500" />
                <span>تنظیمات پیشرفته فونت</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
