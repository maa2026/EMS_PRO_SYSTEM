const express = require('express');
const router = express.Router();
const Worker = require('../models/Worker');
const Application = require('../models/Application');

// --- 1. EXISTING: 7-LEVEL HIERARCHY FILTER API ---
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

// --- 2. UPDATED: HIRING APPLICATION API WITH UNIQUE REGISTRATION ID ---
router.post('/apply', async (req, res) => {
  try {
    const { primaryMobile, position } = req.body;

    // 1. Mobile number check (Duplicate check)
    const existing = await Application.findOne({ primaryMobile });
    if (existing) {
      return res.status(400).json({ error: "Is mobile number se pehle hi aavedan kiya ja chuka hai." });
    }

    // 2. Unique Registration ID Logic (Sequential per Position)
    // EMS/YEAR/POSITION/SERIAL_NO
    const currentYear = new Date().getFullYear();
    const count = await Application.countDocuments({ position });
    const serialNo = (count + 1).toString().padStart(3, '0'); // 001, 002...
    const uniqueRegNo = `EMS/${currentYear}/${position}/${serialNo}`;

    // 3. New Application create karein with Unique ID
    const newApp = new Application({
      ...req.body,
      registrationNo: uniqueRegNo
    });

    await newApp.save();

    // 4. Response jo aapne manga tha
    res.status(201).json({ 
      success: true, 
      regNo: uniqueRegNo,
      message: "Your Registration Submitted Successfully. Process for Verification and Response within 72 hours." 
    });

  } catch (err) {
    console.error("❌ Hiring Error:", err);
    res.status(500).json({ error: "Server Error: " + err.message });
  }
});

module.exports = router;