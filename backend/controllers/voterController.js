const pool = require('../config/database');
const Redis = require('ioredis');

// Redis cache for smart queries (optional, speeds up repeated searches)
const cache = new Redis();

// Voter data operations for EMS PRO 2026
exports.createVoter = async (req, res) => {
    try {
        const {
            familyId,
            name,
            dob,
            age,
            gender,
            mobile,
            aadhaar,
            address,
            boothId,
            constituencyId,
            districtId,
            zoneId,
            category,
            subCaste,
            employment,
            grievances,
            sentiment
        } = req.body;

        const sathiId = req.user.userId; // From auth middleware

        // Insert voter data
        const voterQuery = `
            INSERT INTO voters (
                family_id, name, dob, age, gender, mobile, aadhaar, address,
                booth_id, constituency_id, district_id, zone_id, sathi_id,
                category, sub_caste, employment, grievances, sentiment
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            RETURNING voter_id, family_id
        `;

        const voterValues = [
            familyId, name, dob, age, gender, mobile, aadhaar, address,
            boothId, constituencyId, districtId, zoneId, sathiId,
            category, subCaste, employment, grievances, sentiment
        ];

        const result = await pool.query(voterQuery, voterValues);

        res.status(201).json({
            message: 'Voter registered successfully',
            voterId: result.rows[0].voter_id,
            familyId: result.rows[0].family_id
        });

    } catch (error) {
        console.error('Create voter error:', error);
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Voter already exists' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getVotersByBooth = async (req, res) => {
    try {
        const { boothId } = req.params;
        const userLevel = req.user?.levelId || 1;

        let query;
        let params;

        if (userLevel === 7) {
            // L7 users see masked data
            query = `
                SELECT
                    voter_id, family_id, name, age, gender, address,
                    category, sub_caste, employment, grievances, sentiment,
                    'XXXXXX' as mobile, 'XXXXXX' as aadhaar,
                    created_at
                FROM voters
                WHERE booth_id = $1 AND status = 'Verified'
                ORDER BY family_id, name
            `;
            params = [boothId];
        } else {
            // Higher level users see full data
            query = `
                SELECT
                    v.*, b.booth_name, c.constituency_name, d.district_name, z.zone_name,
                    u.full_name as collected_by
                FROM voters v
                LEFT JOIN booths b ON v.booth_id = b.booth_id
                LEFT JOIN constituencies c ON v.constituency_id = c.constituency_id
                LEFT JOIN districts d ON v.district_id = d.district_id
                LEFT JOIN zones z ON v.zone_id = z.zone_id
                LEFT JOIN users u ON v.sathi_id = u.user_id
                WHERE v.booth_id = $1 AND v.status = 'Verified'
                ORDER BY v.family_id, v.name
            `;
            params = [boothId];
        }

        const result = await pool.query(query, params);
        res.json(result.rows);

    } catch (error) {
        console.error('Get voters by booth error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateVoterSentiment = async (req, res) => {
    try {
        const { voterId } = req.params;
        const { sentiment, issues } = req.body;
        const updatedBy = req.user?.userId || null;

        // Update voter sentiment and issues
        await pool.query(`
            UPDATE voters
            SET sentiment = $1, grievances = $2, last_updated = CURRENT_TIMESTAMP
            WHERE voter_id = $3
        `, [sentiment, issues, voterId]);

        // Log the change
        await pool.query(`
            INSERT INTO voter_history (voter_id, changed_by, change_type, old_values, new_values)
            VALUES ($1, $2, 'sentiment_update', '{}', $3)
        `, [voterId, updatedBy, JSON.stringify({ sentiment, issues })]);

        res.json({ message: 'Voter sentiment updated successfully' });

    } catch (error) {
        console.error('Update voter sentiment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getVoterStats = async (req, res) => {
    try {
        const { boothId } = req.params;

        const statsQuery = `
            SELECT
                COUNT(*) as total_voters,
                COUNT(CASE WHEN sentiment = 'green' THEN 1 END) as green_count,
                COUNT(CASE WHEN sentiment = 'yellow' THEN 1 END) as yellow_count,
                COUNT(CASE WHEN sentiment = 'red' THEN 1 END) as red_count,
                COUNT(CASE WHEN age >= 18 AND age < 30 THEN 1 END) as young_voters,
                COUNT(CASE WHEN age >= 30 AND age < 50 THEN 1 END) as middle_aged,
                COUNT(CASE WHEN age >= 50 THEN 1 END) as senior_voters,
                COUNT(CASE WHEN category = 'SC' THEN 1 END) as sc_count,
                COUNT(CASE WHEN category = 'ST' THEN 1 END) as st_count,
                COUNT(CASE WHEN category = 'OBC' THEN 1 END) as obc_count
            FROM voters
            WHERE booth_id = $1 AND status = 'Verified' AND is_eligible = true
        `;

        const result = await pool.query(statsQuery, [boothId]);
        res.json(result.rows[0]);

    } catch (error) {
        console.error('Get voter stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.searchVoters = async (req, res) => {
    try {
        const { query, boothId, limit = 50 } = req.body;
        const userLevel = req.user?.levelId || 1;

        let searchQuery;
        let params;

        if (userLevel === 7) {
            // L7 users see masked data
            searchQuery = `
                SELECT
                    voter_id, family_id, name, age, gender, address,
                    category, sub_caste, employment, sentiment,
                    'XXXXXX' as mobile, 'XXXXXX' as aadhaar
                FROM voters
                WHERE booth_id = $1 AND status = 'Verified'
                AND (name ILIKE $2 OR family_id ILIKE $2 OR voter_id_number ILIKE $2)
                ORDER BY name
                LIMIT $3
            `;
            params = [boothId, `%${query}%`, limit];
        } else {
            // Higher level users see full data
            searchQuery = `
                SELECT
                    v.*, b.booth_name, c.constituency_name
                FROM voters v
                LEFT JOIN booths b ON v.booth_id = b.booth_id
                LEFT JOIN constituencies c ON v.constituency_id = c.constituency_id
                WHERE v.booth_id = $1 AND v.status = 'Verified'
                AND (v.name ILIKE $2 OR v.family_id ILIKE $2 OR v.voter_id_number ILIKE $2)
                ORDER BY v.name
                LIMIT $3
            `;
            params = [boothId, `%${query}%`, limit];
        }

    } catch (error) {
        console.error('Get voter stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Advanced Smart Search and Filter for Voters
exports.smartSearchVoters = async (req, res) => {
    try {
        const {
            query, // Search text
            boothId,
            constituencyId,
            districtId,
            zoneId,
            filters = {}, // Advanced filters object
            sortBy = 'name',
            sortOrder = 'ASC',
            page = 1,
            limit = 50,
            includeStats = false
        } = req.body;

        const userLevel = req.user?.levelId || 1; // Default to admin level if no auth
        const userId = req.user?.userId || null;
        const offset = (page - 1) * limit;
        const useCache = req.body.useCache !== false; // default true

        // Cache key (includes filters + pagination + user level)
        const cacheKey = `smartSearch:${userLevel}:${boothId || 'all'}:${constituencyId || 'all'}:${districtId || 'all'}:${zoneId || 'all'}:${query || ''}:${JSON.stringify(filters)}:${sortBy}:${sortOrder}:${page}:${limit}`;

        if (useCache) {
            const cached = await cache.get(cacheKey);
            if (cached) {
                return res.json(JSON.parse(cached));
            }
        }

        // Build dynamic WHERE conditions
        let whereConditions = ['v.status = \'Verified\''];
        let params = [];
        let paramIndex = 1;

        // Access control based on user level
        if (userLevel === 7) {
            // Booth level users can only see their booth
            whereConditions.push(`v.booth_id = $${paramIndex}`);
            params.push(boothId);
            paramIndex++;
        } else if (boothId) {
            whereConditions.push(`v.booth_id = $${paramIndex}`);
            params.push(boothId);
            paramIndex++;
        }

        // Geographic filters
        if (constituencyId) {
            whereConditions.push(`v.constituency_id = $${paramIndex}`);
            params.push(constituencyId);
            paramIndex++;
        }
        if (districtId) {
            whereConditions.push(`v.district_id = $${paramIndex}`);
            params.push(districtId);
            paramIndex++;
        }
        if (zoneId) {
            whereConditions.push(`v.zone_id = $${paramIndex}`);
            params.push(zoneId);
            paramIndex++;
        }

        // Smart search query
        if (query && query.trim()) {
            const searchTerm = query.trim();
            const searchConditions = [];

            // Fuzzy search on multiple fields
            searchConditions.push(`v.name ILIKE $${paramIndex}`);
            params.push(`%${searchTerm}%`);
            paramIndex++;

            searchConditions.push(`v.family_id ILIKE $${paramIndex}`);
            params.push(`%${searchTerm}%`);
            paramIndex++;

            searchConditions.push(`v.voter_id_number ILIKE $${paramIndex}`);
            params.push(`%${searchTerm}%`);
            paramIndex++;

            // Search in address
            searchConditions.push(`v.address ILIKE $${paramIndex}`);
            params.push(`%${searchTerm}%`);
            paramIndex++;

            // Search in mobile (partial match)
            searchConditions.push(`v.mobile ILIKE $${paramIndex}`);
            params.push(`%${searchTerm}%`);
            paramIndex++;

            whereConditions.push(`(${searchConditions.join(' OR ')})`);
        }

        // Advanced filters
        if (filters.ageMin) {
            whereConditions.push(`v.age >= $${paramIndex}`);
            params.push(filters.ageMin);
            paramIndex++;
        }
        if (filters.ageMax) {
            whereConditions.push(`v.age <= $${paramIndex}`);
            params.push(filters.ageMax);
            paramIndex++;
        }
        if (filters.gender && filters.gender !== 'all') {
            whereConditions.push(`v.gender = $${paramIndex}`);
            params.push(filters.gender);
            paramIndex++;
        }
        if (filters.category && filters.category !== 'all') {
            whereConditions.push(`v.category = $${paramIndex}`);
            params.push(filters.category);
            paramIndex++;
        }
        if (filters.sentiment && filters.sentiment !== 'all') {
            whereConditions.push(`v.sentiment = $${paramIndex}`);
            params.push(filters.sentiment);
            paramIndex++;
        }
        if (filters.employment && filters.employment !== 'all') {
            whereConditions.push(`v.employment = $${paramIndex}`);
            params.push(filters.employment);
            paramIndex++;
        }
        if (filters.subCaste) {
            whereConditions.push(`v.sub_caste ILIKE $${paramIndex}`);
            params.push(`%${filters.subCaste}%`);
            paramIndex++;
        }
        if (filters.hasGrievances !== undefined) {
            if (filters.hasGrievances) {
                whereConditions.push(`v.grievances IS NOT NULL AND v.grievances != ''`);
            } else {
                whereConditions.push(`(v.grievances IS NULL OR v.grievances = '')`);
            }
        }

        // Date range filters
        if (filters.createdAfter) {
            whereConditions.push(`v.created_at >= $${paramIndex}`);
            params.push(filters.createdAfter);
            paramIndex++;
        }
        if (filters.createdBefore) {
            whereConditions.push(`v.created_at <= $${paramIndex}`);
            params.push(filters.createdBefore);
            paramIndex++;
        }

        const whereClause = whereConditions.join(' AND ');

        // Build SELECT based on user level
        let selectFields;
        if (userLevel === 7) {
            // Masked data for L7 users
            selectFields = `
                v.voter_id, v.family_id, v.name, v.age, v.gender, v.address,
                v.category, v.sub_caste, v.employment, v.sentiment, v.created_at,
                'XXXXXX' as mobile, 'XXXXXX' as aadhaar,
                CASE WHEN v.grievances IS NOT NULL AND v.grievances != '' THEN 'Yes' ELSE 'No' END as has_grievances
            `;
        } else {
            // Full data for higher level users
            selectFields = `
                v.*, b.booth_name, c.constituency_name, d.district_name, z.zone_name,
                u.full_name as collected_by,
                CASE WHEN v.grievances IS NOT NULL AND v.grievances != '' THEN 'Yes' ELSE 'No' END as has_grievances
            `;
        }

        // Sorting validation
        const allowedSortFields = ['name', 'age', 'created_at', 'family_id', 'sentiment'];
        const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'name';
        const safeSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

        // Main query
        const mainQuery = `
            SELECT ${selectFields}
            FROM voters v
            LEFT JOIN booths b ON v.booth_id = b.booth_id
            LEFT JOIN constituencies c ON v.constituency_id = c.constituency_id
            LEFT JOIN districts d ON v.district_id = d.district_id
            LEFT JOIN zones z ON v.zone_id = z.zone_id
            LEFT JOIN users u ON v.sathi_id = u.user_id
            WHERE ${whereClause}
            ORDER BY v.${safeSortBy} ${safeSortOrder}
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;
        params.push(limit, offset);

        // Count query for pagination
        const countQuery = `
            SELECT COUNT(*) as total
            FROM voters v
            WHERE ${whereClause.replace(/v\./g, '')}
        `;

        // Execute queries
        const [mainResult, countResult] = await Promise.all([
            pool.query(mainQuery, params),
            pool.query(countQuery, params.slice(0, -2)) // Remove limit and offset
        ]);

        const totalRecords = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(totalRecords / limit);

        let response = {
            data: mainResult.rows,
            pagination: {
                currentPage: page,
                totalPages,
                totalRecords,
                limit,
                hasNext: page < totalPages,
                hasPrev: page > 1
            },
            filters: {
                applied: Object.keys(filters).length > 0,
                query: query || null
            }
        };

        // Include stats if requested
        if (includeStats) {
            const statsQuery = `
                SELECT
                    COUNT(*) as total_filtered,
                    COUNT(CASE WHEN sentiment = 'green' THEN 1 END) as green_count,
                    COUNT(CASE WHEN sentiment = 'yellow' THEN 1 END) as yellow_count,
                    COUNT(CASE WHEN sentiment = 'red' THEN 1 END) as red_count,
                    AVG(age) as avg_age,
                    COUNT(CASE WHEN gender = 'M' THEN 1 END) as male_count,
                    COUNT(CASE WHEN gender = 'F' THEN 1 END) as female_count
                FROM voters v
                WHERE ${whereClause}
            `;
            const statsResult = await pool.query(statsQuery, params.slice(0, -2));
            response.stats = statsResult.rows[0];
        }

        res.json(response);

        // Cache the response for repeated search patterns (short TTL)
        if (useCache) {
            cache.set(cacheKey, JSON.stringify(response), 'EX', 30).catch(() => {
                // ignore cache set failures
            });
        }

    } catch (error) {
        console.error('Smart search voters error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get filter options for smart search
exports.getFilterOptions = async (req, res) => {
    try {
        const { boothId, constituencyId, districtId, zoneId } = req.query;
        const userLevel = req.user?.levelId || 1;

        let whereConditions = ['status = \'Verified\''];
        let params = [];
        let paramIndex = 1;

        // Access control
        if (userLevel === 7) {
            whereConditions.push(`booth_id = $${paramIndex}`);
            params.push(boothId);
            paramIndex++;
        } else if (boothId) {
            whereConditions.push(`booth_id = $${paramIndex}`);
            params.push(boothId);
            paramIndex++;
        }

        if (constituencyId) {
            whereConditions.push(`constituency_id = $${paramIndex}`);
            params.push(constituencyId);
            paramIndex++;
        }
        if (districtId) {
            whereConditions.push(`district_id = $${paramIndex}`);
            params.push(districtId);
            paramIndex++;
        }
        if (zoneId) {
            whereConditions.push(`zone_id = $${paramIndex}`);
            params.push(zoneId);
            paramIndex++;
        }

        const whereClause = whereConditions.join(' AND ');

        // Get distinct values for filters
        const [categories, subCastes, employments, sentiments] = await Promise.all([
            pool.query(`SELECT DISTINCT category FROM voters WHERE ${whereClause} AND category IS NOT NULL ORDER BY category`, params),
            pool.query(`SELECT DISTINCT sub_caste FROM voters WHERE ${whereClause} AND sub_caste IS NOT NULL ORDER BY sub_caste`, params),
            pool.query(`SELECT DISTINCT employment FROM voters WHERE ${whereClause} AND employment IS NOT NULL ORDER BY employment`, params),
            pool.query(`SELECT DISTINCT sentiment FROM voters WHERE ${whereClause} AND sentiment IS NOT NULL ORDER BY sentiment`, params)
        ]);

        res.json({
            categories: categories.rows.map(r => r.category),
            subCastes: subCastes.rows.map(r => r.sub_caste),
            employments: employments.rows.map(r => r.employment),
            sentiments: sentiments.rows.map(r => r.sentiment),
            ageRange: { min: 18, max: 100 }, // Default range
            genders: ['M', 'F', 'O']
        });

    } catch (error) {
        console.error('Get filter options error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};