# EventGo Native Mobile App

A complete React Native mobile application for EventGo event ticketing platform. Built with Expo and TypeScript, providing native iOS and Android experiences.

## Overview

This is a full native implementation (not WebView) of the EventGo platform for regular users. It includes:
- Event browsing and search
- Ticket purchasing
- Profile management
- Waitlist functionality
- Transaction history

**Note:** Organizer features are excluded from this mobile app version.

## Architecture

### Technology Stack
- **Framework:** React Native with Expo SDK 54
- **Language:** TypeScript 5.9
- **Navigation:** React Navigation 7.x (Native Stack)
- **State Management:** React Context API
- **HTTP Client:** Axios with token refresh interceptor
- **Storage:** @react-native-async-storage/async-storage
- **Icons:** @expo/vector-icons (Ionicons)

### Project Structure

```
mobile-app/
├── app/
│   └── index.tsx              # App root with AuthProvider
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── Button.tsx         # Primary/Secondary/Danger/Ghost variants
│   │   ├── TextInput.tsx      # Input with password toggle
│   │   ├── Card.tsx           # Container component
│   │   ├── LoadingSpinner.tsx # Loading states
│   │   └── Modal.tsx          # Confirm/Alert dialogs
│   ├── events/
│   │   └── EventCard.tsx      # Event list item display
│   └── tickets/
│       └── TicketCard.tsx     # Ticket display with actions
├── constants/
│   └── theme.ts               # Design system (colors, spacing, typography)
├── context/
│   └── AuthContext.tsx        # Authentication state management
├── navigation/
│   ├── AppNavigator.tsx       # Root navigator (auth/main switch)
│   └── MainNavigator.tsx      # Main app stack navigation
├── screens/
│   ├── auth/
│   │   ├── LoginScreen.tsx    # Login form with validation
│   │   └── RegisterScreen.tsx # Registration with password strength
│   ├── events/
│   │   ├── EventListScreen.tsx    # Events list with search
│   │   └── EventDetailScreen.tsx  # Event details + ticket purchase
│   └── profile/
│       ├── ProfileScreen.tsx      # Main profile with tabs
│       └── tabs/
│           ├── ProfileAccountTab.tsx      # Edit profile + delete account
│           ├── ProfileTicketsTab.tsx      # Purchased tickets list
│           ├── ProfileWaitlistTab.tsx     # Waitlist entries
│           ├── ProfileEventsTab.tsx       # Events user has tickets for
│           └── ProfileTransactionsTab.tsx # Transaction history
├── services/
│   ├── api.ts              # Axios client with interceptors
│   ├── authService.ts      # Login/Register endpoints
│   ├── eventService.ts     # Events and ticket purchasing
│   └── userService.ts      # Profile, tickets, waitlist, transactions
└── types/
    └── index.ts            # TypeScript type definitions
```

## Key Features

### Authentication
- JWT token-based authentication with refresh tokens
- Persistent login via AsyncStorage
- Automatic token refresh on 401 errors
- Token expiry validation (exp claim)
- Logout with token cleanup

### Events
- Browse all upcoming events
- Search events by title (500ms debounce)
- Pull-to-refresh functionality
- View event details (date, location, organizer)
- See ticket types with availability
- Purchase tickets with confirmation modal
- Join waitlist for sold-out events

### Profile Management
- **Account Tab:**
  - Edit first name, last name, email
  - Change password with strength validation
  - Delete account with confirmation
  
- **Tickets Tab:**
  - View all purchased tickets
  - Ticket status badges (active/reserved/pending_return/refunded)
  - Accept waitlist tickets
  - Decline waitlist tickets
  - Request refunds
  - Navigate to event details

- **Waitlist Tab:**
  - View all waitlist entries
  - See position in queue (#1, #2, etc.)
  - Leave waitlist with confirmation

- **Events Tab:**
  - Events user has tickets for
  - Navigate to event details

- **Transactions Tab:**
  - Purchase history
  - Refund records
  - Refund fee records
  - Amount with +/- indicators

## API Integration

### Base Configuration
```typescript
BASE_URL: http://192.168.1.201:5000
```

**Important:** Update this IP in `services/api.ts` to match your backend server's IP address.

### Endpoints Used

**Auth:**
- POST `/users/login` - User login
- POST `/users/register` - User registration
- POST `/users/refresh` - Refresh access token

**Events:**
- GET `/events` - Get all events (with optional search)
- GET `/events/:id` - Get event details
- GET `/events/:id/ticket-types` - Get available ticket types
- POST `/events/:eventId/ticket-types/:ticketTypeId/purchase` - Purchase ticket
- POST `/events/:eventId/ticket-types/:ticketTypeId/waitlist` - Join waitlist

**User:**
- PUT `/users/:id` - Update profile
- DELETE `/users/:id` - Delete account
- GET `/users/:id/tickets` - Get user's tickets
- GET `/users/:id/waitlist` - Get waitlist entries
- GET `/users/:id/events` - Get user's events
- GET `/users/:id/transactions` - Get transaction history
- POST `/tickets/:id/accept` - Accept waitlist ticket
- POST `/tickets/:id/decline` - Decline waitlist ticket
- DELETE `/tickets/:id/refund` - Request ticket refund
- DELETE `/waitlist/:id` - Leave waitlist

## Design System

### Colors
```typescript
primary: '#667eea'      // Purple
secondary: '#764ba2'    // Darker purple
background: '#0f1724'   // Dark blue-gray
card: '#1a2332'         // Card background
text: '#ffffff'         // White
textSecondary: '#94a3b8' // Gray
error: '#ef4444'        // Red
success: '#10b981'      // Green
warning: '#f59e0b'      // Orange
```

### Spacing Scale
```typescript
xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32
```

### Typography
- **h1:** 32px, weight 700
- **h2:** 24px, weight 600
- **h3:** 20px, weight 600
- **body:** 16px, weight 400

## Running the App

### Prerequisites
```bash
Node.js 18+
npm or yarn
Expo CLI
```

### Installation
```bash
cd mobile-app
npm install
```

### Development
```bash
# Start Expo dev server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### Testing on Device
1. Install Expo Go app on your phone
2. Scan QR code from `npm start`
3. Ensure phone and computer are on same WiFi network
4. Update API base URL in `services/api.ts` if needed

## Validation Rules

### Registration
- **First Name:** 2+ characters
- **Last Name:** 2+ characters
- **Email:** Valid email format (regex)
- **Password Requirements:**
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character (@$!%*?&)
- **Confirm Password:** Must match password

### Profile Update
- Same validation as registration
- Password is optional (leave blank to keep current)

## Components Reference

### Button
```tsx
<Button 
  title="Click Me"
  onPress={handlePress}
  variant="primary|secondary|danger|ghost"
  loading={false}
  disabled={false}
/>
```

### TextInput
```tsx
<TextInput
  label="Email"
  value={email}
  onChangeText={setEmail}
  error={errors.email}
  secureTextEntry={false}
  keyboardType="email-address"
/>
```

### Card
```tsx
<Card style={customStyles}>
  <Text>Content</Text>
</Card>
```

### Modal
```tsx
<Modal
  visible={showModal}
  type="confirm|alert"
  title="Confirm Action"
  message="Are you sure?"
  confirmText="Yes"
  cancelText="No"
  onConfirm={handleConfirm}
  onCancel={handleCancel}
/>
```

### EventCard
```tsx
<EventCard
  event={eventObject}
  onPress={handlePress}
/>
```

### TicketCard
```tsx
<TicketCard
  ticket={ticketObject}
  onAccept={handleAccept}
  onDecline={handleDecline}
  onRefund={handleRefund}
  onViewEvent={handleViewEvent}
/>
```

## Navigation Structure

```
AppNavigator (Root)
├── Auth Stack (Not authenticated)
│   ├── LoginScreen
│   └── RegisterScreen
└── Main Stack (Authenticated)
    ├── EventListScreen (Home)
    ├── EventDetailScreen
    └── ProfileScreen
```

## Context API

### AuthContext
```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}
```

## Token Management

### Flow
1. Login/Register → Receive access token + refresh token
2. Store both tokens in AsyncStorage
3. Attach access token to all API requests (Authorization header)
4. On 401 error → Attempt refresh with refresh token
5. If refresh succeeds → Update tokens and retry original request
6. If refresh fails → Logout user

### Token Expiry Check
```typescript
isTokenExpired(token: string): boolean
```
Checks JWT `exp` claim with 1-minute buffer.

## Error Handling

### API Errors
- Network errors: Display user-friendly message
- 400 Bad Request: Show validation errors
- 401 Unauthorized: Attempt token refresh or logout
- 404 Not Found: "Resource not found"
- 500 Server Error: "Something went wrong"

### UI Error Display
- Form validation errors: Red text below inputs
- API errors: Alert dialogs with error message
- Loading states: Spinner overlay or inline spinner

## Styling Best Practices

1. **Use theme constants:** Import from `constants/theme.ts`
2. **StyleSheet.create:** Always use for performance
3. **Responsive design:** Use flex layouts
4. **Consistent spacing:** Use theme spacing scale
5. **Color consistency:** Only use theme colors

## Future Enhancements

Potential features for future versions:
- [ ] Push notifications for waitlist promotions
- [ ] QR code ticket scanning
- [ ] Ticket transfers between users
- [ ] Favorites/Bookmarks for events
- [ ] Event recommendations
- [ ] Social sharing
- [ ] Calendar integration
- [ ] Offline mode support
- [ ] Biometric authentication
- [ ] Dark/Light theme toggle

## Troubleshooting

### Common Issues

**1. Cannot connect to API**
- Verify backend is running on port 5000
- Update BASE_URL in `services/api.ts`
- Check firewall settings
- Ensure device and computer on same network

**2. Token refresh failing**
- Check refresh token expiry (30 days default)
- Verify backend refresh endpoint
- Clear AsyncStorage and re-login

**3. Navigation not working**
- Ensure react-navigation packages installed
- Check navigator hierarchy in AppNavigator.tsx
- Verify screen names match navigation calls

**4. Styles not applying**
- Check import paths for theme constants
- Use StyleSheet.create
- Verify color values from theme

**5. Form validation not working**
- Check regex patterns in validation functions
- Ensure error state is being set
- Verify error prop passed to TextInput

## Development Notes

- **Expo Router:** Using Expo Router entry point (`expo-router/entry`)
- **Safe Area:** Already configured via react-native-safe-area-context
- **Gestures:** react-native-gesture-handler included for navigation
- **Reanimated:** Available for animations (not currently used)
- **TypeScript:** Strict mode enabled in tsconfig.json

## Backend Requirements

This mobile app requires the following backend endpoints to function:
- User authentication (login, register, refresh)
- Event management (list, details, ticket types)
- Ticket purchasing and refunds
- Waitlist management
- User profile updates
- Transaction history

Ensure your backend API matches the expected request/response formats defined in the service files.

## Credits

Built for EventGo event ticketing platform.
Design matches web frontend for consistent user experience.

## License

Private - Not for distribution
