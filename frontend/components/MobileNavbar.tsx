"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Bell,
  User,
  Sun,
  Moon,
  ChevronDown,
  Settings,
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
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import LanguageSelector from "./LanguageSelector";

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
    {
      href: "/dashboard",
      label: t("common.dashboard"),
      icon: Home,
    },
    {
      href: "/accounts",
      label: t("common.accounts"),
      icon: Wallet,
    },
    {
      href: "/cards",
      label: t("common.cards"),
      icon: CreditCard,
    },
    {
      href: "/transactions",
      label: t("common.transactions"),
      icon: ArrowLeftRight,
    },
    {
      href: "/categories",
      label: t("common.categories"),
      icon: FolderOpen,
    },
    {
      href: "/fixed-expenses",
      label: t("common.fixedExpenses"),
      icon: Calendar,
    },
    {
      href: "/reports",
      label: t("common.reports"),
      icon: BarChart3,
    },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 shadow-lg border-b backdrop-blur-xl transition-all duration-300 ${
          isDark
            ? "bg-slate-800/95 border-slate-700/50 text-white"
            : "bg-white/95 border-slate-200/50 text-gray-800"
        }`}
        style={{
          fontFamily: "var(--font-primary, Montserrat, sans-serif)",
          boxShadow:
            "0 4px 20px rgba(0, 204, 102, 0.15), 0 8px 40px rgba(0, 204, 102, 0.08), 0 0 0 1px rgba(0, 204, 102, 0.1)",
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Menu Button - Left */}
            <button
              className={`md:hidden mobile-menu-button p-2 rounded-lg transition-all duration-200 ${
                isDark
                  ? "text-slate-300 hover:text-emerald-400 hover:bg-slate-700/50"
                  : "text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
              }`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo - Center on mobile, Left on desktop */}
            <div className="flex-1 md:flex-none flex justify-center md:justify-start">
              <Link href="/dashboard" className="flex items-center space-x-3">
                <div className="inline-flex items-center justify-center w-10 h-10 relative">
                  <Image
                    src="/logo_money_hub.png"
                    alt="MoneyHub Logo"
                    width={40}
                    height={40}
                    className="object-contain relative z-10 drop-shadow-lg transition-transform duration-300 hover:scale-110"
                    priority
                  />
                </div>
                <span className="text-xl font-bold hidden sm:block">
                  <span
                    style={{
                      color: isDark ? "#ffffff" : "#013a56",
                      textShadow: isDark
                        ? "0 0 10px rgba(255, 255, 255, 0.3)"
                        : "none",
                    }}
                  >
                    Money
                  </span>
                  <span
                    style={{
                      color: "#00cc66",
                      textShadow: isDark
                        ? "0 0 10px rgba(0, 204, 102, 0.5)"
                        : "none",
                    }}
                  >
                    Hub
                  </span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links - Center */}
            <div className="hidden md:flex flex-1 justify-center">
              <div className="flex items-baseline space-x-2 lg:space-x-4">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center px-3 lg:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive(item.href)
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg"
                          : isDark
                          ? "text-slate-300 hover:text-emerald-400 hover:bg-slate-700/50"
                          : "text-gray-700 hover:text-emerald-600 hover:bg-emerald-50"
                      }`}
                      style={{
                        fontFamily:
                          "var(--font-secondary, Open Sans, sans-serif)",
                      }}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      <span className="hidden lg:block">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center space-x-2">
              {/* Theme Toggle - Hidden on mobile */}
              <button
                onClick={toggleTheme}
                className={`hidden sm:flex p-2 rounded-full transition-all duration-300 h-10 w-10 items-center justify-center ${
                  isDark
                    ? "bg-gray-700 text-yellow-400 hover:bg-gray-600"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                aria-label="Toggle theme"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* Notifications */}
              <button
                onClick={() => onNotificationClick?.()}
                className={`relative p-2 rounded-full transition-all duration-200 h-10 w-10 flex items-center justify-center ${
                  isDark
                    ? "text-slate-300 hover:text-emerald-400 hover:bg-slate-700/50"
                    : "text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
                }`}
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {notificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                    {notificationsCount > 9 ? "9+" : notificationsCount}
                  </span>
                )}
              </button>

              {/* Card Manager Button - Only show on dashboard */}
              {showCardManagerButton && onToggleCardManager && (
                <button
                  onClick={onToggleCardManager}
                  className={`hidden sm:flex p-2 rounded-full transition-all duration-200 h-10 w-10 items-center justify-center ${
                    isDark
                      ? "text-slate-300 hover:text-emerald-400 hover:bg-slate-700/50"
                      : "text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
                  }`}
                  title="Gerenciar Cards do Dashboard"
                  aria-label="Manage dashboard cards"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </button>
              )}

              {/* Language Selector - Hidden on mobile */}
              <div className="hidden sm:block">
                <LanguageSelector />
              </div>

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className={`flex items-center space-x-2 p-2 rounded-lg transition-all duration-200 ${
                    isUserDropdownOpen
                      ? isDark
                        ? "bg-slate-700/50"
                        : "bg-gray-100"
                      : "hover:bg-opacity-50"
                  } ${isDark ? "hover:bg-slate-700/50" : "hover:bg-gray-100"}`}
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 hidden sm:block ${
                      isUserDropdownOpen ? "rotate-180" : ""
                    } ${isDark ? "text-slate-300" : "text-gray-600"}`}
                  />
                </button>

                {/* User Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div
                    className={`absolute right-0 top-full mt-2 w-72 rounded-2xl shadow-2xl border backdrop-blur-xl overflow-hidden transform transition-all duration-300 ease-out z-[9999] ${
                      isDark
                        ? "bg-slate-800/95 border-slate-700/50"
                        : "bg-white/95 border-slate-200/50"
                    }`}
                    style={{
                      boxShadow:
                        "0 0 30px rgba(0, 204, 102, 0.3), 0 0 60px rgba(0, 204, 102, 0.1)",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* User Info Section */}
                    <div
                      className={`p-4 border-b ${
                        isDark ? "border-slate-700/50" : "border-slate-200/50"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3
                            className={`font-semibold text-sm ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                            style={{
                              fontFamily:
                                "var(--font-primary, Montserrat, sans-serif)",
                            }}
                          >
                            {user
                              ? `${user.nome} ${user.sobrenome}`
                              : "Usuário"}
                          </h3>
                          <p
                            className={`text-xs ${
                              isDark ? "text-slate-400" : "text-gray-600"
                            }`}
                            style={{
                              fontFamily:
                                "var(--font-secondary, Open Sans, sans-serif)",
                            }}
                          >
                            {user?.email || "email@exemplo.com"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={handleProfileClick}
                        className={`w-full flex items-center px-4 py-3 text-sm transition-all duration-200 ${
                          isDark
                            ? "text-slate-300 hover:text-emerald-400 hover:bg-slate-700/50"
                            : "text-gray-700 hover:text-emerald-600 hover:bg-emerald-50"
                        }`}
                        style={{
                          fontFamily:
                            "var(--font-secondary, Open Sans, sans-serif)",
                        }}
                      >
                        <User className="w-4 h-4 mr-3" />
                        {t("common.profile")}
                      </button>

                      <Link
                        href="/budget"
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center px-4 py-3 text-sm transition-all duration-200 ${
                          isDark
                            ? "text-slate-300 hover:text-emerald-400 hover:bg-slate-700/50"
                            : "text-gray-700 hover:text-emerald-600 hover:bg-emerald-50"
                        }`}
                        style={{
                          fontFamily:
                            "var(--font-secondary, Open Sans, sans-serif)",
                        }}
                      >
                        <Wallet className="w-4 h-4 mr-3" />
                        {t("common.budget") || "Orçamento"}
                      </Link>

                      <button
                        onClick={handleLogout}
                        className={`w-full flex items-center px-4 py-3 text-sm transition-all duration-200 ${
                          isDark
                            ? "text-slate-300 hover:text-red-400 hover:bg-red-900/20"
                            : "text-gray-700 hover:text-red-600 hover:bg-red-50"
                        }`}
                        style={{
                          fontFamily:
                            "var(--font-secondary, Open Sans, sans-serif)",
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        {t("common.logout")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ top: "calc(4rem + env(safe-area-inset-top))" }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu Content */}
          <div
            ref={mobileMenuRef}
            className={`absolute top-0 left-0 right-0 max-h-screen overflow-y-auto border-b backdrop-blur-xl ${
              isDark
                ? "bg-slate-800/95 border-slate-700/50"
                : "bg-white/95 border-slate-200/50"
            }`}
            style={{
              maxHeight: "calc(100vh - 4rem - env(safe-area-inset-top))",
            }}
          >
            {/* Navigation Items */}
            <div className="px-4 py-6 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleMobileMenuItemClick}
                    className={`flex items-center w-full px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                      isActive(item.href)
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg"
                        : isDark
                        ? "text-slate-300 hover:text-emerald-400 hover:bg-slate-700/50"
                        : "text-gray-700 hover:text-emerald-600 hover:bg-emerald-50"
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Mobile-only Actions */}
            <div className="px-4 py-4 border-t border-slate-200/50 dark:border-slate-700/50 space-y-4">
              {/* Theme Toggle */}
              <button
                onClick={() => {
                  toggleTheme();
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center w-full px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                  isDark
                    ? "text-slate-300 hover:text-yellow-400 hover:bg-slate-700/50"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {isDark ? (
                  <Sun className="w-5 h-5 mr-3" />
                ) : (
                  <Moon className="w-5 h-5 mr-3" />
                )}
                {isDark ? "Modo Claro" : "Modo Escuro"}
              </button>

              {/* Language Selector */}
              <div className="px-4">
                <LanguageSelector />
              </div>

              {/* Card Manager Button for mobile */}
              {showCardManagerButton && onToggleCardManager && (
                <button
                  onClick={() => {
                    onToggleCardManager();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center w-full px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                    isDark
                      ? "text-slate-300 hover:text-emerald-400 hover:bg-slate-700/50"
                      : "text-gray-700 hover:text-emerald-600 hover:bg-emerald-50"
                  }`}
                >
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                  Gerenciar Cards
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

