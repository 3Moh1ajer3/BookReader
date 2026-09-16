import { Chapter } from "@/types/reader";

export const CHAPTER_4_FA: Chapter = {
  id: "ch-4",
  title: "فصل ۴: رده‌بندی فایل‌های باینری (Binary Taxonomy)",
  readingTimeMinutes: 54,
  content: `# بخش دوم: مهندسی معکوس (Reverse Engineering)
## ۴: رده‌بندی فایل‌های باینری (BINARY TAXONOMY)

> *«اگر از یک سو به پایین بنگرید، همه‌چیز به طرزی اطمینان‌بخش آشنا به نظر می‌رسد... اما از سوی دیگر، گویی به قلمرویی سراسر بیگانه و ناشناخته می‌نگرید.»*  
> — مری بیرد (Mary Beard)، *اس‌پی‌کیو‌آر (SPQR)*

همانند بازبینی کد منبع و فازینگ، مهندسی معکوس نیز موضوعی چنان گسترده است که می‌تواند چندین کتاب کامل را به خود اختصاص دهد (و در عمل نیز کتاب‌های بسیاری درباره آن نگاشته شده است). این کتاب به جای غرق شدن در جزئیات دانه‌دانه و طاقت‌فرسای هر مبحث، بر **استراتژی** متمرکز است؛ یعنی بسیج منابع محدود شما به شکلی کارآمد برای دستیابی به یک هدف مشخص و تعیین‌کننده: **کشف آسیب‌پذیری‌های امنیتی**. برای رسیدن به این مقصود، لازم است پیش از آنکه وارد پیچیدگی‌ها شوید، تصویر کلان میدان نبرد و توپوگرافی اهداف را به خوبی بشناسید. این بینش به شما امکان می‌دهد زمان و توان خود را بر روی رویکردهای فنی متمرکز کنید که بالاترین احتمال را برای استخراج آسیب‌پذیری‌های جدید به همراه دارند.

در فرایند مهندسی معکوس، به جای آنکه فایل‌های باینری خود را چشم‌بسته درون نرم‌افزارهای گیدرا (Ghidra) یا آیدا پرو (IDA Pro) بیندازید و کورکورانه با انبوهی از کدهای اسمبلی سرشاخ شوید، ابتدا باید شیوه **تریاژ باینری (Binary Triage)** و گزینش باینری‌های جذاب و ارزشمند را فرا بگیرید. همه باینری‌ها به یک شیوه ساخته نشده‌اند!

در این فصل، با سه رده بنیادین از فایل‌های باینری آشنا خواهید شد:
۱. **اسکریپت‌ها و بسته‌های ترنسپایل‌شده (Scripts):** برنامه‌های کانتینری و وب مانند Electron و باینری‌های مستقل پایتون.
۲. **نمایش‌های میانی و بایت‌کدها (Intermediate Representations - IR):** زبان میانی مایکروسافت دات‌نت (.NET CIL) و بایت‌کد ماشین مجازی جاوا (JVM).
۳. **کد ماشین کامپایل‌شده (Machine Code):** باینری‌های محلی و بومی (C/C++، Go، Rust) در سطوح مختلف پیوند ایستا، پویا، استریپ‌شده و فشرده‌سازی‌شده با پکرها.

سپس نمونه‌هایی واقعی و ملموس از هر رده را مورد مهندسی معکوس قرار خواهید داد و زیرشاخه‌های عمیق‌تر هر یک را که نیازمند ابزارها و رویکردهای ویژه هستند بررسی خواهید کرد.

---

### فراتر از باینری‌های اجرایی و کتابخانه‌های اشتراکی

درک انواع مختلف باینری‌ها به شما کمک می‌کند ابزارها و تکنیک‌های متناسب را برای مهندسی معکوس برگزینید. با خرد کردن آن‌ها به چند شاخه اصلی، می‌توانید در کوتاه‌ترین زمان تارگت خود را تریاژ کرده و بهینه‌ترین شیوه تحلیل را برگزینید.

در بالاترین سطح، وقتی سخن از «باینری» به میان می‌آید، معمولاً دو مفهوم به ذهن خطور می‌کند: **فایل‌های اجرایی مستقل (Executable Binaries)** و **کتابخانه‌های اشتراکی (Shared Libraries)**. همان‌طور که از نامشان پیداست، باینری‌های اجرایی مستقیماً از طریق خط فرمان یا رابط کاربری گرافیکی توسط سیستم‌عامل اجرا می‌شوند. در نقطه مقابل، کتابخانه‌های اشتراکی توابعی را اکسپورت می‌کنند که سایر برنامه‌ها می‌توانند از طریق پیوند ایستا (Static Linking) یا پویا (Dynamic Linking) از آن‌ها بهره ببرند. در پاره‌ای از موارد، اجرای مستقیم کتابخانه‌های اشتراکی نیز میسر است؛ برای نمونه، اجرای فایل‌های DLL در ویندوز با بهره‌گیری از ابزار \`rundll32.exe\`.

این باینری‌ها در قالب‌های استاندارد سیستم‌عامل‌ها عرضه می‌شوند: قالب **Portable Executable (PE)** برای ویندوز، قالب **Executable and Linkable Format (ELF)** برای لینوکس، و قالب **Mach-O** برای سیستم‌عامل‌های macOS و iOS. این قالب‌ها به صورت بومی توسط کرنل سیستم‌عامل مدیریت می‌شوند و در بردارنده دستورالعمل‌های اجرای مستقیم پردازنده، به همراه داده‌های ساختاریافته نظیر جداول ایمپورت و اکسپورت، اطلاعات پیوند پویا و متغیرهای سراسری هستند.

اگرچه این تقسیم‌بندی سنتی ساده و شفاف است، اما در اکوسیستم توسعه نرم‌افزار مدرن، جزئیات تعیین‌کننده فراوانی را نادیده می‌گیرد. برنامه‌های ارتباطی بسیار مشهوری نظیر **WhatsApp**، **Slack** و **Zoom** را در نظر بگیرید. این برنامه‌ها به عنوان فایل‌های اجرایی دسکتاپ توزیع می‌شوند، اما در درون خود در بردارنده ترکیبی از اسکریپت‌های Node.js، ماژول‌های باینری WebAssembly و بایت‌کدهای زبان میانی دات‌نت (CIL) هستند. برخلاف قالب‌های بومی PE یا ELF، این فناوری‌ها در بسترهای اجرایی دیگری مانند موتور جاوااسکریپت Node.js یا ماشین مجازی CLR دات‌نت تفسیر و اجرا می‌گردند. این محیط‌ها مرزهای امنیتی، حفاظ‌های پیش‌فرض و البته اشتباهات پیکربندی منحصربه‌فرد خود را به همراه دارند.

برای نمونه، در سال‌های اولیه پیدایش فریم‌ورک دسکتاپ **Electron**، یک مهاجم می‌توانست به سادگی یک آسیب‌پذیری ساده تزریق اسکریپت در وب (XSS) را به **اجرای کد از راه دور (RCE)** بر روی سیستم‌عامل کاربر ارتقا دهد! الکترون به توسعه‌دهندگان اجازه می‌داد تنظیماتی به نام \`nodeIntegration\` را فعال کنند که به ماژول‌های Node.js اجازه می‌داد مستقیماً در فرایند رندرر وب اجرا شوند؛ تنظیمی که عملاً سندباکس مرورگر را خاموش می‌کرد. ایجاد پلی میان آنچه در سندباکس مرورگر رخ می‌دهد (اجرای جاوااسکریپت) و آنچه روی دسکتاپ اتفاق می‌افتد (فراخوانی توابع سیستمی سیستم‌عامل)، شعاع تخریب (Blast Radius) یک باگ وب را به شدت افزایش داد؛ به طوری که نقصی که قبلاً فقط به سرقت کوکی در یک سایت محدود بود، اکنون به کنترل کامل کامپیوتر قربانی منتهی می‌شد.

از دیدگاه یک پژوهشگر آسیب‌پذیری، این آمیختگی مرزها فرصتی استثنایی خلق می‌کند. در مقایسه با کدهای اسمبلی خالص و پیچیده، دیکامپایل کردن نمایش‌های میانی نظیر بایت‌کد جاوا و دات‌نت بی‌نهایت آسان‌تر است. در حقیقت، در صورت وجود متادیتای مناسب، می‌توانید کدی تقریباً هم‌ارز با **سورس‌کد اصلی برنامه** را بازیابی کنید! این قضیه برای زبان‌های اسکریپتی نظیر Node.js و Python حتی چشمگیرتر است؛ جایی که برنامه‌ها صرفاً بسته‌های کپسوله‌شده از اسکریپت‌ها هستند. مهندسی معکوس این برنامه‌ها به جای دست‌وپنجه نرم کردن با کدهای ماشین، شامل آنپک کردن (Unpacking) و زیباسازی کدهای فشرده (Deobfuscation) است؛ فرایندی که پس از آن مستقیماً به یک بازبینی کد منبع استاندارد تبدیل می‌شود.

---

### برنامه‌های اسکریپتی (Scripts)

فایل‌های اسکریپتی به زبانی نوشته می‌شوند که مستقیماً توسط یک مفسر بدون نیاز به کامپایل به زبان ماشین اجرا می‌گردند. زبان‌های محبوبی چون JavaScript، Python و Ruby در این رده جای دارند. برای نمونه، در محیط Node.js، اسکریپت‌های جاوااسکریپت توسط موتور V8 خارج از محیط مرورگر اجرا می‌شوند.

البته این بدان معنا نیست که مفسرها کد را اصلاً کامپایل نمی‌کنند. بسیاری از مفسرهای مدرن از کامپایل درجا (Just-In-Time یا JIT) بهره می‌برند که در لحظه اجرا، اسکریپت را به بایت‌کد یا کدهای ماشین بهینه‌سازی‌شده ترجمه می‌کند تا با سرعت بالاتری اجرا شود.

برخی فایل‌های اجرایی اسکریپتی، تنها بایت‌کدهای کامپایل‌شده را درون خود دارند؛ در برخی دیگر، اسکریپت‌ها مینیفای (Minified) یا مبهم‌سازی (Obfuscated) شده‌اند تا تحلیل آن‌ها دشوار شود. در بهترین سناریو، فایل اجرایی صرفاً یک پوسته (Wrapper) به دور سورس‌کد اصلی است که آن را به همراه یک مفسر درونی بسته‌بندی کرده است. در این بخش، این حالات را از طریق دو پروژه واقعی متن‌باز بررسی خواهیم کرد: نرم‌افزار **DbGate** (برنامه الکترون مبتنی بر Node.js) و بازی **Galaxy Attack** (برنامه پایتون بسته‌بندی‌شده با PyInstaller).

---

### مهندسی معکوس برنامه‌های الکترون (Reverse Engineering Node.js Electron Applications)

یکی از پررنگ‌ترین روندهای توسعه نرم‌افزار مدرن، رشد نرم‌افزارهای ترکیبی (Hybrid) است که مرزهای میان وب و اپلیکیشن‌های بومی دسکتاپ را ادغام کرده‌اند. پیش از ظهور این فناوری‌ها، برنامه‌های دسکتاپ معمولاً با زبان‌های کامپایل‌شونده نظیر C++ نوشته می‌شدند تا به سرعت و بهینگی پردازنده دست یابند.

با این حال، معرفی موتور V8 در سال ۲۰۰۸ امکان اجرای بسیار سریع‌تر جاوااسکریپت را فراهم ساخت. سپس در سال ۲۰۰۹ فریم‌ورک Node.js متولد شد که بستر اجرای جاوااسکریپت در سمت سرور را مهیا کرد. به دنبال آن فریم‌ورک **Electron** (با نام اولیه Atom Shell) پدیدار شد تا توسعه برنامه‌های دسکتاپ را با فناوری‌های وب (HTML، CSS، JavaScript) روی شانه یک موتور کرومیوم درونی و زمان اجرای Node.js سوار کند. این فناوری توسعه چندسکویی نرم‌افزارها را به شدت شتاب بخشید.

یک برنامه الکترون از دو بخش تشکیل شده است:
۱. باینری از پیش کامپایل‌شده الکترون (Electron Prebuilt Binary) که شامل موتور کرومیوم و Node.js است.
۲. کدهای سورس برنامه که معمولاً درون فایلی با پسوند **ASAR** (کوتاه‌شده Atom Shell Archive) بسته‌بندی شده‌اند.

برای آزمایش عملی، بسته نصبی دبیان نرم‌افزار مدیریت پایگاه‌داده **DbGate** (نگارش ۵.۲.۷) را با دستور \`dpkg-deb\` اکسترکت می‌کنیم:

\`\`\`bash
$ dpkg-deb -x dbgate-5.2.7-linux_amd64.deb dbgate
$ tree --charset ascii dbgate
dbgate
|-- opt
|\`-- DbGate
| |-- chrome_100_percent.pak
| |-- chrome_200_percent.pak
| |-- chrome_crashpad_handler
| |-- chrome-sandbox
❶ | |-- dbgate
❷ | |-- libEGL.so
| |-- libffmpeg.so
| |-- libGLESv2.so
| |-- libvk_swiftshader.so
| |-- libvulkan.so.1
--snip--
| |-- resources
❸ | ||-- app.asar
| |\`-- app.asar.unpacked
| | |-- node_modules
| | ||-- better-sqlite3
| | ||\`-- build
| | || \`-- Release
| | || \`-- better_sqlite3.node
| | |\`-- oracledb
| | | \`-- build
| | | \`-- Release
| | | |-- oracledb-5.5.0-darwin-x64.node
| | | |-- oracledb-5.5.0-linux-x64.node
| | | \`-- oracledb-5.5.0-win32-x64.node
| | \`-- packages
| | \`-- api
| | \`-- dist
| | |-- 45c2d7999105b08d7b98dd8b3c95fda3.node
| | \`-- 9bf76138dc2dae138cb17ee46c4a2dd1.node
| |-- resources.pak
| |-- snapshot_blob.bin
| |-- swiftshader
| ||-- libEGL.so
| |\`-- libGLESv2.so
| |-- v8_context_snapshot.bin
| \`-- vk_swiftshader_icd.json
\`\`\`

از ساختار فایل‌ها پیداست که باینری \`dbgate\` ❶ در حقیقت همان باینری عمومی الکترون است که بسته آرشیو ASAR را بارگذاری می‌کند. کتابخانه‌های اشتراکی گرافیکی (\`.so\`) ❷ وابستگی‌های مورد نیاز کرومیوم هستند. فایل کلیدی \`app.asar\` ❸ در پوشه \`resources\` قرار دارد؛ دایرکتوری استانداردی که الکترون به طور خودکار برنامه را از آن لود می‌کند.

برای آنپک کردن فایل ASAR، از ابزار رسمی \`asar\` استفاده می‌کنیم:

\`\`\`bash
$ npm install -g asar
$ npx asar extract dbgate/opt/DbGate/resources/app.asar dbgate-src
$ tree --charset ascii dbgate-src
dbgate-src
--snip--
|-- icon.png
|-- node_modules
||-- @yarnpkg
||-- argparse
--snip--
|-- package.json ❶
|-- packages
||-- api
||\`-- dist
|| |-- 45c2d7999105b08d7b98dd8b3c95fda3.node
|| |-- 9bf76138dc2dae138cb17ee46c4a2dd1.node
|| \`-- bundle.js
||-- plugins
|||-- dbgate-plugin-csv
||||-- dist
|||||-- backend.js
||||\`-- frontend.js
||||-- icon.svg
||||-- LICENSE
||||-- package.json
|||\`-- README.md
--snip--
\`-- src
|-- electron.js
|-- mainMenuDefinition.js
|-- nativeModulesContent.js
\`-- nativeModules.js
\`\`\`

در کدهای استخراج‌شده، نخستین نقطه مرجع باید مانیفست پروژه یعنی **\`package.json\`** ❶ باشد (در جاوا \`MANIFEST.MF\` و در زبان گو \`go.mod\`). مانیفست اطلاعات ارزشمندی درباره متادیتا، مخزن سورس و نقطه ورودی اصلی برنامه در اختیار ما می‌گذارد:

\`\`\`json
{
  "name": "dbgate",
  "version": "5.2.7",
  "private": true,
  "author": "Jan Prochazka <jenasoft.database@gmail.com>",
  "description": "Opensource database administration tool",
  "dependencies": {
    "electron-log": "^4.4.1",
    "electron-updater": "^4.6.1",
    "lodash.clonedeepwith": "^4.5.0",
    "patch-package": "^6.4.7"
  },
❶ "repository": {
    "type": "git",
    "url": "https://github.com/dbgate/dbgate.git"
  },
  "homepage": "./",
❷ "main": "src/electron.js",
  "optionalDependencies": {
    "better-sqlite3": "7.6.2",
    "oracledb": "^5.5.0"
  }
}
\`\`\`

*فهرست ۴-۱: فایل مانیفست DbGate*

مانیفست آدرس گیت مخزن اصلی پروژه را فاش می‌کند ❶ که در تحلیل باینری‌های بسته بسیار ارزشمند است. همچنین نقطه ورودی اجرایی را فایل \`src/electron.js\` معرفی می‌کند ❷. با باز کردن این فایل، به قطعه‌کد زیر می‌رسیم:

\`\`\`javascript
if (!apiLoaded) {
  const apiPackage = path.join(
    __dirname,
    process.env.DEVMODE ? '../../packages/api/src/index' : '../packages/api/dist/bundle.js' ❶
  );
  global.API_PACKAGE = apiPackage;
  global.NATIVE_MODULES = path.join(__dirname, 'nativeModules');
  const api = require(apiPackage);
\`\`\`

در حالت پروداکشن، برنامه پکیج خود را از مسیر \`../packages/api/dist/bundle.js\` بارگذاری می‌کند ❶. اما باز کردن این فایل نشان می‌دهد که کدها با Webpack یا Rollup فشرده و مینیفای شده‌اند؛ متغیرها یک‌حرفی شده و تورفتگی‌ها حذف شده‌اند. برای ادامه کار، باید راهی برای واگردانی این فشرده‌سازی بیابیم.

---

### استخراج سورس کد با استفاده از Source Maps

معمولاً بازگرداندن سورس اصلی از کدهای مینیفای‌شده وب‌پک غیرممکن است. اما در بسیاری از پروژه‌ها، توسعه‌دهندگان به اشتباه ابزارهای ساخت (Babel، TypeScript، Webpack یا Rollup) را طوری پیکربندی می‌کنند که فایل‌های نقشه‌برداری کد یا **Source Maps** را نیز تولید و همراه بسته منتشر نمایند! سورس‌مپ‌ها فایل‌هایی با پسوند \`.map\` هستند که کد مینیفای‌شده را به سطرها و ستون‌های دقیق سورس‌کد اولیه (از جمله فایل‌های TypeScript و ساختار پوشه‌بندی اصلی) پیوند می‌زنند تا عملیات دیباگ تسهیل شود.

در فایل \`packages/web/rollup.config.js\` نرم‌افزار DbGate، پیکربندی نشان می‌دهد که فلگ سورس‌مپ فعال شده است:

\`\`\`javascript
export default [
  {
    input: 'src/query/QueryParserWorker.js',
    output: {
❶     sourcemap: true,
      format: 'iife',
❷     file: 'public/build/query-parser-worker.js',
    },
    plugins: [
      commonjs(),
      resolve({ browser: true }),
      production && terser(),
    ],
  },
  {
    input: 'src/main.ts',
    output: {
      sourcemap: true,
      format: 'iife',
      name: 'app',
      file: 'public/build/bundle.js',
    },
\`\`\`

*فهرست ۴-۲: پیکربندی Rollup که ساخت سورس‌مپ را فعال کرده است*

مقدار \`sourcemap: true\` ❶ به رول‌آپ دستور می‌دهد فایل نقشه را تولید کند. در پوشه \`packages/web/public/build\` دو فایل \`bundle.js\` و \`bundle.js.map\` در کنار هم قرار دارند. در حالی که فایل نخست یک توده غیرخواناست، فایل \`.map\` یک سند بزرگ JSON است که تمام متون سورس کد اصلی را در فیلد \`sourcesContent\` خود ذخیره کرده است!

برای بازسازی پوشه سورس اصلی از روی این نقشه، اسکریپتی به نام \`unpack.js\` با بهره‌گیری از کتابخانه رسمی \`source-map\` موزیلا می‌نویسیم:

\`\`\`javascript
// unpack.js
const fs = require('fs');
const path = require('path');
const sourceMap = require('source-map');

const rawSourceMap = JSON.parse(fs.readFileSync('bundle.js.map', 'utf8'));
fs.mkdirSync('output', { recursive: true });

sourceMap.SourceMapConsumer.with(rawSourceMap, null, consumer => {
❶ consumer.eachMapping(mapping => {
    const sourceFilePath = mapping.source;
    const sourceContent = consumer.sourceContentFor(mapping.source);
    if (!sourceContent) return;

    // پاک‌سازی کاراکترهای Directory Traversal جهت امنیت
❷   const normalizedSourceFilePath = path
      .normalize(sourceFilePath)
      .replace(/^(\\.\\.(\\/|\\\\|$))+/, '');

    const outputFilePath = path.join('output', normalizedSourceFilePath);
    const outputDir = path.dirname(outputFilePath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
❸   fs.writeFileSync(outputFilePath, sourceContent, 'utf8');
  });
});
\`\`\`

*فهرست ۴-۳: اسکریپت استخراج سورس‌کد اصلی از روی سورس‌مپ*

اسکریپت فوق تک‌تک نگاشت‌ها را پیمایش کرده ❶، با پاک‌سازی کاراکترهای پیمایش دایرکتوری مسیرها را امن می‌سازد ❷ و محتوای اصلی کد را در مسیر بازسازی‌شده ذخیره می‌کند ❸.

با اجرای این اسکریپت، پوشه \`output\` پر از کدهای سورس خوانا می‌شود. جالب است بدانید در این فرایند، کدهای تایپ‌اسکریپت ترنسپایل‌شده به جاوااسکریپت تبدیل شده‌اند. مقایسه تابع \`getFilterType\` در سورس اصلی تایپ‌اسکریپت با کد ترنسپایل‌شده تفاوت‌های ساختاری را نشان می‌دهد:

\`\`\`typescript
// کد اصلی TypeScript (فهرست ۴-۴)
import { isTypeNumber, isTypeString, isTypeLogical, isTypeDateTime } from 'dbgate-tools';
import { FilterType } from './types';

export function getFilterType(dataType: string): FilterType {
  if (!dataType) return 'string';
  if (isTypeNumber(dataType)) return 'number';
  if (isTypeString(dataType)) return 'string';
  if (isTypeLogical(dataType)) return 'logical';
  if (isTypeDateTime(dataType)) return 'datetime';
  return 'string';
}
\`\`\`

\`\`\`javascript
// کد ترنسپایل‌شده JavaScript در سورس‌مپ (فهرست ۴-۵)
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilterType = void 0;
const dbgate_tools_1 = require("dbgate-tools");

function getFilterType(dataType) {
  if (!dataType) return 'string';
  if ((0, dbgate_tools_1.isTypeNumber)(dataType)) return 'number';
  if ((0, dbgate_tools_1.isTypeString)(dataType)) return 'string';
  if ((0, dbgate_tools_1.isTypeLogical)(dataType)) return 'logical';
  if ((0, dbgate_tools_1.isTypeDateTime)(dataType)) return 'datetime';
  return 'string';
}
exports.getFilterType = getFilterType;
\`\`\`

در نسخه ترنسپایل‌شده، اعلانات نوع داده (مانند \`dataType: string\`) حذف شده و دستورات مدرن \`import\` با استاندارد سازگار با عقب \`require\` جایگزین شده‌اند. همچنین در توابع ناهمگام (\`async/await\`)، کامپایلر از تابع پلی‌فیل \`__awaiter\` در پکیج \`tslib\` استفاده می‌کند:

\`\`\`javascript
// کد بازسازی‌شده حاوی پلی‌فیل __awaiter (فهرست ۴-۷)
import { __awaiter } from "tslib";

export function handleAuthOnStartup(config) {
❶ return __awaiter(this, void 0, void 0, function* () {
    if (config.oauth) {
      console.log('OAUTH callback URL:', location.origin + location.pathname);
    }
    if (config.oauth || config.isLoginForm) {
      if (localStorage.getItem('accessToken')) return;
      redirectToLogin(config);
    }
  });
}
\`\`\`

---

### استفاده از زیباسازها روی کدهای مینیفای‌شده (Beautifiers)

اگر پروژه‌ای سورس‌مپ به همراه نداشت چه باید کرد؟ برای مثال، فایل باینری بک‌اند DbGate در مسیر \`packages/api/dist/bundle.js\` بدون سورس‌مپ توزیع شده است؛ زیرا توسعه‌دهنده در تنظیمات Webpack گزینه \`minimize: false\` را کامنت کرده بود.

در این سناریو، از **زیباسازهای کد (Beautifiers)** نظیر پکیج \`js-beautify\` استفاده می‌کنیم تا تورفتگی‌ها، ساختار توابع و شکست خطوط را بازیابی نماییم:

\`\`\`bash
$ npm install -g js-beautify
$ npx js-beautify packages/api/dist/bundle.js > bundle.beautified.js
\`\`\`

با فرمت شدن کدها، الگوهای خطرناک و توابع مشکوک نمایان می‌شوند. یکی از توابع مهم کشف‌شده، تابع \`compileMacroFunction\` است:

\`\`\`javascript
function compileMacroFunction(macro, errors = []) {
  if (!macro) return null;
  let func;
  try {
❶   return func = eval(getMacroFunction[macro.type](macro.code)), func;
  } catch (e) {
    return errors.push(\`Error compiling macro \${macro.name}: \${e.message}\`), null;
  }
}
\`\`\`

به فراخوانی خطرناک **\`eval\`** ❶ توجه کنید! تابع \`eval\` ورودی رشته‌ای خود را مستقیماً به عنوان کد جاوااسکریپت اجرا می‌کند. این الگو یک کاندیدای بالقوه برای تزریق کد (Code Injection) است.

---

### تحلیل یک چاهک خطرناک (Analyzing a Dangerous Sink)

برای ارزیابی اکسپلویت‌پذیری این چاهک خطرناک، مسیر بازگشتی از چاهک به منبع ورودی (Sink-to-Source) را بررسی می‌کنیم. تابع \`getMacroFunction\` که رشته ارسالی به \`eval\` را تولید می‌کند، در سورس‌مپ استخراج‌شده به این شکل پیاده شده است:

\`\`\`javascript
const getMacroFunction = {
❶ transformValue: code => \`
    (value, args, modules, rowIndex, row, columnName) => {
      \${code}
    }
  \`,
❷ transformRow: code => \`
    (row, args, modules, rowIndex, columns) => {
❸     \${code}
    }
  \`,
};
\`\`\`

این تابع یک شیء ساده با دو کلید \`transformValue\` ❶ و \`transformRow\` ❷ است که متغیر ورودی \`code\` را درون یک رشته قالب‌بندی‌شده درج می‌کند ❸ و حاصل به \`eval\` فرستاده می‌شود. بنابراین اگر مهاجم بتواند پارامتر \`macro.code\` را کنترل کند، اجرای کد رخ خواهد داد.

با ردیابی مراجعات به \`compileMacroFunction\`، درمی‌یابیم که این تابع در تابع دیگری به نام \`runMacroOnChangeSet\` صدا زده می‌شود:

\`\`\`javascript
function runMacroOnChangeSet(
❶ macro,
  selectedCells,
  changeSet,
  display,
  useRowIndexInsteadOfCondition
) {
  const errors = [];
❷ const compiledMacroFunc = compileMacroFunction(macro, errors);
  // ...
\`\`\`

این تابع نیز در فایل فرانت‌اند \`TableDataGrid.svelte\` در کامپوننت فریم‌ورک Svelte فراخوانی می‌شود:

\`\`\`javascript
function handleRunMacro(macro, params, cells) {
  const newChangeSet = runMacroOnChangeSet(
    macro, params, cells, changeSetState?.value, display, false
  );
  if (newChangeSet) {
    dispatchChangeSet({ type: 'set', value: newChangeSet });
  }
}
// ...
<DataGrid
  showMacros
  onRunMacro={handleRunMacro}
/>
\`\`\`

این ردیابی نشان می‌دهد که اگرچه مسیر کاملی از منبع به چاهک وجود دارد، اما اجرای این ماکرو مستلزم آن است که کاربر شخصاً کد ماکرو را در رابط کاربری وارد کرده و دکمه اجرای آن را کلیک کند (Self-Inflicted Code Execution). با این حال، درک این مسیر به ما یاد می‌دهد که چگونه ترکیب آنپک کردن ASAR، بازیابی سورس‌مپ‌ها و تحلیل چاهک‌ها می‌تواند ساختار امنیتی برنامه‌های دسکتاپ مدرن را عیان سازد.

---

### مهندسی معکوس برنامه‌های بسته‌بندی‌شده پایتون (PyInstaller)

علاوه بر برنامه‌های الکترون، بسیاری از برنامه‌های نوشته‌شده به زبان‌های پایتون یا روبی نیز با ابزارهایی مانند **PyInstaller**، **cx_Freeze** یا **py2exe** به فایل‌های اجرایی مستقل باینری تبدیل می‌شوند. مزیت بزرگ زبان‌های اسکریپتی، قابلیت جابجایی (Portability) آن‌هاست.

ابزار PyInstaller اسکریپت‌های پایتون، کتابخانه‌ها، مفسر درونی و فایل‌های منبع را در یک فایل فشرده منفرد بسته‌بندی می‌کند. به هنگام اجرا، یک بارگذار (Bootloader) کدهای کامپایل‌شده \`.pyc\` و کتابخانه‌های نیتیو را در حافظه باز کرده و اسکریپت اصلی را اجرا می‌نماید.

یک بسته باینری PyInstaller معمولاً شامل ساختارهای زیر است:
- کتابخانه پویای پایتون (شامل مفسر پایتون، مثلاً \`python310.dll\`)
- اسکریپت اجرایی اصلی برنامه
- آرشیو فشرده اپلیکیشن (معمولاً با نام \`PYZ-00.pyz\` با فرمت ZlibArchive)
- کتابخانه‌ها و فایل‌های چندرسانه‌ای پشتیبان

شناسایی یک باینری PyInstaller بسیار ساده است؛ کافی است رشته‌های متنی (Strings) درون باینری را بررسی کنید:

\`\`\`bash
$ strings main.exe | grep pyinstaller
xpyinstaller-4.7.dist-info\\COPYING.txt
xpyinstaller-4.7.dist-info\\METADATA
xpyinstaller-4.7.dist-info\\RECORD
$ strings main.exe | grep python
python310.dll
\`\`\`

برای بررسی عملی، بازی تحت ویندوز **Galaxy-Attack** را که با PyInstaller بسته‌بندی شده است مورد بررسی قرار می‌دهیم. با استفاده از ابزار درونی \`pyi-archive_viewer\` ساختار CArchive فایل را بازرسی می‌کنیم:

\`\`\`bash
$ pip install pyinstaller
$ pyi-archive_viewer main.exe
pos, length, uncompressed, iscompressed, type, name
[(0, 217, 287, 1, 'm', 'struct'),
 (217, 1018, 1754, 1, 'm', 'pyimod01_os_path'),
 (1235, 4098, 8869, 1, 'm', 'pyimod02_archive'),
 --snip--
❶ (5175013, 1985630, 4471024, 1, 'b', 'python310.dll'),
 (7160643, 13440, 25320, 1, 'b', 'select.pyd'),
 (7174083, 405123, 1117936, 1, 'b', 'unicodedata.pyd'),
 --snip--
❷ (38463189, 2076778, 2076778, 0, 'z', 'PYZ-00.pyz')]
\`\`\`

وجود \`python310.dll\` ❶ مشخص می‌کند برنامه با پایتون ۳.۱۰ ساخته شده است. همچنین فایل‌های اصلی برنامه درون آرشیو \`PYZ-00.pyz\` ❷ قرار دارند. با دستور \`O\` وارد این آرشیو می‌شویم:

\`\`\`text
? O PYZ-00.pyz
Contents of 'PYZ-00.pyz' (PYZ):
is_package, position, length, name
0, 17, 1893, '__future__'
0, 80408, 25050, 'argparse'
0, 105458, 22331, 'ast'
--snip--
? X models.button
to filename? models.button.pyc
? q
\`\`\`

ماژول \`models.button\` را به عنوان یک فایل کامپایل‌شده \`.pyc\` استخراج می‌کنیم. فایل‌های \`.pyc\` شامل بایت‌کدهای بهینه‌سازی‌شده برای ماشین مجازی پایتون هستند.

#### بازسازی بایت‌های جادویی (Magic Bytes) در فایل‌های pyc

نکته‌ای بسیار حیاتی در استخراج از PyInstaller این است: هنگامی که بایت‌کد را از درون \`PYZ-00.pyz\` استخراج می‌کنید، **بایت‌های جادویی (Magic Bytes)** در ابتدای فایل وجود ندارند! این بایت‌ها نسخه مفسر پایتون را مشخص می‌کنند و دیس‌اسمبلرها برای تفسیر صحیح دستورالعمل‌ها به آن نیاز دارند.

ابزار PyInstaller این بایت‌ها را در ابتدای هدر فایل \`PYZ-00.pyz\` ذخیره می‌کند. ۴ بایت اول رشته اسکی \`PYZ\\0\` است و بلافاصله پس از آن ۴ بایت جادویی نسخه (برای پایتون ۳.۱۰ معادل \`6F 0D 0D 0A\`) قرار دارد. برای آماده‌سازی فایل \`.pyc\` جهت دیکامپایل، باید این ۴ بایت جادویی را به همراه ۱۲ بایت تهی (Null Bytes) به عنوان پدینگ متادیتای زمانی به ابتدای فایل بیفزاییم:

\`\`\`bash
$ echo -n -e '\\x6F\\x0D\\x0D\\x0A' > fixed.models.button.pyc
$ printf '\\x00%.0s' {1..12} >> fixed.models.button.pyc
$ cat models.button.pyc >> fixed.models.button.pyc
\`\`\`

اکنون فایل آماده دیکامپایل است. از ابزار قدرتمند متن‌باز **Decompyle++** (\`pycdc\`) که از نگارش‌های جدید بایت‌کد پایتون پشتیبانی می‌کند استفاده می‌کنیم:

\`\`\`bash
$ git clone https://github.com/zrax/pycdc
$ cd pycdc && cmake . && make && cd ..
$ pycdc/pycdc fixed.models.button.pyc
\`\`\`

خروجی تولیدشده به شکل شگفت‌انگیزی خوانا و دقیق است:

\`\`\`python
# Source Generated with Decompyle++
# File: fixed.models.button.pyc (Python 3.10)
import pygame
from utils.assets import Assets
from config import config
from constants import Font, Colors

class Button:
    def __init__(self, color, outline_color, text = ('',)):
        self.color = color
        self.outline_color = outline_color
        self.text = text
        self.outline = False
        self.rect = pygame.Rect(0, 0, 0, 0)

    def draw(self, pos, size):
        self.default_outline = pygame.Rect(pos[0] - 5, pos[1] - 5, size[0] + 10, size[1] + 10)
        self.on_over_outline = pygame.Rect(pos[0] - 6, pos[1] - 6, size[0] + 12, size[1] + 12)
        self.rect = self.default_outline
        default_inner_rect = (pos[0], pos[1], size[0], size[1])
        onover_inner_rect = (pos[0] + 1, pos[1] + 1, size[0] - 2, size[1] - 2)
        inner_rect = onover_inner_rect if self.outline == True else default_inner_rect
        pygame.draw.rect(config.CANVAS, self.outline_color, self.on_over_outline if self.outline == True else self.default_outline, 0, 7)
        pygame.draw.rect(config.CANVAS, self.color, inner_rect, 0, 6)
        if self.text != '':
            font = pygame.font.Font(Font.neue_font, 40)
            Assets.text.draw(self.text, font, Colors.WHITE, (pos[0] + size[0] / 2, pos[1] + size[1] / 2), True, True)
        return None ❶

    def isOver(self):
        return self.rect.collidepoint(pygame.mouse.get_pos())
\`\`\`

*فهرست ۴-۸: سورس کد دیکامپایل‌شده دکمه رابط کاربری با Decompyle++*

به جز تفاوت‌های بسیار جزئی مانند یک مقدار بازگشتی صریح \`return None\` ❶، کد دیکامپایل‌شده با سورس‌کد اصلی برنامه مو نمی‌زند! بدین ترتیب ثابت می‌شود که نرم‌افزارهای بسته‌بندی‌شده اسکریپتی، تنها با چند مرحله آنپک کردن، تمام کدهای خود را تسلیم مهندسی معکوس می‌کنند.

---

### نمایش‌های میانی: بایت‌کدهای دات‌نت و جاوا (Intermediate Representations)

از حیث سطح انتزاع، **نمایش‌های میانی (Intermediate Representations یا IR)** در حد واسط میان کد ماشین سخت‌افزار و سورس‌کد سطح بالا قرار دارند. این نمایش‌ها به جای اجرا بر روی چیپ فیزیکی، توسط یک ماشین مجازی زمان اجرا (Runtime Virtual Machine) مدیریت می‌شوند.

مزایای فراوانی در استفاده از نمایش‌های میانی وجود دارد: مدیریت حافظه خودکار، جمع‌آوری زباله (Garbage Collection)، بررسی ایمنی انواع داده و مدیریت استثناها به زمان اجرا محول می‌شود. همچنین کدهای کامپایل‌شده روی هر پلتفرمی که ماشین مجازی مربوطه در آن نصب باشد بدون نیاز به کامپایل مجدد اجرا می‌شوند.

ویژگی بسیار متمایز فایل‌های باینری مبتنی بر نمایش میانی، همراه داشتن **متادیتای بسیار غنی** است: نام کلاس‌ها، نام کامل متغیرها، متدها، امضای آرگومان‌ها و جداول ارجاعات به صورت دست‌نخورده در بدنه باینری ذخیره می‌شوند. این امر به دیکامپایلرها اجازه می‌دهد سورس‌کدی تقریباً ۱۰۰٪ دقیق و باوفا به اصل بازتولید نمایند.

---

### اسمبلی‌های دات‌نت (.NET CLR Assemblies)

بستر نرم‌افزاری متن‌باز مایکروسافت دات‌نت به توسعه‌دهندگان امکان می‌دهد با زبان‌های C#، F# و Visual Basic کد بنویسند. شالوده اصلی دات‌نت، محیط **Common Language Runtime (CLR)** است که دستورالعمل‌های زبان میانی عمومی یا **Common Intermediate Language (CIL)** را اجرا می‌کند. در زمان اجرا، CLR با استفاده از کامپایل درجا (JIT) این دستورالعمل‌ها را به کدهای ماشین بومی پردازنده تبدیل می‌نماید.

باینری‌های دات‌نت به عنوان **اسمبلی (Assembly)** در قالب فایل‌های \`.exe\` یا \`.dll\` منتشر می‌شوند. این فرمت در حقیقت گسترش‌یافته قالب استاندارد Portable Executable (PE) ویندوز است. پس از هدرهای استاندارد PE، هدرهای اختصاصی CLR قرار دارند:
- **Assembly Manifest:** فراداده‌های کلی برنامه، شماره نگارش و ارجاعات به سایر اسمبلی‌ها.
- **Type Metadata:** جداول متادیتای تعریف‌کننده انواع داده، متدها و فیلدها.
- **CIL Code:** بایت‌کدهای اصلی زبان میانی CIL.
- **Resources:** منابع جانبی نظیر تصاویر، فایل‌های پیکربندی و فرم‌ها.
- **Strong Name Signature:** امضای دیجیتال اختیاری برای تأیید اصالت اسمبلی.

#### بازرسی متادیتای دات‌نت با PE-Bear

نرم‌افزار مدیریت دیتابیس **LiteDB Studio** (\`LiteDB.Studio.exe\`) را به عنوان نمونه در نظر بگیرید. با باز کردن این فایل در ابزار تخصصی **PE-Bear**، علاوه بر تب‌های استاندارد PE، تب اختصاصی به نام **.NET Hdr** مشاهده می‌شود. این تب مشخصات متادیتای زمان اجرا، نسخه CLR (\`v4.0.30319\`) و آدرس آفست‌های جریان‌های متادیتا نظیر \`#Strings\`، \`#US\` (User Strings)، \`#Blob\` و \`#GUID\` را نشان می‌دهد:

\`\`\`text
0000000042 53 4a 42 01 00 01 00 00 00 00 00 0c 00 00 00|BSJB............|
0000001076 34 2e 30 2e 33 30 33 31 39 00 00 00 00 05 00|v4.0.30319......|
000000206c 00 00 00 5c ba 02 00 23 53 74 72 69 6e 67 73|l...\\º..#Strings|
0000003000 00 00 00 c8 ba 02 00 24 2b 02 00 23 55 53 00|....Èº..$+..#US.|
00000040ec e5 04 00 d6 3a 02 00 23 42 6c 6f 62 00 00 00|ìå..Ö:..#Blob...|
00000050c4 20 07 00 10 00 00 00 23 47 55 49 44 00 00 00|Ä ......#GUID...|
00000060d4 20 07 00 c8 4a 08 00 23 7e 00 00 00 49 6d 6d|Ô ..ÈJ..#~...Imm|
0000007047 65 74 44 65 66 61 75 6c 74 49 4d 45 57 6e 64|GetDefaultIMEWnd|
\`\`\`

امضای جادویی \`BSJB\` در ابتدای استریم، شناسه استاندارد هدر متادیتای زمان اجرای دات‌نت است.

#### دیس‌اسمبل کردن CIL با ILDasm

دستورالعمل‌های CIL شیءگرا و مبتنی بر پشته (Stack-Based) هستند. برای مشاهده بایت‌کد خام CIL، یک برنامه ساده C# را در نظر بگیرید:

\`\`\`csharp
using System;
public class Hello {
    public static void Main(String[] args) {
        Console.WriteLine("Hello World!");
    }
}
\`\`\`

با ابزار رسمی \`ildasm.exe\` موجود در بسته ویژوال استودیو، فایل کامپایل‌شده را دیس‌اسمبل می‌کنیم:

\`\`\`text
// Metadata version: v4.0.30319
.assembly extern mscorlib ❶
{
  .publickeytoken = (B7 7A 5C 56 19 34 E0 89 )
  .ver 4:0:0:0
}
.assembly ConsoleApp1 ❷
{
  // ...
}
.module ConsoleApp1.exe ❸
// ...
.class public auto ansi beforefieldinit Hello ❹
       extends [System.Runtime]System.Object
{
  .method public hidebysig static void Main(string[] args) cil managed ❺
  {
    .entrypoint
    .maxstack 8
    IL_0000: ldstr "Hello World!"
    IL_0005: call void [System.Console]System.Console::WriteLine(string)
    IL_000a: ret
  } // end of method Hello::Main
}
\`\`\`

خروجی نشان می‌دهد که ابتدا وابستگی‌های خارجی (\`mscorlib\`) ❶ و امضای کلید عمومی آن‌ها تعریف شده، سپس اسمبلی ❷ و ماژول ❸ معرفی گردیده و کلاس \`Hello\` ❹ با متد نقطه ورود \`Main\` ❺ اعلان شده است. دستورالعمل \`ldstr\` رشته را روی پشته می‌گذارد، دستور \`call\` متد کنسول را فراخوانی می‌کند و \`ret\` کنترل را بازمی‌گرداند.

#### دیکامپایل شگفت‌انگیز با ILSpy و dnSpy

اگرچه خواندن CIL برای یک برنامه ساده آسان است، اما برای برنامه‌های بزرگ دستیابی به کد اصلی C# ضروری است. دیکامپایلر محبوب و متن‌باز **ILSpy** این کار را در نهایت زیبایی انجام می‌دهد.

با باز کردن \`LiteDB.Studio.exe\` درون ILSpy، برنامه بلافاصله هدرها، معماری هدف و مهم‌تر از همه نقطه ورودی \`LiteDB.Studio.Program.Main\` را استخراج می‌کند. با کلیک بر روی هر متد، سورس‌کد تمیز و ساختاریافته C# پدیدار می‌شود.

یکی از درخشان‌ترین امکانات ILSpy قابلیت **Analyze** است. اگر روی متد \`LiteDB.Studio.MainForm.ExecuteSql\` که یک چاهک بالقوه برای آسیب‌پذیری تزریق SQL است راست‌کلیک کرده و گزینه Analyze را برگزینید، درختی از روابط متقابل گشوده می‌شود که نشان می‌دهد دقیقاً چه متدهای دیگری در سراسر برنامه این متد را فراخوانی کرده‌اند (درخت Used By). بدین ترتیب مسیرهای Sink-to-Source در کسری از ثانیه ترسیم می‌شوند. همچنین با گزینه **Save Code** می‌توان کل پروژه را به صورت یک پروژه تمیز C# ذخیره کرد.

ابزارهای مکمل دیگری مانند **dnSpyEx** حتی به شما اجازه می‌دهند که اسمبلی را به صورت زنده دیباگ کنید، بریک‌پوینت بگذارید و حتی کدهای درون آن را در لحظه تغییر داده و مجدداً کامپایل و ذخیره کنید!

---

### بایت‌کد جاوا (Java Bytecode)

همانند دات‌نت، پلتفرم جاوا نیز کدهای سورس را به یک بایت‌کد میانی ترجمه می‌کند که توسط ماشین مجازی جاوا (JVM) اجرا می‌شود. تفاوت در این است که بایت‌کد جاوا علاوه بر پشته محاسباتی، از آرایه‌ای از متغیرهای محلی به عنوان ثبات‌های مجازی (Registers) استفاده می‌کند.

باینری‌های جاوا در قالب فایل‌های کلاسی \`.class\` تولید شده و درون آرشیوهای فشرده با پسوند **JAR** بسته‌بندی می‌گردند. برای مشاهده بایت‌کد، برنامه ساده زیر را در نظر بگیرید:

\`\`\`java
// Hello.java
class Hello {
    public static void main(String[] args) {
        System.out.println("Hello World!");
    }
}
\`\`\`

با کامپایل آن توسط \`javac\` و اجرای دیس‌اسمبلر درونی جاوا با دستور \`javap -p -v Hello.class\`، ساختار داخلی کلاس آشکار می‌شود:

\`\`\`text
Classfile Hello.class
Compiled from "Hello.java"
class Hello ❶
Constant pool: ❷
   #1 = Methodref          #2.#3          // java/lang/Object."<init>":()V
   #7 = Fieldref           #8.#9          // java/lang/System.out:Ljava/io/PrintStream;
  #13 = String             #14            // Hello World!
  #15 = Methodref          #16.#17        // java/io/PrintStream.println:(Ljava/lang/String;)V
{
  public static void main(java.lang.String[]); ❸
    descriptor: ([Ljava/lang/String;)V
    flags: (0x0009) ACC_PUBLIC, ACC_STATIC
    Code:
      stack=2, locals=1, args_size=1
         0: getstatic     #7                  // Field java/lang/System.out:Ljava/io/PrintStream;
         3: ldc           #13                 // String Hello World!
         5: invokevirtual #15                 // Method java/io/PrintStream.println:(Ljava/lang/String;)V
         8: return
}
\`\`\`

خروجی نشان‌دهنده متادیتای کلاس ❶، **استخر ثابت‌ها (Constant Pool)** ❷ که تمام نام‌ها و مقادیر رشته‌ای را با شناسه عددی ذخیره کرده، و متد اجرایی \`main\` ❸ است که دستور \`ldc\` برای بارگذاری مقدار ثابت از استخر و \`invokevirtual\` برای فراخوانی متد را اجرا می‌کند.

#### مطالعه موردی بازی Pixel Wheels و ابزار Fernflower

بازی دوبعدی مسابقه‌ای **Pixel Wheels** که برای پلتفرم‌های لینوکس، مک، ویندوز و اندروید منتشر شده است نمونه‌ای بسیار مناسب برای تحلیل است. پس از اکسترکت پکیج، دو فایل پیدا می‌کنید: باینری اجرایی \`pixelwheels\` و فایل \`pixelwheels.jar\`.

دستور \`strings\` روی باینری اجرایی، ردپای لودر جاوا و کتابخانه \`libjvm.so\` و ابزار پکر **PackrLauncher** را فاش می‌سازد؛ این بدان معناست که فایل باینری صرفاً یک راه‌انداز است و هسته واقعی برنامه همان فایل JAR است!

برای دیکامپایل کردن فایل JAR، از موتور قدرتمند **Fernflower** (موتور به کار رفته در IntelliJ IDEA و Ghidra) استفاده می‌کنیم:

\`\`\`bash
$ java -jar java-decompiler-engine.jar pixelwheels.jar output/
\`\`\`

در پوشه خروجی، فایل مانیفست \`META-INF/MANIFEST.MF\` نقطه ورود اصلی برنامه را به عنوان \`com.agateau.pixelwheels.desktop.DesktopLauncher\` مشخص می‌کند.

#### بررسی میزان از دست رفتن اطلاعات در فرایند کامپایل به بایت‌کد

با مقایسه کد اصلی تابع \`setupLogging\` با نسخه دیکامپایل‌شده توسط Fernflower، متوجه پدیده‌ای بسیار آموزنده در مهندسی معکوس می‌شویم:

\`\`\`java
// کد اصلی سورس (فهرست ۴-۱۱)
private static void setupLogging(PwGame game) {
    String cacheDir = FileUtils.getDesktopCacheDir();
    File file = new File(cacheDir);
    if (!file.isDirectory() && !file.mkdirs()) {
        System.err.println(StringUtils.format("Can't create cache dir %s", cacheDir));
        return;
    }
    String logFilePath = cacheDir + File.separator + Constants.LOG_FILENAME; ❶
    LogFilePrinter printer = new LogFilePrinter(logFilePath, Constants.LOG_MAX_SIZE);
    // ...
}
\`\`\`

\`\`\`java
// کد بازسازی‌شده توسط دیکامپایلر (فهرست ۴-۱۲)
private static void setupLogging(PwGame game) {
    String cacheDir = FileUtils.getDesktopCacheDir();
    File file = new File(cacheDir);
    if (!file.isDirectory() && !file.mkdirs()) {
        System.err.println(StringUtils.format("Can't create cache dir %s", cacheDir));
    } else {
        String logFilePath = cacheDir + File.separator + "pixelwheels.log"; ❶
        LogFilePrinter printer = new LogFilePrinter(logFilePath, 1048576L);
        // ...
    }
}
\`\`\`

در سورس اصلی، نام ثابت \`Constants.LOG_FILENAME\` به کار رفته بود ❶؛ اما در کد دیکامپایل‌شده، مقدار رشته‌ای \`"pixelwheels.log"\` مستقیماً قرار گرفته است! علت آن است که کامپایلر جاوا در طول مرحله بهینه‌سازی، مقادیر ثابت را مستقیماً ارزیابی کرده و در استخر ثابت‌های همان کلاس (اینجا شناسه \`#38\`) درج می‌کند. با این حال، کدهای دیکامپایل‌شده جاوا کیفیتی فوق‌العاده بالا دارند و بازبینی امنیتی آن‌ها به سادگی یک پروژه متن‌باز است.

---

### کدهای ماشین کامپایل‌شده: باینری‌های بومی (Machine Code)

کدهای ماشین پایین‌ترین سطح انتزاع در میان دسته‌بندی‌های باینری به شمار می‌روند. زبان‌هایی چون C، C++، Go و Rust مستقیماً به کد ماشین تبدیل می‌شوند. شیوه‌های کامپایل این زبان‌ها تأثیر شگرفی بر دشواری یا آسانی مهندسی معکوس آن‌ها دارد.

کد ماشین مجموعه‌ای از دستورالعمل‌های باینری و بایت‌های خام است که مستقیماً توسط مدارات منطقی پردازنده (CPU) بر اساس معماری مجموعه دستورالعمل‌ها (مانند x86-64 یا ARM) اجرا می‌شود. **کد اسمبلی (Assembly Code)** بازنمایی متنی و خوانا برای انسان از همان بایت‌های کد ماشین است.

از آنجا که در کد ماشین دیگر ساختار کلاس‌ها، نام متغیرها و انواع داده سورس‌کد وجود ندارد، دیکامپایلرهای مدرن (مانند Ghidra و IDA Pro) تلاش می‌کنند با الگوبرداری و تحلیل رفتار بایت‌ها، **شبه‌کد (Pseudocode)** تولید کنند؛ تخمینی تقریبی از آنچه سورس کد اصلی ممکن بوده باشد.

#### مثال ساده زبان C: از کد ماشین تا شبه‌کد در Ghidra

برنامه ساده \`hello-world.c\` را در نظر بگیرید:

\`\`\`c
#include <stdio.h>
int main() {
    printf("hello world\\n");
    return 0;
}
\`\`\`

پس از کامپایل با \`gcc\`، آن را با دستور \`objdump -D\` دیس‌اسمبل می‌کنیم:

\`\`\`text
0000000000400526 <main>:
  400526:   55                      push   %rbp
  400527:   48 89 e5                mov    %rsp,%rbp
  40052a:   bf c4 05 40 00          mov    $0x4005c4,%edi
  40052f:   e8 cc fe ff ff          callq  400400 <puts@plt>
  400534:   b8 00 00 00 00          mov    $0x0,%eax
  400539:   5d                      pop    %rbp
  40053a:   c3                      retq
\`\`\`

سپس فایل را درون ابزار قدرتمند **Ghidra** وارد کرده و با CodeBrowser آنالیز می‌کنیم. گیدرا شبه‌کد زیر را بازتولید می‌کند:

\`\`\`c
undefined8 main(void)
{
❶ puts("hello world");
  return 0;
}
\`\`\`

نکته جالب این است که گیدرا به جای \`printf\` تابع \`puts\` را نمایش می‌دهد ❶. این اشتباه گیدرا نیست؛ بلکه کامپایلر \`gcc\` در بهینه‌سازی \`gimple-fold\` خود به طور خودکار توابع \`printf\` بدون فرمت‌بندی را به تابع سبک‌تر و کم‌مصرف‌تر \`puts\` تبدیل کرده است! در مهندسی معکوس باینری‌های بومی، پژوهشگر به طور مستمر میان کدهای اسمبلی، شبه‌کد دیس‌اسمبلر و جداول نمادها حرکت می‌کند.

---

### پیوند ایستا در برابر پیوند پویا (Statically vs. Dynamically Linked)

#### باینری‌های پیوند ایستا (Statically Linked)
یک باینری پیوند ایستا، تمامی کدهای کتابخانه‌های مورد نیاز خود را در زمان کامپایل درون فایل خروجی می‌گنجاند.
- **مزیت:** برنامه مستقل بوده و برای اجرا نیازی به وجود کتابخانه‌های خاص روی سیستم هدف ندارد.
- **چالش مهندسی معکوس:** حجم فایل بسیار بزرگ است و کدهای کتابخانه‌ای استاندارد در میان کدهای اصلی برنامه گم می‌شوند.

زبان **گو (Golang)** به طور پیش‌فرض باینری‌های پیوند ایستا تولید می‌کند. برنامه Hello World در گو را کامپایل می‌کنیم:

\`\`\`bash
$ go build hello-world.go
$ file hello-world
hello-world: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), statically linked
\`\`\`

باینری با وجود سادگی حجم قابل توجهی دارد. دستور \`objdump -t\` برای نمایش نمادها نشان می‌دهد که ده‌ها پکیج نظیر \`runtime\` و \`fmt\` و عملکردهای داخلی زمان اجرای گو (مانند مدیریت پشته \`morestack\` و تخصیص حافظه) درون فایل تعبیه شده‌اند.

#### باینری‌های پیوند پویا (Dynamically Linked)
در باینری‌های پیوند پویا، فایل تنها حاوی ارجاعات و جداول نام توابع مورد نیاز از کتابخانه‌هاست. سیستم‌عامل در زمان اجرا کتابخانه‌های اشتراکی (\`.so\` در لینوکس یا \`.dll\` در ویندوز) را در حافظه لود می‌کند:

\`\`\`bash
$ objdump -T hello-world-c
DYNAMIC SYMBOL TABLE:
0000000000000000      DF *UND*  0000000000000000  GLIBC_2.2.5 puts
0000000000000000      DF *UND*  0000000000000000  GLIBC_2.2.5 __libc_start_main
\`\`\`

در دیس‌اسمبلر گیدرا، کلیک بر روی تابع \`puts\` ما را به یک «تابع ساختگی واسط (Thunk Function)» در جدول PLT هدایت می‌کند که به صورت یک اشاره‌گر به کتابخانه بیرونی عمل می‌نماید. این تفکیک کار پژوهشگر را برای ردیابی سینک‌ها (مانند \`system\`، \`strcpy\`، \`recv\`) بسیار ساده می‌کند.

---

### باینری‌های پاک‌سازی‌شده از نمادها (Stripped Binaries)

توسعه‌دهندگان برای کاهش حجم باینری یا سخت‌تر کردن فرایند مهندسی معکوس، جداول نمادها و متادیتای دیباگ (DWARF) را از فایل حذف یا استریپ می‌کنند (مثلاً با دستور \`strip\` یا در کامپایلر گو با فلگ‌های \`-ldflags="-s -w"\`):

\`\`\`bash
$ go build -ldflags="-s -w" -o stripped hello-world.go
$ objdump -t stripped
stripped: file format elf64-x86-64
SYMBOL TABLE:
no symbols
\`\`\`

هنگامی که این باینری را در گیدرا باز می‌کنید، گیدرا دیگر نام تابع \`main.main\` را نمی‌شناسد و متدها را به نام‌هایی نظیر \`FUN_004893e0\` تغییر می‌دهد. با این وجود:
۱. در باینری‌های زبان گو، ساختار خاصی به نام **\`pclntab\`** (جدول خطوط برنامه به نام توابع) وجود دارد که حتی در صورت استریپ شدن نیز باقی می‌ماند و اسکریپت‌های تحلیلی گیدرا می‌توانند تمام نام توابع را بازیابی کنند.
۲. در سایر زبان‌ها، مهندسی معکوس از طریق **شناسایی رشته‌های متنی لاگ‌ها و پیام‌های خطا (Error Strings)**، ثابت‌های رمزنگاری و شناسایی الگوهای شناخته‌شده توابع استاندارد پیش می‌رود.

---

### باینری‌های فشرده‌شده با پکرها (Packed Binaries: UPX)

تکنیک دیگر کاهش حجم و مبهم‌سازی، استفاده از **پکرها (Packers)** است. پکرها برنامه را فشرده یا رمزنگاری کرده و یک کد بارگذار کوچک (Decompression Stub) به آن اضافه می‌کنند که در زمان اجرا، باینری واقعی را در حافظه رم باز کرده و کنترل اجرا را به آن می‌سپارد.

پکر بسیار مشهور و پرکاربرد **UPX (Ultimate Packer for eXecutables)** باینری گو را حدود ۶۰٪ فشرده می‌کند:

\`\`\`bash
$ upx -o hello-world-packed hello-world
File size: 1850090 -> 1146320 (61.96%)  linux/amd64  hello-world-packed
Packed 1 file.
\`\`\`

باینری پک‌شده با دیس‌اسمبلرهای عادی قابل تحلیل نیست، زیرا کدهای اصلی به صورت توده‌ای از بایت‌های فشرده هستند. اما اولین گام، **شناسایی پکر** است. هدر UPX با بایت‌های جادویی اسکی \`UPX!\` (\`0x55505821\`) مشخص است:

\`\`\`text
> hexdump -C hello-world-packed | grep "UPX!"
000000e0  08 00 00 00 00 00 00 00  4f 05 91 f3 55 50 58 21  |........O...UPX!|
\`\`\`

خوشبختانه باینری‌های پک‌شده با UPX به سادگی با فلگ \`-d\` آنپک می‌شوند:

\`\`\`bash
$ upx -d hello-world-packed
\`\`\`

در سناریوهای پیچیده‌تر و بدافزارها که پکر از تکنیک‌های سفارشی یا رمزنگاری استفاده می‌کند، تحلیل‌گر ناچار است با اجرای برنامه در دیباگر، در نقطه پرش نهایی به کدهای اصلی (Original Entry Point یا OEP) توقف کرده و حافظه فرایند را دامپ (Memory Dump) نماید.

---

### جمع‌بندی فصل

در این فصل، سفری جامع در پهنه رده‌بندی فایل‌های باینری داشتیم:
- **برنامه‌های اسکریپتی (Electron و PyInstaller):** یاد گرفتیم که چگونه فایل‌های ASAR را آنپک کنیم، سورس‌مپ‌ها را استخراج کنیم، کدهای مینیفای‌شده را با Beautifierها خوانا سازیم، بایت‌های جادویی \`.pyc\` را بازسازی کنیم و با \`pycdc\` سورس دست‌نخورده پایتون را پس بگیریم.
- **نمایش‌های میانی (دات‌نت و جاوا):** متادیتای غنی CLR و استخر ثابت‌های JVM را بررسی کردیم و دیدیم که دیکامپایلرهایی مانند ILSpy و Fernflower کدهایی در سطح سورس اصلی تحویل می‌دهند که امکان ترسیم درخت مسیرهای Sink-to-Source را با یک کلیک فراهم می‌سازند.
- **کد ماشین بومی:** باینری‌های C و Go را در قالب‌های پیوند ایستا، پویا، استریپ‌شده و فشرده با UPX تحلیل کردیم و دیدیم که بهینه‌سازی‌های کامپایلر (مانند تبدیل \`printf\` به \`puts\`) چگونه بر شبه‌کد اثر می‌گذارند.

این دانش طبقه‌بندی بنیادین، چراغ راه ما برای **فصل پنجم** خواهد بود؛ جایی که به سراغ **«دیس‌اسمبل و دیکامپایل (Disassembly and Decompilation)»** خواهیم رفت و یاد می‌گیریم چگونه با ابزارهایی نظیر Ghidra به اعماق کدهای ماشین نفوذ کرده و منابع ورودی و چاهک‌های آسیب‌پذیر را مستقیماً در باینری‌های بومی ردیابی کنیم.`,
};
