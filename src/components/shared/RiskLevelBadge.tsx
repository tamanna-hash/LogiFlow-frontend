import { Badge } from "@/components/ui/badge";
import type { RiskLevel } from "@/types";

const RISK_LABELS: Record<RiskLevel, string> = {
  LOW:    "Low Risk",
  MEDIUM: "Medium Risk",
  HIGH:   "High Risk",
};

type BadgeVariant = "success" | "warning" | "destructive";

const RISK_VARIANTS: Record<RiskLevel, BadgeVariant> = {
  LOW:    "success",
  MEDIUM: "warning",
  HIGH:   "destructive",
};

export function RiskLevelBadge({ level }: { level: RiskLevel }) {
  return (
    <Badge variant={RISK_VARIANTS[level]}>
      {RISK_LABELS[level]}
    </Badge>
  );
}
