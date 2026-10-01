"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShipmentStatusBadge, PaymentStatusBadge } from "@/components/shared/StatusBadge";
import { ErrorState } from "@/components/shared/ErrorState";
import { ShipmentTimeline } from "@/app/dashboard/customer/shipments/[id]/ShipmentTimeline";
import { useShipment } from "@/features/shipments/hooks";
import { formatCurrency, formatDate, PARCEL_TYPE_LABELS } from "@/lib/utils";

export default function AdminShipmentDetailPage({ params }: { params: { id: string } }) {
  const { data: shipment, isLoading, isError, refetch } = useShipment(params.id);

  if (isLoading) return <div className="h-48 animate-pulse rounded-xl bg-muted max-w-3xl" />;
  if (isError || !shipment) return <ErrorState title="Shipment not found" onRetry={() => refetch()} />;

  return (
    <div className="space-y-6 max-w-3xl">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/dashboard/admin/shipments"><ArrowLeft className="mr-2 size-4" />Back</Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold font-mono">{shipment.trackingNumber}</h1>
          <p className="text-sm text-muted-foreground">{formatDate(shipment.createdAt)}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <ShipmentStatusBadge status={shipment.status} />
          <PaymentStatusBadge status={shipment.paymentStatus} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Sender</CardTitle></CardHeader>
          <CardContent>
            <dl className="space-y-1 text-sm">
              <div><dt className="text-muted-foreground">Name</dt><dd className="font-medium">{shipment.senderName}</dd></div>
              <div><dt className="text-muted-foreground">Phone</dt><dd>{shipment.senderPhone}</dd></div>
              <div><dt className="text-muted-foreground">Address</dt><dd>{shipment.senderAddress}, {shipment.senderCity}</dd></div>
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Recipient</CardTitle></CardHeader>
          <CardContent>
            <dl className="space-y-1 text-sm">
              <div><dt className="text-muted-foreground">Name</dt><dd className="font-medium">{shipment.recipientName}</dd></div>
              <div><dt className="text-muted-foreground">Phone</dt><dd>{shipment.recipientPhone}</dd></div>
              <div><dt className="text-muted-foreground">Address</dt><dd>{shipment.recipientAddress}, {shipment.recipientCity}</dd></div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Parcel & payment</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-muted-foreground">Weight</dt><dd>{shipment.declaredWeightKg} kg</dd></div>
            <div><dt className="text-muted-foreground">Type</dt><dd>{PARCEL_TYPE_LABELS[shipment.parcelType]}</dd></div>
            <div><dt className="text-muted-foreground">Delivery</dt><dd>{shipment.deliveryType}</dd></div>
            <div><dt className="text-muted-foreground">Amount</dt><dd className="font-semibold text-primary">{formatCurrency(shipment.price)}</dd></div>
            <div><dt className="text-muted-foreground">Delivery attempts</dt><dd>{shipment.deliveryAttemptCount}</dd></div>
            {shipment.cancellationReason && (
              <div className="col-span-2"><dt className="text-muted-foreground">Cancellation reason</dt><dd>{shipment.cancellationReason}</dd></div>
            )}
          </dl>
        </CardContent>
      </Card>

      <ShipmentTimeline shipmentId={params.id} />
    </div>
  );
}
