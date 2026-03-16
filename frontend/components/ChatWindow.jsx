"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Send, ShieldAlert, Zap, CheckCheck, MessageSquare, Eye } from "lucide-react";
import Cookies from "js-cookie";
import { io } from "socket.io-client";

export default function ChatWindow({ selectedContact }) {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const scrollRef = useRef(null);

  // 🛡️ User Context (Admin Ram Lakhan Protocol)
  const userRole = Cookies.get("userRole") || "L7";
  const userId = Cookies.get("userId") || "anonymous";

  // 📡 Socket Connection
  const socket = useMemo(() => io("http://127.0.0.1:5000", {
    transports: ["websocket", "polling"],
    reconnection: true,
  }), []);

  const isVIPContact = selectedContact?.role === "L2";
  const isSuperAdmin = userRole === "L0";
  const isBlocked = isVIPContact && !isSuperAdmin;

  // ✅ FIX: Load History with Robust Error Handling
  useEffect(() => {
    if (!selectedContact?.id || userId === "anonymous") return;
    
    const fetchHistory = async () => {
      try {
        // Super Admin gets universal access, others get peer-to-peer only
        const url = `http://127.0.0.1:5000/api/chat/history/${selectedContact.id}?myId=${userId}&role=${userRole}`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        
        const result = await response.json();
        if (result.success) {
          const formattedHistory = result.data.map(msg => ({
            ...msg,
            type: String(msg.senderId) === String(userId) ? 'sent' : 'received'
          }));
          setChatHistory(formattedHistory);
        }
      } catch (err) {
        console.warn("⚠️ History Sync Standby: Backend node might be initializing.");
        setChatHistory([]); // Clear history on error to prevent cross-node ghosting
      }
    };

    fetchHistory();
  }, [selectedContact, userId, userRole]);

  useEffect(() => {
    if (!socket) return;

    const onConnect = () => {
      setIsConnected(true);
      if (userId !== "anonymous") {
        socket.emit("join_protocol", { userId: String(userId), userRole: userRole });
      }
    };

    const onDisconnect = () => setIsConnected(false);

    // 📩 Advanced Multi-Channel Handling (Normal + Audit)
    const handleIncoming = (data) => {
      const incomingSender = String(data.senderId);
      const incomingReceiver = String(data.receiverId);
      const currentSelected = String(selectedContact?.id);
      const myId = String(userId);

      // Rule: Live data display based on God Mode or P2P Privacy
      const shouldDisplay = isSuperAdmin 
        ? (incomingSender === currentSelected || incomingReceiver === currentSelected)
        : (incomingSender === currentSelected && incomingReceiver === myId);

      if (shouldDisplay) {
        setChatHistory((prev) => [
          ...prev,
          { ...data, type: incomingSender === myId ? 'sent' : 'received' }
        ]);
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("receive_command", handleIncoming); 
    socket.on("audit_stream", handleIncoming);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("receive_command", handleIncoming);
      socket.off("audit_stream", handleIncoming);
    };
  }, [socket, userId, userRole, selectedContact, isSuperAdmin]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (isBlocked || !message.trim() || !isConnected) return;

    const messageData = {
      senderId: String(userId),
      senderRole: userRole,
      receiverId: String(selectedContact.id),
      receiverRole: selectedContact.role,
      text: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Optimistic Update
    setChatHistory((prev) => [...prev, { ...messageData, type: 'sent' }]);
    socket.emit("send_command", messageData);
    setMessage("");

    // Database Cloud Sync
    try {
      await fetch('http://127.0.0.1:5000/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      });
    } catch (err) {
      console.error("❌ Cloud Sync Failed: Command cached on socket.");
    }
  };

  if (!selectedContact) {
    return (
      <div className="flex-1 bg-[#02040a] flex items-center justify-center opacity-20">
        <div className="text-center font-black uppercase tracking-[0.5em]">
          <MessageSquare size={64} className="mx-auto mb-4" />
          Protocol Standby
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#02040a] flex flex-col h-screen relative border-l border-white/5">
      
      {/* 🔝 HEADER: Audit and VIP Guard Status */}
      <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isConnected ? 'bg-red-500/10 border border-red-500/20 text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.2)]' : 'bg-gray-500/10 border border-white/10 text-gray-500'}`}>
            {isSuperAdmin ? <Eye size={20} className="animate-pulse" /> : <Zap size={20} fill="currentColor" />}
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">{selectedContact.name}</h3>
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10">{selectedContact.role}</span>
              <span className={isConnected ? "text-emerald-500" : "text-red-500"}>
                {isSuperAdmin ? "• AUDIT MODE ACTIVE" : isConnected ? "• Live Node" : "• Offline"}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* 💬 CHAT AREA */}
      <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-[url('/grid.svg')] bg-fixed custom-scrollbar">
        {chatHistory.length === 0 && (
          <div className="h-full flex items-center justify-center opacity-10 grayscale italic text-xs">
            No secure traffic detected for this node.
          </div>
        )}
        {chatHistory.map((msg, index) => (
          <div key={index} className={`flex flex-col ${msg.type === 'sent' ? 'items-end ml-auto' : 'items-start'} max-w-[75%]`}>
            <div className={`p-4 rounded-3xl text-xs leading-relaxed shadow-2xl transition-all ${
              msg.type === 'sent' 
              ? 'bg-red-600 text-black font-black rounded-tr-none shadow-red-600/10' 
              : 'bg-white/5 border border-white/10 text-gray-200 font-medium rounded-tl-none backdrop-blur-sm'
            }`}>
              {msg.text}
            </div>
            <div className={`flex items-center gap-1 mt-2 ${msg.type === 'sent' ? 'mr-1' : 'ml-1'}`}>
               <span className="text-[8px] font-bold text-gray-600 uppercase tracking-tighter">{msg.timestamp}</span>
               {msg.type === 'sent' && <CheckCheck size={10} className="text-red-500" />}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* ⌨️ INPUT AREA: Hierarchy Guard UI */}
      <div className="p-6 bg-white/[0.02] border-t border-white/5 backdrop-blur-xl">
        {isBlocked ? (
          <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-3xl text-red-500 flex items-center gap-4 animate-in">
            <ShieldAlert size={28} className="shrink-0" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white">Protocol Restriction</p>
              <p className="text-[9px] font-medium italic opacity-70">VIP Nodes (L2) are only accessible via Super Admin (L0) terminal.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="flex gap-4">
            <input 
              type="text" 
              placeholder={isSuperAdmin ? "Observe or Send command..." : "Enter secure command..."}
              className="flex-1 bg-white/5 border border-white/10 p-5 rounded-[2rem] text-sm text-white outline-none focus:border-red-500/50 transition-all font-medium placeholder:opacity-30"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button type="submit" className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-black shadow-xl shadow-red-600/20 hover:bg-white active:scale-95 transition-all">
              <Send size={24} fill="currentColor" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}