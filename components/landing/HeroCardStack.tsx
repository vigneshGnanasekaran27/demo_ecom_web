"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, type PanInfo } from "framer-motion";
import { discountedPriceCents, formatPriceCents } from "@/lib/format";
import type { ProductListItem } from "@/types/product";

const VISIBLE_DEPTH = 4;
const AUTO_ADVANCE_MS = 3400;
const SWIPE_THRESHOLD = 90;

/**
 * The hero's interactive centerpiece: a draggable 3D card stack (a "hand of
 * cards" fan-out — the concept behind 21st.dev's ruixen.ui/card-stack,
 * which this project can't install directly since that registry endpoint
 * requires a paid API key this session doesn't have; rebuilt natively with
 * Framer Motion instead, already a dependency and already proven reliable
 * in this environment, per DECISION-024's sandbox-WebGL findings). Drag the
 * top card left/right to advance manually; it also auto-advances on a
 * timer. Cards behind the top one are scaled/rotated and spread sideways
 * (alternating left/right by product index) as well as down, so they read
 * as a fanned hand of cards with real depth — not stacked directly on top
 * of one another. A soft spring (moderate stiffness, higher damping) keeps
 * the settle gentle rather than snappy.
 *
 * Deliberately not a Link itself — dragging vs. tapping-to-navigate would
 * conflict on the same element — the visible "View Product" pill is the
 * real, accessible navigation trigger (same separation-of-concerns pattern
 * as ProductCard).
 */
export function HeroCardStack({ products }: { products: ProductListItem[] }) {
  const shouldReduceMotion = useReducedMotion();
  const [order, setOrder] = useState(() => products.map((_, i) => i));

  const advance = () => {
    setOrder((current) => {
      const [first, ...rest] = current;
      return [...rest, first];
    });
  };

  useEffect(() => {
    if (shouldReduceMotion || products.length <= 1) return;
    const id = window.setInterval(advance, AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [shouldReduceMotion, products.length]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > SWIPE_THRESHOLD) advance();
  };

  if (products.length === 0) return null;

  const visible = order.slice(0, Math.min(VISIBLE_DEPTH, products.length));

  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-sm" style={{ perspective: 1200 }}>
      {visible.map((productIndex, stackPos) => {
        const product = products[productIndex];
        const isTop = stackPos === 0;
        const image = product.images.find((img) => img.url);
        const side = productIndex % 2 === 0 ? 1 : -1;

        return (
          <motion.div
            key={product.id}
            className="absolute inset-0"
            style={{ zIndex: visible.length - stackPos }}
            initial={false}
            animate={{
              scale: 1 - stackPos * 0.07,
              x: side * stackPos * 26,
              y: stackPos * 14,
              rotate: stackPos === 0 ? 0 : side * stackPos * 4,
              opacity: 1 - stackPos * 0.18,
            }}
            drag={isTop && !shouldReduceMotion ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={isTop ? handleDragEnd : undefined}
            whileDrag={{ cursor: "grabbing" }}
            whileHover={isTop && !shouldReduceMotion ? { y: stackPos * 14 - 6 } : undefined}
            transition={{ type: "spring", stiffness: 140, damping: 22, mass: 0.9 }}
          >
            <div className="relative h-full w-full touch-pan-y overflow-hidden rounded-3xl shadow-2xl shadow-black/30 ring-1 ring-white/10">
              {image?.url ? (
                <Image
                  src={image.url}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1024px) 28vw, 60vw"
                  className="pointer-events-none object-cover"
                  priority={isTop}
                  draggable={false}
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-brand-400 to-brand-700" />
              )}

              {isTop && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-5 pt-14">
                  <p className="text-base font-semibold text-white">{product.name}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm text-white/80">
                      {formatPriceCents(discountedPriceCents(product.price_cents, product.discount_percent))}
                    </span>
                    <Link
                      href={`/products/${product.slug}`}
                      className="rounded-full bg-white px-4 py-1.5 text-xs font-medium text-zinc-900 transition-colors hover:bg-brand-50"
                    >
                      View Product
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}

      {!shouldReduceMotion && products.length > 1 && (
        <p className="absolute -bottom-8 left-0 right-0 text-center text-xs text-zinc-400 dark:text-zinc-600">
          Drag to see more
        </p>
      )}
    </div>
  );
}
