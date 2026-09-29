<?php
/**
 * Roham Cloud Sync Endpoint (cPanel PHP)
 * مسیر: /api/sync.php
 * همگام‌سازی خودکار هایلایت‌ها، یادداشت‌ها، واژگان ذخیره‌شده، تنظیمات مطالعه و آخرین فصل خوانده‌شده بین تمام دستگاه‌ها
 */

require_once __DIR__ . '/db.php';

$db = roham_load_db();
$auth = roham_require_auth($db);
$idx = $auth['index'];
$user = $auth['user'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    roham_respond([
        'ok' => true,
        'syncData' => $user['syncData'] ?? [
            'preferences' => null,
            'highlights' => [],
            'savedWords' => [],
            'readingProgress' => [],
            'updatedAt' => gmdate('c'),
        ],
    ]);
}

$input = roham_get_input();
$currentSync = $user['syncData'] ?? [
    'preferences' => null,
    'highlights' => [],
    'savedWords' => [],
    'readingProgress' => [],
    'updatedAt' => gmdate('c'),
];

$mode = $input['mode'] ?? 'merge'; // 'merge' یا 'overwrite'

if (isset($input['preferences']) && is_array($input['preferences'])) {
    $currentSync['preferences'] = $input['preferences'];
}

if (isset($input['readingProgress']) && is_array($input['readingProgress'])) {
    $currentSync['readingProgress'] = $input['readingProgress'];
}

if (isset($input['highlights']) && is_array($input['highlights'])) {
    if ($mode === 'overwrite') {
        $currentSync['highlights'] = $input['highlights'];
    } else {
        $map = [];
        foreach (($currentSync['highlights'] ?? []) as $item) {
            if (isset($item['id'])) $map[$item['id']] = $item;
        }
        foreach ($input['highlights'] as $item) {
            if (isset($item['id'])) $map[$item['id']] = $item;
        }
        $currentSync['highlights'] = array_values($map);
    }
}

if (isset($input['savedWords']) && is_array($input['savedWords'])) {
    if ($mode === 'overwrite') {
        $currentSync['savedWords'] = $input['savedWords'];
    } else {
        $map = [];
        foreach (($currentSync['savedWords'] ?? []) as $item) {
            $key = isset($item['word']) ? strtolower($item['word']) : ($item['id'] ?? uniqid());
            $map[$key] = $item;
        }
        foreach ($input['savedWords'] as $item) {
            $key = isset($item['word']) ? strtolower($item['word']) : ($item['id'] ?? uniqid());
            $map[$key] = $item;
        }
        $currentSync['savedWords'] = array_values($map);
    }
}

$currentSync['updatedAt'] = gmdate('c');
$db['users'][$idx]['syncData'] = $currentSync;
if (!roham_update_single_user_sync($user['id'], $currentSync)) {
    roham_save_db($db);
}

roham_respond([
    'ok' => true,
    'syncData' => $currentSync,
    'message' => 'اطلاعات مطالعه شما در فضای ابری ذخیره و همگام‌سازی شد.',
]);
