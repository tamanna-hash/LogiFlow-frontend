"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Package, Truck, PackageCheck } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { TableSkeleton } from "@/components/shared/Skeleton";
import { FormField } from "@/components/shared/FormField";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ShipmentStatusBadge } from "@/components/shared/StatusBadge";
import { useShipments } from "@/features/shipments/hooks";
import { useCouriers, useCreateAssignment, useUpdateOperationsShipmentStatus } from "@/features/couriers/hooks";
import { formatDate } from "@/lib/utils";

const assignSchema = z.object({
  courierProfileId: z.string().min(1, "Select a courier"),
});
type AssignFormValues = z.infer<typeof assignSchema>;

function AssignCourierForm({ shipmentId, onClose }: { shipmentId: string; onClose: () => void }) {
  const { data: couriersData } = useCouriers({ availability: "AVAILABLE", limit: 50 });
  const { mutate: assign, isPending } = useCreateAssignment();
  const couriers = couriersData?.couriers ?? [];

  const form = useForm<AssignFormValues>({ resolver: zodResolver(assignSchema) });

  return (
    <form
      onSubmit={form.handleSubmit((vals) =>
        assign({ shipmentId, courierProfileId: vals.courierProfileId, type: "PICKUP" }, { onSuccess: onClose })
      )}
      className="mt-3 space-y-3"
    >
      <FormField label="Assign courier" htmlFor={`courier-${shipmentId}`} error={form.formState.errors.courierProfileId?.message} required>
        <Controller
          control={form.control}
          name="courierProfileId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id={`courier-${shipmentId}`}>
                <SelectValue placeholder={couriers.length === 0 ? "No available couriers" : "Select courier"} />
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
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
        <Button type="submit" size="sm" loading={isPending} disabled={couriers.length === 0}>
          Assign
        </Button>
      </div>
    </form>
  );
}

export default function HubShipmentsPage() {
  const [tab, setTab] = useState<"at_hub" | "pickup_queue">("at_hub");
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [receivingId, setReceivingId] = useState<string | null>(null);

  const { data: atHubData, isLoading: atHubLoading, isError: atHubError, refetch: refetchAtHub } =
    useShipments({ page: 1, limit: 50 });

  const { data: queueData, isLoading: queueLoading, isError: queueError, refetch: refetchQueue } =
    useShipments({ page: 1, limit: 50, pickupQueue: true });

  const { mutate: updateStatus, isPending: isReceiving } = useUpdateOperationsShipmentStatus();

  const atHubShipments = atHubData?.shipments ?? [];
  const queueShipments = queueData?.shipments ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Hub Shipments" description="Manage shipments at your hub and assign couriers for pickup." />

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
        <button
          type="button"
          onClick={() => setTab("at_hub")}
          className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === "at_hub" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Package className="size-3.5" />
          At Hub
          {atHubShipments.length > 0 && (
            <span className="rounded-full bg-primary/10 px-1.5 text-xs text-primary">{atHubShipments.length}</span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab("pickup_queue")}
          className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === "pickup_queue" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Truck className="size-3.5" />
          Pickup Queue
          {queueShipments.length > 0 && (
            <span className="rounded-full bg-amber-500/10 px-1.5 text-xs text-amber-600">{queueShipments.length}</span>
          )}
        </button>
      </div>

      {/* At Hub tab */}
      {tab === "at_hub" && (
        <Card>
          <CardContent className="p-0">
            {atHubError ? (
              <div className="p-6"><ErrorState title="Could not load shipments" onRetry={refetchAtHub} /></div>
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
                  {atHubLoading ? (
                    <TableSkeleton rows={5} cols={4} />
                  ) : atHubShipments.length === 0 ? (
                    <tbody>
                      <tr>
                        <td colSpan={5} className="px-4 py-12">
                          <EmptyState icon={<Package className="size-6" />} title="No shipments" description="No shipments are currently at your hub." />
                        </td>
                      </tr>
                    </tbody>
                  ) : (
                    <tbody>
                      {atHubShipments.map((s) => (
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
      )}

      {/* Pickup Queue tab */}
      {tab === "pickup_queue" && (
        <div className="space-y-3">
          {queueError ? (
            <ErrorState title="Could not load pickup queue" onRetry={refetchQueue} />
          ) : queueLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />)}
            </div>
          ) : queueShipments.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <EmptyState icon={<Truck className="size-6" />} title="No pickups pending" description="All pickup requests for your hub's zones have been assigned." />
              </CardContent>
            </Card>
          ) : (
            queueShipments.map((s) => (
              <Card key={s.id}>
                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-mono font-semibold text-sm">{s.trackingNumber}</p>
                      <p className="text-xs text-muted-foreground">{s.senderName} → {s.recipientCity}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <ShipmentStatusBadge status={s.status} />
                      {s.status === "PICKUP_REQUESTED" && assigningId !== s.id && (
                        <Button size="sm" onClick={() => setAssigningId(s.id)}>
                          <Truck className="mr-1.5 size-3.5" />
                          Assign courier
                        </Button>
                      )}
                      {s.status === "PICKED_UP" && (
                        <Button size="sm" onClick={() => setReceivingId(s.id)}>
                          <PackageCheck className="mr-1.5 size-3.5" />
                          Mark as received
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                {assigningId === s.id && (
                  <CardContent className="pt-0 pb-4 px-4">
                    <AssignCourierForm shipmentId={s.id} onClose={() => { setAssigningId(null); refetchQueue(); }} />
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {/* Confirm mark as received */}
      <ConfirmDialog
        open={!!receivingId}
        onOpenChange={(open) => { if (!open) setReceivingId(null); }}
        title="Mark as received at hub"
        description="Confirm that this shipment has physically arrived at your hub. The status will update to At Hub."
        confirmLabel="Mark as received"
        onConfirm={() => {
          if (!receivingId) return;
          updateStatus(
            { id: receivingId, data: { status: "AT_ORIGIN_HUB" } },
            { onSuccess: () => { setReceivingId(null); refetchQueue(); refetchAtHub(); } }
          );
        }}
        loading={isReceiving}
      />
    </div>
  );
}