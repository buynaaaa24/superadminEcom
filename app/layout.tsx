import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AdminProvider } from "./lib/AdminContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Super Admin",
  description: "Manage tenants, admin users, and site settings across all client sites",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn" className={inter.variable}>
      <body>
        <AdminProvider>{children}</AdminProvider>
      </body>
    </html>
  );
}
