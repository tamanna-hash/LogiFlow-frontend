import { Zap, Package, Shield, Truck, CheckCircle, BarChart3, CreditCard, Warehouse } from "lucide-react";

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

export function MarqueeSection() {
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
