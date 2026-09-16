"use client";

import React, { useState } from "react";
import { TranslationResult } from "@/types/reader";
import { Volume2, Bookmark, Check, X, Highlighter, MessageSquare, Copy, Sparkles } from "lucide-react";

interface TranslationCardProps {
  translation: TranslationResult | null;
  loading: boolean;
  onClose: () => void;
  onSaveWord: (word: TranslationResult) => void;
  onAddHighlight?: (color: "yellow" | "green" | "blue" | "pink" | "purple") => void;
  onAddNote?: () => void;
  isSaved?: boolean;
}

export const TranslationCard: React.FC<TranslationCardProps> = ({
  translation,
  loading,
  onClose,
  onSaveWord,
  onAddHighlight,
  onAddNote,
  isSaved = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  if (!translation && !loading) return null;

  const handleSpeak = (textToSpeak: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const highlightColors: Array<{ id: "yellow" | "green" | "blue" | "pink" | "purple"; label: string; bgClass: string }> = [
    { id: "yellow", label: "زرد", bgClass: "bg-amber-400" },
    { id: "green", label: "سبز", bgClass: "bg-emerald-400" },
    { id: "blue", label: "آبی", bgClass: "bg-sky-400" },
    { id: "pink", label: "صورتی", bgClass: "bg-rose-400" },
    { id: "purple", label: "بنفش", bgClass: "bg-purple-400" },
  ];

  return (
    <div
      id="translation-card-container"
      className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-5 pointer-events-none flex justify-center animate-in fade-in slide-in-from-bottom-5 duration-200"
    >
      <div
        id="translation-card"
        className="pointer-events-auto w-full max-w-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-all text-slate-800 dark:text-slate-100"
      >
        {/* Card Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              ترجمه و مفهوم هوشمند
            </span>
          </div>

          <div className="flex items-center gap-1">
            {translation && (
              <button
                id="copy-translation-btn"
                onClick={() => handleCopy(`${translation.text}: ${translation.persianTranslation}`)}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                title="کپی ترجمه"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
            <button
              id="close-translation-card-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
              title="بستن"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4 sm:p-5 max-h-[70vh] overflow-y-auto space-y-4">
          {loading ? (
            <div className="space-y-3 py-2 animate-pulse">
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
              <div className="h-14 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
            </div>
          ) : translation ? (
            <>
              {/* Word & Pronunciation */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <h3
                    className="text-xl sm:text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400 font-sans"
                    style={{ direction: "ltr" }}
                  >
                    {translation.text}
                  </h3>
                  <button
                    id="listen-pronounce-btn"
                    onClick={() => handleSpeak(translation.text)}
                    className={`p-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 transition-transform ${
                      speaking ? "scale-110 ring-2 ring-blue-400" : ""
                    }`}
                    title="پخش تلفظ صوتی"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  {translation.phonetic && (
                    <span className="text-xs font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md" style={{ direction: "ltr" }}>
                      {translation.phonetic}
                    </span>
                  )}
                </div>

                {translation.partOfSpeech && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
                    {translation.partOfSpeech}
                  </span>
                )}
              </div>

              {/* Persian Meaning */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                  {translation.persianTranslation}
                </div>
                {translation.explanation && (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                    {translation.explanation}
                  </p>
                )}
              </div>

              {/* Practical Examples */}
              {translation.examples && translation.examples.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    مثال کاربردی در متن:
                  </div>
                  {translation.examples.map((ex, idx) => (
                    <div
                      key={idx}
                      className="text-xs p-2.5 rounded-lg bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100/50 dark:border-blue-900/30 space-y-1"
                    >
                      <div className="font-mono text-slate-700 dark:text-slate-200" style={{ direction: "ltr", textAlign: "left" }}>
                        &ldquo;{ex.english}&rdquo;
                      </div>
                      <div className="text-slate-500 dark:text-slate-400">
                        {ex.persian}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Synonyms */}
              {translation.synonyms && translation.synonyms.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-slate-400">کلمات مرتبط:</span>
                  {translation.synonyms.map((syn, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSpeak(syn)}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 font-mono transition-colors"
                      style={{ direction: "ltr" }}
                    >
                      {syn}
                    </button>
                  ))}
                </div>
              )}

              {/* Action Toolbar */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <button
                    id="save-word-btn"
                    onClick={() => onSaveWord(translation)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isSaved
                        ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow"
                    }`}
                  >
                    {isSaved ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>در لغت‌نامه ذخیره شد</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>ذخیره در واژه‌نامه</span>
                      </>
                    )}
                  </button>

                  {/* Highlight trigger */}
                  {onAddHighlight && (
                    <div className="relative">
                      <button
                        id="toggle-highlight-picker-btn"
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 transition-colors"
                        title="هایلایت متن"
                      >
                        <Highlighter className="w-3.5 h-3.5 text-amber-500" />
                        <span>هایلایت</span>
                      </button>

                      {showColorPicker && (
                        <div className="absolute bottom-full mb-2 right-0 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg flex items-center gap-1.5 z-20">
                          {highlightColors.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => {
                                onAddHighlight(c.id);
                                setShowColorPicker(false);
                              }}
                              className={`w-6 h-6 rounded-full ${c.bgClass} hover:scale-110 active:scale-95 transition-transform`}
                              title={`هایلایت ${c.label}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {onAddNote && (
                    <button
                      id="add-note-action-btn"
                      onClick={onAddNote}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 transition-colors"
                      title="یادداشت برای این متن"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                      <span>یادداشت</span>
                    </button>
                  )}
                </div>

                <div className="text-[11px] text-slate-400">
                  برای تلفظ روی آیکون بلندگو بزنید
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
