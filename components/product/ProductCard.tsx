import Link from "next/link";
import type { ProductListItem } from "@/types/product";
import { discountedPriceCents, formatPriceCents } from "@/lib/format";
import { TiltCard } from "@/components/animations/TiltCard";
import { InteractiveProductVisual } from "@/components/product/InteractiveProductVisual";
import { QuickAddButton } from "@/components/product/QuickAddButton";
import { getProductVideo } from "@/lib/product-videos";
import { getSpiceVisual, hashString } from "@/lib/spice-visuals";

/**
 * Single-responsibility product card — used by both the /shop grid
 * (PRODUCT-14) and the landing page's collection section (LANDING-03).
 * Redesigned 2026-09-16 for a richer, less generic feel: a per-product
 * spice-colour ambient glow behind the image ties every card back to the
 * brand palette used elsewhere (Hero, category tiles), and the footer is a
 * single full-width Add to Cart action instead of two competing buttons —
 * the image/name/price area is already a Link to the product page, so a
 * second "View Product" button was pure redundancy.
 *
 * Hovering the image cycles its real photos in place, or plays a short
 * video for the subset of products that have one (InteractiveProductVisual
 * + lib/product-videos.ts). The name/price/CTA row stays visible by default
 * (not hover-gated) so touch devices get the same information without
 * needing hover, per FRONTEND_RULES.md §13/§11.
 *
 * `highlighted` lets a parent (the collection grid's sequential
 * auto-showcase) drive the same active/playing state as hover, without
 * this component needing to be a Client Component itself — it has no
 * server-exclusive dependencies, so it renders fine either as real RSC
 * markup (/shop) or as a plain client-side function when imported from a
 * "use client" parent (FeaturedProducts). `dimmed` is the complementary
 * "focus state" — the rest of the grid eases back slightly while a sibling
 * is highlighted, so the cycling spotlight reads as a real focus pull, not
 * just a border colour swap. Both use plain CSS transitions (not Framer
 * Motion) precisely so this file can stay hook-free and safe to render as
 * real RSC markup.
 */
export function ProductCard({
  product,
  highlighted = false,
  dimmed = false,
}: {
  product: ProductListItem;
  highlighted?: boolean;
  dimmed?: boolean;
}) {
  const isOutOfStock = product.stock_quantity <= 0;
  const hasDiscount = product.discount_percent > 0;
  const discountedCents = discountedPriceCents(product.price_cents, product.discount_percent);
  const visual = getSpiceVisual(product.slug);

  return (
    <TiltCard className={`group h-full transition-opacity duration-700 ${dimmed ? "opacity-50" : "opacity-100"}`}>
      <div
        className={`relative flex h-full flex-col overflow-hidden rounded-3xl border bg-white transition-all duration-700 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:border-brand-300 hover:shadow-xl hover:shadow-zinc-900/10 dark:bg-zinc-900 dark:hover:border-brand-700 dark:hover:shadow-black/40 ${
          highlighted
            ? "-translate-y-1.5 scale-[1.03] border-brand-400 shadow-2xl shadow-brand-500/25 dark:border-brand-600"
            : "border-zinc-200 dark:border-zinc-800"
        }`}
      >
        <Link href={`/products/${product.slug}`} className="flex flex-1 flex-col p-4">
          <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-2xl">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-6 -z-10 rounded-full blur-2xl transition-opacity duration-300 motion-safe:animate-float group-hover:opacity-80"
              style={{
                backgroundColor: visual.glow,
                opacity: highlighted ? 0.8 : 0.45,
                animationDelay: `${(hashString(product.slug) % 5) * 0.3}s`,
              }}
            />
            <InteractiveProductVisual
              images={product.images}
              seed={product.slug}
              name={product.name}
              className={`h-full w-full rounded-2xl transition-transform duration-700 ease-out group-hover:scale-110 ${highlighted ? "scale-110" : ""}`}
              videoUrl={getProductVideo(product.slug)}
              forcePlay={highlighted}
            />
            {isOutOfStock && (
              <span className="pointer-events-none absolute left-2 top-2 z-10 rounded-full bg-zinc-900/80 px-2 py-0.5 text-xs font-medium text-white">
                Out of stock
              </span>
            )}
            {hasDiscount && !isOutOfStock && (
              <span className="pointer-events-none absolute right-2 top-2 z-10 rounded-full bg-brand-500 px-2 py-0.5 text-xs font-semibold text-white shadow-sm">
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

        <div className="border-t border-zinc-100 p-3 dark:border-zinc-800">
          <QuickAddButton productId={product.id} inStock={!isOutOfStock} stockQuantity={product.stock_quantity} />
        </div>
      </div>
    </TiltCard>
  );
}
