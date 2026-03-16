"use client";
import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Map, ShieldAlert, Lock, BarChart3, ChevronRight, Globe, Zap, Wifi, WifiOff, RefreshCw } from "lucide-react";

// Load Leaflet map only on client (no SSR)
const LiveMap = dynamic(() => import('@/components/LiveMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-gray-700 text-[11px] font-black uppercase tracking-widest">
      Loading Map…
    </div>
  ),
});

const REFRESH_INTERVAL_MS = 10_000;  // poll Redis presence every 10 s

// Baseline booth/sathi data for each district (static info merged with live counts)
const DISTRICT_META = {
  "Mainpuri":  { booths: 1840,  baseForce: 15200 },
  "Etawah":    { booths: 1250,  baseForce: 9800  },
  "Firozabad": { booths: 2100,  baseForce: 12400 },
  "Agra":      { booths: 3400,  baseForce: 28000 },
};

export default function ZoneMonitor() {
  const [accessRequested, setAccessRequested] = useState(false);

  // Live presence from Redis heartbeat API
  const [liveData,       setLiveData]       = useState(null);   // { total, byDistrict, workers }
  const [loadingLive,    setLoadingLive]     = useState(true);
  const [lastRefreshed,  setLastRefreshed]   = useState(null);
  const [fetchError,     setFetchError]      = useState(false);

  const fetchPresence = useCallback(async () => {
    try {
      setFetchError(false);
      const res  = await fetch('/api/workers/online-status');
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.success) {
        setLiveData(data);
        setLastRefreshed(new Date());
      }
    } catch (_) {
      setFetchError(true);
    } finally {
      setLoadingLive(false);
    }
  }, []);

  useEffect(() => {
    fetchPresence();
    const id = setInterval(fetchPresence, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchPresence]);

  // Merge static district meta with live online counts
  const districtsInZone = Object.entries(DISTRICT_META).map(([name, meta]) => {
    const onlineCount = liveData?.byDistrict?.[name] ?? 0;
    const health      = Math.min(100, Math.round((onlineCount / (meta.baseForce / 10)) * 100)) || 0;
    const status      = onlineCount === 0  ? 'Offline'      :
                        health >= 80        ? 'Optimal'      :
                        health >= 50        ? 'Stable'       : 'Critical Gap';
    return { name, ...meta, onlineCount, health, status };
  });

  const totalOnline = liveData?.total ?? 0;
  const totalForce  = Object.values(DISTRICT_META).reduce((s, d) => s + d.baseForce, 0);
  const totalBooths = Object.values(DISTRICT_META).reduce((s, d) => s + d.booths, 0);
  const zoneHealth  = totalForce > 0 ? Math.min(100, Math.round((totalOnline / (totalForce / 10)) * 100)) : 0;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 pt-32 font-sans selection:bg-red-600">
      
      {/* --- ZONE STRATEGIC HEADER --- */}
      <div className="max-w-7xl mx-auto mb-16">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-white/5 pb-10 gap-8">
          <div className="flex items-center gap-8">
            <div className="p-5 bg-red-600 rounded-[2rem] shadow-[0_0_40px_rgba(220,38,38,0.3)]">
              <Map size={40} />
            </div>
            <div>
              <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
                BRAJ <span className="text-red-600">ZONE</span> NODE
              </h1>
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.6em] mt-3 italic flex items-center gap-2">
                <Lock size={12} className="text-yellow-600" /> Administrative Monitoring Level: 02
              </p>
            </div>
          </div>

          {/* Live status chip + refresh */}
          <div className="flex items-center gap-4">
            {/* Live indicator */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border ${
              fetchError ? 'border-red-800 text-red-400 bg-red-900/20' : 
              loadingLive ? 'border-gray-700 text-gray-400 bg-gray-900/20' :
              'border-green-800 text-green-400 bg-green-900/20'}`}>
              {fetchError  ? <WifiOff size={12} /> : loadingLive ? <RefreshCw size={12} className="animate-spin" /> : <Wifi size={12} />}
              {fetchError ? 'Presence Offline' : loadingLive ? 'Loading...' : `LIVE · ${totalOnline.toLocaleString()} Online`}
              {/* Pulsing dot */}
              {!fetchError && !loadingLive && (
                <span className="relative flex h-2 w-2 ml-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              )}
            </div>

            <button
              onClick={() => setAccessRequested(true)}
              className={`px-8 py-4 rounded-[2rem] font-black uppercase italic tracking-widest text-xs transition-all flex items-center gap-3 ${
                accessRequested
                ? 'bg-yellow-600/10 text-yellow-500 border border-yellow-600/30'
                : 'bg-white text-black hover:bg-red-600 hover:text-white shadow-2xl scale-105'
              }`}
            >
              {accessRequested ? "Waiting for Supreme Bypass..." : "Request Global Edit Access"}
            </button>
          </div>
        </div>

        {/* --- ZONE ANALYTICS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 mt-12">
          {[
            { label: "Total Districts", val: "04",                          icon: <Globe size={18}/> },
            { label: "Total Booths",    val: totalBooths.toLocaleString(),  icon: <BarChart3 size={18}/> },
            { label: "Online Now",      val: totalOnline.toLocaleString(),  icon: <Zap size={18}/>, live: true },
            { label: "Zone Health",     val: `${zoneHealth}%`,              icon: <ShieldAlert size={18}/> }
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-[3rem] group hover:border-red-600/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="text-red-600">{stat.icon}</div>
                {stat.live && !loadingLive && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                )}
              </div>
              <p className="text-4xl font-black italic mb-1">{loadingLive && stat.live ? '—' : stat.val}</p>
              <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest italic">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* --- LIVE WORKER MAP --- */}
        <div className="bg-white/5 border border-white/10 rounded-[4rem] overflow-hidden shadow-2xl mb-12">
          <div className="p-8 border-b border-white/10 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-600/20 rounded-2xl border border-red-600/30">
                <Map size={20} className="text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-black italic uppercase tracking-widest text-red-600">Live Worker GPS Map</h2>
                <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest italic mt-1">BRAJ Zone · Real-time Heartbeat Overlay</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-gray-600 font-mono uppercase tracking-widest">
                {(liveData?.workers ?? []).filter(w => w.lat && w.lng).length} / {liveData?.total ?? 0} Geo-tagged
              </p>
              <p className="text-[8px] text-gray-800 font-mono mt-1">OpenStreetMap + CARTO Dark Tiles</p>
            </div>
          </div>
          <div style={{ height: '520px' }} className="relative">
            <LiveMap
              workers={liveData?.workers ?? []}
              districtsInZone={districtsInZone}
            />
          </div>
          {/* Legend */}
          <div className="px-8 py-4 border-t border-white/5 flex items-center gap-8 text-[9px] font-black uppercase tracking-widest text-gray-600">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span> Optimal (≥80%)
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> Stable (≥50%)
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span> Critical (&lt;50%)
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gray-700 inline-block"></span> Offline
            </span>
            <span className="flex items-center gap-2 ml-auto">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> Live Worker
            </span>
          </div>
        </div>

        {/* --- DISTRICT INTELLIGENCE TABLE --- */}
        <div className="bg-white/5 border border-white/10 rounded-[4rem] overflow-hidden backdrop-blur-3xl shadow-2xl">
          <div className="p-10 border-b border-white/10 bg-white/5 flex items-center justify-between">
            <h2 className="text-xl font-black italic uppercase tracking-widest text-red-600">District-Wise Deployment Intel</h2>
            {lastRefreshed && (
              <span className="text-[9px] text-gray-600 font-mono">
                Updated {lastRefreshed.toLocaleTimeString()}
              </span>
            )}
          </div>
          
          <div className="overflow-x-auto px-8 pb-10">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-gray-600 uppercase tracking-[0.4em] border-b border-white/5">
                  <th className="p-8">District Name</th>
                  <th className="p-8">Live Workers</th>
                  <th className="p-8">Hiring Health</th>
                  <th className="p-8 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {districtsInZone.map((dist, idx) => (
                  <tr key={idx} className="hover:bg-red-600/5 transition-all group cursor-not-allowed">
                    <td className="p-8">
                      <p className="font-black uppercase text-xl italic group-hover:text-red-600 transition-colors">{dist.name}</p>
                      <p className="text-[10px] text-gray-600 font-mono tracking-widest mt-1 italic">{dist.booths.toLocaleString()} TOTAL BOOTHS</p>
                    </td>
                    <td className="p-8">
                      <div className="flex items-center gap-2">
                        {/* Live dot indicator */}
                        {dist.onlineCount > 0 && (
                          <span className="relative flex h-2 w-2 flex-shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                        )}
                        {dist.onlineCount === 0 && <span className="h-2 w-2 rounded-full bg-gray-700 flex-shrink-0"></span>}
                        <div>
                          <p className="text-lg font-black italic text-white">{loadingLive ? '—' : dist.onlineCount.toLocaleString()}</p>
                          <p className="text-[9px] text-gray-600 uppercase font-bold tracking-widest">Online Now</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-8">
                      <div className="w-32 h-1.5 bg-black rounded-full overflow-hidden border border-white/10">
                        <div className={`h-full transition-all duration-700 ${dist.health > 50 ? 'bg-green-600' : 'bg-red-600'}`}
                             style={{ width: `${dist.health}%` }}></div>
                      </div>
                      <p className="text-[9px] text-gray-600 mt-2 font-black italic uppercase tracking-widest">{dist.health}% ACTIVE</p>
                    </td>
                    <td className="p-8 text-right">
                      <span className={`text-[9px] border px-4 py-2 rounded-xl font-black uppercase italic tracking-widest ${
                        dist.status === 'Optimal'      ? 'border-green-800 text-green-400 bg-green-900/20' :
                        dist.status === 'Stable'       ? 'border-blue-800  text-blue-400  bg-blue-900/20'  :
                        dist.status === 'Critical Gap' ? 'border-red-800   text-red-400   bg-red-900/20'   :
                        'border-gray-700 text-gray-500 bg-gray-900/20'
                      }`}>
                        {dist.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- FOOTER WARNING --- */}
        <p className="mt-12 text-center text-gray-800 text-[10px] uppercase tracking-[1.5em] font-black italic">
          ZONE MONITORING NODE | BRAJ SECTOR | ENCRYPTION ACTIVE | LIVE HEARTBEAT {REFRESH_INTERVAL_MS / 1000}s
        </p>
      </div>
    </div>
  );
}
