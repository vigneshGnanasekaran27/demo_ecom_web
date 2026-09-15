import Link from "next/link";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

/**
 * Final premium CTA (landing-page brief §7.9) — the closing "shopping"
 * moment of the story, bookending the hero's gradient treatment.
 */
export function FinalCta() {
  return (
    <ScrollReveal className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500">
      <div
        aria-hidden
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(60% 60% at 15% 20%, rgba(255,255,255,0.25) 0%, transparent 60%), radial-gradient(50% 50% at 85% 80%, rgba(0,0,0,0.25) 0%, transparent 60%)",
        }}
      />
      <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 py-20 text-center sm:py-28">
        <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
          Bring authentic flavour home.
        </h2>
        <p className="max-w-xl text-base text-white/80 sm:text-lg">
          Twenty spices, four ways to cook — whole, ground, blended, or ready-made. Your kitchen, elevated.
        </p>
        <Link
          href="/shop"
          className="rounded-md bg-white px-8 py-3.5 text-sm font-semibold text-brand-900 transition-transform hover:scale-[1.03] sm:text-base"
        >
          Explore Our Spices
        </Link>
      </div>
    </ScrollReveal>
  );
}
