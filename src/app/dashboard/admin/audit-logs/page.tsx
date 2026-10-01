"use client";

export const dynamic = "force-dynamic";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { TableSkeleton } from "@/components/shared/Skeleton";
import { Pagination } from "@/components/shared/Pagination";
import { useAuditLogs } from "@/features/admin/hooks";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function AdminAuditLogsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const page = Number(searchParams.get("page") ?? 1);

  const { data, isLoading, isError, refetch } = useAuditLogs({ page, limit: 20 });

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  }

  const logs = data?.logs ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" description="Track all significant system actions." />

      <Card>
        <CardContent className="p-0">
          {isError ? (
            <div className="p-6"><ErrorState title="Could not load audit logs" onRetry={() => refetch()} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Action</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Resource</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Actor</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Timestamp</th>
                  </tr>
                </thead>
                {isLoading ? <TableSkeleton rows={8} cols={4} /> : logs.length === 0 ? (
                  <tbody>
                    <tr><td colSpan={4} className="px-4 py-12">
                      <EmptyState icon={<ClipboardList className="size-6" />} title="No audit logs found" />
                    </td></tr>
                  </tbody>
                ) : (
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <Badge variant="secondary" className="text-xs font-mono">
                            {log.action.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="text-xs font-medium">{log.resourceType}</p>
                          <p className="text-xs text-muted-foreground font-mono">{log.resourceId.slice(0, 12)}…</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">
                          {log.actor ? `${log.actor.firstName} ${log.actor.lastName}` : "System"}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">
                          {formatDateTime(log.createdAt)}
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
