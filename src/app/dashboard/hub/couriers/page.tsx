"use client";

import { Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { TableSkeleton } from "@/components/shared/Skeleton";
import { CourierAvailabilityBadge } from "@/components/shared/StatusBadge";
import { useCouriers, useUpdateOperationsCourierAvailability } from "@/features/couriers/hooks";
import { Button } from "@/components/ui/button";

export default function HubCouriersPage() {
  const { data, isLoading, isError, refetch } = useCouriers({ limit: 20 });
  const { mutate: updateAvailability, isPending } = useUpdateOperationsCourierAvailability();
  const couriers = data?.couriers ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Hub Couriers" description="Manage couriers assigned to your hub." />
      <Card>
        <CardContent className="p-0">
          {isError ? (
            <div className="p-6">
              <ErrorState title="Could not load couriers" onRetry={() => refetch()} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Contact</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Availability</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Deliveries</th>
                    <th className="sr-only">Actions</th>
                  </tr>
                </thead>
                {isLoading ? (
                  <TableSkeleton rows={5} cols={4} />
                ) : couriers.length === 0 ? (
                  <tbody>
                    <tr>
                      <td colSpan={5} className="px-4 py-12">
                        <EmptyState icon={<Truck className="size-6" />} title="No couriers" description="No couriers are assigned to your hub." />
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody>
                    {couriers.map((c) => (
                      <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium">{c.user.firstName} {c.user.lastName}</p>
                          {c.vehicleType && <p className="text-xs text-muted-foreground">{c.vehicleType}</p>}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                          {c.user.email}
                        </td>
                        <td className="px-4 py-3">
                          <CourierAvailabilityBadge availability={c.availability} />
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground hidden sm:table-cell">
                          {c.totalDeliveries}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {c.availability !== "ON_DELIVERY" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateAvailability({
                                courierProfileId: c.id,
                                availability: c.availability === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE",
                              })}
                              disabled={isPending}
                            >
                              {c.availability === "AVAILABLE" ? "Set unavailable" : "Set available"}
                            </Button>
                          )}
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
