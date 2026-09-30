import type { Metadata } from "next";
import { ShipmentDetailView } from "./ShipmentDetailView";

export const metadata: Metadata = { title: "Shipment Details" };

export default function ShipmentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <ShipmentDetailView id={params.id} />;
}
