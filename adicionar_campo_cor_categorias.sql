-- Script para adicionar o campo 'cor' na tabela CATEGORIAS
-- Execute este script diretamente no MySQL quando o banco estiver disponível

-- Adicionar coluna 'cor' na tabela CATEGORIAS
ALTER TABLE CATEGORIAS ADD COLUMN cor VARCHAR(7) NULL;

-- Verificar se a coluna foi adicionada
DESCRIBE CATEGORIAS;

