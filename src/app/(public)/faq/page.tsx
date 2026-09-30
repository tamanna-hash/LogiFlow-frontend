import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about LogiFlow.",
};

const FAQS = [
  {
    q: "How do I create a shipment?",
    a: "Log in with a Customer account, go to My Shipments, and click 'New shipment'. Fill in the sender and recipient details, parcel specifications, select your delivery type, and review the calculated price. After confirming, pay via bKash to arrange pickup.",
  },
  {
    q: "How do I pay for my shipment?",
    a: "LogiFlow supports bKash payment. After creating a shipment, click 'Pay with bKash' on the shipment details page. You will be redirected to bKash's payment page. After payment, the backend verifies the transaction and updates your shipment status.",
  },
  {
    q: "How do I track my shipment?",
    a: "Use the public tracking tool on the Track page — no login required. Enter your tracking number to see the current status and full history. You can also view detailed tracking from your Customer dashboard.",
  },
  {
    q: "When can I request pickup?",
    a: "Pickup can be requested after your payment is confirmed (status: COMPLETED). The shipment must be in CREATED status. Once you request pickup, operations staff will assign a courier.",
  },
  {
    q: "Can I cancel my shipment?",
    a: "Yes, you can cancel a shipment while it is in CREATED or PICKUP_REQUESTED status. Once a courier is assigned and the shipment is picked up, cancellation is no longer available through the customer dashboard.",
  },
  {
    q: "What delivery types are available?",
    a: "Standard, Express, and Same Day. Prices vary by delivery type and are calculated at booking time based on the route, weight, and applicable surcharges.",
  },
  {
    q: "My payment was not confirmed — what should I do?",
    a: "After returning from bKash, the payment page polls the backend for up to 30 seconds. If the status remains pending, check your bKash transaction history. If the payment went through but the status is not updated, contact support with your tracking number and bKash transaction ID.",
  },
  {
    q: "How do I become a courier?",
    a: "Contact your administrator to have your account role changed to COURIER. Once assigned, you can use the Courier dashboard to accept and manage delivery assignments.",
  },
];

export default function FAQPage() {
  return (
    <div className="py-16 px-4 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold">Frequently asked questions</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Answers to the most common questions about using LogiFlow.
          </p>
        </div>

        <dl className="space-y-6">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="rounded-lg border bg-card p-5">
              <dt className="font-semibold text-foreground">{faq.q}</dt>
              <dd className="mt-2 text-sm text-muted-foreground leading-relaxed">{faq.a}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Still have questions?{" "}
            <a href="/contact" className="text-primary hover:underline font-medium">
              Contact us
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
