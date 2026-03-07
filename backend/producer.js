const express = require('express');
const Redis = require('ioredis');
const app = express();

app.use(express.json());

// Redis connection (Windows par redis-server.exe chalu hona chahiye)
const redis = new Redis(); 

app.post('/submit-entry', async (req, res) => {
    try {
        const voterData = req.body;
        
        // Data ko 'voter_entries' queue mein push karna
        await redis.lpush('voter_entries', JSON.stringify(voterData));
        
        res.status(202).json({ 
            success: true, 
            message: "Data queue mein bhej diya gaya hai!" 
        });
    } catch (error) {
        console.error("Redis Error:", error);
        res.status(500).json({ success: false, error: "Queue system offline hai" });
    }
});

const PORT = 3001; // Aapka main server 3000 par ho sakta hai, isliye ise 3001 rakhte hain
app.listen(PORT, () => console.log(`🚀 Producer Server running on port ${PORT}`));