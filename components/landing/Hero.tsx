"use client";

import { useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, useReducedMotion, useScroll, useTransform, type Variants } from "framer-motion";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { HeroCardStack } from "@/components/landing/HeroCardStack";
import type { ProductListItem } from "@/types/product";

// ssr:false + no loading placeholder: the hero's gradient background already
// looks complete on its own, so the scene can lazy-load in without any
// layout shift or blocking initial paint.
const HeroScene = dynamic(() => import("./HeroScene").then((mod) => mod.HeroScene), { ssr: false });

// Gentle fade-up stagger for the text column — the badge, headline,
// description, and CTA row reveal in sequence on mount rather than popping
// in all at once. `hidden`/`show` names line up with the initial/animate
// values passed below.
const textContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.22, delayChildren: 0.15 } },
};
const textItem: Variants = {
  hidden: { opacity: 0, y: 22, scale: 0.98, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
  },
};

/**
 * Dynamic hero — a draggable, auto-advancing 3D card stack of real products
 * (HeroCardStack) as the visual centerpiece, over an ambient Aurora-style
 * background (HeroScene). The text column and CTAs are NOT gated behind any
 * animation — hiding shopping actions behind animation is explicitly the
 * wrong move here, so "Explore Spices"/"View collection" always end up
 * visible; they just fade/slide in on a gentle stagger on mount rather than
 * appearing instantly.
 */
export function Hero({ products }: { products: ProductListItem[] }) {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  // Egress parallax as the user scrolls past the hero: text drifts up/fades
  // faster than the card stack, which drifts up slower — a depth cue rather
  // than everything moving in lockstep.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const textY = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [0, -60]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const stackY = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [0, -24]);

  return (
    <ScrollReveal className="relative overflow-hidden border-b border-zinc-200 bg-gradient-to-b from-zinc-50 to-white dark:border-zinc-800 dark:from-zinc-950 dark:to-black">
      <HeroScene />

      <div
        ref={ref}
        className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 sm:py-24 lg:grid-cols-2 lg:gap-16 lg:py-28"
      >
        <motion.div
          className="flex flex-col items-start gap-6"
          style={{ y: textY, opacity: textOpacity }}
          variants={textContainer}
          initial={shouldReduceMotion ? "show" : "hidden"}
          animate="show"
        >
          <motion.span
            variants={textItem}
            className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium tracking-wide text-brand-700 uppercase dark:bg-brand-950 dark:text-brand-300"
          >
            Single-origin &amp; stone-ground
          </motion.span>

          <motion.h1
            variants={textItem}
            className="max-w-xl text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl md:text-6xl dark:text-zinc-50"
          >
            Premium Indian spices, sourced with soul.
          </motion.h1>

          <motion.p variants={textItem} className="max-w-lg text-base text-zinc-600 sm:text-lg dark:text-zinc-400">
            From Kerala&rsquo;s cardamom hills to Kashmir&rsquo;s chilli fields — authentic flavour, honest sourcing,
            and a checkout experience built for speed.
          </motion.p>

          <motion.div variants={textItem} className="flex flex-wrap items-center gap-4">
            <Link
              href="/shop"
              className="rounded-md bg-brand-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-600 sm:text-base"
            >
              Explore Spices
            </Link>
            <Link
              href="#collection"
              className="text-sm font-medium text-zinc-600 underline-offset-4 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              View collection
            </Link>
          </motion.div>
        </motion.div>

        <motion.div style={{ y: stackY }}>
          <motion.div
            animate={shouldReduceMotion ? undefined : { y: [0, -12, 0], scale: [1, 1.015, 1], rotate: [0, 0.6, 0] }}
            transition={shouldReduceMotion ? undefined : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <HeroCardStack products={products} />
          </motion.div>
        </motion.div>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl justify-center pb-8">
        <Link
          href="#collection"
          aria-label="Scroll down to explore the collection"
          className="group flex flex-col items-center gap-2"
        >
          <span className="text-[11px] font-medium tracking-widest text-zinc-500 uppercase transition-colors group-hover:text-brand-600 dark:text-zinc-500 dark:group-hover:text-brand-300">
            Scroll to explore
          </span>
          <span className="relative flex h-11 w-11 items-center justify-center rounded-full border border-zinc-300 bg-white/70 shadow-sm backdrop-blur-sm transition-colors group-hover:border-brand-400 dark:border-zinc-700 dark:bg-zinc-900/60">
            {!shouldReduceMotion && (
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-full border border-brand-400/60"
                animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
              />
            )}
            <motion.svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-4 w-4 text-zinc-600 dark:text-zinc-300"
              animate={shouldReduceMotion ? undefined : { y: [0, 4, 0] }}
              transition={shouldReduceMotion ? undefined : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          </span>
        </Link>
      </div>
    </ScrollReveal>
  );
}
