const express = require('express');
const router = express.Router();
const Voter = require('../models/Voter');

// API to save Family Data and Reflect it
router.post('/sync-household', async (req, res) => {
  try {
    const { members, householdData, metadata } = req.body;
    const familyId = `FAM-${Date.now()}`;

    // Bulk Save Logic: Sabhi family members ko ek sath save karna
    const preparedData = members.map(member => ({
      ...member,
      ...householdData,
      ...metadata,
      familyId
    }));

    const result = await Voter.insertMany(preparedData);

    res.status(201).json({ 
      success: true, 
      message: "Data Reflected on Command Center", 
      count: result.length 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;