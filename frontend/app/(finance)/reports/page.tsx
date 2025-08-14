// @ts-nocheck
"use client";

import React, { FormEvent, useState } from "react";

export default function ReportsPage() {
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");

  const download = async (type: "csv" | "pdf") => {
    const params = new URLSearchParams();
    if (start) params.set("start_date", start);
    if (end) params.set("end_date", end);
    const url = `${
      process.env.NEXT_PUBLIC_API_BASE_URL
    }/api/reports/transactions.${type}?${params.toString()}`;
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) return alert("Falha ao gerar relatório");
    const blob = await res.blob();
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `transacoes.${type}`;
    link.click();
  };

  return (
    <main className="space-y-4">
      <h2 className="title-2">Relatórios</h2>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2">
          Início:
          <input
            className="input"
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </label>
        <label className="flex items-center gap-2">
          Fim:
          <input
            className="input"
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </label>
        <button className="btn btn-secondary" onClick={() => download("csv")}>
          Baixar CSV
        </button>
        <button className="btn btn-primary" onClick={() => download("pdf")}>
          Baixar PDF
        </button>
      </div>
    </main>
  );
}
