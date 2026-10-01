"use client";

export const dynamic = "force-dynamic";

import { Truck, Search } from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { TableSkeleton } from "@/components/shared/Skeleton";
import { Pagination } from "@/components/shared/Pagination";
import { CourierAvailabilityBadge } from "@/components/shared/StatusBadge";
import { useCouriers, useUpdateOperationsCourierAvailability } from "@/features/couriers/hooks";
import type { CourierAvailability } from "@/types";

export default function OperationsCouriersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const page = Number(searchParams.get("page") ?? 1);
  const availability = searchParams.get("availability") ?? undefined;
  const search = searchParams.get("search") ?? undefined;
  const [searchInput, setSearchInput] = useState(search ?? "");

  const { data, isLoading, isError, refetch } = useCouriers({ page, limit: 15, availability: availability || undefined, search: search || undefined });
  const { mutate: updateAvailability, isPending } = useUpdateOperationsCourierAvailability();

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") { params.set(key, value); } else { params.delete(key); }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  const couriers = data?.couriers ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <PageHeader title="Courier Management" description="View and manage all couriers." />

      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={(e) => { e.preventDefault(); updateParam("search", searchInput || null); }} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input placeholder="Search couriers…" className="pl-9" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          </div>
          <Button type="submit" variant="outline" size="sm">Search</Button>
        </form>
        <Select value={availability ?? "all"} onValueChange={(v) => updateParam("availability", v)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="AVAILABLE">Available</SelectItem>
            <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
            <SelectItem value="ON_DELIVERY">On Delivery</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isError ? (
            <div className="p-6"><ErrorState title="Could not load couriers" onRetry={() => refetch()} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Hub</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Availability</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Deliveries</th>
                    <th className="sr-only">Actions</th>
                  </tr>
                </thead>
                {isLoading ? <TableSkeleton rows={5} cols={4} /> : couriers.length === 0 ? (
                  <tbody>
                    <tr><td colSpan={5} className="px-4 py-12">
                      <EmptyState icon={<Truck className="size-6" />} title="No couriers found" />
                    </td></tr>
                  </tbody>
                ) : (
                  <tbody>
                    {couriers.map((c) => (
                      <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium">{c.user.firstName} {c.user.lastName}</p>
                          <p className="text-xs text-muted-foreground">{c.user.email}</p>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{c.hub?.name ?? "—"}</td>
                        <td className="px-4 py-3"><CourierAvailabilityBadge availability={c.availability} /></td>
                        <td className="px-4 py-3 text-right text-muted-foreground hidden sm:table-cell">{c.totalDeliveries}</td>
                        <td className="px-4 py-3 text-right">
                          {c.availability !== "ON_DELIVERY" && (
                            <Button variant="ghost" size="sm" disabled={isPending} onClick={() => updateAvailability({ courierProfileId: c.id, availability: (c.availability === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE") as CourierAvailability })}>
                              {c.availability === "AVAILABLE" ? "Set unavailable" : "Set available"}
                            </Button>
                          )}
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
      {meta && <Pagination meta={meta} onPageChange={(p) => updateParam("page", String(p))} />}
    </div>
  );
}
