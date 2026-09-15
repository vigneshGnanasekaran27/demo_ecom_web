import { apiClient } from "@/lib/api/client";
import type { Category } from "@/types/category";

export const categoriesApi = {
  list: async (): Promise<Category[]> => {
    const { data } = await apiClient<Category[]>("/api/v1/categories");
    return data;
  },
};
