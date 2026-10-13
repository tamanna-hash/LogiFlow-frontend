# 📦 LogiFlow

**LogiFlow** is Bangladesh's intelligent courier and logistics management platform — built to handle the complete parcel delivery lifecycle from booking to doorstep delivery.

<img src="https://i.ibb.co.com/b5QhwLmN/logiflow.png" height="300px" width="400px">

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-%234169E1.svg?style=for-the-badge&logo=postgresql&logoColor=white) 
![Prisma](https://img.shields.io/badge/Prisma-%232D3748.svg?style=for-the-badge&logo=Prisma&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🔗 Live Links

| Resource | URL |
|----------|-----|
| 🌐 **Live App** | [https://logiflow-hash.vercel.app](https://logiflow-hash.vercel.app) |
| 🛠️ **Backend API** | [https://logiflow-backend-ai0r.onrender.com/api/v1](https://logiflow-backend-ai0r.onrender.com/api/v1) |
| 📖 **API Docs** | [Postman Collection](https://documenter.getpostman.com/view/49731960/2sBYAxPV15) |
| 🐙 **GitHub** | [LogiFlow Repository](https://github.com/tamanna-hash/LogiFlow) |

---

## ✨ Features

- 🔐 **Multi-role authentication** — Customer, Courier, Hub Manager, Operations Manager, Admin
- 📍 **Real-time shipment tracking** — public tracking + authenticated timeline
- 💳 **bKash & Stripe payment integration** — secure server-verified callbacks
- 🔑 **Google OAuth** — one-click sign in with account auto-linking
- 🔒 **Forgot password flow** — email-based reset with 1-hour token expiry
- 🎨 **Modern UI** — shadcn/ui + Radix primitives + Tailwind CSS 4
- 📱 **Fully responsive** — mobile, tablet, and desktop
- 🌙 **Dark mode** — system-aware with manual override
- ♿ **Accessible** — WCAG-aligned, keyboard navigable, ARIA labels
- 🔄 **Automatic token refresh** — Axios interceptors handle JWT rotation
- ⚡ **App Router architecture** — server + client components, optimized rendering
- 🎭 **Framer Motion animations** — subtle entrance animations and transitions

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd LogiFlow

# Install dependencies
npm install --legacy-peer-deps

# Copy environment file
cp .env.example .env.local
# Fill in NEXT_PUBLIC_API_URL and NEXT_PUBLIC_APP_URL

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Environment Variables

```env
# Backend API base URL (required)
NEXT_PUBLIC_API_URL=https://logiflow-backend-ai0r.onrender.com/api/v1

# This app's public URL (used for Open Graph metadata)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> Never put backend secrets (JWT keys, database URLs, API credentials) in environment variables here. Only `NEXT_PUBLIC_*` variables are safe to expose to the browser.

---

## 🛠️ Technology Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 (strict mode) |
| **Styling** | Tailwind CSS 4 |
| **UI Components** | Radix UI + shadcn/ui |
| **Server State** | TanStack Query v5 |
| **Client State** | Zustand |
| **Forms** | React Hook Form + Zod |
| **HTTP Client** | Axios (with interceptors) |
| **Animations** | Framer Motion v14 |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **Notifications** | Sonner |
| **Unit Testing** | Vitest + React Testing Library |
| **E2E Testing** | Playwright |
| **Deployment** | Vercel |

---

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages (no nav/footer)
│   │   ├── login/                # Login page + form
│   │   ├── register/             # Registration page + form
│   │   ├── verify-email/         # OTP verification
│   │   ├── forgot-password/      # Forgot password flow
│   │   ├── reset-password/       # Password reset with token
│   │   └── callback/             # Google OAuth callback handler
│   │
│   ├── (public)/                 # Public marketing pages (with nav + footer)
│   │   ├── track/                # Public shipment tracker
│   │   ├── services/             # Services overview
│   │   ├── pricing/              # Pricing information
│   │   ├── about/                # About page
│   │   └── contact/              # Contact page
│   │
│   ├── dashboard/                # Protected role-based dashboards
│   │   ├── customer/             # Customer: shipments, tracking, payments
│   │   ├── courier/              # Courier: assignments, pickups, deliveries
│   │   ├── hub/                  # Hub Manager: hub ops, transfers
│   │   ├── operations/           # Ops Manager: couriers, statuses, assignments
│   │   └── admin/                # Admin: users, hubs, pricing, analytics
│   │
│   ├── payment/                  # Payment result pages
│   │   ├── success/              # Payment success + polling
│   │   └── failure/              # Payment failure handler
│   │
│   ├── page.tsx                  # Home / landing page
│   ├── layout.tsx                # Root layout (Providers, metadata)
│   ├── globals.css               # Global styles + CSS variables
│   └── providers.tsx             # QueryClient, ThemeProvider, auth sync
│
├── components/
│   ├── ui/                       # shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   └── ...
│   │
│   ├── shared/                   # Reusable app components
│   │   ├── nav/
│   │   │   ├── PublicNav.tsx     # Marketing site nav
│   │   │   ├── DashboardNav.tsx  # Dashboard top bar
│   │   │   └── DashboardSidebar.tsx
│   │   ├── FormField.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorState.tsx
│   │   ├── StatCard.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── Pagination.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── ...
│   │
│   ├── auth/
│   │   └── GoogleSignInButton.tsx
│   │
│   └── animations/               # Framer Motion wrappers
│       ├── FadeIn.tsx
│       ├── SlideUp.tsx
│       ├── ScaleIn.tsx
│       └── StaggerContainer.tsx
│
├── features/                     # Feature-based API + hooks
│   ├── auth/
│   │   ├── api.ts                # Auth API calls
│   │   └── hooks.ts              # useLogin, useRegister, useForgotPassword...
│   ├── shipments/
│   ├── tracking/
│   ├── payments/
│   ├── couriers/
│   ├── hubs/
│   ├── operations/
│   ├── pricing/
│   ├── notifications/
│   └── admin/
│
├── lib/
│   ├── api/
│   │   ├── client.ts             # Axios instance + interceptors
│   │   ├── endpoints.ts          # All API endpoint constants
│   │   └── query-client.ts       # TanStack Query config
│   ├── auth.ts                   # Zustand auth store + helpers
│   ├── utils.ts                  # cn() and misc utilities
│   └── validations/              # Zod schemas for forms
│
├── types/                        # TypeScript interfaces
│   └── index.ts
│
├── hooks/                        # Shared custom hooks
│
├── config/
│   └── index.ts                  # App constants (APP_NAME, API_URL, etc.)
│
├── middleware.ts                  # Route protection + role-based redirects
│
└── tests/                        # Vitest unit tests
```

---

## 👥 User Roles & Dashboards

| Role | Route | Capabilities |
|------|-------|-------------|
| **Customer** | `/dashboard/customer` | Create shipments, track packages, pay via bKash/Stripe, view history |
| **Courier** | `/dashboard/courier` | View assignments, accept/reject, confirm pickups, record delivery |
| **Hub Manager** | `/dashboard/hub` | Manage hub shipments, dispatch transfers, manage local couriers |
| **Operations Manager** | `/dashboard/operations` | Assign couriers, update statuses, cross-hub visibility |
| **Admin** | `/dashboard/admin` | User management, hub/zone/pricing admin, analytics, audit logs |

---

## 🔐 Authentication Flow

```
Register (email + password)
    ↓
OTP sent to email (6-digit, 5 min expiry)
    ↓
Verify OTP → Account created
    ↓
Login → JWT access token (15 min) + refresh token (7 days)
    ↓
Tokens stored in localStorage
    ↓
Axios interceptor auto-refreshes on 401
    ↓
Routing hints written to cookies for middleware
```

**Google OAuth:**
```
Click "Continue with Google"
    ↓
Backend redirects to Google
    ↓
Google redirects to /api/v1/auth/google/callback
    ↓
Backend issues tokens → redirects to /callback?accessToken=...
    ↓
CallbackHandler.tsx reads + strips tokens from URL
    ↓
Zustand store hydrated → redirect to role dashboard
```

**Forgot Password:**
```
Enter email → POST /auth/forgot-password
    ↓
Email with reset link sent (1-hour token, stored hashed in Redis)
    ↓
Click link → /reset-password?token=...
    ↓
POST /auth/reset-password → token verified, password updated
    ↓
All sessions revoked → redirect to login
```

---

## 💳 Payment Integration

### bKash

```
Create shipment → POST /payments/bkash/initiate
    ↓
Redirect browser to bkashURL
    ↓
User completes payment on bKash
    ↓
bKash → backend callback (server-to-server verification)
    ↓
Backend redirects to /payment/success?shipmentId=...
    ↓
Frontend polls GET /payments/shipment/:id until COMPLETED
```

### Stripe

```
Create shipment → POST /payments/stripe/checkout
    ↓
Redirect to Stripe Checkout page
    ↓
User completes payment
    ↓
Stripe webhook → backend signature verification
    ↓
Stripe redirects to /payment/success?shipmentId=...
    ↓
Frontend polls to confirm status
```

> The app **never trusts a redirect alone** — payment status is always confirmed from the backend.

---

## 🧩 Key Architecture Decisions

- **App Router** over Pages Router — layouts, loading states, and server components
- **TanStack Query** for all server state — no prop drilling, automatic cache invalidation
- **Zustand** only for auth session — minimal client state
- **Axios interceptors** for token refresh — all 401s trigger a silent refresh before retry
- **Middleware** for route protection — fast edge-level redirect without client JS
- **CSS variables** for theming — full dark mode with zero flash on load
- **Feature folders** — each domain (shipments, payments, etc.) owns its own `api.ts` and `hooks.ts`

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 3000) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run type-check` | TypeScript type check |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest) |
| `npm run test:watch` | Tests in watch mode |
| `npm run test:coverage` | Coverage report |
| `npm run test:e2e` | Playwright E2E tests |
| `npm run test:e2e:ui` | E2E tests in interactive UI |

---

## 🧪 Testing

```bash
# Unit tests — 37 passing
npm test

# Coverage report
npm run test:coverage

# E2E tests (requires running backend + installed browsers)
npx playwright install   # first time only
npm run test:e2e
```

---

## 🚢 Deployment (Vercel)

1. Connect your GitHub repo to [Vercel](https://vercel.com)
2. Add environment variables:
   - `NEXT_PUBLIC_API_URL` → your backend URL
   - `NEXT_PUBLIC_APP_URL` → your Vercel URL
3. Deploy — Vercel auto-detects Next.js

Make sure the backend has:
- `FRONTEND_URL` set to your Vercel domain (CORS + OAuth redirects)
- `GOOGLE_CALLBACK_URL` pointing to your backend's `/api/v1/auth/google/callback`

---

## 🐛 Known Limitations

- **No forgot password flow on Google accounts** — Google-only users cannot reset a password they never set (they should use Set Password in account settings instead)
- **E2E tests** — Playwright is installed and configured but test cases are not yet written

---

## 📄 License

MIT License

---

## 💙 A Note from the Developer

Hello! I'm **Tamanna**.

Building LogiFlow gave me the opportunity to deepen my understanding of **Next.js App Router architecture**, **server and client component boundaries**, **role-based UI design**, **JWT authentication on the client**, and crafting **responsive, accessible interfaces** with **Tailwind CSS** and **shadcn/ui**.

Every feature — from the **multi-role authentication system** to **real-time shipment tracking**, **bKash and Stripe payment integration**, **Google OAuth with auto-linking**, **forgot password flow**, and **courier assignment workflows** — pushed me to think carefully about user experience, state management, API integration, and the boundary between server and client rendering.

I believe great interfaces are built through continuous learning, attention to detail, and genuine care for the people using them. Thank you for taking the time to explore my work. I hope you find it useful!

Thank you for checking out this project! ❤️

---

<div align="center">
  <strong>Built with ❤️ using Next.js, TypeScript, and Tailwind CSS</strong>
</div>
