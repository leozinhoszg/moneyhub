"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import DashboardCardManager from "@/components/DashboardCardManager";
import { useCardManager } from "@/contexts/CardManagerContext";

type Summary = {
  receita_mes: string;
  despesa_mes: string;
  saldo_mes: string;
};

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
  const { isDark, mounted } = useTheme();
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">
                Carregando dashboard...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen">
      {/* Mobile/Tablet: Full width with proper padding */}
      {/* Desktop: Centered content with max width */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div
          className={`transition-all duration-1000 w-full ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="mb-8">
            <h1
              className={`text-2xl sm:text-3xl font-bold mb-2 transition-colors duration-300 ${
                isDark ? "text-white" : "text-slate-900"
              }`}
              style={{
                fontFamily: "var(--font-primary, Montserrat, sans-serif)",
              }}
            >
              {getGreeting()}, {user?.nome || t("dashboard.user")}! 👋
            </h1>
            <p
              className={`text-sm sm:text-base ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}
              style={{
                fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
              }}
            >
              {t("dashboard.financeSummary")}
            </p>
          </div>

          {summary ? (
            <>
              {/* Layout Mobile Compacto - Similar ao Mobills */}
              <div className="block sm:hidden mb-8">
                <div
                  className={`rounded-2xl shadow-lg border ${
                    isDark
                      ? "bg-slate-800/90 border-slate-700/30"
                      : "bg-white border-slate-200/50"
                  } p-6 text-center`}
                >
                  <div
                    className={`text-sm font-medium mb-2 ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    Saldo em contas
                  </div>
                  <div
                    className={`text-3xl font-bold mb-4 ${
                      Number(summary.saldo_mes) >= 0
                        ? "text-emerald-500"
                        : "text-red-500"
                    }`}
                    style={{
                      fontFamily: "var(--font-primary, Montserrat, sans-serif)",
                    }}
                  >
                    R${Number(summary.saldo_mes).toFixed(2).replace(".", ",")}
                  </div>

                  {/* Receitas e Despesas em linha */}
                  <div className="flex justify-center gap-8">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 11l5-5m0 0l5 5m-5-5v12"
                          />
                        </svg>
                      </div>
                      <div>
                        <div
                          className={`text-xs ${
                            isDark ? "text-slate-500" : "text-slate-500"
                          }`}
                        >
                          Receitas
                        </div>
                        <div className="text-lg font-semibold text-emerald-500">
                          R$
                          {Number(summary.receita_mes)
                            .toFixed(2)
                            .replace(".", ",")}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 13l-5 5m0 0l-5-5m5 5V6"
                          />
                        </svg>
                      </div>
                      <div>
                        <div
                          className={`text-xs ${
                            isDark ? "text-slate-500" : "text-slate-500"
                          }`}
                        >
                          Despesas
                        </div>
                        <div className="text-lg font-semibold text-red-500">
                          R$
                          {Number(summary.despesa_mes)
                            .toFixed(2)
                            .replace(".", ",")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Layout Desktop - Cards Separados */}
              <div className="hidden sm:grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              <div
                className={`rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  isDark
                    ? "bg-slate-800/90 border-slate-700/30"
                    : "bg-white border-slate-200/50"
                } p-6`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-lg ${
                      isDark ? "bg-emerald-500/20" : "bg-emerald-50"
                    }`}
                  >
                    <svg
                      className="w-6 h-6 text-emerald-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 11l5-5m0 0l5 5m-5-5v12"
                      />
                    </svg>
                  </div>
                  <div
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      isDark
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    +12.5%
                  </div>
                </div>
                <div
                  className={`text-sm font-medium mb-1 ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                  style={{
                      fontFamily:
                        "var(--font-secondary, Open Sans, sans-serif)",
                  }}
                >
                  {t("dashboard.monthlyIncome")}
                </div>
                <div
                  className={`text-2xl sm:text-3xl font-bold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                  style={{
                    fontFamily: "var(--font-primary, Montserrat, sans-serif)",
                  }}
                >
                  R$ {Number(summary.receita_mes).toFixed(2)}
                </div>
              </div>

              <div
                className={`rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  isDark
                    ? "bg-slate-800/90 border-slate-700/30"
                    : "bg-white border-slate-200/50"
                } p-6`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-lg ${
                      isDark ? "bg-red-500/20" : "bg-red-50"
                    }`}
                  >
                    <svg
                      className="w-6 h-6 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 13l-5 5m0 0l-5-5m5 5V6"
                      />
                    </svg>
                  </div>
                  <div
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      isDark
                        ? "bg-red-500/20 text-red-400"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    -8.2%
                  </div>
                </div>
                <div
                  className={`text-sm font-medium mb-1 ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                  style={{
                      fontFamily:
                        "var(--font-secondary, Open Sans, sans-serif)",
                  }}
                >
                  {t("dashboard.monthlyExpenses")}
                </div>
                <div
                  className={`text-2xl sm:text-3xl font-bold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                  style={{
                    fontFamily: "var(--font-primary, Montserrat, sans-serif)",
                  }}
                >
                  R$ {Number(summary.despesa_mes).toFixed(2)}
                </div>
              </div>

              <div
                className={`rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  isDark
                    ? "bg-slate-800/90 border-slate-700/30"
                    : "bg-white border-slate-200/50"
                } p-6`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-lg ${
                      Number(summary.saldo_mes) >= 0
                        ? isDark
                          ? "bg-emerald-500/20"
                          : "bg-emerald-50"
                        : isDark
                        ? "bg-red-500/20"
                        : "bg-red-50"
                    }`}
                  >
                    <svg
                      className={`w-6 h-6 ${
                        Number(summary.saldo_mes) >= 0
                          ? "text-emerald-500"
                          : "text-red-500"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  <Link
                    className={`text-xs font-medium px-3 py-1 rounded-full transition-all duration-200 hover:scale-105 ${
                      isDark
                        ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                    href={`/transactions?tipo=${
                      Number(summary.saldo_mes) < 0 ? "Despesa" : "Receita"
                    }`}
                  >
                    {t("dashboard.viewDetails")}
                  </Link>
                </div>
                <div
                  className={`text-sm font-medium mb-1 ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                  style={{
                      fontFamily:
                        "var(--font-secondary, Open Sans, sans-serif)",
                  }}
                >
                  {t("dashboard.currentBalance")}
                </div>
                <div
                  className={`text-2xl sm:text-3xl font-bold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                  style={{
                    fontFamily: "var(--font-primary, Montserrat, sans-serif)",
                  }}
                >
                  R$ {Number(summary.saldo_mes).toFixed(2)}
                </div>
              </div>
            </div>
            </>
          ) : (
            <div
              className={`text-center py-8 transition-colors duration-300 ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}
              style={{
                fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
              }}
            >
              {t("dashboard.loading")}
            </div>
          )}

          {/* Renderizar cards na ordem definida */}
          {cardOrder.map((card) => {
            if (!cardVisibility[card.key as keyof typeof cardVisibility])
              return null;

            switch (card.key) {
              case "firstSteps":
                return (
                  <div
                    key={card.key}
                    className={`rounded-xl shadow-lg border transition-all duration-300 ${
                      isDark
                        ? "bg-slate-800/90 border-slate-700/30"
                        : "bg-white border-slate-200/50"
                    } p-6 mb-8`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            isDark ? "bg-purple-500/20" : "bg-purple-50"
                          }`}
                        >
                          <svg
                            className="w-5 h-5 text-purple-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                            />
                          </svg>
                        </div>
                        <h3
                          className={`text-lg font-semibold ${
                            isDark ? "text-white" : "text-slate-900"
                          }`}
                          style={{
                            fontFamily:
                              "var(--font-primary, Montserrat, sans-serif)",
                          }}
                        >
                          Primeiros passos
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium ${
                            isDark ? "text-purple-400" : "text-purple-600"
                          }`}
                        >
                          {firstStepsProgress}%
                        </span>
                      </div>
                    </div>

                    {/* Barra de progresso */}
                    <div className="mb-6">
                      <div
                        className={`w-full h-2 rounded-full ${
                          isDark ? "bg-slate-700" : "bg-slate-200"
                        }`}
                      >
                        <div
                          className="h-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                          style={{ width: `${firstStepsProgress}%` }}
                        />
                      </div>
                    </div>

                    {/* Lista de passos */}
                    <div className="space-y-4">
                      {/* Passo 1 - Concluído */}
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4
                            className={`font-medium ${
                              isDark ? "text-slate-200" : "text-slate-800"
                            } line-through`}
                            style={{
                              fontFamily:
                                "var(--font-secondary, Open Sans, sans-serif)",
                            }}
                          >
                            Preencha as informações iniciais 🎉
                          </h4>
                        </div>
                      </div>

                      {/* Passo 2 */}
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            isDark
                              ? "border-slate-600 bg-slate-700"
                              : "border-slate-300 bg-slate-100"
                          }`}
                        >
                          <span
                            className={`text-sm font-medium ${
                              isDark ? "text-slate-400" : "text-slate-600"
                            }`}
                          >
                            2
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4
                            className={`font-medium ${
                              isDark ? "text-slate-200" : "text-slate-800"
                            }`}
                            style={{
                              fontFamily:
                                "var(--font-secondary, Open Sans, sans-serif)",
                            }}
                          >
                            Cadastre uma conta bancária
                          </h4>
                        </div>
                      </div>

                      {/* Passo 3 */}
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            isDark
                              ? "border-slate-600 bg-slate-700"
                              : "border-slate-300 bg-slate-100"
                          }`}
                        >
                          <span
                            className={`text-sm font-medium ${
                              isDark ? "text-slate-400" : "text-slate-600"
                            }`}
                          >
                            3
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4
                            className={`font-medium ${
                              isDark ? "text-slate-200" : "text-slate-800"
                            }`}
                            style={{
                              fontFamily:
                                "var(--font-secondary, Open Sans, sans-serif)",
                            }}
                          >
                            Cadastre um cartão de crédito
                          </h4>
                        </div>
                      </div>

                      {/* Passo 4 */}
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            isDark
                              ? "border-slate-600 bg-slate-700"
                              : "border-slate-300 bg-slate-100"
                          }`}
                        >
                          <span
                            className={`text-sm font-medium ${
                              isDark ? "text-slate-400" : "text-slate-600"
                            }`}
                          >
                            4
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4
                            className={`font-medium ${
                              isDark ? "text-slate-200" : "text-slate-800"
                            }`}
                            style={{
                              fontFamily:
                                "var(--font-secondary, Open Sans, sans-serif)",
                            }}
                          >
                            Complete seu cadastro
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                );

              case "accounts":
                return (
                  <div
                    key={card.key}
            className={`rounded-xl shadow-lg border transition-all duration-300 ${
              isDark
                ? "bg-slate-800/90 border-slate-700/30"
                : "bg-white border-slate-200/50"
            } p-6 mb-8`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    isDark ? "bg-blue-500/20" : "bg-blue-50"
                  }`}
                >
                  <svg
                    className="w-5 h-5 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <h3
                  className={`text-lg font-semibold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                  style={{
                            fontFamily:
                              "var(--font-primary, Montserrat, sans-serif)",
                  }}
                >
                  {t("dashboard.myAccounts")}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-sm ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {byAccount.length + 1}{" "}
                  {byAccount.length + 1 === 1
                    ? t("dashboard.account")
                    : t("dashboard.accounts")}
                </span>
                <button
                  onClick={() => router.push("/accounts")}
                  className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                    isDark
                      ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                      : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                  }`}
                  title="Adicionar Conta"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {/* Carteira padrão */}
              <div
                className={`flex items-center justify-between p-4 rounded-lg transition-all duration-200 hover:scale-[1.02] ${
                  isDark
                    ? "bg-slate-700/30 hover:bg-slate-700/50"
                    : "bg-slate-50 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                    $
                  </div>
                  <div>
                    <span
                      className={`font-medium block ${
                        isDark ? "text-slate-200" : "text-slate-800"
                      }`}
                      style={{
                        fontFamily:
                          "var(--font-secondary, Open Sans, sans-serif)",
                      }}
                    >
                      Carteira
                    </span>
                    <span
                      className={`text-xs ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      Dinheiro em espécie
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className="font-bold text-lg text-emerald-500"
                    style={{
                              fontFamily:
                                "var(--font-primary, Montserrat, sans-serif)",
                    }}
                  >
                    R$ 0,00
                  </span>
                </div>
              </div>

                      {/* Contas do usuário ou botão para adicionar */}
                      {byAccount.length > 0 ? (
                        byAccount.map((a, index) => (
                <div
                  key={a.id}
                  className={`flex items-center justify-between p-4 rounded-lg transition-all duration-200 hover:scale-[1.02] ${
                    isDark
                      ? "bg-slate-700/30 hover:bg-slate-700/50"
                      : "bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm`}
                      style={{
                                  backgroundColor: `hsl(${
                                    index * 137.5
                                  }, 70%, 50%)`,
                      }}
                    >
                      {a.nome_banco.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span
                        className={`font-medium block ${
                          isDark ? "text-slate-200" : "text-slate-800"
                        }`}
                        style={{
                          fontFamily:
                            "var(--font-secondary, Open Sans, sans-serif)",
                        }}
                      >
                        {a.nome_banco}
                      </span>
                      <span
                        className={`text-xs ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        {t("dashboard.checkingAccount")}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-bold text-lg ${
                        Number(a.saldo_atual) >= 0
                          ? "text-emerald-500"
                          : "text-red-500"
                      }`}
                      style={{
                        fontFamily:
                          "var(--font-primary, Montserrat, sans-serif)",
                      }}
                    >
                      R$ {Number(a.saldo_atual).toFixed(2)}
                    </span>
                  </div>
                </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <button
                            onClick={() => router.push("/accounts")}
                            className="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                          >
                            ADICIONAR UMA CONTA
                          </button>
                          <div
                            className={`text-center mt-4 ${
                              isDark ? "text-slate-400" : "text-slate-600"
                            }`}
                          >
                            <span className="text-2xl font-bold">R$0,00</span>
                            <p className="text-sm mt-1">Total</p>
            </div>
          </div>
                      )}
                    </div>
                  </div>
                );

              case "creditCards":
                return (
          <div
                    key={card.key}
            className={`rounded-xl shadow-lg border transition-all duration-300 ${
              isDark
                ? "bg-slate-800/90 border-slate-700/30"
                : "bg-white border-slate-200/50"
            } p-6 mb-8`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                            isDark ? "bg-orange-500/20" : "bg-orange-50"
                  }`}
                >
                  <svg
                            className="w-5 h-5 text-orange-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <h3
                  className={`text-lg font-semibold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                  style={{
                            fontFamily:
                              "var(--font-primary, Montserrat, sans-serif)",
                  }}
                >
                          Cartões de crédito
                </h3>
              </div>
                      <button
                        onClick={() => router.push("/cards")}
                        className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                  isDark
                            ? "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
                            : "bg-orange-50 text-orange-600 hover:bg-orange-100"
                        }`}
                        title="Ver Cartões"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
            </div>

                    {/* Cartões com faturas */}
                    {creditCardsSummary.length > 0 ? (
                      <div className="space-y-3">
                        {creditCardsSummary.map((cs: any) => {
                          const isOverdue = cs.status !== "paga" && new Date(cs.data_vencimento) < new Date();
                          const isDueSoon = cs.status !== "paga" && !isOverdue && new Date(cs.data_vencimento) <= new Date(Date.now() + 7 * 86400000);
                          const statusColor = cs.status === "paga" ? "text-emerald-500" : isOverdue ? "text-red-500" : isDueSoon ? "text-amber-500" : "text-blue-500";
                          const statusBg = cs.status === "paga" ? (isDark ? "bg-emerald-500/10" : "bg-emerald-50") : isOverdue ? (isDark ? "bg-red-500/10" : "bg-red-50") : isDueSoon ? (isDark ? "bg-amber-500/10" : "bg-amber-50") : (isDark ? "bg-blue-500/10" : "bg-blue-50");

                          return (
                            <button
                              key={cs.cartao_id}
                              onClick={() => router.push(`/cards?cardId=${cs.cartao_id}`)}
                              className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 hover:scale-[1.01] ${
                                isDark ? "bg-slate-700/30 border-slate-700/50 hover:bg-slate-700/50" : "bg-slate-50/80 border-slate-100 hover:bg-slate-100"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusBg}`}>
                                  <svg className={`w-5 h-5 ${statusColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                  </svg>
                                </div>
                                <div className="text-left">
                                  <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{cs.cartao_nome}</p>
                                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                    {cs.bandeira} | Venc: {new Date(cs.data_vencimento).toLocaleDateString("pt-BR")}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`text-sm font-bold ${statusColor}`}>
                                  {Number(cs.valor_total).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                </p>
                                <p className={`text-[10px] uppercase tracking-wider font-medium ${statusColor}`}>
                                  {cs.status === "paga" ? "Paga" : isOverdue ? "Vencida" : isDueSoon ? "Vence em breve" : "Aberta"}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                    <div
                      className={`text-center py-12 rounded-lg ${
                        isDark ? "bg-slate-700/20" : "bg-slate-50"
                      }`}
                    >
                      <div
                        className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                          isDark ? "bg-slate-700" : "bg-slate-200"
                        }`}
                      >
                        <svg
                          className={`w-8 h-8 ${
                            isDark ? "text-slate-400" : "text-slate-500"
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                          />
                        </svg>
                      </div>
                      <h4
                        className={`text-lg font-medium mb-2 ${
                          isDark ? "text-slate-200" : "text-slate-800"
                        }`}
                        style={{
                          fontFamily:
                            "var(--font-secondary, Open Sans, sans-serif)",
                        }}
                      >
                        Nenhum cartão de crédito cadastrado.
                      </h4>
                      <p
                        className={`text-sm mb-6 ${
                          isDark ? "text-slate-400" : "text-slate-600"
                        }`}
                        style={{
                          fontFamily:
                            "var(--font-secondary, Open Sans, sans-serif)",
                        }}
                      >
                        Melhore seu controle financeiro agora!
                      </p>
                      <button
                        onClick={() => router.push("/cards")}
                        className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                      >
                        ADICIONAR NOVO CARTÃO
                      </button>
                    </div>
                    )}
                  </div>
                );

              case "expensesByCategory":
                return (
                  <div
                    key={card.key}
                    className={`rounded-xl shadow-lg border transition-all duration-300 ${
                      isDark
                        ? "bg-slate-800/90 border-slate-700/30"
                        : "bg-white border-slate-200/50"
                    } p-6 mb-8`}
                  >
                    {/* Cabeçalho do card */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            isDark ? "bg-purple-500/20" : "bg-purple-50"
                          }`}
                        >
                          <svg
                            className="w-5 h-5 text-purple-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                        </div>
                        <h3
                          className={`text-lg font-semibold ${
                            isDark ? "text-white" : "text-slate-900"
                          }`}
                          style={{
                            fontFamily:
                              "var(--font-primary, Montserrat, sans-serif)",
                          }}
                        >
                          Despesas por categoria
                        </h3>
                      </div>
                    </div>

                    {/* Estado vazio - Despesas */}
                    <div
                      className={`text-center py-12 rounded-lg ${
                        isDark ? "bg-slate-700/20" : "bg-slate-50"
                      }`}
                    >
                      <div
                        className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                          isDark ? "bg-slate-700" : "bg-slate-200"
                        }`}
                      >
                        <svg
                          className={`w-8 h-8 ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                    </div>
                      <h4
                        className={`text-lg font-medium mb-2 ${
                        isDark ? "text-slate-200" : "text-slate-800"
                      }`}
                      style={{
                        fontFamily:
                          "var(--font-secondary, Open Sans, sans-serif)",
                      }}
                    >
                        Opa! Você não tem despesas cadastradas esse mês.
                      </h4>
                      <p
                        className={`text-sm mb-6 ${
                          isDark ? "text-slate-400" : "text-slate-600"
                        }`}
                        style={{
                          fontFamily:
                            "var(--font-secondary, Open Sans, sans-serif)",
                        }}
                      >
                        Adicione seus gastos no mês atual para ver seus
                        gráficos.
                      </p>
                    </div>
                  </div>
                );

              case "monthlyPlanning":
                {
                  // Read budget from localStorage
                  const now = new Date();
                  const mesAtual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
                  const budgetKey = `moneyhub_budget_${user?.id}_${mesAtual}`;
                  let budgetItems: { categoria_id: number; limite: number }[] = [];
                  try {
                    const stored = typeof window !== "undefined" ? localStorage.getItem(budgetKey) : null;
                    if (stored) budgetItems = JSON.parse(stored);
                  } catch {}

                  // Calculate budget usage: resolve categoria_id → name via allCategories, then match byCategory
                  const budgetCategories = budgetItems
                    .map((b) => {
                      const catInfo = allCategories?.find((c: any) => c.id === b.categoria_id);
                      const catName = catInfo?.nome || `Categoria ${b.categoria_id}`;
                      const expenseMatch = byCategory?.find((c: any) => c.categoria === catName);
                      const gasto = expenseMatch ? Number(expenseMatch.total) : 0;
                      const pct = b.limite > 0 ? Math.round((gasto / b.limite) * 100) : 0;
                      return { ...b, nome: catName, gasto, pct };
                    })
                    .sort((a, b) => b.pct - a.pct)
                    .slice(0, 3);

                  const totalOrcado = budgetItems.reduce((s, b) => s + b.limite, 0);
                  const totalGasto = budgetCategories.reduce((s, b) => s + b.gasto, 0);
                  const hasBudget = budgetItems.length > 0;

                return (
                  <div
                    key={card.key}
                    className={`rounded-xl shadow-lg border transition-all duration-300 ${
                      isDark
                        ? "bg-slate-800/90 border-slate-700/30"
                        : "bg-white border-slate-200/50"
                    } p-6 mb-8`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            isDark ? "bg-indigo-500/20" : "bg-indigo-50"
                          }`}
                        >
                          <svg
                            className="w-5 h-5 text-indigo-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                        </div>
                        <h3
                          className={`text-lg font-semibold ${
                            isDark ? "text-white" : "text-slate-900"
                          }`}
                          style={{ fontFamily: "var(--font-primary, Montserrat, sans-serif)" }}
                        >
                          Planejamento mensal
                        </h3>
                      </div>
                      {hasBudget && (
                        <button
                          onClick={() => router.push("/budget")}
                          className={`text-sm px-3 py-1 rounded-lg transition-colors ${
                            isDark ? "text-indigo-400 hover:bg-indigo-500/20" : "text-indigo-600 hover:bg-indigo-50"
                          }`}
                          style={{ fontFamily: "var(--font-secondary, Open Sans, sans-serif)" }}
                        >
                          Gerenciar orçamento
                        </button>
                      )}
                    </div>

                    {hasBudget ? (
                      <div>
                        {/* Overall progress */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className={isDark ? "text-slate-400" : "text-slate-600"} style={{ fontFamily: "var(--font-secondary, Open Sans, sans-serif)" }}>
                              R$ {totalGasto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} / R$ {totalOrcado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </span>
                            <span className={isDark ? "text-slate-400" : "text-slate-600"}>
                              {totalOrcado > 0 ? Math.round((totalGasto / totalOrcado) * 100) : 0}%
                            </span>
                          </div>
                          <div className={`h-2 rounded-full ${isDark ? "bg-slate-700" : "bg-slate-200"}`}>
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${
                                totalOrcado > 0 && (totalGasto / totalOrcado) >= 1 ? "bg-red-500" :
                                totalOrcado > 0 && (totalGasto / totalOrcado) >= 0.75 ? "bg-yellow-500" : "bg-emerald-500"
                              }`}
                              style={{ width: `${Math.min(totalOrcado > 0 ? (totalGasto / totalOrcado) * 100 : 0, 100)}%` }}
                            />
                          </div>
                        </div>
                        {/* Top 3 categories */}
                        <div className="space-y-3">
                          {budgetCategories.map((cat) => (
                            <div key={cat.categoria_id} className="flex items-center gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className={`truncate ${isDark ? "text-slate-200" : "text-slate-800"}`} style={{ fontFamily: "var(--font-secondary, Open Sans, sans-serif)" }}>
                                    {cat.nome}
                                  </span>
                                  <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                    {cat.pct}%
                                  </span>
                                </div>
                                <div className={`h-1.5 rounded-full ${isDark ? "bg-slate-700" : "bg-slate-200"}`}>
                                  <div
                                    className={`h-1.5 rounded-full transition-all ${
                                      cat.pct >= 100 ? "bg-red-500" : cat.pct >= 75 ? "bg-yellow-500" : "bg-emerald-500"
                                    }`}
                                    style={{ width: `${Math.min(cat.pct, 100)}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className={`text-center py-12 rounded-lg ${isDark ? "bg-slate-700/20" : "bg-slate-50"}`}>
                        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isDark ? "bg-slate-700" : "bg-slate-200"}`}>
                          <svg className={`w-8 h-8 ${isDark ? "text-slate-400" : "text-slate-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <h4 className={`text-lg font-medium mb-2 ${isDark ? "text-slate-200" : "text-slate-800"}`} style={{ fontFamily: "var(--font-secondary, Open Sans, sans-serif)" }}>
                          Ops! Você ainda não tem um planejamento definido para esse mês.
                        </h4>
                        <p className={`text-sm mb-6 ${isDark ? "text-slate-400" : "text-slate-600"}`} style={{ fontFamily: "var(--font-secondary, Open Sans, sans-serif)" }}>
                          Melhore seu controle financeiro agora!
                        </p>
                        <button
                          onClick={() => router.push("/budget")}
                          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                        >
                          DEFINIR MEU PLANEJAMENTO
                        </button>
                      </div>
                    )}
                  </div>
                );
                }

              case "dailyFlow":
                return (
          <div
                    key={card.key}
            className={`rounded-xl shadow-lg border transition-all duration-300 ${
              isDark
                ? "bg-slate-800/90 border-slate-700/30"
                : "bg-white border-slate-200/50"
                    } p-6 mb-8`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    isDark ? "bg-indigo-500/20" : "bg-indigo-50"
                  }`}
                >
                  <svg
                    className="w-5 h-5 text-indigo-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3
                  className={`text-lg font-semibold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                  style={{
                            fontFamily:
                              "var(--font-primary, Montserrat, sans-serif)",
                  }}
                >
                  {t("dashboard.dailyFlow")}
                </h3>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span
                            className={
                              isDark ? "text-slate-400" : "text-slate-600"
                            }
                  >
                    {t("dashboard.income")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span
                            className={
                              isDark ? "text-slate-400" : "text-slate-600"
                            }
                  >
                    {t("dashboard.expenses")}
                  </span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="flex items-end justify-between gap-1 h-32 overflow-x-auto pb-4">
                {daily.slice(0, 15).map((d, index) => {
                  const rec = Number(d.receitas);
                  const des = Number(d.despesas);
                  const maxValue = Math.max(
                    ...daily.map((day) =>
                              Math.max(
                                Number(day.receitas),
                                Number(day.despesas)
                              )
                            )
                          );
                          const recHeight =
                            maxValue > 0 ? (rec / maxValue) * 100 : 0;
                          const desHeight =
                            maxValue > 0 ? (des / maxValue) * 100 : 0;
                  return (
                    <div
                      key={d.data}
                      className="flex flex-col items-center min-w-[20px] group"
                    >
                      <div className="flex items-end gap-1 h-24 mb-2">
                        <div
                          title={`Receitas: R$ ${rec.toFixed(2)}`}
                          className="w-2 bg-emerald-500 rounded-t-sm transition-all duration-200 group-hover:bg-emerald-400"
                          style={{
                            height: `${recHeight}%`,
                            minHeight: rec > 0 ? "4px" : "0px",
                          }}
                        />
                        <div
                          title={`Despesas: R$ ${des.toFixed(2)}`}
                          className="w-2 bg-red-500 rounded-t-sm transition-all duration-200 group-hover:bg-red-400"
                          style={{
                            height: `${desHeight}%`,
                            minHeight: des > 0 ? "4px" : "0px",
                          }}
                        />
                      </div>
                      <div
                        className={`text-[10px] font-medium transition-colors duration-300 ${
                          isDark
                            ? "text-slate-400 group-hover:text-slate-300"
                            : "text-slate-600 group-hover:text-slate-800"
                        }`}
                        style={{
                          fontFamily:
                            "var(--font-secondary, Open Sans, sans-serif)",
                        }}
                      >
                        {(() => { const p = d.data.split("T")[0].split("-"); return `${p[2]}/${p[1]}`; })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
                );

              case "monthlyEconomy":
                return (
                  <div
                    key={card.key}
                    className={`rounded-xl shadow-lg border transition-all duration-300 ${
                      isDark
                        ? "bg-slate-800/90 border-slate-700/30"
                        : "bg-white border-slate-200/50"
                    } p-6 mb-8`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            isDark ? "bg-emerald-500/20" : "bg-emerald-50"
                          }`}
                        >
                          <svg
                            className="w-5 h-5 text-emerald-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                            />
                          </svg>
                        </div>
                        <h3
                          className={`text-lg font-semibold ${
                            isDark ? "text-white" : "text-slate-900"
                          }`}
                          style={{
                            fontFamily:
                              "var(--font-primary, Montserrat, sans-serif)",
                          }}
                        >
                          Economia mensal
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Economia atual */}
                      <div
                        className={`p-4 rounded-lg ${
                          isDark ? "bg-slate-700/30" : "bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-sm font-medium ${
                              isDark ? "text-slate-300" : "text-slate-600"
                            }`}
                          >
                            Economia deste mês
                          </span>
                          <span
                            className={`text-lg font-bold ${
                              Number(summary.saldo_mes) >= 0
                                ? "text-emerald-500"
                                : "text-red-500"
                            }`}
                          >
                            R${" "}
                            {Number(summary.saldo_mes)
                              .toFixed(2)
                              .replace(".", ",")}
                          </span>
                        </div>
                        <div
                          className={`w-full h-2 rounded-full ${
                            isDark ? "bg-slate-600" : "bg-slate-200"
                          }`}
                        >
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              Number(summary.saldo_mes) >= 0
                                ? "bg-emerald-500"
                                : "bg-red-500"
                            }`}
                            style={{
                              width: `${Math.min(
                                (Math.abs(Number(summary.saldo_mes)) / 1000) *
                                  100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Meta de economia */}
                      <div
                        className={`p-4 rounded-lg ${
                          isDark ? "bg-slate-700/30" : "bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-sm font-medium ${
                              isDark ? "text-slate-300" : "text-slate-600"
                            }`}
                          >
                            Meta mensal
                          </span>
                          <span
                            className={`text-lg font-bold ${
                              isDark ? "text-slate-200" : "text-slate-800"
                            }`}
                          >
                            R$ 1.000,00
                          </span>
                        </div>
                        <div className="text-center">
                          <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200">
                            Definir meta
                          </button>
                        </div>
        </div>
      </div>
    </div>
  );

              case "spendingFrequency":
                return (
                  <div
                    key={card.key}
                    className={`rounded-xl shadow-lg border transition-all duration-300 ${
                      isDark
                        ? "bg-slate-800/90 border-slate-700/30"
                        : "bg-white border-slate-200/50"
                    } p-6 mb-8`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            isDark ? "bg-blue-500/20" : "bg-blue-50"
                          }`}
                        >
                          <svg
                            className="w-5 h-5 text-blue-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                        </div>
                        <h3
                          className={`text-lg font-semibold ${
                            isDark ? "text-white" : "text-slate-900"
                          }`}
                          style={{
                            fontFamily:
                              "var(--font-primary, Montserrat, sans-serif)",
                          }}
                        >
                          Frequência de gastos
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Gráfico simples de frequência */}
                      <div
                        className={`p-4 rounded-lg ${
                          isDark ? "bg-slate-700/30" : "bg-slate-50"
                        }`}
                      >
                        <h4
                          className={`text-sm font-medium mb-3 ${
                            isDark ? "text-slate-300" : "text-slate-600"
                          }`}
                        >
                          Gastos por dia da semana
                        </h4>
                        <div className="space-y-2">
                          {[
                            "Seg",
                            "Ter",
                            "Qua",
                            "Qui",
                            "Sex",
                            "Sáb",
                            "Dom",
                          ].map((day, index) => (
                            <div key={day} className="flex items-center gap-3">
                              <span
                                className={`text-xs w-8 ${
                                  isDark ? "text-slate-400" : "text-slate-500"
                                }`}
                              >
                                {day}
                              </span>
                              <div
                                className={`flex-1 h-2 rounded-full ${
                                  isDark ? "bg-slate-600" : "bg-slate-200"
                                }`}
                              >
                                <div
                                  className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                                  style={{
                                    width: `${Math.random() * 100}%`,
                                  }}
                                />
                              </div>
                              <span
                                className={`text-xs w-12 text-right ${
                                  isDark ? "text-slate-400" : "text-slate-500"
                                }`}
                              >
                                R$ {(Math.random() * 200 + 50).toFixed(0)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Resumo */}
                      <div className="grid grid-cols-2 gap-4">
                        <div
                          className={`p-3 rounded-lg text-center ${
                            isDark ? "bg-slate-700/30" : "bg-slate-50"
                          }`}
                        >
                          <div
                            className={`text-lg font-bold ${
                              isDark ? "text-slate-200" : "text-slate-800"
                            }`}
                          >
                            23
                          </div>
                          <div
                            className={`text-xs ${
                              isDark ? "text-slate-400" : "text-slate-500"
                            }`}
                          >
                            Transações
                          </div>
                        </div>
                        <div
                          className={`p-3 rounded-lg text-center ${
                            isDark ? "bg-slate-700/30" : "bg-slate-50"
                          }`}
                        >
                          <div
                            className={`text-lg font-bold ${
                              isDark ? "text-slate-200" : "text-slate-800"
                            }`}
                          >
                            R$ 1.250
                          </div>
                          <div
                            className={`text-xs ${
                              isDark ? "text-slate-400" : "text-slate-500"
                            }`}
                          >
                            Total gasto
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );

              case "monthlyBalance":
                return (
                  <div
                    key={card.key}
                    className={`rounded-xl shadow-lg border transition-all duration-300 ${
                      isDark
                        ? "bg-slate-800/90 border-slate-700/30"
                        : "bg-white border-slate-200/50"
                    } p-6 mb-8`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            isDark ? "bg-purple-500/20" : "bg-purple-50"
                          }`}
                        >
                          <svg
                            className="w-5 h-5 text-purple-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                            />
                          </svg>
                        </div>
                        <h3
                          className={`text-lg font-semibold ${
                            isDark ? "text-white" : "text-slate-900"
                          }`}
                          style={{
                            fontFamily:
                              "var(--font-primary, Montserrat, sans-serif)",
                          }}
                        >
                          Balanço mensal
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Comparação com mês anterior */}
                      <div
                        className={`p-4 rounded-lg ${
                          isDark ? "bg-slate-700/30" : "bg-slate-50"
                        }`}
                      >
                        <h4
                          className={`text-sm font-medium mb-3 ${
                            isDark ? "text-slate-300" : "text-slate-600"
                          }`}
                        >
                          Comparação com mês anterior
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-sm ${
                                isDark ? "text-slate-400" : "text-slate-500"
                              }`}
                            >
                              Receitas
                            </span>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-sm font-medium ${
                                  isDark ? "text-slate-200" : "text-slate-800"
                                }`}
                              >
                                R${" "}
                                {Number(summary.receita_mes)
                                  .toFixed(2)
                                  .replace(".", ",")}
                              </span>
                              <span className="text-xs text-emerald-500">
                                +12%
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-sm ${
                                isDark ? "text-slate-400" : "text-slate-500"
                              }`}
                            >
                              Despesas
                            </span>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-sm font-medium ${
                                  isDark ? "text-slate-200" : "text-slate-800"
                                }`}
                              >
                                R${" "}
                                {Number(summary.despesa_mes)
                                  .toFixed(2)
                                  .replace(".", ",")}
                              </span>
                              <span className="text-xs text-red-500">+5%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-sm font-medium ${
                                isDark ? "text-slate-300" : "text-slate-600"
                              }`}
                            >
                              Saldo
                            </span>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-sm font-bold ${
                                  Number(summary.saldo_mes) >= 0
                                    ? "text-emerald-500"
                                    : "text-red-500"
                                }`}
                              >
                                R${" "}
                                {Number(summary.saldo_mes)
                                  .toFixed(2)
                                  .replace(".", ",")}
                              </span>
                              <span
                                className={`text-xs ${
                                  Number(summary.saldo_mes) >= 0
                                    ? "text-emerald-500"
                                    : "text-red-500"
                                }`}
                              >
                                {Number(summary.saldo_mes) >= 0 ? "+8%" : "-3%"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tendência */}
                      <div
                        className={`p-4 rounded-lg ${
                          isDark ? "bg-slate-700/30" : "bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-sm font-medium ${
                              isDark ? "text-slate-300" : "text-slate-600"
                            }`}
                          >
                            Tendência
                          </span>
                          <div className="flex items-center gap-1">
                            <svg
                              className={`w-4 h-4 ${
                                Number(summary.saldo_mes) >= 0
                                  ? "text-emerald-500"
                                  : "text-red-500"
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d={
                                  Number(summary.saldo_mes) >= 0
                                    ? "M7 17l9.2-9.2M17 17V7H7"
                                    : "M17 7l-9.2 9.2M7 7v10h10"
                                }
                              />
                            </svg>
                            <span
                              className={`text-sm font-medium ${
                                Number(summary.saldo_mes) >= 0
                                  ? "text-emerald-500"
                                  : "text-red-500"
                              }`}
                            >
                              {Number(summary.saldo_mes) >= 0
                                ? "Positiva"
                                : "Negativa"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );

              case "favoriteTransactions":
                return (
                  <div
                    key={card.key}
                    className={`rounded-xl shadow-lg border transition-all duration-300 ${
                      isDark
                        ? "bg-slate-800/90 border-slate-700/30"
                        : "bg-white border-slate-200/50"
                    } p-6 mb-8`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            isDark ? "bg-yellow-500/20" : "bg-yellow-50"
                          }`}
                        >
                          <svg
                            className="w-5 h-5 text-yellow-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            />
                          </svg>
                        </div>
                        <h3
                          className={`text-lg font-semibold ${
                            isDark ? "text-white" : "text-slate-900"
                          }`}
                          style={{
                            fontFamily:
                              "var(--font-primary, Montserrat, sans-serif)",
                          }}
                        >
                          Transações favoritas
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Lista de transações favoritas */}
                      {[
                        {
                          name: "Supermercado",
                          amount: "R$ 150,00",
                          type: "expense",
                        },
                        {
                          name: "Salário",
                          amount: "R$ 3.500,00",
                          type: "income",
                        },
                        {
                          name: "Combustível",
                          amount: "R$ 80,00",
                          type: "expense",
                        },
                        {
                          name: "Netflix",
                          amount: "R$ 25,90",
                          type: "expense",
                        },
                      ].map((transaction, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            isDark ? "bg-slate-700/30" : "bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                transaction.type === "income"
                                  ? "bg-emerald-500"
                                  : "bg-red-500"
                              }`}
                            >
                              <svg
                                className="w-4 h-4 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d={
                                    transaction.type === "income"
                                      ? "M7 11l5-5m0 0l5 5m-5-5v12"
                                      : "M17 13l-5 5m0 0l-5-5m5 5V6"
                                  }
                                />
                              </svg>
                            </div>
                            <span
                              className={`font-medium ${
                                isDark ? "text-slate-200" : "text-slate-800"
                              }`}
                            >
                              {transaction.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold ${
                                transaction.type === "income"
                                  ? "text-emerald-500"
                                  : "text-red-500"
                              }`}
                            >
                              {transaction.amount}
                            </span>
                            <button
                              className={`p-1 rounded ${
                                isDark
                                  ? "hover:bg-slate-600"
                                  : "hover:bg-slate-200"
                              }`}
                            >
                              <svg
                                className="w-4 h-4 text-yellow-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}

                      <div className="text-center pt-2">
                        <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200">
                          Gerenciar favoritas
                        </button>
                      </div>
                    </div>
                  </div>
                );

              case "objectives":
                return (
                  <div
                    key={card.key}
                    className={`rounded-xl shadow-lg border transition-all duration-300 ${
                      isDark
                        ? "bg-slate-800/90 border-slate-700/30"
                        : "bg-white border-slate-200/50"
                    } p-6 mb-8`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            isDark ? "bg-indigo-500/20" : "bg-indigo-50"
                          }`}
                        >
                          <svg
                            className="w-5 h-5 text-indigo-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                            />
                          </svg>
                        </div>
                        <h3
                          className={`text-lg font-semibold ${
                            isDark ? "text-white" : "text-slate-900"
                          }`}
                          style={{
                            fontFamily:
                              "var(--font-primary, Montserrat, sans-serif)",
                          }}
                        >
                          Objetivos
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Objetivo 1 */}
                      <div
                        className={`p-4 rounded-lg ${
                          isDark ? "bg-slate-700/30" : "bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`font-medium ${
                              isDark ? "text-slate-200" : "text-slate-800"
                            }`}
                          >
                            Reserva de emergência
                          </span>
                          <span
                            className={`text-sm font-bold ${
                              isDark ? "text-slate-300" : "text-slate-700"
                            }`}
                          >
                            65%
                          </span>
                        </div>
                        <div
                          className={`w-full h-2 rounded-full ${
                            isDark ? "bg-slate-600" : "bg-slate-200"
                          }`}
                        >
                          <div
                            className="h-2 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                            style={{ width: "65%" }}
                          />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span
                            className={`text-xs ${
                              isDark ? "text-slate-400" : "text-slate-500"
                            }`}
                          >
                            R$ 6.500 / R$ 10.000
                          </span>
                        </div>
                      </div>

                      {/* Objetivo 2 */}
                      <div
                        className={`p-4 rounded-lg ${
                          isDark ? "bg-slate-700/30" : "bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`font-medium ${
                              isDark ? "text-slate-200" : "text-slate-800"
                            }`}
                          >
                            Viagem para Europa
                          </span>
                          <span
                            className={`text-sm font-bold ${
                              isDark ? "text-slate-300" : "text-slate-700"
                            }`}
                          >
                            30%
                          </span>
                        </div>
                        <div
                          className={`w-full h-2 rounded-full ${
                            isDark ? "bg-slate-600" : "bg-slate-200"
                          }`}
                        >
                          <div
                            className="h-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                            style={{ width: "30%" }}
                          />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span
                            className={`text-xs ${
                              isDark ? "text-slate-400" : "text-slate-500"
                            }`}
                          >
                            R$ 3.000 / R$ 10.000
                          </span>
                        </div>
                      </div>

                      {/* Botão para adicionar objetivo */}
                      <div className="text-center pt-2">
                        <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200">
                          Adicionar objetivo
                        </button>
                      </div>
                    </div>
                  </div>
                );

              default:
                return null;
            }
          })}

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
    </div>
  );
}
