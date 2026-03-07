const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Booth = require('./models/Booth'); 
const Worker = require('./models/Worker'); // Master Worker/Voter List
// Naya Model Import Karein (Family Data ke liye)
const VoterModel = require('./models/VoterModel'); 

require('dotenv').config();

const app = express();

// ✅ CORS SETTINGS
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST']
}));

app.use(express.json());

// DB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ems_up';
mongoose.connect(MONGO_URI)
  .then(() => console.log(`🚀 SAMAJWADI CLOUD ACTIVE: ${MONGO_URI.split('/').pop()}`))
  .catch(err => console.error("❌ DB Connection Error:", err));

// --- 🛡️ NEW: HOUSEHOLD INTELLIGENCE SYNC API ---
// Ye API Sathi ke form se data legi aur direct reflect karegi
app.post('/api/voters/sync-household', async (req, res) => {
  try {
    const { members, householdDetails, metadata } = req.body;
    
    // Unique Family ID for tracking the whole house
    const familyId = `FAM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Har member ko loop karke save karna
    const savedData = await Promise.all(members.map(member => {
      // Age calculation server-side safety ke liye
      const birthDate = new Date(member.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
        age--;
      }

      return VoterModel.create({
        ...member,
        ...householdDetails,
        ...metadata,
        familyId,
        age: age,
        isEligible: age >= 18,
        status: 'Verified' // Direct Reflection logic
      });
    }));

    console.log(`✅ Family Synced: ${familyId} | Members: ${savedData.length}`);
    
    res.status(201).json({
      success: true,
      familyId,
      message: "Data Reflected on Command Center",
      count: savedData.length
    });
  } catch (err) {
    console.error("❌ Sync Error:", err);
    res.status(500).json({ success: false, error: "Sync Protocol Failed" });
  }
});

// --- ✅ VOTER SEARCH API (Master Data 25Cr) ---
app.get('/api/voters', async (req, res) => {
  try {
    const { search, page = 1 } = req.query;
    const limit = 20; 
    const pageNum = Math.max(1, parseInt(page));
    const skip = (pageNum - 1) * limit;

    let query = {};
    if (search && search.trim() !== "") {
      const sTrim = search.trim();
      if (!isNaN(sTrim) && sTrim.length > 3) {
        query.voter_id = sTrim;
      } else {
        query.name = { $regex: new RegExp('.*' + sTrim + '.*', 'i') };
      }
    }

    // Pehle naya collected data check karein, fir master list
    const results = await VoterModel.find(query)
      .skip(skip)
      .limit(limit)
      .lean();

    const totalCount = await VoterModel.countDocuments(query);

    res.json({
      success: true,
      total: totalCount,
      data: results
    });
  } catch (err) {
    res.status(500).json({ error: "Voter Database Error" });
  }
});

// --- ✅ BOOTH API ---
app.get('/api/booths', async (req, res) => {
  try {
    const { district, constituency, search, page = 1 } = req.query;
    const limit = 50; 
    const pageNum = Math.max(1, parseInt(page));
    const skip = (pageNum - 1) * limit;

    let query = {};
    let realZone = "Not Found";

    if (district && district.trim() !== "") {
      const dTrim = district.trim();
      query.districtName = { $regex: new RegExp('.*' + dTrim + '.*', 'i') };
      const sampleBooth = await Booth.findOne({ districtName: query.districtName });
      if (sampleBooth) realZone = sampleBooth.zoneName;
    }
    
    if (constituency && constituency.trim() !== "") {
      let conName = constituency.trim();
      if (conName.includes(' - ')) conName = conName.split(' - ')[1].trim();
      query.acName = { $regex: new RegExp('.*' + conName + '.*', 'i') };
    }

    if (search && search.trim() !== "") {
      const sTrim = search.trim();
      const isNumber = !isNaN(sTrim);
      query.$or = [
        { partName: { $regex: sTrim, $options: 'i' } }, 
        { address: { $regex: sTrim, $options: 'i' } },
        { partNo: isNumber ? parseInt(sTrim) : -1 }
      ];
    }

    const results = await Booth.find(query).sort({ partNo: 1 }).skip(skip).limit(limit).lean();
    const totalCount = await Booth.countDocuments(query);

    res.json({ zone: realZone, total: totalCount, data: results });
  } catch (err) {
    res.status(500).json({ error: "Booth Search Error" });
  }
});

// WORKER ROUTES
app.use('/api/workers', require('./routes/workerRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 EMS COMMAND CENTER: http://localhost:${PORT}`);
});