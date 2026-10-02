import { apiPost, apiGet } from "@/lib/api/client";
import { PAYMENT_ENDPOINTS } from "@/lib/api/endpoints";
import type { Payment, InitiatePaymentResult, PaginationMeta } from "@/types";

export async function initiateBkashPayment(
  shipmentId: string
): Promise<InitiatePaymentResult> {
  const resp = await apiPost<InitiatePaymentResult>(
    PAYMENT_ENDPOINTS.initiateBkash,
    { shipmentId }
  );
  return resp.data;
}

export async function initiateStripeCheckout(
  shipmentId: string
): Promise<{ checkoutUrl: string; paymentId: string; amount: string }> {
  const resp = await apiPost<{ checkoutUrl: string; paymentId: string; amount: string }>(
    PAYMENT_ENDPOINTS.stripeCheckout,
    { shipmentId }
  );
  return resp.data;
}
  const resp = await apiGet<Payment>(PAYMENT_ENDPOINTS.byShipment(shipmentId));
  return resp.data;
}

export interface PaymentListResponse {
  payments: Payment[];
  meta: PaginationMeta;
}

export async function listPayments(params?: {
  page?: number;
  limit?: number;
  status?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
}): Promise<PaymentListResponse> {
  const resp = await apiGet<Payment[]>(
    PAYMENT_ENDPOINTS.list,
    params as Record<string, unknown>
  );
  return { payments: resp.data, meta: resp.meta! };
}
