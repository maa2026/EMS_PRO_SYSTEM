
"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ShieldAlert, Lock, User, ArrowLeft, Globe, Zap } from "lucide-react";

export default function StateLogin() {
  const router = useRouter();

  const handleStateLogin = (e) => {
    e.preventDefault();
    router.push('/state-war-room');
  };

  const s = {
    container: { 
      backgroundColor: "#010804", 
      minHeight: "100dvh", // Mobile keyboard friendly
      width: "100%", 
      display: "flex", 
      flexDirection: "column", // Back button ko top par rakhne ke liye
      alignItems: "center", 
      justifyContent: "center", 
      color: "white", 
      fontFamily: "'Inter', sans-serif", 
      position: "relative", 
      overflowX: "hidden", 
      padding: "20px",
      boxSizing: "border-box"
    },
    glassCard: { 
      background: "rgba(255, 255, 255, 0.02)", 
      backdropFilter: "blur(25px)", 
      WebkitBackdropFilter: "blur(25px)", 
      border: "1px solid rgba(255, 255, 255, 0.1)", 
      padding: "clamp(25px, 8vw, 50px)", 
      borderRadius: "40px", 
      width: "100%", 
      maxWidth: "450px", 
      textAlign: "center", 
      boxShadow: "0 25px 50px rgba(0, 0, 0, 0.8)", 
      zIndex: 10,
      boxSizing: "border-box"
    },
    input: { 
      width: "100%", 
      padding: "18px 20px 18px 50px", 
      borderRadius: "15px", 
      border: "1px solid rgba(255,255,255,0.1)", 
      background: "rgba(255,255,255,0.05)", 
      color: "white", 
      fontSize: "16px", 
      outline: "none", 
      boxSizing: "border-box", 
      marginBottom: "20px"
    },
    // Back Button Fix: Mobile par margins adjust kiye hain
    backBtn: { 
      position: "absolute", 
      top: "clamp(20px, 5vw, 40px)", 
      left: "clamp(20px, 5vw, 40px)", 
      background: "none", 
      border: "none", 
      color: "#444", 
      cursor: "pointer", 
      display: "flex", 
      alignItems: "center", 
      gap: "10px", 
      zIndex: 20, 
      fontSize: "12px", 
      fontWeight: "bold",
      textTransform: "uppercase"
    }
  };

  return (
    <div style={s.container}>
      {/* Background Cinematic Glows */}
      <div style={{ position: "absolute", width: "clamp(300px, 80vw, 600px)", height: "clamp(300px, 80vw, 600px)", background: "radial-gradient(circle, rgba(218,37,29,0.1) 0%, transparent 70%)", top: "-10%", right: "-10%", pointerEvents: "none" }}></div>

      {/* FIXED BACK BUTTON */}
      <motion.button 
        onClick={() => router.push('/')}
        whileHover={{ x: -5, color: "#DA251D" }}
        style={s.backBtn}
      >
        <ArrowLeft size={18} /> <span>BACK</span>
      </motion.button>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        style={s.glassCard}
      >
        <div style={{ marginBottom: "35px" }}>
          <div style={{ display: 'inline-flex', padding: '15px', borderRadius: '22px', background: 'rgba(218,37,29,0.12)', marginBottom: '20px', border: '1px solid rgba(218,37,29,0.2)' }}>
            <ShieldAlert size={35} color="#DA251D" />
          </div>
          
          <span style={{ color: "#DA251D", fontSize: "10px", fontWeight: "900", letterSpacing: "3px", display: "block", marginBottom: "10px" }}>
            AUTHORITY PROTOCOL L-1
          </span>

          <h1 style={{ 
            fontSize: "clamp(2.2rem, 8vw, 3rem)", 
            fontWeight: "1000", 
            margin: 0, 
            letterSpacing: "-1px", 
            display: "flex", 
            alignItems: "baseline", 
            justifyContent: "center" 
          }}>
            EMS<span style={{ display: "inline-block", width: "0.15em", height: "0.15em", backgroundColor: "#DA251D", borderRadius: "50%", margin: "0 0.1em", boxShadow: "0 0 15px #DA251D" }} />UP
          </h1>
          <p style={{ color: "#555", fontSize: "11px", marginTop: "8px", fontWeight: "800", letterSpacing: "1px" }}>STATE HEADQUARTERS ACCESS</p>
        </div>

        <form onSubmit={handleStateLogin}>
          <div style={{ position: "relative" }}>
            <Globe size={18} color="#DA251D" style={{ position: "absolute", left: "18px", top: "18px", opacity: 0.8 }} />
            <input type="text" placeholder="Admin Access ID" required style={s.input} />
          </div>

          <div style={{ position: "relative" }}>
            <Lock size={18} color="#DA251D" style={{ position: "absolute", left: "18px", top: "18px", opacity: 0.8 }} />
            <input type="password" placeholder="Authority Token" required style={s.input} />
          </div>

          <motion.button 
            type="submit"
            whileHover={{ backgroundColor: "#DA251D", color: "white", transition: { duration: 0 } }}
            whileTap={{ scale: 0.98 }}
            style={{ 
              width: "100%", 
              padding: "20px", 
              borderRadius: "100px", // EMS Pill Shape
              border: "none", 
              backgroundColor: "white", 
              color: "black", 
              fontWeight: "900", 
              fontSize: "15px", 
              cursor: "pointer", 
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
            }}
          >
            INITIALIZE NODE <Zap size={18} fill="currentColor" />
          </motion.button>
        </form>

        <div style={{ marginTop: "35px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "20px" }}>
            <p style={{ fontSize: "8px", color: "#333", letterSpacing: "2px", fontWeight: "900" }}>
              ENCRYPTED BIOMETRIC HANDSHAKE ACTIVE
            </p>
            <p style={{ fontSize: "9px", color: "#DA251D", marginTop: "5px", fontWeight: "1000" }}>
              SAMAJWADI CLOUD © 2026
            </p>
        </div>
      </motion.div>

      <style>{`
        body { margin: 0; padding: 0; overflow-x: hidden; background: #010804; }
        input:focus { border: 1px solid #DA251D !important; }
      `}</style>
    </div>
  );
}
