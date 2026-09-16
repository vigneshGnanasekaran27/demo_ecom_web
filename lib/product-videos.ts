import { hashString } from "@/lib/spice-visuals";

/**
 * No real per-product video footage exists (same situation `DECISION-022`
 * already solved for photos) — only 4 generic demo clips live in
 * `public/videos/`. Rather than pretending every product has its own
 * filmed footage, a small deterministic subset of products (hash-derived
 * from slug, same technique as `lib/spice-visuals.ts`) gets a video; every
 * other product falls back to the existing real-photo hover/gallery
 * behavior. `demovideo4.mp4` (49MB) is intentionally excluded from this
 * rotation — it's reserved for the product-detail video tab (UIX-04),
 * where playback is user-initiated rather than autoplaying on hover.
 */
const HOVER_VIDEOS = ["/videos/demovideo1.mp4", "/videos/demovideo2.mp4", "/videos/demovideo3.mp4"];

export const DETAIL_VIDEO_URL = "/videos/demovideo4.mp4";

/** Hero background rotation — used for ambient motion, not tied to any product. */
export const HERO_VIDEOS = HOVER_VIDEOS;

/**
 * Roughly 1 in 4 products gets a video (hash % 4 === 0), picking which of
 * the 3 hover-safe clips deterministically from the same hash so the same
 * product always shows the same clip across reloads.
 */
export function getProductVideo(seed: string): string | null {
  const hash = hashString(seed);
  if (hash % 4 !== 0) return null;
  return HOVER_VIDEOS[hash % HOVER_VIDEOS.length];
}
