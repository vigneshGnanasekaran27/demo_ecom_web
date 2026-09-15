"use client";

import { motion, useReducedMotion } from "framer-motion";
import { getSpiceVisualById } from "@/lib/spice-visuals";
import { SquircleShift } from "@/components/landing/SquircleShift";

const turmeric = getSpiceVisualById("turmeric", "turmeric");
const chilli = getSpiceVisualById("chilli", "chilli");
const cardamom = getSpiceVisualById("cardamom", "cardamom");

const blobs = [
  { size: 320, top: "-10%", left: "55%", color: turmeric.glow, duration: 18 },
  { size: 220, top: "30%", left: "82%", color: chilli.glow, duration: 22 },
  { size: 180, top: "58%", left: "62%", color: cardamom.glow, duration: 26 },
];

// Deterministic pseudo-random (seeded by index), not Math.random(): Hero is
// server-rendered on first paint then hydrated, so real randomness would
// mismatch between server/client. Same technique as lib/spice-visuals.ts.
function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

const DUST_COUNT = 10;
const dustMotes = Array.from({ length: DUST_COUNT }, (_, i) => ({
  key: i,
  left: `${seededRandom(i * 2 + 1) * 100}%`,
  size: 2 + seededRandom(i * 2 + 2) * 3,
  duration: 14 + seededRandom(i * 3 + 1) * 10,
  delay: seededRandom(i * 3 + 2) * 8,
  drift: (seededRandom(i * 3 + 3) - 0.5) * 40,
}));

// Scales a hex colour's RGB channels toward black.
function darken(hex: string, factor: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * factor);
  const g = Math.round(((n >> 8) & 255) * factor);
  const b = Math.round((n & 255) * factor);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

// Mixes a hex colour toward white by `amount` (0-1).
function lighten(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) + (255 - ((n >> 16) & 255)) * amount);
  const g = Math.round(((n >> 8) & 255) + (255 - ((n >> 8) & 255)) * amount);
  const b = Math.round((n & 255) + (255 - (n & 255)) * amount);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

// Squircle Shift's colour is a single dark-yellow-to-light-yellow gradient
// (not the earlier 4-colour spice rotation) — both stops anchored on the
// turmeric token so it stays brand-consistent. Per follow-up feedback the
// dark stop is lightened (0.55 → 0.7 toward turmeric's base tone, i.e.
// less intense/near-black) and the light stop is pushed further toward
// white than turmeric's own glow tint, for a brighter, softer overall
// gradient while keeping the same smooth wave-driven transition.
const SQUIRCLE_COLORS: [string, string] = [darken(turmeric.from, 0.7), lighten(turmeric.glow, 0.35)];

/**
 * Hero's ambient background layer — an Aurora-style continuously flowing
 * gradient wash (the technique behind libraries like React Bits'/Aceternity's
 * Aurora background: layered radial gradients whose `background-position` is
 * animated through several waypoints, plus a slight rotate/scale breathe, on
 * a long infinite loop — adapted here as our own implementation with the
 * project's brand/spice palette, not a copy of any specific library's
 * source), a full-bleed morphing squircle grid (see SquircleShift.tsx),
 * soft drifting colour blobs, and a sparse field of slowly rising dust
 * motes for texture. No new dependency (AI_RULES.md §2/§15) — Framer
 * Motion/CSS for every layer except SquircleShift, which is a small
 * Canvas-2D drawing loop (not WebGL/three.js).
 *
 * Dynamic-imported with ssr:false by Hero.tsx so it never blocks initial
 * paint. Renders fully static (no motion at all) when the OS/browser has
 * prefers-reduced-motion enabled, per FRONTEND_RULES.md §17.
 */
export function HeroScene() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Aurora gradient wash — layered gradients drift through several
          waypoints (not just back-and-forth) plus a slight rotate/scale
          breathing, so the light reads as continuously flowing rather than
          panning once and settling. */}
      <motion.div
        className="absolute inset-[-30%] opacity-[0.22] blur-3xl"
        style={{
          backgroundImage: `radial-gradient(38% 45% at 20% 30%, ${turmeric.glow}, transparent 60%),
            radial-gradient(32% 40% at 75% 20%, ${chilli.glow}, transparent 60%),
            radial-gradient(36% 42% at 55% 75%, ${cardamom.glow}, transparent 60%)`,
          backgroundSize: "160% 160%",
        }}
        animate={
          shouldReduceMotion
            ? undefined
            : {
                backgroundPosition: ["0% 0%", "45% 25%", "100% 55%", "55% 85%", "0% 0%"],
                rotate: [0, 3, -2, 0],
                scale: [1, 1.06, 1],
              }
        }
        transition={shouldReduceMotion ? undefined : { duration: 38, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Squircle Shift — a full-bleed grid of morphing squircle outlines,
          see SquircleShift.tsx for why this is a Canvas-2D recreation
          rather than the real `@reactbits-starter/squircle-shift-tw`. */}
      <SquircleShift colors={SQUIRCLE_COLORS} shouldReduceMotion={!!shouldReduceMotion} />

      {/* Soft drifting colour blobs */}
      {blobs.map((blob, index) =>
        shouldReduceMotion ? (
          <div
            key={index}
            className="absolute rounded-full opacity-30 blur-3xl"
            style={{ width: blob.size, height: blob.size, top: blob.top, left: blob.left, backgroundColor: blob.color }}
          />
        ) : (
          <motion.div
            key={index}
            className="absolute rounded-full opacity-30 blur-3xl"
            style={{ width: blob.size, height: blob.size, top: blob.top, left: blob.left, backgroundColor: blob.color }}
            animate={{ y: [0, -20, 0], x: [0, 15, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: blob.duration, repeat: Infinity, ease: "easeInOut" }}
          />
        ),
      )}

      {/* Sparse rising dust motes, for a premium "light in the air" texture */}
      {!shouldReduceMotion &&
        dustMotes.map((mote) => (
          <motion.div
            key={mote.key}
            className="absolute rounded-full bg-brand-200"
            style={{ left: mote.left, bottom: "-5%", width: mote.size, height: mote.size }}
            initial={{ opacity: 0 }}
            animate={{ y: ["0%", "-130%"], x: [0, mote.drift], opacity: [0, 0.5, 0] }}
            transition={{ duration: mote.duration, delay: mote.delay, repeat: Infinity, ease: "linear" }}
          />
        ))}
    </div>
  );
}
