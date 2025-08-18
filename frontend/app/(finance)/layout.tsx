"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import MainLayout from "@/components/MainLayout";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

function FinanceLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Show loading or return null while redirecting
  if (!isLoading && !isAuthenticated) {
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
    <MainLayout>
      {/* Navbar */}
      <Navbar isActive={isActive} onLogout={logout} user={user} />

      {/* Main Content - Responsive layout with proper centering */}
      <main
        className="w-full min-h-screen relative z-0"
        style={{ 
          fontFamily: "Open Sans, sans-serif"
        }}
      >
        {children}
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
      <FinanceLayoutContent>{children}</FinanceLayoutContent>
    </AuthProvider>
  );
}