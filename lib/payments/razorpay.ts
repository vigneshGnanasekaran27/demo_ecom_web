// Minimal typing for the bits of the Razorpay Checkout SDK this app uses —
// the SDK ships no official TypeScript types.
export interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description?: string;
  prefill?: { name?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: { ondismiss?: () => void };
}

export interface RazorpayFailureResponse {
  error: {
    description: string;
    code?: string;
    reason?: string;
    metadata?: { order_id?: string; payment_id?: string };
  };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: "payment.failed", handler: (response: RazorpayFailureResponse) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayInstance;
  }
}

const CHECKOUT_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

let scriptLoadPromise: Promise<boolean> | null = null;

/** Loads the Razorpay Checkout script once and caches the promise (PAYMENT-02). */
export function loadRazorpayCheckoutScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);

  if (!scriptLoadPromise) {
    scriptLoadPromise = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = CHECKOUT_SCRIPT_SRC;
      script.onload = () => resolve(true);
      script.onerror = () => {
        scriptLoadPromise = null;
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  return scriptLoadPromise;
}

export type { RazorpayCheckoutOptions };
