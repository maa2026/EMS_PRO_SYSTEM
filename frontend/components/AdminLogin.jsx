"use client";
import React, { useState } from 'react';

const AdminLogin = ({ close }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    
    // 🛡️ Admin Ram Lakhan Security Logic
    if (username === "admin" && password === "1234") {
      alert("✅ Access Granted: Welcome Admin Ram Lakhan");
      localStorage.setItem('isLoggedIn', 'true'); // Session save logic
      close(); // Popup band karne ke liye
    } else {
      alert("❌ Unauthorized Access Denied!");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      {/* Glassmorphism Card */}
      <div className="elite-card max-w-md w-full p-8 border border-white/10 relative bg-black/40 shadow-2xl">
        
        {/* Close Button */}
        <button 
          onClick={close} 
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors text-xl"
        >
          ✕
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-black tracking-tighter uppercase text-[#DA251D]">Admin Access</h2>
          <p className="text-[10px] text-gray-400 mt-2 font-mono uppercase tracking-[0.3em]">Authorized Personnel Only</p>
        </div>

        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2 ml-1">Officer ID</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none transition-all placeholder:text-gray-700 text-white" 
              placeholder="Enter Admin Username" 
              required
            />
          </div>
          
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2 ml-1">Access Key</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none transition-all placeholder:text-gray-700 text-white" 
              placeholder="••••••••" 
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full neon-glow-red py-4 rounded-xl font-bold uppercase tracking-widest text-sm mt-4 active:scale-95 transition-transform"
          >
            Verify & Authenticate
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-[9px] text-gray-600 uppercase tracking-tighter">
            System Protocol: <span className="text-gray-400">ADMIN RAM LAKHAN V.2</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;