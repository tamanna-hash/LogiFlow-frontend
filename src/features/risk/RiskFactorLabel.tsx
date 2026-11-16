import type { RiskFactorCode } from "@/types";

const FACTOR_LABELS: Record<RiskFactorCode, string> = {
  STATUS_INACTIVE_WARNING:    "Inactivity warning",
  STATUS_INACTIVE_CRITICAL:   "Critical inactivity",
  FAILED_DELIVERY_ATTEMPT_1:  "1 failed delivery",
  FAILED_DELIVERY_ATTEMPT_2:  "2 failed deliveries",
  FAILED_DELIVERY_ATTEMPT_MAX:"Max delivery attempts",
  COURIER_NOT_ACCEPTED:       "Courier not accepted",
  MULTIPLE_HUB_TRANSFERS:     "Multiple hub transfers",
};

export function riskFactorLabel(code: RiskFactorCode): string {
  return FACTOR_LABELS[code] ?? code;
}
