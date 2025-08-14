// @ts-nocheck
"use client";

import React, { FormEvent, useEffect, useState } from "react";

type Card = {
  id: number;
  nome_cartao: string;
  bandeira: string;
  limite: string;
  dia_fechamento_fatura: number;
  dia_vencimento_fatura: number;
};

export default function CardsPage() {
  const [items, setItems] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [nome_cartao, setNome] = useState("");
  const [bandeira, setBandeira] = useState("");
  const [limite, setLimite] = useState("0");
  const [dia_fechamento_fatura, setDiaFech] = useState(1);
  const [dia_vencimento_fatura, setDiaVenc] = useState(10);
  const [editId, setEditId] = useState<number | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editBandeira, setEditBandeira] = useState("");
  const [editLimite, setEditLimite] = useState("0");
  const [editFech, setEditFech] = useState(1);
  const [editVenc, setEditVenc] = useState(10);

  const load = async () => {
    setLoading(true);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cards`,
      {
        credentials: "include",
      }
    );
    if (res.ok) setItems(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cards`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          nome_cartao,
          bandeira,
          limite,
          dia_fechamento_fatura,
          dia_vencimento_fatura,
        }),
      }
    );
    if (res.ok) {
      setNome("");
      setBandeira("");
      setLimite("0");
      setDiaFech(1);
      setDiaVenc(10);
      await load();
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("Excluir cartão?")) return;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cards/${id}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );
    if (res.ok) await load();
  };

  return (
    <main className="space-y-6">
      <h2 className="title-2">Cartões de Crédito</h2>
      {loading && <p className="muted">Carregando...</p>}
      <ul className="space-y-2">
        {items.map((c) => (
          <li key={c.id} className="card">
            <div className="card-body">
              {editId === c.id ? (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    className="input"
                    value={editNome}
                    onChange={(e) => setEditNome(e.target.value)}
                    placeholder="Nome do Cartão"
                  />
                  <input
                    className="input"
                    value={editBandeira}
                    onChange={(e) => setEditBandeira(e.target.value)}
                    placeholder="Bandeira"
                  />
                  <input
                    className="input w-[120px]"
                    type="number"
                    step="0.01"
                    value={editLimite}
                    onChange={(e) => setEditLimite(e.target.value)}
                    placeholder="Limite"
                  />
                  <input
                    className="input w-[100px]"
                    type="number"
                    min={1}
                    max={28}
                    value={editFech}
                    onChange={(e) => setEditFech(Number(e.target.value))}
                    placeholder="Fechamento"
                  />
                  <input
                    className="input w-[100px]"
                    type="number"
                    min={1}
                    max={31}
                    value={editVenc}
                    onChange={(e) => setEditVenc(Number(e.target.value))}
                    placeholder="Vencimento"
                  />
                  <div className="ml-auto flex gap-2">
                    <button
                      className="btn btn-primary"
                      onClick={async () => {
                        await fetch(
                          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cards/${c.id}`,
                          {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({
                              nome_cartao: editNome,
                              bandeira: editBandeira,
                              limite: editLimite,
                              dia_fechamento_fatura: editFech,
                              dia_vencimento_fatura: editVenc,
                            }),
                          }
                        );
                        setEditId(null);
                        await load();
                      }}
                    >
                      Salvar
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setEditId(null)}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>
                    <span className="font-medium">{c.nome_cartao}</span> (
                    {c.bandeira}) - Limite R$ {Number(c.limite).toFixed(2)} |
                    Fech: {c.dia_fechamento_fatura} | Venc:{" "}
                    {c.dia_vencimento_fatura}
                  </span>
                  <div className="ml-auto flex gap-2">
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditId(c.id);
                        setEditNome(c.nome_cartao);
                        setEditBandeira(c.bandeira);
                        setEditLimite(String(c.limite));
                        setEditFech(c.dia_fechamento_fatura);
                        setEditVenc(c.dia_vencimento_fatura);
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => onDelete(c.id)}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      <h3 className="title-3">Novo Cartão</h3>
      <form onSubmit={onSubmit} className="grid gap-2 max-w-xl">
        <input
          className="input"
          placeholder="Nome do Cartão"
          value={nome_cartao}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        <input
          className="input"
          placeholder="Bandeira"
          value={bandeira}
          onChange={(e) => setBandeira(e.target.value)}
          required
        />
        <input
          className="input"
          type="number"
          step="0.01"
          placeholder="Limite"
          value={limite}
          onChange={(e) => setLimite(e.target.value)}
          required
        />
        <input
          className="input"
          type="number"
          min={1}
          max={28}
          placeholder="Dia de Fechamento"
          value={dia_fechamento_fatura}
          onChange={(e) => setDiaFech(Number(e.target.value))}
          required
        />
        <input
          className="input"
          type="number"
          min={1}
          max={31}
          placeholder="Dia de Vencimento"
          value={dia_vencimento_fatura}
          onChange={(e) => setDiaVenc(Number(e.target.value))}
          required
        />
        <button className="btn btn-primary" type="submit">
          Criar
        </button>
      </form>
    </main>
  );
}
