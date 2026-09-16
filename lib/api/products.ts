import { apiClient } from "@/lib/api/client";
import type { ProductDetail, ProductListItem } from "@/types/product";

export interface ProductListParams {
  page?: number;
  per_page?: number;
  q?: string;
  category?: string;
}

export interface ProductListResult {
  products: ProductListItem[];
  meta: { page: number; per_page: number; total: number };
}

export const productsApi = {
  list: async (params: ProductListParams = {}): Promise<ProductListResult> => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.per_page) query.set("per_page", String(params.per_page));
    if (params.q) query.set("q", params.q);
    if (params.category) query.set("category", params.category);
    const qs = query.toString();

    const { data, meta } = await apiClient<ProductListItem[]>(`/api/v1/products${qs ? `?${qs}` : ""}`);
    return { products: data, meta: meta ?? { page: 1, per_page: data.length, total: data.length } };
  },

  getBySlug: async (slug: string): Promise<ProductDetail> => {
    const { data } = await apiClient<ProductDetail>(`/api/v1/products/${encodeURIComponent(slug)}`);
    return data;
  },
};
