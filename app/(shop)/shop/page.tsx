import { productsApi } from "@/lib/api/products";
import { ProductCard } from "@/components/product/ProductCard";

// Server Component — no filters/search yet (Phase 6); loading/empty/error
// states land in PRODUCT-19. Product price/stock is the backend's source of
// truth and changes constantly, so this must never be statically prerendered
// at build time (which would also fail the build outright if the backend
// isn't reachable during `next build`).
export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const { products } = await productsApi.list();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Shop</h1>
      {products.length === 0 ? (
        <p className="py-24 text-center text-sm text-zinc-500 dark:text-zinc-400">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
