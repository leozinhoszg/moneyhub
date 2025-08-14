// @ts-nocheck
"use client";

import React, { FormEvent, useEffect, useState } from "react";

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

export default function FixedExpensesPage() {
  const [items, setItems] = useState<FixedExpense[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [contas, setContas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("0");
  const [dia_vencimento, setDia] = useState(1);
  const [categoria_id, setCategoria] = useState<number | undefined>(undefined);
  const [conta_bancaria_id, setConta] = useState<number | undefined>(undefined);
  const [cartao_credito_id, setCartao] = useState<number | undefined>(
    undefined
  );
  const [lembrete, setLembrete] = useState(true);

  const load = async () => {
    setLoading(true);
    const [fx, cats, accs] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/fixed-expenses`, {
        credentials: "include",
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories`, {
        credentials: "include",
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/accounts`, {
        credentials: "include",
      }),
    ]);
    if (fx.ok) setItems(await fx.json());
    if (cats.ok) setCategorias(await cats.json());
    if (accs.ok) setContas(await accs.json());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/fixed-expenses`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          descricao,
          valor,
          dia_vencimento,
          categoria_id: categoria_id ?? null,
          conta_bancaria_id: conta_bancaria_id ?? null,
          cartao_credito_id: cartao_credito_id ?? null,
          lembrete_ativado: lembrete,
        }),
      }
    );
    if (res.ok) {
      setDescricao("");
      setValor("0");
      setDia(1);
      setCategoria(undefined);
      setConta(undefined);
      setCartao(undefined);
      await load();
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("Excluir gasto fixo?")) return;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/fixed-expenses/${id}`,
      { method: "DELETE", credentials: "include" }
    );
    if (res.ok) await load();
  };

  const onRunToday = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/fixed-expenses/run`,
      { method: "POST", credentials: "include" }
    );
    if (res.ok) {
      const data = await res.json();
      alert(`Executados: ${data.executados}`);
    }
  };

  return (
    <main className="space-y-6">
      <h2 className="title-2">Gastos Fixos</h2>
      <button className="btn btn-secondary" onClick={onRunToday}>
        Executar hoje
      </button>
      {loading && <p className="muted">Carregando...</p>}
      <ul className="space-y-2">
        {items.map((i) => (
          <li key={i.id} className="card">
            <div className="card-body flex items-center gap-2">
              <span>
                Dia {i.dia_vencimento}:{" "}
                <span className="font-medium">{i.descricao}</span> - R${" "}
                <span style={{ color: "var(--color-danger)" }}>
                  {Number(i.valor).toFixed(2)}
                </span>{" "}
                | lembrete: {i.lembrete_ativado ? "Ativo" : "Inativo"}
                {i.ultimo_lancamento ? ` | último: ${i.ultimo_lancamento}` : ""}
              </span>
              <button
                className="btn btn-danger ml-auto"
                onClick={() => onDelete(i.id)}
              >
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>

      <h3 className="title-3">Novo Gasto Fixo</h3>
      <form onSubmit={onSubmit} className="grid gap-2 max-w-2xl">
        <input
          className="input"
          placeholder="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          required
        />
        <input
          className="input"
          type="number"
          step="0.01"
          placeholder="Valor"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          required
        />
        <input
          className="input"
          type="number"
          min={1}
          max={31}
          placeholder="Dia de vencimento"
          value={dia_vencimento}
          onChange={(e) => setDia(Number(e.target.value))}
          required
        />
        <select
          className="select"
          value={categoria_id ?? ""}
          onChange={(e) =>
            setCategoria(e.target.value ? Number(e.target.value) : undefined)
          }
        >
          <option value="">Sem categoria</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome} ({c.tipo})
            </option>
          ))}
        </select>
        <select
          className="select"
          value={conta_bancaria_id ?? ""}
          onChange={(e) =>
            setConta(e.target.value ? Number(e.target.value) : undefined)
          }
        >
          <option value="">Sem conta</option>
          {contas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nome_banco}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2 pt-2">
          <input
            className="checkbox"
            type="checkbox"
            checked={lembrete}
            onChange={(e) => setLembrete(e.target.checked)}
          />
          <span>Ativar lembrete de vencimento</span>
        </div>
        <button className="btn btn-primary" type="submit">
          Criar
        </button>
      </form>
    </main>
  );
}
