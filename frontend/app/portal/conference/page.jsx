'use client';

/**
 * EMS.UP VIDEO CONFERENCING CLUSTER
 *
 * SFU-Pattern (Selective Forwarding Unit) Broadcasting:
 *  • Admin (L0/L1/L2) starts a meeting → gets a unique Room ID
 *  • Workers join by entering the Room ID → receive admin's video via WebRTC
 *  • Worker "Raise Hand" → Admin accepts → mic channel opens
 *  • Per-peer bitrate control: admin throttles encoding for low-bandwidth workers
 *
 * Bandwidth Optimisation:
 *  • navigator.connection API detects 2G/3G/4G automatically
 *  • RTCPeerConnection.getStats() monitors real-time packet loss
 *  • Auto-switches to 240p @ 15 fps on poor links
 *  • Worker self-reports kbps → server advises admin to reduce encoding
 *
 * Upgrade Path:
 *  Replace the per-peer offer/answer loop on the server with mediasoup3
 *  Transport/Producer/Consumer — zero frontend changes required.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import {
  Video, VideoOff, Mic, MicOff, PhoneOff, Hand, Users,
  Monitor, Play, CheckCircle, Radio, Signal,
  Loader, AlertTriangle, X, ShieldCheck,
} from 'lucide-react';

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const BACKEND_URL = (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_WS_URL)
  || 'http://localhost:5000';

const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // Production: add TURN server for workers behind NAT (rural India):
    // { urls: 'turn:turn.ems.up.gov.in:3478', username: 'ems', credential: '<secret>' }
  ],
  iceCandidatePoolSize: 10,
};

// Video constraints per quality level
const QUALITY = {
  '720p': { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
  '480p': { width: { ideal: 854  }, height: { ideal: 480 }, frameRate: { ideal: 24 } },
  '360p': { width: { ideal: 640  }, height: { ideal: 360 }, frameRate: { ideal: 20 } },
  '240p': { width: { ideal: 426  }, height: { ideal: 240 }, frameRate: { ideal: 15 } },
};

// Max encoding bitrate per quality (for RTCRtpSender.setParameters)
const BITRATE = { '720p': 1_500_000, '480p': 750_000, '360p': 400_000, '240p': 150_000 };

// Network score (0-100) → quality label + target resolution
function scoreToNet(score) {
  if (score >= 80) return { label: 'HD Ready', color: '#22c55e', q: '720p' };
  if (score >= 55) return { label: 'Good (4G)', color: '#84cc16', q: '480p' };
  if (score >= 30) return { label: '3G Mode',  color: '#f59e0b', q: '360p' };
  return             { label: '2G — 240p', color: '#ef4444', q: '240p' };
}

// Roles that can start/broadcast meetings
const ADMIN_ROLES = new Set(['L0', 'L1', 'L2']);

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function ConferencePage() {
  // Identity (set during login → localStorage)
  const [myName,     setMyName]     = useState('');
  const [myRole,     setMyRole]     = useState('');
  const [myDistrict, setMyDistrict] = useState('');
  const [isAdmin,    setIsAdmin]    = useState(false);

  // Stage: idle | lobby | meeting | ended
  const [stage,        setStage]        = useState('idle');
  const [roomId,       setRoomId]       = useState('');
  const [roomIdInput,  setRoomIdInput]  = useState('');

  // Meeting state
  const [isMicOn,      setIsMicOn]      = useState(true);
  const [isVideoOn,    setIsVideoOn]    = useState(true);
  const [workers,      setWorkers]      = useState([]);      // [{socketId, name, role, district, raisedHand}]
  const [workerCount,  setWorkerCount]  = useState(0);
  const [raisedHands,  setRaisedHands]  = useState([]);      // [{socketId, name, district, message}]
  const [granted,      setGranted]      = useState(false);   // worker: got intervention?
  const [handMsg,      setHandMsg]      = useState('');
  const [showHandInput,setShowHandInput]= useState(false);

  // Network
  const [netScore,    setNetScore]    = useState(85);
  const [quality,     setQuality]     = useState('720p');
  const [autoAdapt,   setAutoAdapt]   = useState(true);

  // UX
  const [camErr, setCamErr] = useState('');
  const [info,   setInfo]   = useState('');

  // Refs — stable across re-renders
  const socketRef      = useRef(null);
  const localStreamRef = useRef(null);
  const localVideoRef  = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConns      = useRef(new Map()); // socketId → RTCPeerConnection
  const statsTimer     = useRef(null);
  const qualityRef     = useRef('720p');    // mirror of quality state for use inside intervals
  const autoAdaptRef   = useRef(true);

  // Sync refs with state
  useEffect(() => { qualityRef.current  = quality;    }, [quality]);
  useEffect(() => { autoAdaptRef.current = autoAdapt; }, [autoAdapt]);

  // Load identity from localStorage (set by login page)
  useEffect(() => {
    const name  = localStorage.getItem('userName')     || 'Worker';
    const role  = localStorage.getItem('userRole')     || 'JSS';
    const dist  = localStorage.getItem('userDistrict') || '';
    setMyName(name);
    setMyRole(role);
    setMyDistrict(dist);
    setIsAdmin(ADMIN_ROLES.has(role));
  }, []);

  // Cleanup everything on unmount
  useEffect(() => () => cleanup(), []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── CLEANUP ───────────────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    clearInterval(statsTimer.current);
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    peerConns.current.forEach(pc => pc.close());
    peerConns.current.clear();
    socketRef.current?.disconnect();
    socketRef.current = null;
  }, []);

  // ── CAMERA / MIC ACCESS ───────────────────────────────────────────────────
  const getMedia = useCallback(async (q = '720p') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: QUALITY[q] || QUALITY['720p'],
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      setCamErr('');
      return stream;
    } catch {
      setCamErr('Camera/Mic permission denied. Please allow and retry.');
      return null;
    }
  }, []);

  // ── QUALITY SWITCH ─────────────────────────────────────────────────────────
  // Applies new constraints to local track + updates bitrate on all peer senders
  const switchQuality = useCallback(async (q) => {
    if (!QUALITY[q] || q === qualityRef.current) return;
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) {
      try { await track.applyConstraints(QUALITY[q]); } catch { /* ignore */ }
    }
    // Admin: update max bitrate per sender
    peerConns.current.forEach(pc => {
      pc.getSenders().forEach(sender => {
        if (sender.track?.kind !== 'video') return;
        const params = sender.getParameters();
        if (!params.encodings?.length) params.encodings = [{}];
        params.encodings[0].maxBitrate = BITRATE[q];
        sender.setParameters(params).catch(() => {});
      });
    });
    setQuality(q);
  }, []);

  // ── PER-PEER ENCODING FOR QUALITY ADVISORY ─────────────────────────────────
  // Only throttles the specific peer connection for the low-bandwidth worker
  const throttlePeer = useCallback((targetSocketId, q) => {
    const pc = peerConns.current.get(targetSocketId);
    if (!pc) return;
    pc.getSenders().forEach(sender => {
      if (sender.track?.kind !== 'video') return;
      const params = sender.getParameters();
      if (!params.encodings?.length) params.encodings = [{}];
      params.encodings[0].maxBitrate = BITRATE[q] || BITRATE['240p'];
      sender.setParameters(params).catch(() => {});
    });
  }, []);

  // ── NETWORK QUALITY MONITOR ────────────────────────────────────────────────
  const startStatsMonitor = useCallback(() => {
    clearInterval(statsTimer.current);
    statsTimer.current = setInterval(async () => {
      // 1. Navigator.connection (Network Information API)
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      let score = 85;
      if (conn) {
        score =
          conn.effectiveType === '4g'      ? 90 :
          conn.effectiveType === '3g'      ? 60 :
          conn.effectiveType === '2g'      ? 25 :
          conn.effectiveType === 'slow-2g' ?  5 : 85;
        if (conn.downlink) score = Math.min(score, conn.downlink * 20);
      }

      // 2. RTCPeerConnection.getStats() — packet-loss correction
      const firstPC = [...peerConns.current.values()][0];
      if (firstPC) {
        try {
          const stats = await firstPC.getStats();
          let lost = 0, total = 0;
          stats.forEach(r => {
            if ((r.type === 'outbound-rtp' || r.type === 'inbound-rtp') && r.kind === 'video') {
              lost  += r.packetsLost   || 0;
              total += (r.packetsSent || r.packetsReceived || 0);
            }
          });
          if (total > 0) score = Math.max(5, score * (1 - (lost / (total + lost)) * 3));
        } catch { /* ignore */ }
      }

      score = Math.round(Math.max(5, Math.min(100, score)));
      setNetScore(score);

      const { q } = scoreToNet(score);
      if (autoAdaptRef.current && q !== qualityRef.current) {
        switchQuality(q);
        // Worker reports bandwidth so server can advise admin
        if (socketRef.current && !ADMIN_ROLES.has(myRole)) {
          socketRef.current.emit('sfu:bandwidth_report', { kbps: score * 15 });
        }
      }
    }, 5000);
  }, [switchQuality, myRole]);

  // ── WebRTC PEER FACTORY ────────────────────────────────────────────────────
  const createPeer = useCallback((targetSocketId, initiator) => {
    peerConns.current.get(targetSocketId)?.close();
    const pc = new RTCPeerConnection(RTC_CONFIG);
    peerConns.current.set(targetSocketId, pc);

    if (initiator && localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track =>
        pc.addTrack(track, localStreamRef.current)
      );
    }

    if (!initiator) {
      pc.ontrack = ({ streams }) => {
        if (remoteVideoRef.current && streams[0]) {
          remoteVideoRef.current.srcObject = streams[0];
        }
      };
    }

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        socketRef.current?.emit('sfu:ice', { targetSocketId, candidate });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        peerConns.current.delete(targetSocketId);
      }
    };

    return pc;
  }, []);

  // ── JOIN MEETING ───────────────────────────────────────────────────────────
  const joinMeeting = useCallback(async () => {
    const rid = isAdmin
      ? `EMS-${Date.now().toString(36).toUpperCase()}`
      : roomIdInput.trim().toUpperCase();
    if (!rid) { setInfo('Please enter a Meeting ID.'); return; }

    setStage('lobby');

    // Admin needs camera; workers only need camera if they want to (optional)
    const stream = await getMedia(quality);
    if (!stream && isAdmin) {
      setCamErr('Camera is required to broadcast. Please allow access.');
      setStage('idle');
      return;
    }

    const socket = io(`${BACKEND_URL}/sfu`, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setRoomId(rid);
      socket.emit('sfu:join', {
        roomId: rid, name: myName, isAdmin, role: myRole, district: myDistrict,
      });
      setStage('meeting');
      startStatsMonitor();
    });

    socket.on('connect_error', () => {
      setInfo('Cannot connect to conference server. Is the backend running?');
      setStage('idle');
      cleanup();
    });

    // ── ADMIN EVENTS ───────────────────────────────────────────────────────
    socket.on('sfu:worker_joined', async ({ workerSocketId, name, role, district }) => {
      setWorkers(prev => [
        ...prev.filter(w => w.socketId !== workerSocketId),
        { socketId: workerSocketId, name, role, district, raisedHand: false },
      ]);
      const pc = createPeer(workerSocketId, true);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('sfu:offer', { targetSocketId: workerSocketId, sdp: offer });
    });

    socket.on('sfu:answer', async ({ fromSocketId, sdp }) => {
      const pc = peerConns.current.get(fromSocketId);
      if (pc && pc.signalingState !== 'stable') {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp)).catch(() => {});
      }
    });

    socket.on('sfu:hand_raised', ({ workerSocketId, name, district, message }) => {
      setRaisedHands(prev => [
        ...prev.filter(h => h.socketId !== workerSocketId),
        { socketId: workerSocketId, name, district, message },
      ]);
      setWorkers(prev =>
        prev.map(w => w.socketId === workerSocketId ? { ...w, raisedHand: true } : w)
      );
    });

    // Server advises to reduce encoding for a specific slow worker
    socket.on('sfu:quality_advisory', ({ workerSocketId, suggestedQuality }) => {
      throttlePeer(workerSocketId, suggestedQuality);
    });

    socket.on('sfu:worker_left', ({ workerSocketId }) => {
      peerConns.current.get(workerSocketId)?.close();
      peerConns.current.delete(workerSocketId);
      setWorkers(prev => prev.filter(w => w.socketId !== workerSocketId));
      setRaisedHands(prev => prev.filter(h => h.socketId !== workerSocketId));
    });

    // ── WORKER EVENTS ──────────────────────────────────────────────────────
    socket.on('sfu:offer', async ({ fromSocketId, sdp }) => {
      const pc = createPeer(fromSocketId, false);
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('sfu:answer', { targetSocketId: fromSocketId, sdp: answer });
    });

    socket.on('sfu:admin_ready', () => {
      setInfo('Admin ne broadcast shuru kiya. Connecting...');
    });

    socket.on('sfu:intervention_granted', () => {
      setGranted(true);
      setInfo('Aapko baat karne ki permission mili! Mic ab active hai.');
      localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = true; });
    });

    socket.on('sfu:intervention_ended', () => {
      setGranted(false);
      setInfo('Sawaal khatam. Shukriya!');
      localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = false; });
    });

    socket.on('sfu:forced_mute', () => {
      setIsMicOn(false);
      localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = false; });
      setInfo('Admin ne sabko mute kar diya.');
    });

    // ── SHARED EVENTS ──────────────────────────────────────────────────────
    socket.on('sfu:ice', async ({ fromSocketId, candidate }) => {
      const pc = peerConns.current.get(fromSocketId);
      if (pc && candidate) {
        try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch { /* ignore */ }
      }
    });

    socket.on('sfu:participant_count', ({ workerCount: wc }) => {
      setWorkerCount(wc);
    });

    socket.on('sfu:meeting_ended', () => { setStage('ended'); cleanup(); });
    socket.on('sfu:admin_left',    () => { setInfo('Host ne meeting chhod di.'); setStage('ended'); cleanup(); });

  }, [
    isAdmin, roomIdInput, myName, myRole, myDistrict, quality,
    getMedia, startStatsMonitor, createPeer, throttlePeer, cleanup,
  ]);

  // ── CONTROLS ───────────────────────────────────────────────────────────────
  const toggleMic = () => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setIsMicOn(p => !p);
  };
  const toggleVideo = () => {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setIsVideoOn(p => !p);
  };

  const raiseHand = () => {
    if (!showHandInput && !handMsg.trim()) { setShowHandInput(true); return; }
    socketRef.current?.emit('sfu:raise_hand', { message: handMsg });
    setShowHandInput(false);
    setHandMsg('');
    setInfo('Haath utha diya. Admin se permission ka intezaar karein...');
  };

  const acceptIntervention = (workerSocketId) => {
    socketRef.current?.emit('sfu:accept_intervention', { workerSocketId });
    setRaisedHands(prev => prev.filter(h => h.socketId !== workerSocketId));
    setWorkers(prev => prev.map(w => w.socketId === workerSocketId ? { ...w, raisedHand: false } : w));
  };

  const endMeeting = () => {
    if (isAdmin) socketRef.current?.emit('sfu:end_meeting');
    setTimeout(() => { setStage('ended'); cleanup(); }, 400);
  };

  // Screen share (admin only)
  const shareScreen = async () => {
    try {
      const screen = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      const videoTrack = screen.getVideoTracks()[0];
      peerConns.current.forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) sender.replaceTrack(videoTrack).catch(() => {});
      });
      if (localVideoRef.current) {
        const mixed = new MediaStream([videoTrack, ...(localStreamRef.current?.getAudioTracks() || [])]);
        localVideoRef.current.srcObject = mixed;
      }
      videoTrack.onended = () => {
        const original = localStreamRef.current?.getVideoTracks()[0];
        if (!original) return;
        peerConns.current.forEach(pc => {
          pc.getSenders().find(s => s.track?.kind === 'video')?.replaceTrack(original).catch(() => {});
        });
        if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
      };
    } catch { /* user cancelled */ }
  };

  // ── NET INDICATOR ──────────────────────────────────────────────────────────
  const net = scoreToNet(netScore);

  // ── RENDER ─────────────────────────────────────────────────────────────────
  if (stage === 'ended')                return <EndedScreen isAdmin={isAdmin} />;
  if (stage === 'idle' || stage === 'lobby') return (
    <JoinScreen
      isAdmin={isAdmin} myName={myName} myRole={myRole}
      roomIdInput={roomIdInput} setRoomIdInput={setRoomIdInput}
      joinMeeting={joinMeeting} camErr={camErr} info={info}
      stage={stage}
    />
  );

  // ── MEETING VIEW ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col select-none" style={{ fontFamily: 'system-ui,sans-serif' }}>

      {/* ── TOP BAR ── */}
      <div className="flex items-center justify-between px-5 py-3 bg-black/70 border-b border-white/5 backdrop-blur-xl z-10">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span style={{ fontSize: 9, letterSpacing: '0.15em', fontWeight: 900, color: '#6b7280', textTransform: 'uppercase' }}>LIVE MEETING</span>
          <code style={{ fontSize: 11, fontWeight: 700, color: '#f87171', background: 'rgba(127,29,29,0.3)', padding: '3px 12px', borderRadius: 8 }}>{roomId}</code>
        </div>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5" style={{ fontSize: 10, fontWeight: 700, color: net.color, textTransform: 'uppercase' }}>
            <Signal size={11} />
            {net.label}
            <span style={{ color: '#4b5563' }}>· {quality}</span>
            {!autoAdapt && (
              <button onClick={() => setAutoAdapt(true)} style={{ marginLeft: 4, color: '#6b7280', fontSize: 9, cursor: 'pointer', background: 'none', border: 'none' }}>
                AUTO
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5" style={{ fontSize: 10, fontWeight: 700, color: '#6b7280' }}>
            <Users size={11} /> {workerCount} joined
          </div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* VIDEO AREA */}
        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">

          {isAdmin ? (
            <>
              <video
                ref={localVideoRef} autoPlay muted playsInline
                className="w-full h-full object-cover"
                style={{ opacity: isVideoOn ? 1 : 0, transition: 'opacity 0.3s' }}
              />
              {!isVideoOn && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/90">
                  <div style={{ textAlign: 'center' }}>
                    <VideoOff size={48} color="#374151" />
                    <p style={{ color: '#4b5563', fontWeight: 700, fontSize: 12, marginTop: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Video Off</p>
                  </div>
                </div>
              )}
              {/* LIVE badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2" style={{ background: 'rgba(220,38,38,0.9)', backdropFilter: 'blur(12px)', padding: '6px 14px', borderRadius: 999, fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                <Radio size={11} className="animate-pulse" /> LIVE BROADCAST
              </div>
              <div className="absolute top-4 right-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', padding: '6px 14px', borderRadius: 999, fontSize: 11, fontWeight: 700, color: '#d1d5db' }}>
                <Users size={11} style={{ display: 'inline', marginRight: 6 }} />
                {workerCount} Workers Connected
              </div>
            </>
          ) : (
            <>
              <video
                ref={remoteVideoRef} autoPlay playsInline
                className="w-full h-full object-cover"
              />
              {/* Waiting blot */}
              {!peerConns.current.size && (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                  <div style={{ textAlign: 'center' }}>
                    <Loader size={40} color="#dc2626" className="animate-spin mx-auto mb-4" />
                    <p style={{ color: '#6b7280', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Broadcast se connect ho raha hoon...</p>
                    <p style={{ color: '#374151', fontSize: 11, marginTop: 6 }}>Room: {roomId}</p>
                  </div>
                </div>
              )}
              {/* Network quality badge */}
              <div className="absolute top-4 left-4 flex items-center gap-1.5" style={{ color: net.color, border: `1px solid ${net.color}40`, background: `${net.color}18`, padding: '5px 12px', borderRadius: 999, fontSize: 10, fontWeight: 700 }}>
                <Signal size={10} /> {net.label} · {quality}
              </div>
              {/* Intervention granted */}
              {granted && (
                <div className="absolute top-4 right-4 flex items-center gap-2 animate-pulse" style={{ background: 'rgba(22,163,74,0.9)', padding: '6px 14px', borderRadius: 999, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  <Mic size={11} /> Mic Active — Baat Karo!
                </div>
              )}
            </>
          )}
        </div>

        {/* RIGHT PANEL — Admin only */}
        {isAdmin && (
          <div className="w-72 flex flex-col border-l border-white/5" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(16px)' }}>

            {/* Raised hands queue */}
            {raisedHands.length > 0 && (
              <div className="border-b border-white/5 p-4">
                <p style={{ fontSize: 9, fontWeight: 900, color: '#eab308', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>
                  ✋ Raised Hands ({raisedHands.length})
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 160, overflowY: 'auto' }}>
                  {raisedHands.map(h => (
                    <div key={h.socketId} style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: 12, padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 700, lineHeight: 1 }}>{h.name}</p>
                        {h.message && <p style={{ fontSize: 10, color: '#6b7280', marginTop: 3 }}>{h.message}</p>}
                        <p style={{ fontSize: 9, color: '#374151', marginTop: 2 }}>{h.district}</p>
                      </div>
                      <button
                        onClick={() => acceptIntervention(h.socketId)}
                        style={{ flexShrink: 0, background: '#ca8a04', color: '#000', fontWeight: 900, fontSize: 9, textTransform: 'uppercase', padding: '5px 10px', borderRadius: 8, cursor: 'pointer', border: 'none', letterSpacing: '0.05em' }}
                      >Allow</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Worker list */}
            <div className="flex-1 overflow-y-auto p-4">
              <p style={{ fontSize: 9, fontWeight: 900, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>
                Workers ({workers.length})
              </p>
              {workers.length === 0 ? (
                <p style={{ fontSize: 11, color: '#374151', textAlign: 'center', marginTop: 32 }}>Waiting for workers...</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {workers.map(w => (
                    <div key={w.socketId} style={{ background: w.raisedHand ? 'rgba(234,179,8,0.05)' : 'rgba(255,255,255,0.02)', border: `1px solid ${w.raisedHand ? 'rgba(234,179,8,0.2)' : 'rgba(255,255,255,0.05)'}`, borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: w.raisedHand ? '#eab308' : '#22c55e', flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 700, lineHeight: 1 }}>{w.name}</p>
                        <p style={{ fontSize: 9, color: '#6b7280', marginTop: 2 }}>{w.role} · {w.district}</p>
                      </div>
                      {w.raisedHand && <Hand size={10} color="#eab308" style={{ marginLeft: 'auto' }} />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quality controls */}
            <div className="border-t border-white/5 p-4">
              <p style={{ fontSize: 9, fontWeight: 900, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Broadcast Quality</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 4 }}>
                {['720p', '480p', '360p', '240p'].map(q => (
                  <button
                    key={q}
                    onClick={() => { switchQuality(q); setAutoAdapt(false); }}
                    style={{ background: quality === q ? '#dc2626' : 'rgba(255,255,255,0.05)', color: quality === q ? '#fff' : '#6b7280', fontWeight: 900, fontSize: 9, textTransform: 'uppercase', padding: '6px 0', borderRadius: 8, cursor: 'pointer', border: 'none', letterSpacing: '0.05em', transition: 'all 0.15s' }}
                  >{q}</button>
                ))}
              </div>
              <button
                onClick={() => setAutoAdapt(true)}
                style={{ width: '100%', marginTop: 4, padding: '5px 0', borderRadius: 8, fontWeight: 900, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer', border: autoAdapt ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(255,255,255,0.05)', background: autoAdapt ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.03)', color: autoAdapt ? '#22c55e' : '#6b7280', transition: 'all 0.15s' }}
              >Auto Adaptive {autoAdapt ? '✓' : ''}</button>
            </div>
          </div>
        )}
      </div>

      {/* WORKER: HAND RAISE INPUT */}
      {!isAdmin && showHandInput && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', background: 'rgba(78,52,0,0.4)', borderTop: '1px solid rgba(234,179,8,0.2)' }}>
          <input
            autoFocus
            value={handMsg}
            onChange={e => setHandMsg(e.target.value.slice(0, 200))}
            onKeyDown={e => e.key === 'Enter' && raiseHand()}
            placeholder="Apna sawaal likhein (optional)..."
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 13, fontWeight: 600 }}
          />
          <button onClick={raiseHand} style={{ background: '#ca8a04', color: '#000', fontWeight: 900, fontSize: 11, padding: '7px 16px', borderRadius: 10, cursor: 'pointer', border: 'none' }}>Send</button>
          <button onClick={() => setShowHandInput(false)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 4 }}><X size={14} /></button>
        </div>
      )}

      {/* INFO BANNER */}
      {info && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '7px 20px', background: 'rgba(30,58,138,0.3)', borderTop: '1px solid rgba(59,130,246,0.2)', fontSize: 12, fontWeight: 600, color: '#93c5fd' }}>
          {info}
          <button onClick={() => setInfo('')} style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer' }}><X size={11} /></button>
        </div>
      )}

      {/* BOTTOM CONTROLS */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '14px 24px', background: 'rgba(0,0,0,0.75)', borderTop: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(16px)' }}>

        {/* MIC */}
        <button onClick={toggleMic} style={{ padding: 14, borderRadius: 16, border: `1px solid ${isMicOn ? 'rgba(255,255,255,0.1)' : 'rgba(220,38,38,0.4)'}`, background: isMicOn ? 'rgba(255,255,255,0.05)' : 'rgba(220,38,38,0.15)', color: isMicOn ? '#fff' : '#f87171', cursor: 'pointer', transition: 'all 0.15s' }}>
          {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>

        {/* CAMERA */}
        <button onClick={toggleVideo} style={{ padding: 14, borderRadius: 16, border: `1px solid ${isVideoOn ? 'rgba(255,255,255,0.1)' : 'rgba(220,38,38,0.4)'}`, background: isVideoOn ? 'rgba(255,255,255,0.05)' : 'rgba(220,38,38,0.15)', color: isVideoOn ? '#fff' : '#f87171', cursor: 'pointer', transition: 'all 0.15s' }}>
          {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
        </button>

        {/* ADMIN: SCREEN SHARE */}
        {isAdmin && (
          <button onClick={shareScreen} style={{ padding: 14, borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#d1d5db', cursor: 'pointer', transition: 'all 0.15s' }} title="Screen Share">
            <Monitor size={20} />
          </button>
        )}

        {/* ADMIN: MUTE ALL */}
        {isAdmin && (
          <button
            onClick={() => socketRef.current?.emit('sfu:mute_all')}
            style={{ padding: '14px 20px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#d1d5db', cursor: 'pointer', fontWeight: 900, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 7, transition: 'all 0.15s' }}
          >
            <MicOff size={16} /> Mute All
          </button>
        )}

        {/* WORKER: RAISE HAND */}
        {!isAdmin && (
          <button
            onClick={raiseHand}
            disabled={granted}
            style={{ padding: '14px 20px', borderRadius: 16, border: `1px solid ${granted ? 'rgba(34,197,94,0.4)' : 'rgba(234,179,8,0.3)'}`, background: granted ? 'rgba(34,197,94,0.15)' : 'rgba(234,179,8,0.1)', color: granted ? '#86efac' : '#fde047', cursor: granted ? 'default' : 'pointer', fontWeight: 900, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 7, transition: 'all 0.15s' }}
          >
            {granted ? <ShieldCheck size={16} /> : <Hand size={16} />}
            {granted ? 'Mic Active' : 'Raise Hand'}
          </button>
        )}

        {/* END CALL */}
        <button
          onClick={endMeeting}
          style={{ padding: 14, borderRadius: 16, background: '#dc2626', color: '#fff', cursor: 'pointer', border: 'none', boxShadow: '0 4px 20px rgba(220,38,38,0.4)', transition: 'all 0.15s' }}
        >
          <PhoneOff size={20} />
        </button>
      </div>
    </div>
  );
}

// ─── JOIN / LOBBY SCREEN ─────────────────────────────────────────────────────
function JoinScreen({ isAdmin, myName, myRole, roomIdInput, setRoomIdInput, joinMeeting, camErr, info, stage }) {
  return (
    <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 420, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 28, padding: 36, backdropFilter: 'blur(20px)' }}>

        {/* Icon */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 8px 32px rgba(220,38,38,0.35)' }}>
            <Video size={30} color="#fff" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '-0.02em', color: '#fff' }}>
            EMS <span style={{ color: '#dc2626' }}>Conference</span>
          </h1>
          <p style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, marginTop: 4 }}>
            {isAdmin ? 'Admin Broadcast Mode' : 'Worker View Mode'} · {myRole}
          </p>
        </div>

        {/* Camera error */}
        {camErr && (
          <div style={{ background: 'rgba(127,29,29,0.3)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 12, padding: '10px 14px', marginBottom: 14, fontSize: 12, fontWeight: 600, color: '#f87171', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={13} /> {camErr}
          </div>
        )}

        {/* Info */}
        {info && (
          <div style={{ background: 'rgba(30,58,138,0.3)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 12, padding: '10px 14px', marginBottom: 14, fontSize: 12, fontWeight: 600, color: '#93c5fd' }}>
            {info}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Name display */}
          <div>
            <label style={{ fontSize: 9, fontWeight: 900, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: 6 }}>Your Name</label>
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 16px', fontSize: 14, fontWeight: 700, color: '#d1d5db' }}>
              {myName || 'Guest Worker'}
            </div>
          </div>

          {/* Meeting ID (workers only) */}
          {!isAdmin && (
            <div>
              <label style={{ fontSize: 9, fontWeight: 900, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: 6 }}>Meeting ID *</label>
              <input
                value={roomIdInput}
                onChange={e => setRoomIdInput(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && joinMeeting()}
                placeholder="e.g. EMS-A1B2C3"
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 16px', fontSize: 14, fontWeight: 700, color: '#fff', outline: 'none', textTransform: 'uppercase', letterSpacing: '0.08em', boxSizing: 'border-box' }}
              />
            </div>
          )}

          {/* CTA Button */}
          <button
            onClick={joinMeeting}
            disabled={stage === 'lobby'}
            style={{ width: '100%', padding: '15px 0', borderRadius: 16, fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 14, border: 'none', cursor: stage === 'lobby' ? 'wait' : 'pointer', background: stage === 'lobby' ? 'rgba(255,255,255,0.05)' : '#dc2626', color: stage === 'lobby' ? '#4b5563' : '#fff', boxShadow: stage === 'lobby' ? 'none' : '0 8px 32px rgba(220,38,38,0.35)', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {stage === 'lobby' ? (
              <><Loader size={16} className="animate-spin" /> Connecting...</>
            ) : isAdmin ? (
              <><Play size={16} fill="currentColor" /> Start Meeting</>
            ) : (
              <><Users size={16} /> Join Meeting</>
            )}
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 10, color: '#374151', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 24 }}>
          {isAdmin
            ? 'Ek unique Meeting ID generate hoga · Workers ko share karein'
            : 'Admin dwara share kiya gaya Meeting ID enter karein'}
        </p>
      </div>
    </div>
  );
}

// ─── ENDED SCREEN ─────────────────────────────────────────────────────────────
function EndedScreen({ isAdmin }) {
  return (
    <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: 24, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <CheckCircle size={40} color="#22c55e" />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '-0.02em', color: '#fff', marginBottom: 8 }}>
          Meeting Ended
        </h2>
        <p style={{ fontSize: 14, color: '#6b7280', fontWeight: 600 }}>
          {isAdmin ? 'Broadcast successfully completed.' : 'Admin ne meeting khatam ki.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{ marginTop: 32, padding: '14px 32px', background: '#dc2626', color: '#fff', borderRadius: 16, fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 14, border: 'none', cursor: 'pointer', boxShadow: '0 8px 32px rgba(220,38,38,0.35)' }}
        >
          New Meeting
        </button>
      </div>
    </div>
  );
}
