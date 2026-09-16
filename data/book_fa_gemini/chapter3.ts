import { Chapter } from "@/types/reader";

export const CHAPTER_3_FA: Chapter = {
  id: "ch-3",
  title: "فصل ۳: تحلیل خودکار واریانت‌ها (Automated Variant Analysis)",
  readingTimeMinutes: 48,
  content: `## ۳: تحلیل خودکار واریانت‌ها (AUTOMATED VARIANT ANALYSIS)

> *«تنها متصل کنید!»* — ای. ام. فورستر، *هاواردز اِند* (Howards End)

اکنون که به تحلیل کد هم از دیدگاه «درون به بیرون» (رویکرد کد به ورودی) و هم از رویکرد «بیرون به درون» (رویکرد سطح حمله به سینک) تسلط یافته‌اید، زمان آن فرا رسیده است که این دو نگرش را برای ساخت الگوهایی با قابلیت جستجوی خودکار در ابعاد بزرگ ترکیب کنیم.

در این فصل، مبانی نظری و تئوری حاکم بر تحلیل خودکار کد را خواهید آموخت؛ سپس به صورت عملی با دو ابزار تحلیل ایستای کد (SAST) متن‌باز و بسیار محبوب در جامعه امنیت، یعنی **CodeQL** و **Semgrep** تمرین خواهید کرد. در ادامه، این ابزارها را در خدمت **تحلیل واریانت (Variant Analysis)** به کار خواهید گرفت: بدین ترتیب که با شناسایی یک الگوی کد آسیب‌پذیر برگرفته از یک آسیب‌پذیری واحد و شناخته‌شده، واریانت‌ها و نمونه‌های مکرر دیگری از همان نقص را در گوشه‌های دیگر پروژه شکار خواهید کرد. برای بهینه‌سازی و روان‌سازی گردش‌کار، از افزونه رسمی CodeQL در محیط توسعه Visual Studio Code (VS Code) بهره خواهید برد. در نهایت، با استفاده از زیرساخت‌های ابری گیت‌هاب، **تحلیل چندمخزنی واریانت‌ها (Multi-Repository Variant Analysis)** را در میان صدها پروژه نرم‌افزاری برتر جهان به بوته آزمایش خواهید گذاشت.

---

### درخت‌های نحو انتزاعی (Abstract Syntax Trees)

برای دستیابی به عملکردی فراتر از یک عملیات ساده «تطبیق و جایگزینی با عبارات باقاعده (Regex Match-and-Replace)»، ابزارهای مدرن تحلیل ایستای کد به درکی بنیادین و ساختاریافته از سورس‌کد تکیه می‌کنند؛ ادراکی که تمایز میان یک تابع و یک متغیر، وراثت کلاس‌ها در زبان‌های شیءگرا و دامنه متغیرها را بازشناسی کند. این درک ساختاری معمولاً در قالب یک **درخت نحو انتزاعی (Abstract Syntax Tree یا به اختصار AST)** فرمول‌بندی می‌شود؛ بازنمایی سلسله‌مراتبی و درختی که ساختار نحوی انتزاعی یک برنامه را مجسم می‌سازد. درخت‌های AST نقشی بسیار اساسی‌تر از تحلیل امنیتی صرف دارند: کامپایلرها برای بازبینی اعتبار گرامری کد پیش از کامپایل آن به زبان ماشین، کد را به AST تبدیل می‌کنند.

شما می‌توانید ساختار یک AST را با استفاده از ماژول درونی \`ast\` در پایتون مشاهده و مصورسازی کنید. برای آزمایش این مفهوم، قطعه‌کد زیر را در اسکریپتی به نام \`ast_example_1.py\` ذخیره کنید:

\`\`\`python
import ast
# سورس‌کد پایتون برای تبدیل به درخت نحو انتزاعی (AST)
code = """
name = 'World'
print('Hello,' + name)
"""
tree = ast.parse(code)
print(ast.dump(tree, indent=4))
\`\`\`

اسکریپت را در ترمینال اجرا کنید تا کد منبع به یک درخت نحو تجزیه شود. خروجی زیر نمایش داده خواهد شد:

\`\`\`bash
$ python ast_example_1.py
Module(
    body=[
        Assign(
            targets=[
                Name(id='name', ctx=Store())],
            value=Constant(value='World')),
        Expr(
            value=Call(
                func=Name(id='print', ctx=Load()),
                args=[
                    BinOp(
                        left=Constant(value='Hello,'),
                        op=Add(),
                        right=Name(id='name', ctx=Load()))],
                keywords=[]))],
    type_ignores=[])
\`\`\`

این خروجی در قالب یک ساختار درختی سازمان‌دهی شده است؛ به گونه‌ای که گره ریشه \`Module\` به گره‌های فرزند مانند دستور انتساب (\`Assign\`)، عبارت (\`Expr\`) و فراخوانی (\`Call\`) منشعب می‌شود.

حال فرض کنید که تابع \`print\` یک تابع چاهک (Sink) خطرناک و آسیب‌پذیر باشد. شما قصد دارید بدانید آیا اجرای کد پایتون زیر، در عمل تابع \`print\` را صدا خواهد زد یا خیر:

\`\`\`python
def old_greet(name):
❶     print('Hello, ' + name)
yell = print
❷ yell('HELLO, WORLD')
\`\`\`

این قطعه‌کد تابعی ساده به نام \`old_greet\` تعریف می‌کند که رشته \`'Hello, '\` را به همراه آرگومان ورودی‌اش چاپ می‌کند. سپس کد تابع درونی \`print\` را به متغیری به نام \`yell\` منتسب کرده و در ادامه آن متغیر را با آرگومان \`'HELLO, WORLD'\` فراخوانی می‌نماید ❷.

یک رویکرد خام و مبتدی برای جستجوی این خطر، استفاده از یک عبارت باقاعده (Regex) مانند \`/print\\([^)]*\\)/g\` است؛ اما این جستجو با شکست مواجه می‌شود:
۱. در گام اول با یک **هشدار کاذب (False Positive)** روبرو می‌شوید، زیرا با اینکه تابع \`old_greet\` حاوی \`print\` است ❶، این تابع در هیچ کجای اسکریپت صدا زده نمی‌شود.
۲. در نقطه مقابل، فراخوانی متغیر \`yell\` در حقیقت یک فراخوانی واقعی به \`print\` است، اما به دلیل یک انتساب متغیر ساده، رگکس به طور کامل آن را از دست داده و دچار **منفی کاذب (False Negative)** می‌شود.

نوشتن یک رجکس که بتواند تمامی سناریوهای استثنایی و حاشیه‌ای را حتی برای کدی به این سادگی مدیریت کند، به غایت پیچیده، شکننده و غیرقابل دیباگ خواهد بود.

در مقابل، شما می‌توانید درخت نحو انتزاعی (AST) را پیمایش کنید تا تمامی گره‌های فراخوانی (\`Call\`) را که واقعاً بر اساس معنای گره‌های والد خود رخ می‌دهند شناسایی نمایید. بار دیگر از ماژول \`ast\` برای تبدیل کد بهره می‌گیریم. کد نمونه بالا را در فایلی به نام \`sample_code.py\` ذخیره کنید؛ سپس در همان پوشه اسکریپتی به نام \`ast_example_2.py\` با محتوای زیر بسازید:

\`\`\`python
import ast
import os

cur_dir = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(cur_dir, 'sample_code.py')) as f:
    tree = ast.parse(f.read())
print(ast.dump(tree, indent=4))
\`\`\`

خروجی این اسکریپت ساختاری به این صورت خواهد داشت:

\`\`\`bash
$ python ast_example_2.py
Module(
    body=[
        FunctionDef(
            name='old_greet',
            args=arguments(
                posonlyargs=[],
                args=[
                    arg(arg='name')],
                kwonlyargs=[],
                kw_defaults=[],
                defaults=[]),
            body=[
                Expr(
                    value=Call(
                        func=Name(id='print', ctx=Load()),
                        args=[
                            BinOp(
                                left=Constant(value='Hello, '),
                                op=Add(),
                                right=Name(id='name', ctx=Load()))],
                        keywords=[]))],
            decorator_list=[]),
        Assign(
            targets=[
                Name(id='yell', ctx=Store())],
            value=Name(id='print', ctx=Load())),
        Expr(
            value=Call(
                func=Name(id='yell', ctx=Load()),
                args=[
                    Constant(value='HELLO, WORLD')],
                keywords=[]))],
    type_ignores=[])
\`\`\`

با آگاهی از رفتار هر گره، می‌توانید با هوشمندی کامل AST را بپیمایید؛ تنها از گره‌هایی چون \`Assign\` و \`Expr\` عبور کنید و گره‌هایی مانند \`FunctionDef\` را نادیده بگیرید، مگر آنکه تابع تعریف‌شده در نقطه‌ای از برنامه صدا زده شده باشد. با ردیابی متغیرهای تحت تأثیر گره \`Assign\`، الگوریتم به درستی متوجه می‌شود که مسیر موجود در درخت در نهایت به یک گره \`Call\` می‌رسد که شناسه متغیر \`func\` آن در حقیقت همان شیء تابع \`print\` است.

ساختار درختی به الگوریتم‌های بهینه‌سازی‌شده اجازه می‌دهد تا اطلاعات مورد نظر را مستقیماً از AST استخراج کنند و چرخه‌های پردازشی CPU را برای شاخه‌های هرس‌شده و غیرفعال تلف ننمایند. یکی دیگر از روش‌های بازنمایی کد، **گراف کنترل جریان (Control Flow Graph یا CFG)** است که تمامی مسیرهای اجرایی بالقوه در طول اجرای یک برنامه را مدل می‌کند. این بازنمایی پرس‌وجوهای پیشرفته‌تری نظیر **تحلیل دسترسی‌پذیری (Reachability Analysis)** را امکان‌پذیر می‌سازد؛ تحلیلی که تعیین می‌کند چه بخش‌هایی از کد واقعاً در طول چرخه حیات نرم‌افزار قابل اجرا و دسترس هستند.

شیوه بازنمایی دیگر، **گراف جریان داده (Data Flow Graph یا DFG)** نام دارد. در حالی که گراف‌های CFG بر ترتیب و توالی اجرای دستورات (نظیر دستورات شرطی if-else و حلقه‌ها) تمرکز دارند، گراف‌های DFG بر انتشار، جابجایی و دگرگونی داده‌ها (شامل متغیرها و عبارات محاسباتی) تمرکز می‌نمایند. هم CFG و هم DFG مدل‌هایی فوق‌العاده کاربردی برای خودکارسازی تحلیل کد هستند.

درک این مبانی نظری برای شناخت نحوه کارکرد ابزارهای تحلیل ایستا حیاتی است. هر سطحی از انتزاع ناگزیر مقداری از جزئیات سطح پایین را فدا می‌کند. اگرچه تحلیل دستی کد ممکن است در این زمینه جامع‌تر باشد، اما بررسی دستی نرم‌افزارهای پیچیده‌ای که از میلیون‌ها سطر کد تشکیل شده‌اند عملاً ناممکن است. در چنین مواردی، ابزارهای تحلیل ایستای کد بی‌اندازه سودمند هستند و شناخت نقاط قوت و ضعف آن‌ها، شما را قادر می‌سازد تا آنها را به گونه‌ای اثربخش در خدمت استراتژی تحقیقات امنیتی خود قرار دهید.

---

### ابزارهای تحلیل ایستای کد (Static Code Analysis Tools)

تمامی ابزارهای تحلیل سورس‌کد در سطحی یکسان ساخته نشده‌اند. تفاوت در سطوح انتزاع و شیوه‌های جستجو و کوئری‌زنی مستقیماً بر کارایی یک ابزار در یافتن الگوهای خاص امنیتی اثر می‌گذارد. در این بخش، تفاوت‌های عملکردی این ابزارها را در عمل با دو موتور برجسته **CodeQL** و **Semgrep** بررسی خواهید کرد.

#### موتور CodeQL

ابزار CodeQL یک موتور تحلیل کد عمیق با ریشه‌های دانشگاهی و آکادمیک است. این فناوری توسط تیمی از پژوهشگران دانشگاه آکسفورد ایجاد شد که یک زبان پرس‌وجوی شیءگرا (با نام اولیه \`.QL\`) ابداع کردند تا بتواند یک پایگاه‌داده رابطه‌ای حاوی مدل انتزاعی کد را کوئری بزند. تمرکز بر مفهوم پایگاه‌داده یکی از اساسی‌ترین تفاوت‌های میان CodeQL و Semgrep است؛ CodeQL پیش از اجرای هرگونه جستجو، باید ابتدا یک **پایگاه‌داده معنایی از کد منبع** بسازد. در زبان‌های کامپایل‌شونده (مانند C و C++)، این مرحله با سیستم ساخت پروژه (مانند \`make\`) پیوند می‌خورد تا تمامی فراخوانی‌های کامپایلر شنود شوند. برای زبان‌های تفسیری و غیرکامپایلی مانند پایتون یا جاوااسکریپت، CodeQL از **استخراج‌کننده‌ها (Extractors)** برای تجزیه نحوی کد پیش از ذخیره در دیتابیس استفاده می‌کند.

همان‌طور که انتظار می‌رود، زبان پرس‌وجوی CodeQL شباهت‌های بنیادینی با زبان‌های کوئری دیتابیس مانند SQL دارد. به عنوان نمونه، کوئری CodeQL زیر را برای یافتن فراخوانی‌های تابع \`print\` در پایتون در نظر بگیرید:

\`\`\`ql
import python
from Call call, Name name
where call.getFunc() = name and name.getId() = "print"
select call, "call to 'print'."
\`\`\`

کلاس‌های موجود در این کوئری CodeQL (\`Call\` و \`Name\`) دقیقاً همان نام‌های انواع داده در ماژول \`ast\` پایتون را دارند، چرا که استخراج‌کننده پایتون CodeQL علاوه بر کلاس‌های اختصاصی خود از ماژول \`ast\` برای پارس پروژه‌های پایتونی بهره می‌برد. به همین منوال، بسیاری از دیگر استخراج‌کننده‌های آن با عمق بالایی در اکوسیستم زبان هدف ادغام شده‌اند؛ برای نمونه، استخراج‌کننده Go در CodeQL از پکیج \`go/ast\` در کتابخانه استاندارد زبان Go استفاده می‌کند (مشاهده سورس در \`github.com/github/codeql/blob/820de5d/go/extractor/extractor.go\`). این رویکرد استخراج عمیق و سفارشی‌شده به CodeQL اجازه می‌دهد پایگاه‌های داده جامعی از روابط جریان داده و کنترل جریان خلق کند.

به لطف این رویکرد ژرف، شما می‌توانید کوئری‌های بسیار قدرتمندی بر مبنای **ردیابی سراسری جریان آلودگی (Global Taint Tracking)** بنویسید تا آسیب‌پذیری‌های موسوم به Source-to-Sink (مسیر ورود تا مقصد آسیب‌پذیر) را شناسایی کنید. به علاوه، شیءگرا بودن زبان QL به شما امکان می‌دهد مؤلفه‌ها و قوانین نوشته‌شده را به سادگی بازطراحی و مجدداً استفاده نمایید. مثال چندفایلی زیر، قدرت واقعی CodeQL را به رخ می‌کشد.

#### مثال ردیابی چندفایلی جریان داده (Multifile Taint Tracking Example)

یک سرور رابط وب (Web API) مبتنی بر فریم‌ورک Express در Node.js را فرض کنید که از دو فایل مجزا تشکیل شده است: \`index.js\` و \`utils.js\`. این سرویس وب تنها یک نقطه انتهایی \`/ping\` دارد که باعث می‌شود سرور هر آدرس آی‌پی ارسال‌شده در پارامتر کوئری \`ip\` را پینگ کند. متأسفانه توسعه‌دهنده به دلیل عدم اعتبارسنجی، یک آسیب‌پذیری بحرانی «اجرای کد از راه دور به عنوان سرویس» را در قالب یک نقص تزریق فرمان (Command Injection) به بار آورده است:

\`\`\`javascript
// index.js
const express = require("express");
❶ const { ping } = require("./utils.js");
const app = express();

app.get("/ping", (req, res) => {
❷     const ip = req.query.ip;
    res.send(\`Result: \\n\${ping(ip)}\`);
});

app.listen(3000);
\`\`\`

شما با نگاه کردن به محتوای فایل \`index.js\` به تنهایی نمی‌توانید وجود آسیب‌پذیری را اثبات کنید. اگرچه این فایل با دریافت داده از \`req.query.ip\` یک منبع داده تحت کنترل کاربر (Source) ایجاد می‌کند ❷، اما لازم است بررسی کنید که آیا تابع \`ping\` که از فایل \`utils.js\` ایمپورت شده است ❶ آرگومان ورودی \`ip\` را به یک چاهک (Sink) خطرناک تحویل می‌دهد یا خیر:

\`\`\`javascript
// utils.js
const { execSync } = require("child_process");

exports.ping = (ip) => {
    try {
❶         return execSync(\`ping -c 5 \${ip}\`);
    } catch (error) {
        return error.message;
    }
};
\`\`\`

متأسفانه تابع \`ping\` متغیر ورودی \`ip\` را به تابع \`execSync\` پاس می‌دهد ❶، تابعی که نخستین آرگومان خود را مستقیماً به عنوان یک فرمان سیستمی در شل لینوکس اجرا می‌کند. بنابراین یک مهاجم می‌تواند با ارسال مقداری نظیر \`;whoami\` در پارامتر \`ip\`، فرامین دلخواه خود را اجرا نماید.

اگرچه بازبینی دستی این نقص ساده به نظر می‌رسد، اما فرایند ردیابی منبع به چاهک (Source-to-Sink) اکثر جستجوهای مبتنی بر رجکس را ناکام می‌گذارد؛ زیرا رگکس‌ها توانایی درک ارتباط میان توابع ایمپورت‌شده و جریان داده‌ها را در بین فایل‌های مختلف پروژه ندارند. خوشبختانه CodeQL قادر به انجام این کار است، زیرا کد را به صورت یک گراف DFG مدل‌سازی کرده و آن را با ردیابی جریان آلودگی گسترش می‌دهد. تفاوت ظریفی میان تحلیل جریان داده (Data Flow) و ردیابی آلودگی (Taint Tracking) وجود دارد: تحلیل صرف جریان داده نحوه انتشار یک مقدار مشخص (نظیر مقدار دست‌نخورده یک متغیر) را ردیابی می‌کند، اما متغیرهای دیگری را که تحت تأثیر یا حاصل ترکیب آن متغیر آلوده هستند دنبال نمی‌کند. تفکیک کتابخانه‌های \`DataFlow\` و \`TaintTracking\` در CodeQL دقیقاً نشان‌دهنده همین تفاوت فنی است.

علاوه بر این، CodeQL کلاس‌های آماده و بسیار کارآمدی برای منابع و چاهک‌های رایج در اختیار قرار می‌دهد؛ از جمله کلاس‌هایی برای تشخیص ورودی‌های راه دور کاربر و توابع اجرای فرامین سیستمی. بدین ترتیب، یک قاعده ردیابی سراسری آلودگی برای سرور آسیب‌پذیر فوق می‌تواند در فایلی با نام \`RemoteCommandInjection.ql\` به شکل زیر نوشته شود:

\`\`\`ql
/**
 * @name Remote Command Injection
 * @kind path-problem
 * @severity error
 * @id remote-command-injection
 */
import javascript

module RemoteCommandInjectionConfig implements DataFlow::ConfigSig {
  predicate isSource(DataFlow::Node source) {
❶     source instanceof RemoteFlowSource
  }

  predicate isSink(DataFlow::Node sink) {
❷     sink = any(SystemCommandExecution sys).getACommandArgument()
  }
}

module RemoteCommandInjectionFlow =
  TaintTracking::Global<RemoteCommandInjectionConfig>;
import RemoteCommandInjectionFlow::PathGraph

from RemoteCommandInjectionFlow::PathNode source,
     RemoteCommandInjectionFlow::PathNode sink
where RemoteCommandInjectionFlow::flowPath(source, sink)
select sink.getNode(), source, sink,
  "taint from $@ to $@.", source.getNode(), "source", sink, "sink"
\`\`\`

در حال حاضر نگران جزئیات فنی سینتکس زبان QL نباشید. در عوض بر ساختار کلی کوئری تمرکز کنید: پیکربندی ردیابی آلودگی منابع را نمونه‌هایی از \`RemoteFlowSource\` تعریف می‌کند ❶ و چاهک‌ها را به عنوان آرگومان‌های فرمانی در هر نمونه از \`SystemCommandExecution\` مشخص می‌سازد ❷. این تعریف مختصر تمام چیزی است که برای ردیابی داده‌های تحت کنترل مهاجم به یک فراخوانی تابع آسیب‌پذیر نیاز دارید. کوئری اصلی سپس بررسی می‌کند که آیا مسیری از منابع به چاهک‌ها وجود دارد یا خیر (\`flowPath\`)، و در صورت کشف مسیر، خروجی را در ساختاری ساختاریافته تولید می‌کند که ابزارهای تحلیلی می‌توانند آن را به مسیرهای گام‌به‌گام تفکیک کنند (بخشی از مراحل میانی برای اختصار حذف شده است):

\`\`\`json
"results" : [ {
  "codeFlows" : [ {
    "threadFlows" : [ {
      "locations" : [ {
        "location" : {
          "physicalLocation" : {
            "artifactLocation" : {
              "uri" : "index.js",
              "uriBaseId" : "%SRCROOT%"
            },
            "region" : {
              "startLine" : 7,
              "startColumn" : 16,
              "endColumn" : 28
            }
          },
          "message" : {
❶           "text" : "req.query.ip"
          }
        }
      },
      {
        "location" : {
          "physicalLocation" : {
            "artifactLocation" : {
              "uri" : "index.js",
              "uriBaseId" : "%SRCROOT%",
              "index" : 1
            },
            "region" : {
              "startLine" : 8,
              "startColumn" : 32,
              "endColumn" : 34
            }
          },
          "message" : {
❷           "text" : "ip"
          }
        }
      },
      {
        "location" : {
          "physicalLocation" : {
            "artifactLocation" : {
              "uri" : "utils.js",
              "uriBaseId" : "%SRCROOT%",
              "index" : 0
            },
            "region" : {
              "startLine" : 5,
              "startColumn" : 21,
              "endColumn" : 38
            }
          },
          "message" : {
❸           "text" : "\`ping -c 5 \${ip}\`"
          }
        }
      } ]
    } ]
  } ]
} ]
\`\`\`

همان‌طور که در خروجی می‌بینید، CodeQL داده آلوده را با دقتی شگفت‌انگیز از پارامتر درخواست در \`req.query.ip\` ❶ به متغیر محلی \`ip\` ❷ و سپس از طریق فراخوانی بین‌فایلی به رشته قالب‌بندی‌شده درون تابع \`execSync\` در فایل \`utils.js\` ❸ ردیابی می‌کند.

نکته‌ای بسیار آموزنده در اینجا نهفته است: اگر به جای \`TaintTracking::Configuration\` از تحلیل صرف داده یعنی \`DataFlow::Configuration\` استفاده می‌کردید، نتیجه کوئری دقیقاً صفر یافته بود! علت این است که تحلیل جریان داده تنها زمانی مسیر را ادامه می‌دهد که مقدار عینی داده عیناً حفظ شود؛ اما استفاده از رشته الگویی (Template String در \`\`\` \`ping -c 5 \${ip}\` \`\`\`) باعث می‌شود مقدار رشته تغییر یافته و دیگر خود متغیر اولیه نباشد و مسیر جریان داده قطع شود. تنها در صورتی که در فایل \`utils.js\` مستقیماً از دستور \`execSync(ip)\` استفاده می‌شد، تحلیل استاندارد جریان داده موفق عمل می‌کرد. اینجاست که اهمیت تحلیل جریان آلودگی (Taint Tracking) متمایز می‌گردد.

قدرت خارق‌العاده ردیابی سراسری آلودگی البته با مصالحه‌ها و هزینه‌هایی همراه است: گذر از تحلیل محلی به تحلیل سراسری بین‌فایلی و تغییر از جریان داده به ردیابی آلودگی، به لحاظ محاسباتی سنگین‌تر بوده و می‌تواند درصد هشدارهای کاذب را بالا ببرد. علاوه بر این، سینتکس نگارش قوانین در CodeQL پیچیده است؛ شما عملاً باید با مفاهیم یک زبان برنامه‌نویسی کامل با الگوهای شیءگرا، انتزاع‌ها و کتابخانه‌های استاندارد آن آشنا شوید.

#### افزونه CodeQL برای VS Code

برای کاهش اصطکاک در زمان توسعه و دیباگ کوئری‌های CodeQL، می‌توانید از افزونه اختصاصی CodeQL در ویژوال استودیو کد استفاده کنید. این افزونه رابط کاربری غنی و کارآمدی ارائه می‌دهد که با رابط خط فرمان CodeQL CLI هماهنگ شده و محیط توسعه کاملی (IDE) برای نوشتن کوئری‌های QL می‌سازد.

اگرچه این افزونه یک نسخه داخلی از ابزار خط فرمان را همراه دارد، اما مستندات رسمی آن تأکید می‌کند:

> *«ابزار خط فرمان مدیریت‌شده توسط افزونه، از طریق ترمینال قابل دسترس نیست. چنانچه قصد دارید از CLI در خارج از محیط افزونه (برای مثال جهت ساخت دیتابیس‌ها) استفاده کنید، توصیه می‌کنیم نسخه مستقل CodeQL CLI را روی سیستم خود نصب نمایید.»*

برای نصب CodeQL CLI، آخرین نسخه باندل را از صفحه انتشارات گیت‌هاب (\`https://github.com/github/codeql-action/releases\`) دانلود کرده، آرشیو را اکسترکت کنید و مسیر آن را به متغیر محیطی \`PATH\` خود بیفزایید. به عنوان مثال در توزیع Kali Linux فرامین زیر را اجرا نمایید:

\`\`\`bash
$ wget https://github.com/github/codeql-action/releases/download/codeql-bundle-v2.20.2/codeql-bundle-linux64.tar.gz
$ tar -xzvf codeql-bundle-linux64.tar.gz
$ echo "export PATH=\\$PATH:$(pwd)/codeql" >> ~/.zshrc
$ source ~/.zshrc
$ codeql version
Unpacked in: /home/kali/Desktop/codeql
Analysis results depend critically on separately distributed query and
extractor modules. To list modules that are visible to the toolchain,
use 'codeql resolve packs' and 'codeql resolve languages'.
\`\`\`

پس از نصب CLI، ویرایشگر VS Code را باز کنید و افزونه CodeQL را با فشردن کلیدهای \`CTRL-P\` و وارد کردن دستور \`ext install GitHub.vscode-codeql\` نصب نمایید (یا در بخش Extensions عبارت CodeQL را جستجو و نصب کنید).

سپس مخزن پیش‌فرض و استارتر CodeQL را با دستور زیر به صورت بازگشتی (شامل ساب‌ماژول‌های گیت) شبیه‌سازی کنید:

\`\`\`bash
$ git clone --recursive https://github.com/github/vscode-codeql-starter
\`\`\`

عدم استفاده از فلگ \`--recursive\` باعث می‌شود ساب‌ماژول‌های حاوی پکیج‌ها و کتابخانه‌های استاندارد دانلود نشوند و بعداً در اجرای کوئری‌ها با خطای نبود پکیج مواجه شوید. سپس فایل ورک‌اسپیس \`vscode-codeql-starter.code-workspace\` را از مسیر \`File ▶ Open Workspace\` در VS Code باز کنید.

حال برای تست کوئری بالا، پایگاه‌داده کد نمونه فرمان را می‌سازیم. کدهای دو فایل \`index.js\` و \`utils.js\` را در پوشه‌ای خارج از ورک‌اسپیس (برای مثال \`app\`) قرار داده و دستور زیر را اجرا کنید:

\`\`\`bash
$ cd chapter-03/command-injection-example
$ codeql database create --language javascript --source-root app example-database
Finished writing database (relations: 13.30 MiB; string pool: 4.78 MiB).
TRAP import complete (2.1s).
Finished zipping source archive (243.70 KiB).
Successfully created database at /home/kali/Desktop/chapter-03/command-injection-example/example-database.
\`\`\`

مراحل تست کوئری در محیط VS Code:
۱. در نوار ابزار سمت چپ (Activity Bar) روی آیکون CodeQL کلیک کنید.
۲. در بخش **Databases** گزینه **From a folder** را انتخاب کرده و پوشه \`example-database\` را معرفی نمایید.
۳. پس از بارگذاری پایگاه‌داده، روی آن راست‌کلیک کرده و گزینه **Add Database Source to Workspace** را بزنید تا کدهای سورس وارد اکسپلورر شوند.
۴. در بخش اکسپلورر فایل، روی \`index.js\` راست‌کلیک کرده و گزینه **CodeQL: View AST** را انتخاب کنید تا نمایش بصری درخت نحو در سایدبار گشوده شود.
۵. با کلیک بر روی هر سطر در کد (برای مثال دستور \`res.send\`) گره متناظر آن در درخت باز می‌شود که نشان می‌دهد این سطر یک \`ExprStmt\` با فرزند \`MethodCallExpr\` است. این به شما کمک می‌کند هنگام نوشتن کوئری کلاس‌های مناسب را انتخاب کنید.
۶. فایل کوئری \`RemoteCommandInjection.ql\` را در پوشه \`codeql-custom-queries-javascript\` قرار دهید (این پوشه حاوی فایل \`qlpack.yml\` است که پکیج \`codeql/javascript-all\` را مدیریت می‌کند).
۷. روی فایل کوئری راست‌کلیک کرده و گزینه **CodeQL: Run Queries in Selected Files** را بزنید.

افزونه خروجی را استخراج کرده و مسیری گرافیکی و گام‌به‌گام را به تصویر می‌کشد. با کلیک بر روی هر گام از آلودگی، مستقیماً به سطر متناظر در کد سورس منتقل می‌شوید.

---

### ابزار Semgrep: تطبیق الگوهای سریع و چابک

ابزار محبوب دیگر تحلیل ایستا، **Semgrep** است. بر خلاف رویکرد مبتنی بر کوئری و پایگاه‌داده در CodeQL، سینتکس ابزار Semgrep مبتنی بر **تطبیق الگو (Pattern-Oriented)** است. این تفاوت فلسفی، تجربه کاربری و قابلیت‌های Semgrep را به کلی متمایز می‌سازد. برای مطالعه تاریخچه جذاب پیدایش Semgrep و سلف آن یعنی \`sgrep\`، می‌توانید پست وبلاگی یوهان پادیولو (Yoann Padioleau) را با عنوان *«Semgrep: A Static Analysis Journey»* مطالعه نمایید.

قانون زیر در قالب فایل \`express-injection.yml\` را در نظر بگیرید که دقیقاً همان نقص تزریق فرمان در سرور Express فوق را هدف قرار می‌دهد:

\`\`\`yaml
rules:
  - id: express-injection
    mode: taint ❶
    pattern-sources:
      - pattern: req.query.$PARAMETER ❷
    pattern-sinks:
      - pattern: execSync(...) ❸
    message: "ارسال پارامتر غیرقابل‌اعتماد کاربر در Express به تابع اجرای فرمان سیستمی"
    languages:
      - javascript
    severity: ERROR
    metadata:
      interfile: true
\`\`\`

چند مفهوم کلیدی در قوانین Semgrep خودنمایی می‌کند:
۱. **قالب YAML و ویژگی‌های آن:** قوانین با YAML نوشته می‌شوند؛ بنابراین باید مراقب رفتارهای خاص آن مانند رشته‌های چندخطی (با کاراکتر \`|\`)، مقادیر بولی و کاراکترهای اسکیپ باشید.  
*نکته جالب:* روزی یکی از پژوهشگران هنگام نوشتن یک قانون Semgrep برای یافتن پیکربندی ناامن در یک فایل XML به صورت \`<setting name="sanitizeInputs">off</setting>\` مرتباً با خطای \`False is not of type 'string'\` مواجه می‌شد. پس از ساعت‌ها بررسی مشخص شد که در مشخصات نگارش ۱.۱ استاندارد YAML، کلمات \`on\` و \`off\` به عنوان مقادیر بولی (True/False) تفسیر می‌شوند و نه رشته متنی!
۲. **متامتغیرها (Metavariables):** متامتغیرها همواره با نماد دلار (\`$\`) آغاز شده و فقط شامل حروف بزرگ، ارقام و زیرخط (\`_\`) هستند ❷. متامتغیرها هر عبارتی (مانند نام تابع، متغیر یا عبارت محاسباتی) را ثبت کرده و امکان ارزیابی بیشتر و مقایسه در سایر شرط‌ها را فراهم می‌کنند.
۳. **عملگر بیضی (Ellipsis Operator):** عملگر سه نقطه (\`...\`) ❸ توالی صفر یا چند مؤلفه را (مانند آرگومان‌های تابع، دستورالعمل‌های متوالی یا کاراکترهای رشته) نادیده می‌گیرد و به شما امکان می‌دهد قطعات غیرمرتبط را انتزاع کنید.

ترکیب متامتغیرها و عملگر بیضی کاربرد فراوانی دارد. برای مثال، اگر بخواهید کلیدهای محرمانه و توکن‌های هاردکدشده‌ای را که متغیر آنها با پیشوند \`SECRET_\` نام‌گذاری شده است شکار کنید:

\`\`\`javascript
var SECRET_KEY = "D3ADB33F";
var SECRET_TOKEN = "1337";
\`\`\`

الگوی قانون در Semgrep به سادگی به این صورت خواهد بود:

\`\`\`yaml
patterns:
  - pattern: var $VARIABLE_NAME = "..."
  - metavariable-regex:
      metavariable: $VARIABLE_NAME
      regex: SECRET_.*
\`\`\`

اپراتور \`patterns\` یک عملگر عطف منطقی (AND) روی فرزندان خود اجرا می‌کند؛ در این مثال فقط کدی که انتساب رشته باشد و نام متغیر آن با عبارت منظم \`SECRET_.*\` همخوانی داشته باشد انتخاب می‌گردد. برای عملگر فصل منطقی (OR)، می‌توان از \`pattern-either\` بهره جست.

#### مقایسه فنی رویکرد Semgrep و CodeQL

تفاوت‌های بنیادین میان Semgrep و CodeQL فراتر از سینتکس است:
- **بازنمایی مستقل از زبان:** ابزار Semgrep به جای ایجاد یک دیتابیس رابطه‌ای خاص برای هر زبان، کدهای زبان‌های گوناگون را ابتدا به یک AST عمومی تبدیل کرده و سپس به یک **زبان میانی (Intermediate Language یا IL)** نگاشت می‌دهد. بنابراین Semgrep می‌تواند الگوی \`function_name(...)\` را بدون نیاز به کامپایل یا ساخت دیتابیس، هم‌زمان روی سورس‌های پایتون، جاوااسکریپت، C و Go پیاده کند.
- **محدودیت‌های نسخه پایه (Semgrep OSS):** از آنجا که AST برخلاف CFG یا DFG اطلاعات جریان اجرا را مستقیماً نگهداری نمی‌کند و برای هر فایل یک AST جداگانه شکل می‌گیرد، نسخه متن‌باز Semgrep OSS به صورت پیش‌فرض فاقد ردیابی جریان آلودگی بین‌فایلی (Inter-file) است و تحلیل آن عمدتاً درون‌رویه‌ای (Intra-procedural) می‌باشد. نسخه تجاری (Semgrep Pro) این شکاف را با افزودن تحلیل بین‌فایلی پر می‌کند که در محیط آنلاین **Semgrep Playground** (\`https://semgrep.dev/playground\`) با فعال‌سازی دکمه Pro قابل آزمودن است.
- **سرعت بی‌رقیب:** از آنجا که Semgrep نیازی به بیلد پروژه یا ساخت دیتابیس ندارد، اجرای آن در کسری از ثانیه روی هزاران مخزن امکان‌پذیر است و بازخورد سریعی ارائه می‌دهد. این ویژگی به ویژه زمانی ارزشمند است که به دنبال یک الگوی نادر امنیتی در میان انبوهی از پروژه‌ها (مانند تحلیل اکستنشن‌های مرورگرها) باشید. با دستور \`pip install semgrep\` می‌توانید آن را سریعاً نصب کنید.

---

### تحلیل واریانت (Variant Analysis)

کشف آسیب‌پذیری‌های امنیتی در نرم‌افزارهای پیچیده روز به روز دشوارتر می‌شود. نرم‌افزارهای عظیمی چون LibreOffice دارای میلیون‌ها سطر کد هستند و بررسی تصادفی آن‌ها غیرممکن است. خوشبختانه نیازی نیست همیشه از صفر شروع کنید: در نرم‌افزارهای متن‌باز دو منبع اطلاعاتی بی‌نظیر وجود دارد: **تغییرات کد ناشی از وصله (Patch Diff)** و **اعلامیه‌های عمومی آسیب‌پذیری (CVE Advisories)**.

تحلیل واریانت حول سه محور اصلی شکل می‌گیرد:
۱. **واریانت‌ها (Variants):** الگوی کدی که مسبب آسیب‌پذیری اصلی بوده است، معمولاً به دلیل عادات کدنویسی یکسان برنامه‌نویسان در نقاط دیگری از پروژه نیز تکرار شده است.
۲. **وصله‌های ناکافی (Insufficient Patches):** در مواردی وصله ارائه‌شده علت ریشه‌ای را کاملاً برطرف نمی‌کند و راه‌های دوری (Bypass) برای نفوذ باقی می‌گذارد.
۳. **بازگشت آسیب‌پذیری (Regression):** با تغییرات کدهای آینده و نبود آزمون‌های رگرسیون، کدهای ایمن بازنویسی شده و باگ‌های گذشته مجدداً زنده می‌شوند.

با یک تحلیل علت ریشه‌ای دقیق، می‌توانید یک آسیب‌پذیری گزارش‌شده را به چندین آسیب‌پذیری صفر-روز یا یک-روز جدید تبدیل نمایید.

---

### مطالعه موردی: کتابخانه Expat XML و کشف آسیب‌پذیری‌های سرریز عدد صحیح

کتابخانه **Expat** یکی از بنیادین‌ترین و پرکاربردترین کتابخانه‌های زبان C برای پردازش فایل‌های XML در دنیای فناوری است که در هسته نرم‌افزارهایی نظیر مرورگر فایرفاکس و مفسر رسمی پایتون به کار رفته است. با مرور سوابق امنیتی Expat متوجه خواهید شد که این کتابخانه دستخوش زنجیره‌ای از آسیب‌پذیری‌های سرریز عدد صحیح بوده است؛ از جمله شناسه **CVE-2021-46143** و متعاقب آن مجموعه‌ای از واریانت‌ها شامل **CVE-2022-22822 تا CVE-2022-22827** (مرتبط با پول‌ریکوئست‌های شماره ۵۳۴ و ۵۳۸ و سپس ۵۳۹).

#### ۱. تحلیل علت ریشه‌ای (Root Cause Analysis: CVE-2021-46143)

برای درک نقص، درخواست ادغام (Pull Request 538) مربوط به شناسه CVE-2021-46143 در مخزن گیت‌هاب پروژه را بررسی می‌کنیم. عنوان این درخواست چنین است:  
*«[CVE-2021-46143] lib: Prevent integer overflow on m_groupSize in function doProlog»*

توضیحات لاگ تغییرات اعلام می‌کند:
\`\`\`c
+ #532 #538 CVE-2021-46143 (ZDI-CAN-16157) -- Fix integer overflow
+ on variable m_groupSize in function doProlog leading
+ to realloc acting as free.
+ Impact is denial of service or more.
\`\`\`

نکته‌ای کلیدی در اینجا نهفته است: **«سرریز عدد صحیح باعث می‌شود realloc رفتاری مشابه با تابع free از خود نشان دهد!»**  
تابع استاندارد \`realloc(ptr, size)\` وظیفه تغییر اندازه بافر تخصیص‌یافته در حافظه را دارد. اما بر اساس استاندارد زبان C، چنانچه پارامتر \`size\` برابر با عدد صفر (\`0\`) باشد، این تابع بافر را به کلی آزاد (Free) می‌کند!

بیایید دیف وصله اعمال‌شده در فایل \`expat/lib/xmlparse.c\` را بررسی کنیم:

\`\`\`c
@@ -5019,6 +5046,11 @@ doProlog
 if (parser->m_prologState.level >= parser->m_groupSize) {
   if (parser->m_groupSize) {
     {
+      /* Detect and prevent integer overflow */
+❶     if (parser->m_groupSize > (unsigned int)(-1) / 2u) {
+        return XML_ERROR_NO_MEMORY;
+      }
+
       char *const new_connector = (char *)REALLOC(
         parser, parser->m_groupConnector, parser->m_groupSize *= 2);
       if (new_connector == NULL) {
@@ -5029,6 +5061,16 @@ doProlog
       }
       if (dtd->scaffIndex) {
+      /* Detect and prevent integer overflow.
+       * The preprocessor guard addresses the "always false" warning
+       * from -Wtype-limits on platforms where
+       * sizeof(unsigned int) < sizeof(size_t), e.g. on x86_64. */
+#if UINT_MAX >= SIZE_MAX
+❷     if (parser->m_groupSize > (size_t)(-1) / sizeof(int)) {
+        return XML_ERROR_NO_MEMORY;
+      }
+#endif
+
       int *const new_scaff_index = (int *)REALLOC(
         parser, dtd->scaffIndex, parser->m_groupSize * sizeof(int));
       if (new_scaff_index == NULL)
\`\`\`

این تغییرات دقیقاً نشان می‌دهند که توسعه‌دهنده دو شرط اعتبارسنجی را به کد افزوده است تا اطمینان حاصل کند که متغیر \`m_groupSize\` از مقادیر \`(unsigned int)(-1) / 2u\` ❶ و \`(size_t)(-1) / sizeof(int)\` ❷ فراتر نمی‌رود؛ این مقادیر دقیقاً همان ضریب‌هایی هستند که متغیر قبل از ارسال به ماکروی \`REALLOC\` در آنها ضرب می‌شود.

با جستجوی ماکروی \`REALLOC\` در کد:
\`\`\`c
#define REALLOC(parser, p, s) (parser->m_mem.realloc_fcn((p), (s)))
\`\`\`

برای اطمینان از اینکه آیا \`realloc_fcn\` واقعاً همان تابع استاندارد \`realloc\` است یا خیر، تابع \`parserCreate\` را در سورس کد بازبینی می‌کنیم:

\`\`\`c
parserCreate(const XML_Char *encodingName,
             const XML_Memory_Handling_Suite *memsuite,
             const XML_Char *nameSep, DTD *dtd) {
    XML_Parser parser;
    if (memsuite) { ❶
        XML_Memory_Handling_Suite *mtemp;
        parser = (XML_Parser)memsuite->malloc_fcn(sizeof(struct XML_ParserStruct));
        if (parser != NULL) {
            mtemp = (XML_Memory_Handling_Suite *)&(parser->m_mem);
            mtemp->malloc_fcn = memsuite->malloc_fcn;
            mtemp->realloc_fcn = memsuite->realloc_fcn;
            mtemp->free_fcn = memsuite->free_fcn;
        }
    } else {
        XML_Memory_Handling_Suite *mtemp;
        parser = (XML_Parser)malloc(sizeof(struct XML_ParserStruct));
        if (parser != NULL) {
            mtemp = (XML_Memory_Handling_Suite *)&(parser->m_mem);
            mtemp->malloc_fcn = malloc;
            mtemp->realloc_fcn = realloc; ❷
            mtemp->free_fcn = free;
        }
    }
}
\`\`\`

مگر در مواردی که یک سوئیت حافظه سفارشی به \`parserCreate\` تحویل داده شود ❶، متغیر \`realloc_fcn\` مستقیماً با تابع کتابخانه استاندارد \`realloc\` مقداردهی می‌شود ❷.

#### چگونه سرریز عدد صحیح رخ می‌دهد؟

کد آزمایشی کوچک زیر در C سازوکار این سرریز را نشان می‌دهد:

\`\`\`c
#include <stdio.h>
int main() {
    printf("SIZE_MAX: %zu\\n", ((size_t)(-1)));
    printf("no overflow: %zu\\n", ((size_t)(-1) / sizeof(int)) * sizeof(int));
    printf("overflow: %zu\\n", ((size_t)(-1) / sizeof(int) + 1) * sizeof(int));
    return 0;
}
\`\`\`

خروجی این برنامه در سیستم‌های ۶۴ بیتی به صورت زیر است:
\`\`\`text
SIZE_MAX: 18446744073709551615
no overflow: 18446744073709551612
overflow: 0
\`\`\`

اعداد صحیح بدون علامت (Unsigned Integers) دارای یک بیشینه گنجایش بیتی هستند. با کست کردن مقدار \`-1\` به یک عدد صحیح بدون علامت، تمامی بیت‌ها با مقدار باینری \`1\` پر می‌شوند (متمم دو). در محاسبات باینری، ضرب در ۲ معادل یک شیفت بیتی به چپ است. چنانچه عملیات ضرب از سقف بیت‌های اختصاص‌یافته فراتر رود، باارزش‌ترین بیت‌ها دور ریخته می‌شوند (Truncate). بدین ترتیب حاصل‌ضرب به مقدار \`0\` می‌چرخد و تابع \`realloc\` به جای افزایش فضای حافظه، بافر داده‌ها را آزاد می‌کند که منتهی به آسیب‌پذیری‌های استفاده پس از آزادسازی (Use-After-Free) یا تخریب حافظه می‌گردد.

#### تحلیل مسیر رسیدن به چاهک (Sink)

گزارش ZDI با شناسه ZDI-CAN-16157 نشان داد که تابع آسیب‌پذیر اصلی \`doProlog\` است:

\`\`\`c
doProlog(XML_Parser parser, const ENCODING *enc, const char *s, const char *end,
         int tok, const char *next, const char **nextPtr, XML_Bool haveMore,
         XML_Bool allowClosingDoctype, enum XML_Account account) {
#ifdef XML_DTD
    static const XML_Char externalSubsetName[] = {ASCII_HASH, '\\0'};
#endif /* XML_DTD */
    static const XML_Char atypeCDATA[]
    // --snip--
    case XML_ROLE_GROUP_OPEN:
        if (parser->m_prologState.level >= parser->m_groupSize) {
            if (parser->m_groupSize) {
                {
                    char *const new_connector = (char *)REALLOC(
                        parser, parser->m_groupConnector, parser->m_groupSize *= 2); // (1)
                    if (new_connector == NULL) {
                        parser->m_groupSize /= 2;
                        return XML_ERROR_NO_MEMORY;
                    }
                    parser->m_groupConnector = new_connector;
                }
            }
        }
}
\`\`\`

در نقطه (1)، چنانچه متغیر \`m_groupSize\` از \`0x7FFFFFFF\` فراتر رود، سرریز عدد صحیح رخ می‌دهد. مهاجم می‌تواند با تولید یک فایل XML دست‌کاری‌شده حدود ۲ گیگابایت حاوی تعداد زیادی تگ با نقش \`XML_ROLE_GROUP_OPEN\` کاری کند که متغیر \`m_groupSize\` در تابع \`doProlog\` از این سقف تجاوز کرده و سرریز رقم بخورد.

---

### تطبیق الگوهای واریانت با Semgrep (Variant Pattern Matching)

اکنون که علت ریشه‌ای را درک کردیم، سه شاخصه کلیدی پیش روی ماست:
۱. رخ دادن سرریز بر اثر ضرب یک متغیر از نوع عدد صحیح بدون علامت در یک مقدار ثابت.
۲. ارسال حاصل این ضرب به عنوان آرگومان سوم به ماکروی \`REALLOC\` که در صورت سرریز به صفر منجر به آزادسازی غیرعمدی بافر می‌شود.
۳. کنترل‌پذیر بودن متغیر اولیه از طریق داده‌های ورودی فایل XML (مانند \`parser->m_groupSize\`).

برای نگارش قانون Semgrep، رویکرد بهینه آن است که از یک تطبیق بسیار دقیق با کد اولیه شروع کرده و سپس آن را گام‌به‌گام تعمیم دهیم تا موارد کاذب کاهش یابد.

**گام ۱: قانون با تطبیق دقیق**
\`\`\`yaml
rules:
  - id: CVE-2021-46143
    pattern: REALLOC(parser, parser->m_groupConnector, parser->m_groupSize *= 2);
    message: "کشف واریانت بالقوه از CVE-2021-46143"
    languages: [c]
    severity: ERROR
\`\`\`

**گام ۲: تعمیم با عملگرهای Semgrep**  
برای شناسایی هرگونه ضرب مشابه در آرگومان سوم ماکروی \`REALLOC\`، قانون را در فایلی به نام \`cve-2021-46143-variant-1.yml\` به شکل زیر گسترش می‌دهیم:

\`\`\`yaml
rules:
  - id: CVE-2021-46143
    patterns:
      - pattern-either:
          - pattern: REALLOC(parser, $POINTER, $SIZE * $CONSTANT);
          - pattern: REALLOC(parser, $POINTER, $SIZE *= $CONSTANT);
    message: "کشف واریانت بالقوه سرریز در تخصیص مجدد حافظه"
    languages: [c]
    severity: ERROR
\`\`\`

اجرای این قانون روی کامیت آسیب‌پذیر Expat (\`0adcb34c\`):

\`\`\`bash
$ git clone https://github.com/libexpat/libexpat
$ cd libexpat
$ git checkout 0adcb34c
$ semgrep -f ../cve-2021-46143-variant-1.yml .
\`\`\`

خروجی شگفت‌انگیز است:

\`\`\`text
Scanning 18 files.
18/18 tasks 0:00:00
Results
Findings:
  expat/lib/xmlparse.c
    CVE-2021-46143
    Detected variant of CVE-2021-46143.
    3271 temp = (ATTRIBUTE *)REALLOC(parser, (void *)parser->m_atts,
    3272 parser->m_attsSize * sizeof(ATTRIBUTE));
    ----------------------------------------
    3279 temp2 = (XML_AttrInfo *)REALLOC(parser, (void *)parser->m_attInfo,
    3280 parser->m_attsSize * sizeof(XML_AttrInfo));
    ----------------------------------------
    5049 char *const new_connector = (char *)REALLOC(
    5050 parser, parser->m_groupConnector, parser->m_groupSize *= 2);
    ----------------------------------------
    5059 int *const new_scaff_index = (int *)REALLOC(
    5060 parser, dtd->scaffIndex, parser->m_groupSize * sizeof(int));
    ----------------------------------------
    6130 temp = (DEFAULT_ATTRIBUTE *)REALLOC(parser, type->defaultAtts,
    6131 (count * sizeof(DEFAULT_ATTRIBUTE)));
    ----------------------------------------
    7131 temp = (CONTENT_SCAFFOLD *)REALLOC(
    7132 parser, dtd->scaffold, dtd->scaffSize * 2 * sizeof(CONTENT_SCAFFOLD));

Scan Summary
Some files were skipped or only partially analyzed.
Scan was limited to files tracked by git.
Partially scanned: 1 files only partially analyzed due to a parsing or internal Semgrep error
Scan skipped: 6 files matching .semgrepignore patterns
For a full list of skipped files, run semgrep with the --verbose flag.
Ran 1 rule on 18 files: 6 findings.
\`\`\`

این قانون علاوه بر دو نقطه آسیب‌پذیر اولیه در تابع \`doProlog\`، **چهار واریانت بالقوه جدید** دیگر در سطرهای ۳۲۷۱، ۳۲۷۹، ۶۱۳۰ و ۷۱۳۱ را به دام می‌اندازد!

#### تحلیل عمیق واریانت کشف‌شده در سطر ۳۲۷۱ (تابع storeAtts)

کد سطر ۳۲۷۱ در تابع \`storeAtts\` قرار دارد:

\`\`\`c
/* پیش‌شرط: تمامی آرگومان‌ها نباید تهی باشند */
static enum XML_Error
storeAtts(XML_Parser parser, const ENCODING *enc, const char *attStr,
          TAG_NAME *tagNamePtr, BINDING **bindingsPtr,
          enum XML_Account account) {
    DTD *const dtd = parser->m_dtd;
    ELEMENT_TYPE *elementType;
    int nDefaultAtts;
    const XML_Char **appAtts;
    int attIndex = 0;
    int prefixLen;
    int i;
    int n;
    XML_Char *uri;
    int nPrefixes = 0;
    BINDING *binding;
    elementType = (ELEMENT_TYPE *)lookup(parser, &dtd->elementTypes, tagNamePtr->str, 0);
    // ...
❶   nDefaultAtts = elementType->nDefaultAtts;
    /* استخراج صفت‌ها از طریق توکنایزر */
❷   n = XmlGetAttributes(enc, attStr, parser->m_attsSize, parser->m_atts);
    if (n + nDefaultAtts > parser->m_attsSize) {
        int oldAttsSize = parser->m_attsSize;
        ATTRIBUTE *temp;
#ifdef XML_ATTR_INFO
        XML_AttrInfo *temp2;
#endif
❸       parser->m_attsSize = n + nDefaultAtts + INIT_ATTS_SIZE;
        temp = (ATTRIBUTE *)REALLOC(parser, (void *)parser->m_atts,
❹                                   parser->m_attsSize * sizeof(ATTRIBUTE));
\`\`\`

بررسی عمیق کد نشان می‌دهد:
- متغیر \`m_attsSize\` حاصل جمع مقادیر پیش‌فرض به علاوه \`n\` است ❸.
- متغیر \`n\` از فراخوانی ماکروی \`XmlGetAttributes\` حاصل می‌شود ❷:
\`\`\`c
#define XmlGetAttributes(enc, ptr, attsMax, atts) (((enc)->getAtts)(enc, ptr, attsMax, atts))
\`\`\`
در فایل \`xmltok_impl.c\` پیاده‌سازی این تابع چنین است:
\`\`\`c
case BT_QUOT:
  if (state != inValue) {
    if (nAtts < attsMax)
      atts[nAtts].valuePtr = ptr + MINBPC(enc);
    state = inValue;
    open = BT_QUOT;
  } else if (open == BT_QUOT) {
    state = other;
    if (nAtts < attsMax)
      atts[nAtts].valueEnd = ptr;
    nAtts++;
  }
  break;
\`\`\`
همان‌طور که مشاهده می‌کنید، اگرچه شرط \`nAtts < attsMax\` بررسی می‌شود، اما عبارت \`nAtts++;\` بیرون از بدنه شرط \`if\` قرار دارد و بدون توجه به سقف بافر مرتباً افزایش می‌یابد!
- در نتیجه، مقدار متغیر \`parser->m_attsSize\` کاملاً تحت کنترل مهاجم است و ضرب آن در \`sizeof(ATTRIBUTE)\` ❹ منجر به یک سرریز عدد صحیح واقعی در تخصیص مجدد حافظه می‌گردد.

توسعه‌دهندگان در به‌روزرسانی بعدی (Pull Request 539) این نقص را به عنوان **CVE-2022-22827** وصله کردند:

\`\`\`c
+/* Detect and prevent integer overflow */
+if ((nDefaultAtts > INT_MAX - INIT_ATTS_SIZE)
+ || (n > INT_MAX - (nDefaultAtts + INIT_ATTS_SIZE))) {
+ return XML_ERROR_NO_MEMORY;
+}
+
parser->m_attsSize = n + nDefaultAtts + INIT_ATTS_SIZE;
+
+/* Detect and prevent integer overflow.
+ * The preprocessor guard addresses the "always false" warning
+ * from -Wtype-limits on platforms where
+ * sizeof(unsigned int) < sizeof(size_t), e.g. on x86_64. */
+#if UINT_MAX >= SIZE_MAX
+if ((unsigned)parser->m_attsSize > (size_t)(-1) / sizeof(ATTRIBUTE)) {
+ parser->m_attsSize = oldAttsSize;
+ return XML_ERROR_NO_MEMORY;
+}
+#endif
\`\`\`

این موضوع ثابت می‌کند که قانون ساده ما توانسته است یک آسیب‌پذیری واقعی روز-صفر را مجدداً کشف کند! همچنین یافته‌های سطرهای ۶۱۳۰ و ۷۱۳۱ به ترتیب به عنوان آسیب‌پذیری‌های **CVE-2022-22824** (در تابع \`defineAttribute\`) و **CVE-2022-22826** (در تابع \`nextScaffoldPart\`) تایید شدند.

#### چرا برخی واریانت‌ها نادیده گرفته شدند؟

بررسی‌های تکمیلی نشان داد که رکوردهای **CVE-2022-22823** (در تابع \`build_model\`) و **CVE-2022-22825** (در تابع \`lookup\`) توسط این قانون شکار نشدند؛ زیرا در این دو تابع به جای \`REALLOC\` از تابع \`malloc\` استفاده شده بود. همچنین برای تابع \`addBinding\` (رکورد **CVE-2022-22822**) قطعه‌کد زیر وجود داشت:

\`\`\`c
XML_Char *temp = (XML_Char *)REALLOC(
  parser, b->uri, sizeof(XML_Char) * (len + EXPAND_SPARE));
\`\`\`

اگر این قطعه‌کد را در فایلی مستقل به نام \`false_negative.c\` قرار دهید، قانون Semgrep آن را پیدا می‌کند. علت عدم شناسایی آن در اسکن پروژه، همان پیام خطای \`Partially scanned: 1 files only partially analyzed due to a parsing or internal Semgrep error\` بود؛ بدین معنا که پارسر درونی Semgrep OSS در فایل بسیار حجیم \`xmlparse.c\` در آن سطر دچار خطای تجزیه شده بود.

با ابزار \`dump-ast\` در Semgrep می‌توان نحوه دیدن کد را بررسی کرد:

\`\`\`bash
$ semgrep --lang c --dump-ast false_negative.c
Call(
  N(
    Id(("REALLOC", ()),
    {id_info_id=3; id_hidden=false; id_resolved=Ref(
    None); id_type=Ref(None); id_svalue=Ref(
    None); })),
    [Arg(
    N(
    Id(("parser", ()),
    {id_info_id=4; id_hidden=false; id_resolved=Ref(
    None); id_type=Ref(None); id_svalue=Ref(
    None); })));
\`\`\`

همان‌طور که در خروجی مشاهده می‌شود، Semgrep تفاوتی میان ماکروها و توابع عادی قائل نمی‌شود و هر دو را به عنوان گره \`Call\` شناسایی می‌کند.

#### کشف الگوهای دو مرحله‌ای با اپراتور pattern-inside

گاهی اوقات متغیر ابتدا در یک سطر محاسبه شده و حاصل آن در سطر بعدی به \`REALLOC\` پاس داده می‌شود. برای شکار این الگو، قانون را با عملگر \`pattern-inside\` و متامتغیرهای نوع‌دار بسط می‌دهیم:

\`\`\`yaml
rules:
  - id: CVE-2021-46143-extended
    patterns:
❶     - pattern-either:
          - pattern-inside: |
❷             (int $SIZE) = $VARIABLE * $CONSTANT;
              ...
          - pattern-inside: |
              (int $SIZE) *= $CONSTANT;
              ...
          - pattern-inside: |
              (int $SIZE) = $VARIABLE + $CONSTANT;
              ...
          - pattern-inside: |
              (int $SIZE) += $CONSTANT;
              ...
❸     - pattern: REALLOC(parser, $POINTER, $SIZE);
    message: "کشف واریانت دومرحله‌ای از سرریز در REALLOC"
    languages: [c]
    severity: ERROR
\`\`\`

اجرای این قانون در مخزن، دو نتیجه جدید استخراج می‌کند:

\`\`\`text
Scanning 19 files.
19/19 tasks 0:00:00
Results
Findings:
  expat/lib/xmlparse.c
    CVE-2021-46143
    Detected variant of CVE-2021-46143.
    1938 temp = (char *)REALLOC(parser, parser->m_buffer, bytesToAllocate);
    ----------------------------------------
    2573 char *temp = (char *)REALLOC(parser, tag->buf, bufSize);

Ran 1 rule on 18 files: 2 findings.
\`\`\`

با تجزیه و تحلیل سطر ۱۹۳۸ مشخص می‌شود که متغیر \`bytesToAllocate\` دچار سرریز می‌شود؛ آسیبی که مدتی بعد رسماً به عنوان رکورد امنیتی **CVE-2022-25315** ثبت شد!

---

### تحلیل چندمخزنی واریانت‌ها (Multi-Repository Variant Analysis - MRVA)

هنگامی که تحلیل واریانت را در سطح یک پروژه انجام می‌دهید، دست شما برای نگارش قوانین دقیق باز است؛ زیرا سبک کدنویسی توسعه‌دهندگان آن پروژه الگوهای مشابهی دارد. اما در سطح هزاران مخزن متن‌باز مجزا، برنامه‌نویسان توابع تخصیص حافظه را به بی‌شمار روش، ماکرو و اشاره‌گر تابع مختلف پیاده‌سازی می‌کنند.

در این سناریو، تکیه بر تحلیل سراسری جریان داده و Taint Tracking در **CodeQL** بهترین گزینه برای به حداقل رساندن هشدارهای کاذب است. ما می‌توانیم کوئری‌های استاندارد CodeQL در مورد سرریزهای ریاضی در تخصیص حافظه (\`cpp/integer-overflow-tainted\` و \`cpp/uncontrolled-allocation-size\`) را تلخیص و ترکیب کنیم:

\`\`\`ql
/**
 * @id integer-overflow-allocation-size
 * @name Integer Overflow in Allocation Size
 * @description Potential integer overflow passed to allocation size.
 * @kind path-problem
 * @severity error
 */
import cpp
import semmle.code.cpp.rangeanalysis.SimpleRangeAnalysis
import semmle.code.cpp.dataflow.new.TaintTracking

module IntegerOverflowConfig implements DataFlow::ConfigSig {
  predicate isSource(DataFlow::Node source) {
    exists(Expr e | e = source.asExpr() |
      (
        e instanceof UnaryArithmeticOperation or
        e instanceof BinaryArithmeticOperation or
        e instanceof AssignArithmeticOperation
      ) and
      convertedExprMightOverflow(e)
    )
  }

  predicate isSink(DataFlow::Node sink) {
    exists(Expr e, HeuristicAllocationExpr alloc | e = sink.asConvertedExpr() |
      e = alloc.getAChild() and
      e.getUnspecifiedType() instanceof IntegralType and
      not e instanceof Conversion
    )
  }
}

module IntegerOverflowFlow =
  TaintTracking::Global<IntegerOverflowConfig>;
import IntegerOverflowFlow::PathGraph

from IntegerOverflowFlow::PathNode source,
     IntegerOverflowFlow::PathNode sink
where IntegerOverflowFlow::flowPath(source, sink)
select sink.getNode(), source, sink,
  "Potential integer overflow $@ passed to allocation size $@.",
  source.getNode(), "source",
  sink, "sink"
\`\`\`

برای اینکه این کوئری ماکروی اختصاصی \`REALLOC\` در Expat را نیز به عنوان چاهک به رسمیت بشناسد، می‌توان گزاره \`isSink\` را به این شکل شخصی‌سازی کرد:

\`\`\`ql
predicate isSink(DataFlow::Node sink) {
  exists(Expr e, ExprCall ec, MacroInvocation mi | e = sink.asExpr() |
    ec = mi.getExpr() and
    mi.getMacroName() = "REALLOC" and
    e = ec.getAnArgument() and
    e.getUnspecifiedType() instanceof IntegralType
  )
}
\`\`\`

#### اجرای در ابعاد کلان با GitHub MRVA

تیم امنیت گیت‌هاب قابلیت **Multi-Repository Variant Analysis (MRVA)** را عرضه کرده است. این سامانه با استفاده از زیرساخت‌های پردازش ابری GitHub Actions به شما اجازه می‌دهد کوئری‌های CodeQL خود را به طور همزمان بر روی **۱۰۰ الی ۱,۰۰۰ مخزن برتر جهان** اجرا کنید بدون آنکه نیاز باشد دیتابیس آنها را به صورت دستی روی رایانه محلی خود کامپایل نمایید!

استراتژی غربال‌گری نتایج در تحلیل کلان (MRVA Triage):
۱. حتی با اسکن ۱۰۰ پروژه، ممکن است ده‌ها هزار نتیجه دریافت کنید.
۲. مخازنی که دارای هزاران نتیجه هستند عموماً دارای الگوهایی با درصد خطای بالا (False Positive) می‌باشند.
۳. بررسی را با مخازنی آغاز کنید که تعداد یافته‌های آنها کمتر از ۱۰ مورد است؛ این به شما کمک می‌کند پالایشگرها (Sanitizers) و اعتبارسنجی‌های مرسوم را به کوئری خود بیفزایید.
۴. با بهبود دقت کوئری، دامنه اسکن را مجدداً به مخازن بزرگ‌تر تعمیم دهید تا آسیب‌پذیری‌های روز-صفر واقعی استخراج گردند.

---

### جمع‌بندی فصل

ابزارهای خودکار تحلیل کد شیوه‌ای مقیاس‌پذیر و فوق‌العاده مؤثر برای تحلیل میلیون‌ها سطر کد فراهم می‌کنند:
- سورس‌کد به مدل‌های ساختاری نظیر **درخت نحو انتزاعی (AST)** و **گراف جریان داده (DFG)** تبدیل می‌شود.
- **CodeQL** با تکیه بر پایگاه‌داده معنایی و ردیابی سراسری آلودگی (Global Taint Tracking)، عمق و دقتی بی‌بدیل ارائه می‌کند.
- **Semgrep** با تمرکز بر تطبیق الگو (Pattern Matching) و عدم نیاز به مراحل طولانی ساخت دیتابیس، سرعت چرخه توسعه و بازخورد را به اوج می‌رساند.
- تحلیل واریانت به شما می‌آموزد که یک نقص کشف‌شده، پایان راه نیست؛ بلکه آغازی است برای یافتن زنجیره‌ای از باگ‌های مشابه در سراسر پروژه و جهان متن‌باز.

تسلط بر تحلیل آسیب‌پذیری‌ها در سورس‌کد، شالوده‌ای استوار برای بخش بعدی کتاب فراهم می‌سازد:
**«بخش دوم: مهندسی معکوس (Reverse Engineering)»**؛ جایی که دیگر سورس‌کدی در کار نیست و پژوهشگر باید منطق نرم‌افزار را صرفاً از روی بایت‌های باینری کامپایل‌شده کشف کند.
بازبینی کد مانند خواندن نقشه‌ها و دیاگرام‌های فنی یک دستگاه پیچیده است؛ مهندسی معکوس مانند این است که دستگاه ساخته‌شده را بدون هیچ نقشه و راهنمایی تحویل بگیرید و با مشاهده و موشکافی کارکرد آن پی ببرید که چگونه کار می‌کند.`,
};
