# 📊 MoneyHub — Análise Completa da Estrutura e Módulos Faltantes

> **Data da análise:** 28/03/2026  
> **Versão do app:** em desenvolvimento (localhost:5000)  
> **Backend API:** localhost:5001  
> **Stack identificada:** Next.js 15 (App Router) + React + Tailwind CSS · Backend REST separado (porta 5001) · i18n com JSON de traduções

---

## 1. Visão Geral da Arquitetura

### Frontend

- **Framework:** Next.js (App Router) com React
- **Estilização:** Tailwind CSS
- **Componentização:** Lucide React para ícones
- **Internacionalização:** Sistema próprio via `LanguageContext` + arquivos `messages/pt.json`
- **Temas:** Modo claro/escuro implementado
- **Rota base:** `/(finance)/` — grupo de rotas autenticadas

### Backend

- **Servidor separado** rodando na porta `5001`
- **API REST** com prefixo `/api/`
- **Autenticação:** JWT via cookies + OAuth Google

### Rotas Frontend Existentes

| Rota              | Status            | Descrição                   |
| ----------------- | ----------------- | --------------------------- |
| `/dashboard`      | ✅ Funcional      | Painel principal            |
| `/accounts`       | ✅ Funcional      | Contas bancárias            |
| `/cards`          | ✅ Funcional      | Cartões de crédito          |
| `/transactions`   | ✅ Funcional      | Lançamentos                 |
| `/categories`     | ✅ Funcional      | Categorias                  |
| `/fixed-expenses` | ✅ Funcional      | Gastos fixos recorrentes    |
| `/reports`        | ⚠️ Parcial        | Só exportação, sem gráficos |
| `/profile`        | ✅ Funcional      | Perfil e segurança          |
| `/notifications`  | ❌ Quebrada (404) | Rota não implementada       |
| `/budget`         | ❌ Inexistente    | Não criada                  |
| `/goals`          | ❌ Inexistente    | Não criada                  |
| `/investments`    | ❌ Inexistente    | Não criada                  |
| `/settings`       | ❌ Inexistente    | Não criada                  |

### Endpoints Backend Existentes

| Endpoint                                  | Status |
| ----------------------------------------- | ------ |
| `GET /api/auth/status`                    | ✅     |
| `GET /api/auth/me`                        | ✅     |
| `GET/POST /api/transactions`              | ✅     |
| `GET/POST /api/accounts`                  | ✅     |
| `GET/POST /api/cards`                     | ✅     |
| `GET/POST /api/categories`                | ✅     |
| `GET/POST /api/fixed-expenses`            | ✅     |
| `GET /api/dashboard/summary`              | ✅     |
| `GET /api/dashboard/balances-by-account`  | ✅     |
| `GET /api/dashboard/expenses-by-category` | ✅     |
| `GET /api/dashboard/daily-flow`           | ✅     |
| `/api/reports`                            | ❌ 404 |
| `/api/notifications`                      | ❌ 404 |
| `/api/budget` / `/api/planning`           | ❌ 404 |
| `/api/goals`                              | ❌ 404 |
| `/api/investments`                        | ❌ 404 |
| `/api/settings`                           | ❌ 404 |

---

## 2. Módulos Existentes — Inventário Detalhado

### 2.1 Dashboard (`/dashboard`)

**Widgets presentes:**

- Saudação personalizada com horário do dia
- Cards de resumo: Receitas do mês, Despesas do mês, Saldo atual
- Indicadores de variação percentual (+12.5% / -8.2%)
- Checklist de "Primeiros passos" (onboarding) com progresso
- Lista de contas com saldo
- Seção de cartões de crédito
- Gráfico de despesas por categoria _(vazio sem dados)_
- Gráfico de fluxo diário de receitas/despesas _(vazio sem dados)_
- Widget de planejamento mensal _(vazio, sem página dedicada)_
- Botão "Gerenciar cards" (personalização do dashboard)

**Schema do endpoint `dashboard/summary`:**

```json
{
  "receita_mes": "0",
  "despesa_mes": "0",
  "saldo_mes": "0"
}
```

---

### 2.2 Contas (`/accounts`)

**Funcionalidades:**

- Listagem de contas com nome, tipo e saldo
- Adicionar nova conta
- Editar/excluir conta
- Total consolidado de todas as contas

**Tipos de conta suportados:** Corrente, Poupança, Investimento, Crédito, Carteira (dinheiro em espécie)

**Schema:**

```json
{
  "id": 2,
  "nome_banco": "Banco Inter",
  "tipo_conta": "Corrente",
  "saldo_inicial": "0.00",
  "saldo_atual": "35.00"
}
```

---

### 2.3 Cartões (`/cards`)

**Funcionalidades:**

- Cadastrar cartão com: nome, bandeira, limite, dia de fechamento, dia de vencimento
- Formulário básico (sem listagem visual com design de cartão)
- **Problemas identificados:** Página vai direto para o formulário sem listar cartões existentes primeiro; sem indicador de fatura atual

---

### 2.4 Transações (`/transactions`)

**Funcionalidades:**

- 4 tipos de lançamento: Receita, Despesa, Despesa no Cartão, Transferência
- Campos: valor, categoria, conta, data, descrição, anexo de comprovante
- Filtros por: tipo, categoria, conta, cartão, período (data inicial/final)
- Listagem com paginação
- Editar/excluir transação
- Cards de resumo: receitas do mês, despesas do mês, saldo líquido

**Schema:**

```json
{
  "id": 4,
  "tipo": "Receita",
  "valor": "5.00",
  "data_transacao": "2025-09-15T00:00:00",
  "descricao": "",
  "categoria_id": 16,
  "conta_bancaria_id": 2,
  "cartao_credito_id": null
}
```

**Paginação:** `page`, `page_size` (20), `total`

---

### 2.5 Categorias (`/categories`)

**Funcionalidades:**

- Listagem separada por tipo: Despesas / Receitas
- CRUD completo (criar, editar, excluir)
- Subcategorias (estrutura com `subcategorias: []`)
- Ícone e cor personalizados por categoria
- Botão "Adicionar Padrões"

**Categorias de despesa padrão:** Cartões, Casa, Educação, Eletrônicos, Lazer, Outros, Restaurante, Saúde, Serviços, Supermercado, Transporte, Vestuário, Viagem

**Categorias de receita padrão:** Investimentos, Outros, Presente, Prêmios, Salário

**Schema:**

```json
{
  "id": 1,
  "nome": "Cartões",
  "tipo": "Despesa",
  "cor": "#8b5cf6",
  "icone": "credit-card",
  "subcategorias": []
}
```

---

### 2.6 Gastos Fixos (`/fixed-expenses`)

**Funcionalidades:**

- Cadastro de despesas recorrentes: descrição, valor, dia de vencimento, categoria, conta
- Checkbox "Ativar lembrete de vencimento"
- Botão "Executar hoje" (lançar todos os fixos como transações do dia)
- **Falta:** Listagem dos gastos fixos cadastrados visível na mesma página; frequência configurável (semanal, mensal, anual — existe no i18n mas não no formulário); status de pagamento (pago/pendente/vencido)

---

### 2.7 Relatórios (`/reports`)

**Funcionalidades atuais:**

- Seletor de período (data início / data fim)
- Botão "Baixar CSV"
- Botão "Baixar PDF"
- **Nenhum gráfico ou dado é exibido na tela**
- **Endpoint `/api/reports` não existe no backend (404)**

---

### 2.8 Perfil (`/profile`)

**Funcionalidades:**

- Aba "Informações Pessoais": nome, sobrenome, e-mail, data de membro, último login
- Upload de foto de perfil (JPG/PNG/GIF, máx 5MB)
- Aba "Segurança": alterar senha (atual + nova + confirmar), status de vinculação Google, verificação de e-mail

---

## 3. Módulos Faltantes — Especificação Detalhada

---

### 🔴 MÓDULO 1 — Orçamento / Planejamento Mensal

**Prioridade:** Alta · **Complexidade:** Média · **Impacto:** Muito Alto

**Descrição:**  
O widget "Planejamento mensal" existe no dashboard mas não tem página própria. O usuário vê a mensagem "Você ainda não tem um planejamento definido para esse mês" sem conseguir criar um. É o core de qualquer app de finanças pessoais.

**Rota sugerida:** `/budget`  
**Endpoint backend:** `/api/budget`

**Funcionalidades a implementar:**

**Frontend:**

- Página com seletor de mês/ano
- Listagem de categorias com campo para definir limite de gasto
- Barra de progresso por categoria (gasto atual vs limite)
- Indicação visual: verde (< 75%), amarelo (75–99%), vermelho (> 100%)
- Card de resumo: total orçado vs total gasto no mês
- Botão "Copiar orçamento do mês anterior"
- Widget no dashboard deve linkar para esta página

**Backend (novos endpoints):**

```
GET    /api/budget?month=3&year=2026   → retorna orçamento do mês
POST   /api/budget                     → cria/atualiza orçamento
PUT    /api/budget/:id                 → edita item do orçamento
DELETE /api/budget/:id                 → remove item do orçamento
GET    /api/budget/vs-actual?month=3&year=2026 → orçado vs realizado por categoria
```

**Schema proposto:**

```json
{
  "id": 1,
  "categoria_id": 2,
  "mes": 3,
  "ano": 2026,
  "valor_limite": "1500.00",
  "valor_gasto": "980.00",
  "percentual": 65.3
}
```

---

### 🔴 MÓDULO 2 — Notificações (`/notifications`)

**Prioridade:** Alta · **Complexidade:** Baixa · **Impacto:** Alto

**Descrição:**  
O sino de notificações existe na navbar (com badge "3"), mas a rota `/notifications` retorna 404 e o endpoint `/api/notifications` também não existe. O sistema de notificações está 80% planejado (as chaves de tradução já existem no i18n).

**Rota sugerida:** `/notifications`  
**Endpoint backend:** `/api/notifications`

**Funcionalidades a implementar:**

**Frontend:**

- Página com lista de notificações (mais recentes primeiro)
- Tipos visuais diferenciados: aviso de vencimento (⚠️), saldo baixo (💰), transação adicionada (✅), conta atualizada (🔄)
- Botão "Marcar como lida" individual
- Botão "Marcar todas como lidas"
- Indicador de não lida (bolinha colorida)
- Dropdown na navbar (já existe o sino) exibindo as últimas 5
- Configurações de notificação: quais alertas receber, com quantos dias de antecedência notificar vencimentos

**Backend (novos endpoints):**

```
GET   /api/notifications              → lista notificações do usuário
PATCH /api/notifications/:id/read     → marca como lida
PATCH /api/notifications/read-all     → marca todas como lidas
DELETE /api/notifications/:id         → remove notificação
GET   /api/notifications/settings     → preferências de notificação
PUT   /api/notifications/settings     → atualiza preferências
```

**Schema proposto:**

```json
{
  "id": 1,
  "tipo": "expense_due",
  "titulo": "Despesa vence hoje",
  "mensagem": "Netflix — R$ 55,90 vence hoje",
  "lida": false,
  "criada_em": "2026-03-28T09:00:00",
  "link": "/fixed-expenses"
}
```

---

### 🔴 MÓDULO 3 — Relatórios com Visualização Gráfica

**Prioridade:** Alta · **Complexidade:** Média · **Impacto:** Alto

**Descrição:**  
A página `/reports` existe mas é um casca vazia — apenas dois botões de exportação sem nenhum dado visual. O endpoint `/api/reports` não existe no backend.

**Rota sugerida:** `/reports` _(mesma rota, expandida)_  
**Endpoint backend:** `/api/reports/*`

**Funcionalidades a implementar:**

**Frontend:**

- Seletor de período (mês rápido ou data customizada)
- **Gráfico 1 — Receitas vs Despesas:** barras mensais dos últimos 6 ou 12 meses
- **Gráfico 2 — Despesas por Categoria:** gráfico de rosca/pizza com percentuais
- **Gráfico 3 — Evolução do Patrimônio:** linha mostrando saldo total ao longo dos meses
- **Gráfico 4 — Fluxo de Caixa Mensal:** entradas e saídas dia a dia (já existe no dashboard, mas limitado ao mês atual)
- Cards de KPI: total receitas, total despesas, saldo líquido, maior gasto, categoria mais usada
- Tabela de transações do período com filtros
- Exportação CSV e PDF (já existe, mas sem dados porque o endpoint não existe)

**Backend (novos endpoints):**

```
GET /api/reports/summary?start=&end=          → totais do período
GET /api/reports/monthly-comparison?year=2026 → receitas/despesas mês a mês
GET /api/reports/by-category?start=&end=      → gasto por categoria no período
GET /api/reports/net-worth-history?months=12  → evolução do patrimônio
GET /api/reports/export/csv?start=&end=       → exportar CSV
GET /api/reports/export/pdf?start=&end=       → exportar PDF
```

**Bibliotecas de gráfico sugeridas:** Recharts (já compatível com React/Next.js) ou Chart.js

---

### 🟡 MÓDULO 4 — Metas Financeiras (`/goals`)

**Prioridade:** Média · **Complexidade:** Média · **Impacto:** Alto

**Descrição:**  
Nenhuma funcionalidade de metas existe. É um diferencial competitivo importante — permite ao usuário definir objetivos concretos (viagem, reserva de emergência, compra de bem) e acompanhar o progresso.

**Rota sugerida:** `/goals`  
**Endpoint backend:** `/api/goals`

**Funcionalidades a implementar:**

**Frontend:**

- Listagem de metas em cards visuais com barra de progresso
- Formulário de criação: nome, valor-alvo, valor atual, prazo, categoria visual (viagem, casa, emergência, etc.), conta vinculada
- Botão "Adicionar aporte" — registra quanto foi depositado na meta
- Cálculo automático de: quanto falta, quanto poupar por mês para atingir no prazo
- Status visual: Em andamento / Concluída / Atrasada
- Widget no dashboard mostrando metas ativas
- Histórico de aportes por meta

**Backend (novos endpoints):**

```
GET    /api/goals               → lista metas do usuário
POST   /api/goals               → cria nova meta
PUT    /api/goals/:id           → edita meta
DELETE /api/goals/:id           → remove meta
POST   /api/goals/:id/deposit   → registra aporte na meta
GET    /api/goals/:id/history   → histórico de aportes
```

**Schema proposto:**

```json
{
  "id": 1,
  "nome": "Viagem para Europa",
  "valor_alvo": "15000.00",
  "valor_atual": "4200.00",
  "prazo": "2027-06-01",
  "conta_id": 2,
  "icone": "plane",
  "cor": "#06b6d4",
  "status": "em_andamento",
  "criada_em": "2025-08-01"
}
```

---

### 🟡 MÓDULO 5 — Controle de Parcelamentos

**Prioridade:** Média · **Complexidade:** Média · **Impacto:** Alto (especialmente no contexto brasileiro)

**Descrição:**  
No Brasil, compras parceladas no cartão são extremíssimamente comuns. Atualmente não há como registrar "comprei R$ 1.200 em 6x de R$ 200" e acompanhar cada parcela automaticamente.

**Rota sugerida:** integrado em `/transactions` e `/cards` com aba `/installments`  
**Endpoint backend:** `/api/installments`

**Funcionalidades a implementar:**

**Frontend:**

- Campo "Parcelar em X vezes" ao adicionar despesa no cartão
- Criação automática das N parcelas na fatura
- Listagem de compras parceladas com número de parcelas restantes
- Indicador: "3/6 parcelas pagas — R$ 600 restante"
- Alerta na fatura do cartão agrupando parcelamentos do mês
- Visão futura: calendário mostrando impacto das parcelas nos próximos meses

**Backend (novos endpoints):**

```
GET    /api/installments              → lista parcelamentos ativos
POST   /api/installments              → cria parcelamento (gera N transações)
GET    /api/installments/:id          → detalhes + parcelas
DELETE /api/installments/:id          → cancela parcelamento
GET    /api/installments/upcoming     → próximas parcelas a vencer
```

**Schema proposto:**

```json
{
  "id": 1,
  "descricao": "iPhone 16",
  "valor_total": "6000.00",
  "valor_parcela": "1000.00",
  "total_parcelas": 6,
  "parcelas_pagas": 2,
  "parcelas_restantes": 4,
  "cartao_id": 1,
  "categoria_id": 4,
  "data_inicio": "2026-01-15"
}
```

---
