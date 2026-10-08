"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardList, XCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/shared/FormField";
import { AssignmentStatusBadge } from "@/components/shared/StatusBadge";
import { useAssignments, useCancelOperationsAssignment } from "@/features/couriers/hooks";
import { formatDate } from "@/lib/utils";

const cancelSchema = z.object({ reason: z.string().min(5, "Reason must be at least 5 characters") });
type CancelFormValues = z.infer<typeof cancelSchema>;

export default function OperationsAssignmentsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [type, setType]     = useState("");
  const [cancelId, setCancelId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useAssignments({ page, limit: 20, status: status || undefined, type: type || undefined });
  const { mutate: cancelAssignment, isPending: isCancelling } = useCancelOperationsAssignment();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CancelFormValues>({
    resolver: zodResolver(cancelSchema),
  });

  const assignments = data?.assignments ?? [];
  const meta        = data?.meta;

  function handleCancel(vals: CancelFormValues) {
    if (!cancelId) return;
    cancelAssignment({ id: cancelId, reason: vals.reason }, {
      onSuccess: () => { setCancelId(null); reset(); },
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Assignment Management" description="View and manage all courier assignments." />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={status} onValueChange={(v) => { setStatus(v === "ALL" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={(v) => { setType(v === "ALL" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All types</SelectItem>
            <SelectItem value="PICKUP">Pickup</SelectItem>
            <SelectItem value="DELIVERY">Delivery</SelectItem>
            <SelectItem value="RETURN">Return</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isError ? (
            <div className="p-6"><ErrorState title="Could not load assignments" onRetry={() => refetch()} /></div>
          ) : isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-md bg-muted" />)}
            </div>
          ) : assignments.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={<ClipboardList className="size-6" />} title="No assignments found" description="Assign couriers from the shipment detail page." action={{ label: "View shipments", href: "/dashboard/operations/shipments" }} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tracking #</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Assigned</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => (
                    <tr key={a.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs">
                        <Link href={`/dashboard/operations/shipments/${a.shipment.id}`} className="hover:underline text-primary">
                          {a.shipment.trackingNumber}
                        </Link>
                        <p className="text-muted-foreground font-sans">{a.shipment.recipientCity}</p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <Badge variant="outline" className="text-xs">{a.type}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <AssignmentStatusBadge status={a.status} />
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                        {formatDate(a.assignedAt)}
                      </td>
                      <td className="px-4 py-3">
                        {a.status === "ACTIVE" && (
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setCancelId(a.id)}>
                            <XCircle className="mr-1.5 size-3.5" />
                            Cancel
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="flex items-center text-sm text-muted-foreground px-2">Page {page} of {meta.totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}

      {/* Cancel dialog */}
      {cancelId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-sm">
            <div className="p-6 border-b"><h2 className="text-lg font-semibold">Cancel assignment</h2></div>
            <form onSubmit={handleSubmit(handleCancel)}>
              <div className="p-6 space-y-4">
                <p className="text-sm text-muted-foreground">Provide a reason for cancelling this assignment.</p>
                <FormField label="Reason" htmlFor="cancelReason" error={errors.reason?.message} required>
                  <Textarea id="cancelReason" rows={3} placeholder="Reason for cancellation…" {...register("reason")} />
                </FormField>
              </div>
              <div className="p-6 border-t flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setCancelId(null); reset(); }}>Keep</Button>
                <Button type="submit" variant="destructive" loading={isCancelling}>Cancel assignment</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
