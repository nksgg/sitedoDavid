import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FutebolSorter | Gerenciador, Sorteador e Súmula de Racha",
  description:
    "Aplicativo web completo para gestão de elenco, sorteio equilibrado de times e posições (5x5, 7x7, 11x11), súmula ao vivo, estatísticas de jogadores e exportação para WhatsApp.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#f97316",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-orange-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
