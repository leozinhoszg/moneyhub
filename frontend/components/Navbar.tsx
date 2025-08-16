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

type NavbarProps = {
  isActive: (path: string) => boolean;
  onLogout: () => void | Promise<void>;
  notificationsCount?: number;
  user: User | null;
};

export default function Navbar({
  isActive,
  onLogout,
  notificationsCount = 3,
  user,
}: NavbarProps) {
  const { isDark, toggleTheme, mounted } = useTheme();
  const { t } = useLanguage();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserDropdownOpen(false);
      }
    }

    if (isUserDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserDropdownOpen]);

  // Handle profile navigation
  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Navegando para perfil...");
    setIsUserDropdownOpen(false);
    router.push("/profile");
  };

  // Handle logout
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      console.log("Navbar: Iniciando logout...");
      setIsUserDropdownOpen(false);

      // Tentar logout via API
      await onLogout();
      console.log("Navbar: Logout concluído com sucesso");
    } catch (error) {
      console.error("Navbar: Erro durante logout:", error);

      // Forçar logout mesmo se houver erro
      console.log("Navbar: Forçando logout local...");

      // Limpar cookies manualmente
      document.cookie =
        "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      // Redirecionar para login
      router.push("/auth/login");
    }
  };

  return (
    <nav
      className={`relative z-50 shadow-lg border-b backdrop-blur-xl transition-all duration-300 ${
        isDark
          ? "bg-slate-800/90 border-slate-700/50 text-white"
          : "bg-white/90 border-slate-200/50 text-gray-800"
      }`}
      style={{
        fontFamily: "var(--font-primary, Montserrat, sans-serif)",
        boxShadow:
          "0 4px 20px rgba(0, 204, 102, 0.15), 0 8px 40px rgba(0, 204, 102, 0.08), 0 0 0 1px rgba(0, 204, 102, 0.1)",
        animation: "navbarGlow 4s ease-in-out infinite",
      }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center h-16">
          {/* Logo - Left */}
          <div className="flex-shrink-0 -ml-2 sm:-ml-3 lg:-ml-4 -mr-4 sm:-mr-6 lg:-mr-8">
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
              <span className="text-xl font-bold">
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

          {/* Navigation Links - Center */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex items-baseline space-x-4">
              <Link
                href="/dashboard"
                className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive("/dashboard")
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg"
                    : isDark
                    ? "text-slate-300 hover:text-emerald-400 hover:bg-slate-700/50"
                    : "text-gray-700 hover:text-emerald-600 hover:bg-emerald-50"
                }`}
                style={{
                  fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                }}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                {t("common.dashboard")}
              </Link>
              <Link
                href="/accounts"
                className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive("/accounts")
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg"
                    : isDark
                    ? "text-slate-300 hover:text-emerald-400 hover:bg-slate-700/50"
                    : "text-gray-700 hover:text-emerald-600 hover:bg-emerald-50"
                }`}
                style={{
                  fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                }}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                </svg>
                {t("common.accounts")}
              </Link>
              <Link
                href="/cards"
                className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive("/cards")
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg"
                    : isDark
                    ? "text-slate-300 hover:text-emerald-400 hover:bg-slate-700/50"
                    : "text-gray-700 hover:text-emerald-600 hover:bg-emerald-50"
                }`}
                style={{
                  fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                }}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
                {t("common.cards")}
              </Link>
              <Link
                href="/transactions"
                className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive("/transactions")
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg"
                    : isDark
                    ? "text-slate-300 hover:text-emerald-400 hover:bg-slate-700/50"
                    : "text-gray-700 hover:text-emerald-600 hover:bg-emerald-50"
                }`}
                style={{
                  fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                }}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {t("common.transactions")}
              </Link>
              <Link
                href="/categories"
                className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive("/categories")
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg"
                    : isDark
                    ? "text-slate-300 hover:text-emerald-400 hover:bg-slate-700/50"
                    : "text-gray-700 hover:text-emerald-600 hover:bg-emerald-50"
                }`}
                style={{
                  fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                }}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
                {t("common.categories")}
              </Link>
              <Link
                href="/fixed-expenses"
                className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive("/fixed-expenses")
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg"
                    : isDark
                    ? "text-slate-300 hover:text-emerald-400 hover:bg-slate-700/50"
                    : "text-gray-700 hover:text-emerald-600 hover:bg-emerald-50"
                }`}
                style={{
                  fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                }}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                {t("common.fixedExpenses")}
              </Link>
              <Link
                href="/reports"
                className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive("/reports")
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg"
                    : isDark
                    ? "text-slate-300 hover:text-emerald-400 hover:bg-slate-700/50"
                    : "text-gray-700 hover:text-emerald-600 hover:bg-emerald-50"
                }`}
                style={{
                  fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                }}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                {t("common.reports")}
              </Link>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-all duration-300 h-10 w-10 flex items-center justify-center ${
                  isDark
                    ? "bg-gray-700 text-yellow-400 hover:bg-gray-600"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* Notifications */}
              <button
                className={`relative p-2 rounded-full transition-all duration-200 h-10 w-10 flex items-center justify-center ${
                  isDark
                    ? "text-slate-300 hover:text-emerald-400 hover:bg-slate-700/50"
                    : "text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
                }`}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                  {notificationsCount}
                </span>
              </button>
            </div>
          </div>

          {/* Right side - User elements */}
          <div className="flex items-center space-x-4 ml-auto -mr-4 sm:-mr-6 lg:-mr-8 h-16">
            {/* Language Selector */}
            <LanguageSelector />

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className={`flex items-center space-x-2 p-1 pr-4 sm:pr-6 lg:pr-8 h-full rounded-none transition-all duration-200 ${
                  isUserDropdownOpen
                    ? isDark
                      ? "bg-slate-700/50"
                      : "bg-gray-100"
                    : "hover:bg-opacity-50"
                } ${isDark ? "hover:bg-slate-700/50" : "hover:bg-gray-100"}`}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-4 h-4 text-white" />
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isUserDropdownOpen ? "rotate-180" : ""
                  } ${isDark ? "text-slate-300" : "text-gray-600"}`}
                />
              </button>

              {/* Dropdown Menu */}
              {isUserDropdownOpen && (
                <div
                  className={`absolute right-0 top-full mt-4 w-72 rounded-2xl shadow-2xl border backdrop-blur-xl overflow-hidden transform transition-all duration-300 ease-out z-[9999] ${
                    isDark
                      ? "bg-slate-800/95 border-slate-700/50"
                      : "bg-white/95 border-slate-200/50"
                  }`}
                  style={{
                    boxShadow:
                      "0 0 30px rgba(0, 204, 102, 0.3), 0 0 60px rgba(0, 204, 102, 0.1), 0 0 90px rgba(0, 204, 102, 0.05)",
                    borderColor: "#00cc66",
                    borderWidth: "1px",
                    animationName: "dropdownSlide, glowPulse",
                    animationDuration: "0.3s, 2s",
                    animationTimingFunction: "ease-out, ease-in-out",
                    animationFillMode: "forwards, both",
                    animationDelay: "0s, 0.3s",
                    animationIterationCount: "1, infinite",
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
                      <Settings className="w-4 h-4 mr-3" />
                      {t("common.profile")}
                    </button>

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
  );
}