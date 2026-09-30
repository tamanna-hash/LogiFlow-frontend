"use client";

import Link from "next/link";
import { Warehouse, Package, Truck, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/shared/MetricCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { ErrorState } from "@/components/shared/ErrorState";
import { useAuthStore } from "@/lib/auth";
import { useHub } from "@/features/hubs/hooks";
import { useShipments } from "@/features/shipments/hooks";
import { useCouriers } from "@/features/couriers/hooks";
import { ShipmentStatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/utils";

export default function HubOverviewPage() {
  const { user } = useAuthStore();
  const hubId = user?.hubManagerProfile?.hubId;

  const { data: hub, isLoading: isLoadingHub, isError: isHubError } = useHub(hubId ?? "");
  const { data: shipmentsData } = useShipments({ page: 1, limit: 5 });
  const { data: couriersData } = useCouriers({ limit: 5 });

  if (isHubError) {
    return <ErrorState title="Could not load hub data" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={hub?.name ?? "Hub Overview"}
        description={hub?.city ? `${hub.city} — ${hub.code}` : "Hub management dashboard"}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          title="Shipments at hub"
          value={hub?._count?.shipmentsCurrently ?? 0}
          icon={<Package className="size-5" />}
        />
        <MetricCard
          title="Couriers"
          value={couriersData?.meta?.total ?? 0}
          icon={<Truck className="size-5" />}
        />
        <MetricCard
          title="Zones"
          value={hub?.zones?.length ?? 0}
          icon={<Warehouse className="size-5" />}
        />
      </div>

      {hub && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Hub details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Name</dt>
                <dd className="font-medium">{hub.name}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Code</dt>
                <dd className="font-medium font-mono">{hub.code}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">City</dt>
                <dd className="font-medium">{hub.city}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Status</dt>
                <dd className={hub.isActive ? "text-emerald-600 font-medium" : "text-destructive font-medium"}>
                  {hub.isActive ? "Active" : "Inactive"}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted-foreground">Address</dt>
                <dd className="font-medium">{hub.address}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-base">Shipments at this hub</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/hub/shipments">
              View all
              <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {(shipmentsData?.shipments ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No shipments currently at this hub.</p>
          ) : (
            <div className="space-y-2">
              {(shipmentsData?.shipments ?? []).map((s) => (
                <Link
                  key={s.id}
                  href={`/dashboard/hub/shipments/${s.id}`}
                  className="flex items-center justify-between rounded-lg border p-3 text-sm hover:bg-accent transition-colors"
                >
                  <div>
                    <p className="font-mono font-medium">{s.trackingNumber}</p>
                    <p className="text-xs text-muted-foreground">{s.recipientName} → {s.recipientCity}</p>
                  </div>
                  <ShipmentStatusBadge status={s.status} />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
