"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { loadRazorpayCheckoutScript, type RazorpayFailureResponse, type RazorpaySuccessResponse } from "@/lib/payments/razorpay";
import { paymentsApi } from "@/lib/api/payments";
import { ApiError } from "@/lib/api/client";
import { formatPriceCents } from "@/lib/format";
import type { OrderWithRazorpay, Order } from "@/types/order";

type PaymentState = "idle" | "opening" | "verifying" | "failed";

/**
 * Wraps the Razorpay Checkout SDK integration (PAYMENT-02): opens Checkout
 * for the order created by CHECKOUT-02, and on the callback calls
 * POST /payments/verify — never treats the raw Checkout callback alone as a
 * confirmed payment (AI_RULES.md §17). Handles cancel/failure with a clear
 * retry (re-opens Checkout for the same already-created order, no new
 * POST /orders call needed).
 */
export function RazorpayCheckout({
  order,
  customerName,
  customerPhone,
  onVerified,
}: {
  order: OrderWithRazorpay;
  customerName: string;
  customerPhone: string;
  onVerified: (order: Order) => void;
}) {
  const [state, setState] = useState<PaymentState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const openCheckout = async () => {
    setState("opening");
    setErrorMessage(null);

    const loaded = await loadRazorpayCheckoutScript();
    if (!loaded || !window.Razorpay) {
      setState("failed");
      setErrorMessage("Unable to load the payment window. Check your connection and try again.");
      return;
    }

    const razorpay = new window.Razorpay({
      key: order.razorpay.key_id,
      amount: order.razorpay.amount,
      currency: order.razorpay.currency,
      order_id: order.razorpay.order_id,
      name: "DemoEcom",
      description: `Order ${order.order_number}`,
      prefill: { name: customerName, contact: customerPhone },
      theme: { color: "#c98a2e" },
      handler: (response: RazorpaySuccessResponse) => void verifyPayment(response),
      modal: {
        ondismiss: () => {
          setState((current) => (current === "verifying" ? current : "idle"));
        },
      },
    });

    razorpay.on("payment.failed", (response: RazorpayFailureResponse) => {
      setState("failed");
      setErrorMessage(response.error.description || "Payment failed. Please try again.");
      // Records the real rejected attempt so this order shows up in Admin
      // Orders (as "Payment Failed") instead of Abandoned Carts — best
      // effort, doesn't block the retry UI if it fails.
      void paymentsApi
        .markFailed({
          razorpay_order_id: order.razorpay.order_id,
          razorpay_payment_id: response.error.metadata?.payment_id,
          reason: response.error.description,
        })
        .catch(() => {});
    });

    razorpay.open();
  };

  const verifyPayment = async (response: RazorpaySuccessResponse) => {
    setState("verifying");
    try {
      const verifiedOrder = await paymentsApi.verify(response);
      onVerified(verifiedOrder);
    } catch (error) {
      setState("failed");
      setErrorMessage(error instanceof ApiError ? error.message : "Payment verification failed. Please try again.");
    }
  };

  const isBusy = state === "opening" || state === "verifying";

  return (
    <div>
      <motion.button
        type="button"
        onClick={openCheckout}
        disabled={isBusy}
        whileTap={{ scale: 0.98 }}
        className="w-full rounded-md bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-brand-500/50"
      >
        {state === "verifying"
          ? "Confirming payment..."
          : state === "opening"
            ? "Opening payment window..."
            : state === "failed"
              ? `Retry Payment — ${formatPriceCents(order.total_cents)}`
              : `Pay ${formatPriceCents(order.total_cents)}`}
      </motion.button>

      {state === "failed" && errorMessage && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
      )}
    </div>
  );
}
