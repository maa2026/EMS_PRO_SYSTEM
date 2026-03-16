"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LanguageSwitcher from './LanguageSwitcher';
import {
  Menu, X, MessageSquare, ShieldCheck, Lock, Radio, MapPin, Users,
  LayoutDashboard, Map, UserPlus, SatelliteDish, Activity, Landmark,
  UserCog, Vote, Megaphone, Building2, Shield, Crosshair, ChevronDown,
  Radar, ShieldAlert, Star, Zap, Crown, GitBranch, Home, BookOpen,
  TrendingUp, BarChart3, Award, Sun, Moon, Target
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

/* ─── Dropdown Menu ─────────────────────────────────────────── */
const DD = ({ label, children, width = 'w-64' }) => (
  <div className="group relative">
    <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 tracking-widest uppercase">
      {label}
      <ChevronDown size={11} className="opacity-60 group-hover:rotate-180 transition-transform duration-300" />
    </button>
    {/* Invisible bridge to prevent gap closing */}
    <div className="absolute top-full left-0 h-3 w-full" />
    <div className={`absolute hidden group-hover:flex flex-col top-[calc(100%+12px)] left-0 ${width}
      border rounded-2xl shadow-[0_24px_60px_var(--shadow-clr)]
      backdrop-blur-2xl overflow-hidden z-[300] divide-y divide-black/5`}
      style={{ background: 'var(--navbar-bg)', borderColor: 'var(--border-clr)' }}>
      {children}
    </div>
  </div>
);

/* ─── Dropdown Item ─────────────────────────────────────────── */
const NavLink = ({ href, icon: Icon, label, color = 'text-gray-400', badge, onClick }) => (
  <Link
    href={href}
    onClick={onClick}
    className={`group/item flex items-center gap-3 py-2.5 px-4 hover:bg-black/5 transition-all duration-150 ${color}`}
  >
    {Icon && (
      <span className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center shrink-0 group-hover/item:bg-white/10 transition-all">
        <Icon size={12} />
      </span>
    )}
    <span className="text-[11px] font-semibold tracking-wider flex-1">{label}</span>
    {badge && (
      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-[#DA251D]/20 text-[#DA251D] tracking-wider">{badge}</span>
    )}
  </Link>
);

/* ─── Section Divider ───────────────────────────────────────── */
const SectionLabel = ({ label }) => (
  <div className="px-4 pt-3 pb-1">
    <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">{label}</p>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN NAVBAR
═══════════════════════════════════════════════════════════════ */
const Navbar = ({ currentLang, setLang, openLogin, theme = 'dark', toggleTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const lastScrollY = useRef(0);
  const pathname = usePathname();
  const { t } = useTranslation();
  const close = () => setIsOpen(false);

  useEffect(() => { setMounted(true); }, []);
  const toggleSection = (sec) => setExpandedSection(prev => prev === sec ? null : sec);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 20);
      if (currentY > lastScrollY.current && currentY > 80) {
        setHidden(true);
        setIsOpen(false);
      } else {
        setHidden(false);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
      hidden ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
    }`}>
      {/* Outer padding wrapper */}
      <div className={`mx-4 mt-4 transition-all duration-500 ${scrolled ? 'mx-3 mt-3' : ''}`}>
        <div className={`relative flex items-center justify-between gap-4 px-5 py-3 rounded-2xl border transition-all duration-500`}
          style={{
            background: scrolled ? 'var(--navbar-bg)' : 'rgba(0,0,0,0.3)',
            borderColor: 'var(--border-clr)',
            boxShadow: scrolled ? `0 8px 32px var(--shadow-clr)` : `0 4px 24px var(--shadow-clr)`
          }}>

          {/* ── Left: Logo ────────────────────────────────────────── */}
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
              <span className="text-[8px] text-white/30 font-semibold tracking-[0.15em] uppercase">Election System</span>
            </div>
          </Link>

          {/* ── Center: Desktop Navigation ───────────────────────── */}
          <div className="hidden lg:flex items-center gap-0.5">

            {/* ══ 1. ROLE LOGIN PORTALS ══ */}
            <DD label="Login Portals" width="w-80">
              <SectionLabel label="Uchcha Adhikaar — High Command" />
              <NavLink href="/portal/super-admin/login"   icon={ShieldAlert}  label="Super Admin (L0)"        color="text-red-500"    badge="L0" />
              <NavLink href="/portal/state/login"         icon={Crown}        label="State Admin (L1)"        color="text-purple-400" badge="L1" />
              <SectionLabel label="Kshetra Prabandhan — Regional" />
              <NavLink href="/portal/zone/login"          icon={SatelliteDish} label="Zone Commander (L2)"   color="text-amber-400"  badge="L2" />
              <NavLink href="/portal/district/login"      icon={Building2}    label="District Admin (L3)"     color="text-blue-400"   badge="L3" />
              <NavLink href="/portal/constituency/login"  icon={Landmark}     label="Constituency Admin (L4)" color="text-cyan-400"   badge="L4" />
              <SectionLabel label="Booth Parivaar — Booth Family" />
              <NavLink href="/portal/warriors/login"      icon={Award}        label="Booth President (L5)"    color="text-green-400"  badge="L5" />
              <NavLink href="/portal/booth-manager"       icon={UserCog}      label="Booth Manager (L6)"      color="text-teal-400"   badge="L6" />
              <NavLink href="/portal/jan-sampark/dashboard" icon={Megaphone}  label="Jan Sampark Sathi (L7)"  color="text-emerald-400" badge="L7" />
            </DD>

            {/* ══ 2. DASHBOARDS ══ */}
            <DD label="Dashboards" width="w-72">
              <SectionLabel label="Prabandhan Panels — Admin Panels" />
              <NavLink href="/dashboard/admin/main"         icon={LayoutDashboard} label="Super Admin Dashboard"  color="text-red-400" />
              <NavLink href="/dashboard/admin/state"        icon={Map}             label="State Admin Panel"       color="text-purple-400" />
              <NavLink href="/district-admin"               icon={Building2}       label="District Admin Panel"    color="text-blue-400" />
              <NavLink href="/zone-monitor"                 icon={SatelliteDish}   label="Zone Monitor — Braj"     color="text-amber-400" />
              <NavLink href="/portal/jan-sampark/dashboard" icon={Megaphone}       label="Jan Sampark Dashboard"   color="text-emerald-400" badge="LIVE" />
              <SectionLabel label="Control Tools" />
              <NavLink href="/admin"                        icon={UserCog}         label="Admin Control Panel"     color="text-orange-400" />
              <NavLink href="/portal"                       icon={Shield}          label="Master Portal"           />
            </DD>

            {/* ══ 3. VOTER & FIELD OPS ══ */}
            <DD label="Field Ops" width="w-72">
              <SectionLabel label="Voter Data — 25 Crore DB" />
              <NavLink href="/voters"                         icon={Vote}        label="Voter Search (25 Cr)"    color="text-sky-400" />
              <NavLink href="/jan-sampark/voter-intelligence" icon={BookOpen}    label="Voter Intelligence"      color="text-cyan-400" />
              <NavLink href="/dashboard/search-booth"         icon={Crosshair}   label="Booth Database"          />
              <SectionLabel label="Applications & Reports" />
              <NavLink href="/tracking"                       icon={Activity}    label="Application Tracking"    color="text-yellow-400" />
              <NavLink href="/portal/booth-president"         icon={BarChart3}   label="Booth President Panel"   color="text-green-400" />
            </DD>

            {/* ══ 4. LIVE FEATURES ══ */}
            <DD label="Live" width="w-72">
              <SectionLabel label="Real-time Monitoring" />
              <NavLink href="/war-room"                    icon={Target}        label="Election War Room"        color="text-red-400"     badge="WAR" />
              <NavLink href="/portal/super-admin/tracking" icon={Radar}         label="Live Worker Tracking"   color="text-green-400"  badge="LIVE" />
              <NavLink href="/zone-monitor"                icon={SatelliteDish} label="Zone Monitor — Braj"    color="text-amber-400"  badge="LIVE" />
              <SectionLabel label="Communication" />
              <NavLink href="/chat"                        icon={MessageSquare} label="Secure Chat (E2E AES-256)" color="text-orange-400" badge="NEW" />
              <NavLink href="/portal/conference"           icon={Radio}         label="Video Conference (SFU)"  color="text-red-400"    badge="LIVE" />
              <NavLink href="/portal/super-admin/broadcast" icon={Zap}          label="Broadcast — Sabko Message" color="text-yellow-400" />
            </DD>

          </div>

          {/* ── Right: Actions ────────────────────────────────────── */}
          <div className="flex items-center gap-3 shrink-0">
            <LanguageSwitcher currentLang={currentLang} setLang={setLang} />

            {/* Theme toggle */}
            {mounted && toggleTheme && (
              <button
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-gray-300 hover:text-white shrink-0"
              >
                {theme === 'dark' ? <Sun size={14} className="text-yellow-400" /> : <Moon size={14} className="text-blue-400" />}
              </button>
            )}

            {/* Status dot */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-black text-emerald-400 tracking-widest uppercase">Secure</span>
            </div>

            <Link
              href="/login"
              className="relative overflow-hidden flex items-center gap-2 bg-gradient-to-r from-[#DA251D] to-[#b01e17] hover:from-[#c0211a] hover:to-[#9a1a13] text-white px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase shadow-lg shadow-[#DA251D]/25 active:scale-95 transition-all duration-200 border border-white/10"
            >
              <Lock size={11} />
              {mounted ? t('login') : 'Login'}
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden w-9 h-9 flex items-center justify-center text-white hover:bg-white/5 rounded-xl transition-all border border-white/10"
            >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

          {/* ── Mobile Drawer ────────────────────────────────────── */}
          {isOpen && (
<div className="absolute top-[calc(100%+12px)] left-0 right-0 border rounded-2xl shadow-[0_20px_60px_var(--shadow-clr)] backdrop-blur-2xl lg:hidden z-[300] overflow-hidden"
                style={{ background: 'var(--navbar-bg)', borderColor: 'var(--border-clr)' }}>

              {/* Mobile Language + Status bar */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] font-black text-emerald-400 tracking-widest">SYSTEM SECURE</span>
                </div>
                <div className="flex gap-1.5">
                  {[{code:'en',label:'EN'},{code:'hi',label:'HI'},{code:'ur',label:'UR'}].map(l => (
                    <button key={l.code} onClick={() => setLang(l.code)}
                      className={`px-2 py-1 rounded-md text-[9px] font-black tracking-wider transition-all ${
                        currentLang === l.code ? 'bg-[#DA251D] text-white' : 'text-gray-500 hover:text-white bg-white/5'
                      }`}>{l.label}</button>
                  ))}
                  {toggleTheme && (
                    <button onClick={toggleTheme}
                      className="px-2 py-1 rounded-md text-[9px] font-black tracking-wider bg-white/5 text-gray-400 hover:text-white transition-all flex items-center gap-1"
                    >
                      {theme === 'dark' ? <Sun size={10} className="text-yellow-400" /> : <Moon size={10} className="text-blue-400" />}
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-[70vh] overflow-y-auto">

                {[
                  {
                    key: 'logins', label: 'Login Portals',
                    links: [
                      { href: '/portal/super-admin/login',      icon: ShieldAlert,   label: 'Super Admin (L0)',        color: 'text-red-500',     badge: 'L0' },
                      { href: '/portal/state/login',            icon: Crown,         label: 'State Admin (L1)',        color: 'text-purple-400',  badge: 'L1' },
                      { href: '/portal/zone/login',             icon: SatelliteDish, label: 'Zone Commander (L2)',     color: 'text-amber-400',   badge: 'L2' },
                      { href: '/portal/district/login',         icon: Building2,     label: 'District Admin (L3)',     color: 'text-blue-400',    badge: 'L3' },
                      { href: '/portal/constituency/login',     icon: Landmark,      label: 'Constituency Admin (L4)', color: 'text-cyan-400',    badge: 'L4' },
                      { href: '/portal/warriors/login',         icon: Award,         label: 'Booth President (L5)',    color: 'text-green-400',   badge: 'L5' },
                      { href: '/portal/booth-manager',          icon: UserCog,       label: 'Booth Manager (L6)',      color: 'text-teal-400',    badge: 'L6' },
                      { href: '/portal/jan-sampark/dashboard',  icon: Megaphone,     label: 'Jan Sampark Sathi (L7)', color: 'text-emerald-400', badge: 'L7' },
                    ]
                  },
                  {
                    key: 'dashboards', label: 'Dashboards',
                    links: [
                      { href: '/dashboard/admin/main',          icon: LayoutDashboard, label: 'Super Admin Dashboard',   color: 'text-red-400' },
                      { href: '/dashboard/admin/state',         icon: Map,             label: 'State Admin Panel',       color: 'text-purple-400' },
                      { href: '/district-admin',                icon: Building2,       label: 'District Admin Panel',    color: 'text-blue-400' },
                      { href: '/zone-monitor',                  icon: SatelliteDish,   label: 'Zone Monitor — Braj',     color: 'text-amber-400' },
                      { href: '/admin',                         icon: UserCog,         label: 'Admin Control Panel',     color: 'text-orange-400' },
                      { href: '/portal',                        icon: Shield,          label: 'Master Portal',           color: 'text-gray-300' },
                    ]
                  },
                  {
                    key: 'field', label: 'Field Ops',
                    links: [
                      { href: '/voters',                         icon: Vote,        label: 'Voter Search (25 Cr)',     color: 'text-sky-400' },
                      { href: '/jan-sampark/voter-intelligence', icon: BookOpen,    label: 'Voter Intelligence',       color: 'text-cyan-400' },
                      { href: '/dashboard/search-booth',         icon: Crosshair,   label: 'Booth Database',           color: 'text-gray-300' },
                      { href: '/tracking',                       icon: Activity,    label: 'Application Tracking',    color: 'text-yellow-400' },
                      { href: '/portal/booth-president',         icon: BarChart3,   label: 'Booth President Panel',   color: 'text-green-400' },
                    ]
                  },
                  {
                    key: 'live', label: 'Live',
                    links: [
                      { href: '/war-room',                         icon: Target,        label: 'Election War Room',          color: 'text-red-400',    badge: 'WAR' },
                      { href: '/portal/super-admin/tracking',  icon: Radar,         label: 'Live Worker Tracking',      color: 'text-green-400',  badge: 'LIVE' },
                      { href: '/zone-monitor',                 icon: SatelliteDish, label: 'Zone Monitor — Braj',       color: 'text-amber-400',  badge: 'LIVE' },
                      { href: '/chat',                         icon: MessageSquare, label: 'Secure Chat (E2E AES-256)', color: 'text-orange-400', badge: 'NEW' },
                      { href: '/portal/conference',            icon: Radio,         label: 'Video Conference (SFU)',    color: 'text-red-400',    badge: 'LIVE' },
                      { href: '/portal/super-admin/broadcast', icon: Zap,           label: 'Broadcast Message',         color: 'text-yellow-400' },
                    ]
                  },
                ].map(section => (
                  <div key={section.key} className="border-b border-white/[0.05]">
                    <button
                      onClick={() => toggleSection(section.key)}
                      className="w-full flex items-center justify-between px-5 py-3 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] hover:text-white/60 transition-colors"
                    >
                      {section.label}
                      <ChevronDown
                        size={12}
                        className={`transition-transform duration-300 ${expandedSection === section.key ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {expandedSection === section.key && (
                      <div className="pb-2">
                        {section.links.map(link => (
                          <NavLink key={link.href} href={link.href} icon={link.icon} label={link.label} color={link.color} badge={link.badge} onClick={close} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}

              </div>

              {/* Mobile CTA */}
              <div className="p-4 border-t border-white/5">
                <Link
                  href="/login"
                  onClick={close}
                  className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#DA251D] to-[#b01e17] text-white py-3 rounded-xl text-[11px] font-black tracking-widest uppercase shadow-lg shadow-[#DA251D]/20"
                >
                  <Lock size={12} /> {mounted ? t('login') : 'Login'}
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
