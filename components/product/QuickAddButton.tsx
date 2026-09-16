"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAddToCart, useCart, useUpdateCartItem } from "@/lib/cart/useCart";

/**
 * Card-level cart control — the product detail page's AddToCartButton has
 * its own quantity selector; this is the grid/collection context.
 * Once a product is in the cart it swaps from "Add to Cart" to a −/qty/+
 * stepper (same disabled-at-1 / disabled-at-stock rules and styling as
 * CartItemRow's stepper, reused verbatim for consistency) that edits the
 * cart directly, without leaving the page. Extracted as its own client
 * component so ProductCard itself can stay a Server Component
 * (FRONTEND_RULES.md §1).
 */
const SIZE_CLASSES = {
  sm: "px-3 py-1.5 text-xs",
  lg: "px-6 py-3 text-sm",
};

export function QuickAddButton({
  productId,
  inStock,
  stockQuantity,
  size = "sm",
}: {
  productId: number;
  inStock: boolean;
  stockQuantity?: number;
  size?: "sm" | "lg";
}) {
  // The server has no cart data to render with, so it always renders "Add to
  // Cart". The client's cached cart query can resolve before the first
  // paint (e.g. after a client-side navigation), which would otherwise make
  // the very first client render disagree with the server's HTML. Gating
  // the cart-aware branch behind `mounted` keeps that first render
  // identical; it upgrades to the stepper a tick later if already in cart.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional post-hydration flip, see comment above
    setMounted(true);
  }, []);

  const { data: cart } = useCart();
  const cartItem = mounted ? cart?.items.find((item) => item.product_id === productId) : undefined;
  const { mutate: addToCart, isPending, isSuccess, isError, reset } = useAddToCart();
  const { mutate: updateItem, isPending: isUpdating } = useUpdateCartItem();

  const stop = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  if (cartItem) {
    const isBusy = isUpdating;
    const limit = stockQuantity ?? cartItem.product.stock_quantity;
    const atStockLimit = cartItem.quantity >= limit;

    return (
      <div
        onClick={stop}
        className={`flex items-center justify-center rounded-md border border-zinc-300 dark:border-zinc-700 ${
          size === "lg" ? "py-1.5" : "py-0.5"
        }`}
      >
        <button
          type="button"
          onClick={(e) => {
            stop(e);
            if (cartItem.quantity <= 1) return;
            updateItem({ itemId: cartItem.id, quantity: cartItem.quantity - 1 });
          }}
          disabled={isBusy || cartItem.quantity <= 1}
          aria-label="Decrease quantity"
          className="px-3 text-sm text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-300"
        >
          −
        </button>
        <span className="w-6 text-center text-sm text-zinc-900 dark:text-zinc-50">{cartItem.quantity}</span>
        <button
          type="button"
          onClick={(e) => {
            stop(e);
            updateItem({ itemId: cartItem.id, quantity: cartItem.quantity + 1 });
          }}
          disabled={isBusy || atStockLimit}
          aria-label="Increase quantity"
          title={atStockLimit ? "No more stock available" : undefined}
          className="px-3 text-sm text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-300"
        >
          +
        </button>
      </div>
    );
  }

  const handleClick = (event: React.MouseEvent) => {
    stop(event);
    addToCart({ productId, quantity: 1 }, { onSettled: () => setTimeout(reset, 2000) });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!inStock || isPending}
      className={`w-full rounded-md bg-brand-500 font-medium text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-brand-500/40 ${SIZE_CLASSES[size]}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isPending ? "pending" : isSuccess ? "success" : isError ? "error" : "idle"}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
          transition={{ duration: 0.12 }}
          className="block"
        >
          {!inStock ? "Sold out" : isPending ? "Adding..." : isSuccess ? "Added ✓" : isError ? "Try again" : "Add to Cart"}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
