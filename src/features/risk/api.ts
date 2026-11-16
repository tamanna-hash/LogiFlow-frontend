import { apiGet, apiPost } from "@/lib/api/client";
import { RISK_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  RiskAssessment,
  RiskOverview,
  RiskLevel,
  ShipmentStatus,
  PaginationMeta,
} from "@/types";

// ── Param types ───────────────────────────────────────────────────────────────

export interface RiskListParams {
  page?: number;
  limit?: number;
  riskLevel?: RiskLevel;
  shipmentStatus?: ShipmentStatus;
  search?: string;
  fromDate?: string;
  toDate?: string;
}

export interface RiskListResponse {
  assessments: RiskAssessment[];
  meta: PaginationMeta;
}

// ── API functions ─────────────────────────────────────────────────────────────

/** GET /risk/overview — aggregate counts scoped to the caller's role. */
export async function getRiskOverview(): Promise<RiskOverview> {
  const resp = await apiGet<RiskOverview>(RISK_ENDPOINTS.overview);
  return resp.data;
}

/** GET /risk/shipments — paginated latest-assessment-per-shipment list. */
export async function listRiskAssessments(
  params: RiskListParams,
): Promise<RiskListResponse> {
  const resp = await apiGet<RiskAssessment[]>(
    RISK_ENDPOINTS.list,
    params as Record<string, unknown>,
  );
  return { assessments: resp.data, meta: resp.meta! };
}

/** POST /risk/shipments/:shipmentId/assess — trigger a fresh assessment. */
export async function assessShipment(
  shipmentId: string,
): Promise<RiskAssessment> {
  const resp = await apiPost<RiskAssessment>(RISK_ENDPOINTS.assess(shipmentId));
  return resp.data;
}

/** GET /risk/shipments/:shipmentId/latest — most recent assessment or null. */
export async function getLatestAssessment(
  shipmentId: string,
): Promise<RiskAssessment | null> {
  const resp = await apiGet<RiskAssessment | null>(RISK_ENDPOINTS.latest(shipmentId));
  return resp.data;
}
