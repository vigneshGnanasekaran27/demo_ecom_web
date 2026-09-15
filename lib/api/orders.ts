import { apiClient } from "@/lib/api/client";
import type { Order, OrderWithRazorpay, ShippingDetailsInput } from "@/types/order";

export interface OrderListResult {
  orders: Order[];
  meta: { page: number; per_page: number; total: number };
}

export const ordersApi = {
  create: async (shipping: ShippingDetailsInput): Promise<OrderWithRazorpay> => {
    const { data } = await apiClient<OrderWithRazorpay>("/api/v1/orders", {
      method: "POST",
      body: { shipping },
    });
    return data;
  },

  list: async (): Promise<OrderListResult> => {
    const { data, meta } = await apiClient<Order[]>("/api/v1/orders");
    return { orders: data, meta: meta ?? { page: 1, per_page: data.length, total: data.length } };
  },

  get: async (id: number | string): Promise<Order> => {
    const { data } = await apiClient<Order>(`/api/v1/orders/${id}`);
    return data;
  },
};
