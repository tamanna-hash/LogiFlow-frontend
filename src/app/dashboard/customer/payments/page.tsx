import type { Metadata } from "next";
import { PaymentHistory } from "./PaymentHistory";

export const metadata: Metadata = { title: "Payment History" };

export default function PaymentsPage() {
  return <PaymentHistory />;
}
