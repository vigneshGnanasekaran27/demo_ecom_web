"use client";

import { useEffect, useState } from "react";
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
 */
export function InteractiveProductVisual({
  images,
  seed,
  name,
  size = "md",
  className,
}: {
  images: ProductImage[];
  seed: string;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const validImages = images.filter((image): image is ProductImage & { url: string } => Boolean(image.url));
  const [hovered, setHovered] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!hovered || validImages.length <= 1) return;
    const id = window.setInterval(() => setIndex((current) => (current + 1) % validImages.length), CYCLE_MS);
    return () => window.clearInterval(id);
  }, [hovered, validImages.length]);

  if (validImages.length === 0) {
    return <ProductVisual seed={seed} name={name} size={size} className={className} />;
  }

  const active = validImages[index];

  return (
    <div
      className={`relative overflow-hidden ${className ?? ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setIndex(0);
      }}
      onTouchStart={() =>
        setHovered((current) => {
          if (current) setIndex(0);
          return !current;
        })
      }
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={active.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={active.url}
            alt={active.alt_text ?? name}
            fill
            sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
