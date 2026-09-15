"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import type { User } from "@/types/user";

export const CURRENT_USER_QUERY_KEY = ["currentUser"] as const;

/**
 * App-wide access to the logged-in user (or null when signed out), backed by
 * GET /api/v1/me via TanStack Query — not a manually duplicated global store
 * (FRONTEND_RULES.md §7). A 401 from /me means "not logged in", not an error.
 */
export function useCurrentUser() {
  return useQuery<User | null>({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: async () => {
      try {
        return await authApi.me();
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null;
        throw error;
      }
    },
    retry: false,
    staleTime: 60_000,
  });
}

/** Call after a successful login/register/logout to resync the session. */
export function useRefreshSession() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
}
