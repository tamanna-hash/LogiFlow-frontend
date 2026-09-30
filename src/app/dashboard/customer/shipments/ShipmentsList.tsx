"use client";

import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Plus, Package, Search, Filter } from "lucide-react";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { TableSkeleton } from "@/components/shared/Skeleton";
import { Pagination } from "@/components/shared/Pagination";
import { ShipmentStatusBadge, PaymentStatusBadge, DeliveryTypeBadge } from "@/components/shared/StatusBadge";
import { useShipments } from "@/features/shipments/hooks";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { ShipmentStatus, DeliveryType } from "@/types";

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: "All statuses", value: "all" },
  { label: "Created", value: "CREATED" },
  { label: "Pickup Requested", value: "PICKUP_REQUESTED" },
  { label: "In Transit", value: "IN_TRANSIT" },
  { label: "Out for Delivery", value: "OUT_FOR_DELIVERY" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Delivery Failed", value: "DELIVERY_FAILED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Returning", value: "RETURNING" },
  { label: "Returned", value: "RETURNED" },
];

export function ShipmentsList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = Number(searchParams.get("page") ?? 1);
  const status = searchParams.get("status") ?? undefined;
  const search = searchParams.get("search") ?? undefined;

  const [searchInput, setSearchInput] = useState(search ?? "");

  const { data, isLoading, isError, refetch } = useShipments({
    page,
    limit: 10,
    status: status as ShipmentStatus | undefined,
    search: search || undefined,
    sortOrder: "desc",
  });

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // reset to page 1 on filter change
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParam("search", searchInput || null);
  }

  const shipments = data?.shipments ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <PageHeader title="My Shipments" description="Track and manage all your shipments.">
        <Button asChild>
          <Link href="/dashboard/customer/shipments/new">
            <Plus className="mr-2 size-4" />
            New shipment
          </Link>
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by tracking number, name, or phone…"
              className="pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Button type="submit" variant="outline" size="sm">Search</Button>
        </form>

        <Select
          value={status ?? "all"}
          onValueChange={(v) => updateParam("status", v)}
        >
          <SelectTrigger className="w-full sm:w-52" aria-label="Filter by status">
            <Filter className="size-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isError ? (
            <div className="p-6">
              <ErrorState title="Could not load shipments" onRetry={() => refetch()} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tracking #</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Recipient</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Payment</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Amount</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Date</th>
                    <th className="sr-only">Actions</th>
                  </tr>
                </thead>
                {isLoading ? (
                  <TableSkeleton rows={5} cols={6} />
                ) : shipments.length === 0 ? (
                  <tbody>
                    <tr>
                      <td colSpan={7} className="px-4 py-12">
                        <EmptyState
                          icon={<Package className="size-6" />}
                          title={search ? "No shipments match your search" : "No shipments yet"}
                          description={search ? "Try different search terms." : "Create your first shipment to get started."}
                          action={
                            !search
                              ? { label: "Create shipment", href: "/dashboard/customer/shipments/new" }
                              : undefined
                          }
                        />
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody>
                    {shipments.map((s) => (
                      <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <Link
                            href={`/dashboard/customer/shipments/${s.id}`}
                            className="font-mono font-medium text-primary hover:underline"
                          >
                            {s.trackingNumber}
                          </Link>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="font-medium truncate max-w-[150px]">{s.recipientName}</p>
                          <p className="text-xs text-muted-foreground">{s.recipientCity}</p>
                        </td>
                        <td className="px-4 py-3">
                          <ShipmentStatusBadge status={s.status} />
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <PaymentStatusBadge status={s.paymentStatus} />
                        </td>
                        <td className="px-4 py-3 text-right hidden lg:table-cell font-medium">
                          {formatCurrency(s.price)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell text-xs">
                          {formatDate(s.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/customer/shipments/${s.id}`}>View</Link>
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
