const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// 📦 EXISTING MODELS IMPORT (MongoDB)
const Booth = require('./models/Booth');
const Worker = require('./models/Worker');
const VoterModel = require('./models/VoterModel');
const Message = require('./models/Message');

// 🆕 NEW CONTROLLERS & ROUTES (PostgreSQL)
const userRoutes = require('./routes/userRoutes');
const voterController = require('./controllers/voterController');
const dataMasking = require('./middleware/dataMasking');

require('dotenv').config();

const app = express();
const server = http.createServer(app);

// ✅ 1. SECURE SOCKET.IO CONFIGURATION (Admin Ram Lakhan Standard)
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST"],
    credentials: true
  },
  allowEIO3: true,
  transports: ['websocket', 'polling']
});

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
  .then(() => console.log(`🚀 SAMAJWADI CLOUD ACTIVE: ${MONGO_URI.split('/').pop()}`))
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
      if (Message) await Message.create(data); 
      socket.to(String(receiverId)).emit("receive_command", data); 
      io.to("AuditRoom").emit("audit_stream", { ...data, interceptedAt: new Date().toISOString() }); 
    } catch (err) {
      console.error("❌ Message Sync Failed:", err);
    }
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
      return VoterModel.create({
        ...member, ...householdDetails, ...metadata,
        familyId, age, isEligible: age >= 18, status: 'Verified'
      });
    }));
    res.status(201).json({ success: true, familyId, count: savedData.length });
  } catch (err) { res.status(500).json({ success: false, error: "Sync Protocol Failed" }); }
});

// --- ✅ VOTER SEARCH API ---
app.get('/api/voters', async (req, res) => {
  try {
    const { search, page = 1 } = req.query;
    const limit = 20; 
    const skip = (Math.max(1, parseInt(page)) - 1) * limit;

    let query = {};
    if (search && search.trim() !== "") {
      const sTrim = search.trim();
      if (!isNaN(sTrim) && sTrim.length > 3) query.voter_id = sTrim;
      else query.name = { $regex: new RegExp('.*' + sTrim + '.*', 'i') };
    }

    const results = await VoterModel.find(query).skip(skip).limit(limit).lean();
    const total = await VoterModel.countDocuments(query);
    res.json({ success: true, total, data: results });
  } catch (err) { res.status(500).json({ error: "Voter Database Error" }); }
});

// --- ✅ BOOTH API (UPDATED FOR ZONE DETECTION) ---
app.get('/api/booths', async (req, res) => {
  try {
    const { district, constituency, search, page = 1 } = req.query;
    const limit = 50; 
    const skip = (Math.max(1, parseInt(page)) - 1) * limit;

    let query = {};
    if (district) query.districtName = { $regex: new RegExp(district.trim(), 'i') };
    if (constituency) {
      let conName = constituency.trim();
      if (conName.includes(' - ')) conName = conName.split(' - ')[1].trim();
      query.acName = { $regex: new RegExp(conName, 'i') };
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

// --- 🔑 🚀 AUTH & WORKER ROUTES ---
// ✅ LOGIN CONNECTIVITY ADDED
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/workers', require('./routes/workerRoutes'));

// 🆕 NEW EMS PRO 2026 ROUTES (PostgreSQL)
app.use('/api/users', userRoutes);

// Voter routes with data masking
app.use('/api/voters', dataMasking.maskSensitiveData);
app.post('/api/voters', voterController.createVoter);
app.get('/api/voters/booth/:boothId', voterController.getVotersByBooth);
app.put('/api/voters/:voterId/sentiment', voterController.updateVoterSentiment);
app.get('/api/voters/stats/:boothId', voterController.getVoterStats);
app.post('/api/voters/search', voterController.searchVoters);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 EMS COMMAND CENTER: http://localhost:${PORT}`));