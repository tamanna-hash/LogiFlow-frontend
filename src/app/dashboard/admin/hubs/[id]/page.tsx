"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { use, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ErrorState } from "@/components/shared/ErrorState";
import { FormField } from "@/components/shared/FormField";
import { useHub, useDeactivateHub, useUpdateHub } from "@/features/hubs/hooks";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";

const editSchema = z.object({
  name:    z.string().min(2, "Name is required"),
  code:    z.string().min(2, "Code is required").max(10),
  address: z.string().min(5, "Address is required"),
  city:    z.string().min(2, "City is required"),
  phone:   z.string().optional(),
});
type EditFormValues = z.infer<typeof editSchema>;

export default function AdminHubDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { data: hub, isLoading, isError, refetch } = useHub(id);
  const { mutate: deactivate, isPending: isDeactivating } = useDeactivateHub();
  const { mutate: update, isPending: isUpdating } = useUpdateHub();
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const form = useForm<EditFormValues>({ resolver: zodResolver(editSchema) });

  if (isLoading) return <div className="h-64 animate-pulse rounded-xl bg-muted max-w-2xl" />;
  if (isError || !hub) return <ErrorState title="Hub not found" onRetry={() => refetch()} />;

  function openEdit() {
    form.reset({ name: hub!.name, code: hub!.code, address: hub!.address, city: hub!.city, phone: hub!.phone ?? "" });
    setShowEdit(true);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/dashboard/admin/hubs"><ArrowLeft className="mr-2 size-4" />Back to hubs</Link>
      </Button>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{hub.name}</h1>
          <p className="text-sm text-muted-foreground font-mono">{hub.code}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={hub.isActive ? "success" : "destructive"}>{hub.isActive ? "Active" : "Inactive"}</Badge>
          <Button variant="outline" size="sm" onClick={openEdit}>
            <Pencil className="mr-2 size-3.5" />
            Edit
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Hub details</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-muted-foreground">City</dt><dd className="font-medium">{hub.city}</dd></div>
            <div><dt className="text-muted-foreground">Phone</dt><dd>{hub.phone ?? "—"}</dd></div>
            <div className="col-span-2"><dt className="text-muted-foreground">Address</dt><dd>{hub.address}</dd></div>
            <div><dt className="text-muted-foreground">Created</dt><dd>{formatDate(hub.createdAt)}</dd></div>
            <div><dt className="text-muted-foreground">Shipments at hub</dt><dd>{hub._count?.shipmentsCurrently ?? 0}</dd></div>
          </dl>
        </CardContent>
      </Card>

      {hub.zones && hub.zones.length > 0 && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Zones ({hub.zones.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {hub.zones.map((z) => (
                <div key={z.id} className="rounded-md border p-2 text-sm">
                  <p className="font-medium">{z.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{z.code}</p>
                  <Badge variant={z.isActive ? "success" : "secondary"} className="mt-1 text-xs">{z.isActive ? "Active" : "Inactive"}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {hub.isActive && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base text-destructive">Danger zone</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Deactivating a hub is only possible when there are no active shipments. This is a soft deactivation.
            </p>
            <Button variant="destructive" size="sm" onClick={() => setShowDeactivate(true)}>
              <Trash2 className="mr-2 size-4" />
              Deactivate hub
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit dialog */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <div className="p-6 border-b"><h2 className="text-lg font-semibold">Edit hub</h2></div>
            <form onSubmit={form.handleSubmit((vals) =>
              update({ id, data: vals }, { onSuccess: () => setShowEdit(false) })
            )}>
              <div className="p-6 space-y-4">
                <FormField label="Name" htmlFor="hubName" error={form.formState.errors.name?.message} required>
                  <Input id="hubName" {...form.register("name")} />
                </FormField>
                <FormField label="Code" htmlFor="hubCode" error={form.formState.errors.code?.message} required>
                  <Input id="hubCode" {...form.register("code")} className="font-mono" />
                </FormField>
                <FormField label="City" htmlFor="hubCity" error={form.formState.errors.city?.message} required>
                  <Input id="hubCity" {...form.register("city")} />
                </FormField>
                <FormField label="Address" htmlFor="hubAddress" error={form.formState.errors.address?.message} required>
                  <Input id="hubAddress" {...form.register("address")} />
                </FormField>
                <FormField label="Phone (optional)" htmlFor="hubPhone">
                  <Input id="hubPhone" type="tel" {...form.register("phone")} />
                </FormField>
              </div>
              <div className="p-6 border-t flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowEdit(false)}>Cancel</Button>
                <Button type="submit" loading={isUpdating}>Save changes</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <ConfirmDialog
        open={showDeactivate}
        onOpenChange={setShowDeactivate}
        title="Deactivate hub"
        description={`Are you sure you want to deactivate ${hub.name}? This will prevent new shipments from being routed to this hub.`}
        confirmLabel="Deactivate"
        variant="destructive"
        onConfirm={() => deactivate(id, { onSuccess: () => router.push("/dashboard/admin/hubs") })}
        loading={isDeactivating}
      />
    </div>
  );
}

export default function AdminHubDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { data: hub, isLoading, isError, refetch } = useHub(id);
  const { mutate: deactivate, isPending } = useDeactivateHub();
  const [showDeactivate, setShowDeactivate] = useState(false);

  if (isLoading) return <div className="h-64 animate-pulse rounded-xl bg-muted max-w-2xl" />;
  if (isError || !hub) return <ErrorState title="Hub not found" onRetry={() => refetch()} />;

  return (
    <div className="space-y-6 max-w-2xl">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/dashboard/admin/hubs"><ArrowLeft className="mr-2 size-4" />Back to hubs</Link>
      </Button>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{hub.name}</h1>
          <p className="text-sm text-muted-foreground font-mono">{hub.code}</p>
        </div>
        <Badge variant={hub.isActive ? "success" : "destructive"}>{hub.isActive ? "Active" : "Inactive"}</Badge>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Hub details</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-muted-foreground">City</dt><dd className="font-medium">{hub.city}</dd></div>
            <div><dt className="text-muted-foreground">Phone</dt><dd>{hub.phone ?? "—"}</dd></div>
            <div className="col-span-2"><dt className="text-muted-foreground">Address</dt><dd>{hub.address}</dd></div>
            <div><dt className="text-muted-foreground">Created</dt><dd>{formatDate(hub.createdAt)}</dd></div>
            <div><dt className="text-muted-foreground">Shipments at hub</dt><dd>{hub._count?.shipmentsCurrently ?? 0}</dd></div>
          </dl>
        </CardContent>
      </Card>

      {hub.zones && hub.zones.length > 0 && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Zones ({hub.zones.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {hub.zones.map((z) => (
                <div key={z.id} className="rounded-md border p-2 text-sm">
                  <p className="font-medium">{z.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{z.code}</p>
                  <Badge variant={z.isActive ? "success" : "secondary"} className="mt-1 text-xs">{z.isActive ? "Active" : "Inactive"}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {hub.isActive && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base text-destructive">Danger zone</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Deactivating a hub is only possible when there are no active shipments. This is a soft deactivation.
            </p>
            <Button variant="destructive" size="sm" onClick={() => setShowDeactivate(true)}>
              <Trash2 className="mr-2 size-4" />
              Deactivate hub
            </Button>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={showDeactivate}
        onOpenChange={setShowDeactivate}
        title="Deactivate hub"
        description={`Are you sure you want to deactivate ${hub.name}? This will prevent new shipments from being routed to this hub.`}
        confirmLabel="Deactivate"
        variant="destructive"
        onConfirm={() => deactivate(id, { onSuccess: () => router.push("/dashboard/admin/hubs") })}
        loading={isPending}
      />
    </div>
  );
}
