"use client";
import { useState } from 'react';

export default function EMSVoterSearch() {
  const [activeTab, setActiveTab] = useState('EPIC');
  const [results, setResults] = useState([]); 
  const [isSearching, setIsSearching] = useState(false);
  const [selectedVoter, setSelectedVoter] = useState(null); // Slip modal ke liye

  // Search function (Backend API ready)
  const handleSearch = () => {
    setIsSearching(true);
    // Dummy Data: Backend connect hone par yahan fetch() aayega
    setTimeout(() => {
      setResults([
        { 
          id: 1, 
          name: "RAKESH KUMAR", 
          voter_id: "UP/12/045/001234", 
          relative: "SHANTI PRASAD", 
          age: 42, 
          gender: "Male", 
          mobile: "9876543210",
          photo: null, 
          booth: "Kanya Pathshala Room No. 2",
          ac: "108 - Bhongaon",
          district: "Mainpuri"
        },
        { 
          id: 2, 
          name: "SUSHMA DEVI", 
          voter_id: "ZPY9876543", 
          relative: "RAKESH KUMAR", 
          age: 38, 
          gender: "Female", 
          mobile: "9988776655",
          photo: null,
          booth: "Panchayat Bhawan North Wing",
          ac: "108 - Bhongaon",
          district: "Mainpuri"
        }
      ]);
      setIsSearching(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-10 font-sans tracking-tight relative">
      <div className="max-w-6xl mx-auto">
        
        {/* --- EMS HEADER --- */}
        <div className="mb-10 border-l-4 border-red-600 pl-6">
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">
            EMS <span className="text-white not-italic font-light">VOTER DATA</span>
          </h1>
          <p className="text-gray-500 text-xs tracking-[0.3em] uppercase mt-1">Unified Election Intelligence Database</p>
        </div>

        {/* --- TABS (Responsive Fix) --- */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {['EPIC', 'DETAILS', 'MOBILE'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 rounded-xl font-bold transition-all duration-300 uppercase tracking-widest text-[10px] md:text-xs text-center border ${
                activeTab === tab ? 'bg-red-600 border-red-600 shadow-[0_0_25px_rgba(220,38,38,0.4)] text-white scale-[1.02]' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
              }`}>Search by {tab}</button>
          ))}
        </div>

        {/* --- MAIN SEARCH FORM --- */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-12 shadow-2xl overflow-hidden relative mb-10">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-600/10 blur-[100px] rounded-full pointer-events-none"></div>

          {activeTab === 'EPIC' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
              <h3 className="text-red-600 font-black italic border-b border-red-600/20 pb-2 uppercase text-xl tracking-widest">EPIC Verification</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-red-500 uppercase ml-2 tracking-widest italic">EPIC Number *</label>
                  <input type="text" placeholder="Enter EPIC ID" className="w-full bg-black/60 border border-white/10 p-5 rounded-2xl focus:border-red-600 outline-none uppercase font-mono text-xl text-white shadow-inner" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-red-500 uppercase ml-2 tracking-widest italic text-red-500">State / राज्य *</label>
                  <select className="w-full bg-black/60 border border-white/10 p-5 rounded-2xl focus:border-red-600 outline-none text-gray-300"><option>Uttar Pradesh</option></select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'DETAILS' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <h3 className="text-red-600 font-black italic border-b border-red-600/20 pb-2 uppercase text-xl tracking-widest text-red-600">Personal Details</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" placeholder="Voter Name" className="bg-black/60 border border-white/10 p-5 rounded-2xl focus:border-red-600 outline-none text-white" />
                <input type="text" placeholder="Relative Name" className="bg-black/60 border border-white/10 p-5 rounded-2xl focus:border-red-600 outline-none text-white" />
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-2 italic text-red-500">Date of Birth</label>
                    <input type="date" className="w-full bg-black/60 border border-white/10 p-5 rounded-2xl focus:border-red-600 outline-none text-gray-400" />
                  </div>
                  <div className="w-full md:w-1/3 space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-2 italic text-red-500">Age</label>
                    <input type="number" placeholder="Age" className="w-full bg-black/60 border border-white/10 p-5 rounded-2xl focus:border-red-600 outline-none text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase ml-2 italic text-red-500">Gender / लिंग</label>
                  <select className="w-full bg-black/60 border border-white/10 p-5 rounded-2xl focus:border-red-600 outline-none text-gray-400">
                    <option>Select Gender</option>
                    <option>Male / पुरुष</option>
                    <option>Female / महिला</option>
                    <option>Third Gender / तृतीय लिंग</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'MOBILE' && (
            <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
              <h3 className="text-red-600 font-black italic border-b border-red-600/20 pb-2 uppercase text-xl tracking-widest text-red-600">Mobile Intelligence</h3>
              <div className="max-w-md space-y-2">
                  <label className="text-[10px] font-bold text-red-500 uppercase ml-2 tracking-widest italic text-red-500">Mobile Number *</label>
                  <input type="tel" maxLength="10" placeholder="Enter 10 digit number" className="w-full bg-black/60 border border-white/10 p-5 rounded-2xl focus:border-red-600 outline-none text-xl font-mono text-white shadow-inner" />
              </div>
            </div>
          )}

          <div className="mt-12 flex flex-col md:flex-row gap-4">
            <button onClick={handleSearch} className="bg-red-600 hover:bg-red-700 text-white font-black py-5 px-16 rounded-2xl shadow-lg transition-all active:scale-95 uppercase italic tracking-widest text-lg">
              {isSearching ? "Searching..." : "Initiate Search"}
            </button>
            <button onClick={() => setResults([])} className="bg-white/5 hover:bg-white/10 text-gray-400 font-bold py-5 px-10 rounded-2xl border border-white/10 transition-all uppercase text-sm tracking-widest">
              Clear All
            </button>
          </div>
        </div>

        {/* --- 🚀 1. LIST VIEW (Summary Results) --- */}
        {results.length > 0 && (
          <div className="mt-10 animate-in slide-in-from-bottom-5 duration-700 bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h2 className="text-xl font-black italic text-red-600 uppercase tracking-tighter">Database Results</h2>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full border border-white/10">{results.length} Matches</span>
            </div>
            <div className="table-responsive md:table-mobile-cards">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-gray-500 uppercase tracking-widest border-b border-white/5 bg-black/20">
                    <th className="p-5 font-black">Voter Name</th>
                    <th className="p-5 font-black">EPIC ID</th>
                    <th className="p-5 font-black">Relative Name</th>
                    <th className="p-5 font-black text-center text-red-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {results.map((voter) => (
                    <tr key={voter.id} className="hover:bg-red-600/5 transition-all group cursor-pointer" onClick={() => setSelectedVoter(voter)}>
                      <td data-label="Voter Name" className="p-5 font-bold uppercase text-sm text-white group-hover:text-red-500">{voter.name}</td>
                      <td data-label="EPIC ID" className="p-5 font-mono text-xs text-gray-400 group-hover:text-white">{voter.voter_id}</td>
                      <td data-label="Relative Name" className="p-5 text-xs text-gray-500 uppercase italic font-medium">{voter.relative}</td>
                      <td data-label="Action" className="p-5 text-center">
                        <button className="text-[9px] font-black italic bg-red-600/10 text-red-500 px-4 py-2 rounded-full border border-red-600/20 hover:bg-red-600 hover:text-white transition-all uppercase tracking-widest">View Slip</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- 🚀 2. VOTER SLIP MODAL (Popup with Photo & Mobile) --- */}
        {selectedVoter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/90 animate-in fade-in duration-300">
            <div className="bg-[#0f0f0f] border-2 border-red-600/30 w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-[0_0_80px_rgba(220,38,38,0.3)] relative">
              
              {/* Modal Header */}
              <div className="bg-red-600 p-6 flex justify-between items-center italic">
                <h3 className="font-black text-white tracking-[0.2em] uppercase text-sm">Official Voter Intelligence Slip</h3>
                <button onClick={() => setSelectedVoter(null)} className="text-white hover:rotate-90 transition-all bg-black/20 rounded-full p-2">✕</button>
              </div>
              
              <div className="p-8 md:p-10 space-y-8">
                {/* Photo + EPIC Section */}
                <div className="flex gap-8 items-center">
                  <div className="w-28 h-32 bg-black border-2 border-white/10 rounded-2xl flex-shrink-0 overflow-hidden shadow-2xl relative">
                    {selectedVoter.photo ? (
                      <img src={selectedVoter.photo} alt="Voter" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-800 bg-white/5">
                        <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" /></svg>
                      </div>
                    )}
                    <div className="absolute bottom-0 w-full bg-red-600 py-1 text-[8px] text-center font-black uppercase tracking-tighter">Verified Node</div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1 italic underline decoration-red-600/30">ईपीआईसी संख्या / Voter ID</p>
                    <h4 className="text-3xl font-mono font-black text-white leading-none tracking-wider mb-2">{selectedVoter.voter_id}</h4>
                    <h4 className="text-2xl font-black uppercase text-red-500 tracking-tighter leading-tight">{selectedVoter.name}</h4>
                    <p className="text-gray-400 text-xs italic uppercase tracking-[0.1em] font-bold">S/O: {selectedVoter.relative}</p>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4 bg-white/5 p-6 rounded-3xl border border-white/10 shadow-inner">
                  <div className="space-y-1">
                    <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Age / Gender</p>
                    <p className="font-bold text-white text-sm">{selectedVoter.age} Yrs | {selectedVoter.gender}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-red-500 uppercase font-black tracking-widest">Mobile Number</p>
                    <p className="font-mono text-white text-sm tracking-widest font-black">+91 {selectedVoter.mobile}</p>
                  </div>
                </div>

                {/* Booth Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border-l-4 border-red-600 pl-4 space-y-1">
                    <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest italic">बूथ / Booth Info</p>
                    <p className="text-xs font-bold text-white leading-relaxed uppercase">{selectedVoter.booth}</p>
                  </div>
                  <div className="border-l-4 border-white/20 pl-4 space-y-1">
                    <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest italic">Location / जिला</p>
                    <p className="text-xs text-white uppercase font-bold tracking-tighter leading-relaxed">{selectedVoter.ac} <br/> {selectedVoter.district}, UP</p>
                  </div>
                </div>

                {/* Download Button */}
                <button className="w-full bg-red-600 hover:bg-red-700 py-5 rounded-2xl font-black uppercase italic tracking-[0.3em] shadow-[0_10px_30px_rgba(220,38,38,0.3)] transition-all active:scale-95 text-xs">
                  Download Digital Voter Slip
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer info */}
        <p className="mt-8 text-center text-gray-700 text-[10px] uppercase tracking-[0.5em] font-bold">EMS Intelligence System V2.0 | Secured Node Access</p>
      </div>
    </div>
  );
}