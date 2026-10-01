"use client";

export const dynamic = "force-dynamic";

import { MapPin } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent } from "@/components/ui/card";

export default function HubTransfersPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Hub Transfers" description="Manage shipment transfers in and out of your hub." />
      <Card>
        <CardContent className="py-12">
          <EmptyState
            icon={<MapPin className="size-6" />}
            title="Transfer management"
            description="To transfer a shipment to another hub, go to the shipment detail page and use the Transfer action."
            action={{ label: "View hub shipments", href: "/dashboard/hub/shipments" }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
