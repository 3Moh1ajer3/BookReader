<?php
/**
 * Roham Dynamic Blog & Security News CMS Endpoint (cPanel MySQL PHP)
 * مسیر: /api/content.php
 * پشتیبانی از ذخیره، ویرایش، حذف، شمارش بازدید و بازنشانی مقالات وبلاگ فنی و اخبار رادار تهدیدات در جدول `roham_content`
 */

require_once __DIR__ . '/db.php';

$action = $_GET['action'] ?? 'list';
$input = roham_get_input();
$driver = null;
$pdo = roham_get_pdo($driver);

function roham_upsert_content_row(?PDO $pdo, ?string $driver, string $id, string $contentType, string $status, array $payload): bool {
    $now = gmdate('c');
    $json = json_encode($payload, JSON_UNESCAPED_UNICODE);
    if ($pdo !== null) {
        try {
            if ($driver === 'mysql') {
                $stmt = $pdo->prepare("
                    INSERT INTO roham_content (id, content_type, status, updated_at, payload_json)
                    VALUES (:id, :content_type, :status, :updated_at, :payload_json)
                    ON DUPLICATE KEY UPDATE
                        status = VALUES(status),
                        updated_at = VALUES(updated_at),
                        payload_json = VALUES(payload_json)
                ");
            } else {
                $stmt = $pdo->prepare("
                    INSERT OR REPLACE INTO roham_content (id, content_type, status, updated_at, payload_json)
                    VALUES (:id, :content_type, :status, :updated_at, :payload_json)
                ");
            }
            return $stmt->execute([
                ':id' => $id,
                ':content_type' => $contentType,
                ':status' => $status,
                ':updated_at' => $now,
                ':payload_json' => $json,
            ]);
        } catch (Throwable $e) {
            error_log('Roham content upsert error: ' . $e->getMessage());
        }
    }
    return false;
}

// ۱. دریافت لیست مقالات وبلاگ، اخبار و دسته‌بندی‌ها
if ($action === 'list') {
    $blogPosts = [];
    $newsArticles = [];
    $categories = [];

    if ($pdo !== null) {
        try {
            $rows = $pdo->query("SELECT * FROM roham_content ORDER BY updated_at DESC")->fetchAll();
            foreach ($rows as $row) {
                $decoded = json_decode($row['payload_json'] ?? '{}', true);
                if (!is_array($decoded)) continue;
                if (($row['content_type'] ?? '') === 'blog') {
                    $blogPosts[] = $decoded;
                } elseif (($row['content_type'] ?? '') === 'news') {
                    $newsArticles[] = $decoded;
                }
            }

            // واکشی دسته‌بندی‌ها
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
            error_log('Roham content list error: ' . $e->getMessage());
        }
    }

    roham_respond([
        'ok' => true,
        'blogPosts' => $blogPosts,
        'newsArticles' => $newsArticles,
        'categories' => $categories,
    ]);
}

// ۲. Seed اولیه خودکار جدول در صورتی که تازه روی هاست ساخته شده باشد
if ($action === 'seed_if_empty') {
    if ($pdo !== null) {
        try {
            $count = (int)$pdo->query("SELECT COUNT(*) FROM roham_content")->fetchColumn();
            if ($count === 0) {
                foreach (($input['blogPosts'] ?? []) as $bp) {
                    if (is_array($bp) && !empty($bp['id'])) {
                        roham_upsert_content_row($pdo, $driver, (string)$bp['id'], 'blog', (string)($bp['status'] ?? 'published'), $bp);
                    }
                }
                foreach (($input['newsArticles'] ?? []) as $na) {
                    if (is_array($na) && !empty($na['id'])) {
                        roham_upsert_content_row($pdo, $driver, (string)$na['id'], 'news', (string)($na['status'] ?? 'published'), $na);
                    }
                }
            }
        } catch (Throwable $e) {
            error_log('Roham content seed error: ' . $e->getMessage());
        }
    }
    roham_respond(['ok' => true]);
}

// ۳. ثبت بازدید مقاله یا خبر
if ($action === 'view') {
    $id = trim((string)($input['id'] ?? ''));
    if ($id !== '' && $pdo !== null) {
        try {
            $stmt = $pdo->prepare("SELECT * FROM roham_content WHERE id = :id LIMIT 1");
            $stmt->execute([':id' => $id]);
            $row = $stmt->fetch();
            if ($row) {
                $decoded = json_decode($row['payload_json'] ?? '{}', true);
                if (is_array($decoded)) {
                    $decoded['views'] = (int)($decoded['views'] ?? 0) + 1;
                    $upd = $pdo->prepare("UPDATE roham_content SET payload_json = :payload_json WHERE id = :id");
                    $upd->execute([
                        ':payload_json' => json_encode($decoded, JSON_UNESCAPED_UNICODE),
                        ':id' => $id,
                    ]);
                }
            }
        } catch (Throwable $e) {
            error_log('Roham content view error: ' . $e->getMessage());
        }
    }
    roham_respond(['ok' => true]);
}

// از اینجا به بعد نیازمند احراز هویت مدیر ارشد (Admin) یا کلید اختصاصی انتشار هوش مصنوعی است
$providedApiKey = $_SERVER['HTTP_X_API_KEY'] ?? ($input['api_key'] ?? ($_GET['api_key'] ?? ''));
$isAiKeyValid = (defined('ROHAM_AI_POSTING_KEY') && !empty($providedApiKey) && hash_equals(ROHAM_AI_POSTING_KEY, $providedApiKey));

if (!$isAiKeyValid) {
    $db = roham_load_db();
    $auth = roham_require_auth($db);
    $currentUser = $auth['user'];

    if (($currentUser['role'] ?? 'user') !== 'admin') {
        roham_respond(['ok' => false, 'error' => 'دسترسی غیرمجاز: فقط مدیر ارشد یا ربات‌های مجاز با کلید API می‌توانند محتوا منتشر کنند.'], 403);
    }
}

// ۴. ذخیره یا ویرایش مقاله وبلاگ فنی
if ($action === 'save_blog') {
    $post = $input['post'] ?? null;
    if (!is_array($post) || empty($post['id']) || empty($post['title'])) {
        roham_respond(['ok' => false, 'error' => 'اطلاعات مقاله ناقص است.'], 400);
    }

    if (!empty($post['isFeatured']) && $pdo !== null) {
        try {
            $rows = $pdo->query("SELECT * FROM roham_content WHERE content_type = 'blog'")->fetchAll();
            foreach ($rows as $r) {
                if ($r['id'] !== $post['id']) {
                    $dec = json_decode($r['payload_json'] ?? '{}', true);
                    if (is_array($dec) && !empty($dec['isFeatured'])) {
                        $dec['isFeatured'] = false;
                        roham_upsert_content_row($pdo, $driver, $r['id'], 'blog', (string)($dec['status'] ?? 'published'), $dec);
                    }
                }
            }
        } catch (Throwable $e) {}
    }

    roham_upsert_content_row($pdo, $driver, (string)$post['id'], 'blog', (string)($post['status'] ?? 'published'), $post);
    roham_respond([
        'ok' => true,
        'message' => 'مقاله وبلاگ با موفقیت در دیتابیس MySQL ذخیره شد.',
    ]);
}

// ۵. حذف مقاله وبلاگ
if ($action === 'delete_blog') {
    $id = trim((string)($input['id'] ?? ''));
    if ($id !== '' && $pdo !== null) {
        $stmt = $pdo->prepare("DELETE FROM roham_content WHERE id = :id AND content_type = 'blog'");
        $stmt->execute([':id' => $id]);
    }
    roham_respond(['ok' => true, 'message' => 'مقاله وبلاگ از دیتابیس حذف شد.']);
}

// ۶. ذخیره یا ویرایش خبر امنیتی رادار
if ($action === 'save_news') {
    $article = $input['article'] ?? null;
    if (!is_array($article) || empty($article['id']) || empty($article['title'])) {
        roham_respond(['ok' => false, 'error' => 'اطلاعات خبر امنیتی ناقص است.'], 400);
    }

    roham_upsert_content_row($pdo, $driver, (string)$article['id'], 'news', (string)($article['status'] ?? 'published'), $article);
    roham_respond([
        'ok' => true,
        'message' => 'گزارش خبری با موفقیت در دیتابیس MySQL ذخیره شد.',
    ]);
}

// ۷. حذف خبر امنیتی رادار
if ($action === 'delete_news') {
    $id = trim((string)($input['id'] ?? ''));
    if ($id !== '' && $pdo !== null) {
        $stmt = $pdo->prepare("DELETE FROM roham_content WHERE id = :id AND content_type = 'news'");
        $stmt->execute([':id' => $id]);
    }
    roham_respond(['ok' => true, 'message' => 'گزارش خبری از دیتابیس حذف شد.']);
}

// ۸. ذخیره یا ویرایش دسته‌بندی
if ($action === 'save_category') {
    $category = $input['category'] ?? null;
    if (!is_array($category) || empty($category['name'])) {
        roham_respond(['ok' => false, 'error' => 'نام دسته‌بندی الزامی است.'], 400);
    }

    $id = trim((string)($category['id'] ?? 'cat-' . substr(md5(uniqid()), 0, 8)));
    $name = trim((string)$category['name']);
    $slug = trim((string)($category['slug'] ?? ''));
    if ($slug === '') {
        $slug = preg_replace('/[^\p{L}\p{Nd}\-]+/u', '-', mb_strtolower($name));
        $slug = trim($slug, '-');
    }
    $description = trim((string)($category['description'] ?? ''));
    $targetType = trim((string)($category['targetType'] ?? 'all'));
    $now = gmdate('c');

    if ($pdo !== null) {
        try {
            if ($driver === 'mysql') {
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
            } else {
                $stmt = $pdo->prepare("
                    INSERT OR REPLACE INTO roham_categories (id, name, slug, description, target_type, updated_at)
                    VALUES (:id, :name, :slug, :description, :target_type, :updated_at)
                ");
            }
            $stmt->execute([
                ':id' => $id,
                ':name' => $name,
                ':slug' => $slug,
                ':description' => $description,
                ':target_type' => $targetType,
                ':updated_at' => $now,
            ]);
        } catch (Throwable $e) {
            error_log('Roham category save error: ' . $e->getMessage());
            roham_respond(['ok' => false, 'error' => 'خطا در ذخیره دسته‌بندی در دیتابیس'], 500);
        }
    }

    roham_respond(['ok' => true, 'message' => 'دسته‌بندی با موفقیت ذخیره شد.']);
}

// ۹. حذف دسته‌بندی
if ($action === 'delete_category') {
    $id = trim((string)($input['id'] ?? ''));
    if ($id !== '' && $pdo !== null) {
        try {
            $stmt = $pdo->prepare("DELETE FROM roham_categories WHERE id = :id");
            $stmt->execute([':id' => $id]);
        } catch (Throwable $e) {
            error_log('Roham category delete error: ' . $e->getMessage());
        }
    }
    roham_respond(['ok' => true, 'message' => 'دسته‌بندی حذف شد.']);
}

// ۱۰. بازنشانی مقالات پیش‌فرض
if ($action === 'reset_defaults') {
    if ($pdo !== null) {
        $pdo->exec("DELETE FROM roham_content");
        foreach (($input['blogPosts'] ?? []) as $bp) {
            if (is_array($bp) && !empty($bp['id'])) {
                roham_upsert_content_row($pdo, $driver, (string)$bp['id'], 'blog', (string)($bp['status'] ?? 'published'), $bp);
            }
        }
        foreach (($input['newsArticles'] ?? []) as $na) {
            if (is_array($na) && !empty($na['id'])) {
                roham_upsert_content_row($pdo, $driver, (string)$na['id'], 'news', (string)($na['status'] ?? 'published'), $na);
            }
        }
    }
    roham_respond(['ok' => true, 'message' => 'محتوای پیش‌فرض در دیتابیس بازنشانی شد.']);
}

roham_respond(['ok' => false, 'error' => 'عملیات نامعتبر است.'], 400);
