import React, { useState } from 'react';

const RoleDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("Select Role");

  const roles = ["District Admin", "Zone Admin", "Booth Manager"];

  return (
    <div className="relative w-full max-w-xs my-4 font-sans text-white">
      {/* Label (Optional) */}
      <label className="block text-sm font-medium text-red-400 mb-2">User Role</label>
      
      {/* Custom Select Box */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#1e293b] border border-red-500/30 p-3 rounded-xl cursor-pointer flex justify-between items-center shadow-lg hover:border-red-400 hover:bg-red-500/10 transition-all duration-200 active:scale-95"
      >
        <span className={selectedRole === "Select Role" ? "text-slate-400" : "text-white"}>
          {selectedRole}
        </span>
        <svg className={`w-5 h-5 text-red-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Options List - Yeh 100% Dark rahega aur screen par chamkega */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[#0f172a] border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {roles.map((role) => (
            <div 
              key={role}
              onClick={() => {
                setSelectedRole(role);
                setIsOpen(false);
              }}
              className="px-4 py-3 hover:bg-red-600/40 hover:text-red-200 cursor-pointer transition-colors border-b border-slate-800 last:border-0"
            >
              {role}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoleDropdown;
