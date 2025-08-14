
# Roadmap de Desenvolvimento

## Fase 1: Fundação e MVP (Minimum Viable Product)

### Sprint 1: Configuração do Ambiente e Autenticação
- **Objetivo:** Ter um sistema de autenticação funcional e seguro.
- **Tarefas:**
    - Configurar os projetos FastAPI e Next.js.
    - Implementar o modelo de dados de `USUARIOS`.
    - Criar os endpoints de registro e login.
    - Implementar a geração de JWT e armazenamento em cookies HTTPOnly.
    - Configurar a criptografia de senhas (bcrypt/argon2).
    - Criar as telas de login e registro no frontend.

### Sprint 2: Funcionalidades Essenciais de Transações
- **Objetivo:** Permitir que o usuário registre suas transações básicas.
- **Tarefas:**
    - Implementar os modelos de dados de `CONTAS_BANCARIAS`, `CARTOES_CREDITO`, `CATEGORIAS`, `TRANSACOES`.
    - Criar os endpoints CRUD para contas, cartões e categorias.
    - Criar o endpoint para adicionar transações (receitas e despesas).
    - Desenvolver as telas de gerenciamento de contas, cartões e categorias.
    - Desenvolver a tela de adição de transações.

### Sprint 3: Visualização e Listagem
- **Objetivo:** O usuário deve conseguir visualizar suas transações e saldos.
- **Tarefas:**
    - Criar o endpoint para listar transações com filtros (período, conta, categoria).
    - Desenvolver a tela de listagem de transações.
    - Implementar a lógica de atualização de saldos das contas.
    - Criar um dashboard simples com saldo total e um resumo do mês.

## Fase 2: Funcionalidades Avançadas

### Sprint 4: Gastos Fixos e Lembretes
- **Objetivo:** Implementar o gerenciamento de despesas recorrentes.
- **Tarefas:**
    - Implementar o modelo de dados de `GASTOS_FIXOS`.
    - Criar os endpoints CRUD para gastos fixos.
    - Desenvolver a tela de gerenciamento de gastos fixos.
    - Configurar um scheduler para lembretes de vencimento.

### Sprint 5: Relatórios e Exportação
- **Objetivo:** Permitir que o usuário analise seus dados financeiros.
- **Tarefas:**
    - Criar o endpoint para gerar relatórios (PDF/CSV).
    - Desenvolver a interface de relatórios com filtros.
    - Adicionar gráficos mais detalhados ao dashboard (gastos por categoria, etc.).

## Fase 3: Inteligência e Colaboração

### Sprint 6: Compartilhamento de Despesas
- **Objetivo:** Implementar a funcionalidade de compartilhamento entre usuários.
- **Tarefas:**
    - Implementar o modelo de dados de `COMPARTILHAMENTOS`.
    - Criar os endpoints para convidar e gerenciar compartilhamentos.
    - Desenvolver a interface para gerenciar compartilhamentos e visualizar dados compartilhados.

### Sprint 7: Upload e Processamento de Documentos (IA - Parte 1)
- **Objetivo:** Permitir o upload de documentos e iniciar a extração de dados.
- **Tarefas:**
    - Implementar a lógica de upload de arquivos (utils).
    - Configurar o armazenamento de arquivos.
    - Implementar o modelo de dados de `DOCUMENTOS`.
    - Integrar uma biblioteca de OCR para extração de texto.

### Sprint 8: Extração Inteligente (IA - Parte 2)
- **Objetivo:** Refinar a extração de dados e integrá-la ao sistema.
- **Tarefas:**
    - Desenvolver a lógica de NLP/ML para extrair dados de contracheques e extratos.
    - Criar a interface para o usuário validar os dados extraídos.
    - Integrar os dados extraídos com o sistema de transações.

## Fase 4: Refinamento e Produção

### Sprint 9: Segurança e Testes
- **Objetivo:** Garantir a segurança e a qualidade da aplicação.
- **Tarefas:**
    - Implementar proteção contra CSRF, XSS e CORS.
    - Realizar testes de segurança (pentest, se possível).
    - Escrever testes unitários e de integração para backend e frontend.
    - Realizar testes de usabilidade.

### Sprint 10: Implantação e Lançamento
- **Objetivo:** Disponibilizar a aplicação para os usuários.
- **Tarefas:**
    - Configurar o ambiente de produção (servidores, banco de dados).
    - Implantar o backend e o frontend.
    - Realizar os últimos testes em produção.
    - Lançamento oficial da aplicação.


