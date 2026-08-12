# CampusMarket (Student Secondhand Marketplace)
## Complete Database Architecture Specification

---

## 1. DATABASE DESIGN PRINCIPLES

### 1.1 Target RDBMS & Normalization Strategy
* **Target Engine**: MySQL 8.0+ (Relational, ACID-compliant, JSON support, Spatial R-Tree ready).
* **Normalization Level**: Standard **3rd Normal Form (3NF)** for operational data integrity. Controlled denormalization is applied ONLY for historical order snapshot records (`order_items`) to preserve exact purchase-time metadata (price, title, condition) even if the original product is modified or deleted.

### 1.2 Primary & Foreign Key Strategy
* **Primary Keys**: Universally Unique Identifier (`UUID v4`) generated at backend/database layer (`uuid()`).
  * *Rationale*: Prevents sequential ID enumeration attacks, allows safe client-side UUID generation for offline or multi-region syncing, and seamlessly scales across distributed sharding.
* **Foreign Keys**: Enforced on all relationships with explicit `ON DELETE` referential actions (`RESTRICT`, `CASCADE`, or `SET NULL`).

### 1.3 Timestamps & Soft Deletion
* **Timestamp Standard**: All temporal columns use `DATETIME` (UTC).
* **Audit Timestamps**: Every table contains `created_at DATETIME DEFAULT CURRENT_TIMESTAMP` and `updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`.
* **Soft Deletion**: Applied to critical business entities (`users`, `sellers`, `products`) via `deleted_at DATETIME NULL`. Queries filter active records using `WHERE deleted_at IS NULL`.

### 1.4 Status & Enumeration Strategy
* **State Machines**: Implemented via explicit MySQL `ENUM` types or constrained text columns.
* **State Histories**: Important status transitions (Orders, Deliveries, Disputes) maintain a dedicated `_status_history` audit table recording `previous_status`, `new_status`, `changed_by_user_id`, `reason`, and `timestamp`.

### 1.5 Indexing Philosophy & Data Integrity
* **Index Types**:
  * `B-Tree`: Foreign keys, unique constraints, status columns, timestamp ranges.
  * `Fulltext`: Product search titles and descriptions.
  * `JSON`: Metadata columns and audit log payloads.
* **Integrity Constraints**: Database-level `CHECK` constraints (e.g., `price > 0.00`, `rating BETWEEN 1 AND 5`, `quantity >= 0`).

---

## 2. USERS & AUTHENTICATION SCHEMATICS

```
                        +--------------------+
                        |      colleges      |
                        +---------+----------+
                                  | 1
                                  |
                                  | N
+--------------------+  1       N +--------------------+  1       1 +--------------------+
|       roles        |<-----------+       users        +------------>|   user_profiles    |
+--------------------+            +----+----+----+-----+             +--------------------+
                                       |    |    |
                                     1 |    |    | 1
                                       v    |    v N
                   +-------------------+    |   +--------------------+
                   | user_verifications|    |   |   user_addresses   |
                   +-------------------+    |   +--------------------+
                                          1 v 1
                                  +--------------------+
                                  |   user_settings    |
                                  +--------------------+
```

* **Core Entities**:
  * `users`: Primary account record (Email, Password Hash, Account Status, College ID).
  * `roles`: Role definitions (`GUEST`, `BUYER`, `SELLER`, `BOOKSTORE`, `ADMIN`).
  * `user_roles`: Many-to-many junction table assigning roles to users.
  * `user_profiles`: Extended user profile metadata (First Name, Last Name, Avatar URL, Bio, Phone Number, Verified Student Badge boolean).
  * `user_verifications`: Student `.edu` email OTP and Student ID document verification logs.
  * `user_addresses`: Saved shipping and residential addresses.
  * `user_preferences`: Notification and system preference toggles.

---

## 3. SELLERS & BOOKSTORE SYSTEM

```
                        +--------------------+
                        |       users        |
                        +---------+----------+
                                  | 1
                                  |
                                  | 1
                        +---------v----------+
                        |      sellers       |  (Type: STUDENT vs BOOKSTORE)
                        +----+----+----+-----+
                             |    |    |
                           1 |  1 |  1 |
                             v    v    v
       +---------------------+    |    +---------------------+
       | seller_verifications|    |    |   seller_wallets    |
       +---------------------+    |    +----------+----------+
                                1 v 1             | 1
                       +------------------+       |
                       | seller_settings  |       v N
                       +------------------+    +---------------------+
                                               | payout_withdrawals  |
                                               +---------------------+
```

* **Core Entities**:
  * `sellers`: Extends a `user` record with seller-specific attributes (`seller_type`: `STUDENT` or `BOOKSTORE`, Store Name, Business Registration #, Overall Rating, Total Completed Sales).
  * `seller_verifications`: Document proof uploads (Student ID photo or Commercial Bookstore License) with Admin approval tracking.
  * `seller_wallets`: Financial ledger tracking cleared escrow balances available for withdrawal.
  * `payout_withdrawals`: Records seller withdrawal requests to linked bank accounts or UPI IDs.

---

## 4. PRODUCT CATALOG & FLEXIBLE CATEGORY SYSTEM

### Architecture Decision: Category Flexibility & Book Attributes
> [!IMPORTANT]
> **Architectural Decision**: A hybrid entity design is used. General attributes (`title`, `price`, `condition`, `quantity`, `images`) live in the root `products` table. Category-specific flexible metadata (e.g. lab equipment specs, calculator models, art kit contents) is stored in a structured PostgreSQL `JSONB` column (`attributes`).
> 
> **Book-Specific Exception**: Because books account for 60–70% of marketplace volume and require high-frequency exact matching by `ISBN-10`, `ISBN-13`, `author`, `publisher`, `edition`, and `course_code`, book details are extracted into a 1:1 relational extension table `book_details` linked to `products.id`. This provides zero-cost JSON parsing overhead and sub-5ms indexed SQL queries for course and ISBN lookups.

```
+------------------+ 1     N +-------------------+ 1     N +-------------------+
|    categories    +-------->|   subcategories   +-------->|     products      |
+------------------+         +-------------------+         +----+----+----+----+
                                                                |    |    |
                                                              1 |  1 |  1 |
                                                                v    v    v N
                                          +---------------------+    |   +-------------------+
                                          |    book_details     |    |   |  product_images   |
                                          +---------------------+    |   +-------------------+
                                                                   1 v N
                                                                 +-------------------+
                                                                 |   product_tags    |
                                                                 +-------------------+
```

---

## 5. LOCATION & CAMPUS SAFE ZONES SCHEMATICS

* **Core Entities**:
  * `colleges`: Universities and higher education institutions with campus boundary coordinates and email domain rules.
  * `campus_safe_zones`: Pre-configured, admin-verified physical meetup locations (e.g. Main Library, Student Union) stored with static `latitude` and `longitude` points.
  * `user_addresses`: Buyer shipping addresses for courier fulfillment.

---

## 6. CART & WISHLIST ENTITIES

* **Core Entities**:
  * `carts`: Active shopping cart container per buyer user.
  * `cart_items`: Cart line items with selected fulfillment method.
  * `wishlists`: Saved items collection per user.
  * `wishlist_items`: Junction connecting user wishlists to target products.

---

## 7. ORDER LIFECYCLE & HISTORICAL SNAPSHOT SYSTEM

> [!NOTE]
> To guarantee financial and legal auditability, `order_items` stores a complete snapshot copy of product title, price, condition, author, and seller info at the exact millisecond of checkout payment authorization. Subsequent seller updates or listing deletions do NOT mutate historical order records.

```
                      +-------------------+
                      |      orders       |
                      +----+----+----+----+
                           |    |    |
                         1 |  1 |  1 |
                           v N  v N  v 1
       +-------------------+    |    +-------------------+
       |    order_items    |    |    |    deliveries     |
       +-------------------+    |    +---------+---------+
                              1 v N            | 1
                      +-------------------+    v N
                      |order_status_histor|  +-------------------+
                      +-------------------+  |tracking_events    |
                                             +-------------------+
```

---

## 8. PAYMENT, ESCROW & FINANCIAL LEDGER

```
                      +-------------------+
                      |      orders       |
                      +---------+---------+
                                | 1
                                |
                                | 1
                      +---------v---------+
                      |     payments      |
                      +---------+---------+
                                | 1
                                |
                                | 1
                      +---------v---------+
                      |   escrow_ledger   |
                      +-------------------+
```

* **Core Entities**:
  * `payments`: Gateway charge attempts (Stripe/Razorpay transaction IDs, status, authorized amount, timestamp).
  * `escrow_ledger`: Double-entry accounting ledger tracking locked buyer funds (`HELD`), released seller payouts (`RELEASED`), and refunded funds (`REFUNDED`).

---

## 9. DELIVERY & HANDOVER SCHEMATICS

* **Core Entities**:
  * `deliveries`: Tracks fulfillment mode (`CAMPUS_MEETUP` vs `COURIER_SHIPPING`), delivery status, shipping carrier name, courier tracking code, and the 6-digit Handover OTP hash.
  * `delivery_tracking_events`: Chronological carrier status logs.

---

## 10. REVIEWS & TRUST SYSTEM

* **Core Entities**:
  * `product_reviews`: Buyer rating & feedback on item condition accuracy.
  * `seller_reviews`: Buyer rating & feedback on seller overall experience.
  * *Integrity Rule*: Product and seller reviews can ONLY be created if `orders.status = COMPLETED` and `orders.buyer_id = review.user_id`.

---

## 11. MESSAGING & NOTIFICATIONS

* **Core Entities**:
  * `conversations`: 1-on-1 chat threads linked to a specific `product_id`.
  * `conversation_participants`: Links users to conversation threads.
  * `messages`: Individual chat messages with text content, automated PII mask flag, and read timestamps.
  * `notifications`: User transactional alert notifications with type, link, and read status.

---

## 12. DISPUTES, MODERATION & ADMIN AUDIT LOGS

* **Core Entities**:
  * `disputes`: Buyer return/refund disputes filed during the 48-hour inspection window.
  * `dispute_evidence`: Uploaded proof photos and documents submitted by buyer/seller.
  * `content_reports`: User flags against suspicious listings or abusive users.
  * `admin_audit_logs`: Immutable audit log recording WHO (Admin ID), WHAT (Action), WHEN (Timestamp), and WHY (Reason).

---

## 13. STATUS ENUM DEFINITIONS

```sql
-- User Account Status
CREATE TYPE user_status_enum AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'BANNED');

-- Seller Type
CREATE TYPE seller_type_enum AS ENUM ('STUDENT', 'BOOKSTORE');

-- Product Listing Status
CREATE TYPE product_status_enum AS ENUM ('DRAFT', 'ACTIVE', 'RESERVED', 'SOLD', 'ARCHIVED', 'SUSPENDED');

-- Product Condition Grade
CREATE TYPE condition_grade_enum AS ENUM ('BRAND_NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'ACCEPTABLE');

-- Order Lifecycle Status
CREATE TYPE order_status_enum AS ENUM ('PAYMENT_PENDING', 'PAID_ESCROW', 'SELLER_ACCEPTED', 'SELLER_REJECTED', 'FULFILLMENT_IN_PROGRESS', 'DELIVERED_PENDING_INSPECTION', 'COMPLETED', 'CANCELLED_BY_BUYER', 'CANCELLED_BY_SELLER', 'DISPUTED', 'REFUNDED');

-- Payment Transaction Status
CREATE TYPE payment_status_enum AS ENUM ('INITIATED', 'AUTHORIZED', 'CAPTURED_IN_ESCROW', 'RELEASED_TO_SELLER', 'REFUNDED_FULL', 'REFUNDED_PARTIAL', 'FAILED');

-- Escrow Ledger Status
CREATE TYPE escrow_status_enum AS ENUM ('HELD', 'RELEASED', 'REFUNDED', 'DISPUTED_HOLD');

-- Delivery Fulfillment Mode
CREATE TYPE fulfillment_mode_enum AS ENUM ('CAMPUS_MEETUP', 'COURIER_SHIPPING');

-- Delivery Status
CREATE TYPE delivery_status_enum AS ENUM ('PENDING_HANDOVER', 'IN_TRANSIT', 'DELIVERED_PENDING_INSPECTION', 'CONFIRMED_DELIVERED', 'FAILED_DELIVERY');

-- Dispute Status
CREATE TYPE dispute_status_enum AS ENUM ('OPENED', 'SELLER_RESPONDED', 'UNDER_ADMIN_REVIEW', 'RESOLVED_BUYER_REFUND', 'RESOLVED_SELLER_PAYOUT', 'CLOSED');
```

---

## 14. COMPLETE DATABASE TABLE SPECIFICATION

---

### Table 1: `colleges`
* **Purpose**: Institutions and universities list.

| Column | Data Type | Nullable | Key / Constraint | Default Value | Description |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `id` | UUID | No | PK | `gen_random_uuid()` | Unique college ID |
| `name` | VARCHAR(150) | No | Unique | - | Official college name |
| `code` | VARCHAR(20) | No | Unique | - | Short code (e.g. `HARVARD`) |
| `email_domain` | VARCHAR(100) | No | Unique | - | `.edu` domain (e.g. `harvard.edu`) |
| `city` | VARCHAR(100) | No | - | - | City name |
| `state` | VARCHAR(50) | No | - | - | State/Region |
| `latitude` | DECIMAL(10,8) | Yes | - | - | Campus center latitude |
| `longitude` | DECIMAL(11,8) | Yes | - | - | Campus center longitude |
| `created_at` | TIMESTAMPTZ | No | - | `CURRENT_TIMESTAMP` | Creation time |
| `updated_at` | TIMESTAMPTZ | No | - | `CURRENT_TIMESTAMP` | Last update time |

* **Indexes**: `idx_colleges_domain (email_domain)`, `idx_colleges_code (code)`.

---

### Table 2: `users`
* **Purpose**: Core user account credentials & authentication state.

| Column | Data Type | Nullable | Key / Constraint | Default Value | Description |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `id` | UUID | No | PK | `gen_random_uuid()` | Unique user ID |
| `college_id` | UUID | No | FK -> `colleges.id` | - | Primary campus assignment |
| `email` | VARCHAR(255) | No | Unique | - | User email address |
| `password_hash` | VARCHAR(255) | Yes | - | NULL | Argon2id / bcrypt password hash |
| `google_id` | VARCHAR(100) | Yes | Unique | NULL | Google OAuth ID |
| `status` | user_status_enum| No | - | `'PENDING_VERIFICATION'`| Account status |
| `is_email_verified`| BOOLEAN | No | - | `FALSE` | Email verification flag |
| `is_student_verified`| BOOLEAN | No | - | `FALSE` | `.edu` Student badge flag |
| `created_at` | TIMESTAMPTZ | No | - | `CURRENT_TIMESTAMP` | Registration time |
| `updated_at` | TIMESTAMPTZ | No | - | `CURRENT_TIMESTAMP` | Profile update time |
| `deleted_at` | TIMESTAMPTZ | Yes | Index | NULL | Soft deletion timestamp |

* **Indexes**: `idx_users_email (email)`, `idx_users_college (college_id)`, `idx_users_status (status) WHERE deleted_at IS NULL`.

---

### Table 3: `roles` & Table 4: `user_roles`
* **Purpose**: Role-Based Access Control (RBAC).

```
roles (id PK, name UNIQUE, description)
user_roles (user_id FK, role_id FK, PRIMARY KEY (user_id, role_id))
```

---

### Table 5: `user_profiles`
* **Purpose**: Public profile metadata.

| Column | Data Type | Nullable | Key / Constraint | Default Value | Description |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `user_id` | UUID | No | PK, FK -> `users.id`| - | User reference |
| `first_name` | VARCHAR(50) | No | - | - | First name |
| `last_name` | VARCHAR(50) | No | - | - | Last name |
| `avatar_url` | TEXT | Yes | - | NULL | Avatar image CDN URL |
| `bio` | TEXT | Yes | - | NULL | Short bio description |
| `phone_number` | VARCHAR(20) | Yes | Unique | NULL | Verified phone number |
| `created_at` | TIMESTAMPTZ | No | - | `CURRENT_TIMESTAMP` | Creation time |
| `updated_at` | TIMESTAMPTZ | No | - | `CURRENT_TIMESTAMP` | Update time |

---

### Table 6: `sellers`
* **Purpose**: Extends user with seller profile & commercial details.

| Column | Data Type | Nullable | Key / Constraint | Default Value | Description |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `id` | UUID | No | PK | `gen_random_uuid()` | Unique seller ID |
| `user_id` | UUID | No | Unique, FK -> `users.id`| - | Linked user ID |
| `seller_type` | seller_type_enum| No | - | `'STUDENT'` | Student vs Bookstore |
| `store_name` | VARCHAR(100) | No | - | - | Display store name |
| `business_reg_number`| VARCHAR(50)| Yes | - | NULL | Bookstore tax/reg ID |
| `operating_hours` | JSONB | Yes | - | NULL | Bookstore hours JSON |
| `average_rating` | DECIMAL(3,2) | No | CHECK(1-5) | `0.00` | Aggregated star rating |
| `total_sales_count` | INTEGER | No | - | `0` | Completed orders count |
| `is_verified_seller`| BOOLEAN | No | - | `FALSE` | Admin verification badge |
| `created_at` | TIMESTAMPTZ | No | - | `CURRENT_TIMESTAMP` | Seller onboarding date |
| `updated_at` | TIMESTAMPTZ | No | - | `CURRENT_TIMESTAMP` | Update time |

* **Indexes**: `idx_sellers_user (user_id)`, `idx_sellers_type (seller_type)`, `idx_sellers_rating (average_rating DESC)`.

---

### Table 7: `categories` & Table 8: `subcategories`
* **Purpose**: Catalog taxonomy tree.

```
categories (id PK, name UNIQUE, slug UNIQUE, icon_url, display_order)
subcategories (id PK, category_id FK -> categories.id, name, slug UNIQUE, display_order)
```

---

### Table 9: `products`
* **Purpose**: Master inventory table for all secondhand items.

| Column | Data Type | Nullable | Key / Constraint | Default Value | Description |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `id` | UUID | No | PK | `gen_random_uuid()` | Unique product ID |
| `seller_id` | UUID | No | FK -> `sellers.id` | - | Owner seller ID |
| `college_id` | UUID | No | FK -> `colleges.id` | - | Campus listing location |
| `category_id` | UUID | No | FK -> `categories.id`| - | Root category |
| `subcategory_id` | UUID | No | FK -> `subcategories.id`| - | Subcategory |
| `title` | VARCHAR(150) | No | Index | - | Item title |
| `description` | TEXT | No | - | - | Item description |
| `condition_grade` | condition_grade_enum| No| Index | - | Physical condition grade |
| `condition_notes` | TEXT | No | - | - | Disclosure of flaws |
| `price` | DECIMAL(10,2) | No | CHECK(price > 0)| - | Asking price |
| `original_msrp` | DECIMAL(10,2) | Yes | - | NULL | MSRP for savings % |
| `quantity` | INTEGER | No | CHECK(qty >= 0) | `1` | Available stock count |
| `fulfillment_methods`| VARCHAR(50)[]| No | - | - | Array: `['MEETUP', 'SHIPPING']` |
| `attributes` | JSONB | Yes | GIN Index | `'{}'` | Flexible specs (calculators, tools) |
| `status` | product_status_enum| No| Index | `'ACTIVE'` | Listing status |
| `views_count` | INTEGER | No | - | `0` | Analytics view counter |
| `created_at` | TIMESTAMPTZ | No | Index | `CURRENT_TIMESTAMP` | Publication timestamp |
| `updated_at` | TIMESTAMPTZ | No | - | `CURRENT_TIMESTAMP` | Last edit timestamp |
| `deleted_at` | TIMESTAMPTZ | Yes | Index | NULL | Soft delete timestamp |

* **Indexes**:
  * `idx_products_search (title, description)` (Full-text GIN index)
  * `idx_products_college_status (college_id, status) WHERE deleted_at IS NULL`
  * `idx_products_category (category_id, subcategory_id)`
  * `idx_products_price (price ASC)`
  * `idx_products_attributes_gin (attributes)` (GIN Index for JSONB queries)

---

### Table 10: `book_details`
* **Purpose**: 1:1 Relational extension table for book-specific metadata.

| Column | Data Type | Nullable | Key / Constraint | Default Value | Description |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `product_id` | UUID | No | PK, FK -> `products.id` ON DELETE CASCADE | - | Product reference |
| `isbn_10` | VARCHAR(10) | Yes | Index | NULL | ISBN-10 code |
| `isbn_13` | VARCHAR(13) | Yes | Index | NULL | ISBN-13 code |
| `author` | VARCHAR(150) | No | Index | - | Book author name(s) |
| `publisher` | VARCHAR(100) | Yes | - | NULL | Publisher name |
| `edition` | VARCHAR(50) | Yes | - | NULL | Edition (e.g. `10th Edition`) |
| `course_code` | VARCHAR(20) | Yes | Index | NULL | Campus course code (e.g. `CS101`) |
| `publication_year`| INTEGER | Yes | - | NULL | Release year |

* **Indexes**: `idx_books_isbn13 (isbn_13)`, `idx_books_isbn10 (isbn_10)`, `idx_books_course (course_code)`, `idx_books_author (author)`.

---

### Table 11: `product_images`
* **Purpose**: Uploaded image URLs for listings.

```
product_images (
  id UUID PK, 
  product_id UUID FK -> products.id ON DELETE CASCADE, 
  image_url TEXT NOT NULL, 
  display_order INT NOT NULL DEFAULT 0, 
  is_primary BOOLEAN DEFAULT FALSE
)
```

---

### Table 12: `carts` & Table 13: `cart_items`
* **Purpose**: Active shopping cart container & items.

```
carts (id UUID PK, user_id UUID UNIQUE FK -> users.id, updated_at TIMESTAMPTZ)
cart_items (
  id UUID PK, 
  cart_id UUID FK -> carts.id ON DELETE CASCADE, 
  product_id UUID FK -> products.id, 
  selected_fulfillment fulfillment_mode_enum NOT NULL, 
  quantity INT DEFAULT 1, 
  UNIQUE(cart_id, product_id)
)
```

---

### Table 14: `orders`
* **Purpose**: Master order record.

| Column | Data Type | Nullable | Key / Constraint | Default Value | Description |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `id` | UUID | No | PK | `gen_random_uuid()` | Unique order ID |
| `order_number` | VARCHAR(20) | No | Unique | - | Human-readable Order # |
| `buyer_id` | UUID | No | FK -> `users.id` | - | Buyer user ID |
| `seller_id` | UUID | No | FK -> `sellers.id` | - | Seller ID |
| `college_id` | UUID | No | FK -> `colleges.id` | - | Campus transaction venue |
| `total_item_amount`| DECIMAL(10,2) | No | - | - | Subtotal of items |
| `buyer_fee_amount` | DECIMAL(10,2) | No | - | - | Platform buyer fee |
| `delivery_fee_amount`| DECIMAL(10,2)| No | - | - | Delivery / Courier fee |
| `total_amount` | DECIMAL(10,2) | No | - | - | Grand total charged |
| `status` | order_status_enum| No| Index | `'PAYMENT_PENDING'`| Order state machine |
| `acceptance_deadline`| TIMESTAMPTZ| No | - | - | 24-hour seller limit |
| `created_at` | TIMESTAMPTZ | No | Index | `CURRENT_TIMESTAMP` | Order timestamp |
| `updated_at` | TIMESTAMPTZ | No | - | `CURRENT_TIMESTAMP` | Last status update |

* **Indexes**: `idx_orders_buyer (buyer_id)`, `idx_orders_seller (seller_id)`, `idx_orders_status (status)`.

---

### Table 15: `order_items`
* **Purpose**: Preserves exact purchase-time metadata snapshot.

| Column | Data Type | Nullable | Key / Constraint | Default Value | Description |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `id` | UUID | No | PK | `gen_random_uuid()` | Line item ID |
| `order_id` | UUID | No | FK -> `orders.id` ON DELETE CASCADE | - | Parent order |
| `product_id` | UUID | Yes | FK -> `products.id` SET NULL | - | Reference product |
| `snapshot_title` | VARCHAR(150) | No | - | - | Title at purchase |
| `snapshot_price` | DECIMAL(10,2) | No | - | - | Unit price at purchase |
| `snapshot_condition`| condition_grade_enum| No| - | - | Condition grade at purchase |
| `snapshot_isbn` | VARCHAR(13) | Yes | - | NULL | ISBN at purchase |
| `quantity` | INTEGER | No | - | `1` | Purchased quantity |

---

### Table 16: `deliveries`
* **Purpose**: Handover & Shipping fulfillment tracking.

| Column | Data Type | Nullable | Key / Constraint | Default Value | Description |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `id` | UUID | No | PK | `gen_random_uuid()` | Delivery record ID |
| `order_id` | UUID | No | Unique, FK -> `orders.id` | - | Linked order ID |
| `fulfillment_mode` | fulfillment_mode_enum| No | - | - | `MEETUP` vs `SHIPPING` |
| `status` | delivery_status_enum| No | - | `'PENDING_HANDOVER'`| Delivery status |
| `safe_zone_id` | UUID | Yes | FK -> `campus_safe_zones.id`| NULL | Meetup spot (if meetup) |
| `handover_otp_hash`| VARCHAR(255) | Yes | - | NULL | Hashed 6-digit OTP |
| `carrier_name` | VARCHAR(50) | Yes | - | NULL | Carrier (e.g. USPS/FedEx) |
| `tracking_number` | VARCHAR(100) | Yes | - | NULL | Courier tracking ID |
| `delivered_at` | TIMESTAMPTZ | Yes | - | NULL | Delivery timestamp |
| `inspection_expires_at`| TIMESTAMPTZ| Yes| Index | NULL | 48-hour inspection end |

---

### Table 17: `payments` & Table 18: `escrow_ledger`
* **Purpose**: Gateway charge records & double-entry escrow tracking.

```
payments (
  id UUID PK, 
  order_id UUID UNIQUE FK -> orders.id, 
  payment_gateway VARCHAR(50) NOT NULL, 
  transaction_reference VARCHAR(100) UNIQUE NOT NULL, 
  amount DECIMAL(10,2) NOT NULL, 
  status payment_status_enum NOT NULL DEFAULT 'INITIATED', 
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
)

escrow_ledger (
  id UUID PK, 
  order_id UUID UNIQUE FK -> orders.id, 
  gross_amount DECIMAL(10,2) NOT NULL, 
  platform_fee_amount DECIMAL(10,2) NOT NULL, 
  seller_net_amount DECIMAL(10,2) NOT NULL, 
  status escrow_status_enum NOT NULL DEFAULT 'HELD', 
  released_at TIMESTAMPTZ NULL, 
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
)
```

---

### Table 19: `seller_wallets` & Table 20: `payout_withdrawals`
* **Purpose**: Seller balance ledger & bank withdrawal logs.

```
seller_wallets (
  seller_id UUID PK FK -> sellers.id, 
  available_balance DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (available_balance >= 0), 
  pending_escrow_balance DECIMAL(10,2) NOT NULL DEFAULT 0.00, 
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
)

payout_withdrawals (
  id UUID PK, 
  seller_id UUID FK -> sellers.id, 
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 5.00), 
  payout_method VARCHAR(50) NOT NULL, 
  payout_reference VARCHAR(100) UNIQUE NULL, 
  status VARCHAR(20) NOT NULL DEFAULT 'PROCESSING', 
  requested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, 
  completed_at TIMESTAMPTZ NULL
)
```

---

### Table 21: `disputes` & Table 22: `dispute_evidence`
* **Purpose**: Return/Refund dispute arbitration.

```
disputes (
  id UUID PK, 
  order_id UUID UNIQUE FK -> orders.id, 
  buyer_id UUID FK -> users.id, 
  reason_category VARCHAR(50) NOT NULL, 
  description TEXT NOT NULL, 
  status dispute_status_enum NOT NULL DEFAULT 'OPENED', 
  admin_notes TEXT NULL, 
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, 
  resolved_at TIMESTAMPTZ NULL
)

dispute_evidence (
  id UUID PK, 
  dispute_id UUID FK -> disputes.id ON DELETE CASCADE, 
  submitted_by_user_id UUID FK -> users.id, 
  file_url TEXT NOT NULL, 
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
)
```

---

### Table 23: `product_reviews` & Table 24: `seller_reviews`
* **Purpose**: Double-blind reputation management.

```
product_reviews (
  id UUID PK, 
  order_id UUID UNIQUE FK -> orders.id, 
  product_id UUID FK -> products.id, 
  buyer_id UUID FK -> users.id, 
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5), 
  review_text TEXT NULL, 
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
)

seller_reviews (
  id UUID PK, 
  order_id UUID UNIQUE FK -> orders.id, 
  seller_id UUID FK -> sellers.id, 
  buyer_id UUID FK -> users.id, 
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5), 
  review_text TEXT NULL, 
  seller_reply TEXT NULL, 
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
)
```

---

### Table 25: `conversations`, Table 26: `messages` & Table 27: `notifications`
* **Purpose**: Messaging and real-time user notification logs.

```
conversations (id UUID PK, product_id UUID FK -> products.id, created_at TIMESTAMPTZ)
messages (
  id UUID PK, 
  conversation_id UUID FK -> conversations.id ON DELETE CASCADE, 
  sender_id UUID FK -> users.id, 
  message_text TEXT NOT NULL, 
  is_pii_masked BOOLEAN DEFAULT FALSE, 
  read_at TIMESTAMPTZ NULL, 
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
)
notifications (
  id UUID PK, 
  user_id UUID FK -> users.id ON DELETE CASCADE, 
  type VARCHAR(50) NOT NULL, 
  title VARCHAR(100) NOT NULL, 
  body TEXT NOT NULL, 
  target_url TEXT NULL, 
  is_read BOOLEAN DEFAULT FALSE, 
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
)
```

---

### Table 28: `admin_audit_logs`
* **Purpose**: Immutable security audit trail recording WHO, WHAT, WHEN, WHY.

| Column | Data Type | Nullable | Key / Constraint | Default Value | Description |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `id` | UUID | No | PK | `gen_random_uuid()` | Audit record ID |
| `admin_user_id` | UUID | No | FK -> `users.id` | - | Admin executor ID |
| `action_type` | VARCHAR(50) | No | Index | - | Action tag (e.g. `USER_BAN`) |
| `target_entity` | VARCHAR(50) | No | - | - | Target table (e.g. `users`) |
| `target_entity_id`| UUID | No | - | - | Target record ID |
| `changes_json` | JSONB | Yes | - | NULL | Diff of old vs new values |
| `reason` | TEXT | No | - | - | Mandatory justification reason |
| `ip_address` | VARCHAR(45) | Yes | - | NULL | Admin IP address |
| `created_at` | TIMESTAMPTZ | No | Index | `CURRENT_TIMESTAMP` | Audit timestamp |

---

## 15. DATA INTEGRITY & BUSINESS RULES MATRIX

1. **Listing Ownership & Isolation**: A product listing MUST belong to a valid `seller_id`. A seller can edit/delete ONLY listings where `products.seller_id = current_seller_id`.
2. **Order Snapshot Integrity**: When an order is authorized, `order_items` MUST copy `snapshot_title`, `snapshot_price`, and `snapshot_condition` directly from `products` and `book_details`. Modifying the root product table MUST NOT change historical order items.
3. **Escrow Double-Entry Constraint**:
   $$\text{payments.amount} = \text{escrow\_ledger.gross\_amount}$$
   $$\text{escrow\_ledger.gross\_amount} = \text{escrow\_ledger.seller\_net\_amount} + \text{escrow\_ledger.platform\_fee\_amount}$$
4. **Review Eligibility**: A review entry in `product_reviews` or `seller_reviews` CANNOT be inserted unless there exists an order with `status = COMPLETED` where `orders.buyer_id = current_user_id`.
5. **Wallet Non-Negativity**: `seller_wallets.available_balance` has a database `CHECK (available_balance >= 0.00)` constraint preventing overdrafts.

---

## 16. INDEXING STRATEGY & QUERY OPTIMIZATION

```sql
-- 1. Full-Text Search Index for Marketplace Catalog
CREATE INDEX idx_products_fulltext ON products 
USING GIN (to_tsvector('english', title || ' ' || description));

-- 2. ISBN Exact Match Indexes for Books
CREATE INDEX idx_book_details_isbn13 ON book_details(isbn_13);
CREATE INDEX idx_book_details_isbn10 ON book_details(isbn_10);
CREATE INDEX idx_book_details_course ON book_details(course_code);

-- 3. Composite Index for Campus Marketplace Feed
CREATE INDEX idx_products_campus_feed ON products(college_id, category_id, status, created_at DESC) 
WHERE deleted_at IS NULL;

-- 4. Fast Buyer Order Lookup Index
CREATE INDEX idx_orders_buyer_lookup ON orders(buyer_id, status, created_at DESC);

-- 5. Active Unread Notifications Index
CREATE INDEX idx_notifications_unread ON notifications(user_id, created_at DESC) 
WHERE is_read = FALSE;
```

---

## 17. SCALABILITY & GROWTH ROADMAP

### Growth Phase Strategy (100 $\rightarrow$ 1,000,000+ Users)

```
[100 - 10,000 Users]         [100,000 Users]                [1,000,000+ Users]
Single PostgreSQL Instance   PostgreSQL Primary             PostgreSQL Cluster
All Tables in Primary DB     + Read Replica (Read Scaling)  + Meilisearch / Elasticsearch
                             + Redis Caching Layer          + Connection Pooling (PgBouncer)
                             + Offload Search to Engine     + Table Partitioning (orders/logs)
```

1. **Read-Heavy Caching Layer (10k+ Users)**: Cache top course catalogs, category trees, and landing page feed listings in Redis (TTL 15 mins).
2. **Offload Full-Text Search (100k+ Users)**: Synchronize `products` and `book_details` changes via CDC (Change Data Capture) or background queues to **Meilisearch** or **Elasticsearch** for sub-20ms search indexing.
3. **Partitioning Strategy (1M+ Users)**: Partition `orders`, `order_status_history`, and `admin_audit_logs` by range on `created_at` (Monthly/Yearly tables).

---

## 18. SECURITY, PRIVACY & PII HANDLING

1. **Password Hash Protection**: Raw passwords are NEVER stored. Passwords are hashed using **Argon2id** (or bcrypt with cost factor 12).
2. **PII Isolation & Address Security**: Buyer shipping addresses in `user_addresses` are accessible ONLY by the order buyer and the assigned seller post-order acceptance.
3. **Payment Credentials**: Zero credit card numbers, CVVs, or bank secrets are stored in the database. Gateway tokens (`payment_method_id`, `stripe_customer_id`) are stored instead.
4. **Hashed Handover OTPs**: 6-Digit Handover OTPs are stored as SHA-256 hashes (`handover_otp_hash`) in `deliveries` table to prevent internal database compromise.

---

## 19. MVP DATABASE TABLE PRIORITIZATION MATRIX (P0 / P1 / P2)

| Table Name | Priority Tier | Purpose / MVP Requirement |
| :--- | :---: | :--- |
| `colleges` | **P0** | Essential campus mapping. |
| `users` | **P0** | Authentication and core identity. |
| `roles` & `user_roles` | **P0** | Permissions matrix. |
| `user_profiles` | **P0** | User display profile. |
| `sellers` | **P0** | Seller account identification. |
| `categories` & `subcategories` | **P0** | Taxonomy directory. |
| `products` | **P0** | Master product catalog. |
| `book_details` | **P0** | Course code & ISBN metadata lookup. |
| `product_images` | **P0** | Listing photo storage. |
| `carts` & `cart_items` | **P0** | Shopping cart functionality. |
| `orders` & `order_items` | **P0** | Core purchase order processing. |
| `deliveries` & `campus_safe_zones` | **P0** | Safe Zone OTP handover & shipping. |
| `payments` & `escrow_ledger` | **P0** | Gateway payments & Escrow holding. |
| `seller_wallets` & `payout_withdrawals` | **P0** | Seller earnings & bank payouts. |
| `disputes` & `dispute_evidence` | **P0** | 48-hour inspection dispute arbitration. |
| `conversations` & `messages` | **P0** | Buyer-seller real-time chat with PII mask. |
| `notifications` | **P0** | Order status alerts. |
| `admin_audit_logs` | **P0** | Platform security audit. |
| `product_reviews` & `seller_reviews` | **P1** | Reputation engine. |
| `user_addresses` | **P1** | Saved shipping address book. |
| `user_verifications` & `seller_verifications` | **P1** | Advanced ID document uploads. |
| `coupons` & `coupon_redemptions` | **P2** | Future promotional codes. |

---

## 20. DATABASE ENTITY COUNT BREAKDOWN SUMMARY

* **Total Core P0 Database Tables (Launch MVP)**: **28 Tables**
* **Total P1 Database Tables (Post-Launch)**: **7 Tables**
* **Total P2 Database Tables (Future Extensions)**: **2 Tables**
* **Grand Total Specified Schema**: **37 Tables**
