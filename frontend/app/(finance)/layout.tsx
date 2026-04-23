"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import MobileNavbar from "@/components/MobileNavbar";
import MainLayout from "@/components/MainLayout";
import NotificationPanel, {
  Notification,
} from "@/components/NotificationPanel";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import {
  CardManagerProvider,
  useCardManager,
} from "@/contexts/CardManagerContext";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001";

function FinanceLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toggleCardManager } = useCardManager();

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Generate notifications from real data
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const generateNotifications = async () => {
      const newNotifications: Notification[] = [];

      try {
        // Fetch fixed expenses for upcoming due dates
        const fixedRes = await fetch(`${API}/api/fixed-expenses`, {
          credentials: "include",
        });
        if (fixedRes.ok) {
          const fixedExpenses = await fixedRes.json();
          const today = new Date();
          const currentDay = today.getDate();

          fixedExpenses.forEach((fx: any) => {
            if (fx.status !== "Ativo") return;
            const dueDay = fx.dia_vencimento;
            const daysUntil = dueDay - currentDay;
            if (daysUntil >= 0 && daysUntil <= 3) {
              newNotifications.push({
                id: `vencimento_${fx.id}_${today.toISOString().split("T")[0]}`,
                tipo: "vencimento",
                titulo: `Vencimento em ${
                  daysUntil === 0 ? "hoje" : daysUntil + " dia(s)"
                }`,
                mensagem: `${fx.descricao} - R$ ${Number(fx.valor).toFixed(2)}`,
                data: today.toISOString(),
                lida: false,
              });
            }
          });
        }
      } catch (err) {
        console.error("Erro ao buscar despesas fixas:", err);
      }

      try {
        // Fetch accounts for negative balances
        const accRes = await fetch(`${API}/api/accounts`, {
          credentials: "include",
        });
        if (accRes.ok) {
          const accounts = await accRes.json();
          accounts.forEach((acc: any) => {
            if (Number(acc.saldo_atual) < 0) {
              newNotifications.push({
                id: `saldo_${acc.id}`,
                tipo: "saldo_negativo",
                titulo: "Saldo negativo",
                mensagem: `${acc.nome_banco} esta com saldo de R$ ${Number(
                  acc.saldo_atual
                ).toFixed(2)}`,
                data: new Date().toISOString(),
                lida: false,
              });
            }
          });
        }
      } catch (err) {
        console.error("Erro ao buscar contas:", err);
      }

      try {
        // Check budget usage > 90%
        const budgetRaw = localStorage.getItem("moneyhub_budget");
        if (budgetRaw) {
          const budget = JSON.parse(budgetRaw);
          const now = new Date();
          const monthKey = `${now.getFullYear()}-${String(
            now.getMonth() + 1
          ).padStart(2, "0")}`;

          const txRes = await fetch(
            `${API}/api/transactions?month=${monthKey}`,
            { credentials: "include" }
          );
          if (txRes.ok) {
            const transactions = await txRes.json();
            const totalSpent = transactions
              .filter((t: any) => t.tipo === "despesa")
              .reduce((sum: number, t: any) => sum + Number(t.valor), 0);

            const budgetLimit = Number(budget.limite || budget.total || 0);
            if (budgetLimit > 0) {
              const usage = totalSpent / budgetLimit;
              if (usage > 0.9) {
                newNotifications.push({
                  id: `orcamento_${monthKey}`,
                  tipo: "limite_orcamento",
                  titulo: "Limite de orcamento proximo",
                  mensagem: `Voce ja usou ${Math.round(
                    usage * 100
                  )}% do orcamento de R$ ${budgetLimit.toFixed(2)}`,
                  data: new Date().toISOString(),
                  lida: false,
                });
              }
            }
          }
        }
      } catch (err) {
        console.error("Erro ao verificar orcamento:", err);
      }

      // Merge read state from localStorage
      const readKey = `moneyhub_notifications_read_${user?.id}`;
      const readRaw = localStorage.getItem(readKey);
      const readIds: string[] = readRaw ? JSON.parse(readRaw) : [];

      const merged = newNotifications.map((n) => ({
        ...n,
        lida: readIds.includes(n.id),
      }));

      setNotifications(merged);
    };

    generateNotifications();
  }, [isAuthenticated, user]);

  const handleMarkAllRead = useCallback(() => {
    if (!user) return;
    const readKey = `moneyhub_notifications_read_${user.id}`;
    const allIds = notifications.map((n) => n.id);
    localStorage.setItem(readKey, JSON.stringify(allIds));
    setNotifications((prev) => prev.map((n) => ({ ...n, lida: true })));
  }, [user, notifications]);

  const handleNotificationClick = useCallback(() => {
    setIsNotificationOpen((prev) => !prev);
  }, []);

  // Show loading or return null while redirecting
  if (!isLoading && !isAuthenticated) {
    return null;
  }

  const isActive = (path: string) => {
    return pathname === path;
  };

  const isDashboard = pathname === "/dashboard";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Carregando...
          </p>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      {/* Navbar Responsivo */}
      <MobileNavbar
        isActive={isActive}
        onLogout={logout}
        user={user}
        onToggleCardManager={toggleCardManager}
        showCardManagerButton={isDashboard}
        onNotificationClick={handleNotificationClick}
        notificationsCount={notifications.filter((n) => !n.lida).length}
      />

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
      />

      {/* Main Content - Layout responsivo otimizado */}
      <main
        className="w-full min-h-screen relative z-0 px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6"
        style={{
          fontFamily: "Open Sans, sans-serif",
          paddingTop: "calc(4rem + env(safe-area-inset-top))", // Considerando altura da navbar + safe area
          paddingBottom: "env(safe-area-inset-bottom)",
          paddingLeft: "max(0.5rem, env(safe-area-inset-left))",
          paddingRight: "max(0.5rem, env(safe-area-inset-right))",
        }}
      >
        <div className="max-w-7xl mx-auto w-full">{children}</div>
      </main>
    </MainLayout>
  );
}

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <CardManagerProvider>
        <FinanceLayoutContent>{children}</FinanceLayoutContent>
      </CardManagerProvider>
    </AuthProvider>
  );
}
