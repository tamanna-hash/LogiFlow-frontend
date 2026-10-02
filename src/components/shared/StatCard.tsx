import * as React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  /** Tailwind bg class for the icon circle, e.g. "bg-blue-500" */
  iconBg?: string;
  trend?: { value: string; up: boolean };
  href?: string;
  className?: string;
}

export function StatCard({ title, value, subtitle, icon, iconBg = "bg-primary", trend, className }: StatCardProps) {
  return (
    <div className={cn(
      "rounded-xl border bg-card p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow",
      className
    )}>
      <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl text-white", iconBg)}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground font-medium truncate">{title}</p>
        <p className="text-2xl font-bold leading-tight mt-0.5">{value}</p>
        {trend && (
          <p className={cn("flex items-center gap-1 text-xs font-medium mt-1",
            trend.up ? "text-emerald-500" : "text-red-500")}>
            {trend.up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {trend.value}
          </p>
        )}
        {subtitle && !trend && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
