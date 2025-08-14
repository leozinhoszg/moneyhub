import "./globals.css";
import { Montserrat, Open_Sans } from "next/font/google";

export const metadata = {
  title: "MoneyHub",
  description: "MoneyHub - Controle de finanças pessoais",
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
    <html lang="pt-BR" className={`${heading.variable} ${body.variable}`}>
      <body className="min-h-screen">
        <div className="container-page">{children}</div>
      </body>
    </html>
  );
}
