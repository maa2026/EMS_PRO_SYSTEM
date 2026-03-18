"use client";
// ════════════════════════════════════════════════════════════════
//  SOCIAL MEDIA INTELLIGENCE COMMAND — Akhilesh Yadav / SP 2026
//  Track all Indian + global platforms · Sentiment · PR · Trends
// ════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback, useRef } from "react";
import {
  TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle2,
  RefreshCw, Search, Bell, Zap, Eye, MessageSquare, Share2,
  Heart, ThumbsDown, ThumbsUp, Star, Globe, Radio, Target,
  BarChart3, Flame, ArrowUpRight, ArrowDownRight, Minus,
  Filter, Download, Calendar, Clock, ChevronRight, Shield,
  Crosshair, Wifi, WifiOff, Volume2, Users, Hash, LogOut,
} from "lucide-react";

// ── Seeded random (reproducible) ──────────────────────────────
const seed = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
};
const sr = (s, min, max) => min + (seed(s) % (max - min + 1));

// ══════════════════════════════════════════════════════════════
//  DATA CONFIGURATION
// ══════════════════════════════════════════════════════════════

const CANDIDATE = {
  name: "Akhilesh Yadav",
  party: "Samajwadi Party",
  role: "National President, SP",
  handle: "@yadavakhilesh",
  state: "Uttar Pradesh",
  tagline: "UP ke neta, desh ki awaaz",
  color: "#DA251D",
  accent: "#ff5f52",
};

const RIVAL = {
  name: "Yogi Adityanath",
  party: "BJP",
  handle: "@myogiadityanath",
  color: "#FF6B00",
};

// ── All Indian + Global platforms ─────────────────────────────
const PLATFORMS = [
  { id: "twitter",    name: "X / Twitter",     icon: "𝕏",   color: "#1DA1F2", accent: "#0d8bde", base: 58, neg: 26, neu: 16, mentions: 284000, trend: +12 },
  { id: "facebook",   name: "Facebook",         icon: "f",   color: "#1877F2", accent: "#1465d6", base: 62, neg: 22, neu: 16, mentions: 192000, trend: +8  },
  { id: "instagram",  name: "Instagram",        icon: "◉",   color: "#E1306C", accent: "#c42761", base: 71, neg: 15, neu: 14, mentions: 156000, trend: +18 },
  { id: "youtube",    name: "YouTube",          icon: "▶",   color: "#FF0000", accent: "#cc0000", base: 54, neg: 29, neu: 17, mentions: 98000,  trend: -5  },
  { id: "whatsapp",   name: "WhatsApp",         icon: "💬",  color: "#25D366", accent: "#1fba56", base: 67, neg: 20, neu: 13, mentions: 412000, trend: +22 },
  { id: "koo",        name: "Koo",              icon: "K",   color: "#FFCB00", accent: "#e6b800", base: 73, neg: 12, neu: 15, mentions: 48000,  trend: +31 },
  { id: "sharechat",  name: "ShareChat",        icon: "S",   color: "#5A44F2", accent: "#4a36e0", base: 69, neg: 18, neu: 13, mentions: 87000,  trend: +14 },
  { id: "moj",        name: "Moj",              icon: "M",   color: "#FF4081", accent: "#e73574", base: 75, neg: 14, neu: 11, mentions: 64000,  trend: +28 },
  { id: "josh",       name: "Josh",             icon: "J",   color: "#00C2FF", accent: "#00a8e0", base: 72, neg: 15, neu: 13, mentions: 52000,  trend: +19 },
  { id: "linkedin",   name: "LinkedIn",         icon: "in",  color: "#0A66C2", accent: "#0855a8", base: 60, neg: 18, neu: 22, mentions: 28000,  trend: +6  },
  { id: "reddit",     name: "Reddit India",     icon: "r/",  color: "#FF4500", accent: "#e03d00", base: 42, neg: 38, neu: 20, mentions: 18000,  trend: -11 },
  { id: "telegram",   name: "Telegram",         icon: "✈",   color: "#26A5E4", accent: "#1e8fcb", base: 65, neg: 21, neu: 14, mentions: 72000,  trend: +9  },
  { id: "google",     name: "Google Trends",    icon: "G",   color: "#4285F4", accent: "#3370e0", base: 55, neg: 24, neu: 21, mentions: 320000, trend: +4  },
  { id: "news",       name: "News Portals",     icon: "📰",  color: "#6B7280", accent: "#4b5563", base: 48, neg: 33, neu: 19, mentions: 240000, trend: -3  },
];

// ── Districts of UP with sentiment ────────────────────────────
const UP_DISTRICTS = [
  "Lucknow","Agra","Varanasi","Kanpur","Meerut","Gorakhpur","Allahabad","Mainpuri","Etawah","Firozabad",
  "Azamgarh","Jhansi","Mathura","Aligarh","Moradabad","Bareilly","Saharanpur","Ghaziabad","Noida","Lakhimpur Kheri",
  "Sultanpur","Amethi","Raebareli","Barabanki","Faizabad","Sitapur","Hardoi","Unnao","Fatehpur","Jaunpur",
];

// ── Trending hashtags ─────────────────────────────────────────
const HASHTAGS = [
  { tag: "#AkhileshYadav",        count: "2.4M",  trend: +45, sentiment: "positive" },
  { tag: "#SamajwadiParty",       count: "1.8M",  trend: +32, sentiment: "positive" },
  { tag: "#UPKiAwaaz",            count: "984K",  trend: +28, sentiment: "positive" },
  { tag: "#SPSarkar2026",         count: "762K",  trend: +52, sentiment: "positive" },
  { tag: "#KissanKiAwaaz",        count: "612K",  trend: +18, sentiment: "positive" },
  { tag: "#BJPVirodhi",           count: "448K",  trend: +14, sentiment: "neutral"  },
  { tag: "#YouthWithAkhilesh",    count: "394K",  trend: +67, sentiment: "positive" },
  { tag: "#LaptopYojana",         count: "#288K", trend: -8,  sentiment: "negative" },
  { tag: "#AkhileshScam",         count: "182K",  trend: +11, sentiment: "negative" },
  { tag: "#SamajwadiSarkar",      count: "156K",  trend: +22, sentiment: "positive" },
];

// ── Live mentions feed ────────────────────────────────────────
const FEED_TEMPLATES = [
  { s: "positive", t: "Twitter",   m: "Akhilesh ji ka Kisan Samman speech bahut achha laga! Real leader #SPSarkar2026" },
  { s: "negative", t: "Reddit",    m: "SP party ka koi vision nahi hai. Same promises every election." },
  { s: "positive", t: "Instagram", m: "🔥 Akhilesh Yadav Lucknow rally VIRAL! 2 lakh log the! #UPKiAwaaz" },
  { s: "neutral",  t: "Facebook",  m: "SP announced new manifesto. Let's wait and watch the implementation." },
  { s: "positive", t: "Koo",       m: "Akhilesh bhai ne aaj Gorakhpur mein kya speech di! Goosebumps! 💪" },
  { s: "positive", t: "WhatsApp",  m: "SP sarkar mein UP ka vikas hua tha, dobara chance do unhe." },
  { s: "negative", t: "YouTube",   m: "SP era mein UP mein bahut crimes the. Ye log desh nahi chalane chahte." },
  { s: "positive", t: "ShareChat", m: "Akhilesh Yadav hi UP ka asli neta hain 🙏 #AkhileshYadav trending" },
  { s: "neutral",  t: "LinkedIn",  m: "Analyzing SP's economic promises — some merit but implementation unclear." },
  { s: "positive", t: "Moj",       m: "Akhilesh ji ke saath UP badal raha hain! New India 2026 🇮🇳" },
  { s: "negative", t: "Twitter",   m: "SP government only cares about one caste. Where is development?" },
  { s: "positive", t: "Telegram",  m: "SP Youth Brigade banayi ja rahi hai! 25 lakh yuva judenge. Wah!!" },
  { s: "positive", t: "Josh",      m: "Akhilesh LIVE reel viral ho raha hai — 10M views in 3 hours!" },
  { s: "negative", t: "Facebook",  m: "SP ka gunda raj wapas nahi chahiye UP mein. #BJPVirodhi" },
  { s: "positive", t: "Twitter",   m: "Akhilesh Yadav's UP infrastructure plan is actually solid. #Development" },
  { s: "neutral",  t: "News",      m: "SP releases 100-day action plan — analysts divided on feasibility." },
];

// ── PR Campaign ideas ─────────────────────────────────────────
const PR_CAMPAIGNS = [
  { name: "Kisan Samman Yatra",   platform: "All",       status: "active",  reach: "12.4M",  sentiment: 78, startDate: "Mar 10" },
  { name: "Youth Connect 2026",   platform: "Instagram", status: "active",  reach: "8.2M",   sentiment: 84, startDate: "Mar 12" },
  { name: "UP Badal Raha Hai",    platform: "YouTube",   status: "active",  reach: "6.8M",   sentiment: 72, startDate: "Mar 08" },
  { name: "WhatsApp Ground Blitz",platform: "WhatsApp",  status: "active",  reach: "18.1M",  sentiment: 69, startDate: "Mar 14" },
  { name: "Laptop Yojana Remind", platform: "Facebook",  status: "paused",  reach: "4.2M",   sentiment: 61, startDate: "Mar 01" },
  { name: "Virodhi Expose Reel",  platform: "Instagram", status: "planned", reach: "—",       sentiment: 0,  startDate: "Mar 20" },
];

// ── News sources ──────────────────────────────────────────────
const NEWS_ITEMS = [
  { source: "NDTV",         title: "Akhilesh Yadav announces 'Samajwadi Guarantee' for UP 2026",                 time: "2 hours ago",  sentiment: "positive" },
  { source: "India Today",  title: "SP rally draws massive crowd in Lucknow amid election fever",                time: "4 hours ago",  sentiment: "positive" },
  { source: "Dainik Jagran",title: "Akhilesh Yadav ka vidhansabha chunav se pehle naya vada",                   time: "5 hours ago",  sentiment: "neutral"  },
  { source: "Times of India",title: "Samajwadi Party's social media surge: 45% increase in positive mentions",  time: "6 hours ago",  sentiment: "positive" },
  { source: "Aaj Tak",      title: "SP-Congress alliance: Will it shift UP's political equation?",              time: "8 hours ago",  sentiment: "neutral"  },
  { source: "The Hindu",    title: "Akhilesh Yadav targets BJP over unemployment, price rise",                   time: "10 hours ago", sentiment: "positive" },
  { source: "Zee News",     title: "BJP hits back at SP over law & order allegations from 2012-17",             time: "12 hours ago", sentiment: "negative" },
  { source: "ABP Live",     title: "Akhilesh Yadav's Mainpuri base — can SP hold stronghold in 2026?",         time: "14 hours ago", sentiment: "neutral"  },
];

// ── Simulate sentiment change over 24hrs ─────────────────────
const TIMELINE = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, "0")}:00`,
  positive: 45 + sr(`pos${i}`, 0, 25),
  negative: 15 + sr(`neg${i}`, 0, 18),
  mentions: 8000 + sr(`men${i}`, 0, 28000),
}));

// sentimentCls helper
const sentimentCfg = (s) => ({
  positive: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", dot: "bg-emerald-400", label: "Positive" },
  negative: { color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/20",     dot: "bg-red-400",     label: "Negative" },
  neutral:  { color: "text-yellow-400",  bg: "bg-yellow-500/10",  border: "border-yellow-500/20",  dot: "bg-yellow-400",  label: "Neutral" },
}[s] || { color: "text-gray-400", bg: "bg-gray-500/10", border: "border-gray-500/20", dot: "bg-gray-400", label: "Unknown" });

const trendIcon = (t) => t > 0 ? <ArrowUpRight size={11} className="text-emerald-400" /> : t < 0 ? <ArrowDownRight size={11} className="text-red-400" /> : <Minus size={11} className="text-gray-400" />;

// ══════════════════════════════════════════════════════════════
//  COMPONENTS
// ══════════════════════════════════════════════════════════════

// Circular sentiment arc
const SentimentArc = ({ positive, negative, neutral, size = 120 }) => {
  const r = 40; const cx = 60; const cy = 60;
  const cir = 2 * Math.PI * r;
  const posLen = (positive / 100) * cir;
  const negLen = (negative / 100) * cir;
  const neuLen = (neutral / 100) * cir;
  const posOff = 0;
  const negOff = cir - posLen;
  const neuOff = cir - posLen - negLen;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className="rotate-[-90deg]">
      {/* bg */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="14" />
      {/* neutral */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#EAB308" strokeWidth="13"
        strokeDasharray={`${neuLen} ${cir}`} strokeDashoffset={-neuOff} strokeLinecap="round" />
      {/* negative */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#EF4444" strokeWidth="13"
        strokeDasharray={`${negLen} ${cir}`} strokeDashoffset={-negOff} strokeLinecap="round" />
      {/* positive */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#22C55E" strokeWidth="13"
        strokeDasharray={`${posLen} ${cir}`} strokeDashoffset={-posOff} strokeLinecap="round" />
    </svg>
  );
};

// Platform card
const PlatformCard = ({ p, onClick, selected }) => {
  const neg = p.neg; const neu = p.neu; const pos = p.base;
  const fmt = (n) => n >= 1000000 ? (n / 1000000).toFixed(1) + "M" : n >= 1000 ? (n / 1000).toFixed(0) + "K" : String(n);
  return (
    <button onClick={() => onClick(p.id)}
      className={`w-full text-left p-4 rounded-2xl border transition-all ${
        selected ? "border-white/20 bg-white/[0.07]" : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05]"
      }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0"
            style={{ background: p.color + "22", color: p.color, border: `1px solid ${p.color}33` }}>
            {p.icon}
          </div>
          <div>
            <p className="text-[11px] font-black text-white">{p.name}</p>
            <p className="text-[9px] text-white/30 font-semibold">{fmt(p.mentions)} mentions</p>
          </div>
        </div>
        <span className={`flex items-center gap-0.5 text-[9px] font-black ${p.trend > 0 ? "text-emerald-400" : "text-red-400"}`}>
          {trendIcon(p.trend)}{Math.abs(p.trend)}%
        </span>
      </div>
      {/* Sentiment bar */}
      <div className="h-2 rounded-full overflow-hidden flex gap-px">
        <div className="h-full rounded-l-full" style={{ width: `${pos}%`, background: "#22C55E" }} />
        <div className="h-full"                style={{ width: `${neu}%`, background: "#EAB308" }} />
        <div className="h-full rounded-r-full" style={{ width: `${neg}%`, background: "#EF4444" }} />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[8px] text-emerald-400 font-black">{pos}% +</span>
        <span className="text-[8px] text-yellow-400 font-black">{neu}% ~</span>
        <span className="text-[8px] text-red-400 font-black">{neg}% −</span>
      </div>
    </button>
  );
};

// Timeline spark line (CSS bars)
const TimelineBar = ({ data }) => {
  const max = Math.max(...data.map(d => d.mentions));
  return (
    <div className="flex items-end gap-0.5 h-16 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group/bar relative"
          title={`${d.hour}: ${d.positive}% positive, ${d.mentions.toLocaleString()} mentions`}>
          <div className="w-full rounded-sm transition-all duration-200 group-hover/bar:opacity-100 opacity-80"
            style={{
              height: `${(d.mentions / max) * 56}px`,
              background: d.positive > 60
                ? "linear-gradient(to top,#16a34a,#22c55e)"
                : d.positive > 45
                ? "linear-gradient(to top,#ca8a04,#eab308)"
                : "linear-gradient(to top,#dc2626,#ef4444)",
            }} />
        </div>
      ))}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
//  MAIN PAGE
// ══════════════════════════════════════════════════════════════
export default function SocialIntelligence() {
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [filter, setFilter]                     = useState("all");  // all|positive|negative|neutral
  const [liveTime, setLiveTime]                 = useState(new Date());
  const [feedItems, setFeedItems]               = useState(FEED_TEMPLATES);
  const [alertCount, setAlertCount]             = useState(3);
  const [isLive, setIsLive]                     = useState(true);
  const [refreshing, setRefreshing]             = useState(false);
  const [lastRefresh, setLastRefresh]           = useState(new Date());
  const [searchQ, setSearchQ]                   = useState("");
  const [userName, setUserName]                 = useState("");
  const feedRef = useRef(null);

  // Clock
  useEffect(() => {
    const t = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Load user
  useEffect(() => {
    setUserName(localStorage.getItem("userName") || "");
  }, []);

  // Live feed ticker
  useEffect(() => {
    if (!isLive) return;
    const tick = setInterval(() => {
      const rnd = FEED_TEMPLATES[Math.floor(Math.random() * FEED_TEMPLATES.length)];
      const entry = {
        ...rnd,
        id: Date.now(),
        time: "Just now",
        likes: sr(`l${Date.now()}`, 10, 9800),
        shares: sr(`s${Date.now()}`, 2, 2400),
      };
      setFeedItems(prev => [entry, ...prev].slice(0, 40));
      if (rnd.s === "negative") setAlertCount(p => p + 1);
    }, 5000);
    return () => clearInterval(tick);
  }, [isLive]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); setLastRefresh(new Date()); }, 1400);
  };

  const handleLogout = () => {
    ["userId","userRole","userName","userDistrict","userBoothNo","userConstituency","userZone","userEmsId","userRoleLabel"]
      .forEach(k => localStorage.removeItem(k));
    ["userId","userRole","userName"].forEach(k => { document.cookie = `${k}=; max-age=0; path=/`; });
    window.location.href = "/login";
  };

  // Overall sentiment (weighted avg across all platforms)
  const totalMentions = PLATFORMS.reduce((s, p) => s + p.mentions, 0);
  const overallPos = Math.round(PLATFORMS.reduce((s, p) => s + p.base * p.mentions, 0) / totalMentions);
  const overallNeg = Math.round(PLATFORMS.reduce((s, p) => s + p.neg  * p.mentions, 0) / totalMentions);
  const overallNeu = 100 - overallPos - overallNeg;

  // Rival comparison
  const rivalPos = 44; const rivalNeg = 34; const rivalNeu = 22;

  // Filtered feed
  const filteredFeed = feedItems.filter(f =>
    (filter === "all" || f.s === filter) &&
    (searchQ === "" || f.m.toLowerCase().includes(searchQ.toLowerCase()) || f.t.toLowerCase().includes(searchQ.toLowerCase()))
  );

  const selPlatform = PLATFORMS.find(p => p.id === selectedPlatform);

  return (
    <div className="min-h-screen bg-[#030908] text-white font-sans" style={{ "--card-bg": "rgba(255,255,255,0.02)", "--bdr": "rgba(255,255,255,0.07)" }}>

      {/* ═══ HEADER ════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-[#030908]/95 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Left: Identity */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg shrink-0"
              style={{ background: "linear-gradient(135deg,#DA251D,#8B0000)", boxShadow: "0 0 20px rgba(218,37,29,0.35)" }}>
              <Crosshair size={18} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.25em]">Social Media Intelligence</p>
              <p className="text-sm font-black text-white leading-tight">
                {CANDIDATE.name} &bull; <span style={{ color: CANDIDATE.color }}>{CANDIDATE.party}</span>
              </p>
            </div>
            {/* Live pill */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-black text-emerald-400 tracking-widest">LIVE TRACKING</span>
            </div>
          </div>

          {/* Center: Time + Stats */}
          <div className="hidden lg:flex items-center gap-4">
            {[
              { label: "Total Mentions", value: (totalMentions / 1000000).toFixed(1) + "M", color: "#3b82f6" },
              { label: "Positive Score", value: overallPos + "%",                            color: "#22c55e" },
              { label: "Negative Score", value: overallNeg + "%",                            color: "#ef4444" },
              { label: "Platforms Live", value: PLATFORMS.length,                            color: "#a855f7" },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <p className="text-[13px] font-black" style={{ color }}>{value}</p>
                <p className="text-[8px] text-white/30 font-semibold uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-2">
            <div className="text-[10px] text-white/30 font-mono hidden md:block">
              {liveTime.toLocaleTimeString("en-IN", { hour12: false })}
            </div>
            <button onClick={handleRefresh}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white transition-all">
              <RefreshCw size={14} className={refreshing ? "animate-spin text-emerald-400" : ""} />
            </button>
            <button
              onClick={() => setIsLive(p => !p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                isLive ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}>
              {isLive ? <Wifi size={11} /> : <WifiOff size={11} />}
              {isLive ? "Live" : "Paused"}
            </button>
            {alertCount > 0 && (
              <button className="relative w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
                <Bell size={14} />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[8px] font-black text-white flex items-center justify-center">
                  {alertCount > 9 ? "9+" : alertCount}
                </span>
              </button>
            )}
            {userName && (
              <button onClick={handleLogout}
                className="flex items-center gap-1.5 text-[10px] text-white/30 hover:text-red-400 font-black uppercase tracking-widest transition-colors">
                <LogOut size={12} /> Logout
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 py-6">

        {/* ═══ ROW 1: Overall Sentiment + Party Header ══════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">

          {/* Card: Candidate profile */}
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] p-6"
            style={{ background: "linear-gradient(135deg,rgba(218,37,29,0.12) 0%,rgba(0,0,0,0) 60%)" }}>
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 pointer-events-none"
              style={{ background: CANDIDATE.color, filter: "blur(60px)" }} />
            <div className="flex items-start gap-4 mb-4">
              {/* Avatar placeholder */}
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0 border"
                style={{ background: CANDIDATE.color + "22", borderColor: CANDIDATE.color + "44", color: CANDIDATE.color }}>
                AY
              </div>
              <div>
                <h1 className="text-xl font-black text-white leading-tight">{CANDIDATE.name}</h1>
                <p className="text-[11px] font-semibold mt-0.5" style={{ color: CANDIDATE.color }}>{CANDIDATE.party}</p>
                <p className="text-[10px] text-white/30 font-semibold mt-0.5">{CANDIDATE.handle} · {CANDIDATE.role}</p>
              </div>
            </div>
            <p className="text-[10px] text-white/40 font-semibold italic mb-4">"{CANDIDATE.tagline}"</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Influence Score", value: "94.2", unit: "/100", color: "#a855f7" },
                { label: "PR Health",       value: "78",   unit: "%",    color: "#22c55e" },
                { label: "Viral Posts",     value: "47",   unit: "today",color: "#f59e0b" },
              ].map(({ label, value, unit, color }) => (
                <div key={label} className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <p className="text-lg font-black" style={{ color }}>{value}<span className="text-[9px] text-white/30 ml-0.5">{unit}</span></p>
                  <p className="text-[8px] text-white/30 font-black uppercase tracking-wider mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Overall Sentiment Radial */}
          <div className="rounded-3xl border border-white/[0.08] p-6 bg-white/[0.02] flex flex-col items-center justify-center">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4">Overall Sentiment — All Platforms</p>
            <div className="relative">
              <SentimentArc positive={overallPos} negative={overallNeg} neutral={overallNeu} size={140} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-2xl font-black text-emerald-400">{overallPos}%</p>
                <p className="text-[9px] text-white/30 font-black uppercase tracking-widest">Positive</p>
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              {[
                { label: "Positive", value: overallPos, color: "#22c55e" },
                { label: "Neutral",  value: overallNeu, color: "#eab308" },
                { label: "Negative", value: overallNeg, color: "#ef4444" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span className="text-[10px] font-black" style={{ color }}>{value}%</span>
                  <span className="text-[9px] text-white/30">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Rival Comparison */}
          <div className="rounded-3xl border border-white/[0.08] p-6 bg-white/[0.02]">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4">Competitor Sentiment Comparison</p>
            {[
              { name: CANDIDATE.name, party: CANDIDATE.party, pos: overallPos, neg: overallNeg, color: CANDIDATE.color },
              { name: RIVAL.name,     party: RIVAL.party,     pos: rivalPos,   neg: rivalNeg,   color: RIVAL.color },
            ].map((c) => (
              <div key={c.name} className="mb-4 last:mb-0">
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <p className="text-[11px] font-black text-white">{c.name}</p>
                    <p className="text-[9px] font-semibold" style={{ color: c.color }}>{c.party}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-black text-emerald-400">+{c.pos}%</p>
                    <p className="text-[9px] text-red-400">−{c.neg}%</p>
                  </div>
                </div>
                <div className="h-3 rounded-full overflow-hidden flex" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <div className="h-full transition-all duration-700" style={{ width: `${c.pos}%`, background: "#22c55e" }} />
                  <div className="h-full transition-all duration-700" style={{ width: `${100 - c.pos - c.neg}%`, background: "#eab308" }} />
                  <div className="h-full transition-all duration-700 rounded-r-full" style={{ width: `${c.neg}%`, background: "#ef4444" }} />
                </div>
              </div>
            ))}
            <div className="mt-4 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06]">
              <p className="text-[10px] font-black text-emerald-400 flex items-center gap-1.5">
                <TrendingUp size={12} /> SP Leading by {overallPos - rivalPos}% in positive sentiment
              </p>
            </div>
          </div>
        </div>

        {/* ═══ ROW 2: 24hr Timeline ══════════════════════════════════ */}
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-white">24-Hour Mention Volume & Sentiment</h2>
              <p className="text-[9px] text-white/30 font-semibold mt-0.5">Green = Positive dominant · Yellow = Mixed · Red = Negative spike</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-white/30 font-semibold">Last refresh: {lastRefresh.toLocaleTimeString("en-IN", { hour12: false })}</span>
            </div>
          </div>
          <TimelineBar data={TIMELINE} />
          <div className="flex justify-between mt-1">
            {["00", "03", "06", "09", "12", "15", "18", "21", "23"].map(h => (
              <span key={h} className="text-[8px] text-white/20 font-mono">{h}:00</span>
            ))}
          </div>
        </div>

        {/* ═══ ROW 3: Platforms Grid + Selected Detail ══════════════ */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-6">

          {/* Platform grid */}
          <div className="xl:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-white">Platform-wise Intelligence</h2>
              <span className="text-[9px] text-white/30 font-semibold">{PLATFORMS.length} platforms monitored</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
              {PLATFORMS.map(p => (
                <PlatformCard key={p.id} p={p}
                  onClick={id => setSelectedPlatform(prev => prev === id ? null : id)}
                  selected={selectedPlatform === p.id} />
              ))}
            </div>
          </div>

          {/* Platform detail / Hashtags */}
          <div className="flex flex-col gap-4">
            {selPlatform ? (
              <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 flex-1">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black"
                    style={{ background: selPlatform.color + "22", color: selPlatform.color, border: `1px solid ${selPlatform.color}44` }}>
                    {selPlatform.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">{selPlatform.name}</h3>
                    <p className="text-[9px] text-white/30">{(selPlatform.mentions / 1000).toFixed(0)}K mentions today</p>
                  </div>
                  <button onClick={() => setSelectedPlatform(null)}
                    className="ml-auto text-white/20 hover:text-white/60 transition-colors text-lg">×</button>
                </div>
                {[
                  { label: "Positive Mentions",  value: `${selPlatform.base}%`,      icon: ThumbsUp,   color: "#22c55e" },
                  { label: "Negative Mentions",  value: `${selPlatform.neg}%`,       icon: ThumbsDown, color: "#ef4444" },
                  { label: "Neutral Mentions",   value: `${selPlatform.neu}%`,       icon: Minus,      color: "#eab308" },
                  { label: "24h Trend",          value: `${selPlatform.trend > 0 ? "+" : ""}${selPlatform.trend}%`, icon: TrendingUp, color: selPlatform.trend > 0 ? "#22c55e" : "#ef4444" },
                  { label: "Total Volume",       value: `${(selPlatform.mentions / 1000).toFixed(0)}K`, icon: Activity, color: selPlatform.color },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="flex items-center justify-between py-2.5 border-b border-white/[0.05] last:border-0">
                    <div className="flex items-center gap-2">
                      <Icon size={12} style={{ color }} />
                      <span className="text-[10px] text-white/50 font-semibold">{label}</span>
                    </div>
                    <span className="text-[11px] font-black" style={{ color }}>{value}</span>
                  </div>
                ))}
                {/* Sentiment Bar */}
                <div className="mt-4">
                  <p className="text-[9px] text-white/30 font-black uppercase tracking-widest mb-2">Sentiment Distribution</p>
                  <div className="h-4 rounded-full overflow-hidden flex">
                    <div className="h-full transition-all" style={{ width: `${selPlatform.base}%`, background: "#22c55e" }} />
                    <div className="h-full transition-all" style={{ width: `${selPlatform.neu}%`,  background: "#eab308" }} />
                    <div className="h-full transition-all" style={{ width: `${selPlatform.neg}%`,  background: "#ef4444" }} />
                  </div>
                </div>
              </div>
            ) : (
              /* Trending Hashtags */
              <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <Flame size={15} className="text-orange-400" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Trending Hashtags</h3>
                </div>
                <div className="space-y-2">
                  {HASHTAGS.map((h, i) => {
                    const cfg = sentimentCfg(h.sentiment);
                    return (
                      <div key={h.tag} className="flex items-center justify-between py-2 border-b border-white/[0.05] last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-white/20 font-black w-4">{i + 1}</span>
                          <Hash size={10} className="text-white/20 shrink-0" />
                          <span className="text-[11px] font-black text-white">{h.tag.replace("#", "")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-white/30">{h.count}</span>
                          <span className={`flex items-center gap-0.5 text-[9px] font-black ${h.trend > 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {trendIcon(h.trend)}{Math.abs(h.trend)}%
                          </span>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══ ROW 4: Live Feed + News + District Heatmap ══════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">

          {/* Live Mentions Feed */}
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Live Mentions Feed</h3>
              </div>
              {/* Filter tabs */}
              <div className="flex gap-1">
                {["all","positive","negative"].map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg transition-all ${
                      filter === f ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"
                    }`}>{f}</button>
                ))}
              </div>
            </div>
            {/* Search */}
            <div className="px-4 pt-3 pb-2">
              <div className="relative">
                <Search size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  placeholder="Search mentions..."
                  className="w-full bg-white/[0.03] border border-white/[0.06] text-white placeholder-white/20 text-[10px] font-medium rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:border-white/20 transition-all" />
              </div>
            </div>
            <div ref={feedRef} className="overflow-y-auto" style={{ maxHeight: "380px" }}>
              {filteredFeed.map((item, i) => {
                const cfg = sentimentCfg(item.s);
                return (
                  <div key={item.id || i}
                    className={`px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.02] transition-all ${i === 0 && isLive ? "animate-pulse" : ""}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                        <span className="text-[9px] font-black text-white/40 uppercase tracking-wider">{item.t}</span>
                      </div>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-white/70 font-medium leading-relaxed">{item.m}</p>
                    {(item.likes || item.shares) && (
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-[8px] text-white/20">
                          <Heart size={8} /> {(item.likes || sr("l" + i, 10, 9800)).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1 text-[8px] text-white/20">
                          <Share2 size={8} /> {(item.shares || sr("s" + i, 2, 2400)).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* News Section */}
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-white/[0.06]">
              <Radio size={14} className="text-red-400" />
              <h3 className="text-sm font-black uppercase tracking-widest text-white">Media Coverage</h3>
            </div>
            <div className="divide-y divide-white/[0.05]">
              {NEWS_ITEMS.map((n) => {
                const cfg = sentimentCfg(n.sentiment);
                return (
                  <div key={n.title} className="px-4 py-3 hover:bg-white/[0.02] transition-all">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-black text-white/40 uppercase tracking-wider">{n.source}</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    </div>
                    <p className="text-[10px] font-semibold text-white/80 leading-snug">{n.title}</p>
                    <p className="text-[8px] text-white/20 mt-1 flex items-center gap-1">
                      <Clock size={7} /> {n.time}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* District Sentiment Heatmap (UP) */}
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-white/[0.06]">
              <Globe size={14} className="text-blue-400" />
              <h3 className="text-sm font-black uppercase tracking-widest text-white">UP District Sentiment</h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2" style={{ maxHeight: "420px", overflowY: "auto" }}>
              {UP_DISTRICTS.map((d) => {
                const posScore = sr(d + "pos", 40, 85);
                const negScore = sr(d + "neg", 8, 35);
                const isLead = posScore > 60;
                return (
                  <div key={d} className="p-2.5 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                    <p className="text-[9px] font-black text-white truncate">{d}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden flex">
                        <div className="h-full" style={{ width: `${posScore}%`, background: "#22c55e" }} />
                        <div className="h-full" style={{ width: `${negScore}%`, background: "#ef4444" }} />
                      </div>
                      <span className={`text-[8px] font-black ${isLead ? "text-emerald-400" : "text-red-400"}`}>
                        {posScore}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═══ ROW 5: PR Campaigns ══════════════════════════════════ */}
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] overflow-hidden mb-6">
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Zap size={15} className="text-yellow-400" />
              <h2 className="text-sm font-black uppercase tracking-widest text-white">Active PR Campaigns</h2>
            </div>
            <button className="flex items-center gap-1.5 text-[10px] text-white/40 hover:text-emerald-400 font-black uppercase tracking-widest transition-colors border border-white/[0.08] hover:border-emerald-500/30 px-3 py-1.5 rounded-xl">
              + New Campaign
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] text-white/20 font-black uppercase tracking-[0.3em] border-b border-white/[0.05] bg-white/[0.01]">
                  <th className="px-6 py-3">Campaign Name</th>
                  <th className="px-6 py-3">Platform</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Reach</th>
                  <th className="px-6 py-3">Sentiment Score</th>
                  <th className="px-6 py-3">Started</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {PR_CAMPAIGNS.map((c) => {
                  const statusCfg = {
                    active:  { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "● Active" },
                    paused:  { color: "text-yellow-400",  bg: "bg-yellow-500/10",  border: "border-yellow-500/20",  label: "⏸ Paused" },
                    planned: { color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20",    label: "◎ Planned" },
                  }[c.status];
                  return (
                    <tr key={c.name} className="hover:bg-white/[0.02] transition-all group">
                      <td className="px-6 py-4">
                        <p className="text-[11px] font-black text-white group-hover:text-yellow-400 transition-colors">{c.name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-semibold text-white/40">{c.platform}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border ${statusCfg.color} ${statusCfg.bg} ${statusCfg.border}`}>
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[11px] font-black text-blue-400">{c.reach}</span>
                      </td>
                      <td className="px-6 py-4">
                        {c.sentiment > 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 rounded-full overflow-hidden bg-white/[0.05]">
                              <div className="h-full rounded-full transition-all"
                                style={{ width: `${c.sentiment}%`, background: c.sentiment > 65 ? "#22c55e" : "#eab308" }} />
                            </div>
                            <span className={`text-[10px] font-black ${c.sentiment > 65 ? "text-emerald-400" : "text-yellow-400"}`}>
                              {c.sentiment}%
                            </span>
                          </div>
                        ) : <span className="text-[9px] text-white/20">—</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] text-white/30 font-semibold">{c.startDate}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-[9px] font-black text-red-400 hover:text-white border border-red-600/20 hover:border-red-400/40 px-3 py-1.5 rounded-xl transition-all uppercase tracking-widest">
                          Boost
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ═══ ROW 6: Alert Panel + Quick Actions ══════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Negative Spike Alerts */}
          <div className="rounded-3xl border border-red-500/20 bg-red-500/[0.03] overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-red-500/10">
              <AlertTriangle size={14} className="text-red-400" />
              <h3 className="text-sm font-black uppercase tracking-widest text-white">Negative Spike Alerts</h3>
              <span className="ml-auto text-[8px] font-black px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/20">
                {alertCount} Active
              </span>
            </div>
            <div className="divide-y divide-red-500/[0.08]">
              {[
                { platform: "Reddit India",  msg: "Anti-SP thread gaining traction — 4.2K upvotes in 2hrs",       time: "Just now",    level: "critical" },
                { platform: "YouTube",       msg: "Opposition video: 1.8M views — Negative framing SP govt",      time: "12 min ago",  level: "critical" },
                { platform: "Twitter/X",     msg: "#AkhileshScam trending in Agra, Meerut zones unexpectedly",    time: "28 min ago",  level: "warning"  },
                { platform: "Facebook",      msg: "Fake news viral: SP candidate scandal — needs counter-PR",     time: "43 min ago",  level: "warning"  },
                { platform: "News Portals",  msg: "5 articles with negative headline indexed in top Google results", time: "1hr ago",  level: "info"     },
              ].map((alert, i) => {
                const lvlCfg = {
                  critical: { color: "text-red-400",   bg: "bg-red-500/10",   dot: "bg-red-500",   label: "Critical" },
                  warning:  { color: "text-orange-400",bg: "bg-orange-500/10",dot: "bg-orange-400", label: "Warning"  },
                  info:     { color: "text-yellow-400",bg: "bg-yellow-500/10",dot: "bg-yellow-400", label: "Info"     },
                }[alert.level];
                return (
                  <div key={i} className="px-4 py-3 hover:bg-white/[0.02] transition-all">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${lvlCfg.dot} ${alert.level === "critical" ? "animate-pulse" : ""}`} />
                        <span className="text-[9px] font-black text-white/40 uppercase">{alert.platform}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] text-white/20">{alert.time}</span>
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${lvlCfg.bg} ${lvlCfg.color}`}>{lvlCfg.label}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-white/60 font-medium leading-snug">{alert.msg}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PR Quick Actions */}
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-white/[0.06]">
              <Target size={14} className="text-yellow-400" />
              <h3 className="text-sm font-black uppercase tracking-widest text-white">PR Action Centre</h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {[
                { icon: Zap,           label: "Boost Positive Campaign",  desc: "Auto-amplify top content",     color: "#22c55e", action: "Boost" },
                { icon: Shield,        label: "Counter Negative Trend",   desc: "Generate response strategy",   color: "#ef4444", action: "Counter" },
                { icon: Volume2,       label: "Broadcast to SP Network",  desc: "Push to all field workers",    color: "#3b82f6", action: "Send" },
                { icon: Share2,        label: "Viral Content Push",       desc: "Share viral reel/post",        color: "#a855f7", action: "Push" },
                { icon: Users,         label: "Influencer Activate",      desc: "Engage 200+ SP influencers",   color: "#f59e0b", action: "Activate" },
                { icon: Download,      label: "Export Sentiment Report",  desc: "PDF/Excel detailed report",    color: "#6b7280", action: "Export" },
                { icon: Star,          label: "Positive Story Launch",    desc: "Push success story content",   color: "#eab308", action: "Launch" },
                { icon: Calendar,      label: "Schedule Campaign",        desc: "Plan upcoming PR blitz",       color: "#06b6d4", action: "Schedule" },
              ].map(({ icon: Icon, label, desc, color, action }) => (
                <button key={label}
                  className="flex flex-col gap-2 p-3.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all text-left group">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: color + "18", border: `1px solid ${color}33` }}>
                    <Icon size={14} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white leading-tight group-hover:text-yellow-400 transition-colors">{label}</p>
                    <p className="text-[8px] text-white/30 font-semibold mt-0.5">{desc}</p>
                  </div>
                  <span className="text-[8px] font-black px-2 py-0.5 rounded-full self-start"
                    style={{ background: color + "18", color, border: `1px solid ${color}33` }}>
                    {action} →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
