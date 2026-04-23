"use client";

import { useEffect, useState, useCallback } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  X,
  Copy,
  DollarSign,
  Target,
  AlertTriangle,
  Wallet,
  RefreshCw,
} from "lucide-react";

interface Category {
  id: number;
  nome: string;
  tipo: string;
  cor?: string;
  icone?: string;
}

interface Transaction {
  id: number;
  categoria_id: number;
  valor: number;
  tipo: string;
}

interface BudgetItem {
  categoria_id: number;
  limite: number;
  mes: string;
}

const MONTHS_PT = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const getLastDay = (year: number, month: number) =>
  new Date(year, month, 0).getDate();

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function getBudgetKey(userId: number | string, yearMonth: string) {
  return `moneyhub_budget_${userId}_${yearMonth}`;
}

function readBudget(userId: number | string, yearMonth: string): BudgetItem[] {
  try {
    const raw = localStorage.getItem(getBudgetKey(userId, yearMonth));
    if (!raw) return [];
    return JSON.parse(raw) as BudgetItem[];
  } catch {
    return [];
  }
}

function saveBudget(
  userId: number | string,
  yearMonth: string,
  items: BudgetItem[]
) {
  localStorage.setItem(getBudgetKey(userId, yearMonth), JSON.stringify(items));
}

export default function BudgetPage() {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState<number | null>(null);
  const [editLimitValue, setEditLimitValue] = useState("");

  const yearMonth = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchData = useCallback(async () => {
    if (!user?.id || !API) return;
    setLoading(true);
    try {
      const lastDay = getLastDay(selectedYear, selectedMonth);
      const dataInicio = `${yearMonth}-01`;
      const dataFim = `${yearMonth}-${String(lastDay).padStart(2, "0")}`;

      const [catRes, txRes] = await Promise.all([
        fetch(`${API}/api/categories`, { credentials: "include" }),
        fetch(
          `${API}/api/transactions?data_inicio=${dataInicio}&data_fim=${dataFim}&tipo=Despesa&page_size=9999`,
          { credentials: "include" }
        ),
      ]);

      if (catRes.ok) {
        const allCats: Category[] = await catRes.json();
        setCategories(allCats.filter((c) => c.tipo === "Despesa"));
      }

      if (txRes.ok) {
        const txData = await txRes.json();
        const items: Transaction[] = Array.isArray(txData)
          ? txData
          : txData.items ?? [];
        setTransactions(items);
      }

      const stored = readBudget(user.id, yearMonth);
      setBudgetItems(stored);
    } catch (err) {
      console.error("Erro ao carregar dados do orcamento:", err);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, [user?.id, API, selectedYear, selectedMonth, yearMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const goToPrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedYear((y) => y - 1);
      setSelectedMonth(12);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedYear((y) => y + 1);
      setSelectedMonth(1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const getSpentByCategory = (catId: number): number => {
    return transactions
      .filter((tx) => tx.categoria_id === catId)
      .reduce((sum, tx) => sum + Math.abs(tx.valor), 0);
  };

  const getBudgetLimit = (catId: number): number | null => {
    const item = budgetItems.find((b) => b.categoria_id === catId);
    return item ? item.limite : null;
  };

  const totalOrcado = budgetItems.reduce((sum, b) => sum + b.limite, 0);
  const totalGasto = transactions.reduce(
    (sum, tx) => sum + Math.abs(tx.valor),
    0
  );
  const totalDisponivel = totalOrcado - totalGasto;
  const overallPercent =
    totalOrcado > 0 ? (totalGasto / totalOrcado) * 100 : 0;

  const openEditModal = (catId: number) => {
    const current = getBudgetLimit(catId);
    setEditCategoryId(catId);
    setEditLimitValue(current !== null ? String(current) : "");
    setEditModalOpen(true);
  };

  const saveLimit = () => {
    if (!user?.id || editCategoryId === null) return;
    const value = parseFloat(editLimitValue);
    if (isNaN(value) || value <= 0) {
      toast.error("Informe um valor valido maior que zero");
      return;
    }

    const updated = budgetItems.filter(
      (b) => b.categoria_id !== editCategoryId
    );
    updated.push({
      categoria_id: editCategoryId,
      limite: value,
      mes: yearMonth,
    });

    saveBudget(user.id, yearMonth, updated);
    setBudgetItems(updated);
    setEditModalOpen(false);
    toast.success("Limite salvo com sucesso");
  };

  const removeLimit = (catId: number) => {
    if (!user?.id) return;
    const updated = budgetItems.filter((b) => b.categoria_id !== catId);
    saveBudget(user.id, yearMonth, updated);
    setBudgetItems(updated);
    toast.success("Limite removido");
  };

  const copyFromPreviousMonth = () => {
    if (!user?.id) return;
    let prevYear = selectedYear;
    let prevMonth = selectedMonth - 1;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear -= 1;
    }
    const prevYearMonth = `${prevYear}-${String(prevMonth).padStart(2, "0")}`;
    const prevBudget = readBudget(user.id, prevYearMonth);

    if (prevBudget.length === 0) {
      toast.warning("Nenhum orcamento definido no mes anterior");
      return;
    }

    const copied = prevBudget.map((b) => ({ ...b, mes: yearMonth }));
    saveBudget(user.id, yearMonth, copied);
    setBudgetItems(copied);
    toast.success(
      `Orcamento de ${MONTHS_PT[prevMonth - 1]} ${prevYear} copiado com sucesso`
    );
  };

  const getProgressColor = (percent: number): string => {
    if (percent >= 100) return "bg-red-500";
    if (percent >= 75) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const getProgressTextColor = (percent: number): string => {
    if (percent >= 100) return "text-red-500";
    if (percent >= 75) return "text-amber-500";
    return isDark ? "text-emerald-400" : "text-emerald-600";
  };

  const getOverallBarColor = (): string => {
    if (overallPercent >= 100) return "bg-red-500";
    if (overallPercent >= 75) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const editCategory =
    editCategoryId !== null
      ? categories.find((c) => c.id === editCategoryId)
      : null;

  // ---------- Loading State ----------
  if (loading) {
    return (
      <div className="w-full min-h-screen">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <RefreshCw
              className={`w-8 h-8 animate-spin ${
                isDark ? "text-emerald-400" : "text-emerald-600"
              }`}
            />
          </div>
        </div>
      </div>
    );
  }

  // ---------- Main Render ----------
  return (
    <div className="w-full min-h-screen">
      <div
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6"
        style={{ fontFamily: "var(--font-secondary, Open Sans, sans-serif)" }}
      >
        {/* ===== Header + Month Navigation ===== */}
        <div
          className={`transition-all duration-1000 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div
            className={`rounded-2xl shadow-lg border p-6 ${
              isDark
                ? "bg-slate-800/90 border-slate-700/30"
                : "bg-white border-slate-200/50"
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div
                    className={`p-2.5 rounded-xl ${
                      isDark ? "bg-emerald-500/20" : "bg-emerald-50"
                    }`}
                  >
                    <Target
                      className={`w-6 h-6 ${
                        isDark ? "text-emerald-400" : "text-emerald-600"
                      }`}
                    />
                  </div>
                  <h1
                    className={`text-2xl sm:text-3xl font-bold ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                    style={{
                      fontFamily:
                        "var(--font-primary, Montserrat, sans-serif)",
                    }}
                  >
                    Orcamento Mensal
                  </h1>
                </div>
                <p
                  className={`text-sm ml-14 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Defina limites de gastos por categoria
                </p>
              </div>

              {/* Month Navigator */}
              <div
                className={`flex items-center gap-1 rounded-xl border px-2 py-1.5 ${
                  isDark
                    ? "bg-slate-700/50 border-slate-600"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <button
                  onClick={goToPrevMonth}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isDark
                      ? "hover:bg-slate-600 text-slate-300 hover:text-white"
                      : "hover:bg-white hover:shadow-sm text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span
                  className={`text-base font-semibold min-w-[160px] sm:min-w-[180px] text-center select-none ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                  style={{
                    fontFamily:
                      "var(--font-primary, Montserrat, sans-serif)",
                  }}
                >
                  {MONTHS_PT[selectedMonth - 1]} {selectedYear}
                </span>
                <button
                  onClick={goToNextMonth}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isDark
                      ? "hover:bg-slate-600 text-slate-300 hover:text-white"
                      : "hover:bg-white hover:shadow-sm text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Summary Card ===== */}
        <div
          className={`transition-all duration-1000 delay-100 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div
            className={`rounded-2xl shadow-lg border p-6 ${
              isDark
                ? "bg-slate-800/90 border-slate-700/30"
                : "bg-white border-slate-200/50"
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
              {/* Orcado */}
              <div
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                  isDark
                    ? "bg-slate-700/30 border-slate-700/50"
                    : "bg-blue-50/50 border-blue-100/50"
                }`}
              >
                <div
                  className={`p-3 rounded-xl ${
                    isDark ? "bg-blue-500/20" : "bg-blue-100"
                  }`}
                >
                  <Wallet
                    className={`w-5 h-5 ${
                      isDark ? "text-blue-400" : "text-blue-600"
                    }`}
                  />
                </div>
                <div>
                  <p
                    className={`text-xs font-medium uppercase tracking-wider ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Orcado
                  </p>
                  <p
                    className={`text-lg font-bold mt-0.5 ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {formatCurrency(totalOrcado)}
                  </p>
                </div>
              </div>

              {/* Gasto */}
              <div
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                  isDark
                    ? "bg-slate-700/30 border-slate-700/50"
                    : "bg-red-50/50 border-red-100/50"
                }`}
              >
                <div
                  className={`p-3 rounded-xl ${
                    isDark ? "bg-red-500/20" : "bg-red-100"
                  }`}
                >
                  <DollarSign
                    className={`w-5 h-5 ${
                      isDark ? "text-red-400" : "text-red-600"
                    }`}
                  />
                </div>
                <div>
                  <p
                    className={`text-xs font-medium uppercase tracking-wider ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Gasto
                  </p>
                  <p
                    className={`text-lg font-bold mt-0.5 ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {formatCurrency(totalGasto)}
                  </p>
                </div>
              </div>

              {/* Disponivel */}
              <div
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                  totalDisponivel >= 0
                    ? isDark
                      ? "bg-slate-700/30 border-slate-700/50"
                      : "bg-emerald-50/50 border-emerald-100/50"
                    : isDark
                      ? "bg-red-500/10 border-red-500/20"
                      : "bg-red-50/50 border-red-200/50"
                }`}
              >
                <div
                  className={`p-3 rounded-xl ${
                    totalDisponivel >= 0
                      ? isDark
                        ? "bg-emerald-500/20"
                        : "bg-emerald-100"
                      : isDark
                        ? "bg-red-500/20"
                        : "bg-red-100"
                  }`}
                >
                  {totalDisponivel >= 0 ? (
                    <DollarSign
                      className={`w-5 h-5 ${
                        isDark ? "text-emerald-400" : "text-emerald-600"
                      }`}
                    />
                  ) : (
                    <AlertTriangle
                      className={`w-5 h-5 ${
                        isDark ? "text-red-400" : "text-red-600"
                      }`}
                    />
                  )}
                </div>
                <div>
                  <p
                    className={`text-xs font-medium uppercase tracking-wider ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Disponivel
                  </p>
                  <p
                    className={`text-lg font-bold mt-0.5 ${
                      totalDisponivel >= 0
                        ? isDark
                          ? "text-emerald-400"
                          : "text-emerald-600"
                        : isDark
                          ? "text-red-400"
                          : "text-red-600"
                    }`}
                  >
                    {formatCurrency(totalDisponivel)}
                  </p>
                </div>
              </div>
            </div>

            {/* Overall Progress Bar */}
            {totalOrcado > 0 && (
              <div className="pt-2">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span
                    className={`font-medium ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Progresso geral
                  </span>
                  <span
                    className={`font-semibold ${
                      overallPercent >= 100
                        ? "text-red-500"
                        : overallPercent >= 75
                          ? "text-amber-500"
                          : isDark
                            ? "text-emerald-400"
                            : "text-emerald-600"
                    }`}
                  >
                    {overallPercent.toFixed(1)}%
                  </span>
                </div>
                <div
                  className={`w-full h-3 rounded-full overflow-hidden ${
                    isDark ? "bg-slate-700" : "bg-slate-200"
                  }`}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${getOverallBarColor()}`}
                    style={{ width: `${Math.min(overallPercent, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===== Section Header + Copy Button ===== */}
        <div
          className={`transition-all duration-1000 delay-200 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex items-center justify-between">
            <h2
              className={`text-lg font-bold ${
                isDark ? "text-white" : "text-slate-900"
              }`}
              style={{
                fontFamily: "var(--font-primary, Montserrat, sans-serif)",
              }}
            >
              Por Categoria
            </h2>
            <button
              onClick={copyFromPreviousMonth}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] border ${
                isDark
                  ? "bg-slate-800/90 hover:bg-slate-700 text-slate-300 border-slate-700/30"
                  : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200/50 shadow-sm"
              }`}
            >
              <Copy className="w-4 h-4" />
              <span className="hidden sm:inline">Copiar do mes anterior</span>
              <span className="sm:hidden">Copiar</span>
            </button>
          </div>
        </div>

        {/* ===== Category List ===== */}
        <div
          className={`transition-all duration-1000 delay-300 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {categories.length === 0 ? (
            <div
              className={`rounded-2xl shadow-lg border p-12 text-center ${
                isDark
                  ? "bg-slate-800/90 border-slate-700/30"
                  : "bg-white border-slate-200/50"
              }`}
            >
              <div
                className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                  isDark ? "bg-slate-700/50" : "bg-slate-100"
                }`}
              >
                <AlertTriangle
                  className={`w-8 h-8 ${
                    isDark ? "text-slate-500" : "text-slate-400"
                  }`}
                />
              </div>
              <p
                className={`text-lg font-semibold mb-1 ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
                style={{
                  fontFamily:
                    "var(--font-primary, Montserrat, sans-serif)",
                }}
              >
                Nenhuma categoria encontrada
              </p>
              <p
                className={`text-sm ${
                  isDark ? "text-slate-500" : "text-slate-400"
                }`}
              >
                Cadastre categorias de despesa para definir orcamentos
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((cat, index) => {
                const limit = getBudgetLimit(cat.id);
                const spent = getSpentByCategory(cat.id);
                const percent =
                  limit !== null && limit > 0 ? (spent / limit) * 100 : 0;
                const hasLimit = limit !== null;
                const isOverBudget = hasLimit && percent >= 100;

                return (
                  <div
                    key={cat.id}
                    className={`rounded-2xl shadow-lg border p-5 transition-all duration-200 hover:scale-[1.02] ${
                      isOverBudget
                        ? isDark
                          ? "bg-slate-800/90 border-red-500/40 shadow-red-500/10"
                          : "bg-white border-red-300/60 shadow-red-500/5"
                        : isDark
                          ? "bg-slate-800/90 border-slate-700/30"
                          : "bg-white border-slate-200/50"
                    }`}
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: cat.cor || "#6b7280",
                            boxShadow: `0 0 0 2px ${isDark ? "rgb(30 41 59 / 0.9)" : "#ffffff"}, 0 0 0 4px ${cat.cor || "#6b7280"}`,
                          }}
                        />
                        <span
                          className={`font-semibold text-base ${
                            isDark ? "text-white" : "text-slate-900"
                          }`}
                          style={{
                            fontFamily:
                              "var(--font-primary, Montserrat, sans-serif)",
                          }}
                        >
                          {cat.nome}
                        </span>
                        {isOverBudget && (
                          <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {hasLimit ? (
                          <>
                            <button
                              onClick={() => openEditModal(cat.id)}
                              className={`p-2 rounded-lg transition-all duration-200 ${
                                isDark
                                  ? "hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                                  : "hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                              }`}
                              title="Editar limite"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeLimit(cat.id)}
                              className={`p-2 rounded-lg transition-all duration-200 ${
                                isDark
                                  ? "hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                                  : "hover:bg-red-50 text-slate-400 hover:text-red-500"
                              }`}
                              title="Remover limite"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => openEditModal(cat.id)}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] ${
                              isDark
                                ? "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/20"
                                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200/50"
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Definir limite
                          </button>
                        )}
                      </div>
                    </div>

                    {hasLimit && limit > 0 ? (
                      <>
                        <div
                          className={`w-full h-2.5 rounded-full overflow-hidden mb-3 ${
                            isDark ? "bg-slate-700" : "bg-slate-200"
                          }`}
                        >
                          <div
                            className={`h-full rounded-full transition-all duration-700 ease-out ${getProgressColor(percent)}`}
                            style={{
                              width: `${Math.min(percent, 100)}%`,
                            }}
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <span
                            className={`text-sm ${
                              isDark ? "text-slate-400" : "text-slate-500"
                            }`}
                          >
                            {formatCurrency(spent)}{" "}
                            <span
                              className={
                                isDark ? "text-slate-500" : "text-slate-400"
                              }
                            >
                              /
                            </span>{" "}
                            {formatCurrency(limit)}
                          </span>
                          <span
                            className={`text-sm font-bold ${getProgressTextColor(percent)}`}
                          >
                            {percent >= 100 && (
                              <span className="mr-1">!</span>
                            )}
                            {percent.toFixed(1)}%
                          </span>
                        </div>
                      </>
                    ) : (
                      <div>
                        <p
                          className={`text-sm italic ${
                            isDark ? "text-slate-500" : "text-slate-400"
                          }`}
                        >
                          Sem limite definido
                        </p>
                        {spent > 0 && (
                          <p
                            className={`text-sm mt-1.5 font-medium ${
                              isDark ? "text-slate-400" : "text-slate-500"
                            }`}
                          >
                            Gasto atual: {formatCurrency(spent)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ===== Edit Limit Modal ===== */}
        {editModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
              onClick={() => setEditModalOpen(false)}
            />
            <div
              className={`relative z-10 w-full max-w-md rounded-2xl shadow-2xl border p-6 transition-all duration-300 ${
                isDark
                  ? "bg-slate-800 border-slate-700/30"
                  : "bg-white border-slate-200/50"
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2
                  className={`text-xl font-bold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                  style={{
                    fontFamily:
                      "var(--font-primary, Montserrat, sans-serif)",
                  }}
                >
                  Definir Limite
                </h2>
                <button
                  onClick={() => setEditModalOpen(false)}
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    isDark
                      ? "hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                      : "hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {editCategory && (
                <div
                  className={`flex items-center gap-3 mb-5 p-3 rounded-xl ${
                    isDark ? "bg-slate-700/30" : "bg-slate-50"
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: editCategory.cor || "#6b7280",
                    }}
                  />
                  <span
                    className={`font-semibold ${
                      isDark ? "text-slate-200" : "text-slate-700"
                    }`}
                    style={{
                      fontFamily:
                        "var(--font-primary, Montserrat, sans-serif)",
                    }}
                  >
                    {editCategory.nome}
                  </span>
                </div>
              )}

              <label
                className={`block text-sm font-medium mb-2 ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Limite mensal (R$)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={editLimitValue}
                onChange={(e) => setEditLimitValue(e.target.value)}
                placeholder="0,00"
                className={`w-full px-4 py-3 rounded-xl border text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                  isDark
                    ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-500"
                    : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"
                }`}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveLimit();
                }}
                autoFocus
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditModalOpen(false)}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isDark
                      ? "bg-slate-700 hover:bg-slate-600 text-slate-300"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                  }`}
                >
                  Cancelar
                </button>
                <button
                  onClick={saveLimit}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
