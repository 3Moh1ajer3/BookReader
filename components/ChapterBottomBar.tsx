"use client";

import React from "react";
import { Chapter } from "@/types/reader";
import { ChevronRight, ChevronLeft, CheckCircle2, Shield, ArrowLeft } from "lucide-react";

interface ChapterBottomBarProps {
  currentChapter: Chapter;
  chapters: Chapter[];
  onSelectChapter: (chapter: Chapter) => void;
  onBackToPortal?: () => void;
}

export const ChapterBottomBar: React.FC<ChapterBottomBarProps> = ({
  currentChapter,
  chapters,
  onSelectChapter,
  onBackToPortal,
}) => {
  const currentIndex = chapters.findIndex((c) => c.id === currentChapter.id);
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 mt-12 mb-8 space-y-4">
      <nav
        id="chapter-bottom-nav"
        className="py-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ direction: "rtl" }}
      >
        {/* Previous Chapter Button */}
        {prevChapter ? (
          <button
            id="prev-chapter-btn"
            onClick={() => {
              onSelectChapter(prevChapter);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="w-full sm:w-auto px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-600 transition-all flex items-center gap-3 text-right group shadow-xs cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            <div className="truncate">
              <div className="text-[11px] text-slate-400 font-semibold">فصل قبلی</div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]" style={{ direction: "ltr", textAlign: "left" }}>
                {prevChapter.title}
              </div>
            </div>
          </button>
        ) : (
          <div className="w-full sm:w-auto text-xs text-slate-400 text-center sm:text-right py-2">
            ابتدای کتاب
          </div>
        )}

        {/* Progress Indicator */}
        <div className="text-center">
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            فصل {currentIndex + 1} از {chapters.length}
          </span>
        </div>

        {/* Next Chapter Button */}
        {nextChapter ? (
          <button
            id="next-chapter-btn"
            onClick={() => {
              onSelectChapter(nextChapter);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="w-full sm:w-auto px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-600 transition-all flex items-center justify-between gap-3 text-left group shadow-xs cursor-pointer"
          >
            <div className="truncate text-right">
              <div className="text-[11px] text-slate-400 font-semibold">فصل بعدی</div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]" style={{ direction: "ltr", textAlign: "left" }}>
                {nextChapter.title}
              </div>
            </div>
            <ChevronLeft className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:-translate-x-0.5 transition-transform shrink-0" />
          </button>
        ) : (
          <div className="w-full sm:w-auto flex items-center justify-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold py-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>پایان کتاب</span>
          </div>
        )}
      </nav>

      {/* Return to Roham Portal Banner at Chapter End */}
      {onBackToPortal && (
        <div
          className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          style={{ direction: "rtl" }}
        >
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              قصد بازگشت به وب‌سایت اصلی و خدمات آنتی‌استیلر رهام را دارید؟
            </span>
          </div>
          <button
            onClick={onBackToPortal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shrink-0 shadow-xs cursor-pointer"
          >
            <span>مشاهده صفحه اصلی رهام</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
