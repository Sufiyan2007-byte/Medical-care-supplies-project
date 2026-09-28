// Shared, single-flight loader for the Xelpov surgical-instrument catalogue.
//
// Home, the specialties overview, the per-specialty catalogue, and the product
// detail page each used to independently `fetch('/xelpov_products.json')` and
// re-parse the ~3.4MB / 3151-product file on every mount — so browsing from
// the homepage into a specialty and then into a product downloaded and parsed
// the same file three separate times in one visit. This module fetches it
// once per page load (a module-level singleton promise) and every caller
// shares the same parsed array, so navigating between these pages no longer
// re-fetches or re-parses anything.

let inflight = null;

/** Returns a Promise that resolves to the full products array. Fetches once. */
export function loadXelpovProducts() {
  if (!inflight) {
    inflight = fetch('/xelpov_products.json')
      .then((r) => r.json())
      .catch((err) => {
        // Let a failed fetch be retried on the next call instead of caching a rejection forever.
        inflight = null;
        throw err;
      });
  }
  return inflight;
}
