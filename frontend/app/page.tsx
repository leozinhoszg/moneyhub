"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import {
  ArrowUpRight,
  ArrowRight,
  Plus,
  Minus,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const EASE = [0.32, 0.72, 0, 1] as const;
const SPRING = { type: "spring" as const, stiffness: 110, damping: 22 };

const fontHeading = "var(--font-heading), ui-sans-serif, system-ui";
const fontBody = "var(--font-body), ui-sans-serif, system-ui";
const fontMono = "var(--font-mono), ui-monospace, monospace";

function Reveal({
  children,
  delay = 0,
  y = 28,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ y, opacity: 0, filter: "blur(8px)" }}
      whileInView={{ y: 0, opacity: 1, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-12%" }}
      transition={{ duration: 0.8, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ThemeToggle() {
  const { isDark, toggleTheme, mounted } = useTheme();
  if (!mounted) return <span className="h-8 w-8" aria-hidden />;
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200/70 bg-white/80 text-[color:var(--color-primary)] transition-colors hover:bg-white dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      {isDark ? <Sun size={14} strokeWidth={2.2} /> : <Moon size={14} strokeWidth={2.2} />}
    </button>
  );
}

function Nav({ onLogin }: { onLogin: () => void }) {
  return (
    <motion.nav
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
      className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:top-6"
    >
      <div className="flex items-center gap-1.5 rounded-full border border-white/40 bg-white/55 p-1.5 pl-2 shadow-[0_10px_40px_-18px_rgba(0,51,102,0.25)] ring-1 ring-inset ring-white/40 backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-slate-900/40 dark:ring-white/10 dark:shadow-[0_10px_40px_-12px_rgba(0,0,0,0.5)]">
        <div className="px-1.5">
          <Logo size="sm" href={false} />
        </div>
        <div className="hidden h-5 w-px bg-gray-200 dark:bg-slate-700 sm:block" />
        <div className="hidden items-center gap-0.5 sm:flex">
          {[
            { label: "Recursos", href: "#recursos" },
            { label: "Segurança", href: "#seguranca" },
            { label: "Sobre", href: "#sobre" },
          ].map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="rounded-full px-3 py-1.5 text-[13px] text-gray-600 transition-colors hover:bg-gray-100 hover:text-[color:var(--color-secondary)] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-[color:var(--color-secondary-light)]"
              style={{ fontFamily: fontBody }}
            >
              {l.label}
            </a>
          ))}
        </div>
        <ThemeToggle />
        <button
          onClick={onLogin}
          className="group ml-0.5 flex items-center gap-2 rounded-full bg-[color:var(--color-secondary)] py-1.5 pl-3.5 pr-1.5 text-[13px] font-semibold text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[color:var(--color-secondary-dark)] active:scale-[0.98]"
          style={{ fontFamily: fontBody }}
        >
          <span>Entrar</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
            <ArrowUpRight size={13} strokeWidth={2.2} />
          </span>
        </button>
      </div>
    </motion.nav>
  );
}

// --- Hero card simulado: cicla por estados realistas -----------------------

type HeroState = {
  balance: number;
  delta: string;
  topBadge: { kicker: string; label: string; tone: "secondary" | "danger" };
  bottomBadge: string;
  activeBar: number;
  bars: number[];
  transactions: { label: string; value: string; neg: boolean }[];
};

// Saldo inicial (antes da segunda): R$ 47.218,90
// Movimentos da semana somam zero: -7842,40 -24,80 -32,50 +1450 -187,90 +8450 -312,40 -1500 = 0
// Assim o ciclo fecha exatamente no valor inicial quando o loop reinicia.
const heroStates: HeroState[] = [
  // Segunda — fatura do cartão (zera o ciclo da semana anterior)
  {
    balance: 39376.5,
    delta: "+9,8%",
    topBadge: { kicker: "Fatura", label: "MoneyBank Visa", tone: "danger" },
    bottomBadge: "Início de mês · ciclo fechado",
    activeBar: 0,
    bars: [88, 8, 8, 8, 8, 8, 8],
    transactions: [
      { label: "Fatura · MoneyBank", value: "-R$ 7.842,40", neg: true },
      { label: "Cinema · Sala Aurora", value: "-R$ 48,00", neg: true },
    ],
  },
  // Terça — transporte
  {
    balance: 39351.7,
    delta: "+9,7%",
    topBadge: { kicker: "Cartão", label: "Transporte urbano", tone: "danger" },
    bottomBadge: "Categorização automática",
    activeBar: 1,
    bars: [88, 28, 8, 8, 8, 8, 8],
    transactions: [
      { label: "Transporte · MoveBus", value: "-R$ 24,80", neg: true },
      { label: "Fatura · MoneyBank", value: "-R$ 7.842,40", neg: true },
    ],
  },
  // Quarta — almoço
  {
    balance: 39319.2,
    delta: "+9,6%",
    topBadge: { kicker: "Almoço", label: "Bela Aurora", tone: "danger" },
    bottomBadge: "Categoria · Alimentação",
    activeBar: 2,
    bars: [88, 28, 32, 8, 8, 8, 8],
    transactions: [
      { label: "Almoço · Bela Aurora", value: "-R$ 32,50", neg: true },
      { label: "Transporte · MoveBus", value: "-R$ 24,80", neg: true },
    ],
  },
  // Quinta — Pix recebido + boleto de energia
  {
    balance: 40581.3,
    delta: "+12,8%",
    topBadge: { kicker: "Pix", label: "Atelier Norte", tone: "secondary" },
    bottomBadge: "Pix · Confirmado em 1,2s",
    activeBar: 3,
    bars: [88, 28, 32, 75, 8, 8, 8],
    transactions: [
      { label: "Pix · Atelier Norte", value: "+R$ 1.450,00", neg: false },
      { label: "Energia · EletraSul", value: "-R$ 187,90", neg: true },
    ],
  },
  // Sexta — salário (climax)
  {
    balance: 49031.3,
    delta: "+28,4%",
    topBadge: { kicker: "Salário", label: "Lumen Tech", tone: "secondary" },
    bottomBadge: "Categorizado por IA",
    activeBar: 4,
    bars: [88, 28, 32, 75, 100, 8, 8],
    transactions: [
      { label: "Salário · Lumen Tech", value: "+R$ 8.450,00", neg: false },
      { label: "Pix · Atelier Norte", value: "+R$ 1.450,00", neg: false },
    ],
  },
  // Sábado — mercado
  {
    balance: 48718.9,
    delta: "+27,7%",
    topBadge: { kicker: "Mercado", label: "Vila Norte", tone: "danger" },
    bottomBadge: "Orçamento · 41% do mês",
    activeBar: 5,
    bars: [88, 28, 32, 75, 100, 48, 8],
    transactions: [
      { label: "Mercado · Vila Norte", value: "-R$ 312,40", neg: true },
      { label: "Salário · Lumen Tech", value: "+R$ 8.450,00", neg: false },
    ],
  },
  // Domingo — TED para poupança (fecha a semana no valor inicial)
  {
    balance: 47218.9,
    delta: "+23,8%",
    topBadge: { kicker: "TED", label: "Poupança", tone: "secondary" },
    bottomBadge: "Meta · 22% poupado",
    activeBar: 6,
    bars: [88, 28, 32, 75, 100, 48, 78],
    transactions: [
      { label: "TED · Poupança", value: "-R$ 1.500,00", neg: true },
      { label: "Mercado · Vila Norte", value: "-R$ 312,40", neg: true },
    ],
  },
];

function AnimatedBalance({ value }: { value: number }) {
  const mv = useMotionValue(value);
  const intDisplay = useTransform(mv, (v) =>
    Math.floor(v).toLocaleString("pt-BR")
  );
  const decDisplay = useTransform(mv, (v) => {
    const decPart = Math.round((v - Math.floor(v)) * 100);
    return decPart.toString().padStart(2, "0");
  });

  useEffect(() => {
    const controls = animate(mv, value, {
      duration: 1.4,
      ease: [0.32, 0.72, 0, 1],
    });
    return () => controls.stop();
  }, [value, mv]);

  return (
    <>
      <motion.span
        className="text-[40px] font-bold leading-none tracking-tight"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {intDisplay}
      </motion.span>
      <span className="text-[18px] font-semibold opacity-70">
        ,<motion.span>{decDisplay}</motion.span>
      </span>
    </>
  );
}

function HeroVisual() {
  const { scrollY } = useScroll();
  const float = useTransform(scrollY, [0, 600], [0, -40]);
  const rotate = useTransform(scrollY, [0, 600], [0, 2]);

  const [stateIndex, setStateIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStateIndex((i) => (i + 1) % heroStates.length);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  const current = heroStates[stateIndex];
  const dayLabels = ["S", "T", "Q", "Q", "S", "S", "D"];

  return (
    <motion.div
      style={{ y: float, rotate }}
      className="relative mx-auto w-full max-w-md"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, ease: EASE, delay: 0.5 }}
        className="rounded-[2.25rem] border border-white/40 bg-gradient-to-b from-white/70 to-white/40 p-1.5 shadow-[0_30px_80px_-30px_rgba(0,51,102,0.35)] ring-1 ring-inset ring-white/40 backdrop-blur-2xl backdrop-saturate-150 dark:border-white/[0.08] dark:from-slate-900/60 dark:to-slate-950/40 dark:ring-white/[0.06] dark:shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]"
      >
        <div className="rounded-[calc(2.25rem-0.375rem)] bg-white/55 p-5 backdrop-blur-xl dark:bg-slate-900/45">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-[10px] uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400"
                style={{ fontFamily: fontMono }}
              >
                Saldo total
              </p>
              <p
                className="text-[11px] text-gray-500 dark:text-slate-400"
                style={{ fontFamily: fontMono }}
              >
                mai · 2026
              </p>
            </div>
            <div className="overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={current.delta}
                  initial={{ y: 14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -14, opacity: 0 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="block rounded-full bg-[color:var(--color-secondary)]/15 px-2.5 py-1 text-[10px] font-medium text-[color:var(--color-secondary-dark)] dark:bg-[color:var(--color-secondary)]/20 dark:text-[color:var(--color-secondary-light)]"
                  style={{ fontFamily: fontMono }}
                >
                  {current.delta}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* Big number */}
          <div className="mt-5">
            <div
              className="flex items-baseline gap-1 text-[color:var(--color-primary)] dark:text-slate-100"
              style={{ fontFamily: fontHeading }}
            >
              <span className="text-[15px] font-medium opacity-70">R$</span>
              <AnimatedBalance value={current.balance} />
            </div>
            <p
              className="mt-1 text-[12px] text-gray-500 dark:text-slate-400"
              style={{ fontFamily: fontBody }}
            >
              4 contas · 3 cartões sincronizados
            </p>
          </div>

          {/* Chart area */}
          <div className="mt-5 grid grid-cols-7 items-end gap-1.5 px-1" style={{ height: 100 }}>
            {current.bars.map((h, i) => (
              <motion.div
                key={i}
                initial={false}
                animate={{ height: `${h}px` }}
                transition={{ duration: 0.8, ease: EASE }}
                className={`w-full rounded-t-md transition-colors duration-500 ${
                  i === current.activeBar
                    ? "bg-[color:var(--color-secondary)] shadow-[0_0_18px_rgba(0,204,102,0.45)]"
                    : "bg-gradient-to-t from-[color:var(--color-primary)]/12 to-[color:var(--color-primary)]/30 dark:from-slate-700/40 dark:to-slate-600/70"
                }`}
              />
            ))}
          </div>
          <div
            className="mt-2 grid grid-cols-7 gap-1.5 px-1 text-center text-[10px] text-gray-400 dark:text-slate-500"
            style={{ fontFamily: fontMono }}
          >
            {dayLabels.map((d, i) => (
              <span
                key={i}
                className={
                  i === current.activeBar
                    ? "font-semibold text-[color:var(--color-secondary-dark)] dark:text-[color:var(--color-secondary-light)]"
                    : ""
                }
              >
                {d}
              </span>
            ))}
          </div>

          {/* Activity row */}
          <div className="mt-5 space-y-2">
            <AnimatePresence mode="popLayout" initial={false}>
              {current.transactions.map((t) => (
                <motion.div
                  key={t.label}
                  layout
                  initial={{ opacity: 0, x: -24, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 24, scale: 0.96 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="flex items-center justify-between rounded-xl border border-gray-200/60 bg-gray-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/60"
                >
                  <span
                    className="text-[12px] text-gray-600 dark:text-slate-300"
                    style={{ fontFamily: fontBody }}
                  >
                    {t.label}
                  </span>
                  <span
                    className={`text-[12px] font-semibold ${
                      t.neg
                        ? "text-[color:var(--color-danger)]"
                        : "text-[color:var(--color-secondary-dark)] dark:text-[color:var(--color-secondary-light)]"
                    }`}
                    style={{
                      fontFamily: fontMono,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {t.value}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Top floating badge — alterna mensagem */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ ...SPRING, delay: 1.4 }}
        className="absolute -top-5 left-4 hidden items-center gap-2 rounded-full border border-white/40 bg-white/60 px-3.5 py-2 shadow-[0_12px_30px_-14px_rgba(0,51,102,0.3)] ring-1 ring-inset ring-white/40 backdrop-blur-xl backdrop-saturate-150 dark:border-white/10 dark:bg-slate-900/50 dark:ring-white/10 sm:flex"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${current.topBadge.kicker}-${current.topBadge.label}`}
            initial={{ opacity: 0, y: -8, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 8, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: EASE }}
            className="flex items-center gap-2"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                current.topBadge.tone === "danger"
                  ? "bg-[color:var(--color-danger)] shadow-[0_0_10px_rgba(204,51,0,0.55)]"
                  : "bg-[color:var(--color-secondary)] shadow-[0_0_10px_rgba(0,204,102,0.6)]"
              }`}
            />
            <span
              className="text-[10px] uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400"
              style={{ fontFamily: fontMono }}
            >
              {current.topBadge.kicker}
            </span>
            <span
              className="whitespace-nowrap text-[11px] font-semibold text-[color:var(--color-primary)] dark:text-slate-100"
              style={{ fontFamily: fontBody }}
            >
              {current.topBadge.label}
            </span>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Bottom floating badge — alterna mensagem */}
      <motion.div
        initial={{ opacity: 0, y: -16, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ ...SPRING, delay: 1.6 }}
        className="absolute -bottom-5 right-4 hidden items-center gap-2 rounded-full border border-white/40 bg-white/60 px-3.5 py-2 shadow-[0_12px_30px_-14px_rgba(0,51,102,0.3)] ring-1 ring-inset ring-white/40 backdrop-blur-xl backdrop-saturate-150 dark:border-white/10 dark:bg-slate-900/50 dark:ring-white/10 sm:flex"
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={current.bottomBadge}
            initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: EASE }}
            className="whitespace-nowrap text-[11px] font-semibold text-[color:var(--color-primary)] dark:text-slate-100"
            style={{ fontFamily: fontBody }}
          >
            {current.bottomBadge}
          </motion.span>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function Hero({ onLogin }: { onLogin: () => void }) {
  const stagger: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
  };
  const item: Variants = {
    hidden: { y: 32, opacity: 0, filter: "blur(10px)" },
    show: {
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: { duration: 0.9, ease: EASE },
    },
  };

  return (
    <section className="relative isolate overflow-hidden px-6 pb-20 pt-36 sm:pt-40 lg:px-12 lg:pb-32 lg:pt-44">
      {/* Ambient mesh */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 right-[-10%] h-[640px] w-[640px] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,204,102,0.16),transparent_62%)] blur-3xl dark:bg-[radial-gradient(circle_at_center,rgba(0,204,102,0.10),transparent_62%)]" />
        <div className="absolute -bottom-32 left-[-10%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,51,102,0.10),transparent_60%)] blur-3xl dark:bg-[radial-gradient(circle_at_center,rgba(0,102,153,0.18),transparent_60%)]" />
      </div>

      <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-14 md:grid-cols-12 md:gap-10">
        {/* Left column */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="md:col-span-7"
        >
          <motion.div variants={item}>
            <span
              className="inline-flex items-center gap-2 rounded-full border border-gray-200/60 bg-white/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-[color:var(--color-primary)] backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
              style={{ fontFamily: fontMono }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-secondary)] shadow-[0_0_10px_rgba(0,204,102,0.6)]" />
              MoneyHub · v2
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-7 text-[clamp(2.75rem,6.5vw,5.5rem)] font-bold leading-[0.96] tracking-[-0.03em] text-[color:var(--color-primary)] dark:text-slate-100"
            style={{ fontFamily: fontHeading, textWrap: "balance" }}
          >
            Suas finanças,{" "}
            <span className="text-[color:var(--color-secondary)]">
              finalmente
            </span>{" "}
            no lugar certo.
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-7 max-w-[58ch] text-[17px] leading-relaxed text-gray-600 dark:text-slate-300 sm:text-[18px]"
            style={{ fontFamily: fontBody, textWrap: "pretty" }}
          >
            Uma plataforma de controle financeiro pessoal que une extração por
            inteligência artificial, categorização contextual e segurança de
            nível bancário — sem planilha, sem fricção.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={item}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <button
              onClick={onLogin}
              className="group flex items-center gap-3 rounded-full bg-[color:var(--color-secondary)] py-3.5 pl-6 pr-2 text-[14px] font-semibold text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[color:var(--color-secondary-dark)] active:scale-[0.98]"
              style={{ fontFamily: fontBody }}
            >
              <span>Entrar no MoneyHub</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-105">
                <ArrowUpRight size={15} strokeWidth={2.2} />
              </span>
            </button>

            <a
              href="#recursos"
              className="group inline-flex items-center gap-2 rounded-full border border-gray-200/70 bg-white/70 px-5 py-3.5 text-[14px] font-semibold text-[color:var(--color-primary)] backdrop-blur-md transition-colors hover:bg-white dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-800"
              style={{ fontFamily: fontBody }}
            >
              <span>Conhecer recursos</span>
              <ArrowRight
                size={14}
                strokeWidth={2.2}
                className="transition-transform duration-500 group-hover:translate-x-0.5"
              />
            </a>
          </motion.div>

          {/* Trust readout */}
          <motion.div
            variants={item}
            className="mt-12 grid max-w-xl grid-cols-3 gap-6 border-t border-gray-200/70 pt-6 dark:border-slate-800"
          >
            {[
              { k: "12.430+", l: "usuários ativos" },
              { k: "R$ 847M", l: "organizados" },
              { k: "99,97%", l: "uptime" },
            ].map((s) => (
              <div key={s.l}>
                <p
                  className="text-[22px] font-bold tracking-tight text-[color:var(--color-primary)] dark:text-slate-100 sm:text-[24px]"
                  style={{
                    fontFamily: fontHeading,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {s.k}
                </p>
                <p
                  className="mt-1 text-[11px] uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400"
                  style={{ fontFamily: fontMono }}
                >
                  {s.l}
                </p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right column */}
        <div className="md:col-span-5">
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}

function PillarsMarquee() {
  const pillars = [
    "Receitas e despesas",
    "Categorização contextual",
    "Contas e cartões",
    "Relatórios PDF & CSV",
    "IA para contracheques",
    "Investimentos",
    "Lembretes de vencimento",
    "Compartilhamento familiar",
  ];
  const loop = [...pillars, ...pillars];

  return (
    <section
      aria-label="Pilares"
      className="relative overflow-hidden border-y border-gray-200/70 bg-white/40 py-8 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/40"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-gray-50 to-transparent dark:from-slate-950" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-gray-50 to-transparent dark:from-slate-950" />
      <motion.div
        className="flex w-max gap-12"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          duration: 40,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        {loop.map((p, i) => (
          <div
            key={`${p}-${i}`}
            className="flex items-center gap-3 whitespace-nowrap"
          >
            <span
              className="text-[10px] uppercase tracking-[0.24em] text-gray-500 dark:text-slate-500"
              style={{ fontFamily: fontMono }}
            >
              ▸
            </span>
            <span
              className="text-[14px] font-semibold text-[color:var(--color-primary)] dark:text-slate-200"
              style={{ fontFamily: fontBody }}
            >
              {p}
            </span>
          </div>
        ))}
      </motion.div>
    </section>
  );
}

function BezelCard({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <Reveal delay={delay} className={className}>
      <div className="h-full rounded-[2.25rem] border border-white/40 bg-gradient-to-b from-white/70 to-white/40 p-1.5 shadow-[0_20px_50px_-25px_rgba(0,51,102,0.18)] ring-1 ring-inset ring-white/40 backdrop-blur-2xl backdrop-saturate-150 dark:border-white/[0.08] dark:from-slate-900/60 dark:to-slate-950/40 dark:ring-white/[0.06] dark:shadow-[0_20px_50px_-25px_rgba(0,0,0,0.55)]">
        <div className="flex h-full flex-col rounded-[calc(2.25rem-0.375rem)] bg-white/55 p-7 backdrop-blur-xl dark:bg-slate-900/45 sm:p-9">
          {children}
        </div>
      </div>
    </Reveal>
  );
}

function SectionKicker({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[11px] uppercase tracking-[0.2em] text-gray-500 dark:text-slate-400"
      style={{ fontFamily: fontMono }}
    >
      {children}
    </p>
  );
}

function BentoSection() {
  return (
    <section id="recursos" className="relative isolate overflow-hidden px-6 py-24 sm:py-32 lg:px-12">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-8%] top-1/4 h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,204,102,0.14),transparent_62%)] blur-3xl" />
        <div className="absolute right-[-6%] bottom-1/4 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,51,102,0.10),transparent_60%)] blur-3xl dark:bg-[radial-gradient(circle_at_center,rgba(0,102,153,0.16),transparent_60%)]" />
      </div>
      <div className="mx-auto max-w-[1320px]">
        <Reveal>
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <SectionKicker>— Recursos</SectionKicker>
              <h2
                className="mt-4 text-[clamp(2rem,4.2vw,3.4rem)] font-bold leading-[1] tracking-[-0.02em] text-[color:var(--color-primary)] dark:text-slate-100"
                style={{ fontFamily: fontHeading, textWrap: "balance" }}
              >
                O essencial.{" "}
                <span className="text-[color:var(--color-secondary)]">
                  Sem ruído.
                </span>
              </h2>
            </div>
            <p
              className="max-w-sm text-[15px] leading-relaxed text-gray-600 dark:text-slate-400"
              style={{ fontFamily: fontBody }}
            >
              Tudo que você precisa para entender, decidir e crescer. Nada que
              você não vá usar.
            </p>
          </div>
        </Reveal>

        {/* Bento grid */}
        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5">
          {/* Card A — wide, AI extraction */}
          <BezelCard className="md:col-span-7" delay={0.05}>
            <SectionKicker>IA aplicada</SectionKicker>
            <h3
              className="mt-6 text-[26px] font-bold leading-tight tracking-tight text-[color:var(--color-primary)] dark:text-slate-100 sm:text-[30px]"
              style={{ fontFamily: fontHeading, textWrap: "balance" }}
            >
              Extração automática de{" "}
              <span className="text-[color:var(--color-secondary)]">
                contracheques e extratos
              </span>
              .
            </h3>
            <p
              className="mt-4 max-w-md text-[14.5px] leading-relaxed text-gray-600 dark:text-slate-400"
              style={{ fontFamily: fontBody }}
            >
              Envie um PDF ou foto. O MoneyHub interpreta valores, descontos e
              categorias automaticamente — você revisa e confirma.
            </p>
            <div className="mt-auto pt-8">
              <div className="rounded-2xl border border-gray-200/70 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center justify-between">
                  <span
                    className="text-[11px] uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400"
                    style={{ fontFamily: fontMono }}
                  >
                    contracheque · abr.pdf
                  </span>
                  <span
                    className="rounded-full bg-[color:var(--color-secondary)]/15 px-2 py-0.5 text-[10px] font-medium text-[color:var(--color-secondary-dark)] dark:text-[color:var(--color-secondary-light)]"
                    style={{ fontFamily: fontMono }}
                  >
                    extraído em 1,8s
                  </span>
                </div>
                <div
                  className="mt-3 grid grid-cols-2 gap-2 text-[12.5px] text-gray-600 dark:text-slate-300 sm:grid-cols-4"
                  style={{ fontFamily: fontMono }}
                >
                  {[
                    ["Bruto", "8.450,00"],
                    ["INSS", "-742,18"],
                    ["IRRF", "-583,40"],
                    ["Líquido", "7.124,42"],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-gray-500 dark:text-slate-400">
                        {k}
                      </p>
                      <p
                        className="mt-0.5 font-semibold text-[color:var(--color-primary)] dark:text-slate-100"
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {v}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </BezelCard>

          {/* Card B — categorization */}
          <BezelCard className="md:col-span-5" delay={0.12}>
            <SectionKicker>Categorização</SectionKicker>
            <h3
              className="mt-6 text-[24px] font-bold leading-tight tracking-tight text-[color:var(--color-primary)] dark:text-slate-100 sm:text-[26px]"
              style={{ fontFamily: fontHeading, textWrap: "balance" }}
            >
              Cada gasto, no lugar certo.
            </h3>
            <p
              className="mt-4 text-[14.5px] leading-relaxed text-gray-600 dark:text-slate-400"
              style={{ fontFamily: fontBody }}
            >
              Categorias personalizáveis, regras inteligentes e sugestões
              baseadas no seu histórico.
            </p>
            <div className="mt-auto space-y-2 pt-8">
              {[
                { label: "Mercado", pct: 28, color: "var(--color-primary)" },
                { label: "Moradia", pct: 21, color: "var(--color-secondary)" },
                { label: "Transporte", pct: 14, color: "#94A3B8" },
              ].map((c) => (
                <div key={c.label}>
                  <div
                    className="mb-1 flex items-center justify-between text-[12px] text-gray-600 dark:text-slate-300"
                    style={{ fontFamily: fontMono }}
                  >
                    <span>{c.label}</span>
                    <span
                      style={{ fontVariantNumeric: "tabular-nums" }}
                      className="text-[color:var(--color-primary)] dark:text-slate-100"
                    >
                      {c.pct}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-slate-800">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${c.pct}%` }}
                      viewport={{ once: true, margin: "-15%" }}
                      transition={{ duration: 1, ease: EASE, delay: 0.3 }}
                      style={{ background: c.color }}
                      className="h-full rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </BezelCard>

          {/* Card C — sharing */}
          <BezelCard className="md:col-span-5" delay={0.05}>
            <SectionKicker>Compartilhamento</SectionKicker>
            <h3
              className="mt-6 text-[24px] font-bold leading-tight tracking-tight text-[color:var(--color-primary)] dark:text-slate-100 sm:text-[26px]"
              style={{ fontFamily: fontHeading, textWrap: "balance" }}
            >
              Casal, família,{" "}
              <span className="text-[color:var(--color-secondary)]">
                ou só você
              </span>
              .
            </h3>
            <p
              className="mt-4 text-[14.5px] leading-relaxed text-gray-600 dark:text-slate-400"
              style={{ fontFamily: fontBody }}
            >
              Convide membros com permissões granulares. Decisões financeiras
              deixam de ser conversas difíceis.
            </p>
            <div className="mt-auto pt-8">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[
                    { name: "MC", bg: "var(--color-primary)" },
                    { name: "RA", bg: "var(--color-secondary-dark)" },
                    { name: "JL", bg: "var(--color-danger)" },
                  ].map((u) => (
                    <span
                      key={u.name}
                      className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-[11px] font-semibold text-white dark:border-slate-900"
                      style={{
                        background: u.bg,
                        fontFamily: fontMono,
                      }}
                    >
                      {u.name}
                    </span>
                  ))}
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-[12px] font-medium text-gray-600 dark:border-slate-900 dark:bg-slate-800 dark:text-slate-300">
                    <Plus size={13} strokeWidth={2.2} />
                  </span>
                </div>
                <span
                  className="text-[12px] text-gray-600 dark:text-slate-400"
                  style={{ fontFamily: fontBody }}
                >
                  3 membros · 1 administrador
                </span>
              </div>
            </div>
          </BezelCard>

          {/* Card D — reports */}
          <BezelCard className="md:col-span-7" delay={0.12}>
            <SectionKicker>Relatórios</SectionKicker>
            <h3
              className="mt-6 text-[26px] font-bold leading-tight tracking-tight text-[color:var(--color-primary)] dark:text-slate-100 sm:text-[30px]"
              style={{ fontFamily: fontHeading, textWrap: "balance" }}
            >
              Exporte em{" "}
              <span className="text-[color:var(--color-secondary)]">
                PDF
              </span>{" "}
              ou{" "}
              <span className="text-[color:var(--color-secondary)]">
                CSV
              </span>{" "}
              com um toque.
            </h3>
            <p
              className="mt-4 max-w-md text-[14.5px] leading-relaxed text-gray-600 dark:text-slate-400"
              style={{ fontFamily: fontBody }}
            >
              Relatórios mensais, anuais ou personalizados — prontos para
              imprimir, enviar ao contador ou anexar ao IRPF.
            </p>
            <div className="mt-auto grid grid-cols-2 gap-3 pt-8">
              {[
                {
                  type: "PDF",
                  label: "Relatório mai · 2026",
                  meta: "42 transações · 8 categorias",
                },
                {
                  type: "CSV",
                  label: "Movimentações Q1 · 2026",
                  meta: "318 linhas · 24 KB",
                },
              ].map((r) => (
                <div
                  key={r.type}
                  className="rounded-2xl border border-gray-200/70 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-800/40"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="rounded-md bg-[color:var(--color-primary)] px-1.5 py-0.5 text-[10px] font-medium text-white"
                      style={{ fontFamily: fontMono }}
                    >
                      {r.type}
                    </span>
                    <ArrowUpRight
                      size={14}
                      strokeWidth={2.2}
                      className="text-gray-400 dark:text-slate-500"
                    />
                  </div>
                  <p
                    className="mt-3 text-[13px] font-semibold text-[color:var(--color-primary)] dark:text-slate-100"
                    style={{ fontFamily: fontBody }}
                  >
                    {r.label}
                  </p>
                  <p
                    className="mt-1 text-[11px] text-gray-500 dark:text-slate-400"
                    style={{ fontFamily: fontMono }}
                  >
                    {r.meta}
                  </p>
                </div>
              ))}
            </div>
          </BezelCard>
        </div>
      </div>
    </section>
  );
}

function TrustSection() {
  return (
    <section
      id="seguranca"
      className="relative overflow-hidden px-6 py-24 sm:py-32 lg:px-12"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute right-0 top-1/3 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,204,102,0.10),transparent_60%)] blur-3xl" />
      </div>
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-14 md:grid-cols-12 md:gap-10">
        <Reveal className="md:col-span-6">
          <SectionKicker>— Segurança</SectionKicker>
          <h2
            className="mt-4 text-[clamp(2rem,4.4vw,3.6rem)] font-bold leading-[1] tracking-[-0.025em] text-[color:var(--color-primary)] dark:text-slate-100"
            style={{ fontFamily: fontHeading, textWrap: "balance" }}
          >
            Não é{" "}
            <span className="text-[color:var(--color-secondary)]">
              luxo
            </span>
            . É o mínimo que você merece.
          </h2>
          <p
            className="mt-6 max-w-md text-[15.5px] leading-relaxed text-gray-600 dark:text-slate-400"
            style={{ fontFamily: fontBody }}
          >
            Senhas com hash bcrypt, autenticação JWT em cookies HTTPOnly,
            proteção CORS e XSS no nível do servidor. Os seus dados são seus —
            ponto.
          </p>
        </Reveal>

        <div className="md:col-span-6">
          <div className="divide-y divide-gray-200/70 border-y border-gray-200/70 dark:divide-slate-800 dark:border-slate-800">
            {[
              {
                title: "Criptografia bcrypt",
                desc: "Senhas armazenadas com hash de 12 rounds. Nem nós conseguimos ler.",
              },
              {
                title: "Tokens JWT em cookies HTTPOnly",
                desc: "Sessões assinadas, inacessíveis a scripts. Logout limpa tudo.",
              },
              {
                title: "Proteção CORS, XSS e CSRF",
                desc: "Camadas defensivas auditadas a cada release.",
              },
            ].map((s, i) => (
              <Reveal key={s.title} delay={i * 0.08}>
                <div className="flex items-start gap-5 py-6">
                  <span
                    className="mt-1 flex h-7 shrink-0 items-center justify-center rounded-md bg-[color:var(--color-primary)] px-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-white"
                    style={{ fontFamily: fontMono }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1">
                    <h3
                      className="text-[16.5px] font-semibold tracking-tight text-[color:var(--color-primary)] dark:text-slate-100"
                      style={{ fontFamily: fontHeading }}
                    >
                      {s.title}
                    </h3>
                    <p
                      className="mt-1.5 text-[14px] leading-relaxed text-gray-600 dark:text-slate-400"
                      style={{ fontFamily: fontBody }}
                    >
                      {s.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const items = [
    {
      q: "Preciso conectar minha conta bancária?",
      a: "Não. O MoneyHub funciona com lançamentos manuais ou importação por PDF/CSV. Open Finance é opcional e está no roadmap.",
    },
    {
      q: "Funciona em mobile?",
      a: "Sim. A interface é responsiva e está disponível como PWA instalável, com acesso offline parcial.",
    },
    {
      q: "Posso usar com meu casal ou família?",
      a: "Pode. Convide até 4 membros por conta familiar, com permissões granulares (administrador, contribuinte ou visualização).",
    },
    {
      q: "Como exporto os dados para o contador?",
      a: "Relatórios PDF prontos para impressão e CSV para planilhas. Exportação mensal, anual ou por período personalizado.",
    },
  ];

  return (
    <section className="px-6 py-24 sm:py-32 lg:px-12">
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-14 md:grid-cols-12 md:gap-10">
        <Reveal className="md:col-span-5">
          <SectionKicker>— Perguntas frequentes</SectionKicker>
          <h2
            className="mt-4 text-[clamp(1.9rem,3.8vw,3rem)] font-bold leading-[1] tracking-[-0.02em] text-[color:var(--color-primary)] dark:text-slate-100"
            style={{ fontFamily: fontHeading, textWrap: "balance" }}
          >
            Antes de você{" "}
            <span className="text-[color:var(--color-secondary)]">
              perguntar
            </span>
            .
          </h2>
          <p
            className="mt-6 max-w-sm text-[15px] leading-relaxed text-gray-600 dark:text-slate-400"
            style={{ fontFamily: fontBody }}
          >
            Algo que não está aqui? Fale com a gente em{" "}
            <a
              href="mailto:contato@moneyhub.app"
              className="text-[color:var(--color-primary)] underline decoration-[color:var(--color-secondary)] decoration-2 underline-offset-4 dark:text-slate-200"
            >
              contato@moneyhub.app
            </a>
            .
          </p>
        </Reveal>

        <div className="md:col-span-7">
          <div className="border-t border-gray-200/70 dark:border-slate-800">
            {items.map((it, i) => {
              const isOpen = open === i;
              return (
                <div
                  key={it.q}
                  className="border-b border-gray-200/70 dark:border-slate-800"
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-start justify-between gap-6 py-6 text-left transition-colors hover:text-[color:var(--color-primary)] dark:hover:text-slate-100"
                  >
                    <span
                      className="text-[16.5px] font-semibold text-[color:var(--color-primary)] dark:text-slate-100"
                      style={{ fontFamily: fontHeading }}
                    >
                      {it.q}
                    </span>
                    <span className="mt-0.5 shrink-0 text-gray-500 dark:text-slate-400">
                      {isOpen ? (
                        <Minus size={18} strokeWidth={1.8} />
                      ) : (
                        <Plus size={18} strokeWidth={1.8} />
                      )}
                    </span>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{
                      height: isOpen ? "auto" : 0,
                      opacity: isOpen ? 1 : 0,
                    }}
                    transition={{ duration: 0.45, ease: EASE }}
                    style={{ overflow: "hidden" }}
                  >
                    <p
                      className="pb-6 pr-10 text-[15px] leading-relaxed text-gray-600 dark:text-slate-400"
                      style={{ fontFamily: fontBody }}
                    >
                      {it.a}
                    </p>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA({ onLogin }: { onLogin: () => void }) {
  return (
    <section id="sobre" className="px-6 py-24 sm:py-32 lg:px-12">
      <div className="mx-auto max-w-[1320px]">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] border border-gray-200/60 bg-[color:var(--color-primary)] p-10 dark:border-slate-800 dark:bg-[color:var(--color-primary-dark)] sm:p-16 lg:p-20">
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute -top-32 -right-20 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,204,102,0.35),transparent_60%)] blur-3xl" />
              <div className="absolute -bottom-24 -left-12 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_60%)] blur-3xl" />
            </div>

            <div className="relative grid grid-cols-1 gap-10 md:grid-cols-12 md:items-end md:gap-12">
              <div className="md:col-span-8">
                <p
                  className="text-[11px] uppercase tracking-[0.22em] text-white/50"
                  style={{ fontFamily: fontMono }}
                >
                  — Comece agora
                </p>
                <h2
                  className="mt-5 text-[clamp(2.2rem,5vw,4.4rem)] font-bold leading-[1] tracking-[-0.03em] text-white"
                  style={{ fontFamily: fontHeading, textWrap: "balance" }}
                >
                  Deixe sua planilha em paz.{" "}
                  <span className="text-[color:var(--color-secondary-light)]">
                    Comece hoje.
                  </span>
                </h2>
                <p
                  className="mt-6 max-w-lg text-[16px] leading-relaxed text-white/70"
                  style={{ fontFamily: fontBody }}
                >
                  Cadastro gratuito. Sem cartão de crédito. Importe seu
                  histórico em segundos.
                </p>
              </div>

              <div className="md:col-span-4 md:text-right">
                <button
                  onClick={onLogin}
                  className="group inline-flex items-center gap-3 rounded-full bg-[color:var(--color-secondary)] py-4 pl-6 pr-2 text-[14.5px] font-semibold text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[color:var(--color-secondary-dark)] active:scale-[0.98]"
                  style={{ fontFamily: fontBody }}
                >
                  <span>Entrar no MoneyHub</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-105">
                    <ArrowUpRight size={15} strokeWidth={2.2} />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-200/70 px-6 py-12 dark:border-slate-800 lg:px-12">
      <div className="mx-auto flex max-w-[1320px] flex-col items-start justify-between gap-8 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <Logo size="md" href={false} />
          <span
            className="text-[12px] text-gray-500 dark:text-slate-400"
            style={{ fontFamily: fontMono }}
          >
            © 2026 · controle financeiro inteligente
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {[
            { label: "Privacidade", href: "/privacy" },
            { label: "Termos", href: "/terms" },
            { label: "Contato", href: "mailto:contato@moneyhub.app" },
          ].map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-[13px] text-gray-600 transition-colors hover:text-[color:var(--color-secondary)] dark:text-slate-400 dark:hover:text-[color:var(--color-secondary-light)]"
              style={{ fontFamily: fontBody }}
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default function MoneyHubHomePage() {
  const router = useRouter();

  React.useEffect(() => {
    router.prefetch("/auth/login");
  }, [router]);

  const handleLoginRedirect = () => {
    router.push("/auth/login");
  };

  return (
    <div
      className="relative min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-gray-50 text-[color:var(--color-primary)] selection:bg-[color:var(--color-primary)] selection:text-white dark:bg-slate-950 dark:text-slate-100"
      style={{ fontFamily: fontBody }}
    >
      <a
        href="#recursos"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-[color:var(--color-primary)] focus:px-4 focus:py-2 focus:text-white"
      >
        Ir para conteúdo
      </a>

      <Nav onLogin={handleLoginRedirect} />

      <main>
        <Hero onLogin={handleLoginRedirect} />
        <PillarsMarquee />
        <BentoSection />
        <TrustSection />
        <FAQ />
        <FinalCTA onLogin={handleLoginRedirect} />
      </main>

      <Footer />
    </div>
  );
}
