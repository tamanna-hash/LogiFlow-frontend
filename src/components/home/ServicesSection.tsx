import Link from "next/link";
import { Package, Zap, Clock, Globe, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionReveal, StaggerReveal, StaggerChild } from "@/components/home/SectionReveal";

const SERVICES = [
  {
    icon: <Package className="size-6" />,
    label: "Standard Delivery",
    desc: "Reliable door-to-door across Bangladesh",
    color: "from-blue-500 to-blue-600",
    href: "/register",
    cta: "Book now",
  },
  {
    icon: <Zap className="size-6" />,
    label: "Express Delivery",
    desc: "Priority handling, faster transit",
    color: "from-amber-500 to-orange-500",
    href: "/register",
    cta: "Book now",
  },
  {
    icon: <Clock className="size-6" />,
    label: "Same Day Delivery",
    desc: "Pickup and delivery on the same day",
    color: "from-emerald-500 to-teal-500",
    href: "/register",
    cta: "Book now",
  },
  {
    icon: <Globe className="size-6" />,
    label: "Hub-to-Hub Transfer",
    desc: "Intercity logistics between hubs",
    color: "from-violet-500 to-purple-600",
    href: "/services",
    cta: "Learn more",
  },
];

export function ServicesSection() {
  return (
    <section className="py-20 px-4 sm:px-6 bg-muted/30">
      <div className="mx-auto max-w-7xl">

        <SectionReveal className="text-center mb-14">
          <Badge variant="outline" className="mb-4 text-xs tracking-wider uppercase text-primary border-primary/30">
            Our Services
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold">Popular Logistics Services</h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            From same-day urgent deliveries to nationwide hub transfers — we have the right service for every need.
          </p>
        </SectionReveal>

        <StaggerReveal className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s) => (
            <StaggerChild key={s.label}>
              <Link
                href={s.href}
                className="group relative overflow-hidden rounded-2xl border bg-card p-6 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full"
              >
                <div className={`inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} text-white mb-5 shadow-lg`}>
                  {s.icon}
                </div>
                <h3 className="text-base font-bold mb-2">{s.label}</h3>
                <p className="text-sm text-muted-foreground flex-1">{s.desc}</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary">{s.cta}</span>
                  <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-200">
                    <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-[0.04] bg-gradient-to-br ${s.color} transition-opacity pointer-events-none`} />
              </Link>
            </StaggerChild>
          ))}
        </StaggerReveal>

        <SectionReveal className="text-center mt-10">
          <Link href="/services" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
            View all services <ArrowRight className="size-4" />
          </Link>
        </SectionReveal>

      </div>
    </section>
  );
}
