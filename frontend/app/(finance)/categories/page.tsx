// @ts-nocheck
"use client";

import React, { FormEvent, useEffect, useState } from "react";

type Category = {
  id: number;
  nome: string;
  tipo: string;
};

export default function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("Despesa");

  const load = async () => {
    setLoading(true);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories`,
      { credentials: "include" }
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
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ nome, tipo }),
      }
    );
    if (res.ok) {
      setNome("");
      setTipo("Despesa");
      await load();
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("Excluir categoria?")) return;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories/${id}`,
      { method: "DELETE", credentials: "include" }
    );
    if (res.ok) await load();
  };

  return (
    <main className="space-y-6">
      <h2 className="title-2">Categorias</h2>
      {loading && <p className="muted">Carregando...</p>}
      <ul className="space-y-2">
        {items.map((c) => (
          <li key={c.id} className="card">
            <div className="card-body flex items-center justify-between">
              <span>
                <span className="font-medium">{c.nome}</span> ({c.tipo})
              </span>
              <button className="btn btn-danger" onClick={() => onDelete(c.id)}>
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>

      <h3 className="title-3">Nova Categoria</h3>
      <form onSubmit={onSubmit} className="grid gap-2 max-w-sm">
        <input
          className="input"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        <select
          className="select"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <option>Despesa</option>
          <option>Receita</option>
        </select>
        <button className="btn btn-primary" type="submit">
          Criar
        </button>
      </form>
    </main>
  );
}
