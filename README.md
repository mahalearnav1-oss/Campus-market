# CampusMarket — Student Secondhand Marketplace Platform

CampusMarket is a high-trust, student-focused secondhand marketplace platform enabling university students and campus bookstores to buy and sell pre-owned educational products (textbooks, lab tools, calculators, electronics, drawing instruments, musical gear, and study materials) with 100% escrow protection and verified campus meetups.

---

## ⚡ Quick Start

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **MySQL** (8.0 or higher running locally or remotely)
- **Git**

---

### 1. Clone the Repository

```bash
git clone <repository-url>
cd holy_proj_v2
```

---

### 2. Configure Environment Variables

Create your backend environment configuration file from the template:

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and update your MySQL connection details:

```env
# Format: mysql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL="mysql://root:yourpassword@localhost:3306/campusmarket"
```

> **Note**: Ensure the MySQL database exists before running setup:
> ```sql
> CREATE DATABASE campusmarket;
> ```

---

### 3. Install Dependencies

```bash
npm install
```

---

### 4. Run Automated Project Setup

```bash
npm run setup
```

This single command automatically:
- Validates your environment configuration and MySQL connectivity
- Generates the Prisma Client locally
- Synchronizes all tables, relationships, and indexes defined in `backend/prisma/schema.prisma` to your MySQL database
- Prepopulates essential reference data (campus colleges and courseware categories)

*You do NOT need to install Prisma globally or manually run migration commands.*

---

### 5. Start the Application

```bash
npm run dev
```

This concurrently boots:
- **Frontend Web App**: [http://localhost:5173](http://localhost:5173)
- **Backend API & WebSockets**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
- **Health Check**: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)

---

## 🛠️ Common Monorepo Commands

| Command | Action |
| :--- | :--- |
| `npm run setup` | Automated local setup (generates Prisma client, syncs schema, verifies reference data) |
| `npm run dev` | Starts frontend (Vite) and backend (Express) concurrently |
| `npm run build` | Builds production bundles for both backend and frontend |
| `npm run typecheck` | Typechecks all workspaces without emitting files |
| `npm run lint` | Runs ESLint across all workspaces |
| `npm run seed` | *(Optional)* Populates demo listings, student sellers, and reviews for local testing |

---

## 🏛️ Monorepo Architecture & Tech Stack

- **`frontend/`**: React 18, TypeScript, Vite, React Router v6, Tailwind CSS (Warm Editorial Design System Tokens), TanStack Query v5, Zustand, React Hook Form, Zod, Socket.IO Client.
- **`backend/`**: Node.js, Express.js, TypeScript, Prisma ORM, MySQL 8.0+, Socket.IO Server, Helmet, CORS, Rate Limiting, Cookie Parser, bcryptjs, jsonwebtoken.
- **`shared/`**: Shared TypeScript types, API response envelope definitions, and platform constants.
- **`scripts/`**: Developer automation and cross-platform setup runner (`setup.mjs`).
- **`docs/`**: Product, database, API, and design system specification blueprints.

---

## 🛡️ Admin & Moderation Architecture

- **Role-Based Access Control (RBAC)**: `SUPER_ADMIN`, `ADMIN`, `MODERATOR`, `STUDENT_SELLER`, `STUDENT_BUYER`.
- **Seller Verification Queue**: Moderate student seller applications with real-time alerts.
- **Product Catalog Moderation**: Approve, hide, or suspend active courseware listings.
- **Dispute Resolution & Escrow**: Secure escrow payouts and refund arbitration.
- **Immutable Audit Trail**: Append-only platform audit logging.

---

## 🧪 Testing Suites (Backend Workspace)

```bash
# Run database schema & relationship tests
npm run test:db --workspace=backend

# Run authentication & security tests
npm run test:auth --workspace=backend

# Run marketplace discovery tests
npm run test:discovery --workspace=backend

# Run end-to-end buyer-seller messaging tests
npm run test:reviews --workspace=backend

# Run admin dashboard analytics tests
npm run test:admin --workspace=backend
```
