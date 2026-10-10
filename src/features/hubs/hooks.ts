"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/api/query-client";
import type { ApiError } from "@/lib/api/client";
import {
  listHubs,
  getHub,
  createHub,
  updateHub,
  deactivateHub,
  createTransfer,
  confirmArrival,
} from "./api";

export function useHubs(params?: {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
}) {
  return useQuery({
    queryKey: queryKeys.hubs(params as Record<string, unknown>),
    queryFn: () => listHubs(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useHub(id: string) {
  return useQuery({
    queryKey: queryKeys.hub(id),
    queryFn: () => getHub(id),
    enabled: !!id,
  });
}

export function useCreateHub() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createHub,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hubs() });
      toast.success("Hub created successfully.");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to create hub");
    },
  });
}

export function useUpdateHub() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<{ name: string; code: string; address: string; city: string; phone: string }>;
    }) => updateHub(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hub(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.hubs() });
      toast.success("Hub updated.");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to update hub");
    },
  });
}

export function useDeactivateHub() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deactivateHub,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hubs() });
      toast.success("Hub deactivated.");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to deactivate hub");
    },
  });
}

export function useCreateTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      hubId,
      data,
    }: {
      hubId: string;
      data: {
        shipmentId: string;
        toHubId: string;
        estimatedArrival?: string;
        notes?: string;
      };
    }) => createTransfer(hubId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments() });
      toast.success("Transfer created.");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to create transfer");
    },
  });
}

export function useConfirmArrival() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      hubId,
      transferId,
    }: {
      hubId: string;
      transferId: string;
    }) => confirmArrival(hubId, transferId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments() });
      toast.success("Arrival confirmed.");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to confirm arrival");
    },
  });
}

// ── Zone management hooks ──────────────────────────────────────────────────────
import { listZones, createZone, updateZone, deleteZone } from "./api";
import type { Zone } from "@/types";

const zoneKeys = {
  all: ["zones"] as const,
  list: (p?: Record<string, unknown>) => p ? ["zones", p] as const : ["zones"] as const,
};

export function useZonesList(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: zoneKeys.list(params as Record<string, unknown>),
    queryFn: () => listZones(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createZone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: zoneKeys.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.hubs() });
      toast.success("Zone created.");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to create zone");
    },
  });
}

export function useUpdateZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Zone> }) => updateZone(id, { name: data.name, code: data.code, description: data.description ?? undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: zoneKeys.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.hubs() });
      toast.success("Zone updated.");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to update zone");
    },
  });
}

export function useDeleteZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteZone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: zoneKeys.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.hubs() });
      toast.success("Zone deleted.");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to delete zone");
    },
  });
}

// ── Hub Manager Assignment hooks ──────────────────────────────────────────────
import {
  listUnassignedManagers,
  assignHubManager,
  removeHubManager,
} from "./api";
import type { UnassignedHubManager } from "@/types";

export function useUnassignedManagers() {
  return useQuery({
    queryKey: ["hubs", "unassigned-managers"],
    queryFn: listUnassignedManagers,
    staleTime: 30 * 1000,
  });
}

export function useAssignHubManager(hubId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => assignHubManager(hubId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hub(hubId) });
      queryClient.invalidateQueries({ queryKey: ["hubs", "unassigned-managers"] });
      toast.success("Hub manager assigned.");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to assign hub manager");
    },
  });
}

export function useRemoveHubManager(hubId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => removeHubManager(hubId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hub(hubId) });
      queryClient.invalidateQueries({ queryKey: ["hubs", "unassigned-managers"] });
      toast.success("Hub manager removed.");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to remove hub manager");
    },
  });
}
