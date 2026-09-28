# Prompt — add xelpovsurgical.com's prices to the catalogue

Copy everything below the line into Antigravity (or any agentic tool with browser + file access).

---

## What I need

My product catalogue at `C:\Users\lenovo\Desktop\medical\client\public\xelpov_products.json` doesn't have prices yet. I need you to go back through every product already in that file, find its price on **https://xelpovsurgical.com** (the same source site the product data came from), and add it to the catalogue — using the exact same price the supplier lists, not a markup or estimate.

## Current state

- `xelpov_products.json` has 937+ products (and growing as more get scraped). Each has a `sourceUrl` field pointing to its exact page on xelpovsurgical.com, e.g. `https://xelpovsurgical.com/product/castroviejo-micro-needle-holder/`.
- None of them have a price field yet.

## What to add to the schema

Add a `price` object to every product:

```json
{
  "slug": "castroviejo-micro-needle-holder",
  "...": "...(existing fields unchanged)...",
  "price": {
    "amount": 129.00,
    "currency": "USD",
    "onRequest": false
  }
}
```

Rules:
- `amount` is a plain number (no currency symbols, no commas) — copy the exact number xelpovsurgical.com shows for that product, whatever currency it's actually listed in.
- `currency` is whatever ISO code matches what the site displays (check what currency the site actually prices in — don't assume USD, verify it).
- If a product shows a **price range** (e.g. because it has size/variant options), capture the base/starting price in `amount` and add a `"priceMax": <number>` field alongside it for the top of the range.
- If a product's page shows **no price at all** (some sites show "Contact for pricing" instead), set `"onRequest": true` and leave `amount` as `null`. Don't guess a number.
- Don't apply any markup, conversion, or rounding — this should be the identical number the supplier lists. Pricing decisions (markup, currency conversion, hiding it from customers) happen separately in the app, not in this data.

## How to fetch prices

Same approach as the existing scraping pipeline — reuse it rather than reinventing:

1. For each product, its `sourceUrl` is the exact page to check. Batch these in groups of ~6 and fetch them **in parallel** with `Promise.all()` inside a browser tab already on xelpovsurgical.com (`fetch()` + `DOMParser()`), same as the product-detail scraping already being done for descriptions/specs.
2. On the page, the price sits in WooCommerce's standard price markup — look for `.price` / `.woocommerce-Price-amount` (or similar — inspect the actual page structure first, since the exact class names may differ from a generic WooCommerce theme). If the product has variants, WooCommerce typically shows a `<span class="price">` containing two `.woocommerce-Price-amount` values (min–max) when no variant is selected yet.
3. Parse out the numeric amount and the currency symbol/code shown, and normalize the symbol to an ISO currency code (e.g. `$` → `USD`, `ر.س` or `SAR` → `SAR`).
4. Match each scraped price back to its product by `slug` (derived from the same `sourceUrl`) and merge it into the existing entry in `xelpov_products.json` — update in place, don't create duplicate entries.
5. Save/commit progress after each batch, same as the existing pipeline, so nothing is lost if interrupted.
6. Skip any product that already has a `price` field filled in, in case this gets re-run later — don't re-fetch prices that are already recorded.

## Scope

Go through **every product currently in `xelpov_products.json`**, in whatever order is easiest (doesn't need to match the original scraping order). As new products get added by the ongoing scraping work, this price pass can be re-run to backfill the ones still missing a price — just skip anything that already has one (rule above).

## One more thing

The app currently has a `PRICES_ENABLED=false` flag that hides prices from customers site-wide (no price list existed before now). Once prices are added to the data, leave that flag as-is — don't flip it to `true` yourself. I'll turn prices on for customers once I've reviewed them.
