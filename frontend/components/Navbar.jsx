"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "./LanguageSwitcher";
import {
  Menu, X, MessageSquare, Lock, Radio,
  LayoutDashboard, Map, UserPlus, SatelliteDish, Activity, Landmark,
  UserCog, Vote, Megaphone, Building2, Shield, Crosshair, ChevronDown,
  Radar, ShieldAlert, Zap, Crown, BookOpen,
  BarChart3, Award, Sun, Moon, Target, Layers,
  BellRing, Volume2, VolumeX, AlertTriangle, CheckCheck, BellOff,
} from "lucide-react";
import { useTranslation } from "react-i18next";

// ── Badge color map ────────────────────────────────────────────
const badgeCls = (b) => {
  const map = {
    L0: "bg-red-500/15 text-red-400",
    L1: "bg-purple-500/15 text-purple-400",
    L2: "bg-amber-500/15 text-amber-400",
    L3: "bg-blue-500/15 text-blue-400",
    L4: "bg-cyan-500/15 text-cyan-400",
    L5: "bg-green-500/15 text-green-400",
    L6: "bg-teal-500/15 text-teal-400",
    L7: "bg-emerald-500/15 text-emerald-400",
    WAR:  "bg-red-500/15 text-red-400",
    LIVE: "bg-green-500/15 text-green-400",
    NEW:  "bg-blue-500/15 text-blue-400",
    DATA: "bg-purple-500/15 text-purple-400",
  };
  return map[b] || "bg-white/10 text-gray-500";
};

// ── Section label with line ────────────────────────────────────
const SectionLabel = ({ label }) => (
  <div className="flex items-center gap-2 px-4 pt-3 pb-1">
    <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] whitespace-nowrap">{label}</p>
    <div className="flex-1 h-px bg-white/[0.05]" />
  </div>
);

// ── Nav link with hover accent ─────────────────────────────────
const NavLink = ({ href, icon: Icon, label, sublabel, color = "text-gray-400", badge, onClick }) => (
  <Link href={href} onClick={onClick}
    className={`group/item relative flex items-center gap-3 py-2.5 px-4 hover:bg-white/[0.04] transition-all duration-150 ${color}`}>
    <div className="absolute left-0 inset-y-0 w-[2px] rounded-r-full opacity-0 group-hover/item:opacity-100 transition-opacity duration-200"
      style={{ background: "currentColor" }} />
    {Icon && (
      <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-white/[0.04] group-hover/item:bg-white/[0.08] transition-all">
        <Icon size={13} />
      </span>
    )}
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-semibold leading-tight truncate">{label}</p>
      {sublabel && <p className="text-[9px] text-gray-600 leading-tight mt-0.5 truncate">{sublabel}</p>}
    </div>
    {badge && (
      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full tracking-wider shrink-0 ${badgeCls(badge)}`}>{badge}</span>
    )}
  </Link>
);

// ── Dropdown wrapper ───────────────────────────────────────────
const DD = ({ label, icon: TrigIcon, children, width = "w-64", alignRight = false }) => (
  <div className="group relative">
    <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold text-gray-400 hover:text-white hover:bg-white/[0.05] transition-all duration-200 tracking-wider uppercase">
      {TrigIcon && <TrigIcon size={11} className="opacity-50" />}
      {label}
      <ChevronDown size={10} className="opacity-40 group-hover:rotate-180 transition-transform duration-300 ml-0.5" />
    </button>
    {/* bridge gap */}
    <div className="absolute top-full left-0 h-3 w-full" />
    <div className={`absolute hidden group-hover:block top-[calc(100%+12px)] ${alignRight ? "right-0" : "left-0"} ${width}
      border rounded-2xl shadow-[0_24px_48px_rgba(0,0,0,0.55)] backdrop-blur-2xl overflow-hidden z-[300]`}
      style={{ background: "var(--navbar-bg)", borderColor: "var(--border-clr)" }}>
      {children}
    </div>
  </div>
);

// ── Siren beep via Web Audio API ─────────────────────────────
const playSirenBeep = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.35, 0.7].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sawtooth";
      gain.gain.setValueAtTime(0, ctx.currentTime + offset);
      gain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + offset + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.32);
      osc.frequency.setValueAtTime(1320, ctx.currentTime + offset);
      osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + offset + 0.18);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + offset + 0.32);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.35);
    });
  } catch (e) {}
};

// ── Mock alert data (replace with socket feed in prod) ─────────
const INIT_ALERTS = [
  { id: 1, type: "critical", title: "Worker Offline",    msg: "3 booth workers went offline — Agra Zone, Booth 22",         time: "2m ago",  read: false },
  { id: 2, type: "critical", title: "Auth Breach Alert", msg: "Failed login attempt on Super Admin portal — IP blocked",    time: "9m ago",  read: false },
  { id: 3, type: "warning",  title: "Turnout Spike",    msg: "Booth 114, Mathura — turnout crossed 87% threshold",         time: "18m ago", read: false },
  { id: 4, type: "info",     title: "ES Sync Complete", msg: "Elasticsearch re-index done: 25 Crore voter records synced",  time: "35m ago", read: true  },
  { id: 5, type: "warning",  title: "Broadcast Sent",   msg: "12,400 field workers acknowledged state-level broadcast",    time: "1h ago",  read: true  },
];

const ALERT_CLR = {
  critical: { ring: "text-red-400",   bg: "bg-red-500/10",   border: "border-red-500/20",   dot: "bg-red-500",   pill: "bg-red-500/15 text-red-400"   },
  warning:  { ring: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", dot: "bg-amber-400", pill: "bg-amber-500/15 text-amber-400" },
  info:     { ring: "text-blue-400",  bg: "bg-blue-500/10",  border: "border-blue-500/20",  dot: "bg-blue-400",  pill: "bg-blue-500/15 text-blue-400"  },
};
const ALERT_ICON = { critical: ShieldAlert, warning: AlertTriangle, info: Activity };

// ── Notification Panel ─────────────────────────────────────────
const NotifPanel = ({ notifications, soundOn, setSoundOn, markAllRead, onClose }) => {
  const unread = notifications.filter(n => !n.read).length;
  return (
    <div className="absolute right-0 top-[calc(100%+14px)] w-80 border rounded-2xl shadow-[0_28px_56px_rgba(0,0,0,0.65)] backdrop-blur-2xl overflow-hidden z-[400]"
      style={{ background: "var(--navbar-bg)", borderColor: "var(--border-clr)" }}>

      {/* ── Panel header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          {/* Siren icon with pulse ring */}
          <div className="relative">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              unread > 0 ? "bg-red-500/15" : "bg-white/[0.05]"
            }`}>
              {unread > 0
                ? <BellRing size={15} className="text-red-400 animate-bounce" />
                : <BellOff  size={15} className="text-gray-500" />}
            </div>
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 animate-ping opacity-60" />
            )}
          </div>
          <div>
            <p className="text-[12px] font-black text-white leading-tight">Siren Alerts</p>
            <p className="text-[9px] text-gray-500 leading-tight">{unread > 0 ? `${unread} unread • action required` : "All clear"}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setSoundOn(p => !p)}
            title={soundOn ? "Mute sound alerts" : "Enable sound alerts"}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
              soundOn ? "bg-amber-500/15 text-amber-400 border border-amber-500/20" : "bg-white/5 text-gray-500 border border-white/10"
            }`}>
            {soundOn ? <Volume2 size={12} /> : <VolumeX size={12} />}
          </button>
          <button onClick={markAllRead} title="Mark all as read"
            className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all">
            <CheckCheck size={12} />
          </button>
        </div>
      </div>

      {/* ── Status bar ── */}
      {unread > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/[0.06] border-b border-red-500/10">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[9px] font-black text-red-400 tracking-wider uppercase">Live Siren Active — {unread} Critical</span>
        </div>
      )}

      {/* ── Alert list ── */}
      <div className="max-h-72 overflow-y-auto">
        {notifications.map(n => {
          const c = ALERT_CLR[n.type] || ALERT_CLR.info;
          const Icon = ALERT_ICON[n.type] || Activity;
          return (
            <div key={n.id}
              className={`flex gap-3 px-4 py-3 border-b border-white/[0.04] transition-all duration-200 ${
                n.read ? "opacity-40" : "hover:bg-white/[0.03]"
              }`}>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${c.bg} ${c.border}`}>
                <Icon size={12} className={c.ring} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-[10px] font-bold leading-tight ${c.ring}`}>{n.title}</p>
                  <span className="text-[8px] text-gray-600 shrink-0 mt-0.5">{n.time}</span>
                </div>
                <p className="text-[9px] text-gray-500 mt-0.5 leading-relaxed">{n.msg}</p>
              </div>
              {!n.read && <div className={`w-1.5 h-1.5 rounded-full ${c.dot} shrink-0 mt-1.5`} />}
            </div>
          );
        })}
      </div>

      {/* ── Footer ── */}
      <div className="px-4 py-3 border-t border-white/[0.04]">
        <Link href="/war-room" onClick={onClose}
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-500/[0.08] border border-red-500/15 text-[9px] text-red-400 hover:bg-red-500/15 font-black tracking-widest uppercase transition-all">
          <Target size={10} /> Open War Room
        </Link>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN NAVBAR
═══════════════════════════════════════════════════════════════ */
const Navbar = ({ currentLang, setLang, openLogin, theme = "dark", toggleTheme }) => {
  const [isOpen, setIsOpen]             = useState(false);
  const [expandedSection, setExpanded]  = useState(null);
  const [hidden, setHidden]             = useState(false);
  const [scrolled, setScrolled]         = useState(false);
  const [mounted, setMounted]           = useState(false);
  const [notifOpen, setNotifOpen]       = useState(false);
  const [soundOn, setSoundOn]           = useState(true);
  const [notifications, setNotifications] = useState(INIT_ALERTS);
  const lastScrollY = useRef(0);
  const notifRef    = useRef(null);
  const { t } = useTranslation();
  const close = () => setIsOpen(false);
  const toggleSection = (s) => setExpanded(p => p === s ? null : s);
  const unreadCount = notifications.filter(n => !n.read).length;

  const openNotif = () => {
    setNotifOpen(p => !p);
    if (soundOn && unreadCount > 0 && !notifOpen) playSirenBeep();
  };

  useEffect(() => { setMounted(true); }, []);

  // Close notification panel on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      if (y > lastScrollY.current && y > 80) { setHidden(true); setIsOpen(false); }
      else setHidden(false);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500
      ${hidden ? "-translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"}`}>
      <div className={`mx-4 mt-4 transition-all duration-500 ${scrolled ? "mx-3 mt-3" : ""}`}>
        <div className="relative flex items-center justify-between gap-4 px-5 py-3 rounded-2xl border transition-all duration-500"
          style={{
            background: scrolled ? "var(--navbar-bg)" : "rgba(0,0,0,0.25)",
            borderColor: "var(--border-clr)",
            boxShadow: scrolled ? "0 8px 40px rgba(0,0,0,0.5)" : "0 4px 16px rgba(0,0,0,0.2)",
          }}>

          {/* ── Logo ─────────────────────────────────────────── */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="relative w-8 h-8 shrink-0">
              <div className="absolute inset-0 bg-[#DA251D] rounded-lg rotate-6 opacity-30 group-hover:rotate-12 transition-transform duration-300" />
              <div className="relative w-8 h-8 bg-gradient-to-br from-[#DA251D] to-[#a01a14] rounded-lg flex items-center justify-center shadow-lg shadow-red-900/50">
                <span className="text-white font-black text-sm tracking-tighter">E</span>
              </div>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[15px] font-black tracking-[-0.03em] text-white">
                EMS<span className="text-[#DA251D]">.</span>UP
              </span>
              <span className="text-[8px] text-white/30 font-semibold tracking-[0.15em] uppercase">
                Election System · 2026
              </span>
            </div>
          </Link>

          {/* ── Desktop Navigation ───────────────────────────── */}
          <div className="hidden lg:flex items-center gap-0.5">

            {/* ── 1. PORTALS — 2-column mega menu ── */}
            <DD label="Portals" icon={Layers} width="w-[540px]">
              <div className="grid grid-cols-2 divide-x divide-white/[0.05] py-2">
                {/* Left col */}
                <div>
                  <SectionLabel label="High Command" />
                  <NavLink href="/portal/super-admin/login" icon={ShieldAlert} label="Super Admin"        sublabel="Level 0 — National Control"  color="text-red-500"     badge="L0" />
                  <NavLink href="/portal/state/login"       icon={Crown}       label="State Admin"        sublabel="Level 1 — State Command"     color="text-purple-400"  badge="L1" />
                  <SectionLabel label="Regional Command" />
                  <NavLink href="/portal/zone/login"         icon={SatelliteDish} label="Zone Commander"      sublabel="Level 2 — Zone Control"      color="text-amber-400" badge="L2" />
                  <NavLink href="/portal/district/login"     icon={Building2}     label="District Admin"      sublabel="Level 3 — District Head"     color="text-blue-400"  badge="L3" />
                  <NavLink href="/portal/constituency/login" icon={Landmark}      label="Constituency Admin"  sublabel="Level 4 — Vidhayak Area"     color="text-cyan-400"  badge="L4" />
                </div>
                {/* Right col */}
                <div>
                  <SectionLabel label="Booth Family" />
                  <NavLink href="/portal/warriors/login"        icon={Award}     label="Booth President"    sublabel="Level 5 — Booth Pramukh"     color="text-green-400"   badge="L5" />
                  <NavLink href="/portal/booth-manager"         icon={UserCog}   label="Booth Manager"      sublabel="Level 6 — Booth Prabandh"    color="text-teal-400"    badge="L6" />
                  <NavLink href="/portal/jan-sampark/dashboard" icon={Megaphone} label="Jan Sampark Sathi"  sublabel="Level 7 — Ground Connect"    color="text-emerald-400" badge="L7" />
                  <SectionLabel label="Quick Access" />
                  <NavLink href="/login"  icon={Lock}      label="General Login" color="text-gray-400" />
                  <NavLink href="/signup" icon={UserPlus}  label="Register"      color="text-gray-400" />
                </div>
              </div>
            </DD>

            {/* ── 2. COMMAND — Dashboards ── */}
            <DD label="Command" icon={LayoutDashboard} width="w-72">
              <div className="py-2">
                <SectionLabel label="Admin Dashboards" />
                <NavLink href="/dashboard/admin/main"         icon={LayoutDashboard} label="Super Admin Dashboard"  color="text-red-400" />
                <NavLink href="/dashboard/admin/state"        icon={Map}             label="State Admin Panel"       color="text-purple-400" />
                <NavLink href="/district-admin"               icon={Building2}       label="District Admin Panel"    color="text-blue-400" />
                <NavLink href="/zone-monitor"                 icon={SatelliteDish}   label="Zone Monitor — Braj"     color="text-amber-400" />
                <NavLink href="/portal/jan-sampark/dashboard" icon={Megaphone}       label="Jan Sampark Dashboard"   color="text-emerald-400" badge="LIVE" />
                <SectionLabel label="Administration" />
                <NavLink href="/admin"  icon={UserCog} label="Admin Control Panel" color="text-orange-400" />
                <NavLink href="/portal" icon={Shield}  label="Master Portal"       color="text-gray-300" />
              </div>
            </DD>

            {/* ── 3. FIELD OPS ── */}
            <DD label="Field Ops" icon={Target} width="w-72">
              <div className="py-2">
                <SectionLabel label="Voter Data — 25 Crore DB" />
                <NavLink href="/voters"                         icon={Vote}      label="Voter Search"          sublabel="25 Crore Database"  color="text-sky-400" />
                <NavLink href="/jan-sampark/voter-intelligence" icon={BookOpen}  label="Voter Intelligence"    color="text-cyan-400" />
                <NavLink href="/dashboard/search-booth"         icon={Crosshair} label="Booth Database"        color="text-gray-400" />
                <SectionLabel label="Applications & Reports" />
                <NavLink href="/tracking"               icon={Activity}  label="Application Tracking"  color="text-yellow-400" />
                <NavLink href="/portal/booth-president" icon={BarChart3} label="Booth President Panel"  color="text-green-400" />
              </div>
            </DD>

            {/* ── 4. LIVE OPS — right-aligned ── */}
            <DD label="Live Ops" icon={Radar} width="w-[300px]" alignRight>
              <div className="py-2">
                <SectionLabel label="Monitoring & Command" />
                <NavLink href="/war-room"                    icon={Target}        label="Election War Room"       color="text-red-400"    badge="WAR" />
                <NavLink href="/portal/super-admin/tracking" icon={Radar}         label="Live Worker Tracking"    color="text-green-400"  badge="LIVE" />
                <NavLink href="/zone-monitor"                icon={SatelliteDish} label="Zone Monitor — Braj"     color="text-amber-400"  badge="LIVE" />
                <NavLink href="/citizen"                     icon={UserPlus}      label="Citizen Grievance"       color="text-cyan-400"   badge="NEW" />
                <NavLink href="/old-results"                 icon={BarChart3}     label="Old Election Results"    color="text-purple-400" badge="DATA" />
                <SectionLabel label="Communication" />
                <NavLink href="/chat"                         icon={MessageSquare} label="Secure Chat"            sublabel="E2E AES-256 Encrypted"   color="text-orange-400" badge="NEW" />
                <NavLink href="/portal/conference"            icon={Radio}         label="Video Conference"       sublabel="SFU Multi-party"         color="text-sky-400"    badge="LIVE" />
                <NavLink href="/portal/super-admin/broadcast" icon={Zap}           label="Broadcast Message"      color="text-yellow-400" />
              </div>
            </DD>

          </div>

          {/* ── Right: Actions ────────────────────────────────── */}
          <div className="flex items-center gap-2.5 shrink-0">
            <LanguageSwitcher currentLang={currentLang} setLang={setLang} />

            {/* ── Notification Bell ── */}
            <div ref={notifRef} className="relative">
              <button onClick={openNotif} title="Alerts & Notifications"
                className={`relative w-8 h-8 flex items-center justify-center rounded-lg border transition-all shrink-0 ${
                  unreadCount > 0
                    ? "bg-red-500/10 border-red-500/25 hover:bg-red-500/20"
                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                }`}>
                <BellRing size={14} className={unreadCount > 0 ? "text-red-400" : "text-gray-400"} />
                {unreadCount > 0 && (
                  <>
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center z-10">
                      <span className="text-[8px] font-black text-white leading-none">{unreadCount > 9 ? "9+" : unreadCount}</span>
                    </span>
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full animate-ping opacity-50" />
                  </>
                )}
              </button>
              {notifOpen && (
                <NotifPanel
                  notifications={notifications}
                  soundOn={soundOn}
                  setSoundOn={setSoundOn}
                  markAllRead={() => setNotifications(p => p.map(n => ({ ...n, read: true })))}
                  onClose={() => setNotifOpen(false)}
                />
              )}
            </div>

            {mounted && toggleTheme && (
              <button onClick={toggleTheme}
                title={theme === "dark" ? "Switch to Light" : "Switch to Dark"}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all shrink-0">
                {theme === "dark"
                  ? <Sun size={14} className="text-yellow-400" />
                  : <Moon size={14} className="text-blue-400" />}
              </button>
            )}

            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-black text-emerald-400 tracking-widest uppercase">Secure</span>
            </div>

            <Link href="/login"
              className="flex items-center gap-2 bg-gradient-to-r from-[#DA251D] to-[#b01e17] hover:from-[#c0211a] hover:to-[#9a1a13] text-white px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase shadow-lg shadow-[#DA251D]/20 active:scale-95 transition-all duration-200 border border-white/10">
              <Lock size={11} />
              {mounted ? t("login") : "Login"}
            </Link>

            <button onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden w-9 h-9 flex items-center justify-center text-white hover:bg-white/5 rounded-xl transition-all border border-white/10">
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

          {/* ── Mobile Drawer ─────────────────────────────────── */}
          {isOpen && (
            <div className="absolute top-[calc(100%+12px)] left-0 right-0 border rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.65)] backdrop-blur-2xl lg:hidden z-[300] overflow-hidden"
              style={{ background: "var(--navbar-bg)", borderColor: "var(--border-clr)" }}>

              {/* Status + Language bar */}
              <div className="flex items-center justify-between px-5 py-2.5 border-b border-white/[0.05]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] font-black text-emerald-400 tracking-widest">SYSTEM SECURE</span>
                </div>
                <div className="flex gap-1.5 items-center">
                  {[{ code: "en", label: "EN" }, { code: "hi", label: "HI" }, { code: "ur", label: "UR" }].map(l => (
                    <button key={l.code} onClick={() => setLang(l.code)}
                      className={`px-2 py-1 rounded-md text-[9px] font-black tracking-wider transition-all ${
                        currentLang === l.code ? "bg-[#DA251D] text-white" : "text-gray-500 hover:text-white bg-white/5"
                      }`}>{l.label}</button>
                  ))}
                  {toggleTheme && (
                    <button onClick={toggleTheme}
                      className="w-7 h-7 rounded-md flex items-center justify-center bg-white/5 text-gray-400 hover:text-white transition-all">
                      {theme === "dark" ? <Sun size={11} className="text-yellow-400" /> : <Moon size={11} className="text-blue-400" />}
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-[70vh] overflow-y-auto">
                {[
                  {
                    key: "portals", label: "Portals", icon: Layers,
                    links: [
                      { href: "/portal/super-admin/login",     icon: ShieldAlert,   label: "Super Admin",         sublabel: "Level 0", color: "text-red-500",     badge: "L0" },
                      { href: "/portal/state/login",           icon: Crown,         label: "State Admin",         sublabel: "Level 1", color: "text-purple-400",  badge: "L1" },
                      { href: "/portal/zone/login",            icon: SatelliteDish, label: "Zone Commander",      sublabel: "Level 2", color: "text-amber-400",   badge: "L2" },
                      { href: "/portal/district/login",        icon: Building2,     label: "District Admin",      sublabel: "Level 3", color: "text-blue-400",    badge: "L3" },
                      { href: "/portal/constituency/login",    icon: Landmark,      label: "Constituency Admin",  sublabel: "Level 4", color: "text-cyan-400",    badge: "L4" },
                      { href: "/portal/warriors/login",        icon: Award,         label: "Booth President",     sublabel: "Level 5", color: "text-green-400",   badge: "L5" },
                      { href: "/portal/booth-manager",         icon: UserCog,       label: "Booth Manager",       sublabel: "Level 6", color: "text-teal-400",    badge: "L6" },
                      { href: "/portal/jan-sampark/dashboard", icon: Megaphone,     label: "Jan Sampark Sathi",   sublabel: "Level 7", color: "text-emerald-400", badge: "L7" },
                    ],
                  },
                  {
                    key: "command", label: "Command", icon: LayoutDashboard,
                    links: [
                      { href: "/dashboard/admin/main",          icon: LayoutDashboard, label: "Super Admin Dashboard", color: "text-red-400" },
                      { href: "/dashboard/admin/state",         icon: Map,             label: "State Admin Panel",     color: "text-purple-400" },
                      { href: "/district-admin",                icon: Building2,       label: "District Admin Panel",  color: "text-blue-400" },
                      { href: "/zone-monitor",                  icon: SatelliteDish,   label: "Zone Monitor",          color: "text-amber-400" },
                      { href: "/portal/jan-sampark/dashboard",  icon: Megaphone,       label: "Jan Sampark Dashboard", color: "text-emerald-400", badge: "LIVE" },
                      { href: "/admin",                         icon: UserCog,         label: "Admin Control Panel",   color: "text-orange-400" },
                      { href: "/portal",                        icon: Shield,          label: "Master Portal",         color: "text-gray-300" },
                    ],
                  },
                  {
                    key: "field", label: "Field Ops", icon: Target,
                    links: [
                      { href: "/voters",                         icon: Vote,        label: "Voter Search",          sublabel: "25 Crore DB", color: "text-sky-400" },
                      { href: "/jan-sampark/voter-intelligence", icon: BookOpen,    label: "Voter Intelligence",    color: "text-cyan-400" },
                      { href: "/dashboard/search-booth",         icon: Crosshair,   label: "Booth Database",        color: "text-gray-400" },
                      { href: "/tracking",                       icon: Activity,    label: "Application Tracking",  color: "text-yellow-400" },
                      { href: "/portal/booth-president",         icon: BarChart3,   label: "Booth President Panel", color: "text-green-400" },
                    ],
                  },
                  {
                    key: "live", label: "Live Ops", icon: Radar,
                    links: [
                      { href: "/war-room",                         icon: Target,        label: "Election War Room",    color: "text-red-400",    badge: "WAR" },
                      { href: "/portal/super-admin/tracking",      icon: Radar,         label: "Live Worker Tracking", color: "text-green-400",  badge: "LIVE" },
                      { href: "/zone-monitor",                     icon: SatelliteDish, label: "Zone Monitor",         color: "text-amber-400",  badge: "LIVE" },
                      { href: "/citizen",                          icon: UserPlus,      label: "Citizen Grievance",    color: "text-cyan-400",   badge: "NEW" },
                      { href: "/old-results",                      icon: BarChart3,     label: "Old Election Results", color: "text-purple-400", badge: "DATA" },
                      { href: "/chat",                             icon: MessageSquare, label: "Secure Chat",          color: "text-orange-400", badge: "NEW" },
                      { href: "/portal/conference",                icon: Radio,         label: "Video Conference",     color: "text-sky-400",    badge: "LIVE" },
                      { href: "/portal/super-admin/broadcast",     icon: Zap,           label: "Broadcast Message",    color: "text-yellow-400" },
                    ],
                  },
                ].map(section => (
                  <div key={section.key} className="border-b border-white/[0.05]">
                    <button onClick={() => toggleSection(section.key)}
                      className="w-full flex items-center justify-between px-5 py-3 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] hover:text-white/60 transition-colors">
                      <div className="flex items-center gap-2">
                        <section.icon size={11} className="opacity-60" />
                        {section.label}
                      </div>
                      <ChevronDown size={12} className={`transition-transform duration-300 ${expandedSection === section.key ? "rotate-180" : ""}`} />
                    </button>
                    {expandedSection === section.key && (
                      <div className="pb-2">
                        {section.links.map(link => (
                          <NavLink key={link.href} href={link.href} icon={link.icon} label={link.label}
                            sublabel={link.sublabel} color={link.color} badge={link.badge} onClick={close} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Mobile CTA */}
              <div className="p-4 border-t border-white/[0.05]">
                <Link href="/login" onClick={close}
                  className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#DA251D] to-[#b01e17] text-white py-3 rounded-xl text-[11px] font-black tracking-widest uppercase shadow-lg shadow-[#DA251D]/20 active:scale-95 transition-transform">
                  <Lock size={12} /> {mounted ? t("login") : "Login"}
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
