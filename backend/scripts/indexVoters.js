/**
 * EMS PRO 2026 — Bulk Voter Indexer
 * Reads all voters from MongoDB → pushes to Elasticsearch in 2500-doc batches
 *
 * Usage:
 *   node scripts/indexVoters.js                  # index all voters
 *   node scripts/indexVoters.js --drop           # drop + rebuild index first
 *   node scripts/indexVoters.js --limit=100000   # test with 1 lakh docs
 *
 * Estimated time on 25 Crore records: ~4-6 hours on a single ES data node
 * (batch size can be increased on high-memory machines: change BATCH in voterIndex.js)
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const VoterModel       = require('../models/VoterModel');
const { getClient }    = require('../lib/elasticClient');
const { INDEX, ensureIndex, bulkIndexVoters } = require('../lib/voterIndex');

const args   = process.argv.slice(2);
const DROP   = args.includes('--drop');
const LIMIT  = (() => { const a = args.find(a => a.startsWith('--limit=')); return a ? parseInt(a.split('=')[1]) : 0; })();
const CHUNK  = 50000; // stream 50k at a time from MongoDB to avoid OOM

async function run() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ems_up';
  console.log('🔌 Connecting to MongoDB…');
  await mongoose.connect(MONGO_URI);
  console.log('✅ MongoDB connected');

  const es = getClient();

  if (DROP) {
    try {
      await es.indices.delete({ index: INDEX, ignore_unavailable: true });
      console.log(`🗑️  Dropped index "${INDEX}"`);
    } catch (_) {}
  }
  await ensureIndex();

  const totalDocs = LIMIT || await VoterModel.countDocuments({});
  console.log(`📊 Total voters to index: ${totalDocs.toLocaleString()}`);

  let indexed = 0;
  let skip    = 0;

  while (indexed < totalDocs) {
    const batchLimit = Math.min(CHUNK, totalDocs - indexed);
    const batch = await VoterModel.find({}).skip(skip).limit(batchLimit).lean();
    if (!batch.length) break;

    await bulkIndexVoters(batch);
    indexed += batch.length;
    skip    += batch.length;
    console.log(`✅ Progress: ${indexed.toLocaleString()} / ${totalDocs.toLocaleString()} (${((indexed/totalDocs)*100).toFixed(1)}%)`);
  }

  // Force refresh so documents are immediately searchable
  await es.indices.refresh({ index: INDEX });
  console.log('\n🎯 Indexing complete! ES index is now LIVE.');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Indexing failed:', err);
  process.exit(1);
});
