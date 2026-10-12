import Link from "next/link";
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
    <section className="relative min-h-[96vh] flex flex-col overflow-hidden bg-background">

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
      <div className="relative flex flex-col flex-1 items-center justify-start px-4 sm:px-6 pt-16 sm:pt-20 pb-0 text-center">

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
        <HeroReveal delay={0.54}>
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
            <p className="mt-2 text-xs text-muted-foreground/60 text-center">
              Enter your tracking number to get real-time shipment updates
            </p>
          </div>
        </HeroReveal>

        {/* Trust strip */}
        <HeroReveal delay={0.64}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
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
      <SectionReveal variant="scale" delay={0.1}>
        <div
          className="relative mt-10 mx-4 sm:mx-6 overflow-hidden rounded-3xl border border-border shadow-xl"
          style={{ height: "460px" }}
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3648757.8!2d90.3563!3d23.6850!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sbd!4v1699000000000!5m2!1sen!2sbd&style=feature:all|element:labels.text|visibility:simplified&maptype=roadmap"
            width="100%"
            height="100%"
            style={{ border: 0, display: "block" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="LogiFlow delivery coverage map — Bangladesh"
            aria-label="Map showing Bangladesh delivery coverage"
          />

          <div className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm border border-border rounded-2xl px-4 py-3 shadow-lg max-w-[220px]">
            <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
              Live Coverage
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">All 8 divisions of Bangladesh</p>
          </div>

          <div className="absolute top-4 right-4 bg-card/95 backdrop-blur-sm border border-border rounded-2xl px-4 py-3 shadow-lg">
            <p className="text-xs font-semibold text-foreground">64 Zones</p>
            <p className="text-xs text-muted-foreground">Nationwide</p>
          </div>

          <div
            className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
            aria-hidden="true"
            style={{ background: "linear-gradient(to top, hsl(var(--background)) 0%, transparent 100%)" }}
          />
        </div>
      </SectionReveal>

      {/* Partner strip */}
      <div className="mx-4 sm:mx-6">
        <div className="bg-card border border-t-0 border-border rounded-b-3xl shadow-lg px-6 py-4">
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
