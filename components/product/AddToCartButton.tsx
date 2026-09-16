"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAddToCart } from "@/lib/cart/useCart";
import { ApiError } from "@/lib/api/client";

/**
 * Quantity selector + real Add to Cart wiring (CART-02) for the product
 * detail page. Loading/error/success states per FRONTEND_RULES.md §9 —
 * never silently pretends to succeed.
 */
export function AddToCartButton({
  productId,
  inStock,
  stockQuantity,
}: {
  productId: number;
  inStock: boolean;
  stockQuantity: number;
}) {
  const [quantity, setQuantity] = useState(1);
  const atStockLimit = quantity >= stockQuantity;
  const { mutate, isPending, isSuccess, isError, error, reset } = useAddToCart();

  const handleAdd = () => {
    mutate(
      { productId, quantity },
      {
        onSettled: () => {
          setTimeout(reset, 2000);
        },
      }
    );
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-md border border-zinc-300 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={!inStock}
            aria-label="Decrease quantity"
            className="px-3 py-2 text-sm text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-300"
          >
            −
          </button>
          <span className="w-8 text-center text-sm text-zinc-900 dark:text-zinc-50">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(stockQuantity, q + 1))}
            disabled={!inStock || atStockLimit}
            aria-label="Increase quantity"
            title={atStockLimit ? "No more stock available" : undefined}
            className="px-3 py-2 text-sm text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-300"
          >
            +
          </button>
        </div>

        <motion.button
          type="button"
          onClick={handleAdd}
          disabled={!inStock || isPending}
          whileTap={{ scale: 0.97 }}
          className="flex-1 rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-brand-500/40"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isPending ? "pending" : isSuccess ? "success" : "idle"}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="block"
            >
              {!inStock ? "Out of Stock" : isPending ? "Adding..." : isSuccess ? "Added ✓" : "Add to Cart"}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>

      {isError && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error instanceof ApiError ? error.message : "Something went wrong. Please try again."}
        </p>
      )}
    </div>
  );
}
