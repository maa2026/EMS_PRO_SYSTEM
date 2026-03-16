"use client";

/**
 * ======================================================================
 * SYSTEM: EMS.UP ZONE COMMAND LOGIN
 * MODULE: SMART SEARCH NODE (3-ITEM VISIBILITY)
 * BRANDING: ADMIN RAM LAKHAN CYBER SECURITY Standard
 * ======================================================================
 */

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Globe, Lock, User, ArrowLeft, Activity, ShieldCheck, Edit3, ChevronDown, Search } from "lucide-react";

export default function ZoneLogin() {
  const router = useRouter();
  const [isManual, setIsManual] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const dropdownRef = useRef(null);

  // --- OFFICIAL 15 ZONES (LOCKED DATA) ---
  const upZones = [
    "1 Western Jat–Muslim Core",
    "2 NCR / Upper Doab Urban",
    "3 Rohilkhand West (Minority Belt)",
    "4 Rohilkhand East (Silent Swing)",
    "5 Braj–Agra Belt",
    "6 Central Doab (SP Core)",
    "7 Upper Ganga–Kali Belt",
    "8 Awadh Central (Power–Perception)",
    "9 Awadh South (Faith–Memory)",
    "10 Awadh North–Terai Border",
    "11 Gorakhpur–Basti Core",
    "12 Purvanchal Core (Azamgarh Spine)",
    "13 Purvanchal South–Vindhya Link",
    "14 South Doab–Bundelkhand Edge",
    "15 Bundelkhand Core"
  ];

  // Smart Search Logic
  const filteredItems = upZones.filter(z => 
    z.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const themeColor = "#DC2626"; // Strategic Red

  const s = {
    container: { backgroundColor: "#020202", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", padding: "20px" },
    glassCard: { background: "rgba(255, 255, 255, 0.02)", backdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "30px", borderRadius: "30px", width: "100%", maxWidth: "340px", textAlign: "center", boxShadow: "0 20px 40px rgba(0, 0, 0, 0.8)", zIndex: 10, display: "flex", flexDirection: "column" },
    inputGroup: { position: "relative", marginBottom: "12px", width: "100%" },
    inputIcon: { position: "absolute", left: "15px", top: "15px", opacity: 0.6, zIndex: 11 },
    field: { width: "100%", padding: "14px 14px 14px 45px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", color: "white", fontSize: "12px", outline: "none", boxSizing: "border-box", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" },
    
    // --- 3-ITEM LIMIT: Height set to ~135px (45px per item) ---
    scrollMenu: { position: "absolute", top: "100%", left: 0, right: 0, marginTop: "5px", background: "#0A0505", border: `1px solid ${themeColor}4d`, borderRadius: "12px", maxHeight: "135px", overflowY: "auto", zIndex: 100, boxShadow: "0 10px 25px rgba(0,0,0,0.5)" },
    
    searchBox: { width: "100%", padding: "10px 15px 10px 35px", background: "rgba(255,255,255,0.05)", border: "none", borderBottom: `1px solid ${themeColor}33`, color: "white", fontSize: "11px", outline: "none", position: "sticky", top: 0, zIndex: 101 },
    menuItem: { padding: "12px 15px", fontSize: "11px", color: "#ccc", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.05)", textAlign: "left", transition: "0.2s" },
    submitBtn: { width: "100%", padding: "14px", borderRadius: "100px", border: "none", backgroundColor: "white", color: "black", fontWeight: "900", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "10px", textTransform: "uppercase" },
    toggleLink: { background: "none", border: "none", color: themeColor, fontSize: "9px", fontWeight: "900", cursor: "pointer", marginBottom: "15px", textTransform: "uppercase", letterSpacing: "1px", opacity: 0.7 }
  };

  return (
    <div style={s.container}>
      <div style={{ position: "absolute", width: "300px", height: "300px", background: `radial-gradient(circle, ${themeColor}1a 0%, transparent 70%)`, top: "-5%", left: "-5%" }}></div>
      <motion.button onClick={() => router.push('/portal')} whileHover={{ x: -3 }} style={{ position: "absolute", top: "30px", left: "30px", background: "none", border: "none", color: "#444", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", zIndex: 20, fontSize: "11px", fontWeight: "bold" }}><ArrowLeft size={16} /> BACK</motion.button>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={s.glassCard}>
        <div style={{ marginBottom: "25px" }}>
          <div style={{ display: 'inline-flex', padding: '10px', borderRadius: '15px', background: `${themeColor}1a`, marginBottom: '15px', border: `1px solid ${themeColor}33` }}><ShieldCheck size={24} color={themeColor} /></div>
          <span style={{ color: themeColor, fontSize: "9px", fontWeight: "900", letterSpacing: "3px", display: "block", marginBottom: "5px", textTransform: "uppercase" }}>Zone Command (Level 02)</span>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "900", margin: 0, color: "#FFF", letterSpacing: "-1px" }}>EMS.UP</h1>
        </div>

        <button onClick={() => { setIsManual(!isManual); setIsOpen(false); }} style={s.toggleLink}>{isManual ? "Switch to Selection" : "Bypass Selection (Manual)"}</button>

        <form onSubmit={(e) => { e.preventDefault(); router.push('/portal/zone'); }} style={{ width: "100%", display: "flex", flexDirection: "column" }}>
          <AnimatePresence mode="wait">
            {!isManual && (
              <motion.div key="list" ref={dropdownRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={s.inputGroup}>
                <Globe size={16} style={s.inputIcon} color={themeColor} />
                <div style={s.field} onClick={() => setIsOpen(!isOpen)}>
                  <span style={{ color: selectedZone ? "white" : "#666", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedZone || "SELECT STRATEGIC NODE"}</span>
                  <ChevronDown size={14} color={themeColor} style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "0.3s" }} />
                </div>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={s.scrollMenu} className="custom-scroll-red">
                      <div style={{ position: "relative" }}>
                        <Search size={12} color={themeColor} style={{ position: "absolute", left: "12px", top: "12px", zIndex: 102 }} />
                        <input type="text" placeholder="Smart Search Zone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onClick={(e) => e.stopPropagation()} style={s.searchBox} />
                      </div>
                      {filteredItems.map((item) => (
                        <div key={item} style={s.menuItem} onClick={() => { setSelectedZone(item); setIsOpen(false); setSearchTerm(""); }}
                          onMouseEnter={(e) => e.target.style.background = `${themeColor}1a`}
                          onMouseLeave={(e) => e.target.style.background = "transparent"}
                        >
                          {item}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={s.inputGroup}><User size={16} style={s.inputIcon} color={themeColor} /><input type="text" placeholder="Commander ID" required style={{...s.field, cursor: "text"}} /></div>
          <div style={s.inputGroup}><Lock size={16} style={s.inputIcon} color={themeColor} /><input type="password" placeholder="Passcode" required style={{...s.field, cursor: "text"}} /></div>
          <motion.button type="submit" whileHover={{ scale: 1.01, backgroundColor: themeColor, color: "white" }} style={s.submitBtn}>AUTHORIZE COMMAND <Activity size={14} /></motion.button>
        </form>
      </motion.div>

      <style jsx global>{`
        .custom-scroll-red::-webkit-scrollbar { width: 4px; }
        .custom-scroll-red::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll-red::-webkit-scrollbar-thumb { background: ${themeColor}; border-radius: 10px; }
      `}</style>
    </div>
  );
}