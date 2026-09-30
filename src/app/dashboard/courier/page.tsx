import type { Metadata } from "next";
import { CourierOverview } from "./CourierOverview";

export const metadata: Metadata = { title: "Courier Overview" };

export default function CourierOverviewPage() {
  return <CourierOverview />;
}
