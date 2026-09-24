"use client";

import React, { useState } from "react";
import { AlertCircle, ShieldAlert, ArrowUpRight, Flame, Radio, Clock, Tag } from "lucide-react";

interface ThreatAdvisory {
  id: string;
  title: string;
  category: "urgent" | "malware" | "zeroday";
  categoryLabel: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  date: string;
  summary: string;
  mitigation: string;
}

interface ThreatRadarSectionProps {
  onBackToHome?: () => void;
}

export const ThreatRadarSection: React.FC<ThreatRadarSectionProps> = ({ onBackToHome }) => {
  const [filter, setFilter] = useState<"all" | "urgent" | "malware" | "zeroday">("all");
  const [activeAdvisory, setActiveAdvisory] = useState<ThreatAdvisory | null>(null);

  const advisories: ThreatAdvisory[] = [
    {
      id: "adv-01",
      title: "هشدار امنیتی: کمپین جدید بدافزار LummaC2 با پوشش فایل‌های PDF و تقویم سازمانی",
      category: "urgent",
      categoryLabel: "هشدار فوری",
      severity: "CRITICAL",
      date: "۲ مهر ۱۴۰۵ · 14:30",
      summary:
        "مهاجمان با استفاده از تکنیک ClickFix و کدهای مبهم‌شده پاورشل، در حال انتشار نسخه‌های بازنویسی‌شده LummaC2 هستند که مستقیماً توکن‌های تلگرام، دیسکورد و نشست‌های ورود مرورگرها را هدف قرار می‌دهند.",
      mitigation:
        "مسدودسازی فراخوانی mshta و powershell در سطح کاربران عادی، فعال‌سازی احراز هویت FIDO2/WebAuthn، و ایزولاسیون دسترسی به فایل‌های SQLite مرورگرها.",
    },
    {
      id: "adv-02",
      title: "تحلیل فنی: بررسی کارایی مکانیزم App-Bound Encryption در مرورگر کروم و مسیرهای دور زدن آن",
      category: "malware",
      categoryLabel: "تحلیل بدافزار",
      severity: "HIGH",
      date: "۳۰ شهریور ۱۴۰۵ · 09:15",
      summary:
        "بررسی ساختار سرویس سیستمی جدید کروم در ویندوز جهت محافظت از کلید مستر و تکنیک‌هایی که سارقان اطلاعات از طریق تزریق پروسس با دسترسی SYSTEM برای دور زدن آن استفاده می‌کنند.",
      mitigation:
        "اعمال محدودیت‌های لایه‌ای با ابزارهای هاردنینگ پیشرفته و نظارت بر پروسس‌های فراخواننده رمزگشایی کریپتوگرافی ویندوز.",
    },
    {
      id: "adv-03",
      title: "آسیب‌پذیری روز صفر بحرانی در سرویس‌های دسترسی از راه دور سازمانی (RDP/VPN)",
      category: "zeroday",
      categoryLabel: "آسیب‌پذیری روز صفر",
      severity: "CRITICAL",
      date: "۲۶ شهریور ۱۴۰۵ · 18:40",
      summary:
        "شناسایی آسیب‌پذیری سرریز بافر در ماژول مدیریت احراز هویت گیت‌وی‌های ریموت که امکان اجرای کد از راه دور (RCE) قبل از احراز هویت را فراهم می‌کند.",
      mitigation:
        "محدود کردن دسترسی اینترفیس مدیریت تنها به IPهای مجاز شبکه داخلی و فعال‌سازی دیواره‌های آتش برنامه کاربردی (WAF).",
    },
    {
      id: "adv-04",
      title: "هشدار سرقت سشن‌های کوکی بدون نیاز به رمز عبور در پلتفرم‌های ابری و ایمیل",
      category: "urgent",
      categoryLabel: "هشدار فوری",
      severity: "HIGH",
      date: "۲۲ شهریور ۱۴۰۵ · 11:20",
      summary:
        "بیش از ۷۰ درصد نفوذهای اخیر به سازمان‌ها نه از طریق حدس زدن پسورد، بلکه به واسطه دزدیده شدن کوکی‌های معتبر مرورگر پس از آلودگی سیستم پرسنل صورت گرفته است.",
      mitigation:
        "کوتاه کردن دوره انقضای نشست‌ها، الزام به Binding نشست با مشخصات شبکه کلاینت، و استفاده از آنتی‌استیلر هوشمند روی کلاینت‌ها.",
    },
  ];

  const filtered = filter === "all" ? advisories : advisories.filter((a) => a.category === filter);

  return (
    <section id="radar" className="py-12 sm:py-20 bg-slate-950 border-b border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Optional Breadcrumb */}
        {onBackToHome && (
          <div className="mb-8 flex items-center gap-2 text-xs text-slate-400">
            <button
              onClick={onBackToHome}
              className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer flex items-center gap-1.5"
            >
              <span>صفحه اصلی رهام</span>
            </button>
            <span>/</span>
            <span className="text-slate-300">رادار اخبار و هوش تهدیدات</span>
          </div>
        )}

        {/* Section Header with Live Radar Pulsar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 mb-3">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                رادار اخبار و هوش تهدیدات رهام
              </span>
              <span aria-hidden="true">·</span>
              <span>Threat Intel Bulletin</span>
              <span aria-hidden="true">·</span>
              <span>به‌روزرسانی هفتگی</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight" style={{ textWrap: "balance" }}>
              رصدخانه سایبری؛ آخرین هشدارهای امنیتی و تحلیل بدافزارها
            </h2>

            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
              تحلیل عمیق رویدادهای سایبری، آسیب‌پذیری‌های روز و کمپین‌های فعال سرقت اطلاعات توسط پژوهشگران تیم رهام جهت آمادگی و اقدام پیشگیرانه سازمان‌ها.
            </p>
          </div>

          {/* Interactive Filter Tabs (Functional buttons with click handlers) */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl shrink-0 self-start md:self-end">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filter === "all"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              همه گزارش‌ها
            </button>
            <button
              onClick={() => setFilter("urgent")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filter === "urgent"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              هشدارهای فوری
            </button>
            <button
              onClick={() => setFilter("malware")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filter === "malware"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              تحلیل بدافزار
            </button>
            <button
              onClick={() => setFilter("zeroday")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filter === "zeroday"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              روز صفر (0-Day)
            </button>
          </div>
        </div>

        {/* Advisories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveAdvisory(item)}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/90 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Clean unboxed metadata line */}
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-semibold">{item.categoryLabel}</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="text-slate-400 tabular-nums">{item.date}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.severity === "CRITICAL"
                        ? "bg-rose-950/70 text-rose-400 border border-rose-800/40"
                        : "bg-amber-950/70 text-amber-400 border border-amber-800/40"
                    }`}
                  >
                    {item.severity}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug mb-3">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed line-clamp-3 mb-4">
                  {item.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500">مشاهده تحلیل و راهکارهای پیشگیری</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1 group-hover:translate-x-[-2px] transition-transform">
                  مطالعه هشدار
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Note on Upcoming News Expansion */}
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/70 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>
            قابلیت یکپارچه‌سازی وب‌هوک‌های امنیتی، هشدارهای پیامکی و فید بلادرنگ CVE برای مشترکان سازمان‌های همکار رهام فعال خواهد شد.
          </span>
          <span className="font-mono text-emerald-400/90 shrink-0">
            Roham Intelligence Network v1.0
          </span>
        </div>
      </div>

      {/* Advisory Modal Detail */}
      {activeAdvisory && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveAdvisory(null)}
        >
          <div
            className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5 text-slate-200 shadow-2xl animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
            style={{ direction: "rtl" }}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-mono text-emerald-400 font-semibold">
                  {activeAdvisory.categoryLabel} · {activeAdvisory.severity}
                </span>
              </div>
              <button
                onClick={() => setActiveAdvisory(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
              {activeAdvisory.title}
            </h3>

            <div className="space-y-4 text-xs sm:text-sm leading-relaxed">
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="font-semibold text-emerald-400 block mb-1">خلاصه تهدید:</span>
                <p className="text-slate-300">{activeAdvisory.summary}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="font-semibold text-cyan-400 block mb-1">اقدامات پیشگیرانه و رفع بحران (Mitigation):</span>
                <p className="text-slate-300">{activeAdvisory.mitigation}</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveAdvisory(null)}
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
              >
                بستن پنجره
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
