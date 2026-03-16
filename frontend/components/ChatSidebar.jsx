"use client";

/**
 * ======================================================================
 * SYSTEM: EMS.UP SECURE COMMUNICATION NODE (FINAL)
 * MODULE: ROLE-BASED CONTACT FILTERING & SELECTION
 * BRANDING: ADMIN RAM LAKHAN CYBER SECURITY Standard
 * ======================================================================
 */

import { ROLES, CHAT_ACCESS } from "../utils/permissions";
import { User, ShieldAlert, ShieldCheck } from "lucide-react";
import Cookies from "js-cookie";

export default function ChatSidebar({ allUsers, onContactSelect, selectedId }) {
  // 1. Current User details from Cookies
  const userRole = Cookies.get("userRole") || "L7";
  const myJurisdiction = Cookies.get("jurisdictionId") || "";

  // 2. Access Rules fetch
  const myAllowedRoles = CHAT_ACCESS[userRole] || [];

  // 3. Security Filtering Logic
  const visibleContacts = allUsers.filter((user) => {
    // Rule A: VIP Isolation
    if (user.role === "L2" && userRole === "L1") return false;

    const isRoleAllowed = myAllowedRoles.includes(user.role);

    // Rule B: Ground Logic for L7
    if (userRole === "L7") {
      const isSameBooth = user.jurisdictionId === myJurisdiction;
      const isVerticalHead = ["L0", "L1", "L4", "L5", "L6"].includes(user.role);
      return isRoleAllowed && (isSameBooth || isVerticalHead);
    }

    // Rule C: Horizontal Blocking for L5/L6
    if (["L5", "L6"].includes(userRole)) {
      if (["L5", "L6", "L7"].includes(user.role)) {
        return user.jurisdictionId === myJurisdiction;
      }
    }

    return isRoleAllowed;
  });

  return (
    <div className="w-full md:w-80 h-screen bg-[#010804] border-r border-white/5 p-4 md:p-5 flex flex-col">
      {/* 🔝 HEADER */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck size={14} className="text-red-500" />
          <span className="text-[10px] font-black text-red-500 tracking-[0.3em] uppercase">Secure Command</span>
        </div>
        <h2 className="text-2xl font-black italic text-white tracking-tighter">CONTACTS</h2>
        <div className="mt-2 h-1 w-12 bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]"></div>
      </div>

      {/* 👥 LIST */}
      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
        {visibleContacts.length > 0 ? (
          visibleContacts.map((contact) => (
            <div 
              key={contact.id} 
              onClick={() => onContactSelect(contact)} // ✨ This triggers the ChatWindow
              className={`group p-4 rounded-3xl border transition-all duration-300 cursor-pointer flex items-center justify-between ${
                selectedId === contact.id 
                ? 'bg-red-500/10 border-red-500/40 shadow-[0_0_20px_rgba(220,38,38,0.1)]' 
                : 'bg-white/5 border-white/10 hover:bg-white/[0.08] hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-105 ${
                  contact.role === 'L0' ? 'bg-red-500/20 border-red-500/30 text-red-500' : 
                  contact.role === 'L2' ? 'bg-amber-500/20 border-amber-500/30 text-amber-500' :
                  'bg-white/10 border-white/10 text-gray-400'
                }`}>
                  <User size={20} />
                </div>
                
                <div>
                  <h4 className={`text-sm font-black transition-colors ${selectedId === contact.id ? 'text-red-500' : 'text-white'}`}>
                    {contact.name}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{contact.role}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-800"></span>
                    <span className="text-[8px] font-black text-gray-600 uppercase tracking-tighter">{contact.area}</span>
                  </div>
                </div>
              </div>

              {/* Status Dot */}
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]"></div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 opacity-30">
            <ShieldAlert size={48} className="mx-auto mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">No Authorized Nodes</p>
          </div>
        )}
      </div>

      {/* 🔐 FOOTER */}
      <div className="mt-4 pt-4 border-t border-white/5">
        <p className="text-[7px] text-gray-700 font-black uppercase text-center tracking-[0.4em]">
          Admin Ram Lakhan Protocol v4.0
        </p>
      </div>
    </div>
  );
}