/**
 * EMS PRO 2026 — Voter Big-Data Search Engine (Elasticsearch + MongoDB fallback)
 *
 * Handles "advanced intelligence queries" like:
 *   "All Yadav voters in Azamgarh aged 18-25 who are Neutral"
 *
 * Strategy:
 *   1. Build an ES bool query from filter params
 *   2. Execute against ems_voters index (inverted index → ~0.4 s on 25 Cr records)
 *   3. If ES is unavailable, fall back to MongoDB (slower but safe)
 *
 * Supported filters:
 *   name, district, ac_name, booth_id, category, sub_caste,
 *   sentiment, employment, status, is_eligible,
 *   age_min, age_max, gender, query (free-text)
 */
const { getClient } = require('./elasticClient');
const { INDEX }     = require('./voterIndex');
const VoterModel    = require('../models/VoterModel');

const DEFAULT_PAGE  = 1;
const DEFAULT_LIMIT = 50;

/**
 * Main search function.
 * @param {object} params  - filter params from request
 * @returns {{ total, data, engine, took_ms }}
 */
async function searchVoters(params = {}) {
  const {
    query,          // free-text (searches name + address + grievances)
    name,           // partial name
    district,       // exact keyword filter
    ac_name,        // exact keyword filter
    booth_id,       // exact keyword filter
    zone,           // exact keyword filter
    category,       // Gen | OBC | SC | ST
    sub_caste,      // Yadav | Kurmi | Brahmin …
    sentiment,      // Pro | Anti | Neutral | Swing
    employment,
    status,
    gender,
    is_eligible,
    age_min,
    age_max,
    page  = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
  } = params;

  const from = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
  const size  = Math.min(parseInt(limit), 200); // cap at 200 per page

  try {
    const esResult = await esSearch({
      query, name, district, ac_name, booth_id, zone,
      category, sub_caste, sentiment, employment, status,
      gender, is_eligible, age_min, age_max,
    }, from, size);
    return esResult;
  } catch (err) {
    console.warn('⚠️  ES search failed, falling back to MongoDB:', err.message);
    return mongoFallback(params, from, size);
  }
}

// ─── Elasticsearch query builder ─────────────────────────────────────────────
async function esSearch(filters, from, size) {
  const es = getClient();
  const must    = [];
  const filter  = [];

  // Free-text across name, address, grievances
  if (filters.query) {
    must.push({
      multi_match: {
        query:  filters.query,
        fields: ['name^3', 'address', 'grievances'],
        type:   'best_fields',
        operator: 'and',
      },
    });
  }

  // Partial name search (edge n-gram)
  if (filters.name) {
    must.push({ match: { name: { query: filters.name, operator: 'and' } } });
  }

  // Exact keyword filters (pre-indexed buckets — O(1) lookup)
  const keywordFilters = {
    district:  filters.district,
    ac_name:   filters.ac_name,
    booth_id:  filters.booth_id,
    zone:      filters.zone,
    category:  filters.category,
    sub_caste: filters.sub_caste,
    sentiment: filters.sentiment,
    employment:filters.employment,
    status:    filters.status,
    gender:    filters.gender,
  };
  for (const [field, value] of Object.entries(keywordFilters)) {
    if (value !== undefined && value !== null && value !== '') {
      filter.push({ term: { [field]: value } });
    }
  }

  // Boolean filter
  if (filters.is_eligible !== undefined && filters.is_eligible !== '') {
    filter.push({ term: { is_eligible: filters.is_eligible === 'true' || filters.is_eligible === true } });
  }

  // Age range filter
  if (filters.age_min || filters.age_max) {
    const range = {};
    if (filters.age_min) range.gte = parseInt(filters.age_min);
    if (filters.age_max) range.lte = parseInt(filters.age_max);
    filter.push({ range: { age: range } });
  }

  const esQuery = {
    bool: {
      must:   must.length   ? must   : [{ match_all: {} }],
      filter: filter.length ? filter : undefined,
    },
  };

  const t0 = Date.now();
  const response = await es.search({
    index: INDEX,
    body: {
      from,
      size,
      query:   esQuery,
      sort:    [{ 'name.raw': { order: 'asc' } }],
      _source: [
        'mongo_id','voter_id','name','age','gender','dob',
        'category','sub_caste','sentiment','employment','grievances',
        'district','ac_name','booth_id','booth_no','address',
        'zone','family_id','sathi_id','status','is_eligible',
      ],
      // Aggregations: stat buckets alongside results
      aggs: {
        by_sentiment: { terms: { field: 'sentiment',  size: 10 } },
        by_category:  { terms: { field: 'category',   size: 10 } },
        by_sub_caste: { terms: { field: 'sub_caste',  size: 20 } },
        age_stats:    { stats: { field: 'age' } },
      },
    },
  });

  const body   = response.body || response;
  const hits   = body.hits;
  const aggs   = body.aggregations || {};
  const took   = body.took;

  return {
    engine:  'elasticsearch',
    took_ms: took,
    total:   hits.total?.value ?? hits.total,
    data:    hits.hits.map(h => ({ id: h._id, ...h._source })),
    buckets: {
      sentiment:  aggs.by_sentiment?.buckets || [],
      category:   aggs.by_category?.buckets  || [],
      sub_caste:  aggs.by_sub_caste?.buckets || [],
      age_stats:  aggs.age_stats || {},
    },
  };
}

// ─── MongoDB fallback (for dev without Elasticsearch running) ─────────────────
async function mongoFallback(params, skip, limit) {
  const { query, name, district, ac_name, booth_id, category, sub_caste,
          sentiment, employment, status, gender, is_eligible, age_min, age_max } = params;

  const q    = {};
  const and  = [];

  if (query || name) {
    const term = query || name;
    and.push({ name: { $regex: term, $options: 'i' } });
  }
  if (district)   q.district    = { $regex: district,  $options: 'i' };
  if (ac_name)    q.acName      = { $regex: ac_name,   $options: 'i' };
  if (booth_id)   q.boothId     = booth_id;
  if (category)   q.category    = category;
  if (sub_caste)  q.subCaste    = sub_caste;
  if (sentiment)  q.sentiment   = sentiment;
  if (employment) q.employment  = employment;
  if (status)     q.status      = status;
  if (gender)     q.gender      = gender;
  if (is_eligible !== undefined && is_eligible !== '')
    q.isEligible = is_eligible === 'true' || is_eligible === true;
  if (age_min || age_max) {
    q.age = {};
    if (age_min) q.age.$gte = parseInt(age_min);
    if (age_max) q.age.$lte = parseInt(age_max);
  }
  if (and.length) q.$and = and;

  const t0    = Date.now();
  const total = await VoterModel.countDocuments(q);
  const data  = await VoterModel.find(q).skip(skip).limit(limit).lean();

  return {
    engine:  'mongodb-fallback',
    took_ms: Date.now() - t0,
    total,
    data,
    buckets: {},
  };
}

module.exports = { searchVoters };
