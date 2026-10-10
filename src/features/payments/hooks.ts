"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/api/query-client";
import type { ApiError } from "@/lib/api/client";
import { initiateBkashPayment, initiateStripeCheckout, verifyStripePayment, getPaymentByShipment, listPayments } from "./api";

export function usePaymentByShipment(shipmentId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.paymentByShipment(shipmentId),
    queryFn: () => getPaymentByShipment(shipmentId),
    enabled: !!shipmentId && enabled,
    retry: false,
  });
}

export function usePayments(params?: {
  page?: number;
  limit?: number;
  status?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: queryKeys.payments(params as Record<string, unknown>),
    queryFn: () => listPayments(params),
  });
}

export function useVerifyStripePayment() {
  return useMutation({
    mutationFn: verifyStripePayment,
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to verify payment");
    },
  });
}

export function useInitiateStripeCheckout() {
  return useMutation({
    mutationFn: initiateStripeCheckout,
    onSuccess: (data) => {
      if (typeof window !== "undefined" && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to initiate Stripe payment");
    },
  });
}

export function useInitiateBkashPayment() {
  return useMutation({
    mutationFn: initiateBkashPayment,
    onSuccess: (data) => {
      // Redirect to bKash payment page
      if (typeof window !== "undefined" && data.bkashURL) {
        window.location.href = data.bkashURL;
      }
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to initiate payment");
    },
  });
}
