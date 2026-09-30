"use client";

import Link from "next/link";
import { CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { TableSkeleton } from "@/components/shared/Skeleton";
import { PaymentStatusBadge } from "@/components/shared/StatusBadge";
import { useShipments } from "@/features/shipments/hooks";
import { formatDate, formatCurrency } from "@/lib/utils";

/**
 * Customer payment history is derived from their shipments, as the backend
 * doesn't expose a direct customer payment list endpoint.
 * The GET /payments endpoint is ADMIN-only.
 * To get payment status for a specific shipment: GET /payments/shipment/:shipmentId
 */
export function PaymentHistory() {
  const { data, isLoading, isError, refetch } = useShipments({
    page: 1,
    limit: 50,
    sortOrder: "desc",
  });

  const shipments = data?.shipments ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment history"
        description="Review payments for your shipments."
      />

      <Card>
        <CardContent className="p-0">
          {isError ? (
            <div className="p-6">
              <ErrorState title="Could not load payment history" onRetry={() => refetch()} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tracking #</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Date</th>
                    <th className="sr-only">Actions</th>
                  </tr>
                </thead>
                {isLoading ? (
                  <TableSkeleton rows={5} cols={4} />
                ) : shipments.length === 0 ? (
                  <tbody>
                    <tr>
                      <td colSpan={5} className="px-4 py-12">
                        <EmptyState
                          icon={<CreditCard className="size-6" />}
                          title="No payment history"
                          description="Create a shipment to see your payment history here."
                          action={{ label: "Create shipment", href: "/dashboard/customer/shipments/new" }}
                        />
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody>
                    {shipments.map((s) => (
                      <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <Link
                            href={`/dashboard/customer/shipments/${s.id}`}
                            className="font-mono font-medium text-primary hover:underline"
                          >
                            {s.trackingNumber}
                          </Link>
                          <p className="text-xs text-muted-foreground">{s.recipientName}</p>
                        </td>
                        <td className="px-4 py-3">
                          <PaymentStatusBadge status={s.paymentStatus} />
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatCurrency(s.price)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs hidden sm:table-cell">
                          {formatDate(s.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {s.paymentStatus === "PENDING" && s.status === "CREATED" && (
                            <Link
                              href={`/dashboard/customer/shipments/${s.id}`}
                              className="text-xs text-primary font-medium hover:underline"
                            >
                              Pay now
                            </Link>
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
