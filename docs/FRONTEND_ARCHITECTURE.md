# CampusMarket (Student Secondhand Marketplace)
## Complete Frontend Architecture Specification

---

## 1. FRONTEND ARCHITECTURE OVERVIEW

The CampusMarket frontend application is built on **React 18**, **TypeScript**, **Vite**, **React Router v6**, **Tailwind CSS**, **shadcn/ui primitives**, **TanStack Query v5**, **Zustand v4**, **React Hook Form**, and **Zod**.

The architecture adheres to a **Feature-Sliced Modular Design**, grouping components, state, hooks, types, and API functions by business domain rather than technical type.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        React Router Routes                             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         Layout Components                              │
│         (PublicLayout, BuyerLayout, SellerLayout, AdminLayout)         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          Page Components                               │
│  (MarketplacePage, ProductDetailPage, CartPage, SellerDashboardPage)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         Feature Modules                                │
│       (features/products, features/cart, features/orders, etc.)        │
│  ┌───────────────────────┬──────────────────────┬───────────────────┐  │
│  │  Feature Components   │    Custom Hooks      │   Zod Schemas     │  │
│  └───────────────────────┴──────────────────────┴───────────────────┘  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      State & Data Access Layer                         │
│  ┌───────────────────────┬──────────────────────┬───────────────────┐  │
│  │ TanStack Query Cache  │  Zustand Auth Store  │ Central API Client│  │
│  └───────────────────────┴──────────────────────┴───────────────────┘  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     Shared UI Primitives & Utilities                   │
│           (components/ui [shadcn], lib/utils, hooks/useDebounce)       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. APPLICATION LAYERS & RESPONSIBILITIES

1. **Pages (`/src/pages`)**: Route targets responsible for reading URL parameters, composing feature modules, and handing layout boundaries. Contains zero business logic or raw API calls.
2. **Feature Modules (`/src/features/*`)**: Independent business domains (e.g. `features/marketplace`, `features/checkout`). Contains feature-specific UI components, custom React hooks, validation schemas, and TanStack Query functions.
3. **Shared UI Primitives (`/src/components/ui`)**: Atomic, accessible headless UI primitives built with **shadcn/ui** and Tailwind CSS (Buttons, Inputs, Dialogs, Badges, Tabs, Skeletons, Toasts). Completely decoupled from business data.
4. **State & Data Layer (`/src/lib/api`, `/src/stores`, `/src/hooks`)**: Centralized Axios API client, Zustand global client state stores (Auth, Campus context), and custom reusable utility hooks.

---

## 3. ROUTING & ROUTE PROTECTION ARCHITECTURE

React Router v6 is configured using data routers (`createBrowserRouter`) to support nested layouts, loader boundaries, and authorization guards.

```
/ (Root)
├── Public / Unauthenticated Routes (PublicLayout)
│   ├── /                             -> HomePage
│   ├── /marketplace                  -> MarketplaceCatalogPage
│   ├── /categories                   -> CategoryOverviewPage
│   ├── /categories/:categorySlug     -> CategoryResultsPage
│   ├── /search                       -> SearchResultsPage
│   ├── /products/:productId          -> ProductDetailPage
│   ├── /sellers/:sellerId            -> SellerStorefrontPage
│   └── /auth/*                       -> AuthLayout (Login, Register, Reset)
│
├── Protected Buyer Routes (BuyerLayout + RequireAuth Guard)
│   ├── /buyer/dashboard              -> BuyerDashboardPage
│   ├── /buyer/saved                  -> WishlistPage
│   ├── /cart                         -> CartPage
│   ├── /checkout/fulfillment         -> CheckoutFulfillmentPage
│   ├── /checkout/payment             -> CheckoutPaymentPage
│   ├── /orders/:id/confirmation      -> OrderConfirmationPage
│   ├── /buyer/orders                 -> BuyerOrdersPage
│   ├── /buyer/orders/:id             -> BuyerOrderDetailPage
│   ├── /buyer/orders/:id/dispute     -> DisputeFormPage
│   ├── /messages/*                   -> ChatPage
│   └── /settings                     -> AccountSettingsPage
│
├── Protected Seller Routes (SellerLayout + RequireRole('SELLER') Guard)
│   ├── /seller/dashboard             -> SellerDashboardPage
│   ├── /seller/products              -> SellerInventoryPage
│   ├── /seller/products/new          -> CreateListingPage
│   ├── /seller/products/:id/edit     -> EditListingPage
│   ├── /seller/orders                -> SellerOrdersPage
│   ├── /seller/orders/:id            -> SellerOrderDetailPage (OTP Verification)
│   ├── /seller/earnings              -> SellerWalletPage
│   └── /seller/verification          -> SellerVerificationPage
│
└── Protected Admin Routes (AdminLayout + RequireRole('ADMIN') Guard)
    ├── /admin/dashboard              -> AdminDashboardPage
    ├── /admin/users                  -> AdminUsersPage
    ├── /admin/sellers/verification   -> AdminVerificationQueuePage
    ├── /admin/products               -> AdminModerationPage
    ├── /admin/disputes               -> AdminDisputeQueuePage
    └── /admin/disputes/:id           -> AdminDisputeDetailPage
```

### Route Protection Middleware Guards
* **`RequireAuth` Guard**: Checks `authStore.isAuthenticated`. If false $\rightarrow$ Redirects to `/auth/login?redirect=${currentPath}`.
* **`RequireRole` Guard**: Checks `authStore.user.role`. If user lacks required role $\rightarrow$ Redirects to `/403` Unauthorized error page.
* **`UnauthOnly` Guard**: Prevents authenticated users from accessing `/auth/login` or `/auth/register` $\rightarrow$ Redirects to `/buyer/dashboard`.

---

## 4. LAYOUT ARCHITECTURE

1. **`PublicLayout`**:
   * **Components**: Global Top Header (Logo, Campus Dropdown, Search Bar, Cart Badge, Auth CTAs), Category Sub-nav bar, Footer, Toast Container.
   * **Responsibility**: Provides persistent header & search navigation across public browsing pages.
2. **`BuyerLayout`**:
   * **Components**: Buyer Header, Breadcrumbs, Mobile Bottom Navigation Bar (5 Icons), Toast Container.
   * **Responsibility**: Full-width shell optimized for mobile shopping and rapid checkout.
3. **`SellerLayout`**:
   * **Components**: Seller Topbar (Store Name, Verified Badge, Switch to Buyer mode), Collapsible Desktop Sidebar Menu (Dashboard, Inventory, Orders, Earnings, Settings), Mobile Nav Drawer.
   * **Responsibility**: Analytical workspace optimized for inventory and order management.
4. **`AdminLayout`**:
   * **Components**: Admin Dark Topbar, Persistent Left Admin Sidebar (Users, Moderation, Disputes, Settings), Audit Log Indicator.
   * **Responsibility**: Dense data table and arbitration workspace.

---

## 5. FEATURE MODULE DIRECTORY STRUCTURE

The application frontend is organized into 15 business feature modules under `/src/features/`:

```
src/features/
├── auth/           -> Login, Register, Email OTP, Password Reset, Auth Store
├── marketplace/    -> Catalog Feed, Search Bar, Multi-Filter Sidebar, Sort Selector
├── products/       -> PDP Image Gallery, Condition Card, Listing Form, Photo Dropzone
├── categories/     -> Category Tree, Subcategory Pill Bar
├── cart/           -> Cart Drawer, Cart Line Item, Stock Validation Alert
├── wishlist/       -> Saved Items Grid, Heart Bookmark Button
├── checkout/       -> Fulfillment Selector, Safe Zone Picker, Payment Gateway Embed
├── orders/         -> Order Timeline Tracker, Handover OTP Display, Cancel Dialog
├── delivery/       -> Safe Zone Map Pin, Courier Tracking Card, Seller OTP Input
├── reviews/        -> Double-Blind Star Rating Form, Seller Review List
├── messaging/      -> Chat Thread, PII Masking Banner, Message Input Box
├── notifications/  -> Notifications Drawer, Toast Triggers
├── seller/         -> Seller Metrics Cards, Inventory Table, Wallet Withdrawal Form
├── admin/          -> Moderation Queue, Dispute Arbitration Panel, User Ban Modal
└── colleges/       -> Campus Selector Modal, `.edu` Verification Card
```

---

## 6. COMPONENT ARCHITECTURE & HIERARCHY

Components are strictly categorized into 4 tiers:

### A. UI Primitives (`src/components/ui/`)
Decoupled, reusable headless components built using **shadcn/ui** (Radix UI + Tailwind):
* `Button`, `Input`, `Select`, `Dialog` (Modal), `DropdownMenu`, `Tabs`, `Badge`, `Card`, `Skeleton` (Shimmer Loader), `Toast`, `Tooltip`, `Sheet` (Slide-out Drawer), `Checkbox`, `Table`.

### B. Shared Domain Components (`src/components/common/`)
Cross-feature UI elements containing minor domain awareness:
* `CampusSelectorModal`: Modal allowing user to switch active university campus.
* `ConditionBadge`: Renders color-coded badge (`Brand New`, `Like New`, `Good`, `Fair`, `Acceptable`).
* `PriceDisplay`: Formats currency string with original MSRP cross-out and discount percentage.
* `SellerRatingStars`: Displays 1–5 star rating with total review count.
* `Navbar`, `Footer`, `MobileBottomNav`.

### C. Feature-Specific Components (`src/features/* /components/`)
Domain-specific components bound to business logic:
* `features/products/ProductCard`: Card rendering item thumbnail, title, price, seller badge, distance.
* `features/products/ProductGallery`: Image carousel with lightbox zoom.
* `features/products/ConditionBreakdownCard`: Visual progress bars for highlighting, spine, and access codes.
* `features/checkout/SafeZonePicker`: Interactive dropdown/list of campus safe zones.
* `features/delivery/SellerOtpInput`: 6-digit OTP verification input component with brute-force lock timer.
* `features/messaging/ChatThread`: Chat bubble history anchored with sticky Product Context Header.

---

## 7. STATE MANAGEMENT ARCHITECTURE

State is strictly categorized to prevent unnecessary global re-renders:

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. Local React State (useState, useReducer, React Hook Form)           │
│    - Form inputs, modal open/close, image gallery active tab, dropdowns│
└────────────────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────────────────┐
│ 2. URL State (React Router useSearchParams & useParams)                │
│    - Search term (q), categorySlug, condition[], min/maxPrice, sort, page│
└────────────────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────────────────┐
│ 3. Server State (TanStack Query v5)                                    │
│    - Products, categories, cart items, orders, seller wallet, messages │
└────────────────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────────────────┐
│ 4. Global Client State (Zustand Stores)                                │
│    - Auth session (user, accessToken, role), Active Campus Context,    │
│      Cart Drawer Open/Close toggle, Active Toast alerts                │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 8. DATA FETCHING & TANSTACK QUERY SPECIFICATION

TanStack Query v5 is the single source of truth for all asynchronous server data.

### Query Key Conventions
* `['products', 'search', { q, category, condition, page }]`: Search catalog query.
* `['products', 'detail', productId]`: Single PDP entity query.
* `['cart']`: Buyer shopping cart query.
* `['orders', 'buyer', { status }]`: Buyer orders list query.
* `['orders', 'detail', orderId]`: Order details & OTP status.
* `['seller', 'dashboard']`: Seller metrics & active listings.
* `['messages', conversationId]`: Active chat conversation thread.

### Caching & Stale Time Rules
* **Marketplace Catalog**: `staleTime: 1000 * 60 * 2` (2 minutes).
* **Product Details**: `staleTime: 1000 * 60 * 5` (5 minutes).
* **Cart & Inventory Stock**: `staleTime: 0` (Always revalidate on focus).
* **Conversations & Messages**: `staleTime: 0`, refetched via WebSockets or 3-second polling fallback.

### Optimistic Updates Strategy
* **Wishlist Toggling**: Clicking heart icon optimistically updates query cache `['wishlist']` and heart icon state immediately; rolls back if API call fails.
* **Cart Item Removal**: Item instantly fades out from cart UI while DELETE request fires in background.

---

## 9. CENTRALIZED API CLIENT ARCHITECTURE

The API client is implemented using **Axios** with automatic token injection and response normalization.

```
Client API Request
       │
       ▼
 ┌───────────────────────────────────┐
 │ Request Interceptor               │ (Attaches `Authorization: Bearer <accessToken>`)
 └─────────────────┬─────────────────┘
                   │
                   ▼
 ┌───────────────────────────────────┐
 │ Axios HTTP Execution              │
 └─────────────────┬─────────────────┘
                   │
         ┌─────────┴─────────┐
         │ Response Status   │
         ▼                   ▼
    (200 / 201)         (401 Unauthorized)
         │                   │
         │                   ▼
         │         ┌───────────────────────────────────┐
         │         │ Refresh Token Interceptor         │
         │         │ (Calls `/api/v1/auth/refresh`)    │
         │         └─────────┬─────────────────────────┘
         │                   │
         │          ┌────────┴────────┐
         │          │ Refresh Success │
         │          ▼                 ▼
         │       (Retry Request)   (Refresh Failed)
         │          │                 │
         │          │                 ▼
         │          │       (Clear Auth Store & Redirect to /auth/login)
         ▼          ▼
 ┌───────────────────────────────────┐
 │ Return Standardized Response      │
 └───────────────────────────────────┘
```

---

## 10. FORMS & VALIDATION ARCHITECTURE

Forms are implemented using **React Hook Form** paired with **Zod** schema validation via `@hookform/resolvers/zod`.

### Standardized Form Component Pattern
```
User Form Input -> React Hook Form -> Zod Schema Validation -> API Mutation -> Toast Alert / Redirect
```

### Major Form Schemas (`src/lib/schemas/`)
1. **`loginSchema`**: Validates email format and non-empty password.
2. **`registerSchema`**: Validates `.edu` or standard email, password complexity (min 8 chars, 1 uppercase, 1 symbol), campus selection.
3. **`createListingSchema`**: Validates title (5–100 chars), category, condition grade, condition notes disclosure ($\ge 15$ chars for Fair/Acceptable), price ($> \$0.00$), and at least 1 uploaded photo.
4. **`checkoutFulfillmentSchema`**: Validates Safe Zone selection (if meetup) OR street address, dorm, city, and postal code (if shipping).
5. **`disputeSchema`**: Validates dispute category selection, text explanation ($\ge 20$ chars), and minimum 1 proof photo upload.

---

## 11. FRONTEND AUTHENTICATION & RBAC ARCHITECTURE

### Auth Session Persistence
* `accessToken` stored in memory (Zustand state).
* On app refresh (`main.tsx`), a root loader fires `GET /api/v1/auth/me` using the HTTP-only refresh cookie to re-hydrate `user` profile and `accessToken` seamlessly without user re-login.

### Role-Based Component Guard (`<HasRole>`)
```tsx
// Declarative UI Role Guard Concept
<HasRole requires={['STUDENT_SELLER', 'BOOKSTORE']} fallback={<UpgradeToSellerBanner />}>
  <CreateListingButton />
</HasRole>
```

---

## 12. PERFORMANCE & BUNDLE OPTIMIZATION

1. **Route-Level Code Splitting**: All page routes are lazily loaded using `React.lazy()` and `React.Suspense` to keep initial bundle size $< 150\text{KB}$.
2. **Image Optimization**: Uploaded image previews processed via client-side canvas to WebP format before upload. Images rendered with explicit `width`, `height`, and `loading="lazy"`.
3. **Virtualized Lists**: Long lists (e.g. Admin Users Directory, Notification Inbox) rendered using `@tanstack/react-virtual` to ensure smooth 60fps scrolling.

---

## 13. REUSABLE ERROR & EMPTY STATE PATTERNS

```
┌────────────────────────────────────────────────────────────────────────┐
│                        <QueryErrorResetBoundary>                       │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │                         <ErrorBoundary>                            │ │
│ │ ┌────────────────────────────────────────────────────────────────┐ │ │
│ │ │                     Page Component Content                     │ │ │
│ │ └────────────────────────────────────────────────────────────────┘ │ │
│ └────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

* **Page-Level Error Boundary**: Catches unhandled JS exceptions; displays friendly *"Something went wrong"* card with a "Reload Page" button.
* **Component-Level Query Error**: Renders Inline Retry Banner (*"Failed to load items. [Retry]"*).
* **Empty State Component (`<EmptyState>`)**: Renders centered illustrative vector icon, title, description, and primary CTA button.

---

## 14. PROPOSED REACT FOLDER TREE ARCHITECTURE

```
src/
├── app/                      -> App providers, router setup, global guards
│   ├── App.tsx
│   ├── router.tsx
│   └── providers.tsx         -> QueryClientProvider, ToastProvider
├── assets/                   -> Static images, icons, brand logos
├── components/               -> Shared UI components
│   ├── ui/                   -> shadcn/ui primitives (Button, Input, Dialog, etc.)
│   └── common/               -> Shared domain components (Navbar, Footer, PriceDisplay)
├── features/                 -> Feature-sliced business modules
│   ├── auth/
│   │   ├── components/       -> LoginForm, RegisterForm, OtpModal
│   │   ├── hooks/            -> useAuth, useLogin, useRegister
│   │   ├── schemas/          -> authSchemas.ts
│   │   └── types/            -> auth.types.ts
│   ├── marketplace/
│   │   ├── components/       -> ProductGrid, FilterSidebar, SearchBar
│   │   └── hooks/            -> useMarketplaceSearch
│   ├── products/
│   │   ├── components/       -> ProductGallery, ListingForm, ConditionCard
│   │   └── hooks/            -> useProductDetail, useCreateListing
│   ├── cart/
│   ├── checkout/
│   ├── orders/
│   ├── delivery/
│   ├── seller/
│   ├── admin/
│   └── messaging/
├── hooks/                    -> Global utility hooks (useDebounce, useMediaQuery)
├── layouts/                  -> App layout shells (PublicLayout, SellerLayout, AdminLayout)
├── lib/                      -> External library configs & clients
│   ├── api/                  -> Axios client instance & interceptors
│   ├── utils.ts              -> Tailwind clsx/twMerge helper
│   └── queryClient.ts        -> TanStack Query client config
├── pages/                    -> Route target pages (HomePage, PDPPage, CartPage)
├── stores/                   -> Zustand global client state stores
│   ├── authStore.ts          -> Auth user & token store
│   └── campusStore.ts        -> Selected university campus store
├── types/                    -> Global TypeScript interfaces & API envelopes
└── main.tsx                  -> Application entry point
```

---

## 15. TYPESCRIPT TYPE ARCHITECTURE

All API contracts and UI entities are strictly typed in `/src/types/`:

```typescript
// 1. API Envelope Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    timestamp: string;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// 2. Core Entity Types
export type ConditionGrade = 'BRAND_NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'ACCEPTABLE';
export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'RESERVED' | 'SOLD' | 'ARCHIVED' | 'SUSPENDED';

export interface Product {
  id: string;
  sellerId: string;
  collegeId: string;
  title: string;
  description: string;
  conditionGrade: ConditionGrade;
  conditionNotes: string;
  price: number;
  originalMsrp?: number;
  quantity: number;
  imageUrls: string[];
  status: ProductStatus;
  createdAt: string;
  bookDetails?: BookDetails;
  seller?: SellerSnippet;
}

export interface BookDetails {
  isbn10?: string;
  isbn13?: string;
  author: string;
  publisher?: string;
  edition?: string;
  courseCode?: string;
}
```

---

## 16. ACCESSIBILITY (WCAG 2.1 AA) SPECIFICATION

1. **Focus Management**: Modals (`Dialog`) and Slide-out Drawers (`Sheet`) trap focus using Radix UI primitives. Focus returns to trigger button upon close.
2. **Keyboard Navigation**: All interactive elements (Product Cards, Tabs, Filters) navigable via `Tab`, `Enter`, and `Space`.
3. **Screen Reader Support**: All visual-only icons paired with `sr-only` descriptive text spans. Form fields explicitly tied to labels via `htmlFor` / `id`.
4. **Color Contrast**: All text elements meet minimum 4.5:1 WCAG AA contrast ratios against backgrounds.

---

## 17. FRONTEND SECURITY ARCHITECTURE

1. **XSS Protection**: All user-generated text (product descriptions, reviews, chat messages) rendered safely via React default text escaping. Dangerous HTML rendering (`dangerouslySetInnerHTML`) is strictly banned.
2. **PII Masking Display**: Real-time visual indicator banners display when sensitive contact details are intercepted in chat threads.
3. **Open Redirect Prevention**: Login redirect query parameters (`/auth/login?redirect=...`) validated to ensure relative paths only (preventing external phishing redirects).

---

## 18. MVP FRONTEND PRIORITIZATION MATRIX (P0 / P1 / P2)

| Feature Module / Screen | Priority Tier | Justification / Target |
| :--- | :---: | :--- |
| **Auth** (`LoginForm`, `RegisterForm`, `OtpModal`) | **P0** | Essential account activation & login. |
| **Marketplace** (`CatalogFeed`, `SearchBar`, `FilterSidebar`) | **P0** | Core product discovery. |
| **Products** (`PDPGallery`, `ConditionCard`, `ListingForm`) | **P0** | Item detail & creation. |
| **Cart & Checkout** (`CartDrawer`, `SafeZonePicker`, `PaymentEmbed`) | **P0** | Purchase execution. |
| **Orders** (`TimelineTracker`, `HandoverOTPDisplay`, `DisputeForm`) | **P0** | Order management & escrow protection. |
| **Seller** (`SellerDashboard`, `InventoryTable`, `SellerOtpInput`) | **P0** | Seller order acceptance & handover verification. |
| **Messaging** (`ChatThread`, `PiiMaskingBanner`) | **P0** | Real-time buyer-seller coordination. |
| **Admin** (`ModerationQueue`, `DisputeArbitrationPanel`) | **P0** | Platform operations & dispute resolution. |
| **Wishlist** (`SavedItemsGrid`, `BookmarkButton`) | **P1** | User engagement enhancement. |
| **Reviews** (`StarRatingForm`, `SellerReviewList`) | **P1** | Double-blind review submission. |
| **Admin Analytics** (`MetricsChart`, `CsvExportButton`) | **P1** | Admin analytics dashboard. |
| **Locker Map** (`CampusLockerPicker`) | **P2** | Future hardware integration. |

---

## 19. FINAL ARCHITECTURE MAP

```
                                 REACT ROUTER
                                      │
                                      ▼
                               PAGE COMPONENTS
                                      │
                                      ▼
                              FEATURE MODULES
          (marketplace, products, cart, checkout, orders, seller, admin)
                                      │
              ┌───────────────────────┴───────────────────────┐
              ▼                                               ▼
     FEATURE COMPONENTS                              CUSTOM HOOKS & FORMS
   (ProductCard, SafeZonePicker)                    (useMarketplace, Zod Schemas)
              │                                               │
              └───────────────────────┬───────────────────────┘
                                      │
                                      ▼
                        DATA FETCHING & STATE LAYER
           (TanStack Query Cache + Zustand Auth Store + Axios Client)
                                      │
                                      ▼
                           BACKEND REST API (/api/v1)
```
