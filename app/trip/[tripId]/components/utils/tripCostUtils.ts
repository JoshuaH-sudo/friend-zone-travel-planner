import { convert } from "@/lib/format";

type PricedItem = {
  price: number;
  currency: string;
};

/**
 * Sums items by their currency, returning a map of currency → total.
 * Items with no price (≤ 0) or no currency are skipped.
 */
export function sumByCurrency(items: PricedItem[]): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const item of items) {
    if (!item.price || !item.currency || item.price <= 0) continue;
    totals[item.currency] = (totals[item.currency] || 0) + item.price;
  }
  return totals;
}

/**
 * Sums a list of priced items, converting each to `targetCurrency` using
 * the provided exchange `rates`. Returns the grand total as a number.
 */
export function sumInCurrency(
  items: PricedItem[],
  targetCurrency: string,
  rates: Record<string, number>,
): number {
  return items.reduce(
    (sum, item) => sum + convert(item.price, item.currency, targetCurrency, rates),
    0,
  );
}
