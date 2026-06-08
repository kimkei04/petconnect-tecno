-- PetConnect Complete Schema for TiDB Cloud
-- Run this entire script in the TiDB Cloud SQL Editor

-- ============================================================
-- 1. CREATE THE DATABASE
-- ============================================================
CREATE DATABASE IF NOT EXISTS `petconnect`;
USE `petconnect`;

-- ============================================================
-- 2. BASE TABLES
-- ============================================================

-- Users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('owner','lgu','admin') DEFAULT 'owner',
  `barangay` VARCHAR(100) DEFAULT NULL,
  `clinic_name` VARCHAR(255) DEFAULT NULL,
  `license_number` VARCHAR(100) DEFAULT NULL,
  `avatar_url` TEXT DEFAULT NULL,
  `email_verified` TINYINT(1) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `last_login` TIMESTAMP NULL DEFAULT NULL,
  `email_alerts` TINYINT(1) DEFAULT 1,
  `sms_alerts` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Pets table
CREATE TABLE IF NOT EXISTS `pets` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `owner_id` INT DEFAULT NULL,
  `tag_id` VARCHAR(50) DEFAULT NULL,
  `name` VARCHAR(100) NOT NULL,
  `species` ENUM('Dog','Cat','Bird','Rabbit','Other') DEFAULT 'Dog',
  `breed` VARCHAR(100) DEFAULT NULL,
  `sex` ENUM('Male','Female','Unknown') DEFAULT 'Unknown',
  `date_of_birth` DATE DEFAULT NULL,
  `age` INT DEFAULT NULL,
  `weight` DECIMAL(5,2) DEFAULT NULL,
  `color` VARCHAR(100) DEFAULT NULL,
  `photo_url` LONGTEXT DEFAULT NULL,
  `microchip_id` VARCHAR(100) DEFAULT NULL,
  `medical_conditions` TEXT DEFAULT NULL,
  `vaccines` TEXT DEFAULT NULL,
  `marking_images` TEXT DEFAULT NULL,
  `vaccine_due` TINYINT(1) DEFAULT 0,
  `status` ENUM('healthy','lost','deceased','transferred') DEFAULT 'healthy',
  `barangay` VARCHAR(100) DEFAULT NULL,
  `last_seen_location` VARCHAR(255) DEFAULT NULL,
  `reward_amount` VARCHAR(100) DEFAULT NULL,
  `lost_description` TEXT DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `hide_phone` TINYINT(1) DEFAULT 0,
  `hide_address` TINYINT(1) DEFAULT 0,
  `hide_medical` TINYINT(1) DEFAULT 0,
  `note` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tag_id` (`tag_id`),
  KEY `owner_id` (`owner_id`),
  CONSTRAINT `pets_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Alerts table
CREATE TABLE IF NOT EXISTS `alerts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `pet_id` INT DEFAULT NULL,
  `type` ENUM('scan','medical','lost') NOT NULL,
  `title` VARCHAR(255) DEFAULT NULL,
  `message` TEXT DEFAULT NULL,
  `latitude` DECIMAL(10,8) DEFAULT NULL,
  `longitude` DECIMAL(11,8) DEFAULT NULL,
  `is_read` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `pet_id` (`pet_id`),
  CONSTRAINT `alerts_ibfk_1` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================
-- 3. EXTENDED TABLES (v2)
-- ============================================================

-- Notifications
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `pet_id` INT DEFAULT NULL,
  `type` ENUM('scan','sighting','vaccine_reminder','medical','transfer','lost_alert','system') NOT NULL,
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

-- NFC Tags
CREATE TABLE IF NOT EXISTS `nfc_tags` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tag_uid` VARCHAR(50) UNIQUE NOT NULL,
  `pet_id` INT DEFAULT NULL,
  `qr_code_url` TEXT DEFAULT NULL,
  `status` ENUM('active','deactivated','unregistered') DEFAULT 'unregistered',
  `activated_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Vaccination Campaigns
CREATE TABLE IF NOT EXISTS `vaccination_campaigns` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `created_by` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `vaccine_type` VARCHAR(255) DEFAULT NULL,
  `target_barangay` VARCHAR(100) DEFAULT NULL,
  `campaign_date` DATE DEFAULT NULL,
  `location` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('upcoming','active','completed','cancelled') DEFAULT 'upcoming',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Vaccinations
CREATE TABLE IF NOT EXISTS `vaccinations` (
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

-- Medical Records
CREATE TABLE IF NOT EXISTS `medical_records` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pet_id` INT NOT NULL,
  `record_type` ENUM('checkup','treatment','surgery','diagnosis','lab_result','other') NOT NULL,
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

-- Emergency Contacts
CREATE TABLE IF NOT EXISTS `emergency_contacts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pet_id` INT NOT NULL,
  `contact_name` VARCHAR(255) NOT NULL,
  `contact_phone` VARCHAR(50) NOT NULL,
  `relationship` VARCHAR(100) DEFAULT NULL,
  `is_primary` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Lost Pet Reports
CREATE TABLE IF NOT EXISTS `lost_pet_reports` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pet_id` INT NOT NULL,
  `reporter_id` INT NOT NULL,
  `last_seen_location` VARCHAR(255) DEFAULT NULL,
  `last_seen_lat` DECIMAL(10,8) DEFAULT NULL,
  `last_seen_lng` DECIMAL(11,8) DEFAULT NULL,
  `reward_amount` VARCHAR(100) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `contact_instructions` TEXT DEFAULT NULL,
  `status` ENUM('active','resolved','expired') DEFAULT 'active',
  `resolved_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Community Sightings
CREATE TABLE IF NOT EXISTS `community_sightings` (
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

-- Scan Logs
CREATE TABLE IF NOT EXISTS `scan_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pet_id` INT NOT NULL,
  `scan_type` ENUM('nfc','qr') NOT NULL DEFAULT 'nfc',
  `latitude` DECIMAL(10,8) DEFAULT NULL,
  `longitude` DECIMAL(11,8) DEFAULT NULL,
  `scanner_ip` VARCHAR(45) DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Ownership Transfers
CREATE TABLE IF NOT EXISTS `ownership_transfers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pet_id` INT NOT NULL,
  `from_user_id` INT NOT NULL,
  `to_user_id` INT NOT NULL,
  `status` ENUM('pending','accepted','rejected','cancelled') DEFAULT 'pending',
  `reason` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `resolved_at` TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`from_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`to_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Adoption Listings
CREATE TABLE IF NOT EXISTS `adoption_listings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pet_name` VARCHAR(100) NOT NULL,
  `species` ENUM('Dog','Cat','Bird','Other') DEFAULT 'Dog',
  `breed` VARCHAR(100) DEFAULT NULL,
  `estimated_age` VARCHAR(50) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `photo_url` TEXT DEFAULT NULL,
  `status` ENUM('available','pending','adopted','withdrawn') DEFAULT 'available',
  `barangay` VARCHAR(100) DEFAULT NULL,
  `posted_by` INT NOT NULL,
  `adopted_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `adopted_at` TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (`posted_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`adopted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Stray Reports
CREATE TABLE IF NOT EXISTS `stray_reports` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `reporter_id` INT DEFAULT NULL,
  `reporter_name` VARCHAR(255) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `photo_url` TEXT DEFAULT NULL,
  `species` ENUM('Dog','Cat','Other') DEFAULT 'Dog',
  `latitude` DECIMAL(10,8) DEFAULT NULL,
  `longitude` DECIMAL(11,8) DEFAULT NULL,
  `location_description` VARCHAR(255) DEFAULT NULL,
  `barangay` VARCHAR(100) DEFAULT NULL,
  `status` ENUM('open','investigating','rescued','resolved') DEFAULT 'open',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Audit Logs
CREATE TABLE IF NOT EXISTS `audit_logs` (
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

-- Pet Photos
CREATE TABLE IF NOT EXISTS `pet_photos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pet_id` INT NOT NULL,
  `photo_url` TEXT NOT NULL,
  `is_primary` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
