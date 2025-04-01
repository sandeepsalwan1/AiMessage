-- MySQL dump 10.13  Distrib 9.0.1, for macos13.7 (x86_64)
--
-- Host: localhost    Database: messenger
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('a1580b7a-11b2-437d-b88e-56b711126326','d3743436fa6845a5a2b17745b043897af4062978e4f4f9db339d1b83edc285ee','2025-03-22 21:25:39.706','20250322212539_init',NULL,NULL,'2025-03-22 21:25:39.638',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Account`
--

DROP TABLE IF EXISTS `Account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Account` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `provider` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `providerAccountId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `refresh_token` text COLLATE utf8mb4_unicode_ci,
  `access_token` text COLLATE utf8mb4_unicode_ci,
  `expires_at` int DEFAULT NULL,
  `token_type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `scope` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_token` text COLLATE utf8mb4_unicode_ci,
  `session_state` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Account_provider_providerAccountId_key` (`provider`,`providerAccountId`),
  KEY `Account_userId_fkey` (`userId`),
  CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Account`
--

LOCK TABLES `Account` WRITE;
/*!40000 ALTER TABLE `Account` DISABLE KEYS */;
INSERT INTO `Account` VALUES (1,1,'oauth','google','113985680989198309234',NULL,'ya29.a0AeXRPp7Y1MnfWw0vHBU5aZQvjXEglQkADLtejah6_quw6MtVzbu4AfoOINjXsGRJhL4oQh6HAMLSsSKqCT0RvaUYvzzVeR5wPcDQINeZ0MUbEvcUp7hayshxKrUnKknlSEYiu0H2Ocz2z9MiL7Jd_L2Kj6vhWx1-L94QIBwPaCgYKAYcSARMSFQHGX2MipPTIzdDGyW82uyBde57ofw0175',1742683923,'Bearer','https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid','eyJhbGciOiJSUzI1NiIsImtpZCI6ImVlMTkzZDQ2NDdhYjRhMzU4NWFhOWIyYjNiNDg0YTg3YWE2OGJiNDIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI5MDQ5NDc3OTcwMTEtNjliZ2huZTJpZWFmMmJ1bTVmN2g3bmhiZnZ2NzdoNXIuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI5MDQ5NDc3OTcwMTEtNjliZ2huZTJpZWFmMmJ1bTVmN2g3bmhiZnZ2NzdoNXIuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTM5ODU2ODA5ODkxOTgzMDkyMzQiLCJlbWFpbCI6InNhbHdhbnNhbmRlZXA1QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdF9oYXNoIjoid1dUOEdTSnBubmgzWWhUblBMQU15QSIsIm5hbWUiOiJTYW5kZWVwIFNhbHdhbiIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NJQmlOYVlOLW03MmQ5Z2l6NTU4Yy1JUkU1aV81LTRxb2hRS1UzLUNHVjJ2S21IZ2xfVz1zOTYtYyIsImdpdmVuX25hbWUiOiJTYW5kZWVwIiwiZmFtaWx5X25hbWUiOiJTYWx3YW4iLCJpYXQiOjE3NDI2ODAzMjQsImV4cCI6MTc0MjY4MzkyNH0.SVT1FTgtnXKgA8F3Oa7-D1TyYpmw5LQRbVvD3z7AXjESdt8os4tLG9GQdmeO54coMB4ONL3RDtkdJx64ZZ4GsGdpoEaNd0DpD4Nc3r8WEyCJ1Afy7oFH5psgIN62qmuZMgghXRCv1iFwBoBw9_-WZt5tztdG704xojNw3frgcJxeODtMsvSghgM-AMod7F56PYnw3bsyEJExq_dHCzL0AmnnP5k58_z3MmlOE_gByNuWjyzNdbyld30Kw_5cAplInuh7B7cw56Hhi5Yqua9YROce5mldpbn4KGwm4THIaNww5qrPnFcrYl-9z-qMC1CYsUkGcCQ94SE098rlvDHiKw',NULL);
/*!40000 ALTER TABLE `Account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Conversation`
--

DROP TABLE IF EXISTS `Conversation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Conversation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `lastMessageAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isGroup` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Conversation`
--

LOCK TABLES `Conversation` WRITE;
/*!40000 ALTER TABLE `Conversation` DISABLE KEYS */;
INSERT INTO `Conversation` VALUES (1,'2025-03-22 22:02:04.086','2025-03-22 22:02:04.086',NULL,NULL),(2,'2025-03-22 22:02:05.870','2025-03-22 22:02:05.870',NULL,NULL),(3,'2025-03-22 22:02:55.062','2025-03-22 22:02:55.062','first',1),(4,'2025-03-22 22:03:39.967','2025-03-22 22:03:39.967',NULL,NULL),(5,'2025-03-22 22:03:48.595','2025-03-22 22:03:48.595','bob',1),(6,'2025-03-22 22:04:01.500','2025-03-22 22:04:01.500',NULL,NULL),(7,'2025-03-22 22:06:29.044','2025-03-22 22:06:29.044',NULL,NULL),(8,'2025-03-22 22:06:40.987','2025-03-22 22:06:40.987','bobbb',1),(9,'2025-03-22 22:12:19.888','2025-03-22 22:14:58.355','aaa',1),(10,'2025-03-22 22:15:58.181','2025-03-22 22:16:19.783',NULL,NULL),(11,'2025-03-22 22:17:20.888','2025-03-22 22:19:22.531','yoo',1),(12,'2025-03-22 22:19:59.446','2025-03-22 22:20:01.337',NULL,NULL),(13,'2025-03-22 22:20:30.424','2025-03-22 22:23:01.041',NULL,NULL),(14,'2025-03-22 22:23:17.585','2025-03-22 22:23:21.674','wsggg',1),(15,'2025-03-22 22:23:32.226','2025-03-22 22:23:38.598','wsgggaaa',1),(16,'2025-03-22 22:51:23.784','2025-03-22 22:51:33.655','test',1);
/*!40000 ALTER TABLE `Conversation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Message`
--

DROP TABLE IF EXISTS `Message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Message` (
  `id` int NOT NULL AUTO_INCREMENT,
  `body` text COLLATE utf8mb4_unicode_ci,
  `image` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `conversationId` int NOT NULL,
  `senderId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Message_conversationId_fkey` (`conversationId`),
  KEY `Message_senderId_fkey` (`senderId`),
  CONSTRAINT `Message_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `Conversation` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Message_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Message`
--

LOCK TABLES `Message` WRITE;
/*!40000 ALTER TABLE `Message` DISABLE KEYS */;
INSERT INTO `Message` VALUES (1,'yo',NULL,'2025-03-22 22:12:24.325',9,1),(2,'hi',NULL,'2025-03-22 22:14:58.349',9,1),(3,'yo',NULL,'2025-03-22 22:16:02.396',10,4),(4,'yo',NULL,'2025-03-22 22:16:10.139',10,4),(5,'hi',NULL,'2025-03-22 22:16:17.279',10,4),(6,'hi',NULL,'2025-03-22 22:16:19.780',10,4),(7,'sup',NULL,'2025-03-22 22:17:26.061',11,5),(8,'hi',NULL,'2025-03-22 22:18:27.236',11,5),(9,'hi',NULL,'2025-03-22 22:18:29.324',11,4),(10,'hi',NULL,'2025-03-22 22:19:01.742',11,4),(11,'sup',NULL,'2025-03-22 22:19:04.100',11,5),(12,'wsg',NULL,'2025-03-22 22:19:22.527',11,5),(13,'sup',NULL,'2025-03-22 22:20:01.333',12,4),(14,'wsg',NULL,'2025-03-22 22:20:33.994',13,4),(15,'sup',NULL,'2025-03-22 22:21:56.428',13,5),(16,'sup',NULL,'2025-03-22 22:22:14.349',13,4),(17,'sup',NULL,'2025-03-22 22:22:57.201',13,5),(18,'sup',NULL,'2025-03-22 22:23:01.037',13,4),(19,'wsggg ',NULL,'2025-03-22 22:23:21.667',14,5),(20,'wsg',NULL,'2025-03-22 22:23:35.410',15,5),(21,'wsg',NULL,'2025-03-22 22:23:38.596',15,4),(22,'test1',NULL,'2025-03-22 22:51:33.652',16,4);
/*!40000 ALTER TABLE `Message` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `User` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emailVerified` datetime(3) DEFAULT NULL,
  `image` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hashedPassword` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
INSERT INTO `User` VALUES (1,'Sandeep Salwan','salwansandeep5@gmail.com',NULL,'https://lh3.googleusercontent.com/a/ACg8ocIBiNaYN-m72d9giz558c-IRE5i_5-4qohQKU3-CGV2vKmHgl_W=s96-c',NULL,'2025-03-22 21:52:04.795','2025-03-22 21:52:04.795'),(2,'S','s@gmail.com',NULL,NULL,'$2b$12$Hb.w1d4dmAQa7fSOYR8iB.uw8hSmPN.klJabvIH5n1nF2Nw5exM0m','2025-03-22 21:58:16.325','2025-03-22 21:58:16.325'),(3,'s oo','s3@g.com',NULL,NULL,'$2b$12$zWg7wMSl1ktEOLNlLb2m5eT7nzkZeZQRKNYnW.VbZWp4821Jty4EK','2025-03-22 22:03:36.228','2025-03-22 22:03:36.228'),(4,'1','1@1.com',NULL,NULL,'$2b$12$CoTFArdhaOmMjKHv90P14eqaDDZtdU0IRt33s8V6Ki9HU1JYhNZTq','2025-03-22 22:15:29.811','2025-03-22 22:15:29.811'),(5,'b','b@b.b',NULL,NULL,'$2b$12$nQNzY5QVF4b4r5Dz2w3R1epjNg6w/SkqS.Capzh5serehOaOjeZUG','2025-03-22 22:17:07.491','2025-03-22 22:17:07.491');
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `UserConversation`
--

DROP TABLE IF EXISTS `UserConversation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `UserConversation` (
  `userId` int NOT NULL,
  `conversationId` int NOT NULL,
  PRIMARY KEY (`userId`,`conversationId`),
  KEY `UserConversation_conversationId_fkey` (`conversationId`),
  CONSTRAINT `UserConversation_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `Conversation` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `UserConversation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `UserConversation`
--

LOCK TABLES `UserConversation` WRITE;
/*!40000 ALTER TABLE `UserConversation` DISABLE KEYS */;
INSERT INTO `UserConversation` VALUES (1,1),(2,1),(1,2),(2,2),(1,3),(2,3),(2,4),(3,4),(1,5),(2,5),(3,5),(1,6),(3,6),(1,7),(3,7),(1,8),(2,8),(3,8),(1,9),(2,9),(3,9),(1,10),(4,10),(2,11),(4,11),(5,11),(1,12),(4,12),(4,13),(5,13),(2,14),(3,14),(5,14),(1,15),(2,15),(3,15),(4,15),(5,15),(1,16),(2,16),(3,16),(4,16),(5,16);
/*!40000 ALTER TABLE `UserConversation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `UserSeenMessage`
--

DROP TABLE IF EXISTS `UserSeenMessage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `UserSeenMessage` (
  `userId` int NOT NULL,
  `messageId` int NOT NULL,
  PRIMARY KEY (`userId`,`messageId`),
  KEY `UserSeenMessage_messageId_fkey` (`messageId`),
  CONSTRAINT `UserSeenMessage_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `Message` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `UserSeenMessage_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `UserSeenMessage`
--

LOCK TABLES `UserSeenMessage` WRITE;
/*!40000 ALTER TABLE `UserSeenMessage` DISABLE KEYS */;
INSERT INTO `UserSeenMessage` VALUES (1,1),(1,2),(4,2),(4,3),(4,4),(4,5),(4,6),(4,7),(5,7),(4,8),(5,8),(4,9),(5,9),(4,10),(5,10),(4,11),(5,11),(4,12),(5,12),(4,13),(4,14),(5,14),(4,15),(5,15),(4,16),(5,16),(4,17),(5,17),(4,18),(5,18),(5,19),(4,20),(5,20),(4,21),(5,21),(4,22);
/*!40000 ALTER TABLE `UserSeenMessage` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-22 19:17:58
