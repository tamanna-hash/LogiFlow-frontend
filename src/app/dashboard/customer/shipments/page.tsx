import type { Metadata } from "next";
import { Suspense } from "react";
import { ShipmentsList } from "./ShipmentsList";

export const metadata: Metadata = { title: "My Shipments" };
export const dynamic = "force-dynamic";

export default function ShipmentsPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" />}>
      <ShipmentsList />
    </Suspense>
  );
}
