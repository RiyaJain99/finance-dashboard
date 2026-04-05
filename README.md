# Finance Dashboard API

Production-grade REST API for a Finance Dashboard — built with Node.js, Express, MongoDB, and JWT authentication.

---

## Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ (ESM) |
| Framework | Express 4 |
| Database | MongoDB via Mongoose 8 |
| Auth | JWT (access + refresh tokens) |
| Validation | Joi |
| Logging | Winston + Morgan |
| Rate Limiting | express-rate-limit |
| Docs | Swagger / OpenAPI 3.0 |
| Security | Helmet, CORS, mongo-sanitize |

---

## Project Structure

```
src/
├── config/
│   ├── database.js        # Mongoose connection with pooling
│   └── swagger.js         # OpenAPI spec config
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── recordController.js
│   └── analyticsController.js
├── services/
│   ├── authService.js     # Register, login, token refresh
│   ├── userService.js     # User CRUD, role/status management
│   ├── recordService.js   # Financial records CRUD
│   └── analyticsService.js # Aggregation pipelines
├── models/
│   ├── User.js            # Role, status, bcrypt hooks
│   └── Record.js          # Soft delete, auto-exclude middleware
├── middleware/
│   ├── authenticate.js    # JWT verification, user hydration
│   ├── authorize.js       # RBAC (authorize / requireRole)
│   ├── validate.js        # Joi schema validation
│   ├── rateLimiter.js     # Auth + API rate limiters
│   └── errorHandler.js    # Centralized error handling
├── validators/
│   ├── authValidators.js
│   ├── userValidators.js
│   └── recordValidators.js
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── recordRoutes.js
│   └── analyticsRoutes.js
├── utils/
│   ├── logger.js          # Winston with daily rotation
│   ├── jwt.js             # Token generation / verification
│   ├── errors.js          # Typed error classes
│   ├── response.js        # Consistent response helpers
│   └── seeder.js          # Dev database seeder
├── app.js                 # Express app configuration
└── server.js              # Entry point, graceful shutdown
```

---

## Setup

### Prerequisites

- Node.js >= 18
- MongoDB (local or Atlas)

### Installation

```bash
# 1. Clone and install
git clone <repo-url>
cd finance-dashboard
npm install

# 2. Configure environment
cp .env.example .env
```

Edit `.env`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/finance_dashboard
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRES_IN=30d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
LOG_LEVEL=info
ALLOWED_ORIGINS=http://localhost:3000
```

### Run

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start

# Seed database with sample data
npm run seed

# Wipe and re-seed
npm run seed:fresh
```

API Documentation available at: **http://localhost:5000/api-docs**

Health check: **GET http://localhost:5000/health**

---

## Role-Based Access Control

| Endpoint Group | Viewer | Analyst | Admin |
|---|:---:|:---:|:---:|
| Auth (register, login) | ✅ | ✅ | ✅ |
| Read own records | ✅ | ✅ | ✅ |
| Create / update / delete records | ❌ | ✅ | ✅ |
| Analytics & dashboard | ❌ | ✅ | ✅ |
| Read all users' records | ❌ | ❌ | ✅ |
| User management | ❌ | ❌ | ✅ |

---

## API Endpoints

### Auth — `/api/v1/auth`

| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/register` | Register new user | Public |
| POST | `/login` | Login, receive tokens | Public |
| POST | `/refresh` | Refresh access token | Public |
| GET | `/me` | Get current user | Any |
| PUT | `/change-password` | Change password | Any |

### Users — `/api/v1/users` (Admin only)

| Method | Path | Description |
|---|---|---|
| GET | `/` | List users (paginated, filterable) |
| GET | `/:id` | Get user by ID |
| PUT | `/:id` | Update user details |
| DELETE | `/:id` | Delete user |
| PATCH | `/:id/role` | Assign role |
| PATCH | `/:id/status` | Activate / deactivate |

### Records — `/api/v1/records`

| Method | Path | Description | Min Role |
|---|---|---|---|
| GET | `/` | List records (paginated, filterable) | Viewer |
| POST | `/` | Create record | Analyst |
| GET | `/:id` | Get record by ID | Viewer |
| PUT | `/:id` | Update record | Analyst |
| DELETE | `/:id` | Soft delete record | Analyst |

**Query Parameters for GET /records:**
- `page`, `limit` — pagination
- `type` — `income` or `expense`
- `category` — partial match
- `startDate`, `endDate` — ISO date range
- `search` — search in notes
- `sortBy` — `date` | `amount` | `createdAt`
- `sortOrder` — `asc` | `desc`

### Analytics — `/api/v1/analytics` (Analyst + Admin)

| Method | Path | Description |
|---|---|---|
| GET | `/summary` | Total income, expenses, net balance |
| GET | `/categories` | Breakdown by category |
| GET | `/trends` | Monthly income vs expense trends |
| GET | `/recent` | Most recent transactions |
| GET | `/top-categories` | Top N categories by total |

---

## Example Requests

### Register

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Secret123",
  "role": "analyst"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "analyst",
      "status": "active"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "jane@example.com",
  "password": "Secret123"
}
```

### Create a Financial Record

```http
POST /api/v1/records
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "amount": 4500.00,
  "type": "income",
  "category": "Salary",
  "date": "2024-01-15",
  "notes": "January salary payment"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Record created successfully",
  "data": {
    "record": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
      "amount": 4500,
      "type": "income",
      "category": "Salary",
      "date": "2024-01-15T00:00:00.000Z",
      "notes": "January salary payment",
      "createdBy": {
        "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
        "name": "Jane Doe",
        "email": "jane@example.com"
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### Get Records with Filters

```http
GET /api/v1/records?type=expense&startDate=2024-01-01&endDate=2024-01-31&page=1&limit=10
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "success": true,
  "message": "Records retrieved successfully",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 34,
    "pages": 4,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Dashboard Summary

```http
GET /api/v1/analytics/summary?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "summary": {
      "totalIncome": 54000.00,
      "totalExpenses": 38250.75,
      "netBalance": 15749.25,
      "totalRecords": 98,
      "incomeCount": 24,
      "expenseCount": 74
    }
  }
}
```

### Monthly Trends

```http
GET /api/v1/analytics/trends?year=2024
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "trends": {
      "year": 2024,
      "months": [
        { "month": 1, "monthName": "Jan", "income": 4500, "expenses": 3200, "net": 1300 },
        { "month": 2, "monthName": "Feb", "income": 4500, "expenses": 2900, "net": 1600 },
        ...
      ]
    }
  }
}
```

### Assign Role (Admin)

```http
PATCH /api/v1/users/64f1a2b3c4d5e6f7a8b9c0d1/role
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "role": "analyst"
}
```

---

## Error Response Format

All errors return a consistent structure:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "errors": [
      { "field": "amount", "message": "amount must be a positive number" }
    ]
  }
}
```

**Error Codes:**

| Code | HTTP | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 422 | Input validation failed |
| `AUTHENTICATION_ERROR` | 401 | Missing or invalid token |
| `AUTHORIZATION_ERROR` | 403 | Insufficient role permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Duplicate resource (e.g. email) |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |

---

## Design Decisions

**Soft Delete** — Records are never permanently removed. An `isDeleted` flag is set, and a Mongoose `pre(/^find/)` hook automatically filters them from all queries. Pass `{ includeDeleted: true }` in query options to bypass.

**Token Invalidation** — Tokens issued before a password change are rejected by comparing `iat` (issued-at) against `passwordChangedAt`.

**Ownership Enforcement** — Non-admin users can only read, update, and delete their own records. Admins have unrestricted access to all records.

**Aggregation Normalization** — Monthly trends always return all 12 months (with zeros for months without data) to simplify frontend charting.

**Error Taxonomy** — Typed error classes (`AppError`, `ValidationError`, `AuthenticationError`, etc.) allow precise HTTP status codes and error codes without any `if-else` chains in route handlers.
