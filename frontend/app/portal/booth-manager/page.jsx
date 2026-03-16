"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  UserCheck, 
  Users, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Phone, 
  MoreVertical,
  Activity,
  Wifi,
  Loader
} from "lucide-react";
import { useHeartbeat } from '@/hooks/useHeartbeat';

export default function BoothManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [voterList,  setVoterList]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [stats,      setStats]      = useState({ total: 0, verified: 0, pannaPramukh: 0 });
  const themeColor = "#10B981";

  // Read identity from localStorage (written by login page)
  const [id, setId] = useState({ workerId: null, name: '', district: '', boothNo: '' });
  useEffect(() => {
    setId({
      workerId: localStorage.getItem('userId'),
      name:     localStorage.getItem('userName')     || '',
      district: localStorage.getItem('userDistrict') || '',
      boothNo:  localStorage.getItem('userBoothNo')  || '124',
    });
  }, []);

  // 💓 30-second heartbeat so admin map shows this worker online
  useHeartbeat({ workerId: id.workerId, role: 'BM', name: id.name, district: id.district });

  // Fetch voters for this booth from Elasticsearch → MongoDB fallback
  useEffect(() => {
    if (!id.boothNo) return;
    setLoading(true);
    fetch(`/api/voters?booth_id=${id.boothNo}&limit=60`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data?.length) {
          setVoterList(data.data);
          const verified = data.data.filter(v => v.status === 'Verified' || v.isEligible).length;
          setStats({ total: data.total || data.data.length, verified, pannaPramukh: 12 });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id.boothNo]);

  const filtered = voterList.filter(v => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      (v.voterName  || v.name  || '').toLowerCase().includes(q) ||
      (v.voter_id   || v.voterId || '').toLowerCase().includes(q)
    );
  });

  const s = {
    container: { backgroundColor: "#010804", minHeight: "100vh", color: "white", padding: "20px" },
    headerCard: { background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255,255,255,0.08)", padding: "25px", borderRadius: "25px", marginBottom: "20px" },
    voterCard: { background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255,255,255,0.05)", padding: "15px", borderRadius: "20px", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }
  };

  return (
    <div style={s.container}>
      {/* 🔝 BOOTH HEADER */}
      <div style={s.headerCard}>
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-black text-emerald-500 tracking-[0.3em] uppercase">Booth Management Unit</span>
            <h1 className="text-3xl font-black italic">BOOTH <span className="text-emerald-500">#{id.boothNo || '...'}</span></h1>
            <p className="text-[11px] text-gray-500 font-bold mt-1 uppercase flex items-center gap-2">
              <MapPin size={12} /> {id.district || 'Loading...'}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20">
              <UserCheck size={24} className="text-emerald-500" />
            </div>
            {/* Live badge */}
            <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              LIVE
            </div>
          </div>
        </div>

        {/* 📊 QUICK STATS */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="text-center">
            <h4 className="text-xl font-black">{loading ? '...' : stats.total.toLocaleString()}</h4>
            <p className="text-[9px] text-gray-500 font-bold uppercase">Total Voters</p>
          </div>
          <div className="text-center border-x border-white/10">
            <h4 className="text-xl font-black text-emerald-500">{loading ? '...' : stats.verified.toLocaleString()}</h4>
            <p className="text-[9px] text-gray-500 font-bold uppercase">Verified</p>
          </div>
          <div className="text-center">
            <h4 className="text-xl font-black text-orange-500">{stats.pannaPramukh}</h4>
            <p className="text-[9px] text-gray-500 font-bold uppercase">Panna Pramukh</p>
          </div>
        </div>
      </div>

      {/* 🔍 SEARCH & FILTER */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
        <input 
          type="text" 
          placeholder="Search Voter Name or EPIC No..." 
          className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl outline-none focus:border-emerald-500 transition-all text-sm font-bold"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 📜 VOTER LIST SECTION */}
      <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 ml-2">
        {loading ? 'Loading Voter Data...' : `Voter List (${filtered.length} shown)`}
      </h2>
      
      {loading && (
        <div className="flex items-center justify-center py-12 text-emerald-500">
          <Loader size={24} className="animate-spin mr-3" /> Syncing from cloud...
        </div>
      )}

      {!loading && filtered.map((voter, idx) => (
        <motion.div key={voter._id || idx} whileTap={{ scale: 0.98 }} style={s.voterCard}>
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-[10px] border ${
              voter.isEligible || voter.status === 'Verified'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
                : 'border-white/10 bg-white/5 text-gray-400'
            }`}>
              {voter.isEligible || voter.status === 'Verified' ? <CheckCircle2 size={16} /> : <Activity size={16} />}
            </div>
            <div>
              <h4 className="text-sm font-bold">{voter.voterName || voter.name || 'Unknown'}</h4>
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">
                {voter.voter_id || voter.voterId || '-'} | Age: {voter.age || '-'} | {voter.gender || ''}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {voter.mobile && (
              <a href={`tel:${voter.mobile}`} className="p-3 rounded-xl bg-white/5 border border-white/10 text-emerald-500">
                <Phone size={14} />
              </a>
            )}
            <button className="p-3 rounded-xl bg-white/5 border border-white/10">
              <MoreVertical size={14} />
            </button>
          </div>
        </motion.div>
      ))}

      {!loading && filtered.length === 0 && (
        <div className="text-center text-gray-600 py-12 text-sm font-bold uppercase">No voters found for this booth</div>
      )}

      {/* 🔘 ACTION BUTTON */}
      <div className="fixed bottom-8 left-0 right-0 px-8">
        <button
          onClick={() => { setLoading(true); fetch(`/api/voters?booth_id=${id.boothNo}&limit=60`).then(r=>r.json()).then(d=>{ if(d.success) setVoterList(d.data); }).finally(()=>setLoading(false)); }}
          className="w-full bg-emerald-500 p-5 rounded-[2rem] font-black uppercase italic tracking-[0.2em] shadow-xl shadow-emerald-500/20 active:scale-95 transition-all text-black flex items-center justify-center gap-3">
          <Users size={20} /> SYNC BOOTH DATA
        </button>
      </div>
    </div>
  );
}
