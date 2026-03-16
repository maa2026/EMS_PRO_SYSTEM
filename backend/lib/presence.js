/**
 * EMS PRO 2026 — Worker Presence Engine (MQTT-like Heartbeat over Redis)
 *
 * Protocol:
 *   - Worker emits `heartbeat` every 30 s → minimal payload {id, lat, lng, t}
 *   - Backend writes Redis key `wp:{id}` with 35 s TTL → auto-expires if worker goes offline
 *   - Admin dashboard polls `GET /api/workers/online-status` to render Live Army map
 *   - Estimated Redis memory: ~200 bytes/worker × 37 lakh = ~740 MB (well within range)
 */
const Redis = require('ioredis');

const PRESENCE_TTL = 35;              // seconds — slightly > 30s heartbeat interval
const KEY_PREFIX   = 'wp:';          // worker presence

let presenceStore = null;             // single Redis connection for presence

function getPresenceStore() {
  if (presenceStore) return presenceStore;

  const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  presenceStore = new Redis(REDIS_URL, {
    connectTimeout:    5000,
    lazyConnect:       true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,        // don't buffer — drop heartbeats if Redis is down
  });

  presenceStore.on('error', () => {});  // suppress unhandled errors
  presenceStore.connect().catch(() => {}); // silent fail in dev

  return presenceStore;
}

/**
 * Record a heartbeat from a worker.
 * @param {string} workerId
 * @param {{ lat?: number, lng?: number, role?: string, name?: string, district?: string }} meta
 */
async function recordHeartbeat(workerId, meta = {}) {
  const store = getPresenceStore();
  const payload = JSON.stringify({
    id:       workerId,
    lat:      meta.lat      || null,
    lng:      meta.lng      || null,
    role:     meta.role     || '',
    name:     meta.name     || '',
    district: meta.district || '',
    t:        Date.now(),
  });
  try {
    await store.setex(`${KEY_PREFIX}${workerId}`, PRESENCE_TTL, payload);
  } catch (_) { /* Redis unavailable — silently skip */ }
}

/**
 * Get all currently online workers (all non-expired wp:* keys).
 * Batches SCAN + MGET for efficiency at 37 lakh scale.
 * @returns {Promise<Array<{id,lat,lng,role,name,district,t}>>}
 */
async function getOnlineWorkers() {
  const store = getPresenceStore();
  const workers = [];
  try {
    let cursor = '0';
    const keys = [];

    // SCAN in batches of 500 — non-blocking on large key sets
    do {
      const [nextCursor, batch] = await store.scan(cursor, 'MATCH', `${KEY_PREFIX}*`, 'COUNT', 500);
      cursor = nextCursor;
      keys.push(...batch);
    } while (cursor !== '0');

    if (!keys.length) return workers;

    // MGET all presence payloads in one round-trip
    const values = await store.mget(...keys);
    for (const v of values) {
      if (v) {
        try { workers.push(JSON.parse(v)); } catch (_) {}
      }
    }
  } catch (_) {}
  return workers;
}

/**
 * Get online count by district (for admin summary chips).
 */
async function getOnlineCountByDistrict() {
  const workers = await getOnlineWorkers();
  const counts  = {};
  for (const w of workers) {
    const d = w.district || 'Unknown';
    counts[d] = (counts[d] || 0) + 1;
  }
  return counts;
}

module.exports = { recordHeartbeat, getOnlineWorkers, getOnlineCountByDistrict, PRESENCE_TTL };
