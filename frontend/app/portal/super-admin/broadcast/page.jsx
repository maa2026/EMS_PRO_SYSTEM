"use client";

/**
 * ======================================================================
 * SYSTEM: EMS.UP SUPER ADMIN COMMAND CENTER
 * MODULE: GLOBAL BROADCAST & HIERARCHY MESSAGING
 * BRANDING: ADMIN RAM LAKHAN CYBER SECURITY Standard
 * ======================================================================
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Megaphone, Users, ShieldAlert, Send, Zap, Eye } from "lucide-react";

export default function SuperAdminBroadcast() {
  const [message, setMessage] = useState("");
  const [targetLevel, setTargetLevel] = useState("ALL");

  const levels = [
    { id: "ALL", label: "Full Uttar Pradesh", color: "#EF4444" },
    { id: "L1", label: "State Users Only", color: "#DA251D" },
    { id: "L3", label: "Zone Commanders", color: "#F59E0B" },
    { id: "L7", label: "Jan Sampark Sathis", color: "#10B981" },
  ];

  return (
    <div className="min-h-screen bg-[#010804] text-white p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* 🔝 COMMAND HEADER */}
        <div className="mb-10 border-b border-white/5 pb-8 flex justify-between items-end">
          <div>
            <span className="text-[10px] font-black text-red-500 tracking-[0.4em] uppercase">Level 0: Super Admin</span>
            <h1 className="text-4xl font-black italic tracking-tighter">MASTER <span className="text-red-500">COMMAND</span></h1>
            <p className="text-[11px] text-gray-500 font-bold mt-2 uppercase flex items-center gap-2">
              <Zap size={12} className="text-yellow-500" /> Secure Protocol Active: Admin Ram Lakhan
            </p>
          </div>
          <div className="bg-red-500/10 p-4 rounded-3xl border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
            <ShieldAlert size={32} className="text-red-500" />
          </div>
        </div>

        {/* 🎯 TARGET SELECTION */}
        <div className="mb-8">
          <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 ml-2">Select Target Audience</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {levels.map((level) => (
              <button
                key={level.id}
                onClick={() => setTargetLevel(level.id)}
                className={`p-4 rounded-2xl border transition-all text-center ${
                  targetLevel === level.id 
                  ? 'bg-white/10 border-red-500 shadow-lg shadow-red-500/10' 
                  : 'bg-white/5 border-white/10 opacity-50'
                }`}
              >
                <div className="text-[10px] font-black mb-1" style={{ color: level.color }}>{level.id}</div>
                <div className="text-[11px] font-bold uppercase tracking-tighter">{level.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ✉️ MESSAGE INPUT */}
        <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Megaphone size={120} />
          </div>
          
          <h3 className="text-sm font-black uppercase mb-4 flex items-center gap-2">
            <Send size={16} className="text-red-500" /> Emergency Message Content
          </h3>
          
          <textarea 
            rows="4"
            placeholder="Type your command here... (Example: All Booth Managers start verification now!)"
            className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-red-500 transition-all text-sm font-medium italic"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <div className="mt-6 flex gap-4">
            <button className="flex-1 bg-red-600 p-5 rounded-[2rem] font-black uppercase italic tracking-[0.2em] shadow-xl shadow-red-600/20 active:scale-95 transition-all text-black flex items-center justify-center gap-3">
              <Zap size={20} fill="currentColor" /> DISPATCH BROADCAST
            </button>
            
            <button className="bg-white/10 p-5 rounded-full border border-white/10 hover:bg-white/20 transition-all">
              <Eye size={24} />
            </button>
          </div>
        </div>

        {/* 📊 LIVE REACH STATS */}
        <div className="mt-10 grid grid-cols-3 gap-6 px-4">
          <div className="text-center">
            <p className="text-[9px] font-black text-gray-500 uppercase">Total Active Nodes</p>
            <h4 className="text-2xl font-black italic">42,105</h4>
          </div>
          <div className="text-center border-x border-white/10">
            <p className="text-[9px] font-black text-gray-500 uppercase">Live Delivery</p>
            <h4 className="text-2xl font-black italic text-emerald-500">98.2%</h4>
          </div>
          <div className="text-center">
            <p className="text-[9px] font-black text-gray-500 uppercase">Response Rate</p>
            <h4 className="text-2xl font-black italic text-blue-500">74%</h4>
          </div>
        </div>

      </div>
    </div>
  );
}