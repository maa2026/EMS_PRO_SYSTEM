# EMS PRO 2026 - Phase 1 Implementation

## Political Management System for Uttar Pradesh

**Target Scale:** 38.5 Lakh users, 25 Crore voter records on Centralized Single Super-Server

## 🏗️ Architecture Overview

### Tech Stack
- **Backend:** Node.js with Rust-based extensions (for heavy processing)
- **Database:** PostgreSQL with Citus extension (horizontal scaling)
- **Search:** ElasticSearch (Inverted Indexing)
- **Security:** AES-256 bit encryption
- **Frontend:** Next.js (existing implementation maintained)

### Database Schema (Citus-ready)

#### Geography Hierarchy
- **Zones:** 15 zones in UP
- **Districts:** 75 districts
- **Constituencies:** 403 constituencies (ACs)
- **Booths:** 1,77,516 booths

#### User Hierarchy (8-Level)
- **L0:** Super Admin (Supreme Authority)
- **L1:** State Admin
- **L2:** Zone Admin
- **L3:** District Admin
- **L4:** Constituency Admin (AC Admin)
- **L5:** Booth Manager (BM)
- **L6:** Booth President (BP)
- **L7:** Jan Sampark Sathi (JSS)

## 🚀 Phase 1 Features Implemented

### 1. Database Schema
- ✅ Complete relational schema with Citus distribution
- ✅ User hierarchy with role-based access
- ✅ Voter data with 25 crore record capacity
- ✅ Encryption functions for sensitive data
- ✅ Data masking for L7 users

### 2. Onboarding Workflow
- ✅ **Signup:** Biometric binding + Geo-fencing
- ✅ **3-Layer Verification:** L3 Verify → L1 Audit → L0 Approve
- ✅ **Unique IDs:** EMS-UP-XXXXXX format + Registration numbers
- ✅ **Supreme Override:** L0 can bypass any stage

### 3. Data Security
- ✅ AES-256 encryption for biometric data
- ✅ Data masking middleware (L7 sees 'XXXXXX')
- ✅ PostgreSQL pgcrypto extension integration

### 4. API Endpoints

#### User Management
```
POST /api/users/signup          - User registration
POST /api/users/login           - Authentication
POST /api/users/verify          - 3-layer verification
POST /api/users/supreme-override - L0 override
GET  /api/users/profile/:id     - User profile (masked)
GET  /api/users/verification-status/:id - Verification status
```

#### Voter Management
```
POST /api/voters                 - Create voter
GET  /api/voters/booth/:id       - Get voters by booth
PUT  /api/voters/:id/sentiment   - Update sentiment
GET  /api/voters/stats/:id       - Booth statistics
POST /api/voters/search          - Search voters
```

## 🛠️ Setup Instructions

### 1. Database Setup
```bash
# Create PostgreSQL database
createdb ems_pro_2026

# Run schema
psql -d ems_pro_2026 -f database/schema.sql
```

### 2. Environment Variables
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ems_pro_2026
DB_USER=postgres
DB_PASSWORD=your_password
ENCRYPTION_KEY=ems_pro_2026_32_byte_encryption_key_
PORT=5000
```

### 3. Install Dependencies
```bash
cd backend
npm install bcryptjs express express-validator pg cors dotenv
```

### 4. Start Server
```bash
npm start
```

## 🔐 Security Features

### Data Masking
- L7 users see 'XXXXXX' for mobile and Aadhaar fields
- Automatic masking via middleware
- Admin override available

### Encryption
- AES-256 for biometric data
- PostgreSQL pgcrypto functions
- Secure key management

### Access Control
- 8-level hierarchy enforcement
- Geo-fencing for constituency validation
- Supreme override for L0

## 📊 Data Flow

### User Onboarding
1. **Signup** → Biometric + Geo-fencing validation
2. **L3 Verification** → District-level approval
3. **L1 Audit** → State-level review
4. **L0 Approval** → Final activation
5. **Supreme Override** → Emergency L0 bypass

### Voter Data Management
- Family-based household grouping
- Sentiment tracking (Green/Yellow/Red)
- Issues/mudde collection
- Sathi-wise data collection

## 🚀 Scaling Strategy

### Citus Distribution
- Voters distributed by `booth_id`
- Users distributed by `user_id`
- 64 shards for high performance
- Replication factor of 2

### Performance Optimizations
- Indexes on frequently queried fields
- Partitioning for large tables
- Connection pooling
- Query optimization

## 📋 Next Phase Requirements

### Phase 2: Core Features
- ElasticSearch integration
- Rust extensions for heavy processing
- Real-time dashboard
- Chat system enhancement
- Bulk data import

### Phase 3: Advanced Features
- AI-powered sentiment analysis
- Predictive analytics
- Mobile app integration
- Multi-language support
- Advanced reporting

## 🤝 Integration with Existing System

The new PostgreSQL implementation works alongside existing MongoDB models:
- **MongoDB:** Legacy voter/worker data
- **PostgreSQL:** New EMS PRO 2026 data
- **Hybrid Approach:** Gradual migration path

## 📞 Support

For technical queries or deployment assistance:
- Database: PostgreSQL 13+ with Citus
- Node.js: 16+
- Memory: Minimum 16GB RAM for development
- Storage: Plan for 25 crore voter records

---

**Developed for:** Uttar Pradesh Political Management System
**Version:** EMS PRO 2026 - Phase 1
**Date:** March 2026