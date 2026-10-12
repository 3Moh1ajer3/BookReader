<?php
/**
 * Roham Security — Data Migration Runner (v1 -> v2)
 * مسیر: /api/migrate.php
 *
 * انتقال خودکار و امن مقالات و اخبار قبلی به جدول نرمال‌شده roham_contents
 * قابلیت اجرا از طریق مرورگر با کلید API، یا خط فرمان (CLI)
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/content-service.php';

header('Content-Type: application/json; charset=utf-8');

$isCli = (php_sapi_name() === 'cli');
$keyParam = $_GET['key'] ?? ($_SERVER['HTTP_X_API_KEY'] ?? '');

if (!$isCli) {
    if (!defined('ROHAM_AI_POSTING_KEY') || !hash_equals(ROHAM_AI_POSTING_KEY, (string)$keyParam)) {
        // بررسی ورود مدیر ارشد
        $db = roham_load_db();
        $auth = roham_require_auth($db);
        if (($auth['user']['role'] ?? '') !== 'admin') {
            roham_respond([
                'success' => false,
                'error' => 'دسترسی غیرمجاز. برای اجرای مهاجرت کلید API یا توکن مدیر ارشد الزامی است.',
            ], 403);
        }
    }
}

$driver = null;
$pdo = roham_get_pdo($driver);

if ($pdo === null) {
    roham_respond([
        'success' => false,
        'error' => 'اتصال به پایگاه داده برقرار نشد.',
    ], 500);
}

// اطمینان از ساخت جداول جدید
roham_init_sql_tables($pdo, $driver ?? 'mysql');

// اجرای مهاجرت
$result = RohamContentService::runMigration($pdo);

roham_respond([
    'success' => $result['success'],
    'message' => "عملیات مهاجرت داده‌ها با موفقیت انجام شد. تعداد {$result['migratedCount']} رکورد منتقل گردید.",
    'details' => $result,
    'timestamp' => gmdate('c'),
]);
