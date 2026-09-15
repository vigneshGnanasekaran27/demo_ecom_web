"use client";

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
 */
export function ScrollReveal({
  children,
  ...props
}: HTMLMotionProps<"section">) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
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
}
