"use client";

import { use } from "react";
import { useOrder } from "@/lib/orders/useOrders";
import { OrderReceiptView } from "@/components/order/OrderReceiptView";

export default function OrderReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: order, isPending, isError } = useOrder(id);

  if (isPending) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-8" aria-busy="true">
        <div className="h-96 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
      </main>
    );
  }

  if (isError || !order) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-16 text-center">
        <p className="text-zinc-500 dark:text-zinc-400">Unable to load this receipt.</p>
      </main>
    );
  }

  return <OrderReceiptView order={order} />;
}
