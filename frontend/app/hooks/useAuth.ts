import { useState, useEffect, createContext, useContext } from "react";
import { checkAuthStatus, getCurrentUser, logout, logoutWithGoogleRevoke } from "@/app/api/auth";

interface User {
  id: number;
  nome: string;
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
  loading: boolean;
  authenticated: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const status = await checkAuthStatus();

      if (status.authenticated && status.user) {
        setUser(status.user);
        setAuthenticated(true);
      } else {
        setUser(null);
        setAuthenticated(false);
      }
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
      setUser(null);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData: User) => {
    setUser(userData);
    setAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      // Se o usuário tem Google, usar logout com revogação
      if (user?.provider === "google" || user?.has_google) {
        await logoutWithGoogleRevoke();
      } else {
        await logout();
      }
      setUser(null);
      setAuthenticated(false);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      // Em caso de erro, fazer logout normal
      try {
        await logout();
      } catch (fallbackError) {
        console.error("Erro no logout de fallback:", fallbackError);
      }
      // Mesmo com erro, limpar o estado local
      setUser(null);
      setAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    authenticated,
    login,
    logout: handleLogout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
