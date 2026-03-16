const mongoose = require('mongoose');
const Worker = require('./models/Worker'); // Model path check karein

mongoose.connect('mongodb://127.0.0.1:27017/ems_up')
  .then(async () => {
    console.log("🛰️ Seeding EMS Nodes...");
    
    // Purana data saaf karein (Optional)
    await Worker.deleteMany({});

    const users = [
      // 🛡️ L0: Super Admin
      { emsId: "ADMIN001", password: "123", fullName: "Ram Lakhan", role: "L0", zoneName: "State HQ", districtName: "Lucknow" },
      
      // 🛰️ L4: Zone Admin (Example)
      { emsId: "ZONE01", password: "123", fullName: "Zone Head Braj", role: "L4", zoneName: "Braj Zone", districtName: "Agra" },
      
      // 🏛️ L5: District Admin (Example)
      { emsId: "DIST44", password: "123", fullName: "District Head Mainpuri", role: "L5", zoneName: "Upper Ganga–Kali Belt", districtName: "Mainpuri" },
      
      // 🗳️ L6: Constituency Admin (Example)
      { emsId: "AC101", password: "123", fullName: "Karhal Node", role: "L6", zoneName: "Upper Ganga–Kali Belt", districtName: "Mainpuri", acName: "Karhal" },
      
      // 👤 L7: Jan Sampark Sathi
      { emsId: "JS001", password: "123", fullName: "Yogesh Yadav", role: "L7", zoneName: "Upper Ganga–Kali Belt", districtName: "Mainpuri", acName: "Karhal", mobile: "9876543210" }
    ];

    await Worker.insertMany(users);
    console.log("✅ 517+ Nodes Protocol Activated! (Sample Data Loaded)");
    process.exit();
  })
  .catch(err => console.log(err));