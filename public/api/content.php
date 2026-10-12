<?php
/**
 * Roham Security & Technical Portal — Unified Content Management & Ingestion API (v2)
 * مسير: /api/content.php
 *
 * مشخصات:
 *  - طراحی استاندارد بر پایه «متادیتا + bodyMarkdown»
 *  - اکشن واحد و یکپارچه `upsert_content` برای مقالات وبلاگ و اخبار رادار
 *  - سازگاری موقت و خودکار با اکشن‌های قدیمی `save_blog` و `save_news`
 *  - رندر امن Markdown به HTML به همراه فیلتر ضد XSS
 *  - پشتیبانی از Idempotency-Key
 *  - ثبت وقایع در Audit Log
 *  - محدودسازی نرخ درخواست (Rate Limiting)
 *  - استانداردسازی کامل پاسخ‌های سرور
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/content-service.php';

$driver = null;
$pdo = roham_get_pdo($driver);
$input = roham_get_input();
$action = $_GET['action'] ?? ($input['action'] ?? 'list');

/**
 * ارسال پاسخ استاندارد موفق
 */
function roham_send_success($data, string $actionName, ?string $idempotencyKey = null, int $status = 200, array $extraHeaders = []): void {
    foreach ($extraHeaders as $k => $v) {
        header("{$k}: {$v}");
    }
    $response = [
        'success' => true,
        'ok' => true,
        'data' => $data,
        'meta' => [
            'timestamp' => gmdate('c'),
            'version' => '2.0.0',
            'action' => $actionName,
            'idempotencyKey' => $idempotencyKey,
        ],
    ];

    // در حالت لیست برای سازگاری حداکثری با کلاینت‌های قدیمی فیلدها را در ریشه هم قرار می‌دهیم
    if (is_array($data) && isset($data['blogPosts'])) {
        $response['blogPosts'] = $data['blogPosts'];
        $response['newsArticles'] = $data['newsArticles'] ?? [];
        $response['categories'] = $data['categories'] ?? [];
    }

    roham_respond($response, $status);
}

/**
 * ارسال پاسخ استاندارد خطا
 */
function roham_send_error(string $code, string $message, $details = null, int $status = 400, array $extraHeaders = []): void {
    foreach ($extraHeaders as $k => $v) {
        header("{$k}: {$v}");
    }
    $response = [
        'success' => false,
        'ok' => false,
        'error' => [
            'code' => $code,
            'message' => $message,
            'details' => $details,
        ],
        'meta' => [
            'timestamp' => gmdate('c'),
            'version' => '2.0.0',
        ],
    ];
    roham_respond($response, $status);
}

// --------------------------------------------------------------------------
// اندپوینت‌های عمومی بدون نیاز به احراز هویت (Public Endpoints)
// --------------------------------------------------------------------------

// ۱. دریافت اسکیما جهت اعتبارسنجی خودکار در ایجنت‌های هوش مصنوعی
if ($action === 'schema') {
    roham_send_success(RohamContentService::getJsonSchema(), 'schema');
}

// ۲. دریافت مشخصات کامل OpenAPI 3.1
if ($action === 'openapi') {
    roham_send_success(RohamContentService::getOpenApiSpec(), 'openapi');
}

// ۳. دریافت لیست مقالات وبلاگ، اخبار و دسته‌بندی‌ها
if ($action === 'list' || $action === 'list_contents') {
    if ($pdo === null) {
        roham_send_error('DB_UNAVAILABLE', 'پایگاه داده در دسترس نیست.', null, 503);
    }
    $data = RohamContentService::listAll($pdo);
    roham_send_success($data, 'list');
}

// ۴. دریافت جزئیات یک محتوا بر اساس Slug یا ID
if ($action === 'get_content') {
    $slugOrId = trim((string)($_GET['slug'] ?? ($input['slug'] ?? ($_GET['id'] ?? ($input['id'] ?? '')))));
    if ($slugOrId === '') {
        roham_send_error('MISSING_PARAMETER', 'پارامتر slug یا id الزامی است.', null, 400);
    }
    if ($pdo === null) {
        roham_send_error('DB_UNAVAILABLE', 'پایگاه داده در دسترس نیست.', null, 503);
    }

    $stmt = $pdo->prepare("SELECT * FROM roham_contents WHERE slug = :s OR id = :i LIMIT 1");
    $stmt->execute([':s' => $slugOrId, ':i' => $slugOrId]);
    $row = $stmt->fetch();
    if (!$row) {
        roham_send_error('NOT_FOUND', 'محتوای مورد نظر یافت نشد.', null, 404);
    }

    $payload = json_decode($row['payload_json'] ?? '{}', true);
    roham_send_success($payload ?: $row, 'get_content');
}

// ۵. ثبت بازدید مقاله یا خبر
if ($action === 'view') {
    $idOrSlug = trim((string)($input['id'] ?? ($_GET['id'] ?? ($input['slug'] ?? ''))));
    if ($idOrSlug !== '' && $pdo !== null) {
        try {
            $upd = $pdo->prepare("UPDATE roham_contents SET views = views + 1 WHERE id = :i OR slug = :s");
            $upd->execute([':i' => $idOrSlug, ':s' => $idOrSlug]);

            // همچنین در جدول قدیمی
            $updOld = $pdo->prepare("SELECT id, payload_json FROM roham_content WHERE id = :i LIMIT 1");
            $updOld->execute([':i' => $idOrSlug]);
            $oldRow = $updOld->fetch();
            if ($oldRow) {
                $dec = json_decode($oldRow['payload_json'] ?? '{}', true);
                if (is_array($dec)) {
                    $dec['views'] = (int)($dec['views'] ?? 0) + 1;
                    $updRow = $pdo->prepare("UPDATE roham_content SET payload_json = :pj WHERE id = :id");
                    $updRow->execute([':pj' => json_encode($dec, JSON_UNESCAPED_UNICODE), ':id' => $oldRow['id']]);
                }
            }
        } catch (Throwable $e) {}
    }
    roham_send_success(['viewCounted' => true], 'view');
}

// ۶. بذردهی خودکار جدول در صورتی که تازه راه‌اندازی شده باشد
if ($action === 'seed_if_empty') {
    if ($pdo !== null) {
        try {
            $count = (int)$pdo->query("SELECT COUNT(*) FROM roham_contents")->fetchColumn();
            if ($count === 0) {
                foreach (($input['blogPosts'] ?? []) as $bp) {
                    if (is_array($bp) && !empty($bp['title'])) {
                        $mapped = RohamContentService::mapLegacyBlog($bp);
                        RohamContentService::upsert($pdo, 'blog', $mapped, ['actorType' => 'system_seed', 'actorId' => 'seed_if_empty']);
                    }
                }
                foreach (($input['newsArticles'] ?? []) as $na) {
                    if (is_array($na) && !empty($na['title'])) {
                        $mapped = RohamContentService::mapLegacyNews($na);
                        RohamContentService::upsert($pdo, 'news', $mapped, ['actorType' => 'system_seed', 'actorId' => 'seed_if_empty']);
                    }
                }
            }
        } catch (Throwable $e) {
            error_log('Roham content seed error: ' . $e->getMessage());
        }
    }
    roham_send_success(['seeded' => true], 'seed_if_empty');
}

// --------------------------------------------------------------------------
// بخش احراز هویت (Authentication & Rate Limiting)
// --------------------------------------------------------------------------

$providedApiKey = $_SERVER['HTTP_X_API_KEY'] ?? ($input['api_key'] ?? ($_GET['api_key'] ?? ''));
$isAiKeyValid = (defined('ROHAM_AI_POSTING_KEY') && !empty($providedApiKey) && hash_equals(ROHAM_AI_POSTING_KEY, $providedApiKey));
$authInfo = [
    'actorType' => 'unauthenticated',
    'actorId' => 'anonymous',
];

if ($isAiKeyValid) {
    $authInfo['actorType'] = 'api_key';
    $authInfo['actorId'] = 'ai_publisher_bot';
} else {
    $db = roham_load_db();
    $auth = roham_require_auth($db);
    $currentUser = $auth['user'];

    if (($currentUser['role'] ?? 'user') !== 'admin') {
        roham_send_error('FORBIDDEN', 'دسترسی غیرمجاز: فقط مدیر ارشد یا بات‌های مجاز با کلید API می‌توانند محتوا منتشر یا ویرایش کنند.', null, 403);
    }
    $authInfo['actorType'] = 'admin_user';
    $authInfo['actorId'] = (string)($currentUser['username'] ?? $currentUser['id']);
}

// بررسی نرخ ارسال درخواست (Rate Limiting)
$rateLimitKey = $authInfo['actorType'] === 'api_key' ? ('api_' . md5($providedApiKey)) : ('admin_' . $authInfo['actorId']);
$rateLimitMax = $authInfo['actorType'] === 'api_key' ? 60 : 120; // 60 در دقیقه برای بات، 120 برای ادمین
$rateCheck = RohamRateLimiter::enforce($pdo, $rateLimitKey, $rateLimitMax, 60);

header('X-RateLimit-Limit: ' . $rateCheck['limit']);
header('X-RateLimit-Remaining: ' . $rateCheck['remaining']);

if (!$rateCheck['allowed']) {
    roham_send_error(
        'RATE_LIMIT_EXCEEDED',
        'تعداد درخواست‌های ارسالی بیش از سقف مجاز است. لطفاً کمی صبر کرده و مجدداً تلاش کنید.',
        ['retryAfterSeconds' => $rateCheck['reset']],
        429,
        ['Retry-After' => (string)$rateCheck['reset']]
    );
}

// --------------------------------------------------------------------------
// مدیریت Idempotency برای عملیات نوشتن
// --------------------------------------------------------------------------

$idempotencyKey = $_SERVER['HTTP_IDEMPOTENCY_KEY'] ?? ($input['idempotencyKey'] ?? null);
if ($idempotencyKey !== null) {
    $idempotencyKey = trim((string)$idempotencyKey);
    $cached = RohamIdempotency::check($pdo, $idempotencyKey);
    if ($cached !== null) {
        header('X-Idempotency: HIT');
        roham_respond($cached['response'], $cached['code']);
    }
}

// --------------------------------------------------------------------------
// ۷. اکشن یکپارچه و استاندارد انتشار محتوا: `upsert_content`
// --------------------------------------------------------------------------

if ($action === 'upsert_content') {
    $type = trim((string)($input['type'] ?? 'blog'));
    $content = $input['content'] ?? null;

    if (!is_array($content)) {
        roham_send_error('INVALID_PAYLOAD', 'فیلد content باید یک شیء (Object) معتبر حاوی متادیتا و bodyMarkdown باشد.', null, 400);
    }

    $errors = RohamContentService::validate($type, $content);
    if (!empty($errors)) {
        roham_send_error('VALIDATION_FAILED', 'اطلاعات ارسالی با ساختار استاندارد مطابقت ندارد.', $errors, 400);
    }

    try {
        $result = RohamContentService::upsert($pdo, $type, $content, $authInfo, $idempotencyKey);

        $responseBody = [
            'success' => true,
            'ok' => true,
            'message' => ($type === 'blog' ? 'مقاله تخصصی وبلاگ' : 'خبر امنیتی رادار') . ' با موفقیت ذخیره و منتشر شد.',
            'data' => $result,
            'meta' => [
                'timestamp' => gmdate('c'),
                'version' => '2.0.0',
                'action' => 'upsert_content',
                'idempotencyKey' => $idempotencyKey,
            ],
        ];

        if ($idempotencyKey !== null) {
            RohamIdempotency::save($pdo, $idempotencyKey, 'upsert_content', 200, $responseBody);
            header('X-Idempotency: STORED');
        }

        roham_respond($responseBody, 200);
    } catch (Throwable $e) {
        error_log('Roham upsert error: ' . $e->getMessage());
        roham_send_error('INTERNAL_SERVER_ERROR', 'خطا در ذخیره‌سازی محتوا در پایگاه داده: ' . $e->getMessage(), null, 500);
    }
}

// --------------------------------------------------------------------------
// ۸. نگاشت و سازگاری موقت با اکشن‌های قدیمی: `save_blog` و `save_news`
// --------------------------------------------------------------------------

if ($action === 'save_blog') {
    $post = $input['post'] ?? null;
    if (!is_array($post) || empty($post['title'])) {
        roham_send_error('INVALID_PAYLOAD', 'اطلاعات مقاله وبلاگ ناقص است (فیلد post و title الزامی هستند).', null, 400);
    }

    $normalized = RohamContentService::mapLegacyBlog($post);
    try {
        $result = RohamContentService::upsert($pdo, 'blog', $normalized, $authInfo, $idempotencyKey);
        $responseBody = [
            'success' => true,
            'ok' => true,
            'message' => 'مقاله وبلاگ با موفقیت در دیتابیس ذخیره و منتشر شد (Legacy Mapped).',
            'data' => $result,
        ];
        if ($idempotencyKey !== null) {
            RohamIdempotency::save($pdo, $idempotencyKey, 'save_blog', 200, $responseBody);
        }
        roham_respond($responseBody, 200);
    } catch (Throwable $e) {
        roham_send_error('INTERNAL_SERVER_ERROR', 'خطا در ذخیره مقاله وبلاگ: ' . $e->getMessage(), null, 500);
    }
}

if ($action === 'save_news') {
    $article = $input['article'] ?? null;
    if (!is_array($article) || empty($article['title'])) {
        roham_send_error('INVALID_PAYLOAD', 'اطلاعات خبر امنیتی ناقص است (فیلد article و title الزامی هستند).', null, 400);
    }

    $normalized = RohamContentService::mapLegacyNews($article);
    try {
        $result = RohamContentService::upsert($pdo, 'news', $normalized, $authInfo, $idempotencyKey);
        $responseBody = [
            'success' => true,
            'ok' => true,
            'message' => 'خبر امنیتی با موفقیت در دیتابیس ذخیره و منتشر شد (Legacy Mapped).',
            'data' => $result,
        ];
        if ($idempotencyKey !== null) {
            RohamIdempotency::save($pdo, $idempotencyKey, 'save_news', 200, $responseBody);
        }
        roham_respond($responseBody, 200);
    } catch (Throwable $e) {
        roham_send_error('INTERNAL_SERVER_ERROR', 'خطا در ذخیره خبر: ' . $e->getMessage(), null, 500);
    }
}

// --------------------------------------------------------------------------
// ۹. حذف محتوا (Unified Delete & Legacy Actions)
// --------------------------------------------------------------------------

if ($action === 'delete_content' || $action === 'delete_blog' || $action === 'delete_news') {
    $idOrSlug = trim((string)($input['id'] ?? ($_GET['id'] ?? ($input['slug'] ?? ''))));
    if ($idOrSlug === '') {
        roham_send_error('MISSING_PARAMETER', 'شناسه id یا slug جهت حذف الزامی است.', null, 400);
    }

    try {
        $delContents = $pdo->prepare("DELETE FROM roham_contents WHERE id = :id OR slug = :slug");
        $delContents->execute([':id' => $idOrSlug, ':slug' => $idOrSlug]);

        $delTags = $pdo->prepare("DELETE FROM roham_content_tags WHERE content_id = :id");
        $delTags->execute([':id' => $idOrSlug]);

        $delLegacy = $pdo->prepare("DELETE FROM roham_content WHERE id = :id");
        $delLegacy->execute([':id' => $idOrSlug]);

        RohamAuditLogger::log($pdo, $idOrSlug, 'delete', $authInfo['actorType'], $authInfo['actorId'], $idempotencyKey);

        roham_send_success(['deleted' => true, 'id' => $idOrSlug], $action);
    } catch (Throwable $e) {
        roham_send_error('INTERNAL_SERVER_ERROR', 'خطا در حذف محتوا: ' . $e->getMessage(), null, 500);
    }
}

// --------------------------------------------------------------------------
// ۱۰. مدیریت دسته‌بندی‌ها (Categories CRUD)
// --------------------------------------------------------------------------

if ($action === 'save_category') {
    $category = $input['category'] ?? null;
    if (!is_array($category) || empty($category['name'])) {
        roham_send_error('INVALID_PAYLOAD', 'نام دسته‌بندی الزامی است.', null, 400);
    }

    $name = RohamSanitizer::cleanText($category['name']);
    $id = trim((string)($category['id'] ?? 'cat-' . substr(md5(uniqid()), 0, 8)));
    $slug = RohamSanitizer::cleanSlug($category['slug'] ?? null, $name);
    $description = RohamSanitizer::cleanText($category['description'] ?? '');
    $targetType = trim((string)($category['targetType'] ?? 'all'));
    $now = gmdate('c');

    try {
        $stmt = $pdo->prepare("
            INSERT INTO roham_categories (id, name, slug, description, target_type, updated_at)
            VALUES (:id, :name, :slug, :description, :target_type, :updated_at)
            ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                slug = VALUES(slug),
                description = VALUES(description),
                target_type = VALUES(target_type),
                updated_at = VALUES(updated_at)
        ");
        $stmt->execute([
            ':id' => $id,
            ':name' => $name,
            ':slug' => $slug,
            ':description' => $description,
            ':target_type' => $targetType,
            ':updated_at' => $now,
        ]);
        roham_send_success(['id' => $id, 'slug' => $slug, 'name' => $name], 'save_category');
    } catch (Throwable $e) {
        // SQLite fallback
        try {
            $sqlStmt = $pdo->prepare("
                INSERT OR REPLACE INTO roham_categories (id, name, slug, description, target_type, updated_at)
                VALUES (:id, :name, :slug, :description, :target_type, :updated_at)
            ");
            $sqlStmt->execute([
                ':id' => $id,
                ':name' => $name,
                ':slug' => $slug,
                ':description' => $description,
                ':target_type' => $targetType,
                ':updated_at' => $now,
            ]);
            roham_send_success(['id' => $id, 'slug' => $slug, 'name' => $name], 'save_category');
        } catch (Throwable $ex) {
            roham_send_error('INTERNAL_SERVER_ERROR', 'خطا در ذخیره دسته‌بندی: ' . $ex->getMessage(), null, 500);
        }
    }
}

if ($action === 'delete_category') {
    $id = trim((string)($input['id'] ?? ($_GET['id'] ?? '')));
    if ($id !== '' && $pdo !== null) {
        $stmt = $pdo->prepare("DELETE FROM roham_categories WHERE id = :id");
        $stmt->execute([':id' => $id]);
    }
    roham_send_success(['deleted' => true, 'id' => $id], 'delete_category');
}

// --------------------------------------------------------------------------
// ۱۱. اسکریپت مهاجرت داخلی (Data Migration Action)
// --------------------------------------------------------------------------

if ($action === 'migrate') {
    if ($pdo === null) {
        roham_send_error('DB_UNAVAILABLE', 'پایگاه داده در دسترس نیست.', null, 503);
    }
    $migrationResult = RohamContentService::runMigration($pdo);
    roham_send_success($migrationResult, 'migrate');
}

// ۱۲. دریافت گزارش‌های لاگ حسابرسی (Audit Logs)
if ($action === 'audit_logs') {
    if ($pdo === null) {
        roham_send_error('DB_UNAVAILABLE', 'پایگاه داده در دسترس نیست.', null, 503);
    }
    $limit = min(100, max(1, (int)($_GET['limit'] ?? 50)));
    $stmt = $pdo->prepare("SELECT * FROM roham_content_audit_logs ORDER BY created_at DESC LIMIT :l");
    $stmt->bindValue(':l', $limit, PDO::PARAM_INT);
    $stmt->execute();
    $logs = $stmt->fetchAll();
    roham_send_success($logs, 'audit_logs');
}

// ۱۳. بازنشانی مقالات پیش‌فرض
if ($action === 'reset_defaults') {
    if ($pdo !== null) {
        try {
            $pdo->exec("DELETE FROM roham_contents");
            $pdo->exec("DELETE FROM roham_content");
            $pdo->exec("DELETE FROM roham_content_tags");
            foreach (($input['blogPosts'] ?? []) as $bp) {
                if (is_array($bp) && !empty($bp['title'])) {
                    $m = RohamContentService::mapLegacyBlog($bp);
                    RohamContentService::upsert($pdo, 'blog', $m, ['actorType' => 'admin_reset', 'actorId' => $authInfo['actorId']]);
                }
            }
            foreach (($input['newsArticles'] ?? []) as $na) {
                if (is_array($na) && !empty($na['title'])) {
                    $m = RohamContentService::mapLegacyNews($na);
                    RohamContentService::upsert($pdo, 'news', $m, ['actorType' => 'admin_reset', 'actorId' => $authInfo['actorId']]);
                }
            }
        } catch (Throwable $e) {
            roham_send_error('INTERNAL_SERVER_ERROR', 'خطا در بازنشانی: ' . $e->getMessage(), null, 500);
        }
    }
    roham_send_success(['reset' => true], 'reset_defaults');
}

roham_send_error('INVALID_ACTION', 'عملیات درخواستی نامعتبر است: ' . htmlspecialchars($action), null, 400);
