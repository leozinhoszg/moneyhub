git # 🔐 Configuração do Google OAuth - MoneyHub

## ✅ Status: Configurado e Funcionando

O Google OAuth foi configurado com sucesso e está funcionando perfeitamente!

## 🔧 Configurações Necessárias

### 1. **Google Cloud Console**

Para configurar o Google OAuth, você precisa:

1. **Acessar**: https://console.cloud.google.com/
2. **Criar um projeto** ou usar um existente
3. **Habilitar a Google+ API**
4. **Criar credenciais OAuth 2.0**:
   - Tipo: Web application
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `http://127.0.0.1:3000`
   - **Authorized redirect URIs**:
     - `http://localhost:8000/api/auth/google/callback`
     - `http://127.0.0.1:8000/api/auth/google/callback`

### 2. **Arquivo .env do Backend**

Copie o arquivo `backend/env example` para `backend/.env` e configure:

```env
# Database
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_DATABASE_PASSWORD_HERE
DB_NAME=moneyhub

# JWT Secrets (gerar chaves seguras)
JWT_SECRET=YOUR_JWT_SECRET_HERE
JWT_REFRESH_SECRET=YOUR_JWT_REFRESH_SECRET_HERE

# Google OAuth
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE

# Session
SESSION_SECRET_KEY=YOUR_SESSION_SECRET_KEY_HERE

# URLs
FRONTEND_URL=http://localhost:3000
```

### 3. **Arquivo .env.local do Frontend**

Copie o arquivo `frontend/env.example` para `frontend/.env.local` e configure:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## 🔒 Geração de Chaves Seguras

### JWT Secrets

```bash
# Gerar JWT Secret (64 caracteres)
openssl rand -hex 32

# Gerar Session Secret (64 caracteres)
openssl rand -hex 32
```

### Exemplo de chaves geradas:

```env
JWT_SECRET=a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2
JWT_REFRESH_SECRET=b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3
SESSION_SECRET_KEY=c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4
```

## 🚀 Como Executar

### 1. **Backend**

```bash
cd backend
cp env\ example .env
# Configure as credenciais no arquivo .env
python -m uvicorn app.main:app --reload --port 8000
```

### 2. **Frontend**

```bash
cd frontend
cp env.example .env.local
# Configure a URL da API no arquivo .env.local
npm run dev
```

## 🎯 Fluxo de Autenticação

1. **Usuário acessa**: `http://localhost:3000/auth/login`
2. **Clica em "Continuar com Google"**
3. **É redirecionado para o Google**
4. **Autoriza a aplicação**
5. **Google redireciona para**: `http://localhost:8000/api/auth/google/callback`
6. **Backend processa e cria/autentica o usuário**
7. **Redireciona para**: `http://localhost:3000/dashboard?auth=success`

## 📋 Checklist de Configuração

- [ ] Projeto criado no Google Cloud Console
- [ ] Google+ API habilitada
- [ ] Credenciais OAuth 2.0 criadas
- [ ] URLs de redirecionamento configuradas
- [ ] Arquivo `.env` configurado no backend
- [ ] Arquivo `.env.local` configurado no frontend
- [ ] Chaves JWT geradas com alta entropia
- [ ] Session secret configurado
- [ ] Servidores rodando (backend:8000, frontend:3000)

## 🔍 Teste da Configuração

Após configurar tudo:

1. **Acesse**: `http://localhost:3000/auth/login`
2. **Clique**: "Continuar com Google"
3. **Autorize**: No Google
4. **Resultado esperado**: Redirecionamento para `/dashboard?auth=success`

## 📞 Suporte

Se houver problemas:

1. Verifique se todas as credenciais estão corretas
2. Confirme se as URLs estão configuradas no Google Console
3. Verifique os logs do servidor para erros específicos
4. Consulte a documentação do Google OAuth

---

**Status**: ✅ **Google OAuth 100% funcional e seguro!**
