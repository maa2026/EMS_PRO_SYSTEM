"use client";

/**
 * ======================================================================
 * SYSTEM: EMS.UP DISTRICT UNIT LOGIN
 * MODULE: ENTERPRISE SCROLLABLE SEARCH NODE
 * FILE: app/portal/district/login/page.jsx
 * BRANDING: ADMIN RAM LAKHAN CYBER SECURITY Standard
 * ======================================================================
 */

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { MapPin, Lock, User, ArrowLeft, Activity, Shield, Edit3, ChevronDown, Search } from "lucide-react";

export default function DistrictLogin() {
  const router = useRouter();
  const [isManual, setIsManual] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDist, setSelectedDist] = useState("");
  const dropdownRef = useRef(null);

  // UP 75 Districts
  const upDistricts = [
    "Agra", "Aligarh", "Prayagraj", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Ayodhya", "Azamgarh", "Baghpat", 
    "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", 
    "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Farrukhabad", "Fatehpur", "Firozabad", 
    "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", 
    "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kheri", 
    "Kushinagar", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", 
    "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Raebareli", "Rampur", "Saharanpur", "Sambhal", 
    "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", 
    "Unnao", "Varanasi"
  ];

  // Filter districts based on search
  const filteredDistricts = upDistricts.filter(d => 
    d.toLowerCase().includes(searchTerm.toLowerCase())
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

  const s = {
    container: { backgroundColor: "#010804", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", padding: "20px" },
    glassCard: { background: "rgba(255, 255, 255, 0.02)", backdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "30px", borderRadius: "30px", width: "100%", maxWidth: "340px", textAlign: "center", boxShadow: "0 20px 40px rgba(0, 0, 0, 0.8)", zIndex: 10, display: "flex", flexDirection: "column" },
    inputGroup: { position: "relative", marginBottom: "12px", width: "100%" },
    inputIcon: { position: "absolute", left: "15px", top: "15px", opacity: 0.6, zIndex: 11 },
    field: { width: "100%", padding: "14px 14px 14px 45px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", color: "white", fontSize: "13px", outline: "none", boxSizing: "border-box", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" },
    scrollMenu: { position: "absolute", top: "100%", left: 0, right: 0, marginTop: "5px", background: "#0A0F0C", border: "1px solid rgba(0,145,76,0.3)", borderRadius: "12px", maxHeight: "200px", overflowY: "auto", zIndex: 100, boxShadow: "0 10px 25px rgba(0,0,0,0.5)" },
    searchBox: { width: "100%", padding: "10px 15px 10px 35px", background: "rgba(255,255,255,0.05)", border: "none", borderBottom: "1px solid rgba(0,145,76,0.2)", color: "white", fontSize: "12px", outline: "none", position: "sticky", top: 0, zIndex: 101 },
    menuItem: { padding: "12px 15px", fontSize: "12px", color: "#ccc", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.05)", textAlign: "left", transition: "0.2s" },
    submitBtn: { width: "100%", padding: "14px", borderRadius: "100px", border: "none", backgroundColor: "white", color: "black", fontWeight: "900", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "10px", textTransform: "uppercase" },
    toggleLink: { background: "none", border: "none", color: "#00914C", fontSize: "9px", fontWeight: "900", cursor: "pointer", marginBottom: "15px", textTransform: "uppercase", letterSpacing: "1px", opacity: 0.7 }
  };

  return (
    <div style={s.container}>
      <div style={{ position: "absolute", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(0,145,76,0.12) 0%, transparent 70%)", top: "-5%", left: "-5%" }}></div>
      <motion.button onClick={() => router.push('/portal')} whileHover={{ x: -3 }} style={{ position: "absolute", top: "30px", left: "30px", background: "none", border: "none", color: "#444", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", zIndex: 20, fontSize: "11px", fontWeight: "bold" }}><ArrowLeft size={16} /> BACK</motion.button>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={s.glassCard}>
        <div style={{ marginBottom: "25px" }}>
          <div style={{ display: 'inline-flex', padding: '10px', borderRadius: '15px', background: 'rgba(0,145,76,0.1)', marginBottom: '15px', border: '1px solid rgba(0,145,76,0.2)' }}><Shield size={24} color="#00914C" /></div>
          <span style={{ color: "#00914C", fontSize: "9px", fontWeight: "900", letterSpacing: "3px", display: "block", marginBottom: "5px", textTransform: "uppercase" }}>District Unit</span>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "900", margin: 0, color: "#FFF", letterSpacing: "-1px" }}>EMS.UP</h1>
        </div>

        <button onClick={() => { setIsManual(!isManual); setIsOpen(false); }} style={s.toggleLink}>{isManual ? "Switch to Selection" : "Bypass Selection (Manual)"}</button>

        <form onSubmit={(e) => { e.preventDefault(); router.push('/portal/district'); }} style={{ width: "100%", display: "flex", flexDirection: "column" }}>
          <AnimatePresence mode="wait">
            {isManual ? (
              <motion.div key="manual" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={s.inputGroup}>
                <Edit3 size={16} style={s.inputIcon} color="#00914C" />
                <input type="text" placeholder="Identify District..." required style={{...s.field, cursor: "text"}} />
              </motion.div>
            ) : (
              <motion.div key="list" ref={dropdownRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={s.inputGroup}>
                <MapPin size={16} style={s.inputIcon} color="#00914C" />
                <div style={s.field} onClick={() => setIsOpen(!isOpen)}>
                  <span style={{ color: selectedDist ? "white" : "#666", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedDist || "SELECT DISTRICT"}</span>
                  <ChevronDown size={14} color="#00914C" style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "0.3s" }} />
                </div>
                
                {/* 📜 SCROLLABLE + SEARCHABLE MENU */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={s.scrollMenu} className="custom-scroll-green">
                      <div style={{ position: "relative" }}>
                        <Search size={12} color="#00914C" style={{ position: "absolute", left: "12px", top: "12px", zIndex: 102 }} />
                        <input type="text" placeholder="Search District..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onClick={(e) => e.stopPropagation()} style={s.searchBox} />
                      </div>
                      {filteredDistricts.map((dist) => (
                        <div key={dist} style={s.menuItem} 
                          onClick={() => { setSelectedDist(dist); setIsOpen(false); setSearchTerm(""); }}
                          onMouseEnter={(e) => e.target.style.background = "rgba(0,145,76,0.1)"}
                          onMouseLeave={(e) => e.target.style.background = "transparent"}
                        >
                          {dist}
                        </div>
                      ))}
                      {filteredDistricts.length === 0 && <div style={{...s.menuItem, color: "#444", textAlign: "center"}}>No District Found</div>}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={s.inputGroup}><User size={16} style={s.inputIcon} color="#00914C" /><input type="text" placeholder="Officer ID" required style={{...s.field, cursor: "text"}} /></div>
          <div style={s.inputGroup}><Lock size={16} style={s.inputIcon} color="#00914C" /><input type="password" placeholder="Passcode" required style={{...s.field, cursor: "text"}} /></div>
          <motion.button type="submit" whileHover={{ scale: 1.01, backgroundColor: "#00914C", color: "white" }} style={s.submitBtn}>AUTHORIZE UNIT <Activity size={14} /></motion.button>
        </form>
      </motion.div>

      <style jsx global>{`
        .custom-scroll-green::-webkit-scrollbar { width: 4px; }
        .custom-scroll-green::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll-green::-webkit-scrollbar-thumb { background: #00914C; border-radius: 10px; }
      `}</style>
    </div>
  );
}