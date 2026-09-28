/**
 * Prices are hidden until the real supplier price list is loaded.
 * Flip PRICES_ENABLED to true once real prices are in the catalogue / database —
 * every page, the cart and checkout switch over together.
 */
export const PRICES_ENABLED = false;

/** Returns a usable positive number, or null (= "price on request"). */
export const priceOf = (p) => (PRICES_ENABLED && Number(p) > 0 ? Number(p) : null);

export const priceOnRequest = (isAr) => (isAr ? 'السعر عند الطلب' : 'Price on request');

/**
 * Saudi Riyal is pegged to the US Dollar at a fixed rate by SAMA (Saudi
 * Central Bank) — this has held since 1986 and is still the official rate.
 * Any USD price coming in (from a supplier quote, price list, etc.) should
 * be converted to SAR with this before being stored — the catalogue only
 * ever stores SAR, never USD, per the currency this app displays.
 */
export const USD_TO_SAR_RATE = 3.75;

/**
 * Converts an amount from a source currency into SAR for storage.
 * Returns null (never a guessed number) if the source currency isn't one
 * we have a known rate for — add it above rather than assuming a rate.
 */
export function convertToSAR(amount, fromCurrency = 'USD') {
  if (amount == null || Number.isNaN(Number(amount))) return null;
  const rates = { SAR: 1, USD: USD_TO_SAR_RATE };
  const rate = rates[String(fromCurrency).toUpperCase()];
  if (rate == null) return null;
  return Math.round(Number(amount) * rate * 100) / 100;
}

/**
 * Xelpov catalogue products store price as an object — { amount, priceMax?,
 * currency, onRequest } — rather than the plain-number `price` used
 * elsewhere in the app. This formats that object using the same
 * PRICES_ENABLED switch as priceOf/priceOnRequest above, so every price
 * display in the app (old catalogue and Xelpov catalogue alike) turns on
 * or off together, and matches the same "129.00 SAR" / "129.00 ر.س" style
 * used elsewhere (ProductListing, ProductDetail) rather than Intl's
 * currency formatting, which would render as "SAR 129.00".
 * Returns a formatted string, or null if there's nothing to show
 * (hidden, missing, or on request).
 */
export function formatXelpovPrice(price, isAr = false) {
  if (!PRICES_ENABLED) return null;
  if (!price || price.onRequest || price.amount == null) return null;

  const currency = price.currency || 'SAR';
  const unit = currency === 'SAR' ? (isAr ? 'ر.س' : 'SAR') : currency;

  const min = Number(price.amount).toFixed(2);
  if (price.priceMax != null && price.priceMax > price.amount) {
    return `${min} – ${Number(price.priceMax).toFixed(2)} ${unit}`;
  }
  return `${min} ${unit}`;
}
