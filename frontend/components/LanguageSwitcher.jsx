"use client";
import React from 'react';

const LanguageSwitcher = ({ currentLang, setLang }) => {
  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'ur', label: 'اردو' }
  ];

  return (
    <div className="flex gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLang(lang.code)}
          className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
            currentLang === lang.code 
            ? 'bg-blue-600 text-white shadow-lg' 
            : 'text-gray-400 hover:text-white'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;