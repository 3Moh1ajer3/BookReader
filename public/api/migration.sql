-- ============================================================================
-- Roham Cyber Security Portal — Database Migration Script (v1 -> v2)
-- انتقال ساختار قدیمی roham_content به معماری نرمال‌شده roham_contents
-- ============================================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- ۱. ایجاد جدول جدید roham_contents در صورت عدم وجود
CREATE TABLE IF NOT EXISTS `roham_contents` (
  `id` VARCHAR(64) NOT NULL,
  `type` VARCHAR(32) NOT NULL,
  `slug` VARCHAR(190) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `subtitle` VARCHAR(255) NULL,
  `summary` TEXT NOT NULL,
  `category_id` VARCHAR(64) NOT NULL,
  `category_name` VARCHAR(190) NOT NULL,
  `status` VARCHAR(32) NOT NULL DEFAULT 'published',
  `severity` VARCHAR(32) NULL,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `is_breaking` TINYINT(1) NOT NULL DEFAULT 0,
  `difficulty` VARCHAR(64) NULL,
  `read_time_minutes` INT NOT NULL DEFAULT 5,
  `views` INT NOT NULL DEFAULT 0,
  `published_at` VARCHAR(64) NOT NULL,
  `created_at` VARCHAR(64) NOT NULL,
  `updated_at` VARCHAR(64) NOT NULL,
  `author_name` VARCHAR(190) NULL,
  `author_role` VARCHAR(190) NULL,
  `source_name` VARCHAR(190) NULL,
  `source_url` VARCHAR(255) NULL,
  `tldr_json` TEXT NULL,
  `takeaways_json` TEXT NULL,
  `references_json` TEXT NULL,
  `iocs_json` TEXT NULL,
  `body_markdown` LONGTEXT NOT NULL,
  `rendered_html` LONGTEXT NOT NULL,
  `meta_json` LONGTEXT NULL,
  `payload_json` LONGTEXT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_roham_contents_slug` (`slug`),
  KEY `idx_roham_contents_type` (`type`),
  KEY `idx_roham_contents_category` (`category_id`),
  KEY `idx_roham_contents_status` (`status`),
  KEY `idx_roham_contents_published` (`published_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ۲. ایجاد جدول تگ‌ها و اتصال تگ‌ها
CREATE TABLE IF NOT EXISTS `roham_tags` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `name` VARCHAR(64) NOT NULL,
  `slug` VARCHAR(64) NOT NULL,
  `created_at` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_roham_tags_name` (`name`),
  UNIQUE KEY `uniq_roham_tags_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `roham_content_tags` (
  `content_id` VARCHAR(64) NOT NULL,
  `tag_name` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`content_id`, `tag_name`),
  KEY `idx_roham_content_tags_tag` (`tag_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ۳. ایجاد جدول لاگ‌های حسابرسی
CREATE TABLE IF NOT EXISTS `roham_content_audit_logs` (
  `id` VARCHAR(64) NOT NULL,
  `content_id` VARCHAR(64) NOT NULL,
  `action` VARCHAR(32) NOT NULL,
  `actor_type` VARCHAR(32) NOT NULL,
  `actor_id` VARCHAR(120) NOT NULL,
  `ip_address` VARCHAR(64) NULL,
  `user_agent` VARCHAR(255) NULL,
  `idempotency_key` VARCHAR(128) NULL,
  `changes_json` LONGTEXT NULL,
  `created_at` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_roham_audit_content` (`content_id`),
  KEY `idx_roham_audit_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ۴. ایجاد جدول Idempotency و نرخ ارسال
CREATE TABLE IF NOT EXISTS `roham_api_idempotency` (
  `idempotency_key` VARCHAR(128) NOT NULL,
  `action` VARCHAR(64) NOT NULL,
  `response_code` INT NOT NULL,
  `response_json` LONGTEXT NOT NULL,
  `created_at` VARCHAR(64) NOT NULL,
  `expires_at` INT NOT NULL,
  PRIMARY KEY (`idempotency_key`),
  KEY `idx_roham_idemp_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `roham_rate_limits` (
  `rate_key` VARCHAR(128) NOT NULL,
  `requests_count` INT NOT NULL,
  `window_start` INT NOT NULL,
  PRIMARY KEY (`rate_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ۵. راهنمای اجرای انتقال داده‌ها:
-- برای انتقال داده‌های موجود در جدول roham_content به roham_contents،
-- کافیست اسکریپت PHP مهاجرت را از طریق مرورگر یا خط فرمان فراخوانی فرمایید:
-- مسیر وب: https://your-domain.com/api/migrate.php?key=roham_ai_publisher_secret_key_2026_xyz
-- یا از طریق دستور cURL:
-- curl -X POST "https://your-domain.com/api/content.php?action=migrate" -H "X-API-KEY: roham_ai_publisher_secret_key_2026_xyz"
