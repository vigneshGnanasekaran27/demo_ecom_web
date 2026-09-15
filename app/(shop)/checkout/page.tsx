"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCart, CART_QUERY_KEY } from "@/lib/cart/useCart";
import { ordersApi } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/client";
import { ShippingForm } from "@/components/checkout/ShippingForm";
import { RazorpayCheckout } from "@/components/checkout/RazorpayCheckout";
import { formatPriceCents } from "@/lib/format";
import type { OrderWithRazorpay, ShippingDetailsInput } from "@/types/order";

export default function CheckoutPage() {
  const { data: cart, isPending: isCartLoading } = useCart();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [order, setOrder] = useState<OrderWithRazorpay | null>(null);
  const [shippingContact, setShippingContact] = useState<{ name: string; phone: string } | null>(null);

  const createOrder = useMutation({
    mutationFn: (shipping: ShippingDetailsInput) => ordersApi.create(shipping),
    onSuccess: (createdOrder, shipping) => {
      setOrder(createdOrder);
      setShippingContact({ name: shipping.name, phone: shipping.phone });
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });

  if (order) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Complete Payment</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Order <span className="font-mono">{order.order_number}</span> is ready — pay securely via Razorpay.
        </p>

        <div className="mt-8 rounded-xl border border-zinc-200 p-6 text-left dark:border-zinc-800">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between py-1 text-sm text-zinc-600 dark:text-zinc-400">
              <span>
                {item.product_name} × {item.quantity}
              </span>
              <span>{formatPriceCents(item.line_total_cents)}</span>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t border-zinc-200 pt-2 text-base font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">
            <span>Total</span>
            <span>{formatPriceCents(order.total_cents)}</span>
          </div>
        </div>

        <div className="mt-6">
          <RazorpayCheckout
            order={order}
            customerName={shippingContact?.name ?? ""}
            customerPhone={shippingContact?.phone ?? ""}
            onVerified={(verifiedOrder) => {
              queryClient.invalidateQueries({ queryKey: ["orders"] });
              router.push(`/orders/${verifiedOrder.id}?success=true`);
            }}
          />
        </div>
      </main>
    );
  }

  if (isCartLoading) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-12" aria-busy="true">
        <div className="h-64 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
      </main>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 py-16 text-center">
        <p className="text-zinc-500 dark:text-zinc-400">Your cart is empty — add something before checking out.</p>
        <Link
          href="/shop"
          className="mt-4 inline-block rounded-md bg-brand-500 px-5 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          Continue Shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Checkout</h1>

      <div className="mt-8 grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Shipping Details</h2>
          <ShippingForm
            onSubmit={(shipping) => createOrder.mutate(shipping)}
            isSubmitting={createOrder.isPending}
            submitError={
              createOrder.isError
                ? createOrder.error instanceof ApiError
                  ? createOrder.error.message
                  : "Something went wrong. Please try again."
                : null
            }
          />
        </div>

        <div className="h-fit rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Order Summary</h2>
          <ul className="mt-3 space-y-1.5">
            {cart.items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
                <span className="line-clamp-1 pr-2">
                  {item.product.name} × {item.quantity}
                </span>
                <span className="flex-shrink-0">{formatPriceCents(item.line_total_cents)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-zinc-200 pt-2 text-base font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">
            <span>Total</span>
            <span>{formatPriceCents(cart.total_cents)}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
