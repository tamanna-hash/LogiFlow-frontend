import type { Metadata } from "next";
import { ShipmentsList } from "./ShipmentsList";

export const metadata: Metadata = { title: "My Shipments" };

export default function ShipmentsPage() {
  return <ShipmentsList />;
}
