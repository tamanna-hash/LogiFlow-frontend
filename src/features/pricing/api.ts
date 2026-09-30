import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api/client";
import { PRICING_ENDPOINTS } from "@/lib/api/endpoints";
import type { PricingRule } from "@/types";

export async function listPricingRules(): Promise<PricingRule[]> {
  const resp = await apiGet<PricingRule[]>(PRICING_ENDPOINTS.rules);
  return resp.data;
}

export async function createPricingRule(
  data: Partial<PricingRule>
): Promise<PricingRule> {
  const resp = await apiPost<PricingRule>(PRICING_ENDPOINTS.rules, data);
  return resp.data;
}

export async function updatePricingRule(
  id: string,
  data: Partial<PricingRule>
): Promise<PricingRule> {
  const resp = await apiPatch<PricingRule>(PRICING_ENDPOINTS.ruleById(id), data);
  return resp.data;
}

export async function deletePricingRule(id: string): Promise<void> {
  await apiDelete(PRICING_ENDPOINTS.ruleById(id));
}
