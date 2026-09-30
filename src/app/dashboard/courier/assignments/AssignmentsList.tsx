"use client";

import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Pagination } from "@/components/shared/Pagination";
import { AssignmentStatusBadge } from "@/components/shared/StatusBadge";
import { TableSkeleton } from "@/components/shared/Skeleton";
import { useAssignments } from "@/features/couriers/hooks";
import { formatDateTime } from "@/lib/utils";

export function AssignmentsList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = Number(searchParams.get("page") ?? 1);
  const status = searchParams.get("status") ?? undefined;
  const type = searchParams.get("type") ?? undefined;

  const { data, isLoading, isError, refetch } = useAssignments({
    page,
    limit: 10,
    status: status || undefined,
    type: type || undefined,
  });

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  const assignments = data?.assignments ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <PageHeader title="My Assignments" description="Track your current and past delivery assignments." />

      <div className="flex flex-wrap gap-3">
        <Select value={status ?? "all"} onValueChange={(v) => updateParam("status", v)}>
          <SelectTrigger className="w-40" aria-label="Filter by status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select value={type ?? "all"} onValueChange={(v) => updateParam("type", v)}>
          <SelectTrigger className="w-36" aria-label="Filter by type">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="PICKUP">Pickup</SelectItem>
            <SelectItem value="DELIVERY">Delivery</SelectItem>
            <SelectItem value="RETURN">Return</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isError ? (
            <div className="p-6">
              <ErrorState title="Could not load assignments" onRetry={() => refetch()} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tracking #</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Recipient</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Assigned</th>
                    <th className="sr-only">Actions</th>
                  </tr>
                </thead>
                {isLoading ? (
                  <TableSkeleton rows={5} cols={5} />
                ) : assignments.length === 0 ? (
                  <tbody>
                    <tr>
                      <td colSpan={6} className="px-4 py-12">
                        <EmptyState
                          icon={<ClipboardList className="size-6" />}
                          title="No assignments found"
                          description="You have no assignments matching the selected filters."
                        />
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody>
                    {assignments.map((a) => (
                      <tr key={a.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-mono font-medium">{a.shipment.trackingNumber}</p>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="font-medium">{a.shipment.recipientName}</p>
                          <p className="text-xs text-muted-foreground">{a.shipment.recipientCity}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium uppercase">{a.type}</span>
                        </td>
                        <td className="px-4 py-3">
                          <AssignmentStatusBadge status={a.status} />
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">
                          {formatDateTime(a.assignedAt)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/courier/assignments/${a.id}`}>View</Link>
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

      {meta && (
        <Pagination
          meta={meta}
          onPageChange={(p) => updateParam("page", String(p))}
        />
      )}
    </div>
  );
}
