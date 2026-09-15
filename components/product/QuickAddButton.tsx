"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAddToCart } from "@/lib/cart/useCart";

/**
 * Card-level one-click add (quantity 1) — the product detail page's
 * AddToCartButton has its own quantity selector; this is deliberately
 * simpler for the grid/collection context. Extracted as its own client
 * component so ProductCard itself can stay a Server Component
 * (FRONTEND_RULES.md §1).
 */
export function QuickAddButton({ productId, inStock }: { productId: number; inStock: boolean }) {
  const { mutate, isPending, isSuccess, isError, reset } = useAddToCart();

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    mutate(
      { productId, quantity: 1 },
      { onSettled: () => setTimeout(reset, 2000) }
    );
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!inStock || isPending}
      className="flex-1 rounded-md bg-brand-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-brand-500/40"
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
