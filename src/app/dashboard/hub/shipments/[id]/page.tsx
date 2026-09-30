"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { useShipment } from "@/features/shipments/hooks";
import { useCreateTransfer } from "@/features/hubs/hooks";
import { useHubs } from "@/features/hubs/hooks";
import { useAuthStore } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/utils";

const transferSchema = z.object({
  toHubId: z.string().min(1, "Select a destination hub"),
  estimatedArrival: z.string().optional(),
  notes: z.string().max(300).optional(),
});
type TransferFormValues = z.infer<typeof transferSchema>;

export default function HubShipmentDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuthStore();
  const hubId = user?.hubManagerProfile?.hubId ?? "";
  const { data: shipment, isLoading, isError, refetch } = useShipment(params.id);
  const { data: hubsData } = useHubs({ limit: 50, isActive: true });
  const { mutate: createTransfer, isPending } = useCreateTransfer();
  const [showTransfer, setShowTransfer] = useState(false);

  const form = useForm<TransferFormValues>({ resolver: zodResolver(transferSchema) });

  if (isLoading) return <div className="h-48 animate-pulse rounded-xl bg-muted" />;
  if (isError || !shipment) return <ErrorState title="Shipment not found" onRetry={() => refetch()} />;

  const canTransfer = ["AT_ORIGIN_HUB", "AT_DESTINATION_HUB"].includes(shipment.status) && shipment.currentHubId === hubId;
  const otherHubs = (hubsData?.hubs ?? []).filter((h) => h.id !== hubId);

  function handleTransfer(vals: TransferFormValues) {
    createTransfer(
      { hubId, data: { shipmentId: params.id, toHubId: vals.toHubId, estimatedArrival: vals.estimatedArrival, notes: vals.notes } },
      { onSuccess: () => setShowTransfer(false) }
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

      {canTransfer && (
        <Button onClick={() => setShowTransfer(!showTransfer)}>
          Transfer to another hub
        </Button>
      )}

      {showTransfer && (
        <Card>
          <CardHeader><CardTitle className="text-base">Transfer shipment</CardTitle></CardHeader>
          <form onSubmit={form.handleSubmit(handleTransfer)}>
            <CardContent className="space-y-4">
              <FormField label="Destination hub" htmlFor="toHubId" error={form.formState.errors.toHubId?.message} required>
                <Select onValueChange={(v) => form.setValue("toHubId", v)}>
                  <SelectTrigger id="toHubId"><SelectValue placeholder="Select hub" /></SelectTrigger>
                  <SelectContent>
                    {otherHubs.map((h) => (
                      <SelectItem key={h.id} value={h.id}>{h.name} — {h.city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Estimated arrival (optional)" htmlFor="estimatedArrival">
                <Input id="estimatedArrival" type="datetime-local" {...form.register("estimatedArrival")} />
              </FormField>
              <FormField label="Notes (optional)" htmlFor="transferNotes">
                <Textarea id="transferNotes" rows={2} {...form.register("notes")} />
              </FormField>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowTransfer(false)}>Cancel</Button>
                <Button type="submit" loading={isPending}>Create transfer</Button>
              </div>
            </CardContent>
          </form>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Shipment details</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Sender</dt>
              <dd className="font-medium">{shipment.senderName}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Recipient</dt>
              <dd className="font-medium">{shipment.recipientName}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Weight</dt>
              <dd>{shipment.declaredWeightKg} kg</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Amount</dt>
              <dd className="font-semibold">{formatCurrency(shipment.price)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Delivery type</dt>
              <dd>{shipment.deliveryType}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Created</dt>
              <dd>{formatDate(shipment.createdAt)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
