"use client";

import { DollarSign, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MetricCard } from "@/components/shared/MetricCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { TableSkeleton } from "@/components/shared/Skeleton";
import { useEarnings } from "@/features/couriers/hooks";
import { formatDate, formatCurrency } from "@/lib/utils";

export default function EarningsPage() {
  const { data, isLoading, isError, refetch } = useEarnings({ limit: 20 });
  const deliveries = data?.deliveries ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Earnings & Deliveries" description="Track your delivery history and total deliveries." />

      <div className="grid gap-4 sm:grid-cols-2">
        <MetricCard
          title="Total deliveries"
          value={data?.totalDeliveries ?? 0}
          icon={<Package className="size-5" />}
          subtitle="All time"
        />
        <MetricCard
          title="Recent deliveries"
          value={data?.meta?.total ?? 0}
          icon={<DollarSign className="size-5" />}
          subtitle="In this view"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {isError ? (
            <div className="p-6">
              <ErrorState title="Could not load earnings" onRetry={() => refetch()} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tracking #</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">City</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Delivered</th>
                  </tr>
                </thead>
                {isLoading ? (
                  <TableSkeleton rows={5} cols={4} />
                ) : deliveries.length === 0 ? (
                  <tbody>
                    <tr>
                      <td colSpan={4} className="px-4 py-12">
                        <EmptyState
                          icon={<Package className="size-6" />}
                          title="No deliveries yet"
                          description="Completed deliveries will appear here."
                        />
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody>
                    {deliveries.map((d) => (
                      <tr key={d.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono font-medium">
                          {d.shipment.trackingNumber}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                          {d.shipment.recipientCity}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatCurrency(d.shipment.price)}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                          {d.deliveredAt ? formatDate(d.deliveredAt) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
