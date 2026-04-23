// @ts-nocheck
"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useSearchParams } from "next/navigation";
import {
  CreditCard,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Pencil,
  Trash2,
  Wallet,
  Eye,
  EyeOff,
  History,
} from "lucide-react";
import { getBrandInfo, BRAND_OPTIONS, CARD_COLORS } from "@/lib/cardBrands";
import { toast } from "sonner";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

type Card = {
  id: number;
  nome_cartao: string;
  bandeira: string;
  limite: string;
  dia_fechamento_fatura: number;
  dia_vencimento_fatura: number;
  ultimos_4_digitos: string | null;
  cor: string | null;
};

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

type Invoice = {
  id: number;
  cartao_credito_id: number;
  mes_referencia: number;
  ano_referencia: number;
  valor_total: string;
  status: string;
  data_fechamento: string;
  data_vencimento: string;
  data_pagamento: string | null;
  conta_pagamento_id: number | null;
  transacoes: Transaction[];
};

type Account = {
  id: number;
  nome_banco: string;
  tipo_conta: string;
  saldo_atual: string;
};

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function formatCurrency(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR");
}

function StatusBadge({ status, isDark }: { status: string; isDark: boolean }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    aberta: {
      bg: isDark ? "bg-blue-500/20" : "bg-blue-50",
      text: "text-blue-500",
      label: "Aberta",
    },
    fechada: {
      bg: isDark ? "bg-amber-500/20" : "bg-amber-50",
      text: "text-amber-500",
      label: "Fechada",
    },
    paga: {
      bg: isDark ? "bg-emerald-500/20" : "bg-emerald-50",
      text: "text-emerald-500",
      label: "Paga",
    },
  };
  const c = config[status] || config.aberta;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      {status === "paga" ? <CheckCircle2 size={12} /> : status === "fechada" ? <AlertCircle size={12} /> : <Clock size={12} />}
      {c.label}
    </span>
  );
}

// Visual credit card component
function CreditCardVisual({
  card,
  isSelected,
  onClick,
  isDark,
  showBalance,
}: {
  card: Card;
  isSelected: boolean;
  onClick: () => void;
  isDark: boolean;
  showBalance: boolean;
}) {
  const brand = getBrandInfo(card.bandeira);
  const cardColor = card.cor || CARD_COLORS[card.id % CARD_COLORS.length];

  return (
    <button
      onClick={onClick}
      className={`relative w-full aspect-[1.6/1] max-w-[320px] rounded-2xl p-5 flex flex-col justify-between text-left transition-all duration-300 group overflow-hidden ${
        isSelected
          ? "ring-2 ring-blue-400 shadow-lg shadow-blue-500/20 scale-[1.02]"
          : "hover:scale-[1.01] hover:shadow-lg"
      }`}
      style={{
        background: `linear-gradient(135deg, ${cardColor} 0%, ${cardColor}cc 50%, ${cardColor}99 100%)`,
      }}
    >
      {/* Decorative circles */}
      <div
        className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10"
        style={{ background: "white" }}
      />
      <div
        className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full opacity-5"
        style={{ background: "white" }}
      />

      {/* Top row: brand + name */}
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-white/60 text-[10px] uppercase tracking-wider font-medium mb-0.5">
            {brand.label}
          </p>
          <p className="text-white font-semibold text-sm truncate max-w-[180px]">
            {card.nome_cartao}
          </p>
        </div>
        <CreditCard size={24} className="text-white/40" />
      </div>

      {/* Card number */}
      <div className="relative z-10">
        <p className="text-white/80 text-base tracking-[0.2em] font-mono">
          •••• •••• ••••{" "}
          {card.ultimos_4_digitos || "••••"}
        </p>
      </div>

      {/* Bottom row: limit + dates */}
      <div className="flex items-end justify-between relative z-10">
        <div>
          <p className="text-white/50 text-[10px] uppercase tracking-wider">Limite</p>
          <p className="text-white font-semibold text-sm">
            {showBalance ? formatCurrency(card.limite) : "R$ ••••"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-white/50 text-[10px] uppercase tracking-wider">Venc.</p>
          <p className="text-white text-sm font-medium">
            Dia {card.dia_vencimento_fatura}
          </p>
        </div>
      </div>
    </button>
  );
}

export default function CardsPage() {
  const { isDark, mounted } = useTheme();
  const { t } = useTranslation();
  const searchParams = useSearchParams();

  // Card state
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [showBalance, setShowBalance] = useState(true);

  // Invoice state
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceMonth, setInvoiceMonth] = useState(new Date().getMonth() + 1);
  const [invoiceYear, setInvoiceYear] = useState(new Date().getFullYear());
  const [invoiceHistory, setInvoiceHistory] = useState<Invoice[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Modal state
  const [showCardModal, setShowCardModal] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [payLoading, setPayLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    nome_cartao: "",
    bandeira: "visa",
    limite: "0",
    dia_fechamento_fatura: 15,
    dia_vencimento_fatura: 10,
    ultimos_4_digitos: "",
    cor: CARD_COLORS[0],
  });

  const selectedCard = cards.find((c) => c.id === selectedCardId) || null;

  // Load cards
  const loadCards = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/cards`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setCards(data);
        // Auto-select from URL or first card
        const urlCardId = searchParams.get("cardId");
        if (urlCardId && data.find((c: Card) => c.id === Number(urlCardId))) {
          setSelectedCardId(Number(urlCardId));
        } else if (data.length > 0 && !selectedCardId) {
          setSelectedCardId(data[0].id);
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  // Load invoice for selected card + month
  const loadInvoice = async (cardId: number, mes: number, ano: number) => {
    setInvoiceLoading(true);
    try {
      const res = await fetch(
        `${API}/api/cards/${cardId}/invoices/${mes}/${ano}`,
        { credentials: "include" }
      );
      if (res.ok) {
        setCurrentInvoice(await res.json());
      } else {
        setCurrentInvoice(null);
      }
    } catch {
      setCurrentInvoice(null);
    } finally {
      setInvoiceLoading(false);
    }
  };

  // Load invoice history
  const loadInvoiceHistory = async (cardId: number) => {
    try {
      const res = await fetch(`${API}/api/cards/${cardId}/invoices`, {
        credentials: "include",
      });
      if (res.ok) {
        setInvoiceHistory(await res.json());
      }
    } catch {
      // silent
    }
  };

  // Load accounts (for payment)
  const loadAccounts = async () => {
    try {
      const res = await fetch(`${API}/api/accounts`, { credentials: "include" });
      if (res.ok) setAccounts(await res.json());
    } catch {
      // silent
    }
  };

  useEffect(() => {
    loadCards();
    loadAccounts();
  }, []);

  useEffect(() => {
    if (selectedCardId) {
      loadInvoice(selectedCardId, invoiceMonth, invoiceYear);
      loadInvoiceHistory(selectedCardId);
    }
  }, [selectedCardId, invoiceMonth, invoiceYear]);

  // Navigate months
  const prevMonth = () => {
    if (invoiceMonth === 1) {
      setInvoiceMonth(12);
      setInvoiceYear(invoiceYear - 1);
    } else {
      setInvoiceMonth(invoiceMonth - 1);
    }
  };

  const nextMonth = () => {
    if (invoiceMonth === 12) {
      setInvoiceMonth(1);
      setInvoiceYear(invoiceYear + 1);
    } else {
      setInvoiceMonth(invoiceMonth + 1);
    }
  };

  // Card CRUD
  const handleCreateCard = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const body = {
        ...formData,
        ultimos_4_digitos: formData.ultimos_4_digitos || null,
      };
      const url = editingCard
        ? `${API}/api/cards/${editingCard.id}`
        : `${API}/api/cards`;
      const method = editingCard ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success(editingCard ? "Cartão atualizado com sucesso!" : "Cartão criado com sucesso!");
        setShowCardModal(false);
        setEditingCard(null);
        await loadCards();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || "Erro ao salvar cartão");
      }
    } catch {
      toast.error("Erro ao salvar cartão");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCard = async (id: number) => {
    try {
      const res = await fetch(`${API}/api/cards/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Cartão excluído!");
        if (selectedCardId === id) setSelectedCardId(null);
        setDeleteConfirm(null);
        await loadCards();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || "Erro ao excluir cartão");
      }
    } catch {
      toast.error("Erro ao excluir cartão");
    }
  };

  const openEditModal = (card: Card) => {
    setEditingCard(card);
    setFormData({
      nome_cartao: card.nome_cartao,
      bandeira: card.bandeira.toLowerCase(),
      limite: String(card.limite),
      dia_fechamento_fatura: card.dia_fechamento_fatura,
      dia_vencimento_fatura: card.dia_vencimento_fatura,
      ultimos_4_digitos: card.ultimos_4_digitos || "",
      cor: card.cor || CARD_COLORS[card.id % CARD_COLORS.length],
    });
    setShowCardModal(true);
  };

  const openNewCardModal = () => {
    setEditingCard(null);
    setFormData({
      nome_cartao: "",
      bandeira: "visa",
      limite: "0",
      dia_fechamento_fatura: 15,
      dia_vencimento_fatura: 10,
      ultimos_4_digitos: "",
      cor: CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)],
    });
    setShowCardModal(true);
  };

  // Pay invoice
  const handlePayInvoice = async () => {
    if (!currentInvoice || !selectedAccountId) return;
    setPayLoading(true);
    try {
      const res = await fetch(`${API}/api/invoices/${currentInvoice.id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ conta_pagamento_id: selectedAccountId }),
      });
      if (res.ok) {
        setShowPayModal(false);
        setSelectedAccountId(null);
        await loadInvoice(selectedCardId!, invoiceMonth, invoiceYear);
        await loadInvoiceHistory(selectedCardId!);
        await loadAccounts();
      }
    } catch {
      // silent
    } finally {
      setPayLoading(false);
    }
  };

  if (!mounted) return null;

  const cardBg = isDark ? "bg-slate-800/90 border-slate-700/30" : "bg-white border-slate-200/50";
  const cardBgHover = isDark ? "hover:bg-slate-700/50" : "hover:bg-slate-50";
  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textSecondary = isDark ? "text-slate-400" : "text-slate-500";
  const textMuted = isDark ? "text-slate-500" : "text-slate-400";
  const inputBg = isDark
    ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
    : "bg-white border-slate-300 text-slate-900 placeholder-slate-400";

  return (
    <div className="w-full min-h-screen">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className={`transition-all duration-700 w-full ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>

          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1
                className={`text-2xl sm:text-3xl font-bold mb-1 ${textPrimary}`}
                style={{ fontFamily: "var(--font-primary, Montserrat, sans-serif)" }}
              >
                {t("cards.title") || "Cartões de Crédito"}
              </h1>
              <p className={`text-sm ${textSecondary}`} style={{ fontFamily: "var(--font-secondary, Open Sans, sans-serif)" }}>
                Gerencie seus cartões e acompanhe suas faturas
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowBalance(!showBalance)}
                className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-slate-700" : "hover:bg-slate-100"} ${textSecondary}`}
                title={showBalance ? "Ocultar valores" : "Mostrar valores"}
              >
                {showBalance ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
              <button
                onClick={openNewCardModal}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30"
              >
                <Plus size={18} />
                {t("cards.addCard") || "Novo Cartão"}
              </button>
            </div>
          </div>

          {/* Empty state */}
          {!loading && cards.length === 0 && (
            <div className={`rounded-2xl border ${cardBg} p-12 text-center`}>
              <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center ${isDark ? "bg-blue-500/20" : "bg-blue-50"}`}>
                <CreditCard size={36} className="text-blue-500" />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${textPrimary}`}>Nenhum cartão cadastrado</h3>
              <p className={`mb-6 ${textSecondary}`}>Adicione seu primeiro cartão de crédito para começar a controlar suas faturas.</p>
              <button
                onClick={openNewCardModal}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all"
              >
                <Plus size={18} />
                Adicionar Cartão
              </button>
            </div>
          )}

          {/* Main layout */}
          {cards.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left panel - Cards list */}
              <div className="lg:col-span-4 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className={`text-sm font-semibold uppercase tracking-wider ${textMuted}`}>
                    Seus Cartões ({cards.length})
                  </h2>
                </div>

                <div className="space-y-4">
                  {cards.map((card) => (
                    <div key={card.id} className="relative group">
                      <CreditCardVisual
                        card={card}
                        isSelected={selectedCardId === card.id}
                        onClick={() => {
                          setSelectedCardId(card.id);
                          setShowHistory(false);
                          setInvoiceMonth(new Date().getMonth() + 1);
                          setInvoiceYear(new Date().getFullYear());
                        }}
                        isDark={isDark}
                        showBalance={showBalance}
                      />
                      {/* Action buttons overlay */}
                      <div className={`absolute top-3 right-3 flex gap-1 ${deleteConfirm === card.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity z-20`}>
                        {deleteConfirm === card.id ? (
                          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm">
                            <span className="text-white text-xs font-medium mr-1">Excluir?</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCard(card.id);
                              }}
                              className="px-2 py-0.5 rounded bg-red-500 hover:bg-red-600 text-white text-xs font-medium transition-colors"
                            >
                              Sim
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirm(null);
                              }}
                              className="px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 text-white text-xs font-medium transition-colors"
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(card);
                              }}
                              className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white transition-colors"
                              title="Editar"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirm(card.id);
                              }}
                              className="p-1.5 rounded-lg bg-red-500/40 backdrop-blur-sm hover:bg-red-500/60 text-white transition-colors"
                              title="Excluir"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right panel - Invoice details */}
              <div className="lg:col-span-8">
                {selectedCard ? (
                  <div className="space-y-4">
                    {/* Invoice header with month navigation */}
                    <div className={`rounded-2xl border ${cardBg} p-5`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Receipt size={20} className="text-blue-500" />
                          <h2 className={`text-lg font-bold ${textPrimary}`}>
                            {showHistory ? "Histórico de Faturas" : "Fatura"}
                          </h2>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setShowHistory(!showHistory)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              showHistory
                                ? "bg-blue-600 text-white"
                                : isDark ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            <History size={14} />
                            {showHistory ? "Ver Atual" : "Histórico"}
                          </button>
                        </div>
                      </div>

                      {!showHistory && (
                        <>
                          {/* Month navigator */}
                          <div className="flex items-center justify-between mb-4">
                            <button
                              onClick={prevMonth}
                              className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-slate-700" : "hover:bg-slate-100"} ${textSecondary}`}
                            >
                              <ChevronLeft size={20} />
                            </button>
                            <span className={`text-base font-semibold ${textPrimary}`}>
                              {MONTH_NAMES[invoiceMonth - 1]} {invoiceYear}
                            </span>
                            <button
                              onClick={nextMonth}
                              className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-slate-700" : "hover:bg-slate-100"} ${textSecondary}`}
                            >
                              <ChevronRight size={20} />
                            </button>
                          </div>

                          {/* Invoice summary cards */}
                          {invoiceLoading ? (
                            <div className="flex justify-center py-8">
                              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                          ) : currentInvoice ? (
                            <>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                                <div className={`rounded-xl p-3 ${isDark ? "bg-slate-700/50" : "bg-slate-50"}`}>
                                  <p className={`text-[10px] uppercase tracking-wider font-medium mb-1 ${textMuted}`}>Total</p>
                                  <p className={`text-lg font-bold ${textPrimary}`}>
                                    {showBalance ? formatCurrency(currentInvoice.valor_total) : "R$ ••••"}
                                  </p>
                                </div>
                                <div className={`rounded-xl p-3 ${isDark ? "bg-slate-700/50" : "bg-slate-50"}`}>
                                  <p className={`text-[10px] uppercase tracking-wider font-medium mb-1 ${textMuted}`}>Status</p>
                                  <div className="mt-0.5">
                                    <StatusBadge status={currentInvoice.status} isDark={isDark} />
                                  </div>
                                </div>
                                <div className={`rounded-xl p-3 ${isDark ? "bg-slate-700/50" : "bg-slate-50"}`}>
                                  <p className={`text-[10px] uppercase tracking-wider font-medium mb-1 ${textMuted}`}>Fechamento</p>
                                  <p className={`text-sm font-semibold ${textPrimary}`}>{formatDate(currentInvoice.data_fechamento)}</p>
                                </div>
                                <div className={`rounded-xl p-3 ${isDark ? "bg-slate-700/50" : "bg-slate-50"}`}>
                                  <p className={`text-[10px] uppercase tracking-wider font-medium mb-1 ${textMuted}`}>Vencimento</p>
                                  <p className={`text-sm font-semibold ${textPrimary}`}>{formatDate(currentInvoice.data_vencimento)}</p>
                                </div>
                              </div>

                              {/* Pay button */}
                              {currentInvoice.status !== "paga" && parseFloat(currentInvoice.valor_total) > 0 && (
                                <button
                                  onClick={() => {
                                    setSelectedAccountId(null);
                                    setShowPayModal(true);
                                  }}
                                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-600/20 mb-4"
                                >
                                  <Wallet size={18} />
                                  Pagar Fatura
                                </button>
                              )}

                              {currentInvoice.status === "paga" && currentInvoice.data_pagamento && (
                                <div className={`flex items-center gap-2 p-3 rounded-xl mb-4 ${isDark ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-emerald-50 border border-emerald-100"}`}>
                                  <CheckCircle2 size={16} className="text-emerald-500" />
                                  <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                                    Paga em {formatDate(currentInvoice.data_pagamento)}
                                  </span>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-center py-8">
                              <p className={textSecondary}>Nenhuma fatura para este período.</p>
                            </div>
                          )}
                        </>
                      )}

                      {/* Invoice history */}
                      {showHistory && (
                        <div className="space-y-2">
                          {invoiceHistory.length === 0 ? (
                            <p className={`text-center py-8 ${textSecondary}`}>Nenhuma fatura encontrada.</p>
                          ) : (
                            invoiceHistory.map((inv) => (
                              <button
                                key={inv.id}
                                onClick={() => {
                                  setInvoiceMonth(inv.mes_referencia);
                                  setInvoiceYear(inv.ano_referencia);
                                  setShowHistory(false);
                                }}
                                className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${cardBgHover} ${
                                  isDark ? "border border-slate-700/50" : "border border-slate-100"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <Calendar size={16} className={textMuted} />
                                  <span className={`font-medium text-sm ${textPrimary}`}>
                                    {MONTH_NAMES[inv.mes_referencia - 1]} {inv.ano_referencia}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className={`font-semibold text-sm ${textPrimary}`}>
                                    {showBalance ? formatCurrency(inv.valor_total) : "R$ ••••"}
                                  </span>
                                  <StatusBadge status={inv.status} isDark={isDark} />
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>

                    {/* Transactions list */}
                    {!showHistory && currentInvoice && currentInvoice.transacoes.length > 0 && (
                      <div className={`rounded-2xl border ${cardBg} p-5`}>
                        <h3 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${textMuted}`}>
                          Transações ({currentInvoice.transacoes.length})
                        </h3>
                        <div className="space-y-1">
                          {currentInvoice.transacoes.map((tx) => (
                            <div
                              key={tx.id}
                              className={`flex items-center justify-between p-3 rounded-xl transition-colors ${cardBgHover}`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                  isDark ? "bg-slate-700" : "bg-slate-100"
                                }`}>
                                  <DollarSign size={14} className={textSecondary} />
                                </div>
                                <div className="min-w-0">
                                  <p className={`text-sm font-medium truncate ${textPrimary}`}>
                                    {tx.descricao || "Transação"}
                                  </p>
                                  <p className={`text-xs ${textMuted}`}>
                                    {formatDate(tx.data_transacao)}
                                  </p>
                                </div>
                              </div>
                              <span className={`text-sm font-semibold flex-shrink-0 ml-3 ${
                                tx.tipo === "Receita" ? "text-emerald-500" : "text-red-500"
                              }`}>
                                {tx.tipo === "Receita" ? "+" : "-"}{" "}
                                {showBalance ? formatCurrency(tx.valor) : "R$ ••••"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!showHistory && currentInvoice && currentInvoice.transacoes.length === 0 && (
                      <div className={`rounded-2xl border ${cardBg} p-8 text-center`}>
                        <Receipt size={32} className={`mx-auto mb-3 ${textMuted}`} />
                        <p className={`font-medium ${textSecondary}`}>Nenhuma transação nesta fatura</p>
                        <p className={`text-sm mt-1 ${textMuted}`}>
                          As transações vinculadas a este cartão aparecerão aqui.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`rounded-2xl border ${cardBg} p-12 text-center`}>
                    <CreditCard size={36} className={`mx-auto mb-3 ${textMuted}`} />
                    <p className={`font-medium ${textSecondary}`}>Selecione um cartão</p>
                    <p className={`text-sm mt-1 ${textMuted}`}>
                      Clique em um dos seus cartões para ver a fatura.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Modal (Create/Edit) */}
      {showCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className={`w-full max-w-md rounded-2xl border shadow-2xl ${
              isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
              <h3 className={`text-lg font-bold ${textPrimary}`}>
                {editingCard ? (t("cards.editCard") || "Editar Cartão") : (t("cards.addCard") || "Novo Cartão")}
              </h3>
              <button
                onClick={() => { setShowCardModal(false); setEditingCard(null); }}
                className={`p-1.5 rounded-lg transition-colors ${isDark ? "hover:bg-slate-700" : "hover:bg-slate-100"} ${textSecondary}`}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCard} className="p-5 space-y-4">
              {/* Card preview */}
              <div className="flex justify-center mb-2">
                <div
                  className="w-56 aspect-[1.6/1] rounded-xl p-4 flex flex-col justify-between relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${formData.cor} 0%, ${formData.cor}cc 50%, ${formData.cor}99 100%)`,
                  }}
                >
                  <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/10" />
                  <div className="flex justify-between items-start relative z-10">
                    <span className="text-white/60 text-[9px] uppercase tracking-wider">
                      {getBrandInfo(formData.bandeira).label}
                    </span>
                    <CreditCard size={16} className="text-white/40" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-white/80 text-xs tracking-[0.15em] font-mono">
                      •••• {formData.ultimos_4_digitos || "••••"}
                    </p>
                  </div>
                  <div className="flex justify-between items-end relative z-10">
                    <span className="text-white text-[10px] font-medium truncate max-w-[120px]">
                      {formData.nome_cartao || "Nome do Cartão"}
                    </span>
                    <span className="text-white/60 text-[9px]">
                      {formatCurrency(formData.limite || "0")}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>Nome do Cartão</label>
                <input
                  type="text"
                  value={formData.nome_cartao}
                  onChange={(e) => setFormData({ ...formData, nome_cartao: e.target.value })}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${inputBg}`}
                  placeholder="Ex: Nubank Platinum"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>Bandeira</label>
                  <select
                    value={formData.bandeira}
                    onChange={(e) => setFormData({ ...formData, bandeira: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${inputBg}`}
                  >
                    {BRAND_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>Últimos 4 dígitos</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={formData.ultimos_4_digitos}
                    onChange={(e) => setFormData({ ...formData, ultimos_4_digitos: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${inputBg}`}
                    placeholder="0000"
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>Limite</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.limite}
                  onChange={(e) => setFormData({ ...formData, limite: e.target.value })}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${inputBg}`}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>Dia Fechamento</label>
                  <input
                    type="number"
                    min={1}
                    max={28}
                    value={formData.dia_fechamento_fatura}
                    onChange={(e) => setFormData({ ...formData, dia_fechamento_fatura: Number(e.target.value) })}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${inputBg}`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>Dia Vencimento</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={formData.dia_vencimento_fatura}
                    onChange={(e) => setFormData({ ...formData, dia_vencimento_fatura: Number(e.target.value) })}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${inputBg}`}
                    required
                  />
                </div>
              </div>

              {/* Color picker */}
              <div>
                <label className={`block text-xs font-medium mb-2 ${textSecondary}`}>Cor do Cartão</label>
                <div className="flex flex-wrap gap-2">
                  {CARD_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, cor: color })}
                      className={`w-8 h-8 rounded-lg transition-all ${
                        formData.cor === color ? "ring-2 ring-blue-400 ring-offset-2 scale-110" : "hover:scale-105"
                      }`}
                      style={{
                        background: color,
                        ringOffsetColor: isDark ? "#1e293b" : "#ffffff",
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowCardModal(false); setEditingCard(null); }}
                  className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                    isDark ? "bg-slate-700 hover:bg-slate-600 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-all shadow-lg shadow-blue-600/20"
                >
                  {isSubmitting ? "Salvando..." : editingCard ? "Salvar" : "Criar Cartão"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Invoice Modal */}
      {showPayModal && currentInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className={`w-full max-w-sm rounded-2xl border shadow-2xl ${
              isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
              <h3 className={`text-lg font-bold ${textPrimary}`}>Pagar Fatura</h3>
              <button
                onClick={() => setShowPayModal(false)}
                className={`p-1.5 rounded-lg transition-colors ${isDark ? "hover:bg-slate-700" : "hover:bg-slate-100"} ${textSecondary}`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Invoice amount */}
              <div className={`text-center p-4 rounded-xl ${isDark ? "bg-slate-700/50" : "bg-slate-50"}`}>
                <p className={`text-xs uppercase tracking-wider font-medium mb-1 ${textMuted}`}>Valor da Fatura</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>
                  {formatCurrency(currentInvoice.valor_total)}
                </p>
                <p className={`text-xs mt-1 ${textMuted}`}>
                  {MONTH_NAMES[currentInvoice.mes_referencia - 1]} {currentInvoice.ano_referencia}
                </p>
              </div>

              {/* Account selector */}
              <div>
                <label className={`block text-xs font-medium mb-2 ${textSecondary}`}>
                  Selecione a conta para pagamento
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {accounts.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => setSelectedAccountId(acc.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                        selectedAccountId === acc.id
                          ? "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/30"
                          : isDark
                            ? "border-slate-700 hover:border-slate-600 bg-slate-700/30"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div>
                        <p className={`text-sm font-medium ${textPrimary}`}>{acc.nome_banco}</p>
                        <p className={`text-xs ${textMuted}`}>{acc.tipo_conta}</p>
                      </div>
                      <span className={`text-sm font-semibold ${textPrimary}`}>
                        {formatCurrency(acc.saldo_atual)}
                      </span>
                    </button>
                  ))}
                  {accounts.length === 0 && (
                    <p className={`text-center py-4 text-sm ${textSecondary}`}>
                      Nenhuma conta cadastrada
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                    isDark ? "bg-slate-700 hover:bg-slate-600 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handlePayInvoice}
                  disabled={!selectedAccountId || payLoading}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-all shadow-lg shadow-emerald-600/20"
                >
                  {payLoading ? "Pagando..." : "Confirmar Pagamento"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
