"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { Category } from "@/types/category";

/**
 * Search + category controls for /shop. URL-driven (not client state) so the
 * results themselves stay server-rendered — submitting always resets to
 * page 1, since a new search/filter invalidates whatever page you were on.
 */
export function ShopFilters({
  categories,
  initialQuery,
  initialCategory,
}: {
  categories: Category[];
  initialQuery: string;
  initialCategory: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  const navigate = (next: { q?: string; category?: string }) => {
    const params = new URLSearchParams();
    const q = next.q ?? initialQuery;
    const category = next.category ?? initialCategory;
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    router.push(`/shop${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    navigate({ q: query });
  };

  return (
    <div className="mb-8 flex flex-wrap items-center gap-3">
      <form onSubmit={handleSubmit} className="relative flex-1 min-w-[200px]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.2-5.2m0 0a7.5 7.5 0 1 0-10.6-10.6 7.5 7.5 0 0 0 10.6 10.6Z" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search spices..."
          aria-label="Search products"
          className="w-full rounded-md border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </form>

      <select
        value={initialCategory}
        onChange={(e) => navigate({ category: e.target.value })}
        aria-label="Filter by category"
        className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
      >
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.slug}>
            {category.name}
          </option>
        ))}
      </select>

      {(initialQuery || initialCategory) && (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            router.push("/shop");
          }}
          className="text-sm font-medium text-zinc-500 underline-offset-2 hover:text-zinc-800 hover:underline dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          Clear
        </button>
      )}
    </div>
  );
}
