"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/contexts/AuthContext";

type Transaction = {
  id: number;
  tipo: string;
  valor: string;
  data_transacao: string;
  descricao?: string | null;
  categoria_id?: number | null;
  conta_bancaria_id?: number | null;
  cartao_credito_id?: number | null;
};

type Category = {
  id: number;
  nome: string;
  tipo: string;
  cor?: string;
};

type Account = {
  id: number;
  nome_banco: string;
  saldo_atual: string;
};

type Card = {
  id: number;
  nome_cartao: string;
  limite: string;
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [selectedTransactionType, setSelectedTransactionType] =
    useState<string>("");
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  // Filtros
  const [filterType, setFilterType] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterAccount, setFilterAccount] = useState<string>("");
  const [filterCard, setFilterCard] = useState<string>("");
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");

  // Formulário
  const [formData, setFormData] = useState({
    tipo: "Despesa",
    valor: "",
    data_transacao: new Date().toISOString().split("T")[0],
    descricao: "",
    categoria_id: "",
    conta_bancaria_id: "",
    cartao_credito_id: "",
    conta_origem_id: "", // Para transferências
    conta_destino_id: "", // Para transferências
    anexo: null as File | null, // Para comprovantes
  });

  const { isDark, mounted } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();

  // Carregar dados iniciais
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [transactionsRes, categoriesRes, accountsRes, cardsRes] =
          await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/transactions`, {
              credentials: "include",
            }),
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories`, {
        credentials: "include",
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/accounts`, {
        credentials: "include",
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cards`, {
        credentials: "include",
      }),
          ]);

        if (transactionsRes.ok) {
          const transactionsData = await transactionsRes.json();
          setTransactions(
            Array.isArray(transactionsData)
              ? transactionsData
              : transactionsData.items || []
          );
        }
        if (categoriesRes.ok) setCategories(await categoriesRes.json());
        if (accountsRes.ok) setAccounts(await accountsRes.json());
        if (cardsRes.ok) setCards(await cardsRes.json());
      } catch (err: any) {
        setError(err.message || t("common.error"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [t]);

  // Filtrar transações
  const filteredTransactions = transactions.filter((transaction) => {
    if (filterType && transaction.tipo !== filterType) return false;
    if (filterCategory && transaction.categoria_id !== Number(filterCategory))
      return false;
    if (
      filterAccount &&
      transaction.conta_bancaria_id !== Number(filterAccount)
    )
      return false;
    if (filterCard && transaction.cartao_credito_id !== Number(filterCard))
      return false;
    if (filterStartDate && transaction.data_transacao < filterStartDate)
      return false;
    if (filterEndDate && transaction.data_transacao > filterEndDate)
      return false;
    return true;
  });

  // Calcular resumo
  const totalIncome = filteredTransactions
    .filter((t) => t.tipo === "Receita")
    .reduce((sum, t) => sum + Number(t.valor), 0);

  const totalExpenses = filteredTransactions
    .filter((t) => t.tipo === "Despesa")
    .reduce((sum, t) => sum + Number(t.valor), 0);

  const netBalance = totalIncome - totalExpenses;

  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
      setLoading(true);

    try {
      const url = editingTransaction
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/transactions/${editingTransaction.id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/transactions`;

      const method = editingTransaction ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          valor: parseFloat(formData.valor),
          categoria_id: formData.categoria_id
            ? Number(formData.categoria_id)
            : null,
          conta_bancaria_id: formData.conta_bancaria_id
            ? Number(formData.conta_bancaria_id)
            : null,
          cartao_credito_id: formData.cartao_credito_id
            ? Number(formData.cartao_credito_id)
            : null,
        }),
      });

      if (response.ok) {
        // Recarregar transações
        const transactionsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/transactions`,
          {
            credentials: "include",
          }
        );
        if (transactionsRes.ok) {
          const transactionsData = await transactionsRes.json();
          setTransactions(
            Array.isArray(transactionsData)
              ? transactionsData
              : transactionsData.items || []
          );
        }

        // Resetar formulário
        setFormData({
          tipo: "Despesa",
          valor: "",
          data_transacao: new Date().toISOString().split("T")[0],
          descricao: "",
          categoria_id: "",
          conta_bancaria_id: "",
          cartao_credito_id: "",
          conta_origem_id: "",
          conta_destino_id: "",
          anexo: null,
        });
        setShowForm(false);
        setEditingTransaction(null);
        } else {
        throw new Error("Falha ao salvar transação");
        }
    } catch (err: any) {
      setError(err.message || t("common.error"));
      } finally {
        setLoading(false);
      }
    };

  // Excluir transação
  const handleDelete = async (id: number) => {
    if (!confirm(t("transactions.confirmDelete"))) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/transactions/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        setTransactions(transactions.filter((t) => t.id !== id));
      } else {
        throw new Error("Falha ao excluir transação");
      }
    } catch (err: any) {
      setError(err.message || t("common.error"));
    }
  };

  // Editar transação
  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      tipo: transaction.tipo,
      valor: transaction.valor,
      data_transacao: transaction.data_transacao?.split("T")[0] || "",
      descricao: transaction.descricao || "",
      categoria_id: transaction.categoria_id?.toString() || "",
      conta_bancaria_id: transaction.conta_bancaria_id?.toString() || "",
      cartao_credito_id: transaction.cartao_credito_id?.toString() || "",
      conta_origem_id: "",
      conta_destino_id: "",
      anexo: null,
    });
    setShowForm(true);
  };

  // Limpar filtros
  const clearFilters = () => {
    setFilterType("");
    setFilterCategory("");
    setFilterAccount("");
    setFilterCard("");
    setFilterStartDate("");
    setFilterEndDate("");
  };

  // Abrir formulário com tipo específico
  const openFormWithType = (type: string) => {
    setSelectedTransactionType(type);
    setShowTypeSelector(false);
    setShowForm(true);
    setEditingTransaction(null);

    // Resetar formulário com tipo específico
    const baseForm = {
      valor: "",
      data_transacao: new Date().toISOString().split("T")[0],
      descricao: "",
      categoria_id: "",
      conta_bancaria_id: "",
      cartao_credito_id: "",
      conta_origem_id: "",
      conta_destino_id: "",
      anexo: null as File | null,
    };

    switch (type) {
      case "Transferencia":
        setFormData({ ...baseForm, tipo: "Transferencia" });
        break;
      case "Receita":
        setFormData({ ...baseForm, tipo: "Receita" });
        break;
      case "DespesaCartao":
        setFormData({ ...baseForm, tipo: "Despesa" });
        break;
      case "Despesa":
        setFormData({ ...baseForm, tipo: "Despesa" });
        break;
      default:
        setFormData({ ...baseForm, tipo: "Despesa" });
    }
  };

  // Fechar todos os modais
  const closeAllModals = () => {
    setShowTypeSelector(false);
    setShowForm(false);
    setEditingTransaction(null);
    setSelectedTransactionType("");
  };

  // Upload de arquivo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, anexo: file });
    }
  };

  // Obter nome da categoria
  const getCategoryName = (id: number | null) => {
    if (!id) return "-";
    const category = categories.find((c) => c.id === id);
    return category ? category.nome : "-";
  };

  // Obter nome da conta
  const getAccountName = (id: number | null) => {
    if (!id) return "-";
    const account = accounts.find((a) => a.id === id);
    return account ? account.nome_banco : "-";
  };

  // Obter nome do cartão
  const getCardName = (id: number | null) => {
    if (!id) return "-";
    const card = cards.find((c) => c.id === id);
    return card ? card.nome_cartao : "-";
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
                  {t("transactions.title")}
                </h1>
                <p
                  className={`text-sm sm:text-base ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                  style={{
                    fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                  }}
                >
                  Gerencie suas receitas e despesas
                </p>
              </div>
              <button
                onClick={() => setShowTypeSelector(true)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
                  isDark
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                } shadow-lg`}
                style={{
                  fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                }}
              >
                {t("transactions.addTransaction")}
              </button>
            </div>
          </div>

          {/* Resumo Financeiro */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
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
              </div>
              <div
                className={`text-sm font-medium mb-1 ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
                style={{
                  fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
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
                R$ {totalIncome.toFixed(2)}
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
              </div>
              <div
                className={`text-sm font-medium mb-1 ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
                style={{
                  fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
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
                R$ {totalExpenses.toFixed(2)}
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
                    netBalance >= 0
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
                      netBalance >= 0 ? "text-emerald-500" : "text-red-500"
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
              </div>
              <div
                className={`text-sm font-medium mb-1 ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
                style={{
                  fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                }}
              >
                Saldo Líquido
              </div>
              <div
                className={`text-2xl sm:text-3xl font-bold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
                style={{
                  fontFamily: "var(--font-primary, Montserrat, sans-serif)",
                }}
              >
                R$ {netBalance.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Formulário de Transação */}
          {showForm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div
                className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl transition-all duration-300 ${
                  isDark
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-slate-200"
                } border p-6`}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3
                    className={`text-xl font-bold ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                    style={{
                      fontFamily: "var(--font-primary, Montserrat, sans-serif)",
                    }}
                  >
                    {selectedTransactionType === "Transferencia" &&
                      "Nova transferência"}
                    {selectedTransactionType === "Receita" && "Nova receita"}
                    {selectedTransactionType === "DespesaCartao" &&
                      "Nova despesa cartão"}
                    {selectedTransactionType === "Despesa" && "Nova despesa"}
                    {editingTransaction && t("transactions.editTransaction")}
                  </h3>
                  <button
                    onClick={closeAllModals}
                    className={`p-2 rounded-full transition-colors duration-200 ${
                      isDark
                        ? "hover:bg-slate-700 text-slate-400"
                        : "hover:bg-slate-100 text-slate-500"
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

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Valor da Transação */}
                  <div>
                    <label
                      className={`block text-lg font-medium mb-2 ${
                        isDark ? "text-slate-300" : "text-slate-700"
                      }`}
                      style={{
                        fontFamily:
                          "var(--font-secondary, Open Sans, sans-serif)",
                      }}
                    >
                      {selectedTransactionType === "Transferencia" &&
                        "Valor da transferência"}
                      {selectedTransactionType === "Receita" &&
                        "Valor da receita"}
                      {selectedTransactionType === "DespesaCartao" &&
                        "Valor da despesa cartão"}
                      {selectedTransactionType === "Despesa" &&
                        "Valor da despesa"}
        </label>
                    <div className="relative">
                      <span
                        className={`absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl font-bold ${
                          isDark ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        R$
                      </span>
          <input
            type="number"
                        step="0.01"
                        min="0"
                        value={formData.valor}
                        onChange={(e) =>
                          setFormData({ ...formData, valor: e.target.value })
                        }
                        className={`w-full pl-12 pr-4 py-4 text-3xl font-bold rounded-lg border transition-colors duration-200 ${
                          isDark
                            ? "bg-slate-700 border-slate-600 text-white focus:border-blue-500"
                            : "bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500"
                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                        style={{
                          fontFamily:
                            "var(--font-primary, Montserrat, sans-serif)",
                        }}
                        placeholder="0,00"
                        required
                      />
                    </div>
                  </div>

                  {/* Campos específicos por tipo */}
                  {selectedTransactionType === "Transferencia" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${
                            isDark ? "text-slate-300" : "text-slate-700"
                          }`}
                          style={{
                            fontFamily:
                              "var(--font-secondary, Open Sans, sans-serif)",
                          }}
                        >
                          De conta
        </label>
        <select
                          value={formData.conta_origem_id}
          onChange={(e) =>
                            setFormData({
                              ...formData,
                              conta_origem_id: e.target.value,
                            })
                          }
                          className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                            isDark
                              ? "bg-slate-700 border-slate-600 text-white focus:border-blue-500"
                              : "bg-white border-slate-300 text-slate-900 focus:border-blue-500"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                          required
                        >
                          <option value="">Selecione a conta de origem</option>
                          {accounts.map((account) => (
                            <option key={account.id} value={account.id}>
                              {account.nome_banco}
            </option>
          ))}
        </select>
                      </div>
                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${
                            isDark ? "text-slate-300" : "text-slate-700"
                          }`}
                          style={{
                            fontFamily:
                              "var(--font-secondary, Open Sans, sans-serif)",
                          }}
                        >
                          Transferir para
                        </label>
        <select
                          value={formData.conta_destino_id}
          onChange={(e) =>
                            setFormData({
                              ...formData,
                              conta_destino_id: e.target.value,
                            })
                          }
                          className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                            isDark
                              ? "bg-slate-700 border-slate-600 text-white focus:border-blue-500"
                              : "bg-white border-slate-300 text-slate-900 focus:border-blue-500"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                          required
                        >
                          <option value="">Selecione a conta de destino</option>
                          {accounts.map((account) => (
                            <option key={account.id} value={account.id}>
                              {account.nome_banco}
            </option>
          ))}
        </select>
                      </div>
                    </div>
                  )}

                  {selectedTransactionType === "Receita" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${
                            isDark ? "text-slate-300" : "text-slate-700"
                          }`}
                          style={{
                            fontFamily:
                              "var(--font-secondary, Open Sans, sans-serif)",
                          }}
                        >
                          Categoria
                        </label>
        <select
                          value={formData.categoria_id}
          onChange={(e) =>
                            setFormData({
                              ...formData,
                              categoria_id: e.target.value,
                            })
                          }
                          className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                            isDark
                              ? "bg-slate-700 border-slate-600 text-white focus:border-blue-500"
                              : "bg-white border-slate-300 text-slate-900 focus:border-blue-500"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                        >
                          <option value="">Selecione uma categoria</option>
                          {categories
                            .filter((c) => c.tipo === "Receita")
                            .map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.nome}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${
                            isDark ? "text-slate-300" : "text-slate-700"
                          }`}
                          style={{
                            fontFamily:
                              "var(--font-secondary, Open Sans, sans-serif)",
                          }}
                        >
                          Conta
                        </label>
                        <select
                          value={formData.conta_bancaria_id}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              conta_bancaria_id: e.target.value,
                            })
                          }
                          className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                            isDark
                              ? "bg-slate-700 border-slate-600 text-white focus:border-blue-500"
                              : "bg-white border-slate-300 text-slate-900 focus:border-blue-500"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                          required
                        >
                          <option value="">Selecione uma conta</option>
                          {accounts.map((account) => (
                            <option key={account.id} value={account.id}>
                              {account.nome_banco}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {selectedTransactionType === "DespesaCartao" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${
                            isDark ? "text-slate-300" : "text-slate-700"
                          }`}
                          style={{
                            fontFamily:
                              "var(--font-secondary, Open Sans, sans-serif)",
                          }}
                        >
                          Categoria
                        </label>
                        <select
                          value={formData.categoria_id}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              categoria_id: e.target.value,
                            })
                          }
                          className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                            isDark
                              ? "bg-slate-700 border-slate-600 text-white focus:border-blue-500"
                              : "bg-white border-slate-300 text-slate-900 focus:border-blue-500"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                        >
                          <option value="">Selecione uma categoria</option>
                          {categories
                            .filter((c) => c.tipo === "Despesa")
                            .map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.nome}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${
                            isDark ? "text-slate-300" : "text-slate-700"
                          }`}
                          style={{
                            fontFamily:
                              "var(--font-secondary, Open Sans, sans-serif)",
                          }}
                        >
                          Cartão
                        </label>
                        <select
                          value={formData.cartao_credito_id}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              cartao_credito_id: e.target.value,
                            })
                          }
                          className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                            isDark
                              ? "bg-slate-700 border-slate-600 text-white focus:border-blue-500"
                              : "bg-white border-slate-300 text-slate-900 focus:border-blue-500"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                          required
                        >
                          <option value="">Selecione um cartão</option>
                          {cards.map((card) => (
                            <option key={card.id} value={card.id}>
                              {card.nome_cartao}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {selectedTransactionType === "Despesa" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${
                            isDark ? "text-slate-300" : "text-slate-700"
                          }`}
                          style={{
                            fontFamily:
                              "var(--font-secondary, Open Sans, sans-serif)",
                          }}
                        >
                          Categoria
                        </label>
                        <select
                          value={formData.categoria_id}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              categoria_id: e.target.value,
                            })
                          }
                          className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                            isDark
                              ? "bg-slate-700 border-slate-600 text-white focus:border-blue-500"
                              : "bg-white border-slate-300 text-slate-900 focus:border-blue-500"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                        >
                          <option value="">Selecione uma categoria</option>
                          {categories
                            .filter((c) => c.tipo === "Despesa")
                            .map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.nome}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${
                            isDark ? "text-slate-300" : "text-slate-700"
                          }`}
                          style={{
                            fontFamily:
                              "var(--font-secondary, Open Sans, sans-serif)",
                          }}
                        >
                          Conta
                        </label>
                        <select
                          value={formData.conta_bancaria_id}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              conta_bancaria_id: e.target.value,
                            })
                          }
                          className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                            isDark
                              ? "bg-slate-700 border-slate-600 text-white focus:border-blue-500"
                              : "bg-white border-slate-300 text-slate-900 focus:border-blue-500"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                          required
                        >
                          <option value="">Selecione uma conta</option>
                          {accounts.map((account) => (
                            <option key={account.id} value={account.id}>
                              {account.nome_banco}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Data */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDark ? "text-slate-300" : "text-slate-700"
                      }`}
                      style={{
                        fontFamily:
                          "var(--font-secondary, Open Sans, sans-serif)",
                      }}
                    >
                      Data
                    </label>
                    <input
                      type="date"
                      value={formData.data_transacao}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          data_transacao: e.target.value,
                        })
                      }
                      className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                        isDark
                          ? "bg-slate-700 border-slate-600 text-white focus:border-blue-500"
                          : "bg-white border-slate-300 text-slate-900 focus:border-blue-500"
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                      required
                    />
                  </div>

                  {/* Descrição */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDark ? "text-slate-300" : "text-slate-700"
                      }`}
                      style={{
                        fontFamily:
                          "var(--font-secondary, Open Sans, sans-serif)",
                      }}
                    >
                      Descrição
                    </label>
                    <textarea
                      value={formData.descricao}
                      onChange={(e) =>
                        setFormData({ ...formData, descricao: e.target.value })
                      }
                      className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                        isDark
                          ? "bg-slate-700 border-slate-600 text-white focus:border-blue-500"
                          : "bg-white border-slate-300 text-slate-900 focus:border-blue-500"
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                      rows={3}
                      placeholder="Descrição da transação (opcional)"
                    />
                  </div>

                  {/* Anexar Comprovante */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDark ? "text-slate-300" : "text-slate-700"
                      }`}
                      style={{
                        fontFamily:
                          "var(--font-secondary, Open Sans, sans-serif)",
                      }}
                    >
                      Anexar
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors duration-200 ${
                        isDark
                          ? "border-slate-600 hover:border-slate-500"
                          : "border-slate-300 hover:border-slate-400"
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className={`cursor-pointer flex flex-col items-center gap-2 ${
                          isDark ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        <svg
                          className="w-8 h-8"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        {formData.anexo ? (
                          <span className="text-sm font-medium">
                            {formData.anexo.name}
                          </span>
                        ) : (
                          <span className="text-sm">
                            Clique para anexar comprovante
                          </span>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all duration-200 hover:scale-105 ${
                        isDark
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      } shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                      style={{
                        fontFamily:
                          "var(--font-primary, Montserrat, sans-serif)",
                      }}
                    >
                      {loading ? t("common.loading") : "Salvar"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Filtros */}
          <div
            className={`rounded-xl shadow-lg border transition-all duration-300 ${
              isDark
                ? "bg-slate-800/90 border-slate-700/30"
                : "bg-white border-slate-200/50"
            } p-6 mb-8`}
          >
            <h3
              className={`text-lg font-semibold mb-6 ${
                isDark ? "text-white" : "text-slate-900"
              }`}
              style={{
                fontFamily: "var(--font-primary, Montserrat, sans-serif)",
              }}
            >
              {t("common.filter")}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={`px-3 py-2 rounded-lg border transition-colors duration-200 ${
                  isDark
                    ? "bg-slate-700 border-slate-600 text-white"
                    : "bg-white border-slate-300 text-slate-900"
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                style={{
                  fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                }}
              >
                <option value="">Todos os tipos</option>
                <option value="Receita">
                  {t("transactions.transactionTypes.income")}
                </option>
                <option value="Despesa">
                  {t("transactions.transactionTypes.expense")}
                </option>
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className={`px-3 py-2 rounded-lg border transition-colors duration-200 ${
                  isDark
                    ? "bg-slate-700 border-slate-600 text-white"
                    : "bg-white border-slate-300 text-slate-900"
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                style={{
                  fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                }}
              >
                <option value="">Todas categorias</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.nome}
                  </option>
                ))}
              </select>

              <select
                value={filterAccount}
                onChange={(e) => setFilterAccount(e.target.value)}
                className={`px-3 py-2 rounded-lg border transition-colors duration-200 ${
                  isDark
                    ? "bg-slate-700 border-slate-600 text-white"
                    : "bg-white border-slate-300 text-slate-900"
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                style={{
                  fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                }}
              >
                <option value="">Todas contas</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.nome_banco}
                  </option>
                ))}
              </select>

              <select
                value={filterCard}
                onChange={(e) => setFilterCard(e.target.value)}
                className={`px-3 py-2 rounded-lg border transition-colors duration-200 ${
                  isDark
                    ? "bg-slate-700 border-slate-600 text-white"
                    : "bg-white border-slate-300 text-slate-900"
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                style={{
                  fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                }}
        >
          <option value="">Todos cartões</option>
                {cards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.nome_cartao}
            </option>
          ))}
        </select>

              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className={`px-3 py-2 rounded-lg border transition-colors duration-200 ${
                  isDark
                    ? "bg-slate-700 border-slate-600 text-white"
                    : "bg-white border-slate-300 text-slate-900"
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                style={{
                  fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                }}
                placeholder="Data inicial"
              />

              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className={`px-3 py-2 rounded-lg border transition-colors duration-200 ${
                  isDark
                    ? "bg-slate-700 border-slate-600 text-white"
                    : "bg-white border-slate-300 text-slate-900"
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                style={{
                  fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                }}
                placeholder="Data final"
              />
            </div>

            <div className="mt-4">
        <button
                onClick={clearFilters}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 ${
                  isDark
                    ? "bg-slate-600 hover:bg-slate-700 text-white"
                    : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                }`}
                style={{
                  fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
          }}
        >
          Limpar filtros
        </button>
      </div>
          </div>

          {/* Lista de Transações */}
          <div
            className={`rounded-xl shadow-lg border transition-all duration-300 ${
              isDark
                ? "bg-slate-800/90 border-slate-700/30"
                : "bg-white border-slate-200/50"
            } p-6`}
          >
            <div className="flex items-center justify-between mb-6">
              <h3
                className={`text-lg font-semibold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
                style={{
                  fontFamily: "var(--font-primary, Montserrat, sans-serif)",
                }}
              >
                Transações ({filteredTransactions.length})
              </h3>
            </div>

            {loading ? (
              <div
                className={`text-center py-8 transition-colors duration-300 ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
                style={{
                  fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                }}
              >
                {t("common.loading")}
              </div>
            ) : error ? (
              <div
                className={`text-center py-8 text-red-500`}
                style={{
                  fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                }}
              >
                {error}
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div
                className={`text-center py-8 transition-colors duration-300 ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
                style={{
                  fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                }}
              >
                {t("transactions.noTransactions")}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                      isDark
                        ? "bg-slate-700/30 border-slate-600/30 hover:bg-slate-700/50"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-lg ${
                            transaction.tipo === "Receita"
                              ? isDark
                                ? "bg-emerald-500/20"
                                : "bg-emerald-50"
                              : isDark
                              ? "bg-red-500/20"
                              : "bg-red-50"
                          }`}
                        >
                          <svg
                            className={`w-5 h-5 ${
                              transaction.tipo === "Receita"
                                ? "text-emerald-500"
                                : "text-red-500"
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            {transaction.tipo === "Receita" ? (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 11l5-5m0 0l5 5m-5-5v12"
                              />
                            ) : (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 13l-5 5m0 0l-5-5m5 5V6"
                              />
                            )}
                          </svg>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                <span
                              className={`font-bold text-lg ${
                                transaction.tipo === "Receita"
                                  ? "text-emerald-500"
                                  : "text-red-500"
                              }`}
                  style={{
                                fontFamily:
                                  "var(--font-primary, Montserrat, sans-serif)",
                              }}
                            >
                              R$ {Number(transaction.valor).toFixed(2)}
                </span>
                            <span
                              className={`text-sm px-2 py-1 rounded-full ${
                                transaction.tipo === "Receita"
                                  ? isDark
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : "bg-emerald-100 text-emerald-700"
                                  : isDark
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-red-100 text-red-700"
                              }`}
                              style={{
                                fontFamily:
                                  "var(--font-secondary, Open Sans, sans-serif)",
                              }}
                            >
                              {transaction.tipo}
                </span>
                          </div>

                          <div
                            className={`text-sm ${
                              isDark ? "text-slate-300" : "text-slate-700"
                            }`}
                            style={{
                              fontFamily:
                                "var(--font-secondary, Open Sans, sans-serif)",
                            }}
                          >
                            {transaction.descricao || "Sem descrição"}
                          </div>

                          <div
                            className={`text-xs mt-1 ${
                              isDark ? "text-slate-400" : "text-slate-500"
                            }`}
                            style={{
                              fontFamily:
                                "var(--font-secondary, Open Sans, sans-serif)",
                            }}
                          >
                            {new Date(
                              transaction.data_transacao
                            ).toLocaleDateString("pt-BR")}{" "}
                            • Categoria:{" "}
                            {getCategoryName(transaction.categoria_id)} • Conta:{" "}
                            {getAccountName(transaction.conta_bancaria_id)} •
                            Cartão: {getCardName(transaction.cartao_credito_id)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(transaction)}
                          className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                            isDark
                              ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                              : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                          }`}
                          title={t("common.edit")}
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
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>

                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                            isDark
                              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                              : "bg-red-50 text-red-600 hover:bg-red-100"
                          }`}
                          title={t("common.delete")}
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botão Flutuante + */}
          <button
            onClick={() => setShowTypeSelector(true)}
            className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 z-50 ${
              isDark
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
            style={{
              boxShadow: "0 4px 20px rgba(59, 130, 246, 0.4)",
            }}
          >
            <svg
              className="w-8 h-8 mx-auto"
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

          {/* Modal de Seleção de Tipo de Transação */}
          {showTypeSelector && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div
                className={`w-full max-w-md rounded-2xl shadow-2xl transition-all duration-300 ${
                  isDark
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-slate-200"
                } border p-6`}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3
                    className={`text-xl font-bold ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                    style={{
                      fontFamily: "var(--font-primary, Montserrat, sans-serif)",
                    }}
                  >
                    Nova Transação
                  </h3>
                  <button
                    onClick={() => setShowTypeSelector(false)}
                    className={`p-2 rounded-full transition-colors duration-200 ${
                      isDark
                        ? "hover:bg-slate-700 text-slate-400"
                        : "hover:bg-slate-100 text-slate-500"
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

                <div className="grid grid-cols-2 gap-4">
                  {/* Transferência */}
                  <button
                    onClick={() => openFormWithType("Transferencia")}
                    className={`p-4 rounded-xl border transition-all duration-200 hover:scale-105 ${
                      isDark
                        ? "bg-slate-700/50 border-slate-600 hover:bg-slate-700"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                        isDark ? "bg-cyan-500/20" : "bg-cyan-50"
                      }`}
                    >
                      <svg
                        className="w-6 h-6 text-cyan-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                        />
                      </svg>
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        isDark ? "text-slate-200" : "text-slate-800"
                      }`}
                      style={{
                        fontFamily:
                          "var(--font-secondary, Open Sans, sans-serif)",
                      }}
                    >
                      Transferência
                </span>
                  </button>

                  {/* Receita */}
                  <button
                    onClick={() => openFormWithType("Receita")}
                    className={`p-4 rounded-xl border transition-all duration-200 hover:scale-105 ${
                      isDark
                        ? "bg-slate-700/50 border-slate-600 hover:bg-slate-700"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
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
                    <span
                      className={`text-sm font-medium ${
                        isDark ? "text-slate-200" : "text-slate-800"
                      }`}
                      style={{
                        fontFamily:
                          "var(--font-secondary, Open Sans, sans-serif)",
                      }}
                    >
                      Nova receita
                </span>
                  </button>

                  {/* Despesa de Cartão */}
                  <button
                    onClick={() => openFormWithType("DespesaCartao")}
                    className={`p-4 rounded-xl border transition-all duration-200 hover:scale-105 ${
                      isDark
                        ? "bg-slate-700/50 border-slate-600 hover:bg-slate-700"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                        isDark ? "bg-purple-500/20" : "bg-purple-50"
                      }`}
                    >
                      <svg
                        className="w-6 h-6 text-purple-500"
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
                    <span
                      className={`text-sm font-medium ${
                        isDark ? "text-slate-200" : "text-slate-800"
                      }`}
                      style={{
                        fontFamily:
                          "var(--font-secondary, Open Sans, sans-serif)",
                      }}
                    >
                      Nova despesa cartão
                    </span>
                  </button>

                  {/* Despesa */}
                  <button
                    onClick={() => openFormWithType("Despesa")}
                    className={`p-4 rounded-xl border transition-all duration-200 hover:scale-105 ${
                      isDark
                        ? "bg-slate-700/50 border-slate-600 hover:bg-slate-700"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
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
                    <span
                      className={`text-sm font-medium ${
                        isDark ? "text-slate-200" : "text-slate-800"
                      }`}
                      style={{
                        fontFamily:
                          "var(--font-secondary, Open Sans, sans-serif)",
                      }}
                    >
                      Nova despesa
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
