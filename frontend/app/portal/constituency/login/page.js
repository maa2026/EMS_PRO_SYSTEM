"use client";

/**
 * ======================================================================
 * SYSTEM: EMS.UP CONSTITUENCY UNIT LOGIN
 * MODULE: CERTIFIED 403 AC MASTER NODE (REAL ECI DATA)
 * BRANDING: ADMIN RAM LAKHAN CYBER SECURITY Standard
 * ======================================================================
 */

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { LayoutGrid, Lock, User, ArrowLeft, Activity, ShieldAlert, Edit3, ChevronDown, Search } from "lucide-react";

export default function ConstituencyLogin() {
  const router = useRouter();
  const [isManual, setIsManual] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConst, setSelectedConst] = useState("");
  const dropdownRef = useRef(null);

  // --- OFFICIAL 403 CONSTITUENCIES (STRICT AS PER YOUR LIST) ---
  const allConstituencies = [
    "1 Behat", "2 Nakur", "3 Saharanpur Nagar", "4 Saharanpur", "5 Deoband", "6 Rampur Maniharan", "7 Gangoh", "8 Kairana", "9 Thana Bhawan", "10 Shamli", "11 Budhana", "12 Charthawal", "13 Purqazi", "14 Muzaffarnagar", "15 Khatauli", "16 Meerapur", "17 Najibabad", "18 Nagina", "19 Barhapur", "20 Dhampur", "21 Nehtaur", "22 Bijnor", "23 Chandpur", "24 Noorpur", "25 Kanth", "26 Thakurdwara", "27 Moradabad Rural", "28 Moradabad Nagar", "29 Kundarki", "30 Bilari", "31 Chandausi", "32 Asmoli", "33 Sambhal", "34 Suar", "35 Chamraua", "36 Bilaspur", "37 Rampur", "38 Milak", "39 Dhanaura", "40 Naugawan Sadat", "41 Amroha", "42 Hasanpur", "43 Siwalkhas", "44 Sardhana", "45 Hastinapur", "46 Kithore", "47 Meerut Cantt.", "48 Meerut", "49 Meerut South", "50 Chhaprauli", "51 Baraut", "52 Bagpat", "53 Loni", "54 Muradnagar", "55 Sahibabad", "56 Ghaziabad", "57 Modinagar", "58 Dhaulana", "59 Hapur", "60 Garhmukteshwar", "61 Noida", "62 Dadri", "63 Jewar", "64 Sikandrabad", "65 Bulandshahr", "66 Syana", "67 Anupshahr", "68 Debai", "69 Shikarpur", "70 Khurja", "71 Khair", "72 Barauli", "73 Atrauli", "74 Chharra", "75 Koil", "76 Aligarh", "77 Iglas", "78 Hathras", "79 Sadabad", "80 Sikandra Rao", "81 Chhata", "82 Mant", "83 Goverdhan", "84 Mathura", "85 Baldev", "86 Etmadpur", "87 Agra Cantt.", "88 Agra South", "89 Agra North", "90 Agra Rural", "91 Fatehpur Sikri", "92 Kheragarh", "93 Fatehabad", "94 Bah", "95 Tundla", "96 Jasrana", "97 Firozabad", "98 Shikohabad", "99 Sirsaganj", "100 Kasganj", "101 Amanpur", "102 Patiyali", "103 Aliganj", "104 Etah", "105 Marhara", "106 Jalesar", "107 Mainpuri", "108 Bhongaon", "109 Kishni", "110 Karhal", "111 Gunnaur", "112 Bisauli", "113 Sahaswan", "114 Bilsi", "115 Badaun", "116 Shekhupur", "117 Dataganj", "118 Baheri", "119 Meerganj", "120 Bhojipura", "121 Nawabganj", "122 Faridpur", "123 Bithari Chainpur", "124 Bareilly", "125 Bareilly Cantt.", "126 Aonla", "127 Pilibhit", "128 Barkhera", "129 Puranpur", "130 Bisalpur", "131 Katra", "132 Jalalabad", "133 Tilhar", "134 Powayan", "135 Shahjahanpur", "136 Dadraul", "137 Palia", "138 Nighasan", "139 Gola Gokrannath", "140 Sri Nagar", "141 Dhaurahra", "142 Lakhimpur", "143 Kasta", "144 Mohammdi", "145 Maholi", "146 Sitapur", "147 Hargaon", "148 Laharpur", "149 Biswan", "150 Sevata", "151 Mahmoodabad", "152 Sidhauli", "153 Misrikh", "154 Sawayajpur", "155 Shahabad", "156 Hardoi", "157 Gopamau", "158 Sandi", "159 Bilgram-Mallanwan", "160 Balamau", "161 Sandila", "162 Bangarmau", "163 Safipur", "164 Mohan", "165 Unnao", "166 Bhagwantnagar", "167 Purwa", "168 Malihabad", "169 Bakshi Kaa Talab", "170 Sarojini Nagar", "171 Lucknow West", "172 Lucknow North", "173 Lucknow East", "174 Lucknow Central", "175 Lucknow Cantonment", "176 Mohanlalganj", "177 Bachhrawan", "178 Tiloi", "179 Harchandpur", "180 Rae Bareli", "181 Salon", "182 Sareni", "183 Unchahar", "184 Jagdishpur", "185 Gauriganj", "186 Amethi", "187 Isauli", "188 Sultanpur", "189 Sultanpur Sadar", "190 Lambhua", "191 Kadipur", "192 Kaimganj", "193 Amritpur", "194 Farrukhabad", "195 Bhojpur", "196 Chhibramau", "197 Tirwa", "198 Kannauj", "199 Jaswantnagar", "200 Etawah", "201 Bharthana", "202 Bidhuna", "203 Dibiyapur", "204 Auraiya", "205 Rasulabad", "206 Akbarpur-Raniya", "207 Sikandra", "208 Bhognipur", "209 Bilhaur", "210 Bithoor", "211 Kalyanpur", "212 Govind Nagar", "213 Sishamau", "214 Arya Nagar", "215 Kidwai Nagar", "216 Kanpur Cantonment", "217 Maharajpur", "218 Ghatampur", "219 Madhogarh", "220 Kalpi", "221 Orai", "222 Babina", "223 Jhansi Nagar", "224 Mauranpur", "225 Garautha", "226 Lalitpur", "227 Mehroni", "228 Hamirpur", "229 Rath", "230 Mahoba", "231 Charkhari", "232 Tindwari", "233 Baberu", "234 Naraini", "235 Banda", "236 Chitrakoot", "237 Manikpur", "238 Jahanabad", "239 Bindki", "240 Fatehpur", "241 Ayah Shah", "242 Husainganj", "243 Khaga", "244 Rampur Khas", "245 Babaganj", "246 Kunda", "247 Vishwanathganj", "248 Pratapgarh", "249 Patti", "250 Raniganj", "251 Sirathu", "252 Manjhanpur", "253 Chail", "254 Phaphamau", "255 Soraon", "256 Phulpur", "257 Pratappur", "258 Handia", "259 Meja", "260 Karachhana", "261 Allahabad West", "262 Allahabad North", "263 Allahabad South", "264 Bara", "265 Koraon", "266 Kursi", "267 Ram Nagar", "268 Barabanki", "269 Zaidpur", "270 Dariyabad", "271 Rudauli", "272 Haidergarh", "273 Milkipur", "274 Bikapur", "275 Ayodhya", "276 Goshainganj", "277 Katehari", "278 Tanda", "279 Alapur", "280 Jalalpur", "281 Akbarpur", "282 Balha", "283 Nanpara", "284 Matera", "285 Mahasi", "286 Bahraich", "287 Payagpur", "288 Kaiserganj", "289 Bhinga", "290 Shrawasti", "291 Tulsipur", "292 Gainsari", "293 Utraula", "294 Balrampur", "295 Mehnaun", "296 Gonda", "297 Katra Bazar", "298 Colonelganj", "299 Tarabganj", "300 Mankapur", "301 Gaura", "302 Shohratgarh", "303 Kapilvastu", "304 Bansi", "305 Itwa", "306 Domariyaganj", "307 Harraiya", "308 Kaptanganj", "309 Rudhauli", "310 Basti Sadar", "311 Mahadewa", "312 Menhdawal", "313 Khalilabad", "314 Dhanghata", "315 Pharenda", "316 Nautanwa", "317 Siswa", "318 Maharajganj", "319 Paniyara", "320 Caimpiyarganj", "321 Pipraich", "322 Gorakhpur Urban", "323 Gorakhpur Rural", "324 Sahajanwa", "325 Khajani", "326 Chauri-Chaura", "327 Bansgaon", "328 Chillupar", "329 Khadda", "330 Padrauna", "331 Tamkuhi Raj", "332 Fazilnagar", "333 Kushinagar", "334 Hata", "335 Ramkola", "336 Rudrapur", "337 Deoria", "338 Pathardewa", "339 Rampur Karkhana", "340 Bhatpar Rani", "341 Salempur", "342 Barhaj", "343 Atrauliya", "344 Gopalpur", "345 Sagri", "346 Mubarakpur", "347 Azamgarh", "348 Nizamabad", "349 Phoolpur Pawai", "350 Didarganj", "351 Lalganj", "352 Mehnagar", "353 Madhuban", "354 Ghosi", "355 Muhammadabad-Gohna", "356 Mau", "357 Belthara Road", "358 Rasara", "359 Sikanderpur", "360 Phephana", "361 Ballia Nagar", "362 Bansdih", "363 Bairia", "364 Badlapur", "365 Shahganj", "366 Jaunpur", "367 Malhani", "368 Mungra Badshahpur", "369 Machhlishahr", "370 Mariyahu", "371 Zafrabad", "372 Kerakat", "373 Jakhanian", "374 Saidpur", "375 Ghazipur Sadar", "376 Jangipur", "377 Zahoorabad", "378 Mohammadabad", "379 Zamania", "380 Mughalsarai", "381 Sakaldiha", "382 Saiyadraja", "383 Chakia", "384 Pindra", "385 Ajagara", "386 Shivpur", "387 Rohaniya", "388 Varanasi North", "389 Varanasi South", "390 Varanasi Cantt.", "391 Sevapuri", "392 Bhadohi", "393 Gyanpur", "394 Aurai", "395 Chhanbey", "396 Mirzapur", "397 Majhawan", "398 Chunar", "399 Marihan", "400 Ghorawal", "401 Robertsganj", "402 Obra", "403 Duddhi"
  ];

  const filteredItems = allConstituencies.filter(c => 
    c.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const themeColor = "#FF5722"; // Neon Orange

  const s = {
    container: { backgroundColor: "#02040a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", padding: "20px" },
    glassCard: { background: "rgba(255, 255, 255, 0.02)", backdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "30px", borderRadius: "30px", width: "100%", maxWidth: "340px", textAlign: "center", boxShadow: "0 20px 40px rgba(0, 0, 0, 0.8)", zIndex: 10, display: "flex", flexDirection: "column" },
    inputGroup: { position: "relative", marginBottom: "12px", width: "100%" },
    inputIcon: { position: "absolute", left: "15px", top: "15px", opacity: 0.6, zIndex: 11 },
    field: { width: "100%", padding: "14px 14px 14px 45px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", color: "white", fontSize: "13px", outline: "none", boxSizing: "border-box", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" },
    scrollMenu: { position: "absolute", top: "100%", left: 0, right: 0, marginTop: "5px", background: "#0A0C10", border: `1px solid ${themeColor}4d`, borderRadius: "12px", maxHeight: "210px", overflowY: "auto", zIndex: 100 },
    searchBox: { width: "100%", padding: "10px 15px 10px 35px", background: "rgba(255,255,255,0.05)", border: "none", borderBottom: `1px solid ${themeColor}33`, color: "white", fontSize: "12px", outline: "none", position: "sticky", top: 0, zIndex: 101 },
    menuItem: { padding: "12px 15px", fontSize: "12px", color: "#ccc", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.05)", textAlign: "left", transition: "0.2s" },
    submitBtn: { width: "100%", padding: "14px", borderRadius: "100px", border: "none", backgroundColor: "white", color: "black", fontWeight: "900", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "10px", textTransform: "uppercase" },
    toggleLink: { background: "none", border: "none", color: themeColor, fontSize: "9px", fontWeight: "900", cursor: "pointer", marginBottom: "15px", textTransform: "uppercase", letterSpacing: "1px", opacity: 0.7 }
  };

  return (
    <div style={s.container}>
      <div style={{ position: "absolute", width: "300px", height: "300px", background: `radial-gradient(circle, ${themeColor}1a 0%, transparent 70%)`, top: "-5%", right: "-5%" }}></div>
      <motion.button onClick={() => router.push('/portal')} whileHover={{ x: -3 }} style={{ position: "absolute", top: "30px", left: "30px", background: "none", border: "none", color: "#444", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", zIndex: 20, fontSize: "11px", fontWeight: "bold" }}><ArrowLeft size={16} /> BACK</motion.button>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={s.glassCard}>
        <div style={{ marginBottom: "25px" }}>
          <div style={{ display: 'inline-flex', padding: '10px', borderRadius: '15px', background: `${themeColor}1a`, marginBottom: '15px', border: `1px solid ${themeColor}33` }}><ShieldAlert size={24} color={themeColor} /></div>
          <span style={{ color: themeColor, fontSize: "9px", fontWeight: "900", letterSpacing: "3px", display: "block", marginBottom: "5px", textTransform: "uppercase" }}>Constituency Unit (403 AC)</span>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "900", margin: 0, color: "#FFF", letterSpacing: "-1px" }}>EMS.UP</h1>
        </div>

        <button onClick={() => { setIsManual(!isManual); setIsOpen(false); }} style={s.toggleLink}>{isManual ? "Selection Mode" : "Manual Override"}</button>

        <form onSubmit={(e) => { e.preventDefault(); router.push('/portal/constituency'); }} style={{ width: "100%", display: "flex", flexDirection: "column" }}>
          <AnimatePresence mode="wait">
            {isManual ? (
              <motion.div key="manual" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={s.inputGroup}>
                <Edit3 size={16} style={s.inputIcon} color={themeColor} />
                <input type="text" placeholder="Enter AC Name/No..." required style={{...s.field, cursor: "text"}} />
              </motion.div>
            ) : (
              <motion.div key="list" ref={dropdownRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={s.inputGroup}>
                <LayoutGrid size={16} style={s.inputIcon} color={themeColor} />
                <div style={s.field} onClick={() => setIsOpen(!isOpen)}>
                  <span style={{ color: selectedConst ? "white" : "#666", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedConst || "FIND AC (NO. / NAME)"}</span>
                  <ChevronDown size={14} color={themeColor} style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "0.3s" }} />
                </div>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={s.scrollMenu} className="custom-scroll-orange">
                      <div style={{ position: "relative" }}>
                        <Search size={12} color={themeColor} style={{ position: "absolute", left: "12px", top: "12px", zIndex: 102 }} />
                        <input type="text" placeholder="Type No. or Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onClick={(e) => e.stopPropagation()} style={s.searchBox} />
                      </div>
                      {filteredItems.map((item) => (
                        <div key={item} style={s.menuItem} 
                          onClick={() => { setSelectedConst(item); setIsOpen(false); setSearchTerm(""); }}
                          onMouseEnter={(e) => e.target.style.background = `${themeColor}1a`}
                          onMouseLeave={(e) => e.target.style.background = "transparent"}
                        >
                          {item}
                        </div>
                      ))}
                      {filteredItems.length === 0 && <div style={{...s.menuItem, color: "#444", textAlign: "center"}}>No Match Found</div>}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={s.inputGroup}><User size={16} style={s.inputIcon} color={themeColor} /><input type="text" placeholder="Unit Commander ID" required style={{...s.field, cursor: "text"}} /></div>
          <div style={s.inputGroup}><Lock size={16} style={s.inputIcon} color={themeColor} /><input type="password" placeholder="Security Passcode" required style={{...s.field, cursor: "text"}} /></div>
          
          <motion.button type="submit" whileHover={{ scale: 1.01, backgroundColor: themeColor, color: "white" }} style={s.submitBtn}>
            INITIALIZE UNIT <Activity size={14} />
          </motion.button>
        </form>
      </motion.div>

      <style jsx global>{`
        .custom-scroll-orange::-webkit-scrollbar { width: 4px; }
        .custom-scroll-orange::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll-orange::-webkit-scrollbar-thumb { background: ${themeColor}; border-radius: 10px; }
      `}</style>
    </div>
  );
}