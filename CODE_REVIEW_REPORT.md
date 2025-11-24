# EventGo - Comprehensive Code Review Report
**Date:** November 24, 2025  
**Reviewer:** AI Code Review System  
**Project:** EventGo - Event Ticketing Platform

---

## Executive Summary

This comprehensive code review analyzed the entire EventGo codebase (frontend React application and backend Node.js API). The review identified **59 instances of inline styles**, several inconsistencies in coding patterns, and potential areas for improvement.

**Overall Assessment:** ⚠️ **Good with Improvements Needed**
- ✅ Solid architecture and feature implementation
- ⚠️ Consistency issues with styling approach
- ⚠️ Some code duplication
- ✅ Good error handling in most areas
- ⚠️ Missing some edge case validations

---

## 1. Inline Styles Issues (Priority: HIGH)

### Problem
Found **59 instances** of inline styles across JSX components, violating the project's CSS-first design system.

### Affected Files
1. **ProfileTickets.jsx** (10 inline styles)
2. **ProfileEventTickets.jsx** (13 inline styles)
3. **EventDetail.jsx** (2 inline styles)
4. **Events.jsx** (2 inline styles)
5. **OrganizerWaitlist.jsx** (4 inline styles)
6. **OrganizerAnalytics.jsx** (7 inline styles)
7. **ProfileTransactions.jsx** (3 inline styles)
8. **SkeletonLoaders.jsx** (13 inline styles - acceptable for dynamic sizing)
9. **RegisterOrganizer.jsx** (6 inline styles)
10. **Register.jsx** (1 inline style)
11. **Waitlist.jsx** (1 inline style)

### Impact
- **Consistency:** Breaks the established design system pattern
- **Maintainability:** Changes require modifying JSX instead of centralized CSS
- **Performance:** Slightly less optimal (though minimal impact)
- **Developer Experience:** Harder to find and update styles

### Recommendation
**Action Required:** Create reusable CSS classes for all inline styles

### Exceptions (Acceptable inline styles)
- **SkeletonLoaders.jsx:** Dynamic width percentages for loading states
- **Event handlers:** Hover state changes in onMouseEnter/onMouseLeave (could be converted to CSS :hover)

---

## 2. Back Button Pattern Inconsistency

### Issue
Three components (EventDetail.jsx, Events.jsx, ProfileEventTickets.jsx) have identical back button implementations with inline styles and hover handlers.

### Current Code Pattern
```jsx
<button 
  onClick={() => navigate(-1)}
  style={{
    marginBottom: '1rem',
    padding: '0.5rem 1rem',
    background: 'rgba(255, 255, 255, 0.1)',
    // ... more inline styles
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
    e.currentTarget.style.transform = 'translateX(-4px)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
    e.currentTarget.style.transform = 'translateX(0)';
  }}
>
  ← Back
</button>
```

### Recommendation
**Create Reusable Component:**
```jsx
// components/BackButton.jsx
export default function BackButton({ onClick, text = "← Back" }) {
  const navigate = useNavigate();
  return (
    <button className="back-btn" onClick={onClick || (() => navigate(-1))}>
      {text}
    </button>
  );
}
```

**CSS:**
```css
.back-btn {
  margin-bottom: var(--space-md);
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(-4px);
}
```

---

## 3. Backend Code Review

### 3.1 Positive Findings ✅

#### Good Error Handling
- Consistent try-catch blocks in all route handlers
- Proper error logging with descriptive messages
- Appropriate HTTP status codes (200, 201, 400, 404, 409, etc.)

#### Good Validation
- ID type validation (`isNaN()` checks)
- User/event existence checks before operations
- Duplicate entry prevention (e.g., waitlist)

#### Good Database Patterns
- Proper use of parameterized queries (SQL injection prevention)
- Transactions for multi-step operations
- Proper JOIN statements for related data

### 3.2 Issues Found ⚠️

#### Missing Transaction Rollback
**File:** `backend/routes/tickets.js` (POST /tickets)

**Issue:** Multiple database operations without explicit transaction control

```javascript
// Current code (lines 281-337)
await Promise.all(insertPromises);
await pool.query(`UPDATE ticket_types...`);
await pool.query(`UPDATE events...`);
```

**Risk:** If any operation fails mid-way, database could be left in inconsistent state.

**Recommendation:**
```javascript
const client = await pool.connect();
try {
  await client.query('BEGIN');
  // ... all operations
  await client.query('COMMIT');
} catch (e) {
  await client.query('ROLLBACK');
  throw e;
} finally {
  client.release();
}
```

#### Inconsistent Error Response Format
**Files:** Various route files

**Issue:** Some errors return `{ message: "..." }`, others return objects with additional fields.

**Examples:**
```javascript
// Pattern 1 (simple)
return res.status(404).json({ message: "User does not exist!" });

// Pattern 2 (with data)
return res.status(200).json({
  message: "Success",
  tickets: [],
  total: 0
});
```

**Recommendation:** Standardize on one pattern:
```javascript
// Proposed standard format
{
  success: boolean,
  message: string,
  data?: any,
  error?: string
}
```

#### Missing Input Sanitization
**Files:** All backend routes accepting user input

**Issue:** No input sanitization for strings (XSS vulnerability potential)

**Recommendation:** Add input validation/sanitization library like `validator` or `joi`

```javascript
import validator from 'validator';

// Example
if (!validator.isEmail(email)) {
  return res.status(400).json({ message: "Invalid email format" });
}
```

---

## 4. Frontend Component Patterns

### 4.1 Positive Findings ✅

- **Consistent Hook Usage:** useEffect, useState properly used
- **Good Separation:** Profile sections separated into individual components
- **Proper Authentication:** useAuth context used consistently
- **Loading States:** Most components handle loading/error states

### 4.2 Issues Found ⚠️

#### Repeated Data Fetching Logic
**Files:** Profile.jsx, EventDetail.jsx, Events.jsx

**Issue:** Similar API call patterns repeated in multiple components

**Example Pattern:**
```javascript
useEffect(() => {
  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/endpoint`);
      setData(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetch();
}, [dependency]);
```

**Recommendation:** Create custom hook
```javascript
// hooks/useApiData.js
export function useApiData(endpoint, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get(endpoint);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, dependencies);

  return { data, loading, error };
}
```

#### Inconsistent Date Formatting
**Files:** Multiple components

**Issue:** Date formatting done differently across components

**Examples:**
```javascript
// Pattern 1
new Date(e.start_datetime).toLocaleString()

// Pattern 2
new Date(e.start_datetime).toLocaleString("sl-SI")

// Pattern 3
new Date(t.issued_at).toLocaleString()
```

**Recommendation:** Create utility function
```javascript
// utils/dateFormatter.js
export function formatEventDate(dateString) {
  return new Date(dateString).toLocaleString("sl-SI", {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}
```

---

## 5. Potential Bugs & Edge Cases

### 5.1 Race Condition Risk
**File:** `backend/routes/waitlist.js` (assignTicketToWaitlist)

**Issue:** If multiple tickets are returned simultaneously, multiple waitlist users could be assigned the same ticket.

**Current Code:** No locking mechanism

**Recommendation:** Use PostgreSQL row-level locking
```sql
SELECT * FROM waitlist 
WHERE event_id = $1 
ORDER BY joined_at ASC 
LIMIT 1
FOR UPDATE SKIP LOCKED;
```

### 5.2 Missing Null Checks
**File:** `frontend/src/pages/EventDetail.jsx` (line 143)

```javascript
if (!event) return <p style={{ color: "white" }}>Loading...</p>;
```

**Issue:** If event fetch fails (404), this will show "Loading..." forever.

**Better Approach:**
```javascript
if (loading) return <div className="loading">Loading...</div>;
if (error) return <div className="error">{error}</div>;
if (!event) return <div className="error">Event not found</div>;
```

### 5.3 Quantity Validation Missing
**File:** `frontend/src/pages/EventDetail.jsx`

**Issue:** User can type negative or decimal numbers in quantity input

**Current:**
```jsx
<input
  type="number"
  min="1"
  value={quantity}
  onChange={(e) => setQuantity(e.target.value)}
/>
```

**Better:**
```jsx
<input
  type="number"
  min="1"
  step="1"
  value={quantity}
  onChange={(e) => {
    const val = parseInt(e.target.value);
    if (val > 0 && val <= availableTickets) {
      setQuantity(val);
    }
  }}
/>
```

### 5.4 Memory Leak Risk
**File:** `frontend/src/pages/Profile.jsx`

**Issue:** Event listeners in hover handlers not cleaned up

**Current:** Inline onMouseEnter/onMouseLeave handlers everywhere

**Recommendation:** Use CSS :hover instead of JavaScript handlers for simple style changes

---

## 6. Performance Considerations

### 6.1 Unnecessary Re-renders
**File:** `frontend/src/pages/Profile.jsx`

**Issue:** Large component with many state variables causes full re-render on any state change

**Recommendation:** Consider using useReducer or splitting into smaller components with React.memo

### 6.2 Missing Pagination
**Files:** Backend routes returning all results

**Issue:** Routes like GET /tickets could return thousands of records

**Found in:**
- `backend/routes/tickets.js` GET /
- `backend/routes/transactions.js` GET /

**Recommendation:** Add pagination parameters
```javascript
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 50;
const offset = (page - 1) * limit;

const result = await pool.query(`
  SELECT * FROM tickets
  ORDER BY issued_at DESC
  LIMIT $1 OFFSET $2
`, [limit, offset]);
```

---

## 7. Security Considerations

### 7.1 Missing Rate Limiting
**File:** `backend/index.js`

**Issue:** No rate limiting on API endpoints (vulnerable to DOS)

**Recommendation:** Add express-rate-limit
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 7.2 Password Validation
**Files:** Register.jsx, RegisterOrganizer.jsx

**Issue:** No strong password requirements enforced

**Recommendation:** Add password strength validation
```javascript
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
if (!passwordRegex.test(password)) {
  setError("Password must be at least 8 characters with uppercase, lowercase, number, and special character");
  return;
}
```

### 7.3 CORS Configuration
**File:** `backend/index.js`

**Issue:** CORS might be too permissive (need to verify actual config)

**Recommendation:** Restrict to specific origins in production

---

## 8. Code Quality Improvements

### 8.1 Magic Numbers
**Found in:** Multiple files

**Issue:** Hard-coded values without explanation

**Examples:**
```javascript
const platformFee = originalPrice * 0.02; // Why 2%?
const available = total_tickets - tickets_sold; // Could be a method
```

**Recommendation:** Use constants
```javascript
// config/constants.js
export const PLATFORM_FEE_PERCENTAGE = 0.02;
export const MAX_TICKETS_PER_PURCHASE = 10;
export const PAGINATION_DEFAULT_LIMIT = 50;
```

### 8.2 Console.log Statements
**Found in:** EventDetail.jsx (lines 146-149)

**Issue:** Commented-out console.log statements left in production code

```javascript
//console.log(`🔍 Checking ${t.type}: ${t.tickets_sold}/${t.total_tickets}`);
//console.log('🎪 Is event sold out?', allTicketTypesSoldOut);
```

**Recommendation:** Remove or use proper logging library

### 8.3 Code Comments
**Issue:** Inconsistent commenting style

**Examples:**
```javascript
// Some files use
/* Comment */

// Others use
// Comment

// Some use emoji
// 🎫 Create transaction
```

**Recommendation:** Standardize on one style. TSDoc/JSDoc for functions.

---

## 9. Testing Recommendations

### Current State
❌ No test files found in the project

### Recommendations

#### Priority 1: Critical Path Testing
- User authentication flow
- Ticket purchase process
- Waitlist system (complex logic)
- Refund/return system with 2% fee

#### Priority 2: API Endpoint Testing
- All CRUD operations
- Error handling
- Validation logic

#### Priority 3: Component Testing
- Form submissions
- Modal interactions
- Navigation flows

#### Suggested Tools
```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@ testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.0",
    "supertest": "^6.3.0"
  }
}
```

---

## 10. Accessibility Issues

### Missing ARIA Labels
**Files:** Modal.jsx, various form components

**Issue:** No aria-labels for screen readers

**Example:**
```jsx
<button onClick={onClose}>✕</button>
```

**Better:**
```jsx
<button onClick={onClose} aria-label="Close modal">✕</button>
```

### Keyboard Navigation
**File:** Events.jsx

**Issue:** Clickable event cards not keyboard accessible

**Current:**
```jsx
<div onClick={() => navigate(`/events/${e.id}`)} style={{ cursor: 'pointer' }}>
```

**Better:**
```jsx
<div 
  onClick={() => navigate(`/events/${e.id}`)}
  onKeyDown={(e) => e.key === 'Enter' && navigate(`/events/${e.id}`)}
  tabIndex={0}
  role="button"
  aria-label={`View event: ${e.title}`}
>
```

---

## 11. Documentation Issues

### Missing Documentation
- No API documentation (consider Swagger/OpenAPI)
- No component prop documentation
- No README with setup instructions
- No environment variables documentation

### Recommendations
1. **Add JSDoc comments** to all exported functions
2. **Create API.md** with all endpoints
3. **Update README.md** with:
   - Setup instructions
   - Environment variables
   - Development workflow
   - Testing instructions

---

## 12. Priority Action Items

### 🔴 High Priority (Fix ASAP)
1. **Remove all inline styles** → Create CSS classes
2. **Add transaction management** to ticket purchase flow
3. **Fix race condition** in waitlist assignment
4. **Add input validation** on backend (validator.js)
5. **Standardize error response format**

### 🟡 Medium Priority (Fix Soon)
6. **Create BackButton component** (DRY principle)
7. **Add pagination** to list endpoints
8. **Create custom hooks** for repeated fetch logic
9. **Add rate limiting** to API
10. **Implement proper loading/error states** everywhere

### 🟢 Low Priority (Improvements)
11. Add testing suite
12. Improve accessibility (ARIA labels)
13. Add API documentation
14. Create utility functions for date formatting
15. Remove console.log statements

---

## 13. Estimated Effort

| Task Category | Estimated Time |
|--------------|----------------|
| Fix inline styles | 4-6 hours |
| Backend consistency fixes | 3-4 hours |
| Create reusable components | 2-3 hours |
| Add input validation | 2-3 hours |
| Security improvements | 3-4 hours |
| Testing setup | 8-10 hours |
| Documentation | 4-5 hours |
| **Total** | **26-35 hours** |

---

## 14. Conclusion

The EventGo project demonstrates **solid architecture** and **good functionality**, but would benefit significantly from:

1. **Style Consistency**: Moving all inline styles to CSS
2. **Code Reusability**: Creating shared components and hooks
3. **Security Hardening**: Input validation, rate limiting
4. **Testing**: Comprehensive test coverage
5. **Documentation**: API docs and setup guides

### Overall Grade: B+ (Good, with room for improvement)

**Strengths:**
- ✅ Feature-complete ticketing system
- ✅ Good database design
- ✅ Proper authentication implementation
- ✅ Modern React patterns

**Areas for Improvement:**
- ⚠️ Styling consistency
- ⚠️ Code duplication
- ⚠️ Missing tests
- ⚠️ Security hardening needed

---

## 15. Next Steps

1. **Review this report** with the team
2. **Prioritize fixes** based on business impact
3. **Create tickets** for each action item
4. **Implement fixes** iteratively
5. **Set up CI/CD** with linting and testing

---

*End of Report*
