import { apiPost } from "@/lib/api/client";
import { AI_ENDPOINTS } from "@/lib/api/endpoints";
import type { InvestigationReport } from "@/types";

export interface InvestigateParams {
  shipmentId: string;
  question: string;
}

/**
 * POST /api/v1/ai/shipments/:shipmentId/investigate
 *
 * The shipmentId and question are the ONLY fields sent to the backend.
 * All shipment data is retrieved server-side — this call never sends
 * raw shipment records or internal data to the frontend.
 */
export async function investigateShipment(
  params: InvestigateParams,
): Promise<InvestigationReport> {
  const resp = await apiPost<InvestigationReport>(
    AI_ENDPOINTS.investigate(params.shipmentId),
    { question: params.question },
  );
  return resp.data;
}
