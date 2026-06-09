import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";
import { OfflineBanner } from "@/components/layout/OfflineBanner";
import { ServiceWorkerRegister } from "@/components/layout/ServiceWorkerRegister";
import { SettingsProvider } from "@/components/providers/SettingsProvider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  title: "Mundial 2026 Hub",
  description:
    "Hub del FIFA World Cup 2026: 48 equipos, calendario, quiniela, fichas de jugadores y minijuegos. PWA con Next.js.",
  metadataBase: new URL(siteUrl),
  manifest: "/manifest.json",
  openGraph: {
    title: "Mundial 2026 Hub",
    description:
      "Datos del Mundial 2026, quiniela y minijuegos — Reto del 11, Trivia y Tanda 90.",
    type: "website",
    locale: "es_ES",
    siteName: "Mundial 2026 Hub",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mundial 2026 Hub",
    description:
      "Hub del FIFA World Cup 2026 con datos, quiniela y juegos interactivos.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mundial 26",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#22c55e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SettingsProvider>
          <ServiceWorkerRegister />
          <div className="mx-auto flex min-h-dvh max-w-5xl flex-col">
            <OfflineBanner />
            <Header />
            <main className="flex-1 px-4 pb-24 pt-4 md:pb-8">{children}</main>
            <BottomNav />
          </div>
        </SettingsProvider>
      </body>
    </html>
  );
}
