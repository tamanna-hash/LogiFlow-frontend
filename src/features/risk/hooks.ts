"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/api/query-client";
import type { ApiError } from "@/lib/api/client";
import {
  getRiskOverview,
  listRiskAssessments,
  assessShipment,
  getLatestAssessment,
  type RiskListParams,
} from "./api";

/** Risk aggregate counts. Stale after 2 min (matches server-side cache TTL). */
export function useRiskOverview() {
  return useQuery({
    queryKey: queryKeys.riskOverview(),
    queryFn: getRiskOverview,
    staleTime: 2 * 60 * 1000,
  });
}

/** Paginated latest-per-shipment risk assessments with filter support. */
export function useRiskAssessments(params: RiskListParams = {}) {
  return useQuery({
    queryKey: queryKeys.riskAssessments(params as Record<string, unknown>),
    queryFn: () => listRiskAssessments(params),
  });
}

/** Latest assessment for a single shipment (for the detail panel). */
export function useLatestRiskAssessment(shipmentId: string | null) {
  return useQuery({
    queryKey: queryKeys.riskLatest(shipmentId ?? ""),
    queryFn: () => getLatestAssessment(shipmentId!),
    enabled: !!shipmentId,
  });
}

/**
 * Trigger a fresh risk assessment for a shipment.
 * Invalidates both the list and the overview so counts stay accurate.
 */
export function useAssessShipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (shipmentId: string) => assessShipment(shipmentId),
    onSuccess: (data, shipmentId) => {
      // Invalidate the latest-assessment cache for this specific shipment
      void qc.invalidateQueries({ queryKey: queryKeys.riskLatest(shipmentId) });
      // Invalidate the list so the refreshed row appears with up-to-date score
      void qc.invalidateQueries({ queryKey: queryKeys.riskAssessments() });
      // Invalidate the overview counts
      void qc.invalidateQueries({ queryKey: queryKeys.riskOverview() });
      toast.success(
        `Risk assessed: ${data.riskLevel} (score ${data.riskScore})`,
      );
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Risk assessment failed.");
    },
  });
}
