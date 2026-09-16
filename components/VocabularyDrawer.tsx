"use client";

import React, { useState } from "react";
import { SavedWord } from "@/types/reader";
import { X, Bookmark, Volume2, Trash2, Search, FileDown, Copy, Check } from "lucide-react";

interface VocabularyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedWords: SavedWord[];
  onDeleteWord: (id: string) => void;
}

export const VocabularyDrawer: React.FC<VocabularyDrawerProps> = ({
  isOpen,
  onClose,
  savedWords,
  onDeleteWord,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSpeak = (word: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopyWord = async (w: SavedWord) => {
    try {
      await navigator.clipboard.writeText(`${w.word} = ${w.translation}\n${w.explanation}`);
      setCopiedId(w.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const handleExportCsv = () => {
    const rows = [
      ["Word", "Translation", "Explanation", "Book", "SavedAt"],
      ...savedWords.map((w) => [
        `"${w.word.replace(/"/g, '""')}"`,
        `"${w.translation.replace(/"/g, '""')}"`,
        `"${w.explanation.replace(/"/g, '""')}"`,
        `"${w.bookTitle.replace(/"/g, '""')}"`,
        w.savedAt,
      ]),
    ];
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "my_book_vocabulary.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredWords = savedWords.filter(
    (w) =>
      w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.translation.includes(searchQuery)
  );

  return (
    <div
      id="vocabulary-drawer-backdrop"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-start animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="vocabulary-drawer-panel"
        className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 animate-in slide-in-from-right duration-250"
        onClick={(e) => e.stopPropagation()}
        style={{ direction: "rtl" }}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              واژه‌نامه و لغات کتاب ({savedWords.length})
            </h3>
          </div>
          <div className="flex items-center gap-1">
            {savedWords.length > 0 && (
              <button
                id="export-vocab-csv-btn"
                onClick={handleExportCsv}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                title="دانلود خروجی اکسل/CSV برای Anki یا فلش‌کارت"
              >
                <FileDown className="w-4 h-4" />
              </button>
            )}
            <button
              id="close-vocab-drawer-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو بین لغات یا معانی..."
              className="w-full pr-9 pl-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredWords.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Bookmark className="w-8 h-8 mx-auto opacity-30 text-blue-500" />
              <p className="text-xs">هیچ لغتی با این جستجو یافت نشد.</p>
              <p className="text-[11px] text-slate-400">
                در حین مطالعه، روی هر کلمه کلیک کرده و «ذخیره در واژه‌نامه» را بزنید.
              </p>
            </div>
          ) : (
            filteredWords.map((w) => (
              <div
                key={w.id}
                id={`vocab-item-${w.id}`}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 text-xs transition-all hover:border-slate-300 dark:hover:border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="font-bold text-base text-blue-600 dark:text-blue-400 font-sans"
                      style={{ direction: "ltr" }}
                    >
                      {w.word}
                    </span>
                    <button
                      onClick={() => handleSpeak(w.word)}
                      className="p-1 rounded-full bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-blue-400"
                      title="پخش تلفظ صوتی"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    {w.partOfSpeech && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                        {w.partOfSpeech}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopyWord(w)}
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                      title="کپی"
                    >
                      {copiedId === w.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => onDeleteWord(w.id)}
                      className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-600"
                      title="حذف لغت"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                  {w.translation}
                </div>

                {w.explanation && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                    {w.explanation}
                  </p>
                )}

                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
                  <span className="truncate max-w-[200px]">کتاب: {w.bookTitle}</span>
                  <span>{new Date(w.savedAt).toLocaleDateString("fa-IR")}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
