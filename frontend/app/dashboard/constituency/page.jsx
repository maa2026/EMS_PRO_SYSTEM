"use client";
import { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck, BarChart3, MapPin, Users, Activity,
  LogOut, RefreshCw, ChevronRight, Globe, Vote, Zap,
  Wifi, WifiOff, Search, AlertCircle
} from "lucide-react";
import dynamic from "next/dynamic";

const BoothMap = dynamic(() => import("@/components/BoothMap"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-gray-700 text-[11px] font-black uppercase tracking-widest">
      Loading Map…
    </div>
  ),
});

export default function ConstituencyDashboard() {
  const [userName,        setUserName]        = useState("");
  const [userDistrict,    setUserDistrict]    = useState("");
  const [userConstituency,setUserConstituency]= useState("");
  const [userZone,        setUserZone]        = useState("");
  const [userEmsId,       setUserEmsId]       = useState("");

  const [boothStats,      setBoothStats]      = useState(null);
  const [loadingStats,    setLoadingStats]    = useState(true);
  const [onlineCount,     setOnlineCount]     = useState(null);
  const [lastRefreshed,   setLastRefreshed]   = useState(null);
  const [fetchError,      setFetchError]      = useState(false);

  useEffect(() => {
    const name  = localStorage.getItem("userName")        || "";
    const dist  = localStorage.getItem("userDistrict")   || "";
    const consti= localStorage.getItem("userConstituency")|| "";
    const zone  = localStorage.getItem("userZone")        || "";
    const ems   = localStorage.getItem("userEmsId")       || "";
    setUserName(name);
    setUserDistrict(dist);
    setUserConstituency(consti);
    setUserZone(zone);
    setUserEmsId(ems);
    if (dist) fetchBoothStats(dist, consti);
  }, []);

  const fetchBoothStats = useCallback(async (district, constituency) => {
    setLoadingStats(true);
    setFetchError(false);
    try {
      const params = new URLSearchParams({ district });
      if (constituency) params.set("constituency", constituency);
      const res  = await fetch(`/api/booths/stats?${params}`);
      const data = await res.json();
      if (data.success || data.total !== undefined) {
        setBoothStats(data);
        setLastRefreshed(new Date());
      }
    } catch (_) {
      setFetchError(true);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    const fetchOnline = async () => {
      try {
        const res  = await fetch("/api/workers/online-status");
        const data = await res.json();
        if (data.success) setOnlineCount(data.total ?? 0);
      } catch (_) {}
    };
    fetchOnline();
    const id = setInterval(fetchOnline, 15_000);
    return () => clearInterval(id);
  }, []);

  const handleLogout = () => {
    ["userId","userRole","userName","userDistrict","userBoothNo","userConstituency","userZone","userEmsId","userRoleLabel"]
      .forEach(k => localStorage.removeItem(k));
    ["userId","userRole","userName"].forEach(k => { document.cookie = `${k}=; max-age=0; path=/`; });
    window.location.href = "/login";
  };

  const statCards = [
    {
      label: "Constituency",
      value: userConstituency || "—",
      icon: Globe,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "District",
      value: userDistrict || "—",
      icon: MapPin,
      color: "text-green-400",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
    },
    {
      label: "Total Booths",
      value: loadingStats ? "…" : (boothStats?.total ?? boothStats?.totalBooths ?? "—"),
      icon: Vote,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
    },
    {
      label: "Online Workers",
      value: onlineCount !== null ? onlineCount.toLocaleString() : "…",
      icon: Zap,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 bg-[#050505]/95 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-[#DA251D] to-[#8B0000] rounded-xl flex items-center justify-center shadow-lg shadow-red-900/30">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">
                EMS.UP · Constituency Node
              </p>
              <p className="text-sm font-black text-white leading-tight">{userName || "Constituency Prabhari"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-black text-emerald-400 tracking-widest">LIVE</span>
            </div>
            {lastRefreshed && (
              <span className="text-[9px] text-gray-600 hidden md:block">
                {lastRefreshed.toLocaleTimeString("en-IN", { hour12: false })}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-[10px] text-white/40 hover:text-red-400 font-black uppercase tracking-widest transition-colors"
            >
              <LogOut size={12} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* ── PAGE TITLE ── */}
        <div className="mb-8 border-l-[6px] border-red-600 pl-6">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            CONSTITUENCY <span className="text-red-600">PRABHARI</span> NODE
          </h1>
          <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.4em] mt-1">
            L4 Admin · {userConstituency || "—"} · {userZone || "—"} · {userEmsId || "—"}
          </p>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ label, value, icon: Icon, color, bg, border }) => (
            <div key={label} className={`${bg} border ${border} rounded-2xl p-5`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className={color} />
                <span className="text-[9px] text-white/30 font-black uppercase tracking-widest">{label}</span>
              </div>
              <p className={`text-lg font-black ${color} truncate`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-5 gap-6 mb-8">

          {/* ── BOOTH MAP ── */}
          <div className="md:col-span-3 bg-white/[0.03] border border-white/[0.08] rounded-3xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h2 className="text-sm font-black uppercase tracking-widest text-white">Constituency Map</h2>
              {loadingStats && <RefreshCw size={13} className="text-white/30 animate-spin" />}
            </div>
            <div style={{ height: "380px" }} className="relative">
              {userDistrict ? (
                <BoothMap district={userDistrict} name={userConstituency} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-700 text-[11px] font-black uppercase tracking-widest">
                  No constituency assigned
                </div>
              )}
            </div>
          </div>

          {/* ── QUICK ACTIONS ── */}
          <div className="md:col-span-2 bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6 flex flex-col gap-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Quick Actions</h2>
            {[
              {
                href: "/dashboard/search-booth",
                icon: Search,
                label: "Booth Search",
                desc: "Search booth-wise voter data",
                color: "text-blue-400",
                bg: "bg-blue-500/10",
                border: "border-blue-500/20",
              },
              {
                href: "/voters",
                icon: Users,
                label: "Voter Search",
                desc: "Search individual voters",
                color: "text-purple-400",
                bg: "bg-purple-500/10",
                border: "border-purple-500/20",
              },
              {
                href: "/jan-sampark/voter-intelligence",
                icon: Activity,
                label: "Voter Intelligence",
                desc: "Household-level data",
                color: "text-green-400",
                bg: "bg-green-500/10",
                border: "border-green-500/20",
              },
              {
                href: "/war-room",
                icon: BarChart3,
                label: "War Room",
                desc: "Election command centre",
                color: "text-red-400",
                bg: "bg-red-500/10",
                border: "border-red-500/20",
              },
              {
                href: "/chat",
                icon: Zap,
                label: "Team Chat",
                desc: "Communicate with field workers",
                color: "text-yellow-400",
                bg: "bg-yellow-500/10",
                border: "border-yellow-500/20",
              },
            ].map(({ href, icon: Icon, label, desc, color, bg, border }) => (
              <a
                key={href}
                href={href}
                className={`flex items-center gap-4 ${bg} border ${border} rounded-2xl px-4 py-3 hover:bg-white/[0.06] transition-all group`}
              >
                <div className={`w-8 h-8 ${bg} border ${border} rounded-xl flex items-center justify-center shrink-0`}>
                  <Icon size={15} className={color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[11px] font-black uppercase tracking-wider ${color}`}>{label}</p>
                  <p className="text-[9px] text-white/30 font-semibold">{desc}</p>
                </div>
                <ChevronRight size={12} className="text-white/20 group-hover:text-white/50 shrink-0 transition-colors" />
              </a>
            ))}
          </div>
        </div>

        {/* ── BOOTH STATS TABLE ── */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Booth Summary</h2>
            <button
              onClick={() => fetchBoothStats(userDistrict, userConstituency)}
              className="flex items-center gap-1.5 text-[10px] text-white/40 hover:text-white/70 font-black uppercase tracking-widest transition-colors"
            >
              <RefreshCw size={11} /> Refresh
            </button>
          </div>

          {fetchError ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <AlertCircle size={28} className="text-red-400" />
              <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Failed to load booth data</p>
            </div>
          ) : loadingStats ? (
            <div className="flex items-center justify-center py-12 gap-3">
              <RefreshCw size={18} className="text-white/20 animate-spin" />
              <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Loading…</p>
            </div>
          ) : boothStats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/[0.05]">
              {[
                ["Total Booths",    boothStats.total        ?? boothStats.totalBooths  ?? "—"],
                ["Total Voters",    boothStats.totalVoters  ?? boothStats.voters       ?? "—"],
                ["Male Voters",     boothStats.maleVoters   ?? boothStats.male         ?? "—"],
                ["Female Voters",   boothStats.femaleVoters ?? boothStats.female       ?? "—"],
              ].map(([label, val]) => (
                <div key={label} className="p-6 text-center">
                  <p className="text-2xl font-black text-white">{typeof val === "number" ? val.toLocaleString() : val}</p>
                  <p className="text-[9px] text-white/30 font-black uppercase tracking-widest mt-1">{label}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">
                {userDistrict ? "No data found" : "Login info not set"}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
