# 🔧 Solução para Erro de Conexão MySQL

## ❌ **Problema Identificado:**

```
Can't connect to MySQL server on '@127.0.0.1' ([Errno 11003] getaddrinfo failed)
```

## 🔍 **Causas Possíveis:**

1. **MySQL não está rodando**
2. **Docker não está instalado/iniciado**
3. **Incompatibilidade de configurações** entre docker-compose.yml e backend

## ✅ **Soluções Disponíveis:**

### **Opção 1: Usar Docker (Recomendado)**

#### 1.1 Instalar Docker Desktop

- Baixe e instale o [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Reinicie o computador após a instalação

#### 1.2 Iniciar os Containers

```bash
# Navegar para o diretório do projeto
cd C:\Users\lguimaraes\Documents\PROJETOS\PROJETOS\MONEY_HUB\moneyhub

# Iniciar todos os serviços
docker compose up -d

# Verificar se estão rodando
docker compose ps
```

#### 1.3 Executar Migrações

```bash
cd backend
alembic upgrade head
```

#### 1.4 Adicionar Categorias

```bash
# Voltar para o diretório raiz
cd ..

# Executar script Python
python setup_categorias_financas.py
```

### **Opção 2: MySQL Local**

#### 2.1 Instalar MySQL

- Baixe e instale o [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)
- Configure com usuário `root` e senha `Jae66yrr@`

#### 2.2 Criar Banco

```sql
CREATE DATABASE moneyhub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 2.3 Configurar Backend

Crie o arquivo `backend/.env` com:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Jae66yrr@
DB_NAME=moneyhub
```

#### 2.4 Executar Setup

```bash
cd backend
alembic upgrade head
cd ..
python setup_categorias_manual.py
```

### **Opção 3: Script SQL Direto**

Se você tem acesso ao MySQL via interface gráfica (phpMyAdmin, MySQL Workbench, etc.):

1. Execute o arquivo `setup_banco_financas.sql`
2. Ou execute o arquivo `categorias_padrao.sql`

## 🎯 **Configurações Corretas:**

### **Para Docker (docker-compose.yml):**

- **Host:** 127.0.0.1
- **Porta:** 3306
- **Usuário:** app_user
- **Senha:** app_password
- **Banco:** financas

### **Para MySQL Local:**

- **Host:** 127.0.0.1
- **Porta:** 3306
- **Usuário:** root
- **Senha:** Jae66yrr@
- **Banco:** moneyhub

## 🚀 **Teste Rápido:**

Execute este comando para testar a conexão:

```bash
python setup_categorias_financas.py
```

Se funcionar, você verá:

```
✅ Conexão com o banco estabelecida com sucesso!
🔄 Verificando estrutura da tabela CATEGORIAS...
✅ Setup concluído com sucesso!
```

## 📁 **Arquivos Criados:**

1. **`setup_categorias_financas.py`** - Script para banco 'financas' (Docker)
2. **`setup_categorias_manual.py`** - Script para banco 'moneyhub' (Local)
3. **`setup_banco_financas.sql`** - SQL para banco 'financas'
4. **`categorias_padrao.sql`** - SQL para banco 'moneyhub'

## 🎉 **Resultado Final:**

Após executar qualquer uma das opções, você terá:

- ✅ Campo `cor` adicionado na tabela CATEGORIAS
- ✅ Campo `icone` adicionado na tabela CATEGORIAS
- ✅ 13 categorias de despesas
- ✅ 5 categorias de receitas
- ✅ Página de categorias funcionando perfeitamente

## 💡 **Dica:**

A **Opção 1 (Docker)** é a mais recomendada pois:

- Mantém o ambiente isolado
- Funciona em qualquer sistema
- Não interfere com outras instalações do MySQL
- É mais fácil de gerenciar

