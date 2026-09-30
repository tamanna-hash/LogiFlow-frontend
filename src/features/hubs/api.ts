import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api/client";
import { HUB_ENDPOINTS } from "@/lib/api/endpoints";
import type { Hub, PaginationMeta } from "@/types";

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
