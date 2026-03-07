"use client";
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

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
    address1: "", tehsil: "", thana: "", pincode: "",
    position: "", district: "", constituency: "", boothNo: "",
    epic: "", education: "Graduate"
  });

  const [error, setError] = useState("");
  const [distSearch, setDistSearch] = useState("");
  const [isDistOpen, setIsDistOpen] = useState(false);
  const [conSearch, setConSearch] = useState("");
  const [isConOpen, setIsConOpen] = useState(false);

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

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    const required = ["fullName", "fatherName", "dob", "mobile", "address1", "tehsil", "pincode", "position", "district", "constituency", "boothNo", "epic"];
    const missing = required.filter(f => !formData[f]);

    if (missing.length > 0) {
      setError("SECURITY ALERT: Please complete all required fields (*)");
      window.scrollTo(0, 0);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/workers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          fatherName: formData.fatherName,
          dob: formData.dob,
          primaryMobile: formData.mobile,
          whatsapp: formData.whatsapp,
          addressLine1: formData.address1,
          tehsil: formData.tehsil,
          policeStation: formData.thana,
          pincode: formData.pincode,
          position: formData.position,
          district: formData.district,
          constituency: formData.constituency,
          boothNo: formData.boothNo,
          voterId: formData.epic,
          education: formData.education
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`✅ Registration Successful!\nReg No: ${result.regNo}\n\n72 hours mein verification poora hoga.`);
        // Sahi Portal Redirect
        router.push('/portal/super-admin/login'); 
      } else {
        setError(result.error || "Submission Failed");
      }
    } catch (err) {
      setError("❌ Server connection failed. Check if Backend is running.");
    }
  };

  const s = {
    container: { backgroundColor: "#000", minHeight: "100vh", padding: "40px 20px", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center" },
    card: { maxWidth: "1100px", width: "100%", background: "rgba(10, 10, 10, 0.95)", padding: "45px", borderRadius: "30px", border: "1px solid #1a1a1a", position: "relative" },
    secTitle: { fontSize: "16px", fontWeight: "800", marginBottom: "25px", display: "flex", alignItems: "center", color: "#DA251D", textTransform: "uppercase" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "30px" },
    input: { background: "#0c0c0c", border: "1px solid #222", padding: "14px", borderRadius: "12px", color: "#fff", width: "100%", fontSize: "14px", outline: "none" },
    label: { color: "#444", fontSize: "11px", marginBottom: "8px", display: "block", fontWeight: "800" },
    dropdown: { position: "absolute", zIndex: 100, width: "100%", background: "#0c0c0c", border: "1px solid #222", borderRadius: "12px", maxHeight: "200px", overflowY: "auto", marginTop: "5px" },
    dropItem: { padding: "12px 15px", fontSize: "13px", cursor: "pointer", borderBottom: "1px solid #151515" },
    btn: { width: "100%", padding: "18px", background: "#DA251D", color: "#fff", border: "none", borderRadius: "14px", fontWeight: "900", cursor: "pointer", fontSize: "16px" }
  };

  return (
    <div style={s.container}>
      <div style={s.card}>
        {error && <div style={{ color: "#DA251D", marginBottom: "20px" }}>{error}</div>}
        <form onSubmit={handleSignup}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
             <h1 style={{ fontSize: '36px', fontWeight: '900' }}>Sangathan Setu</h1>
             <p style={{ color: '#DA251D', fontSize: '10px' }}>UP UNIT • SECURE ENROLLMENT</p>
          </div>

          <div style={s.secTitle}>1. Personal Profile</div>
          <div style={s.grid}>
            <div style={{ position: 'relative' }}>
              <label style={s.label}>Full Name *</label>
              <input required style={s.input} value={formData.fullName} onChange={(e)=>setFormData({...formData, fullName: e.target.value})} />
            </div>
            <div><label style={s.label}>Father's Name *</label><input required style={s.input} value={formData.fatherName} onChange={(e)=>setFormData({...formData, fatherName: e.target.value})} /></div>
            <div><label style={s.label}>Date of Birth *</label><input required type="date" style={s.input} value={formData.dob} onChange={(e)=>setFormData({...formData, dob: e.target.value})} /></div>
            <div><label style={s.label}>Primary Mobile *</label><input required style={s.input} value={formData.mobile} onChange={(e)=>setFormData({...formData, mobile: e.target.value})} maxLength="10" /></div>
            <div><label style={s.label}>WhatsApp</label><input style={s.input} value={formData.whatsapp} onChange={(e)=>setFormData({...formData, whatsapp: e.target.value})} /></div>
          </div>

          <div style={s.secTitle}>2. Residential</div>
          <div style={s.grid}>
            <div><label style={s.label}>Address Line 1 *</label><input required style={s.input} value={formData.address1} onChange={(e)=>setFormData({...formData, address1: e.target.value})} /></div>
            <div><label style={s.label}>Tehsil *</label><input required style={s.input} value={formData.tehsil} onChange={(e)=>setFormData({...formData, tehsil: e.target.value})} /></div>
            <div><label style={s.label}>Police Station</label><input style={s.input} value={formData.thana} onChange={(e)=>setFormData({...formData, thana: e.target.value})} /></div>
            <div><label style={s.label}>PinCode *</label><input required style={s.input} value={formData.pincode} onChange={(e)=>setFormData({...formData, pincode: e.target.value})} /></div>
          </div>

          <div style={s.secTitle}>3. Organization & Location</div>
          <div style={s.grid}>
            <div style={{ position: 'relative' }}>
              <label style={s.label}>Position *</label>
              <select required style={s.input} value={formData.position} onChange={(e)=>setFormData({...formData, position: e.target.value})}>
                <option value="">Select Position</option>
                <option value="BP">Booth President</option>
                <option value="BM">Booth Manager</option>
                <option value="JSS">Jansampark Sathi</option>
              </select>
            </div>
            
            {/* DISTRICT DROPDOWN */}
            <div style={{ position: 'relative' }}>
              <label style={s.label}>District *</label>
              <input type="text" style={s.input} placeholder="Search District..." value={distSearch} 
                onChange={(e)=>{setDistSearch(e.target.value); setIsDistOpen(true);}} onFocus={()=>setIsDistOpen(true)} />
              {isDistOpen && (
                <div style={s.dropdown}>
                  {filteredDistricts.map(d=>(<div key={d} style={s.dropItem} onClick={()=>handleDistSelect(d)}>{d}</div>))}
                </div>
              )}
            </div>

            {/* CONSTITUENCY DROPDOWN */}
            <div style={{ position: 'relative' }}>
              <label style={s.label}>Constituency *</label>
              <input type="text" style={s.input} placeholder={formData.district ? "Search AC..." : "Select District First"} 
                value={conSearch} disabled={!formData.district} 
                onChange={(e)=>{setConSearch(e.target.value); setIsConOpen(true);}} onFocus={()=>setIsConOpen(true)} />
              {isConOpen && formData.district && (
                <div style={s.dropdown}>
                  {filteredConstituencies.map(c=>(<div key={c} style={s.dropItem} onClick={()=>handleConSelect(c)}>{c}</div>))}
                </div>
              )}
            </div>

            <div><label style={s.label}>Booth No *</label><input required style={s.input} value={formData.boothNo} onChange={(e)=>setFormData({...formData, boothNo: e.target.value})} /></div>
          </div>

          <div style={s.secTitle}>4. Identity</div>
          <div style={s.grid}>
            <div><label style={s.label}>Voter ID (EPIC) *</label><input required style={s.input} value={formData.epic} onChange={(e)=>setFormData({...formData, epic: e.target.value})} /></div>
            <div><label style={s.label}>Education</label>
              <select style={s.input} value={formData.education} onChange={(e)=>setFormData({...formData, education: e.target.value})}>
                <option>Graduate</option>
                <option>12th</option>
              </select>
            </div>
          </div>

          <button type="submit" style={s.btn}>VERIFY & SUBMIT ENROLLMENT</button>
        </form>
      </div>
    </div>
  );
}