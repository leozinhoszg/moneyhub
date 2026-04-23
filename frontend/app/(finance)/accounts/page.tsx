"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";

type Account = {
  id: number;
  nome_banco: string;
  tipo_conta: string;
  saldo_inicial: string;
  saldo_atual: string;
  cor?: string;
  incluir_soma?: boolean;
  descricao?: string;
};

type Bank = {
  id: number;
  COD: string | null;
  LongName: string | null;
  logotipo?: string | null;
};

const ACCOUNT_COLORS = [
  "#3B82F6", // blue
  "#10B981", // emerald
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // violet
  "#F97316", // orange
  "#06B6D4", // cyan
  "#84CC16", // lime
  "#EC4899", // pink
  "#6366F1", // indigo
];

// Bancos serão carregados da API

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showBankSelector, setShowBankSelector] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchBank, setSearchBank] = useState("");
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    nome_banco: "",
    tipo_conta: "Corrente",
    saldo_inicial: "0",
    descricao: "",
    cor: "#3B82F6",
    incluir_soma: true,
  });

  const { isDark, mounted } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();

  // Carregar contas
  const loadAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/accounts`,
        { credentials: "include" }
      );
      if (res.ok) {
        setAccounts(await res.json());
      }
    } catch (error) {
      // Erro silencioso - contas não carregadas
    } finally {
      setLoading(false);
    }
  };

  // Carregar bancos
  const loadBanks = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/banks`,
        { credentials: "include" }
      );
      if (res.ok) {
        const data = await res.json();
        setBanks(data.banks);
      }
    } catch (error) {
      // Erro silencioso - bancos não carregados
    }
  };

  useEffect(() => {
    loadAccounts();
    loadBanks();
  }, []);

  // Filtrar bancos por nome ou código
  const filteredBanks = banks.filter((bank) => {
    const searchTerm = searchBank.toLowerCase();
    const bankName = bank.LongName?.toLowerCase() || "";
    const bankCode = bank.COD?.toLowerCase() || "";

    // Busca normal
    const matchesName = bankName.includes(searchTerm);
    const matchesCode = bankCode.includes(searchTerm);

    // Busca especial para Itaú (que pode vir como ItaÃº)
    const matchesItau = searchTerm.includes("itau") && bankName.includes("ita");

    return matchesName || matchesCode || matchesItau;
  });

  // Abrir seletor de banco (primeiro passo)
  const openBankSelector = () => {
    setSelectedBank(null);
    setSearchBank("");
    setShowBankSelector(true);
  };

  // Abrir modal para nova conta (segundo passo, com banco pré-selecionado)
  const openNewAccountModal = (bank?: Bank) => {
    const bankToUse = bank || selectedBank;
    setFormData({
      nome_banco: bankToUse?.LongName || "",
      tipo_conta: "Corrente",
      saldo_inicial: "0",
      descricao: "",
      cor: "#3B82F6",
      incluir_soma: true,
    });
    setSelectedBank(bankToUse);
    setEditingAccount(null);
    setShowBankSelector(false);
    setShowModal(true);
  };

  // Selecionar banco e ir para o modal de nova conta
  const selectBank = (bank: Bank) => {
    setSelectedBank(bank);
    // Se o modal de nova conta já estiver aberto, apenas atualiza o banco
    if (showModal) {
      setFormData({ ...formData, nome_banco: bank.LongName });
      setShowBankSelector(false);
    } else {
      // Se não, abre o modal de nova conta
      openNewAccountModal(bank);
    }
  };

  // Fechar modais
  const closeModals = () => {
    setShowModal(false);
    setShowBankSelector(false);
    setEditingAccount(null);
    setSelectedBank(null);
    setSearchBank("");
  };

  // Editar conta existente
  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      nome_banco: account.nome_banco,
      tipo_conta: account.tipo_conta,
      saldo_inicial: account.saldo_inicial,
      descricao: account.descricao || "",
      cor: account.cor || "#3B82F6",
      incluir_soma: account.incluir_soma ?? true,
    });
    setShowModal(true);
  };

  // Submeter formulário
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editingAccount
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/accounts/${editingAccount.id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/accounts`;
      const method = editingAccount ? "PUT" : "POST";
      const body = editingAccount
        ? { nome_banco: formData.nome_banco, tipo_conta: formData.tipo_conta }
        : { nome_banco: formData.nome_banco, tipo_conta: formData.tipo_conta, saldo_inicial: formData.saldo_inicial };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success(editingAccount ? "Conta atualizada!" : "Conta criada!");
        await loadAccounts();
        closeModals();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || "Erro ao salvar conta");
      }
    } catch (error) {
      toast.error("Erro ao salvar conta");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Excluir conta
  const handleDeleteAccount = async (id: number) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/accounts/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (res.ok) {
        toast.success("Conta excluída!");
        await loadAccounts();
        setDeleteConfirm(null);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || "Erro ao excluir conta");
      }
    } catch (error) {
      toast.error("Erro ao excluir conta");
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="w-full min-h-screen">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div
          className={`transition-all duration-1000 w-full ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1
                  className={`text-2xl sm:text-3xl font-bold mb-2 transition-colors duration-300 ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                  style={{
                    fontFamily: "var(--font-primary, Montserrat, sans-serif)",
                  }}
                >
                  {t("accounts.title")}
                </h1>
                <p
                  className={`text-sm sm:text-base ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                  style={{
                    fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                  }}
                >
                  Gerencie suas contas bancárias e carteiras
                </p>
              </div>
            </div>
          </div>

          {/* Introdução quando não há contas */}
          {accounts.length === 0 && (
            <div
              className={`rounded-xl shadow-lg border transition-all duration-300 ${
                isDark
                  ? "bg-slate-800/90 border-slate-700/30"
                  : "bg-white border-slate-200/50"
              } p-6 mb-8 text-center`}
            >
              <div className="max-w-md mx-auto">
                <div
                  className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
                    isDark ? "bg-blue-500/20" : "bg-blue-50"
                  }`}
                >
                  <svg
                    className="w-12 h-12 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                    />
                  </svg>
                </div>
                <h3
                  className={`text-xl font-semibold mb-3 ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                  style={{
                    fontFamily: "var(--font-primary, Montserrat, sans-serif)",
                  }}
                >
                  Primeiros passos
                </h3>
                <p
                  className={`text-sm mb-6 ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                  style={{
                    fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                  }}
                >
                  Contas podem ser bancárias ou digitais. Nelas, você guarda seu
                  dinheiro.
                </p>
              </div>
            </div>
          )}

          {/* Lista de Contas */}
          <div
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
                    fontFamily: "var(--font-primary, Montserrat, sans-serif)",
                  }}
                >
                  Contas
                </h3>
              </div>
              <span
                className={`text-sm ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {accounts.length} {accounts.length === 1 ? "conta" : "contas"}
              </span>
            </div>

            {/* Carteira padrão */}
            <div
              className={`flex items-center justify-between p-4 rounded-lg mb-4 transition-all duration-200 hover:scale-[1.02] ${
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
                    fontFamily: "var(--font-primary, Montserrat, sans-serif)",
                  }}
                >
                  R$ 0,00
                </span>
              </div>
            </div>

            {/* Contas do usuário */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {accounts.map((account, index) => (
                  <div
                    key={account.id}
                    className={`flex items-center justify-between p-4 rounded-lg transition-all duration-200 hover:scale-[1.02] ${
                      isDark
                        ? "bg-slate-700/30 hover:bg-slate-700/50"
                        : "bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{
                          backgroundColor:
                            account.cor || `hsl(${index * 137.5}, 70%, 50%)`,
                        }}
                      >
                        {account.nome_banco.charAt(0).toUpperCase()}
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
                          {account.nome_banco}
                        </span>
                        <span
                          className={`text-xs ${
                            isDark ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          {account.tipo_conta}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditAccount(account)}
                          className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-slate-600 text-slate-400 hover:text-blue-400" : "hover:bg-slate-200 text-slate-500 hover:text-blue-600"}`}
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {deleteConfirm === account.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDeleteAccount(account.id)} className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600">Sim</button>
                            <button onClick={() => setDeleteConfirm(null)} className={`px-2 py-1 text-xs rounded ${isDark ? "bg-slate-600 text-slate-300" : "bg-slate-200 text-slate-700"}`}>Não</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(account.id)}
                            className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-slate-600 text-slate-400 hover:text-red-400" : "hover:bg-slate-200 text-slate-500 hover:text-red-600"}`}
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <span
                        className={`font-bold text-lg ${
                          Number(account.saldo_atual) >= 0
                            ? "text-emerald-500"
                            : "text-red-500"
                        }`}
                        style={{
                          fontFamily:
                            "var(--font-primary, Montserrat, sans-serif)",
                        }}
                      >
                        R$ {Number(account.saldo_atual).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Botão Adicionar Conta */}
            <button
              onClick={openBankSelector}
              className={`w-full mt-6 py-4 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02] border-2 border-dashed ${
                isDark
                  ? "border-slate-600 hover:border-blue-500 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10"
                  : "border-slate-300 hover:border-blue-500 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
              }`}
              style={{
                fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
              }}
            >
              + Adicionar uma Conta
            </button>
          </div>

          {/* Total */}
          <div
            className={`rounded-xl shadow-lg border transition-all duration-300 ${
              isDark
                ? "bg-slate-800/90 border-slate-700/30"
                : "bg-white border-slate-200/50"
            } p-6`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-lg font-semibold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
                style={{
                  fontFamily: "var(--font-primary, Montserrat, sans-serif)",
                }}
              >
                Total
              </span>
              <span
                className={`text-2xl font-bold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
                style={{
                  fontFamily: "var(--font-primary, Montserrat, sans-serif)",
                }}
              >
                R${" "}
                {accounts
                  .reduce((total, acc) => total + Number(acc.saldo_atual), 0)
                  .toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Seleção de Banco */}
      {showBankSelector && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div
            className={`w-full max-w-2xl h-[95vh] sm:h-[90vh] md:h-[85vh] overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 ${
              isDark
                ? "bg-slate-800/95 border-slate-700/30"
                : "bg-white border-slate-200/50"
            } border`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200/20">
              <h3
                className={`text-lg sm:text-xl font-semibold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
                style={{
                  fontFamily: "var(--font-primary, Montserrat, sans-serif)",
                }}
              >
                Adicionar Conta
              </h3>
              <button
                onClick={closeModals}
                className={`p-2 rounded-full transition-colors duration-200 ${
                  isDark
                    ? "hover:bg-slate-700 text-slate-400"
                    : "hover:bg-slate-100 text-slate-600"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-4 sm:p-6 flex flex-col flex-1 min-h-0 overflow-hidden">
              <p
                className={`text-center mb-3 sm:mb-4 text-sm sm:text-base ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
                style={{
                  fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                }}
              >
                De onde você quer trazer seus dados?
              </p>
              <p
                className={`text-center text-xs sm:text-sm mb-3 sm:mb-4 ${
                  isDark ? "text-slate-500" : "text-slate-500"
                }`}
                style={{
                  fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                }}
              >
                Escolha abaixo a instituição para acompanhar toda sua vida
                financeira aqui no MoneyHub.
              </p>

              {/* Busca */}
              <div className="mb-3 sm:mb-4">
                <input
                  type="text"
                  placeholder="Buscar por nome ou código"
                  value={searchBank}
                  onChange={(e) => setSearchBank(e.target.value)}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border transition-colors duration-200 text-sm sm:text-base ${
                    isDark
                      ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
                      : "bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-500"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  style={{
                    fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                  }}
                />
              </div>

              {/* Lista de bancos */}
              <div className="space-y-1 sm:space-y-2 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-slate-200 dark:scrollbar-thumb-slate-600 dark:scrollbar-track-slate-800">
                {filteredBanks.map((bank) => (
                  <button
                    key={bank.id}
                    onClick={() => selectBank(bank)}
                    className={`w-full flex items-center gap-3 sm:gap-4 p-2 sm:p-3 rounded-lg transition-all duration-200 hover:scale-[1.02] ${
                      isDark
                        ? "hover:bg-slate-700/50 text-slate-200"
                        : "hover:bg-slate-50 text-slate-800"
                    }`}
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                      {bank.COD || bank.LongName?.charAt(0) || "?"}
                    </div>
                    <div className="flex flex-col items-start">
                      <span
                        className="font-medium text-sm sm:text-base"
                        style={{
                          fontFamily:
                            "var(--font-secondary, Open Sans, sans-serif)",
                        }}
                      >
                        {bank.LongName}
                      </span>
                      {bank.COD && (
                        <span
                          className={`text-xs ${
                            isDark ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          Código: {bank.COD}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova Conta */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-2xl shadow-2xl transition-all duration-300 ${
              isDark
                ? "bg-slate-800/95 border-slate-700/30"
                : "bg-white border-slate-200/50"
            } border`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200/20">
              <h3
                className={`text-xl font-semibold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
                style={{
                  fontFamily: "var(--font-primary, Montserrat, sans-serif)",
                }}
              >
                {editingAccount ? "Editar Conta" : "Nova Conta"}
              </h3>
              <button
                onClick={closeModals}
                className={`p-2 rounded-full transition-colors duration-200 ${
                  isDark
                    ? "hover:bg-slate-700 text-slate-400"
                    : "hover:bg-slate-100 text-slate-600"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <p
                className={`text-sm text-center ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
                style={{
                  fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                }}
              >
                Saldo atual da conta
              </p>
              <div className="text-center">
                <input
                  type="number"
                  step="0.01"
                  value={formData.saldo_inicial}
                  onChange={(e) =>
                    setFormData({ ...formData, saldo_inicial: e.target.value })
                  }
                  className={`text-3xl font-bold text-center bg-transparent border-none outline-none w-full ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                  style={{
                    fontFamily: "var(--font-primary, Montserrat, sans-serif)",
                  }}
                  placeholder="R$ 0,00"
                  required
                />
              </div>

              {/* Banco */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    className={`text-sm font-medium ${
                      isDark ? "text-slate-300" : "text-slate-700"
                    }`}
                    style={{
                      fontFamily:
                        "var(--font-secondary, Open Sans, sans-serif)",
                    }}
                  >
                    Banco
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowBankSelector(true)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      isDark
                        ? "text-blue-400 hover:bg-blue-500/20"
                        : "text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    Trocar
                  </button>
                </div>
                <div
                  className={`w-full flex items-center gap-3 p-4 rounded-lg border ${
                    isDark
                      ? "bg-slate-700/50 border-slate-600"
                      : "bg-slate-50 border-slate-300"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                    {formData.nome_banco
                      ? banks.find((b) => b.LongName === formData.nome_banco)
                          ?.COD || formData.nome_banco.charAt(0)
                      : "?"}
                  </div>
                  <span
                    className={`font-medium ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                    style={{
                      fontFamily:
                        "var(--font-secondary, Open Sans, sans-serif)",
                    }}
                  >
                    {formData.nome_banco || "Nenhum banco selecionado"}
                  </span>
                </div>
              </div>

              {/* Descrição */}
              <div>
                <input
                  type="text"
                  placeholder="Descrição"
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                    isDark
                      ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
                      : "bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-500"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  style={{
                    fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                  }}
                />
              </div>

              {/* Tipo de Conta */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                  style={{
                    fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                  }}
                >
                  Tipo de conta
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "Corrente", label: "Conta corrente", icon: "🏛️" },
                    { value: "Carteira", label: "Carteira", icon: "💰" },
                    { value: "Poupança", label: "Poupança", icon: "🏦" },
                    {
                      value: "Investimento",
                      label: "Investimentos",
                      icon: "📈",
                    },
                    { value: "VR/VA", label: "VR/VA", icon: "🍽️" },
                    { value: "Outros", label: "Outros", icon: "⚙️" },
                  ].map((tipo) => (
                    <button
                      key={tipo.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, tipo_conta: tipo.value })
                      }
                      className={`p-3 rounded-lg border transition-all duration-200 ${
                        formData.tipo_conta === tipo.value
                          ? isDark
                            ? "border-blue-500 bg-blue-500/20 text-blue-400"
                            : "border-blue-500 bg-blue-50 text-blue-600"
                          : isDark
                          ? "border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500"
                          : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg mb-1">{tipo.icon}</div>
                        <div
                          className="text-xs"
                          style={{
                            fontFamily:
                              "var(--font-secondary, Open Sans, sans-serif)",
                          }}
                        >
                          {tipo.label}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cor da conta */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                  style={{
                    fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                  }}
                >
                  Cor da conta
                </label>
                <div className="flex flex-wrap gap-2">
                  {ACCOUNT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, cor: color })}
                      className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                        formData.cor === color
                          ? "border-white shadow-lg scale-110"
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Incluir na soma */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                  style={{
                    fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                  }}
                >
                  Incluir na soma da tela inicial
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      incluir_soma: !formData.incluir_soma,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.incluir_soma ? "bg-blue-500" : "bg-slate-400"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.incluir_soma ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModals}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                    isDark
                      ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                  style={{
                    fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!formData.nome_banco}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                    formData.nome_banco
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-slate-400 text-slate-600 cursor-not-allowed"
                  }`}
                  style={{
                    fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                  }}
                >
                  {isSubmitting ? "Salvando..." : editingAccount ? "Atualizar" : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
