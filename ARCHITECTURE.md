# EventGo - System Architecture & Documentation

## 📱 Application Flow Diagrams

### 1. User Registration & Authentication Flow
```
┌─────────────┐
│   Landing   │
│    Page     │
└──────┬──────┘
       │
       ├─────────────────────┬─────────────────────┐
       ▼                     ▼                     ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Browse    │      │   Sign Up   │      │   Log In    │
│   Events    │      │  (User/Org) │      │  (User/Org) │
└─────────────┘      └──────┬──────┘      └──────┬──────┘
                            │                     │
                            └──────────┬──────────┘
                                       ▼
                            ┌─────────────────────┐
                            │  JWT Token Created  │
                            │  User Authenticated │
                            └──────────┬──────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼                                     ▼
            ┌───────────────┐                    ┌───────────────┐
            │  User Role:   │                    │ Organizer     │
            │   "user"      │                    │   Role        │
            └───────┬───────┘                    └───────┬───────┘
                    │                                    │
                    ▼                                    ▼
            ┌───────────────┐                    ┌───────────────┐
            │ User Dashboard│                    │   Organizer   │
            │   - Profile   │                    │   Dashboard   │
            │   - Tickets   │                    │ - Create Event│
            │   - Waitlist  │                    │ - My Events   │
            │   - Events    │                    │ - Analytics   │
            └───────────────┘                    └───────────────┘
```

### 2. Ticket Purchase Flow (Normal User)
```
┌─────────────┐
│   Browse    │
│   Events    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Select    │
│    Event    │
└──────┬──────┘
       │
       ├──────────────────┬──────────────────┐
       ▼                  ▼                  ▼
┌─────────────┐    ┌─────────────┐   ┌─────────────┐
│  Tickets    │    │   Tickets   │   │   Event     │
│  Available  │    │  Sold Out   │   │   Expired   │
└──────┬──────┘    └──────┬──────┘   └─────────────┘
       │                  │
       ▼                  ▼
┌─────────────┐    ┌─────────────┐
│   Select    │    │     Join    │
│   Ticket    │    │   Waitlist  │
│    Type     │    │             │
└──────┬──────┘    └──────┬──────┘
       │                  │
       ▼                  ▼
┌─────────────┐    ┌─────────────┐
│   Choose    │    │  Waitlist   │
│  Quantity   │    │   Position  │
└──────┬──────┘    │    Shown    │
       │           └─────────────┘
       ▼
┌─────────────┐
│  Confirm    │
│  Purchase   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Select    │
│   Payment   │
│   Method    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Transaction │
│   Created   │
│  (pending)  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Tickets   │
│   Issued    │
│  (active)   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Transaction │
│  Completed  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Tickets   │
│   Visible   │
│ in Profile  │
└─────────────┘
```

### 3. Ticket Return & Waitlist Flow
```
┌─────────────┐
│    User     │
│   Has       │
│   Ticket    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Event     │
│  Sold Out?  │
└──────┬──────┘
       │
       ├──────────────────┬──────────────────┐
       ▼                  ▼                  
┌─────────────┐    ┌─────────────┐          
│     YES     │    │      NO     │          
│ Can Return  │    │ Cannot      │          
└──────┬──────┘    │   Return    │          
       │           └─────────────┘          
       ▼
┌─────────────┐
│   Click     │
│   "Return   │
│   Ticket"   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Ticket    │
│   Status:   │
│  pending_   │
│   return    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Check for  │
│  Waitlist   │
└──────┬──────┘
       │
       ├──────────────────┬──────────────────┐
       ▼                  ▼                  
┌─────────────┐    ┌─────────────┐          
│  Waitlist   │    │     No      │          
│   Exists    │    │  Waitlist   │          
└──────┬──────┘    │   (wait)    │          
       │           └─────────────┘          
       ▼
┌─────────────┐
│  Assign to  │
│  Next in    │
│  Waitlist   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Reserved   │
│   Ticket    │
│   Created   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Waitlist    │
│ User Gets   │
│ Notified    │
└──────┬──────┘
       │
       ├──────────────────┬──────────────────┐
       ▼                  ▼                  
┌─────────────┐    ┌─────────────┐          
│   Accept    │    │   Decline   │          
│   Ticket    │    │   Offer     │          
└──────┬──────┘    └──────┬──────┘          
       │                  │                  
       ▼                  ▼                  
┌─────────────┐    ┌─────────────┐          
│ Transaction │    │   Offer     │          
│  Completed  │    │  to Next    │          
└──────┬──────┘    │in Waitlist  │          
       │           └─────────────┘          
       ▼
┌─────────────┐
│  Reserved   │
│  → active   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Original   │
│pending_return│
│  → refunded │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Original   │
│   Owner     │
│  Refunded   │
└─────────────┘
```

### 4. Event Creation Flow (Organizer)
```
┌─────────────┐
│  Organizer  │
│   Logs In   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Organizer  │
│  Dashboard  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   "Create   │
│    Event"   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Fill Event │
│   Details   │
│  - Title    │
│  - Date     │
│  - Location │
│  - Image    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Submit    │
│    Event    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Event    │
│   Created   │
│  (ID: XX)   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Redirect   │
│  to Event   │
│   Details   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   "Create   │
│   Ticket    │
│    Types"   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Add Ticket │
│    Types    │
│  - Name     │
│  - Price    │
│  - Quantity │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Tickets   │
│   Created   │
│   & Linked  │
│  to Event   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Event    │
│   Visible   │
│   on Site   │
└─────────────┘
```

---

## 🏗️ System Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐              ┌─────────────────┐       │
│  │   Web Browser   │              │   iOS Mobile    │       │
│  │   (React SPA)   │              │   (Expo/RN)     │       │
│  │                 │              │                 │       │
│  │  - React Router │              │  - WebView      │       │
│  │  - Axios API    │              │  - Navigation   │       │
│  │  - Context API  │              │  - Components   │       │
│  └────────┬────────┘              └────────┬────────┘       │
│           │                                │                 │
│           └────────────────┬───────────────┘                 │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
                             │ HTTPS/REST API
                             │ JWT Authentication
                             │
┌────────────────────────────┼─────────────────────────────────┐
│                            ▼                                  │
│                    ┌───────────────┐                          │
│                    │  API Gateway  │                          │
│                    │   (Express)   │                          │
│                    └───────┬───────┘                          │
│                            │                                  │
│         ┌──────────────────┼──────────────────┐              │
│         │                  │                  │              │
│         ▼                  ▼                  ▼              │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐       │
│  │    Auth     │   │  Business   │   │    Data     │       │
│  │ Middleware  │   │    Logic    │   │   Access    │       │
│  │             │   │             │   │             │       │
│  │ - JWT       │   │ - Routes    │   │ - Models    │       │
│  │   Verify    │   │ - Services  │   │ - Queries   │       │
│  │ - Password  │   │ - Utils     │   │ - Pool      │       │
│  └─────────────┘   └─────────────┘   └──────┬──────┘       │
│                                              │              │
└──────────────────────────────────────────────┼──────────────┘
                                               │
                                               │ SQL Queries
                                               │
┌──────────────────────────────────────────────┼──────────────┐
│                         DATABASE LAYER       ▼               │
│                                                               │
│                    ┌────────────────────┐                    │
│                    │    PostgreSQL      │                    │
│                    │      Database      │                    │
│                    │                    │                    │
│                    │  - Users           │                    │
│                    │  - Events          │                    │
│                    │  - Tickets         │                    │
│                    │  - Ticket Types    │                    │
│                    │  - Transactions    │                    │
│                    │  - Waitlist        │                    │
│                    └────────────────────┘                    │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### Technology Stack

#### Frontend (Web)
```
┌─────────────────────────────────────┐
│         React 18.3.1                │
├─────────────────────────────────────┤
│  UI Library:     React              │
│  Routing:        React Router v6    │
│  HTTP Client:    Axios              │
│  State Mgmt:     Context API        │
│  Build Tool:     Vite               │
│  Styling:        CSS Modules        │
└─────────────────────────────────────┘
```

#### Mobile (iOS)
```
┌─────────────────────────────────────┐
│         Expo SDK 52                 │
├─────────────────────────────────────┤
│  Framework:      React Native 0.76  │
│  Build:          EAS Build          │
│  Testing:        Expo Go            │
│  Architecture:   WebView Wrapper    │
│  Navigation:     Expo Router        │
└─────────────────────────────────────┘
```

#### Backend
```
┌─────────────────────────────────────┐
│         Node.js + Express           │
├─────────────────────────────────────┤
│  Runtime:        Node.js 20.x       │
│  Framework:      Express.js         │
│  Auth:           JWT + bcrypt       │
│  Database:       node-postgres (pg) │
│  CORS:           cors               │
│  Environment:    dotenv             │
└─────────────────────────────────────┘
```

#### Database
```
┌─────────────────────────────────────┐
│         PostgreSQL 15               │
├─────────────────────────────────────┤
│  Type:           Relational DB      │
│  Connection:     Connection Pool    │
│  Features:       - Transactions     │
│                  - Foreign Keys     │
│                  - Triggers         │
│                  - Window Functions │
└─────────────────────────────────────┘
```

---

## 🗄️ Database Schema & Relationships

### Entity Relationship Diagram (ERD)
```
┌──────────────────────────────────────────────────────────────────────────┐
│                            DATABASE SCHEMA                                │
└──────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐
│       USERS         │
├─────────────────────┤
│ PK: id              │
│     email (unique)  │
│     password_hash   │
│     first_name      │
│     last_name       │
│     role            │  ← 'user' | 'organizer'
│     created_at      │
└──────────┬──────────┘
           │
           │ 1:N (organizer_id)
           │
           ▼
┌─────────────────────┐
│       EVENTS        │
├─────────────────────┤
│ PK: id              │
│ FK: organizer_id    │───────────┐
│     title           │           │
│     description     │           │
│     start_datetime  │           │
│     end_datetime    │           │
│     location        │           │
│     image_url       │           │
│     total_tickets   │           │
│     tickets_sold    │           │
│     created_at      │           │
└──────────┬──────────┘           │
           │                      │
           │ 1:N (event_id)       │
           │                      │
           ▼                      │
┌─────────────────────┐           │
│    TICKET_TYPES     │           │
├─────────────────────┤           │
│ PK: id              │           │
│ FK: event_id        │───────────┘
│     name            │
│     price           │
│     total_tickets   │
│     tickets_sold    │
│     created_at      │
└──────────┬──────────┘
           │
           │ 1:N (ticket_type_id)
           │
           ▼
┌─────────────────────┐
│      TICKETS        │
├─────────────────────┤
│ PK: id              │
│ FK: user_id         │───────┐
│ FK: event_id        │───────┼───┐
│ FK: ticket_type_id  │───────┘   │
│ FK: transaction_id  │───────┐   │
│     status          │       │   │
│     ticket_type     │       │   │
│     ticket_price    │       │   │
│     issued_at       │       │   │
│     buyer_name      │       │   │
│     owner_id        │       │   │
└─────────────────────┘       │   │
                              │   │
         ┌────────────────────┘   │
         │                        │
         ▼                        │
┌─────────────────────┐           │
│    TRANSACTIONS     │           │
├─────────────────────┤           │
│ PK: id              │           │
│ FK: user_id         │───────────┼───┐
│ FK: event_id        │───────────┘   │
│     total_price     │               │
│     quantity        │               │
│     payment_method  │               │
│     status          │               │
│     reference_code  │               │
│     created_at      │               │
└─────────────────────┘               │
                                      │
         ┌────────────────────────────┘
         │
         ▼
┌─────────────────────┐
│      WAITLIST       │
├─────────────────────┤
│ PK: id              │
│ FK: user_id         │
│ FK: event_id        │
│     joined_at       │
└─────────────────────┘


RELATIONSHIPS:
═══════════════

1. USERS → EVENTS
   - One organizer can create many events
   - Relationship: 1:N (one-to-many)
   - Foreign Key: events.organizer_id → users.id

2. EVENTS → TICKET_TYPES
   - One event can have multiple ticket types
   - Relationship: 1:N (one-to-many)
   - Foreign Key: ticket_types.event_id → events.id

3. TICKET_TYPES → TICKETS
   - One ticket type can have multiple tickets sold
   - Relationship: 1:N (one-to-many)
   - Foreign Key: tickets.ticket_type_id → ticket_types.id

4. USERS → TICKETS (buyer)
   - One user can purchase many tickets
   - Relationship: 1:N (one-to-many)
   - Foreign Key: tickets.user_id → users.id

5. EVENTS → TICKETS
   - One event can have many tickets
   - Relationship: 1:N (one-to-many)
   - Foreign Key: tickets.event_id → events.id

6. TRANSACTIONS → TICKETS
   - One transaction can create multiple tickets
   - Relationship: 1:N (one-to-many)
   - Foreign Key: tickets.transaction_id → transactions.id

7. USERS → TRANSACTIONS
   - One user can have many transactions
   - Relationship: 1:N (one-to-many)
   - Foreign Key: transactions.user_id → users.id

8. EVENTS → TRANSACTIONS
   - One event can have many transactions
   - Relationship: 1:N (one-to-many)
   - Foreign Key: transactions.event_id → events.id

9. USERS → WAITLIST
   - One user can join waitlist for multiple events
   - Relationship: N:M (many-to-many through waitlist)
   - Foreign Key: waitlist.user_id → users.id

10. EVENTS → WAITLIST
    - One event can have multiple users in waitlist
    - Relationship: 1:N (one-to-many)
    - Foreign Key: waitlist.event_id → events.id
```

### Detailed Table Schemas

#### 1. Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',  -- 'user' or 'organizer'
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

#### 2. Events Table
```sql
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    organizer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_datetime TIMESTAMP NOT NULL,
    end_datetime TIMESTAMP,
    location VARCHAR(255) NOT NULL,
    image_url TEXT,
    total_tickets INTEGER DEFAULT 0,
    tickets_sold INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_start_date ON events(start_datetime);
CREATE INDEX idx_events_location ON events(location);
```

#### 3. Ticket Types Table
```sql
CREATE TABLE ticket_types (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    total_tickets INTEGER NOT NULL,
    tickets_sold INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ticket_types_event ON ticket_types(event_id);
```

#### 4. Tickets Table
```sql
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    ticket_type_id INTEGER REFERENCES ticket_types(id) ON DELETE CASCADE,
    transaction_id INTEGER REFERENCES transactions(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'active',  
    -- 'active', 'reserved', 'pending_return', 'refunded', 'expired'
    ticket_type VARCHAR(100),
    ticket_price DECIMAL(10, 2),
    issued_at TIMESTAMP DEFAULT NOW(),
    buyer_name VARCHAR(255),
    owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_tickets_user ON tickets(user_id);
CREATE INDEX idx_tickets_event ON tickets(event_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_transaction ON tickets(transaction_id);
```

#### 5. Transactions Table
```sql
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    total_price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    payment_method VARCHAR(50),  -- 'card', 'cash', 'waitlist'
    status VARCHAR(50) DEFAULT 'pending',  
    -- 'pending', 'completed', 'failed', 'refunded'
    reference_code VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_event ON transactions(event_id);
CREATE INDEX idx_transactions_status ON transactions(status);
```

#### 6. Waitlist Table
```sql
CREATE TABLE waitlist (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, event_id)  -- One entry per user per event
);

-- Indexes
CREATE INDEX idx_waitlist_user ON waitlist(user_id);
CREATE INDEX idx_waitlist_event ON waitlist(event_id);
CREATE INDEX idx_waitlist_joined ON waitlist(joined_at);
```

---

## 🔐 Security Architecture

### Authentication Flow
```
┌──────────────┐
│    Client    │
│   (Web/iOS)  │
└──────┬───────┘
       │
       │ POST /users/login
       │ { email, password }
       │
       ▼
┌──────────────┐
│   Backend    │
│   Express    │
└──────┬───────┘
       │
       │ 1. Hash password with bcrypt
       │ 2. Compare with stored hash
       │
       ▼
┌──────────────┐
│  Generate    │
│  JWT Tokens  │
│              │
│ - Access:    │
│   7 days     │
│ - Refresh:   │
│   30 days    │
└──────┬───────┘
       │
       │ Return tokens to client
       │
       ▼
┌──────────────┐
│   Client     │
│   Stores     │
│   Tokens in  │
│  localStorage│
└──────────────┘

SUBSEQUENT REQUESTS:
═══════════════════

┌──────────────┐
│   Client     │
│   Attaches   │
│   Header:    │
│ Authorization│
│ Bearer TOKEN │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Middleware  │
│  requireAuth │
│              │
│ 1. Extract   │
│    token     │
│ 2. Verify    │
│    JWT       │
│ 3. Decode    │
│    user info │
└──────┬───────┘
       │
       │ req.user = { id, email, role }
       │
       ▼
┌──────────────┐
│   Protected  │
│    Route     │
│   Handler    │
└──────────────┘
```

### Authorization Levels
```
┌────────────────────────────────────────────────┐
│           AUTHORIZATION MATRIX                  │
├────────────────────────────────────────────────┤
│                                                 │
│  PUBLIC (No Auth Required):                    │
│  ✓ GET  /events                                │
│  ✓ GET  /events/:id                            │
│  ✓ POST /users/register                        │
│  ✓ POST /users/login                           │
│                                                 │
│  USER (Authenticated):                         │
│  ✓ GET  /users/profile                         │
│  ✓ POST /tickets (purchase)                    │
│  ✓ POST /waitlist (join)                       │
│  ✓ GET  /tickets/user/:id (own only)           │
│  ✓ PUT  /tickets/:id/return (own only)         │
│  ✓ GET  /transactions/user/:id (own only)      │
│                                                 │
│  ORGANIZER (role = 'organizer'):               │
│  ✓ POST /events                                │
│  ✓ PUT  /events/:id (own events)               │
│  ✓ DELETE /events/:id (own events)             │
│  ✓ POST /ticket-types                          │
│  ✓ GET  /events/:id/analytics (own events)     │
│  ✓ GET  /tickets/event/:id (own events)        │
│                                                 │
└────────────────────────────────────────────────┘
```

---

## 📊 Key Features & Business Logic

### 1. Smart Waitlist System
```
SCENARIO: Event is SOLD OUT
═══════════════════════════

User A has ticket → Clicks "Return Ticket"
           │
           ▼
    ┌─────────────┐
    │   Ticket    │
    │   Status:   │
    │  pending_   │
    │   return    │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │ Check for   │
    │  Waitlist   │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │ User B is   │
    │ #1 in line  │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │  Create     │
    │  Reserved   │
    │  Ticket for │
    │   User B    │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │   User B    │
    │   Sees      │
    │  "Accept"   │
    │   Button    │
    └──────┬──────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌─────────┐  ┌─────────┐
│ Accept  │  │ Decline │
└────┬────┘  └────┬────┘
     │            │
     │            ▼
     │      ┌─────────┐
     │      │  Offer  │
     │      │  to     │
     │      │  Next   │
     │      │  User   │
     │      └─────────┘
     │
     ▼
┌─────────────┐
│ User B:     │
│ Reserved →  │
│   active    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ User A:     │
│ pending_    │
│ return →    │
│  refunded   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ User A gets │
│  refund     │
└─────────────┘
```

### 2. Ticket Return Rules
```
┌────────────────────────────────────────┐
│       TICKET RETURN POLICY             │
├────────────────────────────────────────┤
│                                        │
│  CAN RETURN TICKET:                    │
│  ✓ Event is SOLD OUT                   │
│  ✓ Ticket status is 'active'           │
│  ✓ Event hasn't started yet            │
│                                        │
│  CANNOT RETURN TICKET:                 │
│  ✗ Event is NOT sold out               │
│  ✗ Ticket is already 'pending_return'  │
│  ✗ Ticket is 'refunded'                │
│  ✗ Event has already started           │
│                                        │
│  REFUND PROCESS:                       │
│  1. User requests return               │
│  2. Ticket → pending_return            │
│  3. User keeps ticket & access         │
│  4. Ticket offered to waitlist         │
│  5. Someone accepts it                 │
│  6. Original ticket → refunded         │
│  7. User gets money back               │
│                                        │
└────────────────────────────────────────┘
```

### 3. Event States & Ticket Availability
```
EVENT LIFECYCLE:
════════════════

┌─────────────┐
│   CREATED   │  ← Organizer creates event
│             │
│ Tickets: 0  │
└──────┬──────┘
       │
       │ Add ticket types
       │
       ▼
┌─────────────┐
│  ON SALE    │  ← Users can purchase
│             │
│ Available   │
│  Tickets    │
└──────┬──────┘
       │
       ├──────────┬──────────┐
       │          │          │
       ▼          ▼          ▼
┌──────────┐ ┌────────┐ ┌──────────┐
│ SELLING  │ │ SOLD   │ │ EXPIRED  │
│          │ │  OUT   │ │          │
│ Some     │ │        │ │ Event    │
│ tickets  │ │ 0/100  │ │ date     │
│ left     │ │ left   │ │ passed   │
└──────────┘ └───┬────┘ └──────────┘
                 │
                 │
                 ▼
          ┌─────────────┐
          │  WAITLIST   │
          │   ACTIVE    │
          │             │
          │ Users can   │
          │ join queue  │
          └─────────────┘
```

---

## 🚀 API Endpoints Summary

### Authentication
```
POST   /users/register          - Register new user
POST   /users/login             - Login user
POST   /users/organizer-register - Register organizer
POST   /users/organizer-login   - Login organizer
POST   /users/refresh-token     - Refresh JWT token
GET    /users/profile           - Get current user [AUTH]
```

### Events
```
GET    /events                  - Get all events (with filters)
GET    /events/:id              - Get event details
GET    /events/organizer/:id    - Get organizer's events [AUTH]
POST   /events                  - Create event [ORGANIZER]
PUT    /events/:id              - Update event [ORGANIZER]
DELETE /events/:id              - Delete event [ORGANIZER]
GET    /events/:id/analytics    - Get event analytics [ORGANIZER]
```

### Tickets
```
GET    /tickets/user/:userId    - Get user's tickets [AUTH]
GET    /tickets/event/:eventId  - Get event's tickets [ORGANIZER]
POST   /tickets                 - Purchase tickets [AUTH]
PUT    /tickets/:id/return      - Return ticket [AUTH]
PUT    /tickets/:id/refund      - Refund ticket [ORGANIZER]
PUT    /tickets/:id/accept      - Accept reserved ticket [AUTH]
PUT    /tickets/:id/decline     - Decline reserved ticket [AUTH]
```

### Ticket Types
```
GET    /ticket-types/:eventId   - Get ticket types for event
POST   /ticket-types            - Create ticket type [ORGANIZER]
DELETE /ticket-types/:id        - Delete ticket type [ORGANIZER]
PUT    /ticket-types/:id/recount - Recount tickets [ORGANIZER]
POST   /ticket-types/sync-all   - Sync all ticket counts [ORGANIZER]
```

### Waitlist
```
GET    /waitlist/event/:eventId  - Get event waitlist [ORGANIZER]
GET    /waitlist/user/:userId    - Get user's waitlist [AUTH]
POST   /waitlist                 - Join waitlist [AUTH]
DELETE /waitlist/:id             - Leave waitlist [AUTH]
DELETE /waitlist/remove/:id      - Remove from waitlist [ORGANIZER]
```

### Transactions
```
GET    /transactions/user/:userId  - Get user transactions [AUTH]
GET    /transactions/event/:eventId - Get event transactions [ORGANIZER]
```

---

## 📱 Mobile App Architecture

```
┌─────────────────────────────────────────┐
│         EXPO MOBILE APP                 │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────┐     │
│  │     App.js (Entry Point)       │     │
│  │                                 │     │
│  │  - WebView Component            │     │
│  │  - Loads: http://IP:5173        │     │
│  │  - Safe Area Handling           │     │
│  │  - Loading Indicator            │     │
│  └────────────┬────────────────────┘     │
│               │                          │
│               ▼                          │
│  ┌───────────────────────────────┐     │
│  │    React Web App Inside        │     │
│  │        WebView                 │     │
│  │                                 │     │
│  │  - All React components         │     │
│  │  - Full functionality           │     │
│  │  - API calls to backend         │     │
│  │  - Authentication works         │     │
│  └─────────────────────────────────┘     │
│                                         │
└─────────────────────────────────────────┘

MOBILE FEATURES:
═══════════════

✓ Responsive design adapts to mobile
✓ Touch-friendly buttons & forms
✓ Hamburger menu for sidebars
✓ Mobile-optimized font sizes
✓ Safe area insets for notch
✓ Smooth scrolling
✓ Loading states
```

---

## 💾 Data Flow Examples

### Example 1: Purchasing Tickets
```
1. User selects event
   ↓
2. Chooses ticket type & quantity
   ↓
3. Confirms purchase
   ↓
4. Frontend: POST /tickets
   {
     user_id: 5,
     event_id: 10,
     ticket_type_id: 3,
     quantity: 2,
     payment_method: 'card'
   }
   ↓
5. Backend:
   - START TRANSACTION
   - Check ticket availability
   - Create transaction record
   - Create ticket records (quantity: 2)
   - Update ticket_types.tickets_sold
   - Update events.tickets_sold
   - COMMIT TRANSACTION
   ↓
6. Response:
   {
     tickets: [{id: 101, ...}, {id: 102, ...}],
     transaction: {id: 50, status: 'completed'}
   }
   ↓
7. Frontend: Show success, redirect to profile
```

### Example 2: Joining Waitlist & Getting Ticket
```
1. User tries to buy sold-out event
   ↓
2. Sees "Join Waitlist" button
   ↓
3. Frontend: POST /waitlist
   {
     user_id: 5,
     event_id: 10
   }
   ↓
4. Backend:
   - Check if already in waitlist
   - Calculate position (ROW_NUMBER)
   - Insert into waitlist table
   ↓
5. Response:
   {
     message: "Added to waitlist",
     position: 3
   }
   ↓
6. User sees: "You're #3 in line"
   ↓
   
   [TIME PASSES - Someone returns ticket]
   
   ↓
7. Backend: assignTicketToWaitlist()
   - Get first user in waitlist
   - Create reserved ticket
   - Create pending transaction
   - Remove from waitlist
   ↓
8. User sees in profile: "Ticket Offer" section
   ↓
9. User clicks "Accept"
   ↓
10. Frontend: PUT /tickets/:id/accept
    ↓
11. Backend:
    - Update reserved ticket → active
    - Update transaction → completed
    - Find pending_return ticket → refunded
    ↓
12. Original owner gets refund
    New owner gets active ticket
```

---

## 🎯 Business Rules Summary

1. **User Roles**
   - `user`: Can purchase tickets, join waitlist
   - `organizer`: Can create events, manage tickets

2. **Event Rules**
   - Events must have at least one ticket type
   - Events can be created only by organizers
   - Organizers can only edit/delete their own events

3. **Ticket Rules**
   - Tickets can only be returned if event is sold out
   - Returned tickets go to waitlist (pending_return status)
   - User keeps ticket until someone else accepts it
   - Refund happens only when replacement buyer accepts

4. **Waitlist Rules**
   - Users join waitlist for sold-out events
   - Position is based on joined_at timestamp
   - Tickets offered in FIFO order
   - Users can accept or decline offers
   - Declined offers go to next in line

5. **Transaction Rules**
   - Every ticket purchase creates a transaction
   - Waitlist acceptances create new transactions
   - Transactions track payment method and status
   - Reference codes generated for tracking

---

## 📈 Performance Considerations

### Database Indexes
```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Events
CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_start_date ON events(start_datetime);

-- Tickets
CREATE INDEX idx_tickets_user ON tickets(user_id);
CREATE INDEX idx_tickets_event ON tickets(event_id);
CREATE INDEX idx_tickets_status ON tickets(status);

-- Waitlist
CREATE INDEX idx_waitlist_event_joined ON waitlist(event_id, joined_at);
```

### Query Optimization
- Use JOINs to fetch related data in single query
- Window functions (ROW_NUMBER) for waitlist positions
- Connection pooling for database connections
- Pagination for large result sets

---

## 🔒 Security Measures

1. **Password Security**
   - bcrypt hashing (salt rounds: 10)
   - Passwords never stored in plain text

2. **JWT Security**
   - Access token: 7 days expiry
   - Refresh token: 30 days expiry
   - Signed with secret key
   - Verified on every protected request

3. **Authorization**
   - Role-based access control
   - Ownership verification (users can only modify their own resources)
   - Input validation

4. **SQL Injection Prevention**
   - Parameterized queries
   - PostgreSQL prepared statements

5. **CORS**
   - Configured for frontend origin
   - Credentials enabled

---

This architecture supports the current MVP and is scalable for future enhancements like:
- QR code ticket validation
- Real payment gateway integration
- Push notifications
- Email notifications
- Analytics dashboard expansion
- Social features