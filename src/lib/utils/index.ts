import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ShipmentStatus, PaymentStatus, CourierAvailability, AssignmentStatus, DeliveryType, ParcelType } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Formatters ────────────────────────────────────────────────────────────────

export function formatCurrency(amount: number | string, currency = "BDT") {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return `${currency} 0.00`;
  return `${currency} ${num.toFixed(2)}`;
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
}

// ── Status labels & variants ──────────────────────────────────────────────────

export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  CREATED: "Created",
  PICKUP_REQUESTED: "Pickup Requested",
  ASSIGNED: "Courier Assigned",
  PICKED_UP: "Picked Up",
  AT_ORIGIN_HUB: "At Origin Hub",
  IN_TRANSIT: "In Transit",
  AT_DESTINATION_HUB: "At Destination Hub",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  DELIVERY_FAILED: "Delivery Failed",
  CANCELLED: "Cancelled",
  RETURN_INITIATED: "Return Initiated",
  RETURNING: "Returning",
  RETURNED: "Returned",
};

export const SHIPMENT_STATUS_VARIANTS: Record<
  ShipmentStatus,
  "default" | "secondary" | "destructive" | "success" | "warning" | "outline"
> = {
  CREATED: "outline",
  PICKUP_REQUESTED: "secondary",
  ASSIGNED: "secondary",
  PICKED_UP: "default",
  AT_ORIGIN_HUB: "default",
  IN_TRANSIT: "default",
  AT_DESTINATION_HUB: "default",
  OUT_FOR_DELIVERY: "warning",
  DELIVERED: "success",
  DELIVERY_FAILED: "destructive",
  CANCELLED: "destructive",
  RETURN_INITIATED: "warning",
  RETURNING: "warning",
  RETURNED: "secondary",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  COMPLETED: "Paid",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
  REFUND_PENDING: "Refund Pending",
  REFUNDED: "Refunded",
};

export const PAYMENT_STATUS_VARIANTS: Record<
  PaymentStatus,
  "default" | "secondary" | "destructive" | "success" | "warning" | "outline"
> = {
  PENDING: "warning",
  COMPLETED: "success",
  FAILED: "destructive",
  CANCELLED: "secondary",
  REFUND_PENDING: "warning",
  REFUNDED: "secondary",
};

export const COURIER_AVAILABILITY_LABELS: Record<CourierAvailability, string> = {
  AVAILABLE: "Available",
  UNAVAILABLE: "Unavailable",
  ON_DELIVERY: "On Delivery",
};

export const ASSIGNMENT_STATUS_LABELS: Record<AssignmentStatus, string> = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  REJECTED: "Rejected",
};

export const DELIVERY_TYPE_LABELS: Record<DeliveryType, string> = {
  STANDARD: "Standard",
  EXPRESS: "Express",
  SAME_DAY: "Same Day",
};

export const PARCEL_TYPE_LABELS: Record<ParcelType, string> = {
  DOCUMENT: "Document",
  REGULAR: "Regular",
  FRAGILE: "Fragile",
  OVERSIZED: "Oversized",
};

// ── Misc helpers ──────────────────────────────────────────────────────────────

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}…`;
}

export function buildQueryString(
  params: Record<string, string | number | boolean | undefined | null>
): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  }
  const str = searchParams.toString();
  return str ? `?${str}` : "";
}
