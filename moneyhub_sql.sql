-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: moneyhub
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `alembic_version`
--

DROP TABLE IF EXISTS `alembic_version`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alembic_version` (
  `version_num` varchar(32) NOT NULL,
  PRIMARY KEY (`version_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alembic_version`
--

LOCK TABLES `alembic_version` WRITE;
/*!40000 ALTER TABLE `alembic_version` DISABLE KEYS */;
INSERT INTO `alembic_version` VALUES ('0002_add_ultimo_lancamento');
/*!40000 ALTER TABLE `alembic_version` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cartoes_credito`
--

DROP TABLE IF EXISTS `cartoes_credito`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cartoes_credito` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `nome_cartao` varchar(120) NOT NULL,
  `bandeira` varchar(60) NOT NULL,
  `limite` decimal(10,2) NOT NULL DEFAULT '0.00',
  `dia_fechamento_fatura` int NOT NULL,
  `dia_vencimento_fatura` int NOT NULL,
  `data_criacao` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `cartoes_credito_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cartoes_credito`
--

LOCK TABLES `cartoes_credito` WRITE;
/*!40000 ALTER TABLE `cartoes_credito` DISABLE KEYS */;
/*!40000 ALTER TABLE `cartoes_credito` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int DEFAULT NULL,
  `nome` varchar(120) NOT NULL,
  `tipo` enum('Receita','Despesa') NOT NULL,
  `icone` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `categorias_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `compartilhamentos`
--

DROP TABLE IF EXISTS `compartilhamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compartilhamentos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_principal_id` int NOT NULL,
  `usuario_compartilhado_id` int NOT NULL,
  `data_inicio` datetime DEFAULT CURRENT_TIMESTAMP,
  `data_fim` datetime DEFAULT NULL,
  `status` enum('Ativo','Inativo','Pendente') DEFAULT 'Pendente',
  `permissoes` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_principal_id` (`usuario_principal_id`),
  KEY `usuario_compartilhado_id` (`usuario_compartilhado_id`),
  CONSTRAINT `compartilhamentos_ibfk_1` FOREIGN KEY (`usuario_principal_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `compartilhamentos_ibfk_2` FOREIGN KEY (`usuario_compartilhado_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compartilhamentos`
--

LOCK TABLES `compartilhamentos` WRITE;
/*!40000 ALTER TABLE `compartilhamentos` DISABLE KEYS */;
/*!40000 ALTER TABLE `compartilhamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contas_bancarias`
--

DROP TABLE IF EXISTS `contas_bancarias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contas_bancarias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `nome_banco` varchar(120) NOT NULL,
  `tipo_conta` enum('Corrente','Poupança','Investimento') NOT NULL,
  `saldo_inicial` decimal(10,2) NOT NULL DEFAULT '0.00',
  `saldo_atual` decimal(10,2) NOT NULL DEFAULT '0.00',
  `data_criacao` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `contas_bancarias_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contas_bancarias`
--

LOCK TABLES `contas_bancarias` WRITE;
/*!40000 ALTER TABLE `contas_bancarias` DISABLE KEYS */;
/*!40000 ALTER TABLE `contas_bancarias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documentos`
--

DROP TABLE IF EXISTS `documentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documentos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `transacao_id` int DEFAULT NULL,
  `nome_arquivo` varchar(255) NOT NULL,
  `caminho_arquivo` varchar(255) NOT NULL,
  `tipo_documento` enum('Comprovante','Extrato','Contracheque','Outro') NOT NULL,
  `data_upload` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `transacao_id` (`transacao_id`),
  CONSTRAINT `documentos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `documentos_ibfk_2` FOREIGN KEY (`transacao_id`) REFERENCES `transacoes` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documentos`
--

LOCK TABLES `documentos` WRITE;
/*!40000 ALTER TABLE `documentos` DISABLE KEYS */;
/*!40000 ALTER TABLE `documentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gastos_fixos`
--

DROP TABLE IF EXISTS `gastos_fixos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gastos_fixos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `categoria_id` int NOT NULL,
  `descricao` varchar(255) NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `conta_bancaria_id` int DEFAULT NULL,
  `cartao_credito_id` int DEFAULT NULL,
  `dia_vencimento` int NOT NULL,
  `data_inicio` date NOT NULL,
  `data_fim` date DEFAULT NULL,
  `status` enum('Ativo','Inativo') DEFAULT 'Ativo',
  `lembrete_ativado` tinyint(1) DEFAULT '1',
  `ultimo_lancamento` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `categoria_id` (`categoria_id`),
  KEY `conta_bancaria_id` (`conta_bancaria_id`),
  KEY `cartao_credito_id` (`cartao_credito_id`),
  CONSTRAINT `gastos_fixos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `gastos_fixos_ibfk_2` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `gastos_fixos_ibfk_3` FOREIGN KEY (`conta_bancaria_id`) REFERENCES `contas_bancarias` (`id`) ON DELETE SET NULL,
  CONSTRAINT `gastos_fixos_ibfk_4` FOREIGN KEY (`cartao_credito_id`) REFERENCES `cartoes_credito` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gastos_fixos`
--

LOCK TABLES `gastos_fixos` WRITE;
/*!40000 ALTER TABLE `gastos_fixos` DISABLE KEYS */;
/*!40000 ALTER TABLE `gastos_fixos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transacoes`
--

DROP TABLE IF EXISTS `transacoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transacoes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `categoria_id` int NOT NULL,
  `conta_bancaria_id` int DEFAULT NULL,
  `cartao_credito_id` int DEFAULT NULL,
  `tipo` enum('Receita','Despesa') NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `descricao` text,
  `data_transacao` datetime NOT NULL,
  `eh_gasto_fixo` tinyint(1) DEFAULT '0',
  `gasto_fixo_id` int DEFAULT NULL,
  `data_criacao` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `categoria_id` (`categoria_id`),
  KEY `conta_bancaria_id` (`conta_bancaria_id`),
  KEY `cartao_credito_id` (`cartao_credito_id`),
  KEY `gasto_fixo_id` (`gasto_fixo_id`),
  CONSTRAINT `transacoes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transacoes_ibfk_2` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `transacoes_ibfk_3` FOREIGN KEY (`conta_bancaria_id`) REFERENCES `contas_bancarias` (`id`) ON DELETE SET NULL,
  CONSTRAINT `transacoes_ibfk_4` FOREIGN KEY (`cartao_credito_id`) REFERENCES `cartoes_credito` (`id`) ON DELETE SET NULL,
  CONSTRAINT `transacoes_ibfk_5` FOREIGN KEY (`gasto_fixo_id`) REFERENCES `gastos_fixos` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transacoes`
--

LOCK TABLES `transacoes` WRITE;
/*!40000 ALTER TABLE `transacoes` DISABLE KEYS */;
/*!40000 ALTER TABLE `transacoes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(120) NOT NULL,
  `email` varchar(255) NOT NULL,
  `senha_hash` varchar(255) DEFAULT NULL,
  `data_cadastro` datetime DEFAULT CURRENT_TIMESTAMP,
  `ultimo_login` datetime DEFAULT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `email_verificado` tinyint(1) NOT NULL DEFAULT '0',
  `provider` varchar(20) NOT NULL DEFAULT 'email',
  `is_verified` tinyint(1) NOT NULL DEFAULT '0',
  `updated_at` datetime DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `ix_usuarios_google_id` (`google_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Teste Usuario','teste2@example.com','$2b$12$rC0V8WpIhSB6Hkxavj/QJu.JSBT152z2aqr1Cw.qwwZ2eFJAAA3uq','2025-08-15 13:46:08',NULL,NULL,0,'email',0,NULL,1),(2,'Teste API','teste4@example.com','$2b$12$6zVe5/0GiMD4tMNN945Zx.03cFQEMWidazN8.rImH9NFhauR4clBm','2025-08-15 13:47:25','2025-08-15 16:47:26',NULL,0,'email',0,NULL,1),(3,'Teste Frontend','teste7@example.com','$2b$12$uVhxjavJxSuY/iVg.YWmoeZY/TNSCFGKE4eLe8BjzKpv8OtQlSwje','2025-08-15 13:48:02','2025-08-15 16:51:32',NULL,0,'email',0,NULL,1),(4,'Leonardo','leozinhoszg@gmail.com','$2b$12$6WlZF7SDXhq0j8OVqmeUwOVhUx/YpHSehw0t9w2dJaaDUIFLsw0MO','2025-08-15 13:50:53','2025-08-15 17:13:56',NULL,0,'email',0,NULL,1);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-15 17:45:51
