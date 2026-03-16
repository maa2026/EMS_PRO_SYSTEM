// routes/authRoutes.js
const router = require('express').Router();
const Worker = require('../models/Worker'); 

router.post('/login', async (req, res) => {
  try {
    // 🚩 FIX: Frontend 'username' bhej raha hai, isliye dono ko handle karein
    const { username, emsId, password } = req.body;
    const loginId = username || emsId;

    if (!loginId || !password) {
      return res.status(400).json({ success: false, message: "ID and Password required" });
    }

    // 1. User ko Database mein dhoondo
    const user = await Worker.findOne({ emsId: loginId });
    if (!user) return res.status(404).json({ success: false, message: "Invalid EMS ID" });

    // 2. Password Check
    if (user.password !== password) { 
       return res.status(401).json({ success: false, message: "Incorrect Password" }); 
    }

    // 🚩 3. Success Response with Full Identity for Chat/Dossier
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.fullName,
        role: user.role, // L0, L4, L5, L6 etc.
        zone: user.zoneName || user.zone || "N/A", // SearchBooth sync ke liye
        district: user.districtName || user.district || "N/A", // Dossier sync
        ac: user.acName || user.constituency || "N/A" // Hierarchy mapping
      }
    });
  } catch (err) { 
    console.error("Login Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" }); 
  }
});

module.exports = router;