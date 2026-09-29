<?php
/**
 * Roham Security & Smart Reader — تنظیمات اتصال به دیتابیس MySQL سی‌پنل (cPanel)
 */

$DB_HOST = "localhost";
$DB_NAME = 'corpel_roham';
$DB_USER = 'corpel_roham_12_db';
$DB_PASS = 'sadAFF2e23@pioujnw';

// نوع دیتابیس: 'mysql' (متصل به دیتابیس MySQL سی‌پنل با فال‌بک خودکار در صورت عدم دسترسی لوکال)
define('ROHAM_DB_DRIVER',  'mysql');
define('ROHAM_MYSQL_HOST', $DB_HOST);
define('ROHAM_MYSQL_DB',   $DB_NAME);
define('ROHAM_MYSQL_USER', $DB_USER);
define('ROHAM_MYSQL_PASS', $DB_PASS);

// کلید امنیتی امضای توکن‌های ورود (HMAC-SHA256)
define('ROHAM_AUTH_SECRET', 'roham_sec_corpel_mysql_secret_key_2026_v2');

// مشخصات حساب مدیر ارشد پیش‌فرض (در اولین اتصال به‌صورت خودکار در جدول roham_users ساخته می‌شود)
define('ROHAM_DEFAULT_ADMIN_NAME',  'مدیر ارشد رهام');
define('ROHAM_DEFAULT_ADMIN_EMAIL', 'admin@roham.sec');
define('ROHAM_DEFAULT_ADMIN_USER',  'admin');
define('ROHAM_DEFAULT_ADMIN_PASS',  'Admin@1234');
