// Matches app/serializers/cart_item_serializer.rb / cart_serializer.rb.
export interface CartItem {
  id: number;
  product_id: number;
  product: {
    name: string;
    slug: string;
    stock_quantity: number;
    image: { id: number; position: number; alt_text: string | null; url: string | null } | null;
  };
  quantity: number;
  unit_price_cents: number;
  line_total_cents: number;
}

export interface Cart {
  id: number;
  status: string;
  items: CartItem[];
  subtotal_cents: number;
  delivery_charge_cents: number;
  discount_cents: number;
  total_cents: number;
}
