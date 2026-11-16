"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/api/query-client";
import type { ApiError } from "@/lib/api/client";
import {
  optimizeRoute as optimizeRouteApi,
  optimizeShipmentRoute,
  listRoutes,
  createRoute,
  updateRoute,
  deleteRoute,
  type RouteListParams,
  type CreateRouteInput,
} from "./api";

/** Optimize route between two specific hubs. */
export function useOptimizeRoute(fromHubId: string | null, toHubId: string | null) {
  return useQuery({
    queryKey: fromHubId && toHubId
      ? queryKeys.optimizedRoute(fromHubId, toHubId)
      : ["routes", "optimize"],
    queryFn: () => optimizeRouteApi(fromHubId!, toHubId!),
    enabled: !!fromHubId && !!toHubId && fromHubId !== toHubId,
  });
}

/** Optimize route for a specific shipment. */
export function useOptimizeShipmentRoute(shipmentId: string | null) {
  return useQuery({
    queryKey: shipmentId ? queryKeys.optimizedShipmentRoute(shipmentId) : ["routes", "shipment"],
    queryFn: () => optimizeShipmentRoute(shipmentId!),
    enabled: !!shipmentId,
  });
}

/** List all hub routes (admin). */
export function useRoutes(params: RouteListParams = {}) {
  return useQuery({
    queryKey: queryKeys.routes(params as Record<string, unknown>),
    queryFn: () => listRoutes(params),
  });
}

/** Create a new route (admin). */
export function useCreateRoute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRouteInput) => createRoute(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.routes() });
      toast.success("Route created.");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to create route.");
    },
  });
}

/** Update a route (admin). */
export function useUpdateRoute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: { cost?: number; isActive?: boolean } }) =>
      updateRoute(id, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.routes() });
      toast.success("Route updated.");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to update route.");
    },
  });
}

/** Delete a route (admin). */
export function useDeleteRoute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRoute(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.routes() });
      toast.success("Route deleted.");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to delete route.");
    },
  });
}
