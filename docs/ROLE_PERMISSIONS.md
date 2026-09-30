# LogiFlow Role-Permission Matrix

## Roles

| Role | Description |
|------|-------------|
| `CUSTOMER` | End users who create and track shipments |
| `COURIER` | Delivery personnel who pick up and deliver shipments |
| `HUB_MANAGER` | Manages a single hub — transfers and courier assignments at their hub |
| `OPERATIONS_MANAGER` | Cross-hub operational oversight, shipment status management |
| `ADMIN` | Full system access |

---

## Endpoint Access Matrix

### Auth
| Endpoint | CUSTOMER | COURIER | HUB_MANAGER | OPS_MANAGER | ADMIN |
|----------|----------|---------|-------------|-------------|-------|
| POST /auth/register | ✅ | ✅ | ✅ | ✅ | ✅ |
| POST /auth/verify-email | ✅ | ✅ | ✅ | ✅ | ✅ |
| POST /auth/login | ✅ | ✅ | ✅ | ✅ | ✅ |
| POST /auth/refresh | ✅ | ✅ | ✅ | ✅ | ✅ |
| POST /auth/logout | ✅ | ✅ | ✅ | ✅ | ✅ |
| PATCH /auth/change-password | ✅ | ✅ | ✅ | ✅ | ✅ |

### Users
| Endpoint | CUSTOMER | COURIER | HUB_MANAGER | OPS_MANAGER | ADMIN |
|----------|----------|---------|-------------|-------------|-------|
| GET /users/me | ✅ | ✅ | ✅ | ✅ | ✅ |
| PATCH /users/me | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /users (list) | ❌ | ❌ | ❌ | ❌ | ✅ |
| GET /users/:id | ❌ | ❌ | ❌ | ❌ | ✅ |
| PATCH /users/:id/role | ❌ | ❌ | ❌ | ❌ | ✅ |
| DELETE /users/:id | ❌ | ❌ | ❌ | ❌ | ✅ |

### Shipments
| Endpoint | CUSTOMER | COURIER | HUB_MANAGER | OPS_MANAGER | ADMIN |
|----------|----------|---------|-------------|-------------|-------|
| POST /shipments | ✅ (own) | ❌ | ❌ | ❌ | ✅ |
| GET /shipments | ✅ (own) | ✅ (assigned) | ✅ (hub) | ✅ (all) | ✅ (all) |
| GET /shipments/:id | ✅ (own) | ✅ (assigned) | ✅ (hub) | ✅ | ✅ |
| PATCH /shipments/:id | ✅ (own, CREATED) | ❌ | ❌ | ❌ | ✅ |
| POST /shipments/:id/cancel | ✅ (own, limited) | ❌ | ❌ | ✅ | ✅ |
| POST /shipments/:id/pickup-request | ✅ (own) | ❌ | ❌ | ❌ | ✅ |
| GET /shipments/:id/tracking | ✅ (own) | ✅ (assigned) | ✅ (hub) | ✅ | ✅ |
| POST /shipments/:id/return | ❌ | ❌ | ❌ | ✅ | ✅ |

### Public Tracking
| Endpoint | Public | Any Auth |
|----------|--------|----------|
| GET /tracking/:trackingNumber | ✅ | ✅ |

### Pricing
| Endpoint | CUSTOMER | COURIER | HUB_MANAGER | OPS_MANAGER | ADMIN |
|----------|----------|---------|-------------|-------------|-------|
| POST /pricing/rules | ❌ | ❌ | ❌ | ❌ | ✅ |
| GET /pricing/rules | ❌ | ❌ | ❌ | ✅ | ✅ |
| PATCH /pricing/rules/:id | ❌ | ❌ | ❌ | ❌ | ✅ |
| DELETE /pricing/rules/:id | ❌ | ❌ | ❌ | ❌ | ✅ |
| POST /pricing/calculate | ✅ | ❌ | ❌ | ✅ | ✅ |

### Hubs
| Endpoint | CUSTOMER | COURIER | HUB_MANAGER | OPS_MANAGER | ADMIN |
|----------|----------|---------|-------------|-------------|-------|
| POST /hubs | ❌ | ❌ | ❌ | ❌ | ✅ |
| GET /hubs | ❌ | ❌ | ✅ (own) | ✅ | ✅ |
| GET /hubs/:id | ❌ | ❌ | ✅ (own) | ✅ | ✅ |
| PATCH /hubs/:id | ❌ | ❌ | ❌ | ❌ | ✅ |
| DELETE /hubs/:id | ❌ | ❌ | ❌ | ❌ | ✅ |
| POST /hubs/:hubId/transfers | ❌ | ❌ | ✅ (own hub) | ✅ | ✅ |
| PATCH /hubs/.../arrive | ❌ | ❌ | ✅ (own hub) | ✅ | ✅ |

### Zones
| Endpoint | CUSTOMER | COURIER | HUB_MANAGER | OPS_MANAGER | ADMIN |
|----------|----------|---------|-------------|-------------|-------|
| POST /zones | ❌ | ❌ | ❌ | ❌ | ✅ |
| GET /zones | ❌ | ❌ | ✅ | ✅ | ✅ |
| PATCH /zones/:id | ❌ | ❌ | ❌ | ❌ | ✅ |
| DELETE /zones/:id | ❌ | ❌ | ❌ | ❌ | ✅ |

### Courier (self-service)
| Endpoint | CUSTOMER | COURIER | HUB_MANAGER | OPS_MANAGER | ADMIN |
|----------|----------|---------|-------------|-------------|-------|
| GET /courier/assignments | ❌ | ✅ | ❌ | ❌ | ❌ |
| PATCH /courier/assignments/:id/accept | ❌ | ✅ | ❌ | ❌ | ❌ |
| PATCH /courier/assignments/:id/reject | ❌ | ✅ | ❌ | ❌ | ❌ |
| PATCH /courier/availability | ❌ | ✅ | ❌ | ❌ | ❌ |
| POST /courier/shipments/:id/pickup-confirm | ❌ | ✅ | ❌ | ❌ | ❌ |
| POST /courier/shipments/:id/deliver | ❌ | ✅ | ❌ | ❌ | ❌ |
| POST /courier/shipments/:id/delivery-failed | ❌ | ✅ | ❌ | ❌ | ❌ |
| GET /courier/earnings | ❌ | ✅ | ❌ | ❌ | ❌ |

### Operations (management)
| Endpoint | CUSTOMER | COURIER | HUB_MANAGER | OPS_MANAGER | ADMIN |
|----------|----------|---------|-------------|-------------|-------|
| POST /operations/assignments | ❌ | ❌ | ✅ (own hub couriers) | ✅ | ✅ |
| PATCH /operations/assignments/:id/cancel | ❌ | ❌ | ❌ | ✅ | ✅ |
| PATCH /operations/shipments/:id/status | ❌ | ❌ | ❌ | ✅ (valid only) | ✅ (override) |
| GET /operations/couriers | ❌ | ❌ | ✅ (own hub) | ✅ | ✅ |
| PATCH /operations/couriers/:id/availability | ❌ | ❌ | ✅ (own hub) | ✅ | ✅ |

### Payments
| Endpoint | CUSTOMER | COURIER | HUB_MANAGER | OPS_MANAGER | ADMIN |
|----------|----------|---------|-------------|-------------|-------|
| POST /payments/bkash/initiate | ✅ | ❌ | ❌ | ❌ | ✅ |
| GET /payments/bkash/callback | Public | — | — | — | — |
| GET /payments/shipment/:shipmentId | ✅ (own) | ❌ | ❌ | ❌ | ✅ |
| GET /payments | ❌ | ❌ | ❌ | ❌ | ✅ |

### Notifications
| Endpoint | CUSTOMER | COURIER | HUB_MANAGER | OPS_MANAGER | ADMIN |
|----------|----------|---------|-------------|-------------|-------|
| GET /notifications | ✅ | ✅ | ✅ | ✅ | ✅ |
| PATCH /notifications/read-all | ✅ | ✅ | ✅ | ✅ | ✅ |
| PATCH /notifications/:id/read | ✅ | ✅ | ✅ | ✅ | ✅ |

### Admin
| Endpoint | CUSTOMER | COURIER | HUB_MANAGER | OPS_MANAGER | ADMIN |
|----------|----------|---------|-------------|-------------|-------|
| GET /admin/stats | ❌ | ❌ | ❌ | ❌ | ✅ |
| GET /admin/audit-logs | ❌ | ❌ | ❌ | ❌ | ✅ |
| GET /admin/audit-logs/operational | ❌ | ❌ | ❌ | ✅ | ✅ |

---

## Dashboard Routes (Frontend)

| Path | Role | Notes |
|------|------|-------|
| `/dashboard` | Any (redirect to role dashboard) | |
| `/dashboard/customer/*` | CUSTOMER | |
| `/dashboard/courier/*` | COURIER | |
| `/dashboard/hub/*` | HUB_MANAGER | |
| `/dashboard/operations/*` | OPERATIONS_MANAGER | |
| `/dashboard/admin/*` | ADMIN | |
