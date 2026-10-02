# LogiFlow Frontend

Production-ready frontend for LogiFlow — a courier and logistics management platform for Bangladesh.

## Technology Stack

- **Framework**: Next.js 16 App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 + CSS variables design tokens
- **UI Primitives**: Radix UI via shadcn-compatible components
- **Server State**: TanStack Query v5
- **HTTP Client**: Axios with automatic token refresh
- **Forms**: React Hook Form + Zod
- **Client State**: Zustand (auth session only)
- **Notifications**: Sonner
- **Icons**: Lucide React
- **Testing**: Vitest + React Testing Library
- **E2E**: Playwright (scaffolded)

## Prerequisites

- Node.js 20+
- npm

## Installation

```bash
cd LogiFlow_Frontend
npm install --legacy-peer-deps
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_API_URL=https://logiflow-backend.onrender.com/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Never put backend secrets (JWT keys, bKash credentials, database URLs) in the frontend environment.

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run type-check` | TypeScript check |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | Playwright E2E tests |

## Authentication Architecture

- Backend issues JWT access tokens (15 min) and opaque refresh tokens (7 days)
- Frontend stores tokens in `localStorage` (access + refresh keys)
- Axios interceptor automatically refreshes expired access tokens
- Auth state also stored in Zustand with `localStorage` persistence
- Non-sensitive routing hints (`logiflow_token`, `logiflow_role`) are written to cookies for middleware
- Middleware performs preliminary routing checks; backend enforces all real authorization

## Roles

| Role | Dashboard Route | Description |
|------|----------------|-------------|
| CUSTOMER | `/dashboard/customer` | Create shipments, track, pay via bKash |
| COURIER | `/dashboard/courier` | Accept assignments, confirm pickup, record delivery |
| HUB_MANAGER | `/dashboard/hub` | Manage hub shipments, transfers, and couriers |
| OPERATIONS_MANAGER | `/dashboard/operations` | Assign couriers, update statuses, monitor operations |
| ADMIN | `/dashboard/admin` | Full platform management |

## Payment Flow

Only bKash is supported by the backend. The flow:

1. Customer clicks **Pay with bKash** on a CREATED shipment
2. Frontend calls `POST /payments/bkash/initiate`
3. Backend returns a `bkashURL`
4. Frontend redirects the browser to bKash
5. After payment, bKash redirects to backend callback
6. Backend verifies via bKash `executepayment` API
7. Backend redirects browser to `/payment/success?shipmentId=<id>`
8. Frontend polls `GET /payments/shipment/:shipmentId` until status is COMPLETED or FAILED

Payment status is always confirmed from the backend — the frontend never trusts a redirect alone.

## API Integration

All API calls go through `src/lib/api/client.ts` (Axios instance). Endpoints are defined in `src/lib/api/endpoints.ts`. TanStack Query hooks live in each feature's `hooks.ts` file.

## Testing

```bash
# Unit tests (37 tests)
npm test

# E2E (requires browser and running backend)
npm run test:e2e
```

## Deployment

See `docs/DEPLOYMENT_CHECKLIST.md` for full Vercel deployment instructions.

Quick summary:
1. Set `NEXT_PUBLIC_API_URL` in Vercel environment variables
2. Ensure backend `FRONTEND_URL` allows the Vercel origin
3. Deploy — build command is `npm run build`

## Documentation

- `docs/API_AUDIT.md` — Full backend API contract
- `docs/ROLE_PERMISSIONS.md` — Role-permission matrix
- `docs/PAYMENT_FLOW.md` — Payment integration details
- `docs/IMPLEMENTATION_STATUS.md` — Page and API integration status
- `docs/DEPLOYMENT_CHECKLIST.md` — Deployment steps

## Known Limitations

1. **Stripe not supported** — backend has no Stripe integration
2. **No password reset** — backend lacks forgot-password endpoint
3. **Demo accounts** — demo login buttons pre-fill credentials but require real accounts on backend
4. **bKash redirect URL** — backend must be configured to redirect to correct frontend URL after payment callback
5. **E2E tests** — scaffolded but not run (requires browser + live backend + test accounts)

## Backend

The backend lives in `../LogiFlow_Backend`. It is a Node.js/Express API deployed on Render.
