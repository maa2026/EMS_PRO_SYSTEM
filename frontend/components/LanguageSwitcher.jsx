"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';

const LANGS = [
  { code: 'en', label: 'English',  short: 'EN',  dir: 'ltr' },
  { code: 'hi', label: 'हिंदी',    short: 'HI',  dir: 'ltr' },
  { code: 'ur', label: 'اردو',     short: 'UR',  dir: 'rtl' },
];

const LanguageSwitcher = ({ currentLang, setLang }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const active = LANGS.find(l => l.code === currentLang) || LANGS[0];

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Trigger pill */}
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-gray-300 hover:text-white"
      >
        <Globe size={12} className="text-emerald-400" />
        <span className="text-[10px] font-black tracking-widest">{active.short}</span>
        <svg className={`w-2.5 h-2.5 opacity-40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 10 6">
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-36 bg-[#07120d] border border-white/[0.08] rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl overflow-hidden z-[400]">
          <div className="px-3 pt-2.5 pb-1">
            <p className="text-[8px] font-black text-white/25 uppercase tracking-[0.25em]">Language</p>
          </div>
          {LANGS.map(lang => (
            <button
              key={lang.code}
              dir={lang.dir}
              onClick={() => { setLang(lang.code); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-all ${
                lang.code === currentLang
                  ? 'bg-[#DA251D]/15 text-white'
                  : 'text-gray-400 hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                lang.code === currentLang ? 'bg-[#DA251D]/30 text-[#ff6b65]' : 'bg-white/5 text-gray-500'
              }`}>{lang.short}</span>
              <span className="text-[12px] font-semibold">{lang.label}</span>
              {lang.code === currentLang && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </button>
          ))}
          <div className="h-2" />
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;