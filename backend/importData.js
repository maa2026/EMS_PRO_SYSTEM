const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const Booth = require('./models/Booth');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ems_up';

mongoose.connect(MONGO_URI).then(async () => {
  console.log("🚀 Connected to DB. Checking CSV...");
  
  // Purana empty data saaf karein
  await Booth.deleteMany({});
  
  const results = [];
  let rowCount = 0;

  fs.createReadStream('master_data_utf8.csv')
    .pipe(csv())
    .on('data', (data) => {
      rowCount++;
      // Pehli row print karke check karein (Sirf debug ke liye)
      if (rowCount === 1) console.log("🔍 First Row Found:", data);

      results.push({
        districtName: data.DISTRICT_NAME_EN,
        zoneName: data.Zone_Name,
        acNo: parseInt(data.AC_NO),
        acName: data.AC_NAME_EN,
        partNo: parseInt(data.PART_NO),
        partName: data.PART_NAME,
        address: data.POLLING_STATION_ADDRESS
      });
    })
    .on('end', async () => {
      console.log(`📊 CSV Read Finished. Total rows in CSV: ${rowCount}`);
      
      if (results.length === 0) {
        console.error("❌ ERROR: CSV se koi data nahi mila! Check karein ki headers sahi hain ya nahi.");
        process.exit(1);
      }

      console.log(`⏳ Inserting ${results.length} records into MongoDB...`);
      try {
        // Data ko batches mein insert karein (fast)
        await Booth.insertMany(results);
        console.log("✅ SUCCESS: Saara data MongoDB mein pahuch gaya!");
        process.exit();
      } catch (err) {
        console.error("❌ MongoDB Insert Error:", err.message);
        process.exit(1);
      }
    })
    .on('error', (err) => {
      console.error("❌ CSV Read Error:", err.message);
    });
});