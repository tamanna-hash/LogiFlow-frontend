import { Package, Zap, Clock, Globe } from "lucide-react";
import { StaggerReveal, StaggerChild } from "@/components/home/SectionReveal";

const DELIVERY_TYPES = [
  { icon: <Package className="size-6" />, title: "Standard Delivery",   desc: "Affordable, nationwide" },
  { icon: <Zap className="size-6" />,     title: "Express Delivery",    desc: "Priority handling" },
  { icon: <Clock className="size-6" />,   title: "Same-Day Delivery",   desc: "Fastest option" },
  { icon: <Globe className="size-6" />,   title: "Hub-to-Hub Transfer", desc: "Inter-city logistics" },
];

export function DeliveryTypesSection() {
  return (
    <section className="bg-sidebar text-sidebar-foreground py-16 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <StaggerReveal className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden">
          {DELIVERY_TYPES.map((item) => (
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
  );
}
