import React, { useState } from 'react';

const DarkDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("Select Role");

  const options = ["District Admin", "Zone Admin", "Booth Manager"];

  return (
    <div className="relative w-full max-w-xs font-sans">
      {/* Label */}
      <label className="block text-gray-400 text-sm mb-2 ml-1">System Access Role</label>

      {/* Main Select Box */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 cursor-pointer rounded-xl border transition-all duration-300 
          ${isOpen ? 'border-blue-500 bg-[#1e293b] shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'border-slate-700 bg-[#0f172a] hover:border-slate-500'}`}
      >
        <span className={`text-sm ${selected === "Select Role" ? 'text-gray-500' : 'text-white font-medium'}`}>
          {selected}
        </span>
        
        {/* Arrow Icon */}
        <svg 
          className={`w-5 h-5 text-blue-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown Menu (The Options) */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[#1e293b] border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {options.map((option, index) => (
            <div 
              key={index}
              onClick={() => {
                setSelected(option);
                setIsOpen(false);
              }}
              className="px-4 py-3 text-sm text-gray-200 hover:bg-blue-600 hover:text-white cursor-pointer transition-colors border-b border-slate-700/50 last:border-0"
            >
              {option}
            </div>
          ))}
        </div>
      )}

      {/* Click Outside to Close (Overlay) */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default DarkDropdown;
