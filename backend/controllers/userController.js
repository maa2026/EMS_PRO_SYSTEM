const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pool = require('../config/database'); // Assuming you have a database config
const { validationResult } = require('express-validator');

// AES-256 Encryption Key (should be in environment variables)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'ems_pro_2026_32_byte_encryption_key_'; // 32 bytes
const IV_LENGTH = 16;

// Encryption functions
function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text) {
    const parts = text.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedText = Buffer.from(parts.join(':'), 'hex');
    const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
    let decrypted = decipher.update(encryptedText);
    decrypted += decipher.final('utf8');
    return decrypted;
}

// Generate unique EMS ID (matching existing format EMS-UP-XXXXXX)
async function generateEmsId() {
    const year = new Date().getFullYear();
    // Get next sequence number from database
    const result = await pool.query('SELECT nextval(\'ems_id_seq\') as seq');
    const seq = result.rows[0].seq;
    return `EMS-UP-${seq.toString().padStart(6, '0')}`;
}

// Generate unique registration number
async function generateRegistrationNumber() {
    const year = new Date().getFullYear();
    // Get next sequence number from database
    const result = await pool.query('SELECT nextval(\'registration_seq\') as seq');
    const seq = result.rows[0].seq;
    return `EMS-${year}-${seq.toString().padStart(6, '0')}`;
}

// User Signup with Biometric Binding and Geo-Fencing (matching existing Worker model)
exports.signup = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.is_empty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            username,
            email,
            phone,
            password,
            fullName,
            gender,
            religion,
            category,
            caste,
            subCaste,
            education,
            address,
            levelId,
            zoneId,
            districtId,
            constituencyId,
            boothId,
            biometricData, // Base64 encoded biometric data
            geoLocation // {lat, lng} for geo-fencing
        } = req.body;

        // Validate hierarchy constraints (matching existing logic)
        if (!validateHierarchy(levelId, { zoneId, districtId, constituencyId, boothId })) {
            return res.status(400).json({ error: 'Invalid hierarchy assignment for user level' });
        }

        // Geo-fencing check (constituency boundary check)
        const isWithinConstituency = await checkGeoFencing(constituencyId, geoLocation);
        if (!isWithinConstituency) {
            return res.status(403).json({ error: 'Location outside assigned constituency boundaries' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Encrypt biometric data
        const encryptedBiometric = biometricData ? encrypt(biometricData) : null;

        // Generate EMS ID and registration number
        const emsId = await generateEmsId();
        const registrationNumber = await generateRegistrationNumber();

        // Insert user (matching Worker model fields)
        const userQuery = `
            INSERT INTO users (
                ems_id, username, email, phone, password_hash, full_name,
                gender, religion, category, caste, sub_caste, education, address,
                level_id, zone_id, district_id, constituency_id, booth_id,
                biometric_data, geo_fence, registration_number
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
            RETURNING user_id, ems_id, registration_number
        `;

        const userValues = [
            emsId, username, email, phone, passwordHash, fullName,
            gender, religion, category, caste, subCaste, education, address,
            levelId, zoneId, districtId, constituencyId, boothId,
            encryptedBiometric, JSON.stringify(geoLocation), registrationNumber
        ];

        const userResult = await pool.query(userQuery, userValues);
        const userId = userResult.rows[0].user_id;

        // Initialize verification pipeline (L3 Verify → L1 Audit → L0 Approve)
        await initializeVerificationPipeline(userId, levelId);

        res.status(201).json({
            message: 'User registered successfully',
            userId,
            emsId,
            registrationNumber,
            status: 'Pending' // Matching existing stateStatus
        });

    } catch (error) {
        console.error('Signup error:', error);
        if (error.code === '23505') { // Unique constraint violation
            return res.status(409).json({ error: 'User already exists' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Initialize 3-layer verification pipeline
async function initializeVerificationPipeline(userId, levelId) {
    // L3 Verify → L1 Audit → L0 Approve
    const verificationLevels = [3, 1, 0]; // Reverse order for approval flow

    for (const verLevel of verificationLevels) {
        await pool.query(`
            INSERT INTO user_verifications (user_id, verification_level, status)
            VALUES ($1, $2, 'pending')
        `, [userId, verLevel]);
    }
}

// Verification endpoint (L3, L1, L0) - matching existing approval flow
exports.verifyUser = async (req, res) => {
    try {
        const { userId, verificationLevel, action, comments } = req.body;
        const verifiedBy = req.user.userId; // From auth middleware

        // Check if verifier has permission
        const verifierLevel = req.user.levelId;
        if (verifierLevel !== verificationLevel) {
            return res.status(403).json({ error: 'Unauthorized verification level' });
        }

        const status = action === 'approve' ? 'verified' : 'rejected';

        // Update verification status
        await pool.query(`
            UPDATE user_verifications
            SET status = $1, verified_by = $2, comments = $3, verified_at = CURRENT_TIMESTAMP
            WHERE user_id = $4 AND verification_level = $5
        `, [status, verifiedBy, comments, userId, verificationLevel]);

        // If L0 approves, set stateStatus to Verified
        if (verificationLevel === 0 && action === 'approve') {
            await pool.query(`
                UPDATE users SET state_status = 'Verified' WHERE user_id = $1
            `, [userId]);
        }

        // Check if all verifications are complete
        const verifications = await pool.query(`
            SELECT status FROM user_verifications WHERE user_id = $1
        `, [userId]);

        const allVerified = verifications.rows.every(v => v.status === 'verified');

        if (allVerified) {
            await pool.query(`
                UPDATE users SET state_status = 'Verified' WHERE user_id = $1
            `, [userId]);
        }

        res.json({ message: `User ${action}d at level ${verificationLevel}` });

    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Supreme Override (L0 only) - matching existing supreme authority
exports.supremeOverride = async (req, res) => {
    try {
        const { userId, action, reason } = req.body;
        const adminId = req.user.userId;

        // Only L0 can override
        if (req.user.levelId !== 0) {
            return res.status(403).json({ error: 'Supreme override requires L0 access' });
        }

        // Mark all verifications as overridden
        await pool.query(`
            UPDATE user_verifications
            SET status = 'overridden', verified_by = $1, comments = $2, verified_at = CURRENT_TIMESTAMP
            WHERE user_id = $3
        `, [adminId, `Supreme Override: ${reason}`, userId]);

        // Set user stateStatus
        const newStatus = action === 'approve' ? 'Verified' : 'Rejected';
        await pool.query(`
            UPDATE users SET state_status = $1 WHERE user_id = $2
        `, [newStatus, userId]);

        res.json({ message: `Supreme override executed: ${action}` });

    } catch (error) {
        console.error('Supreme override error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Login endpoint (matching existing authRoutes.js)
exports.login = async (req, res) => {
    try {
        const { emsId, password } = req.body;

        if (!emsId || !password) {
            return res.status(400).json({ success: false, message: "EMS ID and Password required" });
        }

        // Find user by EMS ID
        const userResult = await pool.query(`
            SELECT u.*, ul.level_code,
                   z.zone_name, d.district_name, c.constituency_name, b.booth_name
            FROM users u
            JOIN user_levels ul ON u.level_id = ul.level_id
            LEFT JOIN zones z ON u.zone_id = z.zone_id
            LEFT JOIN districts d ON u.district_id = d.district_id
            LEFT JOIN constituencies c ON u.constituency_id = c.constituency_id
            LEFT JOIN booths b ON u.booth_id = b.booth_id
            WHERE u.ems_id = $1
        `, [emsId]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Invalid EMS ID" });
        }

        const user = userResult.rows[0];

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ success: false, message: "Incorrect Password" });
        }

        // Update last login
        await pool.query(`
            UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1
        `, [user.user_id]);

        // Return user data matching existing login response
        res.json({
            success: true,
            user: {
                id: user.user_id,
                name: user.full_name,
                role: user.level_code, // L0, L4, L5, L6, L7
                zone: user.zone_name || "N/A",
                district: user.district_name || "N/A",
                ac: user.constituency_name || "N/A",
                booth: user.booth_name || "N/A"
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Get user profile with data masking
exports.getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const requesterLevel = req.user.levelId;

        const result = await pool.query(`
            SELECT u.*, ul.level_name, ul.level_code,
                   mask_sensitive_data($2, u.phone) as masked_phone,
                   mask_sensitive_data($2, decrypt_data(u.biometric_data)) as masked_biometric
            FROM users u
            JOIN user_levels ul ON u.level_id = ul.level_id
            WHERE u.user_id = $1
        `, [userId, requesterLevel]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get verification status
exports.getVerificationStatus = async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await pool.query(`
            SELECT uv.*, u.full_name as verified_by_name, ul.level_name, ul.level_code
            FROM user_verifications uv
            LEFT JOIN users u ON uv.verified_by = u.user_id
            JOIN user_levels ul ON uv.verification_level = ul.level_id
            WHERE uv.user_id = $1
            ORDER BY uv.verification_level
        `, [userId]);

        res.json(result.rows);

    } catch (error) {
        console.error('Get verification status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Helper functions
function validateHierarchy(levelId, geography) {
    const { zoneId, districtId, constituencyId, boothId } = geography;

    switch (levelId) {
        case 0: return true; // Super Admin - no restrictions
        case 1: return zoneId != null;
        case 2: return zoneId != null;
        case 3: return districtId != null;
        case 4: return constituencyId != null;
        case 5: return boothId != null;
        case 6: return boothId != null;
        case 7: return boothId != null;
        default: return false;
    }
}

async function checkGeoFencing(constituencyId, geoLocation) {
    // Get constituency boundaries from database
    const result = await pool.query(`
        SELECT geo_fence FROM constituencies WHERE constituency_id = $1
    `, [constituencyId]);

    if (!result.rows[0]?.geo_fence) {
        return true; // No geo-fencing defined, allow
    }

    const boundaries = result.rows[0].geo_fence;
    // Implement point-in-polygon check
    return isPointInPolygon(geoLocation, boundaries);
}

function isPointInPolygon(point, polygon) {
    // Simplified point-in-polygon algorithm
    const { lat, lng } = point;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i][1], yi = polygon[i][0];
        const xj = polygon[j][1], yj = polygon[j][0];

        if (((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
            inside = !inside;
        }
    }

    return inside;
}