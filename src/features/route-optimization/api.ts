import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api/client";
import { ROUTE_ENDPOINTS } from "@/lib/api/endpoints";
import type { OptimizedRoute, HubRoute, PaginationMeta } from "@/types";

// ── Optimize ──────────────────────────────────────────────────────────────────

export async function optimizeRoute(
  fromHubId: string,
  toHubId: string,
): Promise<OptimizedRoute> {
  const resp = await apiGet<OptimizedRoute>(ROUTE_ENDPOINTS.optimize, {
    fromHubId,
    toHubId,
  });
  return resp.data;
}

export async function optimizeShipmentRoute(
  shipmentId: string,
): Promise<OptimizedRoute> {
  const resp = await apiGet<OptimizedRoute>(
    ROUTE_ENDPOINTS.optimizeShipment(shipmentId),
  );
  return resp.data;
}

// ── Route management (ADMIN) ──────────────────────────────────────────────────

export interface RouteListParams {
  page?: number;
  limit?: number;
  isActive?: boolean;
}

export interface RouteListResponse {
  routes: HubRoute[];
  meta: PaginationMeta;
}

export async function listRoutes(
  params: RouteListParams = {},
): Promise<RouteListResponse> {
  const resp = await apiGet<HubRoute[]>(
    ROUTE_ENDPOINTS.list,
    params as Record<string, unknown>,
  );
  return { routes: resp.data, meta: resp.meta! };
}

export interface CreateRouteInput {
  fromHubId: string;
  toHubId: string;
  cost: number;
  isActive?: boolean;
}

export async function createRoute(input: CreateRouteInput): Promise<HubRoute> {
  const resp = await apiPost<HubRoute>(ROUTE_ENDPOINTS.list, input);
  return resp.data;
}

export async function updateRoute(
  id: string,
  input: { cost?: number; isActive?: boolean },
): Promise<HubRoute> {
  const resp = await apiPatch<HubRoute>(ROUTE_ENDPOINTS.byId(id), input);
  return resp.data;
}

export async function deleteRoute(id: string): Promise<void> {
  await apiDelete(ROUTE_ENDPOINTS.byId(id));
}
