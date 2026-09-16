"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useInView, useReducedMotion } from "framer-motion";
import { ProductCard } from "@/components/product/ProductCard";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { StaggerGroup, StaggerItem } from "@/components/animations/StaggerReveal";
import type { ProductListItem } from "@/types/product";

const HIGHLIGHT_MS = 4200;

/**
 * The shopping-focused "Product Collection" section (landing-page brief
 * §7.5/§7.7 — consolidated into one section rather than two near-duplicate
 * grids, since the brief explicitly allows adjusting structure "if the
 * existing project already has a better structure"). Products are passed
 * down from app/(shop)/page.tsx (one shared fetch) rather than fetched here.
 * `id="collection"` is the Hero's "View collection" anchor target.
 *
 * A "use client" section (previously a Server Component — ProductCard has
 * no server-exclusive dependencies, so it still renders fine here): while
 * the grid is in view, one product auto-highlights at a time, in sequence,
 * playing its video if it has one (ProductCard's `highlighted` →
 * InteractiveProductVisual's `forcePlay`) — a slow, continuous showcase
 * rather than a static grid. The rest of the grid dims slightly while a
 * highlight is active (`dimmed`), so the cycling card reads as a real focus
 * state, not just a border colour change. Only one video plays at a time,
 * the cycle only runs while the grid is actually visible, and the whole
 * thing is inert under reduced motion; hovering any card still works
 * independently regardless.
 */
export function FeaturedProducts({ products }: { products: ProductListItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-10% 0px" });
  const shouldReduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const showcaseActive = inView && !shouldReduceMotion && products.length > 1;

  useEffect(() => {
    if (!showcaseActive) return;
    const id = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % products.length);
    }, HIGHLIGHT_MS);
    return () => window.clearInterval(id);
  }, [showcaseActive, products.length]);

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

      <StaggerGroup ref={ref} className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product, index) => (
          <StaggerItem key={product.id}>
            <ProductCard
              product={product}
              highlighted={showcaseActive && index === activeIndex}
              dimmed={showcaseActive && index !== activeIndex}
            />
          </StaggerItem>
        ))}
      </StaggerGroup>
    </ScrollReveal>
  );
}
