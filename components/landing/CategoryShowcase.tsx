"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { Category } from "@/types/category";
import { getSpiceVisualById, hashString } from "@/lib/spice-visuals";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { TiltCard } from "@/components/animations/TiltCard";

// Curated (not hashed) so the 4 known categories always render as 4
// distinct, thematically-fitting colours instead of risking a hash
// collision landing two of them on the same palette entry. Falls back to
// the hash-based pick for any category slug not listed here (e.g. a new
// one added later by a manager, Phase 14).
const CATEGORY_PALETTE_IDS: Record<string, string> = {
  "whole-spices": "cardamom",
  "ground-spices": "turmeric",
  "blended-spices": "saffron",
  masalas: "chilli",
};

function CategoryTile({
  category,
  coverUrl,
  count,
  featured,
  index,
}: {
  category: Category;
  coverUrl: string | null;
  count: number;
  featured: boolean;
  index: number;
}) {
  const visual = getSpiceVisualById(CATEGORY_PALETTE_IDS[category.slug] ?? "", category.slug);
  const floatDelay = (hashString(category.slug) % 5) * 0.35;
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      layout
      initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.8, y: 36, rotateX: -10 }}
      whileInView={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={
        shouldReduceMotion
          ? { duration: 0.01, layout: { duration: 0.01 } }
          : {
              duration: 0.75,
              delay: index * 0.1,
              ease: [0.16, 1, 0.3, 1],
              layout: { duration: 0.9, ease: [0.4, 0, 0.2, 1] },
            }
      }
      className={featured ? "sm:col-span-2" : ""}
    >
      <div className="h-full w-full motion-safe:animate-float" style={{ animationDelay: `${floatDelay}s` }}>
        <TiltCard maxTiltDeg={featured ? 5 : 9} className="group block h-full w-full">
          <Link
            href={`/shop?category=${encodeURIComponent(category.slug)}`}
            className="relative flex aspect-[4/3] h-full w-full flex-col justify-end overflow-hidden rounded-2xl text-white shadow-lg shadow-zinc-900/10 transition-shadow duration-300 group-hover:shadow-2xl sm:aspect-[16/10]"
            style={{ background: `linear-gradient(150deg, ${visual.to} 0%, ${visual.from} 100%)` }}
          >
            {coverUrl && (
              <div className="absolute inset-0 overflow-hidden">
                <Image
                  src={coverUrl}
                  alt=""
                  fill
                  sizes={featured ? "(min-width: 640px) 45vw, 100vw" : "(min-width: 1024px) 20vw, 50vw"}
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  draggable={false}
                />
              </div>
            )}

            {/* Permanent scrim (not hover-gated) so the tile reads as a real
                product photo card even before interaction, not an empty box. */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent transition-opacity duration-300 group-hover:from-black/90" />

            <div
              aria-hidden
              className="absolute -right-6 -top-6 h-24 w-24 rounded-full blur-3xl transition-transform duration-500 group-hover:scale-125"
              style={{ backgroundColor: visual.glow, opacity: 0.55 }}
            />

            <span className="relative mx-4 mb-1 w-fit rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium tracking-wide text-white/90 backdrop-blur-sm">
              {count} product{count === 1 ? "" : "s"}
            </span>

            <div className="relative flex items-end justify-between gap-2 p-4 pt-0">
              <span className={`font-semibold ${featured ? "text-lg sm:text-2xl" : "text-base sm:text-lg"}`}>
                {category.name}
              </span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-zinc-900 opacity-90 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          </Link>
        </TiltCard>
      </div>
    </motion.div>
  );
}

/**
 * Interactive category tiles linking into filtered /shop views. Categories
 * and per-category cover photo/count (`categoryMeta`, keyed by category id)
 * are passed down from app/(shop)/page.tsx — one shared products fetch
 * rather than this section fetching independently. The ?category= query
 * param isn't read by /shop yet — that's SEARCH-03 (Phase 6); this only
 * wires the link.
 *
 * Refined 2026-09-16: a single-row asymmetric layout (one category spans 2
 * of 5 columns at `sm:` and up, the rest span 1 — see `featuredIndex` below
 * for which one) replaces the earlier 2-row bento — meaningfully shorter
 * section, same visual hierarchy. Entrance is
 * deliberately more dramatic than the rest of the page's stagger vocabulary
 * — each tile scales/rises/tilts in from a slight 3D perspective, cascading
 * by index (`perspective` on the grid gives all tiles a shared, coherent
 * vanishing point rather than each looking independently skewed) — a
 * one-time "wow" moment scoped to this section, not reused elsewhere.
 * Depth/interactivity comes from TiltCard's mouse-tilt (reused from
 * ProductCard), a continuous idle float per tile (`animate-float`,
 * staggered), and a hover zoom on the photo itself.
 *
 * The "featured" (larger) slot also rotates slowly through every category
 * in turn (`featuredIndex`) rather than staying fixed on the first one —
 * each tile's `layout` prop (Framer Motion's automatic FLIP animation)
 * smoothly animates the resulting grid reflow instead of an abrupt jump.
 * Paused entirely under prefers-reduced-motion (stays on the first tile).
 */
export function CategoryShowcase({
  categories,
  categoryMeta,
}: {
  categories: Category[];
  categoryMeta: Record<number, { coverUrl: string | null; count: number }>;
}) {
  const shouldReduceMotion = useReducedMotion();
  const [featuredIndex, setFeaturedIndex] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion || categories.length <= 1) return;
    const id = window.setInterval(() => {
      setFeaturedIndex((current) => (current + 1) % categories.length);
    }, 5500);
    return () => window.clearInterval(id);
  }, [shouldReduceMotion, categories.length]);

  if (categories.length === 0) return null;

  return (
    <ScrollReveal
      id="categories"
      className="scroll-mt-20 border-t border-zinc-200 bg-zinc-50 py-10 dark:border-zinc-800 dark:bg-zinc-900/40 sm:py-14"
    >
      <div className="mx-auto w-full max-w-6xl px-4">
        <h2 className="mb-1 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
          Shop by category
        </h2>
        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          Whole, ground, blended, or ready-made — however you cook.
        </p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4" style={{ perspective: 1200 }}>
          {categories.map((category, index) => {
            const meta = categoryMeta[category.id] ?? { coverUrl: null, count: 0 };
            return (
              <CategoryTile
                key={category.id}
                category={category}
                coverUrl={meta.coverUrl}
                count={meta.count}
                featured={index === featuredIndex}
                index={index}
              />
            );
          })}
        </div>
      </div>
    </ScrollReveal>
  );
}
