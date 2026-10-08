"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  Users, Package, Warehouse, CreditCard, TrendingUp, CheckCircle,
  Clock, BarChart3, ArrowRight, Activity, Hand,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/StatCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { ShipmentStatusBadge, PaymentStatusBadge } from "@/components/shared/StatusBadge";
import { useSystemStats } from "@/features/admin/hooks";
import { useShipments } from "@/features/shipments/hooks";
import { useAuthStore } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const DONUT_COLORS = ["#10b981","#3b82f6","#f59e0b","#ef4444","#8b5cf6"];

export default function AdminOverviewPage() {
  const { user } = useAuthStore();
  const { data: stats, isLoading: statsLoading, isError: statsError, refetch: refetchStats } = useSystemStats();
  const { data: shipmentsData, isLoading: shipmentsLoading } = useShipments({ limit: 6, sortOrder: "desc" });
  const { data: deliveredData } = useShipments({ status: "DELIVERED", limit: 1 });
  const { data: inTransitData } = useShipments({ status: "IN_TRANSIT", limit: 1 });
  const { data: pendingData }   = useShipments({ status: "CREATED",    limit: 1 });
  const { data: cancelledData } = useShipments({ status: "CANCELLED",  limit: 1 });

  const shipments = shipmentsData?.shipments ?? [];

  const donutData = [
    { name: "Delivered",  value: deliveredData?.meta?.total ?? 0 },
    { name: "In Transit", value: inTransitData?.meta?.total ?? 0 },
    { name: "Pending",    value: pendingData?.meta?.total   ?? 0 },
    { name: "Cancelled",  value: cancelledData?.meta?.total ?? 0 },
  ].filter(d => d.value > 0);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {greeting}, {user?.firstName} <Hand className="size-5 inline-block align-bottom ml-1" />
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening on the platform today.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/admin/shipments">
            <Activity className="mr-2 size-4" />
            All shipments
          </Link>
        </Button>
      </div>

      {/* ── Stat cards ── */}
      {statsError ? (
        <ErrorState title="Could not load statistics" onRetry={() => refetchStats()} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          <StatCard title="Total Shipments"  value={statsLoading ? "…" : (stats?.totalShipments ?? 0).toLocaleString()}  icon={<Package className="size-5" />}  iconBg="bg-blue-500"    trend={{ value: "All time", up: true }} />
          <StatCard title="In Transit"       value={statsLoading ? "…" : (inTransitData?.meta?.total ?? 0).toLocaleString()} icon={<Clock className="size-5" />}    iconBg="bg-violet-500"  trend={{ value: "Active", up: true }} />
          <StatCard title="Delivered"        value={statsLoading ? "…" : (stats?.activeShipments ?? 0).toLocaleString()}  icon={<CheckCircle className="size-5" />} iconBg="bg-emerald-500" trend={{ value: "Completed", up: true }} />
          <StatCard title="Total Users"      value={statsLoading ? "…" : (stats?.totalUsers ?? 0).toLocaleString()}        icon={<Users className="size-5" />}     iconBg="bg-amber-500" />
          <StatCard title="Revenue"          value={statsLoading ? "…" : formatCurrency(parseFloat(stats?.totalRevenue ?? "0"))} icon={<TrendingUp className="size-5" />} iconBg="bg-pink-500" />
        </div>
      )}

      {/* ── Charts + Quick actions ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Status donut */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Shipment Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {donutData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {donutData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => v.toLocaleString()} />
                  <Legend iconSize={10} iconType="circle" formatter={(v) => <span className="text-xs">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">Loading…</div>
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {[
              { label: "Manage Users",     desc: "View and manage accounts",       icon: <Users className="size-4" />,     href: "/dashboard/admin/users",      bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
              { label: "All Shipments",    desc: "Monitor all shipments",           icon: <Package className="size-4" />,   href: "/dashboard/admin/shipments",   bg: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
              { label: "Manage Hubs",      desc: "Hub configuration",               icon: <Warehouse className="size-4" />, href: "/dashboard/admin/hubs",        bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
              { label: "Payments",         desc: "Transaction monitoring",          icon: <CreditCard className="size-4" />,href: "/dashboard/admin/payments",    bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
              { label: "Pricing Rules",    desc: "Configure delivery pricing",      icon: <TrendingUp className="size-4" />,href: "/dashboard/admin/pricing",     bg: "bg-pink-500/10 text-pink-600 dark:text-pink-400" },
              { label: "Audit Logs",       desc: "System audit history",            icon: <BarChart3 className="size-4" />, href: "/dashboard/admin/audit-logs",  bg: "bg-slate-500/10 text-slate-600 dark:text-slate-400" },
            ].map((a) => (
              <Link key={a.href} href={a.href} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors">
                <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${a.bg}`}>{a.icon}</div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{a.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{a.desc}</p>
                </div>
                <ArrowRight className="ml-auto size-3.5 text-muted-foreground shrink-0" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── Recent shipments table ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-semibold">Recent Shipments</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/admin/shipments">View all <ArrowRight className="ml-1 size-3.5" /></Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {shipmentsLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />)}
            </div>
          ) : shipments.length === 0 ? (
            <div className="py-8">
              <EmptyState
                icon={<Package className="size-6" />}
                title="No shipments yet"
                description="Shipments will appear here once customers start creating them."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tracking ID</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Sender</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Destination</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Payment</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden xl:table-cell">Date</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {shipments.map((s) => (
                    <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-semibold">{s.trackingNumber}</td>
                      <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{s.senderName}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{s.recipientCity}</td>
                      <td className="px-4 py-3"><ShipmentStatusBadge status={s.status} /></td>
                      <td className="px-4 py-3 hidden lg:table-cell"><PaymentStatusBadge status={s.paymentStatus} /></td>
                      <td className="px-4 py-3 hidden xl:table-cell text-muted-foreground text-xs">{formatDate(s.createdAt)}</td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm" className="text-xs h-7" asChild>
                          <Link href={`/dashboard/admin/shipments/${s.id}`}>View</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
