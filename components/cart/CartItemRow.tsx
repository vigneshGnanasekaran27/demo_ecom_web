"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatPriceCents } from "@/lib/format";
import { useRemoveCartItem, useUpdateCartItem } from "@/lib/cart/useCart";
import type { CartItem } from "@/types/cart";

export function CartItemRow({ item }: { item: CartItem }) {
  const { mutate: updateItem, isPending: isUpdating } = useUpdateCartItem();
  const { mutate: removeItem, isPending: isRemoving } = useRemoveCartItem();

  const isBusy = isUpdating || isRemoving;
  const atStockLimit = item.quantity >= item.product.stock_quantity;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.2 }}
      className="flex gap-4 border-b border-zinc-200 py-4 last:border-b-0 dark:border-zinc-800"
    >
      <Link
        href={`/products/${item.product.slug}`}
        className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800"
      >
        {item.product.image?.url && (
          <Image src={item.product.image.url} alt={item.product.name} fill sizes="80px" className="object-cover" />
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link
              href={`/products/${item.product.slug}`}
              className="text-sm font-medium text-zinc-900 hover:text-brand-600 dark:text-zinc-50 dark:hover:text-brand-400"
            >
              {item.product.name}
            </Link>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{formatPriceCents(item.unit_price_cents)}</p>
          </div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{formatPriceCents(item.line_total_cents)}</p>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center rounded-md border border-zinc-300 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => updateItem({ itemId: item.id, quantity: item.quantity - 1 })}
              disabled={isBusy || item.quantity <= 1}
              aria-label="Decrease quantity"
              className="px-2.5 py-1 text-sm text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-300"
            >
              −
            </button>
            <span className="w-6 text-center text-sm text-zinc-900 dark:text-zinc-50">{item.quantity}</span>
            <button
              type="button"
              onClick={() => updateItem({ itemId: item.id, quantity: item.quantity + 1 })}
              disabled={isBusy || atStockLimit}
              aria-label="Increase quantity"
              title={atStockLimit ? "No more stock available" : undefined}
              className="px-2.5 py-1 text-sm text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-300"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={() => removeItem(item.id)}
            disabled={isBusy}
            className="text-sm text-zinc-500 underline-offset-2 hover:text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-400 dark:hover:text-red-400"
          >
            Remove
          </button>
        </div>
      </div>
    </motion.li>
  );
}
