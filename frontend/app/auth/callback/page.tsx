"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Logo from "@/components/Logo";
import { useTheme } from "@/contexts/ThemeContext";
import { glassSurface } from "@/components/finance/glass";
import { EASE, fontHeading, fontBody } from "@/lib/motion";

type Status = "loading" | "success" | "error";

function AuthCallbackContent() {
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isDark } = useTheme();

  // --- Lógica de autenticação (preservada do callback original) ------------
  useEffect(() => {
    const error = searchParams.get("error");
    const success = searchParams.get("success");

    // Verificar se estamos em um popup
    const isPopup = window.opener && !window.opener.closed;
    // A janela que abriu o popup (página de login) e esta página de callback
    // são servidas pelo mesmo frontend, então compartilham a mesma origem.
    // NÃO usar document.referrer: após o redirect do OAuth ele aponta para
    // https://accounts.google.com, o que faz o postMessage ser bloqueado.
    const targetOrigin = window.location.origin;

    if (error) {
      setStatus("error");
      setMessage(decodeURIComponent(error));

      if (isPopup) {
        window.opener.postMessage(
          { type: "AUTH_ERROR", error: decodeURIComponent(error) },
          targetOrigin
        );
        setTimeout(() => {
          window.close();
        }, 2000);
      } else {
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      }
    } else if (success) {
      setStatus("success");
      setMessage("Login realizado com sucesso! Fechando janela...");

      if (isPopup) {
        window.opener.postMessage({ type: "AUTH_SUCCESS" }, targetOrigin);
        setTimeout(() => {
          window.close();
        }, 1500);
      } else {
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      }
    } else {
      setStatus("loading");
      setMessage("Processando autenticação...");
    }
  }, [searchParams, router]);

  // --- Conteúdo por estado -------------------------------------------------
  const view = {
    loading: {
      icon: <Loader2 className="h-8 w-8 animate-spin text-[color:var(--color-secondary)]" />,
      ring: "var(--color-secondary)",
      title: "Processando autenticação",
      body: message || "Aguarde enquanto verificamos suas credenciais…",
    },
    success: {
      icon: <CheckCircle2 className="h-8 w-8 text-white" />,
      ring: "var(--color-secondary)",
      title: "Tudo certo!",
      body:
        typeof window !== "undefined" && window.opener
          ? "Fechando janela…"
          : "Redirecionando para o dashboard…",
    },
    error: {
      icon: <XCircle className="h-8 w-8 text-white" />,
      ring: "var(--color-danger)",
      title: "Erro na autenticação",
      body: message || "Não foi possível concluir o login.",
    },
  }[status];

  return (
    <div
      className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden p-4"
      style={{ background: isDark ? "#020617" : "#f9fafb", fontFamily: fontBody }}
    >
      {/* Mesh ambiente da marca (navy + verde) — coerente com login/dashboard */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-[10%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,204,102,0.16),transparent_62%)] blur-3xl dark:bg-[radial-gradient(circle_at_center,rgba(0,204,102,0.10),transparent_62%)]" />
        <div className="absolute -bottom-32 -left-[10%] h-[440px] w-[440px] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,51,102,0.10),transparent_60%)] blur-3xl dark:bg-[radial-gradient(circle_at_center,rgba(0,102,153,0.18),transparent_60%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative z-10 w-full max-w-md"
      >
        <div className={`rounded-3xl p-8 text-center ${glassSurface}`}>
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <Logo size="lg" href={false} />
          </div>

          {/* Ícone de estado com halo */}
          <div className="mb-6 flex justify-center">
            <div className="relative flex items-center justify-center">
              <motion.span
                aria-hidden
                className="absolute h-20 w-20 rounded-full"
                style={{ background: `radial-gradient(circle, ${view.ring}33, transparent 70%)` }}
                animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
              />
              {status === "loading" ? (
                <span className="relative flex h-16 w-16 items-center justify-center rounded-full border border-[color:var(--color-secondary)]/25 bg-[color:var(--color-secondary)]/10">
                  {view.icon}
                </span>
              ) : (
                <span
                  className="relative flex h-16 w-16 items-center justify-center rounded-full shadow-lg"
                  style={{
                    background:
                      status === "success"
                        ? "linear-gradient(135deg, var(--color-secondary), var(--color-secondary-dark))"
                        : "linear-gradient(135deg, var(--color-danger), #a32600)",
                  }}
                >
                  {view.icon}
                </span>
              )}
            </div>
          </div>

          <h1
            className="mb-2 text-xl font-bold text-[color:var(--color-primary)] dark:text-white"
            style={{ fontFamily: fontHeading }}
          >
            {view.title}
          </h1>
          <p className="text-[14px] leading-relaxed text-gray-500 dark:text-slate-400">
            {view.body}
          </p>

          {/* Barra de progresso indeterminada (apenas no loading) */}
          {status === "loading" && (
            <div className="mx-auto mt-6 h-1 w-40 overflow-hidden rounded-full bg-gray-200/70 dark:bg-slate-800">
              <motion.span
                className="block h-full w-1/2 rounded-full bg-[color:var(--color-secondary)]"
                animate={{ x: ["-110%", "210%"] }}
                transition={{ duration: 1.15, ease: EASE, repeat: Infinity }}
              />
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-[12px] text-gray-400 dark:text-slate-500">
          © 2025 MoneyHub. Controle financeiro inteligente e seguro.
        </p>
      </motion.div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gray-50 dark:bg-slate-950">
      <Loader2 className="h-10 w-10 animate-spin text-[color:var(--color-secondary)]" />
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
