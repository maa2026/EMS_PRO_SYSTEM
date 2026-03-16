"use client";
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertTriangle, Facebook, Youtube, Instagram, Linkedin, MessageCircle, Video, MessageSquare, MapPin, Shield, Fingerprint, CheckCircle, Loader, X } from 'lucide-react';

// ✅ AAPKA PURA ELECTORAL DATA (1-403 Sequence)
const upData = {
  "Saharanpur": ["1 - Behat", "2 - Nakur", "3 - Saharanpur Nagar", "4 - Saharanpur", "5 - Deoband", "6 - Rampur Maniharan", "7 - Gangoh"],
  "Shamli": ["8 - Kairana", "9 - Thana Bhawan", "10 - Shamli"],
  "Muzaffarnagar": ["11 - Budhana", "12 - Charthawal", "13 - Purqazi", "14 - Muzaffarnagar", "15 - Khatauli", "16 - Meerapur"],
  "Bijnor": ["17 - Najibabad", "18 - Nagina", "19 - Barhapur", "20 - Dhampur", "21 - Nehtaur", "22 - Bijnor", "23 - Chandpur", "24 - Noorpur"],
  "Moradabad": ["25 - Kanth", "26 - Thakurdwara", "27 - Moradabad Rural", "28 - Moradabad Nagar", "29 - Kundarki", "30 - Bilari"],
  "Sambhal": ["31 - Chandausi", "32 - Asmoli", "33 - Sambhal", "34 - Gunnaur"],
  "Rampur": ["35 - Chamraua", "36 - Bilaspur", "37 - Rampur", "38 - Milak", "39 - Suar"],
  "Amroha": ["40 - Dhanaura", "41 - Naugawan Sadat", "42 - Amroha", "43 - Hasanpur"],
  "Meerut": ["44 - Siwalkhas", "45 - Sardhana", "46 - Hastinapur", "47 - Kithore", "48 - Meerut Cantt.", "49 - Meerut City", "50 - Meerut South"],
  "Baghpat": ["51 - Chhaprauli", "52 - Baraut", "53 - Baghpat"],
  "Ghaziabad": ["54 - Loni", "55 - Muradnagar", "56 - Sahibabad", "57 - Ghaziabad", "58 - Modi Nagar"],
  "Hapur": ["59 - Dhaulana", "60 - Hapur", "61 - Garhmukteshwar"],
  "Gautam Buddha Nagar": ["62 - Dadri", "63 - Jewar", "64 - Noida"],
  "Bulandshahr": ["65 - Sikandrabad", "66 - Bulandshahr", "67 - Syana", "68 - Anupshahr", "69 - Debai", "70 - Shikarpur", "71 - Khurja"],
  "Aligarh": ["72 - Khair", "73 - Barauli", "74 - Atrauli", "75 - Chharra", "76 - Koil", "77 - Aligarh", "78 - Iglas"],
  "Hathras": ["79 - Hathras", "80 - Sadabad", "81 - Sikandra Rao"],
  "Mathura": ["82 - Chhata", "83 - Mant", "84 - Goverdhan", "85 - Mathura", "86 - Baldev"],
  "Agra": ["87 - Etmadpur", "88 - Agra Cantt.", "89 - Agra South", "90 - Agra North", "91 - Agra Rural", "92 - Fatehpur Sikri", "93 - Kheragarh", "94 - Fatehabad", "95 - Bah"],
  "Firozabad": ["96 - Tundla", "97 - Jasrana", "98 - Firozabad", "99 - Shikohabad", "100 - Sirsaganj"],
  "Kasganj": ["101 - Kasganj", "102 - Amanpur", "103 - Patiyali"],
  "Etah": ["104 - Aliganj", "105 - Etah", "106 - Marhara", "107 - Jalesar"],
  "Mainpuri": ["107 - Mainpuri", "108 - Bhongaon", "109 - Kishni", "110 - Karhal"],
  "Budaun": ["111 - Gunnaur", "112 - Bisuli", "113 - Sahaswan", "114 - Bilsi", "115 - Budaun", "116 - Shekhupur", "117 - Dataganj"],
  "Bareilly": ["118 - Baheri", "119 - Meerganj", "120 - Bhojipura", "121 - Nawabganj", "122 - Faridpur", "123 - Bithari Chainpur", "124 - Bareilly City", "125 - Bareilly Cantt.", "126 - Aonla"],
  "Pilibhit": ["127 - Pilibhit", "128 - Barkhera", "129 - Puranpur", "130 - Bisalpur"],
  "Shahjahanpur": ["131 - Katra", "132 - Jalalabad", "133 - Tilhar", "134 - Powayan", "135 - Shahjahanpur", "136 - Dadraul"],
  "Lakhimpur Kheri": ["137 - Palia", "138 - Nighasan", "139 - Gola Gokaran Nath", "140 - Srinagar", "141 - Dhaurahra", "142 - Lakhimpur", "143 - Kasta", "144 - Mohammadi"],
  "Sitapur": ["145 - Maholi", "146 - Sitapur", "147 - Laharpur", "148 - Biswan", "149 - Sevata", "150 - Mahmoodabad", "151 - Sidhauli", "152 - Misrikh"],
  "Hardoi": ["153 - Sawajpur", "154 - Shahabad", "155 - Hardoi", "156 - Gopamau", "157 - Sandi", "158 - Bilgram-Mallawan", "159 - Balamau", "160 - Sandila"],
  "Unnao": ["162 - Bangarmau", "163 - Safipur", "164 - Mohan", "165 - Unnao", "166 - Bhagwantnagar", "167 - Purwa"],
  "Lucknow": ["168 - Malihabad", "169 - Bakshi Ka Talab", "170 - Sarojini Nagar", "171 - Lucknow West", "172 - Lucknow North", "173 - Lucknow East", "174 - Lucknow Central", "175 - Lucknow Cantt.", "176 - Mohanlalganj"],
  "Rae Bareli": ["177 - Bachhrawan", "178 - Tiloi", "179 - Harchandpur", "180 - Rae Bareli", "181 - Salon", "182 - Sareni", "183 - Unchahar"],
  "Amethi": ["184 - Jagdishpur", "185 - Gauriganj", "186 - Amethi"],
  "Sultanpur": ["187 - Isauli", "188 - Sultanpur", "189 - Sultanpur Sadar", "190 - Lambhua", "191 - Kadipur"],
  "Farrukhabad": ["192 - Kaimganj", "193 - Amritpur", "194 - Farrukhabad", "195 - Bhojpur"],
  "Kannauj": ["196 - Chhibramau", "197 - Tirwa", "198 - Kannauj"],
  "Etawah": ["199 - Jaswantnagar", "200 - Etawah", "201 - Bharthana"],
  "Auraiya": ["202 - Bidhuna", "203 - Dibiyapur", "204 - Auraiya"],
  "Kanpur Dehat": ["205 - Rasulabad", "206 - Akbarpur-Raniya", "207 - Bhoganipur", "208 - Sikandra"],
  "Kanpur Nagar": ["209 - Bilhaur", "210 - Bithoor", "211 - Kalyanpur", "212 - Govind Nagar", "213 - Sishamau", "214 - Arya Nagar", "215 - Kidwai Nagar", "216 - Kanpur Cantt.", "217 - Maharajpur", "218 - Ghatampur"],
  "Jalaun": ["219 - Madhougarh", "220 - Kalpi", "221 - Orai"],
  "Jhansi": ["222 - Babina", "223 - Jhansi Nagar", "224 - Mauranipur", "225 - Garautha"],
  "Lalitpur": ["226 - Lalitpur", "227 - Mehroni"],
  "Hamirpur": ["228 - Hamirpur", "229 - Rath"],
  "Mahoba": ["230 - Mahoba", "231 - Charkhari"],
  "Banda": ["232 - Tindwari", "233 - Baberu", "234 - Naraini", "235 - Banda"],
  "Chitrakoot": ["236 - Chitrakoot", "237 - Manikpur"],
  "Fatehpur": ["238 - Jahanabad", "239 - Bindki", "240 - Fatehpur", "241 - Ayah Shah", "242 - Husainganj", "243 - Khaga"],
  "Pratapgarh": ["244 - Rampur Khas", "245 - Babaganj", "246 - Kunda", "247 - Vishwanath Ganj", "248 - Pratapgarh", "249 - Patti", "250 - Raniganj"],
  "Kaushambi": ["251 - Sirathu", "252 - Manjhanpur", "253 - Chail"],
  "Prayagraj": ["254 - Phaphamau", "255 - Soraon", "256 - Phulpur", "257 - Pratappur", "258 - Handia", "259 - Meja", "260 - Karchana", "261 - Allahabad West", "262 - Allahabad North", "263 - Allahabad South", "264 - Bara", "265 - Koraon"],
  "Barabanki": ["266 - Kursi", "267 - Ram Nagar", "268 - Barabanki", "269 - Zaidpur", "270 - Dariyabad", "272 - Haidergarh"],
  "Ayodhya": ["271 - Rudauli", "273 - Milkipur", "274 - Bikapur", "275 - Ayodhya", "276 - Gosainganj"],
  "Ambedkar Nagar": ["277 - Katehari", "278 - Tanda", "279 - Alapur", "280 - Jalalpur", "281 - Akbarpur"],
  "Bahraich": ["282 - Balha", "283 - Nanpara", "284 - Matera", "285 - Mahasi", "286 - Bahraich", "287 - Payagpur", "288 - Kaiserganj"],
  "Shravasti": ["289 - Bhinga", "290 - Shravasti"],
  "Balrampur": ["291 - Tulsipur", "292 - Gainsari", "293 - Utraula", "294 - Balrampur"],
  "Gonda": ["295 - Mehnaun", "296 - Gonda", "297 - Katra Bazar", "298 - Colonelganj", "299 - Tarabganj", "300 - Mankapur", "301 - Gaura"],
  "Siddharthnagar": ["302 - Shohratgarh", "303 - Itwa", "304 - Bansi", "305 - Domariyaganj", "306 - Kapilvastu"],
  "Basti": ["307 - Harraiya", "308 - Kaptanganj", "309 - Rudhauli", "310 - Basti Sadar", "311 - Mahadewa"],
  "Sant Kabir Nagar": ["312 - Mehdawal", "313 - Khalilabad", "314 - Dhanghata"],
  "Maharajganj": ["315 - Pharenda", "316 - Nautanwa", "317 - Siswa", "318 - Maharajganj", "319 - Paniyara"],
  "Gorakhpur": ["320 - Caimpiyarganj", "321 - Pipraich", "322 - Gorakhpur Urban", "323 - Gorakhpur Rural", "324 - Sahjanwa", "325 - Khajani", "326 - Chauri-Chaura", "327 - Bansgaon", "328 - Chillupar"],
  "Kushinagar": ["329 - Khadda", "330 - Padrauna", "331 - Tamkuhi Raj", "332 - Fazilnagar", "333 - Kushinagar", "334 - Hata", "335 - Ramkola"],
  "Deoria": ["336 - Rudrapur", "337 - Deoria", "338 - Pathardeva", "339 - Rampur Karkhana", "340 - Bhatpar Rani", "341 - Salempur", "342 - Barhaj"],
  "Azamgarh": ["343 - Atraulia", "344 - Gopalpur", "345 - Sagri", "346 - Mubarakpur", "347 - Azamgarh", "348 - Nizamabad", "349 - Phoolpur Pawai", "350 - Didarganj", "351 - Lalganj", "352 - Mehnagar"],
  "Mau": ["353 - Madhuban", "354 - Ghosi", "355 - Muhammadabad-Gohna", "356 - Mau"],
  "Ballia": ["357 - Belthara Road", "358 - Rasara", "359 - Sikanderpur", "360 - Phephana", "361 - Ballia Nagar", "362 - Bansdih", "363 - Bairia"],
  "Jaunpur": ["364 - Badlapur", "365 - Shahganj", "366 - Jaunpur", "367 - Malhani", "368 - Mungra Badshahpur", "369 - Machhlishahr", "370 - Mariyahu", "371 - Zafrabad", "372 - Kerakat"],
  "Ghazipur": ["373 - Jakhanian", "374 - Saidpur", "375 - Ghazipur", "376 - Jangipur", "377 - Zahoorabad", "378 - Mohammadabad", "379 - Zamania"],
  "Chandauli": ["380 - Mughalsarai", "381 - Sakaldiha", "382 - Saiyadraja", "383 - Chakia"],
  "Varanasi": ["384 - Pindra", "385 - Ajagara", "386 - Shivpur", "387 - Rohaniya", "388 - Varanasi North", "389 - Varanasi South", "390 - Varanasi Cantt.", "391 - Sevapuri"],
  "Bhadohi": ["392 - Bhadohi", "393 - Gyanpur", "394 - Aurai"],
  "Mirzapur": ["395 - Chhanbey", "396 - Mirzapur", "397 - Majhawan", "398 - Chunar", "399 - Marihan"],
  "Sonbhadra": ["400 - Ghorawal", "401 - Robertsganj", "402 - Obra", "403 - Duddhi"]
};

export default function SignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "", fatherName: "", dob: "", mobile: "", whatsapp: "",
    address1: "", block: "", tehsil: "", thana: "", pincode: "",
    position: "", district: "", constituency: "", boothNo: "",
    epic: "", aadhar: "", education: "Graduate",
    facebook: "", youtube: "", instagram: "", linkedin: "",
    snapchat: "", imessage: "", facetime: ""
  });

  const [error, setError] = useState("");
  const [distSearch, setDistSearch] = useState("");
  const [isDistOpen, setIsDistOpen] = useState(false);
  const [conSearch, setConSearch] = useState("");
  const [isConOpen, setIsConOpen] = useState(false);

  // 🔐 Security verification state
  const [geoStatus,    setGeoStatus]   = useState('idle');  // idle|checking|pass|fail|skipped
  const [bioStatus,    setBioStatus]   = useState('idle');  // idle|pending|done|fail|skipped
  const [bioCredId,    setBioCredId]   = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const constituencies = useMemo(() => upData[formData.district] || [], [formData.district]);

  const filteredDistricts = useMemo(() => 
    Object.keys(upData).filter(d => d.toLowerCase().includes(distSearch.toLowerCase())).sort()
  , [distSearch]);

  const filteredConstituencies = useMemo(() => 
    constituencies.filter(c => c.toLowerCase().includes(conSearch.toLowerCase()))
  , [conSearch, constituencies]);

  const handleDistSelect = (dist) => {
    setFormData(prev => ({ ...prev, district: dist, constituency: "" }));
    setDistSearch(dist);
    setIsDistOpen(false);
    setConSearch("");
  };

  const handleConSelect = (con) => {
    setFormData(prev => ({ ...prev, constituency: con }));
    setConSearch(con);
    setIsConOpen(false);
  };

  // --- Geo-fence: checks if worker is within 50 km of selected constituency ---
  const checkGeoFence = async () => {
    if (!formData.constituency) {
      setError('Please select your constituency before the location check.');
      return false;
    }
    setGeoStatus('checking');
    try {
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 15000, maximumAge: 60000 })
      );
      const { latitude: lat, longitude: lng } = pos.coords;
      const res = await fetch('/api/geo/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng, constituency: formData.constituency, radiusKm: 50 }),
      });
      const data = await res.json();
      if (data.inside || data.advisory) {
        setGeoStatus('pass');
        return true;
      }
      setGeoStatus('fail');
      setError(`📍 Location Mismatch: You are ${data.distanceKm} km from ${formData.constituency}. Please verify your constituency selection.`);
      return false;
    } catch (_) {
      // GPS permission denied or unavailable → advisory skip (don't block rural workers)
      setGeoStatus('skipped');
      return true;
    }
  };

  // --- WebAuthn FIDO2 biometric binding (fingerprint / FaceID) ---
  const bindBiometric = async () => {
    if (!window.PublicKeyCredential) {
      setBioStatus('skipped');  // browser/device doesn't support WebAuthn
      return null;
    }
    setBioStatus('pending');
    try {
      const challenge = window.crypto.getRandomValues(new Uint8Array(32));
      const userId    = new TextEncoder().encode(
        (formData.mobile || String(Date.now())).slice(0, 64)
      );
      const credential = await navigator.credentials.create({
        publicKey: {
          rp:   { name: 'EMS.UP Command Center', id: window.location.hostname },
          user: {
            id:          userId,
            name:        formData.mobile        || 'worker',
            displayName: formData.fullName       || 'EMS Worker',
          },
          pubKeyCredParams: [
            { alg: -7,   type: 'public-key' },  // ES256 (preferred)
            { alg: -257, type: 'public-key' },  // RS256 (fallback)
          ],
          challenge,
          authenticatorSelection: {
            userVerification: 'preferred',
            residentKey:      'discouraged',
          },
          timeout:     60000,
          attestation: 'none',
        },
      });
      // Encode rawId as base64 for storage
      const rawIdBytes = Array.from(new Uint8Array(credential.rawId));
      const credId     = btoa(String.fromCharCode(...rawIdBytes));
      setBioCredId(credId);
      setBioStatus('done');
      return credId;
    } catch (err) {
      // User cancelled or device error — treat as advisory skip
      setBioStatus('fail');
      return null;
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    const required = ["fullName", "fatherName", "dob", "mobile", "address1", "tehsil", "pincode", "position", "district", "constituency", "boothNo", "epic", "aadhar"];
    const missing = required.filter(f => !formData[f]);
    if (missing.length > 0) {
      setError("SECURITY ALERT: Please complete all required fields (*)");
      window.scrollTo(0, 0);
      return;
    }

    setIsSubmitting(true);

    // 🗺️ Geo-fence pre-flight (auto-runs if not already passed)
    if (geoStatus !== 'pass' && geoStatus !== 'skipped') {
      const geoOk = await checkGeoFence();
      if (!geoOk) { setIsSubmitting(false); return; }
    }

    // 🔐 Biometric binding (if not already done)
    let credId = bioCredId;
    if (bioStatus === 'idle') credId = await bindBiometric();

    try {
      const response = await fetch('/api/workers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          fatherName: formData.fatherName,
          dob: formData.dob,
          primaryMobile: formData.mobile,
          whatsapp: formData.whatsapp,
          addressLine1: formData.address1,
          block: formData.block,
          tehsil: formData.tehsil,
          policeStation: formData.thana,
          pincode: formData.pincode,
          position: formData.position,
          district: formData.district,
          constituency: formData.constituency,
          boothNo: formData.boothNo,
          voterId: formData.epic,
          aadhar: formData.aadhar,
          education: formData.education,
          socialMedia: {
            facebook: formData.facebook,
            youtube: formData.youtube,
            instagram: formData.instagram,
            linkedin: formData.linkedin,
            snapchat: formData.snapchat,
            imessage: formData.imessage,
            facetime: formData.facetime,
          },
          biometricCredentialId: credId || null,
          geoVerified: geoStatus === 'pass',
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`✅ Registration Successful!\nReg No: ${result.regNo}\n\n72 hours mein verification poora hoga.`);
        router.push('/portal/super-admin/login');
      } else {
        setError(result.error || "Submission Failed");
      }
    } catch (err) {
      setError("❌ Server connection failed. Check if Backend is running.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const s = {
    container: "min-h-screen bg-[#000] text-white flex flex-col items-center justify-center p-4 md:p-6",
    card: "w-full max-w-5xl bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl relative",
    secTitle: "text-lg md:text-xl font-black mb-6 md:mb-8 flex items-center text-red-400 uppercase tracking-widest",
    grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8",
    input: "w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 md:px-5 md:py-4 text-sm md:text-base text-white outline-none focus:border-red-500 transition-all placeholder:text-gray-500",
    label: "text-xs font-bold text-gray-400 uppercase mb-2 ml-1 tracking-widest",
    dropdown: "absolute z-50 w-full mt-2 bg-black/60 border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto",
    dropItem: "px-4 py-3 text-sm md:text-base cursor-pointer transition-colors border-b border-gray-800 last:border-0 hover:bg-red-600/20 hover:text-red-200",
    btn: "w-full py-4 md:py-5 bg-red-600 hover:bg-red-700 text-white border-none rounded-xl font-black uppercase tracking-widest text-sm md:text-base transition-all active:scale-95 shadow-lg shadow-red-600/30"
  };

  return (
    <div className={s.container}>
      <div className={s.card}>
        {error && <div className="text-red-400 mb-6 text-center font-bold">{error}</div>}
        <form onSubmit={handleSignup}>
          <div className="text-center mb-8 md:mb-10">
             <h1 className="text-3xl md:text-5xl font-black">Sangathan Setu</h1>
             <p className="text-red-400 text-xs md:text-sm uppercase tracking-widest mt-2">UP UNIT • SECURE ENROLLMENT</p>
          </div>

          <div className={s.secTitle}>1. Personal Profile</div>
          <div className={s.grid}>
            <div>
              <label className={s.label}>Full Name *</label>
              <input required className={s.input} value={formData.fullName} onChange={(e)=>setFormData({...formData, fullName: e.target.value})} />
            </div>
            <div>
              <label className={s.label}>Father's Name *</label>
              <input required className={s.input} value={formData.fatherName} onChange={(e)=>setFormData({...formData, fatherName: e.target.value})} />
            </div>
            <div>
              <label className={s.label}>Date of Birth *</label>
              <input required type="date" className={s.input} value={formData.dob} onChange={(e)=>setFormData({...formData, dob: e.target.value})} />
            </div>
            <div>
              <label className={s.label}>Primary Mobile *</label>
              <input required className={s.input} value={formData.mobile} onChange={(e)=>setFormData({...formData, mobile: e.target.value})} maxLength="10" />
            </div>
            <div>
              <label className={s.label}>WhatsApp</label>
              <input className={s.input} placeholder="+91 XXXXXXXXXX" value={formData.whatsapp} onChange={(e)=>setFormData({...formData, whatsapp: e.target.value})} />
            </div>
          </div>

          <div className={s.secTitle}>2. Residential</div>
          <div className={s.grid}>
            <div className="md:col-span-2 lg:col-span-3">
              <label className={s.label}>Address Line 1 *</label>
              <input required className={s.input} placeholder="House No, Street, Mohalla/Village" value={formData.address1} onChange={(e)=>setFormData({...formData, address1: e.target.value})} />
            </div>
            <div>
              <label className={s.label}>Block</label>
              <input className={s.input} placeholder="Block name" value={formData.block} onChange={(e)=>setFormData({...formData, block: e.target.value})} />
            </div>
            <div>
              <label className={s.label}>Tehsil *</label>
              <input required className={s.input} placeholder="Tehsil" value={formData.tehsil} onChange={(e)=>setFormData({...formData, tehsil: e.target.value})} />
            </div>
            <div>
              <label className={s.label}>Police Station</label>
              <input className={s.input} placeholder="Thana/Police Station" value={formData.thana} onChange={(e)=>setFormData({...formData, thana: e.target.value})} />
            </div>
            <div>
              <label className={s.label}>PinCode *</label>
              <input required className={s.input} placeholder="6-digit PIN" maxLength="6" value={formData.pincode} onChange={(e)=>setFormData({...formData, pincode: e.target.value})} />
            </div>
          </div>

          <div className={s.secTitle}>3. Organization & Location</div>
          <div className={s.grid}>
            <div className="relative">
              <label className={s.label}>Position *</label>
              <select required className={s.input} value={formData.position} onChange={(e)=>setFormData({...formData, position: e.target.value})}>
                <option value="">Select Position</option>
                <option value="BP">Booth President</option>
                <option value="BM">Booth Manager</option>
                <option value="JSS">Jansampark Sathi</option>
              </select>
            </div>

            {/* DISTRICT DROPDOWN */}
            <div className="relative">
              <label className={s.label}>District *</label>
              <input type="text" className={s.input} placeholder="Search District..." value={distSearch}
                onChange={(e)=>{setDistSearch(e.target.value); setIsDistOpen(true);}} onFocus={()=>setIsDistOpen(true)} />
              {isDistOpen && (
                <div className={s.dropdown}>
                  {filteredDistricts.map(d=>(<div key={d} className={s.dropItem} onClick={()=>handleDistSelect(d)}>{d}</div>))}
                </div>
              )}
            </div>

            {/* CONSTITUENCY DROPDOWN */}
            <div className="relative">
              <label className={s.label}>Constituency *</label>
              <input type="text" className={s.input} placeholder={formData.district ? "Search AC..." : "Select District First"}
                value={conSearch} disabled={!formData.district}
                onChange={(e)=>{setConSearch(e.target.value); setIsConOpen(true);}} onFocus={()=>setIsConOpen(true)} />
              {isConOpen && formData.district && (
                <div className={s.dropdown}>
                  {filteredConstituencies.map(c=>(<div key={c} className={s.dropItem} onClick={()=>handleConSelect(c)}>{c}</div>))}
                </div>
              )}
            </div>

            <div>
              <label className={s.label}>Booth No *</label>
              <input required className={s.input} value={formData.boothNo} onChange={(e)=>setFormData({...formData, boothNo: e.target.value})} />
            </div>
          </div>

          <div className={s.secTitle}>4. Identity & Education</div>
          <div className={s.grid}>
            <div>
              <label className={s.label}>Voter ID (EPIC) *</label>
              <input required className={s.input} placeholder="e.g. ABC1234567" value={formData.epic} onChange={(e)=>setFormData({...formData, epic: e.target.value.toUpperCase()})} />
            </div>
            <div>
              <label className={s.label}>Aadhar Card *</label>
              <input required className={s.input} placeholder="12-digit Aadhar No." maxLength="12" value={formData.aadhar} onChange={(e)=>setFormData({...formData, aadhar: e.target.value.replace(/\D/g,'')})} />
            </div>
            <div>
              <label className={s.label}>Education *</label>
              <select required className={s.input} value={formData.education} onChange={(e)=>setFormData({...formData, education: e.target.value})}>
                <option value="">Select Education</option>
                <option value="5th">5th Pass</option>
                <option value="8th">8th Pass</option>
                <option value="10th">10th / Matric</option>
                <option value="12th">12th / Intermediate</option>
                <option value="ITI">ITI / Diploma</option>
                <option value="Graduate">Graduate (BA/BSc/BCom)</option>
                <option value="PostGraduate">Post Graduate (MA/MSc)</option>
                <option value="BEd">B.Ed / Teacher Training</option>
                <option value="BCA/MCA">BCA / MCA</option>
                <option value="BTech">B.Tech / Engineering</option>
                <option value="LLB">LLB / Law</option>
                <option value="MBBS">MBBS / Medical</option>
                <option value="PhD">PhD / Research</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className={s.secTitle}>5. Social Media Platforms</div>
          <div className={s.grid}>

            {/* Facebook */}
            <div>
              <label className={s.label + ' flex items-center gap-2'}>
                <Facebook size={14} className="text-[#1877F2]" />
                Facebook
              </label>
              <div className="relative">
                <Facebook size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1877F2]" />
                <input className={s.input + ' pl-10'} placeholder="facebook.com/yourprofile" value={formData.facebook} onChange={(e)=>setFormData({...formData, facebook: e.target.value})} />
              </div>
            </div>

            {/* YouTube */}
            <div>
              <label className={s.label + ' flex items-center gap-2'}>
                <Youtube size={14} className="text-[#FF0000]" />
                YouTube
              </label>
              <div className="relative">
                <Youtube size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FF0000]" />
                <input className={s.input + ' pl-10'} placeholder="youtube.com/@channel" value={formData.youtube} onChange={(e)=>setFormData({...formData, youtube: e.target.value})} />
              </div>
            </div>

            {/* Instagram */}
            <div>
              <label className={s.label + ' flex items-center gap-2'}>
                <Instagram size={14} className="text-[#E1306C]" />
                Instagram
              </label>
              <div className="relative">
                <Instagram size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E1306C]" />
                <input className={s.input + ' pl-10'} placeholder="instagram.com/yourhandle" value={formData.instagram} onChange={(e)=>setFormData({...formData, instagram: e.target.value})} />
              </div>
            </div>

            {/* LinkedIn */}
            <div>
              <label className={s.label + ' flex items-center gap-2'}>
                <Linkedin size={14} className="text-[#0A66C2]" />
                LinkedIn
              </label>
              <div className="relative">
                <Linkedin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0A66C2]" />
                <input className={s.input + ' pl-10'} placeholder="linkedin.com/in/yourprofile" value={formData.linkedin} onChange={(e)=>setFormData({...formData, linkedin: e.target.value})} />
              </div>
            </div>

            {/* Snapchat */}
            <div>
              <label className={s.label + ' flex items-center gap-2'}>
                <span style={{fontSize:'14px'}}>👻</span>
                Snapchat
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base leading-none">👻</span>
                <input className={s.input + ' pl-10'} placeholder="Snapchat username" value={formData.snapchat} onChange={(e)=>setFormData({...formData, snapchat: e.target.value})} />
              </div>
            </div>

            {/* iMessage */}
            <div>
              <label className={s.label + ' flex items-center gap-2'}>
                <MessageCircle size={14} className="text-[#34C759]" />
                iMessage (Apple ID)
              </label>
              <div className="relative">
                <MessageCircle size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#34C759]" />
                <input className={s.input + ' pl-10'} placeholder="Apple ID / Email" value={formData.imessage} onChange={(e)=>setFormData({...formData, imessage: e.target.value})} />
              </div>
            </div>

            {/* FaceTime */}
            <div>
              <label className={s.label + ' flex items-center gap-2'}>
                <Video size={14} className="text-[#34C759]" />
                FaceTime
              </label>
              <div className="relative">
                <Video size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#34C759]" />
                <input className={s.input + ' pl-10'} placeholder="Phone or Apple ID" value={formData.facetime} onChange={(e)=>setFormData({...formData, facetime: e.target.value})} />
              </div>
            </div>

          </div>

          {/* ✅ SECTION 6: SECURITY VERIFICATION */}
          <div className={s.secTitle}>6. Security Verification</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">

            {/* Geo-fence check */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-300 uppercase tracking-widest">
                <MapPin size={14} className="text-blue-400" /> Location Verification
              </div>
              <p className="text-xs text-gray-500">Verify that you are within your selected constituency boundary (advisory check — GPS must be enabled).</p>
              <button type="button" onClick={checkGeoFence} disabled={geoStatus === 'checking' || geoStatus === 'pass'}
                className="flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold uppercase tracking-widest transition-all"
                style={{ background: geoStatus === 'pass' ? '#16a34a22' : geoStatus === 'fail' ? '#dc262622' : '#1d4ed822',
                         border: `1px solid ${geoStatus === 'pass' ? '#16a34a' : geoStatus === 'fail' ? '#dc2626' : '#1d4ed8'}`,
                         color: geoStatus === 'pass' ? '#4ade80' : geoStatus === 'fail' ? '#f87171' : '#60a5fa' }}>
                {geoStatus === 'checking' && <Loader size={14} className="animate-spin" />}
                {geoStatus === 'pass'     && <CheckCircle size={14} />}
                {geoStatus === 'fail'     && <X size={14} />}
                {geoStatus === 'idle'     && <MapPin size={14} />}
                {geoStatus === 'skipped'  && <CheckCircle size={14} />}
                {geoStatus === 'checking' ? 'Detecting Location...' :
                 geoStatus === 'pass'     ? 'Location Verified ✓' :
                 geoStatus === 'fail'     ? 'Verification Failed' :
                 geoStatus === 'skipped'  ? 'GPS Unavailable (Skipped)' :
                 'Check My Location'}
              </button>
            </div>

            {/* WebAuthn biometric */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-300 uppercase tracking-widest">
                <Fingerprint size={14} className="text-purple-400" /> Biometric Binding
              </div>
              <p className="text-xs text-gray-500">Bind your fingerprint or Face ID to this enrollment for device-level authentication.</p>
              <button type="button" onClick={bindBiometric} disabled={bioStatus === 'pending' || bioStatus === 'done'}
                className="flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold uppercase tracking-widest transition-all"
                style={{ background: bioStatus === 'done'    ? '#7c3aed22' : bioStatus === 'fail' ? '#dc262622' : '#4c1d9522',
                         border: `1px solid ${bioStatus === 'done' ? '#7c3aed' : bioStatus === 'fail' ? '#dc2626' : '#7c3aed'}`,
                         color: bioStatus === 'done' ? '#c084fc' : bioStatus === 'fail' ? '#f87171' : '#a78bfa' }}>
                {bioStatus === 'pending' && <Loader size={14} className="animate-spin" />}
                {bioStatus === 'done'    && <CheckCircle size={14} />}
                {bioStatus === 'fail'    && <X size={14} />}
                {(bioStatus === 'idle' || bioStatus === 'skipped') && <Fingerprint size={14} />}
                {bioStatus === 'pending' ? 'Scan Biometric...' :
                 bioStatus === 'done'    ? 'Biometric Bound ✓' :
                 bioStatus === 'fail'    ? 'Skipped / Cancelled' :
                 bioStatus === 'skipped' ? 'Device Not Supported' :
                 'Bind Fingerprint / Face ID'}
              </button>
            </div>

          </div>

          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-6 text-xs text-gray-400">
            <Shield size={14} className="text-red-400 flex-shrink-0" />
            Location and biometric checks are advisory. Enrollment will proceed even if your device doesn't support them. False information is a punishable offence.
          </div>

          <button type="submit" disabled={isSubmitting} className={s.btn
            + (isSubmitting ? ' opacity-60 cursor-not-allowed' : '')}>
            {isSubmitting
              ? <span className="flex items-center justify-center gap-2"><Loader size={16} className="animate-spin" />Submitting...</span>
              : 'VERIFY & SUBMIT ENROLLMENT'
            }
          </button>
        </form>
      </div>
    </div>
  );
}