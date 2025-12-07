# EventGo API Documentation

## Swagger/OpenAPI Documentation

The EventGo API now includes comprehensive Swagger documentation for all endpoints.

### Accessing the Documentation

1. **Start the backend server**:
   ```bash
   cd backend
   npm start
   ```

2. **Open your browser** and navigate to:
   ```
   http://localhost:5000/api-docs
   ```

### Features

- **Interactive API Explorer**: Test endpoints directly from the browser
- **Authentication**: Use the "Authorize" button to add your JWT token
- **Request/Response Examples**: See sample requests and responses
- **Schema Documentation**: View all data models and their properties
- **Filter & Search**: Filter endpoints by tags (Users, Events, Tickets, etc.)

### How to Use

1. **Browse Endpoints**: Expand any endpoint to see details
2. **Try it Out**: Click "Try it out" button on any endpoint
3. **Add Authentication**:
   - Click the "Authorize" button (🔒) at the top
   - Enter your JWT token: `Bearer <your-token>`
   - Click "Authorize"
4. **Execute Requests**: Fill in parameters and click "Execute"
5. **View Responses**: See the response code, headers, and body

### API Sections

- **Users**: Registration, login, profile management
- **Events**: Event creation, listing, filtering, management
- **Tickets**: Ticket purchasing, listing, refunds
- **Ticket Types**: Ticket type management for events
- **Transactions**: Transaction history and management
- **Waitlist**: Waitlist management for sold-out events

### Authentication

Most endpoints require authentication using JWT tokens:

1. **Register or Login** to get a token
2. **Click "Authorize"** in Swagger UI
3. **Enter**: `Bearer <your-token-here>`
4. All subsequent requests will include the token

### Example Workflow

1. Register a new user: `POST /users/register`
2. Copy the returned token
3. Click "Authorize" and paste the token
4. Create an event: `POST /events` (requires organizer role)
5. Browse events: `GET /events`
6. Purchase tickets: `POST /tickets`

### Development

To add documentation to new endpoints, use JSDoc comments:

```javascript
/**
 * @swagger
 * /your-endpoint:
 *   get:
 *     summary: Short description
 *     tags: [TagName]
 *     parameters:
 *       - in: query
 *         name: paramName
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success response
 */
router.get("/your-endpoint", async (req, res) => {
  // Your code
});
```

### Schema Definitions

All data models are defined in `backend/swagger.js`:
- User
- Event
- Ticket
- TicketType
- Transaction
- Waitlist

### Notes

- The documentation is automatically generated from JSDoc comments
- Swagger UI is accessible only when the backend server is running
- Authentication tokens expire after a set time (check token settings)

## Useful Links

- **Swagger UI**: http://localhost:5000/api-docs
- **API Base URL**: http://localhost:5000
- **Swagger Specification**: https://swagger.io/specification/
