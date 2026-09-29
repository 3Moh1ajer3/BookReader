"use client";

import React from "react";
import { Book, Chapter } from "@/types/reader";
import { X, BookOpen, Clock, ChevronLeft, Shield, ArrowLeft } from "lucide-react";

interface TableOfContentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  books?: Book[];
  activeBook: Book;
  activeChapter: Chapter;
  onSelectBook?: (book: Book) => void;
  onSelectChapter: (chapter: Chapter) => void;
  onBackToPortal?: () => void;
  onBackToLibrary?: () => void;
}

const toPersianDigits = (num: number | string): string => {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(num).replace(/\d/g, (d) => persianDigits[Number(d)]);
};

export const getChapterBadgeLabel = (ch: Chapter, index: number): string => {
  if (ch.id === "front-matter" || /front.?matter|پیش‌گفتار|مقدمه/i.test(ch.id)) {
    return "مقدمه";
  }
  if (ch.id === "ch-resources" || /resources|منابع|پیوست/i.test(ch.id)) {
    return "منابع و پیوست";
  }
  const chMatch = ch.id.match(/^ch-(\d+)$/);
  if (chMatch) {
    return `فصل ${toPersianDigits(chMatch[1])}`;
  }
  return `بخش ${toPersianDigits(index + 1)}`;
};

export const TableOfContentsDrawer: React.FC<TableOfContentsDrawerProps> = ({
  isOpen,
  onClose,
  activeBook,
  activeChapter,
  onSelectChapter,
  onBackToPortal,
  onBackToLibrary,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="toc-drawer-backdrop"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-start animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="toc-drawer-panel"
        className="w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 animate-in slide-in-from-right duration-250"
        onClick={(e) => e.stopPropagation()}
        style={{ direction: "rtl" }}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="truncate">
              <h2 className="font-bold text-base text-slate-900 dark:text-white truncate">
                فهرست فصل‌های کتاب
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {activeBook.title}
              </p>
            </div>
          </div>
          <button
            id="close-toc-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Links to Reader Library Home & Roham Main Portal */}
        {(onBackToLibrary || onBackToPortal) && (
          <div className="p-3 space-y-2 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800">
            {onBackToLibrary && (
              <button
                onClick={() => {
                  onClose();
                  onBackToLibrary();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-100" />
                  <span>صفحه اصلی کتابخوان (لیست کتاب‌ها)</span>
                </div>
                <ArrowLeft className="w-4 h-4 text-emerald-100" />
              </button>
            )}
            {onBackToPortal && (
              <button
                onClick={() => {
                  onClose();
                  onBackToPortal();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>بازگشت به وب‌سایت اصلی رهام</span>
                </div>
                <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
              </button>
            )}
          </div>
        )}

        {/* Chapters List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {activeBook.chapters.map((ch, index) => {
            const isActive = ch.id === activeChapter.id;
            const badgeLabel = getChapterBadgeLabel(ch, index);
            const isRtlTitle = /[\u0600-\u06FF]/.test(ch.title);

            return (
              <button
                key={ch.id}
                id={`select-chapter-${ch.id}`}
                onClick={() => {
                  onSelectChapter(ch);
                  onClose();
                }}
                className={`w-full text-right p-3.5 rounded-xl transition-all border flex items-start justify-between gap-3 cursor-pointer ${
                  isActive
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/80 text-emerald-950 dark:text-emerald-200 shadow-sm"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-md font-bold ${
                        isActive
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {badgeLabel}
                    </span>
                    <span className="text-xs flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3" />
                      {toPersianDigits(ch.readingTimeMinutes)} دقیقه
                    </span>
                  </div>

                  <h4
                    className="text-sm font-semibold leading-snug"
                    style={{
                      direction: isRtlTitle ? "rtl" : "ltr",
                      textAlign: isRtlTitle ? "right" : "left",
                    }}
                  >
                    {ch.title}
                  </h4>
                </div>

                <ChevronLeft
                  className={`w-4 h-4 mt-2 shrink-0 ${
                    isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
          با کلیک روی هر کلمه در متن می‌توانید ترجمه و تلفظ آن را ببینید
        </div>
      </div>
    </div>
  );
};
