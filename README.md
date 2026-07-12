# AssetFlow — Backend

Enterprise Asset & Resource Management System. This repository contains the
**Node.js / Express / MongoDB backend** implementing the full API surface
described in `implementation_plan.md` and the ER diagram.

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

## Deployment

- **Backend**: Render / Railway (set the env vars from `.env.example`).
- **Database**: MongoDB Atlas free tier.
- Configure `CLIENT_URL` to your deployed frontend origin for CORS.
