import { StaggerReveal, StaggerChild } from "@/components/home/SectionReveal";

const STATS = [
  { value: "50K+",  label: "Shipments Delivered" },
  { value: "99.2%", label: "On-Time Rate" },
  { value: "64",    label: "Delivery Zones" },
  { value: "24/7",  label: "Support Available" },
];

export function StatsSection() {
  return (
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
  );
}
