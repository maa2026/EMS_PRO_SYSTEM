"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trash2, Users, MapPin, Zap, Activity, HardDrive, Send, 
  Phone, ShieldCheck, Database, ChevronRight, Briefcase, 
  ShieldAlert, Lock, CheckCircle2, Smile, Meh, Frown, LayoutGrid, Globe, Home, BarChart3
} from "lucide-react";

export default function VoterIntelligenceNode() {
  const [isSynced, setIsSynced] = useState(false);
  const [globalHouseholdCount, setGlobalHouseholdCount] = useState(1); 

  // --- 📝 STATE MANAGEMENT ---
  const [members, setMembers] = useState([
    { id: Date.now(), name: "", fatherName: "", dob: "", age: "", gender: "Male", voterId: "", mobile: "", mood: "Unknown", jobType: "Farmer", jobOther: "", currentCity: "Local", isMigrated: "No" }
  ]);
  
  const [household, setHousehold] = useState({ 
    makanNo: "", area: "", category: "OBC", subCaste: "", mobile: "", grievances: "", lat: "", long: "" 
  });

  // --- 🏛️ HIERARCHY DETAILS (JAN SAMPARK SATHI) ---
  const intelligenceContext = {
    agent: { name: "AMIT KR.", id: "7501", assignedPage: "08" },
    booth: { name: "PRIMARY SCHOOL SAIFAl", id: "XY-04", manager: "RAJESH YADAV", president: "SUBHASH YADAV" },
    admin: { constituency: "MAINPURI (107)", district: "MAINPURI", zone: "BRAJ PRADESH" }
  };

  // --- 🔥 LIVE ANALYTICS Hub ---
  const stats = useMemo(() => {
    const total = members.length;
    const voters = members.filter(m => m.age >= 18).length;
    const future = members.filter(m => m.age > 0 && m.age < 18).length;
    const migratedCount = members.filter(m => m.isMigrated === "Yes").length;
    const males = members.filter(m => m.gender === "Male").length;
    const females = members.filter(m => m.gender === "Female").length;
    const moodCount = (type) => members.filter(m => m.mood === type).length;
    const calcPct = (count) => total > 0 ? ((count / total) * 100).toFixed(1) : 0;

    return {
      total, voters, future, migratedCount, males, females,
      malePct: calcPct(males), femalePct: calcPct(females),
      supportPct: calcPct(moodCount("Supportive")),
      neutralPct: calcPct(moodCount("Neutral")),
      opposePct: calcPct(moodCount("Opposed"))
    };
  }, [members]);

  const jobOptions = ["Farmer", "Student", "Housewife", "Private Job", "Govt Job", "Business", "Labour", "Unemployed", "Others"];

  const loadFullMockFamily = () => {
    if (isSynced) return;
    setHousehold({ 
        makanNo: "107/B", area: "Saifai Ward-04", category: "OBC", subCaste: "Yadav", 
        mobile: "9876543210", grievances: "Bijli-paani samasya.", lat: "", long: "" 
    });
    setMembers([
      { id: 1, name: "RAJPAL YADAV", fatherName: "LATE PRASAD", dob: "1955-01-10", age: 71, gender: "Male", voterId: "UP20/001", mobile: "9900011001", mood: "Supportive", jobType: "Farmer", jobOther: "", currentCity: "Local", isMigrated: "No" },
      { id: 2, name: "RAMVATI DEVI", fatherName: "RAJPAL YADAV", dob: "1958-05-15", age: 68, gender: "Female", voterId: "UP20/002", mobile: "9900011002", mood: "Supportive", jobType: "Housewife", jobOther: "", currentCity: "Local", isMigrated: "No" },
      { id: 5, name: "VIKRAM YADAV", fatherName: "RAJPAL YADAV", dob: "1985-03-22", age: 41, gender: "Male", voterId: "UP20/005", mobile: "9900011005", mood: "Opposed", jobType: "Others", jobOther: "Engineer", currentCity: "Noida", isMigrated: "Yes" },
      { id: 6, name: "ANKIT YADAV", fatherName: "SURESH YADAV", dob: "2004-07-30", age: 21, gender: "Male", voterId: "UP20/006", mobile: "9900011006", mood: "Supportive", jobType: "Student", jobOther: "", currentCity: "Delhi", isMigrated: "Yes" }
    ]);
  };

  const handleSync = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setHousehold(prev => ({ ...prev, lat: pos.coords.latitude, long: pos.coords.longitude }));
        setIsSynced(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, () => { setIsSynced(true); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    } else {
      setIsSynced(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const maskData = (val, type) => {
    if (!isSynced || !val) return val;
    return type === 'mobile' ? "XXXXXX" + val.slice(-4) : val.slice(0, 3) + "*******";
  };

  const updateMember = (id, field, value) => {
    if (isSynced) return;
    setMembers(prev => prev.map(m => (m.id === id ? { ...m, [field]: value } : m)));
    if (field === "dob") {
      const age = new Date().getFullYear() - new Date(value).getFullYear();
      setMembers(prev => prev.map(m => m.id === id ? { ...m, age: age } : m));
    }
  };

  const s = {
    container: { backgroundColor: "#000502", minHeight: "100vh", padding: "20px", color: "white", fontFamily: "Inter" },
    card: {
      background: "rgba(255, 255, 255, 0.02)", borderRadius: "20px", padding: "20px", marginBottom: "20px", borderStyle: 'solid',
      borderTopWidth: '1px', borderRightWidth: '1px', borderBottomWidth: '1px', borderLeftWidth: '1px',
      borderTopColor: 'rgba(255, 255, 255, 0.08)', borderRightColor: 'rgba(255, 255, 255, 0.08)', borderBottomColor: 'rgba(255, 255, 255, 0.08)', borderLeftColor: 'rgba(255, 255, 255, 0.08)'
    },
    input: {
      width: "100%", padding: "14px", borderRadius: "10px", borderStyle: 'solid', 
      borderTopWidth: '1px', borderRightWidth: '1px', borderBottomWidth: '1px', borderLeftWidth: '1px',
      borderColor: 'rgba(255,255,255,0.07)', background: "rgba(0,0,0,0.4)", color: "white", marginBottom: "12px", fontSize: "13px", outline: "none"
    }
  };

  return (
    <div style={s.container}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
        <div><h1 style={{ fontSize: "1.2rem", fontWeight: "900", margin: 0 }}>VOTER <span style={{ color: "#DA251D" }}>INTELLIGENCE</span></h1><span style={{ fontSize: '8px', color: isSynced ? '#00914C' : '#DA251D' }}>{isSynced ? "🔒 SECURED" : "🟢 ACTIVE"}</span></div>
        <div style={{ textAlign: 'right' }}><h1 style={{ fontSize: "1.2rem", fontWeight: "900", color: "#00914C", margin: 0 }}>UNIT <span style={{ color: "white" }}>V9.2</span></h1></div>
      </div>

      {/* 📊 LIVE ANALYTICS HUB */}
      <div style={s.card}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '15px' }}>
          <div style={{ textAlign: 'center' }}><p style={{ fontSize: '7px', color: '#666' }}>FAMILIES</p><b style={{ color: '#DA251D' }}>{globalHouseholdCount}</b></div>
          <div style={{ textAlign: 'center' }}><p style={{ fontSize: '7px', color: '#666' }}>VOTERS</p><b>{stats.voters}</b></div>
          <div style={{ textAlign: 'center' }}><p style={{ fontSize: '7px', color: '#666' }}>MIGRATED</p><b style={{ color: '#DA251D' }}>{stats.migratedCount}</b></div>
          <div style={{ textAlign: 'center' }}><p style={{ fontSize: '7px', color: '#666' }}>FUTURE</p><b style={{ color: '#EAB308' }}>{stats.future}</b></div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '15px' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', marginBottom: '5px' }}>
             <span style={{ color: '#3b82f6' }}>MALE: {stats.malePct}%</span><span style={{ color: '#ec4899' }}>FEMALE: {stats.femalePct}%</span>
           </div>
          <div style={{ display: 'flex', height: '10px', borderRadius: '10px', overflow: 'hidden', marginBottom: '10px' }}>
            <div style={{ width: `${stats.supportPct}%`, background: '#00914C' }}></div>
            <div style={{ width: `${stats.neutralPct}%`, background: '#f59e0b' }}></div>
            <div style={{ width: `${stats.opposePct}%`, background: '#DA251D' }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontWeight: '800' }}>
            <span style={{ color: '#00914C' }}>SUP: {stats.supportPct}%</span><span style={{ color: '#f59e0b' }}>NEU: {stats.neutralPct}%</span><span style={{ color: '#DA251D' }}>OPP: {stats.opposePct}%</span>
          </div>
        </div>
      </div>

      {/* 🏛️ JAN SAMPARK SATHI HIERARCHY */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ ...s.card, borderLeftWidth: '5px', borderLeftColor: '#DA251D' }}>
        <div style={{ fontSize: "9px", fontWeight: "900", color: "#DA251D", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}><ShieldCheck size={14} /> JAN SAMPARK DATA</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '11px' }}>
          <div><p style={{ fontSize: '7px', color: '#555' }}>SATHI / PAGE</p><b>{intelligenceContext.agent.name} (P-{intelligenceContext.agent.assignedPage})</b></div>
          <div><p style={{ fontSize: '7px', color: '#555' }}>MANAGER</p><b>{intelligenceContext.booth.manager}</b></div>
          <div style={{ gridColumn: 'span 2' }}><p style={{ fontSize: '7px', color: '#555' }}>BOOTH PATH</p><b>{intelligenceContext.admin.district} <ChevronRight size={8} style={{ display: 'inline' }} /> {intelligenceContext.admin.constituency}</b></div>
        </div>
      </motion.div>

      {/* 🏠 HOUSEHOLD ADDRESS BOXES */}
      <div style={s.card}>
        {!isSynced && (
          <motion.button onClick={loadFullMockFamily} whileTap={{ scale: 0.95 }} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #00914C', background: 'rgba(0,145,76,0.05)', color: '#00914C', fontWeight: '900', fontSize: '10px', marginBottom: '15px', cursor: 'pointer' }}>🧪 LOAD 10-MEMBER FAMILY UNIT</motion.button>
        )}
        <span style={{ fontSize: "9px", fontWeight: "900", color: "#00914C", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}><MapPin size={14} /> ADDRESS DETAILS</span>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input type="text" placeholder="Makan No." style={s.input} value={household.makanNo} disabled={isSynced} onChange={(e) => setHousehold({...household, makanNo: e.target.value})} />
          <input type="text" placeholder="Area / Mohalla" style={s.input} value={household.area} disabled={isSynced} onChange={(e) => setHousehold({...household, area: e.target.value})} />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select style={s.input} value={household.category} disabled={isSynced} onChange={(e) => setHousehold({...household, category: e.target.value})}>
            <option value="OBC">OBC</option><option value="SC">SC</option><option value="ST">ST</option><option value="GEN">GENERAL</option>
          </select>
          <input type="text" placeholder="Sub-Caste (Jaati)" style={s.input} value={household.subCaste} disabled={isSynced} onChange={(e) => setHousehold({...household, subCaste: e.target.value})} />
        </div>
        <div style={{ ...s.input, background: 'rgba(0,145,76,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Globe size={12}/> {isSynced ? `${household.lat.toFixed(4)}, ${household.long.toFixed(4)}` : "GPS AUTO-CAPTURE ON SYNC"}
        </div>
      </div>

      {/* 👥 VOTER DATA STACK */}
      <AnimatePresence>
        {members.map((member, index) => {
          const isEligible = member.age >= 18;
          const isMigrated = member.isMigrated === "Yes";
          const moodColor = isSynced ? '#00914C' : (member.mood === 'Supportive' ? '#00914C' : member.mood === 'Opposed' ? '#DA251D' : member.mood === 'Neutral' ? '#f59e0b' : 'rgba(255,255,255,0.08)');
          return (
            <motion.div key={member.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              style={{ ...s.card, borderLeftWidth: '5px', borderLeftColor: moodColor }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span style={{ fontSize: '8px', fontWeight: '900', color: isMigrated ? "#DA251D" : "#555" }}>
                    UNIT_{index + 1} | {isEligible ? "ELIGIBLE" : "FUTURE"} {isMigrated && "(OUTSTATION 🚩)"}
                </span>
                {!isSynced && members.length > 1 && <Trash2 size={16} color="#DA251D" onClick={() => setMembers(members.filter(m => m.id !== member.id))} cursor="pointer" />}
              </div>

              {!isSynced && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
                  {['Supportive', 'Neutral', 'Opposed'].map((m) => (
                    <div key={m} onClick={() => updateMember(member.id, 'mood', m)} style={{ flex: 1, padding: '8px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', fontSize: '8px', fontWeight: '900', background: member.mood === m ? moodColor : 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>{m.toUpperCase()}</div>
                  ))}
                </div>
              )}

              <input type="text" placeholder="Name" style={s.input} value={member.name} disabled={isSynced} onChange={(e) => updateMember(member.id, 'name', e.target.value)} />
              <input type="text" placeholder="Father's / Husband's Name" style={s.input} value={member.fatherName} disabled={isSynced} onChange={(e) => updateMember(member.id, 'fatherName', e.target.value)} />
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <select style={s.input} value={member.isMigrated} disabled={isSynced} onChange={(e) => updateMember(member.id, 'isMigrated', e.target.value)}>
                   <option value="No">Local Resident</option><option value="Yes">Migrated (Outside)</option>
                </select>
                {isMigrated && (
                  <input type="text" placeholder="Current City" style={s.input} value={member.currentCity} disabled={isSynced} onChange={(e) => updateMember(member.id, 'currentCity', e.target.value)} />
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <select style={s.input} value={member.jobType} disabled={isSynced} onChange={(e) => updateMember(member.id, 'jobType', e.target.value)}>
                   {jobOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                {member.jobType === "Others" && (
                  <input type="text" placeholder="Specify Job" style={s.input} value={member.jobOther} disabled={isSynced} onChange={(e) => updateMember(member.id, 'jobOther', e.target.value)} />
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="date" style={s.input} value={member.dob} disabled={isSynced} onChange={(e) => updateMember(member.id, 'dob', e.target.value)} />
                <select style={s.input} value={member.gender} disabled={isSynced} onChange={(e) => updateMember(member.id, 'gender', e.target.value)}><option value="Male">Male</option><option value="Female">Female</option></select>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="tel" placeholder="Mobile" style={s.input} value={maskData(member.mobile, 'mobile')} disabled={isSynced} onChange={(e) => updateMember(member.id, 'mobile', e.target.value)} />
                <input type="text" placeholder="Voter ID" style={s.input} value={maskData(member.voterId, 'voter')} disabled={isSynced} onChange={(e) => updateMember(member.id, 'voterId', e.target.value)} />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {!isSynced ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '40px' }}>
          <motion.button onClick={() => setMembers([...members, { id: Date.now(), name: "", fatherName: "", dob: "", age: "", gender: "Male", voterId: "", mobile: "", mood: "Unknown", jobType: "Farmer", jobOther: "", currentCity: "Local", isMigrated: "No" }])} style={{ padding: '16px', borderRadius: '12px', border: '1px dashed #DA251D', background: 'transparent', color: '#DA251D', fontWeight: '900', cursor: 'pointer' }}>+ ADD NEW MEMBER UNIT</motion.button>
          <motion.button onClick={handleSync} whileTap={{ scale: 0.98 }} style={{ padding: '20px', borderRadius: '15px', border: 'none', background: 'white', color: 'black', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer' }}>SYNC & PROTECT DATA <Zap size={18} fill="black" />
          </motion.button>
        </div>
      ) : (
        <motion.button onClick={() => window.location.reload()} style={{ padding: '20px', borderRadius: '15px', border: '1px solid #00914C', background: 'transparent', color: '#00914C', fontWeight: '900', width: '100%', marginBottom: '40px' }}>START NEW ENTRY</motion.button>
      )}
    </div>
  );
}