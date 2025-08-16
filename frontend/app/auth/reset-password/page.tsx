"use client";

import React, { FormEvent, useState, useEffect } from "react";
import { resetPassword } from "@/app/api/auth";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Sun, Moon } from "lucide-react";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  // Animation state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if token exists
  useEffect(() => {
    if (!token) {
      setError("Token de reset inválido ou ausente");
    }
  }, [token]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validações básicas
    if (!newPassword.trim()) {
      setError("Nova senha é obrigatória");
      setLoading(false);
      return;
    }

    if (!confirmPassword.trim()) {
      setError("Confirmação de senha é obrigatória");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      setLoading(false);
      return;
    }

    // Validação adicional de força da senha
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(newPassword)) {
      setError("A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número");
      setLoading(false);
      return;
    }

    if (!token) {
      setError("Token de reset inválido");
      setLoading(false);
      return;
    }

    try {
      const response = await resetPassword({
        token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (e: any) {
      let errorMessage = "Erro ao redefinir senha. Tente novamente.";
      
      if (e?.message) {
        const message = e.message.toLowerCase();
        
        if (message.includes("token inválido") || message.includes("token expirado")) {
          errorMessage = "Token expirado ou inválido. Solicite um novo reset de senha.";
        } else if (message.includes("senhas não coincidem")) {
          errorMessage = "As senhas não coincidem.";
        } else if (message.includes("senha não atende aos critérios")) {
          errorMessage = "A senha não atende aos critérios de segurança.";
        } else if (message.includes("erro de conexão")) {
          errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
        } else if (message.includes("erro interno")) {
          errorMessage = "Erro interno do servidor. Tente novamente em alguns instantes.";
        } else {
          errorMessage = e.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Funções para limpar erros quando o usuário começa a digitar
  const clearErrorOnInput = () => {
    if (error) setError(null);
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
    clearErrorOnInput();
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    clearErrorOnInput();
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

        {/* Reset Password Card */}
        <div
          className={`rounded-3xl shadow-2xl border backdrop-blur-xl transition-all duration-700 ${
            isDark
              ? "bg-slate-800/80 border-slate-700/50"
              : "bg-white/90 border-slate-200/50"
          }`}
        >
          <div className="p-8 pb-12 h-full flex flex-col justify-between">
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
                  Redefinir Senha
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
                  Digite sua nova senha abaixo
                </p>
              </div>

              {success ? (
                /* Success Message */
                <div
                  className={`border-2 rounded-xl p-6 text-center backdrop-blur-sm ${
                    isDark
                      ? "bg-emerald-900/50 border-emerald-500/50 text-emerald-300"
                      : "bg-emerald-50 border-emerald-200 text-emerald-700"
                  }`}
                  style={{
                    fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                  }}
                >
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <svg
                      className={`w-8 h-8 ${
                        isDark ? "text-emerald-400" : "text-emerald-500"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Senha redefinida com sucesso!</h3>
                  <p className="text-sm">Você será redirecionado para a página de login em alguns segundos...</p>
                </div>
              ) : (
                /* Reset Password Form */
                <form onSubmit={onSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label
                      htmlFor="newPassword"
                      className={`block text-sm font-semibold transition-colors duration-300 ${
                        isDark ? "text-slate-200" : "text-slate-700"
                      }`}
                      style={{
                        fontFamily:
                          "var(--font-secondary, Open Sans, sans-serif)",
                      }}
                    >
                      Nova Senha
                    </label>
                    <div className="relative">
                      <input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={handleNewPasswordChange}
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
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                          isDark
                            ? "text-gray-400 hover:text-gray-200"
                            : "text-gray-400 hover:text-gray-600"
                        }`}
                        disabled={loading}
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
                      htmlFor="confirmPassword"
                      className={`block text-sm font-semibold transition-colors duration-300 ${
                        isDark ? "text-slate-200" : "text-slate-700"
                      }`}
                      style={{
                        fontFamily:
                          "var(--font-secondary, Open Sans, sans-serif)",
                      }}
                    >
                      Confirmar Nova Senha
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
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
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                          isDark
                            ? "text-gray-400 hover:text-gray-200"
                            : "text-gray-400 hover:text-gray-600"
                        }`}
                        disabled={loading}
                      >
                        {showConfirmPassword ? (
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
                    disabled={loading || !token}
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
                          Redefinindo...
                        </>
                      ) : (
                        <>
                          Redefinir Senha
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
              )}
            </div>

            {/* Links */}
            <div className="mt-8 text-center">
              <button
                onClick={() => router.push("/auth/login")}
                className="text-sm text-emerald-500 hover:text-emerald-400 hover:underline font-semibold transition-colors duration-200"
                style={{
                  fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                }}
              >
                Voltar ao login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
