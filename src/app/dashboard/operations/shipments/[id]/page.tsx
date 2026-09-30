"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/FormField";
import { ShipmentStatusBadge, PaymentStatusBadge } from "@/components/shared/StatusBadge";
import { ErrorState } from "@/components/shared/ErrorState";
import { useShipment } from "@/features/shipments/hooks";
import { useUpdateOperationsShipmentStatus, useCreateAssignment, useCouriers } from "@/features/couriers/hooks";
import { useCancelShipment, useInitiateReturn } from "@/features/shipments/hooks";
import { formatCurrency, formatDate, SHIPMENT_STATUS_LABELS } from "@/lib/utils";
import type { ShipmentStatus } from "@/types";

const statusSchema = z.object({
  status: z.string().min(1),
  reason: z.string().max(300).optional(),
});
const assignSchema = z.object({
  courierProfileId: z.string().min(1, "Select a courier"),
  type: z.enum(["PICKUP","DELIVERY","RETURN"]),
});

export default function OperationsShipmentDetailPage({ params }: { params: { id: string } }) {
  const { data: shipment, isLoading, isError, refetch } = useShipment(params.id);
  const { data: couriersData } = useCouriers({ availability: "AVAILABLE", limit: 50 });
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateOperationsShipmentStatus();
  const { mutate: assign, isPending: isAssigning } = useCreateAssignment();
  const { mutate: cancel, isPending: isCancelling } = useCancelShipment();
  const { mutate: initiateReturn, isPending: isReturning } = useInitiateReturn();
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);

  const statusForm = useForm({ resolver: zodResolver(statusSchema) });
  const assignForm = useForm({ resolver: zodResolver(assignSchema) });

  if (isLoading) return <div className="h-48 animate-pulse rounded-xl bg-muted" />;
  if (isError || !shipment) return <ErrorState title="Shipment not found" onRetry={() => refetch()} />;

  const couriers = couriersData?.couriers ?? [];
  const canAssign = ["PICKUP_REQUESTED","AT_DESTINATION_HUB","RETURN_INITIATED"].includes(shipment.status);

  return (
    <div className="space-y-6 max-w-3xl">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/dashboard/operations/shipments"><ArrowLeft className="mr-2 size-4" />Back</Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold font-mono">{shipment.trackingNumber}</h1>
          <p className="text-sm text-muted-foreground">{shipment.senderCity} → {shipment.recipientCity}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <ShipmentStatusBadge status={shipment.status} />
          <PaymentStatusBadge status={shipment.paymentStatus} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setShowStatusForm(!showStatusForm)}>Update status</Button>
        {canAssign && <Button size="sm" onClick={() => setShowAssignForm(!showAssignForm)}>Assign courier</Button>}
        {shipment.status === "DELIVERY_FAILED" && (
          <Button variant="outline" size="sm" onClick={() => initiateReturn({ id: params.id, reason: "Return initiated by operations manager" })}>
            Initiate return
          </Button>
        )}
        {["CREATED","PICKUP_REQUESTED"].includes(shipment.status) && (
          <Button variant="destructive" size="sm" onClick={() => cancel({ id: params.id, reason: "Cancelled by operations manager" })}>
            Cancel
          </Button>
        )}
      </div>

      {showStatusForm && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Update shipment status</CardTitle></CardHeader>
          <form onSubmit={statusForm.handleSubmit((vals) => {
            updateStatus({ id: params.id, data: { status: vals.status as ShipmentStatus, reason: vals.reason } }, { onSuccess: () => setShowStatusForm(false) });
          })}>
            <CardContent className="space-y-4">
              <FormField label="New status" htmlFor="newStatus" error={statusForm.formState.errors.status?.message as string} required>
                <Controller control={statusForm.control} name="status" render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(SHIPMENT_STATUS_LABELS) as ShipmentStatus[]).map(s => (
                        <SelectItem key={s} value={s}>{SHIPMENT_STATUS_LABELS[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
              </FormField>
              <FormField label="Reason (required for overrides)" htmlFor="statusReason">
                <Textarea id="statusReason" rows={2} {...statusForm.register("reason")} />
              </FormField>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowStatusForm(false)}>Cancel</Button>
                <Button type="submit" loading={isUpdating}>Update</Button>
              </div>
            </CardContent>
          </form>
        </Card>
      )}

      {showAssignForm && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Assign courier</CardTitle></CardHeader>
          <form onSubmit={assignForm.handleSubmit((vals) => {
            assign({ shipmentId: params.id, courierProfileId: vals.courierProfileId as string, type: vals.type as string }, { onSuccess: () => setShowAssignForm(false) });
          })}>
            <CardContent className="space-y-4">
              <FormField label="Courier" htmlFor="courier" error={assignForm.formState.errors.courierProfileId?.message as string} required>
                <Controller control={assignForm.control} name="courierProfileId" render={({ field }) => (
                  <Select value={field.value as string} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select available courier" /></SelectTrigger>
                    <SelectContent>
                      {couriers.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.user.firstName} {c.user.lastName} — {c.hub?.name ?? "No hub"}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
              </FormField>
              <FormField label="Assignment type" htmlFor="assignType" required>
                <Controller control={assignForm.control} name="type" render={({ field }) => (
                  <Select value={field.value as string} onValueChange={field.onChange} defaultValue="PICKUP">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PICKUP">Pickup</SelectItem>
                      <SelectItem value="DELIVERY">Delivery</SelectItem>
                      <SelectItem value="RETURN">Return</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </FormField>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAssignForm(false)}>Cancel</Button>
                <Button type="submit" loading={isAssigning}>Assign</Button>
              </div>
            </CardContent>
          </form>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Shipment details</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-muted-foreground">Sender</dt><dd className="font-medium">{shipment.senderName}</dd></div>
            <div><dt className="text-muted-foreground">Recipient</dt><dd className="font-medium">{shipment.recipientName}</dd></div>
            <div><dt className="text-muted-foreground">From</dt><dd>{shipment.senderCity}</dd></div>
            <div><dt className="text-muted-foreground">To</dt><dd>{shipment.recipientCity}</dd></div>
            <div><dt className="text-muted-foreground">Weight</dt><dd>{shipment.declaredWeightKg} kg</dd></div>
            <div><dt className="text-muted-foreground">Amount</dt><dd className="font-semibold">{formatCurrency(shipment.price)}</dd></div>
            <div><dt className="text-muted-foreground">Created</dt><dd>{formatDate(shipment.createdAt)}</dd></div>
            <div><dt className="text-muted-foreground">Delivery attempts</dt><dd>{shipment.deliveryAttemptCount}</dd></div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
