"use client";

import React from "react";
import { ReaderPreferences, ThemeMode, FontFamily, ContentWidth } from "@/types/reader";
import { X, Sun, Moon, Coffee, Type, Sliders, Smartphone } from "lucide-react";

interface ReaderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: ReaderPreferences;
  onUpdatePreferences: (prefs: Partial<ReaderPreferences>) => void;
}

export const ReaderSettingsModal: React.FC<ReaderSettingsModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onUpdatePreferences,
}) => {
  if (!isOpen) return null;

  const themes: Array<{ id: ThemeMode; label: string; bg: string; text: string; icon: React.ReactNode }> = [
    { id: "light", label: "روشن", bg: "bg-slate-100", text: "text-slate-800", icon: <Sun className="w-4 h-4 text-amber-500" /> },
    { id: "sepia", label: "سپیا (کاغذی)", bg: "bg-[#fbf0d9]", text: "text-[#382d1d]", icon: <Coffee className="w-4 h-4 text-amber-700" /> },
    { id: "dark", label: "تاریک", bg: "bg-slate-800", text: "text-slate-100", icon: <Moon className="w-4 h-4 text-blue-400" /> },
    { id: "oled", label: "سیاه عمیق", bg: "bg-black", text: "text-white", icon: <Moon className="w-4 h-4 text-slate-300" /> },
  ];

  const fonts: Array<{ id: FontFamily; label: string; sample: string; css: string }> = [
    { id: "vazir", label: "وزیرمتن (خوانا و استاندارد)", sample: "متن نمونه فارسی و English Sample", css: "font-sans" },
    { id: "serif", label: "مری‌ودر سریف (کتابی کلاسیک)", sample: "Merriweather Classic Book Style", css: "font-serif" },
    { id: "sans", label: "سنس مینیمال (مدرن)", sample: "Clean Modern Sans-Serif", css: "font-sans" },
    { id: "mono", label: "فایرا کد (تخصصی و کد)", sample: "Fira Code Monospace", css: "font-mono" },
  ];

  const widths: Array<{ id: ContentWidth; label: string; desc: string }> = [
    { id: "compact", label: "باریک (تلفن همراه)", desc: "عرض محدود، مناسب تمرکز روی تک‌تک خطوط" },
    { id: "normal", label: "استاندارد", desc: "تعادل عالی بین طول سطر و خوانایی" },
    { id: "wide", label: "عریض (مانیتور)", desc: "سطرهای بلندتر برای مطالعه در صفحات بزرگ" },
  ];

  return (
    <div
      id="reader-settings-backdrop"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="reader-settings-dialog"
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        style={{ direction: "rtl" }}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-base sm:text-lg">تنظیمات ظاهر و مطالعه</h3>
          </div>
          <button
            id="close-settings-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Theme Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
              تم رنگی صفحه
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  id={`theme-btn-${t.id}`}
                  onClick={() => onUpdatePreferences({ theme: t.id })}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    t.bg
                  } ${t.text} ${
                    preferences.theme === t.id
                      ? "ring-2 ring-blue-500 border-transparent shadow-md scale-[1.02]"
                      : "border-slate-200 dark:border-slate-700 hover:opacity-90"
                  }`}
                >
                  {t.icon}
                  <span className="text-xs font-bold">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Font Size & Line Height */}
          <div className="space-y-4 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  اندازه فونت متن: {preferences.fontSize} پیکسل
                </span>
                <div className="flex items-center gap-1">
                  <button
                    id="settings-font-dec"
                    onClick={() => onUpdatePreferences({ fontSize: Math.max(14, preferences.fontSize - 1) })}
                    className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100"
                  >
                    A-
                  </button>
                  <button
                    id="settings-font-inc"
                    onClick={() => onUpdatePreferences({ fontSize: Math.min(26, preferences.fontSize + 1) })}
                    className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100"
                  >
                    A+
                  </button>
                </div>
              </div>
              <input
                id="font-size-slider"
                type="range"
                min="14"
                max="26"
                step="1"
                value={preferences.fontSize}
                onChange={(e) => onUpdatePreferences({ fontSize: Number(e.target.value) })}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  فاصله بین خطوط (Line Height): {preferences.lineHeight}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: 1.5, label: "فشرده (1.5)" },
                  { val: 1.8, label: "استاندارد (1.8)" },
                  { val: 2.1, label: "دلباز (2.1)" },
                ].map((lh) => (
                  <button
                    key={lh.val}
                    onClick={() => onUpdatePreferences({ lineHeight: lh.val })}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
                      preferences.lineHeight === lh.val
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {lh.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Font Family Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              نوع قلم کتاب
            </label>
            <div className="space-y-1.5">
              {fonts.map((f) => (
                <button
                  key={f.id}
                  id={`font-select-${f.id}`}
                  onClick={() => onUpdatePreferences({ fontFamily: f.id })}
                  className={`w-full p-3 rounded-xl border text-right transition-all flex items-center justify-between ${
                    preferences.fontFamily === f.id
                      ? "bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-200"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{f.label}</div>
                    <div className={`text-xs mt-0.5 ${f.css} opacity-75`} style={{ direction: "ltr", textAlign: "left" }}>
                      {f.sample}
                    </div>
                  </div>
                  {preferences.fontFamily === f.id && (
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content Width */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              عرض ستون محتوا
            </label>
            <div className="grid grid-cols-3 gap-2">
              {widths.map((w) => (
                <button
                  key={w.id}
                  onClick={() => onUpdatePreferences({ contentWidth: w.id })}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    preferences.contentWidth === w.id
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                  }`}
                >
                  <div className="text-xs font-bold">{w.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Tap-To-Translate Toggle */}
          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/50 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100">
                <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>حالت لمس سریع لغت (Tap-to-Translate)</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                با ضربه زدن روی هر کلمه انگلیسی، بدون ظاهر شدن منوی مزاحم گوشی، ترجمه و تلفظ نمایش داده می‌شود.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                id="tap-to-translate-toggle"
                type="checkbox"
                checked={preferences.tapToTranslate}
                onChange={(e) => onUpdatePreferences({ tapToTranslate: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            id="apply-settings-btn"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow transition-all"
          >
            تایید و ذخیره
          </button>
        </div>
      </div>
    </div>
  );
};
