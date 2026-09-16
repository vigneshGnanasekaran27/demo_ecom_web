"use client";

import { useRef } from "react";
import { useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { StaggerGroup, StaggerItem } from "@/components/animations/StaggerReveal";
import { SectionVideoBackground } from "@/components/landing/SectionVideoBackground";

// Small hand-rolled inline icons (no icon library — 4 simple SVGs don't
// clear AI_RULES.md §2's bar for a new dependency) matching each reason:
// a pin for named-farm sourcing, a mill wheel for small-batch grinding, a
// shield for zero additives, a flask for lab purity testing.
const ICONS: Record<string, React.ReactNode> = {
  sourcing: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5">
      <path
        d="M12 21s7-6.1 7-11.2A7 7 0 0 0 5 9.8C5 14.9 12 21 12 21Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.5" r="2.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  grinding: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5">
      <circle cx="12" cy="12" r="8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 4v4M12 16v4M4 12h4M16 12h4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  additives: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5">
      <path
        d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  purity: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5">
      <path d="M9 3h6M10 3v5.5L5.5 17a2 2 0 0 0 1.8 3h9.4a2 2 0 0 0 1.8-3L14 8.5V3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 14h8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const reasons = [
  {
    icon: "sourcing",
    title: "Single-origin sourcing",
    description: "Bought directly from named farms in Kerala, Kashmir, and Tamil Nadu.",
  },
  {
    icon: "grinding",
    title: "Small-batch grinding",
    description: "Ground weekly, never months ahead, so every pack tastes freshly opened.",
  },
  {
    icon: "additives",
    title: "Zero additives",
    description: "No anti-caking agents, no fillers, no artificial colour.",
  },
  {
    icon: "purity",
    title: "Purity tested",
    description: "Every batch is lab-tested for purity before it ships to you.",
  },
] as const;


/**
 * Quality/authenticity section (landing-page brief §7.6). Redesigned
 * 2026-09-16 with a deliberately different visual language from every other
 * landing section — a cinematic, full-bleed dark video backdrop
 * (SectionVideoBackground, the same lazy/reduced-motion-safe component
 * FinalCta uses, with a different clip) instead of a light card grid, with
 * glass-morphism reason cards floating over it. Each card parallaxes
 * upward at a different rate as the section scrolls past — a layered depth
 * effect distinct from Category's float or Collection's spotlight cycle.
 */
export function WhyChooseUs() {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });

  // Each card drifts upward at its own rate as the section scrolls past —
  // 4 explicit calls (one per reason, a fixed constant count) rather than a
  // .map() loop, since hooks must be called the same way every render.
  const noRange: [number, number] = [0, 0];
  const cardY = [
    useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? noRange : [0, -14]),
    useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? noRange : [0, -34]),
    useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? noRange : [0, -22]),
    useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? noRange : [0, -42]),
  ];

  return (
    <ScrollReveal ref={sectionRef} className="relative overflow-hidden bg-zinc-950 py-24 sm:py-32">
      <SectionVideoBackground src="/videos/demovideo3.mp4" />
      {/* Cinematic grade: darkens the raw footage and vignettes the edges so
          white text stays legible everywhere, not just over a scrim strip. */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/70 to-black/90" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ boxShadow: "inset 0 0 180px 60px rgba(0,0,0,0.85)" }}
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 text-center">
        <p className="text-xs font-medium tracking-[0.3em] text-brand-300 uppercase">Our promise</p>
        <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Quality you can taste
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-white/60">From farm to jar, nothing is left to chance.</p>

        <StaggerGroup className="mt-14 grid grid-cols-1 gap-6 text-left sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason, index) => (
            <StaggerItem key={reason.title} style={{ y: cardY[index] }}>
              <div className="h-full rounded-2xl border border-white/15 bg-white/[0.06] p-5 backdrop-blur-md transition-colors duration-300 hover:bg-white/[0.1]">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-brand-300">
                  {ICONS[reason.icon]}
                </div>
                <h3 className="text-sm font-semibold text-white">{reason.title}</h3>
                <p className="mt-1 text-sm text-white/60">{reason.description}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </ScrollReveal>
  );
}
