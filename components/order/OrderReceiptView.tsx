"use client";

import { formatPriceCents } from "@/lib/format";
import { ORDER_STATUS_LABELS, type Order } from "@/types/order";

const dateFormatter = new Intl.DateTimeFormat("en-IN", { dateStyle: "long", timeStyle: "short" });

/**
 * Printable order receipt (ADMIN-03) — stands in for the original plan's
 * Prawn-generated PDF (DECISION-030): browser print / "Save as PDF" is an
 * acceptable substitute for the demo. Contains the same fields
 * AI_RULES.md §20 specifies for a customer receipt PDF. Header/Footer hide
 * via `print:hidden` so only this content prints.
 */
export function OrderReceiptView({
  order,
  hideChrome = false,
  className = "",
}: {
  order: Order;
  /** Suppresses the title/print-button row — used when several receipts are stacked on one page (batch printing) and only one global print button is shown. */
  hideChrome?: boolean;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-2xl px-4 py-8 print:px-0 print:py-0 ${className}`}>
      {!hideChrome && (
        <div className="mb-6 flex items-center justify-between print:hidden">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Receipt</h1>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Print / Save as PDF
          </button>
        </div>
      )}

      <div className="rounded-xl border border-zinc-200 p-8 print:rounded-none print:border-0 print:p-0 dark:border-zinc-800">
        <div className="flex items-start justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div>
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Demo<span className="text-brand-600">Ecom</span>
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Order Receipt</p>
          </div>
          <div className="text-right text-sm text-zinc-600 dark:text-zinc-400">
            <p className="font-medium text-zinc-900 dark:text-zinc-50">{order.order_number}</p>
            <p>{dateFormatter.format(new Date(order.created_at))}</p>
            <p>Payment: {order.payment_status === "successful" ? "Paid" : order.payment_status}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 border-b border-zinc-200 pb-4 text-sm dark:border-zinc-800">
          <div>
            <p className="font-medium text-zinc-900 dark:text-zinc-50">Billed / Shipped To</p>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">{order.shipping.name}</p>
            <p className="text-zinc-600 dark:text-zinc-400">{order.shipping.phone}</p>
            <p className="text-zinc-600 dark:text-zinc-400">
              {order.shipping.line1}
              {order.shipping.line2 ? `, ${order.shipping.line2}` : ""}
            </p>
            <p className="text-zinc-600 dark:text-zinc-400">
              {order.shipping.city}, {order.shipping.state} {order.shipping.postal_code}
            </p>
            <p className="text-zinc-600 dark:text-zinc-400">{order.shipping.country}</p>
          </div>
          <div className="text-right">
            <p className="font-medium text-zinc-900 dark:text-zinc-50">Order Status</p>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">{ORDER_STATUS_LABELS[order.order_status]}</p>
          </div>
        </div>

        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <th className="py-2 font-medium">Item</th>
              <th className="py-2 text-right font-medium">Price</th>
              <th className="py-2 text-right font-medium">Qty</th>
              <th className="py-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-zinc-100 dark:border-zinc-900">
                <td className="py-2 text-zinc-800 dark:text-zinc-200">{item.product_name}</td>
                <td className="py-2 text-right text-zinc-600 dark:text-zinc-400">{formatPriceCents(item.unit_price_cents)}</td>
                <td className="py-2 text-right text-zinc-600 dark:text-zinc-400">{item.quantity}</td>
                <td className="py-2 text-right text-zinc-800 dark:text-zinc-200">{formatPriceCents(item.line_total_cents)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 ml-auto w-48 space-y-1 text-sm">
          <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
            <span>Subtotal</span>
            <span>{formatPriceCents(order.subtotal_cents)}</span>
          </div>
          <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
            <span>Discount</span>
            <span>-{formatPriceCents(order.discount_cents)}</span>
          </div>
          <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
            <span>Delivery</span>
            <span>{formatPriceCents(order.delivery_charge_cents)}</span>
          </div>
          <div className="flex justify-between border-t border-zinc-200 pt-1 font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">
            <span>Total</span>
            <span>{formatPriceCents(order.total_cents)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
