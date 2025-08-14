// @ts-nocheck
"use client";

import React, { FormEvent, useEffect, useState } from "react";

export default function NewTransactionPage() {
  const [tipo, setTipo] = useState("Despesa");
  const [valor, setValor] = useState("0");
  const [data, setData] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [descricao, setDescricao] = useState("");
  const [categoria_id, setCategoria] = useState<number | undefined>(undefined);
  const [conta_bancaria_id, setConta] = useState<number | undefined>(undefined);
  const [cartao_credito_id, setCartao] = useState<number | undefined>(
    undefined
  );

  const [categorias, setCategorias] = useState<any[]>([]);
  const [contas, setContas] = useState<any[]>([]);
  const [cartoes, setCartoes] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories`, {
        credentials: "include",
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/accounts`, {
        credentials: "include",
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cards`, {
        credentials: "include",
      }),
    ]).then(async ([cats, accs, cards]) => {
      if (cats.ok) setCategorias(await cats.json());
      if (accs.ok) setContas(await accs.json());
      if (cards.ok) setCartoes(await cards.json());
    });
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/transactions`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          tipo,
          valor,
          data_transacao: new Date(data).toISOString(),
          descricao,
          categoria_id: categoria_id ?? null,
          conta_bancaria_id: conta_bancaria_id ?? null,
          cartao_credito_id: cartao_credito_id ?? null,
        }),
      }
    );
    if (res.ok) {
      setValor("0");
      setDescricao("");
    }
  };

  return (
    <main className="space-y-4">
      <h2 className="title-2">Nova Transação</h2>
      <form onSubmit={onSubmit} className="grid gap-2 max-w-lg">
        <select
          className="select"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <option>Despesa</option>
          <option>Receita</option>
        </select>
        <input
          className="input"
          type="number"
          step="0.01"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          required
        />
        <input
          className="input"
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          required
        />
        <input
          className="input"
          placeholder="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
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
        <select
          className="select"
          value={cartao_credito_id ?? ""}
          onChange={(e) =>
            setCartao(e.target.value ? Number(e.target.value) : undefined)
          }
        >
          <option value="">Sem cartão</option>
          {cartoes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome_cartao}
            </option>
          ))}
        </select>
        <button className="btn btn-primary" type="submit">
          Adicionar
        </button>
      </form>
    </main>
  );
}
