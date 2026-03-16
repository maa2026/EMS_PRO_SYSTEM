"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from "framer-motion";
import { 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  Database, 
  Loader2, 
  AlertCircle
} from "lucide-react";
import { upData } from './data';
import SearchableDropdown from '../../../components/SearchableDropdown';

export default function SearchBooth() {
  const { t } = useTranslation();
  const [selectedDist, setSelectedDist] = useState("");
  const [selectedCon, setSelectedCon] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");
  const [boothData, setBoothData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [realZone, setRealZone] = useState(t('district'));

  const districts = useMemo(() => Object.keys(upData).sort(), []);
  const constituencies = useMemo(() => upData[selectedDist]?.seats || [], [selectedDist]);

  // ✅ UPDATED API Fetch Logic with Field Mapping
  useEffect(() => {
    const fetchBooths = async () => {
      if (!selectedDist) {
        setBoothData([]);
        setRealZone(t('real_zone'));
        setTotalRecords(0);
        return;
      }
      setLoading(true);
      setRealZone(t('real_zone'));
      try {
        const url = `/api/booths?district=${selectedDist}&constituency=${selectedCon}&search=${globalSearch}&page=${currentPage}`;
        const response = await fetch(url);
        const result = await response.json();
        
        setBoothData(result.data || []);
        setTotalRecords(result.total || 0);

        // 🚩 ZONE DATA BINDING FIX (Handling zoneName from Backend)
        if (result.zone) {
          setRealZone(result.zone);
        } else if (result.data && result.data.length > 0) {
          // Model field 'zoneName' check
          setRealZone(result.data[0].zoneName || result.data[0].zone || "N/A");
        } else {
          setRealZone("Zone Not Mapped");
        }

      } catch (err) { 
        console.error("Fetch Error:", err); 
        setRealZone("Fetch Failed");
      }
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
    // ✅ Responsive Grid Columns for Table
    tableRow: {
      display: "grid",
      gridTemplateColumns: "minmax(40px, 1fr) minmax(80px, 1.2fr) minmax(120px, 1.6fr) minmax(180px, 2.2fr)",
      padding: "18px 15px",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      alignItems: "center",
      fontSize: "13px",
      textAlign: "left",
      wordBreak: "break-word",
      minWidth: 0,
    },
    headerRow: {
      background: "rgba(218, 37, 29, 0.06)",
      color: "#DA251D",
      fontWeight: "900",
      fontSize: "12px",
      letterSpacing: "1px",
      borderRadius: "12px",
      marginBottom: "10px",
      minWidth: 0,
    },
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
              {t('search_booth').toUpperCase()}
              <span style={{ display: "inline-block", width: "0.15em", height: "0.15em", backgroundColor: "#DA251D", borderRadius: "50%", margin: "0 0.1em", boxShadow: "0 0 15px #DA251D" }} />
            </h1>
            <p style={{ color: "#444", fontSize: "11px", letterSpacing: "4px", fontWeight: "bold", marginTop: "5px" }}>UTTAR PRADESH INFRASTRUCTURE</p>
          </div>
          <div style={{ textAlign: 'right', background: 'rgba(255,255,255,0.03)', padding: '15px 25px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={s.label}>{t('total_db_records')}</span>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#fff' }}>{totalRecords}</div>
          </div>
        </div>

        <div style={s.gridFields}>
          <div><label style={s.label}>{t('state')}</label><input style={{...s.input, opacity: 0.5}} value="Uttar Pradesh" readOnly /></div>
          {/* ✅ DATA BINDING SYNCED */}
          <div><label style={s.label}>{t('real_zone')}</label><input style={{...s.input, color: "#DA251D", fontWeight: "700"}} value={realZone} readOnly /></div>

          <SearchableDropdown
            label={t('district')}
            options={districts}
            value={selectedDist}
            onChange={(val) => {
              setSelectedDist(val);
              setSelectedCon("");
            }}
            placeholder={t('district')}
            searchPlaceholder={t('district')}
            required
          />

          <div>
            <SearchableDropdown
              label={t('constituency')}
              options={["All AC Numbers", ...constituencies]}
              value={selectedCon}
              onChange={(val) => setSelectedCon(val)}
              placeholder={t('constituency')}
              searchPlaceholder={t('constituency')}
              disabled={!selectedDist}
            />
          </div>
        </div>

        <div style={{ marginTop: '50px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '3px', height: '20px', background: '#DA251D' }}></div>
              <span style={{ fontWeight: '800', fontSize: '15px', letterSpacing: '1px' }}>EMS MASTER REPOSITORY</span>
            </div>
            <div style={{ position: 'relative', width: '100%', maxWidth: '350px' }}>
              <Search size={18} color="#DA251D" style={{ position: 'absolute', right: '15px', top: '13px' }} />
              <input style={{ ...s.input, paddingRight: '45px' }} placeholder={t('search_booth')} value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)} />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: 0, width: '100%' }}>
              <div style={{ ...s.tableRow, ...s.headerRow }}>
                <div>NO.</div><div>PART NO</div><div>AC NAME</div><div>BOOTH NAME / LOCATION ADDRESS</div>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '100px', color: '#DA251D' }}>
                  <Loader2 className="animate-spin" style={{ margin: '0 auto' }} size={40} />
                  <p style={{ marginTop: '10px', fontWeight: '800', fontSize: '12px' }}>SYNCING DATABASE NODE...</p>
                </div>
              ) : boothData.length > 0 ? (
                boothData.map((booth, i) => (
                  <motion.div key={booth._id || i} whileHover={{ background: "rgba(255,255,255,0.02)", x: 5 }} style={s.tableRow}>
                    <div style={{ color: "#333", fontWeight: "bold" }}>{(currentPage - 1) * 50 + (i + 1)}</div>
                    <div style={{ fontWeight: "800", color: "#DA251D" }}>{booth.partNo}</div>
                    <div style={{ color: "#25d366", fontSize: "11px", fontWeight: "bold" }}>{booth.acName}</div>
                    <div>
                      <div style={{ opacity: 0.9, fontWeight: "600", wordBreak: 'break-word' }}>{booth.partName}</div>
                      <div style={{ fontSize: "11px", color: "#666", marginTop: "4px", wordBreak: 'break-word' }}>{booth.address}</div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '80px', color: '#444' }}>
                  <AlertCircle style={{ margin: '0 auto 10px' }} size={30} />
                  <p style={{ fontWeight: 'bold' }}>{selectedDist ? "No booths found" : "Please select a district"}</p>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '30px 10px', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <span style={{ fontSize: '12px', color: '#444', fontWeight: 'bold' }}>PAGE {currentPage} • VIEWING {boothData.length} RECORDS</span>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} style={{ ...s.input, width: 'auto', padding: '12px 25px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.3 : 1 }}><ChevronLeft size={18} /></button>
              <button disabled={boothData.length < 50} onClick={() => setCurrentPage(prev => prev + 1)} style={{ ...s.input, width: 'auto', padding: '12px 25px', background: '#DA251D', border: 'none', cursor: boothData.length < 50 ? 'not-allowed' : 'pointer', fontWeight: '800', opacity: boothData.length < 50 ? 0.3 : 1 }}>{t('next_50')} <ChevronRight size={18} /></button>
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