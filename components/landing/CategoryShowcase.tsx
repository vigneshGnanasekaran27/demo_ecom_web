"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Category } from "@/types/category";
import { getSpiceVisualById } from "@/lib/spice-visuals";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

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

/**
 * Interactive category tiles linking into filtered /shop views. Categories
 * are passed down from app/(shop)/page.tsx (one shared fetch, LANDING-04's
 * original per-section fetch was consolidated once Hero also needed product
 * data). The ?category= query param isn't read by /shop yet — that's
 * SEARCH-03 (Phase 6); this only wires the link.
 *
 * A Client Component (not Server) so the tiles can use whileHover — a
 * lighter motion language than the product cards' TiltCard, to keep the
 * page's animation vocabulary varied without every section feeling
 * identical.
 */
export function CategoryShowcase({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <ScrollReveal className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
        <h2 className="mb-2 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
          Shop by category
        </h2>
        <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
          Whole, ground, blended, or ready-made — however you cook.
        </p>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {categories.map((category) => {
            const visual = getSpiceVisualById(CATEGORY_PALETTE_IDS[category.slug] ?? "", category.slug);
            return (
              <motion.div key={category.id} whileHover="hover" initial="idle" className="group">
                <Link
                  href={`/shop?category=${encodeURIComponent(category.slug)}`}
                  className="relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-2xl p-5 text-white"
                  style={{
                    background: `linear-gradient(150deg, ${visual.to} 0%, ${visual.from} 100%)`,
                  }}
                >
                  <motion.div
                    aria-hidden
                    className="absolute -right-6 -top-6 h-28 w-28 rounded-full blur-2xl"
                    style={{ backgroundColor: visual.glow, opacity: 0.5 }}
                    variants={{ idle: { scale: 1 }, hover: { scale: 1.3 } }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                  <span className="relative text-base font-semibold">{category.name}</span>
                  <motion.span
                    className="relative mt-1 flex items-center gap-1 text-xs font-medium text-white/80"
                    variants={{ idle: { opacity: 0, y: 4 }, hover: { opacity: 1, y: 0 } }}
                    transition={{ duration: 0.25 }}
                  >
                    Shop now
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3 w-3">
                      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </ScrollReveal>
  );
}
