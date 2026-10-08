"use client";

import React, { useState } from "react";
import {
  GraduationCap,
  Clock,
  Award,
  Layers,
  CheckCircle2,
  Users,
  Terminal,
  Shield,
  ArrowLeft,
  ChevronDown,
  Sparkles,
  BookOpen,
} from "lucide-react";

export interface Course {
  id: string;
  code: string;
  title: string;
  englishTitle: string;
  duration: string;
  level: "پیشرفته" | "متوسط تا پیشرفته" | "سازمانی و مدیریتی" | "فوق تخصصی";
  audience: string;
  mode: "آنلاین تعاملی + آزمایشگاه ابری" | "حضوری سازمانی یا آنلاین" | "بوت‌کمپ کارگاهی فشرده";
  description: string;
  highlights: string[];
  syllabus: {
    title: string;
    topics: string[];
  }[];
  prerequisites: string;
}

export const ROHAM_COURSES: Course[] = [
  {
    id: "course-stealer-malware",
    code: "RH-MAL-401",
    title: "مهندسی معکوس و تحلیل بدافزارهای استیلر (Stealer Triage & Malware Analysis)",
    englishTitle: "Advanced Infostealer Analysis & Reverse Engineering",
    duration: "۴۰ ساعت آموزش کارگاهی + ۲۰ ساعت لَب",
    level: "پیشرفته",
    audience: "کارشناسان امنیت، تحلیل‌گران SOC، متخصصین تیم آبی (Blue Team) و پژوهشگران بدافزار",
    mode: "آنلاین تعاملی + آزمایشگاه ابری",
    description:
      "دوره کاملاً عملی و لَب‌محور برای کالبدشکافی استیلرهای مدرن (RedLine, Lumma, Vidar, Meduza). یادگیری نحوه استخراج پی‌لودها، آنالیز رفتار استیلرها در حافظه، تحلیل الگوهای سرقت کوکی و نگارش امضاهای YARA و روندهای دفاعی.",
    highlights: [
      "دسترسی به محیط سندباکس و لَب اختصاصی ابری برای تحلیل امن سمپل‌ها",
      "کار بر روی نمونه‌های بدافزار واقعی و نوظهور سال ۲۰۲۴ و ۲۰۲۶",
      "نگارش قوانین کشف (YARA Rules & Sigma) برای مسدودسازی استیلرها",
      "گواهینامه تخصصی تحلیل بدافزار رهام (Roham Certified Malware Analyst)",
    ],
    prerequisites: "آشنایی با مبانی سیستم‌عامل ویندوز، ساختار فایل‌های PE و زبان‌های C++ یا پایتون",
    syllabus: [
      {
        title: "فصل اول: اکوسیستم بدافزارهای استیلر و روش‌های تحویل (Delivery)",
        topics: [
          "تاریخچه و سیر تکاملی استیلرها از کوکی‌گرابرهای ساده تا بدافزارهای ماژولار چندلایه",
          "روش‌های انتشار: مهندسی اجتماعی، پکیج‌های مسموم npm/PyPI و بدافزارهای مبتنی بر تبلیغات گوگل (Malvertising)",
          "مقدمات راه‌اندازی آزمایشگاه ایزوله تحلیل بدافزار (Flare-VM و ابزارهای مانیتورینگ)",
        ],
      },
      {
        title: "فصل دوم: آنالیز استاتیک، Deobfuscation و آنپکینگ کدهای دات‌نت و گو",
        topics: [
          "شناسایی پکرها و کریپتورهای اختصاصی با Detect It Easy",
          "آنالیز کدهای دات‌نت با dnSpy و de4dot",
          "تحلیل باینری‌های کامپایل شده با Go و Rust با استفاده از افزونه‌های IDA Pro و Ghidra",
        ],
      },
      {
        title: "فصل سوم: مانیتورینگ رفتار دینامیک و مکانیزم‌های سرقت هویت",
        topics: [
          "تکنیک‌های خواندن فایل‌های SQLite مرورگرها و دور زدن App-Bound Encryption",
          "نحوه استخراج کلید مستر DPAPI با APIهای ویندوز (CryptUnprotectData)",
          "رهگیری ترافیک شبکه C2 و تلگرام بات‌های دریافت‌کننده لاگ‌ها با Wireshark و Fiddler",
        ],
      },
      {
        title: "فصل چهارم: توسعه دفاع، نگارش YARA و گزارش‌نویسی تهدیدات",
        topics: [
          "ساخت هوک‌های کرنلی و یوزرمود برای تشخیص تزریق کد",
          "فرمول‌بندی قوانین پیشرفته YARA برای شناسایی استیلرها قبل از اجرا",
          "نگارش گزارش هوش تهدیدات (Threat Intelligence Report) سازمانی",
        ],
      },
    ],
  },
  {
    id: "course-session-hardening",
    code: "RH-SEC-302",
    title: "امن‌سازی سشن‌ها، توکن‌های وب و دفاع در برابر سرقت هویت",
    englishTitle: "Session Security, Token Hardening & Identity Defense",
    duration: "۲۴ ساعت تعاملی و عملی",
    level: "متوسط تا پیشرفته",
    audience: "توسعه‌دهندگان وب، معماران نرم‌افزار، مهندسین DevSecOps و راهبران زیرساخت ابری",
    mode: "حضوری سازمانی یا آنلاین",
    description:
      "چگونه وب‌اپلیکیشن‌ها و سرویس‌های ابری خود را به گونه‌ای طراحی کنیم که حتی در صورت آلوده شدن کلاینت به استیلر، سشن‌ها و توکن‌های حیاتی غیرقابل سوءاستفاده باشند.",
    highlights: [
      "پیاده‌سازی استانداردهای Passkey و WebAuthn بدون پسورد",
      "معماری Token Binding و Device Bound Session Credentials (DBSC)",
      "پیکربندی امن کوکی‌های مرورگر و سشن‌های کلاینت در فریم‌ورک‌های مدرن",
      "کارگاه عملی مقابله با Session Replay و مسموم‌سازی توکن‌ها",
    ],
    prerequisites: "آشنایی با پروتکل HTTP، اصول توسعه وب و مفاهیم پایه‌ای احراز هویت (OAuth / JWT)",
    syllabus: [
      {
        title: "فصل اول: آسیب‌پذیری‌های نگهداری سشن و سناریوهای سرقت",
        topics: [
          "چرا LocalStorage و SessionStorage برای توکن‌های حساس به شدت خطرناک هستند؟",
          "کالبدشکافی ساختار کوکی‌ها: پرچم‌های HttpOnly, Secure, SameSite و پیشوندهای __Host-",
          "شبیه‌سازی سناریوی دزدی کوکی و بازپخش آن روی مرورگر مهاجم",
        ],
      },
      {
        title: "فصل دوم: پروتکل‌های بدون پسورد و استاندارد FIDO2",
        topics: [
          "معماری رمزنگاری کلید عمومی در WebAuthn و استاندارد Passkeys",
          "پیاده‌سازی گام‌به‌گام احراز هویت با کلید سخت‌افزاری (YubiKey) در بک‌اند",
          "جلوگیری از فیشینگ Real-time و حملات Adversary-in-the-Middle (AiTM)",
        ],
      },
      {
        title: "فصل سوم: معماری‌های مقاوم در برابر سرقت توکن",
        topics: [
          "تکنیک‌های چرخش سریع رفرش توکن (Refresh Token Rotation)",
          "محدودسازی سشن‌ها بر پایه ویژگی‌های شبکه و رفتار کاربر (Conditional Access)",
          "پیاده‌سازی مکانیزم‌های خروج سراسری و بی‌اعتبار کردن سشن‌های مسروقه",
        ],
      },
    ],
  },
  {
    id: "course-enterprise-defense",
    code: "RH-BLU-501",
    title: "امن‌سازی جامع زیرساخت و آمادگی در برابر نفوذ تیم‌های قرمز",
    englishTitle: "Enterprise Hardening & Blue Team Incident Readiness",
    duration: "۳۲ ساعت آموزش کارگاهی و سناریو-محور",
    level: "سازمانی و مدیریتی",
    audience: "مدیران امنیت اطلاعات (CISO)، ادمین‌های شبکه و سیستم، کارشناسان زیرساخت فناوری اطلاعات",
    mode: "حضوری سازمانی یا آنلاین",
    description:
      "طراحی و استقرار خط‌مشی‌های دفاع در عمق (Defense in Depth) در سازمان‌ها برای بستن راه‌های نفوذ مهاجمان، مهار تحرکات جانبی (Lateral Movement) و ایجاد آمادگی فوری در برابر باج‌افزارها و استیلرها.",
    highlights: [
      "هاردنینگ اکتیو دایرکتوری (Active Directory) و معماری Tiered Administrative Model",
      "پیکربندی استراتژیک سیستم‌های EDR/SIEM و مانیتورینگ فعالیت پروسه‌ها با Sysmon",
      "سناریوهای رزمایش سایبری (Tabletop Exercise) متناسب با تهدیدات واقعی",
      "ارائه چک‌لیست‌های انطباقی و هاردنینگ اختصاصی گروه امنیتی رهام",
    ],
    prerequisites: "تجربه در مدیریت شبکه‌های سازمانی و سیستم‌عامل‌های سرور (Windows Server / Linux)",
    syllabus: [
      {
        title: "فصل اول: استراتژی ایزوله‌سازی دارایی‌ها و مدل دفاع لایه‌ای",
        topics: [
          "جداسازی شبکه‌های اداری، مدیریتی و سرورهای حساس",
          "سیاست‌های اصولی هاردنینگ سیستم‌عامل ویندوز کلاینت‌ها از طریق Group Policy",
          "مسدودسازی ابزارهای پیش‌فرض ویندوز که توسط هکرها استفاده می‌شوند (LOLBins)",
        ],
      },
      {
        title: "فصل دوم: لاگ‌برداری موثر و مانیتورینگ رفتاری",
        topics: [
          "استقرار و کانفیگ قانون‌مند Sysmon برای شکار تهدیدات (Threat Hunting)",
          "تحلیل رخدادهای دسترسی غیرمجاز به پروسه lsass.exe و رجیستری",
          "شناسایی رفتارهای مشکوک دسترسی انبوه به فایل‌های دیتابیس مرورگرها",
        ],
      },
      {
        title: "فصل سوم: مهار نفوذ و پاسخ به حوادث (Incident Response)",
        topics: [
          "تدوین فرآیند Playbook هنگام شناسایی یک ایستگاه آلوده به استیلر",
          "قرنطینه شبکه، ارزیابی دامنه نشت و ریست اضطراری کردنشیال‌های مشکوک",
          "بازیابی امن سرویس‌ها و انجام تحلیل پس از حادثه (Post-Mortem)",
        ],
      },
    ],
  },
  {
    id: "course-zero-day-research",
    code: "RH-ZDAY-601",
    title: "بوت‌کمپ تحقیقات روز صفر و کشف آسیب‌پذیری‌های حافظه",
    englishTitle: "Zero-Day Research & Vulnerability Discovery Bootcamp",
    duration: "۵۰ ساعت آموزش تخصصی کارگاهی",
    level: "فوق تخصصی",
    audience: "محققان آسیب‌پذیری، متخصصین تست نفوذ پیشرفته، مهندسین باینری و توسعه‌دهندگان سیستم",
    mode: "بوت‌کمپ کارگاهی فشرده",
    description:
      "طراحی شده بر اساس مباحث عمیق و اصیل کتاب «از روز صفر تا روز صفر». آموزش اصول فازینگ پیشرفته، تحلیل کرش‌های حافظه، مکانیک‌های اکسپلویت مدرن و راهکارهای بنیادین ارتقای امنیت نرم‌افزار.",
    highlights: [
      "مبتنی بر سرفصل‌های معتبر کتاب From Day Zero to Zero Day",
      "کار عملی با موتورهای Fuzzing پیشرفته (AFL++, LibFuzzer, Honggfuzz)",
      "تحلیل آسیب‌پذیری‌های واقعی مرورگرها و نرم‌افزارهای دسکتاپ",
      "پروژه نهایی کشف یک نقص امنیتی جدید در نرم‌افزارهای منبع‌باز",
    ],
    prerequisites: "تسلط بر زبان‌های C/C++، اسمبلی x86/x64 و درک عمیق ساختار حافظه (Stack و Heap)",
    syllabus: [
      {
        title: "فصل اول: مکانیک آسیب‌پذیری‌های سطح پایین و تخریب حافظه",
        topics: [
          "کالبدشکافی Stack Overflow, Heap Corruption, Use-After-Free و Type Confusion",
          "تحلیل رفتار کامپایلرها، ساختار Call Stack و مکانیزم مدیریت حافظه",
          "آشنایی با مکانیزم‌های دفاعی مدرن: DEP/NX, ASLR, SafeSEH, Control Flow Guard (CFG)",
        ],
      },
      {
        title: "فصل دوم: فازینگ مدرن و اتوماسیون کشف کرش",
        topics: [
          "تکنیک‌های Coverage-Guided Fuzzing با ابزار AFL++",
          "تولید دیکشنری، بهینه‌سازی Corpus و پایپ‌لاین‌های فازینگ موازی",
          "تریاژ خودکار کرش‌ها با AddressSanitizer (ASan) و Crashwalk",
        ],
      },
      {
        title: "فصل سوم: آنالیز اکسپلویت و تکنیک‌های بای‌پس",
        topics: [
          "ساخت زنجیره‌های ROP (Return-Oriented Programming) برای عبور از حفاظت‌ها",
          "متدهای نشت آدرس‌های حافظه (Information Disclosure) جهت دور زدن ASLR",
          "رویکردهای دفاعی پایدار و بازنویسی کد با استفاده از زبان‌های Memory-Safe نظیر Rust",
        ],
      },
    ],
  },
];

interface CoursesSectionProps {
  onOpenEnrollModal: (course: Course) => void;
  onOpenConsultation?: () => void;
  onOpenReader?: () => void;
  onBackToHome?: () => void;
  portalTheme?: "light" | "dark";
}

export const CoursesSection: React.FC<CoursesSectionProps> = ({
  onOpenEnrollModal,
  onOpenConsultation,
  onOpenReader,
  onBackToHome,
  portalTheme = "light",
}) => {
  const isDark = portalTheme === "dark";
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

  const toggleSyllabus = (courseId: string) => {
    setExpandedCourseId((prev) => (prev === courseId ? null : courseId));
  };

  return (
    <section
      id="courses"
      className={`py-12 sm:py-20 border-b relative transition-colors ${
        isDark ? "bg-slate-950 border-slate-900 text-slate-100" : "bg-[#fbfbf9] border-slate-200 text-slate-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Optional Breadcrumb */}
        {onBackToHome && (
          <div className={`mb-8 flex items-center gap-2 text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            <button
              onClick={onBackToHome}
              className="text-emerald-700 dark:text-emerald-400 hover:underline font-semibold cursor-pointer flex items-center gap-1.5"
            >
              <span>صفحه اصلی رهام</span>
            </button>
            <span>/</span>
            <span className={isDark ? "text-slate-300" : "text-slate-800 font-semibold"}>
              دوره‌های آموزشی و آکادمی رهام
            </span>
          </div>
        )}

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border ${
              isDark
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-emerald-50 border-emerald-200 text-emerald-800"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>آکادمی و دوره‌های آموزشی گروه امنیتی رهام</span>
          </div>
          <h2
            className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            دوره‌های تخصصی امنیت و دفاع سایبری
          </h2>
          <p className={`text-sm sm:text-base leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            آموزش‌های کاربردی، عمیق و پروژه-محور برای تیم‌های فنی سازمان‌ها، کارشناسان امنیت و پژوهشگران مستقل؛ طراحی شده توسط متخصصین ارشد دفاع در برابر استیلرها و تحقیقات روز صفر.
          </p>

          {/* Pillars Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs font-medium">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
                isDark ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-700 shadow-2xs"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>مبتنی بر پروژه‌ها و نمونه‌های واقعی</span>
            </div>
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
                isDark ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-700 shadow-2xs"
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>لَب اختصاصی و تمرینات سندباکس</span>
            </div>
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
                isDark ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-700 shadow-2xs"
              }`}
            >
              <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>گواهینامه پایان دوره معتبر رهام</span>
            </div>
          </div>
        </div>

        {/* Courses List */}
        <div className="space-y-8">
          {ROHAM_COURSES.map((course) => {
            const isExpanded = expandedCourseId === course.id;

            return (
              <div
                key={course.id}
                className={`rounded-3xl border transition-all duration-200 overflow-hidden ${
                  isDark
                    ? "bg-slate-900/60 border-slate-800/90 hover:border-emerald-500/40 shadow-lg"
                    : "bg-white border-slate-200/90 hover:border-emerald-500/60 shadow-sm"
                }`}
              >
                {/* Main Card Body */}
                <div className="p-6 sm:p-8 space-y-6">
                  {/* Top Bar: Code, Level, Duration */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-md font-mono text-xs font-bold border ${
                          isDark
                            ? "bg-emerald-950/80 border-emerald-800/50 text-emerald-400"
                            : "bg-emerald-50 border-emerald-200 text-emerald-800"
                        }`}
                      >
                        {course.code}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-md font-medium ${
                          isDark ? "bg-slate-800/80 text-slate-300" : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        سطح: {course.level}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-md hidden sm:inline-block ${
                          isDark ? "bg-slate-800/80 text-slate-300" : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        شیوه: {course.mode}
                      </span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 font-mono text-xs ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{course.duration}</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3
                      className={`text-xl sm:text-2xl font-bold tracking-tight leading-snug ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {course.title}
                    </h3>
                    <p
                      className="text-xs sm:text-sm font-mono text-slate-500"
                      style={{ direction: "ltr", textAlign: "right" }}
                    >
                      {course.englishTitle}
                    </p>
                    <p
                      className={`text-sm leading-relaxed pt-2 ${
                        isDark ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      {course.description}
                    </p>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {course.highlights.map((h, i) => (
                      <div
                        key={i}
                        className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs ${
                          isDark
                            ? "bg-slate-950/50 border-slate-800/60 text-slate-300"
                            : "bg-slate-50/70 border-slate-200/80 text-slate-700"
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>

                  {/* Audience & Prerequisites info */}
                  <div
                    className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs ${
                      isDark
                        ? "bg-slate-950/40 border-slate-800/50 text-slate-400"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>
                        <strong className={isDark ? "text-slate-300" : "text-slate-800"}>
                          مخاطبان هدف:
                        </strong>{" "}
                        {course.audience}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>
                        <strong className={isDark ? "text-slate-300" : "text-slate-800"}>
                          پیش‌نیاز:
                        </strong>{" "}
                        {course.prerequisites}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div
                    className={`pt-2 flex flex-wrap items-center justify-between gap-4 border-t ${
                      isDark ? "border-slate-800/80" : "border-slate-100"
                    }`}
                  >
                    <button
                      onClick={() => toggleSyllabus(course.id)}
                      className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer py-2 transition-colors"
                    >
                      <span>{isExpanded ? "بستن سرفصل‌ها و مباحث" : "مشاهده سرفصل‌های جامع دوره"}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onOpenEnrollModal(course)}
                        className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                      >
                        <span>درخواست ثبت‌نام و مشاوره دوره</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Collapsible Syllabus Section */}
                {isExpanded && (
                  <div
                    className={`border-t p-6 sm:p-8 animate-in slide-in-from-top-2 duration-200 ${
                      isDark ? "border-slate-800 bg-slate-950/80" : "border-slate-200 bg-slate-50/60"
                    }`}
                  >
                    <h4
                      className={`text-sm font-bold mb-6 flex items-center gap-2 ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>سرفصل‌های تفصیلی و مباحث آموزشی {course.code}</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {course.syllabus.map((s, idx) => (
                        <div
                          key={idx}
                          className={`p-5 rounded-2xl border space-y-3 ${
                            isDark
                              ? "bg-slate-900/60 border-slate-800"
                              : "bg-white border-slate-200/90 shadow-2xs"
                          }`}
                        >
                          <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                                isDark
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {idx + 1}
                            </span>
                            <span>{s.title}</span>
                          </div>

                          <ul className={`space-y-2 text-xs pr-3 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                            {s.topics.map((topic, tIdx) => (
                              <li key={tIdx} className="flex items-start gap-2">
                                <span className="text-emerald-600 dark:text-emerald-500 font-bold shrink-0">•</span>
                                <span className="leading-relaxed">{topic}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    <div
                      className={`mt-6 p-4 rounded-xl border text-xs flex flex-col sm:flex-row items-center justify-between gap-3 ${
                        isDark
                          ? "bg-slate-900/40 border-slate-800 text-slate-400"
                          : "bg-white border-slate-200 text-slate-600"
                      }`}
                    >
                      <span>
                        جهت برگزاری دوره‌ها به صورت اختصاصی برای تیم‌ها و سازمان‌ها، با واحد آموزش رهام هماهنگ فرمایید.
                      </span>
                      {onOpenConsultation && (
                        <button
                          onClick={onOpenConsultation}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors border ${
                            isDark
                              ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
                          }`}
                        >
                          درخواست جلسه هماهنگی سازمانی
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Banner with Reference to Book */}
        <div
          className={`mt-16 p-8 rounded-3xl border text-center sm:text-right flex flex-col sm:flex-row items-center justify-between gap-6 ${
            isDark
              ? "bg-slate-900 border-slate-800 text-slate-200"
              : "bg-white border-slate-200/90 text-slate-800 shadow-sm"
          }`}
        >
          <div className="space-y-2">
            <h3
              className={`text-lg font-bold flex items-center gap-2 justify-center sm:justify-start ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>مطالعه پیش‌نیازها و منابع تحقیقاتی در کتابخانه رهام</span>
            </h3>
            <p className={`text-xs sm:text-sm max-w-xl leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              تمامی شرکت‌کنندگان دوره‌ها به محتوای جامع کتاب «از روز صفر تا روز صفر»، واژه‌نامه‌های تخصصی امنیت و ابزار کدهای تعاملی دسترسی رایگان دارند.
            </p>
          </div>

          {onOpenReader && (
            <button
              onClick={onOpenReader}
              className={`px-5 py-3 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-2 cursor-pointer transition-colors border ${
                isDark
                  ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 shadow-2xs"
              }`}
            >
              <span>مشاهده کتابخانه تخصصی</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
