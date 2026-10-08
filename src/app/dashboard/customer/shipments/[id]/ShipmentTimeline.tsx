"use client";

import { Clock, CheckCircle, XCircle, AlertCircle, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useShipmentTracking } from "@/features/shipments/hooks";
import { SHIPMENT_STATUS_LABELS } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils";
import type { ShipmentStatus } from "@/types";

const STATUS_ICONS: Partial<Record<ShipmentStatus, React.ReactNode>> = {
  DELIVERED: <CheckCircle className="size-4 text-emerald-600" />,
  CANCELLED: <XCircle className="size-4 text-destructive" />,
  DELIVERY_FAILED: <AlertCircle className="size-4 text-amber-600" />,
  RETURN_INITIATED: <AlertCircle className="size-4 text-amber-600" />,
};

export function ShipmentTimeline({ shipmentId }: { shipmentId: string }) {
  const { data: events, isLoading } = useShipmentTracking(shipmentId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tracking timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="size-8 animate-pulse rounded-full bg-muted" />
                <div className="space-y-1 flex-1">
                  <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!events || events.length === 0) {
    return null;
  }

  // Most recent first
  const sorted = [...events].reverse();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="size-4" />
          Tracking timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-4 border-l border-muted ml-3" aria-label="Tracking timeline">
          {sorted.map((event, idx) => (
            <li key={idx} className="ml-6">
              <span className="absolute -left-3 flex size-6 items-center justify-center rounded-full bg-background border">
                {STATUS_ICONS[event.status] ?? (
                  <div className={`size-2 rounded-full ${idx === 0 ? "bg-primary" : "bg-muted-foreground"}`} />
                )}
              </span>
              <div>
                <p className="text-sm font-medium">
                  {SHIPMENT_STATUS_LABELS[event.status] ?? event.status}
                </p>
                <p className="text-xs text-muted-foreground">{event.description}</p>
                {event.location && (
                  <p className="text-xs text-muted-foreground inline-flex items-center gap-1"><MapPin className="size-3" /> {event.location}</p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDateTime(event.createdAt)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
