"use client";

import { useState } from "react";
import {
  Sparkles, Loader2, AlertTriangle, Info, ArrowRight,
  ClipboardList, ShieldAlert, Lightbulb, ChevronDown, ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RiskLevelBadge } from "@/components/shared/RiskLevelBadge";
import { ShipmentStatusBadge } from "@/components/shared/StatusBadge";
import { ErrorState } from "@/components/shared/ErrorState";
import { formatDateTime, formatRelativeTime } from "@/lib/utils";
import { useInvestigateShipment } from "./hooks";
import type {
  InvestigationFinding, InvestigationSeverity,
  InvestigationActionPriority, RiskAssessment,
} from "@/types";

// ── Suggested questions ────────────────────────────────────────────────────────
// These reflect the actual capabilities of the investigation system —
// questions the AI can answer from the available shipment data.

const SUGGESTED_QUESTIONS = [
  "Why is this shipment considered high risk?",
  "What are the main warning signs?",
  "What caused the latest delay?",
  "What should operations investigate next?",
] as const;

// ── Severity helpers ───────────────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<InvestigationSeverity, { icon: React.ReactNode; variant: "default" | "warning" | "destructive" }> = {
  INFO:     { icon: <Info className="size-3.5" />,           variant: "default" },
  WARNING:  { icon: <AlertTriangle className="size-3.5" />, variant: "warning" },
  CRITICAL: { icon: <ShieldAlert className="size-3.5" />,   variant: "destructive" },
};

const PRIORITY_CONFIG: Record<InvestigationActionPriority, string> = {
  HIGH:   "bg-red-500/10 text-red-600 dark:text-red-400",
  MEDIUM: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  LOW:    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

// ── Finding sub-component ─────────────────────────────────────────────────────

function FindingCard({ finding }: { finding: InvestigationFinding }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = SEVERITY_CONFIG[finding.severity];

  return (
    <div className="rounded-lg border bg-card px-4 py-3 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <Badge variant={cfg.variant} className="mt-0.5 shrink-0 gap-1">
            {cfg.icon}
            {finding.severity}
          </Badge>
          <div>
            <p className="font-medium text-sm">{finding.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              {finding.detail}
            </p>
          </div>
        </div>
        {finding.evidence.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 shrink-0 px-2"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            <span className="sr-only">{expanded ? "Hide" : "Show"} evidence</span>
          </Button>
        )}
      </div>
      {expanded && finding.evidence.length > 0 && (
        <ul className="space-y-1 pt-1 border-t">
          {finding.evidence.map((ev, i) => (
            <li key={i} className="text-xs text-muted-foreground leading-relaxed pl-3 border-l-2 border-muted">
              <span className="font-medium">{ev.fact}</span>
              <span className="text-muted-foreground/60"> — {ev.source}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

interface InvestigationPanelProps {
  shipmentId: string;
  trackingNumber: string;
  shipmentStatus: string;
  riskAssessment: RiskAssessment | null;
}

export function InvestigationPanel({
  shipmentId,
  trackingNumber,
  shipmentStatus,
  riskAssessment: _riskAssessment,
}: InvestigationPanelProps) {
  const [question, setQuestion] = useState("");
  const [expandedSection, setExpandedSection] = useState<string | null>("findings");
  const { mutate: investigate, data: report, isPending, isError, error, reset } = useInvestigateShipment();

  function handleInvestigate(q?: string) {
    const finalQuestion = q ?? question;
    if (!finalQuestion.trim()) return;
    setQuestion(finalQuestion);
    investigate({ shipmentId, question: finalQuestion });
  }

  function toggleSection(name: string) {
    setExpandedSection(expandedSection === name ? null : name);
  }

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="size-4 text-primary" />
        <span>AI Investigation</span>
        <span className="text-muted-foreground/40">·</span>
        <span className="font-mono text-xs">{trackingNumber}</span>
      </div>

      {/* ── Advisory notice ── */}
      <p className="text-xs text-muted-foreground italic bg-muted/30 rounded-lg px-3 py-2 border">
        AI findings are advisory and based on current shipment data. The official risk score is determined by the deterministic engine, not the AI.
      </p>

      {/* ── Suggested questions ── */}
      {!report && (
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((q) => (
            <Button
              key={q}
              variant="outline"
              size="sm"
              className="text-xs h-7"
              disabled={isPending}
              onClick={() => handleInvestigate(q)}
            >
              {q}
            </Button>
          ))}
        </div>
      )}

      {/* ── Custom question input ── */}
      {!report && (
        <form
          onSubmit={(e) => { e.preventDefault(); handleInvestigate(); }}
          className="flex gap-2"
        >
          <Input
            placeholder="Ask a shipment-specific question…"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={500}
            disabled={isPending}
          />
          <Button type="submit" size="sm" disabled={isPending || !question.trim()}>
            {isPending ? <Loader2 className="mr-2 size-3.5 animate-spin" /> : <Sparkles className="mr-2 size-3.5" />}
            {isPending ? "Investigating…" : "Investigate"}
          </Button>
        </form>
      )}

      {/* ── Loading state ── */}
      {isPending && (
        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col items-center gap-3 text-center">
              <Loader2 className="size-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Analyzing shipment data and risk factors…
              </p>
              <p className="text-xs text-muted-foreground/60">
                This usually takes 5–10 seconds.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Error state ── */}
      {isError && !isPending && (
        <ErrorState
          title="Investigation failed"
          error={error instanceof Error ? error : undefined}
          onRetry={() => { reset(); handleInvestigate(); }}
        />
      )}

      {/* ── Report ── */}
      {report && !isPending && !isError && (
        <div className="space-y-4">
          {/* Summary */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <ClipboardList className="size-4" />
                  Investigation Summary
                </CardTitle>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(report.investigatedAt)}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm font-medium leading-relaxed">{report.answer}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{report.overallAssessment}</p>

              {/* Official risk assessment */}
              <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2 text-sm">
                <span className="text-xs text-muted-foreground">Official risk:</span>
                <span className="font-bold tabular-nums">{report.officialRiskScore}</span>
                <RiskLevelBadge level={report.officialRiskLevel} />
                <ShipmentStatusBadge status={shipmentStatus as never} />
              </div>
            </CardContent>
          </Card>

          {/* Key findings */}
          {report.findings.length > 0 && (
            <div>
              <button
                className="flex w-full items-center justify-between text-sm font-semibold mb-2"
                onClick={() => toggleSection("findings")}
              >
                <span className="flex items-center gap-2">
                  <AlertTriangle className="size-4" />
                  Key Findings ({report.findings.length})
                </span>
                {expandedSection === "findings" ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </button>
              {expandedSection === "findings" && (
                <div className="space-y-2">
                  {report.findings.map((f, i) => (
                    <FindingCard key={i} finding={f} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Relevant tracking events */}
          {report.relevantTrackingEvents.length > 0 && (
            <div>
              <button
                className="flex w-full items-center justify-between text-sm font-semibold mb-2"
                onClick={() => toggleSection("events")}
              >
                <span className="flex items-center gap-2">
                  <Info className="size-4" />
                  Relevant Tracking Events ({report.relevantTrackingEvents.length})
                </span>
                {expandedSection === "events" ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </button>
              {expandedSection === "events" && (
                <div className="space-y-1.5">
                  {report.relevantTrackingEvents.map((ev, i) => (
                    <div key={i} className="rounded-lg border bg-card px-3 py-2 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{ev.status.replace(/_/g, " ")}</span>
                        <span className="text-xs text-muted-foreground">{formatDateTime(ev.timestamp)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{ev.description}</p>
                      <p className="text-xs text-muted-foreground/70 mt-0.5 italic">{ev.significance}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recommended actions */}
          {report.recommendedActions.length > 0 && (
            <div>
              <button
                className="flex w-full items-center justify-between text-sm font-semibold mb-2"
                onClick={() => toggleSection("actions")}
              >
                <span className="flex items-center gap-2">
                  <Lightbulb className="size-4" />
                  Recommended Actions ({report.recommendedActions.length})
                </span>
                {expandedSection === "actions" ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </button>
              {expandedSection === "actions" && (
                <div className="space-y-2">
                  {report.recommendedActions.map((a, i) => (
                    <div key={i} className="rounded-lg border bg-card px-3 py-2 text-sm flex items-start gap-3">
                      <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-semibold ${PRIORITY_CONFIG[a.priority]}`}>
                        {a.priority}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{a.action}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{a.rationale}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Data limitations */}
          {report.dataLimitations && (
            <div className="rounded-lg border border-dashed bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
              <span className="font-medium">Data limitations:</span> {report.dataLimitations}
            </div>
          )}

          {/* Reset / New question */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => { reset(); setQuestion(""); }}
          >
            <ArrowRight className="mr-2 size-3.5" />
            Ask another question
          </Button>
        </div>
      )}
    </div>
  );
}
