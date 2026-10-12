import Link from "next/link";
import {
  Package,
  Truck,
  MapPin,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Zap,
  Globe,
  BarChart3,
  Star,
  Phone,
  Mail,
  ChevronRight,
  CreditCard,
  Warehouse,
  TrendingUp,
  Lock,
  RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { APP_NAME } from "@/config";
import type { Metadata } from "next";
import { PublicNav } from "@/components/shared/nav/PublicNav";
import {
  HeroReveal,
  SectionReveal,
  StaggerReveal,
  StaggerChild,
} from "@/components/home/SectionReveal";

export const metadata: Metadata = {
  title: `${APP_NAME} — Fast, Reliable Courier & Logistics`,
  description:
    "Bangladesh's trusted courier and logistics management platform. Book, track, and manage shipments end-to-end.",
};

// ── Marquee strip ─────────────────────────────────────────────────────────────
const MARQUEE_ITEMS: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}[] = [
  { icon: Zap, label: "Same Day Delivery" },
  { icon: Package, label: "Real-Time Tracking" },
  { icon: Shield, label: "Secure Payments" },
  { icon: Truck, label: "Nationwide Coverage" },
  { icon: CheckCircle, label: "Verified Couriers" },
  { icon: BarChart3, label: "Full Visibility" },
  { icon: CreditCard, label: "bKash & Card" },
  { icon: Warehouse, label: "Hub Management" },
];

function Marquee() {
  return (
    <div className="overflow-hidden bg-primary py-3 whitespace-nowrap">
      <div
        className="inline-flex gap-12"
        style={{ animation: "marquee 30s linear infinite" }}
      >
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary-foreground tracking-wide"
          >
            <item.icon className="size-4" />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Services ──────────────────────────────────────────────────────────────────
const SERVICES = [
  {
    icon: <Package className="size-6" />,
    label: "Standard Delivery",
    desc: "Reliable door-to-door across Bangladesh",
    color: "from-blue-500 to-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    href: "/register",
    cta: "Book now",
  },
  {
    icon: <Zap className="size-6" />,
    label: "Express Delivery",
    desc: "Priority handling, faster transit",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    href: "/register",
    cta: "Book now",
  },
  {
    icon: <Clock className="size-6" />,
    label: "Same Day Delivery",
    desc: "Pickup and delivery on the same day",
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    href: "/register",
    cta: "Book now",
  },
  {
    icon: <Globe className="size-6" />,
    label: "Hub-to-Hub Transfer",
    desc: "Intercity logistics between hubs",
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50 dark:bg-violet-950/30",
    href: "/services",
    cta: "Learn more",
  },
];

// ── Steps ─────────────────────────────────────────────────────────────────────
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

// ── Stats ─────────────────────────────────────────────────────────────────────
const STATS = [
  { value: "50K+", label: "Shipments Delivered" },
  { value: "99.2%", label: "On-Time Rate" },
  { value: "64", label: "Delivery Zones" },
  { value: "24/7", label: "Support Available" },
];

// ── Features ──────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <Globe className="size-5" />,
    title: "Nationwide Reach",
    desc: "Hub network covering every division of Bangladesh",
  },
  {
    icon: <Clock className="size-5" />,
    title: "Flexible Delivery",
    desc: "From urgent same-day to scheduled recurring shipments",
  },
  {
    icon: <RefreshCcw className="size-5" />,
    title: "Easy Returns",
    desc: "Simple return initiation with quick courier logistics",
  },
  {
    icon: <BarChart3 className="size-5" />,
    title: "Built for Business",
    desc: "Role-based dashboards for operators, hubs, and admin",
  },
  {
    icon: <TrendingUp className="size-5" />,
    title: "Highly Rated",
    desc: "Trusted for reliability and customer satisfaction",
  },
  {
    icon: <Lock className="size-5" />,
    title: "Verified Couriers",
    desc: "Background-checked couriers with live availability",
  },
];

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-sidebar text-sidebar-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 font-bold text-lg mb-4">
              <Package className="size-5 text-primary" />
              {APP_NAME}
            </div>
            <p className="text-sm text-sidebar-foreground/60 leading-relaxed">
              Bangladesh&apos;s trusted courier and logistics management platform
              — fast, trackable, reliable.
            </p>
            <div className="flex gap-3 mt-6">
              {[Phone, Mail, Globe].map((Icon, i) => (
                <div
                  key={i}
                  className="flex size-9 items-center justify-center rounded-full bg-white/10 hover:bg-primary transition-colors cursor-pointer"
                >
                  <Icon className="size-4" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 text-sidebar-foreground/80 uppercase tracking-wider">
              Platform
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                ["Services", "/services"],
                ["Pricing", "/pricing"],
                ["Track Shipment", "/track"],
                ["Book Now", "/register"],
              ].map(([l, h]) => (
                <li key={h}>
                  <Link
                    href={h}
                    className="text-sidebar-foreground/60 hover:text-primary transition-colors flex items-center gap-1.5"
                  >
                    <ChevronRight className="size-3" />
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 text-sidebar-foreground/80 uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                ["About", "/about"],
                ["Contact", "/contact"],
                ["FAQ", "/faq"],
              ].map(([l, h]) => (
                <li key={h}>
                  <Link
                    href={h}
                    className="text-sidebar-foreground/60 hover:text-primary transition-colors flex items-center gap-1.5"
                  >
                    <ChevronRight className="size-3" />
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 text-sidebar-foreground/80 uppercase tracking-wider">
              Contact
            </h4>
            <ul className="space-y-3 text-sm text-sidebar-foreground/60">
              <li className="flex items-center gap-2">
                <Phone className="size-4 text-primary shrink-0" />
                +880 1700 000 000
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4 text-primary shrink-0" />
                support@logiflow.app
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="size-4 text-primary shrink-0" />
                Dhaka, Bangladesh
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-sidebar-foreground/40">
          <p>
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-sidebar-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-sidebar-foreground transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />

      <main id="main-content">

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="relative min-h-[96vh] flex flex-col overflow-hidden bg-background">

          {/* Subtle grid pattern overlay */}
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

          {/* Top-left accent orb */}
          <div
            className="absolute -top-32 -left-32 size-[600px] rounded-full pointer-events-none"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(circle, hsl(221 83% 53% / 0.08) 0%, transparent 70%)",
            }}
          />

          {/* Top-right accent orb */}
          <div
            className="absolute -top-16 right-0 size-[400px] rounded-full pointer-events-none"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(circle, hsl(221 83% 53% / 0.06) 0%, transparent 70%)",
            }}
          />

          {/* ── Above-the-fold content ───────────────────────────────────────── */}
          <div className="relative flex flex-col flex-1 items-center justify-start px-4 sm:px-6 pt-16 sm:pt-20 pb-0 text-center">

            {/* Pill badge */}
            <HeroReveal delay={0.1}>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 text-xs font-semibold text-primary tracking-wide mb-8">
                <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                Bangladesh&apos;s Trusted Logistics Platform
              </div>
            </HeroReveal>

            {/* Main headline */}
            <HeroReveal delay={0.2}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.05] max-w-3xl text-foreground">
                Faster Delivery,{" "}
                <span className="text-primary">Smarter</span>{" "}
                Tracking.
              </h1>
            </HeroReveal>

            {/* Sub-headline */}
            <HeroReveal delay={0.32}>
              <p className="mt-5 text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed">
                LogiFlow is Bangladesh&apos;s intelligent courier platform — real-time tracking,
                verified couriers, hub-to-hub logistics, and seamless payments in one place.
              </p>
            </HeroReveal>

            {/* CTA row */}
            <HeroReveal delay={0.44}>
              <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
                <Button
                  size="lg"
                  asChild
                  className="h-12 px-8 rounded-full text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
                >
                  <Link href="/register">Start Shipping Free</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="h-12 px-8 rounded-full text-sm font-semibold border-border hover:bg-muted/60"
                >
                  <Link href="/track" className="flex items-center gap-2">
                    Track a Parcel
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </HeroReveal>

            {/* ── Tracking input bar ───────────────────────────────────────── */}
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

            {/* ── Trust strip ───────────────────────────────────────────────── */}
            <HeroReveal delay={0.64}>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                {[
                  { icon: <CheckCircle className="size-3.5 text-emerald-500" />, text: "Verified Couriers" },
                  { icon: <Shield className="size-3.5 text-blue-500" />, text: "Secure Payments" },
                  { icon: <Clock className="size-3.5 text-amber-500" />, text: "Same-Day Delivery" },
                  { icon: <Star className="size-3.5 text-orange-500 fill-orange-500" />, text: "4.8 Rated" },
                ].map((item) => (
                  <span
                    key={item.text}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    {item.icon}
                    {item.text}
                  </span>
                ))}
              </div>
            </HeroReveal>

          </div>

          {/* ── Hero visual: Google Map of Bangladesh ────────────────────────── */}
          <SectionReveal variant="scale" delay={0.1}>
            <div className="relative mt-10 mx-4 sm:mx-6 overflow-hidden rounded-3xl border border-border shadow-xl" style={{ height: "460px" }}>

            {/* Google Maps embed — Bangladesh centered */}
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

            {/* Overlay card — top-left */}
            <div className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm border border-border rounded-2xl px-4 py-3 shadow-lg max-w-[220px]">
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                Live Coverage
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                All 8 divisions of Bangladesh
              </p>
            </div>

            {/* Overlay card — top-right */}
            <div className="absolute top-4 right-4 bg-card/95 backdrop-blur-sm border border-border rounded-2xl px-4 py-3 shadow-lg">
              <p className="text-xs font-semibold text-foreground">64 Zones</p>
              <p className="text-xs text-muted-foreground">Nationwide</p>
            </div>

            {/* Bottom gradient fade into partner strip */}
            <div
              className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
              aria-hidden="true"
              style={{
                background: "linear-gradient(to top, hsl(var(--background)) 0%, transparent 100%)",
              }}
            />
          </div>
          </SectionReveal>

          {/* ── Partner / trust logos strip ───────────────────────────────────── */}
          <div className="mx-4 sm:mx-6">
            <div className="bg-card border border-t-0 border-border rounded-b-3xl shadow-lg px-6 py-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest whitespace-nowrap shrink-0">
                  Trusted by businesses
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-end gap-6 sm:gap-8">
                  {[
                    {
                      name: "bKash",
                      color: "text-pink-600 dark:text-pink-400",
                      letter: "b",
                    },
                    {
                      name: "BRAC Bank",
                      color: "text-blue-700 dark:text-blue-400",
                      letter: "B",
                    },
                    {
                      name: "Dutch Bangla",
                      color: "text-green-700 dark:text-green-400",
                      letter: "D",
                    },
                    {
                      name: "City Bank",
                      color: "text-red-600 dark:text-red-400",
                      letter: "C",
                    },
                    {
                      name: "ShopUp",
                      color: "text-violet-600 dark:text-violet-400",
                      letter: "S",
                    },
                  ].map((p) => (
                    <div
                      key={p.name}
                      className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <div
                        className={`size-7 rounded-md flex items-center justify-center font-black text-sm border border-current/20 ${p.color}`}
                      >
                        {p.letter}
                      </div>
                      <span
                        className={`text-xs font-semibold hidden sm:block ${p.color}`}
                      >
                        {p.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Marquee ───────────────────────────────────────────────────────── */}
        <Marquee />

        {/* ── Stats ─────────────────────────────────────────────────────────── */}
        <section className="py-20 px-4 sm:px-6 bg-background">
          <div className="mx-auto max-w-7xl">
            <StaggerReveal className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {STATS.map((s) => (
                <StaggerChild key={s.label}>
                  <div className="group text-center p-6 rounded-2xl border bg-card hover:border-primary/30 hover:shadow-md transition-all">
                    <p className="text-4xl font-extrabold text-primary">{s.value}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
                  </div>
                </StaggerChild>
              ))}
            </StaggerReveal>
          </div>
        </section>

        {/* ── Services ──────────────────────────────────────────────────────── */}
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

        {/* ── How it works ──────────────────────────────────────────────────── */}
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
                  Discover how our step-by-step delivery process works — no confusion, no delays. From booking to delivery confirmation in four simple steps.
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

        {/* ── Delivery types dark band ───────────────────────────────────────── */}
        <section className="bg-sidebar text-sidebar-foreground py-16 px-4 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <StaggerReveal className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden">
              {[
                { icon: <Package className="size-6" />, title: "Standard Delivery", desc: "Affordable, nationwide" },
                { icon: <Zap className="size-6" />, title: "Express Delivery", desc: "Priority handling" },
                { icon: <Clock className="size-6" />, title: "Same-Day Delivery", desc: "Fastest option" },
                { icon: <Globe className="size-6" />, title: "Hub-to-Hub Transfer", desc: "Inter-city logistics" },
              ].map((item) => (
                <StaggerChild key={item.title}>
                  <div className="bg-sidebar p-8 flex flex-col items-center text-center gap-4 hover:bg-white/5 transition-colors cursor-pointer h-full">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/20 text-primary">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-bold">{item.title}</p>
                      <p className="text-sm text-sidebar-foreground/60 mt-1">{item.desc}</p>
                    </div>
                  </div>
                </StaggerChild>
              ))}
            </StaggerReveal>
          </div>
        </section>

        {/* ── Why choose us ─────────────────────────────────────────────────── */}
        <section className="py-20 px-4 sm:px-6 bg-muted/30">
          <div className="mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <SectionReveal>
                <Badge variant="outline" className="mb-4 text-xs tracking-wider uppercase text-primary border-primary/30">
                  Why choose us
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-bold">We Go the Extra Mile</h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  From personal deliveries to bulk shipments, our platform is built to simplify every step of the journey.
                </p>
                <div className="mt-8 flex items-center gap-4 p-4 rounded-2xl border bg-card">
                  <div className="flex -space-x-2">
                    {["bg-blue-400","bg-emerald-400","bg-amber-400","bg-rose-400","bg-violet-400"].map((c, i) => (
                      <div key={i} className={`size-9 rounded-full border-2 border-card ${c} flex items-center justify-center text-xs font-bold text-white`}>
                        {["A","B","C","D","E"][i]}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-0.5">
                      {[1,2,3,4,5].map((i) => <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />)}
                      <span className="text-sm font-bold ml-1">4.8</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Trusted by <span className="font-semibold text-foreground">120+</span> satisfied clients
                    </p>
                  </div>
                </div>
              </SectionReveal>

              <StaggerReveal className="grid grid-cols-2 gap-4">
                {FEATURES.map((item) => (
                  <StaggerChild key={item.title}>
                    <div className="rounded-xl border bg-card p-4 hover:shadow-md hover:border-primary/30 transition-all h-full">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
                        {item.icon}
                      </div>
                      <p className="font-semibold text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                    </div>
                  </StaggerChild>
                ))}
              </StaggerReveal>
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-sidebar text-sidebar-foreground py-24 px-4 sm:px-6">
          {/* Ambient glows */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute top-0 left-[20%] size-[400px] rounded-full bg-primary/15 blur-[100px]" />
            <div className="absolute bottom-0 right-[20%] size-[300px] rounded-full bg-primary/10 blur-[80px]" />
          </div>
          <SectionReveal className="relative mx-auto max-w-3xl text-center">
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 text-xs tracking-wider uppercase">
              24/7 Support Available
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight">
              The Fastest and Reliable
              <br />
              <span className="text-primary">Courier Solutions</span>
            </h2>
            <p className="mt-6 text-sidebar-foreground/70 max-w-xl mx-auto leading-relaxed">
              Join thousands of customers who trust LogiFlow for their daily
              logistics needs across Bangladesh.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                asChild
                className="px-10 h-12 rounded-full text-base shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-shadow"
              >
                <Link href="/register">Start Shipping Today</Link>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                asChild
                className="px-10 h-12 rounded-full border border-white/40 text-white bg-transparent hover:bg-white/15 hover:text-white text-base"
              >
                <Link href="/contact">Talk to Us</Link>
              </Button>
            </div>
          </SectionReveal>
        </section>

      </main>
      <Footer />
    </div>
  );
}
