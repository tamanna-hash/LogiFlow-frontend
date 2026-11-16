"use client";

import { Loader2, Route as RouteIcon, MapPin, ArrowRight, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/shared/ErrorState";
import { cn } from "@/lib/utils";
import type { OptimizedRoute } from "@/types";

interface RouteOptimizationPanelProps {
  fromHubId: string | null;
  toHubId: string | null;
  data?: OptimizedRoute;
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  onRetry?: () => void;
}

export function RouteOptimizationPanel({
  fromHubId,
  toHubId,
  data,
  isLoading,
  isError,
  error,
  onRetry,
}: RouteOptimizationPanelProps) {
  if (!fromHubId || !toHubId || fromHubId === toHubId) {
    return (
      <div className="text-sm text-muted-foreground italic py-4">
        Select two different hubs to optimize a route.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 py-6 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Computing optimal route…
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Could not compute route"
        error={error instanceof Error ? error : undefined}
        onRetry={onRetry}
      />
    );
  }

  if (!data) return null;

  // ── No route found ──────────────────────────────────────────────────────────
  if (!data.found) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <AlertTriangle className="size-8 text-amber-500" />
            <p className="text-sm font-medium">No route found</p>
            <p className="text-xs text-muted-foreground max-w-sm">
              No valid path exists from <span className="font-medium">{data.fromHubName}</span> to{" "}
              <span className="font-medium">{data.toHubName}</span> in the current hub network.
              Ensure active route connections exist between these hubs.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── Route found — render hub-to-hub timeline ────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Summary header */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <RouteIcon className="size-4" />
              Optimized Route
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              Total cost: <span className="font-bold tabular-nums">{data.totalCost}</span> {data.costUnit}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{data.fromHubName}</span>
            <ArrowRight className="size-3.5 text-muted-foreground" />
            <span className="font-medium">{data.toHubName}</span>
            {data.path.length > 2 && (
              <span className="text-xs text-muted-foreground">
                via {data.pathLabels.slice(1, -1).join(" → ")}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Hub-to-hub timeline */}
      <Card>
        <CardContent className="pt-6">
          <ol className="space-y-0">
            {data.pathLabels.map((hubName, i) => {
              const isLast = i === data.pathLabels.length - 1;
              const segment = i < data.segments.length ? data.segments[i] : null;
              return (
                <li key={i} className="flex gap-3">
                  {/* Node */}
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full border-2",
                        i === 0 && "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400",
                        isLast && "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                        i !== 0 && !isLast && "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400",
                      )}
                    >
                      <MapPin className="size-4" />
                    </div>
                    {/* Connector line */}
                    {!isLast && (
                      <div className="w-0.5 grow bg-border min-h-[2.5rem]" />
                    )}
                  </div>

                  {/* Content */}
                  <div className={cn("flex-1 pb-4", !isLast && "min-h-[3rem]")}>
                    <p className="text-sm font-medium leading-tight">{hubName}</p>
                    {i === 0 && (
                      <p className="text-xs text-blue-600 dark:text-blue-400">Origin hub</p>
                    )}
                    {isLast && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">Destination hub</p>
                    )}
                    {i > 0 && !isLast && (
                      <p className="text-xs text-muted-foreground">Transit hub</p>
                    )}
                    {/* Segment cost (shown on the connector) */}
                    {segment && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <ArrowRight className="size-3" />
                        Cost: <span className="font-semibold tabular-nums">{segment.cost}</span>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>

      {/* Segment details table */}
      {data.segments.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Segment Details</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">From</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">To</th>
                    <th className="text-right px-4 py-2 font-medium text-muted-foreground">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {data.segments.map((seg, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-2 font-medium">{seg.fromLabel}</td>
                      <td className="px-4 py-2 font-medium">{seg.toLabel}</td>
                      <td className="px-4 py-2 text-right font-semibold tabular-nums">{seg.cost}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 font-semibold">
                    <td className="px-4 py-2" colSpan={2}>Total</td>
                    <td className="px-4 py-2 text-right tabular-nums">{data.totalCost}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advisory notice */}
      <p className="text-xs text-muted-foreground italic">
        Algorithm: {data.algorithm}. Costs are relative transportation effort units — not currency, distance, or time.
        This is a recommendation, not a tracking record.
      </p>
    </div>
  );
}
