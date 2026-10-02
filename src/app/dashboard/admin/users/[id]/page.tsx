"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft, Shield, Trash2 } from "lucide-react";
import { useState, use } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FormField } from "@/components/shared/FormField";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ErrorState } from "@/components/shared/ErrorState";
import { useUser, useUpdateUserRole, useDeleteUser } from "@/features/admin/hooks";
import { formatDate, getInitials } from "@/lib/utils";
import { useRouter } from "next/navigation";

const roleSchema = z.object({ role: z.enum(["CUSTOMER","COURIER","HUB_MANAGER","OPERATIONS_MANAGER","ADMIN"]) });
type RoleFormValues = z.infer<typeof roleSchema>;

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { data: user, isLoading, isError, refetch } = useUser(id);
  const { mutate: updateRole, isPending: isUpdatingRole } = useUpdateUserRole();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const form = useForm<RoleFormValues>({ resolver: zodResolver(roleSchema) });

  if (isLoading) return <div className="h-64 animate-pulse rounded-xl bg-muted max-w-2xl" />;
  if (isError || !user) return <ErrorState title="User not found" onRetry={() => refetch()} />;

  return (
    <div className="space-y-6 max-w-2xl">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/dashboard/admin/users"><ArrowLeft className="mr-2 size-4" />Back to users</Link>
      </Button>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarImage src={user.avatarUrl ?? undefined} />
              <AvatarFallback className="text-lg">{getInitials(user.firstName, user.lastName)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-semibold">{user.firstName} {user.lastName}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex gap-2 mt-1">
                <Badge variant="secondary">{user.role.replace(/_/g, " ")}</Badge>
                <Badge variant={user.isActive ? "success" : "destructive"}>{user.isActive ? "Active" : "Suspended"}</Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-muted-foreground">Phone</dt><dd>{user.phone ?? "—"}</dd></div>
            <div><dt className="text-muted-foreground">Joined</dt><dd>{formatDate(user.createdAt)}</dd></div>
            <div><dt className="text-muted-foreground">Email verified</dt><dd>{user.isEmailVerified ? "Yes" : "No"}</dd></div>
          </dl>
        </CardContent>
      </Card>

      {/* Role update */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="size-4" />
            Change role
          </CardTitle>
        </CardHeader>
        <form onSubmit={form.handleSubmit((vals) => updateRole({ id, role: vals.role }))}>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-3 text-sm text-yellow-700 dark:text-yellow-400">
              Changing a user's role will affect what they can access immediately on their next API call.
            </div>
            <FormField label="New role" htmlFor="roleSelect">
              <Controller control={form.control} name="role" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} defaultValue={user.role}>
                  <SelectTrigger id="roleSelect"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CUSTOMER">Customer</SelectItem>
                    <SelectItem value="COURIER">Courier</SelectItem>
                    <SelectItem value="HUB_MANAGER">Hub Manager</SelectItem>
                    <SelectItem value="OPERATIONS_MANAGER">Operations Manager</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </FormField>
            <div className="flex justify-end">
              <Button type="submit" loading={isUpdatingRole}>Update role</Button>
            </div>
          </CardContent>
        </form>
      </Card>

      {/* Delete */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-destructive flex items-center gap-2">
            <Trash2 className="size-4" />
            Danger zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Deleting a user is a soft delete — the account is deactivated but data is preserved.
            This cannot be done if the user has active shipments.
          </p>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete user account
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete user account"
        description={`Are you sure you want to delete ${user.firstName} ${user.lastName}'s account? This action soft-deletes the account.`}
        confirmLabel="Delete account"
        variant="destructive"
        onConfirm={() => deleteUser(id, { onSuccess: () => router.push("/dashboard/admin/users") })}
        loading={isDeleting}
      />
    </div>
  );
}
