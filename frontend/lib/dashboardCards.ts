// Fonte única dos ícones/tons de cada card do dashboard.
// Usado pelos SectionHeader do dashboard E pelo painel "Gerenciar cards",
// garantindo que o mesmo card use o mesmo ícone (lucide) e a mesma cor nos
// dois lugares. Ao adicionar/trocar o ícone de um card, ajuste só aqui.

import {
  LayoutGrid,
  ListChecks,
  Wallet,
  CreditCard,
  PieChart,
  BarChart3,
  ClipboardList,
  PiggyBank,
  Activity,
  Scale,
  Star,
  Target,
  type LucideIcon,
} from "lucide-react";

export type CardTone = "primary" | "secondary" | "danger" | "warning";

export const CARD_META: Record<string, { icon: LucideIcon; tone: CardTone }> = {
  firstSteps: { icon: ListChecks, tone: "secondary" },
  accounts: { icon: Wallet, tone: "primary" },
  creditCards: { icon: CreditCard, tone: "primary" },
  expensesByCategory: { icon: PieChart, tone: "secondary" },
  dailyFlow: { icon: BarChart3, tone: "primary" },
  monthlyPlanning: { icon: ClipboardList, tone: "secondary" },
  monthlyEconomy: { icon: PiggyBank, tone: "secondary" },
  spendingFrequency: { icon: Activity, tone: "primary" },
  monthlyBalance: { icon: Scale, tone: "primary" },
  favoriteTransactions: { icon: Star, tone: "warning" },
  objectives: { icon: Target, tone: "secondary" },
};

export const FALLBACK_CARD_ICON: LucideIcon = LayoutGrid;

export function getCardIcon(key: string): LucideIcon {
  return CARD_META[key]?.icon ?? FALLBACK_CARD_ICON;
}

export function getCardTone(key: string): CardTone {
  return CARD_META[key]?.tone ?? "secondary";
}
