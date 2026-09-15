"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/lib/cart/useCart";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { formatPriceCents } from "@/lib/format";

export default function CartPage() {
  const { data: cart, isPending, isError, refetch } = useCart();

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Your Cart</h1>

      {isPending && (
        <div className="mt-8 space-y-4" aria-busy="true">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
          ))}
        </div>
      )}

      {isError && (
        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/30">
          <p className="text-sm text-red-700 dark:text-red-300">Unable to load your cart. Please try again.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 rounded-md border border-red-300 px-4 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/40"
          >
            Retry
          </button>
        </div>
      )}

      {cart && cart.items.length === 0 && (
        <div className="mt-12 text-center">
          <p className="text-zinc-500 dark:text-zinc-400">Your cart is empty.</p>
          <Link
            href="/shop"
            className="mt-4 inline-block rounded-md bg-brand-500 px-5 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            Continue Shopping
          </Link>
        </div>
      )}

      {cart && cart.items.length > 0 && (
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          <ul className="md:col-span-2">
            <AnimatePresence initial={false}>
              {cart.items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </AnimatePresence>
          </ul>

          <motion.div
            layout
            className="h-fit rounded-xl border border-zinc-200 p-5 dark:border-zinc-800"
          >
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Order Summary</h2>

            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <dt>Subtotal</dt>
                <dd>{formatPriceCents(cart.subtotal_cents)}</dd>
              </div>
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <dt>Delivery</dt>
                <dd>{cart.delivery_charge_cents === 0 ? "Free" : formatPriceCents(cart.delivery_charge_cents)}</dd>
              </div>
              {cart.discount_cents > 0 && (
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <dt>Discount</dt>
                  <dd>-{formatPriceCents(cart.discount_cents)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-zinc-200 pt-2 text-base font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">
                <dt>Total</dt>
                <dd>{formatPriceCents(cart.total_cents)}</dd>
              </div>
            </dl>

            <Link
              href="/checkout"
              className="mt-5 block rounded-md bg-brand-500 px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-brand-600"
            >
              Proceed to Checkout
            </Link>
          </motion.div>
        </div>
      )}
    </main>
  );
}
