import { apiClient } from "@/lib/api/client";
import type { Order } from "@/types/order";

export interface VerifyPaymentInput {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface MarkFailedInput {
  razorpay_order_id: string;
  razorpay_payment_id?: string;
  reason?: string;
}

export const paymentsApi = {
  verify: async (input: VerifyPaymentInput): Promise<Order> => {
    const { data } = await apiClient<Order>("/api/v1/payments/verify", {
      method: "POST",
      body: input,
    });
    return data;
  },

  // Records a real, rejected payment attempt — distinguishes it from a
  // checkout the customer never tried to pay for at all (Abandoned Carts).
  markFailed: async (input: MarkFailedInput): Promise<Order> => {
    const { data } = await apiClient<Order>("/api/v1/payments/failed", {
      method: "POST",
      body: input,
    });
    return data;
  },
};
