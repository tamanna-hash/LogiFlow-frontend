import type { Metadata } from "next";
import Link from "next/link";
import { Calculator, CheckCircle, ArrowRight, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Pricing",
  description: "LogiFlow delivery pricing — calculated based on zones, weight, and delivery type.",
};

const PLANS = [
  {
    name: "Starter Plan",
    price: "৳80",
    unit: "/delivery",
    desc: "Best for occasional senders",
    color: "border-border",
    headerColor: "bg-muted/50",
    features: [
      "Up to 3 deliveries per month",
      "Real-time tracking",
      "Standard delivery only",
      "bKash payment",
      "Email support",
    ],
    cta: "Get Started",
    ctaVariant: "outline" as const,
    highlight: false,
  },
  {
    name: "Business Plan",
    price: "৳65",
    unit: "/delivery",
    desc: "Best for shops & eCommerce",
    color: "border-primary",
    headerColor: "bg-primary",
    features: [
      "Up to 50 deliveries/month",
      "Real-time tracking & notifications",
      "Scheduled & recurring pickup",
      "Merchant dashboard access",
      "Priority support",
      "Express & Same Day eligible",
    ],
    cta: "Start Free Trial",
    ctaVariant: "default" as const,
    highlight: true,
  },
  {
    name: "Enterprise Plan",
    price: "Custom",
    unit: "pricing",
    desc: "For high-volume operations",
    color: "border-border",
    headerColor: "bg-muted/50",
    features: [
      "Unlimited deliveries",
      "API & webhook integration",
      "Dedicated account manager",
      "Nationwide delivery support",
      "Hub-to-hub routing",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    ctaVariant: "outline" as const,
    highlight: false,
  },
];

const FORMULA_STEPS = [
  { label: "Base Price",              desc: "Minimum charge for the route based on zone pair" },
  { label: "Weight Charge",           desc: "(Weight − Base Weight) × Price Per Kg — only above threshold" },
  { label: "Zone Surcharge",          desc: "Additional fee for specific zone pair combinations" },
  { label: "Delivery Type Surcharge", desc: "Extra fee for Express or Same Day deliveries" },
];

export default function PricingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-sidebar text-sidebar-foreground py-24 px-4 sm:px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-[30%] size-[400px] rounded-full bg-primary/20 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 text-xs tracking-wider uppercase">Transparent Pricing</Badge>
          <h1 className="text-5xl sm:text-6xl font-extrabold">
            Affordable Plans<br />
            <span className="text-primary">for Every Parcel</span>
          </h1>
          <p className="mt-6 text-lg text-sidebar-foreground/70 max-w-2xl mx-auto">
            From personal deliveries to high-volume shipments, we have the right pricing for you. All prices calculated server-side — no hidden fees.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="py-20 px-4 sm:px-6 bg-background">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border-2 ${plan.color} overflow-hidden flex flex-col ${plan.highlight ? "shadow-2xl shadow-primary/20 scale-105" : ""}`}
              >
                {plan.highlight && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-white text-primary text-xs font-bold">Most Popular</Badge>
                  </div>
                )}
                {/* Header */}
                <div className={`${plan.headerColor} p-8 ${plan.highlight ? "text-primary-foreground" : ""}`}>
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${plan.highlight ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{plan.name}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black">{plan.price}</span>
                    <span className={`text-sm mb-1 ${plan.highlight ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{plan.unit}</span>
                  </div>
                  <p className={`text-sm mt-2 ${plan.highlight ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{plan.desc}</p>
                </div>
                {/* Features */}
                <div className="bg-card p-8 flex-1 flex flex-col">
                  <ul className="space-y-3 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm">
                        <CheckCircle className="size-4 text-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button variant={plan.ctaVariant} className="w-full mt-8 rounded-xl" asChild>
                    <Link href="/register">{plan.cta}</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            All prices are indicative. Exact charges are calculated at booking time based on your specific route and weight.
          </p>
        </div>
      </section>

      {/* Formula */}
      <section className="py-20 px-4 sm:px-6 bg-muted/30">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 text-xs tracking-wider uppercase text-primary border-primary/30">How It&apos;s Calculated</Badge>
            <h2 className="text-3xl font-bold">Transparent Pricing Formula</h2>
          </div>
          <div className="rounded-2xl border bg-card p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Calculator className="size-5" />
              </div>
              <h3 className="font-bold text-lg">Pricing Formula</h3>
            </div>
            <div className="rounded-xl bg-muted p-4 font-mono text-sm mb-6 overflow-x-auto">
              Total = Base Price + Weight Charge + Zone Surcharge + Delivery Type Surcharge
            </div>
            <div className="space-y-4">
              {FORMULA_STEPS.map((step, i) => (
                <div key={step.label} className="flex gap-4">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{step.label}</p>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 flex gap-3 text-sm">
            <Zap className="size-5 shrink-0 mt-0.5 text-primary" />
            <p className="text-muted-foreground">
              Exact pricing rules are configured by the platform administrator and may vary by route. To get the exact price for your shipment, use the pricing calculator during shipment creation.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 bg-background text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold">Get an accurate quote now</h2>
          <p className="mt-4 text-muted-foreground">Create a free account and calculate the exact price for your route.</p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="px-8 rounded-xl"><Link href="/register">Create Free Account <ArrowRight className="ml-2 size-4" /></Link></Button>
            <Button size="lg" variant="outline" asChild className="px-8 rounded-xl"><Link href="/services">View Services</Link></Button>
          </div>
        </div>
      </section>
    </div>
  );
}
