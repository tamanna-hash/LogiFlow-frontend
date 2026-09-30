"use client";

import { useState } from "react";
import { Search, MapPin, Clock, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShipmentStatusBadge } from "@/components/shared/StatusBadge";
import { usePublicTracking } from "@/features/shipments/hooks";
import { formatDateTime, SHIPMENT_STATUS_LABELS, DELIVERY_TYPE_LABELS } from "@/lib/utils";

export function TrackingSearch() {
  const [input, setInput] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  const { data, isLoading, isError, error } = usePublicTracking(
    trackingNumber,
    !!trackingNumber
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = input.trim().toUpperCase();
    if (cleaned) setTrackingNumber(cleaned);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. LF-20261001-ABCD"
            className="pl-9 h-11 text-base"
            aria-label="Tracking number"
          />
        </div>
        <Button type="submit" size="lg" loading={isLoading}>
          Track
        </Button>
      </form>

      {isError && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive" role="alert">
          {error instanceof Error ? error.message : "Tracking number not found. Please check and try again."}
        </div>
      )}

      {data && (
        <div className="space-y-4">
          {/* Summary card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="font-mono">{data.trackingNumber}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {data.originZone?.name} → {data.destinationZone?.name}
                  </p>
                </div>
                <ShipmentStatusBadge status={data.status} />
              </div>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Delivery type</dt>
                  <dd className="font-medium">{DELIVERY_TYPE_LABELS[data.deliveryType]}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Destination city</dt>
                  <dd className="font-medium">{data.recipientCity}</dd>
                </div>
                {data.currentHub && (
                  <div>
                    <dt className="text-muted-foreground">Current hub</dt>
                    <dd className="font-medium flex items-center gap-1">
                      <MapPin className="size-3.5" />
                      {data.currentHub.name}, {data.currentHub.city}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-muted-foreground">Booked on</dt>
                  <dd>{formatDateTime(data.createdAt)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Timeline */}
          {data.trackingEvents.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="size-4" />
                  Tracking history
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol
                  className="relative space-y-4 border-l border-muted ml-3"
                  aria-label="Tracking history"
                >
                  {[...data.trackingEvents].reverse().map((event, idx) => (
                    <li key={idx} className="ml-6">
                      <span className="absolute -left-3 flex size-6 items-center justify-center rounded-full bg-background border">
                        <div
                          className={`size-2 rounded-full ${
                            idx === 0 ? "bg-primary" : "bg-muted-foreground/50"
                          }`}
                        />
                      </span>
                      <p className="text-sm font-medium">
                        {SHIPMENT_STATUS_LABELS[event.status] ?? event.status}
                      </p>
                      <p className="text-xs text-muted-foreground">{event.description}</p>
                      {event.location && (
                        <p className="text-xs text-muted-foreground">📍 {event.location}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDateTime(event.createdAt)}
                      </p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!data && !isError && !isLoading && (
        <div className="flex flex-col items-center py-10 text-center text-muted-foreground">
          <Package className="size-12 mb-3 opacity-30" aria-hidden="true" />
          <p className="text-sm">Enter a tracking number above to see shipment status.</p>
        </div>
      )}
    </div>
  );
}
