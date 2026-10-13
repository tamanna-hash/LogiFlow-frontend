import Link from "next/link";
import { DivisionMap } from "@/components/home/DivisionMap";
import { MapPin, CheckCircle, Shield, Clock, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroReveal, SectionReveal } from "@/components/home/SectionReveal";

const PARTNERS = [
  { name: "bKash",       color: "text-pink-600 dark:text-pink-400",   letter: "b" },
  { name: "BRAC Bank",   color: "text-blue-700 dark:text-blue-400",   letter: "B" },
  { name: "Dutch Bangla",color: "text-green-700 dark:text-green-400", letter: "D" },
  { name: "City Bank",   color: "text-red-600 dark:text-red-400",     letter: "C" },
  { name: "ShopUp",      color: "text-violet-600 dark:text-violet-400", letter: "S" },
];

const TRUST_ITEMS = [
  { icon: <CheckCircle className="size-3.5 text-emerald-500" />, text: "Verified Couriers" },
  { icon: <Shield className="size-3.5 text-blue-500" />,         text: "Secure Payments" },
  { icon: <Clock className="size-3.5 text-amber-500" />,         text: "Same-Day Delivery" },
  { icon: <Star className="size-3.5 text-orange-500 fill-orange-500" />, text: "4.8 Rated" },
];

export function HeroSection() {
  return (
    <section className="relative flex flex-col overflow-hidden bg-background pb-8 sm:pb-12">

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          opacity: 0.35,
        }}
      />

      {/* Accent orbs */}
      <div className="absolute -top-32 -left-32 size-[600px] rounded-full pointer-events-none" aria-hidden="true"
        style={{ background: "radial-gradient(circle, hsl(221 83% 53% / 0.08) 0%, transparent 70%)" }}
      />
      <div className="absolute -top-16 right-0 size-[400px] rounded-full pointer-events-none" aria-hidden="true"
        style={{ background: "radial-gradient(circle, hsl(221 83% 53% / 0.06) 0%, transparent 70%)" }}
      />

      {/* Above-the-fold content */}
      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-12 lg:py-20">
        <div className="flex min-w-0 flex-col items-center text-center lg:items-start lg:text-left">

          {/* Pill badge */}
          <HeroReveal delay={0.1}>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 text-xs font-semibold text-primary tracking-wide mb-8">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              Bangladesh&apos;s Trusted Logistics Platform
            </div>
          </HeroReveal>

          {/* Headline */}
          <HeroReveal delay={0.2}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.05] max-w-3xl text-foreground">
              Faster Delivery,{" "}
              <span className="text-primary">Smarter</span>{" "}
              Tracking.
            </h1>
          </HeroReveal>

          {/* Subtitle */}
          <HeroReveal delay={0.32}>
            <p className="mt-5 text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed">
              LogiFlow is Bangladesh&apos;s intelligent courier platform — real-time tracking,
              verified couriers, hub-to-hub logistics, and seamless payments in one place.
            </p>
          </HeroReveal>

          {/* CTA buttons */}
          <HeroReveal delay={0.44}>
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
              <Button size="lg" asChild
                className="h-12 px-8 rounded-full text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
              >
                <Link href="/register">Start Shipping Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild
                className="h-12 px-8 rounded-full text-sm font-semibold border-border hover:bg-muted/60"
              >
                <Link href="/track" className="flex items-center gap-2">
                  Track a Parcel
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </HeroReveal>

          {/* Tracking bar */}
          <HeroReveal delay={0.54} className="w-full max-w-xl">
            <div className="mt-8 w-full max-w-xl">
              <form
                action="/track"
                method="get"
                className="flex items-center overflow-hidden rounded-full border border-border bg-card shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 px-5 py-1 flex-1 min-w-0">
                  <MapPin className="size-4 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Tracking ID: LF-20261012-XXXXXXXX"
                    className="flex-1 bg-transparent py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none min-w-0"
                    aria-label="Tracking ID"
                  />
                </div>
                <button
                  type="submit"
                  className="m-1.5 flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 active:scale-[0.97] transition-all shrink-0"
                >
                  Track
                  <ArrowRight className="size-3.5" />
                </button>
              </form>
              <p className="mt-2 text-xs text-muted-foreground/60 text-center lg:text-left">
                Enter your tracking number to get real-time shipment updates
              </p>
            </div>
          </HeroReveal>

          {/* Trust strip */}
          <HeroReveal delay={0.64}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 lg:justify-start">
              {TRUST_ITEMS.map((item) => (
                <span key={item.text} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  {item.icon}
                  {item.text}
                </span>
              ))}
            </div>
          </HeroReveal>
        </div>

        {/* Map */}
        <SectionReveal variant="scale" delay={0.1} className="mx-auto w-full min-w-0 max-w-lg lg:justify-self-end">
          <div
            className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl shadow-primary/5"
          >
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
              <div>
                <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  Delivery Coverage
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">All 8 divisions of Bangladesh</p>
              </div>

              <div className="shrink-0 rounded-xl bg-primary/5 px-3 py-2 text-right">
                <p className="text-xs font-semibold text-foreground">64 Zones</p>
                <p className="text-xs text-muted-foreground">Nationwide</p>
              </div>
            </div>
            <div className="relative h-[360px] sm:h-[420px] lg:h-[460px]">
              <DivisionMap />
            </div>
          </div>
        </SectionReveal>
      </div>

      {/* Partner strip */}
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="rounded-2xl border border-border bg-card/80 px-6 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest whitespace-nowrap shrink-0">
              Trusted by businesses
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-6 sm:gap-8">
              {PARTNERS.map((p) => (
                <div key={p.name} className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                  <div className={`size-7 rounded-md flex items-center justify-center font-black text-sm border border-current/20 ${p.color}`}>
                    {p.letter}
                  </div>
                  <span className={`text-xs font-semibold hidden sm:block ${p.color}`}>{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
