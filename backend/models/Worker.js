const mongoose = require('mongoose');

const WorkerSchema = new mongoose.Schema({
  // Personal
  fullName:      { type: String, required: true },
  fatherName:    { type: String },
  dob:           { type: Date },
  gender:        String,
  religion:      String,
  category:      String,
  caste:         { type: String, index: true },
  subCaste:      String,

  // Contact
  mobile:        { type: String, required: true, unique: true, index: true },
  whatsapp:      String,
  email:         String,

  // Residential
  address:       String,
  block:         String,
  tehsil:        String,
  policeStation: String,
  pincode:       String,

  // Organization & Location
  zone:          { type: String, index: true },
  district:      { type: String, required: true, index: true },
  constituency:  String,
  boothNo:       Number,
  // L0=SuperAdmin, L1=State, L2=Zone, L3=District, L4=Constituency, L5=BP, L6=BM, L7=JSS
  role:          { type: String, enum: ['L0','L1','L2','L3','L4','L5','L6','L7','BP','BM','JSS'], index: true },
  password:      { type: String, default: null },

  // Identity & Education
  voterId:       String,
  aadhar:        String,
  education:     { type: String, enum: ['5th','8th','10th','12th','ITI','Graduate','PostGraduate','BEd','BCA/MCA','BTech','LLB','MBBS','PhD','Other'] },

  // Social Media
  socialMedia: {
    facebook:   String,
    youtube:    String,
    instagram:  String,
    linkedin:   String,
    snapchat:   String,
    imessage:   String,
    facetime:   String
  },

  // Biometric (WebAuthn FIDO2 binding — device-level signup lock)
  biometric: {
    credentialId: { type: String, default: null },   // base64url WebAuthn credential ID
    publicKeyCbor:{ type: String, default: null },   // base64 CBOR-encoded public key
    deviceInfo:   { type: String, default: null },   // User-Agent snapshot at bind time
    boundAt:      { type: Date,   default: null },
  },

  // System
  stateStatus:   { type: String, default: 'Pending' },
  emsId:         { type: String, default: null, unique: true, sparse: true }
});

module.exports = mongoose.model('Worker', WorkerSchema);