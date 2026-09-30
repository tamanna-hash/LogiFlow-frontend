"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/api/query-client";
import type { ApiError } from "@/lib/api/client";
import {
  getAssignments,
  acceptAssignment,
  rejectAssignment,
  updateAvailability,
  confirmPickup,
  recordDelivery,
  recordDeliveryFailed,
  getEarnings,
  listCouriers,
  createAssignment,
  cancelOperationsAssignment,
  updateOperationsShipmentStatus,
  updateOperationsCourierAvailability,
} from "./api";
import type { CourierAvailability } from "@/types";

export function useAssignments(params?: {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
}) {
  return useQuery({
    queryKey: queryKeys.assignments(params as Record<string, unknown>),
    queryFn: () => getAssignments(params),
  });
}

export function useAcceptAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: acceptAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments() });
      toast.success("Assignment accepted.");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to accept assignment");
    },
  });
}

export function useRejectAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      rejectAssignment(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments() });
      toast.success("Assignment rejected.");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to reject assignment");
    },
  });
}

export function useUpdateAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAvailability,
    onSuccess: (_, availability) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
      toast.success(`Status set to ${availability === "AVAILABLE" ? "Available" : "Unavailable"}.`);
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to update availability");
    },
  });
}

export function useConfirmPickup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: confirmPickup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments() });
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments() });
      toast.success("Pickup confirmed.");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to confirm pickup");
    },
  });
}

export function useRecordDelivery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      shipmentId,
      data,
    }: {
      shipmentId: string;
      data: { notes?: string; proofImage?: File };
    }) => recordDelivery(shipmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments() });
      queryClient.invalidateQueries({ queryKey: queryKeys.earnings() });
      toast.success("Delivery recorded successfully.");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to record delivery");
    },
  });
}

export function useRecordDeliveryFailed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      shipmentId,
      data,
    }: {
      shipmentId: string;
      data: { failureReason: string; notes?: string };
    }) => recordDeliveryFailed(shipmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments() });
      toast.success("Delivery failure recorded.");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to record delivery failure");
    },
  });
}

export function useEarnings(params?: {
  page?: number;
  limit?: number;
  fromDate?: string;
  toDate?: string;
}) {
  return useQuery({
    queryKey: queryKeys.earnings(params as Record<string, unknown>),
    queryFn: () => getEarnings(params),
  });
}

// Operations hooks
export function useCouriers(params?: {
  page?: number;
  limit?: number;
  availability?: string;
  hubId?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: queryKeys.couriers(params as Record<string, unknown>),
    queryFn: () => listCouriers(params),
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments() });
      queryClient.invalidateQueries({ queryKey: queryKeys.couriers() });
      toast.success("Courier assigned successfully.");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to assign courier");
    },
  });
}

export function useCancelOperationsAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      cancelOperationsAssignment(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments() });
      queryClient.invalidateQueries({ queryKey: queryKeys.couriers() });
      toast.success("Assignment cancelled.");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to cancel assignment");
    },
  });
}

export function useUpdateOperationsShipmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { status: string; reason?: string };
    }) => updateOperationsShipmentStatus(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shipment(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments() });
      toast.success("Shipment status updated.");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to update status");
    },
  });
}

export function useUpdateOperationsCourierAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      courierProfileId,
      availability,
    }: {
      courierProfileId: string;
      availability: CourierAvailability;
    }) => updateOperationsCourierAvailability(courierProfileId, availability),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.couriers() });
      toast.success("Courier availability updated.");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to update courier availability");
    },
  });
}
