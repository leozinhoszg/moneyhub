"use client";

import { useTheme } from "@/contexts/ThemeContext";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { isDark, mounted } = useTheme();

  return (
    <div
      className={`min-h-screen w-full relative transition-colors duration-500 overflow-x-hidden overflow-y-auto`}
      style={{
        margin: 0,
        padding: 0,
        // Base lisa igual à landing: bg-gray-50 (claro) / slate-950 (escuro).
        background: isDark ? "#020617" : "#f9fafb",
        WebkitOverflowScrolling: "touch",
        scrollBehavior: "smooth",
      }}
    >
      {/* Mesh ambiente da marca (navy + verde) — coerente com a landing.
          Glows estáticos: só fazem fade-in no mount, sem animação perpétua
          (o `float infinite` repintava áreas blur-3xl gigantes a cada frame). */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Glow verde (canto superior direito) */}
        <div
          className={`absolute -top-32 sm:-top-40 -right-16 sm:-right-[10%] w-[420px] h-[420px] sm:w-[640px] sm:h-[640px] rounded-full blur-3xl transition-opacity duration-1000 bg-[radial-gradient(circle_at_center,rgba(0,204,102,0.16),transparent_62%)] dark:bg-[radial-gradient(circle_at_center,rgba(0,204,102,0.10),transparent_62%)] ${
            mounted ? "opacity-100" : "opacity-0"
          }`}
        />
        {/* Glow navy (canto inferior esquerdo) */}
        <div
          className={`absolute -bottom-28 sm:-bottom-32 -left-16 sm:-left-[10%] w-[360px] h-[360px] sm:w-[520px] sm:h-[520px] rounded-full blur-3xl transition-opacity duration-1000 bg-[radial-gradient(circle_at_center,rgba(0,51,102,0.10),transparent_60%)] dark:bg-[radial-gradient(circle_at_center,rgba(0,102,153,0.18),transparent_60%)] ${
            mounted ? "opacity-100" : "opacity-0"
          }`}
        />
        {/* Glow verde suave (centro) */}
        <div
          className={`absolute top-1/2 left-1/4 w-[260px] h-[260px] sm:w-[420px] sm:h-[420px] rounded-full blur-3xl transition-opacity duration-1000 bg-[radial-gradient(circle_at_center,rgba(0,204,102,0.08),transparent_65%)] dark:bg-[radial-gradient(circle_at_center,rgba(0,204,102,0.06),transparent_65%)] ${
            mounted ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      {/* Content - com z-index que não interfere com dropdowns */}
      <div className="relative z-0 min-h-screen w-full">{children}</div>
    </div>
  );
}
