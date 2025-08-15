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
- 📱 **Interface Responsiva** - Funciona em desktop e mobile

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
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instale as dependências
pip install -r requirements.txt

# Configure o arquivo .env
cp env\ example .env
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
