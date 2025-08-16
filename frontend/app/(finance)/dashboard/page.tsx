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
    <div className="px-2 sm:px-4 lg:px-6 space-y-6 pt-8">
      <div
        className={`transition-all duration-1000 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <h2
          className={`text-3xl font-bold mb-6 transition-colors duration-300 max-w-6xl mx-auto`}
          style={{
            fontFamily: "var(--font-primary, Montserrat, sans-serif)",
            color: isDark ? "#00cc66" : "#0f172a", // brand green on dark, slate-800 on light
          }}
        >
          {t("dashboard.title")}
        </h2>

        {summary ? (
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8 sm:grid-cols-2 lg:grid-cols-3 mb-8 relative z-1 max-w-6xl mx-auto">
            <div
              className={`rounded-2xl shadow-xl border backdrop-blur-xl transition-all duration-300 relative z-1 ${
                isDark
                  ? "bg-slate-800/80 border-slate-700/50"
                  : "bg-white/90 border-slate-200/50"
              } p-6`}
              style={{ borderColor: "#00cc66", borderWidth: "1px" }}
            >
              <div
                className={`text-sm font-medium mb-2 transition-colors duration-300 ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
                style={{
                  fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                }}
              >
                {t("dashboard.monthlyIncome")}
              </div>
              <div
                className="text-2xl font-bold"
                style={{
                  color: "#00cc66",
                  fontFamily: "var(--font-primary, Montserrat, sans-serif)",
                }}
              >
                R$ {Number(summary.receita_mes).toFixed(2)}
              </div>
            </div>

            <div
              className={`rounded-2xl shadow-xl border backdrop-blur-xl transition-all duration-300 relative z-1 ${
                isDark
                  ? "bg-slate-800/80 border-slate-700/50"
                  : "bg-white/90 border-slate-200/50"
              } p-6`}
              style={{ borderColor: "#00cc66", borderWidth: "1px" }}
            >
              <div
                className={`text-sm font-medium mb-2 transition-colors duration-300 ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
                style={{
                  fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                }}
              >
                Despesa do mês
              </div>
              <div
                className="text-2xl font-bold"
                style={{
                  color: "#ef4444",
                  fontFamily: "var(--font-primary, Montserrat, sans-serif)",
                }}
              >
                R$ {Number(summary.despesa_mes).toFixed(2)}
              </div>
            </div>

            <div
              className={`rounded-2xl shadow-xl border backdrop-blur-xl transition-all duration-300 relative z-1 ${
                isDark
                  ? "bg-slate-800/80 border-slate-700/50"
                  : "bg-white/90 border-slate-200/50"
              } p-6`}
              style={{ borderColor: "#00cc66", borderWidth: "1px" }}
            >
              <div
                className={`text-sm font-medium mb-2 transition-colors duration-300 ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
                style={{
                  fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                }}
              >
                Saldo do mês
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`text-2xl font-bold transition-colors duration-300 ${
                    isDark ? "text-white" : "text-slate-800"
                  }`}
                  style={{
                    fontFamily: "var(--font-primary, Montserrat, sans-serif)",
                  }}
                >
                  R$ {Number(summary.saldo_mes).toFixed(2)}
                </div>
                <Link
                  className="text-sm underline hover:no-underline transition-all duration-200"
                  style={{ color: "#013a56" }}
                  href={`/(finance)/transactions?tipo=${
                    Number(summary.saldo_mes) < 0 ? "Despesa" : "Receita"
                  }`}
                >
                  ver transações
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`text-center py-8 transition-colors duration-300 max-w-6xl mx-auto ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
            style={{
              fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
            }}
          >
            Carregando...
          </div>
        )}

        <div
          className={`rounded-2xl shadow-xl border backdrop-blur-xl transition-all duration-300 relative z-1 max-w-6xl mx-auto ${
            isDark
              ? "bg-slate-800/80 border-slate-700/50"
              : "bg-white/90 border-slate-200/50"
          } p-6 mb-6`}
          style={{ borderColor: "#00cc66", borderWidth: "1px" }}
        >
          <h3
            className={`text-xl font-bold mb-4 transition-colors duration-300 ${
              isDark ? "text-white" : "text-slate-800"
            }`}
            style={{
              fontFamily: "var(--font-primary, Montserrat, sans-serif)",
            }}
          >
            Saldos por conta
          </h3>
          <ul className="space-y-3">
            {byAccount.map((a) => (
              <li key={a.id} className="flex justify-between items-center">
                <span
                  className={`font-medium transition-colors duration-300 ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                  style={{
                    fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                  }}
                >
                  {a.nome_banco}
                </span>
                <span
                  className={`font-bold transition-colors duration-300 ${
                    isDark ? "text-white" : "text-slate-800"
                  }`}
                  style={{
                    fontFamily: "var(--font-primary, Montserrat, sans-serif)",
                  }}
                >
                  R$ {Number(a.saldo_atual).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div
          className={`rounded-2xl shadow-xl border backdrop-blur-xl transition-all duration-300 relative z-1 max-w-6xl mx-auto ${
            isDark
              ? "bg-slate-800/80 border-slate-700/50"
              : "bg-white/90 border-slate-200/50"
          } p-6 mb-6`}
          style={{ borderColor: "#00cc66", borderWidth: "1px" }}
        >
          <h3
            className={`text-xl font-bold mb-4 transition-colors duration-300 ${
              isDark ? "text-white" : "text-slate-800"
            }`}
            style={{
              fontFamily: "var(--font-primary, Montserrat, sans-serif)",
            }}
          >
            Despesas por categoria (mês)
          </h3>
          <div className="flex items-end gap-3 min-h-[120px] overflow-x-auto">
            {byCategory.map((c) => {
              const total = Number(c.total);
              const height = Math.min(
                100,
                Math.round((total / (byCategory[0]?.total || 1)) * 100) || 0
              );
              return (
                <div key={c.categoria} className="text-center min-w-[60px]">
                  <div
                    title={`R$ ${total.toFixed(2)}`}
                    className="mx-auto w-6 rounded-t-md transition-all duration-300"
                    style={{
                      height: `${height}px`,
                      background: "linear-gradient(to top, #ef4444, #f87171)",
                    }}
                  />
                  <div
                    className={`text-xs mt-2 transition-colors duration-300 ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                    style={{
                      fontFamily:
                        "var(--font-secondary, Open Sans, sans-serif)",
                    }}
                  >
                    {c.categoria || "Sem categoria"}
                  </div>
                  <Link
                    className="text-xs underline hover:no-underline transition-all duration-200"
                    style={{ color: "#013a56" }}
                    href={`/(finance)/transactions?tipo=Despesa`}
                  >
                    ver
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className={`rounded-2xl shadow-xl border backdrop-blur-xl transition-all duration-300 relative z-1 max-w-6xl mx-auto ${
            isDark
              ? "bg-slate-800/80 border-slate-700/50"
              : "bg-white/90 border-slate-200/50"
          } p-6`}
          style={{ borderColor: "#00cc66", borderWidth: "0.25px" }}
        >
          <h3
            className={`text-xl font-bold mb-4 transition-colors duration-300 ${
              isDark ? "text-white" : "text-slate-800"
            }`}
            style={{
              fontFamily: "var(--font-primary, Montserrat, sans-serif)",
            }}
          >
            Fluxo diário (mês)
          </h3>
          <div
            className="grid gap-[2px] overflow-x-auto"
            style={{ gridTemplateColumns: "repeat(31, 1fr)" }}
          >
            {daily.map((d) => {
              const rec = Number(d.receitas);
              const des = Number(d.despesas);
              const max = Math.max(rec, des, 1);
              return (
                <div key={d.data} className="flex flex-col items-center">
                  <div className="flex items-end h-20 gap-[2px]">
                    <div
                      title={`Receitas R$ ${rec.toFixed(2)}`}
                      className="w-[6px] rounded-t-sm"
                      style={{
                        height: Math.round((rec / max) * 80),
                        background: "linear-gradient(to top, #00cc66, #10b981)",
                      }}
                    />
                    <div
                      title={`Despesas R$ ${des.toFixed(2)}`}
                      className="w-[6px] rounded-t-sm"
                      style={{
                        height: Math.round((des / max) * 80),
                        background: "linear-gradient(to top, #ef4444, #f87171)",
                      }}
                    />
                  </div>
                  <div
                    className={`text-[10px] mt-1 transition-colors duration-300 ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                    style={{
                      fontFamily:
                        "var(--font-secondary, Open Sans, sans-serif)",
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
  );
}
