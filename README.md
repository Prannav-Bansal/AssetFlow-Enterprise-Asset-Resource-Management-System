# AssetFlow — Enterprise Asset & Resource Management System

Full-stack MERN application for tracking assets, allocations, bookings,
maintenance, and audits. This is a monorepo with two deployable apps:

| App | Path | Stack |
|-----|------|-------|
| **Backend API** | `server/` | Node.js + Express + MongoDB (Mongoose) |
| **Frontend** | `frontend/AssetFlow-Enterprise-Asset-Resource-Management-System/` | Next.js 16 + React 19 + Tailwind |

The frontend talks to the backend over REST; both are deployed separately on
Render (see **Deployment** below).

## Tech Stack

- **Runtime**: Node.js 20 + Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (access + refresh with rotation) + bcrypt
- **Validation**: Joi
- **Uploads**: Multer → Cloudinary (falls back to local disk if no keys)
- **Scheduling**: node-cron
- **Security**: helmet, cors, express-rate-limit

## Getting Started

```bash
cd server
npm install

# copy env template and fill in values (a working dev .env is already included)
cp ../.env.example .env

# load the rich demo dataset (roles, users, assets, allocations, bookings...)
npm run seed

# start the API (nodemon)
npm run dev
# or: npm start
```

The API boots at `http://localhost:5000`. Health check: `GET /api/health`.

### Demo credentials (after seeding)

| Role  | Email | Password |
|-------|-------|----------|
| Admin | `admin@assetflow.com` | `Admin@123` |
| User  | `aarav.sharma@assetflow.com` | `Password@123` |

> All seeded non-admin users share the password `Password@123`.

## Project Layout

```
server/
├── config/        # db connection, cloudinary, enums/constants
├── models/        # 14 Mongoose schemas (1:1 with the ERD) + Counter
├── validators/    # Joi request schemas
├── middleware/    # auth, role guard, validation, upload, error handling
├── services/      # business logic (asset lifecycle, booking overlap, audit,
│                  #   notifications, activity log)
├── controllers/   # request handlers (thin — delegate to services)
├── routes/        # Express routers, mounted in routes/index.js
├── jobs/          # cron jobs (overdue, booking reminder, auto-complete)
├── seed/          # database seeder
├── app.js         # Express app factory
└── server.js      # entry point (connect DB → listen → start jobs)
```

## Conventions

- **Response envelope** — every endpoint returns
  `{ success, message, data, meta? }`. Errors return
  `{ success: false, message, details? }`.
- **Auth** — send `Authorization: Bearer <accessToken>`. Refresh via
  `POST /api/auth/refresh` with the refresh token (rotated on each use).
- **Roles** — `Admin`, `Asset Manager`, `Department Head`, `Employee`.
  Route guards use `authorize(...roles)`.
- **Pagination** — list endpoints accept `?page=&limit=` and return `meta`.

## API Overview

| Area | Base path |
|------|-----------|
| Auth | `/api/auth` |
| Departments | `/api/departments` |
| Categories | `/api/categories` |
| Employees | `/api/employees` |
| Assets | `/api/assets` |
| Allocations | `/api/allocations` |
| Transfers | `/api/transfers` |
| Bookings | `/api/bookings` |
| Maintenance | `/api/maintenance` |
| Audits | `/api/audits` |
| Notifications | `/api/notifications` |
| Activity Logs | `/api/activity-logs` (Admin) |
| Dashboard | `/api/dashboard` |
| Reports | `/api/reports` |

### Key business rules enforced

- **Asset lifecycle** transitions are validated against an allowed-transition map.
- **Allocation conflict**: an asset with an active allocation cannot be
  re-allocated — the API returns the current holder so the UI can offer a transfer.
- **Transfer**: approving closes the old allocation and opens a new one atomically.
- **Booking overlap**: overlapping time slots for the same asset are rejected.
- **Maintenance workflow**: Pending → Approved → In Progress → Resolved → Closed,
  with the asset status kept in sync (Under Maintenance ↔ Available).
- **Audit**: starting a cycle generates blank records for in-scope assets;
  closing applies discrepancy outcomes (Missing → Lost, Damaged/Not Working →
  Under Maintenance).

## Background Jobs

| Job | Schedule | Effect |
|-----|----------|--------|
| Overdue checker | hourly | Flags overdue allocations, notifies holder + managers |
| Booking reminder | every 15 min | Reminds bookers 30 min before start |
| Booking auto-complete | hourly | Marks past confirmed bookings as Completed |

Set `DISABLE_CRON=true` to turn jobs off.

## Frontend

```bash
cd "frontend/AssetFlow-Enterprise-Asset-Resource-Management-System"
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL if backend isn't on :5000
npm run dev                  # http://localhost:3000
```

Build for production with `npm run build && npm start`. Data fetching uses
React Query against the backend API modules in `src/services/api/`.

## Deployment (Render)

The database runs on **MongoDB Atlas** (free tier). The two apps deploy as
separate Render **Web Services** — either individually, or together via the
included `render.yaml` blueprint (New → Blueprint → select this repo).

### Backend service
| Setting | Value |
|---|---|
| Root directory | `server` |
| Build command | `npm install` |
| Start command | `npm start` |
| Health check | `/api/health` |

Environment variables: `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`,
`CLIENT_URL` (the deployed frontend URL — comma-separate to also allow
localhost), and optionally the `CLOUDINARY_*` keys. See `.env.example`.

### Frontend service
| Setting | Value |
|---|---|
| Root directory | `frontend/AssetFlow-Enterprise-Asset-Resource-Management-System` |
| Build command | `npm install && npm run build` |
| Start command | `npm start` |

Environment variable: `NEXT_PUBLIC_API_URL` = `https://<your-backend>.onrender.com/api`.

> ⚠️ `NEXT_PUBLIC_*` variables are inlined at **build time**, so set
> `NEXT_PUBLIC_API_URL` before the first build. Also update the backend's
> `CLIENT_URL` to the frontend's URL, then redeploy the backend so CORS allows it.

### Order of operations
1. Deploy the **backend** first, seed the database (`npm run seed` locally
   against your Atlas URI), and note its URL.
2. Deploy the **frontend** with `NEXT_PUBLIC_API_URL` pointing at the backend.
3. Set the backend's `CLIENT_URL` to the frontend URL and redeploy the backend.
