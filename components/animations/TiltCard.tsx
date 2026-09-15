"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

const SPRING = { stiffness: 300, damping: 22, mass: 0.6 };

/**
 * Mouse-driven 3D tilt used by product cards / the featured spotlight, so a
 * flat illustration reads as a physical object the user can "inspect" (the
 * brief's §4/§5 interaction). Pointer-based, not hover-media-query gated:
 * touch taps don't fire pointermove, so it naturally does nothing on mobile
 * without special-casing — the card's own CTA/info stay visible by default
 * there (see ProductCard), satisfying §11's "don't rely only on hover" rule.
 * Disabled outright under prefers-reduced-motion.
 */
export function TiltCard({
  children,
  className,
  maxTiltDeg = 10,
  hoverScale = 1.03,
}: {
  children: ReactNode;
  className?: string;
  maxTiltDeg?: number;
  hoverScale?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const rotateX = useSpring(useMotionValue(0), SPRING);
  const rotateY = useSpring(useMotionValue(0), SPRING);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || event.pointerType !== "mouse") return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * maxTiltDeg * 2);
    rotateX.set(-py * maxTiltDeg * 2);
  };

  const reset = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      whileHover={shouldReduceMotion ? undefined : { scale: hoverScale }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
      transition={SPRING}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
