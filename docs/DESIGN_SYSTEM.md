# CampusMarket (Student Secondhand Marketplace)
## Complete Visual Design System & UI/UX Direction

---

## 1. DESIGN PHILOSOPHY

**CampusMarket** is designed as a modern, trustworthy, student-centric secondhand marketplace. The design language strikes a precise balance between **academic clarity** and **modern commerce**, completely rejecting the cluttered, cheap feel of legacy secondhand portals and the generic template aesthetic of standard e-commerce.

```
       ACCESSIBLE & APPROACHABLE
                  ▲
                  │   ★ CampusMarket Visual Identity
                  │   (Clean, Trustworthy, Modern, Intelligent)
                  │
 ◄────────────────┼────────────────► PROFESSIONAL & HIGH-TRUST
 (No Clutter, No  │                  (Escrow Verification, Verified Badges)
 Cheap Aesthetics)│
                  ▼
         STUDENT-FOCUSED & FAST
```

### Core Identity Principles
1. **Trust-First Secondhand Perception**: Secondhand products are presented as reliable, high-value assets. Highlighting and wear are displayed cleanly via standardized visual condition chips (`Brand New` to `Acceptable`) rather than messy warning blocks.
2. **Campus Native, Not Childish**: The interface feels vibrant, intelligent, and tailored for higher education without using childish mascot art or overly saturated cartoon palettes.
3. **Escrow & Verification Prominence**: Physical safety (Campus Safe Zones) and financial security (Escrow holds) are rendered as crisp, reassuring visual badges throughout the buyer journey.
4. **Content-First Hierarchy**: Product imagery, clear typography, and key pricing metrics take absolute priority over decorative backgrounds or gratuitous animations.

---

## 2. VISUAL DIRECTION & LAYOUT PHILOSOPHY

* **Visual Style**: Clean, modern flat design with subtle border structures and low-blur elevation shadows.
* **UI Density**: **Comfortable** for public browsing and product discovery; **Compact/Dense** for seller inventory tables and admin arbitration dashboards.
* **Whitespace Strategy**: Generous 24px–32px section padding on mobile and 48px–64px on desktop to reduce cognitive load during search.
* **Card Usage**: Structured white surface cards with 1px subtle borders (`#E2E8F0`) and smooth 8px radii.
* **Surface Hierarchy**:
  * *Level 0 (Canvas)*: `#F8FAFC` (Light Slate Background).
  * *Level 1 (Card/Surface)*: `#FFFFFF` (Pure White).
  * *Level 2 (Elevated Modal/Popover)*: `#FFFFFF` with 12px shadow elevation.
* **Image Treatment**: Unedited, crisp 4:3 product aspect ratio cards with standardized gray fallbacks (`#F1F5F9`) during loading. Secondhand flaws (scratches, page wear) are shown clearly in gallery thumbnails without fake retouching.

---

## 3. COLOR SYSTEM

The color system is built around **Academic Royal Blue** (Primary Trust), **Campus Emerald** (Success & Payouts), and **Warm Amber** (Inspection Alerts). All color combinations pass **WCAG 2.1 AA (4.5:1 minimum contrast)**.

### A. Light Theme Palette

| Token Name | Color Name | Hex Value | Primary Purpose / Usage | Accessibility Contrast |
| :--- | :--- | :---: | :--- | :---: |
| `color.primary` | Royal Campus Blue | `#2563EB` | Primary CTA buttons, active tabs, links | 4.8:1 on white |
| `color.primary.hover` | Deep Academic Blue | `#1D4ED8` | Primary button hover state | 6.2:1 on white |
| `color.secondary` | Slate Navy | `#0F172A` | Primary headers, dark badges | 15.2:1 on white |
| `color.accent` | Campus Emerald | `#059669` | Success badges, wallet balance, verified student tag | 4.6:1 on white |
| `color.background` | Slate Canvas | `#F8FAFC` | Page body background | Base canvas |
| `color.surface` | Pure White | `#FFFFFF` | Cards, modals, drawers, input fields | Surface 1 |
| `color.surface.elevated`| Soft Slate | `#F1F5F9` | Hover backgrounds, input fills | Surface 2 |
| `color.text.primary` | Deep Charcoal | `#0F172A` | Page titles, product headings, main text | 15.2:1 on surface |
| `color.text.secondary`| Medium Slate | `#475569` | Subtitles, course codes, seller info | 7.1:1 on surface |
| `color.text.muted` | Muted Gray | `#94A3B8` | Captions, placeholder text, timestamps | 4.5:1 on surface |
| `color.border` | Light Border Slate | `#E2E8F0` | Card borders, dividers, input outlines | 1.3:1 UI structural |
| `color.success` | Emerald Green | `#10B981` | Order completed, payment authorized | 4.6:1 on white |
| `color.warning` | Warm Amber | `#D97706` | 24h seller deadline, inspection window timer | 4.5:1 on white |
| `color.error` | Crimson Red | `#DC2626` | Failed payment, dispute alert, destructive actions | 5.2:1 on white |
| `color.info` | Sky Blue | `#0284C7` | Escrow security notices, safe zone tips | 4.7:1 on white |

---

### B. Dark Theme Palette

| Token Name | Color Name | Hex Value | Primary Purpose / Usage |
| :--- | :--- | :---: | :--- |
| `color.primary` | Electric Campus Blue| `#3B82F6` | Primary CTA buttons, active state |
| `color.primary.hover` | Bright Sky Blue | `#60A5FA` | Hover state in dark mode |
| `color.secondary` | Soft Slate | `#E2E8F0` | Dark mode secondary actions |
| `color.accent` | Mint Emerald | `#10B981` | Verified tags, wallet earnings |
| `color.background` | Deep Slate Night | `#0F172A` | Dark mode page background |
| `color.surface` | Dark Slate Card | `#1E293B` | Dark mode card & modal surfaces |
| `color.surface.elevated`| Elevated Slate | `#334155` | Input fills, active popovers |
| `color.text.primary` | Crisp Slate White | `#F8FAFC` | Main headings & titles |
| `color.text.secondary`| Muted Slate White | `#94A3B8` | Subtitles & metadata |
| `color.text.muted` | Dim Gray | `#64748B` | Captions & inactive tabs |
| `color.border` | Dark Border Slate | `#334155` | Card borders & input outlines |
| `color.success` | Mint Green | `#34D399` | Success badges |
| `color.warning` | Bright Amber | `#F59E0B` | Warning alerts |
| `color.error` | Coral Red | `#F87171` | Error banners |
| `color.info` | Sky Blue | `#38BDF8` | Informational callouts |

---

## 4. TYPOGRAPHY SYSTEM

CampusMarket uses **Inter** (or system font stack fallback `-apple-system, BlinkMacSystemFont, "Segoe UI"`) for maximum UI legibility across dense product grids and tables.

```
H1 Display       Inter Bold 32px / 40px (-0.02em)  - Page Headlines, Hero Title
H2 Section       Inter SemiBold 24px / 32px (-0.01em) - Section Headers, Modal Titles
H3 Subsection    Inter SemiBold 18px / 26px (0em)     - Card Titles, Component Headers
H4 Small         Inter Medium 16px / 24px (0em)     - Product Title in Grid
Body Large       Inter Regular 16px / 24px (0em)    - PDP Descriptions, Blog Text
Body Regular     Inter Regular 14px / 20px (0em)    - Standard Body, Inputs, Table Cells
Body Small       Inter Regular 12px / 16px (0em)    - Metadata, Timestamps, Captions
Label            Inter Medium 12px / 16px (0.02em)  - Input Labels, Form Fields
Button Text      Inter SemiBold 14px / 20px (0.01em) - CTA Buttons, Badges
```

---

## 5. SPACING SYSTEM (8pt GRID)

All padding, margin, and gap values derive strictly from an 8pt spatial system (with 4pt half-steps for compact control alignment):

| Token Name | Value | Recommended Usage |
| :--- | :---: | :--- |
| `space.1` | `4px` | Fine adjustments, badge internal padding, icon-to-text gap |
| `space.2` | `8px` | Compact button padding, input gap, chip spacing |
| `space.3` | `12px` | Standard card internal padding (mobile), list gap |
| `space.4` | `16px` | Standard card padding (desktop), form field gap |
| `space.5` | `20px` | Section gaps in cards, modal header padding |
| `space.6` | `24px` | Container margins, table cell padding |
| `space.8` | `32px` | Grid column gap (desktop), section spacing |
| `space.10` | `40px` | Page content margins |
| `space.12` | `48px` | Hero section padding, major layout gaps |
| `space.16` | `64px` | Landing page section margins |

---

## 6. BORDER RADIUS TOKENS

To maintain a crisp, professional aesthetic without looking overly rounded or bubbly:

* `radius.sm`: **`4px`** $\rightarrow$ Badges, tooltips, inline code chips, table tags.
* `radius.md`: **`6px`** $\rightarrow$ Form inputs, select dropdowns, standard buttons.
* `radius.lg`: **`8px`** $\rightarrow$ Product cards, cart drawers, popovers, dropdown menus.
* `radius.xl`: **`12px`** $\rightarrow$ Modals, safe zone picker panels, PDP image gallery.
* `radius.full`: **`9999px`** $\rightarrow$ User avatars, status pills, circular icon buttons.

---

## 7. SHADOW ELEVATION SYSTEM

Shadows are restrained and use low-opacity slate tints (`rgba(15, 23, 42, ...)`):

```
Elevation 0 (Flat):    border: 1px solid #E2E8F0; shadow: none;
Elevation 1 (Card):    shadow: 0px 1px 3px rgba(15, 23, 42, 0.06), 0px 1px 2px rgba(15, 23, 42, 0.04);
Elevation 2 (Dropdown): shadow: 0px 4px 6px -1px rgba(15, 23, 42, 0.08), 0px 2px 4px -1px rgba(15, 23, 42, 0.04);
Elevation 3 (Modal):   shadow: 0px 10px 15px -3px rgba(15, 23, 42, 0.10), 0px 4px 6px -2px rgba(15, 23, 42, 0.05);
```

---

## 8. ICONOGRAPHY SYSTEM

* **Icon Library**: **Lucide React** (Clean 2px stroke, modern geometric style).
* **Sizes**:
  * *Micro / Badge*: `14px` (`strokeWidth={2}`)
  * *Standard Action / Form*: `18px` (`strokeWidth={2}`)
  * *Navigation Bar*: `20px` (`strokeWidth={2}`)
  * *Large Feature Hero*: `32px` (`strokeWidth={1.5}`)

---

## 9. BUTTON SYSTEM SPECIFICATION

```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  Primary Button │ │Secondary Button │ │  Outline Button │ │   Ghost Button  │
│  [Solid Royal]  │ │  [Soft Slate]   │ │ [Border Slate]  │ │  [Transparent]  │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘
```

| Variant | Background | Text Color | Border | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Primary** | `#2563EB` | `#FFFFFF` | None | Main page actions (`Buy Now`, `Publish Listing`, `Pay`) |
| **Secondary** | `#F1F5F9` | `#0F172A` | None | Secondary CTAs (`Add to Cart`, `Filter`, `Message`) |
| **Outline** | `#FFFFFF` | `#0F172A` | `1px solid #E2E8F0` | Cancel buttons, secondary actions |
| **Ghost** | Transparent | `#475569` | None | Icon buttons, tertiary navigation |
| **Destructive**| `#DC2626` | `#FFFFFF` | None | Delete listing, cancel order, ban user |
| **Success** | `#059669` | `#FFFFFF` | None | Confirm receipt, approve dispute refund |

* **Button Sizes**:
  * *Small*: Height `32px`, Padding `0 12px`, Typography `12px SemiBold`.
  * *Medium (Default)*: Height `40px`, Padding `0 16px`, Typography `14px SemiBold`.
  * *Large*: Height `48px`, Padding `0 24px`, Typography `16px SemiBold`.

---

## 10. FORM SYSTEM SPECIFICATION

* **Text Inputs & Selects**:
  * *Default State*: Height `40px`, Background `#FFFFFF`, Border `1px solid #E2E8F0`, Radius `6px`, Text `#0F172A`, Placeholder `#94A3B8`.
  * *Focus State*: Border `#2563EB`, Ring `0 0 0 3px rgba(37, 99, 235, 0.15)`.
  * *Error State*: Border `#DC2626`, Text `#DC2626`, Validation message rendered underneath in `12px Medium #DC2626` with an inline alert icon.
* **Combobox / Course Code Picker**: Searchable select dropdown supporting real-time keyboard filtering.
* **File Dropzone**: Dotted border area (`2px dashed #CBD5E1`), background `#F8FAFC`, hover transition to `#EFF6FF` (Blue tint).

---

## 11. PRODUCT CARD DESIGN HIERARCHY

```
┌─────────────────────────────────────────┐
│ [IMAGE CAROUSEL / COVER PHOTO - 4:3]    │
│ [Heart Icon Top-Right]                  │
│ [Condition Badge Top-Left: "Good"]      │
├─────────────────────────────────────────┤
│ Organic Chemistry (8th Ed)              │ <- H4 Title (Truncate 2 lines)
│ $45.00  MSRP $140.00 (-67%)            │ <- Price & Savings
│ 🎓 Harvard Campus  • 📍 Safe Zone       │ <- Campus & Handover Location
│ ★ 4.9 (24 sales)  [Verified Badge]      │ <- Seller Trust Snippet
└─────────────────────────────────────────┘
```

* **Immediate Visible Information**: Product Cover Image, Condition Grade Badge, Title, Asking Price, Original MSRP Savings %, Campus Name, Seller Rating & Verified Student Badge.
* **Hover / Interaction Response**: Image scales slightly (`scale(1.02)` over 200ms), Card border darkens to `#CBD5E1`, Elevation shadow increases to Level 2.

---

## 12. PRODUCT DETAIL PAGE (PDP) UX HIERARCHY

1. **Top Breadcrumb**: `Home` > `Textbooks` > `Chemistry` > `Organic Chemistry 8th Ed`.
2. **Left Column (55% Desktop Width)**:
   * Main High-Res Image Viewport + Thumbnail Selector Row underneath.
   * **Condition Breakdown Card**: Visual bars showing Highlighting Level, Spine Wear, Access Code Status (`Used/N/A`).
   * Item Description & Seller Flaw Notes.
3. **Right Column (45% Desktop Width - Sticky Sidebar)**:
   * Title, Course Code Tag (`CHEM201`), ISBN Tag (`9780134093413`).
   * Price Header + Calculated Buyer Escrow Fee.
   * **Seller Profile Card**: Avatar, Display Name, Verified Student Badge, Response Time, Total Sales.
   * **Fulfillment Selection**: Toggle between Campus Safe Zone Meetup (shows nearest safe zone list) and Courier Shipping.
   * **Primary Actions**: Full-width `Buy Now` (Primary Blue) and `Add to Cart` (Secondary) buttons.
   * **Trust Callout Box**: *"🔒 Escrow Protection: Funds held safely until you inspect the item within 48 hours."*

---

## 13. SEARCH & MARKETPLACE LAYOUT UX

```
+------------------------------------------------------------------------+
|  [Search Bar: "Search by title, ISBN or course code (e.g. CS101)"]     |
+------------------------------------------------------------------------+
| FILTERS (Left Sidebar 250px)    |  PRODUCTS GRID (3 Columns Desktop)   |
| ── Category Taxonomy            |  Sort: [Relevance v]  Showing 42 items|
| ── Condition Grade (Checkboxes) |  ┌────────┐  ┌────────┐  ┌────────┐  |
| ── Price Slider ($0 - $200)     |  │ Card 1 │  │ Card 2 │  │ Card 3 │  |
| ── Fulfillment Mode             |  └────────┘  └────────┘  └────────┘  |
| ── Campus Radius                |  ┌────────┐  ┌────────┐  ┌────────┐  |
| [Reset Filters]                 |  │ Card 4 │  │ Card 5 │  │ Card 6 │  |
+---------------------------------+--------------------------------------+
```

* **Mobile Adaptability**: Filter panel collapses into a bottom sheet drawer triggered by a sticky "Filters (3)" pill button at the bottom center of the screen.

---

## 14. ORDER TRACKING UX & TIMELINE ENGINE

```
[Order Placed] ──> [Paid / Escrow] ──> [Seller Accepted] ──> [Meetup / Shipped] ──> [Delivered] ──> [Completed]
   (Green)            (Green)            (Green)                (Active Pulse)        (Gray)          (Gray)
```

* **Active Progress Bar**: Visual node timeline showing completed steps in Emerald Green, active step in Pulsing Blue, and pending steps in Light Gray.
* **Campus Meetup Card**: Displays large 6-Digit OTP (`123 456`) in bold 24px monospace text with a "Show QR Code" toggle button.
* **48-Hour Inspection Banner**: Displayed post-delivery with a dynamic countdown timer (*"Inspection Window Ends in: 34h 12m"*). Includes direct CTAs `Confirm Received & Satisfied` and `File Return Request`.

---

## 15. REUSABLE EMPTY & LOADING PATTERNS

### A. Skeleton Loading Patterns
* **Product Card Skeleton**: Rectangular image box (`bg-slate-200 animate-pulse`), title line, price line, avatar circle.
* **Table Skeleton**: 5 shimmer rows matching table column widths.

### B. Empty State Pattern (`<EmptyState>`)
* Centered vector icon (`64px` slate icon in `#F1F5F9` circular container).
* Heading (`H3 Inter SemiBold #0F172A`).
* Supporting text (`Body Regular #475569`).
* Action CTA button (e.g., `Explore Marketplace` or `Clear Search Filters`).

---

## 16. RESTRAINED MOTION & ANIMATION SYSTEM

Animation is strictly functional to provide visual feedback without impeding performance:

* **Durations**:
  * *Fast (Hover/Focus)*: **`150ms`** (`cubic-bezier(0.4, 0, 0.2, 1)`).
  * *Medium (Dropdowns/Toasts)*: **`200ms`** (`cubic-bezier(0, 0, 0.2, 1)`).
  * *Slow (Modal/Drawer Transitions)*: **`250ms`** (`cubic-bezier(0, 0, 0.2, 1)`).
* **Page Transitions**: Simple fade-in (`opacity: 0 -> 1` over 150ms).
* **Accessibility**: All CSS transitions wrapped in `@media (prefers-reduced-motion: reduce)` to disable motion for sensitive users.

---

## 17. COMPLETE DESIGN TOKEN SPECIFICATION

```json
{
  "token": {
    "color": {
      "primary": { "default": "#2563EB", "hover": "#1D4ED8", "dark": "#3B82F6" },
      "secondary": { "default": "#0F172A", "dark": "#E2E8F0" },
      "accent": { "default": "#059669", "dark": "#10B981" },
      "background": { "light": "#F8FAFC", "dark": "#0F172A" },
      "surface": { "light": "#FFFFFF", "dark": "#1E293B" },
      "border": { "light": "#E2E8F0", "dark": "#334155" },
      "text": { "primary": "#0F172A", "secondary": "#475569", "muted": "#94A3B8" }
    },
    "fontFamily": {
      "sans": "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },
    "fontSize": {
      "h1": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
      "h2": ["24px", { "lineHeight": "32px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
      "h3": ["18px", { "lineHeight": "26px", "letterSpacing": "0em", "fontWeight": "600" }],
      "h4": ["16px", { "lineHeight": "24px", "letterSpacing": "0em", "fontWeight": "500" }],
      "body": ["14px", { "lineHeight": "20px", "letterSpacing": "0em", "fontWeight": "400" }],
      "small": ["12px", { "lineHeight": "16px", "letterSpacing": "0.01em", "fontWeight": "400" }]
    },
    "spacing": {
      "1": "4px", "2": "8px", "3": "12px", "4": "16px", 
      "6": "24px", "8": "32px", "12": "48px", "16": "64px"
    },
    "radius": {
      "sm": "4px", "md": "6px", "lg": "8px", "xl": "12px", "full": "9999px"
    },
    "shadow": {
      "sm": "0px 1px 3px rgba(15, 23, 42, 0.06)",
      "md": "0px 4px 6px -1px rgba(15, 23, 42, 0.08)",
      "lg": "0px 10px 15px -3px rgba(15, 23, 42, 0.10)"
    },
    "zIndex": {
      "header": 40,
      "drawer": 50,
      "modal": 60,
      "toast": 70
    }
  }
}
```

---

## 18. UI COMPONENT INVENTORY

```
1. FOUNDATION PRIMITIVES
   ├── Button (Primary, Secondary, Outline, Ghost, Destructive, Success)
   ├── Input & Textarea
   ├── Select & Combobox
   ├── Checkbox, Radio & Switch
   ├── Badge (Condition, Status, Role)
   └── Card, Sheet, Dialog, Popover, Tooltip

2. NAVIGATION
   ├── Header (Desktop & Mobile)
   ├── CategorySubnav Bar
   ├── MobileBottomNav (5 Action Icons)
   └── Breadcrumbs

3. MARKETPLACE DISCOVERY
   ├── ProductCard & ProductGrid
   ├── FilterSidebar & FilterBottomSheet (Mobile)
   ├── SearchInput (With Auto-complete Dropdown)
   └── ConditionBadge & PriceDisplay

4. COMMERCE & ORDERS
   ├── CartDrawer & CartLineItem
   ├── SafeZonePicker (Campus Meetup Spots)
   ├── PaymentMethodSelector
   ├── OrderTimeline (Milestone Tracker)
   └── HandoverOtpCard (6-Digit OTP Monospace Box)

5. SELLER STUDIO
   ├── SellerMetricsCard (Sales, Earnings, Rating)
   ├── ListingForm (Multi-Step Form with Photo Dropzone)
   ├── InventoryTable
   └── WalletBalanceCard & PayoutForm

6. ADMIN & AUDIT
   ├── DataTable & FilterHeader
   ├── ModerationQueueCard
   └── DisputeArbitrationPanel (Side-by-Side Evidence Viewer)

7. FEEDBACK & STATES
   ├── ToastAlert (Success, Error, Info, Warning)
   ├── EmptyState (Centered Vector Icon + Message + CTA)
   └── SkeletonCard & SkeletonRow (Shimmer Loaders)
```

---

## 19. VISUAL CONSISTENCY ENFORCEMENT RULES

1. **Zero Arbitrary Colors**: All text, background, and border colors MUST use defined design tokens (`#2563EB`, `#0F172A`, `#E2E8F0`). Custom hex codes outside the design system are prohibited.
2. **Strict 8pt Spacing**: All margins, paddings, and layout gaps MUST map to 4, 8, 12, 16, 24, 32, 48, or 64px.
3. **Single Icon Library**: All UI icons MUST originate from **Lucide React** using a uniform 2px stroke width.
4. **Predictable CTA Placement**: Primary actions (`Buy Now`, `Publish Listing`, `Pay`) are ALWAYS rendered in Primary Royal Blue (`#2563EB`) and positioned on the right or full-width bottom on mobile.
5. **No Manipulation Patterns**: Countdown timers are used strictly for real security deadlines (24h seller order acceptance and 48h buyer inspection window). Fake urgency or artificial low-stock counters are strictly banned.

---

## 20. FINAL DESIGN DIRECTION SUMMARY

The visual identity of **CampusMarket** delivers a **premium, trustworthy, and high-clarity secondhand marketplace experience**. 

By pairing a crisp **Royal Blue and Slate Navy** color scheme with **Inter typography**, 8pt spatial grid alignment, standardized condition badges, and transparent Escrow trust callouts, CampusMarket establishes immediate legitimacy. The UI empowers student buyers to find affordable course gear quickly while giving student sellers and bookstores a professional studio to manage inventory and collect payouts.
