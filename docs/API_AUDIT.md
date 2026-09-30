# LogiFlow API Audit

**Status**: Audited from backend source code (confirmed)  
**Backend base URL**: `https://logiflow-backend.onrender.com/api/v1`  
**Auth scheme**: Bearer token (JWT access token in `Authorization: Bearer <token>` header, also checked in `req.cookies.accessToken`)  
**Response envelope**: `{ success: boolean, message: string, data: T, meta?: PaginationMeta }`  
**Error envelope**: `{ success: false, message: string, errors: FieldError[] }`  
**Pagination meta**: `{ page, limit, total, totalPages }`

---

## Authentication & Authorization

### Roles
`CUSTOMER` | `COURIER` | `HUB_MANAGER` | `OPERATIONS_MANAGER` | `ADMIN`

### Token strategy
- **Access token**: Short-lived JWT (15 min default), signed `HS256`  
  Payload: `{ sub: userId, role: string, iat, exp }`  
  Sent as `Authorization: Bearer <token>` OR `accessToken` cookie  
- **Refresh token**: Opaque 128-char hex, stored hashed in DB, 7-day TTL  
  The frontend stores the raw refresh token and sends it in request body for `/auth/refresh` and `/auth/logout`

---

## Auth Endpoints — `/api/v1/auth`

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| POST | `/auth/register` | Public (rate-limited) | `{ firstName, lastName, email, password, phone? }` | `{ message }` (OTP sent to email) |
| POST | `/auth/verify-email` | Public (rate-limited) | `{ email, otp }` | `{ user, tokens: { accessToken, refreshToken } }` |
| POST | `/auth/login` | Public (rate-limited) | `{ email, password }` | `{ user, tokens: { accessToken, refreshToken } }` |
| POST | `/auth/refresh` | Public | `{ refreshToken }` | `{ accessToken, refreshToken }` |
| POST | `/auth/logout` | Authenticated | `{ refreshToken }` | success message |
| GET | `/auth/google` | Public | — | Redirect to Google OAuth |
| GET | `/auth/google/callback` | Public | — | Redirect to frontend with tokens |
| PATCH | `/auth/change-password` | Authenticated (rate-limited) | `{ currentPassword, newPassword }` | success message |

**Notes**:
- Registration is a two-step flow: register → verify-email with OTP
- OTP is 6 digits, expires in 5 minutes
- Re-registering before verification overwrites the pending OTP
- No password reset endpoint exists in the backend (gap)
- Google OAuth callback destination and token delivery method need confirmation from deployed env

---

## User Endpoints — `/api/v1/users`

All require authentication.

| Method | Path | Auth | Body/Params | Response |
|--------|------|------|-------------|----------|
| GET | `/users/me` | Any role | — | Full user + role profile |
| PATCH | `/users/me` | Any role | multipart/form-data: profile fields + `avatar` (optional file) | Updated user |
| GET | `/users` | ADMIN | Query: `page, limit, role, isActive, search, sortBy, sortOrder, includeDeleted` | Paginated users |
| GET | `/users/:id` | ADMIN | — | Full user + role profile |
| PATCH | `/users/:id/role` | ADMIN | `{ role }` | Updated user |
| DELETE | `/users/:id` | ADMIN | — | Soft delete |

**Profile response includes**:
```json
{
  "id", "email", "firstName", "lastName", "phone", "role",
  "avatarUrl", "isEmailVerified", "isActive", "createdAt", "updatedAt",
  "customerProfile": { "defaultAddress", "city", "postalCode" },
  "courierProfile": { "hubId", "vehicleType", "vehicleNumber", "licenseNumber", "availability", "totalDeliveries" },
  "hubManagerProfile": { "hubId", "hub": { "name", "code" } }
}
```

---

## Shipment Endpoints — `/api/v1/shipments`

All require authentication.

| Method | Path | Auth | Body/Query | Response |
|--------|------|------|-----------|----------|
| POST | `/shipments` | CUSTOMER, ADMIN | Create shipment body | Created shipment + priceBreakdown |
| GET | `/shipments` | Any role (scoped) | Query filters | Paginated shipments |
| GET | `/shipments/:id` | Any role (ownership-scoped) | — | Shipment detail |
| PATCH | `/shipments/:id` | CUSTOMER, ADMIN | `{ recipientName?, recipientPhone?, recipientAddress?, recipientCity?, specialInstructions? }` | Updated shipment |
| POST | `/shipments/:id/cancel` | CUSTOMER, OPERATIONS_MANAGER, ADMIN | `{ reason }` | success |
| POST | `/shipments/:id/pickup-request` | CUSTOMER, ADMIN | `{ scheduledAt?, notes? }` | Pickup request |
| GET | `/shipments/:id/tracking` | Any role (ownership-scoped) | — | Tracking events array |
| POST | `/shipments/:id/return` | OPERATIONS_MANAGER, ADMIN | `{ reason }` | success |

**Create shipment body**:
```json
{
  "senderName", "senderPhone", "senderAddress", "senderCity",
  "originZoneId", "recipientName", "recipientPhone",
  "recipientAddress", "recipientCity", "destinationZoneId",
  "deliveryType": "STANDARD|EXPRESS|SAME_DAY",
  "parcelType": "DOCUMENT|REGULAR|FRAGILE|OVERSIZED",
  "declaredWeightKg", "description?", "specialInstructions?",
  "items": [{ "description", "weightKg", "quantity?", "parcelType?" }]
}
```

**List query params**: `page, limit, status, paymentStatus, deliveryType, search, sortBy, sortOrder, fromDate, toDate`

**Shipment list response fields**: `id, trackingNumber, status, paymentStatus, senderName, recipientName, recipientCity, deliveryType, parcelType, price, createdAt, updatedAt`

**Shipment detail adds**: sender/recipient full details, weights, zones, currentHub, items, assignment info

**Tracking event shape**: `{ id, status, description, location, createdAt }`

**Role-scoped access**:
- CUSTOMER: only own shipments
- COURIER: only shipments with active assignment for them
- HUB_MANAGER: only shipments at their hub
- OPERATIONS_MANAGER, ADMIN: all shipments

**Business rules**:
- Customer can edit only when status = `CREATED`
- Customer can cancel only when status in `[CREATED, PICKUP_REQUESTED]`
- Pickup request requires status = `CREATED` AND `paymentStatus = COMPLETED`
- Return requires status = `DELIVERY_FAILED`

**Shipment status state machine**:
```
CREATED → PICKUP_REQUESTED → ASSIGNED → PICKED_UP → AT_ORIGIN_HUB
→ IN_TRANSIT → AT_DESTINATION_HUB → OUT_FOR_DELIVERY → DELIVERED
                                                      ↘ DELIVERY_FAILED → OUT_FOR_DELIVERY (retry)
                                                                        → RETURN_INITIATED → RETURNING → RETURNED
CREATED/PICKUP_REQUESTED → CANCELLED
```

---

## Public Tracking — `/api/v1/tracking`

| Method | Path | Auth | Response |
|--------|------|------|----------|
| GET | `/tracking/:trackingNumber` | Public (rate-limited) | Shipment summary + tracking events |

**Public fields** (no personal data): `trackingNumber, status, paymentStatus, deliveryType, recipientCity, createdAt, updatedAt, originZone.name, destinationZone.name, currentHub.{name, city}, trackingEvents[{status, description, location, createdAt}]`

---

## Pricing Endpoints — `/api/v1/pricing`

| Method | Path | Auth | Body/Params | Response |
|--------|------|------|-------------|----------|
| POST | `/pricing/rules` | ADMIN | Pricing rule body | Created rule |
| GET | `/pricing/rules` | OPERATIONS_MANAGER, ADMIN | — | Pricing rules list |
| PATCH | `/pricing/rules/:id` | ADMIN | Partial pricing rule | Updated rule |
| DELETE | `/pricing/rules/:id` | ADMIN | — | Deleted |
| POST | `/pricing/calculate` | CUSTOMER, OPERATIONS_MANAGER, ADMIN | `{ originZoneId, destinationZoneId, deliveryType, parcelType, weightKg }` | Price breakdown |

**Calculate price response**: `{ total, breakdown: { basePrice, weightCharge, zoneSurcharge, deliveryTypeSurcharge } }`

---

## Hub Endpoints — `/api/v1/hubs`

| Method | Path | Auth | Body/Params | Response |
|--------|------|------|-------------|----------|
| POST | `/hubs` | ADMIN | `{ name, code, address, city, phone? }` | Created hub |
| GET | `/hubs` | HUB_MANAGER, OPERATIONS_MANAGER, ADMIN | Query: `page, limit, isActive, search` | Paginated hubs |
| GET | `/hubs/:id` | HUB_MANAGER, OPERATIONS_MANAGER, ADMIN | — | Hub + zones + shipment count |
| PATCH | `/hubs/:id` | ADMIN | Partial hub | Updated hub |
| DELETE | `/hubs/:id` | ADMIN | — | Soft deactivate |
| POST | `/hubs/:hubId/transfers` | HUB_MANAGER, OPERATIONS_MANAGER, ADMIN | `{ shipmentId, toHubId, estimatedArrival?, notes? }` | Transfer created |
| PATCH | `/hubs/:hubId/transfers/:transferId/arrive` | HUB_MANAGER, OPERATIONS_MANAGER, ADMIN | — | Arrival confirmed |

**HUB_MANAGER scope**: Can only access/modify their own hub. Transfers scoped to own hub.

---

## Zone Endpoints — `/api/v1/zones`

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| POST | `/zones` | ADMIN | `{ name, code, hubId, description? }` | Created zone |
| GET | `/zones` | HUB_MANAGER, OPERATIONS_MANAGER, ADMIN | Query: `hubId?, isActive?, page, limit` | Paginated zones |
| PATCH | `/zones/:id` | ADMIN | Partial zone (no hubId) | Updated zone |
| DELETE | `/zones/:id` | ADMIN | — | Deactivated (soft) |

---

## Courier Endpoints — `/api/v1/courier`

All require `COURIER` role.

| Method | Path | Auth | Body/Params | Response |
|--------|------|------|-------------|----------|
| GET | `/courier/assignments` | COURIER | Query: `page, limit, status, type` | Paginated assignments |
| PATCH | `/courier/assignments/:id/accept` | COURIER | — | success |
| PATCH | `/courier/assignments/:id/reject` | COURIER | `{ reason? }` | success |
| PATCH | `/courier/availability` | COURIER | `{ availability: "AVAILABLE"|"UNAVAILABLE" }` | success |
| POST | `/courier/shipments/:shipmentId/pickup-confirm` | COURIER | — | success |
| POST | `/courier/shipments/:shipmentId/deliver` | COURIER | multipart: `notes?`, `proofImage` (optional file) | success |
| POST | `/courier/shipments/:shipmentId/delivery-failed` | COURIER | `{ failureReason, notes? }` | success |
| GET | `/courier/earnings` | COURIER | Query: `page, limit, fromDate, toDate` | Deliveries + totalDeliveries |

**Assignment status values**: `ACTIVE | COMPLETED | CANCELLED | REJECTED`  
**Assignment type values**: `PICKUP | DELIVERY | RETURN`  
**Availability**: Can only set `AVAILABLE` or `UNAVAILABLE`; `ON_DELIVERY` is system-managed  
**DeliveryFailureReason**: `NO_ONE_HOME | ADDRESS_NOT_FOUND | REFUSED_BY_RECIPIENT | DAMAGED_IN_TRANSIT | OTHER`

---

## Operations Endpoints — `/api/v1/operations`

| Method | Path | Auth | Body/Params | Response |
|--------|------|------|-------------|----------|
| POST | `/operations/assignments` | HUB_MANAGER, OPERATIONS_MANAGER, ADMIN | `{ shipmentId, courierProfileId, type }` | Assignment created |
| PATCH | `/operations/assignments/:id/cancel` | OPERATIONS_MANAGER, ADMIN | `{ reason }` | success |
| PATCH | `/operations/shipments/:id/status` | OPERATIONS_MANAGER, ADMIN | `{ status, reason? }` | Updated shipment |
| GET | `/operations/couriers` | HUB_MANAGER, OPERATIONS_MANAGER, ADMIN | Query: `page, limit, availability, hubId, search` | Paginated couriers |
| PATCH | `/operations/couriers/:courierProfileId/availability` | HUB_MANAGER, OPERATIONS_MANAGER, ADMIN | `{ availability }` | success |

**Assignment type / valid states**:
- `PICKUP`: requires `PICKUP_REQUESTED`
- `DELIVERY`: requires `AT_DESTINATION_HUB`
- `RETURN`: requires `RETURN_INITIATED`

**Status override**: ADMIN can override any transition (with reason). OPERATIONS_MANAGER can only perform valid transitions.

**HUB_MANAGER scope**: Can only assign couriers from their own hub; can only update couriers at their hub.

---

## Payment Endpoints — `/api/v1/payments`

| Method | Path | Auth | Body/Params | Response |
|--------|------|------|-------------|----------|
| POST | `/payments/bkash/initiate` | CUSTOMER, ADMIN (rate-limited) | `{ shipmentId }` | `{ paymentId, bkashURL, amount }` |
| GET | `/payments/bkash/callback` | Public (no JWT — bKash redirect) | Query: `paymentID` | Redirect to frontend success/failure URL |
| GET | `/payments/shipment/:shipmentId` | CUSTOMER, ADMIN | — | Payment record |
| GET | `/payments` | ADMIN | Query: `page, limit, status, fromDate, toDate, search` | Paginated payments |

**Payment status values**: `PENDING | COMPLETED | FAILED | CANCELLED | REFUND_PENDING | REFUNDED`

**bKash flow**:
1. Frontend calls `POST /payments/bkash/initiate` with `shipmentId`
2. Backend returns `{ bkashURL }` — frontend redirects to this URL
3. bKash redirects to `GET /payments/bkash/callback?paymentID=...`
4. Backend verifies via bKash executepayment API, updates DB, **then redirects browser to frontend**
5. Frontend retrieves payment status via `GET /payments/shipment/:shipmentId`

**No Stripe support** — backend has no Stripe endpoints. Only bKash is implemented.

**Payment pre-conditions**: Shipment status must be `CREATED`. Only one pending payment per shipment.

---

## Notification Endpoints — `/api/v1/notifications`

All require authentication.

| Method | Path | Auth | Query | Response |
|--------|------|------|-------|----------|
| GET | `/notifications` | Any role | `page, limit, isRead, type` | Paginated notifications + unreadCount |
| PATCH | `/notifications/read-all` | Any role | — | Updated count |
| PATCH | `/notifications/:id/read` | Any role | — | success |

**Notification shape**: `{ id, type, title, message, isRead, readAt, metadata, createdAt }`

---

## Admin Endpoints — `/api/v1/admin`

| Method | Path | Auth | Query | Response |
|--------|------|------|-------|----------|
| GET | `/admin/stats` | ADMIN | — | System statistics (cached 2 min) |
| GET | `/admin/audit-logs` | ADMIN | `page, limit, action, actorId, resourceType, resourceId, fromDate, toDate` | Paginated audit logs |
| GET | `/admin/audit-logs/operational` | OPERATIONS_MANAGER, ADMIN | `page, limit, action, fromDate, toDate` | Paginated operational logs |

**System stats response**:
```json
{
  "totalUsers", "totalShipments", "activeShipments", "deliveredToday",
  "totalRevenue", "pendingPayments",
  "hubs": { "total", "active" }
}
```

---

## API Gaps and Missing Features

| Gap | Impact | Notes |
|-----|--------|-------|
| No password reset / forgot-password endpoint | Medium | Backend does not have it. Frontend cannot implement password reset flow. |
| No Stripe payment support | High | Backend only has bKash. Stripe Checkout described in requirements does not exist. |
| No dedicated resend-verification-email endpoint | Low | User must re-register with same email to get new OTP. |
| bKash callback destination URL not configurable per-request | Medium | Backend's `BKASH_CALLBACK_URL` env var points to a fixed backend URL; the backend then redirects to the frontend — the exact frontend redirect URL must be confirmed from deployed env. |
| No shipment search for HUB_MANAGER across all hubs | Low | HUB_MANAGER scoped to own hub only. |
| No courier earnings by amount (only delivery count) | Low | `getEarnings` returns delivery records but no per-delivery pay rate or total earnings amount. |
| No admin dashboard charts beyond stats counts | Low | Only 7 aggregate counts available, no time-series data for charts. |
| Google OAuth callback token delivery | Unknown | Backend redirects after Google OAuth but the mechanism (cookies vs query params) must be confirmed from live env. |

---

## Confirmed Facts vs Assumptions

| Fact | Confirmed |
|------|-----------|
| Bearer token auth (Authorization header) | ✅ Source code |
| JWT access token 15 min TTL | ✅ Source code |
| Refresh token 7 days TTL | ✅ Source code |
| Two-step registration with OTP | ✅ Source code |
| bKash-only payment (no Stripe) | ✅ Source code |
| Role-scoped shipment list | ✅ Source code |
| HUB_MANAGER hub scoping | ✅ Source code |
| Shipment state machine | ✅ Source code |
| No password reset endpoint | ✅ Source code |
| Deployed backend URL | ⚠️ Render service name `logiflow-backend` → likely `https://logiflow-backend.onrender.com` but not verified |
| bKash frontend redirect URL after callback | ⚠️ Depends on deployed env var |
| Google OAuth frontend redirect mechanism | ⚠️ Not confirmed from source |
