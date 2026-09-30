"use client";

import Link from "next/link";
import { Package, Clock, CheckCircle, XCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/shared/MetricCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { StatCardSkeleton } from "@/components/shared/Skeleton";
import { ShipmentStatusBadge, PaymentStatusBadge } from "@/components/shared/StatusBadge";
import { useAuthStore } from "@/lib/auth";
import { useShipments } from "@/features/shipments/hooks";
import { formatDate, formatCurrency } from "@/lib/utils";

export function CustomerOverview() {
  const { user } = useAuthStore();
  const { data, isLoading, isError, refetch } = useShipments({ page: 1, limit: 5, sortOrder: "desc" });

  const shipments = data?.shipments ?? [];
  const total = data?.meta.total ?? 0;

  const activeCount = shipments.filter(
    (s) => !["DELIVERED", "CANCELLED", "RETURNED"].includes(s.status)
  ).length;
  const deliveredCount = shipments.filter((s) => s.status === "DELIVERED").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.firstName ?? ""}!`}
        description="Here's an overview of your recent shipments."
      >
        <Button asChild>
          <Link href="/dashboard/customer/shipments/new">
            <Plus className="mr-2 size-4" aria-hidden="true" />
            New shipment
          </Link>
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <MetricCard
              title="Total shipments"
              value={total}
              icon={<Package className="size-5" />}
            />
            <MetricCard
              title="Active"
              value={activeCount}
              icon={<Clock className="size-5" />}
              subtitle="Currently in transit"
            />
            <MetricCard
              title="Delivered"
              value={deliveredCount}
              icon={<CheckCircle className="size-5" />}
              subtitle="In this view"
            />
            <MetricCard
              title="Cancelled"
              value={shipments.filter((s) => s.status === "CANCELLED").length}
              icon={<XCircle className="size-5" />}
            />
          </>
        )}
      </div>

      {/* Recent shipments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-base">Recent shipments</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/customer/shipments">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isError ? (
            <ErrorState
              title="Could not load shipments"
              onRetry={() => refetch()}
            />
          ) : isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-md bg-muted" />
              ))}
            </div>
          ) : shipments.length === 0 ? (
            <EmptyState
              icon={<Package className="size-6" />}
              title="No shipments yet"
              description="Create your first shipment to get started."
              action={{
                label: "Create shipment",
                href: "/dashboard/customer/shipments/new",
              }}
            />
          ) : (
            <div className="space-y-3">
              {shipments.map((s) => (
                <Link
                  key={s.id}
                  href={`/dashboard/customer/shipments/${s.id}`}
                  className="flex items-center justify-between rounded-lg border p-3 text-sm hover:bg-accent transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{s.trackingNumber}</p>
                    <p className="text-muted-foreground text-xs truncate">
                      To: {s.recipientName}, {s.recipientCity}
                    </p>
                  </div>
                  <div className="ml-4 flex shrink-0 items-center gap-2">
                    <ShipmentStatusBadge status={s.status} />
                    <PaymentStatusBadge status={s.paymentStatus} />
                    <span className="hidden sm:block text-xs text-muted-foreground">
                      {formatDate(s.createdAt)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
