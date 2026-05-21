-- Script para inserir subcategorias padrão no banco MoneyHub
-- Execute após ter as categorias principais criadas

-- Subcategorias de Transporte (assumindo categoria_id = categoria 'Transporte')
INSERT IGNORE INTO SUBCATEGORIAS (categoria_id, nome, cor, icone, usuario_id) 
SELECT c.id, 'Gasolina', '#f59e0b', 'gas', NULL
FROM CATEGORIAS c 
WHERE c.nome = 'Transporte' AND c.tipo = 'Despesa' AND c.usuario_id IS NULL;

INSERT IGNORE INTO SUBCATEGORIAS (categoria_id, nome, cor, icone, usuario_id) 
SELECT c.id, 'Manutenção', '#ef4444', 'wrench', NULL
FROM CATEGORIAS c 
WHERE c.nome = 'Transporte' AND c.tipo = 'Despesa' AND c.usuario_id IS NULL;

INSERT IGNORE INTO SUBCATEGORIAS (categoria_id, nome, cor, icone, usuario_id) 
SELECT c.id, 'Estacionamento', '#6b7280', 'parking', NULL
FROM CATEGORIAS c 
WHERE c.nome = 'Transporte' AND c.tipo = 'Despesa' AND c.usuario_id IS NULL;

INSERT IGNORE INTO SUBCATEGORIAS (categoria_id, nome, cor, icone, usuario_id) 
SELECT c.id, 'Pedágio', '#8b5cf6', 'toll', NULL
FROM CATEGORIAS c 
WHERE c.nome = 'Transporte' AND c.tipo = 'Despesa' AND c.usuario_id IS NULL;

-- Subcategorias de Casa
INSERT IGNORE INTO SUBCATEGORIAS (categoria_id, nome, cor, icone, usuario_id) 
SELECT c.id, 'Aluguel', '#dc2626', 'home', NULL
FROM CATEGORIAS c 
WHERE c.nome = 'Casa' AND c.tipo = 'Despesa' AND c.usuario_id IS NULL;

INSERT IGNORE INTO SUBCATEGORIAS (categoria_id, nome, cor, icone, usuario_id) 
SELECT c.id, 'Energia', '#f59e0b', 'lightning', NULL
FROM CATEGORIAS c 
WHERE c.nome = 'Casa' AND c.tipo = 'Despesa' AND c.usuario_id IS NULL;

INSERT IGNORE INTO SUBCATEGORIAS (categoria_id, nome, cor, icone, usuario_id) 
SELECT c.id, 'Água', '#06b6d4', 'water', NULL
FROM CATEGORIAS c 
WHERE c.nome = 'Casa' AND c.tipo = 'Despesa' AND c.usuario_id IS NULL;

INSERT IGNORE INTO SUBCATEGORIAS (categoria_id, nome, cor, icone, usuario_id) 
SELECT c.id, 'Internet', '#8b5cf6', 'wifi', NULL
FROM CATEGORIAS c 
WHERE c.nome = 'Casa' AND c.tipo = 'Despesa' AND c.usuario_id IS NULL;

-- Subcategorias de Restaurante
INSERT IGNORE INTO SUBCATEGORIAS (categoria_id, nome, cor, icone, usuario_id) 
SELECT c.id, 'Fast Food', '#f97316', 'burger', NULL
FROM CATEGORIAS c 
WHERE c.nome = 'Restaurante' AND c.tipo = 'Despesa' AND c.usuario_id IS NULL;

INSERT IGNORE INTO SUBCATEGORIAS (categoria_id, nome, cor, icone, usuario_id) 
SELECT c.id, 'Delivery', '#ef4444', 'delivery', NULL
FROM CATEGORIAS c 
WHERE c.nome = 'Restaurante' AND c.tipo = 'Despesa' AND c.usuario_id IS NULL;

INSERT IGNORE INTO SUBCATEGORIAS (categoria_id, nome, cor, icone, usuario_id) 
SELECT c.id, 'Café', '#8b5cf6', 'coffee', NULL
FROM CATEGORIAS c 
WHERE c.nome = 'Restaurante' AND c.tipo = 'Despesa' AND c.usuario_id IS NULL;

-- Subcategorias de Supermercado
INSERT IGNORE INTO SUBCATEGORIAS (categoria_id, nome, cor, icone, usuario_id) 
SELECT c.id, 'Alimentação', '#10b981', 'apple', NULL
FROM CATEGORIAS c 
WHERE c.nome = 'Supermercado' AND c.tipo = 'Despesa' AND c.usuario_id IS NULL;

INSERT IGNORE INTO SUBCATEGORIAS (categoria_id, nome, cor, icone, usuario_id) 
SELECT c.id, 'Limpeza', '#06b6d4', 'clean', NULL
FROM CATEGORIAS c 
WHERE c.nome = 'Supermercado' AND c.tipo = 'Despesa' AND c.usuario_id IS NULL;

INSERT IGNORE INTO SUBCATEGORIAS (categoria_id, nome, cor, icone, usuario_id) 
SELECT c.id, 'Higiene', '#f59e0b', 'soap', NULL
FROM CATEGORIAS c 
WHERE c.nome = 'Supermercado' AND c.tipo = 'Despesa' AND c.usuario_id IS NULL;

-- Subcategorias de Saúde
INSERT IGNORE INTO SUBCATEGORIAS (categoria_id, nome, cor, icone, usuario_id) 
SELECT c.id, 'Médico', '#10b981', 'doctor', NULL
FROM CATEGORIAS c 
WHERE c.nome = 'Saúde' AND c.tipo = 'Despesa' AND c.usuario_id IS NULL;

INSERT IGNORE INTO SUBCATEGORIAS (categoria_id, nome, cor, icone, usuario_id) 
SELECT c.id, 'Farmácia', '#dc2626', 'pharmacy', NULL
FROM CATEGORIAS c 
WHERE c.nome = 'Saúde' AND c.tipo = 'Despesa' AND c.usuario_id IS NULL;

INSERT IGNORE INTO SUBCATEGORIAS (categoria_id, nome, cor, icone, usuario_id) 
SELECT c.id, 'Dentista', '#8b5cf6', 'tooth', NULL
FROM CATEGORIAS c 
WHERE c.nome = 'Saúde' AND c.tipo = 'Despesa' AND c.usuario_id IS NULL;

-- Subcategorias de Lazer
INSERT IGNORE INTO SUBCATEGORIAS (categoria_id, nome, cor, icone, usuario_id) 
SELECT c.id, 'Cinema', '#f97316', 'movie', NULL
FROM CATEGORIAS c 
WHERE c.nome = 'Lazer' AND c.tipo = 'Despesa' AND c.usuario_id IS NULL;

INSERT IGNORE INTO SUBCATEGORIAS (categoria_id, nome, cor, icone, usuario_id) 
SELECT c.id, 'Streaming', '#8b5cf6', 'tv', NULL
FROM CATEGORIAS c 
WHERE c.nome = 'Lazer' AND c.tipo = 'Despesa' AND c.usuario_id IS NULL;

INSERT IGNORE INTO SUBCATEGORIAS (categoria_id, nome, cor, icone, usuario_id) 
SELECT c.id, 'Jogos', '#10b981', 'game', NULL
FROM CATEGORIAS c 
WHERE c.nome = 'Lazer' AND c.tipo = 'Despesa' AND c.usuario_id IS NULL;

-- Subcategorias de Investimentos (Receita)
INSERT IGNORE INTO SUBCATEGORIAS (categoria_id, nome, cor, icone, usuario_id) 
SELECT c.id, 'Ações', '#10b981', 'stock', NULL
FROM CATEGORIAS c 
WHERE c.nome = 'Investimentos' AND c.tipo = 'Receita' AND c.usuario_id IS NULL;

INSERT IGNORE INTO SUBCATEGORIAS (categoria_id, nome, cor, icone, usuario_id) 
SELECT c.id, 'Dividendos', '#06b6d4', 'dividend', NULL
FROM CATEGORIAS c 
WHERE c.nome = 'Investimentos' AND c.tipo = 'Receita' AND c.usuario_id IS NULL;

INSERT IGNORE INTO SUBCATEGORIAS (categoria_id, nome, cor, icone, usuario_id) 
SELECT c.id, 'Renda Fixa', '#f59e0b', 'bond', NULL
FROM CATEGORIAS c 
WHERE c.nome = 'Investimentos' AND c.tipo = 'Receita' AND c.usuario_id IS NULL;

-- Subcategorias de Salário (Receita)
INSERT IGNORE INTO SUBCATEGORIAS (categoria_id, nome, cor, icone, usuario_id) 
SELECT c.id, 'Salário Base', '#06b6d4', 'money', NULL
FROM CATEGORIAS c 
WHERE c.nome = 'Salário' AND c.tipo = 'Receita' AND c.usuario_id IS NULL;

INSERT IGNORE INTO SUBCATEGORIAS (categoria_id, nome, cor, icone, usuario_id) 
SELECT c.id, 'Hora Extra', '#10b981', 'clock', NULL
FROM CATEGORIAS c 
WHERE c.nome = 'Salário' AND c.tipo = 'Receita' AND c.usuario_id IS NULL;

INSERT IGNORE INTO SUBCATEGORIAS (categoria_id, nome, cor, icone, usuario_id) 
SELECT c.id, 'Comissão', '#f59e0b', 'percent', NULL
FROM CATEGORIAS c 
WHERE c.nome = 'Salário' AND c.tipo = 'Receita' AND c.usuario_id IS NULL;

INSERT IGNORE INTO SUBCATEGORIAS (categoria_id, nome, cor, icone, usuario_id) 
SELECT c.id, 'Freelance', '#8b5cf6', 'briefcase', NULL
FROM CATEGORIAS c 
WHERE c.nome = 'Salário' AND c.tipo = 'Receita' AND c.usuario_id IS NULL;

-- Verificar quantas subcategorias foram inseridas
SELECT 
    c.nome as categoria,
    c.tipo,
    COUNT(s.id) as total_subcategorias
FROM CATEGORIAS c
LEFT JOIN SUBCATEGORIAS s ON s.categoria_id = c.id
WHERE c.usuario_id IS NULL
GROUP BY c.id, c.nome, c.tipo
ORDER BY c.tipo, c.nome;






