import { ScrollReveal } from "@/components/animations/ScrollReveal";

/**
 * Short brand introduction (landing-page brief §7.2) — purely static copy,
 * wrapped in ScrollReveal for a subtle entrance as the user scrolls past
 * the hero. No data fetching, so no loading/error states apply here.
 */
export function BrandIntro() {
  return (
    <ScrollReveal className="mx-auto w-full max-w-3xl px-4 py-20 text-center sm:py-28">
      <p className="text-xs font-medium tracking-[0.2em] text-brand-600 uppercase dark:text-brand-400">
        Our story
      </p>
      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
        Spice, the way it used to taste.
      </h2>
      <p className="mt-6 text-base leading-7 text-zinc-600 sm:text-lg dark:text-zinc-400">
        We work directly with small farms across Kerala, Kashmir, and Tamil Nadu — sourcing whole spices at peak
        harvest and stone-grinding them in small batches, never pre-ground months in advance. No fillers, no
        anti-caking agents, no shortcuts. Just spice, the way it used to taste.
      </p>
    </ScrollReveal>
  );
}
