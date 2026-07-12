# 🏢 AssetFlow — Enterprise Asset & Resource Management System
![ODOO Hackathon 2026](https://img.shields.io/badge/ODOO-HACKATHON%202026-714B67?style=for-the-badge&logo=odoo&logoColor=white)
![Status](https://img.shields.io/badge/Status-Completed-brightgreen?style=for-the-badge)
![Stack](https://img.shields.io/badge/Stack-MERN-61DAFB?style=for-the-badge&logo=react&logoColor=black)
> *A centralized ERP platform to simplify and digitize how organizations track, allocate, and maintain their physical assets and shared resources.*
---
## 🎬 Demo
🎥 **[Watch the Full Demonstration Video →](YOUR_VIDEO_LINK_HERE)**
---
## 📌 Problem Statement
Organizations across industries — offices, schools, hospitals, factories — still rely on **spreadsheets and paper logs** to track equipment, furniture, vehicles, and shared spaces. This leads to:
- ❌ No real-time visibility into asset location or condition
- ❌ Manual allocation and return tracking prone to errors
- ❌ Uncoordinated resource booking causing conflicts
- ❌ Delayed maintenance leading to asset deterioration
- ❌ Zero audit trail for accountability
**AssetFlow** solves all of these by providing a **single, unified platform** for complete asset lifecycle management — from procurement to disposal.
---
## ✨ Features
### 🔐 Authentication & Access Control
- Secure JWT-based authentication with access & refresh tokens
- Role-based access control (Admin, Asset Manager, Department Head, Employee)
- Session tracking with IP logging
### 📊 Executive Dashboard
- Real-time KPI cards (Available Assets, Active Allocations, Pending Maintenance, etc.)
- Interactive analytics with Bar & Pie charts (Recharts)
- Recent activity timeline feed
### 📦 Asset Directory & Lifecycle
- Complete CRUD for assets with photo uploads (Cloudinary)
- Category management with custom fields
- Full lifecycle tracking: `Available → Allocated → Under Maintenance → Retired → Disposed`
- Auto-generated unique Asset Tags
### 🔄 Allocation & Transfer Management
- Assign assets to employees or departments
- Expected return date tracking with **overdue detection**
- Inter-employee transfer requests with approval workflow
- Condition-on-return documentation
### 📅 Resource Booking & Calendar
- Interactive calendar view (react-big-calendar)
- List & calendar toggle for resource reservations
- Booking conflict validation
- Status tracking: `Confirmed → Completed / Cancelled`
### 🔧 Maintenance & Ticketing
- Issue reporting with priority levels (Low / Medium / High)
- Technician assignment workflow
- Full ticket lifecycle: `Pending → In Progress → Resolved → Closed`
- Photo evidence upload support
### 📋 Audit Management
- Schedule & manage physical asset verification cycles
- Assign auditors to audit cycles
- Record per-asset results: `Verified / Missing / Damaged / Not Working`
- Department & location scoped audits
### 🏗️ Organization Setup (Admin)
- Department hierarchy management (parent-child)
- Employee CRUD with role assignment
- Department head designation
### 📈 Reports & Analytics
- Asset distribution by category, status, and department
- Maintenance cost analysis
- Booking utilization reports
- Exportable data (CSV)
### 🔔 Notifications & Activity Logs
- Real-time notification system (Return reminders, Booking updates, Maintenance alerts)
- Comprehensive system-wide audit trail
- Filterable activity logs with JSON payload inspection
### ⚙️ Settings
- Profile management with avatar
- Notification preference toggles
- Password security management
---
## 🛠️ Tech Stack
| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 (App Router), React 18+, TypeScript |
| **Styling** | Tailwind CSS v4, Shadcn/UI, Framer Motion |
| **State Management** | Zustand (with persist middleware) |
| **Forms & Validation** | React Hook Form + Zod |
| **Charts** | Recharts |
| **Calendar** | react-big-calendar + date-fns |
| **HTTP Client** | Axios (with interceptors for token refresh) |
| **Backend** | Node.js 20+, Express.js |
| **Database** | MongoDB + Mongoose ODM |
| **Authentication** | JWT (Access + Refresh Tokens), bcryptjs |
| **File Uploads** | Multer + Cloudinary |
| **Security** | Helmet, CORS, express-rate-limit |
| **Background Jobs** | node-cron (overdue detection, reminders) |
| **Validation** | Joi (server-side) |
| **Logging** | Morgan |
| **Deployment** | Render (render.yaml configured) |
---
## 🏗 Architecture
```
AssetFlow/
│
├── server/                        # Express.js Backend API
│   ├── config/                    # DB connection, Cloudinary setup
│   ├── controllers/               # Route handlers (business logic)
│   ├── middleware/                 # Auth guards, role checks, error handler
│   ├── models/                    # 15 Mongoose schemas
│   ├── routes/                    # 15 RESTful route modules
│   ├── validators/                # Joi request validation schemas
│   ├── services/                  # Business logic services
│   ├── jobs/                      # Cron jobs (overdue checks, reminders)
│   ├── seed/                      # Database seeder scripts
│   ├── utils/                     # Helper functions
│   ├── app.js                     # Express app configuration
│   └── server.js                  # Entry point
│
├── frontend/                      # Next.js 15 Frontend
│   └── src/
│       ├── app/
│       │   ├── (auth)/            # Login, Signup, Forgot Password
│       │   └── (dashboard)/       # All protected ERP modules
│       ├── components/
│       │   ├── ui/                # Shadcn/UI primitives
│       │   ├── layout/            # Sidebar, Header, DashboardLayout
│       │   └── ...                # Feature-specific dialogs
│       ├── services/              # Axios instance & API services
│       ├── store/                 # Zustand auth store
│       ├── types/                 # TypeScript interfaces
│       └── lib/                   # Utility functions
│
├── render.yaml                    # Render deployment config
├── implementation_plan.md         # Detailed project blueprint
└── ER Diagram.jpeg                # Entity Relationship Diagram
```
---
## 🗃️ Database Design (ERD)
The system is built on **15 interconnected MongoDB collections** covering the full enterprise asset lifecycle:
![Entity Relationship Diagram](ER%20-%20Asset%20Management%20System%20-%20Odoo%202026.jpeg)
---
## 🚀 Getting Started
### Prerequisites
- **Node.js** ≥ 20.x
- **MongoDB** (local or Atlas cloud)
- **npm** package manager
- **Git**
### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Prannav-Bansal/AssetFlow-Enterprise-Asset-Resource-Management-System.git
cd AssetFlow-Enterprise-Asset-Resource-Management-System
```
### 2️⃣ Backend Setup
```bash
cd server
npm install
```
Create the environment file:
```bash
cp ../.env.example .env
```
Update `.env` with your values:
```env
MONGO_URI=mongodb://127.0.0.1:27017/assetflow
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
```
Seed the database with sample data:
```bash
npm run seed
```
Start the backend server:
```bash
npm run dev
```
> Backend runs at `http://localhost:5000`
### 3️⃣ Frontend Setup
```bash
cd frontend/AssetFlow-Enterprise-Asset-Resource-Management-System
npm install
```
Start the development server:
```bash
npm run dev
```
> Frontend runs at `http://localhost:3000`
### 4️⃣ Default Login Credentials
After seeding, use these credentials to log in:
| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@assetflow.com` | `password123` |
| Asset Manager | `manager@assetflow.com` | `password123` |
| Employee | `employee@assetflow.com` | `password123` |
---
## 🔌 API Endpoints
| Module | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| **Auth** | POST | `/api/auth/signup` | Register new employee |
| | POST | `/api/auth/login` | Login & get tokens |
| | POST | `/api/auth/refresh` | Refresh access token |
| | POST | `/api/auth/logout` | Invalidate session |
| **Assets** | GET | `/api/assets` | List assets (filterable) |
| | POST | `/api/assets` | Create new asset |
| | PATCH | `/api/assets/:id` | Update asset |
| | DELETE | `/api/assets/:id` | Retire/dispose asset |
| **Allocations** | POST | `/api/allocations` | Allocate asset |
| | PATCH | `/api/allocations/:id/return` | Return asset |
| **Transfers** | POST | `/api/transfers` | Request transfer |
| | PATCH | `/api/transfers/:id/approve` | Approve/reject transfer |
| **Bookings** | GET | `/api/bookings` | List bookings |
| | POST | `/api/bookings` | Create booking |
| | PATCH | `/api/bookings/:id/cancel` | Cancel booking |
| **Maintenance** | POST | `/api/maintenance` | Report issue |
| | PATCH | `/api/maintenance/:id/assign` | Assign technician |
| | PATCH | `/api/maintenance/:id/resolve` | Resolve ticket |
| **Audits** | POST | `/api/audits/cycles` | Create audit cycle |
| | POST | `/api/audits/records` | Record audit result |
| **Dashboard** | GET | `/api/dashboard/kpis` | Get KPI metrics |
| **Reports** | GET | `/api/reports/assets` | Asset analytics |
---
## 👥 Team
| Name | Role | GitHub |
|------|------|--------|
| **Pranav Bansal** | 🎯 Team Lead | [@Prannav-Bansal](https://github.com/Prannav-Bansal) |
| **Rytham Maalpani** | 💻 Member | — |
| **Aarjav Jain** | 💻 Member | — |
---
## 📄 License
This project is licensed under the **MIT License**.
---
> Built with ❤️ for the **Odoo Hackathon 2026**
