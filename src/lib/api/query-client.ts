import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./client";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
        retry: (failureCount, error) => {
          // Don't retry client errors — they won't resolve on their own
          if (error instanceof ApiError) {
            if ([400, 401, 403, 404, 409, 422].includes(error.status)) return false;
          }
          // Allow up to 2 retries for network/server errors
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export const queryKeys = {
  // Auth
  currentUser: ["auth", "me"] as const,

  // Shipments
  shipments: (params?: Record<string, unknown>) =>
    params ? ["shipments", params] : ["shipments"],
  shipment: (id: string) => ["shipments", id] as const,
  shipmentTracking: (id: string) => ["shipments", id, "tracking"] as const,

  // Tracking (public)
  publicTracking: (trackingNumber: string) =>
    ["tracking", trackingNumber] as const,

  // Payments
  paymentByShipment: (shipmentId: string) =>
    ["payments", "shipment", shipmentId] as const,
  payments: (params?: Record<string, unknown>) =>
    params ? ["payments", params] : ["payments"],

  // Hubs
  hubs: (params?: Record<string, unknown>) =>
    params ? ["hubs", params] : ["hubs"],
  hub: (id: string) => ["hubs", id] as const,

  // Zones
  zones: (params?: Record<string, unknown>) =>
    params ? ["zones", params] : ["zones"],

  // Pricing
  pricingRules: () => ["pricing", "rules"] as const,

  // Couriers
  assignments: (params?: Record<string, unknown>) =>
    params ? ["courier", "assignments", params] : ["courier", "assignments"],
  earnings: (params?: Record<string, unknown>) =>
    params ? ["courier", "earnings", params] : ["courier", "earnings"],
  couriers: (params?: Record<string, unknown>) =>
    params ? ["operations", "couriers", params] : ["operations", "couriers"],

  // Notifications
  notifications: (params?: Record<string, unknown>) =>
    params ? ["notifications", params] : ["notifications"],

  // Admin
  adminStats: () => ["admin", "stats"] as const,
  auditLogs: (params?: Record<string, unknown>) =>
    params ? ["admin", "audit-logs", params] : ["admin", "audit-logs"],
  users: (params?: Record<string, unknown>) =>
    params ? ["users", params] : ["users"],
  user: (id: string) => ["users", id] as const,
} as const;
