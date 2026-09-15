"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductImage } from "@/types/product";
import { ProductVisual } from "@/components/product/ProductVisual";

/**
 * Client-side interactive gallery for the product detail page (PRODUCT-16).
 * Degrades gracefully: hides the thumbnail strip with 0-1 images, falls
 * back to the illustrated ProductVisual (same as the card grid/hero/
 * spotlight) when there's no real photo at all, rather than a bare
 * placeholder box.
 */
export function ProductGallery({
  images,
  productName,
  productSlug,
}: {
  images: ProductImage[];
  productName: string;
  productSlug: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return <ProductVisual seed={productSlug} name={productName} size="lg" className="aspect-square w-full rounded-lg" />;
  }

  const activeImage = images[activeIndex] ?? images[0];

  return (
    <div className="flex flex-col gap-3">
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

      {images.length > 1 && (
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
