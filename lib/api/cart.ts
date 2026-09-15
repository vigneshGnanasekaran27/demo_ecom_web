import { apiClient } from "@/lib/api/client";
import type { Cart } from "@/types/cart";

export const cartApi = {
  get: async (): Promise<Cart> => {
    const { data } = await apiClient<Cart>("/api/v1/cart");
    return data;
  },

  addItem: async (productId: number, quantity = 1): Promise<Cart> => {
    const { data } = await apiClient<Cart>("/api/v1/cart/items", {
      method: "POST",
      body: { product_id: productId, quantity },
    });
    return data;
  },

  updateItem: async (itemId: number, quantity: number): Promise<Cart> => {
    const { data } = await apiClient<Cart>(`/api/v1/cart/items/${itemId}`, {
      method: "PATCH",
      body: { quantity },
    });
    return data;
  },

  removeItem: async (itemId: number): Promise<Cart> => {
    const { data } = await apiClient<Cart>(`/api/v1/cart/items/${itemId}`, {
      method: "DELETE",
    });
    return data;
  },
};
