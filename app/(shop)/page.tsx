import { productsApi } from "@/lib/api/products";
import { categoriesApi } from "@/lib/api/categories";
import { Hero } from "@/components/landing/Hero";
import { BrandIntro } from "@/components/landing/BrandIntro";
import { CategoryShowcase } from "@/components/landing/CategoryShowcase";
import { ProductSpotlight } from "@/components/landing/ProductSpotlight";
import { FeaturedProducts } from "@/components/landing/FeaturedProducts";
import { WhyChooseUs } from "@/components/landing/WhyChooseUs";
import { FinalCta } from "@/components/landing/FinalCta";
import { AssistantAvatarGuide } from "@/components/landing/AssistantAvatarGuide";
import type { ProductDetail } from "@/types/product";

// The spotlight always shows this specific product (rather than an array
// index, which broke once the catalog was trimmed to ~7 items — DECISION
// 2026-09-16) — chosen because it's one of the few products that already
// gets a hover video from lib/product-videos.ts#getProductVideo's
// deterministic hash, so "Featured This Week"'s hover-to-play-video
// requirement is always demoable without special-casing that logic.
const SPOTLIGHT_SLUG = "green-cardamom-elaichi";

// Landing page. Fetches products/categories once here and passes them down
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

  // Category has no image of its own (no backend field/attachment) — derive
  // a representative cover photo + product count per category from the
  // products already fetched here, rather than adding backend schema for a
  // purely decorative landing-page need.
  const categoryMeta: Record<number, { coverUrl: string | null; count: number }> = {};
  for (const product of products) {
    const existing = categoryMeta[product.category_id];
    if (existing) {
      existing.count += 1;
    } else {
      categoryMeta[product.category_id] = {
        coverUrl: product.images.find((image) => image.url)?.url ?? null,
        count: 1,
      };
    }
  }

  const spotlightSource = products.find((product) => product.slug === SPOTLIGHT_SLUG) ?? products[0];
  const spotlightProduct: ProductDetail | null = spotlightSource
    ? await productsApi.getBySlug(spotlightSource.slug)
    : null;

  // Small catalog now (curated down from 20 to ~7, 2026-09-16) — the hero
  // and collection sections both simply show the full list rather than
  // slicing it into disjoint subsets.
  return (
    <main className="flex flex-1 flex-col">
      <Hero products={products} />
      <BrandIntro />
      <CategoryShowcase categories={topLevelCategories} categoryMeta={categoryMeta} />
      {spotlightProduct && <ProductSpotlight product={spotlightProduct} />}
      <FeaturedProducts products={products} />
      <WhyChooseUs />
      <FinalCta />
      <AssistantAvatarGuide />
    </main>
  );
}
