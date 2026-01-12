# EventGo - Complete Technology Stack

## 📋 Table of Contents
- [Programming Languages](#programming-languages)
- [Backend Stack](#backend-stack)
- [Frontend Stack](#frontend-stack)
- [Mobile App Stack](#mobile-app-stack)
- [Database & Infrastructure](#database--infrastructure)
- [Development Tools](#development-tools)
- [APIs & Documentation](#apis--documentation)

---

## 🔤 Programming Languages

| Language | Usage | Version |
|----------|-------|---------|
| **JavaScript (ES6+)** | Backend (Node.js), Frontend | ES2015+ |
| **TypeScript** | Mobile App (React Native) | ~5.9.2 |
| **SQL** | Database queries and migrations | PostgreSQL 16 |
| **CSS3** | Frontend styling | - |
| **HTML5** | Frontend markup | - |

---

## 🔧 Backend Stack

### Core Technologies
- **Node.js** - JavaScript runtime environment
- **Express.js** (^4.19.2) - Web application framework
- **PostgreSQL** (16) - Relational database

### Backend Libraries & Dependencies

#### Web Framework & Middleware
- **express** (^4.19.2) - Fast, unopinionated web framework
- **cors** (^2.8.5) - Cross-Origin Resource Sharing middleware

#### Database
- **pg** (^8.11.3) - PostgreSQL client for Node.js

#### Security & Validation
- **validator** (^13.15.23) - String validation and sanitization
- **dompurify** (^3.3.0) - XSS sanitizer for HTML

#### HTTP Client
- **axios** (^1.13.2) - Promise-based HTTP client

#### Environment & Configuration
- **dotenv** (^16.3.1) - Environment variable management

#### API Documentation
- **swagger-jsdoc** (^6.2.8) - Swagger/OpenAPI documentation generator
- **swagger-ui-express** (^5.0.1) - Swagger UI for Express

#### Development Tools
- **nodemon** (^3.1.0) - Auto-restart server on file changes

---

## 🎨 Frontend Stack

### Core Technologies
- **React** (^19.1.1) - UI library
- **Vite** (^7.1.7) - Build tool and dev server

### Frontend Libraries & Dependencies

#### Routing
- **react-router-dom** (^7.9.5) - Client-side routing

#### HTTP Client
- **axios** (^1.13.1) - API communication

#### UI Components & Icons
- **lucide-react** (^0.553.0) - Icon library

#### Security
- **dompurify** (^3.3.0) - XSS sanitizer

#### Development & Build Tools
- **@vitejs/plugin-react** (^5.0.4) - Vite React plugin
- **eslint** (^9.36.0) - JavaScript linter
- **eslint-plugin-react-hooks** (^5.2.0) - React Hooks linting
- **eslint-plugin-react-refresh** (^0.4.22) - React Fast Refresh linting

---

## 📱 Mobile App Stack

### Core Technologies
- **React Native** (0.81.5) - Mobile framework
- **Expo** (~54.0.25) - React Native development platform
- **TypeScript** (~5.9.2) - Type-safe JavaScript

### Mobile App Libraries & Dependencies

#### Navigation
- **expo-router** (~6.0.15) - File-based routing for React Native
- **@react-navigation/native** (^7.1.21) - Navigation library
- **@react-navigation/native-stack** (^7.8.0) - Stack navigator
- **@react-navigation/bottom-tabs** (^7.4.0) - Bottom tab navigation
- **@react-navigation/elements** (^2.6.3) - Navigation elements

#### UI & Components
- **@expo/vector-icons** (^15.0.3) - Icon sets
- **expo-symbols** (~1.0.7) - SF Symbols for iOS

#### Animations & Gestures
- **react-native-gesture-handler** (~2.28.0) - Touch & gesture handling
- **react-native-reanimated** (~4.1.1) - Animation library
- **react-native-worklets** (0.5.1) - JavaScript worklets

#### Screen & Layout
- **react-native-safe-area-context** (~5.6.0) - Safe area boundaries
- **react-native-screens** (~4.16.0) - Native screen optimization

#### Expo Modules
- **expo-constants** (~18.0.10) - System constants
- **expo-font** (~14.0.9) - Custom fonts
- **expo-haptics** (~15.0.7) - Haptic feedback
- **expo-image** (~3.0.10) - Optimized image component
- **expo-linking** (~8.0.9) - Deep linking
- **expo-splash-screen** (~31.0.11) - Splash screen
- **expo-status-bar** (~3.0.8) - Status bar
- **expo-system-ui** (~6.0.8) - System UI settings
- **expo-web-browser** (~15.0.9) - In-app browser

#### HTTP & Storage
- **axios** (^1.13.2) - HTTP client
- **@react-native-async-storage/async-storage** (^2.2.0) - Persistent storage

#### Web Support
- **react-native-web** (~0.21.0) - React Native for Web
- **react-native-webview** (13.15.0) - WebView component

#### Development Tools
- **eslint** (^9.25.0) - Linting
- **eslint-config-expo** (~10.0.0) - Expo ESLint config

---

## 💾 Database & Infrastructure

### Database
- **PostgreSQL 16** - Primary relational database
  - User management
  - Event management
  - Ticket system
  - Transaction tracking
  - Waitlist management

### Database Tools
- **pgAdmin 4** (dpage/pgadmin4) - Database administration interface

### Containerization
- **Docker** - Container platform
- **Docker Compose** (v3.9) - Multi-container orchestration

### Container Images
- **postgres:16** - PostgreSQL database
- **dpage/pgadmin4** - Database management UI

---

## 🛠️ Development Tools

### Package Managers
- **npm** - Node package manager
- **npx** - Package runner

### Version Control
- **Git** - Version control system

### Code Quality
- **ESLint** - JavaScript/TypeScript linter
  - Backend: ^9.36.0
  - Frontend: ^9.36.0
  - Mobile: ^9.25.0

### Build Tools
- **Vite** (^7.1.7) - Frontend build tool
- **Expo CLI** - Mobile app development

### Development Servers
- **Nodemon** (^3.1.0) - Backend auto-reload
- **Vite Dev Server** - Frontend hot reload
- **Expo Dev Server** - Mobile app development server

---

## 📚 APIs & Documentation

### API Standards
- **RESTful API** - API architecture pattern
- **OpenAPI/Swagger 3.0** - API specification

### Documentation Tools
- **Swagger UI** - Interactive API documentation
- **Swagger JSDoc** - Generate docs from code comments

### API Features
- CRUD operations for events, tickets, users
- Authentication & authorization
- Transaction management
- Waitlist system
- File upload handling

---

## 🏗️ Architecture Patterns

### Backend
- **MVC Pattern** - Model-View-Controller architecture
- **Middleware Architecture** - Request/response pipeline
- **Service Layer** - Business logic separation
- **Repository Pattern** - Database abstraction

### Frontend
- **Component-Based Architecture** - React components
- **Context API** - State management
- **Custom Hooks** - Reusable logic
- **File-based Routing** - React Router

### Mobile
- **Component-Based Architecture** - React Native components
- **Context API** - Global state management
- **File-based Routing** - Expo Router
- **Screen-based Navigation** - Navigation containers

---

## 🔐 Security Technologies

- **CORS** - Cross-origin resource sharing
- **DOMPurify** - XSS protection
- **Validator.js** - Input validation
- **Environment Variables** - Sensitive data management
- **SQL Parameterized Queries** - SQL injection prevention

---

## 📦 Additional Libraries

### Utility Libraries
- **validator** - String validation & sanitization
- **dompurify** - HTML sanitization
- **axios** - HTTP requests

### React Ecosystem
- **react-dom** - React DOM renderer
- **react-router-dom** - React routing

### Development Dependencies
- **@types/react** - React TypeScript types
- **@types/react-dom** - React DOM TypeScript types
- **globals** - Global variables for ESLint

---

## 🌐 Supported Platforms

- **Web Browsers** - Chrome, Firefox, Safari, Edge
- **iOS** - iPhone & iPad (via Expo)
- **Android** - Phones & Tablets (via Expo)
- **Desktop** - Windows, macOS, Linux (via Docker)

---

## 📊 Project Statistics

- **Total Dependencies**: ~80+ packages
- **Programming Languages**: 5 (JavaScript, TypeScript, SQL, CSS, HTML)
- **Platforms**: 3 (Web, iOS, Android)
- **Database Tables**: 10+ tables
- **API Endpoints**: 50+ endpoints

---

## 🚀 Deployment & Hosting

### Infrastructure as Code
- Docker Compose configuration
- Environment-based configuration
- Volume management for data persistence

### Database Management
- Migration scripts
- Seed data scripts
- Backup & restore capabilities

---

**Last Updated**: January 12, 2026
**Project**: EventGo - Event Management Platform
**Version**: 1.0.0
