"use client";

import React, { FormEvent, useState } from "react";
import { login } from "@/app/api/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login({ email, senha });
      window.location.href = "/dashboard";
    } catch (e: any) {
      setError(e?.message ?? "Falha no login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="space-y-4 max-w-md mx-auto">
      <h2 className="title-2">Login</h2>
      <form onSubmit={onSubmit} className="grid gap-2">
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
          {loading ? "Entrando..." : "Entrar"}
        </button>
        {error && <p className="text-danger">{error}</p>}
      </form>
    </main>
  );
}
