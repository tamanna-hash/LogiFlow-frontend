"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { Package, Truck, BarChart3, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/shared/MetricCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { ShipmentStatusBadge } from "@/components/shared/StatusBadge";
import { useShipments } from "@/features/shipments/hooks";
import { useCouriers } from "@/features/couriers/hooks";
import { formatDate } from "@/lib/utils";

export default function OperationsOverviewPage() {
  const { data: shipmentsData } = useShipments({ page: 1, limit: 5, sortOrder: "desc" });
  const { data: couriersData } = useCouriers({ limit: 1 });

  const shipments = shipmentsData?.shipments ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Operations Overview" description="Monitor shipments and manage logistics." />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          title="Total shipments"
          value={shipmentsData?.meta?.total ?? 0}
          icon={<Package className="size-5" />}
        />
        <MetricCard
          title="Total couriers"
          value={couriersData?.meta?.total ?? 0}
          icon={<Truck className="size-5" />}
        />
        <MetricCard
          title="Active"
          value={shipments.filter(s => !["DELIVERED","CANCELLED","RETURNED"].includes(s.status)).length}
          icon={<BarChart3 className="size-5" />}
          subtitle="In transit"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-base">Recent shipments</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/operations/shipments">
              View all <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {shipments.map((s) => (
              <Link
                key={s.id}
                href={`/dashboard/operations/shipments/${s.id}`}
                className="flex items-center justify-between rounded-lg border p-3 text-sm hover:bg-accent transition-colors"
              >
                <div>
                  <p className="font-mono font-medium">{s.trackingNumber}</p>
                  <p className="text-xs text-muted-foreground">{s.senderName} → {s.recipientName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <ShipmentStatusBadge status={s.status} />
                  <span className="hidden sm:block text-xs text-muted-foreground">{formatDate(s.createdAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
