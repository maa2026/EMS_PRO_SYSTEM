/**
 * EMS PRO 2026 — Account Seed Script
 * Creates accounts for all 8 hierarchy levels:
 * L0 Super Admin, L1 State, L2 Zone (15), L3 District (75),
 * L4 Constituency (sample 5), L5 Booth President, L6 Booth Manager, L7 Jan Sampark Sathi
 * Run: node scripts/seedAccounts.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Worker   = require('../models/Worker');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ems_up';

// ─── Zone → Districts mapping (from DB) ────────────────────────────────────
const ZONES = [
  { id: 'Z01', name: 'Awadh Central (Power–Perception)',    districts: ['Amethi','Barabanki','Lucknow','Raebareli','Unnao'] },
  { id: 'Z02', name: 'Awadh North–Terai Border',            districts: ['Bahraich','Balrampur','Maharajganj','Shrawasti','Siddharthnagar'] },
  { id: 'Z03', name: 'Awadh South (Faith–Memory)',          districts: ['Ambedkar Nagar','Ayodhya','Gonda','Pratapgarh','Sultanpur'] },
  { id: 'Z04', name: 'Braj–Agra Belt',                      districts: ['Agra','Etah','Firozabad','Hathras','Mathura'] },
  { id: 'Z05', name: 'Bundelkhand Core',                    districts: ['Hamirpur','Jalaun','Jhansi','Lalitpur','Mahoba'] },
  { id: 'Z06', name: 'Central Doab (SP Core)',              districts: ['Auraiya','Etawah','Kannauj','Kanpur Dehat','Kanpur Nagar'] },
  { id: 'Z07', name: 'Gorakhpur–Basti Core',                districts: ['Basti','Deoria','Gorakhpur','Kushinagar','Sant Kabir Nagar'] },
  { id: 'Z08', name: 'NCR / Upper Doab Urban',              districts: ['Aligarh','Bulandshahr','Gautam Buddha Nagar','Ghaziabad','Hapur'] },
  { id: 'Z09', name: 'Purvanchal Core (Azamgarh Spine)',    districts: ['Azamgarh','Ballia','Ghazipur','Jaunpur','Mau'] },
  { id: 'Z10', name: 'Purvanchal South–Vindhya Link',       districts: ['Bhadohi','Chandauli','Mirzapur','Sonbhadra','Varanasi'] },
  { id: 'Z11', name: 'Rohilkhand East (Silent Swing)',      districts: ['Bareilly','Budaun','Kheri','Pilibhit','Shahjahanpur'] },
  { id: 'Z12', name: 'Rohilkhand West (Minority Belt)',     districts: ['Amroha','Bijnor','Moradabad','Rampur','Sambhal'] },
  { id: 'Z13', name: 'South Doab–Bundelkhand Edge',         districts: ['Banda','Chitrakoot','Fatehpur','Kaushambi','Prayagraj'] },
  { id: 'Z14', name: 'Upper Ganga–Kali Belt',               districts: ['Farrukhabad','Hardoi','Kasganj','Mainpuri','Sitapur'] },
  { id: 'Z15', name: 'Western Jat–Muslim Core',             districts: ['Baghpat','Meerut','Muzaffarnagar','Saharanpur','Shamli'] },
];

// ─── Sample Constituencies for L4/L5/L6/L7 accounts ───────────────────────
const SAMPLE_CONSTITUENCIES = [
  { district: 'Lucknow',      constituency: 'Lucknow Central',  boothNo: 101 },
  { district: 'Varanasi',     constituency: 'Varanasi North',   boothNo: 201 },
  { district: 'Mainpuri',     constituency: 'Mainpuri',         boothNo: 301 },
  { district: 'Meerut',       constituency: 'Meerut City',      boothNo: 401 },
  { district: 'Gorakhpur',    constituency: 'Gorakhpur Urban',  boothNo: 501 },
];

// ─── Helper ────────────────────────────────────────────────────────────────
function zoneName(dist) {
  const z = ZONES.find(z => z.districts.includes(dist));
  return z ? z.name : 'Uttar Pradesh';
}
function slug(str) {
  return str.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 8);
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ MongoDB connected\n');

  const accounts = [];

  // ── L0: Super Admin ──────────────────────────────────────────────────────
  accounts.push({
    fullName:     'EMS Super Admin',
    mobile:       '9999900000',
    district:     'Uttar Pradesh',
    zone:         'ALL ZONES',
    constituency: 'ALL',
    role:         'L0',
    emsId:        'EMS-L0-00001',
    password:     'EMS@SuperAdmin2026',
    stateStatus:  'Active',
  });

  // ── L1: State Admin ───────────────────────────────────────────────────────
  accounts.push({
    fullName:     'EMS State Admin UP',
    mobile:       '9999900001',
    district:     'Uttar Pradesh',
    zone:         'ALL ZONES',
    constituency: 'ALL',
    role:         'L1',
    emsId:        'EMS-L1-UP0001',
    password:     'EMS@StateUP2026',
    stateStatus:  'Active',
  });

  // ── L2: Zone Admins (15) ─────────────────────────────────────────────────
  ZONES.forEach((z, i) => {
    const num = String(i + 1).padStart(2, '0');
    accounts.push({
      fullName:     `Zone Admin – ${z.name}`,
      mobile:       `99999020${String(i).padStart(2,'0')}`,
      district:     z.districts[0],
      zone:         z.name,
      constituency: 'ALL',
      role:         'L2',
      emsId:        `EMS-L2-${z.id}`,
      password:     `EMS@Zone${num}_2026`,
      stateStatus:  'Active',
    });
  });

  // ── L3: District Admins (75) ─────────────────────────────────────────────
  let distIdx = 0;
  for (const z of ZONES) {
    for (const dist of z.districts) {
      distIdx++;
      const num = String(distIdx).padStart(3, '0');
      accounts.push({
        fullName:     `District Admin – ${dist}`,
        mobile:       `9998${String(distIdx).padStart(6, '0')}`,
        district:     dist,
        zone:         z.name,
        constituency: 'ALL',
        role:         'L3',
        emsId:        `EMS-L3-D${num}`,
        password:     `EMS@Dist${num}_2026`,
        stateStatus:  'Active',
      });
    }
  }

  // ── L4: Constituency Prabhari (5 samples) ────────────────────────────────
  SAMPLE_CONSTITUENCIES.forEach((s, i) => {
    const num = String(i + 1).padStart(3, '0');
    accounts.push({
      fullName:     `Prabhari – ${s.constituency}`,
      mobile:       `9997${String(i + 1).padStart(6, '0')}`,
      district:     s.district,
      zone:         zoneName(s.district),
      constituency: s.constituency,
      role:         'L4',
      emsId:        `EMS-L4-C${num}`,
      password:     `EMS@Prabhari${num}_2026`,
      stateStatus:  'Active',
    });
  });

  // ── L5: Booth President (BP) (5 samples) ─────────────────────────────────
  SAMPLE_CONSTITUENCIES.forEach((s, i) => {
    const num = String(i + 1).padStart(3, '0');
    accounts.push({
      fullName:     `Booth President – Booth ${s.boothNo}`,
      mobile:       `9996${String(i + 1).padStart(6, '0')}`,
      district:     s.district,
      zone:         zoneName(s.district),
      constituency: s.constituency,
      boothNo:      s.boothNo,
      role:         'L5',
      emsId:        `EMS-L5-BP${num}`,
      password:     `EMS@BP${num}_2026`,
      stateStatus:  'Active',
    });
  });

  // ── L6: Booth Manager (BM) (5 samples) ───────────────────────────────────
  SAMPLE_CONSTITUENCIES.forEach((s, i) => {
    const num = String(i + 1).padStart(3, '0');
    accounts.push({
      fullName:     `Booth Manager – Booth ${s.boothNo}`,
      mobile:       `9995${String(i + 1).padStart(6, '0')}`,
      district:     s.district,
      zone:         zoneName(s.district),
      constituency: s.constituency,
      boothNo:      s.boothNo,
      role:         'L6',
      emsId:        `EMS-L6-BM${num}`,
      password:     `EMS@BM${num}_2026`,
      stateStatus:  'Active',
    });
  });

  // ── L7: Jan Sampark Sathi (JSS) (5 samples) ──────────────────────────────
  SAMPLE_CONSTITUENCIES.forEach((s, i) => {
    const num = String(i + 1).padStart(3, '0');
    accounts.push({
      fullName:     `Jan Sampark Sathi – Booth ${s.boothNo}`,
      mobile:       `9994${String(i + 1).padStart(6, '0')}`,
      district:     s.district,
      zone:         zoneName(s.district),
      constituency: s.constituency,
      boothNo:      s.boothNo,
      role:         'L7',
      emsId:        `EMS-L7-JSS${num}`,
      password:     `EMS@JSS${num}_2026`,
      stateStatus:  'Active',
    });
  });

  // ── Insert (upsert by emsId) ──────────────────────────────────────────────
  let created = 0, updated = 0;
  for (const acc of accounts) {
    const res = await Worker.findOneAndUpdate(
      { emsId: acc.emsId },
      { $set: acc },
      { upsert: true, new: true }
    );
    if (res.createdAt === res.updatedAt) created++; else updated++;
  }

  // ── Print Summary Table ───────────────────────────────────────────────────
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('         EMS PRO 2026 — ACCOUNT CREATION REPORT');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const levels = ['L0','L1','L2','L3','L4','L5','L6','L7'];
  const labels = {
    L0: 'Super Admin',
    L1: 'State Admin',
    L2: 'Zone Admin',
    L3: 'District Admin',
    L4: 'Constituency Prabhari',
    L5: 'Booth President (BP)',
    L6: 'Booth Manager (BM)',
    L7: 'Jan Sampark Sathi (JSS)',
  };

  for (const lvl of levels) {
    const group = accounts.filter(a => a.role === lvl);
    console.log(`\n▶ ${lvl} — ${labels[lvl]} (${group.length} accounts)`);
    console.log('─'.repeat(70));
    console.log(`  ${'EMS ID'.padEnd(20)} ${'Name'.padEnd(35)} Password`);
    console.log('─'.repeat(70));
    group.forEach(a => {
      console.log(`  ${a.emsId.padEnd(20)} ${a.fullName.substring(0,34).padEnd(35)} ${a.password}`);
    });
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`  Total Created/Updated: ${accounts.length} accounts`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
