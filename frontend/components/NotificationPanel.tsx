"use client";

import {
  X,
  Bell,
  Calendar,
  AlertTriangle,
  TrendingDown,
  CheckCheck,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fontHeading, fontBody, fontMono } from "@/lib/motion";
import { glassSurface, chipTone } from "@/components/finance/glass";

export interface Notification {
  id: string;
  tipo: "vencimento" | "limite_orcamento" | "saldo_negativo";
  titulo: string;
  mensagem: string;
  data: string;
  lida: boolean;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAllRead: () => void;
}

function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Ontem";
  if (diffDays < 7) return `${diffDays} dias atrás`;
  return date.toLocaleDateString("pt-BR");
}

// Ícone + tom da marca por tipo (mesmos chips do dashboard)
const TYPE_META: Record<
  Notification["tipo"],
  { icon: LucideIcon; tone: "warning" | "danger" }
> = {
  vencimento: { icon: Calendar, tone: "warning" },
  limite_orcamento: { icon: AlertTriangle, tone: "warning" },
  saldo_negativo: { icon: TrendingDown, tone: "danger" },
};

export default function NotificationPanel({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
}: NotificationPanelProps) {
  const unreadCount = notifications.filter((n) => !n.lida).length;

  return (
    <>
      {/* Backdrop (dim leve, sem blur) */}
      <div
        className={cn(
          "fixed inset-0 z-[59] bg-black/20 transition-opacity duration-300",
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden
      />

      {/* Painel — mesmo fundo do dashboard (gray-50 / slate-950) */}
      <div
        className={cn(
          "fixed right-0 top-0 z-[60] flex h-full w-[88%] max-w-md flex-col border-l border-gray-200/70 bg-gray-50 shadow-[0_20px_60px_-20px_rgba(0,51,102,0.4)] transition-transform duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-950",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-label="Notificações"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between gap-3 border-b border-gray-200/60 px-5 py-4 dark:border-slate-800"
          style={{ paddingTop: "calc(1rem + env(safe-area-inset-top))" }}
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[color:var(--color-secondary)]/12 text-[color:var(--color-secondary-dark)] dark:bg-[color:var(--color-secondary)]/15 dark:text-[color:var(--color-secondary-light)]">
              <Bell size={18} strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <h2
                className="text-[16px] font-semibold text-[color:var(--color-primary)] dark:text-slate-100"
                style={{ fontFamily: fontHeading }}
              >
                Notificações
              </h2>
              <p
                className="truncate text-[12px] text-gray-500 dark:text-slate-400"
                style={{ fontFamily: fontBody }}
              >
                {unreadCount > 0
                  ? `${unreadCount} não lida${unreadCount > 1 ? "s" : ""}`
                  : "Você está em dia"}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[12px] font-medium text-[color:var(--color-secondary-dark)] transition-colors hover:bg-[color:var(--color-secondary)]/10 dark:text-[color:var(--color-secondary-light)] dark:hover:bg-[color:var(--color-secondary)]/15"
                title="Marcar todas como lidas"
              >
                <CheckCheck size={15} strokeWidth={2.2} />
                <span className="hidden sm:inline">Marcar lidas</span>
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Fechar"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <X size={18} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {notifications.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[color:var(--color-primary)]/[0.07] text-[color:var(--color-primary)] dark:bg-white/5 dark:text-slate-300">
                <Bell size={28} strokeWidth={1.8} />
              </span>
              <p
                className="text-[15px] font-semibold text-gray-800 dark:text-slate-100"
                style={{ fontFamily: fontHeading }}
              >
                Nenhuma notificação
              </p>
              <p
                className="mt-1 text-[13px] text-gray-500 dark:text-slate-400"
                style={{ fontFamily: fontBody }}
              >
                Você está em dia com tudo!
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {notifications.map((n) => {
                const meta = TYPE_META[n.tipo];
                const Icon = meta?.icon ?? Bell;
                const tone = meta?.tone ?? "primary";
                return (
                  <div
                    key={n.id}
                    className={cn(
                      "flex items-start gap-3 rounded-2xl p-3",
                      glassSurface,
                      !n.lida && "ring-[color:var(--color-secondary)]/45"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                        chipTone[tone]
                      )}
                    >
                      <Icon size={18} strokeWidth={2} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-[13.5px] leading-snug",
                          n.lida
                            ? "text-gray-600 dark:text-slate-400"
                            : "font-semibold text-gray-800 dark:text-slate-100"
                        )}
                        style={{ fontFamily: fontBody }}
                      >
                        {n.titulo}
                      </p>
                      <p
                        className="mt-0.5 text-[12px] leading-snug text-gray-500 dark:text-slate-400"
                        style={{ fontFamily: fontBody }}
                      >
                        {n.mensagem}
                      </p>
                      <p
                        className="mt-1.5 text-[10px] uppercase tracking-[0.12em] text-gray-400 dark:text-slate-500"
                        style={{ fontFamily: fontMono }}
                      >
                        {getRelativeTime(n.data)}
                      </p>
                    </div>

                    {!n.lida && (
                      <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[color:var(--color-secondary)] shadow-[0_0_8px_rgba(0,204,102,0.6)]" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
