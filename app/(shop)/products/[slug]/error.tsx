"use client";

// Error boundary for the /products/[slug] route segment. A missing product
// takes the separate notFound() path in page.tsx (renders the 404 UI, not
// this) — this only fires for real failures (API down, 5xx, network error).
export default function ProductDetailError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-24 text-center">
      <p className="text-base font-medium text-zinc-900 dark:text-zinc-50">Unable to load this product.</p>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Please try again.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
      >
        Try again
      </button>
    </main>
  );
}
