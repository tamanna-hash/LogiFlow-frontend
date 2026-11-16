"use client";
export const dynamic = "force-dynamic";

// Admin sees the same optimizer as operations, plus a quick link to the route network manager.
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Route as RouteIcon } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useHubs } from "@/features/hubs/hooks";
import { useOptimizeRoute } from "@/features/route-optimization/hooks";
import { RouteOptimizationPanel } from "@/features/route-optimization/RouteOptimizationPanel";

export default function AdminRouteOptimizationPage() {
  const { data: hubsData } = useHubs({ limit: 100 });
  const hubs = hubsData?.hubs ?? [];

  const [fromHubId, setFromHubId] = useState<string | null>(null);
  const [toHubId, setToHubId] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useOptimizeRoute(fromHubId, toHubId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Route Optimization"
        description="Find the lowest-cost route between hubs using Dijkstra's algorithm."
      >
        <Button size="sm" variant="outline" asChild>
          <Link href="/dashboard/admin/routes">
            <Settings className="mr-2 size-4" />
            Manage Routes
          </Link>
        </Button>
      </PageHeader>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <RouteIcon className="size-4" />
            Select Hubs
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Source Hub</label>
            <Select value={fromHubId ?? "none"} onValueChange={setFromHubId}>
              <SelectTrigger><SelectValue placeholder="Select source hub" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none" disabled>Select source hub</SelectItem>
                {hubs.map((h) => (
                  <SelectItem key={h.id} value={h.id}>{h.name} ({h.code})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Destination Hub</label>
            <Select value={toHubId ?? "none"} onValueChange={setToHubId}>
              <SelectTrigger><SelectValue placeholder="Select destination hub" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none" disabled>Select destination hub</SelectItem>
                {hubs.map((h) => (
                  <SelectItem key={h.id} value={h.id} disabled={h.id === (fromHubId ?? "")}>
                    {h.name} ({h.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {(fromHubId && toHubId && fromHubId !== toHubId) && (
        <RouteOptimizationPanel
          fromHubId={fromHubId}
          toHubId={toHubId}
          data={data}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={() => void refetch()}
        />
      )}

      {!fromHubId && !toHubId && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-3 text-center">
              <RouteIcon className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Select a source and destination hub to compute the optimal route.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
