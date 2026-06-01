"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bell,
  User,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  Menu,
  X,
  Home,
  CreditCard,
  Wallet,
  ArrowLeftRight,
  FolderOpen,
  Calendar,
  BarChart3,
  LayoutGrid,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Logo from "./Logo";
import LanguageSelector from "./LanguageSelector";
import { fontBody, SPRING } from "@/lib/motion";

interface User {
  id: number;
  nome: string;
  sobrenome: string;
  email: string;
  provider: string;
  is_verified: boolean;
  email_verificado: boolean;
  data_cadastro: string;
  ultimo_login?: string;
  is_active: boolean;
  has_password?: boolean;
  has_google?: boolean;
}

type MobileNavbarProps = {
  isActive: (path: string) => boolean;
  onLogout: () => void | Promise<void>;
  notificationsCount?: number;
  user: User | null;
  onNotificationClick?: () => void;
  onToggleCardManager?: () => void;
  showCardManagerButton?: boolean;
};

// Botão de ação circular "ghost" (notificações, tema, cards).
const ghostBtn =
  "relative flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-[color:var(--color-secondary)] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-[color:var(--color-secondary-light)]";

export default function MobileNavbar({
  isActive,
  onLogout,
  notificationsCount = 3,
  user,
  onNotificationClick,
  onToggleCardManager,
  showCardManagerButton = false,
}: MobileNavbarProps) {
  const { isDark, toggleTheme, mounted } = useTheme();
  const { t } = useLanguage();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserDropdownOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest(".mobile-menu-button")
      ) {
        setIsMobileMenuOpen(false);
      }
    }

    if (isUserDropdownOpen || isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserDropdownOpen, isMobileMenuOpen]);

  // Handle profile navigation
  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsUserDropdownOpen(false);
    setIsMobileMenuOpen(false);
    router.push("/profile");
  };

  // Handle logout
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setIsUserDropdownOpen(false);
      setIsMobileMenuOpen(false);
      await onLogout();
    } catch (error) {
      console.error("Navbar: Erro durante logout:", error);
      document.cookie =
        "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      router.push("/auth/login");
    }
  };

  const handleMobileMenuItemClick = () => {
    setIsMobileMenuOpen(false);
  };

  const navigationItems = [
    { href: "/dashboard", label: t("common.dashboard"), icon: Home },
    { href: "/accounts", label: t("common.accounts"), icon: Wallet },
    { href: "/cards", label: t("common.cards"), icon: CreditCard },
    {
      href: "/transactions",
      label: t("common.transactions"),
      icon: ArrowLeftRight,
    },
    { href: "/categories", label: t("common.categories"), icon: FolderOpen },
    {
      href: "/fixed-expenses",
      label: t("common.fixedExpenses"),
      icon: Calendar,
    },
    { href: "/reports", label: t("common.reports"), icon: BarChart3 },
  ];

  return (
    <>
      {/* Nav flutuante de vidro — mesmo material da landing */}
      <nav
        className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 sm:px-4"
        style={{
          paddingTop: "calc(0.6rem + env(safe-area-inset-top))",
          fontFamily: fontBody,
        }}
      >
        <div className="flex w-full max-w-7xl items-center gap-2 rounded-full border border-white/40 bg-white/55 p-1.5 pl-2 shadow-[0_10px_40px_-18px_rgba(0,51,102,0.25)] ring-1 ring-inset ring-white/40 backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-slate-900/50 dark:ring-white/10 dark:shadow-[0_10px_40px_-12px_rgba(0,0,0,0.5)] sm:pl-3">
          {/* Esquerda: hambúrguer (mobile) + logo */}
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              className="mobile-menu-button flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Abrir menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Logo size="sm" href="/dashboard" />
          </div>

          {/* Centro: links (desktop) */}
          <div className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 md:flex lg:gap-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-2.5 py-2 text-[13px] font-medium transition-colors duration-300 xl:px-3 ${
                    active
                      ? "text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-[color:var(--color-secondary)] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-[color:var(--color-secondary-light)]"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      transition={SPRING}
                      className="absolute inset-0 rounded-full bg-[color:var(--color-secondary)] shadow-[0_8px_20px_-10px_rgba(0,204,102,0.7)]"
                    />
                  )}
                  <Icon
                    className="relative z-10 h-4 w-4 shrink-0"
                    strokeWidth={2}
                  />
                  <span className="relative z-10 hidden whitespace-nowrap xl:block">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Direita: ações */}
          <div className="ml-auto flex shrink-0 items-center gap-1 md:ml-0">
            {/* Tema */}
            <button
              onClick={toggleTheme}
              className="hidden h-9 w-9 items-center justify-center rounded-full border border-gray-200/70 bg-white/80 text-[color:var(--color-primary)] transition-colors hover:bg-white dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800 sm:flex"
              aria-label="Alternar tema"
            >
              {mounted ? (
                isDark ? (
                  <Sun size={15} strokeWidth={2.2} />
                ) : (
                  <Moon size={15} strokeWidth={2.2} />
                )
              ) : null}
            </button>

            {/* Notificações */}
            <button
              onClick={() => onNotificationClick?.()}
              className={ghostBtn}
              aria-label="Notificações"
            >
              <Bell size={18} strokeWidth={2} />
              {notificationsCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[color:var(--color-danger)] px-1 text-[10px] font-semibold text-white">
                  {notificationsCount > 9 ? "9+" : notificationsCount}
                </span>
              )}
            </button>

            {/* Gerenciar cards (apenas no dashboard) */}
            {showCardManagerButton && onToggleCardManager && (
              <button
                onClick={onToggleCardManager}
                className={`hidden sm:flex ${ghostBtn}`}
                title="Gerenciar cards do dashboard"
                aria-label="Gerenciar cards"
              >
                <LayoutGrid size={18} strokeWidth={2} />
              </button>
            )}

            {/* Idioma */}
            <div className="hidden sm:block">
              <LanguageSelector />
            </div>

            {/* Usuário */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-1.5 rounded-full p-0.5 pr-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-slate-800"
                aria-label="Menu do usuário"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--color-secondary)] text-white shadow-[0_6px_16px_-8px_rgba(0,204,102,0.7)]">
                  <User size={16} strokeWidth={2.2} />
                </span>
                <ChevronDown
                  size={15}
                  className={`hidden text-gray-500 transition-transform duration-200 dark:text-slate-400 sm:block ${
                    isUserDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isUserDropdownOpen && (
                <div
                  className="absolute right-0 top-full z-[9999] mt-2 w-72 overflow-hidden rounded-2xl border border-white/40 bg-white/80 shadow-[0_24px_60px_-28px_rgba(0,51,102,0.35)] ring-1 ring-inset ring-white/40 backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-slate-900/85 dark:ring-white/10"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Cabeçalho do usuário */}
                  <div className="flex items-center gap-3 border-b border-gray-200/60 p-4 dark:border-slate-800">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--color-secondary)] text-white">
                      <User size={22} strokeWidth={2.2} />
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate text-[14px] font-semibold text-[color:var(--color-primary)] dark:text-white">
                        {user ? `${user.nome} ${user.sobrenome}` : "Usuário"}
                      </h3>
                      <p className="truncate text-[12px] text-gray-500 dark:text-slate-400">
                        {user?.email || "email@exemplo.com"}
                      </p>
                    </div>
                  </div>

                  <div className="py-2">
                    <button
                      onClick={handleProfileClick}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-[13.5px] text-gray-700 transition-colors hover:bg-gray-100 hover:text-[color:var(--color-secondary)] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-[color:var(--color-secondary-light)]"
                    >
                      <User size={16} strokeWidth={2} />
                      {t("common.profile")}
                    </button>

                    <Link
                      href="/budget"
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-[13.5px] text-gray-700 transition-colors hover:bg-gray-100 hover:text-[color:var(--color-secondary)] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-[color:var(--color-secondary-light)]"
                    >
                      <Wallet size={16} strokeWidth={2} />
                      {t("common.budget") || "Orçamento"}
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-[13.5px] text-gray-700 transition-colors hover:bg-[color:var(--color-danger)]/10 hover:text-[color:var(--color-danger)] dark:text-slate-300 dark:hover:bg-[color:var(--color-danger)]/15 dark:hover:text-red-300"
                    >
                      <LogOut size={16} strokeWidth={2} />
                      {t("common.logout")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Menu mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ top: "calc(4.25rem + env(safe-area-inset-top))" }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Painel */}
          <div
            ref={mobileMenuRef}
            className="absolute inset-x-3 top-0 max-h-[calc(100vh-5rem)] overflow-y-auto rounded-3xl border border-white/40 bg-white/80 p-3 shadow-[0_24px_60px_-28px_rgba(0,51,102,0.35)] ring-1 ring-inset ring-white/40 backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-slate-900/85 dark:ring-white/10"
            style={{ fontFamily: fontBody }}
          >
            {/* Links */}
            <div className="space-y-1.5">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleMobileMenuItemClick}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-medium transition-all duration-200 ${
                      active
                        ? "bg-[color:var(--color-secondary)] text-white shadow-[0_8px_20px_-10px_rgba(0,204,102,0.7)]"
                        : "text-gray-700 hover:bg-gray-100 hover:text-[color:var(--color-secondary)] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-[color:var(--color-secondary-light)]"
                    }`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2} />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Ações mobile */}
            <div className="mt-3 space-y-1.5 border-t border-gray-200/60 pt-3 dark:border-slate-800">
              <button
                onClick={() => {
                  toggleTheme();
                  setIsMobileMenuOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-medium text-gray-700 transition-all duration-200 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {isDark ? (
                  <Sun className="h-5 w-5" strokeWidth={2} />
                ) : (
                  <Moon className="h-5 w-5" strokeWidth={2} />
                )}
                {isDark ? "Modo claro" : "Modo escuro"}
              </button>

              <div className="px-2">
                <LanguageSelector />
              </div>

              {showCardManagerButton && onToggleCardManager && (
                <button
                  onClick={() => {
                    onToggleCardManager();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-medium text-gray-700 transition-all duration-200 hover:bg-gray-100 hover:text-[color:var(--color-secondary)] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-[color:var(--color-secondary-light)]"
                >
                  <LayoutGrid className="h-5 w-5" strokeWidth={2} />
                  Gerenciar cards
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
