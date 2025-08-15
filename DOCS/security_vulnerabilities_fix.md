# 🛡️ Lista de Vulnerabilidades de Segurança - MoneyHub Frontend

## 🚨 **VULNERABILIDADES CRÍTICAS - CORRIGIR IMEDIATAMENTE**

### 1. **Proteção XSS Insuficiente**
**Arquivo:** `useAuth.ts`, `page.tsx` (login/register), `ProtectedRoute.tsx`
**Problema:** Dados do usuário renderizados sem sanitização
**Localização:**
```tsx
// VULNERÁVEL:
<div>Bem-vindo, {user?.nome}!</div>
<p className="text-slate-600">Entre na sua conta</p>
```

**AÇÃO NECESSÁRIA:**
1. Instalar DOMPurify: `npm install dompurify @types/dompurify`
2. Sanitizar TODOS os dados do usuário antes de renderizar
3. Criar função utilitária para sanitização

**Código de Correção:**
```tsx
import DOMPurify from 'dompurify';

const sanitizeHTML = (dirty: string) => {
  return DOMPurify.sanitize(dirty);
};

// Usar em:
<div>Bem-vindo, {sanitizeHTML(user?.nome || '')}!</div>
```

### 2. **Validação de Input Apenas no Frontend**
**Arquivo:** `page.tsx` (login/register)
**Problema:** Validações críticas apenas no frontend
**Localização:**
```tsx
// VULNERÁVEL:
if (!email.trim()) {
  setError("E-mail é obrigatório");
  return;
}
```

**AÇÃO NECESSÁRIA:**
1. Adicionar validação robusta no backend
2. Implementar sanitização de todos os inputs
3. Validar formato de email com regex segura

---

## ⚠️ **VULNERABILIDADES ALTAS - CORRIGIR ESTA SEMANA**

### 3. **Session Fixation**
**Arquivo:** `useAuth.ts`
**Problema:** Não há regeneração de sessão após login
**Localização:**
```tsx
// VULNERÁVEL:
const login = (userData: User) => {
  setUser(userData);
  setAuthenticated(true);
};
```

**AÇÃO NECESSÁRIA:**
1. Implementar renovação de tokens após login
2. Invalidar sessão anterior
3. Gerar novos tokens CSRF

### 4. **Informações Sensíveis em Logs**
**Arquivo:** `page.tsx` (login/register)
**Problema:** Logging de dados sensíveis
**Localização:**
```tsx
// VULNERÁVEL:
console.log("Login realizado com sucesso:", response.user);
console.error("Erro ao verificar autenticação:", error);
```

**AÇÃO NECESSÁRIA:**
1. Remover logs com dados pessoais
2. Logar apenas IDs ou dados não sensíveis
3. Implementar sistema de logs seguro

**Código de Correção:**
```tsx
// SEGURO:
console.log("Login realizado com sucesso para usuário ID:", response.user.id);
console.error("Erro de autenticação - código:", error.status);
```

### 5. **Falta de Rate Limiting Frontend**
**Arquivo:** `page.tsx` (login/register)
**Problema:** Sem throttling de requisições
**Localização:**
```tsx
// VULNERÁVEL:
const onSubmit = async (e: FormEvent) => {
  // Permite ataques de força bruta
```

**AÇÃO NECESSÁRIA:**
1. Implementar rate limiting no frontend
2. Adicionar debounce nos formulários
3. Bloquear múltiplas tentativas consecutivas

---

## 🔶 **VULNERABILIDADES MÉDIAS - CORRIGIR PRÓXIMA SPRINT**

### 6. **Open Redirect Vulnerability**
**Arquivo:** `ProtectedRoute.tsx`
**Problema:** redirectTo pode ser manipulado
**Localização:**
```tsx
// VULNERÁVEL:
useEffect(() => {
  if (!loading && !authenticated) {
    router.push(redirectTo); // Potencial open redirect
  }
}, [authenticated, loading, router, redirectTo]);
```

**AÇÃO NECESSÁRIA:**
1. Criar lista de redirects permitidos
2. Validar URLs de redirecionamento
3. Usar redirect padrão para URLs inválidas

**Código de Correção:**
```tsx
const ALLOWED_REDIRECTS = ['/auth/login', '/auth/register', '/dashboard'];

const safeRedirect = ALLOWED_REDIRECTS.includes(redirectTo) 
  ? redirectTo 
  : '/auth/login';
router.push(safeRedirect);
```

### 7. **Exposição de Informações em Erros**
**Arquivo:** `auth.ts`, `page.tsx` (login/register)
**Problema:** Mensagens de erro muito detalhadas
**Localização:**
```tsx
// VULNERÁVEL:
} catch (e: any) {
  setError(e?.message ?? "Falha no login");
}
```

**AÇÃO NECESSÁRIA:**
1. Sanitizar mensagens de erro
2. Usar mensagens genéricas para usuário
3. Logar detalhes apenas no backend

### 8. **Timing Attack no Check de Email**
**Arquivo:** `page.tsx` (register)
**Problema:** Tempos diferentes revelam emails existentes
**Localização:**
```tsx
// VULNERÁVEL:
const result = await checkEmailAvailability(email);
```

**AÇÃO NECESSÁRIA:**
1. Implementar delay consistente no backend
2. Não revelar existência de emails
3. Usar mensagens padronizadas

---

## 🔷 **VULNERABILIDADES BAIXAS - MELHORIAS FUTURAS**

### 9. **Headers de Segurança Faltando**
**Arquivo:** `next.config.js` (criar se não existir)
**Problema:** Sem headers de segurança adequados

**AÇÃO NECESSÁRIA:**
Criar/atualizar `next.config.js`:
```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  }
};
```

### 10. **Content Security Policy (CSP)**
**Arquivo:** `next.config.js`
**Problema:** Sem CSP implementado

**AÇÃO NECESSÁRIA:**
Adicionar CSP ao `next.config.js`:
```javascript
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;

// Adicionar aos headers:
{
  key: 'Content-Security-Policy',
  value: cspHeader.replace(/\s{2,}/g, ' ').trim()
}
```

---

## 🛠️ **IMPLEMENTAÇÕES ADICIONAIS RECOMENDADAS**

### 11. **Sistema de Rate Limiting Frontend**
**Arquivo:** Criar `hooks/useRateLimit.ts`

```tsx
import { useState, useRef } from 'react';

export const useRateLimit = (limit: number, windowMs: number) => {
  const attempts = useRef<number[]>([]);
  
  const canProceed = () => {
    const now = Date.now();
    attempts.current = attempts.current.filter(time => now - time < windowMs);
    
    if (attempts.current.length >= limit) {
      return false;
    }
    
    attempts.current.push(now);
    return true;
  };
  
  return canProceed;
};
```

### 12. **Sanitização de Inputs**
**Arquivo:** Criar `utils/sanitize.ts`

```tsx
import DOMPurify from 'dompurify';

export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input.trim());
};

export const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
```

### 13. **Verificação de Integridade de Sessão**
**Arquivo:** Criar `hooks/useSessionIntegrity.ts`

```tsx
import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { checkAuthStatus } from '@/app/api/auth';

export const useSessionIntegrity = () => {
  const { authenticated, logout } = useAuth();

  useEffect(() => {
    const checkIntegrity = async () => {
      try {
        const status = await checkAuthStatus();
        if (status.authenticated !== authenticated) {
          console.warn('Inconsistência de sessão detectada');
          await logout();
        }
      } catch (error) {
        console.error('Erro na verificação de integridade');
      }
    };

    const interval = setInterval(checkIntegrity, 60000); // 1 minuto
    return () => clearInterval(interval);
  }, [authenticated, logout]);
};
```

---

## 📋 **CHECKLIST DE CORREÇÕES**

### Prioridade Crítica (Fazer AGORA):
- [ ] Instalar e implementar DOMPurify para sanitização XSS
- [ ] Remover logs com informações sensíveis
- [ ] Implementar validação robusta no backend

### Prioridade Alta (Esta Semana):
- [ ] Implementar regeneração de sessão após login
- [ ] Adicionar rate limiting no frontend
- [ ] Sanitizar mensagens de erro

### Prioridade Média (Próxima Sprint):
- [ ] Implementar whitelist de redirects
- [ ] Adicionar delay consistente para verificação de email
- [ ] Melhorar tratamento de erros

### Prioridade Baixa (Futuras Melhorias):
- [ ] Configurar headers de segurança no Next.js
- [ ] Implementar Content Security Policy
- [ ] Adicionar verificação de integridade de sessão

---

## 🚀 **PASSOS PARA IMPLEMENTAÇÃO**

1. **Instalar Dependências:**
```bash
npm install dompurify @types/dompurify
```

2. **Criar Arquivos de Utilidade:**
- `utils/sanitize.ts`
- `hooks/useRateLimit.ts`
- `hooks/useSessionIntegrity.ts`

3. **Atualizar Configuração:**
- Criar/atualizar `next.config.js`

4. **Revisar e Corrigir Arquivos Existentes:**
- `useAuth.ts`
- `auth.ts`
- `ProtectedRoute.tsx`
- `page.tsx` (login/register)

5. **Testar Correções:**
- Testar sanitização XSS
- Verificar rate limiting
- Validar redirects seguros
- Confirmar headers de segurança

---

## ⚠️ **NOTAS IMPORTANTES**

- **NUNCA** faça todas as mudanças de uma vez
- Teste cada correção individualmente
- Mantenha backup do código atual
- Documente todas as mudanças realizadas
- Revise logs de produção após implementar
- Considere fazer um security audit completo após correções

**Última atualização:** 15 de Agosto de 2025