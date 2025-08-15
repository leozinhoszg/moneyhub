# 🔍 Debug - manual_token_error

## ❌ Problema Identificado: manual_token_error

O erro `manual_token_error` indica que a requisição manual para obter o token do Google está falhando.

### 🔧 Problemas Corrigidos:

#### 1. **Arquivo .env** ✅

- Corrigido problema na linha 25 onde `GOOGLE_CLIENT_SECRET` e `SESSION_SECRET_KEY` estavam na mesma linha
- Arquivo `.env` criado a partir do `env example` corrigido

#### 2. **Logs Melhorados** ✅

- Adicionados logs detalhados para a requisição manual
- Mostra status code, resposta, headers e erro específico do Google
- Mostra a URL de redirecionamento sendo usada

### 🔍 Possíveis Causas do manual_token_error:

#### 1. **URL de Redirecionamento Incorreta**

- A URL no Google Console pode não corresponder exatamente
- Verificar: `http://localhost:8000/api/auth/google/callback`

#### 2. **Código de Autorização Inválido**

- O código pode estar expirado ou inválido
- Códigos do Google expiram rapidamente

#### 3. **Credenciais Incorretas**

- Client ID ou Client Secret podem estar errados
- Verificar no Google Console

#### 4. **Problema com HTTPS**

- Google pode exigir HTTPS em produção
- Para desenvolvimento local, HTTP deve funcionar

### 🚀 Como Testar Agora:

#### 1. **Acesse a aplicação:**

```
http://localhost:3000
```

#### 2. **Clique em "Continuar com Google"**

#### 3. **Verifique os logs do servidor:**

Os logs agora mostram:

- URL de redirecionamento sendo usada
- Status code da resposta do Google
- Resposta completa do Google
- Erro específico do Google (se houver)

### 📋 Logs Esperados:

```
🔍 Iniciando callback Google OAuth...
📝 Query params: ...
🔑 Código encontrado: ...
🔄 Tentando abordagem alternativa sem validação de estado...
🔗 Redirect URI para token: http://localhost:8000/api/auth/google/callback
🌐 Fazendo requisição para: https://oauth2.googleapis.com/token
📋 Dados: {...}
📡 Resposta: 400
📋 Conteúdo: {"error":"invalid_grant","error_description":"..."}
🔍 Erro Google: invalid_grant - ...
```

### 🎯 Próximos Passos:

1. **Teste a autenticação real no navegador**
2. **Verifique os logs do servidor para o erro específico**
3. **Identifique o erro do Google (invalid_grant, invalid_client, etc.)**
4. **Corrija baseado no erro específico**

### 📞 Erros Comuns do Google:

- `invalid_grant`: Código expirado ou já usado
- `invalid_client`: Client ID/Secret incorretos
- `redirect_uri_mismatch`: URL de redirecionamento não corresponde
- `invalid_request`: Parâmetros faltando ou incorretos

---

**Status**: Aguardando teste real para identificar o erro específico do Google

