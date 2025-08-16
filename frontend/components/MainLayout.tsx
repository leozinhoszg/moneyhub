"use client";

import { useTheme } from "@/contexts/ThemeContext";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { isDark, mounted } = useTheme();

  return (
    <div
      className={`min-h-screen w-full relative overflow-hidden transition-colors duration-500 ${
        isDark
          ? "bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800"
          : "bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100"
      }`}
    >
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Large gradient orbs */}
        <div
          className={`absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-emerald-500/20 to-green-400/10 rounded-full blur-xl transition-all duration-[4000ms] ${
            mounted ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
          style={{
            animation: mounted ? "float 12s ease-in-out infinite" : "none",
          }}
        />
        <div
          className={`absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-blue-600/20 to-indigo-500/10 rounded-full blur-xl transition-all duration-[4000ms] delay-1000 ${
            mounted ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
          style={{
            animation: mounted
              ? "float 10s ease-in-out infinite reverse"
              : "none",
          }}
        />
        <div
          className={`absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-bl from-emerald-400/15 to-teal-500/5 rounded-full blur-2xl transition-all duration-[4000ms] delay-2000 ${
            mounted ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
          style={{
            animation: mounted ? "float 8s ease-in-out infinite" : "none",
          }}
        />

        {/* Grid pattern overlay */}
        <div
          className={`absolute inset-0 transition-all duration-500 ${
            isDark
              ? "bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]"
              : "bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:40px_40px]"
          }`}
        />
      </div>

      {/* Animated Green Glow Background */}
      <div className="animated-bg">
        <div className="floating-orb"></div>
        <div className="floating-orb"></div>
        <div className="floating-orb"></div>
        <div className="pulsing-glow"></div>
        <div className="pulsing-glow"></div>
        <div className="wave-element"></div>
        <div className="wave-element"></div>
        <div className="sparkle"></div>
        <div className="sparkle"></div>
        <div className="sparkle"></div>
      </div>

      {/* Content */}
      <div className="relative z-0 min-h-screen">{children}</div>

      {/* Floating animation styles */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-20px) rotate(1deg);
          }
          66% {
            transform: translateY(-10px) rotate(-1deg);
          }
        }
      `}</style>
    </div>
  );
}
