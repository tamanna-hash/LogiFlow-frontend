"use client";

import { BarChart3, Package, Truck, CheckCircle } from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useShipments } from "@/features/shipments/hooks";
import { useCouriers } from "@/features/couriers/hooks";
import { useOperationalLogs } from "@/features/admin/hooks";
import { formatDateTime } from "@/lib/utils";

export default function OperationsReportsPage() {
  const { data: shipmentsData } = useShipments({ page: 1, limit: 1 });
  const { data: deliveredData } = useShipments({ status: "DELIVERED", limit: 1 });
  const { data: couriersData } = useCouriers({ limit: 1 });
  const { data: logsData } = useOperationalLogs({ limit: 10 });

  return (
    <div className="space-y-6">
      <PageHeader title="Operational Reports" description="Overview of operational performance." />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard title="Total shipments" value={shipmentsData?.meta?.total ?? 0} icon={<Package className="size-5" />} />
        <MetricCard title="Delivered" value={deliveredData?.meta?.total ?? 0} icon={<CheckCircle className="size-5" />} />
        <MetricCard title="Active couriers" value={couriersData?.meta?.total ?? 0} icon={<Truck className="size-5" />} />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="size-4" />
            Recent operational activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(logsData?.logs ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No recent activity.</p>
          ) : (
            <div className="space-y-2">
              {(logsData?.logs ?? []).map((log) => (
                <div key={log.id} className="flex items-start justify-between rounded-lg border p-3 text-xs">
                  <div>
                    <p className="font-medium">{log.action.replace(/_/g, " ")}</p>
                    <p className="text-muted-foreground">{log.resourceType}: {log.resourceId.slice(0, 8)}…</p>
                  </div>
                  <span className="text-muted-foreground shrink-0 ml-4">{formatDateTime(log.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
