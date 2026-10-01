"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { Users, Package, Warehouse, CreditCard, TrendingUp, CheckCircle, Clock, BarChart3 } from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCardSkeleton } from "@/components/shared/Skeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSystemStats } from "@/features/admin/hooks";
import { formatCurrency } from "@/lib/utils";

export default function AdminOverviewPage() {
  const { data: stats, isLoading, isError, refetch } = useSystemStats();

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Overview" description="Platform-wide statistics and management." />

      {isError ? (
        <ErrorState title="Could not load statistics" onRetry={() => refetch()} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : stats ? (
            <>
              <MetricCard title="Total users" value={stats.totalUsers.toLocaleString()} icon={<Users className="size-5" />} />
              <MetricCard title="Total shipments" value={stats.totalShipments.toLocaleString()} icon={<Package className="size-5" />} />
              <MetricCard title="Active shipments" value={stats.activeShipments.toLocaleString()} icon={<Clock className="size-5" />} subtitle="In transit" />
              <MetricCard title="Delivered today" value={stats.deliveredToday.toLocaleString()} icon={<CheckCircle className="size-5" />} />
              <MetricCard title="Total revenue" value={formatCurrency(parseFloat(stats.totalRevenue))} icon={<TrendingUp className="size-5" />} />
              <MetricCard title="Pending payments" value={stats.pendingPayments.toLocaleString()} icon={<CreditCard className="size-5" />} />
              <MetricCard title="Total hubs" value={stats.hubs.total} icon={<Warehouse className="size-5" />} />
              <MetricCard title="Active hubs" value={stats.hubs.active} icon={<BarChart3 className="size-5" />} />
            </>
          ) : null}
        </div>
      )}

      {/* Quick links */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Manage users", href: "/dashboard/admin/users", icon: <Users className="size-4" /> },
          { label: "All shipments", href: "/dashboard/admin/shipments", icon: <Package className="size-4" /> },
          { label: "Manage hubs", href: "/dashboard/admin/hubs", icon: <Warehouse className="size-4" /> },
          { label: "Payment monitoring", href: "/dashboard/admin/payments", icon: <CreditCard className="size-4" /> },
          { label: "Pricing rules", href: "/dashboard/admin/pricing", icon: <TrendingUp className="size-4" /> },
          { label: "Audit logs", href: "/dashboard/admin/audit-logs", icon: <BarChart3 className="size-4" /> },
        ].map((link) => (
          <Card key={link.href} className="hover:bg-accent transition-colors">
            <CardContent className="p-4">
              <Button variant="ghost" asChild className="w-full justify-start h-auto p-0">
                <Link href={link.href} className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                    {link.icon}
                  </div>
                  <span className="font-medium">{link.label}</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
