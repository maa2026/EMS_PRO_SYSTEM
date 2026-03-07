const mongoose = require('mongoose');

const WorkerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  gender: String,
  religion: String,
  category: String,
  caste: { type: String, index: true }, // Index added
  subCaste: String,
  education: String,
  mobile: { type: String, required: true, unique: true, index: true }, // Unique Index
  email: String,
  address: String,
  district: { type: String, required: true, index: true }, // Index added
  constituency: String,
  boothNo: Number,
  role: { type: String, enum: ['BP', 'BM', 'JSS'], index: true },
  stateStatus: { type: String, default: 'Pending' },
  emsId: { type: String, default: null, unique: true, sparse: true }
});

module.exports = mongoose.model('Worker', WorkerSchema);