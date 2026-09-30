import type { Metadata } from "next";
import { PaymentResult } from "../PaymentResult";

export const metadata: Metadata = { title: "Payment Failed" };

export default function PaymentFailurePage() {
  return <PaymentResult />;
}
