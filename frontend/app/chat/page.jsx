"use client";

import { useState, useEffect } from "react";
import ChatSidebar from "@/components/ChatSidebar";
import ChatWindow from "@/components/ChatWindow";
import Cookies from "js-cookie";
import { io } from "socket.io-client";

// ✅ Connection URL ensure karein (Backend Port 5000)
const socket = io("http://localhost:5000", {
  transports: ["websocket", "polling"],
  reconnection: true
}); 

export default function ChatPage() {
  const [selectedContact, setSelectedContact] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [onlineStatus, setOnlineStatus] = useState(false);

  useEffect(() => {
    // 🛡️ 1. Identity Fetch (Cookies se Role aur ID uthayein)
    const userId = Cookies.get("userId") || "1";
    const userRole = Cookies.get("userRole") || "L7";

    const mockUsers = [
      { id: "1", name: "Admin Ram Lakhan", role: "L0", area: "UP State" },
      { id: "2", name: "State Secretary", role: "L1", area: "Lucknow HQ" },
      { id: "3", name: "MP - Lucknow", role: "L2", area: "Lucknow Constituency" },
      { id: "6", name: "Booth Manager 102", role: "L6", area: "Booth #102" },
    ];
    setAllUsers(mockUsers);

    // 🛡️ 2. Fix: Backend expects an Object {userId, userRole}
    const handleConnect = () => {
      setOnlineStatus(true);
      socket.emit("join_protocol", { 
        userId: String(userId), 
        userRole: userRole 
      });
      console.log(`📡 Secure Handshake: User ${userId} (${userRole}) Online`);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", () => setOnlineStatus(false));

    // Initial check agar socket pehle se connect ho gaya ho
    if (socket.connected) handleConnect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect");
    };
  }, []);

  return (
    <div className="flex h-screen bg-[#010804] overflow-hidden font-sans">
      
      {/* 🛡️ SIDEBAR */}
      <div className="w-80 border-r border-white/5 h-full bg-[#02040a]">
        <ChatSidebar 
          allUsers={allUsers} 
          onContactSelect={(contact) => setSelectedContact(contact)} 
        />
      </div>

      {/* 💬 MESSAGING AREA */}
      <div className="flex-1 h-full relative">
        <div className="absolute top-4 right-4 z-50">
           <span className={`text-[8px] font-black px-3 py-1.5 rounded-full border transition-all duration-500 ${onlineStatus ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'text-red-500 border-red-500/20 bg-red-500/5'}`}>
             {onlineStatus ? "● PROTOCOL ACTIVE" : "○ DISCONNECTED"}
           </span>
        </div>

        {selectedContact ? (
          <ChatWindow selectedContact={selectedContact} socket={socket} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-30 space-y-6">
            <div className="w-16 h-16 border-t-2 border-r-2 border-red-600 rounded-full animate-spin"></div>
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.8em] text-white">
                {onlineStatus ? "System Ready" : "Terminal Offline"}
              </p>
              <p className="text-[8px] text-gray-500 mt-2 uppercase tracking-widest">Select a secure node to begin transmission</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}