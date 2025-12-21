# Backend Code Review - EventGo

**Review Date:** December 17, 2025  
**Reviewer:** AI Code Reviewer  
**Codebase:** EventGo Backend (Node.js + Express + PostgreSQL)

---

## Executive Summary

The backend codebase demonstrates solid fundamentals with good validation, sanitization, and API documentation. However, there are several **critical security issues** and **architectural improvements** needed before production deployment.

**Overall Rating:** ⚠️ **6.5/10** - Good foundation, needs security hardening

---

## 🔴 Critical Issues (Must Fix Before Production)

### 1. **Missing Dependencies in package.json**
**Severity:** 🔴 CRITICAL  
**Files:** `backend/package.json`, `backend/utils/auth.js`

**Issue:**
- `bcrypt` and `jsonwebtoken` are imported and used but **NOT listed** in `package.json` dependencies
- This will cause runtime errors in fresh installs

**Impact:**
```javascript
// backend/utils/auth.js uses:
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// But package.json is MISSING these packages!
```

**Fix:**
```bash
npm install bcrypt jsonwebtoken
```

**Why Critical:** Application won't start without these packages.

---

### 2. **No Global Error Handler**
**Severity:** 🔴 CRITICAL  
**Files:** `backend/index.js`

**Issue:**
- No centralized error handling middleware
- All routes use `next(err)` but there's no error handler to catch them
- Errors may expose stack traces and sensitive data to clients

**Current:**
```javascript
// Every route does this:
} catch (err) {
  console.error("Error:", err);
  next(err); // ❌ No handler configured!
}
```

**Fix:**
```javascriptF
// Add at the end of index.js (after all routes)
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  // Don't expose internal errors in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
    
  res.status(err.statusCode || 500).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});
```

**Why Critical:** Unhandled errors crash the server or leak sensitive information.

---

### 3. **No Rate Limiting**
**Severity:** 🔴 CRITICAL  
**Files:** `backend/index.js`, all route files

**Issue:**
- No protection against brute force attacks on login/registration
- No API rate limiting → vulnerable to DoS attacks
- Anyone can spam expensive database queries

**Fix:**
```bash
npm install express-rate-limit
```

```javascript
// backend/index.js
import rateLimit from 'express-rate-limit';

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later'
});

// Stricter limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Only 5 login attempts per 15 minutes
  skipSuccessfulRequests: true
});

app.use('/api/', apiLimiter);
app.use('/users/login', authLimiter);
app.use('/users/register', authLimiter);
```

**Why Critical:** Prevents brute force attacks and API abuse.

---

### 4. **Database Connection Pool Not Configured**
**Severity:** 🟡 HIGH  
**Files:** `backend/db.js`

**Issue:**
- No connection pool limits set
- No error handling for connection failures
- No retry logic

**Current:**
```javascript
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  // ❌ No pool configuration!
});
```

**Fix:**
```javascript
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Handle connection errors
pool.on('error', (err, client) => {
  console.error('Unexpected database error:', err);
  process.exit(-1);
});

// Test connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(-1);
  }
  console.log('✅ Database connected successfully');
});
```

**Why High Priority:** Poor connection management leads to memory leaks and crashes under load.

---

### 5. **JWT Secret Hardcoded Risk**
**Severity:** 🟡 HIGH  
**Files:** `backend/utils/auth.js`

**Issue:**
- JWT_SECRET validation happens at import time
- Error if missing, but no guidance on generating secure secrets
- No warning about secret strength

**Current:**
```javascript
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable must be set');
}
```

**Improvement:**
```javascript
if (!process.env.JWT_SECRET) {
  throw new Error(
    'JWT_SECRET environment variable must be set\n' +
    'Generate with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"'
  );
}

if (process.env.JWT_SECRET.length < 32) {
  console.warn('⚠️  WARNING: JWT_SECRET is too short. Use at least 32 characters.');
}
```

**Additional Fix:**
- Add `.env.example` file with documentation

---

### 6. **No .env File / Configuration Management**
**Severity:** 🟡 HIGH  
**Files:** Missing `.env`, `.env.example`

**Issue:**
- No example environment file for developers
- No documentation on required environment variables

**Fix:**
Create `backend/.env.example`:
```env
# Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=eventgo
DB_PASSWORD=your_secure_password
DB_PORT=5432

# JWT Configuration (generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=your_very_long_random_secret_key_here_minimum_32_characters

# Server Configuration
PORT=5000
NODE_ENV=development
```

Update `.gitignore`:
```
.env
.env.local
.env.production
```

---

## 🟡 High Priority Issues

### 7. **Inconsistent Error Messages**
**Severity:** 🟡 HIGH  
**Files:** All route files

**Issue:**
- Mix of Slovenian and English error messages
- Inconsistent formatting

**Examples:**
```javascript
// Slovenian
"Uporabnik s tem e-naslovom že obstaja!"
"Napaka pri GET /events:"

// English
"User does not exist!"
"Error in GET /events:"
```

**Fix:**
- Pick ONE language for all user-facing messages
- Use i18n library for multi-language support if needed
- Keep all error logging in English

---

### 8. **SQL Injection Prevention Not Fully Audited**
**Severity:** 🟡 HIGH  
**Files:** All route files

**Good News:** ✅ All queries use parameterized statements (`$1`, `$2`)

**Audit Needed:**
- Dynamic query building in `events.js` (lines 60-165)
- String interpolation in WHERE clauses should be reviewed

**Example (currently safe but fragile):**
```javascript
// This is safe because params are used
queryText += ` AND LOWER(e.title) LIKE $${paramCount}`;
params.push(`%${search.toLowerCase()}%`);
```

**Recommendation:**
- Add automated SQL injection tests
- Consider using a query builder (e.g., Knex.js)

---

### 9. **No Logging Infrastructure**
**Severity:** 🟡 HIGH  
**Files:** All files using `console.error/log`

**Issue:**
- 30+ `console.error()` statements throughout codebase
- No structured logging
- No log rotation or persistence
- No correlation IDs for request tracking

**Fix:**
```bash
npm install winston
```

```javascript
// backend/utils/logger.js
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'eventgo-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
```

Replace all `console.error()` with `logger.error()`.

---

### 10. **Token Expiry Too Short**
**Severity:** 🟡 MEDIUM  
**Files:** `backend/utils/auth.js`

**Issue:**
```javascript
{ expiresIn: '1h' } // Access token expires in 1 hour
```

**Problem:**
- Users logged out every hour is poor UX
- Refresh token exists but no refresh endpoint implemented properly

**Recommendation:**
- Access token: 15 minutes (short-lived)
- Refresh token: 7 days (current)
- Implement automatic token refresh on frontend
- Add refresh token rotation for security

---

### 11. **Race Conditions in Ticket Purchases**
**Severity:** 🟡 MEDIUM  
**Files:** `backend/routes/tickets.js`

**Issue:**
```javascript
// Lines 445-543: Ticket purchase transaction
const { total_tickets, tickets_sold } = typeCheck.rows[0];
const available = total_tickets - tickets_sold;

if (available < validQuantity) {
  // ❌ Race condition possible here!
}
```

**Problem:**
- Two simultaneous purchases might both pass the availability check
- Database transactions help but need row-level locking

**Fix:**
```javascript
// Use SELECT FOR UPDATE to lock the row
const typeCheck = await client.query(
  `SELECT total_tickets, tickets_sold, price 
   FROM ticket_types 
   WHERE id = $1 
   FOR UPDATE`,
  [validTicketTypeId]
);
```

---

### 12. **No Request Validation on File Size**
**Severity:** 🟡 MEDIUM  
**Files:** `backend/index.js`

**Issue:**
```javascript
app.use(express.json()); // ❌ No size limit!
```

**Problem:**
- Large JSON payloads can crash server (DoS)

**Fix:**
```javascript
app.use(express.json({ limit: '10mb' })); // Set reasonable limit
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

---

## 🔵 Medium Priority Issues

### 13. **No Input Sanitization for Description Fields**
**Severity:** 🔵 MEDIUM  
**Files:** `backend/middleware/validation.js`

**Issue:**
- `sanitizeHtml()` function exists but may not catch all XSS vectors
- Event descriptions allow 5000 characters without HTML stripping

**Recommendation:**
```bash
npm install dompurify jsdom
```

Replace basic regex with DOMPurify for robust HTML sanitization.

---

### 14. **Password Validation Too Strict**
**Severity:** 🔵 LOW  
**Files:** `backend/middleware/validation.js`

**Issue:**
```javascript
// Requires uppercase, lowercase, number, AND special character
```

**Recommendation:**
- Consider allowing passwords without special characters
- Use password strength meter instead of rigid rules
- Check against common password lists

---

### 15. **Missing Database Indexes**
**Severity:** 🔵 MEDIUM  
**Files:** Database schema (not in repo)

**Performance Issue:**
- Queries filter on `location`, `start_datetime`, `organizer_id`
- No evidence of indexes on these columns

**Recommendation:**
```sql
CREATE INDEX idx_events_start_datetime ON events(start_datetime);
CREATE INDEX idx_events_location ON events(location);
CREATE INDEX idx_events_organizer_id ON events(organizer_id);
CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_tickets_event_id ON tickets(event_id);
CREATE INDEX idx_waitlist_event_user ON waitlist(event_id, user_id);
```

---

### 16. **No Health Check Endpoint**
**Severity:** 🔵 LOW  
**Files:** `backend/index.js`

**Issue:**
- Basic health check exists but doesn't test database

**Improvement:**
```javascript
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(503).json({ 
      status: 'unhealthy', 
      database: 'disconnected' 
    });
  }
});
```

---

### 17. **Swagger Security Not Enforced**
**Severity:** 🔵 LOW  
**Files:** `backend/swagger.js`

**Issue:**
- Swagger UI accessible in production
- No authentication on `/api-docs`

**Fix:**
```javascript
// Only enable Swagger in development
if (process.env.NODE_ENV !== 'production') {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
```

---

### 18. **Waitlist Cleanup Timer Not Configurable**
**Severity:** 🔵 LOW  
**Files:** `backend/routes/waitlist.js`

**Issue:**
```javascript
}, 2 * 60 * 1000); // ❌ Hardcoded 2 minutes
```

**Fix:**
```javascript
const CLEANUP_INTERVAL = process.env.WAITLIST_CLEANUP_INTERVAL || 120000;
}, CLEANUP_INTERVAL);
```

---

## ✅ What's Done Well

### Strengths:
1. ✅ **Excellent validation** - Comprehensive validation helpers in `validation.js`
2. ✅ **Parameterized queries** - No SQL injection vulnerabilities found
3. ✅ **Sanitization middleware** - XSS protection with `sanitizeBody`
4. ✅ **Helper functions** - Good code reuse with `dbHelpers.js`
5. ✅ **API documentation** - Complete Swagger/OpenAPI docs
6. ✅ **Transaction handling** - Proper use of database transactions for atomic operations
7. ✅ **Password hashing** - bcrypt with proper salt rounds
8. ✅ **JWT authentication** - Stateless auth with refresh tokens

---

## 📋 Recommended Action Plan

### Phase 1: Critical Fixes (Do This Week)
- [ ] Add `bcrypt` and `jsonwebtoken` to `package.json`
- [ ] Implement global error handler
- [ ] Add rate limiting
- [ ] Configure database connection pool
- [ ] Add `.env.example` file

### Phase 2: Security Hardening (Next Week)
- [ ] Add request size limits
- [ ] Implement proper logging (Winston)
- [ ] Add database row-level locking for ticket purchases
- [ ] Audit all dynamic SQL queries
- [ ] Disable Swagger in production

### Phase 3: Performance & Reliability (Following Week)
- [ ] Add database indexes
- [ ] Implement token refresh mechanism
- [ ] Add health check with database test
- [ ] Set up log rotation
- [ ] Add monitoring/alerting

### Phase 4: Polish (Before Production)
- [ ] Standardize all error messages to one language
- [ ] Add automated tests (unit + integration)
- [ ] Set up CI/CD pipeline
- [ ] Security audit with tools (npm audit, Snyk)
- [ ] Load testing

---

## 🔧 Quick Wins (< 1 Hour Each)

1. **Add missing dependencies:**
   ```bash
   cd backend && npm install bcrypt jsonwebtoken express-rate-limit
   ```

2. **Add error handler** (copy-paste to `index.js`)

3. **Create `.env.example`** (template provided above)

4. **Add request size limits** (one line change)

5. **Disable Swagger in production** (one if statement)

---

## 📊 Security Checklist

- [ ] JWT secret is strong (64+ characters)
- [ ] Passwords hashed with bcrypt (✅ done)
- [ ] SQL injection prevention (✅ done)
- [ ] XSS prevention (✅ done)
- [ ] Rate limiting (❌ missing)
- [ ] HTTPS enforced (not reviewed - deployment concern)
- [ ] CORS configured properly (✅ basic done)
- [ ] Error messages don't leak info (❌ needs work)
- [ ] Logs don't contain sensitive data (⚠️ audit needed)
- [ ] Dependencies up to date (run `npm audit`)

---

## 📞 Contact & Questions

If you need clarification on any issue or want to discuss priorities, please reach out.

**Generated:** December 17, 2025  
**Review Tool:** AI Code Analysis
