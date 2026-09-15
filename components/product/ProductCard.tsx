import Link from "next/link";
import type { ProductListItem } from "@/types/product";
import { discountedPriceCents, formatPriceCents } from "@/lib/format";
import { TiltCard } from "@/components/animations/TiltCard";
import { InteractiveProductVisual } from "@/components/product/InteractiveProductVisual";
import { QuickAddButton } from "@/components/product/QuickAddButton";

/**
 * Single-responsibility product card — used by both the /shop grid
 * (PRODUCT-14) and the landing page's collection section (LANDING-03).
 *
 * The whole card (image + name + price) is one Link to the product page —
 * hovering the image just cycles its real photos in place
 * (InteractiveProductVisual), it doesn't need special click-handling since
 * nothing is lazily mounted there anymore. The name/price/CTA row stays
 * visible by default (not hover-gated) so touch devices get the same
 * information without needing hover, per FRONTEND_RULES.md §13/§11.
 *
 * The add-to-cart button (QuickAddButton) is wired to the real cart API
 * (CART-02) — extracted as its own client component so this card itself
 * can stay a Server Component.
 */
export function ProductCard({ product }: { product: ProductListItem }) {
  const isOutOfStock = product.stock_quantity <= 0;
  const hasDiscount = product.discount_percent > 0;
  const discountedCents = discountedPriceCents(product.price_cents, product.discount_percent);

  return (
    <TiltCard className="group">
      <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-shadow duration-300 hover:shadow-xl hover:shadow-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:shadow-black/40">
        <Link href={`/products/${product.slug}`} className="flex flex-1 flex-col p-4">
          <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-xl">
            <InteractiveProductVisual
              images={product.images}
              seed={product.slug}
              name={product.name}
              className="h-full w-full"
            />
            {isOutOfStock && (
              <span className="pointer-events-none absolute left-2 top-2 z-10 rounded-full bg-zinc-900/80 px-2 py-0.5 text-xs font-medium text-white">
                Out of stock
              </span>
            )}
            {hasDiscount && !isOutOfStock && (
              <span className="pointer-events-none absolute right-2 top-2 z-10 rounded-full bg-brand-500 px-2 py-0.5 text-xs font-semibold text-white">
                {product.discount_percent}% off
              </span>
            )}
          </div>

          <h3 className="line-clamp-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">{product.name}</h3>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              {formatPriceCents(discountedCents)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-zinc-400 line-through">{formatPriceCents(product.price_cents)}</span>
            )}
          </div>
        </Link>

        <div className="flex gap-2 border-t border-zinc-100 p-3 dark:border-zinc-800">
          <Link
            href={`/products/${product.slug}`}
            className="flex-1 rounded-md border border-zinc-300 px-3 py-1.5 text-center text-xs font-medium text-zinc-700 transition-colors hover:border-brand-500 hover:text-brand-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-brand-400 dark:hover:text-brand-400"
          >
            View Product
          </Link>
          <QuickAddButton productId={product.id} inStock={!isOutOfStock} />
        </div>
      </div>
    </TiltCard>
  );
}
