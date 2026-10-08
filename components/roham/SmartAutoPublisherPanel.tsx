"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Link2,
  FileCode,
  Cpu,
  FolderDown,
  CheckCircle2,
  AlertCircle,
  Play,
  Settings2,
  Upload,
  Image as ImageIcon,
  ArrowUpRight,
  Edit3,
  Send,
  Layers,
  ShieldAlert,
  FileText,
  Radio,
  RefreshCw,
  Check,
  Terminal,
  Sliders,
} from "lucide-react";
import {
  AiPipelineConfig,
  DEFAULT_AI_PIPELINE_CONFIG,
  SmartPublisherPipelineResult,
  BlogPost,
  NewsArticle,
  fetchAiPipelineConfig,
  saveAiPipelineConfig,
  runSmartAutoPublisher,
} from "@/lib/contentStore";

interface SmartAutoPublisherPanelProps {
  onPublishBlog: (post: BlogPost, openInEditor?: boolean) => Promise<void>;
  onPublishNews: (article: NewsArticle, openInEditor?: boolean) => Promise<void>;
}

const SAMPLE_MARKDOWN_CONTENT = `# Critical Zero-Day in Chromium App-Bound Encryption Bypassed by New LummaC2 Stealer Variant (CVE-2026-4812)

Security researchers have uncovered an active exploitation campaign utilizing a novel variant of the LummaC2 infostealer that bypasses Chromium's App-Bound Encryption mechanism via elevated COM objects and rogue browser debugging sessions.

![LummaC2 Infection Chain & App-Bound Encryption Bypass Architecture](https://picsum.photos/seed/lummac2-chain/1200/640)

## 1. Technical Anatomy of the COM Elevation Bypass

When Google Chrome 127+ introduced App-Bound Encryption, session cookies stored in the SQLite \`Network/Cookies\` database were bound to a privileged Windows SYSTEM service. However, attackers abusing CVE-2026-4812 inject a lightweight reflective DLL directly into trusted updater binaries to request plaintext decryption keys over named pipes.

![Memory Injection & Named Pipe Key Extraction Flow](https://picsum.photos/seed/memory-pipe-flow/1100/580)

\`\`\`powershell
# PowerShell Hunting Query: Detect abnormal named pipe access to Chrome Elevation Service
Get-WinEvent -FilterHashtable @{LogName='Security'; ID=5145} | Where-Object {
  $_.Message -match 'chrome_elevation_service' -and $_.Message -notmatch 'chrome.exe'
} | Select-Object TimeCreated, Id, Message
\`\`\`

## 2. Indicators of Compromise (IoCs) & Defensive Hardening

Enterprise SOC teams must immediately audit endpoint telemetry for unauthorized headless browser invocations (\`--remote-debugging-port\`) and enforce hardware-backed FIDO2 tokens to neutralize stolen session cookies.`;

const SAMPLE_URLS = [
  {
    label: "گزارش هکرهای وابسته به چین و سرقت ایمیل (The Hacker News)",
    url: "https://thehackernews.com/2026/10/fbi-says-china-linked-hackers-ran.html",
    target: "news" as const,
  },
  {
    label: "کالبدشکافی بدافزار استیلر و سرقت سشن (Unit42 Blog)",
    url: "https://unit42.paloaltonetworks.com/infostealer-session-hijacking-analysis/",
    target: "blog" as const,
  },
];

export const SmartAutoPublisherPanel: React.FC<SmartAutoPublisherPanelProps> = ({
  onPublishBlog,
  onPublishNews,
}) => {
  const [config, setConfig] = useState<AiPipelineConfig>(DEFAULT_AI_PIPELINE_CONFIG);
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [savingConfig, setSavingConfig] = useState<boolean>(false);

  // Source input state
  const [sourceType, setSourceType] = useState<"url" | "markdown">("url");
  const [sourceUrl, setSourceUrl] = useState<string>("");
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [markdownFilename, setMarkdownFilename] = useState<string>("");
  const [targetSection, setTargetSection] = useState<"news" | "blog">("news");

  // Pipeline execution state
  const [running, setRunning] = useState<boolean>(false);
  const [activeStage, setActiveStage] = useState<number>(0);
  const [stageMessage, setStageMessage] = useState<string>("");
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const [pipelineLiveLogs, setPipelineLiveLogs] = useState<string[]>([]);
  const [result, setResult] = useState<SmartPublisherPipelineResult | null>(null);
  const [publishing, setPublishing] = useState<boolean>(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchAiPipelineConfig().then((res) => {
      if (!cancelled && res.config) {
        setConfig(res.config);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const notify = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 5000);
  };

  const handleSaveAiConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    const res = await saveAiPipelineConfig(config);
    setSavingConfig(false);
    notify(res.ok ? "success" : "error", res.message);
  };

  const handleMarkdownFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMarkdownFilename(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = typeof ev.target?.result === "string" ? ev.target.result : "";
      setMarkdownContent(text);
      notify("success", `فایل «${file.name}» با موفقیت بارگذاری شد (بدون نیاز به ریکوئست خارجی).`);
    };
    reader.readAsText(file);
  };

  const handleSwitchToManualPaste = () => {
    setSourceType("markdown");
    setPipelineError(null);
    if (!markdownContent.trim() && sourceUrl.trim()) {
      let host = "";
      try {
        host = new URL(sourceUrl).hostname;
      } catch {}
      setMarkdownContent(
        `# گزارش امنیتی برگرفته از ${host || sourceUrl}\n\nSource: ${sourceUrl}\n\n[متن یا پاراگراف‌های مقاله را اینجا کپی و Paste کنید]`
      );
    }
  };

  const handleStartPipeline = async () => {
    if (sourceType === "url" && !sourceUrl.trim()) {
      notify("error", "لطفاً ابتدا لینک خبر یا مقاله را وارد نمایید.");
      return;
    }
    if (sourceType === "markdown" && !markdownContent.trim()) {
      notify("error", "لطفاً یک فایل .md انتخاب کنید یا متن Markdown را وارد نمایید.");
      return;
    }

    setRunning(true);
    setResult(null);
    setPipelineError(null);
    setPipelineLiveLogs([]);
    setActiveStage(1);
    setStageMessage("در حال آماده‌سازی و برقراری ارتباط...");

    try {
      const pipelineRes = await runSmartAutoPublisher({
        sourceType,
        sourceUrl: sourceUrl.trim(),
        markdownContent: markdownContent.trim(),
        targetSection,
        config,
        onStageChange: (idx, msg) => {
          setActiveStage(idx);
          setStageMessage(msg);
          setPipelineLiveLogs((prev) => [...prev, msg]);
        },
      });

      if (!pipelineRes.ok) {
        const err = pipelineRes.error || "خطا در پردازش محتوا";
        setPipelineError(err);
        if (pipelineRes.pipelineLogs && pipelineRes.pipelineLogs.length > 0) {
          setPipelineLiveLogs(pipelineRes.pipelineLogs);
        }
        notify("error", err);
        return;
      }

      setResult(pipelineRes);
      if (pipelineRes.pipelineLogs) {
        setPipelineLiveLogs(pipelineRes.pipelineLogs);
      }
      notify(
        "success",
        `پردازش دو-مرحله‌ای کامل شد! ${pipelineRes.downloadedImages.length} تصویر در پوشه /${config.mediaConfig.uploadFolder} ذخیره و متن به فارسی ترجمه شد.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطای غیرمنتظره در اجرای پایپ‌لاین";
      setPipelineError(`خطای سیستمی: ${msg}`);
      notify("error", `خطا: ${msg}`);
    } finally {
      setRunning(false);
      setActiveStage(0);
    }
  };

  const handlePublishFinal = async (openInEditor: boolean) => {
    if (!result) return;
    setPublishing(true);
    if (result.targetSection === "news" && result.generatedNews) {
      await onPublishNews(result.generatedNews, openInEditor);
    } else if (result.targetSection === "blog" && result.generatedBlog) {
      await onPublishBlog(result.generatedBlog, openInEditor);
    }
    setPublishing(false);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {toast && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs sm:text-sm font-bold ${
            toast.type === "success"
              ? "bg-emerald-950/70 border-emerald-500/40 text-emerald-200"
              : "bg-rose-950/70 border-rose-500/40 text-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{toast.text}</span>
          </div>
        </div>
      )}

      {/* Top Architecture Header & Dual-Model Status Bar */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-800 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>موتور پست‌گذار هوشمند دو-مرحله‌ای (Dual-Model AI Auto-Publisher)</span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-white">
              استخراج تمیز محتوا، دانلود خودکار تصاویر به هاست و ترجمه تخصصی به ساختار خبر یا وبلاگ
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
              با دادن <strong className="text-slate-200">لینک مستقیم سایت‌ها</strong> (حذف خودکار هدر، فوتر، منوها و تبلیغات) و یا{" "}
              <strong className="text-slate-200">آپلود مستقیم فایل Markdown (`.md`)</strong> (بدون نیاز به ارسال درخواست به سایت خارجی)، تمام تصاویر مقاله در پوشه{" "}
              <code className="text-emerald-400 font-mono">/{config.mediaConfig.uploadFolder}/</code>{" "}
              دانلود شده و محتوا طی دو مرحله توسط مدل سبک و مدل قوی به فارسی ترجمه و ساختاردهی می‌شود.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowConfigModal(!showConfigModal)}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shrink-0 self-start ${
              showConfigModal
                ? "bg-emerald-600 border-emerald-500 text-white"
                : "bg-slate-950 hover:bg-slate-800 border-slate-700 text-slate-200"
            }`}
          >
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>
              {showConfigModal
                ? "بستن تنظیمات مدل‌های هوش مصنوعی"
                : "پیکربندی مدل سبک و قوی (Base URL & Models)"}
            </span>
          </button>
        </div>

        {/* Active Dual-Model Pipeline Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800/90 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="min-w-0 space-y-0.5">
              <div className="text-[11px] text-sky-400 font-bold">
                مرحله ۱: مدل سبک (پالایشگر DOM و تصاویر)
              </div>
              <div className="text-xs font-extrabold text-white font-mono truncate" dir="ltr">
                {config.lightModel.modelName}
              </div>
              <div className="text-[10px] text-slate-500 font-mono truncate" dir="ltr">
                {config.lightModel.baseUrl}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800/90 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
              <FolderDown className="w-4 h-4" />
            </div>
            <div className="min-w-0 space-y-0.5">
              <div className="text-[11px] text-amber-400 font-bold">
                مرحله ۲: دانلودر خودکار تصاویر روی هاست
              </div>
              <div className="text-xs font-extrabold text-white font-mono truncate" dir="ltr">
                /{config.mediaConfig.uploadFolder}/
                {config.mediaConfig.organizeByMonth
                  ? `${new Date().toISOString().slice(0, 7)}/`
                  : ""}
              </div>
              <div className="text-[10px] text-slate-500">
                دانلود و جایگزینی خودکار تا {config.mediaConfig.maxImagesPerPost} تصویر در هر پست
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800/90 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0 space-y-0.5">
              <div className="text-[11px] text-emerald-400 font-bold">
                مرحله ۳: مدل قوی (مترجم و معمار ساختار فنی)
              </div>
              <div className="text-xs font-extrabold text-white font-mono truncate" dir="ltr">
                {config.strongModel.modelName}
              </div>
              <div className="text-[10px] text-slate-500 font-mono truncate" dir="ltr">
                {config.strongModel.baseUrl}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Dual-Model AI Configuration Form (Base URL, Model Name, Provider, Upload Dir) */}
      {showConfigModal && (
        <form
          onSubmit={handleSaveAiConfig}
          className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-6 shadow-2xl"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h4 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-emerald-400" />
                <span>تنظیمات مهندسی مدل سبک (Light AI)، مدل قوی (Strong AI) و پوشه تصاویر</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                می‌توانید از سرویس رسمی Google Gemini یا هر سرویس سازگار با OpenAI (مانند OpenRouter، DeepSeek، AvalAI، vLLM و Ollama) با Base URL دلخواه استفاده کنید.
              </p>
            </div>
            <button
              type="submit"
              disabled={savingConfig}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{savingConfig ? "در حال ذخیره..." : "ذخیره تنظیمات پایپ‌لاین"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Light Model Configuration Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-extrabold text-sky-400 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4" />
                    <span>۱. تنظیمات مدل سبک و سریع (Light Extractor Model)</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    مسئول حذف هدر/فوتر، تمیزسازی تگ‌های HTML و استخراج لیست تصاویر اصلی
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-300 text-[10px] font-mono">
                  Stage 1
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">پروتکل ارتباطی</label>
                  <select
                    value={config.lightModel.provider}
                    onChange={(e) => {
                      const provider = e.target.value as "google_gemini" | "openai_compatible";
                      setConfig({
                        ...config,
                        lightModel: {
                          ...config.lightModel,
                          provider,
                          baseUrl:
                            provider === "google_gemini"
                              ? "https://generativelanguage.googleapis.com/v1beta"
                              : "https://api.openai.com/v1",
                          modelName:
                            provider === "google_gemini" ? "gemini-3-flash-preview" : "gpt-4o-mini",
                        },
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  >
                    <option value="google_gemini">Google Gemini REST API</option>
                    <option value="openai_compatible">
                      OpenAI-Compatible (OpenRouter / Custom Base URL)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    نام مدل سبک (Model ID)
                  </label>
                  <input
                    type="text"
                    value={config.lightModel.modelName}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        lightModel: { ...config.lightModel, modelName: e.target.value },
                      })
                    }
                    placeholder="gemini-3-flash-preview / gpt-4o-mini"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  آدرس پایه سرور مدل سبک (Base URL)
                </label>
                <input
                  type="text"
                  value={config.lightModel.baseUrl}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      lightModel: { ...config.lightModel, baseUrl: e.target.value },
                    })
                  }
                  placeholder="https://generativelanguage.googleapis.com/v1beta"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-emerald-300 font-mono"
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    متغیر محیطی کلید در سرور (Env Var)
                  </label>
                  <input
                    type="text"
                    value={config.lightModel.envKeyName}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        lightModel: { ...config.lightModel, envKeyName: e.target.value },
                      })
                    }
                    placeholder="GEMINI_API_KEY"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 font-mono"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    دمای دقت مدل (Temperature: {config.lightModel.temperature})
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={config.lightModel.temperature}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        lightModel: {
                          ...config.lightModel,
                          temperature: parseFloat(e.target.value) || 0.1,
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-500">پیشنهادهای سریع:</span>
                {["gemini-3-flash-preview", "gpt-4o-mini", "deepseek-chat", "qwen-2.5-7b-instruct"].map(
                  (preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() =>
                        setConfig({
                          ...config,
                          lightModel: { ...config.lightModel, modelName: preset },
                        })
                      }
                      className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono text-slate-300 cursor-pointer"
                    >
                      {preset}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* 2. Strong Model Configuration Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-extrabold text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>۲. تنظیمات مدل قوی و تحلیلی (Strong Translator & Structurer)</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    مسئول ترجمه تخصصی امنیت سایبری و ساخت کامل ساختار JSON خبر یا مقاله وبلاگ
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono">
                  Stage 2
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">پروتکل ارتباطی</label>
                  <select
                    value={config.strongModel.provider}
                    onChange={(e) => {
                      const provider = e.target.value as "google_gemini" | "openai_compatible";
                      setConfig({
                        ...config,
                        strongModel: {
                          ...config.strongModel,
                          provider,
                          baseUrl:
                            provider === "google_gemini"
                              ? "https://generativelanguage.googleapis.com/v1beta"
                              : "https://api.openai.com/v1",
                          modelName:
                            provider === "google_gemini" ? "gemini-3.1-pro-preview" : "gpt-4o",
                        },
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  >
                    <option value="google_gemini">Google Gemini REST API</option>
                    <option value="openai_compatible">
                      OpenAI-Compatible (OpenRouter / Custom Base URL)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    نام مدل قوی (Model ID)
                  </label>
                  <input
                    type="text"
                    value={config.strongModel.modelName}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        strongModel: { ...config.strongModel, modelName: e.target.value },
                      })
                    }
                    placeholder="gemini-3.1-pro-preview / gpt-4o / claude-3-7-sonnet"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  آدرس پایه سرور مدل قوی (Base URL)
                </label>
                <input
                  type="text"
                  value={config.strongModel.baseUrl}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      strongModel: { ...config.strongModel, baseUrl: e.target.value },
                    })
                  }
                  placeholder="https://generativelanguage.googleapis.com/v1beta"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-emerald-300 font-mono"
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    متغیر محیطی کلید در سرور (Env Var)
                  </label>
                  <input
                    type="text"
                    value={config.strongModel.envKeyName}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        strongModel: { ...config.strongModel, envKeyName: e.target.value },
                      })
                    }
                    placeholder="GEMINI_API_KEY"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 font-mono"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    دمای مدل (Temperature: {config.strongModel.temperature})
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={config.strongModel.temperature}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        strongModel: {
                          ...config.strongModel,
                          temperature: parseFloat(e.target.value) || 0.3,
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-500">پیشنهادهای سریع:</span>
                {["gemini-3.1-pro-preview", "gpt-4o", "claude-3-7-sonnet", "deepseek-r1"].map(
                  (preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() =>
                        setConfig({
                          ...config,
                          strongModel: { ...config.strongModel, modelName: preset },
                        })
                      }
                      className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono text-slate-300 cursor-pointer"
                    >
                      {preset}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* 3. Media Upload Directory & Custom Translation Rules */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="text-xs font-extrabold text-amber-400 flex items-center gap-1.5">
                <FolderDown className="w-4 h-4" />
                <span>۳. تنظیمات پوشه ذخیره خودکار تصاویر روی هاست</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    مسیر پوشه در public_html هاست
                  </label>
                  <input
                    type="text"
                    value={config.mediaConfig.uploadFolder}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        mediaConfig: { ...config.mediaConfig, uploadFolder: e.target.value },
                      })
                    }
                    placeholder="uploads/media"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-amber-300 font-mono"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    حداکثر تعداد تصاویر در هر پست
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={25}
                    value={config.mediaConfig.maxImagesPerPost}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        mediaConfig: {
                          ...config.mediaConfig,
                          maxImagesPerPost: Number(e.target.value) || 10,
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-5 pt-1 text-xs text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.mediaConfig.downloadImages}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        mediaConfig: {
                          ...config.mediaConfig,
                          downloadImages: e.target.checked,
                        },
                      })
                    }
                    className="rounded accent-emerald-500"
                  />
                  <span>دانلود خودکار تمام تصاویر مقاله به داخل هاست</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.mediaConfig.organizeByMonth}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        mediaConfig: {
                          ...config.mediaConfig,
                          organizeByMonth: e.target.checked,
                        },
                      })
                    }
                    className="rounded accent-emerald-500"
                  />
                  <span>پوشه‌بندی ماهانه (YYYY-MM)</span>
                </label>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="text-xs font-extrabold text-slate-200 block">
                ۴. دستورالعمل سفارشی ترجمه و نگارش برای مدل قوی (System Prompt)
              </label>
              <textarea
                rows={3}
                value={config.strongModel.customInstructions || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    strongModel: {
                      ...config.strongModel,
                      customInstructions: e.target.value,
                    },
                  })
                }
                placeholder="قواعد ترجمه اصطلاحات تخصصی امنیت سایبری..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 leading-relaxed"
              />
            </div>
          </div>
        </form>
      )}

      {/* Main Input Workbench: Choose Input Mode (URL vs Markdown .md) & Target Section (News vs Blog) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          {/* Input Source Mode Selector */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSourceType("url")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                sourceType === "url"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/30"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <Link2 className="w-4 h-4" />
              <span>۱. دریافت از لینک سایت (حذف هدر و فوتر)</span>
            </button>

            <button
              type="button"
              onClick={() => setSourceType("markdown")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                sourceType === "markdown"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/30"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>۲. فایل Markdown (.md — بدون ریکوئست به سایت)</span>
            </button>
          </div>

          {/* Target Section Selector */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 px-2">مقصد انتشار:</span>
            <button
              type="button"
              onClick={() => setTargetSection("news")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                targetSection === "news"
                  ? "bg-rose-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>رادار اخبار (/radar)</span>
            </button>
            <button
              type="button"
              onClick={() => setTargetSection("blog")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                targetSection === "blog"
                  ? "bg-emerald-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>وبلاگ فنی (/blog)</span>
            </button>
          </div>
        </div>

        {/* Input Body: URL Mode vs Markdown Mode */}
        {sourceType === "url" ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-200 block mb-2">
                آدرس اینترنتی خبر یا مقاله تخصصی (URL):
              </label>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://thehackernews.com/2026/... یا هر لینک مقاله امنیتی"
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={handleStartPipeline}
                  disabled={running}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-lg shadow-emerald-900/30"
                >
                  {running ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>در حال پردازش هوشمند...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>واکشی، دانلود عکس‌ها و ترجمه</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400">نمونه لینک‌های آماده جهت تست سریع:</span>
              {SAMPLE_URLS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSourceUrl(s.url);
                    setTargetSection(s.target);
                  }}
                  className="px-3 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-emerald-300 text-[11px] cursor-pointer"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-slate-200">
                  آپلود فایل Markdown (`.md`) یا الصاق مستقیم متن:
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  در این حالت هیچ ریکوئستی برای گرفتن صفحه وب زده نمی‌شود؛ فقط تصاویر داخل Markdown دانلود و متن ترجمه و استانداردسازی می‌گردد.
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".md,.markdown,.txt"
                  onChange={handleMarkdownFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-emerald-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{markdownFilename ? `فایل: ${markdownFilename}` : "انتخاب فایل .md"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMarkdownContent(SAMPLE_MARKDOWN_CONTENT);
                    setMarkdownFilename("sample-lummac2-zeroday.md");
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-amber-300 cursor-pointer"
                >
                  بارگذاری نمونه فایل .md استاندارد
                </button>
              </div>
            </div>

            <textarea
              rows={9}
              value={markdownContent}
              onChange={(e) => setMarkdownContent(e.target.value)}
              placeholder="# Article Title&#10;&#10;![Diagram](https://example.com/diagram.png)&#10;&#10;## Technical Section..."
              className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-emerald-500"
              dir="ltr"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleStartPipeline}
                disabled={running}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs sm:text-sm font-extrabold flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-900/30"
              >
                {running ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>در حال پردازش فایل Markdown...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>پردازش فایل .md، دانلود عکس‌ها و ترجمه تخصصی</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Live 4-Stage Progress Indicator when Running */}
        {running && (
          <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
              <span>{stageMessage}</span>
              <span className="font-mono">گام {activeStage} از ۴</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
              {[
                { id: 1, title: "۱. استخراج سورس تمیز", sub: "حذف هدر/فوتر یا پارس .md" },
                { id: 2, title: "۲. مدل سبک (Light AI)", sub: config.lightModel.modelName },
                { id: 3, title: "۳. دانلودر تصاویر هاست", sub: `/${config.mediaConfig.uploadFolder}` },
                { id: 4, title: "۴. مدل قوی (Strong AI)", sub: config.strongModel.modelName },
              ].map((st) => {
                const isDone = activeStage > st.id;
                const isCurrent = activeStage === st.id;
                return (
                  <div
                    key={st.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isCurrent
                        ? "bg-emerald-950/50 border-emerald-500 text-white"
                        : isDone
                        ? "bg-slate-900/90 border-emerald-500/30 text-emerald-300"
                        : "bg-slate-900/40 border-slate-800 text-slate-500"
                    }`}
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span>{st.title}</span>
                      {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <div className="text-[10px] opacity-80 font-mono mt-0.5 truncate" dir="ltr">
                      {st.sub}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live trace list */}
            {pipelineLiveLogs.length > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono space-y-1 text-slate-300">
                <div className="text-[11px] font-bold text-emerald-400 mb-1">لاگ‌های مرحله جاری:</div>
                {pipelineLiveLogs.slice(-3).map((l, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-slate-300">
                    <span className="text-emerald-400">›</span>
                    <span>{l}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Persistent Error Diagnosis & Quick-Paste Recovery Card */}
        {pipelineError && (
          <div className="p-5 rounded-2xl bg-rose-950/40 border border-rose-500/50 space-y-3.5 animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1.5 min-w-0 flex-1">
                <h4 className="text-sm font-extrabold text-rose-200">
                  گزارش تشخیص خطا در پردازش خودکار
                </h4>
                <p className="text-xs text-rose-300 leading-relaxed">
                  {pipelineError}
                </p>
                {sourceType === "url" && (
                  <div className="pt-2 flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleSwitchToManualPaste}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-950 transition-all"
                    >
                      <FileCode className="w-4 h-4" />
                      <span>انتقال مستقیم به تب ویرایشگر Markdown و الصاق متن مقاله</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleStartPipeline}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 cursor-pointer transition-colors"
                    >
                      تلاش مجدد
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Diagnostic trace if available */}
            {pipelineLiveLogs.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                <div className="text-slate-300 font-bold">تاریخچه اجرای پایپ‌لاین قبل از توقف:</div>
                {pipelineLiveLogs.map((l, i) => (
                  <div key={i} className="truncate">
                    • {l}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pipeline Output Preview, Downloaded Media Gallery & 1-Click Publish Actions */}
      {result && (
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  پست هوشمند آماده انتشار در بخش{" "}
                  {result.targetSection === "news" ? "«رادار اخبار و تهدیدات»" : "«وبلاگ فنی»"}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-white">
                {result.generatedNews?.title || result.generatedBlog?.title}
              </h3>
              <p className="text-xs text-slate-400">
                {result.generatedNews?.subtitle || result.generatedBlog?.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                disabled={publishing}
                onClick={() => handlePublishFinal(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                <span>باز کردن در ویرایشگر پیشرفته قبل از انتشار</span>
              </button>

              <button
                type="button"
                disabled={publishing}
                onClick={() => handlePublishFinal(false)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-900/30"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {publishing
                    ? "در حال ذخیره در دیتابیس..."
                    : result.targetSection === "news"
                    ? "انتشار فوری در رادار اخبار (/radar)"
                    : "انتشار فوری در وبلاگ فنی (/blog)"}
                </span>
              </button>
            </div>
          </div>

          {/* Downloaded Images Archive Gallery in /uploads/media/ */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-extrabold text-amber-400 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                <span>
                  تصاویر دانلود شده در پوشه اختصاصی هاست ({result.downloadedImages.length} فایل)
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400" dir="ltr">
                /{config.mediaConfig.uploadFolder}/
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {result.downloadedImages.map((img, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.originalUrl}
                    alt={img.alt || "Downloaded Media"}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-lg object-cover border border-slate-700 shrink-0"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3 shrink-0" />
                      <span>ذخیره شده در هاست</span>
                    </div>
                    <div
                      className="text-[11px] font-mono text-white truncate bg-slate-950 px-2 py-0.5 rounded border border-slate-800"
                      dir="ltr"
                      title={img.localPath}
                    >
                      {img.localPath}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {img.alt || "تصویر مستند فنی مقاله"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Full-Text Sections & Source Reference Preview (100% Verbatim, Zero Synthetic Sections) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="text-xs font-extrabold text-emerald-400 flex items-center gap-2">
                <FileCode className="w-4 h-4" />
                <span>
                  پیش‌نمایش متن کامل ترجمه‌شده (بدون خلاصه‌سازی و بدون بخش‌های ساختگی اضافه)
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {(result.generatedNews?.sections.length ||
                  result.generatedBlog?.content.sections.length ||
                  0)}{" "}
                بخش کامل
              </span>
            </div>

            <div className="space-y-5 max-h-[420px] overflow-y-auto pr-1">
              {(result.generatedNews?.sections || result.generatedBlog?.content.sections || []).map(
                (sec, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 space-y-3"
                  >
                    {sec.heading && (
                      <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                        <span className="w-1.5 h-4 rounded-full bg-emerald-500 shrink-0" />
                        <span>{sec.heading}</span>
                      </h4>
                    )}
                    <div className="space-y-2.5 text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {sec.paragraphs.map((p, pIdx) => (
                        <p key={pIdx} className="whitespace-pre-line">
                          {p}
                        </p>
                      ))}
                    </div>
                    {sec.codeSnippet && (
                      <pre
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto"
                        dir="ltr"
                      >
                        <code>{sec.codeSnippet}</code>
                      </pre>
                    )}
                  </div>
                )
              )}
            </div>

            {/* Source Attribution Preview at the end of the post */}
            {(result.sourceUrl || result.sourceDomain) && (
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs font-bold text-emerald-300 flex items-center gap-2">
                  <Link2 className="w-4 h-4 shrink-0" />
                  <span>منبع ثبت‌شده در انتهای مطلب:</span>
                  {result.sourceDomain && (
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-200 font-mono text-[11px]">
                      {result.sourceDomain}
                    </span>
                  )}
                </div>
                {result.sourceUrl && (
                  <a
                    href={result.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-emerald-400 hover:underline flex items-center gap-1 break-all"
                    dir="ltr"
                  >
                    <span>{result.sourceUrl}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Pipeline Execution Logs */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>گزارش اجرای پایپ‌لاین دو-مدله (Pipeline Execution Trace):</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-400">
              {result.pipelineLogs.map((logItem, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-mono">✓</span>
                  <span>{logItem}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
