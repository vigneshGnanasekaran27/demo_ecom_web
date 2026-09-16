"use client";

import { forwardRef } from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";

/**
 * Fade/slide-up reveal used by landing page sections (LANDING-07). A Client
 * Component boundary that Server Components (Hero, FeaturedProducts, etc.)
 * render around their already-fetched/static content — the animation only
 * needs to own the DOM node it animates, not the data inside it.
 *
 * Respects prefers-reduced-motion via Framer Motion's useReducedMotion:
 * reduces to a near-instant plain fade with no movement, per
 * FRONTEND_RULES.md §16.
 *
 * forwardRef so callers that need the section element itself (e.g.
 * scroll-linked parallax via useScroll) can get a real DOM ref — a plain
 * function component would silently drop it.
 */
export const ScrollReveal = forwardRef<HTMLElement, HTMLMotionProps<"section">>(function ScrollReveal(
  { children, ...props },
  ref,
) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: shouldReduceMotion ? 0.01 : 0.5,
        ease: "easeOut",
      }}
      {...props}
    >
      {children}
    </motion.section>
  );
});
