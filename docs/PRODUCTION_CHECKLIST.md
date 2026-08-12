# CampusMarket — Production Deployment Checklist

Complete all checklist verification steps before deploying CampusMarket to a production environment.

---

## 🔒 1. Security & Hardening Checklist
- [x] **Database Engine**: Confirmed **MySQL 8.0+** engine (`prisma.provider = "mysql"`).
- [x] **HTTPS / SSL**: SSL certificates configured on reverse proxy (Nginx).
- [x] **Helmet Security Headers**: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy configured.
- [x] **Granular Rate Limiting**: Limiters enabled for Auth (15/15m), API (200/15m), Search (60/1m), Payment (20/15m), and Admin (100/15m).
- [x] **Brute Force Protection**: Failed login tracking & account lockout limits.
- [x] **JWT Secrets**: `JWT_SECRET` and `REFRESH_TOKEN_SECRET` set to minimum 32-character random strings.
- [x] **Razorpay Webhooks**: Webhook signature verification and idempotency protection enabled.
- [x] **XSS Sanitization**: User inputs (reviews, messages, descriptions, bios) sanitized against Stored/Reflected XSS.

---

## ⚡ 2. Performance & Database Optimization Checklist
- [x] **Prisma Indexes**: Composite indexes applied on `User`, `Seller`, `Product`, `Order`, `Payment`, `Shipment`, `Message`, `Notification`, `Report`, `Dispute`, `AuditLog`.
- [x] **Query Pagination**: Pagination enforced on all catalog, user, order, message, and admin endpoints.
- [x] **Cache Abstraction Layer**: `cacheService.ts` active for categories and public catalog queries.
- [x] **Vite Bundle Optimization**: Production bundle minified and code-split under 550KB per chunk.

---

## 🏥 3. Observability & Health Checklist
- [x] **Structured Logging**: `logger.ts` active with `DEBUG`, `INFO`, `WARN`, `ERROR` levels.
- [x] **Unified Error Handler**: Standardized error envelopes returned without stack traces in production.
- [x] **Health Check Probes**: `GET /health`, `GET /health/liveness`, `GET /health/readiness` endpoints active.

---

## 🐳 4. Docker & CI/CD Checklist
- [x] **Docker Multi-Stage Build**: `backend/Dockerfile` and `frontend/Dockerfile` optimized.
- [x] **Docker Compose**: `docker-compose.yml` operational.
- [x] **GitHub Actions CI/CD**: `.github/workflows/ci.yml` pipeline validating lint, typecheck, tests, and builds.
