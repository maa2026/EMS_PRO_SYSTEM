const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  fullName: { type: String, required: true },       // Full Name *
  fatherName: { type: String, required: true },     // Father's Name *
  dob: { type: Date, required: true },              // Date of Birth *
  primaryMobile: { type: String, required: true, unique: true }, // Primary Mobile *
  whatsapp: { type: String },                       // WhatsApp
  addressLine1: { type: String, required: true },   // Address Line 1 *
  tehsil: { type: String, required: true },         // Tehsil *
  policeStation: { type: String },                  // Police Station
  pincode: { type: String, required: true },        // PinCode *
  position: { type: String, enum: ['JSS', 'BM', 'BP'], required: true }, // Position *
  district: { type: String, required: true },       // District *
  constituency: { type: String, required: true },   // Constituency *
  boothNo: { type: String, required: true },        // Booth No *
  voterId: { type: String, required: true },        // Voter ID (EPIC) *
  education: { type: String },                      // Education
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Application', applicationSchema);