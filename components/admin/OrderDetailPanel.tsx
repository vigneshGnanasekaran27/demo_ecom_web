"use client";

import Link from "next/link";
import { useAdminOrder } from "@/lib/admin/useAdminOrders";
import { formatPriceCents } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/types/order";

const dateFormatter = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" });

/**
 * Expanded detail shown inline under an admin table row — customer,
 * payment, itemized products, shipping, and the full status timeline.
 * Fetched on demand via GET /api/v1/admin/orders/:id, which is
 * role-scoped exactly like the index (a dispatch/delivery user can only
 * expand an order that's actually in their queue).
 */
export function OrderDetailPanel({ orderId }: { orderId: number }) {
  const { data: order, isPending, isError } = useAdminOrder(orderId);

  if (isPending) {
    return <div className="h-32 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" aria-busy="true" />;
  }

  if (isError || !order) {
    return <p className="text-sm text-red-600 dark:text-red-400">Unable to load order details.</p>;
  }

  return (
    <div className="grid gap-6 text-sm md:grid-cols-3">
      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Customer
        </h4>
        <p className="font-medium text-zinc-900 dark:text-zinc-50">{order.customer.name}</p>
        <p className="text-zinc-600 dark:text-zinc-400">
          {order.customer.type === "account" ? "Registered account" : "Guest checkout"}
        </p>
        {order.customer.email && <p className="text-zinc-600 dark:text-zinc-400">{order.customer.email}</p>}
        {order.customer.phone && <p className="text-zinc-600 dark:text-zinc-400">{order.customer.phone}</p>}

        <h4 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Shipping Address
        </h4>
        <p className="text-zinc-600 dark:text-zinc-400">
          {order.shipping.line1}
          {order.shipping.line2 ? `, ${order.shipping.line2}` : ""}
        </p>
        <p className="text-zinc-600 dark:text-zinc-400">
          {order.shipping.city}, {order.shipping.state} {order.shipping.postal_code}
        </p>
        {order.shipping.landmark && <p className="text-zinc-600 dark:text-zinc-400">Landmark: {order.shipping.landmark}</p>}
      </div>

      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Payment
        </h4>
        {order.payments.length === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-400">No payment recorded yet.</p>
        ) : (
          order.payments.map((payment) => (
            <div key={payment.id} className="mb-2 rounded-md border border-zinc-200 p-2 dark:border-zinc-800">
              <p className="font-medium capitalize text-zinc-900 dark:text-zinc-50">{payment.status}</p>
              <p className="text-zinc-600 dark:text-zinc-400">{formatPriceCents(payment.amount_cents)}</p>
              {payment.razorpay_payment_id && (
                <p className="truncate font-mono text-xs text-zinc-500 dark:text-zinc-500">
                  {payment.razorpay_payment_id}
                </p>
              )}
            </div>
          ))
        )}

        <h4 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Order
        </h4>
        <p className="text-zinc-600 dark:text-zinc-400">Status: {ORDER_STATUS_LABELS[order.order_status]}</p>
        <p className="text-zinc-600 dark:text-zinc-400">Placed: {order.placed_at ? dateFormatter.format(new Date(order.placed_at)) : "—"}</p>
        <Link
          href={`/admin/orders/${order.id}/receipt`}
          target="_blank"
          className="mt-2 inline-block text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
        >
          Print Receipt →
        </Link>
      </div>

      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Items
        </h4>
        <ul className="space-y-1">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span className="pr-2">
                {item.product_name} × {item.quantity}
              </span>
              <span className="flex-shrink-0 text-zinc-900 dark:text-zinc-50">{formatPriceCents(item.line_total_cents)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex justify-between border-t border-zinc-200 pt-2 font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">
          <span>Total</span>
          <span>{formatPriceCents(order.total_cents)}</span>
        </div>
      </div>
    </div>
  );
}
