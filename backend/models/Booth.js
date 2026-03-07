const mongoose = require('mongoose');

const boothSchema = new mongoose.Schema({
  districtName: { type: String, index: true },
  zoneName: String,
  acNo: Number,
  acName: { type: String, index: true },
  partNo: Number,
  partName: String,
  address: String
});

module.exports = mongoose.model('Booth', boothSchema);