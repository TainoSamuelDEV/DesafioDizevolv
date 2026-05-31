import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Project Pulse — Dashboard Executivo | Dizevolv Tech",
  description: "Dashboard executivo estratégico para lideranças e tomada de decisão. Consolidação de dados de saúde operacional integrados ao ClickUp, com alertas em tempo real de gargalos operacionais.",
  keywords: ["Dizevolv Tech", "Project Pulse", "Dashboard Executivo", "ClickUp Integration", "Gestão Ágil"],
  authors: [{ name: "Taino Ribeiro — Dizevolv Tech" }]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#080a10]">
        {children}
      </body>
    </html>
  );
}
