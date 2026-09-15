"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "@/lib/api/cart";
import type { Cart } from "@/types/cart";

export const CART_QUERY_KEY = ["cart"] as const;

/**
 * App-wide cart state, backed by GET /api/v1/cart via TanStack Query —
 * same pattern as useCurrentUser (FRONTEND_RULES.md §7). The backend is
 * always the source of truth for price/stock/totals (AI_RULES.md §8); this
 * hook never computes totals client-side, only displays what the API
 * returns.
 */
export function useCart() {
  return useQuery<Cart>({
    queryKey: CART_QUERY_KEY,
    queryFn: cartApi.get,
    staleTime: 10_000,
  });
}

/** Cheap header/nav item count derived from the cached cart, without a full useCart() subscription elsewhere forcing extra fetches. */
export function useCartItemCount() {
  const { data } = useCart();
  return data?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
}

function useCartMutation<TArgs>(mutationFn: (args: TArgs) => Promise<Cart>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (cart) => queryClient.setQueryData(CART_QUERY_KEY, cart),
  });
}

export function useAddToCart() {
  return useCartMutation(({ productId, quantity }: { productId: number; quantity?: number }) =>
    cartApi.addItem(productId, quantity)
  );
}

export function useUpdateCartItem() {
  return useCartMutation(({ itemId, quantity }: { itemId: number; quantity: number }) =>
    cartApi.updateItem(itemId, quantity)
  );
}

export function useRemoveCartItem() {
  return useCartMutation((itemId: number) => cartApi.removeItem(itemId));
}
