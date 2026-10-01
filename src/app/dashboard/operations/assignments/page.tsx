"use client";

export const dynamic = "force-dynamic";

import { ClipboardList } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

export default function OperationsAssignmentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Assignment Management" description="Manage courier assignments for shipments." />
      <Card>
        <CardContent className="py-12">
          <EmptyState
            icon={<ClipboardList className="size-6" />}
            title="Manage assignments from shipments"
            description="To assign a courier to a shipment, go to the shipment detail page and use the Assign Courier action."
            action={{ label: "View shipments", href: "/dashboard/operations/shipments" }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
