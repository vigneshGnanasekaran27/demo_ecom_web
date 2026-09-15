import { apiClient } from "@/lib/api/client";
import type { User } from "@/types/user";

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  register: async (payload: RegisterPayload): Promise<User> => {
    const { data } = await apiClient<User>("/api/v1/auth/register", {
      method: "POST",
      body: payload,
    });
    return data;
  },

  login: async (payload: LoginPayload): Promise<User> => {
    const { data } = await apiClient<User>("/api/v1/auth/login", {
      method: "POST",
      body: payload,
    });
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient<null>("/api/v1/auth/logout", { method: "DELETE" });
  },

  refresh: async (): Promise<void> => {
    await apiClient<{ status: string }>("/api/v1/auth/refresh", { method: "POST" });
  },

  me: async (): Promise<User> => {
    const { data } = await apiClient<User>("/api/v1/me");
    return data;
  },
};
