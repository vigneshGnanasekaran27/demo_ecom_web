import { ScrollReveal } from "@/components/animations/ScrollReveal";

const reasons = [
  {
    title: "Single-origin sourcing",
    description: "Bought directly from named farms in Kerala, Kashmir, and Tamil Nadu — never blind wholesale lots.",
  },
  {
    title: "Small-batch grinding",
    description: "Ground weekly, never months ahead, so every pack tastes like it was opened the same week.",
  },
  {
    title: "Zero additives",
    description: "No anti-caking agents, no fillers, no artificial colour. Just spice, nothing else.",
  },
  {
    title: "Purity tested",
    description: "Every batch is lab-tested for purity and pesticide residue before it ships to you.",
  },
];

/**
 * Quality/authenticity section (landing-page brief §7.6 — repurposed from
 * the original generic trust-badges copy). Same reusable card-grid
 * structure, purely static content, no data fetching.
 */
export function WhyChooseUs() {
  return (
    <ScrollReveal className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
      <h2 className="mb-2 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
        Quality you can taste
      </h2>
      <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">From farm to jar, nothing is left to chance.</p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {reasons.map((reason) => (
          <div
            key={reason.title}
            className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
              <span className="text-sm font-semibold">{reason.title.charAt(0)}</span>
            </div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{reason.title}</h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{reason.description}</p>
          </div>
        ))}
      </div>
    </ScrollReveal>
  );
}
