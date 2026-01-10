import type { Metadata } from "next";
import { Barlow_Condensed } from "next/font/google";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Acreditaciones UC",
  description: "Sistema de acreditación oficial para el partido Universidad Católica vs Deportes Concepción - 8 de Febrero 2026, Claro Arena",
  icons: {
    icon: "/UCimg/EscudoUC.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${barlowCondensed.variable} antialiased font-sans`}
        style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
