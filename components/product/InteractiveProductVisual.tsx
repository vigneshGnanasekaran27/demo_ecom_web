"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ProductVisual } from "@/components/product/ProductVisual";
import type { ProductImage } from "@/types/product";

const CYCLE_MS = 1100;

/**
 * The product image area's interaction (landing-page brief): idle state is
 * the product's real primary photo. On hover (desktop) or tap (mobile,
 * which never fires mouseenter) it auto-cycles through the product's
 * available real photos with a crossfade — "a simple animated preview using
 * multiple product images/views" — then settles back to the primary image
 * on leave. No 3D/WebGL: real photography only, per the explicit "do NOT
 * show product initials or text placeholders" + "download/use suitable
 * dummy product images" direction (DECISION-025).
 *
 * Falls back to the illustrated ProductVisual only if a product genuinely
 * has zero photos (shouldn't happen for the seeded catalog — every product
 * has 2 — but keeps a manager-created product without an uploaded photo yet
 * from rendering a broken image).
 *
 * UIX-03: when `videoUrl` is provided (lib/product-videos.ts — only a
 * deterministic subset of products get one), hover/tap plays that clip
 * instead of cycling images. The clip's `src` is only ever set while
 * active (lazy — no eager download) and playback pauses + resets on leave.
 *
 * `forcePlay` lets a parent drive the same active/playing state
 * programmatically (scroll-triggered autoplay on ProductSpotlight,
 * sequential auto-highlight on the collection grid) — it's OR'd with real
 * hover so manual interaction always still works too.
 */
export function InteractiveProductVisual({
  images,
  seed,
  name,
  size = "md",
  className,
  videoUrl,
  forcePlay = false,
}: {
  images: ProductImage[];
  seed: string;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Optional short clip (lib/product-videos.ts) — plays on hover/tap instead of cycling images. */
  videoUrl?: string | null;
  /** Externally drive the active/playing state (see doc above). */
  forcePlay?: boolean;
}) {
  const validImages = images.filter((image): image is ProductImage & { url: string } => Boolean(image.url));
  const [hovered, setHovered] = useState(false);
  const [index, setIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const active = hovered || forcePlay;

  useEffect(() => {
    if (!active || videoUrl || validImages.length <= 1) return;
    const id = window.setInterval(() => setIndex((current) => (current + 1) % validImages.length), CYCLE_MS);
    return () => window.clearInterval(id);
  }, [active, videoUrl, validImages.length]);

  // Video only starts loading/playing once active (lazy — the `src` is only
  // ever set on the <video> element while active, see JSX below), and is
  // paused + reset once inactive, keeping it lightweight rather than
  // eagerly downloading a clip that may never be watched.
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !videoUrl) return;
    if (active) {
      el.currentTime = 0;
      void el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [active, videoUrl]);

  if (validImages.length === 0) {
    return <ProductVisual seed={seed} name={name} size={size} className={className} />;
  }

  const activeImage = validImages[index];
  const posterImage = validImages[0];

  const handleEnter = () => setHovered(true);
  const handleLeave = () => {
    setHovered(false);
    setIndex(0);
  };
  const handleTouch = () =>
    setHovered((current) => {
      if (current) setIndex(0);
      return !current;
    });

  return (
    <div
      className={`relative overflow-hidden ${className ?? ""}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onTouchStart={handleTouch}
    >
      <Image
        src={posterImage.url}
        alt={posterImage.alt_text ?? name}
        fill
        sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
        className="object-cover"
      />

      {videoUrl && (
        <AnimatePresence>
          {active && (
            <motion.video
              ref={videoRef}
              key={videoUrl}
              src={videoUrl}
              muted
              loop
              playsInline
              preload="none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </AnimatePresence>
      )}

      {!videoUrl && (
        <AnimatePresence mode="sync">
          <motion.div
            key={activeImage.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={activeImage.url}
              alt={activeImage.alt_text ?? name}
              fill
              sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
