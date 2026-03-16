const express = require('express');
const router = express.Router();
const voterController = require('../controllers/voterController');
const auth = require('../middleware/auth');

// API to save Family Data and Reflect it
router.post('/sync-household', auth, async (req, res) => {
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

// Smart Search and Filter Voters
router.post('/smart-search', voterController.smartSearchVoters);

// Get filter options for smart search
router.get('/filter-options', voterController.getFilterOptions);

// Legacy search (keep for backward compatibility)
router.post('/search', voterController.searchVoters);

// Get voters by booth
router.get('/booth/:boothId', voterController.getVotersByBooth);

// Update voter sentiment
router.put('/:voterId/sentiment', voterController.updateVoterSentiment);

// Get voter statistics
router.get('/stats/:boothId', voterController.getVoterStats);

// Create new voter
router.post('/', voterController.createVoter);

module.exports = router;