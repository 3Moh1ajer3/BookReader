<?php
/**
 * Roham Security — Unified Content Management & Ingestion Service (v2)
 * مسير: /api/content-service.php
 *
 * قابلیت‌ها:
 *  - پردازش و رندر ایمن Markdown به HTML به همراه sanitization ضد XSS
 *  - استخراج خودکار ساختار سازگار با گذشته (Backward-Compatible Sections)
 *  - اعتبارسنجی دقیق ورودی با خطاهای جزئی
 *  - مدیریت Idempotency با کش کلیدها
 *  - سیستم Audit Log برای رهگیری تغییرات محتوا
 *  - سیستم Rate Limiting برای جلوگیری از اسپم
 *  - نگاشت خودکار اکشن‌های قدیمی save_blog و save_news
 *  - ارائه اسکیما (JSON Schema) و مشخصات OpenAPI 3.1
 */

class RohamSanitizer {
    /**
     * پالایش دقیق رشته متنی
     */
    public static function cleanText(?string $val): string {
        if ($val === null) return '';
        return trim(strip_tags((string)$val));
    }

    /**
     * تولید اسلاگ تمیز و یکتا
     */
    public static function cleanSlug(?string $slug, string $fallback = ''): string {
        $source = !empty($slug) ? $slug : $fallback;
        $clean = preg_replace('/[^\p{L}\p{Nd}\-_]+/u', '-', mb_strtolower((string)$source));
        $clean = trim((string)$clean, '-_');
        return $clean !== '' ? $clean : 'content-' . substr(md5(uniqid()), 0, 8);
    }

    /**
     * پاکسازی لینک و جلوگیری از تزریق پروتکل‌های خطرناک
     */
    public static function cleanUrl(?string $url): string {
        $url = trim((string)$url);
        if ($url === '') return '';
        if (preg_match('/^(https?:\/\/|mailto:|\/)/i', $url)) {
            return htmlspecialchars($url, ENT_QUOTES, 'UTF-8');
        }
        return '#';
    }

    /**
     * ضدعفونی‌سازی کد HTML و حذف تگ‌ها و اتریبیوت‌های خطرناک (Strict XSS Sanitizer)
     */
    public static function sanitizeHtml(string $html): string {
        // ۱. حذف تگ‌های خطرناک به همراه محتوای داخلی
        $html = preg_replace('/<(script|style|iframe|object|embed|applet|meta|link|form|input|button)\b[^>]*>.*?<\/\1>/is', '', $html);
        $html = preg_replace('/<(script|style|iframe|object|embed|applet|meta|link|form|input|button)\b[^>]*\/?>/is', '', $html);

        // ۲. حذف هندلرهای جاوااسکریپت (on*)
        $html = preg_replace('/\s+on[a-z0-9_-]+\s*=\s*(["\'][^"\']*["\']|[^\s>]+)/i', '', $html);

        // ۳. حذف پروتکل‌های مخرب در href و src
        $html = preg_replace('/(href|src)\s*=\s*["\']\s*(javascript|vbscript|data):[^"\']*["\']/i', '$1="#"', $html);

        return $html;
    }
}

class RohamMarkdown {
    /**
     * تبدیل مارک‌داون به HTML خوانا، مدرن و ایمن با استایل‌های هماهنگ با رهام
     */
    public static function toHtml(string $markdown): string {
        $text = str_replace(["\r\n", "\r"], "\n", $markdown);

        // ۱. استخراج و جایگزینی بلوک‌های کد (Fenced Code Blocks)
        $codeBlocks = [];
        $text = preg_replace_callback('/```([a-zA-Z0-9_\-#+.]*)\n([\s\S]*?)```/m', function ($matches) use (&$codeBlocks) {
            $lang = trim($matches[1]);
            $langDisplay = $lang !== '' ? htmlspecialchars($lang, ENT_QUOTES, 'UTF-8') : 'CODE';
            $code = htmlspecialchars(rtrim($matches[2]), ENT_QUOTES, 'UTF-8');
            $placeholder = '<!--ROHAM_CODE_BLOCK_' . count($codeBlocks) . '-->';
            $codeBlocks[] = '
<div class="my-5 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl" dir="ltr">
  <div class="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/80 text-[11px] font-mono text-slate-400">
    <span class="font-bold tracking-wider uppercase text-emerald-400">' . $langDisplay . '</span>
    <span class="opacity-60">UTF-8 / Raw Snippet</span>
  </div>
  <pre class="p-4 overflow-x-auto font-mono text-xs sm:text-sm text-slate-200 leading-relaxed selection:bg-emerald-500/30"><code>' . $code . '</code></pre>
</div>';
            return $placeholder;
        }, $text);

        // ۲. تیترها (Headings)
        $text = preg_replace_callback('/^(#{1,6})\s+(.+)$/m', function ($matches) {
            $level = strlen($matches[1]);
            $title = trim($matches[2]);
            $cleanTitle = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
            $id = 'heading-' . substr(md5($title), 0, 8);

            switch ($level) {
                case 1:
                    return "<h1 id=\"{$id}\" class=\"text-2xl sm:text-3xl font-extrabold text-slate-100 mt-8 mb-4 pb-2 border-b border-slate-800\">{$cleanTitle}</h1>";
                case 2:
                    return "<h2 id=\"{$id}\" class=\"text-xl sm:text-2xl font-bold text-slate-100 mt-7 mb-3.5 flex items-center gap-2\"><span class=\"w-2 h-2 rounded-full bg-emerald-500 inline-block\"></span>{$cleanTitle}</h2>";
                case 3:
                    return "<h3 id=\"{$id}\" class=\"text-lg sm:text-xl font-bold text-slate-200 mt-6 mb-3\">{$cleanTitle}</h3>";
                default:
                    return "<h4 id=\"{$id}\" class=\"text-base font-bold text-slate-300 mt-4 mb-2\">{$cleanTitle}</h4>";
            }
        }, $text);

        // ۳. نقل‌قول و هشدارهای امنیتی (Blockquotes / Callouts)
        $text = preg_replace_callback('/^>\s*(?:\[!(WARNING|INFO|TIP|NOTE|DANGER)\])?\s*(.+)$/m', function ($matches) {
            $type = strtoupper($matches[1] ?? 'INFO');
            $content = htmlspecialchars(trim($matches[2]), ENT_QUOTES, 'UTF-8');

            $borderColor = 'border-emerald-500';
            $bgColor = 'bg-emerald-500/10';
            $textColor = 'text-emerald-200';
            $badge = 'نکته فنی';

            if (in_array($type, ['WARNING', 'DANGER']) || mb_stripos($content, 'هشدار') !== false) {
                $borderColor = 'border-amber-500';
                $bgColor = 'bg-amber-500/10';
                $textColor = 'text-amber-200';
                $badge = 'هشدار امنیتی';
            }

            return "<blockquote class=\"my-4 p-4 rounded-2xl border-r-4 {$borderColor} {$bgColor} text-xs sm:text-sm {$textColor} leading-relaxed\">
                <div class=\"font-bold mb-1 text-[11px] font-mono tracking-wider\">{$badge}</div>
                <div>{$content}</div>
            </blockquote>";
        }, $text);

        // ۴. جداول (Markdown Tables)
        $text = preg_replace_callback('/((?:^\|.+\|\r?\n)+)/m', function ($matches) {
            $lines = array_filter(array_map('trim', explode("\n", trim($matches[1]))));
            if (count($lines) < 2) return $matches[1];

            $headers = [];
            $rows = [];

            foreach ($lines as $i => $line) {
                if ($i === 1 && preg_match('/^\|[\s\-:|]+\|$/', $line)) {
                    continue; // جداکننده هدر
                }
                $cells = array_values(array_filter(array_map('trim', explode('|', $line)), function ($v) {
                    return $v !== '';
                }));
                if ($i === 0) {
                    $headers = $cells;
                } else {
                    $rows[] = $cells;
                }
            }

            if (empty($headers)) return $matches[1];

            $html = '<div class="my-5 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg">';
            $html .= '<table class="w-full text-right text-xs sm:text-sm border-collapse">';
            $html .= '<thead class="bg-slate-950/80 text-slate-300 font-bold border-b border-slate-800"><tr>';
            foreach ($headers as $h) {
                $html .= '<th class="p-3.5 whitespace-nowrap">' . htmlspecialchars($h, ENT_QUOTES, 'UTF-8') . '</th>';
            }
            $html .= '</tr></thead><tbody class="divide-y divide-slate-800/60 text-slate-300">';
            foreach ($rows as $row) {
                $html .= '<tr class="hover:bg-slate-800/40 transition-colors">';
                foreach ($headers as $cIdx => $unused) {
                    $val = htmlspecialchars($row[$cIdx] ?? '', ENT_QUOTES, 'UTF-8');
                    $html .= '<td class="p-3.5 leading-relaxed">' . $val . '</td>';
                }
                $html .= '</tr>';
            }
            $html .= '</tbody></table></div>';
            return $html;
        }, $text);

        // ۵. کدهای خطی (Inline Code)
        $text = preg_replace_callback('/`([^`]+)`/', function ($m) {
            return '<code class="font-mono text-emerald-400 bg-slate-900/90 border border-slate-800 px-1.5 py-0.5 rounded-md text-[12px] sm:text-[13px] mx-1" dir="ltr">' . htmlspecialchars($m[1], ENT_QUOTES, 'UTF-8') . '</code>';
        }, $text);

        // ۶. خطوط افقی (Horizontal Rule)
        $text = preg_replace('/^(?:---|\*\*\*|___)$/m', '<hr class="my-6 border-slate-800" />', $text);

        // ۷. لینک‌ها و تصاویر
        $text = preg_replace_callback('/!\[([^\]]*)\]\(([^)]+)\)/', function ($m) {
            $alt = htmlspecialchars($m[1], ENT_QUOTES, 'UTF-8');
            $url = RohamSanitizer::cleanUrl($m[2]);
            return '<figure class="my-6 text-center"><img src="' . $url . '" alt="' . $alt . '" class="max-w-full rounded-2xl border border-slate-800 shadow-xl mx-auto" loading="lazy" /><figcaption class="mt-2 text-xs text-slate-500 font-mono">' . $alt . '</figcaption></figure>';
        }, $text);

        $text = preg_replace_callback('/\[([^\]]+)\]\(([^)]+)\)/', function ($m) {
            $label = htmlspecialchars($m[1], ENT_QUOTES, 'UTF-8');
            $url = RohamSanitizer::cleanUrl($m[2]);
            return '<a href="' . $url . '" target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:text-emerald-300 underline underline-offset-4 font-semibold transition-colors">' . $label . '</a>';
        }, $text);

        // ۸. فرمت متن (Bold, Italic)
        $text = preg_replace('/\*\*([^*]+)\*\*/', '<strong class="font-bold text-slate-100">$1</strong>', $text);
        $text = preg_replace('/\*([^*]+)\*/', '<em class="italic text-slate-200">$1</em>', $text);

        // ۹. لیست‌ها (Lists)
        $text = preg_replace_callback('/((?:^(?:[\*\-]|\d+\.)\s+.+\r?\n?)+)/m', function ($matches) {
            $lines = array_filter(array_map('trim', explode("\n", trim($matches[1]))));
            $isOrdered = preg_match('/^\d+\./', $lines[0] ?? '');
            $tag = $isOrdered ? 'ol' : 'ul';
            $listClasses = $isOrdered ? 'list-decimal pr-6 space-y-2 my-4 text-slate-300 text-sm leading-relaxed' : 'list-disc pr-6 space-y-2 my-4 text-slate-300 text-sm leading-relaxed';

            $items = '';
            foreach ($lines as $line) {
                $itemText = preg_replace('/^(?:[\*\-]|\d+\.)\s+/', '', $line);
                $items .= '<li>' . $itemText . '</li>';
            }
            return "<{$tag} class=\"{$listClasses}\">{$items}</{$tag}>";
        }, $text);

        // ۱۰. پاراگراف‌ها (Paragraphs)
        $paragraphs = explode("\n\n", $text);
        $output = '';
        foreach ($paragraphs as $p) {
            $p = trim($p);
            if ($p === '') continue;
            // اگر قبلاً تگ HTML بلوکی است مستقیماً استفاده شود
            if (preg_match('/^<(div|h[1-6]|table|blockquote|ul|ol|hr|figure|<!--ROHAM_CODE_BLOCK_)/', $p)) {
                $output .= $p . "\n";
            } else {
                $output .= "<p class=\"text-slate-300 text-sm sm:text-base leading-relaxed sm:leading-8 my-3\">" . nl2br($p) . "</p>\n";
            }
        }

        // ۱۱. بازگردانی بلوک‌های کد
        foreach ($codeBlocks as $idx => $blockHtml) {
            $output = str_replace('<!--ROHAM_CODE_BLOCK_' . $idx . '-->', $blockHtml, $output);
        }

        return RohamSanitizer::sanitizeHtml($output);
    }

    /**
     * استخراج ساختار بخش‌های تودرتو برای سازگاری کامل با خواننده و فرانت‌اند فعلی
     */
    public static function extractStructuredSections(string $markdown): array {
        $text = str_replace(["\r\n", "\r"], "\n", $markdown);
        $lines = explode("\n", $text);

        $sections = [];
        $introLines = [];
        $currentHeading = null;
        $currentParagraphs = [];
        $currentCode = null;
        $currentLang = null;
        $currentCallout = null;

        $inCodeBlock = false;
        $codeBuffer = [];
        $codeLang = '';

        foreach ($lines as $line) {
            if (preg_match('/^```([a-zA-Z0-9_\-#+.]*)/', $line, $m)) {
                if ($inCodeBlock) {
                    $inCodeBlock = false;
                    $currentCode = implode("\n", $codeBuffer);
                    $currentLang = $codeLang;
                    $codeBuffer = [];
                } else {
                    $inCodeBlock = true;
                    $codeLang = trim($m[1]);
                }
                continue;
            }

            if ($inCodeBlock) {
                $codeBuffer[] = $line;
                continue;
            }

            // تیتر سطح ۲ یا ۳
            if (preg_match('/^#{2,3}\s+(.+)$/', $line, $m)) {
                if ($currentHeading !== null || !empty($currentParagraphs)) {
                    $sections[] = [
                        'id' => 'sec-' . count($sections) . '-' . substr(md5($currentHeading ?? 'sec'), 0, 6),
                        'heading' => $currentHeading ?? ('بخش ' . (count($sections) + 1)),
                        'paragraphs' => !empty($currentParagraphs) ? $currentParagraphs : [''],
                        'codeSnippet' => $currentCode,
                        'codeLanguage' => $currentLang,
                        'callout' => $currentCallout,
                    ];
                    $currentParagraphs = [];
                    $currentCode = null;
                    $currentLang = null;
                    $currentCallout = null;
                }
                $currentHeading = trim($m[1]);
                continue;
            }

            // کال‌اوت یا هشدار
            if (preg_match('/^>\s*(.+)$/', $line, $m)) {
                $currentCallout = trim($m[1]);
                continue;
            }

            $trimmed = trim($line);
            if ($trimmed !== '' && !str_starts_with($trimmed, '#')) {
                if ($currentHeading === null && count($sections) === 0) {
                    $introLines[] = $trimmed;
                } else {
                    $currentParagraphs[] = $trimmed;
                }
            }
        }

        if ($currentHeading !== null || !empty($currentParagraphs)) {
            $sections[] = [
                'id' => 'sec-' . count($sections) . '-' . substr(md5($currentHeading ?? 'sec'), 0, 6),
                'heading' => $currentHeading ?? ('بخش ' . (count($sections) + 1)),
                'paragraphs' => !empty($currentParagraphs) ? $currentParagraphs : [''],
                'codeSnippet' => $currentCode,
                'codeLanguage' => $currentLang,
                'callout' => $currentCallout,
            ];
        }

        $intro = implode("\n\n", array_slice($introLines, 0, 4));
        $conclusion = '';
        if (count($sections) > 0) {
            $lastSec = $sections[count($sections) - 1];
            if (mb_stripos($lastSec['heading'], 'نتیجه') !== false || mb_stripos($lastSec['heading'], 'جمع‌بندی') !== false) {
                $conclusion = implode(' ', $lastSec['paragraphs']);
            }
        }

        return [
            'intro' => $intro !== '' ? $intro : 'واکاوی فنی و کالبدشکافی ساختار توسط مرکز تحلیل تهدیدات سایبری رهام.',
            'sections' => $sections,
            'conclusion' => $conclusion !== '' ? $conclusion : 'پیاده‌سازی راهکارهای دفاع در عمق و نظارت مستمر بر رفتارهای مشکوک ضامن بقای سازمان در برابر این تهدید است.',
        ];
    }
}

class RohamIdempotency {
    public static function check(PDO $pdo, ?string $key): ?array {
        if (empty($key)) return null;
        try {
            $stmt = $pdo->prepare("SELECT * FROM roham_api_idempotency WHERE idempotency_key = :k LIMIT 1");
            $stmt->execute([':k' => $key]);
            $row = $stmt->fetch();
            if ($row) {
                if ((int)$row['expires_at'] < time()) {
                    $del = $pdo->prepare("DELETE FROM roham_api_idempotency WHERE idempotency_key = :k");
                    $del->execute([':k' => $key]);
                    return null;
                }
                $json = json_decode($row['response_json'], true);
                if (is_array($json)) {
                    return [
                        'code' => (int)$row['response_code'],
                        'response' => $json,
                    ];
                }
            }
        } catch (Throwable $e) {
            error_log('Idempotency check error: ' . $e->getMessage());
        }
        return null;
    }

    public static function save(PDO $pdo, ?string $key, string $action, int $code, array $response, int $ttl = 86400): void {
        if (empty($key)) return;
        try {
            $now = gmdate('c');
            $expires = time() + $ttl;
            $json = json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            $stmt = $pdo->prepare("
                INSERT INTO roham_api_idempotency (idempotency_key, action, response_code, response_json, created_at, expires_at)
                VALUES (:k, :act, :code, :json, :created, :exp)
            ");
            $stmt->execute([
                ':k' => $key,
                ':act' => $action,
                ':code' => $code,
                ':json' => $json,
                ':created' => $now,
                ':exp' => $expires,
            ]);
        } catch (Throwable $e) {
            error_log('Idempotency save error: ' . $e->getMessage());
        }
    }
}

class RohamRateLimiter {
    public static function enforce(PDO $pdo, string $key, int $limit = 60, int $window = 60): array {
        $now = time();
        $windowStart = $now - ($now % $window);
        $rateKey = md5($key . '_' . $windowStart);

        try {
            $stmt = $pdo->prepare("SELECT requests_count FROM roham_rate_limits WHERE rate_key = :k LIMIT 1");
            $stmt->execute([':k' => $rateKey]);
            $count = (int)$stmt->fetchColumn();

            if ($count >= $limit) {
                return [
                    'allowed' => false,
                    'limit' => $limit,
                    'remaining' => 0,
                    'reset' => ($windowStart + $window) - $now,
                ];
            }

            if ($count === 0) {
                $ins = $pdo->prepare("INSERT INTO roham_rate_limits (rate_key, requests_count, window_start) VALUES (:k, 1, :w)");
                $ins->execute([':k' => $rateKey, ':w' => $windowStart]);
            } else {
                $upd = $pdo->prepare("UPDATE roham_rate_limits SET requests_count = requests_count + 1 WHERE rate_key = :k");
                $upd->execute([':k' => $rateKey]);
            }

            return [
                'allowed' => true,
                'limit' => $limit,
                'remaining' => max(0, $limit - ($count + 1)),
                'reset' => ($windowStart + $window) - $now,
            ];
        } catch (Throwable $e) {
            // در صورت بروز خطا در نرخ‌سنجی، دسترسی متوقف نمی‌شود
            return ['allowed' => true, 'limit' => $limit, 'remaining' => $limit, 'reset' => 0];
        }
    }
}

class RohamAuditLogger {
    public static function log(
        PDO $pdo,
        string $contentId,
        string $action,
        string $actorType,
        string $actorId,
        ?string $idempotencyKey = null,
        ?array $changes = null
    ): void {
        try {
            $id = 'aud_' . substr(md5(uniqid('', true)), 0, 16);
            $ip = $_SERVER['REMOTE_ADDR'] ?? null;
            $ua = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 250);
            $now = gmdate('c');
            $changesJson = $changes !== null ? json_encode($changes, JSON_UNESCAPED_UNICODE) : null;

            $stmt = $pdo->prepare("
                INSERT INTO roham_content_audit_logs (id, content_id, action, actor_type, actor_id, ip_address, user_agent, idempotency_key, changes_json, created_at)
                VALUES (:id, :cid, :act, :atype, :aid, :ip, :ua, :ik, :ch, :now)
            ");
            $stmt->execute([
                ':id' => $id,
                ':cid' => $contentId,
                ':act' => $action,
                ':atype' => $actorType,
                ':aid' => $actorId,
                ':ip' => $ip,
                ':ua' => $ua,
                ':ik' => $idempotencyKey,
                ':ch' => $changesJson,
                ':now' => $now,
            ]);
        } catch (Throwable $e) {
            error_log('Audit log error: ' . $e->getMessage());
        }
    }
}

class RohamContentService {
    /**
     * نگاشت و تبدیل نام دسته‌بندی از شناسه categoryId
     */
    public static function resolveCategory(PDO $pdo, ?string $categoryId, string $type = 'blog'): array {
        $catId = trim((string)$categoryId);
        if ($catId !== '') {
            try {
                $stmt = $pdo->prepare("SELECT * FROM roham_categories WHERE id = :id OR slug = :slug LIMIT 1");
                $stmt->execute([':id' => $catId, ':slug' => $catId]);
                $row = $stmt->fetch();
                if ($row) {
                    return [
                        'id' => (string)$row['id'],
                        'name' => (string)$row['name'],
                        'slug' => (string)$row['slug'],
                    ];
                }
            } catch (Throwable $e) {}
        }

        // دسته‌بندی‌های پیش‌فرض
        $defaults = [
            'malware-infostealers' => 'بدافزارها و استیلرها',
            'supply-chain' => 'حملات زنجیره تامین (Supply Chain)',
            'vulnerabilities-exploits' => 'تحلیل آسیب‌پذیری و اکسپلویت',
            'writeups-research' => 'گزارش‌های فنی و رایت‌آپ',
            'social-engineering' => 'مهندسی اجتماعی و فیشینگ',
            'cloud-infrastructure' => 'امنیت ابری و زیرساخت',
            'security-alerts' => 'اخبار و هشدارهای فوری',
        ];

        if (isset($defaults[$catId])) {
            return ['id' => $catId, 'name' => $defaults[$catId], 'slug' => $catId];
        }

        $fallbackId = $type === 'news' ? 'security-alerts' : 'malware-infostealers';
        return [
            'id' => $fallbackId,
            'name' => $defaults[$fallbackId],
            'slug' => $fallbackId,
        ];
    }

    /**
     * اعتبارسنجی پکیج محتوا با ساختار استاندارد
     */
    public static function validate(string $type, array $content): array {
        $errors = [];

        if (!in_array($type, ['blog', 'news'], true)) {
            $errors[] = ['field' => 'type', 'message' => "نوع محتوا باید 'blog' یا 'news' باشد."];
        }

        if (empty(trim((string)($content['title'] ?? '')))) {
            $errors[] = ['field' => 'title', 'message' => 'عنوان محتوا (title) الزامی است.'];
        }

        if (empty(trim((string)($content['summary'] ?? '')))) {
            $errors[] = ['field' => 'summary', 'message' => 'خلاصه محتوا (summary) الزامی است.'];
        }

        if (empty(trim((string)($content['bodyMarkdown'] ?? '')))) {
            $errors[] = ['field' => 'bodyMarkdown', 'message' => 'متن مقاله به فرمت Markdown (فیلد bodyMarkdown) الزامی است.'];
        }

        if (isset($content['status']) && !in_array($content['status'], ['published', 'draft', 'archived'], true)) {
            $errors[] = ['field' => 'status', 'message' => "وضعیت نامعتبر است. مقادیر مجاز: 'published', 'draft', 'archived'"];
        }

        if (isset($content['severity']) && !in_array(strtolower($content['severity']), ['critical', 'high', 'medium', 'low', 'info'], true)) {
            $errors[] = ['field' => 'severity', 'message' => "سطح حساسیت خبر نامعتبر است. مقادیر مجاز: critical, high, medium, low, info"];
        }

        if (!empty($content['publishedAt'])) {
            $ts = strtotime((string)$content['publishedAt']);
            if ($ts === false) {
                $errors[] = ['field' => 'publishedAt', 'message' => 'فرمت تاریخ باید استاندارد ISO 8601 باشد (مانند 2026-04-01T12:30:00Z).'];
            }
        }

        return $errors;
    }

    /**
     * ذخیره یا ویرایش یکپارچه مقاله وبلاگ یا خبر امنیت (Unified Upsert Service)
     */
    public static function upsert(PDO $pdo, string $type, array $content, array $authInfo, ?string $idempotencyKey = null): array {
        $now = gmdate('c');
        $slug = RohamSanitizer::cleanSlug($content['slug'] ?? null, $content['title'] ?? '');
        $title = RohamSanitizer::cleanText($content['title'] ?? '');
        $subtitle = RohamSanitizer::cleanText($content['subtitle'] ?? '');
        $summary = RohamSanitizer::cleanText($content['summary'] ?? '');
        $status = in_array($content['status'] ?? 'published', ['published', 'draft', 'archived'], true) ? $content['status'] : 'published';
        $severity = !empty($content['severity']) ? strtoupper(RohamSanitizer::cleanText($content['severity'])) : null;
        $isFeatured = !empty($content['isFeatured']) ? 1 : 0;
        $isBreaking = !empty($content['isBreaking']) ? 1 : 0;
        $difficulty = RohamSanitizer::cleanText($content['difficulty'] ?? 'متوسط');
        $readTimeMinutes = max(1, (int)($content['readTimeMinutes'] ?? 5));
        $bodyMarkdown = trim((string)($content['bodyMarkdown'] ?? ''));

        // تاریخ انتشار مدیریت‌شده توسط سرور (در صورت عدم ارسال)
        $publishedAt = !empty($content['publishedAt']) ? gmdate('c', strtotime((string)$content['publishedAt'])) : $now;

        // بررسی و استخراج دسته‌بندی رسمی
        $categoryInfo = self::resolveCategory($pdo, $content['categoryId'] ?? null, $type);
        $categoryId = $categoryInfo['id'];
        $categoryName = $categoryInfo['name'];

        // نویسنده
        $authorName = 'واحد امنیت سایبری رهام';
        $authorRole = 'Roham Threat Research Labs';
        if (isset($content['author'])) {
            if (is_array($content['author'])) {
                $authorName = RohamSanitizer::cleanText($content['author']['name'] ?? $authorName);
                $authorRole = RohamSanitizer::cleanText($content['author']['role'] ?? $authorRole);
            } else {
                $authorName = RohamSanitizer::cleanText((string)$content['author']);
            }
        }

        // منبع خبر
        $sourceName = null;
        $sourceUrl = null;
        if (isset($content['source'])) {
            if (is_array($content['source'])) {
                $sourceName = RohamSanitizer::cleanText($content['source']['name'] ?? 'Roham Radar');
                $sourceUrl = RohamSanitizer::cleanUrl($content['source']['url'] ?? '');
            } else {
                $sourceName = RohamSanitizer::cleanText((string)$content['source']);
            }
        }

        // تگ‌ها
        $rawTags = is_array($content['tags'] ?? null) ? $content['tags'] : (is_array($content['keywords'] ?? null) ? $content['keywords'] : []);
        $tags = array_values(array_unique(array_filter(array_map([RohamSanitizer::class, 'cleanText'], $rawTags))));

        // آرایه‌های تکمیلی
        $tldr = is_array($content['tldr'] ?? null) ? array_values(array_filter(array_map([RohamSanitizer::class, 'cleanText'], $content['tldr']))) : [];
        $takeaways = is_array($content['takeaways'] ?? null) ? array_values(array_filter(array_map([RohamSanitizer::class, 'cleanText'], $content['takeaways']))) : [];
        $references = is_array($content['references'] ?? null) ? $content['references'] : [];
        $iocs = is_array($content['iocs'] ?? null) ? $content['iocs'] : [];

        // تبدیل و امن‌سازی HTML
        $renderedHtml = RohamMarkdown::toHtml($bodyMarkdown);
        $structured = RohamMarkdown::extractStructuredSections($bodyMarkdown);

        // تولید شناسه قطعی
        $canonicalId = $type . '-' . $slug;

        // بررسی اینکه آیا مقاله از قبل با این اسلاگ یا شناسه وجود دارد
        $existingStmt = $pdo->prepare("SELECT * FROM roham_contents WHERE slug = :slug OR id = :id LIMIT 1");
        $existingStmt->execute([':slug' => $slug, ':id' => $canonicalId]);
        $existing = $existingStmt->fetch();

        $contentId = $existing ? (string)$existing['id'] : $canonicalId;
        $views = $existing ? (int)$existing['views'] : 0;
        $createdAt = $existing ? (string)$existing['created_at'] : $now;

        // اگر مقاله ویژه جدید است، دیگر مقالات ویژه غیرفعال شوند
        if ($isFeatured && $type === 'blog') {
            try {
                $pdo->exec("UPDATE roham_contents SET is_featured = 0 WHERE type = 'blog'");
            } catch (Throwable $e) {}
        }

        // تولید ساختار سازگار با فرانت‌اند قبلی (Backward-Compatible payload_json)
        $legacyPayload = [
            'id' => $contentId,
            'type' => $type,
            'slug' => $slug,
            'title' => $title,
            'subtitle' => $subtitle,
            'summary' => $summary,
            'category' => $categoryName,
            'categoryId' => $categoryId,
            'readTime' => $readTimeMinutes . ' دقیقه',
            'readTimeMinutes' => $readTimeMinutes,
            'date' => self::formatPersianDate($publishedAt),
            'publishedAt' => $publishedAt,
            'updatedAt' => $now,
            'author' => $authorName,
            'authorRole' => $authorRole,
            'difficulty' => $difficulty,
            'tags' => $tags,
            'keywords' => $tags,
            'status' => $status,
            'severity' => $severity,
            'isFeatured' => (bool)$isFeatured,
            'isBreaking' => (bool)$isBreaking,
            'views' => $views,
            'source' => $sourceName ?? 'Roham Cyber Lab',
            'sourceUrl' => $sourceUrl,
            'tldr' => $tldr,
            'takeaways' => $takeaways,
            'references' => $references,
            'iocs' => $iocs,
            'bodyMarkdown' => $bodyMarkdown,
            'renderedHtml' => $renderedHtml,
            'content' => [
                'intro' => $structured['intro'],
                'sections' => $structured['sections'],
                'conclusion' => $structured['conclusion'],
                'actionableTakeaways' => $takeaways,
                'references' => $references,
            ],
            'sections' => $structured['sections'],
        ];

        // ذخیره در جدول نرمال‌شده roham_contents
        $upsertStmt = $pdo->prepare("
            INSERT INTO roham_contents (
                id, type, slug, title, subtitle, summary,
                category_id, category_name, status, severity,
                is_featured, is_breaking, difficulty, read_time_minutes,
                views, published_at, created_at, updated_at,
                author_name, author_role, source_name, source_url,
                tldr_json, takeaways_json, references_json, iocs_json,
                body_markdown, rendered_html, payload_json
            ) VALUES (
                :id, :type, :slug, :title, :subtitle, :summary,
                :category_id, :category_name, :status, :severity,
                :is_featured, :is_breaking, :difficulty, :read_time_minutes,
                :views, :published_at, :created_at, :updated_at,
                :author_name, :author_role, :source_name, :source_url,
                :tldr_json, :takeaways_json, :references_json, :iocs_json,
                :body_markdown, :rendered_html, :payload_json
            )
            ON DUPLICATE KEY UPDATE
                title = VALUES(title),
                subtitle = VALUES(subtitle),
                summary = VALUES(summary),
                category_id = VALUES(category_id),
                category_name = VALUES(category_name),
                status = VALUES(status),
                severity = VALUES(severity),
                is_featured = VALUES(is_featured),
                is_breaking = VALUES(is_breaking),
                difficulty = VALUES(difficulty),
                read_time_minutes = VALUES(read_time_minutes),
                updated_at = VALUES(updated_at),
                author_name = VALUES(author_name),
                author_role = VALUES(author_role),
                source_name = VALUES(source_name),
                source_url = VALUES(source_url),
                tldr_json = VALUES(tldr_json),
                takeaways_json = VALUES(takeaways_json),
                references_json = VALUES(references_json),
                iocs_json = VALUES(iocs_json),
                body_markdown = VALUES(body_markdown),
                rendered_html = VALUES(rendered_html),
                payload_json = VALUES(payload_json)
        ");

        $params = [
            ':id' => $contentId,
            ':type' => $type,
            ':slug' => $slug,
            ':title' => $title,
            ':subtitle' => $subtitle,
            ':summary' => $summary,
            ':category_id' => $categoryId,
            ':category_name' => $categoryName,
            ':status' => $status,
            ':severity' => $severity,
            ':is_featured' => $isFeatured,
            ':is_breaking' => $isBreaking,
            ':difficulty' => $difficulty,
            ':read_time_minutes' => $readTimeMinutes,
            ':views' => $views,
            ':published_at' => $publishedAt,
            ':created_at' => $createdAt,
            ':updated_at' => $now,
            ':author_name' => $authorName,
            ':author_role' => $authorRole,
            ':source_name' => $sourceName,
            ':source_url' => $sourceUrl,
            ':tldr_json' => json_encode($tldr, JSON_UNESCAPED_UNICODE),
            ':takeaways_json' => json_encode($takeaways, JSON_UNESCAPED_UNICODE),
            ':references_json' => json_encode($references, JSON_UNESCAPED_UNICODE),
            ':iocs_json' => json_encode($iocs, JSON_UNESCAPED_UNICODE),
            ':body_markdown' => $bodyMarkdown,
            ':rendered_html' => $renderedHtml,
            ':payload_json' => json_encode($legacyPayload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ];

        // در صورت اجرای روی SQLite سینتکس متفاوتی استفاده می‌شود
        try {
            $upsertStmt->execute($params);
        } catch (Throwable $e) {
            // فال‌بک سازگار با SQLite
            $sqliteStmt = $pdo->prepare("
                INSERT OR REPLACE INTO roham_contents (
                    id, type, slug, title, subtitle, summary,
                    category_id, category_name, status, severity,
                    is_featured, is_breaking, difficulty, read_time_minutes,
                    views, published_at, created_at, updated_at,
                    author_name, author_role, source_name, source_url,
                    tldr_json, takeaways_json, references_json, iocs_json,
                    body_markdown, rendered_html, payload_json
                ) VALUES (
                    :id, :type, :slug, :title, :subtitle, :summary,
                    :category_id, :category_name, :status, :severity,
                    :is_featured, :is_breaking, :difficulty, :read_time_minutes,
                    :views, :published_at, :created_at, :updated_at,
                    :author_name, :author_role, :source_name, :source_url,
                    :tldr_json, :takeaways_json, :references_json, :iocs_json,
                    :body_markdown, :rendered_html, :payload_json
                )
            ");
            $sqliteStmt->execute($params);
        }

        // به‌روزرسانی جدول تگ‌ها (roham_tags و roham_content_tags)
        try {
            $delTags = $pdo->prepare("DELETE FROM roham_content_tags WHERE content_id = :cid");
            $delTags->execute([':cid' => $contentId]);

            $tagIns = $pdo->prepare("
                INSERT INTO roham_content_tags (content_id, tag_name)
                VALUES (:cid, :tag)
            ");

            foreach ($tags as $t) {
                $tagSlug = RohamSanitizer::cleanSlug($t);
                // ثبت تگ در جدول سراسری تگ‌ها
                try {
                    $globalTag = $pdo->prepare("INSERT INTO roham_tags (name, slug, created_at) VALUES (:n, :s, :c)");
                    $globalTag->execute([':n' => $t, ':s' => $tagSlug, ':c' => $now]);
                } catch (Throwable $e) {}

                try {
                    $tagIns->execute([':cid' => $contentId, ':tag' => $t]);
                } catch (Throwable $e) {}
            }
        } catch (Throwable $e) {
            error_log('Tags sync error: ' . $e->getMessage());
        }

        // همگام‌سازی موقت با جدول قدیمی roham_content برای جلوگیری از هرگونه ناهماهنگی
        try {
            $legacySync = $pdo->prepare("
                INSERT INTO roham_content (id, content_type, status, updated_at, payload_json)
                VALUES (:id, :type, :status, :now, :json)
                ON DUPLICATE KEY UPDATE
                    status = VALUES(status),
                    updated_at = VALUES(updated_at),
                    payload_json = VALUES(payload_json)
            ");
            $legacySync->execute([
                ':id' => $contentId,
                ':type' => $type,
                ':status' => $status,
                ':now' => $now,
                ':json' => json_encode($legacyPayload, JSON_UNESCAPED_UNICODE),
            ]);
        } catch (Throwable $e) {
            try {
                $sqLegacy = $pdo->prepare("
                    INSERT OR REPLACE INTO roham_content (id, content_type, status, updated_at, payload_json)
                    VALUES (:id, :type, :status, :now, :json)
                ");
                $sqLegacy->execute([
                    ':id' => $contentId,
                    ':type' => $type,
                    ':status' => $status,
                    ':now' => $now,
                    ':json' => json_encode($legacyPayload, JSON_UNESCAPED_UNICODE),
                ]);
            } catch (Throwable $e) {}
        }

        // ثبت گزارش حسابرسی (Audit Log)
        RohamAuditLogger::log(
            $pdo,
            $contentId,
            $existing ? 'update' : 'create',
            $authInfo['actorType'] ?? 'api_key',
            $authInfo['actorId'] ?? 'system',
            $idempotencyKey,
            ['title' => $title, 'slug' => $slug, 'type' => $type, 'status' => $status]
        );

        return [
            'id' => $contentId,
            'type' => $type,
            'slug' => $slug,
            'title' => $title,
            'status' => $status,
            'publishedAt' => $publishedAt,
            'views' => $views,
            'category' => $categoryInfo,
            'url' => ($type === 'blog' ? '/blog/' : '/radar/') . $slug,
            'stats' => [
                'bodyLength' => mb_strlen($bodyMarkdown),
                'readTimeMinutes' => $readTimeMinutes,
                'tagsCount' => count($tags),
            ],
            'payload' => $legacyPayload,
        ];
    }

    /**
     * نگاشت درخواست‌های قدیمی save_blog به ساختار جدید
     */
    public static function mapLegacyBlog(array $post): array {
        $bodyMarkdown = '';
        if (!empty($post['bodyMarkdown'])) {
            $bodyMarkdown = (string)$post['bodyMarkdown'];
        } elseif (isset($post['content']) && is_array($post['content'])) {
            $parts = [];
            if (!empty($post['content']['intro'])) {
                $parts[] = $post['content']['intro'];
            }
            if (isset($post['content']['sections']) && is_array($post['content']['sections'])) {
                foreach ($post['content']['sections'] as $sec) {
                    if (!empty($sec['heading'])) {
                        $parts[] = "\n## " . $sec['heading'] . "\n";
                    }
                    if (!empty($sec['paragraphs']) && is_array($sec['paragraphs'])) {
                        $parts[] = implode("\n\n", $sec['paragraphs']);
                    }
                    if (!empty($sec['codeSnippet'])) {
                        $lang = $sec['codeLanguage'] ?? '';
                        $parts[] = "```" . $lang . "\n" . $sec['codeSnippet'] . "\n```";
                    }
                    if (!empty($sec['callout'])) {
                        $parts[] = "> " . $sec['callout'];
                    }
                }
            }
            if (!empty($post['content']['conclusion'])) {
                $parts[] = "\n## نتیجه‌گیری و تحلیل نهایی\n\n" . $post['content']['conclusion'];
            }
            $bodyMarkdown = implode("\n\n", $parts);
        }

        return [
            'slug' => $post['slug'] ?? RohamSanitizer::cleanSlug(null, $post['title'] ?? ''),
            'title' => $post['title'] ?? '',
            'subtitle' => $post['subtitle'] ?? '',
            'summary' => $post['summary'] ?? '',
            'categoryId' => $post['categoryId'] ?? 'malware-infostealers',
            'tags' => $post['tags'] ?? ($post['keywords'] ?? []),
            'status' => $post['status'] ?? 'published',
            'publishedAt' => $post['publishedAt'] ?? gmdate('c'),
            'author' => [
                'name' => $post['author'] ?? 'واحد تحلیل بدافزار رهام',
                'role' => $post['authorRole'] ?? 'Roham Threat Research Labs',
            ],
            'difficulty' => $post['difficulty'] ?? 'متوسط',
            'readTimeMinutes' => (int)filter_var($post['readTime'] ?? '5', FILTER_SANITIZE_NUMBER_INT) ?: 5,
            'isFeatured' => !empty($post['isFeatured']),
            'tldr' => $post['tldr'] ?? [],
            'takeaways' => $post['content']['actionableTakeaways'] ?? ($post['takeaways'] ?? []),
            'references' => $post['content']['references'] ?? ($post['references'] ?? []),
            'bodyMarkdown' => $bodyMarkdown,
        ];
    }

    /**
     * نگاشت درخواست‌های قدیمی save_news به ساختار جدید
     */
    public static function mapLegacyNews(array $article): array {
        $bodyMarkdown = '';
        if (!empty($article['bodyMarkdown'])) {
            $bodyMarkdown = (string)$article['bodyMarkdown'];
        } elseif (isset($article['content']) && is_array($article['content'])) {
            $parts = [];
            if (!empty($article['content']['intro'])) {
                $parts[] = $article['content']['intro'];
            }
            $sections = $article['content']['sections'] ?? ($article['sections'] ?? []);
            if (is_array($sections)) {
                foreach ($sections as $sec) {
                    if (!empty($sec['heading'])) {
                        $parts[] = "\n## " . $sec['heading'] . "\n";
                    }
                    if (!empty($sec['paragraphs']) && is_array($sec['paragraphs'])) {
                        $parts[] = implode("\n\n", $sec['paragraphs']);
                    }
                    if (!empty($sec['codeSnippet'])) {
                        $lang = $sec['codeLanguage'] ?? '';
                        $parts[] = "```" . $lang . "\n" . $sec['codeSnippet'] . "\n```";
                    }
                }
            }
            if (!empty($article['content']['conclusion'])) {
                $parts[] = "\n## توصیه‌های پدافندی\n\n" . $article['content']['conclusion'];
            }
            $bodyMarkdown = implode("\n\n", $parts);
        }

        return [
            'slug' => $article['slug'] ?? RohamSanitizer::cleanSlug(null, $article['title'] ?? ''),
            'title' => $article['title'] ?? '',
            'subtitle' => $article['subtitle'] ?? '',
            'summary' => $article['summary'] ?? '',
            'categoryId' => $article['categoryId'] ?? 'security-alerts',
            'tags' => $article['tags'] ?? ($article['keywords'] ?? []),
            'severity' => $article['severity'] ?? 'HIGH',
            'isBreaking' => !empty($article['isBreaking']),
            'status' => $article['status'] ?? 'published',
            'publishedAt' => $article['publishedAt'] ?? gmdate('c'),
            'source' => [
                'name' => $article['source'] ?? 'Roham Threat Radar',
                'url' => $article['sourceUrl'] ?? '',
            ],
            'tldr' => $article['tldr'] ?? [],
            'iocs' => $article['iocs'] ?? [],
            'bodyMarkdown' => $bodyMarkdown,
        ];
    }

    /**
     * خواندن لیست محتوا از دیتابیس با پشتیبانی از هر دو فرمت جدید و سازگار
     */
    public static function listAll(PDO $pdo): array {
        $blogPosts = [];
        $newsArticles = [];
        $categories = [];

        try {
            // ۱. خواندن مقالات از جدول نرمال‌شده roham_contents در صورت وجود
            $hasContentsTable = false;
            try {
                $check = $pdo->query("SELECT COUNT(*) FROM roham_contents")->fetchColumn();
                $hasContentsTable = true;
            } catch (Throwable $e) {}

            if ($hasContentsTable) {
                $rows = $pdo->query("SELECT * FROM roham_contents ORDER BY published_at DESC, updated_at DESC")->fetchAll();
                foreach ($rows as $row) {
                    $item = null;
                    if (!empty($row['payload_json'])) {
                        $item = json_decode($row['payload_json'], true);
                    }
                    if (!is_array($item)) {
                        $item = [
                            'id' => $row['id'],
                            'type' => $row['type'],
                            'slug' => $row['slug'],
                            'title' => $row['title'],
                            'subtitle' => $row['subtitle'],
                            'summary' => $row['summary'],
                            'category' => $row['category_name'],
                            'categoryId' => $row['category_id'],
                            'readTime' => $row['read_time_minutes'] . ' دقیقه',
                            'readTimeMinutes' => (int)$row['read_time_minutes'],
                            'date' => self::formatPersianDate($row['published_at']),
                            'publishedAt' => $row['published_at'],
                            'updatedAt' => $row['updated_at'],
                            'author' => $row['author_name'],
                            'authorRole' => $row['author_role'],
                            'difficulty' => $row['difficulty'],
                            'status' => $row['status'],
                            'severity' => $row['severity'],
                            'isFeatured' => (bool)$row['is_featured'],
                            'isBreaking' => (bool)$row['is_breaking'],
                            'views' => (int)$row['views'],
                            'source' => $row['source_name'],
                            'sourceUrl' => $row['source_url'],
                            'bodyMarkdown' => $row['body_markdown'],
                            'renderedHtml' => $row['rendered_html'],
                            'tldr' => json_decode($row['tldr_json'] ?? '[]', true) ?: [],
                            'takeaways' => json_decode($row['takeaways_json'] ?? '[]', true) ?: [],
                            'references' => json_decode($row['references_json'] ?? '[]', true) ?: [],
                            'iocs' => json_decode($row['iocs_json'] ?? '[]', true) ?: [],
                        ];
                    }

                    if ($row['type'] === 'blog') {
                        $blogPosts[] = $item;
                    } elseif ($row['type'] === 'news') {
                        $newsArticles[] = $item;
                    }
                }
            }

            // اگر جدول جدید خالی بود، از جدول قدیمی roham_content بخواند
            if (empty($blogPosts) && empty($newsArticles)) {
                $oldRows = $pdo->query("SELECT * FROM roham_content ORDER BY updated_at DESC")->fetchAll();
                foreach ($oldRows as $or) {
                    $dec = json_decode($or['payload_json'] ?? '{}', true);
                    if (!is_array($dec)) continue;
                    if (($or['content_type'] ?? '') === 'blog') {
                        $blogPosts[] = $dec;
                    } else {
                        $newsArticles[] = $dec;
                    }
                }
            }

            // خواندن دسته‌بندی‌ها
            $catRows = $pdo->query("SELECT * FROM roham_categories ORDER BY updated_at DESC")->fetchAll();
            foreach ($catRows as $cr) {
                $categories[] = [
                    'id' => (string)$cr['id'],
                    'name' => (string)$cr['name'],
                    'slug' => (string)$cr['slug'],
                    'description' => (string)($cr['description'] ?? ''),
                    'targetType' => (string)($cr['target_type'] ?? 'all'),
                    'updatedAt' => (string)($cr['updated_at'] ?? ''),
                ];
            }
        } catch (Throwable $e) {
            error_log('List all content error: ' . $e->getMessage());
        }

        return [
            'blogPosts' => $blogPosts,
            'newsArticles' => $newsArticles,
            'categories' => $categories,
        ];
    }

    /**
     * تبدیل ساده تاریخ میلادی ISO 8601 به نمایش ماه و سال شمسی تقریبی
     */
    public static function formatPersianDate(string $isoDate): string {
        $ts = strtotime($isoDate);
        if ($ts === false) return 'اخیراً';
        $m = (int)date('n', $ts);
        $d = (int)date('j', $ts);
        $persianMonths = [
            1 => 'دی', 2 => 'بهمن', 3 => 'اسفند',
            4 => 'فروردین', 5 => 'اردیبهشت', 6 => 'خرداد',
            7 => 'تیر', 8 => 'مرداد', 9 => 'شهریور',
            10 => 'مهر', 11 => 'آبان', 12 => 'آذر'
        ];
        return $d . ' ' . ($persianMonths[$m] ?? '') . ' ۱۴۰۵';
    }

    /**
     * مشخصات OpenAPI 3.1
     */
    public static function getOpenApiSpec(): array {
        return [
            'openapi' => '3.1.0',
            'info' => [
                'title' => 'Roham Cyber Security Portal — Content Ingestion & AI Posting API',
                'version' => '2.0.0',
                'description' => 'API استاندارد و یکپارچه انتشار مقالات وبلاگ و اخبار رادار تهدیدات امنیتی پرتال رهام با فرمت مدرن Markdown + متادیتا',
                'contact' => [
                    'name' => 'Roham Security Engineering Team',
                    'url' => 'https://roham.org',
                ],
            ],
            'servers' => [
                ['url' => '/api/content.php', 'description' => 'Production API Endpoint'],
            ],
            'components' => [
                'securitySchemes' => [
                    'ApiKeyAuth' => [
                        'type' => 'apiKey',
                        'in' => 'header',
                        'name' => 'X-API-KEY',
                        'description' => 'کلید محرمانه اختصاصی انتشار خودکار هوش مصنوعی و بات‌ها',
                    ],
                    'BearerAuth' => [
                        'type' => 'http',
                        'scheme' => 'bearer',
                        'bearerFormat' => 'JWT',
                        'description' => 'توکن ورود مدیر ارشد سامانه',
                    ],
                ],
            ],
            'paths' => [
                '/api/content.php' => [
                    'post' => [
                        'summary' => 'ثبت، ویرایش و انتشار مقاله وبلاگ یا خبر امنیتی (Upsert)',
                        'security' => [['ApiKeyAuth' => []], ['BearerAuth' => []]],
                        'parameters' => [
                            [
                                'name' => 'Idempotency-Key',
                                'in' => 'header',
                                'required' => false,
                                'schema' => ['type' => 'string'],
                                'description' => 'کلید یکتایی درخواست جهت جلوگیری از دوباره‌کاری در صورت قطع اتصال',
                            ],
                        ],
                        'requestBody' => [
                            'required' => true,
                            'content' => [
                                'application/json' => [
                                    'schema' => [
                                        'type' => 'object',
                                        'required' => ['action', 'type', 'content'],
                                        'properties' => [
                                            'action' => ['type' => 'string', 'enum' => ['upsert_content']],
                                            'type' => ['type' => 'string', 'enum' => ['blog', 'news']],
                                            'content' => [
                                                'type' => 'object',
                                                'required' => ['title', 'summary', 'bodyMarkdown'],
                                                'properties' => [
                                                    'slug' => ['type' => 'string'],
                                                    'title' => ['type' => 'string'],
                                                    'subtitle' => ['type' => 'string'],
                                                    'summary' => ['type' => 'string'],
                                                    'categoryId' => ['type' => 'string'],
                                                    'tags' => ['type' => 'array', 'items' => ['type' => 'string']],
                                                    'status' => ['type' => 'string', 'enum' => ['published', 'draft', 'archived']],
                                                    'publishedAt' => ['type' => 'string', 'format' => 'date-time'],
                                                    'difficulty' => ['type' => 'string'],
                                                    'readTimeMinutes' => ['type' => 'integer'],
                                                    'isFeatured' => ['type' => 'boolean'],
                                                    'severity' => ['type' => 'string', 'enum' => ['critical', 'high', 'medium', 'low', 'info']],
                                                    'isBreaking' => ['type' => 'boolean'],
                                                    'bodyMarkdown' => ['type' => 'string'],
                                                ],
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                        'responses' => [
                            '200' => ['description' => 'محتوا با موفقیت منتشر یا ویرایش شد.'],
                            '400' => ['description' => 'خطای اعتبارسنجی ورودی.'],
                            '403' => ['description' => 'دسترسی غیرمجاز.'],
                            '429' => ['description' => 'محدودیت نرخ ارسال درخواست.'],
                        ],
                    ],
                ],
            ],
        ];
    }

    /**
     * مشخصات JSON Schema برای اعتبارسنجی طرف کلاینت
     */
    public static function getJsonSchema(): array {
        return [
            '$schema' => 'https://json-schema.org/draft/2020-12/schema',
            'title' => 'RohamUpsertContentPayload',
            'type' => 'object',
            'required' => ['action', 'type', 'content'],
            'properties' => [
                'action' => [
                    'type' => 'string',
                    'const' => 'upsert_content',
                ],
                'type' => [
                    'type' => 'string',
                    'enum' => ['blog', 'news'],
                ],
                'idempotencyKey' => [
                    'type' => 'string',
                ],
                'content' => [
                    'type' => 'object',
                    'required' => ['title', 'summary', 'bodyMarkdown'],
                    'properties' => [
                        'slug' => ['type' => 'string', 'pattern' => '^[a-z0-9\\-_]+$'],
                        'title' => ['type' => 'string', 'minLength' => 5],
                        'subtitle' => ['type' => 'string'],
                        'summary' => ['type' => 'string', 'minLength' => 10],
                        'categoryId' => ['type' => 'string'],
                        'tags' => [
                            'type' => 'array',
                            'items' => ['type' => 'string'],
                        ],
                        'status' => [
                            'type' => 'string',
                            'enum' => ['published', 'draft', 'archived'],
                            'default' => 'published',
                        ],
                        'publishedAt' => [
                            'type' => 'string',
                            'format' => 'date-time',
                        ],
                        'author' => [
                            'oneOf' => [
                                ['type' => 'string'],
                                [
                                    'type' => 'object',
                                    'properties' => [
                                        'name' => ['type' => 'string'],
                                        'role' => ['type' => 'string'],
                                    ],
                                ],
                            ],
                        ],
                        'difficulty' => ['type' => 'string'],
                        'readTimeMinutes' => ['type' => 'integer', 'minimum' => 1],
                        'isFeatured' => ['type' => 'boolean'],
                        'severity' => [
                            'type' => 'string',
                            'enum' => ['critical', 'high', 'medium', 'low', 'info', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'],
                        ],
                        'isBreaking' => ['type' => 'boolean'],
                        'source' => [
                            'oneOf' => [
                                ['type' => 'string'],
                                [
                                    'type' => 'object',
                                    'properties' => [
                                        'name' => ['type' => 'string'],
                                        'url' => ['type' => 'string'],
                                    ],
                                ],
                            ],
                        ],
                        'tldr' => [
                            'type' => 'array',
                            'items' => ['type' => 'string'],
                        ],
                        'takeaways' => [
                            'type' => 'array',
                            'items' => ['type' => 'string'],
                        ],
                        'references' => [
                            'type' => 'array',
                            'items' => [
                                'type' => 'object',
                                'required' => ['title', 'url'],
                                'properties' => [
                                    'title' => ['type' => 'string'],
                                    'url' => ['type' => 'string'],
                                ],
                            ],
                        ],
                        'iocs' => [
                            'type' => 'array',
                            'items' => [
                                'type' => 'object',
                                'required' => ['type', 'value'],
                                'properties' => [
                                    'type' => ['type' => 'string'],
                                    'value' => ['type' => 'string'],
                                    'description' => ['type' => 'string'],
                                ],
                            ],
                        ],
                        'bodyMarkdown' => [
                            'type' => 'string',
                            'minLength' => 10,
                        ],
                    ],
                ],
            ],
        ];
    }

    /**
     * مهاجرت داده‌های قدیمی جدول roham_content به جدول نرمال‌شده roham_contents
     */
    public static function runMigration(PDO $pdo): array {
        $migratedCount = 0;
        $errors = [];

        try {
            $rows = $pdo->query("SELECT * FROM roham_content")->fetchAll();
            foreach ($rows as $r) {
                $payload = json_decode($r['payload_json'] ?? '{}', true);
                if (!is_array($payload) || empty($payload['title'])) continue;

                $type = ($r['content_type'] ?? '') === 'blog' ? 'blog' : 'news';
                $normalized = $type === 'blog' ? self::mapLegacyBlog($payload) : self::mapLegacyNews($payload);

                try {
                    self::upsert($pdo, $type, $normalized, [
                        'actorType' => 'system_migration',
                        'actorId' => 'migrate.php',
                    ]);
                    $migratedCount++;
                } catch (Throwable $e) {
                    $errors[] = "Error migrating item {$r['id']}: " . $e->getMessage();
                }
            }
        } catch (Throwable $e) {
            $errors[] = "Migration failed: " . $e->getMessage();
        }

        return [
            'success' => empty($errors),
            'migratedCount' => $migratedCount,
            'errors' => $errors,
        ];
    }
}
