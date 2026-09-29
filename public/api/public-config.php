<?php
/**
 * Roham Public Site Configuration Endpoint (cPanel PHP)
 * مسیر: /api/public-config.php
 * برگرداندن تنظیمات عمومی سایت (اطلاعیه سراسری، وضعیت ثبت‌نام، تنظیمات پیش‌فرض کتابخوان و آدرس‌های سفارشی پادکست)
 */

require_once __DIR__ . '/db.php';

$db = roham_load_db();
$settings = $db['settings'] ?? [];

roham_respond([
    'ok' => true,
    'config' => [
        'announcementEnabled' => (bool)($settings['announcementEnabled'] ?? false),
        'announcementText' => (string)($settings['announcementText'] ?? ''),
        'announcementBadge' => (string)($settings['announcementBadge'] ?? 'اطلاعیه'),
        'announcementLink' => (string)($settings['announcementLink'] ?? ''),
        'allowRegistration' => (bool)($settings['allowRegistration'] ?? true),
        'defaultTheme' => (string)($settings['defaultTheme'] ?? 'sepia'),
        'defaultFontSize' => (int)($settings['defaultFontSize'] ?? 18),
        'podcastOverrides' => $settings['podcastOverrides'] ?? new stdClass(),
        'updatedAt' => (string)($settings['updatedAt'] ?? ''),
    ],
]);
