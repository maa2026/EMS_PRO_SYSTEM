"use client";
// ════════════════════════════════════════════════════════════════
//  EMS WAR ROOM — Full-Stack Election Command Centre
//  Hierarchy: India → State → District → Constituency → Booth
// ════════════════════════════════════════════════════════════════
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  Radio, Zap, Users, MapPin, Activity, AlertTriangle, CheckCircle,
  ChevronRight, Search, Home, Globe2, Building2, LayoutGrid, Vote,
  TrendingUp, TrendingDown, Wifi, WifiOff, Bell, BellOff, Shield,
  RefreshCw, Maximize2, Minimize2, Crosshair, MessageSquare, X,
  BarChart3, Clock, Thermometer, ArrowUpRight, ArrowDownRight,
  ChevronDown, SatelliteDish, Target, Flag, Siren, Send, LogOut
} from 'lucide-react';

// Dynamic import — no SSR (Leaflet needs browser)
const WarRoomMap = dynamic(() => import('../../components/WarRoomMap'), { ssr: false });

// ── Mock Data Generators ──────────────────────────────────────────

const INDIA_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman and Nicobar','Chandigarh','Delhi','Jammu and Kashmir','Ladakh',
  'Lakshadweep','Puducherry','Dadra and NH',
];

const UP_DISTRICTS = [
  'Agra','Aligarh','Ambedkar Nagar','Amethi','Amroha','Auraiya','Ayodhya',
  'Azamgarh','Baghpat','Bahraich','Ballia','Balrampur','Banda','Barabanki',
  'Bareilly','Basti','Bhadohi','Bijnor','Budaun','Bulandshahr','Chandauli',
  'Chitrakoot','Deoria','Etah','Etawah','Farrukhabad','Fatehpur','Firozabad',
  'Gautam Buddha Nagar','Ghaziabad','Ghazipur','Gonda','Gorakhpur',
  'Hamirpur','Hapur','Hardoi','Hathras','Jalaun','Jaunpur','Jhansi',
  'Kannauj','Kanpur Dehat','Kanpur Nagar','Kasganj','Kaushambi',
  'Kushinagar','Lakhimpur Kheri','Lalitpur','Lucknow','Mahoba',
  'Maharajganj','Mainpuri','Mathura','Mau','Meerut','Mirzapur',
  'Moradabad','Muzaffarnagar','Pilibhit','Pratapgarh','Prayagraj',
  'Raebareli','Rampur','Saharanpur','Sambhal','Sant Kabir Nagar',
  'Shahjahanpur','Shamli','Shrawasti','Siddharthnagar','Sitapur',
  'Sonbhadra','Sultanpur','Unnao','Varanasi',
];

const seed = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
};
const seededRand = (s, min, max) => min + (seed(s) % (max - min + 1));

const makeDistrictStats = (name) => {
  const totalVoters = seededRand(name + 'v', 800000, 3500000);
  const turnout = seededRand(name + 't', 42, 78);
  const votesCast = Math.floor(totalVoters * turnout / 100);
  const totalWorkers = seededRand(name + 'w', 800, 4000);
  const activeWorkers = Math.floor(totalWorkers * seededRand(name + 'a', 70, 95) / 100);
  const booths = seededRand(name + 'b', 1200, 5000);
  const activeBooths = Math.floor(booths * 0.95);
  const alerts = seededRand(name + 'al', 0, 12);
  const constituencies = seededRand(name + 'c', 4, 8);
  return {
    totalVoters, votesCast, turnout, totalWorkers, activeWorkers,
    booths, activeBooths, alerts, constituencies,
    status: turnout >= 65 ? 'optimal' : turnout >= 50 ? 'stable' : turnout >= 40 ? 'monitor' : 'critical',
  };
};

const makeStateStats = (name) => {
  const districts = name === 'Uttar Pradesh' ? 75 : seededRand(name + 'd', 5, 40);
  const totalVoters = seededRand(name + 'v', 5000000, 150000000);
  const turnout = seededRand(name + 't', 45, 80);
  const workers = seededRand(name + 'w', 5000, 500000);
  const booths = seededRand(name + 'b', 5000, 200000);
  const alerts = seededRand(name + 'al', 0, 80);
  return {
    districts, totalVoters, turnout, workers, booths, alerts,
    votesCast: Math.floor(totalVoters * turnout / 100),
    activeWorkers: Math.floor(workers * 0.82),
    status: turnout >= 65 ? 'optimal' : turnout >= 50 ? 'stable' : turnout >= 40 ? 'monitor' : 'critical',
  };
};

// ── District name normalisation (GeoJSON uses 2011 census names) ──
const GEO_TO_DISPLAY = {
  'Allahabad':                    'Prayagraj',
  'Faizabad':                     'Ayodhya',
  'Bara Banki':                   'Barabanki',
  'Jyotiba Phule Nagar':          'Amroha',
  'Kansiram Nagar':               'Kasganj',
  'Kheri':                        'Lakhimpur Kheri',
  'Mahamaya Nagar':               'Hathras',
  'Rae Bareli':                   'Raebareli',
  'Sant Ravi Das Nagar(bhadohi)': 'Bhadohi',
  'Siddharth Nagar':              'Siddharthnagar',
};
const DISPLAY_TO_GEO = Object.fromEntries(Object.entries(GEO_TO_DISPLAY).map(([k, v]) => [v, k]));
// name (display OR geo) → GeoJSON DIST_NAME uppercase for filtering
const toGeoDist  = (name) => (DISPLAY_TO_GEO[name] || name).toUpperCase();
// GeoJSON district name → display name
const toDisplayDist = (geo) => GEO_TO_DISPLAY[geo] || geo;

// Build real constituency list for a district from GeoJSON (403 actual ACs)
const getAcForDistrict = (distName, acGeo) => {
  if (!acGeo?.features) return [];
  const geoKey = toGeoDist(distName);
  const features = acGeo.features.filter(f => f.properties.DIST_NAME === geoKey);
  if (!features.length) return [];
  return features.map(f => {
    const name = f.properties.AC_NAME;
    const totalVoters = seededRand(name + 'v', 150000, 400000);
    const turnout = seededRand(name + 't', 40, 80);
    return {
      name,
      acNo: f.properties.AC_NO,
      booths: seededRand(name + 'b', 200, 600),
      turnout,
      totalVoters,
      votesCast: Math.floor(totalVoters * turnout / 100),
      workers: seededRand(name + 'w', 100, 800),
      alerts: seededRand(name + 'al', 0, 5),
      status: turnout >= 65 ? 'optimal' : turnout >= 50 ? 'stable' : turnout >= 40 ? 'monitor' : 'critical',
    };
  });
};

const MOCK_BOOTHS = (constituency) => Array.from({ length: 12 }, (_, i) => {
  const name = `Booth ${seededRand(constituency + i, 1, 350)}`;
  const turnout = seededRand(name + constituency, 35, 85);
  return {
    name, turnout,
    totalVoters: seededRand(name + 'v', 800, 1400),
    votesCast: Math.floor(seededRand(name + 'v', 800, 1400) * turnout / 100),
    workers: seededRand(name + 'w', 2, 8),
    presiding: `Officer ${seededRand(name + 'o', 100, 999)}`,
    status: turnout >= 65 ? 'optimal' : turnout >= 50 ? 'stable' : turnout >= 40 ? 'monitor' : 'critical',
    issue: seededRand(name + 'i', 0, 10) > 8 ? 'EVM issue reported' : null,
  };
});

// Workers spread across ALL 75 districts, within actual UP bounds (23.87–30.41°N, 77.08–84.63°E)
const MOCK_WORKERS = Array.from({ length: 240 }, (_, i) => {
  const roles = ['DISTRICT', 'BOOTH_PRES', 'BOOTH_MGR', 'JSS', 'ZONE'];
  const d = UP_DISTRICTS[i % UP_DISTRICTS.length];
  return {
    workerId: `W${1000 + i}`, name: `Worker ${1000 + i}`,
    role: roles[i % roles.length],
    district: d,
    lat: 23.87 + (seed(`lat${i}d`) % 654) / 100,
    lng: 77.08 + (seed(`lng${i}d`) % 755) / 100,
  };
});

// ── STATUS helpers ────────────────────────────────────────────────
const STATUS_COLOR = { optimal: '#22c55e', stable: '#3b82f6', monitor: '#f59e0b', critical: '#ef4444' };
const STATUS_BG = { optimal: 'rgba(34,197,94,0.12)', stable: 'rgba(59,130,246,0.12)', monitor: 'rgba(245,158,11,0.12)', critical: 'rgba(239,68,68,0.12)' };
const STATUS_LABEL = { optimal: 'Optimal', stable: 'Stable', monitor: 'Monitor', critical: 'Critical' };

// ── LEVEL CONFIG ──────────────────────────────────────────────────
const LEVEL_META = {
  india: { icon: Globe2, label: 'India', color: '#a855f7' },
  state: { icon: Shield, label: 'State', color: '#3b82f6' },
  district: { icon: Building2, label: 'District', color: '#f59e0b' },
  constituency: { icon: MapPin, label: 'Constituency', color: '#22c55e' },
  booth: { icon: Vote, label: 'Booth', color: '#06b6d4' },
};

const fmt = (n) => n >= 10000000 ? (n / 10000000).toFixed(1) + ' Cr' : n >= 100000 ? (n / 100000).toFixed(1) + ' L' : n >= 1000 ? (n / 1000).toFixed(1) + 'K' : String(n);

// ── STAT CARD ─────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color = '#22c55e', trend }) => (
  <div className="rounded-xl p-3 border" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-clr)' }}>
    <div className="flex items-start justify-between mb-2">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}22` }}>
        <Icon size={14} style={{ color }} />
      </div>
      {trend !== undefined && (
        trend > 0
          ? <ArrowUpRight size={12} className="text-green-400" />
          : <ArrowDownRight size={12} className="text-red-400" />
      )}
    </div>
    <div className="text-lg font-black" style={{ color }}>{value}</div>
    <div className="text-[10px] text-gray-500 font-semibold mt-0.5">{label}</div>
    {sub && <div className="text-[9px] text-gray-600 mt-0.5">{sub}</div>}
  </div>
);

// ── ALERT ITEM ────────────────────────────────────────────────────
const AlertItem = ({ msg, time, level: lvl }) => {
  const colors = { critical: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };
  return (
    <div className="flex items-start gap-2.5 py-2.5 border-b" style={{ borderColor: 'var(--border-clr)' }}>
      <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: colors[lvl] || colors.info }} />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold" style={{ color: 'var(--foreground)' }}>{msg}</p>
        <p className="text-[9px] text-gray-500 mt-0.5">{time}</p>
      </div>
    </div>
  );
};

// ── LIVE ACTIVITY FEED ────────────────────────────────────────────
const ACTIVITY_TEMPLATES = [
  (d) => ({ msg: `Worker online in ${d}`, lvl: 'info' }),
  (d) => ({ msg: `Turnout spike +8% in ${d}`, lvl: 'info' }),
  (d) => ({ msg: `EVM issue reported — ${d}`, lvl: 'critical' }),
  (d) => ({ msg: `Booth ${Math.floor(Math.random()*300)+1} opened in ${d}`, lvl: 'info' }),
  (d) => ({ msg: `Agent check-in: ${d} sector`, lvl: 'info' }),
  (d) => ({ msg: `Alert resolved: ${d}`, lvl: 'info' }),
  (d) => ({ msg: `Low turnout warning — ${d}`, lvl: 'warning' }),
  (d) => ({ msg: `Crowd mgmt alert — ${d}`, lvl: 'warning' }),
];

// ════════════════════════════════════════════════════════════════
//  MAIN WAR ROOM PAGE
// ════════════════════════════════════════════════════════════════
export default function WarRoom() {
  const [userName, setUserName] = useState("");
  useEffect(() => { setUserName(localStorage.getItem("userName") || ""); }, []);
  const handleLogout = () => {
    ["userId","userRole","userName","userDistrict","userBoothNo","userConstituency","userZone","userEmsId","userRoleLabel"]
      .forEach(k => localStorage.removeItem(k));
    ["userId","userRole","userName"].forEach(k => { document.cookie = `${k}=; max-age=0; path=/`; });
    window.location.href = "/login";
  };
  // Navigation state
  const [level, setLevel] = useState('india');        // india|state|district|constituency|booth
  const [breadcrumb, setBreadcrumb] = useState([{ label: 'India', level: 'india', key: 'india' }]);
  const [selectedKey, setSelectedKey] = useState(null);
  const [searchQ, setSearchQ] = useState('');
  const [mapFullscreen, setMapFullscreen] = useState(false);

  // GeoJSON state
  const [indiaGeo, setIndiaGeo] = useState(null);
  const [upDistGeo, setUpDistGeo] = useState(null);
  const [upAcGeo, setUpAcGeo] = useState(null);
  // currentGeo derived via useMemo — no dep-array size restriction

  // Stats
  const [stateStats] = useState(() => Object.fromEntries(INDIA_STATES.map(s => [s, makeStateStats(s)])));
  const [districtStats] = useState(() => Object.fromEntries(UP_DISTRICTS.map(d => [d, makeDistrictStats(d)])));
  const [constituencies, setConstituencies] = useState([]);
  const [booths, setBooths] = useState([]);

  // Live feed & alerts
  const [feed, setFeed] = useState([]);
  const [alerts, setAlerts] = useState([
    { msg: 'EVM malfunction — Booth 214, Agra', lvl: 'critical', time: 'Just now' },
    { msg: 'Low turnout in Ballia district (<35%)', lvl: 'warning', time: '2 min ago' },
    { msg: 'Crowd management needed — Varanasi AC-7', lvl: 'warning', time: '5 min ago' },
    { msg: 'Worker offline zone: Azamgarh', lvl: 'info', time: '8 min ago' },
    { msg: 'All booths operational — Lucknow', lvl: 'info', time: '10 min ago' },
  ]);
  const [liveWorkers, setLiveWorkers] = useState(MOCK_WORKERS);
  const [onlineCount, setOnlineCount] = useState(3842);
  const [systemTime, setSystemTime] = useState(new Date());
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);
  const feedRef = useRef(null);

  // ── Load GeoJSONs ───────────────────────────────────────────────
  useEffect(() => {
    fetch('/india-states.geojson').then(r => r.json()).then(setIndiaGeo).catch(() => {});
    fetch('/up-districts.geojson').then(r => r.json()).then(setUpDistGeo).catch(() => {});
    fetch('/up-constituencies.geojson').then(r => r.json()).then(setUpAcGeo).catch(() => {});
  }, []);

  // ── Derived current GeoJSON (useMemo avoids the useEffect dep-array size problem) ──
  const currentGeo = useMemo(() => {
    if (level === 'india') return indiaGeo;
    if (level === 'state') return upDistGeo;
    if (level === 'district') {
      if (!upAcGeo?.features || !selectedKey) return upAcGeo ?? null;
      const geoKey = toGeoDist(selectedKey);
      const features = upAcGeo.features.filter(f => f.properties.DIST_NAME === geoKey);
      return features.length > 0 ? { ...upAcGeo, features } : upAcGeo;
    }
    return null;
  }, [level, indiaGeo, upDistGeo, upAcGeo, selectedKey]);


  // ── Live clock ──────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setSystemTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Live feed ticker ────────────────────────────────────────────
  useEffect(() => {
    const initial = Array.from({ length: 8 }, (_, i) => {
      const d = UP_DISTRICTS[i % UP_DISTRICTS.length];
      const tpl = ACTIVITY_TEMPLATES[i % ACTIVITY_TEMPLATES.length](d);
      return { ...tpl, time: `${(8 - i) * 2}m ago`, id: i };
    });
    setFeed(initial);

    const tick = setInterval(() => {
      const d = UP_DISTRICTS[Math.floor(Math.random() * UP_DISTRICTS.length)];
      const tpl = ACTIVITY_TEMPLATES[Math.floor(Math.random() * ACTIVITY_TEMPLATES.length)](d);
      const entry = { ...tpl, time: 'Just now', id: Date.now() };
      setFeed(prev => [entry, ...prev].slice(0, 80));
      if (tpl.lvl !== 'info') {
        setAlerts(prev => [{ ...entry }, ...prev].slice(0, 20));
      }
      setOnlineCount(prev => prev + Math.floor(Math.random() * 6) - 2);
    }, 4000);
    return () => clearInterval(tick);
  }, []);

  // ── Drill-down handler ──────────────────────────────────────────
  const drillDown = useCallback((name) => {
    if (level === 'india') {
      const newBc = [{ label: 'India', level: 'india', key: 'india' }, { label: name, level: 'state', key: name }];
      setBreadcrumb(newBc);
      setLevel('state');
      setSelectedKey(name);
      setSearchQ('');
    } else if (level === 'state') {
      // name may be GeoJSON old name (map click) or display name (list click) — both handled
      const displayName = toDisplayDist(name);
      const acs = getAcForDistrict(name, upAcGeo);
      setConstituencies(acs);
      const newBc = [...breadcrumb, { label: displayName, level: 'district', key: name }];
      setBreadcrumb(newBc);
      setLevel('district');
      setSelectedKey(name);
      setSearchQ('');
    } else if (level === 'district') {
      const bl = MOCK_BOOTHS(name);
      setBooths(bl);
      const newBc = [...breadcrumb, { label: name, level: 'constituency', key: name }];
      setBreadcrumb(newBc);
      setLevel('constituency');
      setSelectedKey(name);
      setSearchQ('');
    } else if (level === 'constituency') {
      const newBc = [...breadcrumb, { label: name, level: 'booth', key: name }];
      setBreadcrumb(newBc);
      setLevel('booth');
      setSelectedKey(name);
      setSearchQ('');
    }
  }, [level, breadcrumb]);

  // ── Breadcrumb navigate ─────────────────────────────────────────
  const navTo = (idx) => {
    const bc = breadcrumb.slice(0, idx + 1);
    setBreadcrumb(bc);
    setLevel(bc[bc.length - 1].level);
    setSelectedKey(bc[bc.length - 1].key === 'india' ? null : bc[bc.length - 1].key);
    setSearchQ('');
  };

  // ── Current list items ──────────────────────────────────────────
  const listItems = (() => {
    const q = searchQ.toLowerCase();
    if (level === 'india') return INDIA_STATES.filter(s => s.toLowerCase().includes(q)).map(s => ({ name: s, ...stateStats[s] }));
    if (level === 'state') return UP_DISTRICTS.filter(d => d.toLowerCase().includes(q)).map(d => ({ name: d, ...districtStats[d] }));
    if (level === 'district') return constituencies.filter(c => c.name.toLowerCase().includes(q));
    if (level === 'constituency') return booths.filter(b => b.name.toLowerCase().includes(q));
    return [];
  })();

  // ── Aggregate stats for current view ──────────────────────────
  const agg = (() => {
    if (level === 'india') {
      const all = Object.values(stateStats);
      return {
        totalVoters: all.reduce((s, x) => s + x.totalVoters, 0),
        votesCast: all.reduce((s, x) => s + x.votesCast, 0),
        turnout: Math.round(all.reduce((s, x) => s + x.turnout, 0) / all.length),
        workers: all.reduce((s, x) => s + x.workers, 0),
        booths: all.reduce((s, x) => s + x.booths, 0),
        alerts: all.reduce((s, x) => s + x.alerts, 0),
      };
    }
    if (level === 'state') {
      const all = Object.values(districtStats);
      return {
        totalVoters: all.reduce((s, x) => s + x.totalVoters, 0),
        votesCast: all.reduce((s, x) => s + x.votesCast, 0),
        turnout: Math.round(all.reduce((s, x) => s + x.turnout, 0) / all.length),
        workers: all.reduce((s, x) => s + x.totalWorkers, 0),
        booths: all.reduce((s, x) => s + x.booths, 0),
        alerts: all.reduce((s, x) => s + x.alerts, 0),
      };
    }
    if (level === 'district') {
      return {
        totalVoters: constituencies.reduce((s, x) => s + x.totalVoters, 0),
        votesCast: constituencies.reduce((s, x) => s + x.votesCast, 0),
        turnout: Math.round(constituencies.reduce((s, x) => s + x.turnout, 0) / (constituencies.length || 1)),
        workers: constituencies.reduce((s, x) => s + x.workers, 0),
        booths: constituencies.reduce((s, x) => s + x.booths, 0),
        alerts: constituencies.reduce((s, x) => s + x.alerts, 0),
      };
    }
    if (level === 'constituency') {
      return {
        totalVoters: booths.reduce((s, x) => s + x.totalVoters, 0),
        votesCast: booths.reduce((s, x) => s + x.votesCast, 0),
        turnout: Math.round(booths.reduce((s, x) => s + x.turnout, 0) / (booths.length || 1)),
        workers: booths.reduce((s, x) => s + x.workers, 0),
        booths: booths.length,
        alerts: booths.filter(b => b.issue).length,
      };
    }
    return { totalVoters: 0, votesCast: 0, turnout: 0, workers: 0, booths: 0, alerts: 0 };
  })();

  const statsMap = (() => {
    if (level === 'india') return Object.fromEntries(INDIA_STATES.map(s => [s, { turnout: stateStats[s].turnout, workers: stateStats[s].workers, booths: stateStats[s].booths, alerts: stateStats[s].alerts }]));
    if (level === 'state') {
      // Key by GeoJSON DISTRICT name (what map polygon properties contain)
      return Object.fromEntries(UP_DISTRICTS.map(d => {
        const geoKey = DISPLAY_TO_GEO[d] || d;
        return [geoKey, { turnout: districtStats[d].turnout, workers: districtStats[d].totalWorkers, booths: districtStats[d].booths, alerts: districtStats[d].alerts }];
      }));
    }
    if (level === 'district') {
      // Key by AC_NAME (what constituency polygon properties contain)
      return Object.fromEntries(constituencies.map(c => [c.name, { turnout: c.turnout, workers: c.workers, booths: c.booths, alerts: c.alerts }]));
    }
    return {};
  })();

  const LevelIcon = LEVEL_META[level]?.icon || Globe2;
  const critCount = alerts.filter(a => a.lvl === 'critical').length;

  // Broadcast
  const sendBroadcast = () => {
    if (!broadcastMsg.trim()) return;
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 3000);
    setBroadcastMsg('');
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>

      {/* ═══ TOP COMMAND BAR ══════════════════════════════════════ */}
      <div className="sticky top-0 z-40 border-b" style={{ background: 'rgba(1,8,4,0.98)', borderColor: 'var(--border-clr)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center justify-between px-4 py-2.5 gap-3">

          {/* Left: Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(218,37,29,0.15)', border: '1px solid rgba(218,37,29,0.3)' }}>
              <Crosshair size={16} className="text-red-400" />
            </div>
            <div>
              <div className="text-[12px] font-black tracking-[0.2em] text-red-400 uppercase">Election War Room</div>
              <div className="text-[9px] text-gray-500 tracking-widest">EMS Command Centre — UP 2026</div>
            </div>
            <div className="hidden md:flex items-center gap-1.5 ml-2 px-2.5 py-1 rounded-full" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[9px] font-black text-green-400 tracking-widest">LIVE</span>
            </div>
          </div>

          {/* Center: Live stats strip */}
          <div className="hidden lg:flex items-center gap-4">
            {[
              { label: 'Online Workers', value: onlineCount.toLocaleString(), color: '#22c55e', icon: Users },
              { label: 'Total Booths', value: fmt(agg.booths), color: '#3b82f6', icon: Vote },
              { label: 'Avg Turnout', value: `${agg.turnout}%`, color: '#f59e0b', icon: TrendingUp },
              { label: 'Active Alerts', value: critCount, color: '#ef4444', icon: Bell },
            ].map(({ label, value, color, icon: Ic }) => (
              <div key={label} className="flex items-center gap-1.5">
                <Ic size={12} style={{ color }} />
                <span className="text-[11px] font-black" style={{ color }}>{value}</span>
                <span className="text-[9px] text-gray-600">{label}</span>
              </div>
            ))}
          </div>

          {/* Right: Clock + controls */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border-clr)' }}>
              <Clock size={11} className="text-gray-400" />
              <span suppressHydrationWarning className="text-[11px] font-black text-gray-300 tabular-nums">
                {systemTime.toLocaleTimeString('en-IN', { hour12: false })}
              </span>
            </div>
            <div suppressHydrationWarning className="text-[9px] text-gray-500 hidden md:block">
              {systemTime.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
              <Wifi size={11} className="text-green-400" />
              <span className="text-[9px] font-black text-green-400">ONLINE</span>
            </div>
            {userName && <span className="text-[9px] text-gray-400 hidden md:block font-semibold">{userName}</span>}
            <button
              onClick={handleLogout}
              title="Logout"
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-red-400 hover:bg-red-600/10 transition-all"
              style={{ border: '1px solid rgba(218,37,29,0.2)' }}
            >
              <LogOut size={11} />
              <span className="text-[9px] font-black hidden sm:block">Logout</span>
            </button>
          </div>
        </div>

        {/* Turnout progress bar */}
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-gray-500 font-bold w-20 shrink-0">National Turnout</span>
            <div className="flex-1 h-1.5 rounded-full bg-white/5">
              <div className="h-1.5 rounded-full transition-all duration-1000" style={{ width: `${agg.turnout}%`, background: 'linear-gradient(90deg, #DA251D, #f59e0b, #22c55e)' }} />
            </div>
            <span className="text-[10px] font-black text-yellow-400 w-8 shrink-0">{agg.turnout}%</span>
          </div>
        </div>
      </div>

      {/* ═══ BREADCRUMB BAR ══════════════════════════════════════ */}
      <div className="px-4 py-2 flex items-center gap-1 flex-wrap border-b" style={{ background: 'var(--surface)', borderColor: 'var(--border-clr)' }}>
        {breadcrumb.map((bc, i) => {
          const Meta = LEVEL_META[bc.level];
          const Icon = Meta?.icon || Globe2;
          return (
            <div key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={11} className="text-gray-600" />}
              <button
                onClick={() => navTo(i)}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all ${i === breadcrumb.length - 1 ? 'text-white' : 'text-gray-500 hover:text-white'}`}
                style={i === breadcrumb.length - 1 ? { background: `${Meta?.color}22`, color: Meta?.color } : {}}
              >
                <Icon size={10} />
                {bc.label}
              </button>
            </div>
          );
        })}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[9px] text-gray-600 uppercase tracking-widest">{LEVEL_META[level]?.label} View</span>
        </div>
      </div>

      {/* ═══ MAIN 3-PANEL LAYOUT ══════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 130px)' }}>

        {/* ── LEFT PANEL ──────────────────────────────────────────── */}
        {!mapFullscreen && (
          <div className="w-72 shrink-0 flex flex-col border-r overflow-hidden" style={{ borderColor: 'var(--border-clr)', background: 'var(--surface)' }}>
            {/* Search */}
            <div className="p-3 border-b" style={{ borderColor: 'var(--border-clr)' }}>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--surface2)', border: '1px solid var(--border-clr)' }}>
                <Search size={12} className="text-gray-500 shrink-0" />
                <input
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  placeholder={`Search ${LEVEL_META[level]?.label}...`}
                  className="bg-transparent text-[11px] flex-1 outline-none placeholder-gray-600"
                  style={{ color: 'var(--foreground)' }}
                />
                {searchQ && <button onClick={() => setSearchQ('')}><X size={10} className="text-gray-500" /></button>}
              </div>
            </div>

            {/* Level items list */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-2 text-[9px] text-gray-500 font-black uppercase tracking-widest px-3 pt-3">
                {listItems.length} {LEVEL_META[level]?.label}{listItems.length !== 1 ? 's' : ''}
              </div>
              {listItems.map((item) => {
                const pct = item.turnout || 0;
                const sc = STATUS_COLOR[item.status] || '#9ca3af';
                return (
                  <button
                    key={item.name}
                    onClick={() => drillDown(item.name)}
                    className="w-full text-left px-3 py-2.5 border-b transition-all hover:bg-white/[0.03] group flex items-start gap-2.5"
                    style={{ borderColor: 'var(--border-clr)', background: selectedKey === item.name ? 'rgba(218,37,29,0.08)' : '' }}
                  >
                    <div className="w-1 h-8 rounded-full shrink-0 mt-0.5" style={{ background: sc }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold truncate group-hover:text-white transition-colors" style={{ color: selectedKey === item.name ? '#DA251D' : 'var(--foreground)' }}>
                          {item.name}
                        </span>
                        <span className="text-[9px] font-black ml-1 shrink-0" style={{ color: sc }}>{pct}%</span>
                      </div>
                      <div className="w-full h-1 rounded-full bg-white/5 mt-1">
                        <div className="h-1 rounded-full" style={{ width: `${pct}%`, background: sc }} />
                      </div>
                      <div className="flex gap-2 mt-1">
                        {item.booths && <span className="text-[9px] text-gray-600">{fmt(item.booths)} booths</span>}
                        {item.alerts > 0 && <span className="text-[9px] text-red-400">⚠ {item.alerts}</span>}
                        {item.issue && <span className="text-[9px] text-red-400">⚠ issue</span>}
                      </div>
                    </div>
                    <ChevronRight size={11} className="text-gray-600 shrink-0 mt-1 group-hover:text-white transition-colors" />
                  </button>
                );
              })}
            </div>

            {/* Status legend */}
            <div className="p-3 border-t" style={{ borderColor: 'var(--border-clr)' }}>
              <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-2">Status Legend</div>
              <div className="grid grid-cols-2 gap-1">
                {Object.entries(STATUS_LABEL).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: STATUS_COLOR[k] }} />
                    <span className="text-[9px] text-gray-500">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── CENTER PANEL (MAP) ─────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Map toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b shrink-0" style={{ borderColor: 'var(--border-clr)', background: 'var(--surface)' }}>
            <div className="flex items-center gap-2">
              <LevelIcon size={13} style={{ color: LEVEL_META[level]?.color }} />
              <span className="text-[11px] font-black" style={{ color: LEVEL_META[level]?.color }}>
                {breadcrumb[breadcrumb.length - 1]?.label} — {LEVEL_META[level]?.label} View
              </span>
              {level !== 'india' && (
                <button onClick={() => navTo(0)} className="ml-2 flex items-center gap-1 px-2 py-0.5 rounded text-[9px] text-gray-500 hover:text-white transition-colors" style={{ border: '1px solid var(--border-clr)' }}>
                  <Home size={9} /> Reset
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {(level === 'constituency' || level === 'booth') && (
                <span className="text-[9px] text-gray-500 italic">Map view not available — showing list</span>
              )}
              <button
                onClick={() => setMapFullscreen(v => !v)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5 transition-all text-gray-500 hover:text-white"
                title={mapFullscreen ? 'Exit fullscreen' : 'Fullscreen map'}
              >
                {mapFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              </button>
            </div>
          </div>

          {/* Map area */}
          <div className="flex-1 p-3 overflow-hidden">
            {(level === 'india' || level === 'state' || level === 'district') && currentGeo ? (
              <div style={{ height: '100%', minHeight: 400 }}>
                <WarRoomMap
                  level={level}
                  geoData={currentGeo}
                  statsMap={statsMap}
                  workers={liveWorkers}
                  onDrillDown={drillDown}
                  selectedId={selectedKey}
                />
              </div>
            ) : (
              /* Booth/Constituency grid when no map polygon */
              <div className="h-full overflow-y-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                  {listItems.map(item => {
                    const sc = STATUS_COLOR[item.status] || '#9ca3af';
                    return (
                      <button
                        key={item.name}
                        onClick={() => drillDown(item.name)}
                        className="text-left rounded-xl p-3 border transition-all hover:scale-[1.02] hover:-translate-y-0.5"
                        style={{ background: 'var(--card-bg)', borderColor: item.issue ? '#ef4444' : 'var(--border-clr)', borderWidth: item.issue ? 1.5 : 1 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: sc }} />
                          <span className="text-[9px] font-black" style={{ color: sc }}>{item.turnout}%</span>
                        </div>
                        <div className="text-[11px] font-bold truncate mb-1" style={{ color: 'var(--foreground)' }}>{item.name}</div>
                        <div className="w-full h-1 rounded-full bg-white/5 mb-2">
                          <div className="h-1 rounded-full" style={{ width: `${item.turnout}%`, background: sc }} />
                        </div>
                        <div className="text-[9px] text-gray-600">
                          {item.totalVoters ? fmt(item.totalVoters) + ' voters' : ''}
                          {item.workers ? ` · ${item.workers} workers` : ''}
                        </div>
                        {item.issue && (
                          <div className="mt-1.5 flex items-center gap-1 text-[9px] text-red-400 font-bold">
                            <AlertTriangle size={8} /> {item.issue}
                          </div>
                        )}
                        {item.presiding && (
                          <div className="mt-1 text-[9px] text-gray-600">👤 {item.presiding}</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL ─────────────────────────────────────────── */}
        {!mapFullscreen && (
          <div className="w-72 shrink-0 flex flex-col border-l overflow-hidden" style={{ borderColor: 'var(--border-clr)', background: 'var(--surface)' }}>

            {/* Key Metrics */}
            <div className="p-3 border-b" style={{ borderColor: 'var(--border-clr)' }}>
              <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-2">Key Metrics</div>
              <div className="grid grid-cols-2 gap-2">
                <StatCard icon={Users} label="Total Voters" value={fmt(agg.totalVoters)} color="#3b82f6" />
                <StatCard icon={Vote} label="Votes Cast" value={fmt(agg.votesCast)} color="#22c55e" />
                <StatCard icon={TrendingUp} label="Turnout" value={`${agg.turnout}%`} color="#f59e0b" />
                <StatCard icon={Users} label="Live Workers" value={onlineCount.toLocaleString()} color="#a855f7" />
                <StatCard icon={LayoutGrid} label="Booths" value={fmt(agg.booths)} color="#06b6d4" />
                <StatCard icon={AlertTriangle} label="Alerts" value={agg.alerts} color="#ef4444" />
              </div>
            </div>

            {/* Status distribution */}
            <div className="p-3 border-b" style={{ borderColor: 'var(--border-clr)' }}>
              <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-2">District Status — UP</div>
              {(['optimal', 'stable', 'monitor', 'critical']).map(s => {
                const count = level === 'india'
                  ? Object.values(stateStats).filter(v => v.status === s).length
                  : Object.values(districtStats).filter(v => v.status === s).length;
                const total = level === 'india' ? INDIA_STATES.length : UP_DISTRICTS.length;
                const pct = Math.round(count / total * 100);
                return (
                  <div key={s} className="flex items-center gap-2 mb-1.5">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: STATUS_COLOR[s] }} />
                    <span className="text-[10px] font-semibold w-14" style={{ color: STATUS_COLOR[s] }}>{STATUS_LABEL[s]}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-white/5">
                      <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: STATUS_COLOR[s] }} />
                    </div>
                    <span className="text-[10px] text-gray-500 w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Alerts */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-3 pt-3 pb-1 flex items-center justify-between">
                <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Live Alerts</div>
                {critCount > 0 && (
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400">{critCount} critical</span>
                )}
              </div>
              <div className="px-3">
                {alerts.map((a, i) => (
                  <AlertItem key={i} msg={a.msg} time={a.time} level={a.lvl} />
                ))}
              </div>
            </div>

            {/* Command broadcast */}
            <div className="p-3 border-t" style={{ borderColor: 'var(--border-clr)' }}>
              <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-2">
                <Zap size={9} className="inline mr-1 text-yellow-400" />Broadcast Command
              </div>
              <div className="flex gap-2">
                <input
                  value={broadcastMsg}
                  onChange={e => setBroadcastMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendBroadcast()}
                  placeholder="Send message to all workers..."
                  className="flex-1 px-2.5 py-2 rounded-lg text-[10px] outline-none"
                  style={{ background: 'var(--surface2)', border: '1px solid var(--border-clr)', color: 'var(--foreground)' }}
                />
                <button
                  onClick={sendBroadcast}
                  className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
                  style={{ background: broadcastSent ? 'rgba(34,197,94,0.2)' : 'rgba(218,37,29,0.2)', border: `1px solid ${broadcastSent ? 'rgba(34,197,94,0.3)' : 'rgba(218,37,29,0.3)'}` }}
                >
                  {broadcastSent ? <CheckCircle size={13} className="text-green-400" /> : <Send size={13} className="text-red-400" />}
                </button>
              </div>
              {broadcastSent && <p className="text-[9px] text-green-400 mt-1.5 font-bold">✓ Broadcast sent to {onlineCount.toLocaleString()} workers</p>}
            </div>
          </div>
        )}
      </div>

      {/* ═══ BOTTOM LIVE FEED ═════════════════════════════════════ */}
      <div className="border-t shrink-0" style={{ borderColor: 'var(--border-clr)', background: 'var(--surface)', height: 120 }}>
        <div className="flex items-center gap-3 px-4 py-2 border-b" style={{ borderColor: 'var(--border-clr)' }}>
          <Activity size={11} className="text-green-400" />
          <span className="text-[9px] font-black text-green-400 tracking-widest">LIVE FIELD ACTIVITY</span>
          <div className="flex-1 h-px" style={{ background: 'var(--border-clr)' }} />
          <span className="text-[9px] text-gray-600">{feed.length} events</span>
        </div>
        <div ref={feedRef} className="flex gap-0 overflow-x-auto h-[80px] items-center px-4" style={{ scrollbarWidth: 'none' }}>
          {feed.slice(0, 40).map((f, i) => {
            const c = f.lvl === 'critical' ? '#ef4444' : f.lvl === 'warning' ? '#f59e0b' : '#6b7280';
            return (
              <div key={f.id ?? i} className="shrink-0 flex items-center gap-3 mr-6">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c }} />
                <div>
                  <p className="text-[10px] font-semibold whitespace-nowrap" style={{ color: 'var(--foreground)' }}>{f.msg}</p>
                  <p className="text-[8px] text-gray-600">{f.time}</p>
                </div>
                <div className="w-px h-6 mx-2" style={{ background: 'var(--border-clr)' }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
