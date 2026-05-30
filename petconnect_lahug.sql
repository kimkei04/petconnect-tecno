-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: petconnect
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

SET FOREIGN_KEY_CHECKS = 0;

--
-- Table structure for table `alerts`
--

DROP TABLE IF EXISTS `alerts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `alerts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pet_id` int(11) DEFAULT NULL,
  `type` enum('scan','medical','lost') NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `pet_id` (`pet_id`),
  CONSTRAINT `alerts_ibfk_1` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alerts`
--

LOCK TABLES `alerts` WRITE;
/*!40000 ALTER TABLE `alerts` DISABLE KEYS */;
INSERT INTO `alerts` VALUES (1,1,'scan','Cooper Scanned!','Someone scanned Cooper\'s tag near IT Park, Cebu City.',0,'2026-05-03 08:00:19');
/*!40000 ALTER TABLE `alerts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pets`
--

DROP TABLE IF EXISTS `pets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `owner_id` int(11) DEFAULT NULL,
  `tag_id` varchar(50) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `species` enum('Dog','Cat','Bird','Other') DEFAULT 'Dog',
  `breed` varchar(100) DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `weight` decimal(5,2) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `photo_url` longtext DEFAULT NULL,
  `medical_conditions` text DEFAULT NULL,
  `vaccines` text DEFAULT NULL,
  `marking_images` text DEFAULT NULL,
  `vaccine_due` tinyint(1) DEFAULT 0,
  `status` enum('healthy','lost','deceased') DEFAULT 'healthy',
  `last_seen_location` varchar(255) DEFAULT NULL,
  `reward_amount` varchar(100) DEFAULT NULL,
  `lost_description` text DEFAULT NULL,
  `address` text DEFAULT NULL,
  `hide_phone` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `tag_id` (`tag_id`),
  KEY `owner_id` (`owner_id`),
  CONSTRAINT `pets_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pets`
--

LOCK TABLES `pets` WRITE;
/*!40000 ALTER TABLE `pets` DISABLE KEYS */;
INSERT INTO `pets` VALUES (1,1,'PTC-8829-X','Cooper','Dog','Golden Retriever',2,NULL,NULL,'https://images.unsplash.com/photo-1552053831-71594a27632d',NULL,NULL,0,'healthy',NULL,0,'2026-05-03 08:00:19'),(2,1,'PTC-1120-L','Luna','Dog','Domestic Shorthair',4,NULL,NULL,'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba',NULL,NULL,0,'healthy',NULL,0,'2026-05-03 08:00:19'),(3,10,'PTC-9622-B','Bruno','Dog','Beagle',NULL,NULL,NULL,NULL,NULL,NULL,0,'healthy',NULL,NULL,'2026-05-29 09:49:25');
/*!40000 ALTER TABLE `pets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('owner','lgu','admin') DEFAULT 'owner',
  `email_alerts` tinyint(1) DEFAULT 1,
  `sms_alerts` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Sarah Miller','sarah@example.com','+63 912 345 6789','hashed_password_here','owner','2026-05-03 08:00:19'),(2,'Cebu City LGU','admin@cebu.gov.ph','032-123-4567','$2b$10$Uxw0aJE58bZ8iyVzCf.RguDEmwDniG/24598UdqXZNcx3cWY4H8My','lgu','2026-05-03 08:00:19'),(5,'Binisa','binisa@test.com','09945379278','$2b$10$6iMVFnNBeyiISFDF/F5yjON0P1iIABB38s2BhibHwjz31eAf4T8Mi','owner','2026-05-03 08:27:07'),(7,'Joa Kim','joakim@test.com','12346937590','$2b$10$TeTugQYri9gzHEQzW9fk2eMZSIsBGUQsLsU0PAPuagOlER8Gzn0pC','owner','2026-05-07 07:24:22'),(8,'Admin','admin@petconnect.com','','$2b$10$Uxw0aJE58bZ8iyVzCf.RguDEmwDniG/24598UdqXZNcx3cWY4H8My','lgu','2026-05-07 07:46:03'),(9,'Bea Benessa','bea@email.com','','$2b$10$3X6cCmwxr5kKvIVzCA8iVeiJQ.WXGQeEegh6aY62iXLo2aQBXgw1C','owner','2026-05-07 11:15:38'),(10,'Kim Aguilar','kim@lguadmin.com','','$2b$10$E/4f2e5FqaGRkRJUDWsLx.0fWXMMk2T/0nFj.cqx5Y51CMlKIpHg.','owner','2026-05-29 09:49:25');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-29 18:03:32

SET FOREIGN_KEY_CHECKS = 1;
