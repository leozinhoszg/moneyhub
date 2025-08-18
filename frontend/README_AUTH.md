# Sistema de Autenticação MoneyHub - Frontend

## 🚀 Configuração Rápida

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do frontend com as seguintes variáveis:

```bash
# Configuração da API Backend
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Configuração do Google OAuth (se necessário)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here

# Configuração de ambiente
NEXT_PUBLIC_ENVIRONMENT=development
```

### 2. Configurar o AuthProvider

Adicione o `AuthProvider` ao seu layout principal (`app/layout.tsx`):

```tsx
import { AuthProvider } from "@/app/hooks/useAuth";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

### 3. Proteger Rotas

Use o componente `ProtectedRoute` para proteger páginas que requerem autenticação:

```tsx
import ProtectedRoute from "@/app/components/ProtectedRoute";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>{/* Conteúdo da página */}</div>
    </ProtectedRoute>
  );
}
```

## 📁 Estrutura de Arquivos

```
frontend/
├── app/
│   ├── api/
│   │   └── auth.ts              # Serviços de autenticação
│   ├── hooks/
│   │   └── useAuth.ts           # Hook de autenticação
│   ├── components/
│   │   └── ProtectedRoute.tsx   # Componente de proteção
│   └── (finance)/auth/
│       ├── login/
│       │   └── page.tsx         # Página de login
│       └── register/
│           └── page.tsx         # Página de registro
├── env.example                  # Exemplo de configuração
└── README_AUTH.md              # Este arquivo
```

## 🔧 Funcionalidades Implementadas

### ✅ Página de Login (`/auth/login`)

- Login com email/senha
- Login com Google OAuth
- Validação de campos em tempo real
- Tratamento de erros robusto
- Redirecionamento automático se já logado
- Botão para mostrar/ocultar senha

### ✅ Página de Registro (`/auth/register`)

- Registro com email/senha
- Registro com Google OAuth
- Validação de força de senha em tempo real
- Verificação de disponibilidade de email
- Confirmação de senha com feedback visual
- Validações completas antes do envio

### ✅ Serviços de Autenticação (`/app/api/auth.ts`)

- Login/registro tradicional
- Login/registro Google OAuth
- Verificação de status de autenticação
- Logout
- Refresh de tokens
- Recuperação de senha
- Validação de email e senha

### ✅ Hook de Autenticação (`/app/hooks/useAuth.ts`)

- Contexto de autenticação global
- Verificação automática de status
- Gerenciamento de estado do usuário
- Funções de login/logout

### ✅ Proteção de Rotas (`/app/components/ProtectedRoute.tsx`)

- Redirecionamento automático para não autenticados
- Tela de carregamento durante verificação
- Configurável para diferentes rotas

## 🎯 Como Usar

### 1. Login Tradicional

```tsx
import { login } from "@/app/api/auth";

const handleLogin = async () => {
  try {
    const response = await login({ email, senha });
    // Login bem-sucedido
    router.push("/dashboard");
  } catch (error) {
    // Tratar erro
  }
};
```

### 2. Login Google

```tsx
import { loginWithGoogle } from "@/app/api/auth";

const handleGoogleLogin = async () => {
  try {
    await loginWithGoogle();
    // Redirecionamento automático
  } catch (error) {
    // Tratar erro
  }
};
```

### 3. Verificar Autenticação

```tsx
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Carregando...</div>;
  if (!isAuthenticated) return <div>Não autenticado</div>;

  return <div>Bem-vindo, {user?.nome}!</div>;
}
```

### 4. Proteger Página

```tsx
import ProtectedRoute from "@/app/components/ProtectedRoute";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>
        <h1>Dashboard</h1>
        {/* Conteúdo protegido */}
      </div>
    </ProtectedRoute>
  );
}
```

## 🔐 Segurança

- **Cookies HTTPOnly**: Tokens armazenados em cookies seguros
- **CSRF Protection**: Proteção contra ataques CSRF
- **Validação de Senha**: Força de senha em tempo real
- **Rate Limiting**: Proteção contra ataques de força bruta
- **Sanitização**: Dados sanitizados antes do envio

## 🚨 Tratamento de Erros

O sistema inclui tratamento robusto de erros:

- **Validação de Campos**: Feedback em tempo real
- **Erros de Rede**: Mensagens amigáveis
- **Erros de Autenticação**: Redirecionamento apropriado
- **Fallbacks**: Comportamento gracioso em caso de falha

## 🔄 Fluxo de Autenticação

1. **Login/Registro** → Backend valida credenciais
2. **Sucesso** → Cookies definidos automaticamente
3. **Redirecionamento** → Usuário vai para dashboard
4. **Verificação** → Hook verifica status automaticamente
5. **Proteção** → Rotas protegidas verificam autenticação

## 📝 Próximos Passos

1. **Configurar Backend**: Certifique-se de que o backend está rodando
2. **Configurar Google OAuth**: Configure as credenciais do Google
3. **Testar Fluxos**: Teste login/registro com email e Google
4. **Personalizar UI**: Ajuste cores e estilos conforme necessário
5. **Adicionar Páginas**: Crie páginas de recuperação de senha, etc.

## 🆘 Solução de Problemas

### Erro de Conexão

- Verifique se o backend está rodando
- Confirme a URL em `NEXT_PUBLIC_API_BASE_URL`

### Erro de CORS

- Configure CORS no backend
- Verifique as origens permitidas

### Google OAuth não funciona

- Configure as credenciais do Google
- Verifique as URLs de redirecionamento

### Cookies não funcionam

- Verifique se está usando HTTPS em produção
- Confirme as configurações de cookies no backend
