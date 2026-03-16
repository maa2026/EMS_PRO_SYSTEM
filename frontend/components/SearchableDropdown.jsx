"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * SearchableDropdown
 *
 * Props:
 * - label: string (optional) - label shown above dropdown
 * - options: Array<string|{ value, label }> - options list
 * - value: selected value
 * - onChange: (value) => void
 * - placeholder: string
 * - disabled: boolean
 * - className, style: styling
 * - searchPlaceholder: string
 * - required: boolean
 * - noOptionsText: string
 * - closeOnSelect: boolean (default true)
 */

const normalizeOption = (opt) => {
  if (typeof opt === 'string') return { value: opt, label: opt };
  return { value: opt.value, label: opt.label ?? opt.value };
};

export default function SearchableDropdown({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select',
  disabled = false,
  className = '',
  style = {},
  searchPlaceholder = 'Type to search...',
  required = false,
  noOptionsText = 'No options',
  closeOnSelect = true,
  maxHeight = 240,
  dropdownId,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  const normalizedOptions = options.map(normalizeOption);
  const selectedOption = normalizedOptions.find(opt => opt.value === value);

  const filtered = normalizedOptions.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (selected) => {
    if (onChange) onChange(selected.value);
    if (closeOnSelect) setIsOpen(false);
    setSearch('');
  };

  const displayLabel = selectedOption ? selectedOption.label : placeholder;
  const displayClass = selectedOption ? 'text-white font-medium' : 'text-gray-400';

  return (
    <div ref={ref} className={`relative w-full ${className}`} style={style}>
      {label && (
        <label className="block text-gray-400 text-sm mb-2 ml-1">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none ${
          disabled
            ? 'bg-gray-800 border-gray-700 cursor-not-allowed'
            : 'bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.12)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.07)]'
        } ${isOpen ? 'border-[rgba(218,37,29,0.8)] bg-[rgba(255,255,255,0.07)] shadow-[0_0_0_3px_rgba(218,37,29,0.2)]' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        id={dropdownId}
      >
        <span className={`text-sm truncate ${displayClass}`}>{displayLabel}</span>
        <ChevronDown className={`w-5 h-5 text-[#DA251D] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute z-50 w-full mt-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.12)] rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200" 
          style={{ maxHeight: maxHeight, overflowY: 'auto' }}
        >
          <div className="p-3 bg-[rgba(0,0,0,0.9)] sticky top-0">
            <input
              autoFocus
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.12)] rounded-lg outline-none text-white focus:border-[rgba(218,37,29,0.8)] focus:shadow-[0_0_0_3px_rgba(218,37,29,0.2)] transition-all duration-200"
            />
          </div>
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-400">{noOptionsText}</div>
          ) : (
            filtered.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt)}
                className={`w-full text-left px-4 py-3 text-sm transition-all duration-200 border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(218,37,29,0.1)] hover:text-white hover:border-[rgba(218,37,29,0.3)] ${
                  value === opt.value ? 'bg-[rgba(218,37,29,0.15)] text-white border-[rgba(218,37,29,0.5)]' : 'text-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
