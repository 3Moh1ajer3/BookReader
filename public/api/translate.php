<?php
/**
 * BookReader — Translation endpoint (PHP)
 * جایگزین فایل app/api/translate/route.ts در نسخه Next.js
 * روی هاست PHP آپلود شود: public_html/api/translate.php
 *
 * کلید Gemini را یکی از دو راه زیر تنظیم کنید:
 *   1) متغیر محیطی GEMINI_API_KEY در هاست
 *   2) مقدار GEMINI_API_KEY_FALLBACK در همین فایل
 */

header('Content-Type: application/json; charset=utf-8');

define('GEMINI_API_KEY_FALLBACK', ''); // در صورت نیاز کلید را اینجا قرار دهید

// ---------- دیکشنری آفلاین اصطلاحات فنی ----------
$TECHNICAL_DICTIONARY = [
    'closure' => [
        'persian' => 'کلوژر (بستار)',
        'explanation' => 'تابعی که به متغیرهای حوزه والد خود دسترسی دارد حتی بعد از پایان اجرای تابع والد.',
        'partOfSpeech' => 'اصطلاح برنامه‌نویسی',
        'phonetic' => '/ˈkloʊ.ʒɚ/',
        'exampleEn' => "Closures give you access to an outer function's scope from an inner function.",
        'exampleFa' => 'کلوژرها به شما امکان دسترسی به حوزه یک تابع بیرونی را از داخل تابع درونی می‌دهند.',
    ],
    'callback' => [
        'persian' => 'کال‌بک (تابع فراخوان بازگشتی)',
        'explanation' => 'تابعی که به عنوان آرگومان به تابع دیگری پاس داده می‌شود تا پس از اتمام کاری اجرا گردد.',
        'partOfSpeech' => 'اصطلاح برنامه‌نویسی',
        'phonetic' => '/ˈkɑːl.bæk/',
        'exampleEn' => 'Pass a callback function to handle the asynchronous response.',
        'exampleFa' => 'یک تابع کال‌بک ارسال کنید تا پاسخ ناهمگام را مدیریت کند.',
    ],
    'asynchronous' => [
        'persian' => 'ناهمگام (غیرهمزمان)',
        'explanation' => 'اجرای فرآیندی که بدون متوقف کردن بقیه برنامه در پس‌زمینه اجرا می‌شود.',
        'partOfSpeech' => 'صفت فنی',
        'phonetic' => '/eɪˈsɪŋ.krə.nəs/',
        'exampleEn' => 'JavaScript uses an asynchronous event loop to handle I/O operations.',
        'exampleFa' => 'جاوااسکریپت از یک حلقه رویداد ناهمگام برای مدیریت ورودی/خروجی استفاده می‌کند.',
    ],
    'async' => [
        'persian' => 'ناهمگام (کلمه کلیدی)',
        'explanation' => 'کلمه کلیدی در زبان‌های مدرن برای تعریف توابعی که Promise برمی‌گردانند.',
        'partOfSpeech' => 'کلمه کلیدی',
        'phonetic' => '/eɪˈsɪŋk/',
        'exampleEn' => 'An async function always returns a promise.',
        'exampleFa' => 'یک تابع async همواره یک promise بازمی‌گرداند.',
    ],
    'await' => [
        'persian' => 'انتظار (مکث برای پرامیس)',
        'explanation' => 'دستوری برای متوقف کردن موقت اجرای تابع async تا زمان حل شدن Promise.',
        'partOfSpeech' => 'کلمه کلیدی',
        'phonetic' => '/əˈweɪt/',
        'exampleEn' => 'Use await to pause execution until the promise resolves.',
        'exampleFa' => 'از await برای توقف موقت اجرا تا حل شدن promise استفاده کنید.',
    ],
    'promise' => [
        'persian' => 'پرامیس (وعده آینده)',
        'explanation' => 'شیئی که نمایانگر نتیجه احتمالی یک عملیات ناهمگام در آینده است.',
        'partOfSpeech' => 'اصطلاح برنامه‌نویسی',
        'phonetic' => '/ˈprɑː.mɪs/',
        'exampleEn' => 'A Promise can be pending, fulfilled, or rejected.',
        'exampleFa' => 'یک Promise می‌تواند در انتظار، انجام‌شده یا رد‌شده باشد.',
    ],
    'concurrency' => [
        'persian' => 'همزمانی (اجرای همروند)',
        'explanation' => 'توانایی سیستم برای پیش بردن چند وظیفه در بازه‌های زمانی متداخل.',
        'partOfSpeech' => 'مفهوم مهندسی نرم‌افزار',
        'phonetic' => '/kənˈkɝː.ən.si/',
        'exampleEn' => 'Node.js handles concurrency using a single-threaded event loop.',
        'exampleFa' => 'نود جی‌اس همزمانی را با استفاده از حلقه رویداد تک‌رشته‌ای مدیریت می‌کند.',
    ],
    'middleware' => [
        'persian' => 'میان‌افزار (میدل‌ور)',
        'explanation' => 'کدهایی که در میان راه ورود درخواست و تولید پاسخ نهایی اجرا می‌شوند.',
        'partOfSpeech' => 'الگوی معماری',
        'phonetic' => '/ˈmɪd.əl.wer/',
        'exampleEn' => 'The auth middleware verifies user sessions before granting access.',
        'exampleFa' => 'میان‌افزار احراز هویت، نشست‌های کاربری را پیش از اعطای دسترسی بررسی می‌کند.',
    ],
    'refactoring' => [
        'persian' => 'بازآفرینی کد (ریفرکتورینگ)',
        'explanation' => 'بهبود ساختار داخلی کد بدون تغییر در رفتار بیرونی آن.',
        'partOfSpeech' => 'فرایند مهندسی',
        'phonetic' => '/riːˈfæk.tɚ.ɪŋ/',
        'exampleEn' => 'Refactoring legacy code improves readability and maintainability.',
        'exampleFa' => 'بازآفرینی کدهای قدیمی خوانایی و قابلیت نگهداری را ارتقا می‌دهد.',
    ],
    'immutable' => [
        'persian' => 'تغییرناپذیر',
        'explanation' => 'داده‌ای که پس از ساخته شدن مقدارش قابل ویرایش نیست.',
        'partOfSpeech' => 'صفت فنی',
        'phonetic' => '/ɪˈmjuː.t̬ə.bəl/',
        'exampleEn' => 'Strings in JavaScript are immutable.',
        'exampleFa' => 'رشته‌ها در جاوااسکریپت تغییرناپذیر هستند.',
    ],
    'polymorphism' => [
        'persian' => 'چندریختی (پلی‌مورفیسم)',
        'explanation' => 'توانایی اشیاء مختلف برای ارائه پاسخ متناسب به یک پیام یا متد مشترک.',
        'partOfSpeech' => 'مفهوم شی‌گرایی',
        'phonetic' => '/ˌpɑː.liˈmɔːr.fɪ.zəm/',
        'exampleEn' => 'Polymorphism allows different classes to define their own implementations.',
        'exampleFa' => 'چندریختی به کلاس‌های مختلف اجازه می‌دهد پیاده‌سازی مخصوص خود را تعریف کنند.',
    ],
    'encapsulation' => [
        'persian' => 'کپسوله‌سازی',
        'explanation' => 'مخفی‌سازی جزئیات پیاده‌سازی و تجمیع داده‌ها با متدهای مربوطه‌شان.',
        'partOfSpeech' => 'مفهوم شی‌گرایی',
        'phonetic' => '/ɪnˌkæp.səˈleɪ.ʃən/',
        'exampleEn' => 'Encapsulation hides the internal representation of an object.',
        'exampleFa' => 'کپسوله‌سازی نمایش داخلی یک شیء را پنهان می‌سازد.',
    ],
    'idempotent' => [
        'persian' => 'هم‌توان (تکرارپذیر بدون عوارض جانبی)',
        'explanation' => 'عملیاتی که تکرار چندباره آن نتیجه‌ای یکسان با یک بار اجرای آن ایجاد می‌کند.',
        'partOfSpeech' => 'مفهوم شبکه و API',
        'phonetic' => '/ˌaɪ.dəmˈpoʊ.tənt/',
        'exampleEn' => 'HTTP GET and PUT requests are designed to be idempotent.',
        'exampleFa' => 'درخواست‌های HTTP GET و PUT طوری طراحی شده‌اند که هم‌توان باشند.',
    ],
    'vulnerability' => [
        'persian' => 'آسیب‌پذیری (نقص امنیتی)',
        'explanation' => 'ضعف یا نقص در طراحی، پیاده‌سازی یا پیکربندی سامانه که به مهاجم اجازه نفوذ یا سوءاستفاده می‌دهد.',
        'partOfSpeech' => 'مفهوم امنیت سایبری',
        'phonetic' => '/ˌvʌl.nɚ.əˈbɪl.ə.t̬i/',
        'exampleEn' => 'A buffer overflow is a classic software vulnerability.',
        'exampleFa' => 'سرریز بافر یک آسیب‌پذیری نرم‌افزاری کلاسیک است.',
    ],
    'vulnerabilities' => [
        'persian' => 'آسیب‌پذیری‌ها',
        'explanation' => 'نواقص و حفره‌های امنیتی در نرم‌افزار یا سخت‌افزار.',
        'partOfSpeech' => 'اسم جمع امنیتی',
        'phonetic' => '/ˌvʌl.nɚ.əˈbɪl.ə.t̬iz/',
        'exampleEn' => 'Researchers analyze code to discover unknown zero-day vulnerabilities.',
        'exampleFa' => 'پژوهشگران کد را برای کشف آسیب‌پذیری‌های ناشناخته روز صفر تحلیل می‌کنند.',
    ],
    'zeroday' => [
        'persian' => 'روز صفر (Zero-Day)',
        'explanation' => 'آسیب‌پذیری ناشناخته‌ای که توسعه‌دهنده از وجود آن مطلع نیست و هیچ وصله امنیتی برای آن منتشر نشده است.',
        'partOfSpeech' => 'اصطلاح تخصصی امنیت',
        'phonetic' => '/ˈzɪr.oʊ deɪ/',
        'exampleEn' => 'A zero-day exploit targets flaws before patches are available.',
        'exampleFa' => 'یک اکسپلویت روز صفر، نقایص را پیش از در دسترس بودن وصله‌ها هدف قرار می‌دهد.',
    ],
    'taintanalysis' => [
        'persian' => 'تحلیل آلودگی داده (Taint Analysis)',
        'explanation' => 'روشی در بازبینی کد برای ردیابی جریان داده‌های ورودی کاربر (منبع یا Source) تا رسیدن به توابع حساس (مقصد یا Sink).',
        'partOfSpeech' => 'تکنیک تحلیل کد',
        'phonetic' => '/teɪnt əˈnæl.ə.sɪs/',
        'exampleEn' => 'Taint analysis tracks untrusted input from sources to sinks.',
        'exampleFa' => 'تحلیل آلودگی، ورودی‌های غیرقابل‌اعتماد را از مبادی تا مقاصد حساس ردیابی می‌کند.',
    ],
    'fuzzing' => [
        'persian' => 'فازینگ (آزمون تصادفی نرم‌افزار)',
        'explanation' => 'تکنیک تست خودکار که مقادیر نامعتبر، غیرمنتظره یا تصادفی را به برنامه تزریق می‌کند تا کرش‌ها و نقایص حافظه کشف شوند.',
        'partOfSpeech' => 'تکنیک آزمون نفوذ',
        'phonetic' => '/ˈfʌz.ɪŋ/',
        'exampleEn' => 'Coverage-guided fuzzing with AFL++ uncovers deeply hidden memory bugs.',
        'exampleFa' => 'فازینگ هدایت‌شده با پوشش کد توسط AFL++ باگ‌های پنهان حافظه را فاش می‌سازد.',
    ],
    'bufferoverflow' => [
        'persian' => 'سرریز بافر (Buffer Overflow)',
        'explanation' => 'حالتی که برنامه داده‌ای بیشتر از ظرفیت تخصیص‌یافته به یک بافر حافظه را در آن می‌نویسد و داده‌های مجاور را بازنویسی می‌کند.',
        'partOfSpeech' => 'آسیب‌پذیری حافظه',
        'phonetic' => '/ˈbʌf.ɚ ˈoʊ.vɚ.floʊ/',
        'exampleEn' => 'A stack buffer overflow can overwrite return addresses.',
        'exampleFa' => 'سرریز بافر پشته می‌تواند آدرس‌های بازگشت را بازنویسی کند.',
    ],
    'sink' => [
        'persian' => 'مقصد حساس (Sink)',
        'explanation' => 'تابع یا دستوری که اگر ورودی تحت کنترل مهاجم به آن برسد، فاجعه امنیتی مانند اجرای دستور یا تخریب حافظه رخ می‌دهد (مانند memcpy یا system).',
        'partOfSpeech' => 'اصطلاح امنیتی',
        'phonetic' => '/sɪŋk/',
        'exampleEn' => 'Never pass unsanitized user input into a command execution sink.',
        'exampleFa' => 'هرگز ورودی پاکسازی‌نشده کاربر را به یک مقصد حساس اجرای دستور ارسال نکنید.',
    ],
    'source' => [
        'persian' => 'مبدأ ورودی (Source)',
        'explanation' => 'نقطه‌ای در برنامه که داده‌های بیرونی از کاربر یا شبکه دریافت می‌شوند (مانند آرگومان‌ها، کوئری‌ها یا توابع recv).',
        'partOfSpeech' => 'اصطلاح امنیتی',
        'phonetic' => '/sɔːrs/',
        'exampleEn' => 'Identify attacker-controlled sources before analyzing data flows.',
        'exampleFa' => 'پیش از تحلیل جریان داده‌ها، مبادی تحت کنترل مهاجم را شناسایی کنید.',
    ],
    'harness' => [
        'persian' => 'مهار / تست‌کننده فازینگ (Fuzzing Harness)',
        'explanation' => 'کد یا برنامه واسط سبک که توابع مورد نظر کتابخانه را مستقیماً با ورودی‌های فازر صدا می‌زند تا سرعت تست صدها برابر شود.',
        'partOfSpeech' => 'ابزار مهندسی تست',
        'phonetic' => '/ˈhɑːr.nəs/',
        'exampleEn' => 'Writing an in-memory harness allows thousands of executions per second.',
        'exampleFa' => 'نوشتن یک مهار در حافظه امکان اجرای هزاران تست در هر ثانیه را فراهم می‌کند.',
    ],
    'stackcanary' => [
        'persian' => 'کاناری پشته (Stack Canary)',
        'explanation' => 'یک مقدار تصادفی که در ورودی تابع در پشته قرار می‌گیرد تا تغییرات غیرمجاز ناشی از سرریز بافر را تشخیص داده و برنامه را قبل از سوءاستفاده متوقف کند.',
        'partOfSpeech' => 'سازوکار حفاظتی',
        'phonetic' => '/stæk kəˈner.i/',
        'exampleEn' => 'The stack canary detects buffer overflows and aborts execution.',
        'exampleFa' => 'کاناری پشته سرریزهای بافر را شناسایی کرده و اجرای برنامه را متوقف می‌سازد.',
    ],
    'reverseengineering' => [
        'persian' => 'مهندسی معکوس',
        'explanation' => 'فرآیند کالبدشکافی یک فایل باینری کامپایل‌شده برای پی بردن به ساختار داخلی، الگوریتم‌ها و نحوه کارکرد آن بدون دسترسی به سورس‌کد اصلی.',
        'partOfSpeech' => 'حوزه تخصصی نرم‌افزار',
        'phonetic' => '/rɪˈvɝːs ˌen.dʒɪˈnɪr.ɪŋ/',
        'exampleEn' => 'Reverse engineering binaries helps discover hidden vulnerabilities.',
        'exampleFa' => 'مهندسی معکوس باینری‌ها به کشف آسیب‌پذیری‌های پنهان کمک می‌کند.',
    ],
];

function respond(array $data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function dictionaryResponse(string $cleanText, array $m): array {
    return [
        'text' => $cleanText,
        'persianTranslation' => $m['persian'],
        'phonetic' => $m['phonetic'] ?? '',
        'partOfSpeech' => $m['partOfSpeech'] ?? '',
        'explanation' => $m['explanation'] ?? '',
        'examples' => isset($m['exampleEn']) ? [
            ['english' => $m['exampleEn'], 'persian' => $m['exampleFa'] ?? ''],
        ] : [],
        'synonyms' => [],
        'engine' => 'technical_dictionary',
    ];
}

/**
 * استخراج ترجمه، تلفظ و معانی دیکشنری از Google Translate (سریع، بدون نیاز به کلید)
 */
function translateWithGoogle(string $text): ?array {
    $encoded = urlencode($text);
    $url = "https://translate.googleapis.com/translate_a/single?client=dict-chrome-ex&sl=auto&tl=fa&dt=t&dt=bd&dt=rm&q={$encoded}";

    $response = null;
    $userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

    if (function_exists('curl_init')) {
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT => 6,
            CURLOPT_CONNECTTIMEOUT => 3,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
            CURLOPT_USERAGENT => $userAgent,
        ]);
        $response = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($code < 200 || $code >= 300) {
            $response = null;
        }
    }

    if ($response === null || $response === false) {
        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'header' => "User-Agent: {$userAgent}\r\n",
                'timeout' => 6,
            ],
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
            ],
        ]);
        $response = @file_get_contents($url, false, $context);
    }

    if (!$response) return null;
    $data = json_decode($response, true);
    if (!is_array($data)) return null;

    // 1. Translated text
    $translatedText = '';
    if (isset($data[0]) && is_array($data[0])) {
        foreach ($data[0] as $part) {
            if (isset($part[0]) && is_string($part[0])) {
                $translatedText .= $part[0];
            }
        }
    }
    if ($translatedText === '') return null;

    // 2. Phonetic / Transliteration
    $phonetic = '';
    if (isset($data[0]) && is_array($data[0])) {
        $last = end($data[0]);
        if (isset($last[3]) && is_string($last[3])) {
            $phonetic = $last[3];
        } elseif (isset($last[2]) && is_string($last[2])) {
            $phonetic = $last[2];
        }
    }

    // 3. Dictionary: parts of speech and synonyms
    $posMap = [
        'noun' => 'اسم (Noun)',
        'verb' => 'فعل (Verb)',
        'adjective' => 'صفت (Adjective)',
        'adverb' => 'قید (Adverb)',
        'preposition' => 'حرف اضافه',
        'conjunction' => 'حرف ربط',
        'pronoun' => 'ضمیر',
        'phrase' => 'اصطلاح / عبارت',
        'interjection' => 'صوت',
    ];

    $posList = [];
    $synonyms = [];
    if (isset($data[1]) && is_array($data[1])) {
        foreach ($data[1] as $entry) {
            $enPos = strtolower($entry[0] ?? '');
            if (isset($posMap[$enPos])) {
                $posList[] = $posMap[$enPos];
            } elseif ($enPos !== '') {
                $posList[] = $enPos;
            }
            if (isset($entry[1]) && is_array($entry[1])) {
                foreach ($entry[1] as $m) {
                    if (is_string($m) && !in_array($m, $synonyms, true)) {
                        $synonyms[] = $m;
                    }
                }
            }
        }
    }

    $partOfSpeech = !empty($posList) ? implode('، ', array_slice($posList, 0, 2)) : '';
    $explanation = !empty($synonyms)
        ? 'سایر معانی در دیکشنری: ' . implode('، ', array_slice($synonyms, 0, 5))
        : 'ترجمه مستقیم Google Translate';

    return [
        'text' => $text,
        'persianTranslation' => $translatedText,
        'phonetic' => $phonetic,
        'partOfSpeech' => $partOfSpeech,
        'explanation' => $explanation,
        'examples' => [],
        'synonyms' => array_slice($synonyms, 0, 8),
        'engine' => 'google_translate',
    ];
}

function callGemini(string $apiKey, string $model, array $payload): ?array {
    $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key=" . urlencode($apiKey);
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
        CURLOPT_TIMEOUT => 30,
    ]);
    $body = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);

    if ($body === false || $err !== '') {
        error_log("Gemini cURL error ({$model}): {$err}");
        return null;
    }
    if ($code < 200 || $code >= 300) {
        error_log("Gemini HTTP {$code} ({$model}): " . substr((string)$body, 0, 500));
        return ['__http_error__' => $code];
    }
    $decoded = json_decode((string)$body, true);
    $text = $decoded['candidates'][0]['content']['parts'][0]['text'] ?? null;
    if (!is_string($text)) return null;
    $parsed = json_decode($text, true);
    return is_array($parsed) ? $parsed : null;
}

// ---------- ورودی ----------
try {
    $raw = file_get_contents('php://input');
    $input = json_decode((string)$raw, true);
    $text = isset($input['text']) && is_string($input['text']) ? trim($input['text']) : '';
    $context = isset($input['context']) && is_string($input['context']) ? $input['context'] : '';

    if ($text === '') {
        respond(['error' => 'متنی برای ترجمه ارسال نشده است.'], 400);
    }

    $cleanText = $text;
    $normalizedKey = strtolower(preg_replace('/[^a-z0-9]/i', '', $cleanText));
    $isSingleWord = count(preg_split('/\s+/u', $cleanText, -1, PREG_SPLIT_NO_EMPTY)) <= 2;
    $localMatch = $TECHNICAL_DICTIONARY[$normalizedKey] ?? null;

    // ۱. اگر کلمه یک اصطلاح تخصصی برنامه‌نویسی/امنیت باشد، از دیکشنری تخصصی با توضیح دقیق استفاده شود
    if ($localMatch && $isSingleWord) {
        $dictRes = dictionaryResponse($cleanText, $localMatch);
        // غنی‌سازی با معانی دیگر و تلفظ از گوگل ترنسلیت در صورت امکان
        $gRes = translateWithGoogle($cleanText);
        if ($gRes) {
            if (empty($dictRes['phonetic']) && !empty($gRes['phonetic'])) {
                $dictRes['phonetic'] = $gRes['phonetic'];
            }
            if (!empty($gRes['synonyms'])) {
                $dictRes['synonyms'] = array_slice($gRes['synonyms'], 0, 6);
            }
        }
        respond($dictRes);
    }

    // ۲. ترجمه سریع و دقیق با Google Translate (بدون نیاز به کلید، فوق‌العاده سریع و طبیعی)
    $googleRes = translateWithGoogle($cleanText);
    if ($googleRes !== null && !empty($googleRes['persianTranslation'])) {
        if ($localMatch) {
            $googleRes['explanation'] = $localMatch['explanation'] . ($googleRes['explanation'] ? ' — ' . $googleRes['explanation'] : '');
        }
        respond($googleRes);
    }

    // ۳. پشتیبانی اختیاری از Gemini AI در صورت تنظیم کلید و در دسترس بودن
    $apiKey = getenv('GEMINI_API_KEY');
    if ($apiKey === false || $apiKey === '') $apiKey = GEMINI_API_KEY_FALLBACK;

    if ($apiKey !== '') {
        $systemInstruction = 'You are a professional bilingual reading assistant and translator specializing in English to Persian translations. Provide clear, natural Persian translations.';
        $prompt = "Translate this English text to Persian:\n\"{$cleanText}\"";
        $schema = [
            'type' => 'OBJECT',
            'properties' => [
                'text' => ['type' => 'STRING'],
                'persianTranslation' => ['type' => 'STRING'],
                'phonetic' => ['type' => 'STRING'],
                'partOfSpeech' => ['type' => 'STRING'],
                'explanation' => ['type' => 'STRING'],
                'synonyms' => ['type' => 'ARRAY', 'items' => ['type' => 'STRING']],
            ],
            'required' => ['text', 'persianTranslation'],
        ];

        $models = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
        $payload = [
            'contents' => [['parts' => [['text' => $prompt]]]],
            'systemInstruction' => ['parts' => [['text' => $systemInstruction]]],
            'generationConfig' => [
                'responseMimeType' => 'application/json',
                'responseSchema' => $schema,
            ],
        ];

        foreach ($models as $model) {
            $result = callGemini($apiKey, $model, $payload);
            if (is_array($result) && !isset($result['__http_error__'])) {
                $result['engine'] = 'gemini';
                respond($result);
            }
        }
    }

    // ۴. دیکشنری فنی یا فال‌بک نهایی
    if ($localMatch) {
        respond(dictionaryResponse($cleanText, $localMatch));
    }

    respond([
        'text' => $cleanText,
        'persianTranslation' => "ترجمه «{$cleanText}»",
        'explanation' => 'ارتباط با سرویس ترجمه برقرار نشد. لطفاً اینترنت سرور را بررسی فرمایید.',
        'examples' => [],
        'synonyms' => [],
        'engine' => 'fallback',
    ]);
} catch (Throwable $e) {
    respond([
        'persianTranslation' => 'خطا در پردازش درخواست',
        'explanation' => $e->getMessage(),
        'examples' => [],
        'synonyms' => [],
    ]);
}
