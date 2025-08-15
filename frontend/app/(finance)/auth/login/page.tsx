"use client";

import React, { FormEvent, useState, useEffect } from "react";
import { login, loginWithGoogle, checkAuthStatus } from "@/app/api/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Sun, Moon } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  // Animation state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Verificar se já está logado
  useEffect(() => {
    const checkAuth = async () => {
      try {
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

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validações básicas
    if (!email.trim()) {
      setError("E-mail é obrigatório");
      setLoading(false);
      return;
    }

    if (!senha.trim()) {
      setError("Senha é obrigatória");
      setLoading(false);
      return;
    }

    try {
      const response = await login({
        email: email.trim().toLowerCase(),
        senha,
      });

      // Login bem-sucedido
      console.log("Login realizado com sucesso:", response.user);
      router.push("/dashboard");
    } catch (e: any) {
      setError(e?.message ?? "Falha no login. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validações básicas
    if (!name.trim()) {
      setError("Nome é obrigatório");
      setLoading(false);
      return;
    }

    if (!email.trim()) {
      setError("E-mail é obrigatório");
      setLoading(false);
      return;
    }

    if (!senha.trim()) {
      setError("Senha é obrigatória");
      setLoading(false);
      return;
    }

    if (senha !== confirmPassword) {
      setError("As senhas não coincidem");
      setLoading(false);
      return;
    }

    if (senha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      setLoading(false);
      return;
    }

    try {
      // Aqui você implementaria a chamada para registro
      console.log("Registro realizado com sucesso:", { name, email, senha });
      // Por enquanto, apenas simula o sucesso
      router.push("/dashboard");
    } catch (e: any) {
      setError(e?.message ?? "Falha no registro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      // O redirecionamento será feito automaticamente
    } catch (e: any) {
      setError(e?.message ?? "Falha no login com Google");
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push("/auth/forgot-password");
  };

  const toggleCard = () => {
    setIsRegister(!isRegister);
    setError(null);
    // Limpar campos ao alternar
    if (!isRegister) {
      setEmail("");
      setSenha("");
      setConfirmPassword("");
      setName("");
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500 ${
        isDark
          ? "bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800"
          : "bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100"
      }`}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Large gradient orbs */}
        <div
          className={`absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-emerald-500/20 to-green-400/10 rounded-full blur-xl transition-all duration-[4000ms] ${
            mounted ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
          style={{
            animation: mounted ? "float 12s ease-in-out infinite" : "none",
          }}
        />
        <div
          className={`absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-blue-600/20 to-indigo-500/10 rounded-full blur-xl transition-all duration-[4000ms] delay-1000 ${
            mounted ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
          style={{
            animation: mounted
              ? "float 10s ease-in-out infinite reverse"
              : "none",
          }}
        />
        <div
          className={`absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-bl from-emerald-400/15 to-teal-500/5 rounded-full blur-2xl transition-all duration-[4000ms] delay-2000 ${
            mounted ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
          style={{
            animation: mounted ? "float 8s ease-in-out infinite" : "none",
          }}
        />

        {/* Grid pattern overlay */}
        <div
          className={`absolute inset-0 transition-all duration-500 ${
            isDark
              ? "bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]"
              : "bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:40px_40px]"
          }`}
        />
      </div>

      {/* Main Container */}
      <div
        className={`w-full max-w-lg relative z-10 transition-all duration-1000 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Theme Toggle Button */}
        <button
          onClick={() => setIsDark(!isDark)}
          className={`absolute top-4 right-4 p-3 rounded-full transition-all duration-300 z-20 ${
            isDark
              ? "bg-gray-900 text-yellow-400 hover:bg-gray-800"
              : "bg-white text-gray-600 hover:bg-gray-50"
          } shadow-lg hover:shadow-xl`}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* 3D Card Container */}
        <div
          className={`relative w-full min-h-[900px] transition-all duration-1000 delay-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{
            transformStyle: "preserve-3d",
            perspective: "1200px",
          }}
        >
          {/* Login Side (Front) */}
          <div
            className={`absolute inset-0 rounded-3xl shadow-2xl border backdrop-blur-xl transition-all duration-700 ${
              isDark
                ? "bg-slate-800/80 border-slate-700/50"
                : "bg-white/90 border-slate-200/50"
            } ${
              isRegister ? "rotate-y-180 opacity-0" : "rotate-y-0 opacity-100"
            }`}
            style={{
              backfaceVisibility: "hidden",
              transform: isRegister ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            <div className="p-8 h-full flex flex-col justify-between">
              <div className="flex-1">
                {/* Logo Section */}
                <div
                  className={`text-center mb-8 transition-all duration-1000 delay-300 ${
                    mounted
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  }`}
                >
                  <div className="inline-flex items-center justify-center w-48 h-48 mb-6 relative">
                    <Image
                      src="/logo_money_hub.png"
                      alt="MoneyHub Logo"
                      width={180}
                      height={180}
                      className="object-contain relative z-10 drop-shadow-xl transition-transform duration-500 hover:scale-110"
                      priority
                    />
                  </div>
                  <h1
                    className="text-3xl font-bold mb-3"
                    style={{
                      fontFamily: "var(--font-primary, Montserrat, sans-serif)",
                    }}
                  >
                    <span style={{ color: "#013a56" }}>Money</span>
                    <span style={{ color: "#00cc66" }}>Hub</span>
                  </h1>
                  <p
                    className={`text-lg font-medium transition-colors duration-300 ${
                      isDark ? "text-slate-300" : "text-slate-600"
                    }`}
                    style={{
                      fontFamily:
                        "var(--font-secondary, Open Sans, sans-serif)",
                    }}
                  >
                    Bem-vindo de volta!
                  </p>
                  <p
                    className={`text-sm mt-1 transition-colors duration-300 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                    style={{
                      fontFamily:
                        "var(--font-secondary, Open Sans, sans-serif)",
                    }}
                  >
                    Entre na sua conta para continuar
                  </p>
                </div>

                {/* Email/Password Form */}
                <form onSubmit={onSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className={`block text-sm font-semibold transition-colors duration-300 ${
                        isDark ? "text-slate-200" : "text-slate-700"
                      }`}
                      style={{
                        fontFamily:
                          "var(--font-secondary, Open Sans, sans-serif)",
                      }}
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
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all duration-200 font-medium backdrop-blur-sm ${
                        isDark
                          ? "border-slate-600/50 bg-slate-700/50 text-white placeholder-slate-400"
                          : "border-slate-200/50 bg-white/80 text-slate-700 placeholder-slate-400"
                      }`}
                      style={{
                        fontFamily:
                          "var(--font-secondary, Open Sans, sans-serif)",
                      }}
                      disabled={loading || googleLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="senha"
                      className={`block text-sm font-semibold transition-colors duration-300 ${
                        isDark ? "text-slate-200" : "text-slate-700"
                      }`}
                      style={{
                        fontFamily:
                          "var(--font-secondary, Open Sans, sans-serif)",
                      }}
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
                        className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all duration-200 font-medium backdrop-blur-sm ${
                          isDark
                            ? "border-slate-600/50 bg-slate-700/50 text-white placeholder-slate-400"
                            : "border-slate-200/50 bg-white/80 text-slate-700 placeholder-slate-400"
                        }`}
                        style={{
                          fontFamily:
                            "var(--font-secondary, Open Sans, sans-serif)",
                        }}
                        disabled={loading || googleLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                          isDark
                            ? "text-gray-400 hover:text-gray-200"
                            : "text-gray-400 hover:text-gray-600"
                        }`}
                        disabled={loading || googleLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="w-6 h-6" />
                        ) : (
                          <Eye className="w-6 h-6" />
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div
                      className={`border-2 rounded-xl p-4 text-sm font-medium backdrop-blur-sm ${
                        isDark
                          ? "bg-red-900/50 border-red-500/50 text-red-300"
                          : "bg-red-50 border-red-200 text-red-700"
                      }`}
                      style={{
                        animation: "shake 0.5s ease-in-out",
                        fontFamily:
                          "var(--font-secondary, Open Sans, sans-serif)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <svg
                          className={`w-5 h-5 flex-shrink-0 ${
                            isDark ? "text-red-400" : "text-red-500"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {error}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || googleLoading}
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group relative overflow-hidden text-lg"
                    style={{
                      fontFamily: "var(--font-primary, Montserrat, sans-serif)",
                    }}
                  >
                    {/* Button glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-emerald-600/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />

                    <span className="flex items-center justify-center gap-3 relative z-10">
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Entrando...
                        </>
                      ) : (
                        <>
                          Entrar
                          <svg
                            className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                        </>
                      )}
                    </span>
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div
                      className={`w-full border-t transition-colors duration-300 ${
                        isDark ? "border-slate-600/50" : "border-slate-200/50"
                      }`}
                    ></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span
                      className={`px-4 font-medium transition-colors duration-300 ${
                        isDark
                          ? "bg-slate-800 text-slate-400"
                          : "bg-white text-slate-500"
                      }`}
                      style={{
                        fontFamily:
                          "var(--font-secondary, Open Sans, sans-serif)",
                      }}
                    >
                      ou
                    </span>
                  </div>
                </div>

                {/* Google Login Button */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={googleLoading || loading}
                  className={`w-full flex items-center justify-center gap-3 border-2 rounded-xl py-4 px-6 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group transform hover:scale-[1.01] text-base backdrop-blur-sm ${
                    isDark
                      ? "bg-slate-700/50 border-slate-600/50 text-slate-200 hover:bg-slate-600/50 hover:border-slate-500/50 hover:shadow-xl"
                      : "bg-white/80 border-slate-200/50 text-slate-700 hover:bg-white hover:border-slate-300/50 hover:shadow-xl"
                  }`}
                  style={{
                    fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                  }}
                >
                  <svg
                    className="w-7 h-7 transition-transform duration-300 group-hover:scale-110"
                    viewBox="0 0 24 24"
                  >
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
                  {googleLoading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                      Entrando...
                    </div>
                  ) : (
                    "Continuar com Google"
                  )}
                </button>
              </div>

              {/* Links */}
              <div className="mt-8 text-center space-y-4">
                <button
                  onClick={handleForgotPassword}
                  className="text-sm text-emerald-500 hover:text-emerald-400 hover:underline font-semibold transition-colors duration-200"
                  style={{
                    fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                  }}
                >
                  Esqueceu sua senha?
                </button>
                <p
                  className={`text-sm transition-colors duration-300 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                  style={{
                    fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                  }}
                >
                  Não tem uma conta?{" "}
                  <button
                    onClick={toggleCard}
                    className="text-emerald-500 hover:text-emerald-400 font-bold hover:underline transition-colors duration-200"
                  >
                    Criar conta
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* Register Side (Back) */}
          <div
            className={`absolute inset-0 rounded-3xl shadow-2xl border backdrop-blur-xl transition-all duration-700 ${
              isDark
                ? "bg-slate-800/80 border-slate-700/50"
                : "bg-white/90 border-slate-200/50"
            } ${
              isRegister ? "rotate-y-0 opacity-100" : "rotate-y-180 opacity-0"
            }`}
            style={{
              backfaceVisibility: "hidden",
              transform: isRegister ? "rotateY(0deg)" : "rotateY(-180deg)",
            }}
          >
            <div className="p-8 h-full flex flex-col justify-between">
              <div className="flex-1">
                {/* Logo Section */}
                <div
                  className={`text-center mb-8 transition-all duration-1000 delay-300 ${
                    mounted
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  }`}
                >
                  <div className="inline-flex items-center justify-center w-48 h-48 mb-6 relative">
                    <Image
                      src="/logo_money_hub.png"
                      alt="MoneyHub Logo"
                      width={180}
                      height={180}
                      className="object-contain relative z-10 drop-shadow-xl transition-transform duration-500 hover:scale-110"
                      priority
                    />
                  </div>
                  <h1
                    className="text-3xl font-bold mb-3"
                    style={{
                      fontFamily: "var(--font-primary, Montserrat, sans-serif)",
                    }}
                  >
                    <span style={{ color: "#013a56" }}>Money</span>
                    <span style={{ color: "#00cc66" }}>Hub</span>
                  </h1>
                  <p
                    className={`text-lg font-medium transition-colors duration-300 ${
                      isDark ? "text-slate-300" : "text-slate-600"
                    }`}
                    style={{
                      fontFamily:
                        "var(--font-secondary, Open Sans, sans-serif)",
                    }}
                  >
                    Crie sua conta!
                  </p>
                  <p
                    className={`text-sm mt-1 transition-colors duration-300 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                    style={{
                      fontFamily:
                        "var(--font-secondary, Open Sans, sans-serif)",
                    }}
                  >
                    Preencha os dados para começar
                  </p>
                </div>

                {/* Register Form */}
                <form onSubmit={handleRegister} className="space-y-5">
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className={`block text-sm font-semibold transition-colors duration-300 ${
                        isDark ? "text-slate-200" : "text-slate-700"
                      }`}
                      style={{
                        fontFamily:
                          "var(--font-secondary, Open Sans, sans-serif)",
                      }}
                    >
                      Nome Completo
                    </label>
                    <input
                      id="name"
                      type="text"
                      placeholder="Seu nome completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all duration-200 font-medium backdrop-blur-sm ${
                        isDark
                          ? "border-slate-600/50 bg-slate-700/50 text-white placeholder-slate-400"
                          : "border-slate-200/50 bg-white/80 text-slate-700 placeholder-slate-400"
                      }`}
                      style={{
                        fontFamily:
                          "var(--font-secondary, Open Sans, sans-serif)",
                      }}
                      disabled={loading || googleLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="email-register"
                      className={`block text-sm font-semibold transition-colors duration-300 ${
                        isDark ? "text-slate-200" : "text-slate-700"
                      }`}
                      style={{
                        fontFamily:
                          "var(--font-secondary, Open Sans, sans-serif)",
                      }}
                    >
                      E-mail
                    </label>
                    <input
                      id="email-register"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all duration-200 font-medium backdrop-blur-sm ${
                        isDark
                          ? "border-slate-600/50 bg-slate-700/50 text-white placeholder-slate-400"
                          : "border-slate-200/50 bg-white/80 text-slate-700 placeholder-slate-400"
                      }`}
                      style={{
                        fontFamily:
                          "var(--font-secondary, Open Sans, sans-serif)",
                      }}
                      disabled={loading || googleLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="senha-register"
                      className={`block text-sm font-semibold transition-colors duration-300 ${
                        isDark ? "text-slate-200" : "text-slate-700"
                      }`}
                      style={{
                        fontFamily:
                          "var(--font-secondary, Open Sans, sans-serif)",
                      }}
                    >
                      Senha
                    </label>
                    <div className="relative">
                      <input
                        id="senha-register"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                        className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all duration-200 font-medium backdrop-blur-sm ${
                          isDark
                            ? "border-slate-600/50 bg-slate-700/50 text-white placeholder-slate-400"
                            : "border-slate-200/50 bg-white/80 text-slate-700 placeholder-slate-400"
                        }`}
                        style={{
                          fontFamily:
                            "var(--font-secondary, Open Sans, sans-serif)",
                        }}
                        disabled={loading || googleLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                          isDark
                            ? "text-slate-400 hover:text-slate-200"
                            : "text-slate-400 hover:text-slate-600"
                        }`}
                        disabled={loading || googleLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="w-6 h-6" />
                        ) : (
                          <Eye className="w-6 h-6" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="confirm-senha"
                      className={`block text-sm font-semibold transition-colors duration-300 ${
                        isDark ? "text-slate-200" : "text-slate-700"
                      }`}
                      style={{
                        fontFamily:
                          "var(--font-secondary, Open Sans, sans-serif)",
                      }}
                    >
                      Confirmar Senha
                    </label>
                    <input
                      id="confirm-senha"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all duration-200 font-medium backdrop-blur-sm ${
                        isDark
                          ? "border-slate-600/50 bg-slate-700/50 text-white placeholder-slate-400"
                          : "border-slate-200/50 bg-white/80 text-slate-700 placeholder-slate-400"
                      }`}
                      style={{
                        fontFamily:
                          "var(--font-secondary, Open Sans, sans-serif)",
                      }}
                      disabled={loading || googleLoading}
                    />
                  </div>

                  {error && (
                    <div
                      className={`border-2 rounded-xl p-4 text-sm font-medium backdrop-blur-sm ${
                        isDark
                          ? "bg-red-900/50 border-red-500/50 text-red-300"
                          : "bg-red-50 border-red-200 text-red-700"
                      }`}
                      style={{
                        animation: "shake 0.5s ease-in-out",
                        fontFamily:
                          "var(--font-secondary, Open Sans, sans-serif)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <svg
                          className={`w-5 h-5 flex-shrink-0 ${
                            isDark ? "text-red-400" : "text-red-500"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {error}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || googleLoading}
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group relative overflow-hidden text-lg"
                    style={{
                      fontFamily: "var(--font-primary, Montserrat, sans-serif)",
                    }}
                  >
                    {/* Button glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-emerald-600/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />

                    <span className="flex items-center justify-center gap-3 relative z-10">
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Criando conta...
                        </>
                      ) : (
                        <>
                          Criar Conta
                          <svg
                            className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                        </>
                      )}
                    </span>
                  </button>
                </form>
              </div>

              {/* Links */}
              <div className="mt-8 text-center space-y-4">
                <p
                  className={`text-sm transition-colors duration-300 ${
                    isDark ? "text-slate-300" : "text-slate-600"
                  }`}
                  style={{
                    fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                  }}
                >
                  Já tem uma conta?{" "}
                  <button
                    onClick={toggleCard}
                    className="text-emerald-500 hover:text-emerald-400 font-bold hover:underline transition-colors duration-200"
                  >
                    Fazer login
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p
          className={`text-center text-sm mt-6 transition-all duration-1000 delay-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          } ${isDark ? "text-gray-400" : "text-gray-500"}`}
          style={{ fontFamily: "var(--font-secondary, Open Sans, sans-serif)" }}
        >
          © 2025 MoneyHub. Centro de Controle Financeiro.
        </p>
      </div>

      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Open+Sans:wght@400;500;600&display=swap");

        :root {
          --font-primary: "Montserrat", sans-serif;
          --font-secondary: "Open Sans", sans-serif;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg) scale(1);
          }
          33% {
            transform: translateY(-10px) rotate(1deg) scale(1.05);
          }
          66% {
            transform: translateY(5px) rotate(-1deg) scale(0.95);
          }
        }

        @keyframes patternFloat {
          0%,
          100% {
            transform: translate(0px, 0px) rotate(0deg);
          }
          25% {
            transform: translate(-5px, -5px) rotate(0.5deg);
          }
          50% {
            transform: translate(5px, -10px) rotate(1deg);
          }
          75% {
            transform: translate(-3px, 5px) rotate(-0.5deg);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-4px);
          }
          75% {
            transform: translateX(4px);
          }
        }

        /* Custom scrollbar for dark theme */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #1e293b;
        }

        ::-webkit-scrollbar-thumb {
          background: #64748b;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #10b981;
        }
      `}</style>
    </div>
  );
}
