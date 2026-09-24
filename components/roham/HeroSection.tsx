"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ShieldCheck, ArrowLeft, BookOpen, Terminal, CheckCircle2, Lock, Activity } from "lucide-react";

interface HeroSectionProps {
  onOpenEarlyAccess: () => void;
  onOpenReader: () => void;
  onScrollToAntiStealer: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenEarlyAccess,
  onOpenReader,
  onScrollToAntiStealer,
}) => {
  const [activeSimulationStep, setActiveSimulationStep] = useState<number>(2);

  const simulationEvents = [
    {
      time: "14:28:01",
      threat: "Lumma.C2 Payload Injection",
      target: "chrome.exe / Login Data (DPAPI)",
      status: "INTERCEPTED",
      detail: "تلاش غیرمجاز برای واکشی کلید رمزنگاری مستر مرورگر",
    },
    {
      time: "14:28:02",
      threat: "Session Cookie Scraper",
      target: "Network Cookies Vault",
      status: "BLOCKED",
      detail: "ایزولاسیون حافظه فعال شد؛ نشست‌های تلگرام و گوگل محافظت شدند",
    },
    {
      time: "14:28:03",
      threat: "Low-Level Keyhook Detour",
      target: "User Input Keystroke Buffer",
      status: "NEUTRALIZED",
      detail: "تزریق هوک کی‌لاگر در لایه کرنل خنثی و پروسس مخرب مسدود گردید",
    },
  ];

  return (
    <section id="hero" className="relative overflow-hidden bg-slate-950 pt-8 pb-16 sm:pt-14 sm:pb-24 border-b border-slate-900">
      {/* Background Subtle Cyber Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-950/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-950/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Unboxed Metadata Trust Line (Zero-Pill Discipline) */}
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-400 mb-6">
          <span className="text-emerald-400 font-semibold tracking-wide">گروه امنیت سایبری رهام</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>Roham.org</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>حفاظت فعال در برابر بدافزارهای استیلر و سرقت سشن</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-slate-400 font-mono">2026 Edition</span>
        </div>

        {/* Main Grid: Headline & Text on Right, Interactive Terminal / Visual on Left */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Right Column: Hero Typography & CTAs (Persian RTL) */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight" style={{ textWrap: "balance" }}>
              سپر نسل نوین دفاع سایبری؛{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-emerald-400 via-teal-300 to-cyan-400">
                خنثی‌سازی سرقت هویت و بدافزارهای استیلر
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              <strong className="text-white font-medium">رهام (Roham Security)</strong>، پیشگام توسعه زیرساخت‌های ضد استیلر، خدمات مشاوره‌ای فوق‌تخصصی هاردنینگ سازمانی، و آکادمی پژوهش‌های آسیب‌پذیری و معکوس‌سازی کدهای باینری است. ما امنیت دارایی‌ها و اطلاعات حیاتی شما را پیش از رسیدن به نقطه بحران تضمین می‌کنیم.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={onOpenEarlyAccess}
                className="flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-lg shadow-emerald-950/60 cursor-pointer"
              >
                <span>رزرو نسخه پیش‌نمایش آنتی‌استیلر</span>
                <ArrowLeft className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenReader}
                className="flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>ورود به کتابخوان تخصصی امنیت</span>
              </button>

              <button
                onClick={onScrollToAntiStealer}
                className="hidden xl:flex items-center justify-center px-4 py-3.5 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                معماری فنی محصول ←
              </button>
            </div>

            {/* Adjacent Trust Factors (Claim-to-Proof) */}
            <div className="pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-slate-400">
              <div>
                <span className="block text-xl font-bold font-mono text-white tabular-nums">0%</span>
                <span className="text-xs text-slate-400">نشت تله‌متری (100% لوکال)</span>
              </div>
              <div>
                <span className="block text-xl font-bold font-mono text-emerald-400 tabular-nums">&lt;15ms</span>
                <span className="text-xs text-slate-400">سرعت رهگیری در لایه حافظه</span>
              </div>
              <div>
                <span className="block text-xl font-bold font-mono text-cyan-400 tabular-nums">Zero-Day</span>
                <span className="text-xs text-slate-400">پوشش تکنیک‌های ناشناخته</span>
              </div>
            </div>
          </div>

          {/* Left Column: Visual & Interactive Shield Console */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/90 shadow-2xl">
              {/* Top Bar of Console */}
              <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono font-medium text-slate-300">
                    Roham StealerGuard Core
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                  <Lock className="w-3 h-3 inline" />
                  <span>ACTIVE DEFENSE</span>
                </div>
              </div>

              {/* Graphic Banner Area */}
              <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                <Image
                  src="/images/roham_hero_cyber_1790289424675.jpg"
                  alt="ماتریس امنیت و رهگیری تهدیدات رهام"
                  fill
                  className="object-cover opacity-60"
                  referrerPolicy="no-referrer"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
                <div className="absolute bottom-3 right-4 left-4 flex items-center justify-between text-xs text-slate-300">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    پایشگر لحظه‌ای فرآیندهای مشکوک
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">PID: 4092 (Isolated)</span>
                </div>
              </div>

              {/* Live Threat Interception Stream */}
              <div className="p-4 space-y-2.5 bg-slate-900/95 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400 text-[11px] pb-1 border-b border-slate-800/60 font-sans">
                  <span>رویدادهای امنیتی شبیه‌سازی شده:</span>
                  <span className="text-emerald-400 font-mono">3 Threats Mitigated</span>
                </div>

                {simulationEvents.map((evt, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveSimulationStep(idx)}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer text-left dir-ltr ${
                      activeSimulationStep === idx
                        ? "bg-slate-950 border-emerald-500/60 shadow-sm"
                        : "bg-slate-950/40 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-slate-300 font-semibold truncate">{evt.threat}</span>
                      <span className="px-1.5 py-0.5 text-[10px] rounded font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        {evt.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span className="text-slate-500">{evt.target}</span>
                      <span className="text-slate-500 tabular-nums">{evt.time}</span>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-300 font-sans text-right dir-rtl">
                      {evt.detail}
                    </div>
                  </div>
                ))}
              </div>

              {/* Console Action Bar */}
              <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-sans">آماده آزمون سازمان شما</span>
                <button
                  onClick={onOpenEarlyAccess}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>درخواست تست اختصاصی</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
