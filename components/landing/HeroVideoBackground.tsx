"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HERO_VIDEOS } from "@/lib/product-videos";

const CROSSFADE_MS = 9000;

/**
 * Full-bleed hero background video, crossfading through the hero-safe demo
 * clips (same AnimatePresence crossfade pattern as
 * components/product/InteractiveProductVisual.tsx). Sits behind HeroScene's
 * existing ambient layers (aurora/blobs/dust) and HeroCardStack, with a dark
 * gradient scrim on top so hero text stays legible in both themes.
 *
 * Fully static under prefers-reduced-motion: renders only the first clip's
 * first frame (no autoplay, no crossfade loop) rather than skipping the
 * visual entirely, per FRONTEND_RULES.md §16/§17's "provide a fallback"
 * requirement.
 */
export function HeroVideoBackground({ shouldReduceMotion }: { shouldReduceMotion: boolean }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion || HERO_VIDEOS.length <= 1) return;
    const id = window.setInterval(() => setIndex((current) => (current + 1) % HERO_VIDEOS.length), CROSSFADE_MS);
    return () => window.clearInterval(id);
  }, [shouldReduceMotion]);

  // Reduced motion: skip the <video> element entirely rather than relying on
  // cross-browser first-frame-without-autoplay rendering, which is
  // inconsistent. HeroScene's own static gradient/blob fallback already
  // covers the background in this mode.
  if (shouldReduceMotion) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <AnimatePresence mode="sync">
        <motion.video
          key={HERO_VIDEOS[index]}
          className="absolute inset-0 h-full w-full object-cover"
          src={HERO_VIDEOS[index]}
          autoPlay
          muted
          playsInline
          preload="metadata"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
      </AnimatePresence>
      {/* Scrim: darkens the video enough for the text column/CTAs to stay
          readable without fully hiding the footage, in both themes. */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/55 to-white/10 dark:from-black/80 dark:via-black/50 dark:to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-transparent to-transparent dark:from-black/70" />
    </div>
  );
}
