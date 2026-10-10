"use client";

import Link from "next/link";
import {
  Package, CheckCircle, XCircle, Plus, Search, CreditCard,
  Bell, User, ArrowRight, Truck, Hand,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/StatCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { ShipmentStatusBadge, PaymentStatusBadge } from "@/components/shared/StatusBadge";
import { useAuthStore } from "@/lib/auth";
import { useShipments } from "@/features/shipments/hooks";
import { formatDate, formatCurrency } from "@/lib/utils";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from "@/components/animations";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

export function CustomerOverview() {
  const { user } = useAuthStore();

  // Separate queries for accurate counts by status
  const { data: allData,       isLoading: loadingAll, isError, refetch } = useShipments({ limit: 1 });
  const { data: activeData }    = useShipments({ status: "IN_TRANSIT",   limit: 1 });
  const { data: deliveredData } = useShipments({ status: "DELIVERED",    limit: 1 });
  const { data: cancelledData } = useShipments({ status: "CANCELLED",    limit: 1 });
  const { data: pendingData }   = useShipments({ status: "CREATED",      limit: 1 });
  const { data: recentData, isLoading: loadingRecent } = useShipments({ limit: 6, sortOrder: "desc" });

  const shipments = recentData?.shipments ?? [];

  const donutData = [
    { name: "Delivered",  value: deliveredData?.meta?.total ?? 0 },
    { name: "In Transit", value: activeData?.meta?.total    ?? 0 },
    { name: "Pending",    value: pendingData?.meta?.total   ?? 0 },
    { name: "Cancelled",  value: cancelledData?.meta?.total ?? 0 },
  ].filter(d => d.value > 0);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{greeting}, {user?.firstName} <Hand className="size-5 inline-block align-bottom ml-1" /></h1>
            <p className="text-sm text-muted-foreground mt-1">
              Here&apos;s what&apos;s happening with your shipments today.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/customer/shipments/new">
              <Plus className="mr-2 size-4" />
              New Shipment
            </Link>
          </Button>
        </div>
      </FadeIn>

      {/* Stat cards */}
      {isError ? (
        <ErrorState title="Could not load shipment stats" onRetry={() => refetch()} />
      ) : (
        <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StaggerItem>
            <StatCard
              title="Total Shipments"
              value={loadingAll ? "…" : (allData?.meta?.total ?? 0).toLocaleString()}
              icon={<Package className="size-5" />}
              iconBg="bg-blue-500"
              trend={{ value: "All time", up: true }}
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title="In Transit"
              value={loadingAll ? "…" : (activeData?.meta?.total ?? 0).toLocaleString()}
              icon={<Truck className="size-5" />}
              iconBg="bg-violet-500"
              subtitle="Currently moving"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title="Delivered"
              value={loadingAll ? "…" : (deliveredData?.meta?.total ?? 0).toLocaleString()}
              icon={<CheckCircle className="size-5" />}
              iconBg="bg-emerald-500"
              trend={{ value: "Completed", up: true }}
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title="Cancelled"
              value={loadingAll ? "…" : (cancelledData?.meta?.total ?? 0).toLocaleString()}
              icon={<XCircle className="size-5" />}
              iconBg="bg-red-500"
              trend={{ value: "Cancelled", up: false }}
            />
          </StaggerItem>
        </StaggerContainer>
      )}

      {/* Charts + Quick actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Donut chart */}
        <SlideUp delay={0.2}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Shipment Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {donutData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {donutData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => v.toLocaleString()} />
                    <Legend
                      iconSize={10}
                      iconType="circle"
                      formatter={(v) => <span className="text-xs">{v}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
                  {loadingAll ? "Loading…" : "No shipments yet"}
                </div>
              )}
            </CardContent>
          </Card>
        </SlideUp>

        {/* Quick actions */}
        <SlideUp delay={0.3} className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Create New Shipment",
                  desc: "Schedule a new shipment",
                  icon: <Plus className="size-4" />,
                  href: "/dashboard/customer/shipments/new",
                  bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                },
                {
                  label: "Track Shipment",
                  desc: "Real-time tracking update",
                  icon: <Search className="size-4" />,
                  href: "/track",
                  bg: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
                },
                {
                  label: "My Shipments",
                  desc: "View all shipments",
                  icon: <Package className="size-4" />,
                  href: "/dashboard/customer/shipments",
                  bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                },
                {
                  label: "Payments",
                  desc: "Payment history",
                  icon: <CreditCard className="size-4" />,
                  href: "/dashboard/customer/payments",
                  bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                },
                {
                  label: "Notifications",
                  desc: "View notifications",
                  icon: <Bell className="size-4" />,
                  href: "/dashboard/customer/notifications",
                  bg: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
                },
                {
                  label: "Profile",
                  desc: "Account settings",
                  icon: <User className="size-4" />,
                  href: "/dashboard/customer/profile",
                  bg: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
                },
              ].map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors"
                >
                  <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${a.bg}`}>
                    {a.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{a.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{a.desc}</p>
                  </div>
                  <ArrowRight className="ml-auto size-3.5 text-muted-foreground shrink-0" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </SlideUp>
      </div>

      {/* Recent shipments table */}
      <SlideUp delay={0.4}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold">Recent Shipments</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/customer/shipments">
                View all <ArrowRight className="ml-1 size-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {loadingRecent ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
                ))}
              </div>
            ) : shipments.length === 0 ? (
              <div className="py-8">
                <EmptyState
                  icon={<Package className="size-6" />}
                  title="No shipments yet"
                  description="Create your first shipment to get started."
                  action={{ label: "Create shipment", href: "/dashboard/customer/shipments/new" }}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tracking ID</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Destination</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Payment</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Amount</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden xl:table-cell">Date</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {shipments.map((s) => (
                      <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs font-semibold">{s.trackingNumber}</td>
                        <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                          {s.recipientName}, {s.recipientCity}
                        </td>
                        <td className="px-4 py-3">
                          <ShipmentStatusBadge status={s.status} />
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <PaymentStatusBadge status={s.paymentStatus} />
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell font-medium">
                          {formatCurrency(s.price)}
                        </td>
                        <td className="px-4 py-3 hidden xl:table-cell text-muted-foreground text-xs">
                          {formatDate(s.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <Button variant="ghost" size="sm" className="text-xs h-7" asChild>
                            <Link href={`/dashboard/customer/shipments/${s.id}`}>View</Link>
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
      </SlideUp>
    </div>
  );
}
