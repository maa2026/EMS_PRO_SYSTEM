"use client"; // Client-side state handle karne ke liye
/**
 * EMS.UP MASTER LAYOUT
 * AUTHOR: ADMIN RAM LAKHAN
 */
import { useState } from "react";
import "./globals.css";
import Navbar from "../components/Navbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Language handle karne ke liye state banayi
  const [currentLang, setCurrentLang] = useState("en");

  // Login popup handle karne ke liye (Optionally)
  const openLogin = () => console.log("Opening Login...");

  return (
    <html lang={currentLang}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet" />
      </head>
      <body style={{ backgroundColor: "#010804", margin: 0, fontFamily: "'Inter', sans-serif" }}>
        
        {/* Navbar ko ab function mil jayega, toh error nahi aayega */}
        <div style={{ padding: "10px 20px" }}>
          <Navbar 
            isDashboard={true} 
            currentLang={currentLang} 
            setLang={setCurrentLang} 
            openLogin={openLogin}
          />
        </div>

        <main style={{ marginTop: "80px" }}>
          {children}
        </main>

      </body>
    </html>
  );
}