"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      if (typeof window !== "undefined") {
        const savedTheme = localStorage.getItem("moneyhub-theme");
        if (savedTheme === "dark") return true;
        if (savedTheme === "light") return false;
      }
    } catch (_) {
      // ignore access errors
    }
    return false;
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Ensure localStorage has a value for theme after mount
    try {
      const savedTheme = localStorage.getItem("moneyhub-theme");
      if (!savedTheme) {
        localStorage.setItem("moneyhub-theme", isDark ? "dark" : "light");
      }
    } catch (_) {
      // ignore access errors
    }
  }, []);

  // Keep the document root in sync with the theme
  useEffect(() => {
    try {
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", isDark);
      }
    } catch (_) {
      // ignore DOM access errors
    }
  }, [isDark]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    // Save to localStorage
    try {
      localStorage.setItem("moneyhub-theme", newTheme ? "dark" : "light");
    } catch (_) {
      // ignore access errors
    }
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

