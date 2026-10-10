"use client";

import React from "react";
import { Shield, BookOpen, Send, ExternalLink } from "lucide-react";
import { RohamTab } from "./RohamHeader";

interface RohamFooterProps {
  onOpenReader: () => void;
  onOpenConsultation: () => void;
  onOpenEarlyAccess: () => void;
  onNavigate?: (tab: RohamTab) => void;
  portalTheme?: "light" | "dark";
}

export const RohamFooter: React.FC<RohamFooterProps> = ({
  onOpenReader,
  onOpenConsultation,
  onOpenEarlyAccess,
  onNavigate,
  portalTheme = "light",
}) => {
  const isDark = portalTheme === "dark";

  const handleNav = (tab: RohamTab) => {
    if (onNavigate) {
      onNavigate(tab);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  return (
    <footer
      className={`border-t pt-16 pb-12 transition-colors ${
        isDark
          ? "bg-slate-950 text-slate-300 border-slate-900"
          : "bg-slate-50 text-slate-700 border-slate-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Info & Telegram Channel */}
          <div className="lg:col-span-2 space-y-4">
            <button
              onClick={() => handleNav("home")}
              className={`flex items-center gap-2 font-black text-xl cursor-pointer transition-colors ${
                isDark ? "text-white hover:text-emerald-400" : "text-slate-900 hover:text-emerald-700"
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-mono tracking-wider">ROHAM SECURITY</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-sans font-bold">
                رهام
              </span>
            </button>

            <p className="text-xs sm:text-sm leading-relaxed max-w-sm text-slate-600 dark:text-slate-400">
              مرکز تحقیقات امنیت و دفاع سایبری رهام؛ آزمایشگاه مستقل تحلیل بدافزار، پژوهش آسیب‌پذیری‌های روز صفر و سپر پیشرفته محافظت در برابر بدافزارهای استیلر.
            </p>

            {/* Telegram Channel Callout Box */}
            <div className={`p-4 rounded-2xl border space-y-2.5 max-w-sm ${
              isDark
                ? "bg-sky-950/40 border-sky-800/50 text-slate-200"
                : "bg-sky-50/80 border-sky-200 text-slate-800"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                    <Send className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">کانال رسمی تلگرام رهام</h5>
                    <span className="text-[11px] font-mono text-sky-700 dark:text-sky-400" dir="ltr">@RohamSec</span>
                  </div>
                </div>
                <a
                  href="https://t.me/RohamSec"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-xs"
                >
                  <span>عضویت</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
                پوشش لحظه‌ای تازه‌ترین هشدارهای امنیتی، تحلیل اکسپلویت‌ها و آموزش‌های ویدیویی در تلگرام.
              </p>
            </div>

            <div className="pt-1 flex flex-wrap gap-2 text-[11px] font-mono text-slate-500">
              <span>roham.org</span>
              <span aria-hidden="true">·</span>
              <span>rohamsecurity.com</span>
              <span aria-hidden="true">·</span>
              <span>rohamsec.com</span>
            </div>
          </div>

          {/* Quick Links: Products & News */}
          <div className="space-y-3">
            <h4 className="text-xs font-black font-mono uppercase tracking-wider text-slate-900 dark:text-white">
              محصولات و اخبار
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => handleNav("anti-stealer")}
                  className="text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors text-right cursor-pointer font-medium"
                >
                  آنتی‌استیلر هوشمند رهام
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenEarlyAccess}
                  className="text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors text-right cursor-pointer font-medium"
                >
                  پیش‌ثبت‌نام نسخه بتا
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav("radar")}
                  className="text-emerald-700 dark:text-emerald-400 hover:underline transition-colors text-right cursor-pointer font-bold"
                >
                  اخبار امنیت و گزارش‌ها
                </button>
              </li>
              <li>
                <a
                  href="https://t.me/RohamSec"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-700 dark:text-sky-400 hover:underline transition-colors flex items-center gap-1 font-bold"
                >
                  <Send className="w-3 h-3" />
                  <span>کانال تلگرام (@RohamSec)</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Education & Academy */}
          <div className="space-y-3">
            <h4 className="text-xs font-black font-mono uppercase tracking-wider text-slate-900 dark:text-white">
              آموزش و پژوهش
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => handleNav("courses")}
                  className="text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors text-right cursor-pointer font-medium"
                >
                  دوره‌های تحلیل بدافزار و استیلر
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav("courses")}
                  className="text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors text-right cursor-pointer font-medium"
                >
                  امن‌سازی سشن‌ها و احراز هویت
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav("courses")}
                  className="text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors text-right cursor-pointer font-medium"
                >
                  بوت‌کمپ تحقیقات روز صفر (Zero-Day)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav("blog")}
                  className="text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors text-right cursor-pointer font-medium"
                >
                  وبلاگ و مقالات تخصصی
                </button>
              </li>
            </ul>
          </div>

          {/* Research & Library */}
          <div className="space-y-3">
            <h4 className="text-xs font-black font-mono uppercase tracking-wider text-slate-900 dark:text-white">
              کتابخانه و خدمات
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={onOpenReader}
                  className="text-emerald-700 dark:text-emerald-400 hover:underline transition-colors text-right flex items-center gap-1.5 cursor-pointer font-bold"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>ورود مستقیم به کتابخوان</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav("services")}
                  className="text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors text-right cursor-pointer font-medium"
                >
                  خدمات و مشاوره سازمانی
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenConsultation}
                  className="text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors text-right cursor-pointer font-medium"
                >
                  درخواست ارزیابی محرمانه
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs ${
          isDark ? "border-slate-800 text-slate-400" : "border-slate-300 text-slate-700 font-medium"
        }`}>
          <div>
            تمام حقوق برای مرکز تحقیقات امنیت و دفاع سایبری رهام محفوظ است. © 2026
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-600 dark:text-slate-400">
            <span>Privacy-First</span>
            <span aria-hidden="true">·</span>
            <span>Zero-Telemetry</span>
            <span aria-hidden="true">·</span>
            <span>Local Defense Engine</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
