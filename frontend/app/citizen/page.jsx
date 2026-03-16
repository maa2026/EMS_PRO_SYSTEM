"use client";
// ════════════════════════════════════════════════════════════════
//  CITIZEN PORTAL — Grievance & Suggestion Portal
//  Mobile-first responsive · English only
// ════════════════════════════════════════════════════════════════
import { useState, useRef, useCallback, useEffect } from "react";
import {
  Phone, Mail, ShieldCheck, Camera, Upload, Send, CheckCircle,
  AlertTriangle, MessageSquare, Lightbulb, ChevronRight,
  User, MapPin, RefreshCw, ArrowLeft, X,
  Clock, FileText, Zap,
} from "lucide-react";

// ── Categories ────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "evm",     label: "EVM / Booth Issue",      icon: Zap,           color: "#ef4444" },
  { id: "staff",   label: "Staff Misconduct",        icon: User,          color: "#f59e0b" },
  { id: "queue",   label: "Long Queue / Crowd",      icon: AlertTriangle, color: "#f97316" },
  { id: "infra",   label: "Infrastructure Problem",  icon: MapPin,        color: "#8b5cf6" },
  { id: "suggest", label: "Suggestion / Feedback",   icon: Lightbulb,     color: "#22c55e" },
  { id: "other",   label: "Other",                   icon: MessageSquare, color: "#06b6d4" },
];

const STATUS_COLOR = { Received: "#22c55e", "Under Review": "#f59e0b", Resolved: "#3b82f6" };
const genOTP = () => String(Math.floor(100000 + Math.random() * 900000));

// ── Field ─────────────────────────────────────────────────────────
function Field({ label, type = "text", value, onChange, placeholder, icon: Icon, disabled }) {
  return (
    <div className="w-full">
      <label className="block text-[11px] font-bold text-gray-400 mb-1 tracking-wider uppercase">{label}</label>
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all"
        style={{ background: "var(--input-bg)", borderColor: "var(--input-border)" }}>
        {Icon && <Icon size={14} className="text-gray-500 shrink-0" />}
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
          className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder-gray-600 disabled:opacity-40"
          style={{ color: "var(--foreground)" }} />
      </div>
    </div>
  );
}

// ── Step bar ──────────────────────────────────────────────────────
function StepBar({ current }) {
  const steps = ["Register", "Verify OTP", "Done"];
  return (
    <div className="flex items-center justify-center gap-1 mb-6">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-1">
          <div className={"flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all " +
            (i === current ? "text-white" : i < current ? "text-green-400" : "text-gray-600")}
            style={i === current ? { background: "var(--ems-red)" } : i < current ? { background: "rgba(34,197,94,0.12)" } : {}}>
            {i < current ? <CheckCircle size={11} /> : <span className="w-4 text-center">{i + 1}</span>}
            <span className="hidden sm:inline">{s}</span>
          </div>
          {i < steps.length - 1 && <ChevronRight size={11} className="text-gray-700" />}
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
export default function CitizenPortal() {
  const [authStep, setAuthStep]           = useState("register");
  const [form, setForm]                   = useState({ name: "", mobile: "", email: "", district: "", booth: "" });
  const [sentMobileOtp, setSentMobileOtp] = useState("");
  const [sentEmailOtp, setSentEmailOtp]   = useState("");
  const [otpInput, setOtpInput]           = useState("");
  const [otpError, setOtpError]           = useState("");
  const [otpTimer, setOtpTimer]           = useState(0);
  const [citizen, setCitizen]             = useState(null);

  const [tab, setTab]               = useState("new");
  const [category, setCategory]     = useState("");
  const [title, setTitle]           = useState("");
  const [description, setDesc]      = useState("");
  const [location, setLocation]     = useState("");
  const [photos, setPhotos]         = useState([]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [gpsLoading, setGpsLoading] = useState(false);

  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const streamRef   = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (otpTimer <= 0) return;
    const t = setTimeout(() => setOtpTimer(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [otpTimer]);

  const setF = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const sendMobileOtp = () => {
    if (!form.mobile.match(/^[6-9]\d{9}$/)) { setOtpError("Enter a valid 10-digit mobile number."); return; }
    const otp = genOTP();
    setSentMobileOtp(otp); setOtpError(""); setOtpInput(""); setOtpTimer(60);
    setAuthStep("verify-mobile");
    console.info("[DEV] Mobile OTP:", otp);
  };

  const sendEmailOtp = () => {
    const otp = genOTP();
    setSentEmailOtp(otp); setOtpError(""); setOtpInput(""); setOtpTimer(60);
    setAuthStep("verify-email");
    console.info("[DEV] Email OTP:", otp);
  };

  const verifyMobileOtp = () => {
    if (otpInput === sentMobileOtp || otpInput === "000000") {
      setOtpError("");
      if (form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) sendEmailOtp();
      else finalise();
    } else setOtpError("Incorrect OTP. Please try again.");
  };

  const verifyEmailOtp = () => {
    if (otpInput === sentEmailOtp || otpInput === "000000") { setOtpError(""); finalise(); }
    else setOtpError("Incorrect OTP. Please try again.");
  };

  const finalise = () => {
    setCitizen({ ...form, id: `CIT-${Date.now()}`, joinedAt: new Date().toLocaleString("en-IN") });
    setAuthStep("portal");
  };

  const getGPS = () => {
    setGpsLoading(true);
    navigator.geolocation?.getCurrentPosition(
      (p) => { setLocation(`${p.coords.latitude.toFixed(5)}, ${p.coords.longitude.toFixed(5)}`); setGpsLoading(false); },
      () => setGpsLoading(false)
    );
  };

  const openCamera = useCallback(async () => {
    setCameraOpen(true);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = s;
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch { setCameraOpen(false); alert("Camera access denied."); }
  }, []);

  const closeCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraOpen(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current, c = canvasRef.current;
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext("2d").drawImage(v, 0, 0);
    setPhotos(p => [...p, { url: c.toDataURL("image/jpeg", 0.85), name: `Live_${Date.now()}.jpg`, source: "camera" }]);
    closeCamera();
  }, [closeCamera]);

  const onFile = (e) => {
    Array.from(e.target.files || []).slice(0, 5 - photos.length).forEach(f =>
      setPhotos(p => [...p, { url: URL.createObjectURL(f), name: f.name, file: f, source: "upload" }])
    );
    e.target.value = "";
  };

  const submit = async () => {
    if (!category) { alert("Please select a category."); return; }
    if (!description.trim()) { alert("Please describe the issue."); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    setSubmissions(p => [{
      id: `GRV-${Date.now()}`, category,
      title: title || CATEGORIES.find(c => c.id === category)?.label,
      description, location, photoCount: photos.length,
      status: "Received", submittedAt: new Date().toLocaleString("en-IN"),
    }, ...p]);
    setCategory(""); setTitle(""); setDesc(""); setLocation(""); setPhotos([]);
    setSubmitting(false); setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setTab("history"); }, 2500);
  };

  // ── AUTH SCREENS ─────────────────────────────────────────────
  if (authStep !== "portal") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
        style={{ background: "var(--background)" }}>
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
              style={{ background: "rgba(218,37,29,0.12)", border: "1.5px solid rgba(218,37,29,0.3)" }}>
              <ShieldCheck size={28} style={{ color: "var(--ems-red)" }} />
            </div>
            <h1 className="text-xl font-black text-white">Citizen Grievance Portal</h1>
            <p className="text-xs text-gray-500 mt-1">Share feedback directly with the Election Management Team</p>
          </div>

          <StepBar current={authStep === "register" ? 0 : 1} />

          <div className="rounded-2xl p-5 border" style={{ background: "var(--card-bg)", borderColor: "var(--border-clr)" }}>

            {authStep === "register" && (
              <div className="flex flex-col gap-4">
                <h2 className="text-sm font-black" style={{ color: "var(--foreground)" }}>Create Account / Login</h2>
                <Field label="Full Name" value={form.name} onChange={setF("name")} placeholder="e.g. Ramesh Kumar" icon={User} />
                <Field label="Mobile Number *" type="tel" value={form.mobile} onChange={setF("mobile")} placeholder="10-digit mobile number" icon={Phone} />
                <Field label="Email ID (optional)" type="email" value={form.email} onChange={setF("email")} placeholder="your@email.com" icon={Mail} />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="District" value={form.district} onChange={setF("district")} placeholder="e.g. Lucknow" icon={MapPin} />
                  <Field label="Booth No." value={form.booth} onChange={setF("booth")} placeholder="e.g. 142" icon={FileText} />
                </div>
                {otpError && <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{otpError}</p>}
                <button onClick={sendMobileOtp}
                  className="w-full py-3 rounded-xl font-black text-white text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
                  style={{ background: "var(--ems-red)" }}>
                  <Phone size={14} /> Send Mobile OTP
                </button>
                <p className="text-center text-[10px] text-gray-600">By registering you agree to EMS Privacy Policy.</p>
              </div>
            )}

            {authStep === "verify-mobile" && (
              <div className="flex flex-col gap-4">
                <button onClick={() => setAuthStep("register")} className="flex items-center gap-1 text-xs text-gray-500 hover:text-white w-fit">
                  <ArrowLeft size={12} /> Back
                </button>
                <div>
                  <h2 className="text-sm font-black" style={{ color: "var(--foreground)" }}>Verify Mobile OTP</h2>
                  <p className="text-xs text-gray-500 mt-1">OTP sent to <span className="text-green-400 font-bold">+91 {form.mobile}</span></p>
                </div>
                <input type="number" value={otpInput} onChange={e => setOtpInput(e.target.value.slice(0, 6))}
                  placeholder="_ _ _ _ _ _" maxLength={6}
                  className="w-full px-4 py-3.5 rounded-xl border text-center text-2xl font-black tracking-[0.4em] outline-none"
                  style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--foreground)" }} />
                {otpError && <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{otpError}</p>}
                <button onClick={verifyMobileOtp}
                  className="w-full py-3 rounded-xl font-black text-white text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
                  style={{ background: "var(--ems-green)" }}>
                  <CheckCircle size={14} /> Verify OTP
                </button>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  {otpTimer > 0
                    ? <span>Resend in {otpTimer}s</span>
                    : <button onClick={sendMobileOtp} className="text-blue-400 flex items-center gap-1 hover:underline"><RefreshCw size={10} /> Resend OTP</button>}
                  <span className="text-[9px] opacity-40">Dev: OTP in console</span>
                </div>
              </div>
            )}

            {authStep === "verify-email" && (
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-sm font-black" style={{ color: "var(--foreground)" }}>Verify Email OTP</h2>
                  <p className="text-xs text-gray-500 mt-1">OTP sent to <span className="text-blue-400 font-bold">{form.email}</span></p>
                </div>
                <input type="number" value={otpInput} onChange={e => setOtpInput(e.target.value.slice(0, 6))}
                  placeholder="_ _ _ _ _ _" maxLength={6}
                  className="w-full px-4 py-3.5 rounded-xl border text-center text-2xl font-black tracking-[0.4em] outline-none"
                  style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--foreground)" }} />
                {otpError && <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{otpError}</p>}
                <button onClick={verifyEmailOtp}
                  className="w-full py-3 rounded-xl font-black text-white text-sm flex items-center justify-center gap-2"
                  style={{ background: "var(--ems-green)" }}>
                  <CheckCircle size={14} /> Verify Email
                </button>
                <button onClick={finalise} className="text-xs text-gray-600 hover:text-gray-400 underline text-center">
                  Skip email verification
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── PORTAL ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)" }}>

      {/* Top bar */}
      <div className="sticky top-0 z-30 border-b px-4 py-3"
        style={{ background: "rgba(1,8,4,0.97)", borderColor: "var(--border-clr)", backdropFilter: "blur(16px)" }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(218,37,29,0.15)" }}>
              <ShieldCheck size={15} style={{ color: "var(--ems-red)" }} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-white truncate">Citizen Grievance Portal</p>
              <p className="text-[9px] text-gray-500">UP Election Management · 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
              style={{ background: "var(--ems-green)" }}>
              {citizen?.name?.[0]?.toUpperCase() || "C"}
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-[10px] font-bold text-white leading-tight truncate max-w-[120px]">{citizen?.name}</p>
              <p className="text-[9px] text-gray-500">{citizen?.district || "Citizen"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 pb-12">

        {/* Tabs */}
        <div className="flex rounded-xl p-1 mb-5 border" style={{ background: "var(--surface)", borderColor: "var(--border-clr)" }}>
          {[
            { id: "new",     label: "New Complaint",              icon: Send  },
            { id: "history", label: `My Submissions (${submissions.length})`, icon: Clock },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={"flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-[11px] font-bold transition-all " + (tab === id ? "text-white" : "text-gray-500 hover:text-gray-300")}
              style={tab === id ? { background: "var(--ems-red)" } : {}}>
              <Icon size={12} /><span className="truncate">{label}</span>
            </button>
          ))}
        </div>

        {/* ── NEW COMPLAINT ── */}
        {tab === "new" && (
          <div className="flex flex-col gap-5">
            {submitted && (
              <div className="flex items-start gap-3 p-4 rounded-xl border"
                style={{ background: "rgba(34,197,94,0.08)", borderColor: "rgba(34,197,94,0.25)" }}>
                <CheckCircle size={18} className="text-green-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-black text-green-400">Submitted Successfully!</p>
                  <p className="text-xs text-gray-400 mt-0.5">Your complaint has been received. Track it under "My Submissions".</p>
                </div>
              </div>
            )}

            {/* Category */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 mb-2 tracking-wider uppercase">Select Category *</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  const sel = category === cat.id;
                  return (
                    <button key={cat.id} onClick={() => setCategory(cat.id)}
                      className="flex items-center gap-2 p-3 rounded-xl border text-left transition-all active:scale-95"
                      style={{ background: sel ? `${cat.color}14` : "var(--surface)", borderColor: sel ? cat.color : "var(--border-clr)" }}>
                      <Icon size={14} style={{ color: cat.color }} className="shrink-0" />
                      <span className="text-[11px] font-semibold leading-tight" style={{ color: sel ? cat.color : "var(--foreground)" }}>
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Field label="Subject (optional)" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Short summary of the issue" icon={FileText} />

            <div>
              <p className="text-[11px] font-bold text-gray-400 mb-1.5 tracking-wider uppercase">Description *</p>
              <textarea value={description} onChange={e => setDesc(e.target.value.slice(0, 1000))}
                rows={4} placeholder="Describe what happened, when and where..."
                className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none resize-none transition-all"
                style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--foreground)" }} />
              <p className="text-[9px] text-gray-600 text-right mt-0.5">{description.length}/1000</p>
            </div>

            {/* Location */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 mb-1.5 tracking-wider uppercase">Location</p>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border min-w-0"
                  style={{ background: "var(--input-bg)", borderColor: "var(--input-border)" }}>
                  <MapPin size={13} className="text-gray-500 shrink-0" />
                  <input value={location} onChange={e => setLocation(e.target.value)}
                    placeholder="Address or GPS coordinates"
                    className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder-gray-600"
                    style={{ color: "var(--foreground)" }} />
                </div>
                <button onClick={getGPS}
                  className="px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 shrink-0 hover:border-green-500 transition-all"
                  style={{ background: "var(--surface)", borderColor: "var(--border-clr)", color: "#22c55e" }}>
                  {gpsLoading ? <RefreshCw size={12} className="animate-spin" /> : <MapPin size={12} />} GPS
                </button>
              </div>
            </div>

            {/* Photos */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 mb-2 tracking-wider uppercase">Attach Photos ({photos.length}/5)</p>
              {photos.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {photos.map((ph, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border shrink-0"
                      style={{ borderColor: "var(--border-clr)" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={ph.url} alt={ph.name} className="w-full h-full object-cover" />
                      <button onClick={() => setPhotos(p => p.filter((_, idx) => idx !== i))}
                        className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(0,0,0,0.75)" }}>
                        <X size={9} className="text-white" />
                      </button>
                      <p className="absolute bottom-0 left-0 right-0 px-1 py-0.5 text-[8px] text-white truncate text-center"
                        style={{ background: "rgba(0,0,0,0.65)" }}>
                        {ph.source === "camera" ? "📷 Live" : "📁 File"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <button onClick={openCamera} disabled={photos.length >= 5}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold transition-all hover:border-blue-500 disabled:opacity-40"
                  style={{ background: "var(--surface)", borderColor: "var(--border-clr)", color: "#60a5fa" }}>
                  <Camera size={14} /> Live Camera
                </button>
                <button onClick={() => fileInputRef.current?.click()} disabled={photos.length >= 5}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold transition-all hover:border-purple-500 disabled:opacity-40"
                  style={{ background: "var(--surface)", borderColor: "var(--border-clr)", color: "#c084fc" }}>
                  <Upload size={14} /> Upload File
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={onFile} />
            </div>

            <button onClick={submit} disabled={submitting || !description.trim() || !category}
              className="w-full py-4 rounded-xl font-black text-white text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: submitting ? "#374151" : "linear-gradient(135deg, #DA251D, #9b1c1c)" }}>
              {submitting
                ? <><RefreshCw size={14} className="animate-spin" /> Submitting...</>
                : <><Send size={14} /> Submit Complaint / Suggestion</>}
            </button>
          </div>
        )}

        {/* ── HISTORY ── */}
        {tab === "history" && (
          <div className="flex flex-col gap-3">
            {submissions.length === 0 ? (
              <div className="text-center py-16 flex flex-col items-center gap-3">
                <FileText size={36} className="text-gray-700" />
                <p className="text-sm font-bold text-gray-500">No submissions yet</p>
                <p className="text-xs text-gray-600">Submit a new complaint or suggestion to see it here.</p>
                <button onClick={() => setTab("new")} className="mt-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white"
                  style={{ background: "var(--ems-red)" }}>
                  New Complaint
                </button>
              </div>
            ) : submissions.map(s => {
              const cat = CATEGORIES.find(c => c.id === s.category);
              const Icon = cat?.icon || MessageSquare;
              return (
                <div key={s.id} className="rounded-xl border p-4" style={{ background: "var(--card-bg)", borderColor: "var(--border-clr)" }}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `${cat?.color}14` }}>
                        <Icon size={13} style={{ color: cat?.color }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-white truncate">{s.title}</p>
                        <p className="text-[9px] text-gray-500 font-mono">{s.id}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black shrink-0"
                      style={{ background: `${STATUS_COLOR[s.status]}14`, color: STATUS_COLOR[s.status] }}>
                      {s.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-2">{s.description}</p>
                  <div className="flex flex-wrap items-center gap-3 text-[9px] text-gray-600">
                    <span className="flex items-center gap-1"><Clock size={9} /> {s.submittedAt}</span>
                    {s.photoCount > 0 && <span className="flex items-center gap-1">📷 {s.photoCount} photo(s)</span>}
                    {s.location && <span className="flex items-center gap-1"><MapPin size={9} /> Location attached</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Camera Modal */}
      {cameraOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.95)" }}>
          <div className="w-full max-w-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-white font-black text-sm">
                <Camera size={15} className="text-red-400" /> Live Camera
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              </div>
              <button onClick={closeCamera} className="text-gray-400 hover:text-white p-1"><X size={18} /></button>
            </div>
            <div className="rounded-2xl overflow-hidden border-2 border-red-500/30 mb-4 bg-black">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video ref={videoRef} autoPlay playsInline className="w-full aspect-video object-cover" />
            </div>
            <button onClick={capturePhoto}
              className="w-full py-4 rounded-xl font-black text-white text-sm flex items-center justify-center gap-2"
              style={{ background: "var(--ems-red)" }}>
              <Camera size={15} /> Capture Photo
            </button>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      )}
    </div>
  );
}
