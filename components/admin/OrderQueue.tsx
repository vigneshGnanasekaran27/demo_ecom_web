"use client";

import { useState } from "react";
import { useAdminOrders } from "@/lib/admin/useAdminOrders";
import { OrderTable } from "@/components/admin/OrderTable";
import { BulkReceiptButton } from "@/components/admin/BulkReceiptButton";
import type { AdminStage } from "@/lib/api/admin";
import type { AdminOrderStatusFilter, OrderStatus } from "@/types/order";

/**
 * Shared shape for the Orders/Dispatch/Delivery pages — only the title,
 * which statuses appear in the filter dropdown, which transitions are
 * offered, and the fixed `stage` (Dispatch/Delivery's own scope) differ.
 * The backend (Api::V1::Admin::OrdersController) is the source of truth
 * for what's actually returned; this component just drives the filter UI
 * and the bulk-receipt-by-filter action.
 */
export function OrderQueue({
  title,
  description,
  statusOptions,
  transitions,
  stage,
}: {
  title: string;
  description?: string;
  statusOptions: { value: AdminOrderStatusFilter; label: string }[];
  transitions: Record<OrderStatus, OrderStatus[]>;
  stage?: AdminStage;
}) {
  const [statusFilter, setStatusFilter] = useState<AdminOrderStatusFilter | "">("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const { data, isPending, isError, refetch } = useAdminOrders({
    status: statusFilter || undefined,
    stage,
    from: from || undefined,
    to: to || undefined,
  });

  const hasDateFilter = Boolean(from || to);
  const clearDates = () => {
    setFrom("");
    setTo("");
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{title}</h1>
          {description && <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>}
        </div>
        <div className="flex flex-wrap items-end gap-2.5">
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              aria-label="From date"
              className="rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
            <span className="text-sm text-zinc-400">–</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              aria-label="To date"
              className="rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
            {hasDateFilter && (
              <button
                type="button"
                onClick={clearDates}
                className="text-xs text-zinc-400 underline-offset-2 hover:text-zinc-600 hover:underline dark:hover:text-zinc-300"
              >
                Clear
              </button>
            )}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AdminOrderStatusFilter | "")}
            className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          >
            <option value="">All statuses</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {data && (
            <BulkReceiptButton status={statusFilter || undefined} stage={stage} from={from} to={to} count={data.orders.length} />
          )}
        </div>
      </div>

      <div className="mt-6">
        {isPending && <div className="h-64 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" aria-busy="true" />}

        {isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/30">
            <p className="text-sm text-red-700 dark:text-red-300">Unable to load orders.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-3 rounded-md border border-red-300 px-4 py-1.5 text-sm font-medium text-red-700 dark:border-red-800 dark:text-red-300"
            >
              Retry
            </button>
          </div>
        )}

        {data && (
          <>
            <OrderTable orders={data.orders} transitions={transitions} />
            <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
              Showing {data.orders.length} of {data.meta.total} order{data.meta.total === 1 ? "" : "s"}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
