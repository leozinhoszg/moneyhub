"use client";

// Kit de design "glass" extraído da landing (app/page.tsx) e do login.
// Reaproveitável por todas as páginas finance — começando pelo Dashboard.
// Encapsula: superfícies de vidro, header de seção, número animado (count-up),
// barra de progresso, pílulas de status, estado vazio e botões da marca.

import React, { useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE, fontHeading, fontBody, fontMono } from "@/lib/motion";

/* -------------------------------------------------------------------------- */
/* Reveal — entrada com blur/translate ao entrar na viewport.                 */
/* -------------------------------------------------------------------------- */
export function Reveal({
  children,
  delay = 0,
  y = 24,
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
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Superfície de vidro padrão (mesma cor/borda/sombra dos cards do dashboard).
 *  Sem raio/padding — componha com rounded-* e p-* no chamador. */
export const glassSurface =
  "border border-white/40 bg-white/55 shadow-[0_20px_50px_-25px_rgba(0,51,102,0.18)] ring-1 ring-inset ring-white/40 backdrop-blur-xl backdrop-saturate-150 dark:border-white/[0.08] dark:bg-slate-900/45 dark:ring-white/[0.06] dark:shadow-[0_20px_50px_-25px_rgba(0,0,0,0.55)]";

/* -------------------------------------------------------------------------- */
/* GlassCard — superfície de vidro. variant "hero" = duplo-bezel da landing.  */
/* -------------------------------------------------------------------------- */
export function GlassCard({
  children,
  variant = "default",
  className = "",
  bodyClassName = "",
  delay = 0,
  reveal = true,
}: {
  children: React.ReactNode;
  variant?: "default" | "hero";
  className?: string;
  bodyClassName?: string;
  delay?: number;
  reveal?: boolean;
}) {
  const surface =
    variant === "hero" ? (
      <div className="rounded-[2.25rem] border border-white/40 bg-gradient-to-b from-white/70 to-white/40 p-1.5 shadow-[0_30px_80px_-30px_rgba(0,51,102,0.30)] ring-1 ring-inset ring-white/40 backdrop-blur-2xl backdrop-saturate-150 dark:border-white/[0.08] dark:from-slate-900/60 dark:to-slate-950/40 dark:ring-white/[0.06] dark:shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]">
        <div
          className={cn(
            "rounded-[calc(2.25rem-0.375rem)] bg-white/55 p-6 backdrop-blur-xl dark:bg-slate-900/45 sm:p-7",
            bodyClassName
          )}
        >
          {children}
        </div>
      </div>
    ) : (
      <div className={cn("rounded-3xl p-5 sm:p-6", glassSurface, bodyClassName)}>
        {children}
      </div>
    );

  if (!reveal) return <div className={className}>{surface}</div>;
  return (
    <Reveal delay={delay} className={className}>
      {surface}
    </Reveal>
  );
}

/* -------------------------------------------------------------------------- */
/* Kicker — label mono em maiúsculas (ex.: "SALDO EM CONTAS").                 */
/* -------------------------------------------------------------------------- */
export function Kicker({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-[10px] uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400",
        className
      )}
      style={{ fontFamily: fontMono }}
    >
      {children}
    </p>
  );
}

/* -------------------------------------------------------------------------- */
/* SectionHeader — chip de ícone + título + slot de ação.                     */
/* -------------------------------------------------------------------------- */
type Tone = "primary" | "secondary" | "danger" | "warning";

export const chipTone: Record<Tone, string> = {
  primary:
    "bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] dark:bg-white/10 dark:text-slate-200",
  secondary:
    "bg-[color:var(--color-secondary)]/12 text-[color:var(--color-secondary-dark)] dark:bg-[color:var(--color-secondary)]/15 dark:text-[color:var(--color-secondary-light)]",
  danger:
    "bg-[color:var(--color-danger)]/10 text-[color:var(--color-danger)] dark:bg-[color:var(--color-danger)]/20 dark:text-red-300",
  warning:
    "bg-[color:var(--color-warning)]/20 text-[#8a6d00] dark:bg-[color:var(--color-warning)]/15 dark:text-[color:var(--color-warning)]",
};

export function SectionHeader({
  icon: Icon,
  title,
  tone = "secondary",
  action,
  meta,
}: {
  icon: LucideIcon;
  title: string;
  tone?: Tone;
  action?: React.ReactNode;
  meta?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
            chipTone[tone]
          )}
        >
          <Icon size={18} strokeWidth={2} />
        </span>
        <h3
          className="truncate text-[15px] font-semibold text-[color:var(--color-primary)] dark:text-slate-100"
          style={{ fontFamily: fontHeading }}
        >
          {title}
        </h3>
      </div>
      {(meta || action) && (
        <div className="flex shrink-0 items-center gap-2">
          {meta}
          {action}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* AnimatedNumber — count-up de moeda; tamanho controlado pelo className.      */
/* -------------------------------------------------------------------------- */
export function AnimatedNumber({
  value,
  prefix = "R$",
  className = "",
}: {
  value: number;
  prefix?: string;
  className?: string;
}) {
  const mv = useMotionValue(0);
  const intDisplay = useTransform(mv, (v) =>
    Math.floor(Math.abs(v)).toLocaleString("pt-BR")
  );
  const decDisplay = useTransform(mv, (v) => {
    const dec = Math.round((Math.abs(v) - Math.floor(Math.abs(v))) * 100);
    return dec.toString().padStart(2, "0");
  });
  const [neg, setNeg] = useState(value < 0);

  useEffect(() => {
    setNeg(value < 0);
    const controls = animate(mv, value, { duration: 1.2, ease: EASE });
    return () => controls.stop();
  }, [value, mv]);

  return (
    <span
      className={cn("inline-flex items-baseline gap-1.5", className)}
      style={{ fontFamily: fontHeading, fontVariantNumeric: "tabular-nums" }}
    >
      <span className="text-[0.42em] font-medium opacity-60">
        {neg ? "-" : ""}
        {prefix}
      </span>
      <motion.span className="font-bold leading-none tracking-tight">
        {intDisplay}
      </motion.span>
      <span className="text-[0.46em] font-semibold opacity-70">
        ,<motion.span>{decDisplay}</motion.span>
      </span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* ProgressBar — barra fina animada com cor da marca por tom.                 */
/* -------------------------------------------------------------------------- */
export function ProgressBar({
  value,
  tone = "secondary",
  className = "",
}: {
  value: number;
  tone?: "secondary" | "warning" | "danger";
  className?: string;
}) {
  const color =
    tone === "danger"
      ? "var(--color-danger)"
      : tone === "warning"
      ? "var(--color-warning)"
      : "var(--color-secondary)";
  const pct = Math.min(Math.max(value, 0), 100);
  return (
    <div
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-slate-800",
        className
      )}
    >
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${pct}%` }}
        viewport={{ once: true, margin: "-15%" }}
        transition={{ duration: 1, ease: EASE, delay: 0.2 }}
        style={{ background: color }}
        className="h-full rounded-full"
      />
    </div>
  );
}

/** Tom de progresso/percentual: <75 ok, 75-99 alerta, >=100 estouro. */
export function pctTone(pct: number): "secondary" | "warning" | "danger" {
  if (pct >= 100) return "danger";
  if (pct >= 75) return "warning";
  return "secondary";
}

/* -------------------------------------------------------------------------- */
/* Pill — pílula de status/variação.                                          */
/* -------------------------------------------------------------------------- */
const pillTone: Record<string, string> = {
  secondary:
    "bg-[color:var(--color-secondary)]/15 text-[color:var(--color-secondary-dark)] dark:bg-[color:var(--color-secondary)]/20 dark:text-[color:var(--color-secondary-light)]",
  danger:
    "bg-[color:var(--color-danger)]/12 text-[color:var(--color-danger)] dark:bg-[color:var(--color-danger)]/20 dark:text-red-300",
  warning:
    "bg-[color:var(--color-warning)]/20 text-[#8a6d00] dark:bg-[color:var(--color-warning)]/15 dark:text-[color:var(--color-warning)]",
  info: "bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] dark:bg-white/10 dark:text-slate-200",
  neutral:
    "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300",
};

export function Pill({
  children,
  tone = "secondary",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "secondary" | "danger" | "warning" | "info" | "neutral";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium",
        pillTone[tone],
        className
      )}
      style={{ fontFamily: fontMono }}
    >
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* EmptyState — estado vazio da marca com CTA opcional.                       */
/* -------------------------------------------------------------------------- */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-gray-200/60 bg-gray-50/70 px-6 py-10 text-center dark:border-slate-800 dark:bg-slate-800/40">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[color:var(--color-primary)]/[0.07] text-[color:var(--color-primary)] dark:bg-white/5 dark:text-slate-300">
        <Icon size={26} strokeWidth={1.8} />
      </span>
      <h4
        className="text-[15px] font-semibold text-gray-800 dark:text-slate-100"
        style={{ fontFamily: fontHeading }}
      >
        {title}
      </h4>
      {description && (
        <p
          className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-gray-500 dark:text-slate-400"
          style={{ fontFamily: fontBody }}
        >
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* PrimaryButton — pill verde com seta (login PrimaryButton).                 */
/* -------------------------------------------------------------------------- */
export function PrimaryButton({
  children,
  onClick,
  className = "",
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-full bg-[color:var(--color-secondary)] py-2.5 pl-5 pr-2.5 text-[13px] font-semibold text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[color:var(--color-secondary-dark)] active:scale-[0.98]",
        className
      )}
      style={{ fontFamily: fontBody }}
    >
      <span>{children}</span>
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
        <ArrowUpRight size={13} strokeWidth={2.2} />
      </span>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* IconButton — botão circular de ação no header (ex.: +, →).                 */
/* -------------------------------------------------------------------------- */
export function IconButton({
  icon: Icon,
  onClick,
  label,
  tone = "neutral",
}: {
  icon: LucideIcon;
  onClick?: () => void;
  label: string;
  tone?: "neutral" | "secondary";
}) {
  const cls =
    tone === "secondary"
      ? "border-[color:var(--color-secondary)]/30 bg-[color:var(--color-secondary)]/10 text-[color:var(--color-secondary-dark)] hover:bg-[color:var(--color-secondary)]/20 dark:border-[color:var(--color-secondary)]/30 dark:text-[color:var(--color-secondary-light)]"
      : "border-gray-200/70 bg-white/70 text-[color:var(--color-primary)] hover:bg-white dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-800";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-sm transition-all duration-300 active:scale-95",
        cls
      )}
    >
      <Icon size={16} strokeWidth={2} />
    </button>
  );
}
