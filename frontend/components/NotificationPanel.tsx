"use client";

import { useTheme } from "@/contexts/ThemeContext";
import {
  X,
  Bell,
  Calendar,
  AlertTriangle,
  TrendingDown,
  CheckCheck,
} from "lucide-react";

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

function getNotificationIcon(tipo: Notification["tipo"]) {
  switch (tipo) {
    case "vencimento":
      return <Calendar className="w-5 h-5 text-amber-500" />;
    case "limite_orcamento":
      return <AlertTriangle className="w-5 h-5 text-orange-500" />;
    case "saldo_negativo":
      return <TrendingDown className="w-5 h-5 text-red-500" />;
    default:
      return <Bell className="w-5 h-5 text-blue-500" />;
  }
}

export default function NotificationPanel({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
}: NotificationPanelProps) {
  const { isDark } = useTheme();

  const unreadCount = notifications.filter((n) => !n.lida).length;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 z-[59] bg-black/30 transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Slide-in panel */}
      <div
        className={`fixed top-0 right-0 h-full w-80 sm:w-96 z-[60] transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } ${
          isDark
            ? "bg-slate-800 border-l border-slate-700/50"
            : "bg-white border-l border-slate-200/50"
        } shadow-2xl flex flex-col`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-4 py-4 border-b ${
            isDark ? "border-slate-700/50" : "border-slate-200"
          }`}
          style={{ paddingTop: "calc(1rem + env(safe-area-inset-top))" }}
        >
          <div className="flex items-center space-x-2">
            <Bell
              className={`w-5 h-5 ${
                isDark ? "text-emerald-400" : "text-emerald-600"
              }`}
            />
            <h2
              className={`text-lg font-semibold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
              style={{
                fontFamily: "var(--font-primary, Montserrat, sans-serif)",
              }}
            >
              Notificacoes
            </h2>
            {unreadCount > 0 && (
              <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-5 min-w-[1.25rem] px-1 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-lg transition-all duration-200 ${
                  isDark
                    ? "text-emerald-400 hover:bg-slate-700/50"
                    : "text-emerald-600 hover:bg-emerald-50"
                }`}
                title="Marcar todas como lidas"
              >
                <CheckCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Marcar lidas</span>
              </button>
            )}
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-all duration-200 ${
                isDark
                  ? "text-slate-400 hover:text-white hover:bg-slate-700/50"
                  : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full px-6">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  isDark ? "bg-slate-700/50" : "bg-gray-100"
                }`}
              >
                <Bell
                  className={`w-8 h-8 ${
                    isDark ? "text-slate-500" : "text-gray-400"
                  }`}
                />
              </div>
              <p
                className={`text-base font-medium ${
                  isDark ? "text-slate-400" : "text-gray-500"
                }`}
                style={{
                  fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                }}
              >
                Nenhuma notificacao
              </p>
              <p
                className={`text-sm mt-1 ${
                  isDark ? "text-slate-500" : "text-gray-400"
                }`}
                style={{
                  fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                }}
              >
                Voce esta em dia com tudo!
              </p>
            </div>
          ) : (
            <div className="py-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 flex items-start space-x-3 transition-all duration-200 ${
                    isDark
                      ? notification.lida
                        ? "hover:bg-slate-700/30"
                        : "bg-slate-700/20 hover:bg-slate-700/40"
                      : notification.lida
                      ? "hover:bg-gray-50"
                      : "bg-emerald-50/50 hover:bg-emerald-50"
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      isDark ? "bg-slate-700/50" : "bg-gray-100"
                    }`}
                  >
                    {getNotificationIcon(notification.tipo)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm leading-tight ${
                        notification.lida
                          ? isDark
                            ? "text-slate-400"
                            : "text-gray-600"
                          : isDark
                          ? "text-white font-semibold"
                          : "text-gray-900 font-semibold"
                      }`}
                      style={{
                        fontFamily:
                          "var(--font-secondary, Open Sans, sans-serif)",
                      }}
                    >
                      {notification.titulo}
                    </p>
                    <p
                      className={`text-xs mt-0.5 leading-snug ${
                        isDark ? "text-slate-400" : "text-gray-500"
                      }`}
                      style={{
                        fontFamily:
                          "var(--font-secondary, Open Sans, sans-serif)",
                      }}
                    >
                      {notification.mensagem}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        isDark ? "text-slate-500" : "text-gray-400"
                      }`}
                    >
                      {getRelativeTime(notification.data)}
                    </p>
                  </div>

                  {/* Unread indicator */}
                  {!notification.lida && (
                    <div className="flex-shrink-0 mt-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
