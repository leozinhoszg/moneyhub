Frontend: Next.js 14+ (App Router) + TypeScript + Tailwind CSS + Lucide React (ícones)
Backend: FastAPI em http://localhost:5001 (já implementado)
Autenticação: cookies httpOnly, sempre usar credentials: "include" em todos os fetch
Padrão de fetch: fetch("http://localhost:5001" + endpoint, { credentials: "include" })
Padrão de rota: app/(finance)/[pagina]/page.tsx

Endpoints disponíveis na API (localhost:5001):

GET /api/fixed-expenses → lista gastos fixos
POST /api/fixed-expenses → cria gasto fixo
PUT /api/fixed-expenses/{fx_id} → atualiza gasto fixo (body: objeto livre)
DELETE /api/fixed-expenses/{fx_id} → remove gasto fixo
GET /api/fixed-expenses/upcoming?days=7 → próximos vencimentos (padrão 7 dias)
POST /api/fixed-expenses/run → executa lançamentos do dia

GET /api/reports/transactions.csv?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD → download CSV
GET /api/reports/transactions.pdf?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD → download PDF

GET /api/transactions?tipo=&categoria_id=&conta_bancaria_id=&cartao_credito_id=&data_inicio=&data_fim=&page=&page_size=
DELETE /api/transactions/{transaction_id}

GET /api/accounts → lista contas
PUT /api/accounts/{account_id} → edita conta (campos: nome_banco, tipo_conta)
DELETE /api/accounts/{account_id} → remove conta

GET /api/cards → lista cartões
PUT /api/cards/{card_id} → edita cartão
DELETE /api/cards/{card_id} → remove cartão

GET /api/categories → lista categorias (retorna: id, nome, tipo, cor, icone)
GET /api/dashboard/expenses-by-category → [{categoria, total, percentual}]
GET /api/dashboard/summary → {receita_mes, despesa_mes, saldo_mes}
GET /api/dashboard/daily-flow → fluxo diário

Schema principal de Gasto Fixo (retorno da API):
{
"id": 1,
"descricao": "Aluguel",
"valor": "1500.00",
"dia_vencimento": 5,
"categoria_id": 2,
"conta_bancaria_id": null,
"cartao_credito_id": null,
"status": "Ativo",
"lembrete_ativado": true,
"ultimo_lancamento": null
}

Schema de Transação (retorno):
{
"id": 1,
"tipo": "Despesa",
"valor": "50.00",
"data_transacao": "2026-03-30T00:00:00",
"descricao": "Supermercado",
"categoria_id": 10,
"conta_bancaria_id": 2,
"cartao_credito_id": null
}

```

---

## TAREFA 1 — Refatorar completamente `/fixed-expenses`

**Arquivo:** `app/(finance)/fixed-expenses/page.tsx`

Reconstrua esta página do zero. O código atual está incompleto e sem UI adequada. Implemente:

### 1.1 — Layout da Página
```

┌─────────────────────────────────────────────┐
│ Gastos Fixos [+ Adicionar] [▶ Executar Hoje] │
│ Gerencie suas despesas recorrentes │
├──────────────┬──────────────────────────────┤
│ RESUMO │ PRÓXIMOS VENCIMENTOS │
│ Total/mês │ (próximos 7 dias) │
│ Ativos/Total │ │
├──────────────┴──────────────────────────────┤
│ LISTA DE GASTOS FIXOS │
│ [Card] [Card] [Card]... │
└─────────────────────────────────────────────┘

```

### 1.2 — Resumo no topo (2 cards)

Calcule no frontend com os dados da lista:
- **Total mensal:** soma de `valor` dos gastos com `status === "Ativo"`
- **Ativos / Total:** contagem

### 1.3 — Seção "Próximos Vencimentos"

Chamar `GET /api/fixed-expenses/upcoming?days=7`. Mostrar lista compacta com nome, valor e quantos dias faltam. Fórmula para "dias faltando": calcule com base no `dia_vencimento` e a data atual. Se a API retornar vazio, mostrar mensagem "Nenhum vencimento nos próximos 7 dias".

### 1.4 — Cards de Gastos Fixos

Cada card deve mostrar:
- Ícone colorido baseado na categoria
- Nome (descrição)
- Valor em R$ destacado
- Dia de vencimento ("Todo dia X")
- Badge de status: verde "Ativo" / vermelho "Inativo"
- Badge "Lembrete ativo" se `lembrete_ativado = true`
- Data do último lançamento (se houver)
- Botões: ✏️ Editar | 🔴 Excluir | toggle On/Off de status

### 1.5 — Toggle de Status

Ao clicar no toggle:
- Chama `PUT /api/fixed-expenses/{id}` com o payload completo do item mais `status` alternado ("Ativo" ↔ "Inativo")
- Atualiza a UI otimisticamente
- Exibe toast de sucesso/erro

### 1.6 — Modal "Adicionar Gasto Fixo"

Campos:
- Descrição (texto, obrigatório)
- Valor (número, obrigatório, > 0)
- Dia de vencimento (número 1-31, obrigatório)
- Categoria (select com dados da API `/api/categories`)
- Conta bancária (select com dados da API `/api/accounts`) — opcional
- Lembrete de vencimento (checkbox)
- Status: Ativo/Inativo (radio ou toggle)

Validações:
- Descrição não pode ser vazia
- Valor deve ser > 0
- Dia deve ser entre 1 e 31
- Mostrar erros inline nos campos

### 1.7 — Modal "Editar Gasto Fixo"

Mesmo formulário do Modal de criação, pré-populado com os dados atuais. Usa `PUT /api/fixed-expenses/{id}`.

### 1.8 — Botão "Executar Hoje"

- Exibe confirmação: "Deseja lançar automaticamente os gastos fixos de hoje nas contas/cartões configurados?"
- Ao confirmar, chama `POST /api/fixed-expenses/run`
- Exibe toast com resultado: "X lançamentos realizados" ou mensagem de erro
- Recarrega a lista após execução

### 1.9 — Estado Vazio

Se não houver gastos fixos cadastrados, mostrar empty state: ícone + "Nenhum gasto fixo cadastrado. Adicione suas despesas recorrentes para automatizar seus lançamentos." + botão "Adicionar primeiro gasto fixo".

---

## TAREFA 2 — Construir completamente `/reports`

**Arquivo:** `app/(finance)/reports/page.tsx`

Reconstrua do zero. Implemente:

### 2.1 — Layout da Página
```

┌────────────────────────────────────────────────┐
│ Relatórios │
│ Analise suas finanças detalhadamente │
├────────────────────────────────────────────────┤
│ FILTROS: [Este mês] [Mês passado] [3 meses] │
│ [Início: ____] [Fim: ____] [Aplicar] │
│ [⬇ Baixar CSV] [⬇ Baixar PDF] │
├──────────┬──────────┬──────────┬───────────────┤
│ Receitas │ Despesas │ Saldo │ Maior Despesa │
│ R$ X │ R$ X │ R$ X │ R$ X │
├──────────┴──────────┴──────────┴───────────────┤
│ [Gráfico: Receitas x Despesas por mês - Barras]│
├────────────────────────────────────────────────┤
│ [Gráfico: Despesas por Categoria - Pizza/Donut]│
├────────────────────────────────────────────────┤
│ [Tabela: Últimas transações do período] │
└────────────────────────────────────────────────┘

2.2 — Filtros de Período
Botões de atalho:

"Este mês" → primeiro dia até hoje do mês atual
"Mês passado" → mês anterior completo
"Últimos 3 meses" → 3 meses atrás até hoje
"Este ano" → 1 de janeiro até hoje

Campos de data manual: data_inicio e data_fim (tipo date).
Estado inicial: carregar com "Este mês" selecionado automaticamente.
2.3 — Cards de Resumo
Buscar dados de /api/transactions com data_inicio e data_fim como query params e calcular:

Total de Receitas (soma tipo === "Receita")
Total de Despesas (soma tipo === "Despesa")
Saldo do período (receitas - despesas), cor verde se positivo, vermelho se negativo
Número de transações no período

2.4 — Gráfico: Despesas por Categoria
Usar GET /api/dashboard/expenses-by-category (ou calcular localmente das transações filtradas agrupando por categoria_id).
Implementar com SVG puro ou com a mesma biblioteca de gráficos já usada no Dashboard. Criar um gráfico de barras horizontais onde cada barra representa uma categoria com:

Nome da categoria
Valor total (R$)
Percentual do total
Cor da categoria (campo cor da API de categorias)

2.5 — Gráfico: Evolução Mensal
Agrupar as transações do período filtrado por mês. Criar um gráfico de barras agrupadas (Receitas vs Despesas) com SVG, usando:

Eixo X: meses (Jan, Fev, Mar...)
Eixo Y: valores em R$
Duas barras por mês: verde (receita) e vermelha (despesa)

Se o período for de apenas 1 mês, mostrar por semana. Se for de 1 ano, mostrar por mês.
2.6 — Tabela de Transações
Exibir as transações do período com:

Data (formatada DD/MM/YYYY)
Descrição
Categoria (buscar nome da lista de categorias)
Conta/Cartão
Tipo (badge Receita/Despesa)
Valor (verde para receita, vermelho para despesa)

Paginação simples (10 por página). Ordenação por data decrescente.
2.7 — Download CSV e PDF
Ao clicar em "Baixar CSV":

const url = `http://localhost:5001/api/reports/transactions.csv?start_date=${startDate}&end_date=${endDate}`;
const response = await fetch(url, { credentials: "include" });
const blob = await response.blob();
const link = document.createElement("a");
link.href = URL.createObjectURL(blob);
link.download = `relatorio-${startDate}-${endDate}.csv`;
link.click();

TAREFA 3 — Criar /budget (Orçamento Mensal)
Arquivo: app/(finance)/budget/page.tsx
Esta página não existe. Como a API não tem endpoint de budget, implemente com localStorage para persistência local.
3.1 — Estrutura de Dados (localStorage)

interface BudgetItem {
categoria*id: number;
limite: number; // valor máximo para o mês
mes: string; // formato "YYYY-MM"
}
// localStorage key: "moneyhub_budget*{userId}\_{YYYY-MM}"

```

### 3.2 — Layout
```

┌────────────────────────────────────────────────┐
│ Orçamento Mensal [< Março 2026 >] │
│ Defina limites por categoria │
├────────────────────────────────────────────────┤
│ Resumo: Orçado R$X | Gasto R$X | Livre R$X │
│ [Barra de progresso geral] │
├────────────────────────────────────────────────┤
│ Por Categoria: │
│ 🏠 Casa [====------] 65% R$650/R$1000 │
│ 🚗 Transporte [====------] 40% R$200/R$500 │
│ 🛒 Supermercado[=========] 95%⚠ R$475/R$500 │
└────────────────────────────────────────────────┘

3.3 — Funcionalidades

Navegar entre meses (anterior/próximo)
Para cada categoria de despesa, mostrar campo para definir limite mensal
Buscar gastos reais de /api/transactions filtrado pelo mês selecionado e agrupado por categoria_id
Barra de progresso por categoria:

Verde (< 75%)
Amarelo (75%-99%)
Vermelho (≥ 100%) com ícone ⚠️

Modal para editar o limite de uma categoria
Categorias sem limite definido mostram "Sem limite definido" com botão "+ Definir limite"
Botão "Definir orçamento padrão" que copia os limites do mês anterior

3.4 — Integração com Dashboard
No Dashboard, o widget "Planejamento mensal" deve:

Mostrar as categorias com maior uso do orçamento
Mostrar progresso geral do orçamento do mês atual
Botão "Gerenciar orçamento" que leva para /budget

Atualizar app/(finance)/dashboard/page.tsx:

Buscar dados do localStorage para o mês atual
Se não houver orçamento definido, manter o estado atual com botão "Definir Meu Planejamento" apontando para /budget
Se houver orçamento, mostrar as 3 categorias com maior percentual de uso

TAREFA 4 — Corrigir Bugs Existentes
4.1 — Bug: Editar Transação sem data pré-preenchida
Arquivo: app/(finance)/transactions/page.tsx (ou onde o modal de edição está)
Problema: O modal "Editar Transação" abre com o campo de data vazio.
Solução: Ao abrir o modal de edição, pré-preencher o campo data com o valor da transação existente. O campo na API retorna data_transacao no formato ISO ("2026-03-30T00:00:00"). Converter para o formato YYYY-MM-DD para o input type="date":

const formatDateForInput = (isoDate: string) => {
return isoDate.split('T')[0]; // "2026-03-30"
};

4.2 — Bug: Eixo X do Fluxo Diário com formato errado
Arquivo: app/(finance)/dashboard/page.tsx (componente do gráfico Fluxo Diário)
Problema: O eixo X mostra 30T00:00:00 em vez de 30/03.
Solução: Ao renderizar os labels do eixo X, formatar a data:
typescriptconst formatDay = (dateStr: string) => {
const date = new Date(dateStr);
return `${date.getDate().toString().padStart(2,'0')}/${(date.getMonth()+1).toString().padStart(2,'0')}`;
};
4.3 — Contas: Editar e Excluir
Arquivo: app/(finance)/accounts/page.tsx
Adicionar em cada linha de conta:

Botão ✏️ que abre modal de edição com campos nome_banco e tipo_conta. Chama PUT /api/accounts/{id}
Botão 🗑️ com confirmação. Chama DELETE /api/accounts/{id}. Mostrar erro amigável se a conta tiver transações vinculadas

4.4 — Cartões: Editar e Excluir
Arquivo: app/(finance)/cards/page.tsx
Adicionar em cada cartão:

Botão de edição (ícone ✏️ ou engrenagem) que abre modal com os campos do cartão pré-preenchidos. Chama PUT /api/cards/{id}
Botão de exclusão com confirmação

4.5 — Menu do Usuário na Navbar
Arquivo: app/(finance)/layout.tsx ou componente de Navbar
Problema: O botão de avatar/menu do usuário não abre dropdown.
Implementar dropdown com as opções:

👤 Meu Perfil → /profile
💰 Orçamento → /budget
🔔 Notificações (contador) → abre painel lateral
🚪 Sair → chama POST /api/auth/logout e redireciona para /login

TAREFA 5 — Implementar Painel de Notificações
Problema: O sino de notificações tem badge "3" mas nenhum endpoint existe.
Solução com localStorage (sem backend):
Criar um sistema de notificações geradas pelo frontend baseado em dados reais da API:
typescriptinterface Notification {
id: string;
tipo: "vencimento" | "limite_orcamento" | "saldo_negativo";
titulo: string;
mensagem: string;
data: string;
lida: boolean;
}
Notificações geradas automaticamente:

Vencimentos próximos: Para cada gasto fixo ativo, se dia_vencimento estiver nos próximos 3 dias → gera notificação "Vencimento em X dias: [nome] - R$ [valor]"
Saldo negativo: Se saldo_atual de qualquer conta for < 0 → "Conta [nome] com saldo negativo"
Limite de orçamento: Se alguma categoria ultrapassar 90% do limite do orçamento → "Atenção: [categoria] atingiu 90% do orçamento"

UI: Painel deslizante (slide-in) da direita ao clicar no sino com:

Lista de notificações com ícone, título, mensagem e data
Botão "Marcar todas como lidas"
Badge no sino = número de notificações não lidas
Persistir estado lida no localStorage

TAREFA 6 — Validações e Qualidade
Após implementar tudo, garantir que:
6.1 — Formulários com validação inline
Todos os formulários devem mostrar mensagens de erro abaixo dos campos:
tsx{errors.descricao && (

  <p className="text-red-400 text-sm mt-1">{errors.descricao}</p>
)}
6.2 — Estados de Loading
Todos os botões que fazem chamada à API devem:

Mostrar spinner durante o request
Ser desabilitados enquanto loading (disabled={isLoading})

6.3 — Feedback de Sucesso/Erro
Usar um sistema de toast/notificação consistente em toda a app. Se já existe um componente de toast, usá-lo. Caso contrário, criar um simples:
tsx// Toast no canto inferior direito

<div className="fixed bottom-4 right-4 z-50">
  {toast && (
    <div className={`px-4 py-3 rounded-lg text-white ${
      toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`}>
      {toast.message}
    </div>
  )}
</div>
6.4 — Tratamento de Erros da API
Para toda chamada fetch:
typescripttry {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Erro desconhecido");
  }
  return await res.json();
} catch (e) {
  showToast(e.message, "error");
}
6.5 — Empty States
Todas as listas devem ter empty state visual (ícone + mensagem + CTA) quando vazias.

CHECKLIST DE VALIDAÇÃO FINAL
Após implementar todas as tarefas, testar manualmente cada item:
Gastos Fixos:

Criar um gasto fixo com todos os campos → aparece na lista como card
Editar o gasto fixo → dados atualizados no card
Desativar o gasto fixo (toggle) → badge muda para "Inativo", card esmaece
Reativar → volta para "Ativo"
Excluir → some da lista com confirmação
Clicar "Executar Hoje" → toast com resultado
Seção "Próximos Vencimentos" exibe os gastos com vencimento nos próximos 7 dias

Relatórios:

Abrir a página → carrega automaticamente com o mês atual
Cards de resumo mostram valores corretos (batendo com Transações)
Gráfico de categorias renderiza com barras coloridas
Clicar em "Mês passado" → dados atualizam
"Baixar CSV" → faz download de arquivo .csv com dados reais
"Baixar PDF" → faz download de arquivo .pdf
Tabela de transações mostra as transações do período com paginação

Orçamento:

Acessar /budget → não dá 404
Definir limite de R$500 para "Supermercado" → salvo no localStorage
Trocar de mês → mostra mês diferente, dados diferentes
Voltar ao Dashboard → widget "Planejamento mensal" mostra dados do orçamento

Bugs corrigidos:

Abrir modal de Editar Transação → campo data está pré-preenchido
Dashboard → gráfico "Fluxo Diário" mostra datas no formato "30/03" e não "30T00:00:00"
Conta: clicar em ✏️ → modal de edição abre com dados da conta
Cartão: clicar em editar → modal abre com dados do cartão

Navbar:

Clicar no avatar → dropdown abre com Perfil, Orçamento, Sair
Clicar em "Sair" → desloga e redireciona para login
Clicar no sino → painel de notificações abre pela direita
Notificações mostram vencimentos próximos dos gastos fixos cadastrados
"Marcar como lidas" → badge some do sino

OBSERVAÇÕES TÉCNICAS IMPORTANTES

Nunca remover credentials: "include" dos fetch — a autenticação usa cookies HttpOnly
Padrão de URL da API: sempre "http://localhost:5001" + endpoint (hardcoded no código atual)
Tailwind dark theme: o projeto usa tema escuro, usar classes como bg-[#1a1a2e], text-white, border-gray-700
Não usar bibliotecas de gráficos externas — o projeto usa SVG puro para gráficos (verificado no código existente)
Lucide React já está disponível para todos os ícones
Padrão de modal existente: usar padrão de useState para controle de modal com overlay dark semi-transparente (bg-black/50)
Responsividade: o projeto suporta mobile, usar classes responsivas do Tailwind (md:grid-cols-2, etc.)
Não criar página de Budget no backend — usar exclusivamente localStorage para persistência de orçamento
