import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock, MessageSquare, Headphones } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with LogiFlow support.",
};

const CHANNELS = [
  { icon: <Mail className="size-6" />,         title: "Email Support",     detail: "support@logiflow.app",      sub: "We reply within 2 hours",  color: "bg-blue-500" },
  { icon: <Phone className="size-6" />,        title: "Phone",             detail: "+880 1700 000 000",         sub: "9am – 6pm BST, Mon–Sat",   color: "bg-emerald-500" },
  { icon: <MapPin className="size-6" />,       title: "Head Office",       detail: "Dhaka, Bangladesh",         sub: "Tejgaon Industrial Area",   color: "bg-amber-500" },
  { icon: <Clock className="size-6" />,        title: "24/7 Support",      detail: "Always Available",          sub: "For urgent shipment issues", color: "bg-violet-500" },
  { icon: <MessageSquare className="size-6" />, title: "Live Chat",        detail: "Chat with us",              sub: "Average wait: 3 minutes",   color: "bg-pink-500" },
  { icon: <Headphones className="size-6" />,   title: "Support Portal",    detail: "Submit a ticket",           sub: "Track your support request", color: "bg-cyan-500" },
];

const FAQS = [
  { q: "How do I track my shipment?",          a: "Use our public tracking tool at /track — enter your tracking number for live status updates." },
  { q: "How long does delivery take?",         a: "Standard: 2-4 days. Express: 1-2 days. Same Day: within the same city zone on the same day." },
  { q: "How do I cancel a shipment?",          a: "Log in to your dashboard and cancel before a courier is assigned. Cancellations after assignment are not guaranteed." },
  { q: "What payment methods are supported?",  a: "bKash and Stripe (card payments). All payments are verified server-side." },
];

export default function ContactPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-sidebar text-sidebar-foreground py-24 px-4 sm:px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-[40%] size-[350px] rounded-full bg-primary/20 blur-[90px]" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 text-xs tracking-wider uppercase">Support</Badge>
          <h1 className="text-5xl sm:text-6xl font-extrabold">Get in Touch</h1>
          <p className="mt-6 text-lg text-sidebar-foreground/70 max-w-xl mx-auto">
            Have questions about your shipment or the platform? Our team is here to help — any time, any channel.
          </p>
        </div>
      </section>

      {/* Contact channels */}
      <section className="py-20 px-4 sm:px-6 bg-background">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 text-xs tracking-wider uppercase text-primary border-primary/30">Reach Us</Badge>
            <h2 className="text-3xl font-bold">Multiple Ways to Connect</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CHANNELS.map((c) => (
              <Card key={c.title} className="hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <CardContent className="p-6">
                  <div className={`inline-flex size-12 items-center justify-center rounded-xl ${c.color} text-white mb-5`}>
                    {c.icon}
                  </div>
                  <h3 className="font-bold mb-1">{c.title}</h3>
                  <p className="font-medium text-primary">{c.detail}</p>
                  <p className="text-sm text-muted-foreground mt-1">{c.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6 bg-muted/30">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 text-xs tracking-wider uppercase text-primary border-primary/30">FAQ</Badge>
            <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <div key={faq.q} className="rounded-xl border bg-card p-6 hover:border-primary/30 transition-colors">
                <h4 className="font-semibold mb-2">{faq.q}</h4>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">More questions? Check our full FAQ page.</p>
            <Button variant="outline" asChild className="rounded-xl"><Link href="/faq">View all FAQs</Link></Button>
          </div>
        </div>
      </section>

      {/* Map-like CTA band */}
      <section className="bg-sidebar text-sidebar-foreground py-16 px-4 sm:px-6 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/20 mx-auto mb-6">
            <MapPin className="size-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Visit Our Head Office</h2>
          <p className="mt-3 text-sidebar-foreground/70">Tejgaon Industrial Area, Dhaka-1215, Bangladesh</p>
          <p className="text-sm text-sidebar-foreground/50 mt-2">Monday – Saturday: 9:00 AM – 6:00 PM BST</p>
        </div>
      </section>
    </div>
  );
}
