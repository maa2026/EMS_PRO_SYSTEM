"use client";
import { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';

export default function DistrictAdminPortal() {
  const [activeTab, setActiveTab] = useState('Pending');
  const [userName, setUserName] = useState("");
  const [userDistrict, setUserDistrict] = useState("");

  useEffect(() => {
    setUserName(localStorage.getItem("userName") || "");
    setUserDistrict(localStorage.getItem("userDistrict") || "");
  }, []);

  const handleLogout = () => {
    ["userId","userRole","userName","userDistrict","userBoothNo","userConstituency","userZone","userEmsId","userRoleLabel"]
      .forEach(k => localStorage.removeItem(k));
    ["userId","userRole","userName"].forEach(k => { document.cookie = `${k}=; max-age=0; path=/`; });
    window.location.href = "/login";
  };

  // Dummy data for verification queue
  const [applicants, setApplicants] = useState([
    { id: "EMS-UP-101", name: "Ramesh Yadav", role: "Jan Sampark Sathi", booth: "125", docs: "Aadhar/VoterID", distStatus: "Pending" },
    { id: "EMS-UP-102", name: "Suresh Khanna", role: "Booth Manager", booth: "126", docs: "Aadhar/PAN", distStatus: "Pending" },
    { id: "EMS-UP-103", name: "Anil Maurya", role: "Jan Sampark Sathi", booth: "127", docs: "Aadhar/VoterID", distStatus: "Pending" },
  ]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-10 font-sans tracking-tight">
      <div className="max-w-6xl mx-auto">
        
        {/* --- DISTRICT HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-l-4 border-red-600 pl-8">
          <div>
            <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter">
              DISTRICT <span className="text-red-600">VERIFIER</span> NODE
            </h1>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.4em] mt-1 italic">Level 1: Physical & Document Verification</p>
          </div>
          <div className="flex items-end gap-4">
            <div className="bg-white/5 border border-white/10 p-4 rounded-3xl text-right">
               <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest italic">Current District</p>
               <p className="text-xl font-black text-white italic uppercase">{userDistrict || "—"}</p>
               <p className="text-[9px] text-gray-400 font-semibold mt-0.5">{userName}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-red-400 bg-red-600/10 border border-red-600/20 hover:bg-red-600/20 transition-all mb-1"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>

        {/* --- VERIFICATION TABLE --- */}
        <div className="bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl relative">
          <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
            <h2 className="text-xl font-black italic text-white uppercase tracking-widest underline decoration-red-600 decoration-4 underline-offset-8">Verification Queue</h2>
            <div className="flex gap-4">
              <span className="bg-red-600/10 text-red-500 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-600/20">
                {applicants.length} New Requests
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-gray-600 uppercase tracking-[0.3em] border-b border-white/5 bg-black/20">
                  <th className="p-6">Applicant Info</th>
                  <th className="p-6">Role & Booth</th>
                  <th className="p-6">Documents</th>
                  <th className="p-6 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {applicants.map((app) => (
                  <tr key={app.id} className="hover:bg-red-600/5 transition-all group">
                    <td className="p-6">
                      <p className="font-black uppercase text-sm group-hover:text-red-500 transition-colors">{app.name}</p>
                      <p className="text-[8px] text-gray-600 font-mono tracking-widest italic uppercase">Node ID: {app.id}</p>
                    </td>
                    <td className="p-6 uppercase">
                      <p className="text-xs font-bold text-white">{app.role}</p>
                      <p className="text-[9px] text-gray-500">Booth # {app.booth}</p>
                    </td>
                    <td className="p-6">
                      <button className="text-[9px] font-black text-red-600 hover:text-white border border-red-600/30 px-3 py-1.5 rounded-xl transition-all uppercase italic tracking-widest">
                        View {app.docs}
                      </button>
                    </td>
                    <td className="p-6 text-right space-x-3">
                      {/* ONLY VERIFY & REJECT POWERS */}
                      <button className="bg-white/5 border border-white/10 text-gray-500 hover:text-red-500 hover:border-red-600/40 px-6 py-2 rounded-xl text-[9px] font-black uppercase italic tracking-widest transition-all">
                        Reject
                      </button>
                      <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl text-[9px] font-black uppercase italic tracking-widest transition-all shadow-lg shadow-red-600/20">
                        Verify (Send to State)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- SECURITY NOTE --- */}
        <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-3xl">
           <p className="text-[9px] text-gray-600 uppercase font-bold leading-relaxed">
             <span className="text-red-600 italic font-black">District Notice:</span> Verification only confirms physical existence and document validity. Final approval and node activation are strictly reserved for the <span className="text-white underline decoration-red-600 decoration-2">Super Admin Command Center</span>.
           </p>
        </div>

      </div>
    </div>
  );
}