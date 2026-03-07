"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import LanguageSwitcher from './LanguageSwitcher';
import { Menu, X } from 'lucide-react'; // Icons ke liye

const Navbar = ({ currentLang, setLang, openLogin }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="elite-card !rounded-2xl px-4 md:px-6 py-4 flex items-center justify-between border border-white/10 bg-black/20 backdrop-blur-xl transition-all duration-500 fixed top-4 left-4 right-4 z-50">
      
      {/* 1. Logo Section */}
      <Link href="/" className="flex items-center gap-2 z-50">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-600/30">E</div>
        <span className="text-xl font-black tracking-tighter text-white uppercase">
          EMS<span className="text-[#DA251D]">.UP</span>
        </span>
      </Link>

      {/* 2. Desktop Navigation (Laptop ke liye) */}
      <div className="hidden lg:flex items-center gap-6 text-[11px] font-bold text-gray-300 uppercase tracking-widest">
        {/* A. Ground Operations */}
        <div className="group relative cursor-pointer py-2">
          <span className="hover:text-blue-400 flex items-center gap-1 transition">Ground Work ▾</span>
          <div className="absolute hidden group-hover:block bg-[#010804]/95 border border-white/10 p-3 rounded-xl top-full left-0 w-56 shadow-2xl backdrop-blur-md">
            <Link href="/voters" className="block py-2 px-3 hover:bg-white/5 rounded-lg border-b border-white/5 font-black text-blue-400">Voter Search Portal</Link>
            <Link href="/jan-sampark/voter-intelligence" className="block py-2 px-3 hover:bg-white/5 rounded-lg border-b border-white/5">Voter Intelligence</Link>
            <Link href="/dashboard/search-booth" className="block py-2 px-3 hover:bg-white/5 rounded-lg">Booth Database</Link>
          </div>
        </div>

        {/* B. Administration Units */}
        <div className="group relative cursor-pointer py-2">
          <span className="hover:text-blue-400 flex items-center gap-1 transition">Control Units ▾</span>
          <div className="absolute hidden group-hover:block bg-[#010804]/95 border border-white/10 p-3 rounded-xl top-full left-0 w-56 shadow-2xl backdrop-blur-md">
            <Link href="/dashboard/admin/main" className="block py-2 px-3 hover:bg-white/5 rounded-lg border-b border-white/5">Main Dashboard</Link>
            <Link href="/dashboard/admin/state" className="block py-2 px-3 hover:bg-white/5 rounded-lg border-b border-white/5">State Admin</Link>
            <Link href="/zone-monitor" className="block py-2 px-3 hover:bg-white/5 rounded-lg border-b border-white/5">Zone Monitor Unit</Link>
            <Link href="/district-admin" className="block py-2 px-3 hover:bg-white/5 rounded-lg border-b border-white/5">District Unit</Link>
          </div>
        </div>

        {/* C. Portals & Access */}
        <div className="group relative cursor-pointer py-2">
          <span className="hover:text-blue-400 flex items-center gap-1 transition">Portals ▾</span>
          <div className="absolute hidden group-hover:block bg-[#010804]/95 border border-white/10 p-3 rounded-xl top-full left-0 w-60 shadow-2xl backdrop-blur-md">
            <Link href="/portal" className="block py-2 px-3 hover:bg-white/5 rounded-lg border-b border-white/5">Master Portal</Link>
            <Link href="/portal/super-admin/login" className="block py-2 px-3 hover:bg-white/5 rounded-lg border-b border-white/5">Super Admin Login</Link>
            <Link href="/portal/state" className="block py-2 px-3 hover:bg-white/5 rounded-lg border-b border-white/5">State Portal</Link>
            <Link href="/portal/district/login" className="block py-2 px-3 hover:bg-white/5 rounded-lg border-b border-white/5">District Login</Link>
            <Link href="/portal/warriors/login" className="block py-2 px-3 hover:bg-white/5 rounded-lg">Warriors / Booth</Link>
          </div>
        </div>

        {/* D. System Maintenance */}
        <div className="group relative cursor-pointer py-2">
          <span className="hover:text-blue-400 flex items-center gap-1 transition">System ▾</span>
          <div className="absolute hidden group-hover:block bg-[#010804]/95 border border-white/10 p-3 rounded-xl top-full left-0 w-48 shadow-2xl backdrop-blur-md">
            <Link href="/signup" className="block py-2 px-3 hover:bg-white/5 rounded-lg border-b border-white/5">New Signup</Link>
            <Link href="/tracking" className="block py-2 px-3 hover:bg-white/5 rounded-lg font-black text-red-500">Live Tracking</Link>
          </div>
        </div>
      </div>

      {/* 3. Right Side Logic */}
      <div className="flex items-center gap-2 md:gap-5">
        <div className="hidden sm:block">
          <LanguageSwitcher currentLang={currentLang} setLang={setLang} />
        </div>
        
        <button 
          onClick={openLogin}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-[10px] md:text-xs font-black shadow-lg shadow-blue-600/30 active:scale-95 border border-white/10"
        >
          LOGIN
        </button>

        {/* Mobile Toggle Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden text-white p-2 hover:bg-white/5 rounded-lg transition"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* 4. Mobile Menu Overlay */}
      {isOpen && (
        <div className="absolute top-20 left-0 right-0 bg-[#010804]/98 border border-white/10 rounded-3xl p-6 mx-2 flex flex-col gap-4 lg:hidden shadow-2xl backdrop-blur-2xl z-[100] animate-in slide-in-from-top-5 duration-300">
          <div className="flex flex-col gap-3 max-h-[70vh] overflow-y-auto">
            <p className="text-gray-500 text-[9px] uppercase tracking-widest border-b border-white/5 pb-2">Admin & Operations</p>
            <Link onClick={() => setIsOpen(false)} href="/voters" className="text-blue-400 font-bold py-2">Voter Search</Link>
            <Link onClick={() => setIsOpen(false)} href="/jan-sampark/voter-intelligence" className="py-2 text-gray-300">Voter Intelligence</Link>
            <Link onClick={() => setIsOpen(false)} href="/dashboard/admin/main" className="py-2 text-gray-300">Main Dashboard</Link>
            <Link onClick={() => setIsOpen(false)} href="/zone-monitor" className="py-2 text-gray-300">Zone Monitor</Link>
            
            <p className="text-gray-500 text-[9px] uppercase tracking-widest border-b border-white/5 pb-2 mt-4">Portals</p>
            <Link onClick={() => setIsOpen(false)} href="/portal" className="py-2 text-gray-300">Master Portal</Link>
            <Link onClick={() => setIsOpen(false)} href="/portal/warriors/login" className="py-2 text-gray-300">Warrior Login</Link>
            
            <p className="text-gray-500 text-[9px] uppercase tracking-widest border-b border-white/5 pb-2 mt-4">System</p>
            <Link onClick={() => setIsOpen(false)} href="/signup" className="py-2 text-gray-300">New Signup</Link>
            <Link onClick={() => setIsOpen(false)} href="/tracking" className="text-red-500 font-bold py-2">Live Tracking</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;