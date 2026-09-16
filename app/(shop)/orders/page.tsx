"use client";

import Link from "next/link";
import { useOrders } from "@/lib/orders/useOrders";
import { formatPriceCents } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/types/order";
import { StaggerGroup, StaggerItem } from "@/components/animations/StaggerReveal";

const dateFormatter = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" });

export default function OrdersPage() {
  const { data, isPending, isError, refetch } = useOrders();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Your Orders</h1>

      {isPending && (
        <div className="mt-8 space-y-3" aria-busy="true">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
          ))}
        </div>
      )}

      {isError && (
        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/30">
          <p className="text-sm text-red-700 dark:text-red-300">Unable to load your orders. Please try again.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 rounded-md border border-red-300 px-4 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/40"
          >
            Retry
          </button>
        </div>
      )}

      {data && data.orders.length === 0 && (
        <div className="mt-12 text-center">
          <p className="text-zinc-500 dark:text-zinc-400">
            No orders yet. Sign in to see orders placed while logged in.
          </p>
          <Link
            href="/shop"
            className="mt-4 inline-block rounded-md bg-brand-500 px-5 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            Start Shopping
          </Link>
        </div>
      )}

      {data && data.orders.length > 0 && (
        <StaggerGroup className="mt-8 space-y-3">
          {data.orders.map((order) => (
            <StaggerItem key={order.id}>
              <Link
                href={`/orders/${order.id}`}
                className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 transition-colors hover:border-brand-500 hover:shadow-md hover:shadow-zinc-900/5 dark:border-zinc-800 dark:hover:border-brand-400 dark:hover:shadow-black/30"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{order.order_number}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {dateFormatter.format(new Date(order.created_at))} · {order.items.length} item
                    {order.items.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {formatPriceCents(order.total_cents)}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{ORDER_STATUS_LABELS[order.order_status]}</p>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </main>
  );
}
