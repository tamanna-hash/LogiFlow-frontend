import type { Metadata } from "next";
import { CreateShipmentWizard } from "./CreateShipmentWizard";

export const metadata: Metadata = { title: "Create Shipment" };

export default function NewShipmentPage() {
  return <CreateShipmentWizard />;
}
