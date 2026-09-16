import { apiClient } from "@/lib/api/client";
import type { AdminOrderDetail, AdminOrderListItem, AdminOrderStatusFilter, Order } from "@/types/order";

export interface AdminOrderListResult {
  orders: AdminOrderListItem[];
  meta: { page: number; per_page: number; total: number };
}

export interface AbandonedCartListResult {
  orders: AdminOrderDetail[];
  meta: { page: number; per_page: number; total: number };
}

export type AdminStage = "dispatch" | "delivery";

export interface AdminOrderListParams {
  status?: AdminOrderStatusFilter;
  stage?: AdminStage;
  from?: string;
  to?: string;
  page?: number;
  per_page?: number;
}

export interface AbandonedListParams {
  page?: number;
  per_page?: number;
}

export interface ReceiptsParams {
  from?: string;
  to?: string;
  status?: AdminOrderStatusFilter;
  stage?: AdminStage;
}

function buildQuery(params: Record<string, string | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) query.set(key, value);
  }
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export const adminApi = {
  listOrders: async (params: AdminOrderListParams = {}): Promise<AdminOrderListResult> => {
    const qs = buildQuery({
      status: params.status,
      stage: params.stage,
      from: params.from,
      to: params.to,
      page: params.page ? String(params.page) : undefined,
      per_page: params.per_page ? String(params.per_page) : undefined,
    });
    const { data, meta } = await apiClient<AdminOrderListItem[]>(`/api/v1/admin/orders${qs}`);
    return { orders: data, meta: meta ?? { page: 1, per_page: data.length, total: data.length } };
  },

  listAbandoned: async (params: AbandonedListParams = {}): Promise<AbandonedCartListResult> => {
    const qs = buildQuery({
      page: params.page ? String(params.page) : undefined,
      per_page: params.per_page ? String(params.per_page) : undefined,
    });
    const { data, meta } = await apiClient<AdminOrderDetail[]>(`/api/v1/admin/orders/abandoned${qs}`);
    return { orders: data, meta: meta ?? { page: 1, per_page: data.length, total: data.length } };
  },

  getOrder: async (orderId: number): Promise<AdminOrderDetail> => {
    const { data } = await apiClient<AdminOrderDetail>(`/api/v1/admin/orders/${orderId}`);
    return data;
  },

  updateOrderStatus: async (orderId: number, status: string, note?: string): Promise<Order> => {
    const { data } = await apiClient<Order>(`/api/v1/admin/orders/${orderId}/status`, {
      method: "PATCH",
      body: { status, note },
    });
    return data;
  },

  // Batch receipt data for printing/downloading (individual or bulk-by-
  // filter) — a plain array, not paginated, since it's meant to be printed
  // as one job.
  listReceipts: async (params: ReceiptsParams = {}): Promise<AdminOrderDetail[]> => {
    const qs = buildQuery({ from: params.from, to: params.to, status: params.status, stage: params.stage });
    const { data } = await apiClient<AdminOrderDetail[]>(`/api/v1/admin/orders/receipts${qs}`);
    return data;
  },
};
