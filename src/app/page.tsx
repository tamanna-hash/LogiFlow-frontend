import Link from "next/link";
import { Package, Truck, MapPin, Shield, Clock, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { APP_NAME, APP_DESCRIPTION } from "@/config";
import type { Metadata } from "next";
import { PublicNav } from "@/components/shared/nav/PublicNav";

export const metadata: Metadata = {
  title: `${APP_NAME} — Courier & Logistics Management`,
  description: APP_DESCRIPTION,
};

const FEATURES = [
  {
    icon: <Package className="size-6 text-primary" />,
    title: "Easy shipment booking",
    description: "Create shipments with full sender and recipient details, parcel specifications, and real-time pricing.",
  },
  {
    icon: <MapPin className="size-6 text-primary" />,
    title: "Real-time tracking",
    description: "Track any shipment by tracking number. See every status update from pickup to delivery.",
  },
  {
    icon: <Truck className="size-6 text-primary" />,
    title: "Managed courier network",
    description: "A structured courier assignment and management system across all delivery hubs.",
  },
  {
    icon: <Shield className="size-6 text-primary" />,
    title: "Secure payments",
    description: "Pay via bKash with server-side verification. Your payment is confirmed by the backend, not the browser.",
  },
  {
    icon: <Clock className="size-6 text-primary" />,
    title: "Multiple delivery speeds",
    description: "Standard, Express, and Same Day delivery options priced accurately at booking time.",
  },
  {
    icon: <CheckCircle className="size-6 text-primary" />,
    title: "End-to-end visibility",
    description: "From the customer's booking to the courier's delivery confirmation — complete operational visibility.",
  },
];

function Footer() {
  return (
    <footer className="border-t bg-muted/30 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mt-8 border-t pt-8 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} LogiFlow. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />
      <main id="main-content">
        {/* Hero */}
        <section className="bg-gradient-to-b from-blue-50 to-white py-20 px-4 sm:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              <Package className="size-4" />
              Courier &amp; Logistics Management
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
              Ship smarter with{" "}
              <span className="text-primary">LogiFlow</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              Bangladesh&apos;s structured logistics platform. Book shipments, assign couriers,
              track deliveries, and manage hubs — all in one place.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/register">
                  Get started free
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/track">Track a shipment</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-4 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Everything logistics needs</h2>
              <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
                From customer booking to final delivery — LogiFlow connects every step of the logistics chain.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <Card key={f.title}>
                  <CardContent className="p-6">
                    <div className="mb-4">{f.icon}</div>
                    <h3 className="font-semibold mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary py-16 px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-primary-foreground">
              Ready to streamline your logistics?
            </h2>
            <p className="mt-4 text-primary-foreground/80">
              Create a free account and start shipping today.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/register">Create free account</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-primary-foreground border-primary-foreground/50 hover:bg-primary-foreground/10" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
