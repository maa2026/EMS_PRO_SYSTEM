// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, ShieldCheck, Sword } from "lucide-react";
import { useTranslation } from 'react-i18next';

export default function Welcome() {
  const router = useRouter();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const tx = (key: string, fallback: string) => mounted ? t(key) : fallback;

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

      <div 
        style={{ zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", width: "100%",
          animation: "fadeUp 0.6s ease both" }}
      >
        {/* Header Tagline */}
        <div style={{ 
          color: "#00914C", fontSize: "12px", fontWeight: "800", letterSpacing: "4px", 
          marginBottom: "15px", opacity: 0.9, textTransform: "uppercase" 
        }}>
          {tx('landing_tagline', 'UP ELECTION INFRASTRUCTURE 2026')}
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
          {tx('landing_desc_1', 'Advanced Digital Governance for a New Era.')}<br />
          {tx('landing_desc_2', 'Secure. Transparent. Scalable.')}
        </p>

        {/* Action Buttons Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "40px", width: "100%", maxWidth: "320px" }}>
          
          {/* Officer Portal Link */}
          <button 
            onClick={() => router.push('/portal')} 
            style={{ 
              padding: "16px", fontSize: "14px", fontWeight: "900", borderRadius: "100px", border: "none", 
              backgroundColor: "white", color: "black", cursor: "pointer", display: "flex", 
              alignItems: "center", justifyContent: "center", gap: "10px", boxShadow: "0 15px 30px rgba(0,0,0,0.4)",
              transition: "background-color 0.2s, transform 0.1s"
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#DA251D"; e.currentTarget.style.color = "white"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "white"; e.currentTarget.style.color = "black"; }}
            onMouseDown={e => e.currentTarget.style.transform = "scale(0.98)"}
            onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
          >
             {tx('officer_login', 'OFFICER LOGIN')} <ShieldCheck size={18} />
          </button>

          {/* Warriors Node Link */}
          <button 
            onClick={() => router.push('/portal/warriors/login')} 
            style={{ 
              padding: "16px", fontSize: "14px", fontWeight: "900", borderRadius: "100px", 
              border: "1px solid rgba(218,37,29,0.5)", backgroundColor: "rgba(218,37,29,0.05)", 
              color: "#DA251D", cursor: "pointer", display: "flex", alignItems: "center", 
              justifyContent: "center", gap: "10px", transition: "border-color 0.2s, transform 0.1s"
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#DA251D"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(218,37,29,0.5)"}
            onMouseDown={e => e.currentTarget.style.transform = "scale(0.98)"}
            onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
          >
             {tx('warriors_node', 'WARRIORS NODE')} <Sword size={18} />
          </button>

          {/* ✅ New Enrollment Button */}
          <button 
            onClick={() => router.push('/signup')}
            style={{
              padding: "14px", fontSize: "12px", fontWeight: "700", borderRadius: "100px",
              border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "transparent",
              color: "#666", cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", gap: "8px", marginTop: "10px",
              transition: "color 0.2s, border-color 0.2s, transform 0.1s"
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "#00914C"; e.currentTarget.style.borderColor = "#00914C"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#666"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
            onMouseDown={e => e.currentTarget.style.transform = "scale(0.98)"}
            onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
          >
             {tx('new_enrollment', 'NEW ENROLLMENT')} <UserPlus size={16} />
          </button>

        </div>
      </div>

      {/* Footer Branding */}
       <div style={{ position: "absolute", bottom: "25px", opacity: 0.3, fontSize: "8px", letterSpacing: "3px", fontWeight: "bold" }}>
         {tx('footer_branding', 'SAMAJWADI CLOUD © 2026')}
       </div>

      <style jsx>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 600px) {
          .hidden-mobile { display: none; }
        }
      `}</style>
    </main>
  );
}
