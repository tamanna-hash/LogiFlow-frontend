"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { TableSkeleton } from "@/components/shared/Skeleton";
import { ShipmentStatusBadge } from "@/components/shared/StatusBadge";
import { useShipments } from "@/features/shipments/hooks";
import { formatDate, formatCurrency } from "@/lib/utils";

export default function HubShipmentsPage() {
  const { data, isLoading, isError, refetch } = useShipments({ page: 1, limit: 20 });
  const shipments = data?.shipments ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Hub Shipments" description="All shipments currently at your hub." />
      <Card>
        <CardContent className="p-0">
          {isError ? (
            <div className="p-6">
              <ErrorState title="Could not load shipments" onRetry={() => refetch()} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tracking #</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Recipient</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Date</th>
                    <th className="sr-only">Actions</th>
                  </tr>
                </thead>
                {isLoading ? (
                  <TableSkeleton rows={5} cols={4} />
                ) : shipments.length === 0 ? (
                  <tbody>
                    <tr>
                      <td colSpan={5} className="px-4 py-12">
                        <EmptyState icon={<Package className="size-6" />} title="No shipments" description="No shipments are currently at your hub." />
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody>
                    {shipments.map((s) => (
                      <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono font-medium">{s.trackingNumber}</td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="font-medium">{s.recipientName}</p>
                          <p className="text-xs text-muted-foreground">{s.recipientCity}</p>
                        </td>
                        <td className="px-4 py-3"><ShipmentStatusBadge status={s.status} /></td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{formatDate(s.createdAt)}</td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/hub/shipments/${s.id}`}>View</Link>
                          </Button>
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
