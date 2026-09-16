import { Chapter } from "@/types/reader";

export const CHAPTER_4_FA: Chapter = {
  id: "ch-4",
  title: "فصل ۴: رده‌بندی فایل‌های باینری (Binary Taxonomy)",
  readingTimeMinutes: 73,
  content: `## فصل ۴: رده‌بندی فایل‌های باینری (Binary Taxonomy)

> *«اگر به یک سمت نگاه کنی، همه‌چیز آشنایی دلگرم‌کننده به نظر می‌رسد... اما سمت دیگر، سرزمینی کاملاً بیگانه جلوه می‌کند.»*
> — مری بیرد، *SPQR*

مانند بازبینی کد و Fuzzing، مهندسی معکوس (Reverse Engineering) موضوعی است که می‌تواند کل یک کتاب را پر کند (و واقعاً پر کرده؛ چندین کتاب). به‌جای پرداختن به جزئیات ریز هر رشته، این کتاب بر استراتژی تمرکز دارد: به‌کارگیری مؤثر منابع محدود برای رسیدن به هدفی مشخص و مهم. برای دستیابی به این هدف، باید پیش از فرو رفتن در جزئیات، از ساختار کلی (Lay of the Land) تصویر درستی داشته باشید. این موضوع باعث می‌شود زمان و انرژی خود را بر روی رویکردهای فنی‌ای متمرکز کنید که احتمال بیشتری برای کشف آسیب‌پذیری‌های جدید دارند.

در مهندسی معکوس، به‌جای اینکه بلافاصله باینری‌هایتان را داخل Ghidra یا IDA Pro بیندازید و مستقیماً به کد اسمبلی حمله کنید، ابتدا باید بیاموزید چگونه باینری‌های جالب را برای تحلیل بیشتر دسته‌بندی (Triage) و انتخاب کنید. همه باینری‌ها یکسان ساخته نمی‌شوند.

در این فصل با سه دسته رایج از باینری‌ها آشنا می‌شوید: اسکریپت‌ها، بازنمایی‌های میانی (Intermediate Representation یا IR) مانند بایت‌کد (Bytecode)، و کد ماشین (Machine Code). سپس نمونه‌هایی از هر دسته را مهندسی معکوس می‌کنید. علاوه بر این، عمیق‌تر به چند زیردسته از این باینری‌ها سفر می‌کنید که رویکردهای متفاوتی می‌طلبند.

### فراتر از باینری‌های اجرایی و کتابخانه‌های اشتراکی (Beyond Executable Binaries and Shared Libraries)

درک انواع مختلف باینری‌ها به شما کمک می‌کند ابزارها و تکنیک‌های مناسب را برای مهندسی معکوس آن‌ها انتخاب کنید. با شکستن آن‌ها به چند دسته کلی، می‌توانید هدف خود را به‌سرعت دسته‌بندی و رویکردتان را بهینه کنید.

در سطح کلان، وقتی از باینری‌ها صحبت می‌کنیم، معمولاً دو نوع به ذهن می‌آید: باینری‌های اجرایی (Executable) و کتابخانه‌های اشتراکی (Shared Library). همان‌طور که از نامش پیداست، باینری‌های اجرایی را می‌توان مستقیماً از خط فرمان یا رابط کاربری اجرا کرد. کتابخانه‌های اشتراکی توابعی را Export می‌کنند که باینری‌های دیگر از طریق لینک استاتیک (Static Linking) یا داینامیک (Dynamic Linking) می‌توانند استفاده کنند. در برخی موارد، اجرای کتابخانه‌های اشتراکی هم ممکن است؛ مثلاً فراخوانی کتابخانه‌های Dynamic-Link Library (DLL) در ویندوز با rundll32.

این باینری‌ها در فرمت فایل Portable Executable (PE) برای ویندوز، فرمت Executable and Linkable Format (ELF) برای لینوکس و فرمت Mach object (Mach-O) برای macOS و iOS ارائه می‌شوند. این فرمت‌ها به‌صورت بومی (Native) توسط سیستم‌عامل زیربنایی مدیریت می‌شوند و شامل دستورالعمل‌های اجرای باینری به‌همراه داده‌های اضافی مانند جدول‌های Import و Export، اطلاعات لینک داینامیک و متغیرهای سراسری هستند.

اگرچه این روشی سرراست برای دسته‌بندی باینری‌هاست، اما بسیاری از جزئیات مهم را از قلم می‌اندازد — به‌ویژه در محیط توسعه مدرن امروزی. نرم‌افزارهای ارتباطی محبوبی مانند WhatsApp، Slack و Zoom را در نظر بگیرید. این برنامه‌ها به‌شکل باینری اجرایی توزیع می‌شوند، اما در واقع فرمت‌های دیگری مانند اسکریپت‌های Node.js، کد باینری WebAssembly و بایت‌کد Common Intermediate Language (CIL) را در خود بسته‌بندی کرده‌اند. برخلاف فرمت‌های استاندارد فایل اجرایی مانند PE و ELF، این فرمت‌ها در بسترهای دیگری اجرا می‌شوند؛ مانند محیط Node.js یا ماشین مجازی Common Language Runtime (CLR) که توسط .NET Framework استفاده می‌شود. این بسترها به نوبه خود، مجموعه‌های خاص خودشان از مرزهای امنیتی، محافظت‌های پیش‌فرض و پیکربندی‌های نادرست بالقوه را دارند.

برای مثال، در سال‌های اولیه فریمورک دسکتاپ Electron (مبتنی بر Node.js)، مهاجم می‌توانست به‌طور ساده یک باگ اسکریپت‌نویسی بین‌سایتی (Cross-Site Scripting یا XSS) را به اجرای کد ارتقا دهد. Electron به توسعه‌دهندگان اجازه می‌داد تنظیم nodeIntegration را روشن کنند که APIها و ماژول‌های Node.js را در پروسه رندر وب فعال می‌کرد و عملاً محافظت‌های سندباکس (Sandbox) مرورگر را از کار می‌انداخت. این در حالی رخ می‌داد که توسعه‌دهندگان از دوران ActiveX و فلش، درس‌های سختی از دست‌ورفتن با سندباکس مرورگر آموخته بودند. ساختن یک پل میان آنچه در سندباکس رخ می‌دهد (اجرای جاوااسکریپت) و آنچه در دسکتاپ رخ می‌دهد (اجرای APIهای سیستم‌عامل)، شعاع انفجار (Blast Radius) یک آسیب‌پذیری وب را به‌شدت افزایش می‌دهد. باگی که محدود به یک وب‌سایت خاص بود، اکنون به یک اجرای کد راه‌دور تمام‌عیار روی کامپیوتر قربانی تبدیل می‌شود. متأسفانه با نفوذ تدریجی فناوری‌های وب به محیط‌های اجرای دسکتاپ و سمت سرور، باید انتظار محو شدن بیشترِ این مرزها را داشت.

اما از دید پژوهشگر آسیب‌پذیری، این محو شدن مرزها طیف اهداف برای مهندسی معکوس را گسترده‌تر می‌کند. در مقایسه با کد اسمبلی خالص، دی‌کامپایل (Decompile) کردن بازنمایی‌های میانی مانند بایت‌کد جاوا و CIL نسبتاً آسان‌تر است. در واقع، با متادیتای مناسب، می‌توانید تقریباً همان کد منبع اصلی این باینری‌ها را بازیابی کنید. این حتی شامل زبان‌های اسکریپت‌نویسی مانند Node.js یا پایتون هم نمی‌شود که می‌توانند در باینری‌هایی بسته‌بندی شوند که مفسر تعبیه‌شده را روی اسکریپت‌های ذخیره‌شده اجرا می‌کنند. مهندسی معکوس این نوع باینری‌ها به‌جای دی‌کامپایل کردن کد ماشین، شامل باز کردن بسته‌بندی (Unpacking) و گاهی ضدبالشت‌سازی (Deobfuscating) اسکریپت‌هاست. پس از آن، می‌توانید بازبینی کد را مثل همیشه انجام دهید.

علاوه بر این، تعاملات متقابلی میان این مؤلفه‌ها وجود دارد. برای مثال، یک اسکریپت Node.js می‌تواند یک ماژول باینری WebAssembly را نمونه‌سازی کند، یا بایت‌کد CIL می‌تواند کتابخانه‌های مدیریت‌نشده (Unmanaged) را بارگذاری کند. برای حفظ دیدگاه مرغِ پرنده (Bird's-Eye View) نسبت به مسیرهای مختلفِ منطق برنامه، باید انواع باینری‌ها و مؤثرترین راه‌های تحلیل آن‌ها را بشناسید. بیایید شروع کنیم — از اسکریپت‌ها.

### اسکریپت‌ها (Scripts)

فایل‌های اسکریپت به زبان برنامه‌نویسی‌ای نوشته می‌شوند که می‌توانند مستقیماً توسط یک مفسر (Interpreter) اجرا شوند بدون اینکه نیازی به کامپایل باینری باشد. زبان‌های اسکریپت‌نویسی رایج شامل جاوااسکریپت، پایتون و روبی می‌شوند. برای مثال، در محیط Node.js، اسکریپت‌های جاوااسکریپت توسط موتور V8 خارج از مرورگر اجرا می‌شوند.

با این حال، این لزوماً به آن معنا نیست که مفسر اصلاً اسکریپت‌ها را کامپایل نمی‌کند. بسیاری از مفسرهای مدرن از نوعی کامپایل Just-in-Time یا Ahead-of-Time استفاده می‌کنند که در زمان اجرا اتفاق می‌افتد. این کامپایل، اسکریپت را به بایت‌کد یا کد ماشین تبدیل می‌کند که بهینه‌تر است و سریع‌تر از حالت تفسیر مستقیم اجرا می‌شود.

برخی فایل‌های اجرایی مبتنی بر اسکریپت ممکن است فقط بایت‌کد کامپایل‌شده را به‌جای اسکریپت‌های اصلی شامل شوند. در موارد دیگر، فایل‌های اجرایی ممکن است اسکریپت‌هایی داشته باشند که بالشت‌سازی (Obfuscate) یا مینیفای (Minify) شده‌اند و تحلیل آن‌ها را دشوارتر می‌کنند. در بهترین سناریو، فایل اجرایی صرفاً نقش یک Wrapper را دور فایل‌های کد منبع بازی می‌کند و آن‌ها را با یک مفسر تعبیه‌شده اجرا می‌کند. در این بخش، این سناریوها را از طریق دو پروژه متن‌باز که به زبان‌های اسکریپت‌نویسی نوشته و به‌شکل فایل اجرایی توزیع شده‌اند، بررسی می‌کنید: DbGate یک برنامه Electron از نوع Node.js و Galaxy Attack یک برنامه PyInstaller از نوع پایتون.

#### مهندسی معکوس برنامه‌های Electron از نوع Node.js (Reverse Engineering Node.js Electron Applications)

امروزه به احتمال زیاد دست‌کم یک برنامه Electron از نوع Node.js را در محیط دسکتاپ می‌بینید، پس درک روش مهندسی معکوس آن‌ها اهمیت دارد. یکی از مهم‌ترین روندهای توسعه مدرن برنامه، رشد نرم‌افزارهای ترکیبی (Hybrid) است که راه‌حل‌های وب و نیتیو را در هم می‌آمیزند. به‌طور سنتی، نرم‌افزارهای نیتیو ساخته‌شده برای دسکتاپ و سرور، با زبان‌های کامپایلی مانند ++C نوشته می‌شدند. زبان‌های کامپایلی به‌دلیل بهینه‌سازی‌های زمان کامپایل و توانایی اجرای مستقیم کد ماشین — به‌جای اجرا از طریق مفسر — بسیار سریع‌تر از زبان‌های تفسیری (مانند جاوااسکریپت و پایتون) اجرا می‌شوند.

با این حال، ظهور موتور قدرتمند V8 با کامپایل Just-in-Time در سال ۲۰۰۸ به توسعه‌دهندگان وب امکان داد جاوااسکریپت را با عملکرد بهتری اجرا کنند. در پی آن، در سال ۲۰۰۹ Node.js منتشر شد؛ یک محیط اجرای جاوااسکریپت سمت سرور ساخته‌شده بر روی V8. توسعه‌دهندگان دیگر به‌جای اجرای جاوااسکریپت صرفاً در سندباکس مرورگر برای افزودن قابلیت به صفحات وب، می‌توانستند کد جاوااسکریپت بنویسند تا فایل‌ها را بخواند و بنویسد، به دیتابیس کوئری بزند و سایر توابع سمت سرور را اجرا کند.

معماری غیرمسدودکننده و رویدادمحور (Nonblocking, Event-Driven) Node.js همچنین به توسعه‌دهندگان اجازه می‌داد به‌سادگی برنامه‌های Real-Time مقیاس‌پذیری بسازند که می‌توانستند چندین اتصال را هم‌زمان مدیریت کنند. این قابلیتی حیاتی برای وب‌سرورها بود و Node.js را به اولین جایگاه پذیرش رساند، زیرا یعنی توسعه‌دهندگان وب اکنون می‌توانستند برنامه‌های وب را برای هم فرانت‌اند و هم بک‌اند، با جاوااسکریپت بنویسند.

سپس فریمورک Electron (در اصل Atom Shell، به اشاره به ویرایشگر کد Atom که برای آن ساخته شده بود) ظهور کرد. Electron بر ساخت برنامه‌های دسکتاپ با Node.js و سایر فناوری‌های وب مانند HTML و CSS متمرکز بود. توسعه‌دهندگان به‌جای دست‌وپنجه نرم کردن با APIهای مخصوص هر سیستم‌عامل و فرایندهای بیلد، می‌توانستند صرفاً از محیط‌های آزمون‌پسته و رایج مانند Node.js و موتور مرورگر Chromium برای ساخت برنامه‌های دسکتاپ چندسکویی (Cross-Platform) با جاوااسکریپت استفاده کنند. این یعنی توسعه بسیار سریع‌تر، به‌ویژه که برنامه‌های دسکتاپ روزبه‌روز به قابلیت‌های وبی بیشتری وابسته می‌شدند.

یک برنامه Electron از دو بخش تشکیل شده است: باینری از-پیش-ساخته Electron که شامل محیط‌های اجرای Node.js و Chromium است، و کد منبع برنامه که معمولاً در یک فایل Atom Shell Archive (ASAR) بسته‌بندی می‌شود. می‌توانید این را با نسخه‌های منتشرشده DbGate بررسی کنید؛ یک کلاینت دیتابیس متن‌باز ساخته‌شده روی فریمورک Electron. برای لینوکس، DbGate هم به‌شکل پکیج Debian و هم AppImage توزیع می‌شود. پکیج Debian نسخه 5.2.7 را از آدرس https://github.com/dbgate/dbgate/releases/download/v5.2.7/dbgate-5.2.7-linux_amd64.deb دانلود و با ابزار dpkg-deb استخراج کنید. باید فایل‌های زیر را ببینید:

\`\`\`bash
$ dpkg-deb -x dbgate-5.2.7-linux_amd64.deb dbgate
$ tree --charset ascii dbgate
dbgate
|-- opt
|   \`-- DbGate
|       |-- chrome_100_percent.pak
|       |-- chrome_200_percent.pak
|       |-- chrome_crashpad_handler
|       |-- chrome-sandbox
❶       |   |-- dbgate
❷       |   |-- libEGL.so
|       |   |-- libffmpeg.so
|       |   |-- libGLESv2.so
|       |   |-- libvk_swiftshader.so
|       |   |-- libvulkan.so.1
        --snip--
|       |-- resources
❸       |       |   |-- app.asar
|       |       \`-- app.asar.unpacked
|       |           |-- node_modules
|       |           |   |-- better-sqlite3
|       |           |   |   \`-- build
|       |           |   |       \`-- Release
|       |           |   |           \`-- better_sqlite3.node
|       |           |   \`-- oracledb
|       |           |       \`-- build
|       |           |           \`-- Release
|       |           |               |-- oracledb-5.5.0-darwin-x64.node
|       |           |               |-- oracledb-5.5.0-linux-x64.node
|       |           |               \`-- oracledb-5.5.0-win32-x64.node
|       |           \`-- packages
|       |               \`-- api
|       |                   \`-- dist
|       |                       |-- 45c2d7999105b08d7b98dd8b3c95fda3.node
|       |                       \`-- 9bf76138dc2dae138cb17ee46c4a2dd1.node
|       |-- resources.pak
|       |-- snapshot_blob.bin
|       |-- swiftshader
|       |   |-- libEGL.so
|       |   \`-- libGLESv2.so
|       |-- v8_context_snapshot.bin
|       \`-- vk_swiftshader_icd.json
\`\`\`

از این فهرست می‌بینید که پکیج شامل یک باینری اجرایی dbgate ❶ است. این صرفاً یک باینری Electron از-پیش-ساخته است که پکیج ASAR بسته‌بندی‌شده را بارگذاری می‌کند. همچنین کتابخانه‌های اشتراکی برای رندر گرافیکی و پردازش رسانه ❷ را می‌بینید که وابستگی‌های استفاده‌شده توسط Chromium و Node.js هستند. فایل ASAR یعنی app.asar ❸ در دایرکتوری resources قرار دارد. Electron به‌طور خودکار برنامه را از این دایرکتوری بارگذاری می‌کند.

این الگویی رایج است، نه فقط برای Electron بلکه برای همه فایل‌های اجرایی مبتنی بر اسکریپت. بسته برنامه معمولاً شامل یک مفسر اسکریپت رایج، چند فایل کتابخانه‌ای اضافی و یک بسته اسکریپت (Script Bundle) است. هرچه بیشتر با این نوع فایل‌های اجرایی روبه‌رو شوید، می‌توانید الگوهای خاصی را تشخیص دهید — مانند وجود یک فایل ASAR — که به شما می‌گویند چه نوع فریمورکی استفاده شده است.

اگر Node.js نصب دارید، می‌توانید فایل ASAR را با ابزار asar باز کنید:

\`\`\`bash
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
$ source ~/.zshrc
$ nvm install --lts
$ npm install -g asar
$ npx asar extract dbgate/opt/DbGate/resources/app.asar dbgate-src
$ tree --charset ascii dbgate-src
dbgate-src
--snip--
|-- icon.png
|-- node_modules
|   |-- @yarnpkg
|   |-- argparse
    --snip--
|-- package.json ❶
|-- packages
|   |-- api
|   |   \`-- dist
|   |       |-- 45c2d7999105b08d7b98dd8b3c95fda3.node
|   |       |-- 9bf76138dc2dae138cb17ee46c4a2dd1.node
|   |       \`-- bundle.js
|   |-- plugins
|   |   |-- dbgate-plugin-csv
|   |   |   |-- dist
|   |   |   |   |-- backend.js
|   |   |   |   \`-- frontend.js
|   |   |   |-- icon.svg
|   |   |   |-- LICENSE
|   |   |   |-- package.json
|   |   |   \`-- README.md
    --snip--
\`-- src
    |-- electron.js
    |-- mainMenuDefinition.js
    |-- nativeModulesContent.js
    \`-- nativeModules.js
\`\`\`

نام فایل‌های جالب زیادی در کد باز‌شده وجود دارد، اما در بیشتر موارد، نخستین مرجع باید یک فایل Manifest باشد که متادیتای مهمی درباره پکیج دارد؛ مانند فایل ورودی (Entrypoint) که ابتدا اجرا می‌شود. پکیج‌های زبان‌های برنامه‌نویسی مختلف از Manifest استفاده می‌کنند: برای Node.js فایل package.json، برای جاوا MANIFEST.MF، برای Go فایل go.mod و غیره. نگاهی به package.json مربوط به DbGate بیندازیم که در فهرست ۴-۱ نشان داده شده است.

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
❶    "repository": {
        "type": "git",
        "url": "https://github.com/dbgate/dbgate.git"
    },
    "homepage": "./",
❷    "main": "src/electron.js",
    "optionalDependencies": {
        "better-sqlite3": "7.6.2",
        "oracledb": "^5.5.0"
    }
}
\`\`\`

*فهرست ۴-۱: فایل Manifest مربوط به DbGate*

دو قطعه اطلاعات مفید اینجا وجود دارد. نخست، Manifest به شما می‌گوید مخزن کد منبع اصلی کجاست ❶ — اطلاعاتی که اگر با این باینری روبه‌رو می‌شدید و نمی‌دانستید متن‌باز است، بی‌ارزش نبود. دوم، به شما می‌گوید نقطه ورودی مشخص‌شده با main یعنی src/electron.js ❷ است. این فایل بعدی‌ای خواهد بود که بررسی می‌کنید.

پیشرفت خوبی داشته‌اید، اما خیلی زود ممکن است با موانعی مانند زیر در electron.js روبه‌رو شوید:

\`\`\`javascript
if (!apiLoaded) {
    const apiPackage = path.join(
        __dirname,
        process.env.DEVMODE ? '../../packages/api/src/index' : '../packages/api/dist/bundle.js' ❶
    );
    global.API_PACKAGE = apiPackage;
    global.NATIVE_MODULES = path.join(__dirname, 'nativeModules');
    // console.log('global.API_PACKAGE', global.API_PACKAGE);
    const api = require(apiPackage);
\`\`\`

این کد در محیط production واقعاً پکیجی از packages/api/dist/bundle.js ایمپورت می‌کند ❶، اما اگر این فایل را بررسی کنید، آشفته‌ای از کدهای فشرده و نام متغیرهای مبهم است و تحلیل دستی آن را غیرممکن می‌کند.

علت این است که DbGate از Webpack و Rollup استفاده می‌کند؛ ماژول‌باندلرهایی برای جاوااسکریپت که فایل‌های کد منبع مختلف را به یک یا چند فایل خروجی مینیفای‌شده ترکیب می‌کنند که برای توزیع بهینه‌ترند. در کد منبع اصلی DbGate می‌توانید فایل‌های پیکربندی Webpack را در packages/api/webpack.config.js و فایل پیکربندی Rollup را در packages/web/rollup.config.js بیابید. برای ادامه مسیر، به نحوی باید مینیفیکیشن را معکوس کنید.

#### باز کردن فایل‌های Source Map (Unpacking Source Maps)

به دلیل خروجی مینیفای‌شده، معمولاً نمی‌توان نسخه اصلی و باز‌شده کد را از خروجی Webpack یا Rollup بازیابی کرد. با این حال، در برخی موارد توسعه‌دهندگان ممکن است این ابزارها (و ابزارهای دیگری مانند Babel و TypeScript) را طوری پیکربندی کنند که یک فایل Source Map هم خروجی بدهند. فایل‌های Source Map جاوااسکریپت فایل‌های ویژه‌ای هستند که فایل‌های کد منبع تبدیل‌شده — مانند خروجی مینیفای‌شده Webpack — را به کد منبع اصلی، شامل ساختار دایرکتوری اصلی، نگاشت می‌کنند. این کار دیباگ کردن کد جاوااسکریپت را در حین توسعه آسان‌تر می‌کند.

در مورد DbGate، توسعه‌دهنده Source Map را برای Webpack فعال نکرده اما برای دو فایل خروجی Rollup یعنی query-parser-worker.js و bundle.js فعال کرده است؛ همان‌طور که در فهرست ۴-۲ نشان داده شده است.

\`\`\`javascript
rollup.config.js
export default [
    {
        input: 'src/query/QueryParserWorker.js',
        output: {
❶            sourcemap: true,
            format: 'iife',
❷            file: 'public/build/query-parser-worker.js',
        },
        plugins: [
            commonjs(),
            resolve({
                browser: true,
            }),
            // If we're building for production (npm run build
            // instead of npm run dev), minify
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

*فهرست ۴-۲: پیکربندی Rollup که Source Map را فعال می‌کند*

مقدار sourcemap ❶ به شما می‌گوید Rollup هنگام تولید فایل خروجی در مسیر مشخص‌شده ❷، یک Source Map نیز شامل خواهد کرد.

در فایل‌های استخراج‌شده پکیج DbGate، فایل‌های bundle.js و bundle.js.map را می‌توان در همان دایرکتوری یعنی packages/web/public/build یافت. لحظه‌ای این دو فایل را مقایسه کنید. bundle.js کد جاوااسکریپت به نظر می‌رسد اما به‌شدت مینیفای شده و خواندنش دشوار است. در مقابل، bundle.js.map فایلی JSON به نظر می‌رسد با مسیرهای فایل و کد منبعِ قابل تشخیص.

به لطف فایل Source Map، می‌توانید bundle.js را از یک توده نامفهوم کد به فایل‌های واقعی کد منبع تبدیل کنید. از کتابخانه source-map موزیلا برای نوشتن سریع یک اسکریپت استفاده کنید. فایل‌های bundle.js.map و unpack.js — که کدش در فهرست ۴-۳ نشان داده شده — را در یک دایرکتوری قرار دهید (این فایل همچنین در مخزن کد کتاب در مسیر chapter-04/unpack-sourcemap موجود است).

\`\`\`javascript
unpack.js
const fs = require('fs');
const path = require('path');
const sourceMap = require('source-map');
const rawSourceMap = JSON.parse(fs.readFileSync('bundle.js.map', 'utf8'));
fs.mkdirSync('output');
sourceMap.SourceMapConsumer.with(rawSourceMap, null, consumer => {
❶    consumer.eachMapping(mapping => {
        const sourceFilePath = mapping.source;
        const sourceContent = consumer.sourceContentFor(mapping.source);
        // Remove path traversal characters
❷        const normalizedSourceFilePath = path
            .normalize(sourceFilePath)
            .replace(/^(\\.\\.(\\/|\\\\|$))+/, '');
        const outputFilePath = path.join('output', normalizedSourceFilePath);
        const outputDir = path.dirname(outputFilePath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
❸        fs.writeFileSync(outputFilePath, sourceContent, 'utf8');
    });
});
\`\`\`

*فهرست ۴-۳: اسکریپت باز کردن Source Map*

این اسکریپت Source Map را پردازش و از طریق هر نگاشت (Mapping) ❶، مسیر فایل و محتوای آن را استخراج می‌کند. با این حال، اگر bundle.js.map را بررسی کنید، متوجه می‌شوید برخی مسیرهای فایل منبع، مسیرهای نسبی (Relative) هستند. متأسفانه این یعنی بخشی از اطلاعات درباره ساختار واقعی دایرکتوری‌های کد منبع را از دست می‌دهیم. چون نمی‌توانیم مسیرهای نسبی را بازسازی کنیم، باید به‌جای آن با حذف هرگونه مسیر نسبی ❷، آن‌ها را در همان دایرکتوری ریشه در نظر بگیریم. با این وجود، مهم‌ترین اطلاعات یعنی محتوای فایل‌های کد منبع، حفظ شده و در خروجی نوشته می‌شود ❸.

کتابخانه source-map را نصب و اسکریپت را اجرا کنید؛ چند دقیقه‌ای زمان می‌برد:

\`\`\`bash
$ npm install source-map
$ node unpack.js
\`\`\`

پوشه خروجی را با کد منبع اصلی مقایسه کنید. همان‌طور که بحث شد، ساختار دایرکتوری تطابق کامل ندارد، اما به‌دقت از packages/web/src در کد منبع اصلی پیروی می‌کند. علاوه بر این، ممکن است متوجه شوید که فایل‌های TypeScript — مانند packages/filterparser/src/getFilterType.ts — به فایل‌های جاوااسکریپت مانند filterparser/lib/getFilterType.js تبدیل شده‌اند. این به آن دلیل است که TypeScript در واقع طی فرایند بیلد به جاوااسکریپت ترنسپایل (Transpile؛ یعنی کامپایل به زبان برنامه‌نویسی دیگر) می‌شود تا موتورهای جاوااسکریپت بتوانند آن را تفسیر کنند. برخی تفاوت‌های میان TypeScript اصلی در فهرست ۴-۴ و جاوااسکریپت ترنسپایل‌شده در فهرست ۴-۵ را مشاهده کنید.


\`\`\`javascript
❶import { isTypeNumber, isTypeString, isTypeLogical,
    isTypeDateTime } from 'dbgate-tools';
import { FilterType } from './types';
❷export function getFilterType(dataType: string): FilterType {
    if (!dataType) return 'string';
    if (isTypeNumber(dataType)) return 'number';
    if (isTypeString(dataType)) return 'string';
    if (isTypeLogical(dataType)) return 'logical';
    if (isTypeDateTime(dataType)) return 'datetime';
    return 'string';
}
\`\`\`

*فهرست ۴-۴: کد اصلی getFilterType*

در TypeScript اصلی، کد منبع از کلیدواژه import برای ایمپورت وابستگی‌ها ❶ استفاده می‌کند، اما این قابلیت فقط در نسخه‌های جدیدتر جاوااسکریپت مانند ECMAScript 6 پشتیبانی می‌شود. علاوه بر این، شامل انوتیشن‌های نوع (Type Annotation) است که نوع متغیرها را مشخص می‌کند ❷ و به‌طور بومی در جاوااسکریپت پشتیبانی نمی‌شود.

\`\`\`javascript
getFilterType.js
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilterType = void 0;
❶const dbgate_tools_1 = require("dbgate-tools");
    if (!dataType)
        return 'string';
    if ((0, dbgate_tools_1.isTypeNumber)(dataType))
        return 'number';
    if ((0, dbgate_tools_1.isTypeString)(dataType))
        return 'string';
    if ((0, dbgate_tools_1.isTypeLogical)(dataType))
        return 'logical';
    if ((0, dbgate_tools_1.isTypeDateTime)(dataType))
        return 'datetime';
    return 'string';
}
exports.getFilterType = getFilterType;
\`\`\`

*فهرست ۴-۵: کد تبدیل‌شده getFilterType*

در مقابل، جاوااسکریپت ترنسپایل‌شده از کلیدواژه require مطابق استاندارد سازگار با نسخه‌های قبل یعنی CommonJS برای ایمپورت وابستگی‌ها ❶ استفاده می‌کند و انوتیشن‌های نوع ❷ را حذف می‌کند (این نوع‌ها در مرحله ترنسپایل بررسی شده‌اند). این موضوع بخشی از اطلاعاتی را که می‌توانست مهندسی معکوس را تسریع کند از دست می‌دهد، زیرا اعلان‌های نوع، جزئیاتی درباره ورودی‌های مورد انتظار اضافه می‌کنند. برای مثال، در کد منبع اصلی، فایل packages/filterparser/src/types.ts به شما می‌گوید FilterType باید یکی از رشته‌های زیر باشد:

\`\`\`typescript
// import types from 'dbgate-types';
export type FilterType = 'number' | 'string' | 'datetime' | 'logical' |
    'eval' | 'mongo';
\`\`\`

اگرچه تفاوت عمده دیگری که تحلیل کد را به‌طور جدی تحت تأثیر قرار دهد به نظر نمی‌رسد، باید پرگویی (Verbosity) بیشترِ جاوااسکریپت ترنسپایل‌شده را نیز در نظر بگیرید. هرچه با کدهای ترنسپایل‌شده یا تبدیل‌شده (مانند مینیفای‌شده) بیشتری روبه‌رو شوید، یاد می‌گیرید الگوهای رایج در جاوااسکریپت ترنسپایل‌شده را به معادل‌های TypeScriptشان نگاشت کنید؛ مانند کدهای قالبی Export یا Polyfillها (کدهایی که توابعی را پیاده می‌کنند که در نسخه‌های جدیدتر جاوااسکریپت به‌طور بومی پشتیبانی می‌شوند اما در نسخه‌های قدیمی‌تر نه).

در مواردی که TypeScript ترنسپایل به جاوااسکریپت نشده، ممکن است همچنان تفاوت‌های ظریفی ببینید. برای مثال، کد اصلی packages/web/src/clientAuth.ts را در فهرست ۴-۶ بررسی کنید.

\`\`\`javascript
clientAuth.ts
import { apiCall, enableApi } from './utility/api';
import { getConfig } from './utility/metadataLoaders';
--snip--
❶export async function handleAuthOnStartup(config) {
    if (config.oauth) {
        console.log('OAUTH callback URL:', location.origin
            + location.pathname);
    }
    if (config.oauth || config.isLoginForm) {
        if (localStorage.getItem('accessToken')) {
            return;
        }
        redirectToLogin(config);
    }
}
\`\`\`

*فهرست ۴-۶: کد اصلی handleAuthOnStartup*

این کد از کلیدواژه async برای تعریف یک تابع ناهمگام (Asynchronous) استفاده می‌کند ❶. توابع ناهمگام یک Promise برمی‌گردانند که به برنامه اجازه می‌دهد تابع را فراخوانی کند اما به اجرا و پاسخ‌دهی به سایر رویدادها ادامه دهد. در مقایسه، کد output/src/clientAuth.ts در فهرست ۴-۷ کمی متفاوت به نظر می‌رسد.

\`\`\`javascript
clientAuth.ts
import { __awaiter } from "tslib";
--snip--
export function handleAuthOnStartup(config) {
❶    return __awaiter(this, void 0, void 0, function* () {
        if (config.oauth) {
            console.log('OAUTH callback URL:', location.origin +
                location.pathname);
        }
        if (config.oauth || config.isLoginForm) {
            if (localStorage.getItem('accessToken')) {
                return;
            }
            redirectToLogin(config);
        }
    });
}
\`\`\`

*فهرست ۴-۷: کد تبدیل‌شده handleAuthOnStartup*

به‌جای async، کد تبدیل‌شده از تابع Polyfill یعنی __awaiter تایپ‌اسکریپت استفاده می‌کند که همان قابلیت‌های تابع ناهمگام را فراهم می‌کند ❶.

مانند جاوااسکریپت ترنسپایل‌شده، این تفاوت‌ها نباید چالش جدی‌ای ایجاد کنند. با این حال، هنوز برخی اطلاعات ساختار دایرکتوری را از دست داده‌ایم. برای مثال، کد استخراج‌شده شامل دایرکتوری‌های packages یا web نیست. این موضوع می‌تواند تلاش شما برای تحلیل کد برنامه را مختل کند، زیرا نمی‌توانید محل دقیق فایل‌ها نسبت به یکدیگر را تأیید کنید. اگر با Source Mapهایی مواجه شدید که مسیرهای Path Traversal دارند، این را در ذهن داشته باشید.

اطلاعات فایل‌های غیرهسته — شامل فایل‌های تست و پیکربندی — هم از دست رفته است. در یک سناریوی معمول بازبینی کد، این فایل‌ها می‌توانند سرنخ‌های اضافی درباره نرم‌افزار بدهند؛ مثلاً اینکه چگونه کامپایل شده است.

در مجموع، وجود Source Map لزوماً به آن معنا نیست که می‌توانید کد منبع اصلی را بازیابی کنید. معمولاً فقط بخشی از کد را بسته‌بندی می‌کنند. برای مثال، همان‌طور که دیدیم، در مورد DbGate فایل Source Map فقط کد سمت کلاینتِ تحت پوشش پیکربندی Rollup را شامل می‌شود و در ترنسپایل، برخی اطلاعات مفید از دست می‌رود. با این وجود، اگر آن‌ها را داشته باشید، ابزارهای دست‌وپاگیری هستند. بدون Source Map باید به روش‌های کم‌دقت‌تری برای بازسازی کد اصلی متکی شوید؛ مانند Code Beautifierها.

#### استفاده از Beautifierها روی کد مینیفای‌شده (Using Beautifiers on Minified Code)

Beautifier ابزاری است که کد را خواناترتر برای انسان قالب‌بندی می‌کند؛ مثلاً با افزودن فاصله‌گذاری و خط جدید یکنواخت. این کار تحلیل کد مینیفای‌شده را آسان‌تر می‌کند — کدی که طبق تعریف، تا حد ممکن فشرده شده (مثلاً با حذف فاصله‌ها و خط‌های جدید غیرضروری که مفسر برای پردازش کد به آن‌ها نیازی ندارد).

به فایل‌های آرشیو کد منبع استخراج‌شده برنامه برگردید: می‌توانید در packages/api/dist یک فایل bundle.js متفاوت بیابید. برخلاف فایل bundle در packages/web/public/build، این فایل همراه با فایل Source Map نیست که به کمک شما بیاید. اگر به پیکربندی Webpack این باندل در کد منبع اصلی یعنی packages/api/webpack.config.js نگاه کنید، می‌بینید که توسعه‌دهنده گزینه‌ای را که مینیفیکیشن را غیرفعال می‌کرد، کامنت کرده است:

\`\`\`javascript
// optimization: {
//     minimize: false,
// },
\`\`\`

درباره بقیه فایل‌های توزیع پلاگین‌ها در packages/plugins هم همین است. Webpack باندل‌های خروجی را بهینه کرده — با کوتاه کردن نام متغیرها و توابع، حذف فاصله‌ها و حذف کد مرده (Dead Code) — و به توده‌ای فشرده اما به‌ظاهر غیرقابل رمزگشایی رسیده است. با این حال، اگر دقیق به کد نگاه کنید، ممکن است چند رشته و نام تابعِ قابل فهم تشخیص دهید. این به آن دلیل است که Webpack برخی مقادیر ثابت و نام توابع Export‌شده را حفظ می‌کند.

می‌توانید خوانایی کد را با استفاده از یک Beautifier قالب‌بندی و تا حدی ضدبالشت (Deobfuscate) کنید. چند گزینه موجود است اما پکیج js-beautify کافی است. پکیج را نصب و روی باندل اصلی اجرا کنید:

\`\`\`bash
$ npm -g install js-beautify
$ npx js-beautify packages/api/dist/bundle.js > bundle.beautified.js
\`\`\`

کد قالب‌بندی‌شده، ساختاری نسبتاً یکنواخت از فهرستی از تعریف‌های تابع را آشکار می‌کند. حتی ممکن است کدی مشابه فایل‌هایی که قبلاً با Source Map باز کردید ببینید، زیرا کدهای سمت سرور و کلاینت برخی توابع ایمپورت‌شده مشترک دارند. یکی از آن‌ها compileMacroFunction است:

\`\`\`javascript
function compileMacroFunction(macro, errors = []) {
    if (!macro) return null;
    let func;
    try {
❶        return func = eval(getMacroFunction[macro.type](macro.code)), func
    } catch (e) {
        return errors.push(\`Error compilingmacro \${macro.name}:
            \${e.message}\`), null
    }
}
\`\`\`

به چاهک خطرناک eval ❶ توجه کنید که آرگومان رشته‌ای خود را به‌عنوان جاوااسکریپت اجرا می‌کند. اگر این آرگومان توسط مهاجم قابل کنترل باشد، می‌تواند به‌سادگی به یک آسیب‌پذیری تزریق کد (Code Injection) تبدیل شود. از آنجا که Webpack به‌طور پیش‌فرض نام توابع استاندارد مانند eval را بالشت نمی‌کند، می‌توانید ابزارهای تحلیل خودکار کد را اجرا کنید تا چنین چاهک‌های خطرناکی را در کد قالب‌بندی‌شده به‌سرعت علامت‌گذاری کنند — به‌ویژه وقتی بازبینی دستی آن دشوار است.

#### تحلیل یک چاهک خطرناک (Analyzing a Dangerous Sink)

از آنجا که compileMacroFunction هم در کد فرانت‌اند و هم بک‌اند ظاهر می‌شود و یک چاهک خطرناک دارد، ارزش کاویدن دارد. با استفاده از تکنیک‌هایی که در فصل‌های قبلی آموختید، می‌توانید کد باز‌شده و قالب‌بندی‌شده را تحلیل کنید تا مشخص شود آیا یک آسیب‌پذیری قابل بهره‌برداری است یا خیر.

این تابع ابتدا آرگومان macro‌ای می‌گیرد که به getMacroFunction پاس داده می‌شود و نتیجه آن سرانجام به eval می‌رسد. نگاهی به کد getMacroFunction از Source Map باز‌شده بیندازیم:

\`\`\`javascript
const getMacroFunction = {
❶    transformValue: code => \`
        (value, args, modules, rowIndex, row, columnName) => {
❸            \${code}
        }
    \`,
❷    transformRow: code => \`
        (row, args, modules, rowIndex, columns) => {
❸            \${code}
        }
    \`,
};
\`\`\`

از این کد می‌بینید که getMacroFunction در واقع یک Object Literal فقط با دو کلید است: transformValue ❶ و transformRow ❷. مقادیر این کلیدها توابعی هستند که یک آرگومان منفرد می‌گیرند که داخل رشته‌ای ❸ درون‌ریزی (Interpolate) می‌شود که تابع دیگری را تعریف می‌کند. به یاد داشته باشید که این رشته سرانجام به eval پاس داده می‌شود.

بنابراین به نظر می‌رسد تا زمانی که مهاجم بتواند macro.code را کنترل کند، شانس خوبی برای فعال کردن تزریق کد دارد. اکنون می‌توانید با رویکرد تحلیل چاهک-به-منبع (Sink-to-Source) به عقب حرکت کنید.

در کد بک‌اندِ قالب‌بندی‌شده و باز‌شده، compileMacroFunction در تابع runMacroOnChangeSet فراخوانی می‌شود:

\`\`\`javascript
function runMacroOnChangeSet(
❶    macro,
    selectedCells,
    changeSet,
    display,
    useRowIndexInsteaOfCondition
) {
    var _a;
    const errors = [];
❷    const compiledMacroFunc = compileMacroFunction(macro, errors);
\`\`\`

این تابع آرگومان macro ❶ را می‌گیرد که سرانجام بدون هیچ تغییری به تابع compileMacroFunction ❷ پاس داده می‌شود. اما اگر در کد قالب‌بندی‌شده، runMacroOnChangeSet را جستجو کنید نتیجه‌ای نمی‌گیرید؛ یعنی مسیر چاهک-به-منبع وجود ندارد. اگر در کد باز‌شده جستجو کنید، می‌بینید که در چند فایل .svelte فراخوانی شده — فایل‌هایی که به‌عنوان بخشی از فریمورک فرانت‌اند Svelte برای تعریف مؤلفه‌های فرانت‌اند استفاده می‌شوند. برای مثال، در TableDataGrid.svelte استفاده شده است:

\`\`\`javascript
❶function handleRunMacro(macro, params, cells) {
❷    const newChangeSet = runMacroOnChangeSet(macro, params, cells,
        changeSetState?.value, display, false);
    if (newChangeSet) {
        dispatchChangeSet({ type: 'set', value: newChangeSet });
    }
}
$: reference = config.reference;
$: childConfig = config.childConfig;
</script>
<VerticalSplitter isSplitter={!!reference}>
    <svelte:fragment slot="1">
        <DataGrid
            {...$$props}
            gridCoreComponent={SqlDataGridCore}
            formViewComponent={SqlFormView}
            {display}
            showReferences
            showMacros
            hasMultiColumnFilter
❸            onRunMacro={handleRunMacro}
\`\`\`

در اینجا مؤلفه فرانت‌اند، تابع handleRunMacro را تعریف می‌کند که آرگومان macro ❶ را می‌گیرد و مستقیماً به runMacroOnChangeSet ❷ پاس می‌دهد. این تابع توسط هندلر onRunMacro ❸ فعال می‌شود که وقتی کاربر از فرانت‌اند با کلیک روی دکمه، ماکرو را اجرا کند، فراخوانی می‌شود.

این به نظر یک مسیر قابل قبول چاهک-به-منبع می‌رسد، اما هیجان‌انگیز نیست. در نهایت، اگر کاربر باید خودش Payload ماکرو را وارد کند و برای فعال‌سازی، دکمه‌ای را کلیک کند، بیشتر شبیه اجرای کدِ خودخواسته با تعامل قابل توجه کاربر است. با این وجود، این ممکن است مکان خوبی برای کاویدن عمیق‌ترِ الگوهای کد آسیب‌پذیر مشابه باشد.


#### مهندسی معکوس یک برنامه پایتونی (Reverse Engineering a Python Application)

علاوه بر برنامه‌های Electron از نوع Node.js، برنامه‌های دیگر زبان‌ها مانند پایتون و روبی نیز می‌توانند در قالب فایل‌های اجرایی بسته‌بندی شوند. در نهایت، یکی از مزایای بزرگ زبان‌های اسکریپت‌نویسی همین قابل‌حمل بودن (Portability) است؛ برای اجرای بیشتر اسکریپت‌ها روی هر پلتفرمی، فقط به یک مفسر سازگار نیاز دارید. برنامه‌های Electron رایج‌ترین‌اند، اما همچنان مفید است که روش باز کردن سایر انواع برنامه‌ها مانند فایل‌های اجرایی PyInstaller را بدانید.

PyInstaller به توسعه‌دهندگان اجازه می‌دهد برنامه‌های پایتونی را در یک پکیج واحد بسته‌بندی کنند؛ مثلاً یک فایل اجرایی تک‌فایلی. پس از اجرای باینری، PyInstaller یک Bootloader را آغاز می‌کند که اسکریپت‌های کامپایل‌شده پایتون (.pyc) و کتابخانه‌های نیتیو را باز می‌کند و سپس اسکریپت اصلی را با مفسر پایتونِ بسته‌بندی‌شده اجرا می‌کند. این پکیج به‌روشی نسبتاً استاندارد ساخته می‌شود، شامل یک فهرست فهرست مطالب (Table of Contents) و فایل‌های آرشیو.

به‌طور کلی، داده آرشیو فشرده‌شده‌ای که به انتهای فایل اجرایی الصاق می‌شود شامل موارد زیر است:

- کتابخانه داینامیک پایتون، شامل مفسر
- اسکریپت اصلی پایتون
- آرشیو برنامه ZIP پایتون (معمولاً با نام PYZ-00.pyz) شامل اسکریپت‌های پایتون اضافی
- فایل‌های کتابخانه
- فایل‌های پشتیبان مانند Assets چندرسانه‌ای

مانند سایر فایل‌های اجرایی بسته‌بندی‌شده مبتنی بر اسکریپت، معمولاً می‌توانید یک فایل اجرایی PyInstaller را با بررسی رشته‌ها (Strings) یا هدرها شناسایی کنید:

\`\`\`bash
$ strings main.exe | grep pyinstaller
xpyinstaller-4.7.dist-info\\COPYING.txt
xpyinstaller-4.7.dist-info\\INSTALLER
xpyinstaller-4.7.dist-info\\METADATA
xpyinstaller-4.7.dist-info\\RECORD
xpyinstaller-4.7.dist-info\\REQUESTED
xpyinstaller-4.7.dist-info\\WHEEL
xpyinstaller-4.7.dist-info\\entry_points.txt
xpyinstaller-4.7.dist-info\\top_level.txt
$ strings ~/Downloads/main.exe | grep python
bpython310.dll
6python310.dll
\`\`\`

می‌توانید با ابزار داخلی PyInstaller یعنی pyi-archive_viewer و بررسی CArchive آن، مشخص کنید که آیا فایل اجرایی، از نوع PyInstaller است یا خیر. Galaxy Attack را در نظر بگیرید؛ یک بازی ساده PyInstaller با فایل اجرایی ویندوزی. فایل main.exe و کد منبع را از صفحه انتشار گیت‌هاب دانلود کنید (https://github.com/Amegma/Galaxy-Attack/releases/tag/v1.3.0). سپس PyInstaller را نصب و ابزار مشاهده آرشیو را اجرا کنید:

\`\`\`bash
$ pip install pyinstaller
$ pyinstaller -v
6.8.0
$ pyi-archive_viewer main.exe
pos, length, uncompressed, iscompressed, type, name
[(0, 217, 287, 1, 'm', 'struct'),
(217, 1018, 1754, 1, 'm', 'pyimod01_os_path'),
(1235, 4098, 8869, 1, 'm', 'pyimod02_archive'),
(5333, 7116, 16898, 1, 'm', 'pyimod03_importers'),
(12449, 1493, 3105, 1, 'm', 'pyimod04_ctypes'),
(13942, 833, 1372, 1, 's', 'pyiboot01_bootstrap'),
(14775, 466, 696, 1, 's', 'pyi_rth_inspect'),
(15241, 698, 1067, 1, 's', 'pyi_rth_pkgutil'),
(15939, 1187, 2154, 1, 's', 'pyi_rth_multiprocessing'),
(17126, 1999, 4202, 1, 's', 'pyi_rth_pkgres'),
(19125, 2103, 3574, 1, 's', 'main'),
--snip--
❶ (5175013, 1985630, 4471024, 1, 'b', 'python310.dll'),
(7160643, 13440, 25320, 1, 'b', 'select.pyd'),
(7174083, 405123, 1117936, 1, 'b', 'unicodedata.pyd'),
(7579206, 56136, 108544, 1, 'b', 'zlib1.dll'),
--snip--
(38446628, 12, 4, 1, 'x', 'pyinstaller-4.7.dist-info\\\\INSTALLER'),
(38446640, 2714, 7085, 1, 'x', 'pyinstaller-4.7.dist-info\\\\METADATA'),
(38449354, 13562, 56668, 1, 'x', 'pyinstaller-4.7.dist-info\\\\RECORD'),
(38462916, 8, 0, 1, 'x', 'pyinstaller-4.7.dist-info\\\\REQUESTED'),
(38462924, 104, 98, 1, 'x', 'pyinstaller-4.7.dist-info\\\\WHEEL'),
(38463028, 141, 361, 1, 'x', 'pyinstaller-4.7.dist-info\\\\entry_points.txt'),
(38463169, 20, 12, 1, 'x', 'pyinstaller-4.7.dist-info\\\\top_level.txt'),
❷ (38463189, 2076778, 2076778, 0, 'z', 'PYZ-00.pyz')]
\`\`\`

در میانه فهرست، python310.dll را می‌یابید ❶ که به شما می‌گوید نسخه پایتونِ استفاده‌شده توسط PyInstaller در این انتشار، نسخه 3.10 بوده است. با این حال، غیر از main و Assets چندرسانه‌ای، به نظر نمی‌رسد فایل کد منبعی وجود داشته باشد. زیرا آن‌ها در فایل ZlibArchive یعنی PYZ-00.pyz ❷ بسته‌بندی شده‌اند که می‌توانید در نشست تعاملی بررسی‌اش کنید:

\`\`\`text
? O PYZ-00.pyz
Contents of 'PYZ-00.pyz' (PYZ):
is_package, position, length, name
0, 17, 1893, '__future__'
0, 1910, 1651, '_aix_support'
0, 3561, 1388, '_bootsubprocess'
0, 4949, 2937, '_compat_pickle'
0, 7886, 2213, '_compression'
0, 10099, 5991, '_osx_support'
0, 16090, 2422, '_py_abc'
0, 18512, 51188, '_pydecimal'
0, 69700, 7845, '_strptime'
0, 77545, 2863, '_threading_local'
0, 80408, 25050, 'argparse'
0, 105458, 22331, 'ast'
1, 127789, 453, 'asyncio'
\`\`\`

می‌بینید که برخی نام ماژول‌ها با فایل‌های کد منبع اصلی مطابقت دارند و بقیه از ماژول‌های پشتیبانِ ایمپورت‌شده می‌آیند. models.button را استخراج و سپس از نشست تعاملی pyi-archive_viewer خارج شوید:

\`\`\`text
? X models.button
to filename? models.button.pyc
? q
\`\`\`

فایل استخراج‌شده یک فایل پایتون کامپایل‌شده است. اگر محتوای فایل را ببینید، عمدتاً به حروف بی‌معنا برخورد می‌کنید. زیرا فایل‌های پایتون کامپایل‌شده از بایت‌کد تشکیل شده‌اند نه کد منبع اصلی. این کار سریع‌تر اجرا می‌شود، زیرا به مفسر پایتون اجازه می‌دهد از پردازش کد متنی صرف‌نظر کند و دستورالعمل‌های سطح پایین‌تر را با بهینه‌سازی‌های بیشتری اجرا کند.

با این حال، وقتی بایت‌کد کامپایل‌شده را مستقیماً استخراج می‌کنید، بایت‌های جادویی (Magic Bytes) ابتدایی فایل ZlibArchive را از دست می‌دهید. این بایت‌ها با نسخه انتشار پایتون (شامل ۲ بایت) مطابقت دارند و سپس کاراکترهای carriage return و line feed (0D0A) می‌آیند. نسخه مهم است، زیرا هر نسخه جدید پایتون تغییراتی در مفسر ایجاد می‌کند که بر ساختار بایت‌کد کامپایل‌شده اثر می‌گذارد و نحوه دی‌کامپایل آن را تعیین می‌کند.

این بایت‌های جادویی غایب‌اند زیرا PyInstaller تنها یک نمونه از آن‌ها را نزدیک به ابتدای فایل ZlibArchive یعنی PYZ-00.pyz که فایل‌های .pyc فشرده را شامل می‌شود، نگه می‌دارد. برای مثال، ۱۶ بایت اول PYZ-00.pyz برابر است با 50595A00 6F0D0D0A 001F8838 00000000. چهار بایت اول که رشته ASCII یعنی PYZ را بازنمایی می‌کنند، به‌دنبالشان بایت‌های جادویی مورد نیاز شما آمده‌اند: 6F0D0D0A.

این بایت‌ها را به‌همراه ۱۲ بایت صفرِ Padding به ابتدای models.button.pyc اضافه کنید:

\`\`\`bash
$ echo -n -e '\\x6F\\x0D\\x0D\\x0A' > fixed.models.button.pyc
$ printf '\\x00%.0s' {1..12} >> fixed.models.button.pyc
$ cat models.button.pyc >> fixed.models.button.pyc
\`\`\`

پس از استخراج و آماده‌سازی فایل پایتون کامپایل‌شده، باید واقعاً آن را دی‌کامپایل کنید. میان دی‌کامپایلرهای متن‌باز مختلف، Decompyle++ تلاش می‌کند از بایت‌کد هر نسخه‌ای از پایتون پشتیبانی کند که مفید است، زیرا Galaxy Attack با نسخه جدیدتری کامپایل شده است. Decompyle++ را کلون و بیلد و سپس روی فایل پایتون کامپایل‌شده اصلاح‌شده اجرا کنید:

\`\`\`bash
$ git clone https://github.com/zrax/pycdc
$ cd pycdc
$ cmake .
$ make
$ make check
$ cd ..
$ pycdc/pycdc fixed.models.button.pyc
\`\`\`

اگر گام‌ها را درست انجام داده باشید، خروجی نسبتاً منسجمی می‌گیرید؛ همان‌طور که در فهرست ۴-۸ نشان داده شده است.

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
        pygame.draw.rect(config.CANVAS, self.outline_color,
            self.on_over_outline if self.outline == True else self.default_outline, 0, 7)
        pygame.draw.rect(config.CANVAS, self.color, inner_rect, 0, 6)
        if self.text != '':
            font = pygame.font.Font(Font.neue_font, 40)
            Assets.text.draw(self.text, font, Colors.WHITE,
                (pos[0] + size[0] / 2, pos[1] + size[1] / 2), True, True)
        return None ❶

    def isOver(self):
        return self.rect.collidepoint(pygame.mouse.get_pos())
\`\`\`

اگر خروجی را با فایل کد منبع اصلی یعنی models/button.py مقایسه کنید، می‌بینید که تنها تفاوت‌های جزئی (مانند یک return None اضافی ❶) در کد دی‌کامپایل‌شده وجود دارد. با تکرار این فرایند برای سایر فایل‌های پایتون کامپایل‌شده استخراج‌شده از فایل اجرایی PyInstaller، باید بتوانید تقریباً همان کد منبع اصلی را بازیابی کنید.

اگرچه نرم‌افزارهای واقعی که به‌شکل فایل اجرایی PyInstaller توزیع می‌شوند بسیار کمتر از برنامه‌های Electronاند، کار روی این مثال ساده به تشریح برخی الگوهای رایج در مهندسی معکوس نرم‌افزارهای نوشته‌شده به زبان‌های اسکریپت‌نویسی کمک می‌کند. حذف کامل حضور کد منبع — حتی اگر کامپایل، ترنسپایل یا به نحوی بسته‌بندی شده باشد — غیرممکن است. با این حال، میزان اتلاف اطلاعات می‌تواند تأثیر جدی بر سهولت تحلیل داشته باشد.

### بازنمایی‌های میانی (Intermediate Representations)

از نظر انتزاع (Abstraction)، بازنمایی‌های میانی میان کد ماشین و کد منبع قرار می‌گیرند. همان‌طور که از نامشان پیداست، بازنمایی‌های سطح‌بالاتری از کد منبع‌اند که توسط یک Runtime قابل تفسیر و اجراست.

استفاده از بازنمایی میانی مزایای متعددی دارد. برای مثال، Runtime می‌تواند بسیاری از کارهای روتین را بر عهده بگیرد؛ مانند مدیریت حافظه، زباله‌روبی (Garbage Collection) و مدیریت استثناها (Exception Handling) که توسعه‌دهندگان را آزاد می‌کند تا صرفاً بر ساخت برنامه تمرکز کنند بدون نیاز به افزودن همه این‌ها در کد منبعشان. بازنمایی‌های میانی می‌توانند بررسی نوع (Type Checking) یا دیباگ را برای Runtimeها آسان‌تر کنند و برنامه را مقاوم‌تر سازند.

اگرچه بایت‌کد کامپایل‌شده پایتون را می‌توان نوعی بازنمایی میانی در نظر گرفت، اما متفاوت از بازنمایی‌های میانی C# و جاوا عمل می‌کند که در این بخش تحلیل خواهید کرد. بایت‌کد پایتون در سطح انتزاع بالاتری نسبت به C# و جاوا کامپایل می‌شود که بازیابی کد منبع اصلی را آسان‌تر می‌کند. در حالی که مهندسی معکوس باینری‌های مبتنی بر اسکریپت بر استخراج و بازیابی تمرکز دارد، مهندسی معکوس باینری‌های بازنمایی میانی بر دی‌کامپایل و بازسازی تمرکز دارد.

اگرچه بایت‌کد پایتون همچنان توسط مفسر پایتون اجرا می‌شود، باینری‌های جاوا و #C (یا دقیق‌تر، .NET) در محیط‌های Runtime ماشین مجازی خودشان اجرا می‌شوند. یک فایل کلاس جاوا باید بتواند در هر سیستم‌عاملی اجرا شود، تا زمانی که یک ماشین مجازی جاوا (JVM) سازگار موجود باشد. این موضوع مهندسی معکوس آن را نسبت به باینری‌های کامپایل‌شده به کد ماشین — که مجموعه دستورالعمل‌ها و معماری‌های خاصی را هدف می‌گیرند — آسان‌تر می‌کند.

در نهایت، ویژگی دیگر باینری‌های بازنمایی میانی این است که معمولاً شامل متادیتای اضافی‌ای هستند که پیکربندی محیط Runtime را تحت تأثیر قرار می‌دهد. برای مثال، فرمت فایل بسته Java Archive (JAR) شامل Manifestی است که به JVM می‌گوید کدام کلاس متناظر با نقطه ورود برنامه است، چه وابستگی‌هایی لازم است و سایر اطلاعات مهم. به همین ترتیب، باینری‌های .NET — که به آن‌ها Assembly هم می‌گویند — شامل Manifestی هستند با متادیتایی مانند شماره نسخه، فایل‌های شامل‌شده و ارجاع‌ها. Assemblyها همچنین متادیتایی درباره هر نوع (Type) و عضو (Member) که استفاده می‌کنند شامل می‌شوند که برای دی‌کامپایل فوق‌العاده مفید است.

شناسایی بازنمایی‌های میانی مهم است، زیرا به شما اجازه می‌دهد روشی سرراست‌تر برای مهندسی معکوس و دی‌کامپایل به کار ببرید که خروجی دقیق‌تری می‌دهد. اطلاعات حفظ‌شده در قالب نوع آرگومان‌های مورد انتظار، کلاس‌ها و متغیرها فوق‌العاده ارزشمند است و می‌تواند ساعت‌ها تحلیل را صرفه‌جویی کند. با این حال، ممکن است با چالش بزرگ بالشت‌سازی (Obfuscation) که صریحاً برای جلوگیری از مهندسی معکوس طراحی شده نیز روبه‌رو شوید. این ممکن است شما را مجبور کند استراتژی‌های تحلیل داینامیک را به کار ببرید (که در فصل بعد بررسی خواهیم کرد).

مانند بخش قبلی، مهندسی معکوس باینری‌های بازنمایی میانی را از طریق دو مثال متن‌باز بررسی خواهیم کرد. مطابق با موضوع مثال‌های قبلی، این‌ها هم به‌ترتیب یک کلاینت دیتابیس و یک بازی‌اند. برای #C روی LiteDB Studio کار خواهید کرد و برای جاوا، Pixel Wheels.


#### Assemblyهای Common Language Runtime (Common Language Runtime Assemblies)

پلتفرم توسعه متن‌باز .NET برای ساخت برنامه‌هایی است که با #C، F# و Visual Basic نوشته می‌شوند. بنیاد کلیدی .NET یعنی Common Language Runtime (CLR) است که دستورالعمل‌های بازنمایی میانی CIL (Common Intermediate Language) را اجرا می‌کند. برای اجرای واقعی کد، CLR با کامپایل Just-in-Time یا Ahead-of-Time، CIL را به دستورالعمل‌های مخصوص پردازنده تبدیل می‌کند.

باینری‌های .NET به‌شکل Assembly توزیع می‌شوند که می‌توانند به فرمت .exe یا .dll باشند. فرمت Assembly عملاً یک گسترش از فرمت Portable Executable است و درون ساختار استاندارد PE پنهان شده است. پس از هدرهای PE، باینری شامل داده‌های مخصوص CLR است:

- **Manifest مونتاژ (Assembly Manifest):** متادیتای Assembly
- **متادیتای نوع (Type Metadata):** جدول‌های متادیتا که انواع و اعضای استفاده‌شده در Assembly را تعریف می‌کنند
- **کد CIL:** کد زبان میانی واقعی که در CLR اجرا می‌شود
- **منابع (Resources):** Assetهایی مانند تصاویر، پیکربندی و سایر داده‌ها
- **امضای نام قوی (Strong Name Signature):** امضای دیجیتال اختیاری برای تأیید Assembly

می‌توانید این را با تحلیل LiteDB Studio بررسی کنید؛ یک رابط گرافیکی برای مشاهده و ویرایش فایل‌های دیتابیس LiteDB. از آنجا که فایل اجرایی برای ویندوز کامپایل شده و ابزارهای مهندسی معکوس آن عمدتاً مبتنی بر ویندوزند، اگر ممکن است گام‌های شرح‌داده‌شده در اینجا را روی ویندوز انجام دهید. اگر این گزینه ممکن نیست، اجرای این ابزارها روی پلتفرم‌های دیگر با درجات متفاوتی از دشواری ممکن است.

باینری LiteDB Studio را از https://github.com/mbdavid/LiteDB.Studio/releases/download/v1.0.3/LiteDB.Studio.exe دانلود کنید. می‌توانید از ابزار PE-Bear برای مشاهده برخی پراپرتی‌های Assembly استفاده کنید؛ آخرین نسخه را از https://github.com/hasherezade/pe-bear/releases دانلود کنید.

همان‌طور که از نامش پیداست، PE-Bear فایل‌های PE را پردازش و دی‌اسمبل می‌کند و حتی از Assemblyهای .NET پشتیبانی می‌کند. غیر از هدرهای استاندارد PE، باید یک تب .NET Hdr در پنجره اصلی ببینید که متناظر با Manifest مونتاژ است. درون این تب، می‌توانید متادیتای مخصوص CLR مانند MajorRuntimeVersion، آدرس‌های مجازی و اندازه جریان‌های متادیتای دیگر — شامل Metadata (متادیتای نوع)، Resources و StrongNameSignature — را مشاهده کنید. آدرس مجازی و اندازه StrongNameSignature صفر است، یعنی هیچ امضای نام قوی برای این Assembly تنظیم نشده است.

توجه به هدر .NET که در بخش .text فایل PE پس از هدرهای استاندارد PE شروع می‌شود اهمیت دارد؛ این موضوع این واقعیت را تقویت می‌کند که Assemblyهای .NET در واقع گسترشی از فرمت فایل PE هستند. اگر مقدار raw address بخش .text را در تب Section Hdrs بررسی کنید، می‌بینید که با اولین آفست در تب .NET Hdr مطابقت دارد. با این حال، نمی‌توانید هدرهای .NET را بیشتر از این با PE-Bear تحلیل کنید.

مشاهده hex dump جریان‌های Metadata یا Resources چند رشته آشنا و بایت‌های غیرASCII زیادی را نشان می‌دهد. برای مثال، ابتدای جدول متادیتا چنین است:

\`\`\`text
0000000042 53 4a 42 01 00 01 00 00 00 00 00 0c 00 00 00 |BSJB............|
0000001076 34 2e 30 2e 33 30 33 31 39 00 00 00 00 05 00 |v4.0.30319......|
000000206c 00 00 00 5c ba 02 00 23 53 74 72 69 6e 67 73 |l...\\º..#Strings|
0000003000 00 00 00 c8 ba 02 00 24 2b 02 00 23 55 53 00 |....Èº..$+..#US.|
00000040ec e5 04 00 d6 3a 02 00 23 42 6c 6f 62 00 00 00 |ìå..Ö:..#Blob...|
00000050c4 20 07 00 10 00 00 00 23 47 55 49 44 00 00 00 |Ä ......#GUID...|
00000060d4 20 07 00 c8 4a 08 00 23 7e 00 00 00 49 6d 6d |Ô ..ÈJ..#~...Imm|
0000007047 65 74 44 65 66 61 75 6c 74 49 4d 45 57 6e 64 |GetDefaultIMEWnd|
0000008000 53 65 6e 64 4d 65 73 73 61 67 65 00 43 72 65 |.SendMessage.Cre|
\`\`\`

این بایت‌ها باید به روشی مخصوص فرمت Assembly .NET پردازش شوند. به‌جای انجام دستی این کار، می‌توانید به ابزارهایی پناه ببرید که این کار را برایتان می‌کنند. همان‌طور که اشاره شد، چندین زبان برنامه‌نویسی سطح‌بالا می‌توانند به CIL کامپایل شوند؛ یک زبان بایت‌کد که توسط CLR تفسیر می‌شود. CIL مجموعه دستورالعملی شیءگرا و مبتنی بر پشته (Stack-Based) است که به پردازنده خاصی وابسته نیست. می‌توانید هر Assembly .NET را با ابزار IL Disassembler که همراه Visual Studio می‌آید، به CIL دی‌اسمبل کنید.

اگر Visual Studio را روی ویندوز نصب نکرده‌اید، آن را همراه با ابزارهای .NET Framework نصب کنید تا به IL Disassembler دسترسی داشته باشید. پس از نصب، باید بتوانید آن را با ildasm.exe در Visual Studio Developer Command Prompt اجرا کنید. به‌عنوان یک تست سریع، کد #C فهرست ۴-۹ را در Visual Studio با قالب Console App (.NET Framework) کامپایل کنید.

\`\`\`csharp
Program.cs
using System;

public class Hello
{
    public static void Main(String[] args)
    {
        Console.WriteLine("Hello World!");
    }
}
\`\`\`

*فهرست ۴-۹: یک برنامه نمونه .NET Framework*

پنل خروجی در Visual Studio را بررسی کنید تا محل خروجی بیلد را پیدا کنید. سپس Visual Studio Developer Command Prompt را باز و فایل را با IL Disassembler دی‌اسمبل کنید:

\`\`\`text
> ildasm.exe /out=disassembled.il C:\\repos\\ConsoleApp1\\ConsoleApp1\\bin\\Debug\\ConsoleApp1.exe
\`\`\`

فایل CIL دی‌اسمبل‌شده باید شبیه این خروجی کوتاه‌شده باشد:

\`\`\`text
// Metadata version: v4.0.30319
.assembly extern mscorlib ❶
{
  .publickeytoken = (B7 7A 5C 56 19 34 E0 89 )
  .ver 4:0:0:0
}
.assembly ConsoleApp1 ❷
{
  --snip--
}
.module ConsoleApp1.exe ❸
// MVID: {796768DC-788B-4A50-85E3-0615D98C7C6D}
.imagebase 0x00400000
.file alignment 0x00000200
.stackreserve 0x00100000
.subsystem 0x0003 // WINDOWS_CUI
.corflags 0x00020003 // ILONLY 32BITPREFERRED
// Image base: 0x00000274A3D40000
// =============== CLASS MEMBERS DECLARATION ===================
.class public auto ansi beforefieldinit Hello ❹
    extends [System.Runtime]System.Object
{
    .method public hidebysig static void Main(string[] args) cil managed ❺
    {
        .entrypoint
        .custom instance void System.Runtime.CompilerServices.
            NullableContextAttribute::.ctor(uint8) = ( 01 00 01 00 00 )
        // Code size 11 (0xb)
        .maxstack 8
        IL_0000: ldstr "Hello World!"
        IL_0005: call void [System.Console]System.Console::
            WriteLine(string)
        IL_000a: ret
    } // end of method Hello::Main
    .method public hidebysig specialname rtspecialname ❻
        instance void .ctor() cil managed
    {
        // Code size 7 (0x7)
        .maxstack 8
        IL_0000: ldarg.0
        IL_0001: call instance void [System.Runtime]System.Object::.ctor()
        IL_0006: ret
    } // end of method Hello::.ctor
} // end of class Hello
\`\`\`

کد CIL با اعلان‌های Assembly خارجی ❶ شروع می‌شود. توجه کنید که از دایرکتیو .publickeytoken برای شناسایی یکتای Assemblyهای ایمپورت‌شده از طریق نام قوی (Strong Name) و اطمینان از استفاده نسخه صحیح، استفاده شده است. سپس خودِ Assembly اعلان می‌شود ❷. پس از آن اعلان ماژول ❸ می‌آید که شامل اتریبیوت‌های مهمی مانند آدرس پایه تصویر (Image Base) و محیط اجرای برنامه است.

اعلان واقعی کلاس ❹ شامل اعلان متدِ تابع Main که شما تعریف کردید ❺ و متد سازنده ضمنی ❻ است. دستورالعمل‌های واقعی CIL به‌ظاهر نسبتاً سرراست‌اند، با عملیاتی مانند ldstr و call. اما وقتی به برنامه‌های پیچیده‌تری مانند LiteDB Studio برسید، خواندن این‌ها به‌تنهایی آن‌قدرها هم ساده نخواهد بود.

اگر ildasm.exe را بدون پارامتر /out اجرا کنید، یک رابط گرافیکی باز می‌شود که Assembly را به‌شکل درخت نمایش می‌دهد. این برای مهندسی معکوس طولانی خیلی ابتدایی است. در عوض می‌توانید به ILSpy سوئیچ کنید؛ یک دی‌کامپایلر متن‌باز برای Assemblyهای .NET. آخرین نصب‌کننده را از https://github.com/icsharpcode/ILSpy/releases دانلود و فایل LiteDB.Studio.exe را با آن باز کنید.

ILSsp به‌طور خودکار هدرهای .NET را پردازش و اطلاعات را در صفحه اولیه هنگام بارگذاری Assembly نمایش می‌دهد:

\`\`\`csharp
// C:\\Users\\Default\\Downloads\\LiteDB.Studio.exe
// LiteDB.Studio, Version=1.0.3.0, Culture=neutral, PublicKeyToken=null
// Global type: <Module>
// Entry point: LiteDB.Studio.Program.Main ❶
// Architecture: AnyCPU (32-bit preferred)
// Runtime: v4.0.30319
// Hash algorithm: SHA1
using System.Diagnostics;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Runtime.Versioning;
[assembly: CompilationRelaxations(8)]
[assembly: RuntimeCompatibility(WrapNonExceptionThrows = true)]
[assembly: Debuggable(DebuggableAttribute.DebuggingModes.IgnoreSymbolStoreSequencePoints)]
[assembly: AssemblyTitle("LiteDB.Studio")]
[assembly: AssemblyDescription("A GUI tool for LiteDB v5")]
[assembly: AssemblyConfiguration("")]
[assembly: AssemblyCompany("LiteDB")]
[assembly: AssemblyProduct("LiteDB.Studio")]
[assembly: AssemblyCopyright("MIT")]
[assembly: AssemblyTrademark("")]
[assembly: Guid("0002e0ff-c91f-4b8b-b29b-2a477e184408")]
[assembly: AssemblyFileVersion("1.0.3.0")]
[assembly: TargetFramework(".NETFramework,Version=v4.7.2", FrameworkDisplayName = ".NET Framework 4.7.2")]
[assembly: ComVisible(false)]
[assembly: AssemblyVersion("1.0.3.0")]
\`\`\`

یک قطعه اطلاعات کلیدی در اینجا، نقطه ورود ❶ است که می‌توانید در ILSpy روی آن کلیک کنید تا به متد دی‌کامپایل‌شده برسید.

یکی از مفیدترین قابلیت‌های ILSpy، تابع Analyze است که با راست‌کلیک روی نام هر عضو در دسترس است. این کار درختی را نشان می‌دهد شامل سایر اعضایی که از آن استفاده می‌کنند یا مورد استفاده آن قرار می‌گیرند — که برای تحلیل چاهک-به-منبع فوق‌العاده مفید است. برای مثال، اگر LiteDB.Studio.MainForm.ExecuteSql را به‌عنوان یک چاهک آسیب‌پذیر بالقوه شناسایی کنید، می‌توانید با قابلیت Analyze بفهمید که پنج متد دیگر از آن استفاده می‌کنند. سپس می‌توانید درخت تودرتوی Used By را دنبال کنید تا به نیای مناسبی برسید.

البته محدود به رابط کاربری ILSpy نیستید. همچنین می‌توانید روی Assembly در نوار کناری چپ راست‌کلیک و Save Code را انتخاب کنید تا کد منبع دی‌کامپایل‌شده را Export کنید. از آنجا می‌توانید ابزارهای تحلیل خودکار کد را اجرا یا بازبینی کد دستی انجام دهید. می‌توانید کد منبع را در یک IDE باز کنید که ابزارهای تحلیل مشابه ILSpy فراهم می‌کند. دی‌کامپایلرهای دیگر مانند JetBrains dotPeek و dnSpyEx نیز همراه با دیباگرهایی می‌آیند که تحلیل داینامیک Assemblyهای .NET را انجام می‌دهند.


#### بایت‌کد جاوا (Java Bytecode)

مشابه CIL در .NET Framework، جاوا نیز از بازنمایی میانی استفاده می‌کند که توسط یک Runtime مشترک اجرا می‌شود — در این مورد، پلتفرم JVM. مانند CIL، بایت‌کد جاوا هم مجموعه دستورالعمل سطح‌بالاتری نسبت به کد ماشین دارد، اما برخلاف CIL، بایت‌کد جاوا از رجیسترها نیز به‌شکل آرایه متغیر محلی (Local Variable Array) استفاده می‌کند. در عمل، بیشتر با باینری‌های جاوا روبه‌رو می‌شوید که به‌شکل فایل Java Archive با پسوند .jar توزیع شده‌اند.

مانند Assemblyهای .NET، فایل‌های JAR هم بایت‌کد (فایل‌های کلاس جاوا)، منابع و متادیتا را در یک فایل واحد بسته‌بندی می‌کنند. با این حال، در حالی که فرمت PE باینری‌های .NET را در بر می‌گیرد، فایل‌های JAR مبتنی بر ZIPاند و می‌توانید آن‌ها را با هر برنامه استخراج آرشیو باز کنید. این می‌تواند اجرایشان کمی غیرشهودی‌تر باشد، زیرا باید با فایل اجرایی جاوا اجرا شوند نه به‌طور مستقیم.

می‌توانید برخی تفاوت‌های میان CIL و بایت‌کد جاوا را با تطبیق دادن برنامه نمونه «Hello World» به جاوا مشاهده کنید؛ مطابق فهرست ۴-۱۰.

\`\`\`java
Hello.java
class Hello {
    public static void main(String[] args) {
        System.out.println("Hello World!");
    }
}
\`\`\`

*فهرست ۴-۱۰: یک برنامه نمونه جاوا*

کیت توسعه جاوا (JDK) را نصب، برنامه را به فایل کلاس جاوا کامپایل و سپس اجرا کنید:

\`\`\`bash
$ sudo apt install default-jdk
$ javac Hello.java
$ java Hello
Hello World!
\`\`\`

سپس دی‌اسمبلر داخلی جاوا را با پرچم‌هایی اجرا کنید که همه کلاس‌ها و اعضا را به‌همراه اطلاعاتی اضافی درباره پشته نمایش می‌دهند:

\`\`\`java
$ javap -p -v Hello.class
Classfile Hello.class
Last modified 30 May 2023; size 416 bytes
SHA-256 checksum 4f0ee00df8e3ff6d3cdf8cac7ad765819369ee1602b15e9a2a2b67076fb36e44
Compiled from "Hello.java"
class Hello ❶
    minor version: 0
    major version: 63
    flags: (0x0020) ACC_SUPER
    this_class: #21     // Hello
    super_class: #2     // java/lang/Object
    interfaces: 0, fields: 0, methods: 2, attributes: 1
Constant pool: ❷
    #1 = Methodref  #2.#3     // java/lang/Object."<init>":()V
    #2 = Class      #4        // java/lang/Object
    #3 = NameAndType #5:#6    // "<init>":()V
    #4 = Utf8       java/lang/Object
    #5 = Utf8       <init>
    #6 = Utf8       ()V
    #7 = Fieldref   #8.#9     // java/lang/System.out:Ljava/io/PrintStream;
    #8 = Class      #10       // java/lang/System
    #9 = NameAndType #11:#12  // out:Ljava/io/PrintStream;
    #10 = Utf8      java/lang/System
    #11 = Utf8      out
    #13 = String    #14       // Hello World!
    #14 = Utf8      Hello World!
    #15 = Methodref #16.#17   // java/io/PrintStream.println:(Ljava/lang/String;)V
    #16 = Class     #18       // java/io/PrintStream
    #17 = NameAndType #19:#20 // println:(Ljava/lang/String;)V
    #18 = Utf8      java/io/PrintStream
    #19 = Utf8      println
    #20 = Utf8      (Ljava/lang/String;)V
    #21 = Class     #22       // Hello
    #22 = Utf8      Hello
    #23 = Utf8      Code
    #24 = Utf8      LineNumberTable
    #25 = Utf8      main
    #26 = Utf8      ([Ljava/lang/String;)V
    #27 = Utf8      SourceFile
    #28 = Utf8      Hello.java
{
    Hello();
        descriptor: ()V
        flags: (0x0000)
        Code:
            stack=1, locals=1, args_size=1
            0: aload_0
            1: invokespecial #1 // Method java/lang/Object."<init>":()V
            4: return
        LineNumberTable:
            line 1: 0
    public static void main(java.lang.String[]); ❸
        descriptor: ([Ljava/lang/String;)V
        flags: (0x0009) ACC_PUBLIC, ACC_STATIC
        Code:
            stack=2, locals=1, args_size=1
            0: getstatic #7
            3: ldc #13
            5: invokevirtual #15
            8: return
        LineNumberTable:
            line 3: 0
            line 4: 8
}
SourceFile: "Hello.java"
\`\`\`

همراه با دستورالعمل‌های واقعی بایت‌کد، فایل کلاس شامل اطلاعات اضافی است، از جمله متادیتای کلاس ❶، استخر ثابت‌ها (Constant Pool) ❷ و متدها ❸.

با تحلیل متادیتا و دستورالعمل‌ها، دی‌کامپایلرها می‌توانند تخمینی از کد منبع اصلی بسازند. البته چون دی‌کامپایل، معکوسِ کامپایل از کد منبع به بازنمایی میانی است، خروجی دی‌کامپایل ممکن است تطابق کامل با کد اصلی نداشته باشد. برای مثال، به‌جای ایمپورت متغیرها از کلاس‌های دیگر، بازنمایی میانی ممکن است مقدار حل‌شده (Resolved) متغیر را مستقیماً شامل شود.

می‌توانید این را با مهندسی معکوس Pixel Wheels تأیید کنید؛ یک بازی مسابقه‌ای Top-Down نوشته‌شده به جاوا و توزیع‌شده برای لینوکس، macOS، ویندوز و اندروید. فایل pixelwheels-0.24.2-linux64.zip را از https://github.com/agateau/pixelwheels/releases/tag/0.24.2 دانلود کنید. پس از استخراج، باینری pixelwheels را به‌همراه فایل pixelwheels.jar می‌یابید. مانند مثال PyInstaller که قبلاً دیدیم، صرف اجرای strings روی باینری سرنخ‌های بزرگی می‌دهد:

\`\`\`text
$ strings pixelwheels
--snip--
/lib/server/libjvm.so ❶
/lib/amd64/server/libjvm.so
/lib/i386/server/libjvm.so
JNI_GetDefaultJavaVMInitArgs
JNI_CreateJavaVM
/proc/self/exe
*Z4mainEUlSt8functionIFPvS0_EERK14JavaVMInitArgsE_
void sajson::value::assert_type(sajson::type) const
/storage/gitlab-runner/builds/HVzmC8hq/0/NimblyGames/packr/PackrLauncher/src/main/headers/sajson.h ❷
Error: failed to create Java VM!
\`\`\`

چند رشته مرتبط با جاوا اینجا هست که قویاً نشان می‌دهد این باینری ممکن است صرفاً یک Wrapper دور فایل JAR باشد ❶. علاوه بر این، ارجاع جالبی به «PackrLauncher» ❷ وجود دارد که جستجوی سریع مشخص می‌کند یک بسته‌بندِ فایل اجرایی نیتیو برای فایل‌های JAR است (https://github.com/libgdx/packr)؛ این تأیید می‌کند که باید تلاش‌تان را روی فایل JAR متمرکز کنید.

نخست، یک دی‌کامپایلر برای باینری جاوا انتخاب کنید. چند گزینه رایگان یا متن‌باز موجود است؛ مانند Fernflower در IntelliJ IDEA، Procyon و JD-GUI. اگرچه Fernflower به‌روزتر از JD-GUI است، دومی — همان‌طور که از نامش پیداست — با رابط کاربری‌ای می‌آید که امکان کاوش سریع روابط میان کلاس‌ها و اعضای مختلف را می‌دهد؛ مشابه ILSpy. Fernflower و Procyon ابزارهای خط فرمان‌اند، پس برای چنین قابلیتی باید خروجی را در یک IDE جاوا جداگانه (مانند IntelliJ IDEA) بررسی کنید.

فعلاً، از آنجا که فقط خروجی دی‌کامپایلرها را با کد منبع اصلی مقایسه می‌کنید، می‌توانید از Fernflower استفاده کنید. آن را از https://mvnrepository.com/artifact/com.jetbrains.intellij.java/java-decompiler-engine با انتخاب آخرین نسخه و دانلود فایل JAR مربوطه بگیرید.

فایل JAR دی‌کامپایلر (به java-decompiler-engine.jar تغییر نام دهید) و pixelwheels.jar را در یک دایرکتوری قرار و دی‌کامپایل را با دستورات زیر انجام دهید:

\`\`\`bash
$ mkdir output
$ java -jar java-decompiler-engine.jar pixelwheels.jar output/
\`\`\`

پس از چند ثانیه، فایل جدیدی به نام pixelwheels.jar در دایرکتوری خروجی ساخته می‌شود. آن را استخراج کنید تا کد منبع دی‌کامپایل‌شده را بگیرید.

شاید سخت باشد بدانید از کجا شروع کنید. فایل‌ها و دایرکتوری‌های منبع متعددی مانند musics وجود دارد، در حالی که فایل‌های جاوا در دایرکتوری‌های مختلفی مانند com و javazoom ظاهر می‌شوند.

مکان خوبی برای شروع، بررسی فایل Manifest در META-INF/MANIFEST.MF است که به شما می‌گوید کلاس اصلی com.agateau.pixelwheels.desktop.DesktopLauncher است. این شما را به فایل کد منبع جاوای متناظر در com/agateau/pixelwheels/desktop/DesktopLauncher.java می‌برد. اکنون نقطه ورودی مناسبی برای تحلیل کد منبع دی‌کامپایل‌شده دارید.

خروجی دی‌کامپایل‌شده تطابق نسبتاً خوبی با کد منبع اصلی دارد که می‌توانید از صفحه انتشار بازیابی کنید. برای مثال، غیر از کامنت‌ها و فاصله‌های اضافی، تنها تفاوت جدی این دو در DesktopLauncher.java، استفاده از مقادیر ثابتِ ایمپورت‌شده است.

برای مشاهده اینکه چه حجمی از اطلاعات هنگام کامپایل به بازنمایی میانی و دی‌کامپایل بعدی از دست می‌رود، به کد منبع اصلی DesktopLauncher.java نگاهی بیندازید. به‌طور خاص، کد تابع setupLogging را ببینید که در فهرست ۴-۱۱ آمده است.

\`\`\`java
private static void setupLogging(PwGame game) {
    String cacheDir = FileUtils.getDesktopCacheDir();
    File file = new File(cacheDir);
    if (!file.isDirectory() && !file.mkdirs()) {
        System.err.println(
            StringUtils.format(
                "Can't create cache dir %s, won't be able to log to a file", cacheDir));
        return;
    }
    String logFilePath = cacheDir + File.separator + Constants.LOG_FILENAME; ❶
    LogFilePrinter printer = new LogFilePrinter(logFilePath, Constants.LOG_MAX_SIZE);
    NLog.addPrinter(printer);
    NLog.addPrinter(new SystemErrPrinter());
    game.setLogExporter(new DesktopLogExporter(printer));
}
\`\`\`

*فهرست ۴-۱۱: کد اصلی setupLogging*

در این کد منبع اصلی، Constants.LOG_FILENAME ایمپورت و هنگام ساخت رشته logFilePath ❶ استفاده می‌شود. حالا کد منبع دی‌کامپایل‌شده را در فهرست ۴-۱۲ ببینید.

\`\`\`java
private static void setupLogging(PwGame game) {
    String cacheDir = FileUtils.getDesktopCacheDir();
    File file = new File(cacheDir);
    System.err.println(StringUtils.format(
        "Can't create cache dir %s, won't be able to log to a file", cacheDir));
    } else {
        String logFilePath = cacheDir + File.separator + "pixelwheels.log"; ❶
        LogFilePrinter printer = new LogFilePrinter(logFilePath, 1048576L);
        NLog.addPrinter(printer);
        NLog.addPrinter(new SystemErrPrinter());
        game.setLogExporter(new DesktopLogExporter(printer));
    }
}
\`\`\`

*فهرست ۴-۱۲: کد دی‌کامپایل‌شده setupLogging*

به‌جای ایمپورت متغیر از Constants، کد از یک رشته لفظی (Literal) یعنی "pixelwheels.log" ❶ استفاده می‌کند. به‌عنوان بخشی از فرایند بهینه‌سازی در کامپایل به بایت‌کد جاوا، به نظر می‌رسد متغیر ایمپورت‌شده حل شده و در استخر ثابت محلی قرار گرفته است. می‌توانید این را با دی‌کامپایل کردن com/agateau/pixelwheels/desktop/DesktopLauncher.class با javap تأیید کنید:

\`\`\`text
private static void setupLogging(com.agateau.pixelwheels.PwGame);
    descriptor: (Lcom/agateau/pixelwheels/PwGame;)V
    flags: (0x000a) ACC_PRIVATE, ACC_STATIC
    Code:
        stack=6, locals=5, args_size=1
        0: invokestatic #23
        3: astore_1
        4: new #24      // Class java/io/File
        7: dup
        8: aload_1
        9: invokespecial #25 // Method java/io/File."<init>":(Ljava/lang/String;)V
        12: astore_2
        13: aload_2
        14: invokevirtual #26 // Method java/io/File.isDirectory:()Z
        17: ifne 47
        20: aload_2
        21: invokevirtual #27 // Method java/io/File.mkdirs:()Z ❶
        24: ifne 47
        --snip--
        64: ldc #38       // String pixelwheels.log ❷
        66: invokevirtual #35 // Method java/lang/StringBuilder.append:(Ljava/lang/String;)Ljava/lang/StringBuilder;
\`\`\`

بدون تخصص خاص در خواندن بایت‌کد جاوا، همچنان می‌توانید خروجی را با کد منبع اصلی تطبیق دهید. برای مثال، متد File.mkdirs فراخوانی شده و پس از آن دستور جهش شرطی ifne ❶ آمده که متناظر با شرط if-else در کد منبع است. سرانجام، رشته "pixelwheels.log" با دستور ldc از استخر ثابت با اندیس #38 ❷ بارگذاری و با متد StringBuilder.append فراخوانی می‌شود.

پس از دی‌کامپایل کد منبع، می‌توانید با اعمال استراتژی‌های بازبینی کدی که در فصل‌های قبلی آموختید، آن را تحلیل کنید — با این تذکر که همیشه نباید خروجی دی‌کامپایل‌شده را همان‌طور که هست بپذیرید. برای مثال، اگر تحلیل سطح حمله را روی کد انجام دهید، ممکن است کلاس جالبی به نام RemoteInput در com/badlogic/gdx/input/RemoteInput.java ببینید که پورت پیش‌فرض 8190 را باز می‌کند. با این حال، این کد واقعاً در جای دیگری از برنامه استفاده نشده است — شاید چون توسعه‌دهنده تصمیم گرفته قابلیت بازی راه‌دور را فعال نکند.

### کد ماشین (Machine Code)

کد ماشین پایین‌ترین سطح انتزاع میان سه دسته باینریِ بررسی‌شده در این فصل است. مانند باینری‌ها به‌طور کلی، حتی باینری‌های کد ماشین هم یکسان ساخته یا کامپایل نمی‌شوند. زبان‌های برنامه‌نویسی مانند ++C، Golang و Rust به روش‌های مختلفی به کد ماشین کامپایل می‌شوند و این تفاوت‌ها می‌توانند به‌شکل جدی بر سهولت مهندسی معکوس آن‌ها اثر بگذارند.

فعلاً، به‌جای کار با نرم‌افزار واقعی نوشته‌شده توسط توسعه‌دهندگان دیگر، می‌توانید این تفاوت‌ها را از نزدیک با تنظیمات مختلف کامپایلر که خودتان تغییر می‌دهید، بررسی کنید.

چند بار به کد ماشین اشاره کردم، اما دقیقاً چیست؟ کد ماشین از دستورالعمل‌های باینری تشکیل شده که می‌توانند مستقیماً توسط CPU اجرا شوند و به مجموعه دستورالعمل (Instruction Set) CPU وابسته‌اند. نکته مهمی که باید به یاد داشته باشید این است که کد ماشین همان کد اسمبلی نیست. کد اسمبلی، بازنمایی خوانا برای انسان یا متنی از کد ماشین است. با توجه به رابطه نزدیک کد ماشین و اسمبلی، اغلب برای مهندسی معکوس باینری‌هایی که به کد ماشین کامپایل شده‌اند، به زبان اسمبلی متکی خواهید بود، زیرا دیگر نمی‌توان آن‌ها را به فایل‌های کد منبع اصلی دی‌کامپایل کرد.

با تطبیق الگوهای رایج در کد ماشین و اسمبلی، می‌توان آن‌ها را به شبه‌کد (Pseudocode) تبدیل کرد؛ تخمینی سطح‌بالاتر از اینکه کد منبع واقعی چگونه به نظر می‌رسیده. اگرچه شبه‌کد حدسی بهترین-تخمین است که می‌تواند بسیار غیرقابل‌اعتماد باشد، برای روتین‌های ساده برای هدایت تحلیل شما کافی است.

برای مقایسه سریع کد ماشین، اسمبلی و شبه‌کد، می‌توانید یک برنامه «Hello World» نوشته‌شده به C را تحلیل کنید:

\`\`\`c
hello-world.c
#include <stdio.h>

int main() {
    printf("hello world\\n");
    return 0;
}
\`\`\`

ابتدا این برنامه را با gcc کامپایل کنید:

\`\`\`bash
$ gcc hello-world.c -o hello-world
\`\`\`

سپس از دستور objdump -D <FILE> در لینوکس (می‌توانید در macOS از otool -tvV <FILE> یا در ویندوز از dumpbin /disasm <FILE> استفاده کنید) برای دی‌اسمبل کردن کد ماشین استفاده کنید:

\`\`\`text
$ gcc hello-world.c -o hello-world
$ objdump -D hello-world
hello-world: file format elf64-x86-64
--snip--
Disassembly of section .text:
0000000000400526 <main>:
    400526: 55          push %rbp
    400527: 48 89 e5    mov %rsp,%rbp
    40052a: bf c4 05 40 00  mov $0x4005c4,%edi
    40052f: e8 cc fe ff ff  callq 400400 <puts@plt>
    400534: b8 00 00 00 00  mov $0x0,%eax
    400539: 5d          pop %rbp
    40053a: c3          retq
    40053b: 0f 1f 44 00 00  nopl 0x0(%rax,%rax,1)
\`\`\`

خروجی ممکن است بسته به سیستم‌عامل و معماری CPU که باینری را برای آن کامپایل کرده‌اید متفاوت باشد. با این حال، باید از همان الگوی آدرس مجازی، نمایش hex کد ماشین و دستورالعمل اسمبلی متناظر پیروی کند.

سپس فریمورک مهندسی معکوس نرم‌افزار Ghidra را از https://github.com/NationalSecurityAgency/ghidra دانلود و نصب کنید یا با sudo apt-get install -y ghidra نصبش کنید. یک پروژه جدید بسازید و باینری را با ابزار CodeBrowser تحلیل کنید. CodeBrowser در پنل سمت راست این شبه‌کد را خروجی می‌دهد:

\`\`\`c
undefined8 main(void)
{
❶    puts("hello world");
    return 0;
}
\`\`\`

ممکن است متوجه شوید که به‌جای printf از puts ❶ استفاده شده است. این اشتباه Ghidra نیست؛ اگر به کد ماشین دی‌اسمبل‌شده مراجعه کنید، باینری واقعاً از puts استفاده می‌کند. این یک بهینه‌سازی کامپایلر توسط gcc است که نمونه‌های printf را به‌طور خودکار به معادل کم‌هزینه‌تر یعنی puts تبدیل می‌کند (کد دقیق انجام‌دهنده این کار را در https://github.com/gcc-mirror/gcc/blob/061c331/gcc/gimple-fold.c#L3230 ببینید).

هنگام مهندسی معکوس چنین باینری‌هایی، به‌طور منظم میان نمای متنی و گرافیکی کد اسمبلی و شبه‌کد جابه‌جا خواهید شد. همچنین به متادیتا — در صورت وجود — ارجاع می‌دهید که گاهی بسته به گزینه‌های کامپایلر، درون این باینری‌ها کامپایل شده است.

در بخش‌های بعدی، به‌سرعت بررسی می‌کنیم که روش‌های مختلف کامپایل چگونه بر دشواری مهندسی معکوس باینری‌های کد ماشین اثر می‌گذارند.

#### لینک استاتیک (Statically Linked)

باینری با لینک استاتیک، همراه با همه کتابخانه‌هایی که استفاده می‌کند کامپایل می‌شود، به‌جای آنکه در زمان اجرا کتابخانه‌های خارجی را از سیستم بارگذاری کند. این رویکرد مزایا و معایبی دارد. از یک طرف، باینری را قابل‌حمل می‌کند، زیرا می‌توان مستقل از نصب کتابخانه‌های خارجی روی سیستم‌عامل، آن را اجرا کرد. از طرف دیگر، باینری بسیار بزرگ‌تری ایجاد می‌کند، زیرا کد ماشین بیشتری باید در خروجی گنجانده شود.

می‌توانید این را با پیاده‌سازی Golang از «Hello World» تست کنید، زیرا Golang به‌طور پیش‌فرض باینری‌های با لینک استاتیک کامپایل می‌کند:

\`\`\`go
hello-world.go
package main

import "fmt"

func main() {
    fmt.Println("hello world")
}
\`\`\`

Go را نصب و برنامه را به یک فایل اجرایی لینوکس x86-64 کامپایل کنید:

\`\`\`bash
$ sudo apt install golang
$ GOARCH=amd64 GOOS=linux go build hello-world.go
$ ./hello-world
hello world
$ file hello-world
hello-world: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), statically linked
\`\`\`

باینری با لینک استاتیک است. اگر با objdump دی‌اسمبلش کنید، خروجی بزرگی می‌گیرید، زیرا باینری دستورالعمل‌های تک‌تک توابع ایمپورت‌شده را شامل می‌شود. همچنین اگر سعی کنید جدول نمادهای داینامیک (Dynamic Symbol Table) را فهرست کنید، نتیجه‌ای نمی‌گیرید، زیرا هیچ تابعی با لینک داینامیک وجود ندارد.

در عوض باید کل جدول نمادها (Symbol Table) را dump کنید تا توابع با لینک استاتیک — که اکنون بخشی از باینری‌اند — را ببینید:

\`\`\`text
$ objdump -t hello-world
hello-world: file format elf64-x86-64
SYMBOL TABLE:
0000000000000000 l    df *ABS*  0000000000000000 go.go
0000000000401000 l    F .text   0000000000000000 runtime.text
00000000004021a0 l    F .text   000000000000022d cmpbody
0000000000402400 l    F .text   000000000000013e memeqbody
000000000045a760 l    F .text   0000000000000040 gogo
000000000045a7a0 l    F .text   0000000000000035 callRet
000000000045a7e0 l    F .text   000000000000002f gosave_systemstack_switch
000000000045a820 l    F .text   000000000000000d setg_gcc
--snip--
000000000047b9a0 g    F .text   0000000000000042 fmt.glob..func1
000000000047ba00 g    F .text   0000000000000092 fmt.newPrinter
000000000047baa0 g    F .text   000000000000011a fmt.(*pp).free
000000000047bbc0 g    F .text   000000000000010a fmt.(*pp).Write
000000000047bce0 g    F .text   00000000000000e5 fmt.Fprintln
\`\`\`

غیر از fmt.Fprintln، بسیاری از پکیج‌ها و توابع دیگر Golang در باینری نهایی گنجانده شده‌اند. اگرچه لینکر Golang تلاش می‌کند کد مرده و نمادهای بلااستفاده را حذف کند، هنوز باید بسیاری از توابع پکیج fmt را استاتیک لینک کند. اگر از Ghidra CodeBrowser برای تولید شبه‌کد تابع main استفاده کنید، چیزی شبیه زیر می‌گیرید:

\`\`\`text
void main.main(void)
{
    long unaff_R14;
    undefined local_18 [16];
    while (&stack0x00000000 < *(undefined **)(ulong *)(unaff_R14 + 0x10) ||
        &stack0x00000000 == *(undefined **)(ulong *)(unaff_R14 + 0x10)) {
        runtime.morestack_noctxt.abi0();
    }
    local_18._8_8_ = &PTR_DAT_004b71c8;
    local_18._0_8_ = &DAT_004893e0;
❶    fmt.Fprintln(1,1,&PTR_DAT_004b71c8,local_18);
    return;
}
\`\`\`

اگرچه باینری دقیقاً همان کاری را می‌کند که مثال C یعنی «Hello World» می‌کرد، کد ماشین تولیدشده توسط کامپایلر Golang برای Ghidra دشوارتر است. زیرا باینری‌های Go همراه با Runtime خودِ Go کامپایل می‌شوند که کارهای اضافی مانند زباله‌روبی و مدیریت پشته را انجام می‌دهد. علاوه بر این، ممکن است متوجه شوید که خروجی نهایی شامل fmt.Fprintln است نه Println ❶. زیرا در پکیج fmt، تابع Println یک Wrapper دور تابع Fprintln است، پس کامپایلر آن را — مشابه اتفاقی که قبلاً برای printf و puts افتاد — بهینه و حذف می‌کند.

#### لینک داینامیک (Dynamically Linked)

در مقابل باینری‌های با لینک استاتیک، باینری‌های با لینک داینامیک با اطلاعاتی درباره کتابخانه‌هایی که به آن‌ها وابسته‌اند کامپایل می‌شوند، اما نه خود کتابخانه‌ها. سیستم‌عامل این اطلاعات را پردازش و در زمان اجرا، کتابخانه‌ها را در حافظه بارگذاری می‌کند. به‌عنوان مقایسه‌ای سریع، جدول نمادهای داینامیک باینری «Hello World» مربوط به C را بررسی کنید:

\`\`\`text
$ objdump -T hello-world
hello-world: file format elf64-x86-64
DYNAMIC SYMBOL TABLE:
0000000000000000  DF *UND*  0000000000000000  GLIBC_2.2.5 puts
0000000000000000  DF *UND*  0000000000000000  GLIBC_2.2.5 __libc_start_main
0000000000000000  wD *UND*  0000000000000000  __gmon_start__
\`\`\`

در Ghidra می‌توانید روی fmt.Fprintln کلیک کنید تا به دستورالعمل‌های پیاده‌سازی Fprintln بپرید و غیره. کلیک روی puts به یک «تابع تثبیت» (Thunk Function) مصنوعی می‌رسد که قرار است تابع puts بارگذاری‌شده از خارج را در زمان اجرا بازنمایی کند:

\`\`\`text
0060103f  ????
//
// EXTERNAL
// NOTE: This block is artificial and allows ELF Relocations
// ram:00602000-ram:0060202f
//
thunk int puts(char * __s)
    Thunked-Function: <EXTERNAL>::puts
    int EAX:4 <RETURN>
    char * RDI:8 __s
puts@@GLIBC_2.2.5
<EXTERNAL>::puts
\`\`\`

نرم‌افزارهای پیچیده اغلب بیش از یک باینری شامل می‌شوند؛ از جمله چندین فایل اجرایی و کتابخانه. بنابراین ممکن است در حین مهندسی معکوس توابعی که در یک کتابخانه پیاده شده و در کتابخانه یا فایل اجرایی دیگری فراخوانی می‌شوند، بین فایل‌های مختلف جابه‌جا شوید.

#### حذف نمادها (Stripped)

گاهی برای صرفه‌جویی در فضا یا حتی ممانعت از مهندسی معکوس، توسعه‌دهندگان ممکن است انتخاب کنند باینری را از اطلاعات مرتبط با دیباگ — شامل جدول نمادها — خلع کنند. با کامپایلر Golang می‌توانید این کار را با پاس دادن پرچم -s (که جدول نماد و اطلاعات دیباگ را حذف می‌کند) و پرچم -w (که جدول نماد DWARF یعنی Debugging With Attributed Record Formats را حذف می‌کند) از طریق گزینه -ldflags به لینکر انجام دهید.

فایل اجرایی «Hello World» را مطابق این تنظیم کامپایل و خروجی را هنگام تلاش برای dump نمادها مشاهده کنید:

\`\`\`bash
$ GOARCH=amd64 GOOS=linux go build -ldflags="-s -w" -o stripped hello-world.go
$ objdump -t stripped
stripped: file format elf64-x86-64
SYMBOL TABLE:
no symbols
\`\`\`

برای دیدن اثر این کار بر فرایند مهندسی معکوس، باینری را در Ghidra CodeBrowser تحلیل کنید. CodeBrowser به نقطه ورود پیش‌فرضی می‌پرد که Runtime گو را مقداردهی اولیه می‌کند، نه مستقیماً به تابع main، زیرا دیگر نمی‌تواند به نماد تابع main ارجاع دهد. باینری‌های Stripped گو هنوز نام واقعی توابع را در ساختار داده جداگانه‌ای شامل می‌شوند، پس می‌توان نام نمادها را با یک اسکریپت بازگرداند؛ با این حال، این گزینه همیشه برای سایر زبان‌های برنامه‌نویسی وجود ندارد.

فعلاً می‌توانید به‌سرعت به تابع main بپرید: به همان آدرس مجازیِ مربوط به تابع main در باینری بدون-حذف بروید. کافی است objdump -t hello-world | grep main.main را اجرا کنید تا آدرس مجازی را بگیرید، سپس با میان‌بر G در CodeBrowser به آن آدرس بروید. غیر از نام توابع، هم کد اسمبلی و هم شبه‌کد باید با باینری بدون-حذف مطابقت داشته باشند.

به بیان ساده، اگرچه باینری‌های Stripped می‌توانند چالش جدی‌ای برای مهندسی معکوس باشند، همچنان بازسازی نام نمادها ممکن است — یا با یک اسکریپت (بسته به کامپایلر) یا صرفاً بر اساس کاری که کد ماشین می‌کند. روش دوم نیازمند تسلط خوب بر اسمبلی و تجربه شناسایی سریع الگوهای رایج در توابع کتابخانه استاندارد است. فراتر از آن، می‌توانید پیام‌های لاگ یا خطا را نیز رصد کنید که بینش بیشتری درباره کارکرد یک تابع خاص می‌دهند یا حتی شامل نام تابع‌اند.

#### بسته‌بندی (Packed)

برای کاهش بیشتر اندازه فایل‌های اجرایی، توسعه‌دهندگان گاهی از یک Packer استفاده می‌کنند. Packerها برنامه‌ها را به فایل‌های اجرایی خودکفا فشرده می‌کنند که به‌طور داینامیک فایل‌های اصلی را باز، ازفشرده و اجرا می‌کنند. Ultimate Packer for eXecutables (UPX) یک Packer رایج است که می‌توانید از https://github.com/upx/upx/releases دانلود یا از طریق مدیر پکیج‌های مختلف نصب کنید.

پس از دانلود UPX، آن را روی باینری اصلی «Hello World» گو با دستور upx -o hello-world-packed hello-world اجرا کنید. طبق خروجی، این کار نسبت فشرده‌سازی چشمگیر حدود ۶۰ درصد حاصل می‌کند:

\`\`\`text
File size   Ratio   Format      Name
------------------------------------------------
1850090 -> 1146320  61.96%  linux/amd64  hello-world-packed
Packed 1 file.
\`\`\`

با این حال، از آنجا که باینری بسته‌بندی‌شده اکنون پیش از اجرای دستورالعمل‌های واقعی، روتین ازفشرده‌سازی UPX را اجرا می‌کند، دیگر نمی‌توان کد ماشین اصلی را مستقیماً تحلیل کرد.

مهم‌ترین گام در مواجهه با باینری بسته‌بندی‌شده، ابتدا شناسایی اینکه از کدام Packer استفاده شده است. در مورد UPX، دستورالعمل‌های اولیه شناخته‌شده‌اند و UPX به‌طور مفید بایت‌های جادویی 0x55505821 (یعنی «UPX!» در ASCII) را در هدر قرار می‌دهد. می‌توانید این را در یک hex dump ساده از باینری بسته‌بندی‌شده مشاهده کنید:

\`\`\`text
> hexdump -C hello-world-packed | head -n 20
00000000  7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00  |.ELF............|
00000010  02 00 3e 00 01 00 00 00 08 33 5e 00 00 00 00 00  |..>......3^.....|
00000020  40 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  |@...............|
00000030  00 00 00 40 00 38 00 03 00 00 00 00 00 00 00 00  |....@.8.........|
00000040  01 00 00 00 06 00 00 00 00 00 00 00 00 00 00 00  |................|
00000050  00 00 40 00 00 00 00 00 00 00 40 00 00 00 00 00  |..@.......@.....|
00000060  00 10 00 00 00 00 00 00 d0 e7 15 00 00 00 00 00  |................|
00000070  00 10 00 00 00 00 00 00 01 00 00 00 05 00 00 00  |................|
00000080  00 00 00 00 00 00 00 00 00 f0 55 00 00 00 00 00  |..........U.....|
00000090  00 f0 55 00 00 00 00 00 e6 4d 08 00 00 00 00 00  |..U......M......|
000000a0  e6 4d 08 00 00 00 00 00 00 10 00 00 00 00 00 00  |.M..............|
000000b0  51 e5 74 64 06 00 00 00 00 00 00 00 00 00 00 00  |Q.td............|
000000c0  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  |................|
*
000000e0  08 00 00 00 00 00 00 00 4f 05 91 f3 55 50 58 21  |........O...UPX!|
000000f0  ec 0a 0e 16 00 00 00 00 ea 3a 1c 00 6a 6c 09 00  |.........:..jl..|
00000100  c8 01 00 00 9d 00 00 00 08 00 00 00 bb fb 20 ff  |.............. .|
00000110  7f 45 4c 46 02 01 01 00 02 00 3e 00 1b 80 ed 45  |.ELF......>....E|
00000120  1f bf 5f da ed 40 2f c8 45 26 38 00 07 0a 17 00  |.._..@/.E&8.....|
00000130  03 3e d8 d7 de 00 06 1e 04 4f 40 00 40 0f 88 01  |.>.......O@.@...|
\`\`\`

خوشبختانه UPX به شما اجازه می‌دهد به‌سادگی باینری‌های بسته‌بندی‌شده با UPX را از طریق گزینه خط فرمان -d باز کنید (برای امتحان کردن، upx -d hello-world-packed را وارد کنید). برخی Packerها و Obfuscatorها از تکنیک‌هایی استفاده می‌کنند که مهندسی معکوس را دشوار می‌کنند؛ مانند رمزنگاری داده با مقادیر تصادفی، و ممکن است نیاز داشته باشید بایت‌های باز‌شده و رمزگشایی‌شده را از حافظه dump کنید یا روتین باز کردن بسته را با جزئیات تحلیل کنید. اگرچه این موارد را بیشتر در بدافزارها می‌بینید، آماده بودن برای تشخیص موقعیتی که از Packer استفاده شده و دانستن رویکرد برخورد با چنین باینری‌هایی، مفید است.

### خلاصه (Summary)

در این فصل طیف گسترده‌ای از باینری‌ها را در دسته‌های مختلف پیمودید؛ شامل اسکریپت‌ها، بازنمایی‌های میانی و کد ماشین. همچنین نمونه‌های ساده هر نوع را با ابزارها و تکنیک‌های مناسب مهندسی معکوس کردید.

هرچه نرم‌افزارهای بزرگ‌تر و پیچیده‌تری مانند Firmware را هدف بگیرید، ممکن است لازم باشد چندین نوع باینری را هم‌زمان مدیریت کنید. برای مثال، یک برنامه اندروید نوشته‌شده به جاوااسکریپت (React Native) ممکن است ماژول نیتیویی را فراخوانی کند که از جاوا کامپایل شده و آن نیز می‌تواند از طریق Java Native Interface به کتابخانه‌های ++C دسترسی پیدا کند. به همین دلیل ساخت گستردگی (Breadth) به‌جای تمرکز بیش از حد بر یک حوزه، ضروری است.

اگرچه این مقدمه به‌هیچ‌وجه جامعِ همه انواع باینری‌هایی که با آن‌ها روبه‌رو خواهید شد نبود، باید بتوانید رویکردهای استفاده‌شده را بدون توجه به زبان برنامه‌نویسی یا نوع کامپایل، تعمیم دهید. برای مثال، مراقب منابع متادیتا باشید که می‌توانند به شما در تحلیل مؤثرتر کد ماشین یا حتی دی‌کامپایل آن به کد منبع کمک کنند. به ظرافت‌ها و بهینه‌سازی‌های مخصوص زبان یا کامپایلر توجه کنید که در شناسایی نام توابع و Importها به شما کمک می‌کنند. به سرنخ‌هایی دقت کنید که نشان می‌دهند توسعه‌دهنده از Packer یا Obfuscator استفاده کرده؛ ابزار مورد استفاده را شناسایی و مستندات آن را بخوانید تا در صورت امکان نحوه معکوس کردنش را بیابید. این نکات به شما کمک می‌کند مهم‌ترین یا مفیدترین بخش‌های برنامه را که باید ابتدا مهندسی معکوس شوند شناسایی کنید — موضوعی که فصل بعد به‌تفصیل به آن می‌پردازد.`,
};
