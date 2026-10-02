# LogiFlow Frontend — Deployment Checklist

## Vercel Deployment

### Pre-deployment
- [ ] Production backend is deployed and healthy (`GET /health`)
- [ ] Backend `FRONTEND_URL` env var is set to the Vercel deployment URL
- [ ] bKash `BKASH_CALLBACK_URL` on backend points to backend callback (not frontend)
- [ ] Backend CORS allows the Vercel deployment origin

### Vercel Environment Variables
Set these in Vercel project settings → Environment Variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_API_URL` | `https://logiflow-backend.onrender.com/api/v1` | Backend API base URL |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Frontend deployment URL |

**DO NOT add these to Vercel:**
- Any `JWT_*` secrets (backend only)
- `STRIPE_SECRET_KEY` (not implemented)
- `BKASH_*` secrets (backend only)
- `DATABASE_URL` (backend only)

### Vercel Build Settings
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install --legacy-peer-deps`
- Node.js version: 20.x

### Post-deployment verification
- [ ] Homepage loads
- [ ] Public tracking works with a real tracking number
- [ ] Registration sends email (via backend Resend)
- [ ] Login redirects to correct dashboard per role
- [ ] Protected pages redirect to /login when unauthenticated
- [ ] bKash payment initiation redirects to bKash URL
- [ ] bKash callback returns to correct frontend URL
- [ ] Payment result page polls and shows confirmed status
- [ ] Admin stats page shows real data
- [ ] Check browser console for CORS errors

---

## Backend Changes Required for Full Functionality

### Required before go-live
1. **FRONTEND_URL env var** on Render — set to Vercel deployment URL for CORS
2. **bKash callback redirect** — backend `handleBkashCallback` must redirect to:
   `${FRONTEND_URL}/payment/success?shipmentId=<id>` on success  
   `${FRONTEND_URL}/payment/failure?shipmentId=<id>` on failure  
   (Currently the backend redirects to frontend but the exact URL format must be confirmed)

### Nice-to-have
3. **Password reset endpoint** — `POST /auth/forgot-password` and `POST /auth/reset-password`
4. **Demo account API** — dedicated endpoint for demo login without hardcoded credentials
5. **Stripe integration** — `POST /payments/stripe/checkout-session` + webhook handler

---

## Demo Account Setup

For demo login buttons to work, create these accounts on the backend:

| Role | Email | Password |
|------|-------|---------|
| Customer | demo_customer@example.com | Demo@12345 |
| Courier | demo_courier@example.com | Demo@12345 |
| Hub Manager | demo_hub@example.com | Demo@12345 |
| Operations | demo_ops@example.com | Demo@12345 |
| Admin | demo_admin@example.com | Demo@12345 |

Then update NEXT_PUBLIC credentials in `.env.local` if needed.

**Important**: These must be real accounts on the backend. The frontend never bypasses authentication.
