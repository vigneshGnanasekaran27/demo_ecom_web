// Matches app/serializers/category_serializer.rb.
export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  position: number;
}
