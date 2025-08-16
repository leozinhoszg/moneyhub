"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/hooks/useTranslation";

type Summary = {
  receita_mes: string;
  despesa_mes: string;
  saldo_mes: string;
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [byAccount, setByAccount] = useState<any[]>([]);
  const [byCategory, setByCategory] = useState<any[]>([]);
  const [daily, setDaily] = useState<any[]>([]);
  const { isDark, mounted } = useTheme();
  const { t } = useTranslation();

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
    };
    fetchSummary();
  }, []);

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
            className={`text-2xl sm:text-3xl font-bold mb-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}
            style={{
              fontFamily: "var(--font-primary, Montserrat, sans-serif)",
            }}
          >
            {t('dashboard.goodAfternoon')}, {summary ? 'Leonardo' : t('dashboard.user')}! 👋
          </h1>
          <p className={`text-sm sm:text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
             style={{
               fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
             }}>
            {t('dashboard.financeSummary')}
          </p>
        </div>

        {summary ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            <div
              className={`rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                isDark
                  ? "bg-slate-800/90 border-slate-700/30"
                  : "bg-white border-slate-200/50"
              } p-6`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${
                  isDark ? "bg-emerald-500/20" : "bg-emerald-50"
                }`}>
                  <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                </div>
                <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                  isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700"
                }`}>
                  +12.5%
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
                {t('dashboard.monthlyIncome')}
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
                <div className={`p-3 rounded-lg ${
                  isDark ? "bg-red-500/20" : "bg-red-50"
                }`}>
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                  </svg>
                </div>
                <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                  isDark ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-700"
                }`}>
                  -8.2%
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
                {t('dashboard.monthlyExpenses')}
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
                <div className={`p-3 rounded-lg ${
                  Number(summary.saldo_mes) >= 0 
                    ? (isDark ? "bg-emerald-500/20" : "bg-emerald-50")
                    : (isDark ? "bg-red-500/20" : "bg-red-50")
                }`}>
                  <svg className={`w-6 h-6 ${
                    Number(summary.saldo_mes) >= 0 ? "text-emerald-500" : "text-red-500"
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <Link
                  className={`text-xs font-medium px-3 py-1 rounded-full transition-all duration-200 hover:scale-105 ${
                    isDark ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                  href={`/(finance)/transactions?tipo=${
                    Number(summary.saldo_mes) < 0 ? "Despesa" : "Receita"
                  }`}
                >
                  {t('dashboard.viewDetails')}
                </Link>
              </div>
              <div
                className={`text-sm font-medium mb-1 ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
                style={{
                  fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                }}
              >
                {t('dashboard.currentBalance')}
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
        ) : (
          <div
            className={`text-center py-8 transition-colors duration-300 ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
            style={{
              fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
            }}
          >
            {t('dashboard.loading')}
          </div>
        )}

        <div
          className={`rounded-xl shadow-lg border transition-all duration-300 ${
            isDark
              ? "bg-slate-800/90 border-slate-700/30"
              : "bg-white border-slate-200/50"
          } p-6 mb-8`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                isDark ? "bg-blue-500/20" : "bg-blue-50"
              }`}>
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
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
                {t('dashboard.myAccounts')}
              </h3>
            </div>
            <span className={`text-sm ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}>
              {byAccount.length} {byAccount.length === 1 ? t('dashboard.account') : t('dashboard.accounts')}
            </span>
          </div>
          <div className="space-y-4">
            {byAccount.map((a, index) => (
              <div key={a.id} className={`flex items-center justify-between p-4 rounded-lg transition-all duration-200 hover:scale-[1.02] ${
                isDark ? "bg-slate-700/30 hover:bg-slate-700/50" : "bg-slate-50 hover:bg-slate-100"
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm`}
                       style={{ backgroundColor: `hsl(${index * 137.5}, 70%, 50%)` }}>
                    {a.nome_banco.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span
                      className={`font-medium block ${
                        isDark ? "text-slate-200" : "text-slate-800"
                      }`}
                      style={{
                        fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                      }}
                    >
                      {a.nome_banco}
                    </span>
                    <span className={`text-xs ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}>
                      {t('dashboard.checkingAccount')}
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
                      fontFamily: "var(--font-primary, Montserrat, sans-serif)",
                    }}
                  >
                    R$ {Number(a.saldo_atual).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className={`rounded-xl shadow-lg border transition-all duration-300 ${
            isDark
              ? "bg-slate-800/90 border-slate-700/30"
              : "bg-white border-slate-200/50"
          } p-6 mb-8`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                isDark ? "bg-purple-500/20" : "bg-purple-50"
              }`}>
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
                {t('dashboard.expensesByCategory')}
              </h3>
            </div>
            <Link
              className={`text-xs font-medium px-3 py-1 rounded-full transition-all duration-200 hover:scale-105 ${
                isDark ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
              href={`/(finance)/transactions?tipo=Despesa`}
            >
              {t('dashboard.viewAll')}
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {byCategory.slice(0, 8).map((c, index) => {
              const total = Number(c.total);
              const maxTotal = Math.max(...byCategory.map(cat => Number(cat.total)));
              const percentage = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
              const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500'];
              return (
                <div key={c.categoria} className={`p-4 rounded-lg transition-all duration-200 hover:scale-105 ${
                  isDark ? "bg-slate-700/30 hover:bg-slate-700/50" : "bg-slate-50 hover:bg-slate-100"
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                    <span className={`text-xs font-medium ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}>
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div
                    className={`text-sm font-medium mb-1 ${
                      isDark ? "text-slate-200" : "text-slate-800"
                    }`}
                    style={{
                      fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                    }}
                  >
                    {c.categoria || t('dashboard.others')}
                  </div>
                  <div
                    className={`text-lg font-bold ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                    style={{
                      fontFamily: "var(--font-primary, Montserrat, sans-serif)",
                    }}
                  >
                    R$ {total.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className={`rounded-xl shadow-lg border transition-all duration-300 ${
            isDark
              ? "bg-slate-800/90 border-slate-700/30"
              : "bg-white border-slate-200/50"
          } p-6`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                isDark ? "bg-indigo-500/20" : "bg-indigo-50"
              }`}>
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
                {t('dashboard.dailyFlow')}
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className={isDark ? "text-slate-400" : "text-slate-600"}>{t('dashboard.income')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className={isDark ? "text-slate-400" : "text-slate-600"}>{t('dashboard.expenses')}</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="flex items-end justify-between gap-1 h-32 overflow-x-auto pb-4">
              {daily.slice(0, 15).map((d, index) => {
                const rec = Number(d.receitas);
                const des = Number(d.despesas);
                const maxValue = Math.max(...daily.map(day => Math.max(Number(day.receitas), Number(day.despesas))));
                const recHeight = maxValue > 0 ? (rec / maxValue) * 100 : 0;
                const desHeight = maxValue > 0 ? (des / maxValue) * 100 : 0;
                return (
                  <div key={d.data} className="flex flex-col items-center min-w-[20px] group">
                    <div className="flex items-end gap-1 h-24 mb-2">
                      <div
                        title={`Receitas: R$ ${rec.toFixed(2)}`}
                        className="w-2 bg-emerald-500 rounded-t-sm transition-all duration-200 group-hover:bg-emerald-400"
                        style={{
                          height: `${recHeight}%`,
                          minHeight: rec > 0 ? '4px' : '0px'
                        }}
                      />
                      <div
                        title={`Despesas: R$ ${des.toFixed(2)}`}
                        className="w-2 bg-red-500 rounded-t-sm transition-all duration-200 group-hover:bg-red-400"
                        style={{
                          height: `${desHeight}%`,
                          minHeight: des > 0 ? '4px' : '0px'
                        }}
                      />
                    </div>
                    <div
                      className={`text-[10px] font-medium transition-colors duration-300 ${
                        isDark ? "text-slate-400 group-hover:text-slate-300" : "text-slate-600 group-hover:text-slate-800"
                      }`}
                      style={{
                        fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                      }}
                    >
                      {d.data.split("-")[2]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
