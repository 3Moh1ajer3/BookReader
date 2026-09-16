"use client";

import React, { useState } from "react";
import { Highlight, Chapter } from "@/types/reader";
import { X, Highlighter, Trash2, Edit3, Check, Copy, FileDown } from "lucide-react";

interface HighlightsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  highlights: Highlight[];
  chapters: Chapter[];
  onDeleteHighlight: (id: string) => void;
  onUpdateNote: (id: string, note: string) => void;
  onNavigateToChapter: (chapterId: string) => void;
}

export const HighlightsDrawer: React.FC<HighlightsDrawerProps> = ({
  isOpen,
  onClose,
  highlights,
  chapters,
  onDeleteHighlight,
  onUpdateNote,
  onNavigateToChapter,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("all");

  if (!isOpen) return null;

  const getChapterTitle = (chapterId: string) => {
    return chapters.find((c) => c.id === chapterId)?.title || "فصل نامشخص";
  };

  const filteredHighlights = selectedColor === "all"
    ? highlights
    : highlights.filter((h) => h.color === selectedColor);

  const handleStartEdit = (h: Highlight) => {
    setEditingId(h.id);
    setNoteText(h.note || "");
  };

  const handleSaveEdit = (id: string) => {
    onUpdateNote(id, noteText);
    setEditingId(null);
  };

  const handleCopyText = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const handleExportNotes = () => {
    const md = highlights
      .map(
        (h) =>
          `> ${h.text}\n\n**فصل:** ${getChapterTitle(h.chapterId)}\n${
            h.note ? `**یادداشت:** ${h.note}\n` : ""
          }\n---`
      )
      .join("\n\n");

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `book-highlights-and-notes.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const colorBadgeClass = (color: Highlight["color"]) => {
    switch (color) {
      case "yellow": return "bg-amber-400";
      case "green": return "bg-emerald-400";
      case "blue": return "bg-sky-400";
      case "pink": return "bg-rose-400";
      case "purple": return "bg-purple-400";
    }
  };

  return (
    <div
      id="highlights-drawer-backdrop"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-start animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="highlights-drawer-panel"
        className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 animate-in slide-in-from-right duration-250"
        onClick={(e) => e.stopPropagation()}
        style={{ direction: "rtl" }}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Highlighter className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              هایلایت‌ها و یادداشت‌ها ({highlights.length})
            </h3>
          </div>
          <div className="flex items-center gap-1">
            {highlights.length > 0 && (
              <button
                id="export-highlights-btn"
                onClick={handleExportNotes}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                title="دانلود هایلایت‌ها به صورت فایل Markdown"
              >
                <FileDown className="w-4 h-4" />
              </button>
            )}
            <button
              id="close-highlights-drawer-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Color Filter */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-400 shrink-0">فیلتر رنگ:</span>
          {["all", "yellow", "green", "blue", "pink", "purple"].map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedColor === color
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              {color === "all" ? "همه" : color}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredHighlights.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Highlighter className="w-8 h-8 mx-auto opacity-30 text-amber-500" />
              <p className="text-xs">هنوز هیچ متنی هایلایت نشده است.</p>
              <p className="text-[11px] text-slate-400">
                با انتخاب هر بخش از متن یا کلیک روی لغات، دکمه هایلایت را بزنید.
              </p>
            </div>
          ) : (
            filteredHighlights.map((h) => (
              <div
                key={h.id}
                id={`highlight-item-${h.id}`}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2.5 text-xs transition-all hover:border-slate-300 dark:hover:border-slate-700"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${colorBadgeClass(h.color)}`} />
                    <button
                      onClick={() => {
                        onNavigateToChapter(h.chapterId);
                        onClose();
                      }}
                      className="hover:underline hover:text-blue-500 font-medium truncate max-w-[180px]"
                    >
                      {getChapterTitle(h.chapterId)}
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopyText(h.text, h.id)}
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                      title="کپی نقل‌قول"
                    >
                      {copiedId === h.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleStartEdit(h)}
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                      title="ویرایش یادداشت"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteHighlight(h.id)}
                      className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600"
                      title="حذف هایلایت"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Highlighted text */}
                <div
                  className={`p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 font-sans leading-relaxed text-slate-800 dark:text-slate-200 hl-${h.color}`}
                  style={{ direction: "ltr", textAlign: "left" }}
                >
                  &ldquo;{h.text}&rdquo;
                </div>

                {/* Note */}
                {editingId === h.id ? (
                  <div className="space-y-2 pt-1">
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="یادداشت شخصی خود را بنویسید..."
                      className="w-full p-2 rounded-lg border border-blue-400 dark:border-blue-600 bg-white dark:bg-slate-900 text-xs focus:outline-none"
                      rows={2}
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-700 text-[11px]"
                      >
                        انصراف
                      </button>
                      <button
                        onClick={() => handleSaveEdit(h.id)}
                        className="px-2.5 py-1 rounded bg-blue-600 text-white text-[11px] font-bold"
                      >
                        ذخیره
                      </button>
                    </div>
                  </div>
                ) : h.note ? (
                  <div className="p-2 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/40 text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-amber-700 dark:text-amber-400 block mb-0.5">
                      یادداشت:
                    </span>
                    {h.note}
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
