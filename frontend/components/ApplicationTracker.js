"use client";
import { motion } from "framer-motion";

export default function ApplicationTracker({ applicationData }) {
  // Dummy data status checking ke liye
  const steps = [
    { label: "Application Submitted", status: "completed", date: "06 March 2026" },
    { label: "District Verification", status: "current", note: "Physical Documents under review" },
    { label: "State Level Check", status: "pending", note: "Pending District Clearance" },
    { label: "Super Admin Final Approval", status: "pending", note: "Awaiting final node activation" }
  ];

  return (
    <div className="bg-[#0f0f0f] border border-white/10 p-8 rounded-[2.5rem] shadow-2xl max-w-lg mx-auto relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-[60px] pointer-events-none"></div>

      <div className="flex justify-between items-center mb-10">
        <div>
          <h3 className="text-xl font-black italic text-white uppercase tracking-tighter">Track <span className="text-red-600">Enrollment</span></h3>
          <p className="text-[9px] text-gray-500 uppercase font-bold tracking-[0.3em]">Hiring ID: EMS-UP-2026-045</p>
        </div>
        <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10">
           <span className="text-[10px] text-yellow-500 font-black uppercase italic tracking-widest animate-pulse">In Progress</span>
        </div>
      </div>

      {/* --- STEPPER LOGIC --- */}
      <div className="space-y-8 relative">
        {/* Connecting Line */}
        <div className="absolute left-[15px] top-2 w-[2px] h-[85%] bg-white/5"></div>

        {steps.map((step, index) => (
          <div key={index} className="flex gap-6 relative z-10">
            {/* Status Icon */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
              step.status === 'completed' ? 'bg-green-600 border-green-600 shadow-[0_0_15px_rgba(22,163,74,0.4)]' : 
              step.status === 'current' ? 'bg-red-600 border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.4)] animate-pulse' : 
              'bg-black border-white/10'
            }`}>
              {step.status === 'completed' ? <span className="text-[10px]">✔</span> : <span className="text-[10px]">{index + 1}</span>}
            </div>

            {/* Step Details */}
            <div className="flex-1">
              <h4 className={`text-sm font-black uppercase tracking-widest ${step.status === 'pending' ? 'text-gray-600' : 'text-white'}`}>
                {step.label}
              </h4>
              {step.date && <p className="text-[10px] text-gray-500 font-mono mt-1">{step.date}</p>}
              {step.note && <p className={`text-[10px] mt-1 font-bold italic ${step.status === 'current' ? 'text-red-500/80' : 'text-gray-700'}`}>
                {step.note}
              </p>}
            </div>
          </div>
        ))}
      </div>

      {/* Special Power Note (Super Admin) */}
      <div className="mt-10 p-4 bg-red-600/5 border border-red-600/10 rounded-2xl">
         <p className="text-[9px] text-gray-500 leading-relaxed font-medium">
           <span className="text-red-600 font-black italic">SUPER ADMIN NOTE:</span> Final approval is subject to top-level node activation. Super Admin reserves the right for direct enrollment bypass.
         </p>
      </div>
    </div>
  );
}