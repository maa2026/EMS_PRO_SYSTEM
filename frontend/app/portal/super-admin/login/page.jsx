"use client";

/**
 * ======================================================================
 * SYSTEM: EMS.UP GLOBAL ROOT COMMAND CENTER
 * MODULE: SUPREME AUTHORITY PROTOCOL (L-MAX)
 * FILE: app/portal/super-admin/login/page.jsx
 * BRANDING: ADMIN RAM LAKHAN CYBER SECURITY Standard
 * ======================================================================
 */

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Terminal, ArrowLeft, Cpu, Zap, Activity, ChevronLeft } from "lucide-react";

export default function SuperAdminLogin() {
  const router = useRouter();

  const handleRootLogin = (e) => {
    e.preventDefault();
    router.push('/portal/super-admin/dashboard'); 
  };

  const s = {
    container: { 
      backgroundColor: "#020202", 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      position: "relative", 
      overflow: "hidden", 
      padding: "20px",
      fontFamily: "sans-serif"
    },
    // 🔙 BACK TO PORTAL BUTTON STYLE
    portalBack: {
      position: "fixed",
      top: "30px",
      left: "30px",
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      gap: "8px",
      color: "#444",
      fontSize: "11px",
      fontWeight: "900",
      letterSpacing: "2px",
      cursor: "pointer",
      border: "1px solid rgba(255,255,255,0.05)",
      padding: "10px 18px",
      borderRadius: "100px",
      background: "rgba(255,255,255,0.02)",
      textTransform: "uppercase",
      transition: "0.3s"
    },
    glassCard: { 
      background: "rgba(10, 10, 10, 0.6)", 
      backdropFilter: "blur(25px)", 
      border: "1px solid rgba(59, 130, 246, 0.2)", 
      padding: "25px", 
      borderRadius: "24px", 
      width: "100%", 
      maxWidth: "330px", 
      textAlign: "center", 
      boxShadow: "0 0 50px rgba(59, 130, 246, 0.1)", 
      zIndex: 10,
      height: "auto" 
    },
    inputGroup: { position: "relative", marginBottom: "10px", width: "100%" },
    inputIcon: { position: "absolute", left: "14px", top: "13px", opacity: 0.8, zIndex: 11 },
    field: { 
      width: "100%", 
      padding: "12px 12px 12px 42px", 
      borderRadius: "10px", 
      border: "1px solid rgba(255,255,255,0.05)", 
      background: "rgba(255,255,255,0.02)", 
      color: "#fff", 
      fontSize: "13px", 
      outline: "none", 
      boxSizing: "border-box"
    },
    submitBtn: { 
      width: "100%", padding: "12px", borderRadius: "8px", border: "none", 
      backgroundColor: "#3b82f6", color: "white", fontWeight: "800", 
      fontSize: "12px", cursor: "pointer", display: "flex", 
      alignItems: "center", justifyContent: "center", gap: "8px", 
      marginTop: "15px", textTransform: "uppercase" 
    }
  };

  return (
    <div style={s.container}>
      
      {/* 🔙 DIRECT PORTAL BACK BUTTON */}
      <motion.div 
        onClick={() => router.push('/portal')} 
        whileHover={{ color: "#3b82f6", borderColor: "rgba(59,130,246,0.3)", backgroundColor: "rgba(59,130,246,0.05)", x: -5 }}
        whileTap={{ scale: 0.95 }}
        style={s.portalBack}
      >
        <ArrowLeft size={16} /> Portal Gateway
      </motion.div>

      {/* Decorative Background Glow */}
      <div style={{ position: "absolute", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)", top: "-5%", right: "-5%" }}></div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={s.glassCard}>
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: 'rgba(59,130,246,0.1)', marginBottom: '12px', border: '1px solid rgba(59,130,246,0.3)' }}>
            <ShieldCheck size={28} color="#3b82f6" />
          </div>
          <span style={{ color: "#3b82f6", fontSize: "8px", fontWeight: "900", letterSpacing: "4px", display: "block", marginBottom: "4px", textTransform: "uppercase" }}>
            Supreme Root Access
          </span>
          <h1 style={{ fontSize: "1.8rem", color: "#fff", fontWeight: "900", margin: 0 }}>
            EMS<span style={{ color: "#3b82f6" }}>.</span>CORE
          </h1>
          <p style={{ color: "#555", fontSize: "9px", marginTop: "4px", fontWeight: "bold" }}>GLOBAL SYSTEM COMMANDER</p>
        </div>

        <form onSubmit={handleRootLogin} style={{ display: "flex", flexDirection: "column" }}>
          <div style={s.inputGroup}>
            <Terminal size={15} style={s.inputIcon} color="#3b82f6" />
            <input type="text" placeholder="Root Identifier" required style={s.field} />
          </div>

          <div style={s.inputGroup}>
            <Lock size={15} style={s.inputIcon} color="#3b82f6" />
            <input type="password" placeholder="Encryption Key" required style={s.field} />
          </div>

          <motion.button 
            type="submit" 
            whileHover={{ backgroundColor: "#2563eb", boxShadow: "0 0 15px rgba(59,130,246,0.3)" }} 
            whileTap={{ scale: 0.98 }} 
            style={s.submitBtn}
          >
            EXECUTE LOGIN <Zap size={14} fill="currentColor" />
          </motion.button>
        </form>

        <div style={{ marginTop: "20px", borderTop: "1px solid rgba(255,255,255,0.03)", paddingTop: "15px" }}>
          <p style={{ fontSize: "8px", color: "#333", fontWeight: "800", margin: 0, letterSpacing: "1px" }}>
            ADMIN RAM LAKHAN SECURITY STACK v6.0
          </p>
        </div>
      </motion.div>
    </div>
  );
}