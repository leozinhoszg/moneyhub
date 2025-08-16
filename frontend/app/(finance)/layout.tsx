"use client";

import { useRouter, usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import MainLayout from "@/components/MainLayout";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

function FinanceLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    router.push("/auth/login");
    return null;
  }

  const isActive = (path: string) => {
    return pathname === path;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <MainLayout>
        {/* Navbar */}
        <Navbar isActive={isActive} onLogout={logout} user={user} />

        {/* Main Content */}
        <main
          className="max-w-full mx-auto py-6 px-4 sm:px-6 lg:px-8 mt-8 -ml-[100px]"
          style={{ fontFamily: "Open Sans, sans-serif" }}
        >
          {children}
        </main>
      </MainLayout>
    </ThemeProvider>
  );
}

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <FinanceLayoutContent>{children}</FinanceLayoutContent>
    </AuthProvider>
  );
}
