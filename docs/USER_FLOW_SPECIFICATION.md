# CampusMarket (Student Secondhand Marketplace)
## Complete User Flow & State Machine Specification

---

## 1. BUYER FLOWS

Each buyer flow follows the standardized step-by-step structure:
`START` $\rightarrow$ `User Action` $\rightarrow$ `System Response` $\rightarrow$ `Next Step` $\rightarrow$ `Decision Points` $\rightarrow$ `Alternative Paths` $\rightarrow$ `SUCCESS STATE` $\rightarrow$ `FAILURE/ERROR STATE`.

---

### Flow 1.A: New User Registration
* **START**: Guest user clicks "Sign Up" on landing page or navigation header.
* **User Action**: Enters First Name, Last Name, Email, Password, and selects primary College Campus. Clicks "Create Account".
* **System Response**: Validates inputs (email format, password strength $\ge 8$ chars, campus selection). Hashes password and generates 6-digit email OTP. Sends activation email.
* **Next Step**: Redirects user to OTP Verification screen.
* **Decision Points**:
  * *Is email domain an `.edu` domain?*
    * **YES**: Tag user account with `CAMPUS_STUDENT_PENDING` badge.
    * **NO**: Tag user account as `STANDARD_GUEST_BUYER`.
* **Alternative Paths**: User signs up via Google OAuth $\rightarrow$ System fetches profile email/avatar $\rightarrow$ Prompts campus selection $\rightarrow$ Auto-activates account.
* **SUCCESS STATE**: User submits valid 6-digit OTP $\rightarrow$ Account activated $\rightarrow$ Auto-logged in $\rightarrow$ Redirected to First-Time Onboarding (Flow 1.C).
* **FAILURE/ERROR STATE**: Duplicate email address $\rightarrow$ Display error message *"An account with this email already exists."* $\rightarrow$ User remains on Sign Up form.

---

### Flow 1.B: User Login
* **START**: Registered user clicks "Log In".
* **User Action**: Enters Email and Password. Optionally checks "Remember Me". Clicks "Log In".
* **System Response**: Verifies credentials against database hash. Checks account status (`ACTIVE`, `SUSPENDED`, `Banned`).
* **Next Step**: Generates JWT Access Token & HTTP-only Refresh Token.
* **Decision Points**:
  * *Is account suspended or banned?*
    * **YES**: Deny login $\rightarrow$ Display ban reason and support contact link.
    * **NO**: Grant session $\rightarrow$ Load user role permissions.
* **Alternative Paths**: User clicks "Forgot Password?" $\rightarrow$ Enters email $\rightarrow$ System triggers Password Reset Flow (1.Z).
* **SUCCESS STATE**: Valid credentials submitted $\rightarrow$ Session established $\rightarrow$ Redirected to user's last visited page or Campus Home Feed.
* **FAILURE/ERROR STATE**: Invalid password or email $\rightarrow$ Display error message *"Invalid email or password."* $\rightarrow$ Password input cleared.

---

### Flow 1.C: First-Time Onboarding
* **START**: Newly registered user completes account activation.
* **User Action**: User confirms/selects primary university campus, selects major/department (optional), and sets default fulfillment preference (Campus Meetup vs Courier Shipping).
* **System Response**: Persists onboarding parameters to user profile record. Sets `onboarding_completed = true`.
* **Next Step**: Loads campus-specific personalized home feed.
* **Decision Points**:
  * *Did user register with `.edu` email?*
    * **YES**: Display "Campus Verified Student" welcome banner.
    * **NO**: Prompt optional Student ID photo upload to unlock student verification.
* **SUCCESS STATE**: Profile updated $\rightarrow$ Guided onboarding tour completed $\rightarrow$ User views active campus listings.
* **FAILURE/ERROR STATE**: Network error saving onboarding data $\rightarrow$ System displays error toast *"Failed to save preferences. Retry."* $\rightarrow$ Data retained in local state.

---

### Flow 1.D: Browse Marketplace
* **START**: User visits homepage or campus marketplace URL.
* **User Action**: Scrolls through curated feeds (Recently Listed, Top Textbook Requirements for Campus, Popular Lab Gear).
* **System Response**: Queries active listings matching user's selected campus ID (`status = ACTIVE` and `quantity > 0`). Render product cards.
* **Next Step**: User clicks any product card to view Product Details Page (PDP).
* **SUCCESS STATE**: Grid of product cards loaded with thumbnail, title, condition badge, price, and distance/campus location.
* **FAILURE/ERROR STATE**: No active listings available on campus $\rightarrow$ Display empty state *"No items currently listed on this campus. Be the first to list!"* with a "Create Listing" CTA.

---

### Flow 1.E: Search for a Product
* **START**: User clicks global search bar.
* **User Action**: Types keyword (e.g. "Organic Chemistry", "TI-84", "CS101", "ISBN 9780134093413").
* **System Response**: Executes full-text search query across `title`, `description`, `author`, `isbn_10`, `isbn_13`, and `course_code` fields.
* **Next Step**: Displays real-time auto-complete dropdown or submits full search results page.
* **SUCCESS STATE**: Search results page renders matching products sorted by Relevance.
* **FAILURE/ERROR STATE**: Zero search matches $\rightarrow$ Display text *"No results found for '[Query]'."* $\rightarrow$ Suggest related broad categories or "Save Search Alert".

---

### Flow 1.F: Filter and Sort Products
* **START**: User is on Search Results or Category page.
* **User Action**: Opens Filter sidebar/modal $\rightarrow$ Checks Category (`Textbooks`), Condition (`Good`, `Like New`), Price range ($10 - $50), and selects Sorting (`Price: Low to High`).
* **System Response**: Re-indexes result set with applied WHERE clauses and ORDER BY parameters.
* **Next Step**: Search view updates dynamically without full page reload.
* **SUCCESS STATE**: Results filtered and re-sorted cleanly according to user criteria.
* **FAILURE/ERROR STATE**: Filters too restrictive (0 results) $\rightarrow$ Display notification *"No items match all selected filters."* $\rightarrow$ Provide "Reset Filters" button.

---

### Flow 1.G: Browse Categories
* **START**: User clicks "Categories" in main navigation menu.
* **User Action**: Selects a parent category (e.g. `Lab & Tech Gear`) $\rightarrow$ Selects a subcategory (e.g. `Calculators`).
* **System Response**: Fetches all active products belonging to the selected `subcategory_id` for the user's active campus.
* **Next Step**: Renders subcategory product page with subcategory breadcrumbs.
* **SUCCESS STATE**: Subcategory items listed cleanly with relevant filter options.
* **FAILURE/ERROR STATE**: Subcategory invalid or archived $\rightarrow$ Redirect to main Category overview with message *"Category unavailable."*

---

### Flow 1.H: View Product Details
* **START**: User clicks a product card from feed, search, or category page.
* **User Action**: Views high-res image carousel, inspects item condition grade, reads seller condition notes, checks seller trust rating, and reviews pickup/shipping options.
* **System Response**: Records view analytics event. Increments product view count. Checks item availability.
* **Next Step**: User chooses to click `Buy Now`, `Add to Cart`, `Message Seller`, or `Save to Wishlist`.
* **Decision Points**:
  * *Is the user the seller of this product?*
    * **YES**: Hide `Buy Now` / `Add to Cart` $\rightarrow$ Display `Edit Listing` button instead.
    * **NO**: Display standard buyer purchase CTAs.
* **SUCCESS STATE**: Full PDP loaded with metadata, seller info badge, and active purchasing buttons.
* **FAILURE/ERROR STATE**: Product sold or deleted while user was navigating $\rightarrow$ Display warning banner *"This item is no longer available."* $\rightarrow$ Disable purchase buttons.

---

### Flow 1.I: View Seller Profile
* **START**: User clicks seller's avatar or name on PDP or search results.
* **User Action**: Scrolls through seller's public storefront view.
* **System Response**: Fetches seller profile, aggregated star rating, verified status badge (`Verified Student` / `Bookstore`), joined date, response rate, customer reviews, and grid of active listings owned by this seller.
* **Next Step**: Buyer can message seller directly or browse seller's other items.
* **SUCCESS STATE**: Seller profile details and active inventory displayed cleanly.
* **FAILURE/ERROR STATE**: Seller profile suspended or deactivated $\rightarrow$ Display banner *"This seller profile is currently unavailable."*

---

### Flow 1.J: Add Product to Wishlist
* **START**: Authenticated buyer clicks heart icon on product card or PDP.
* **User Action**: Clicks "Save / Wishlist".
* **System Response**: Inserts `(user_id, product_id)` record into `wishlists` table. Toggles heart icon to filled state.
* **Next Step**: Product saved to user's personal Wishlist dashboard.
* **SUCCESS STATE**: Success notification *"Item added to your Saved List."*
* **FAILURE/ERROR STATE**: User is unauthenticated (Guest) $\rightarrow$ Display modal *"Please log in to save items to your wishlist."* $\rightarrow$ Redirect to Login.

---

### Flow 1.K: Add Product to Cart
* **START**: Buyer on PDP clicks "Add to Cart".
* **User Action**: Selects desired fulfillment preference if prompt requires, clicks "Add to Cart".
* **System Response**: Checks item stock (`quantity > 0` and `status = ACTIVE`). Adds item to user's cart session.
* **Next Step**: Updates cart item count badge in navigation bar. Displays slide-out cart drawer.
* **SUCCESS STATE**: Item added to cart $\rightarrow$ Drawer opens with "Proceed to Checkout" CTA.
* **FAILURE/ERROR STATE**: Item already in another active user's checkout session / out of stock $\rightarrow$ Display error toast *"Item is currently reserved by another buyer."*

---

### Flow 1.L: Remove Product from Cart
* **START**: Buyer opens Cart drawer or Cart page.
* **User Action**: Clicks "Remove" trash icon next to an item.
* **System Response**: Deletes item record from user cart. Recalculates cart subtotal and platform service fees.
* **Next Step**: Renders updated cart item list.
* **SUCCESS STATE**: Item removed $\rightarrow$ Subtotal updated $\rightarrow$ Cart drawer updates cleanly.
* **FAILURE/ERROR STATE**: Network failure during item removal $\rightarrow$ Display toast *"Failed to update cart. Please refresh."*

---

### Flow 1.M: Checkout Initiation
* **START**: Buyer in Cart clicks "Proceed to Checkout".
* **User Action**: Reviews order items, selects fulfillment mode for each item (`Campus Safe Zone Meetup` OR `Courier Shipping`).
* **System Response**: Validates inventory lock for cart items (locks item for 15 minutes). Calculates fees: Item Price + Buyer Service Fee + Delivery Fee = Total.
* **Next Step**: Advances buyer to Address & Handover Selection screen.
* **SUCCESS STATE**: Checkout session initialized; 15-minute checkout timer started.
* **FAILURE/ERROR STATE**: Item in cart sold during checkout transition $\rightarrow$ Display alert *"Item [Title] was just purchased by another user and removed from your cart."*

---

### Flow 1.N: Add / Select Delivery Address & Handover Point
* **START**: Buyer on Checkout step 2.
* **User Action**:
  * *If Courier Shipping*: Selects existing saved shipping address or inputs new shipping address (Street, Dorm, City, Postal Code).
  * *If Campus Meetup*: Selects preferred pre-verified Campus Safe Zone (e.g. "Main Library Entrance") and selects preferred handover time window.
* **System Response**: Validates address completeness or safe zone selection. Recalculates courier shipping fee if address changes.
* **Next Step**: Advances buyer to Payment Selection step.
* **SUCCESS STATE**: Delivery details locked to checkout session.
* **FAILURE/ERROR STATE**: Invalid shipping address or postal code $\rightarrow$ Display field validation error *"Please enter a valid postal code."*

---

### Flow 1.O: Make Payment
* **START**: Buyer on Checkout step 3 (Payment).
* **User Action**: Selects payment method (Credit/Debit Card, UPI, Apple Pay/Google Pay). Inputs payment details. Clicks "Pay Now $[Total]".
* **System Response**: Initiates secure transaction call to Payment Gateway (Stripe/Razorpay API). Transmits payment authorization token.
* **Next Step**: System awaits synchronous/asynchronous gateway payment response.
* **SUCCESS STATE**: Gateway returns Payment Authorized/Captured $\rightarrow$ Triggers Flow 1.P (Successful Payment).
* **FAILURE/ERROR STATE**: Payment declined $\rightarrow$ Triggers Flow 1.Q (Failed Payment).

---

### Flow 1.P: Successful Payment & Order Confirmation
* **START**: Payment gateway returns successful authorization code.
* **System Response**:
  1. Atomically transitions order status from `PAYMENT_PENDING` to `PAID_ESCROW`.
  2. Holds funds in Platform Escrow ledger account.
  3. Updates product status to `RESERVED` / `SOLD`.
  4. Generates unique Order ID and 6-Digit Handover OTP code (for campus meetups).
  5. Clears item from buyer's cart.
  6. Dispatches real-time push, email, and in-app notifications to Seller and Buyer.
* **Next Step**: Redirects buyer to Order Confirmation Page.
* **SUCCESS STATE**: Order Confirmation page rendered with Order #, receipt breakdown, handover instructions, and "Track Order" button.

---

### Flow 1.Q: Failed Payment
* **START**: Payment gateway returns decline code (e.g., Insufficient funds, 3D-Secure failure, Gateway timeout).
* **System Response**: Leaves order in `PAYMENT_FAILED` state. Releases 15-minute inventory lock so item remains available in marketplace. Does NOT charge buyer.
* **Next Step**: Displays payment failure modal on checkout screen.
* **SUCCESS STATE**: Clear error explanation displayed (e.g., *"Card declined by issuer. Please try a different card."*) with a "Retry Payment" CTA.

---

### Flow 1.R: View Order Details
* **START**: Buyer clicks an order card inside "My Orders" dashboard.
* **User Action**: Views detailed order summary page.
* **System Response**: Displays item thumbnail, title, price, seller snippet, order timeline tracker, fulfillment mode, campus safe zone location / courier tracking URL, handover OTP (if meetup), and action buttons (`Message Seller`, `Cancel Order`, `Confirm Received`, `File Dispute`).
* **SUCCESS STATE**: Order detail view loaded accurately reflecting live status state.
* **FAILURE/ERROR STATE**: Invalid order ID or unauthorized user $\rightarrow$ Redirect to Orders overview with alert *"Order not found."*

---

### Flow 1.S: Track Order Progress
* **START**: Buyer clicks "Track Order" on Order Detail page.
* **User Action**: Views visual milestone progress tracker (`Order Placed` $\rightarrow$ `Seller Accepted` $\rightarrow$ `In-Transit / Meetup Scheduled` $\rightarrow$ `Delivered` $\rightarrow$ `Completed`).
* **System Response**: Fetches live tracking status updates from internal state machine OR external courier tracking API.
* **SUCCESS STATE**: Step-by-step progress tracking displayed with timestamped log events.

---

### Flow 1.T: Cancel Order
* **START**: Buyer clicks "Cancel Order" on Order Details page.
* **User Action**: Selects cancellation reason from dropdown (e.g. "Ordered by mistake", "Seller un-responsive") and confirms cancellation.
* **System Response**:
  * *If Seller has NOT accepted order yet*: Auto-approves cancellation $\rightarrow$ Transitions order status to `CANCELLED_BY_BUYER` $\rightarrow$ Triggers 100% full escrow refund to buyer payment method $\rightarrow$ Restores listing to `ACTIVE`.
  * *If Seller HAS accepted order*: Sends cancellation approval request to seller. If seller accepts $\rightarrow$ Cancelled & refunded. If seller rejects $\rightarrow$ Order proceeds.
* **SUCCESS STATE**: Order status updated to `CANCELLED_BY_BUYER` $\rightarrow$ Refund notification dispatched.
* **FAILURE/ERROR STATE**: Buyer attempts cancellation after item is already shipped/handed over $\rightarrow$ System blocks cancellation *"Item has already been shipped. You can request a return after delivery."*

---

### Flow 1.U: Request Return / Refund
* **START**: Buyer on Order Details page post-delivery within the 48-hour inspection window.
* **User Action**: Clicks "Request Return / Refund". Selects reason (Wrong Item, Item Damaged, Flaws Not Disclosed, Counterfeit), writes description, and uploads 1 to 4 photo/video proofs. Clicks "Submit Request".
* **System Response**: Locks order in `DISPUTED` state. Freezes escrow payout to seller. Sends dispute notification to Seller and Admin team.
* **Next Step**: Initiates Trust & Safety Dispute Resolution Workflow (Flow 8).
* **SUCCESS STATE**: Refund request submitted; order status updated to `DISPUTED`. Dispute tracking screen loaded.
* **FAILURE/ERROR STATE**: Buyer attempts return request after 48-hour inspection window has expired $\rightarrow$ System blocks submission with error *"Return window expired. Orders are auto-completed 48 hours after delivery."*

---

### Flow 1.V: Receive & Confirm Delivered Product
* **START**: Buyer receives item in person at Safe Zone or via Courier.
* **User Action**:
  * *Campus Meetup*: Buyer shows 6-digit OTP code / QR code to seller to scan at handover point.
  * *Courier Shipping*: Buyer receives package and inspects item contents.
  * Buyer opens app and clicks "Confirm Item Received & Satisfied".
* **System Response**:
  * *At Handover OTP scan*: Order status moves to `DELIVERED_PENDING_INSPECTION`. Starts 48-hour timer.
  * *At Buyer Manual Confirmation*: Immediately transitions order status to `COMPLETED`. Releases escrow funds to Seller Wallet.
* **SUCCESS STATE**: Order completed cleanly. Prompts buyer for rating & review.

---

### Flow 1.W: Review Product & Item Quality
* **START**: Buyer completes order or receives review prompt.
* **User Action**: Selects star rating (1 to 5 stars) for item accuracy and adds written review text regarding item condition. Clicks "Submit Review".
* **System Response**: Saves product review record in pending state (Double-blind review system).
* **SUCCESS STATE**: Review recorded cleanly.

---

### Flow 1.X: Review Seller
* **START**: Buyer completes item review screen.
* **User Action**: Rates Seller overall experience (1 to 5 stars), selects positive/negative tags (e.g., "Fast Handover", "Friendly", "Item as Described"), and submits review.
* **System Response**: Stores seller review. Updates seller's aggregated star rating when double-blind criteria met.
* **SUCCESS STATE**: Rating submitted; seller profile updated.

---

### Flow 1.Y: Report Product or Seller
* **START**: Buyer on PDP, Seller Profile, or Chat screen clicks "Report / Flag".
* **User Action**: Selects report reason (Prohibited Item, Fake Listing, Harassment, Fraudulent Pricing) and adds explanation. Clicks "Submit Report".
* **System Response**: Creates moderation ticket in Admin Moderation Queue (Flow 10.8). Sends confirmation to user.
* **SUCCESS STATE**: Confirmation message *"Thank you. Our Trust & Safety team will review this report within 24 hours."*

---

### Flow 1.Z: Manage Profile & Account Settings
* **START**: Authenticated buyer clicks "Account Settings".
* **User Action**: Updates profile picture, display name, phone number, campus location, notification toggles, or changes account password. Clicks "Save Changes".
* **System Response**: Validates inputs, updates user database record, dispatches email confirmation if password/email changed.
* **SUCCESS STATE**: Profile settings saved successfully.

---

## 2. SELLER FLOWS

Each seller flow details: `User Action` $\rightarrow$ `System Behavior` $\rightarrow$ `Validation` $\rightarrow$ `Decision Points` $\rightarrow$ `Success State` $\rightarrow$ `Failure State`.

---

### Flow 2.A: Seller Registration & Onboarding
* **User Action**: Authenticated student user clicks "Start Selling" in menu.
* **System Behavior**: Prompts user to complete Seller Onboarding profile: Phone verification (SMS OTP), payout bank account details, and preferred campus handover safe zones.
* **Validation**: Checks SMS OTP validity, validates bank account routing / UPI ID format.
* **Decision Points**:
  * *Is user registering as an Individual Student or Commercial Bookstore?*
    * **Student**: Complete SMS + Bank setup $\rightarrow$ Instantly grant Student Seller permissions.
    * **Bookstore**: Require business tax ID, physical address proof, store phone $\rightarrow$ Submit for Admin review.
* **Success State**: Account granted `SELLER` privileges; redirected to Seller Dashboard.
* **Failure State**: Phone verification fails $\rightarrow$ Error message *"Invalid SMS OTP code."*

---

### Flow 2.B: Seller Verification (Campus Badge)
* **User Action**: Seller navigates to "Verification" tab and submits `.edu` email or uploads Student ID card photo.
* **System Behavior**: Automated regex validates `.edu` email domain; dispatches OTP. For Student ID photo, creates verification task in Admin queue.
* **Validation**: Image file format (JPG/PNG/WebP, max 10MB).
* **Success State**: Verification approved $\rightarrow$ "Verified Student Seller" badge displayed on seller profile and all listings.
* **Failure State**: Fake ID or unreadable photo $\rightarrow$ Admin rejects request with reason *"Document unreadable. Upload clear Student ID."*

---

### Flow 2.C: Create Product Listing
* **User Action**: Seller clicks "Create Listing" on dashboard.
* **System Behavior**: Renders multi-step listing creation form.
* **Validation**:
  * Title required (5–100 chars).
  * Category & Subcategory required.
  * Condition Grade required (`BRAND_NEW`, `LIKE_NEW`, `GOOD`, `FAIR`, `ACCEPTABLE`).
  * Condition Notes required (disclosure of wear/flaws).
  * Price required (> $0.00).
  * Minimum 1 photo required (Max 4 photos).
  * At least 1 fulfillment option selected (`Campus Meetup` or `Courier Shipping`).
* **Decision Points**:
  * *Does seller enter an ISBN number?*
    * **YES**: Query ISBN database API $\rightarrow$ Auto-populate Title, Author, Publisher, and Cover Image suggestion.
    * **NO**: Manual input mode.
* **Success State**: Listing status set to `ACTIVE` $\rightarrow$ Listing published to campus marketplace.
* **Failure State**: Missing mandatory field $\rightarrow$ Form highlights empty fields with red validation errors.

---

### Flow 2.D: Upload Product Images
* **User Action**: Seller selects or drags-and-drops up to 4 image files into the upload component.
* **System Behavior**: Client-side canvas resizes images to max 1920x1080 resolution, converts to WebP format, and uploads to S3/R2 storage bucket. Returns CDN URLs.
* **Validation**: File type image check (`image/jpeg`, `image/png`, `image/webp`), size check $\le 10\text{MB}$.
* **Success State**: Images rendered in upload preview grid with re-order drag handles.
* **Failure State**: File format invalid or connection drops $\rightarrow$ Display error *"Image upload failed. Please select JPG/PNG files under 10MB."*

---

### Flow 2.E: Set Condition & Mandatory Disclosures
* **User Action**: Seller selects condition tier (`Brand New` to `Acceptable`) and fills out mandatory condition checklist (Highlighting level, Spine/Cover wear, Page damage, Access code status).
* **System Behavior**: Validates condition notes text. Formats condition breakdown card for PDP display.
* **Validation**: If condition is marked `FAIR` or `ACCEPTABLE`, condition notes must be $\ge 15$ characters explaining defects.
* **Success State**: Condition metadata successfully attached to listing object.
* **Failure State**: Condition marked `FAIR` but notes left blank $\rightarrow$ Error message *"Please describe the flaws for items in Fair or Acceptable condition."*

---

### Flow 2.F: Set Price & View Earnings Calculation
* **User Action**: Seller enters asking price in price input field (e.g. `$45.00`).
* **System Behavior**: Dynamic calculator computes real-time fee breakdown:
  $$\text{Listing Price (\$45.00)} - \text{Platform Fee 5\% (\$2.25)} = \text{Estimated Net Payout (\$42.75)}$$
* **Validation**: Price must be greater than `$0.00` and less than `$10,000.00`.
* **Success State**: Price and net payout display confirmed.

---

### Flow 2.G: Publish Listing
* **User Action**: Seller reviews final summary card and clicks "Publish Listing".
* **System Behavior**: Saves listing record to MySQL 8.0+. Indexes listing into search engine (Meilisearch/Elasticsearch). Sets `status = ACTIVE`.
* **Success State**: Success modal *"Listing Published!"* with shareable link and "View Listing" CTA.

---

### Flow 2.H: Edit Listing
* **User Action**: Seller views active listing and clicks "Edit Listing".
* **System Behavior**: Loads listing form pre-filled with existing attributes. Allows updates to price, description, condition notes, and photos.
* **Validation**: Price changes or description edits allowed ONLY if there are no pending/active orders for this listing.
* **Success State**: Listing record updated; search index refreshed.
* **Failure State**: Seller attempts editing an item currently in `PAID_ESCROW` order state $\rightarrow$ Error message *"Cannot edit listing with an active order in progress."*

---

### Flow 2.I: Pause / Deactivate Listing
* **User Action**: Seller toggles listing switch to "Pause / Deactivate".
* **System Behavior**: Updates listing status from `ACTIVE` to `ARCHIVED`. Hides listing from marketplace search and feeds.
* **Success State**: Listing hidden from public catalog; movable back to `ACTIVE` anytime.

---

### Flow 2.J: Delete Listing
* **User Action**: Seller clicks "Delete Listing" and confirms deletion.
* **System Behavior**: Checks active order table. If zero pending orders, executes soft-delete (`status = DELETED`).
* **Success State**: Listing removed permanently from seller dashboard.

---

### Flow 2.K: Receive Incoming Order
* **User Action**: Seller receives real-time Push, Email, and In-App notification: *"New Order Received for [Item Title]!"*
* **System Behavior**: Creates pending order entry (`status = PAID_ESCROW`). Starts 24-hour acceptance timer.
* **Success State**: Order card displays in Seller Dashboard under "Pending Acceptance" tab with a 24-hour countdown timer.

---

### Flow 2.L: Accept or Reject Order
* **User Action**: Seller clicks "Accept Order" OR "Reject Order".
* **System Behavior**:
  * *If Accepted*: Transitions order to `SELLER_ACCEPTED`. Opens buyer-seller chat thread. Prompts seller for handover details.
  * *If Rejected*: Transitions order to `SELLER_REJECTED`. Triggers immediate 100% buyer escrow refund. Restores listing status to `ACTIVE`.
* **Success State**: Order status updated cleanly; buyer notified instantly.
* **Failure State**: 24-hour timer expires without action $\rightarrow$ System auto-cancels order and records un-responsiveness strike on seller profile.

---

### Flow 2.M: Prepare & Coordinate Handover / Shipping
* **User Action**:
  * *Campus Meetup*: Seller opens chat, agrees on time/location at selected Campus Safe Zone with buyer.
  * *Courier Shipping*: Seller downloads & prints pre-formatted shipping label from order page. Packs item securely.
* **System Behavior**: Updates order fulfillment tracking status. Generates shipping manifest if courier mode selected.

---

### Flow 2.N: Complete Handover / Input Tracking
* **User Action**:
  * *Campus Meetup*: Meets buyer at Safe Zone. Asks buyer for 6-digit OTP code. Seller inputs 6-digit OTP into order screen.
  * *Courier Shipping*: Drops package at carrier location. Inputs Carrier Name & Tracking Number into order page.
* **System Behavior**:
  * *OTP Validated*: Order transitions to `DELIVERED_PENDING_INSPECTION`. Starts 48-hour buyer inspection timer.
  * *Tracking Input*: Order transitions to `FULFILLMENT_IN_PROGRESS`.
* **Success State**: Handover verified; inspection timer started.
* **Failure State**: Incorrect OTP entered 3 times $\rightarrow$ Handover input locked for 15 minutes to prevent guessing.

---

### Flow 2.O: Complete Sale & Payout Release
* **User Action**: Buyer confirms receipt OR 48-hour inspection timer expires without dispute.
* **System Behavior**: Order transitions to `COMPLETED`. Escrow system executes payout ledger transaction:
  * Transfers net earnings (`Listing Price` - `Platform Commission`) into Seller's Available Wallet Balance.
* **Success State**: Wallet balance updated; email notification *"Payout Cleared: $[Amount] added to your balance."*

---

### Flow 2.P: Withdraw Earnings to Bank Account
* **User Action**: Seller navigates to Wallet page and clicks "Withdraw Funds". Enters withdrawal amount (min `$5.00`).
* **System Behavior**: Initiates payout transfer via payment gateway (Stripe Connect / Payouts API) to seller's linked bank account / UPI ID.
* **Validation**: Requested amount must be $\le$ Available Wallet Balance.
* **Success State**: Payout transfer initiated; status marked `PROCESSING` (1–2 business days).

---

### Flow 2.Q: Respond to Buyer Dispute / Report
* **User Action**: Seller receives notification of a buyer dispute. Clicks "View Dispute". Reads buyer complaint and photo proof. Selects "Accept Return & Refund" OR "Submit Seller Counter-Evidence" (uploads photo proof of original condition prior to shipping).
* **System Behavior**: Appends seller statement and photos to dispute record for Admin arbitration.
* **Success State**: Response submitted to dispute ticket.

---

## 3. ADMIN FLOWS

Each admin flow covers operational management: `Admin Action` $\rightarrow$ `System Reaction` $\rightarrow$ `Outcome`.

---

### Flow 3.A: Admin Login & Two-Factor Authentication
* **Admin Action**: Admin navigates to `/admin` portal login. Enters admin credentials and 6-digit Authenticator 2FA code.
* **System Reaction**: Verifies admin credentials + TOTP token. Checks RBAC role (`SUPER_ADMIN`, `MODERATOR`, `FINANCE_ADMIN`).
* **Outcome**: Admin session created with full audit logging; redirected to Admin Control Center.

---

### Flow 3.B: View Platform Operations Dashboard
* **Admin Action**: Admin lands on main control dashboard.
* **System Reaction**: Loads real-time metric counters: Daily GMV, Active Users, Listings Published Today, Pending Verification Requests, Open Disputes, Escrow Account Balance.
* **Outcome**: Operational summary displayed with direct links to priority queues.

---

### Flow 3.C: Manage Users & Account Restrictions
* **Admin Action**: Admin searches user directory by Name, Email, `.edu` domain, or User ID. Selects user profile.
* **System Reaction**: Displays full user record, IP audit logs, order history, listing history, rating score, and dispute history.
* **Outcome**: Admin can execute actions: `Reset Password`, `Send Warning Email`, `Suspend Account (7/14/30 Days)`, `Permanently Ban User`.

---

### Flow 3.D: Seller & Verification Approval Queue
* **Admin Action**: Admin opens "Verification Queue". Inspects submitted Student ID card photo OR Commercial Bookstore business license documents against user details.
* **System Reaction**: Renders document preview side-by-side with user registration data.
* **Outcome**: Admin clicks `Approve Verification` (grants Verified Badge) OR `Reject Request` (selects reason e.g. "Illegible Document" and notifies user).

---

### Flow 3.E: Product Catalog & Moderation Queue
* **Admin Action**: Admin opens "Listing Moderation Queue" containing auto-flagged listings (keyword triggers or user reports).
* **System Reaction**: Displays listing photos, title, seller details, description, and flagged trigger reasons.
* **Outcome**: Admin clicks `Approve & Clear Flag` OR `Takedown Listing` (removes from marketplace, sends takedown policy email to seller).

---

### Flow 3.F: Dispute Arbitration Center
* **Admin Action**: Admin opens an active Dispute Ticket (`status = DISPUTED`).
* **System Reaction**: Renders side-by-side evidence view:
  * **Buyer Claim**: Category, text complaint, uploaded defect photos.
  * **Seller Response**: Pre-shipping photo proof, original PDP description, chat log transcript.
  * **Financial Details**: Escrow amount locked.
* **Outcome**: Admin selects binding decision:
  1. `Approve Full Buyer Refund`: Escrow refunded 100% to buyer; seller receives return instructions.
  2. `Approve Partial Refund`: Custom refund amount sent to buyer; balance sent to seller.
  3. `Deny Refund / Release to Seller`: Escrow released 100% to seller wallet.

---

### Flow 3.G: Category & Campus System Configuration
* **Admin Action**: Admin navigates to "Platform Settings".
* **System Reaction**: Displays configurable fields: Categories/Subcategories taxonomy tree, Campus list, Campus Safe Zone GPS coordinates, Platform Commission % rate (e.g. 5%), Buyer Service Fee ($), and Prohibited Keyword list.
* **Outcome**: Admin updates settings $\rightarrow$ Changes take effect across platform instantly.

---

## 4. ORDER LIFECYCLE STATE MACHINE

```
                             +-----------------------------------+
                             |               CART                |
                             +-----------------+-----------------+
                                               |
                                               v
                             +-----------------+-----------------+
                             |             CHECKOUT              |
                             +-----------------+-----------------+
                                               |
                                               v
                             +-----------------+-----------------+
                             |        PAYMENT_PENDING            |
                             +--------+----------------+--------+
                                      |                |
                       (Payment Failed)|                |(Payment Success)
                                      v                v
                             +--------+--------+  +----+----------------+
                             | PAYMENT_FAILED  |  |   PAID_ESCROW       |
                             +-----------------+  +----+----------------+
                                                       |
                                        (Seller Reject /| (Seller Accept
                                         24h Expire)   |   within 24h)
                                                       v
                             +-----------------+  +----+----------------+
                             | CANCELLED /     |  |   SELLER_ACCEPTED   |
                             | REFUNDED        |  +----+----------------+
                             +-----------------+       |
                                                       v
                                                  +----+----------------+
                                                  | FULFILLMENT_IN_    |
                                                  | PROGRESS            |
                                                  +----+----------------+
                                                       |
                                                       |(OTP / Delivery)
                                                       v
                                                  +----+----------------+
                                                  | DELIVERED_PENDING_  |
                                                  | INSPECTION (48h)    |
                                                  +----+--------+-------+
                                                       |        |
                                         (No Dispute / |        |(Dispute
                                          Buyer Confirm)        | Filed)
                                                       v        v
                                                  +----+---+  +-+-------+
                                                  |COMPLE- |  | DISPU-  |
                                                  | TED    |  | TED     |
                                                  +--------+  +----+----+
                                                                   |
                                                                   v
                                                              +----+----+
                                                              | REFUNDED|
                                                              |/RESOLVED|
                                                              +---------+
```

### Complete State Transition Rules

| Initial State | Event / Trigger | Target State | Actor / Condition | Side Effects |
| :--- | :--- | :--- | :--- | :--- |
| `CART` | Buyer initiates checkout | `CHECKOUT` | Buyer | Locks inventory item for 15 minutes. |
| `CHECKOUT` | Payment details submitted | `PAYMENT_PENDING` | Payment Gateway | Session token generated. |
| `PAYMENT_PENDING` | Payment authorized | `PAID_ESCROW` | Payment Webhook | Funds locked in Escrow ledger; inventory marked `RESERVED`. 24h seller timer starts. |
| `PAYMENT_PENDING` | Payment declined | `PAYMENT_FAILED` | Payment Gateway | Inventory unlocked; buyer notified to retry. |
| `PAID_ESCROW` | Seller clicks Accept | `SELLER_ACCEPTED` | Seller (within 24h) | Unlocks real-time chat; prompts handover setup. |
| `PAID_ESCROW` | Seller clicks Reject / 24h timer expires | `CANCELLED_BY_SELLER` | Seller / System Cron | 100% full escrow refund triggered to buyer; listing restored to `ACTIVE`. |
| `SELLER_ACCEPTED` | Seller inputs Courier Tracking # | `FULFILLMENT_IN_PROGRESS` | Seller | Buyer receives tracking number notification. |
| `SELLER_ACCEPTED` | Seller scans OTP at Safe Zone | `DELIVERED_PENDING_INSPECTION` | Seller & Buyer | 48-hour buyer inspection timer begins. |
| `FULFILLMENT_IN_PROGRESS`| Courier confirms package delivery | `DELIVERED_PENDING_INSPECTION` | Carrier Webhook | 48-hour buyer inspection timer begins. |
| `DELIVERED_PENDING_INSPECTION`| Buyer clicks Confirm / 48h timer expires | `COMPLETED` | Buyer / System Cron | Escrow released to Seller Wallet balance; listing marked `SOLD`. |
| `DELIVERED_PENDING_INSPECTION`| Buyer files return/refund | `DISPUTED` | Buyer (within 48h) | Escrow locked; dispute ticket sent to Admin queue. |
| `DISPUTED` | Admin approves buyer refund | `REFUNDED` | Admin arbitration | Escrow refunded to buyer; return label generated. |
| `DISPUTED` | Admin upholds seller sale | `COMPLETED` | Admin arbitration | Escrow released to seller wallet; dispute closed. |

---

## 5. PRODUCT LISTING LIFECYCLE STATE MACHINE

```
  [DRAFT] --> [ACTIVE] --> [RESERVED] --> [SOLD]
                 |            |
                 v            v
            [ARCHIVED]   [SUSPENDED]
```

1. `DRAFT`: Listing saved locally by seller; not visible in public marketplace.
2. `ACTIVE`: Published listing visible in campus search feeds; available for purchase.
3. `RESERVED`: Buyer initiated payment; item locked during checkout/order acceptance.
4. `SOLD`: Order completed successfully; item removed from available inventory.
5. `ARCHIVED`: Seller manually paused or deactivated listing; hidden from search.
6. `SUSPENDED`: Admin removed listing due to policy violation or user report.

---

## 6. PAYMENT & FINANCIAL RECONCILIATION FLOW

### Detailed Transaction Execution Pipeline
1. **Checkout Initiation**: System calculates exact line items:
   $$\text{Buyer Total} = \text{Item Price} + \text{Buyer Fee (\$1.99)} + \text{Delivery Fee}$$
2. **Gateway Authorization**: Stripe/Razorpay holds `$Total` on buyer's card.
3. **Escrow Deposit**: Upon success, transaction recorded in `escrow_ledger` table with status `HELD`. Funds are NOT sent to seller bank account.
4. **Order Completion Trigger**: Upon `COMPLETED` state:
   * System calculates Seller Net:
     $$\text{Seller Net} = \text{Item Price} - (\text{Item Price} \times \text{Commission 5\%})$$
   * System creates ledger entry transferring `Seller Net` to `seller_wallets` table.
   * System records `Platform Commission Revenue`.
5. **Async Handling for Payment Gateway Webhook Edge Cases**:
   * *If Payment succeeds on gateway BUT app database connection drops before order creation*: Payment Webhook listener catches orphaned payment ID $\rightarrow$ Auto-queries transaction token $\rightarrow$ Re-creates order retroactively OR triggers auto-refund if inventory unavailable.

---

## 7. DELIVERY & HANDOVER FLOW

### Mode A: Campus Safe Zone Handover (In-Person)
```
Order Accepted 
   ↓
Chat Coordination (Select Campus Safe Zone & Time)
   ↓
Both Parties Arrive at Safe Zone
   ↓
Buyer Provides 6-Digit OTP / QR Code
   ↓
Seller Enters OTP in App
   ↓
System Validates OTP -> Status: DELIVERED_PENDING_INSPECTION (48h Timer Starts)
```

### Mode B: Courier Shipping
```
Order Accepted 
   ↓
Seller Prints Pre-Formatted Shipping Label
   ↓
Seller Drops Package at Carrier & Enters Tracking Number
   ↓
System Tracks Status: IN_TRANSIT
   ↓
Carrier Delivers Package -> Status: DELIVERED_PENDING_INSPECTION (48h Timer Starts)
```

---

## 8. TRUST & SAFETY WORKFLOWS

1. **Suspicious Listing Detection**:
   * Automated scanner checks new listings for prohibited keywords ("stolen", "exam leak", "pdf copy").
   * Matches price against historical average (e.g. `$500` textbook listed for `$5` triggers price anomaly flag).
   * Flagged items moved to `UNDER_REVIEW` state until Admin approves or rejects.
2. **Fake Seller / Account Impersonation**:
   * Account creating $>3$ listings within 10 minutes without `.edu` verification triggers anti-spam lock.
   * Requires mandatory SMS OTP + Student ID upload before listings publish.
3. **Off-Platform Payment Circumvention**:
   * Real-time chat regex filters phone numbers, emails, and payment handles (`@venmo`, `Zelle`).
   * Displays warning modal: *"Off-platform transactions lose Escrow protection. Stay safe on CampusMarket."*

---

## 9. NOTIFICATIONS MATRIX

| Event | Target Recipient | Channel | Trigger Timing | Primary Action CTA |
| :--- | :--- | :--- | :--- | :--- |
| **New Order** | Seller | Push, Email, In-App | Instant upon payment capture | `Accept Order` / `View Order` |
| **Order Accepted** | Buyer | Push, Email, In-App | Instant upon seller acceptance | `Message Seller` / `View Details` |
| **24h Seller Reminder** | Seller | Push, SMS | 12 hours after order placed | `Respond to Order` |
| **Order Expired/Cancelled**| Buyer | Push, Email | Instant upon 24h timer expiration | `Browse Similar Items` |
| **Handover OTP Code** | Buyer | In-App, SMS | Upon order acceptance | `Show Code to Seller` |
| **Item Delivered** | Buyer | Push, Email | Instant upon OTP scan or carrier delivery | `Inspect & Confirm` |
| **Dispute Filed** | Seller & Admin | Push, Email | Instant upon buyer dispute submission | `View Dispute Evidence` |
| **Payout Cleared** | Seller | Push, Email | Instant upon order completion | `View Wallet` / `Withdraw` |
| **Price Drop Alert** | Buyer | Push, Email | Instant upon seller editing price down | `Buy Now` |

---

## 10. SYSTEM EDGE CASES & DETERMINISTIC BEHAVIORS

1. **Two Buyers Attempt Concurrent Purchase of Single Item**:
   * First buyer submitting payment locks the database row (`SELECT ... FOR UPDATE`).
   * Second buyer receives error message during payment submission: *"This item was just purchased by another user."* Second buyer's cart clears item.
2. **Seller Deletes Listing While Item is in Buyer Cart**:
   * Cart page executes soft validation. Displays badge *"Item no longer available"* and disables Checkout button for that line item.
3. **Seller Fails to Respond Within 24 Hours**:
   * System background worker automatically cancels order at hour 24.
   * 100% refund processed to buyer. Seller receives an automated non-responsiveness strike. 3 strikes suspend seller account.
4. **Buyer Fails to Confirm Receipt or File Dispute Within 48 Hours**:
   * System background worker automatically marks order as `COMPLETED` at hour 48.
   * Escrow funds released to seller wallet automatically.
5. **Buyer Inputs Wrong Handover OTP Code**:
   * System permits up to 3 failed OTP attempts. On 3rd failure, OTP verification locks for 15 minutes to prevent brute-force attempts.
6. **Seller Account Suspended While Having Active Orders**:
   * Existing in-flight orders are frozen in escrow.
   * Admin arbitration team reviews active orders individually: if item already delivered, payout released; if unfulfilled, orders cancelled and buyers fully refunded.

---

## 11. TEXT-BASED FLOW DIAGRAMS

### A. Complete Purchase & Fulfillment Flow

```
   BUYER                                SYSTEM                              SELLER
     │                                    │                                   │
     ├─── Search & Select Item ──────────>│                                   │
     ├─── Add to Cart & Checkout ────────>│ (Locks Inventory 15m)             │
     ├─── Submit Payment Details ────────>│                                   │
     │                                    ├─── Authorize Payment (Escrow) ───>│
     │                                    ├─── Notify Incoming Order ────────>│
     │                                    │                                   ├─── Accept Order (24h)
     │<── Notification: Order Accepted ───┤<── Update Status: SELLER_ACCEPTED ┤
     │                                    │                                   │
     │<====== In-App Chat to Agree on Campus Safe Zone & Time ===============>│
     │                                    │                                   │
     ├─── Meet at Campus Safe Zone ───────┼───────────────────────────────────┤
     ├─── Provide 6-Digit OTP ───────────>│                                   │
     │                                    │<── Enter Buyer OTP ───────────────┤
     │                                    ├─── Validate OTP Match             │
     │<── Status: DELIVERED (48h Timer) ──┼─── Status: DELIVERED (48h Timer) ─>│
     │                                    │                                   │
     ├─── Click "Confirm Item Received" ─>│                                   │
     │                                    ├─── Status: COMPLETED              │
     │                                    ├─── Release Escrow to Wallet ─────>│
     │<── Prompt Rating & Review ─────────┤                                   │
```

---

### B. Dispute Resolution Flow

```
   BUYER                                SYSTEM                              ADMIN
     │                                    │                                   │
     ├─── File Return/Refund (48h) ──────>│                                   │
     │    (Upload Defect Photos)          ├─── Lock Order State: DISPUTED     │
     │                                    ├─── Freeze Escrow Payout           │
     │                                    ├─── Notify Seller & Admin Queue ──>│
     │                                    │                                   │
     │                                    │<── Open Dispute Ticket ───────────┤
     │                                    │<── Review Evidence & Chat Logs ───┤
     │                                    │                                   │
     │                                    │    [ADMIN DECISION]               │
     │                                    │    ├── APPROVE REFUND             │
     │                                    │    │   ├── Refund Escrow to Buyer │
     │<── Notification: Refund Issued ────┤    │   └── Cancel Order           │
     │                                    │    │                              │
     │                                    │    └── UPHOLD SALE                │
     │                                         │   ├── Release Escrow to      │
     │                                         │   │   Seller Wallet          │
     │<── Notification: Sale Upheld ───────────┴───└── Mark Order COMPLETED   │
```

---

## 12. UX PRINCIPLES FOR FUTURE UI DESIGN

1. **Minimum Friction (3-Click Rule)**:
   * A student should be able to go from homepage to completed checkout in 3 steps.
   * Listing an item should take under 60 seconds (accelerated by ISBN auto-fill).
2. **Clear & Immediate System Feedback**:
   * Every user action (Add to Cart, Save Wishlist, OTP Submission) must provide instant visual feedback (Toasts, Spinners, State Badges).
3. **Transparent Trust Signals**:
   * Verified badges (`Verified Student`, `Bookstore`), aggregated rating scores, and explicit condition metrics must be prominent on every product card and detail view.
4. **Safe & Risk-Free Guarantees**:
   * Clear messaging regarding **Escrow Buyer Protection** displayed throughout checkout (*"Funds held safely in escrow until you inspect the item"*).
5. **Mobile-First & Touch Optimized**:
   * Design input fields, image carousels, camera scanner trigger, and OTP inputs specifically for mobile touchscreen viewports.
6. **Zero Ambiguity Error States**:
   * Error messages must explain *what happened* and *how to fix it* (e.g. instead of *"Error 400"*, display *"Card declined. Please check your card number or try a different card"*).
7. **Accessibility Standards (WCAG 2.1 AA)**:
   * Contrast ratios $\ge 4.5:1$, keyboard nav support, accessible ARIA tags for screen readers.
