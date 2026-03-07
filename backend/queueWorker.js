const Redis = require('ioredis');
const mongoose = require('mongoose');
require('dotenv').config(); // .env file se MONGO_URI lene ke liye

// Voter Model import karein (Path confirm kar lein)
const Voter = require('./models/Worker'); 

const redis = new Redis();

// 1. Database Connection (Ye Worker ke liye zaruri hai)
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ems_database')
    .then(() => console.log("✅ MongoDB Connected: Worker DB ke liye taiyar hai"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

const BATCH_SIZE = 500; 

async function startWorker() {
    console.log("👷 EMS Bulk Worker chalu hai... Data ka intezar...");
    let batch = [];

    while (true) {
        const data = await redis.rpop('voter_entries');

        if (data) {
            try {
                batch.push(JSON.parse(data));

                if (batch.length >= BATCH_SIZE) {
                    // Bulk Insert for 38 lakh performance
                    await Voter.insertMany(batch, { ordered: false });
                    console.log(`🚀 Bulk Success: ${batch.length} records save ho gaye!`);
                    batch = []; 
                }
            } catch (err) {
                console.error("❌ Bulk Save Error:", err.message);
                batch = []; 
            }
        } else {
            // Agar queue khali hai par batch mein data bacha hai
            if (batch.length > 0) {
                try {
                    await Voter.insertMany(batch, { ordered: false });
                    console.log(`✅ Final Batch: ${batch.length} records save ho gaye.`);
                    batch = [];
                } catch (err) {
                    console.error("❌ Final Batch Error:", err.message);
                    batch = [];
                }
            }
            // CPU relax karne ke liye 1 second wait
            await new Promise(res => setTimeout(res, 1000));
        }
    }
}

startWorker();