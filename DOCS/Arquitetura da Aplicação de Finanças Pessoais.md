# Arquitetura da Aplicação MoneyHub

## 1. Visão Geral

A aplicação será desenvolvida com uma arquitetura de microsserviços, onde o backend (FastAPI) e o frontend (Next.js/React) serão desacoplados, comunicando-se via APIs RESTful. O banco de dados MySQL será o repositório central de dados.

## 2. Componentes Principais

### 2.1. Frontend (Next.js/React)

- **Tecnologias:** Next.js, React, TypeScript (opcional, mas recomendado), Tailwind CSS (ou outra biblioteca de UI).
- **Responsabilidades:**
  - Interface do Usuário (UI) e Experiência do Usuário (UX).
  - Consumo das APIs do backend.
  - Gerenciamento de estado global (ex: Redux, Zustand, React Context).
  - Validação de formulários no lado do cliente.
  - Proteção contra XSS (sanitização de inputs) e manipulação de CORS (via proxy ou configuração).
  - Renderização de gráficos e visualizações de dados.

### 2.2. Backend (FastAPI)

- **Tecnologias:** FastAPI, Python, SQLAlchemy (ORM), Pydantic (validação de dados).
- **Responsabilidades:**
  - Exposição de APIs RESTful para o frontend.
  - Lógica de negócio principal.
  - Autenticação e Autorização (JWT, HTTPOnly, CSRF).
  - Criptografia de senhas (bcrypt/argon2).
  - Interação com o banco de dados MySQL.
  - Processamento de uploads de arquivos.
  - Implementação da lógica de IA para extração de dados (contracheques, extratos).
  - Gerenciamento de usuários e permissões.
  - Geração de relatórios.

### 2.3. Banco de Dados (MySQL)

- **Tecnologias:** MySQL.
- **Responsabilidades:**
  - Armazenamento persistente de todos os dados da aplicação:
    - Usuários e perfis.
    - Transações (entradas, saídas, gastos fixos).
    - Categorias.
    - Contas bancárias e cartões.
    - Documentos anexados.
    - Dados de compartilhamento entre usuários.

## 3. Fluxo de Dados

1. O usuário interage com o Frontend (Next.js/React).
2. O Frontend faz requisições HTTP (GET, POST, PUT, DELETE) para as APIs do Backend (FastAPI).
3. O Backend processa a requisição, interage com o Banco de Dados (MySQL) para ler ou gravar dados.
4. O Backend retorna a resposta para o Frontend.
5. O Frontend atualiza a UI com os dados recebidos.

## 4. Considerações de Escalabilidade e Desempenho

- **FastAPI:** Assíncrono por natureza, o que o torna performático para APIs.
- **MySQL:** Pode ser escalado verticalmente (hardware) e horizontalmente (sharding, replicação) conforme a necessidade.
- **Next.js:** Suporta Server-Side Rendering (SSR) e Static Site Generation (SSG) para melhor performance e SEO.

## 5. Ferramentas e Ambientes

- **Controle de Versão:** Git/GitHub.
- **Containerização:** Docker (para ambiente de desenvolvimento e produção).
- **Implantação:** Vercel (Frontend), Heroku/AWS/Google Cloud (Backend/DB) - a ser definido.
- **Testes:** Pytest (Backend), Jest/React Testing Library (Frontend).
- **Linter/Formatter:** Black/ESLint/Prettier.
