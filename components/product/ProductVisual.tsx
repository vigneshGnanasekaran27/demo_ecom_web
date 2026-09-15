import { getMonogram, getSpiceVisual } from "@/lib/spice-visuals";

const SIZE_TEXT = {
  sm: "text-3xl",
  md: "text-5xl",
  lg: "text-7xl sm:text-8xl",
} as const;

/**
 * Illustrated product composition used in place of a photo — no product
 * photography exists in this project (see lib/spice-visuals.ts). A
 * gradient "jar" field, a soft glow suggesting a mound of spice, a glass-rim
 * highlight, and a typographic monogram. Purely presentational — hover/tilt
 * motion is applied by the parent (e.g. TiltCard), and the sheen sweep here
 * is plain CSS (`group-hover`) so it costs nothing extra to animate.
 */
export function ProductVisual({
  seed,
  name,
  size = "md",
  className,
}: {
  seed: string;
  name: string;
  size?: keyof typeof SIZE_TEXT;
  className?: string;
}) {
  const visual = getSpiceVisual(seed);
  const monogram = getMonogram(name);

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-[1.5rem] ${className ?? ""}`}
      style={{
        background: `radial-gradient(130% 130% at 28% 18%, ${visual.to} 0%, ${visual.from} 70%, ${visual.from} 100%)`,
      }}
    >
      <div
        aria-hidden
        className="absolute -bottom-1/3 left-1/2 h-2/3 w-2/3 -translate-x-1/2 rounded-full blur-2xl"
        style={{ backgroundColor: visual.glow, opacity: 0.45 }}
      />
      <div aria-hidden className="absolute inset-3 rounded-[1.15rem] border border-white/15" />
      <div
        aria-hidden
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
      />
      <span
        className={`relative font-semibold tracking-tight text-white/90 select-none ${SIZE_TEXT[size]}`}
        style={{ textShadow: "0 8px 24px rgba(0,0,0,0.25)" }}
      >
        {monogram}
      </span>
    </div>
  );
}
