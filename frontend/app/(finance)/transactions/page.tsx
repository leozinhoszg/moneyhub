// @ts-nocheck
"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type Tx = {
  id: number;
  tipo: string;
  valor: string;
  data_transacao: string;
  descricao?: string | null;
  categoria_id?: number | null;
  conta_bancaria_id?: number | null;
  cartao_credito_id?: number | null;
};

export const dynamic = "force-dynamic";

export default function TransactionsPage() {
  return (
    <Suspense
      fallback={
        <main className="space-y-4">
          <h2 className="title-2">Transações</h2>
          <p className="muted">Carregando filtros...</p>
        </main>
      }
    >
      <TransactionsPageInner />
    </Suspense>
  );
}

function TransactionsPageInner() {
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [tipo, setTipo] = useState<string | "">("");
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [categoriaId, setCategoriaId] = useState<number | "">("");
  const [contaId, setContaId] = useState<number | "">("");
  const [cartaoId, setCartaoId] = useState<number | "">("");

  const [categorias, setCategorias] = useState<any[]>([]);
  const [contas, setContas] = useState<any[]>([]);
  const [cartoes, setCartoes] = useState<any[]>([]);
  const search = useSearchParams();
  const router = useRouter();

  const totalAmount = useMemo(
    () => txs.reduce((acc, t) => acc + Number(t.valor), 0),
    [txs]
  );

  useEffect(() => {
    // inicializa filtros a partir da URL
    const sTipo = search.get("tipo");
    const sStart = search.get("start_date");
    const sEnd = search.get("end_date");
    const sCat = search.get("categoria_id");
    const sAcc = search.get("conta_id");
    const sCard = search.get("cartao_id");
    if (sTipo) setTipo(sTipo);
    if (sStart) setStart(sStart);
    if (sEnd) setEnd(sEnd);
    if (sCat) setCategoriaId(Number(sCat));
    if (sAcc) setContaId(Number(sAcc));
    if (sCard) setCartaoId(Number(sCard));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // sincronia filtros -> URL
    const params = new URLSearchParams();
    if (tipo) params.set("tipo", tipo);
    if (start) params.set("start_date", start);
    if (end) params.set("end_date", end);
    if (categoriaId) params.set("categoria_id", String(categoriaId));
    if (contaId) params.set("conta_id", String(contaId));
    if (cartaoId) params.set("cartao_id", String(cartaoId));
    router.replace(`?${params.toString()}`);
  }, [tipo, start, end, categoriaId, contaId, cartaoId, router]);
  useEffect(() => {
    // Carrega listas auxiliares para filtros e exibição de nomes
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

  useEffect(() => {
    const fetchTxs = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("page_size", String(pageSize));
        if (tipo) params.set("tipo", tipo);
        if (start) params.set("start_date", start);
        if (end) params.set("end_date", end);
        if (categoriaId) params.append("categoria_ids", String(categoriaId));
        if (contaId) params.append("conta_ids", String(contaId));
        if (cartaoId) params.append("cartao_ids", String(cartaoId));
        const res = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_BASE_URL
          }/api/transactions?${params.toString()}`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error("Falha ao carregar transações");
        const data = await res.json();
        if (Array.isArray(data)) {
          setTxs(data);
          setTotal(data.length);
        } else {
          setTxs(data.items ?? []);
          setTotal(data.total ?? 0);
        }
      } catch (e: any) {
        setError(e?.message ?? "Erro");
      } finally {
        setLoading(false);
      }
    };
    fetchTxs();
  }, [page, pageSize, tipo, start, end, categoriaId, contaId, cartaoId]);

  return (
    <main className="space-y-4" suppressHydrationWarning>
      <h2 className="title-2">Transações</h2>
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <select
          className="select max-w-[160px]"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="Receita">Receita</option>
          <option value="Despesa">Despesa</option>
        </select>
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
        <label className="flex items-center gap-2">
          Página:
          <input
            className="input w-[60px]"
            type="number"
            min={1}
            value={page}
            onChange={(e) => setPage(Number(e.target.value) || 1)}
          />
        </label>
        <label className="flex items-center gap-2">
          Tamanho:
          <input
            className="input w-[60px]"
            type="number"
            min={1}
            max={200}
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value) || 20)}
          />
        </label>
        <select
          className="select"
          value={categoriaId}
          onChange={(e) =>
            setCategoriaId(e.target.value ? Number(e.target.value) : "")
          }
        >
          <option value="">Todas categorias</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome} ({c.tipo})
            </option>
          ))}
        </select>
        <select
          className="select"
          value={contaId}
          onChange={(e) =>
            setContaId(e.target.value ? Number(e.target.value) : "")
          }
        >
          <option value="">Todas contas</option>
          {contas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nome_banco}
            </option>
          ))}
        </select>
        <select
          className="select"
          value={cartaoId}
          onChange={(e) =>
            setCartaoId(e.target.value ? Number(e.target.value) : "")
          }
        >
          <option value="">Todos cartões</option>
          {cartoes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome_cartao}
            </option>
          ))}
        </select>
        <button
          className="btn btn-secondary"
          onClick={() => {
            setTipo("");
            setStart("");
            setEnd("");
            setCategoriaId("");
            setContaId("");
            setCartaoId("");
            setPage(1);
          }}
        >
          Limpar filtros
        </button>
      </div>
      {loading && <p className="muted">Carregando...</p>}
      {error && <p className="text-danger">{error}</p>}
      <p>
        Totais: página {txs.length} | geral {total}
      </p>
      <p>Somatório exibido: {totalAmount.toFixed(2)}</p>
      <ul className="space-y-2">
        {txs.map((t) => (
          <li key={t.id} className="card">
            <div className="card-body">
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="font-medium">{t.data_transacao}</span>
                <span
                  style={{
                    color:
                      t.tipo === "Receita"
                        ? "var(--color-secondary)"
                        : "var(--color-danger)",
                  }}
                >
                  {t.tipo}
                </span>
                <span>R$ {Number(t.valor).toFixed(2)}</span>
                <span className="muted">{t.descricao ?? ""}</span>
                <span>
                  | categoria:{" "}
                  {t.categoria_id
                    ? categorias.find((c) => c.id === t.categoria_id)?.nome ??
                      t.categoria_id
                    : "-"}
                </span>
                <span>
                  | conta:{" "}
                  {t.conta_bancaria_id
                    ? contas.find((a) => a.id === t.conta_bancaria_id)
                        ?.nome_banco ?? t.conta_bancaria_id
                    : "-"}
                </span>
                <span>
                  | cartão:{" "}
                  {t.cartao_credito_id
                    ? cartoes.find((c) => c.id === t.cartao_credito_id)
                        ?.nome_cartao ?? t.cartao_credito_id
                    : "-"}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
