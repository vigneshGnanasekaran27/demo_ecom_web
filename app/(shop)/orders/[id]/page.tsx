"use client";

import { use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useOrder } from "@/lib/orders/useOrders";
import { OrderStatusTimeline } from "@/components/order/OrderStatusTimeline";
import { formatPriceCents } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/types/order";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const justPaid = searchParams.get("success") === "true";

  const { data: order, isPending, isError, refetch } = useOrder(id);

  if (isPending) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-8" aria-busy="true">
        <div className="h-80 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
      </main>
    );
  }

  if (isError || !order) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-16 text-center">
        <p className="text-zinc-500 dark:text-zinc-400">Unable to load this order.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 rounded-md border border-zinc-300 px-4 py-1.5 text-sm font-medium dark:border-zinc-700"
        >
          Retry
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      {justPaid && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300"
        >
          Payment successful — your order has been confirmed.
        </motion.div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{order.order_number}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{ORDER_STATUS_LABELS[order.order_status]}</p>
        </div>
        <Link
          href={`/orders/${order.id}/receipt`}
          className="rounded-md border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-700 hover:border-brand-500 hover:text-brand-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-brand-400 dark:hover:text-brand-400"
        >
          View Receipt
        </Link>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Items</h2>
            <ul className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-900">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between py-2 text-sm">
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {item.product_name} × {item.quantity}
                  </span>
                  <span className="text-zinc-900 dark:text-zinc-50">{formatPriceCents(item.line_total_cents)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 space-y-1 border-t border-zinc-200 pt-3 text-sm dark:border-zinc-800">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Subtotal</span>
                <span>{formatPriceCents(order.subtotal_cents)}</span>
              </div>
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Delivery</span>
                <span>{order.delivery_charge_cents === 0 ? "Free" : formatPriceCents(order.delivery_charge_cents)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-zinc-900 dark:text-zinc-50">
                <span>Total</span>
                <span>{formatPriceCents(order.total_cents)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Shipping To</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{order.shipping.name}</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{order.shipping.phone}</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {order.shipping.line1}
              {order.shipping.line2 ? `, ${order.shipping.line2}` : ""}
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {order.shipping.city}, {order.shipping.state} {order.shipping.postal_code}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
          <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Order Status</h2>
          <OrderStatusTimeline history={order.status_history} />
        </div>
      </div>
    </main>
  );
}
