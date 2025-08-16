"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  getCurrentUser,
  checkAuthStatus,
  logout as apiLogout,
} from "@/app/api/auth";

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

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      setIsLoading(true);
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      console.log("AuthContext: Iniciando logout...");
      await apiLogout();
      console.log("AuthContext: API logout bem-sucedido");
      setUser(null);
      console.log("AuthContext: Usuário limpo do estado");
      // Redirect to login page
      console.log("AuthContext: Redirecionando para login...");
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("AuthContext: Erro durante logout:", error);
      // Even if API call fails, clear user state
      setUser(null);
      console.log("AuthContext: Limpando estado mesmo com erro");
      window.location.href = "/auth/login";
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const status = await checkAuthStatus();
        if (status.authenticated) {
          await refreshUser();
        } else {
          setUser(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        setUser(null);
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
