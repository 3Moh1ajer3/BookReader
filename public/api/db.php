<?php
/**
 * Roham MySQL (PDO) Database & Authentication Engine for cPanel Hosting
 * متصل به دیتابیس MySQL: corpel_roham
 * جداول به‌صورت خودکار در اولین اجرای اسکریپت روی هاست ایجاد می‌شوند (نیازی به ایمپورت دستی نیست).
 */

require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function roham_respond(array $data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function roham_get_input(): array {
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $decoded = json_decode((string)$raw, true);
    return is_array($decoded) ? $decoded : [];
}

function roham_ensure_storage_dir(): string {
    $dir = __DIR__ . '/storage';
    if (!is_dir($dir)) {
        @mkdir($dir, 0750, true);
    }
    $htaccess = $dir . '/.htaccess';
    if (!file_exists($htaccess)) {
        $rules = "# Deny direct public web access to storage files\n"
               . "<IfModule mod_authz_core.c>\n  Require all denied\n</IfModule>\n"
               . "<IfModule !mod_authz_core.c>\n  Order deny,allow\n  Deny from all\n</IfModule>\n";
        @file_put_contents($htaccess, $rules);
    }
    $indexFile = $dir . '/index.php';
    if (!file_exists($indexFile)) {
        @file_put_contents($indexFile, "<?php http_response_code(403); exit('403 Forbidden');");
    }
    return $dir;
}

function roham_default_store(): array {
    $now = gmdate('c');
    return [
        'users' => [
            [
                'id' => 'usr_admin_1',
                'username' => ROHAM_DEFAULT_ADMIN_USER,
                'email' => strtolower(ROHAM_DEFAULT_ADMIN_EMAIL),
                'name' => ROHAM_DEFAULT_ADMIN_NAME,
                'passwordHash' => password_hash(ROHAM_DEFAULT_ADMIN_PASS, PASSWORD_BCRYPT),
                'role' => 'admin',
                'status' => 'active',
                'createdAt' => $now,
                'lastLoginAt' => $now,
                'syncData' => [
                    'preferences' => null,
                    'highlights' => [],
                    'savedWords' => [],
                    'readingProgress' => [],
                    'updatedAt' => $now,
                ],
            ],
        ],
        'leads' => [],
        'settings' => [
            'announcementEnabled' => false,
            'announcementText' => 'نسخه جدید کتابخوان دوزبانه رهام به همراه پادکست صوتی فصل‌ها منتشر شد.',
            'announcementBadge' => 'اطلاعیه',
            'announcementLink' => '/from-day-zero-to-zero-day',
            'allowRegistration' => true,
            'defaultTheme' => 'sepia',
            'defaultFontSize' => 18,
            'geminiApiKey' => '',
            'podcastOverrides' => new stdClass(),
            'updatedAt' => $now,
        ],
    ];
}

/**
 * اتصال PDO به دیتابیس MySQL سی‌پنل (`corpel_roham`)
 */
function roham_get_pdo(&$activeDriver = null): ?PDO {
    static $pdo = false;
    static $cachedDriver = null;

    if ($pdo !== false) {
        $activeDriver = $cachedDriver;
        return $pdo;
    }

    // ۱. اتصال اصلی به دیتابیس MySQL سی‌پنل
    if (defined('ROHAM_MYSQL_DB') && ROHAM_MYSQL_DB !== '' && defined('ROHAM_MYSQL_USER') && ROHAM_MYSQL_USER !== '') {
        try {
            $dsn = 'mysql:host=' . ROHAM_MYSQL_HOST . ';dbname=' . ROHAM_MYSQL_DB . ';charset=utf8mb4';
            $conn = new PDO($dsn, ROHAM_MYSQL_USER, ROHAM_MYSQL_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
            roham_init_sql_tables($conn, 'mysql');
            $pdo = $conn;
            $cachedDriver = 'mysql';
            $activeDriver = 'mysql';
            return $pdo;
        } catch (Throwable $e) {
            error_log('Roham MySQL connection error: ' . $e->getMessage());
        }
    }

    // ۲. فال‌بک به SQLite3 در صورتی که اسکریپت خارج از هاست اصلی اجرا شود
    if (extension_loaded('pdo_sqlite')) {
        try {
            $storageDir = roham_ensure_storage_dir();
            $sqliteFile = $storageDir . '/roham_rel_db.sqlite';
            $conn = new PDO('sqlite:' . $sqliteFile, null, null, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_TIMEOUT => 5,
            ]);
            $conn->exec('PRAGMA journal_mode = WAL;');
            $conn->exec('PRAGMA synchronous = NORMAL;');
            roham_init_sql_tables($conn, 'sqlite');
            $pdo = $conn;
            $cachedDriver = 'sqlite';
            $activeDriver = 'sqlite';
            return $pdo;
        } catch (Throwable $e) {
            error_log('Roham SQLite fallback error: ' . $e->getMessage());
        }
    }

    $pdo = null;
    $cachedDriver = null;
    $activeDriver = null;
    return null;
}

function roham_get_storage_engine_label(): string {
    $driver = null;
    $pdo = roham_get_pdo($driver);
    if ($pdo !== null && $driver === 'mysql') {
        return 'MySQL (' . ROHAM_MYSQL_DB . ')';
    }
    if ($pdo !== null && $driver === 'sqlite') {
        return 'SQLite3 Relational (WAL)';
    }
    return 'PHP-Guarded Locked Store';
}

/**
 * ساخت خودکار جداول استاندارد در دیتابیس MySQL (`corpel_roham`)
 */
function roham_init_sql_tables(PDO $pdo, string $driver): void {
    if ($driver === 'mysql') {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `roham_users` (
                `id` VARCHAR(64) NOT NULL,
                `username` VARCHAR(120) NOT NULL,
                `email` VARCHAR(190) NOT NULL,
                `name` VARCHAR(190) NOT NULL,
                `password_hash` VARCHAR(255) NOT NULL,
                `role` VARCHAR(32) NOT NULL DEFAULT 'user',
                `status` VARCHAR(32) NOT NULL DEFAULT 'active',
                `created_at` VARCHAR(64) NOT NULL,
                `last_login_at` VARCHAR(64) NOT NULL,
                `sync_json` LONGTEXT NOT NULL,
                PRIMARY KEY (`id`),
                UNIQUE KEY `uniq_roham_users_email` (`email`),
                KEY `idx_roham_users_role` (`role`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `roham_leads` (
                `id` VARCHAR(64) NOT NULL,
                `type` VARCHAR(64) NOT NULL,
                `name` VARCHAR(190) NOT NULL,
                `contact` VARCHAR(190) NOT NULL,
                `status` VARCHAR(32) NOT NULL DEFAULT 'new',
                `created_at` VARCHAR(64) NOT NULL,
                `payload_json` LONGTEXT NOT NULL,
                PRIMARY KEY (`id`),
                KEY `idx_roham_leads_type` (`type`),
                KEY `idx_roham_leads_status` (`status`),
                KEY `idx_roham_leads_created` (`created_at`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `roham_settings` (
                `k` VARCHAR(64) NOT NULL,
                `v` LONGTEXT NOT NULL,
                PRIMARY KEY (`k`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `roham_content` (
                `id` VARCHAR(64) NOT NULL,
                `content_type` VARCHAR(32) NOT NULL,
                `status` VARCHAR(32) NOT NULL DEFAULT 'published',
                `updated_at` VARCHAR(64) NOT NULL,
                `payload_json` LONGTEXT NOT NULL,
                PRIMARY KEY (`id`),
                KEY `idx_roham_content_type` (`content_type`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
    } else {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS roham_users (
                id TEXT PRIMARY KEY,
                username TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'user',
                status TEXT NOT NULL DEFAULT 'active',
                created_at TEXT NOT NULL,
                last_login_at TEXT NOT NULL,
                sync_json TEXT NOT NULL
            );
        ");
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS roham_leads (
                id TEXT PRIMARY KEY,
                type TEXT NOT NULL,
                name TEXT NOT NULL,
                contact TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'new',
                created_at TEXT NOT NULL,
                payload_json TEXT NOT NULL
            );
        ");
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS roham_settings (
                k TEXT PRIMARY KEY,
                v TEXT NOT NULL
            );
        ");
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS roham_content (
                id TEXT PRIMARY KEY,
                content_type TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'published',
                updated_at TEXT NOT NULL,
                payload_json TEXT NOT NULL
            );
        ");
    }

    // ایجاد خودکار اکانت مدیر ارشد پیش‌فرض در صورت خالی بودن جدول کاربران
    $count = (int)$pdo->query("SELECT COUNT(*) FROM roham_users")->fetchColumn();
    if ($count === 0) {
        $defaults = roham_default_store();
        $admin = $defaults['users'][0];
        $stmt = $pdo->prepare("
            INSERT INTO roham_users (id, username, email, name, password_hash, role, status, created_at, last_login_at, sync_json)
            VALUES (:id, :username, :email, :name, :password_hash, :role, :status, :created_at, :last_login_at, :sync_json)
        ");
        $stmt->execute([
            ':id' => $admin['id'],
            ':username' => $admin['username'],
            ':email' => $admin['email'],
            ':name' => $admin['name'],
            ':password_hash' => $admin['passwordHash'],
            ':role' => $admin['role'],
            ':status' => $admin['status'],
            ':created_at' => $admin['createdAt'],
            ':last_login_at' => $admin['lastLoginAt'],
            ':sync_json' => json_encode($admin['syncData'], JSON_UNESCAPED_UNICODE),
        ]);

        $setCount = (int)$pdo->query("SELECT COUNT(*) FROM roham_settings WHERE k = 'site_settings'")->fetchColumn();
        if ($setCount === 0) {
            $setStmt = $pdo->prepare("INSERT INTO roham_settings (k, v) VALUES (:k, :v)");
            $setStmt->execute([
                ':k' => 'site_settings',
                ':v' => json_encode($defaults['settings'], JSON_UNESCAPED_UNICODE),
            ]);
        }
    }
}

/**
 * خواندن داده‌ها از دیتابیس MySQL
 */
function roham_load_db(): array {
    $driver = null;
    $pdo = roham_get_pdo($driver);
    if ($pdo !== null) {
        try {
            $usersRows = $pdo->query("SELECT * FROM roham_users ORDER BY created_at ASC")->fetchAll();
            $users = [];
            foreach ($usersRows as $r) {
                $syncData = json_decode($r['sync_json'] ?? '{}', true);
                $users[] = [
                    'id' => $r['id'],
                    'username' => $r['username'],
                    'email' => $r['email'],
                    'name' => $r['name'],
                    'passwordHash' => $r['password_hash'],
                    'role' => $r['role'],
                    'status' => $r['status'],
                    'createdAt' => $r['created_at'],
                    'lastLoginAt' => $r['last_login_at'],
                    'syncData' => is_array($syncData) ? $syncData : [
                        'preferences' => null,
                        'highlights' => [],
                        'savedWords' => [],
                        'readingProgress' => [],
                        'updatedAt' => $r['created_at'],
                    ],
                ];
            }

            $leadsRows = $pdo->query("SELECT * FROM roham_leads ORDER BY created_at DESC")->fetchAll();
            $leads = [];
            foreach ($leadsRows as $lr) {
                $payload = json_decode($lr['payload_json'] ?? '{}', true);
                if (is_array($payload)) {
                    $payload['id'] = $lr['id'];
                    $payload['type'] = $lr['type'];
                    $payload['name'] = $lr['name'];
                    $payload['contact'] = $lr['contact'];
                    $payload['status'] = $lr['status'];
                    $payload['createdAt'] = $lr['created_at'];
                    $leads[] = $payload;
                }
            }

            $setStmt = $pdo->prepare("SELECT v FROM roham_settings WHERE k = 'site_settings' LIMIT 1");
            $setStmt->execute();
            $setRow = $setStmt->fetch();
            $defaults = roham_default_store();
            $settings = $setRow ? json_decode($setRow['v'], true) : $defaults['settings'];
            if (!is_array($settings)) $settings = $defaults['settings'];

            return [
                'users' => $users,
                'leads' => $leads,
                'settings' => $settings,
            ];
        } catch (Throwable $e) {
            error_log('Roham SQL read error: ' . $e->getMessage());
        }
    }

    $storageDir = roham_ensure_storage_dir();
    $guardedFile = $storageDir . '/roham_data.db.php';
    $phpGuardPrefix = "<?php http_response_code(403); exit('Forbidden'); ?>\n";

    if (!file_exists($guardedFile)) {
        $default = roham_default_store();
        @file_put_contents(
            $guardedFile,
            $phpGuardPrefix . json_encode($default, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT),
            LOCK_EX
        );
        return $default;
    }

    $fp = @fopen($guardedFile, 'rb');
    if (!$fp) return roham_default_store();
    @flock($fp, LOCK_SH);
    $raw = stream_get_contents($fp);
    @flock($fp, LOCK_UN);
    @fclose($fp);

    $jsonPart = preg_replace('/^<\?php.*?\?>\s*/s', '', (string)$raw);
    $data = json_decode((string)$jsonPart, true);
    if (!is_array($data) || !isset($data['users'])) {
        return roham_default_store();
    }
    return $data;
}

/**
 * ذخیره تراکنشی با UPSERT استاندارد در MySQL (`ON DUPLICATE KEY UPDATE`)
 */
function roham_save_db(array $data): bool {
    $driver = null;
    $pdo = roham_get_pdo($driver);
    if ($pdo !== null) {
        try {
            $pdo->beginTransaction();

            // ۱. UPSERT جدول کاربران
            $keepUserIds = [];
            if ($driver === 'mysql') {
                $upsertUserStmt = $pdo->prepare("
                    INSERT INTO roham_users (id, username, email, name, password_hash, role, status, created_at, last_login_at, sync_json)
                    VALUES (:id, :username, :email, :name, :password_hash, :role, :status, :created_at, :last_login_at, :sync_json)
                    ON DUPLICATE KEY UPDATE
                        username = VALUES(username),
                        email = VALUES(email),
                        name = VALUES(name),
                        password_hash = VALUES(password_hash),
                        role = VALUES(role),
                        status = VALUES(status),
                        last_login_at = VALUES(last_login_at),
                        sync_json = VALUES(sync_json)
                ");
            } else {
                $upsertUserStmt = $pdo->prepare("
                    INSERT OR REPLACE INTO roham_users (id, username, email, name, password_hash, role, status, created_at, last_login_at, sync_json)
                    VALUES (:id, :username, :email, :name, :password_hash, :role, :status, :created_at, :last_login_at, :sync_json)
                ");
            }

            foreach (($data['users'] ?? []) as $u) {
                $keepUserIds[] = $u['id'];
                $upsertUserStmt->execute([
                    ':id' => $u['id'],
                    ':username' => $u['username'] ?? '',
                    ':email' => strtolower($u['email'] ?? ''),
                    ':name' => $u['name'] ?? '',
                    ':password_hash' => $u['passwordHash'] ?? '',
                    ':role' => $u['role'] ?? 'user',
                    ':status' => $u['status'] ?? 'active',
                    ':created_at' => $u['createdAt'] ?? gmdate('c'),
                    ':last_login_at' => $u['lastLoginAt'] ?? gmdate('c'),
                    ':sync_json' => json_encode($u['syncData'] ?? [], JSON_UNESCAPED_UNICODE),
                ]);
            }

            if (!empty($keepUserIds)) {
                $placeholders = implode(',', array_fill(0, count($keepUserIds), '?'));
                $cleanStmt = $pdo->prepare("DELETE FROM roham_users WHERE id NOT IN ({$placeholders})");
                $cleanStmt->execute($keepUserIds);
            }

            // ۲. UPSERT جدول درخواست‌ها (Leads)
            $keepLeadIds = [];
            if ($driver === 'mysql') {
                $upsertLeadStmt = $pdo->prepare("
                    INSERT INTO roham_leads (id, type, name, contact, status, created_at, payload_json)
                    VALUES (:id, :type, :name, :contact, :status, :created_at, :payload_json)
                    ON DUPLICATE KEY UPDATE
                        status = VALUES(status),
                        payload_json = VALUES(payload_json)
                ");
            } else {
                $upsertLeadStmt = $pdo->prepare("
                    INSERT OR REPLACE INTO roham_leads (id, type, name, contact, status, created_at, payload_json)
                    VALUES (:id, :type, :name, :contact, :status, :created_at, :payload_json)
                ");
            }

            foreach (($data['leads'] ?? []) as $lead) {
                $keepLeadIds[] = $lead['id'];
                $upsertLeadStmt->execute([
                    ':id' => $lead['id'],
                    ':type' => $lead['type'] ?? 'general',
                    ':name' => $lead['name'] ?? '',
                    ':contact' => $lead['contact'] ?? '',
                    ':status' => $lead['status'] ?? 'new',
                    ':created_at' => $lead['createdAt'] ?? gmdate('c'),
                    ':payload_json' => json_encode($lead, JSON_UNESCAPED_UNICODE),
                ]);
            }

            if (empty($keepLeadIds)) {
                $pdo->exec("DELETE FROM roham_leads");
            } else {
                $placeholders = implode(',', array_fill(0, count($keepLeadIds), '?'));
                $cleanLeadsStmt = $pdo->prepare("DELETE FROM roham_leads WHERE id NOT IN ({$placeholders})");
                $cleanLeadsStmt->execute($keepLeadIds);
            }

            // ۳. UPSERT تنظیمات سایت
            if ($driver === 'mysql') {
                $setStmt = $pdo->prepare("
                    INSERT INTO roham_settings (k, v) VALUES ('site_settings', :v)
                    ON DUPLICATE KEY UPDATE v = VALUES(v)
                ");
            } else {
                $setStmt = $pdo->prepare("
                    INSERT OR REPLACE INTO roham_settings (k, v) VALUES ('site_settings', :v)
                ");
            }
            $setStmt->execute([
                ':v' => json_encode($data['settings'] ?? [], JSON_UNESCAPED_UNICODE),
            ]);

            $pdo->commit();
            return true;
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            error_log('Roham SQL write error: ' . $e->getMessage());
        }
    }

    $storageDir = roham_ensure_storage_dir();
    $guardedFile = $storageDir . '/roham_data.db.php';
    $phpGuardPrefix = "<?php http_response_code(403); exit('Forbidden'); ?>\n";
    return @file_put_contents(
        $guardedFile,
        $phpGuardPrefix . json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT),
        LOCK_EX
    ) !== false;
}

/**
 * آپدیت مستقیم فقط سطرِ یک کاربر در دیتابیس MySQL (برای همگام‌سازی سریع بدون لمس سایر کاربران)
 */
function roham_update_single_user_sync(string $userId, array $syncData): bool {
    $driver = null;
    $pdo = roham_get_pdo($driver);
    if ($pdo !== null) {
        try {
            $stmt = $pdo->prepare("UPDATE roham_users SET sync_json = :sync_json WHERE id = :id");
            return $stmt->execute([
                ':sync_json' => json_encode($syncData, JSON_UNESCAPED_UNICODE),
                ':id' => $userId,
            ]);
        } catch (Throwable $e) {
            error_log('Roham single user sync error: ' . $e->getMessage());
        }
    }
    return false;
}

/**
 * درج مستقیم یک درخواست جدید (Lead) در دیتابیس MySQL
 */
function roham_insert_single_lead(array $lead): bool {
    $driver = null;
    $pdo = roham_get_pdo($driver);
    if ($pdo !== null) {
        try {
            $stmt = $pdo->prepare("
                INSERT INTO roham_leads (id, type, name, contact, status, created_at, payload_json)
                VALUES (:id, :type, :name, :contact, :status, :created_at, :payload_json)
            ");
            return $stmt->execute([
                ':id' => $lead['id'],
                ':type' => $lead['type'] ?? 'general',
                ':name' => $lead['name'] ?? '',
                ':contact' => $lead['contact'] ?? '',
                ':status' => $lead['status'] ?? 'new',
                ':created_at' => $lead['createdAt'] ?? gmdate('c'),
                ':payload_json' => json_encode($lead, JSON_UNESCAPED_UNICODE),
            ]);
        } catch (Throwable $e) {
            error_log('Roham insert lead error: ' . $e->getMessage());
        }
    }
    return false;
}

function roham_create_token(array $user): string {
    $payload = [
        'sub' => $user['id'],
        'email' => $user['email'],
        'role' => $user['role'],
        'exp' => time() + (30 * 86400),
    ];
    $base64Payload = rtrim(strtr(base64_encode(json_encode($payload)), '+/', '-_'), '=');
    $signature = hash_hmac('sha256', $base64Payload, ROHAM_AUTH_SECRET);
    return $base64Payload . '.' . $signature;
}

function roham_verify_token(?string $token): ?array {
    if (!$token || strpos($token, '.') === false) return null;
    [$base64Payload, $signature] = explode('.', $token, 2);
    $expected = hash_hmac('sha256', $base64Payload, ROHAM_AUTH_SECRET);
    if (!hash_equals($expected, $signature)) return null;

    $json = base64_decode(strtr($base64Payload, '-_', '+/'));
    if (!$json) return null;
    $payload = json_decode($json, true);
    if (!is_array($payload) || empty($payload['sub'])) return null;
    if (isset($payload['exp']) && $payload['exp'] < time()) return null;

    return $payload;
}

function roham_get_bearer_token(): ?string {
    $headers = [];
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
    }
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? ($_SERVER['HTTP_AUTHORIZATION'] ?? '');
    if (preg_match('/Bearer\s+(.+)/i', $authHeader, $matches)) {
        return trim($matches[1]);
    }
    if (isset($_GET['token']) && is_string($_GET['token'])) {
        return trim($_GET['token']);
    }
    return null;
}

function roham_require_auth(array &$db): array {
    $token = roham_get_bearer_token();
    $payload = roham_verify_token($token);
    if (!$payload) {
        roham_respond(['ok' => false, 'error' => 'نشست کاربری معتبر نیست یا منقضی شده است. لطفاً مجدداً وارد شوید.'], 401);
    }

    foreach ($db['users'] as $idx => $u) {
        if ($u['id'] === $payload['sub']) {
            if (($u['status'] ?? 'active') === 'suspended') {
                roham_respond(['ok' => false, 'error' => 'این حساب کاربری توسط مدیریت مسدود شده است.'], 403);
            }
            return ['index' => $idx, 'user' => $u];
        }
    }

    roham_respond(['ok' => false, 'error' => 'کاربر یافت نشد.'], 401);
    exit;
}

function roham_sanitize_user(array $u): array {
    $sync = $u['syncData'] ?? [
        'preferences' => null,
        'highlights' => [],
        'savedWords' => [],
        'readingProgress' => [],
        'updatedAt' => $u['createdAt'] ?? gmdate('c'),
    ];
    return [
        'id' => $u['id'],
        'username' => $u['username'] ?? '',
        'email' => $u['email'],
        'name' => $u['name'],
        'role' => $u['role'] ?? 'user',
        'status' => $u['status'] ?? 'active',
        'createdAt' => $u['createdAt'] ?? gmdate('c'),
        'lastLoginAt' => $u['lastLoginAt'] ?? gmdate('c'),
        'syncData' => $sync,
    ];
}
