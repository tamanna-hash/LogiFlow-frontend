import { apiGet, apiPost, apiPatch, apiDelete, apiPut } from "@/lib/api/client";
import { HUB_ENDPOINTS } from "@/lib/api/endpoints";
import type { Hub, UnassignedHubManager, PaginationMeta } from "@/types";

export interface HubListResponse {
  hubs: Hub[];
  meta: PaginationMeta;
}

export async function listHubs(params?: {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
}): Promise<HubListResponse> {
  const resp = await apiGet<Hub[]>(
    HUB_ENDPOINTS.list,
    params as Record<string, unknown>
  );
  return { hubs: resp.data, meta: resp.meta! };
}

export async function getHub(id: string): Promise<Hub> {
  const resp = await apiGet<Hub>(HUB_ENDPOINTS.byId(id));
  return resp.data;
}

export async function createHub(data: {
  name: string;
  code: string;
  address: string;
  city: string;
  phone?: string;
}): Promise<Hub> {
  const resp = await apiPost<Hub>(HUB_ENDPOINTS.create, data);
  return resp.data;
}

export async function updateHub(
  id: string,
  data: Partial<{ name: string; code: string; address: string; city: string; phone: string }>
): Promise<Hub> {
  const resp = await apiPatch<Hub>(HUB_ENDPOINTS.update(id), data);
  return resp.data;
}

export async function deactivateHub(id: string): Promise<void> {
  await apiDelete(HUB_ENDPOINTS.deactivate(id));
}

export async function createTransfer(
  hubId: string,
  data: {
    shipmentId: string;
    toHubId: string;
    estimatedArrival?: string;
    notes?: string;
  }
): Promise<void> {
  await apiPost(HUB_ENDPOINTS.transfer(hubId), data);
}

export async function confirmArrival(
  hubId: string,
  transferId: string
): Promise<void> {
  await apiPatch(HUB_ENDPOINTS.confirmArrival(hubId, transferId));
}

// ── Hub Manager Assignment ────────────────────────────────────────────────────

export async function getHubManager(hubId: string): Promise<Hub> {
  const resp = await apiGet<Hub>(HUB_ENDPOINTS.manager(hubId));
  return resp.data;
}

export async function assignHubManager(hubId: string, userId: string): Promise<Hub> {
  const resp = await apiPut<Hub>(HUB_ENDPOINTS.manager(hubId), { userId });
  return resp.data;
}

export async function removeHubManager(hubId: string, userId: string): Promise<void> {
  await apiDelete(HUB_ENDPOINTS.manager(hubId), { userId });
}

export async function listUnassignedManagers(): Promise<UnassignedHubManager[]> {
  const resp = await apiGet<UnassignedHubManager[]>(HUB_ENDPOINTS.unassignedManagers);
  return resp.data;
}

// ── Zone management ───────────────────────────────────────────────────────────
import { ZONE_ENDPOINTS } from "@/lib/api/endpoints";
import type { Zone } from "@/types";

export interface ZoneListResponse {
  zones: Zone[];
  meta: PaginationMeta;
}

export async function listZones(params?: {
  page?: number;
  limit?: number;
}): Promise<ZoneListResponse> {
  const resp = await apiGet<Zone[]>(ZONE_ENDPOINTS.list, params as Record<string, unknown>);
  return { zones: resp.data, meta: resp.meta! };
}

export async function createZone(data: {
  name: string;
  code: string;
  hubId: string;
  description?: string;
}): Promise<Zone> {
  const resp = await apiPost<Zone>(ZONE_ENDPOINTS.create, data);
  return resp.data;
}

export async function updateZone(id: string, data: Partial<{ name: string; code: string; description: string }>): Promise<Zone> {
  const resp = await apiPatch<Zone>(ZONE_ENDPOINTS.update(id), data);
  return resp.data;
}

export async function deleteZone(id: string): Promise<void> {
  await apiDelete(ZONE_ENDPOINTS.delete(id));
}
