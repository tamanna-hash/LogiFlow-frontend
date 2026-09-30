import type { Metadata } from "next";
import { Mail, Phone, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with LogiFlow support.",
};

export default function ContactPage() {
  return (
    <div className="py-16 px-4 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold">Get in touch</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Have questions about your shipment or the platform? We&apos;re here to help.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <Card>
            <CardContent className="flex flex-col items-center text-center p-6">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Mail className="size-5 text-primary" aria-hidden="true" />
              </div>
              <h3 className="font-semibold mb-1">Email</h3>
              <p className="text-sm text-muted-foreground">support@logiflow.example</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col items-center text-center p-6">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Phone className="size-5 text-primary" aria-hidden="true" />
              </div>
              <h3 className="font-semibold mb-1">Phone</h3>
              <p className="text-sm text-muted-foreground">+880 1700 000000</p>
              <p className="text-xs text-muted-foreground mt-1">9am–6pm BST</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col items-center text-center p-6">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                <MapPin className="size-5 text-primary" aria-hidden="true" />
              </div>
              <h3 className="font-semibold mb-1">Head office</h3>
              <p className="text-sm text-muted-foreground">Dhaka, Bangladesh</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground text-center">
            For shipment-related queries, please log in and use the support section in your dashboard.
            Tracking issues can be resolved by using the{" "}
            <a href="/track" className="text-primary hover:underline">public tracking tool</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
