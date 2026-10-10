"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { FormField } from "@/components/shared/FormField";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useZonesList, useCreateZone, useUpdateZone, useDeleteZone } from "@/features/hubs/hooks";
import { useHubs } from "@/features/hubs/hooks";
import type { Zone } from "@/types";

const zoneSchema = z.object({
  name:        z.string().min(2, "Name is required"),
  code:        z.string().min(2, "Code is required").max(10),
  hubId:       z.string().min(1, "Hub is required"),
  description: z.string().optional(),
});
type ZoneFormValues = z.infer<typeof zoneSchema>;

function ZoneDialog({ open, onOpenChange, zone }: { open: boolean; onOpenChange: (v: boolean) => void; zone?: Zone | null }) {
  const { data: hubsData } = useHubs({ isActive: true, limit: 100 });
  const { mutate: create, isPending: isCreating } = useCreateZone();
  const { mutate: update, isPending: isUpdating } = useUpdateZone();

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<ZoneFormValues>({
    resolver: zodResolver(zoneSchema),
    defaultValues: zone ? { name: zone.name, code: zone.code, hubId: zone.hubId, description: zone.description ?? "" } : {},
  });

  function onSubmit(vals: ZoneFormValues) {
    if (zone) {
      update({ id: zone.id, data: { name: vals.name, code: vals.code, description: vals.description } },
        { onSuccess: () => { onOpenChange(false); reset(); } });
    } else {
      create(vals, { onSuccess: () => { onOpenChange(false); reset(); } });
    }
  }

  const hubs = hubsData?.hubs ?? [];

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{zone ? "Edit zone" : "New delivery zone"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-2">
            <FormField label="Zone name" htmlFor="zoneName" error={errors.name?.message} required>
              <Input id="zoneName" {...register("name")} placeholder="Dhaka North" />
            </FormField>
            <FormField label="Code" htmlFor="zoneCode" error={errors.code?.message} required>
              <Input id="zoneCode" {...register("code")} placeholder="DHK-N" className="font-mono" />
            </FormField>
            {!zone && (
              <FormField label="Hub" htmlFor="hubId" error={errors.hubId?.message} required>
                <Controller control={control} name="hubId" render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="hubId"><SelectValue placeholder="Select hub" /></SelectTrigger>
                    <SelectContent side="bottom" avoidCollisions={false} className="max-h-50 overflow-y-auto">
                      {hubs.map(h => <SelectItem key={h.id} value={h.id}>{h.name} — {h.city}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )} />
              </FormField>
            )}
            <FormField label="Description (optional)" htmlFor="zoneDesc">
              <Input id="zoneDesc" {...register("description")} placeholder="Covers Uttara, Mirpur…" />
            </FormField>
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => { onOpenChange(false); reset(); }}>Cancel</Button>
            <Button type="submit" loading={isCreating || isUpdating}>{zone ? "Save" : "Create zone"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminZonesPage() {
  const { data, isLoading, isError, refetch } = useZonesList({ limit: 100 });
  const { mutate: deleteZone, isPending: isDeleting } = useDeleteZone();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editZone, setEditZone] = useState<Zone | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const zones = data?.zones ?? [];
  const deleteName = zones.find(z => z.id === deleteId)?.name ?? "";

  return (
    <div className="space-y-6">
      <PageHeader title="Delivery Zones" description="Manage delivery zones and their hub assignments.">
        <Button onClick={() => { setEditZone(null); setDialogOpen(true); }}>
          <Plus className="mr-2 size-4" />
          New zone
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          {isError ? (
            <div className="p-6"><ErrorState title="Could not load zones" onRetry={() => refetch()} /></div>
          ) : isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-md bg-muted" />
              ))}
            </div>
          ) : zones.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={<MapPin className="size-6" />} title="No zones configured" description="Create delivery zones to enable shipment routing." action={{ label: "Create zone", onClick: () => setDialogOpen(true) }} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Code</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Hub</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Description</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {zones.map((zone) => (
                    <tr key={zone.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{zone.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{zone.code}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{zone.hub?.name ?? "—"}</td>
                      <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground text-xs">{zone.description ?? "—"}</td>
                      <td className="px-4 py-3">
                        <Badge variant={zone.isActive ? "success" : "secondary"}>
                          {zone.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="size-8" onClick={() => { setEditZone(zone); setDialogOpen(true); }} aria-label="Edit zone">
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(zone.id)} aria-label="Delete zone">
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <ZoneDialog open={dialogOpen} onOpenChange={setDialogOpen} zone={editZone} />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(v) => { if (!v) setDeleteId(null); }}
        title="Delete zone"
        description={`Delete zone "${deleteName}"? Shipments assigned to this zone may be affected.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => deleteZone(deleteId!, { onSuccess: () => setDeleteId(null) })}
        loading={isDeleting}
      />
    </div>
  );
}
