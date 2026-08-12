# CampusMarket (Student Secondhand Marketplace)
## Complete Page & Screen Architecture Specification

---

## 1. PUBLIC PAGES & DISCOVERY ARCHITECTURE

---

### Page 1.1: Landing / Home Page
* **Route / Path**: `/`
* **User Role**: Guest, Buyer, Seller
* **Purpose**: Primary entrance page introducing platform value proposition, campus selector hero, browse shortcuts, popular course packs, and recent campus listings.
* **Entry Points**: Direct URL, Logo click, Search Engine redirect.
* **Next Navigation**: Marketplace (`/marketplace`), Categories (`/categories`), Product Details (`/products/:id`), Login (`/auth/login`), Sign Up (`/auth/register`).
* **Required Data**: Active campus list, top course categories, 8 recently published listings for user's selected campus, featured campus safe zones, total student savings counter.
* **Main Actions**: Change selected campus, search by keyword/ISBN/course code, click category card, click product card, click "Start Selling".
* **Important States**:
  * *Default*: Shows listings for auto-detected or default selected campus.
  * *Campus Selected*: Re-fetches hero listings for chosen university.
* **Empty States**: If no active listings on chosen campus, display banner *"Be the first student to list textbooks on [Campus Name]!"* with "Create Listing" button.
* **Loading States**: Shimmer skeleton cards for home feed grids.
* **Error States**: Banner notification if campus list or feed fails to load with "Retry" button.
* **Authentication Requirement**: Public (No auth required).
* **Mobile Considerations**: Sticky top search bar, horizontal swipeable carousel for recent listings and categories.

---

### Page 1.2: Marketplace Catalog
* **Route / Path**: `/marketplace`
* **User Role**: Public (All roles)
* **Purpose**: Comprehensive browsable grid of all active marketplace listings with faceted filtering and sorting.
* **Entry Points**: Main navigation bar link, "Browse All" button on home page.
* **Next Navigation**: Product Details (`/products/:id`), Filter drawer, Search results (`/search`).
* **Required Data**: Paginated list of active listings (`status = ACTIVE` and `quantity > 0`), category taxonomy tree, available condition filters, price bounds.
* **Main Actions**: Toggle view mode (Grid vs List), apply/clear filters, change sort option (`Relevance`, `Price Low/High`, `Newest`, `Nearest`), click product card.
* **Important States**: Filter active state (highlighted filter chips).
* **Empty States**: *"No products match your selected filters."* with a "Reset All Filters" CTA.
* **Loading States**: Grid of 12 skeleton card placeholders with shimmer effect.
* **Error States**: *"Unable to fetch marketplace catalog. Please check your connection."*
* **Authentication Requirement**: Public.
* **Mobile Considerations**: Collapsible bottom sheet for Filter & Sort; 2-column touch grid layout.

---

### Page 1.3: Category Overview
* **Route / Path**: `/categories`
* **User Role**: Public
* **Purpose**: Visual directory of all parent categories and subcategories (Textbooks, Lab Equipment, Calculators, Musical Instruments, Art Supplies, Educational Electronics).
* **Entry Points**: Header menu "Categories".
* **Next Navigation**: Category Results (`/categories/:categorySlug`).
* **Required Data**: List of root categories with item counts and thumbnail icons.
* **Main Actions**: Select parent category or subcategory link.
* **Empty States**: N/A (Static taxonomy).
* **Loading States**: Category icon grid skeleton.
* **Error States**: Error toast if taxonomy fails to load.
* **Authentication Requirement**: Public.
* **Mobile Considerations**: 2-column accordion directory with expand/collapse subcategories.

---

### Page 1.4: Category Results Page
* **Route / Path**: `/categories/:categorySlug`
* **User Role**: Public
* **Purpose**: Displays active listings belonging to a specific category or subcategory on the active campus.
* **Entry Points**: Category Overview, Home page category shortcuts, PDP category breadcrumbs.
* **Next Navigation**: Product Details (`/products/:id`), Subcategory filters.
* **Required Data**: Selected category details, subcategories list, matching active products array, pagination metadata.
* **Main Actions**: Filter by subcategory, condition, price, sort listings, click product card.
* **Empty States**: *"No items currently listed in [Category Name] on your campus."*
* **Loading States**: 8-card grid skeleton loader.
* **Error States**: Invalid category slug $\rightarrow$ Render 404 Not Found error.
* **Authentication Requirement**: Public.
* **Mobile Considerations**: Sticky subcategory pill bar at top of screen for horizontal scrolling.

---

### Page 1.5: Search Results Page
* **Route / Path**: `/search`
* **User Role**: Public
* **Purpose**: Displays full-text search results for keyword, book title, author, course code (e.g. `CS101`), or ISBN query.
* **Entry Points**: Search input bar submit across any page.
* **Next Navigation**: Product Details (`/products/:id`), Filter sidebar.
* **Required Data**: Query string `q`, search result products array, filter counts, course metadata if course code searched.
* **Main Actions**: Refine search term, apply multi-filters, re-sort results, click item card.
* **Empty States**: *"No results found for '[Query]'. Check your spelling or try searching by Course Code or ISBN."*
* **Loading States**: Search results skeleton loader.
* **Error States**: Search service timeout $\rightarrow$ *"Search unavailable right now. Try again shortly."*
* **Authentication Requirement**: Public.
* **Mobile Considerations**: Search query persistent in header input field with quick clear ("X") button.

---

### Page 1.6: Product Details Page (PDP)
* **Route / Path**: `/products/:productId`
* **User Role**: Public (Purchasing requires Buyer auth)
* **Purpose**: Complete information view for a single item including photo carousel, condition grade breakdown, seller trust snippet, pickup/shipping options, and action CTAs.
* **Entry Points**: Marketplace, Home feed, Search results, Wishlist, Direct link sharing.
* **Next Navigation**: Cart (`/cart`), Checkout (`/checkout/fulfillment`), Seller Profile (`/sellers/:sellerId`), Message Seller (`/messages/:conversationId`), Login (`/auth/login`).
* **Required Data**: Full product entity, seller profile snippet, ratings summary, available safe zones list, related items array.
* **Main Actions**: View high-res photo carousel, inspect condition breakdown, click `Buy Now`, click `Add to Cart`, click `Message Seller`, click `Save to Wishlist`, click `Share Listing`, click `Report Product`.
* **Important States**:
  * *Seller View*: If user is the item seller, display `Edit Listing` / `Deactivate` buttons instead of purchase CTAs.
  * *Item Sold*: Display `SOLD` banner; disable purchase buttons.
* **Empty States**: N/A.
* **Loading States**: PDP structural skeleton loader (Image box, title line, seller card box).
* **Error States**: Product ID not found or deleted $\rightarrow$ Render 404 screen *"Listing no longer exists."*
* **Authentication Requirement**: Public to view. `Buy Now`, `Add to Cart`, `Message`, and `Wishlist` trigger Auth modal if unauthenticated.
* **Mobile Considerations**: Sticky bottom bar on mobile with `Add to Cart` and `Buy Now` fixed buttons.

---

### Page 1.7: Public Seller Storefront Profile
* **Route / Path**: `/sellers/:sellerId`
* **User Role**: Public
* **Purpose**: Public storefront for a student seller or commercial bookstore showing verified badges, ratings, operating hours (bookstores), and all active listings.
* **Entry Points**: PDP seller card click, order details seller link.
* **Next Navigation**: Product Details (`/products/:id`), Message Seller (`/messages/:conversationId`).
* **Required Data**: Seller user profile, verified status, joined date, aggregated rating score, list of seller's public active products.
* **Main Actions**: Filter seller's listings, message seller, share storefront URL.
* **Empty States**: *"This seller has no active listings."*
* **Loading States**: Storefront header & inventory grid skeleton loader.
* **Error States**: Seller profile suspended or invalid $\rightarrow$ *"Seller profile unavailable."*
* **Authentication Requirement**: Public.
* **Mobile Considerations**: Clean single-column header layout with contact CTA button.

---

### Page 1.8 to 1.12: Static Informational Pages
* **Routes**: `/about`, `/help`, `/terms`, `/privacy`, `/contact`
* **User Role**: Public
* **Purpose**: Provide platform mission, safe zone guides, terms of service, privacy policy, and support contact form.
* **Authentication Requirement**: Public.

---

## 2. AUTHENTICATION & ONBOARDING ARCHITECTURE

| Screen / Flow | Route / Component Type | User Role | Purpose & Behavior |
| :--- | :--- | :--- | :--- |
| **Login** | `/auth/login` (Page & Modal) | Guest | Credentials / OAuth login form. Validates session $\rightarrow$ Redirects to requested page. |
| **Registration** | `/auth/register` (Page & Modal) | Guest | Captures Name, Email, Password, and Campus selection. Triggers Email OTP. |
| **Forgot Password** | `/auth/forgot-password` (Page) | Guest | Accepts registered email $\rightarrow$ Sends password reset link/token. |
| **Reset Password** | `/auth/reset-password` (Page) | Guest | Token validation screen. Accepts new password input. |
| **Email Verification** | `/auth/verify-email` (Page) | Unverified User | 6-digit OTP code entry screen. Activates user account. |
| **Phone Verification** | `/auth/verify-phone` (Modal) | Buyer / Seller | SMS OTP entry modal before first order or listing creation. |
| **First-Time Onboarding**| `/onboarding` (Page Step) | New User | Campus confirmation, default fulfillment choice, and optional Student ID upload. |

---

## 3. BUYER APPLICATION ARCHITECTURE

---

### Page 3.1: Buyer Dashboard
* **Route / Path**: `/buyer/dashboard`
* **User Role**: Authenticated Buyer
* **Purpose**: Buyer command center displaying recent order statuses, active wishlist items, saved campus searches, and account quick links.
* **Entry Points**: User dropdown menu "My Dashboard".
* **Next Navigation**: Buyer Orders (`/buyer/orders`), Saved Items (`/buyer/saved`), Settings (`/settings`).
* **Required Data**: Active orders count, 3 recent orders summary, 4 wishlist items, unread notifications count, verified student badge status.
* **Main Actions**: Click "View All Orders", track active package, access messages.
* **Empty States**: If no recent orders, display *"No active orders. Explore items on your campus!"*
* **Loading States**: Dashboard widget skeleton loaders.
* **Authentication Requirement**: Required (`STUDENT_BUYER`).
* **Mobile Considerations**: Card-based stacked layout.

---

### Page 3.2: Wishlist / Saved Items
* **Route / Path**: `/buyer/saved`
* **User Role**: Authenticated Buyer
* **Purpose**: Displays all items bookmarked by the user with real-time price updates and availability status.
* **Entry Points**: Navigation header heart icon, Buyer Dashboard.
* **Next Navigation**: Product Details (`/products/:id`), Cart (`/cart`).
* **Required Data**: Array of wishlisted products for logged-in user.
* **Main Actions**: Move item to Cart, remove from Wishlist, click product card.
* **Empty States**: *"Your saved list is empty. Click the heart icon on any item to save it for later!"*
* **Loading States**: 6-card grid skeleton.
* **Authentication Requirement**: Required (`STUDENT_BUYER`).

---

### Page 3.3: Shopping Cart Drawer / Page
* **Route / Path**: `/cart` (Slide-out Drawer & Standalone Page)
* **User Role**: Authenticated Buyer
* **Purpose**: Review items selected for purchase, select fulfillment mode per item, view itemized subtotal & platform fees, and proceed to checkout.
* **Entry Points**: Header cart icon, PDP "Add to Cart".
* **Next Navigation**: Checkout (`/checkout/fulfillment`), Marketplace (`/marketplace`).
* **Required Data**: Active cart items array, stock availability validation, fee calculations.
* **Main Actions**: Change quantity, remove item, select fulfillment method (`Campus Meetup` vs `Courier`), click `Proceed to Checkout`.
* **Important States**: Item out of stock (shows warning tag; disables checkout for item).
* **Empty States**: *"Your shopping cart is empty."* with "Start Shopping" CTA button.
* **Loading States**: Cart line item skeleton loader.
* **Authentication Requirement**: Required (`STUDENT_BUYER`).
* **Mobile Considerations**: Bottom-anchored total summary bar with full-width "Checkout" button.

---

### Page 3.4: Checkout - Handover & Address Selection
* **Route / Path**: `/checkout/fulfillment`
* **User Role**: Authenticated Buyer
* **Purpose**: Step 1 of checkout: Select Campus Safe Zone location & time slot (for meetups) OR enter/select delivery shipping address (for courier).
* **Entry Points**: Cart "Proceed to Checkout".
* **Next Navigation**: Checkout Payment (`/checkout/payment`), Cart (`/cart`).
* **Required Data**: Saved user address book, verified campus safe zone dropdown list per item seller campus.
* **Main Actions**: Add new address, select existing address, select safe zone pickup spot, confirm fulfillment details.
* **Loading States**: Form loader & address list skeletons.
* **Error States**: Address validation error $\rightarrow$ *"Please enter a valid postal code."*
* **Authentication Requirement**: Required (`STUDENT_BUYER`).

---

### Page 3.5: Checkout - Payment & Review
* **Route / Path**: `/checkout/payment`
* **User Role**: Authenticated Buyer
* **Purpose**: Step 2 of checkout: Select payment method, view final financial breakdown (Escrow protection note), and submit payment.
* **Entry Points**: Checkout Fulfillment step.
* **Next Navigation**: Order Confirmation (`/orders/:orderId/confirmation`).
* **Required Data**: Order subtotal, platform service fee, delivery fee, grand total, gateway client secret.
* **Main Actions**: Select payment method (Card, UPI, Apple Pay), input payment details, click `Pay Now $[Total]`.
* **Important States**: Payment processing state (button spinner; disables user clicks).
* **Error States**: Payment declined $\rightarrow$ Display error banner with decline reason; remain on payment screen.
* **Authentication Requirement**: Required (`STUDENT_BUYER`).

---

### Page 3.6: Order Confirmation Page
* **Route / Path**: `/orders/:orderId/confirmation`
* **User Role**: Authenticated Buyer
* **Purpose**: Post-payment receipt page displaying Order ID, Escrow security notice, Handover OTP code (for campus meetups), order item summary, and next step instructions.
* **Entry Points**: Successful payment redirect.
* **Next Navigation**: Buyer Orders (`/buyer/orders`), Track Order (`/buyer/orders/:orderId/track`), Messages (`/messages`).
* **Required Data**: Created order entity, payment transaction receipt, 6-digit Handover OTP code, seller contact info.
* **Main Actions**: Copy 6-digit OTP code, click "Message Seller", click "Track Order".
* **Authentication Requirement**: Required (`STUDENT_BUYER`).

---

### Page 3.7: Buyer Orders List
* **Route / Path**: `/buyer/orders`
* **User Role**: Authenticated Buyer
* **Purpose**: Filterable tabbed list of buyer's order history (`All`, `Active`, `Completed`, `Cancelled`, `Disputed`).
* **Entry Points**: Buyer Dashboard, User dropdown menu.
* **Next Navigation**: Order Details (`/buyer/orders/:orderId`).
* **Required Data**: Array of buyer orders with thumbnail, title, status badge, date, total price.
* **Main Actions**: Filter by order status tab, search orders, click order card.
* **Empty States**: *"You have no active orders."*
* **Loading States**: Order list card skeletons.
* **Authentication Requirement**: Required (`STUDENT_BUYER`).

---

### Page 3.8: Buyer Order Details Page
* **Route / Path**: `/buyer/orders/:orderId`
* **User Role**: Authenticated Buyer
* **Purpose**: Full details view for a specific order showing status timeline tracker, item details, receipt breakdown, handover OTP code, seller snippet, courier tracking URL, and order action buttons.
* **Entry Points**: Buyer Orders List, Order Confirmation, Push/Email notification.
* **Next Navigation**: Delivery Tracker (`/buyer/orders/:orderId/track`), Dispute (`/buyer/orders/:orderId/dispute`), Review (`/buyer/orders/:orderId/review`), Chat (`/messages/:conversationId`).
* **Required Data**: Detailed order object, status state machine logs, payment receipt, seller contact, dispute status.
* **Main Actions**: `Message Seller`, `Show Handover OTP`, `Confirm Item Received`, `Cancel Order` (if pending), `Request Return / Dispute` (within 48h), `Write Review` (if completed).
* **Important States**:
  * *Delivered Pending Inspection*: Displays 48-hour countdown timer and `Confirm Item Received` CTA button.
* **Authentication Requirement**: Required (`STUDENT_BUYER`).

---

### Page 3.9: Order Delivery Tracker
* **Route / Path**: `/buyer/orders/:orderId/track`
* **User Role**: Authenticated Buyer
* **Purpose**: Visual step-by-step milestone progress tracker showing real-time updates for courier shipping or campus safe zone meetup status.
* **Entry Points**: Order Details page, Notification links.
* **Next Navigation**: Order Details (`/buyer/orders/:orderId`).
* **Required Data**: Order status logs array, carrier tracking updates, pickup location map coordinates.
* **Authentication Requirement**: Required (`STUDENT_BUYER`).

---

### Page 3.10: File Return / Dispute Form
* **Route / Path**: `/buyer/orders/:orderId/dispute`
* **User Role**: Authenticated Buyer
* **Purpose**: Form to lodge a formal return/refund dispute within the 48-hour post-delivery window by submitting dispute reason, detailed explanation, and photo evidence.
* **Entry Points**: Order Details page "Request Return / Refund" button.
* **Next Navigation**: Order Details (`/buyer/orders/:orderId`).
* **Required Data**: Order object, defect category choices (`Wrong Item`, `Item Damaged`, `Undisclosed Flaws`, `Counterfeit`).
* **Main Actions**: Select reason, enter text explanation, upload 1 to 4 proof images, click `Submit Dispute`.
* **Error States**: Attempting submission after 48h window $\rightarrow$ *"Dispute window expired. Orders are finalized 48 hours post-delivery."*
* **Authentication Requirement**: Required (`STUDENT_BUYER`).

---

### Page 3.11: Write Rating & Review Form
* **Route / Path**: `/buyer/orders/:orderId/review`
* **User Role**: Authenticated Buyer
* **Purpose**: Double-blind review interface allowing buyer to rate item condition accuracy and seller overall experience.
* **Entry Points**: Order Details page post-completion, Review prompt notification.
* **Next Navigation**: Buyer Orders (`/buyer/orders`).
* **Required Data**: Order details, seller name, product title.
* **Main Actions**: Select 1 to 5 star rating for item and seller, select feedback tag chips, enter written comment, click `Submit Review`.
* **Authentication Requirement**: Required (`STUDENT_BUYER`).

---

### Page 3.12: In-App Buyer-Seller Messages
* **Route / Path**: `/messages` & `/messages/:conversationId`
* **User Role**: Authenticated Buyer / Seller
* **Purpose**: Real-time 1-on-1 chat interface anchored with product context header (thumbnail, title, price, order status) and automated PII masking.
* **Entry Points**: PDP "Message Seller", Order Details "Contact Seller", Header chat icon.
* **Next Navigation**: Product Details (`/products/:id`), Order Details (`/buyer/orders/:orderId`).
* **Required Data**: Conversations list array, active thread message history array, attached product metadata header.
* **Main Actions**: Send text message, view attached listing details, report chat user, block contact.
* **Important States**: PII Masked notice banner when email/phone is filtered by system regex.
* **Authentication Requirement**: Required (`STUDENT_BUYER` / `STUDENT_SELLER`).
* **Mobile Considerations**: Full-screen thread view on mobile viewport with fixed text input drawer.

---

### Page 3.13: Buyer Notifications Center
* **Route / Path**: `/notifications`
* **User Role**: Authenticated Buyer / Seller
* **Purpose**: Tabbed notification inbox (`All`, `Orders`, `Messages`, `Promotions`) displaying timestamped transactional alerts.
* **Entry Points**: Navigation header bell icon.
* **Next Navigation**: Target Order page, Chat thread, PDP.
* **Main Actions**: Click notification card (navigates to target resource), mark all as read.
* **Authentication Requirement**: Required.

---

### Page 3.14: Buyer Profile & Address Book
* **Route / Path**: `/buyer/profile`
* **User Role**: Authenticated Buyer
* **Purpose**: Manage buyer public profile avatar, display name, verified campus badge, saved shipping addresses, and default pickup preferences.
* **Authentication Requirement**: Required (`STUDENT_BUYER`).

---

### Page 3.15: Account Security & Notification Settings
* **Route / Path**: `/settings`
* **User Role**: Authenticated User (All Roles)
* **Purpose**: Manage password changes, 2FA security settings, notification channel toggles (Email, Push, SMS), and account deletion request.
* **Authentication Requirement**: Required.

---

## 4. SELLER APPLICATION ARCHITECTURE

---

### Page 4.1: Seller Dashboard
* **Route / Path**: `/seller/dashboard`
* **User Role**: Authenticated Seller (`STUDENT_SELLER` / `COMMERCIAL_BOOKSTORE`)
* **Purpose**: Primary seller cockpit displaying real-time financial metrics, pending orders needing acceptance (with 24h timer), active listings summary, and seller score.
* **Entry Points**: Navigation header "Seller Studio".
* **Next Navigation**: Create Listing (`/seller/products/new`), Seller Products (`/seller/products`), Seller Orders (`/seller/orders`), Earnings (`/seller/earnings`).
* **Required Data**: Total revenue metric, available wallet balance, pending orders array, active listings count, rating score.
* **Main Actions**: Click `Create Listing`, click `Accept Order`, view payout balance.
* **Empty States**: New seller with 0 listings $\rightarrow$ Display onboarding welcome card *"Start selling your textbooks in under 60 seconds!"* with `Create Listing` CTA.
* **Loading States**: Seller metrics skeleton widgets.
* **Authentication Requirement**: Required (`SELLER`).

---

### Page 4.2: Seller Products / Inventory List
* **Route / Path**: `/seller/products`
* **User Role**: Authenticated Seller
* **Purpose**: Manage active, reserved, draft, and archived item listings with quick actions to edit, pause, or delete listings.
* **Entry Points**: Seller Dashboard menu "Inventory".
* **Next Navigation**: Create Listing (`/seller/products/new`), Edit Listing (`/seller/products/:id/edit`).
* **Required Data**: Array of seller's listings with stock counts, views count, price, condition, status badge.
* **Main Actions**: Filter by status (`Active`, `Draft`, `Sold`, `Archived`), pause/resume listing, delete listing, edit price.
* **Empty States**: *"No listings found in this filter."*
* **Loading States**: Inventory table/card skeleton rows.
* **Authentication Requirement**: Required (`SELLER`).

---

### Page 4.3: Create Product Listing Form
* **Route / Path**: `/seller/products/new`
* **User Role**: Authenticated Seller
* **Purpose**: Multi-step or structured form to publish a new secondhand item for sale.
* **Entry Points**: Seller Dashboard, Inventory page, Header "Sell Item" button.
* **Next Navigation**: Seller Products (`/seller/products`), Published Listing PDP (`/products/:id`).
* **Required Data**: Category tree, ISBN lookup API interface, pre-configured campus safe zones list.
* **Main Actions**:
  1. Input ISBN (optional auto-fill trigger).
  2. Input Title, Author, Publisher, Edition, Course Code.
  3. Select Category & Subcategory.
  4. Select Condition Grade & complete Condition Notes disclosure checklist.
  5. Upload 1 to 4 photos (drag-and-drop preview).
  6. Input Price (views dynamic net payout calculator).
  7. Select Fulfillment options (`Campus Meetup` / `Courier Shipping`).
  8. Click `Publish Listing`.
* **Important States**: ISBN Auto-filling state (spinner populating form fields).
* **Error States**: Form validation errors highlighted in red.
* **Authentication Requirement**: Required (`SELLER`).

---

### Page 4.4: Edit Product Listing Form
* **Route / Path**: `/seller/products/:productId/edit`
* **User Role**: Authenticated Seller
* **Purpose**: Update attributes of an existing active listing (price, description, photos, condition notes).
* **Entry Points**: Seller Inventory page "Edit" button, PDP "Edit Listing" button.
* **Next Navigation**: Seller Products (`/seller/products`).
* **Required Data**: Existing product entity attributes.
* **Error States**: Locked state if item has an active pending order $\rightarrow$ *"Cannot edit listing with an active order in progress."*
* **Authentication Requirement**: Required (`SELLER`).

---

### Page 4.5: Seller Orders List
* **Route / Path**: `/seller/orders`
* **User Role**: Authenticated Seller
* **Purpose**: Manage incoming orders across state tabs (`Pending Acceptance`, `Processing/Meetup Scheduled`, `Shipped`, `Completed`, `Disputed`).
* **Entry Points**: Seller Dashboard "Orders" link.
* **Next Navigation**: Seller Order Details (`/seller/orders/:orderId`).
* **Required Data**: Array of incoming seller orders with 24-hour expiration countdown timer badges.
* **Main Actions**: Filter by status tab, click `Accept Order`, click `Reject Order`, view order detail card.
* **Empty States**: *"No orders in this category."*
* **Loading States**: Order list skeleton cards.
* **Authentication Requirement**: Required (`SELLER`).

---

### Page 4.6: Seller Order Details & Handover Screen
* **Route / Path**: `/seller/orders/:orderId`
* **User Role**: Authenticated Seller
* **Purpose**: Manage single order fulfillment: Accept/Reject order within 24h, open chat to coordinate meetup, input buyer's 6-digit OTP code at Safe Zone, OR print shipping label & input courier tracking number.
* **Entry Points**: Seller Orders List, Incoming Order notification.
* **Next Navigation**: Messages (`/messages/:conversationId`), Seller Wallet (`/seller/earnings`).
* **Required Data**: Detailed order object, buyer name/campus, fulfillment mode, 6-digit OTP verification form, courier label generator.
* **Main Actions**: Click `Accept Order` / `Reject Order`, input 6-digit Buyer OTP, enter Courier Tracking # & Carrier Name, print shipping label.
* **Important States**: OTP Input modal with 3-attempt brute-force protection timer.
* **Authentication Requirement**: Required (`SELLER`).

---

### Page 4.7: Seller Wallet & Earnings Page
* **Route / Path**: `/seller/earnings`
* **User Role**: Authenticated Seller
* **Purpose**: Financial statement dashboard showing Available Wallet Balance (cleared escrow), Pending Escrow Balance (in-flight orders), transaction history ledger, and bank payout button.
* **Entry Points**: Seller Dashboard "Earnings".
* **Next Navigation**: Payout Withdrawal (`/seller/earnings/withdraw`).
* **Required Data**: Available balance, pending escrow balance, total lifetime sales, ledger transaction log array.
* **Main Actions**: Click `Withdraw Funds`, download sales statement CSV.
* **Authentication Requirement**: Required (`SELLER`).

---

### Page 4.8: Seller Payout Withdrawal Form
* **Route / Path**: `/seller/earnings/withdraw`
* **User Role**: Authenticated Seller
* **Purpose**: Initiate direct bank transfer or UPI payout of cleared wallet funds.
* **Entry Points**: Seller Wallet page "Withdraw Funds" button.
* **Next Navigation**: Seller Wallet (`/seller/earnings`).
* **Required Data**: Available balance amount, linked bank account / UPI details.
* **Main Actions**: Input withdrawal amount (min $5.00), select payout bank account, click `Confirm Withdrawal`.
* **Error States**: Amount exceeds available balance $\rightarrow$ *"Withdrawal amount exceeds available wallet balance."*
* **Authentication Requirement**: Required (`SELLER`).

---

### Page 4.9: Seller Reviews & Ratings Page
* **Route / Path**: `/seller/reviews`
* **User Role**: Authenticated Seller
* **Purpose**: View all customer ratings and feedback received, with capability to post a one-time public seller response.
* **Authentication Requirement**: Required (`SELLER`).

---

### Page 4.10: Seller Storefront Settings
* **Route / Path**: `/seller/settings`
* **User Role**: Authenticated Seller
* **Purpose**: Customize seller public storefront banner, store description, bookstore operating hours, default pickup safe zones, and linked payout bank account.
* **Authentication Requirement**: Required (`SELLER`).

---

### Page 4.11: Seller Verification Portal
* **Route / Path**: `/seller/verification`
* **User Role**: Authenticated Seller
* **Purpose**: Upload Student ID card photo OR Commercial Bookstore business license documents and track Admin approval status.
* **Authentication Requirement**: Required (`SELLER`).

---

## 5. ADMIN APPLICATION ARCHITECTURE

---

### Page 5.1: Admin Command Dashboard
* **Route / Path**: `/admin/dashboard`
* **User Role**: Authenticated Admin (`SUPER_ADMIN`, `MODERATOR`, `FINANCE_ADMIN`)
* **Purpose**: Control center displaying key platform metrics (Daily GMV, Active Users, Listings Today, Open Disputes, Pending Verifications, Escrow Account Balance) and priority action queues.
* **Entry Points**: Admin Login.
* **Next Navigation**: Admin Users (`/admin/users`), Admin Moderation (`/admin/products`), Admin Disputes (`/admin/disputes`).
* **Authentication Requirement**: Required (`ADMIN`).

---

### Page 5.2: Admin User Management Directory
* **Route / Path**: `/admin/users` & `/admin/users/:userId`
* **User Role**: Authenticated Admin
* **Purpose**: Search, filter, view details, and enforce account actions across all platform users (Buyers, Sellers, Bookstores).
* **Main Actions**: Search by email/name/campus, inspect IP audit logs, `Reset Password`, `Suspend User (7/14/30 Days)`, `Ban User`.
* **Authentication Requirement**: Required (`ADMIN`).

---

### Page 5.3: Admin Seller & Verification Queue
* **Route / Path**: `/admin/sellers/verification`
* **User Role**: Authenticated Admin
* **Purpose**: Review submitted Student ID photos and Bookstore business licenses.
* **Main Actions**: View side-by-side document image, click `Approve Verification Badge`, click `Reject Request` (select reason).
* **Authentication Requirement**: Required (`ADMIN`).

---

### Page 5.4: Admin Product Catalog Moderation Queue
* **Route / Path**: `/admin/products`
* **User Role**: Authenticated Admin
* **Purpose**: Audit auto-flagged listings (keyword triggers or user reports) and execute catalog moderation.
* **Main Actions**: Inspect listing photos/description, click `Approve & Clear Flag`, click `Takedown Listing` (sends policy email to seller).
* **Authentication Requirement**: Required (`ADMIN`).

---

### Page 5.5: Admin Dispute Arbitration Center
* **Route / Path**: `/admin/disputes` & `/admin/disputes/:disputeId`
* **User Role**: Authenticated Admin
* **Purpose**: Arbitrate active buyer return/refund disputes locked in escrow.
* **Main Actions**: Review side-by-side buyer claim & photos vs seller pre-shipping proof & chat logs, click `Approve Full Buyer Refund`, `Approve Partial Refund`, or `Release Payout to Seller`.
* **Authentication Requirement**: Required (`ADMIN`).

---

### Page 5.6 to 5.10: Additional Admin Operational Pages
* **Routes**:
  * `/admin/categories` (Taxonomy & Course Code Manager)
  * `/admin/orders` & `/admin/orders/:orderId` (Order Audit & Escrow Ledger)
  * `/admin/payments` (Escrow Balances & Financial Payout Logs)
  * `/admin/reports` (User Content Reports Queue)
  * `/admin/settings` (Platform Commission %, Fees & Safe Zone Coordinates Config)
  * `/admin/analytics` (Platform Performance Metrics & CSV Exports)
* **Authentication Requirement**: Required (`ADMIN`).

---

## 6. COMPLETE ROUTING ARCHITECTURE TREE

```
/
├── (Public & Discovery)
│   ├── /                             -> Landing / Home Page
│   ├── /marketplace                  -> Marketplace Catalog Grid
│   ├── /categories                   -> Category Overview Directory
│   ├── /categories/:categorySlug     -> Category Results Page
│   ├── /search                       -> Search Results Page
│   ├── /products/:productId          -> Product Details Page (PDP)
│   ├── /sellers/:sellerId            -> Public Seller Storefront Profile
│   ├── /about                        -> About CampusMarket
│   ├── /help                         -> Help & FAQ Center
│   ├── /terms                        -> Terms of Service
│   ├── /privacy                      -> Privacy Policy
│   └── /contact                      -> Contact Support
│
├── /auth (Authentication & Verification)
│   ├── /auth/login                   -> Login (Page / Modal)
│   ├── /auth/register                -> Registration (Page / Modal)
│   ├── /auth/forgot-password         -> Password Reset Request
│   ├── /auth/reset-password          -> Reset Password Form
│   ├── /auth/verify-email            -> Email OTP Verification
│   ├── /auth/verify-phone            -> Phone SMS Verification (Modal)
│   └── /onboarding                   -> First-Time Onboarding Wizard
│
├── /buyer (Buyer Application - Protected)
│   ├── /buyer/dashboard              -> Buyer Control Center
│   ├── /buyer/saved                  -> Wishlist / Saved Items
│   ├── /buyer/orders                 -> Buyer Orders List
│   ├── /buyer/orders/:orderId        -> Buyer Order Details
│   ├── /buyer/orders/:orderId/track  -> Delivery Tracker
│   ├── /buyer/orders/:orderId/dispute-> File Return / Dispute Form
│   ├── /buyer/orders/:orderId/review -> Write Rating & Review Form
│   └── /buyer/profile                -> Buyer Profile & Address Book
│
├── /cart                             -> Cart Page / Drawer
├── /checkout                         -> Checkout Flow (Protected)
│   ├── /checkout/fulfillment         -> Handover & Address Selection
│   └── /checkout/payment             -> Payment & Escrow Review
├── /orders/:orderId/confirmation     -> Order Confirmation Page
│
├── /messages                         -> In-App Chat Index (Protected)
│   └── /messages/:conversationId     -> Direct Chat Thread
├── /notifications                    -> Notifications Inbox (Protected)
├── /settings                         -> Account Security Settings (Protected)
│
├── /seller (Seller Studio - Protected)
│   ├── /seller/dashboard             -> Seller Dashboard
│   ├── /seller/products              -> Seller Inventory List
│   ├── /seller/products/new          -> Create Listing Form
│   ├── /seller/products/:id/edit     -> Edit Listing Form
│   ├── /seller/orders                -> Seller Orders List
│   ├── /seller/orders/:orderId       -> Seller Order Details & Handover OTP
│   ├── /seller/earnings              -> Seller Wallet & Financial Ledger
│   ├── /seller/earnings/withdraw     -> Bank Payout Withdrawal Form
│   ├── /seller/reviews               -> Seller Ratings & Feedback
│   ├── /seller/settings              -> Storefront Settings
│   └── /seller/verification          -> Student ID / Business License Portal
│
└── /admin (Platform Control - Admin Protected)
    ├── /admin/dashboard              -> Operations Command Dashboard
    ├── /admin/users                  -> User Management Directory
    ├── /admin/users/:userId          -> User Detail & Restrictions
    ├── /admin/sellers/verification   -> Seller Verification Queue
    ├── /admin/products               -> Catalog Moderation Queue
    ├── /admin/categories             -> Category & Course Taxonomy Config
    ├── /admin/orders                 -> Order Audit & Escrow Ledger
    ├── /admin/orders/:orderId        -> Admin Order Detail View
    ├── /admin/disputes               -> Dispute Arbitration Center
    ├── /admin/disputes/:disputeId    -> Dispute Arbitration Detail View
    ├── /admin/payments               -> Financial Payouts & Escrow Ledger
    ├── /admin/reports                -> Content Reports Queue
    ├── /admin/reviews                -> Review Moderation
    ├── /admin/settings               -> Platform Settings & Commission Config
    └── /admin/analytics              -> Metrics & CSV Exports
```

---

## 7. NAVIGATION ARCHITECTURE

### A. Desktop Navigation
* **Global Top Navbar**: Brand Logo, Campus Selector Dropdown, Global Search Bar (with category dropdown), Category Links, "Sell Item" primary CTA, Wishlist Heart Icon (with count badge), Cart Icon (with count badge), User Avatar Dropdown (Links to Dashboard, Orders, Settings, Logout).
* **Footer Navigation**: Brand Info, Quick Links (Marketplace, Categories, Campus Safe Zones), Help & Support (FAQ, Contact, Safety Tips), Legal Links (Terms, Privacy), Social Media Icons.

### B. Mobile Navigation
* **Mobile Header**: Brand Logo, Campus Selector Chip, Search Trigger Icon, Cart Icon with badge, Hamburger Menu Trigger.
* **Mobile Bottom Navigation Bar (5 Icons)**:
  1. `Home` (`/`)
  2. `Explore` (`/marketplace`)
  3. `Sell (+)` (`/seller/products/new` - Primary Highlighted Center Button)
  4. `Orders` (`/buyer/orders`)
  5. `Account` (`/buyer/dashboard`)

### C. Contextual & Back Navigation
* **Breadcrumbs**: Rendered on PDP, Category Results, Search Results, and Checkout (`Home` > `Textbooks` > `Organic Chemistry`).
* **Back Buttons**: Sticky top-left back arrow on mobile for PDP, Order Details, Chat Thread, and Checkout steps.

---

## 8. PAGE RELATIONSHIP MAPS

### Flow A: Discovery to Purchase Hierarchy

```
 Landing Page (/)
       ↓
 Marketplace (/marketplace)  OR  Search Results (/search)
       ↓
 Product Details Page (/products/:id)
       ↓
 Cart Drawer (/cart)
       ↓
 Checkout Fulfillment (/checkout/fulfillment)
       ↓
 Checkout Payment (/checkout/payment)
       ↓
 Order Confirmation (/orders/:id/confirmation)
       ↓
 Buyer Order Details (/buyer/orders/:id)
```

---

### Flow B: Seller Listing to Payout Hierarchy

```
 Seller Dashboard (/seller/dashboard)
       ↓
 Create Listing Form (/seller/products/new)
       ↓
 Published PDP (/products/:id)
       ↓
 Incoming Order Notification
       ↓
 Seller Order Details & OTP Handover (/seller/orders/:id)
       ↓
 48h Inspection Completion
       ↓
 Seller Wallet & Earnings (/seller/earnings)
       ↓
 Bank Payout Withdrawal (/seller/earnings/withdraw)
```

---

## 9. GLOBAL SYSTEM REUSABLE STATES

Every page in the application supports standard visual system states:

1. **Loading State**: Rendered via structural CSS Shimmer Skeleton Loaders matching the exact page layout (preventing layout shifts).
2. **Empty State**: Rendered when a list query returns 0 items. Displays illustrative icon, clear message, and primary action CTA button (e.g. *"No saved items yet. Explore Marketplace"*).
3. **Error State**: Rendered on API failure. Displays user-friendly error text + "Retry" button (e.g. *"Unable to load listings. Check your internet connection"*).
4. **Success State**: Rendered post-action via auto-dismissing Toast notification or Confirmation Modal (e.g. *"Listing Published Successfully!"*).
5. **Offline State**: Global top banner displayed when browser detects loss of network connection (*"You are currently offline. Pages may display cached data."*).
6. **Unauthorized State (401)**: Triggered when unauthenticated user clicks protected action $\rightarrow$ Opens Login Modal with return URL redirect parameter.
7. **Not Found State (404)**: Rendered when invalid URL or missing resource ID is accessed $\rightarrow$ Displays *"Page Not Found"* with "Return to Marketplace" CTA.
8. **Permission Denied (403)**: Rendered when user attempts accessing unauthorized role path (e.g. buyer accessing `/admin`) $\rightarrow$ Displays *"Access Denied"* banner.

---

## 10. RESPONSIVE REQUIREMENTS MATRIX

| Major Page / Screen | Desktop View (>= 1024px) | Tablet View (768px - 1023px) | Mobile View (< 768px) |
| :--- | :--- | :--- | :--- |
| **Marketplace Catalog** | 4-Column Card Grid with left sidebar persistent filter panel. | 3-Column Card Grid with collapsible filter drawer. | 2-Column Touch Grid with bottom sheet filter modal. |
| **Product Details (PDP)** | 2-Column layout: Image gallery left (50%), Product metadata & Purchase CTAs right (50%). | 2-Column stacked layout. | Single-column stacked; Image carousel full-width; Sticky bottom bar with `Buy Now` CTA. |
| **Checkout Flow** | 2-Column layout: Address/Payment input left (65%), Sticky Order Summary card right (35%). | Single-column stacked; collapsible Order Summary header. | Single-column wizard steps; Fixed bottom payment CTA button. |
| **Seller Dashboard** | 4-Widget top row (Metrics), 2-Column main area (Orders left, Inventory right). | 2-Widget top row, stacked single-column widgets. | Single-column card stack; Horizontal scrollable metric cards. |
| **In-App Messaging** | 2-Column split screen: Conversation list left (30%), Active chat thread right (70%). | 2-Column split screen. | Single-screen view: Toggle between List View and Thread View with back button. |
| **Admin Dashboard** | Full sidebar navigation + 6-Widget grid + 2 data tables side-by-side. | Collapsible sidebar + 3-Widget grid + stacked tables. | Drawer sidebar + 2-Widget grid + horizontally scrollable data tables. |

---

## 11. MVP SCREEN PRIORITIZATION MATRIX (P0 / P1 / P2)

| Screen Name | Route / Path | Priority Tier | Justification |
| :--- | :--- | :---: | :--- |
| **Landing / Home** | `/` | **P0** | Essential entrance page. |
| **Marketplace Catalog** | `/marketplace` | **P0** | Core product discovery. |
| **Category Results** | `/categories/:categorySlug` | **P0** | Core category browsing. |
| **Search Results** | `/search` | **P0** | Essential search functionality. |
| **Product Details (PDP)** | `/products/:productId` | **P0** | Core decision & purchase page. |
| **Login & Register** | `/auth/login`, `/auth/register` | **P0** | Core account creation. |
| **Email OTP Verification**| `/auth/verify-email` | **P0** | Account activation requirement. |
| **Cart Drawer / Page** | `/cart` | **P0** | Multi-item purchase container. |
| **Checkout Fulfillment** | `/checkout/fulfillment` | **P0** | Address & safe zone selection. |
| **Checkout Payment** | `/checkout/payment` | **P0** | Escrow transaction execution. |
| **Order Confirmation** | `/orders/:id/confirmation` | **P0** | Post-payment receipt & OTP display. |
| **Buyer Orders List** | `/buyer/orders` | **P0** | Order tracking & management. |
| **Buyer Order Details** | `/buyer/orders/:orderId` | **P0** | Detailed order status & OTP view. |
| **File Dispute Form** | `/buyer/orders/:orderId/dispute` | **P0** | Mandatory 48h escrow protection. |
| **Seller Dashboard** | `/seller/dashboard` | **P0** | Seller command center. |
| **Create Listing Form** | `/seller/products/new` | **P0** | Inventory creation requirement. |
| **Seller Products List** | `/seller/products` | **P0** | Listing management & pausing. |
| **Seller Orders List** | `/seller/orders` | **P0** | Order acceptance (24h timer). |
| **Seller Order Details** | `/seller/orders/:orderId` | **P0** | OTP handover verification input. |
| **Seller Wallet & Payout** | `/seller/earnings`, `/withdraw` | **P0** | Earnings & bank payout withdrawal. |
| **In-App Messaging** | `/messages`, `/:id` | **P0** | Buyer-seller coordination. |
| **Admin Dashboard** | `/admin/dashboard` | **P0** | Platform operations. |
| **Admin Moderation** | `/admin/products` | **P0** | Content moderation queue. |
| **Admin Disputes** | `/admin/disputes`, `/:id` | **P0** | Escrow dispute arbitration. |
| **Wishlist / Saved** | `/buyer/saved` | **P1** | User engagement enhancement. |
| **Write Review Form** | `/buyer/orders/:id/review` | **P1** | Reputation engine. |
| **Seller Reviews** | `/seller/reviews` | **P1** | Seller feedback view. |
| **Public Seller Storefront**| `/sellers/:sellerId` | **P1** | Seller profile page. |
| **Admin Analytics** | `/admin/analytics` | **P1** | CSV exports & detailed metrics. |
| **Campus Locker Map** | `/lockers` | **P2** | Future hardware integration. |

---

## 12. SCREEN COUNT BREAKDOWN SUMMARY

| Application Section | Total Screens / Pages | P0 (Launch MVP) | P1 (Post-MVP) | P2 (Future) |
| :--- | :---: | :---: | :---: | :---: |
| **Public & Discovery** | 12 | 7 | 5 | 0 |
| **Authentication & Onboarding** | 7 | 5 | 2 | 0 |
| **Buyer Application** | 15 | 11 | 4 | 0 |
| **Seller Application** | 11 | 8 | 3 | 0 |
| **Admin Application** | 15 | 10 | 5 | 0 |
| **TOTAL PLATFORM SCREENS** | **60** | **41** | **19** | **0** |

* **Total MVP Launch Screens (P0)**: **41 Screens**
* **Total Post-Launch Screens (P1)**: **19 Screens**
* **Grand Total Specified Architecture**: **60 Screens**
