<?php
/**
 * Roham Admin Panel Management Endpoint (cPanel PHP)
 * مسیر: /api/admin.php
 * مخصوص مدیران سایت (نیازمند توکن با نقش admin)
 */

require_once __DIR__ . '/db.php';

$db = roham_load_db();
$auth = roham_require_auth($db);
$currentUser = $auth['user'];

if (($currentUser['role'] ?? 'user') !== 'admin') {
    roham_respond(['ok' => false, 'error' => 'دسترسی غیرمجاز: این بخش مخصوص مدیران ارشد سایت است.'], 403);
}

$input = roham_get_input();
$action = $_GET['action'] ?? ($input['action'] ?? 'dashboard');

if ($action === 'dashboard') {
    $usersList = array_map('roham_sanitize_user', $db['users']);
    $settings = $db['settings'] ?? [];
    // Mask Gemini API key preview if set
    $hasGeminiKey = !empty($settings['geminiApiKey']) || !empty(getenv('GEMINI_API_KEY'));

    // بررسی وجود فایل‌های پادکست روی هاست
    $podcastFilesStatus = [];
    $bookDir = __DIR__ . '/../podcasts/from-day-zero-to-zero-day';
    $flatDir = __DIR__ . '/../podcasts';
    for ($i = 0; $i <= 10; $i++) {
        $chId = "ch-{$i}";
        $existsInBookDir = file_exists("{$bookDir}/{$chId}.m4a") || file_exists("{$bookDir}/chapter{$i}.m4a");
        $existsInFlatDir = file_exists("{$flatDir}/{$chId}.m4a") || file_exists("{$flatDir}/chapter{$i}.m4a");
        $podcastFilesStatus[$chId] = $existsInBookDir || $existsInFlatDir;
    }

    roham_respond([
        'ok' => true,
        'users' => $usersList,
        'leads' => $db['leads'] ?? [],
        'settings' => $settings,
        'serverInfo' => [
            'phpVersion' => PHP_VERSION,
            'storageEngine' => roham_get_storage_engine_label(),
            'hasGeminiKey' => $hasGeminiKey,
            'podcastFilesStatus' => $podcastFilesStatus,
            'serverTime' => gmdate('c'),
        ],
    ]);
}

if ($action === 'create_user') {
    $name = trim((string)($input['name'] ?? ''));
    $email = strtolower(trim((string)($input['email'] ?? '')));
    $password = (string)($input['password'] ?? '');
    $role = ($input['role'] ?? 'user') === 'admin' ? 'admin' : 'user';

    if ($name === '' || $email === '' || strlen($password) < 6) {
        roham_respond(['ok' => false, 'error' => 'نام، ایمیل و رمز عبور (حداقل ۶ کاراکتر) الزامی است.'], 400);
    }

    foreach ($db['users'] as $u) {
        if (strtolower($u['email']) === $email) {
            roham_respond(['ok' => false, 'error' => 'کاربری با این ایمیل از قبل وجود دارد.'], 409);
        }
    }

    $now = gmdate('c');
    $newUser = [
        'id' => 'usr_' . bin2hex(random_bytes(6)),
        'username' => explode('@', $email)[0],
        'email' => $email,
        'name' => $name,
        'passwordHash' => password_hash($password, PASSWORD_BCRYPT),
        'role' => $role,
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
    ];
    $db['users'][] = $newUser;
    roham_save_db($db);

    roham_respond([
        'ok' => true,
        'user' => roham_sanitize_user($newUser),
        'message' => 'کاربر جدید با موفقیت ایجاد شد.',
    ]);
}

if ($action === 'update_user') {
    $targetId = (string)($input['userId'] ?? '');
    foreach ($db['users'] as $idx => $u) {
        if ($u['id'] === $targetId) {
            if (isset($input['role']) && in_array($input['role'], ['user', 'admin'], true)) {
                // جلوگیری از حذف نقش تنها مدیر
                if ($u['id'] === $currentUser['id'] && $input['role'] !== 'admin') {
                    roham_respond(['ok' => false, 'error' => 'نمی‌توانید دسترسی مدیریت حساب فعلی خودتان را لغو کنید.'], 400);
                }
                $db['users'][$idx]['role'] = $input['role'];
            }
            if (isset($input['status']) && in_array($input['status'], ['active', 'suspended'], true)) {
                if ($u['id'] === $currentUser['id'] && $input['status'] === 'suspended') {
                    roham_respond(['ok' => false, 'error' => 'نمی‌توانید حساب خودتان را مسدود کنید.'], 400);
                }
                $db['users'][$idx]['status'] = $input['status'];
            }
            if (isset($input['name']) && trim((string)$input['name']) !== '') {
                $db['users'][$idx]['name'] = trim((string)$input['name']);
            }
            if (!empty($input['newPassword']) && strlen((string)$input['newPassword']) >= 6) {
                $db['users'][$idx]['passwordHash'] = password_hash((string)$input['newPassword'], PASSWORD_BCRYPT);
            }
            roham_save_db($db);
            roham_respond([
                'ok' => true,
                'user' => roham_sanitize_user($db['users'][$idx]),
                'message' => 'مشخصات کاربر بروزرسانی شد.',
            ]);
        }
    }
    roham_respond(['ok' => false, 'error' => 'کاربر مورد نظر یافت نشد.'], 404);
}

if ($action === 'delete_user') {
    $targetId = (string)($input['userId'] ?? '');
    if ($targetId === $currentUser['id']) {
        roham_respond(['ok' => false, 'error' => 'حذف حساب کاربری فعلی خودتان مجاز نیست.'], 400);
    }
    $before = count($db['users']);
    $db['users'] = array_values(array_filter($db['users'], fn($u) => $u['id'] !== $targetId));
    if (count($db['users']) === $before) {
        roham_respond(['ok' => false, 'error' => 'کاربر یافت نشد.'], 404);
    }
    roham_save_db($db);
    roham_respond(['ok' => true, 'message' => 'کاربر با موفقیت حذف شد.']);
}

if ($action === 'update_lead') {
    $leadId = (string)($input['leadId'] ?? '');
    foreach ($db['leads'] as $idx => $lead) {
        if ($lead['id'] === $leadId) {
            if (isset($input['status'])) {
                $db['leads'][$idx]['status'] = (string)$input['status'];
            }
            if (isset($input['adminNote'])) {
                $db['leads'][$idx]['adminNote'] = (string)$input['adminNote'];
            }
            roham_save_db($db);
            roham_respond(['ok' => true, 'lead' => $db['leads'][$idx]]);
        }
    }
    roham_respond(['ok' => false, 'error' => 'درخواست مورد نظر یافت نشد.'], 404);
}

if ($action === 'delete_lead') {
    $leadId = (string)($input['leadId'] ?? '');
    $db['leads'] = array_values(array_filter($db['leads'], fn($l) => $l['id'] !== $leadId));
    roham_save_db($db);
    roham_respond(['ok' => true, 'message' => 'درخواست حذف شد.']);
}

if ($action === 'update_settings') {
    $newSettings = $input['settings'] ?? [];
    if (!is_array($newSettings)) {
        roham_respond(['ok' => false, 'error' => 'فرمت تنظیمات نامعتبر است.'], 400);
    }
    $current = $db['settings'] ?? [];
    $allowedKeys = [
        'announcementEnabled',
        'announcementText',
        'announcementBadge',
        'announcementLink',
        'allowRegistration',
        'defaultTheme',
        'defaultFontSize',
        'geminiApiKey',
        'podcastOverrides',
    ];
    foreach ($allowedKeys as $k) {
        if (array_key_exists($k, $newSettings)) {
            $current[$k] = $newSettings[$k];
        }
    }
    $current['updatedAt'] = gmdate('c');
    $db['settings'] = $current;
    roham_save_db($db);

    roham_respond([
        'ok' => true,
        'settings' => $current,
        'message' => 'تنظیمات سایت با موفقیت ذخیره شد.',
    ]);
}

roham_respond(['ok' => false, 'error' => 'عملیات نامعتبر است.'], 400);
