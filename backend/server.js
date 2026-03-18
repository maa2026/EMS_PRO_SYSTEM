const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const Redis = require('ioredis');
const { encryptFields, decryptFields } = require('./lib/chatCrypto');
const { ensureIndex, indexVoter }      = require('./lib/voterIndex');
const { searchVoters }                 = require('./lib/voterSearch');
const { recordHeartbeat, getOnlineWorkers, getOnlineCountByDistrict } = require('./lib/presence');

// 📦 EXISTING MODELS IMPORT (MongoDB)
const Booth = require('./models/Booth');
const Worker = require('./models/Worker');
const VoterModel = require('./models/VoterModel');
const Message = require('./models/Message');

// 🆕 NEW CONTROLLERS & ROUTES (PostgreSQL)
const userRoutes = require('./routes/userRoutes');
const voterController = require('./controllers/voterController');
const dataMasking = require('./middleware/dataMasking')();

require('dotenv').config();

const app = express();
const server = http.createServer(app);

// ✅ 1. SOCKET.IO — 2G/3G OPTIMISED + WebSocket with Long-Poll fallback
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST"],
    credentials: true
  },
  allowEIO3: true,
  // polling first → reliable on 2G/3G; upgrades to WebSocket when link allows
  transports: ['polling', 'websocket'],
  pingTimeout:      60000,   // 60 s — rural 2G links can stall
  pingInterval:     25000,   // probe every 25 s
  upgradeTimeout:   30000,   // generous upgrade window
  connectTimeout:   45000,
  maxHttpBufferSize: 1e6,    // 1 MB max payload
  perMessageDeflate: { threshold: 512 }, // compress messages > 512 B
});

// ✅ 2. REDIS CLUSTER (6-node) ADAPTER — sub-millisecond pub/sub
//    Set REDIS_NODES=127.0.0.1:7000,127.0.0.1:7001,...  for cluster
//    Set REDIS_URL=redis://host:6379                    for single node
//    Falls back to in-memory if Redis is unreachable.
(async () => {
  try {
    const REDIS_NODES = process.env.REDIS_NODES
      ? process.env.REDIS_NODES.split(',').map(n => {
          const [host, port] = n.split(':');
          return { host: host.trim(), port: parseInt(port) };
        })
      : null;

    let pubClient, subClient;

    if (REDIS_NODES && REDIS_NODES.length >= 2) {
      // Full Redis Cluster (6-node production setup)
      pubClient = new Redis.Cluster(REDIS_NODES, { redisOptions: { connectTimeout: 5000 } });
      subClient = new Redis.Cluster(REDIS_NODES, { redisOptions: { connectTimeout: 5000 } });
      console.log(`🔴 Redis Cluster ACTIVE: ${REDIS_NODES.length} nodes`);
    } else {
      // Single Redis node (dev / staging)
      const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
      pubClient = new Redis(REDIS_URL, { connectTimeout: 5000, lazyConnect: true });
      subClient = new Redis(REDIS_URL, { connectTimeout: 5000, lazyConnect: true });
      await Promise.all([pubClient.connect(), subClient.connect()]);
      console.log(`🔴 Redis Single-Node ACTIVE: ${REDIS_URL}`);
    }

    io.adapter(createAdapter(pubClient, subClient));
  } catch (err) {
    console.warn('⚠️  Redis unavailable — in-memory fallback (single-process mode):', err.message);
  }
})();

// ✅ 2. GLOBAL CORS & MIDDLEWARE
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use(express.json());

// 🔌 DATABASE CONNECTION
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ems_up';
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log(`🚀 SAMAJWADI CLOUD ACTIVE: ${MONGO_URI.split('/').pop()}`);
    await ensureIndex(); // 📊 Create ES ems_voters index if not present
  })
  .catch(err => console.error("❌ DB Connection Error:", err));

// --- 📡 EMS.UP SECURE REAL-TIME & AUDIT LAYER ---
io.on("connection", (socket) => {
  console.log("⚡ New Node Handshake:", socket.id);

  socket.on("join_protocol", (data) => {
    const { userId, userRole } = data || {}; 
    if (!userId) return;

    const secureRoom = String(userId);
    socket.join(secureRoom); 
    
    if (userRole === "L0") {
      socket.join("AuditRoom");
      console.log(`👁️ GOD MODE: Super Admin ${userId} Monitoring Active.`);
    } else {
      console.log(`👤 Node ${socket.id} locked into Room: ${secureRoom}`);
    }
  });

  socket.on("send_command", async (data) => {
    const { senderId, senderRole, receiverRole, receiverId } = data;

    if (String(receiverRole) === "L2" && String(senderRole) !== "L0") {
      console.error(`🛑 Protocol Breach Attempt on VIP L2 by Node ${senderId}`);
      socket.emit("protocol_error", { message: "Security Violation: VIP Isolation Active" });
      return;
    }

    try {
      // Store message in MongoDB — text already AES-256 encrypted by frontend
      if (Message) await Message.create({ ...data, encrypted: true });
      // Relay ciphertext to recipient and audit room as-is
      socket.to(String(receiverId)).emit("receive_command", data);
      io.to("AuditRoom").emit("audit_stream", { ...data, interceptedAt: new Date().toISOString() });
    } catch (err) {
      console.error("❌ Message Sync Failed:", err);
    }
  });

  // --- 💓 HEARTBEAT — MQTT-style 30 s worker presence (37 lakh scale)
  // Payload: { workerId, lat, lng, role, name, district }
  socket.on("heartbeat", async (data) => {
    if (!data || !data.workerId) return;
    // Sanitise numeric coords to prevent injection via stored string eval
    const lat = parseFloat(data.lat) || null;
    const lng = parseFloat(data.lng) || null;
    await recordHeartbeat(String(data.workerId), {
      lat, lng,
      role:     String(data.role     || '').slice(0, 20),
      name:     String(data.name     || '').slice(0, 80),
      district: String(data.district || '').slice(0, 60),
    });
    // push live-status diff to admin monitors only
    io.to("AuditRoom").emit("node_status_update", {
      workerId: data.workerId, online: true, lat, lng,
      district: data.district, ts: Date.now()
    });
  });

  socket.on("disconnect", (reason) => console.log(`🔌 Node Offline: ${reason}`));
});

// --- 🕒 ✅ STEP 2: OPTIMIZED CHAT HISTORY API ---
app.get('/api/chat/history/:partnerId', async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { myId, role } = req.query;
    
    if (!partnerId || !myId) return res.status(400).json({ success: false, error: "Node IDs required" });

    let query = {};
    if (role === "L0") {
      query = { $or: [ { senderId: partnerId }, { receiverId: partnerId } ] };
    } else {
      query = {
        $or: [
          { senderId: myId, receiverId: partnerId },
          { senderId: partnerId, receiverId: myId }
        ]
      };
    }

    // Return messages as-is — text is AES-256 encrypted; frontend decrypts
    const history = await Message.find(query).sort({ createdAt: 1 }).limit(100).lean();
    res.json({ success: true, data: history });
  } catch (err) { 
    console.error("❌ History Retrieval Error:", err);
    res.status(500).json({ success: false }); 
  }
});

// --- 🛡️ HOUSEHOLD INTELLIGENCE SYNC API ---
app.post('/api/voters/sync-household', async (req, res) => {
  try {
    const { members, householdDetails, metadata } = req.body;
    const familyId = `FAM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const savedData = await Promise.all(members.map(member => {
      const birthDate = new Date(member.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
        age--;
      }
      // AES-256 encrypt sensitive voter fields before storing
      const securePayload = encryptFields(
        { ...member, ...householdDetails, ...metadata },
        ['aadhar', 'voter_id', 'mobile', 'phone']
      );
      return VoterModel.create({
        ...securePayload,
        familyId, age, isEligible: age >= 18, status: 'Verified'
      }).then(saved => { indexVoter(saved); return saved; }); // 🔍 Auto-index in ES
    }));
    res.status(201).json({ success: true, familyId, count: savedData.length });
  } catch (err) { res.status(500).json({ success: false, error: "Sync Protocol Failed" }); }
});

// --- ✅ VOTER SEARCH API (Elasticsearch → MongoDB fallback) ---
// Simple GET with ?search=name  (legacy voter page)
app.get('/api/voters', async (req, res) => {
  try {
    const { search, page = 1 } = req.query;
    const result = await searchVoters({ query: search, page, limit: 20 });
    res.json({ success: true, total: result.total, data: result.data, engine: result.engine, took_ms: result.took_ms });
  } catch (err) { res.status(500).json({ error: 'Voter Database Error' }); }
});

// --- 🔍 ADVANCED INTELLIGENCE SEARCH (ElasticSearch Inverted Index) ---
// POST /api/voters/search  →  "All Yadav voters in Azamgarh aged 18-25 who are Neutral"
app.post('/api/voters/advanced-search', async (req, res) => {
  try {
    const result = await searchVoters(req.body);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Advanced search error:', err);
    res.status(500).json({ success: false, error: 'Search engine error' });
  }
});

// GET version for URL-queryable access
app.get('/api/voters/advanced-search', async (req, res) => {
  try {
    const result = await searchVoters(req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Search engine error' });
  }
});

// --- ✅ BOOTH API (UPDATED FOR ZONE DETECTION) ---
app.get('/api/booths', async (req, res) => {
  try {
    const { district, constituency, search, page = 1 } = req.query;
    const limit = 50; 
    const skip = (Math.max(1, parseInt(page)) - 1) * limit;

    // District name aliases — frontend name → MongoDB districtName
    const DISTRICT_ALIASES = {
      'lakhimpur kheri': 'Kheri',
      'shravasti': 'Shrawasti',
    };
    let query = {};
    if (district) {
      const distKey = district.trim().toLowerCase();
      const distName = DISTRICT_ALIASES[distKey] || district.trim();
      query.districtName = { $regex: new RegExp(distName, 'i') };
    }
    if (constituency && constituency.trim() !== 'All AC Numbers' && constituency.trim() !== '') {
      const conStr = constituency.trim();
      // Extract AC number from format "107 - Mainpuri" — use acNo for exact match (avoids name spelling mismatches)
      const acNoMatch = conStr.match(/^(\d+)\s*[-–]/);
      if (acNoMatch) {
        query.acNo = parseInt(acNoMatch[1]);
      } else {
        // Fallback: name-based search
        query.acName = { $regex: new RegExp(conStr.replace(/\s+/g, '\\s*').replace(/-/g, '[\\s-]*'), 'i') };
      }
    }
    if (search) {
      const sTrim = search.trim();
      query.$or = [
        { partName: { $regex: sTrim, $options: 'i' } }, 
        { address: { $regex: sTrim, $options: 'i' } },
        { partNo: !isNaN(sTrim) ? parseInt(sTrim) : -1 }
      ];
    }

    const results = await Booth.find(query).sort({ partNo: 1 }).skip(skip).limit(limit).lean();
    const total = await Booth.countDocuments(query);
    
    // 🚩 FIX: Zone detection for SearchBooth Frontend
    const detectedZone = results.length > 0 ? results[0].zoneName : "N/A";

    res.json({ success: true, total, data: results, zone: detectedZone });
  } catch (err) { res.status(500).json({ error: "Booth Search Error" }); }
});

// --- � WORKER LIVE PRESENCE API ---
// GET /api/workers/online-status  →  returns all online workers from Redis presence keys
app.get('/api/workers/online-status', async (req, res) => {
  try {
    const workers  = await getOnlineWorkers();
    const byDistrict = await getOnlineCountByDistrict();
    res.json({ success: true, total: workers.length, byDistrict, workers });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Presence store unavailable' });
  }
});

// --- 🗺️  GEO-FENCE API ---
// POST /api/geo/check  { lat, lng, constituency }  → { inside: bool, distanceKm, center }
// Uses Haversine formula against constituency centerpoint derived from Booth collection
app.post('/api/geo/check', async (req, res) => {
  try {
    const { lat, lng, constituency, radiusKm = 25 } = req.body;
    if (!lat || !lng) return res.status(400).json({ success: false, error: 'Coordinates required' });

    // Find booths in the target constituency to derive a centroid
    const booths = await Booth.find(
      constituency ? { acName: { $regex: new RegExp(String(constituency).slice(0, 100), 'i') } } : {},
      'lat lng'
    ).limit(200).lean();

    if (!booths.length) {
      // No booths found → pass through (allow signup; geo-fence advisory only)
      return res.json({ success: true, inside: true, advisory: true, message: 'Constituency not found in DB — advisory mode' });
    }

    // Compute centroid
    const validBooths = booths.filter(b => b.lat && b.lng);
    if (!validBooths.length) {
      return res.json({ success: true, inside: true, advisory: true, message: 'Booth coordinates unavailable — advisory mode' });
    }
    const centerLat = validBooths.reduce((s, b) => s + b.lat, 0) / validBooths.length;
    const centerLng = validBooths.reduce((s, b) => s + b.lng, 0) / validBooths.length;

    // Haversine distance (km)
    const R = 6371;
    const dLat = (lat - centerLat) * Math.PI / 180;
    const dLng = (lng - centerLng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(centerLat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
              Math.sin(dLng / 2) ** 2;
    const distanceKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    res.json({
      success: true,
      inside:      distanceKm <= radiusKm,
      distanceKm:  Math.round(distanceKm * 10) / 10,
      radiusKm,
      center:      { lat: centerLat, lng: centerLng },
      boothCount:  validBooths.length,
    });
  } catch (err) {
    console.error('Geo-fence check error:', err);
    res.status(500).json({ success: false, error: 'Geo-fence engine error' });
  }
});

// --- �🔑 🚀 AUTH & WORKER ROUTES ---
// ✅ LOGIN CONNECTIVITY ADDED
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/workers', require('./routes/workerRoutes'));

// 🆕 NEW EMS PRO 2026 ROUTES (PostgreSQL)
app.use('/api/users', userRoutes);

// Voter routes with data masking
app.post('/api/voters', voterController.createVoter);
app.get('/api/voters/booth/:boothId', voterController.getVotersByBooth);
app.put('/api/voters/:voterId/sentiment', voterController.updateVoterSentiment);
app.get('/api/voters/stats/:boothId', voterController.getVoterStats);
app.post('/api/voters/search', voterController.searchVoters);

// ─── 📹 VIDEO CONFERENCING CLUSTER (SFU) ─────────────────────────────────────
// Attaches /sfu Socket.io namespace for WebRTC signaling.
// Inherits the Redis adapter wired above → multi-process ready.
const attachSFU = require('./lib/sfuSignaling');
attachSFU(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 EMS COMMAND CENTER: http://localhost:${PORT}`));