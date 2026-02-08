import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export const metadata: Metadata = {
  title: "TailorCV - Creador de CV con IA",
  description:
    "Crea CVs profesionales personalizados con IA en minutos. TailorCV adapta tu currículum a cada oferta de trabajo automáticamente.",
  keywords: [
    "CV personalizado",
    "currículum IA",
    "tailor resume",
    "crear cv online",
    "inteligencia artificial",
  ],
  authors: [{ name: "TailorCV Team" }],
  openGraph: {
    title: "TailorCV - Creador de CV con IA",
    description: "Crea CVs profesionales personalizados con IA en minutos.",
    type: "website",
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title: "TailorCV - Creador de CV con IA",
    description: "Crea CVs profesionales personalizados con IA en minutos.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased min-h-screen flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
