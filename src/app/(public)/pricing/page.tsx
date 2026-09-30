import type { Metadata } from "next";
import Link from "next/link";
import { Calculator, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Pricing",
  description: "LogiFlow delivery pricing — calculated based on zones, weight, and delivery type.",
};

export default function PricingPage() {
  return (
    <div className="py-16 px-4 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold">Transparent pricing</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Delivery charges are calculated server-side based on real pricing rules.
            You see the exact price before confirming your shipment.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="size-5 text-primary" />
              How pricing works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              The final delivery charge is calculated by the backend using this formula:
            </p>
            <div className="rounded-lg bg-muted p-4 font-mono text-xs">
              Total = Base Price + (Weight &gt; Base Weight ? (Weight - Base Weight) × Price Per Kg : 0) + Zone Surcharge + Delivery Type Surcharge
            </div>
            <ul className="space-y-2">
              <li className="flex gap-2">
                <span className="shrink-0 font-medium text-foreground">Base price:</span>
                Minimum charge for the route, set by pricing rules.
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 font-medium text-foreground">Weight charge:</span>
                Additional charge per kg above the base weight threshold.
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 font-medium text-foreground">Zone surcharge:</span>
                Extra charge for routes crossing specific zone pairs.
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 font-medium text-foreground">Delivery type surcharge:</span>
                Additional fee for Express or Same Day delivery.
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 flex gap-3 text-sm text-blue-800 mb-8">
          <Info className="size-5 shrink-0 mt-0.5" aria-hidden="true" />
          <p>
            Exact pricing rules are configured by the platform administrator and may vary by route.
            To get the exact price for your shipment, use the pricing calculator during shipment creation.
            You must be logged in to calculate a price.
          </p>
        </div>

        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Create a free account to get an accurate price quote for your specific route.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild>
              <Link href="/register">Create free account</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/login">Sign in to calculate price</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
