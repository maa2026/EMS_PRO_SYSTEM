/**
 * EMS PRO 2026 — Elasticsearch Index Management for 25 Crore Voter Database
 *
 * Index: ems_voters
 * Strategy:
 *   - Inverted index on name (Hindi + English edge-n-gram for partial match)
 *   - keyword fields on low-cardinality filters (district, subCaste, sentiment, category)
 *   - integer range on age
 *   - Sharding: 5 primary shards × 1 replica = 10 total (handles ~5 Crore / shard)
 */
const { getClient } = require('./elasticClient');

const INDEX = 'ems_voters';

// ─── Index Mapping ───────────────────────────────────────────────────────────
const MAPPING = {
  settings: {
    number_of_shards:   5,   // 5 × 5 Crore = 25 Crore capacity
    number_of_replicas: 1,   // 1 replica per shard for HA
    analysis: {
      analyzer: {
        // Edge n-gram for autocomplete & partial name search
        voter_name_analyzer: {
          type:      'custom',
          tokenizer: 'voter_name_tokenizer',
          filter:    ['lowercase', 'asciifolding'],
        },
        // Standard analyzer for full-text search
        voter_search_analyzer: {
          type:      'custom',
          tokenizer: 'standard',
          filter:    ['lowercase', 'asciifolding'],
        },
      },
      tokenizer: {
        voter_name_tokenizer: {
          type:       'edge_ngram',
          min_gram:   2,
          max_gram:   15,
          token_chars: ['letter', 'digit'],
        },
      },
    },
  },
  mappings: {
    properties: {
      // ── Identity ──
      mongo_id:   { type: 'keyword' },
      voter_id:   { type: 'keyword' },         // Exact match only
      aadhar:     { type: 'keyword', index: false }, // stored, not searchable

      // ── Name (inverted index + edge n-gram for autocomplete) ──
      name: {
        type:            'text',
        analyzer:        'voter_name_analyzer',
        search_analyzer: 'voter_search_analyzer',
        fields: {
          raw: { type: 'keyword' }, // exact sort
        },
      },

      // ── Demographics ──
      age:        { type: 'integer' },
      dob:        { type: 'date', format: 'yyyy-MM-dd||strict_date_optional_time' },
      gender:     { type: 'keyword' },
      category:   { type: 'keyword' },   // Gen, OBC, SC, ST
      sub_caste:  { type: 'keyword' },   // Yadav, Kurmi, Brahmin …
      is_eligible:{ type: 'boolean' },

      // ── Location hierarchy ──
      zone_id:    { type: 'keyword' },
      zone:       { type: 'keyword' },
      district_id:{ type: 'keyword' },
      district:   { type: 'keyword' },
      ac_id:      { type: 'keyword' },
      ac_name:    { type: 'keyword' },
      booth_id:   { type: 'keyword' },
      booth_no:   { type: 'keyword' },
      address:    { type: 'text' },

      // ── Strategic Intelligence ──
      sentiment:  { type: 'keyword' },   // Pro, Anti, Neutral, Swing
      employment: { type: 'keyword' },
      grievances: { type: 'text' },
      family_id:  { type: 'keyword' },
      sathi_id:   { type: 'keyword' },
      mobile:     { type: 'keyword', index: false }, // stored, not searchable

      // ── Admin ──
      status:     { type: 'keyword' },
      created_at: { type: 'date' },
    },
  },
};

// ─── Ensure index exists (idempotent) ────────────────────────────────────────
async function ensureIndex() {
  const es = getClient();
  try {
    const { body: exists } = await es.indices.exists({ index: INDEX });
    if (!exists) {
      await es.indices.create({ index: INDEX, body: MAPPING });
      console.log(`✅ ES Index "${INDEX}" created (5 shards × 1 replica)`);
    } else {
      console.log(`📦 ES Index "${INDEX}" already exists`);
    }
  } catch (err) {
    console.warn('⚠️  Elasticsearch not available — search falls back to MongoDB:', err.message);
  }
}

// ─── Index a single voter document ───────────────────────────────────────────
async function indexVoter(voter) {
  const es = getClient();
  const doc = mongoToESDoc(voter);
  try {
    await es.index({ index: INDEX, id: doc.mongo_id, body: doc, refresh: 'false' });
  } catch (err) {
    console.error('ES index error:', err.meta?.body?.error || err.message);
  }
}

// ─── Index many voters (bulk API — 2500 docs/batch for memory efficiency) ────
async function bulkIndexVoters(voters) {
  const es = getClient();
  const BATCH = 2500;
  let total = 0;

  for (let i = 0; i < voters.length; i += BATCH) {
    const batch = voters.slice(i, i + BATCH);
    const body  = batch.flatMap(v => [
      { index: { _index: INDEX, _id: v._id?.toString() || v.mongo_id } },
      mongoToESDoc(v),
    ]);

    const { body: res } = await es.bulk({ body, refresh: 'false' });
    if (res.errors) {
      const failed = res.items.filter(i => i.index?.error).length;
      console.warn(`⚠️  Bulk batch had ${failed} errors`);
    }
    total += batch.length;
    process.stdout.write(`\r📊 Indexed ${total.toLocaleString()} / ${voters.length.toLocaleString()}`);
  }
  console.log('\n✅ Bulk indexing complete');
}

// ─── Delete a voter from index ────────────────────────────────────────────────
async function deleteVoterFromIndex(mongoId) {
  const es = getClient();
  try {
    await es.delete({ index: INDEX, id: mongoId, ignore: [404] });
  } catch (_) {}
}

// ─── Map Mongoose/MongoDB document → ES document ─────────────────────────────
function mongoToESDoc(v) {
  return {
    mongo_id:   v._id?.toString() || v.mongo_id,
    voter_id:   v.voter_id  || v.voterId   || '',
    name:       v.name      || '',
    age:        v.age       || null,
    dob:        v.dob       ? new Date(v.dob).toISOString().split('T')[0] : null,
    gender:     v.gender    || '',
    category:   v.category  || '',
    sub_caste:  v.subCaste  || v.sub_caste || '',
    is_eligible:!!v.isEligible,
    sentiment:  v.sentiment  || 'Neutral',
    employment: v.employment || '',
    grievances: v.grievances || '',
    zone_id:    v.zoneId    || v.zone_id   || '',
    zone:       v.zone      || '',
    district_id:v.districtId|| v.district_id || '',
    district:   v.district  || '',
    ac_id:      v.acId      || v.ac_id     || '',
    ac_name:    v.acName    || v.ac_name   || '',
    booth_id:   v.boothId   || v.booth_id  || '',
    booth_no:   v.boothNo   || v.booth_no  || '',
    address:    v.address   || '',
    family_id:  v.familyId  || v.family_id || '',
    sathi_id:   v.sathiId   || v.sathi_id  || '',
    status:     v.status    || 'Pending',
    created_at: v.createdAt ? new Date(v.createdAt).toISOString() : new Date().toISOString(),
  };
}

module.exports = { INDEX, ensureIndex, indexVoter, bulkIndexVoters, deleteVoterFromIndex, mongoToESDoc };
