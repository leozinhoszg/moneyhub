"use client";

// Splash screen da marca — usada nos momentos de autenticação/transição
// (ex.: layout finance enquanto o AuthContext resolve a sessão). Reaproveita
// o material da home/login/dashboard: fundo navy+verde, vidro, Logo e o
// cubic-bezier `EASE` do design system. Coerente em light e dark.

import { motion } from "framer-motion";
import Logo from "@/components/Logo";
import { useTheme } from "@/contexts/ThemeContext";
import { EASE, fontBody } from "@/lib/motion";

export default function SplashScreen({
  message = "Carregando…",
}: {
  message?: string;
}) {
  const { isDark } = useTheme();

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{ background: isDark ? "#020617" : "#f9fafb", fontFamily: fontBody }}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {/* Mesh ambiente da marca (mesmos glows do MainLayout) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-[10%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,204,102,0.16),transparent_62%)] blur-3xl dark:bg-[radial-gradient(circle_at_center,rgba(0,204,102,0.10),transparent_62%)]" />
        <div className="absolute -bottom-32 -left-[10%] h-[440px] w-[440px] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,51,102,0.10),transparent_60%)] blur-3xl dark:bg-[radial-gradient(circle_at_center,rgba(0,102,153,0.18),transparent_60%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative flex flex-col items-center gap-7"
      >
        {/* Logo com halo verde pulsante */}
        <div className="relative flex items-center justify-center">
          <motion.span
            aria-hidden
            className="absolute h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(0,204,102,0.30),transparent_70%)] blur-xl"
            animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.85, 0.5] }}
            transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity }}
          />
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
          >
            <Logo size="lg" href={false} />
          </motion.div>
        </div>

        {/* Barra de progresso indeterminada */}
        <div className="h-1 w-44 overflow-hidden rounded-full bg-gray-200/70 dark:bg-slate-800">
          <motion.span
            className="block h-full w-1/2 rounded-full bg-[color:var(--color-secondary)]"
            animate={{ x: ["-110%", "210%"] }}
            transition={{ duration: 1.15, ease: EASE, repeat: Infinity }}
          />
        </div>

        <p className="text-[13px] font-medium text-gray-500 dark:text-slate-400">
          {message}
        </p>
      </motion.div>
    </div>
  );
}
