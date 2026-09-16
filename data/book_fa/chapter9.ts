import { Chapter } from "@/types/reader";

export const CHAPTER_9_FA: Chapter = {
  id: "ch-9",
  title: "فصل ۹: فازینگ همه‌چیز (Fuzzing Everything)",
  readingTimeMinutes: 47,
  content: `## فصل ۹: فازینگ همه‌چیز (Fuzzing Everything)

> *«در نبرد، تنها نیروهای عادی و غیرعادی وجود دارند، اما ترکیب‌های آن‌ها بی‌کران است؛ هیچ‌کس نمی‌تواند همه آن‌ها را درک کند.»*
> — سون تزو، *هنر جنگ*

طیف گسترده‌ای از اهداف پژوهش آسیب‌پذیری را در نظر بگیرید که امروزه با آن‌ها روبه‌رو می‌شوید: سرورهای پروتکل شبکه به زبان Golang، کلاینت‌های دسکتاپ Electron، برنامه‌های اندروید به زبان Kotlin و غیره. اگرچه فازینگ سنتیِ جعبه‌سفیدِ باینری‌های کامپایل‌شده جایگاه خودش را دارد، بعید است همیشه چنین اقبالی داشته باشید که به کد منبع دسترسی داشته باشید. با این حال، ایده اصلی فازینگ — تولید ورودی‌های غیرمنتظره‌ای که آسیب‌پذیری‌ها را فعال می‌کنند — حتی در سناریوهای جعبه‌سیاه هم برقرار است. با گسترش مجموعه نتایج هدف‌تان فراتر از صرفاً کرش‌ها و هنگ‌ها، می‌توانید به اهداف دیگری هم برسید؛ مانند دور زدن یک ابزار پاک‌سازی (Sanitizing) یا یافتن نمونه‌ای از تزریق SQL (SQL Injection).

در این فصل می‌آموزید سه نوع هدف را فاز کنید. نخست، از حالت Frida در AFL++ برای ابزارسازی داینامیک و فاز کردن LibreDWG از منظر کد-بسته استفاده می‌کنید. سپس باینری‌های حافظه مدیریت‌شده (Managed Memory) را با Jazzer برای جاوا و قابلیت فازینگ داخلی Golang فاز می‌کنید تا آسیب‌پذیری‌هایی غیر از باگ‌های همیشگی خرابی حافظه بیابید. در نهایت، فرمت‌های فایل غیرباینری را با استفاده از Dictionaryها، گرامرها (Grammar) و بازنمایی‌های میانی فاز می‌کنید تا آسیب‌پذیری‌هایی در اهداف پردازش نحوی و معنایی بیابید. این موارد معمولاً خارج از اهداف سنتی فازینگ جعبه‌سفیدِ کد ماشین کامپایل‌شده‌اند، اما اخیراً توجه بیشتری از توسعه‌دهندگان فازرها جلب کرده‌اند. تا پایان این فصل، یک جعبه‌ابزار جامع برای فاز کردن طیف گسترده‌ای از اهداف در زبان‌ها و فرمت‌های مختلف ساخته‌اید.

### باینری‌های کد-بسته (Closed Source Binaries)

وقتی با نرم‌افزارهای اختصاصی سر و کار دارید، بعید است به کد منبع دسترسی داشته باشید. از قضا، اهدافِ کد-بسته‌ای که کد منبعشان منتشر نشده ممکن است آسیب‌پذیری‌های بیشتری از اهدافی داشته باشند که کد منبعشان آزادانه در دسترس است، زیرا احتمال کمتری دارد که توسط پژوهشگران دیگر تست شده باشند. این به «ناامنی از طریق پنهان‌کاری» می‌انجامد (تعبیری طنزآمیز از اصل بحث‌برانگیز و بارها-انتقادشده «امنیت از طریق پنهان‌کاری» در امنیت سایبری)؛ چرا که فقدان دید، اجازه می‌دهد کدهای آسیب‌پذیر در نرم‌افزار باقی بمانند. اگرچه برخی اهداف کد-بسته به‌درستی سخت‌گیرانه‌محافظت شده‌اند و پروژه‌های متن‌بازِ ناامن و کم‌نگهداریِ فراوانی هم وجود دارد، قاعده «ناامنی از طریق پنهان‌کاری» اغلب درست از آب درمی‌آید.

بسیاری از فازرهایی که باینری‌های کد-بسته را هدف می‌گیرند از ابزارسازی داینامیک برای ممکن کردن فازینگ هدایت-با-پوشش استفاده می‌کنند. با این حال، این با برخی مصالحه‌ها همراه است؛ مانند سرعت. می‌توانید این مبادلات را در حالت‌های متعدد فازینگِ فقط-باینری AFL++ مطالعه کنید. به‌طور پیش‌فرض، اگر دستورالعمل‌های نصب استاندارد در https://github.com/AFLplusplus/AFLplusplus/blob/stable/docs/INSTALL.md را دنبال کرده باشید، باید از قبل نسخه‌ای از AFL++ با پشتیبانی از حالت‌های QEMU و Frida بیلد و نصب کرده باشید.

#### حالت QEMU (QEMU Mode)

حالت اصلی فازینگِ فقط-باینری در AFL++، حالت QEMU است. این حالت از شبیه‌ساز فضای کاربر QEMU استفاده می‌کند که تلاش نمی‌کند یک سیستم کامل را شبیه‌سازی کند، بلکه فراخوانی‌های سیستمی و دستورالعمل‌ها را ترجمه می‌کند تا یک باینری منفردِ کامپایل‌شده برای پردازنده دیگری اجرا شود. QEMU باید از قبل در نصب اولیه AFL++ شما گنجانده شده باشد، اما اگر نیست، به مستندات https://github.com/AFLplusplus/AFLplusplus/blob/stable/qemu_mode/README.md برای راه‌اندازی آن مراجعه کنید.

برای تمرین فازینگ با حالت QEMU، می‌توانید NConvert را فاز کنید؛ یک ابزار خط فرمان دسته‌ای برای پردازش و تبدیل تصاویر. NConvert رایگان (Freeware) اما متن‌باز نیست، پس مجبورید از رویکرد فقط-باینری استفاده کنید. نسخه 7.136 از NConvert چندین آسیب‌پذیری خرابی حافظه افشاشده دارد (شامل CVE-2023-43250، CVE-2023-43251 و CVE-2023-43252). به‌طور خاص، آسیب‌پذیری‌ها هنگام تبدیل فایل‌های TIFF رخ دادند که نشان می‌دهد این شاید نقطه ضعفی در فرایند توسعه‌اش باشد.

برای اینکه ببینید می‌توانید آسیب‌پذیری‌های پردازش TIFF دیگری در نسخه به‌روزرسانی‌شده NConvert بیابید، نسخه 7.155 را از https://download.xnview.com/old_versions/NConvert/NConvert-7.155-linux64.tgz دانلود و استخراج کنید. پیش از شروع فازینگ، باید یک Corpus اولیه از فایل‌های TIFF جمع کنید که می‌توانید از فایل‌های تست پروژه متن‌باز LibTIFF به دست آورید:

\`\`\`bash
$ wget https://download.xnview.com/old_versions/NConvert/NConvert-7.155-linux64.tgz
$ tar -zxf NConvert-linux64.tgz
$ git clone https://github.com/libsdl-org/libtiff
$ mkdir NConvert/fuzz-in
$ cp libtiff/test/images/*.tiff NConvert/fuzz-in/
$ cd NConvert
$ afl-fuzz ❶ -c nconvert -Q -i fuzz-in -o fuzz-out -- ./nconvert -out tiff @@
\`\`\`

علاوه بر فلگ گزینه -Q برای اجرا در حالت QEMU، می‌توانید حالت CMPLOG را با گزینه -c ❶ فعال کنید. همان‌طور که از نامش پیداست، حالت CMPLOG دستورالعمل‌های CMP را لاگ می‌کند تا بررسی‌های بایت جادویی را شناسایی و تلاش کند از آن‌ها عبور کند. این می‌تواند فازینگ فرمت‌های فایل باینری را به‌شکل جدی بهبود و موانع فازینگ را کاهش دهد.

تعجب‌آور نیست که AFL++ ممکن است گزارش دهد سرعت اجرا کند است. Stability کامل نیست، اما تا زمانی که بالای ۸۰ درصد باشد، همچنان باید بتوانید باگ‌ها را با موفقیت بیابید. افزودن فازینگ هدایت-با-پوشش برای باینری‌های کد-بسته، همچنین جهشی بزرگ در اثربخشی کلی نسبت به فازینگ «کور» محسوب می‌شود. NConvert را به اندازه کافی طولانی فاز کنید و کرش‌های جدیدی ناشی از سرریز بافر خواهید یافت.

#### حالت Frida (Frida Mode)

اگرچه AFL++ حالت QEMU را راه‌حل «بومی» برای اهداف فقط-باینری توصیه می‌کند، حالت Frida جایگزین جدیدتری است که قابلیت‌های اضافی — شامل اسکریپت‌نویسی — را معرفی می‌کند. این حالت می‌تواند در محیط‌های دیگری که Frida را پشتیبانی می‌کنند هم کار کند؛ مانند دستگاه‌های اندرویدی، که امکان فازینگ واقع‌گرایانه‌تری نسبت به محیط شبیه‌سازی‌شده را فراهم می‌کند.

به‌عنوان تست سریعی از حالت Frida، یک نسخه تازه از LibreDWG را کلون و بدون هیچ ابزارسازی بیلد کنید:

\`\`\`bash
$ git clone https://github.com/LibreDWG/libredwg.git
$ cd libredwg
$ git checkout 77a8562
$ sh ./autogen.sh
$ ./configure --disable-bindings --disable-dxf --disable-json --disable-shared
$ make -C src && make -C programs dwgread
\`\`\`

دایرکتوری Corpus ورودی fuzz-in را که در فصل ۸ استفاده کردید، کپی کنید. اگر سعی کنید AFL++ را مثل همیشه اجرا کنید، خطای زیر را می‌گیرید:

\`\`\`text
$ afl-fuzz -i fuzz-in -o fuzz-out -- programs/dwgread @@
--snip--
[-] PROGRAM ABORT :  No instrumentation detected
        Location : check_binary(), src/afl-fuzz-init.c:2948
\`\`\`

همان‌طور که پیام خطا می‌گوید، AFL++ شکست می‌خورد زیرا باینری هدف با ابزارسازی کامپایل نشده است. در عوض باید AFL++ را با فلگ گزینه حالت Frida یعنی -O اجرا کنید:

\`\`\`text
$ afl-fuzz -O -i fuzz-in -o fuzz-out -- programs/dwgread @@
--snip--
[+] Injecting /usr/local/lib/afl/afl-frida-trace.so ...
\`\`\`

همان‌طور که در پیام لاگ نشان داده شده، AFL++ کتابخانه اشتراکی afl-frida-trace.so را بارگذاری می‌کند تا برنامه هدف را در زمان اجرا با Frida Stalker ابزارسازی کند. این کار دستورالعمل‌های اسمبلی اضافی‌ای تزریق می‌کند که داده پوشش را ردیابی، جمع‌آوری و به AFL++ گزارش می‌کنند.

اگرچه حالت Frida کندتر از حالت ابزارسازی‌شده‌ای که در فصل قبل استفاده کردید اجرا می‌شود، برای کشف دوباره باگ خرابی حافظه در تابع bit_calc_CRC در dwgread همچنان کافی است. با این حال، اگر کرش را با GDB دیباگ کنید، می‌بینید که اطلاعات کمتری نسبت به صفحه ۲۳۷ به شما می‌دهد:

\`\`\`text
$ gdb --args ./programs/dwgread fuzz-out/default/crashes/id:000000,sig:11,src:000030,time:30220088,execs:157722,op:havoc,rep:2
(gdb) r
Starting program: /home/kali/Desktop/frida-mode/libredwg/programs/dwgread fuzz-out/default/crashes/id:000000,sig:11,src:000030,time:30220088,execs:157722,op:havoc,rep:2
--snip--
Program received signal SIGSEGV, Segmentation fault.
bit_calc_CRC (seed=seed@entry=49345, addr=0x55556bd010e6 <error: Cannot access memory at address 0x55556bd010e6>, len=<optimized out>) at bits.c:3456
3456        dx = ((dx >> 8) & 0xFF) ^ crctable[al]; ❶
(gdb) backtrace
#0  bit_calc_CRC (seed=seed@entry=49345, addr=0x55556bd010e6 <error: Cannot access memory ❷ at address 0x55556bd010e6>, len=<optimized out>) at bits.c:3456
#1  0x00005555559fa33b in decode_preR13_auxheader (dat=dat@entry=0x7fffffffc7a0, dwg=dwg@entry=0x7fffffffc8c0) at decode.c:6278
#2  0x0000555555a1f3ce in decode_preR13 (dat=dat@entry=0x7fffffffc7a0, dwg=dwg@entry=0x7fffffffc8c0) at decode_r11.c:786
#3  0x00005555559ecd9b in dwg_decode (dat=dat@entry=0x7fffffffc7a0, dwg=dwg@entry=0x7fffffffc8c0) at decode.c:217
#4  0x00005555555ae157 in dwg_read_file (filename=0x7fffffffe15a "fuzz-out/default/crashes/id:000000,sig:11,src:000030,time:30220088,execs:157722,op:havoc,rep:2", dwg=dwg@entry=0x7fffffffc8c0) at dwg.c:261
#5  0x00005555555ad6fa in main (argc=<optimized out>, argv=0x7fffffffddb8) at dwgread.c:256
\`\`\`

توجه کنید که اگرچه دستورالعمل‌ها ❶ دیگر به کد منبع نگاشت نمی‌شوند، نمادهای Export‌شده همچنان اجازه می‌دهند نام توابع ❷ به‌طور دقیق در backtrace بازتاب یابند.

با این نمادهای Export‌شده، می‌توانید از قابلیت‌های قدرتمند اسکریپت‌نویسی Frida برای وصله داینامیک توابع مشکل‌ساز استفاده کنید. برای مثال، به یاد بیاورید که تابع bit_check_CRC به دلیل شکست بررسی‌ها، مانعی برای فازینگ ایجاد کرده بود. قبلاً با دسترسی به کد منبع، می‌توانستید مستقیماً تابع را اصلاح و هدف را دوباره کامپایل کنید. در اینجا، از نظر تئوری به کد منبع دسترسی ندارید و نمی‌توانید این کار را بکنید. در عوض می‌توانید اسکریپتی مانند فهرست ۹-۱ بنویسید که در مخزن کد کتاب در chapter-09/frida-mode/patch.js موجود است.

\`\`\`javascript
patch.js
const bit_check_CRC = DebugSymbol.fromName('bit_check_CRC').address;
Afl.print(\`bit_check_CRC: \${bit_check_CRC}\`);
const bit_check_CRC_replacement = new NativeCallback(
    (dat, start_address, seed) => {
        Afl.print('intercepted bit_check_CRC');
        Afl.print(\`seed: \${seed}\`);
❶        return 1;
    },
    'int',
    ['pointer', 'ulong', 'uint16']);
❷Interceptor.replace(bit_check_CRC, bit_check_CRC_replacement);
Afl.done();
\`\`\`

*فهرست ۹-۱: اسکریپت Frida برای وصله bit_calc_CRC*

تابع جایگزین شما صرفاً از همه گام‌های محاسبه CRC عبور می‌کند و فوراً ۱ ❶ را برمی‌گرداند. این اسکریپت را در دایرکتوری کاری فعلی قرار دهید و متغیر محیطی AFL_FRIDA_JS_SCRIPT را به نام فایلش تنظیم کنید؛ AFL++ به‌طور خودکار اسکریپت را بارگذاری و هر فراخوانی bit_check_CRC ❷ را با فراخوانی تابع جایگزین شما جایگزین می‌کند.

می‌توانید این را با اجرای فازر با فلگ AFL_DEBUG=1 تأیید کنید که به شما اجازه می‌دهد خروجی Afl.print را هر بار که رهگیری رخ می‌دهد ببینید:

\`\`\`text
$ AFL_FRIDA_JS_SCRIPT=patch.js AFL_DEBUG=1 afl-fuzz -O -i fuzz-in/ -o fuzz-out-2 -- programs/dwgread @@
--snip--
intercepted bit_check_CRC
seed: 49345
intercepted bit_check_CRC
seed: 49345
intercepted bit_check_CRC
seed: 49345
intercepted bit_check_CRC
seed: 49345
intercepted bit_check_CRC
seed: 49345
seed: 49345
intercepted bit_check_CRC
\`\`\`

البته در یک سناریوی واقعیِ کد-بسته، ابتدا باید مقداری مهندسی معکوس انجام دهید تا مانع فازینگ را شناسایی و سپس خودِ تابع را مهندسی معکوس کنید تا جایگزین مناسبی بنویسید.

با اسکریپت‌نویسی کارهای بسیار بیشتری می‌توان کرد، به لطف APIهایی که با خودِ حالت Frida در AFL++ تعامل دارند. برای مثال، می‌توانید یک آدرس Persistent را برای فاز کردن در یک باینری Stripped بدون اطلاعات نماد، با تعیین یک آفست در ایمیج هدف تنظیم کنید. با فرض اینکه dwgread به‌شکل باینری Stripped کامپایل شده و کشف کرده‌اید که تابعی که فایل ورودی را باز و پردازش می‌کند در آفست 0x059fe0 قرار دارد، می‌توانید از اسکریپت فهرست ۹-۲ برای تنظیم آدرس شروع حالت Persistent استفاده کنید.

\`\`\`javascript
offset.js
const module = Process.getModuleByName('dwgread');
const dwg_read_file = module.base.add(0x059fe0);
❶Afl.setPersistentAddress(dwg_read_file);
Afl.done();
\`\`\`

*فهرست ۹-۲: اسکریپت Frida برای تنظیم آدرس Persistent*

تنظیم آدرس Persistent ❶ باعث می‌شود AFL++ وضعیت پروسه فرزند فازینگ را هنگام رسیدن به dwg_read_file ذخیره و هنگام رسیدن به اولین ret در تابع، آن را بازنشانی کند. این کار فازینگ را به‌شکل جدی سریع می‌کند. اگر علاقه‌مند به یادگیری امکانات اسکریپت‌نویسی بیشتر هستید، به نمونه‌های استفاده در https://github.com/AFLplusplus/AFLplusplus/blob/stable/frida_mode/Scripting.md مراجعه کنید.

کار با باینری‌های کد-بسته لزوماً به آن معنا نیست که مجبورید به فازینگ جعبه‌سیاه برگردید. همچنان می‌توانید از قابلیت‌های پیشرفته فازینگ (مانند حالت Persistent) بهره ببرید و فازینگ هدایت-با-پوشش را اعمال کنید، به لطف ابزارهای ابزارسازی داینامیک مانند Frida. بسته به هدف‌تان، شاید انتخاب کنید از حالت Frida یا QEMU برای AFL++ استفاده کنید. برای مثال، شاید بخواهید باینری‌های اندروید را مستقیماً روی دستگاه سخت‌افزاری فاز کنید تا اطمینان حاصل شود محیط اجرا تا حد ممکن به محیط واقعی نزدیک است. در این مورد، توانایی Frida برای اجرا فوری در محیط‌های مختلف می‌تواند مفید باشد. علاوه بر این، Frida پشتیبانی اسکریپت‌نویسی برای پیکربندی فراهم می‌کند که شاید راحت‌تر از تنظیم متغیرهای محیطی باشد. با این حال، در مقایسه با حالت QEMU، Frida بسیاری از قابلیت‌های AFL++ و پشتیبانی پردازنده‌ها را ندارد. برای مثال، حالت Persistent را فقط در معماری‌های x86، x64 و ARM64 پشتیبانی می‌کند.

### باینری‌های حافظه مدیریت‌شده (Managed Memory Binaries)

در این بخش، باینری‌های حافظه مدیریت‌شده نوشته‌شده به جاوا و Golang را بررسی می‌کنیم. اگرچه فازینگ در کشف آسیب‌پذیری‌های خرابی حافظه عالی است، در یافتن سایر انواع آسیب‌پذیری‌ها — مانند Path Traversal یا تزریق دستور — کمتر ماهر است. زیرا کرش‌ها نسبتاً آسان تشخیص داده می‌شوند و فازرها بیشتر با Sanitizerهای زمان کامپایل مانند ASan همیاری می‌شوند. این تصور رایج است که فازینگ فقط برای زبان‌های برنامه‌نویسیِ بدون مدیریت حافظه داخلی کار می‌کند، اما این درست نیست.

برای سایر زبان‌های برنامه‌نویسی (مانند Golang و جاوا) که زباله‌روبی (Garbage Collection) خودشان را پیاده می‌کنند و نیازی به تخصیص و مدیریت حافظه توسط توسعه‌دهنده ندارند، آسیب‌پذیری‌های خرابی حافظه نسبتاً نادرند. در عوض، فازرها می‌توانند از Sanitizerهای اضافی استفاده کنند که وقتی انواع دیگری از آسیب‌پذیری‌ها فعال می‌شوند، آن‌ها را تشخیص و خطا پرتاب می‌کنند. در این بخش، این را با Jazzer و قابلیت فازینگ داخلی Golang امتحان می‌کنید.

#### Jazzer

Jazzer یک فازر هدایت-با-پوشش برای پلتفرم JVM است. از آنجا که در سطح بایت‌کد کار می‌کند، نیازی به دسترسی به کد منبع ندارید و می‌توانید صرفاً فایل‌های کلاس جاوای کامپایل‌شده و پکیج‌های JAR را هدف بگیرید. این موضوع Jazzer را برای انواع اهداف مبتنی بر JVM فوق‌العاده مفید می‌سازد؛ از برنامه‌های اندروید تا برنامه‌های نوشته‌شده به زبان‌هایی مانند Scala و Kotlin.

علاوه بر این، Jazzer یک حالت autofuzz دارد که به‌طور خودکار آرگومان‌های آگاه-از-ساختار (Structure-Aware) را برای متدهای عمومی مقداردهی و جهش می‌دهد، پس ساختن دستی Harness اختیاری است (اگرچه ما همچنان برای سفارشی‌سازی بیشتر نشست فازینگ این کار را می‌کنیم). می‌توانید این قابلیت قدرتمند را با مثال ساده‌ای از یک برنامه وب جاوا بررسی کنید که شامل کلاسی به نام SsrfExample است؛ همان‌طور که در فهرست ۹-۳ نشان داده شده، این کلاس برنامه را در برابر جعل درخواست سمت سرور (Server-Side Request Forgery یا SSRF) آسیب‌پذیر می‌کند — حمله‌ای که به مهاجم اجازه می‌دهد درخواست‌های وبی به مقصدِ تحت‌کنترل-مهاجم بفرستد.

\`\`\`java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class SsrfExample {
    public static void getRequest(String dest) {
        try {
            if (!dest.contains("/safepath")) { ❶
                System.out.println("path must be safe!");
                return;
            }
            URL url = new URL("https://example.com" + dest); ❷
            HttpURLConnection connection = (HttpURLConnection) url.openConnection(); ❸
            connection.setRequestMethod("GET");
            BufferedReader reader = new BufferedReader(
                new InputStreamReader(connection.getInputStream())
            );
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println(line);
            }
            reader.close();
        } catch (IOException e) {
            System.err.println("An error occurred: " + e.getMessage());
        }
        return;
    }
}
\`\`\`

*فهرست ۹-۳: نمونه کلاس جاوا آسیب‌پذیر در برابر جعل درخواست سمت سرور*

هر بار که مسیری در برنامه وب، متد getRequest را فراخوانی کند، آرگومان رشته‌ای قبل از الحاق به https://example.com ❷ برای زیررشته /safepath بررسی می‌شود ❶. سپس کد، یک اتصال وب به رشته URL حاصل ❸ باز می‌کند.

اگر تجربه‌ای در تست نفوذ وب دارید، آسیب‌پذیری SSRF را اینجا به‌سرعت تشخیص می‌دهید. از آنجا که این بررسی فقط تأیید می‌کند آرگومان شامل /safepath است — نه اینکه با آن شروع شود — قابل دورزدن است. اگر مهاجم آرگومانی مانند .evil.com/safepath بفرستد، برنامه وب درخواست وبی به https://example.com.evil.com/safepath ارسال می‌کند. این همه انواع خرابکاری را ممکن می‌سازد؛ از جمله ریدایرکت به وب‌سرورهای حساسِ شبکه داخلی.

Jazzer چگونه می‌تواند این مشکل را تشخیص دهد؟ فهرست Sanitizerها را می‌توانید در https://github.com/CodeIntelligenceTesting/jazzer زیر دایرکتوری اصلی «Sanitizers» بیابید. این Sanitizerها APIهای سطح‌پایین خاص جاوا را هوک می‌کنند تا Jazzer بتواند بررسی کند که آیا یک آسیب‌پذیری بالقوه فعال شده است یا خیر. برای مثال، قطعه Sanitizer مربوط به ServerSideRequestForgery.java را در فهرست ۹-۴ بررسی کنید.

\`\`\`java
public class ServerSideRequestForgery {
    --snip--
❶    @MethodHook(
        type = HookType.BEFORE,
❷        targetClassName = "java.net.SocketImpl",
❸        targetMethod = "connect",
        additionalClassesToHook = {
            "java.net.Socket",
            "java.net.SocksSocketImpl",
        })
    --snip--
    private static void checkSsrf(Object[] arguments) {
        if (arguments.length == 0) {
            return;
        }
        int port;
        if (arguments[0] instanceof InetSocketAddress) {
            // Only implementation of java.net.SocketAddress.
❹            InetSocketAddress address = (InetSocketAddress) arguments[0];
            host = address.getHostName();
            port = address.getPort();
        } else if (arguments.length >= 2 && arguments[1] instanceof Integer) {
            if (arguments[0] instanceof InetAddress) {
                host = ((InetAddress) arguments[0]).getHostName();
            } else if (arguments[0] instanceof String) {
                host = (String) arguments[0];
            } else {
                return;
            }
            port = (int) arguments[1];
        } else {
            return;
        }
        if (port < 0 || port > 65535) {
            return;
        }
❺        if (!connectionPermitted.get().test(host, port)) {
            Jazzer.reportFindingFromHook(
                new FuzzerSecurityIssueMedium(
                    String.format(
                        "Server Side Request Forgery (SSRF)\\n"
                            + "Attempted connection to: %s:%d\\n"
    --snip--
\`\`\`

*فهرست ۹-۴: قطعه‌ای از Sanitizer جعل درخواست سمت سرور در Jazzer*

این Sanitizer از انوتیشن @MethodHook در Jazzer ❶ برای هوک کردن همه فراخوانی‌های متد connect ❸ از کلاس کتابخانه استاندارد جاوا یعنی java.net.SocketImpl ❷ استفاده می‌کند. این کلاس توسط بسیاری از کلاس‌ها و APIهای سطح‌بالاتر برای برقراری اتصالات شبکه استفاده می‌شود؛ مانند HttpsURLConnection در java.base که بعداً مشاهده خواهید کرد. پیش از اجرای این متد، Jazzer تابع checkSsrfSocket را اجرا می‌کند که آرگومان‌های connect را به checkSsrf می‌دهد و این تابع به نوبه خود آدرس اتصال ❹ را استخراج و بررسی می‌کند که آیا مقصد مجاز است یا خیر. اگر مجاز نباشد، یک یافته (Finding) Jazzer ❺ فعال می‌کند.

با این پیش‌زمینه، می‌توانید تست کنید که آیا فازینگ هدایت-با-پوشش Jazzer برای فعال کردن آسیب‌پذیری SSRF کافی است یا خیر. مطمئن شوید کیت توسعه جاوا (JDK) نصب دارید، سپس SsrfExample.java را کامپایل کنید:

\`\`\`bash
$ sudo apt install default-jdk
$ javac SsrfExample.java
\`\`\`

این کار یک فایل کلاس به نام SsrfExample.class در دایرکتوری کاری شما کامپایل می‌کند. سپس آخرین نسخه Jazzer را از https://github.com/CodeIntelligenceTesting/jazzer/releases دانلود و استخراج و Jazzer را در حالت autofuzz اجرا کنید؛ مطمئن شوید گزینه classpath به دایرکتوری کاری شما اشاره دارد:

\`\`\`text
$ ./jazzer --cp=./ssrf-example/ --autofuzz=SsrfExample::getRequest
INFO: Loaded 3 hooks from com.code_intelligence.jazzer.sanitizers.ServerSideRequestForgery ❶
--snip--
== Java Exception: java.lang.NullPointerException: Cannot invoke "String.contains(java.lang. CharSequence)" because "<local2>" is null ❷
    at SsrfExample.getRequest(SsrfExample.java:10)
    at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
    at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke( NativeMethodAccessorImpl.java:77)
    at java.base/jdk.internal.reflect.DelegatingMethodAccessorImpl.invoke( DelegatingMethodAccessorImpl.java:43)
    at java.base/java.lang.reflect.Method.invoke(Method.java:568)
DEDUP_TOKEN: 2ea9a0845158cf78
== libFuzzer crashing input ==
MS: 0 ; base unit: 0000000000000000000000000000000000000000
\`\`\`

Jazzer به‌سرعت ورودی کرش‌کننده‌ای می‌یابد، اما اگرچه گزارش می‌دهد که هوک‌های Sanitizer SSRF را ❶ بارگذاری کرده، ورودی کرش‌کننده ناامیدکننده فقط یک اشاره‌گر خالی (Null Pointer) است که به یک استثنای هندل‌نشده ❷ منجر شده است. اگرچه کرش دادن یک برنامه وب همچنان می‌تواند جالب باشد، بعید است مهاجم بیرونی بتواند از آن بهره‌برداری کند. خوشبختانه Jazzer به شما اجازه می‌دهد با فلگ autofuzz_ignore این نوع یافته‌ها را نادیده بگیرید. دوباره با این فلگ اجرایش کنید:

\`\`\`text
$ ./jazzer --cp=./ssrf-example/ --autofuzz=SsrfExample::getRequest --autofuzz_ignore=java.lang.NullPointerException
--snip--
#3567 NEW cov: 5 ft: 5 corp: 2/38b lim: 38 exec/s: 0 rss: 734Mb L: 37/37 MS: 10 ShuffleBytes-Custom-CMP-Custom-InsertRepeatedBytes-Custom-CopyPart-Custom-InsertRepeatedBytes-Custom- DE: "/safepath"- ❶
...
== Java Exception: com.code_intelligence.jazzer.api.FuzzerSecurityIssueMedium: Server Side Request Forgery (SSRF) ❷
--snip--
== libFuzzer crashing input ==
MS: 2 CMP-Custom- DE: "/safepath"-; base unit: eeae22598bc50329d7e1b0e7ab5e6f141814f3f3 ❸
0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0x2f,0x73,0x61, 0x66,0x65,0x70,0x61,0x74,0x68,0x70,0x61,0x74,0x68,0xff,0xff,0xff,0x2f,0x73,0x61,0x66,0x65, 0x70,\\377\\377\\377\\377\\377\\377\\377\\377\\377\\377\\377\\377\\377\\377\\377/safepathpath\\377\\377\\377 /safep
artifact_prefix='./'; Test unit written to ./crash-c439bba4fb1debad0a282ea4a4a0ca1a6ac301d0
Base64: ////////////////////L3NhZmVwYXRocGF0aP///y9zYWZlcA==
\`\`\`

موفق شدید! همان‌طور که Jazzer ورودی‌هایش را با هدایت پوششی جهش می‌داد، ورودی‌ای که این آسیب‌پذیری را فعال کرد ❸ ترکیبی از کاراکترهای خاص و رشته /safepath بود؛ که نشان می‌دهد Jazzer با موفقیت بررسی را شناسایی و از آن عبور کرد.

البته اگر این تابع قرار است در استفاده معمول از برنامه وب فراخوانی شود، این یک قابلیت است نه باگ؛ پس علامت‌گذاری مشکل هر بار که درخواست وبی ارسال می‌شود، مفید نخواهد بود. همان‌طور که اشاره شد، می‌توانید رفتار Jazzer را با نوشتن Harness سفارشی خودتان تنظیم کنید. می‌توانید پیکربندی هوک را همان‌طور که در فهرست ۹-۵ نشان داده شده کنترل کنید؛ با تنظیم فهرستی از میزبان‌های هدف مجاز، مانند example.com. این به شما اجازه می‌دهد بررسی‌های اعتبارسنجی و پاک‌سازی هدف را به‌دقت تست کنید.

\`\`\`java
SsrfFuzzer.java
import com.code_intelligence.jazzer.api.FuzzedDataProvider;

public class SsrfFuzzer {
    public static void fuzzerTestOneInput(FuzzedDataProvider data) {
        SsrfExample ssrfExample = new SsrfExample();
        com.code_intelligence.jazzer.api.BugDetectors
❶            .allowNetworkConnections(
                (String h, Integer p) -> h.equals("example.com")
            );
❷        ssrfExample.getRequest(data.consumeRemainingAsAsciiString());
    }
}
\`\`\`

*فهرست ۹-۵: یک Harness سفارشی Jazzer با میزبان‌های مجازِ درخواست سمت سرور*

قرارداد نام‌گذاری متد از libFuzzer پیروی می‌کند که Jazzer بر پایه آن است. Jazzer این نام متد را به‌طور خودکار در کلاس تشخیص و اجرایش می‌کند. متد مشخص می‌کند که اتصالات شبکه به example.com ❶ مجازند پیش از آنکه تابع هدف با ورودی جهش‌یافته ❷ اجرا شود. برای سادگی، Jazzer فقط از ورودی‌های رشته ASCIIِ جهش‌یافته استفاده می‌کند تا از بایت‌های غیرASCII غیرضروری جلوگیری شود.

فایل SsrfFuzzer.java را در همان دایرکتوری فایل کامپایل‌شده SsrfExample.class قرار دهید، همراه با jazzer_standalone.jar از آرشیو نسخه Jazzer. این برای ایمپورت کلاس‌های Jazzer و هدف هنگام کامپایل Harness لازم است. در نهایت، Harness سفارشی را کامپایل و Jazzer را با گزینه target_class به‌جای autofuzz اجرا کنید:

\`\`\`bash
$ javac -cp "jazzer_standalone.jar:." SsrfFuzzer.java
$ cd ..
$ ./jazzer --cp=./ssrf-example/ --target_class=SsrfFuzzer
--snip--
== Java Exception: com.code_intelligence.jazzer.api.FuzzerSecurityIssueMedium: Server Side Request Forgery (SSRF)
Attempted connection to: example.comq:443 ❶
Requests to destinations based on untrusted data could lead to exfiltration of sensitive data or exposure of internal services.
If the fuzz test is expected to perform network connections, call com.code_intelligence.jazzer.api.BugDetectors#allowNetworkConnections at the beginning of your fuzz test and optionally provide a predicate matching the expected hosts.
    at com.code_intelligence.jazzer.sanitizers.ServerSideRequestForgery.checkSsrf( ServerSideRequestForgery.java:119)
--snip--
    at SsrfFuzzer.fuzzerTestOneInput(SsrfFuzzer.java:7)
\`\`\`

این بار، Sanitizer SSRF وقتی ورودی‌های فاز‌شده به درخواست‌های وبی به example.com می‌انجامند، خطایی فعال نمی‌کند، اما فقط وقتی درخواستی به میزبانِ خارج از فهرست سفید یعنی example.comq ❶ ارسال شود، فعال می‌شود. همان‌طور که این مثال نشان می‌دهد، به‌جای تلاش برای فهمیدن بررسی‌های پیچیده پاک‌سازی و اعتبارسنجی از طریق مهندسی معکوس بایت‌کد جاوا یا Brute-Force کردن فهرست‌های طولانی از کاراکترهای خاص، می‌توانید قدرت فازینگ هدایت-با-پوشش را برای یافتن کارآمد دورزدن‌ها در مقیاس بزرگ به کار بگیرید.

قابلیت یافتن آسیب‌پذیری Jazzer فقط به دامنه Sanitizerهایش محدود است. پس از افشای آسیب‌پذیری Log4Shell در ۲۰۲۱، بسیاری پرسیدند چرا ابزارهای تحلیل خودکار نتوانستند چنین مشکل حیاتی‌ای را در کتابخانه‌ای به‌شدت استفاده‌شده تشخیص دهند. یکی از پاسخ‌ها این بود که این ابزارها چاهکِ نادر اما مرگبارِ جستجوی Java Naming and Directory Interface (JNDI) راه‌دور را جستجو نمی‌کردند. در پاسخ به این، OSS-Fuzz با Jazzer شریک شد تا یک Sanitizer با نام NamingContext Lookup اضافه شود.

قابلیت گسترش Jazzer فرصت‌های هیجان‌انگیزی برای پژوهش‌های نوآورانه آسیب‌پذیری پیش روی شما می‌گذارد. در نهایت، بعید است اگر همان فازرها و پیکربندی‌های همه دیگران را استفاده کنید، چیز جدیدی بیابید. اما اگر بتوانید چاهک‌های بالقوه خطرناکی را که از دید جامعه عمومی پژوهشگران پنهان مانده‌اند شناسایی کنید، می‌توانید یک Sanitizer سفارشی بنویسید تا در مقیاس بزرگ فاز کنید. اگرچه می‌توانید از همان رویکرد نوشتن قوانین سفارشی تحلیل کد ایستا با تحلیل خودکار کد استفاده کنید، یکی از مزایای فازینگ این است که آسیب‌پذیری‌ها را در حین اجرا کشف می‌کند و می‌توانید در زمان اجرا مقادیر خاصی — مانند دامنه‌های خارج از فهرست سفید در مثال SSRF — را فیلتر کنید.


#### فازینگ در Go (Go Fuzzing)

از نسخه 1.18، زبان برنامه‌نویسی Go از فازینگ به‌عنوان قابلیت داخلی پشتیبانی می‌کند. این به توسعه‌دهندگان اجازه می‌دهد فازینگ را بخشی از مجموعه تست‌هایشان کنند که به یافتن حالت‌های خاصی کمک می‌کند که شاید در تست‌های واحد پوشش داده نشده باشند. قابلیت فازینگ Go به یافتن حالت‌های شکست از-پیش-تعریف‌شده به نام «Crasher» و خطاهای پیش‌فرض کمک می‌کند، به‌جای استفاده از Sanitizerها.

مثال قبلی جاوا را در نظر بگیرید که در آن، شکست یک بررسی اعتبارسنجی برای دامنه URL به یک آسیب‌پذیری SSRF منجر شد. فرض کنید توسعه‌دهنده‌ای تلاش می‌کند تابعی برای اعتبارسنجی دامنه رشته‌های URL بنویسد؛ مانند فهرست ۹-۶.

\`\`\`go
main.go
package main

import (
    "fmt"
    "regexp"
)

// Validates whether inputURL is a domain or subdomain of expectedDomain
❶func ValidateURLDomain(inputURL string, expectedDomain string) bool {
    // Escapes special characters in expectedDomain
    expectedDomain = regexp.QuoteMeta(expectedDomain)
    regexPattern := \`^https?://(?:[A-Za-z0-9-]+.)*\` + expectedDomain +
        \`($|/|\\?)\`
    regex, err := regexp.Compile(regexPattern)
    if err != nil {
        return false
    }
❷    return regex.MatchString(inputURL)
}

func main() {
    // Returns true
    fmt.Println(ValidateURLDomain("https://example.com", "example.com"))
    // Returns true
    fmt.Println(ValidateURLDomain("https://sub.example.com", "example.com"))
    // Returns false
    fmt.Println(ValidateURLDomain("https://evil.com", "example.com"))
}
\`\`\`

*فهرست ۹-۶: نمونه تابع اعتبارسنجی دامنه*

این تابع یک URL ورودی و دامنه مورد انتظار ❶ می‌گیرد و سپس از یک الگوی Regex استفاده می‌کند تا اطمینان حاصل شود دامنه در URL با دامنه مورد انتظار مطابقت دارد ❷. اما در این کد اشتباهی وجود دارد که به برخی ورودی‌ها اجازه می‌دهد این بررسی را دور بزنند — ببینید می‌توانید آن را پیدا کنید!

برای اجرای برنامه، مطمئن شوید Go را طبق دستورالعمل‌های https://go.dev/doc/install (شامل تنظیم PATH) دانلود و نصب کرده‌اید:

\`\`\`bash
$ wget https://go.dev/dl/go1.23.1.linux-amd64.tar.gz
$ tar -xvf go1.23.1.linux-amd64.tar.gz
$ sudo mv go /usr/local
$ echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.zshrc
\`\`\`

سپس main.go را در یک دایرکتوری کاری قرار دهید (یا از دایرکتوری مخزن کد کتاب یعنی chapter-09/go-example استفاده کنید). در آن دایرکتوری، دستورات زیر را اجرا کنید:

\`\`\`bash
$ go mod init example/fuzz
$ go run .
true
true
false
\`\`\`

فرض کنید با این تابع اعتبارسنجی در هدف‌تان روبه‌رو می‌شوید. شاید حس کنید که بالقوه آسیب‌پذیر است، زیرا از قابلیت پردازش URL کتابخانه استاندارد برای استخراج میزبان از URL استفاده نمی‌کند. با دسترسی به کد منبع، می‌توانید فازر هدایت-با-پوششی مانند فهرست ۹-۷ بنویسید که تلاش می‌کند این بررسی را دور بزند.

\`\`\`go
fuzz_test.go
package main

import (
    "net/url"
    "strings"
    "testing"
)

func FuzzValidateURLDomain(f *testing.F) {
❶    f.Add("https://example.com")
    domain := "example.com"
    f.Fuzz(func(t *testing.T, data string) {
        parsedURL, err := url.Parse(data)
        if (err == nil) {
            host := strings.ToLower(parsedURL.Host)
❷            if (ValidateURLDomain(data, domain) && host != domain &&
                !strings.HasSuffix(host, "."+domain)) {
                t.Errorf("Incorrectly validated %q", data)
            }
        }
    })
}
\`\`\`

*فهرست ۹-۷: یک فازر سفارشی برای تابع بررسی دامنه*

فازر یک ورودی Seed به شکل https://example.com ❶ اضافه می‌کند پیش از فاز کردن تابع اعتبارسنجی. Crasher بررسی می‌کند که آیا اعتبارسنجی عبور می‌شود حتی وقتی دامنه واقعی در ورودی فاز‌شده با دامنه مورد انتظاری که به تابع پاس داده شده ❷ مطابقت ندارد. فایل fuzz_test.go را در همان دایرکتوری قرار و فازر را اجرا کنید. طول نمی‌کشد که به Crasher خودتان برسید:

\`\`\`diff
$ go test -fuzz=FuzzValidateURLDomain
fuzz: elapsed: 0s, gathering baseline coverage: 0/397 completed
fuzz: elapsed: 0s, gathering baseline coverage: 1/397 completed
--- FAIL: FuzzValidateURLDomain (0.01s)
--- FAIL: FuzzValidateURLDomain (0.00s)
fuzz_test.go:19: Incorrectly validated "http://00example.com"
FAIL
exit status 1
FAIL    example/fuzz    0.009s
\`\`\`

فازر متوجه شد که http://00example.com بررسی را دور می‌زند. دلیلش این است که کد در فهرست ۹-۶ اشتباهی در الگوی Regex مورد استفاده ValidateURLDomain دارد؛ نقطه (Full Stop) را به‌درستی Escape نمی‌کند و باعث می‌شود به‌شکل کاراکتر Wildcard تفسیر شود.

فازر همچنین دایرکتوری testdata می‌سازد. علاوه بر استفاده از f.Add، می‌توانید فایل‌های Corpus اولیه اضافی را که به شکلی خاص قالب‌بندی شده‌اند در testdata/fuzz/FuzzValidateURLDomain قرار دهید. اگر برخی فایل‌ها در آن دایرکتوری را بررسی کنید، می‌بینید که فرمت Corpus اولیه شبیه سینتکس boofuzz است:

\`\`\`text
go test fuzz v1
string("http://00example.com")
\`\`\`

برای فایل‌های پیچیده‌تر می‌توانید از ابزار file2fuzz استفاده کنید تا به‌طور خودکار به این سینتکس تبدیل شوند. می‌توانید این را روی کتابخانه Golang یعنی snappy تمرین کنید که APIهای رمزگذاری و رمزگشایی برای فرمت فشرده‌سازی Snappy فراهم می‌کند. ابتدا آخرین نسخه (V0.0.4 در زمان نگارش این کتاب) را دانلود و استخراج کنید:

\`\`\`bash
$ wget https://github.com/golang/snappy/archive/refs/tags/v0.0.4.tar.gz
$ tar -xzvf v0.0.4.tar.gz
$ cd snappy-0.0.4
\`\`\`

گام بعد نوشتن یک فازر سفارشی است. می‌توانید از یک Harness ساده استفاده کنید که تابع رمزگشایی کتابخانه را فراخوانی می‌کند. کتابخانه snappy از Wrapperهای مختلفی دور این تابع بسته به محیط بیلد و فلگ‌ها پشتیبانی می‌کند؛ شامل یک پیاده‌سازی خالص Golang و یکی که به زبان اسمبلی نوشته شده. از آنجا که فازر داخلی نمی‌تواند پوشش را در اسمبلی کامپایل‌شده ردیابی کند، پیاده‌سازی Golang را فاز می‌کنید. فازر فهرست ۹-۸ را در دایرکتوری snappy-0.0.4 قرار دهید.

\`\`\`go
decode_test.go
package snappy

import (
    "testing"
)

func FuzzDecode(f *testing.F) {
    f.Fuzz(func(t *testing.T, data []byte) {
        var dst [1000000]byte
        decode(dst[:], data)
    })
}
\`\`\`

*فهرست ۹-۸: یک فازر سفارشی برای تابع decode در snappy*

فازر سفارشی صرفاً تابع decode را بدون Crasherهای اضافی فاز می‌کند. کد منبع از قبل یک فایل تست فرمت Snappy در testdata شامل می‌شود، پس می‌توانید آن را با file2fuzz به فرمت ورودی فازینگ تبدیل کنید. همین‌قدر برای شروع فازینگ کافی است:

\`\`\`bash
$ go install golang.org/x/tools/cmd/file2fuzz@latest
$ mkdir -p testdata/fuzz/FuzzDecode
$ file2fuzz -o testdata/fuzz/FuzzDecode testdata/Isaac.Newton-Opticks.txt.rawsnappy
$ go test -run=FuzzDecode -fuzz=FuzzDecode -tags=noasm -parallel=2
\`\`\`

از آنجا که هیچ Crasher اضافه‌ای به Harness اضافه نکردیم، فازر فقط روی کرش‌ها یا هنگ‌ها متوقف می‌شود. اگر میزبان شما حافظه کمی در دسترس دارد، ممکن است به‌سرعت با کرشی مواجه شوید که پیام خطایی مانند زیر پرتاب می‌کند:

\`\`\`diff
$ go test -run=FuzzDecode -fuzz=FuzzDecode -tags=noasm
--- FAIL: FuzzDecode (17.57s)
fuzzing process hung or terminated unexpectedly: exit status 2
Failing input written to testdata/fuzz/FuzzDecode/8e241dc44fa688fc
To re-run:
    go test -run=FuzzDecode/8e241dc44fa688fc
FAIL
exit status 1
FAIL    github.com/golang/snappy    18.030s
\`\`\`

پس از اجرای این، سعی کنید تست را دوباره اجرا کنید. به نظر می‌رسد بدون هیچ مشکلی اجرا می‌شود. زیرا decode تابع make را فراخوانی می‌کند تا حافظه هیپ برای نگهداری داده ازفشرده‌شده تخصیص دهد، که اگر پیش از آنکه زباله‌روبی بتواند حافظه را آزاد کند، بارها و بارها پشت‌سرهم اجرا شود، می‌تواند به فرسایش منابع منجر شود. این همان چیزی است که به آن نشتی حافظه (Memory Leak) می‌گویند.

یک راه برای آنکه نشست فازینگ بدون برخورد با این محدودیت طولانی‌تر اجرا شود، کاهش تعداد زیرپروسه‌های موازی با گزینه parallel است:

\`\`\`text
$ go test -fuzz=FuzzDecode -tags=noasm -parallel=2 -run=FuzzDecode
fuzz: elapsed: 0s, gathering baseline coverage: 0/126 completed
fuzz: elapsed: 3s, gathering baseline coverage: 11/126 completed
fuzz: elapsed: 6s, gathering baseline coverage: 125/126 completed
fuzz: elapsed: 9s, execs: 906 (260/sec), new interesting: 0 (total: 126)
fuzz: elapsed: 12s, execs: 924 (6/sec), new interesting: 0 (total: 126)
fuzz: elapsed: 15s, execs: 7359 (2145/sec), new interesting: 0 (total: 126)
fuzz: elapsed: 21s, execs: 44801 (4390/sec), new interesting: 0 (total: 126)
fuzz: elapsed: 24s, execs: 55334 (3510/sec), new interesting: 0 (total: 126)
\`\`\`

در این خروجی، تعدادی از اجراها فراتر از نشست فازینگ قبلی رفتند بدون برخورد با این مشکل فرسایش منابع. با وجود اجرای طولانی فازر، به نظر نمی‌رسد هیچ کرشی را فعال کند.

اگرچه قابلیت فازینگ داخلی Go راحت است، همچنان به کد منبع نیاز دارد و پیکربندی دستی بیشتری نسبت به Jazzer می‌خواهد. بدون Crasherهای سفارشی، بعید است آسیب‌پذیری‌های جالبی بیابید. علاوه بر این، در حالی که هوک‌های Sanitizer در Jazzer، APIهای سطح‌پایین جاوا را هدف می‌گیرند که بسیاری از برنامه‌های جاوا استفاده می‌کنند — و امکان بازاستفاده در اهداف متعدد را می‌دهند — فازینگ داخلی Go از هوک‌ها پشتیبانی نمی‌کند. بنابراین این رویکرد برای عمیق شدن در یک هدف خاص مناسب‌تر است؛ مانند دور زدن یک تابع حیاتی احراز هویت یا اعتبارسنجی (مانند مثال اول) از یک پکیج اعتبارسنجی Go یا در یک برنامه وب سفارشی.


### اهداف نحوی و معنایی (Syntactic and Semantic Targets)

وقتی پای جهش دادن ورودی‌ها به میان می‌آید، به نظر می‌رسد فازینگ برای فرمت‌های باینری مناسب‌تر از فرمت‌های مبتنی بر متن است. این موضوع فاز کردن فرمت‌های جالب را بدون ابزارهای اضافی دشوار می‌کند. با این حال، این فرمت‌های متنی همچنان در بسیاری از نرم‌افزارهای حیاتی‌ای که ممکن است به آن‌ها علاقه‌مند باشید، حضور دارند. در این بخش بررسی می‌کنیم فازرها چگونه می‌توانند جهش‌های معتبری برای فرمت‌های متنی پیچیده‌ای مانند HTML تولید کنند.

نخست، فایل HTML زیر را در نظر بگیرید:

\`\`\`html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>From Day Zero to Zero Day</title>
</head>
<body>
<h1>Chapter 0: Day Zero</h1>
<p>Hello World!</p>
<h2>What Is a Vulnerability?</h2>
<p>Visit <a href="https://spaceraccoon.dev">My Blog</a>.</p>
</body>
</html>
\`\`\`

بدون مقداری درک از فرمت HTML، یک فازر ساده‌انگار ممکن است با جهش دادن بایت‌های منفرد این فایل شروع کند که منجر به سینتکس HTML نامعتبر یا بدون هیچ اثری می‌شود. فرمت HTML جاافتاده است و بیشتر پردازشگرها در سطحی بالاتر از کاراکترهای منفرد عمل می‌کنند؛ مثلاً روی عناصر استاندارد HTML مانند <head> یا <body>. دو نوع پردازش در اینجا درگیرند: نحوی (Syntactic) و معنایی (Semantic).

پردازش نحوی به ساختار داده مربوط است. برای مثال، عناصر HTML با تگ‌ها محدود می‌شوند که استاندارد HTML (https://html.spec.whatwg.org) مشخص می‌کند باید با کاراکتر کمتر-از (<) شروع شوند و پس از آن، توکنایزر بسته به کاراکتر بعدی می‌تواند به هر یک از حالت‌های زیر سوییچ کند:

- U+0021 EXCLAMATION MARK (!): سوییچ به حالت اعلان Markup.
- U+002F SOLIDUS (/): سوییچ به حالت باز کردن تگ پایان.
- U+003F QUESTION MARK (?): این یک خطای پردازش unexpected-question-mark-instead-of-tag-name است. یک توکن کامنت با داده رشته خالی می‌سازد. در حالت Bogus Comment از نو مصرف می‌شود.
- EOF: این یک خطای پردازش eof-before-tag-name است. یک توکن کاراکتر U+003C LESS-THAN SIGN و یک توکن پایان فایل صادر می‌کند.
- هر چیز دیگری: این یک خطای پردازش invalid-first-character-of-tag-name است. یک توکن کاراکتر U+003C LESS-THAN SIGN صادر و در حالت داده از نو مصرف می‌شود.

استفاده از توکن‌ها و ماشین‌های حالت (State Machine) روشی رایج برای بیان سینتکس است و چنین مستنداتی را معمولاً در RFCها و استانداردهای فرمت می‌یابید.

پردازش معنایی به معنای داده مربوط است. برای مثال، استاندارد HTML چنین می‌گوید:

> عناصر، اتریبیوت‌ها و مقادیر اتریبیوت در HTML (توسط این مشخصات) دارای معانی خاصی (Semantics) تعریف شده‌اند. برای مثال، عنصر ol یک فهرست مرتب را بازنمایی می‌کند و اتریبیوت lang زبان محتوا را نشان می‌دهد.

هزارتویی کاملاً تاریک را در نظر بگیرید که فقط پیچ‌های ۹۰ درجه دارد. اگر این را از همان ابتدا می‌دانستید، وقت‌تان را صرف سرگردانی در جهات مختلف نمی‌کردید — فقط مستقیم می‌رفتید تا به دیوار بخورید، سپس چپ یا راست می‌شدید. اما اگر این درک از ساختار پایه هزارتو را نداشتید، احتمالاً ساعت‌ها بی‌دلیل زاویه‌ها و پیچ‌های مختلف را امتحان می‌کردید تا سرانجام حس کنید الگویی در حال ظهور است. به همین ترتیب، هرچه یک فرمت متنی خاص پیچیده‌تر باشد، درک ساختارش می‌تواند در اوایل کار، بیشتر به فازر کمک کند.

#### Dictionaryها (Dictionaries)

وقتی نحو و معنا را در نظر می‌گیرید، سفر فرود خود را به ریشه‌های عمیق‌تری آغاز می‌کنید: درخت‌های نحو، و بیشتر. هرچند آزادید که در تئوری عمیق شوید، بسیاری از ابزارها این موضوعات پژوهشی را در قابلیت‌هایی ادغام کرده‌اند که همین حالا می‌توانید مستقرشان کنید. AFL و AFL++ از Dictionaryها پشتیبانی می‌کنند که عملاً فهرست‌هایی از توکن‌های رایجِ استفاده‌شده در یک فرمت هستند. به‌جای جهش دادن بایت‌های منفرد، استفاده از Dictionary به فازر اجازه می‌دهد توکن‌ها را در ورودی Seed تشخیص دهد و بر اساس آن‌ها اصلاح یا تزریق کند.

برای مثال، Dictionary مربوط به HTML در dictionaries/html_tags.dict از کد منبع AFL++ این توکن‌ها را دارد:

\`\`\`text
#
# AFL dictionary for HTML parsers (tags only)
# -------------------------------------------
#
# A basic collection of HTML tags likely to matter to HTML parsers. Does *not*
# include any attributes or attribute values.
#
# Created by Michal Zalewski
#
tag_a="<a>"
tag_abbr="<abbr>"
tag_acronym="<acronym>"
tag_address="<address>"
tag_annotation_xml="<annotation-xml>"
tag_applet="<applet>"
tag_area="<area>"
\`\`\`

می‌توانید روش‌های مختلف استفاده از Dictionary را با AFL++ روی w3m بیازمایید؛ مرورگر وب متنی که فایل‌های HTML را پردازش می‌کند. ابتدا w3m را با ابزارسازی دانلود و بیلد کنید:

\`\`\`bash
$ sudo apt-get install -y libgc-dev libglib2.0-dev
$ git clone https://github.com/tats/w3m
$ cd w3m
$ CC=afl-clang-fast CXX=afl-clang-fast++ ./configure
$ make w3m
\`\`\`

برای Corpus ورودی، می‌توانید از فایل‌های HTML در دایرکتوری test استفاده کنید. در این نقطه چند گزینه برای استفاده از Dictionary دارید:

- **دستی:** از Dictionary دستی تگ‌های HTML که توسط AFL++ فراهم شده استفاده کنید.
- **خودکار-تولید:** از قابلیت Autodictionary در AFL++ استفاده کنید تا بر اساس مقایسه‌های رشته‌ای در حین کامپایل، یک Dictionary تولید شود. توجه کنید که این به‌طور پیش‌فرض برای ابزارسازی afl-clang-lto گنجانده شده است.
- **هیچ‌کدام:** فقط بر فازینگ هدایت-با-پوشش اتکا کنید.

می‌توانید این گزینه‌ها را با دستورات زیر تست کنید:

\`\`\`bash
$ mkdir fuzz-in
$ cp tests/*.html fuzz-in/
❶$ afl-fuzz -i fuzz-in -o fuzz-out-dict -x /home/kali/Desktop/AFLplusplus/dictionaries/html_tags.dict -- ./w3m @@
❷$ make clean
$ AFL_LLVM_DICT2FILE=/home/kali/Desktop/auto.dict make w3m
$ afl-fuzz -i fuzz-in -o fuzz-out-autodict -x /home/kali/Desktop/auto.dict -- ./w3m @@
❸$ afl-fuzz -i fuzz-in -o fuzz-out -- ./w3m @@
\`\`\`

نخست، رویکرد دستی ❶ از Dictionary داخلی تگ‌های HTML در AFL++ استفاده می‌کند. دوم، رویکرد خودکار-تولید ❷ همه مقادیر مقایسه رشته‌ای را در یک فایل Dictionary می‌نویسد که توسط AFL++ قابل استفاده است. سوم، می‌توانید بدون هیچ Dictionary‌ای ❸ فاز کنید.

اگرچه مستندات AFL++ بیان می‌کند قابلیت Autodictionary از نظر آماری پوشش را ۵ تا ۱۰ درصد بهبود می‌دهد، اثر واقعی استفاده از Dictionary بسته به هدف و Dictionary، طبعاً بسیار متفاوت است. برای مثال، اگر Dictionary خودکار-تولیدی که ساختید را بررسی کنید، می‌بینید بسیاری از توکن‌ها به‌طور خاص مرتبط با فرمت HTML به نظر نمی‌رسند:

\`\`\`text
$ head -n 20 /home/kali/Desktop/auto.dict
"\\xfd\\xff\\xff\\x03"
"\\xfe\\xff\\xff\\x03"
"content-type"
"user-agent"
"Download List Panel"
"\\xfd\\xff\\xff\\x03"
"\\xfc\\xff\\xff\\x03"
"\\xfd\\xff\\xff\\x03"
"\\xfc\\xff\\xff\\x03"
"\\xfd\\xff\\xff\\x03"
"\\xfc\\xff\\xff\\x03"
"\\xfd\\xff\\xff\\x03"
"\\xfc\\xff\\xff\\x03"
"!CURRENT_URL!"
"map"
"none"
"\\x00\\x00\\x00\\x10"
"\\x00\\x00\\x00\\x10"
"\\x00\\x00\\x00\\x10"
"\\x00\\x00\\x00\\x10"
\`\`\`

به‌جز "content-type" و "user-agent"، بیشتر این رشته‌ها به‌وضوح به HTML ربطی ندارند.

یک راه برای ارزیابی مفید بودن یک Dictionary، ردیابی تغییرات پوشش در طول زمان با استفاده از داده‌های دایرکتوری خروجی فازینگ است. این برای تصمیم‌گیری درباره اینکه چه زمانی فازینگ را متوقف کنید مفید است. برای مثال، برای تولید نمودارهای نشست فازینگ با Dictionary دستی، اجرا کنید:

\`\`\`bash
$ afl-plot ~/Desktop/w3m/fuzz-out-dict/default ~/Desktop/fuzz-out-dict-graph
\`\`\`

این به شما اجازه می‌دهد پیشرفت پوشش را برای گزینه‌های مختلف Dictionary مقایسه کنید. هر سه را مقایسه کنیم. نمودار نشست فازینگ بدون Dictionary در شکل ۹-۱ نشان داده شده است.

![Figure 9-1](/images/fig-9-1.png)

*Figure 9-1: Edge coverage over time with no dictionary*

توجه کنید که پوشش در ابتدا نسبتاً فلات است و فقط نزدیک به علامت ۶۰۰ ثانیه به‌طور تند افزایش می‌یابد. پس از آن، افزایش تند دیگری حدود علامت ۱٬۳۰۰ ثانیه رخ می‌دهد. فقدان پیشرفت اولیه، چالش‌های فازینگ بدون Dictionary را بازتاب می‌دهد؛ حتی یک فازر هدایت-با-پوشش ممکن است برای تولید ورودی معتبر، تکرارهای زیادی نیاز داشته باشد. با استفاده از تشبیه قبلیِ یافتن راه در هزارتوی تاریک، معمولاً مدت زیادی سرگردانی در تاریکی طول می‌کشد تا الگویی شناسایی کنید. پس از آن، می‌توانید بسیار سریع‌تر پیشرفت کنید.

اکنون این را با نمودار نشست فازینگ با Dictionary خودکار-تولید در شکل ۹-۲ مقایسه کنید.

![Figure 9-2](/images/fig-9-2.png)

*Figure 9-2: Edge coverage over time with an autogenerated dictionary*

این بار پوشش از پایه‌ای بسیار بالاتر نسبت به شکل ۹-۱ شروع می‌شود. با این حال، پس از یک افزایش اولیه، پوشش مدت طولانی فلات می‌شود پیش از اینکه دوباره بالا برود. Dictionary به‌وضوح به پوشش اولیه کمک کرد، اما سپس به نظر می‌رسد نشست فازینگ در یک ماکزیمم محلی گیر کرده است.

با برگشتن به تشبیه هزارتو، این مثل ورود به هزارتو با مجموعه‌ای از سرنخ‌ها درباره ساختارش است، اما که شاید نیمی از سرنخ‌ها غلط‌اند (شبیه ورودی‌های نادرست در Dictionary خودکار-تولید). بنابراین اگرچه شاید ابتدا بتوانید پیشرفت کنید، اتکا به برخی سرنخ‌های نادرست ممکن است شما را در دایره‌های سرگردانی نگه دارد تا با آزمون و خطا بفهمید کدام‌ها غلط بودند. پس از آن، یک‌بار دیگر می‌توانید بسیار سریع‌تر در هزارتو حرکت کنید. در این معنا، یک Dictionary بدساخته گاهی حتی می‌تواند مانع بزرگی‌تر از نداشتن Dictionary باشد.

سرانجام، بیایید دو نمودار قبلی را با نمودار نشست فازینگ با Dictionary دستی در شکل ۹-۳ مقایسه کنیم.

![Figure 9-3](/images/fig-9-3.png)

*Figure 9-3: Edge coverage over time with a manual dictionary*

این بار، پوشش نه‌تنها از پایه بالایی شروع می‌شود بلکه پیش از جهش به بالای ۱٬۳۰۰ لبه در علامت ۶۰۰ ثانیه — خیلی زودتر از دو مورد قبلی — به‌سرعت بالا می‌رود. این نشان می‌دهد که با یک Dictionary خوش‌ساخت، فازر به‌طور کلی بهترین عملکرد را خواهد داشت. با این حال، توجه کنید که در نهایت، هر سه نشست فازینگ به سطوح مشابهی از پوشش می‌رسند، وقتی روی مجموعه‌های مشترکی از جهش‌ها و ورودی‌هایی همگرا می‌شوند که بیشترین پوشش را فعال می‌کنند.

در نتیجه، اگرچه Dictionaryها در اوایل فازینگ ضربه‌ای تقویتی می‌زنند، منافع بلندمدت داشتن یک Dictionary خوب بسته به پیچیدگی ورودی‌ها و هدف متفاوت است. برای نشست فازینگی بدون Dictionary، رسیدن به ورودی‌های معتبر برای فرمت‌هایی که به توکن‌های خاص زیادی در ترتیب خاص نیاز دارند، بسیار طولانی‌تر خواهد بود.

#### گرامرها (Grammars)

اگرچه Dictionaryهای مبتنی بر توکن می‌توانند به سینتکس‌های پایه‌ای‌تر کمک کنند، برای جهش دادن ورودی‌های پیچیده — مانند زبان‌های برنامه‌نویسی — کافی نیستند. در این موارد، نه‌تنها مقدار توکن‌ها مهم است بلکه ترتیبشان هم مهم است. برای مثال، یک Object Literal جاوااسکریپت باید با آکولاد باز شروع شود و شامل جفت‌های کلید/مقدار جداشده با کاما باشد و با آکولاد بسته پایان یابد. یکی از راه‌های بیان این، استفاده از گرامرهاست.

AFL++ پروژه‌ای به نام Grammar Mutator را (https://github.com/AFLplusplus/Grammar-Mutator) شامل می‌شود که به پژوهشگران اجازه می‌دهد Mutatorهای سفارشی مبتنی بر گرامر بسازند. این گرامرها از جفت‌های کلید/مقدار تشکیل شده‌اند؛ کلید، یک توکن گرامری را بازنمایی می‌کند و مقدار شامل ترکیبی از رشته‌ها و ارجاع‌هایی به سایر توکن‌های گرامری است. برای مثال، گرامر جاوااسکریپت، یک Object و عضو Object را چنین بازنمایی می‌کند:

\`\`\`text
"<OBJECT>": [
    [ "<IDENTIFIER>" ],
    [ "{", "<OBJMEMBER>", "}" ],
    [ "{}" ]
],
"<OBJMEMBER>": [
    [ "<VAR>", ": ", "<LITERAL>", ", ", "<OBJMEMBER>" ],
    [ "<VAR>", ": ", "<LITERAL>" ]
]
\`\`\`

کمی وقت بگذارید و فایل‌های گرامر ارائه‌شده را تحلیل کنید و می‌بینید که به دلیل ماهیت بازگشتی‌شان، به شما اجازه می‌دهند سینتکس‌های پیچیده را به‌طور موجز بیان کنید. برای مثال، سند JSON مانند زیر را در نظر بگیرید:

\`\`\`json
{
❶    "foo": {
        "bar": {
❷            "baz": [ "qux", [], 4 ]
        },
        "xyzzy": [ 1, 2, 3 ]
    }
}
\`\`\`

چگونه اعتبارسنجی می‌کنید که چنین رشته‌ای یک JSON معتبر است؟ انعطاف فرمت، این کار را برای یک پردازشگر تکراریِ ساده‌ای که هر جفت کلید/مقدار سطح-بالا را برای صحت بررسی می‌کند، دشوار می‌کند. یک Object می‌تواند شامل Objectهای تودرتو ❶ و آرایه‌ها ❷ باشد. ببینیم این در گرامر Grammar Mutator برای JSON چگونه بیان شده است:

\`\`\`json
{
    "<start>": [["<json>"]],
    "<json>": [["<element>"]],
❶    "<element>": [["<value>"]],
❷    "<value>": [["<object>"], ["<array>"], ["<string>"], ["<number>"], ["true"], ["false"], ["null"]],
❸    "<object>": [["{}"], ["{", "<members>", "}"]],
    "<members>": [["<member>", "<symbol-2>"]],
❹    "<member>": [["<string>", ":", "<element>"]],
    "<array>": [["[]"], ["[", "<elements>", "]"]],
    "<elements>": [["<element>", "<symbol-1-1>"]],
    "<string>": [["\\"", "<characters>", "\\""]],
    --snip--
}
\`\`\`

این گرامر تعریف می‌کند توکن json شامل عنصری است که معادل توکن value ❶ است. به نوبه خود، این می‌تواند یک Object، آرایه، رشته، عدد یا یکی از سه رشته دیگر که مقادیر معتبر JSON هستند ❷ باشد. برای توکن object، به‌شکل مجموعه‌ای خالی از آکولادها یا توکن member محصور در آکولادها ❸ تعریف می‌شود. اگر این رد را ادامه دهید، می‌بینید که سرانجام یک member را به‌شکل رشته توکنِ جداشده با دونقطه برای کلید و یک توکن element برای مقدار تعریف می‌کند و یک بازگشت (Recursion) ❹ می‌سازد. با چند خط، گرامر طیف عظیمی از مقادیر ممکن JSON را به‌شکل اعلانی بیان می‌کند.

علاوه بر JSON، Grammar Mutator همراه با گرامرهای از-پیش-نوشته‌شده برای HTTP، جاوااسکریپت و روبی می‌آید. تعجب‌آور نیست، زیرا بسیاری از فرمت‌ها از قبل گرامرهایشان را در RFCها و استانداردهایشان تعریف کرده‌اند. برای مثال، RFC مربوط به JSON در https://datatracker.ietf.org/doc/html/rfc8259 چنین می‌گوید:

> یک ساختار Object به‌شکل جفتی از آکولادها بازنمایی می‌شود که صفر یا بیشتر جفت نام/مقدار (یا member) را در بر می‌گیرند. یک نام، رشته است. یک دونقطه منفرد پس از هر نام می‌آید و نام را از مقدار جدا می‌کند. یک کاما منفرد، یک مقدار را از نام بعدی جدا می‌کند. نام‌های درون یک Object باید یکتا باشند (SHOULD).

\`\`\`text
object = begin-object [ member *( value-separator member ) ]
         end-object
member = string name-separator value
\`\`\`

خطوط سینتکس، ساختار مشابهی برای Objectها با نمادگذاری بازگشتی بیان می‌کنند. با خواندن مستندات یک فرمت و تبدیل آن به گرامری برای Grammar Mutator یا ابزارهای دیگر، می‌توانید به‌سرعت فازینگ مبتنی بر گرامر را برای تولید کارآمد ورودی‌های معتبر اعمال کنید.

همان‌طور که مستندات Grammar Mutator توضیح می‌دهد، برای استفاده از یک Mutator سفارشی با AFL++ باید Mutator را بیلد و Mutator پیش‌فرض AFL++ را با متغیرهای محیطی جایگزین کنید:

\`\`\`bash
$ make GRAMMAR_FILE=grammars/ruby.json
$ export AFL_CUSTOM_MUTATOR_LIBRARY=./libgrammarmutator-ruby.so
$ export AFL_CUSTOM_MUTATOR_ONLY=1
$ afl-fuzz -m 128 -i seeds -o out -- /path/to/target @@
\`\`\`

این کار بهبود فازینگ AFL++ با جهش‌های مفیدتر را ساده می‌کند. با این حال، ساختن گرامرهای صحیح برای زبان‌های برنامه‌نویسی پیچیده می‌تواند چالش‌برانگیز باشد. برای این کار، لازم است یک سطح عمیق‌تر در بازنمایی کد بروید.

#### بازنمایی‌های میانی (Intermediate Representations)

شاید از بخش اول به یاد بیاورید که کد را می‌توان در درجات مختلف انتزاع بازنمایی کرد؛ مانند درخت نحو انتزاعی (AST). به‌جای استفاده از گرامرها، برخی فازرها تلاش می‌کنند یک AST بسازند و جهش دهند و سپس آن را به کد واقعی برگردانند (Lift)؛ جایی که جهش‌های منفرد اثر معنایی بیشتری دارند، نه در سطح بایت.

پروژه اخیری که این رویکرد را گسترش می‌دهد، Fuzzilli است؛ یک فازر هدایت-با-پوشش برای مفسرهای زبان‌های داینامیک. Fuzzilli از زبان میانی به نام FuzzIL استفاده می‌کند، نه AST یا گرامر تعریف‌شده. این زبان میانی برای جهش‌های فازینگ بهینه شده و به Fuzzilli اجازه می‌دهد به‌سرعت ورودی‌های جالبی تولید کند که از نظر تئوری می‌توانند به سایر زبان‌های برنامه‌نویسی برگردانده شوند، اگرچه فقط جاوااسکریپت را هدف می‌گیرد. برای بررسی عمیق قابلیت‌های Fuzzilli، https://github.com/googleprojectzero/fuzzilli/blob/main/Docs/HowFuzzilliWorks.md را ببینید.

از آنجا که Fuzzilli نیاز دارد موتور جاوااسکریپت هدف در یک حلقه خواندن-ارزیابی-چاپ-بازنشانی (Read–Eval–Print–Reset) خاص اجرا شود، این همچنین مستلزم اعمال وصله‌های سفارشی روی موتور هدف است. اگرچه به‌سادگی گردش کار AFL++ نیست، نتایج خودشان گویاست: گالری افتخارات باگ‌های Fuzzilli شامل آسیب‌پذیری‌هایی در JavaScriptCore مربوط به Safari، SpiderMonkey مربوط به Firefox و موتور V8 در Chromium است. می‌توانید Fuzzilli را روی اهدافی که سایر مشارکت‌کنندگان یکپارچه کرده‌اند امتحان کنید؛ مانند موتور جاوااسکریپت Hermes متعلق به Meta.

در مجموع، رویکرد Fuzzilli نشان می‌دهد که ساختن Mutatorهای سفارشی برای فرمت‌های پیچیده مانند زبان‌های برنامه‌نویسی ارزش دارد. اگرچه همیشه ممکن نیست از ابزارهای استاندارد و آماده استفاده کنید، می‌توانید آن‌ها را با سفارشی‌سازی‌های خودتان یکپارچه کنید. در واقع، این احتمالاً نتایج بهتری می‌دهد، زیرا بعید است دیگران بتوانند هدف شما را به همان شیوه فاز کرده باشند.

### خلاصه (Summary)

فازینگ یکی از قدرتمندترین راه‌های کشف آسیب‌پذیری در یک هدف را ارائه می‌دهد. با گسترش زرادخانه قابلیت‌های فازینگ‌تان، می‌توانید فازینگ را روی طیف گسترده‌تری از اهداف اعمال کنید — نه فقط باینری‌های متن‌باز.

ابزارهای مدرن به شما اجازه می‌دهند بدون ابزارسازی زمان کامپایل، از فازینگ هدایت-با-پوشش بهره ببرید. در این فصل آموختید از این ابزارها برای فاز کردن باینری‌های جعبه‌سیاه و حافظه-مدیریت‌شده استفاده کنید. علاوه بر این، Sanitizerهای سفارشی نوشتید تا آسیب‌پذیری‌های مخصوص یک هدف خاص را تشخیص دهید. همچنین روش‌های مختلف مدیریت سینتکس و معنایی پیچیده‌تر در فرمت‌های فایل متنی را مقایسه کردید.

اگرچه وسوسه‌انگیز است که به روش‌های اثبات‌شده و قابل اعتماد تست مانند بازبینی کد و مهندسی معکوس — یا حتی تست داینامیک جعبه‌سیاه (به بیان دیگر، «فازینگ دستی») — پناه ببرید، سرمایه‌گذاری روی یک خط لوله (Pipeline) فازینگ مستحکم، در بلندمدت جواب می‌دهد.

روش‌های غیرمعمول به نتایج غیرمعمول می‌انجامند؛ با فاز کردن جسورانه جایی که هیچ‌کس قبلاً فاز نکرده، آسیب‌پذیری‌های نوآورانه‌ای در مکان‌های شگفت‌انگیز کشف خواهید کرد. پژوهشگران اغلب بیش از حد تخمین می‌زنند که یک هدف حیاتی تا چه اندازه فراتر از سطح، واقعاً تست شده است. با توجه به پیچیدگی نرم‌افزار مدرن و تارعنکبوت عظیمِ کد Legacy که بر آن تکیه دارد، آسیب‌پذیری‌های بی‌شماری هنوز منتظر کشف شدن‌اند. تنها چیزی که لازم است، رویارویی با هدف با مجموعه‌ای از ابزارها یا استراتژی‌هایی مانند آنچه در چند فصل اخیر آموختید، مقداری پشتکار و اندکی خلاقیت است.`,
};
