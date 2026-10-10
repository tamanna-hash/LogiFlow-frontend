import { apiGet, apiPost, apiPatch } from "@/lib/api/client";
import { COURIER_ENDPOINTS, OPERATIONS_ENDPOINTS } from "@/lib/api/endpoints";
import type { CourierAssignment, CourierProfile, PaginationMeta, CourierAvailability } from "@/types";

export interface AssignmentListResponse {
  assignments: CourierAssignment[];
  meta: PaginationMeta;
}

export async function getAssignments(params?: {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
}): Promise<AssignmentListResponse> {
  const resp = await apiGet<CourierAssignment[]>(
    COURIER_ENDPOINTS.assignments,
    params as Record<string, unknown>
  );
  return { assignments: resp.data, meta: resp.meta! };
}

export async function acceptAssignment(id: string): Promise<void> {
  await apiPatch(COURIER_ENDPOINTS.acceptAssignment(id));
}

export async function rejectAssignment(
  id: string,
  reason?: string
): Promise<void> {
  await apiPatch(COURIER_ENDPOINTS.rejectAssignment(id), { reason });
}

export async function updateAvailability(
  availability: "AVAILABLE" | "UNAVAILABLE"
): Promise<void> {
  await apiPatch(COURIER_ENDPOINTS.availability, { availability });
}

export async function confirmPickup(shipmentId: string): Promise<void> {
  await apiPost(COURIER_ENDPOINTS.confirmPickup(shipmentId));
}

export async function recordDelivery(
  shipmentId: string,
  data: { notes?: string; proofImage?: File }
): Promise<void> {
  const formData = new FormData();
  if (data.notes) formData.append("notes", data.notes);
  if (data.proofImage) formData.append("proofImage", data.proofImage);
  
  const clientModule = await import("@/lib/api/client");
  const client = clientModule.default;
  await client.post(COURIER_ENDPOINTS.recordDelivery(shipmentId), formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function recordDeliveryFailed(
  shipmentId: string,
  data: { failureReason: string; notes?: string }
): Promise<void> {
  await apiPost(COURIER_ENDPOINTS.recordDeliveryFailed(shipmentId), data);
}

export interface EarningsResponse {
  deliveries: {
    id: string;
    attemptedAt: string;
    deliveredAt?: string | null;
    shipment: {
      trackingNumber: string;
      price: number;
      recipientCity: string;
    };
  }[];
  totalDeliveries: number;
  meta: PaginationMeta;
}

export async function getEarnings(params?: {
  page?: number;
  limit?: number;
  fromDate?: string;
  toDate?: string;
}): Promise<EarningsResponse> {
  const resp = await apiGet<{ deliveries: EarningsResponse["deliveries"]; totalDeliveries: number }>(
    COURIER_ENDPOINTS.earnings,
    params as Record<string, unknown>
  );
  return {
    deliveries: resp.data.deliveries ?? [],
    totalDeliveries: resp.data.totalDeliveries ?? 0,
    meta: resp.meta!,
  };
}

// Operations — courier management
export interface CourierListResponse {
  couriers: CourierProfile[];
  meta: PaginationMeta;
}

export async function listCouriers(params?: {
  page?: number;
  limit?: number;
  availability?: string;
  hubId?: string;
  search?: string;
}): Promise<CourierListResponse> {
  const resp = await apiGet<CourierProfile[]>(
    OPERATIONS_ENDPOINTS.listCouriers,
    params as Record<string, unknown>
  );
  return { couriers: resp.data, meta: resp.meta! };
}

export async function createAssignment(data: {
  shipmentId: string;
  courierProfileId: string;
  type: string;
}): Promise<void> {
  await apiPost(OPERATIONS_ENDPOINTS.createAssignment, data);
}

export async function cancelOperationsAssignment(
  id: string,
  reason: string
): Promise<void> {
  await apiPatch(OPERATIONS_ENDPOINTS.cancelAssignment(id), { reason });
}

export async function updateOperationsShipmentStatus(
  id: string,
  data: { status: string; reason?: string }
): Promise<void> {
  await apiPatch(OPERATIONS_ENDPOINTS.updateShipmentStatus(id), data);
}

export async function updateOperationsCourierAvailability(
  courierProfileId: string,
  availability: CourierAvailability
): Promise<void> {
  await apiPatch(
    OPERATIONS_ENDPOINTS.updateCourierAvailability(courierProfileId),
    { availability }
  );
}
