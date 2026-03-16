import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "welcome": "Welcome to EMS.UP!",
      "search_booth": "Search Booth",
      "voter_search": "Voter Search Portal",
      "state": "State",
      "district": "District",
      "constituency": "Constituency (AC)",
      "real_zone": "Real Zone (Database)",
      "total_db_records": "Total DB Records",
      "next_50": "Next 50",
      "login": "Login",
      "ground_work": "Ground Work",
      "control_units": "Control Units",
      "portals": "Portals",
      "system": "System",
      "landing_tagline": "UP ELECTION INFRASTRUCTURE 2026",
      "landing_desc_1": "Advanced Digital Governance for a New Era.",
      "landing_desc_2": "Secure. Transparent. Scalable.",
      "officer_login": "OFFICER LOGIN",
      "warriors_node": "WARRIORS NODE",
      "new_enrollment": "NEW ENROLLMENT",
      "footer_branding": "SAMAJWADI CLOUD © 2026"
    }
  },
  hi: {
    translation: {
      "welcome": "EMS.UP में आपका स्वागत है!",
      "search_booth": "बूथ खोजें",
      "voter_search": "मतदाता खोज पोर्टल",
      "state": "राज्य",
      "district": "जनपद",
      "constituency": "विधानसभा (AC)",
      "real_zone": "रीयल ज़ोन (डेटाबेस)",
      "total_db_records": "कुल DB रिकॉर्ड्स",
      "next_50": "अगले 50",
      "login": "लॉगिन",
      "ground_work": "ग्राउंड वर्क",
      "control_units": "कंट्रोल यूनिट्स",
      "portals": "पोर्टल्स",
      "system": "सिस्टम",
      "landing_tagline": "यूपी चुनाव इन्फ्रास्ट्रक्चर 2026",
      "landing_desc_1": "नई पीढ़ी के लिए उन्नत डिजिटल गवर्नेंस।",
      "landing_desc_2": "सुरक्षित। पारदर्शी। स्केलेबल।",
      "officer_login": "अधिकारी लॉगिन",
      "warriors_node": "योद्धा नोड",
      "new_enrollment": "नई प्रविष्टि",
      "footer_branding": "समाजवादी क्लाउड © 2026"
    }
  },
  ur: {
    translation: {
      "welcome": "ای ایم ایس ڈاٹ یو پی میں خوش آمدید!",
      "search_booth": "بووتھ تلاش کریں",
      "voter_search": "ووٹر تلاش پورٹل",
      "state": "ریاست",
      "district": "ضلع",
      "constituency": "اسمبلی حلقہ (AC)",
      "real_zone": "حقیقی زون (ڈیٹا بیس)",
      "total_db_records": "کل DB ریکارڈز",
      "next_50": "اگلے 50",
      "login": "لاگ ان",
      "ground_work": "گراؤنڈ ورک",
      "control_units": "کنٹرول یونٹس",
      "portals": "پورٹلز",
      "system": "سسٹم",
      "landing_tagline": "یوپی الیکشن انفراسٹرکچر 2026",
      "landing_desc_1": "نئی نسل کے لیے جدید ڈیجیٹل گورننس۔",
      "landing_desc_2": "محفوظ۔ شفاف۔ قابل توسیع۔",
      "officer_login": "آفیسر لاگ ان",
      "warriors_node": "وارئیرز نوڈ",
      "new_enrollment": "نئی رجسٹریشن",
      "footer_branding": "سماجوادی کلاؤڈ © 2026"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
