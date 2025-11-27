# Environment Configuration Guide

## Overview

Each part of the EventGo application (backend, frontend, mobile-app) has its own `.env` file for configuration. This keeps sensitive data out of version control and makes deployment easier.

## Setup Instructions

### 1. Backend Configuration

**Location:** `backend/.env`

Copy the example file and update with your values:
```bash
cd backend
cp .env.example .env
```

**Required Variables:**
```env
# Database Configuration
DB_USER=eventgo_user
DB_PASSWORD=eventgo_pass
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eventgo

# Server Configuration
PORT=5000

# JWT Secret
JWT_SECRET=super_secret_eventgo_key
```

### 2. Frontend Configuration

**Location:** `frontend/.env`

Copy the example file and update with your values:
```bash
cd frontend
cp .env.example .env
```

**Required Variables:**
```env
# Backend API URL
VITE_API_URL=http://localhost:5000
```

**Note:** Vite requires the `VITE_` prefix for environment variables to be exposed to client code.

**For Network Access:**
If you want to access the frontend from other devices on your network, use your IP address:
```env
VITE_API_URL=http://YOUR_IP_ADDRESS:5000
```

### 3. Mobile App Configuration

**Location:** `mobile-app/.env`

Copy the example file and update with your values:
```bash
cd mobile-app
cp .env.example .env
```

**Required Variables:**
```env
# Backend API URL (must use IP address, not localhost)
EXPO_PUBLIC_API_URL=http://YOUR_IP_ADDRESS:5000
```

**Note:** Expo requires the `EXPO_PUBLIC_` prefix for environment variables to be exposed to client code.

**Important:** Mobile apps cannot use `localhost` - you must use your computer's actual IP address.

## Finding Your IP Address

### Windows
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter (usually WiFi or Ethernet).

### Mac/Linux
```bash
ifconfig
# or
ip addr show
```

### Common Example
If your IP is `192.168.1.100`, your mobile app `.env` should be:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:5000
```

## Important Notes

### Security
- ✅ `.env` files are excluded from git (listed in `.gitignore`)
- ✅ `.env.example` files are committed to show required variables
- ⚠️ Never commit actual `.env` files with real credentials
- ⚠️ Use strong, unique values for `JWT_SECRET` in production

### Network Requirements
For the mobile app to work:
1. Your computer (running backend) and phone must be on the **same WiFi network**
2. Use your computer's **IP address** (not localhost) in `EXPO_PUBLIC_API_URL`
3. Make sure your firewall allows connections on port 5000

### After Changing .env Files
- **Backend:** Restart the server (`npm start`)
- **Frontend:** Restart the dev server (`npm run dev`)
- **Mobile App:** Restart Expo (`npm start`, then clear cache if needed)

## Troubleshooting

### Mobile App Can't Connect
1. Verify your IP address hasn't changed
2. Check both devices are on the same WiFi network
3. Verify backend is running on the correct port
4. Check firewall settings
5. Try restarting the Expo dev server

### Frontend Can't Connect
1. Check `VITE_API_URL` matches your backend URL
2. Verify backend is running
3. Check for CORS issues in backend logs

### Environment Variables Not Loading
- **Vite (Frontend):** Restart dev server after changing `.env`
- **Expo (Mobile):** Clear cache with `expo start -c`
- **Backend:** Restart the Node.js server

## Development vs Production

### Development (Current Setup)
```env
# Backend
PORT=5000

# Frontend
VITE_API_URL=http://localhost:5000

# Mobile App
EXPO_PUBLIC_API_URL=http://192.168.1.100:5000
```

### Production Example
```env
# Backend
PORT=5000
NODE_ENV=production
DB_HOST=production-db-host.com

# Frontend
VITE_API_URL=https://api.eventgo.com

# Mobile App
EXPO_PUBLIC_API_URL=https://api.eventgo.com
```
