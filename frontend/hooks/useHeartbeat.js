'use client';
/**
 * useHeartbeat — 30 s GPS worker presence hook
 *
 * Emits compact "heartbeat" Socket.io event every 30 s so the Redis
 * presence store keeps the worker's key alive (35 s TTL).
 * Also registers a page-visibility handler to send immediately when
 * the tab comes back into focus after being backgrounded.
 *
 * Usage:
 *   import { useHeartbeat } from '@/hooks/useHeartbeat';
 *   useHeartbeat({ workerId, role, name, district });
 */
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const HEARTBEAT_INTERVAL_MS = 30_000;   // 30 s — one interval below Redis TTL (35 s)
const SOCKET_URL             = '';       // same-origin (Next.js proxy)

export function useHeartbeat({ workerId, role = '', name = '', district = '' } = {}) {
  const socketRef   = useRef(null);
  const intervalRef = useRef(null);
  const watchIdRef  = useRef(null);
  const coordsRef   = useRef({ lat: null, lng: null });

  useEffect(() => {
    if (!workerId) return;   // hook is a no-op until the worker is authenticated

    // --- Socket ---
    const socket = io(SOCKET_URL, {
      transports:     ['polling', 'websocket'],  // polling-first for 2G/3G
      reconnection:    true,
      reconnectionDelay:       5000,
      reconnectionDelayMax:   30000,
    });
    socketRef.current = socket;

    // Join personal room so admin can push directives
    socket.on('connect', () => {
      socket.emit('join_protocol', { userId: workerId, userRole: role });
      sendHeartbeat();   // immediate beat on (re)connect
    });

    // --- GPS watch (continuous; updated coords used by next heartbeat) ---
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          coordsRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        },
        () => {},
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 30000 }
      );
    }

    function sendHeartbeat() {
      if (!socket.connected) return;
      socket.emit('heartbeat', {
        workerId: String(workerId),
        lat:      coordsRef.current.lat,
        lng:      coordsRef.current.lng,
        role:     String(role).slice(0, 20),
        name:     String(name).slice(0, 80),
        district: String(district).slice(0, 60),
      });
    }

    // --- 30 s repeating pulse ---
    intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);

    // --- Page-visibility: re-pulse when tab resurfaces ---
    function onVisibilityChange() {
      if (document.visibilityState === 'visible') sendHeartbeat();
    }
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      socket.disconnect();
    };
  }, [workerId, role, name, district]);
}
