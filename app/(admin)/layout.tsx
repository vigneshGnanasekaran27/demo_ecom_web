"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { authApi } from "@/lib/api/auth";
import { useCurrentUser, useRefreshSession } from "@/lib/auth/session";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const iconProps = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "h-4.5 w-4.5 flex-shrink-0",
};

// Simplified to one admin role (DECISION-032) — Orders, Dispatch,
// Delivery, and Abandoned Carts are just curated views inside one admin
// account, not separate role-gated logins. Every tab is visible to every admin.
const NAV_ITEMS: NavItem[] = [
  {
    href: "/admin/orders",
    label: "Orders",
    icon: (
      <svg {...iconProps}>
        <path d="M3 7.5 12 3l9 4.5M3 7.5v9L12 21l9-4.5v-9M3 7.5 12 12m0 0 9-4.5M12 12v9" />
      </svg>
    ),
  },
  {
    href: "/admin/dispatch",
    label: "Dispatch",
    icon: (
      <svg {...iconProps}>
        <path d="M3 16.5V6.75A1.75 1.75 0 0 1 4.75 5h8.5A1.75 1.75 0 0 1 15 6.75v9.75M3 16.5h12m-12 0a1.5 1.5 0 1 0 3 0m9-0a1.5 1.5 0 1 0 3 0m-3 0h3m0 0v-4.5l-2.5-3H15" />
      </svg>
    ),
  },
  {
    href: "/admin/delivery",
    label: "Delivery",
    icon: (
      <svg {...iconProps}>
        <path d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25h5.379a1.5 1.5 0 0 1 1.06.44l2.122 2.121a1.5 1.5 0 0 1 .439 1.06v4.129a1.5 1.5 0 0 1-.44 1.06l-.44.44M14.25 7.5V15h-3m3-7.5H8.25a2.25 2.25 0 0 0-2.25 2.25v5.25M3 8.25h9" />
      </svg>
    ),
  },
  {
    href: "/admin/abandoned",
    label: "Abandoned Carts",
    icon: (
      <svg {...iconProps}>
        <path d="M2.25 3h1.5l.9 4.5m0 0L6 15h10.5l2.25-7.5H4.65M4.65 7.5h15.6M9 19.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm9 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
      </svg>
    ),
  },
];

const COLLAPSE_STORAGE_KEY = "admin-nav-collapsed";

/**
 * Internal admin shell (ADMIN-02, simplified per DECISION-032) — Orders,
 * Dispatch, Delivery, and Abandoned Carts as side-nav tabs inside one
 * admin account. Full-bleed layout (no customer-site max-width) so the
 * data tables get the whole screen; the side nav collapses to an
 * icon-only rail (remembered via localStorage) to give tables even more
 * room. `proxy.ts` already redirects non-admins away from /admin/* before
 * this even renders — this is UX chrome only, not the security boundary
 * (every action is still gated server-side via authorize_role!(:admin)).
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: user } = useCurrentUser();
  const pathname = usePathname();
  const refreshSession = useRefreshSession();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // localStorage is unavailable during SSR, so the collapsed/expanded
    // choice can only be read after mount — a legitimate exception to
    // "avoid setState in an effect" (there is no way to synchronize from
    // this browser-only external store during render).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollapsed(localStorage.getItem(COLLAPSE_STORAGE_KEY) === "true");
    setHydrated(true);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      const next = !current;
      localStorage.setItem(COLLAPSE_STORAGE_KEY, String(next));
      return next;
    });
  };

  const handleLogout = async () => {
    await authApi.logout();
    await refreshSession();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur print:hidden dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="flex w-full items-center justify-between px-5 py-3.5">
          <Link href="/admin/orders" className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Demo<span className="text-brand-500">Ecom</span>
            <span className="ml-2 rounded-full bg-brand-500/10 px-2 py-0.5 text-[11px] font-medium tracking-wide text-brand-600 dark:text-brand-400">
              ADMIN
            </span>
          </Link>
          <div className="flex items-center gap-4">
            {user && <span className="text-sm text-zinc-500 dark:text-zinc-400">{user.full_name}</span>}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="flex w-full flex-1 items-stretch">
        <motion.nav
          animate={{ width: collapsed ? 64 : 208 }}
          initial={false}
          transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
          className={`flex-shrink-0 border-r border-zinc-200 bg-white/60 py-4 print:hidden dark:border-zinc-800 dark:bg-zinc-950/40 ${
            hydrated ? "" : "invisible"
          }`}
        >
          <ul className="space-y-1 px-2.5">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <li key={item.href} className="relative">
                  {isActive && (
                    <motion.div
                      layoutId="admin-nav-active"
                      className="absolute inset-0 rounded-md bg-brand-500/10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <Link
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "text-brand-600 dark:text-brand-400"
                        : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {item.icon}
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-2 px-2.5">
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={`h-4.5 w-4.5 flex-shrink-0 transition-transform ${collapsed ? "rotate-180" : ""}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
              {!collapsed && <span>Collapse</span>}
            </button>
          </div>
        </motion.nav>

        <main className="min-w-0 flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
