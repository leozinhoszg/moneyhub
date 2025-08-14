# Requisitos da Aplicação MoneyHub

## 1. Funcionalidades Essenciais

- **Controle de Entrada e Saída de Gastos:** Registro detalhado de todas as transações financeiras.
- **Categorização de Gastos:** Atribuição de categorias (Alimentação, Serviços, Veículo, Contas, Lazer, Transporte, Viagens, etc.) para cada gasto.
- **Detalhamento de Gastos:** Possibilidade de adicionar descrições, notas e anexos (comprovantes, fotos) a cada transação.
- **Gestão de Dívidas:** Lembretes para pagamento de dívidas com datas de vencimento.
- **Exportação de Relatórios:** Geração de relatórios financeiros para análise de gastos e economia.
- **Seção de Gastos Fixos:** Gerenciamento de despesas recorrentes (luz, água, internet, prestações) com lembretes e datas de vencimento.
- **Gestão de Contas e Cartões:** Cadastro e acompanhamento de contas bancárias e cartões de crédito.
- **Inclusão de Entradas:** Registro de todas as fontes de renda.

## 2. Automação e Inteligência Artificial

- **Upload de Documentos:** Funcionalidade para anexar documentos, comprovantes e fotos.
- **Extração Inteligente de Dados de Contracheques:** Sistema que puxa informações de contracheques e as adiciona automaticamente à aplicação.
- **Extração Inteligente de Dados de Extratos Bancários:** Sistema que puxa informações de extratos bancários e as adiciona automaticamente à aplicação.

## 3. Segurança

- **Sistema de Autenticação:** Utilização de JWT Token e HTTPOnly com CSRF para segurança da autenticação.
- **Criptografia de Senhas:** Senhas criptografadas com bcrypt ou Argon2.
- **Proteção contra XSS e CORS:** Medidas de segurança para prevenir ataques de Cross-Site Scripting e Cross-Origin Resource Sharing.
- **Segurança Geral:** Implementação de boas práticas de segurança em todo o sistema.

## 4. Compartilhamento e Colaboração

- **Interação com Outro Usuário Cadastrado:** Possibilidade de compartilhar despesas e visualizar gastos em conjunto com outro usuário (ex: cônjuge).

## 5. Tecnologias (Stacks)

- **Backend:** FastAPI com MySQL.
- **Frontend:** Next.js com React.

## 6. Ideias Complementares

- **Orçamento Mensal:** Definição de orçamentos para cada categoria de gasto e acompanhamento do progresso.
- **Metas Financeiras:** Criação e acompanhamento de metas de economia (ex: poupança para viagem, compra de um bem).
- **Análise de Tendências:** Gráficos e visualizações para identificar padrões de gastos ao longo do tempo.
- **Notificações Personalizadas:** Alertas sobre gastos excessivos em uma categoria, proximidade de vencimento de contas, etc.
- **Integração com Bancos (Open Banking):** (Futuro) Possibilidade de conectar diretamente com contas bancárias para importação automática de transações (requer análise de viabilidade e segurança).
- **Relatórios Personalizáveis:** Opções para o usuário criar seus próprios relatórios com filtros e agrupamentos específicos.
- **Dashboard Personalizado:** Visão geral das finanças com informações chave e gráficos customizáveis.
- **Reconciliação Bancária:** Ferramenta para comparar transações registradas com o extrato bancário.
- **Recursos Educacionais:** Pequenas dicas e artigos sobre educação financeira dentro da aplicação.
