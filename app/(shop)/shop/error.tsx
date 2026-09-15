"use client";

// Error boundary for the /shop route segment (FRONTEND_RULES.md §10 and §22:
// friendly message only, never the raw error — Next.js still logs `error` to
// the server console for debugging).
export default function ShopError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-24 text-center">
      <p className="text-base font-medium text-zinc-900 dark:text-zinc-50">Unable to load products.</p>
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
