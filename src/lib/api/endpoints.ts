/**
 * Centralized API endpoint definitions.
 * All paths are relative to the API base URL (no leading slash needed by axios).
 */

export const AUTH_ENDPOINTS = {
  register:       "/auth/register",
  verifyEmail:    "/auth/verify-email",
  login:          "/auth/login",
  refresh:        "/auth/refresh",
  logout:         "/auth/logout",
  changePassword: "/auth/change-password",
  setPassword:    "/auth/set-password",
  googleAuth:     "/auth/google",
} as const;

export const USER_ENDPOINTS = {
  me: "/users/me",
  list: "/users",
  byId: (id: string) => `/users/${id}`,
  role: (id: string) => `/users/${id}/role`,
  delete: (id: string) => `/users/${id}`,
} as const;

export const SHIPMENT_ENDPOINTS = {
  create: "/shipments",
  list: "/shipments",
  byId: (id: string) => `/shipments/${id}`,
  update: (id: string) => `/shipments/${id}`,
  cancel: (id: string) => `/shipments/${id}/cancel`,
  pickupRequest: (id: string) => `/shipments/${id}/pickup-request`,
  tracking: (id: string) => `/shipments/${id}/tracking`,
  return: (id: string) => `/shipments/${id}/return`,
} as const;

export const TRACKING_ENDPOINTS = {
  public: (trackingNumber: string) => `/tracking/${trackingNumber}`,
} as const;

export const PRICING_ENDPOINTS = {
  rules: "/pricing/rules",
  ruleById: (id: string) => `/pricing/rules/${id}`,
  calculate: "/pricing/calculate",
} as const;

export const HUB_ENDPOINTS = {
  create: "/hubs",
  list: "/hubs",
  byId: (id: string) => `/hubs/${id}`,
  update: (id: string) => `/hubs/${id}`,
  deactivate: (id: string) => `/hubs/${id}`,
  transfer: (hubId: string) => `/hubs/${hubId}/transfers`,
  confirmArrival: (hubId: string, transferId: string) =>
    `/hubs/${hubId}/transfers/${transferId}/arrive`,
  // Hub Manager assignment
  manager: (hubId: string) => `/hubs/${hubId}/manager`,
  unassignedManagers: "/hubs/unassigned-managers",
  // Hub couriers (admin view)
  hubCouriers: (hubId: string) => `/hubs/${hubId}/couriers`,
} as const;

export const ZONE_ENDPOINTS = {
  create: "/zones",
  list: "/zones",
  update: (id: string) => `/zones/${id}`,
  delete: (id: string) => `/zones/${id}`,
} as const;

export const COURIER_ENDPOINTS = {
  assignments: "/courier/assignments",
  acceptAssignment: (id: string) => `/courier/assignments/${id}/accept`,
  rejectAssignment: (id: string) => `/courier/assignments/${id}/reject`,
  availability: "/courier/availability",
  confirmPickup: (shipmentId: string) =>
    `/courier/shipments/${shipmentId}/pickup-confirm`,
  recordDelivery: (shipmentId: string) =>
    `/courier/shipments/${shipmentId}/deliver`,
  recordDeliveryFailed: (shipmentId: string) =>
    `/courier/shipments/${shipmentId}/delivery-failed`,
  earnings: "/courier/earnings",
} as const;

export const OPERATIONS_ENDPOINTS = {
  createAssignment: "/operations/assignments",
  cancelAssignment: (id: string) => `/operations/assignments/${id}/cancel`,
  updateShipmentStatus: (id: string) => `/operations/shipments/${id}/status`,
  listCouriers: "/operations/couriers",
  updateCourierAvailability: (courierProfileId: string) =>
    `/operations/couriers/${courierProfileId}/availability`,
} as const;

export const PAYMENT_ENDPOINTS = {
  initiateBkash: "/payments/bkash/initiate",
  bkashCallback: "/payments/bkash/callback",
  stripeCheckout: "/payments/stripe/checkout",
  byShipment: (shipmentId: string) => `/payments/shipment/${shipmentId}`,
  list: "/payments",
} as const;

export const NOTIFICATION_ENDPOINTS = {
  list: "/notifications",
  readAll: "/notifications/read-all",
  markRead: (id: string) => `/notifications/${id}/read`,
} as const;

export const ADMIN_ENDPOINTS = {
  stats: "/admin/stats",
  auditLogs: "/admin/audit-logs",
  operationalLogs: "/admin/audit-logs/operational",
} as const;
