import Link from "next/link";
import {
  Package, Truck, MapPin, Shield, Clock, CheckCircle, ArrowRight,
  Zap, Globe, BarChart3, Star, Phone, Mail, ChevronRight,
  CreditCard, Warehouse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { APP_NAME } from "@/config";
import type { Metadata } from "next";
import { PublicNav } from "@/components/shared/nav/PublicNav";

export const metadata: Metadata = {
  title: `${APP_NAME} — Fast, Reliable Courier & Logistics`,
  description: "Bangladesh's trusted courier and logistics management platform. Book, track, and manage shipments end-to-end.",
};

// ── Marquee strip ─────────────────────────────────────────────────────────────
const MARQUEE_ITEMS: { icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { icon: Zap,          label: "Same Day Delivery" },
  { icon: Package,      label: "Real-Time Tracking" },
  { icon: Shield,       label: "Secure Payments" },
  { icon: Truck,        label: "Nationwide Coverage" },
  { icon: CheckCircle,  label: "Verified Couriers" },
  { icon: BarChart3,    label: "Full Visibility" },
  { icon: CreditCard,   label: "bKash & Card" },
  { icon: Warehouse,    label: "Hub Management" },
];

function Marquee() {
  return (
    <div className="overflow-hidden bg-primary py-3 whitespace-nowrap">
      <div className="inline-flex animate-[marquee_30s_linear_infinite] gap-12">
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2 text-sm font-semibold text-primary-foreground tracking-wide">
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
  { icon: <Package className="size-6" />, label: "Standard Delivery",  desc: "Reliable door-to-door across Bangladesh",  color: "from-blue-500 to-blue-600" },
  { icon: <Zap className="size-6" />,     label: "Express Delivery",   desc: "Priority handling, faster transit",         color: "from-amber-500 to-orange-500" },
  { icon: <Clock className="size-6" />,   label: "Same Day Delivery",  desc: "Pickup and delivery on the same day",       color: "from-emerald-500 to-teal-500" },
  { icon: <Globe className="size-6" />,   label: "Hub-to-Hub Transfer", desc: "Intercity logistics between hubs",         color: "from-violet-500 to-purple-600" },
];

// ── How it works ──────────────────────────────────────────────────────────────
const STEPS = [
  { num: "01", title: "Book",     desc: "Create a shipment with sender, recipient and parcel details. Get an instant price quote." },
  { num: "02", title: "Pickup",   desc: "A verified courier is assigned and picks up your parcel from your specified address." },
  { num: "03", title: "Transit",  desc: "Your shipment moves through our hub network with real-time tracking at every stage." },
  { num: "04", title: "Delivery", desc: "Confirmed delivery with proof. Payment verified server-side — not just on the client." },
];

// ── Stats ─────────────────────────────────────────────────────────────────────
const STATS = [
  { value: "50K+",  label: "Shipments Delivered" },
  { value: "99.2%", label: "On-Time Rate" },
  { value: "64",    label: "Delivery Zones" },
  { value: "24/7",  label: "Support Available" },
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
              Bangladesh&apos;s trusted courier and logistics management platform — fast, trackable, reliable.
            </p>
            <div className="flex gap-3 mt-6">
              {[Phone, Mail, Globe].map((Icon, i) => (
                <div key={i} className="flex size-9 items-center justify-center rounded-full bg-white/10 hover:bg-primary transition-colors cursor-pointer">
                  <Icon className="size-4" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 text-sidebar-foreground/80 uppercase tracking-wider">Platform</h4>
            <ul className="space-y-3 text-sm">
              {[["Services", "/services"], ["Pricing", "/pricing"], ["Track Shipment", "/track"], ["Book Now", "/register"]].map(([l, h]) => (
                <li key={h}><Link href={h} className="text-sidebar-foreground/60 hover:text-primary transition-colors flex items-center gap-1.5"><ChevronRight className="size-3" />{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 text-sidebar-foreground/80 uppercase tracking-wider">Company</h4>
            <ul className="space-y-3 text-sm">
              {[["About", "/about"], ["Contact", "/contact"], ["FAQ", "/faq"], ["Blog", "#"]].map(([l, h]) => (
                <li key={h}><Link href={h} className="text-sidebar-foreground/60 hover:text-primary transition-colors flex items-center gap-1.5"><ChevronRight className="size-3" />{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 text-sidebar-foreground/80 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3 text-sm text-sidebar-foreground/60">
              <li className="flex items-center gap-2"><Phone className="size-4 text-primary" />+880 1700 000 000</li>
              <li className="flex items-center gap-2"><Mail className="size-4 text-primary" />support@logiflow.app</li>
              <li className="flex items-center gap-2"><MapPin className="size-4 text-primary" />Dhaka, Bangladesh</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-sidebar-foreground/40">
          <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-sidebar-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-sidebar-foreground transition-colors">Terms of Service</a>
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

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="relative min-h-[92vh] flex flex-col overflow-hidden">
          {/* Background — dark overlay over a truck road image via CSS gradient simulation */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #0a1628 0%, #0d1f3c 30%, #0f2952 55%, #0a1a35 80%, #060e1c 100%)",
            }}
            aria-hidden="true"
          />
          {/* Subtle road / perspective lines overlay */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            {/* Big glow center-right like truck headlights */}
            <div className="absolute top-[30%] right-[15%] size-[600px] rounded-full bg-blue-500/10 blur-[120px]" />
            <div className="absolute top-[20%] right-[25%] size-[300px] rounded-full bg-primary/15 blur-[80px]" />
            {/* Dark gradient vignette on edges */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
          </div>

          {/* Content — pushed to vertical center */}
          <div className="relative flex flex-col flex-1 items-center justify-center px-4 sm:px-6 pt-20 pb-32 text-white text-center">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] max-w-5xl">
              Courier Made Simple
            </h1>
            <p className="mt-6 text-base sm:text-lg text-white/60 max-w-xl leading-relaxed">
              Simplify how you send and receive anything, anywhere — with just a few taps. Fast, secure, and designed for everyday errands to urgent business deliveries.
            </p>

            {/* ── Tracking input bar ─────────────────────────────────────────── */}
            <form
              action="/track"
              method="get"
              className="mt-10 flex w-full max-w-lg items-center overflow-hidden rounded-full border border-white/20 bg-white/10 backdrop-blur-md shadow-2xl"
            >
              <input
                type="text"
                name="q"
                placeholder="enter your tracking ID"
                className="flex-1 bg-transparent px-6 py-4 text-sm text-white placeholder:text-white/40 outline-none min-w-0"
                aria-label="Tracking ID"
              />
              <button
                type="submit"
                className="flex items-center gap-2 m-1 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shrink-0 shadow-lg shadow-primary/40"
              >
                Track Your Parcel
                <ArrowRight className="size-4" />
              </button>
            </form>
          </div>

          {/* ── Bottom floating cards ────────────────────────────────────────── */}
          <div className="absolute bottom-8 left-0 right-0 px-4 sm:px-6">
            <div className="mx-auto max-w-7xl flex items-end justify-between gap-4 flex-wrap">

              {/* Left card — service description */}
              <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-4 text-white max-w-xs">
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-snug">
                    We have all kind of solution to deliver your goods
                  </p>
                  <Link
                    href="/services"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                  >
                    Learn more <ArrowRight className="size-3" />
                  </Link>
                </div>
                {/* Mini thumbnail placeholder */}
                <div className="shrink-0 size-20 rounded-xl overflow-hidden bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center">
                  <Truck className="size-8 text-white/70" />
                </div>
              </div>

              {/* Right card — social proof */}
              <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-4 text-white max-w-xs">
                <div className="flex items-start gap-3 mb-3">
                  <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-bold text-white shrink-0">
                    Global
                  </span>
                  <p className="text-xs text-white/80 leading-relaxed">
                    We manage load logistics for world&apos;s multinational companies
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-bold">4.8</span>
                  </div>
                  {/* Avatars */}
                  <div className="flex -space-x-2">
                    {["bg-blue-400", "bg-emerald-400", "bg-amber-400", "bg-rose-400", "bg-violet-400"].map((c, i) => (
                      <div key={i} className={`size-7 rounded-full border-2 border-white/20 ${c} flex items-center justify-center text-[10px] font-bold text-white`}>
                        {["A","B","C","D","E"][i]}
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-white/60">
                    <span className="font-bold text-white">120+</span>
                    <br />Satisfied Clients
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── Marquee ───────────────────────────────────────────────────────── */}
        <Marquee />

        {/* ── Stats ─────────────────────────────────────────────────────────── */}
        <section className="py-16 px-4 sm:px-6 bg-background">
          <div className="mx-auto max-w-7xl grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-4xl font-extrabold text-primary">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Services ──────────────────────────────────────────────────────── */}
        <section className="py-20 px-4 sm:px-6 bg-muted/30">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-14">
              <Badge variant="outline" className="mb-4 text-xs tracking-wider uppercase text-primary border-primary/30">Our Services</Badge>
              <h2 className="text-4xl font-bold">Popular Logistics Services</h2>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                From same-day urgent deliveries to nationwide hub transfers — we have the right service for every need.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {SERVICES.map((s) => (
                <div key={s.label} className="group relative overflow-hidden rounded-2xl border bg-card p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className={`inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} text-white mb-5 shadow-lg`}>
                    {s.icon}
                  </div>
                  <h3 className="text-base font-bold mb-2">{s.label}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
                    Learn more <ArrowRight className="size-3" />
                  </div>
                  {/* Hover glow */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br ${s.color} transition-opacity`} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ──────────────────────────────────────────────────── */}
        <section className="py-20 px-4 sm:px-6 bg-background">
          <div className="mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <Badge variant="outline" className="mb-4 text-xs tracking-wider uppercase text-primary border-primary/30">How it works</Badge>
                <h2 className="text-4xl font-bold leading-tight">Fast. Simple.<br />Reliable.</h2>
                <p className="mt-4 text-muted-foreground">
                  Discover how our step-by-step delivery process works — no confusion, no delays.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {STEPS.map((step) => (
                  <div key={step.num} className="rounded-2xl border bg-card p-5 hover:border-primary/40 transition-colors">
                    <p className="text-3xl font-black text-primary/20 mb-3">{step.num}</p>
                    <h4 className="font-bold mb-2">{step.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Delivery types dark band ───────────────────────────────────────── */}
        <section className="bg-sidebar text-sidebar-foreground py-16 px-4 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden">
              {[
                { icon: <Package className="size-6" />, title: "Standard Delivery",    desc: "Affordable, nationwide" },
                { icon: <Zap className="size-6" />,     title: "Express Delivery",     desc: "Priority handling" },
                { icon: <Clock className="size-6" />,   title: "Same-Day Delivery",    desc: "Fastest option" },
                { icon: <Globe className="size-6" />,   title: "Hub-to-Hub Transfer",  desc: "Inter-city logistics" },
              ].map((item, i) => (
                <div key={i} className="bg-sidebar p-8 flex flex-col items-center text-center gap-4 hover:bg-white/5 transition-colors">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/20 text-primary">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-bold">{item.title}</p>
                    <p className="text-sm text-sidebar-foreground/60 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Extra mile / why us ───────────────────────────────────────────── */}
        <section className="py-20 px-4 sm:px-6 bg-muted/30">
          <div className="mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <div>
                <Badge variant="outline" className="mb-4 text-xs tracking-wider uppercase text-primary border-primary/30">Why choose us</Badge>
                <h2 className="text-4xl font-bold">We Go the Extra Mile</h2>
                <p className="mt-4 text-muted-foreground">
                  From personal deliveries to bulk shipments, our platform is built to simplify every step of the journey.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <Globe className="size-5" />,        title: "Nationwide Reach",       desc: "Hub network covering every division of Bangladesh" },
                  { icon: <Clock className="size-5" />,        title: "Flexible Delivery",      desc: "From urgent same-day to scheduled recurring shipments" },
                  { icon: <ArrowRight className="size-5" />,   title: "Easy Returns",           desc: "Simple return initiation with quick courier logistics" },
                  { icon: <BarChart3 className="size-5" />,    title: "Built for Business",     desc: "Role-based dashboards for operators, hubs, and admin" },
                  { icon: <Shield className="size-5" />,       title: "Highly Rated",           desc: "Trusted for reliability and customer satisfaction" },
                  { icon: <CheckCircle className="size-5" />,  title: "Verified Couriers",      desc: "Background-checked couriers with live availability" },
                ].map((item) => (
                  <div key={item.title} className="rounded-xl border bg-card p-4 hover:shadow-md transition-all">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
                      {item.icon}
                    </div>
                    <p className="font-semibold text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-sidebar text-sidebar-foreground py-20 px-4 sm:px-6">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-[30%] size-[300px] rounded-full bg-primary/20 blur-[80px]" />
          </div>
          <div className="relative mx-auto max-w-3xl text-center">
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 text-xs tracking-wider uppercase">
              24/7 Support Available
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight">
              The Fastest and Reliable<br />
              <span className="text-primary">Courier Solutions</span>
            </h2>
            <p className="mt-6 text-sidebar-foreground/70 max-w-xl mx-auto">
              Join thousands of customers who trust LogiFlow for their daily logistics needs across Bangladesh.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="px-10 h-12 rounded-xl text-base shadow-lg shadow-primary/30">
                <Link href="/register">Start Shipping Today</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="px-10 h-12 rounded-xl border-white/20 text-sidebar-foreground hover:bg-white/10 text-base">
                <Link href="/contact">Talk to Us</Link>
              </Button>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
