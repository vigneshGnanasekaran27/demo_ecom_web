"use client";

import { forwardRef } from "react";
import { motion, useReducedMotion, type HTMLMotionProps, type Variants } from "framer-motion";

// Exported so call sites that need a non-`div` container/item tag (e.g.
// OrderStatusTimeline's `<ol>`/`<li>`) can apply the identical stagger
// variants to their own `motion.ol`/`motion.li` instead of duplicating them.
export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

/**
 * Per-item stagger-in reveal for a grid/list of cards, used alongside
 * ScrollReveal (which only fades the section as a whole). Server Components
 * render this the same way they render ScrollReveal — passing already-built
 * children into a Client Component boundary that owns the animation, not
 * the data (see Hero.tsx's identical textContainer/textItem pattern, which
 * this generalizes into a reusable pair rather than being copy-pasted a
 * third time).
 */
// forwardRef so callers that need the container element itself (e.g.
// FeaturedProducts' useInView-driven auto-highlight) can get a real DOM ref
// — a plain function component would silently drop it.
export const StaggerGroup = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(function StaggerGroup(
  { children, ...props },
  ref,
) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      variants={staggerContainer}
      initial={shouldReduceMotion ? "show" : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  );
});

export function StaggerItem({ children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div variants={staggerItem} {...props}>
      {children}
    </motion.div>
  );
}
