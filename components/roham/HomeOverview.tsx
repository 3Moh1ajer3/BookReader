"use client";

import React, { useEffect, useState } from "react";
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
  Terminal,
  Clock,
  Sparkles,
  AlertTriangle,
  Flame,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { fetchContentStore, NewsArticle, BlogPost } from "@/lib/contentStore";

interface HomeOverviewProps {
  onNavigate: (tab: "home" | "anti-stealer" | "courses" | "blog" | "radar" | "services") => void;
  onOpenReader: () => void;
  onOpenEarlyAccess: () => void;
  onOpenConsultation: () => void;
  portalTheme?: "light" | "dark";
}

export const HomeOverview: React.FC<HomeOverviewProps> = ({
  onNavigate,
  onOpenReader,
  onOpenEarlyAccess,
  onOpenConsultation,
  portalTheme = "light",
}) => {
  const isDark = portalTheme === "dark";
  const [latestNews, setLatestNews] = useState<NewsArticle[]>([]);
  const [latestBlogs, setLatestBlogs] = useState<BlogPost[]>([]);

  useEffect(() => {
    fetchContentStore().then((res) => {
      if (res.newsArticles && res.newsArticles.length > 0) {
        setLatestNews(res.newsArticles.slice(0, 3));
      }
      if (res.blogPosts && res.blogPosts.length > 0) {
        setLatestBlogs(res.blogPosts.slice(0, 3));
      }
    });
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. Hero Section: Prestigious Editorial & Cyber Research Journal */}
      <section className="relative pt-12 sm:pt-20 pb-12 overflow-hidden border-b border-slate-200/80 dark:border-slate-800/80">
        {/* Soft elegant background ambient */}
        <div
          className={`absolute inset-0 pointer-events-none ${
            isDark
              ? "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/20 via-slate-950 to-slate-950"
              : "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50/60 via-slate-50 to-white"
          }`}
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
          {/* Unboxed Editorial Kicker (Zero-Pill Discipline) */}
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              مرکز تحقیقات هوش تهدیدات و دفاع سایبری رهام
            </span>
            <span aria-hidden="true">·</span>
            <span>Roham Cyber Intelligence</span>
            <span aria-hidden="true">·</span>
            <span>تحقیقات زیرودی و آنتی‌استیلر هوشمند</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-5 max-w-4xl">
            <h1
              className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.25] text-slate-900 dark:text-white"
              style={{ textWrap: "balance" }}
            >
              دیدبانی پیشرفته هوش تهدیدات سایبری،{" "}
              <span className="text-emerald-700 dark:text-emerald-400">
                مهندسی معکوس بدافزار
              </span>{" "}
              و معماری دفاع سازمانی
            </h1>

            <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              آزمایشگاه مستقل پژوهش‌های پیشرفته امنیت، تحلیل تخصصی آسیب‌پذیری‌های روز صفر (Zero-Day)، سپر دفاع فعال در برابر بدافزارهای استیلر و ناشر کتب و بولتن‌های تخصصی امنیت سایبری.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate("radar")}
              className="px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Radio className="w-4 h-4" />
              <span>مشاهده رادار هوش تهدیدات</span>
              <ArrowLeft className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenReader}
              className={`px-6 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer border ${
                isDark
                  ? "bg-slate-900 hover:bg-slate-800 text-slate-100 border-slate-700/80"
                  : "bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-2xs"
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>ورود به کتابخوان تخصصی (کتاب روز صفر)</span>
            </button>

            <button
              onClick={onOpenConsultation}
              className={`px-5 py-3.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                isDark
                  ? "text-slate-300 hover:text-white hover:bg-slate-900"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              مشاوره و ارزیابی امنیتی ←
            </button>
          </div>

          {/* Clean Claim-to-Proof Pillars (Zero Fake Telemetry) */}
          <div className="pt-8 border-t border-slate-200/90 dark:border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-right">
            <div>
              <span className="block text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white tabular-nums">
                ۱۱ فصل
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                کتاب مرجع «از روز صفر تا روز صفر»
              </span>
            </div>
            <div>
              <span className="block text-2xl sm:text-3xl font-black font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
                ۱۰۰٪ محلی
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                ایزولاسیون سشن‌ها بدون نشت داده
              </span>
            </div>
            <div>
              <span className="block text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white tabular-nums">
                Zero-Day
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                شکار تهدیدات و تحلیل زنجیره اکسپلویت
              </span>
            </div>
            <div>
              <span className="block text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white tabular-nums">
                DPAPI Guard
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                حفاظت از کلیدهای رمزنگاری مرورگر
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Core Pillars Hub: Clean 4-Card Gateways */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-2">
          <div className="text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400 tracking-wider">
            بخش‌های تخصصی پرتال رهام
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            شایستگی‌های کلیدی و محورهای پژوهش
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-2xl leading-relaxed">
            زیرساخت‌های تحلیلی، محصولات دفاعی و پایگاه دانش فنی رهام برای تیم‌های امنیت، پژوهشگران باینری و مدیران زیرساخت.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Threat Radar */}
          <div
            onClick={() => onNavigate("radar")}
            className={`group p-8 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
              isDark
                ? "bg-slate-900/60 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900"
                : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md shadow-xs"
            }`}
          >
            <div className="space-y-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isDark ? "bg-amber-500/10 text-amber-400" : "bg-amber-50 text-amber-700 border border-amber-200/60"
                }`}
              >
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                رادار اخبار و هوش تهدیدات (Threat Radar)
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                رصد مداوم کمپین‌های فعال بدافزارها، آسیب‌پذیری‌های بحرانی روز صفر (Zero-Day)، ردیابی باج‌افزارها و بولتن‌های راهنمای پیشگیری و ایمن‌سازی برای تیم‌های دفاعی (Blue Team).
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <span>ورود به رادار اخبار و گزارش‌ها</span>
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Blog & Deep Research */}
          <div
            onClick={() => onNavigate("blog")}
            className={`group p-8 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
              isDark
                ? "bg-slate-900/60 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900"
                : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md shadow-xs"
            }`}
          >
            <div className="space-y-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-700 border border-blue-200/60"
                }`}
              >
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                وبلاگ و تحقیقات عمیق باینری (Technical Research)
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                کالبدشکافی دقیق سازوکار بدافزارهای استیلر، دور زدن احراز هویت دومرحله‌ای، واکاوی ساختار باینری درایورهای آسیب‌پذیر (BYOVD) و مقالات مرجع مهندسی معکوس.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-400">
              <span>مطالعه مقالات پژوهشی</span>
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Anti-Stealer Guard */}
          <div
            onClick={() => onNavigate("anti-stealer")}
            className={`group p-8 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
              isDark
                ? "bg-slate-900/60 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900"
                : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md shadow-xs"
            }`}
          >
            <div className="space-y-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                }`}
              >
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                آنتی‌استیلر هوشمند رهام (Roham StealerGuard)
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                سپر دفاعی نسل جدید؛ محافظت از پایگاه‌داده کوکی‌های مرورگر، جلوگیری از سرقت سشن‌های گوگل، تلگرام و دیسکورد، و مسدودسازی هوک‌های مخرب در حافظه بدون نیاز به ارسال داده به سرور خارجی.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <span>مشاهده معماری فنی و دمو</span>
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Enterprise Services */}
          <div
            onClick={() => onNavigate("services")}
            className={`group p-8 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
              isDark
                ? "bg-slate-900/60 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900"
                : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md shadow-xs"
            }`}
          >
            <div className="space-y-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isDark ? "bg-purple-500/10 text-purple-400" : "bg-purple-50 text-purple-700 border border-purple-200/60"
                }`}
              >
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                خدمات سازمانی و پاسخ به رخداد (Incident Response)
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                شبیه‌سازی سناریوهای نفوذ تیم قرمز، ارزیابی مقاومت دارایی‌ها در برابر بدافزارهای سرقت هویت، هاردنینگ کرنل و سیستم‌های ویندوزی و بررسی تخصصی فارنزیک در مواجهه با رخدادهای نشت داده.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-purple-700 dark:text-purple-400">
              <span>مشاهده بسته‌های خدمات سازمانی</span>
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Book Spotlight: "From Day Zero to Zero Day" */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`p-8 sm:p-12 rounded-3xl border transition-all ${
            isDark
              ? "bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border-slate-800"
              : "bg-gradient-to-br from-white via-slate-50 to-emerald-50/50 border-slate-200/90 shadow-sm"
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400">
                <BookOpen className="w-4 h-4" />
                <span>کتاب مرجع اختصاصی رهام · ترجمه فارسی و متن اصلی انگلیسی</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                کتاب جامع «از روز صفر تا روز صفر» (From Day Zero to Zero Day)
              </h2>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                دایره‌المعارف ۱۱ فصلی تحقیق و بهره‌برداری از آسیب‌پذیری‌ها، توسعه شل‌کد، اکسپلویت‌های سرریز بافر و دور زدن مکانیزم‌های دفاعی مدرن نظیر DEP، ASLR و CFG. این اثر در کتابخوان اختصاصی رهام با امکان ترجمه لحظه‌ای کلمات، هایلایت‌گذاری و دسترسی کاملاً آفلاین در اختیار شما قرار دارد.
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 pt-1">
                <span>۱۱ فصل تخصصی همراه با کدهای C/C++</span>
                <span aria-hidden="true">·</span>
                <span>همگام‌سازی لحظه‌ای فارسی و انگلیسی</span>
                <span aria-hidden="true">·</span>
                <span>قابلیت مطالعه ۱۰۰٪ آفلاین</span>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={onOpenReader}
                  className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>ورود به کتابخوان و مطالعه فصل‌ها</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <div
                onClick={onOpenReader}
                className={`p-6 rounded-2xl border max-w-xs w-full text-center space-y-4 cursor-pointer hover:scale-102 transition-transform ${
                  isDark ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200 shadow-md"
                }`}
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                  <Shield className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                    از روز صفر تا روز صفر
                  </h4>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    From Day Zero to Zero Day
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  فصل ۱ تا ۱۱ آماده مطالعه ←
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Latest Threat Intelligence Advisories */}
      {latestNews.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <div className="text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400 tracking-wider">
                هوش تهدیدات بلادرنگ
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                تازه‌ترین بولتن‌های امنیتی رادار رهام
              </h2>
            </div>
            <button
              onClick={() => onNavigate("radar")}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>مشاهده تمام اخبار و بولتن‌ها</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestNews.map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigate("radar")}
                className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isDark
                    ? "bg-slate-900/60 border-slate-800 hover:border-emerald-500/50"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md shadow-xs"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      {item.categoryLabel}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">{item.date}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {item.summary}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>زمان مطالعه: {item.readTime}</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold group-hover:underline">
                    مطالعه کامل ←
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Latest Technical Research Blogs */}
      {latestBlogs.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <div className="text-xs font-bold font-mono text-blue-700 dark:text-blue-400 tracking-wider">
                آزمایشگاه پژوهش و کالبدشکافی
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                تحقیقات و مقالات تحلیلی وبلاگ
              </h2>
            </div>
            <button
              onClick={() => onNavigate("blog")}
              className="text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>مشاهده تمام مقالات فنی</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestBlogs.map((post) => (
              <div
                key={post.id}
                onClick={() => onNavigate("blog")}
                className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isDark
                    ? "bg-slate-900/60 border-slate-800 hover:border-blue-500/50"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md shadow-xs"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-700 dark:text-blue-400">
                      {post.category}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">{post.date}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {post.summary}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>سطح: {post.difficulty}</span>
                  <span className="text-blue-700 dark:text-blue-400 font-semibold">
                    مطالعه مقاله ←
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Emergency Consultation CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`p-8 sm:p-10 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-6 ${
            isDark
              ? "bg-slate-900 border-slate-800"
              : "bg-slate-900 text-white border-slate-800 shadow-md"
          }`}
        >
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <Shield className="w-4 h-4" />
              <span>پاسخ به رخداد، مشاوره معماری و هاردنینگ سازمانی</span>
            </div>
            <h3 className="text-2xl font-bold text-white">
              نیاز به ارزیابی امنیتی، تحلیل لاگ یا استقرار آنتی‌استیلر دارید؟
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              تیم شکار تهدید و مهندسی معکوس رهام آماده همکاری با سازمان‌ها، استارتاپ‌ها و زیرساخت‌های حساس جهت ارزیابی نفوذپذیری، ایمن‌سازی نشست‌ها و واکنش فوری به حوادث نشت داده است.
            </p>
          </div>

          <button
            onClick={onOpenConsultation}
            className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0"
          >
            <span>درخواست مشاوره محرمانه</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
