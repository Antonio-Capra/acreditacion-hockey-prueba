import type { Metadata } from "next";
import { Montserrat, Barlow_Condensed } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800", "900"],
});

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
  viewport: "width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body
        className={`${montserrat.variable} ${barlowCondensed.variable} antialiased font-sans`}
        style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
