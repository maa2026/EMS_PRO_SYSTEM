"use client";
import { useState, useEffect } from "react";
import {
  ShieldCheck, Users, MapPin, Activity, LogOut,
  CheckCircle2, Clock, AlertCircle, BarChart3, Phone,
  ChevronRight, Wifi, WifiOff, RefreshCw, Home
} from "lucide-react";

const ROLE_LABELS = {
  L5: "Booth President",
  L6: "Booth Manager",
};

export default function WarriorsNode() {
  const [userName,     setUserName]     = useState("");
  const [userRole,     setUserRole]     = useState("");
  const [userDistrict, setUserDistrict] = useState("");
  const [userConst,    setUserConst]    = useState("");
  const [userBoothNo,  setUserBoothNo]  = useState("");
  const [userEmsId,    setUserEmsId]    = useState("");
  const [roleLabel,    setRoleLabel]    = useState("");

  const [boothData,    setBoothData]    = useState(null);
  const [loadingBooth, setLoadingBooth] = useState(false);
  const [isOnline,     setIsOnline]     = useState(true);

  useEffect(() => {
    const name      = localStorage.getItem("userName")       || "";
    const role      = localStorage.getItem("userRole")       || "";
    const district  = localStorage.getItem("userDistrict")   || "";
    const consti    = localStorage.getItem("userConstituency")|| "";
    const booth     = localStorage.getItem("userBoothNo")    || "";
    const emsId     = localStorage.getItem("userEmsId")      || "";
    const rLabel    = localStorage.getItem("userRoleLabel")  || ROLE_LABELS[role] || role;

    setUserName(name);
    setUserRole(role);
    setUserDistrict(district);
    setUserConst(consti);
    setUserBoothNo(booth);
    setUserEmsId(emsId);
    setRoleLabel(rLabel);

    // Fetch booth data using stored info
    if (district && booth) {
      fetchBoothData(district, booth);
    }

    const handleOnline  = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    setIsOnline(navigator.onLine);
    window.addEventListener("online",  handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online",  handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const fetchBoothData = async (district, boothNo) => {
    setLoadingBooth(true);
    try {
      const res  = await fetch(`/api/booths?district=${encodeURIComponent(district)}&boothNo=${boothNo}`);
      const data = await res.json();
      if (data && (data.booths?.length > 0 || data.booth)) {
        setBoothData(data.booths?.[0] || data.booth || null);
      }
    } catch (_) {
      // Silently fail — booth data optional
    } finally {
      setLoadingBooth(false);
    }
  };

  const handleLogout = () => {
    ["userId","userRole","userName","userDistrict","userBoothNo",
     "userConstituency","userZone","userEmsId","userRoleLabel"]
      .forEach(k => localStorage.removeItem(k));
    ["userId","userRole","userName"].forEach(k => {
      document.cookie = `${k}=; max-age=0; path=/`;
    });
    window.location.href = "/login";
  };

  const statCards = [
    { label: "My Booth No.",  value: userBoothNo  || "—",    icon: MapPin,       color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20" },
    { label: "Constituency",  value: userConst    || "—",    icon: Home,         color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/20" },
    { label: "District",      value: userDistrict || "—",    icon: BarChart3,    color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
    { label: "Status",        value: isOnline ? "Online" : "Offline",
      icon: isOnline ? Wifi : WifiOff,
      color: isOnline ? "text-emerald-400" : "text-red-400",
      bg:    isOnline ? "bg-emerald-500/10" : "bg-red-500/10",
      border:isOnline ? "border-emerald-500/20" : "border-red-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-[#060c06] text-white font-sans">

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 bg-[#060c06]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-[#DA251D] to-[#8B0000] rounded-xl flex items-center justify-center shadow-lg shadow-red-900/30">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">
                EMS.UP Warriors Node
              </p>
              <p className="text-sm font-black text-white leading-tight">{userName || "Warrior"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${
              isOnline
                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                : "text-red-400 bg-red-500/10 border-red-500/20"
            }`}>
              {isOnline ? <Wifi size={10} /> : <WifiOff size={10} />}
              {isOnline ? "Live" : "Offline"}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-[10px] text-white/40 hover:text-red-400 font-black uppercase tracking-widest transition-colors"
            >
              <LogOut size={12} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* ── ROLE BADGE ── */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-white">
              {roleLabel || "Warriors"}{" "}
              <span className="text-[#DA251D]">Dashboard</span>
            </h1>
            <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em] mt-1">
              Booth-level Command Node &bull; {userEmsId || "—"}
            </p>
          </div>
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl px-5 py-3 text-right">
            <p className="text-[9px] text-white/30 font-black uppercase tracking-widest">Role Level</p>
            <p className="text-xl font-black text-[#DA251D]">{userRole}</p>
            <p className="text-[10px] text-white/50 font-semibold">{roleLabel}</p>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ label, value, icon: Icon, color, bg, border }) => (
            <div key={label} className={`${bg} border ${border} rounded-2xl p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className={color} />
                <span className="text-[9px] text-white/30 font-black uppercase tracking-widest">{label}</span>
              </div>
              <p className={`text-lg font-black ${color} truncate`}>{value}</p>
            </div>
          ))}
        </div>

        {/* ── BOOTH INFO CARD ── */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">

          <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-black uppercase tracking-widest text-white">
                Booth Details
              </h2>
              {loadingBooth && (
                <RefreshCw size={13} className="text-white/30 animate-spin" />
              )}
            </div>

            {boothData ? (
              <div className="space-y-3">
                {[
                  ["Booth Name",    boothData.boothName      || boothData.namE_OF_POLLING_STATION || "—"],
                  ["Booth No.",     boothData.boothNo        || userBoothNo || "—"],
                  ["Total Voters",  boothData.totalVoters    || boothData.totaL_VOTERS            || "—"],
                  ["Male Voters",   boothData.maleVoters     || boothData.malE_VOTERS             || "—"],
                  ["Female Voters", boothData.femaleVoters   || boothData.femalE_VOTERS           || "—"],
                  ["Address",       boothData.address        || boothData.addressS_OF_LOCATION    || "—"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-start border-b border-white/[0.05] pb-2 last:border-0">
                    <span className="text-[10px] text-white/30 font-black uppercase tracking-wider">{k}</span>
                    <span className="text-[11px] text-white font-semibold text-right max-w-[55%] leading-snug">{v}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <MapPin size={32} className="text-white/10" />
                <p className="text-[10px] text-white/20 font-black uppercase tracking-widest text-center">
                  {loadingBooth ? "Fetching booth data…" : "No booth data found"}
                </p>
              </div>
            )}
          </div>

          {/* ── QUICK ACTIONS ── */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-white mb-5">
              Quick Actions
            </h2>
            <div className="space-y-3">
              {[
                {
                  href: "/dashboard/search-booth",
                  icon: BarChart3,
                  label: "Search Booth Data",
                  desc: "View voter list, booth stats",
                  color: "text-blue-400",
                  bg: "bg-blue-500/10",
                  border: "border-blue-500/20",
                },
                {
                  href: "/jan-sampark/voter-intelligence",
                  icon: Users,
                  label: "Voter Intelligence",
                  desc: "Add household & voter data",
                  color: "text-green-400",
                  bg: "bg-green-500/10",
                  border: "border-green-500/20",
                },
                {
                  href: "/tracking",
                  icon: Activity,
                  label: "Track Application",
                  desc: "Check application status",
                  color: "text-yellow-400",
                  bg: "bg-yellow-500/10",
                  border: "border-yellow-500/20",
                },
                {
                  href: "/chat",
                  icon: Phone,
                  label: "Team Chat",
                  desc: "Connect with your team",
                  color: "text-purple-400",
                  bg: "bg-purple-500/10",
                  border: "border-purple-500/20",
                },
              ].map(({ href, icon: Icon, label, desc, color, bg, border }) => (
                <a
                  key={href}
                  href={href}
                  className={`flex items-center gap-4 ${bg} border ${border} rounded-2xl px-4 py-3.5 hover:bg-white/[0.06] transition-all group`}
                >
                  <div className={`w-8 h-8 ${bg} border ${border} rounded-xl flex items-center justify-center shrink-0`}>
                    <Icon size={15} className={color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] font-black uppercase tracking-wider ${color}`}>{label}</p>
                    <p className="text-[9px] text-white/30 font-semibold">{desc}</p>
                  </div>
                  <ChevronRight size={13} className="text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── IMPORTANT NOTICES ── */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-white mb-5">
            Instructions &amp; Notices
          </h2>
          <div className="space-y-3">
            {[
              { type: "info",    text: "Booth data entry must be completed before 6 PM daily." },
              { type: "success", text: "Jan Sampark data synced successfully — keep updating." },
              { type: "warning", text: "Ensure all booth visitors are added to voter intelligence." },
            ].map(({ type, text }, i) => {
              const cfg = {
                info:    { icon: AlertCircle,  color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20" },
                success: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
                warning: { icon: Clock,        color: "text-yellow-400",  bg: "bg-yellow-500/10",  border: "border-yellow-500/20" },
              }[type];
              const Icon = cfg.icon;
              return (
                <div key={i} className={`flex items-start gap-3 ${cfg.bg} border ${cfg.border} rounded-xl px-4 py-3`}>
                  <Icon size={13} className={`${cfg.color} mt-0.5 shrink-0`} />
                  <p className="text-[11px] text-white/60 font-semibold leading-relaxed">{text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
