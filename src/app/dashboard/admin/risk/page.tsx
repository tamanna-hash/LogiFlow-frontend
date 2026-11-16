"use client";
export const dynamic = "force-dynamic";

import { RiskDashboard } from "@/features/risk/RiskDashboard";

export default function AdminRiskPage() {
  return <RiskDashboard canRefresh />;
}
