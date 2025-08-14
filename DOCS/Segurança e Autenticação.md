
# Segurança e Autenticação

## 1. Sistema de Autenticação

### 1.1. JWT (JSON Web Tokens)
- **Descrição:** Utilização de JWTs para autenticação de usuários. Após o login bem-sucedido, um token JWT será gerado e enviado ao cliente.
- **Implementação (Backend):**
    - Geração de tokens JWT contendo claims (ex: `user_id`, `exp`, `iat`).
    - Assinatura dos tokens com uma chave secreta forte.
    - Verificação da validade e integridade dos tokens em cada requisição protegida.

### 1.2. HTTPOnly Cookies
- **Descrição:** O token JWT (ou um refresh token) será armazenado em um cookie `HTTPOnly` para prevenir acesso via JavaScript, mitigando ataques XSS.
- **Implementação (Backend):**
    - Configuração do cookie `HTTPOnly` ao enviar o token para o cliente.

### 1.3. CSRF (Cross-Site Request Forgery) Protection
- **Descrição:** Implementação de proteção contra ataques CSRF para garantir que as requisições que modificam o estado do servidor venham de uma fonte legítima.
- **Implementação (Backend/Frontend):**
    - Geração de um token CSRF (ex: via `double submit cookie` ou `synchronized token pattern`).
    - O token CSRF será enviado no cabeçalho da requisição (ex: `X-CSRF-Token`) e validado no backend.

## 2. Criptografia de Senhas
- **Descrição:** As senhas dos usuários serão armazenadas de forma segura, utilizando algoritmos de hash robustos.
- **Implementação (Backend):**
    - Utilização de `bcrypt` ou `argon2` para fazer o hash das senhas antes de armazená-las no banco de dados.
    - Comparação segura de senhas durante o processo de login.

## 3. Proteção contra Ataques Comuns

### 3.1. XSS (Cross-Site Scripting) Protection
- **Descrição:** Medidas para prevenir a execução de scripts maliciosos no navegador do usuário.
- **Implementação (Frontend/Backend):**
    - **Frontend:** Sanitização de qualquer entrada de usuário antes de renderizá-la na página (ex: usando bibliotecas como `DOMPurify`).
    - **Backend:** Validação e sanitização de todas as entradas de usuário antes de armazená-las no banco de dados ou processá-las.

### 3.2. CORS (Cross-Origin Resource Sharing) Configuration
- **Descrição:** Configuração adequada do CORS para permitir que o frontend (rodando em um domínio diferente) se comunique com o backend de forma segura.
- **Implementação (Backend - FastAPI):**
    - Configuração do `CORS middleware` no FastAPI para permitir requisições apenas de origens confiáveis (o domínio do frontend).
    - Permissão de métodos HTTP específicos (GET, POST, PUT, DELETE) e cabeçalhos necessários.

### 3.3. Outras Medidas de Segurança
- **Validação de Entrada:** Rigorosa validação de todos os dados de entrada no backend para prevenir injeção de SQL, comandos, etc.
- **Tratamento de Erros:** Mensagens de erro genéricas para evitar a exposição de informações sensíveis.
- **Limitação de Taxa (Rate Limiting):** Implementação de rate limiting para endpoints de autenticação e outros para prevenir ataques de força bruta.
- **Logs de Segurança:** Registro de eventos de segurança (tentativas de login falhas, acesso não autorizado).
- **Atualizações de Dependências:** Manter todas as bibliotecas e frameworks atualizados para se proteger contra vulnerabilidades conhecidas.
- **HTTPS:** Forçar o uso de HTTPS em produção para criptografar a comunicação entre cliente e servidor.


