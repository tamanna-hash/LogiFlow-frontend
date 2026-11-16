"use client";

import { useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  ShieldAlert, AlertTriangle, CheckCircle2, HelpCircle, Activity, Search,
  ChevronDown, ChevronUp, RefreshCw, Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { StatCard } from "@/components/shared/StatCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Pagination } from "@/components/shared/Pagination";
import { RiskLevelBadge } from "@/components/shared/RiskLevelBadge";
import { ShipmentStatusBadge } from "@/components/shared/StatusBadge";
import { TableSkeleton } from "@/components/shared/Skeleton";
import { formatRelativeTime } from "@/lib/utils";
import { SHIPMENT_STATUS_LABELS } from "@/lib/utils";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { SlideUp, StaggerContainer, StaggerItem } from "@/components/animations";
import { useRiskOverview, useRiskAssessments, useAssessShipment } from "./hooks";
import { RiskDetailsPanel } from "./RiskDetailsPanel";
import { InvestigationPanel } from "./investigation/InvestigationPanel";
import type { RiskLevel, ShipmentStatus } from "@/types";

// ── Color constants (matching the existing dashboard palette) ─────────────────
const RISK_CHART_COLORS: Record<RiskLevel, string> = {
  HIGH:   "#ef4444",
  MEDIUM: "#f59e0b",
  LOW:    "#10b981",
};

// Non-terminal statuses relevant for risk filtering
const ACTIVE_STATUSES: ShipmentStatus[] = [
  "CREATED", "PICKUP_REQUESTED", "ASSIGNED", "PICKED_UP",
  "AT_ORIGIN_HUB", "IN_TRANSIT", "AT_DESTINATION_HUB",
  "OUT_FOR_DELIVERY", "DELIVERY_FAILED", "RETURN_INITIATED", "RETURNING",
];

// ── Component ─────────────────────────────────────────────────────────────────

interface RiskDashboardProps {
  /** Whether the viewer is ADMIN or OPERATIONS_MANAGER (can trigger re-assessment). */
  canRefresh?: boolean;
}

export function RiskDashboard({ canRefresh = false }: RiskDashboardProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [investigateId, setInvestigateId] = useState<string | null>(null);

  // URL-driven filter state (consistent with the admin/operations shipments pages)
  const page       = Number(searchParams.get("page") ?? 1);
  const riskLevel  = searchParams.get("riskLevel") as RiskLevel | undefined ?? undefined;
  const status     = searchParams.get("status") as ShipmentStatus | undefined ?? undefined;
  const search     = searchParams.get("search") ?? undefined;

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") { params.set(key, value); } else { params.delete(key); }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  // ── Data ──────────────────────────────────────────────────────────────────
  const {
    data: overview,
    isLoading: overviewLoading,
    isError: overviewError,
    refetch: refetchOverview,
  } = useRiskOverview();

  const {
    data: listData,
    isLoading: listLoading,
    isError: listError,
    refetch: refetchList,
  } = useRiskAssessments({ page, limit: 20, riskLevel, shipmentStatus: status, search });

  const { mutate: assess, isPending: assessing } = useAssessShipment();

  const assessments = listData?.assessments ?? [];
  const meta        = listData?.meta;

  // ── Chart data ────────────────────────────────────────────────────────────
  const donutData = overview
    ? (["HIGH", "MEDIUM", "LOW"] as RiskLevel[])
        .map((l) => ({ name: l, value: overview[l.toLowerCase() as "high" | "medium" | "low"] }))
        .filter((d) => d.value > 0)
    : [];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <PageHeader
        title="Shipment Risk Dashboard"
        description="Identify and investigate at-risk shipments across your operation."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => { void refetchOverview(); void refetchList(); }}
        >
          <RefreshCw className="mr-2 size-3.5" />
          Refresh
        </Button>
      </PageHeader>

      {/* ── Overview cards ── */}
      {overviewError ? (
        <ErrorState title="Could not load risk overview" onRetry={() => void refetchOverview()} />
      ) : (
        <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <StaggerItem>
            <StatCard
              title="Total Assessed"
              value={overviewLoading ? "…" : (overview?.assessed ?? 0).toLocaleString()}
              icon={<Activity className="size-5" />}
              iconBg="bg-blue-500"
              subtitle={`of ${(overview?.total ?? 0).toLocaleString()} shipments`}
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title="High Risk"
              value={overviewLoading ? "…" : (overview?.high ?? 0).toLocaleString()}
              icon={<ShieldAlert className="size-5" />}
              iconBg="bg-red-500"
              trend={{ value: "Urgent attention", up: false }}
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title="Medium Risk"
              value={overviewLoading ? "…" : (overview?.medium ?? 0).toLocaleString()}
              icon={<AlertTriangle className="size-5" />}
              iconBg="bg-amber-500"
              trend={{ value: "Monitor closely", up: false }}
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title="Low Risk"
              value={overviewLoading ? "…" : (overview?.low ?? 0).toLocaleString()}
              icon={<CheckCircle2 className="size-5" />}
              iconBg="bg-emerald-500"
              trend={{ value: "Normal operation", up: true }}
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title="Unassessed"
              value={overviewLoading ? "…" : (overview?.unassessed ?? 0).toLocaleString()}
              icon={<HelpCircle className="size-5" />}
              iconBg="bg-slate-500"
              subtitle="No assessment run yet"
            />
          </StaggerItem>
        </StaggerContainer>
      )}

      {/* ── Chart + Filters ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Risk distribution donut */}
        <SlideUp delay={0.1}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Risk Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {donutData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%" cy="50%"
                      innerRadius={55} outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {donutData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={RISK_CHART_COLORS[entry.name as RiskLevel]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => v.toLocaleString()} />
                    <Legend
                      iconSize={10}
                      iconType="circle"
                      formatter={(v) => <span className="text-xs">{v}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : overviewLoading ? (
                <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
                  Loading…
                </div>
              ) : (
                <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
                  No assessed shipments yet.
                </div>
              )}
            </CardContent>
          </Card>
        </SlideUp>

        {/* Filters */}
        <SlideUp delay={0.15} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Filter Shipments</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {/* Search */}
              <form
                onSubmit={(e) => { e.preventDefault(); updateParam("search", searchInput || null); }}
                className="flex gap-2 sm:col-span-2"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tracking number…"
                    className="pl-9"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>
                <Button type="submit" variant="outline" size="sm">Search</Button>
              </form>

              {/* Risk level filter */}
              <Select value={riskLevel ?? "all"} onValueChange={(v) => updateParam("riskLevel", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All risk levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All risk levels</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>

              {/* Shipment status filter */}
              <Select value={status ?? "all"} onValueChange={(v) => updateParam("status", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {ACTIVE_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{SHIPMENT_STATUS_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </SlideUp>
      </div>

      {/* ── Assessment table ── */}
      <SlideUp delay={0.2}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Shipment Risk Assessments</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {listError ? (
              <div className="p-6">
                <ErrorState title="Could not load assessments" onRetry={() => void refetchList()} />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tracking #</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Shipment Status</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Risk</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Score</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Primary Factor</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden xl:table-cell">Assessed</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>

                  {listLoading ? (
                    <TableSkeleton rows={6} cols={6} />
                  ) : assessments.length === 0 ? (
                    <tbody>
                      <tr>
                        <td colSpan={7} className="px-4 py-12">
                          <EmptyState
                            icon={<ShieldAlert className="size-6" />}
                            title="No assessments found"
                            description="Run an assessment on a shipment to see it here, or adjust the filters."
                          />
                        </td>
                      </tr>
                    </tbody>
                  ) : (
                    <tbody>
                      {assessments.map((a) => {
                        const isExpanded = expandedId === a.id;
                        const primaryFactor = (a.factors as { code: string; evidence: string }[])[0];

                        return (
                          <>
                            <tr
                              key={a.id}
                              className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                            >
                              <td className="px-4 py-3 font-mono text-xs font-semibold">
                                {a.shipment.trackingNumber}
                              </td>
                              <td className="px-4 py-3 hidden sm:table-cell">
                                <ShipmentStatusBadge status={a.shipmentStatus} />
                              </td>
                              <td className="px-4 py-3">
                                <RiskLevelBadge level={a.riskLevel} />
                              </td>
                              <td className="px-4 py-3 hidden md:table-cell font-semibold tabular-nums">
                                {a.riskScore}
                              </td>
                              <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs max-w-[180px] truncate">
                                {primaryFactor ? primaryFactor.evidence : "—"}
                              </td>
                              <td className="px-4 py-3 hidden xl:table-cell text-muted-foreground text-xs">
                                {formatRelativeTime(a.assessedAt)}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {canRefresh && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 px-2"
                                      disabled={assessing}
                                      onClick={() => assess(a.shipmentId)}
                                      title="Re-assess"
                                    >
                                      <RefreshCw className="size-3.5" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-primary hover:text-primary"
                                    onClick={() => {
                                      setInvestigateId(investigateId === a.shipmentId ? null : a.shipmentId);
                                      if (investigateId !== a.shipmentId && !isExpanded) {
                                        setExpandedId(a.id);
                                      }
                                    }}
                                    title="AI Investigate"
                                  >
                                    <Sparkles className="size-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2"
                                    onClick={() => setExpandedId(isExpanded ? null : a.id)}
                                    aria-expanded={isExpanded}
                                  >
                                    {isExpanded
                                      ? <ChevronUp className="size-3.5" />
                                      : <ChevronDown className="size-3.5" />}
                                    <span className="sr-only">{isExpanded ? "Collapse" : "Expand"} details</span>
                                  </Button>
                                </div>
                              </td>
                            </tr>

                            {isExpanded && (
                              <tr key={`${a.id}-detail`} className="border-b bg-muted/20">
                                <td colSpan={7} className="px-6 py-4 space-y-6">
                                  <RiskDetailsPanel
                                    assessment={a}
                                    canRefresh={canRefresh}
                                  />
                                  {investigateId === a.shipmentId && canRefresh && (
                                    <div className="pt-4 border-t">
                                      <InvestigationPanel
                                        shipmentId={a.shipmentId}
                                        trackingNumber={a.shipment.trackingNumber}
                                        shipmentStatus={a.shipmentStatus}
                                        riskAssessment={null}
                                      />
                                    </div>
                                  )}
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })}
                    </tbody>
                  )}
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </SlideUp>

      {meta && (
        <Pagination
          meta={meta}
          onPageChange={(p) => updateParam("page", String(p))}
        />
      )}
    </div>
  );
}
