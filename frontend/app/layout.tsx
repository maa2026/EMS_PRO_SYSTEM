// @ts-nocheck
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientProviders from "../components/ClientProviders";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "EMS.UP - Election Management System",
  description: "Advanced Digital Governance for UP Elections 2026",
  viewport: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
        margin: 0,
        fontFamily: "var(--font-inter), 'Inter', sans-serif",
        position: "relative",
        minHeight: "100vh",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      }}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
