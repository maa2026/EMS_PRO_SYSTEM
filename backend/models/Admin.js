const mongoose = require('mongoose');
const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true } // Real world mein ise hash (encrypt) karte hain
});
module.exports = mongoose.model('Admin', AdminSchema);