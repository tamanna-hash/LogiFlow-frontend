"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/api/query-client";
import type { ApiError } from "@/lib/api/client";
import {
  listShipments,
  getShipment,
  createShipment,
  updateShipment,
  cancelShipment,
  requestPickup,
  getShipmentTracking,
  initiateReturn,
  getPublicTracking,
  calculatePrice,
  listZones,
  type ShipmentListParams,
} from "./api";

export function useShipments(params: ShipmentListParams) {
  return useQuery({
    queryKey: queryKeys.shipments(params as Record<string, unknown>),
    queryFn: () => listShipments(params),
  });
}

export function useShipment(id: string) {
  return useQuery({
    queryKey: queryKeys.shipment(id),
    queryFn: () => getShipment(id),
    enabled: !!id,
  });
}

export function useShipmentTracking(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.shipmentTracking(id),
    queryFn: () => getShipmentTracking(id),
    enabled: !!id && enabled,
  });
}

export function usePublicTracking(trackingNumber: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.publicTracking(trackingNumber),
    queryFn: () => getPublicTracking(trackingNumber),
    enabled: !!trackingNumber && enabled,
    retry: false,
  });
}

export function useCreateShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createShipment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments() });
      toast.success("Shipment created successfully!");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to create shipment");
    },
  });
}

export function useUpdateShipment(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => updateShipment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shipment(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments() });
      toast.success("Shipment updated.");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to update shipment");
    },
  });
}

export function useCancelShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      cancelShipment(id, reason),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shipment(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments() });
      toast.success("Shipment cancelled.");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to cancel shipment");
    },
  });
}

export function useRequestPickup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { scheduledAt?: string; notes?: string };
    }) => requestPickup(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shipment(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments() });
      toast.success("Pickup requested successfully.");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to request pickup");
    },
  });
}

export function useInitiateReturn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      initiateReturn(id, reason),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shipment(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments() });
      toast.success("Return initiated.");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to initiate return");
    },
  });
}

export function useCalculatePrice() {
  return useMutation({
    mutationFn: calculatePrice,
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to calculate price");
    },
  });
}

export function useZones(params?: {
  hubId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.zones(params as Record<string, unknown>),
    queryFn: () => listZones(params),
    staleTime: 10 * 60 * 1000, // zones don't change often
  });
}
