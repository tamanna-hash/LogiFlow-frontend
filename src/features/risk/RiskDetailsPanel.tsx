"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RiskLevelBadge } from "@/components/shared/RiskLevelBadge";
import { ShipmentStatusBadge } from "@/components/shared/StatusBadge";
import { formatDateTime, formatRelativeTime } from "@/lib/utils";
import { useAssessShipment } from "./hooks";
import { riskFactorLabel } from "./RiskFactorLabel";
import type { RiskAssessment } from "@/types";

interface RiskDetailsPanelProps {
  assessment: RiskAssessment;
  /** Whether the current user can trigger a re-assessment. */
  canRefresh?: boolean;
}

export function RiskDetailsPanel({ assessment, canRefresh = false }: RiskDetailsPanelProps) {
  const { mutate: assess, isPending } = useAssessShipment();

  const SCORE_COLOR =
    assessment.riskScore >= 70
      ? "text-red-600 dark:text-red-400"
      : assessment.riskScore >= 40
        ? "text-amber-600 dark:text-amber-400"
        : "text-emerald-600 dark:text-emerald-400";

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`text-4xl font-bold tabular-nums ${SCORE_COLOR}`}>
            {assessment.riskScore}
          </span>
          <div className="space-y-1">
            <RiskLevelBadge level={assessment.riskLevel} />
            <p className="text-xs text-muted-foreground">
              {assessment.assessmentStatus === "INSUFFICIENT_DATA"
                ? "Insufficient data"
                : `Assessed ${formatRelativeTime(assessment.assessedAt)}`}
            </p>
          </div>
        </div>

        {canRefresh && (
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => assess(assessment.shipmentId)}
          >
            <RefreshCw className={`mr-2 size-3.5 ${isPending ? "animate-spin" : ""}`} />
            {isPending ? "Assessing…" : "Re-assess"}
          </Button>
        )}
      </div>

      {/* Shipment context */}
      <div className="flex flex-wrap gap-4 rounded-lg border bg-muted/30 px-4 py-3 text-sm">
        <div>
          <span className="text-muted-foreground">Status </span>
          <ShipmentStatusBadge status={assessment.shipmentStatus} />
        </div>
        {assessment.lastEventAt && (
          <div>
            <span className="text-muted-foreground">Last event </span>
            <span className="font-medium">{formatDateTime(assessment.lastEventAt)}</span>
          </div>
        )}
        <div>
          <span className="text-muted-foreground">Assessed </span>
          <span className="font-medium">{formatDateTime(assessment.assessedAt)}</span>
        </div>
      </div>

      {/* Risk factors */}
      {assessment.factors.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          {assessment.assessmentStatus === "INSUFFICIENT_DATA"
            ? "No tracking events found — cannot assess risk yet."
            : "No risk factors detected. Shipment is progressing normally."}
        </p>
      ) : (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Risk factors</h4>
          <ul className="space-y-2">
            {assessment.factors.map((f) => (
              <li
                key={f.code}
                className="rounded-lg border bg-card px-4 py-3 text-sm space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{riskFactorLabel(f.code)}</span>
                  <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                    +{f.score} pts
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {f.evidence}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
