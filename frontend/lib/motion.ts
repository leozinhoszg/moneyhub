// Tokens de motion e tipografia compartilhados pelo design system glass
// (landing/login -> páginas finance). Sem dependências de React, para poder
// ser importado tanto por componentes client quanto por helpers.

// cubic-bezier usado em toda a landing/login.
export const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

export const SPRING = { type: "spring" as const, stiffness: 110, damping: 22 };

// Fontes reais carregadas em app/layout.tsx (next/font) via CSS variables.
export const fontHeading = "var(--font-heading), ui-sans-serif, system-ui";
export const fontBody = "var(--font-body), ui-sans-serif, system-ui";
export const fontMono = "var(--font-mono), ui-monospace, monospace";
export const fontSerif = "var(--font-serif), ui-serif, Georgia, serif";

/** Formata um valor (number | string) como moeda BRL em pt-BR. */
export function formatBRL(value: number | string): string {
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return "R$ 0,00";
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
