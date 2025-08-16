"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Sun, Moon, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const error = searchParams.get("error");
    const success = searchParams.get("success");

    // Verificar se estamos em um popup
    const isPopup = window.opener && !window.opener.closed;
    // Determinar origin permitido (do opener) usando document.referrer
    let targetOrigin = window.location.origin;
    try {
      if (document.referrer) {
        const ref = new URL(document.referrer);
        targetOrigin = ref.origin;
      }
    } catch {
      // manter fallback para o origin atual
    }

    if (error) {
      setStatus("error");
      setMessage(decodeURIComponent(error));
      
      if (isPopup) {
        // Comunicar erro para a janela pai
        window.opener.postMessage({ type: 'AUTH_ERROR', error: decodeURIComponent(error) }, targetOrigin);
        // Fechar popup após um breve delay
        setTimeout(() => {
          window.close();
        }, 2000);
      } else {
        // Se não é popup, redirecionar para login
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      }
    } else if (success) {
      setStatus("success");
      setMessage("Login realizado com sucesso! Fechando janela...");
      
      if (isPopup) {
        // Comunicar sucesso para a janela pai
        window.opener.postMessage({ type: 'AUTH_SUCCESS' }, targetOrigin);
        // Fechar popup após um breve delay
        setTimeout(() => {
          window.close();
        }, 1500);
      } else {
        // Se não é popup, redirecionar para dashboard
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      }
    } else {
      // Se não há parâmetros, assumir que está carregando
      setStatus("loading");
      setMessage("Processando autenticação...");
    }
  }, [searchParams, router]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500 ${
        isDark
          ? "bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800"
          : "bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100"
      }`}
    >
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className={`fixed top-6 right-6 z-50 p-3 rounded-full shadow-lg backdrop-blur-xl transition-all duration-300 ${
          isDark
            ? "bg-slate-800/80 border border-slate-700/50 text-yellow-400 hover:bg-slate-700/80"
            : "bg-white/90 border border-slate-200/50 text-slate-600 hover:bg-white"
        }`}
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className={`absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-emerald-500/20 to-green-400/10 rounded-full blur-xl transition-all duration-[4000ms] ${
            mounted ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
          style={{
            animation: mounted ? "float 6s ease-in-out infinite" : "none",
          }}
        />
        <div
          className={`absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-tr from-blue-500/20 to-cyan-400/10 rounded-full blur-xl transition-all duration-[5000ms] delay-1000 ${
            mounted ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
          style={{
            animation: mounted ? "float 8s ease-in-out infinite reverse" : "none",
          }}
        />
        <div
          className={`absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-500/15 to-pink-400/10 rounded-full blur-xl transition-all duration-[6000ms] delay-2000 ${
            mounted ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
          style={{
            animation: mounted ? "float 10s ease-in-out infinite" : "none",
          }}
        />
      </div>

      {/* Main Content */}
      <div className="w-full max-w-md z-10">
        <div
          className={`rounded-3xl shadow-2xl border backdrop-blur-xl p-8 transition-all duration-1000 ${
            isDark
              ? "bg-slate-800/80 border-slate-700/50"
              : "bg-white/90 border-slate-200/50"
          } ${
            mounted
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 mb-6 relative">
              <Image
                src="/logo_money_hub.png"
                alt="MoneyHub Logo"
                width={120}
                height={120}
                className="object-contain relative z-10 drop-shadow-xl transition-transform duration-500 hover:scale-110"
                priority
              />
            </div>
            <h1
              className="text-2xl font-bold mb-2"
              style={{
                fontFamily: "var(--font-heading, Montserrat, sans-serif)",
              }}
            >
              <span style={{ color: "#013a56" }}>Money</span>
              <span style={{ color: "#00cc66" }}>Hub</span>
            </h1>
          </div>

          {/* Status Content */}
          <div className="text-center space-y-6">
            {status === "loading" && (
              <div
                className={`transition-all duration-1000 delay-500 ${
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                    <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-emerald-500/20"></div>
                  </div>
                </div>
                <h2
                  className={`text-xl font-semibold mb-3 transition-colors duration-300 ${
                    isDark ? "text-slate-200" : "text-slate-700"
                  }`}
                  style={{
                    fontFamily: "var(--font-heading, Montserrat, sans-serif)",
                  }}
                >
                  Processando autenticação
                </h2>
                <p
                  className={`transition-colors duration-300 ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                  style={{
                    fontFamily: "var(--font-body, Open Sans, sans-serif)",
                  }}
                >
                  Aguarde enquanto verificamos suas credenciais...
                </p>
              </div>
            )}

            {status === "success" && (
              <div
                className={`transition-all duration-1000 delay-500 ${
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute inset-0 w-16 h-16 bg-emerald-500/20 rounded-full animate-ping"></div>
                  </div>
                </div>
                <h2
                  className={`text-xl font-semibold mb-3 text-emerald-600 ${
                    isDark ? "text-emerald-400" : "text-emerald-600"
                  }`}
                  style={{
                    fontFamily: "var(--font-heading, Montserrat, sans-serif)",
                  }}
                >
                  Autenticação realizada com sucesso!
                </h2>
                <p
                  className={`transition-colors duration-300 ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                  style={{
                    fontFamily: "var(--font-body, Open Sans, sans-serif)",
                  }}
                >
                  {message}
                </p>
                <div className="mt-4">
                  <div className="inline-flex items-center text-sm text-emerald-600">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2"></div>
                    {window.opener ? "Fechando janela..." : "Redirecionando para o dashboard..."}
                  </div>
                </div>
              </div>
            )}

            {status === "error" && (
              <div
                className={`transition-all duration-1000 delay-500 ${
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                      <XCircle className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute inset-0 w-16 h-16 bg-red-500/20 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <h2
                  className={`text-xl font-semibold mb-3 ${
                    isDark ? "text-red-400" : "text-red-600"
                  }`}
                  style={{
                    fontFamily: "var(--font-heading, Montserrat, sans-serif)",
                  }}
                >
                  Erro na autenticação
                </h2>
                <p
                  className={`mb-4 transition-colors duration-300 ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                  style={{
                    fontFamily: "var(--font-body, Open Sans, sans-serif)",
                  }}
                >
                  {message}
                </p>
                <div className="mt-4">
                  <div className="inline-flex items-center text-sm text-red-600">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                    {window.opener ? "Fechando janela..." : "Redirecionando para o login..."}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p
          className={`text-center text-sm mt-6 transition-colors duration-300 ${
            isDark ? "text-slate-400" : "text-slate-500"
          }`}
          style={{
            fontFamily: "var(--font-body, Open Sans, sans-serif)",
          }}
        >
          © 2025 MoneyHub. Controle financeiro inteligente e seguro.
        </p>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }
      `}</style>
    </div>
  );
}