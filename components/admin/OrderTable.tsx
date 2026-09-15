"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useUpdateOrderStatus } from "@/lib/admin/useAdminOrders";
import { OrderDetailPanel } from "@/components/admin/OrderDetailPanel";
import { formatPriceCents } from "@/lib/format";
import { ApiError } from "@/lib/api/client";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TRANSITIONS, type AdminOrderListItem, type OrderStatus } from "@/types/order";

const dateFormatter = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" });

function statusBadge(order: AdminOrderListItem): { label: string; className: string } {
  if (order.payment_status === "failed") {
    return { label: "Payment Failed", className: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300" };
  }
  if (order.order_status === "cancelled") {
    return { label: "Cancelled", className: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300" };
  }
  if (order.order_status === "delivered") {
    return { label: "Delivered", className: "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300" };
  }
  if (["confirmed"].includes(order.order_status)) {
    return { label: ORDER_STATUS_LABELS[order.order_status], className: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300" };
  }
  return {
    label: ORDER_STATUS_LABELS[order.order_status],
    className: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  };
}

/**
 * Reused by the Orders and Dispatch pages — `transitions` is the only
 * thing that changes (which "advance to" options are offered; a UX
 * curation now, per DECISION-032, not a permission boundary).
 */
export function OrderTable({
  orders,
  transitions = ORDER_STATUS_TRANSITIONS,
}: {
  orders: AdminOrderListItem[];
  transitions?: Record<OrderStatus, OrderStatus[]>;
}) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No orders found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            <th className="px-5 py-3.5 font-medium"></th>
            <th className="px-5 py-3.5 font-medium">Order</th>
            <th className="px-5 py-3.5 font-medium">Customer</th>
            <th className="px-5 py-3.5 font-medium">Date</th>
            <th className="px-5 py-3.5 font-medium">Total</th>
            <th className="px-5 py-3.5 font-medium">Status</th>
            <th className="px-5 py-3.5 font-medium">Advance Status</th>
            <th className="px-5 py-3.5 font-medium">Receipt</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              transitions={transitions}
              isExpanded={expandedId === order.id}
              onToggle={() => setExpandedId((current) => (current === order.id ? null : order.id))}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrderRow({
  order,
  transitions,
  isExpanded,
  onToggle,
}: {
  order: AdminOrderListItem;
  transitions: Record<OrderStatus, OrderStatus[]>;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const nextOptions = transitions[order.order_status] ?? [];
  const [selected, setSelected] = useState<OrderStatus | "">("");
  const { mutate, isPending, isError, error } = useUpdateOrderStatus();
  const badge = statusBadge(order);

  return (
    <>
      <tr className="border-b border-zinc-100 transition-colors last:border-b-0 hover:bg-zinc-50/70 dark:border-zinc-900 dark:hover:bg-zinc-900/40">
        <td className="px-5 py-3.5">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Collapse order details" : "Expand order details"}
            className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
            </svg>
          </button>
        </td>
        <td className="px-5 py-3.5 font-medium text-zinc-900 dark:text-zinc-50">{order.order_number}</td>
        <td className="px-5 py-3.5 text-zinc-600 dark:text-zinc-400">{order.customer_name}</td>
        <td className="px-5 py-3.5 text-zinc-600 dark:text-zinc-400">{dateFormatter.format(new Date(order.created_at))}</td>
        <td className="px-5 py-3.5 text-zinc-900 dark:text-zinc-50">{formatPriceCents(order.total_cents)}</td>
        <td className="px-5 py-3.5">
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge.className}`}>{badge.label}</span>
        </td>
        <td className="px-5 py-3.5">
          {nextOptions.length === 0 ? (
            <span className="text-xs text-zinc-400 dark:text-zinc-600">No further action</span>
          ) : (
            <div className="flex items-center gap-2">
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value as OrderStatus)}
                disabled={isPending}
                className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              >
                <option value="">Select...</option>
                {nextOptions.map((status) => (
                  <option key={status} value={status}>
                    {ORDER_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!selected || isPending}
                onClick={() => selected && mutate({ orderId: order.id, status: selected })}
                className="rounded-md bg-zinc-900 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {isPending ? "Updating..." : "Update"}
              </button>
            </div>
          )}
          {isError && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {error instanceof ApiError ? error.message : "Update failed"}
            </p>
          )}
        </td>
        <td className="px-5 py-3.5">
          <Link
            href={`/admin/orders/${order.id}/receipt`}
            target="_blank"
            className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12M12 16.5V3" />
            </svg>
            Download
          </Link>
        </td>
      </tr>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="border-b border-zinc-100 bg-zinc-50/50 dark:border-zinc-900 dark:bg-zinc-900/40"
          >
            <td colSpan={8} className="px-6 py-4">
              <OrderDetailPanel orderId={order.id} />
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
}
