import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import type { ProductListItem } from "@/types/product";

/**
 * The shopping-focused "Product Collection" section (landing-page brief
 * §7.5/§7.7 — consolidated into one section rather than two near-duplicate
 * grids, since the brief explicitly allows adjusting structure "if the
 * existing project already has a better structure"). Products are passed
 * down from app/(shop)/page.tsx (one shared fetch) rather than fetched here.
 * `id="collection"` is the Hero's "View collection" anchor target.
 */
export function FeaturedProducts({ products }: { products: ProductListItem[] }) {
  if (products.length === 0) return null;

  return (
    <ScrollReveal id="collection" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 sm:py-20">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
            Our collection
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Hover or tap any spice to take a closer look.</p>
        </div>
        <Link href="/shop" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
          View all
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </ScrollReveal>
  );
}
