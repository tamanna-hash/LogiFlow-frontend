# LogiFlow Business Workflow Document

> **Based on full codebase inspection — November 2026**
> Every statement in this document is derived directly from the source code.
> Where something is missing, broken, or unclear, it is explicitly marked.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Roles](#2-roles)
3. [How Users & Roles Are Created](#3-how-users--roles-are-created)
4. [Admin Workflow](#4-admin-workflow)
5. [Hub Creation Workflow](#5-hub-creation-workflow)
6. [Hub Manager Workflow](#6-hub-manager-workflow)
7. [Courier Workflow](#7-courier-workflow)
8. [Customer Workflow](#8-customer-workflow)
9. [Operations Manager Workflow](#9-operations-manager-workflow)
10. [Shipment Lifecycle](#10-shipment-lifecycle)
11. [Pickup Lifecycle](#11-pickup-lifecycle)
12. [Hub Transfer Lifecycle](#12-hub-transfer-lifecycle)
13. [Delivery Lifecycle](#13-delivery-lifecycle)
14. [Payment Lifecycle](#14-payment-lifecycle)
15. [Notification Lifecycle](#15-notification-lifecycle)
16. [Audit Lifecycle](#16-audit-lifecycle)
17. [Database Relationship Map](#17-database-relationship-map)
18. [Role Permission Matrix](#18-role-permission-matrix)
19. [API Workflow Map](#19-api-workflow-map)
20. [Complete End-to-End Shipment Example](#20-complete-end-to-end-shipment-example)
21. [Missing / Broken / Incomplete Workflows](#21-missing--broken--incomplete-workflows)
22. [Recommended Manual Testing Order](#22-recommended-manual-testing-order)

---

## 1. System Overview

LogiFlow is a multi-role logistics management platform built for Bangladesh (primary currency BDT). It manages the full lifecycle of a parcel shipment: from customer booking, through payment, pickup, hub processing, inter-hub transfer, final delivery, and failure handling.

**Technology Stack:**
- Backend: Node.js / Express / TypeScript, Prisma ORM, PostgreSQL
- Frontend: Next.js 16 App Router, React Query, Zustand
- Cache: Upstash Redis (OTP storage, pricing cache, tracking cache, admin stats cache)
- Auth: JWT (15m access token, 7d refresh token) + Google OAuth 2.0
- Email: Gmail SMTP or Resend (configurable)
- Payments: bKash (primary, required) and Stripe (optional)
- File storage: Cloudinary (avatars, delivery proof images)

**Key Business Concepts:**
- A **Hub** is a physical logistics facility (warehouse/sorting center).
- A **Zone** is a delivery/pickup area that belongs to exactly one Hub. Zones are used to route shipments and calculate prices.
- A shipment travels from its **Origin Zone's Hub** to its **Destination Zone's Hub**.
- If origin and destination zones belong to the **same hub**, the shipment goes directly to `AT_DESTINATION_HUB` without a hub transfer.

---

## 2. Roles

There are exactly **5 roles** in LogiFlow:

| Role | Purpose |
|------|---------|
| `CUSTOMER` | Books shipments, pays, tracks |
| `COURIER` | Picks up and delivers parcels |
| `HUB_MANAGER` | Manages one hub, initiates transfers, assigns couriers at own hub |
| `OPERATIONS_MANAGER` | Assigns couriers across hubs, updates statuses, oversees operations |
| `ADMIN` | Full system control: users, hubs, zones, pricing, audit logs |

**Important facts:**
- One user has exactly one role at any time.
- A user cannot hold multiple roles simultaneously.
- `OPERATIONS_MANAGER` and `ADMIN` have no profile table (no extra fields needed).
- `HUB_MANAGER` has a `HubManagerProfile` with a `hubId` (nullable). A hub manager without a hub cannot log in.
- `COURIER` has a `CourierProfile` with optional `hubId`, `vehicleType`, `vehicleNumber`, `licenseNumber`, `availability`, `totalDeliveries`.
- `CUSTOMER` has a `CustomerProfile` with optional `defaultAddress`, `city`, `postalCode`.

---

## 3. How Users & Roles Are Created

### 3.1 CUSTOMER — Self-Registration

WHO creates: The user themselves, or via Google OAuth.

**Email/Password Registration (2-step OTP flow):**

```
Step 1: POST /auth/register
  → Input: firstName, lastName, email, password, phone (optional)
  → Validation: email must not already exist
  → Action: Generate 6-digit OTP, store OTP + user data in Redis (5 min TTL)
  → Email: OTP verification email sent
  → DB change: None yet (pending in Redis only)
  → Audit: USER_REGISTERED (stage: otp_sent, actorId: null)

Step 2: POST /auth/verify-email
  → Input: email, otp
  → Validation: OTP must match Redis entry
  → Action: Delete OTP from Redis, create User + CustomerProfile in DB
  → DB change: User (role=CUSTOMER, isEmailVerified=true) + CustomerProfile created
  → Email: Welcome email sent
  → Audit: USER_REGISTERED (actorId: user.id)
  → Returns: JWT access token + refresh token
```

**Google OAuth Registration:**
```
GET /auth/google → redirects to Google
Google redirects back to → GET /auth/google/callback
  → If email not in DB: creates User (role=CUSTOMER) + CustomerProfile
  → If email exists with no googleId: auto-links Google identity
  → If googleId already exists: normal login
  → Returns: redirect to /callback?accessToken=...&refreshToken=...
```

**Key rules:**
- All self-registrations are CUSTOMER. No other role can self-register.
- Role is hardcoded to `CUSTOMER` in auth.service.ts and googleAuth.ts.
- Registration requires a valid email (OTP must be delivered successfully).

---

### 3.2 COURIER — Created by Admin Role Assignment

WHO creates: Nobody creates a Courier account directly. The workflow is:
1. Person registers as a CUSTOMER.
2. Admin logs in → goes to Users → finds the user → changes role to `COURIER`.
3. `PATCH /users/:id/role` with `{ role: "COURIER" }` — ADMIN only.
4. Backend automatically creates a `CourierProfile` record (empty: no hub, no vehicle).
5. **The courier must then be assigned to a Hub manually** — see Gap #2 in Section 21.
6. Admin (or Ops) can set the courier's hub via Postman/API directly (no frontend UI for this).

**What happens in DB:**
- `User.role` updated to `COURIER`
- `CourierProfile` created with `{ userId, availability: AVAILABLE }` — no hub or vehicle info

**Effect:** Courier can now log in to their courier dashboard.

---

### 3.3 HUB_MANAGER — Created by Admin Role Assignment

WHO creates: Nobody creates a Hub Manager account directly. The workflow is:
1. Person registers as a CUSTOMER.
2. Admin changes their role to `HUB_MANAGER` via `PATCH /users/:id/role`.
3. Backend creates an empty `HubManagerProfile` record (hubId = null).
4. **CRITICAL: At this point, the Hub Manager CANNOT log in.** The `authenticate` middleware blocks login if `hubManagerProfile.hubId` is null.
5. Admin must manually set `hubManagerProfile.hubId` via direct DB update or Postman — there is **no frontend UI** for this step.

**What happens in DB:**
- `User.role` updated to `HUB_MANAGER`
- `HubManagerProfile` created with `{ userId, hubId: null }`

**To complete the setup:** Run SQL or use a Prisma script to set `hubId`:
```sql
UPDATE hub_manager_profiles SET "hubId" = '<hub_id>' WHERE "userId" = '<user_id>';
```

**Effect after hub assignment:** Hub Manager can log in and access their hub dashboard.

---

### 3.4 OPERATIONS_MANAGER — Created by Admin Role Assignment

WHO creates: Admin changes an existing user's role to `OPERATIONS_MANAGER`.
- No profile table — role change is sufficient.
- Operations Manager can log in immediately after role change.

**DB change:** `User.role` updated to `OPERATIONS_MANAGER`. No profile record created.

---

### 3.5 ADMIN — Created by Admin Role Assignment

WHO creates: First admin must be created via the seed script. Subsequent admins are created by an existing admin changing a user's role.
- No profile table.
- The system prevents demoting the last admin (service-level check).

---

### 3.6 Role Change Rules

- Only ADMIN can change roles: `PATCH /users/:id/role`
- When changing TO `HUB_MANAGER`: creates `HubManagerProfile` (empty hubId)
- When changing TO `COURIER`: creates `CourierProfile` (empty)
- When changing TO `CUSTOMER`: creates `CustomerProfile` (empty)
- When changing TO `OPERATIONS_MANAGER` or `ADMIN`: no profile created
- The old profile is NOT deleted when role changes (data is preserved)
- Cannot demote last ADMIN (checked in service)
- Can demote self (no protection against this)

---

## 4. Admin Workflow

### 4.1 Admin Login
- Admin logs in via email/password: `POST /auth/login`
- Redirected to `/dashboard/admin`
- JWT stored in localStorage + logiflow_token/logiflow_role cookies set for routing

### 4.2 Admin Dashboard Overview
- **URL:** `/dashboard/admin`
- **API:** `GET /admin/stats`
- **Shows:** Total shipments, in-transit count, delivered count, total users, total revenue (from completed payments), pending payments, active hubs
- **Also shows:** Shipment status donut chart, Recent shipments table (last 6), Quick action links

### 4.3 User Management
- **URL:** `/dashboard/admin/users`
- **API:** `GET /users` (ADMIN only) — filterable by role, search, page
- **View user:** `GET /users/:id`
- **Change role:** `PATCH /users/:id/role` — dropdown in UI with all 5 roles
- **Delete user:** `DELETE /users/:id` (soft delete: sets `deletedAt`, `isActive=false`)
  - Blocked if user has active shipments (non-terminal status)
  - Cannot delete last admin

**What admin can do with users:**
- List all users with role/search filters ✅
- View user detail (name, email, role, status, join date) ✅
- Change any user's role ✅
- Soft-delete a user ✅
- Cannot create users directly ❌ (users must self-register first)
- Cannot manually set courier hub via UI ❌ (GAP)
- Cannot manually set hub manager hub via UI ❌ (GAP)

### 4.4 Hub Management
- **URL:** `/dashboard/admin/hubs`
- **Create Hub:** `POST /hubs` — requires name, code, address, city; phone optional
- **Edit Hub:** `PATCH /hubs/:id`
- **Deactivate Hub:** `DELETE /hubs/:id` — blocked if hub has active shipments
- **View Hub:** shows hub details, zone count, active shipment count
- **Zones shown:** Listed on hub detail page
- **Cannot assign Hub Manager via UI** ❌ (GAP — see Section 21)

### 4.5 Zone Management
- **URL:** `/dashboard/admin/zones` (accessed from hub detail view)
- **Create Zone:** `POST /zones` — requires name, code, hubId
- **Edit Zone:** `PATCH /zones/:id` — update name, description, isActive
- **Deactivate Zone:** `DELETE /zones/:id` — blocked if zone has active shipments
- Zones are not displayed as a separate page — they are shown inside hub detail

### 4.6 Pricing Management
- **URL:** `/dashboard/admin/pricing`
- **Create Rule:** `POST /pricing/rules` — name, originZoneId (opt), destinationZoneId (opt), deliveryType (opt), parcelType (opt), basePrice, pricePerKg, baseWeightKg, zoneSurcharge, deliveryTypeSurcharge, isDefault
- **Edit Rule:** `PATCH /pricing/rules/:id`
- **Deactivate Rule:** `DELETE /pricing/rules/:id` (soft delete)
- Most specific rule wins at price calculation time. Default rule (isDefault=true, no zone/type filters) is the fallback.

### 4.7 Shipment Monitoring
- **URL:** `/dashboard/admin/shipments`
- Admin sees ALL shipments (no scope filter).
- Can filter by status, search by tracking/name/phone.
- Admin can cancel shipments (`POST /shipments/:id/cancel`).
- Admin can initiate return (`POST /shipments/:id/return`).
- Admin cannot directly update arbitrary statuses via UI except through the operations shipment detail form.

### 4.8 Payment Monitoring
- **URL:** `/dashboard/admin/payments`
- **API:** `GET /payments` (ADMIN only)
- Admin sees all payment records: amount, status, provider, transaction ID, timestamp, customer name.

### 4.9 Audit Logs
- **URL:** `/dashboard/admin/audit-logs`
- **API:** `GET /admin/audit-logs` (ADMIN only)
- Filterable by action, actor, resource type/ID, date range.
- Full audit trail of all actions in the system.
- OPERATIONS_MANAGER can access `/admin/audit-logs/operational` — a filtered view of operationally relevant actions only.

---

## 5. Hub Creation Workflow

**WHO creates a Hub:** ADMIN only.

```
ADMIN
  → Dashboard → Hubs → "New hub" button
  → Fills: name (unique), code (unique), address, city, phone (optional)
  → POST /hubs
  → DB: Hub record created (isActive=true)
  → Audit: HUB_CREATED
  → Hub appears in hub list immediately
```

**Required information:**
- `name` (must be unique across all hubs)
- `code` (must be unique, e.g. "DCH", "CTG-P")
- `address` (physical address)
- `city` (city name)
- `phone` (optional)

**After hub creation — what must happen manually:**

1. **Create zones for the hub** — Admin creates zones via `POST /zones` with `hubId`. Without zones, no shipments can be routed through this hub.
2. **Create pricing rules** — Either use the default rule or create zone-specific rules.
3. **Assign Hub Manager** — Admin must manually set `HubManagerProfile.hubId` in DB (no UI). Alternatively, the Operations Manager can operate without a Hub Manager.
4. **Assign Couriers** — Couriers' `CourierProfile.hubId` must be set (no UI).

**Hub deactivation:**
- `DELETE /hubs/:id` — soft delete (sets `deletedAt`, `isActive=false`)
- Blocked if hub has any active (non-terminal) shipments
- Hub Manager loses login access immediately (hub is inactive)

**One Hub = one Hub Manager** (enforced by `HubManagerProfile.hubId UNIQUE` constraint).
One Hub can have many Couriers.

---

## 6. Hub Manager Workflow

### 6.1 Prerequisites
Hub Manager can log in only if:
- User has role `HUB_MANAGER`
- `HubManagerProfile` exists with a non-null `hubId`
- The hub is active
- User is active and not deleted

### 6.2 Hub Manager Dashboard
- **URL:** `/dashboard/hub`
- Shows: active shipments at hub, in-transit count, couriers at hub

### 6.3 What Hub Manager Can See

**Shipments:** Only shipments where `currentHubId = their hubId`. This is enforced in `buildShipmentWhere()` in shipment.service.ts.

**Couriers:** Only couriers where `CourierProfile.hubId = their hubId`. Enforced in `listCouriers()`.

**Hubs:** Only their own hub (hub controller checks `req.user.hubId === req.params.id`).

**Transfers:** Can list transfers for their hub (`GET /hubs/:hubId/transfers`).

### 6.4 Hub Manager Actions

**Assign Courier (for pickup):**
```
WHO: Hub Manager
CONDITION: Shipment must be PICKUP_REQUESTED, courier must be at same hub as origin zone, courier must be AVAILABLE
API: POST /operations/assignments { shipmentId, courierProfileId, type: "PICKUP" }
DB: CourierAssignment created, Shipment→ASSIGNED, CourierProfile→ON_DELIVERY
Notifications: Customer + Courier both notified (COURIER_ASSIGNED)
Audit: COURIER_ASSIGNED
```

**Assign Courier (for delivery):**
```
WHO: Hub Manager
CONDITION: Shipment must be AT_DESTINATION_HUB, courier must be at same hub, courier AVAILABLE
API: POST /operations/assignments { shipmentId, courierProfileId, type: "DELIVERY" }
DB: CourierAssignment created, Shipment→OUT_FOR_DELIVERY, CourierProfile→ON_DELIVERY
Notifications: Customer + Courier notified (COURIER_ASSIGNED)
```

**Create Transfer:**
```
WHO: Hub Manager (from their own hub only)
CONDITION: Shipment must be AT_ORIGIN_HUB or AT_DESTINATION_HUB AND currentHubId = Hub Manager's hub
API: POST /hubs/:hubId/transfers { shipmentId, toHubId, estimatedArrival, notes }
DB: HubTransfer created (IN_TRANSIT), Shipment→IN_TRANSIT, currentHubId→null
Notification: Customer notified (IN_TRANSIT)
Audit: HUB_TRANSFER_CREATED
```

**Confirm Transfer Arrival:**
```
WHO: Hub Manager (at destination hub only)
CONDITION: Transfer must be IN_TRANSIT, toHubId must match Hub Manager's hubId
API: PATCH /hubs/:hubId/transfers/:transferId/arrive
DB: HubTransfer→ARRIVED, Shipment→AT_DESTINATION_HUB, currentHubId = this hub
Notification: Customer notified (ARRIVED_AT_HUB)
Audit: HUB_TRANSFER_ARRIVED
NOTE: No frontend UI for this! Must be done via API/Postman (see Gap #3).
```

**What Hub Manager CANNOT do:**
- View shipments at other hubs ❌
- Create transfers from other hubs ❌
- Assign couriers from other hubs ❌
- Access pricing, audit logs (full), or user management ❌
- Create or edit hubs/zones ❌
- See payment information ❌

---

## 7. Courier Workflow

### 7.1 Prerequisites
Courier can log in if:
- User has role `COURIER`
- `CourierProfile` exists (no hub required to log in — only assigned couriers can receive work)

### 7.2 Courier Dashboard
- **URL:** `/dashboard/courier`
- Shows: active assignments, earnings summary

### 7.3 Assignment Flow

```
1. Operations Manager OR Hub Manager creates assignment
   → Courier receives in-app notification "New assignment"
   → Courier visits /dashboard/courier/assignments
   → Sees assignment with shipment details

2. ACCEPT assignment:
   API: PATCH /courier/assignments/:id/accept
   DB: CourierAssignment.acceptedAt = now()
   Note: Just marks acceptance. No status change to shipment.

3. REJECT assignment (only if not yet accepted):
   API: PATCH /courier/assignments/:id/reject { reason }
   DB: CourierAssignment→REJECTED, Shipment reverts to previous status
   - PICKUP rejection: Shipment→PICKUP_REQUESTED, PickupRequest→PENDING
   - DELIVERY rejection: Shipment→AT_DESTINATION_HUB
   - RETURN rejection: Shipment→RETURN_INITIATED
   DB: CourierProfile.availability→AVAILABLE

4. AVAILABILITY toggle (own availability only):
   API: PATCH /courier/availability { availability: "AVAILABLE" | "UNAVAILABLE" }
   Blocked if courier has active assignment
   Audit: COURIER_AVAILABILITY_CHANGED
```

### 7.4 Pickup Flow

```
After accepting a PICKUP assignment:

5. CONFIRM PICKUP:
   WHO: Courier
   CONDITION: Assignment type=PICKUP, accepted, Shipment status=ASSIGNED
   API: POST /courier/shipments/:shipmentId/pickup-confirm
   DB: Shipment→PICKED_UP, CourierAssignment.pickedUpAt=now(), PickupRequest→COMPLETED
   Audit: PICKUP_COMPLETED
   Tracking event: "Parcel picked up by courier"
```

### 7.5 Hub Arrival Marking (NOT done by Courier)

After `PICKED_UP`, the shipment needs to move to `AT_ORIGIN_HUB`. This is NOT done by the Courier — it is done by Operations Manager or Admin:

```
6. OPS MARKS HUB ARRIVAL:
   WHO: Operations Manager or Admin
   API: PATCH /operations/shipments/:id/status { status: "AT_ORIGIN_HUB" }
   CONDITION: Shipment must be PICKED_UP
   DB: Shipment→AT_ORIGIN_HUB (or AT_DESTINATION_HUB if same-hub), currentHubId=originHub
   Audit: SHIPMENT_STATUS_CHANGED
   Note: If origin zone and destination zone share same hub → directly AT_DESTINATION_HUB
```

### 7.6 Delivery Flow

```
After a DELIVERY assignment is created and courier accepts:

7. RECORD DELIVERY (success):
   WHO: Courier
   CONDITION: Assignment type=DELIVERY, accepted, Shipment=OUT_FOR_DELIVERY
   API: POST /courier/shipments/:shipmentId/deliver { notes, proofImage (optional) }
   DB: Shipment→DELIVERED, deliveredAt=now(), currentHubId=null
       DeliveryAttempt created (SUCCESS), CourierAssignment→COMPLETED
       CourierProfile.availability→AVAILABLE, totalDeliveries +1
   Notification: Customer notified (DELIVERED) + email
   Audit: DELIVERY_CONFIRMED

8. RECORD DELIVERY FAILED:
   WHO: Courier
   CONDITION: Assignment type=DELIVERY, accepted, Shipment=OUT_FOR_DELIVERY
   API: POST /courier/shipments/:shipmentId/delivery-failed { failureReason, notes }
   Reasons: NO_ONE_HOME, ADDRESS_NOT_FOUND, REFUSED_BY_RECIPIENT, DAMAGED_IN_TRANSIT, OTHER
   DB: Shipment→DELIVERY_FAILED, deliveryAttemptCount+1
       DeliveryAttempt created (FAILED), CourierAssignment→COMPLETED
       CourierProfile.availability→AVAILABLE
   Notification: Customer notified (DELIVERY_FAILED) + email
   Audit: DELIVERY_FAILED
```

### 7.7 Return Assignment Flow

```
After OPS initiates return (from DELIVERY_FAILED):

9. RETURN ASSIGNMENT:
   WHO: Ops Manager assigns via POST /operations/assignments { type: "RETURN" }
   DB: Shipment→RETURNING, CourierAssignment created

10. OPS MARKS RETURNED:
    WHO: Operations Manager or Admin
    API: PATCH /operations/shipments/:id/status { status: "RETURNED" }
    CONDITION: Shipment=RETURNING, accepted return assignment exists
    DB: Shipment→RETURNED, returnedAt=now(), currentHubId=null
    CourierAssignment→COMPLETED
    Audit: RETURN_COMPLETED
```

### 7.8 Courier Earnings

- **API:** `GET /courier/earnings`
- Shows successful `DeliveryAttempt` records with shipment price info.
- Shows `totalDeliveries` count (lifetime).
- Note: Earnings are shipment prices — actual courier payout calculation NOT IMPLEMENTED.

---

## 8. Customer Workflow

### 8.1 Registration and Login
- Register at `/register` — 2-step (email → OTP → account created as CUSTOMER)
- Or sign in with Google (creates CUSTOMER account automatically)
- Login at `/login`
- After login → redirected to `/dashboard/customer`

### 8.2 Customer Dashboard Overview
- **URL:** `/dashboard/customer`
- Shows: recent shipments, total shipments, in-progress count, delivered count
- Quick links to create shipment, view all shipments

### 8.3 Create Shipment (4-step Wizard)

**URL:** `/dashboard/customer/shipments/new`

**Step 1 — Sender Information:**
- Sender name, phone, address, city
- **Origin Zone** (dropdown of active zones — customers see zone names like "Dhaka North", "Chattogram Port Zone")

**Step 2 — Recipient Information:**
- Recipient name, phone, address, city
- **Destination Zone** (same dropdown)

**Step 3 — Parcel Details:**
- Declared weight (kg)
- Delivery type: `STANDARD`, `EXPRESS`, `SAME_DAY`
- Parcel type: `DOCUMENT`, `REGULAR`, `FRAGILE`, `OVERSIZED`
- Items (minimum 1): description, weight, quantity, parcel type
- Optional: description, special instructions

**Step 4 — Review (price is calculated here):**
- Price is calculated server-side at this step: `POST /pricing/calculate`
- Shows: base price + weight charge + zone surcharge + delivery surcharge = total
- Review summary
- UI note says: "After creating, you will need to pay via bKash before pickup can be arranged."

**Submit:**
```
POST /shipments { senderName, senderPhone, senderAddress, senderCity, originZoneId,
                  recipientName, recipientPhone, recipientAddress, recipientCity, destinationZoneId,
                  deliveryType, parcelType, declaredWeightKg, description, specialInstructions, items[] }
→ Server recalculates price (client price is informational only)
→ DB: Shipment created (status=CREATED, paymentStatus=PENDING)
      Payment record created (PENDING amount=calculated price)
      ShipmentTrackingEvent created ("Shipment booked")
→ Notification: Customer (SHIPMENT_CREATED) + email
→ Audit: SHIPMENT_CREATED
→ Returns: shipment with priceBreakdown
→ Frontend: redirects to /dashboard/customer/shipments/:id
```

**Customer can edit shipment:** Only while status = `CREATED`. Can only change: recipientName, recipientPhone, recipientAddress, recipientCity, specialInstructions.

**Customer can cancel shipment:** Only while status = `CREATED` or `PICKUP_REQUESTED`.

### 8.4 Payment

```
From shipment detail page → "Pay Now" button
→ Customer chooses bKash or Stripe (if enabled)

bKash flow:
  POST /payments/bkash/initiate { shipmentId }
  → Returns bkashURL
  → Frontend redirects to bKash payment page
  → Customer pays on bKash
  → bKash redirects to backend callback: GET /payments/bkash/callback?paymentID=...
  → Backend executes bKash payment server-side
  → DB: Payment→COMPLETED, Shipment.paymentStatus→COMPLETED
  → Notification: Customer (PAYMENT_COMPLETED) + email
  → Audit: PAYMENT_COMPLETED (actorId=null, system action)
  → Backend redirects to: /payment/success?shipmentId=...
  → Frontend polls payment status until COMPLETED

Stripe flow:
  POST /payments/stripe/checkout { shipmentId }
  → Returns checkoutUrl (Stripe Checkout Session)
  → Frontend redirects to Stripe checkout page
  → Customer pays
  → Stripe webhook: POST /payments/stripe/webhook (raw body)
  → DB: Payment→COMPLETED, Shipment.paymentStatus→COMPLETED
  → Notification: Customer (PAYMENT_COMPLETED) + email
  → Stripe redirects to: /payment/success?shipmentId=...
```

**Payment pre-conditions:**
- Shipment must be in `CREATED` status
- paymentStatus must be `PENDING`
- No existing completed payment

### 8.5 Request Pickup

```
After payment is COMPLETED:
  POST /shipments/:id/pickup-request { scheduledAt (optional), notes (optional) }
  CONDITION: status=CREATED AND paymentStatus=COMPLETED
  DB: PickupRequest created (PENDING), Shipment→PICKUP_REQUESTED
  ShipmentTrackingEvent: "Pickup requested"
  Audit: PICKUP_REQUESTED
```

### 8.6 Tracking

```
Authenticated: GET /shipments/:id/tracking → full event list
Public: GET /tracking/:trackingNumber → limited public info (no PII)
  Shows: status, paymentStatus, deliveryType, zones, current hub, tracking events
  Rate-limited, cached 60 seconds in Redis
```

### 8.7 Notifications
- Customer receives in-app + email notifications for all major events.
- **URL:** `/dashboard/customer/notifications`
- Can mark individual notification read, or mark all read.

### 8.8 View Payments
- **URL:** `/dashboard/customer/payments`
- **API:** `GET /payments/shipment/:shipmentId`
- Customer sees own payment status, amount, transaction ID, paid date.

---

## 9. Operations Manager Workflow

### 9.1 Dashboard
- **URL:** `/dashboard/operations`
- Shows: total shipments, delivered count, active couriers, recent operational activity log

### 9.2 What Operations Manager Can Do

**View all shipments:**
- `GET /shipments` — sees ALL shipments (no scope filter — OPERATIONS_MANAGER and ADMIN get unscoped view)
- Can filter by status, search by tracking/name/phone

**Assign couriers:**
- From shipment detail page: `POST /operations/assignments`
- Can assign to ANY available courier (not restricted to one hub)
- Types: `PICKUP` (requires PICKUP_REQUESTED), `DELIVERY` (requires AT_DESTINATION_HUB), `RETURN` (requires RETURN_INITIATED)
- Payment must be COMPLETED before any assignment

**Cancel assignments:**
- `PATCH /operations/assignments/:id/cancel { reason }`
- Reverts shipment to previous status, frees courier

**Update shipment status:**
- `PATCH /operations/shipments/:id/status { status, reason }`
- **Only two status transitions are allowed via this endpoint:**
  1. `PICKED_UP → AT_ORIGIN_HUB` (marks that shipment arrived at origin hub)
  2. `RETURNING → RETURNED` (marks that return is completed)
- All other status changes happen through their dedicated actions (pickup confirm, deliver, transfer, etc.)

**Initiate return:**
- `POST /shipments/:id/return { reason }` — only from `DELIVERY_FAILED`
- Changes: Shipment→RETURN_INITIATED

**Cancel shipments:**
- `POST /shipments/:id/cancel { reason }` — from CREATED or PICKUP_REQUESTED

**View couriers:**
- `GET /operations/couriers` — sees all couriers across all hubs
- Can filter by availability, hub, search by name

**Manage courier availability:**
- `PATCH /operations/couriers/:courierProfileId/availability`

**View operational audit logs:**
- `GET /admin/audit-logs/operational` — operational subset only (not auth/profile events)

**Create/confirm hub transfers:**
- Can create transfers: `POST /hubs/:hubId/transfers`
- Can confirm arrivals: `PATCH /hubs/:hubId/transfers/:transferId/arrive`
- NOT restricted to a specific hub (unlike Hub Manager)

**What Operations Manager CANNOT do:**
- Create/edit hubs, zones, pricing ❌
- View all audit logs (only operational subset) ❌
- Manage users / change roles ❌
- View payment details ❌

---

## 10. Shipment Lifecycle

### 10.1 State Machine

```
CREATED
  ↓ (Customer requests pickup — payment must be COMPLETED)
PICKUP_REQUESTED
  ↓ (Ops/HubMgr assigns PICKUP courier)
ASSIGNED
  ↓ (Courier confirms pickup)
PICKED_UP
  ↓ (Ops marks hub arrival → AT_ORIGIN_HUB)
  ↓ (Ops marks hub arrival → AT_DESTINATION_HUB if same hub)
AT_ORIGIN_HUB
  ↓ (HubMgr/Ops creates transfer)
IN_TRANSIT
  ↓ (HubMgr/Ops confirms arrival at destination)
AT_DESTINATION_HUB
  ↓ (Ops/HubMgr assigns DELIVERY courier)
OUT_FOR_DELIVERY
  ↓ (Courier records delivery)       ↓ (Courier records failure)
DELIVERED                         DELIVERY_FAILED
                                     ↓ (Customer cancels or Ops retries up to 3 times)
                                     ↓ (Ops initiates return)
                                  RETURN_INITIATED
                                     ↓ (Ops assigns RETURN courier)
                                  RETURNING
                                     ↓ (Ops marks returned)
                                  RETURNED

CANCELLED (from CREATED, PICKUP_REQUESTED — by Customer, Ops, or Admin)
```

### 10.2 Status Meanings

| Status | Meaning |
|--------|---------|
| `CREATED` | Shipment booked, awaiting payment |
| `PICKUP_REQUESTED` | Payment done, customer requested pickup |
| `ASSIGNED` | Courier assigned for pickup |
| `PICKED_UP` | Courier physically collected parcel |
| `AT_ORIGIN_HUB` | Parcel arrived at origin hub (hub that covers sender's zone) |
| `IN_TRANSIT` | Being transported between hubs |
| `AT_DESTINATION_HUB` | Arrived at hub that covers recipient's zone |
| `OUT_FOR_DELIVERY` | Courier on the way to deliver |
| `DELIVERED` | Successfully delivered to recipient |
| `DELIVERY_FAILED` | Delivery attempt failed |
| `CANCELLED` | Shipment cancelled |
| `RETURN_INITIATED` | Return process started |
| `RETURNING` | Return courier assigned |
| `RETURNED` | Parcel returned to sender |

### 10.3 Same-Hub Optimization

If `originZone.hubId === destinationZone.hubId`:
- When Ops marks `PICKED_UP → hub arrival`, the system sets status directly to `AT_DESTINATION_HUB` (skips `AT_ORIGIN_HUB → IN_TRANSIT`).
- No `HubTransfer` record is created.

### 10.4 Max Delivery Attempts

- Configured via `MAX_DELIVERY_ATTEMPTS` env var (default: 3).
- When `deliveryAttemptCount >= MAX_DELIVERY_ATTEMPTS` and Ops tries to assign another DELIVERY courier, the backend rejects: "Maximum delivery attempts reached. Initiate a return."
- After max attempts, only RETURN_INITIATED → RETURNING → RETURNED path is available.

---

## 11. Pickup Lifecycle

```
CUSTOMER
  → POST /shipments/:id/pickup-request { scheduledAt?, notes? }
  → CONDITION: Shipment=CREATED, paymentStatus=COMPLETED
  → DB: PickupRequest { id, shipmentId, status=PENDING, scheduledAt, notes }
        Shipment→PICKUP_REQUESTED
        TrackingEvent: "Pickup requested"
  → Audit: PICKUP_REQUESTED

OPS/HUB_MANAGER
  → POST /operations/assignments { shipmentId, courierProfileId, type: "PICKUP" }
  → CONDITION: Shipment=PICKUP_REQUESTED, courier AVAILABLE, paymentStatus=COMPLETED
  → DB: CourierAssignment { type=PICKUP, status=ACTIVE }
        Shipment→ASSIGNED
        CourierProfile→ON_DELIVERY
        PickupRequest→ASSIGNED
        TrackingEvent: "Courier assigned for pickup"
  → Notifications: Customer + Courier (COURIER_ASSIGNED)
  → Audit: COURIER_ASSIGNED

COURIER
  → PATCH /courier/assignments/:id/accept
  → DB: CourierAssignment.acceptedAt = now()

COURIER
  → POST /courier/shipments/:shipmentId/pickup-confirm
  → CONDITION: Assignment accepted, type=PICKUP, Shipment=ASSIGNED
  → DB: Shipment→PICKED_UP, CourierAssignment.pickedUpAt=now(), PickupRequest→COMPLETED
  → Audit: PICKUP_COMPLETED

OPS/ADMIN
  → PATCH /operations/shipments/:id/status { status: "AT_ORIGIN_HUB" }
  → CONDITION: Shipment=PICKED_UP
  → DB: Shipment→AT_ORIGIN_HUB (or AT_DESTINATION_HUB if same hub)
        currentHubId = originZone.hubId
        originHubId = originZone.hubId
        TrackingEvent: "Received at origin hub"
  → Audit: SHIPMENT_STATUS_CHANGED
```

---

## 12. Hub Transfer Lifecycle

```
HUB_MANAGER or OPS
  → POST /hubs/:hubId/transfers { shipmentId, toHubId, estimatedArrival?, notes? }
  → CONDITION: Shipment=AT_ORIGIN_HUB or AT_DESTINATION_HUB
               currentHubId must equal hubId in URL
               toHubId must be different from hubId
               For HUB_MANAGER: hubId must be their own hub
  → DB: HubTransfer { fromHubId, toHubId, status=IN_TRANSIT, dispatchedAt }
        Shipment→IN_TRANSIT, currentHubId=null
        TrackingEvent: "Dispatched to [hub name]"
  → Notification: Customer (IN_TRANSIT)
  → Audit: HUB_TRANSFER_CREATED

HUB_MANAGER or OPS
  → PATCH /hubs/:hubId/transfers/:transferId/arrive
  → CONDITION: Transfer=IN_TRANSIT, transfer.toHubId must equal hubId in URL
               For HUB_MANAGER: hubId must be their own hub
  → DB: HubTransfer→ARRIVED, arrivedAt=now()
        Shipment→AT_DESTINATION_HUB, currentHubId=this hub
        TrackingEvent: "Arrived at destination hub"
  → Notification: Customer (ARRIVED_AT_HUB)
  → Audit: HUB_TRANSFER_ARRIVED

IMPORTANT: Transfer list endpoint exists (GET /hubs/:hubId/transfers) but the
frontend Hub Transfer page does NOT use it. The page filters shipments by status
instead. The "Confirm Arrival" action has no frontend UI — must use the API directly.
See Gap #3.
```

---

## 13. Delivery Lifecycle

```
OPS/HUB_MANAGER
  → POST /operations/assignments { shipmentId, courierProfileId, type: "DELIVERY" }
  → CONDITION: Shipment=AT_DESTINATION_HUB, courier AVAILABLE, paymentStatus=COMPLETED
               delivery attempt count < MAX_DELIVERY_ATTEMPTS (3)
  → DB: CourierAssignment { type=DELIVERY, status=ACTIVE }
        Shipment→OUT_FOR_DELIVERY
        CourierProfile→ON_DELIVERY
        TrackingEvent: "Courier assigned for delivery"
  → Notifications: Customer + Courier (COURIER_ASSIGNED)

COURIER
  → PATCH /courier/assignments/:id/accept
  → DB: CourierAssignment.acceptedAt = now()

COURIER (success)
  → POST /courier/shipments/:shipmentId/deliver { notes?, proofImage? }
  → CONDITION: Assignment accepted, type=DELIVERY, Shipment=OUT_FOR_DELIVERY
  → DB: DeliveryAttempt { status=SUCCESS, proofImageUrl, deliveredAt }
        Shipment→DELIVERED, deliveredAt=now(), currentHubId=null, deliveryAttemptCount+1
        CourierAssignment→COMPLETED, deliveredAt=now()
        CourierProfile→AVAILABLE, totalDeliveries+1
        TrackingEvent: "Parcel delivered successfully"
  → Notification: Customer (DELIVERED) + email
  → Audit: DELIVERY_CONFIRMED

COURIER (failure)
  → POST /courier/shipments/:shipmentId/delivery-failed { failureReason, notes? }
  → CONDITION: Assignment accepted, type=DELIVERY, Shipment=OUT_FOR_DELIVERY
  → Failure reasons: NO_ONE_HOME | ADDRESS_NOT_FOUND | REFUSED_BY_RECIPIENT
                     DAMAGED_IN_TRANSIT | OTHER
  → DB: DeliveryAttempt { status=FAILED, failureReason }
        Shipment→DELIVERY_FAILED, deliveryAttemptCount+1
        CourierAssignment→COMPLETED
        CourierProfile→AVAILABLE
        TrackingEvent: "Delivery failed: [reason]"
  → Notification: Customer (DELIVERY_FAILED) + email
  → Audit: DELIVERY_FAILED

OPS (after failure)
  → Can re-assign for another DELIVERY attempt (if attempts < max)
  → OR initiate return: POST /shipments/:id/return { reason }
  → CONDITION: Shipment=DELIVERY_FAILED
  → DB: Shipment→RETURN_INITIATED, returnReason=reason
  → Audit: RETURN_INITIATED
```

---

## 14. Payment Lifecycle

### 14.1 bKash Flow (Primary)

```
Shipment created
  → Payment record created (status=PENDING, provider=BKASH, amount=shipment.price)

CUSTOMER
  → POST /payments/bkash/initiate { shipmentId }
  → CONDITION: shipment=CREATED, paymentStatus=PENDING, customer owns shipment
  → Action: Calls bKash createpayment API
  → DB: Payment.bkashPaymentId set
  → Returns: { bkashURL, paymentId, amount }
  → Audit: PAYMENT_INITIATED

  → Frontend redirects to bkashURL (bKash payment portal)
  → Customer completes payment on bKash

bKash backend callback:
  → GET /payments/bkash/callback?paymentID=...
  → Action: Backend calls bKash executepayment API
  → Validates: transactionStatus="Completed", amount matches, merchantInvoiceNumber matches
  → DB: Payment→COMPLETED (bkashTransactionId, paidAt set)
        Shipment.paymentStatus→COMPLETED
  → Notification: Customer (PAYMENT_COMPLETED) + email
  → Audit: PAYMENT_COMPLETED (actorId=null — system)
  → Backend redirects to: /payment/success?shipmentId=...

  → Frontend at /payment/success polls GET /payments/shipment/:id until COMPLETED

If bKash payment fails:
  → DB: Payment→FAILED, failedAt set
  → Audit: PAYMENT_FAILED
  → Customer can retry (new payment initiation)
```

### 14.2 Stripe Flow (Optional — requires STRIPE_SECRET_KEY env var)

```
CUSTOMER
  → POST /payments/stripe/checkout { shipmentId }
  → Returns: { checkoutUrl, paymentId, amount }
  → Audit: PAYMENT_INITIATED
  → Frontend redirects to Stripe Checkout

  → Customer pays on Stripe

Stripe Webhook (server-to-server):
  → POST /payments/stripe/webhook (raw body, signature verified)
  → Event: checkout.session.completed
    → Validates amount, metadata.paymentId
    → DB: Payment→COMPLETED (stripePaymentIntent set)
          Shipment.paymentStatus→COMPLETED
    → Notification: Customer (PAYMENT_COMPLETED) + email
    → Audit: PAYMENT_COMPLETED (actorId=null)
  → Event: checkout.session.expired
    → DB: Payment→CANCELLED
    → Audit: PAYMENT_CANCELLED
  → Event: payment_intent.payment_failed
    → DB: Payment→FAILED
    → Audit: PAYMENT_FAILED

  Stripe redirects to → /payment/success?shipmentId=...
  → Frontend polls payment status
```

### 14.3 Payment State Values

| Status | Meaning |
|--------|---------|
| `PENDING` | Payment record exists but not yet paid |
| `COMPLETED` | Payment successful — enables pickup |
| `FAILED` | Payment attempt failed — can retry |
| `CANCELLED` | Stripe session expired or cancelled |
| `REFUND_PENDING` | NOT IMPLEMENTED (enum exists, no logic) |
| `REFUNDED` | NOT IMPLEMENTED (enum exists, no logic) |

---

## 15. Notification Lifecycle

Every notification creates both an **in-app record** (in `notifications` table) and optionally sends an **email**.

| Event | Who Gets It | In-App + Email |
|-------|------------|----------------|
| Shipment created | Customer | ✅ Both |
| Payment completed | Customer | ✅ Both |
| Courier assigned | Customer | ✅ Both |
| Courier assigned | Courier | ✅ In-app only |
| Shipment in transit (transfer dispatched) | Customer | ✅ In-app only |
| Arrived at hub (transfer confirmed) | Customer | ✅ In-app only |
| Out for delivery | Customer | ✅ Both (from notifyOutForDelivery — NOT CURRENTLY CALLED) |
| Delivered | Customer | ✅ Both |
| Delivery failed | Customer | ✅ Both |
| Returned | Customer | ✅ In-app only (via notification.create in tx) |

**Important:** `notifyOutForDelivery()` exists in notification.service.ts but is **NOT called anywhere** in the codebase. There is no trigger for the OUT_FOR_DELIVERY notification email. See Gap #6.

**Notification retrieval (any authenticated user):**
- `GET /notifications` — own notifications, filterable by isRead, type, paginated
- `PATCH /notifications/:id/read` — mark one read
- `PATCH /notifications/read-all` — mark all read
- Response includes `unreadCount` in pagination metadata

---

## 16. Audit Lifecycle

Audit logs are **append-only** records of every important system action.

**Write pattern:**
- Written inside DB transactions where possible (so rollback also removes the audit entry)
- Never throws — audit failure is non-fatal (logged to console)
- `actorId` is null for system actions (payment webhooks, registration OTP)

**Full list of audited actions:**

| Category | Actions |
|----------|---------|
| Auth | USER_REGISTERED, USER_LOGIN, USER_LOGOUT, PASSWORD_CHANGED, PASSWORD_SET, GOOGLE_ACCOUNT_LINKED |
| Users | USER_ROLE_CHANGED, USER_DELETED, USER_RESTORED, PROFILE_UPDATED |
| Shipments | SHIPMENT_CREATED, SHIPMENT_CANCELLED, SHIPMENT_STATUS_CHANGED, SHIPMENT_ADMIN_OVERRIDE |
| Courier | COURIER_ASSIGNED, COURIER_REASSIGNED, COURIER_ASSIGNMENT_CANCELLED, COURIER_ASSIGNMENT_ACCEPTED, COURIER_ASSIGNMENT_REJECTED |
| Pickup | PICKUP_REQUESTED, PICKUP_COMPLETED, PICKUP_CANCELLED |
| Hubs | HUB_CREATED, HUB_UPDATED, HUB_DEACTIVATED |
| Transfers | HUB_TRANSFER_CREATED, HUB_TRANSFER_ARRIVED |
| Delivery | DELIVERY_ATTEMPTED, DELIVERY_CONFIRMED, DELIVERY_FAILED |
| Returns | RETURN_INITIATED, RETURN_COMPLETED |
| Payments | PAYMENT_INITIATED, PAYMENT_COMPLETED, PAYMENT_FAILED, PAYMENT_CANCELLED, PAYMENT_REFUND_INITIATED |
| Pricing | PRICING_RULE_CREATED, PRICING_RULE_UPDATED, PRICING_RULE_DEACTIVATED |
| Availability | COURIER_AVAILABILITY_CHANGED |
| Zones | ZONE_CREATED, ZONE_UPDATED, ZONE_DEACTIVATED |

**Who can view audit logs:**
- `GET /admin/audit-logs` — ADMIN only (all actions, all actors)
- `GET /admin/audit-logs/operational` — OPERATIONS_MANAGER + ADMIN (shipment/courier/pickup/transfer/delivery/return actions only)

**Note:** `COURIER_REASSIGNED` and `USER_RESTORED` exist in the enum but are NOT used in any current service. `DELIVERY_ATTEMPTED` exists but `DELIVERY_CONFIRMED` and `DELIVERY_FAILED` are used instead.

---

## 17. Database Relationship Map

```
User (1) ──────────────────────── (many) RefreshToken
User (1) ──────────────────────── (0|1) CustomerProfile
User (1) ──────────────────────── (0|1) CourierProfile
User (1) ──────────────────────── (0|1) HubManagerProfile
User (1) ──────────────────────── (many) Shipment [as customer]
User (1) ──────────────────────── (many) Notification
User (1) ──────────────────────── (many) AuditLog [as actor]

Hub (1) ────────────────────────── (0|1) HubManagerProfile  [one manager per hub]
Hub (1) ────────────────────────── (many) CourierProfile     [many couriers per hub]
Hub (1) ────────────────────────── (many) Zone               [many zones per hub]
Hub (1) ────────────────────────── (many) Shipment [as currentHub]
Hub (1) ────────────────────────── (many) HubTransfer [as fromHub]
Hub (1) ────────────────────────── (many) HubTransfer [as toHub]

HubManagerProfile ─────────────── HubId → Hub  [nullable]
CourierProfile ────────────────── HubId → Hub  [nullable]

Zone (1) ──────────────────────── (many) Shipment [as originZone]
Zone (1) ──────────────────────── (many) Shipment [as destinationZone]
Zone (1) ──────────────────────── (many) PricingRule [as originZone]
Zone (1) ──────────────────────── (many) PricingRule [as destinationZone]

Shipment (1) ──────────────────── (0|1) PickupRequest
Shipment (1) ──────────────────── (many) CourierAssignment
Shipment (1) ──────────────────── (many) ShipmentItem
Shipment (1) ──────────────────── (many) ShipmentTrackingEvent
Shipment (1) ──────────────────── (many) HubTransfer
Shipment (1) ──────────────────── (many) DeliveryAttempt
Shipment (1) ──────────────────── (many) Payment

CourierAssignment ─────────────── CourierProfile
CourierAssignment ─────────────── Shipment

DeliveryAttempt ───────────────── CourierProfile
DeliveryAttempt ───────────────── Shipment
```

**Why relationships exist:**

- `Shipment → originZone/destinationZone → Hub`: Determines which hub processes the shipment at origin and destination. Used for same-hub optimization and routing.
- `Shipment.currentHubId`: Tracks which physical hub currently has the parcel. Null when in transit or delivered.
- `Shipment.originHubId`: Permanently records which hub first received the parcel (set on AT_ORIGIN_HUB transition).
- `CourierAssignment`: Links a courier to a shipment for a specific task type. Enforced by partial unique index (only one ACTIVE assignment per shipment at a time).
- `HubTransfer`: Records every inter-hub movement. Used for tracking, audit, and arrival confirmation.
- `DeliveryAttempt`: Records each delivery attempt outcome. `attemptNumber` tracks sequential attempts.
- `Payment`: Multiple payment records can exist per shipment (retries), but only one is COMPLETED.

---

## 18. Role Permission Matrix

| Action | CUSTOMER | COURIER | HUB_MANAGER | OPERATIONS_MANAGER | ADMIN |
|--------|----------|---------|-------------|-------------------|-------|
| Register (self) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Login | ✅ | ✅ | ✅ ⚠️¹ | ✅ | ✅ |
| Google OAuth login | ✅ | ✅ | ✅ ⚠️¹ | ✅ | ✅ |
| View own profile | ✅ | ✅ | ✅ | ✅ | ✅ |
| Update own profile | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create shipment | ✅ | ❌ | ❌ | ❌ | ✅ |
| View own shipments | ✅ | ⚠️² | ⚠️³ | ✅ all | ✅ all |
| Update shipment details | ✅ ⚠️⁴ | ❌ | ❌ | ❌ | ✅ |
| Cancel shipment | ✅ ⚠️⁵ | ❌ | ❌ | ✅ | ✅ |
| Request pickup | ✅ | ❌ | ❌ | ❌ | ✅ |
| Initiate return | ❌ | ❌ | ❌ | ✅ | ✅ |
| View shipment tracking | ✅ | ✅ | ✅ | ✅ | ✅ |
| Public tracking | ✅ public | ✅ public | ✅ public | ✅ public | ✅ public |
| Calculate price | ✅ | ❌ | ❌ | ✅ | ✅ |
| Initiate payment (bKash) | ✅ | ❌ | ❌ | ❌ | ✅ |
| Initiate payment (Stripe) | ✅ | ❌ | ❌ | ❌ | ✅ |
| View own payment | ✅ | ❌ | ❌ | ❌ | ✅ |
| View all payments | ❌ | ❌ | ❌ | ❌ | ✅ |
| View notifications | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create hub | ❌ | ❌ | ❌ | ❌ | ✅ |
| Edit hub | ❌ | ❌ | ❌ | ❌ | ✅ |
| Deactivate hub | ❌ | ❌ | ❌ | ❌ | ✅ |
| View hubs | ❌ | ❌ | ✅ ⚠️⁶ | ✅ | ✅ |
| Create zone | ❌ | ❌ | ❌ | ❌ | ✅ |
| Edit/deactivate zone | ❌ | ❌ | ❌ | ❌ | ✅ |
| View zones | ✅ ⚠️⁷ | ❌ | ✅ | ✅ | ✅ |
| Create pricing rule | ❌ | ❌ | ❌ | ❌ | ✅ |
| Edit/delete pricing rule | ❌ | ❌ | ❌ | ❌ | ✅ |
| View pricing rules | ❌ | ❌ | ❌ | ✅ | ✅ |
| List all users | ❌ | ❌ | ❌ | ❌ | ✅ |
| Change user role | ❌ | ❌ | ❌ | ❌ | ✅ |
| Delete user | ❌ | ❌ | ❌ | ❌ | ✅ |
| Assign courier | ❌ | ❌ | ✅ ⚠️⁸ | ✅ | ✅ |
| Cancel assignment | ❌ | ❌ | ❌ | ✅ | ✅ |
| Accept assignment | ❌ | ✅ | ❌ | ❌ | ❌ |
| Reject assignment | ❌ | ✅ | ❌ | ❌ | ❌ |
| Confirm pickup | ❌ | ✅ | ❌ | ❌ | ❌ |
| Record delivery | ❌ | ✅ | ❌ | ❌ | ❌ |
| Record delivery failed | ❌ | ✅ | ❌ | ❌ | ❌ |
| Update availability (own) | ❌ | ✅ | ❌ | ❌ | ❌ |
| Update courier availability | ❌ | ❌ | ✅ ⚠️⁸ | ✅ | ✅ |
| Create hub transfer | ❌ | ❌ | ✅ ⚠️⁶ | ✅ | ✅ |
| Confirm hub transfer arrival | ❌ | ❌ | ✅ ⚠️⁶ | ✅ | ✅ |
| Mark shipment AT_ORIGIN_HUB | ❌ | ❌ | ❌ | ✅ | ✅ |
| Mark shipment RETURNED | ❌ | ❌ | ❌ | ✅ | ✅ |
| View all audit logs | ❌ | ❌ | ❌ | ⚠️⁹ | ✅ |
| View system stats | ❌ | ❌ | ❌ | ❌ | ✅ |
| View courier earnings | ❌ | ✅ own | ❌ | ❌ | ❌ |

**Notes:**
1. HUB_MANAGER login blocked if `hubManagerProfile.hubId` is null
2. COURIER sees only shipments they have an ACTIVE assignment for
3. HUB_MANAGER sees only shipments where `currentHubId = their hub`
4. CUSTOMER can only edit while status = `CREATED` (recipient info + special instructions only)
5. CUSTOMER can only cancel in `CREATED` or `PICKUP_REQUESTED`
6. HUB_MANAGER restricted to their own hub only
7. CUSTOMER only sees `isActive=true` zones
8. HUB_MANAGER can only assign couriers at their own hub (shipment origin/current hub must match)
9. OPERATIONS_MANAGER sees only "operational" audit log subset

---

## 19. API Workflow Map

### Customer Creates Shipment

```
/dashboard/customer/shipments/new (CreateShipmentWizard)
  ↓ Step 3→4: POST /pricing/calculate { originZoneId, destinationZoneId, deliveryType, parcelType, weightKg }
  ↓           → PricingService.calculatePrice() → finds best matching rule → returns breakdown (cached 5min Redis)
  ↓ Submit:   POST /shipments { ...formData }
  ↓           → ShipmentService.createShipment()
  ↓           → Validate zones active → calculatePrice() → generateTrackingNumber() → $transaction:
  ↓             Shipment.create + Payment.create(PENDING) + ShipmentTrackingEvent.create
  ↓           → notifyShipmentCreated() (async, fire-and-forget)
  ↓           → createAuditLog(SHIPMENT_CREATED)
  ↓           → Response: { shipment, priceBreakdown }
  ↓ Frontend: router.push(/dashboard/customer/shipments/:id)
```

### Customer Pays (bKash)

```
/dashboard/customer/shipments/:id
  ↓ "Pay Now" → POST /payments/bkash/initiate { shipmentId }
  ↓             → PaymentService.initiatePayment() → finds/creates Payment(PENDING)
  ↓             → createBkashPayment() → stores bkashPaymentId
  ↓             → Returns { bkashURL }
  ↓ Frontend: window.location = bkashURL (external bKash)
  ↓ bKash redirects → GET /payments/bkash/callback?paymentID=...
  ↓                   → executeBkashPayment() → validates → $transaction:
  ↓                     Payment→COMPLETED + Shipment.paymentStatus→COMPLETED
  ↓                   → notifyPaymentCompleted() (async)
  ↓ Backend: res.redirect(/payment/success?shipmentId=...)
  ↓ Frontend: /payment/PaymentResult polls GET /payments/shipment/:id every N ms until COMPLETED
```

### Operations Assigns Courier for Pickup

```
/dashboard/operations/shipments/:id
  ↓ "Assign courier" form → POST /operations/assignments { shipmentId, courierProfileId, type: "PICKUP" }
  ↓ → OperationsService.assignCourier()
  ↓ → $transaction:
  ↓   claimShipment (SELECT FOR UPDATE) → validate state (PICKUP_REQUESTED)
  ↓   validate payment COMPLETED, validate courier AVAILABLE
  ↓   CourierAssignment.create → Shipment→ASSIGNED → CourierProfile→ON_DELIVERY
  ↓   PickupRequest→ASSIGNED → TrackingEvent → createAuditLog(COURIER_ASSIGNED)
  ↓   notification.createMany([customer, courier])
  ↓ → Response: assignment
  ↓ Frontend: form closes, shipment refetched
```

### Hub Transfer (Hub Manager)

```
/dashboard/hub/shipments/:id
  ↓ "Transfer to another hub" button (visible when AT_ORIGIN_HUB or AT_DESTINATION_HUB)
  ↓ POST /hubs/:hubId/transfers { shipmentId, toHubId, estimatedArrival?, notes? }
  ↓ → HubService.createHubTransfer()
  ↓ → Scope check: HUB_MANAGER must own fromHub
  ↓ → Validate: shipment status + currentHubId + toHub active
  ↓ → $transaction:
  ↓   claimShipment → HubTransfer.create(IN_TRANSIT) → Shipment→IN_TRANSIT, currentHubId=null
  ↓   TrackingEvent → createAuditLog → notification.create(customer, IN_TRANSIT)
  ↓ → Response: transfer
```

### Courier Confirms Delivery

```
/dashboard/courier/assignments/:id
  ↓ "Record delivery" button → POST /courier/shipments/:shipmentId/deliver { notes?, proofImage? }
  ↓ → CourierService.recordDelivery()
  ↓ → Upload proofImage to Cloudinary (if provided)
  ↓ → $transaction:
  ↓   claimShipment → validate assignment ACTIVE + accepted, type=DELIVERY
  ↓   DeliveryAttempt.create(SUCCESS) → Shipment→DELIVERED, deliveredAt=now()
  ↓   CourierAssignment→COMPLETED → CourierProfile→AVAILABLE, totalDeliveries+1
  ↓   TrackingEvent → createAuditLog(DELIVERY_CONFIRMED)
  ↓ → notifyDelivered() (async, fire-and-forget)
```

---

## 20. Complete End-to-End Shipment Example

This example uses a Dhaka → Chattogram shipment (cross-hub, requires transfer).

**Pre-conditions (must exist in DB):**
- Hub: Dhaka Central Hub (code: DHK-C)
- Hub: Chattogram Port Hub (code: CTG-P)
- Zone: Dhaka North (hubId = Dhaka hub) — for sender
- Zone: Chattogram Port Zone (hubId = CTG hub) — for recipient
- Pricing rule: default or zone-specific
- User: Admin (role=ADMIN)
- User: Karim (role=HUB_MANAGER, hubId=Dhaka hub)
- User: Dilruba (role=HUB_MANAGER, hubId=CTG hub)
- User: Rafiq (role=COURIER, hubId=Dhaka hub, availability=AVAILABLE)
- User: Mitu Begum (role=COURIER, hubId=CTG hub, availability=AVAILABLE)
- User: Arif (role=CUSTOMER)

---

### Step 1 — Customer Creates Shipment

```
WHO:    Arif (CUSTOMER)
ACTION: POST /shipments
INPUT:  senderName="Arif Hasan", senderCity="Dhaka", originZoneId=<DhakaNorth.id>
        recipientName="Tarek Ahmed", recipientCity="Chattogram", destinationZoneId=<CTGPort.id>
        deliveryType=STANDARD, parcelType=REGULAR, declaredWeightKg=2.5
        items=[{ description: "Clothing", weightKg: 2.5, quantity: 1 }]
DB:     Shipment { status=CREATED, paymentStatus=PENDING, trackingNumber="LF-XXXXXXXXXX" }
        Payment { status=PENDING, amount=117.50 }
        ShipmentTrackingEvent { status=CREATED, "Shipment booked" }
NOTIF:  Arif receives in-app + email: "Shipment booked. Amount due: BDT 117.50"
AUDIT:  SHIPMENT_CREATED
NEXT:   Arif must pay
```

### Step 2 — Customer Pays via bKash

```
WHO:    Arif (CUSTOMER)
ACTION: POST /payments/bkash/initiate { shipmentId }
        → Redirected to bKash URL
        → Completes payment on bKash
        → GET /payments/bkash/callback?paymentID=...
DB:     Payment { status=COMPLETED, bkashTransactionId="TRX123", paidAt=now() }
        Shipment.paymentStatus = COMPLETED
NOTIF:  Arif receives in-app + email: "Payment confirmed for shipment LF-XXXXXXXXXX. TrxID: TRX123"
AUDIT:  PAYMENT_INITIATED, PAYMENT_COMPLETED (actorId=null)
NEXT:   Arif must request pickup
```

### Step 3 — Customer Requests Pickup

```
WHO:    Arif (CUSTOMER)
ACTION: POST /shipments/:id/pickup-request { scheduledAt: "2026-10-09T10:00:00Z" }
        CONDITION: status=CREATED, paymentStatus=COMPLETED
DB:     PickupRequest { status=PENDING, scheduledAt }
        Shipment.status = PICKUP_REQUESTED
        ShipmentTrackingEvent { "Pickup requested" }
AUDIT:  PICKUP_REQUESTED
NEXT:   Ops Manager or Hub Manager (Karim at Dhaka hub) assigns courier
```

### Step 4 — Hub Manager Assigns Pickup Courier

```
WHO:    Karim (HUB_MANAGER at Dhaka hub)
ACTION: POST /operations/assignments { shipmentId, courierProfileId=<Rafiq.profileId>, type: "PICKUP" }
        CONDITION: Shipment=PICKUP_REQUESTED, Rafiq is at Dhaka hub, Rafiq AVAILABLE
DB:     CourierAssignment { type=PICKUP, status=ACTIVE, assignedBy=Karim.id }
        Shipment.status = ASSIGNED
        Rafiq.CourierProfile.availability = ON_DELIVERY
        PickupRequest.status = ASSIGNED
        ShipmentTrackingEvent { "Courier assigned for pickup" }
NOTIF:  Arif: "A courier has been assigned to your shipment LF-XXXXXXXXXX"
        Rafiq: "You have been assigned to shipment LF-XXXXXXXXXX"
AUDIT:  COURIER_ASSIGNED
NEXT:   Rafiq accepts and goes to pick up
```

### Step 5 — Courier Accepts and Picks Up

```
WHO:    Rafiq (COURIER)
ACTION: PATCH /courier/assignments/:id/accept
DB:     CourierAssignment.acceptedAt = now()

WHO:    Rafiq (COURIER)
ACTION: POST /courier/shipments/:shipmentId/pickup-confirm
        CONDITION: assignment accepted, type=PICKUP, Shipment=ASSIGNED
DB:     Shipment.status = PICKED_UP
        CourierAssignment.pickedUpAt = now()
        PickupRequest.status = COMPLETED, completedAt = now()
        ShipmentTrackingEvent { "Parcel picked up by courier" }
AUDIT:  PICKUP_COMPLETED
NEXT:   Ops marks hub arrival
```

### Step 6 — Operations Marks Hub Arrival

```
WHO:    Operations Manager (Nadia)
ACTION: PATCH /operations/shipments/:id/status { status: "AT_ORIGIN_HUB" }
        CONDITION: Shipment=PICKED_UP, originZone.hub is active
        NOTE: origin zone = Dhaka North → hub = Dhaka hub → NOT same as CTG hub → AT_ORIGIN_HUB
DB:     Shipment.status = AT_ORIGIN_HUB
        Shipment.currentHubId = Dhaka hub id
        Shipment.originHubId = Dhaka hub id
        CourierAssignment → COMPLETED (pickup courier freed)
        Rafiq.availability = AVAILABLE
        ShipmentTrackingEvent { "Received at origin hub" }
AUDIT:  SHIPMENT_STATUS_CHANGED
NEXT:   Karim (Dhaka hub manager) initiates transfer to Chattogram
```

### Step 7 — Hub Manager Creates Transfer

```
WHO:    Karim (HUB_MANAGER at Dhaka hub)
ACTION: POST /hubs/:dhakaHubId/transfers { shipmentId, toHubId: <CTGHubId>, estimatedArrival, notes }
        CONDITION: Shipment=AT_ORIGIN_HUB, currentHubId=Karim's hub
DB:     HubTransfer { fromHub=Dhaka, toHub=CTG, status=IN_TRANSIT, dispatchedAt=now() }
        Shipment.status = IN_TRANSIT
        Shipment.currentHubId = null
        ShipmentTrackingEvent { "Dispatched to Chattogram Port Hub" }
NOTIF:  Arif: "Shipment in transit"
AUDIT:  HUB_TRANSFER_CREATED
NEXT:   Dilruba (CTG hub manager) confirms arrival
```

### Step 8 — CTG Hub Manager Confirms Arrival

```
WHO:    Dilruba (HUB_MANAGER at CTG hub)
NOTE:   Must use API directly — frontend has no "Confirm Arrival" button (GAP #3)
ACTION: PATCH /hubs/:ctgHubId/transfers/:transferId/arrive
        CONDITION: Transfer=IN_TRANSIT, transfer.toHubId = CTG hub, Dilruba's hubId = CTG hub
DB:     HubTransfer.status = ARRIVED, arrivedAt = now()
        Shipment.status = AT_DESTINATION_HUB
        Shipment.currentHubId = CTG hub id
        ShipmentTrackingEvent { "Arrived at destination hub" }
NOTIF:  Arif: "Your shipment LF-XXXXXXXXXX arrived at its destination hub"
AUDIT:  HUB_TRANSFER_ARRIVED
NEXT:   Dilruba assigns delivery courier
```

### Step 9 — CTG Hub Manager Assigns Delivery Courier

```
WHO:    Dilruba (HUB_MANAGER at CTG hub)
ACTION: POST /operations/assignments { shipmentId, courierProfileId=<MituBegum.profileId>, type: "DELIVERY" }
        CONDITION: Shipment=AT_DESTINATION_HUB, Mitu is at CTG hub, Mitu AVAILABLE, attempts < 3
DB:     CourierAssignment { type=DELIVERY, status=ACTIVE }
        Shipment.status = OUT_FOR_DELIVERY
        Mitu.CourierProfile.availability = ON_DELIVERY
        ShipmentTrackingEvent { "Courier assigned for delivery" }
NOTIF:  Arif: "Courier assigned"
        Mitu: "New assignment"
AUDIT:  COURIER_ASSIGNED
NEXT:   Mitu accepts and delivers
```

### Step 10 — Courier Delivers

```
WHO:    Mitu Begum (COURIER)
ACTION: PATCH /courier/assignments/:id/accept
        POST /courier/shipments/:shipmentId/deliver { notes: "Left at gate", proofImage: <file> }
        CONDITION: accepted, type=DELIVERY, Shipment=OUT_FOR_DELIVERY
DB:     DeliveryAttempt { status=SUCCESS, proofImageUrl, deliveredAt }
        Shipment.status = DELIVERED, deliveredAt = now(), currentHubId = null, deliveryAttemptCount = 1
        CourierAssignment → COMPLETED, deliveredAt = now()
        Mitu.CourierProfile.availability = AVAILABLE, totalDeliveries += 1
        ShipmentTrackingEvent { "Parcel delivered successfully" }
NOTIF:  Arif: "Your shipment LF-XXXXXXXXXX has been delivered" + email
AUDIT:  DELIVERY_CONFIRMED
FINAL STATUS: DELIVERED ✅
```

### Summary of Records Created

| Entity | Count |
|--------|-------|
| Shipment | 1 |
| ShipmentItem | 1 |
| Payment | 1 |
| PickupRequest | 1 |
| CourierAssignment | 2 (pickup + delivery) |
| HubTransfer | 1 |
| DeliveryAttempt | 1 |
| ShipmentTrackingEvent | ~8 events |
| Notification | ~6 (customer + courier notifications) |
| AuditLog | ~9 records |

---

## 21. Missing / Broken / Incomplete Workflows

### CRITICAL

**Gap #1 — No UI to assign Hub Manager to Hub**
- **Problem:** After admin changes a user's role to HUB_MANAGER, the system creates a `HubManagerProfile` with `hubId = null`. There is no API endpoint and no frontend UI to set the hub. The Hub Manager cannot log in until this is set.
- **Current workaround:** Direct SQL update or Prisma script.
- **Impact:** Hub Manager accounts are completely unusable after role assignment unless done via DB directly.
- **Missing:** `PATCH /users/:id/hub-assignment` endpoint, or a UI field in admin user detail page.

**Gap #2 — No UI to assign Courier to Hub**
- **Problem:** After admin changes a user's role to COURIER, the `CourierProfile.hubId` is null. No API and no frontend UI exists to assign the courier to a hub.
- **Current workaround:** Direct SQL update or Prisma script.
- **Impact:** Couriers assigned to no hub cannot receive hub-scoped assignments and do not appear in hub-filtered courier lists.
- **Missing:** A UI field in admin user detail or courier profile that allows setting the hub.

**Gap #3 — No Frontend UI for Hub Transfer Arrival Confirmation**
- **Problem:** The backend has `PATCH /hubs/:hubId/transfers/:transferId/arrive`. The frontend hub transfers page (`/dashboard/hub/transfers`) has a comment: "confirmArrival hook available for future use." There is no button or form to trigger this action.
- **Impact:** Hub Managers cannot confirm transfer arrivals via the UI. This is a required step in the shipment workflow (IN_TRANSIT → AT_DESTINATION_HUB).
- **Current workaround:** Must use Postman or curl with the correct transfer ID and hub ID.
- **Related issue:** The hub transfers page shows ALL `AT_DESTINATION_HUB` shipments, not just those arriving at THIS hub. It does not use the `/hubs/:hubId/transfers` endpoint at all.

---

### HIGH

**Gap #4 — No API to Assign Hub/Vehicle to Courier Profile**
- The courier's vehicle type, number, and license cannot be set by Admin or Ops through any API endpoint. They can only be set by the courier themselves via `PATCH /users/me` (profile update). An admin cannot set a courier's hub or vehicle info.
- This means a new courier account has no vehicle info and no hub unless the courier fills it in themselves.

**Gap #5 — Courier Cannot See Shipments Outside Active Assignment**
- Courier's `listShipments` filter: `assignments.some({ courierProfile.userId = courierUserId, status: ACTIVE })`. This means once an assignment is COMPLETED or CANCELLED, the courier loses access to the shipment record. Historical context is only available through the assignments list.

**Gap #6 — OUT_FOR_DELIVERY Notification Never Sent**
- `notifyOutForDelivery()` exists in `notification.service.ts` but is never called. When a courier is assigned for delivery and shipment moves to `OUT_FOR_DELIVERY`, the customer receives a `COURIER_ASSIGNED` notification but no `OUT_FOR_DELIVERY` notification.
- The `OUT_FOR_DELIVERY` notification type exists in the enum. The service method exists. Only the call site is missing.

**Gap #7 — REFUND_PENDING and REFUNDED Payment Statuses Not Implemented**
- The `PaymentStatus` enum includes `REFUND_PENDING` and `REFUNDED`. No service method, route, or controller handles refund initiation or completion. No audit action triggers these statuses. Refunds cannot be processed through the system.

---

### MEDIUM

**Gap #8 — Hub Transfers Page Shows Wrong Shipments**
- The `/dashboard/hub/transfers` page queries `useShipments({ status: "AT_DESTINATION_HUB" })`. This returns ALL shipments at `AT_DESTINATION_HUB`, not just those in transit to THIS hub. The backend endpoint `GET /hubs/:hubId/transfers` exists and returns the correct scoped data, but the frontend does not use it.

**Gap #9 — `COURIER_REASSIGNED` and `USER_RESTORED` Audit Actions Unused**
- These values exist in the `AuditAction` enum but no service ever creates an audit log with these actions. Reassigning a courier (cancelling and creating a new assignment) creates `COURIER_ASSIGNMENT_CANCELLED` + `COURIER_ASSIGNED` — not `COURIER_REASSIGNED`.

**Gap #10 — `DELIVERY_ATTEMPTED` Audit Action Unused**
- The enum has `DELIVERY_ATTEMPTED` but actual delivery recording uses `DELIVERY_CONFIRMED` and `DELIVERY_FAILED`.

**Gap #11 — Courier Hub Mismatch Warning**
- When a HUB_MANAGER assigns a courier, the backend validates that both the courier and the shipment belong to the manager's hub. However, if an Operations Manager assigns a courier from a different hub than the shipment's current hub, the system allows it. This may cause a courier from Hub A to deliver a shipment currently at Hub B.

**Gap #12 — No Notification for RETURN_INITIATED**
- When Ops initiates a return, no notification is sent to the customer. The `NotificationType.RETURN_INITIATED` enum value exists, but no `notifyReturnInitiated()` call exists in `initiateReturn()`.

---

### LOW

**Gap #13 — Operations Manager Cannot View Individual User Profiles**
- Ops can list couriers via `GET /operations/couriers` but cannot access `GET /users/:id` (ADMIN only). Ops cannot look up a user's email or phone number directly.

**Gap #14 — Courier Cannot View Completed Delivery Proof Image**
- Proof images are uploaded to Cloudinary and stored in `DeliveryAttempt.proofImageUrl`, but the courier dashboard has no UI to view past delivery proofs.

**Gap #15 — No `OPERATIONS_MANAGER` Can Access Hub Detail**
- `GET /hubs/:id` is available to `HUB_MANAGER, OPERATIONS_MANAGER, ADMIN`. The frontend Ops dashboard has no "Hubs" section. Ops cannot view hub details from the UI (can only use API directly).

**Gap #16 — Admin Cannot See Which Hub Manager is Assigned**
- Admin hub detail page shows zones and shipment count but does not show who the assigned Hub Manager is. The `hubManagerProfile` relation exists on the Hub model but is not included in the `hubSelect` object.

---

## 22. Recommended Manual Testing Order

Follow this exact sequence to manually validate LogiFlow end-to-end.

**Phase 1 — Setup (Admin)**
1. Seed the database: `npm run db:seed`
2. Login as Admin: `admin@demo.logiflow.app` / `Demo@LogiFlow2026`
3. Verify hubs exist: `/dashboard/admin/hubs` — should show Dhaka, Cumilla, Chattogram
4. Verify pricing rules exist: `/dashboard/admin/pricing`
5. Verify users exist: `/dashboard/admin/users`

**Phase 2 — Fix Hub Manager (Manual DB step)**
6. Set hub manager hub via SQL (gap workaround):
   ```sql
   -- Get hub manager user IDs
   SELECT id, email FROM users WHERE role = 'HUB_MANAGER';
   -- Get hub IDs
   SELECT id, name FROM hubs;
   -- Assign hub to manager (already done by seed script)
   UPDATE hub_manager_profiles SET "hubId" = '<dhaka_hub_id>' WHERE "userId" = '<karim_user_id>';
   ```
   (The demo seed already does this — skip if using seeded data)

**Phase 3 — Customer Registration and Shipment**
7. Register a new customer (or login as `customer1@demo.logiflow.app`)
8. Create a shipment: From Dhaka North zone → Chattogram Port zone, Standard, Regular, 2kg
9. Verify price is calculated on step 4
10. Submit shipment — note the tracking number
11. Pay via bKash (use bKash sandbox credentials): `/dashboard/customer/shipments/:id`
12. Verify paymentStatus becomes COMPLETED
13. Request pickup

**Phase 4 — Operations and Pickup**
14. Login as Ops: `ops@demo.logiflow.app`
15. Go to Shipments → find shipment in PICKUP_REQUESTED status
16. Click View → Assign courier (select Rafiq, type=PICKUP)
17. Verify shipment moves to ASSIGNED
18. Login as Courier: `courier1@demo.logiflow.app` (Rafiq)
19. Go to Assignments → Accept assignment → Confirm pickup
20. Verify shipment moves to PICKED_UP
21. Login as Ops → Update status to AT_ORIGIN_HUB

**Phase 5 — Hub Transfer**
22. Login as Hub Manager (Dhaka): `hub.dhaka@demo.logiflow.app`
23. Go to Shipments → find AT_ORIGIN_HUB shipment → View
24. Click "Transfer to another hub" → select Chattogram hub
25. Verify shipment moves to IN_TRANSIT
26. **Confirm arrival via API** (Gap #3 — no UI):
    ```
    PATCH /hubs/:ctgHubId/transfers/:transferId/arrive
    Authorization: Bearer <ctg_hub_manager_token>
    ```
27. Verify shipment moves to AT_DESTINATION_HUB at CTG hub

**Phase 6 — Delivery**
28. Login as Hub Manager (CTG): `hub.ctg@demo.logiflow.app`
29. Go to Shipments → find AT_DESTINATION_HUB shipment → assign courier3 (Mitu) for DELIVERY
30. Login as Courier (CTG): `courier3@demo.logiflow.app`
31. Accept assignment → Record delivery (upload proof optional)
32. Verify shipment moves to DELIVERED

**Phase 7 — Verify Complete Trail**
33. Login as Customer → verify shipment shows DELIVERED
34. Check notifications — should have: SHIPMENT_CREATED, PAYMENT_COMPLETED, COURIER_ASSIGNED (×2), IN_TRANSIT, ARRIVED_AT_HUB, DELIVERED
35. Login as Admin → Audit Logs → verify all actions logged
36. Public tracking URL: `/tracking/<tracking_number>` — verify works without login

**Phase 8 — Failure Path**
37. Create a new shipment, pay, request pickup, assign courier
38. After courier confirms pickup, mark AT_ORIGIN_HUB, assign DELIVERY courier
39. Record delivery failed (reason: NO_ONE_HOME)
40. Verify DELIVERY_FAILED status
41. Ops initiates return
42. Assign RETURN courier
43. Ops marks RETURNED
44. Verify complete return lifecycle in tracking events and notifications

---

*Document generated from full codebase inspection — November 2026*
*Files inspected: All Prisma schemas, all backend routes/controllers/services, all frontend pages/features/API calls*
