"use client";
/**
 * ======================================================================
 * SYSTEM: EMS.UP SUPER ADMIN
 * MODULE: LIVE WORKFORCE TRACKING COMMAND CENTER
 * Tracks: State → Zone → District → Booth President → Booth Manager → JSS
 * Data source: /api/workers/online-status (Redis heartbeat, 35s TTL)
 * ======================================================================
 */

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import {
  ShieldAlert, Wifi, WifiOff, RefreshCw, Users, Radio,
  Filter, Search, ChevronRight, Clock, MapPin, Activity,
  AlertCircle, Circle,
} from "lucide-react";

/* ---- Lazy-load Leaflet map (no SSR) ---- */
const AdminTrackingMap = dynamic(
  () => import("@/components/AdminTrackingMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full text-gray-700 text-[11px] font-black uppercase tracking-widest">
        Loading Map…
      </div>
    ),
  }
);

/* ---- Role metadata ---- */
const ROLE_META = [
  { key: "ALL",       label: "Sabhi",            color: "#e5e7eb" },
  { key: "STATE",     label: "State User",        color: "#a855f7" },
  { key: "ZONE",      label: "Zone Commander",    color: "#f59e0b" },
  { key: "DISTRICT",  label: "District Admin",    color: "#3b82f6" },
  { key: "PRES",      label: "Booth President",   color: "#22c55e" },
  { key: "MGR",       label: "Booth Manager",     color: "#06b6d4" },
  { key: "JSS",       label: "Jan Sampark Sathi", color: "#DA251D" },
];

function roleColor(role = "") {
  const r = role.toUpperCase();
  if (r.includes("STATE"))    return "#a855f7";
  if (r.includes("ZONE"))     return "#f59e0b";
  if (r.includes("DISTRICT") || r.includes("DIST")) return "#3b82f6";
  if (r.includes("PRESIDENT") || r.includes("PRES")) return "#22c55e";
  if (r.includes("MANAGER")  || r.includes("MGR"))  return "#06b6d4";
  if (r.includes("JSS") || r.includes("SAMPARK") || r.includes("SATHI")) return "#DA251D";
  return "#9ca3af";
}

function roleMatchesFilter(role = "", filter) {
  if (filter === "ALL") return true;
  return role.toUpperCase().includes(filter);
}

function timeSince(ts) {
  if (!ts) return "—";
  const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (s < 60)  return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

/* ---- History log entry ---- */
function buildHistoryEntry(worker, status) {
  return {
    id:        `${worker.workerId}-${Date.now()}`,
    workerId:  worker.workerId,
    name:      worker.name     || "Unknown",
    role:      worker.role     || "—",
    district:  worker.district || "—",
    status,       // "ONLINE" | "OFFLINE"
    ts:        new Date().toISOString(),
  };
}

const POLL_MS = 10_000;
const MAX_HISTORY = 200;

/* ==================================================================== */
export default function SuperAdminTracking() {
  /* ---- API state ---- */
  const [liveData,   setLiveData]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [apiError,   setApiError]   = useState(false);
  const [lastSync,   setLastSync]   = useState(null);

  /* ---- GeoJSON state ---- */
  const [geoData, setGeoData] = useState(null);

  /* ---- UI state ---- */
  const [roleFilter,  setRoleFilter]  = useState("ALL");
  const [distFilter,  setDistFilter]  = useState("ALL");
  const [search,      setSearch]      = useState("");
  const [selectedId,  setSelectedId]  = useState(null);
  const [tab,         setTab]         = useState("map"); // "map" | "history"

  /* ---- History log ---- */
  const [history, setHistory] = useState([]);
  const prevSetRef = useRef(new Set());   // previous set of online workerIds

  /* ---- Fetch presence ---- */
  const fetchPresence = useCallback(async () => {
    try {
      setApiError(false);
      const res  = await fetch("/api/workers/online-status");
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (!data.success) throw new Error();

      setLiveData(data);
      setLastSync(new Date());

      /* Build history diff */
      const nowIds  = new Set((data.workers || []).map(w => w.workerId));
      const prevIds = prevSetRef.current;
      const entries = [];

      /* Workers that just came online */
      (data.workers || []).forEach(w => {
        if (!prevIds.has(w.workerId)) entries.push(buildHistoryEntry(w, "ONLINE"));
      });
      /* Workers that went offline */
      prevIds.forEach(id => {
        if (!nowIds.has(id)) {
          const last = liveData?.workers?.find(w => w.workerId === id);
          if (last) entries.push(buildHistoryEntry(last, "OFFLINE"));
          else entries.push({ id: `${id}-${Date.now()}`, workerId: id, name: "?", role: "—", district: "—", status: "OFFLINE", ts: new Date().toISOString() });
        }
      });

      if (entries.length > 0) {
        setHistory(prev => [...entries, ...prev].slice(0, MAX_HISTORY));
      }
      prevSetRef.current = nowIds;
    } catch {
      setApiError(true);
    } finally {
      setLoading(false);
    }
  }, [liveData]);

  useEffect(() => {
    fetchPresence();
    const id = setInterval(fetchPresence, POLL_MS);
    return () => clearInterval(id);
  }, []);   // intentionally omit fetchPresence to avoid restart loop

  /* ---- Load UP districts GeoJSON ---- */
  useEffect(() => {
    fetch("/up-districts.geojson")
      .then(r => r.json())
      .then(setGeoData)
      .catch(() => {});
  }, []);

  /* ---- Derived data ---- */
  const allWorkers  = liveData?.workers ?? [];
  const totalOnline = liveData?.total   ?? 0;
  const byDistrict  = liveData?.byDistrict ?? {};

  /* Districts list for filter */
  const districtList = ["ALL", ...Object.keys(byDistrict).sort()];

  /* Filtered workers for table + map */
  const filtered = allWorkers.filter(w => {
    const matchRole = roleMatchesFilter(w.role, roleFilter);
    const matchDist = distFilter === "ALL" || (w.district || "").toLowerCase() === distFilter.toLowerCase();
    const matchSrch = !search || [w.name, w.role, w.district, w.workerId]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()));
    return matchRole && matchDist && matchSrch;
  });

  /* Role breakdown counts */
  const roleBreakdown = ROLE_META.filter(r => r.key !== "ALL").map(r => ({
    ...r,
    count: allWorkers.filter(w => roleMatchesFilter(w.role, r.key)).length,
  }));

  /* ═══════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">

      {/* ── TOP NAV STRIP ── */}
      <div className="sticky top-0 z-50 bg-[#050505]/95 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="p-3 bg-red-600/20 rounded-2xl border border-red-600/30">
            <ShieldAlert size={22} className="text-red-500" />
          </div>
          <div>
            <h1 className="text-xl font-black italic uppercase tracking-tighter leading-none">
              SUPER ADMIN <span className="text-red-600">LIVE TRACKING</span>
            </h1>
            <p className="text-[9px] text-gray-600 uppercase font-black tracking-[0.5em] mt-0.5">
              Uttar Pradesh · All Nodes · Heartbeat 10s
            </p>
          </div>
        </div>

        {/* Live status chip */}
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black border ${
            apiError  ? "border-red-800 text-red-400 bg-red-900/20"
            : loading ? "border-gray-700 text-gray-500 bg-gray-900/20"
            : "border-green-800 text-green-400 bg-green-900/20"}`}>
            {apiError   ? <WifiOff size={11} /> :
             loading    ? <RefreshCw size={11} className="animate-spin" /> :
                          <Wifi size={11} />}
            {apiError ? "Offline" : loading ? "Connecting…" :
              <>{totalOnline.toLocaleString()} Online
                <span className="relative flex h-2 w-2 ml-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              </>}
          </div>
          <button
            onClick={fetchPresence}
            className="p-2 rounded-xl border border-white/10 hover:bg-white/5 transition-all"
            title="Refresh now"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-gray-500" : "text-gray-400"} />
          </button>
          {lastSync && (
            <span className="text-[9px] text-gray-700 font-mono">
              {lastSync.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <div className="p-6 max-w-screen-2xl mx-auto space-y-6">

        {/* ── STAT ROW ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
          {/* Total card */}
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-5 flex flex-col gap-1 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 text-gray-500">
              <Users size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest">Total Online</span>
            </div>
            <p className="text-3xl font-black italic">{loading ? "—" : totalOnline.toLocaleString()}</p>
          </div>

          {/* Per-role breakdown */}
          {roleBreakdown.map(r => (
            <button
              key={r.key}
              onClick={() => setRoleFilter(prev => prev === r.key ? "ALL" : r.key)}
              className={`relative bg-white/5 border rounded-[2rem] p-5 flex flex-col gap-1 text-left transition-all ${
                roleFilter === r.key ? "border-white/30 bg-white/10" : "border-white/10 hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.color }}></span>
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 truncate">{r.label}</span>
              </div>
              <p className="text-2xl font-black italic" style={{ color: r.color }}>
                {loading ? "—" : r.count}
              </p>
              {roleFilter === r.key && (
                <span className="absolute top-3 right-3 text-[8px] font-black text-white/40 uppercase tracking-widest">Active Filter</span>
              )}
            </button>
          ))}
        </div>

        {/* ── FILTERS BAR ── */}
        <div className="flex flex-wrap items-center gap-3 bg-white/5 border border-white/10 rounded-[2rem] p-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
            <input
              type="text"
              placeholder="Name, Role, District, Worker ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-black/40 border border-white/10 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-red-600 text-[11px] font-bold text-white placeholder-gray-700"
            />
          </div>

          {/* District filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={13} />
            <select
              value={distFilter}
              onChange={e => setDistFilter(e.target.value)}
              className="bg-black/40 border border-white/10 pl-9 pr-6 py-2.5 rounded-xl focus:outline-none focus:border-red-600 text-[11px] font-bold text-white appearance-none"
            >
              {districtList.map(d => (
                <option key={d} value={d}>{d === "ALL" ? "Sab District" : d}</option>
              ))}
            </select>
          </div>

          {/* Role pills */}
          <div className="flex flex-wrap gap-2">
            {ROLE_META.map(r => (
              <button
                key={r.key}
                onClick={() => setRoleFilter(r.key)}
                className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all"
                style={{
                  borderColor: roleFilter === r.key ? r.color : "rgba(255,255,255,0.1)",
                  color:       roleFilter === r.key ? r.color : "#6b7280",
                  background:  roleFilter === r.key ? `${r.color}15` : "transparent",
                }}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Showing count */}
          <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-auto whitespace-nowrap">
            {filtered.length} / {allWorkers.length} workers
          </span>
        </div>

        {/* ── TAB SWITCH ── */}
        <div className="flex gap-3">
          {[
            { id: "map",     label: "Live Map",     icon: <MapPin size={14}/> },
            { id: "history", label: "Activity Log", icon: <Activity size={14}/> },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                tab === t.id
                  ? "bg-red-600 border-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]"
                  : "border-white/10 text-gray-500 hover:border-white/20"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════
             TAB: MAP
        ══════════════════════════════════════════════════════════════ */}
        {tab === "map" && (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">

            {/* Map panel */}
            <div className="bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden">
              <div className="px-8 py-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Radio size={16} className="text-red-500 animate-pulse" />
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Live GPS Map · Uttar Pradesh</span>
                </div>
                <div className="flex items-center gap-5 text-[9px] font-black text-gray-600 uppercase tracking-widest">
                  {ROLE_META.filter(r => r.key !== "ALL").map(r => (
                    <span key={r.key} className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ background: r.color }}></span>
                      {r.label}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ height: "580px" }}>
                <AdminTrackingMap
                  workers={filtered}
                  geoData={geoData}
                  selectedId={selectedId}
                />
              </div>

              <div className="px-8 py-3 border-t border-white/5 flex items-center gap-3 text-[9px] text-gray-700 font-black uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block"></span>
                {filtered.filter(w => w.lat && w.lng).length} workers geo-tagged ·
                OpenStreetMap + CARTO Dark ·
                Auto-refresh every {POLL_MS / 1000}s
              </div>
            </div>

            {/* Sidebar — worker list */}
            <div className="bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-white/10">
                <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                  Online Workers <span className="text-white ml-2">{filtered.length}</span>
                </h2>
              </div>

              <div className="overflow-y-auto flex-1" style={{ maxHeight: 560 }}>
                {loading ? (
                  <div className="flex items-center justify-center h-24 text-gray-600 text-[10px] font-black uppercase tracking-widest">
                    <RefreshCw size={14} className="animate-spin mr-2" /> Loading…
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-24 text-gray-700 text-[10px] font-black uppercase tracking-widest gap-2">
                    <WifiOff size={20} />
                    Koi worker online nahi
                  </div>
                ) : (
                  filtered.map((w, i) => {
                    const color = roleColor(w.role);
                    const isSel = w.workerId === selectedId;
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedId(isSel ? null : w.workerId)}
                        className={`w-full flex items-center gap-3 px-5 py-4 border-b border-white/5 text-left transition-all ${
                          isSel ? "bg-white/10" : "hover:bg-white/5"
                        }`}
                      >
                        {/* Role dot */}
                        <span
                          className="flex-shrink-0 w-3 h-3 rounded-full"
                          style={{ background: color, boxShadow: isSel ? `0 0 8px ${color}` : 'none' }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-black text-white truncate">{w.name || "Unknown"}</p>
                          <p className="text-[9px] font-bold truncate mt-0.5" style={{ color }}>
                            {w.role || "—"}
                          </p>
                          <p className="text-[9px] text-gray-600 font-bold truncate">{w.district || "—"}</p>
                        </div>
                        {/* GPS badge */}
                        <div className="flex-shrink-0 text-right">
                          {w.lat && w.lng ? (
                            <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">
                              GPS ✓
                            </span>
                          ) : (
                            <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest">
                              No GPS
                            </span>
                          )}
                        </div>
                        {isSel && <ChevronRight size={12} className="text-gray-500 flex-shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
             TAB: ACTIVITY LOG / HISTORY
        ══════════════════════════════════════════════════════════════ */}
        {tab === "history" && (
          <div className="bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden">
            <div className="px-8 py-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity size={16} className="text-red-500" />
                <h2 className="text-[11px] font-black uppercase tracking-widest text-red-500">
                  Activity Log — Kaun Active Hua / Gaya
                </h2>
              </div>
              <button
                onClick={() => setHistory([])}
                className="text-[9px] font-black text-gray-600 uppercase tracking-widest border border-white/10 px-4 py-2 rounded-xl hover:border-white/20 transition-all"
              >
                Clear Log
              </button>
            </div>

            {/* Current online snapshot */}
            <div className="px-8 py-4 border-b border-white/10 bg-white/[0.02]">
              <h3 className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-3">
                Abhi Online Hain ({allWorkers.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {allWorkers.length === 0 ? (
                  <span className="text-[9px] text-gray-700 font-bold">Koi nahi (backend se data aa raha hai)</span>
                ) : (
                  allWorkers.map((w, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-black/30 border border-white/5 rounded-xl px-3 py-1.5 text-[9px] font-bold"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                      <span className="text-white">{w.name || "?"}</span>
                      <span className="text-gray-600">{w.role}</span>
                      <span style={{ color: roleColor(w.role) }}>·</span>
                      <span className="text-gray-600">{w.district}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* History log table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[9px] text-gray-600 uppercase tracking-[0.4em] border-b border-white/5">
                    <th className="px-8 py-4 text-left">Status</th>
                    <th className="px-8 py-4 text-left">Name</th>
                    <th className="px-8 py-4 text-left">Role</th>
                    <th className="px-8 py-4 text-left">District</th>
                    <th className="px-8 py-4 text-left">Worker ID</th>
                    <th className="px-8 py-4 text-left">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-10 text-center text-gray-700 text-[10px] font-black uppercase tracking-widest">
                        Activity log empty — {POLL_MS / 1000}s mein update hoga jab koi online / offline hoga
                      </td>
                    </tr>
                  ) : (
                    history.map(h => (
                      <tr key={h.id} className="hover:bg-white/[0.03] transition-all">
                        <td className="px-8 py-4">
                          <span className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${
                            h.status === "ONLINE"
                              ? "border-green-800 text-green-400 bg-green-900/20"
                              : "border-red-900 text-red-500 bg-red-900/10"
                          }`}>
                            <Circle size={6} fill="currentColor" />
                            {h.status === "ONLINE" ? "Active" : "Offline"}
                          </span>
                        </td>
                        <td className="px-8 py-4">
                          <p className="text-[11px] font-black text-white">{h.name}</p>
                        </td>
                        <td className="px-8 py-4">
                          <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: roleColor(h.role) }}>
                            {h.role}
                          </span>
                        </td>
                        <td className="px-8 py-4">
                          <p className="text-[10px] text-gray-400 font-bold">{h.district}</p>
                        </td>
                        <td className="px-8 py-4">
                          <p className="text-[9px] text-gray-600 font-mono">{h.workerId?.slice(0, 12) || "—"}</p>
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-1 text-[9px] text-gray-600 font-mono">
                            <Clock size={10} />
                            {new Date(h.ts).toLocaleTimeString()}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {history.length > 0 && (
              <div className="px-8 py-4 border-t border-white/5 text-[9px] text-gray-700 font-black uppercase tracking-widest text-center">
                Showing last {history.length} events · Max {MAX_HISTORY} kept in memory
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-gray-800 text-[9px] uppercase tracking-[1.5em] font-black italic pb-6">
          SUPER ADMIN · LIVE TRACKER · EMS.UP · HEART BEAT {POLL_MS / 1000}s · ENCRYPTION ACTIVE
        </p>
      </div>
    </div>
  );
}
