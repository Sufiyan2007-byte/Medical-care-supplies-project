// ═══════════════════════════════════════════════════════
// pricing.js — single switch for showing/hiding Xelpov prices
// ═══════════════════════════════════════════════════════

// Flip this to `false` to hide prices from customers site-wide again.
export const PRICES_ENABLED = true;

/**
 * Format a product's `price` object (see xelpov_products.json schema:
 * { amount, priceMax?, currency, onRequest }) into a display string.
 * Returns null if there's nothing sensible to show (e.g. no price data
 * yet, or the field is missing entirely).
 */
export function formatProductPrice(price) {
  if (!price || price.onRequest || price.amount == null) return null;

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: price.currency || 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const min = formatter.format(price.amount);
  if (price.priceMax != null && price.priceMax > price.amount) {
    const max = formatter.format(price.priceMax);
    return `${min} – ${max}`;
  }
  return min;
}
