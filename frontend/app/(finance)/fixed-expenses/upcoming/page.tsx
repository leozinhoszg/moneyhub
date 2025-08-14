// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";

export default function UpcomingFixedExpensesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/fixed-expenses/upcoming?days=${days}`,
      { credentials: "include" }
    );
    if (res.ok) {
      const data = await res.json();
      setItems(data.items ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [days]);

  return (
    <main className="space-y-4">
      <h2 className="title-2">Próximos Vencimentos</h2>
      <label className="flex items-center gap-2">
        Em até (dias):
        <input
          className="input w-20"
          type="number"
          min={1}
          max={60}
          value={days}
          onChange={(e) => setDays(Number(e.target.value) || 7)}
        />
      </label>
      {loading && <p className="muted">Carregando...</p>}
      <ul className="space-y-2">
        {items.map((i) => (
          <li key={`${i.id}-${i.vencimento}`} className="card">
            <div className="card-body">
              {i.vencimento}: {i.descricao} - R$ {Number(i.valor).toFixed(2)}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
