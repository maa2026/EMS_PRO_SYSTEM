const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  // Personal
  fullName:       { type: String, required: true },
  fatherName:     { type: String, required: true },
  dob:            { type: Date,   required: true },
  primaryMobile:  { type: String, required: true, unique: true },
  whatsapp:       { type: String },

  // Residential
  addressLine1:   { type: String, required: true },
  block:          { type: String },
  tehsil:         { type: String, required: true },
  policeStation:  { type: String },
  pincode:        { type: String, required: true },

  // Organization & Location
  position:       { type: String, enum: ['JSS', 'BM', 'BP'], required: true },
  district:       { type: String, required: true },
  constituency:   { type: String, required: true },
  boothNo:        { type: String, required: true },

  // Identity & Education
  voterId:        { type: String, required: true },
  aadhar:         { type: String, required: true },
  education:      { type: String, enum: ['5th','8th','10th','12th','ITI','Graduate','PostGraduate','BEd','BCA/MCA','BTech','LLB','MBBS','PhD','Other'] },

  // Social Media
  socialMedia: {
    facebook:   { type: String },
    youtube:    { type: String },
    instagram:  { type: String },
    linkedin:   { type: String },
    snapchat:   { type: String },
    imessage:   { type: String },
    facetime:   { type: String }
  },

  // System
  registrationNo: { type: String },
  status:         { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  submittedAt:    { type: Date, default: Date.now }
});

module.exports = mongoose.model('Application', applicationSchema);