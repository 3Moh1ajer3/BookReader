<?php
/**
 * Roham Portal Leads & Submissions Endpoint (cPanel PHP)
 * مسیر: /api/leads.php
 * ثبت درخواست‌های مشاوره سازمانی، پیش‌ثبت‌نام بتای آنتی‌استیلر و ثبت‌نام دوره‌های آکادمی در دیتابیس سرور
 */

require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    roham_respond(['ok' => false, 'error' => 'Method not allowed'], 405);
}

$db = roham_load_db();
$input = roham_get_input();

$type = trim((string)($input['type'] ?? 'general')); // 'early_access' | 'consultation' | 'course_enroll'
$name = trim((string)($input['name'] ?? ''));
$contact = trim((string)($input['contact'] ?? $input['email'] ?? ''));

if ($name === '' || $contact === '') {
    roham_respond(['ok' => false, 'error' => 'نام و اطلاعات تماس الزامی است.'], 400);
}

$lead = [
    'id' => 'lead_' . bin2hex(random_bytes(5)),
    'type' => $type,
    'name' => $name,
    'contact' => $contact,
    'email' => trim((string)($input['email'] ?? '')),
    'phone' => trim((string)($input['phone'] ?? '')),
    'organization' => trim((string)($input['organization'] ?? '')),
    'subject' => trim((string)($input['subject'] ?? '')),
    'details' => trim((string)($input['details'] ?? '')),
    'trackingCode' => trim((string)($input['trackingCode'] ?? '')),
    'meta' => is_array($input['meta'] ?? null) ? $input['meta'] : [],
    'status' => 'new', // 'new' | 'reviewing' | 'contacted' | 'archived'
    'adminNote' => '',
    'createdAt' => gmdate('c'),
];

array_unshift($db['leads'], $lead);
if (!roham_insert_single_lead($lead)) {
    roham_save_db($db);
}

roham_respond([
    'ok' => true,
    'lead' => $lead,
]);
