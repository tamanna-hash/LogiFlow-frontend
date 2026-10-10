"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft, Pencil, Plus, Trash2, UserCheck, UserX, Users } from "lucide-react";
import { use, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ErrorState } from "@/components/shared/ErrorState";
import { FormField } from "@/components/shared/FormField";
import { useHub, useDeactivateHub, useUpdateHub, useAssignHubManager, useRemoveHubManager, useUnassignedManagers } from "@/features/hubs/hooks";
import { useRouter } from "next/navigation";
import { formatDate, getInitials } from "@/lib/utils";

const editSchema = z.object({
  name:    z.string().min(2, "Name is required"),
  code:    z.string().min(2, "Code is required").max(10),
  address: z.string().min(5, "Address is required"),
  city:    z.string().min(2, "City is required"),
  phone:   z.string().optional(),
});
type EditFormValues = z.infer<typeof editSchema>;

const assignSchema = z.object({ userId: z.string().min(1, "Select a user") });
type AssignFormValues = z.infer<typeof assignSchema>;

export default function AdminHubDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { data: hub, isLoading, isError, refetch } = useHub(id);
  const { mutate: deactivate, isPending: isDeactivating } = useDeactivateHub();
  const { mutate: update, isPending: isUpdating } = useUpdateHub();
  const { mutate: assignManager, isPending: isAssigning } = useAssignHubManager(id);
  const { mutate: removeManager, isPending: isRemoving } = useRemoveHubManager(id);
  const { data: unassignedManagers = [] } = useUnassignedManagers();

  const [showDeactivate, setShowDeactivate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  // Track which manager is being removed { userId, name }
  const [removingManager, setRemovingManager] = useState<{ userId: string; name: string } | null>(null);

  const editForm = useForm<EditFormValues>({ resolver: zodResolver(editSchema) });
  const assignForm = useForm<AssignFormValues>({ resolver: zodResolver(assignSchema) });

  if (isLoading) return <div className="h-64 animate-pulse rounded-xl bg-muted max-w-2xl" />;
  if (isError || !hub) return <ErrorState title="Hub not found" onRetry={() => refetch()} />;

  function openEdit() {
    editForm.reset({ name: hub!.name, code: hub!.code, address: hub!.address, city: hub!.city, phone: hub!.phone ?? "" });
    setShowEdit(true);
  }

  const managers = hub.hubManagerProfiles ?? [];

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
            <Pencil className="mr-2 size-3.5" />Edit
          </Button>
        </div>
      </div>

      {/* Hub details */}
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

      {/* Hub Managers */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <UserCheck className="size-4" />
                Hub managers
                {managers.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{managers.length}</Badge>
                )}
              </CardTitle>
              <CardDescription className="mt-1">
                Multiple managers can share responsibility for this hub.
              </CardDescription>
            </div>
            {hub.isActive && (
              <Button size="sm" onClick={() => setShowAssign(true)}>
                <Plus className="mr-1.5 size-3.5" />
                Add manager
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {managers.length > 0 ? (
            <div className="space-y-2">
              {managers.map(({ userId, user }) => (
                <div
                  key={userId}
                  className="flex items-center justify-between gap-4 rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarImage src={user.avatarUrl ?? undefined} />
                      <AvatarFallback className="text-xs">{getInitials(user.firstName, user.lastName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm leading-tight">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/admin/users/${user.id}`}>View</Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setRemovingManager({ userId, name: `${user.firstName} ${user.lastName}` })}
                    >
                      <UserX className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-5 text-center space-y-2">
              <Users className="mx-auto size-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No managers assigned yet.</p>
              {unassignedManagers.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No available Hub Managers found.{" "}
                  <Link href="/dashboard/admin/users" className="underline underline-offset-2 hover:text-foreground">
                    Change a user&apos;s role
                  </Link>{" "}
                  to Hub Manager first.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Zones */}
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

      {/* Danger zone */}
      {hub.isActive && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base text-destructive">Danger zone</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Deactivating a hub prevents new shipments from being routed here. Data is preserved.</p>
            <Button variant="destructive" size="sm" onClick={() => setShowDeactivate(true)}>
              <Trash2 className="mr-2 size-4" />Deactivate hub
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <div className="p-6 border-b"><h2 className="text-lg font-semibold">Edit hub</h2></div>
            <form onSubmit={editForm.handleSubmit((vals) => update({ id, data: vals }, { onSuccess: () => setShowEdit(false) }))}>
              <div className="p-6 space-y-4">
                <FormField label="Name" htmlFor="hName" error={editForm.formState.errors.name?.message} required>
                  <Input id="hName" {...editForm.register("name")} />
                </FormField>
                <FormField label="Code" htmlFor="hCode" error={editForm.formState.errors.code?.message} required>
                  <Input id="hCode" {...editForm.register("code")} className="font-mono" />
                </FormField>
                <FormField label="City" htmlFor="hCity" error={editForm.formState.errors.city?.message} required>
                  <Input id="hCity" {...editForm.register("city")} />
                </FormField>
                <FormField label="Address" htmlFor="hAddr" error={editForm.formState.errors.address?.message} required>
                  <Input id="hAddr" {...editForm.register("address")} />
                </FormField>
                <FormField label="Phone (optional)" htmlFor="hPhone">
                  <Input id="hPhone" type="tel" {...editForm.register("phone")} />
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

      {/* Assign manager modal */}
      {showAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Add hub manager</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Select a user with the Hub Manager role. Multiple managers can be assigned.
              </p>
            </div>
            <form onSubmit={assignForm.handleSubmit((vals) => {
              assignManager(vals.userId, { onSuccess: () => { setShowAssign(false); assignForm.reset(); } });
            })}>
              <div className="p-6 space-y-4">
                {unassignedManagers.length === 0 ? (
                  <div className="rounded-lg bg-muted p-4 text-sm text-center space-y-2">
                    <p className="font-medium">No Hub Managers available</p>
                    <p className="text-muted-foreground">
                      Change a user&apos;s role to <strong>Hub Manager</strong> first.
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/dashboard/admin/users">Go to Users</Link>
                    </Button>
                  </div>
                ) : (
                  <FormField label="Hub Manager" htmlFor="userId" error={assignForm.formState.errors.userId?.message} required>
                    <Controller
                      control={assignForm.control}
                      name="userId"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger id="userId">
                            <SelectValue placeholder="Select a hub manager" />
                          </SelectTrigger>
                          <SelectContent>
                            {unassignedManagers.map((u) => (
                              <SelectItem key={u.id} value={u.id}>
                                {u.firstName} {u.lastName} — {u.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FormField>
                )}
                <p className="text-xs text-muted-foreground">
                  Only unassigned Hub Managers appear here.{" "}
                  <Link href="/dashboard/admin/users" className="underline underline-offset-2 hover:text-foreground">
                    Manage user roles →
                  </Link>
                </p>
              </div>
              <div className="p-6 border-t flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setShowAssign(false); assignForm.reset(); }}>Cancel</Button>
                <Button type="submit" loading={isAssigning} disabled={unassignedManagers.length === 0}>Assign</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Deactivate confirm */}
      <ConfirmDialog
        open={showDeactivate}
        onOpenChange={setShowDeactivate}
        title="Deactivate hub"
        description={`Deactivate ${hub.name}? This prevents new shipments from being routed here.`}
        confirmLabel="Deactivate"
        variant="destructive"
        onConfirm={() => deactivate(id, { onSuccess: () => router.push("/dashboard/admin/hubs") })}
        loading={isDeactivating}
      />

      {/* Remove manager confirm */}
      <ConfirmDialog
        open={!!removingManager}
        onOpenChange={(open) => { if (!open) setRemovingManager(null); }}
        title="Remove hub manager"
        description={`Remove ${removingManager?.name} as a manager of ${hub.name}? They will retain the Hub Manager role but won't be assigned to any hub.`}
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={() => {
          if (!removingManager) return;
          removeManager(removingManager.userId, { onSuccess: () => setRemovingManager(null) });
        }}
        loading={isRemoving}
      />
    </div>
  );
}
