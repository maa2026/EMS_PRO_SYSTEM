// routes/authRoutes.js
const router = require('express').Router();
const Worker = require('../models/Worker');

const ROLE_LABELS = {
  L0: 'Super Admin',
  L1: 'State Admin',
  L2: 'Zone Admin',
  L3: 'District Admin',
  L4: 'Constituency Prabhari',
  L5: 'Booth President',
  L6: 'Booth Manager',
  L7: 'Jan Sampark Sathi',
  BP: 'Booth President',
  BM: 'Booth Manager',
  JSS: 'Jan Sampark Sathi',
};

router.post('/login', async (req, res) => {
  try {
    const { username, emsId, password } = req.body;
    const loginId = (username || emsId || '').trim();

    if (!loginId || !password) {
      return res.status(400).json({ success: false, message: "ID and Password required" });
    }

    const user = await Worker.findOne({ emsId: loginId });
    if (!user) return res.status(404).json({ success: false, message: "Invalid EMS ID" });

    if (user.password !== password) {
      return res.status(401).json({ success: false, message: "Incorrect Password" });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.fullName,
        emsId: user.emsId,
        role: user.role,
        roleLabel: ROLE_LABELS[user.role] || user.role,
        zone: user.zone || 'N/A',
        district: user.district || 'N/A',
        constituency: user.constituency || 'N/A',
        boothNo: user.boothNo || null,
        stateStatus: user.stateStatus,
      }
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;