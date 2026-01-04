-- VikendMajstor MySQL Database Schema
-- Generated for cPanel deployment
-- Compatible with MySQL 8.0+

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';

-- =====================================================
-- TABLE: users
-- =====================================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `email` VARCHAR(255) NOT NULL,
  `password` TEXT NOT NULL,
  `name` TEXT NOT NULL,
  `phone` TEXT,
  `city` TEXT,
  `district` TEXT,
  `avatar_url` TEXT,
  `role` ENUM('owner', 'renter') NOT NULL DEFAULT 'renter',
  `rating` DECIMAL(2,1) DEFAULT '0',
  `total_ratings` INT DEFAULT 0,
  `email_verified` BOOLEAN NOT NULL DEFAULT FALSE,
  `phone_verified` BOOLEAN NOT NULL DEFAULT FALSE,
  `document_verified` BOOLEAN NOT NULL DEFAULT FALSE,
  `document_url` TEXT,
  `subscription_type` ENUM('free', 'basic', 'premium') NOT NULL DEFAULT 'free',
  `subscription_status` ENUM('active', 'expired', 'cancelled') NOT NULL DEFAULT 'active',
  `subscription_start_date` TIMESTAMP NULL,
  `subscription_end_date` TIMESTAMP NULL,
  `is_early_adopter` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_premium_listing` BOOLEAN NOT NULL DEFAULT FALSE,
  `premium_listing_end_date` TIMESTAMP NULL,
  `free_feature_used` BOOLEAN NOT NULL DEFAULT FALSE,
  `stripe_customer_id` TEXT,
  `total_ads_created` INT NOT NULL DEFAULT 0,
  `push_token` TEXT,
  `is_admin` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: verification_tokens
-- =====================================================
DROP TABLE IF EXISTS `verification_tokens`;
CREATE TABLE `verification_tokens` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `user_id` VARCHAR(36) NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `type` TEXT NOT NULL DEFAULT 'email',
  `expires_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `verification_tokens_token_unique` (`token`),
  KEY `verification_tokens_user_id_fk` (`user_id`),
  CONSTRAINT `verification_tokens_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: subscriptions
-- =====================================================
DROP TABLE IF EXISTS `subscriptions`;
CREATE TABLE `subscriptions` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `user_id` VARCHAR(36) NOT NULL,
  `type` ENUM('free', 'basic', 'premium') NOT NULL,
  `status` ENUM('active', 'expired', 'cancelled') NOT NULL DEFAULT 'active',
  `price_rsd` INT NOT NULL,
  `start_date` TIMESTAMP NOT NULL,
  `end_date` TIMESTAMP NOT NULL,
  `stripe_payment_intent_id` TEXT,
  `stripe_subscription_id` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `subscriptions_user_id_fk` (`user_id`),
  CONSTRAINT `subscriptions_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: categories
-- =====================================================
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `icon` TEXT,
  `sort_order` INT DEFAULT 0,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_name_unique` (`name`),
  UNIQUE KEY `categories_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: subcategories
-- =====================================================
DROP TABLE IF EXISTS `subcategories`;
CREATE TABLE `subcategories` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `category_id` VARCHAR(36) NOT NULL,
  `name` TEXT NOT NULL,
  `slug` TEXT NOT NULL,
  `icon` TEXT,
  `sort_order` INT DEFAULT 0,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `subcategories_category_id_fk` (`category_id`),
  CONSTRAINT `subcategories_category_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: items
-- =====================================================
DROP TABLE IF EXISTS `items`;
CREATE TABLE `items` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `owner_id` VARCHAR(36) NOT NULL,
  `title` TEXT NOT NULL,
  `description` TEXT NOT NULL,
  `category` TEXT NOT NULL,
  `sub_category` TEXT,
  `category_id` VARCHAR(36),
  `subcategory_id` VARCHAR(36),
  `tool_type` TEXT,
  `tool_sub_type` TEXT,
  `brand` TEXT,
  `power_source` TEXT,
  `power_watts` INT,
  `price_per_day` INT NOT NULL,
  `deposit` INT NOT NULL,
  `city` TEXT NOT NULL,
  `district` TEXT,
  `latitude` DECIMAL(10,7),
  `longitude` DECIMAL(10,7),
  `images` JSON NOT NULL DEFAULT ('[]'),
  `ad_type` TEXT NOT NULL DEFAULT 'renting',
  `is_available` BOOLEAN NOT NULL DEFAULT TRUE,
  `is_featured` BOOLEAN NOT NULL DEFAULT FALSE,
  `rating` DECIMAL(2,1) DEFAULT '0',
  `total_ratings` INT DEFAULT 0,
  `expires_at` TIMESTAMP NULL,
  `activity_tags` JSON,
  `user_type` TEXT DEFAULT 'diy',
  `rental_period` TEXT DEFAULT 'dan',
  `has_deposit` BOOLEAN DEFAULT TRUE,
  `has_delivery` BOOLEAN DEFAULT FALSE,
  `weight` DECIMAL(6,2),
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `items_owner_id_fk` (`owner_id`),
  CONSTRAINT `items_owner_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: bookings
-- =====================================================
DROP TABLE IF EXISTS `bookings`;
CREATE TABLE `bookings` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `item_id` VARCHAR(36) NOT NULL,
  `renter_id` VARCHAR(36) NOT NULL,
  `owner_id` VARCHAR(36) NOT NULL,
  `start_date` TIMESTAMP NOT NULL,
  `end_date` TIMESTAMP NOT NULL,
  `total_days` INT NOT NULL,
  `total_price` INT NOT NULL,
  `deposit` INT NOT NULL,
  `status` ENUM('pending', 'confirmed', 'active', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  `payment_method` TEXT DEFAULT 'cash',
  `stripe_payment_id` TEXT,
  `pickup_confirmed` BOOLEAN DEFAULT FALSE,
  `return_confirmed` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `bookings_item_id_fk` (`item_id`),
  KEY `bookings_renter_id_fk` (`renter_id`),
  KEY `bookings_owner_id_fk` (`owner_id`),
  CONSTRAINT `bookings_item_id_fk` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`),
  CONSTRAINT `bookings_renter_id_fk` FOREIGN KEY (`renter_id`) REFERENCES `users` (`id`),
  CONSTRAINT `bookings_owner_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: conversations
-- =====================================================
DROP TABLE IF EXISTS `conversations`;
CREATE TABLE `conversations` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `user1_id` VARCHAR(36) NOT NULL,
  `user2_id` VARCHAR(36) NOT NULL,
  `item_id` VARCHAR(36),
  `last_message_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `conversations_user1_id_fk` (`user1_id`),
  KEY `conversations_user2_id_fk` (`user2_id`),
  KEY `conversations_item_id_fk` (`item_id`),
  CONSTRAINT `conversations_user1_id_fk` FOREIGN KEY (`user1_id`) REFERENCES `users` (`id`),
  CONSTRAINT `conversations_user2_id_fk` FOREIGN KEY (`user2_id`) REFERENCES `users` (`id`),
  CONSTRAINT `conversations_item_id_fk` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: messages
-- =====================================================
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `conversation_id` VARCHAR(36) NOT NULL,
  `sender_id` VARCHAR(36) NOT NULL,
  `receiver_id` VARCHAR(36) NOT NULL,
  `content` TEXT NOT NULL,
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `messages_conversation_id_fk` (`conversation_id`),
  KEY `messages_sender_id_fk` (`sender_id`),
  KEY `messages_receiver_id_fk` (`receiver_id`),
  CONSTRAINT `messages_conversation_id_fk` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`),
  CONSTRAINT `messages_sender_id_fk` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`),
  CONSTRAINT `messages_receiver_id_fk` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: reviews
-- =====================================================
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `booking_id` VARCHAR(36) NOT NULL,
  `item_id` VARCHAR(36) NOT NULL,
  `reviewer_id` VARCHAR(36) NOT NULL,
  `reviewee_id` VARCHAR(36) NOT NULL,
  `rating` INT NOT NULL,
  `comment` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `reviews_booking_id_fk` (`booking_id`),
  KEY `reviews_item_id_fk` (`item_id`),
  KEY `reviews_reviewer_id_fk` (`reviewer_id`),
  KEY `reviews_reviewee_id_fk` (`reviewee_id`),
  CONSTRAINT `reviews_booking_id_fk` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`),
  CONSTRAINT `reviews_item_id_fk` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`),
  CONSTRAINT `reviews_reviewer_id_fk` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `reviews_reviewee_id_fk` FOREIGN KEY (`reviewee_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: subscription_plans
-- =====================================================
DROP TABLE IF EXISTS `subscription_plans`;
CREATE TABLE `subscription_plans` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `name` VARCHAR(255) NOT NULL,
  `display_name` TEXT NOT NULL,
  `description` TEXT,
  `price_rsd` INT NOT NULL,
  `duration_days` INT NOT NULL DEFAULT 30,
  `max_ads` INT,
  `features` JSON,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `subscription_plans_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: item_views
-- =====================================================
DROP TABLE IF EXISTS `item_views`;
CREATE TABLE `item_views` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `item_id` VARCHAR(36) NOT NULL,
  `viewer_id` VARCHAR(36),
  `ip_address` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `item_views_item_id_fk` (`item_id`),
  KEY `item_views_viewer_id_fk` (`viewer_id`),
  CONSTRAINT `item_views_item_id_fk` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`),
  CONSTRAINT `item_views_viewer_id_fk` FOREIGN KEY (`viewer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: reported_users
-- =====================================================
DROP TABLE IF EXISTS `reported_users`;
CREATE TABLE `reported_users` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `reporter_id` VARCHAR(36) NOT NULL,
  `reported_user_id` VARCHAR(36) NOT NULL,
  `reason` TEXT NOT NULL,
  `description` TEXT,
  `status` TEXT NOT NULL DEFAULT 'pending',
  `admin_notes` TEXT,
  `resolved_by` VARCHAR(36),
  `resolved_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `reported_users_reporter_id_fk` (`reporter_id`),
  KEY `reported_users_reported_user_id_fk` (`reported_user_id`),
  KEY `reported_users_resolved_by_fk` (`resolved_by`),
  CONSTRAINT `reported_users_reporter_id_fk` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`),
  CONSTRAINT `reported_users_reported_user_id_fk` FOREIGN KEY (`reported_user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `reported_users_resolved_by_fk` FOREIGN KEY (`resolved_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: server_error_logs
-- =====================================================
DROP TABLE IF EXISTS `server_error_logs`;
CREATE TABLE `server_error_logs` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `level` TEXT NOT NULL DEFAULT 'error',
  `message` TEXT NOT NULL,
  `stack` TEXT,
  `endpoint` TEXT,
  `method` TEXT,
  `user_id` VARCHAR(36),
  `ip_address` TEXT,
  `user_agent` TEXT,
  `metadata` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `server_error_logs_user_id_fk` (`user_id`),
  CONSTRAINT `server_error_logs_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: admin_2fa
-- =====================================================
DROP TABLE IF EXISTS `admin_2fa`;
CREATE TABLE `admin_2fa` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `user_id` VARCHAR(36) NOT NULL,
  `secret` TEXT NOT NULL,
  `is_enabled` BOOLEAN NOT NULL DEFAULT FALSE,
  `backup_codes` JSON,
  `last_used_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `admin_2fa_user_id_fk` (`user_id`),
  CONSTRAINT `admin_2fa_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: app_versions
-- =====================================================
DROP TABLE IF EXISTS `app_versions`;
CREATE TABLE `app_versions` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `platform` TEXT NOT NULL,
  `version` TEXT NOT NULL,
  `build_number` INT,
  `release_notes` TEXT,
  `is_required` BOOLEAN NOT NULL DEFAULT FALSE,
  `download_url` TEXT,
  `released_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: email_subscribers
-- =====================================================
DROP TABLE IF EXISTS `email_subscribers`;
CREATE TABLE `email_subscribers` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `email` VARCHAR(255) NOT NULL,
  `source` TEXT DEFAULT 'landing_page',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_subscribers_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: admin_logs
-- =====================================================
DROP TABLE IF EXISTS `admin_logs`;
CREATE TABLE `admin_logs` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `admin_id` VARCHAR(36) NOT NULL,
  `action` TEXT NOT NULL,
  `target_type` TEXT,
  `target_id` TEXT,
  `details` TEXT,
  `ip_address` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `admin_logs_admin_id_fk` (`admin_id`),
  CONSTRAINT `admin_logs_admin_id_fk` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: user_activity_logs
-- =====================================================
DROP TABLE IF EXISTS `user_activity_logs`;
CREATE TABLE `user_activity_logs` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `user_id` VARCHAR(36) NOT NULL,
  `action` TEXT NOT NULL,
  `details` TEXT,
  `ip_address` TEXT,
  `user_agent` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_activity_logs_user_id_fk` (`user_id`),
  CONSTRAINT `user_activity_logs_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: reported_items
-- =====================================================
DROP TABLE IF EXISTS `reported_items`;
CREATE TABLE `reported_items` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `item_id` VARCHAR(36) NOT NULL,
  `reporter_id` VARCHAR(36) NOT NULL,
  `reason` TEXT NOT NULL,
  `description` TEXT,
  `status` TEXT NOT NULL DEFAULT 'pending',
  `resolved_by` VARCHAR(36),
  `resolved_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `reported_items_item_id_fk` (`item_id`),
  KEY `reported_items_reporter_id_fk` (`reporter_id`),
  KEY `reported_items_resolved_by_fk` (`resolved_by`),
  CONSTRAINT `reported_items_item_id_fk` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`),
  CONSTRAINT `reported_items_reporter_id_fk` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`),
  CONSTRAINT `reported_items_resolved_by_fk` FOREIGN KEY (`resolved_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: feature_toggles
-- =====================================================
DROP TABLE IF EXISTS `feature_toggles`;
CREATE TABLE `feature_toggles` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `is_enabled` BOOLEAN NOT NULL DEFAULT TRUE,
  `enabled_for_percentage` INT DEFAULT 100,
  `updated_by` VARCHAR(36),
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `feature_toggles_name_unique` (`name`),
  KEY `feature_toggles_updated_by_fk` (`updated_by`),
  CONSTRAINT `feature_toggles_updated_by_fk` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: admin_notifications
-- =====================================================
DROP TABLE IF EXISTS `admin_notifications`;
CREATE TABLE `admin_notifications` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `admin_id` VARCHAR(36) NOT NULL,
  `type` TEXT NOT NULL,
  `title` TEXT NOT NULL,
  `message` TEXT NOT NULL,
  `target_type` TEXT,
  `target_ids` JSON,
  `sent_count` INT DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `admin_notifications_admin_id_fk` (`admin_id`),
  CONSTRAINT `admin_notifications_admin_id_fk` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: sent_reminders_log
-- =====================================================
DROP TABLE IF EXISTS `sent_reminders_log`;
CREATE TABLE `sent_reminders_log` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `booking_id` VARCHAR(36) NOT NULL,
  `reminder_type` TEXT NOT NULL,
  `sent_date` TEXT NOT NULL,
  `reminder_key` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sent_reminders_log_reminder_key_unique` (`reminder_key`),
  KEY `sent_reminders_log_booking_id_fk` (`booking_id`),
  CONSTRAINT `sent_reminders_log_booking_id_fk` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- DEMO DATA: Admin user (password: Admin123!)
-- Hash is scrypt format - you need to create new admin via registration
-- =====================================================
INSERT INTO `users` (`id`, `email`, `password`, `name`, `phone`, `city`, `role`, `email_verified`, `is_admin`, `subscription_type`, `is_early_adopter`, `created_at`) VALUES
('admin-001', 'admin@vikendmajstor.rs', 'demo_password_change_after_first_login', 'Administrator', '+381601234567', 'Beograd', 'owner', TRUE, TRUE, 'premium', TRUE, NOW());

-- =====================================================
-- DEMO DATA: Test users (for testing only - remove in production)
-- =====================================================
INSERT INTO `users` (`id`, `email`, `password`, `name`, `phone`, `city`, `district`, `role`, `email_verified`, `subscription_type`, `is_early_adopter`, `rating`, `total_ratings`, `created_at`) VALUES
('user-owner-001', 'vlasnik@test.rs', 'demo_password', 'Marko Vlasnik', '+381621111111', 'Beograd', 'Vracar', 'owner', TRUE, 'premium', TRUE, '4.8', 25, NOW()),
('user-owner-002', 'petar@test.rs', 'demo_password', 'Petar Majstor', '+381622222222', 'Novi Sad', 'Detelinara', 'owner', TRUE, 'basic', FALSE, '4.5', 12, NOW()),
('user-renter-001', 'korisnik@test.rs', 'demo_password', 'Ana Korisnik', '+381623333333', 'Nis', 'Palilula', 'renter', TRUE, 'free', FALSE, '4.9', 8, NOW());

-- =====================================================
-- DEMO DATA: Categories
-- =====================================================
INSERT INTO `categories` (`id`, `name`, `slug`, `icon`, `sort_order`, `is_active`) VALUES
('cat-001', 'Elektricni alati', 'elektricni-alati', 'zap', 1, TRUE),
('cat-002', 'Akumulatorski alati', 'akumulatorski-alati', 'battery', 2, TRUE),
('cat-003', 'Rucni alati', 'rucni-alati', 'wrench', 3, TRUE),
('cat-004', 'Bastenski alati', 'bastenski-alati', 'tree', 4, TRUE),
('cat-005', 'Masine za beton', 'masine-beton', 'hard-drive', 5, TRUE),
('cat-006', 'Stolarski alati', 'stolarski-alati', 'layers', 6, TRUE),
('cat-007', 'Auto i servis', 'auto-servis', 'tool', 7, TRUE),
('cat-008', 'Merni alati', 'merni-alati', 'compass', 8, TRUE),
('cat-009', 'Oprema za ciscenje', 'oprema-ciscenje', 'droplet', 9, TRUE);

-- =====================================================
-- DEMO DATA: Subcategories
-- =====================================================
INSERT INTO `subcategories` (`id`, `category_id`, `name`, `slug`, `sort_order`, `is_active`) VALUES
('sub-001', 'cat-001', 'Busilice', 'busilice', 1, TRUE),
('sub-002', 'cat-001', 'Brusilice', 'brusilice', 2, TRUE),
('sub-003', 'cat-001', 'Testere', 'testere', 3, TRUE),
('sub-004', 'cat-001', 'Rendei', 'rendei', 4, TRUE),
('sub-005', 'cat-001', 'Glodalice', 'glodalice', 5, TRUE),
('sub-006', 'cat-004', 'Kosilice', 'kosilice', 1, TRUE),
('sub-007', 'cat-004', 'Trimeri', 'trimeri', 2, TRUE),
('sub-008', 'cat-005', 'Betonijeri', 'betonijeri', 1, TRUE),
('sub-009', 'cat-005', 'Vibratori', 'vibratori', 2, TRUE),
('sub-010', 'cat-005', 'Sekaci', 'sekaci', 3, TRUE);

-- =====================================================
-- DEMO DATA: Items (tools)
-- =====================================================
INSERT INTO `items` (`id`, `owner_id`, `title`, `description`, `category`, `sub_category`, `category_id`, `subcategory_id`, `brand`, `power_source`, `power_watts`, `price_per_day`, `deposit`, `city`, `district`, `latitude`, `longitude`, `images`, `is_available`, `is_featured`, `rating`, `total_ratings`, `expires_at`, `created_at`) VALUES
('item-001', 'user-owner-001', 'Makita busilica HR2470', 'Profesionalna udarna busilica Makita HR2470 sa SDS-Plus prihvatom. Idealna za busenje u betonu, cigli i kamenu. Snaga 780W, broj udaraca 4500/min.', 'Elektricni alati', 'Busilice', 'cat-001', 'sub-001', 'Makita', 'Elektricni (struja)', 780, 800, 5000, 'Beograd', 'Vracar', 44.8040, 20.4651, '["/demo-images/busilica_makita.png"]', TRUE, TRUE, '4.9', 15, DATE_ADD(NOW(), INTERVAL 30 DAY), NOW()),
('item-002', 'user-owner-001', 'Bosch cirkular GKS 190', 'Rucna kruzna testera Bosch GKS 190 Professional. Precnik diska 190mm, dubina reza 70mm. Snaga 1400W.', 'Elektricni alati', 'Testere', 'cat-001', 'sub-003', 'Bosch', 'Elektricni (struja)', 1400, 1000, 8000, 'Beograd', 'Novi Beograd', 44.8176, 20.4199, '["/demo-images/cirkular_bosch.png"]', TRUE, TRUE, '4.7', 8, DATE_ADD(NOW(), INTERVAL 30 DAY), NOW()),
('item-003', 'user-owner-002', 'Villager brusilica VPG 2400', 'Ugaona brusilica Villager sa diskom 230mm. Snaga 2400W, idealna za secenje i brusenje metala i kamena.', 'Elektricni alati', 'Brusilice', 'cat-001', 'sub-002', 'Villager', 'Elektricni (struja)', 2400, 600, 4000, 'Novi Sad', 'Detelinara', 45.2671, 19.8335, '["/demo-images/brusilica_villager.png"]', TRUE, FALSE, '4.5', 6, DATE_ADD(NOW(), INTERVAL 30 DAY), NOW()),
('item-004', 'user-owner-002', 'Metabo cirkular KS 55 FS', 'Rucna kruzna testera Metabo KS 55 FS. Disk 160mm, dubina reza 55mm. Precizna vodilica ukljucena.', 'Elektricni alati', 'Testere', 'cat-001', 'sub-003', 'Metabo', 'Elektricni (struja)', 1200, 900, 6000, 'Novi Sad', 'Liman', 45.2442, 19.8410, '["/demo-images/cirkular_metabo.png"]', TRUE, FALSE, '4.6', 4, DATE_ADD(NOW(), INTERVAL 30 DAY), NOW()),
('item-005', 'user-owner-001', 'Bosch glodalica POF 1400 ACE', 'Vertikalna glodalica Bosch POF 1400 ACE. Snaga 1400W, hod 55mm. Idealna za profilisanje, utore i preciznu obradu drveta.', 'Elektricni alati', 'Glodalice', 'cat-001', 'sub-005', 'Bosch', 'Elektricni (struja)', 1400, 1200, 10000, 'Beograd', 'Zvezdara', 44.7866, 20.5001, '["/demo-images/glodalica_bosch.png"]', TRUE, TRUE, '4.8', 10, DATE_ADD(NOW(), INTERVAL 30 DAY), NOW()),
('item-006', 'user-owner-001', 'Makita rende KP0800', 'Elektricni rende Makita KP0800. Sirina hobla 82mm, dubina struganja 2.5mm. Lagan i kompaktan.', 'Elektricni alati', 'Rendei', 'cat-001', 'sub-004', 'Makita', 'Elektricni (struja)', 620, 700, 5000, 'Beograd', 'Vracar', 44.8040, 20.4651, '["/demo-images/rende_makita.png"]', TRUE, FALSE, '4.4', 3, DATE_ADD(NOW(), INTERVAL 30 DAY), NOW()),
('item-007', 'user-owner-002', 'Villager ubodna testera VJS 900', 'Ubodna testera Villager VJS 900. Snaga 650W, broj hodova 3000/min. Za drvo, metal i plastiku.', 'Elektricni alati', 'Testere', 'cat-001', 'sub-003', 'Villager', 'Elektricni (struja)', 650, 500, 3000, 'Novi Sad', 'Petrovaradin', 45.2548, 19.8606, '["/demo-images/ubodna_testera_villager.png"]', TRUE, FALSE, '4.3', 5, DATE_ADD(NOW(), INTERVAL 30 DAY), NOW()),
('item-008', 'user-owner-001', 'Husqvarna sekac K535i', 'Akumulatorski sekac Husqvarna K535i za beton i asfalt. Disk 230mm, bez izduvnih gasova.', 'Masine za beton', 'Sekaci', 'cat-005', 'sub-010', 'Husqvarna', 'Akumulator', 0, 2500, 15000, 'Beograd', 'Zemun', 44.8445, 20.4065, '["/demo-images/sekac_husqvarna.png"]', TRUE, TRUE, '4.9', 7, DATE_ADD(NOW(), INTERVAL 30 DAY), NOW()),
('item-009', 'user-owner-002', 'INGCO mesalica za beton', 'Profesionalna mesalica za beton INGCO kapaciteta 120L. Motorna, sa tockovima za lako premestanje.', 'Masine za beton', 'Betonijeri', 'cat-005', 'sub-008', 'INGCO', 'Elektricni (struja)', 550, 1500, 10000, 'Novi Sad', 'Sajmiste', 45.2600, 19.8165, '["/demo-images/mesalica_beton_ingco.png"]', TRUE, FALSE, '4.6', 9, DATE_ADD(NOW(), INTERVAL 30 DAY), NOW()),
('item-010', 'user-owner-001', 'Raider vibrator za beton', 'Elektricni vibrator za beton Raider. Duzina igle 35mm, pogonski motor 1500W. Za izlivanje temelja i ploca.', 'Masine za beton', 'Vibratori', 'cat-005', 'sub-009', 'Raider', 'Elektricni (struja)', 1500, 1800, 8000, 'Beograd', 'Cukarica', 44.7856, 20.4169, '["/demo-images/vibrator_beton_raider.png"]', TRUE, FALSE, '4.7', 4, DATE_ADD(NOW(), INTERVAL 30 DAY), NOW());

-- =====================================================
-- DEMO DATA: Subscription plans
-- =====================================================
INSERT INTO `subscription_plans` (`id`, `name`, `display_name`, `description`, `price_rsd`, `duration_days`, `max_ads`, `features`, `is_active`, `sort_order`) VALUES
('plan-free', 'free', 'Besplatno', 'Osnovna funkcionalnost za pocetnike', 0, 30, 5, '["5 oglasa", "Osnovne funkcije", "Email podrska"]', TRUE, 1),
('plan-basic', 'basic', 'Standard', 'Za aktivne korisnike koji zele vise', 500, 30, 20, '["20 oglasa", "Prioritetna podrska", "Statistika oglasa", "Istaknuti oglasi"]', TRUE, 2),
('plan-premium', 'premium', 'Premium', 'Za profesionalce i firme', 1000, 30, NULL, '["Neograniceni oglasi", "VIP podrska", "Detaljna analitika", "Istaknuti oglasi", "Premium bedz", "Prioritet u pretrazi"]', TRUE, 3);

-- =====================================================
-- DEMO DATA: Feature toggles
-- =====================================================
INSERT INTO `feature_toggles` (`id`, `name`, `description`, `is_enabled`, `enabled_for_percentage`) VALUES
('ft-001', 'registration', 'Omoguci registraciju novih korisnika', TRUE, 100),
('ft-002', 'booking', 'Omoguci rezervacije', TRUE, 100),
('ft-003', 'messaging', 'Omoguci poruke izmedju korisnika', TRUE, 100),
('ft-004', 'reviews', 'Omoguci recenzije', TRUE, 100),
('ft-005', 'push_notifications', 'Omoguci push notifikacije', TRUE, 100),
('ft-006', 'email_notifications', 'Omoguci email notifikacije', TRUE, 100);

-- =====================================================
-- DEMO DATA: App versions
-- =====================================================
INSERT INTO `app_versions` (`id`, `platform`, `version`, `build_number`, `release_notes`, `is_required`) VALUES
('ver-ios-001', 'ios', '1.0.0', 1, 'Prva verzija aplikacije', FALSE),
('ver-android-001', 'android', '1.0.0', 1, 'Prva verzija aplikacije', FALSE);

-- =====================================================
-- IMPORTANT: After import, create a real admin user!
-- Go to the app, register with your email, then run:
-- UPDATE users SET is_admin = TRUE WHERE email = 'your@email.rs';
-- =====================================================
