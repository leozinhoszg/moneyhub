"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import {
  motion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import {
  ArrowUpRight,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  PieChart,
  FileText,
  Users,
  ShieldCheck,
  LockKeyhole,
  Plus,
  Minus,
  Receipt,
} from "lucide-react";

const EASE = [0.32, 0.72, 0, 1] as const;
const SPRING = { type: "spring" as const, stiffness: 110, damping: 22 };

const fontSans = "var(--font-sans), ui-sans-serif, system-ui";
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

function Nav({ onLogin }: { onLogin: () => void }) {
  return (
    <motion.nav
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
      className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:top-6"
    >
      <div className="flex items-center gap-1.5 rounded-full border border-black/[0.06] bg-white/75 p-1.5 pl-2 shadow-[0_10px_40px_-18px_rgba(1,58,86,0.25)] backdrop-blur-xl">
        <div className="px-1.5 translate-y-[2px]">
          <Logo size="sm" href={false} />
        </div>
        <div className="hidden h-5 w-px bg-black/10 sm:block" />
        <div className="hidden items-center gap-0.5 sm:flex">
          {[
            { label: "Recursos", href: "#recursos" },
            { label: "Segurança", href: "#seguranca" },
            { label: "Sobre", href: "#sobre" },
          ].map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="rounded-full px-3 py-1.5 text-[13px] text-[#4A5868] transition-colors hover:bg-black/[0.04] hover:text-[#013a56]"
              style={{ fontFamily: fontSans }}
            >
              {l.label}
            </a>
          ))}
        </div>
        <button
          onClick={onLogin}
          className="group ml-0.5 flex items-center gap-2 rounded-full bg-[#013a56] py-1.5 pl-3.5 pr-1.5 text-[13px] font-medium text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#012438] active:scale-[0.98]"
          style={{ fontFamily: fontSans }}
        >
          <span>Entrar</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/12 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
            <ArrowUpRight size={13} strokeWidth={2.2} />
          </span>
        </button>
      </div>
    </motion.nav>
  );
}

function HeroVisual() {
  const { scrollY } = useScroll();
  const float = useTransform(scrollY, [0, 600], [0, -40]);
  const rotate = useTransform(scrollY, [0, 600], [0, 2]);

  return (
    <motion.div
      style={{ y: float, rotate }}
      className="relative mx-auto w-full max-w-md"
    >
      {/* Outer shell — Double-Bezel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, ease: EASE, delay: 0.5 }}
        className="rounded-[2.25rem] border border-black/[0.06] bg-gradient-to-b from-white to-[#F5F7F8] p-1.5 shadow-[0_30px_80px_-30px_rgba(1,58,86,0.35)]"
      >
        {/* Inner core */}
        <div className="rounded-[calc(2.25rem-0.375rem)] bg-white p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_1px_2px_rgba(1,58,86,0.04)]">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#013a56] text-white">
                <Receipt size={15} strokeWidth={2} />
              </div>
              <div>
                <p
                  className="text-[10px] uppercase tracking-[0.18em] text-[#8B95A1]"
                  style={{ fontFamily: fontMono }}
                >
                  Saldo total
                </p>
                <p
                  className="text-[11px] text-[#4A5868]"
                  style={{ fontFamily: fontMono }}
                >
                  mai · 2026
                </p>
              </div>
            </div>
            <span
              className="flex items-center gap-1 rounded-full bg-[#E8F8F0] px-2 py-1 text-[10px] font-medium text-[#0A7A47]"
              style={{ fontFamily: fontMono }}
            >
              <TrendingUp size={11} strokeWidth={2.4} />
              +12.4%
            </span>
          </div>

          {/* Big number */}
          <div className="mt-5">
            <div
              className="flex items-baseline gap-1 text-[#013a56]"
              style={{ fontFamily: fontSans }}
            >
              <span className="text-[15px] font-medium opacity-70">R$</span>
              <motion.span
                className="text-[40px] font-medium leading-none tracking-tight"
                style={{ fontVariantNumeric: "tabular-nums" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2, ease: EASE, delay: 1.0 }}
              >
                47.218
              </motion.span>
              <span className="text-[18px] font-medium opacity-70">,90</span>
            </div>
            <p
              className="mt-1 text-[12px] text-[#8B95A1]"
              style={{ fontFamily: fontSans }}
            >
              4 contas · 3 cartões sincronizados
            </p>
          </div>

          {/* Chart area */}
          <div className="mt-5 grid grid-cols-7 items-end gap-1.5 px-1">
            {[28, 42, 35, 60, 48, 72, 65].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: `${h}px`, opacity: 1 }}
                transition={{
                  duration: 0.7,
                  delay: 1.1 + i * 0.06,
                  ease: EASE,
                }}
                className={`w-full rounded-t-md ${
                  i === 5
                    ? "bg-[#00cc66]"
                    : "bg-gradient-to-t from-[#013a56]/12 to-[#013a56]/30"
                }`}
              />
            ))}
          </div>
          <div
            className="mt-2 grid grid-cols-7 gap-1.5 px-1 text-center text-[10px] text-[#A0AAB6]"
            style={{ fontFamily: fontMono }}
          >
            {["S", "T", "Q", "Q", "S", "S", "D"].map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>

          {/* Activity row */}
          <div className="mt-5 space-y-2">
            {[
              {
                label: "Mercado · Carrefour",
                value: "-R$ 312,40",
                neg: true,
              },
              {
                label: "Salário · Proma Group",
                value: "+R$ 8.450,00",
                neg: false,
              },
            ].map((t, i) => (
              <motion.div
                key={t.label}
                initial={{ x: -8, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 1.5 + i * 0.12,
                  ease: EASE,
                }}
                className="flex items-center justify-between rounded-xl border border-black/[0.04] bg-[#FAFBFC] px-3 py-2"
              >
                <span
                  className="text-[12px] text-[#4A5868]"
                  style={{ fontFamily: fontSans }}
                >
                  {t.label}
                </span>
                <span
                  className={`text-[12px] font-medium ${
                    t.neg ? "text-[#C53F2E]" : "text-[#0A7A47]"
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
          </div>
        </div>
      </motion.div>

      {/* Floating sparkle chip */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ ...SPRING, delay: 1.4 }}
        className="absolute -left-6 top-16 hidden items-center gap-2 rounded-full border border-black/[0.06] bg-white px-3 py-2 shadow-[0_12px_30px_-14px_rgba(1,58,86,0.3)] sm:flex"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00cc66]/15 text-[#0A7A47]">
          <Sparkles size={12} strokeWidth={2.2} />
        </span>
        <div className="pr-1">
          <p
            className="text-[10px] uppercase tracking-[0.18em] text-[#8B95A1]"
            style={{ fontFamily: fontMono }}
          >
            IA
          </p>
          <p
            className="text-[11px] font-medium text-[#013a56]"
            style={{ fontFamily: fontSans }}
          >
            Contracheque lido
          </p>
        </div>
      </motion.div>

      {/* Floating shield chip */}
      <motion.div
        initial={{ opacity: 0, y: -16, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ ...SPRING, delay: 1.6 }}
        className="absolute -right-4 -bottom-3 hidden items-center gap-2 rounded-full border border-black/[0.06] bg-white px-3 py-2 shadow-[0_12px_30px_-14px_rgba(1,58,86,0.3)] sm:flex"
      >
        <LockKeyhole size={13} className="text-[#013a56]" strokeWidth={2.2} />
        <span
          className="text-[11px] font-medium text-[#013a56]"
          style={{ fontFamily: fontSans }}
        >
          Criptografia bancária
        </span>
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
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -top-40 right-[-10%] h-[640px] w-[640px] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,204,102,0.16),transparent_62%)] blur-3xl" />
        <div className="absolute -bottom-32 left-[-10%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(1,58,86,0.10),transparent_60%)] blur-3xl" />
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
              className="inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-white/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-[#013a56] backdrop-blur-md"
              style={{ fontFamily: fontMono }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#00cc66] shadow-[0_0_10px_rgba(0,204,102,0.6)]" />
              MoneyHub · v2
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-7 text-[clamp(2.75rem,6.5vw,5.5rem)] font-medium leading-[0.96] tracking-[-0.03em] text-[#013a56]"
            style={{
              fontFamily: fontSans,
              textWrap: "balance",
            }}
          >
            Suas finanças,{" "}
            <span
              className="accent text-[#39cc60]">
              finalmente
            </span>{" "}
            no lugar certo.
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-7 max-w-[58ch] text-[17px] leading-relaxed text-[#4A5868] sm:text-[18px]"
            style={{ fontFamily: fontSans, textWrap: "pretty" }}
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
              className="group flex items-center gap-3 rounded-full bg-[#013a56] py-3.5 pl-6 pr-2 text-[14px] font-medium text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#012438] active:scale-[0.98]"
              style={{ fontFamily: fontSans }}
            >
              <span>Entrar no MoneyHub</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/12 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-105">
                <ArrowUpRight size={15} strokeWidth={2.2} />
              </span>
            </button>

            <a
              href="#recursos"
              className="group inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/70 px-5 py-3.5 text-[14px] font-medium text-[#013a56] backdrop-blur-md transition-colors hover:bg-white"
              style={{ fontFamily: fontSans }}
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
            className="mt-12 grid max-w-xl grid-cols-3 gap-6 border-t border-black/[0.06] pt-6"
          >
            {[
              { k: "12.430+", l: "usuários ativos" },
              { k: "R$ 847M", l: "organizados" },
              { k: "99.97%", l: "uptime" },
            ].map((s) => (
              <div key={s.l}>
                <p
                  className="text-[22px] font-medium tracking-tight text-[#013a56] sm:text-[24px]"
                  style={{
                    fontFamily: fontSans,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {s.k}
                </p>
                <p
                  className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[#8B95A1]"
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
      className="relative overflow-hidden border-y border-black/[0.06] bg-white/40 py-8 backdrop-blur-sm"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#F7F8FA] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#F7F8FA] to-transparent" />
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
              className="text-[10px] uppercase tracking-[0.24em] text-[#8B95A1]"
              style={{ fontFamily: fontMono }}
            >
              ▸
            </span>
            <span
              className="text-[14px] font-medium text-[#013a56]"
              style={{ fontFamily: fontSans }}
            >
              {p}
            </span>
          </div>
        ))}
      </motion.div>
    </section>
  );
}

function BentoCard({
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
      <div className="h-full rounded-[2.25rem] border border-black/[0.05] bg-gradient-to-b from-white to-[#F5F7F8] p-1.5 shadow-[0_20px_50px_-25px_rgba(1,58,86,0.18)]">
        <div className="flex h-full flex-col rounded-[calc(2.25rem-0.375rem)] bg-white p-7 sm:p-9">
          {children}
        </div>
      </div>
    </Reveal>
  );
}

function BentoSection() {
  return (
    <section id="recursos" className="px-6 py-24 sm:py-32 lg:px-12">
      <div className="mx-auto max-w-[1320px]">
        <Reveal>
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p
                className="text-[11px] uppercase tracking-[0.22em] text-[#8B95A1]"
                style={{ fontFamily: fontMono }}
              >
                — Recursos
              </p>
              <h2
                className="mt-4 text-[clamp(2rem,4.2vw,3.4rem)] font-medium leading-[1] tracking-[-0.02em] text-[#013a56]"
                style={{ fontFamily: fontSans, textWrap: "balance" }}
              >
                O essencial.{" "}
                <span className="accent text-[#39cc60]">
                  Sem ruído.
                </span>
              </h2>
            </div>
            <p
              className="max-w-sm text-[15px] leading-relaxed text-[#4A5868]"
              style={{ fontFamily: fontSans }}
            >
              Tudo que você precisa para entender, decidir e crescer. Nada que
              você não vá usar.
            </p>
          </div>
        </Reveal>

        {/* Bento grid — interlocked 7/5 + 5/7 */}
        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5">
          {/* Card A — wide, AI extraction */}
          <BentoCard className="md:col-span-7" delay={0.05}>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#013a56] text-white">
                <Sparkles size={16} strokeWidth={2} />
              </span>
              <span
                className="text-[11px] uppercase tracking-[0.2em] text-[#8B95A1]"
                style={{ fontFamily: fontMono }}
              >
                IA aplicada
              </span>
            </div>
            <h3
              className="mt-6 text-[26px] font-medium leading-tight tracking-tight text-[#013a56] sm:text-[30px]"
              style={{ fontFamily: fontSans, textWrap: "balance" }}
            >
              Extração automática de{" "}
              <span
                className="accent text-[#39cc60]">
                contracheques e extratos
              </span>
              .
            </h3>
            <p
              className="mt-4 max-w-md text-[14.5px] leading-relaxed text-[#4A5868]"
              style={{ fontFamily: fontSans }}
            >
              Envie um PDF ou foto. O MoneyHub interpreta valores, descontos e
              categorias automaticamente — você revisa e confirma.
            </p>
            <div className="mt-auto pt-8">
              <div className="rounded-2xl border border-black/[0.05] bg-[#FAFBFC] p-4">
                <div className="flex items-center justify-between">
                  <span
                    className="text-[11px] uppercase tracking-[0.18em] text-[#8B95A1]"
                    style={{ fontFamily: fontMono }}
                  >
                    contracheque · abr.pdf
                  </span>
                  <span
                    className="rounded-full bg-[#E8F8F0] px-2 py-0.5 text-[10px] font-medium text-[#0A7A47]"
                    style={{ fontFamily: fontMono }}
                  >
                    extraído em 1.8s
                  </span>
                </div>
                <div
                  className="mt-3 grid grid-cols-2 gap-2 text-[12.5px] text-[#4A5868] sm:grid-cols-4"
                  style={{ fontFamily: fontMono }}
                >
                  {[
                    ["Bruto", "8 450,00"],
                    ["INSS", "-742,18"],
                    ["IRRF", "-583,40"],
                    ["Líquido", "7 124,42"],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-[#8B95A1]">
                        {k}
                      </p>
                      <p
                        className="mt-0.5 font-medium text-[#013a56]"
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {v}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </BentoCard>

          {/* Card B — categorization */}
          <BentoCard className="md:col-span-5" delay={0.12}>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#013a56] text-white">
                <PieChart size={16} strokeWidth={2} />
              </span>
              <span
                className="text-[11px] uppercase tracking-[0.2em] text-[#8B95A1]"
                style={{ fontFamily: fontMono }}
              >
                Categorização
              </span>
            </div>
            <h3
              className="mt-6 text-[24px] font-medium leading-tight tracking-tight text-[#013a56] sm:text-[26px]"
              style={{ fontFamily: fontSans, textWrap: "balance" }}
            >
              Cada gasto, no lugar certo.
            </h3>
            <p
              className="mt-4 text-[14.5px] leading-relaxed text-[#4A5868]"
              style={{ fontFamily: fontSans }}
            >
              Categorias personalizáveis, regras inteligentes e sugestões
              baseadas no seu histórico.
            </p>
            <div className="mt-auto space-y-2 pt-8">
              {[
                { label: "Mercado", pct: 28, color: "#013a56" },
                { label: "Moradia", pct: 21, color: "#00cc66" },
                { label: "Transporte", pct: 14, color: "#8B95A1" },
              ].map((c) => (
                <div key={c.label}>
                  <div
                    className="mb-1 flex items-center justify-between text-[12px]"
                    style={{
                      fontFamily: fontMono,
                      color: "#4A5868",
                    }}
                  >
                    <span>{c.label}</span>
                    <span
                      style={{ fontVariantNumeric: "tabular-nums" }}
                      className="text-[#013a56]"
                    >
                      {c.pct}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/[0.04]">
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
          </BentoCard>

          {/* Card C — sharing */}
          <BentoCard className="md:col-span-5" delay={0.05}>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#013a56] text-white">
                <Users size={16} strokeWidth={2} />
              </span>
              <span
                className="text-[11px] uppercase tracking-[0.2em] text-[#8B95A1]"
                style={{ fontFamily: fontMono }}
              >
                Compartilhamento
              </span>
            </div>
            <h3
              className="mt-6 text-[24px] font-medium leading-tight tracking-tight text-[#013a56] sm:text-[26px]"
              style={{ fontFamily: fontSans, textWrap: "balance" }}
            >
              Casal, família,{" "}
              <span
                className="accent text-[#39cc60]">
                ou só você
              </span>
              .
            </h3>
            <p
              className="mt-4 text-[14.5px] leading-relaxed text-[#4A5868]"
              style={{ fontFamily: fontSans }}
            >
              Convide membros com permissões granulares. Decisões financeiras
              deixam de ser conversas difíceis.
            </p>
            <div className="mt-auto pt-8">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[
                    { name: "MC", bg: "#013a56" },
                    { name: "RA", bg: "#0A7A47" },
                    { name: "JL", bg: "#C53F2E" },
                  ].map((u) => (
                    <span
                      key={u.name}
                      className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-[11px] font-medium text-white"
                      style={{
                        background: u.bg,
                        fontFamily: fontMono,
                      }}
                    >
                      {u.name}
                    </span>
                  ))}
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#F0F2F5] text-[12px] font-medium text-[#4A5868]">
                    <Plus size={13} strokeWidth={2.2} />
                  </span>
                </div>
                <span
                  className="text-[12px] text-[#4A5868]"
                  style={{ fontFamily: fontSans }}
                >
                  3 membros · 1 administrador
                </span>
              </div>
            </div>
          </BentoCard>

          {/* Card D — reports */}
          <BentoCard className="md:col-span-7" delay={0.12}>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#013a56] text-white">
                <FileText size={16} strokeWidth={2} />
              </span>
              <span
                className="text-[11px] uppercase tracking-[0.2em] text-[#8B95A1]"
                style={{ fontFamily: fontMono }}
              >
                Relatórios
              </span>
            </div>
            <h3
              className="mt-6 text-[26px] font-medium leading-tight tracking-tight text-[#013a56] sm:text-[30px]"
              style={{ fontFamily: fontSans, textWrap: "balance" }}
            >
              Exporte em{" "}
              <span
                className="accent text-[#39cc60]">
                PDF
              </span>{" "}
              ou{" "}
              <span
                className="accent text-[#39cc60]">
                CSV
              </span>{" "}
              com um toque.
            </h3>
            <p
              className="mt-4 max-w-md text-[14.5px] leading-relaxed text-[#4A5868]"
              style={{ fontFamily: fontSans }}
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
                  className="rounded-2xl border border-black/[0.05] bg-[#FAFBFC] p-4"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="rounded-md bg-[#013a56] px-1.5 py-0.5 text-[10px] font-medium text-white"
                      style={{ fontFamily: fontMono }}
                    >
                      {r.type}
                    </span>
                    <ArrowUpRight
                      size={14}
                      strokeWidth={2.2}
                      className="text-[#8B95A1]"
                    />
                  </div>
                  <p
                    className="mt-3 text-[13px] font-medium text-[#013a56]"
                    style={{ fontFamily: fontSans }}
                  >
                    {r.label}
                  </p>
                  <p
                    className="mt-1 text-[11px] text-[#8B95A1]"
                    style={{ fontFamily: fontMono }}
                  >
                    {r.meta}
                  </p>
                </div>
              ))}
            </div>
          </BentoCard>
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
          <p
            className="text-[11px] uppercase tracking-[0.22em] text-[#8B95A1]"
            style={{ fontFamily: fontMono }}
          >
            — Segurança
          </p>
          <h2
            className="mt-4 text-[clamp(2rem,4.4vw,3.6rem)] font-medium leading-[1] tracking-[-0.025em] text-[#013a56]"
            style={{ fontFamily: fontSans, textWrap: "balance" }}
          >
            Não é{" "}
            <span
              className="accent text-[#39cc60]">
              luxo
            </span>
            . É o mínimo que você merece.
          </h2>
          <p
            className="mt-6 max-w-md text-[15.5px] leading-relaxed text-[#4A5868]"
            style={{ fontFamily: fontSans }}
          >
            Senhas com hash bcrypt, autenticação JWT em cookies HTTPOnly,
            proteção CORS e XSS no nível do servidor. Os seus dados são seus —
            ponto.
          </p>
        </Reveal>

        <div className="md:col-span-6">
          <div className="divide-y divide-black/[0.06] border-y border-black/[0.06]">
            {[
              {
                title: "Criptografia bcrypt",
                desc: "Senhas armazenadas com hash de 12 rounds. Nem nós conseguimos ler.",
                icon: <LockKeyhole size={18} strokeWidth={1.8} />,
              },
              {
                title: "Tokens JWT em cookies HTTPOnly",
                desc: "Sessões assinadas, inacessíveis a scripts. Logout limpa tudo.",
                icon: <ShieldCheck size={18} strokeWidth={1.8} />,
              },
              {
                title: "Proteção CORS, XSS e CSRF",
                desc: "Camadas defensivas auditadas a cada release.",
                icon: <CheckCircle2 size={18} strokeWidth={1.8} />,
              },
            ].map((s, i) => (
              <Reveal key={s.title} delay={i * 0.08}>
                <div className="flex items-start gap-5 py-6">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-black/[0.06] bg-white text-[#013a56]">
                    {s.icon}
                  </span>
                  <div className="flex-1">
                    <h3
                      className="text-[16.5px] font-medium tracking-tight text-[#013a56]"
                      style={{ fontFamily: fontSans }}
                    >
                      {s.title}
                    </h3>
                    <p
                      className="mt-1.5 text-[14px] leading-relaxed text-[#4A5868]"
                      style={{ fontFamily: fontSans }}
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
          <p
            className="text-[11px] uppercase tracking-[0.22em] text-[#8B95A1]"
            style={{ fontFamily: fontMono }}
          >
            — Perguntas frequentes
          </p>
          <h2
            className="mt-4 text-[clamp(1.9rem,3.8vw,3rem)] font-medium leading-[1] tracking-[-0.02em] text-[#013a56]"
            style={{ fontFamily: fontSans, textWrap: "balance" }}
          >
            Antes de você{" "}
            <span
              className="accent text-[#39cc60]">
              perguntar
            </span>
            .
          </h2>
          <p
            className="mt-6 max-w-sm text-[15px] leading-relaxed text-[#4A5868]"
            style={{ fontFamily: fontSans }}
          >
            Algo que não está aqui? Fale com a gente em{" "}
            <a
              href="mailto:contato@moneyhub.app"
              className="text-[#013a56] underline decoration-[#00cc66] decoration-2 underline-offset-4"
            >
              contato@moneyhub.app
            </a>
            .
          </p>
        </Reveal>

        <div className="md:col-span-7">
          <div className="border-t border-black/[0.06]">
            {items.map((it, i) => {
              const isOpen = open === i;
              return (
                <div
                  key={it.q}
                  className="border-b border-black/[0.06]"
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-start justify-between gap-6 py-6 text-left transition-colors hover:text-[#013a56]"
                  >
                    <span
                      className="text-[16.5px] font-medium text-[#013a56]"
                      style={{ fontFamily: fontSans }}
                    >
                      {it.q}
                    </span>
                    <span className="mt-0.5 shrink-0 text-[#4A5868]">
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
                      className="pb-6 pr-10 text-[15px] leading-relaxed text-[#4A5868]"
                      style={{ fontFamily: fontSans }}
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
          <div className="relative overflow-hidden rounded-[2.5rem] border border-black/[0.05] bg-[#013a56] p-10 sm:p-16 lg:p-20">
            {/* Mesh */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
            >
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
                  className="mt-5 text-[clamp(2.2rem,5vw,4.4rem)] font-medium leading-[1] tracking-[-0.03em] text-white"
                  style={{ fontFamily: fontSans, textWrap: "balance" }}
                >
                  Deixe sua planilha em paz.{" "}
                  <span
                    className="accent text-[#39cc60]">
                    Comece hoje.
                  </span>
                </h2>
                <p
                  className="mt-6 max-w-lg text-[16px] leading-relaxed text-white/70"
                  style={{ fontFamily: fontSans }}
                >
                  Cadastro gratuito. Sem cartão de crédito. Importe seu
                  histórico em segundos.
                </p>
              </div>

              <div className="md:col-span-4 md:text-right">
                <button
                  onClick={onLogin}
                  className="group inline-flex items-center gap-3 rounded-full bg-white py-4 pl-6 pr-2 text-[14.5px] font-medium text-[#013a56] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#F0F2F5] active:scale-[0.98]"
                  style={{ fontFamily: fontSans }}
                >
                  <span>Entrar no MoneyHub</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#013a56]/8 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-105">
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
    <footer className="border-t border-black/[0.06] px-6 py-12 lg:px-12">
      <div className="mx-auto flex max-w-[1320px] flex-col items-start justify-between gap-8 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <Logo size="sm" href={false} />
          <span
            className="text-[12px] text-[#8B95A1]"
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
              className="text-[13px] text-[#4A5868] transition-colors hover:text-[#013a56]"
              style={{ fontFamily: fontSans }}
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
      className="relative min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-[#F7F8FA] text-[#013a56] selection:bg-[#013a56] selection:text-white"
      style={{ fontFamily: fontSans }}
    >
      <a
        href="#recursos"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-[#013a56] focus:px-4 focus:py-2 focus:text-white"
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
