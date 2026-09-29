"use client";

import React from "react";
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
} from "lucide-react";
import { RohamUser } from "@/lib/authSync";

interface ReaderLibraryHomeProps {
  book: Book;
  preferences: ReaderPreferences;
  onUpdatePreferences: (prefs: Partial<ReaderPreferences>) => void;
  onSelectBook: () => void;
  onBackToPortal: () => void;
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
      {/* Reader Home Top Bar (Matches Reader Navbar Format & Theme) */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md border-b transition-colors border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-slate-950/95 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
          {/* Right: Back to Main Website + Reader Home Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              id="library-back-to-portal-btn"
              onClick={onBackToPortal}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/40 hover:border-emerald-400 text-white transition-all shadow-sm group cursor-pointer shrink-0"
              title="بازگشت به وب‌سایت اصلی رهام"
            >
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs font-black tracking-wider text-emerald-400 font-mono">ROHAM</span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">· سایت اصلی</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 transition-colors shrink-0" />
            </button>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block shrink-0" />

            <div className="flex items-center gap-2 truncate">
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                صفحه اصلی کتابخوان رهام
              </span>
            </div>
          </div>

          {/* Left: Reader Theme & Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
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
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all border border-slate-200/80 dark:border-slate-700/80 cursor-pointer"
              title="تنظیمات ظاهر و قلم کتابخوان"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="hidden sm:inline">تنظیمات</span>
            </button>

            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer"
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
      </header>

      {/* Main Reader Library Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
        {/* Simple Library Header in Reader Format */}
        <div className="pb-5 border-b border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
              <BookOpen className="w-4 h-4" />
              کتابخانه کتابخوان هوشمند
            </span>
            <span>۱ کتاب موجود</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
            انتخاب کتاب برای مطالعه
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            برای باز کردن کتاب و مشاهده فصل‌ها، روی کتاب زیر کلیک کنید:
          </p>
        </div>

        {/* Simple, Clean Single Book Card in Reader Theme */}
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
          className="group rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500/70 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-5"
        >
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {/* Simple Book Spine / Cover */}
            <div className="w-20 h-28 sm:w-24 sm:h-32 rounded-xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/30 flex flex-col items-center justify-between p-3 text-white shrink-0 shadow-sm">
              <span className="text-[9px] font-mono text-emerald-400 tracking-wider">ZERO DAY</span>
              <BookOpen className="w-7 h-7 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-mono text-slate-300">EN / FA</span>
            </div>

            {/* Book Info */}
            <div className="space-y-2.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-semibold">
                  مقدمه + فصل ۰ تا ۱۰ + منابع
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Languages className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>دوزبانه (فارسی و انگلیسی)</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{toPersianDigits(totalReadingMinutes)} دقیقه مطالعه</span>
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
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

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              تغییر زبان (فارسی / انگلیسی) در داخل کتاب از نوار بالا امکان‌پذیر است
            </span>
            <span className="px-4 py-2 rounded-xl bg-emerald-600 group-hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all shrink-0">
              <span>ورود به کتاب</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};
