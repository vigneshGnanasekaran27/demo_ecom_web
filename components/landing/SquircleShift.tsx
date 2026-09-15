"use client";

import { useEffect, useRef } from "react";

type SquircleShiftProps = {
  colors: [string, string]; // [darkYellow, lightYellow] — interpolated per cell, not cycled
  shouldReduceMotion: boolean;
};

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lerpColor(a: [number, number, number], b: [number, number, number], t: number): string {
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r},${g},${bl})`;
}

// Roughly matches React Bits Pro's default knobs (speed 0.3, waveSpeed 0.2,
// gridFrequency 25, spiralIntensity 1, lineThickness 0.06, falloff 1,
// brightness 1.5) — tuned by feel since there's no literal source to copy,
// only the public prop list.
const CELL = 30; // px between grid points at a 1440px-wide viewport — smaller/denser per feedback for a finer, more attractive texture
const WAVE_SPEED = 0.55; // slow, elegant ripple rather than a fast pulse
const WAVE_FREQ = 0.038;
const SPIRAL_INTENSITY = 1.4;
const LINE_WIDTH = 1.1; // thinner at this density so the grid stays delicate rather than cluttered
const BASE_ALPHA = 0.4; // brightened per follow-up feedback ("brighter and softer")
const BLUR_PX = 0.7; // a light canvas-level blur takes the crisp edge off each stroke for a softer glow
const FALLOFF_POWER = 0.55; // <1 keeps mid/outer cells visible instead of fading out quickly
const CENTER_X_RATIO = 0.56; // still biased toward the product card, but reaches further into the text column than before

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, radius: number) {
  const r = Math.min(radius, size / 2);
  ctx.beginPath();
  ctx.moveTo(x - size / 2 + r, y - size / 2);
  ctx.arcTo(x + size / 2, y - size / 2, x + size / 2, y + size / 2, r);
  ctx.arcTo(x + size / 2, y + size / 2, x - size / 2, y + size / 2, r);
  ctx.arcTo(x - size / 2, y + size / 2, x - size / 2, y - size / 2, r);
  ctx.arcTo(x - size / 2, y - size / 2, x + size / 2, y - size / 2, r);
  ctx.closePath();
}

/**
 * Canvas-2D recreation of React Bits Pro's "Squircle Shift" background
 * (`@reactbits-starter/squircle-shift-tw`) — a full-bleed grid of morphing
 * squircle outlines that wave/spiral outward from a centre point with a
 * radial falloff. That registry needs a paid Starter+ license this project
 * doesn't have, and there's no public screenshot, video, or source for it
 * (it's a closed-source canvas/shader component, per its
 * waveSpeed/gridFrequency/spiralIntensity/brightness props) — this is a
 * best-effort recreation from the public prop list and docs description
 * ("full-bleed... bold and clearly visible... grid both rotates/spirals
 * and undulates"), not a pixel copy. Tuned across several rounds of
 * follow-up feedback: falloff uses a <1 power curve so cells stay visible
 * further from centre instead of fading out quickly (while still favouring
 * the product-card side over the text column); size/density were dialed
 * down twice for a finer, more attractive texture; and colour is now a
 * dark-yellow-to-light-yellow gradient interpolated per cell from the same
 * `wave` value that drives each cell's size — so a cell brightens toward
 * the light end exactly as it grows, instead of jumping between unrelated
 * hues, which is what "smooth colour transitions" asked for. Softened per
 * "brighter and softer" follow-up feedback via a CSS `filter: blur(...)`
 * on the `<canvas>` element itself — NOT `ctx.filter` inside the draw
 * loop, which was tried first and froze the tab: filtering every one of
 * ~1300 stroke calls per frame in the 2D context is drastically more
 * expensive than one GPU-composited blur pass over the finished bitmap.
 * Caught via the browser genuinely hanging during verification, not a
 * type error or lint warning — canvas performance problems like this
 * don't announce themselves any other way.
 *
 * Deliberately Canvas 2D, not WebGL/three.js — this project dropped
 * react-three-fiber after real WebGL context-loss failures in this sandbox
 * (see DECISIONS.md); a plain 2D canvas has none of that risk.
 */
export function SquircleShift({ colors, shouldReduceMotion }: SquircleShiftProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const darkRgb = hexToRgb(colors[0]);
    const lightRgb = hexToRgb(colors[1]);

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    function paint(time: number) {
      ctx!.clearRect(0, 0, width, height);
      const cx = width * CENTER_X_RATIO;
      const cy = height * 0.42;
      const maxDist = Math.hypot(Math.max(cx, width - cx), Math.max(cy, height - cy));
      const t = time * 0.001 * WAVE_SPEED;

      const cols = Math.ceil(width / CELL) + 1;
      const rows = Math.ceil(height / CELL) + 1;

      for (let gy = 0; gy <= rows; gy++) {
        for (let gx = 0; gx <= cols; gx++) {
          const x = gx * CELL;
          const y = gy * CELL;
          const dx = x - cx;
          const dy = y - cy;
          const dist = Math.hypot(dx, dy);
          const angle = Math.atan2(dy, dx);

          const wave = Math.sin(dist * WAVE_FREQ - t * 2.2 + angle * SPIRAL_INTENSITY) * 0.5 + 0.5;
          const linearFalloff = Math.max(0, 1 - dist / maxDist);
          const falloff = linearFalloff ** FALLOFF_POWER;
          if (falloff <= 0.02) continue;

          const size = CELL * (0.36 + wave * 0.38) * (0.55 + falloff * 0.45);
          const radius = size * (0.22 + wave * 0.28);
          const alpha = BASE_ALPHA * falloff * (0.45 + wave * 0.55);
          if (alpha <= 0.006) continue;

          ctx!.globalAlpha = alpha;
          ctx!.strokeStyle = lerpColor(darkRgb, lightRgb, wave);
          ctx!.lineWidth = LINE_WIDTH;
          drawRoundedRect(ctx!, x, y, size, radius);
          ctx!.stroke();
        }
      }
    }

    if (shouldReduceMotion) {
      paint(0);
      return () => window.removeEventListener("resize", resize);
    }

    let raf = 0;
    function loop(time: number) {
      paint(time);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [colors, shouldReduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 h-full w-full"
      style={{ filter: `blur(${BLUR_PX}px)` }}
    />
  );
}
