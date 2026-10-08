import type { Metadata } from "next";
import Link from "next/link";
import { Package, Truck, Zap, Clock, CheckCircle, Globe, ArrowRight, Shield, FileText, Wine, Boxes } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Services",
  description: "LogiFlow courier services — Standard, Express, and Same Day delivery across Bangladesh.",
};

const SERVICES = [
  {
    icon: <Package className="size-7" />,
    title: "Standard Delivery",
    badge: "Most Popular",
    badgeColor: "bg-blue-500/20 text-blue-500 border-blue-500/30",
    color: "from-blue-500 to-blue-600",
    desc: "Reliable door-to-door delivery across Bangladesh. Best for non-urgent shipments.",
    features: ["Available nationwide", "Full tracking from pickup to delivery", "Multiple parcel types", "bKash & card payment"],
    time: "2-4 days",
  },
  {
    icon: <Zap className="size-7" />,
    title: "Express Delivery",
    badge: "Faster",
    badgeColor: "bg-amber-500/20 text-amber-500 border-amber-500/30",
    color: "from-amber-500 to-orange-500",
    desc: "Priority handling and faster transit. Ideal for time-sensitive shipments.",
    features: ["Priority courier assignment", "Real-time status updates", "Dedicated courier handling", "Proof of delivery"],
    time: "1-2 days",
  },
  {
    icon: <Clock className="size-7" />,
    title: "Same Day Delivery",
    badge: "Urgent",
    badgeColor: "bg-red-500/20 text-red-500 border-red-500/30",
    color: "from-red-500 to-rose-600",
    desc: "Fastest option for urgent deliveries within the same city zone.",
    features: ["Same-day pickup & delivery", "Within-zone only", "Immediate assignment", "Live status every 30 min"],
    time: "Same day",
  },
  {
    icon: <Globe className="size-7" />,
    title: "Hub-to-Hub Transfer",
    badge: "Inter-City",
    badgeColor: "bg-violet-500/20 text-violet-500 border-violet-500/30",
    color: "from-violet-500 to-purple-600",
    desc: "Bulk intercity logistics between distribution hubs across Bangladesh.",
    features: ["Multi-hub routing", "Arrival confirmation", "Operations visibility", "Full audit trail"],
    time: "2-3 days",
  },
];

const PARCEL_TYPES = [
  { type: "Document",  desc: "Letters, contracts, legal papers",     icon: <FileText className="size-8" /> },
  { type: "Regular",   desc: "Consumer goods, clothing, accessories", icon: <Package className="size-8" /> },
  { type: "Fragile",   desc: "Electronics, glass, delicate items",    icon: <Wine className="size-8" /> },
  { type: "Oversized", desc: "Large furniture, equipment, machinery", icon: <Boxes className="size-8" /> },
];

export default function ServicesPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-sidebar text-sidebar-foreground py-24 px-4 sm:px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-[20%] size-[400px] rounded-full bg-primary/20 blur-[100px]" />
          <div className="absolute bottom-0 left-[10%] size-[300px] rounded-full bg-blue-600/15 blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 text-xs tracking-wider uppercase">Delivery Services</Badge>
          <h1 className="text-5xl sm:text-6xl font-extrabold">Our Services</h1>
          <p className="mt-6 text-lg text-sidebar-foreground/70 max-w-2xl mx-auto">
            Three delivery speeds and a hub-transfer network — tailored to fit every shipment requirement across Bangladesh.
          </p>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-20 px-4 sm:px-6 bg-background">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4 text-xs tracking-wider uppercase text-primary border-primary/30">What We Offer</Badge>
            <h2 className="text-4xl font-bold">Choose Your Delivery Speed</h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Every price is calculated server-side based on route, weight, and service type.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {SERVICES.map((s) => (
              <div key={s.title} className="group rounded-2xl border bg-card overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className={`h-2 bg-gradient-to-r ${s.color}`} />
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br ${s.color} text-white shadow-lg`}>
                      {s.icon}
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${s.badgeColor}`}>{s.badge}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{s.title}</h3>
                  <p className="text-sm text-muted-foreground mb-6">{s.desc}</p>
                  <div className="flex items-center gap-2 mb-6 text-sm font-semibold">
                    <Clock className="size-4 text-primary" />
                    <span>Est. delivery: <span className="text-primary">{s.time}</span></span>
                  </div>
                  <ul className="space-y-2.5">
                    {s.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm">
                        <CheckCircle className="size-4 text-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Parcel types */}
      <section className="py-20 px-4 sm:px-6 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 text-xs tracking-wider uppercase text-primary border-primary/30">What We Handle</Badge>
            <h2 className="text-3xl font-bold">Parcel Types Supported</h2>
            <p className="mt-4 text-muted-foreground">We handle every type of parcel with appropriate care.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PARCEL_TYPES.map((p) => (
              <div key={p.type} className="rounded-2xl border bg-card p-6 text-center hover:shadow-md hover:border-primary/30 transition-all">
                <div className="flex justify-center mb-4 text-primary">{p.icon}</div>
                <h4 className="font-bold mb-2">{p.type}</h4>
                <p className="text-sm text-muted-foreground">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose */}
      <section className="bg-sidebar text-sidebar-foreground py-16 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <Shield className="size-6" />,       title: "Verified Couriers",    desc: "Every courier is background-checked" },
            { icon: <CheckCircle className="size-6" />,  title: "Real-Time Tracking",   desc: "Live updates at every stage" },
            { icon: <Truck className="size-6" />,        title: "Nationwide Network",   desc: "Covering all 8 divisions" },
            { icon: <Zap className="size-6" />,          title: "Instant Pricing",      desc: "Transparent, no hidden fees" },
          ].map((item) => (
            <div key={item.title} className="flex gap-4 items-start">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary">
                {item.icon}
              </div>
              <div>
                <p className="font-bold">{item.title}</p>
                <p className="text-sm text-sidebar-foreground/60 mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 bg-background text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold">Start shipping today</h2>
          <p className="mt-4 text-muted-foreground">Create a free account and get an accurate price for your route.</p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="px-8 rounded-xl"><Link href="/register">Create Free Account</Link></Button>
            <Button size="lg" variant="outline" asChild className="px-8 rounded-xl"><Link href="/pricing">View Pricing <ArrowRight className="ml-2 size-4" /></Link></Button>
          </div>
        </div>
      </section>
    </div>
  );
}
