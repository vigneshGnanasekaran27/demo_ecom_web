import Link from "next/link";
import { productsApi } from "@/lib/api/products";
import { categoriesApi } from "@/lib/api/categories";
import { ProductCard } from "@/components/product/ProductCard";
import { ShopFilters } from "@/components/product/ShopFilters";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { StaggerGroup, StaggerItem } from "@/components/animations/StaggerReveal";

// Server Component — search/category filter/pagination are URL-driven
// (?q=&category=&page=) so results stay server-rendered; only the filter
// controls themselves (ShopFilters) need to be a Client Component. Product
// price/stock is the backend's source of truth and changes constantly, so
// this must never be statically prerendered at build time (which would also
// fail the build outright if the backend isn't reachable during `next build`).
export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const { q = "", category = "", page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [{ products, meta }, categories] = await Promise.all([
    productsApi.list({ q: q || undefined, category: category || undefined, page }),
    categoriesApi.list(),
  ]);
  const topLevelCategories = categories.filter((c) => c.parent_id === null).sort((a, b) => a.position - b.position);
  const totalPages = Math.max(1, Math.ceil(meta.total / meta.per_page));

  const pageHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (targetPage > 1) params.set("page", String(targetPage));
    return `/shop${params.toString() ? `?${params.toString()}` : ""}`;
  };

  return (
    <main className="relative mx-auto w-full max-w-6xl px-4 py-12 sm:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(45% 70% at 20% 0%, var(--color-brand-500), transparent 60%), radial-gradient(35% 60% at 85% 20%, var(--color-brand-700), transparent 60%)",
        }}
      />

      <ScrollReveal>
        <p className="text-xs font-medium tracking-[0.2em] text-brand-600 uppercase dark:text-brand-400">
          The full range
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
          Shop the collection
        </h1>
        <p className="mt-3 mb-6 max-w-xl text-sm text-zinc-500 dark:text-zinc-400">
          {meta.total} spice{meta.total === 1 ? "" : "s"}, sourced and ground in small batches — hover any card for a
          closer look.
        </p>
      </ScrollReveal>

      <ShopFilters categories={topLevelCategories} initialQuery={q} initialCategory={category} />

      {products.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-24 text-center">
          <p className="text-base font-medium text-zinc-900 dark:text-zinc-50">No products found.</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {q || category ? "Try a different search or filter." : "Check back soon — new spices arrive regularly."}
          </p>
        </div>
      ) : (
        <>
          <StaggerGroup className="grid grid-cols-2 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:gap-6">
            {products.map((product) => (
              <StaggerItem key={product.id}>
                <ProductCard product={product} />
              </StaggerItem>
            ))}
          </StaggerGroup>

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href={pageHref(page - 1)}
                aria-disabled={page <= 1}
                className={`rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-200 ${
                  page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                Previous
              </Link>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                Page {page} of {totalPages}
              </span>
              <Link
                href={pageHref(page + 1)}
                aria-disabled={page >= totalPages}
                className={`rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-200 ${
                  page >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                Next
              </Link>
            </div>
          )}
        </>
      )}
    </main>
  );
}
