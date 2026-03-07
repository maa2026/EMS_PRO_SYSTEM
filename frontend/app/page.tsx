"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { UserPlus, ShieldCheck, Sword } from "lucide-react";

export default function Welcome() {
  const router = useRouter();

  const containerStyle = {
    backgroundColor: "#010804",
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontFamily: "'Inter', sans-serif",
    margin: 0,
    overflowX: "hidden" as const,
    position: "relative" as const,
    textAlign: "center" as const,
    padding: "80px 20px"
  };

  return (
    <main style={containerStyle}>
      {/* Background Glow */}
      <div style={{
        position: "absolute",
        width: "100vw",
        height: "100vw",
        background: "radial-gradient(circle, rgba(218,37,29,0.08) 0%, transparent 70%)",
        top: "-15%",
        left: "-5%",
        pointerEvents: "none",
        zIndex: 0
      }}></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        style={{ zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}
      >
        {/* Header Tagline */}
        <div style={{ 
          color: "#00914C", fontSize: "12px", fontWeight: "800", letterSpacing: "4px", 
          marginBottom: "15px", opacity: 0.9, textTransform: "uppercase" 
        }}>
          UP ELECTION INFRASTRUCTURE 2026
        </div>

        {/* Logo EMS.UP */}
        <h1 style={{ 
          fontSize: "clamp(4.5rem, 22vw, 11rem)", fontWeight: "900", margin: "10px 0", 
          letterSpacing: "-0.04em", lineHeight: "0.9", display: "flex", alignItems: "center", justifyContent: "center" 
        }}>
          EMS
          <span style={{ 
            display: "inline-block", width: "0.15em", height: "0.15em", backgroundColor: "#DA251D", 
            borderRadius: "50%", margin: "0 0.1em", boxShadow: "0 0 25px #DA251D" 
          }} />
          UP
        </h1>

        {/* Description */}
        <p style={{ 
          fontSize: "clamp(15px, 4.5vw, 18px)", color: "#aaa", marginTop: "20px", 
          maxWidth: "480px", width: "90%", fontWeight: "400", lineHeight: "1.8" 
        }}>
          Advanced Digital Governance for a New Era.<br />
          Secure. Transparent. Scalable.
        </p>

        {/* Action Buttons Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "40px", width: "100%", maxWidth: "320px" }}>
          
          {/* Officer Portal Link */}
          <motion.button 
            whileHover={{ scale: 1.02, backgroundColor: "#DA251D", color: "white" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/portal')} 
            style={{ 
              padding: "16px", fontSize: "14px", fontWeight: "900", borderRadius: "100px", border: "none", 
              backgroundColor: "white", color: "black", cursor: "pointer", display: "flex", 
              alignItems: "center", justifyContent: "center", gap: "10px", boxShadow: "0 15px 30px rgba(0,0,0,0.4)" 
            }}
          >
            OFFICER LOGIN <ShieldCheck size={18} />
          </motion.button>

          {/* Warriors Node Link */}
          <motion.button 
            whileHover={{ scale: 1.02, borderColor: "#DA251D" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/portal/warriors/login')} 
            style={{ 
              padding: "16px", fontSize: "14px", fontWeight: "900", borderRadius: "100px", 
              border: "1px solid rgba(218,37,29,0.5)", backgroundColor: "rgba(218,37,29,0.05)", 
              color: "#DA251D", cursor: "pointer", display: "flex", alignItems: "center", 
              justifyContent: "center", gap: "10px" 
            }}
          >
            WARRIORS NODE <Sword size={18} />
          </motion.button>

          {/* ✅ New Enrollment Button (Wapas Add Kiya) */}
          <motion.button 
            whileHover={{ scale: 1.02, color: "#00914C", borderColor: "#00914C" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/signup')}
            style={{
              padding: "14px", fontSize: "12px", fontWeight: "700", borderRadius: "100px",
              border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "transparent",
              color: "#666", cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", gap: "8px", marginTop: "10px"
            }}
          >
            NEW ENROLLMENT <UserPlus size={16} />
          </motion.button>

        </div>
      </motion.div>

      {/* Footer Branding */}
      <div style={{ position: "absolute", bottom: "25px", opacity: 0.3, fontSize: "8px", letterSpacing: "3px", fontWeight: "bold" }}>
        SAMAJWADI CLOUD © 2026
      </div>

      <style jsx>{`
        @media (max-width: 600px) {
          .hidden-mobile { display: none; }
        }
      `}</style>
    </main>
  );
}