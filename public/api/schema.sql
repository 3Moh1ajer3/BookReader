-- ============================================================================
-- Roham Security & Smart Reader — MySQL Database Schema (corpel_roham)
-- نکته: فایل public/api/db.php به صورت خودکار در اولین اتصال این جداول را می‌سازد،
-- اما در صورت تمایل می‌توانید این فایل را مستقیماً در phpMyAdmin نیز Import کنید.
-- ============================================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

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

CREATE TABLE IF NOT EXISTS `roham_settings` (
  `k` VARCHAR(64) NOT NULL,
  `v` LONGTEXT NOT NULL,
  PRIMARY KEY (`k`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
