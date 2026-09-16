"use client";

import { use } from "react";
import { useAdminOrder } from "@/lib/admin/useAdminOrders";
import { OrderReceiptView } from "@/components/order/OrderReceiptView";

/**
 * Admin/dispatch-side single receipt — same OrderReceiptView the customer
 * sees at /orders/[id]/receipt, but fetched through the role-scoped admin
 * endpoint so staff can print any order in their queue, not just their own.
 */
export default function AdminOrderReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: order, isPending, isError } = useAdminOrder(Number(id));

  if (isPending) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-8" aria-busy="true">
        <div className="h-96 animate-pulse rounded-xl bg-zinc-100" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16 text-center">
        <p className="text-zinc-500">Unable to load this receipt.</p>
      </div>
    );
  }

  return <OrderReceiptView order={order} />;
}
