"use client";

export const dynamic = "force-dynamic";

import { Settings, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { listPricingRules } from "@/features/pricing/api";
import { formatCurrency } from "@/lib/utils";

export default function AdminPricingPage() {
  const { data: rules, isLoading, isError, refetch } = useQuery({
    queryKey: ["pricing", "rules"],
    queryFn: listPricingRules,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Pricing Rules" description="Manage delivery pricing rules.">
        <Button disabled>
          <Plus className="mr-2 size-4" />
          New rule
        </Button>
      </PageHeader>

      <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800">
        Pricing rule creation is available via the API. UI form coming soon.
      </div>

      <Card>
        <CardContent className="p-0">
          {isError ? (
            <div className="p-6"><ErrorState title="Could not load pricing rules" onRetry={() => refetch()} /></div>
          ) : isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-md bg-muted" />
              ))}
            </div>
          ) : !rules || rules.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={<Settings className="size-6" />} title="No pricing rules" description="Configure pricing rules to calculate delivery charges." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Base price</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Per kg</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule) => (
                    <tr key={rule.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{rule.name}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(rule.basePrice)}</td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell">{formatCurrency(rule.pricePerKg)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                        {rule.deliveryType ?? "All"} · {rule.parcelType ?? "All"}
                      </td>
                      <td className="px-4 py-3">
                        {rule.isDefault && <Badge variant="secondary">Default</Badge>}
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
