"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useInView, useReducedMotion } from "framer-motion";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { StaggerGroup, StaggerItem } from "@/components/animations/StaggerReveal";
import { InteractiveProductVisual } from "@/components/product/InteractiveProductVisual";
import { QuickAddButton } from "@/components/product/QuickAddButton";
import { discountedPriceCents, formatPriceCents } from "@/lib/format";
import { getSpiceVisual } from "@/lib/spice-visuals";
import { getProductVideo } from "@/lib/product-videos";
import type { ProductDetail } from "@/types/product";

const AUTOPLAY_DELAY_MS = 900;

/**
 * Large interactive single-product showcase (landing-page brief §7.4) —
 * InteractiveProductVisual gives the "inspect the product" highlight
 * moment (hover/tap cycles through the product's real photos, or plays a
 * short video for the subset of products with one — same `videoUrl` prop
 * ProductCard already uses), plus richer copy from the product's
 * specifications jsonb.
 *
 * If the product has a video, scrolling the section into view starts it
 * automatically after a short pause (not instantly — feels intentional,
 * not jarring); scrolling away pauses it again. Manual hover still works
 * independently (InteractiveProductVisual's `forcePlay` is OR'd with real
 * hover), and the whole thing is skipped under prefers-reduced-motion —
 * hover-to-play remains available there too.
 */
export function ProductSpotlight({ product }: { product: ProductDetail }) {
  const hasDiscount = product.discount_percent > 0;
  const discountedCents = discountedPriceCents(product.price_cents, product.discount_percent);
  const specs = product.specifications;
  const origin = typeof specs.origin === "string" ? specs.origin : null;
  const form = typeof specs.form === "string" ? specs.form : null;
  const netWeight = typeof specs.net_weight_g === "number" ? specs.net_weight_g : null;
  const videoUrl = getProductVideo(product.slug);
  const visual = getSpiceVisual(product.slug);
  const hasMultipleViews = product.images.filter((image) => image.url).length > 1;

  const shouldReduceMotion = useReducedMotion();
  const mediaRef = useRef<HTMLDivElement>(null);
  const inView = useInView(mediaRef, { margin: "-15% 0px" });
  const [autoPlay, setAutoPlay] = useState(false);

  useEffect(() => {
    if (!videoUrl || shouldReduceMotion || !inView) return;
    const id = window.setTimeout(() => setAutoPlay(true), AUTOPLAY_DELAY_MS);
    return () => {
      window.clearTimeout(id);
      setAutoPlay(false);
    };
  }, [inView, videoUrl, shouldReduceMotion]);

  return (
    <ScrollReveal id="spotlight" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-20 sm:py-28">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div ref={mediaRef} className="relative mx-auto w-full max-w-md motion-safe:animate-float">
          <div
            aria-hidden
            className="absolute -inset-10 -z-10 rounded-full blur-3xl"
            style={{ backgroundColor: visual.glow, opacity: 0.35 }}
          />
          <InteractiveProductVisual
            images={product.images}
            seed={product.slug}
            name={product.name}
            size="lg"
            videoUrl={videoUrl}
            forcePlay={autoPlay}
            className="aspect-square w-full rounded-2xl shadow-2xl shadow-black/20"
          />
          {(videoUrl || hasMultipleViews) && (
            <p className="mt-2 text-center text-xs text-zinc-400 dark:text-zinc-600">
              {videoUrl ? (autoPlay ? "Now playing — hover to replay anytime" : "Hover to watch it in action") : "Hover to see more views"}
            </p>
          )}
        </div>

        <StaggerGroup>
          <StaggerItem>
            <p className="text-xs font-medium tracking-[0.2em] text-brand-600 uppercase dark:text-brand-400">
              Featured this week
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
              {product.name}
            </h2>
          </StaggerItem>

          {product.description && (
            <StaggerItem>
              <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-400">{product.description}</p>
            </StaggerItem>
          )}

          {(origin || form || netWeight !== null) && (
            <StaggerItem>
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
            </StaggerItem>
          )}

          <StaggerItem>
            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {formatPriceCents(discountedCents)}
              </span>
              {hasDiscount && (
                <span className="text-lg text-zinc-400 line-through">{formatPriceCents(product.price_cents)}</span>
              )}
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="mt-6 flex flex-wrap items-stretch gap-3">
              <Link
                href={`/products/${product.slug}`}
                className="flex items-center rounded-md border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700 transition-colors hover:border-brand-500 hover:text-brand-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-brand-400 dark:hover:text-brand-400"
              >
                View Product
              </Link>
              <div className="w-40">
                <QuickAddButton productId={product.id} inStock={product.stock_quantity > 0} size="lg" />
              </div>
            </div>
          </StaggerItem>
        </StaggerGroup>
      </div>
    </ScrollReveal>
  );
}
