# CampusMarket — Student Secondhand Marketplace Platform

CampusMarket is a high-trust, student-focused secondhand marketplace platform enabling university students and commercial campus bookstores to buy and sell pre-owned educational products (textbooks, lab tools, calculators, electronics, drawing instruments, musical gear, and study materials).

---

## 🏛️ Project Architecture & Tech Stack

### Monorepo Structure
* **`frontend/`**: React 18, TypeScript, Vite, React Router v6, Tailwind CSS (Custom Design System Tokens), TanStack Query v5, Zustand (`authStore`), React Hook Form, Zod, Socket.IO Client (`socket.io-client`).
* **`backend/`**: Node.js, Express.js, TypeScript, Prisma ORM, MySQL 8.0+, Socket.IO (`socket.io`), Helmet, CORS, Rate Limiting, Cookie Parser, bcryptjs, jsonwebtoken, Centralized Error & Request Logging Handlers.
* **`shared/`**: Shared TypeScript types, API response envelope definitions, and platform constants.
* **`docs/`**: Comprehensive product, database, API, frontend, and design system specification blueprints.

---

## 🛡️ Admin Dashboard & Platform Moderation Architecture

### 1. Hierarchical Role-Based Access Control (RBAC)
* **Roles**: `SUPER_ADMIN`, `ADMIN`, `MODERATOR`, `STUDENT_SELLER`, `STUDENT_BUYER`.
* **Authorization Middleware**:
  * `requireModerator`: Access for `MODERATOR`, `ADMIN`, `SUPER_ADMIN`.
  * `requireAdmin`: Access for `ADMIN`, `SUPER_ADMIN`.
  * `requireSuperAdmin`: Exclusive access for `SUPER_ADMIN`.
  * Normal buyers and sellers receive `403 FORBIDDEN` on all admin routes.

### 2. Moderation Workflows & Audit Logging
* **Seller Verification Queue (`/admin/sellers`)**: Moderates pending seller applications (`VERIFIED` or `REJECTED`) and triggers real-time notification alerts (`SELLER_VERIFIED` / `SELLER_REJECTED`).
* **Product Catalog Moderation (`/admin/products`)**: Moderates active listings (`APPROVED`, `HIDDEN`, `SUSPENDED`, `REMOVED`) with audit reason logging.
* **User Management (`/admin/users`)**: Searchable user accounts list with `ACTIVE`, `SUSPENDED`, and `BANNED` status controls.
* **Report & Dispute Resolution Center (`/admin/reports` & `/admin/disputes`)**: Admin mediation workflows for content reports and buyer-seller escrow disputes.
* **Immutable Audit Trail (`/admin/audit-logs`)**: Read-only append log recording every administrative action.

### 3. Implemented Admin API Endpoints
```
─── Admin Analytics & Management Endpoints ───
GET    /api/v1/admin/dashboard             -> Aggregated metrics (Users, sellers, revenue, orders, disputes)
GET    /api/v1/admin/users                 -> Searchable user accounts list
PATCH  /api/v1/admin/users/:id/status      -> User status update (ACTIVE, SUSPENDED, BANNED)
GET    /api/v1/admin/sellers               -> Seller storefronts & pending verification queue
POST   /api/v1/admin/sellers/:id/verify    -> Approve/Reject seller application with moderation notes
GET    /api/v1/admin/products              -> Product catalog moderation list
PATCH  /api/v1/admin/products/:id/status   -> Product status update (ACTIVE, HIDDEN, SUSPENDED)
GET    /api/v1/admin/categories            -> List categories with active product counts
POST   /api/v1/admin/categories            -> Create category
PATCH  /api/v1/admin/categories/:id        -> Update category
DELETE /api/v1/admin/categories/:id        -> Safe category deletion
GET    /api/v1/admin/orders                -> Admin order inspection feed
GET    /api/v1/admin/reports               -> Content & user report moderation queue
PATCH  /api/v1/admin/reports/:id/resolve   -> Resolve/Dismiss report
GET    /api/v1/admin/disputes              -> Escrow dispute resolution queue
PATCH  /api/v1/admin/disputes/:id/resolve  -> Resolve dispute (Escrow refund or seller payout)
GET    /api/v1/admin/audit-logs            -> Immutable platform audit log stream
```

---

## 🗄️ Database Architecture & Commands (MySQL 8.0+ + Prisma)

### 1. Database Configuration
CampusMarket uses **MySQL 8.0+**. Connection string in root `.env` and `backend/.env`:
```env
DATABASE_URL="mysql://root:arnav@localhost:3306/campusmarket"
RAZORPAY_KEY_ID="rzp_test_campusmarket2026"
RAZORPAY_KEY_SECRET="test_secret_campusmarket_key_2026"
RAZORPAY_WEBHOOK_SECRET="test_webhook_secret_2026"
```

### 2. Database & Testing Commands

```bash
# Push Prisma Schema to MySQL Database
npx prisma db push --schema=backend/prisma/schema.prisma

# Generate Prisma Client Types for MySQL
npm run prisma:generate --workspace=backend

# Seed Comprehensive Marketplace Data into MySQL
npm run prisma:seed --workspace=backend

# Run 12-Step MySQL Database Graph Tests
npm run test:db --workspace=backend

# Run 10-Step Auth Security Suite
npm run test:auth --workspace=backend

# Run 21-Step User Profile & Seller System Test Suite
npm run test:seller --workspace=backend

# Run 20-Step Core Marketplace & Listing System Test Suite
npm run test:marketplace --workspace=backend

# Run 24-Step Search, Filtering, Sorting & Product Discovery Suite
npm run test:discovery --workspace=backend

# Run 25-Step Buyer Cart & Wishlist System Test Suite
npm run test:cart --workspace=backend

# Run 20-Step Checkout & Order Management System Suite
npm run test:order --workspace=backend

# Run 20-Step Razorpay Payment & Escrow System Test Suite
npm run test:payments --workspace=backend

# Run 20-Step Delivery, Shipping & Tracking System Suite
npm run test:delivery --workspace=backend

# Run 20-Step Reviews, Ratings & Buyer-Seller Messaging Suite
npm run test:reviews --workspace=backend

# Run 20-Step Notifications & Real-Time Communication Suite
npm run test:notifications --workspace=backend

# Run 20-Step Admin Dashboard & Platform Moderation Suite
npm run test:admin --workspace=backend
```
