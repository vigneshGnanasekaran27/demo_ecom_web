"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductImage } from "@/types/product";
import { ProductVisual } from "@/components/product/ProductVisual";

type GalleryTab = "photos" | "video";

/**
 * Client-side interactive gallery for the product detail page (PRODUCT-16).
 * Degrades gracefully: hides the thumbnail strip with 0-1 images, falls
 * back to the illustrated ProductVisual (same as the card grid/hero/
 * spotlight) when there's no real photo at all, rather than a bare
 * placeholder box.
 *
 * UIX-04: when `videoUrl` is provided (lib/product-videos.ts — only a
 * deterministic subset of products get one), a small "Photos / Video"
 * segmented control appears above the media area, letting the customer
 * switch between the existing photo gallery and a user-controlled video
 * player (no autoplay — this is a deliberate watch, not a hover preview).
 * With no `videoUrl`, the control never renders and the gallery behaves
 * exactly as before.
 */
export function ProductGallery({
  images,
  productName,
  productSlug,
  videoUrl,
}: {
  images: ProductImage[];
  productName: string;
  productSlug: string;
  videoUrl?: string | null;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [tab, setTab] = useState<GalleryTab>("photos");

  if (images.length === 0) {
    return <ProductVisual seed={productSlug} name={productName} size="lg" className="aspect-square w-full rounded-lg" />;
  }

  const activeImage = images[activeIndex] ?? images[0];

  return (
    <div className="flex flex-col gap-3">
      {videoUrl && (
        <div className="inline-flex w-fit gap-1 rounded-full border border-zinc-200 bg-zinc-100 p-1 text-xs font-medium dark:border-zinc-700 dark:bg-zinc-800">
          {(["photos", "video"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setTab(option)}
              aria-current={tab === option}
              className={`rounded-full px-3 py-1 capitalize transition-colors ${
                tab === option
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-50"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {videoUrl && tab === "video" ? (
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
          <video
            src={videoUrl}
            poster={activeImage.url ?? undefined}
            controls
            playsInline
            preload="none"
            className="h-full w-full object-cover"
          >
            Your browser does not support embedded video.
          </video>
        </div>
      ) : (
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
          {activeImage.url ? (
            <Image
              src={activeImage.url}
              alt={activeImage.alt_text ?? productName}
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-zinc-400">No image</div>
          )}
        </div>
      )}

      {tab === "photos" && images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View image ${index + 1} of ${images.length}`}
              aria-current={index === activeIndex}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
                index === activeIndex ? "border-brand-500" : "border-transparent hover:border-zinc-300"
              }`}
            >
              {image.url ? (
                <Image
                  src={image.url}
                  alt={image.alt_text ?? `${productName} thumbnail ${index + 1}`}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-zinc-200 dark:bg-zinc-700" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
