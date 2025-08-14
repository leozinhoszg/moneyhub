"use client";

import React, { FormEvent, useState } from "react";
import { register } from "@/app/api/auth";

export default function RegisterPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register({ nome, email, senha });
      window.location.href = "/dashboard";
    } catch (e: any) {
      setError(e?.message ?? "Falha no registro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="space-y-4 max-w-md mx-auto">
      <h2 className="title-2">Registrar</h2>
      <form onSubmit={onSubmit} className="grid gap-2">
        <input
          className="input"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        <input
          className="input"
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="input"
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Criando..." : "Criar conta"}
        </button>
        {error && <p className="text-danger">{error}</p>}
      </form>
    </main>
  );
}
