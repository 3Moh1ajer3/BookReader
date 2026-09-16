import { Chapter } from "@/types/reader";

export const RESOURCES_CHAPTER_FA: Chapter = {
  id: "ch-resources",
  title: "منابع، کاتالوگ ابزارها و مراجع تکمیلی",
  readingTimeMinutes: 12,
  content: `# منابع، کاتالوگ ابزارها و مراجع تکمیلی

> *"سرمایه‌گذاری روی دانش، همواره بیشترین سود را به همراه دارد."*  
> — بنجامین فرانکلین

---

## مخزن رسمی سورس کدهای کتاب

تمام مثال‌های کد، کانتینرهای Dockerfile، برنامه‌های آزمایشی آسیب‌پذیر و اسکریپت‌های Exploit مطرح‌شده در این کتاب در مخزن رسمی گیت‌هاب میزبانی و نگهداری می‌شوند:

- **مخزن رسمی در گیت‌هاب:** https://github.com/spaceraccoon/from-day-zero-to-zero-day
- **وبلاگ پژوهشی نویسنده (Spaceraccoon):** https://spaceraccoon.dev
- **حساب کاربری نویسنده در شبکه اجتماعی X (توییتر سابق):** https://x.com/spaceraccoonsec

دستور شبیه‌سازی مخزن همراه با تمامی زیرماژول‌های پروژه‌های هدف:
\`\`\`bash
$ git clone https://github.com/spaceraccoon/from-day-zero-to-zero-day
$ cd from-day-zero-to-zero-day
$ git submodule update --init
\`\`\`

---

## کاتالوگ جامع ابزارهای تخصصی امنیت

### بازبینی کد و تحلیل واریانت (Code Review & Variant Analysis)
- **CodeQL:** https://codeql.github.com — موتور معنایی تحلیل عمیق کد در گیت‌هاب.
- **Semgrep:** https://semgrep.dev — ابزار فوق‌سریع و سبک برای تطبیق الگوهای نحوی کد.
- **AST Explorer:** https://astexplorer.net — نمایشگر آنلاین و تعاملی درخت نحو انتزاعی برای زبان‌های گوناگون.

### مهندسی معکوس و دیس‌اسمبلرها (Reverse Engineering & Disassembly)
- **Ghidra:** https://ghidra-sre.org — سوئیت رایگان و متن‌باز مهندسی معکوس توسعه‌یافته توسط آژانس امنیت ملی آمریکا (NSA).
- **ILSpy:** https://github.com/icsharpcode/ILSpy — دیکامپایلر مدرن و متن‌باز اکوسیستم دات‌نت (.NET).
- **dnSpy:** https://github.com/dnSpy/dnSpy — دیباگر و ویرایشگر اسمبلی برنامه‌های .NET.
- **JADX:** https://github.com/skylot/jadx — دیکامپایلر قدرتمند بایت‌کد دکس (DEX) اندروید به جاوا با رابط گرافیکی.
- **Decompyle++ (pycdc):** https://github.com/zrax/pycdc — دیس‌اسمبلر و دیکامپایلر بایت‌کدهای پایتون.
- **PyInstaller Extractor:** https://github.com/extremecoders-re/pyinstxtractor — ابزار استخراج فایل‌های اجرایی بسته‌بندی‌شده با PyInstaller.
- **GoReSym:** https://github.com/mandiant/GoReSym — استخراج‌کننده نمادها و ساختارهای باینری‌های کامپایل‌شده با Go (محصول Mandiant).
- **Binwalk:** https://github.com/ReFirmLabs/binwalk — ابزار استاندارد تحلیل و استخراج سیستم‌فایل میان‌افزارها (Firmware).

### ردیابی پویا و شبیه‌سازی (Dynamic Tracing & Emulation)
- **Frida:** https://frida.re — جعبه‌ابزار جهانی تجهیز و تزریق پویا به پردازه‌ها در تمامی سیستم‌عامل‌ها.
- **DynamoRIO:** https://dynamorio.org — پلتفرم تجهیز پویای باینری به همراه ماژول ثبت پوشش کد (\`drcov\`).
- **Qiling Framework:** https://qiling.io — موتور پیشرفته شبیه‌سازی میان‌افزارها و باینری‌های معماری‌های مختلف.
- **angr:** https://angr.io — پلتفرم جامع پایتونی برای اجرای نمادین (Symbolic Execution) و حل معادلات SMT با Z3.
- **pspy:** https://github.com/DominicBreuker/pspy — مانیتورینگ پردازه‌ها و فرامین لینوکس بدون نیاز به دسترسی Root.

### ابزارهای فازینگ (Fuzzing Suite)
- **AFL++:** https://github.com/AFLplusplus/AFLplusplus — فازر هدایت‌شده با پوشش کد و گل سرسبد دنیای فازینگ مدرن.
- **boofuzz:** https://github.com/jtpereyda/boofuzz — چارچوب تخصصی پایتونی برای فازینگ پروتکل‌های شبکه.
- **radamsa:** https://gitlab.com/akihe/radamsa — ژنراتور آزمون همه‌منظوره مبتنی بر جهش بایت‌ها.
- **FormatFuzzer:** https://github.com/uds-se/FormatFuzzer — چارچوب کامپایل الگوهای باینری به فازرهای آگاه از گرامر.
- **Jazzer:** https://github.com/CodeIntelligenceTesting/jazzer — فازر هدایت‌شده با پوشش کد برای ماشین مجازی جاوا (JVM).
- **Fuzzilli:** https://github.com/googleprojectzero/fuzzilli — فازر موتورهای جاوااسکریپت و وب‌اسمبلی (Google Project Zero).
- **Google OSS-Fuzz:** https://github.com/google/oss-fuzz — سرویس فازینگ مداوم برای پروژه‌های حیاتی متن‌باز جهان.

---

## درگاه‌های رسمی ثبت و هماهنگی آسیب‌پذیری
- **سامانه ثبت درخواست CVE در MITRE:** https://cveform.mitre.org
- **پایگاه داده ملی آسیب‌پذیری‌های ایالات متحده (NVD):** https://nvd.nist.gov
- **استاندارد جهانی اعلام سیاست‌های امنیتی (RFC 9116):** https://securitytxt.org
- **مرکز هماهنگی پاسخ به فوریت‌های رایانه‌ای (CERT/CC):** https://kb.cert.org/vuls/
- **تیم پژوهشی Google Project Zero:** https://googleprojectzero.blogspot.com
- **برنامه ابتکار روز صفر (Zero Day Initiative - ZDI):** https://www.zerodayinitiative.com
`
};
