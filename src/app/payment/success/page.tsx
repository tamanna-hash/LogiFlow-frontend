import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentResult } from "../PaymentResult";

export const metadata: Metadata = { title: "Payment Result" };
export const dynamic = "force-dynamic";

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-48 w-80 animate-pulse rounded-xl bg-muted" /></div>}>
      <PaymentResult />
    </Suspense>
  );
}
