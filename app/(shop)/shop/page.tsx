import { productsApi } from "@/lib/api/products";
import { ProductCard } from "@/components/product/ProductCard";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { StaggerGroup, StaggerItem } from "@/components/animations/StaggerReveal";

// Server Component — no filters/search yet (Phase 6); loading/empty/error
// states land in PRODUCT-19. Product price/stock is the backend's source of
// truth and changes constantly, so this must never be statically prerendered
// at build time (which would also fail the build outright if the backend
// isn't reachable during `next build`).
export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const { products } = await productsApi.list();

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
        <p className="mt-3 mb-10 max-w-xl text-sm text-zinc-500 dark:text-zinc-400">
          {products.length} spice{products.length === 1 ? "" : "s"}, sourced and ground in small batches — hover any
          card for a closer look.
        </p>
      </ScrollReveal>

      {products.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-24 text-center">
          <p className="text-base font-medium text-zinc-900 dark:text-zinc-50">No products found.</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Check back soon — new spices arrive regularly.</p>
        </div>
      ) : (
        <StaggerGroup className="grid grid-cols-2 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:gap-6">
          {products.map((product) => (
            <StaggerItem key={product.id}>
              <ProductCard product={product} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </main>
  );
}
