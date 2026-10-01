"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { CreditCard, Search } from "lucide-react";
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
import { PaymentStatusBadge } from "@/components/shared/StatusBadge";
import { usePayments } from "@/features/payments/hooks";
import { formatDate, formatCurrency, formatDateTime } from "@/lib/utils";

export default function AdminPaymentsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const page = Number(searchParams.get("page") ?? 1);
  const status = searchParams.get("status") ?? undefined;
  const search = searchParams.get("search") ?? undefined;
  const [searchInput, setSearchInput] = useState(search ?? "");

  const { data, isLoading, isError, refetch } = usePayments({ page, limit: 15, status: status || undefined, search: search || undefined });

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") { params.set(key, value); } else { params.delete(key); }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  const payments = data?.payments ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <PageHeader title="Payment Monitoring" description="Track all payment transactions." />

      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={(e) => { e.preventDefault(); updateParam("search", searchInput || null); }} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input placeholder="Search by transaction ID…" className="pl-9" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          </div>
          <Button type="submit" variant="outline" size="sm">Search</Button>
        </form>
        <Select value={status ?? "all"} onValueChange={(v) => updateParam("status", v)}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isError ? (
            <div className="p-6"><ErrorState title="Could not load payments" onRetry={() => refetch()} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tracking #</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Customer</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Paid at</th>
                  </tr>
                </thead>
                {isLoading ? <TableSkeleton rows={6} cols={5} /> : payments.length === 0 ? (
                  <tbody>
                    <tr><td colSpan={5} className="px-4 py-12">
                      <EmptyState icon={<CreditCard className="size-6" />} title="No payments found" />
                    </td></tr>
                  </tbody>
                ) : (
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-mono font-medium">{p.shipment?.trackingNumber ?? "—"}</p>
                          {p.bkashTransactionId && <p className="text-xs text-muted-foreground">TrxID: {p.bkashTransactionId}</p>}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="font-medium">{p.shipment?.customer?.firstName} {p.shipment?.customer?.lastName}</p>
                          <p className="text-xs text-muted-foreground">{p.shipment?.customer?.email}</p>
                        </td>
                        <td className="px-4 py-3"><PaymentStatusBadge status={p.status} /></td>
                        <td className="px-4 py-3 text-right font-medium">{formatCurrency(p.amount)}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">
                          {p.paidAt ? formatDateTime(p.paidAt) : "—"}
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
