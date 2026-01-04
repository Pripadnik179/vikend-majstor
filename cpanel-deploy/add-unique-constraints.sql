-- VikendMajstor - Add Missing UNIQUE Constraints
-- Run this script in phpMyAdmin AFTER importing mysql-export.sql
-- Date: 2026-01-04

-- Add UNIQUE constraint to feature_toggles.name
ALTER TABLE `feature_toggles` ADD UNIQUE INDEX `idx_feature_toggles_name` (`name`(255));

-- Add UNIQUE constraint to email_subscribers.email (if table exists)
-- Note: This may fail if duplicates exist - clean up first
ALTER TABLE `email_subscribers` MODIFY COLUMN `email` VARCHAR(255) NOT NULL;
ALTER TABLE `email_subscribers` ADD UNIQUE INDEX `idx_email_subscribers_email` (`email`);

-- Add UNIQUE constraint to sent_reminders_log.reminder_key
ALTER TABLE `sent_reminders_log` MODIFY COLUMN `reminder_key` VARCHAR(255) NOT NULL;
ALTER TABLE `sent_reminders_log` ADD UNIQUE INDEX `idx_sent_reminders_log_key` (`reminder_key`);

-- Verify unique constraints were added
SHOW INDEX FROM `feature_toggles`;
SHOW INDEX FROM `email_subscribers`;
SHOW INDEX FROM `sent_reminders_log`;
