"use client";

import Link from "next/link";
import { Truck, Package, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/shared/MetricCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { AssignmentStatusBadge } from "@/components/shared/StatusBadge";
import { useAuthStore } from "@/lib/auth";
import { useAssignments, useUpdateAvailability } from "@/features/couriers/hooks";
import { useCurrentUser } from "@/features/auth/hooks";
import { formatDateTime } from "@/lib/utils";
import { CourierAvailabilityBadge } from "@/components/shared/StatusBadge";

export function CourierOverview() {
  const { user } = useAuthStore();
  const { data: assignments, isLoading } = useAssignments({ limit: 5, status: "ACTIVE" });
  const { mutate: updateAvailability, isPending } = useUpdateAvailability();

  const activeAssignments = assignments?.assignments ?? [];
  const availability = user?.courierProfile?.availability;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user?.firstName ?? ""}!`}
        description="Your delivery assignments and performance."
      >
        <div className="flex items-center gap-2">
          {availability && <CourierAvailabilityBadge availability={availability} />}
          {availability !== "ON_DELIVERY" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                updateAvailability(
                  availability === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE"
                )
              }
              loading={isPending}
            >
              {availability === "AVAILABLE" ? "Go offline" : "Go online"}
            </Button>
          )}
        </div>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          title="Active assignments"
          value={assignments?.meta?.total ?? 0}
          icon={<Truck className="size-5" />}
          subtitle="Currently active"
        />
        <MetricCard
          title="Total deliveries"
          value={user?.courierProfile?.totalDeliveries ?? 0}
          icon={<CheckCircle className="size-5" />}
        />
        <MetricCard
          title="Status"
          value={availability === "AVAILABLE" ? "Online" : availability === "ON_DELIVERY" ? "On Delivery" : "Offline"}
          icon={<Clock className="size-5" />}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-base">Active assignments</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/courier/assignments">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-md bg-muted" />
              ))}
            </div>
          ) : activeAssignments.length === 0 ? (
            <EmptyState
              icon={<Package className="size-6" />}
              title="No active assignments"
              description="You have no active assignments right now."
            />
          ) : (
            <div className="space-y-3">
              {activeAssignments.map((a) => (
                <Link
                  key={a.id}
                  href={`/dashboard/courier/assignments/${a.id}`}
                  className="flex items-start justify-between rounded-lg border p-3 text-sm hover:bg-accent transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{a.type} — {a.shipment.trackingNumber}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {a.shipment.recipientName}, {a.shipment.recipientCity}
                    </p>
                    <p className="text-xs text-muted-foreground">{a.shipment.recipientPhone}</p>
                  </div>
                  <div className="ml-4 shrink-0">
                    <AssignmentStatusBadge status={a.status} />
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
