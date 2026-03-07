const mongoose = require('mongoose');

const VoterSchema = new mongoose.Schema({
  // --- Hierarchy Mapping ---
  familyId: { type: String, required: true }, // Household ID
  boothId: { type: String, required: true }, 
  acId: { type: String, required: true },
  districtId: { type: String, required: true },
  zoneId: { type: String, required: true }, // Auto-filled from District
  sathiId: { type: String, required: true }, // Collected by

  // --- Member Details ---
  name: { type: String, required: true, uppercase: true },
  dob: { type: Date, required: true },
  age: { type: Number, required: true },
  isEligible: { type: Boolean, default: false }, // True if Age >= 18
  
  // --- Identity & Contact ---
  voterId: { type: String, uppercase: true }, // Only for eligible
  aadhar: { type: String },
  mobile: { type: String },
  
  // --- Strategic Intelligence ---
  category: { type: String, enum: ['Gen', 'OBC', 'SC', 'ST'] },
  subCaste: { type: String },
  employment: { type: String },
  grievances: { type: String }, // Mudde
  
  // --- Admin Status ---
  status: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Voter', VoterSchema);