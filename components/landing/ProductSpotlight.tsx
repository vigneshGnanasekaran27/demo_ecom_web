import Link from "next/link";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { InteractiveProductVisual } from "@/components/product/InteractiveProductVisual";
import { discountedPriceCents, formatPriceCents } from "@/lib/format";
import type { ProductDetail } from "@/types/product";

/**
 * Large interactive single-product showcase (landing-page brief §7.4) —
 * InteractiveProductVisual gives the "inspect the product" highlight
 * moment (hover/tap cycles through the product's real photos), plus richer
 * copy from the product's specifications jsonb.
 */
export function ProductSpotlight({ product }: { product: ProductDetail }) {
  const hasDiscount = product.discount_percent > 0;
  const discountedCents = discountedPriceCents(product.price_cents, product.discount_percent);
  const specs = product.specifications;
  const origin = typeof specs.origin === "string" ? specs.origin : null;
  const form = typeof specs.form === "string" ? specs.form : null;
  const netWeight = typeof specs.net_weight_g === "number" ? specs.net_weight_g : null;

  return (
    <ScrollReveal className="mx-auto w-full max-w-6xl px-4 py-20 sm:py-28">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="mx-auto w-full max-w-md">
          <InteractiveProductVisual
            images={product.images}
            seed={product.slug}
            name={product.name}
            size="lg"
            className="aspect-square w-full rounded-2xl shadow-2xl shadow-black/20"
          />
          {product.images.filter((image) => image.url).length > 1 && (
            <p className="mt-2 text-center text-xs text-zinc-400 dark:text-zinc-600">Hover to see more views</p>
          )}
        </div>

        <div>
          <p className="text-xs font-medium tracking-[0.2em] text-brand-600 uppercase dark:text-brand-400">
            Featured this week
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
            {product.name}
          </h2>
          {product.description && (
            <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-400">{product.description}</p>
          )}

          {(origin || form || netWeight !== null) && (
            <dl className="mt-6 grid grid-cols-3 gap-4 border-y border-zinc-200 py-4 dark:border-zinc-800">
              {origin && (
                <div>
                  <dt className="text-xs text-zinc-500 dark:text-zinc-500">Origin</dt>
                  <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{origin}</dd>
                </div>
              )}
              {form && (
                <div>
                  <dt className="text-xs text-zinc-500 dark:text-zinc-500">Form</dt>
                  <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{form}</dd>
                </div>
              )}
              {netWeight !== null && (
                <div>
                  <dt className="text-xs text-zinc-500 dark:text-zinc-500">Net weight</dt>
                  <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{netWeight}g</dd>
                </div>
              )}
            </dl>
          )}

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {formatPriceCents(discountedCents)}
            </span>
            {hasDiscount && (
              <span className="text-lg text-zinc-400 line-through">{formatPriceCents(product.price_cents)}</span>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/products/${product.slug}`}
              className="rounded-md bg-brand-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-600"
            >
              View Product
            </Link>
            <button
              type="button"
              disabled
              title="Coming soon — cart isn't wired up yet"
              className="rounded-md border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700 disabled:cursor-not-allowed dark:border-zinc-700 dark:text-zinc-300"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
