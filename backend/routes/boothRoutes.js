const express = require('express');
const router = express.Router();
const Booth = require('../models/Booth'); // Model ko import kiya

router.get('/', async (req, res) => {
  try {
    const { district, constituency, search, page = 1 } = req.query;
    const limit = 50;
    const skip = (page - 1) * limit;

    let query = {};
    if (district) query.districtName = district; 
    if (constituency) query.acName = constituency; 
    
    if (search) {
      query.$or = [
        { partName: { $regex: search, $options: 'i' } },
        { partNo: isNaN(search) ? -1 : Number(search) }
      ];
    }

    const booths = await Booth.find(query)
      .skip(skip)
      .limit(limit)
      .lean();

    // 🚩 Frontend mapping yahan hogi
    const formattedData = booths.map(b => ({
      ...b,
      zone: b.zoneName, 
      district: b.districtName,
      constituency: b.acName
    }));

    const total = await Booth.countDocuments(query);
    const detectedZone = formattedData.length > 0 ? formattedData[0].zone : "N/A";

    res.json({ 
      success: true, 
      data: formattedData, 
      total,
      zone: detectedZone 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;