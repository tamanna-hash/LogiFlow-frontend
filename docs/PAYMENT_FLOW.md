# LogiFlow Payment Flow

## Supported Providers

Only **bKash** is implemented on the backend. Stripe is **NOT** supported. The master prompt mentions Stripe but the backend source contains no Stripe integration. This is a confirmed backend gap.

---

## bKash Payment Flow

### Pre-conditions
- User must be authenticated as `CUSTOMER` or `ADMIN`
- Shipment status must be `CREATED`
- Shipment must not already have a `COMPLETED` payment
- No existing `PENDING` payment with bKash ID (active payment in progress)

### Step-by-step

```
1. Customer views shipment (status: CREATED, paymentStatus: PENDING)
2. Customer clicks "Pay with bKash"
3. Frontend calls: POST /api/v1/payments/bkash/initiate
   Body: { shipmentId }
   Response: { paymentId, bkashURL, amount }
4. Frontend redirects window to bkashURL
5. Customer completes payment on bKash payment page
6. bKash redirects to: GET /api/v1/payments/bkash/callback?paymentID=<id>
7. Backend:
   a. Finds payment record by bkashPaymentId
   b. Calls bKash executepayment API (server-side verification)
   c. Validates transactionStatus, amount, merchantInvoiceNumber
   d. On success: updates payment to COMPLETED, updates shipment paymentStatus to COMPLETED
   e. On failure: updates payment to FAILED
   f. Redirects browser to frontend (URL configured in BKASH_CALLBACK_URL env var)
8. Frontend (on return page):
   a. Reads shipmentId from URL or local state
   b. Calls GET /api/v1/payments/shipment/:shipmentId
   c. Displays confirmed status from backend
```

### Frontend redirect pages needed
- `/payment/success?shipmentId=<id>` — poll payment status, show confirmed result
- `/payment/failure?shipmentId=<id>` — show failure, offer retry option
- `/payment/pending?shipmentId=<id>` — show pending state if callback hasn't completed

### Status polling strategy
After returning from bKash:
1. Immediately call `GET /payments/shipment/:shipmentId`
2. If status is `COMPLETED` → show success
3. If status is `FAILED` → show failure
4. If status is still `PENDING` → poll every 3s for up to 30s, then show "verification pending" message
5. Never mark as paid until backend confirms `COMPLETED`

### Error handling
- Network error during initiation → show error, allow retry
- bKash URL unavailable → show error
- Backend callback verification fails → FAILED status displayed
- Payment already in progress (409) → inform user, show existing payment
- Amount mismatch (detected by backend) → FAILED status

---

## Payment Status Values

| Status | Description | Frontend display |
|--------|-------------|-----------------|
| `PENDING` | Initiated, not yet confirmed | "Payment pending" |
| `COMPLETED` | Verified by backend | "Payment confirmed" ✅ |
| `FAILED` | Verification failed | "Payment failed" ❌ |
| `CANCELLED` | Cancelled | "Payment cancelled" |
| `REFUND_PENDING` | Refund initiated | "Refund pending" |
| `REFUNDED` | Refunded | "Refunded" |

---

## Security Notes

- Frontend never trusts browser redirect as proof of payment
- Frontend always fetches payment status from backend after redirect
- Backend verifies amount, transaction status, and invoice number
- No payment credentials are stored or exposed in frontend
- bKash App Key/Secret remain server-side only

---

## Stripe Gap Documentation

The master prompt specifies Stripe Checkout integration. The backend contains **no Stripe code**:
- No `stripe` package in `package.json`
- No `/payments/stripe/*` routes
- No Stripe webhook handler
- No `STRIPE_*` environment variables in `.env.example`

**Required backend work to enable Stripe**:
1. Install and configure `stripe` SDK
2. Create `POST /payments/stripe/checkout-session` endpoint
3. Create `POST /payments/stripe/webhook` endpoint with signature verification
4. Add `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID` env vars
5. Handle `checkout.session.completed` webhook event
6. Associate Stripe session with shipment payment record

Until this backend work is done, the frontend will display bKash as the only payment method with a note that additional providers may be available in future.
