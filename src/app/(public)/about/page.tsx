import type { Metadata } from "next";
import Link from "next/link";
import { Package, Target, Users, Zap, Shield, BarChart3, CheckCircle, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About LogiFlow",
  description: "Learn about LogiFlow, Bangladesh's courier and logistics management platform.",
};

const TEAM = [
  { name: "Logistics",  role: "Operations Team",  color: "bg-blue-500" },
  { name: "Technology", role: "Engineering Team",  color: "bg-violet-500" },
  { name: "Support",    role: "Customer Success",  color: "bg-emerald-500" },
  { name: "Growth",     role: "Business Team",     color: "bg-amber-500" },
];

const VALUES = [
  { icon: <Zap className="size-5" />,         title: "Speed",       desc: "We optimize every step to ensure your parcels arrive as fast as possible." },
  { icon: <Shield className="size-5" />,       title: "Security",    desc: "Every payment is verified server-side. Every courier is vetted and tracked." },
  { icon: <BarChart3 className="size-5" />,    title: "Transparency", desc: "Real-time tracking and clear pricing — no hidden fees, no surprises." },
  { icon: <Users className="size-5" />,        title: "Partnership", desc: "We work with our customers, couriers, and hub partners as one team." },
  { icon: <CheckCircle className="size-5" />,  title: "Reliability", desc: "99.2% on-time delivery rate across our nationwide network." },
  { icon: <Target className="size-5" />,       title: "Innovation",  desc: "Continuously improving with modern tech to stay ahead of logistics challenges." },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-sidebar text-sidebar-foreground py-24 px-4 sm:px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] right-[10%] size-[400px] rounded-full bg-primary/20 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 text-xs tracking-wider uppercase">Our Story</Badge>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">
            About <span className="text-primary">LogiFlow</span>
          </h1>
          <p className="mt-6 text-lg text-sidebar-foreground/70 max-w-2xl mx-auto leading-relaxed">
            A modern courier and logistics management platform built for Bangladesh — connecting customers, couriers, hubs, and operations on a single powerful system.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-4 sm:px-6 bg-background">
        <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <Badge variant="outline" className="mb-4 text-xs tracking-wider uppercase text-primary border-primary/30">Our Mission</Badge>
            <h2 className="text-4xl font-bold leading-tight">Global Logistics Solution<br />Since 2024</h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              LogiFlow was built to solve the fragmentation in Bangladesh&apos;s courier industry. We connect every stakeholder — from the customer booking a parcel to the operations manager overseeing 20 hubs — on one unified platform.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Our platform provides role-specific dashboards for five distinct user types, ensuring that every participant in the logistics chain has exactly the tools they need — no more, no less.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {[["50K+", "Shipments"],["99.2%", "On-Time"],["64", "Zones"],["5", "Roles"]].map(([v,l]) => (
                <div key={l} className="rounded-xl border bg-card p-4 text-center">
                  <p className="text-3xl font-black text-primary">{v}</p>
                  <p className="text-xs text-muted-foreground mt-1">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: <Package className="size-6" />, title: "Easy Booking",     desc: "Create shipments with full details and instant pricing",         bg: "bg-blue-500" },
              { icon: <Target className="size-6" />,  title: "Real-Time Track",  desc: "Every status update from pickup to delivery",                    bg: "bg-emerald-500" },
              { icon: <Users className="size-6" />,   title: "Role Dashboards",  desc: "Tailored views for customers, couriers, hubs, ops, and admin",   bg: "bg-violet-500" },
              { icon: <Shield className="size-6" />,  title: "Secure Payments",  desc: "bKash and Stripe with server-side verification",                 bg: "bg-amber-500" },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border bg-card p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <div className={`inline-flex size-11 items-center justify-center rounded-xl ${item.bg} text-white mb-4`}>{item.icon}</div>
                <h4 className="font-bold text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 sm:px-6 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4 text-xs tracking-wider uppercase text-primary border-primary/30">Our Values</Badge>
            <h2 className="text-4xl font-bold">What Drives Us</h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">The principles we hold ourselves to every day.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-2xl border bg-card p-6 hover:shadow-md hover:border-primary/30 transition-all">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">{v.icon}</div>
                <h3 className="font-bold mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4 sm:px-6 bg-background">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4 text-xs tracking-wider uppercase text-primary border-primary/30">The Team</Badge>
            <h2 className="text-4xl font-bold">Meet the Executive Panel</h2>
            <p className="mt-4 text-muted-foreground">Experienced professionals passionate about logistics innovation.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map((member) => (
              <div key={member.name} className="rounded-2xl border bg-card p-6 text-center hover:shadow-lg transition-all">
                <div className={`size-20 rounded-full ${member.color} mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold`}>
                  {member.name[0]}
                </div>
                <h4 className="font-bold">{member.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">{member.role}</p>
                <div className="flex justify-center gap-2 mt-4">
                  {[1,2,3].map(i => <div key={i} className="size-6 rounded-full bg-muted" />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-sidebar text-sidebar-foreground py-16 px-4 sm:px-6 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold">Ready to join LogiFlow?</h2>
          <p className="mt-4 text-sidebar-foreground/70">Create your free account and start shipping today.</p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="px-8 rounded-xl"><Link href="/register">Get Started Free</Link></Button>
            <Button size="lg" variant="outline" asChild className="px-8 rounded-xl border-white/20 text-sidebar-foreground hover:bg-white/10"><Link href="/contact">Contact Us <ArrowRight className="ml-2 size-4" /></Link></Button>
          </div>
        </div>
      </section>
    </div>
  );
}
