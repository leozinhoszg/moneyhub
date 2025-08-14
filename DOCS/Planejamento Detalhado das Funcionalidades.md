
# Planejamento Detalhado das Funcionalidades

## 1. Módulo de Transações

### 1.1. Inclusão de Entradas e Saídas
- **Descrição:** O usuário poderá registrar todas as suas receitas e despesas de forma simples e rápida.
- **Interface (Frontend):**
    - Formulário com campos para: Valor, Descrição, Data, Categoria, Conta/Cartão.
    - Seleção de tipo de transação (Receita ou Despesa).
    - Opção para anexar comprovante (upload de arquivo).
- **Lógica (Backend):**
    - Endpoint para receber os dados da transação.
    - Validação dos dados recebidos.
    - Inserção da transação na tabela `TRANSACOES`.
    - Atualização do saldo da conta bancária correspondente.

### 1.2. Categorização de Gastos
- **Descrição:** O usuário poderá criar e gerenciar categorias para organizar seus gastos.
- **Interface (Frontend):**
    - Seção para listar, criar, editar e excluir categorias.
    - Opção de associar um ícone e cor a cada categoria.
    - No formulário de transação, um campo de seleção para escolher a categoria.
- **Lógica (Backend):**
    - Endpoints CRUD (Create, Read, Update, Delete) para categorias.
    - Tabela `CATEGORIAS` para armazenar as categorias (com `usuario_id` para categorias personalizadas).

### 1.3. Gestão de Gastos Fixos
- **Descrição:** O usuário poderá cadastrar despesas recorrentes (aluguel, internet, etc.) e receber lembretes.
- **Interface (Frontend):**
    - Seção para listar, criar, editar e excluir gastos fixos.
    - Formulário com campos para: Descrição, Valor, Dia do Vencimento, Categoria, Data de Início e Fim (opcional).
    - Notificações na interface sobre gastos fixos próximos do vencimento.
- **Lógica (Backend):**
    - Endpoints CRUD para gastos fixos.
    - Tabela `GASTOS_FIXOS`.
    - Um sistema de agendamento (scheduler) que verifica diariamente os gastos fixos a vencer e envia notificações (e-mail, push, etc.).
    - Geração automática de transações na tabela `TRANSACOES` quando um gasto fixo é pago.

## 2. Módulo de Contas e Cartões

### 2.1. Gestão de Contas Bancárias
- **Descrição:** O usuário poderá cadastrar e gerenciar suas contas bancárias.
- **Interface (Frontend):**
    - Seção para listar, criar, editar e excluir contas bancárias.
    - Formulário com campos para: Nome do Banco, Tipo de Conta, Saldo Inicial.
    - Visualização do saldo atual de cada conta.
- **Lógica (Backend):**
    - Endpoints CRUD para contas bancárias.
    - Tabela `CONTAS_BANCARIAS`.

### 2.2. Gestão de Cartões de Crédito
- **Descrição:** O usuário poderá cadastrar e gerenciar seus cartões de crédito.
- **Interface (Frontend):**
    - Seção para listar, criar, editar e excluir cartões de crédito.
    - Formulário com campos para: Nome do Cartão, Bandeira, Limite, Dia de Fechamento e Vencimento da Fatura.
    - Visualização do limite disponível e valor da fatura atual.
- **Lógica (Backend):**
    - Endpoints CRUD para cartões de crédito.
    - Tabela `CARTOES_CREDITO`.
    - Lógica para calcular o valor da fatura com base nas transações do cartão.

## 3. Módulo de Relatórios e Análises

### 3.1. Exportação de Relatórios
- **Descrição:** O usuário poderá gerar e exportar relatórios financeiros em formatos como PDF e CSV.
- **Interface (Frontend):**
    - Seção de relatórios com filtros por período, categoria, conta/cartão.
    - Opção para gerar e baixar o relatório.
- **Lógica (Backend):**
    - Endpoint para gerar o relatório com base nos filtros.
    - Utilização de bibliotecas para gerar PDF (ex: `reportlab`) e CSV.
    - Consulta ao banco de dados para obter os dados necessários.

### 3.2. Dashboard e Visualizações
- **Descrição:** O usuário terá uma visão geral de suas finanças através de gráficos e indicadores.
- **Interface (Frontend):**
    - Dashboard com gráficos de pizza (gastos por categoria), gráficos de barras (receitas vs. despesas), etc.
    - Indicadores chave (saldo total, despesas do mês, receitas do mês).
- **Lógica (Backend):**
    - Endpoints para fornecer os dados agregados para os gráficos.

## 4. Módulo de Compartilhamento

### 4.1. Compartilhamento de Despesas
- **Descrição:** O usuário poderá compartilhar suas finanças com outro usuário cadastrado.
- **Interface (Frontend):**
    - Seção para convidar outro usuário para compartilhar despesas (via e-mail).
    - Visualização dos gastos compartilhados.
    - Definição de permissões (visualizar, adicionar gastos).
- **Lógica (Backend):**
    - Endpoints para gerenciar convites e compartilhamentos.
    - Tabela `COMPARTILHAMENTOS` para armazenar os relacionamentos.
    - Lógica de permissões para controlar o acesso aos dados compartilhados.

## 5. Módulo de Automação (IA)

### 5.1. Upload e Processamento de Documentos
- **Descrição:** O usuário poderá fazer upload de contracheques e extratos bancários para extração automática de dados.
- **Interface (Frontend):**
    - Formulário de upload de arquivos.
- **Lógica (Backend):**
    - Endpoint para receber o upload do arquivo.
    - Armazenamento do arquivo em um local seguro (ex: S3, ou diretório no servidor).
    - Fila de processamento para os arquivos enviados.
    - Utilização de bibliotecas de OCR (Optical Character Recognition) e/ou serviços de IA para extrair texto e dados estruturados dos documentos.
    - Mapeamento dos dados extraídos para os campos da aplicação (valor, data, descrição, etc.).
    - Criação de transações com base nos dados extraídos.



