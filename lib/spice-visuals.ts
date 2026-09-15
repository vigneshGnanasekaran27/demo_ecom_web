/**
 * Deterministic per-product visual identity used in place of real product
 * photography. No product photos exist anywhere in this project (no
 * Cloudinary credentials configured, zero Active Storage attachments) — per
 * AI_RULES.md §26 we don't fabricate/pretend real photos exist. Instead each
 * product gets a stable, hash-derived spice-color composition (gradient +
 * glow + a typographic monogram) rendered by components/product/ProductVisual.tsx.
 *
 * Deterministic on the product's slug/name (not random) so the same product
 * always renders the same visual across reloads and across the hero,
 * spotlight, and card grid.
 */
export interface SpiceVisual {
  id: string;
  label: string;
  from: string;
  to: string;
  glow: string;
}

const PALETTE: SpiceVisual[] = [
  { id: "turmeric", label: "Turmeric Gold", from: "#c9812f", to: "#f0b94a", glow: "#f7d383" },
  { id: "chilli", label: "Kashmiri Chilli", from: "#8a1f1a", to: "#d94a3a", glow: "#f08a72" },
  { id: "cardamom", label: "Cardamom Green", from: "#33472f", to: "#6f8f5c", glow: "#a9c290" },
  { id: "cinnamon", label: "Cinnamon Rust", from: "#5c2a12", to: "#a8611f", glow: "#d99a4e" },
  { id: "clove", label: "Clove Maroon", from: "#3d1220", to: "#7c2f45", glow: "#b95d78" },
  { id: "pepper", label: "Black Pepper", from: "#242019", to: "#4a423a", glow: "#8a7d6c" },
  { id: "saffron", label: "Saffron Amber", from: "#a8611f", to: "#e8a93a", glow: "#f4c664" },
  { id: "coriander", label: "Coriander Olive", from: "#4a4a1a", to: "#8a8a3a", glow: "#bcbc72" },
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getSpiceVisual(seed: string): SpiceVisual {
  return PALETTE[hashString(seed) % PALETTE.length];
}

/**
 * Look up a specific named palette entry (e.g. "cardamom") rather than
 * hashing — used where a small, fixed set of items (like the 4 top-level
 * categories) benefits from deliberate curation instead of leaving it to
 * hash collisions, which can land two items on the same colour by chance.
 * Falls back to the hash-based pick if the id isn't recognized.
 */
export function getSpiceVisualById(id: string, hashFallbackSeed: string): SpiceVisual {
  return PALETTE.find((visual) => visual.id === id) ?? getSpiceVisual(hashFallbackSeed);
}

/** "Green Cardamom (Elaichi)" -> "GC" — a clean typographic mark for the jar composition. */
export function getMonogram(name: string): string {
  const words = name
    .replace(/\(.*?\)/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const letters = words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
  return letters || "?";
}
