"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi, type AbandonedListParams, type AdminOrderListParams, type ReceiptsParams } from "@/lib/api/admin";
import type { OrderStatus } from "@/types/order";

export function useAdminOrders(params: AdminOrderListParams) {
  return useQuery({
    queryKey: ["admin", "orders", params],
    queryFn: () => adminApi.listOrders(params),
    retry: false,
  });
}

export function useAbandonedCarts(params: AbandonedListParams = {}) {
  return useQuery({
    queryKey: ["admin", "abandoned", params],
    queryFn: () => adminApi.listAbandoned(params),
    retry: false,
  });
}

/** Full order detail for an expanded table row — fetched on demand, not eagerly for every row. */
export function useAdminOrder(orderId: number | null) {
  return useQuery({
    queryKey: ["admin", "orders", "detail", orderId],
    queryFn: () => adminApi.getOrder(orderId as number),
    enabled: orderId !== null,
    retry: false,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status, note }: { orderId: number; status: OrderStatus; note?: string }) =>
      adminApi.updateOrderStatus(orderId, status, note),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "orders", "detail", variables.orderId] });
    },
  });
}

export function useAdminReceipts() {
  return useMutation({
    mutationFn: (params: ReceiptsParams) => adminApi.listReceipts(params),
  });
}
