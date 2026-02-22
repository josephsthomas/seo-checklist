# Content Strategy Portal — Pricing, Payments & Subscription Requirements

> **Version**: 1.0
> **Last Updated**: 2026-02-22
> **Status**: Draft — Ready for Implementation
> **Implementation Strategy**: Organized into 7 executable batches of user stories. Each batch can be implemented independently (with noted dependencies).

---

## Table of Contents

1. [Overview & Goals](#1-overview--goals)
2. [Tier Definitions & Credit System](#2-tier-definitions--credit-system)
3. [Data Models & Firestore Schemas](#3-data-models--firestore-schemas)
4. [Backend API Specifications (Node/Express)](#4-backend-api-specifications-nodeexpress)
5. [Frontend Components](#5-frontend-components)
6. [Registration Flow Updates](#6-registration-flow-updates)
7. [Usage Enforcement & Gating](#7-usage-enforcement--gating)
8. [Admin Features & Observability](#8-admin-features--observability)
9. [User Stories by Implementation Batch](#9-user-stories-by-implementation-batch)

---

## 1. Overview & Goals

### 1.1 Business Context

Content Strategy Portal is an all-in-one content and SEO suite offering 7 tools:

| Tool | AI-Powered? | Description |
|------|------------|-------------|
| Content Planner | No | 353-item checklist, project management, team collaboration |
| Technical Audit | Yes | Screaming Frog export analysis, 31 audit categories, AI recommendations |
| Accessibility Analyzer | Yes | WCAG 2.2 compliance, 93 Axe-core rules, AI remediation suggestions |
| Meta Data Generator | Yes | AI-powered title/description optimization, bulk generation |
| Schema Generator | No | JSON-LD structured data for 40+ schema types |
| Image Alt Generator | Yes | AI-powered alt text generation for images |
| Readability Analyzer | Yes | Readability scoring, AI-powered rewriting suggestions |

The platform currently has no monetization. All tools are free for any authenticated user. The goal is to introduce a tiered subscription model that:

1. **Covers operational costs** — AI features incur real API costs (LLM calls, image analysis). Revenue must exceed these costs.
2. **Segments users by need** — From hobbyists (free) to agencies (enterprise).
3. **Enables sustainable growth** — Credit system prevents unbounded API cost exposure.
4. **Maintains accessibility** — Free tier and nonprofit discount ensure the tool remains accessible.

### 1.2 Technical Context

| Layer | Technology | Role |
|-------|-----------|------|
| Frontend | React 18 + Vite + Tailwind CSS | SPA, public + authenticated routes |
| Auth | Firebase Auth | Email/password + Google OAuth |
| Database | Firestore | User profiles, projects, all app data |
| Storage | Firebase Storage | File uploads (audit exports, images) |
| Backend (NEW) | Node.js + Express | Stripe webhooks, subscription mgmt, usage tracking |
| Payments (NEW) | Stripe | Checkout, Customer Portal, Webhooks, Invoicing |

### 1.3 Key Principles

- **No on-site card processing** — All payment handled by Stripe Checkout and Stripe Customer Portal. We never touch raw card data.
- **Server-authoritative billing** — The Node/Express backend is the source of truth for subscription status and credit balances. Frontend reads from Firestore (synced by backend).
- **Graceful degradation** — When credits run out, tools remain accessible in read-only/view mode. Users see clear upgrade prompts, not hard errors.
- **Idempotent webhooks** — All Stripe webhook handlers must be idempotent (safe to replay).

---

## 2. Tier Definitions & Credit System

### 2.1 Subscription Tiers

#### Basic (Free) — $0/month
- **Seats**: 1
- **Projects/Websites**: 1
- **Monthly Credits**: 50
- **AI Credits**: 10 (subset of total)
- **Features**: All 7 tools accessible (credit-gated)
- **Exports**: Watermarked PDF only (no Excel, no branded exports)
- **Support**: Community (help center, knowledge base)
- **Storage**: 100 MB
- **Data Retention**: 30 days for audit/analysis history
- **No** team features, no shared reports, no scheduled audits

#### Client Side — $99/month
- **Seats**: 1
- **Projects/Websites**: 1
- **Monthly Credits**: 500
- **AI Credits**: 150 (subset of total)
- **Features**: All 7 tools, full access
- **Exports**: PDF, Excel, CSV — no watermark
- **Support**: Email support (48hr response SLA)
- **Storage**: 5 GB
- **Data Retention**: 1 year
- **Shared reports** (read-only links)
- **Scheduled audits** (up to 2 recurring)
- **Overage**: $0.15 per additional credit, $0.50 per additional AI credit

#### Freelance — $149/month
- **Seats**: 1
- **Projects/Websites**: Up to 10
- **Monthly Credits**: 1,500
- **AI Credits**: 400 (subset of total)
- **Features**: All 7 tools, full access
- **Exports**: PDF, Excel, CSV — white-label option (remove CSP branding)
- **Support**: Priority email (24hr response SLA)
- **Storage**: 15 GB
- **Data Retention**: 2 years
- **Shared reports** with custom branding
- **Scheduled audits** (up to 10 recurring)
- **Client handoff reports** — formatted for client delivery
- **Overage**: $0.12 per additional credit, $0.40 per additional AI credit

#### Agency — $299/month
- **Seats**: Unlimited
- **Projects/Websites**: Unlimited
- **Monthly Credits**: 5,000
- **AI Credits**: 1,500 (subset of total)
- **Features**: All 7 tools, full access
- **Exports**: PDF, Excel, CSV — full white-label
- **Support**: Priority email (12hr response SLA) + onboarding call
- **Storage**: 50 GB
- **Data Retention**: Unlimited
- **Full team management** — role-based access (existing roles system)
- **Scheduled audits** (unlimited recurring)
- **API access** (future — documented but not in v1)
- **Usage analytics dashboard** per team member
- **Overage**: $0.10 per additional credit, $0.30 per additional AI credit

#### 501(c)(3) Nonprofit — $49/month
- **Identical to Client Side** in all features and limits
- **50% discount** applied automatically after nonprofit verification
- **Verification required**: Must upload 501(c)(3) determination letter or equivalent
- **Annual re-verification**: Status confirmed each year
- **Overage pricing**: Same rates as Client Side

### 2.2 Credit System Design

#### 2.2.1 Credit Types

There are two credit pools tracked independently:

| Pool | Description | Resets |
|------|------------|--------|
| **Standard Credits** | Consumed by non-AI tool actions (audit upload, schema generation, readability check, etc.) | Monthly on billing date |
| **AI Credits** | Consumed by AI-powered actions (AI suggestions, AI rewrites, AI alt text, etc.) | Monthly on billing date |

> **Rationale**: AI calls cost 10-50x more than non-AI operations. Separating pools prevents a user from burning through their entire allocation on expensive AI calls, and ensures pricing aligns with actual costs.

#### 2.2.2 Credit Cost Matrix

Each tool action consumes a specific number of credits. Costs reflect actual operational expense.

**Standard Credit Actions (1 credit = ~$0.01 operational cost target)**

| Action | Credits | Tool |
|--------|---------|------|
| Create project | 1 | Content Planner |
| Export checklist (PDF) | 2 | Content Planner |
| Export checklist (Excel) | 2 | Content Planner |
| Upload & process audit file | 5 | Technical Audit |
| View audit results (per session) | 0 | Technical Audit |
| Export audit report | 3 | Technical Audit |
| Upload & process accessibility scan | 5 | Accessibility Analyzer |
| Generate VPAT report | 5 | Accessibility Analyzer |
| Generate single schema | 1 | Schema Generator |
| Bulk schema generation (per 10 schemas) | 5 | Schema Generator |
| Upload images for alt text (per batch of 10) | 3 | Image Alt Generator |
| Run readability analysis (per URL/text) | 2 | Readability Analyzer |
| Export readability report | 2 | Readability Analyzer |
| Schedule recurring audit | 3 | Technical Audit |
| Generate shared report link | 1 | All tools |

**AI Credit Actions (1 AI credit = ~$0.05 operational cost target)**

| Action | AI Credits | Tool |
|--------|-----------|------|
| AI fix suggestions (per audit category) | 3 | Technical Audit |
| AI remediation suggestions (per issue batch) | 3 | Accessibility Analyzer |
| AI meta title generation (per URL) | 1 | Meta Data Generator |
| AI meta description generation (per URL) | 1 | Meta Data Generator |
| AI bulk meta generation (per 10 URLs) | 8 | Meta Data Generator |
| AI alt text generation (per image) | 1 | Image Alt Generator |
| AI alt text bulk generation (per 10 images) | 8 | Image Alt Generator |
| AI readability rewrite suggestion | 2 | Readability Analyzer |
| AI competitor analysis | 5 | Meta Data Generator |
| AI A/B variant generation (per set) | 3 | Meta Data Generator |

#### 2.2.3 Credit Overage Model

When a user exhausts their monthly credit pool:

1. **Soft gate**: The tool action is blocked with a clear message showing credits remaining (0) and options to:
   - Purchase a credit pack (immediate)
   - Upgrade their plan
   - Wait for monthly reset (shows date)

2. **Credit packs** (one-time purchases, non-expiring until used):
   - **Starter Pack**: 100 standard + 25 AI credits — $15
   - **Pro Pack**: 500 standard + 100 AI credits — $60
   - **Mega Pack**: 2,000 standard + 500 AI credits — $200

3. **Auto-refill option** (opt-in): Automatically purchase a Starter Pack when balance hits 0. Capped at 3 auto-purchases per month to prevent runaway costs.

#### 2.2.4 Credit Economics Validation

Target margins per tier (assuming average usage patterns):

| Tier | Revenue | Est. Credit Cost | Est. AI Cost | Target Margin |
|------|---------|-----------------|-------------|--------------|
| Basic | $0 | $0.50 | $0.50 | -$1.00 (loss leader) |
| Client | $99 | $5.00 | $7.50 | ~87% margin |
| Freelance | $149 | $15.00 | $20.00 | ~76% margin |
| Agency | $299 | $50.00 | $75.00 | ~58% margin |
| Nonprofit | $49 | $5.00 | $7.50 | ~74% margin |

> **Note**: These are estimates. Actual AI costs depend on LLM provider pricing and usage patterns. The credit system allows adjusting credit costs without changing subscription prices.

### 2.3 Feature Access Matrix

| Feature | Basic | Client | Freelance | Agency | Nonprofit |
|---------|-------|--------|-----------|--------|-----------|
| Content Planner | 1 project | 1 project | 10 projects | Unlimited | 1 project |
| Technical Audit | Upload only | Full | Full | Full | Full |
| Accessibility Analyzer | Upload only | Full | Full | Full | Full |
| Meta Data Generator | 5/month | Full | Full | Full | Full |
| Schema Generator | 3 types | All 40+ types | All 40+ types | All 40+ types | All 40+ types |
| Image Alt Generator | 5 images/mo | Full | Full | Full | Full |
| Readability Analyzer | 3 analyses/mo | Full | Full | Full | Full |
| AI Features | Limited (10/mo) | Full (150/mo) | Full (400/mo) | Full (1500/mo) | Full (150/mo) |
| Exports | Watermarked PDF | PDF/Excel/CSV | White-label | White-label | PDF/Excel/CSV |
| Team Management | No | No | No | Yes | No |
| Scheduled Audits | No | 2 recurring | 10 recurring | Unlimited | 2 recurring |
| Shared Reports | No | Read-only | Branded | Branded | Read-only |
| Storage | 100 MB | 5 GB | 15 GB | 50 GB | 5 GB |
| Data Retention | 30 days | 1 year | 2 years | Unlimited | 1 year |
| Support | Community | Email (48hr) | Priority (24hr) | Priority (12hr) | Email (48hr) |

---

## 3. Data Models & Firestore Schemas

### 3.1 Overview

The billing system introduces new Firestore collections and modifies the existing `users` collection. The Node/Express backend writes to these collections via Firebase Admin SDK; the React frontend reads them in real-time via Firestore listeners.

```
Firestore Collections (NEW)
├── subscriptions/{subscriptionId}    — Stripe subscription mirror
├── credit_balances/{userId}          — Current credit state
├── credit_transactions/{transId}     — Ledger of all credit changes
├── credit_packs/{packId}             — Purchased credit pack records
├── invoices/{invoiceId}              — Stripe invoice mirror
├── nonprofit_verifications/{userId}  — Nonprofit verification requests
└── usage_events/{eventId}            — Raw usage tracking log

Firestore Collections (MODIFIED)
└── users/{userId}                    — Add subscription/tier fields
```

### 3.2 Modified Collection: `users/{userId}`

Add the following fields to the existing user document (see `src/contexts/AuthContext.jsx:50-57` for current schema):

```javascript
// EXISTING fields (do not modify)
{
  email: string,
  name: string,
  role: string,           // 'admin' | 'project_manager' | 'seo_specialist' | etc.
  createdAt: Timestamp,
  avatar: string | null,
  emailVerified: boolean
}

// NEW fields to add
{
  // Subscription info (written by backend, read by frontend)
  tier: string,                    // 'basic' | 'client' | 'freelance' | 'agency' | 'nonprofit'
  stripeCustomerId: string | null, // Stripe customer ID (null for free tier)
  subscriptionId: string | null,   // Active Stripe subscription ID
  subscriptionStatus: string,      // 'active' | 'past_due' | 'canceled' | 'paused' | 'trialing' | 'incomplete'
  currentPeriodEnd: Timestamp,     // When current billing period ends

  // Credit summary (denormalized from credit_balances for fast reads)
  creditsRemaining: number,        // Standard credits remaining this period
  aiCreditsRemaining: number,      // AI credits remaining this period

  // Nonprofit
  nonprofitVerified: boolean,      // Whether 501(c)(3) status is verified
  nonprofitVerifiedAt: Timestamp | null,

  // Limits
  maxProjects: number,             // -1 for unlimited
  maxSeats: number,                // -1 for unlimited
  maxStorageBytes: number,         // Storage limit in bytes
}
```

**Migration note**: Existing users without these fields default to `tier: 'basic'` with free-tier limits. The migration should be handled by a one-time backend script.

### 3.3 New Collection: `subscriptions/{subscriptionId}`

Mirrors Stripe subscription data. The `subscriptionId` matches the Stripe subscription ID.

```javascript
{
  id: string,                      // Stripe subscription ID (e.g., 'sub_xxx')
  userId: string,                  // Firebase Auth UID
  stripeCustomerId: string,        // Stripe customer ID
  tier: string,                    // 'client' | 'freelance' | 'agency' | 'nonprofit'
  status: string,                  // 'active' | 'past_due' | 'canceled' | 'paused' | 'trialing' | 'incomplete'

  // Billing period
  currentPeriodStart: Timestamp,
  currentPeriodEnd: Timestamp,

  // Stripe price info
  stripePriceId: string,           // Stripe Price ID for this tier
  amount: number,                  // Amount in cents (e.g., 9900 for $99)
  currency: string,                // 'usd'
  interval: string,                // 'month'

  // Lifecycle
  cancelAtPeriodEnd: boolean,      // Whether sub cancels at end of period
  canceledAt: Timestamp | null,
  pausedAt: Timestamp | null,
  resumesAt: Timestamp | null,     // When a paused sub resumes

  // Metadata
  createdAt: Timestamp,
  updatedAt: Timestamp,

  // Nonprofit
  nonprofitDiscountApplied: boolean,
  stripeCouponId: string | null    // Stripe coupon for nonprofit discount
}
```

### 3.4 New Collection: `credit_balances/{userId}`

Single document per user tracking current credit state. Updated by the backend on every credit-consuming action.

```javascript
{
  userId: string,
  tier: string,

  // Monthly allocation (set on subscription create/renew)
  monthlyStandardCredits: number,  // e.g., 500 for Client
  monthlyAiCredits: number,        // e.g., 150 for Client

  // Current balance (decremented on usage, reset on billing cycle)
  standardCreditsRemaining: number,
  aiCreditsRemaining: number,

  // Bonus credits (from purchased packs, non-expiring)
  bonusStandardCredits: number,
  bonusAiCredits: number,

  // Overage tracking (current period)
  standardOverageUsed: number,     // Credits used beyond monthly + bonus
  aiOverageUsed: number,

  // Auto-refill settings
  autoRefillEnabled: boolean,
  autoRefillPackType: string | null,  // 'starter' | 'pro' | 'mega'
  autoRefillCount: number,            // How many auto-refills this month (max 3)

  // Period tracking
  periodStart: Timestamp,
  periodEnd: Timestamp,
  lastResetAt: Timestamp,

  updatedAt: Timestamp
}
```

**Credit consumption priority**: Monthly credits are consumed first, then bonus credits from packs, then overages are tracked.

### 3.5 New Collection: `credit_transactions/{transactionId}`

Immutable ledger of every credit change. Used for audit trail and invoice itemization.

```javascript
{
  id: string,                      // Auto-generated
  userId: string,
  type: string,                    // 'debit' | 'credit' | 'reset' | 'pack_purchase' | 'overage'
  creditType: string,              // 'standard' | 'ai'
  amount: number,                  // Positive for credits added, negative for consumed
  balanceAfter: number,            // Balance after this transaction

  // Context
  action: string,                  // e.g., 'audit_upload', 'ai_meta_generation', 'monthly_reset'
  toolName: string | null,         // e.g., 'technical_audit', 'meta_generator'
  description: string,             // Human-readable description

  // Reference
  relatedResourceId: string | null, // e.g., audit ID, project ID
  packId: string | null,            // If from a credit pack purchase

  createdAt: Timestamp
}
```

### 3.6 New Collection: `credit_packs/{packId}`

Records of purchased credit packs.

```javascript
{
  id: string,
  userId: string,
  packType: string,                // 'starter' | 'pro' | 'mega'

  // Credits granted
  standardCredits: number,         // Total standard credits in pack
  aiCredits: number,               // Total AI credits in pack
  standardCreditsRemaining: number,// Remaining (decremented as used)
  aiCreditsRemaining: number,

  // Payment
  amountPaid: number,              // In cents
  stripePaymentIntentId: string,

  // Lifecycle
  purchasedAt: Timestamp,
  fullyConsumedAt: Timestamp | null,
  isAutoRefill: boolean,           // Whether this was an auto-refill purchase

  createdAt: Timestamp
}
```

### 3.7 New Collection: `invoices/{invoiceId}`

Mirrors Stripe invoice data for in-app display.

```javascript
{
  id: string,                      // Stripe invoice ID
  userId: string,
  stripeCustomerId: string,
  subscriptionId: string | null,

  // Invoice details
  number: string,                  // Stripe invoice number
  status: string,                  // 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
  amountDue: number,               // In cents
  amountPaid: number,
  currency: string,

  // Line items (denormalized for display)
  lineItems: [
    {
      description: string,
      amount: number,              // In cents
      quantity: number
    }
  ],

  // URLs
  hostedInvoiceUrl: string,        // Stripe-hosted invoice page
  invoicePdf: string,              // PDF download URL

  // Dates
  periodStart: Timestamp,
  periodEnd: Timestamp,
  dueDate: Timestamp | null,
  paidAt: Timestamp | null,

  createdAt: Timestamp
}
```

### 3.8 New Collection: `nonprofit_verifications/{userId}`

Tracks nonprofit verification requests and status.

```javascript
{
  userId: string,
  organizationName: string,
  ein: string,                     // Employer Identification Number

  // Document upload
  documentUrl: string,             // Firebase Storage path to uploaded 501(c)(3) letter
  documentFileName: string,

  // Verification status
  status: string,                  // 'pending' | 'approved' | 'rejected' | 'expired'
  reviewedBy: string | null,       // Admin user ID who reviewed
  reviewedAt: Timestamp | null,
  rejectionReason: string | null,

  // Expiration
  verifiedAt: Timestamp | null,
  expiresAt: Timestamp | null,     // 1 year from verification

  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 3.9 New Collection: `usage_events/{eventId}`

Raw usage tracking for analytics and billing reconciliation. High-volume collection.

```javascript
{
  id: string,
  userId: string,
  tier: string,                    // User's tier at time of event

  // Event details
  action: string,                  // e.g., 'audit_upload', 'ai_meta_gen'
  toolName: string,                // e.g., 'technical_audit'
  creditType: string,              // 'standard' | 'ai'
  creditsConsumed: number,

  // Source tracking
  wasOverage: boolean,             // Whether this consumed overage credits
  wasFromPack: boolean,            // Whether this consumed pack credits

  // Context
  resourceId: string | null,       // Related resource (audit ID, project ID, etc.)
  metadata: object | null,         // Additional context (e.g., { urlCount: 5, batchSize: 10 })

  // Performance
  processingTimeMs: number | null, // How long the action took

  createdAt: Timestamp
}
```

**Indexing**: Create composite indexes on:
- `userId + createdAt` (for user usage history)
- `toolName + createdAt` (for tool-level analytics)
- `tier + createdAt` (for tier-level analytics)
- `userId + toolName + createdAt` (for per-user per-tool queries)

### 3.10 Stripe Product/Price Configuration

These Stripe objects must be created in the Stripe Dashboard or via API during setup:

```
Products:
├── prod_client_side      → "Content Strategy Portal — Client Side"
│   └── price_client_monthly  → $99/month recurring
├── prod_freelance        → "Content Strategy Portal — Freelance"
│   └── price_freelance_monthly → $149/month recurring
├── prod_agency           → "Content Strategy Portal — Agency"
│   └── price_agency_monthly → $299/month recurring
├── prod_nonprofit        → "Content Strategy Portal — Nonprofit"
│   └── price_nonprofit_monthly → $49/month recurring (uses coupon alternatively)
│
├── prod_credit_starter   → "Credit Pack — Starter"
│   └── price_credit_starter → $15 one-time
├── prod_credit_pro       → "Credit Pack — Pro"
│   └── price_credit_pro → $60 one-time
└── prod_credit_mega      → "Credit Pack — Mega"
    └── price_credit_mega → $200 one-time

Coupons:
└── coupon_nonprofit_50   → 50% off forever (for nonprofit tier alternative approach)
```

### 3.11 Environment Variables (New)

```bash
# Stripe
STRIPE_SECRET_KEY=sk_xxx
STRIPE_PUBLISHABLE_KEY=pk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Stripe Price IDs
STRIPE_PRICE_CLIENT=price_xxx
STRIPE_PRICE_FREELANCE=price_xxx
STRIPE_PRICE_AGENCY=price_xxx
STRIPE_PRICE_NONPROFIT=price_xxx
STRIPE_PRICE_CREDIT_STARTER=price_xxx
STRIPE_PRICE_CREDIT_PRO=price_xxx
STRIPE_PRICE_CREDIT_MEGA=price_xxx

# Stripe Coupon
STRIPE_COUPON_NONPROFIT=coupon_xxx

# Firebase Admin (for backend)
FIREBASE_PROJECT_ID=xxx
FIREBASE_PRIVATE_KEY=xxx
FIREBASE_CLIENT_EMAIL=xxx

# Server
PORT=3001
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173

# Frontend (add to existing .env)
VITE_API_URL=http://localhost:3001
VITE_STRIPE_PUBLISHABLE_KEY=pk_xxx
```

---

## 4. Backend API Specifications (Node/Express)

### 4.1 Architecture Overview

The backend is a standalone Node.js + Express server that handles:
- Stripe webhook processing
- Subscription lifecycle management
- Credit balance management and usage metering
- Credit pack purchases
- Nonprofit verification workflow

It communicates with Firebase via the Admin SDK (writes to Firestore) and with Stripe via the Stripe Node SDK. The React frontend calls this API for any write operations related to billing.

```
┌─────────────┐     ┌──────────────────┐     ┌─────────┐
│  React SPA  │────>│  Node/Express    │────>│  Stripe │
│  (Frontend) │<────│  API Server      │<────│   API   │
└─────────────┘     └──────────────────┘     └─────────┘
       │                     │
       │                     │ Firebase Admin SDK
       │                     ▼
       │              ┌─────────────┐
       └─────────────>│  Firestore  │
          Firestore   │  (Database) │
          Listeners   └─────────────┘
```

### 4.2 Server Directory Structure

```
server/
├── package.json
├── .env
├── src/
│   ├── index.js                  # Express app entry point
│   ├── config/
│   │   ├── stripe.js             # Stripe client initialization
│   │   ├── firebase.js           # Firebase Admin SDK initialization
│   │   └── tiers.js              # Tier definitions, credit limits, pricing constants
│   ├── routes/
│   │   ├── webhooks.js           # POST /webhooks/stripe (raw body)
│   │   ├── subscriptions.js      # Subscription CRUD endpoints
│   │   ├── credits.js            # Credit balance & usage endpoints
│   │   ├── checkout.js           # Stripe Checkout session creation
│   │   ├── billing.js            # Customer portal, invoices
│   │   └── nonprofit.js          # Nonprofit verification endpoints
│   ├── middleware/
│   │   ├── auth.js               # Firebase token verification
│   │   ├── rateLimiter.js        # Rate limiting per endpoint
│   │   └── errorHandler.js       # Global error handler
│   ├── services/
│   │   ├── subscriptionService.js    # Subscription business logic
│   │   ├── creditService.js          # Credit consumption/allocation logic
│   │   ├── webhookService.js         # Webhook event processing
│   │   ├── nonprofitService.js       # Nonprofit verification logic
│   │   └── usageService.js           # Usage event recording
│   └── utils/
│       ├── logger.js             # Structured logging
│       └── constants.js          # Shared constants
└── tests/
    ├── webhooks.test.js
    ├── credits.test.js
    └── subscriptions.test.js
```

### 4.3 Authentication Middleware

All endpoints (except `/webhooks/stripe`) require a valid Firebase ID token in the `Authorization` header.

```
Authorization: Bearer <firebase-id-token>
```

The middleware verifies the token using Firebase Admin SDK and attaches the user's UID and profile to the request.

```javascript
// middleware/auth.js
// Verifies Firebase ID token
// Attaches req.user = { uid, email, tier, ... }
// Returns 401 if token invalid/expired
// Returns 403 if user account disabled
```

### 4.4 API Endpoints

#### 4.4.1 Checkout Endpoints

**POST /api/checkout/create-session**

Creates a Stripe Checkout session for a new subscription or credit pack purchase.

```
Request:
{
  tier: 'client' | 'freelance' | 'agency' | 'nonprofit',
  successUrl: string,     // Redirect URL after success
  cancelUrl: string       // Redirect URL if canceled
}

Response (200):
{
  sessionId: string,      // Stripe Checkout Session ID
  url: string             // Stripe Checkout URL to redirect to
}

Errors:
- 400: Invalid tier, user already has active subscription for tier change
- 401: Not authenticated
- 409: User already has an active paid subscription (must cancel first or use upgrade)
```

**POST /api/checkout/create-pack-session**

Creates a Stripe Checkout session for a one-time credit pack purchase.

```
Request:
{
  packType: 'starter' | 'pro' | 'mega',
  successUrl: string,
  cancelUrl: string
}

Response (200):
{
  sessionId: string,
  url: string
}

Errors:
- 400: Invalid pack type
- 401: Not authenticated
- 403: Free tier users cannot purchase packs (must upgrade first)
```

#### 4.4.2 Subscription Endpoints

**GET /api/subscriptions/current**

Returns the current user's active subscription details.

```
Response (200):
{
  subscription: {
    id: string,
    tier: string,
    status: string,
    currentPeriodStart: string (ISO 8601),
    currentPeriodEnd: string (ISO 8601),
    cancelAtPeriodEnd: boolean,
    amount: number,
    currency: string
  } | null
}
```

**POST /api/subscriptions/upgrade**

Initiates a plan upgrade. Uses Stripe's proration to handle mid-cycle changes.

```
Request:
{
  newTier: 'client' | 'freelance' | 'agency'
}

Response (200):
{
  subscription: { ... },   // Updated subscription
  prorationAmount: number   // Prorated amount charged/credited
}

Errors:
- 400: Cannot downgrade via this endpoint (use /downgrade)
- 400: Already on this tier
- 401: Not authenticated
- 404: No active subscription
```

**POST /api/subscriptions/downgrade**

Initiates a plan downgrade. Takes effect at end of current billing period.

```
Request:
{
  newTier: 'basic' | 'client' | 'freelance'
}

Response (200):
{
  subscription: { ... },
  effectiveDate: string (ISO 8601)  // When downgrade takes effect
}

Errors:
- 400: Cannot upgrade via this endpoint
- 400: Already on this tier
- 401: Not authenticated
```

**POST /api/subscriptions/cancel**

Cancels the subscription at end of current billing period.

```
Request:
{
  reason: string | null,    // Optional cancellation reason
  feedback: string | null   // Optional feedback
}

Response (200):
{
  subscription: { ... },
  cancelAt: string (ISO 8601)
}
```

**POST /api/subscriptions/reactivate**

Reactivates a subscription that is set to cancel at period end.

```
Response (200):
{
  subscription: { ... }
}

Errors:
- 400: Subscription is not set to cancel
- 404: No subscription found
```

**POST /api/subscriptions/pause**

Pauses the subscription. Billing stops; access reverts to Basic tier limits.

```
Request:
{
  resumeDate: string | null  // Optional: auto-resume date (ISO 8601). Max 3 months.
}

Response (200):
{
  subscription: { ... },
  pausedAt: string,
  resumesAt: string | null
}

Errors:
- 400: Subscription already paused
- 400: Resume date exceeds 3-month maximum
```

**POST /api/subscriptions/resume**

Resumes a paused subscription immediately.

```
Response (200):
{
  subscription: { ... }
}
```

#### 4.4.3 Credit Endpoints

**GET /api/credits/balance**

Returns current credit balance for the authenticated user.

```
Response (200):
{
  standardCredits: {
    remaining: number,
    monthly: number,
    bonus: number,         // From purchased packs
    overageUsed: number
  },
  aiCredits: {
    remaining: number,
    monthly: number,
    bonus: number,
    overageUsed: number
  },
  periodEnd: string (ISO 8601),
  autoRefill: {
    enabled: boolean,
    packType: string | null,
    purchasesThisMonth: number
  }
}
```

**POST /api/credits/consume**

Consumes credits for a tool action. Called by the frontend before executing credit-consuming actions.

```
Request:
{
  action: string,          // e.g., 'audit_upload'
  creditType: 'standard' | 'ai',
  amount: number,          // Credits to consume
  toolName: string,        // e.g., 'technical_audit'
  resourceId: string | null
}

Response (200):
{
  success: true,
  creditsRemaining: number,
  source: 'monthly' | 'bonus' | 'overage'
}

Response (402):
{
  success: false,
  error: 'insufficient_credits',
  creditsRequired: number,
  creditsAvailable: number,
  upgradeOptions: [ ... ]   // Suggested plans or packs
}
```

**GET /api/credits/history**

Returns credit transaction history for the current user.

```
Query params:
  page: number (default 1)
  limit: number (default 50, max 100)
  creditType: 'standard' | 'ai' | 'all' (default 'all')
  startDate: string (ISO 8601, optional)
  endDate: string (ISO 8601, optional)

Response (200):
{
  transactions: [ ... ],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

**POST /api/credits/auto-refill**

Configures auto-refill settings.

```
Request:
{
  enabled: boolean,
  packType: 'starter' | 'pro' | 'mega'  // Required if enabled=true
}

Response (200):
{
  autoRefill: {
    enabled: boolean,
    packType: string | null
  }
}
```

#### 4.4.4 Billing Endpoints

**POST /api/billing/portal-session**

Creates a Stripe Customer Portal session for managing payment methods, viewing invoices, etc.

```
Request:
{
  returnUrl: string   // URL to redirect back to after portal
}

Response (200):
{
  url: string         // Stripe Customer Portal URL
}
```

**GET /api/billing/invoices**

Returns invoice history for the current user.

```
Query params:
  page: number (default 1)
  limit: number (default 20)
  status: 'paid' | 'open' | 'void' | 'all' (default 'all')

Response (200):
{
  invoices: [
    {
      id: string,
      number: string,
      status: string,
      amount: number,
      currency: string,
      periodStart: string,
      periodEnd: string,
      paidAt: string | null,
      pdfUrl: string,
      hostedUrl: string
    }
  ],
  pagination: { ... }
}
```

#### 4.4.5 Nonprofit Endpoints

**POST /api/nonprofit/submit-verification**

Submits a nonprofit verification request.

```
Request (multipart/form-data):
{
  organizationName: string,
  ein: string,
  document: File           // 501(c)(3) determination letter (PDF/image)
}

Response (200):
{
  verificationId: string,
  status: 'pending'
}

Errors:
- 400: Missing required fields
- 400: Invalid file type (must be PDF, PNG, or JPG)
- 409: Verification already pending or approved
```

**GET /api/nonprofit/verification-status**

Returns current nonprofit verification status.

```
Response (200):
{
  status: 'none' | 'pending' | 'approved' | 'rejected' | 'expired',
  organizationName: string | null,
  submittedAt: string | null,
  reviewedAt: string | null,
  expiresAt: string | null,
  rejectionReason: string | null
}
```

**POST /api/nonprofit/review** *(Admin only)*

Admin endpoint to approve or reject a nonprofit verification.

```
Request:
{
  userId: string,
  decision: 'approved' | 'rejected',
  reason: string | null    // Required if rejected
}

Response (200):
{
  status: string,
  userId: string
}

Errors:
- 403: Not an admin
```

#### 4.4.6 Webhook Endpoint

**POST /webhooks/stripe**

Receives Stripe webhook events. Uses raw body for signature verification. No auth middleware (Stripe signature verification instead).

**Handled events:**

| Event | Handler Action |
|-------|---------------|
| `checkout.session.completed` | Create/update subscription in Firestore, provision credits, update user tier |
| `customer.subscription.created` | Mirror subscription to Firestore |
| `customer.subscription.updated` | Update subscription status, handle plan changes |
| `customer.subscription.deleted` | Mark subscription canceled, revert user to Basic tier |
| `customer.subscription.paused` | Update status to paused, revert access to Basic |
| `customer.subscription.resumed` | Update status to active, restore tier access |
| `invoice.paid` | Record invoice in Firestore, reset monthly credits |
| `invoice.payment_failed` | Update subscription status to past_due, send notification |
| `invoice.finalized` | Store invoice in Firestore |
| `payment_intent.succeeded` | Handle credit pack purchases (one-time) |
| `customer.created` | Store Stripe customer ID in user profile |

**Idempotency**: Each webhook handler checks `event.id` against a `processed_events` collection to avoid duplicate processing.

### 4.5 Error Response Format

All API errors follow a consistent format:

```json
{
  "error": {
    "code": "insufficient_credits",
    "message": "You do not have enough AI credits for this action.",
    "details": {
      "required": 3,
      "available": 1
    }
  }
}
```

Standard HTTP status codes:
- `400` — Bad request (validation errors)
- `401` — Not authenticated
- `402` — Payment required (insufficient credits, payment failed)
- `403` — Forbidden (insufficient permissions)
- `404` — Resource not found
- `409` — Conflict (duplicate request, existing subscription)
- `429` — Rate limited
- `500` — Internal server error

### 4.6 Rate Limiting

| Endpoint Group | Limit |
|---------------|-------|
| Checkout creation | 5 per minute per user |
| Credit consumption | 60 per minute per user |
| Credit balance check | 120 per minute per user |
| Subscription management | 10 per minute per user |
| Webhook | 1000 per minute (global) |

---

## 5. Frontend Components

### 5.1 Public Pricing Page

**Route**: `/pricing`
**File**: `src/components/public/PricingPage.jsx`
**Accessible**: Unauthenticated (public) and authenticated users

#### 5.1.1 Layout & Design

The pricing page follows the existing public page design language (see `src/components/public/LandingPage.jsx`, `FeaturesPage.jsx`) using Tailwind CSS with the project's existing color system (`primary`, `charcoal`, `emerald`, etc.).

**Page Structure:**

```
┌──────────────────────────────────────────────────────┐
│  SEOHead (title, meta, structured data)              │
├──────────────────────────────────────────────────────┤
│  Hero Section                                         │
│  "Simple, transparent pricing"                        │
│  Subtitle explaining the credit-based model           │
├──────────────────────────────────────────────────────┤
│  Billing Toggle (Monthly only for now — placeholder   │
│  for future annual toggle)                            │
├──────────────────────────────────────────────────────┤
│  Pricing Cards (5 tiers in responsive grid)           │
│  ┌─────┐ ┌─────┐ ┌─────────┐ ┌─────┐ ┌─────────┐   │
│  │Basic│ │Client│ │Freelance│ │Agency│ │Nonprofit │   │
│  │FREE │ │$99  │ │$149     │ │$299  │ │$49       │   │
│  │     │ │     │ │POPULAR  │ │      │ │          │   │
│  └─────┘ └─────┘ └─────────┘ └─────┘ └─────────┘   │
├──────────────────────────────────────────────────────┤
│  Feature Comparison Table (expandable/collapsible)    │
│  Full matrix of features × tiers                      │
├──────────────────────────────────────────────────────┤
│  Credit System Explanation                            │
│  How credits work, what actions cost, overage info    │
├──────────────────────────────────────────────────────┤
│  FAQ Section                                          │
│  Common pricing questions                             │
├──────────────────────────────────────────────────────┤
│  CTA Section                                          │
│  "Start free today" button                            │
├──────────────────────────────────────────────────────┤
│  Footer (existing shared footer)                      │
└──────────────────────────────────────────────────────┘
```

#### 5.1.2 Pricing Card Component

Each tier card displays:

- **Tier name** and tagline
- **Price** with "/month" label
- **Credit allocation** (standard + AI credits)
- **Key feature bullets** (5-6 highlights per tier)
- **CTA button**:
  - Basic: "Get Started Free" → `/register?tier=basic`
  - Paid tiers: "Start [Tier Name]" → `/register?tier={tierId}`
  - If user is logged in and on a lower tier: "Upgrade to [Tier Name]"
  - If user is on this tier: "Current Plan" (disabled)
- **"Most Popular" badge** on Freelance tier
- **"50% off" badge** on Nonprofit tier

**Visual differentiation:**
- Basic: Light gray border, subtle styling
- Client: Primary color accent
- Freelance: Highlighted card (elevated shadow, primary border, "Most Popular" ribbon)
- Agency: Dark/premium styling
- Nonprofit: Emerald accent with heart icon

#### 5.1.3 Feature Comparison Table

Full-width responsive table (horizontal scroll on mobile) comparing all tiers across:

| Category | Features to Compare |
|----------|-------------------|
| Tools | Access level for each of the 7 tools |
| Credits | Monthly standard credits, monthly AI credits |
| Limits | Projects, seats, storage, data retention |
| Exports | PDF, Excel, CSV, white-label options |
| Collaboration | Team management, shared reports, scheduled audits |
| Support | Support tier and response SLA |
| Overages | Per-credit overage pricing |

Use checkmarks, X marks, and specific values. Group rows by category with collapsible sections.

#### 5.1.4 Credit Explainer Section

Visual section explaining the credit system:

- **Two-column layout**: Standard Credits vs AI Credits
- **Action cost examples** with icons (e.g., "Upload an audit = 5 credits", "AI meta generation = 1 AI credit")
- **Visual credit meter** showing typical monthly usage for each tier
- **"What happens when credits run out?"** callout explaining soft gate and credit packs

#### 5.1.5 FAQ Section

Accordion-style FAQ covering:

1. What are credits and how do they work?
2. What happens when I run out of credits?
3. Can I upgrade or downgrade my plan?
4. How does the nonprofit discount work?
5. Can I pause my subscription?
6. What payment methods are accepted?
7. Is there a free trial?
8. How do credit packs work?
9. What's included in the free tier?
10. Can I cancel anytime?

#### 5.1.6 SEO & Structured Data

Use existing `SEOHead` component (`src/components/shared/SEOHead.jsx`) with:
- Title: "Pricing | Content Strategy Portal"
- Description: "Choose the right plan for your content strategy needs. Free tier available. Plans from $49/month for nonprofits to $299/month for agencies."
- JSON-LD: `Product` schema with pricing offers

### 5.2 Billing Dashboard (Authenticated)

**Route**: `/app/billing`
**File**: `src/components/billing/BillingDashboard.jsx`
**Access**: Authenticated users only (via `ProtectedRoute`)

#### 5.2.1 Layout

```
┌──────────────────────────────────────────────────────┐
│  Page Header: "Billing & Subscription"                │
├──────────────────────────────────────────────────────┤
│  Current Plan Card                                    │
│  ┌────────────────────────────────────────────────┐  │
│  │ Plan: Freelance        Status: Active           │  │
│  │ $149/month             Next billing: Mar 22     │  │
│  │ [Upgrade] [Downgrade] [Pause] [Cancel]          │  │
│  └────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────┤
│  Credit Usage (Current Period)                        │
│  ┌──────────────────┐  ┌──────────────────┐          │
│  │ Standard Credits  │  │ AI Credits       │          │
│  │ ████████░░ 350/500│  │ ██████░░░░ 90/150│          │
│  │ Resets: Mar 22    │  │ Resets: Mar 22   │          │
│  └──────────────────┘  └──────────────────┘          │
│  Bonus Credits: 45 standard, 10 AI                    │
│  [Buy Credit Pack]                                    │
├──────────────────────────────────────────────────────┤
│  Quick Actions                                        │
│  [Manage Payment Method] [View Invoices]              │
│  [Auto-Refill Settings]                               │
├──────────────────────────────────────────────────────┤
│  Recent Usage Activity (last 10 transactions)         │
│  ┌────────────────────────────────────────────────┐  │
│  │ Today   AI Meta Gen    -1 AI credit   149 left │  │
│  │ Today   Audit Upload   -5 credits     345 left │  │
│  │ ...                                             │  │
│  └────────────────────────────────────────────────┘  │
│  [View Full History]                                  │
└──────────────────────────────────────────────────────┘
```

#### 5.2.2 Subcomponents

**CurrentPlanCard** — Displays tier, price, status, next billing date. Action buttons for plan management.

**CreditUsageGauge** — Visual progress bars for standard and AI credits. Color-coded:
- Green (>50% remaining)
- Yellow (25-50% remaining)
- Red (<25% remaining)

**CreditPackPurchaseModal** — Modal with 3 pack options (Starter, Pro, Mega). Shows credit quantities and prices. "Buy Now" redirects to Stripe Checkout.

**AutoRefillSettings** — Toggle to enable auto-refill. Dropdown to select pack type. Shows auto-refill count this month and cap (3).

**UsageActivityList** — Recent credit transactions with tool icons, descriptions, and running balance.

### 5.3 Invoice History Page

**Route**: `/app/billing/invoices`
**File**: `src/components/billing/InvoiceHistory.jsx`

Paginated list of all invoices with:
- Invoice number, date, amount, status badge
- "View" link (opens Stripe-hosted invoice page)
- "Download PDF" link
- Status filter (All, Paid, Open, Void)

### 5.4 Plan Management Page

**Route**: `/app/billing/plans`
**File**: `src/components/billing/PlanManagement.jsx`

Side-by-side comparison of current plan vs available plans. Shows:
- What changes with upgrade/downgrade
- Prorated cost for immediate upgrade
- "Effective at period end" note for downgrades
- Confirmation modal before any plan change

### 5.5 Credit History Page

**Route**: `/app/billing/credits`
**File**: `src/components/billing/CreditHistory.jsx`

Full transaction ledger with:
- Date, action, tool, credit type, amount, balance after
- Filter by credit type (Standard, AI, All)
- Date range picker
- Export to CSV

### 5.6 Nonprofit Verification Page

**Route**: `/app/billing/nonprofit`
**File**: `src/components/billing/NonprofitVerification.jsx`

Accessible only to users applying for nonprofit tier:
- Upload form for 501(c)(3) letter
- Organization name and EIN input
- Status tracker (Pending → In Review → Approved/Rejected)
- If approved: shows expiration date and re-verification info

### 5.7 Navigation Updates

**Public Navigation** (`src/components/public/PublicNavigation.jsx`):
- Add "Pricing" link between "Features" and "Help Center"

**Authenticated Sidebar/Navigation**:
- Add "Billing" section under user menu or settings
- Show credit balance indicator in header/sidebar (compact: "Credits: 350 | AI: 90")

### 5.8 Shared UI Components (New)

**CreditBadge** — Small inline badge showing credit cost for an action (e.g., "5 credits"). Displayed next to action buttons throughout the app.

**UpgradePrompt** — Reusable modal/banner shown when user hits a tier-gated feature or credit limit. Shows relevant upgrade path.

**TierBadge** — Small badge showing user's current tier. Used in profile, billing, and admin views.

---

## 6. Registration Flow Updates

### 6.1 Current Registration Flow

The existing registration flow (`src/components/auth/RegisterForm.jsx`) collects:
1. Full Name
2. Email Address
3. Password + Confirm Password
4. Policy acceptance (Terms, Privacy, AI Policy)
5. Submit → Firebase Auth `createUserWithEmailAndPassword` → Firestore user doc → Redirect to `/`

Google OAuth is also supported as an alternative.

### 6.2 Updated Registration Flow

The registration flow becomes a multi-step process when a tier is pre-selected (via `?tier=` query parameter from pricing page).

#### 6.2.1 Flow Diagram

```
Pricing Page                    Register Page
┌──────────┐                    ┌─────────────────────────┐
│ [Start   │───tier=client────> │ Step 1: Account Details  │
│ Client]  │                    │   Name, Email, Password  │
└──────────┘                    │   Policy Acceptance      │
                                ├─────────────────────────┤
                                │ Step 2: Plan Confirmation│
                                │   Selected: Client $99/mo│
                                │   Features summary       │
                                │   [Confirm & Pay]        │
                                ├─────────────────────────┤
                                │ Step 3: Stripe Checkout   │
                                │   (Redirect to Stripe)   │
                                ├─────────────────────────┤
                                │ Step 4: Success/Welcome   │
                                │   (Redirect back)        │
                                │   Account created!       │
                                │   Credits provisioned    │
                                └─────────────────────────┘
```

#### 6.2.2 Registration Scenarios

**Scenario A: Free tier (no `tier` param or `tier=basic`)**
1. Standard registration form (unchanged from current)
2. On submit: Create Firebase Auth user + Firestore user doc with `tier: 'basic'`
3. Provision 50 standard + 10 AI credits
4. Redirect to `/app` (home dashboard)

**Scenario B: Paid tier (`tier=client|freelance|agency`)**
1. Step 1: Account creation form (same fields as current)
2. Step 2: Plan confirmation panel showing tier details, price, credits
3. Step 3: On "Confirm & Pay" → Call backend `POST /api/checkout/create-session` → Redirect to Stripe Checkout
4. Stripe Checkout handles card entry and payment
5. On success: Stripe webhook fires → Backend creates subscription, provisions credits, updates user doc
6. User redirected to success URL → `/app?subscription=success`
7. Welcome modal shows plan details and getting started info

**Scenario C: Nonprofit tier (`tier=nonprofit`)**
1. Step 1: Account creation form
2. Step 2: Nonprofit verification form (organization name, EIN, document upload)
3. Step 3: Plan confirmation showing $49/month pending verification
4. On submit: Create account with `tier: 'basic'` temporarily. Submit nonprofit verification request.
5. Show "Verification pending" status. User has Basic tier access until approved.
6. When admin approves: Backend creates Stripe subscription at $49/month, sends email notification
7. User completes Stripe Checkout via email link or next login prompt

**Scenario D: Google OAuth with tier pre-selection**
1. Show tier summary before Google sign-in
2. After Google auth: Check if user profile exists
3. If new user: Create profile → Same flow as Scenario B/C (redirect to Stripe Checkout or nonprofit verification)
4. If existing user: Show "You already have an account. Would you like to upgrade?" → Redirect to plan management

#### 6.2.3 URL Parameters

| Parameter | Values | Effect |
|-----------|--------|--------|
| `tier` | `basic`, `client`, `freelance`, `agency`, `nonprofit` | Pre-selects tier, shows plan confirmation step |
| `from` | `pricing`, `upgrade`, `landing` | Tracks where user came from (analytics) |

#### 6.2.4 Registration Form Modifications

**File**: `src/components/auth/RegisterForm.jsx`

Changes:
1. Read `tier` from URL search params (`useSearchParams`)
2. Add state machine for multi-step flow: `account_details` → `plan_confirmation` → `checkout` → `success`
3. For paid tiers: Show plan confirmation step after account creation
4. For nonprofit: Show verification upload step
5. Handle Stripe Checkout redirect flow (create session → redirect → handle callback)
6. Update Firestore user doc creation to include new tier fields

**New sub-components:**
- `PlanConfirmationStep.jsx` — Shows selected tier details, price, credits, and "Confirm & Pay" button
- `NonprofitVerificationStep.jsx` — Organization details and document upload form
- `RegistrationSuccess.jsx` — Welcome screen after successful registration + payment

#### 6.2.5 AuthContext Modifications

**File**: `src/contexts/AuthContext.jsx`

Changes to `signup` function:
1. Accept optional `tier` parameter
2. Set `tier` field in Firestore user doc (default: `'basic'`)
3. Set initial credit balance fields
4. Do NOT create Stripe subscription inline — that's handled by the checkout flow

New fields in user doc on creation:
```javascript
{
  // ...existing fields...
  tier: tier || 'basic',
  stripeCustomerId: null,
  subscriptionId: null,
  subscriptionStatus: tier === 'basic' ? 'active' : 'incomplete',
  creditsRemaining: TIER_CONFIGS[tier].monthlyStandardCredits,
  aiCreditsRemaining: TIER_CONFIGS[tier].monthlyAiCredits,
  nonprofitVerified: false,
  maxProjects: TIER_CONFIGS[tier].maxProjects,
  maxSeats: TIER_CONFIGS[tier].maxSeats,
  maxStorageBytes: TIER_CONFIGS[tier].maxStorageBytes,
}
```

### 6.3 New Context: SubscriptionContext

**File**: `src/contexts/SubscriptionContext.jsx`

A new React context that provides subscription and credit data to the entire app. Wraps the app inside `AuthProvider`.

```javascript
// Provides:
{
  // Subscription state
  tier: string,
  subscription: object | null,
  isActive: boolean,         // subscription is active (not paused, canceled, past_due)
  isPaused: boolean,
  isPastDue: boolean,

  // Credit state
  credits: {
    standard: { remaining, monthly, bonus },
    ai: { remaining, monthly, bonus }
  },

  // Tier config (limits, features)
  tierConfig: object,        // From TIER_CONFIGS constant

  // Helper functions
  canUseFeature: (featureName) => boolean,
  hasCredits: (creditType, amount) => boolean,
  consumeCredits: (action, creditType, amount, toolName, resourceId) => Promise<result>,

  // Loading state
  loading: boolean
}
```

This context listens to the `credit_balances/{userId}` Firestore document in real-time for live credit updates.

### 6.4 Tier Configuration Constants

**File**: `src/config/tiers.js` (shared between frontend and conceptually mirrored in `server/src/config/tiers.js`)

```javascript
export const TIER_IDS = {
  BASIC: 'basic',
  CLIENT: 'client',
  FREELANCE: 'freelance',
  AGENCY: 'agency',
  NONPROFIT: 'nonprofit'
};

export const TIER_CONFIGS = {
  basic: {
    id: 'basic',
    name: 'Basic',
    tagline: 'Get started for free',
    price: 0,
    monthlyStandardCredits: 50,
    monthlyAiCredits: 10,
    maxProjects: 1,
    maxSeats: 1,
    maxStorageBytes: 100 * 1024 * 1024,  // 100 MB
    dataRetentionDays: 30,
    features: {
      exports: ['pdf_watermarked'],
      teamManagement: false,
      sharedReports: false,
      scheduledAudits: 0,
      whiteLabel: false,
      schemaTypes: 3,
    },
    overageRates: null,  // No overage for free tier
  },
  client: {
    id: 'client',
    name: 'Client Side',
    tagline: 'For managing one website',
    price: 99,
    monthlyStandardCredits: 500,
    monthlyAiCredits: 150,
    maxProjects: 1,
    maxSeats: 1,
    maxStorageBytes: 5 * 1024 * 1024 * 1024,  // 5 GB
    dataRetentionDays: 365,
    features: {
      exports: ['pdf', 'excel', 'csv'],
      teamManagement: false,
      sharedReports: 'readonly',
      scheduledAudits: 2,
      whiteLabel: false,
      schemaTypes: -1,  // All
    },
    overageRates: { standard: 0.15, ai: 0.50 },
  },
  freelance: {
    id: 'freelance',
    name: 'Freelance',
    tagline: 'For managing multiple clients',
    price: 149,
    monthlyStandardCredits: 1500,
    monthlyAiCredits: 400,
    maxProjects: 10,
    maxSeats: 1,
    maxStorageBytes: 15 * 1024 * 1024 * 1024,  // 15 GB
    dataRetentionDays: 730,  // 2 years
    features: {
      exports: ['pdf', 'excel', 'csv', 'white_label'],
      teamManagement: false,
      sharedReports: 'branded',
      scheduledAudits: 10,
      whiteLabel: true,
      schemaTypes: -1,
    },
    overageRates: { standard: 0.12, ai: 0.40 },
  },
  agency: {
    id: 'agency',
    name: 'Agency',
    tagline: 'For teams managing unlimited projects',
    price: 299,
    monthlyStandardCredits: 5000,
    monthlyAiCredits: 1500,
    maxProjects: -1,  // Unlimited
    maxSeats: -1,     // Unlimited
    maxStorageBytes: 50 * 1024 * 1024 * 1024,  // 50 GB
    dataRetentionDays: -1,  // Unlimited
    features: {
      exports: ['pdf', 'excel', 'csv', 'white_label'],
      teamManagement: true,
      sharedReports: 'branded',
      scheduledAudits: -1,  // Unlimited
      whiteLabel: true,
      schemaTypes: -1,
    },
    overageRates: { standard: 0.10, ai: 0.30 },
  },
  nonprofit: {
    id: 'nonprofit',
    name: '501(c)(3) Nonprofit',
    tagline: 'Discounted for verified nonprofits',
    price: 49,
    // Same limits as Client
    monthlyStandardCredits: 500,
    monthlyAiCredits: 150,
    maxProjects: 1,
    maxSeats: 1,
    maxStorageBytes: 5 * 1024 * 1024 * 1024,
    dataRetentionDays: 365,
    features: {
      exports: ['pdf', 'excel', 'csv'],
      teamManagement: false,
      sharedReports: 'readonly',
      scheduledAudits: 2,
      whiteLabel: false,
      schemaTypes: -1,
    },
    overageRates: { standard: 0.15, ai: 0.50 },
  }
};

export const CREDIT_COSTS = {
  // Standard credit actions
  project_create: { type: 'standard', cost: 1 },
  export_pdf: { type: 'standard', cost: 2 },
  export_excel: { type: 'standard', cost: 2 },
  audit_upload: { type: 'standard', cost: 5 },
  audit_export: { type: 'standard', cost: 3 },
  accessibility_upload: { type: 'standard', cost: 5 },
  vpat_generate: { type: 'standard', cost: 5 },
  schema_generate: { type: 'standard', cost: 1 },
  schema_bulk: { type: 'standard', cost: 5 },
  image_upload_batch: { type: 'standard', cost: 3 },
  readability_analyze: { type: 'standard', cost: 2 },
  readability_export: { type: 'standard', cost: 2 },
  schedule_audit: { type: 'standard', cost: 3 },
  share_report: { type: 'standard', cost: 1 },

  // AI credit actions
  ai_audit_suggestions: { type: 'ai', cost: 3 },
  ai_accessibility_suggestions: { type: 'ai', cost: 3 },
  ai_meta_title: { type: 'ai', cost: 1 },
  ai_meta_description: { type: 'ai', cost: 1 },
  ai_meta_bulk: { type: 'ai', cost: 8 },
  ai_alt_text: { type: 'ai', cost: 1 },
  ai_alt_text_bulk: { type: 'ai', cost: 8 },
  ai_readability_rewrite: { type: 'ai', cost: 2 },
  ai_competitor_analysis: { type: 'ai', cost: 5 },
  ai_ab_variants: { type: 'ai', cost: 3 },
};

export const CREDIT_PACKS = {
  starter: { standard: 100, ai: 25, price: 15 },
  pro: { standard: 500, ai: 100, price: 60 },
  mega: { standard: 2000, ai: 500, price: 200 },
};
```

---

## 7. Usage Enforcement & Gating

### 7.1 Overview

Usage enforcement is the system that checks credit balances before tool actions execute and gates features based on tier. It operates at two levels:

1. **Credit gating** — Checks if user has sufficient credits before executing a credit-consuming action
2. **Feature gating** — Checks if user's tier permits access to a feature (e.g., team management, white-label exports)

### 7.2 Credit Consumption Flow

```
User clicks action → Frontend checks local credit balance →
  IF sufficient:
    → Call backend POST /api/credits/consume
    → Backend validates server-side balance
    → IF confirmed: Execute action, return updated balance
    → IF insufficient: Return 402 with details
  IF insufficient locally:
    → Show UpgradePrompt immediately (no backend call)
```

### 7.3 Frontend Hook: `useCredits`

**File**: `src/hooks/useCredits.js`

Custom hook that wraps credit checking and consumption. Used by every tool component that has credit-consuming actions.

```javascript
// Usage in components:
const {
  canAfford,        // (action: string) => boolean
  consumeCredits,   // (action: string, toolName: string, resourceId?: string) => Promise
  credits,          // { standard: { remaining, monthly, bonus }, ai: { ... } }
  isLoading,
  showUpgradePrompt // () => void — triggers the UpgradePrompt modal
} = useCredits();

// Before executing an action:
const handleAuditUpload = async () => {
  if (!canAfford('audit_upload')) {
    showUpgradePrompt();
    return;
  }

  const result = await consumeCredits('audit_upload', 'technical_audit', auditId);
  if (!result.success) {
    // Handle insufficient credits (race condition — credits consumed between check and action)
    return;
  }

  // Proceed with actual audit upload logic
  await processAuditUpload(file);
};
```

### 7.4 Feature Gating Hook: `useFeatureGate`

**File**: `src/hooks/useFeatureGate.js`

Checks tier-level feature access. Does not consume credits — purely a permission check.

```javascript
const {
  canAccess,         // (featureName: string) => boolean
  tierRequired,      // (featureName: string) => string — minimum tier needed
  currentTier,       // string
  showUpgradeFor     // (featureName: string) => void — shows upgrade prompt with feature context
} = useFeatureGate();

// Example: Gate team management
if (!canAccess('teamManagement')) {
  return <UpgradePrompt feature="teamManagement" />;
}
```

**Feature names for gating:**

| Feature Name | Gated Tiers (denied) | Notes |
|-------------|---------------------|-------|
| `teamManagement` | basic, client, freelance, nonprofit | Agency only |
| `whiteLabel` | basic, client, nonprofit | Freelance and Agency |
| `exportExcel` | basic | All paid tiers |
| `exportCsv` | basic | All paid tiers |
| `scheduledAudits` | basic | Paid tiers (with count limits) |
| `sharedReports` | basic | Paid tiers (readonly vs branded) |
| `multiProject` | basic, client, nonprofit | Freelance (10), Agency (unlimited) |
| `allSchemaTypes` | basic | Basic limited to 3 types |
| `creditPacks` | basic | Free tier cannot buy packs |
| `autoRefill` | basic | Free tier cannot auto-refill |

### 7.5 Integration Points (Existing Components)

Each existing tool component needs credit gating added at the action level. Here's where to add `useCredits` calls:

| Component | File | Actions to Gate |
|-----------|------|----------------|
| Content Planner | `src/components/projects/ProjectCreationWizard.jsx` | `project_create` |
| Content Planner | `src/components/checklist/PdfExportModal.jsx` | `export_pdf` |
| Technical Audit | `src/components/audit/upload/AuditUploadScreen.jsx` | `audit_upload` |
| Technical Audit | `src/components/audit/ai/AISuggestions.jsx` | `ai_audit_suggestions` |
| Accessibility | `src/components/accessibility/upload/AccessibilityUploadScreen.jsx` | `accessibility_upload` |
| Accessibility | `src/components/accessibility/FixSuggestionsPanel.jsx` | `ai_accessibility_suggestions` |
| Accessibility | `src/components/accessibility/VPATReportGenerator.jsx` | `vpat_generate` |
| Meta Generator | `src/components/meta-generator/upload/MetaUploadScreen.jsx` | `ai_meta_title`, `ai_meta_description` |
| Meta Generator | `src/components/meta-generator/CompetitorAnalysisPanel.jsx` | `ai_competitor_analysis` |
| Meta Generator | `src/components/meta-generator/ABVariantsPanel.jsx` | `ai_ab_variants` |
| Schema Generator | `src/components/schema-generator/SchemaGeneratorPage.jsx` (inferred) | `schema_generate` |
| Image Alt Gen | `src/components/image-alt-generator/upload/ImageAltUploadScreen.jsx` | `image_upload_batch`, `ai_alt_text` |
| Readability | `src/components/readability/ReadabilityInputScreen.jsx` | `readability_analyze` |
| Readability | `src/components/readability/ReadabilityLLMPreview.jsx` | `ai_readability_rewrite` |
| Export Hub | `src/components/export/ExportHubPage.jsx` | `export_pdf`, `export_excel` |
| Reports | `src/components/reports/ScheduledReportsPanel.jsx` | `schedule_audit` |

### 7.6 Soft Gate UX

When a user cannot perform an action (insufficient credits or feature-gated), the UI should:

1. **Never hard-block** — Don't remove buttons or hide features entirely. Show them as disabled with explanation.
2. **Show CreditBadge** — Next to every credit-consuming button, show the credit cost (e.g., "5 credits").
3. **Inline messaging** — When clicked with insufficient credits, show an inline banner:
   ```
   ⚠ This action requires 5 standard credits. You have 2 remaining.
   [Buy Credit Pack] [Upgrade Plan] [Dismiss]
   ```
4. **UpgradePrompt modal** — For feature-gated actions (tier limitation), show a modal:
   ```
   🔒 Team Management is available on the Agency plan.

   Your current plan: Freelance ($149/mo)
   Upgrade to Agency for $299/mo to unlock:
   ✓ Unlimited team seats
   ✓ Unlimited projects
   ✓ 5,000 monthly credits

   [Upgrade to Agency] [Maybe Later]
   ```

### 7.7 Seat Enforcement

For tiers with seat limits (Basic, Client, Freelance, Nonprofit = 1 seat):

- The "Invite Team Member" button in Team Management is hidden for single-seat tiers
- If somehow a second user is added (race condition), backend rejects the invite
- Agency tier has no seat limit — full team management enabled

For project limits:
- "New Project" button shows project count: "Projects: 1/1" for Client, "3/10" for Freelance
- When at limit, "New Project" triggers UpgradePrompt
- Agency shows "Projects: 15/∞"

### 7.8 Storage Enforcement

Storage limits are checked on file upload:
- Before any file upload (audit exports, images), check current storage usage against tier limit
- If upload would exceed limit, show storage upgrade prompt
- Storage usage tracked in `credit_balances` document (add `storageUsedBytes` field)

### 7.9 Data Retention Enforcement

A scheduled backend job (cron or Cloud Scheduler) runs daily:
- Queries `usage_events` and tool-specific data collections
- Deletes records older than the user's `dataRetentionDays` setting
- Basic (30 days): Aggressive cleanup
- Agency (unlimited): No cleanup

### 7.10 Subscription Status Enforcement

When subscription status is not `active`:

| Status | Access Level | UI Treatment |
|--------|-------------|-------------|
| `active` | Full tier access | Normal |
| `trialing` | Full tier access | Trial banner with end date |
| `past_due` | Full tier access (grace period: 7 days) | Red banner: "Payment failed. Update payment method." |
| `past_due` (>7 days) | Reverted to Basic limits | Red banner + UpgradePrompt |
| `canceled` (before period end) | Full tier access until period end | Yellow banner: "Plan cancels on [date]" |
| `canceled` (after period end) | Basic tier limits | Downgrade banner |
| `paused` | Basic tier limits | Blue banner: "Plan paused. [Resume]" |
| `incomplete` | Basic tier limits | Banner: "Complete payment to activate plan" |

---

## 8. Admin Features & Observability

### 8.1 Overview

Admin features extend the existing admin capabilities (see `src/components/admin/UsageAnalyticsDashboard.jsx`) with subscription-specific analytics and management tools. Only users with `role: 'admin'` (from `src/utils/roles.js`) can access these features.

### 8.2 Subscription Admin Dashboard

**Route**: `/app/admin/subscriptions`
**File**: `src/components/admin/SubscriptionDashboard.jsx`

#### 8.2.1 Key Metrics Cards

| Metric | Description |
|--------|-------------|
| Monthly Recurring Revenue (MRR) | Sum of all active subscription amounts |
| Total Subscribers | Count by tier (bar chart breakdown) |
| Churn Rate | % of subscriptions canceled this month |
| New Subscriptions | Count of new subs this period |
| Upgrade/Downgrade Rate | Plan changes this period |
| Average Revenue Per User (ARPU) | MRR / active subscribers |
| Credit Pack Revenue | One-time credit pack sales this period |
| Total Revenue | MRR + credit pack revenue + overage charges |

#### 8.2.2 Charts & Visualizations

- **MRR Trend** — Line chart showing MRR over time (30/60/90 days)
- **Subscribers by Tier** — Stacked bar chart showing subscriber counts per tier over time
- **Credit Usage Distribution** — Heatmap showing which tools consume the most credits
- **Churn Waterfall** — New subscribers vs cancellations vs upgrades vs downgrades per period
- **Revenue Breakdown** — Pie chart: Subscriptions vs Credit Packs vs Overage charges

#### 8.2.3 Subscriber Table

Sortable, filterable table showing all subscribers:

| Column | Description |
|--------|-------------|
| User | Name, email, avatar |
| Tier | Current tier badge |
| Status | Active, Past Due, Paused, Canceled |
| MRR | Monthly amount |
| Credits Used | Standard and AI usage this period (% of allocation) |
| Joined | Subscription start date |
| Actions | View details, manage subscription |

Filters: Tier, Status, Date range, Credit usage threshold

### 8.3 Nonprofit Verification Queue

**Route**: `/app/admin/nonprofits`
**File**: `src/components/admin/NonprofitVerificationQueue.jsx`

Dashboard for managing nonprofit verification requests:

#### 8.3.1 Queue View

Table of pending verification requests:

| Column | Description |
|--------|-------------|
| Organization | Name and EIN |
| Applicant | User name and email |
| Submitted | Date of submission |
| Document | Link to view uploaded 501(c)(3) letter |
| Status | Pending, In Review |
| Actions | Approve, Reject (with reason) |

#### 8.3.2 Review Workflow

1. Admin clicks "Review" on a pending request
2. Document viewer opens (embedded PDF/image viewer)
3. Admin sees organization name, EIN, applicant info
4. Admin clicks "Approve" or "Reject"
   - **Approve**: Backend creates Stripe subscription with nonprofit pricing → sends approval email to user with payment link
   - **Reject**: Admin enters rejection reason → sends rejection email with reason → user can re-apply

#### 8.3.3 Verification History

Tab showing all past verifications (approved, rejected, expired) with search and filter.

### 8.4 Revenue Analytics

**Route**: `/app/admin/revenue`
**File**: `src/components/admin/RevenueAnalytics.jsx`

Deeper revenue analytics beyond the subscription dashboard:

- **Revenue by source**: Subscriptions, credit packs, overage charges
- **Revenue by tier**: Which tiers generate the most revenue
- **LTV estimates**: Average lifetime value per tier based on subscription duration
- **Failed payment tracking**: List of failed invoice payments with amounts
- **Refund tracking**: Any Stripe refunds issued

### 8.5 Usage & Cost Analytics

**Route**: `/app/admin/usage`
**File**: Extended from existing `src/components/admin/UsageAnalyticsDashboard.jsx`

Add to the existing usage analytics dashboard:

- **Credit consumption by tier** — Are any tiers consuming disproportionately?
- **AI cost tracking** — Estimated actual AI API costs based on usage events
- **Margin analysis** — Revenue vs estimated costs per tier
- **Top consumers** — Users consuming the most credits (potential abuse detection)
- **Credit pack purchase patterns** — Which packs sell most, who buys them

### 8.6 Admin API Endpoints

**GET /api/admin/subscriptions/summary** *(Admin only)*

Returns aggregate subscription metrics.

```
Response (200):
{
  mrr: number,
  totalSubscribers: number,
  subscribersByTier: { basic: n, client: n, freelance: n, agency: n, nonprofit: n },
  churnRate: number,
  newSubscriptions: number,
  creditPackRevenue: number,
  overageRevenue: number
}
```

**GET /api/admin/subscriptions/list** *(Admin only)*

Paginated list of all subscriptions with filters.

```
Query params: page, limit, tier, status, sortBy, sortOrder

Response (200):
{
  subscriptions: [ ... ],
  pagination: { ... }
}
```

**GET /api/admin/nonprofit/pending** *(Admin only)*

Returns pending nonprofit verification requests.

**GET /api/admin/revenue/summary** *(Admin only)*

Returns revenue analytics data.

**GET /api/admin/usage/top-consumers** *(Admin only)*

Returns top credit-consuming users for abuse detection.

### 8.7 Alerting & Notifications

Automated alerts sent to admin users:

| Alert | Trigger | Channel |
|-------|---------|---------|
| High churn | >5% churn in a week | Email + in-app notification |
| Payment failure spike | >10 failed payments in 24hr | Email |
| New nonprofit application | Nonprofit verification submitted | In-app notification |
| Credit abuse detection | Single user consuming >80% of tier credits in <7 days | Email + in-app |
| Revenue milestone | MRR crosses $1K, $5K, $10K thresholds | In-app notification |

### 8.8 Data Export (Admin)

Admin can export:
- Subscriber list (CSV)
- Revenue report (CSV)
- Usage analytics (CSV)
- Nonprofit verification log (CSV)

All exports filter by date range and exclude PII where possible (option to include/exclude emails).

---

## 9. User Stories by Implementation Batch

> Each batch is designed to be implemented as an independent unit. Dependencies between batches are noted. User stories follow the format:
> **As a [role], I want [action], so that [benefit].**
> Each story includes acceptance criteria (AC) and the files to create or modify.

---

### BATCH 1: Tier Configuration & Data Model Foundation

**Dependencies**: None (this is the foundation batch)
**Estimated scope**: ~15 files created/modified
**Goal**: Establish all data models, tier constants, and Firestore schemas so subsequent batches have a stable foundation.

---

#### Story 1.1: Create Tier Configuration Constants

**As a** developer, **I want** a single source of truth for tier definitions, credit costs, and pack pricing, **so that** all components reference consistent values.

**AC:**
- [ ] Create `src/config/tiers.js` with `TIER_IDS`, `TIER_CONFIGS`, `CREDIT_COSTS`, and `CREDIT_PACKS` exports (see Section 6.4 for full spec)
- [ ] All 5 tiers defined with: id, name, tagline, price, credit allocations, limits, features, overage rates
- [ ] All standard and AI credit action costs defined
- [ ] All 3 credit pack types defined with quantities and prices
- [ ] File is importable from both frontend components and test files
- [ ] Add unit tests in `src/config/__tests__/tiers.test.js` to validate tier configs are complete and consistent

**Files:**
- Create: `src/config/tiers.js`
- Create: `src/config/__tests__/tiers.test.js`

---

#### Story 1.2: Extend User Document Schema

**As a** developer, **I want** the Firestore user document to include subscription and credit fields, **so that** the frontend can quickly read tier/credit info without extra queries.

**AC:**
- [ ] Modify `signup` function in `src/contexts/AuthContext.jsx` to include new fields on user creation: `tier`, `stripeCustomerId`, `subscriptionId`, `subscriptionStatus`, `creditsRemaining`, `aiCreditsRemaining`, `nonprofitVerified`, `nonprofitVerifiedAt`, `maxProjects`, `maxSeats`, `maxStorageBytes`
- [ ] Default values: `tier: 'basic'`, `stripeCustomerId: null`, `subscriptionId: null`, `subscriptionStatus: 'active'`, `creditsRemaining: 50`, `aiCreditsRemaining: 10`, `nonprofitVerified: false`, `maxProjects: 1`, `maxSeats: 1`, `maxStorageBytes: 104857600`
- [ ] Modify `loginWithGoogle` to also set these defaults for new Google users
- [ ] Existing users without these fields are handled gracefully (fallback to basic tier defaults in reads)
- [ ] Add `tier` and `subscriptionStatus` to the `userProfile` state in AuthContext

**Files:**
- Modify: `src/contexts/AuthContext.jsx`

---

#### Story 1.3: Create SubscriptionContext

**As a** developer, **I want** a React context that provides subscription status, credit balances, and tier-checking helpers throughout the app, **so that** any component can check permissions and credits.

**AC:**
- [ ] Create `src/contexts/SubscriptionContext.jsx` with provider and `useSubscription` hook
- [ ] Context listens to `credit_balances/{userId}` Firestore document in real-time (via `onSnapshot`)
- [ ] Provides: `tier`, `subscription`, `isActive`, `isPaused`, `isPastDue`, `credits` (standard + AI with remaining/monthly/bonus), `tierConfig`, `canUseFeature(featureName)`, `hasCredits(creditType, amount)`, `loading`
- [ ] `canUseFeature` checks against `TIER_CONFIGS[tier].features`
- [ ] `hasCredits` checks remaining + bonus credits against requested amount
- [ ] Wrap `SubscriptionProvider` inside `AuthProvider` in `src/App.jsx`
- [ ] Falls back gracefully when `credit_balances` doc doesn't exist (treats as basic tier)
- [ ] Add unit tests for `canUseFeature` and `hasCredits` logic

**Files:**
- Create: `src/contexts/SubscriptionContext.jsx`
- Modify: `src/App.jsx` (wrap with SubscriptionProvider)
- Create: `src/contexts/__tests__/SubscriptionContext.test.jsx`

---

#### Story 1.4: Create Firestore Security Rules for Billing Collections

**As a** developer, **I want** Firestore security rules that protect billing data, **so that** users can only read their own subscription/credit data and only the backend can write to billing collections.

**AC:**
- [ ] `credit_balances/{userId}`: Users can read their own doc. Only backend (admin SDK) can write.
- [ ] `credit_transactions/{transId}`: Users can read their own transactions (where `userId == request.auth.uid`). Only backend can write.
- [ ] `subscriptions/{subId}`: Users can read their own subscription (where `userId == request.auth.uid`). Only backend can write.
- [ ] `invoices/{invId}`: Users can read their own invoices. Only backend can write.
- [ ] `credit_packs/{packId}`: Users can read their own packs. Only backend can write.
- [ ] `nonprofit_verifications/{userId}`: Users can read their own verification. Only backend can write (except initial submit — users can create their own doc).
- [ ] `usage_events/{eventId}`: Only backend can read and write (admin analytics).
- [ ] Document rules in `firestore.rules` or equivalent config file

**Files:**
- Create or modify: `firestore.rules`

---

#### Story 1.5: Create User Migration Script

**As a** developer, **I want** a one-time migration script that adds tier/credit fields to all existing user documents, **so that** the app works for existing users after deployment.

**AC:**
- [ ] Create `server/scripts/migrate-users.js` (runs via `node server/scripts/migrate-users.js`)
- [ ] Reads all documents in `users` collection
- [ ] For each user without a `tier` field: adds basic tier defaults (same as Story 1.2)
- [ ] Creates corresponding `credit_balances/{userId}` document with basic tier allocations
- [ ] Uses batch writes (max 500 per batch) for efficiency
- [ ] Logs progress and handles errors gracefully
- [ ] Is idempotent — safe to run multiple times
- [ ] Dry-run mode (`--dry-run` flag) that logs changes without writing

**Files:**
- Create: `server/scripts/migrate-users.js`

---

### BATCH 2: Node/Express Backend API

**Dependencies**: Batch 1 (tier configs and data models)
**Estimated scope**: ~20 files created
**Goal**: Stand up the complete backend API server with Stripe integration, webhook handling, and credit management.

---

#### Story 2.1: Initialize Node/Express Server Project

**As a** developer, **I want** a properly initialized Node.js + Express server project, **so that** I have a foundation for all billing API endpoints.

**AC:**
- [ ] Create `server/` directory with `package.json` (name: `csp-billing-api`)
- [ ] Dependencies: `express`, `stripe`, `firebase-admin`, `cors`, `helmet`, `express-rate-limit`, `dotenv`, `multer` (for file uploads)
- [ ] Dev dependencies: `vitest`, `supertest`, `nodemon`
- [ ] Create `server/src/index.js` — Express app with CORS, JSON body parsing, helmet security headers
- [ ] Create `server/.env.example` with all required env vars (see Section 3.11)
- [ ] Create `server/src/config/stripe.js` — Stripe client initialization
- [ ] Create `server/src/config/firebase.js` — Firebase Admin SDK initialization
- [ ] Create `server/src/config/tiers.js` — Mirror of frontend tier configs (server-side copy)
- [ ] Server listens on `PORT` (default 3001)
- [ ] CORS configured for `FRONTEND_URL`
- [ ] Health check endpoint: `GET /health` returns `{ status: 'ok' }`
- [ ] Add `npm run dev` script using nodemon
- [ ] Add `npm run start` script for production

**Files:**
- Create: `server/package.json`
- Create: `server/.env.example`
- Create: `server/src/index.js`
- Create: `server/src/config/stripe.js`
- Create: `server/src/config/firebase.js`
- Create: `server/src/config/tiers.js`

---

#### Story 2.2: Create Authentication Middleware

**As a** developer, **I want** middleware that verifies Firebase ID tokens on API requests, **so that** all billing endpoints are secured to authenticated users.

**AC:**
- [ ] Create `server/src/middleware/auth.js`
- [ ] Reads `Authorization: Bearer <token>` header
- [ ] Verifies token via `admin.auth().verifyIdToken(token)`
- [ ] Attaches `req.user = { uid, email }` on success
- [ ] Fetches user profile from Firestore and attaches `req.userProfile = { tier, role, ... }`
- [ ] Returns 401 for missing/invalid/expired tokens
- [ ] Returns 403 for disabled accounts
- [ ] Create `server/src/middleware/adminOnly.js` — checks `req.userProfile.role === 'admin'`
- [ ] Add unit tests

**Files:**
- Create: `server/src/middleware/auth.js`
- Create: `server/src/middleware/adminOnly.js`
- Create: `server/tests/middleware/auth.test.js`

---

#### Story 2.3: Create Rate Limiter Middleware

**As a** developer, **I want** rate limiting on API endpoints, **so that** the API is protected from abuse.

**AC:**
- [ ] Create `server/src/middleware/rateLimiter.js`
- [ ] Uses `express-rate-limit`
- [ ] Configurable per-route limits (see Section 4.6)
- [ ] Returns 429 with `Retry-After` header when limit exceeded
- [ ] Keyed by user UID (authenticated) or IP (unauthenticated)
- [ ] Error handler middleware: `server/src/middleware/errorHandler.js` — catches unhandled errors, returns consistent error format (see Section 4.5)

**Files:**
- Create: `server/src/middleware/rateLimiter.js`
- Create: `server/src/middleware/errorHandler.js`

---

#### Story 2.4: Implement Checkout Endpoints

**As a** user, **I want** to start a Stripe Checkout session for my chosen plan, **so that** I can securely enter payment info and subscribe.

**AC:**
- [ ] Create `server/src/routes/checkout.js`
- [ ] `POST /api/checkout/create-session`: Creates Stripe Checkout session for subscription (see Section 4.4.1)
  - Creates Stripe customer if user doesn't have one
  - Stores `stripeCustomerId` on user doc
  - Sets `metadata.userId` and `metadata.tier` on checkout session
  - Returns `{ sessionId, url }`
- [ ] `POST /api/checkout/create-pack-session`: Creates Stripe Checkout session for credit pack (one-time payment)
  - Validates pack type
  - Rejects free tier users
  - Returns `{ sessionId, url }`
- [ ] Both endpoints use auth middleware
- [ ] Both endpoints use checkout rate limiter (5/min)
- [ ] Create `server/src/services/checkoutService.js` for business logic
- [ ] Add integration tests

**Files:**
- Create: `server/src/routes/checkout.js`
- Create: `server/src/services/checkoutService.js`
- Create: `server/tests/checkout.test.js`

---

#### Story 2.5: Implement Stripe Webhook Handler

**As a** system, **I want** to process Stripe webhook events, **so that** subscription status, credits, and invoices are kept in sync with Stripe.

**AC:**
- [ ] Create `server/src/routes/webhooks.js`
- [ ] `POST /webhooks/stripe`: Receives Stripe events with raw body for signature verification
- [ ] Create `server/src/services/webhookService.js` with handlers for all events listed in Section 4.4.6:
  - `checkout.session.completed` → Create subscription doc, update user tier, provision credits
  - `customer.subscription.created` → Mirror to Firestore
  - `customer.subscription.updated` → Update status, handle plan changes
  - `customer.subscription.deleted` → Revert to basic tier
  - `customer.subscription.paused` → Update status
  - `customer.subscription.resumed` → Restore tier
  - `invoice.paid` → Store invoice, reset monthly credits (new billing period)
  - `invoice.payment_failed` → Mark as past_due
  - `invoice.finalized` → Store invoice in Firestore
  - `payment_intent.succeeded` → Handle credit pack fulfillment
  - `customer.created` → Store customer ID
- [ ] Each handler is idempotent (checks `processed_events` collection)
- [ ] Webhook signature verified using `STRIPE_WEBHOOK_SECRET`
- [ ] Returns 200 for all events (even unhandled) to prevent Stripe retries
- [ ] Structured logging for all webhook events
- [ ] Add tests with mock Stripe events

**Files:**
- Create: `server/src/routes/webhooks.js`
- Create: `server/src/services/webhookService.js`
- Create: `server/tests/webhooks.test.js`

---

#### Story 2.6: Implement Credit Service

**As a** system, **I want** a credit management service, **so that** credits are consumed, tracked, and reset accurately.

**AC:**
- [ ] Create `server/src/services/creditService.js` with functions:
  - `consumeCredits(userId, action, creditType, amount, toolName, resourceId)` — Deducts credits following priority: monthly → bonus (packs) → overage. Returns result with source and remaining balance.
  - `resetMonthlyCredits(userId, tier)` — Resets monthly allocations (called on billing cycle reset). Does NOT reset bonus credits.
  - `provisionCredits(userId, tier)` — Sets initial credit allocation for new subscription.
  - `addPackCredits(userId, packType, packId)` — Adds bonus credits from a purchased pack.
  - `getBalance(userId)` — Returns full credit balance object.
  - `handleAutoRefill(userId)` — Checks if auto-refill is enabled and triggers pack purchase if balance is 0.
- [ ] All operations use Firestore transactions to prevent race conditions
- [ ] All operations create `credit_transactions` records
- [ ] All operations update denormalized `creditsRemaining`/`aiCreditsRemaining` on user doc
- [ ] Create `server/src/services/usageService.js` — Records `usage_events` for analytics
- [ ] Add comprehensive unit tests

**Files:**
- Create: `server/src/services/creditService.js`
- Create: `server/src/services/usageService.js`
- Create: `server/tests/creditService.test.js`

---

#### Story 2.7: Implement Credit API Routes

**As a** user, **I want** API endpoints to check my credit balance, consume credits, and view history, **so that** the frontend can manage credits.

**AC:**
- [ ] Create `server/src/routes/credits.js` with endpoints (see Section 4.4.3):
  - `GET /api/credits/balance` — Returns full balance
  - `POST /api/credits/consume` — Consumes credits (returns 402 if insufficient)
  - `GET /api/credits/history` — Paginated transaction history
  - `POST /api/credits/auto-refill` — Configure auto-refill
- [ ] All endpoints use auth middleware
- [ ] Consume endpoint uses credit rate limiter (60/min)
- [ ] Balance endpoint uses balance rate limiter (120/min)
- [ ] Add integration tests

**Files:**
- Create: `server/src/routes/credits.js`
- Create: `server/tests/credits.test.js`

---

#### Story 2.8: Implement Subscription Management Routes

**As a** user, **I want** API endpoints to manage my subscription (upgrade, downgrade, cancel, pause, resume), **so that** I have full control over my plan.

**AC:**
- [ ] Create `server/src/routes/subscriptions.js` with endpoints (see Section 4.4.2):
  - `GET /api/subscriptions/current`
  - `POST /api/subscriptions/upgrade` — Uses Stripe proration
  - `POST /api/subscriptions/downgrade` — Schedules change at period end
  - `POST /api/subscriptions/cancel` — Cancels at period end
  - `POST /api/subscriptions/reactivate` — Removes cancel-at-period-end
  - `POST /api/subscriptions/pause` — Pauses with optional resume date
  - `POST /api/subscriptions/resume` — Resumes immediately
- [ ] Create `server/src/services/subscriptionService.js` for business logic
- [ ] All endpoints use auth middleware and subscription rate limiter
- [ ] Upgrade validates tier ordering (can't "upgrade" to a lower tier)
- [ ] Downgrade takes effect at period end (no immediate change)
- [ ] Add integration tests

**Files:**
- Create: `server/src/routes/subscriptions.js`
- Create: `server/src/services/subscriptionService.js`
- Create: `server/tests/subscriptions.test.js`

---

#### Story 2.9: Implement Billing & Invoice Routes

**As a** user, **I want** to access my invoices and manage payment methods via Stripe Customer Portal, **so that** I can review my billing history and update payment info.

**AC:**
- [ ] Create `server/src/routes/billing.js` with endpoints (see Section 4.4.4):
  - `POST /api/billing/portal-session` — Creates Stripe Customer Portal session
  - `GET /api/billing/invoices` — Paginated invoice history from Firestore
- [ ] Portal session configured with return URL
- [ ] Invoice endpoint supports status filter and pagination
- [ ] All endpoints use auth middleware
- [ ] Add tests

**Files:**
- Create: `server/src/routes/billing.js`
- Create: `server/tests/billing.test.js`

---

#### Story 2.10: Implement Nonprofit Verification Routes

**As a** nonprofit user, **I want** to submit my 501(c)(3) verification documents, **so that** I can receive the discounted nonprofit pricing.

**AC:**
- [ ] Create `server/src/routes/nonprofit.js` with endpoints (see Section 4.4.5):
  - `POST /api/nonprofit/submit-verification` — Multipart upload (uses multer)
  - `GET /api/nonprofit/verification-status`
  - `POST /api/nonprofit/review` — Admin-only approve/reject
- [ ] Create `server/src/services/nonprofitService.js`
- [ ] Document uploaded to Firebase Storage at `nonprofits/{userId}/{filename}`
- [ ] On approval: Creates Stripe subscription with nonprofit pricing, updates user tier
- [ ] On rejection: Sends notification with reason, user remains on basic
- [ ] Verification expires after 1 year — background job checks and flags expired
- [ ] Add tests

**Files:**
- Create: `server/src/routes/nonprofit.js`
- Create: `server/src/services/nonprofitService.js`
- Create: `server/tests/nonprofit.test.js`

---

#### Story 2.11: Wire Up All Routes and Middleware

**As a** developer, **I want** all routes and middleware registered in the Express app, **so that** the server is fully functional.

**AC:**
- [ ] Update `server/src/index.js` to register all routes:
  - `/webhooks/stripe` (raw body parser, no auth)
  - `/api/checkout/*` (JSON parser, auth)
  - `/api/subscriptions/*` (JSON parser, auth)
  - `/api/credits/*` (JSON parser, auth)
  - `/api/billing/*` (JSON parser, auth)
  - `/api/nonprofit/*` (JSON/multipart parser, auth)
  - `/api/admin/*` (JSON parser, auth + admin)
- [ ] Global error handler registered last
- [ ] Webhook route registered BEFORE `express.json()` middleware (needs raw body)
- [ ] Add structured logging utility (`server/src/utils/logger.js`)
- [ ] Verify server starts and all routes respond

**Files:**
- Modify: `server/src/index.js`
- Create: `server/src/utils/logger.js`

---

### BATCH 3: Public Pricing Page

**Dependencies**: Batch 1 (tier configs)
**Estimated scope**: ~5 files created/modified
**Goal**: Build the public-facing pricing page with tier cards, feature comparison, and CTAs.

---

#### Story 3.1: Create Public Pricing Page Component

**As a** visitor, **I want** to see a pricing page with all available plans, **so that** I can compare options and choose the right plan.

**AC:**
- [ ] Create `src/components/public/PricingPage.jsx`
- [ ] Hero section with heading "Simple, transparent pricing" and subtitle
- [ ] 5 pricing tier cards in a responsive grid (1 col mobile, 2 col tablet, 5 col desktop; stacks gracefully)
- [ ] Each card shows: tier name, tagline, price (formatted as "$99/mo"), credit allocation, 5-6 feature bullets, CTA button
- [ ] Freelance card has "Most Popular" badge and visually elevated styling (ring border, larger shadow)
- [ ] Nonprofit card has "50% off" badge and emerald accent
- [ ] Agency card uses dark/premium styling
- [ ] Basic card uses subtle gray styling
- [ ] CTA buttons link to `/register?tier={tierId}` for unauthenticated users
- [ ] If user is authenticated (via `useAuth`): CTA shows "Upgrade" for lower tiers, "Current Plan" (disabled) for current tier, "Downgrade" for higher-to-lower
- [ ] Uses `SEOHead` with pricing-specific title, description, and `Product` JSON-LD structured data
- [ ] All tier data pulled from `TIER_CONFIGS` in `src/config/tiers.js` — no hardcoded prices
- [ ] Fully responsive and accessible (keyboard navigation, ARIA labels, proper heading hierarchy)
- [ ] Matches existing public page design language (see `LandingPage.jsx`, `FeaturesPage.jsx`)

**Files:**
- Create: `src/components/public/PricingPage.jsx`

---

#### Story 3.2: Create Feature Comparison Table

**As a** visitor, **I want** to see a detailed comparison of features across all plans, **so that** I can make an informed decision.

**AC:**
- [ ] Create `src/components/public/PricingComparisonTable.jsx` (imported by PricingPage)
- [ ] Full-width table comparing all 5 tiers across all categories (see Section 5.1.3)
- [ ] Categories: Tools, Credits, Limits, Exports, Collaboration, Support, Overages
- [ ] Each category is collapsible/expandable (default: expanded)
- [ ] Uses checkmarks (green), X marks (red), and specific values
- [ ] Horizontal scroll on mobile with sticky first column (feature names)
- [ ] Tier column headers match card styling (colors, badges)
- [ ] Accessible: proper `<table>` semantics, `scope` attributes, `aria-label` on icons

**Files:**
- Create: `src/components/public/PricingComparisonTable.jsx`

---

#### Story 3.3: Create Credit Explainer and FAQ Sections

**As a** visitor, **I want** to understand how credits work and get answers to common questions, **so that** I feel confident choosing a plan.

**AC:**
- [ ] Add credit explainer section to `PricingPage.jsx` (see Section 5.1.4):
  - Two-column layout: Standard Credits vs AI Credits with icons
  - 4-5 example actions with credit costs
  - Visual credit meter showing typical monthly usage per tier
  - "What happens when credits run out?" callout with credit pack info
- [ ] Add FAQ section to `PricingPage.jsx` (see Section 5.1.5):
  - Accordion-style (click to expand/collapse)
  - 10 FAQ items covering credits, upgrades, cancellation, nonprofit, etc.
  - Accessible: uses `<details>`/`<summary>` or equivalent with ARIA
- [ ] Add bottom CTA section: "Start free today" button linking to `/register?tier=basic`

**Files:**
- Modify: `src/components/public/PricingPage.jsx`

---

#### Story 3.4: Add Pricing Route and Navigation Link

**As a** visitor, **I want** to navigate to the pricing page from the site navigation, **so that** I can easily find pricing info.

**AC:**
- [ ] Add `<Route path="/pricing" element={<PricingPage />} />` to `src/App.jsx` in the public routes section (near line 172)
- [ ] Add lazy import for `PricingPage` at top of `App.jsx`
- [ ] Add "Pricing" link to `src/components/public/PublicNavigation.jsx` between "Features" and "Help Center"
- [ ] Add "Pricing" link to the landing page CTA section and footer
- [ ] Add redirect: `/plans` → `/pricing` for SEO flexibility
- [ ] Add pricing page to sitemap config if one exists (`src/config/seo.js`)
- [ ] Verify pricing page loads correctly at `/pricing` for both authenticated and unauthenticated users

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/public/PublicNavigation.jsx`
- Modify: `src/components/public/LandingPage.jsx` (add pricing CTA link)
- Modify: `src/config/seo.js` (add pricing page SEO config)

---

### BATCH 4: Registration Flow Updates

**Dependencies**: Batch 1 (tier configs, SubscriptionContext), Batch 2 (checkout API endpoints)
**Estimated scope**: ~6 files created/modified
**Goal**: Update the registration flow to support tier selection and Stripe Checkout integration.

---

#### Story 4.1: Add Tier Selection to Registration Flow

**As a** new user, **I want** to select a plan during registration, **so that** I can sign up and subscribe in one flow.

**AC:**
- [ ] Modify `src/components/auth/RegisterForm.jsx`:
  - Read `tier` from URL search params via `useSearchParams`
  - Add step state machine: `account_details` → `plan_confirmation` → `checkout`
  - Step 1 (account_details): Existing registration form (unchanged)
  - Step 2 (plan_confirmation): Show selected tier details (visible only for paid tiers)
  - Step indicator showing current step (1/2 or 1/3)
  - For `tier=basic` or no tier param: Skip step 2 entirely (current behavior)
  - For paid tiers: After account creation, show plan confirmation before Stripe redirect
- [ ] Create `src/components/auth/PlanConfirmationStep.jsx`:
  - Displays: tier name, price, credit allocation, key features (from `TIER_CONFIGS`)
  - "Confirm & Pay" button that calls backend checkout API
  - "Change Plan" link back to pricing page
  - Shows what the user will be charged today
- [ ] Ensure Google OAuth flow also supports tier pre-selection

**Files:**
- Modify: `src/components/auth/RegisterForm.jsx`
- Create: `src/components/auth/PlanConfirmationStep.jsx`

---

#### Story 4.2: Integrate Stripe Checkout Redirect

**As a** new user selecting a paid plan, **I want** to be redirected to Stripe Checkout after registration, **so that** I can securely enter my payment info.

**AC:**
- [ ] After account creation (Firebase Auth + Firestore doc), call `POST /api/checkout/create-session` with selected tier
- [ ] Pass Firebase ID token in Authorization header
- [ ] On success: Redirect to Stripe Checkout URL (`window.location.href = response.url`)
- [ ] Set success URL to `/app?subscription=success`
- [ ] Set cancel URL to `/app?subscription=canceled`
- [ ] Handle errors: Show inline error message if checkout session creation fails
- [ ] Create `src/lib/api.js` — API client utility for making authenticated requests to the backend
  - Includes helper to get current user's Firebase ID token
  - Base URL from `VITE_API_URL` env var
  - Handles 401 responses (token expired → refresh → retry)

**Files:**
- Create: `src/lib/api.js`
- Modify: `src/components/auth/RegisterForm.jsx`

---

#### Story 4.3: Create Registration Success Handler

**As a** new paid user, **I want** to see a welcome message after successful payment, **so that** I know my account is set up and ready.

**AC:**
- [ ] Create `src/components/auth/RegistrationSuccess.jsx`:
  - Welcome modal/page shown when URL contains `?subscription=success`
  - Displays: "Welcome to [Tier Name]!", credit allocation, getting-started tips
  - "Get Started" button dismisses modal and navigates to dashboard
  - Shows for both new registrations and plan upgrades
- [ ] Handle `?subscription=canceled` URL param:
  - Show info banner: "Payment was not completed. You're on the free plan."
  - "Try again" link back to pricing page
- [ ] Integrate into `src/App.jsx` or home page component to detect URL params on mount

**Files:**
- Create: `src/components/auth/RegistrationSuccess.jsx`
- Modify: `src/components/home/HomePage.jsx` (detect subscription URL params)

---

#### Story 4.4: Add Nonprofit Verification to Registration

**As a** nonprofit user, **I want** to submit my 501(c)(3) verification during registration, **so that** I can get the discounted pricing.

**AC:**
- [ ] Create `src/components/auth/NonprofitVerificationStep.jsx`:
  - Form fields: Organization name, EIN (Employer Identification Number)
  - File upload for 501(c)(3) determination letter (accepts PDF, PNG, JPG; max 10MB)
  - Uses `react-dropzone` (already a project dependency)
  - "Submit for Verification" button calls `POST /api/nonprofit/submit-verification`
  - After submit: Shows "Verification pending" status with explanation
  - User is created on Basic tier; upgraded to Nonprofit after admin approval
- [ ] Modify `RegisterForm.jsx` to show nonprofit verification step when `tier=nonprofit`
- [ ] Flow: Account Details → Nonprofit Verification → Success (pending verification)

**Files:**
- Create: `src/components/auth/NonprofitVerificationStep.jsx`
- Modify: `src/components/auth/RegisterForm.jsx`

---

### BATCH 5: In-App Billing & Account Management

**Dependencies**: Batch 1 (SubscriptionContext), Batch 2 (all billing API endpoints)
**Estimated scope**: ~10 files created/modified
**Goal**: Build all authenticated billing pages — dashboard, invoices, plan management, credit history.

---

#### Story 5.1: Create Billing Dashboard

**As a** subscriber, **I want** a billing dashboard showing my current plan, credit usage, and quick actions, **so that** I can manage my subscription.

**AC:**
- [ ] Create `src/components/billing/BillingDashboard.jsx` (see Section 5.2 for full layout spec)
- [ ] CurrentPlanCard component: Shows tier badge, price, status, next billing date, action buttons (Upgrade, Pause, Cancel)
- [ ] CreditUsageGauge component: Two progress bars (standard + AI credits). Color-coded: green >50%, yellow 25-50%, red <25%. Shows "Resets: [date]"
- [ ] Bonus credits display below gauges
- [ ] "Buy Credit Pack" button
- [ ] Quick actions row: "Manage Payment Method" (Stripe portal), "View Invoices", "Auto-Refill Settings"
- [ ] Recent usage activity list (last 10 credit transactions)
- [ ] "View Full History" link to credit history page
- [ ] For Basic (free) tier: Shows simplified view with upgrade CTA instead of billing details
- [ ] Uses `useSubscription` context for data
- [ ] Calls `GET /api/credits/balance` and `GET /api/credits/history?limit=10` on mount

**Files:**
- Create: `src/components/billing/BillingDashboard.jsx`

---

#### Story 5.2: Create Credit Pack Purchase Modal

**As a** subscriber, **I want** to purchase additional credit packs, **so that** I can continue using tools when my monthly credits run out.

**AC:**
- [ ] Create `src/components/billing/CreditPackModal.jsx`
- [ ] Modal with 3 pack options: Starter ($15), Pro ($60), Mega ($200)
- [ ] Each option shows: pack name, standard credits, AI credits, price, price-per-credit calculation
- [ ] "Buy Now" button calls `POST /api/checkout/create-pack-session` → redirects to Stripe Checkout
- [ ] Disabled for Basic (free) tier users with "Upgrade to purchase credit packs" message
- [ ] Accessible: focus trap, escape to close, proper ARIA attributes

**Files:**
- Create: `src/components/billing/CreditPackModal.jsx`

---

#### Story 5.3: Create Invoice History Page

**As a** subscriber, **I want** to view my invoice history, **so that** I can track my payments and download receipts.

**AC:**
- [ ] Create `src/components/billing/InvoiceHistory.jsx`
- [ ] Paginated table with columns: Invoice #, Date, Amount, Status (badge), Actions
- [ ] Status badges: Paid (green), Open (yellow), Void (gray)
- [ ] Actions: "View" (opens Stripe-hosted invoice in new tab), "Download PDF"
- [ ] Status filter dropdown (All, Paid, Open, Void)
- [ ] Calls `GET /api/billing/invoices` with pagination and filter params
- [ ] Empty state for users with no invoices
- [ ] Back link to billing dashboard

**Files:**
- Create: `src/components/billing/InvoiceHistory.jsx`

---

#### Story 5.4: Create Plan Management Page

**As a** subscriber, **I want** to upgrade, downgrade, or change my plan, **so that** I can adjust my subscription as my needs change.

**AC:**
- [ ] Create `src/components/billing/PlanManagement.jsx`
- [ ] Shows current plan highlighted with "Current" badge
- [ ] All other plans shown side-by-side with comparison of what changes
- [ ] Upgrade: Shows prorated cost, "Upgrade Now" button, confirmation modal
- [ ] Downgrade: Shows "Takes effect [date]" note, "Schedule Downgrade" button, confirmation modal
- [ ] Confirmation modals explain exactly what will happen (immediate charge vs end-of-period change)
- [ ] Calls appropriate subscription API endpoints on confirm
- [ ] After successful change: Shows success toast, updates SubscriptionContext
- [ ] Back link to billing dashboard

**Files:**
- Create: `src/components/billing/PlanManagement.jsx`

---

#### Story 5.5: Create Credit History Page

**As a** subscriber, **I want** to see a detailed log of all my credit transactions, **so that** I can understand my usage patterns.

**AC:**
- [ ] Create `src/components/billing/CreditHistory.jsx`
- [ ] Table with columns: Date/Time, Action (with tool icon), Credit Type, Amount (+/-), Balance After
- [ ] Filter by credit type: All, Standard, AI
- [ ] Date range picker (uses existing `react-datepicker` dependency)
- [ ] Pagination (50 per page)
- [ ] "Export to CSV" button
- [ ] Calls `GET /api/credits/history` with filters
- [ ] Color coding: debits in red, credits/resets in green
- [ ] Back link to billing dashboard

**Files:**
- Create: `src/components/billing/CreditHistory.jsx`

---

#### Story 5.6: Create Auto-Refill Settings Component

**As a** subscriber, **I want** to configure auto-refill for credit packs, **so that** I never get interrupted by running out of credits.

**AC:**
- [ ] Create `src/components/billing/AutoRefillSettings.jsx` (used within BillingDashboard)
- [ ] Toggle switch to enable/disable auto-refill
- [ ] Dropdown to select pack type (Starter, Pro, Mega) when enabled
- [ ] Shows: "Auto-purchases this month: 1/3" with cap explanation
- [ ] Calls `POST /api/credits/auto-refill` on save
- [ ] Warning text: "Auto-refill will purchase up to 3 packs per month when your balance reaches 0"
- [ ] Disabled for Basic tier

**Files:**
- Create: `src/components/billing/AutoRefillSettings.jsx`

---

#### Story 5.7: Create Nonprofit Verification Status Page

**As a** nonprofit user, **I want** to check the status of my verification and manage re-verification, **so that** I can maintain my discounted pricing.

**AC:**
- [ ] Create `src/components/billing/NonprofitVerification.jsx`
- [ ] Shows current verification status with visual tracker: Submitted → In Review → Approved/Rejected
- [ ] If approved: Shows organization name, verified date, expiration date
- [ ] If rejected: Shows rejection reason and "Re-apply" button
- [ ] If expired: Shows "Re-verification required" prompt with upload form
- [ ] If no verification: Shows application form (same as registration nonprofit step)
- [ ] Calls `GET /api/nonprofit/verification-status` on mount
- [ ] Only accessible to users on nonprofit tier or applying for it

**Files:**
- Create: `src/components/billing/NonprofitVerification.jsx`

---

#### Story 5.8: Add Billing Routes to App Router

**As a** developer, **I want** all billing pages properly routed, **so that** users can navigate to billing features.

**AC:**
- [ ] Add routes to `src/App.jsx`:
  - `/app/billing` → `BillingDashboard`
  - `/app/billing/invoices` → `InvoiceHistory`
  - `/app/billing/plans` → `PlanManagement`
  - `/app/billing/credits` → `CreditHistory`
  - `/app/billing/nonprofit` → `NonprofitVerification`
- [ ] All billing routes wrapped in `ProtectedRoute`
- [ ] Add lazy imports for all billing components
- [ ] Add "Billing" link to authenticated navigation/sidebar
- [ ] Add credit balance indicator to app header (compact: "Credits: 350 | AI: 90")
- [ ] Redirect `/billing` → `/app/billing`

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/layouts/ToolLayout.jsx` or relevant navigation component (add Billing nav item and credit indicator)

---

### BATCH 6: Usage Enforcement & Feature Gating

**Dependencies**: Batch 1 (SubscriptionContext, tier configs), Batch 2 (credit consume API)
**Estimated scope**: ~20 files modified
**Goal**: Integrate credit checking and feature gating into all existing tool components.

---

#### Story 6.1: Create useCredits Hook

**As a** developer, **I want** a reusable hook for checking and consuming credits, **so that** I can easily gate tool actions across the app.

**AC:**
- [ ] Create `src/hooks/useCredits.js` (see Section 7.3 for full spec)
- [ ] Provides: `canAfford(action)`, `consumeCredits(action, toolName, resourceId)`, `credits`, `isLoading`, `showUpgradePrompt()`
- [ ] `canAfford` looks up action in `CREDIT_COSTS`, checks balance from SubscriptionContext
- [ ] `consumeCredits` calls `POST /api/credits/consume` via api client, updates local state on success
- [ ] Handles 402 responses (insufficient credits) — returns structured error with upgrade options
- [ ] Uses `useSubscription` context internally
- [ ] Add unit tests

**Files:**
- Create: `src/hooks/useCredits.js`
- Create: `src/hooks/__tests__/useCredits.test.js`

---

#### Story 6.2: Create useFeatureGate Hook

**As a** developer, **I want** a reusable hook for checking tier-based feature access, **so that** I can gate features that are tier-restricted.

**AC:**
- [ ] Create `src/hooks/useFeatureGate.js` (see Section 7.4 for full spec)
- [ ] Provides: `canAccess(featureName)`, `tierRequired(featureName)`, `currentTier`, `showUpgradeFor(featureName)`
- [ ] Feature names map to tier config feature flags (see Section 7.4 table)
- [ ] Returns minimum tier required for a feature
- [ ] Uses `useSubscription` context internally
- [ ] Add unit tests

**Files:**
- Create: `src/hooks/useFeatureGate.js`
- Create: `src/hooks/__tests__/useFeatureGate.test.js`

---

#### Story 6.3: Create Shared Gating UI Components

**As a** user, **I want** clear visual feedback about credit costs and upgrade paths, **so that** I understand the value of upgrading.

**AC:**
- [ ] Create `src/components/shared/CreditBadge.jsx`:
  - Small inline badge: "5 credits" or "3 AI credits" with coin icon
  - Props: `action` (looks up cost from `CREDIT_COSTS`), `size` ('sm' | 'md')
  - Color: default gray, yellow when <25% credits remaining, red when can't afford
- [ ] Create `src/components/shared/UpgradePrompt.jsx`:
  - Modal variant: Full upgrade modal with plan comparison and CTA
  - Banner variant: Inline banner with dismiss button
  - Props: `feature` (for feature gate), `action` (for credit gate), `variant` ('modal' | 'banner')
  - Shows current plan, recommended upgrade, and benefits of upgrading
  - "Upgrade" button links to `/app/billing/plans`
  - "Buy Credits" button opens CreditPackModal (if credit-gated)
- [ ] Create `src/components/shared/TierBadge.jsx`:
  - Small badge showing tier name with tier-appropriate color
  - Props: `tier` string
  - Used in profile, billing, admin views
- [ ] Create `src/components/shared/SubscriptionBanner.jsx`:
  - Persistent banner for non-active subscription states (past_due, canceled, paused, incomplete)
  - Color and messaging per status (see Section 7.10)
  - Dismissible for "canceled before period end" and "trialing"
  - Not dismissible for past_due and incomplete
  - Placed at top of app layout

**Files:**
- Create: `src/components/shared/CreditBadge.jsx`
- Create: `src/components/shared/UpgradePrompt.jsx`
- Create: `src/components/shared/TierBadge.jsx`
- Create: `src/components/shared/SubscriptionBanner.jsx`

---

#### Story 6.4: Integrate Credit Gating into Tool Components

**As a** user on a limited plan, **I want** to see credit costs on actions and be prompted to upgrade when I run out, **so that** I understand the value and can purchase more.

**AC:**
- [ ] Add `useCredits` hook and `CreditBadge` to all components listed in Section 7.5:
  - `ProjectCreationWizard.jsx` — Gate `project_create`
  - `PdfExportModal.jsx` — Gate `export_pdf`
  - `AuditUploadScreen.jsx` — Gate `audit_upload`
  - `AISuggestions.jsx` — Gate `ai_audit_suggestions`
  - `AccessibilityUploadScreen.jsx` — Gate `accessibility_upload`
  - `FixSuggestionsPanel.jsx` — Gate `ai_accessibility_suggestions`
  - `VPATReportGenerator.jsx` — Gate `vpat_generate`
  - `MetaUploadScreen.jsx` — Gate `ai_meta_title`, `ai_meta_description`
  - `CompetitorAnalysisPanel.jsx` — Gate `ai_competitor_analysis`
  - `ABVariantsPanel.jsx` — Gate `ai_ab_variants`
  - `ImageAltUploadScreen.jsx` — Gate `image_upload_batch`, `ai_alt_text`
  - `ReadabilityInputScreen.jsx` — Gate `readability_analyze`
  - `ReadabilityLLMPreview.jsx` — Gate `ai_readability_rewrite`
  - `ExportHubPage.jsx` — Gate `export_pdf`, `export_excel`
  - `ScheduledReportsPanel.jsx` — Gate `schedule_audit`
- [ ] Pattern for each component:
  1. Import `useCredits` hook
  2. Add `CreditBadge` next to action button
  3. Wrap action handler with `canAfford` check → `consumeCredits` call → then original action
  4. Show `UpgradePrompt` if insufficient credits
- [ ] Do NOT break existing functionality — if credit check fails, show prompt but don't crash

**Files:**
- Modify: All 15+ components listed above (see Section 7.5 for full file paths)

---

#### Story 6.5: Integrate Feature Gating

**As a** user on a limited plan, **I want** to see which features require an upgrade, **so that** I understand the value of higher tiers.

**AC:**
- [ ] Add `useFeatureGate` checks to:
  - Team Management page — Gate `teamManagement` (Agency only)
  - Export Hub — Gate `exportExcel`, `exportCsv` (paid tiers only)
  - Scheduled Reports — Gate `scheduledAudits` (paid tiers with count limits)
  - Shared Reports — Gate `sharedReports` (paid tiers)
  - Schema Generator — Gate `allSchemaTypes` (Basic limited to 3 types)
  - Project Creation — Gate `multiProject` (check project count against tier limit)
- [ ] For gated features: Show disabled state with `UpgradePrompt` explaining which tier unlocks the feature
- [ ] Add project count display: "Projects: 1/1" or "3/10" or "15/∞" in project dashboard
- [ ] Add `SubscriptionBanner` to main app layout for non-active subscription states

**Files:**
- Modify: `src/components/projects/TeamManagementPage.jsx`
- Modify: `src/components/export/ExportHubPage.jsx`
- Modify: `src/components/reports/ScheduledReportsPanel.jsx`
- Modify: `src/components/projects/ProjectCreationWizard.jsx`
- Modify: `src/components/projects/ProjectDashboard.jsx`
- Modify: `src/components/layouts/ToolLayout.jsx` (add SubscriptionBanner)

---

### BATCH 7: Admin Features & Observability

**Dependencies**: Batch 1 (data models), Batch 2 (admin API endpoints)
**Estimated scope**: ~5 files created/modified
**Goal**: Build admin dashboards for subscription management, nonprofit verification, and revenue analytics.

---

#### Story 7.1: Create Subscription Admin Dashboard

**As an** admin, **I want** a dashboard showing subscription metrics, revenue, and subscriber details, **so that** I can monitor the business health.

**AC:**
- [ ] Create `src/components/admin/SubscriptionDashboard.jsx` (see Section 8.2)
- [ ] Key metrics cards: MRR, Total Subscribers, Churn Rate, New Subscriptions, ARPU, Credit Pack Revenue, Total Revenue
- [ ] Charts (using existing `chart.js` + `react-chartjs-2` dependencies):
  - MRR trend line chart (30/60/90 day toggle)
  - Subscribers by tier bar chart
  - Revenue breakdown pie chart
- [ ] Subscriber table: sortable, filterable by tier/status, paginated
- [ ] Calls `GET /api/admin/subscriptions/summary` and `GET /api/admin/subscriptions/list`
- [ ] Admin-only access (check `userProfile.role === 'admin'`)

**Files:**
- Create: `src/components/admin/SubscriptionDashboard.jsx`

---

#### Story 7.2: Create Nonprofit Verification Queue

**As an** admin, **I want** to review and approve/reject nonprofit verification requests, **so that** only legitimate nonprofits get the discounted pricing.

**AC:**
- [ ] Create `src/components/admin/NonprofitVerificationQueue.jsx` (see Section 8.3)
- [ ] Pending queue table: Organization, Applicant, Submitted date, Document link, Actions
- [ ] Review modal: Shows document (PDF/image viewer), organization details, EIN
- [ ] "Approve" button: Calls `POST /api/nonprofit/review` with `decision: 'approved'`
- [ ] "Reject" button: Opens text input for rejection reason, then calls API
- [ ] Verification history tab: All past verifications with search and filter
- [ ] Calls `GET /api/admin/nonprofit/pending` for queue
- [ ] Real-time badge showing count of pending requests

**Files:**
- Create: `src/components/admin/NonprofitVerificationQueue.jsx`

---

#### Story 7.3: Extend Usage Analytics Dashboard

**As an** admin, **I want** credit consumption and cost analytics, **so that** I can ensure pricing covers costs and detect abuse.

**AC:**
- [ ] Extend existing `src/components/admin/UsageAnalyticsDashboard.jsx`:
  - Add "Credits" tab/section alongside existing tool usage
  - Credit consumption by tier chart
  - AI cost estimation based on usage events
  - Top 10 credit consumers table
  - Credit pack purchase patterns
- [ ] Calls `GET /api/admin/usage/top-consumers`
- [ ] Add margin analysis section: Revenue vs estimated costs per tier

**Files:**
- Modify: `src/components/admin/UsageAnalyticsDashboard.jsx`

---

#### Story 7.4: Add Admin Routes

**As an** admin, **I want** admin billing pages routed in the app, **so that** I can navigate to them.

**AC:**
- [ ] Add routes to `src/App.jsx`:
  - `/app/admin/subscriptions` → `SubscriptionDashboard`
  - `/app/admin/nonprofits` → `NonprofitVerificationQueue`
- [ ] Routes wrapped in `ProtectedRoute` and admin role check
- [ ] Add links in admin navigation (if an admin nav exists, otherwise add to settings/profile)
- [ ] Add lazy imports

**Files:**
- Modify: `src/App.jsx`

---

## 10. Implementation Notes & Conventions

### 10.1 Code Conventions

- Follow existing project patterns: functional components, hooks, Tailwind CSS utility classes
- Use existing color system: `primary`, `charcoal`, `emerald`, `cyan`, `amber`, `rose`, `violet`
- Import icons from `lucide-react` (already a dependency)
- Use `react-hot-toast` for success/error notifications (already a dependency)
- Use `react-hook-form` for complex forms (already a dependency)
- API calls use the `src/lib/api.js` client (created in Batch 4)

### 10.2 Testing Strategy

- Unit tests for tier configs, credit calculations, and hook logic (using `vitest`)
- Integration tests for API endpoints (using `supertest` in server tests)
- Component tests for critical UI flows (using `@testing-library/react`)
- Manual testing of Stripe Checkout and webhook flows (use Stripe CLI for local webhook testing)

### 10.3 Stripe Testing

- Use Stripe test mode for all development
- Test card numbers: `4242 4242 4242 4242` (success), `4000 0000 0000 0002` (decline)
- Use Stripe CLI for local webhook forwarding: `stripe listen --forward-to localhost:3001/webhooks/stripe`
- Test all webhook event types before deploying

### 10.4 Environment Setup Checklist

1. Create Stripe account and get test API keys
2. Create Products, Prices, and Coupons in Stripe Dashboard (see Section 3.10)
3. Configure Stripe Customer Portal settings (payment methods, invoice history, cancellation)
4. Set up Stripe webhook endpoint (test with CLI, then configure in Stripe Dashboard for production)
5. Create `server/.env` with all required variables (see Section 3.11)
6. Add `VITE_API_URL` and `VITE_STRIPE_PUBLISHABLE_KEY` to frontend `.env`
7. Run user migration script (Story 1.5)

### 10.5 Deployment Considerations

- Backend server needs to be deployed separately from the Vite SPA (e.g., Railway, Render, Fly.io, or Firebase Cloud Run)
- Stripe webhook URL must be updated to production URL after deployment
- CORS origins must be updated for production frontend URL
- Firebase Admin SDK credentials must be securely stored (environment variables, not committed)
- Enable Stripe production mode and swap API keys for go-live

### 10.6 Security Considerations

- Never log full Stripe webhook payloads (may contain PII)
- Never store raw card data (all handled by Stripe)
- Firebase Admin SDK private key must never be exposed to frontend
- Rate limit all API endpoints to prevent abuse
- Validate all inputs server-side (don't trust frontend validation alone)
- Use Stripe webhook signature verification to prevent spoofed events
- Implement CSRF protection on state-changing endpoints

---

## Appendix A: Batch Dependency Graph

```
Batch 1: Data Model Foundation
    │
    ├──> Batch 2: Backend API (depends on Batch 1)
    │        │
    │        ├──> Batch 4: Registration Flow (depends on Batch 1 + 2)
    │        │
    │        ├──> Batch 5: Billing UI (depends on Batch 1 + 2)
    │        │
    │        └──> Batch 7: Admin Features (depends on Batch 1 + 2)
    │
    ├──> Batch 3: Pricing Page (depends on Batch 1 only)
    │
    └──> Batch 6: Usage Enforcement (depends on Batch 1 + 2)
```

**Recommended execution order**: 1 → 2 → 3 (parallel with 2) → 4 → 5 → 6 → 7

Batch 3 (Pricing Page) can be built in parallel with Batch 2 since it only depends on Batch 1 (tier configs) and doesn't need the backend API.

---

## Appendix B: File Manifest

### New Files to Create

| File | Batch | Type |
|------|-------|------|
| `src/config/tiers.js` | 1 | Config |
| `src/config/__tests__/tiers.test.js` | 1 | Test |
| `src/contexts/SubscriptionContext.jsx` | 1 | Context |
| `src/contexts/__tests__/SubscriptionContext.test.jsx` | 1 | Test |
| `firestore.rules` | 1 | Config |
| `server/package.json` | 2 | Config |
| `server/.env.example` | 2 | Config |
| `server/src/index.js` | 2 | Server |
| `server/src/config/stripe.js` | 2 | Config |
| `server/src/config/firebase.js` | 2 | Config |
| `server/src/config/tiers.js` | 2 | Config |
| `server/src/middleware/auth.js` | 2 | Middleware |
| `server/src/middleware/adminOnly.js` | 2 | Middleware |
| `server/src/middleware/rateLimiter.js` | 2 | Middleware |
| `server/src/middleware/errorHandler.js` | 2 | Middleware |
| `server/src/routes/webhooks.js` | 2 | Route |
| `server/src/routes/checkout.js` | 2 | Route |
| `server/src/routes/subscriptions.js` | 2 | Route |
| `server/src/routes/credits.js` | 2 | Route |
| `server/src/routes/billing.js` | 2 | Route |
| `server/src/routes/nonprofit.js` | 2 | Route |
| `server/src/services/webhookService.js` | 2 | Service |
| `server/src/services/checkoutService.js` | 2 | Service |
| `server/src/services/subscriptionService.js` | 2 | Service |
| `server/src/services/creditService.js` | 2 | Service |
| `server/src/services/usageService.js` | 2 | Service |
| `server/src/services/nonprofitService.js` | 2 | Service |
| `server/src/utils/logger.js` | 2 | Utility |
| `server/scripts/migrate-users.js` | 1 | Script |
| `server/tests/*.test.js` (6 files) | 2 | Tests |
| `src/components/public/PricingPage.jsx` | 3 | Component |
| `src/components/public/PricingComparisonTable.jsx` | 3 | Component |
| `src/components/auth/PlanConfirmationStep.jsx` | 4 | Component |
| `src/components/auth/NonprofitVerificationStep.jsx` | 4 | Component |
| `src/components/auth/RegistrationSuccess.jsx` | 4 | Component |
| `src/lib/api.js` | 4 | Utility |
| `src/components/billing/BillingDashboard.jsx` | 5 | Component |
| `src/components/billing/CreditPackModal.jsx` | 5 | Component |
| `src/components/billing/InvoiceHistory.jsx` | 5 | Component |
| `src/components/billing/PlanManagement.jsx` | 5 | Component |
| `src/components/billing/CreditHistory.jsx` | 5 | Component |
| `src/components/billing/AutoRefillSettings.jsx` | 5 | Component |
| `src/components/billing/NonprofitVerification.jsx` | 5 | Component |
| `src/hooks/useCredits.js` | 6 | Hook |
| `src/hooks/useFeatureGate.js` | 6 | Hook |
| `src/components/shared/CreditBadge.jsx` | 6 | Component |
| `src/components/shared/UpgradePrompt.jsx` | 6 | Component |
| `src/components/shared/TierBadge.jsx` | 6 | Component |
| `src/components/shared/SubscriptionBanner.jsx` | 6 | Component |
| `src/components/admin/SubscriptionDashboard.jsx` | 7 | Component |
| `src/components/admin/NonprofitVerificationQueue.jsx` | 7 | Component |

### Existing Files to Modify

| File | Batch | Changes |
|------|-------|---------|
| `src/contexts/AuthContext.jsx` | 1 | Add tier fields to user doc creation |
| `src/App.jsx` | 1, 3, 5, 7 | Add SubscriptionProvider, routes |
| `src/components/auth/RegisterForm.jsx` | 4 | Multi-step flow, tier selection |
| `src/components/public/PublicNavigation.jsx` | 3 | Add Pricing link |
| `src/components/public/LandingPage.jsx` | 3 | Add pricing CTA |
| `src/config/seo.js` | 3 | Add pricing page SEO config |
| `src/components/home/HomePage.jsx` | 4 | Handle subscription URL params |
| `src/components/layouts/ToolLayout.jsx` | 5, 6 | Add billing nav, credit indicator, SubscriptionBanner |
| `src/components/admin/UsageAnalyticsDashboard.jsx` | 7 | Add credit consumption analytics |
| 15+ tool components | 6 | Add credit gating (see Section 7.5) |

---

## 11. Legal & Compliance Requirements <!-- Added per Wave 1 expert review -->

> **Status:** Required before any paid subscription goes live. All items in this section are blocking unless marked otherwise.

### 11.1 Pre-Launch Legal Checklist

The following must be completed before any paid subscription is accepted:

| # | Requirement | Owner | Blocking? |
|---|------------|-------|-----------|
| L-01 | Terms of Service drafted and reviewed by outside counsel | Legal | Yes |
| L-02 | Privacy Policy updated for new data processing activities | Legal | Yes |
| L-03 | Stripe Data Processing Agreement executed | Legal / Engineering | Yes (EU/UK launch) |
| L-04 | Google Cloud / Firebase DPA reviewed and accepted | Legal / Engineering | Yes (EU/UK launch) |
| L-05 | Auto-renewal disclosures compliant with FTC Negative Option Rule, California ARL | Legal | Yes |
| L-06 | Refund and cancellation policy finalized and published | Legal | Yes |
| L-07 | Auto-refill authorization disclosure reviewed by legal | Legal | Yes |
| L-08 | OFAC sanctions screening implemented | Engineering | Yes |
| L-09 | Age verification attestation added to registration | Engineering | Yes |
| L-10 | Money transmission legal analysis for credit system | Outside Counsel | Yes |
| L-11 | PCI-DSS SAQ-A self-assessment completed | Engineering / Legal | Yes |
| L-12 | SLA terms with defined remedies added to ToS | Legal | Yes |
| L-13 | AI output disclaimer and IP ownership provisions in ToS | Legal | Yes |
| L-14 | Indemnification, limitation of liability, dispute resolution in ToS | Legal | Yes |
| L-15 | Credit system legal constraints documented in ToS | Legal | Yes |
| L-16 | Nonprofit fraud liability and clawback provisions in ToS | Legal | Yes |
| L-17 | Data breach notification procedure documented | Legal / Engineering | No (pre-launch) |
| L-18 | Cyber liability insurance reviewed for SaaS payment coverage | Legal / Finance | No (pre-launch) |

### 11.2 Terms of Service — Required Sections

The Terms of Service must include a dedicated "Subscription and Billing" section covering:

1. **Auto-renewal**: Exact renewal price, interval, cancellation deadline, how to cancel, that cancellation takes effect at period end
2. **Cancellation**: Steps to cancel, access after cancellation, data retention after cancellation
3. **Refunds**: Refund policy for monthly plans, EU/UK 14-day withdrawal right and waiver, credit pack refund conditions
4. **Overage billing**: Per-credit overage rates by tier, that overages are billed on next invoice, how to view current overage
5. **Auto-refill**: Authorization scope (pack type, price per trigger, monthly maximum), how to disable, post-charge notification commitment
6. **Credit system**: Non-transferability, no cash redemption, monthly credit expiration, bonus credit conditions, credit pack expiration (12 months)
7. **Price changes**: Minimum notice period (30 days US, 60 days EU), cancellation right before new price takes effect
8. **SLA**: Response time definitions, remedy (service credits), cap on credit liability, force majeure exclusion
9. **Limitation of liability**: Cap at 12 months' fees paid, exclusion of consequential damages
10. **Dispute resolution**: Arbitration clause, small claims carve-out, class action waiver, governing law and venue
11. **AI output**: Disclaimer of warranties, human review requirement, IP ownership (license to user, not assignment)
12. **Nonprofit tier**: Eligibility requirements, documentation obligations, anti-fraud attestation, clawback on fraud

### 11.3 GDPR / CCPA Compliance Package

Before EU/UK launch, the following must be completed:

- **Record of Processing Activities (RoPA):** Document lawful basis, purpose, retention period, and recipients for each Firestore collection: `users`, `subscriptions`, `credit_balances`, `credit_transactions`, `usage_events`, `invoices`, `credit_packs`, `nonprofit_verifications`, `tos_acceptances`
- **Data Subject Rights:** Implement `GET /api/privacy/data-export` and `POST /api/privacy/delete-account` (see Section 4.8)
- **Retention Policy:** Each collection must have a defined retention period. `usage_events` must have an automated deletion schedule (recommend: 24 months rolling)
- **Sub-Processor Disclosure:** Stripe and Google Cloud/Firebase must be listed as named sub-processors in the Privacy Policy
- **International Transfer Mechanism:** Execute Firebase Data Processing Addendum (incorporating SCCs) before accepting EU user data

---

## 12. Transactional Email System <!-- Added per Wave 1 expert review -->

### 12.1 Email Provider

Transactional emails are sent via a provider integrated into the Node/Express backend via `server/src/services/emailService.js`. Recommended providers: Postmark (superior deliverability for transactional) or SendGrid.

### 12.2 Required Email Templates

| Event | Trigger | Recipient | Content Required |
|-------|---------|-----------|-----------------|
| Subscription Confirmed | `checkout.session.completed` | User | Tier name, price, credit allocation, next billing date, billing dashboard link |
| Payment Failed | `invoice.payment_failed` | User | Amount due, update payment link, grace period end date |
| Subscription Canceled | User or admin cancels | User | Effective date, data retention warning, resubscribe link |
| Subscription Reactivated | `POST /subscriptions/reactivate` | User | Plan reinstated, next billing date |
| Plan Upgraded | Subscription updated upward | User | Old plan, new plan, credits added, amount charged |
| Plan Downgraded (scheduled) | Subscription updated downward | User | Effective date, new plan details, credit reduction |
| Auto-Refill Enabled | `POST /api/credits/auto-refill` enabled=true | User | Pack type, per-occurrence price, monthly max, how to disable |
| Auto-Refill Charge | Each auto-refill purchase | User | Pack purchased, credits added, month-to-date spend |
| Cancellation Confirmation | `POST /subscriptions/cancel` | User | Explicit confirmation, access end date, no further charges, resubscribe link |
| Price Change Notice | Admin triggers notification | User | Current price, new price, effective date, one-click cancel link |
| Nonprofit Approved | Admin approves | User | Checkout link, tier details, verification expiry date |
| Nonprofit Rejected | Admin rejects | User | Rejection reason, re-application instructions |
| Nonprofit Expiring Soon | 30 days before `expiresAt` | User | Re-verification instructions, expiry date |
| Data Deletion Complete | `POST /api/privacy/delete-account` | User | Confirmation, what was deleted, what was retained |
| Credit Reset (opt-in) | `invoice.paid` | User | Credits reset, new balance, billing period start |
| Low Credit Warning (opt-in) | Credits fall below 20% | User | Current balance, top-up options |

### 12.3 Implementation Requirements

**Story 2.12 — Email Service**

**AC:**
- [ ] Create `server/src/services/emailService.js` with `sendEmail(to, templateId, variables)` function
- [ ] All template IDs stored as environment variables (`EMAIL_TEMPLATE_*`)
- [ ] Billing-critical emails (payment failed, subscription confirmed, cancellation confirmation) are **not** opt-out — always sent
- [ ] Auto-refill charge notification is not opt-out (legal requirement per FTC Negative Option Rule)
- [ ] Cancellation confirmation email is not opt-out (legal requirement per FTC Negative Option Rule)
- [ ] Credit reset and low credit warning emails are opt-in (default: off); preference stored in user document as `emailPreferences: { creditReset: boolean, lowCreditWarning: boolean }`
- [ ] Email sending failures are logged but do not cause API request failures (fire-and-forget pattern with error logging)
- [ ] Admin can trigger re-send of any billing email from the subscriber management table (Section 8.2.3)
- [ ] All email templates must be version-controlled and treat content changes as material policy updates requiring legal review

**Files:**
- Create: `server/src/services/emailService.js`
- Modify: `server/src/services/subscriptionService.js` (trigger emails on all subscription events)
- Modify: `server/src/services/webhookService.js` (trigger payment failed, subscription updated emails)

---

## 13. Annual Pricing & Billing Intervals <!-- Added per Wave 1 expert review -->

### 13.1 Annual Plan Definitions

Each paid tier must offer an annual billing option at a 17% discount (equivalent to 2 months free). Annual plans are billed upfront for 12 months.

| Tier | Monthly Price | Annual (per month) | Annual Total | Annual Savings |
|------|--------------|-------------------|--------------|----------------|
| Client Side | $99/month | $82/month | $984/year | $204/year |
| Freelance | $149/month | $124/month | $1,488/year | $300/year |
| Agency | $299/month | $249/month | $2,988/year | $600/year |
| Nonprofit | $49/month | $41/month | $492/year | $96/year |

### 13.2 Annual Plan Requirements

- Annual plans are billed upfront via Stripe with `interval: 'year'`
- Credit allocations are identical to monthly plans — credits reset **monthly**, not annually
- Annual subscribers do not receive prorated refunds on downgrade — plan changes take effect at annual renewal date
- The billing dashboard must display: annual renewal date, total next charge amount, and option to switch to monthly at renewal
- Price change notifications for annual subscribers must be sent at least 60 days before renewal (vs. 30 days for monthly)
- Annual subscribers receive a 14-day cancellation window for full refund after initial purchase (vs. 24 hours for monthly)

### 13.3 Stripe Configuration — Annual Price IDs

Add to Section 3.10 (Stripe Products and Prices):

```
STRIPE_PRICE_CLIENT_ANNUAL=price_...    # $984/year
STRIPE_PRICE_FREELANCE_ANNUAL=price_... # $1,488/year
STRIPE_PRICE_AGENCY_ANNUAL=price_...    # $2,988/year
STRIPE_PRICE_NONPROFIT_ANNUAL=price_... # $492/year
```

Add to `TIER_CONFIGS`:
```javascript
clientSide: {
  // ...existing fields...
  monthlyPriceId: process.env.STRIPE_PRICE_CLIENT_MONTHLY,
  annualPriceId: process.env.STRIPE_PRICE_CLIENT_ANNUAL,
  annualMonthlyEquivalent: 82,   // Display price per month
  annualTotal: 984,
}
```

### 13.4 Frontend — Annual/Monthly Toggle

**Story 13.1 — Annual Pricing Toggle**

**AC:**
- [ ] Pricing page includes a toggle: "Monthly | Annual (Save 17%)"
- [ ] Annual option is not the default (avoid confusion for price-sensitive users)
- [ ] Annual toggle state persists for the page session
- [ ] Tier cards show per-month price when annual is selected, with total annual charge shown below: "Billed $984/year"
- [ ] CTA buttons pass `interval: 'month' | 'year'` to `POST /api/checkout/create-session`
- [ ] `create-session` endpoint accepts and validates `interval` parameter
- [ ] `PlanConfirmationStep.jsx` shows the correct interval, total charge, and renewal date for annual plans

---

## 14. Free Trial Strategy <!-- Added per Wave 1 expert review -->

### 14.1 Trial Decision

**Decision: Implement a 14-day free trial on the Freelance tier.**

Rationale: The Freelance tier is the "Most Popular" plan and the primary conversion target. A no-credit-card-required trial on the Freelance tier eliminates commitment friction, allows users to discover the AI credit value proposition, and drives conversion through usage rather than price anchoring alone.

### 14.2 Trial Mechanics

- **Trial length:** 14 days
- **Credit card required:** No — trial starts without payment method
- **Trial credit allocation:** Full Freelance allocation (1,500 standard + 400 AI credits) for the 14-day period
- **At trial end:** User is prompted to enter payment method to continue. If not entered within 3 days of trial end, account reverts to Basic tier.
- **Trial eligibility:** One trial per email address, one trial per payment method (enforced at conversion)
- **Stripe implementation:** `trial_period_days: 14` on the subscription creation; `payment_behavior: 'default_incomplete'`

### 14.3 Trial User Stories

**Story 14.1 — Start Freelance Trial**

**AC:**
- [ ] "Start Free Trial" CTA appears on the Freelance pricing card alongside "Start Freelance" for unauthenticated users
- [ ] Scenario: User clicks "Start Free Trial" → Registers (or logs in) → Lands on billing dashboard with trial banner: "Your 14-day Freelance trial is active. Add a payment method to continue after [date]."
- [ ] `subscriptionStatus: 'trialing'` with `trialEndDate: Timestamp` stored in subscription document
- [ ] Full Freelance tier access enforced during trial
- [ ] Trial credits provisioned immediately on trial start

**Story 14.2 — Trial Conversion**

**AC:**
- [ ] 3 days before trial end: Email sent with "Your trial ends in 3 days — add a payment method to continue"
- [ ] 1 day before trial end: In-app full-screen prompt on next login
- [ ] Trial end: Stripe attempts charge if payment method present; if payment succeeds, subscription converts to active
- [ ] If no payment method: subscription reverts to `canceled`, user downgrades to Basic
- [ ] Billing dashboard shows trial countdown in days when `subscriptionStatus === 'trialing'`

---

## 15. Enterprise Tier — Lead Capture <!-- Added per Wave 1 expert review -->

### 15.1 Enterprise Card on Pricing Page

The pricing page must include an "Enterprise" card after the Agency tier card.

**Card content:**
- Heading: "Enterprise"
- Subheading: "For large agencies and organizations"
- Price display: "Custom pricing"
- Feature list: All Agency features, Custom credit limits, SSO / SAML, Dedicated Customer Success Manager, Custom SLA, White-glove onboarding, Custom contracts
- CTA: "Contact Sales" button (opens lead capture modal)

### 15.2 Lead Capture

**Story 15.1 — Enterprise Lead Capture**

**AC:**
- [ ] "Contact Sales" CTA opens a modal with fields: Full Name, Company, Work Email, Number of team members (dropdown: 1-5, 6-20, 21-100, 100+), Estimated monthly audits (dropdown: <100, 100-500, 500-2000, 2000+), "What are you trying to accomplish?" (textarea)
- [ ] Form submission writes to `leads/{leadId}` Firestore collection: `{ createdAt, source: 'pricing_page', name, company, email, teamSize, monthlyVolume, goals, userId: string | null }`
- [ ] Submission sends notification email to internal sales address (`SALES_NOTIFICATION_EMAIL` env var)
- [ ] Success state: "Thanks! We'll be in touch within 1 business day."
- [ ] No Stripe integration required for Enterprise in v1

**Files:**
- Modify: `src/components/public/PricingPage.jsx`
- Create: `src/components/public/EnterpriseLead Modal.jsx`
- Modify: `server/src/routes/leads.js` (create route)

---

## 16. Cancellation Retention Flow <!-- Added per Wave 1 expert review -->

### 16.1 Multi-Step Cancellation Modal

When a user initiates cancellation from the billing dashboard, a multi-step retention flow must be presented before confirming cancellation.

**Step 1 — Reason selection:**
- "Before you go — why are you canceling?" with required selection:
  - Too expensive
  - Not using it enough
  - Missing features I need
  - Switching to a different tool
  - Temporary break (I'll be back)
  - Other (with text field)

**Step 2 — Contextual save offer:**

| Reason | Save Offer |
|--------|-----------|
| Too expensive | Offer 1-month pause OR one-time 20% discount coupon (if `STRIPE_RETENTION_COUPON_ID` is configured) |
| Not using it enough | Offer 1-month pause with credit freeze |
| Temporary break | Offer pause prominently as primary CTA |
| Missing features | Show upcoming roadmap items; offer to submit feature request |
| Switching tools | Show comparison benefit; offer to schedule a demo |
| Other | Generic offer: pause or discount |

**Step 3 — Confirmation:**
- If user proceeds: Show plan end date, data retention notice, "I changed my mind" reactivate button (available for 24 hours post-cancel)

### 16.2 Implementation Requirements

**Story 16.1 — Cancellation Retention Flow**

**AC:**
- [ ] Cancellation is a 3-step modal flow, not a single confirm dialog
- [ ] Step 1 reason selection is required (cannot skip to confirm)
- [ ] `cancellationReason: string` and `cancellationFeedback: string | null` stored in subscription document on cancel
- [ ] Save offer is contextual based on selected reason
- [ ] Pause offer calls `POST /api/subscriptions/pause` without closing the modal
- [ ] Discount coupon (if `STRIPE_RETENTION_COUPON_ID` env var is set) applied via Stripe API to next invoice
- [ ] Cancellation confirmation email sent within 5 minutes of cancellation (non-negotiable — FTC requirement)
- [ ] Admin cancellation reason breakdown available in Section 8.4 Revenue Analytics
- [ ] Reactivate option available in billing dashboard for 24 hours post-cancel

---

## 17. Credit System — Amended Policies <!-- Added per Wave 1 expert review -->

### 17.1 Credit Pack Access for All Tiers

Free tier (Basic) users are permitted to purchase one-time credit packs. The previous restriction (403 error for Basic users) is removed.

**Rationale:** Restricting pack purchases to paid subscribers eliminates the primary impulse-purchase conversion path. The canonical freemium conversion pattern is: usage → credit exhaustion → pack purchase → familiarity with AI features → subscription upgrade.

**Changes required:**
- Remove `403: Free tier users cannot purchase packs` from `POST /api/checkout/create-pack-session`
- Update feature gate in `useFeatureGate`: `creditPacks: []` (no tiers denied)
- Update Section 7.4 feature gate table: `creditPacks` row — remove Basic from denied tiers
- After first pack purchase by a Basic user, set `firstPackPurchasedAt: Timestamp` on user document
- Show post-purchase upsell banner in billing dashboard for first-time pack purchasers on Basic tier

### 17.2 Credit Pack Legal Constraints

Credit packs are subject to the following legal constraints (also documented in Section 11 and Terms of Service):

| Constraint | Requirement |
|-----------|-------------|
| Non-transferability | Credits are non-transferable between accounts; `creditService.js` enforces userId match |
| No cash redemption | Credits have no cash value; no refund endpoint for consumed credits |
| Pack expiration | Bonus credits expire 12 months after purchase (`expiresAt: Timestamp` on `credit_packs` document) |
| Forfeiture on cancellation | Unused monthly credits forfeited at period end; unused bonus credits retained (subject to expiry) |
| Disclosure | Pack purchase modal must link to credit terms section of ToS |

**Schema change — add to `credit_packs` collection:**
```javascript
{
  // ...existing fields...
  expiresAt: Timestamp,  // ADD: purchasedAt + 365 days
}
```

**Daily cron job addition:** Check `credit_packs` for expired packs (`expiresAt < now` and `remainingCredits > 0`), zero out remaining credits, create `credit_transactions` record with `type: 'expiration'`.

### 17.3 Auto-Refill Authorization Disclosure

The auto-refill feature requires a formal authorization disclosure — not merely a "warning text" — with an affirmative acknowledgment checkbox. This is required under the FTC Negative Option Rule.

**Required disclosure text (display in bordered box above Save button):**

> By enabling auto-refill, you authorize Content Strategy Portal to automatically charge your saved payment method **[PACK_PRICE]** (for a [PACK_TYPE] pack: [STANDARD_CREDITS] standard credits + [AI_CREDITS] AI credits) each time your credit balance reaches zero, up to a maximum of **3 times per calendar month** (maximum **[MAX_MONTHLY_CHARGE]/month**). You may disable auto-refill at any time from this page with immediate effect. Each auto-refill charge will be confirmed by email within 24 hours.

**All values must be interpolated from `CREDIT_PACKS` in `src/config/tiers.js` — not hardcoded.**

**Additional AC for `AutoRefillSettings.jsx`:**
- [ ] "I authorize these automatic charges" checkbox required (unchecked by default) when enabling auto-refill
- [ ] "Save" button disabled until checkbox is checked (when enabling — not required when disabling)
- [ ] `POST /api/credits/auto-refill` endpoint requires `consentConfirmed: true` and `tosVersion: string` in request body when `enabled: true`
- [ ] Endpoint creates `tos_acceptances` record with `method: 'auto_refill_enable'`
- [ ] Confirmation email sent within 5 minutes of enabling auto-refill

### 17.4 Grace Period Extension

The past_due grace period is extended from **7 days to 14 days** to align with Stripe Smart Retries (which attempt up to 4 retries over approximately 8 days).

**Change to Section 7.10:**

| Status | Access | UI |
|--------|--------|----|
| `past_due` | Full tier access (**grace period: 14 days** from first failure) | Red banner: "Payment failed. Update payment method." |
| `past_due` (>14 days) | Reverted to Basic limits | Red banner + UpgradePrompt |

**Schema addition — add to `subscriptions` collection:**
```javascript
{
  // ...existing fields...
  firstPaymentFailedAt: Timestamp | null,  // ADD: set on first invoice.payment_failed; used to calculate grace period
}
```

---

## 18. Compliance Data Models <!-- Added per Wave 1 expert review -->

### 18.1 New Collection: `tos_acceptances/{acceptanceId}`

Records of Terms of Service and billing disclosure acceptance. **Immutable — never deleted. Retained 7 years minimum.**

```javascript
{
  id: string,
  userId: string,
  tosVersion: string,                      // e.g., '2026-02-22-v1.0' from server/src/config/policies.js
  privacyPolicyVersion: string,
  aiPolicyVersion: string,
  autoRenewalDisclosureVersion: string,
  acceptedAt: Timestamp,
  ipAddress: string,                       // Captured server-side only
  userAgent: string,
  method: string,                          // 'registration' | 'plan_upgrade' | 'auto_refill_enable' | 'plan_reactivation'
  tier: string,
  sessionId: string | null,
  createdAt: Timestamp
}
```

**Firestore security rules:**
- Users may **create** their own records (`userId == request.auth.uid`)
- **No updates or deletes** permitted for any party (including Admin SDK)
- Admin SDK read-only for audit purposes

### 18.2 New Collection: `deletion_audit_log/{logId}`

Records of account deletion and pseudonymization events. Immutable.

```javascript
{
  id: string,
  userId: string,                          // The UID of the deleted account
  requestedAt: Timestamp,
  completedAt: Timestamp | null,
  deletedCollections: string[],            // ['usage_events', 'credit_balances', 'credit_packs']
  pseudonymizedCollections: string[],      // ['users', 'subscriptions', 'invoices', 'credit_transactions', 'tos_acceptances']
  stripeCanceled: boolean,
  firebaseAuthDeleted: boolean,
  adminId: string | null,                  // If admin-initiated
  createdAt: Timestamp
}
```

### 18.3 New Collection: `compliance_screening_events/{eventId}`

OFAC and sanctions screening records. Admin-only access.

```javascript
{
  id: string,
  userId: string | null,
  screenedFields: string[],               // ['name', 'email', 'organizationName']
  matchResult: string,                    // 'clear' | 'match' | 'possible_match'
  action: string,                         // 'allowed' | 'blocked' | 'flagged_for_review'
  screeningProvider: string,              // 'ofac_sdn' | 'stripe_radar' | 'manual'
  timestamp: Timestamp,
  createdAt: Timestamp
}
```

### 18.4 Additions to `subscriptions/{subscriptionId}` Schema

```javascript
{
  // ...existing fields...

  // Consent and disclosure logging (write-once from backend — Firestore rules must prevent frontend writes)
  autoRenewalDisclosureAcknowledgedAt: Timestamp | null,
  autoRenewalDisclosureText: string | null,   // Snapshot of exact disclosure shown
  tosVersionAccepted: string | null,
  tosAcceptedAt: Timestamp | null,
  ipAddressAtSubscription: string | null,     // GDPR: disclosed in Privacy Policy
  billingCountryCode: string | null,          // ISO 3166-1 alpha-2
  euWithdrawalWaiverAcknowledgedAt: Timestamp | null,

  // Price change tracking
  pendingPriceChange: {
    newAmount: number,
    effectiveDate: Timestamp,
    notifiedAt: Timestamp
  } | null,

  // Cancellation data
  cancellationReason: string | null,          // From retention flow step 1
  cancellationFeedback: string | null,        // Free text from 'Other' option

  // Payment failure tracking
  firstPaymentFailedAt: Timestamp | null,     // For grace period calculation

  // Trial
  trialEndDate: Timestamp | null,
  trialConvertedAt: Timestamp | null,

  // New subscription eligibility
  firstPackPurchasedAt: Timestamp | null,     // For free tier upsell targeting
  subscriptionCreatedAt: Timestamp,           // For 24-hour cancellation window
}
```

---

## 19. New API Endpoints — Wave 1 <!-- Added per Wave 1 expert review -->

### 19.1 Price Change Notification

**POST /api/admin/subscriptions/price-change-notification** *(Admin only)*

Triggers price change notification to all active subscribers on a specified tier, meeting the 30-day advance notice requirement (60 days recommended for EU subscribers).

```
Request:
{
  tier: 'client' | 'freelance' | 'agency' | 'nonprofit',
  newPrice: number,           // New price in cents
  effectiveDate: string,      // ISO 8601 — minimum 30 days from now
  notificationMessage: string | null
}

Response (200):
{
  subscribersNotified: number,
  scheduledEffectiveDate: string,
  notificationsSent: boolean
}

Errors:
- 400: effectiveDate less than 30 days from now
- 403: Not admin
```

**Behavior:**
- Sends price change email to all active subscribers on affected tier
- Email includes: current price, new price, effective date, one-click cancellation link
- Sets `pendingPriceChange` field on each affected subscription document
- `BillingDashboard` shows notice banner when `pendingPriceChange` is set

### 19.2 Data Subject Rights

**GET /api/privacy/data-export** *(Authenticated user)*

Returns complete JSON export of all personal data for the authenticated user.

```
Response (200): JSON object containing all personal data across all collections
```

Includes: user profile, subscription record, credit transactions, invoices, credit packs, nonprofit verification, tos_acceptances records. Excludes: raw usage_events (provide aggregate summary). Must be delivered within 30 days (GDPR Article 12).

---

**POST /api/privacy/delete-account** *(Authenticated user — requires email verification)*

Initiates account deletion with pseudonymization of billing records.

```
Request:
{ confirmationToken: string }  // From email verification step

Response (200):
{ deletionScheduled: true, completionDate: string }
```

**Behavior:**
- Soft-deletes user profile: replaces PII with pseudonymized values
- Cancels active Stripe subscription immediately
- **Retains** billing records (invoices, credit_transactions, tos_acceptances) in pseudonymized form for 7 years
- **Deletes** usage_events, credit_balances, credit_packs
- Purges nonprofit verification documents from Firebase Storage
- Deletes Firebase Auth account
- Logs to `deletion_audit_log` collection
- All deletion events logged to immutable audit log

**Files:**
- Create: `server/src/routes/privacy.js`
- Create: `server/src/services/privacyService.js`

### 19.3 OFAC Sanctions Screening

**POST /api/compliance/screen** *(Internal — called by other endpoints)*

Screens a set of fields against the OFAC SDN list and other applicable sanctions lists.

**Integration points:**
- User registration: screen `name` and `email` domain
- Nonprofit verification submission: screen `organizationName` and `ein`
- Checkout session creation: screen by billing country code

**Blocked registrations/sessions return HTTP 403 with non-descriptive error (do not reveal screening logic).**

All screening events logged to `compliance_screening_events` collection (admin-only).

**Files:**
- Create: `server/src/services/complianceService.js`
- Modify: `server/src/routes/checkout.js` (add screening)
- Modify: `server/src/routes/nonprofit.js` (add screening)
- Modify: `server/src/middleware/auth.js` (add country screening)

### 19.4 Pre-Checkout Disclosure Requirements

**Component: `PlanConfirmationStep.jsx` — New disclosure block required**

The following disclosure must appear **above the payment button** at `PlanConfirmationStep`:

```
By clicking "Confirm & Pay," you authorize Content Strategy Portal to charge
your payment method [PRICE]/month starting today, automatically renewing each
month until you cancel. You may cancel at any time from your Billing Dashboard;
cancellation takes effect at the end of the current billing period and no
further charges will occur. Overages may apply at the rates shown. By
proceeding, you agree to our Terms of Service and Billing Policy.
```

**[For California users — geo-detected by billing address or browser locale — append:]**
> To cancel, visit your Billing Dashboard at [URL] or contact support at [email].

**AC:**
- [ ] Disclosure text interpolates price from `TIER_CONFIGS` — never hardcoded
- [ ] A separate checkbox: "I understand this subscription renews automatically" must be checked before "Confirm & Pay" button is enabled (distinct from existing Terms/Privacy checkboxes)
- [ ] Disclosure text and acknowledgment timestamp logged server-side on subscription creation
- [ ] EU/UK users: display EU withdrawal waiver language; log `euWithdrawalWaiverAcknowledgedAt`
- [ ] Font size: minimum 12px, not greyed out

### 19.5 Refund and Cancellation Policy Page Section

**Component: `PricingPage.jsx` — New section required**

A "Refund and Cancellation Policy" section must appear on the `/pricing` page and be linked from `PlanConfirmationStep.jsx` and `BillingDashboard.jsx`. Minimum content:

- Cancellations: Access continues to period end; no partial-month refunds for monthly plans
- EU/UK: 14-day withdrawal right and waiver language (shown only to EU/UK users)
- Credit packs: Non-refundable once credits consumed; 14-day window for completely unused packs
- Disputes: Contact support before filing chargeback; 5 business day response commitment

### 19.6 Security Incident Response

**Story 19.1 — Security Event Logging**

**AC:**
- [ ] `server/src/utils/logger.js` logs the following as structured security events to `security_events` Firestore collection:
  - Failed Stripe webhook signature verification attempts
  - Multiple failed authentication attempts on a single account (>5 in 1 hour)
  - Admin data exports (exporter identity, timestamp, record count)
  - Bulk credit consumption anomalies (>80% of tier allocation in <24 hours)
  - Unauthorized subscription tier change attempts
- [ ] `security_events` collection: admin-only read, backend write-only, no deletions
- [ ] Admin UI at `/app/admin/security`: table view of recent security events with severity, type, user, timestamp
- [ ] Internal runbook documents: breach notification SLA (GDPR: 72 hours to supervisory authority; US states: 30-90 days to affected individuals), Stripe key rotation procedure

---

## Wave 1 Integration — Modification Index <!-- Added per Wave 1 expert review -->

The following modifications were made to existing sections as part of Wave 1 integration. Each entry references the original section and the nature of the change.

| Section | Original Value | Modified Value | Source |
|---------|---------------|----------------|--------|
| 2.1 Freelance — Seats | 1 | 1 (owner) + 1 collaborator seat (read-only) | Lead PM |
| 2.1 Agency — Data Retention | Unlimited | Retained for subscription duration + 90 days post-cancellation; billing records 7 years pseudonymized | Head Legal Counsel |
| 2.1 Tier Prices | Agency at $299/month | Confirmed $299/month throughout document | Lead PM |
| 2.2.3 Credit packs | "non-expiring until used" | Add legal qualifications: conditions on forfeiture; TOS link required with each purchase | Lawyer |
| 2.2.3 Auto-refill | "Warning text" | Formal authorization disclosure with affirmative checkbox; see Section 17.3 | Lawyer + HLC |
| 4.4.1 create-pack-session | 403 for Basic users | Remove restriction; allow Basic tier credit pack purchases | Lead PM |
| 4.4.2 POST /cancel | No email requirement | Cancellation confirmation email required within 5 minutes (FTC mandate) | Lawyer |
| 4.4.3 auto-refill | No consent record | Require consentConfirmed + tosVersion; create tos_acceptances record | HLC |
| 7.10 grace period | 7 days | 14 days (aligned with Stripe Smart Retries) | Lead PM |
| 3.8 nonprofit_verifications | Original schema | Extended schema: add countryCode, nonprofitRegistrationType, documentRetainUntil, applicantAttestedAt, iersVerificationResult, reVerificationReminderSentAt | Lawyer + HLC |

---

<!-- ============================================================ -->
<!-- WAVE 2 INTEGRATION — Sr. Express Developer, Frontend Dev Manager, Head of Technology -->
<!-- ============================================================ -->

---

## Section 20: Backend API Enhancements — Wave 2 <!-- Added per Wave 2 expert review -->

### 20.1 `processed_webhook_events` Collection Schema

**Source**: Sr. Express Developer (REQ-03-C02), Head of Technology (REQ-12-M03)
**Priority**: Critical — blocks webhook implementation

Add `processed_webhook_events/{stripeEventId}` to Section 3 (Data Models):

```javascript
// Collection: processed_webhook_events/{stripeEventId}
// Purpose: Idempotency store for Stripe webhook events — prevents double-processing on Stripe retries
{
  id: string,                      // Stripe event ID (e.g., 'evt_xxx') — document ID
  eventType: string,               // e.g., 'checkout.session.completed'
  handlerVersion: string,          // Semver of the handler code that processed this event
  processedAt: Timestamp,          // When processing completed successfully
  processingDurationMs: number,    // Latency observability
  userId: string | null,           // Associated user (if determinable from event)
  outcome: string,                 // 'success' | 'skipped' | 'ignored'
  _expireAt: Timestamp,            // TTL: set to processedAt + 30 days — Firestore TTL policy
}

// Firestore Security Rules:
// - No client read or write access
// - Backend (Admin SDK) write-only via Admin SDK
// - TTL: Firestore TTL policy on '_expireAt' field, 30-day expiry

// Idempotency implementation (atomic create pattern):
// db.runTransaction(async (txn) => {
//   const ref = db.collection('processed_webhook_events').doc(event.id);
//   const doc = await txn.get(ref);
//   if (doc.exists) throw new AlreadyProcessedError();
//   txn.create(ref, { id: event.id, eventType: event.type, ... });
// })
// Catch AlreadyProcessedError → return res.status(200).json({ received: true, status: 'already_processed' })
```

**Webhook Routing Update** (Section 4.4.6):

Replace the `payment_intent.succeeded` credit pack handler with explicit session-mode routing in `checkout.session.completed`:

```
checkout.session.completed (mode='subscription') → subscription provisioning flow
checkout.session.completed (mode='payment')      → credit pack fulfillment flow

payment_intent.succeeded → RETAIN as no-op guard only:
  Skip if payment_intent.invoice is set (subscription payment)
  Skip if payment_intent is linked to a completed Checkout session
  No credit pack fulfillment logic here — handled exclusively by checkout.session.completed
```

---

### 20.2 Credit Refund Endpoint

**Source**: Sr. Express Developer (NR-04, REQ-03-C04)
**Priority**: Critical — required for AI call failure rollback

Add to Section 4.4.3 (Credit Endpoints):

```
POST /api/v1/credits/refund

Purpose: Reverses a credit debit transaction when the associated tool action fails after credits
were already deducted. Called by the frontend on confirmed AI/tool API failure.

Request Body:
{
  transactionId: string,    // credit_transactions document ID from /api/credits/consume response
  reason: string            // 'ai_call_failed' | 'tool_error' | 'timeout'
}

Authorization: Bearer <firebase-id-token>
Rate Limit: 5 per minute per user (prevent gaming)
Idempotency: If transactionId already has a refund transaction, return 200 with existing record

Validation:
- credit_transactions/{transactionId}.userId must === req.user.uid
- transactionId.createdAt must be > now - 15 minutes (refund window)
- No existing 'refund' transaction with relatedTransactionId === transactionId

Response (200):
{
  success: true,
  refundTransactionId: string,
  creditsRestored: number,
  newBalance: { standardCreditsRemaining: number, aiCreditsRemaining: number }
}

Errors:
- 400: transactionId not found or does not belong to authenticated user
- 400: Transaction is older than 15 minutes (refund window expired)
- 409: Refund already issued for this transactionId

Implementation notes:
- Create compensating credit_transactions record:
    { type: 'refund', relatedTransactionId: transactionId, reason }
- Restore credits inside Firestore transaction on credit_balances/{userId}
- Do NOT create a usage_events record for refunds (avoid analytics double-counting)
```

---

### 20.3 Overage Billing Mechanism

**Source**: Sr. Express Developer (NR-05, REQ-03-C03)
**Priority**: Critical — overages tracked but never charged without this

Add as Section 4.4.7 — Overage Billing:

```
Overage billing uses Stripe Pending Invoice Items approach:

TRIGGER: invoice.paid webhook for subscription renewal invoice
BEFORE resetting credit counters, read:
  credit_balances/{userId}.standardOverageUsed
  credit_balances/{userId}.aiOverageUsed

IF standardOverageUsed > 0 OR aiOverageUsed > 0:
  Call stripe.invoiceItems.create() for each overage type with positive usage:
    {
      customer: stripeCustomerId,
      subscription: subscriptionId,
      amount: overageUsed * TIER_CONFIGS[tier].overageRates[type] * 100,  // cents
      currency: 'usd',
      description: `${type} credit overage: ${overageUsed} credits @ $${rate}/credit`,
      metadata: { userId, billingPeriodStart, billingPeriodEnd, creditType: type }
    }
  // Items automatically attach to the NEXT open invoice for the customer

THEN: Reset standardOverageUsed and aiOverageUsed to 0 in credit_balances

Add to Section 4.4.6 webhook table:
  invoice.created → Check for overage line items; log to reconciliation_log

Overage Hard Cap (new requirement):
  TIER_CONFIGS must define overageHardCap per tier (e.g., 2x monthly credit allocation).
  When standardOverageUsed + aiOverageUsed reaches overageHardCap, block further overage
  consumption and show an "Overage limit reached" warning requiring upgrade or pack purchase.

Error handling:
  If stripe.invoiceItems.create() fails:
    - Do NOT reset overage counters (retry next billing cycle)
    - Log to security_events with severity 'high'
    - Alert admin
    - Retry via exponential backoff (3 attempts)
    - After 3 failures: reset credits (prevent access disruption), create manual billing action
      record in admin_billing_actions/{id} for manual resolution
```

---

### 20.4 API Versioning Strategy

**Source**: Sr. Express Developer (NR-06, REQ-03-M07)
**Priority**: Should-have before production launch

Add as Section 4.7 — API Versioning:

All API routes must be prefixed with `/api/v1/`. Update all route definitions in Sections 4.4.x accordingly. The frontend `src/lib/api.js` must configure `VITE_API_URL + '/v1'` as the base path.

**Versioning policy:**
- When breaking changes are introduced, `/api/v2/` routes are created alongside v1
- v1 supported for minimum 6 months after v2 ships
- Deprecated endpoints return `Deprecation: true` and `Sunset: <ISO-date>` response headers
- The `GET /api/v1/health` endpoint must return `{ version: '1', status: 'ok', deprecatedAt: null }`

**Breaking change definition** (requires version bump):
- Removing a required request field
- Changing a response field type
- Removing a response field used by the frontend
- Changing HTTP status codes

**Non-breaking changes** (no version bump):
- Adding optional request fields
- Adding new response fields
- Adding new endpoints

---

### 20.5 Background Jobs Specifications

**Source**: Sr. Express Developer (NR-01, REQ-03-S01)
**Priority**: Must-have before Batch 2

Add as Section 4.8 — Background Jobs and Scheduled Tasks:

The following background jobs must be formally implemented. Each is implemented as a Cloud Scheduler job triggering a dedicated authenticated Express endpoint:

| Job | File | Schedule | Trigger |
|-----|------|----------|---------|
| Monthly credit reset | `jobs/resetMonthlyCredits.js` | Driven by `invoice.paid` webhook | Webhook event |
| Credit reset catch-up | `jobs/creditResetCatchup.js` | Daily 02:00 UTC | Cloud Scheduler |
| Data retention cleanup | `jobs/dataRetentionCleanup.js` | Daily 03:00 UTC | Cloud Scheduler |
| Credit pack expiration | `jobs/expireCreditPacks.js` | Daily 00:05 UTC | Cloud Scheduler |
| Nonprofit expiry warning | `jobs/nonprofitExpiryWarner.js` | Daily 08:00 UTC | Cloud Scheduler |
| Trial expiration check | `jobs/trialExpiryChecker.js` | Daily 06:00 UTC | Cloud Scheduler |
| `pending_price_change` apply | `jobs/applyPriceChanges.js` | Daily 00:01 UTC | Cloud Scheduler |
| Auto-refill count reset | `jobs/resetAutoRefillCounts.js` | 1st of month 00:05 UTC | Cloud Scheduler |
| Stripe reconciliation | `jobs/reconcileSubscriptions.js` | Daily 03:00 UTC | Cloud Scheduler + on-demand |

**Required specification for each job:**
- Trigger mechanism and schedule (cron expression)
- Failure handling and retry policy (max 3 retries with exponential backoff)
- Observability: structured log output (`requestId`, `jobName`, `recordsProcessed`, `errors`)
- Alert condition (Cloud Monitoring alert on any job failure)
- Idempotency guarantee (safe to run multiple times)
- Max documents per run (prevent timeouts): 500 documents per batch, paginated

**Auto-refill count reset specifics:**
- Resets `autoRefillCount` to 0 on the 1st of each calendar month at 00:05 UTC
- Stores `autoRefillCountResetAt: Timestamp` on `credit_balances/{userId}` for idempotency
- Job is idempotent: skip users where `autoRefillCountResetAt` is already this month

---

### 20.6 Firestore Data Consistency Contracts

**Source**: Sr. Express Developer (NR-02, REQ-03-C01), Head of Technology (REQ-12-C02)
**Priority**: Critical — must be defined before Story 2.6 implementation

Add as Section 4.9 — Data Consistency Contracts:

#### 20.6.1 Credit Deduction Transaction Contract

`creditService.consumeCredits()` MUST follow this exact transaction boundary:

```
ATOMIC UNIT (db.runTransaction()):
  READ:  credit_balances/{userId}
  VALIDATE: standardCreditsRemaining + bonusStandardCredits >= amount
            (or aiCreditsRemaining + bonusAiCredits >= amount for AI actions)
  IF insufficient: throw InsufficientCreditsError (auto-rollback)
  WRITE: credit_balances/{userId}
    - Decrement appropriate balance field
    - Increment overageUsed if balance was 0 and overage allowed
    - Set updatedAt: now
  WRITE: credit_transactions/{newId}
    - Immutable debit record: { type: 'debit', userId, amount, creditType, action,
        balanceAfter, createdAt, stripeEventId: null, relatedTransactionId: null }

OUTSIDE TRANSACTION (fire-and-forget):
  WRITE: usage_events/{newId} — analytics record (eventual consistency acceptable)
  UPDATE: users/{userId}.creditsRemaining (denormalized fast-read — best effort)

ROLLBACK SCENARIO (AI call fails after transaction commits):
  Frontend: POST /api/v1/credits/refund with { transactionId, reason: 'ai_call_failed' }
  Backend: creditService.refundTransaction(transactionId)
    - Creates compensating CREDIT transaction (type: 'refund')
    - Uses Firestore transaction to restore balance atomically
    - Idempotent by transactionId unique constraint
```

#### 20.6.2 Idempotency Key for Credit Consumption

**Source**: Head of Technology (REQ-NEW-07, REQ-12-C02)

`POST /api/v1/credits/consume` MUST accept and deduplicate on an idempotency key:

```
Request header: Idempotency-Key: <UUID-v4> (required for all consume calls)

Backend:
  1. Read credit_consume_idempotency/{key} from Firestore
  2. If exists and not expired: return cached response (HTTP 200, no deduction)
  3. If not exists: proceed with deduction, then write:
     credit_consume_idempotency/{key} = { response, userId, _expireAt: now + 60s }

Collection: credit_consume_idempotency/{key}
  Fields: { key, response: object, userId: string, _expireAt: Timestamp }
  TTL: Firestore TTL on '_expireAt' field, 60-second expiry

Frontend (useCredits hook):
  - Generates UUID v4 per consumeCredits() call via crypto.randomUUID()
  - Attaches as Idempotency-Key header on every POST /api/v1/credits/consume request
```

#### 20.6.3 Auto-Refill Atomicity Contract

**Source**: Sr. Express Developer (REQ-03-M05)

Auto-refill MUST use a two-phase commit pattern to enforce the 3-pack monthly cap:

```
Phase 1 — Atomic reservation (inside Firestore transaction):
  READ:  credit_balances/{userId} — check autoRefillCount < 3 AND autoRefillPending !== true
  IF count >= 3 or pending: abort (no refill)
  WRITE: credit_balances/{userId}.autoRefillCount += 1
  WRITE: credit_balances/{userId}.autoRefillPending = true

Phase 2 — Stripe API call (outside transaction):
  CALL: stripe.paymentIntents.create() or stripe.subscriptions.createItem() for pack
  IF Stripe SUCCESS:
    WRITE: credit_balances/{userId}.autoRefillPending = false
    WRITE: credit_balances/{userId} — grant pack credits
  IF Stripe FAILURE:
    COMPENSATE: credit_balances/{userId}.autoRefillCount -= 1 (inside new transaction)
    WRITE: credit_balances/{userId}.autoRefillPending = false
    LOG: auto_refill_failures/{userId}/{attemptId}
```

---

### 20.7 Firestore Composite Index Definitions

**Source**: Sr. Express Developer (NR-07, REQ-03-M01)
**Priority**: Must-have before Batch 2 implementation

Add as Section 3.12 — Firestore Composite Index Definitions:

Commit `firestore.indexes.json` to repository root with the following composite indexes (in addition to Section 3.9 indexes for `usage_events`):

```json
{
  "indexes": [
    {
      "collectionGroup": "credit_transactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "creditType", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "credit_transactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "subscriptions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "tier", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "subscriptions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "invoices",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "nonprofit_verifications",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "credit_packs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "expiresAt", "order": "ASCENDING" }
      ]
    }
  ]
}
```

The `firestore.indexes.json` file must be committed to the repository root and deployed via `firebase deploy --only firestore:indexes` in the CI/CD pipeline.

---

### 20.8 Firebase Custom Claims for Auth Middleware

**Source**: Sr. Express Developer (MOD-05, REQ-03-M02)
**Priority**: Major — performance and availability improvement

Update Section 4.3 (Authentication Middleware) as follows:

```javascript
// middleware/auth.js — Updated per Wave 2 review

// 1. Extract and verify Firebase ID token: admin.auth().verifyIdToken(token)
// 2. Read tier and role from CUSTOM CLAIMS in decoded token:
//    req.user = { uid, email, tier: decodedToken.tier, role: decodedToken.role }
// 3. If decodedToken.tier is undefined (pre-claims-sync legacy user):
//    Fall back to Firestore read of users/{uid} to get tier and role
//    Then call admin.auth().setCustomUserClaims(uid, { tier, role }) to backfill
// 4. Returns 401 if token invalid/expired
// 5. Returns 403 if user account is disabled

// Custom claims are set by subscriptionService on EVERY tier change:
//   admin.auth().setCustomUserClaims(uid, { tier: newTier, role: userRole })
//
// Claims propagate to client tokens within 1 hour (next token refresh).
// Frontend must call user.getIdToken(true) after successful upgrade to force
// immediate token refresh and pick up new tier claim.
//
// IMPORTANT: Never trust client-submitted role — always validate server-side via claims.
```

---

## Section 21: Frontend Architecture Requirements — Wave 2 <!-- Added per Wave 2 expert review -->

### 21.1 Skeleton Loading Components for Billing Dashboard

**Source**: Frontend Dev Manager (REQ-NEW-01, REQ-11-C01)
**Priority**: Critical — prerequisite for Batch 5 stories
**Batch**: 5

Create the following skeleton components before billing dashboard stories are implemented:

**Files to create:**
- `src/components/billing/skeletons/BillingDashboardSkeleton.jsx`
- `src/components/billing/skeletons/InvoiceHistorySkeleton.jsx`
- `src/components/billing/skeletons/CreditHistorySkeleton.jsx`

**Acceptance Criteria:**
- [ ] `BillingDashboardSkeleton`: shimmer placeholders matching Section 5.2.1 layout
  - `CurrentPlanCard` skeleton: two-line text placeholder (tier name + price) + four button stubs
  - `CreditUsageGauge` skeleton: two progress bar placeholders with label stubs
  - `UsageActivityList` skeleton: 5 row placeholders with icon, text, amount columns
- [ ] `InvoiceHistorySkeleton`: 5-row table skeleton with column width stubs
- [ ] `CreditHistorySkeleton`: 5-row table skeleton with filter stubs
- [ ] All skeletons use Tailwind `animate-pulse` or project's existing shimmer pattern
- [ ] `BillingDashboard` renders skeleton when `SubscriptionContext.loading === true`
- [ ] Transition from skeleton to content produces zero layout shift (CSS grid/flex dimensions pre-specified)
- [ ] `InvoiceHistory` and `CreditHistory` each render their corresponding skeleton on initial load

---

### 21.2 `data-testid` Naming Convention

**Source**: Frontend Dev Manager (REQ-NEW-02, REQ-11-M04)
**Priority**: Major — must be defined before Batch 3
**Batch**: Defined before Batch 3; enforced from Batch 3 onward

Add to Section 10.1 (Code Conventions) as subsection 10.1.1:

**Convention**: `{component-name}-{element-type}-{variant-or-context}` in kebab-case.

**Required `data-testid` values (minimum set):**

| Component | Element | `data-testid` Value |
|-----------|---------|---------------------|
| PricingPage | Tier card | `pricing-card-{tier}` |
| PricingPage | CTA button | `pricing-cta-{tier}` |
| PricingPage | Annual toggle | `pricing-interval-toggle` |
| RegisterForm | Step indicator | `register-step-indicator` |
| PlanConfirmationStep | Submit button | `plan-confirm-submit` |
| PlanConfirmationStep | Auto-renewal checkbox | `plan-confirm-autorenewal-checkbox` |
| BillingDashboard | Standard credit gauge | `credit-gauge-standard` |
| BillingDashboard | AI credit gauge | `credit-gauge-ai` |
| BillingDashboard | Buy pack button | `billing-buy-pack-btn` |
| CreditPackModal | Pack option | `pack-option-{packType}` |
| CreditPackModal | Buy now button | `pack-buy-now-{packType}` |
| UpgradePrompt | Modal container | `upgrade-prompt-modal` |
| UpgradePrompt | Upgrade CTA | `upgrade-prompt-cta` |
| UpgradePrompt | Dismiss | `upgrade-prompt-dismiss` |
| CancellationRetentionModal | Reason option | `cancel-reason-{reason}` |
| CancellationRetentionModal | Confirm cancel | `cancel-confirm-btn` |
| SubscriptionBanner | Banner container | `subscription-banner-{status}` |
| Tool action buttons | Credit-gated button | `tool-action-{action}` |

**Acceptance Criteria:**
- [ ] Convention documented in `src/COMPONENT_CONVENTIONS.md`
- [ ] `data-testid` identifiers must be stable and semantic — never index-based
- [ ] All Stories in Batches 3–7 include `data-testid` requirements in acceptance criteria

---

### 21.3 React Error Boundary Architecture

**Source**: Frontend Dev Manager (REQ-NEW-03, REQ-11-M02)
**Priority**: Major — required before Stories 5.1–5.7
**Batch**: 5

Create billing-specific React Error Boundaries at three levels:

**Files to create:**
- `src/components/billing/BillingErrorBoundary.jsx`
- `src/components/shared/CreditGatingErrorBoundary.jsx`

**BillingErrorBoundary** (top-level):
- Catches errors from `SubscriptionContext` Firestore listeners and billing page components
- Fallback UI: "Billing information temporarily unavailable. Your access and credits are not affected. [Refresh page]"
- Logs error to console + optionally to Firestore `error_logs` collection
- Does NOT unmount the rest of the application
- Wraps `SubscriptionProvider` in `src/App.jsx`
- Each billing route (`BillingDashboard`, `InvoiceHistory`, `PlanManagement`, `CreditHistory`) is individually wrapped with a page-level `BillingErrorBoundary`

**CreditGatingErrorBoundary** (tool component level):
- Wraps `useCredits` call sites in tool components
- On error: fails OPEN (allows the action) — never silently block tool usage due to billing errors
- Shows non-blocking toast: "Credit tracking temporarily unavailable"
- Used in each of the 15+ tool component integrations in Batch 6

**SubscriptionContext error handling:**
- If `onSnapshot` emits an error, context must catch it and set `connectionStatus: 'error'`
- Context must NOT re-throw Firestore listener errors (would crash the app subtree)
- Context exposes `connectionStatus: 'online' | 'offline' | 'reconnecting' | 'error'`

---

### 21.4 Stripe.js Initialization and Bundle Strategy

**Source**: Frontend Dev Manager (REQ-NEW-04, REQ-11-C03)
**Priority**: Critical — must be defined before Batch 4
**Batch**: 4

Add as Section 10.8 — Bundle and Performance Strategy:

**Create `src/lib/stripe.js`:**
```javascript
// src/lib/stripe.js — Singleton Stripe initialization
// IMPORTANT: This module must NOT be imported at app root level.
// Import only within components that trigger checkout flows.

import { loadStripe } from '@stripe/stripe-js';

let stripePromise = null;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};
```

**Bundle strategy requirements:**
- [ ] `@stripe/stripe-js` must be a dynamic import — not in the app root bundle
- [ ] `getStripe()` called only when user clicks a checkout CTA, not on page load
- [ ] Add to `PricingPage` `SEOHead`: `<link rel="preconnect" href="https://js.stripe.com">` and `<link rel="dns-prefetch" href="https://js.stripe.com">`
- [ ] Performance budgets defined in `vite.config.js`:
  - `/app/billing` route chunk: max 150 KB gzipped
  - `/pricing` route chunk: max 80 KB gzipped
- [ ] Add `@stripe/stripe-js` to `vite.config.js` `optimizeDeps.include` to prevent double-loading in development
- [ ] Bundle size validated in CI using `vite-bundle-visualizer` or equivalent

---

### 21.5 E2E Test Suite Specification

**Source**: Frontend Dev Manager (REQ-NEW-05, REQ-11-M01)
**Priority**: Major — required before production launch
**Batch**: All (E2E tests run in CI after Batch 6 completion)

Add as Section 10.2.1 — E2E Test Scenarios:

**Tooling**: Playwright (preferred for Vite/React projects)

**Required E2E scenarios (minimum):**

| Test ID | Scenario | Key Assertions |
|---------|----------|----------------|
| E2E-01 | Free tier registration | Dashboard shows 50 standard / 10 AI credits; tier badge shows "Basic" |
| E2E-02 | Paid tier checkout (Freelance, annual) | Stripe test checkout with card `4242 4242 4242 4242`; success modal on redirect; tier badge "Freelance" |
| E2E-03 | Credit gate enforcement | Basic user, zero credits → audit upload blocked → `upgrade-prompt-modal` visible |
| E2E-04 | Credit pack purchase | Paid user → billing page → pack purchase → balance increased post-webhook |
| E2E-05 | Cancellation retention flow | Paid user → initiation → 3-step modal → pause offer → subscription shows "Paused" |

**Acceptance Criteria:**
- [ ] Playwright installed as devDependency in frontend project
- [ ] E2E tests run in CI on every PR targeting `main`
- [ ] Stripe test mode credentials and test card numbers only — no production API keys in CI
- [ ] Stripe CLI webhook forwarding configured in CI test environment
- [ ] All 5 scenarios must pass before Batch 7 is considered complete

**Files:**
- Create: `e2e/pricing.spec.ts`, `e2e/registration.spec.ts`, `e2e/credit-gating.spec.ts`, `e2e/billing.spec.ts`, `e2e/cancellation.spec.ts`, `playwright.config.ts`

---

### 21.6 Accessibility Testing Integration

**Source**: Frontend Dev Manager (REQ-NEW-06, REQ-11-S03)
**Priority**: Major — enforced from Batch 3 onward

Add as Section 10.2.2 — Accessibility Testing Requirements:

**Tooling**: `jest-axe` + `@axe-core/react`

**Acceptance Criteria:**
- [ ] Install `jest-axe` as devDependency; add `toHaveNoViolations` matcher to `src/setupTests.js`
- [ ] Every component test file for new billing/pricing components includes at minimum one `axe` check
- [ ] Pricing comparison table (`PricingComparisonTable.jsx`) must pass axe with `table` rule — proper `scope` on all `<th>` elements
- [ ] All modals (`CreditPackModal`, `UpgradePrompt`, `CancellationRetentionModal`) must pass focus-trap rules
- [ ] `CreditUsageGauge` color states (green/yellow/red) must meet WCAG AA contrast ratio (4.5:1)
- [ ] `SubscriptionBanner` must include `role="alert"` and `aria-live="polite"` (or `"assertive"` for `past_due`/`incomplete`)
- [ ] All modals must trap focus within modal on open; Escape key closes; focus returns to trigger on close

---

### 21.7 Registration State Machine — Updated for Wave 1 Complexity

**Source**: Frontend Dev Manager (REQ-11-C04)
**Priority**: Critical — update before Story 4.1 implementation

Update Section 6.2.4 to replace the 4-state machine with the following full state × event table:

**States**: `account_details` | `nonprofit_verification` | `plan_confirmation` | `checkout` | `success`

**Variant paths:**
| Registration Type | State Sequence |
|-------------------|----------------|
| Free (Basic) | `account_details` → `success` (no payment) |
| Paid monthly | `account_details` → `plan_confirmation` (monthly pricing + disclosure checkbox) → `checkout` (Stripe) → `success` |
| Paid annual | `account_details` → `plan_confirmation` (annual pricing + savings callout + disclosure checkbox) → `checkout` → `success` |
| Free trial (Freelance) | `account_details` → `success` (no payment; credits provisioned; trial banner shown) |
| Nonprofit | `account_details` → `nonprofit_verification` (EIN upload) → `plan_confirmation` → `checkout` → `success` |
| Google OAuth paid | Google auth → `plan_confirmation` (pre-selected tier) → `checkout` → `success` |

**Story 4.1 acceptance criteria additions:**
- [ ] Annual interval: `PlanConfirmationStep` renders annual price (`TIER_CONFIGS[tier].annualMonthlyEquivalent`) with "Billed annually as $X" sub-text
- [ ] Disclosure checkbox: separate from Terms/Privacy — "I authorize automatic renewal as described above" (Section 19.4)
- [ ] Trial path: no payment step — `RegisterForm` redirects to `/app` with trial credits provisioned
- [ ] Interval state threaded from `PricingPage` through URL params or router state to `RegisterForm`

---

### 21.8 Pricing Card CTA State Table

**Source**: Frontend Dev Manager (MOD-04, REQ-11-m05)
**Priority**: Major — update Section 5.1.2

Replace the 3-state CTA logic with the following complete state table:

| Auth Status | Subscription Status | Card = Current Tier | Card = Lower Tier | Card = Higher Tier |
|-------------|--------------------|--------------------|-------------------|--------------------|
| Unauthenticated | N/A | "Get Started" / "Start [Tier]" | "Get Started" | "Get Started" |
| Authenticated | `active` | "Current Plan" (disabled) | "Downgrade" | "Upgrade to [Tier]" |
| Authenticated | `trialing` | "[X] days left in trial" (disabled) | "Downgrade" | "Upgrade to [Tier]" |
| Authenticated | `past_due` | "Update Payment" → `/app/billing` | (hide) | (hide) |
| Authenticated | `paused` | "Resume Plan" → `/app/billing` | (hide) | "Upgrade to [Tier]" |
| Authenticated | `canceled` / `cancelAtPeriodEnd` | "Reactivate" → `/app/billing` | (hide) | "Upgrade to [Tier]" |
| Authenticated | `incomplete` | "Complete Payment" → `/app/billing` | (hide) | (hide) |

---

### 21.9 `SubscriptionContext` Single Responsibility for Credit Consumption

**Source**: Frontend Dev Manager (MOD-03, REQ-11-C02)
**Priority**: Critical — resolve before any Batch 6 work

Update Section 6.3 (`SubscriptionContext`) as follows:

- **REMOVE** `consumeCredits` from `SubscriptionContext` — credit consumption is exclusively owned by the `useCredits` hook
- **ADD** `refreshCredits()` to `SubscriptionContext` — forces re-read of credit balance outside normal Firestore listener cadence; called by `useCredits` after a successful consume response
- **RETAIN** `hasCredits(creditType, amount)` on `SubscriptionContext` for synchronous pre-flight checks
- **ADD** `connectionStatus: 'online' | 'offline' | 'reconnecting' | 'error'` to context value

`useCredits` hook is the single caller of `POST /api/v1/credits/consume`. It calls `SubscriptionContext.refreshCredits()` on success.

**Race condition recovery UX** (Section 7.2 update):
When `POST /api/v1/credits/consume` returns 402 (race condition — another tab consumed first):
1. Show toast: "Action could not complete — your credit balance was updated. You have X credits remaining."
2. Re-fetch credit balance via `refreshCredits()`
3. Do NOT show the upgrade prompt (reserve upgrade prompt for cases where balance is structurally 0, not a race)

---

## Section 22: Infrastructure & Operations Requirements — Wave 2 <!-- Added per Wave 2 expert review -->

### 22.1 CI/CD Pipeline and Environment Strategy

**Source**: Head of Technology (REQ-NEW-02, REQ-12-C04)
**Priority**: Critical — blocking before any code deployment

**Three-environment strategy:**

| Environment | Firebase Project | Stripe Mode | Secret Manager |
|-------------|-----------------|-------------|----------------|
| `dev` (local) | `csp-dev` | Test mode | `.env` file (local only) |
| `staging` | `csp-staging` | Test mode | GCP Secret Manager |
| `production` | `csp-prod` | Live mode | GCP Secret Manager |

**CI/CD Pipeline requirements** (implement in `.github/workflows/`):

**`ci.yml`** — runs on every pull request:
- [ ] `npm test` for frontend (all Vitest tests must pass)
- [ ] `npm test` for backend (all test suites must pass)
- [ ] ESLint must pass (zero errors)
- [ ] `npm audit --audit-level=high` must pass (zero high-severity vulnerabilities)
- [ ] Frontend build must succeed (`npm run build`)
- [ ] Backend build/typecheck must succeed

**`deploy-staging.yml`** — runs on merge to `main`:
- [ ] Runs full CI suite
- [ ] Deploys frontend to staging Firebase Hosting
- [ ] Deploys backend to staging Cloud Run
- [ ] Deploys Firestore rules and indexes (`firebase deploy --only firestore`)
- [ ] Updates Stripe webhook URL for staging via Stripe CLI
- [ ] Runs smoke tests: `GET /health` → 200, `GET /api/v1/subscriptions/current` with test token → 200

**`deploy-production.yml`** — manual trigger with required approvals:
- [ ] Requires manual approval from a team member with `deployer` role
- [ ] All CI checks must pass
- [ ] Deployment uses rolling restart with health check probe on `GET /health`
- [ ] Automatic rollback if health check fails within 5 minutes of deployment

---

### 22.2 Secrets Management

**Source**: Head of Technology (REQ-12-C03)
**Priority**: Critical — blocking before any server code is written

Update Section 10.5 and Story 2.1 as follows:

**Production secrets management:**
- [ ] All secrets (Section 3.11) stored in GCP Secret Manager in staging and production
- [ ] Node.js server retrieves secrets at startup via `@google-cloud/secret-manager` SDK
- [ ] `.env` files acceptable for local development only — never deployed
- [ ] Server startup validates all required secrets are present and non-empty; throws on missing secret
- [ ] `server/.env`, `server/node_modules/`, `*.log` added to `server/.gitignore`
- [ ] `STRIPE_SECRET_KEY` and `FIREBASE_PRIVATE_KEY` rotated on a minimum quarterly cadence

**Create `server/src/config/secrets.js`:**
```javascript
// Wrapper that loads from GCP Secret Manager in production, process.env in development
// All other config files import from this module, never directly from process.env
// Provides validateSecrets() called at server startup
```

**Minimum quarterly rotation** applies to:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `FIREBASE_PRIVATE_KEY`

---

### 22.3 Distributed Rate Limiting

**Source**: Head of Technology (MOD-03, REQ-12-M02)
**Priority**: Major — required before multi-replica deployment

Update Section 4.6 (Rate Limiting):

Replace `express-rate-limit` (in-memory, single-instance) with Redis-backed distributed rate limiting:

- **Package**: `rate-limit-redis` with `ioredis` client
- **Redis**: Cloud Memorystore for Redis, minimum 1GB Basic tier in staging/production
- **Add to Section 3.11**: `REDIS_URL` environment variable
- **Key strategy**:
  - Authenticated endpoints: Firebase UID (`keyGenerator: (req) => req.user.uid`)
  - Unauthenticated endpoints: client IP from `X-Forwarded-For` (first IP only, sanitized)
- **Development**: in-memory store acceptable (`NODE_ENV === 'development'`)
- **Global IP-based rate limit**: 200 requests/minute per IP across all routes, applied before auth middleware

**Updated rate limits:**

| Endpoint | Limit | Key | Notes |
|----------|-------|-----|-------|
| `POST /api/v1/credits/consume` | 20/min | UID | Reduced from 60; action-aware |
| `POST /api/v1/checkout/create-session` | 10/min | UID + IP | Idempotency key required |
| `GET /api/v1/privacy/data-export` | 2/day | UID | Expensive cross-collection read |
| `POST /api/v1/credits/refund` | 5/min | UID | Prevent abuse |
| `POST /webhooks/stripe` | Load balancer level | IP | Not Express in-process |
| All routes (global) | 200/min | IP | Unauthenticated protection |

---

### 22.4 Load Testing Gate

**Source**: Head of Technology (REQ-NEW-03, REQ-12-M07)
**Priority**: Major — required before accepting any paid subscriptions

Add to Section 10.4 (Environment Setup Checklist) and create load test specs:

**Files to create:**
- `tests/load/k6-credit-consume.js`
- `tests/load/k6-webhook-burst.js`
- `tests/load/README.md`

**Required load test scenarios:**

| Scenario | Description | Pass Criteria |
|----------|-------------|---------------|
| A | 100 concurrent `POST /api/v1/credits/consume`, 1 req/sec, 5 minutes | p95 < 2,000ms, error rate < 0.1% |
| B | 500 simultaneous `POST /webhooks/stripe` events over 60 seconds | p95 < 2,000ms, 0 duplicate processings |
| C | 50 concurrent `POST /api/v1/checkout/create-session` | p95 < 3,000ms, error rate < 0.1% |
| D | 1,000 concurrent `GET /api/v1/credits/balance` | p95 < 500ms, error rate < 0.1% |

**Pre-launch gate**: Load test results must be documented in `tests/load/README.md` and signed off by Head of Technology before production deployment is approved.

---

### 22.5 Firestore Backup and Disaster Recovery

**Source**: Head of Technology (REQ-NEW-04, REQ-12-C05)
**Priority**: Major — required before production launch

**Firestore backup requirements:**
- [ ] Automated daily Firestore export to GCS bucket `csp-firestore-backups-{env}` via Cloud Scheduler
- [ ] Backups retained for 30 days (configurable in IaC)
- [ ] Point-in-time recovery (PITR) enabled on Firestore native mode database
- [ ] Backup success/failure monitored via Cloud Monitoring with alert on failure

**Disaster recovery runbook** (`docs/runbooks/firestore-recovery.md`):
- [ ] How to identify the correct backup timestamp
- [ ] How to import a collection from GCS export into staging for validation
- [ ] How to promote a staging restore to production
- [ ] Recovery procedure tested in staging at least once before production launch

**Credit balance integrity check job** (`jobs/validateCreditIntegrity.js`):
- [ ] Validates `standardCreditsRemaining >= 0` for all users
- [ ] Checks `balanceAfter` consistency in `credit_transactions` ledger against `credit_balances` snapshot
- [ ] Flags divergences as `WARNING` in Cloud Logging
- [ ] Run on-demand via `POST /api/v1/admin/validate-credit-integrity` (admin only)

**Stripe-to-Firestore divergence response:**
- If Stripe reports `canceled` but Firestore shows `active`: auto-remediate subscription status
- If Stripe reports `past_due` but Firestore shows `active`: auto-remediate and send `past_due` banner

---

### 22.6 Stripe-to-Firestore Reconciliation Job

**Source**: Head of Technology (REQ-NEW-05)
**Priority**: Major — required before production launch

**Create `server/src/jobs/reconcileSubscriptions.js`:**

- Iterates all active Stripe subscriptions via `stripe.subscriptions.list()` with pagination
- For each Stripe subscription, compares: `status`, `current_period_end`, `cancel_at_period_end`, `amount` against Firestore `subscriptions/{subId}`
- Divergences logged as `WARNING` to Cloud Logging
- Auto-remediation: if `status` in Firestore is `active` but Stripe reports `canceled`, updates Firestore and `users` doc
- Stores run results in `reconciliation_log/{runId}` collection
- Admin on-demand trigger: `POST /api/v1/admin/reconcile` (admin-only)
- Cloud Scheduler: daily at 03:00 UTC

---

### 22.7 Observability Stack

**Source**: Head of Technology (REQ-12-M06)
**Priority**: Major — required before production launch

Add as mandatory observability requirements (new subsection under Section 10):

**Structured logging** (all backend responses):
```javascript
{
  requestId: string,    // UUID generated per request, propagated via X-Request-ID header
  userId: string | null,
  action: string,       // e.g., 'credits.consume', 'subscription.upgrade'
  durationMs: number,
  statusCode: number,
  errorCode: string | null,
  environment: 'staging' | 'production'
}
```

**Error tracking**: Sentry integration required
- Alert threshold: >10 errors/minute on any endpoint
- All unhandled promise rejections in Express captured
- All Firestore transaction failures logged as breadcrumbs

**Uptime monitoring**: Cloud Monitoring uptime check on `GET /health`
- Alert on 2 consecutive failures → PagerDuty (or equivalent) notification
- Health check response must include `{ status: 'ok', version: string, timestamp: string }`

**X-Request-ID header**: Frontend generates a UUID per request and attaches as `X-Request-ID` header. Backend logs this ID on every request. Enables distributed tracing across React SPA → Express → Firestore → Stripe.

**LLM cost tracking** (Section 8.5 update): Every LLM API call must capture and store in `usage_events.metadata`:
```javascript
{
  promptTokens: number,
  completionTokens: number,
  modelId: string,
  estimatedCostUsd: number,
  latencyMs: number
}
```
Admin margin analysis must aggregate `estimatedCostUsd` from actual metadata, not static per-credit cost assumptions.

---

### 22.8 `usage_events` TTL Policy

**Source**: Head of Technology (MOD-05, REQ-12-M01)
**Priority**: Major — prevent unbounded Firestore cost

Update Section 3.9 (`usage_events` collection):

**TTL requirement**: Each `usage_events` document must include `_expireAt: Timestamp` set to `createdAt + 90 days` at write time. Enable Firestore TTL policy on the `_expireAt` field for the `usage_events` collection.

This replaces the cron-based deletion approach in Section 7.9 for `usage_events` specifically. The cron job (Section 4.8) continues to handle other data collections tied to `dataRetentionDays`.

**BigQuery export**: Analytics requiring data beyond 90 days must query BigQuery. A daily streaming export pipeline from Firestore to BigQuery is required (Cloud Dataflow template or Firestore export → BigQuery load job). Admin dashboards in Section 8.5 for historical analytics beyond 90 days must query BigQuery, not Firestore.

---

### 22.9 Infrastructure as Code

**Source**: Head of Technology (REQ-NEW-01, REQ-12-S01)
**Priority**: Should-have before production launch

All Firestore and cloud infrastructure must be declared as code:

**Files to create:**
- `firestore.indexes.json` — composite index definitions (see Section 20.7)
- `firestore.rules` — security rules committed to version control
- `infrastructure/main.tf` (or `infrastructure/pulumi/index.ts`) — Cloud Run service, Cloud Scheduler jobs, Secret Manager declarations
- `infrastructure/README.md` — bootstrap instructions for new environments

**CI/CD integration:**
- Firestore rules and indexes deployed via `firebase deploy --only firestore:rules,firestore:indexes` on every merge to `main`
- Cloud Run configuration validated against IaC on every PR

---

### 22.10 Incident Response Runbooks

**Source**: Head of Technology (REQ-NEW-06)
**Priority**: Should-have before production launch

Create `docs/runbooks/` directory with the following runbooks:

| Runbook | File | Contents |
|---------|------|----------|
| Stripe webhook backlog | `stripe-webhook-backlog.md` | Diagnose processing lag; force Stripe event resend; trigger reconciliation |
| Credit balance corruption | `credit-balance-corruption.md` | Identify corrupted document; recompute from ledger; safe overwrite procedure |
| Stripe outage | `stripe-outage.md` | Degradation behavior; maintenance mode flag; resume procedure |
| Stripe key rotation | `stripe-key-rotation.md` | Zero-downtime key rotation for `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` |
| Payment failure spike | `payment-failure-spike.md` | Investigate spike; Stripe Radar review; bulk-notify affected users |

Each runbook must include: trigger conditions, severity level, step-by-step resolution, rollback procedure, post-incident documentation template. Runbooks linked from admin security events dashboard (Section 19.6).

---

### 22.11 Cloud Run Infrastructure Requirements

**Source**: Head of Technology (REQ-12-M05)
**Priority**: Major — required before production launch

Update Section 10.5 (Deployment Notes) with minimum infrastructure requirements:

**Recommended deployment target**: Cloud Run (same GCP project as Firebase — no cross-project egress charges)

**Minimum requirements:**
- Minimum 2 instances at all times (no cold start on webhook endpoint)
- Auto-scaling trigger: 70% CPU utilization OR 500ms average response time
- Minimum 512MB RAM per instance
- Health check probe: `GET /health` — must return 200 before instance receives traffic
- Max request timeout: 60 seconds
- Concurrency: 80 requests per instance

**Why minimum 2 instances**: Stripe delivers webhooks with a 30-second timeout. A Cloud Run cold start (0 → 1 instance) takes 3–8 seconds. A cold start during a monthly billing cycle renewal spike (where hundreds of `invoice.paid` events arrive simultaneously) will cause Stripe to retry, creating a self-amplifying load spike.

---

## Wave 2 Integration — Modification Index <!-- Added per Wave 2 expert review -->

The following modifications were made to existing sections as part of Wave 2 integration. Each entry references the original section and the nature of the change.

| Section | Original Value | Modified Value | Source |
|---------|---------------|----------------|--------|
| 2.2.3 Auto-refill monthly cap | No reset mechanism documented | Calendar month reset via cron (1st of month, 00:05 UTC); `autoRefillCountResetAt` field added to schema | Express Dev |
| 2.2.3 Overage cap | No hard cap defined | Add `overageHardCap` per tier (2x monthly credit allocation) to `TIER_CONFIGS` | Express Dev |
| 3.4 `credit_balances` schema | `autoRefillEnabled, autoRefillPackType, autoRefillCount` | Add `autoRefillPending: boolean`, `storageUsedBytes: number`, `last7DaysStandardCreditsConsumed: number`, `last7DaysAiCreditsConsumed: number` | Express Dev |
| 3.5 `credit_transactions` schema | No `stripeEventId` field | Add `stripeEventId: string \| null` for webhook-originated transactions | Express Dev |
| 3.3 `subscriptions` schema | `interval: 'month'` (hardcoded) | Change to `interval: 'month' \| 'year'`; add `annualBillingEquivalent: number \| null` | Express Dev |
| 3.9 `usage_events` | No TTL | Add `_expireAt: Timestamp` (TTL: createdAt + 90 days); Firestore TTL policy required | Head of Tech |
| 3.11 Environment variables | No REDIS_URL | Add `REDIS_URL` for distributed rate limiting | Head of Tech |
| 4.3 Auth middleware | Firestore read on every request | Use Firebase custom claims; Firestore fallback only for pre-claims-sync users | Express Dev |
| 4.4.1 `create-pack-session` | `403: Free tier cannot purchase packs` | Remove 403 restriction; Basic tier may purchase packs | Head of Tech (consistent with Wave 1 Lead PM) |
| 4.4.3 `consumeCredits` response | `{ success, creditsRemaining, source }` | Add `transactionId`, `aiCreditsRemaining`, `autoRefillTriggered` | Express Dev |
| 4.4.6 Webhook `payment_intent.succeeded` | Handles credit pack purchases | Remove pack handler; packs handled exclusively by `checkout.session.completed (mode='payment')` | Express Dev |
| 4.6 Rate limiting | `express-rate-limit` (in-memory) | Redis-backed distributed rate limiting; 20/min for consume (down from 60); global IP limit 200/min | Head of Tech + Express Dev |
| 5.1.2 Pricing card CTA | 3-state logic | Full state table: 7 rows × subscription status | FE Manager |
| 6.3 `SubscriptionContext` | Exposes `consumeCredits` | Remove `consumeCredits`; add `refreshCredits()` and `connectionStatus` | FE Manager |
| 7.4 Feature gate table | `creditPacks: basic denied` | Remove restriction; all tiers may purchase packs | FE Manager (consistent with Wave 1 Lead PM + Section 17.1) |
| 7.10 `past_due` grace period | 7 days | 14 days from `firstPaymentFailedAt` (aligned with Wave 1 Lead PM amendment; confirmed by Express Dev + Head of Tech) | Wave 2 consensus |
| 10.2 Testing strategy | 4 bullet points | E2E test suite (Playwright, 5 scenarios); accessibility testing (jest-axe); coverage thresholds | FE Manager |
| 10.5 Deployment notes | "environment variables" guidance | GCP Secret Manager for all secrets in production; `.env` for local dev only | Head of Tech |

---

*End of requirements document.*
