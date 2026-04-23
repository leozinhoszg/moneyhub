# 💰 MoneyHub - Controle de Finanças Pessoais

<div align="center">
  <img src="frontend/public/logo_money_hub.png" alt="MoneyHub Logo" width="200"/>
  
  [![Python](https://img.shields.io/badge/Python-3.13-blue.svg)](https://www.python.org/)
  [![Next.js](https://img.shields.io/badge/Next.js-13+-black.svg)](https://nextjs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com/)
  [![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://www.mysql.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
</div>

## 📋 Sobre o Projeto

O **MoneyHub** é uma aplicação completa de controle de finanças pessoais desenvolvida com tecnologias modernas. A aplicação permite aos usuários gerenciar suas contas, transações, despesas fixas, cartões de crédito e gerar relatórios detalhados de suas finanças.

### ✨ Funcionalidades Principais

- 🔐 **Autenticação Google OAuth** - Login seguro com Google
- 💳 **Gestão de Cartões** - Controle de cartões de crédito e débito
- 🏦 **Contas Bancárias** - Gerenciamento de múltiplas contas
- 📊 **Dashboard Interativo** - Visão geral das finanças
- 📈 **Relatórios Detalhados** - Análises e gráficos financeiros
- 🏷️ **Categorização** - Organização por categorias
- 💸 **Despesas Fixas** - Controle de gastos recorrentes
- 🔄 **Transações** - Registro de receitas e despesas
- 📱 **Interface Responsiva** - Funciona em desktop (mobile em breve).

## 🏗️ Arquitetura

### Backend (FastAPI + Python)

- **Framework**: FastAPI
- **Banco de Dados**: MySQL
- **ORM**: SQLAlchemy
- **Autenticação**: JWT + Google OAuth
- **Migrações**: Alembic

### Frontend (Next.js + TypeScript)

- **Framework**: Next.js 13+
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Estado**: React Hooks
- **Roteamento**: Next.js App Router

## 🚀 Como Executar

### Pré-requisitos

- **Python 3.13** (versão recomendada)
- **Node.js 18+**
- **MySQL 8.0+**
- **Git**

### 1. Clone o Repositório

```bash
git clone https://github.com/leozinhoszg/moneyhub.git
cd moneyhub
```

### 2. Configuração do Backend

```bash
# Entre na pasta do backend
cd backend

# Crie um ambiente virtual
python -m venv venv

# Ative o ambiente virtual
# Windows (PowerShell - RECOMENDADO):
venv\Scripts\Activate.ps1

# Windows (Git Bash - ALTERNATIVA):
source venv/Scripts/activate

# Windows (CMD):
venv\Scripts\activate.bat

# Linux/Mac:
source venv/bin/activate

# Instale as dependências
pip install -r requirements.txt

# Copie o template de variáveis de ambiente
# Windows (PowerShell):
copy .env.example .env
# Linux/Mac/Git Bash:
cp .env.example .env
```

Depois, edite `backend/.env` preenchendo os valores marcados com `sua_...` ou `gere_um_segredo_...`. Veja a seção [Configuração do Banco de Dados](#configuração-do-banco-de-dados) e [Configuração do Google OAuth](#3-configuração-do-google-oauth) abaixo.

#### ⚠️ Problemas com Git Bash no Windows?

Se você estiver usando Git Bash e encontrar problemas com ambientes virtuais:

1. **Use PowerShell** (recomendado):

   ```powershell
   cd backend
   python -m venv venv
   venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```

2. **Ou use CMD**:

   ```cmd
   cd backend
   python -m venv venv
   venv\Scripts\activate.bat
   pip install -r requirements.txt
   ```

3. **Se preferir Git Bash**, use:
   ```bash
   cd backend
   python -m venv venv
   source venv/Scripts/activate
   pip install -r requirements.txt
   ```

#### Configuração do Banco de Dados

1. **Crie o banco MySQL vazio** (o Alembic criará as tabelas no próximo passo):

```sql
CREATE DATABASE moneyhub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Você pode executar via MySQL Workbench, DBeaver, ou linha de comando:

```bash
mysql -u root -p -e "CREATE DATABASE moneyhub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

2. **Ajuste as credenciais do banco em `backend/.env`** (já copiado de `.env.example`):

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_aqui
DB_NAME=moneyhub
```

3. **Execute as migrações do Alembic** (cria todas as tabelas atualizadas):

```bash
# A partir da pasta backend/, com a venv ativada
alembic upgrade head
```

Isso aplica todas as migrações em `backend/alembic/versions/` (de `0001_initial` até a mais recente), deixando o schema completo: usuários, contas, bancos, cartões, categorias, subcategorias, transações, despesas fixas, faturas, compartilhamentos, documentos, tokens de verificação e reset de senha.

4. **(Opcional) Popule categorias e subcategorias padrão**:

```bash
# A partir da raiz do projeto
mysql -u root -p moneyhub < categorias_padrao.sql
mysql -u root -p moneyhub < subcategorias_padrao.sql
```

> ⚠️ **Não execute** `moneyhub_sql.sql`, `setup_banco_financas.sql` nem `adicionar_campo_cor_categorias.sql` em um banco novo — são scripts legados (dump e patches) que entram em conflito com as migrações do Alembic. A fonte de verdade do schema é o Alembic.

#### 🔎 Como as tabelas são criadas e alimentadas

Fluxo completo do banco vazio até o MoneyHub operacional:

```
Banco vazio (CREATE DATABASE moneyhub)
    │
    │  alembic upgrade head
    ▼
Banco com TODAS as tabelas (vazias)
    │
    │  (opcional) mysql < categorias_padrao.sql
    │  (opcional) mysql < subcategorias_padrao.sql
    ▼
Banco com tabelas + categorias default
    │
    │  uvicorn sobe o backend
    │  npm run dev sobe o frontend
    │  Usuário se registra/loga
    ▼
MoneyHub operacional — os dados do usuário
são inseridos pela própria aplicação
```

**O que cada etapa faz:**

1. **`CREATE DATABASE moneyhub`** — cria um banco vazio, sem nenhuma tabela.
2. **`alembic upgrade head`** — o Alembic lê o `backend/.env` para conectar ao MySQL, cria a tabela de controle `alembic_version` e aplica em ordem todas as migrações de `backend/alembic/versions/` (`0001_initial` até a mais recente). Ao final, **todas as tabelas do schema estão criadas e atualizadas** (usuários, contas, bancos, cartões, categorias, subcategorias, transações, despesas fixas, faturas, documentos, compartilhamentos, tokens de verificação e reset de senha).
3. **Seeds SQL (opcional)** — populam apenas as tabelas `categorias` e `subcategorias` com valores padrão compartilhados (Alimentação, Transporte, Moradia etc.). Sem isso, o usuário começa com lista vazia e precisa criar as próprias categorias.
4. **Registro/login do usuário** — a partir daí, **os dados das demais tabelas são inseridos pelo uso normal da aplicação**. Não existe seed de contas, cartões ou transações: cada usuário gera seus próprios registros ao interagir com o sistema (MoneyHub é multi-usuário, cada pessoa tem seu próprio conjunto de dados isolado).

> 💡 Em resumo: o **Alembic cria a estrutura** (tabelas e colunas); a **aplicação alimenta os dados** (via ações do usuário); os **seeds SQL** são só um atalho opcional para categorias default.

#### 🛠️ Comandos úteis do Alembic

Todos os comandos abaixo devem ser executados a partir da pasta `backend/` com a venv ativada:

```bash
# Aplicar todas as migrações pendentes (caso de uso principal)
alembic upgrade head

# Ver qual versão está aplicada no banco atual
alembic current

# Ver a última migração disponível no código
alembic heads

# Listar todas as migrações em ordem
alembic history

# Aplicar só a próxima migração pendente (útil para debug)
alembic upgrade +1

# Reverter a última migração aplicada
alembic downgrade -1

# Reverter TUDO (volta ao banco vazio — cuidado!)
alembic downgrade base
```

**Como saber se deu certo:**

- `alembic current` e `alembic heads` retornando a **mesma versão** (ex.: `0013 (head)`) → banco 100% atualizado.
- `alembic current` vazio → banco sem nenhuma migração aplicada (banco novo, rode `alembic upgrade head`).
- `alembic current` com versão antiga → faltam migrações, rode `alembic upgrade head`.

**Erros comuns:**

- `Can't connect to MySQL server` → MySQL não está rodando ou credenciais no `.env` estão erradas.
- `Unknown database 'moneyhub'` → você esqueceu de criar o banco vazio antes. Volte ao passo 1.
- `Access denied for user 'root'` → `DB_PASSWORD` no `.env` não bate com a senha do seu MySQL.

### 3. Configuração do Google OAuth

1. **Acesse o Google Cloud Console**: https://console.cloud.google.com/
2. **Crie um projeto** ou use um existente
3. **Habile a Google+ API**
4. **Crie credenciais OAuth 2.0**:

   - Tipo: Web application
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `http://127.0.0.1:3000`
   - **Authorized redirect URIs**:
     - `http://localhost:8000/api/auth/google/callback`
     - `http://127.0.0.1:8000/api/auth/google/callback`

5. **Configure as credenciais em `backend/.env`**:

```env
GOOGLE_CLIENT_ID=seu_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
SESSION_SECRET_KEY=sua_session_secret_aqui
```

> 💡 Gere segredos fortes para `JWT_SECRET`, `JWT_REFRESH_SECRET` e `SESSION_SECRET_KEY` com:
> ```bash
> python -c "import secrets; print(secrets.token_hex(32))"
> ```

### 4. Configuração do Frontend

```bash
# Entre na pasta do frontend
cd frontend

# Instale as dependências
npm install

# Copie o template de variáveis de ambiente
# Windows (PowerShell):
copy env.example .env.local
# Linux/Mac/Git Bash:
cp env.example .env.local
```

Edite o arquivo `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 5. Executando a Aplicação

#### Backend

```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend
npm run dev
```

### 6. Acessando a Aplicação

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentação da API**: http://localhost:8000/docs

## 📁 Estrutura do Projeto

```
moneyhub/
├── backend/                       # API FastAPI
│   ├── app/
│   │   ├── api/                   # Rotas da API
│   │   ├── core/                  # Configurações
│   │   ├── crud/                  # Operações do banco
│   │   ├── models/                # Modelos SQLAlchemy
│   │   ├── schemas/               # Schemas Pydantic
│   │   └── services/              # Serviços
│   ├── alembic/versions/          # Migrações (fonte de verdade do schema)
│   ├── .env.example               # Template de variáveis de ambiente
│   └── requirements.txt           # Dependências Python
├── frontend/                      # Aplicação Next.js
│   ├── app/                       # Páginas e componentes
│   ├── components/                # Componentes React
│   ├── hooks/                     # Custom hooks
│   ├── public/                    # Arquivos estáticos
│   └── env.example                # Template de variáveis de ambiente
├── categorias_padrao.sql          # Seed opcional: categorias padrão
└── subcategorias_padrao.sql       # Seed opcional: subcategorias padrão
```

## 🔧 Tecnologias Utilizadas

### Backend

- **FastAPI** - Framework web moderno e rápido
- **SQLAlchemy** - ORM para Python
- **Alembic** - Migrações de banco de dados
- **Pydantic** - Validação de dados
- **JWT** - Autenticação por tokens
- **Google OAuth** - Autenticação social
- **MySQL** - Banco de dados relacional

### Frontend

- **Next.js 13** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **React Hooks** - Gerenciamento de estado
- **Axios** - Cliente HTTP

## 📊 Funcionalidades Detalhadas

### Dashboard

- Visão geral das finanças
- Gráficos de receitas vs despesas
- Saldo atual das contas
- Últimas transações

### Gestão de Transações

- Adicionar receitas e despesas
- Categorização automática
- Filtros e busca
- Exportação de dados

### Contas e Cartões

- Múltiplas contas bancárias
- Controle de cartões de crédito
- Histórico de transações
- Limites e alertas

### Relatórios

- Relatórios mensais/anuais
- Análise por categoria
- Gráficos interativos
- Exportação em PDF

## 🔐 Segurança

- **Autenticação OAuth 2.0** com Google
- **JWT Tokens** para sessões
- **Validação de dados** com Pydantic
- **CORS configurado** adequadamente
- **Variáveis de ambiente** para credenciais

## 🛠️ Solução de Problemas

### Problemas Comuns no Windows

#### 1. **Git Bash e Ambientes Virtuais**

O Git Bash no Windows pode ter problemas com ambientes virtuais Python. **Soluções**:

- **Use PowerShell** (mais confiável no Windows)
- **Use CMD** como alternativa
- **Se insistir no Git Bash**, use `source venv/Scripts/activate`

#### 2. **Permissões de Execução**

Se encontrar erro de permissão para executar scripts:

```powershell
# No PowerShell como Administrador
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 3. **Python não encontrado**

Se o comando `python` não funcionar:

```bash
# Tente usar py
py -m venv venv

# Ou python3
python3 -m venv venv
```

#### 4. **Problemas com pip**

Se o pip não funcionar após ativar o ambiente virtual:

```bash
# Reinstale o pip
python -m ensurepip --upgrade

# Ou use
python -m pip install --upgrade pip
```

#### 5. **Problemas com MySQL**

Se o MySQL não conectar:

- Verifique se o serviço MySQL está rodando
- Confirme a senha no arquivo `.env`
- Teste a conexão: `mysql -u root -p`

#### 6. **Problemas com Instalação de Dependências**

Se encontrar erros ao instalar dependências Python:

**Erro relacionado ao Rust:**

```bash
# Erro: "error: can't find Rust compiler"
# Solução: O requirements.txt já está otimizado para evitar isso
pip install -r requirements.txt
```

**Se ainda houver problemas:**

```bash
# Atualize o pip
python -m pip install --upgrade pip

# Instale as dependências uma por vez
pip install fastapi==0.104.1
pip install uvicorn==0.24.0
# ... continue com as outras
```

**Alternativas para versões mais recentes:**

- Instalar Rust: https://rustup.rs/
- Usar Docker para isolar o ambiente
- Usar versões pré-compiladas quando disponíveis

#### 7. **Teste de Compatibilidade**

Para verificar se as dependências são compatíveis:

```bash
cd backend
python test_requirements.py
```

Este script testa:

- ✅ Instalação de todas as dependências
- ✅ Imports de todos os módulos
- ✅ Compatibilidade entre versões

## 📝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- **Leonardo Guimarães** - [leozinhoszg](https://github.com/leozinhoszg)

<div align="center">
  <p>Feito com ❤️ para ajudar no controle financeiro pessoal</p>
  <p>⭐ Se este projeto te ajudou, considere dar uma estrela!</p>
</div>
