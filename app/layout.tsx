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

// Función para generar metadata estático
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Acreditación Prensa - Colo-Colo",
    description: "Sistema de acreditación para prensa y medios de comunicación - Colo-Colo",
    icons: {
      icon: "/colocolo/logo-colo-colo.png",
    },
    viewport: "width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes",
  };
}

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
