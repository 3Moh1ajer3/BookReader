"use client";

import React, { useState } from "react";
import { Book, ReaderPreferences } from "@/types/reader";
import {
  BookOpen,
  Shield,
  ArrowRight,
  ArrowLeft,
  Sun,
  Moon,
  Coffee,
  Highlighter,
  Bookmark,
  Database,
  Settings,
  Languages,
  Clock,
  User,
  Cloud,
  ShieldCheck,
  Sliders,
  X,
  List,
  Sparkles,
  ChevronLeft,
} from "lucide-react";
import { RohamUser } from "@/lib/authSync";

interface ReaderLibraryHomeProps {
  book: Book;
  preferences: ReaderPreferences;
  onUpdatePreferences: (prefs: Partial<ReaderPreferences>) => void;
  onSelectBook: () => void;
  onBackToPortal: () => void;
  onOpenToc?: () => void;
  onOpenSettings: () => void;
  onOpenHighlights: () => void;
  onOpenVocabulary: () => void;
  onOpenLibraryData: () => void;
  highlightsCount: number;
  savedWordsCount: number;
  currentUser?: RohamUser | null;
  onOpenAuth?: () => void;
  onOpenAdmin?: () => void;
}

const toPersianDigits = (num: number | string): string => {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(num).replace(/\d/g, (d) => persianDigits[Number(d)]);
};

export const ReaderLibraryHome: React.FC<ReaderLibraryHomeProps> = ({
  book,
  preferences,
  onUpdatePreferences,
  onSelectBook,
  onBackToPortal,
  onOpenToc,
  onOpenSettings,
  onOpenHighlights,
  onOpenVocabulary,
  onOpenLibraryData,
  highlightsCount,
  savedWordsCount,
  currentUser,
  onOpenAuth,
  onOpenAdmin,
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

  const totalReadingMinutes = book.chapters.reduce((sum, ch) => sum + ch.readingTimeMinutes, 0);

  return (
    <div
      id="reader-library-home"
      className="min-h-screen flex flex-col transition-colors duration-200"
      style={{
        backgroundColor: "var(--bg-reader)",
        color: "var(--text-main)",
        direction: "rtl",
      }}
    >
      {/* Header: Responsive Split (Clean on Mobile, Full Toolbar on Desktop) */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md border-b transition-colors border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-slate-950/95 shadow-xs">
        {/* Desktop Header (>= 768px) */}
        <div className="hidden md:flex max-w-7xl mx-auto px-6 h-16 items-center justify-between gap-3">
          {/* Right: Back to Main Website + Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              id="library-back-to-portal-btn"
              onClick={onBackToPortal}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/40 hover:border-emerald-400 text-white transition-all shadow-sm group cursor-pointer shrink-0"
              title="بازگشت به وب‌سایت اصلی رهام"
            >
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs font-black tracking-wider text-emerald-400 font-mono">ROHAM</span>
              <span className="text-[10px] text-slate-400">· پورتال رهام</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 transition-colors shrink-0" />
            </button>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 shrink-0" />

            <div className="flex items-center gap-2 truncate">
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                کتابخانه پژوهش و کتابخوان تخصصی
              </span>
            </div>
          </div>

          {/* Left: Full Desktop Tools */}
          <div className="flex items-center gap-2 shrink-0">
            {onOpenToc && (
              <button
                onClick={onOpenToc}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all border border-slate-200/80 dark:border-slate-700/80 cursor-pointer"
                title="مشاهده فهرست فصل‌ها"
              >
                <List className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>فهرست فصل‌ها</span>
              </button>
            )}

            <button
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

            <button
              onClick={onOpenVocabulary}
              className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="واژه‌نامه و لغات ذخیره‌شده"
            >
              <Bookmark className="w-4 h-4 text-blue-500" />
              {savedWordsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                  {savedWordsCount}
                </span>
              )}
            </button>

            <button
              onClick={cycleTheme}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={`تغییر تم مطالعه (فعلی: ${preferences.theme})`}
            >
              {getThemeIcon()}
            </button>

            <button
              onClick={onOpenLibraryData}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="پشتیبان‌گیری از یادداشت‌ها و لغات"
            >
              <Database className="w-4 h-4 text-indigo-500" />
            </button>

            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all border border-slate-200/80 dark:border-slate-700/80 cursor-pointer"
              title="تنظیمات ظاهر و قلم کتابخوان"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>تنظیمات</span>
            </button>

            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer"
                title={currentUser ? "حساب کاربری و همگام‌سازی ابری" : "ورود / ثبت‌نام کاربران"}
              >
                {currentUser ? <Cloud className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                <span>{currentUser ? currentUser.name : "ورود / همگام‌سازی"}</span>
              </button>
            )}

            {currentUser?.role === "admin" && onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-600 dark:text-amber-300 hover:bg-amber-500/25 transition-colors cursor-pointer"
                title="پنل مدیریت سایت"
              >
                <ShieldCheck className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Header (< 768px): Sleek, Uncluttered & Ergonomic */}
        <div className="flex md:hidden h-14 px-3 items-center justify-between gap-2 w-full">
          {/* Right: Compact Roham Portal Button */}
          <button
            onClick={onBackToPortal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-400 font-bold text-xs shrink-0 cursor-pointer shadow-xs active:scale-95 transition-transform"
            title="بازگشت به سایت اصلی رهام"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-[11px] font-black tracking-wider">ROHAM</span>
            <span className="text-[10px] text-slate-400">· سایت</span>
          </button>

          {/* Center: Clean Title */}
          <div className="flex items-center gap-1.5 truncate px-1 text-center justify-center flex-1 min-w-0">
            <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
              کتابخانه پژوهش
            </span>
          </div>

          {/* Left: Theme Button + Mobile Quick Tools Sheet Trigger */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={cycleTheme}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={`تغییر تم (فعلی: ${preferences.theme})`}
            >
              {getThemeIcon()}
            </button>

            <button
              onClick={() => setMobileQuickSheetOpen(true)}
              className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 cursor-pointer active:scale-95 transition-all"
              title="ابزارهای مطالعه و تنظیمات"
            >
              <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              {(highlightsCount > 0 || savedWordsCount > 0) && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area (Extra padding bottom for mobile sticky action bar) */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8 pb-32 md:pb-16">
        {/* Simple Library Header in Reader Format */}
        <div className="pb-5 border-b border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
              <BookOpen className="w-4 h-4" />
              کتابخانه کتابخوان هوشمند
            </span>
            <span>۱ کتاب مرجع موجود</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
            کتابخانه تخصصی و مطالعه پژوهش‌ها
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            کتابخوان تعاملی با ترجمه فوری متن و کلمات، رنگ‌آمیزی کدها، ساختار دوزبانه و یادداشت‌برداری ابری:
          </p>
        </div>

        {/* Feature Book Card */}
        <div
          id="reader-library-book-card"
          onClick={onSelectBook}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelectBook();
            }
          }}
          className="group rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500/70 p-5 sm:p-7 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-6"
        >
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {/* Book Spine / Cover */}
            <div className="w-20 h-28 sm:w-28 sm:h-36 rounded-xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/30 flex flex-col items-center justify-between p-3.5 text-white shrink-0 shadow-sm mx-auto sm:mx-0">
              <span className="text-[9px] font-mono text-emerald-400 tracking-wider">ZERO DAY</span>
              <BookOpen className="w-8 h-8 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-mono text-slate-300">EN / FA</span>
            </div>

            {/* Book Info */}
            <div className="space-y-3 flex-1 min-w-0 text-right">
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-semibold">
                  مقدمه + فصل ۰ تا ۱۰ + منابع
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Languages className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>دوزبانه (فارسی و انگلیسی)</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{toPersianDigits(totalReadingMinutes)} دقیقه مطالعه</span>
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                از روز صفر تا روز صفر: راهنمای عملی پژوهش آسیب‌پذیری
              </h2>

              <div className="text-xs font-mono text-slate-500 dark:text-slate-400" style={{ direction: "ltr", textAlign: "right" }}>
                From Day Zero to Zero Day — Eugene Lim (&quot;Spaceraccoon&quot;)
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                متن کامل کتاب مرجع کشف آسیب‌پذیری‌های روز صفر، تحلیل جریان داده (Taint Analysis)، مهندسی معکوس با Ghidra، شبیه‌سازی با Qiling، تحلیل نمادین با angr و فازینگ پیشرفته با AFL++ و boofuzz همراه با ترجمه فارسی و قابلیت ترجمه آنی واژگان.
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-right">
              تغییر زبان (فارسی / انگلیسی) در داخل کتاب از نوار بالا امکان‌پذیر است
            </span>
            <span className="h-11 px-5 rounded-xl bg-emerald-600 group-hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all shrink-0">
              <span>ورود به کتاب و مطالعه فصل‌ها</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </span>
          </div>
        </div>

        {/* Dedicated Bottom Navigation Bar (Matching ChapterBottomBar format) */}
        <section
          id="library-bottom-navigation"
          className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Primary Action Button */}
            <button
              onClick={onSelectBook}
              className="h-12 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>شروع مطالعه کتاب</span>
              <ArrowLeft className="w-4 h-4 shrink-0" />
            </button>

            {/* TOC Action Button */}
            {onOpenToc && (
              <button
                onClick={onOpenToc}
                className="h-12 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 text-slate-800 dark:text-slate-200 font-bold text-sm shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <List className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>مشاهده فهرست فصل‌ها</span>
              </button>
            )}

            {/* Back to Portal Button */}
            <button
              onClick={onBackToPortal}
              className="h-12 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-400 text-slate-700 dark:text-slate-300 font-medium text-sm shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
            >
              <Shield className="w-4 h-4 text-slate-500 shrink-0" />
              <span>بازگشت به سایت اصلی</span>
            </button>
          </div>

          {/* Bottom Information Callout */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-center sm:text-right">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                <strong>امکانات کتابخوان:</strong> ترجمه فوری لغات، همگام‌سازی ابری یادداشت‌ها و هایلایت‌ها، کدهای رنگ‌آمیزی‌شده و پوسته‌های متنوع مطالعه.
              </span>
            </div>
            <button
              onClick={onOpenSettings}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 font-bold text-xs transition-colors shrink-0 cursor-pointer"
            >
              تنظیمات فونت و اندازه
            </button>
          </div>
        </section>
      </main>

      {/* Mobile Sticky Bottom Floating Action Bar (< 768px) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 p-3 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 shadow-xl">
        <div className="max-w-md mx-auto grid grid-cols-2 gap-2">
          {onOpenToc && (
            <button
              onClick={onOpenToc}
              className="h-11 px-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
            >
              <List className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>فهرست فصل‌ها</span>
            </button>
          )}

          <button
            onClick={onSelectBook}
            className={`${
              onOpenToc ? "" : "col-span-2"
            } h-11 px-3 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>شروع مطالعه</span>
            <ArrowLeft className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </div>

      {/* Mobile Quick Tools Bottom Sheet (Drawer) */}
      {mobileQuickSheetOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileQuickSheetOpen(false)}
          />

          {/* Sheet Modal */}
          <div
            className="relative z-10 w-full max-w-lg mx-auto bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            style={{ direction: "rtl" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  ابزارهای مطالعه و تنظیمات
                </span>
              </div>
              <button
                onClick={() => setMobileQuickSheetOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Theme Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
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

            {/* Actions Grid */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <button
                onClick={() => {
                  setMobileQuickSheetOpen(false);
                  onOpenHighlights();
                }}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Highlighter className="w-4 h-4 text-amber-500" />
                  <span>هایلایت‌ها و یادداشت</span>
                </div>
                {highlightsCount > 0 && (
                  <span className="min-w-[18px] h-4 px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {highlightsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setMobileQuickSheetOpen(false);
                  onOpenVocabulary();
                }}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-blue-500" />
                  <span>واژه‌نامه و لغات</span>
                </div>
                {savedWordsCount > 0 && (
                  <span className="min-w-[18px] h-4 px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {savedWordsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setMobileQuickSheetOpen(false);
                  onOpenSettings();
                }}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2"
              >
                <Settings className="w-4 h-4 text-emerald-500" />
                <span>تنظیمات ظاهر و قلم</span>
              </button>

              <button
                onClick={() => {
                  setMobileQuickSheetOpen(false);
                  onOpenLibraryData();
                }}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2"
              >
                <Database className="w-4 h-4 text-indigo-500" />
                <span>پشتیبان‌گیری داده‌ها</span>
              </button>
            </div>

            {/* Auth / Account in Drawer */}
            {onOpenAuth && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    setMobileQuickSheetOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs"
                >
                  {currentUser ? <Cloud className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  <span>{currentUser ? `حساب: ${currentUser.name}` : "ورود / همگام‌سازی ابری حساب کاربری"}</span>
                </button>
              </div>
            )}

            {/* Admin in Drawer */}
            {currentUser?.role === "admin" && onOpenAdmin && (
              <div>
                <button
                  onClick={() => {
                    setMobileQuickSheetOpen(false);
                    onOpenAdmin();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-600 dark:text-amber-300 font-bold text-xs flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>پنل مدیریت سایت</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
