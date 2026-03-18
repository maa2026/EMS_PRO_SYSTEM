"use client";
import { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';

export default function StateAdminPortal() {
  const [activeDistrict, setActiveDistrict] = useState('All Districts');
  const [userName, setUserName] = useState("");

  useEffect(() => {
    setUserName(localStorage.getItem("userName") || "State Admin");
  }, []);

  const handleLogout = () => {
    ["userId","userRole","userName","userDistrict","userBoothNo","userConstituency","userZone","userEmsId","userRoleLabel"]
      .forEach(k => localStorage.removeItem(k));
    ["userId","userRole","userName"].forEach(k => { document.cookie = `${k}=; max-age=0; path=/`; });
    window.location.href = "/login";
  };

  const applicants = [
    { id: "EMS-UP-101", name: "Ramesh Yadav", role: "Jan Sampark Sathi", district: "Mainpuri", distVerifiedBy: "Unit-04", status: "Pending" },
    { id: "EMS-UP-105", name: "Rahul Dixit", role: "Booth Manager", district: "Etawah", distVerifiedBy: "Unit-09", status: "Pending" },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans selection:bg-red-600">
      <div className="max-w-7xl mx-auto">
        
        {/* --- STATE COMMAND HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 border-b border-white/5 pb-10">
          <div className="border-l-8 border-red-600 pl-8">
            <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none">
              STATE <span className="text-red-600">AUDIT</span> NODE
            </h1>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-[0.6em] mt-3">Level 2: Secondary Verification & Fraud Detection</p>
          </div>
          <div className="flex flex-col items-end gap-2">
             <span className="text-[10px] text-red-600 font-black uppercase tracking-widest">Authorization Layer</span>
             <span className="bg-white/5 px-6 py-2 rounded-2xl border border-white/10 text-sm font-black italic uppercase tracking-widest">UP State Command Center</span>
             <div className="flex items-center gap-3 mt-1">
               <span className="text-[10px] text-gray-400 font-semibold">{userName}</span>
               <button
                 onClick={handleLogout}
                 className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-red-400 bg-red-600/10 border border-red-600/20 hover:bg-red-600/20 transition-all"
               >
                 <LogOut size={12} /> Logout
               </button>
             </div>
          </div>
        </div>

        {/* --- ANALYTICS CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10 group hover:border-red-600/30 transition-all">
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2 italic">District Verified</p>
            <p className="text-5xl font-black group-hover:text-red-600 transition-colors italic">1,240</p>
          </div>
          <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10">
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2 italic">Awaiting State Review</p>
            <p className="text-5xl font-black text-yellow-500 italic">45</p>
          </div>
          <div className="bg-red-600/10 p-8 rounded-[3rem] border border-red-600/20">
            <p className="text-[10px] text-red-500 uppercase font-black tracking-widest mb-2 italic">District Rejections</p>
            <p className="text-5xl font-black text-red-600 italic">12</p>
          </div>
        </div>

        {/* --- STATE VERIFICATION QUEUE --- */}
        <div className="bg-white/5 border border-white/10 rounded-[4rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.5)]">
          <div className="p-10 border-b border-white/10 flex justify-between items-center bg-white/5">
            <h2 className="text-2xl font-black italic uppercase tracking-widest">State Approval Queue</h2>
            <div className="bg-black/40 border border-white/10 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 italic">
              Vetting Authority: State Node 01
            </div>
          </div>

          <div className="overflow-x-auto px-6 pb-10">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-gray-600 uppercase tracking-[0.4em] border-b border-white/5">
                  <th className="p-8">Unit Details</th>
                  <th className="p-8">Origin Node</th>
                  <th className="p-8">Verification Trail</th>
                  <th className="p-8 text-right">State Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {applicants.map((app) => (
                  <tr key={app.id} className="hover:bg-red-600/5 transition-all group">
                    <td className="p-8">
                      <p className="font-black uppercase text-base group-hover:text-red-500 transition-colors italic">{app.name}</p>
                      <p className="text-[9px] text-gray-600 font-mono tracking-[0.2em] mt-1">{app.id} | {app.role}</p>
                    </td>
                    <td className="p-8">
                      <p className="text-xs font-black uppercase text-white tracking-widest italic">{app.district}</p>
                    </td>
                    <td className="p-8">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]"></span>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Verified by Dist: {app.distVerifiedBy}</p>
                      </div>
                    </td>
                    <td className="p-8 text-right space-x-4">
                      {/* ONLY VERIFY & REJECT POWERS */}
                      <button className="bg-white/5 border border-white/10 text-gray-500 hover:text-red-500 hover:border-red-600/30 px-8 py-3 rounded-2xl text-[10px] font-black uppercase italic tracking-widest transition-all">
                        Reject
                      </button>
                      <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase italic tracking-widest transition-all shadow-xl shadow-red-600/20">
                        Finalize & Send to Admin
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}