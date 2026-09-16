"use client";

import { useState } from "react";
import { useAbandonedCarts } from "@/lib/admin/useAdminOrders";
import { AbandonedCartTable } from "@/components/admin/AbandonedCartTable";

export default function AbandonedCartsPage() {
  const [page, setPage] = useState(1);
  const { data, isPending, isError, refetch } = useAbandonedCarts({ page });
  const totalPages = data ? Math.max(1, Math.ceil(data.meta.total / data.meta.per_page)) : 1;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Abandoned Carts</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Checkouts where a shipping address was entered but payment was never completed — not treated as orders
        anywhere else in the admin console.
      </p>

      <div className="mt-6">
        {isPending && <div className="h-64 animate-pulse rounded-lg bg-zinc-100" aria-busy="true" />}

        {isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm text-red-700">Unable to load abandoned carts.</p>
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
            <AbandonedCartTable carts={data.orders} />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-zinc-500">
                Showing {data.orders.length} of {data.meta.total} abandoned cart{data.meta.total === 1 ? "" : "s"}
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
