-- ============================================================================
-- Roham Security & Technical Portal — MySQL Database Schema (corpel_roham)
-- نسخه: 2.0.0 (Unified Markdown & Metadata Architecture)
-- نکته: فایل public/api/db.php به صورت خودکار در اولین اتصال این جداول را می‌سازد،
-- اما در صورت تمایل می‌توانید این فایل را مستقیماً در phpMyAdmin نیز Import کنید.
-- ============================================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- ۱. جدول کاربران و مدیران
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

-- ۲. جدول سرنخ‌ها و فرم‌های مشاوره/دوره‌ها
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

-- ۳. جدول تنظیمات سراسری پرتال
CREATE TABLE IF NOT EXISTS `roham_settings` (
  `k` VARCHAR(64) NOT NULL,
  `v` LONGTEXT NOT NULL,
  PRIMARY KEY (`k`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ۴. جدول دسته‌بندی‌های رسمی محتوا
CREATE TABLE IF NOT EXISTS `roham_categories` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(190) NOT NULL,
  `slug` VARCHAR(190) NOT NULL,
  `description` TEXT NULL,
  `target_type` VARCHAR(32) NOT NULL DEFAULT 'all',
  `updated_at` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_roham_categories_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ۵. جدول نرمال‌شده و یکپارچه مقالات وبلاگ و اخبار امنیت (Unified Contents)
CREATE TABLE IF NOT EXISTS `roham_contents` (
  `id` VARCHAR(64) NOT NULL,
  `type` VARCHAR(32) NOT NULL COMMENT 'blog | news',
  `slug` VARCHAR(190) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `subtitle` VARCHAR(255) NULL,
  `summary` TEXT NOT NULL,
  `category_id` VARCHAR(64) NOT NULL,
  `category_name` VARCHAR(190) NOT NULL,
  `status` VARCHAR(32) NOT NULL DEFAULT 'published' COMMENT 'published | draft | archived',
  `severity` VARCHAR(32) NULL COMMENT 'CRITICAL | HIGH | MEDIUM | LOW | INFO',
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `is_breaking` TINYINT(1) NOT NULL DEFAULT 0,
  `difficulty` VARCHAR(64) NULL,
  `read_time_minutes` INT NOT NULL DEFAULT 5,
  `views` INT NOT NULL DEFAULT 0,
  `published_at` VARCHAR(64) NOT NULL COMMENT 'ISO 8601 UTC timestamp',
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
  `payload_json` LONGTEXT NULL COMMENT 'Backward-compatible JSON for legacy clients',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_roham_contents_slug` (`slug`),
  KEY `idx_roham_contents_type` (`type`),
  KEY `idx_roham_contents_category` (`category_id`),
  KEY `idx_roham_contents_status` (`status`),
  KEY `idx_roham_contents_published` (`published_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ۶. جدول برچسب‌ها و تگ‌های سراسری
CREATE TABLE IF NOT EXISTS `roham_tags` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `name` VARCHAR(64) NOT NULL,
  `slug` VARCHAR(64) NOT NULL,
  `created_at` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_roham_tags_name` (`name`),
  UNIQUE KEY `uniq_roham_tags_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ۷. جدول اتصال تگ‌ها به محتوا (Content Tags Relation)
CREATE TABLE IF NOT EXISTS `roham_content_tags` (
  `content_id` VARCHAR(64) NOT NULL,
  `tag_name` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`content_id`, `tag_name`),
  KEY `idx_roham_content_tags_tag` (`tag_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ۸. جدول لاگ‌های حسابرسی و ثبت تغییرات محتوا (Audit Logs)
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

-- ۹. جدول مدیریت Idempotency کلیدهای ارسال برای جلوگیری از دوباره‌کاری
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

-- ۱۰. جدول نرخ ارسال درخواست‌ها (Rate Limiting)
CREATE TABLE IF NOT EXISTS `roham_rate_limits` (
  `rate_key` VARCHAR(128) NOT NULL,
  `requests_count` INT NOT NULL,
  `window_start` INT NOT NULL,
  PRIMARY KEY (`rate_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ۱۱. جدول قدیمی جهت سازگاری گذشته‌نگر (Legacy Fallback)
CREATE TABLE IF NOT EXISTS `roham_content` (
  `id` VARCHAR(64) NOT NULL,
  `content_type` VARCHAR(32) NOT NULL,
  `status` VARCHAR(32) NOT NULL DEFAULT 'published',
  `updated_at` VARCHAR(64) NOT NULL,
  `payload_json` LONGTEXT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_roham_content_type` (`content_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ۱۲. داده‌های پیش‌فرض دسته‌بندی‌ها
INSERT IGNORE INTO `roham_categories` (`id`, `name`, `slug`, `description`, `target_type`, `updated_at`) VALUES
('cat-malware', 'بدافزارها و استیلرها', 'malware-infostealers', 'رهگیری استیلرهای مدرن (Lumma، RedLine، StealC)، باج‌افزارها و تکنیک‌های بدافزاری', 'all', '2026-04-01T00:00:00Z'),
('cat-supply-chain', 'حملات زنجیره تامین (Supply Chain)', 'supply-chain', 'تحلیل نفوذ به مخازن کد، پکیج‌های مسموم NPM/PyPI و وابستگی‌های نرم‌افزاری', 'all', '2026-04-01T00:00:00Z'),
('cat-vulnerabilities', 'تحلیل آسیب‌پذیری و اکسپلویت', 'vulnerabilities-exploits', 'تحلیل فنی زیرودی‌های فعال (0-Day)، آسیب‌پذیری‌های RCE و بایپس‌های امنیتی', 'all', '2026-04-01T00:00:00Z'),
('cat-writeups', 'گزارش‌های فنی و رایت‌آپ', 'writeups-research', 'تحقیقات عمیق باینری، کالبدشکافی ساختار فایل‌ها، دیس‌اسمبل و گزارش‌های آزمایشگاهی', 'all', '2026-04-01T00:00:00Z'),
('cat-social-eng', 'مهندسی اجتماعی و فیشینگ', 'social-engineering', 'تکنیک‌های ClickFix، صفحات جعلی، فیشینگ پیشرفته و سرقت اطلاعات با دستکاری کاربر', 'all', '2026-04-01T00:00:00Z'),
('cat-cloud', 'امنیت ابری و زیرساخت', 'cloud-infrastructure', 'امن‌سازی کانتینرها، کوبرنتیز، سرویس‌های ابری و زیرساخت‌های سازمانی', 'all', '2026-04-01T00:00:00Z'),
('cat-alerts', 'اخبار و هشدارهای فوری', 'security-alerts', 'هشدارهای لحظه‌ای، افشای داده‌ها، حوادث امنیتی جاری و توصیه‌های پدافندی فوری', 'all', '2026-04-01T00:00:00Z');
