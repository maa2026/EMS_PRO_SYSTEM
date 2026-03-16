"use client";

/**
 * ======================================================================
 * SYSTEM: EMS.UP JAN SAMPARK SATHI
 * MODULE: STRATEGIC COMMAND DASHBOARD
 * BRANDING: ADMIN RAM LAKHAN CYBER SECURITY Standard
 * ======================================================================
 */

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from "framer-motion";
import { Users, MessageSquare, Heart, Target, TrendingUp, MapPin, Search, Filter, Zap, Wifi } from "lucide-react";
import { useHeartbeat } from '@/hooks/useHeartbeat';

// GPS map — client only (Leaflet needs window)
const BoothMap = dynamic(() => import('@/components/BoothMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-gray-700 text-[10px] font-black uppercase tracking-widest">
      Loading Map…
    </div>
  ),
});

const StatCard = ({ icon: Icon, label, value, color }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white/5 border border-white/10 p-5 rounded-[2rem] backdrop-blur-xl"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl bg-${color}-500/10 border border-${color}-500/20`}>
        <Icon size={20} className={`text-${color}-500`} />
      </div>
      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Live</span>
    </div>
    <h3 className="text-2xl font-black text-white">{value}</h3>
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">{label}</p>
  </motion.div>
);

export default function JanSamparkDashboard() {
  const [id,     setId]     = useState({ workerId: null, name: '', district: '', boothNo: '' });
  const [online, setOnline] = useState(null);

  useEffect(() => {
    setId({
      workerId: localStorage.getItem('userId'),
      name:     localStorage.getItem('userName')     || '',
      district: localStorage.getItem('userDistrict') || '',
      boothNo:  localStorage.getItem('userBoothNo')  || '124',
    });
    fetch('/api/workers/online-status')
      .then(r => r.json())
      .then(d => { if (d.success) setOnline(d.total); })
      .catch(() => {});
  }, []);

  // 💓 30-second heartbeat
  useHeartbeat({ workerId: id.workerId, role: 'JSS', name: id.name, district: id.district });

  return (
    <div className="min-h-screen bg-[#010804] text-white p-4 lg:p-8 font-sans">

      {/* Live pulse banner */}
      {online !== null && (
        <div className="flex items-center justify-center gap-2 mb-4 text-[10px] font-black text-[#DA251D] uppercase tracking-widest">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DA251D] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#DA251D]"></span>
          </span>
          {online.toLocaleString()} Workers Online Now
        </div>
      )}

      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">
            JAN SAMPARK <span className="text-[#DA251D]">SATHI</span>
          </h1>
          <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.4em] mt-1">
            Ground Level Connectivity Node | L-4
          </p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
            <input 
              type="text" 
              placeholder="Search Voter/Booth..." 
              className="bg-white/5 border border-white/10 pl-12 pr-6 py-3 rounded-2xl focus:outline-none focus:border-[#DA251D] transition-all text-xs font-bold"
            />
          </div>
          <button className="bg-white/5 border border-white/10 p-3 rounded-2xl hover:bg-white/10 transition-all">
            <Filter size={20} className="text-gray-400" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard icon={Users}        label="Total Family Contacts" value="12,450" color="blue" />
        <StatCard icon={Target}       label="Influencers Mapped"    value="842"    color="orange" />
        <StatCard icon={MessageSquare} label="Issues Resolved"      value="156"    color="green" />
        <StatCard icon={Heart}        label="Positive Sentiment"    value="78%"    color="red" />
      </div>

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Interactions Table */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-black uppercase italic tracking-tight">Recent Field Logs</h2>
            <button className="text-[10px] font-black text-[#DA251D] uppercase tracking-widest border-b border-[#DA251D]/30 pb-1">View Full Log</button>
          </div>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10 flex items-center justify-center text-[10px] font-black">JS</div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Booth No. {id.boothNo || '124'} - {id.district || 'Mainpuri'}</h4>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">Interaction: Door-to-Door</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-green-500 uppercase tracking-widest block">Positive</span>
                  <span className="text-[8px] text-gray-600 font-bold">2 MINS AGO</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sentiment & Quick Actions */}
        <div className="space-y-8">
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-xl">
            <h2 className="text-lg font-black uppercase italic tracking-tight mb-6">Mood Radar</h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-[10px] font-black uppercase mb-2 tracking-widest">
                  <span className="text-green-500">Supportive</span><span>78%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-black uppercase mb-2 tracking-widest">
                  <span className="text-orange-500">Undecided</span><span>15%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: '15%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <button className="w-full bg-[#DA251D] p-6 rounded-[2rem] font-black uppercase italic tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-[#DA251D]/20 active:scale-95 transition-all">
            <Zap size={20} fill="currentColor" /> ADD NEW CONTACT
          </button>
        </div>
      </div>
      {/* Live Location Map — full width below the main grid */}
      <div className="max-w-7xl mx-auto mt-8">
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-[#DA251D]/10 rounded-xl border border-[#DA251D]/20">
                <MapPin size={18} className="text-[#DA251D]" />
              </div>
              <div>
                <h2 className="text-base font-black uppercase italic tracking-tight">Live Field Position</h2>
                <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest mt-0.5">GPS · Real-time Location Node</p>
              </div>
            </div>
            <span className="text-[9px] text-gray-600 font-mono uppercase tracking-widest">
              {id.district || 'BRAJ Zone'} · Booth {id.boothNo || '—'}
            </span>
          </div>
          <div style={{ height: '360px' }} className="relative">
            <BoothMap district={id.district} name={id.name} />
          </div>
          <div className="px-6 py-3 border-t border-white/5 flex items-center gap-2 text-[9px] font-black text-gray-700 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-[#DA251D] inline-block"></span>
            Your Position · CARTO Dark Tiles · Auto-updates on GPS change
          </div>
        </div>
      </div>
    </div>
  );
}
