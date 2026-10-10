import { apiGet, apiPost, apiPatch } from "@/lib/api/client";
import { SHIPMENT_ENDPOINTS, TRACKING_ENDPOINTS, PRICING_ENDPOINTS, ZONE_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  ShipmentListItem,
  ShipmentDetail,
  TrackingEvent,
  PublicTrackingData,
  PriceBreakdown,
  Zone,
  PaginationMeta,
  ShipmentStatus,
  DeliveryType,
  PaymentStatus,
} from "@/types";

export interface ShipmentListParams {
  page?: number;
  limit?: number;
  status?: ShipmentStatus;
  paymentStatus?: PaymentStatus;
  deliveryType?: DeliveryType;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  fromDate?: string;
  toDate?: string;
  pickupQueue?: boolean;
}

export interface ShipmentListResponse {
  shipments: ShipmentListItem[];
  meta: PaginationMeta;
}

export async function listShipments(
  params: ShipmentListParams
): Promise<ShipmentListResponse> {
  const resp = await apiGet<ShipmentListItem[]>(
    SHIPMENT_ENDPOINTS.list,
    params as Record<string, unknown>
  );
  return {
    shipments: resp.data,
    meta: resp.meta!,
  };
}

export async function getShipment(id: string): Promise<ShipmentDetail> {
  const resp = await apiGet<ShipmentDetail>(SHIPMENT_ENDPOINTS.byId(id));
  return resp.data;
}

export async function createShipment(data: Record<string, unknown>): Promise<ShipmentDetail & { priceBreakdown: PriceBreakdown }> {
  const resp = await apiPost<ShipmentDetail & { priceBreakdown: PriceBreakdown }>(
    SHIPMENT_ENDPOINTS.create,
    data
  );
  return resp.data;
}

export async function updateShipment(
  id: string,
  data: Record<string, unknown>
): Promise<ShipmentDetail> {
  const resp = await apiPatch<ShipmentDetail>(SHIPMENT_ENDPOINTS.update(id), data);
  return resp.data;
}

export async function cancelShipment(
  id: string,
  reason: string
): Promise<void> {
  await apiPost<void>(SHIPMENT_ENDPOINTS.cancel(id), { reason });
}

export async function requestPickup(
  id: string,
  data: { scheduledAt?: string; notes?: string }
): Promise<void> {
  await apiPost<void>(SHIPMENT_ENDPOINTS.pickupRequest(id), data);
}

export async function getShipmentTracking(id: string): Promise<TrackingEvent[]> {
  const resp = await apiGet<TrackingEvent[]>(SHIPMENT_ENDPOINTS.tracking(id));
  return resp.data;
}

export async function initiateReturn(
  id: string,
  reason: string
): Promise<void> {
  await apiPost<void>(SHIPMENT_ENDPOINTS.return(id), { reason });
}

// Public tracking
export async function getPublicTracking(
  trackingNumber: string
): Promise<PublicTrackingData> {
  const resp = await apiGet<PublicTrackingData>(
    TRACKING_ENDPOINTS.public(trackingNumber)
  );
  return resp.data;
}

// Price calculation
export async function calculatePrice(data: {
  originZoneId: string;
  destinationZoneId: string;
  deliveryType: string;
  parcelType: string;
  weightKg: number;
}): Promise<PriceBreakdown> {
  const resp = await apiPost<PriceBreakdown>(PRICING_ENDPOINTS.calculate, data);
  return resp.data;
}

// Zones
export interface ZoneListResponse {
  zones: Zone[];
  meta: PaginationMeta;
}

export async function listZones(params?: {
  hubId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}): Promise<ZoneListResponse> {
  const resp = await apiGet<Zone[]>(
    ZONE_ENDPOINTS.list,
    params as Record<string, unknown>
  );
  return { zones: resp.data, meta: resp.meta! };
}
