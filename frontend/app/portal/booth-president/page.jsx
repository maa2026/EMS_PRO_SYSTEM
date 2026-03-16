"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Users, 
  UserPlus, 
  TrendingUp, 
  LayoutDashboard, 
  PieChart, 
  MessageCircle, 
  Zap,
  ChevronRight,
  Loader
} from "lucide-react";
import { useHeartbeat } from '@/hooks/useHeartbeat';

export default function BoothPresident() {
  const themeColor = "#F59E0B";

  const [id, setId] = useState({ workerId: null, name: '', district: '', boothNo: '' });
  const [workers,    setWorkers]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [stats,      setStats]      = useState({ pannaPramukh: 0, reach: 0, newJoinees: 0 });

  useEffect(() => {
    setId({
      workerId: localStorage.getItem('userId'),
      name:     localStorage.getItem('userName')     || '',
      district: localStorage.getItem('userDistrict') || '',
      boothNo:  localStorage.getItem('userBoothNo')  || '124',
    });
  }, []);

  // 💓 Heartbeat — keeps this worker live on admin map
  useHeartbeat({ workerId: id.workerId, role: 'BP', name: id.name, district: id.district });

  // Fetch JSS workers under this booth
  const fetchWorkers = useCallback(() => {
    const boothNo = id.boothNo || '124';
    setLoading(true);
    fetch(`/api/workers/list?boothNo=${boothNo}&limit=30`)
      .then(r => r.json())
      .then(data => {
        // Backend returns { workers, totalPages, currentPage, totalCount }
        const list = data.workers || data.data || [];
        setWorkers(list);
        setStats({
          pannaPramukh: list.length,
          reach: 68,
          newJoinees: data.totalCount || data.total || 0,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id.boothNo]);

  useEffect(() => { if (id.boothNo) fetchWorkers(); }, [id.boothNo, fetchWorkers]);

  const pannaPramukhs = workers.length
    ? workers.map((w, i) => ({
        name:     w.fullName || w.name || `Worker ${i+1}`,
        panna:    `Page ${String(i+1).padStart(2,'0')}`,
        voters:   30,
        coverage: `${Math.floor(Math.random() * 40 + 50)}%`,
      }))
    : [
        { name: "Suresh Yadav", panna: "Page 01", voters: 30, coverage: "90%" },
        { name: "Mahesh Pal",   panna: "Page 02", voters: 28, coverage: "45%" },
        { name: "Rajesh Jatav", panna: "Page 03", voters: 32, coverage: "70%" },
      ];

  const s = {
    container: { backgroundColor: "#010804", minHeight: "100vh", color: "white", padding: "20px", paddingBottom: "100px" },
    header: { background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255,255,255,0.08)", padding: "25px", borderRadius: "30px", marginBottom: "20px" },
    statBox: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", padding: "15px", borderRadius: "20px", textAlign: "center" },
    listCard: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", padding: "15px", borderRadius: "20px", marginBottom: "10px", display: "flex", alignItems: "center", justifyContent: "space-between" }
  };

  return (
    <div style={s.container}>
      {/* 🔝 PRESIDENT HEADER */}
      <div style={s.header}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="text-[9px] font-black text-amber-500 tracking-[0.4em] uppercase">Booth President Node</span>
            <h1 className="text-3xl font-black italic tracking-tighter">UNIT <span className="text-amber-500">PRESIDENT</span></h1>
            <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase">Booth #124 | Mainpuri Rural</p>
          </div>
          <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
            <ShieldCheck size={28} className="text-amber-500" />
          </div>
        </div>

        {/* 📊 CORE METRICS */}
        <div className="grid grid-cols-3 gap-3">
          <div style={s.statBox}>
            <Users size={16} className="text-amber-500 mx-auto mb-2" />
            <h4 className="text-lg font-black">{loading ? '...' : stats.pannaPramukh}</h4>
            <p className="text-[8px] text-gray-500 font-black uppercase">Panna Pramukh</p>
          </div>
          <div style={s.statBox}>
            <PieChart size={16} className="text-emerald-500 mx-auto mb-2" />
            <h4 className="text-lg font-black">{stats.reach}%</h4>
            <p className="text-[8px] text-gray-500 font-black uppercase">Voter Reach</p>
          </div>
          <div style={s.statBox}>
            <TrendingUp size={16} className="text-blue-500 mx-auto mb-2" />
            <h4 className="text-lg font-black">{loading ? '...' : stats.newJoinees}</h4>
            <p className="text-[8px] text-gray-500 font-black uppercase">New Joinees</p>
          </div>
        </div>
      </div>

      {/* 📋 PANNA PRAMUKH TRACKER */}
      <div className="flex justify-between items-center mb-4 px-2">
        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Panna Pramukh Status</h2>
        <button className="text-[10px] font-black text-amber-500 uppercase flex items-center gap-1">
          <UserPlus size={12} /> ADD NEW
        </button>
      </div>

      <div className="space-y-3">
        {pannaPramukhs.map((pp, i) => (
          <motion.div key={i} whileTap={{ scale: 0.98 }} style={s.listCard}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-500 font-black text-[10px]">
                {pp.panna.split(' ')[1]}
              </div>
              <div>
                <h4 className="text-sm font-bold tracking-tight">{pp.name}</h4>
                <div className="flex gap-3 items-center mt-1">
                  <p className="text-[8px] text-gray-500 font-bold uppercase">{pp.voters} Voters</p>
                  <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: pp.coverage }}></div>
                  </div>
                  <p className="text-[8px] text-amber-500 font-black">{pp.coverage}</p>
                </div>
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-700" />
          </motion.div>
        ))}
      </div>

      {/* 🛠️ QUICK COMMANDS */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        <button className="bg-white/5 border border-white/10 p-5 rounded-3xl flex flex-col items-center gap-2">
          <MessageCircle size={20} className="text-blue-500" />
          <span className="text-[9px] font-black uppercase">Broadcast</span>
        </button>
        <button className="bg-white/5 border border-white/10 p-5 rounded-3xl flex flex-col items-center gap-2">
          <LayoutDashboard size={20} className="text-emerald-500" />
          <span className="text-[9px] font-black uppercase">Analytics</span>
        </button>
      </div>

      {/* 🔘 EMERGENCY SYNC */}
      <div className="fixed bottom-8 left-0 right-0 px-8">
        <button className="w-full bg-amber-500 p-5 rounded-[2rem] font-black uppercase italic tracking-[0.2em] shadow-xl shadow-amber-500/20 active:scale-95 transition-all text-black flex items-center justify-center gap-3">
          <Zap size={20} fill="currentColor" /> UPLOAD BOOTH REPORT
        </button>
      </div>
    </div>
  );
}