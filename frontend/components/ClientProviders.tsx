"use client";

import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import FloatingChat from "./FloatingChat";
import "../src/i18n";
import { I18nextProvider } from "react-i18next";
import i18n from "../src/i18n";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const [currentLang, setCurrentLang] = useState("en");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    i18n.changeLanguage(currentLang);
  }, [currentLang]);

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
      <div data-theme={theme} style={{ minHeight: "100vh" }}>
        <Navbar
          currentLang={currentLang}
          setLang={setCurrentLang}
          openLogin={() => {}}
          theme={theme}
          toggleTheme={toggleTheme}
        />
        <main style={{
          paddingTop: "80px",
          minHeight: "calc(100vh - 80px)",
          paddingBottom: "40px",
        }}>
          {children}
        </main>
        <FloatingChat />
      </div>
    </I18nextProvider>
  );
}
