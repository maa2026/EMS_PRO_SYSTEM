"use client";
import { useState } from 'react';
import ApplicationTracker from '@/components/ApplicationTracker';

export default function TrackingPage() {
  const [appId, setAppId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  const handleTrack = () => {
    if (!appId) return alert("Please enter Application ID");
    setIsSearching(true);
    // Yahan backend fetch logic aayega (Check if ID exists in District/State/Admin records)
    setTimeout(() => {
      setIsSearching(false);
      setShowStatus(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-lg">
        
        {!showStatus ? (
          <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] shadow-2xl backdrop-blur-xl relative overflow-hidden">
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-red-600/10 blur-[80px] pointer-events-none"></div>
            
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black italic text-red-600 uppercase tracking-tighter">Track <span className="text-white">Enrollment</span></h2>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.3em] mt-2">Enter your unique ID to check hierarchy status</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-red-500 uppercase ml-2 tracking-widest italic">Application ID *</label>
                <input 
                  type="text" 
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  placeholder="EMS-UP-XXXX" 
                  className="w-full bg-black/60 border border-white/10 p-5 rounded-2xl focus:border-red-600 outline-none text-center font-mono text-xl uppercase tracking-widest text-white" 
                />
              </div>

              <button 
                onClick={handleTrack}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-5 rounded-2xl shadow-lg transition-all active:scale-95 uppercase italic tracking-widest text-sm"
              >
                {isSearching ? "Verifying Node..." : "Track Status"}
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-in zoom-in-95 duration-500">
             {/* Component jo humne pehle banaya tha */}
             <ApplicationTracker />
             
             <button 
               onClick={() => setShowStatus(false)} 
               className="mt-8 w-full text-[10px] text-gray-600 uppercase font-black tracking-[0.5em] hover:text-red-600 transition-colors"
             >
               ← Back to Search
             </button>
          </div>
        )}

      </div>
      
      {/* Footer Branding */}
      <p className="mt-10 text-gray-800 text-[8px] uppercase tracking-[1em] font-black italic">
        SAMAJWADI CLOUD Intelligence
      </p>
    </div>
  );
}