# CampusMarket (Student Secondhand Marketplace)
## Complete Functional Feature Specification

---

## 1. AUTHENTICATION & ACCOUNT

### 1.1 Sign Up
* **Functional Requirement**: 
  * Users can register using Email + Password, Google OAuth, or SSO.
  * System must capture First Name, Last Name, Email, Password (hashed), and Primary College Campus.
  * If an `.edu` domain email is used, the system automatically tags the account for campus student verification.
  * Password must meet security rules (min 8 chars, 1 number, 1 special char).

### 1.2 Login & Session Management
* **Functional Requirement**:
  * Users can authenticate using registered Email/Password or Social OAuth.
  * JWT access tokens (short-lived) and secure HTTP-only refresh tokens (long-lived) issued upon successful authentication.
  * Support for "Remember Me" session persistence.

### 1.3 Logout
* **Functional Requirement**:
  * User can log out of current session.
  * Invalidates client refresh token and clears active session state.

### 1.4 Password Reset
* **Functional Requirement**:
  * Unauthenticated users can request a password reset via email.
  * System generates a cryptographically secure, time-limited reset token (15-minute validity).
  * User clicks link or enters 6-digit OTP to set a new password.

### 1.5 Email & Phone Verification
* **Functional Requirement**:
  * Account activation requires email OTP verification.
  * Phone number verification via SMS OTP is required prior to placing an order or creating a listing.

### 1.6 Profile Management
* **Functional Requirement**:
  * Users can upload/update avatar image, display name, bio, phone number, and primary campus location.
  * Profile displays verified status badges (`Verified Student`, `Verified Bookstore`), average rating, member since date, and public active listings.

### 1.7 Account Settings
* **Functional Requirement**:
  * Toggle notification preferences (Email, Push, In-App).
  * Manage saved payment methods and payout bank accounts.
  * Security tab: Change password, view active sessions, delete account.

### 1.8 Role-Based Access Control (RBAC)
* **Functional Requirement**:
  * System enforces strict permissions across roles: `GUEST`, `STUDENT_BUYER`, `STUDENT_SELLER`, `COMMERCIAL_BOOKSTORE`, `ADMIN`.

### 1.9 Seller Onboarding
* **Functional Requirement**:
  * Student Sellers convert account to Seller by providing phone verification and payout bank details.
  * Commercial Bookstores complete specialized onboarding: Store Business Name, Business Registration ID, Physical Store Address, Store Phone, and Bank Account.

### 1.10 Seller Verification
* **Functional Requirement**:
  * `.edu` email confirmation grants instant "Verified Student" badge.
  * Fallback: Upload Student ID Card photo for manual Admin review.
  * Commercial Bookstores require Admin manual document verification before publishing bulk listings.

---

## 2. BUYER FEATURES

### 2.1 Home Feed
* **Functional Requirement**:
  * Displays campus-specific curated hero banner, recently listed products, top textbooks for popular campus courses, browse-by-category shortcuts, and nearby items.

### 2.2 Product Discovery
* **Functional Requirement**:
  * Responsive product grid/list view displaying thumbnail, title, price, condition badge (`Brand New`, `Like New`, `Good`, `Fair`, `Acceptable`), seller name/badge, and distance/campus location.

### 2.3 Categories & Taxonomy
* **Functional Requirement**:
  * Multi-level taxonomy:
    * **Books**: Textbooks, Reference Books, Fiction & Non-Fiction, Exam Prep.
    * **Lab & Tech Gear**: Calculators, Lab Equipment, Engineering Tools, Drawing Instruments.
    * **Creative & Audio**: Art Supplies, Musical Instruments.
    * **Electronics**: Educational Electronics, Accessories.
    * **Other**: General Student Supplies.

### 2.4 Search
* **Functional Requirement**:
  * Real-time search by Keyword, Title, Author, Publisher, Course Code (e.g., `CS101`), or ISBN-10/13.
  * Auto-complete suggestions while typing.

### 2.5 Filters
* **Functional Requirement**:
  * Multi-select filtering by Category, Subcategory, Condition Grade, Price Range (Min/Max slider), Fulfillment Method (Campus Meetup vs Courier Shipping), and Campus Radius.

### 2.6 Sorting
* **Functional Requirement**:
  * Sort search results by: `Relevance`, `Price: Low to High`, `Price: High to Low`, `Newest First`, `Distance: Closest`.

### 2.7 Product Details Page (PDP)
* **Functional Requirement**:
  * High-res image carousel with zoom.
  * Complete product metadata (Title, Author, Edition, ISBN, Publisher, Course Code).
  * Condition badge and explicit seller condition description (flaws, highlighting, wear).
  * Seller profile snippet (Avatar, Rating score, Total sales, Campus badge, Response time).
  * Fulfillment options available (Campus Safe Zone list or Courier shipping fee).
  * Action buttons: `Buy Now`, `Add to Cart`, `Message Seller`.

### 2.8 Product Condition Visualizer
* **Functional Requirement**:
  * Standardized visual breakdown card displaying condition score, highlighting percentage, cover wear level, and included original accessories (e.g., lab manual, access code status).

### 2.9 Seller Information Card
* **Functional Requirement**:
  * Displays seller trust metrics, verified status, joined date, aggregated star ratings, and link to all other items sold by the seller.

### 2.10 Location & Campus Context
* **Functional Requirement**:
  * Displays designated campus pickup points or distance in miles/km from buyer's campus location.

### 2.11 Wishlist / Saved Items
* **Functional Requirement**:
  * One-click bookmarking of listings to a personal Saved list.
  * Automated push/email alert when a book on Wishlist drops in price.

### 2.12 Cart System
* **Functional Requirement**:
  * Multi-item cart (grouped by seller).
  * Real-time item availability validation before checkout.

### 2.13 Checkout System
* **Functional Requirement**:
  * Single or multi-step checkout selecting:
    1. Fulfillment Mode: Campus Safe Zone Meetup (select location + time slot) OR Courier Delivery.
    2. Shipping Address selection (if delivery).
    3. Payment Method selection.
    4. Order summary breakdown (Item subtotal, Platform service fee, Delivery fee, Total).

### 2.14 Address Management
* **Functional Requirement**:
  * Save, edit, and delete shipping addresses (Dorm Building, Apartment, Street Address, Postal Code).

### 2.15 Orders Dashboard
* **Functional Requirement**:
  * Tabbed order history (`Active`, `Completed`, `Cancelled`, `Disputed`).
  * Order Detail view with full status timeline, order ID, payment receipt, seller contact, and handover details.

### 2.16 Order Tracking
* **Functional Requirement**:
  * Visual progress tracker: `Order Placed` $\rightarrow$ `Payment Authorized` $\rightarrow$ `Seller Accepted` $\rightarrow$ `Meetup Scheduled / Shipped` $\rightarrow$ `Delivered` $\rightarrow$ `Completed`.

### 2.17 Cancellation
* **Functional Requirement**:
  * Buyer can cancel an order penalty-free before the seller accepts the order.
  * Post-acceptance cancellation requires seller consent or Admin intervention.

### 2.18 Returns & Refunds Request
* **Functional Requirement**:
  * Buyer can initiate a Return/Refund request within **48 hours** post-handover/delivery by providing reason, description, and photo evidence.

### 2.19 Reviews and Ratings
* **Functional Requirement**:
  * Post-completion double-blind rating (1 to 5 stars + optional comment) for both seller and item quality.

### 2.20 Notifications
* **Functional Requirement**:
  * Real-time notifications for order status changes, seller chat messages, price drops, and dispute updates.

### 2.21 Buyer Profile Page
* **Functional Requirement**:
  * Public view of buyer's verified student badge, review history as a buyer, and public activity.

---

## 3. SELLER FEATURES

### 3.1 Seller Dashboard
* **Functional Requirement**:
  * Overview cards: Total Earnings, Pending Orders, Active Listings, Sold Items, Average Response Rate.
  * Action quick-links: `Create Listing`, `Manage Inventory`, `View Payouts`.

### 3.2 Seller Storefront Profile
* **Functional Requirement**:
  * Customizable banner, store logo/avatar, store description, operating hours (for bookstores), aggregated ratings, and grid of active inventory.

### 3.3 Create Listing
* **Functional Requirement**:
  * Form inputs: Title, Category/Subcategory, ISBN (optional manual entry), Author, Publisher, Edition, Course Code mapping, Condition Grade, Price, Quantity (default 1 for students), Fulfillment options, Description, and photo uploads (1 to 4 images).

### 3.4 Edit Listing
* **Functional Requirement**:
  * Modify title, description, price, condition notes, and photos for active listings without pending orders.

### 3.5 Delete / Archive Listing
* **Functional Requirement**:
  * Soft-delete or archive listings. Cannot delete listings with active/pending orders.

### 3.6 Product Images Upload
* **Functional Requirement**:
  * Client-side image preview, cropping, re-ordering, and mandatory primary cover photo selection. Maximum file size 10MB per image.

### 3.7 Product Condition Assessment Form
* **Functional Requirement**:
  * Mandatory disclosure fields: Highlighting level (`None`, `Minor`, `Heavy`), Spine/Cover condition, Page damage, and Access Code status (`Included/Unused`, `Used/Missing`, `N/A`).

### 3.8 Pricing & Earnings Calculator
* **Functional Requirement**:
  * Dynamic breakdown during listing creation:
    * *Listing Price* - *Platform Fee (5-8%)* = **Estimated Net Seller Payout**.

### 3.9 Inventory Management
* **Functional Requirement**:
  * Track stock levels. Commercial Bookstores can update stock counts in bulk.

### 3.10 Listing Status Management
* **Functional Requirement**:
  * Status transition: `Draft` $\rightarrow$ `Active` $\rightarrow$ `Reserved` (Order Pending) $\rightarrow$ `Sold` OR `Archived` / `Suspended` (Admin action).

### 3.11 Order Management
* **Functional Requirement**:
  * View pending incoming orders.
  * Action buttons: `Accept Order` (within 24 hours), `Reject Order`.
  * Specify handover details (Select Safe Zone / Time) or enter Courier Tracking Number & Carrier Name.

### 3.12 Sales History & Financial Statements
* **Functional Requirement**:
  * Filterable sales log exportable as CSV/PDF.

### 3.13 Earnings & Payout Wallet
* **Functional Requirement**:
  * Wallet view: `Available Balance` (cleared escrow funds), `Pending Escrow Balance`, `Total Withdrawn`.
  * Initiate withdrawal to linked bank account / UPI.

### 3.14 Seller Reviews Management
* **Functional Requirement**:
  * View all customer ratings and leave a one-time public reply to buyer reviews.

### 3.15 Seller Verification Portal
* **Functional Requirement**:
  * Upload student ID card / store business license and view verification approval progress.

### 3.16 Seller Notifications
* **Functional Requirement**:
  * Alerts for new orders, buyer messages, dispute alerts, and wallet payout releases.

---

## 4. PRODUCT SYSTEM & DATA SPECIFICATION

### 4.1 Product Data Attributes

| Attribute Name | Data Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `id` | UUID | Yes | Unique product identifier |
| `title` | String (100) | Yes | Item title |
| `description` | Text | Yes | Detailed item description and disclosure of wear |
| `category_id` | Foreign Key | Yes | Root category reference |
| `subcategory_id` | Foreign Key | Yes | Subcategory reference |
| `brand_or_publisher` | String (100) | No | Publisher (e.g. Pearson) or Brand (e.g. Texas Instruments) |
| `author` | String (100) | No | Book author name(s) |
| `edition` | String (50) | No | Book edition (e.g. 10th Edition) |
| `isbn_10` | String (10) | No | ISBN-10 standard code |
| `isbn_13` | String (13) | No | ISBN-13 standard code |
| `course_code` | String (20) | No | University course code mapping (e.g. `MATH201`) |
| `condition_grade` | Enum | Yes | `BRAND_NEW`, `LIKE_NEW`, `GOOD`, `FAIR`, `ACCEPTABLE` |
| `condition_notes` | Text | Yes | Explicit details regarding flaws, highlighting, scratches |
| `price` | Decimal (10,2) | Yes | Listing asking price |
| `original_retail_price` | Decimal (10,2) | No | Original MSRP for price savings calculation |
| `currency` | String (3) | Yes | ISO currency code (e.g., `USD`, `INR`) |
| `image_urls` | Array[String] | Yes | Image URLs (Min 1, Max 4) |
| `quantity` | Integer | Yes | Available units (Default 1 for student sellers) |
| `campus_id` | Foreign Key | Yes | Campus location listing is assigned to |
| `location_name` | String (100) | Yes | General area name or campus safe zone name |
| `fulfillment_methods` | Array[Enum] | Yes | `CAMPUS_MEETUP`, `COURIER_SHIPPING` |
| `seller_id` | Foreign Key | Yes | User ID of listing owner |
| `status` | Enum | Yes | `DRAFT`, `ACTIVE`, `RESERVED`, `SOLD`, `ARCHIVED`, `SUSPENDED` |
| `tags` | Array[String] | No | Keywords for enhanced search discovery |
| `created_at` | Timestamp | Yes | UTC creation timestamp |
| `updated_at` | Timestamp | Yes | UTC last update timestamp |

### 4.2 Secondhand Condition Levels Definition

1. **Brand New**:
   * *Definition*: Item is crisp, unopened, shrink-wrapped, or never used. Zero wear or cosmetic defects.
2. **Like New**:
   * *Definition*: Item opened or lightly handled. Zero writing/highlighting in books. Zero scratches on equipment. Functions 100% perfectly.
3. **Good**:
   * *Definition*: Light cosmetic wear. Books may have minor highlighting (<20% of pages). Equipment has light surface scuffs. No missing parts or structural damage.
4. **Fair**:
   * *Definition*: Moderate cosmetic wear. Books have noticeable highlighting or writing on pages. Cover edges worn. Lab gear/calculators show clear signs of use but function perfectly.
5. **Acceptable**:
   * *Definition*: Heavy wear. Book covers creased, significant highlighting. Equipment cosmetically worn/scratched. Item is fully functional for course requirements; all defects explicitly described and photographed.

---

## 5. SEARCH & DISCOVERY SPECIFICATION

### 5.1 Search Behavior
* **Fuzzy Text Search**: Partial title, author, and keyword matching.
* **Exact ISBN Search**: Searching an 10 or 13 digit ISBN returns exact book edition matches.
* **Course Code Search**: Searching `CS101` returns all books and tools tagged with course `CS101` at the user's selected campus.

### 5.2 Multi-Faceted Filters & Sorting
* **Filters**: Category tree, Subcategory, Condition Grade, Price Range, Fulfillment Type, Campus/Distance radius (1km, 5km, 10km, Campus-Wide).
* **Sorting Options**: `Relevance`, `Price: Low to High`, `Price: High to Low`, `Newest Listings`, `Proximity: Nearest First`.

### 5.3 Discovery Collections
* **Recently Added**: Real-time stream of newly published listings on campus.
* **Popular on Campus**: High-demand textbooks and tools frequently searched by students at the selected university.
* **Recommendations**: Dynamic listings matching user's browse history and course interest.

---

## 6. ORDER SYSTEM & STATE MACHINE SPECIFICATION

### 6.1 Complete Order Lifecycle States

```
[DRAFT] --> [PAYMENT_PENDING] --> [PAID_ESCROW] --> [SELLER_ACCEPTED] --> [FULFILLMENT_IN_PROGRESS]
                                       |                                           |
                                       v                                           v
                              [SELLER_REJECTED]                           [DELIVERED_PENDING_INSPECTION]
                                       |                                           |
                                       v                                           +--> [COMPLETED]
                                [REFUND_ISSUED]                                    +--> [DISPUTED] --> [REFUNDED/RESOLVED]
```

1. **Product Selection & Cart**: Buyer selects item and fulfillment method.
2. **Payment Authorization**: Buyer submits payment; funds locked in **Escrow**. Order status set to `PAID_ESCROW`.
3. **Seller Acceptance**: Seller has 24 hours to accept order.
   * If accepted $\rightarrow$ Status changes to `SELLER_ACCEPTED`.
   * If rejected or timer expires $\rightarrow$ Status changes to `SELLER_REJECTED` and 100% refund is processed automatically.
4. **Fulfillment**:
   * *Campus Handover*: Seller & Buyer meet at selected Safe Zone. Buyer verifies item and shares 6-digit OTP/QR code with seller. Seller inputs OTP $\rightarrow$ Status set to `DELIVERED_PENDING_INSPECTION`.
   * *Courier Shipping*: Seller attaches tracking number $\rightarrow$ Status set to `FULFILLMENT_IN_PROGRESS`. Webhook updates status to `DELIVERED_PENDING_INSPECTION` upon carrier delivery confirmation.
5. **Inspection Window (48 Hours)**:
   * Buyer has 48 hours to confirm item condition or raise a dispute.
6. **Completion**:
   * Buyer clicks `Confirm Item Received` OR 48h timer expires cleanly $\rightarrow$ Status changes to `COMPLETED`. Escrow funds released to Seller Wallet.

### 6.2 Exception & Edge Case Workflows

* **Buyer Cancellation (Pre-Acceptance)**: Buyer can cancel before seller accepts. Immediate 100% refund.
* **Buyer Cancellation (Post-Acceptance)**: Buyer requests cancellation; seller must approve. If approved, order cancelled and buyer refunded minus processing fee.
* **Seller Cancellation**: Seller cancels order. Buyer automatically refunded 100%. Seller receives cancellation penalty score.
* **Payment Failure**: Transaction fails during checkout. Order remains `PAYMENT_PENDING` for 15 minutes before being discarded; item inventory released back to market.
* **Delivery / Handover Failure**:
  * *No-Show at Safe Zone*: Party flags "No-Show" in app. If seller fails to appear, order cancelled & buyer refunded. If buyer fails to appear, seller can re-schedule or request order cancellation.
  * *Courier Delivery Failed / Returned to Sender*: Order marked `DELIVERY_FAILED`. Support agent investigates; refund issued upon package return verification.
* **Refund Request & Dispute Escalation**:
  * Buyer files dispute during 48h window. Order locked in `DISPUTED`. Support agent reviews evidence photos and chat logs to issue full/partial refund or release funds to seller.

---

## 7. PAYMENT SYSTEM SPECIFICATION

### 7.1 Payment States

| Payment State | Description |
| :--- | :--- |
| `INITIATED` | Checkout session created; payment gateway opened. |
| `AUTHORIZED` | Payment approved by issuer; funds authorized for capture. |
| `CAPTURED_IN_ESCROW` | Funds held securely in platform escrow account. |
| `RELEASED_TO_SELLER` | Escrow funds transferred to seller wallet after order completion. |
| `REFUNDED_FULL` | 100% of order funds returned to buyer payment method. |
| `REFUNDED_PARTIAL` | Agreed partial refund sent to buyer; remaining released to seller. |
| `FAILED` | Payment transaction declined by bank or gateway. |

### 7.2 Financial Breakdown Formula
$$\text{Total Buyer Charge} = \text{Item Listing Price} + \text{Buyer Platform Fee} + \text{Delivery Fee}$$
$$\text{Net Seller Payout} = \text{Item Listing Price} - \text{Seller Platform Commission Fee (5-8\%)}$$
$$\text{Platform Net Revenue} = \text{Buyer Platform Fee} + \text{Seller Platform Commission Fee}$$

---

## 8. DELIVERY & LOGISTICS SYSTEM SPECIFICATION

### 8.1 Delivery Modes

1. **Campus Safe Zone Handover (In-Person)**:
   * Free local fulfillment.
   * Selection of verified static campus safe zone (e.g., Campus Library Entrance, Student Union Foyer).
   * Handover validated by **6-Digit Handover OTP** or **QR Code** scanned by seller on buyer's phone.
2. **Courier Shipping (Standard Delivery)**:
   * Paid fulfillment.
   * Pre-calculated shipping cost added to checkout based on item weight/dimensions.
   * Seller prints pre-formatted shipping label with buyer shipping address.
   * Tracking number update mandatory within 48 hours of order acceptance.

### 8.2 Delivery Status Flow
`PENDING_HANDOVER` $\rightarrow$ `IN_TRANSIT` $\rightarrow$ `DELIVERED_PENDING_INSPECTION` $\rightarrow$ `CONFIRMED_DELIVERED` / `FAILED_DELIVERY`.

---

## 9. REVIEWS, TRUST & SAFETY SPECIFICATION

### 9.1 Double-Blind Review Mechanics
* Post-order completion, both Buyer and Seller receive a prompt to rate each other (1 to 5 stars + tags + comment).
* Ratings remain hidden until BOTH parties submit their review OR 7 days elapse.

### 9.2 Verification Badges
* **Verified Campus Student**: Granted automatically upon `.edu` email confirmation or manual Student ID verification.
* **Verified Commercial Bookstore**: Granted after Admin review of business license and physical address proof.

### 9.3 Content Moderation & Fraud Prevention
* **Automated Keyword Blocker**: Intercepts listings containing forbidden terms (e.g., "stolen", "exam leak", "pdf printout", "test bank").
* **PII Chat Masking**: Real-time regex detection replaces raw email addresses, phone numbers, and off-platform payment tags (Venmo, Zelle, CashApp) with: `[Contact details masked for safety. Complete transaction via Escrow]`.

### 9.4 Dispute Resolution Process
* Disputes must be filed within **48 hours** post-handover.
* Requires evidence selection: Category (Wrong Item, Damaged, Missing Accessories, Counterfeit), Description, and 1 to 4 Photo/Video uploads.
* Escrow frozen during active dispute. Admin makes final binding determination within 48 business hours.

---

## 10. ADMIN FEATURES SPECIFICATION

### 10.1 Admin Dashboard
* High-level metrics: Daily Active Users, Total GMV, Active Escrow Balance, Open Disputes, Pending Verification Requests, Flagged Content Queue.

### 10.2 User Management
* View user directory, filter by role/status (`Active`, `Suspended`, `Banned`).
* View full user history, attached verification documents, order history, and dispute records.
* Actions: Reset password, override email verification, suspend account, permanently ban user.

### 10.3 Seller & Verification Management
* Queue of pending Bookstore business registrations and Student ID uploads.
* One-click action to `Approve Badge` or `Reject Document` (with rejection reason notification).

### 10.4 Product Catalog Management
* Browse all system listings.
* Search by listing ID, title, seller ID, or flag count.
* Actions: `Takedown Listing` (with reason sent to seller), edit category assignment, mark as featured.

### 10.5 Category & Taxonomy Management
* Add, edit, rename, and archive categories, subcategories, and campus course codes.

### 10.6 Order & Payment Monitoring
* Complete audit trail of all transactions and escrow state changes.
* Ability to manually release escrow funds or trigger full/partial refunds in special customer service edge cases.

### 10.7 Dispute Arbitration Center
* Side-by-side comparison view: Buyer dispute statement & photos vs Seller listing description & chat history.
* Resolution actions: `Approve Full Refund to Buyer`, `Approve Partial Refund`, `Release Payout to Seller`.

### 10.8 Platform Settings
* Configure platform commission rates (%), buyer service fee ($), minimum payout withdrawal thresholds, and campus safe zone coordinates.

---

## 11. NOTIFICATIONS MATRIX

| Trigger Event | Target Role | Channels | Message Context |
| :--- | :--- | :--- | :--- |
| **Email Verification** | New User | Email | OTP code for account activation |
| **New Order Placed** | Seller | Push, Email, In-App | "You received a new order for [Item Title]. Accept within 24 hours." |
| **Order Accepted** | Buyer | Push, Email, In-App | "Seller accepted your order! Coordinate meetup in chat." |
| **Order Rejected / Expired**| Buyer | Push, Email, In-App | "Your order for [Item Title] was cancelled. Full refund issued." |
| **New Chat Message** | Buyer / Seller | Push, In-App | "New message from [User Name]: [Snippet]" |
| **Handover OTP Code** | Buyer | In-App, SMS | "Your handover verification OTP is: [123456]" |
| **Order Delivered** | Buyer | Push, Email, In-App | "Item delivered! You have 48 hours to inspect and confirm." |
| **Dispute Filed** | Seller & Admin | Push, Email, In-App | "Buyer opened a dispute on Order #[ID]. Escrow on hold." |
| **Payout Released** | Seller | Push, Email, In-App | "Escrow released! $[Amount] added to your seller wallet." |
| **Price Drop Alert** | Buyer | Push, Email | "[Book Title] on your wishlist dropped in price to $[Price]!" |

---

## 12. MESSAGING SPECIFICATION

### 12.1 Buyer-Seller Real-Time Chat
* In-app 1-on-1 messaging thread initiated directly from a Product Details Page or Order Page.
* **Product Context Header**: Chat UI permanently anchors item thumbnail, title, price, and current order status at the top of the message screen.

### 12.2 Moderation & Safety Features
* **Automated PII Masking**: Real-time sanitization of phone numbers, emails, and external payment links.
* **Report & Block**: Users can report offensive chat behavior or block abusive users directly inside the chat interface.

---

## 13. LOCATION & CAMPUS SPECIFICATION

### 13.1 Campus-Centric Filtering
* Users select their primary campus during onboarding.
* Default market search filters listings to display items available at their campus first.

### 13.2 Campus Safe Zones Registry
* Pre-configured, verified physical locations per university campus stored with Name, Building Code, Address, Latitude/Longitude coordinates, and operating hours.

### 13.3 Distance Calculation
* Displays approximate distance in miles/km between item location and buyer campus using postal code or campus centroid (no live GPS tracking required).

---

## 14. COLLEGE-SPECIFIC MARKETPLACE SPECIFICATION

### 14.1 College Selector & Dedicated Sub-Portals
* Dedicated URL routing (e.g. `/campus/harvard` or `/campus/mit`).
* Tailored landing page highlighting campus specific textbooks, course packs, lab gear, and local secondhand bookstores.

### 14.2 Domain-Driven Verification
* System maps user email domains (e.g. `@college.edu`) to specific university profiles to grant instant verification badges.

---

## 15. FUTURE FEATURES (POST-MVP HORIZON)

> [!NOTE]
> The following features are explicitly designated as **FUTURE (V2 / V3)**. They are **NOT** part of the MVP scope and must not be implemented in the initial release.

1. **`[FUTURE]` Camera-Based ISBN Barcode Scanning**:
   * Browser/App camera stream scanning ISBN barcode to automatically populate title, cover image, author, and publisher via external book APIs.
2. **`[FUTURE]` AI Visual Product Condition Recognition**:
   * Machine learning analysis of uploaded photos to detect highlighting density, page tears, or calculator screen damage.
3. **`[FUTURE]` AI Price Suggestion Engine**:
   * Algorithmic recommendation engine suggesting optimal listing price based on historical campus transaction data.
4. **`[FUTURE]` Student-to-Student Peer Rentals**:
   * Semester-long textbook rental workflow backed by deposit retention.
5. **`[FUTURE]` Platform Guaranteed Buyback Program**:
   * Guaranteed instant platform buyback quotes for popular course materials at semester end.
6. **`[FUTURE]` Campus Smart Locker Integration**:
   * Contactless 24/7 drop-off and pickup via campus locker hardware.

---

## 16. MVP FEATURE PRIORITIZATION MATRIX

Every system feature is classified into a single strict priority tier:
* **`P0`**: Absolute launch requirement. System cannot operate without it.
* **`P1`**: Important post-launch enhancement (High value, immediate V1.1 target).
* **`P2`**: Future long-term enhancement (V2 / V3).

| Feature Module | Specific Feature | Priority |
| :--- | :--- | :---: |
| **Auth & Account** | Email / Password Sign Up & Login | **P0** |
| **Auth & Account** | `.edu` Email Verification & Campus Badge | **P0** |
| **Auth & Account** | Password Reset via Email OTP | **P0** |
| **Auth & Account** | Profile & Settings Management | **P0** |
| **Auth & Account** | Social OAuth (Google Sign-In) | **P1** |
| **Auth & Account** | Commercial Bookstore Manual Onboarding | **P1** |
| **Buyer Features** | Home Feed & Category Navigation | **P0** |
| **Buyer Features** | Product Search (Keyword, Title, ISBN, Course Code) | **P0** |
| **Buyer Features** | Filter & Sorting (Category, Condition, Price, Proximity) | **P0** |
| **Buyer Features** | Product Details Page (PDP) & Condition Breakdown | **P0** |
| **Buyer Features** | Shopping Cart & Checkout System | **P0** |
| **Buyer Features** | Fulfillment Selection (Campus Safe Zone vs Courier Shipping) | **P0** |
| **Buyer Features** | Orders History & Status Tracker | **P0** |
| **Buyer Features** | 48-Hour Return / Dispute Initiation | **P0** |
| **Buyer Features** | Wishlist / Saved Items | **P1** |
| **Buyer Features** | Price Drop Notifications | **P1** |
| **Seller Features** | Seller Dashboard & Active Listing Management | **P0** |
| **Seller Features** | Create Listing (Category, Details, Condition, Photos, Price) | **P0** |
| **Seller Features** | Image Upload (Up to 4 photos) | **P0** |
| **Seller Features** | Order Management (Accept / Reject Order within 24h) | **P0** |
| **Seller Features** | Handover OTP Verification Input / Shipping Label Attachment | **P0** |
| **Seller Features** | Seller Payout Wallet & Bank Withdrawal Request | **P0** |
| **Seller Features** | Earnings Breakdown Calculator | **P1** |
| **Order System** | Escrow Payment Holding State Machine | **P0** |
| **Order System** | 48-Hour Buyer Inspection Window Timer | **P0** |
| **Order System** | Pre-Acceptance Order Cancellation Flow | **P0** |
| **Payment System** | Credit/Debit Card & UPI Payment Integration | **P0** |
| **Payment System** | Escrow Payout Release to Seller | **P0** |
| **Payment System** | Automatic Refund Trigger on Cancellation/Dispute | **P0** |
| **Delivery System** | Campus Safe Zone Handover with 6-Digit OTP | **P0** |
| **Delivery System** | Courier Shipping Label & Tracking Input | **P0** |
| **Reviews & Trust** | Double-Blind Post-Order Ratings & Reviews | **P0** |
| **Reviews & Trust** | PII Chat Masking (Phone/Email/Venmo filtering) | **P0** |
| **Reviews & Trust** | Report Listing / Flag Fraudulent Content | **P0** |
| **Admin Features** | Admin Dashboard & Moderation Queue | **P0** |
| **Admin Features** | User & Seller Ban / Suspension Tools | **P0** |
| **Admin Features** | Dispute Arbitration Portal & Manual Refund/Payout Overrides | **P0** |
| **Admin Features** | Category & Campus Management | **P0** |
| **Admin Features** | Platform Commission Settings | **P1** |
| **Messaging** | Real-Time Buyer-Seller Chat with Item Context Header | **P0** |
| **Notifications** | In-App & Email Transactional Notifications | **P0** |
| **Notifications** | Mobile Push Notifications | **P1** |
| **Future Features** | ISBN Camera Barcode Scanning | **P2** |
| **Future Features** | AI Image Condition Audit | **P2** |
| **Future Features** | AI Price Recommendation Engine | **P2** |
| **Future Features** | P2P Book Rentals & Buyback Program | **P2** |

---

## 17. SYSTEM EDGE CASES & EXPECTED BEHAVIORS

| System Area | Edge Case Scenario | Expected System Behavior |
| :--- | :--- | :--- |
| **Authentication** | User attempts sign up with non-existent `.edu` domain. | Registration proceeds, but user is tagged as `UNVERIFIED_CAMPUS`. A prompt is shown to upload Student ID card for manual Admin review. |
| **Listing** | Seller uploads 4 massive 25MB raw camera photos. | Client-side image canvas automatically downscales images to max 1920x1080 resolution and converts to WebP format before uploading. |
| **Listing** | Seller sets product price to $0.00 or negative value. | System validation rejects submission with error: *"Price must be greater than $0.00."* |
| **Order System** | Seller fails to Accept or Reject order within 24 hours. | Order automatically transitions to `EXPIRED`. 100% refund triggered to buyer. Seller receives account responsiveness warning. |
| **Order System** | Item sells in-person while another buyer has it in cart. | Stock count validation during checkout locks inventory. If quantity is 0, cart displays *"Item no longer available"* and disables payment button. |
| **Handover** | Buyer or Seller does not show up at Campus Safe Zone. | Party present clicks "Report No-Show". System sends urgent push alert to counterpart with 15-min grace timer. If still no-show, order cancels and penalty applies to no-show party. |
| **Handover** | Buyer inputs wrong Handover OTP 3 consecutive times. | Handover verification locks for 15 minutes to prevent brute-forcing. Seller notified via SMS. |
| **Inspection Window** | Buyer does not click 'Confirm' nor file dispute within 48h. | System background job automatically transitions order state to `COMPLETED` and releases escrow payout to seller wallet. |
| **Messaging** | Seller sends phone number or cash app handle in chat. | Regex filter masks raw contact info as `[Masked for Security]` and appends warning link regarding off-platform scam risks. |
| **Dispute** | Buyer files dispute claiming book is missing, but uploads random blank photo. | Admin arbitration portal flags insufficient evidence and requests additional photo proof from buyer within 24 hours before making a decision. |

---

## 18. ACCEPTANCE CRITERIA FOR ALL P0 FEATURES

### 1. Feature: Account Sign Up & Email Verification (`P0`)
* **Acceptance Criteria**:
  * User can enter First Name, Last Name, Email, Password, and select Campus from dropdown.
  * System sends a 6-digit OTP to the entered email address.
  * User entering valid OTP successfully activates account and is redirected to Home Feed.
  * System assigns "Verified Campus Student" badge if email domain ends in `.edu`.
  * Duplicate email addresses are rejected with error: *"Email already registered."*

### 2. Feature: Product Search & Multi-Filter (`P0`)
* **Acceptance Criteria**:
  * User can enter text into search bar; matching titles, authors, ISBNs, and course codes return in search results within 500ms.
  * Applying a condition filter (e.g. `Good`) displays ONLY items with `condition_grade = GOOD`.
  * Applying a price range filter (e.g. $10 - $50) filters out items outside the range.
  * Selecting a Campus filter updates results to show items belonging to the selected campus.

### 3. Feature: Create Product Listing (`P0`)
* **Acceptance Criteria**:
  * Seller can complete mandatory fields: Title, Category, Subcategory, Condition Grade, Condition Notes, Price (> $0.00), and upload at least 1 photo.
  * System requires selecting at least one Fulfillment Method (`Campus Meetup` or `Courier Shipping`).
  * Clicking "Publish" creates an active product listing visible immediately in search results and campus feed.
  * Seller can view, edit, or archive their listing from Seller Dashboard.

### 4. Feature: Cart & Escrow Checkout (`P0`)
* **Acceptance Criteria**:
  * Buyer can add an active item to Cart and proceed to Checkout.
  * Checkout requires choosing Fulfillment Method (Campus Safe Zone location OR Shipping address).
  * Submitting payment authorizes funds and sets order state to `PAID_ESCROW`.
  * Funds are held securely in platform escrow and NOT transferred directly to seller.
  * Seller receives an immediate Push/Email notification of incoming order.

### 5. Feature: Seller Order Acceptance & 24h Expiration (`P0`)
* **Acceptance Criteria**:
  * Seller receives pending order notification with "Accept" and "Reject" options.
  * Clicking "Accept" updates order status to `SELLER_ACCEPTED` and unlocks buyer-seller chat.
  * Clicking "Reject" cancels order and triggers automatic 100% refund to buyer.
  * If seller takes no action within 24 hours, system automatically cancels order and refunds buyer.

### 6. Feature: Campus Safe Zone Handover Verification (`P0`)
* **Acceptance Criteria**:
  * For Campus Meetup orders, buyer is issued a unique 6-digit OTP in their order view.
  * At handover, seller inputs buyer's 6-digit OTP into their seller order screen.
  * Entering correct OTP updates order status to `DELIVERED_PENDING_INSPECTION` and starts the 48-hour inspection timer.

### 7. Feature: 48-Hour Inspection Window & Payout Release (`P0`)
* **Acceptance Criteria**:
  * Upon delivery/handover, buyer has 48 hours to click "Confirm Item Received" or "File Dispute".
  * Clicking "Confirm Item Received" transitions order to `COMPLETED` and releases escrow funds to Seller Wallet.
  * If 48 hours elapse with no dispute, system background worker automatically releases escrow funds to Seller Wallet.

### 8. Feature: Real-Time In-App Messaging (`P0`)
* **Acceptance Criteria**:
  * Buyer can click "Message Seller" on any listing to open a direct chat thread.
  * Chat header permanently displays product thumbnail, title, price, and current order status.
  * Messages sent by either user appear in real-time without requiring manual page refresh.
  * System automatically masks phone numbers, emails, and external payment handles.

### 9. Feature: Admin Dispute Arbitration (`P0`)
* **Acceptance Criteria**:
  * Filing a dispute locks escrow funds and moves order to `DISPUTED` state.
  * Admin can view dispute ticket containing buyer statement, evidence photos, seller description, and chat logs.
  * Admin can click "Refund Buyer" (triggers full refund) OR "Release to Seller" (releases escrow funds).
  * System updates order status and sends resolution notification to both parties.
