"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ShieldAlert, Zap, MapPin, Target, Sword, ChevronRight, Crown, Activity, ArrowLeft } from "lucide-react";

export default function OfficerPortal() {
  const router = useRouter();

  const s = {
    container: { 
      backgroundColor: "#010804", 
      minHeight: "100vh", 
      width: "100vw", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      padding: "15px", 
      position: "relative", // Yahan se 'as const' hata diya gaya hai
      overflow: "hidden" 
    },
    backBtn: {
      position: "absolute", // 'as const' removed
      top: "30px",
      left: "20px",
      zIndex: 50,
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      padding: "12px",
      borderRadius: "15px",
      cursor: "pointer",
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backdropFilter: "blur(10px)"
    },
    glassCard: { 
      background: "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
      backdropFilter: "blur(40px) saturate(180%)",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      padding: "30px 20px",
      borderRadius: "40px",
      width: "100%",
      maxWidth: "340px",
      textAlign: "center", // 'as const' removed
      zIndex: 10,
      boxShadow: "0 50px 100px rgba(0,0,0,0.9), inset 0 0 40px rgba(255,255,255,0.02)"
    },
    btn: (isMain = false) => ({
      width: "100%", 
      padding: isMain ? "16px" : "12px",
      borderRadius: "18px",
      background: isMain ? "rgba(218,37,29,0.12)" : "rgba(255,255,255,0.03)",
      border: isMain ? "1.5px solid #DA251D" : "1px solid rgba(255,255,255,0.06)",
      display: "flex", 
      alignItems: "center", 
      gap: "10px", 
      marginBottom: "8px", 
      color: isMain ? "#DA251D" : "white",
      cursor: "pointer", 
      fontWeight: "900", 
      transition: "0.3s"
    }),
    tag: { 
      fontSize: "8px", 
      fontWeight: "900", 
      letterSpacing: "4px", 
      color: "white", 
      opacity: 0.3, 
      marginBottom: "20px", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      gap: "6px" 
    }
  };

  return (
    <div style={s.container}>
      {/* ⬅️ Sleek Back Button */}
      <motion.button 
        whileHover={{ scale: 1.1, backgroundColor: "rgba(218,37,29,0.1)" }}
        whileTap={{ scale: 0.9 }}
        onClick={() => router.push('/')}
        style={s.backBtn}
      >
        <ArrowLeft size={20} />
      </motion.button>

      {/* Background Glow */}
      <div style={{ position: "absolute", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(218,37,29,0.08) 0%, transparent 70%)", top: "-5%", right: "-5%", zIndex: 0 }}></div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={s.glassCard}>
        
        {/* Branding Mission */}
        <div style={s.tag}>
          <Activity size={10} color="#DA251D" />
          <span>EMS.UP INFRASTRUCTURE</span>
        </div>

        <h1 style={{ fontSize: "1.5rem", fontWeight: "1000", color: "white", marginBottom: "25px", letterSpacing: "-1px" }}>
          OFFICER <span style={{ color: "#DA251D" }}>PORTAL</span>
        </h1>

        {/* 🛡️ SYSTEM CONTROL */}
        <div style={{ textAlign: "left", fontSize: "8px", fontWeight: "900", color: "#DA251D", letterSpacing: "2px", marginBottom: "8px", opacity: 0.7 }}>SYSTEM CONTROL</div>
        <button onClick={() => router.push('/portal/super-admin/login')} style={s.btn(true)}>
          <Crown size={18} /> <span style={{ flex: 1, textAlign: "left", fontSize: "11px" }}>SUPER ADMIN COMMAND</span> <ChevronRight size={16} />
        </button>

        <div style={{ height: "1px", background: "rgba(255,255,255,0.1)", margin: "15px 0" }}></div>

        {/* 🏛️ STRATEGIC COMMAND */}
        <div style={{ textAlign: "left", fontSize: "8px", fontWeight: "900", color: "white", letterSpacing: "2px", marginBottom: "8px", opacity: 0.3 }}>STRATEGIC COMMAND</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <button onClick={() => router.push('/portal/state/login')} style={s.btn()}><ShieldAlert size={16} color="#DA251D" /> <span style={{ flex: 1, textAlign: "left", fontSize: "10px" }}>STATE HEADQUARTERS</span></button>
          <button onClick={() => router.push('/portal/zone/login')} style={s.btn()}><Zap size={16} color="#DA251D" /> <span style={{ flex: 1, textAlign: "left", fontSize: "10px" }}>ZONE COMMAND</span></button>
          <button onClick={() => router.push('/portal/district/login')} style={s.btn()}><MapPin size={16} color="#00914C" /> <span style={{ flex: 1, textAlign: "left", fontSize: "10px" }}>DISTRICT UNIT</span></button>
          <button onClick={() => router.push('/portal/constituency/login')} style={s.btn()}><Target size={16} color="#FFA500" /> <span style={{ flex: 1, textAlign: "left", fontSize: "10px" }}>CONSTITUENCY UNIT</span></button>
        </div>

        {/* 📍 GROUND OPERATIONS */}
        <div style={{ textAlign: "left", fontSize: "8px", fontWeight: "900", color: "white", letterSpacing: "2px", marginTop: "15px", marginBottom: "8px", opacity: 0.3 }}>GROUND OPERATIONS</div>
        <button onClick={() => router.push('/portal/warriors/login')} style={s.btn()}>
          <Sword size={18} color="#DA251D" />
          <div style={{ textAlign: "left" }}>
            <span style={{ display: "block", fontSize: "11px", fontWeight: "900" }}>WARRIORS NODE</span>
            <span style={{ display: "block", fontSize: "7px", color: "#DA251D", fontWeight: "bold" }}>JSS | BM | BP MONITORING</span>
          </div>
          <ChevronRight size={14} style={{ opacity: 0.3 }} />
        </button>

        {/* FOOTER */}
        <div style={{ marginTop: "30px", opacity: 0.2 }}>
          <p style={{ fontSize: "8px", fontWeight: "1000", letterSpacing: "4px", textTransform: "uppercase" }}>ADMIN RAM LAKHAN CLOUD © 2026</p>
        </div>

      </motion.div>
    </div>
  );
}