"use client";

import React from "react";
import { BookOpen, Languages, Sparkles, Download, Code2, BookmarkCheck, ArrowLeft, ArrowUpRight } from "lucide-react";

interface LibraryShowcaseSectionProps {
  onOpenReader: (bookId?: string) => void;
}

export const LibraryShowcaseSection: React.FC<LibraryShowcaseSectionProps> = ({ onOpenReader }) => {
  return (
    <section id="library" className="py-16 sm:py-24 bg-slate-950 border-b border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 mb-3">
            <span className="text-emerald-400 font-semibold">پژوهشکده و انتشارات رهام</span>
            <span aria-hidden="true">·</span>
            <span>Technical Library & Reader</span>
            <span aria-hidden="true">·</span>
            <span>دسترسی آزاد و تعاملی</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight" style={{ textWrap: "balance" }}>
            کتابخانه تخصصی و کتابخوان تعاملی پژوهش‌های امنیتی رهام
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            گروه رهام در کنار توسعه محصولات دفاعی، به ارتقای دانش پژوهشگران امنیت فارسی‌زبان متعهد است. پلتفرم کتابخوان تعاملی ما به شما اجازه می‌دهد متون عمیق امنیتی را با ابزارهای مدرن هوشمند، ترجمه آنی لغات و عبارات، هایلایت‌گذاری و خروجی کاملاً آفلاین مطالعه کنید.
          </p>
        </div>

        {/* Featured Book Showcase Card */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-10 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Right Side: Book Spine / Visual Presentation */}
            <div className="lg:col-span-4 flex flex-col items-center">
              <div className="w-full max-w-[280px] aspect-[3/4] rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-emerald-950/70 border-2 border-slate-700/80 p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
                
                {/* Book Header */}
                <div className="space-y-1 relative z-10">
                  <div className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest">
                    Vulnerability Research
                  </div>
                  <h3 className="text-xl font-extrabold text-white leading-snug">
                    از روز صفر تا روز صفر
                  </h3>
                  <div className="text-xs text-slate-400 font-mono">
                    From Day Zero to Zero Day
                  </div>
                </div>

                {/* Center Book Art */}
                <div className="py-4 relative z-10 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                    <Code2 className="w-8 h-8" />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-2 font-mono">
                    Complete 10-Chapter Edition
                  </span>
                </div>

                {/* Book Footer */}
                <div className="pt-3 border-t border-slate-800/80 relative z-10 flex items-center justify-between text-xs text-slate-400">
                  <span>ویرایش فارسی و انگلیسی</span>
                  <span className="font-mono text-emerald-400">EN / FA</span>
                </div>
              </div>

              {/* Quick Jump Buttons below book cover */}
              <div className="w-full max-w-[280px] grid grid-cols-2 gap-2 mt-4">
                <button
                  onClick={() => onOpenReader("from-day-zero-fa")}
                  className="py-2 px-3 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-center transition-colors shadow-sm cursor-pointer"
                >
                  مطالعه نسخه فارسی
                </button>
                <button
                  onClick={() => onOpenReader("from-day-zero")}
                  className="py-2 px-3 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-center transition-colors border border-slate-700 cursor-pointer"
                >
                  نسخه اصلی (English)
                </button>
              </div>
            </div>

            {/* Left Side: Book Description & Reader Features */}
            <div className="lg:col-span-8 space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-2 font-mono">
                  <span>مرجع جامع شکار آسیب‌پذیری</span>
                  <span aria-hidden="true">·</span>
                  <span>تحلیل کدهای باینری و مهندسی معکوس</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-400">پوشش کامل ۱۰ فصل</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                  راهنمای عملی و تحلیلی شکار باگ و اکسپلویت‌های مدرن
                </h3>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  کتاب «از روز صفر تا روز صفر» یکی از مراجع عمیق در زمینه متدولوژی‌های تحلیل کد، کشف آسیب‌پذیری‌های حافظه، اکسپلویت‌نویسی مدرن و مکانیزم‌های دفاعی سیستم‌عامل است. تیم پژوهش رهام این کتاب را به صورت کاملاً تعاملی و دوزبانه در پلتفرم کتابخوان قرار داده است.
                </p>
              </div>

              {/* Key Features of the Connected Reader */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                  <Languages className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white mb-0.5">ترجمه و واژه‌نامه هوشمند</h4>
                    <p className="text-xs text-slate-400">کلیک روی هر واژه یا جمله جهت ترجمه فوری و ذخیره در دفترچه لغات اختصاصی</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                  <BookmarkCheck className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white mb-0.5">هایلایت ۴ رنگ و یادداشت</h4>
                    <p className="text-xs text-slate-400">علامت‌گذاری نکات کلیدی با دسته‌بندی موضوعی و همگام‌سازی دائمی مرورگر</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                  <Code2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white mb-0.5">رنگ‌آمیزی کدهای C و اسمبلی</h4>
                    <p className="text-xs text-slate-400">خوانایی بالا در نمونه کدهای باینری، شل‌کدها، دستورات GDB و دیاگرام‌های حافظه</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                  <Download className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white mb-0.5">خروجی آفلاین Single-File HTML</h4>
                    <p className="text-xs text-slate-400">امکان دانلود کل کتاب در قالب یک فایل HTML مستقل بدون نیاز به اینترنت</p>
                  </div>
                </div>
              </div>

              {/* Reader Launch Bar */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-slate-400">
                  همگام با تمام دستگاه‌ها (موبایل، تبلت، دسکتاپ) بدون نیاز به نصب نرم‌افزار
                </span>
                <button
                  onClick={() => onOpenReader()}
                  className="w-full sm:w-auto px-6 py-3 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md shadow-emerald-950 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>ورود به کتابخوان و شروع مطالعه</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
