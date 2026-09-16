"use client";

import { Fragment, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { formatPriceCents } from "@/lib/format";
import type { AdminOrderDetail } from "@/types/order";

const dateFormatter = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" });

/**
 * Read-only listing of checkouts that captured a shipping address but
 * never completed (or even attempted) payment — no status/action column,
 * since these aren't real orders (AI_RULES.md §8: the backend never
 * treats an unpaid checkout as an order anywhere in the admin UI). Detail
 * data is already fully loaded from the list response — no per-row fetch
 * needed, unlike OrderTable's expandable rows.
 */
export function AbandonedCartTable({ carts }: { carts: AdminOrderDetail[] }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (carts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 p-10 text-center">
        <p className="text-sm text-zinc-500">No abandoned carts in this range — nice.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
            <th className="px-5 py-3.5 font-medium"></th>
            <th className="px-5 py-3.5 font-medium">Customer / Session</th>
            <th className="px-5 py-3.5 font-medium">Items</th>
            <th className="px-5 py-3.5 font-medium">Amount</th>
            <th className="px-5 py-3.5 font-medium">Left At</th>
          </tr>
        </thead>
        <tbody>
          {carts.map((cart) => {
            const isExpanded = expandedId === cart.id;
            return (
              <Fragment key={cart.id}>
                <tr
                  onClick={() => setExpandedId(isExpanded ? null : cart.id)}
                  className="cursor-pointer border-b border-zinc-100 transition-colors last:border-b-0 hover:bg-zinc-50/70"
                >
                  <td className="px-5 py-3.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
                    </svg>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-zinc-900">{cart.customer.name}</p>
                    <p className="text-xs text-zinc-500">
                      {cart.customer.type === "account" ? cart.customer.email : "Guest session"}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-600">
                    {cart.items.length} item{cart.items.length === 1 ? "" : "s"}
                  </td>
                  <td className="px-5 py-3.5 text-zinc-900">{formatPriceCents(cart.total_cents)}</td>
                  <td className="px-5 py-3.5 text-zinc-600">{dateFormatter.format(new Date(cart.created_at))}</td>
                </tr>
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="border-b border-zinc-100 bg-zinc-50/50"
                    >
                      <td colSpan={5} className="px-6 py-4">
                        <div className="grid gap-6 text-sm md:grid-cols-3">
                          <div>
                            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                              Customer / Session
                            </h4>
                            <p className="text-zinc-600">
                              {cart.customer.type === "account" ? "Registered account" : "Guest session (no account)"}
                            </p>
                            {cart.customer.email && <p className="text-zinc-600">{cart.customer.email}</p>}
                            {cart.customer.phone && <p className="text-zinc-600">{cart.customer.phone}</p>}
                          </div>
                          <div>
                            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                              Address Entered
                            </h4>
                            <p className="text-zinc-600">{cart.shipping.name}</p>
                            <p className="text-zinc-600">
                              {cart.shipping.line1}
                              {cart.shipping.line2 ? `, ${cart.shipping.line2}` : ""}
                            </p>
                            <p className="text-zinc-600">
                              {cart.shipping.city}, {cart.shipping.state} {cart.shipping.postal_code}
                            </p>
                          </div>
                          <div>
                            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                              Products
                            </h4>
                            <ul className="space-y-1">
                              {cart.items.map((item) => (
                                <li key={item.id} className="flex justify-between text-zinc-600">
                                  <span className="pr-2">
                                    {item.product_name} × {item.quantity}
                                  </span>
                                  <span className="flex-shrink-0 text-zinc-900">
                                    {formatPriceCents(item.line_total_cents)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                            <div className="mt-2 flex justify-between border-t border-zinc-200 pt-2 font-semibold text-zinc-900">
                              <span>Total</span>
                              <span>{formatPriceCents(cart.total_cents)}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
