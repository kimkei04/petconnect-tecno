-- PetConnect Database Migration v2
-- Upgrades the existing schema to capstone grade without losing existing data

USE `petconnect`;

SET FOREIGN_KEY_CHECKS = 0;

-- Drop new tables if they exist to ensure clean re-run
DROP TABLE IF EXISTS `pet_photos`;
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `stray_reports`;
DROP TABLE IF EXISTS `adoption_listings`;
DROP TABLE IF EXISTS `ownership_transfers`;
DROP TABLE IF EXISTS `scan_logs`;
DROP TABLE IF EXISTS `community_sightings`;
DROP TABLE IF EXISTS `lost_pet_reports`;
DROP TABLE IF EXISTS `emergency_contacts`;
DROP TABLE IF EXISTS `medical_records`;
DROP TABLE IF EXISTS `vaccinations`;
DROP TABLE IF EXISTS `vaccination_campaigns`;
DROP TABLE IF EXISTS `nfc_tags`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `alerts`;

-- 1. Upgrade `users` table
-- Check if columns exist first or just drop/recreate them? Since users contains passwords, we alter them.
-- In case the columns exist already, ALTER TABLE might fail. Let's make sure it's clean by resetting first.
-- We already reset the DB using `petconnect_lahug.sql`. So users does NOT have these columns yet.
ALTER TABLE `users` MODIFY COLUMN `role` ENUM('owner', 'lgu', 'admin') DEFAULT 'owner';
ALTER TABLE `users` ADD COLUMN `barangay` VARCHAR(100) DEFAULT NULL AFTER `role`;
ALTER TABLE `users` ADD COLUMN `clinic_name` VARCHAR(255) DEFAULT NULL AFTER `barangay`;
ALTER TABLE `users` ADD COLUMN `license_number` VARCHAR(100) DEFAULT NULL AFTER `clinic_name`;
ALTER TABLE `users` ADD COLUMN `avatar_url` TEXT DEFAULT NULL AFTER `license_number`;
ALTER TABLE `users` ADD COLUMN `email_verified` TINYINT(1) DEFAULT 0 AFTER `avatar_url`;
ALTER TABLE `users` ADD COLUMN `is_active` TINYINT(1) DEFAULT 1 AFTER `email_verified`;
ALTER TABLE `users` ADD COLUMN `last_login` TIMESTAMP NULL DEFAULT NULL AFTER `is_active`;
ALTER TABLE `users` ADD COLUMN `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`;

-- 2. Upgrade `pets` table
ALTER TABLE `pets` MODIFY COLUMN `status` ENUM('healthy', 'lost', 'deceased', 'transferred') DEFAULT 'healthy';
ALTER TABLE `pets` ADD COLUMN `sex` ENUM('Male', 'Female', 'Unknown') DEFAULT 'Unknown' AFTER `breed`;
ALTER TABLE `pets` ADD COLUMN `date_of_birth` DATE DEFAULT NULL AFTER `sex`;
ALTER TABLE `pets` ADD COLUMN `microchip_id` VARCHAR(100) DEFAULT NULL AFTER `photo_url`;
ALTER TABLE `pets` ADD COLUMN `barangay` VARCHAR(100) DEFAULT NULL AFTER `status`;
ALTER TABLE `pets` ADD COLUMN `hide_address` TINYINT(1) DEFAULT 0 AFTER `hide_phone`;
ALTER TABLE `pets` ADD COLUMN `hide_medical` TINYINT(1) DEFAULT 0 AFTER `hide_address`;
ALTER TABLE `pets` ADD COLUMN `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`;

-- 3. Create `notifications` table
CREATE TABLE `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `pet_id` INT DEFAULT NULL,
  `type` ENUM('scan', 'sighting', 'vaccine_reminder', 'medical', 'transfer', 'lost_alert', 'system') NOT NULL,
  `title` VARCHAR(255) DEFAULT NULL,
  `message` TEXT DEFAULT NULL,
  `latitude` DECIMAL(10,8) DEFAULT NULL,
  `longitude` DECIMAL(11,8) DEFAULT NULL,
  `is_read` TINYINT(1) DEFAULT 0,
  `action_url` VARCHAR(500) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 4. Create `nfc_tags` table
CREATE TABLE `nfc_tags` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tag_uid` VARCHAR(50) UNIQUE NOT NULL,
  `pet_id` INT DEFAULT NULL,
  `qr_code_url` TEXT DEFAULT NULL,
  `status` ENUM('active', 'deactivated', 'unregistered') DEFAULT 'unregistered',
  `activated_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Initialize nfc_tags from existing pets `tag_id`
INSERT INTO `nfc_tags` (`tag_uid`, `pet_id`, `status`, `activated_at`)
SELECT `tag_id`, `id`, 'active', `created_at`
FROM `pets`
WHERE `tag_id` IS NOT NULL AND `tag_id` != '';

-- 5. Create `vaccination_campaigns` table
CREATE TABLE `vaccination_campaigns` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `created_by` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `vaccine_type` VARCHAR(255) DEFAULT NULL,
  `target_barangay` VARCHAR(100) DEFAULT NULL,
  `campaign_date` DATE DEFAULT NULL,
  `location` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('upcoming', 'active', 'completed', 'cancelled') DEFAULT 'upcoming',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 6. Create `vaccinations` table
CREATE TABLE `vaccinations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pet_id` INT NOT NULL,
  `vaccine_name` VARCHAR(255) NOT NULL,
  `date_given` DATE NOT NULL,
  `next_due_date` DATE DEFAULT NULL,
  `administered_by` INT DEFAULT NULL,
  `clinic_name` VARCHAR(255) DEFAULT NULL,
  `batch_number` VARCHAR(100) DEFAULT NULL,
  `campaign_id` INT DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `certificate_url` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`administered_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`campaign_id`) REFERENCES `vaccination_campaigns` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 7. Create `medical_records` table
CREATE TABLE `medical_records` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pet_id` INT NOT NULL,
  `record_type` ENUM('checkup', 'treatment', 'surgery', 'diagnosis', 'lab_result', 'other') NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `diagnosis` TEXT DEFAULT NULL,
  `treatment` TEXT DEFAULT NULL,
  `vet_id` INT DEFAULT NULL,
  `attachment_url` TEXT DEFAULT NULL,
  `record_date` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`vet_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 8. Create `emergency_contacts` table
CREATE TABLE `emergency_contacts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pet_id` INT NOT NULL,
  `contact_name` VARCHAR(255) NOT NULL,
  `contact_phone` VARCHAR(50) NOT NULL,
  `relationship` VARCHAR(100) DEFAULT NULL,
  `is_primary` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 9. Create `lost_pet_reports` table
CREATE TABLE `lost_pet_reports` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pet_id` INT NOT NULL,
  `reporter_id` INT NOT NULL,
  `last_seen_location` VARCHAR(255) DEFAULT NULL,
  `last_seen_lat` DECIMAL(10,8) DEFAULT NULL,
  `last_seen_lng` DECIMAL(11,8) DEFAULT NULL,
  `reward_amount` VARCHAR(100) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `contact_instructions` TEXT DEFAULT NULL,
  `status` ENUM('active', 'resolved', 'expired') DEFAULT 'active',
  `resolved_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Initialize lost_pet_reports from existing lost pets
INSERT INTO `lost_pet_reports` (`pet_id`, `reporter_id`, `last_seen_location`, `reward_amount`, `description`, `status`, `created_at`)
SELECT `id`, `owner_id`, `last_seen_location`, `reward_amount`, `lost_description`, 'active', `created_at`
FROM `pets`
WHERE `status` = 'lost';

-- 10. Create `community_sightings` table
CREATE TABLE `community_sightings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `lost_report_id` INT NOT NULL,
  `reporter_name` VARCHAR(255) DEFAULT NULL,
  `reporter_phone` VARCHAR(50) DEFAULT NULL,
  `message` TEXT DEFAULT NULL,
  `photo_url` TEXT DEFAULT NULL,
  `latitude` DECIMAL(10,8) DEFAULT NULL,
  `longitude` DECIMAL(11,8) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`lost_report_id`) REFERENCES `lost_pet_reports` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 11. Create `scan_logs` table
CREATE TABLE `scan_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pet_id` INT NOT NULL,
  `scan_type` ENUM('nfc', 'qr') NOT NULL DEFAULT 'nfc',
  `latitude` DECIMAL(10,8) DEFAULT NULL,
  `longitude` DECIMAL(11,8) DEFAULT NULL,
  `scanner_ip` VARCHAR(45) DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 12. Create `ownership_transfers` table
CREATE TABLE `ownership_transfers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pet_id` INT NOT NULL,
  `from_user_id` INT NOT NULL,
  `to_user_id` INT NOT NULL,
  `status` ENUM('pending', 'accepted', 'rejected', 'cancelled') DEFAULT 'pending',
  `reason` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `resolved_at` TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`from_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`to_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 13. Create `adoption_listings` table
CREATE TABLE `adoption_listings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pet_name` VARCHAR(100) NOT NULL,
  `species` ENUM('Dog', 'Cat', 'Bird', 'Other') DEFAULT 'Dog',
  `breed` VARCHAR(100) DEFAULT NULL,
  `estimated_age` VARCHAR(50) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `photo_url` TEXT DEFAULT NULL,
  `status` ENUM('available', 'pending', 'adopted', 'withdrawn') DEFAULT 'available',
  `barangay` VARCHAR(100) DEFAULT NULL,
  `posted_by` INT NOT NULL,
  `adopted_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `adopted_at` TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (`posted_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`adopted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 14. Create `stray_reports` table
CREATE TABLE `stray_reports` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `reporter_id` INT DEFAULT NULL,
  `reporter_name` VARCHAR(255) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `photo_url` TEXT DEFAULT NULL,
  `species` ENUM('Dog', 'Cat', 'Other') DEFAULT 'Dog',
  `latitude` DECIMAL(10,8) DEFAULT NULL,
  `longitude` DECIMAL(11,8) DEFAULT NULL,
  `location_description` VARCHAR(255) DEFAULT NULL,
  `barangay` VARCHAR(100) DEFAULT NULL,
  `status` ENUM('open', 'investigating', 'rescued', 'resolved') DEFAULT 'open',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 15. Create `audit_logs` table
CREATE TABLE `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT DEFAULT NULL,
  `action` VARCHAR(100) NOT NULL,
  `target_table` VARCHAR(100) DEFAULT NULL,
  `target_id` INT DEFAULT NULL,
  `details` JSON DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 16. Create `pet_photos` table
CREATE TABLE `pet_photos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pet_id` INT NOT NULL,
  `photo_url` TEXT NOT NULL,
  `is_primary` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

SET FOREIGN_KEY_CHECKS = 1;
