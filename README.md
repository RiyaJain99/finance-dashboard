<div align="center">

![header](https://capsule-render.vercel.app/api?type=waving&color=0:0d1117,30:1a237e,60:1565c0,100:0d47a1&height=220&section=header&text=💰%20Finance%20Dashboard%20API&fontSize=42&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Production-grade%20REST%20API%20·%20Node.js%20·%20MongoDB%20·%20JWT&descSize=16&descAlignY=58&descFontColor=90CAF9)

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io)
[![Swagger](https://img.shields.io/badge/Swagger-Docs-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://swagger.io)
[![Render](https://img.shields.io/badge/Live%20API-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://finance-dashboard-hho6.onrender.com/api-docs)

### 🌐 [Live API Docs →](https://finance-dashboard-hho6.onrender.com/api-docs) &nbsp;|&nbsp; [Health Check →](https://finance-dashboard-hho6.onrender.com/health)

</div>

---

## ✨ What's Inside

> A fully featured, production-ready backend for a finance dashboard — with role-based access control, JWT authentication, financial record management, and aggregated analytics. Built to be clean, secure, and scalable.

```
POST /auth/login          →  JWT access + refresh tokens
GET  /analytics/summary   →  Income, expenses, net balance
GET  /analytics/trends    →  Monthly breakdown (all 12 months)
GET  /records             →  Paginated, filterable, sortable
```

---

## 🏗️ Architecture

```
src/
├── config/           # DB connection, Swagger spec
├── controllers/      # Route handlers (auth, users, records, analytics)
├── services/         # Business logic layer
├── models/           # Mongoose schemas (User, Record)
├── middleware/       # JWT auth, RBAC, validation, rate limiting
├── validators/       # Joi schemas
├── routes/           # Express routers
└── utils/            # Logger, JWT helpers, error classes, seeder
```

**Key design choices:**
- **Service layer** separates business logic from controllers — no fat controllers
- **Typed error classes** (`AuthenticationError`, `ValidationError`, etc.) eliminate if-else chains
- **Soft delete** via Mongoose pre-query hook — deleted records are invisible by default
- **Token invalidation** — tokens issued before a password change are automatically rejected

---

## 🔐 Role-Based Access Control

| Endpoint | Viewer | Analyst | Admin |
|---|:---:|:---:|:---:|
| Login / Register | ✅ | ✅ | ✅ |
| View own records | ✅ | ✅ | ✅ |
| Create / edit / delete records | ❌ | ✅ | ✅ |
| Analytics & dashboard | ❌ | ✅ | ✅ |
| View all users' records | ❌ | ❌ | ✅ |
| User management | ❌ | ❌ | ✅ |

---

## 🚀 Quick Start

```bash
# 1. Clone and install
git clone https://github.com/RiyaJain99/finance-dashboard.git
cd finance-dashboard
npm install

# 2. Configure environment
cp .env.example .env
# → Fill in MONGODB_URI and generate JWT secrets

# 3. Seed the database
npm run seed

# 4. Start dev server
npm run dev
# → http://localhost:3001/api-docs
```

**Generate secure JWT secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 📡 API Reference

### Auth — `/api/v1/auth`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/register` | Register new user | Public |
| `POST` | `/login` | Login → JWT tokens | Public |
| `POST` | `/refresh` | Refresh access token | Public |
| `GET` | `/me` | Current user profile | Any |
| `PUT` | `/change-password` | Update password | Any |

### Records — `/api/v1/records`
| Method | Endpoint | Description | Min Role |
|---|---|---|---|
| `GET` | `/` | List records (paginated + filtered) | Viewer |
| `POST` | `/` | Create record | Analyst |
| `GET` | `/:id` | Get by ID | Viewer |
| `PUT` | `/:id` | Update record | Analyst |
| `DELETE` | `/:id` | Soft delete | Analyst |

**Query params:** `page`, `limit`, `type`, `category`, `startDate`, `endDate`, `search`, `sortBy`, `sortOrder`

### Analytics — `/api/v1/analytics`
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/summary` | Total income, expenses, net balance |
| `GET` | `/categories` | Spending grouped by category |
| `GET` | `/trends` | Monthly income vs expense (all 12 months) |
| `GET` | `/recent` | Most recent transactions |
| `GET` | `/top-categories` | Top N categories by amount |

### Users — `/api/v1/users` *(Admin only)*
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | List users (paginated) |
| `GET` | `/:id` | Get user by ID |
| `PUT` | `/:id` | Update user |
| `DELETE` | `/:id` | Delete user |
| `PATCH` | `/:id/role` | Assign role |
| `PATCH` | `/:id/status` | Activate / deactivate |

---

## 🧪 Test Credentials

After running `npm run seed`:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@example.com` | `Admin123!` |
| Analyst | `analyst@example.com` | `Analyst123!` |
| Viewer | `viewer@example.com` | `Viewer123!` |

> **Try it live:** [API Docs →](https://finance-dashboard-hho6.onrender.com/api-docs)
> 1. Hit `POST /auth/login` with admin credentials
> 2. Copy the `accessToken`
> 3. Click **Authorize** and paste it in
> 4. Explore all endpoints

---

## 🛡️ Security Features

- **Helmet** — sets secure HTTP headers
- **CORS** — configurable allowed origins
- **mongo-sanitize** — prevents NoSQL injection
- **Rate limiting** — 20 req/15min on auth, 100 req/15min on API
- **Bcrypt** — password hashing with salt rounds
- **JWT expiry** — short-lived access tokens (7d) + refresh tokens (30d)

---

## 📊 Error Responses

All errors follow a consistent structure:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "errors": [
      { "field": "amount", "message": "must be a positive number" }
    ]
  }
}
```

| Code | HTTP | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 422 | Invalid input |
| `AUTHENTICATION_ERROR` | 401 | Missing or invalid token |
| `AUTHORIZATION_ERROR` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Duplicate (e.g. email) |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected error |

---

## 🧰 Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ (ESM) |
| Framework | Express 4 |
| Database | MongoDB via Mongoose 8 |
| Auth | JWT (access + refresh tokens) |
| Validation | Joi |
| Logging | Winston + Morgan + daily rotation |
| Rate Limiting | express-rate-limit |
| Docs | Swagger / OpenAPI 3.0 |
| Security | Helmet, CORS, mongo-sanitize |

---

<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=14&duration=3000&pause=1000&color=6CDDFF&center=true&vCenter=true&width=600&lines=Built+with+Node.js+%7C+Deployed+on+Render+%7C+Documented+with+Swagger" alt="footer text" />

![footer](https://capsule-render.vercel.app/api?type=waving&color=0:0d47a1,60:1565c0,100:0d1117&height=100&section=footer)

</div>
