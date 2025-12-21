-- VikendMajstor MySQL Database Schema
-- Run this script in your cPanel MySQL database (phpMyAdmin or SSH)

SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables if they exist (be careful in production!)
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `messages`;
DROP TABLE IF EXISTS `conversations`;
DROP TABLE IF EXISTS `bookings`;
DROP TABLE IF EXISTS `items`;
DROP TABLE IF EXISTS `subscriptions`;
DROP TABLE IF EXISTS `verification_tokens`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- Users table
CREATE TABLE `users` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` TEXT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50),
  `city` VARCHAR(255),
  `district` VARCHAR(255),
  `avatar_url` TEXT,
  `role` ENUM('owner', 'renter') NOT NULL DEFAULT 'renter',
  `rating` DECIMAL(2, 1) DEFAULT '0',
  `total_ratings` INT DEFAULT 0,
  `email_verified` BOOLEAN NOT NULL DEFAULT FALSE,
  `subscription_type` ENUM('free', 'basic', 'premium') NOT NULL DEFAULT 'free',
  `subscription_status` ENUM('active', 'expired', 'cancelled') NOT NULL DEFAULT 'active',
  `subscription_start_date` TIMESTAMP NULL,
  `subscription_end_date` TIMESTAMP NULL,
  `is_early_adopter` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_premium_listing` BOOLEAN NOT NULL DEFAULT FALSE,
  `premium_listing_end_date` TIMESTAMP NULL,
  `free_feature_used` BOOLEAN NOT NULL DEFAULT FALSE,
  `stripe_customer_id` VARCHAR(255),
  `total_ads_created` INT NOT NULL DEFAULT 0,
  `push_token` TEXT,
  `is_admin` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verification tokens table
CREATE TABLE `verification_tokens` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `user_id` VARCHAR(36) NOT NULL,
  `token` VARCHAR(255) NOT NULL UNIQUE,
  `type` VARCHAR(50) NOT NULL DEFAULT 'email',
  `expires_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Subscriptions table
CREATE TABLE `subscriptions` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `user_id` VARCHAR(36) NOT NULL,
  `type` ENUM('free', 'basic', 'premium') NOT NULL,
  `status` ENUM('active', 'expired', 'cancelled') NOT NULL DEFAULT 'active',
  `price_rsd` INT NOT NULL,
  `start_date` TIMESTAMP NOT NULL,
  `end_date` TIMESTAMP NOT NULL,
  `stripe_payment_intent_id` VARCHAR(255),
  `stripe_subscription_id` VARCHAR(255),
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Items table
CREATE TABLE `items` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `owner_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `sub_category` VARCHAR(100),
  `tool_type` VARCHAR(100),
  `tool_sub_type` VARCHAR(100),
  `brand` VARCHAR(100),
  `power_source` VARCHAR(100),
  `power_watts` INT,
  `price_per_day` INT NOT NULL,
  `deposit` INT NOT NULL,
  `city` VARCHAR(255) NOT NULL,
  `district` VARCHAR(255),
  `latitude` DECIMAL(10, 7),
  `longitude` DECIMAL(10, 7),
  `images` JSON NOT NULL DEFAULT '[]',
  `ad_type` VARCHAR(50) NOT NULL DEFAULT 'renting',
  `is_available` BOOLEAN NOT NULL DEFAULT TRUE,
  `is_featured` BOOLEAN NOT NULL DEFAULT FALSE,
  `rating` DECIMAL(2, 1) DEFAULT '0',
  `total_ratings` INT DEFAULT 0,
  `expires_at` TIMESTAMP NULL,
  `activity_tags` JSON,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bookings table
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
  `payment_method` VARCHAR(50) DEFAULT 'cash',
  `stripe_payment_id` VARCHAR(255),
  `pickup_confirmed` BOOLEAN DEFAULT FALSE,
  `return_confirmed` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`renter_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Conversations table
CREATE TABLE `conversations` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `user1_id` VARCHAR(36) NOT NULL,
  `user2_id` VARCHAR(36) NOT NULL,
  `item_id` VARCHAR(36),
  `last_message_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user1_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user2_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Messages table
CREATE TABLE `messages` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `conversation_id` VARCHAR(36) NOT NULL,
  `sender_id` VARCHAR(36) NOT NULL,
  `receiver_id` VARCHAR(36) NOT NULL,
  `content` TEXT NOT NULL,
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`receiver_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reviews table
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
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`reviewer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`reviewee_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for better performance
CREATE INDEX `idx_users_email` ON `users`(`email`);
CREATE INDEX `idx_items_owner` ON `items`(`owner_id`);
CREATE INDEX `idx_items_category` ON `items`(`category`);
CREATE INDEX `idx_items_city` ON `items`(`city`);
CREATE INDEX `idx_items_available` ON `items`(`is_available`);
CREATE INDEX `idx_bookings_renter` ON `bookings`(`renter_id`);
CREATE INDEX `idx_bookings_owner` ON `bookings`(`owner_id`);
CREATE INDEX `idx_bookings_item` ON `bookings`(`item_id`);
CREATE INDEX `idx_messages_conversation` ON `messages`(`conversation_id`);
CREATE INDEX `idx_verification_tokens_token` ON `verification_tokens`(`token`);

-- Create admin user (password: Caralazara13 - hashed with scrypt)
-- You'll need to generate this hash using the app's auth system or update manually
INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`, `email_verified`, `is_admin`, `is_active`, `subscription_type`, `subscription_status`)
VALUES (
  UUID(),
  'admin@vikendmajstor.rs',
  '$scrypt$N=32768,r=8,p=1$OvWY5BfxnXpDtR+JQzqLxQ$0t3U4vTxR9HhJ0nBLPwKQzFgM9GJx+YxPkqNzLRPJJU',
  'Admin',
  'owner',
  TRUE,
  TRUE,
  TRUE,
  'premium',
  'active'
);

SELECT 'Database tables created successfully!' AS status;
