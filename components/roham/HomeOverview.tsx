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
  Send,
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
    <div className="space-y-16 sm:space-y-20 pb-20">
      {/* 1. Hero Section: Clean, Minimalist, Prestigious */}
      <section className="relative pt-12 sm:pt-20 pb-12 overflow-hidden border-b border-slate-200 dark:border-slate-800">
        <div
          className={`absolute inset-0 pointer-events-none ${
            isDark
              ? "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/20 via-slate-950 to-slate-950"
              : "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50/50 via-slate-50/60 to-white"
          }`}
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6 text-right">
          {/* Unboxed Metadata Tagline */}
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
            <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              مرکز تحقیقات امنیت و دفاع سایبری رهام
            </span>
            <span aria-hidden="true">·</span>
            <span>Roham Security Labs</span>
            <span aria-hidden="true">·</span>
            <span>پژوهش مستقل و دفاع کاربردی</span>
          </div>

          {/* Main Title */}
          <div className="space-y-4 max-w-3xl">
            <h1
              className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.3] text-slate-900 dark:text-white"
              style={{ textWrap: "balance" }}
            >
              مرکز تحقیقات امنیت و دفاع سایبری رهام
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              آزمایشگاه مستقل پژوهش‌های امنیت، تحلیل بدافزارها و استیلرها، رصد اخبار فوری امنیت سایبری، و ناشر مراجع تخصصی آسیب‌پذیری و دفاع نوین.
            </p>
          </div>

          {/* Clean Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate("radar")}
              className="px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Radio className="w-4 h-4" />
              <span>مشاهده اخبار امنیت</span>
              <ArrowLeft className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenReader}
              className={`px-6 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer border ${
                isDark
                  ? "bg-slate-900 hover:bg-slate-800 text-slate-100 border-slate-800"
                  : "bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-2xs"
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>ورود به کتابخوان تخصصی</span>
            </button>

            <a
              href="https://t.me/RohamSec"
              target="_blank"
              rel="noopener noreferrer"
              className={`px-5 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer border ${
                isDark
                  ? "bg-sky-950/40 text-sky-300 border-sky-800/60 hover:bg-sky-900/40"
                  : "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100"
              }`}
            >
              <Send className="w-4 h-4" />
              <span>کانال تلگرام (@RohamSec)</span>
            </a>
          </div>

          {/* 4 Clean Key Pillars */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-right">
            <div>
              <span className="block text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">
                پژوهش‌های زیرودی
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                کالبدشکافی آسیب‌پذیری‌های فعال
              </span>
            </div>
            <div>
              <span className="block text-xl sm:text-2xl font-black font-mono text-emerald-700 dark:text-emerald-400">
                ضد استیلر
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                سپر دفاعی سشن‌ها و کوکی‌ها
              </span>
            </div>
            <div>
              <span className="block text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">
                کتاب روز صفر
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                ۱۱ فصل تخصصی دوزبانه
              </span>
            </div>
            <div>
              <span className="block text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">
                مشاوره و ارزیابی
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                پاسخ به رخداد و هاردنینگ
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Core Pillars Hub: Clean 4 Gateways */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="space-y-1 text-right">
          <div className="text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400 tracking-wider">
            بخش‌های مرکز تحقیقات
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            شایستگی‌های کلیدی و محورهای پژوهش
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: Security News */}
          <div
            onClick={() => onNavigate("radar")}
            className={`p-7 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              isDark
                ? "bg-slate-900/80 border-slate-800 hover:border-emerald-500/50"
                : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md shadow-xs"
            }`}
          >
            <div className="space-y-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  isDark ? "bg-amber-500/10 text-amber-400" : "bg-amber-50 text-amber-700 border border-amber-200/60"
                }`}
              >
                <Radio className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                اخبار امنیت (Security News)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                رصد تازه‌ترین اخبار امنیت سایبری، تحلیل هشدارهای فوری، گزارش‌های رخداد و راهنمای پیشگیری و ایمن‌سازی برای سازمان‌ها و کارشناسان امنیت.
              </p>
            </div>
            <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <span>مشاهده اخبار امنیت</span>
              <ChevronLeft className="w-4 h-4" />
            </div>
          </div>

          {/* Card 2: Blog & Technical Research */}
          <div
            onClick={() => onNavigate("blog")}
            className={`p-7 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              isDark
                ? "bg-slate-900/80 border-slate-800 hover:border-emerald-500/50"
                : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md shadow-xs"
            }`}
          >
            <div className="space-y-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-700 border border-blue-200/60"
                }`}
              >
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                وبلاگ و تحقیقات عمیق باینری
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                کالبدشکافی دقیق سازوکار بدافزارهای استیلر، دور زدن احراز هویت دومرحله‌ای، واکاوی ساختار باینری درایورهای آسیب‌پذیر و مقالات مرجع مهندسی معکوس.
              </p>
            </div>
            <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-400">
              <span>مطالعه مقالات پژوهشی</span>
              <ChevronLeft className="w-4 h-4" />
            </div>
          </div>

          {/* Card 3: Anti-Stealer */}
          <div
            onClick={() => onNavigate("anti-stealer")}
            className={`p-7 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              isDark
                ? "bg-slate-900/80 border-slate-800 hover:border-emerald-500/50"
                : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md shadow-xs"
            }`}
          >
            <div className="space-y-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                }`}
              >
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                آنتی‌استیلر هوشمند رهام
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                سپر دفاعی نسل جدید؛ محافظت از کوکی‌های مرورگر، جلوگیری از سرقت سشن‌های گوگل، تلگرام و دیسکورد، و ایزولاسیون حافظه بدون نشت تله‌متری.
              </p>
            </div>
            <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <span>مشاهده معماری فنی</span>
              <ChevronLeft className="w-4 h-4" />
            </div>
          </div>

          {/* Card 4: Enterprise Services */}
          <div
            onClick={() => onNavigate("services")}
            className={`p-7 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              isDark
                ? "bg-slate-900/80 border-slate-800 hover:border-emerald-500/50"
                : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md shadow-xs"
            }`}
          >
            <div className="space-y-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  isDark ? "bg-purple-500/10 text-purple-400" : "bg-purple-50 text-purple-700 border border-purple-200/60"
                }`}
              >
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                خدمات سازمانی و پاسخ به رخداد
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                شبیه‌سازی حملات، ارزیابی مقاومت دارایی‌ها در برابر بدافزارهای سرقت هویت، هاردنینگ سیستم‌ها و بررسی فارنزیک حوادث امنیتی.
              </p>
            </div>
            <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-purple-700 dark:text-purple-400">
              <span>مشاهده بسته‌های خدمات</span>
              <ChevronLeft className="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Book Spotlight: "From Day Zero to Zero Day" */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`p-8 rounded-3xl border transition-all ${
            isDark
              ? "bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20 border-slate-800"
              : "bg-gradient-to-br from-white via-slate-50 to-emerald-50/40 border-slate-200 shadow-sm"
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-right">
            <div className="lg:col-span-8 space-y-3.5">
              <div className="flex items-center gap-2 text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400">
                <BookOpen className="w-4 h-4" />
                <span>کتاب مرجع اختصاصی رهام · ترجمه فارسی و متن اصلی انگلیسی</span>
              </div>

              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                کتاب جامع «از روز صفر تا روز صفر» (From Day Zero to Zero Day)
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                دایره‌المعارف ۱۱ فصلی تحقیق و بهره‌برداری از آسیب‌پذیری‌ها، توسعه شل‌کد و دور زدن مکانیزم‌های دفاعی مدرن نظیر DEP، ASLR و CFG با امکان مطالعه آفلاین، هایلایت‌گذاری و ترجمه لحظه‌ای.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={onOpenReader}
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>ورود به کتابخوان</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <div
                onClick={onOpenReader}
                className={`p-6 rounded-2xl border max-w-xs w-full text-center space-y-3 cursor-pointer hover:scale-102 transition-transform ${
                  isDark ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                }`}
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                  <Shield className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
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

      {/* 4. Latest Security News (اخبار امنیت) */}
      {latestNews.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 text-right">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <div className="text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400 tracking-wider">
                گزارش‌های خبری
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                تازه‌ترین اخبار امنیت
              </h2>
            </div>
            <button
              onClick={() => onNavigate("radar")}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>مشاهده همه اخبار</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {latestNews.map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigate("radar")}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isDark
                    ? "bg-slate-900/70 border-slate-800 hover:border-emerald-500/50"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md shadow-xs"
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      {item.categoryLabel || item.category}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">{item.date}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {item.summary}
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>زمان مطالعه: {item.readTime}</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                    مطالعه خبر ←
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Latest Technical Research Blogs */}
      {latestBlogs.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 text-right">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <div className="text-xs font-bold font-mono text-blue-700 dark:text-blue-400 tracking-wider">
                آزمایشگاه پژوهش
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                تازه‌ترین مقالات وبلاگ و پژوهش‌ها
              </h2>
            </div>
            <button
              onClick={() => onNavigate("blog")}
              className="text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>مشاهده همه مقالات</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {latestBlogs.map((post) => (
              <div
                key={post.id}
                onClick={() => onNavigate("blog")}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isDark
                    ? "bg-slate-900/70 border-slate-800 hover:border-blue-500/50"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md shadow-xs"
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-700 dark:text-blue-400">
                      {post.category}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">{post.date}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-snug line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {post.summary}
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
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

      {/* 6. Emergency Consultation Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`p-7 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-6 ${
            isDark
              ? "bg-slate-900 border-slate-800"
              : "bg-slate-900 text-white border-slate-800 shadow-md"
          }`}
        >
          <div className="space-y-2 max-w-xl text-right">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <Shield className="w-4 h-4" />
              <span>پاسخ به رخداد، مشاوره معماری و هاردنینگ سازمانی</span>
            </div>
            <h3 className="text-xl font-bold text-white">
              نیاز به ارزیابی امنیتی، تحلیل لاگ یا استقرار آنتی‌استیلر دارید؟
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              تیم شکار تهدید و مهندسی معکوس رهام آماده همکاری با سازمان‌ها و استارتاپ‌ها جهت ارزیابی نفوذپذیری، ایمن‌سازی نشست‌ها و واکنش فوری به حوادث نشت داده است.
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
