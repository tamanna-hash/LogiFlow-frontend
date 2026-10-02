"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft, Package, MapPin, CreditCard, Clock, CheckCircle, XCircle, Truck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ErrorState } from "@/components/shared/ErrorState";
import { ShipmentStatusBadge, PaymentStatusBadge, DeliveryTypeBadge } from "@/components/shared/StatusBadge";
import { FormField } from "@/components/shared/FormField";
import { ShipmentTimeline } from "./ShipmentTimeline";
import { useShipment } from "@/features/shipments/hooks";
import { useCancelShipment, useRequestPickup } from "@/features/shipments/hooks";
import { useInitiateBkashPayment, useInitiateStripeCheckout } from "@/features/payments/hooks";
import { cancelShipmentSchema, type CancelShipmentFormValues } from "@/lib/validations/shipment";
import { formatDate, formatCurrency, PARCEL_TYPE_LABELS } from "@/lib/utils";

export function ShipmentDetailView({ id }: { id: string }) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const { data: shipment, isLoading, isError, refetch } = useShipment(id);
  const { mutate: cancelShipment, isPending: isCancelling } = useCancelShipment();
  const { mutate: requestPickup, isPending: isRequestingPickup } = useRequestPickup();
  const { mutate: initiatePayment, isPending: isPaymentPending } = useInitiateBkashPayment();
  const { mutate: initiateStripe, isPending: isStripePending } = useInitiateStripeCheckout();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CancelShipmentFormValues>({
    resolver: zodResolver(cancelShipmentSchema),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  if (isError || !shipment) {
    return <ErrorState title="Shipment not found" onRetry={() => refetch()} />;
  }

  const canPay =
    shipment.status === "CREATED" && shipment.paymentStatus === "PENDING";
  const canRequestPickup =
    shipment.status === "CREATED" && shipment.paymentStatus === "COMPLETED";
  const canCancel = ["CREATED", "PICKUP_REQUESTED"].includes(shipment.status);

  function handleCancel(values: CancelShipmentFormValues) {
    cancelShipment(
      { id, reason: values.reason },
      {
        onSuccess: () => {
          setShowCancelDialog(false);
          reset();
        },
      }
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/dashboard/customer/shipments">
            <ArrowLeft className="mr-2 size-4" />
            Back to shipments
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold font-mono">{shipment.trackingNumber}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Created {formatDate(shipment.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ShipmentStatusBadge status={shipment.status} />
          <PaymentStatusBadge status={shipment.paymentStatus} />
          <DeliveryTypeBadge type={shipment.deliveryType} />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {canPay && (
          <>
            <Button
              onClick={() => initiatePayment(id)}
              loading={isPaymentPending}
              disabled={isStripePending}
            >
              <CreditCard className="mr-2 size-4" />
              Pay with bKash
            </Button>
            <Button
              variant="outline"
              onClick={() => initiateStripe(id)}
              loading={isStripePending}
              disabled={isPaymentPending}
            >
              <CreditCard className="mr-2 size-4" />
              Pay with Card (Stripe)
            </Button>
          </>
        )}
        {canRequestPickup && (
          <Button
            variant="outline"
            onClick={() => requestPickup({ id, data: {} })}
            loading={isRequestingPickup}
          >
            <Truck className="mr-2 size-4" />
            Request pickup
          </Button>
        )}
        {canCancel && (
          <Button
            variant="outline"
            className="text-destructive border-destructive hover:bg-destructive hover:text-white"
            onClick={() => setShowCancelDialog(true)}
          >
            <XCircle className="mr-2 size-4" />
            Cancel shipment
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sender & Recipient */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="size-4" />
              Addresses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">From</p>
              <p className="font-medium">{shipment.senderName}</p>
              <p className="text-sm text-muted-foreground">{shipment.senderPhone}</p>
              <p className="text-sm text-muted-foreground">{shipment.senderAddress}</p>
              <p className="text-sm text-muted-foreground">{shipment.senderCity}</p>
              {shipment.originZone && (
                <p className="text-xs text-muted-foreground">Zone: {shipment.originZone.name}</p>
              )}
            </div>
            <Separator />
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">To</p>
              <p className="font-medium">{shipment.recipientName}</p>
              <p className="text-sm text-muted-foreground">{shipment.recipientPhone}</p>
              <p className="text-sm text-muted-foreground">{shipment.recipientAddress}</p>
              <p className="text-sm text-muted-foreground">{shipment.recipientCity}</p>
              {shipment.destinationZone && (
                <p className="text-xs text-muted-foreground">Zone: {shipment.destinationZone.name}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Parcel details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="size-4" />
              Parcel details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Declared weight</dt>
                <dd className="font-medium">{shipment.declaredWeightKg} kg</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Parcel type</dt>
                <dd className="font-medium">{PARCEL_TYPE_LABELS[shipment.parcelType]}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Delivery type</dt>
                <dd className="font-medium">{shipment.deliveryType}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Amount</dt>
                <dd className="font-semibold text-primary">{formatCurrency(shipment.price)}</dd>
              </div>
              {shipment.description && (
                <div className="col-span-2">
                  <dt className="text-muted-foreground">Description</dt>
                  <dd>{shipment.description}</dd>
                </div>
              )}
              {shipment.specialInstructions && (
                <div className="col-span-2">
                  <dt className="text-muted-foreground">Special instructions</dt>
                  <dd>{shipment.specialInstructions}</dd>
                </div>
              )}
            </dl>

            {shipment.items.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Items</p>
                <div className="space-y-2">
                  {shipment.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-xs">
                      <span>{item.description}</span>
                      <span className="text-muted-foreground">
                        {item.quantity}x · {item.weightKg} kg
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="size-4" />
            Payment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Total amount</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(shipment.price)}</p>
            </div>
            <PaymentStatusBadge status={shipment.paymentStatus} />
          </div>
          {canPay && (
            <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
              Payment is required before pickup can be arranged.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      <ShipmentTimeline shipmentId={id} />

      {/* Cancel dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Cancel shipment</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit(handleCancel)}>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Please provide a reason for cancelling this shipment.
                </p>
                <FormField label="Cancellation reason" htmlFor="reason" error={errors.reason?.message} required>
                  <Textarea
                    id="reason"
                    placeholder="Reason for cancellation…"
                    {...register("reason")}
                  />
                </FormField>
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setShowCancelDialog(false); reset(); }}
                  >
                    Keep shipment
                  </Button>
                  <Button type="submit" variant="destructive" loading={isCancelling}>
                    Cancel shipment
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
