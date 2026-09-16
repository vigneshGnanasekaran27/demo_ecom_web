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
  const [page, setPage] = useState(1);
  const { data, isPending, isError, refetch } = useAdminOrders({
    status: statusFilter || undefined,
    stage,
    from: from || undefined,
    to: to || undefined,
    page,
  });

  const hasDateFilter = Boolean(from || to);
  const clearDates = () => {
    setFrom("");
    setTo("");
    setPage(1);
  };
  const updateStatusFilter = (value: AdminOrderStatusFilter | "") => {
    setStatusFilter(value);
    setPage(1);
  };
  const updateFrom = (value: string) => {
    setFrom(value);
    setPage(1);
  };
  const updateTo = (value: string) => {
    setTo(value);
    setPage(1);
  };
  const totalPages = data ? Math.max(1, Math.ceil(data.meta.total / data.meta.per_page)) : 1;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">{title}</h1>
          {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
        </div>
        <div className="flex flex-wrap items-end gap-2.5">
          <div className="flex items-center gap-2 rounded-md border border-zinc-300 bg-zinc-50 px-2.5 py-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 flex-shrink-0 text-zinc-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0V11.25a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5" />
            </svg>
            <input
              type="date"
              value={from}
              onChange={(e) => updateFrom(e.target.value)}
              aria-label="From date"
              className="border-0 bg-transparent p-0 text-sm text-zinc-900 focus:outline-none focus:ring-0"
            />
            <span className="text-sm text-zinc-400">to</span>
            <input
              type="date"
              value={to}
              onChange={(e) => updateTo(e.target.value)}
              aria-label="To date"
              className="border-0 bg-transparent p-0 text-sm text-zinc-900 focus:outline-none focus:ring-0"
            />
            {hasDateFilter && (
              <button
                type="button"
                onClick={clearDates}
                aria-label="Clear date range"
                className="ml-0.5 rounded-full p-0.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
                  <path strokeLinecap="round" d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => updateStatusFilter(e.target.value as AdminOrderStatusFilter | "")}
            className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900"
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
        {isPending && <div className="h-64 animate-pulse rounded-lg bg-zinc-100" aria-busy="true" />}

        {isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm text-red-700">Unable to load orders.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-3 rounded-md border border-red-300 px-4 py-1.5 text-sm font-medium text-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {data && (
          <>
            <OrderTable orders={data.orders} transitions={transitions} />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-zinc-500">
                Showing {data.orders.length} of {data.meta.total} order{data.meta.total === 1 ? "" : "s"}
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="rounded-md border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-zinc-500">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="rounded-md border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
