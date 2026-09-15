"use client";

import { useAbandonedCarts } from "@/lib/admin/useAdminOrders";
import { AbandonedCartTable } from "@/components/admin/AbandonedCartTable";

export default function AbandonedCartsPage() {
  const { data, isPending, isError, refetch } = useAbandonedCarts();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Abandoned Carts</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Checkouts where a shipping address was entered but payment was never completed — not treated as orders
        anywhere else in the admin console.
      </p>

      <div className="mt-6">
        {isPending && <div className="h-64 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" aria-busy="true" />}

        {isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/30">
            <p className="text-sm text-red-700 dark:text-red-300">Unable to load abandoned carts.</p>
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
            <AbandonedCartTable carts={data.orders} />
            <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
              Showing {data.orders.length} of {data.meta.total} abandoned cart{data.meta.total === 1 ? "" : "s"}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
