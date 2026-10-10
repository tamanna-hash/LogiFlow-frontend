"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft, PackageCheck, Truck } from "lucide-react";
import { useState, use } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/FormField";
import { ShipmentStatusBadge } from "@/components/shared/StatusBadge";
import { ErrorState } from "@/components/shared/ErrorState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useShipment } from "@/features/shipments/hooks";
import { useCreateTransfer, useHubDestinations } from "@/features/hubs/hooks";
import { useCouriers, useCreateAssignment, useUpdateOperationsShipmentStatus } from "@/features/couriers/hooks";
import { useAuthStore } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/utils";

const transferSchema = z.object({
  toHubId: z.string().min(1, "Select a destination hub"),
  estimatedArrival: z.string().optional(),
  notes: z.string().max(300).optional(),
});
type TransferFormValues = z.infer<typeof transferSchema>;

const assignSchema = z.object({
  courierProfileId: z.string().min(1, "Select a courier"),
});
type AssignFormValues = z.infer<typeof assignSchema>;

export default function HubShipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuthStore();
  const { id } = use(params);
  const hubId = user?.hubManagerProfile?.hubId ?? "";
  const { data: shipment, isLoading, isError, refetch } = useShipment(id);
  const { data: destinations = [] } = useHubDestinations();
  const { data: couriersData } = useCouriers({ availability: "AVAILABLE", limit: 50 });
  const { mutate: createTransfer, isPending: isTransferring } = useCreateTransfer();
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateOperationsShipmentStatus();
  const { mutate: assignCourier, isPending: isAssigning } = useCreateAssignment();

  const [showTransfer, setShowTransfer] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [showReceiveConfirm, setShowReceiveConfirm] = useState(false);

  const transferForm = useForm<TransferFormValues>({ resolver: zodResolver(transferSchema) });
  const assignForm = useForm<AssignFormValues>({ resolver: zodResolver(assignSchema) });

  if (isLoading) return <div className="h-48 animate-pulse rounded-xl bg-muted" />;
  if (isError || !shipment) return <ErrorState title="Shipment not found" onRetry={() => refetch()} />;

  const canReceive = shipment.status === "PICKED_UP";
  const canAssignDelivery = ["AT_ORIGIN_HUB", "AT_DESTINATION_HUB"].includes(shipment.status)
    && shipment.currentHubId === hubId;
  const canTransfer = canAssignDelivery; // same conditions
  const otherHubs = destinations.filter((h) => h.id !== hubId);
  const couriers = couriersData?.couriers ?? [];

  function handleTransfer(vals: TransferFormValues) {
    // Convert datetime-local format to ISO datetime if provided
    const estimatedArrival = vals.estimatedArrival 
      ? new Date(vals.estimatedArrival).toISOString() 
      : undefined;
    
    createTransfer(
      { hubId, data: { shipmentId: id, toHubId: vals.toHubId, estimatedArrival, notes: vals.notes } },
      { onSuccess: () => { setShowTransfer(false); transferForm.reset(); refetch(); } }
    );
  }

  function handleAssign(vals: AssignFormValues) {
    assignCourier(
      { shipmentId: id, courierProfileId: vals.courierProfileId, type: "DELIVERY" },
      { onSuccess: () => { setShowAssign(false); assignForm.reset(); refetch(); } }
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/dashboard/hub/shipments">
          <ArrowLeft className="mr-2 size-4" />
          Back
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold font-mono">{shipment.trackingNumber}</h1>
          <p className="text-sm text-muted-foreground">{shipment.senderCity} → {shipment.recipientCity}</p>
        </div>
        <ShipmentStatusBadge status={shipment.status} />
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {canReceive && (
          <Button onClick={() => setShowReceiveConfirm(true)} loading={isUpdatingStatus}>
            <PackageCheck className="mr-2 size-4" />
            Mark as received at hub
          </Button>
        )}
        {canAssignDelivery && (
          <Button 
            variant={showAssign ? "default" : "outline"}
            onClick={() => { setShowAssign(!showAssign); setShowTransfer(false); }}
          >
            <Truck className="mr-2 size-4" />
            Assign courier for delivery
          </Button>
        )}
        {canTransfer && (
          <Button 
            variant={showTransfer ? "default" : "outline"} 
            onClick={() => { setShowTransfer(!showTransfer); setShowAssign(false); }}
          >
            Transfer to another hub
          </Button>
        )}
      </div>

      {/* Assign courier for delivery */}
      {showAssign && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Assign courier for delivery</CardTitle></CardHeader>
          <form onSubmit={assignForm.handleSubmit(handleAssign)}>
            <CardContent className="space-y-4">
              {couriers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No available couriers at your hub. Set a courier as available first.
                </p>
              ) : (
                <FormField label="Courier" htmlFor="deliveryCourier" error={assignForm.formState.errors.courierProfileId?.message} required>
                  <Controller
                    control={assignForm.control}
                    name="courierProfileId"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="deliveryCourier">
                          <SelectValue placeholder="Select available courier" />
                        </SelectTrigger>
                        <SelectContent>
                          {couriers.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.user.firstName} {c.user.lastName}
                              {c.hub ? ` — ${c.hub.name}` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>
              )}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setShowAssign(false); assignForm.reset(); }}>Cancel</Button>
                <Button type="submit" loading={isAssigning} disabled={couriers.length === 0}>Assign</Button>
              </div>
            </CardContent>
          </form>
        </Card>
      )}

      {/* Transfer to another hub */}
      {showTransfer && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Transfer shipment</CardTitle></CardHeader>
          <form onSubmit={transferForm.handleSubmit(handleTransfer)}>
            <CardContent className="space-y-4">
              <FormField label="Destination hub" htmlFor="toHubId" error={transferForm.formState.errors.toHubId?.message} required>
                <Select onValueChange={(v) => transferForm.setValue("toHubId", v)}>
                  <SelectTrigger id="toHubId"><SelectValue placeholder="Select hub" /></SelectTrigger>
                  <SelectContent>
                    {otherHubs.map((h) => (
                      <SelectItem key={h.id} value={h.id}>{h.name} — {h.city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Estimated arrival (optional)" htmlFor="estimatedArrival">
                <Input id="estimatedArrival" type="datetime-local" {...transferForm.register("estimatedArrival")} />
              </FormField>
              <FormField label="Notes (optional)" htmlFor="transferNotes">
                <Textarea id="transferNotes" rows={2} {...transferForm.register("notes")} />
              </FormField>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowTransfer(false)}>Cancel</Button>
                <Button type="submit" loading={isTransferring}>Create transfer</Button>
              </div>
            </CardContent>
          </form>
        </Card>
      )}

      {/* Shipment details */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Shipment details</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-muted-foreground">Sender</dt><dd className="font-medium">{shipment.senderName}</dd></div>
            <div><dt className="text-muted-foreground">Recipient</dt><dd className="font-medium">{shipment.recipientName}</dd></div>
            <div><dt className="text-muted-foreground">Weight</dt><dd>{shipment.declaredWeightKg} kg</dd></div>
            <div><dt className="text-muted-foreground">Amount</dt><dd className="font-semibold">{formatCurrency(shipment.price)}</dd></div>
            <div><dt className="text-muted-foreground">Delivery type</dt><dd>{shipment.deliveryType}</dd></div>
            <div><dt className="text-muted-foreground">Created</dt><dd>{formatDate(shipment.createdAt)}</dd></div>
          </dl>
        </CardContent>
      </Card>

      {/* Confirm mark as received */}
      <ConfirmDialog
        open={showReceiveConfirm}
        onOpenChange={setShowReceiveConfirm}
        title="Mark as received at hub"
        description={`Confirm that ${shipment.trackingNumber} has physically arrived at your hub. This will update the status to "At Hub".`}
        confirmLabel="Mark as received"
        onConfirm={() =>
          updateStatus(
            { id, data: { status: "AT_ORIGIN_HUB" } },
            { onSuccess: () => { setShowReceiveConfirm(false); refetch(); } }
          )
        }
        loading={isUpdatingStatus}
      />
    </div>
  );
}
