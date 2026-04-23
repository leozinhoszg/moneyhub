import "./globals.css";
import { Montserrat, Open_Sans } from "next/font/google";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";

export const metadata = {
  title: "MoneyHub",
  description: "MoneyHub - Controle de finanças pessoais",
  keywords: "finanças, controle financeiro, orçamento, gastos, receitas",
  authors: [{ name: "MoneyHub Team" }],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: "cover",
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#00cc66" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MoneyHub",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/logo_money_hub.ico" },
      { url: "/logo_money_hub.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/logo_money_hub.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

const heading = Montserrat({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const body = Open_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${heading.variable} ${body.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MoneyHub" />
        <meta
          name="theme-color"
          content="#00cc66"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#0f172a"
          media="(prefers-color-scheme: dark)"
        />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="application-name" content="MoneyHub" />
        <meta name="apple-touch-fullscreen" content="yes" />

        {/* Preconnect para otimização */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />

        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Icons para diferentes dispositivos */}
        <link rel="icon" href="/logo_money_hub.ico" />
        <link rel="apple-touch-icon" href="/logo_money_hub.png" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/logo_money_hub.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/logo_money_hub.png"
        />
      </head>
      <body
        className="min-h-screen antialiased touch-manipulation overscroll-none"
        style={{
          WebkitTapHighlightColor: "transparent",
          WebkitTouchCallout: "none",
          WebkitUserSelect: "none",
          userSelect: "none",
          touchAction: "manipulation",
        }}
      >
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              {children}
              <Toaster richColors position="bottom-right" />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
