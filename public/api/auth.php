<?php
/**
 * Roham Auth Endpoint (cPanel PHP)
 * مسیر: /api/auth.php
 * عملیات‌ها: login | register | me | update_profile
 */

require_once __DIR__ . '/db.php';

$db = roham_load_db();
$input = roham_get_input();
$action = $_GET['action'] ?? ($input['action'] ?? 'me');

if ($action === 'register') {
    $allowReg = $db['settings']['allowRegistration'] ?? true;
    if (!$allowReg) {
        roham_respond(['ok' => false, 'error' => 'ثبت‌نام کاربران جدید در حال حاضر توسط مدیر سایت غیرفعال شده است.'], 403);
    }

    $name = trim((string)($input['name'] ?? ''));
    $email = strtolower(trim((string)($input['email'] ?? '')));
    $username = strtolower(trim((string)($input['username'] ?? '')));
    $password = (string)($input['password'] ?? '');

    if ($username === '' && $email !== '') {
        $username = explode('@', $email)[0];
    }

    if ($name === '' || $email === '' || strlen($password) < 6) {
        roham_respond(['ok' => false, 'error' => 'لطفاً نام، ایمیل معتبر و رمز عبور (حداقل ۶ کاراکتر) را وارد کنید.'], 400);
    }

    foreach ($db['users'] as $u) {
        if (strtolower($u['email']) === $email) {
            roham_respond(['ok' => false, 'error' => 'این آدرس ایمیل قبلاً ثبت شده است. لطفاً وارد شوید.'], 409);
        }
    }

    $now = gmdate('c');
    $initialSync = $input['syncData'] ?? null;

    $newUser = [
        'id' => 'usr_' . bin2hex(random_bytes(6)),
        'username' => $username,
        'email' => $email,
        'name' => $name,
        'passwordHash' => password_hash($password, PASSWORD_BCRYPT),
        'role' => 'user',
        'status' => 'active',
        'createdAt' => $now,
        'lastLoginAt' => $now,
        'syncData' => [
            'preferences' => is_array($initialSync['preferences'] ?? null) ? $initialSync['preferences'] : null,
            'highlights' => is_array($initialSync['highlights'] ?? null) ? $initialSync['highlights'] : [],
            'savedWords' => is_array($initialSync['savedWords'] ?? null) ? $initialSync['savedWords'] : [],
            'readingProgress' => is_array($initialSync['readingProgress'] ?? null) ? $initialSync['readingProgress'] : [],
            'updatedAt' => $now,
        ],
    ];

    $db['users'][] = $newUser;
    roham_save_db($db);

    $token = roham_create_token($newUser);
    roham_respond([
        'ok' => true,
        'token' => $token,
        'user' => roham_sanitize_user($newUser),
    ]);
}

if ($action === 'login') {
    $identifier = strtolower(trim((string)($input['identifier'] ?? $input['email'] ?? '')));
    $password = (string)($input['password'] ?? '');

    if ($identifier === '' || $password === '') {
        roham_respond(['ok' => false, 'error' => 'لطفاً ایمیل/نام کاربری و رمز عبور را وارد کنید.'], 400);
    }

    foreach ($db['users'] as $idx => $u) {
        $matchEmail = strtolower($u['email'] ?? '') === $identifier;
        $matchUser = strtolower($u['username'] ?? '') === $identifier;
        if ($matchEmail || $matchUser) {
            if (!password_verify($password, $u['passwordHash'])) {
                roham_respond(['ok' => false, 'error' => 'ایمیل/نام کاربری یا رمز عبور اشتباه است.'], 401);
            }
            if (($u['status'] ?? 'active') === 'suspended') {
                roham_respond(['ok' => false, 'error' => 'این حساب کاربری مسدود شده است.'], 403);
            }

            $db['users'][$idx]['lastLoginAt'] = gmdate('c');
            roham_save_db($db);

            $token = roham_create_token($db['users'][$idx]);
            roham_respond([
                'ok' => true,
                'token' => $token,
                'user' => roham_sanitize_user($db['users'][$idx]),
            ]);
        }
    }

    roham_respond(['ok' => false, 'error' => 'حساب کاربری با این مشخصات یافت نشد.'], 401);
}

if ($action === 'me') {
    $auth = roham_require_auth($db);
    roham_respond([
        'ok' => true,
        'user' => roham_sanitize_user($auth['user']),
    ]);
}

if ($action === 'update_profile') {
    $auth = roham_require_auth($db);
    $idx = $auth['index'];
    $user = $auth['user'];

    $newName = trim((string)($input['name'] ?? $user['name']));
    $newEmail = strtolower(trim((string)($input['email'] ?? $user['email'])));
    $currentPassword = (string)($input['currentPassword'] ?? '');
    $newPassword = (string)($input['newPassword'] ?? '');

    if ($newName !== '') {
        $db['users'][$idx]['name'] = $newName;
    }

    if ($newEmail !== '' && $newEmail !== strtolower($user['email'])) {
        foreach ($db['users'] as $i => $other) {
            if ($i !== $idx && strtolower($other['email']) === $newEmail) {
                roham_respond(['ok' => false, 'error' => 'این ایمیل متعلق به کاربر دیگری است.'], 409);
            }
        }
        $db['users'][$idx]['email'] = $newEmail;
    }

    if ($newPassword !== '') {
        if (strlen($newPassword) < 6) {
            roham_respond(['ok' => false, 'error' => 'رمز عبور جدید باید حداقل ۶ کاراکتر باشد.'], 400);
        }
        if ($currentPassword !== '' && !password_verify($currentPassword, $user['passwordHash'])) {
            roham_respond(['ok' => false, 'error' => 'رمز عبور فعلی نادرست است.'], 400);
        }
        $db['users'][$idx]['passwordHash'] = password_hash($newPassword, PASSWORD_BCRYPT);
    }

    roham_save_db($db);
    roham_respond([
        'ok' => true,
        'user' => roham_sanitize_user($db['users'][$idx]),
        'message' => 'اطلاعات حساب کاربری با موفقیت بروزرسانی شد.',
    ]);
}

roham_respond(['ok' => false, 'error' => 'عملیات نامعتبر است.'], 400);
