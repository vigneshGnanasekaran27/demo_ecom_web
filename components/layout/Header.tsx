"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { useCurrentUser, useRefreshSession } from "@/lib/auth/session";
import { useCartItemCount } from "@/lib/cart/useCart";

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/cart", label: "Cart" },
  { href: "/orders", label: "Orders" },
];

/**
 * Shared header/nav used by all customer-facing pages (LANDING-01).
 * Internal/admin routes (ADMIN-02) get their own separate shell
 * (app/(admin)/layout.tsx) — this stays customer-only chrome per
 * AI_RULES.md §7, but shows a single "Admin" link for the admin role
 * (DECISION-032 — only "customer" and "admin" are functional roles) so
 * the console is actually discoverable, rather than only reachable by
 * typing /admin/orders directly.
 */
export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: user, isPending } = useCurrentUser();
  const cartItemCount = useCartItemCount();
  const refreshSession = useRefreshSession();
  const router = useRouter();

  const handleLogout = async () => {
    await authApi.logout();
    await refreshSession();
    setIsMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur print:hidden dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Demo<span className="text-brand-500">Ecom</span>
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
            >
              {link.label}
              {link.href === "/cart" && cartItemCount > 0 && (
                <span className="absolute -right-4 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-semibold text-white">
                  {cartItemCount}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 sm:flex">
          {isPending ? null : user ? (
            <>
              {user.role === "admin" && (
                <Link
                  href="/admin/orders"
                  className="rounded-md border border-brand-500 px-3 py-1.5 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950/30"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/orders"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
              >
                {user.full_name}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Log out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-brand-500 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-600"
            >
              Sign in
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-nav"
          aria-label="Toggle menu"
          className="flex h-9 w-9 items-center justify-center rounded-md text-zinc-700 hover:bg-zinc-100 sm:hidden dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            {isMenuOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {isMenuOpen && (
        <nav id="mobile-nav" className="border-t border-zinc-200 px-4 py-3 sm:hidden dark:border-zinc-800">
          <ul className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-200"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {!isPending && user && user.role === "admin" && (
              <li>
                <Link
                  href="/admin/orders"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-sm font-medium text-brand-600 dark:text-brand-400"
                >
                  Admin
                </Link>
              </li>
            )}
            <li>
              {isPending ? null : user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm font-medium text-zinc-700 dark:text-zinc-200"
                >
                  Log out
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-sm font-medium text-brand-600 dark:text-brand-400"
                >
                  Sign in
                </Link>
              )}
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
