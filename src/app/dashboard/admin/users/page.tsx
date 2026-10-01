"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Users, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { TableSkeleton } from "@/components/shared/Skeleton";
import { Pagination } from "@/components/shared/Pagination";
import { useUsers } from "@/features/admin/hooks";
import { formatDate, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ROLE_COLORS: Record<string, "default" | "secondary" | "destructive" | "success" | "warning"> = {
  CUSTOMER: "default",
  COURIER: "secondary",
  HUB_MANAGER: "warning",
  OPERATIONS_MANAGER: "warning",
  ADMIN: "destructive",
};

export default function AdminUsersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const page = Number(searchParams.get("page") ?? 1);
  const role = searchParams.get("role") ?? undefined;
  const search = searchParams.get("search") ?? undefined;
  const [searchInput, setSearchInput] = useState(search ?? "");

  const { data, isLoading, isError, refetch } = useUsers({ page, limit: 15, role: role || undefined, search: search || undefined });

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") { params.set(key, value); } else { params.delete(key); }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  const users = data?.users ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <PageHeader title="User Management" description="Manage user accounts and roles." />

      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={(e) => { e.preventDefault(); updateParam("search", searchInput || null); }} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input placeholder="Search users…" className="pl-9" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          </div>
          <Button type="submit" variant="outline" size="sm">Search</Button>
        </form>
        <Select value={role ?? "all"} onValueChange={(v) => updateParam("role", v)}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All roles" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="CUSTOMER">Customer</SelectItem>
            <SelectItem value="COURIER">Courier</SelectItem>
            <SelectItem value="HUB_MANAGER">Hub Manager</SelectItem>
            <SelectItem value="OPERATIONS_MANAGER">Operations Manager</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isError ? (
            <div className="p-6"><ErrorState title="Could not load users" onRetry={() => refetch()} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Joined</th>
                    <th className="sr-only">Actions</th>
                  </tr>
                </thead>
                {isLoading ? <TableSkeleton rows={6} cols={4} /> : users.length === 0 ? (
                  <tbody>
                    <tr><td colSpan={5} className="px-4 py-12">
                      <EmptyState icon={<Users className="size-6" />} title="No users found" />
                    </td></tr>
                  </tbody>
                ) : (
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarImage src={u.avatarUrl ?? undefined} />
                              <AvatarFallback className="text-xs">{getInitials(u.firstName, u.lastName)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{u.firstName} {u.lastName}</p>
                              <p className="text-xs text-muted-foreground">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={ROLE_COLORS[u.role] ?? "default"} className="text-xs">
                            {u.role.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <Badge variant={u.isActive ? "success" : "destructive"} className="text-xs">
                            {u.isActive ? "Active" : "Suspended"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">
                          {formatDate(u.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/admin/users/${u.id}`}>View</Link>
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
      {meta && <Pagination meta={meta} onPageChange={(p) => updateParam("page", String(p))} />}
    </div>
  );
}
