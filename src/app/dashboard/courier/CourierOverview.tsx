"use client";

import Link from "next/link";
import {
  Truck, CheckCircle, DollarSign, ClipboardList, User, ArrowRight, Package, Hand,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/shared/StatCard";
import { AssignmentStatusBadge, CourierAvailabilityBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAuthStore } from "@/lib/auth";
import { useAssignments, useUpdateAvailability } from "@/features/couriers/hooks";
import { useEarnings } from "@/features/couriers/hooks";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from "@/components/animations";

export function CourierOverview() {
  const { user } = useAuthStore();
  const availability = user?.courierProfile?.availability;

  const { data: activeAssignments }    = useAssignments({ status: "ACTIVE",    limit: 1 });
  const { data: completedAssignments } = useAssignments({ status: "COMPLETED", limit: 1 });
  const { data: recentAssignments, isLoading } = useAssignments({ limit: 6, status: "ACTIVE" });
  const { data: earningsData }         = useEarnings({ limit: 5 });
  const { mutate: updateAvailability, isPending } = useUpdateAvailability();

  const assignments = recentAssignments?.assignments ?? [];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  // Rough earnings estimate from recent deliveries
  const totalEarnings = (earningsData?.deliveries ?? [])
    .reduce((sum, d) => sum + (d.shipment?.price ?? 0), 0);

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{greeting}, {user?.firstName} <Hand className="size-5 inline-block align-bottom ml-1" /></h1>
            <p className="text-sm text-muted-foreground mt-1">Your delivery assignments and performance.</p>
          </div>
          <div className="flex items-center gap-2">
            {availability && <CourierAvailabilityBadge availability={availability} />}
            {availability !== "ON_DELIVERY" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateAvailability(availability === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE")}
                loading={isPending}
              >
                {availability === "AVAILABLE" ? "Go Offline" : "Go Online"}
              </Button>
            )}
          </div>
        </div>
      </FadeIn>

      {/* Stat cards */}
      <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StaggerItem>
          <StatCard title="Active Assignments"   value={(activeAssignments?.meta?.total     ?? 0).toLocaleString()} icon={<Truck className="size-5" />}         iconBg="bg-blue-500"    subtitle="Currently active" />
        </StaggerItem>
        <StaggerItem>
          <StatCard title="Total Deliveries"     value={(user?.courierProfile?.totalDeliveries ?? 0).toLocaleString()} icon={<CheckCircle className="size-5" />} iconBg="bg-emerald-500" subtitle="All time" />
        </StaggerItem>
        <StaggerItem>
          <StatCard title="Completed"            value={(completedAssignments?.meta?.total  ?? 0).toLocaleString()} icon={<ClipboardList className="size-5" />}  iconBg="bg-violet-500"  subtitle="This period" />
        </StaggerItem>
        <StaggerItem>
          <StatCard title="Est. Earnings"        value={formatCurrency(totalEarnings)}                              icon={<DollarSign className="size-5" />}      iconBg="bg-amber-500"   subtitle="Recent deliveries" />
        </StaggerItem>
      </StaggerContainer>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Courier status card */}
        <SlideUp delay={0.2}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="size-4" />
                Your Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Availability</span>
                {availability ? <CourierAvailabilityBadge availability={availability} /> : <span className="text-xs text-muted-foreground">—</span>}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Vehicle</span>
                <span className="text-sm font-medium">{user?.courierProfile?.vehicleType ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Vehicle No.</span>
                <span className="font-mono text-xs">{user?.courierProfile?.vehicleNumber ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total Deliveries</span>
                <span className="text-sm font-bold">{user?.courierProfile?.totalDeliveries ?? 0}</span>
              </div>
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
                { label: "My Assignments", desc: "View active assignments",   icon: <ClipboardList className="size-4" />, href: "/dashboard/courier/assignments", bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
                { label: "Earnings",       desc: "Delivery history & pay",    icon: <DollarSign className="size-4" />,    href: "/dashboard/courier/earnings",    bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
                { label: "Notifications",  desc: "View notifications",        icon: <CheckCircle className="size-4" />,   href: "/dashboard/customer/notifications", bg: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
                { label: "Profile",        desc: "Account settings",          icon: <User className="size-4" />,          href: "/dashboard/courier/profile",     bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
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
        </SlideUp>
      </div>

      {/* Active assignments table */}
      <SlideUp delay={0.4}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold">Active Assignments</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/courier/assignments">View all <ArrowRight className="ml-1 size-3.5" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />)}
              </div>
            ) : assignments.length === 0 ? (
              <div className="py-8">
                <EmptyState icon={<Package className="size-6" />} title="No active assignments" description="Check back when new assignments are assigned." />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tracking ID</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Type</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Recipient</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Assigned</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((a) => (
                      <tr key={a.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs font-semibold">{a.shipment.trackingNumber}</td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <Badge variant="outline" className="text-xs">{a.type}</Badge>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">
                          {a.shipment.recipientName}, {a.shipment.recipientCity}
                        </td>
                        <td className="px-4 py-3"><AssignmentStatusBadge status={a.status} /></td>
                        <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">{formatDateTime(a.assignedAt)}</td>
                        <td className="px-4 py-3">
                          <Button variant="ghost" size="sm" className="text-xs h-7" asChild>
                            <Link href={`/dashboard/courier/assignments/${a.id}`}>View</Link>
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
