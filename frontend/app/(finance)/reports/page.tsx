"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  FileText,
  Hash,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Transaction = {
  id: number;
  tipo: string;
  valor: string;
  data_transacao: string;
  descricao: string | null;
  categoria_id: number | null;
  conta_bancaria_id: number | null;
  cartao_credito_id: number | null;
};

type Category = {
  id: number;
  nome: string;
  tipo: string;
  cor: string | null;
  icone: string | null;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MONTHS_PT = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

const PAGE_SIZE = 10;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function toDateStr(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getThisMonthRange(): [string, string] {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return [toDateStr(start), toDateStr(now)];
}

function getLastMonthRange(): [string, string] {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 0);
  return [toDateStr(start), toDateStr(end)];
}

function getLast3MonthsRange(): [string, string] {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  return [toDateStr(start), toDateStr(now)];
}

function getThisYearRange(): [string, string] {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  return [toDateStr(start), toDateStr(now)];
}

// ---------------------------------------------------------------------------
// Custom Tooltip
// ---------------------------------------------------------------------------

function ChartTooltip({
  active,
  payload,
  label,
  isDark,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
  isDark: boolean;
}) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      className="rounded-xl px-4 py-3 shadow-xl border text-sm backdrop-blur-sm"
      style={{
        backgroundColor: isDark ? "rgba(30,41,59,0.95)" : "rgba(255,255,255,0.95)",
        borderColor: isDark ? "#334155" : "#e2e8f0",
        color: isDark ? "#e2e8f0" : "#1e293b",
        fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
      }}
    >
      <p className="font-semibold mb-1.5">{label}</p>
      {payload.map((entry, idx) => (
        <p key={idx} className="flex items-center gap-2" style={{ color: entry.color }}>
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Summary Card Component
// ---------------------------------------------------------------------------

function SummaryCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  valueColor,
  borderColor,
  isDark,
  mounted,
  delay,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  valueColor: string;
  borderColor: string;
  isDark: boolean;
  mounted: boolean;
  delay: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl shadow-lg border p-6 transition-all duration-1000 hover:scale-[1.02] hover:shadow-xl ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${
        isDark
          ? "bg-slate-800/90 border-slate-700/30"
          : "bg-white border-slate-200/50"
      }`}
      style={{ transitionDelay: delay }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ backgroundColor: borderColor }}
      />
      <div className="flex items-center gap-3 mb-3">
        <div
          className="p-2.5 rounded-xl"
          style={{ backgroundColor: iconBg }}
        >
          <div style={{ color: iconColor }}>{icon}</div>
        </div>
        <span
          className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}
          style={{ fontFamily: "var(--font-secondary, Open Sans, sans-serif)" }}
        >
          {label}
        </span>
      </div>
      <p
        className="text-2xl font-bold"
        style={{
          fontFamily: "var(--font-primary, Montserrat, sans-serif)",
          color: valueColor,
        }}
      >
        {value}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function ReportsPage() {
  const { isDark, mounted } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();

  // Date state
  const [defaultRange] = useState(getThisMonthRange);
  const [startDate, setStartDate] = useState(defaultRange[0]);
  const [endDate, setEndDate] = useState(defaultRange[1]);
  const [activeShortcut, setActiveShortcut] = useState<string>("thisMonth");

  // Data state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Table pagination
  const [currentPage, setCurrentPage] = useState(1);

  // -------------------------------------------------------------------
  // Chart theme
  // -------------------------------------------------------------------

  const chartTheme = useMemo(
    () => ({
      grid: isDark ? "#334155" : "#e2e8f0",
      text: isDark ? "#94a3b8" : "#64748b",
      tooltipBg: isDark ? "#1e293b" : "#ffffff",
      tooltipBorder: isDark ? "#334155" : "#e2e8f0",
    }),
    [isDark],
  );

  // -------------------------------------------------------------------
  // Shortcut handlers
  // -------------------------------------------------------------------

  const applyShortcut = useCallback((key: string) => {
    let range: [string, string];
    switch (key) {
      case "thisMonth":
        range = getThisMonthRange();
        break;
      case "lastMonth":
        range = getLastMonthRange();
        break;
      case "last3Months":
        range = getLast3MonthsRange();
        break;
      case "thisYear":
        range = getThisYearRange();
        break;
      default:
        return;
    }
    setStartDate(range[0]);
    setEndDate(range[1]);
    setActiveShortcut(key);
    setCurrentPage(1);
  }, []);

  // -------------------------------------------------------------------
  // Data fetching
  // -------------------------------------------------------------------

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL;
      const [txRes, catRes] = await Promise.all([
        fetch(
          `${base}/api/transactions?data_inicio=${startDate}&data_fim=${endDate}&page_size=9999`,
          { credentials: "include" },
        ),
        fetch(`${base}/api/categories`, { credentials: "include" }),
      ]);

      if (!txRes.ok) throw new Error("Erro ao buscar transacoes");
      if (!catRes.ok) throw new Error("Erro ao buscar categorias");

      const txData = await txRes.json();
      const catData = await catRes.json();

      const txList: Transaction[] = Array.isArray(txData)
        ? txData
        : txData.items ?? txData.data ?? [];
      const catList: Category[] = Array.isArray(catData)
        ? catData
        : catData.items ?? catData.data ?? [];

      setTransactions(txList);
      setCategories(catList);
    } catch (err) {
      toast.error("Erro ao carregar dados do relatório");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // -------------------------------------------------------------------
  // Derived data
  // -------------------------------------------------------------------

  const categoryMap = useMemo(() => {
    const map = new Map<number, Category>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  const totalReceitas = useMemo(
    () =>
      transactions
        .filter((tx) => tx.tipo === "Receita")
        .reduce((sum, tx) => sum + parseFloat(tx.valor), 0),
    [transactions],
  );

  const totalDespesas = useMemo(
    () =>
      transactions
        .filter((tx) => tx.tipo === "Despesa")
        .reduce((sum, tx) => sum + parseFloat(tx.valor), 0),
    [transactions],
  );

  const saldo = totalReceitas - totalDespesas;

  // Expenses by category
  const expensesByCategory = useMemo(() => {
    const map = new Map<number, number>();
    transactions
      .filter((tx) => tx.tipo === "Despesa" && tx.categoria_id != null)
      .forEach((tx) => {
        const prev = map.get(tx.categoria_id!) ?? 0;
        map.set(tx.categoria_id!, prev + parseFloat(tx.valor));
      });

    const total = Array.from(map.values()).reduce((a, b) => a + b, 0);

    return Array.from(map.entries())
      .map(([catId, value]) => {
        const cat = categoryMap.get(catId);
        return {
          name: cat?.nome ?? "Sem categoria",
          value,
          color: cat?.cor ?? "#6366f1",
          percentage: total > 0 ? ((value / total) * 100).toFixed(1) : "0",
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [transactions, categoryMap]);

  // Monthly evolution (or weekly if single month)
  const monthlyEvolution = useMemo(() => {
    const start = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T00:00:00");
    const sameMonth =
      start.getFullYear() === end.getFullYear() &&
      start.getMonth() === end.getMonth();

    if (sameMonth) {
      const weeks = new Map<number, { receitas: number; despesas: number }>();
      transactions.forEach((tx) => {
        const d = new Date(tx.data_transacao);
        const dayOfMonth = d.getUTCDate();
        const week = Math.ceil(dayOfMonth / 7);
        const entry = weeks.get(week) ?? { receitas: 0, despesas: 0 };
        const val = parseFloat(tx.valor);
        if (tx.tipo === "Receita") entry.receitas += val;
        else entry.despesas += val;
        weeks.set(week, entry);
      });

      return Array.from(weeks.entries())
        .sort(([a], [b]) => a - b)
        .map(([week, data]) => ({
          name: `Semana ${week}`,
          receitas: data.receitas,
          despesas: data.despesas,
        }));
    }

    const months = new Map<string, { receitas: number; despesas: number }>();
    transactions.forEach((tx) => {
      const d = new Date(tx.data_transacao);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth()).padStart(2, "0")}`;
      const entry = months.get(key) ?? { receitas: 0, despesas: 0 };
      const val = parseFloat(tx.valor);
      if (tx.tipo === "Receita") entry.receitas += val;
      else entry.despesas += val;
      months.set(key, entry);
    });

    return Array.from(months.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, data]) => {
        const monthIdx = parseInt(key.split("-")[1], 10);
        return {
          name: MONTHS_PT[monthIdx],
          receitas: data.receitas,
          despesas: data.despesas,
        };
      });
  }, [transactions, startDate, endDate]);

  // Sorted transactions for the table
  const sortedTransactions = useMemo(
    () =>
      [...transactions].sort(
        (a, b) =>
          new Date(b.data_transacao).getTime() -
          new Date(a.data_transacao).getTime(),
      ),
    [transactions],
  );

  const totalPages = Math.max(1, Math.ceil(sortedTransactions.length / PAGE_SIZE));
  const pagedTransactions = sortedTransactions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  // -------------------------------------------------------------------
  // Download handler
  // -------------------------------------------------------------------

  const downloadReport = async (type: "csv" | "pdf") => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reports/transactions.${type}?start_date=${startDate}&end_date=${endDate}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Falha ao gerar relatório");
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `relatorio-${startDate}-${endDate}.${type}`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success(`Relatório ${type.toUpperCase()} baixado com sucesso!`);
    } catch {
      toast.error("Erro ao baixar relatório");
    }
  };

  // -------------------------------------------------------------------
  // Render helpers
  // -------------------------------------------------------------------

  const shortcuts = [
    { key: "thisMonth", label: "Este mês" },
    { key: "lastMonth", label: "Mês passado" },
    { key: "last3Months", label: "Últimos 3 meses" },
    { key: "thisYear", label: "Este ano" },
  ];

  const cardClass = isDark
    ? "bg-slate-800/90 border-slate-700/30"
    : "bg-white border-slate-200/50";

  const headingColor = isDark ? "text-white" : "text-slate-900";
  const subColor = isDark ? "text-slate-400" : "text-slate-600";

  const inputClass = `rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors ${
    isDark
      ? "bg-slate-700/50 border-slate-600 text-white"
      : "bg-white border-slate-300 text-slate-900"
  }`;

  if (!mounted) return null;

  // -------------------------------------------------------------------
  // JSX
  // -------------------------------------------------------------------

  return (
    <div className="w-full min-h-screen">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6">

        {/* Header */}
        <div
          className={`transition-all duration-1000 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex items-center gap-3 mb-1">
            <div
              className={`p-2.5 rounded-xl ${
                isDark ? "bg-emerald-500/15" : "bg-emerald-50"
              }`}
            >
              <FileText size={24} className="text-emerald-500" />
            </div>
            <div>
              <h1
                className={`text-2xl sm:text-3xl font-bold ${headingColor}`}
                style={{ fontFamily: "var(--font-primary, Montserrat, sans-serif)" }}
              >
                Relatórios
              </h1>
              <p
                className={`text-sm mt-0.5 ${subColor}`}
                style={{ fontFamily: "var(--font-secondary, Open Sans, sans-serif)" }}
              >
                Analise suas finanças detalhadamente
              </p>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div
          className={`rounded-2xl shadow-lg border p-6 transition-all duration-1000 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          } ${cardClass}`}
          style={{ transitionDelay: "100ms" }}
        >
          {/* Shortcut pill buttons */}
          <div className="flex flex-wrap gap-2 mb-5">
            {shortcuts.map((s) => (
              <button
                key={s.key}
                onClick={() => applyShortcut(s.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeShortcut === s.key
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
                    : isDark
                      ? "bg-slate-700/60 text-slate-300 hover:bg-slate-600/80 border border-slate-600/50"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
                }`}
                style={{ fontFamily: "var(--font-secondary, Open Sans, sans-serif)" }}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Date inputs + actions row */}
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-shrink-0">
              <label
                className={`flex items-center gap-1.5 text-xs font-medium mb-1.5 ${subColor}`}
                style={{ fontFamily: "var(--font-secondary, Open Sans, sans-serif)" }}
              >
                <Calendar size={13} />
                Data início
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setActiveShortcut("");
                  setCurrentPage(1);
                }}
                className={inputClass}
                style={{ fontFamily: "var(--font-secondary, Open Sans, sans-serif)" }}
              />
            </div>
            <div className="flex-shrink-0">
              <label
                className={`flex items-center gap-1.5 text-xs font-medium mb-1.5 ${subColor}`}
                style={{ fontFamily: "var(--font-secondary, Open Sans, sans-serif)" }}
              >
                <Calendar size={13} />
                Data fim
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setActiveShortcut("");
                  setCurrentPage(1);
                }}
                className={inputClass}
                style={{ fontFamily: "var(--font-secondary, Open Sans, sans-serif)" }}
              />
            </div>

            <button
              onClick={fetchData}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] ${
                isDark
                  ? "bg-slate-700/60 text-slate-300 hover:bg-slate-600/80 border border-slate-600/50"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
              }`}
              style={{ fontFamily: "var(--font-secondary, Open Sans, sans-serif)" }}
            >
              <RefreshCw size={15} />
              Aplicar
            </button>

            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => downloadReport("csv")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/20"
                style={{ fontFamily: "var(--font-secondary, Open Sans, sans-serif)" }}
              >
                <Download size={15} />
                Baixar CSV
              </button>
              <button
                onClick={() => downloadReport("pdf")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] border ${
                  isDark
                    ? "bg-slate-700/60 text-slate-200 hover:bg-slate-600/80 border-slate-600/50"
                    : "bg-white text-slate-700 hover:bg-slate-50 border-slate-300"
                }`}
                style={{ fontFamily: "var(--font-secondary, Open Sans, sans-serif)" }}
              >
                <Download size={15} />
                Baixar PDF
              </button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            <p
              className={`text-sm ${subColor}`}
              style={{ fontFamily: "var(--font-secondary, Open Sans, sans-serif)" }}
            >
              Carregando dados...
            </p>
          </div>
        )}

        {!loading && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <SummaryCard
                icon={<TrendingUp size={20} />}
                iconBg={isDark ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.08)"}
                iconColor="#10b981"
                label="Total Receitas"
                value={formatCurrency(totalReceitas)}
                valueColor="#10b981"
                borderColor="#10b981"
                isDark={isDark}
                mounted={mounted}
                delay="200ms"
              />
              <SummaryCard
                icon={<TrendingDown size={20} />}
                iconBg={isDark ? "rgba(239,68,68,0.15)" : "rgba(239,68,68,0.08)"}
                iconColor="#ef4444"
                label="Total Despesas"
                value={formatCurrency(totalDespesas)}
                valueColor="#ef4444"
                borderColor="#ef4444"
                isDark={isDark}
                mounted={mounted}
                delay="300ms"
              />
              <SummaryCard
                icon={<DollarSign size={20} />}
                iconBg={
                  saldo >= 0
                    ? isDark ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.08)"
                    : isDark ? "rgba(239,68,68,0.15)" : "rgba(239,68,68,0.08)"
                }
                iconColor={saldo >= 0 ? "#10b981" : "#ef4444"}
                label="Saldo"
                value={formatCurrency(saldo)}
                valueColor={saldo >= 0 ? "#10b981" : "#ef4444"}
                borderColor={saldo >= 0 ? "#10b981" : "#ef4444"}
                isDark={isDark}
                mounted={mounted}
                delay="400ms"
              />
              <SummaryCard
                icon={<Hash size={20} />}
                iconBg={isDark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.08)"}
                iconColor="#6366f1"
                label="Nº Transações"
                value={String(transactions.length)}
                valueColor={isDark ? "#f1f5f9" : "#0f172a"}
                borderColor="#6366f1"
                isDark={isDark}
                mounted={mounted}
                delay="500ms"
              />
            </div>

            {/* Empty state */}
            {transactions.length === 0 && (
              <div
                className={`rounded-2xl shadow-lg border p-16 text-center transition-all duration-1000 ${
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                } ${cardClass}`}
              >
                <div
                  className={`mx-auto mb-5 w-16 h-16 rounded-2xl flex items-center justify-center ${
                    isDark ? "bg-slate-700/50" : "bg-slate-100"
                  }`}
                >
                  <FileText size={32} className={isDark ? "text-slate-500" : "text-slate-400"} />
                </div>
                <p
                  className={`text-lg font-semibold mb-1 ${headingColor}`}
                  style={{ fontFamily: "var(--font-primary, Montserrat, sans-serif)" }}
                >
                  Nenhuma transação encontrada
                </p>
                <p
                  className={`text-sm ${subColor}`}
                  style={{ fontFamily: "var(--font-secondary, Open Sans, sans-serif)" }}
                >
                  Altere o período selecionado ou adicione novas transações
                </p>
              </div>
            )}

            {transactions.length > 0 && (
              <>
                {/* Chart: Expenses by Category */}
                <div
                  className={`rounded-2xl shadow-lg border p-6 transition-all duration-1000 ${
                    mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  } ${cardClass}`}
                  style={{ transitionDelay: "600ms" }}
                >
                  <div className="flex items-center gap-2.5 mb-5">
                    <div
                      className={`p-2 rounded-lg ${
                        isDark ? "bg-indigo-500/15" : "bg-indigo-50"
                      }`}
                    >
                      <BarChart3 size={18} className="text-indigo-500" />
                    </div>
                    <h2
                      className={`text-lg font-bold ${headingColor}`}
                      style={{ fontFamily: "var(--font-primary, Montserrat, sans-serif)" }}
                    >
                      Despesas por Categoria
                    </h2>
                  </div>

                  {expensesByCategory.length === 0 ? (
                    <p
                      className={`text-sm text-center py-10 ${subColor}`}
                      style={{ fontFamily: "var(--font-secondary, Open Sans, sans-serif)" }}
                    >
                      Nenhuma despesa categorizada no período
                    </p>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={Math.max(250, expensesByCategory.length * 45)}>
                        <BarChart
                          data={expensesByCategory}
                          layout="vertical"
                          margin={{ top: 5, right: 40, left: 10, bottom: 5 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={chartTheme.grid}
                            horizontal={false}
                          />
                          <XAxis
                            type="number"
                            tick={{ fill: chartTheme.text, fontSize: 12 }}
                            tickFormatter={(v: number) => formatCurrency(v)}
                            axisLine={{ stroke: chartTheme.grid }}
                            tickLine={{ stroke: chartTheme.grid }}
                            style={{ fontFamily: "var(--font-secondary, Open Sans, sans-serif)" }}
                          />
                          <YAxis
                            dataKey="name"
                            type="category"
                            width={130}
                            tick={{ fill: chartTheme.text, fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            style={{ fontFamily: "var(--font-secondary, Open Sans, sans-serif)" }}
                          />
                          <Tooltip
                            content={({ active, payload, label }) => (
                              <ChartTooltip
                                active={active}
                                payload={payload as Array<{ value: number; name: string; color: string }>}
                                label={label as string}
                                isDark={isDark}
                              />
                            )}
                          />
                          <Bar dataKey="value" name="Despesa" radius={[0, 6, 6, 0]} barSize={24}>
                            {expensesByCategory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} opacity={0.85} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>

                      {/* Category legend with percentages */}
                      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-5 pt-4 border-t border-dashed"
                        style={{ borderColor: isDark ? "#334155" : "#e2e8f0" }}
                      >
                        {expensesByCategory.map((cat, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center gap-2 text-xs ${subColor}`}
                            style={{ fontFamily: "var(--font-secondary, Open Sans, sans-serif)" }}
                          >
                            <span
                              className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: cat.color }}
                            />
                            <span>{cat.name}</span>
                            <span className="font-semibold">{cat.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Chart: Monthly Evolution */}
                <div
                  className={`rounded-2xl shadow-lg border p-6 transition-all duration-1000 ${
                    mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  } ${cardClass}`}
                  style={{ transitionDelay: "700ms" }}
                >
                  <div className="flex items-center gap-2.5 mb-5">
                    <div
                      className={`p-2 rounded-lg ${
                        isDark ? "bg-emerald-500/15" : "bg-emerald-50"
                      }`}
                    >
                      <TrendingUp size={18} className="text-emerald-500" />
                    </div>
                    <h2
                      className={`text-lg font-bold ${headingColor}`}
                      style={{ fontFamily: "var(--font-primary, Montserrat, sans-serif)" }}
                    >
                      Evolução Mensal
                    </h2>
                  </div>

                  {monthlyEvolution.length === 0 ? (
                    <p
                      className={`text-sm text-center py-10 ${subColor}`}
                      style={{ fontFamily: "var(--font-secondary, Open Sans, sans-serif)" }}
                    >
                      Sem dados para o período
                    </p>
                  ) : (
                    <>
                      <div className="flex items-center gap-5 mb-4">
                        <div className="flex items-center gap-2 text-xs" style={{ fontFamily: "var(--font-secondary, Open Sans, sans-serif)" }}>
                          <span className="inline-block w-3 h-3 rounded-sm bg-emerald-500" />
                          <span className={subColor}>Receitas</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs" style={{ fontFamily: "var(--font-secondary, Open Sans, sans-serif)" }}>
                          <span className="inline-block w-3 h-3 rounded-sm bg-red-500" />
                          <span className={subColor}>Despesas</span>
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={320}>
                        <BarChart
                          data={monthlyEvolution}
                          margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={chartTheme.grid}
                            vertical={false}
                          />
                          <XAxis
                            dataKey="name"
                            tick={{ fill: chartTheme.text, fontSize: 12 }}
                            axisLine={{ stroke: chartTheme.grid }}
                            tickLine={false}
                            style={{ fontFamily: "var(--font-secondary, Open Sans, sans-serif)" }}
                          />
                          <YAxis
                            tick={{ fill: chartTheme.text, fontSize: 12 }}
                            tickFormatter={(v: number) => formatCurrency(v)}
                            axisLine={false}
                            tickLine={false}
                            style={{ fontFamily: "var(--font-secondary, Open Sans, sans-serif)" }}
                          />
                          <Tooltip
                            content={({ active, payload, label }) => (
                              <ChartTooltip
                                active={active}
                                payload={payload as Array<{ value: number; name: string; color: string }>}
                                label={label as string}
                                isDark={isDark}
                              />
                            )}
                          />
                          <Bar
                            dataKey="receitas"
                            name="Receitas"
                            fill="#10b981"
                            radius={[6, 6, 0, 0]}
                            barSize={28}
                          />
                          <Bar
                            dataKey="despesas"
                            name="Despesas"
                            fill="#ef4444"
                            radius={[6, 6, 0, 0]}
                            barSize={28}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </>
                  )}
                </div>

                {/* Transaction Table */}
                <div
                  className={`rounded-2xl shadow-lg border p-6 transition-all duration-1000 ${
                    mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  } ${cardClass}`}
                  style={{ transitionDelay: "800ms" }}
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-2 rounded-lg ${
                          isDark ? "bg-amber-500/15" : "bg-amber-50"
                        }`}
                      >
                        <FileText size={18} className="text-amber-500" />
                      </div>
                      <h2
                        className={`text-lg font-bold ${headingColor}`}
                        style={{ fontFamily: "var(--font-primary, Montserrat, sans-serif)" }}
                      >
                        Transações do Período
                      </h2>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        isDark
                          ? "bg-slate-700/60 text-slate-300"
                          : "bg-slate-100 text-slate-600"
                      }`}
                      style={{ fontFamily: "var(--font-secondary, Open Sans, sans-serif)" }}
                    >
                      {sortedTransactions.length} transações
                    </span>
                  </div>

                  <div className="overflow-x-auto -mx-6 px-6">
                    <table
                      className="w-full text-sm"
                      style={{ fontFamily: "var(--font-secondary, Open Sans, sans-serif)" }}
                    >
                      <thead>
                        <tr
                          className={`border-b-2 ${
                            isDark ? "border-slate-700" : "border-slate-200"
                          }`}
                        >
                          {["Data", "Descrição", "Categoria", "Tipo", "Valor"].map(
                            (col, idx) => (
                              <th
                                key={col}
                                className={`py-3 px-3 font-semibold text-xs uppercase tracking-wider ${
                                  idx === 4 ? "text-right" : "text-left"
                                } ${subColor}`}
                              >
                                {col}
                              </th>
                            ),
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {pagedTransactions.map((tx, rowIdx) => {
                          const cat = tx.categoria_id
                            ? categoryMap.get(tx.categoria_id)
                            : null;
                          const isReceita = tx.tipo === "Receita";
                          const rowBg =
                            rowIdx % 2 === 0
                              ? ""
                              : isDark
                                ? "bg-slate-700/20"
                                : "bg-slate-50/80";
                          return (
                            <tr
                              key={tx.id}
                              className={`border-b transition-all duration-200 hover:scale-[1.005] ${rowBg} ${
                                isDark
                                  ? "border-slate-700/40 hover:bg-slate-700/40"
                                  : "border-slate-100 hover:bg-slate-100/80"
                              }`}
                            >
                              <td
                                className={`py-3.5 px-3 whitespace-nowrap ${
                                  isDark ? "text-slate-300" : "text-slate-700"
                                }`}
                              >
                                {formatDate(tx.data_transacao)}
                              </td>
                              <td
                                className={`py-3.5 px-3 max-w-[200px] truncate ${
                                  isDark ? "text-slate-300" : "text-slate-700"
                                }`}
                              >
                                {tx.descricao || "—"}
                              </td>
                              <td className={`py-3.5 px-3 ${subColor}`}>
                                {cat ? (
                                  <span className="flex items-center gap-2">
                                    <span
                                      className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                                      style={{
                                        backgroundColor: cat.cor ?? "#6366f1",
                                      }}
                                    />
                                    {cat.nome}
                                  </span>
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td className="py-3.5 px-3">
                                <span
                                  className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                                    isReceita
                                      ? isDark
                                        ? "bg-emerald-500/15 text-emerald-400"
                                        : "bg-emerald-50 text-emerald-700"
                                      : isDark
                                        ? "bg-red-500/15 text-red-400"
                                        : "bg-red-50 text-red-700"
                                  }`}
                                >
                                  {tx.tipo}
                                </span>
                              </td>
                              <td
                                className={`py-3.5 px-3 text-right font-bold whitespace-nowrap ${
                                  isReceita ? "text-emerald-500" : "text-red-500"
                                }`}
                              >
                                {isReceita ? "+" : "-"}{" "}
                                {formatCurrency(parseFloat(tx.valor))}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-5 pt-4 border-t"
                    style={{ borderColor: isDark ? "#334155" : "#e2e8f0" }}
                  >
                    <p
                      className={`text-xs ${subColor}`}
                      style={{ fontFamily: "var(--font-secondary, Open Sans, sans-serif)" }}
                    >
                      Mostrando {(currentPage - 1) * PAGE_SIZE + 1}–
                      {Math.min(currentPage * PAGE_SIZE, sortedTransactions.length)} de{" "}
                      {sortedTransactions.length}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-xl transition-all duration-200 disabled:opacity-30 ${
                          isDark
                            ? "hover:bg-slate-700 text-slate-300"
                            : "hover:bg-slate-100 text-slate-600"
                        }`}
                      >
                        <ChevronLeft size={18} />
                      </button>
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let page: number;
                        if (totalPages <= 5) {
                          page = i + 1;
                        } else if (currentPage <= 3) {
                          page = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          page = totalPages - 4 + i;
                        } else {
                          page = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 ${
                              currentPage === page
                                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
                                : isDark
                                  ? "text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                            }`}
                            style={{ fontFamily: "var(--font-secondary, Open Sans, sans-serif)" }}
                          >
                            {page}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-xl transition-all duration-200 disabled:opacity-30 ${
                          isDark
                            ? "hover:bg-slate-700 text-slate-300"
                            : "hover:bg-slate-100 text-slate-600"
                        }`}
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
