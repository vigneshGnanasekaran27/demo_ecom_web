import type { Category } from "@/types/category";

// Matches app/serializers/product_image_serializer.rb.
export interface ProductImage {
  id: number;
  position: number;
  alt_text: string | null;
  url: string | null;
}

// Matches app/serializers/product_list_serializer.rb — lean, card-level
// fields. `images` holds up to the first 2 (ProductListSerializer::
// PREVIEW_IMAGE_COUNT) positions — enough for the hover/tap multi-view
// preview without the full detail payload.
export interface ProductListItem {
  id: number;
  name: string;
  slug: string;
  price_cents: number;
  discount_percent: number;
  stock_quantity: number;
  category_id: number;
  images: ProductImage[];
}

// Matches app/serializers/product_detail_serializer.rb.
export interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  price_cents: number;
  discount_percent: number;
  stock_quantity: number;
  status: "active" | "inactive";
  specifications: Record<string, unknown>;
  position: number;
  category_id: number;
  category: Category;
  images: ProductImage[];
}
