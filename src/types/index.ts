// ── Roles ─────────────────────────────────────────────────────────────────────
export type Role =
  | "CUSTOMER"
  | "COURIER"
  | "HUB_MANAGER"
  | "OPERATIONS_MANAGER"
  | "ADMIN";

// ── Enums (mirrored from backend Prisma schema) ───────────────────────────────
export type ShipmentStatus =
  | "CREATED"
  | "PICKUP_REQUESTED"
  | "ASSIGNED"
  | "PICKED_UP"
  | "AT_ORIGIN_HUB"
  | "IN_TRANSIT"
  | "AT_DESTINATION_HUB"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "DELIVERY_FAILED"
  | "CANCELLED"
  | "RETURN_INITIATED"
  | "RETURNING"
  | "RETURNED";

export type PaymentStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "REFUND_PENDING"
  | "REFUNDED";

export type DeliveryType = "STANDARD" | "EXPRESS" | "SAME_DAY";

export type ParcelType = "DOCUMENT" | "REGULAR" | "FRAGILE" | "OVERSIZED";

export type CourierAvailability = "AVAILABLE" | "UNAVAILABLE" | "ON_DELIVERY";

export type AssignmentStatus = "ACTIVE" | "COMPLETED" | "CANCELLED" | "REJECTED";

export type AssignmentType = "PICKUP" | "DELIVERY" | "RETURN";

export type DeliveryFailureReason =
  | "NO_ONE_HOME"
  | "ADDRESS_NOT_FOUND"
  | "REFUSED_BY_RECIPIENT"
  | "DAMAGED_IN_TRANSIT"
  | "OTHER";

export type NotificationType =
  | "SHIPMENT_CREATED"
  | "PAYMENT_COMPLETED"
  | "PAYMENT_FAILED"
  | "PICKUP_REQUESTED"
  | "COURIER_ASSIGNED"
  | "PARCEL_PICKED_UP"
  | "ARRIVED_AT_HUB"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "DELIVERY_FAILED"
  | "RETURN_INITIATED"
  | "RETURNING"
  | "RETURNED"
  | "SHIPMENT_CANCELLED"
  | "GENERAL";

// ── API response envelope ─────────────────────────────────────────────────────
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  unreadCount?: number;
}

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors: FieldError[];
}

export interface FieldError {
  field?: string;
  message: string;
}

// ── Auth types ────────────────────────────────────────────────────────────────
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: Role;
  avatarUrl?: string | null;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  customerProfile?: {
    defaultAddress?: string | null;
    city?: string | null;
    postalCode?: string | null;
  } | null;
  courierProfile?: {
    hubId?: string | null;
    vehicleType?: string | null;
    vehicleNumber?: string | null;
    licenseNumber?: string | null;
    availability?: CourierAvailability;
    totalDeliveries?: number;
  } | null;
  hubManagerProfile?: {
    hubId?: string | null;
    hub?: { name: string; code: string } | null;
  } | null;
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
}

// ── Shipment types ────────────────────────────────────────────────────────────
export interface ShipmentItem {
  id: string;
  description: string;
  weightKg: number;
  quantity: number;
  parcelType: ParcelType;
}

export interface ShipmentListItem {
  id: string;
  trackingNumber: string;
  status: ShipmentStatus;
  paymentStatus: PaymentStatus;
  senderName: string;
  recipientName: string;
  recipientCity: string;
  deliveryType: DeliveryType;
  parcelType: ParcelType;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentDetail extends ShipmentListItem {
  senderPhone: string;
  senderAddress: string;
  senderCity: string;
  recipientPhone: string;
  recipientAddress: string;
  declaredWeightKg: number;
  actualWeightKg?: number | null;
  description?: string | null;
  specialInstructions?: string | null;
  deliveryAttemptCount: number;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  returnReason?: string | null;
  originZoneId: string;
  destinationZoneId: string;
  currentHubId?: string | null;
  customerId: string;
  items: ShipmentItem[];
  originZone?: { name: string; code: string } | null;
  destinationZone?: { name: string; code: string } | null;
  currentHub?: { name: string; city: string } | null;
}

export interface TrackingEvent {
  id?: string;
  status: ShipmentStatus;
  description: string;
  location?: string | null;
  createdAt: string;
}

export interface PublicTrackingData {
  trackingNumber: string;
  status: ShipmentStatus;
  paymentStatus: PaymentStatus;
  deliveryType: DeliveryType;
  recipientCity: string;
  createdAt: string;
  updatedAt: string;
  originZone?: { name: string } | null;
  destinationZone?: { name: string } | null;
  currentHub?: { name: string; city: string } | null;
  trackingEvents: TrackingEvent[];
}

export interface CreateShipmentInput {
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  senderCity: string;
  originZoneId: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  recipientCity: string;
  destinationZoneId: string;
  deliveryType: DeliveryType;
  parcelType: ParcelType;
  declaredWeightKg: number;
  description?: string;
  specialInstructions?: string;
  items: {
    description: string;
    weightKg: number;
    quantity?: number;
    parcelType?: ParcelType;
  }[];
}

export interface PriceBreakdown {
  basePrice: number;
  weightCharge: number;
  zoneSurcharge: number;
  deliveryTypeSurcharge: number;
  total: number;
}

// ── Payment types ─────────────────────────────────────────────────────────────
export interface Payment {
  id: string;
  amount: number;
  status: PaymentStatus;
  bkashTransactionId?: string | null;
  paidAt?: string | null;
  failedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  shipment?: {
    trackingNumber: string;
    customerId?: string;
    customer?: { firstName: string; lastName: string; email: string };
  };
}

export interface InitiatePaymentResult {
  paymentId: string;
  bkashURL: string;
  amount: string;
}

// ── Hub types ─────────────────────────────────────────────────────────────────
export interface Hub {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  phone?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  zones?: Zone[];
  _count?: { shipmentsCurrently: number };
  /** Populated by GET /hubs/:id/manager */
  hubManagerProfile?: {
    userId: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      avatarUrl?: string | null;
    };
  } | null;
}

/** Shape returned by GET /hubs/unassigned-managers */
export interface UnassignedHubManager {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string | null;
  hubManagerProfile: { hubId: string | null } | null;
}

export interface Zone {
  id: string;
  name: string;
  code: string;
  hubId: string;
  description?: string | null;
  isActive: boolean;
  hub?: { name: string };
}

// ── Courier types ─────────────────────────────────────────────────────────────
export interface CourierAssignment {
  id: string;
  type: AssignmentType;
  status: AssignmentStatus;
  assignedAt: string;
  acceptedAt?: string | null;
  pickedUpAt?: string | null;
  deliveredAt?: string | null;
  shipment: {
    id: string;
    trackingNumber: string;
    status: ShipmentStatus;
    recipientName: string;
    recipientAddress: string;
    recipientCity: string;
    recipientPhone: string;
  };
}

export interface CourierProfile {
  id: string;
  availability: CourierAvailability;
  vehicleType?: string | null;
  totalDeliveries: number;
  hubId?: string | null;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
  };
  hub?: { name: string; city: string } | null;
  assignments?: { shipmentId: string; type: AssignmentType }[];
}

// ── Notification types ────────────────────────────────────────────────────────
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

// ── Admin types ───────────────────────────────────────────────────────────────
export interface SystemStats {
  totalUsers: number;
  totalShipments: number;
  activeShipments: number;
  deliveredToday: number;
  totalRevenue: string;
  pendingPayments: number;
  hubs: {
    total: number;
    active: number;
  };
}

export interface AuditLog {
  id: string;
  action: string;
  actorId?: string | null;
  resourceType: string;
  resourceId: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  createdAt: string;
  actor?: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

// ── Pricing types ─────────────────────────────────────────────────────────────
export interface PricingRule {
  id: string;
  name: string;
  originZoneId?: string | null;
  destinationZoneId?: string | null;
  deliveryType?: DeliveryType | null;
  parcelType?: ParcelType | null;
  basePrice: number;
  pricePerKg: number;
  baseWeightKg: number;
  zoneSurcharge: number;
  deliveryTypeSurcharge: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
}
