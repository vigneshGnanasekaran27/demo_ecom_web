import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

// Only two functional roles exist (DECISION-032): "customer" and "admin".
// The DB enum still technically allows manager/warehouse/dispatch/delivery
// for future flexibility, but no UI treats them as internal staff anymore
// — "Orders"/"Dispatch"/"Abandoned Carts" are just views inside one admin
// account, not separate role-gated logins.
const INTERNAL_ROLES = ["admin"];

/**
 * UX-only gate for internal routes — redirects logged-out visitors to /login
 * and non-admins away from /admin/*. This is NOT the real security
 * boundary; every internal API endpoint must still enforce authorization
 * server-side via authorize_role!(:admin), since this proxy (formerly
 * "middleware" — renamed by Next.js 16) is trivially bypassable by calling
 * the API directly.
 */
export async function proxy(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", request.nextUrl.pathname);

  const cookieHeader = request.headers.get("cookie") ?? "";
  if (!cookieHeader.includes("access_token=")) {
    return NextResponse.redirect(loginUrl);
  }

  try {
    const response = await fetch(`${API_URL}/api/v1/me`, {
      headers: { cookie: cookieHeader },
    });

    if (!response.ok) {
      return NextResponse.redirect(loginUrl);
    }

    const { data } = await response.json();
    if (!INTERNAL_ROLES.includes(data.role)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } catch {
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
