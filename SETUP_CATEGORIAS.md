# Setup das Categorias - MoneyHub

## ⚠️ Problema de Conexão com o Banco

Se você está recebendo erro de conexão com o MySQL, siga estas opções:

### Opção 1: Verificar se o MySQL está rodando

```bash
# Verificar se o Docker está rodando
docker compose ps

# Se não estiver rodando, iniciar os containers
docker compose up -d
```

### Opção 2: Executar SQL Manualmente

Se o banco estiver rodando, execute o script SQL diretamente:

```sql
-- Adicionar coluna 'cor' na tabela CATEGORIAS
ALTER TABLE CATEGORIAS ADD COLUMN cor VARCHAR(7) NULL;
```

### Opção 3: Usar Script Python

Execute o script Python quando o banco estiver disponível:

```bash
python setup_categorias_manual.py
```

## Passo 1: Executar a Migração (quando o banco estiver rodando)

Execute a migração para adicionar o campo `cor` na tabela de categorias:

```bash
cd backend
alembic upgrade head
```

## Passo 2: Adicionar Categorias Padrão

Execute o script SQL para adicionar as categorias padrão:

```sql
-- Categorias de Despesas
INSERT INTO CATEGORIAS (nome, tipo, cor, icone) VALUES
('Cartões', 'Despesa', '#8b5cf6', 'credit-card'),
('Casa', 'Despesa', '#06b6d4', 'home'),
('Educação', 'Despesa', '#8b5cf6', 'book'),
('Eletrônicos', 'Despesa', '#f59e0b', 'device'),
('Lazer', 'Despesa', '#f97316', 'game'),
('Outros', 'Despesa', '#6b7280', 'dots'),
('Restaurante', 'Despesa', '#dc2626', 'restaurant'),
('Saúde', 'Despesa', '#10b981', 'health'),
('Serviços', 'Despesa', '#059669', 'service'),
('Supermercado', 'Despesa', '#ef4444', 'cart'),
('Transporte', 'Despesa', '#06b6d4', 'car'),
('Vestuário', 'Despesa', '#06b6d4', 'shirt'),
('Viagem', 'Despesa', '#06b6d4', 'plane');

-- Categorias de Receitas
INSERT INTO CATEGORIAS (nome, tipo, cor, icone) VALUES
('Investimentos', 'Receita', '#10b981', 'chart'),
('Outros', 'Receita', '#dc2626', 'dots'),
('Presente', 'Receita', '#8b5cf6', 'gift'),
('Prêmios', 'Receita', '#f59e0b', 'award'),
('Salário', 'Receita', '#06b6d4', 'money');
```

## Passo 3: Verificar

Acesse a página de categorias no frontend para verificar se tudo está funcionando corretamente.

## Funcionalidades Implementadas

### ✅ Página de Categorias

- **Design consistente** com dashboard e transações
- **Abas dinâmicas** para Despesas/Receitas
- **Grid responsivo** com cards visuais
- **Cores e ícones** personalizados por categoria

### ✅ Sistema de CRUD

- **Criar** nova categoria
- **Editar** categoria existente
- **Excluir** categoria
- **Listar** categorias por tipo

### ✅ Modal de Formulário

- **Seleção de cor** com paleta visual
- **Seleção de ícone** com grid de opções
- **Validação** de campos obrigatórios
- **Feedback visual** de seleção

### ✅ Botão Flutuante

- **Posição fixa** no canto inferior direito
- **Cor dinâmica** baseada na aba ativa
- **Animações** hover e active

### ✅ Categorias Padrão

- **13 categorias** de despesas
- **5 categorias** de receitas
- **Cores específicas** para cada categoria
- **Ícones temáticos** apropriados

### ✅ Integração Backend

- **Modelo atualizado** com campos cor e ícone
- **Schemas atualizados** para API
- **Migração criada** para banco de dados
- **CRUD completo** implementado

## Tecnologias Utilizadas

- **React + TypeScript** para o frontend
- **Tailwind CSS** para estilização
- **FastAPI + SQLAlchemy** para o backend
- **MySQL** como banco de dados
- **Alembic** para migrações
