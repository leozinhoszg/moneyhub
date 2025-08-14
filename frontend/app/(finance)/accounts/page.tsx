"use client";

import { FormEvent, useEffect, useState } from "react";

type Account = {
  id: number;
  nome_banco: string;
  tipo_conta: string;
  saldo_inicial: string;
  saldo_atual: string;
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [nome_banco, setNomeBanco] = useState("");
  const [tipo_conta, setTipoConta] = useState("Corrente");
  const [saldo_inicial, setSaldoInicial] = useState("0");
  const [editId, setEditId] = useState<number | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editTipo, setEditTipo] = useState("Corrente");

  const load = async () => {
    setLoading(true);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/accounts`,
      { credentials: "include" }
    );
    if (res.ok) setAccounts(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/accounts`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ nome_banco, tipo_conta, saldo_inicial }),
      }
    );
    if (res.ok) {
      setNomeBanco("");
      setTipoConta("Corrente");
      setSaldoInicial("0");
      await load();
    }
  };

  return (
    <main className="space-y-6">
      <h2 className="title-2">Contas Bancárias</h2>
      {loading && <p className="muted">Carregando...</p>}
      <ul className="space-y-2">
        {accounts.map((a) => (
          <li key={a.id} className="card">
            <div className="card-body flex items-center justify-between gap-2">
              {editId === a.id ? (
                <span className="flex items-center gap-2 w-full">
                  <input
                    className="input"
                    value={editNome}
                    onChange={(e) => setEditNome(e.target.value)}
                  />
                  <select
                    className="select"
                    value={editTipo}
                    onChange={(e) => setEditTipo(e.target.value)}
                  >
                    <option>Corrente</option>
                    <option>Poupança</option>
                    <option>Investimento</option>
                  </select>
                  <div className="ml-auto flex gap-2">
                    <button
                      className="btn btn-primary"
                      onClick={async () => {
                        await fetch(
                          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/accounts/${a.id}`,
                          {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({
                              nome_banco: editNome,
                              tipo_conta: editTipo,
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
                </span>
              ) : (
                <span className="flex items-center gap-2 w-full">
                  <span>
                    <span className="font-medium">{a.nome_banco}</span> (
                    {a.tipo_conta}) - Saldo atual: R${" "}
                    {Number(a.saldo_atual).toFixed(2)}
                  </span>
                  <div className="ml-auto flex gap-2">
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditId(a.id);
                        setEditNome(a.nome_banco);
                        setEditTipo(a.tipo_conta);
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={async () => {
                        if (!confirm("Excluir conta?")) return;
                        await fetch(
                          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/accounts/${a.id}`,
                          { method: "DELETE", credentials: "include" }
                        );
                        await load();
                      }}
                    >
                      Excluir
                    </button>
                  </div>
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>

      <h3 className="title-3">Nova Conta</h3>
      <form onSubmit={onSubmit} className="grid gap-2 max-w-sm">
        <input
          className="input"
          placeholder="Nome do Banco"
          value={nome_banco}
          onChange={(e) => setNomeBanco(e.target.value)}
          required
        />
        <select
          className="select"
          value={tipo_conta}
          onChange={(e) => setTipoConta(e.target.value)}
        >
          <option>Corrente</option>
          <option>Poupança</option>
          <option>Investimento</option>
        </select>
        <input
          className="input"
          type="number"
          step="0.01"
          placeholder="Saldo Inicial"
          value={saldo_inicial}
          onChange={(e) => setSaldoInicial(e.target.value)}
          required
        />
        <button className="btn btn-primary" type="submit">
          Criar
        </button>
      </form>
    </main>
  );
}
