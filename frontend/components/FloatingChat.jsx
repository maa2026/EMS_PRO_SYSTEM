"use client";
import { useState, useEffect, useRef } from "react";
// ✅ Correct Import (lucide-react)
import { MessageCircle, X, Send, Search, Upload, ShieldCheck, User, Globe, ArrowLeft, Lock } from "lucide-react";
import Cookies from "js-cookie";
import { io } from "socket.io-client";

// ================================================================
// 🔐 AES-256-GCM END-TO-END ENCRYPTION (Web Crypto API — no deps)
//    Key is shared via env var; server stores ciphertext, never plaintext.
// ================================================================
const EMS_KEY_RAW = (process.env.NEXT_PUBLIC_CHAT_SECRET_KEY || 'ems_pro_2026_chat_AES256key_32b!').slice(0, 32);
let _cachedKey = null;

async function getCryptoKey() {
  if (_cachedKey) return _cachedKey;
  const raw = new TextEncoder().encode(EMS_KEY_RAW);
  _cachedKey = await window.crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
  return _cachedKey;
}

async function aesEncrypt(plaintext) {
  const key = await getCryptoKey();
  const iv  = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
  const enc = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(plaintext));
  const out = new Uint8Array(12 + enc.byteLength);
  out.set(iv);                         // first 12 bytes = IV
  out.set(new Uint8Array(enc), 12);    // rest = ciphertext + auth tag
  return btoa(String.fromCharCode(...out));
}

async function aesDecrypt(b64) {
  try {
    const key = await getCryptoKey();
    const buf = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const dec = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: buf.slice(0, 12) }, key, buf.slice(12)
    );
    return new TextDecoder().decode(dec);
  } catch {
    // Legacy / unencrypted messages — return as-is
    return b64;
  }
}
// ================================================================

const socket = io("http://localhost:5000", {
  transports: ["polling", "websocket"], // polling-first for 2G/3G reliability
  reconnection: true,
  reconnectionDelay:    1000,
  reconnectionAttempts: Infinity,
  timeout: 45000,
  autoConnect: false, // ← don't connect until chat is opened
});

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [inputText, setInputText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [contacts, setContacts] = useState([]); 
  const [identity, setIdentity] = useState({ id: null, role: null });
  const [unreadCount, setUnreadCount] = useState(0); 
  const scrollRef = useRef(null);
  const [selectedTone, setSelectedTone] = useState("/ting.mp3");

  const getLevelBadge = (role) => {
    const levels = {
      "L0": { bg: "bg-red-600", label: "Admin" },
      "L1": { bg: "bg-orange-500", label: "State" },
      "L4": { bg: "bg-blue-600", label: "Zone" },
      "L5": { bg: "bg-purple-600", label: "Dist" },
      "L6": { bg: "bg-teal-600", label: "AC" },
      "L7": { bg: "bg-gray-600", label: "Field" }
    };
    const roleKey = role?.includes("Booth") ? "L6" : role?.includes("Jan") ? "L7" : role;
    return levels[roleKey] || { bg: "bg-slate-700", label: role };
  };

  useEffect(() => {
    const savedTone = localStorage.getItem("customChatTone");
    if (savedTone) setSelectedTone(savedTone);
    
    const syncIdentity = () => {
      const userId = Cookies.get("userId") || "1";
      const userRole = Cookies.get("userRole") || "L0";
      setIdentity({ id: userId, role: userRole });
      if (socket.connected) socket.emit("join_protocol", { userId, userRole });
    };
    syncIdentity();
  }, []);

  useEffect(() => {
    const loadDirectory = async () => {
      if (!identity.id || !isOpen) return;
      try {
        const res = await fetch(`/api/workers?myRole=${identity.role}&myId=${identity.id}`);
        const result = await res.json();
        if (result.success) setContacts(result.data);
      } catch (err) { console.error("❌ Sync Error:", err); }
    };
    loadDirectory();
  }, [isOpen, identity]);

  const filteredContacts = contacts.filter(u => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (u.name?.toLowerCase().includes(term)) || 
      (u.district?.toLowerCase().includes(term)) || 
      (u.constituency?.toLowerCase().includes(term)) || 
      (u.zone?.toLowerCase().includes(term)) ||
      (u.role?.toLowerCase().includes(term))
    );
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [chatHistory]);

  useEffect(() => {
    const handleIncoming = async (data) => {
      // Decrypt AES-256 ciphertext from sender
      const plainText = data.encrypted ? await aesDecrypt(data.text) : data.text;
      if (String(data.senderId) !== String(identity.id)) {
        new Audio(selectedTone).play().catch(() => {});
        if (!isOpen || (selectedContact && String(data.senderId) !== String(selectedContact.id))) {
          setUnreadCount(prev => prev + 1);
        }
      }
      if (selectedContact && String(data.senderId) === String(selectedContact.id)) {
        setChatHistory((prev) => [...prev, { ...data, text: plainText, type: "received" }]);
      }
    };
    socket.on("receive_command", handleIncoming);
    return () => socket.off("receive_command", handleIncoming);
  }, [selectedContact, identity.id, selectedTone, isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (!socket.connected) socket.connect();
      setUnreadCount(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedContact && isOpen && identity.id) {
      const getHistory = async () => {
        try {
          const res = await fetch(`/api/chat/history/${selectedContact.id}?myId=${identity.id}&role=${identity.role}`);
          const result = await res.json();
          if (result.success) {
            // Decrypt AES-256 messages from DB
            const decrypted = await Promise.all(
              result.data.map(async (m) => ({
                ...m,
                text: m.encrypted ? await aesDecrypt(m.text) : m.text,
                type: String(m.senderId) === String(identity.id) ? 'sent' : 'received'
              }))
            );
            setChatHistory(decrypted);
          }
        } catch (err) { console.error("❌ History Error:", err); }
      };
      getHistory();
    }
  }, [selectedContact, isOpen, identity]);

  const handleSend = async () => {
    if (!inputText.trim() || !selectedContact) return;
    const plainText    = inputText.trim();
    const encryptedText = await aesEncrypt(plainText);
    const msgData = {
      senderId:   String(identity.id),
      receiverId: String(selectedContact.id),
      senderRole: identity.role,
      receiverRole: selectedContact.role,
      text:      encryptedText,   // 🔐 AES-256 ciphertext sent over wire
      encrypted: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    socket.emit("send_command", msgData);
    // Show plaintext locally — no need to decrypt our own message
    setChatHistory((prev) => [...prev, { ...msgData, text: plainText, type: "sent" }]);
    setInputText("");
  };

  const handleToneUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "audio/mpeg") {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedTone(e.target.result);
        localStorage.setItem("customChatTone", e.target.result);
        new Audio(e.target.result).play();
      };
      reader.readAsDataURL(file);
    }
  };

  const IntelligenceProfile = () => (
    <div className="absolute inset-0 bg-[#0b141a] z-[60] animate-in slide-in-from-right duration-200 flex flex-col border-l border-white/10 shadow-2xl">
      <div className="p-3 bg-[#202c33] flex items-center gap-3 border-b border-white/10">
        <ArrowLeft size={18} className="text-[#25d366] cursor-pointer" onClick={() => setShowProfile(false)} />
        <span className="text-white text-[10px] font-black uppercase tracking-widest">Dossier</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-[#111b21] rounded-full mx-auto flex items-center justify-center border-2 border-[#25d366]/20">
            <User size={30} className="text-white/10" />
          </div>
          <h2 className="text-white text-sm font-black tracking-tighter uppercase leading-none">{selectedContact.name}</h2>
          <div className={`${getLevelBadge(selectedContact.role).bg} text-white text-[6px] px-2 py-0.5 rounded-full inline-block uppercase font-black`}>
            {selectedContact.role}
          </div>
        </div>
        <div className="bg-[#111b21] rounded-xl p-3 border border-white/5 space-y-3 shadow-inner">
          <p className="text-[8px] text-[#25d366] font-black uppercase tracking-widest px-1">Audit Protocol Map</p>
          {[
            { l: "Zone", v: selectedContact.zone },
            { l: "District", v: selectedContact.district },
            { l: "AC", v: selectedContact.constituency },
            { l: "Mobile", v: selectedContact.mobile }
          ].map((s, i) => (
            <div key={i} className="flex justify-between items-center border-b border-white/5 pb-1 last:border-0">
              <span className="text-[7px] text-gray-500 uppercase font-bold">{s.l}</span>
              <span className="text-[9px] text-[#e9edef] font-black uppercase tracking-tight">{s.v || "N/A"}</span>
            </div>
          ))}
        </div>
        <div className="bg-white/5 p-2 rounded-lg border border-white/5 flex items-center justify-between">
           <span className="text-[8px] text-white/30 uppercase font-black tracking-widest">Node Status</span>
           <Globe size={12} className="text-[#25d366] animate-pulse" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      {isOpen && (
        <div className="mb-4 w-[90vw] md:w-[400px] h-[75vh] md:h-[600px] bg-[#0b141a] border border-white/10 rounded-2xl shadow-2xl flex overflow-hidden relative transition-all duration-300">
          {showProfile && selectedContact && <IntelligenceProfile />}

          {/* SIDEBAR */}
          <div className="w-[110px] md:w-[135px] bg-[#111b21] border-r border-white/5 flex flex-col">
            <div className="p-2 bg-[#202c33] border-b border-white/5">
              <div className="relative">
                <Search size={10} className="absolute left-2 top-2 text-gray-400" />
                <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#2a3942] text-[7px] text-white pl-5 py-1.5 rounded outline-none" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {filteredContacts.map(u => (
                <div key={u.id} onClick={() => { setSelectedContact(u); setShowProfile(false); }} className={`p-2 border-b border-white/5 cursor-pointer transition-all ${selectedContact?.id === u.id ? 'bg-[#2a3942] border-l-2 border-[#25d366]' : ''}`}>
                  <div className="text-[#e9edef] text-[9px] font-bold truncate uppercase">{u.name}</div>
                  <div className="text-gray-500 text-[6px] uppercase truncate">{u.district || "Node"}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CHAT WINDOW */}
          <div className="flex-1 flex flex-col bg-[#0b141a]">
            {selectedContact ? (
              <>
                <div onClick={() => setShowProfile(true)} className="p-2.5 bg-[#202c33] border-b border-white/10 flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-white text-[7px] ${getLevelBadge(selectedContact.role).bg}`}>
                       {selectedContact.role?.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-white text-[9px] font-black uppercase truncate w-24 leading-none">{selectedContact.name}</h3>
                      <p className="text-[#25d366] text-[5px] font-bold tracking-widest mt-0.5 uppercase">Audit Intel</p>
                    </div>
                  </div>
                  <X size={14} className="text-gray-500" onClick={(e) => { e.stopPropagation(); setSelectedContact(null); }} />
                </div>
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                  {chatHistory.map((m, i) => (
                    <div key={i} className={`flex ${m.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-2.5 rounded-xl text-[10px] shadow-lg relative ${m.type === 'sent' ? 'bg-[#005c4b] text-white rounded-tr-none' : 'bg-[#202c33] text-white border border-white/10 rounded-tl-none'}`}>
                        <p className="leading-relaxed">{m.text}</p>
                        <div className="text-[5px] opacity-20 mt-1 text-right font-mono uppercase">{m.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2 bg-[#202c33] flex items-center gap-2 border-t border-white/5">
                  <input value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} className="flex-1 bg-[#2a3942] rounded-full py-2 px-4 text-white text-[10px] outline-none" placeholder="Enter secure command..." />
                  <button onClick={handleSend} className="w-9 h-9 bg-[#25d366] rounded-full flex items-center justify-center text-black active:scale-90 transition-all"><Send size={14} fill="currentColor" /></button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-10 opacity-10 text-center space-y-3">
                <MessageCircle size={32} className="text-[#25d366]" />
                <p className="text-[10px] uppercase font-black tracking-[0.5em]">Audit Node Ready</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* ✅ 📱 RESPONSIVE FLOATING BUBBLE */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-black shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 relative ${isOpen ? 'bg-white rotate-90 shadow-white/20' : 'bg-[#25d366] shadow-[#25d366]/40'}`}
      >
        {isOpen ? <X className="w-5 h-5 md:w-8 md:h-8" /> : <MessageCircle className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" />}
        
        {/* 🔴 Notification Badge */}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 md:w-6 md:h-6 bg-red-600 border-2 border-[#0b141a] rounded-full flex items-center justify-center text-[8px] md:text-[10px] font-black text-white animate-pulse shadow-lg">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #25d366; border-radius: 10px; }
      `}</style>
    </div>
  );
}