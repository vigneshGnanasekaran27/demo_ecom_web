"use client";

import { useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/**
 * Lightweight single-clip video background for a section further down the
 * page (unlike Hero's HeroVideoBackground, this doesn't crossfade between
 * multiple clips — one video is enough for a smaller section, and keeping
 * it simple avoids a second copy of that crossfade machinery). The
 * `<video>` element itself is only mounted once the section scrolls into
 * view (`useInView`, `once: true`) so it never competes with the Hero's own
 * video for bandwidth on initial page load.
 *
 * Renders nothing under prefers-reduced-motion — the section's own static
 * background (e.g. FinalCta's existing gradient) shows through untouched,
 * which is a safe, already-shipped fallback look rather than a new one to
 * verify.
 */
export function SectionVideoBackground({ src, className }: { src: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "200px" });
  const shouldReduceMotion = useReducedMotion();

  return (
    <div ref={containerRef} aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}>
      {isInView && !shouldReduceMotion && (
        <video
          className="h-full w-full object-cover"
          src={src}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
        />
      )}
    </div>
  );
}
