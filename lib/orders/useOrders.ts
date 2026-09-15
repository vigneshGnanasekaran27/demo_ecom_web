"use client";

import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "@/lib/api/orders";

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: ordersApi.list,
    // A 401/404 here is a real, final answer (not logged in / not this
    // identity's order) — retrying it just delays the error state for no
    // benefit, same reasoning as useCurrentUser's retry: false.
    retry: false,
  });
}

export function useOrder(id: number | string) {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: () => ordersApi.get(id),
    retry: false,
  });
}
