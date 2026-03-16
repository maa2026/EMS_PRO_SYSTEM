"use client";

/**
 * ======================================================================
 * SYSTEM: EMS.UP STATE COMMAND LOGIN (UPDATED)
 * MODULE: SECURE AUTHORITY PROTOCOL L-1
 * BRANDING: ADMIN RAM LAKHAN CYBER SECURITY Standard
 * ======================================================================
 */

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Cookies from "js-cookie"; // Cookie import ki hai security ke liye
import { ShieldAlert, Lock, ArrowLeft, Globe, Zap } from "lucide-react";

export default function StateLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const themeColor = "#DA251D"; // Samajwadi Red

  // 🛠️ Secure Login Logic
  const handleStateLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const username = e.target[0].value;
    const password = e.target[1].value;

    try {
      // 📡 Backend Call (Aapke Flask Server par)
      const res = await fetch('http://127.0.0.1:5000/api/workers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (data.success) {
        // ✅ 1. Cookie Set Karo (Middleware ise padh kar rasta kholega)
        Cookies.set('userRole', 'L1', { expires: 7 }); 
        Cookies.set('adminToken', 'true', { expires: 7 });
        
        // ✅ 2. Redirect to Dashboard
        router.push('/portal/state/dashboard');
      } else {
        alert("ACCESS DENIED: Invalid Authority Token");
      }
    } catch (err) {
      alert("SERVER ERROR: Check if your Flask server is running!");
    } finally {
      setLoading(false);
    }
  };

  const s = {
    container: { backgroundColor: "#010804", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", padding: "20px" },
    glassCard: { background: "rgba(255, 255, 255, 0.02)", backdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "30px", borderRadius: "30px", width: "100%", maxWidth: "340px", textAlign: "center", boxShadow: "0 20px 40px rgba(0, 0, 0, 0.8)", zIndex: 10, display: "flex", flexDirection: "column" },
    inputGroup: { position: "relative", marginBottom: "12px", width: "100%" },
    inputIcon: { position: "absolute", left: "15px", top: "15px", opacity: 0.6, zIndex: 11 },
    field: { width: "100%", padding: "14px 14px 14px 45px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", color: "white", fontSize: "13px", outline: "none", boxSizing: "border-box", textAlign: "left" },
    submitBtn: { width: "100%", padding: "14px", borderRadius: "100px", border: "none", backgroundColor: loading ? "#333" : "white", color: "black", fontWeight: "900", fontSize: "13px", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "10px", textTransform: "uppercase" },
    backBtn: { position: "absolute", top: "30px", left: "30px", background: "none", border: "none", color: "#444", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", zIndex: 20, fontSize: "11px", fontWeight: "bold" }
  };

  return (
    <div style={s.container}>
      <div style={{ position: "absolute", width: "300px", height: "300px", background: `radial-gradient(circle, ${themeColor}1a 0%, transparent 70%)`, top: "-5%", left: "-5%" }}></div>

      <motion.button onClick={() => router.push('/portal')} whileHover={{ x: -3, color: themeColor }} style={s.backBtn}>
        <ArrowLeft size={16} /> BACK
      </motion.button>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={s.glassCard}>
        <div style={{ marginBottom: "25px" }}>
          <div style={{ display: 'inline-flex', padding: '10px', borderRadius: '15px', background: `${themeColor}1a`, marginBottom: '15px', border: `1px solid ${themeColor}33` }}>
            <ShieldAlert size={24} color={themeColor} />
          </div>
          <span style={{ color: themeColor, fontSize: "9px", fontWeight: "900", letterSpacing: "3px", display: "block", marginBottom: "5px", textTransform: "uppercase" }}>
            State Authority L-1
          </span>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "900", margin: 0, color: "#FFF", letterSpacing: "-1px" }}>
            EMS<span style={{ color: themeColor }}>.</span>UP
          </h1>
        </div>

        <form onSubmit={handleStateLogin} style={{ width: "100%", display: "flex", flexDirection: "column" }}>
          <div style={s.inputGroup}>
            <Globe size={16} style={s.inputIcon} color={themeColor} />
            <input type="text" placeholder="Admin Access ID" required style={s.field} />
          </div>

          <div style={s.inputGroup}>
            <Lock size={16} style={s.inputIcon} color={themeColor} />
            <input type="password" placeholder="Authority Token" required style={s.field} />
          </div>
          
          <motion.button 
            type="submit" 
            disabled={loading}
            whileHover={{ scale: 1.01, backgroundColor: loading ? "#333" : themeColor, color: "white" }} 
            style={s.submitBtn}
          >
            {loading ? "AUTHENTICATING..." : "INITIALIZE NODE"} <Zap size={14} fill="currentColor" />
          </motion.button>
        </form>

        <div style={{ marginTop: "25px", paddingTop: "15px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <p style={{ fontSize: "7px", color: "#333", letterSpacing: "2px", fontWeight: "900", textTransform: "uppercase" }}>
              Encrypted Biometric Handshake Active
            </p>
            <p style={{ fontSize: "8px", color: themeColor, marginTop: "5px", fontWeight: "1000", letterSpacing: "1px" }}>
              SAMAJWADI CLOUD © 2026
            </p>
        </div>
      </motion.div>

      <style jsx global>{`
        input:focus { border: 1px solid ${themeColor} !important; }
      `}</style>
    </div>
  );
}