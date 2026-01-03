-- VikendMajstor MySQL Database Export
-- Exported from Replit PostgreSQL Development Database
-- Date: 2026-01-03

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';

-- ============================================
-- ENUMS (MySQL uses ENUM directly in column definition)
-- ============================================

-- ============================================
-- TABLE: users
-- ============================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` VARCHAR(36) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` TEXT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `city` VARCHAR(100) DEFAULT NULL,
  `district` VARCHAR(100) DEFAULT NULL,
  `avatar_url` TEXT DEFAULT NULL,
  `role` ENUM('owner', 'renter') NOT NULL DEFAULT 'renter',
  `rating` DECIMAL(2,1) DEFAULT 0.0,
  `total_ratings` INT DEFAULT 0,
  `email_verified` TINYINT(1) NOT NULL DEFAULT 0,
  `phone_verified` TINYINT(1) NOT NULL DEFAULT 0,
  `document_verified` TINYINT(1) NOT NULL DEFAULT 0,
  `document_url` TEXT DEFAULT NULL,
  `subscription_type` ENUM('free', 'basic', 'premium') NOT NULL DEFAULT 'free',
  `subscription_status` ENUM('active', 'expired', 'cancelled') NOT NULL DEFAULT 'active',
  `subscription_start_date` DATETIME DEFAULT NULL,
  `subscription_end_date` DATETIME DEFAULT NULL,
  `is_early_adopter` TINYINT(1) NOT NULL DEFAULT 0,
  `is_premium_listing` TINYINT(1) NOT NULL DEFAULT 0,
  `premium_listing_end_date` DATETIME DEFAULT NULL,
  `free_feature_used` TINYINT(1) NOT NULL DEFAULT 0,
  `stripe_customer_id` VARCHAR(255) DEFAULT NULL,
  `total_ads_created` INT NOT NULL DEFAULT 0,
  `push_token` TEXT DEFAULT NULL,
  `is_admin` TINYINT(1) NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: categories
-- ============================================
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `icon` VARCHAR(255) DEFAULT NULL,
  `sort_order` INT DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: subcategories
-- ============================================
DROP TABLE IF EXISTS `subcategories`;
CREATE TABLE `subcategories` (
  `id` VARCHAR(36) NOT NULL,
  `category_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `icon` VARCHAR(255) DEFAULT NULL,
  `sort_order` INT DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: items
-- ============================================
DROP TABLE IF EXISTS `items`;
CREATE TABLE `items` (
  `id` VARCHAR(36) NOT NULL,
  `owner_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `category` VARCHAR(255) NOT NULL,
  `sub_category` VARCHAR(255) DEFAULT NULL,
  `category_id` VARCHAR(36) DEFAULT NULL,
  `subcategory_id` VARCHAR(36) DEFAULT NULL,
  `tool_type` VARCHAR(255) DEFAULT NULL,
  `tool_sub_type` VARCHAR(255) DEFAULT NULL,
  `brand` VARCHAR(255) DEFAULT NULL,
  `power_source` VARCHAR(100) DEFAULT NULL,
  `power_watts` INT DEFAULT NULL,
  `price_per_day` INT NOT NULL,
  `deposit` INT NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `district` VARCHAR(100) DEFAULT NULL,
  `latitude` DECIMAL(10,7) DEFAULT NULL,
  `longitude` DECIMAL(10,7) DEFAULT NULL,
  `images` JSON NOT NULL,
  `ad_type` VARCHAR(50) NOT NULL DEFAULT 'renting',
  `is_available` TINYINT(1) NOT NULL DEFAULT 1,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `rating` DECIMAL(2,1) DEFAULT 0.0,
  `total_ratings` INT DEFAULT 0,
  `expires_at` DATETIME DEFAULT NULL,
  `activity_tags` JSON DEFAULT NULL,
  `user_type` VARCHAR(50) DEFAULT 'diy',
  `rental_period` VARCHAR(50) DEFAULT 'dan',
  `has_deposit` TINYINT(1) DEFAULT 1,
  `has_delivery` TINYINT(1) DEFAULT 0,
  `weight` DECIMAL(6,2) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: bookings
-- ============================================
DROP TABLE IF EXISTS `bookings`;
CREATE TABLE `bookings` (
  `id` VARCHAR(36) NOT NULL,
  `item_id` VARCHAR(36) NOT NULL,
  `renter_id` VARCHAR(36) NOT NULL,
  `owner_id` VARCHAR(36) NOT NULL,
  `start_date` DATETIME NOT NULL,
  `end_date` DATETIME NOT NULL,
  `total_days` INT NOT NULL,
  `total_price` INT NOT NULL,
  `deposit` INT NOT NULL,
  `status` ENUM('pending', 'confirmed', 'active', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  `payment_method` VARCHAR(50) DEFAULT 'cash',
  `stripe_payment_id` VARCHAR(255) DEFAULT NULL,
  `pickup_confirmed` TINYINT(1) DEFAULT 0,
  `return_confirmed` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`item_id`) REFERENCES `items`(`id`),
  FOREIGN KEY (`renter_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: conversations
-- ============================================
DROP TABLE IF EXISTS `conversations`;
CREATE TABLE `conversations` (
  `id` VARCHAR(36) NOT NULL,
  `user1_id` VARCHAR(36) NOT NULL,
  `user2_id` VARCHAR(36) NOT NULL,
  `item_id` VARCHAR(36) DEFAULT NULL,
  `last_message_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user1_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`user2_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`item_id`) REFERENCES `items`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: messages
-- ============================================
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
  `id` VARCHAR(36) NOT NULL,
  `conversation_id` VARCHAR(36) NOT NULL,
  `sender_id` VARCHAR(36) NOT NULL,
  `receiver_id` VARCHAR(36) NOT NULL,
  `content` TEXT NOT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`),
  FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`receiver_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: reviews
-- ============================================
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` VARCHAR(36) NOT NULL,
  `booking_id` VARCHAR(36) NOT NULL,
  `item_id` VARCHAR(36) NOT NULL,
  `reviewer_id` VARCHAR(36) NOT NULL,
  `reviewee_id` VARCHAR(36) NOT NULL,
  `rating` INT NOT NULL,
  `comment` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`),
  FOREIGN KEY (`item_id`) REFERENCES `items`(`id`),
  FOREIGN KEY (`reviewer_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`reviewee_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: subscriptions
-- ============================================
DROP TABLE IF EXISTS `subscriptions`;
CREATE TABLE `subscriptions` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `type` ENUM('free', 'basic', 'premium') NOT NULL,
  `status` ENUM('active', 'expired', 'cancelled') NOT NULL DEFAULT 'active',
  `price_rsd` INT NOT NULL,
  `start_date` DATETIME NOT NULL,
  `end_date` DATETIME NOT NULL,
  `stripe_payment_intent_id` VARCHAR(255) DEFAULT NULL,
  `stripe_subscription_id` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: verification_tokens
-- ============================================
DROP TABLE IF EXISTS `verification_tokens`;
CREATE TABLE `verification_tokens` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `token` VARCHAR(255) NOT NULL UNIQUE,
  `type` VARCHAR(50) NOT NULL DEFAULT 'email',
  `expires_at` DATETIME NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: feature_toggles
-- ============================================
DROP TABLE IF EXISTS `feature_toggles`;
CREATE TABLE `feature_toggles` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `is_enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `enabled_for_percentage` INT DEFAULT 100,
  `updated_by` VARCHAR(36) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: admin_logs
-- ============================================
DROP TABLE IF EXISTS `admin_logs`;
CREATE TABLE `admin_logs` (
  `id` VARCHAR(36) NOT NULL,
  `admin_id` VARCHAR(36) NOT NULL,
  `action` VARCHAR(255) NOT NULL,
  `target_type` VARCHAR(100) DEFAULT NULL,
  `target_id` VARCHAR(36) DEFAULT NULL,
  `details` JSON DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: reported_items
-- ============================================
DROP TABLE IF EXISTS `reported_items`;
CREATE TABLE `reported_items` (
  `id` VARCHAR(36) NOT NULL,
  `item_id` VARCHAR(36) NOT NULL,
  `reporter_id` VARCHAR(36) NOT NULL,
  `reason` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
  `resolved_by` VARCHAR(36) DEFAULT NULL,
  `resolved_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: reported_users
-- ============================================
DROP TABLE IF EXISTS `reported_users`;
CREATE TABLE `reported_users` (
  `id` VARCHAR(36) NOT NULL,
  `reported_user_id` VARCHAR(36) NOT NULL,
  `reporter_id` VARCHAR(36) NOT NULL,
  `reason` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
  `resolved_by` VARCHAR(36) DEFAULT NULL,
  `resolved_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: item_views
-- ============================================
DROP TABLE IF EXISTS `item_views`;
CREATE TABLE `item_views` (
  `id` VARCHAR(36) NOT NULL,
  `item_id` VARCHAR(36) NOT NULL,
  `viewer_id` VARCHAR(36) DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DATA: users (18 records)
-- ============================================
INSERT INTO `users` (`id`, `email`, `password`, `name`, `phone`, `city`, `district`, `avatar_url`, `role`, `rating`, `total_ratings`, `email_verified`, `phone_verified`, `document_verified`, `subscription_type`, `subscription_status`, `subscription_start_date`, `subscription_end_date`, `is_early_adopter`, `is_premium_listing`, `free_feature_used`, `total_ads_created`, `push_token`, `is_admin`, `is_active`, `created_at`) VALUES
('3143835d-e481-48c0-858e-d4c42b6cd55c', 'stefan@demo.com', '928766689eb794d6becb57ed6b54ed3288322ef89e3d819b2c33b0ec08f6b56ec5f8370765e7618bca901a6b4090e30c6f6dda17b3fb2b74222559bee3d272e4.026848ea7e642e1194cca33ca4c9aa39', 'Stefan Jovanović', '+381643456789', 'Niš', 'Centar', NULL, 'owner', 4.9, 15, 0, 0, 0, 'premium', 'active', NULL, '2026-01-14 00:51:12', 0, 0, 0, 2, NULL, 0, 1, '2025-12-15 00:51:12'),
('362fd13f-e394-4627-b884-033e538c6236', 'nikola@demo.com', '928766689eb794d6becb57ed6b54ed3288322ef89e3d819b2c33b0ec08f6b56ec5f8370765e7618bca901a6b4090e30c6f6dda17b3fb2b74222559bee3d272e4.026848ea7e642e1194cca33ca4c9aa39', 'Nikola Stojanović', '+381645678901', 'Subotica', 'Centar', NULL, 'owner', 4.7, 10, 0, 0, 0, 'basic', 'active', NULL, '2026-01-14 00:51:12', 0, 0, 0, 2, NULL, 0, 1, '2025-12-15 00:51:12'),
('9724b237-816c-4db8-8e7e-880fc6207752', 'jelena@demo.com', '928766689eb794d6becb57ed6b54ed3288322ef89e3d819b2c33b0ec08f6b56ec5f8370765e7618bca901a6b4090e30c6f6dda17b3fb2b74222559bee3d272e4.026848ea7e642e1194cca33ca4c9aa39', 'Jelena Nikolić', '+381642345678', 'Novi Sad', 'Liman', NULL, 'owner', 4.5, 8, 0, 0, 0, 'premium', 'active', '2025-12-15 02:49:42', '2026-01-14 02:49:42', 1, 0, 0, 3, NULL, 0, 1, '2025-12-15 00:51:12'),
('00639111-65e8-4f19-aff3-2982797cd00f', 'ana@demo.com', '928766689eb794d6becb57ed6b54ed3288322ef89e3d819b2c33b0ec08f6b56ec5f8370765e7618bca901a6b4090e30c6f6dda17b3fb2b74222559bee3d272e4.026848ea7e642e1194cca33ca4c9aa39', 'Ana Đorđević', '+381644567890', 'Kragujevac', 'Aerodrom', NULL, 'owner', 4.2, 5, 0, 0, 0, 'premium', 'active', '2025-12-20 16:11:26', '2026-01-19 16:11:26', 1, 0, 1, 2, NULL, 0, 1, '2025-12-15 00:51:12'),
('770704ec-b269-4683-9b1d-4a40823bd97f', 'marko@demo.com', '928766689eb794d6becb57ed6b54ed3288322ef89e3d819b2c33b0ec08f6b56ec5f8370765e7618bca901a6b4090e30c6f6dda17b3fb2b74222559bee3d272e4.026848ea7e642e1194cca33ca4c9aa39', 'Marko Petrović', '+381641234567', 'Beograd', 'Novi Beograd', NULL, 'owner', 4.8, 12, 0, 0, 0, 'premium', 'active', '2025-12-20 16:23:04', '2026-01-19 16:23:04', 0, 0, 0, 2, NULL, 0, 1, '2025-12-15 00:51:12'),
('c9abe37a-1cda-494b-bbc6-eee3b0faaae7', 'spasic018@gmail.com', '79eb1f6efdeaeac897897f6c9aca26e009bd1cac94b6647d25fb19e7f4e6dc5bedd8ae1695b69a41020496ecdab1086bb833e816980579df987855aeec096764.d065834639ce5884395691a24aed356c', 'Nikola', NULL, NULL, NULL, NULL, 'renter', 0.0, 0, 1, 0, 0, 'premium', 'active', NULL, '2026-01-19 15:00:17', 1, 0, 0, 0, 'ExponentPushToken[nZBYkDNsNfINiQ3Ymdb4NM]', 0, 1, '2025-12-20 15:00:17'),
('c035bb80-a0c7-4377-84e9-749500e530c3', 'admin@vikendmajstor.rs', '7110413a410f28fd459abeaa4459015741c44e29023560badd7d039f4fcdab4abd6878d8c2412dc3ab0759b62a9c2a2090d57a952eb9e45e03553d08d797461d.26f2a4054440ed8dccd54e4903961dce', 'Administrator', NULL, 'Beograd', NULL, NULL, 'owner', 5.0, 0, 1, 0, 0, 'premium', 'active', NULL, NULL, 1, 0, 0, 0, 'ExponentPushToken[ZPNwXCJ75TrtDGrbW7yu2G]', 1, 1, '2025-12-20 16:03:42');

-- ============================================
-- DATA: categories (18 records)
-- ============================================
INSERT INTO `categories` (`id`, `name`, `slug`, `icon`, `sort_order`, `is_active`, `created_at`) VALUES
('2e975f23-1c5f-40fb-a13d-3f56b233e5dd', 'Električni alati', 'elektricni-alati', NULL, 0, 1, '2025-12-28 20:03:56'),
('4e751a07-d023-4cc9-b496-17bb6e7bfe1f', 'Akumulatorski (aku) alati', 'akumulatorski-alati', NULL, 1, 1, '2025-12-28 20:03:56'),
('9cb99f79-30cd-4ccb-9c8f-feaee45eac67', 'Ručni alati', 'rucni-alati', NULL, 2, 1, '2025-12-28 20:03:56'),
('67899525-165b-4e8e-93bd-7a9857e31e0d', 'Baštenski alati i oprema', 'bastenski-alati', NULL, 3, 1, '2025-12-28 20:03:56'),
('a16a0322-12b1-4f37-a7d9-a1b525ea9b34', 'Mašine za beton i teške radove', 'masine-beton-teski-radovi', NULL, 4, 1, '2025-12-28 20:03:56'),
('63edf9e1-cd7a-454f-80b7-37bf4e1b3cab', 'Stolarski i obrada materijala', 'stolarski-obrada-materijala', NULL, 5, 1, '2025-12-28 20:03:56'),
('ea920780-2f43-4b28-9fcb-c172bd83b4a4', 'Auto i servis', 'auto-servis', NULL, 6, 1, '2025-12-28 20:03:56'),
('47999882-82a1-41e3-a142-810819e8ce70', 'Merni alati i oprema', 'merni-alati-oprema', NULL, 7, 1, '2025-12-28 20:03:56'),
('9bdcc94d-9f04-4850-86e5-f27f4af97ae5', 'Sigurnosna i zaštitna oprema', 'sigurnosna-zastitna-oprema', NULL, 8, 1, '2025-12-28 20:03:56'),
('90cbe7ce-ffda-4824-9f20-211b27c64e80', 'Oprema za čišćenje', 'oprema-za-ciscenje', NULL, 9, 1, '2025-12-28 20:03:56'),
('c6e43087-cd9e-42db-bb59-1bc0b9ef677e', 'Ostalo / Specijalni alati', 'ostalo-specijalni-alati', NULL, 10, 1, '2025-12-28 20:03:56'),
('ab9bcee3-6ca5-4f69-a172-bedb96c13334', 'Vodoinstalaterski alati', 'vodoinstalaterski-alati', NULL, 0, 1, '2025-12-28 21:07:48'),
('4be9e81e-4a48-488f-baf0-3962a9d3211b', 'Elektroinstalaterski alati', 'elektroinstalaterski-alati', NULL, 1, 1, '2025-12-28 21:07:48'),
('2d6019c5-9cb9-4dc1-b809-b97b98e26142', 'Alati za farbanje i dekoraciju', 'alati-farbanje-dekoracija', NULL, 2, 1, '2025-12-28 21:07:48'),
('558dee82-238b-4f76-adcf-fa43736eee48', 'Alati za grejanje i klimatizaciju', 'alati-grejanje-klima', NULL, 3, 1, '2025-12-28 21:07:48'),
('93749dac-0ff3-4cdf-ab51-7531b0afc941', 'Alati za podove', 'alati-za-podove', NULL, 4, 1, '2025-12-28 21:07:48'),
('0815d959-38fc-43c6-aaf7-e11723da33a8', 'Alati za krov i fasadu', 'alati-krov-fasada', NULL, 5, 1, '2025-12-28 21:07:48'),
('834981bc-2229-49de-ac16-89b3e9627480', 'Pumpe i oprema za vodu', 'pumpe-oprema-voda', NULL, 6, 1, '2025-12-28 21:07:48');

-- ============================================
-- DATA: subcategories (partial - main ones)
-- ============================================
INSERT INTO `subcategories` (`id`, `category_id`, `name`, `slug`, `icon`, `sort_order`, `is_active`, `created_at`) VALUES
('5a5b4fbd-64f3-4341-ba05-8c2b6f0ddd97', '2e975f23-1c5f-40fb-a13d-3f56b233e5dd', 'Bušilice', 'elektricni-alati-busilice', NULL, 0, 1, '2025-12-28 20:03:56'),
('fcf81e17-2e39-4a8e-8dab-006fef0092d8', '2e975f23-1c5f-40fb-a13d-3f56b233e5dd', 'Brusilice', 'elektricni-alati-brusilice', NULL, 1, 1, '2025-12-28 20:03:56'),
('52bc6164-4c39-40a2-8569-734be47b9c9b', '2e975f23-1c5f-40fb-a13d-3f56b233e5dd', 'Testere', 'elektricni-alati-testere', NULL, 2, 1, '2025-12-28 20:03:56'),
('89350146-6c9a-4104-8bd9-1baf8f0b22ff', '2e975f23-1c5f-40fb-a13d-3f56b233e5dd', 'Štemari', 'elektricni-alati-stemari', NULL, 3, 1, '2025-12-28 20:03:56'),
('192da693-6d22-411a-9497-89df79f503af', '2e975f23-1c5f-40fb-a13d-3f56b233e5dd', 'Rendei', 'elektricni-alati-rendei', NULL, 4, 1, '2025-12-28 20:03:56'),
('ab8b00f5-e498-4247-9cfe-dc6a1505f65e', '2e975f23-1c5f-40fb-a13d-3f56b233e5dd', 'Glodalice', 'elektricni-alati-glodalice', NULL, 5, 1, '2025-12-28 20:03:56'),
('6874defb-6bb6-42dc-8e99-fbfc277cbc46', '2e975f23-1c5f-40fb-a13d-3f56b233e5dd', 'Ostalo', 'elektricni-alati-ostalo', NULL, 6, 1, '2025-12-28 20:03:56'),
('6877d47d-00f1-48e3-bc5a-3c2081d99579', '4e751a07-d023-4cc9-b496-17bb6e7bfe1f', 'Aku bušilice / odvijači', 'akumulatorski-alati-aku-busilice-odvijaci', NULL, 0, 1, '2025-12-28 20:03:56'),
('139f2752-05e1-481f-a7ba-b506eb2be755', '4e751a07-d023-4cc9-b496-17bb6e7bfe1f', 'Aku brusilice', 'akumulatorski-alati-aku-brusilice', NULL, 1, 1, '2025-12-28 20:03:56'),
('f7662981-9e9f-4d83-af1f-a6f1db390590', '4e751a07-d023-4cc9-b496-17bb6e7bfe1f', 'Aku testere', 'akumulatorski-alati-aku-testere', NULL, 2, 1, '2025-12-28 20:03:56'),
('f63974ef-2d02-4690-a05d-86cfbab6f9a1', '67899525-165b-4e8e-93bd-7a9857e31e0d', 'Kosilice', 'bastenski-alati-kosilice', NULL, 0, 1, '2025-12-28 20:03:56'),
('25232f09-e00d-4103-bcf9-e67128a97f3b', '67899525-165b-4e8e-93bd-7a9857e31e0d', 'Trimeri', 'bastenski-alati-trimeri', NULL, 1, 1, '2025-12-28 20:03:56'),
('a70d511e-b262-48f8-8c5a-99daeb97f454', '67899525-165b-4e8e-93bd-7a9857e31e0d', 'Lančane testere', 'bastenski-alati-lancane-testere', NULL, 2, 1, '2025-12-28 20:03:56'),
('131c92dd-a63a-48b2-9e59-6ff790200d36', 'a16a0322-12b1-4f37-a7d9-a1b525ea9b34', 'Betonijeri', 'masine-beton-teski-radovi-betonijeri', NULL, 0, 1, '2025-12-28 20:03:56'),
('813b6f07-71d5-4b80-9aed-3d17aead0783', 'a16a0322-12b1-4f37-a7d9-a1b525ea9b34', 'Agregati', 'masine-beton-teski-radovi-agregati', NULL, 4, 1, '2025-12-28 20:03:56'),
('06374478-9bbc-4077-bfa6-f2cc8734adc0', 'a16a0322-12b1-4f37-a7d9-a1b525ea9b34', 'Mašine za sečenje', 'masine-beton-teski-radovi-masine-za-secenje', NULL, 3, 1, '2025-12-28 20:03:56'),
('61acd394-a0e8-46d9-99ae-7621faa1793a', '90cbe7ce-ffda-4824-9f20-211b27c64e80', 'Perači pod pritiskom', 'oprema-za-ciscenje-peraci-pod-pritiskom', NULL, 0, 1, '2025-12-28 20:03:56');

-- ============================================
-- DATA: items (10 records)
-- ============================================
INSERT INTO `items` (`id`, `owner_id`, `title`, `description`, `category`, `sub_category`, `category_id`, `subcategory_id`, `tool_type`, `tool_sub_type`, `brand`, `power_source`, `power_watts`, `price_per_day`, `deposit`, `city`, `district`, `latitude`, `longitude`, `images`, `ad_type`, `is_available`, `is_featured`, `rating`, `total_ratings`, `expires_at`, `activity_tags`, `user_type`, `rental_period`, `has_deposit`, `has_delivery`, `weight`, `created_at`, `updated_at`) VALUES
('101816e8-688e-4cd7-8f15-2667d2d877a1', '770704ec-b269-4683-9b1d-4a40823bd97f', 'Bosch profesionalna bušilica GSB 18V', 'Profesionalna akumulatorska bušilica Bosch sa dva akumulatora. Idealna za bušenje u betonu, drvu i metalu. Uključena torba za nošenje i set burgija.', 'Električni alati', 'Bušilice', '2e975f23-1c5f-40fb-a13d-3f56b233e5dd', '5a5b4fbd-64f3-4341-ba05-8c2b6f0ddd97', 'Akumulatorska bušilica', NULL, 'Bosch', 'Akumulator', 650, 800, 5000, 'Beograd', 'Novi Beograd', 44.8176000, 20.4633000, '["/demo-images/busilica_makita.png"]', 'renting', 1, 1, 4.8, 6, '2026-01-14 00:51:12', NULL, 'diy', 'dan', 1, 0, NULL, '2025-12-15 00:51:12', '2025-12-15 00:51:12'),
('773e1c6b-8ea3-4517-8f57-0e8b8a8b52c6', '770704ec-b269-4683-9b1d-4a40823bd97f', 'Makita kružna testera 190mm', 'Snažna električna kružna testera za precizno sečenje drva. Dubina reza do 66mm. Laser za precizno vođenje.', 'Električni alati', 'Testere', '2e975f23-1c5f-40fb-a13d-3f56b233e5dd', '52bc6164-4c39-40a2-8569-734be47b9c9b', 'Kružna testera', NULL, 'Makita', 'Struja', 1800, 1200, 8000, 'Beograd', 'Novi Beograd', 44.8176000, 20.4633000, '["/demo-images/cirkular_bosch.png"]', 'renting', 1, 0, 4.9, 8, '2026-01-14 00:51:12', NULL, 'diy', 'dan', 1, 0, NULL, '2025-12-15 00:51:12', '2025-12-15 00:51:12'),
('34c0394a-aba8-4c17-b53a-2e29b3734863', '9724b237-816c-4db8-8e7e-880fc6207752', 'Stihl benzinska lančana testera MS 250', 'Profesionalna benzinska lančana testera za sečenje drveća i ogreva. Dužina mača 40cm. Automatsko podmazivanje lanca.', 'Baštenski alati', 'Lančane testere', '67899525-165b-4e8e-93bd-7a9857e31e0d', 'a70d511e-b262-48f8-8c5a-99daeb97f454', NULL, NULL, 'Stihl', 'Benzin', NULL, 1800, 12000, 'Novi Sad', 'Liman', 45.2671000, 19.8335000, '["/demo-images/sekac_husqvarna.png"]', 'renting', 1, 1, 4.5, 3, '2026-01-14 00:51:12', NULL, 'diy', 'dan', 1, 0, NULL, '2025-12-15 00:51:12', '2025-12-15 00:51:12'),
('05ff3fe3-e07c-449e-aed9-0fd8c3eebdac', '3143835d-e481-48c0-858e-d4c42b6cd55c', 'DeWalt ugaona brusilica 230mm', 'Profesionalna ugaona brusilica za sečenje i brušenje metala i kamena. Snaga 2200W. Uključeni zaštitni poklopac i ručka.', 'Električni alati', 'Brusilice', '2e975f23-1c5f-40fb-a13d-3f56b233e5dd', 'fcf81e17-2e39-4a8e-8dab-006fef0092d8', 'Ugaona brusilica', NULL, 'DeWalt', 'Struja', 2200, 900, 6000, 'Niš', 'Centar', 43.3209000, 21.8958000, '["/demo-images/brusilica_villager.png"]', 'renting', 1, 0, 4.9, 7, '2026-01-14 00:51:12', NULL, 'diy', 'dan', 1, 0, NULL, '2025-12-15 00:51:12', '2025-12-15 00:51:12'),
('55e448ea-12fc-482b-8b18-7881ad5ff33d', '3143835d-e481-48c0-858e-d4c42b6cd55c', 'Hilti TE 7-C SDS-Plus čekić bušilica', 'Profesionalni čekić za bušenje u betonu i zidariji. Energija udara 2.6J. Uključen kofer sa setom burgija.', 'Električni alati', 'Čekić bušilice', '2e975f23-1c5f-40fb-a13d-3f56b233e5dd', '6874defb-6bb6-42dc-8e99-fbfc277cbc46', NULL, NULL, 'Hilti', 'Struja', 800, 1100, 8000, 'Niš', 'Centar', 43.3209000, 21.8958000, '["/demo-images/busilica_makita.png"]', 'renting', 1, 0, 4.7, 5, '2026-01-14 00:51:12', NULL, 'diy', 'dan', 1, 0, NULL, '2025-12-15 00:51:12', '2025-12-15 00:51:12'),
('3bdd611c-8377-4f20-ae28-6ef1b8501655', '00639111-65e8-4f19-aff3-2982797cd00f', 'Betonijer mešalica 160L', 'Električna mešalica za beton kapaciteta 160 litara. Idealna za manje građevinske radove. Točkovi za lako premeštanje.', 'Građevinska oprema', 'Betonijeri', 'a16a0322-12b1-4f37-a7d9-a1b525ea9b34', '131c92dd-a63a-48b2-9e59-6ff790200d36', NULL, NULL, 'Lescha', 'Struja', 650, 1500, 10000, 'Kragujevac', 'Aerodrom', 44.0128000, 20.9114000, '["/demo-images/mesalica_beton_ingco.png"]', 'renting', 1, 0, 4.3, 2, '2026-01-14 00:51:12', NULL, 'diy', 'dan', 1, 0, NULL, '2025-12-15 00:51:12', '2025-12-15 00:51:12'),
('9d0662f7-206b-491e-96e3-0fba4228a5d6', '362fd13f-e394-4627-b884-033e538c6236', 'Honda agregat EU 22i', 'Tihi inverterski agregat snage 2.2kW. Idealan za kampovanje, gradilište ili rezervno napajanje. Potrošnja samo 1L/h.', 'Građevinska oprema', 'Agregati', 'a16a0322-12b1-4f37-a7d9-a1b525ea9b34', '813b6f07-71d5-4b80-9aed-3d17aead0783', NULL, NULL, 'Honda', 'Benzin', NULL, 2500, 20000, 'Subotica', 'Centar', 46.1003000, 19.6658000, '["/demo-images/glodalica_bosch.png"]', 'renting', 1, 0, 4.6, 4, '2026-01-14 00:51:12', NULL, 'diy', 'dan', 1, 0, NULL, '2025-12-15 00:51:12', '2025-12-15 00:51:12'),
('36b64494-928a-4ddf-91d9-d706cac70b6c', '362fd13f-e394-4627-b884-033e538c6236', 'Rubi mašina za sečenje pločica', 'Profesionalna mašina za sečenje keramičkih pločica do 60cm. Dijamantski disk i sistem vodenog hlađenja.', 'Građevinska oprema', 'Mašine za sečenje', 'a16a0322-12b1-4f37-a7d9-a1b525ea9b34', '06374478-9bbc-4077-bfa6-f2cc8734adc0', 'Mašina za pločice', NULL, 'Rubi', 'Struja', 800, 1200, 8000, 'Subotica', 'Centar', 46.1003000, 19.6658000, '["/demo-images/cirkular_metabo.png"]', 'renting', 1, 0, 4.8, 6, '2026-01-14 00:51:12', NULL, 'diy', 'dan', 1, 0, NULL, '2025-12-15 00:51:12', '2025-12-15 00:51:12'),
('3dbde9e8-2011-4842-ac10-2f6a78bdae1f', '9724b237-816c-4db8-8e7e-880fc6207752', 'Kärcher perač pod pritiskom K5', 'Profesionalni perač pod pritiskom za čišćenje dvorišta, automobila, fasada. Pritisak do 145 bara. Uključeno crevo od 8m.', 'Oprema za čišćenje', 'Perači pod pritiskom', '90cbe7ce-ffda-4824-9f20-211b27c64e80', '61acd394-a0e8-46d9-99ae-7621faa1793a', NULL, NULL, 'Kärcher', 'Struja', 2100, 1500, 10000, 'Novi Sad', 'Liman', 45.2671000, 19.8335000, '["/demo-images/vibrator_beton_raider.png"]', 'renting', 1, 0, 4.6, 4, '2026-01-14 00:51:12', NULL, 'diy', 'dan', 1, 0, NULL, '2025-12-15 00:51:12', '2025-12-15 00:51:12'),
('10e2a6c4-d71f-48fd-8207-5016750cec6e', '00639111-65e8-4f19-aff3-2982797cd00f', 'Bosch orbitalna brusilica GEX 125', 'Profesionalna orbitalna brusilica za finu obradu drveta. Prečnik ploče 125mm. Priključak za usisavanje prašine.', 'Električni alati', 'Brusilice', '2e975f23-1c5f-40fb-a13d-3f56b233e5dd', 'fcf81e17-2e39-4a8e-8dab-006fef0092d8', 'Orbitalna brusilica', NULL, 'Bosch', 'Struja', 350, 600, 4000, 'Kragujevac', 'Aerodrom', 44.0128000, 20.9114000, '["/demo-images/rende_makita.png"]', 'renting', 1, 1, 4.4, 3, '2026-01-14 00:51:12', NULL, 'diy', 'dan', 1, 0, NULL, '2025-12-15 00:51:12', '2025-12-15 00:51:12');

-- ============================================
-- DATA: bookings (2 records)
-- ============================================
INSERT INTO `bookings` (`id`, `item_id`, `renter_id`, `owner_id`, `start_date`, `end_date`, `total_days`, `total_price`, `deposit`, `status`, `payment_method`, `stripe_payment_id`, `pickup_confirmed`, `return_confirmed`, `created_at`, `updated_at`) VALUES
('2210accb-817c-4de5-813b-0a1bd78a16ca', '101816e8-688e-4cd7-8f15-2667d2d877a1', '9724b237-816c-4db8-8e7e-880fc6207752', '770704ec-b269-4683-9b1d-4a40823bd97f', '2025-12-23 23:00:00', '2025-12-27 23:00:00', 5, 4000, 5000, 'pending', 'cash', NULL, 0, 0, '2025-12-15 12:23:59', '2025-12-15 12:23:59'),
('973c2fc6-23ea-4278-b2fe-78c0d6b4ada4', '55e448ea-12fc-482b-8b18-7881ad5ff33d', 'c9abe37a-1cda-494b-bbc6-eee3b0faaae7', '3143835d-e481-48c0-858e-d4c42b6cd55c', '2025-12-23 23:00:00', '2025-12-26 23:00:00', 4, 4400, 8000, 'cancelled', 'cash', NULL, 0, 0, '2025-12-20 20:23:20', '2025-12-20 22:11:44');

-- ============================================
-- DATA: feature_toggles (7 records)
-- ============================================
INSERT INTO `feature_toggles` (`id`, `name`, `description`, `is_enabled`, `enabled_for_percentage`, `updated_by`, `created_at`, `updated_at`) VALUES
('20460f94-8bbb-4bb1-9f1c-3c075d3ee42b', 'guest_browsing', 'Omogucava pregledanje oglasa bez prijave', 1, 100, NULL, '2025-12-29 14:06:58', '2025-12-29 14:06:58'),
('d4f149aa-abbe-4c2c-81b5-aa9b09803027', 'early_adopter_program', 'Prvih 100 korisnika dobija premium besplatno 30 dana', 1, 100, NULL, '2025-12-29 14:06:58', '2025-12-29 14:06:58'),
('fdde3fa5-d080-4a99-8445-c6125eea96ee', 'email_notifications', 'Slanje email notifikacija korisnicima', 1, 100, NULL, '2025-12-29 14:06:58', '2025-12-29 14:06:58'),
('35682051-250e-4a8a-a61c-900a2a78c069', 'push_notifications', 'Push notifikacije za mobilnu aplikaciju', 0, 100, NULL, '2025-12-29 14:06:58', '2025-12-29 14:06:58'),
('e628a656-14c5-42ab-814c-20583fa3a971', 'location_filter', 'Filtriranje oglasa po lokaciji', 1, 100, NULL, '2025-12-29 14:06:58', '2025-12-29 14:06:58'),
('1bc6d3a1-b9c0-4e3d-8302-9aa149d31d09', 'stripe_payments', 'Stripe placanje za pretplate', 0, 100, NULL, '2025-12-29 14:06:58', '2025-12-29 14:06:58'),
('630a68a2-2d50-454f-960f-cc1a47cb64d0', 'premium_popup', 'Prikazuje popup za premium pretplatu korisnicima', 1, 100, NULL, '2025-12-29 19:19:44', '2025-12-29 19:19:44');

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- IMPORTANT NOTES:
-- ============================================
-- 1. Demo user password is: demo123 (for all demo accounts)
-- 2. Admin password for admin@vikendmajstor.rs needs to be reset
-- 3. Images paths (/demo-images/...) need to be updated to match your server
-- 4. Run this script in phpMyAdmin or MySQL CLI
-- 5. Make sure your database is set to utf8mb4 charset
