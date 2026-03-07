"use client";
import { useState } from 'react';
import { Map, ShieldAlert, Lock, BarChart3, ChevronRight, Globe, Zap } from "lucide-react";

export default function ZoneMonitor() {
  const [accessRequested, setAccessRequested] = useState(false);

  // Zone Level Data (Multiple Districts)
  const districtsInZone = [
    { name: "Mainpuri", booths: 1840, sathis: 15200, status: "Optimal", health: 92 },
    { name: "Etawah", booths: 1250, sathis: 9800, status: "Stable", health: 85 },
    { name: "Firozabad", booths: 2100, sathis: 12400, status: "Critical Gap", health: 42 },
    { name: "Agra", booths: 3400, sathis: 28000, status: "Optimal", health: 95 }
  ];

  return (
    // FIX: pt-32 add kiya hai taaki Navbar se clash na ho
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 pt-32 font-sans selection:bg-red-600">
      
      {/* --- ZONE STRATEGIC HEADER --- */}
      <div className="max-w-7xl mx-auto mb-16">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-white/5 pb-10 gap-8">
          <div className="flex items-center gap-8">
            <div className="p-5 bg-red-600 rounded-[2rem] shadow-[0_0_40px_rgba(220,38,38,0.3)]">
              <Map size={40} />
            </div>
            <div>
              <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
                BRAJ <span className="text-red-600">ZONE</span> NODE
              </h1>
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.6em] mt-3 italic flex items-center gap-2">
                <Lock size={12} className="text-yellow-600" /> Administrative Monitoring Level: 02
              </p>
            </div>
          </div>

          {/* Master Action: Request Permission */}
          <button 
            onClick={() => setAccessRequested(true)}
            className={`px-10 py-5 rounded-[2rem] font-black uppercase italic tracking-widest text-xs transition-all flex items-center gap-3 ${
              accessRequested 
              ? 'bg-yellow-600/10 text-yellow-500 border border-yellow-600/30' 
              : 'bg-white text-black hover:bg-red-600 hover:text-white shadow-2xl scale-105'
            }`}
          >
            {accessRequested ? "Waiting for Supreme Bypass..." : "Request Global Edit Access"}
          </button>
        </div>

        {/* --- ZONE ANALYTICS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 mt-12">
          {[
            { label: "Total Districts", val: "04", icon: <Globe size={18}/> },
            { label: "Total Booths", val: "8,590", icon: <BarChart3 size={18}/> },
            { label: "Force Strength", val: "65,400", icon: <Zap size={18}/> },
            { label: "Zone Health", val: "78%", icon: <ShieldAlert size={18}/> }
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-[3rem] group hover:border-red-600/30 transition-all">
              <div className="text-red-600 mb-4">{stat.icon}</div>
              <p className="text-4xl font-black italic mb-1">{stat.val}</p>
              <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest italic">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* --- DISTRICT INTELLIGENCE TABLE --- */}
        <div className="bg-white/5 border border-white/10 rounded-[4rem] overflow-hidden backdrop-blur-3xl shadow-2xl">
          <div className="p-10 border-b border-white/10 bg-white/5">
            <h2 className="text-xl font-black italic uppercase tracking-widest text-red-600">District-Wise Deployment Intel</h2>
          </div>
          
          <div className="overflow-x-auto px-8 pb-10">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-gray-600 uppercase tracking-[0.4em] border-b border-white/5">
                  <th className="p-8">District Name</th>
                  <th className="p-8">Unit Saturation</th>
                  <th className="p-8">Hiring Health</th>
                  <th className="p-8 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {districtsInZone.map((dist, idx) => (
                  <tr key={idx} className="hover:bg-red-600/5 transition-all group cursor-not-allowed">
                    <td className="p-8">
                      <p className="font-black uppercase text-xl italic group-hover:text-red-600 transition-colors">{dist.name}</p>
                      <p className="text-[10px] text-gray-600 font-mono tracking-widest mt-1 italic">{dist.booths} TOTAL BOOTHS</p>
                    </td>
                    <td className="p-8">
                      <p className="text-lg font-black italic text-white">{dist.sathis.toLocaleString()}</p>
                      <p className="text-[9px] text-gray-600 uppercase font-bold tracking-widest">Active Force</p>
                    </td>
                    <td className="p-8">
                      <div className="w-32 h-1.5 bg-black rounded-full overflow-hidden border border-white/10">
                        <div className={`h-full ${dist.health > 50 ? 'bg-green-600' : 'bg-red-600'}`} style={{ width: `${dist.health}%` }}></div>
                      </div>
                      <p className="text-[9px] text-gray-600 mt-2 font-black italic uppercase tracking-widest">{dist.health}% SECURED</p>
                    </td>
                    <td className="p-8 text-right">
                       <span className="text-[9px] border border-white/10 px-4 py-2 rounded-xl text-gray-500 font-black uppercase italic tracking-widest">
                         Locked View
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- FOOTER WARNING --- */}
        <p className="mt-12 text-center text-gray-800 text-[10px] uppercase tracking-[1.5em] font-black italic">
          ZONE MONITORING NODE | BRAJ SECTOR | ENCRYPTION ACTIVE
        </p>
      </div>
    </div>
  );
}