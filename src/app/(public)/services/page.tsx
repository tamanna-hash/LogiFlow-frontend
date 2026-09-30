import type { Metadata } from "next";
import { Package, Truck, Zap, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Services",
  description: "LogiFlow courier services — Standard, Express, and Same Day delivery across Bangladesh.",
};

const SERVICES = [
  {
    icon: <Package className="size-6" />,
    title: "Standard Delivery",
    badge: "Most popular",
    badgeVariant: "default" as const,
    description: "Reliable door-to-door delivery across Bangladesh. Best for non-urgent shipments.",
    features: [
      "Available nationwide",
      "Full tracking from pickup to delivery",
      "Multiple parcel types supported",
      "bKash payment",
    ],
  },
  {
    icon: <Zap className="size-6" />,
    title: "Express Delivery",
    badge: "Faster",
    badgeVariant: "warning" as const,
    description: "Priority handling and faster transit times. Ideal for time-sensitive shipments.",
    features: [
      "Priority assignment",
      "Real-time tracking updates",
      "Dedicated courier handling",
      "Delivery confirmation with proof",
    ],
  },
  {
    icon: <Clock className="size-6" />,
    title: "Same Day Delivery",
    badge: "Urgent",
    badgeVariant: "destructive" as const,
    description: "Fastest option for urgent deliveries within the same city zone.",
    features: [
      "Same-day pickup and delivery",
      "Within-zone only",
      "Immediate courier assignment",
      "Live status updates",
    ],
  },
];

const PARCEL_TYPES = [
  { type: "Document", desc: "Letters, legal documents, contracts" },
  { type: "Regular", desc: "Standard consumer goods, clothing, accessories" },
  { type: "Fragile", desc: "Electronics, glassware, delicate items" },
  { type: "Oversized", desc: "Large items, furniture parts, equipment" },
];

export default function ServicesPage() {
  return (
    <div className="py-16 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold">Our services</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Three delivery speeds to fit every shipment requirement.
            All prices are calculated server-side based on zones and weight.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-16">
          {SERVICES.map((s) => (
            <Card key={s.title} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {s.icon}
                  </div>
                  <Badge variant={s.badgeVariant}>{s.badge}</Badge>
                </div>
                <CardTitle className="mt-3">{s.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{s.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {s.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <div className="size-1.5 rounded-full bg-primary shrink-0" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">Parcel types supported</h2>
          <p className="mt-2 text-muted-foreground">We handle a variety of parcel types with appropriate care.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PARCEL_TYPES.map((p) => (
            <div key={p.type} className="rounded-lg border p-4">
              <p className="font-semibold">{p.type}</p>
              <p className="text-sm text-muted-foreground mt-1">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
