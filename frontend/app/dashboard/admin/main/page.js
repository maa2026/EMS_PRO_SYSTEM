"use client";
import { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Globe, Clock, UserCheck, Activity, AlertTriangle, ShieldAlert } from "lucide-react";

export default function SuperAdminPortal() {
  const [activeFilter,     setActiveFilter]     = useState('Pending');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [onlineStats,      setOnlineStats]      = useState({ total: 0, loading: true });
  const [candidates,       setCandidates]       = useState([]);
  const [candLoading,      setCandLoading]       = useState(true);
  
  // Permission Requests State
  const [permRequests, setPermRequests] = useState([
    { id: 1, node: "AC-109 Unit", requester: "Unit Manager", zone: "Braj Zone", time: "2 mins ago" },
    { id: 2, node: "Mainpuri Zone", requester: "Zone Head", zone: "Braj Zone", time: "15 mins ago" }
  ]);

  // 📡 Live online count from Redis heartbeat
  const fetchOnline = useCallback(() => {
    fetch('/api/workers/online-status')
      .then(r => r.json())
      .then(d => { if (d.success) setOnlineStats({ total: d.total, loading: false }); })
      .catch(() => setOnlineStats(p => ({ ...p, loading: false })));
  }, []);

  // Fetch real pending/verified workers from DB
  const fetchCandidates = useCallback((status) => {
    setCandLoading(true);
    fetch(`/api/workers/list?stateStatus=${status}&limit=30`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setCandidates(d.data.map(w => ({
            id:          w._id,
            emsId:       w.emsId || 'Pending',
            name:        w.fullName || w.name,
            role:        w.role,
            district:    w.district,
            stateStatus: w.stateStatus,
          })));
        }
      })
      .catch(() => {})
      .finally(() => setCandLoading(false));
  }, []);

  useEffect(() => {
    fetchOnline();
    const id = setInterval(fetchOnline, 30_000);
    return () => clearInterval(id);
  }, [fetchOnline]);

  useEffect(() => { fetchCandidates(activeFilter); }, [activeFilter, fetchCandidates]);

  const handleApprove = async (candidateId, action) => {
    try {
      const res = await fetch(`/api/workers/${candidateId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) fetchCandidates(activeFilter);
    } catch (_) {}
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-10 font-sans selection:bg-red-600 relative overflow-hidden">
      
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-600/5 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="max-w-[1600px] mx-auto relative z-10">
        
        {/* --- SUPREME GLOBAL HEADER --- */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6 border-l-[15px] border-red-600 pl-10 py-6 bg-white/5 rounded-r-[4rem]">
          <div>
            <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-[0.8]">
              UP <span className="text-red-600">SUPREME</span> COMMAND
            </h1>
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-[1em] mt-4 italic underline decoration-red-600">SAMAJWADI CLOUD Intelligence 2026</p>
          </div>
          <div className="bg-red-600 px-8 py-4 rounded-3xl font-black italic uppercase tracking-widest shadow-[0_0_40px_rgba(220,38,38,0.3)] border border-white/20">
            SYSTEM ACTIVE
          </div>
        </div>

        {/* --- 🌍 GLOBAL ANALYTICS --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Total Voters (UP)", val: "15.2 Cr",                                             color: "text-white" },
            { label: "Online Now",        val: onlineStats.loading ? '...' : onlineStats.total.toLocaleString(), color: "text-red-600" },
            { label: "Worker Queue",      val: candLoading ? '...' : candidates.length,                color: "text-green-500" },
            { label: "Access Requests",   val: permRequests.length,                                   color: "text-yellow-500" }
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-[3rem] backdrop-blur-3xl">
              <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-2 italic">{stat.label}</p>
              <p className={`text-4xl font-black italic ${stat.color}`}>{stat.val}</p>
            </div>
          ))}
        </div>

        {/* --- 🛡️ PERMISSION GATEWAY SECTION --- */}
        {permRequests.length > 0 && (
          <div className="mb-16">
            <h2 className="text-xl font-black italic uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
              <ShieldAlert className="text-yellow-500" size={24} /> 
              Pending Access Requests
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {permRequests.map((req) => (
                <div key={req.id} className="bg-yellow-500/5 border border-yellow-500/20 p-6 rounded-[2.5rem] flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex gap-4 items-center">
                    <div className="p-3 bg-yellow-500/10 rounded-2xl"><Globe size={20} className="text-yellow-500" /></div>
                    <div>
                      <p className="text-sm font-black uppercase italic tracking-widest">{req.node}</p>
                      <p className="text-[9px] text-gray-500 uppercase font-bold tracking-tighter">{req.requester} • {req.time}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setPermRequests(permRequests.filter(r => r.id !== req.id))} className="px-4 py-2 bg-white/5 rounded-xl text-[9px] font-black uppercase italic hover:bg-red-600 transition-all">Deny</button>
                    <button onClick={() => setPermRequests(permRequests.filter(r => r.id !== req.id))} className="px-6 py-2 bg-yellow-600 text-black rounded-xl text-[9px] font-black uppercase italic hover:scale-105 transition-all shadow-lg shadow-yellow-600/20">Grant Access</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- MASTER CONTROLS --- */}
        <div className="flex flex-col lg:flex-row gap-6 mb-10 justify-between items-center">
          <div className="flex gap-4">
            <button onClick={() => setActiveFilter('Pending')} className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase italic tracking-widest transition-all ${activeFilter === 'Pending' ? 'bg-white text-black shadow-2xl scale-105' : 'bg-white/5 text-gray-500 border border-white/10'}`}>
              Pending Queue
            </button>
            <button onClick={() => setActiveFilter('Verified')} className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase italic tracking-widest transition-all ${activeFilter === 'Verified' ? 'bg-green-600 text-white shadow-2xl shadow-green-600/20 scale-105' : 'bg-white/5 text-gray-500 border border-white/10'}`}>
              Verified Nodes
            </button>
            <button onClick={() => setActiveFilter('Rejected')} className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase italic tracking-widest transition-all ${activeFilter === 'Rejected' ? 'bg-red-600 text-white shadow-2xl shadow-red-600/20 scale-105' : 'bg-white/5 text-gray-500 border border-white/10'}`}>
              Rejected
            </button>
          </div>
          
          <select className="bg-black border border-white/10 p-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] outline-none focus:border-red-600 cursor-pointer">
             <option>Filter by 75 Districts</option>
             <option>Mainpuri</option>
             <option>Lucknow</option>
          </select>
        </div>

        {/* --- FINAL APPROVAL TABLE --- */}
        <div className="bg-white/5 border border-white/10 rounded-[4rem] overflow-hidden backdrop-blur-3xl shadow-2xl">
          <div className="p-10 border-b border-white/10 flex justify-between items-center bg-white/5">
            <h2 className="text-2xl font-black italic uppercase tracking-widest text-red-600">
              {activeFilter === 'Verified' ? 'Node Activation Ready' : 'Supreme Bypass Control'}
            </h2>
          </div>
          <div className="overflow-x-auto px-6 pb-12">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-gray-600 uppercase tracking-[0.4em] border-b border-white/5 bg-black/40">
                  <th className="p-8">Unit Identity</th>
                  <th className="p-8">Hierarchy Path</th>
                  <th className="p-8">Audit Status</th>
                  <th className="p-8 text-right">Supreme Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {candLoading ? (
                  <tr><td colSpan={4} className="p-10 text-center text-gray-600 font-bold uppercase text-xs animate-pulse">Loading workers from database...</td></tr>
                ) : candidates.length === 0 ? (
                  <tr><td colSpan={4} className="p-10 text-center text-gray-600 font-bold uppercase text-xs">No workers in this queue</td></tr>
                ) : candidates.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-all group">
                    <td className="p-8">
                      <p className="font-black uppercase text-xl italic group-hover:text-red-600 transition-colors leading-none">{c.name}</p>
                      <p className="text-[10px] text-gray-600 font-mono tracking-widest mt-2 italic">{c.emsId} | {c.role}</p>
                    </td>
                    <td className="p-8 uppercase font-black text-xs text-gray-400 italic">
                      {c.district} ➔ STATE ➔ ADMIN
                    </td>
                    <td className="p-8">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase italic tracking-widest ${
                        c.stateStatus === 'Verified' ? 'bg-green-600/20 text-green-500 border border-green-600/30' :
                        c.stateStatus === 'Rejected' ? 'bg-red-600/20 text-red-600 border border-red-600/30' :
                        'bg-yellow-600/20 text-yellow-500 border border-yellow-600/30'
                      }`}>
                        {c.stateStatus}
                      </span>
                    </td>
                    <td className="p-8 text-right">
                      <div className="flex gap-2 justify-end">
                        {c.stateStatus !== 'Verified' && (
                          <button onClick={() => handleApprove(c.id, 'approve')}
                            className="bg-green-600 text-white hover:bg-green-700 px-6 py-3 rounded-2xl text-xs font-black uppercase italic tracking-widest transition-all hover:scale-105 active:scale-95">
                            Approve
                          </button>
                        )}
                        {c.stateStatus !== 'Rejected' && (
                          <button onClick={() => handleApprove(c.id, 'reject')}
                            className="bg-white/5 border border-white/10 text-gray-400 hover:bg-red-600 hover:text-white px-6 py-3 rounded-2xl text-xs font-black uppercase italic tracking-widest transition-all">
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-16 text-center text-gray-800 text-[10px] uppercase tracking-[1.5em] font-black italic">
          EMS GLOBAL COMMAND | BYPASS ENABLED | SYSTEM ACTIVATED
        </p>
      </div>
    </div>
  );
}