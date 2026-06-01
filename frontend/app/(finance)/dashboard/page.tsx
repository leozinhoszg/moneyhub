"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import DashboardCardManager from "@/components/DashboardCardManager";
import { useCardManager } from "@/contexts/CardManagerContext";
import { motion } from "framer-motion";
import {
  Star,
  CheckCircle2,
  Plus,
  ChevronRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  GlassCard,
  SectionHeader,
  AnimatedNumber,
  ProgressBar,
  pctTone,
  Pill,
  EmptyState,
  PrimaryButton,
  IconButton,
  Kicker,
  Reveal,
} from "@/components/finance/glass";
import { formatBRL, fontHeading, fontBody, fontMono, EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { getCardIcon } from "@/lib/dashboardCards";

type Summary = {
  receita_mes: string;
  despesa_mes: string;
  saldo_mes: string;
};

// Estilo padrão de "linha de vidro" (item de lista dentro de um card).
const rowClass =
  "flex items-center justify-between rounded-xl border border-gray-200/60 bg-gray-50 px-4 py-3 transition-colors hover:bg-gray-100/80 dark:border-slate-800 dark:bg-slate-800/60 dark:hover:bg-slate-800";

// Sub-painel interno (usado em economia/balanço/frequência).
const panelClass =
  "rounded-xl border border-gray-200/60 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-800/60";

function StepRow({
  done,
  n,
  label,
}: {
  done?: boolean;
  n?: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3.5">
      {done ? (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-secondary)] text-white">
          <CheckCircle2 size={18} strokeWidth={2.2} />
        </span>
      ) : (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-[13px] font-semibold text-gray-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
          {n}
        </span>
      )}
      <span
        className={cn(
          "text-[14px] text-gray-700 dark:text-slate-200",
          done && "text-gray-400 line-through dark:text-slate-500"
        )}
        style={{ fontFamily: fontBody }}
      >
        {label}
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [byAccount, setByAccount] = useState<any[]>([]);
  const [byCategory, setByCategory] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [daily, setDaily] = useState<any[]>([]);
  const [creditCardsSummary, setCreditCardsSummary] = useState<any[]>([]);
  const [firstStepsProgress, setFirstStepsProgress] = useState(25); // 25% = primeiro passo concluído
  const { showCardManager, setShowCardManager } = useCardManager();
  const [cardVisibility, setCardVisibility] = useState({
    firstSteps: true,
    accounts: true,
    creditCards: true,
    expensesByCategory: true,
    dailyFlow: true,
    monthlyPlanning: true,
    monthlyEconomy: false,
    spendingFrequency: false,
    monthlyBalance: false,
    favoriteTransactions: false,
    objectives: false,
  });

  // Estado para ordem dos cards
  const [cardOrder, setCardOrder] = useState([
    { key: "firstSteps", label: "Primeiros passos", icon: "✅" },
    { key: "accounts", label: "Contas", icon: "🏦" },
    { key: "creditCards", label: "Cartões de crédito", icon: "💳" },
    { key: "expensesByCategory", label: "Despesas por categoria", icon: "📊" },
    { key: "dailyFlow", label: "Fluxo diário", icon: "📅" },
    { key: "monthlyPlanning", label: "Planejamento mensal", icon: "📋" },
    { key: "monthlyEconomy", label: "Economia mensal", icon: "💰" },
    { key: "spendingFrequency", label: "Frequência de gastos", icon: "📈" },
    { key: "monthlyBalance", label: "Balanço mensal", icon: "⚖️" },
    { key: "favoriteTransactions", label: "Transações favoritas", icon: "⭐" },
    { key: "objectives", label: "Objetivos", icon: "🎯" },
  ]);
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();

  // Função para obter saudação baseada no horário
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) {
      return t("dashboard.goodMorning");
    } else if (hour >= 12 && hour < 18) {
      return t("dashboard.goodAfternoon");
    } else {
      return t("dashboard.goodEvening");
    }
  };

  // Função para alternar visibilidade dos cards
  const toggleCardVisibility = (cardKey: keyof typeof cardVisibility) => {
    setCardVisibility((prev) => {
      const newVisibility = {
        ...prev,
        [cardKey]: !prev[cardKey],
      };
      // Salvar no localStorage
      localStorage.setItem(
        "dashboard-card-visibility",
        JSON.stringify(newVisibility)
      );
      return newVisibility;
    });
  };

  // Função para resetar configurações para o padrão
  const resetDashboardSettings = () => {
    const defaultOrder = [
      { key: "firstSteps", label: "Primeiros passos", icon: "✅" },
      { key: "accounts", label: "Contas", icon: "🏦" },
      { key: "creditCards", label: "Cartões de crédito", icon: "💳" },
      {
        key: "expensesByCategory",
        label: "Despesas por categoria",
        icon: "📊",
      },
      { key: "dailyFlow", label: "Fluxo diário", icon: "📅" },
      { key: "monthlyPlanning", label: "Planejamento mensal", icon: "📋" },
      { key: "monthlyEconomy", label: "Economia mensal", icon: "💰" },
      { key: "spendingFrequency", label: "Frequência de gastos", icon: "📈" },
      { key: "monthlyBalance", label: "Balanço mensal", icon: "⚖️" },
      {
        key: "favoriteTransactions",
        label: "Transações favoritas",
        icon: "⭐",
      },
      { key: "objectives", label: "Objetivos", icon: "🎯" },
    ];

    const defaultVisibility = {
      firstSteps: true,
      accounts: true,
      creditCards: true,
      expensesByCategory: true,
      dailyFlow: true,
      monthlyPlanning: true,
      monthlyEconomy: false,
      spendingFrequency: false,
      monthlyBalance: false,
      favoriteTransactions: false,
      objectives: false,
    };

    setCardOrder(defaultOrder);
    setCardVisibility(defaultVisibility);

    // Salvar no localStorage
    localStorage.setItem("dashboard-card-order", JSON.stringify(defaultOrder));
    localStorage.setItem(
      "dashboard-card-visibility",
      JSON.stringify(defaultVisibility)
    );
  };

  // Função para alterar ordem dos cards
  const handleCardOrderChange = (
    newOrder: Array<{ key: string; label: string; icon: string }>
  ) => {
    setCardOrder(newOrder);
    localStorage.setItem("dashboard-card-order", JSON.stringify(newOrder));
  };

  // Carregar configurações salvas do localStorage
  useEffect(() => {
    // Carregar ordem dos cards
    const savedOrder = localStorage.getItem("dashboard-card-order");
    if (savedOrder) {
      try {
        const parsedOrder = JSON.parse(savedOrder);
        // Verificar se dailyFlow está presente, se não, adicionar
        const hasDailyFlow = parsedOrder.some(
          (card: any) => card.key === "dailyFlow"
        );
        if (!hasDailyFlow) {
          const updatedOrder = [
            ...parsedOrder,
            { key: "dailyFlow", label: "Fluxo diário", icon: "📅" },
          ];
          setCardOrder(updatedOrder);
          localStorage.setItem(
            "dashboard-card-order",
            JSON.stringify(updatedOrder)
          );
        } else {
          setCardOrder(parsedOrder);
        }
      } catch (error) {
        console.error("Erro ao carregar ordem dos cards:", error);
      }
    }

    // Carregar visibilidade dos cards
    const savedVisibility = localStorage.getItem("dashboard-card-visibility");
    if (savedVisibility) {
      try {
        const parsedVisibility = JSON.parse(savedVisibility);
        // Verificar se dailyFlow está presente na visibilidade, se não, adicionar
        if (!parsedVisibility.hasOwnProperty("dailyFlow")) {
          parsedVisibility.dailyFlow = true;
          setCardVisibility(parsedVisibility);
          localStorage.setItem(
            "dashboard-card-visibility",
            JSON.stringify(parsedVisibility)
          );
        } else {
          setCardVisibility(parsedVisibility);
        }
      } catch (error) {
        console.error("Erro ao carregar visibilidade dos cards:", error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchSummary = async () => {
      const [s, a, c, d] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/dashboard/summary`, {
          credentials: "include",
        }),
        fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/dashboard/balances-by-account`,
          { credentials: "include" }
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/dashboard/expenses-by-category`,
          { credentials: "include" }
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/dashboard/daily-flow`,
          { credentials: "include" }
        ),
      ]);
      if (s.ok) setSummary(await s.json());
      if (a.ok) setByAccount(await a.json());
      if (c.ok) setByCategory(await c.json());
      if (d.ok) setDaily(await d.json());

      // Fetch credit cards summary
      try {
        const cc = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/dashboard/credit-cards-summary`,
          { credentials: "include" }
        );
        if (cc.ok) setCreditCardsSummary(await cc.json());
      } catch {
        // silent - credit cards summary not available
      }

      // Fetch categories for budget widget
      try {
        const catRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories`,
          { credentials: "include" }
        );
        if (catRes.ok) setAllCategories(await catRes.json());
      } catch {
        // silent
      }
    };
    fetchSummary();
  }, []);

  // Verificação de segurança para summary
  if (!summary) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[color:var(--color-secondary)]/30 border-t-[color:var(--color-secondary)]" />
          <p
            className="text-[13px] text-gray-500 dark:text-slate-400"
            style={{ fontFamily: fontBody }}
          >
            Carregando dashboard...
          </p>
        </div>
      </div>
    );
  }

  // ---- Dados derivados para o hero ----------------------------------------
  const saldo = Number(summary.saldo_mes);
  const receita = Number(summary.receita_mes);
  const despesa = Number(summary.despesa_mes);
  const contasCount = byAccount.length + 1; // +1 = carteira padrão
  const cartoesCount = creditCardsSummary.length;

  const agora = new Date();
  const periodo = `${agora
    .toLocaleDateString("pt-BR", { month: "short" })
    .replace(".", "")} · ${agora.getFullYear()}`;
  const hojeFmt = agora.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Sparkline robusto: janela fixa de 14 dias terminando hoje. Mesmo com
  // poucos dados, mostra barras de baseline + destaque no dia de maior fluxo.
  const heroSlots = (() => {
    const map = new Map<string, number>();
    daily.forEach((d) => {
      map.set(
        String(d.data).split("T")[0],
        Number(d.receitas) + Number(d.despesas)
      );
    });
    const out: { key: string; mag: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const dt = new Date(agora);
      dt.setDate(agora.getDate() - i);
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(dt.getDate()).padStart(2, "0")}`;
      out.push({ key, mag: map.get(key) ?? 0 });
    }
    return out;
  })();
  const maxMag = Math.max(1, ...heroSlots.map((s) => s.mag));
  const activeSlot = heroSlots.reduce(
    (best, s, i) => (s.mag > heroSlots[best].mag ? i : best),
    0
  );
  const hasFlow = heroSlots.some((s) => s.mag > 0);

  const delayFor = (idx: number) => Math.min(idx * 0.04, 0.3);

  return (
    <div className="w-full min-h-screen">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Saudação */}
        <Reveal className="mb-6">
          <Kicker className="mb-2">{hojeFmt}</Kicker>
          <h1
            className="text-[clamp(1.6rem,4vw,2.1rem)] font-bold leading-tight tracking-[-0.02em] text-[color:var(--color-primary)] dark:text-slate-100"
            style={{ fontFamily: fontHeading }}
          >
            {getGreeting()},{" "}
            <span className="text-[color:var(--color-secondary)] dark:text-[color:var(--color-secondary-light)]">
              {user?.nome || t("dashboard.user")}
            </span>
            ! 👋
          </h1>
          <p
            className="mt-1.5 text-[14px] text-gray-500 dark:text-slate-400"
            style={{ fontFamily: fontBody }}
          >
            {t("dashboard.financeSummary")}
          </p>
        </Reveal>

        {/* Hero — saldo animado + fluxo + receita/despesa */}
        <GlassCard variant="hero" className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Kicker>{t("dashboard.currentBalance")}</Kicker>
              <p
                className="mt-0.5 text-[11px] text-gray-500 dark:text-slate-400"
                style={{ fontFamily: fontMono }}
              >
                {periodo}
              </p>
            </div>
            <Pill tone={saldo >= 0 ? "secondary" : "danger"}>
              {saldo >= 0 ? (
                <TrendingUp size={11} strokeWidth={2.4} />
              ) : (
                <TrendingDown size={11} strokeWidth={2.4} />
              )}
              {saldo >= 0 ? "Positivo" : "Negativo"}
            </Pill>
          </div>

          <div className="mt-5 text-[color:var(--color-primary)] dark:text-slate-100">
            <AnimatedNumber
              value={saldo}
              className="text-[clamp(2.25rem,6vw,3.25rem)]"
            />
          </div>
          <p
            className="mt-1 text-[12px] text-gray-500 dark:text-slate-400"
            style={{ fontFamily: fontBody }}
          >
            {contasCount}{" "}
            {contasCount === 1 ? t("dashboard.account") : t("dashboard.accounts")}
            {cartoesCount > 0 &&
              ` · ${cartoesCount} ${cartoesCount === 1 ? "cartão" : "cartões"}`}
          </p>

          <div className="mt-5 flex items-end gap-1.5" style={{ height: 72 }}>
            {heroSlots.map((s, idx) => {
              const h = s.mag > 0 ? Math.max((s.mag / maxMag) * 64, 8) : 4;
              const active = hasFlow && idx === activeSlot;
              return (
                <motion.div
                  key={s.key}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}px` }}
                  transition={{ duration: 0.8, ease: EASE, delay: idx * 0.03 }}
                  className={cn(
                    "flex-1 rounded-t-md",
                    active
                      ? "bg-[color:var(--color-secondary)] shadow-[0_0_18px_rgba(0,204,102,0.45)]"
                      : "bg-gradient-to-t from-[color:var(--color-primary)]/10 to-[color:var(--color-primary)]/25 dark:from-slate-700/40 dark:to-slate-600/60"
                  )}
                />
              );
            })}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-gray-200/60 bg-gray-50 px-3.5 py-3 dark:border-slate-800 dark:bg-slate-800/60">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-secondary)]/15 text-[color:var(--color-secondary-dark)] dark:text-[color:var(--color-secondary-light)]">
                <TrendingUp size={17} strokeWidth={2.2} />
              </span>
              <div className="min-w-0">
                <Kicker>{t("dashboard.monthlyIncome")}</Kicker>
                <p
                  className="truncate text-[15px] font-semibold text-[color:var(--color-secondary-dark)] dark:text-[color:var(--color-secondary-light)]"
                  style={{ fontFamily: fontHeading, fontVariantNumeric: "tabular-nums" }}
                >
                  {formatBRL(receita)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-gray-200/60 bg-gray-50 px-3.5 py-3 dark:border-slate-800 dark:bg-slate-800/60">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-danger)]/10 text-[color:var(--color-danger)]">
                <TrendingDown size={17} strokeWidth={2.2} />
              </span>
              <div className="min-w-0">
                <Kicker>{t("dashboard.monthlyExpenses")}</Kicker>
                <p
                  className="truncate text-[15px] font-semibold text-[color:var(--color-danger)]"
                  style={{ fontFamily: fontHeading, fontVariantNumeric: "tabular-nums" }}
                >
                  {formatBRL(despesa)}
                </p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Cards configuráveis */}
        <div className="space-y-5 sm:space-y-6">
          {cardOrder.map((card, i) => {
            if (!cardVisibility[card.key as keyof typeof cardVisibility])
              return null;

            const delay = delayFor(i);
            const CardIcon = getCardIcon(card.key);

            switch (card.key) {
              case "firstSteps":
                return (
                  <GlassCard key={card.key} delay={delay}>
                    <SectionHeader
                      icon={CardIcon}
                      title="Primeiros passos"
                      tone="secondary"
                      meta={<Pill tone="secondary">{firstStepsProgress}%</Pill>}
                    />
                    <ProgressBar value={firstStepsProgress} className="mb-6" />
                    <div className="space-y-3.5">
                      <StepRow done label="Preencha as informações iniciais 🎉" />
                      <StepRow n={2} label="Cadastre uma conta bancária" />
                      <StepRow n={3} label="Cadastre um cartão de crédito" />
                      <StepRow n={4} label="Complete seu cadastro" />
                    </div>
                  </GlassCard>
                );

              case "accounts":
                return (
                  <GlassCard key={card.key} delay={delay}>
                    <SectionHeader
                      icon={CardIcon}
                      title={t("dashboard.myAccounts")}
                      tone="primary"
                      meta={
                        <span
                          className="text-[12px] text-gray-500 dark:text-slate-400"
                          style={{ fontFamily: fontMono }}
                        >
                          {contasCount}{" "}
                          {contasCount === 1
                            ? t("dashboard.account")
                            : t("dashboard.accounts")}
                        </span>
                      }
                      action={
                        <IconButton
                          icon={Plus}
                          tone="secondary"
                          label="Adicionar conta"
                          onClick={() => router.push("/accounts")}
                        />
                      }
                    />
                    <div className="space-y-3">
                      {/* Carteira padrão */}
                      <div className={rowClass}>
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-secondary)] text-sm font-bold text-white">
                            $
                          </span>
                          <div>
                            <span
                              className="block text-[14px] font-medium text-gray-800 dark:text-slate-100"
                              style={{ fontFamily: fontBody }}
                            >
                              Carteira
                            </span>
                            <span className="text-[12px] text-gray-500 dark:text-slate-400">
                              Dinheiro em espécie
                            </span>
                          </div>
                        </div>
                        <span
                          className="text-[15px] font-semibold text-gray-700 dark:text-slate-200"
                          style={{
                            fontFamily: fontHeading,
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {formatBRL(0)}
                        </span>
                      </div>

                      {byAccount.length > 0 ? (
                        byAccount.map((a, index) => (
                          <div key={a.id} className={rowClass}>
                            <div className="flex items-center gap-3">
                              <span
                                className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                                style={{
                                  backgroundColor: `hsl(${index * 137.5}, 60%, 45%)`,
                                }}
                              >
                                {a.nome_banco.charAt(0).toUpperCase()}
                              </span>
                              <div>
                                <span
                                  className="block text-[14px] font-medium text-gray-800 dark:text-slate-100"
                                  style={{ fontFamily: fontBody }}
                                >
                                  {a.nome_banco}
                                </span>
                                <span className="text-[12px] text-gray-500 dark:text-slate-400">
                                  {t("dashboard.checkingAccount")}
                                </span>
                              </div>
                            </div>
                            <span
                              className={cn(
                                "text-[15px] font-semibold",
                                Number(a.saldo_atual) >= 0
                                  ? "text-[color:var(--color-secondary-dark)] dark:text-[color:var(--color-secondary-light)]"
                                  : "text-[color:var(--color-danger)]"
                              )}
                              style={{
                                fontFamily: fontHeading,
                                fontVariantNumeric: "tabular-nums",
                              }}
                            >
                              {formatBRL(a.saldo_atual)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center gap-3 pt-3 text-center">
                          <PrimaryButton onClick={() => router.push("/accounts")}>
                            Adicionar uma conta
                          </PrimaryButton>
                          <p
                            className="text-[13px] text-gray-500 dark:text-slate-400"
                            style={{ fontFamily: fontBody }}
                          >
                            Total{" "}
                            <span className="font-semibold text-gray-700 dark:text-slate-200">
                              {formatBRL(0)}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </GlassCard>
                );

              case "creditCards":
                return (
                  <GlassCard key={card.key} delay={delay}>
                    <SectionHeader
                      icon={CardIcon}
                      title="Cartões de crédito"
                      tone="primary"
                      action={
                        <IconButton
                          icon={ChevronRight}
                          label="Ver cartões"
                          onClick={() => router.push("/cards")}
                        />
                      }
                    />
                    {creditCardsSummary.length > 0 ? (
                      <div className="space-y-3">
                        {creditCardsSummary.map((cs: any) => {
                          const isOverdue =
                            cs.status !== "paga" &&
                            new Date(cs.data_vencimento) < new Date();
                          const isDueSoon =
                            cs.status !== "paga" &&
                            !isOverdue &&
                            new Date(cs.data_vencimento) <=
                              new Date(Date.now() + 7 * 86400000);
                          const tone =
                            cs.status === "paga"
                              ? "secondary"
                              : isOverdue
                              ? "danger"
                              : isDueSoon
                              ? "warning"
                              : "info";
                          const statusLabel =
                            cs.status === "paga"
                              ? "Paga"
                              : isOverdue
                              ? "Vencida"
                              : isDueSoon
                              ? "Vence em breve"
                              : "Aberta";
                          const valueColor =
                            tone === "secondary"
                              ? "text-[color:var(--color-secondary-dark)] dark:text-[color:var(--color-secondary-light)]"
                              : tone === "danger"
                              ? "text-[color:var(--color-danger)] dark:text-red-300"
                              : tone === "warning"
                              ? "text-[#8a6d00] dark:text-[color:var(--color-warning)]"
                              : "text-[color:var(--color-primary)] dark:text-slate-200";
                          return (
                            <button
                              key={cs.cartao_id}
                              onClick={() =>
                                router.push(`/cards?cardId=${cs.cartao_id}`)
                              }
                              className={cn(rowClass, "w-full text-left")}
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className={cn(
                                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                                    tone === "secondary"
                                      ? "bg-[color:var(--color-secondary)]/12 text-[color:var(--color-secondary-dark)] dark:text-[color:var(--color-secondary-light)]"
                                      : tone === "danger"
                                      ? "bg-[color:var(--color-danger)]/10 text-[color:var(--color-danger)]"
                                      : tone === "warning"
                                      ? "bg-[color:var(--color-warning)]/20 text-[#8a6d00] dark:text-[color:var(--color-warning)]"
                                      : "bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] dark:bg-white/10 dark:text-slate-200"
                                  )}
                                >
                                  <CardIcon size={18} strokeWidth={2} />
                                </span>
                                <div className="min-w-0 text-left">
                                  <p
                                    className="truncate text-[14px] font-semibold text-gray-800 dark:text-slate-100"
                                    style={{ fontFamily: fontBody }}
                                  >
                                    {cs.cartao_nome}
                                  </p>
                                  <p className="truncate text-[12px] text-gray-500 dark:text-slate-400">
                                    {cs.bandeira} · Venc:{" "}
                                    {new Date(
                                      cs.data_vencimento
                                    ).toLocaleDateString("pt-BR")}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <span
                                  className={cn(
                                    "text-[14px] font-bold",
                                    valueColor
                                  )}
                                  style={{ fontVariantNumeric: "tabular-nums" }}
                                >
                                  {formatBRL(cs.valor_total)}
                                </span>
                                <Pill tone={tone as any}>{statusLabel}</Pill>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <EmptyState
                        icon={CardIcon}
                        title="Nenhum cartão de crédito cadastrado."
                        description="Melhore seu controle financeiro agora!"
                        action={
                          <PrimaryButton onClick={() => router.push("/cards")}>
                            Adicionar novo cartão
                          </PrimaryButton>
                        }
                      />
                    )}
                  </GlassCard>
                );

              case "expensesByCategory": {
                const sorted = [...byCategory].sort(
                  (a, b) => Number(b.total) - Number(a.total)
                );
                const maxCat = Math.max(
                  1,
                  ...byCategory.map((c) => Number(c.total))
                );
                return (
                  <GlassCard key={card.key} delay={delay}>
                    <SectionHeader
                      icon={CardIcon}
                      title="Despesas por categoria"
                      tone="secondary"
                    />
                    {sorted.length > 0 ? (
                      <div className="space-y-4">
                        {sorted.slice(0, 6).map((c, idx) => (
                          <div key={c.categoria ?? idx}>
                            <div className="mb-1.5 flex items-center justify-between gap-3">
                              <span
                                className="truncate text-[13px] text-gray-700 dark:text-slate-200"
                                style={{ fontFamily: fontBody }}
                              >
                                {c.categoria}
                              </span>
                              <span
                                className="text-[13px] font-semibold text-gray-800 dark:text-slate-100"
                                style={{
                                  fontFamily: fontHeading,
                                  fontVariantNumeric: "tabular-nums",
                                }}
                              >
                                {formatBRL(c.total)}
                              </span>
                            </div>
                            <ProgressBar
                              value={(Number(c.total) / maxCat) * 100}
                              tone="secondary"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        icon={CardIcon}
                        title="Você não tem despesas cadastradas este mês."
                        description="Adicione seus gastos no mês atual para ver seus gráficos."
                      />
                    )}
                  </GlassCard>
                );
              }

              case "dailyFlow": {
                const maxValue = Math.max(
                  1,
                  ...daily.map((day) =>
                    Math.max(Number(day.receitas), Number(day.despesas))
                  )
                );
                return (
                  <GlassCard key={card.key} delay={delay}>
                    <SectionHeader
                      icon={CardIcon}
                      title={t("dashboard.dailyFlow")}
                      tone="primary"
                      meta={
                        <div
                          className="flex items-center gap-3 text-[11px]"
                          style={{ fontFamily: fontBody }}
                        >
                          <span className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400">
                            <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--color-secondary)]" />
                            {t("dashboard.income")}
                          </span>
                          <span className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400">
                            <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--color-danger)]" />
                            {t("dashboard.expenses")}
                          </span>
                        </div>
                      }
                    />
                    {daily.length > 0 ? (
                      <div
                        className="flex items-end justify-between gap-1.5 overflow-x-auto pb-2"
                        style={{ height: 128 }}
                      >
                        {daily.slice(0, 15).map((d, index) => {
                          const rec = Number(d.receitas);
                          const des = Number(d.despesas);
                          const recHeight = (rec / maxValue) * 100;
                          const desHeight = (des / maxValue) * 100;
                          const parts = String(d.data)
                            .split("T")[0]
                            .split("-");
                          return (
                            <div
                              key={d.data ?? index}
                              className="group flex min-w-[22px] flex-1 flex-col items-center"
                            >
                              <div className="flex h-24 items-end gap-1">
                                <div
                                  title={`Receitas: ${formatBRL(rec)}`}
                                  className="w-2 rounded-t-sm bg-[color:var(--color-secondary)] transition-all duration-200 group-hover:opacity-80"
                                  style={{
                                    height: `${recHeight}%`,
                                    minHeight: rec > 0 ? "4px" : "0px",
                                  }}
                                />
                                <div
                                  title={`Despesas: ${formatBRL(des)}`}
                                  className="w-2 rounded-t-sm bg-[color:var(--color-danger)] transition-all duration-200 group-hover:opacity-80"
                                  style={{
                                    height: `${desHeight}%`,
                                    minHeight: des > 0 ? "4px" : "0px",
                                  }}
                                />
                              </div>
                              <span
                                className="mt-2 text-[10px] text-gray-500 dark:text-slate-400"
                                style={{ fontFamily: fontMono }}
                              >
                                {parts[2]}/{parts[1]}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <EmptyState
                        icon={CardIcon}
                        title="Sem movimentações recentes."
                        description="Registre receitas e despesas para visualizar o fluxo diário."
                      />
                    )}
                  </GlassCard>
                );
              }

              case "monthlyPlanning": {
                // Read budget from localStorage
                const now = new Date();
                const mesAtual = `${now.getFullYear()}-${String(
                  now.getMonth() + 1
                ).padStart(2, "0")}`;
                const budgetKey = `moneyhub_budget_${user?.id}_${mesAtual}`;
                let budgetItems: { categoria_id: number; limite: number }[] = [];
                try {
                  const stored =
                    typeof window !== "undefined"
                      ? localStorage.getItem(budgetKey)
                      : null;
                  if (stored) budgetItems = JSON.parse(stored);
                } catch {}

                const budgetCategories = budgetItems
                  .map((b) => {
                    const catInfo = allCategories?.find(
                      (c: any) => c.id === b.categoria_id
                    );
                    const catName =
                      catInfo?.nome || `Categoria ${b.categoria_id}`;
                    const expenseMatch = byCategory?.find(
                      (c: any) => c.categoria === catName
                    );
                    const gasto = expenseMatch ? Number(expenseMatch.total) : 0;
                    const pct =
                      b.limite > 0 ? Math.round((gasto / b.limite) * 100) : 0;
                    return { ...b, nome: catName, gasto, pct };
                  })
                  .sort((a, b) => b.pct - a.pct)
                  .slice(0, 3);

                const totalOrcado = budgetItems.reduce(
                  (s, b) => s + b.limite,
                  0
                );
                const totalGasto = budgetCategories.reduce(
                  (s, b) => s + b.gasto,
                  0
                );
                const hasBudget = budgetItems.length > 0;
                const overallPct =
                  totalOrcado > 0
                    ? Math.round((totalGasto / totalOrcado) * 100)
                    : 0;

                return (
                  <GlassCard key={card.key} delay={delay}>
                    <SectionHeader
                      icon={CardIcon}
                      title="Planejamento mensal"
                      tone="secondary"
                      action={
                        hasBudget ? (
                          <IconButton
                            icon={ChevronRight}
                            label="Gerenciar orçamento"
                            onClick={() => router.push("/budget")}
                          />
                        ) : undefined
                      }
                    />
                    {hasBudget ? (
                      <div>
                        <div className="mb-5">
                          <div className="mb-1.5 flex items-center justify-between text-[13px]">
                            <span
                              className="text-gray-600 dark:text-slate-300"
                              style={{
                                fontFamily: fontBody,
                                fontVariantNumeric: "tabular-nums",
                              }}
                            >
                              {formatBRL(totalGasto)} / {formatBRL(totalOrcado)}
                            </span>
                            <span className="font-semibold text-gray-700 dark:text-slate-200">
                              {overallPct}%
                            </span>
                          </div>
                          <ProgressBar
                            value={overallPct}
                            tone={pctTone(overallPct)}
                          />
                        </div>
                        <div className="space-y-3.5">
                          {budgetCategories.map((cat) => (
                            <div key={cat.categoria_id}>
                              <div className="mb-1 flex items-center justify-between text-[13px]">
                                <span
                                  className="truncate text-gray-700 dark:text-slate-200"
                                  style={{ fontFamily: fontBody }}
                                >
                                  {cat.nome}
                                </span>
                                <span className="text-[12px] text-gray-500 dark:text-slate-400">
                                  {cat.pct}%
                                </span>
                              </div>
                              <ProgressBar
                                value={cat.pct}
                                tone={pctTone(cat.pct)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <EmptyState
                        icon={CardIcon}
                        title="Você ainda não tem um planejamento definido para esse mês."
                        description="Melhore seu controle financeiro agora!"
                        action={
                          <PrimaryButton onClick={() => router.push("/budget")}>
                            Definir meu planejamento
                          </PrimaryButton>
                        }
                      />
                    )}
                  </GlassCard>
                );
              }

              case "monthlyEconomy": {
                const economiaPct = Math.min(
                  (Math.abs(saldo) / 1000) * 100,
                  100
                );
                return (
                  <GlassCard key={card.key} delay={delay}>
                    <SectionHeader
                      icon={CardIcon}
                      title="Economia mensal"
                      tone="secondary"
                    />
                    <div className="space-y-4">
                      <div className={panelClass}>
                        <div className="mb-2 flex items-center justify-between">
                          <span
                            className="text-[13px] font-medium text-gray-600 dark:text-slate-300"
                            style={{ fontFamily: fontBody }}
                          >
                            Economia deste mês
                          </span>
                          <span
                            className={cn(
                              "text-[16px] font-bold",
                              saldo >= 0
                                ? "text-[color:var(--color-secondary-dark)] dark:text-[color:var(--color-secondary-light)]"
                                : "text-[color:var(--color-danger)]"
                            )}
                            style={{
                              fontFamily: fontHeading,
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {formatBRL(saldo)}
                          </span>
                        </div>
                        <ProgressBar
                          value={economiaPct}
                          tone={saldo >= 0 ? "secondary" : "danger"}
                        />
                      </div>

                      <div className={panelClass}>
                        <div className="flex items-center justify-between">
                          <span
                            className="text-[13px] font-medium text-gray-600 dark:text-slate-300"
                            style={{ fontFamily: fontBody }}
                          >
                            Meta mensal
                          </span>
                          <span
                            className="text-[16px] font-bold text-gray-800 dark:text-slate-100"
                            style={{
                              fontFamily: fontHeading,
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {formatBRL(1000)}
                          </span>
                        </div>
                        <div className="mt-3 flex justify-center">
                          <PrimaryButton>Definir meta</PrimaryButton>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                );
              }

              case "spendingFrequency":
                return (
                  <GlassCard key={card.key} delay={delay}>
                    <SectionHeader
                      icon={CardIcon}
                      title="Frequência de gastos"
                      tone="primary"
                    />
                    <div className="space-y-4">
                      <div className={panelClass}>
                        <h4
                          className="mb-3 text-[13px] font-medium text-gray-600 dark:text-slate-300"
                          style={{ fontFamily: fontBody }}
                        >
                          Gastos por dia da semana
                        </h4>
                        <div className="space-y-2.5">
                          {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map(
                            (day) => {
                              const w = Math.random() * 100;
                              return (
                                <div
                                  key={day}
                                  className="flex items-center gap-3"
                                >
                                  <span
                                    className="w-8 text-[11px] text-gray-500 dark:text-slate-400"
                                    style={{ fontFamily: fontMono }}
                                  >
                                    {day}
                                  </span>
                                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-slate-800">
                                    <div
                                      className="h-2 rounded-full bg-[color:var(--color-secondary)]"
                                      style={{ width: `${w}%` }}
                                    />
                                  </div>
                                  <span
                                    className="w-14 text-right text-[12px] text-gray-500 dark:text-slate-400"
                                    style={{
                                      fontVariantNumeric: "tabular-nums",
                                    }}
                                  >
                                    {formatBRL(Math.round(w * 2 + 50))}
                                  </span>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className={cn(panelClass, "text-center")}>
                          <div
                            className="text-[20px] font-bold text-gray-800 dark:text-slate-100"
                            style={{ fontFamily: fontHeading }}
                          >
                            23
                          </div>
                          <div className="text-[12px] text-gray-500 dark:text-slate-400">
                            Transações
                          </div>
                        </div>
                        <div className={cn(panelClass, "text-center")}>
                          <div
                            className="text-[20px] font-bold text-gray-800 dark:text-slate-100"
                            style={{ fontFamily: fontHeading }}
                          >
                            {formatBRL(1250)}
                          </div>
                          <div className="text-[12px] text-gray-500 dark:text-slate-400">
                            Total gasto
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                );

              case "monthlyBalance":
                return (
                  <GlassCard key={card.key} delay={delay}>
                    <SectionHeader
                      icon={CardIcon}
                      title="Balanço mensal"
                      tone="primary"
                    />
                    <div className="space-y-4">
                      <div className={panelClass}>
                        <h4
                          className="mb-3 text-[13px] font-medium text-gray-600 dark:text-slate-300"
                          style={{ fontFamily: fontBody }}
                        >
                          Resumo do mês
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-[13px]">
                            <span className="text-gray-500 dark:text-slate-400">
                              Receitas
                            </span>
                            <span
                              className="font-medium text-[color:var(--color-secondary-dark)] dark:text-[color:var(--color-secondary-light)]"
                              style={{ fontVariantNumeric: "tabular-nums" }}
                            >
                              {formatBRL(receita)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[13px]">
                            <span className="text-gray-500 dark:text-slate-400">
                              Despesas
                            </span>
                            <span
                              className="font-medium text-[color:var(--color-danger)]"
                              style={{ fontVariantNumeric: "tabular-nums" }}
                            >
                              {formatBRL(despesa)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between border-t border-gray-200/70 pt-3 text-[13px] dark:border-slate-700">
                            <span className="font-medium text-gray-600 dark:text-slate-300">
                              Saldo
                            </span>
                            <span
                              className={cn(
                                "font-bold",
                                saldo >= 0
                                  ? "text-[color:var(--color-secondary-dark)] dark:text-[color:var(--color-secondary-light)]"
                                  : "text-[color:var(--color-danger)]"
                              )}
                              style={{ fontVariantNumeric: "tabular-nums" }}
                            >
                              {formatBRL(saldo)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className={panelClass}>
                        <div className="flex items-center justify-between">
                          <span
                            className="text-[13px] font-medium text-gray-600 dark:text-slate-300"
                            style={{ fontFamily: fontBody }}
                          >
                            Tendência
                          </span>
                          <span
                            className={cn(
                              "flex items-center gap-1.5 text-[13px] font-semibold",
                              saldo >= 0
                                ? "text-[color:var(--color-secondary-dark)] dark:text-[color:var(--color-secondary-light)]"
                                : "text-[color:var(--color-danger)]"
                            )}
                          >
                            {saldo >= 0 ? (
                              <TrendingUp size={16} strokeWidth={2.2} />
                            ) : (
                              <TrendingDown size={16} strokeWidth={2.2} />
                            )}
                            {saldo >= 0 ? "Positiva" : "Negativa"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                );

              case "favoriteTransactions":
                return (
                  <GlassCard key={card.key} delay={delay}>
                    <SectionHeader
                      icon={CardIcon}
                      title="Transações favoritas"
                      tone="warning"
                    />
                    <div className="space-y-3">
                      {[
                        { name: "Supermercado", amount: "R$ 150,00", type: "expense" },
                        { name: "Salário", amount: "R$ 3.500,00", type: "income" },
                        { name: "Combustível", amount: "R$ 80,00", type: "expense" },
                        { name: "Netflix", amount: "R$ 25,90", type: "expense" },
                      ].map((transaction, index) => (
                        <div key={index} className={rowClass}>
                          <div className="flex items-center gap-3">
                            <span
                              className={cn(
                                "flex h-9 w-9 items-center justify-center rounded-full text-white",
                                transaction.type === "income"
                                  ? "bg-[color:var(--color-secondary)]"
                                  : "bg-[color:var(--color-danger)]"
                              )}
                            >
                              {transaction.type === "income" ? (
                                <TrendingUp size={16} strokeWidth={2.2} />
                              ) : (
                                <TrendingDown size={16} strokeWidth={2.2} />
                              )}
                            </span>
                            <span
                              className="text-[14px] font-medium text-gray-800 dark:text-slate-100"
                              style={{ fontFamily: fontBody }}
                            >
                              {transaction.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "text-[14px] font-bold",
                                transaction.type === "income"
                                  ? "text-[color:var(--color-secondary-dark)] dark:text-[color:var(--color-secondary-light)]"
                                  : "text-[color:var(--color-danger)]"
                              )}
                              style={{ fontVariantNumeric: "tabular-nums" }}
                            >
                              {transaction.amount}
                            </span>
                            <Star
                              size={16}
                              className="fill-[color:var(--color-warning)] text-[color:var(--color-warning)]"
                            />
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-center pt-2">
                        <PrimaryButton>Gerenciar favoritas</PrimaryButton>
                      </div>
                    </div>
                  </GlassCard>
                );

              case "objectives":
                return (
                  <GlassCard key={card.key} delay={delay}>
                    <SectionHeader
                      icon={CardIcon}
                      title="Objetivos"
                      tone="secondary"
                    />
                    <div className="space-y-4">
                      <div className={panelClass}>
                        <div className="mb-2 flex items-center justify-between">
                          <span
                            className="text-[14px] font-medium text-gray-800 dark:text-slate-100"
                            style={{ fontFamily: fontBody }}
                          >
                            Reserva de emergência
                          </span>
                          <span className="text-[13px] font-bold text-gray-600 dark:text-slate-300">
                            65%
                          </span>
                        </div>
                        <ProgressBar value={65} tone="secondary" />
                        <p className="mt-1.5 text-[12px] text-gray-500 dark:text-slate-400">
                          {formatBRL(6500)} / {formatBRL(10000)}
                        </p>
                      </div>

                      <div className={panelClass}>
                        <div className="mb-2 flex items-center justify-between">
                          <span
                            className="text-[14px] font-medium text-gray-800 dark:text-slate-100"
                            style={{ fontFamily: fontBody }}
                          >
                            Viagem para Europa
                          </span>
                          <span className="text-[13px] font-bold text-gray-600 dark:text-slate-300">
                            30%
                          </span>
                        </div>
                        <ProgressBar value={30} tone="secondary" />
                        <p className="mt-1.5 text-[12px] text-gray-500 dark:text-slate-400">
                          {formatBRL(3000)} / {formatBRL(10000)}
                        </p>
                      </div>

                      <div className="flex justify-center pt-1">
                        <PrimaryButton>Adicionar objetivo</PrimaryButton>
                      </div>
                    </div>
                  </GlassCard>
                );

              default:
                return null;
            }
          })}
        </div>

        {/* Componente de Gerenciamento de Cards */}
        <DashboardCardManager
          isVisible={showCardManager}
          onClose={() => setShowCardManager(false)}
          cardOrder={cardOrder}
          cardVisibility={cardVisibility}
          onCardOrderChange={handleCardOrderChange}
          onCardVisibilityChange={toggleCardVisibility}
          onResetSettings={resetDashboardSettings}
        />
      </div>
    </div>
  );
}
