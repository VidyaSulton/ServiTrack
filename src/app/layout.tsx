import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastContainer } from "@/components/ui/toast";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Precision Fleet — Sistem Monitoring Servis Kendaraan",
  description:
    "Sistem monitoring servis kendaraan untuk mencatat riwayat servis, biaya perawatan, dan menghasilkan laporan bulanan/tahunan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-surface text-slate-100 antialiased font-sans">
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
