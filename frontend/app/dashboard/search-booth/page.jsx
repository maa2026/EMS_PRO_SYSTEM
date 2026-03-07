"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  Database, 
  Loader2, 
  AlertCircle,
  ChevronDown
} from "lucide-react";
import { upData } from './data';

export default function SearchBooth() {
  const [selectedDist, setSelectedDist] = useState("");
  const [selectedCon, setSelectedCon] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");
  const [boothData, setBoothData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [realZone, setRealZone] = useState("Select District");

  // Custom Dropdown States
  const [distOpen, setDistOpen] = useState(false);
  const [distSearch, setDistSearch] = useState("");
  const distRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (distRef.current && !distRef.current.contains(e.target)) setDistOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Filter districts for Smart Search
  const filteredDistricts = useMemo(() => {
    return Object.keys(upData).sort().filter(d => 
      d.toLowerCase().includes(distSearch.toLowerCase())
    );
  }, [distSearch]);

  const constituencies = useMemo(() => upData[selectedDist]?.seats || [], [selectedDist]);

  // API Fetch Logic
  useEffect(() => {
    const fetchBooths = async () => {
      if (!selectedDist) {
        setBoothData([]);
        setRealZone("Select District");
        setTotalRecords(0);
        return;
      }
      setLoading(true);
      try {
        const url = `http://localhost:5000/api/booths?district=${selectedDist}&constituency=${selectedCon}&search=${globalSearch}&page=${currentPage}`;
        const response = await fetch(url);
        const result = await response.json();
        setBoothData(result.data || []);
        setRealZone(result.zone || "N/A"); 
        setTotalRecords(result.total || 0);
      } catch (err) { console.error("Fetch Error:", err); }
      setLoading(false);
    };
    const timer = setTimeout(() => fetchBooths(), 500);
    return () => clearTimeout(timer);
  }, [selectedDist, selectedCon, globalSearch, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [selectedDist, selectedCon, globalSearch]);

  const s = {
    container: { backgroundColor: "#010804", minHeight: "100vh", padding: "clamp(20px, 5vw, 40px) 20px", color: "white", fontFamily: "'Inter', sans-serif", display: "flex", justifyContent: "center" },
    glassCard: { background: "rgba(255, 255, 255, 0.02)", backdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.05)", padding: "clamp(20px, 4vw, 40px)", borderRadius: "40px", width: "100%", maxWidth: "1200px", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" },
    input: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "14px", borderRadius: "12px", color: "#fff", width: "100%", fontSize: "14px", outline: "none" },
    label: { color: "#DA251D", fontSize: "11px", fontWeight: "800", marginBottom: "8px", display: "block", letterSpacing: "2px" },
    gridFields: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "40px" },
    tableRow: { display: "grid", gridTemplateColumns: "60px 100px 1fr", padding: "18px 15px", borderBottom: "1px solid rgba(255,255,255,0.05)", alignItems: "center", fontSize: "14px", textAlign: "left" },
    headerRow: { background: "rgba(218, 37, 29, 0.06)", color: "#DA251D", fontWeight: "900", fontSize: "12px", letterSpacing: "1px", borderRadius: "12px", marginBottom: "10px" },
    // ✅ SMART DROPDOWN STYLES
    dropdownList: {
      position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100,
      background: "#0c0c0c", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "12px", marginTop: "5px", maxHeight: "220px", overflowY: "auto",
      boxShadow: "0 10px 30px rgba(0,0,0,0.8)"
    },
    dropdownOption: { padding: "12px 15px", cursor: "pointer", fontSize: "14px", borderBottom: "1px solid rgba(255,255,255,0.03)" }
  };

  return (
    <div style={s.container}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={s.glassCard}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '50px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 2.5rem)", fontWeight: "900", margin: 0, letterSpacing: "-1px", display: "flex", alignItems: "baseline" }}>
              SEARCH<span style={{ color: "#DA251D" }}>BOOTH</span>
              <span style={{ display: "inline-block", width: "0.15em", height: "0.15em", backgroundColor: "#DA251D", borderRadius: "50%", margin: "0 0.1em", boxShadow: "0 0 15px #DA251D" }} />
            </h1>
            <p style={{ color: "#444", fontSize: "11px", letterSpacing: "4px", fontWeight: "bold", marginTop: "5px" }}>UTTAR PRADESH INFRASTRUCTURE</p>
          </div>
          <div style={{ textAlign: 'right', background: 'rgba(255,255,255,0.03)', padding: '15px 25px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={s.label}>TOTAL DB RECORDS</span>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#fff' }}>{totalRecords}</div>
          </div>
        </div>

        <div style={s.gridFields}>
          <div><label style={s.label}>STATE</label><input style={{...s.input, opacity: 0.5}} value="Uttar Pradesh" readOnly /></div>
          <div><label style={s.label}>REAL ZONE (DATABASE)</label><input style={{...s.input, color: "#DA251D", fontWeight: "700"}} value={realZone} readOnly /></div>

          {/* ✅ SMART DISTRICT SEARCH DROPDOWN */}
          <div style={{ position: "relative" }} ref={distRef}>
            <label style={s.label}>DISTRICT</label>
            <div 
              style={{ ...s.input, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
              onClick={() => setDistOpen(!distOpen)}
            >
              {selectedDist || "Select District"}
              <ChevronDown size={16} color={distOpen ? "#DA251D" : "#666"} />
            </div>
            
            <AnimatePresence>
              {distOpen && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={s.dropdownList}>
                  <div style={{ padding: "10px", position: "sticky", top: 0, background: "#0c0c0c", zIndex: 1 }}>
                    <input 
                      autoFocus
                      placeholder="Type to search..." 
                      style={{ ...s.input, padding: "8px 12px", fontSize: "12px", borderColor: "#DA251D" }}
                      value={distSearch}
                      onChange={(e) => setDistSearch(e.target.value)}
                    />
                  </div>
                  {filteredDistricts.map(dist => (
                    <div 
                      key={dist} 
                      style={{ ...s.dropdownOption, color: selectedDist === dist ? "#DA251D" : "#fff", background: selectedDist === dist ? "rgba(218,37,29,0.05)" : "transparent" }}
                      onClick={() => { setSelectedDist(dist); setSelectedCon(""); setDistOpen(false); setDistSearch(""); }}
                    >
                      {dist}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div>
            <label style={s.label}>CONSTITUENCY (AC)</label>
            <select style={s.input} value={selectedCon} onChange={(e) => setSelectedCon(e.target.value)} disabled={!selectedDist}>
              <option value="">All AC Numbers</option>
              {constituencies.map(seat => <option key={seat} value={seat} style={{background: "#0c0c0c"}}>{seat}</option>)}
            </select>
          </div>
        </div>

        {/* Booth List Area (No Changes Below) */}
        <div style={{ marginTop: '50px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '3px', height: '20px', background: '#DA251D' }}></div>
              <span style={{ fontWeight: '800', fontSize: '15px', letterSpacing: '1px' }}>EMS MASTER REPOSITORY</span>
            </div>
            <div style={{ position: 'relative', width: '100%', maxWidth: '350px' }}>
              <Search size={18} color="#DA251D" style={{ position: 'absolute', right: '15px', top: '13px' }} />
              <input style={{ ...s.input, paddingRight: '45px' }} placeholder="Search Booth Name or Part No..." value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)} />
            </div>
          </div>

          <div style={{ ...s.tableRow, ...s.headerRow }}>
            <div>NO.</div><div>PART NO</div><div>BOOTH NAME / LOCATION ADDRESS</div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px', color: '#DA251D' }}>
              <Loader2 className="animate-spin" style={{ margin: '0 auto' }} size={40} />
              <p style={{ marginTop: '10px', fontWeight: '800', fontSize: '12px' }}>FETCHING NEXT 50 RECORDS...</p>
            </div>
          ) : boothData.length > 0 ? boothData.map((booth, i) => (
            <motion.div key={booth._id || i} whileHover={{ background: "rgba(255,255,255,0.02)", x: 5 }} style={s.tableRow}>
              <div style={{ color: "#333", fontWeight: "bold" }}>{(currentPage - 1) * 50 + (i + 1)}</div>
              <div style={{ fontWeight: "800", color: "#DA251D" }}>{booth.partNo}</div>
              <div><div style={{ opacity: 0.9, fontWeight: "600" }}>{booth.partName}</div><div style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}>{booth.address}</div></div>
            </motion.div>
          )) : (
            <div style={{ textAlign: 'center', padding: '80px', color: '#444' }}>
               <AlertCircle style={{ margin: '0 auto 10px' }} size={30} />
               <p style={{ fontWeight: 'bold' }}>{selectedDist ? "No booths found" : "Please select a district"}</p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '30px 10px', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <span style={{ fontSize: '12px', color: '#444', fontWeight: 'bold' }}>PAGE {currentPage} • VIEWING {boothData.length} RECORDS</span>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} style={{ ...s.input, width: 'auto', padding: '12px 25px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.3 : 1 }}><ChevronLeft size={18} /></button>
              <button disabled={boothData.length < 50} onClick={() => setCurrentPage(prev => prev + 1)} style={{ ...s.input, width: 'auto', padding: '12px 25px', background: '#DA251D', border: 'none', cursor: boothData.length < 50 ? 'not-allowed' : 'pointer', fontWeight: '800', opacity: boothData.length < 50 ? 0.3 : 1 }}>NEXT 50 <ChevronRight size={18} /></button>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '60px', opacity: 0.2 }}>
           <Database size={18} color="#DA251D" />
           <p style={{ fontSize: '9px', letterSpacing: '4px', marginTop: '10px' }}>SECURE INFRASTRUCTURE NODE 2026 • ADMIN RAM LAKHAN</p>
        </div>
      </motion.div>
    </div>
  );
}