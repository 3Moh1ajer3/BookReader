"use client";

import React from "react";
import { Book, Chapter } from "@/types/reader";
import { X, BookOpen, Clock, CheckCircle2, ChevronLeft } from "lucide-react";

interface TableOfContentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  activeBook: Book;
  activeChapter: Chapter;
  onSelectBook: (book: Book) => void;
  onSelectChapter: (chapter: Chapter) => void;
}

export const TableOfContentsDrawer: React.FC<TableOfContentsDrawerProps> = ({
  isOpen,
  onClose,
  books,
  activeBook,
  activeChapter,
  onSelectBook,
  onSelectChapter,
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
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              کتابخانه و فهرست فصل‌ها
            </h2>
          </div>
          <button
            id="close-toc-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Book Selector Carousel / Tabs */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
            کتاب‌های موجود
          </span>

          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {books.map((b) => (
              <button
                key={b.id}
                id={`select-book-${b.id}`}
                onClick={() => onSelectBook(b)}
                className={`w-full text-right p-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${
                  b.id === activeBook.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div className="truncate pr-1">
                  <div className="font-bold truncate">{b.title}</div>
                  <div className={`text-[10px] truncate ${b.id === activeBook.id ? "text-blue-100" : "text-slate-400"}`}>
                    {b.author} • {b.chapters.length} فصل
                  </div>
                </div>
                {b.id === activeBook.id && <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />}
              </button>
            ))}
          </div>
        </div>

        {/* Chapters List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            فصل‌های کتاب «{activeBook.title}»
          </div>

          {activeBook.chapters.map((ch, index) => {
            const isActive = ch.id === activeChapter.id;
            return (
              <button
                key={ch.id}
                id={`select-chapter-${ch.id}`}
                onClick={() => {
                  onSelectChapter(ch);
                  onClose();
                }}
                className={`w-full text-right p-3.5 rounded-xl transition-all border flex items-start justify-between gap-3 ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/80 text-blue-900 dark:text-blue-200 shadow-sm"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-md font-mono font-bold ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      فصل {index + 1}
                    </span>
                    <span className="text-xs flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3" />
                      {ch.readingTimeMinutes} دقیقه
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold leading-snug" style={{ direction: "ltr", textAlign: "left" }}>
                    {ch.title}
                  </h4>
                </div>

                <ChevronLeft className={`w-4 h-4 mt-2 shrink-0 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
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
