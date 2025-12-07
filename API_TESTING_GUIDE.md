# EventGo API Testing Guide

Base URL: `http://localhost:5000` or `http://192.168.1.66:5000`

## Authentication
Most endpoints require a JWT token. After login/register, copy the `token` from the response and add it to requests:
- Header: `Authorization: Bearer YOUR_TOKEN_HERE`

---

## 🔐 USERS & AUTH

### 1. Register User
**POST** `/users/register`
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "Password123!",
  "role": "user"
}
```
**Response:** User object + JWT token

### 2. Register Organizer
**POST** `/users/register`
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane@example.com",
  "password": "Password123!",
  "role": "organizer"
}
```

### 3. Login
**POST** `/users/login`
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
**Response:** User object + JWT token

### 4. Get User Profile
**GET** `/users/:id` 🔒
- Requires: Auth token

### 5. Update User
**PUT** `/users/:id` 🔒
```json
{
  "first_name": "Updated",
  "last_name": "Name",
  "oldPassword": "password123",
  "password": "newpassword123"
}
```

### 6. Delete User
**DELETE** `/users/:id` 🔒

### 7. Refresh Token
**POST** `/users/refresh-token`
```json
{
  "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
}
```
**Response:** New access token

---

## 🎉 EVENTS

### 1. Get All Events (Public)
**GET** `/events`
**Query params:**
- `search` - Search in title/description
- `location` - Filter by location
- `startDate` - Filter by start date (YYYY-MM-DD)
- `endDate` - Filter by end date
- `filter` - Filter by status: `upcoming` (default), `past`, or `all`
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 12)

**Examples:** 
- `/events?search=concert&location=Ljubljana&page=1&limit=10`
- `/events?filter=past` - Get past events
- `/events?filter=all` - Get all events (past and upcoming)

### 2. Get Single Event (Public)
**GET** `/events/:id`
- Returns: Event + ticket_types array

### 3. Create Event 🔒 (Organizer only)
**POST** `/events`
```json
{
  "title": "Summer Concert 2025",
  "description": "Amazing concert event",
  "start_datetime": "2025-08-15T18:00:00",
  "end_datetime": "2025-08-15T23:00:00",
  "location": "Ljubljana Arena",
  "total_tickets": 1000
}
```

### 4. Update Event 🔒 (Own events only)
**PUT** `/events/:id`
```json
{
  "title": "Updated Title",
  "total_tickets": 1500
}
```

### 5. Delete Event 🔒 (Own events only)
**DELETE** `/events/:id`

### 6. Get Organizer Events 🔒
**GET** `/events/organizer/:organizerId`
- Returns: All events for specific organizer

### 7. Get Event Analytics 🔒 (Organizer only)
**GET** `/events/:id/analytics`
- Returns: Revenue, sales, ticket types breakdown, recent sales, payment methods

---

## 🎫 TICKET TYPES

### 1. Get Ticket Types for Event
**GET** `/ticket-types/:event_id`

### 2. Create Ticket Type 🔒 (Organizer only)
**POST** `/ticket-types`
```json
{
  "event_id": 1,
  "type": "VIP",
  "price": 150.00,
  "total_tickets": 100
}
```

### 3. Delete Ticket Type 🔒 (Organizer only)
**DELETE** `/ticket-types/:id`

### 4. Recount Tickets for Ticket Type 🔒 (Organizer only)
**PUT** `/ticket-types/:id/recount`
- Recalculates tickets_sold based on actual tickets in database

### 5. Sync All Ticket Types 🔒 (Organizer only)
**POST** `/ticket-types/sync-all`
- Syncs all ticket types for all events

### 6. Debug Ticket Type 🔒
**GET** `/ticket-types/debug/:event_id`
- Returns detailed ticket type information for debugging

---

## 🎟️ TICKETS

### 1. Purchase Ticket 🔒
**POST** `/tickets`
```json
{
  "ticket_type_id": 1,
  "event_id": 1,
  "quantity": 2,
  "payment_method": "card"
}
```

### 2. Get All Tickets
**GET** `/tickets`

### 3. Get Single Ticket
**GET** `/tickets/:id`

### 4. Get User's Tickets 🔒
**GET** `/tickets/user/:user_id`
- Returns: All tickets for a user (active, reserved, pending_return, refunded)

### 5. Get User's Tickets for Specific Event
**GET** `/tickets/user/:user_id/event/:event_id`
- Returns: All tickets for a user for a specific event

### 6. Get Event Tickets
**GET** `/tickets/event/:event_id`

### 7. User Refund Ticket 🔒 (Sold out events only)
**PUT** `/tickets/:id/refund`
- User keeps ticket until someone from waitlist accepts
- 2% platform fee applies

### 8. Organizer Refund Ticket 🔒 (Organizer only)
**PUT** `/tickets/:id/organizer-refund`
- Can refund anytime
- Ticket goes back to sale or waitlist
- No platform fee

### 9. Delete Ticket
**DELETE** `/tickets/:id`

---

## 💰 TRANSACTIONS

### 1. Get All Transactions
**GET** `/transactions`

### 2. Get User Transactions
**GET** `/transactions/user/:id`

### 3. Get Single Transaction
**GET** `/transactions/:id`

### 4. Create Transaction
**POST** `/transactions`
```json
{
  "user_id": 1,
  "total_price": 150.00,
  "status": "completed",
  "payment_method": "card",
  "reference_code": "TXN123456"
}
```

### 5. Delete Transaction
**DELETE** `/transactions/:id`

---

## 📋 WAITLIST

**Note:** All waitlist endpoints require authentication 🔒

### 1. Get All Waitlist Entries 🔒
**GET** `/waitlist`

### 2. Get Waitlist for Event 🔒
**GET** `/waitlist/event/:event_id`

### 3. Get User's Waitlist Entries 🔒
**GET** `/waitlist/user/:user_id`

### 4. Join Waitlist 🔒
**POST** `/waitlist`
```json
{
  "event_id": 1,
  "user_id": 1
}
```

### 5. Delete Waitlist Entry 🔒
**DELETE** `/waitlist/:id`

### 6. Leave Waitlist (by Event and User) 🔒
**DELETE** `/waitlist/event/:event_id/user/:user_id`

### 7. Accept Waitlist Ticket Offer 🔒
**POST** `/waitlist/accept-ticket/:transaction_id`
- User has 30 minutes to accept after being offered
- After acceptance, previous owner gets 98% refund

### 8. Decline Waitlist Ticket Offer 🔒
**POST** `/waitlist/decline-ticket/:transaction_id`
- User is removed from waitlist
- Ticket offered to next person in line

---

## 🧪 TESTING FLOW EXAMPLES

### Flow 1: Complete Event Purchase
1. **Register as user** - POST `/users/register`
2. **Login** - POST `/users/login` (save token)
3. **Browse events** - GET `/events`
4. **View event details** - GET `/events/:id`
5. **Purchase ticket** - POST `/tickets/purchase` 🔒
6. **View your tickets** - GET `/tickets/user/:user_id` 🔒

### Flow 2: Organizer Creates Event
1. **Register as organizer** - POST `/users/register` (role: "organizer")
2. **Login** - POST `/users/login` (save token)
3. **Create event** - POST `/events` 🔒
4. **Add ticket types** - POST `/ticket-types` 🔒
5. **View analytics** - GET `/events/:id/analytics` 🔒

### Flow 3: Waitlist & Refund
1. **User A buys ticket** - POST `/tickets` (event sells out)
2. **User B joins waitlist** - POST `/waitlist` 🔒
3. **User A returns ticket** - PUT `/tickets/:id/refund` 🔒
4. **User B gets notified** (check tickets - GET `/tickets/user/:user_id` - status: reserved)
5. **User B accepts** - POST `/waitlist/accept-ticket/:transaction_id` 🔒
   - OR **User B declines** - POST `/waitlist/decline-ticket/:transaction_id` 🔒
6. **If declined**, next person in waitlist gets offered

### Flow 4: Organizer Refund
1. **Organizer views event tickets** - GET `/tickets/event/:event_id`
2. **Organizer refunds ticket** - PUT `/tickets/:id/organizer-refund` 🔒
3. **If sold out**: Ticket offered to waitlist (30-min window)
4. **If not sold out**: Ticket available for immediate purchase

---

## 📝 VALIDATION RULES

### Strings
- **Title**: 3-200 chars
- **Description**: 1-5000 chars
- **Location**: 3-200 chars
- **Email**: Valid email format
- **Password**: Minimum 6 chars

### Numbers
- **Total tickets**: 1-100,000
- **Price**: Positive decimal
- **Quantity**: 1-10 per purchase

### Dates
- **Must be in future** (for new events)
- **End date must be after start date**

---

## ⚠️ ERROR CODES

- **400** - Bad Request (validation error)
- **401** - Unauthorized (missing/invalid token)
- **403** - Forbidden (no permission)
- **404** - Not Found
- **409** - Conflict (e.g., already in waitlist)
- **410** - Gone (reservation expired)
- **500** - Server Error

---

## 🔧 POSTMAN SETUP

### Environment Variables
Create a Postman environment with:
```
base_url = http://localhost:5000
token = (leave empty, will be set after login)
user_id = (set after login)
organizer_id = (set after organizer login)
event_id = (set after creating event)
ticket_id = (set after purchase)
```

### Auto-save Token Script
Add to **Tests** tab of login/register requests:
```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.token);
    pm.environment.set("user_id", jsonData.user.id);
}
```

### Auth Header
For protected routes, add to **Headers**:
```
Authorization: Bearer {{token}}
```

---

## 🎯 QUICK TEST CHECKLIST

- [ ] Register user & organizer
- [ ] Login both accounts
- [ ] Create event (organizer)
- [ ] Add ticket types
- [ ] Purchase ticket (user)
- [ ] View purchased tickets
- [ ] Join waitlist
- [ ] Refund ticket (sells out event)
- [ ] Accept/decline waitlist offer
- [ ] Organizer refund
- [ ] View analytics
- [ ] Update user profile
- [ ] Change password with old password verification

---

## 🚀 PRO TIPS

1. **Use Postman Collections**: Save all requests in a collection for easy reuse
2. **Chain requests**: Use environment variables to pass IDs between requests
3. **Test error cases**: Try invalid data to verify validation works
4. **Test permissions**: Try accessing other users' resources to verify auth
5. **Test expiration**: Create reserved tickets and wait 30 min to test auto-cleanup
6. **Test sold out logic**: Fill event to capacity, then test waitlist flow

---

## 📊 SPECIAL FEATURES TO TEST

### 30-Minute Waitlist Expiration
1. User returns ticket (event sold out)
2. First waitlist user gets offer
3. Wait 30 minutes without accepting
4. System auto-expires and offers to next person
5. Check via GET `/tickets/user/:user_id` - reserved ticket should disappear

### Organizer vs User Refund
- **User refund**: Only when sold out, ticket marked `pending_return`
- **Organizer refund**: Anytime, ticket marked `refunded`, decrements tickets_sold

### Waitlist Priority
- First to join gets first offer
- If declined, goes to next person
- Automatic cleanup every 2 minutes

---

**Happy Testing! 🎉**
