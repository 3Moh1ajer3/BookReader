<?php
/**
 * Roham Smart AI Auto-Publisher & Media Pipeline (cPanel PHP + MySQL)
 * مسیر: /api/auto-publisher.php
 *
 * معماری دو-مدله (Dual-Model AI Pipeline):
 *  1) ورودی لینک (URL) -> دریافت HTML و حذف هدر، فوتر، منوها، اسکریپت‌ها و تبلیغات
 *     ورودی فایل مارک‌داون (.md) -> بدون ارسال درخواست به سایت مبدأ، پردازش مستقیم متن Markdown
 *  2) مدل سبک (Light Model) -> پالایش محتوای اصلی، استخراج کدها، جداول و لیست تصاویر معتبر
 *  3) دانلودر خودکار رسانه -> دانلود تمام تصاویر مقاله و ذخیره امن در پوشه /uploads/media/YYYY-MM/
 *  4) مدل قوی (Strong Model) -> ترجمه تخصصی امنیت سایبری و تبدیل به ساختار استاندارد NewsArticle یا BlogPost
 */

require_once __DIR__ . '/db.php';

$db = roham_load_db();
$input = roham_get_input();
$action = $_GET['action'] ?? ($input['action'] ?? 'get_config');

// احراز هویت مدیر برای تمامی عملیات پست‌گذار هوشمند
$auth = roham_require_auth($db);
$currentUser = $auth['user'];
if (($currentUser['role'] ?? 'user') !== 'admin') {
    roham_respond(['ok' => false, 'error' => 'دسترسی غیرمجاز: فقط مدیران ارشد مجاز به استفاده از پست‌گذار هوشمند هستند.'], 403);
}

/**
 * تنظیمات پیش‌فرض دو مدل هوش مصنوعی (سبک و قوی)
 */
function roham_default_ai_pipeline_config(): array {
    return [
        'lightModel' => [
            'provider' => 'google_gemini', // google_gemini | openai_compatible
            'baseUrl' => 'https://generativelanguage.googleapis.com/v1beta',
            'modelName' => 'gemini-3-flash-preview',
            'envKeyName' => 'GEMINI_API_KEY',
            'temperature' => 0.1,
            'maxTokens' => 4096,
            'roleDescription' => 'پالایشگر سریع DOM، حذف هدر/فوتر و استخراج‌کننده ساختار خام و لینک تصاویر',
        ],
        'strongModel' => [
            'provider' => 'google_gemini', // google_gemini | openai_compatible
            'baseUrl' => 'https://generativelanguage.googleapis.com/v1beta',
            'modelName' => 'gemini-3.1-pro-preview',
            'envKeyName' => 'GEMINI_API_KEY',
            'temperature' => 0.3,
            'maxTokens' => 8192,
            'roleDescription' => 'مترجم تخصصی امنیت سایبری، تحلیلگر CVE/IoC و معمار ساختار استاندارد خبر و وبلاگ',
            'customInstructions' => 'ترجمه باید کاملاً روان، تخصصی و وفادار به ادبیات فنی امنیت سایبری (حفظ اصطلاحات کلیدی مانند Zero-Day, RCE, DPAPI, C2 در کنار معادل فارسی) باشد.',
        ],
        'mediaConfig' => [
            'uploadFolder' => 'uploads/media',
            'downloadImages' => true,
            'maxImagesPerPost' => 10,
            'organizeByMonth' => true,
        ],
        'updatedAt' => gmdate('c'),
    ];
}

/**
 * خواندن کانفیگ پایپ‌لاین از جدول roham_settings در MySQL
 */
function roham_get_ai_pipeline_config(): array {
    $defaults = roham_default_ai_pipeline_config();
    $driver = null;
    $pdo = roham_get_pdo($driver);

    if ($pdo !== null) {
        try {
            $stmt = $pdo->prepare("SELECT v FROM roham_settings WHERE k = 'ai_pipeline_config' LIMIT 1");
            $stmt->execute();
            $row = $stmt->fetch();
            if ($row && !empty($row['v'])) {
                $decoded = json_decode($row['v'], true);
                if (is_array($decoded)) {
                    return array_replace_recursive($defaults, $decoded);
                }
            }
        } catch (Throwable $e) {
            error_log('Roham AI config load error: ' . $e->getMessage());
        }
    }
    return $defaults;
}

/**
 * ذخیره کانفیگ پایپ‌لاین در جدول roham_settings در MySQL
 */
function roham_save_ai_pipeline_config(array $config): bool {
    $driver = null;
    $pdo = roham_get_pdo($driver);
    if ($pdo === null) return false;

    try {
        $json = json_encode($config, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if ($driver === 'mysql') {
            $stmt = $pdo->prepare("
                INSERT INTO roham_settings (k, v) VALUES ('ai_pipeline_config', :v)
                ON DUPLICATE KEY UPDATE v = VALUES(v)
            ");
        } else {
            $stmt = $pdo->prepare("
                INSERT OR REPLACE INTO roham_settings (k, v) VALUES ('ai_pipeline_config', :v)
            ");
        }
        return $stmt->execute([':v' => $json]);
    } catch (Throwable $e) {
        error_log('Roham AI config save error: ' . $e->getMessage());
        return false;
    }
}

/**
 * دریافت کلید API از متغیر محیطی سرور بر اساس نام متغیر تنظیم‌شده
 */
function roham_resolve_server_api_key(string $envKeyName, array $db): string {
    $cleanName = preg_replace('/[^A-Z0-9_]/i', '', $envKeyName);
    if ($cleanName !== '') {
        $val = getenv($cleanName);
        if (is_string($val) && trim($val) !== '') {
            return trim($val);
        }
        if (isset($_ENV[$cleanName]) && trim((string)$_ENV[$cleanName]) !== '') {
            return trim((string)$_ENV[$cleanName]);
        }
    }
    $fallbackEnv = getenv('GEMINI_API_KEY') ?: getenv('OPENAI_API_KEY') ?: '';
    if (is_string($fallbackEnv) && trim($fallbackEnv) !== '') {
        return trim($fallbackEnv);
    }
    return trim((string)($db['settings']['geminiApiKey'] ?? ''));
}

/**
 * دریافت محتوای HTML یک آدرس اینترنتی با cURL بهینه‌شده برای IPv4 و سرورهای هاست
 */
function roham_fetch_and_clean_url(string $url, ?string $proxy = null): array {
    $parsedUrl = parse_url($url);
    if (!$parsedUrl || empty($parsedUrl['scheme']) || empty($parsedUrl['host'])) {
        return ['ok' => false, 'error' => 'آدرس اینترنتی (URL) وارد شده معتبر نیست.'];
    }
    $scheme = strtolower($parsedUrl['scheme']);
    if (!in_array($scheme, ['http', 'https'], true)) {
        return ['ok' => false, 'error' => 'فقط پروتکل‌های HTTP و HTTPS مجاز هستند.'];
    }

    $baseOrigin = $scheme . '://' . $parsedUrl['host'] . (isset($parsedUrl['port']) ? ':' . $parsedUrl['port'] : '');
    $html = null;
    $httpCode = 0;
    $curlErrNo = 0;
    $curlError = '';
    $totalTime = 0.0;

    if (function_exists('curl_init')) {
        $ch = curl_init();
        $options = [
            CURLOPT_URL            => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS      => 5,
            CURLOPT_TIMEOUT        => 30,
            CURLOPT_CONNECTTIMEOUT => 15,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,

            // ۱. حل مشکل اصلی: اجبار cURL به استفاده از IPv4 (از اتلاف وقت و تایم‌اوت IPv6 جلوگیری می‌کند)
            CURLOPT_IPRESOLVE      => CURL_IPRESOLVE_V4,

            // ذخیره موقت کش DNS برای سرعت بالاتر
            CURLOPT_DNS_CACHE_TIMEOUT => 3600,

            CURLOPT_USERAGENT      => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            CURLOPT_HTTPHEADER     => [
                'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language: en-US,en;q=0.9,fa;q=0.8',
            ],
        ];

        // پراکسی اختیاری (در صورت نیاز به عبور از فیلترینگ یا محدودیت)
        $proxyToUse = $proxy ?: getenv('HTTP_PROXY') ?: getenv('CURL_PROXY') ?: null;
        if ($proxyToUse && trim($proxyToUse) !== '') {
            $options[CURLOPT_PROXY] = trim($proxyToUse);
        }

        curl_setopt_array($ch, $options);
        $html      = curl_exec($ch);
        $httpCode  = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlErrNo = (int)curl_errno($ch);
        $curlError = (string)curl_error($ch);
        $totalTime = (float)curl_getinfo($ch, CURLINFO_TOTAL_TIME);
        curl_close($ch);
    } else {
        $ctx = stream_context_create([
            'http' => [
                'method' => 'GET',
                'header' => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36\r\n",
                'timeout' => 20,
            ],
            'ssl' => ['verify_peer' => false, 'verify_peer_name' => false],
        ]);
        $html = @file_get_contents($url, false, $ctx);
        $httpCode = $html ? 200 : 0;
    }

    if ($curlErrNo !== 0) {
        return [
            'ok' => false,
            'error' => "خطای cURL شماره {$curlErrNo}: " . ($curlError ?: 'عدم برقراری ارتباط با سرور مقصد'),
            'curlErrNo' => $curlErrNo,
            'httpCode' => $httpCode,
            'totalTime' => round($totalTime, 2),
        ];
    }

    if ($httpCode >= 400 || empty($html) || !is_string($html)) {
        return [
            'ok' => false,
            'error' => "سایت مبدأ کد خطای {$httpCode} بازگرداند یا محتوا خالی بود.",
            'httpCode' => $httpCode,
            'totalTime' => round($totalTime, 2),
        ];
    }

    // استخراج متادیتای اولیه (عنوان، توضیحات، تصویر شاخص og:image)
    $pageTitle = '';
    if (preg_match('/<meta[^>]+property=["\']og:title["\'][^>]+content=["\']([^"\']+)["\']/i', $html, $m)) {
        $pageTitle = html_entity_decode(trim($m[1]), ENT_QUOTES | ENT_HTML5, 'UTF-8');
    } elseif (preg_match('/<title[^>]*>(.*?)<\/title>/is', $html, $m)) {
        $pageTitle = html_entity_decode(trim(strip_tags($m[1])), ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }

    $ogImage = '';
    if (preg_match('/<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']/i', $html, $m)) {
        $ogImage = roham_resolve_relative_url(trim($m[1]), $baseOrigin, $url);
    } elseif (preg_match('/<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']/i', $html, $m)) {
        $ogImage = roham_resolve_relative_url(trim($m[1]), $baseOrigin, $url);
    }

    // ۱. حذف کامل تگ‌های غیرمرتبط: اسکریپت، استایل، هدر، فوتر، منوی ناوبری، سایدبار، فرم‌ها و تبلیغات
    $cleanHtml = preg_replace([
        '/<script\b[^>]*>.*?<\/script>/is',
        '/<style\b[^>]*>.*?<\/style>/is',
        '/<noscript\b[^>]*>.*?<\/noscript>/is',
        '/<svg\b[^>]*>.*?<\/svg>/is',
        '/<header\b[^>]*>.*?<\/header>/is',
        '/<footer\b[^>]*>.*?<\/footer>/is',
        '/<nav\b[^>]*>.*?<\/nav>/is',
        '/<aside\b[^>]*>.*?<\/aside>/is',
        '/<form\b[^>]*>.*?<\/form>/is',
        '/<iframe\b[^>]*>.*?<\/iframe>/is',
        '/<!--.*?-->/s',
    ], '', $html);

    // ۲. تمرکز بر تگ <article> یا <main> در صورت وجود برای حذف بلوک‌های اطراف
    if (preg_match('/<article\b[^>]*>(.*?)<\/article>/is', $cleanHtml, $artMatch)) {
        $cleanHtml = $artMatch[1];
    } elseif (preg_match('/<main\b[^>]*>(.*?)<\/main>/is', $cleanHtml, $mainMatch)) {
        $cleanHtml = $mainMatch[1];
    }

    // ۳. استخراج تصاویر واقعی داخل بدنه اصلی مقاله (حذف آیکون‌ها، لوگوها، آواتارها و پیکسل‌های ردیابی)
    $images = [];
    if ($ogImage !== '') {
        $images[] = ['url' => $ogImage, 'alt' => $pageTitle ?: 'Cover Image'];
    }
    if (preg_match_all('/<img\b[^>]+>/i', $cleanHtml, $imgTags)) {
        foreach ($imgTags[0] as $imgTag) {
            $src = '';
            if (preg_match('/\b(?:data-src|data-lazy-src|data-original|src)=["\']([^"\']+)["\']/i', $imgTag, $srcM)) {
                $src = trim($srcM[1]);
            }
            if ($src === '' || strpos($src, 'data:image/') === 0) continue;
            $fullUrl = roham_resolve_relative_url($src, $baseOrigin, $url);
            $lowerUrl = strtolower($fullUrl);
            if (
                strpos($lowerUrl, 'avatar') !== false ||
                strpos($lowerUrl, 'logo') !== false ||
                strpos($lowerUrl, 'icon') !== false ||
                strpos($lowerUrl, 'pixel') !== false ||
                strpos($lowerUrl, 'doubleclick') !== false ||
                strpos($lowerUrl, '.svg') !== false ||
                strpos($lowerUrl, '1x1') !== false
            ) {
                continue;
            }
            $alt = '';
            if (preg_match('/\balt=["\']([^"\']*)["\']/i', $imgTag, $altM)) {
                $alt = html_entity_decode(trim($altM[1]), ENT_QUOTES | ENT_HTML5, 'UTF-8');
            }
            $exists = false;
            foreach ($images as $existing) {
                if ($existing['url'] === $fullUrl) {
                    $exists = true;
                    break;
                }
            }
            if (!$exists) {
                $images[] = ['url' => $fullUrl, 'alt' => $alt];
            }
        }
    }

    // ۴. تبدیل تگ‌های ساختاری HTML به Markdown خوانا برای تغذیه به مدل سبک
    $md = $cleanHtml;
    $md = preg_replace('/<h1[^>]*>(.*?)<\/h1>/is', "\n# $1\n", $md);
    $md = preg_replace('/<h2[^>]*>(.*?)<\/h2>/is', "\n## $1\n", $md);
    $md = preg_replace('/<h3[^>]*>(.*?)<\/h3>/is', "\n### $1\n", $md);
    $md = preg_replace('/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/is', "\n```\n$1\n```\n", $md);
    $md = preg_replace('/<pre[^>]*>(.*?)<\/pre>/is', "\n```\n$1\n```\n", $md);
    $md = preg_replace('/<li[^>]*>(.*?)<\/li>/is', "\n* $1", $md);
    $md = preg_replace('/<p[^>]*>(.*?)<\/p>/is', "\n$1\n", $md);
    $md = preg_replace('/<br\s*\/?>/i', "\n", $md);
    $md = strip_tags($md);
    $md = html_entity_decode($md, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $md = preg_replace("/\n{3,}/", "\n\n", trim($md));

    return [
        'ok' => true,
        'title' => $pageTitle,
        'sourceDomain' => $parsedUrl['host'],
        'extractedMarkdown' => mb_substr($md, 0, 28000, 'UTF-8'),
        'images' => array_slice($images, 0, 12),
    ];
}

/**
 * تبدیل آدرس‌های نسبی تصاویر به آدرس کامل اینترنتی
 */
function roham_resolve_relative_url(string $src, string $baseOrigin, string $pageUrl): string {
    if (preg_match('/^https?:\/\//i', $src)) {
        return $src;
    }
    if (strpos($src, '//') === 0) {
        return 'https:' . $src;
    }
    if (strpos($src, '/') === 0) {
        return rtrim($baseOrigin, '/') . $src;
    }
    $dir = preg_replace('/\/[^\/]*$/', '/', $pageUrl);
    return rtrim($dir, '/') . '/' . ltrim($src, './');
}

/**
 * استخراج لینک تصاویر از داخل فایل یا متن Markdown (.md)
 */
function roham_extract_markdown_images(string $mdText): array {
    $images = [];
    // سینتکس ![alt](url)
    if (preg_match_all('/!\[([^\]]*)\]\((https?:\/\/[^\s\)]+)\)/i', $mdText, $matches, PREG_SET_ORDER)) {
        foreach ($matches as $m) {
            $images[] = [
                'url' => trim($m[2]),
                'alt' => trim($m[1]) ?: 'Article Image',
            ];
        }
    }
    // سینتکس <img src="url"> داخل مارک‌داون
    if (preg_match_all('/<img\b[^>]+src=["\'](https?:\/\/[^"\']+)["\'][^>]*>/i', $mdText, $imgMatches, PREG_SET_ORDER)) {
        foreach ($imgMatches as $im) {
            $url = trim($im[1]);
            $exists = false;
            foreach ($images as $ex) {
                if ($ex['url'] === $url) {
                    $exists = true;
                    break;
                }
            }
            if (!$exists) {
                $images[] = ['url' => $url, 'alt' => 'Article Image'];
            }
        }
    }
    return array_slice($images, 0, 12);
}

/**
 * دانلود خودکار تصاویر و ذخیره‌سازی در پوشه اختصاصی هاست (مثلاً /uploads/media/YYYY-MM/)
 */
function roham_download_images_to_host(array $images, array $mediaConfig): array {
    $folderRel = trim((string)($mediaConfig['uploadFolder'] ?? 'uploads/media'), '/');
    if ($folderRel === '') $folderRel = 'uploads/media';

    if (!empty($mediaConfig['organizeByMonth'])) {
        $folderRel .= '/' . gmdate('Y-m');
    }

    $targetDir = dirname(__DIR__) . '/' . $folderRel;
    if (!is_dir($targetDir)) {
        @mkdir($targetDir, 0755, true);
    }

    // ایجاد فایل .htaccess امنیتی در پوشه آپلود جهت غیرفعال کردن اجرای اسکریپت‌ها
    $rootUploadDir = dirname(__DIR__) . '/' . explode('/', $folderRel)[0];
    $htaccessPath = $rootUploadDir . '/.htaccess';
    if (is_dir($rootUploadDir) && !file_exists($htaccessPath)) {
        $htContent = "# Roham Media Upload Security\nOptions -Indexes -ExecCGI\nRemoveHandler .php .phtml .php3 .php4 .php5 .php7 .php8 .phar\nphp_flag engine off\n";
        @file_put_contents($htaccessPath, $htContent);
    }

    $maxCount = (int)($mediaConfig['maxImagesPerPost'] ?? 10);
    if ($maxCount < 1) $maxCount = 6;

    $downloaded = [];
    $userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0.0.0 Safari/537.36';

    foreach (array_slice($images, 0, $maxCount) as $idx => $imgItem) {
        $remoteUrl = trim((string)($imgItem['url'] ?? ''));
        $alt = trim((string)($imgItem['alt'] ?? ''));
        if ($remoteUrl === '' || !preg_match('/^https?:\/\//i', $remoteUrl)) continue;

        $bin = null;
        $contentType = '';
        if (function_exists('curl_init')) {
            $ch = curl_init($remoteUrl);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_MAXREDIRS => 4,
                CURLOPT_TIMEOUT => 12,
                CURLOPT_CONNECTTIMEOUT => 5,
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_SSL_VERIFYHOST => false,
                CURLOPT_USERAGENT => $userAgent,
            ]);
            $bin = curl_exec($ch);
            $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $contentType = (string)curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
            curl_close($ch);
            if ($code < 200 || $code >= 300) {
                $bin = null;
            }
        }

        if ($bin && strlen($bin) > 256 && strlen($bin) < 12 * 1024 * 1024) {
            $ext = 'jpg';
            if (stripos($contentType, 'png') !== false || preg_match('/\.png(\?|$)/i', $remoteUrl)) {
                $ext = 'png';
            } elseif (stripos($contentType, 'webp') !== false || preg_match('/\.webp(\?|$)/i', $remoteUrl)) {
                $ext = 'webp';
            } elseif (stripos($contentType, 'gif') !== false || preg_match('/\.gif(\?|$)/i', $remoteUrl)) {
                $ext = 'gif';
            }

            $hash = substr(md5($remoteUrl), 0, 10);
            $filename = 'roham-img-' . gmdate('Ymd') . '-' . ($idx + 1) . '-' . $hash . '.' . $ext;
            $fullPath = $targetDir . '/' . $filename;
            $publicPath = '/' . $folderRel . '/' . $filename;

            if (@file_put_contents($fullPath, $bin) !== false) {
                $downloaded[] = [
                    'originalUrl' => $remoteUrl,
                    'localPath' => $publicPath,
                    'alt' => $alt,
                    'sizeBytes' => strlen($bin),
                    'status' => 'downloaded',
                ];
                continue;
            }
        }

        // در صورتی که دانلود تصویر به دلیل محدودیت فایروال مبدأ ممکن نشد، لینک اصلی حفظ می‌شود
        $downloaded[] = [
            'originalUrl' => $remoteUrl,
            'localPath' => $remoteUrl,
            'alt' => $alt,
            'sizeBytes' => 0,
            'status' => 'remote_fallback',
        ];
    }

    return $downloaded;
}

/**
 * فراخوانی عمومی مدل هوش مصنوعی (پشتیبانی از Google Gemini و هر سرویس OpenAI-Compatible با Base URL دلخواه)
 */
function roham_call_ai_model(array $modelConfig, string $apiKey, string $systemPrompt, string $userPrompt): ?array {
    if ($apiKey === '') return null;

    $provider = $modelConfig['provider'] ?? 'google_gemini';
    $baseUrl = rtrim(trim((string)($modelConfig['baseUrl'] ?? '')), '/');
    $modelName = trim((string)($modelConfig['modelName'] ?? 'gemini-3-flash-preview'));
    $temperature = (float)($modelConfig['temperature'] ?? 0.2);

    if ($provider === 'openai_compatible') {
        if ($baseUrl === '') $baseUrl = 'https://api.openai.com/v1';
        $endpoint = $baseUrl . '/chat/completions';
        $payload = [
            'model' => $modelName,
            'temperature' => $temperature,
            'response_format' => ['type' => 'json_object'],
            'messages' => [
                ['role' => 'system', 'content' => $systemPrompt],
                ['role' => 'user', 'content' => $userPrompt],
            ],
        ];
        $headers = [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $apiKey,
        ];
    } else {
        if ($baseUrl === '') $baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
        $endpoint = "{$baseUrl}/models/{$modelName}:generateContent?key=" . urlencode($apiKey);
        $payload = [
            'contents' => [
                ['parts' => [['text' => $userPrompt]]],
            ],
            'systemInstruction' => [
                'parts' => [['text' => $systemPrompt]],
            ],
            'generationConfig' => [
                'temperature' => $temperature,
                'responseMimeType' => 'application/json',
            ],
        ];
        $headers = ['Content-Type: application/json'];
    }

    if (!function_exists('curl_init')) return null;

    $ch = curl_init($endpoint);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
        CURLOPT_TIMEOUT => 60,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_SSL_VERIFYPEER => false,
    ]);
    $respBody = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if (!$respBody || $httpCode < 200 || $httpCode >= 300) {
        return null;
    }

    $decoded = json_decode((string)$respBody, true);
    if (!is_array($decoded)) return null;

    $rawJsonText = null;
    if ($provider === 'openai_compatible') {
        $rawJsonText = $decoded['choices'][0]['message']['content'] ?? null;
    } else {
        $rawJsonText = $decoded['candidates'][0]['content']['parts'][0]['text'] ?? null;
    }

    if (!is_string($rawJsonText)) return null;
    $rawJsonText = preg_replace('/^```(?:json)?\s*|\s*```$/i', '', trim($rawJsonText));
    $parsed = json_decode($rawJsonText, true);
    return is_array($parsed) ? $parsed : null;
}

// ============================================================================
// ACTIONS
// ============================================================================

if ($action === 'get_config') {
    $config = roham_get_ai_pipeline_config();
    $lightKey = roham_resolve_server_api_key($config['lightModel']['envKeyName'] ?? 'GEMINI_API_KEY', $db);
    $strongKey = roham_resolve_server_api_key($config['strongModel']['envKeyName'] ?? 'GEMINI_API_KEY', $db);

    roham_respond([
        'ok' => true,
        'config' => $config,
        'serverStatus' => [
            'lightKeyReady' => $lightKey !== '',
            'strongKeyReady' => $strongKey !== '',
            'uploadDirWritable' => is_writable(dirname(__DIR__)),
        ],
    ]);
}

if ($action === 'save_config') {
    $newConfig = $input['config'] ?? null;
    if (!is_array($newConfig)) {
        roham_respond(['ok' => false, 'error' => 'ساختار تنظیمات ارسالی نامعتبر است.'], 400);
    }
    $merged = array_replace_recursive(roham_default_ai_pipeline_config(), $newConfig);
    $merged['updatedAt'] = gmdate('c');
    roham_save_ai_pipeline_config($merged);

    roham_respond([
        'ok' => true,
        'config' => $merged,
        'message' => 'تنظیمات مدل سبک، مدل قوی و پوشه ذخیره رسانه با موفقیت در دیتابیس ذخیره شد.',
    ]);
}

if ($action === 'fetch_url') {
    $url = trim((string)($input['url'] ?? $_GET['url'] ?? ''));
    if ($url === '') {
        roham_respond(['ok' => false, 'error' => 'لطفاً آدرس لینک مقاله (URL) را ارسال کنید.'], 400);
    }
    $proxy = !empty($input['proxy']) ? trim((string)$input['proxy']) : (!empty($_GET['proxy']) ? trim((string)$_GET['proxy']) : null);
    $res = roham_fetch_and_clean_url($url, $proxy);
    if (empty($res['ok'])) {
        roham_respond($res, 400);
    }
    roham_respond($res, 200);
}

if ($action === 'process_pipeline') {
    $sourceType = ($input['sourceType'] ?? 'url') === 'markdown' ? 'markdown' : 'url';
    $sourceUrl = trim((string)($input['sourceUrl'] ?? ''));
    $markdownContent = trim((string)($input['markdownContent'] ?? ''));
    $targetSection = ($input['targetSection'] ?? 'news') === 'blog' ? 'blog' : 'news';
    $autoSave = !empty($input['autoSave']);

    $config = roham_get_ai_pipeline_config();
    if (isset($input['overrideConfig']) && is_array($input['overrideConfig'])) {
        $config = array_replace_recursive($config, $input['overrideConfig']);
    }

    $pipelineLogs = [];

    // گام ۱: دریافت محتوا (از لینک با حذف هدر/فوتر یا مستقیم از فایل Markdown بدون درخواست خارجی)
    $rawTitle = '';
    $sourceDomain = '';
    $detectedSourceUrl = $sourceType === 'url' ? $sourceUrl : '';
    $rawMarkdown = '';
    $candidateImages = [];

    if ($sourceType === 'url') {
        if ($sourceUrl === '') {
            roham_respond(['ok' => false, 'error' => 'لطفاً لینک خبر یا مقاله را وارد نمایید.'], 400);
        }
        $scraped = roham_fetch_and_clean_url($sourceUrl);
        if (empty($scraped['ok'])) {
            roham_respond(['ok' => false, 'error' => $scraped['error'] ?? 'خطا در واکشی لینک'], 400);
        }
        $rawTitle = $scraped['title'];
        $sourceDomain = $scraped['sourceDomain'];
        $rawMarkdown = $scraped['extractedMarkdown'];
        $candidateImages = $scraped['images'];
        $pipelineLogs[] = "واکشی کامل متن اصلی از دامنه {$sourceDomain} (حذف تگ‌های هدر، فوتر، منو و تبلیغات بدون حذف محتوای فنی).";
    } else {
        if ($markdownContent === '') {
            roham_respond(['ok' => false, 'error' => 'محتوای فایل Markdown خالی است.'], 400);
        }
        $rawMarkdown = $markdownContent;
        if (preg_match('/^#\s+(.+)$/m', $rawMarkdown, $tm)) {
            $rawTitle = trim($tm[1]);
        }
        // بررسی وجود لینک یا نام منبع در داخل فایل Markdown
        if (preg_match('/^(?:Source|URL|Original|Reference|منبع|لینک منبع)\s*:\s*(https?:\/\/\S+)/im', $rawMarkdown, $sm)) {
            $detectedSourceUrl = trim($sm[1]);
            $pHost = parse_url($detectedSourceUrl, PHP_URL_HOST);
            if ($pHost) $sourceDomain = preg_replace('/^www\./i', '', $pHost);
        } elseif (preg_match('/^(?:Source|منبع)\s*:\s*(.+)$/im', $rawMarkdown, $sm2)) {
            $sourceDomain = trim($sm2[1]);
        }
        if (!empty($input['customSource'])) {
            $customSrc = trim((string)$input['customSource']);
            if (preg_match('/^https?:\/\//i', $customSrc)) {
                $detectedSourceUrl = $customSrc;
                $pHost = parse_url($detectedSourceUrl, PHP_URL_HOST);
                if ($pHost) $sourceDomain = preg_replace('/^www\./i', '', $pHost);
            } else {
                $sourceDomain = $customSrc;
            }
        }
        $candidateImages = roham_extract_markdown_images($rawMarkdown);
        $pipelineLogs[] = "دریافت مستقیم و ۱۰۰٪ کامل فایل Markdown (بدون ارسال ریکوئست به سایت خارجی) و استخراج " . count($candidateImages) . " تصویر.";
    }

    // گام ۲: اجرای مدل سبک (Light AI Model) فقط برای حذف نویز احتمالی هدر/فوتر در حالت لینک (بدون هیچ‌گونه خلاصه‌سازی یا حذف متن اصلی)
    $lightKey = roham_resolve_server_api_key($config['lightModel']['envKeyName'] ?? 'GEMINI_API_KEY', $db);
    $cleanedBody = $rawMarkdown;
    $extractedCves = [];
    if (preg_match_all('/CVE-\d{4}-\d{4,7}/i', $rawMarkdown, $cveM)) {
        $extractedCves = array_values(array_unique(array_map('strtoupper', $cveM[0])));
    }

    if ($sourceType === 'url' && $lightKey !== '') {
        $lightSys = "You are a lossless technical article body extractor. Remove ONLY website navigation menus, header, footer, ads, and unrelated sidebar links. CRITICAL RULE: DO NOT summarize, shorten, or delete ANY paragraph, heading, code block, command, list, or technical detail from the article! Keep 100% of the main article text verbatim from start to finish. Return JSON with keys: {\"cleanTitle\": string, \"cleanedMarkdown\": string, \"cves\": string[], \"validImageUrls\": string[]}.";
        $lightUser = "Source Title: {$rawTitle}\nCandidate Images: " . json_encode($candidateImages) . "\n\nRaw Content:\n" . $rawMarkdown;
        $lightRes = roham_call_ai_model($config['lightModel'], $lightKey, $lightSys, $lightUser);
        if (is_array($lightRes) && !empty($lightRes['cleanedMarkdown'])) {
            $cleanedBody = (string)$lightRes['cleanedMarkdown'];
            if (!empty($lightRes['cleanTitle'])) $rawTitle = (string)$lightRes['cleanTitle'];
            if (!empty($lightRes['cves']) && is_array($lightRes['cves'])) {
                $extractedCves = array_values(array_unique(array_merge($extractedCves, $lightRes['cves'])));
            }
            $pipelineLogs[] = "حذف نویزهای پیرامونی صفحه بدون کاستن از متن اصلی توسط مدل سبک ({$config['lightModel']['modelName']}) انجام شد.";
        }
    }

    // گام ۳: دانلود تمام تصاویر مقاله به پوشه اختصاصی روی هاست (/uploads/media/)
    $downloadedImages = [];
    if (!empty($config['mediaConfig']['downloadImages']) && !empty($candidateImages)) {
        $downloadedImages = roham_download_images_to_host($candidateImages, $config['mediaConfig']);
        $pipelineLogs[] = count($downloadedImages) . " تصویر دانلود و در پوشه /" . trim($config['mediaConfig']['uploadFolder'], '/') . " ذخیره شد.";
    }

    // جایگزینی لینک‌های قدیمی تصاویر داخل متن با آدرس لوکال دانلودشده روی هاست
    foreach ($downloadedImages as $dImg) {
        if (!empty($dImg['originalUrl']) && !empty($dImg['localPath'])) {
            $cleanedBody = str_replace($dImg['originalUrl'], $dImg['localPath'], $cleanedBody);
        }
    }

    // گام ۴: اجرای مدل قوی (Strong AI Model) برای ترجمه ۱۰۰٪ کامل و وفادار متن بدون حذفیات و بدون بخش‌های ساختگی
    $strongKey = roham_resolve_server_api_key($config['strongModel']['envKeyName'] ?? 'GEMINI_API_KEY', $db);
    $customInst = $config['strongModel']['customInstructions'] ?? '';
    $coverImage = $downloadedImages[0]['localPath'] ?? '';

    $generatedPost = null;
    if ($strongKey !== '') {
        if ($targetSection === 'news') {
            $strongSys = "You are a Senior Cybersecurity Translator & Editor. Translate the ENTIRE provided article into fluent, accurate Persian. CRITICAL RULES:\n1. DO NOT summarize, truncate, or omit ANY paragraph, section, code block, list, or technical detail. Every single paragraph and code snippet in the input MUST be preserved in full.\n2. DO NOT invent or add any extra sections (leave keyHighlights, iocs, mitigationSteps, and timeline as empty arrays []).\n3. Keep all code blocks untouched in their original programming language.\n4. Place the provided local image paths in the corresponding sections where they appear.\n{$customInst}\nReturn strictly valid JSON with keys: title, subtitle, category ('urgent'|'malware'|'zeroday'|'apt'|'cloud'), categoryLabel, severity ('CRITICAL'|'HIGH'|'MEDIUM'|'INFO'), cveIds (string[]), summary, sections (array of {heading, paragraphs: string[], codeSnippet, codeLanguage, imageUrl, imageAlt}), tags (string[]).";
        } else {
            $strongSys = "You are a Principal Security Translator & Author. Translate the ENTIRE provided technical article into fluent, accurate Persian. CRITICAL RULES:\n1. DO NOT summarize, truncate, or omit ANY paragraph, section, code block, list, or technical detail. Every single paragraph and code snippet in the input MUST be preserved in full.\n2. DO NOT invent or add any extra sections (leave tldr and actionableTakeaways as empty arrays [], and conclusion as empty string unless the article explicitly has a conclusion).\n3. Keep all code blocks untouched in their original programming language.\n4. Place the provided local image paths in the corresponding content.sections where they appear.\n{$customInst}\nReturn strictly valid JSON with keys: title, subtitle, summary, category ('استیلر و بدافزار'|'دفاع و هاردنینگ'|'هویت و سشن‌ها'|'تحقیقات زیرودی'), difficulty ('پیشرفته'|'تخصصی (Deep-Dive)'), readTime, tags (string[]), content ({intro, sections: array of {id, heading, paragraphs: string[], codeSnippet, codeLanguage, imageUrl, imageAlt}, conclusion}).";
        }

        $strongUser = "Original Title: {$rawTitle}\nSource: {$sourceDomain}\nSource URL: {$detectedSourceUrl}\nDownloaded Local Images: " . json_encode($downloadedImages, JSON_UNESCAPED_UNICODE) . "\n\nFull Article Content (Translate 100% completely without omitting anything):\n" . $cleanedBody;
        $strongRes = roham_call_ai_model($config['strongModel'], $strongKey, $strongSys, $strongUser);
        if (is_array($strongRes) && !empty($strongRes['title'])) {
            $generatedPost = $strongRes;
            $pipelineLogs[] = "ترجمه ۱۰۰٪ کامل و بدون حذفیات توسط مدل قوی ({$config['strongModel']['modelName']}) با موفقیت انجام شد.";
        }
    }

    roham_respond([
        'ok' => true,
        'targetSection' => $targetSection,
        'sourceType' => $sourceType,
        'sourceDomain' => $sourceDomain,
        'sourceUrl' => $detectedSourceUrl,
        'rawTitle' => $rawTitle,
        'cleanedMarkdown' => $cleanedBody,
        'extractedCves' => $extractedCves,
        'downloadedImages' => $downloadedImages,
        'coverImage' => $coverImage,
        'generatedPost' => $generatedPost,
        'pipelineLogs' => $pipelineLogs,
    ]);
}

roham_respond(['ok' => false, 'error' => 'اکشن درخواستی در پست‌گذار هوشمند یافت نشد.'], 400);
