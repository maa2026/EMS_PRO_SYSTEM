"use client";

/**
 * ======================================================================
 * SYSTEM: EMS.UP WARRIORS NODE (BOOTH LEVEL)
 * MODULE: FIELD ACCESS PROTOCOL
 * FILE: app/portal/warriors/login/page.jsx
 * BRANDING: SAMAJWADI DIGITAL CELL © 2026
 * ======================================================================
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Sword, Smartphone, ArrowLeft, Zap, ShieldCheck, User, Lock, KeyRound } from "lucide-react";

export default function WarriorsNodeLogin() {
  const router = useRouter();
  const [authMethod, setAuthMethod] = useState("OTP"); // Toggle between OTP and Password

  const handleLogin = (e) => {
    e.preventDefault();
    router.push('/portal/warriors/dashboard'); // Field Dashboard path
  };

  // 🛡️ Unified Compact Sizing (340px)
  const s = {
    container: { backgroundColor: "#010804", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", padding: "20px" },
    glassCard: { background: "rgba(255, 255, 255, 0.02)", backdropFilter: "blur(25px)", border: "1px solid rgba(218, 37, 29, 0.2)", padding: "30px", borderRadius: "30px", width: "100%", maxWidth: "340px", textAlign: "center", boxShadow: "0 25px 60px rgba(0,0,0,0.9)", zIndex: 10, display: "flex", flexDirection: "column" },
    inputGroup: { position: "relative", marginBottom: "12px", width: "100%", display: "block" },
    inputIcon: { position: "absolute", left: "15px", top: "15px", opacity: 0.8, zIndex: 11 },
    field: { width: "100%", padding: "14px 14px 14px 45px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", color: "white", fontSize: "14px", outline: "none", boxSizing: "border-box", display: "block" },
    submitBtn: { width: "100%", padding: "16px", borderRadius: "100px", border: "none", backgroundColor: "#DA251D", color: "white", fontWeight: "900", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", boxShadow: "0 10px 25px rgba(218,37,29,0.3)", marginTop: "10px" },
    backBtn: { position: "absolute", top: "30px", left: "25px", background: "none", border: "none", color: "#444", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", zIndex: 20, fontSize: "11px", fontWeight: "900" }
  };

  return (
    <div style={s.container}>
      {/* Intense Crimson Glow */}
      <div style={{ position: "absolute", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(218,37,29,0.15) 0%, transparent 70%)", top: "-5%", right: "-5%", pointerEvents: "none" }}></div>

      <motion.button onClick={() => router.push('/')} whileHover={{ x: -3, color: "#DA251D" }} style={s.backBtn}>
        <ArrowLeft size={16} /> BACK
      </motion.button>

      <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={s.glassCard}>
        <div style={{ marginBottom: "25px" }}>
          <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '18px', background: 'rgba(218,37,29,0.1)', marginBottom: '15px' }}>
            <Sword size={24} color="#DA251D" />
          </div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: "1000", margin: 0, letterSpacing: "-1px", color: "#FFF" }}>
            WARRIORS <span style={{ color: "#DA251D" }}>NODE</span>
          </h1>
          <p style={{ color: "#444", fontSize: "9px", fontWeight: "900", letterSpacing: "2px", marginTop: "8px" }}>FIELD ACCESS PROTOCOL</p>
        </div>

        <form onSubmit={handleLogin} style={{ width: "100%" }}>
          {/* USER ID INPUT */}
          <div style={s.inputGroup}>
            <User size={16} style={s.inputIcon} color="#DA251D" />
            <input type="text" placeholder="Warrior ID / Username" required style={s.field} />
          </div>

          {/* MOBILE INPUT */}
          <div style={s.inputGroup}>
            <Smartphone size={16} style={s.inputIcon} color="#DA251D" />
            <input type="tel" placeholder="Registered Mobile" required style={s.field} />
          </div>

          {/* TOGGLE METHOD */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <button type="button" onClick={() => setAuthMethod("OTP")} style={{ flex: 1, fontSize: '9px', fontWeight: '900', background: authMethod === "OTP" ? "#DA251D" : "transparent", border: '1px solid #DA251D', color: '#fff', padding: '5px', borderRadius: '5px', cursor: 'pointer' }}>USE OTP</button>
            <button type="button" onClick={() => setAuthMethod("PASS")} style={{ flex: 1, fontSize: '9px', fontWeight: '900', background: authMethod === "PASS" ? "#DA251D" : "transparent", border: '1px solid #DA251D', color: '#fff', padding: '5px', borderRadius: '5px', cursor: 'pointer' }}>USE PASSWORD</button>
          </div>

          <AnimatePresence mode="wait">
            {authMethod === "OTP" ? (
              <motion.div key="otp" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={s.inputGroup}>
                <KeyRound size={16} style={s.inputIcon} color="#DA251D" />
                <input type="text" placeholder="Enter 6-Digit OTP" required style={s.field} />
              </motion.div>
            ) : (
              <motion.div key="pass" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} style={s.inputGroup}>
                <Lock size={16} style={s.inputIcon} color="#DA251D" />
                <input type="password" placeholder="Secure Password" required style={s.field} />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={s.submitBtn}>
            {authMethod === "OTP" ? "VERIFY & ENTER" : "AUTHORIZE ACCESS"} <Zap size={16} fill="currentColor" />
          </motion.button>
        </form>

        <div style={{ marginTop: "30px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "15px" }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: 0.3 }}>
             <ShieldCheck size={14} color="#DA251D" />
             <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#FFF' }}>SAMAJWADI DIGITAL CELL</span>
          </div>
          <p style={{ fontSize: "8px", color: "#222", marginTop: "5px", fontWeight: "900" }}>ADMIN RAM LAKHAN CYBER SECURITY © 2026</p>
        </div>
      </motion.div>
    </div>
  );
}