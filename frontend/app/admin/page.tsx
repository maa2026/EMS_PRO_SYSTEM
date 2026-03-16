// @ts-nocheck
"use client";

/**
 * ======================================================================
 * SYSTEM: EMS.UP STRATEGIC INTELLIGENCE (STABLE BUILD 45.0)
 * MODULE: DYNAMIC DRILL-DOWN HEATMAP (ZONE > DISTRICT > AC)
 * DESIGN: WORLD-CLASS CYBER SECURITY DARK THEME
 * AUTHOR: ADMIN RAM LAKHAN CYBER SECURITY
 * ======================================================================
 */

import { useEffect, useState, useMemo, useCallback, useRef, memo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, ChevronLeft, ChevronRight, ShieldCheck, ChevronDown, 
  Users, BarChart3, ShieldAlert, Globe, Target, Clock, Database, 
  Wifi, Lock, FileText, FileSpreadsheet, Activity, DatabaseBackup,
  Fingerprint, Zap, Server, Cpu, HardDrive, Map as MapIcon, 
  Signal, LayoutGrid, Layers, Hexagon
} from "lucide-react";
import { 
  BarChart, Bar, ResponsiveContainer, Cell, XAxis, YAxis, LabelList 
} from 'recharts';

// --- INDUSTRIAL GLOBAL TARGETS ---
const MASTER_TARGETS = {
  PRESIDENT: 148699,
  MANAGER: 177516,
  SATHI: 3550320,
  VOTER_GOAL: 250000000
};

// ======================================================================
// --- PREMIUM MODULE: DYNAMIC INTELLIGENCE HEATMAP ---
// ======================================================================
const StrategicHeatmap = memo(({ personnelData, filters, hierarchy }: { personnelData: any[], filters: any, hierarchy: any }) => {
  // Logic: Decide what to show (Districts or Constituencies)
  const displayItems = useMemo(() => {
    if (filters.district && hierarchy?.districts?.[filters.district]) {
      // Level 2: Show Constituencies of selected district
      return hierarchy.districts[filters.district].map(ac => ({ name: ac.name, type: 'AC' }));
    }
    if (filters.zone && hierarchy?.zones?.[filters.zone]) {
      // Level 1: Show Districts of selected zone
      return hierarchy.zones[filters.zone].map(d => ({ name: d, type: 'DISTRICT' }));
    }
    // Default: Show all major districts (Global View)
    return Object.keys(hierarchy?.districts || {}).slice(0, 12).map(d => ({ name: d, type: 'DISTRICT' }));
  }, [filters.zone, filters.district, hierarchy]);

  const metrics = useMemo(() => {
    const map = {};
    displayItems.forEach(item => {
      const dData = personnelData.filter(p => 
        item.type === 'AC' ? p.constituency === item.name : p.district === item.name
      );
      map[item.name] = {
        hiredP: dData.filter(p => p.role === "Booth President").length,
        hiredM: dData.filter(p => p.role === "Booth Manager").length,
        hiredS: dData.filter(p => p.role === "Jan Sampark Sathi").length,
        // Approximate target logic for UI visual balance
        target: item.type === 'AC' ? 450 : 3500 
      };
    });
    return map;
  }, [personnelData, displayItems]);

  return (
    <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "24px", padding: "25px" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Layers size={22} color="#DA251D" />
          <div>
            <span style={{ fontSize: '13px', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase' }}>
              {filters.district ? `${filters.district} UNIT INTELLIGENCE` : filters.zone ? `${filters.zone} ZONE INTELLIGENCE` : 'GLOBAL DEPLOYMENT HEATMAP'}
            </span>
            <div style={{ fontSize: '9px', color: '#444', fontWeight: '900', marginTop: '2px' }}>REAL-TIME BACKEND SYNC ACTIVE</div>
          </div>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '15px' }}>
        {displayItems.map((item) => {
          const s = metrics[item.name];
          const total = s.hiredP + s.hiredM + s.hiredS;
          const completion = (total / (s.target * 1.5)) * 100;
          let alpha = 0.04;
          if (total > 0) alpha = 0.15;
          if (completion > 2) alpha = 0.45;

          return (
            <motion.div key={item.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: `rgba(218,37,29, ${alpha})`, border: total > 0 ? '1px solid rgba(218,37,29, 0.6)' : '1px solid #151515', padding: '18px', borderRadius: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: '900', color: total > 0 ? '#fff' : '#444', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                <Hexagon size={12} color={total > 0 ? '#DA251D' : '#222'} fill={total > 0 ? '#DA251D' : 'transparent'} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '7px', color: '#555', fontWeight: '900' }}>PRES</div>
                  <div style={{ fontSize: '12px', fontWeight: '900', color: s.hiredP > 0 ? '#fff' : '#333' }}>{s.hiredP}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '7px', color: '#555', fontWeight: '900' }}>MGR</div>
                  <div style={{ fontSize: '12px', fontWeight: '900', color: s.hiredM > 0 ? '#fff' : '#333' }}>{s.hiredM}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '7px', color: '#555', fontWeight: '900' }}>SATHI</div>
                  <div style={{ fontSize: '12px', fontWeight: '900', color: s.hiredS > 0 ? '#DA251D' : '#333' }}>{s.hiredS}</div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
});
StrategicHeatmap.displayName = "StrategicHeatmap";

const TacticalDropdown = memo(({ label, value, options, onSelect, disabled = false }: { label: string, value: string, options: string[], onSelect: (v: string) => void, disabled?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  useEffect(() => {
    const close = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false); };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, []);
  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <label style={{ color: "#DA251D", fontSize: "9px", fontWeight: "900", marginBottom: "4px", display: "block", textTransform: 'uppercase' }}>{label}</label>
      <div onClick={() => !disabled && setIsOpen(!isOpen)} 
        style={{ background: "#0a0a0a", border: "1px solid rgba(218,37,29,0.2)", padding: "12px", borderRadius: "8px", color: "#fff", fontSize: "12px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: 'center', opacity: disabled ? 0.3 : 1 }}>
        <span style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{value || `SELECT ${label}`}</span>
        <ChevronDown size={14} color="#DA251D" />
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} 
            style={{ position: "absolute", top: "105%", left: 0, width: "100%", background: "#050505", border: "1px solid #333", borderRadius: "10px", zIndex: 100000, maxHeight: "200px", overflowY: "auto", boxShadow: '0 20px 50px #000' }}>
            {options?.map((opt) => (
              <div key={opt} onClick={() => { onSelect(opt); setIsOpen(false); }} style={{ padding: "12px", color: "#fff", fontSize: "12px", borderBottom: "1px solid #111", cursor: "pointer" }}>{opt}</div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
TacticalDropdown.displayName = "TacticalDropdown";

export default function AdminDashboard() {
  const [personnel, setPersonnel] = useState([]); 
  const [voterTotal, setVoterTotal] = useState(0); 
  const [hierarchy, setHierarchy] = useState({ zones: {}, districts: {} });
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalCount: 0 });
  const [filters, setFilters] = useState({ search: "", zone: "", district: "", constituency: "", role: "" });
  const [isClient, setIsClient] = useState(false);
  const [telemetry, setTelemetry] = useState({ time: "", load: "0.01ms", ram: "1.1GB" });
  const router = useRouter();

  const industrialFormat = useCallback((val) => isClient ? Number(val).toLocaleString('en-IN') : "0", [isClient]);

  useEffect(() => {
    setIsClient(true);
    const pulse = setInterval(() => {
      setTelemetry({
        time: new Date().toLocaleTimeString(),
        load: `${(Math.random() * 0.01 + 0.008).toFixed(4)}ms`,
        ram: `${(Math.random() * 0.2 + 1.2).toFixed(2)}GB`
      });
    }, 1000);
    return () => clearInterval(pulse);
  }, []);

  const executeSync = useCallback(async () => {
    try {
      const q = new URLSearchParams({ page: meta.page.toString(), limit: "20", ...filters });
      const res = await fetch(`http://127.0.0.1:5000/api/workers/list?${q.toString()}`);
      const payload = await res.json();
      if (payload?.workers) {
        setPersonnel(payload.workers); 
        setMeta(p => ({ ...p, totalPages: payload.totalPages || 1, totalCount: payload.totalCount || 0 }));
        setVoterTotal(payload.voterCollectionTotal || 0);
      }
    } catch (e) { console.error("LINK FAIL"); }
  }, [meta.page, filters]);

  useEffect(() => {
    if (isClient) {
      fetch('/hierarchy.json?v=' + Date.now()).then(r => r.json()).then(d => setHierarchy(d));
      if (!localStorage.getItem('adminToken')) router.push('/login');
      else executeSync();
    }
  }, [isClient, executeSync, router]);

  const missionAnalytics = useMemo(() => {
    const hiredP = personnel.filter(p => p.role === "Booth President").length;
    const hiredM = personnel.filter(p => p.role === "Booth Manager").length;
    const hiredS = personnel.filter(p => p.role === "Jan Sampark Sathi").length;
    const totalRequirement = MASTER_TARGETS.PRESIDENT + MASTER_TARGETS.MANAGER + MASTER_TARGETS.SATHI;
    return {
      presidents: { hired: hiredP, target: MASTER_TARGETS.PRESIDENT },
      managers: { hired: hiredM, target: MASTER_TARGETS.MANAGER },
      sathis: { hired: hiredS, target: MASTER_TARGETS.SATHI },
      voters: { current: voterTotal, target: MASTER_TARGETS.VOTER_GOAL },
      forceGap: totalRequirement - (hiredP + hiredM + hiredS)
    };
  }, [personnel, voterTotal]);

  if (!isClient) return null;

  return (
    <div style={{ backgroundColor: "#010804", minHeight: "100vh", color: "#f0f0f0", fontSize: 'clamp(12px, 1vw, 14px)', letterSpacing: '-0.4px', overflowX: 'hidden' }}>
      <style jsx global>{`
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: #DA251D; border-radius: 10px; }
        .glassHeader { background: rgba(0, 0, 0, 0.96); backdrop-filter: blur(25px); border-bottom: 1px solid rgba(218,37,29,0.3); }
        .commandCard { background: rgba(0,0,0,0.98); border: 1px solid rgba(255,255,255,0.05); padding: clamp(20px, 4vw, 45px); border-radius: 35px; box-shadow: 0 40px 150px #000; }
        .dataTile { background: linear-gradient(165deg, rgba(255,255,255,0.03), rgba(0,0,0,0)); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; transition: 0.5s; }
        @media (max-width: 768px) { .mobile-hide { display: none !important; } .grid-stack { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* --- HUD HEADER: ADMIN RAM LAKHAN CYBER SECURITY --- */}
      <nav className="glassHeader" style={{ position: "fixed", top: 0, width: "100%", padding: "12px clamp(20px, 5vw, 50px)", display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10000 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <ShieldCheck color="#DA251D" size={32} />
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "900", margin: 0, letterSpacing: '4px' }}>EMS.<span style={{color: '#DA251D'}}>UP</span></h2>
            <span style={{ fontSize: '9px', color: '#555', fontWeight: '900', letterSpacing: '1px' }}>FEDERAL STRATEGIC HUB</span>
          </div>
        </div>
        <div className="mobile-hide" style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '10px', color: '#DA251D', fontWeight: '900' }}>CYBER SECURITY COMMAND</div>
          <div style={{ fontSize: '14px', fontWeight: '900', color: '#fff' }}>ADMIN RAM LAKHAN</div>
        </div>
        <Fingerprint className="mobile-hide" size={32} color="#222" />
      </nav>

      <div style={{ padding: "110px 15px 120px", maxWidth: "1700px", margin: "0 auto" }}>
        
        {/* --- VOTER DATA VISION MONITOR --- */}
        <section style={{ background: "rgba(218,37,29,0.05)", border: "1px solid rgba(218,37,29,0.15)", borderRadius: "25px", padding: "25px 40px", marginBottom: "40px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <DatabaseBackup size={24} color="#DA251D" />
                <span style={{ fontSize: "14px", fontWeight: "900", color: "#DA251D", letterSpacing: '2px', textTransform: 'uppercase' }}>VOTER DATA PROFILE MONITOR</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '28px', fontWeight: '900' }}>{industrialFormat(missionAnalytics.voters.current)} <span style={{fontSize: '14px', color: '#DA251D'}}>PROFILED</span></div>
                <span style={{ fontSize: '10px', color: '#444', fontWeight: '900' }}>UP SUPREME TARGET: 25,00,00,000</span>
              </div>
            </div>
            <div style={{ height: "10px", background: "#000", borderRadius: "20px", border: '1px solid #111', overflow: 'hidden' }}>
              <motion.div animate={{ width: `${(missionAnalytics.voters.current / missionAnalytics.voters.target) * 100}%` }} style={{ height: "100%", background: "linear-gradient(90deg, #DA251D, #ff4d4d)" }} />
            </div>
        </section>

        {/* --- DYNAMIC DRILL-DOWN HEATMAP --- */}
        <section style={{ marginBottom: '40px' }}>
          <StrategicHeatmap personnelData={personnel} filters={filters} hierarchy={hierarchy} />
        </section>

        {/* --- REQUIREMENT BENCHMARKS --- */}
        <div className="grid-stack" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '45px' }}>
            <div className="dataTile">
              <span style={{ fontSize: '11px', fontWeight: '900', color: '#444' }}>BOOTH PRESIDENTS</span>
              <div style={{ fontSize: '42px', fontWeight: '900' }}>{industrialFormat(missionAnalytics.presidents.hired)}</div>
              <div style={{ marginTop: '10px', fontSize: '11px', color: '#DA251D', fontWeight: '900' }}>REQ: {industrialFormat(missionAnalytics.presidents.target)}</div>
            </div>
            <div className="dataTile">
              <span style={{ fontSize: '11px', fontWeight: '900', color: '#444' }}>BOOTH MANAGERS</span>
              <div style={{ fontSize: '42px', fontWeight: '900' }}>{industrialFormat(missionAnalytics.managers.hired)}</div>
              <div style={{ marginTop: '10px', fontSize: '11px', color: '#DA251D', fontWeight: '900' }}>REQ: {industrialFormat(missionAnalytics.managers.target)}</div>
            </div>
            <div className="dataTile" style={{ background: 'rgba(218,37,29,0.03)' }}>
              <span style={{ fontSize: '11px', fontWeight: '900', color: '#DA251D' }}>JAN SAMPARK SATHI</span>
              <div style={{ fontSize: '48px', fontWeight: '900' }}>{industrialFormat(missionAnalytics.sathis.hired)}</div>
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#666', fontWeight: '900' }}>GOAL: {industrialFormat(missionAnalytics.sathis.target)}</div>
            </div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="commandCard">
          <div className="grid-stack" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px", marginBottom: "40px" }}>
            <input style={{ background: "#000", border: "1px solid #1a1a1a", padding: "12px", borderRadius: "8px", color: "#fff", width: '100%' }} placeholder="Node Identity..." onChange={(e) => setFilters(p => ({...p, search: e.target.value}))} />
            <TacticalDropdown label="ZONE" value={filters.zone} options={Object.keys(hierarchy?.zones || {})} onSelect={(v) => setFilters(p => ({...p, zone: v, district: "", constituency: ""}))} />
            <TacticalDropdown label="DISTRICT" value={filters.district} options={hierarchy?.zones?.[filters.zone] || []} onSelect={(v) => setFilters(p => ({...p, district: v, constituency: ""}))} disabled={!filters.zone} />
            <TacticalDropdown label="AC UNIT" value={filters.constituency} options={hierarchy?.districts?.[filters.district]?.map(ac => ac.name) || []} onSelect={(v) => setFilters(p => ({...p, constituency: v}))} disabled={!filters.district} />
            <TacticalDropdown label="FORCE ROLE" value={filters.role} options={["Booth President", "Booth Manager", "Jan Sampark Sathi"]} onSelect={(v) => setFilters(p => ({...p, role: v}))} />
          </div>

          <div style={{ overflowX: "auto", borderRadius: "16px", border: '1px solid #111' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '950px' }}>
              <thead>
                <tr style={{ textAlign: 'left', background: 'rgba(218, 37, 29, 0.05)', color: '#DA251D', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}>
                  <th style={{ padding: '20px' }}>NODE_ID</th><th style={{ padding: '20px' }}>PERSONNEL</th><th style={{ padding: '20px' }}>GEOGRAPHY AREA</th><th style={{ padding: '20px' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {personnel.map((p) => (
                  <tr key={p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '15px 20px', color: '#222', fontWeight: '900' }}>#{p._id?.slice(-5).toUpperCase()}</td>
                    <td style={{ padding: '15px 20px' }}>
                      <div style={{ fontWeight: "900", color: "#fff", fontSize: "14px" }}>{p.fullName}</div>
                      <div style={{ fontSize: "10px", color: "#444" }}>{p.mobile} • {p.role}</div>
                    </td>
                    <td style={{ padding: '15px 20px' }}>{p.district} • <span style={{color: '#444'}}>{p.constituency}</span></td>
                    <td style={{ padding: '15px 20px' }}><div style={{ color: '#00FF00', fontSize: '10px', fontWeight: '900' }}>✓ ACTIVE</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* FOOTER */}
      <footer style={{ position: 'fixed', bottom: 0, width: '100%', background: '#000', borderTop: '2px solid #151515', height: '65px', display: 'flex', alignItems: 'center', zIndex: 10000, padding: '0 30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Database size={16} color="#DA251D" /><span style={{ fontSize: '10px', fontWeight: '900' }}>{industrialFormat(meta.totalCount)} NODES</span></div>
          <div className="mobile-hide" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Wifi size={16} color="#22C55E" /><span style={{ fontSize: '10px', color: '#22C55E' }}>SECURE</span></div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(218,37,29,0.1)', padding: '6px 15px', borderRadius: '30px', border: '1px solid rgba(218,37,29,0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <Clock size={16} color="#DA251D" /><span style={{ fontSize: '14px', fontWeight: '900' }}>{telemetry.time}</span>
          </div>
          <div style={{ display: 'flex', background: '#0a0a0a', borderRadius: '8px', border: '1px solid #222' }}>
            <button onClick={() => setMeta(p => ({...p, page: Math.max(1, p.page-1)}))} style={{ padding: '6px 12px', background: 'none', border: 'none', color: '#fff' }}><ChevronLeft size={18}/></button>
            <button onClick={() => setMeta(p => ({...p, page: Math.min(meta.totalPages, p.page+1)}))} style={{ padding: '6px 12px', background: 'none', border: 'none', color: '#fff' }}><ChevronRight size={18}/></button>
          </div>
        </div>
      </footer>
    </div>
  );
}