"use client";
// ════════════════════════════════════════════════════════════════
//  OLD ELECTION RESULTS — Embedded viewer from GitHub Pages repo
//  Source: https://just-rebel-spcell.github.io/
// ════════════════════════════════════════════════════════════════
import { useState } from "react";
import {
  BarChart3, ExternalLink, ChevronRight, Home, TrendingUp,
  Globe, MapPin, Calendar, Award, Landmark, Vote, Search, X,
} from "lucide-react";

// ── All election result datasets from the GitHub Pages repo ──
const BASE = "https://just-rebel-spcell.github.io";

const RESULTS = [
  // ─── 2024 ───────────────────────────────────────────────────
  {
    year: "2024", type: "Parliament", state: "India",
    label: "Lok Sabha General Election 2024",
    desc: "Party-wise visualisation — 2009 to 2024 comparison",
    url: `${BASE}/Election_Data_2024/`,
    color: "#ef4444", tag: "LOK SABHA",
  },
  {
    year: "2024", type: "Assembly", state: "Odisha",
    label: "Odisha Assembly Election 2024",
    desc: "Comparison: 2019 vs 2024 assembly results",
    url: `${BASE}/Election_Data_2024/Odisha.html`,
    color: "#f97316", tag: "VIDHAN SABHA",
  },
  {
    year: "2024", type: "Assembly", state: "Andhra Pradesh",
    label: "Andhra Pradesh Assembly Election 2024",
    desc: "Comparison: 2019 vs 2024 assembly results",
    url: `${BASE}/Election_Data_2024/Andhra_Pradesh.html`,
    color: "#eab308", tag: "VIDHAN SABHA",
  },

  // ─── 2023 ───────────────────────────────────────────────────
  {
    year: "2023", type: "Assembly", state: "Karnataka",
    label: "Karnataka Assembly Election 2023",
    desc: "Comparison: 2018 vs 2023 assembly results",
    url: `${BASE}/Election_Data_2023/`,
    color: "#22c55e", tag: "VIDHAN SABHA",
  },

  // ─── 2022 ───────────────────────────────────────────────────
  {
    year: "2022", type: "Assembly", state: "Uttar Pradesh",
    label: "Uttar Pradesh Assembly Election 2022",
    desc: "Visual guide — UP elections 2012 to 2022",
    url: `${BASE}/Election_Data_2022/uttarpradesh.html`,
    color: "#DA251D", tag: "UP • VIDHAN SABHA", featured: true,
  },
  {
    year: "2022", type: "Assembly", state: "Uttarakhand",
    label: "Uttarakhand Assembly Election 2022",
    desc: "Comparison: 2012 to 2022",
    url: `${BASE}/Election_Data_2022/Uttarakhand.html`,
    color: "#06b6d4", tag: "VIDHAN SABHA",
  },
  {
    year: "2022", type: "Assembly", state: "Punjab",
    label: "Punjab Assembly Election 2022",
    desc: "Comparison: 2012 to 2022",
    url: `${BASE}/Election_Data_2022/punjab.html`,
    color: "#8b5cf6", tag: "VIDHAN SABHA",
  },
  {
    year: "2022", type: "Assembly", state: "Goa",
    label: "Goa Assembly Election 2022",
    desc: "Comparison: 2012 to 2022",
    url: `${BASE}/Election_Data_2022/goa.html`,
    color: "#f59e0b", tag: "VIDHAN SABHA",
  },
  {
    year: "2022", type: "Assembly", state: "Manipur",
    label: "Manipur Assembly Election 2022",
    desc: "Comparison: 2012 to 2022",
    url: `${BASE}/Election_Data_2022/manipur.html`,
    color: "#10b981", tag: "VIDHAN SABHA",
  },

  // ─── 2021 ───────────────────────────────────────────────────
  {
    year: "2021", type: "Assembly", state: "West Bengal",
    label: "West Bengal Assembly Election 2021",
    desc: "Comparison: 2011 to 2021",
    url: `${BASE}/Election_Data_2021/West_Bengal.html`,
    color: "#3b82f6", tag: "VIDHAN SABHA",
  },
  {
    year: "2021", type: "Assembly", state: "Assam",
    label: "Assam Assembly Election 2021",
    desc: "Comparison: 2011 to 2021",
    url: `${BASE}/Election_Data_2021/Assam.html`,
    color: "#22c55e", tag: "VIDHAN SABHA",
  },
  {
    year: "2021", type: "Assembly", state: "Tamil Nadu",
    label: "Tamil Nadu Assembly Election 2021",
    desc: "History from 1967 to 2021",
    url: `${BASE}/Election_Data/tamil_nadu.html`,
    color: "#f97316", tag: "VIDHAN SABHA",
  },
  {
    year: "2021", type: "Assembly", state: "Kerala",
    label: "Kerala Assembly Election 2021",
    desc: "History from 1957 to 2021",
    url: `${BASE}/Election_Data/kerala.html`,
    color: "#06b6d4", tag: "VIDHAN SABHA",
  },
  {
    year: "2021", type: "Assembly", state: "Pondicherry",
    label: "Pondicherry Assembly Election 2021",
    desc: "History from 1957 to 2021",
    url: `${BASE}/Election_Data/pondi.html`,
    color: "#8b5cf6", tag: "VIDHAN SABHA",
  },

  // ─── 2019 ───────────────────────────────────────────────────
  {
    year: "2019", type: "Parliament", state: "India",
    label: "Lok Sabha General Election 2019",
    desc: "National Parliament election results & dates",
    url: `${BASE}/Election_Data_2019/`,
    color: "#ef4444", tag: "LOK SABHA",
  },
  {
    year: "2019", type: "Parliament", state: "India",
    label: "Election Dates 2019 — Lok Sabha Schedule",
    desc: "Phase-wise election schedule for 2019",
    url: `${BASE}/Election_Dates_2019/`,
    color: "#f59e0b", tag: "SCHEDULE",
  },

  // ─── 2018 ───────────────────────────────────────────────────
  {
    year: "2018", type: "Assembly", state: "Karnataka",
    label: "Karnataka Assembly Election 2018",
    desc: "Comparison: 2013 to 2018",
    url: `${BASE}/Election_Data_2018/Karnataka.html`,
    color: "#22c55e", tag: "VIDHAN SABHA",
  },

  // ─── Historical ─────────────────────────────────────────────
  {
    year: "Historical", type: "Parliament", state: "India",
    label: "Parliament Elections — Since Independence",
    desc: "Treemap of party MP seats from Independence onwards",
    url: `${BASE}/Parliment_Elections/`,
    color: "#ef4444", tag: "HISTORICAL",
  },
  {
    year: "Historical", type: "Assembly", state: "Multiple",
    label: "Assembly Elections — Historical Treemap",
    desc: "Party performance in Assembly elections since Independence",
    url: `${BASE}/Assembly_Election/`,
    color: "#8b5cf6", tag: "HISTORICAL",
  },
  {
    year: "Historical", type: "Assembly", state: "Bihar",
    label: "Bihar Assembly Election 2015",
    desc: "Bihar election results 2015 visual analysis",
    url: `${BASE}/Bihar_Election/`,
    color: "#f97316", tag: "VIDHAN SABHA",
  },
  {
    year: "Historical", type: "Assembly", state: "Tamil Nadu",
    label: "Tamil Nadu Assembly Election 2011",
    desc: "Party performance in TN Assembly Election 2011",
    url: `${BASE}/Assembly_Election_TN/`,
    color: "#06b6d4", tag: "VIDHAN SABHA",
  },
  {
    year: "Historical", type: "Parliament", state: "India",
    label: "Vote Analysis — Vote Share Since Independence",
    desc: "Vote share percentage for each party from Independence",
    url: `${BASE}/Vote_Analysis/`,
    color: "#22c55e", tag: "ANALYSIS",
  },
  {
    year: "Historical", type: "Parliament", state: "India",
    label: "Asset Analysis — MP Assets & Criminal Cases 2014",
    desc: "MP-wise asset and criminal case analysis (Lok Sabha 2014)",
    url: `${BASE}/Asset_Analysis/`,
    color: "#eab308", tag: "ANALYSIS",
  },
];

const YEARS = ["All", ...["2024", "2023", "2022", "2021", "2019", "2018", "Historical"]];
const TYPES = ["All", "Parliament", "Assembly"];

// ════════════════════════════════════════════════════════════════
export default function OldResults() {
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(null); // currently embedded

  const filtered = RESULTS.filter(r => {
    if (selectedYear !== "All" && r.year !== selectedYear) return false;
    if (selectedType !== "All" && r.type !== selectedType) return false;
    if (search && !`${r.label} ${r.state} ${r.year}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)" }}>

      {/* ── Header ── */}
      <div className="sticky top-0 z-30 border-b px-4 py-3"
        style={{ background: "rgba(1,8,4,0.97)", borderColor: "var(--border-clr)", backdropFilter: "blur(16px)" }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(218,37,29,0.15)" }}>
              <BarChart3 size={15} style={{ color: "var(--ems-red)" }} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-white">Old Election Results</p>
              <p className="text-[9px] text-gray-500">Visual analytics from just-rebel-spcell.github.io</p>
            </div>
          </div>
          <a href={BASE} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-bold text-gray-400 hover:text-white hover:border-gray-500 transition-all shrink-0"
            style={{ borderColor: "var(--border-clr)" }}>
            <Globe size={11} /> Open Source Site <ExternalLink size={10} />
          </a>
        </div>
      </div>

      {/* ── Embedded iframe viewer ── */}
      {active && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "rgba(0,0,0,0.97)" }}>
          {/* iframe header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b shrink-0"
            style={{ background: "rgba(1,8,4,0.99)", borderColor: "var(--border-clr)" }}>
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="px-2 py-0.5 rounded text-[9px] font-black" style={{ background: `${active.color}20`, color: active.color }}>{active.tag}</span>
              <p className="text-xs font-black text-white truncate">{active.label}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a href={active.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-bold text-gray-400 hover:text-white transition-all"
                style={{ borderColor: "var(--border-clr)" }}>
                <ExternalLink size={11} /> Open in new tab
              </a>
              <button onClick={() => setActive(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border text-gray-400 hover:text-red-400 hover:border-red-500/50 transition-all"
                style={{ borderColor: "var(--border-clr)" }}>
                <X size={15} />
              </button>
            </div>
          </div>
          {/* The iframe */}
          <iframe
            src={active.url}
            title={active.label}
            className="flex-1 w-full border-0"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ── Featured: UP 2022 ── */}
        {(() => {
          const up = RESULTS.find(r => r.featured);
          return up && (
            <div className="rounded-2xl p-5 mb-6 border flex flex-col sm:flex-row sm:items-center gap-4"
              style={{ background: "rgba(218,37,29,0.06)", borderColor: "rgba(218,37,29,0.25)" }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "rgba(218,37,29,0.15)" }}>
                <BarChart3 size={22} style={{ color: "#DA251D" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="px-2 py-0.5 rounded text-[9px] font-black bg-red-500/20 text-red-400">⭐ FEATURED</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-black" style={{ background: "rgba(218,37,29,0.15)", color: "#DA251D" }}>UP • VIDHAN SABHA 2022</span>
                </div>
                <p className="text-sm font-black text-white">{up.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{up.desc}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => setActive(up)}
                  className="px-4 py-2.5 rounded-xl text-xs font-black text-white active:scale-95 transition-transform"
                  style={{ background: "linear-gradient(135deg,#DA251D,#9b1c1c)" }}>
                  View in EMS
                </button>
                <a href={up.url} target="_blank" rel="noopener noreferrer"
                  className="px-3 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 text-gray-400 hover:text-white transition-all"
                  style={{ borderColor: "var(--border-clr)" }}>
                  <ExternalLink size={12} /> New Tab
                </a>
              </div>
            </div>
          );
        })()}

        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          {/* Search */}
          <div className="flex items-center gap-2 flex-1 px-3 py-2.5 rounded-xl border min-w-0"
            style={{ background: "var(--input-bg)", borderColor: "var(--input-border)" }}>
            <Search size={13} className="text-gray-500 shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search results by name or state..."
              className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder-gray-600"
              style={{ color: "var(--foreground)" }} />
            {search && <button onClick={() => setSearch("")}><X size={11} className="text-gray-500 hover:text-white" /></button>}
          </div>
          {/* Year filter */}
          <div className="flex gap-1 flex-wrap">
            {YEARS.map(y => (
              <button key={y} onClick={() => setSelectedYear(y)}
                className="px-3 py-1.5 rounded-lg text-[10px] font-black border transition-all"
                style={selectedYear === y
                  ? { background: "var(--ems-red)", borderColor: "var(--ems-red)", color: "#fff" }
                  : { background: "var(--surface)", borderColor: "var(--border-clr)", color: "var(--foreground)" }}>
                {y}
              </button>
            ))}
          </div>
          {/* Type filter */}
          <div className="flex gap-1">
            {TYPES.map(t => (
              <button key={t} onClick={() => setSelectedType(t)}
                className="px-3 py-1.5 rounded-lg text-[10px] font-black border transition-all"
                style={selectedType === t
                  ? { background: "#3b82f6", borderColor: "#3b82f6", color: "#fff" }
                  : { background: "var(--surface)", borderColor: "var(--border-clr)", color: "var(--foreground)" }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* ── Count ── */}
        <p className="text-[10px] text-gray-600 mb-4 font-bold">
          Showing {filtered.length} dataset{filtered.length !== 1 ? "s" : ""}
        </p>

        {/* ── Results Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r, i) => (
            <div key={i} className="rounded-xl border p-4 flex flex-col gap-3 transition-all hover:border-gray-600"
              style={{ background: "var(--card-bg)", borderColor: r.featured ? "rgba(218,37,29,0.3)" : "var(--border-clr)" }}>
              {/* Top */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: `${r.color}14` }}>
                    {r.type === "Parliament"
                      ? <Landmark size={14} style={{ color: r.color }} />
                      : <Vote size={14} style={{ color: r.color }} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-black text-white leading-tight">{r.label}</p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="flex items-center gap-0.5 text-[9px] text-gray-500"><Calendar size={8} /> {r.year}</span>
                      <span className="flex items-center gap-0.5 text-[9px] text-gray-500"><MapPin size={8} /> {r.state}</span>
                    </div>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[8px] font-black shrink-0"
                  style={{ background: `${r.color}14`, color: r.color }}>
                  {r.tag}
                </span>
              </div>

              {/* Desc */}
              <p className="text-[10px] text-gray-500 leading-relaxed">{r.desc}</p>

              {/* Actions */}
              <div className="flex gap-2 mt-auto pt-1">
                <button onClick={() => setActive(r)}
                  className="flex-1 py-2 rounded-lg text-[10px] font-black text-white flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                  style={{ background: `linear-gradient(135deg, ${r.color}, ${r.color}99)` }}>
                  <TrendingUp size={11} /> View in EMS
                </button>
                <a href={r.url} target="_blank" rel="noopener noreferrer"
                  className="px-3 py-2 rounded-lg border text-[10px] font-bold text-gray-400 hover:text-white flex items-center gap-1.5 transition-all"
                  style={{ borderColor: "var(--border-clr)" }}>
                  <ExternalLink size={11} /> New Tab
                </a>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16">
              <BarChart3 size={36} className="mx-auto text-gray-700 mb-3" />
              <p className="text-sm font-bold text-gray-500">No results found</p>
              <p className="text-xs text-gray-600 mt-1">Try a different year or type filter</p>
            </div>
          )}
        </div>

        {/* ── Footer credit ── */}
        <div className="mt-10 pt-5 border-t text-center" style={{ borderColor: "var(--border-clr)" }}>
          <p className="text-[10px] text-gray-600">
            Data visualizations powered by{" "}
            <a href={BASE} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">just-rebel-spcell.github.io</a>
            {" "}· Samajwadi Party Data Analytics · EMS PRO 2026
          </p>
        </div>
      </div>
    </div>
  );
}
