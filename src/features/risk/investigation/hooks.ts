"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/api/query-client";
import type { ApiError } from "@/lib/api/client";
import { investigateShipment, type InvestigateParams } from "./api";

/**
 * useInvestigateShipment — mutation that calls the AI investigation endpoint.
 *
 * This is a mutation (not a query) because:
 *  1. Each investigation is a deliberate user action, not a passive fetch.
 *  2. The backend always runs a fresh LLM call — caching would serve stale data.
 *  3. Mutations give us proper loading/error/retry semantics out of the box.
 */
export function useInvestigateShipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: InvestigateParams) => investigateShipment(params),
    onSuccess: (data, { shipmentId }) => {
      // Invalidate the latest risk assessment so the panel reflects any
      // newly-created assessment from the investigation pipeline.
      void qc.invalidateQueries({ queryKey: queryKeys.riskLatest(shipmentId) });
    },
    onError: (error: ApiError) => {
      if (error.status === 503) {
        toast.error("AI investigation is not available right now. Please try again later.");
      } else if (error.status === 429) {
        toast.error("Investigation rate limit reached. Please wait a few minutes before retrying.");
      } else {
        toast.error(error.message ?? "Investigation failed.");
      }
    },
  });
}
