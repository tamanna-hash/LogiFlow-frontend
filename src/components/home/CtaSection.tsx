import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionReveal } from "@/components/home/SectionReveal";

export function CtaSection() {
  return (
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
          The Fastest and Reliable<br />
          <span className="text-primary">Courier Solutions</span>
        </h2>
        <p className="mt-6 text-sidebar-foreground/70 max-w-xl mx-auto leading-relaxed">
          Join thousands of customers who trust LogiFlow for their daily logistics needs across Bangladesh.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" asChild
            className="px-10 h-12 rounded-full text-base shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-shadow"
          >
            <Link href="/register">Start Shipping Today</Link>
          </Button>
          <Button size="lg" variant="ghost" asChild
            className="px-10 h-12 rounded-full border border-white/40 text-white bg-transparent hover:bg-white/15 hover:text-white text-base"
          >
            <Link href="/contact">Talk to Us</Link>
          </Button>
        </div>
      </SectionReveal>

    </section>
  );
}
