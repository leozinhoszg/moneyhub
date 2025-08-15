# 💰 MoneyHub - Controle de Finanças Pessoais

<div align="center">
  <img src="frontend/public/logo_money_hub.png" alt="MoneyHub Logo" width="200"/>
  
  [![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
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

- **Python 3.8+**
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

# Configure o arquivo .env
cp env\ example .env
```

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

1. **Crie um banco MySQL**:

```sql
CREATE DATABASE moneyhub;
```

2. **Configure o arquivo `.env`**:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_aqui
DB_NAME=moneyhub
```

3. **Execute as migrações**:

```bash
alembic upgrade head
```

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

5. **Configure as credenciais no `.env`**:

```env
GOOGLE_CLIENT_ID=seu_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
SESSION_SECRET_KEY=sua_session_secret_aqui
```

### 4. Configuração do Frontend

```bash
# Entre na pasta do frontend
cd frontend

# Instale as dependências
npm install

# Configure o arquivo .env.local
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
├── backend/                 # API FastAPI
│   ├── app/
│   │   ├── api/            # Rotas da API
│   │   ├── core/           # Configurações
│   │   ├── crud/           # Operações do banco
│   │   ├── models/         # Modelos SQLAlchemy
│   │   ├── schemas/        # Schemas Pydantic
│   │   └── services/       # Serviços
│   ├── alembic/            # Migrações
│   └── requirements.txt    # Dependências Python
├── frontend/               # Aplicação Next.js
│   ├── app/               # Páginas e componentes
│   ├── components/        # Componentes React
│   ├── hooks/            # Custom hooks
│   └── public/           # Arquivos estáticos
└── DOCS/                 # Documentação
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
