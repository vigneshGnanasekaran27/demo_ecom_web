"use client";

import { useEffect } from "react";
import { useAdminReceipts } from "@/lib/admin/useAdminOrders";
import { OrderReceiptView } from "@/components/order/OrderReceiptView";
import type { AdminOrderStatusFilter } from "@/types/order";
import type { AdminStage } from "@/lib/api/admin";

/**
 * Bulk receipt download using whatever status/date filter is currently
 * active at the top of the Orders/Dispatch/Delivery table (per the
 * client's request) — fetches full detail for every matching order,
 * renders them stacked with a page break between each, and triggers the
 * browser print dialog ("Save as PDF" or a real printer for dispatch's
 * packing labels).
 */
export function BulkReceiptButton({
  status,
  stage,
  from,
  to,
  count,
}: {
  status?: AdminOrderStatusFilter;
  stage?: AdminStage;
  from?: string;
  to?: string;
  count: number;
}) {
  const { mutate, isPending, data } = useAdminReceipts();

  // Fires once per new mutation result (React Query keeps `data` referentially
  // stable between renders until the next successful mutate call) — waits a
  // tick so the hidden print-only receipts have actually rendered first.
  useEffect(() => {
    if (!data) return;
    const timer = setTimeout(() => window.print(), 150);
    return () => clearTimeout(timer);
  }, [data]);

  const handleClick = () => {
    mutate({ status, stage, from: from || undefined, to: to || undefined });
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending || count === 0}
        className="flex items-center gap-1.5 rounded-md bg-brand-500 px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12M12 16.5V3" />
        </svg>
        {isPending ? "Preparing..." : `Download Receipts (${count})`}
      </button>

      {data && (
        <div className="hidden print:block">
          {data.map((order, index) => (
            <OrderReceiptView
              key={order.id}
              order={order}
              hideChrome
              className={index < data.length - 1 ? "break-after-page" : ""}
            />
          ))}
        </div>
      )}
    </>
  );
}
