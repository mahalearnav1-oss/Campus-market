# CampusMarket (Student Secondhand Marketplace)
## Complete Backend & API Architecture Specification

---

## 1. BACKEND ARCHITECTURE & LAYERING

The backend follows a modular **N-Tier Layered Architecture** built on Node.js, TypeScript, Express.js, MySQL 8.0+, and Prisma ORM.

```
 Client Request (HTTPS)
        │
        ▼
 ┌──────────────┐
 │ API Gateway  │ (CORS, Helmet, Rate Limiter, Body Parser)
 └──────┬───────┘
        │
        ▼
 ┌──────────────┐
 │ Middleware   │ (Auth JWT Verification, RBAC Permission Check, Zod Schema Validation)
 └──────┬───────┘
        │
        ▼
 ┌──────────────┐
 │ Controller   │ (Extracts params/body, delegates to Service, formats HTTP JSON Response)
 └──────┬───────┘
        │
        ▼
 ┌──────────────┐
 │ Service      │ (Pure Business Logic, State Machine Transitions, Escrow Calculations)
 └──────┬───────┘
        │
        ▼
 ┌──────────────┐
 │ Repository   │ (Data Access Layer encapsulating Prisma Client queries & transactions)
 └──────┬───────┘
        │
        ▼
 ┌──────────────┐
 │ Prisma ORM   │ (Type-safe SQL query generator & transaction runner)
 └──────┬───────┘
        │
        ▼
 ┌──────────────┐
 │ MySQL 8.0+   │ (Primary Relational Database & Double-Entry Escrow Ledger)
 └──────────────┘
```

### Layer Responsibilities
1. **Routes & Middleware**: Route registration, authentication check (`authenticateJWT`), role-based authorization (`authorizeRole('SELLER')`), input validation (`validateBody(createProductSchema)`), rate limiting.
2. **Controller Layer**: Handles HTTP requests/responses ONLY. Reads input, calls service methods, returns standardized JSON envelope. Does NOT contain database queries or business rules.
3. **Service Layer**: Contains 100% of business domain logic, financial calculations, state machine transitions, background job triggers, and multi-repository orchestration.
4. **Repository / Data Access Layer**: Encapsulates Prisma ORM queries. Provides clean data access methods and executes atomic database transactions (`prisma.$transaction`).

---

## 2. BACKEND MODULE DIRECTORY

The application is decomposed into 18 domain modules:

| Module | Core Responsibility | Key Services | Primary Controller | Module Dependencies |
| :--- | :--- | :--- | :--- | :--- |
| `Auth` | Auth tokens, registration, OTP validation, SSO | `AuthService`, `TokenService`, `OtpService` | `AuthController` | Users, Colleges |
| `Users` | User profile, addresses, settings | `UserService`, `AddressService` | `UserController` | Auth, Colleges |
| `Sellers` | Seller onboarding, storefront, wallet ledger | `SellerService`, `WalletService` | `SellerController` | Users, Auth |
| `Products` | Inventory creation, update, photo storage, condition | `ProductService`, `ImageService` | `ProductController` | Sellers, Categories, Colleges |
| `Categories` | Taxonomy tree & subcategories | `CategoryService` | `CategoryController` | None |
| `Marketplace`| Search, filtering, course mapping, discovery | `SearchService`, `CatalogService` | `MarketplaceController`| Products, Categories |
| `Wishlist` | Saved items bookmarking | `WishlistService` | `WishlistController` | Users, Products |
| `Cart` | Shopping cart drawer, stock reservation check | `CartService` | `CartController` | Users, Products |
| `Orders` | Order state machine, lifecycle transitions | `OrderService`, `OrderStateEngine` | `OrderController` | Cart, Payments, Delivery |
| `Payments` | Gateway checkout session, Escrow ledger, payouts | `PaymentService`, `EscrowService` | `PaymentController` | Orders, Sellers |
| `Delivery` | Safe Zone OTP verification, Courier tracking | `DeliveryService`, `OtpVerifier` | `DeliveryController` | Orders |
| `Reviews` | Double-blind ratings & feedback | `ReviewService` | `ReviewController` | Orders, Products, Sellers |
| `Messaging` | Buyer-Seller 1-on-1 real-time chat with PII mask | `ChatService`, `PiiFilterService` | `ChatController` | Users, Products |
| `Notifications`| In-App & Email transactional alerts | `NotificationService`, `EmailService` | `NotificationController`| All Modules |
| `Disputes` | 48-hour return/refund dispute arbitration | `DisputeService` | `DisputeController` | Orders, Payments |
| `Admin` | User/Product moderation, system settings, GMV | `AdminService`, `AuditLogService` | `AdminController` | All Modules |
| `Colleges` | Campus institutions & safe zone locations | `CollegeService`, `SafeZoneService` | `CollegeController` | None |
| `Analytics` | Metrics aggregation, GMV reports, CSV exports | `AnalyticsService` | `AnalyticsController` | Orders, Payments |

---

## 3. API DESIGN PRINCIPLES & CONVENTIONS

### 3.1 RESTful Naming Conventions & Versioning
* All endpoints are prefixed with `/api/v1/`.
* Resource paths use plural nouns in lowercase (`/api/v1/products`, `/api/v1/orders`).
* Sub-resources express hierarchical relationships (`/api/v1/orders/:orderId/dispute`).

### 3.2 Standard HTTP Methods & Status Codes
* `GET`: Retrieve resource(s) $\rightarrow$ `200 OK`
* `POST`: Create resource or execute non-idempotent action $\rightarrow$ `201 Created` / `200 OK`
* `PATCH`: Partial update of a resource $\rightarrow$ `200 OK`
* `DELETE`: Soft-delete or archive resource $\rightarrow$ `200 OK` / `204 No Content`
* `400 Bad Request`: Input validation failed.
* `401 Unauthorized`: Missing or expired JWT access token.
* `403 Forbidden`: Authenticated user lacks required role/ownership permissions.
* `404 Not Found`: Target entity does not exist.
* `409 Conflict`: Duplicate key error (e.g. duplicate email registration).
* `422 Unprocessable Entity`: Business rule validation error (e.g. price $\le 0$).
* `429 Too Many Requests`: Rate limit exceeded.
* `500 Internal Server Error`: Unhandled server exception.

---

## 4. STANDARDIZED API RESPONSE & ERROR FORMATS

### 4.1 Success Response Envelope
```json
{
  "success": true,
  "data": {
    "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "title": "Organic Chemistry 8th Edition",
    "price": 45.00
  },
  "meta": {
    "timestamp": "2026-08-09T21:48:00.000Z"
  }
}
```

### 4.2 Paginated Success Response Envelope
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 142,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPrevPage": false,
    "timestamp": "2026-08-09T21:48:00.000Z"
  }
}
```

### 4.3 Error Response Envelope
```json
{
  "success": false,
  "error": {
    "code": "ITEM_OUT_OF_STOCK",
    "message": "This item is currently reserved or sold by another user.",
    "details": [
      {
        "field": "quantity",
        "issue": "Available stock is 0"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-08-09T21:48:00.000Z"
  }
}
```

---

## 5. AUTHENTICATION & SECURITY SPECIFICATIONS

### 5.1 Token Strategy
* **JWT Access Token**: Short-lived (15 minutes), transmitted in `Authorization: Bearer <token>` header. Contains `userId`, `role`, and `collegeId`.
* **Refresh Token**: Long-lived (7 days), stored in secure `HttpOnly`, `SameSite=Strict`, `Secure` cookie. Stored as SHA-256 hash in database to enable session revocation.

### 5.2 Core Auth Endpoints

#### `POST /api/v1/auth/register`
* **Auth**: Public
* **Request Body**:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "jdoe@harvard.edu",
    "password": "SecurePassword123!",
    "collegeId": "c4b1deb4-3b7d-4bad-9bdd-2b0d7b3dcb6d"
  }
  ```
* **Validation**: `email` valid format, `password` $\ge 8$ chars (min 1 uppercase, 1 number, 1 symbol), `collegeId` UUID.
* **Response (201 Created)**: Returns user snippet + message *"Verification OTP sent to email"*.

#### `POST /api/v1/auth/login`
* **Auth**: Public
* **Request Body**: `{ "email": "jdoe@harvard.edu", "password": "SecurePassword123!" }`
* **Response (200 OK)**: Returns Access Token in body, sets Refresh Token cookie.

---

## 6. MARKETPLACE & SEARCH API SPECIFICATIONS

#### `GET /api/v1/marketplace/search`
* **Auth**: Public
* **Query Parameters**:
  * `q` (string): Keyword / ISBN / Course Code.
  * `collegeId` (UUID): Campus filter.
  * `categoryId` (UUID): Category filter.
  * `subcategoryId` (UUID): Subcategory filter.
  * `condition` (enum): `BRAND_NEW`, `LIKE_NEW`, `GOOD`, `FAIR`, `ACCEPTABLE`.
  * `minPrice` (number), `maxPrice` (number).
  * `fulfillment` (enum): `CAMPUS_MEETUP`, `COURIER_SHIPPING`.
  * `sort` (string): `relevance`, `price_asc`, `price_desc`, `newest`.
  * `page` (number, default 1), `limit` (number, default 20, max 100).
* **Response (200 OK)**: Paginated array of product cards with pre-formatted image thumbnails, condition badges, seller ratings, and course tags.

---

## 7. PRODUCT MANAGEMENT APIs

#### `POST /api/v1/products`
* **Auth**: Authenticated (`STUDENT_SELLER` / `BOOKSTORE`)
* **Request Body**:
  ```json
  {
    "title": "Organic Chemistry",
    "categoryId": "cat-uuid",
    "subcategoryId": "sub-uuid",
    "conditionGrade": "GOOD",
    "conditionNotes": "Minor highlighting on chapters 1-3. Binding intact.",
    "price": 45.00,
    "quantity": 1,
    "fulfillmentMethods": ["CAMPUS_MEETUP", "COURIER_SHIPPING"],
    "imageUrls": ["https://cdn.campusmarket.com/img1.webp"],
    "bookDetails": {
      "isbn13": "9780134093413",
      "author": "Paula Yurkanis Bruice",
      "publisher": "Pearson",
      "edition": "8th Edition",
      "courseCode": "CHEM201"
    }
  }
  ```
* **Authorization Check**: Asserts `current_user.id` has active `SELLER` record.
* **Response (201 Created)**: Returns created product entity.

---

## 8. CART & CHECKOUT APIs

#### `POST /api/v1/cart/items`
* **Auth**: Authenticated (`STUDENT_BUYER`)
* **Request Body**: `{ "productId": "prod-uuid", "selectedFulfillment": "CAMPUS_MEETUP" }`
* **Business Validation**: Verifies `products.status = ACTIVE` and `products.quantity > 0`. Verifies buyer is NOT the owner of the listing.

#### `POST /api/v1/cart/validate`
* **Auth**: Authenticated (`STUDENT_BUYER`)
* **Response (200 OK)**: Validates active cart items against real-time database stock. Returns updated line-item price totals and flags any out-of-stock items.

---

## 9. ORDER & ESCROW STATE MACHINE APIs

#### `POST /api/v1/orders`
* **Auth**: Authenticated (`STUDENT_BUYER`)
* **Request Body**:
  ```json
  {
    "fulfillmentMode": "CAMPUS_MEETUP",
    "safeZoneId": "safezone-uuid",
    "shippingAddressId": null
  }
  ```
* **Transaction Behavior**:
  1. Opens atomic database transaction (`prisma.$transaction`).
  2. Locks selected product row (`SELECT ... FOR UPDATE`).
  3. Verifies stock availability (`quantity > 0`).
  4. Generates order record in `PAYMENT_PENDING` state.
  5. Initiates Gateway Payment Intent session.
* **Response (201 Created)**: Returns `orderId` and gateway payment secret.

#### `POST /api/v1/orders/:orderId/accept`
* **Auth**: Authenticated Seller (Must own order's `seller_id`)
* **Business Rule**: Must be called within 24 hours of order payment.
* **Response (200 OK)**: Moves order status to `SELLER_ACCEPTED`. Opens buyer-seller chat thread. Generates 6-digit Handover OTP.

#### `POST /api/v1/deliveries/:orderId/verify-otp`
* **Auth**: Authenticated Seller
* **Request Body**: `{ "otpCode": "123456" }`
* **Business Rule**: Compares SHA-256 hash of `otpCode` with `deliveries.handover_otp_hash`.
* **Response (200 OK)**: On match $\rightarrow$ Transitions order status to `DELIVERED_PENDING_INSPECTION`. Starts 48-hour inspection timer.

#### `POST /api/v1/orders/:orderId/confirm-receipt`
* **Auth**: Authenticated Buyer (Must own order's `buyer_id`)
* **Response (200 OK)**: Transitions order to `COMPLETED`. Executes escrow ledger release transferring net earnings to Seller Wallet.

---

## 10. PAYMENT WEBHOOK & IDEMPOTENCY ARCHITECTURE

```
 External Gateway (Stripe/Razorpay) 
                │
                │ POST /api/v1/payments/webhook
                ▼
 ┌──────────────────────────────┐
 │ Signature Verification Check │ (Verifies raw header signature with secret)
 └──────────────┬───────────────┘
                │ Valid
                ▼
 ┌──────────────────────────────┐
 │ Idempotency Record Check     │ (Queries database table `webhook_events(event_id)`)
 └──────────────┬───────────────┘
                │ New Event
                ▼
 ┌──────────────────────────────┐
 │ Atomic Order Update          │ (Transitions order to PAID_ESCROW; locks funds in Escrow)
 └──────────────┬───────────────┘
                │
                ▼
 ┌──────────────────────────────┐
 │ Mark Webhook Event Processed │ (Inserts event_id to prevent duplicate processing)
 └──────────────────────────────┘
```

* **Idempotency Safeguard**: Every incoming webhook payload contains a unique `event_id`. The backend attempts insertion into `processed_webhook_events`. If duplicate `event_id` exists, the request returns `200 OK` instantly without re-executing order creation or payout transfers.

---

## 11. IN-APP MESSAGING & PII MASKING APIs

#### `POST /api/v1/conversations/:conversationId/messages`
* **Auth**: Authenticated Buyer / Seller (Must be participant in conversation)
* **Request Body**: `{ "messageText": "Can we meet at the library at 3pm? Call me at 555-0199." }`
* **Service Logic**:
  * Runs regex sanitization engine detecting phone numbers, raw email addresses, and external payment handles (`@venmo`, `Zelle`).
  * Replaces raw PII with `[Contact info masked for safety]`. Sets `is_pii_masked = true`.
* **Response (201 Created)**: Broadcasts sanitized message via Socket.io WebSocket thread and saves to database.

---

## 12. AUTHORIZATION & RESOURCE OWNERSHIP MATRIX

Access control is enforced at the Middleware level using **Role-Based Access Control (RBAC)** + **Resource Ownership Validation**:

```typescript
// Middleware Enforcement Concept
export const authorizeProductOwner = async (req, res, next) => {
  const productId = req.params.id;
  const seller = await prisma.seller.findUnique({ where: { userId: req.user.id } });
  const product = await prisma.product.findUnique({ where: { id: productId } });
  
  if (!product || product.sellerId !== seller?.id) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'You do not own this listing.' } });
  }
  next();
};
```

| Endpoint Pattern | Allowed Roles | Resource Ownership Restriction |
| :--- | :--- | :--- |
| `/api/v1/buyer/*` | `STUDENT_BUYER` | `orders.buyer_id === current_user.id` |
| `/api/v1/seller/*` | `STUDENT_SELLER`, `BOOKSTORE` | `products/orders.seller_id === current_seller.id` |
| `/api/v1/admin/*` | `ADMIN`, `SUPER_ADMIN` | Full administrative override |

---

## 13. FILE UPLOADS & MEDIA STORAGE PIPELINE

```
 Client App                        Backend API                      Cloud Storage (S3 / R2)
     │                                 │                                       │
     ├── POST /api/v1/uploads/presigned ──>│                                       │
     │    (fileName, mimeType, size)   ├── Validates MIME & File Size          │
     │                                 ├── Generates Unique S3 Object Key      │
     │                                 ├── Requests Signed Upload URL ────────>│
     │<── Returns Signed PUT URL ──────┤                                       │
     │                                 │                                       │
     ├── Direct HTTP PUT (Image Binary) ──────────────────────────────────────>│
     │                                                                         │
```

1. **Storage Provider**: AWS S3 or Cloudflare R2 (CDN cached via Cloudflare Edge).
2. **Upload Protocol**: Direct client-to-S3 upload via pre-signed URLs (prevents backend node memory saturation).
3. **Validation Rules**:
   * Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`.
   * Max file size: **10MB** per image.
   * Product listings: Max 4 images.
   * Student ID document uploads: Restricted to private S3 bucket (accessible ONLY by Admin pre-signed GET URLs).

---

## 14. BACKGROUND JOB QUEUE ARCHITECTURE (BullMQ + Redis)

Non-blocking background operations are offloaded to **BullMQ worker queues** backed by Redis:

```
[Express API Engine] ──> Enqueues Job ──> [Redis Queue] ──> Worker Process ──> Executes Task
```

1. **`email-queue`**: Sends registration OTP emails, order receipts, price drop alerts, dispute notifications.
2. **`image-processing-queue`**: Generates WebP optimized thumbnails for uploaded listing photos.
3. **`cron-queue`**:
   * *24h Seller Acceptance Expiration*: Runs every 15 minutes; auto-cancels unaccepted orders and triggers buyer refunds.
   * *48h Inspection Auto-Completion*: Runs every 15 minutes; auto-completes orders post-delivery and releases escrow to seller wallet.
4. **`webhook-retry-queue`**: Retries failed outgoing webhook notifications with exponential backoff.

---

## 15. ERROR CODES & HTTP STATUS REFERENCE MATRIX

| Error Code | HTTP Status | Context / Trigger Condition |
| :--- | :---: | :--- |
| `INVALID_CREDENTIALS` | 401 | Email or password incorrect during login. |
| `UNAUTHORIZED` | 401 | Missing or expired JWT access token. |
| `FORBIDDEN` | 403 | User lacks required role or does not own requested resource. |
| `RESOURCE_NOT_FOUND` | 404 | Target product, order, or user ID does not exist. |
| `DUPLICATE_EMAIL` | 409 | User registration attempted with an already existing email. |
| `ITEM_OUT_OF_STOCK` | 422 | Attempting to purchase item with 0 quantity. |
| `ORDER_EXPIRED` | 422 | Attempting to accept an order after 24h timer expired. |
| `INSPECTION_WINDOW_EXPIRED`| 422 | Filing return/dispute after 48h window expired. |
| `INVALID_OTP` | 400 | Handover OTP verification code incorrect. |
| `PAYMENT_FAILED` | 402 | Gateway payment authorization declined. |
| `RATE_LIMIT_EXCEEDED` | 429 | Exceeded 100 requests per minute IP threshold. |
| `INTERNAL_SERVER_ERROR` | 500 | Unhandled exception captured by global error handler. |

---

## 16. COMPLETE API ENDPOINT INVENTORY

---

### Module 1: Auth & User Account APIs

| Method | Endpoint | Role | Purpose | Auth | Request | Response |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Public | Register new user account | No | `RegisterDTO` | User snippet + msg |
| `POST` | `/api/v1/auth/login` | Public | Authenticate user & issue tokens | No | `LoginDTO` | Access token + User |
| `POST` | `/api/v1/auth/logout` | Authenticated | Revoke refresh token & session | Yes | - | Success msg |
| `POST` | `/api/v1/auth/refresh` | Public | Issue new access token via cookie | Cookie | - | New Access token |
| `POST` | `/api/v1/auth/verify-email` | Authenticated | Verify 6-digit email OTP | Yes | `{ otp }` | Success msg |
| `POST` | `/api/v1/auth/forgot-password`| Public | Request password reset link | No | `{ email }` | Success msg |
| `POST` | `/api/v1/auth/reset-password` | Public | Reset password with token | No | `{ token, newPassword }`| Success msg |
| `GET` | `/api/v1/auth/me` | Authenticated | Get logged-in user profile & role | Yes | - | Full User entity |
| `GET` | `/api/v1/users/profile` | Authenticated | Get buyer profile details | Yes | - | Profile entity |
| `PATCH`| `/api/v1/users/profile` | Authenticated | Update avatar, bio, display name | Yes | `UpdateProfileDTO` | Updated Profile |
| `GET` | `/api/v1/users/addresses` | Authenticated | Get saved shipping addresses | Yes | - | Address array |
| `POST` | `/api/v1/users/addresses` | Authenticated | Add new shipping address | Yes | `AddressDTO` | Created Address |

---

### Module 2: Marketplace & Product APIs

| Method | Endpoint | Role | Purpose | Auth | Request | Response |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| `GET` | `/api/v1/marketplace/search` | Public | Search products with filters | No | Query Params | Paginated Products |
| `GET` | `/api/v1/marketplace/feed` | Public | Home feed curated listings | No | Query Params | Product collections |
| `GET` | `/api/v1/categories` | Public | Taxonomy category directory | No | - | Categories array |
| `GET` | `/api/v1/products/:id` | Public | Product Details Page (PDP) | No | - | Product + Book entity |
| `POST` | `/api/v1/products` | Seller | Publish new secondhand listing | Yes | `CreateProductDTO` | Created Product |
| `PATCH`| `/api/v1/products/:id` | Seller Owner | Edit listing details | Yes | `UpdateProductDTO` | Updated Product |
| `PATCH`| `/api/v1/products/:id/pause` | Seller Owner | Pause/resume active listing | Yes | - | Updated Product |
| `DELETE`| `/api/v1/products/:id` | Seller Owner | Soft-delete product listing | Yes | - | Success msg |
| `POST` | `/api/v1/uploads/presigned` | Seller | Get S3 pre-signed upload URL | Yes | `{ fileName, mimeType }`| Presigned PUT URL |

---

### Module 3: Cart, Checkout & Order APIs

| Method | Endpoint | Role | Purpose | Auth | Request | Response |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| `GET` | `/api/v1/cart` | Buyer | Get active cart items | Yes | - | Cart entity + fees |
| `POST` | `/api/v1/cart/items` | Buyer | Add product to cart | Yes | `AddCartItemDTO` | Updated Cart |
| `DELETE`| `/api/v1/cart/items/:id` | Buyer | Remove product from cart | Yes | - | Updated Cart |
| `POST` | `/api/v1/cart/validate` | Buyer | Validate stock prior to checkout | Yes | - | Stock status report |
| `POST` | `/api/v1/orders` | Buyer | Create order & payment session | Yes | `CreateOrderDTO` | Order + Payment Secret |
| `GET` | `/api/v1/buyer/orders` | Buyer | Get buyer order history | Yes | Query Params | Paginated Orders |
| `GET` | `/api/v1/buyer/orders/:id` | Buyer | Get detailed order status & OTP | Yes | - | Detailed Order |
| `POST` | `/api/v1/orders/:id/accept` | Seller Owner | Seller accepts order (24h) | Yes | - | Updated Order |
| `POST` | `/api/v1/orders/:id/reject` | Seller Owner | Seller rejects order (refunds) | Yes | `{ reason }` | Cancelled Order |
| `POST` | `/api/v1/deliveries/:orderId/verify-otp`| Seller Owner | Input buyer 6-digit OTP | Yes | `{ otpCode }` | Delivered Order |
| `POST` | `/api/v1/orders/:id/confirm-receipt`| Buyer Owner| Confirm receipt & release escrow| Yes | - | Completed Order |
| `POST` | `/api/v1/orders/:id/dispute` | Buyer Owner | File return/dispute (48h) | Yes | `DisputeDTO` | Created Dispute |

---

### Module 4: Seller Studio & Wallet APIs

| Method | Endpoint | Role | Purpose | Auth | Request | Response |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| `POST` | `/api/v1/sellers/onboard` | Authenticated | Onboard as student/bookstore seller| Yes| `SellerOnboardDTO` | Seller Profile |
| `GET` | `/api/v1/seller/dashboard` | Seller | Get seller dashboard metrics | Yes | - | Dashboard Summary |
| `GET` | `/api/v1/seller/products` | Seller | Get seller active inventory | Yes | Query Params | Paginated Products |
| `GET` | `/api/v1/seller/orders` | Seller | Get seller incoming orders | Yes | Query Params | Paginated Orders |
| `GET` | `/api/v1/seller/earnings` | Seller | Get wallet balance & ledger | Yes | - | Wallet Entity |
| `POST` | `/api/v1/seller/earnings/withdraw`| Seller | Request bank/UPI payout | Yes | `{ amount }` | Withdrawal Entity |

---

### Module 5: Messaging, Reviews & Admin APIs

| Method | Endpoint | Role | Purpose | Auth | Request | Response |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| `GET` | `/api/v1/conversations` | Buyer/Seller | List active chat conversations | Yes | - | Conversations array |
| `POST` | `/api/v1/conversations/:id/messages`| Participant | Send message with PII mask | Yes | `{ messageText }` | Message Entity |
| `POST` | `/api/v1/reviews/product` | Buyer Owner | Submit product condition review | Yes | `ReviewDTO` | Review Entity |
| `POST` | `/api/v1/reviews/seller` | Buyer Owner | Submit seller star rating | Yes | `SellerReviewDTO` | Review Entity |
| `GET` | `/api/v1/admin/dashboard` | Admin | Get platform GMV & metrics | Yes | - | Admin Metrics |
| `GET` | `/api/v1/admin/users` | Admin | User management directory | Yes | Query Params | Paginated Users |
| `PATCH`| `/api/v1/admin/users/:id/status`| Admin | Suspend or ban user account | Yes | `{ status, reason }` | Updated User |
| `GET` | `/api/v1/admin/disputes` | Admin | Dispute arbitration queue | Yes | Query Params | Disputes array |
| `POST` | `/api/v1/admin/disputes/:id/resolve`| Admin | Arbitrate dispute & release/refund| Yes | `ResolveDisputeDTO` | Resolved Dispute |

---

## 17. MVP API PRIORITIZATION MATRIX (P0 / P1 / P2)

| API Group / Endpoint | Priority Tier | Justification / MVP Target |
| :--- | :---: | :--- |
| `POST /api/v1/auth/register`, `/login`, `/verify-email` | **P0** | Essential authentication flow. |
| `GET /api/v1/marketplace/search`, `/feed`, `/products/:id` | **P0** | Core product discovery. |
| `POST /api/v1/products`, `PATCH /products/:id` | **P0** | Essential listing creation for sellers. |
| `GET /cart`, `POST /cart/items`, `POST /cart/validate` | **P0** | Shopping cart container. |
| `POST /orders`, `/orders/:id/accept`, `/confirm-receipt` | **P0** | Order state machine & escrow release. |
| `POST /deliveries/:orderId/verify-otp` | **P0** | Safe Zone OTP handover verification. |
| `POST /payments/webhook` | **P0** | Payment authorization & escrow holding. |
| `POST /orders/:id/dispute` | **P0** | Mandatory 48h escrow protection. |
| `GET /seller/dashboard`, `/seller/earnings`, `/withdraw` | **P0** | Seller studio & bank payout releases. |
| `POST /conversations/:id/messages` | **P0** | Real-time chat with PII masking. |
| `GET /admin/dashboard`, `/admin/disputes`, `/resolve` | **P0** | Operations dashboard & dispute arbitration. |
| `GET /buyer/saved`, `POST /wishlist` | **P1** | Wishlist saved items. |
| `POST /reviews/product`, `/reviews/seller` | **P1** | Reputation engine. |
| `GET /admin/analytics` | **P1** | CSV exports & detailed analytics. |
| `POST /coupons/redeem` | **P2** | Future promotional codes. |

---

## 18. API ENDPOINT COUNT BREAKDOWN SUMMARY

* **Total Core P0 API Endpoints (Launch MVP)**: **32 Endpoints**
* **Total P1 API Endpoints (Post-Launch)**: **12 Endpoints**
* **Total P2 API Endpoints (Future Extensions)**: **4 Endpoints**
* **Grand Total Specified API Surface**: **48 Endpoints**
