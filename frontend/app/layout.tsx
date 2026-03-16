// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import "./globals.css";
import Navbar from "../components/Navbar";
import FloatingChat from "../components/FloatingChat";
import '../src/i18n';
import { I18nextProvider } from 'react-i18next';
import i18n from '../src/i18n';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [currentLang, setCurrentLang] = useState("en");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const openLogin = () => console.log("Opening Login...");

  useEffect(() => { i18n.changeLanguage(currentLang); }, [currentLang]);

  useEffect(() => {
    const saved = localStorage.getItem("ems-theme") as "dark" | "light" | null;
    if (saved) setTheme(saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("ems-theme", next);
  };

  return (
    <I18nextProvider i18n={i18n}>
      <html lang={currentLang} data-theme={theme}>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet" />
          <title>EMS.UP - Election Management System</title>
        </head>
        <body style={{
          backgroundColor: "var(--background)",
          color: "var(--foreground)",
          margin: 0,
          fontFamily: "'Inter', sans-serif",
          position: "relative",
          minHeight: "100vh",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale"
        }}>

          {/* Navbar */}
          <div style={{
            padding: "8px 16px",
            position: "sticky",
            top: 0,
            zIndex: 50
          }}>
            <Navbar
              currentLang={currentLang}
              setLang={setCurrentLang}
              openLogin={openLogin}
              theme={theme}
              toggleTheme={toggleTheme}
            />
          </div>

          <main style={{
            marginTop: "20px",
            minHeight: "calc(100vh - 80px)",
            paddingBottom: "40px"
          }}>
            {children}
          </main>

          {/* ✅ 2. Floating Chat Component Yahan Rakhein */}
          {/* Ye har page par screen ke kone mein tairta rahega */}
          <FloatingChat />

        </body>
      </html>
    </I18nextProvider>
  );
}
