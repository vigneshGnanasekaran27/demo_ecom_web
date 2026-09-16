// Server Components/route handlers call Rails directly (no browser
// involved, so no cookie policy to work around). The browser instead calls
// this app's own origin at a relative path, proxied to Rails by
// next.config.ts's rewrite — see that file for why (third-party cookie
// blocking on the frontend/backend's separate domains).
const API_BASE_URL =
  typeof window === "undefined" ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001") : "";

/**
 * Matches BACKEND_RULES.md §6's error envelope: { error: { code, message, details } }.
 */
interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Matches BACKEND_RULES.md §6's success envelope: { data } or { data, meta } for collections.
 */
export interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    per_page: number;
    total: number;
  };
}

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;

  constructor(message: string, options: { code: string; status: number; details?: unknown }) {
    super(message);
    this.name = "ApiError";
    this.code = options.code;
    this.status = options.status;
    this.details = options.details;
  }
}

interface ApiClientOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

/**
 * Single fetch wrapper all lib/api/* modules go through. Not for direct use by
 * UI components (FRONTEND_RULES.md §4) — wrap it in a typed function per resource
 * instead (e.g. productApi.getProducts()).
 */
export async function apiClient<T>(path: string, options: ApiClientOptions = {}): Promise<ApiResponse<T>> {
  const { body, headers, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    // Sends the httpOnly auth/guest-session cookies (DECISION-014) on every
    // request, including cross-origin ones between Vercel and Render.
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json") ?? false;
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorBody = payload as ApiErrorBody | null;
    throw new ApiError(errorBody?.error?.message ?? "Something went wrong. Please try again.", {
      code: errorBody?.error?.code ?? "UNKNOWN_ERROR",
      status: response.status,
      details: errorBody?.error?.details,
    });
  }

  return payload as ApiResponse<T>;
}
