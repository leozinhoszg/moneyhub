"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

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
    <main className="space-y-6">
      <h2 className="title-2">Dashboard</h2>
      {summary ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="card">
            <div className="card-body">
              <div className="text-sm muted">Receita do mês</div>
              <div
                className="text-2xl font-semibold"
                style={{ color: "var(--color-secondary)" }}
              >
                R$ {Number(summary.receita_mes).toFixed(2)}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <div className="text-sm muted">Despesa do mês</div>
              <div
                className="text-2xl font-semibold"
                style={{ color: "var(--color-danger)" }}
              >
                R$ {Number(summary.despesa_mes).toFixed(2)}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <div className="text-sm muted">Saldo do mês</div>
              <div className="text-2xl font-semibold">
                R$ {Number(summary.saldo_mes).toFixed(2)}
                <Link
                  className="ml-2 underline"
                  style={{ color: "var(--color-primary)" }}
                  href={`/(finance)/transactions?tipo=${
                    Number(summary.saldo_mes) < 0 ? "Despesa" : "Receita"
                  }`}
                >
                  ver transações
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="muted">Carregando...</p>
      )}

      <h3 className="title-3">Saldos por conta</h3>
      <ul className="list-disc pl-5 space-y-1">
        {byAccount.map((a) => (
          <li key={a.id} className="">
            <span className="font-medium">{a.nome_banco}</span>: R${" "}
            {Number(a.saldo_atual).toFixed(2)}
          </li>
        ))}
      </ul>

      <h3 className="title-3">Despesas por categoria (mês)</h3>
      <div className="flex items-end gap-3 min-h-[120px]">
        {byCategory.map((c) => {
          const total = Number(c.total);
          const height = Math.min(
            100,
            Math.round((total / (byCategory[0]?.total || 1)) * 100) || 0
          );
          return (
            <div key={c.categoria} className="text-center">
              <div
                title={`R$ ${total.toFixed(2)}`}
                className="mx-auto w-6"
                style={{ height, background: "var(--color-danger)" }}
              />
              <div className="text-xs max-w-20">
                {c.categoria || "Sem categoria"}
              </div>
              <Link
                className="underline"
                style={{ color: "var(--color-primary)" }}
                href={`/(finance)/transactions?tipo=Despesa`}
              >
                ver
              </Link>
            </div>
          );
        })}
      </div>

      <h3 className="title-3">Fluxo diário (mês)</h3>
      <div
        className="grid grid-cols-31 gap-[2px]"
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
                  className="w-[6px]"
                  style={{
                    height: Math.round((rec / max) * 80),
                    background: "var(--color-secondary)",
                  }}
                />
                <div
                  title={`Despesas R$ ${des.toFixed(2)}`}
                  className="w-[6px]"
                  style={{
                    height: Math.round((des / max) * 80),
                    background: "var(--color-danger)",
                  }}
                />
              </div>
              <div className="text-[10px]">{d.data.split("-")[2]}</div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
