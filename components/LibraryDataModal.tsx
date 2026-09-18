"use client";

import React, { useRef, useState } from "react";
import { X, Download, Upload, Database, CheckCircle2, AlertCircle } from "lucide-react";

interface LibraryDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  highlightsCount: number;
  savedWordsCount: number;
  onExport: () => { ok: boolean; message: string };
  onImport: (file: File) => Promise<{ ok: boolean; message: string }>;
}

export const LibraryDataModal: React.FC<LibraryDataModalProps> = ({
  isOpen,
  onClose,
  highlightsCount,
  savedWordsCount,
  onExport,
  onImport,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFeedback(null);
      setFeedback(await onImport(file));
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div
      id="library-data-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="library-data-dialog"
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        style={{ direction: "rtl" }}
      >
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-base sm:text-lg">پشتیبان‌گیری و بازیابی داده‌ها</h3>
          </div>
          <button
            id="close-library-data-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            کتابخانه شما شامل هایلایت‌ها، یادداشت‌ها و واژه‌های ذخیره‌شده است. با خروجی‌گیری،
            یک فایل JSON از آن‌ها دریافت می‌کنید که می‌توانید در دستگاه یا مرورگر دیگر
            بارگذاری کنید. داده‌ها فقط روی دستگاه خودتان ذخیره می‌شوند.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-3 text-center">
              <p className="text-2xl font-black text-amber-500">{highlightsCount}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">هایلایت و یادداشت</p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-3 text-center">
              <p className="text-2xl font-black text-blue-500">{savedWordsCount}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">واژه ذخیره‌شده</p>
            </div>
          </div>

          <button
            id="export-library-btn"
            onClick={() => setFeedback(onExport())}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-bold transition-all bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200/70 dark:border-indigo-900/70 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60"
          >
            <Download className="w-4 h-4" />
            دانلود پشتیبان (JSON)
          </button>

          <button
            id="import-library-btn"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-bold transition-all bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-400 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
          >
            <Upload className="w-4 h-4" />
            بارگذاری از فایل پشتیبان
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleFileSelected}
          />

          {feedback && (
            <div
              className={`flex items-start gap-2 text-xs rounded-lg px-3 py-2 ${
                feedback.ok
                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-900/70"
                  : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/70 dark:border-rose-900/70"
              }`}
            >
              {feedback.ok ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{feedback.message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};