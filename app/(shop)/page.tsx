import { productsApi } from "@/lib/api/products";
import { categoriesApi } from "@/lib/api/categories";
import { Hero } from "@/components/landing/Hero";
import { BrandIntro } from "@/components/landing/BrandIntro";
import { CategoryShowcase } from "@/components/landing/CategoryShowcase";
import { ProductSpotlight } from "@/components/landing/ProductSpotlight";
import { FeaturedProducts } from "@/components/landing/FeaturedProducts";
import { WhyChooseUs } from "@/components/landing/WhyChooseUs";
import { FinalCta } from "@/components/landing/FinalCta";
import type { ProductDetail } from "@/types/product";

// Landing page. Fetches products/categories once here and passes slices down
// as props, rather than every section fetching independently (Hero's
// auto-cycling showcase, the category tiles, and the collection grid would
// otherwise triplicate the same API calls). Live price/stock/category data
// is the backend's source of truth and changes constantly, so this page must
// never be statically prerendered.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [{ products }, categories] = await Promise.all([
    productsApi.list({ per_page: 20 }),
    categoriesApi.list(),
  ]);

  const topLevelCategories = categories
    .filter((category) => category.parent_id === null)
    .sort((a, b) => a.position - b.position);

  // Hero (5 floating products) and the spotlight deliberately draw from
  // different positions so the spotlight doesn't just repeat something
  // already floating in the hero.
  const heroProducts = products.slice(0, 5);
  let spotlightProduct: ProductDetail | null = null;
  if (products[5]) {
    spotlightProduct = await productsApi.getBySlug(products[5].slug);
  }

  return (
    <main className="flex flex-1 flex-col">
      <Hero products={heroProducts} />
      <BrandIntro />
      <CategoryShowcase categories={topLevelCategories} />
      {spotlightProduct && <ProductSpotlight product={spotlightProduct} />}
      <FeaturedProducts products={products.slice(0, 12)} />
      <WhyChooseUs />
      <FinalCta />
    </main>
  );
}
