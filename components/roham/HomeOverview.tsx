"use client";

import React from "react";
import {
  Shield,
  ArrowLeft,
  BookOpen,
  GraduationCap,
  FileText,
  Radio,
  Briefcase,
  Lock,
  ChevronLeft,
  Sparkles,
  Terminal,
} from "lucide-react";

interface HomeOverviewProps {
  onNavigate: (tab: "home" | "anti-stealer" | "courses" | "blog" | "radar" | "services") => void;
  onOpenReader: () => void;
  onOpenEarlyAccess: () => void;
  onOpenConsultation: () => void;
}

export const HomeOverview: React.FC<HomeOverviewProps> = ({
  onNavigate,
  onOpenReader,
  onOpenEarlyAccess,
  onOpenConsultation,
}) => {
  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. Hero Section: Clean, Breathable, Editorial */}
      <section className="relative pt-12 sm:pt-20 pb-12 overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <Shield className="w-3.5 h-3.5" />
            <span>گروه امنیتی رهام · ROHAM SECURITY</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.2]">
            پلتفرم پیشرفته دفاع سایبری و هوش تهدیدات رهام
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 text-base sm:text-xl max-w-3xl mx-auto leading-relaxed">
            سپر تخصصی در برابر بدافزارهای استیلر، محافظت بلادرنگ از سشن‌ها و اطلاعات هویتی، آموزش‌های پیشرفته سازمانی و مرکز تحقیقات آسیب‌پذیری‌های روز صفر.
          </p>

          {/* Primary Action Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigate("anti-stealer")}
              className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-950 flex items-center gap-2 cursor-pointer"
            >
              <span>معرفی محصول آنتی‌استیلر هوشمند</span>
              <ArrowLeft className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenReader}
              className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>ورود به کتابخوان تخصصی</span>
            </button>
          </div>

          {/* Domains */}
          <div className="pt-6 flex items-center justify-center gap-3 text-xs font-mono text-slate-500">
            <span>roham.org</span>
            <span>·</span>
            <span>rohamsecurity.com</span>
            <span>·</span>
            <span>rohamsec.com</span>
          </div>
        </div>
      </section>

      {/* 2. Flagship Product Spotlight: Roham Anti-Stealer */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-emerald-950/20 border border-emerald-500/30 p-8 sm:p-12 relative overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left/Content Column */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-950/80 border border-emerald-800/50 text-emerald-400 font-mono text-xs">
                <Lock className="w-3.5 h-3.5" />
                <span>محصول پرچمدار در حال توسعه · بزودی</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                آنتی‌استیلر هوشمند رهام (Roham Anti-Stealer)
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                بدافزارهای استیلر مدرن (نظیر RedLine, Lumma, Vidar) در عرض کمتر از ۶۰ ثانیه پسوردها، سشن کوکی‌ها، توکن‌های دیسکورد و تلگرام را ربوده و احراز هویت دومرحله‌ای را دور می‌زنند. آنتی‌استیلر رهام با ایزوله‌سازی سشن‌ها، حفاظت از کلیدهای DPAPI و پایش هوک‌های حافظه، جلوی دزدی هویت را پیش از وقوع می‌گیرد.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>سپر محافظ پایگاه‌داده کوکی‌های مرورگر</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>محافظت در برابر لاگرهای حافظه و کیلاگرها</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>خنثی‌سازی حملات دور زدن رمزنگاری DPAPI</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>معماری محلی بدون ارسال داده به سرور خارجی</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onNavigate("anti-stealer")}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-950"
                >
                  <span>مشاهده صفحه کامل و دموی تعاملی محصول</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onOpenEarlyAccess}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors border border-slate-700 cursor-pointer"
                >
                  رزرو نسخه بتای زودهنگام
                </button>
              </div>
            </div>

            {/* Right/Visual Column */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-slate-400">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>Roham Defense Engine</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                    فعال
                  </span>
                </div>

                <div className="space-y-2 text-[11px] text-slate-300" style={{ direction: "ltr", textAlign: "left" }}>
                  <div className="text-emerald-400">[SHIELD] SQLite Cookie Store: LOCKED</div>
                  <div className="text-slate-400">[GUARD] Windows DPAPI Master Key: PROTECTED</div>
                  <div className="text-emerald-400">[BLOCK] Unauthorized read on /AppData/Local/Temp: PREVENTED</div>
                  <div className="text-blue-400">[INTEGRITY] Session Hijacking attempt: BLOCKED (0ms)</div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>شاخص مقاومت در برابر سرقت:</span>
                  <span className="font-bold text-emerald-400">۹۹.۸٪</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Pillars Hub: Clean 4-Card Gateways */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            بخش‌ها و خدمات تخصصی امنیت رهام
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            برای دسترسی راحت و مطالعه بدون پیچیدگی، هر بخش در یک صفحه اختصاصی، آرام و خوانا در اختیار شماست.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Courses */}
          <div
            onClick={() => onNavigate("courses")}
            className="group p-7 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                دوره‌های آموزشی و آکادمی رهام
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                دوره‌های عملی تحلیل بدافزارهای استیلر، امن‌سازی سشن‌ها و دفاع از هویت، هاردنینگ سازمانی برای تیم‌های آبی و بوت‌کمپ روز صفر همراه با لَب اختصاصی.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-emerald-400">
              <span>مشاهده دوره‌ها و سرفصل‌ها</span>
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Blog */}
          <div
            onClick={() => onNavigate("blog")}
            className="group p-7 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                وبلاگ و مقالات تحلیلی امنیت
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                تحلیل‌های فنی اما کاملاً ساده، جذاب و خوانا بدون پیچیدگی درباره کالبدشکافی استیلرها، شکست پیامک‌های دومرحله‌ای و راهنمای امن‌سازی توسعه‌دهندگان.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-400">
              <span>ورود به وبلاگ و مقالات</span>
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Threat Radar */}
          <div
            onClick={() => onNavigate("radar")}
            className="group p-7 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                رادار اخبار و هوش تهدیدات
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                رصد بلادرنگ کمپین‌های فعال بدافزارها، آسیب‌پذیری‌های بحرانی روز صفر (Zero-Day) و بولتن‌های مشورتی برای محافظت فوری از زیرساخت‌های سازمان.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-amber-400">
              <span>مشاهده رادار اخبار و تهدیدات</span>
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Services */}
          <div
            onClick={() => onNavigate("services")}
            className="group p-7 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                خدمات و مشاوره سازمانی
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                ارزیابی مقاومت در برابر استیلرها، شبیه‌سازی تیم قرمز، ارتقای معماری به مدل بدون پسورد و ارزیابی محرمانه امنیتی برای اشخاص و شرکت‌ها.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-purple-400">
              <span>مشاهده خدمات و درخواست مشاوره</span>
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Research Library Spotlight Card */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <BookOpen className="w-4 h-4" />
              <span>کتابخانه مرجع تحقیقات امنیت سایبری</span>
            </div>
            <h3 className="text-2xl font-bold text-white">
              کتاب مرجع «از روز صفر تا روز صفر» (From Day Zero to Zero Day)
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              کتابخانه تعاملی رهام شامل ۱۱ فصل جامع، دو ترجمه فارسی هماهنگ‌شده با نسخه اصلی انگلیسی، کدهای هایلایت‌شده، دیکشنری توکار و بدون نیاز به اینترنت.
            </p>
          </div>

          <button
            onClick={onOpenReader}
            className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-950 flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0"
          >
            <span>ورود مستقیم به کتابخوان</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
