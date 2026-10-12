import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionReveal, StaggerReveal, StaggerChild } from "@/components/home/SectionReveal";

const STEPS = [
  {
    num: "01",
    title: "Book",
    desc: "Create a shipment with sender, recipient and parcel details. Get an instant price quote.",
  },
  {
    num: "02",
    title: "Pickup",
    desc: "A verified courier is assigned and picks up your parcel from your specified address.",
  },
  {
    num: "03",
    title: "Transit",
    desc: "Your shipment moves through our hub network with real-time tracking at every stage.",
  },
  {
    num: "04",
    title: "Delivery",
    desc: "Confirmed delivery with proof. Payment verified server-side — not just on the client.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 px-4 sm:px-6 bg-background">
      <div className="mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          <SectionReveal>
            <Badge variant="outline" className="mb-4 text-xs tracking-wider uppercase text-primary border-primary/30">
              How it works
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
              Fast. Simple.<br />Reliable.
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Discover how our step-by-step delivery process works — no confusion, no delays.
              From booking to delivery confirmation in four simple steps.
            </p>
            <Button asChild className="mt-8 rounded-full px-6" size="sm">
              <Link href="/register">Book your first shipment</Link>
            </Button>
          </SectionReveal>

          <StaggerReveal className="grid grid-cols-2 gap-4">
            {STEPS.map((step, i) => (
              <StaggerChild key={step.num}>
                <div className="group rounded-2xl border bg-card p-5 hover:border-primary/40 hover:shadow-md transition-all h-full">
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-3xl font-black text-primary/20 leading-none">{step.num}</p>
                    {i === 0 && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        Start here
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold mb-2">{step.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </StaggerChild>
            ))}
          </StaggerReveal>

        </div>
      </div>
    </section>
  );
}
