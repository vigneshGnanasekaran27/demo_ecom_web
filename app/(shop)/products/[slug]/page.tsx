import { notFound } from "next/navigation";
import { productsApi } from "@/lib/api/products";
import { ApiError } from "@/lib/api/client";
import { ProductGallery } from "@/components/product/ProductGallery";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import type { ProductDetail } from "@/types/product";

// Server Component for content/SEO. Product price/stock/description is the
// backend's source of truth and changes constantly, so — same as
// PRODUCT-14's /shop — this must never be statically prerendered.
export const dynamic = "force-dynamic";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

async function fetchProduct(slug: string): Promise<ProductDetail> {
  try {
    return await productsApi.getBySlug(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}

export default async function ProductDetailPage(props: PageProps<"/products/[slug]">) {
  const { slug } = await props.params;
  const product = await fetchProduct(slug);

  const hasDiscount = product.discount_percent > 0;
  const discountedCents = hasDiscount
    ? Math.round(product.price_cents * (1 - product.discount_percent / 100))
    : product.price_cents;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <ProductGallery images={product.images} productName={product.name} productSlug={product.slug} />

        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{product.category.name}</p>
          <h1 className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{product.name}</h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {currencyFormatter.format(discountedCents / 100)}
            </span>
            {hasDiscount && (
              <span className="text-lg text-zinc-400 line-through">
                {currencyFormatter.format(product.price_cents / 100)}
              </span>
            )}
          </div>

          {product.stock_quantity <= 0 ? (
            <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">Out of stock</p>
          ) : (
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{product.stock_quantity} in stock</p>
          )}

          {product.description && (
            <p className="mt-6 text-sm leading-6 text-zinc-700 dark:text-zinc-300">{product.description}</p>
          )}

          <div className="mt-6">
            <AddToCartButton productId={product.id} inStock={product.stock_quantity > 0} />
          </div>
        </div>
      </div>
    </main>
  );
}
