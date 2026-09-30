import type { Metadata } from "next";
import { CustomerOverview } from "./CustomerOverview";

export const metadata: Metadata = { title: "Customer Overview" };

export default function CustomerOverviewPage() {
  return <CustomerOverview />;
}
