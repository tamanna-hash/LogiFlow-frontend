import type { Metadata } from "next";
import { TrackingSearch } from "./TrackingSearch";

export const metadata: Metadata = {
  title: "Track Shipment",
  description: "Track your LogiFlow shipment by tracking number.",
};

export default function TrackPage() {
  return (
    <div className="py-16 px-4 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold">Track your shipment</h1>
          <p className="mt-3 text-muted-foreground">
            Enter a tracking number to see the latest status and location.
          </p>
        </div>
        <TrackingSearch />
      </div>
    </div>
  );
}
