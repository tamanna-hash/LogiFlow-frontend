"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/api/query-client";
import type { ApiError } from "@/lib/api/client";
import {
  listPricingRules,
  createPricingRule,
  updatePricingRule,
  deletePricingRule,
} from "./api";
import type { PricingRule } from "@/types";

export function usePricingRules() {
  return useQuery({
    queryKey: queryKeys.pricingRules(),
    queryFn: listPricingRules,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreatePricingRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<PricingRule>) => createPricingRule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pricingRules() });
      toast.success("Pricing rule created.");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to create pricing rule");
    },
  });
}

export function useUpdatePricingRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PricingRule> }) =>
      updatePricingRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pricingRules() });
      toast.success("Pricing rule updated.");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to update pricing rule");
    },
  });
}

export function useDeletePricingRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePricingRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pricingRules() });
      toast.success("Pricing rule deleted.");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to delete pricing rule");
    },
  });
}
