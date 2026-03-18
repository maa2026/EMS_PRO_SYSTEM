// @ts-nocheck
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Lock, User, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      return alert("ID aur Password daaliye!");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        const expiry = "; max-age=" + 7 * 24 * 60 * 60 + "; path=/";
        document.cookie = "userId="   + data.user.id   + expiry;
        document.cookie = "userRole=" + data.user.role + expiry;
        document.cookie = "userName=" + encodeURIComponent(data.user.name) + expiry;

        localStorage.setItem("userId",           data.user.id           || "");
        localStorage.setItem("userRole",         data.user.role         || "");
        localStorage.setItem("userName",         data.user.name         || "");
        localStorage.setItem("userRoleLabel",    data.user.roleLabel    || "");
        localStorage.setItem("userZone",         data.user.zone         || "");
        localStorage.setItem("userDistrict",     data.user.district     || "");
        localStorage.setItem("userConstituency", data.user.constituency || "");
        localStorage.setItem("userBoothNo",      data.user.boothNo      || "");
        localStorage.setItem("userEmsId",        data.user.emsId        || "");

        // Role → Dashboard routing
        const ROLE_ROUTES: Record<string, string> = {
          L0: "/dashboard/admin/main",              // Super Admin
          L1: "/dashboard/admin/state",             // State Admin
          L2: "/zone-monitor",                      // Zone Admin
          L3: "/district-admin",                    // District Admin
          L4: "/dashboard/constituency",           // Constituency Prabhari
          L5: "/warriors-node",                     // Booth President
          L6: "/warriors-node",                     // Booth Manager
          L7: "/jan-sampark/voter-intelligence",    // Jan Sampark Sathi
        };
        const targetPath = ROLE_ROUTES[data.user.role] || "/dashboard/admin/main";

        window.location.href = window.location.origin + targetPath;
      } else {
        alert("⚠️ " + (data.message || "Invalid Credentials"));
      }
    } catch (err) {
      console.error("Login Error:", err);
      alert("❌ Backend se connection nahi hua. Server check karein.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#020c06] px-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#DA251D]/5 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="w-14 h-14 bg-gradient-to-br from-[#DA251D] to-[#8B0000] rounded-2xl flex items-center justify-center shadow-xl shadow-red-900/40">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-black tracking-tight text-white">
              EMS<span className="text-[#DA251D]">.</span>UP
            </h1>
            <p className="text-[11px] text-white/30 font-semibold tracking-[0.15em] uppercase mt-0.5">
              Secure System Login
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 backdrop-blur-xl shadow-[0_32px_80px_rgba(0,0,0,0.6)]">
          <form onSubmit={handleLogin} className="flex flex-col gap-5">

            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                Username / ID
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 text-sm font-medium rounded-xl pl-9 pr-4 py-3 focus:outline-none focus:border-[#DA251D]/40 focus:bg-white/[0.06] transition-all"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 text-sm font-medium rounded-xl pl-9 pr-10 py-3 focus:outline-none focus:border-[#DA251D]/40 focus:bg-white/[0.06] transition-all"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-gradient-to-r from-[#DA251D] to-[#b01e17] hover:from-[#c0211a] hover:to-[#9a1a13] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-[11px] tracking-widest uppercase py-3.5 rounded-xl shadow-lg shadow-[#DA251D]/25 active:scale-[0.98] transition-all duration-200 border border-white/10"
            >
              {loading ? "Verifying..." : "Login to System"}
            </button>

          </form>

          {/* Footer links */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <Link href="/signup" className="text-[10px] text-white/30 hover:text-white/60 font-semibold tracking-wider transition-colors">
              New Enrollment
            </Link>
            <span className="text-white/10">|</span>
            <Link href="/" className="text-[10px] text-white/30 hover:text-white/60 font-semibold tracking-wider transition-colors">
              Back to Home
            </Link>
          </div>
        </div>

        {/* Security note */}
        <p className="text-center text-[9px] text-white/15 font-semibold tracking-widest uppercase mt-6">
          Secured &bull; Encrypted &bull; Monitored
        </p>
      </div>
    </main>
  );
}

