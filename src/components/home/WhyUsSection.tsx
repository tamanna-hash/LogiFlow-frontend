import { Globe, Clock, BarChart3, TrendingUp, Lock, RefreshCcw, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionReveal, StaggerReveal, StaggerChild } from "@/components/home/SectionReveal";

const FEATURES = [
  { icon: <Globe className="size-5" />,      title: "Nationwide Reach",    desc: "Hub network covering every division of Bangladesh" },
  { icon: <Clock className="size-5" />,      title: "Flexible Delivery",   desc: "From urgent same-day to scheduled recurring shipments" },
  { icon: <RefreshCcw className="size-5" />, title: "Easy Returns",        desc: "Simple return initiation with quick courier logistics" },
  { icon: <BarChart3 className="size-5" />,  title: "Built for Business",  desc: "Role-based dashboards for operators, hubs, and admin" },
  { icon: <TrendingUp className="size-5" />, title: "Highly Rated",        desc: "Trusted for reliability and customer satisfaction" },
  { icon: <Lock className="size-5" />,       title: "Verified Couriers",   desc: "Background-checked couriers with live availability" },
];

const AVATAR_COLORS = ["bg-blue-400","bg-emerald-400","bg-amber-400","bg-rose-400","bg-violet-400"];
const AVATAR_LETTERS = ["A","B","C","D","E"];

export function WhyUsSection() {
  return (
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

            {/* Social proof */}
            <div className="mt-8 flex items-center gap-4 p-4 rounded-2xl border bg-card">
              <div className="flex -space-x-2">
                {AVATAR_COLORS.map((c, i) => (
                  <div key={i} className={`size-9 rounded-full border-2 border-card ${c} flex items-center justify-center text-xs font-bold text-white`}>
                    {AVATAR_LETTERS[i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
                  ))}
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
  );
}
