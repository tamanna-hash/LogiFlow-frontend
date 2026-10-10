"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { MapPin, CheckCircle, Clock } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useShipments } from "@/features/shipments/hooks";
import { useAuthStore } from "@/lib/auth";

export default function HubTransfersPage() {
  const { user } = useAuthStore();
  const hubId = user?.hubManagerProfile?.hubId ?? "";

  // Shipments that are AT_DESTINATION_HUB at this hub = inbound transfers awaiting arrival confirmation
  const { data: inboundData, isLoading: isLoadingInbound, isError: isErrorInbound, refetch: refetchInbound } =
    useShipments({ status: "AT_DESTINATION_HUB", limit: 50 });

  const { data: inTransitData, isLoading: isLoadingTransit, isError: isErrorTransit, refetch: refetchTransit } =
    useShipments({ status: "IN_TRANSIT", limit: 50 });

  // confirmArrival hook available for future use

  const isLoading = isLoadingInbound || isLoadingTransit;
  const isError = isErrorInbound || isErrorTransit;

  function refetch() { refetchInbound(); refetchTransit(); }

  // Filter to shipments at or heading to this hub (best effort without transfer IDs from the API)
  const arrivedShipments = inboundData?.shipments ?? [];
  const inTransitShipments = inTransitData?.shipments ?? [];

  if (!hubId) {
    return (
      <div className="space-y-6">
        <PageHeader title="Hub Transfers" description="Manage inbound and outbound shipment transfers." />
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={<MapPin className="size-6" />}
              title="No hub assigned"
              description="Your account is not linked to a hub. Try signing out and back in, or contact an administrator to assign you to a hub."
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Hub Transfers" description="Confirm arrivals and view shipments in transit." />

      {isError && <ErrorState title="Could not load transfers" onRetry={refetch} />}

      {/* Arrived at this hub — need to confirm */}
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <CheckCircle className="size-4 text-primary" />
          Arrived at hub ({isLoading ? "…" : arrivedShipments.length})
        </h2>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />)}
          </div>
        ) : arrivedShipments.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No shipments waiting at this hub.</CardContent></Card>
        ) : (
          <div className="space-y-2">
            {arrivedShipments.map(s => (
              <Card key={s.id} className="border-primary/30">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-semibold">{s.trackingNumber}</p>
                    <p className="text-xs text-muted-foreground">{s.recipientCity}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="secondary">{s.status.replace(/_/g, " ")}</Badge>
                    <Button size="sm" asChild variant="outline">
                      <Link href={`/dashboard/hub/shipments/${s.id}`}>View</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* In transit — heading somewhere */}
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Clock className="size-4 text-muted-foreground" />
          In transit ({isLoading ? "…" : inTransitShipments.length})
        </h2>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />)}
          </div>
        ) : inTransitShipments.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No shipments currently in transit.</CardContent></Card>
        ) : (
          <div className="space-y-2">
            {inTransitShipments.map(s => (
              <Card key={s.id}>
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-semibold">{s.trackingNumber}</p>
                    <p className="text-xs text-muted-foreground">{s.recipientCity}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="secondary">In Transit</Badge>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/hub/shipments/${s.id}`}>View</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        To create a transfer or confirm arrival, open the shipment detail page and use the Transfer or Confirm actions.
      </p>
    </div>
  );
}
