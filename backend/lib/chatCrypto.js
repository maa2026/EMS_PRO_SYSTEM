/**
 * EMS PRO 2026 — AES-256-CBC Chat & Voter Record Encryption
 * Used server-side for voter record field encryption.
 * Chat messages use the same key so frontend Web Crypto (AES-256-GCM) can
 * decrypt if needed; server stores ciphertext as received from frontend.
 */
const crypto = require('crypto');

const ALGO = 'aes-256-cbc';
const RAW_KEY = process.env.CHAT_SECRET_KEY || 'ems_pro_2026_chat_AES256key_32b!';
const KEY = Buffer.from(RAW_KEY.slice(0, 32), 'utf8'); // Always 32 bytes for AES-256

/**
 * Encrypt a plaintext string → "ivHex:ciphertextHex"
 */
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);
  const encrypted = cipher.update(String(text), 'utf8', 'hex') + cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt "ivHex:ciphertextHex" → original plaintext
 * Returns '[Protected]' if decryption fails (malformed / wrong key)
 */
function decrypt(encText) {
  try {
    const colonIdx = encText.indexOf(':');
    if (colonIdx === -1) return encText; // not encrypted
    const iv = Buffer.from(encText.slice(0, colonIdx), 'hex');
    const ciphertext = encText.slice(colonIdx + 1);
    const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
    return decipher.update(ciphertext, 'hex', 'utf8') + decipher.final('utf8');
  } catch {
    return '[Protected]';
  }
}

/**
 * Encrypt an object's specified fields in-place, returns new object.
 * Usage: encryptFields(voterDoc, ['aadhar', 'mobile', 'voter_id'])
 */
function encryptFields(obj, fields) {
  const out = { ...obj };
  for (const f of fields) {
    if (out[f] != null && out[f] !== '') {
      out[f] = encrypt(String(out[f]));
    }
  }
  return out;
}

/**
 * Decrypt an object's specified fields in-place, returns new object.
 */
function decryptFields(obj, fields) {
  const out = { ...obj };
  for (const f of fields) {
    if (out[f] && typeof out[f] === 'string' && out[f].includes(':')) {
      out[f] = decrypt(out[f]);
    }
  }
  return out;
}

module.exports = { encrypt, decrypt, encryptFields, decryptFields, KEY };
