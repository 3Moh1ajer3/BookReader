import { Chapter } from "@/types/reader";

export const CHAPTER_8_FA: Chapter = {
  id: "ch-8",
  title: "فصل ۸: فازینگ هدایت‌شده با پوشش کد (Coverage-Guided Fuzzing)",
  readingTimeMinutes: 45,
  content: `## فصل ۸: فازینگ هدایت‌شده با پوشش کد (Coverage-Guided Fuzzing)

> *«سرعت، فضایی برای آغاز می‌سازد که ممکن است مرگبار باشد؛ تنها قاعده‌اش این است که هیچ ردپایی بر جای نگذارد.»*
> — ژان بودریار، *آمریکا*

یکی از بزرگ‌ترین نقاط قوت فازینگ مبتنی بر جهشِ جعبه‌سیاه، نیاز بسیار کم آن به راه‌اندازی است. پس از جمع‌آوری Corpus اولیه، تنها کاری که باید بکنید اجرای فازر و انتظار برای کرش‌ها یا رفتارهای غیرمنتظره‌ای است که به آسیب‌پذیری‌های بالقوه — مانند باگ‌های خرابی حافظه — اشاره دارند. این، آسایش خوشایندی نسبت به ساعت‌ها مهندسی معکوس طاقت‌فرسا و بازبینی کد منبع است.

با این حال، اگرچه این رویکرد در روزگار طلاییِ کدهای ناامن و میوه‌های فراوان در دسترس به‌خوبی جواب می‌داد، فازینگ جعبه‌سیاه در برابر نرم‌افزارهای سخت‌گیرانه‌محافظت‌شده کمتر مؤثر شده است. بیشتر باگ‌های آشکار خرابی حافظه با روش‌های توسعه نرم‌افزار ایمن (شامل خودِ فازینگ) یافته و رفع شده‌اند. برای یافتن آسیب‌پذیری‌های عمیق‌تر و ماجراجویی جسورانه در جایی که هیچ فازری پیش از آن نرفته، فازرهای مدرن از فازینگ هدایت‌شده-با-پوشش (Coverage-Guided Fuzzing) استفاده می‌کنند؛ روشی که در آن، جهش‌های آینده با داده پوشش کدِ ورودی‌های قبلی هدایت می‌شوند. هدف، حداکثر کردن پوشش کد برنامه فاز‌شده است تا فازر به بخش‌های جدید و جالب‌تری از برنامه برسد که قبلاً فاز نشده‌اند.

در این فصل با فازینگ هدایت‌شده-با-پوشش آشنا می‌شوید و با AFL++ آسیب‌پذیری‌هایی در LibreDWG کشف می‌کنید. یک Harness سفارشی می‌نویسید و آن را با حذف موانع فازینگ (Fuzz Blocker) بهینه می‌کنید. سپس از Fuzz Introspector برای تحلیل پوشش فازینگ و شناسایی اهداف اصلی فازینگ استفاده خواهید کرد.

### مزایای فازینگ هدایت‌شده-با-پوشش (Advantages of Coverage-Guided Fuzzing)

در فصل ۷ به سری «Fuzzing Like a Caveman» اشاره کردم که ساخت فازر را از اصول اولیه به شما می‌آموزد. برخلاف فازینگ سنتی جعبه‌سیاه که برنامه هدف را مستقیماً اجرا می‌کند، فازینگ «مانند یک انسان مدرن» با یک Harness به‌شدت بهینه و ابزارسازی‌شده انجام می‌شود.

Harness برنامه‌ای تخصصی و سفارشی‌ساخته است که توابع مشخصی را از یک کتابخانه هدف ایمپورت و اجرا می‌کند یا بخش‌های خاصی از یک فایل اجرایی هدف را اجرا می‌نماید. با ایفای نقش واسطه یا Wrapper دور هدف، فاز کردن را آسان‌تر می‌کند؛ مثلاً با فراهم کردن رابط راحت‌تری برای ورودی‌ها یا رد کردن بخش‌های بی‌اهمیت هدف. Harness همچنین می‌تواند بهینه‌سازی‌های سرعتی مانند اجرای موازی را ممکن کند.

بدون یک Harness بهینه، فازینگ می‌تواند بسیار کند باشد. باز کردن یک سند در Microsoft Word برای کاربر معمولی با یک کامپیوتر متوسط، سرعت قابل قبولی دارد، اما بعید است بتوانید بدون منابع محاسباتی عظیم، به هزاران تکرار در ثانیه برسید. به‌علاوه، همه برنامه‌ها ابزارهای خط فرمان ساده‌ای نیستند که ورودی تک‌فایلی بپذیرند. با ایزوله کردن یک تابع یا مجموعه دستورالعمل مشخص با یک Harness، می‌توانید با رد کردن بخش‌های غیرضروری برنامه که با داده فاز‌شده شما تعامل ندارند، سرعت را بالا ببرید.

علاوه بر این، بدون سازوکار بازخورد از ابزارسازی، دامنه تست‌ها عمدتاً به یک قالب دستی یا Corpus اولیه محدود می‌شود. این یعنی مجموعه جهش‌های ممکن به فیلدهای خاصی از قالب یا واریانت‌های آن محدود می‌شود. با فازینگ هدایت‌شده-با-پوشش، جهش‌هایی که به بخش‌های بیشتری از برنامه می‌رسند ذخیره و برای تولید تست‌های اضافی به کار می‌روند.

برای نشان دادن قدرت این موضوع، برنامه‌ای را در نظر بگیرید که فرمت فایل PNG را پردازش می‌کند. غیر از چک‌سام CRC که در فصل قبل بحث شد، برنامه باید بتواند انواع دیگر «Chunk» ها را هم هندل کند؛ مانند:

- هدر تصویر (IHDR)
- پالت رنگ (PLTE)
- داده تصویر (IDAT)
- رنگ پس‌زمینه (bKGD)
- گاما تصویر (gAMA)
- داده متنی (tEXt)
- شفافیت (tRNS)

همراه با دستور switch برای هندل کردن انواع Chunk مختلف، برنامه مسیرهای انشعابی دیگری هم دارد که بر اساس داده داخل هر نوع است. برای مثال، Chunk هدر تصویر شامل عدد صحیح تک‌بایتی‌ای است که ترتیب انتقال داده را مشخص می‌کند: ۰ (بدون Interlace) یا ۱ (Interlace نوع Adam7). بنابراین شبه‌کد این پردازشگر PNG فرضی چنین شکلی دارد:

\`\`\`python
def parse_png(data):
    while data:
        --snip--
        if chunk_type == "IHDR":
            # Handle IHDR chunk
❶            interlace_type = read_byte(chunk_data)
        elif chunk_type == "PLTE":
            # Handle PLTE chunk
        elif chunk_type == "IDAT":
            # Handle IDAT chunk
            if interlace_type == NO_INTERLACE:
                # Process scanlines normally
❷            elif interlace_type == ADAM7_INTERLACE:
                # Process scanlines with Adam7 interlacing
\`\`\`

یک فازر جعبه‌سیاه هیچ راهی ندارد که بفهمد برگرداندن نوع Interlace ❶ می‌تواند بعداً ❷ دستورالعمل‌های جدیدی را فعال کند. البته می‌توانید به‌طور دستی مقادیر ثابتی را در قالب فرمت مشخص کنید تا به‌طور خاص Interlace نوع Adam7 هدف گرفته شود، اما این به‌شدت به قضاوت شخصی شما وابسته است و ممکن است سناریوهای دیگری را از قلم بیندازید.

وعده فازینگ هدایت‌شده-با-پوشش این است: با ابزارسازی برنامه در زمان کامپایل و اجرا، فازر می‌تواند پوشش هر ورودی جهش‌یافته را ردیابی و روی ورودی‌هایی که پوشش بیشتری فعال می‌کنند تکرار کند. این کار به‌سرعت تست‌های جالب‌تری تولید می‌کند که بدون دخالت دستی می‌توانند آسیب‌پذیری‌های جدیدی بیابند.

علاوه بر این، فازینگ هدایت‌شده-با-پوشش می‌تواند به عبور نشست فازینگ از بررسی‌های اعتبارسنجی مانند بایت‌های جادویی (Magic Bytes) کمک کند. در پست وبلاگی با عنوان «afl-fuzz: Making Up Grammar with a Dictionary in Hand» (https://lcamtuf.blogspot.com/2015/01/afl-fuzz-making-up-grammar-with.html)، میخاو زالفسکی — خالق American Fuzzy Lop (AFL) — نشان داد چگونه می‌توان با الگوریتم هدایت-با-پوشش، توکن‌های مهم را در فایل‌های PNG به‌طور خودکار شناسایی کرد؛ مانند نام‌های Chunk:

> فرمت PNG از مقادیر جادویی ۴ بایتیِ خوانا برای انسان برای نشان دادن ابتدای هر بخش استفاده می‌کند؛ مثلاً:
>
> الگوریتم مورد بحث می‌تواند «IHDR» را به‌عنوان یک توکن نحوی شناسایی کند، با سوار شدن روی برگرداندن‌های بیتیِ قطعی و ترتیبی که afl-fuzz از قبل روی کل فایل انجام می‌دهد. این کار با شناسایی دنباله‌هایی از بایت‌ها انجام می‌شود که یک خاصیت ساده را ارضا می‌کنند: برگرداندن آن‌ها مسیر اجرایی متفاوتی فعال می‌کند که با حاصلِ برگرداندن بایت‌های نواحی همسایه متفاوت اما در سراسر دنباله بایت‌ها یکسان است.

البته این برای بررسی‌های پیچیده‌تر مانند اعتبارسنجی CRC کمکی نمی‌کند. باید این گلوگاه‌ها را یا پیش از شروع فازینگ — با مطالعه مشخصات فرمت — یا پس از یک دور اولیه فازینگ — با تحلیل پوشش کلی — شناسایی کنید. سرراست‌ترین راه حل این مشکل، وصله کردن (Patch) آن در کد منبع است. با این حال، این ریسک ایجاد مثبت‌های کاذب از تست‌های کرش‌کننده‌ای را دارد که روی هدف اصلی کار نمی‌کنند.

بیشتر فازرهای مدرن به دلایلی که در این بخش بحث شد، هدایت‌شده-با-پوشش‌اند. اما این به آن معنا نیست که فازرهای «کور» جایگاهی در جعبه‌ابزار پژوهشی شما ندارند؛ آن‌ها صرفاً هدف متفاوتی دارند. رویکردهای سریع و بدوی در مراحل اولیه گردش کار فازینگ برای شناسایی میوه‌های در دسترس یا نقاط مشکل‌ساز مفیدند. علاوه بر این، فازرهای «کور» در موقعیت‌های جعبه‌سیاه می‌درخشند که هدف، دشوار ابزارسازی شود یا نوشتن Harness برایش سخت باشد.

### فازینگ با AFL++ (Fuzzing with AFL++)

یکی از پربارترین پروژه‌های فازینگ اجتماعی، American Fuzzy Lop plus plus (AFL++) است؛ جانشین (و «انشعاب برتر») AFLِ امروز-متروک‌شده. به‌عنوان یک پروژه اجتماعی بسیار فعال، AFL++ مدام قابلیت‌هایی می‌افزاید که تکنیک‌ها و پژوهش‌های جدید فازینگ را یکپارچه می‌کنند. همچنین بسیاری از مسائل عملیِ رایج پژوهشگران — مانند فاز کردن اهدافِ فقط-باینری (Binary-Only) — را حل می‌کند.

اگرچه AFL++ ایمیج‌های Container توزیع می‌کند، توصیه می‌کنم خودتان آن را بیلد و نصب کنید تا از مشکلات مصرف منابع جلوگیری و دیباگ مسائل راحت‌تر شود. دستورالعمل‌های https://github.com/AFLplusplus/AFLplusplus/blob/stable/docs/INSTALL.md را دنبال کنید (مثال‌ها از نسخه 4.21c استفاده می‌کنند). به دلیل تعداد گام‌های بیلد، این کار مدتی طول می‌کشد:

\`\`\`bash
$ sudo apt-get update
$ sudo apt-get install -y build-essential python3-dev automake cmake git flex bison libglib2.0-dev libpixman-1-dev python3-setuptools cargo libgtk-3-dev
$ sudo apt-get install -y lld llvm llvm-dev clang
$ GCC_VER=$(gcc --version | head -n1 | sed 's/\\..*//' | sed 's/.* //')
$ sudo apt-get install -y gcc-$GCC_VER-plugin-dev libstdc++-$GCC_VER-dev
$ sudo apt-get install -y ninja-build
$ wget https://github.com/AFLplusplus/AFLplusplus/archive/refs/tags/v4.21c.tar.gz
$ tar -zxf v4.21c.tar.gz
$ cd AFLplusplus-4.21c
$ make distrib
$ sudo make install
\`\`\`

AFL++ روی اهدافی که کد منبع دارند بهترین عملکرد را دارد، زیرا می‌تواند در زمان کامپایل، ابزارسازی بهینه اضافه کند. بنابراین با نسخه شناخته‌شده-آسیب‌پذیرِ LibreDWG شروع می‌کنید؛ کتابخانه C متن‌باز برای خواندن و نوشتن فایل‌های فرمت DWG (نقاشی).

نکته جالب اینکه به نظر می‌رسد توسعه‌دهندگان از قبل با فازرهای اصلی AFL و Honggfuzz مقداری فازینگ انجام داده بودند؛ همان‌طور که در فایل HACKING مستند شده است. می‌توانید آن دستورالعمل‌ها را برای کامپایل برنامه dwgread با ابزارسازی AFL++ تطبیق دهید:

\`\`\`bash
$ sudo apt-get install -y autoconf automake libtool pkg-config m4
$ git clone https://github.com/LibreDWG/libredwg
$ cd libredwg
$ git checkout 77a8562
$ sh ./autogen.sh
❶$ CC=afl-clang-lto ./configure --disable-bindings --disable-dxf --disable-json --disable-shared
$ make -C src
$ make -C programs dwgread
\`\`\`

فعلاً خیلی نگران فلگ‌های کامپایلر نباشید؛ کامپایلر مرکزی AFL++ به‌طور خودکار پیش‌فرض‌های خوب را انتخاب می‌کند. برای مثال، فلگ -fsanitize=address موجود در Makefile اصلی را مستثنا می‌کند. زیرا Sanitizerها حافظه و منابع محاسباتی زیادی مصرف می‌کنند و به‌طور کلی توصیه می‌شود ابتدا بدون آن‌ها فازینگ را شروع کنید. برای بحث عمیق‌تر درباره اثر Sanitizerها بر عملکرد فازینگ، https://afl-1.readthedocs.io/en/latest/notes_for_asan.html را ببینید.

یکی از انتخاب‌های کلیدی در این مرحله، انتخاب بهترین حالت ابزارسازی است. چهار حالت در AFL++ موجود است:

- **بهینه‌سازی زمان لینک (LTO):** در زمان لینک با یک لینکر سفارشی AFL ابزارسازی می‌کند تا از برخورد لبه‌ها (Edge Collision) جلوگیری کند — جایی که شاخه‌های ابزارسازی‌شده (لبه‌ها) به‌طور تصادفی همان هش را می‌گیرند و پوشش را اشتباه گزارش می‌کنند. این حالت باینری‌های سریع‌تری هم در زمان اجرا تولید می‌کند، اما به بهای زمان کامپایل طولانی‌تر.
- **پلاگین GCC:** مشابه چارچوب LLVM Pass، مجموعه کامپایلر GNU (GCC) از پلاگین‌هایی پشتیبانی می‌کند که قابلیت جدیدی به کامپایلر می‌افزایند. AFL++ شامل یک پلاگین GCC سفارشی برای افزودن ابزارسازی است.
- **GCC/Clang:** بر سازوکارهای ابزارسازی داخلیِ کامپایلرهای اصلی اتکا می‌کند که دستورالعمل‌های اسمبلیِ بهینه‌نشده درج می‌کنند.
- **LLVM:** یک Pass کامپایلر LLVM اضافه می‌کند که در زمان کامپایل، ابزارسازی AFL++ را درج می‌کند. این به قابلیت‌های مخصوص LLVM مانند چارچوب LLVM Pass وابسته است، پس فقط با کامپایلر Clang کار می‌کند نه GCC، اما بهینه‌سازی‌های بسیار بیشتری ممکن می‌سازد.

تا زمانی که Clang یا Clang++ نسخه ۱۱ یا بالاتر موجود باشد، مستندات AFL++ حالت LTO را توصیه می‌کند. برای استفاده از آن، afl-clang-lto را در متغیر محیطی CC ❶ مشخص کردید. در غیر این صورت، afl-cc به‌طور پیش‌فرض به afl-clang-fast سوییچ می‌کند. این باید در خروجی کامپایلر هم بازتاب یابد. کامپایل به دلیل بهینه‌سازی زمان لینک، طولانی‌تر خواهد بود.

وقتی هدف کامپایل شد، می‌توانید بلافاصله با یک فایل Corpus اولیه فازینگ را آغاز کنید:

\`\`\`bash
$ mkdir fuzz-in
$ cp test/test-data/example_2000.dwg fuzz-in/
$ afl-fuzz -i fuzz-in -o fuzz-out -- programs/dwgread @@
\`\`\`

برای اجرای باینری هدف با ورودی فاز‌شده، آرگومان خط فرمانِ مسیر فایل ورودی را با @@ جایگزین می‌کنید که به‌طور خودکار توسط AFL++ پر می‌شود. اگر همه‌چیز خوب پیش برود، اولین نشست فازینگ AFL++ شما آغاز می‌شود!

رابط AFL++ باید چیزی شبیه شکل ۸-۱ به نظر برسد. به‌طور منظم آن را بررسی کنید تا مطمئن شوید نشست فازینگ طبق انتظار پیش می‌رود.

![Figure 8-1](/images/fig-8-1.png)

*Figure 8-1: The AFL++ status screen*

بیشترِ این رابط نسبتاً گویاست، اما برای جزئیات بیشتر می‌توانید به مستندات https://aflplus.plus/docs/status_screen/ مراجعه کنید. چند معیار کلیدی وجود دارد که باید از نزدیک پایش کنید:

- **Last new find:** کرش‌ها و هنگ‌های جدید و همچنین مسیرهای جدید (به بیان دیگر، پوشش جدید) را ردیابی می‌کند. اگر در شروع فازینگ هیچ پوشش جدیدی حاصل نمی‌شود، این نشان می‌دهد ورودی‌های شما شاید به‌درستی کار نمی‌کنند.
- **Map coverage:** متناظر با «fuzz bitmap» است که AFL++ برای بازنمایی پوشش کد برنامه فاز‌شده استفاده می‌کند. به ایده‌آل، تراکم نقشه شما نباید خیلی زود خیلی بالا باشد (بیش از ۷۰ درصد)، زیرا شناسایی تغییرات معنادار پوشش کد را برای AFL++ سخت‌تر می‌کند.
- **Item geometry:** عمق مسیرِ رسیده توسط نشست فازینگ را نشان می‌دهد. به‌طور خاص به Stability توجه کنید که یکسانی پوشش کد برای ورودی‌های یکسان را می‌سنجد. Stability باید به ایده‌آل ۱۰۰ درصد باشد؛ در غیر این صورت کرش‌های غیرقابل‌اعتماد می‌گیرید که شاید نتوانید بازتولیدشان کنید.
- **Stage progress:** شامل اطلاعاتی درباره اقدامات فازینگ جاری در حال اجراست. اگرچه سرعت اجرا بسته به سخت‌افزار و Harness شما متغیر است، حدود ۵۰۰ اجرا در ثانیه را هدف بگیرید.

این معیارها نشان می‌دهند که آیا نشست فازینگ را به‌درستی راه انداخته‌اید. باید به‌سرعت گلوگاه‌های بالقوه — مانند Harness فازینگ، Corpus ورودی یا بررسی‌های اعتبارسنجی — را شناسایی کنید.

اگر نشست فازینگ را به اندازه کافی طولانی اجرا کنید، شروع به مواجهه با کرش‌ها و هنگ‌ها می‌کند. AFL++ ورودی‌ای که باعث یک کرش یا هنگ یکتا شده را در fuzz-out/default/crashes/ ذخیره می‌کند. از آنجا که هر نشست فازینگ تصادفی است و حتی بعد از چند روز فازینگ ممکن است کرشی نمی‌بینید، یکی از این ورودی‌های کرش‌کننده در مخزن کد کتاب در chapter-08/aflplusplus-libredwg/crash-1.dwg فراهم شده است. دیباگ یکی از ورودی‌های کرش‌کننده با GDB اطلاعات زیر را آشکار می‌کند:

\`\`\`text
$ gdb --args ./programs/dwgread crash-1.dwg
(gdb) r
Starting program: /home/kali/Desktop/libredwg/programs/dwgread crash-1.dwg
[Thread debugging using libthread_db enabled]
Using host libthread_db library "/lib/x86_64-linux-gnu/libthread_db.so.1".
Program received signal SIGSEGV, Segmentation fault.
0x00005555557e48f3 in bit_calc_CRC (seed=49345, addr=0x555555e625c0 <error: Cannot access ❶ memory at address 0x555555e625c0>, len=11518) at /home/kali/Desktop/libredwg/src/bits.c:3455
3455        al = (unsigned char)((*addr) ^ ((unsigned char)(dx & 0xFF))); ❷
\`\`\`

به نظر می‌رسد یک خواندن خارج از محدوده در تابع bit_calc_CRC ❶ به دلیل متغیر addr ❷ رخ داده است. به لطف اطلاعات دیباگِ افزوده‌شده در حین کامپایل، GDB توانست خطوط دقیق کدی را که این اتفاق در آن رخ داد، هایلایت کند. همچنین می‌توانید دستور backtrace را اجرا کنید تا پشته فراخوانی هنگام کرش را ببینید:

\`\`\`text
(gdb) backtrace
#0 0x00005555557e48f3 in bit_calc_CRC (seed=49345, addr=0x555555e625c0 <error: Cannot access memory at address 0x555555e625c0>, len=11518) at /home/kali/Desktop/libredwg/src/bits.c:3455 ❶
#1  decode_preR13_auxheader (dat=0x7fffffffc870, dwg=0x7fffffffc8b0) at decode.c:6278
#2 0x00005555557ec800 in decode_preR13 (dat=0x7fffffffc870, dwg=0x7fffffffc8b0) at decode_r11.c:786
#3 0x00005555555d1893 in dwg_decode (dat=0x7fffffffc870, dwg=0x7fffffffc8b0) at decode.c:217
#4 0x00005555555be43d in dwg_read_file (filename=<optimized out>, dwg=0x7fffffffc8b0) at /home/kali/Desktop/libredwg/src/dwg.c:261
#5 0x00005555555be43d in main (argc=<optimized out>, argv=0x7fffffffdeb8)
\`\`\`

این پشته فراخوانی نسبتاً عمیقی است، اما نگران‌کننده این است که کرش در یک تابع CRC ❶ رخ می‌دهد؛ این نشان می‌دهد نشست فازینگ در این بررسی گیر کرده است. می‌توانید این رفتار را با سطح‌های (Levels) روی صفحه وضعیت مرتبط کنید که سرانجام فلات خواهد کرد. به نظر می‌رسد این یک ماکزیمم محلی است که AFL++ فقط کد اعتبارسنجی CRC را فاز می‌کند، نه بقیه برنامه.

با این وجود، این تست کوتاه قدرت فازینگ هدایت‌شده-با-پوشش را نشان می‌دهد. حتی با یک Harness بهینه‌نشده، ورودی‌های حداقلی، بدون Sanitizer و پوشش ضعیف، AFL++ می‌تواند برنامه را به‌شکل «هوشمندانه» کاوش و سرانجام کرش‌هایی فعال کند. تنها ماده اولیه‌ای که نیاز دارد، زمان است.

### بهینه‌سازی‌های فازینگ (Fuzzing Optimizations)

«فاز کن و فراموش کن» می‌تواند استراتژی مؤثری باشد. با این حال، اگرچه این ممکن است برای برنامه ساده‌ای مثل dwgread جواب دهد، بعید است برای برنامه پیچیده‌ای به‌خوبی مقیاس‌پذیر باشد. برای بهبود عملکرد فازینگ، می‌توانید تکنیک‌های بهینه‌سازی شرح‌داده‌شده در این بخش را امتحان کنید.

#### وصله کردن بررسی‌های اعتبارسنجی (Patching Validation Checks)

اگرچه یک آسیب‌پذیری خواندن خارج از محدوده در bit_calc_CRC وجود دارد، شما می‌خواهید آسیب‌پذیری‌هایی در سایر بخش‌های کد dwgread هم بیابید. برای رسیدن به آنجا، باید بررسی اعتبارسنجی CRC را عبور کنید.

به محل فراخوانی bit_calc_CRC در فهرست ۸-۱ نگاهی بیندازید.

\`\`\`c
int
decode_preR13_auxheader (Bit_Chain *restrict dat, Dwg_Data *restrict dwg)
{
  int error = 0;
  BITCODE_RS crc, crcc;
  Dwg_AuxHeader *_obj = &dwg->auxheader;
  --snip--
  crcc = bit_calc_CRC ( ❶
    0xC0C1,
    &dat->chain[_obj->auxheader_address + 16], // after sentinel (16 bytes)
    _obj->auxheader_size - 2);                 // minus crc length (2 bytes)
  crc = bit_read_RS (dat); ❷
  LOG_TRACE ("crc: %04X [RSx] from 0x%x-0x%lx\\n", crc,
             _obj->auxheader_address + 16, dat->byte - 2);
  if (crc != crcc)
    {
      LOG_ERROR ("AUX header CRC mismatch %04X <=> %04X", crc, crcc);
      error |= DWG_ERR_WRONGCRC; ❸
      error
        |= decode_preR13_sentinel (DWG_SENTINEL_R11_AUX_HEADER_END,
                                   "DWG_SENTINEL_R11_AUX_HEADER_END", dat, dwg);
      LOG_TRACE ("\\n");
      return error;
    }
\`\`\`

*فهرست ۸-۱: محل فراخوانی bit_calc_CRC*

به‌عنوان بخشی از روتین رمزگشایی فرمت DWG، یک چک‌سام CRC برای هدر ❶ محاسبه و با چک‌سام CRC ارائه‌شده ❷ مقایسه می‌شود. اگر مطابقت نداشته باشند، تابع یک خطا لاگ می‌کند ❸. این خطا به بالا در پشته فراخوانی تا تابع dwg_decode منتقل می‌شود؛ همان‌طور که فهرست ۸-۲ نشان می‌دهد.

\`\`\`c
/** dwg_decode
 * returns 0 on success.
 *
 * everything in dwg is cleared
 * and then either read from dat, or set to a default.
 */
EXPORT int
dwg_decode (Bit_Chain *restrict dat, Dwg_Data *restrict dwg)
{
  --snip--
  PRE (R_13b1)
  {
    Dwg_Object *ctrl;
❶    int error = decode_preR13 (dat, dwg);
    if (error <= DWG_ERR_CRITICAL)
      {
        ctrl = &dwg->object[0];
        dwg->block_control = *ctrl->tio.object->tio.BLOCK_CONTROL;
      }
❷    return error;
  }
❸  VERSIONS (R_13b1, R_2000) { return decode_R13_R2000 (dat, dwg); }
  VERSION (R_2004) { return decode_R2004 (dat, dwg); }
  VERSION (R_2007) { return decode_R2007 (dat, dwg); }
  SINCE (R_2010)
  {
    read_r2007_init (dwg); // sets loglevel only for now
    return decode_R2004 (dat, dwg);
  }
  --snip--
}
\`\`\`

*فهرست ۸-۲: کد تابع dwg_decode*

تابع decode_preR13 ❶ سرانجام بررسی CRC را فعال می‌کند، پس یک خطا در آنجا باعث می‌شود تابع زودتر ❷ بازگردد. با این حال، اگر اعتبارسنجی CRC عبور کند، بسته به کد نسخه فایل DWG به روتین‌های رمزگشایی مختلفی ❸ می‌رود.

همان‌طور که در فصل ۷ بحث شد، چک‌سام CRC یک کد تشخیص خطاست. اگر حتی یک بیت در چک‌سام یا داده تغییر کند، اعتبارسنجی شکست می‌خورد. این باعث می‌شود عبور فازر از این بررسی بدون کمک بیرونی، به‌شدت دشوار باشد.

با این حال، دور زدن این بررسی بعید است بهره‌برداری‌پذیری کرش‌هایی که بعداً کشف می‌شوند را تغییر دهد، زیرا محاسبه مجدد چک‌سام CRC صحیح و جایگزینی آن در ورودی‌های کرش‌کننده نسبتاً آسان است. برخلاف سایر بررسی‌های اعتبارسنجی مخصوص فرمت، CRC را می‌توان به‌سادگی بدون دستکاری بایت‌هایی که واقعاً باعث کرش شده‌اند، بازگرداند. این باعث می‌شود گزینه مناسبی برای وصله کردن باشد.

اگر مشخصات DWG شرکت Open Design Alliance را در https://www.opendesign.com/files/guestdownloads/OpenDesign_Specification_for_.dwg_files.pdf بخوانید، می‌بینید که فرمت DWG واقعاً از نسخه‌های متعددی با تفاوت‌های جدی پشتیبانی می‌کند. برای مثال، اندازه چک‌سام CRC می‌تواند بسته به نسخه فرمت، از ۸ بیت تا ۶۴ بیت باشد. یک بررسی جامعیت داده اضافی نیز با مجموعه‌ای از بایت‌های جادویی به نام Sentinel وجود دارد.

این باعث می‌شود وصله کردن اعتبارسنجی CRC و Sentinel در LibreDWG کمی پیچیده‌تر از کامنت کردن یک خط باشد. برای مثال، تابع bit_check_CRC در برخی بخش‌های کد استفاده می‌شود، در حالی که در بخش‌های دیگر، چک‌سام CRC با bit_calc_CRC محاسبه و با مقدار مورد انتظارِ خوانده‌شده از هدر مقایسه می‌شود.

بنابراین برای وصله کردن اعتبارسنجی CRC و Sentinel، چند اصلاح لازم است:

- تغییر bit_check_CRC تا حتی وقتی بررسی شکست می‌خورد، ۱ (که به‌معنای موفقیت تفسیر می‌شود) برگرداند.
- یافتن همه جاهایی که مقدار بازگشتی bit_calc_CRC با یک مقدار مورد انتظار مقایسه شده و در صورت عدم تطابق خطا فعال می‌شود. اصلاحشان کنید تا خطا فعال نکنند.
- یافتن همه جاهایی که مقدار بازگشتی dwg_sentinel با مقدار پردازش‌شده مقایسه شده و در صورت عدم تطابق خطا فعال می‌شود. اصلاحشان کنید تا خطا فعال نکنند.
- یافتن همه جاهای دیگر که خطای DWG_ERR_WRONGCRC پرتاب می‌شود. اصلاحشان کنید تا خطا فعال نکنند.

هنگام انجام این تغییرات، مطمئن شوید کدهای بی‌ربط را به‌اشتباه دستکاری نمی‌کنید. برای مثال، در تابع bit_check_CRC در فهرست ۸-۳، دو شرط شکست ممکن وجود دارد.

\`\`\`c
/** Read and check old 16bit CRC.
 */
int
bit_check_CRC (Bit_Chain *dat, long start_address, uint16_t seed)
{
  uint16_t calculated;
  uint16_t read;
  long size;
  loglevel = dat->opts & DWG_OPTS_LOGLEVEL;
  if (dat->bit > 0)
    {
      dat->byte++;
      dat->bit = 0;
    }
  if (start_address > dat->byte || dat->byte >= dat->size)
    {
      loglevel = dat->opts & DWG_OPTS_LOGLEVEL;
      LOG_ERROR ("%s buffer overflow at pos %lu-%lu, size %lu",
                 __FUNCTION__, start_address, dat->byte, dat->size)
❶      return 0;
    }
  size = dat->byte - start_address;
  calculated = bit_calc_CRC (seed, &dat->chain[start_address], size);
  read = bit_read_RS (dat);
  LOG_TRACE ("crc: %04X [RSx]\\n", read);
  if (calculated == read)
    {
      LOG_HANDLE (" check_CRC %lu-%lu = %ld: %04X == %04X\\n",
                  start_address, dat->byte - 2, size, calculated, read)
      return 1;
    }
  else
    {
      LOG_WARN ("check_CRC mismatch %lu-%lu = %ld: %04X <=> %04X\\n",
                start_address, dat->byte - 2, size, calculated, read)
❷      return 0;
    }
}
\`\`\`

*فهرست ۸-۳: کد تابع bit_check_CRC*

بررسی سرریز بافر نباید طوری وصله شود که همیشه ۱ ❶ برگرداند، وگرنه در حین فازینگ مثبت‌های کاذب ایجاد می‌کند — مثبت‌هایی که نمی‌توان در برنامه اصلی بازتولیدشان کرد. در مقابل، وصله کردن اعتبارسنجی CRC ❷ همچنان به شما اجازه می‌دهد کرش‌ها را به‌سادگی با تصحیح چک‌سام CRC در هدر ورودی کرش‌کننده بازتولید کنید.

از آنجا که وصله‌های زیادی باید اعمال شوند، می‌توانید از فایل Git Patch موجود در chapter-08/aflplusplus-libredwg از مخزن کد کتاب برای انجام تغییرات لازم استفاده کنید. در حالی که در دایرکتوری libredwg هستید، دستورات زیر را اجرا کنید:

\`\`\`bash
$ cp ~/Desktop/from-day-zero-to-zero-day/chapter-08/aflplusplus-libredwg/remove_crc_sentinel.patch .
$ git apply remove_crc_sentinel.patch
\`\`\`

پس از وصله این بررسی‌ها، برنامه را با کد جدید دوباره بیلد و مطمئن شوید دایرکتوری fuzz-out شامل خروجی نشست فازینگ قبلی را پاک کرده‌اید:

\`\`\`bash
$ make clean
$ make -C src
$ make -C programs dwgread
$ mv fuzz-out fuzz-out-1
$ afl-fuzz -i fuzz-in -o fuzz-out -- programs/dwgread @@
\`\`\`

این بار، فاز کردن باینری وصله‌شده نتایج مبهمی تولید می‌کند؛ همان‌طور که در شکل ۸-۲ نشان داده شده است.

![Figure 8-2](/images/fig-8-2.png)

*Figure 8-2: The fuzzing session with patched CRC validation*

برای مثال، در زمان اجرای مشابه با نشست فازینگ قبلی بدون وصله CRC (حدود ۳۰ دقیقه)، هیچ کرش یا هنگ جدیدی وجود ندارد. اما اگر آمار را دقیق‌تر نگاه کنید، می‌بینید که تعداد «own finds» حدود ۲۰ درصد افزایش یافته است. زیرا باینری وصله‌شده بدون گلوگاه CRC می‌تواند به بخش‌های بیشتری از برنامه برسد. در حالی که نشست فازینگ قبلی فقط می‌توانست روی اعتبارسنجی‌های CRC تمرکز کند و بنابراین به باگ عمیقاً تودرتوی داخل bit_calc_CRC می‌رسید، نشست فازینگ جدید پوشش گسترده‌تری دارد.

با این حال، اگرچه احتمالاً با زمان کافی دوباره می‌توانید به آسیب‌پذیری در bit_calc_CRC برسید، آسیب‌پذیری‌های بالقوه‌ای هم در توابع دیگری مانند decode_R13_R2000، decode_R2004 و decode_R2007 وجود دارند که شاید با Corpus ورودی فعلی‌تان نتوانید بیابید.


#### کمینه‌سازی Corpus اولیه (Minimizing the Seed Corpus)

وقتی برای اولین بار فاز کردن dwgread را شروع کردید، از یک فایل ورودی منفرد برای Corpus استفاده کردید. اگرچه این برای شروع کافی بود، برای فرمت فایل پیچیده‌ای مانند DWG که واریانت‌های متعددی دارد، بهینه نیست. تفاوت‌ها میان نسخه‌ها به‌قدری جدی است که بعید است یک فازر هدایت-با-پوشش بتواند یک فایل DWG 2000 را به یک فایل DWG 2007 معتبر جهش دهد. در عوض باید از Corpus اولیه بزرگ‌تری استفاده کنید.

با این حال، اگر Corpus اولیه خیلی بزرگ باشد و در پوشش کد هم‌پوشانی داشته باشد، می‌تواند چرخه‌های فازینگ را هدر دهد. برای مثال، دو فایل DWG 2000 با تفاوت‌های کم در متادیتایشان، محتمل‌تر است که پوشش کد مشابهی نسبت به یک فایل DWG 2000 و یک فایل DWG 2007 داشته باشند. باید کمینه‌ترین Corpus‌ای را انتخاب کنید که حداکثر پوشش اولیه را فراهم کند. خوشبختانه AFL++ ابزار کمینه‌سازی Corpus داخلی به نام afl-cmin دارد. این ابزار پوشش هر فایل ورودی را با باینری ابزارسازی‌شده اندازه‌گیری و کوچک‌ترین زیرمجموعه‌ای از ورودی‌ها را می‌یابد که حداکثر پوشش ممکن را فراهم می‌کند.

کمینه‌سازی مجموعه‌ای از فایل‌های DWG از test/test-data/2007 را با afl-cmin امتحان کنید و سپس با Corpus کمینه‌شده جدید به فازینگ بپردازید:

\`\`\`bash
$ mv fuzz-out fuzz-out-2
$ afl-cmin -i test/test-data/2007 -o fuzz-in-cmin -- programs/dwgread @@
$ afl-fuzz -i fuzz-in-cmin -o fuzz-out -- programs/dwgread @@
\`\`\`

این بار باید بتوانید خیلی سریع‌تر از قبل به کرش برسید. در شکل ۸-۳ می‌بینید که با وجود زمان اجرای تقریباً برابر، شمارنده‌های «levels» و «own finds» این نشست فازینگ بسیار فراتر از نشست‌های قبلی است. این بازتاب پوشش بیشترِ فراهم‌شده توسط Corpus جدید است.

![Figure 8-3](/images/fig-8-3.png)

*Figure 8-3: The fuzzing session with the minimized corpus*

این نشست فازینگ همچنین باید کرش جدیدی تولید کند که باید آن را در GDB تحلیل کنید. مانند قبل، اگر به دلیل تصادفی‌بودن فازینگ نتوانستید به این کرش برسید، از فایل crash-2.dwg در مخزن نمونه‌های کتاب استفاده کنید:

\`\`\`text
$ gdb --args ./programs/dwgread crash-2.dwg
(gdb) r
Starting program: /home/kali/Desktop/libredwg/programs/dwgread crash-2.dwg
[Thread debugging using libthread_db enabled]
Using host libthread_db library "/lib/x86_64-linux-gnu/libthread_db.so.1".
Program received signal SIGSEGV, Segmentation fault.
0x0000555555810645 in ❶ read_data_section (sec_dat=0x7fffffffc1f0, dat=0x7fffffffc880, sections_map=<optimized out>, pages_map=0x555555b0fd50, sec_type=<optimized out>) at decode_r2007.c:840
840     r2007_section_page *section_page = section->pages[i];
(gdb) backtrace
#0 0x0000555555810645 in read_data_section (sec_dat=0x7fffffffc1f0, dat=0x7fffffffc880, sections_map=<optimized out>, pages_map=0x555555b0fd50, sec_type=<optimized out>) at decode_r2007.c:840
#1 0x0000555555808d5c in read_2007_section_revhistory (dat=0x7fffffffc880, dwg=0x7fffffffc8c0, sections_map=0x555555b0f410, pages_map=0x555555b0fd50) at decode_r2007.c:2023
#2  read_r2007_meta_data (dat=0x7fffffffc880, hdl_dat=<optimized out>, dwg=0x7fffffffc8c0) at decode_r2007.c:2466
#3 0x00005555555d5279 in decode_R2007 (dat=0x7fffffffc880, dwg=0x7fffffffc8c0) at decode.c:3469
#4  dwg_decode (dat=0x7fffffffc880, dwg=0x7fffffffc8c0) at decode.c:227
#5 0x00005555555be42d in dwg_read_file (filename=<optimized out>, dwg=0x7fffffffc8c0) at /home/kali/Desktop/libredwg/src/dwg.c:261
#6 0x00005555555be42d in main (argc=<optimized out>, argv=0x7fffffffdec8)
\`\`\`

آسیب‌پذیری در تابع read_data_section ❶ واقع در decode_r2007.c رخ می‌دهد. این به‌وضوح نتیجه تغییر Corpus شماست، زیرا ورودی Seed منفرد اولیه فقط نسخه ۲۰۰۰ DWG بود.

برخلاف آسیب‌پذیری قبلی که در bit_calc_CRC کشف کردید، این آسیب‌پذیری را می‌توان در یک بیلد Release از LibreDWG بهره‌برداری کرد. LibreDWG هنگام بیلد با فلگ پیکربندی --enable-release، مدیریت نسخه ۲۰۰۰ (که آن را زیر عنوان «pre-R13» گروه‌بندی می‌کند) را مستثنا می‌کند. اگر نسخه رسمی 0.12.5 را از http://ftp.gnu.org/gnu/libredwg/libredwg-0.12.5.tar.gz دانلود و یک بیلد Release بسازید، می‌توانید این را تأیید کنید:

\`\`\`bash
$ tar -xzvf libredwg-0.12.5.tar.gz
$ cd libredwg-0.12.5
$ ./configure --enable-release
$ make
\`\`\`

اجرای بیلد Release روی فایل کرش، خطای بخشش (Segmentation Fault) مورد انتظار را می‌دهد. به متغیرهای محیطی لازم برای بارگذاری کتابخانه‌های اشتراکی LibreDWG توجه کنید:

\`\`\`text
$ LD_LIBRARY_PATH="./src/.libs:$LD_LIBRARY_PATH" gdb --args ./programs/.libs/dwgread /home/kali/Desktop/crash.dwg
(gdb) r
Starting program: /home/kali/Downloads/libredwg-0.12.5/programs/.libs/dwgread /home/kali/Desktop/crash.dwg
[Thread debugging using libthread_db enabled]
Using host libthread_db library "/lib/x86_64-linux-gnu/libthread_db.so.1".
ERROR: Invalid num_pages 7274598, skip ❶
ERROR: Invalid section->pages[0] size
Warning: Failed to find section_info[1]
ERROR: Failed to read header section
Warning: Failed to find section_info[3]
ERROR: Failed to read class section
Warning: Failed to find section_info[7]
ERROR: Failed to read objects section
Warning: Failed to find section_info[2]
ERROR: Preview overflow 119 + 0 > 302223
Warning: thumbnail.size mismatch: 302223 != 0
Program received signal SIGSEGV, Segmentation fault.
0x00007ffff728a5c4 in read_data_section (sec_dat=sec_dat@entry=0x7fffffffc850, dat=dat@entry=0x7fffffffcb20, sections_map=sections_map@entry=0x55555555b410, pages_map=pages_map@entry=0x55555555bd50, sec_type=sec_type@entry=SECTION_REVHISTORY) at decode_r2007.c:805
805     r2007_section_page *section_page = section->pages[i];
\`\`\`

نکته جالب اینکه اگرچه بسیاری از بخش‌های فایل کرش به دلیل بررسی‌های مختلف ❶ خطا و هشدار فعال می‌کنند، این مانع رسیدن اجرا به آسیب‌پذیری نمی‌شود. با این وجود، همیشه باید اطمینان حاصل کنید که کرش‌هایتان روی بیلد Release هدف هم کار می‌کنند.

#### نوشتن یک Harness (Writing a Harness)

همان‌طور که در مقدمه این فصل اشاره شد، یکی از مزایای استفاده از Harness فازینگ، امکان فازینگ بهینه‌تر است. تا اینجا فقط dwgread را فاز می‌کردید که یک برنامه نمونه از کتابخانه LibreDWG است. اگرچه این برای راه‌اندازی سریع یک نشست فازینگ خوب است، برای فازینگ بهینه نیست و فقط زیرمجموعه‌ای از APIهای ارائه‌شده توسط LibreDWG را فراخوانی می‌کند.

برای فاز کردن سایر APIها باید Harness‌ای بنویسید که آن توابع را فراخوانی کند. در واقع، توسعه‌دهندگان LibreDWG چند برنامه نمونه مخصوص فازینگ نوشته‌اند که در examples/dwgfuzz.c و examples/llvmfuzz.c یافت می‌شوند.

چنین Harnessهایی می‌توانند از حالت Persistent در AFL++ استفاده کنند. در این حالت، AFL++ به‌جای ساختن یک پروسه جدید برای هر اجرای فازینگ، یک پروسه منفرد می‌سازد و همه مقداردهی اولیه را یک‌بار انجام می‌دهد و سپس تابع هدف را مکرراً با ورودی‌های فاز‌شده فراخوانی می‌کند. این می‌تواند سرعت را تا ۱۰ برابر افزایش دهد.

یک قالب استاندارد برای نوشتن Harness وجود دارد که تابعی به نام LLVMFuzzerTestOneInput را تعریف می‌کند. نام این تابع از موتور فازینگ libFuzzer آمده که از ابزارسازی LLVM استفاده می‌کرد. در گذر زمان، موتورهای دیگری مانند AFL و AFL++ نیز از این قالب پشتیبانی کردند. همه موتورهای هدایت-با-پوششِ ClusterFuzz با Harnessهایی که به این شکل نوشته شده‌اند کار می‌کنند که فازینگ در مقیاس بزرگ آن را ممکن می‌سازد.

اگرچه توسعه‌دهندگان LibreDWG یک Harness به شکل LLVMFuzzerTestOneInput در examples/llvmfuzz.c نوشته‌اند، همچنان بزرگ و دست‌وپاگیر است. به‌جای آن، کارآمدتر است که بر یک API خاص تمرکز کنید. برای تمرین نوشتن Harness، می‌توانید یکی برای تابع dwg_decode پیاده‌سازی کنید. فایل examples/llvmfuzz.c را به کد فهرست ۸-۴ ساده کنید، یا از نسخه موجود در مخزن کد کتاب در chapter-08/aflplusplus-libredwg/llvmfuzz.c استفاده کنید.

\`\`\`c
llvmfuzz.c
#include <dwg.h>
#include "bits.h"
#include "decode.h"

extern int LLVMFuzzerTestOneInput (const uint8_t *data, size_t size);

int LLVMFuzzerTestOneInput (
❶    const uint8_t *data, size_t size
  ) {
  Dwg_Data dwg;
  Bit_Chain dat = { NULL, 0, 0, 0, 0 };
  dat.chain = (unsigned char *)data; ❷
  dat.size = size;
❸  dwg_decode(&dat, &dwg);
❹  dwg_free(&dwg);
  return 0;
}
\`\`\`

*فهرست ۸-۴: یک Harness فازینگ مینیمال*

فازرهای سازگار به‌طور خودکار LLVMFuzzerTestOneInput را با ورودی فاز‌شده در آرگومان data و اندازه‌اش در آرگومان size ❶ فراخوانی می‌کنند. درون Harness، ساختارهای داده را مقداردهی اولیه ❷ و ورودی فاز‌شده را به تابع هدف ❸ پاس می‌دهید. علاوه بر این، داده کاری را پس از فراخوانی تابع هدف آزاد ❹ می‌کنید تا پایداری و کارایی فازینگ تضمین شود.

پیش از بیلد کردن llvmfuzz کمینه‌شده، باید فلگ‌های کامپایلر تعریف‌شده در examples/Makefile.am را هم اصلاح کنید:

\`\`\`text
llvmfuzz_CFLAGS = $(CFLAGS) $(AM_CFLAGS) \\
  -fsanitize=fuzzer -fno-omit-frame-pointer
\`\`\`

این مهم است، زیرا در غیر این صورت llvmfuzz با Sanitizerهای اضافی بیلد می‌شود که مصرف منابع را به‌شکل جدی بالا می‌برد. با این در ذهن، به بیلد llvmfuzz و شروع فازینگ بپردازید. این بار به‌جای پاس دادن جانگهدار مسیر فایل در دستور اجرای فاز، می‌توانید باینری را مستقیماً اجرا کنید، زیرا AFL++ تابع LLVMFuzzerTestOneInput را به‌طور خودکار تشخیص می‌دهد:

\`\`\`bash
$ mv fuzz-out fuzz-out-3
$ make clean
$ CC=afl-clang-lto ./configure --disable-bindings --disable-dxf --disable-json --disable-shared
$ make -C src
$ make -C examples llvmfuzz
$ afl-fuzz -i fuzz-in-cmin -o fuzz-out -- examples/llvmfuzz
\`\`\`

پیام‌های مقداردهی اولیه زیر نیز باید تأیید کنند که حالت Persistent در حال استفاده است:

\`\`\`text
[+] Persistent mode binary detected.
[+] Deferred forkserver binary detected.
[*] Spinning up the fork server...
[+] All right - fork server is up.
[*] Using SHARED MEMORY FUZZING feature.
\`\`\`

باید افزایش چندبرابری سرعت را مشاهده کنید؛ به‌جای صدها اجرا در ثانیه، اغلب اوقات باید هزاران اجرا بگیرید — بسته به ورودی در حال فاز.

#### فازینگ موازی (Fuzzing in Parallel)

اگر پردازنده‌ها یا هسته‌های کافی دارید، می‌توانید چندین فازر را هم‌زمان اجرا کنید تا تست‌ها را به اشتراک بگذارند و هم‌زمان باینری‌هایی را که با Sanitizerهای مختلف کامپایل شده‌اند هدف بگیرند. برای مثال، فازر اصلی شما می‌تواند هدفی را که بدون Sanitizer کامپایل شده فاز کند، در حالی که فازر ثانویه، هدف کامپایل‌شده با AddressSanitizer را فاز می‌کند. برای این کار، نام باینری کامپایل‌شده اصلی را به llvmfuzz-orig تغییر دهید. سپس examples/Makefile.am را اصلاح کنید تا AddressSanitizer برای llvmfuzz گنجانده شود:

\`\`\`text
llvmfuzz_CFLAGS = $(CFLAGS) $(AM_CFLAGS) \\
  -fsanitize=fuzzer,address -fno-omit-frame-pointer
\`\`\`

دوباره کامپایلش کنید و باینری خروجی را llvmfuzz-asan نام‌گذاری کنید. سپس دو نشست فازینگ را در ترمینال‌های جداگانه با این دستورات شروع کنید:

\`\`\`bash
$ mv fuzz-out fuzz-out-4
$ afl-fuzz -i fuzz-in-cmin -o fuzz-out -M orig -- examples/llvmfuzz-orig
$ afl-fuzz -i fuzz-in-cmin -o fuzz-out -S asan -- examples/llvmfuzz-asan
\`\`\`

ممکن است متوجه شوید که Harness کامپایل‌شده با ASan کندتر از Harness اصلی اجرا می‌شود، اما به لطف حالت Persistent، همچنان باید سرعت معقولی داشته باشد. این به شما کمک می‌کند آسیب‌پذیری‌های بالقوه خرابی حافظه را بگیرید که مستقیماً به کرش نمی‌انجامند اما همچنان می‌توانند قابل بهره‌برداری باشند.


### اندازه‌گیری پوشش فازینگ با afl-cov (Measuring Fuzzing Coverage with afl-cov)

تا اینجا عمدتاً سرعت و کارایی فازینگ را با استفاده از بهینه‌سازی‌های مختلف در Harness بهبود دادید. با این حال، اگر فقط مسیرهای کدی را هدف بگیرید که به‌خوبی فاز شده و سخت‌گیرانه‌محافظت‌شده‌اند یا زیرمجموعه کوچکی از کد موجود، رسیدن به هزاران اجرا در ثانیه فایده‌ای ندارد. صرف بهینه کردن فازینگ بدون انتخاب صحیح هدف، استراتژی بدی است. در عوض باید داده‌هایی جمع کنید تا هدف فازینگی را انتخاب کنید که بیشترین احتمال آشکار شدن آسیب‌پذیری را دارد.

یکی از سرراست‌ترین راه‌های ارزیابی هدف فازینگ، اندازه‌گیری پوشش است. می‌توانید هدف را با پشتیبانی Profiling کامپایل کنید تا کد واقعی‌ای که فازرتان به آن می‌رسد را شناسایی کنید. این به شما امکان می‌دهد نقطه‌های کور بالقوه فازینگ‌تان را بیابید.

اصلاح فرایند بیلد پروژه‌های مختلف می‌تواند پیچیده باشد و اغلب گردش کارها را می‌شکند. خوشبختانه ابزار مفیدی به نام afl-cov چند اسکریپت کمکی برای این کار فراهم می‌کند.

برای اجرای afl-cov روی LibreDWG اصلاح‌شده و Harness فازینگ، آن را به نسخه غیر-ASan برگردانید و در دایرکتوری جدیدی کپی کنید، همراه با داده‌های کاری نشست فازینگ در fuzz-out. این ضروری است، زیرا afl-cov پوششِ رسیده توسط هر تست در صف فازینگ را اندازه می‌گیرد:

\`\`\`bash
$ sudo apt-get install -y lcov libdatetime-perl
$ yes | sudo perl -MCPAN -e 'install Capture::Tiny'
$ git clone https://github.com/vanhauser-thc/afl-cov
$ cp -r libredwg libredwg-gcov
$ cd libredwg-gcov
$ make clean
$ /home/kali/Desktop/afl-cov/afl-cov-build.sh -c "./configure --disable-bindings --disable-dxf --disable-json --disable-shared"
$ make -C src
$ make -C examples llvmfuzz
$ cp ../afl-cov/afl-clang-cov.sh .
$ /home/kali/Desktop/afl-cov/afl-cov.sh -v -c /home/kali/Desktop/libredwg-gcov/fuzz-out "/home/kali/Desktop/libredwg-gcov/examples/llvmfuzz @@"
$ sed -i 's/src\\/src/src/g' fuzz-out/default/cov/lcov/trace.lcov_info_final
$ genhtml --ignore-errors unmapped --output-directory fuzz-out/default/cov/web fuzz-out/default/cov/lcov/trace.lcov_info_final
\`\`\`

این دستورات چند رفع باگ هم اعمال می‌کنند تا afl-cov به‌درستی با فازر شما کار کند. متأسفانه بسیاری از ابزارهای مرتبط با فازینگ می‌توانند آزمایشی یا کمتر-نگهداری‌شده باشند، پس هندل کردن حالت‌های خاص مانند پشتیبانی Clang بدون این رفع‌ها می‌تواند به مشکلاتی منجر شود.

پس از تولید گزارش، باید بتوانید با باز کردن فایل index.html تولیدشده در libredwg-gcov/fuzz-out/default/cov/web مستقیماً به آن دسترسی پیدا کنید. گزارش باید شبیه شکل ۸-۴ باشد.

![Figure 8-4](/images/fig-8-4.png)

*Figure 8-4: The coverage report for your fuzzer*

گزارش به شما می‌گوید نشست فازینگ‌تان در هر فایل کد منبع و تابع هدف، چه مقدار پوشش کد حاصل کرده است. علاوه بر این، اگر به فایل‌های کد منبع منفرد کلیک کنید، می‌بینید کدام کد توسط تست‌ها هدف قرار گرفته است. برای مثال، به تابع dwg_paper_space_ref در src/dwg.c نگاهی بیندازید:

\`\`\`c
/** Returns the paper space block object for the DWG.
 */
dwg_paper_space_ref (Dwg_Data *dwg)
{
  if (dwg->header_vars.BLOCK_RECORD_PSPACE
      && dwg->header_vars.BLOCK_RECORD_PSPACE->obj)
    return dwg->header_vars.BLOCK_RECORD_PSPACE; ❶
  return dwg->block_control.paper_space && dwg->block_control.paper_space->obj
             ? dwg->block_control.paper_space
             : NULL;
}
\`\`\`

در اینجا، گزارش پوشش نشان می‌دهد که فازر هرگز به return اول ❶ نرسیده است. این یعنی در حین فازینگ، نه Seedهای شما و نه تست‌های جهش‌یافته شرایط لازم برای رسیدن به این کد را نداشتند. در نتیجه، فازر نمی‌توانست به هیچ کد پایین‌دستی‌ای برسد که از این مسیر کد قابل فعال‌سازی بود. شاید ارزش داشته باشد این حالت‌های خاصِ از-دست-رفته را بررسی و ورودی‌های Seed را دستی برای فاز کردن این مسیرهای کد بسازید.

### Fuzz Introspector

اگرچه afl-cov بینش‌های اولیه‌ای به نقطه‌های کور فازر شما می‌دهد، واقعاً نمی‌گوید به‌جای آن کدام اهداف را باید فاز کنید. ابزار قدرتمندی برای این کار وجود دارد: Fuzz Introspector. Fuzz Introspector مؤلفه‌ای جدایی‌ناپذیر از OSS-Fuzz است که وضعیت فازینگ یک پروژه را اندازه‌گیری و تحلیل می‌کند. از آنجا که به‌شدت با OSS-Fuzz یکپارچه است، اجرای Fuzz Introspector درون چارچوب OSS-Fuzz آسان‌تر از اجرای مجزاست. OSS-Fuzz همراه با تعدادی اسکریپت کمکی و Containerهای Docker برای اجرای محلی این ابزار می‌آید.

علاوه بر این، LibreDWG از قبل یکپارچه‌سازی موجودی با OSS-Fuzz دارد. یکپارچه‌سازی پروژه‌ها با OSS-Fuzz از الگوی یکسانی پیروی می‌کند:

- **project.yaml:** متادیتای یکپارچه‌سازی OSS-Fuzz پروژه که مشخص می‌کند از کدام موتورهای فازینگ و Sanitizerها استفاده شود. OSS-Fuzz نسخه‌های مختلف پروژه را از طریق متغیرهای محیطی به‌طور خودکار بیلد می‌کند.
- **Dockerfile:** دستورالعمل‌های ساخت Container، مبتنی بر یک ایمیج سازنده OSS-Fuzz. این دستورالعمل‌ها باید پروژه هدف را دانلود و برای بیلد آماده کنند.
- **build.sh:** دستورات واقعی بیلد پروژه و Harness فازینگ. یکی از متغیرهای محیطی کلیدیِ استفاده‌شده در دستورات بیلد، LIB_FUZZING_ENGINE است که به OSS-Fuzz اجازه می‌دهد پیکربندی‌های کامپایلر مختلف را تزریق کند.

پروژه OSS-Fuzz را از https://github.com/google/oss-fuzz کلون و یکپارچه‌سازی LibreDWG را در دایرکتوری projects/libredwg بیابید. Dockerfile در فهرست ۸-۵ آمده است.

\`\`\`dockerfile
FROM gcr.io/oss-fuzz-base/base-builder
❶RUN git clone --depth 1 https://github.com/LibreDWG/libredwg libredwg
RUN apt-get update && apt-get install -y autoconf libtool texinfo
WORKDIR $SRC
❷COPY build.sh $SRC/build.sh
COPY llvmfuzz.options $SRC/llvmfuzz.options
\`\`\`

*فهرست ۸-۵: Dockerfile اصلی مربوط به یکپارچه‌سازی OSS-Fuzz در LibreDWG*

دستورالعمل‌های ساخت Container، شاخه اصلی کد منبع LibreDWG ❶ را کلون و اسکریپت بیلد را ❷ به دایرکتوری کد منبع کپی می‌کنند. ایمیج پایه سازنده OSS-Fuzz آن را به‌طور خودکار تشخیص و اجرا می‌کند. این اسکریپت، نسخه Release استانداردی از LibreDWG بیلد و اطمینان حاصل می‌کند که libFuzzer در حین فازینگ، نشتی‌ها را تشخیص ندهد.

شما از یک کدبیس سفارشی استفاده می‌کنید که موانع فازینگ — مانند اعتبارسنجی CRC — از آن حذف شده‌اند، پس باید Dockerfile را اصلاح کنید تا از نسخه محلی شما استفاده شود، نه کلون LibreDWG. libredwg اصلاح‌شده‌تان را به projects/libredwg کپی و Dockerfile را مطابق فهرست ۸-۶ ویرایش کنید.

\`\`\`dockerfile
Dockerfile
FROM gcr.io/oss-fuzz-base/base-builder
RUN apt-get update && apt-get install -y autoconf libtool texinfo
WORKDIR $SRC
❶COPY libredwg $SRC/libredwg
❷COPY llvmfuzz_seed_corpus.zip $SRC/llvmfuzz_seed_corpus.zip
COPY build.sh $SRC/
COPY llvmfuzz.options $SRC/
\`\`\`

*فهرست ۸-۶: Dockerfile اصلاح‌شده مربوط به یکپارچه‌سازی OSS-Fuzz در LibreDWG*

همراه با کپی کردن کد منبع اصلاح‌شده در ایمیج Container ❶، این Dockerfile یک Corpus اولیه هم ❷ اضافه می‌کند تا پوشش فازینگ بیشتر بهبود یابد. OSS-Fuzz به توسعه‌دهندگان اجازه می‌دهد با افزودن یک آرشیو ZIP در الگوی نام فایل خاصی، Corpus اولیه فراهم کنند. آرشیو ZIP از Corpus اولیه‌ای که قبلاً آماده کردید بسازید و در همان دایرکتوری قرار دهید:

\`\`\`bash
$ git clone https://github.com/google/oss-fuzz
$ cd oss-fuzz/projects/libredwg
$ cp -r /home/kali/Desktop/libredwg .
$ zip llvmfuzz_seed_corpus.zip libredwg/fuzz-in-cmin/*
\`\`\`

از آنجا که Corpus اولیه باید به‌عنوان یک آرتیفکت بیلد منتقل شود، باید دستورالعمل‌های بیلد را هم مطابق فهرست ۸-۷ اصلاح کنید.

\`\`\`bash
build.sh
cd libredwg
sh ./autogen.sh
# enable-release to skip unstable preR13. bindings are not fuzzed.
./configure --disable-shared --disable-bindings --enable-release
make -C src
$CC $CFLAGS src/.libs/libredwg.a -I./include -I./src -c examples/llvmfuzz.c
$CXX $CXXFLAGS $LIB_FUZZING_ENGINE llvmfuzz.o src/.libs/libredwg.a \\
    -o $OUT/llvmfuzz
cp $SRC/llvmfuzz.options $OUT/llvmfuzz.options
❶cp $SRC/llvmfuzz_seed_corpus.zip $OUT/llvmfuzz_seed_corpus.zip
\`\`\`

*فهرست ۸-۷: دستورالعمل‌های بیلد اصلاح‌شده*

دستورالعملی که اضافه می‌کنید ❶، آرشیو Corpus اولیه را به دایرکتوری ذخیره آرتیفکت‌های بیلد کپی می‌کند.

اکنون آماده اجرای محلی Fuzz Introspector از طریق OSS-Fuzz هستید. برای این کار Docker را نصب و کاربر فعلی را به گروه Docker اضافه کنید تا بدون دسترسی بالاتر از آن استفاده کنید. سپس از اسکریپت کمکی OSS-Fuzz برای اجرای Fuzz Introspector روی یکپارچه‌سازی LibreDWG استفاده کنید:

\`\`\`bash
$ sudo apt install -y docker.io
$ sudo usermod -aG docker $USER
$ su - $USER
$ cd /home/kali/Desktop/oss-fuzz
$ python infra/helper.py introspector libredwg --seconds=30
\`\`\`

> هشدار: این یک عملیات سنگین از نظر حافظه است که چندین Container Docker می‌سازد و اجرا می‌کند. اگر Containerها شکست خوردند، شاید لازم باشد تنظیمات مصرف منابع Docker را تغییر دهید یا Fuzz Introspector را روی میزبان اجرا کنید. به پیام‌های دیباگ و خطا توجه کنید. اگر نتوانستید خودتان آن را تولید کنید، گزارش از-پیش-تولیدشده Fuzz Introspector مربوط به LibreDWG در مخزن نمونه‌های این کتاب در chapter-08/introspector-report موجود است.

اگر همه‌چیز خوب پیش برود، اسکریپت کمکی یک گزارش Fuzz Introspector تولید می‌کند. به‌سرعت یک وب‌سرور پایتون برای ارائه فایل‌های گزارش راه بیندازید:

\`\`\`bash
$ cd build/out/libredwg/introspector-report/inspector
$ python -m http.server 8080
\`\`\`

گزارش را در http://localhost:8080/fuzz_report.html ببینید. گام بعدی، تحلیل آن برای یافتن راه‌های بهبود نشست فازینگ است.

#### شناسایی موانع فازینگ (Identifying Fuzz Blockers)

یکی از کاربردهای کلیدی گزارش Fuzz Introspector، شناسایی موانع فازینگ (Fuzz Blocker) است که مانع رسیدن فازر به خطوط بیشتری از کد می‌شوند. این شبیه کاری است که afl-cov می‌کند، اما به‌جای lcov از قابلیت پوشش کد مبتنی-بر-منبع Clang استفاده می‌کند.

به جدول Fuzz Blockers در بخش Fuzzer Details گزارش بروید. یکی از موانع شناسایی‌شده توسط Fuzz Introspector، درون تابع read_2007_section_header در src/decode_r2007.c قرار دارد؛ همان‌طور که فهرست ۸-۸ نشان می‌دهد.

\`\`\`c
❶if (bit_search_sentinel (&sec_dat,
        dwg_sentinel (DWG_SENTINEL_VARIABLE_BEGIN)))
  {
    BITCODE_RL endbits = 160; // start bit: 16 sentinel + 4 size
    dwg->header_vars.size = bit_read_RL (&sec_dat);
    LOG_TRACE ("size: " FORMAT_RL "\\n", dwg->header_vars.size);
    *hdl_dat = sec_dat;
    // unused: later versions re-use the 2004 section format
    /*
      if (dat->from_version >= R_2010 && dwg->header.maint_version > 3)
      {
        dwg->header_vars.bitsize_hi = bit_read_RL(&sec_dat);
        LOG_TRACE("bitsize_hi: " FORMAT_RL " [RL]\\n",
                  dwg->header_vars.bitsize_hi) endbits += 32;
      }
     */
    if (dat->from_version == R_2007) // always true so far
      {
        dwg->header_vars.bitsize = bit_read_RL (&sec_dat);
        LOG_TRACE ("bitsize: " FORMAT_RL " [RL]\\n", dwg->header_vars.bitsize);
        endbits += dwg->header_vars.bitsize;
        bit_set_position (hdl_dat, endbits);
        section_string_stream (dwg, &sec_dat, dwg->header_vars.bitsize,
                               &str_dat);
      }
    dwg_decode_header_variables (&sec_dat, hdl_dat, &str_dat, dwg);
  }
else
  {
    DEBUG_HERE;
    error = DWG_ERR_SECTIONNOTFOUND;
  }
\`\`\`

*فهرست ۸-۸: مانع فازینگ در decode_r2007.c*

به دلیل بررسی Sentinel ❶ که هنگام اصلاح کد قبلاً از قلم افتاد، مسیر کد به‌طور پیش‌فرض خطا برمی‌گرداند و از پردازش بیشتر داده DWG جا می‌ماند. در این مورد، باید همان‌طور که قبلاً بحث شد، کد منبع را دوباره اصلاح کنید تا این بررسی عبور کند.

#### تحلیل پیچیدگی توابع (Analyzing Function Complexity)

Fuzz Introspector تحلیل مفید دیگری نیز فراهم می‌کند: پیچیدگی توابع؛ که توابعی را برجسته می‌کند که به حجم زیادی از کد پروژه دسترسی دارند و می‌توانند اهداف خوبی برای فازینگ باشند. هرچه یک تابع پیچیده‌تر باشد، احتمال بیشتری دارد که حاوی آسیب‌پذیری باشد. از منظر امنیتی، تست و ایمن‌سازی توابع کوچک و ساده آسان‌تر از توابعی است که صدها خط کد با شاخه‌های شرطی متعدد دارند.

Fuzz Introspector چند معیار پیچیده-به-نظر-می‌رسد گزارش می‌کند. پیچیدگی سیکلوماتیک (Cyclomatic Complexity) در سطح کلان، صرفاً تعداد مسیرهای کد مستقل در هر تابع را می‌سنجد. پیچیدگی انباشته (Accumulated Complexity) یک تابع، نشانه‌ای از پیچیدگی کل تابع و توابعی است که آن را فراخوانی می‌کنند. در نهایت، پیچیدگی کشف‌نشده (Undiscovered Complexity) به مسیرهای کدی اشاره دارد که توسط فازرهای فعلی نرسیده‌اند.

همان‌طور که شکل ۸-۵ نشان می‌دهد، اگر در جدول Project Functions Overview بر اساس Accumulated Cyclomatic Complexity مرتب‌سازی کنید، می‌بینید که dwg_write_file و dwg_encode به‌ترتیب رتبه اول و دوم را دارند.

![Figure 8-5](/images/fig-8-5.png)

*Figure 8-5: The code complexity of functions in LibreDWG*

اگرچه این به نظر می‌رسد پیشنهاد می‌کند به‌جای dwg_encode باید dwg_write_file را فاز کنید، توجه کنید که dwg_write_file پیچیدگی سیکلوماتیک بسیار پایینی دارد. فاز کردن تابعی که فراخوانی‌های فایل‌سیستم انجام می‌دهد ممکن است بسیار کندتر باشد که در واقع dwg_encode را گزینه بهتری برای فازر می‌کند. furthermore، از آنجا که فازر سفارشی شما فقط روی dwg_decode تمرکز داشت، منطقی است که پیچیدگی کشف‌نشده زیادی در dwg_encode باقی مانده باشد.

همان‌طور که این مثال نشان می‌دهد، دو راه برای به‌کارگیری این داده وجود دارد. نخست، توابع با بالاترین پیچیدگی انباشته را شناسایی کنید. حتی اگر این توابع توسط دیگران سخت‌گیرانه‌محافظت و فاز شده باشند، می‌توانید از داده پوشش کد و موانع فازینگ برای بهینه کردن فازرتان استفاده کنید تا به این توابع برسد. دوم، توابع با بیشترین پیچیدگی کشف‌نشده (یعنی توابعی که عمیقاً فاز نشده‌اند) را بیابید و یک فازر جدید برای هدف گرفتن آن‌ها بنویسید.

در مقایسه با afl-cov، Fuzz Introspector تحلیل‌های سطح‌بالاتر فراوانی روی داده خام مانند پوشش کد ارائه می‌دهد. این‌ها به داده معنا می‌بخشند و به مهم‌ترین سؤالی که یک توسعه‌دهنده یا پژوهشگر به آن علاقه‌مند است پاسخ می‌دهند: آسیب‌پذیری‌ها به احتمال زیاد کجا هستند؟

پیش از پایان این بخش، شایان ذکر است که Fuzz Introspector ابزاری به نام Auto-Fuzz دارد که می‌تواند Harnessهای فازینگ را بر اساس داده پوشش به‌طور خودکار تولید کند. این قابلیت که هنوز در مرحله آزمایشی است، وعده فازینگ تمام‌خودکار را می‌دهد. با این حال، همان‌طور که دیدید، همیشه حالت‌های خاصی وجود دارند که به حضور انسان در حلقه نیاز دارند.

### خلاصه (Summary)

پیچیدگی پنهان فازینگ باعث می‌شود بسیاری از پژوهشگران آن را عملیاتی جعبه‌سیاه در نظر بگیرند: یک Harness و Corpus «به‌قدر کافی خوب» راه می‌اندازند و سپس «فاز می‌کنند و فراموش می‌کنند». در این فصل، درک عمیق‌تری از AFL++ و ابزارهای مرتبطش به دست آوردید تا بتوانید مؤثرتر از آن استفاده کنید. آموختید چگونه موانع فازینگ را حذف کنید و با نوشتن یک Harness سفارشی و استفاده از موازی‌سازی، سرعت فازینگ‌تان را به‌شکل جدی افزایش دهید.

البته فازینگ فقط یک ابزار کور برای تکان دادن آسیب‌پذیری‌ها از دل برنامه نیست (هرچند در این کار می‌تواند واقعاً خوب باشد)؛ در ترکیب با تحلیل پوشش، می‌تواند به شما کمک کند روی بخش‌های حیاتی‌تر برنامه تمرکز کنید. در این فصل از afl-cov و Fuzz Introspector برای یافتن موانع فازینگ اضافی و شناسایی اهداف جالب فازینگ استفاده کردید.

بسیاری از تکنیک‌های شرح‌داده‌شده در اینجا برای دیباگ و ابزارسازی صحیح هدف، به کد منبع نیاز دارند. اگرچه حجم عظیمی از نرم‌افزارها بر کد متن‌باز متکی‌اند، فاز کردن اهدافِ فقط-باینری یا فریمورک‌های حافظه مدیریت‌شده به این سادگی نیست. فصل بعد، این قطعه‌های مفقود را پر می‌کند و شروع می‌کنیم به فاز کردن همه‌چیز — بدون محدودیتِ نیاز به کد منبع یا مشخصات دقیق فرمت.`,
};
