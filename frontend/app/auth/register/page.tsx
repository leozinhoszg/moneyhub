"use client";

import React, { FormEvent, useState, useEffect } from "react";
import {
  register,
  registerWithGoogle,
  checkEmailAvailability,
  validatePassword,
} from "@/app/api/auth";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<any>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const router = useRouter();

  // Verificar se já está logado
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { checkAuthStatus } = await import("@/app/api/auth");
        const status = await checkAuthStatus();
        if (status.authenticated) {
          router.push("/dashboard");
        }
      } catch (error) {
        // Usuário não está logado, continuar na página
      }
    };
    checkAuth();
  }, [router]);

  // Verificar disponibilidade do email
  useEffect(() => {
    const checkEmail = async () => {
      if (email && email.includes("@")) {
        setIsCheckingEmail(true);
        try {
          const result = await checkEmailAvailability(email);
          setEmailAvailable(result.available);
        } catch (error) {
          setEmailAvailable(null);
        } finally {
          setIsCheckingEmail(false);
        }
      } else {
        setEmailAvailable(null);
      }
    };

    const timeoutId = setTimeout(checkEmail, 500);
    return () => clearTimeout(timeoutId);
  }, [email]);

  // Validar força da senha
  useEffect(() => {
    const validatePasswordStrength = async () => {
      if (senha.length >= 6) {
        try {
          const result = await validatePassword(senha);
          setPasswordStrength(result);
        } catch (error) {
          setPasswordStrength(null);
        }
      } else {
        setPasswordStrength(null);
      }
    };

    const timeoutId = setTimeout(validatePasswordStrength, 300);
    return () => clearTimeout(timeoutId);
  }, [senha]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validações
    if (!nome.trim()) {
      setError("Nome é obrigatório");
      setLoading(false);
      return;
    }

    if (!email.trim()) {
      setError("E-mail é obrigatório");
      setLoading(false);
      return;
    }

    if (emailAvailable === false) {
      setError("Este e-mail já está em uso");
      setLoading(false);
      return;
    }

    if (senha !== confirmarSenha) {
      setError("As senhas não coincidem");
      setLoading(false);
      return;
    }

    if (senha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      setLoading(false);
      return;
    }

    if (passwordStrength && !passwordStrength.is_valid) {
      setError("A senha não atende aos critérios de segurança");
      setLoading(false);
      return;
    }

    try {
      const response = await register({
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha,
        confirmar_senha: confirmarSenha,
      });

      // Registro bem-sucedido
      console.log("Registro realizado com sucesso:", response.user);
      router.push("/dashboard");
    } catch (e: any) {
      setError(e?.message ?? "Falha no registro");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      await registerWithGoogle();
      // O redirecionamento será feito automaticamente
    } catch (e: any) {
      setError(e?.message ?? "Falha no registro com Google");
      setGoogleLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (!passwordStrength) return "text-slate-400";
    switch (passwordStrength.strength) {
      case "fraca":
        return "text-red-500";
      case "média":
        return "text-yellow-500";
      case "forte":
        return "text-green-500";
      default:
        return "text-slate-400";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
            <svg
              className="w-10 h-10 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5H2M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2 2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-emerald-600 bg-clip-text text-transparent">
            MoneyHub
          </h1>
          <p className="text-slate-600 mt-2">Crie sua conta gratuita</p>
        </div>

        {/* Card de Registro */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          {/* Google Register Button */}
          <button
            onClick={handleGoogleRegister}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 rounded-xl py-3 px-4 text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {googleLoading ? "Criando conta..." : "Continuar com Google"}
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500">ou</span>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="nome"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Nome completo
              </label>
              <input
                id="nome"
                type="text"
                placeholder="Seu nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200 bg-slate-50 focus:bg-white"
                disabled={loading || googleLoading}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200 bg-slate-50 focus:bg-white ${
                  emailAvailable === false
                    ? "border-red-300"
                    : emailAvailable === true
                    ? "border-green-300"
                    : "border-slate-200"
                }`}
                disabled={loading || googleLoading}
              />
              {isCheckingEmail && (
                <p className="text-xs text-slate-500 mt-1">
                  Verificando disponibilidade...
                </p>
              )}
              {emailAvailable === false && !isCheckingEmail && (
                <p className="text-xs text-red-500 mt-1">
                  Este e-mail já está em uso
                </p>
              )}
              {emailAvailable === true && !isCheckingEmail && (
                <p className="text-xs text-green-500 mt-1">E-mail disponível</p>
              )}
            </div>

            <div>
              <label
                htmlFor="senha"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="senha"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200 bg-slate-50 focus:bg-white"
                  disabled={loading || googleLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  disabled={loading || googleLoading}
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {passwordStrength && (
                <div className="mt-1">
                  <p className={`text-xs ${getPasswordStrengthColor()}`}>
                    Força da senha: {passwordStrength.strength} (
                    {passwordStrength.score}/5)
                  </p>
                  {passwordStrength.issues &&
                    passwordStrength.issues.length > 0 && (
                      <ul className="text-xs text-red-500 mt-1">
                        {passwordStrength.issues.map(
                          (issue: string, index: number) => (
                            <li key={index}>• {issue}</li>
                          )
                        )}
                      </ul>
                    )}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmarSenha"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Confirmar senha
              </label>
              <div className="relative">
                <input
                  id="confirmarSenha"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  required
                  className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200 bg-slate-50 focus:bg-white ${
                    confirmarSenha && senha !== confirmarSenha
                      ? "border-red-300"
                      : confirmarSenha && senha === confirmarSenha
                      ? "border-green-300"
                      : "border-slate-200"
                  }`}
                  disabled={loading || googleLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  disabled={loading || googleLoading}
                >
                  {showConfirmPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {confirmarSenha && (
                <p
                  className={`text-xs mt-1 ${
                    senha === confirmarSenha ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {senha === confirmarSenha
                    ? "Senhas coincidem"
                    : "Senhas não coincidem"}
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Terms */}
            <div className="text-xs text-slate-600">
              Ao criar uma conta, você concorda com nossos{" "}
              <a href="/terms" className="text-emerald-600 hover:underline">
                Termos de Uso
              </a>{" "}
              e{" "}
              <a href="/privacy" className="text-emerald-600 hover:underline">
                Política de Privacidade
              </a>
              .
            </div>

            <button
              type="submit"
              disabled={
                loading ||
                googleLoading ||
                emailAvailable === false ||
                (passwordStrength && !passwordStrength.is_valid)
              }
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium py-3 px-4 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Criando conta..." : "Criar conta"}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Já tem uma conta?{" "}
              <a
                href="/auth/login"
                className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
              >
                Entrar
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          © 2025 MoneyHub. Centro de Cone Finanuenoto.
        </p>
      </div>
    </div>
  );
}
