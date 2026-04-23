"use client";

import { FormEvent, useEffect, useState, useCallback } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Plus,
  Play,
  Pencil,
  Trash2,
  Calendar,
  DollarSign,
  Bell,
  BellOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  X,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

type FixedExpense = {
  id: number;
  descricao: string;
  valor: string;
  dia_vencimento: number;
  categoria_id?: number | null;
  conta_bancaria_id?: number | null;
  cartao_credito_id?: number | null;
  status: string;
  lembrete_ativado?: boolean;
  ultimo_lancamento?: string | null;
};

type Category = {
  id: number;
  nome: string;
  tipo: string;
  cor: string;
  icone: string;
};

type Account = {
  id: number;
  nome_banco: string;
  tipo_conta: string;
  saldo_atual: string;
};

type Card = {
  id: number;
  nome_cartao: string;
  bandeira: string;
  limite: string;
};

type FormErrors = {
  descricao?: string;
  valor?: string;
  dia_vencimento?: string;
};

const INITIAL_FORM = {
  descricao: "",
  valor: "",
  dia_vencimento: "1",
  categoria_id: "",
  conta_bancaria_id: "",
  cartao_credito_id: "",
  lembrete_ativado: true,
  status: "Ativo",
};

function formatCurrency(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "R$ 0,00";
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function getDaysUntilDue(diaVencimento: number): number {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  let dueDate = new Date(currentYear, currentMonth, diaVencimento);
  if (dueDate < today) {
    dueDate = new Date(currentYear, currentMonth + 1, diaVencimento);
  }

  const diffTime = dueDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export default function FixedExpensesPage() {
  const [items, setItems] = useState<FixedExpense[]>([]);
  const [upcoming, setUpcoming] = useState<FixedExpense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<FixedExpense | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [runConfirm, setRunConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const { isDark, mounted } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [fxRes, upRes, catRes, accRes, cardRes] = await Promise.all([
        fetch(`${API}/api/fixed-expenses`, { credentials: "include" }),
        fetch(`${API}/api/fixed-expenses/upcoming?days=7`, { credentials: "include" }),
        fetch(`${API}/api/categories`, { credentials: "include" }),
        fetch(`${API}/api/accounts`, { credentials: "include" }),
        fetch(`${API}/api/cards`, { credentials: "include" }),
      ]);
      if (fxRes.ok) {
        const fxData = await fxRes.json();
        setItems(Array.isArray(fxData) ? fxData : []);
      }
      if (upRes.ok) {
        const upData = await upRes.json();
        const upList = Array.isArray(upData) ? upData : (upData.items ?? []);
        setUpcoming(upList);
      }
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(Array.isArray(catData) ? catData : []);
      }
      if (accRes.ok) {
        const accData = await accRes.json();
        setAccounts(Array.isArray(accData) ? accData : []);
      }
      if (cardRes.ok) {
        const cardData = await cardRes.json();
        setCards(Array.isArray(cardData) ? cardData : []);
      }
    } catch {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeItems = items.filter((i) => i.status === "Ativo");
  const totalMensal = activeItems.reduce((sum, i) => sum + parseFloat(i.valor || "0"), 0);
  const activeCount = activeItems.length;
  const totalCount = items.length;

  const getCategoryById = (id: number | null | undefined): Category | undefined => {
    if (!id) return undefined;
    return categories.find((c) => c.id === id);
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (!formData.descricao.trim()) errors.descricao = "Descricao e obrigatoria";
    const valorNum = parseFloat(formData.valor);
    if (!formData.valor || isNaN(valorNum) || valorNum <= 0) errors.valor = "Valor deve ser maior que zero";
    const diaNum = parseInt(formData.dia_vencimento);
    if (isNaN(diaNum) || diaNum < 1 || diaNum > 31) errors.dia_vencimento = "Dia deve ser entre 1 e 31";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData(INITIAL_FORM);
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (item: FixedExpense) => {
    setEditingItem(item);
    setFormData({
      descricao: item.descricao,
      valor: item.valor,
      dia_vencimento: String(item.dia_vencimento),
      categoria_id: item.categoria_id ? String(item.categoria_id) : "",
      conta_bancaria_id: item.conta_bancaria_id ? String(item.conta_bancaria_id) : "",
      cartao_credito_id: item.cartao_credito_id ? String(item.cartao_credito_id) : "",
      lembrete_ativado: item.lembrete_ativado ?? true,
      status: item.status,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormErrors({});
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const url = editingItem
        ? `${API}/api/fixed-expenses/${editingItem.id}`
        : `${API}/api/fixed-expenses`;
      const method = editingItem ? "PUT" : "POST";

      const body = {
        descricao: formData.descricao.trim(),
        valor: formData.valor,
        dia_vencimento: parseInt(formData.dia_vencimento),
        categoria_id: formData.categoria_id ? Number(formData.categoria_id) : null,
        conta_bancaria_id: formData.conta_bancaria_id ? Number(formData.conta_bancaria_id) : null,
        cartao_credito_id: formData.cartao_credito_id ? Number(formData.cartao_credito_id) : null,
        lembrete_ativado: formData.lembrete_ativado,
        status: formData.status,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(editingItem ? "Gasto fixo atualizado!" : "Gasto fixo criado!");
        closeModal();
        await loadData();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || "Erro ao salvar gasto fixo");
      }
    } catch {
      toast.error("Erro ao salvar gasto fixo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (item: FixedExpense) => {
    const newStatus = item.status === "Ativo" ? "Inativo" : "Ativo";

    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i))
    );

    try {
      const res = await fetch(`${API}/api/fixed-expenses/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          descricao: item.descricao,
          valor: item.valor,
          dia_vencimento: item.dia_vencimento,
          categoria_id: item.categoria_id ?? null,
          conta_bancaria_id: item.conta_bancaria_id ?? null,
          cartao_credito_id: item.cartao_credito_id ?? null,
          lembrete_ativado: item.lembrete_ativado ?? true,
          status: newStatus,
        }),
      });

      if (res.ok) {
        toast.success(`Gasto fixo ${newStatus === "Ativo" ? "ativado" : "desativado"}!`);
      } else {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: item.status } : i))
        );
        toast.error("Erro ao alterar status");
      }
    } catch {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: item.status } : i))
      );
      toast.error("Erro ao alterar status");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${API}/api/fixed-expenses/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Gasto fixo excluido!");
        setDeleteConfirm(null);
        await loadData();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || "Erro ao excluir");
      }
    } catch {
      toast.error("Erro ao excluir gasto fixo");
    }
  };

  const handleRunToday = async () => {
    setIsRunning(true);
    try {
      const res = await fetch(`${API}/api/fixed-expenses/run`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`${data.executados} lancamento(s) realizado(s)`);
        setRunConfirm(false);
        await loadData();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || "Erro ao executar lancamentos");
      }
    } catch {
      toast.error("Erro ao executar lancamentos");
    } finally {
      setIsRunning(false);
    }
  };

  if (!mounted) return null;

  const fontPrimary = { fontFamily: "var(--font-primary, Montserrat, sans-serif)" };
  const fontSecondary = { fontFamily: "var(--font-secondary, Open Sans, sans-serif)" };

  const cardClass = `rounded-2xl shadow-lg border p-6 transition-all duration-300 ${
    isDark ? "bg-slate-800/90 border-slate-700/30" : "bg-white border-slate-200/50"
  }`;

  const labelClass = `block text-sm font-medium mb-1.5 ${
    isDark ? "text-slate-300" : "text-slate-700"
  }`;

  const inputClass = `w-full px-4 py-2.5 rounded-xl border text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
    isDark
      ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500"
      : "bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-emerald-500"
  }`;

  const selectClass = `w-full px-4 py-2.5 rounded-xl border text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
    isDark
      ? "bg-slate-700/50 border-slate-600 text-white focus:border-emerald-500"
      : "bg-white border-slate-300 text-slate-900 focus:border-emerald-500"
  }`;

  const subLabelClass = isDark ? "text-slate-400" : "text-slate-600";

  return (
    <div className="w-full min-h-screen">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div
          className={`transition-all duration-1000 w-full ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* ── Header ── */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1
                  className={`text-2xl sm:text-3xl font-bold mb-1 transition-colors duration-300 ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                  style={fontPrimary}
                >
                  Gastos Fixos
                </h1>
                <p
                  className={`text-sm sm:text-base ${subLabelClass}`}
                  style={fontSecondary}
                >
                  Gerencie suas despesas recorrentes e controle vencimentos
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setRunConfirm(true)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-[1.02] ${
                    isDark
                      ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                  style={fontSecondary}
                >
                  <Play className="w-4 h-4" />
                  Executar Hoje
                </button>
                <button
                  onClick={openAddModal}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm bg-emerald-500 text-white hover:bg-emerald-600 transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-emerald-500/25"
                  style={fontSecondary}
                >
                  <Plus className="w-4 h-4" />
                  Adicionar
                </button>
              </div>
            </div>
          </div>

          {/* ── Loading ── */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <RefreshCw
                className={`w-8 h-8 animate-spin ${
                  isDark ? "text-emerald-400" : "text-emerald-600"
                }`}
              />
            </div>
          )}

          {!loading && (
            <>
              {/* ── Summary Cards ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {/* Total mensal */}
                <div className={`${cardClass} hover:scale-[1.02]`}>
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-xl ${
                        isDark ? "bg-red-500/20" : "bg-red-50"
                      }`}
                    >
                      <DollarSign className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <p
                        className={`text-sm ${subLabelClass}`}
                        style={fontSecondary}
                      >
                        Total Mensal
                      </p>
                      <p
                        className={`text-2xl font-bold ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                        style={fontPrimary}
                      >
                        {formatCurrency(totalMensal)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Ativos / Total */}
                <div className={`${cardClass} hover:scale-[1.02]`}>
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-xl ${
                        isDark ? "bg-emerald-500/20" : "bg-emerald-50"
                      }`}
                    >
                      <CheckCircle className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <p
                        className={`text-sm ${subLabelClass}`}
                        style={fontSecondary}
                      >
                        Gastos Cadastrados
                      </p>
                      <p
                        className={`text-2xl font-bold ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                        style={fontPrimary}
                      >
                        {activeCount}
                        <span className={`text-base font-normal ml-1 ${subLabelClass}`}>
                          / {totalCount} ativos
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Upcoming Section ── */}
              <div className={`${cardClass} mb-8`}>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`p-2.5 rounded-xl ${
                      isDark ? "bg-amber-500/20" : "bg-amber-50"
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  </div>
                  <h2
                    className={`text-lg font-semibold ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                    style={fontPrimary}
                  >
                    Proximos Vencimentos (7 dias)
                  </h2>
                </div>

                {upcoming.length === 0 ? (
                  <div
                    className={`flex items-center gap-3 py-4 px-3 rounded-xl ${
                      isDark ? "bg-slate-700/30" : "bg-slate-50"
                    }`}
                  >
                    <CheckCircle
                      className={`w-5 h-5 ${
                        isDark ? "text-emerald-400" : "text-emerald-600"
                      }`}
                    />
                    <p
                      className={`text-sm ${subLabelClass}`}
                      style={fontSecondary}
                    >
                      Nenhum vencimento nos proximos 7 dias
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {upcoming.map((item) => {
                      const daysLeft = getDaysUntilDue(item.dia_vencimento);
                      const cat = getCategoryById(item.categoria_id);
                      return (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 hover:scale-[1.01] ${
                            isDark
                              ? "bg-slate-700/40 hover:bg-slate-700/60"
                              : "bg-slate-50 hover:bg-slate-100"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {cat?.cor && (
                              <div
                                className="w-1.5 h-10 rounded-full shrink-0"
                                style={{ backgroundColor: cat.cor }}
                              />
                            )}
                            <div>
                              <p
                                className={`font-medium text-sm ${
                                  isDark ? "text-white" : "text-slate-900"
                                }`}
                                style={fontSecondary}
                              >
                                {item.descricao}
                              </p>
                              <p
                                className={`text-xs mt-0.5 ${
                                  isDark ? "text-slate-400" : "text-slate-500"
                                }`}
                              >
                                Dia {item.dia_vencimento}
                                {cat ? ` \u00B7 ${cat.nome}` : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`font-bold text-sm ${
                                isDark ? "text-red-400" : "text-red-600"
                              }`}
                              style={fontPrimary}
                            >
                              {formatCurrency(item.valor)}
                            </span>
                            <span
                              className={`text-xs px-2.5 py-1 rounded-full font-semibold whitespace-nowrap ${
                                daysLeft <= 1
                                  ? isDark
                                    ? "bg-red-500/20 text-red-400"
                                    : "bg-red-50 text-red-700"
                                  : daysLeft <= 3
                                    ? isDark
                                      ? "bg-amber-500/20 text-amber-400"
                                      : "bg-amber-50 text-amber-700"
                                    : isDark
                                      ? "bg-emerald-500/20 text-emerald-400"
                                      : "bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              {daysLeft === 0
                                ? "Hoje"
                                : daysLeft === 1
                                  ? "Amanha"
                                  : `${daysLeft} dias`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ── Empty State ── */}
              {items.length === 0 && (
                <div className={`${cardClass} text-center`}>
                  <div className="max-w-md mx-auto py-10">
                    <div
                      className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center ${
                        isDark ? "bg-emerald-500/15" : "bg-emerald-50"
                      }`}
                    >
                      <Calendar
                        className={`w-10 h-10 ${
                          isDark ? "text-emerald-400" : "text-emerald-600"
                        }`}
                      />
                    </div>
                    <h3
                      className={`text-xl font-semibold mb-2 ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                      style={fontPrimary}
                    >
                      Nenhum gasto fixo cadastrado
                    </h3>
                    <p
                      className={`text-sm mb-8 max-w-xs mx-auto leading-relaxed ${subLabelClass}`}
                      style={fontSecondary}
                    >
                      Adicione suas despesas recorrentes para acompanhar e controlar seus gastos mensais
                    </p>
                    <button
                      onClick={openAddModal}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm bg-emerald-500 text-white hover:bg-emerald-600 transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-emerald-500/25"
                      style={fontSecondary}
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar Gasto Fixo
                    </button>
                  </div>
                </div>
              )}

              {/* ── Expense Cards Grid ── */}
              {items.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item) => {
                    const cat = getCategoryById(item.categoria_id);
                    const isActive = item.status === "Ativo";
                    return (
                      <div
                        key={item.id}
                        className={`rounded-2xl shadow-lg border p-6 transition-all duration-200 hover:scale-[1.02] relative overflow-hidden group ${
                          isDark
                            ? "bg-slate-800/90 border-slate-700/30"
                            : "bg-white border-slate-200/50"
                        } ${!isActive ? "opacity-60" : ""}`}
                      >
                        {/* Category color bar */}
                        <div
                          className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl"
                          style={{
                            backgroundColor: cat?.cor || (isDark ? "#475569" : "#cbd5e1"),
                          }}
                        />

                        {/* Card header */}
                        <div className="flex items-start justify-between mb-3 pl-3">
                          <div className="flex-1 min-w-0">
                            <h3
                              className={`font-bold text-base truncate ${
                                isDark ? "text-white" : "text-slate-900"
                              }`}
                              style={fontPrimary}
                            >
                              {item.descricao}
                            </h3>
                            {cat && (
                              <p
                                className={`text-xs mt-0.5 ${
                                  isDark ? "text-slate-400" : "text-slate-500"
                                }`}
                                style={fontSecondary}
                              >
                                {cat.nome}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 ml-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={() => openEditModal(item)}
                              className={`p-1.5 rounded-lg transition-colors duration-200 ${
                                isDark
                                  ? "hover:bg-slate-700 text-slate-400 hover:text-emerald-400"
                                  : "hover:bg-slate-100 text-slate-500 hover:text-emerald-600"
                              }`}
                              title="Editar"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(item.id)}
                              className={`p-1.5 rounded-lg transition-colors duration-200 ${
                                isDark
                                  ? "hover:bg-slate-700 text-slate-400 hover:text-red-400"
                                  : "hover:bg-slate-100 text-slate-500 hover:text-red-600"
                              }`}
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Value */}
                        <div className="pl-3 mb-4">
                          <p
                            className={`text-2xl font-bold tracking-tight ${
                              isDark ? "text-red-400" : "text-red-600"
                            }`}
                            style={fontPrimary}
                          >
                            {formatCurrency(item.valor)}
                          </p>
                        </div>

                        {/* Details */}
                        <div className="pl-3 space-y-2.5">
                          <div className="flex items-center gap-2">
                            <Calendar
                              className={`w-3.5 h-3.5 ${
                                isDark ? "text-slate-500" : "text-slate-400"
                              }`}
                            />
                            <span
                              className={`text-sm ${
                                isDark ? "text-slate-300" : "text-slate-700"
                              }`}
                              style={fontSecondary}
                            >
                              Todo dia {item.dia_vencimento}
                            </span>
                          </div>

                          {/* Badges */}
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleToggleStatus(item)}
                              className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium transition-all duration-200 hover:scale-105 cursor-pointer ${
                                isActive
                                  ? isDark
                                    ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                  : isDark
                                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                    : "bg-red-50 text-red-700 hover:bg-red-100"
                              }`}
                            >
                              {isActive ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                              {item.status}
                            </button>

                            <span
                              className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                                item.lembrete_ativado
                                  ? isDark
                                    ? "bg-emerald-500/15 text-emerald-400"
                                    : "bg-emerald-50 text-emerald-700"
                                  : isDark
                                    ? "bg-slate-600/50 text-slate-400"
                                    : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {item.lembrete_ativado ? (
                                <Bell className="w-3 h-3" />
                              ) : (
                                <BellOff className="w-3 h-3" />
                              )}
                              {item.lembrete_ativado ? "Lembrete" : "Sem lembrete"}
                            </span>
                          </div>

                          {/* Last execution */}
                          {item.ultimo_lancamento && (
                            <div className="flex items-center gap-2 pt-1">
                              <Clock
                                className={`w-3.5 h-3.5 ${
                                  isDark ? "text-slate-500" : "text-slate-400"
                                }`}
                              />
                              <span
                                className={`text-xs ${
                                  isDark ? "text-slate-500" : "text-slate-400"
                                }`}
                                style={fontSecondary}
                              >
                                Ultimo:{" "}
                                {new Date(item.ultimo_lancamento).toLocaleDateString(
                                  "pt-BR"
                                )}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Delete confirmation overlay */}
                        {deleteConfirm === item.id && (
                          <div
                            className={`absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-3 z-10 backdrop-blur-sm ${
                              isDark ? "bg-slate-900/95" : "bg-white/95"
                            }`}
                          >
                            <div
                              className={`p-3 rounded-full ${
                                isDark ? "bg-red-500/20" : "bg-red-50"
                              }`}
                            >
                              <AlertTriangle className="w-6 h-6 text-red-500" />
                            </div>
                            <p
                              className={`text-sm font-semibold ${
                                isDark ? "text-white" : "text-slate-900"
                              }`}
                              style={fontSecondary}
                            >
                              Excluir este gasto fixo?
                            </p>
                            <p
                              className={`text-xs max-w-[200px] text-center ${subLabelClass}`}
                              style={fontSecondary}
                            >
                              Esta acao nao pode ser desfeita
                            </p>
                            <div className="flex gap-2 mt-1">
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                  isDark
                                    ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                }`}
                                style={fontSecondary}
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-all duration-200 shadow-lg shadow-red-500/25"
                                style={fontSecondary}
                              >
                                Excluir
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Run Confirmation Modal ── */}
      {runConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className={`w-full max-w-md rounded-2xl shadow-2xl border p-6 transition-all duration-300 ${
              isDark
                ? "bg-slate-800/90 border-slate-700/30"
                : "bg-white border-slate-200/50"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`p-3 rounded-xl ${
                  isDark ? "bg-emerald-500/20" : "bg-emerald-50"
                }`}
              >
                <Play className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h3
                  className={`text-lg font-bold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                  style={fontPrimary}
                >
                  Executar Lancamentos
                </h3>
                <p
                  className={`text-xs mt-0.5 ${subLabelClass}`}
                  style={fontSecondary}
                >
                  Gastos fixos do dia
                </p>
              </div>
            </div>
            <p
              className={`text-sm mb-6 leading-relaxed ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}
              style={fontSecondary}
            >
              Deseja lancar automaticamente os gastos fixos de hoje? Todos os
              gastos ativos com vencimento hoje serao processados.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setRunConfirm(false)}
                disabled={isRunning}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isDark
                    ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
                style={fontSecondary}
              >
                Cancelar
              </button>
              <button
                onClick={handleRunToday}
                disabled={isRunning}
                className="px-5 py-2.5 rounded-xl text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-all duration-200 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-500/25"
                style={fontSecondary}
              >
                {isRunning && <RefreshCw className="w-4 h-4 animate-spin" />}
                {isRunning ? "Executando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className={`w-full max-w-lg rounded-2xl shadow-2xl border max-h-[90vh] overflow-y-auto transition-all duration-300 ${
              isDark
                ? "bg-slate-800/90 border-slate-700/30"
                : "bg-white border-slate-200/50"
            }`}
          >
            {/* Modal Header */}
            <div
              className={`sticky top-0 z-10 flex items-center justify-between p-6 pb-4 border-b rounded-t-2xl ${
                isDark
                  ? "bg-slate-800 border-slate-700/50"
                  : "bg-white border-slate-200"
              }`}
            >
              <div>
                <h3
                  className={`text-lg font-bold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                  style={fontPrimary}
                >
                  {editingItem ? "Editar Gasto Fixo" : "Novo Gasto Fixo"}
                </h3>
                <p
                  className={`text-xs mt-0.5 ${subLabelClass}`}
                  style={fontSecondary}
                >
                  {editingItem
                    ? "Atualize os dados da despesa recorrente"
                    : "Preencha os dados da nova despesa recorrente"}
                </p>
              </div>
              <button
                onClick={closeModal}
                className={`p-2 rounded-xl transition-all duration-200 hover:scale-105 ${
                  isDark
                    ? "hover:bg-slate-700 text-slate-400"
                    : "hover:bg-slate-100 text-slate-500"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Descricao */}
              <div>
                <label className={labelClass} style={fontSecondary}>
                  Descricao *
                </label>
                <input
                  type="text"
                  value={formData.descricao}
                  onChange={(e) => {
                    setFormData({ ...formData, descricao: e.target.value });
                    if (formErrors.descricao)
                      setFormErrors({ ...formErrors, descricao: undefined });
                  }}
                  placeholder="Ex: Aluguel, Netflix, Internet..."
                  className={`${inputClass} ${
                    formErrors.descricao ? "border-red-500 focus:border-red-500" : ""
                  }`}
                  style={fontSecondary}
                />
                {formErrors.descricao && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1" style={fontSecondary}>
                    <XCircle className="w-3 h-3" />
                    {formErrors.descricao}
                  </p>
                )}
              </div>

              {/* Valor + Dia row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass} style={fontSecondary}>
                    Valor (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.valor}
                    onChange={(e) => {
                      setFormData({ ...formData, valor: e.target.value });
                      if (formErrors.valor)
                        setFormErrors({ ...formErrors, valor: undefined });
                    }}
                    placeholder="0,00"
                    className={`${inputClass} ${
                      formErrors.valor ? "border-red-500 focus:border-red-500" : ""
                    }`}
                    style={fontSecondary}
                  />
                  {formErrors.valor && (
                    <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1" style={fontSecondary}>
                      <XCircle className="w-3 h-3" />
                      {formErrors.valor}
                    </p>
                  )}
                </div>
                <div>
                  <label className={labelClass} style={fontSecondary}>
                    Dia de Vencimento *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.dia_vencimento}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        dia_vencimento: e.target.value,
                      });
                      if (formErrors.dia_vencimento)
                        setFormErrors({
                          ...formErrors,
                          dia_vencimento: undefined,
                        });
                    }}
                    className={`${inputClass} ${
                      formErrors.dia_vencimento
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }`}
                    style={fontSecondary}
                  />
                  {formErrors.dia_vencimento && (
                    <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1" style={fontSecondary}>
                      <XCircle className="w-3 h-3" />
                      {formErrors.dia_vencimento}
                    </p>
                  )}
                </div>
              </div>

              {/* Categoria */}
              <div>
                <label className={labelClass} style={fontSecondary}>
                  Categoria
                </label>
                <select
                  value={formData.categoria_id}
                  onChange={(e) =>
                    setFormData({ ...formData, categoria_id: e.target.value })
                  }
                  className={selectClass}
                  style={fontSecondary}
                >
                  <option value="">Sem categoria</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome} ({c.tipo})
                    </option>
                  ))}
                </select>
              </div>

              {/* Conta Bancaria */}
              <div>
                <label className={labelClass} style={fontSecondary}>
                  Conta Bancaria
                </label>
                <select
                  value={formData.conta_bancaria_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      conta_bancaria_id: e.target.value,
                    })
                  }
                  className={selectClass}
                  style={fontSecondary}
                >
                  <option value="">Sem conta</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nome_banco} ({a.tipo_conta})
                    </option>
                  ))}
                </select>
              </div>

              {/* Cartao de Credito */}
              <div>
                <label className={labelClass} style={fontSecondary}>
                  Cartao de Credito
                </label>
                <select
                  value={formData.cartao_credito_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cartao_credito_id: e.target.value,
                    })
                  }
                  className={selectClass}
                  style={fontSecondary}
                >
                  <option value="">Sem cartao</option>
                  {cards.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome_cartao} ({c.bandeira})
                    </option>
                  ))}
                </select>
              </div>

              {/* Divider */}
              <div
                className={`border-t ${
                  isDark ? "border-slate-700/50" : "border-slate-200"
                }`}
              />

              {/* Toggles */}
              <div className="space-y-4">
                {/* Lembrete toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        formData.lembrete_ativado
                          ? isDark
                            ? "bg-emerald-500/20"
                            : "bg-emerald-50"
                          : isDark
                            ? "bg-slate-700"
                            : "bg-slate-100"
                      }`}
                    >
                      {formData.lembrete_ativado ? (
                        <Bell
                          className={`w-4 h-4 ${
                            isDark ? "text-emerald-400" : "text-emerald-600"
                          }`}
                        />
                      ) : (
                        <BellOff
                          className={`w-4 h-4 ${
                            isDark ? "text-slate-400" : "text-slate-500"
                          }`}
                        />
                      )}
                    </div>
                    <div>
                      <label
                        className={`text-sm font-medium ${
                          isDark ? "text-slate-200" : "text-slate-800"
                        }`}
                        style={fontSecondary}
                      >
                        Lembrete de vencimento
                      </label>
                      <p
                        className={`text-xs ${subLabelClass}`}
                        style={fontSecondary}
                      >
                        Receber notificacao antes do vencimento
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        lembrete_ativado: !formData.lembrete_ativado,
                      })
                    }
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
                      formData.lembrete_ativado
                        ? "bg-emerald-500"
                        : isDark
                          ? "bg-slate-600"
                          : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        formData.lembrete_ativado
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Status toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        formData.status === "Ativo"
                          ? isDark
                            ? "bg-emerald-500/20"
                            : "bg-emerald-50"
                          : isDark
                            ? "bg-slate-700"
                            : "bg-slate-100"
                      }`}
                    >
                      {formData.status === "Ativo" ? (
                        <CheckCircle
                          className={`w-4 h-4 ${
                            isDark ? "text-emerald-400" : "text-emerald-600"
                          }`}
                        />
                      ) : (
                        <XCircle
                          className={`w-4 h-4 ${
                            isDark ? "text-slate-400" : "text-slate-500"
                          }`}
                        />
                      )}
                    </div>
                    <div>
                      <label
                        className={`text-sm font-medium ${
                          isDark ? "text-slate-200" : "text-slate-800"
                        }`}
                        style={fontSecondary}
                      >
                        Status do gasto
                      </label>
                      <p
                        className={`text-xs ${subLabelClass}`}
                        style={fontSecondary}
                      >
                        {formData.status === "Ativo"
                          ? "Sera processado automaticamente"
                          : "Nao sera processado"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        status:
                          formData.status === "Ativo" ? "Inativo" : "Ativo",
                      })
                    }
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
                      formData.status === "Ativo"
                        ? "bg-emerald-500"
                        : isDark
                          ? "bg-slate-600"
                          : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        formData.status === "Ativo"
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Submit buttons */}
              <div
                className={`flex justify-end gap-3 pt-4 border-t ${
                  isDark ? "border-slate-700/50" : "border-slate-200"
                }`}
              >
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isDark
                      ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                  style={fontSecondary}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-all duration-200 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-500/25"
                  style={fontSecondary}
                >
                  {isSubmitting && (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  )}
                  {isSubmitting
                    ? "Salvando..."
                    : editingItem
                      ? "Atualizar"
                      : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
