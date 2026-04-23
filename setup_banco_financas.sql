-- Script para configurar o banco 'financas' (compatível com docker-compose.yml)
-- Execute este script quando o MySQL estiver rodando

-- Criar banco se não existir
CREATE DATABASE IF NOT EXISTS financas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar o banco
USE financas;

-- Verificar se a tabela CATEGORIAS existe
-- Se não existir, você precisa executar as migrações do Alembic primeiro

-- Adicionar coluna 'cor' se não existir
ALTER TABLE CATEGORIAS ADD COLUMN IF NOT EXISTS cor VARCHAR(7) NULL;

-- Adicionar coluna 'icone' se não existir  
ALTER TABLE CATEGORIAS ADD COLUMN IF NOT EXISTS icone VARCHAR(50) NULL;

-- Verificar estrutura da tabela
DESCRIBE CATEGORIAS;

-- Inserir categorias padrão (apenas se não existirem)
-- Categorias globais (usuario_id = NULL) - disponíveis para todos os usuários
INSERT IGNORE INTO CATEGORIAS (nome, tipo, cor, icone, usuario_id) VALUES
-- Categorias de Despesas
('Cartões', 'Despesa', '#8b5cf6', 'credit-card', NULL),
('Casa', 'Despesa', '#06b6d4', 'home', NULL),
('Educação', 'Despesa', '#8b5cf6', 'book', NULL),
('Eletrônicos', 'Despesa', '#f59e0b', 'device', NULL),
('Lazer', 'Despesa', '#f97316', 'game', NULL),
('Outros', 'Despesa', '#6b7280', 'dots', NULL),
('Restaurante', 'Despesa', '#dc2626', 'restaurant', NULL),
('Saúde', 'Despesa', '#10b981', 'health', NULL),
('Serviços', 'Despesa', '#059669', 'service', NULL),
('Supermercado', 'Despesa', '#ef4444', 'cart', NULL),
('Transporte', 'Despesa', '#06b6d4', 'car', NULL),
('Vestuário', 'Despesa', '#06b6d4', 'shirt', NULL),
('Viagem', 'Despesa', '#06b6d4', 'plane', NULL),

-- Categorias de Receitas
('Investimentos', 'Receita', '#10b981', 'chart', NULL),
('Outros', 'Receita', '#dc2626', 'dots', NULL),
('Presente', 'Receita', '#8b5cf6', 'gift', NULL),
('Prêmios', 'Receita', '#f59e0b', 'award', NULL),
('Salário', 'Receita', '#06b6d4', 'money', NULL);

-- Verificar quantas categorias foram inseridas
SELECT 
    tipo,
    COUNT(*) as total
FROM CATEGORIAS 
GROUP BY tipo;

-- Mostrar todas as categorias
SELECT * FROM CATEGORIAS ORDER BY tipo, nome;
