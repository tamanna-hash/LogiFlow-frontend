import type { Metadata } from "next";
export const dynamic = "force-dynamic";

import { ShipmentDetailView } from "./ShipmentDetailView";

export const metadata: Metadata = { title: "Shipment Details" };

export default async function ShipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ShipmentDetailView id={id} />;
}
