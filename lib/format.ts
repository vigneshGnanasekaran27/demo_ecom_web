const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Shared price formatter — was previously duplicated in ProductCard and the product detail page. */
export function formatPriceCents(cents: number) {
  return currencyFormatter.format(cents / 100);
}

export function discountedPriceCents(priceCents: number, discountPercent: number) {
  return discountPercent > 0 ? Math.round(priceCents * (1 - discountPercent / 100)) : priceCents;
}
