const express = require('express');
const router = express.Router();
const Worker = require('../models/Worker');
const Application = require('../models/Application');

// --- 🛡️ 1. UPDATED: CHAT DIRECTORY API (Full Intelligence Data) ---
// Frontend URL: http://localhost:5000/api/workers
router.get('/', async (req, res) => {
  try {
    const { myRole, myId } = req.query; 
    
    let query = {};
    if (myRole !== "L0") {
      query = { role: { $ne: "L0" } }; 
    }

    // 🚩 FIX: Saari intelligence fields ko select karein
    const workers = await Worker.find(query)
      .select('fullName role emsId zone district constituency boothNo mobile') 
      .limit(100) 
      .lean();

    // Data ko frontend format mein map karein
    const formattedWorkers = workers.map(w => ({
      id: w._id.toString(),
      name: w.fullName,
      role: w.role || "Worker",
      emsId: w.emsId || "N/A",
      zone: w.zone || "N/A",               // ✅ Zone Sync
      district: w.district || "N/A",       // ✅ District Sync
      constituency: w.constituency || "N/A", // ✅ AC Sync
      boothNo: w.boothNo || "---",         // ✅ Booth Sync
      mobile: w.mobile || "Hidden"
    }));

    res.status(200).json({ success: true, data: formattedWorkers });
  } catch (err) {
    console.error("❌ Chat Directory Error:", err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// --- 📋 2. EXISTING: 7-LEVEL HIERARCHY FILTER API ---
router.get('/list', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const { search, zone, district, constituency, role } = req.query;
    let query = {};
    let andConditions = [];

    if (search) {
      andConditions.push({
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { mobile: { $regex: search, $options: 'i' } },
          { emsId: { $regex: search, $options: 'i' } }
        ]
      });
    }

    if (zone) andConditions.push({ zone });
    if (district) andConditions.push({ district });
    if (constituency) andConditions.push({ constituency });
    if (role) andConditions.push({ role });
    if (req.query.boothNo) andConditions.push({ boothNo: req.query.boothNo });

    if (andConditions.length > 0) query.$and = andConditions;

    const workers = await Worker.find(query).sort({ _id: -1 }).skip(skip).limit(limit);
    const total = await Worker.countDocuments(query);
    
    res.json({
      workers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalCount: total
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- 📝 3. EXISTING: HIRING APPLICATION API ---
router.post('/apply', async (req, res) => {
  try {
    const { primaryMobile, position } = req.body;
    const existing = await Application.findOne({ primaryMobile });
    if (existing) {
      return res.status(400).json({ error: "Is mobile number se pehle hi aavedan kiya ja chuka hai." });
    }
    const currentYear = new Date().getFullYear();
    const count = await Application.countDocuments({ position });
    const serialNo = (count + 1).toString().padStart(3, '0');
    const uniqueRegNo = `EMS/${currentYear}/${position}/${serialNo}`;
    const newApp = new Application({ ...req.body, registrationNo: uniqueRegNo });
    await newApp.save();
    res.status(201).json({ success: true, regNo: uniqueRegNo, message: "Your Registration Submitted Successfully." });
  } catch (err) {
    res.status(500).json({ error: "Server Error: " + err.message });
  }
});

// --- ✅ 4. WORKER APPROVE / ACTIVATE NODE ---
// PUT /api/workers/:id/approve  { action: 'approve' | 'reject' }
router.put('/:id/approve', async (req, res) => {
  try {
    const { action } = req.body;
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, error: 'Invalid action' });
    }
    const newStatus = action === 'approve' ? 'Verified' : 'Rejected';
    const worker = await Worker.findByIdAndUpdate(
      req.params.id,
      { stateStatus: newStatus },
      { new: true, select: 'fullName stateStatus emsId' }
    );
    if (!worker) return res.status(404).json({ success: false, error: 'Worker not found' });
    res.json({ success: true, worker });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;