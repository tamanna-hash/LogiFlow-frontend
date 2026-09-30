import type { Metadata } from "next";
import { PaymentResult } from "../PaymentResult";

export const metadata: Metadata = { title: "Payment Result" };

export default function PaymentSuccessPage() {
  return <PaymentResult />;
}
