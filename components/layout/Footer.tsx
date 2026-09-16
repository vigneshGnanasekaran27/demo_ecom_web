import Link from "next/link";

const shopLinks = [
  { href: "/shop", label: "All products" },
  { href: "/cart", label: "Cart" },
  { href: "/orders", label: "Orders" },
];

const supportLinks = [
  { href: "/login", label: "Sign in" },
  { href: "/register", label: "Create account" },
];

/**
 * Shared footer (LANDING-06), rendered by the (shop) route group's layout
 * so it appears on every customer-facing page (LANDING-01's shared-layout
 * shape), not just the landing page.
 */
export function Footer() {
  return (
    <footer className="border-t border-zinc-200 print:hidden dark:border-zinc-800">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-8 px-4 py-12 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-2">
          <span className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Demo<span className="text-brand-500">Ecom</span>
          </span>
          <p className="mt-2 max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
            Premium products, honest pricing, and a checkout experience built for speed.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Shop</h3>
          <ul className="mt-3 flex flex-col gap-2">
            {shopLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Support</h3>
          <ul className="mt-3 flex flex-col gap-2">
            {supportLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-zinc-200 px-4 py-4 dark:border-zinc-800">
        <p className="mx-auto w-full max-w-6xl text-xs text-zinc-500 dark:text-zinc-500">
          © {new Date().getFullYear()} DemoEcom. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
