# Configuração do Google OAuth para MoneyHub

## Passos para configurar o Google OAuth:

### 1. Criar projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a API do Google+ (se necessário)

### 2. Configurar OAuth 2.0

1. Vá para "APIs & Services" > "Credentials"
2. Clique em "Create Credentials" > "OAuth 2.0 Client IDs"
3. Configure o tipo de aplicação como "Web application"
4. Adicione as URLs autorizadas:
   - **Authorized JavaScript origins:**
     - `http://localhost:3000`
     - `http://127.0.0.1:3000`
   - **Authorized redirect URIs:**
     - `http://localhost:8000/api/auth/google/callback`
     - `http://127.0.0.1:8000/api/auth/google/callback`

### 3. Obter as credenciais

Após criar o cliente OAuth, você receberá:
- **Client ID** (ex: `123456789-abcdef.apps.googleusercontent.com`)
- **Client Secret** (ex: `GOCSPX-abcdefghijklmnop`)

### 4. Configurar o arquivo .env

Adicione as seguintes linhas ao arquivo `backend/.env`:

```env
# Configurações Google OAuth
GOOGLE_CLIENT_ID=seu_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
```

### 5. Configurar o frontend

Crie o arquivo `frontend/.env.local` com:

```env
# Configuração da API Backend
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Configuração de ambiente
NEXT_PUBLIC_ENVIRONMENT=development
```

### 6. Testar a autenticação

1. Inicie o backend: `cd backend && python -m uvicorn app.main:app --reload --port 8000`
2. Inicie o frontend: `cd frontend && npm run dev`
3. Acesse `http://localhost:3000/auth/login`
4. Clique em "Continuar com Google"

## URLs importantes:

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:8000
- **Rota de autenticação Google:** http://localhost:8000/api/auth/google
- **Callback Google:** http://localhost:8000/api/auth/google/callback

## Solução de problemas:

### Erro "Google OAuth não configurado"
- Verifique se as variáveis `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` estão definidas no `.env`
- Reinicie o servidor backend após adicionar as variáveis

### Erro "redirect_uri_mismatch"
- Verifique se a URL de callback está corretamente configurada no Google Cloud Console
- Certifique-se de que a URL é exatamente: `http://localhost:8000/api/auth/google/callback`

### Erro "invalid_client"
- Verifique se o Client ID e Client Secret estão corretos
- Certifique-se de que o projeto está ativo no Google Cloud Console

