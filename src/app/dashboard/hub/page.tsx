"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  Package, Truck, Warehouse, MapPin, CheckCircle, ArrowRight, Clock, Hand,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/shared/StatCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { ShipmentStatusBadge } from "@/components/shared/StatusBadge";
import { useAuthStore } from "@/lib/auth";
import { useHub } from "@/features/hubs/hooks";
import { useShipments } from "@/features/shipments/hooks";
import { useCouriers } from "@/features/couriers/hooks";
import { formatDate } from "@/lib/utils";

export default function HubOverviewPage() {
  const { user } = useAuthStore();
  const hubId = user?.hubManagerProfile?.hubId ?? "";

  const { data: hub, isError: isHubError } = useHub(hubId);
  const { data: shipmentsData, isLoading: shipmentsLoading } = useShipments({ limit: 6, sortOrder: "desc" });
  const { data: atHubData }                 = useShipments({ status: "AT_DESTINATION_HUB", limit: 1 });
  const { data: inTransitData }             = useShipments({ status: "IN_TRANSIT",          limit: 1 });
  const { data: couriersData }              = useCouriers({ limit: 1 });
  const { data: availableCouriers }         = useCouriers({ availability: "AVAILABLE", limit: 1 });

  const shipments = shipmentsData?.shipments ?? [];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  if (isHubError) return <ErrorState title="Could not load hub data" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{greeting}, {user?.firstName} <Hand className="size-5 inline-block align-bottom ml-1" /></h1>
          <p className="text-sm text-muted-foreground mt-1">
            {hub ? `Managing ${hub.name} — ${hub.city}` : "Hub management dashboard"}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/hub/shipments"><Package className="mr-2 size-4" />Hub Shipments</Link>
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Shipments at Hub"       value={(hub?._count?.shipmentsCurrently ?? 0).toLocaleString()} icon={<Package className="size-5" />}      iconBg="bg-blue-500"    subtitle="Currently present" />
        <StatCard title="At Destination Hub"     value={(atHubData?.meta?.total           ?? 0).toLocaleString()} icon={<Clock className="size-5" />}          iconBg="bg-amber-500"   subtitle="Awaiting dispatch" />
        <StatCard title="In Transit"             value={(inTransitData?.meta?.total        ?? 0).toLocaleString()} icon={<Truck className="size-5" />}          iconBg="bg-violet-500"  subtitle="Moving" />
        <StatCard title="Available Couriers"     value={(availableCouriers?.meta?.total    ?? 0).toLocaleString()} icon={<CheckCircle className="size-5" />}    iconBg="bg-emerald-500" subtitle={`of ${couriersData?.meta?.total ?? 0} total`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Hub info card */}
        {hub && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Warehouse className="size-4" />
                Hub Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Status</span>
                <Badge variant={hub.isActive ? "success" : "destructive"}>{hub.isActive ? "Active" : "Inactive"}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Code</span>
                <span className="font-mono text-xs font-semibold">{hub.code}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">City</span>
                <span className="text-sm font-medium">{hub.city}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Zones</span>
                <span className="text-sm font-medium">{hub.zones?.length ?? 0}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Address</span>
                <p className="text-xs mt-0.5">{hub.address}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick actions */}
        <Card className={hub ? "lg:col-span-2" : "lg:col-span-3"}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {[
              { label: "Hub Shipments",  desc: "View & manage shipments",    icon: <Package className="size-4" />,   href: "/dashboard/hub/shipments",  bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
              { label: "Couriers",       desc: "Manage courier availability", icon: <Truck className="size-4" />,    href: "/dashboard/hub/couriers",   bg: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
              { label: "Transfers",      desc: "Inbound & outbound",          icon: <MapPin className="size-4" />,   href: "/dashboard/hub/transfers",  bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
              { label: "Profile",        desc: "Account settings",            icon: <CheckCircle className="size-4" />, href: "/dashboard/hub/profile", bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
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

      {/* Shipments table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-semibold">Recent Hub Shipments</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/hub/shipments">View all <ArrowRight className="ml-1 size-3.5" /></Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {shipmentsLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />)}
            </div>
          ) : shipments.length === 0 ? (
            <div className="py-8">
              <EmptyState
                icon={<Package className="size-6" />}
                title="No shipments yet"
                description="Hub shipments will appear here."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tracking ID</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Recipient</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Destination</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Date</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {shipments.map((s) => (
                    <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-semibold">{s.trackingNumber}</td>
                      <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{s.recipientName}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{s.recipientCity}</td>
                      <td className="px-4 py-3"><ShipmentStatusBadge status={s.status} /></td>
                      <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">{formatDate(s.createdAt)}</td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm" className="text-xs h-7" asChild>
                          <Link href={`/dashboard/hub/shipments/${s.id}`}>View</Link>
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
