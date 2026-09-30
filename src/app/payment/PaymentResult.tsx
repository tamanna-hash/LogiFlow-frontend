"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PaymentStatusBadge } from "@/components/shared/StatusBadge";
import { usePaymentByShipment } from "@/features/payments/hooks";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { PAYMENT_POLL_INTERVAL_MS, PAYMENT_POLL_MAX_ATTEMPTS } from "@/config";

export function PaymentResult() {
  const searchParams = useSearchParams();
  const shipmentId = searchParams.get("shipmentId") ?? "";
  const pollCountRef = useRef(0);

  const { data: payment, isLoading, refetch, isError } = usePaymentByShipment(
    shipmentId,
    !!shipmentId
  );

  // Poll while payment is pending
  useEffect(() => {
    if (!shipmentId) return;
    if (payment?.status === "COMPLETED" || payment?.status === "FAILED") return;

    const interval = setInterval(() => {
      pollCountRef.current += 1;
      if (pollCountRef.current >= PAYMENT_POLL_MAX_ATTEMPTS) {
        clearInterval(interval);
        return;
      }
      refetch();
    }, PAYMENT_POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [shipmentId, payment?.status, refetch]);

  if (!shipmentId) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <XCircle className="mx-auto size-12 text-destructive mb-4" />
            <h1 className="text-xl font-semibold">Invalid payment link</h1>
            <p className="text-muted-foreground mt-2">No shipment ID provided.</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/customer/shipments">Go to shipments</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <Clock className="mx-auto size-12 text-primary animate-pulse mb-4" />
            <h1 className="text-xl font-semibold">Verifying payment…</h1>
            <p className="text-muted-foreground mt-2">Please wait while we confirm your payment.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !payment) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <XCircle className="mx-auto size-12 text-destructive mb-4" />
            <h1 className="text-xl font-semibold">Payment lookup failed</h1>
            <p className="text-muted-foreground mt-2 mb-4">We could not retrieve your payment status. Please check your shipment.</p>
            <div className="flex flex-col gap-2">
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="mr-2 size-4" />
                Retry
              </Button>
              <Button asChild>
                <Link href={`/dashboard/customer/shipments/${shipmentId}`}>View shipment</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCompleted = payment.status === "COMPLETED";
  const isFailed = payment.status === "FAILED";
  const isPending = payment.status === "PENDING";

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {isCompleted ? (
              <CheckCircle className="size-16 text-emerald-500" aria-hidden="true" />
            ) : isFailed ? (
              <XCircle className="size-16 text-destructive" aria-hidden="true" />
            ) : (
              <Clock className="size-16 text-amber-500 animate-pulse" aria-hidden="true" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {isCompleted ? "Payment confirmed!" : isFailed ? "Payment failed" : "Payment pending"}
          </CardTitle>
          <CardDescription>
            {isCompleted
              ? "Your payment was verified. Your shipment is now ready for pickup."
              : isFailed
              ? "Your payment could not be processed. Please try again."
              : "We're still waiting for payment confirmation. This may take a moment."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Payment details */}
          <div className="rounded-lg border p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <PaymentStatusBadge status={payment.status} />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-semibold">{formatCurrency(payment.amount)}</span>
            </div>
            {payment.bkashTransactionId && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-mono text-xs">{payment.bkashTransactionId}</span>
              </div>
            )}
            {payment.paidAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paid at</span>
                <span className="text-xs">{formatDateTime(payment.paidAt)}</span>
              </div>
            )}
          </div>

          {isPending && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
              <p className="font-medium">Verification in progress</p>
              <p>Payment confirmation may take up to 30 seconds. This page will update automatically.</p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {isFailed && (
              <Button asChild>
                <Link href={`/dashboard/customer/shipments/${shipmentId}`}>
                  Try payment again
                </Link>
              </Button>
            )}
            <Button asChild variant={isFailed ? "outline" : "default"}>
              <Link href={`/dashboard/customer/shipments/${shipmentId}`}>
                View shipment
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/dashboard/customer/shipments">
                All shipments
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
