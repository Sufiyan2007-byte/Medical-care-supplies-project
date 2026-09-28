# Handoff prompt — Xelpov medical supply catalogue import

Copy everything below the line into Antigravity (or any agentic coding tool with browser + file access) as your instructions.

---

## Project

I have a bilingual (Arabic RTL / English) medical-supplies e-commerce site "Medical Care Supplies / شركة لوازم الرعاية الطبية" for Saudi Arabia, located at `C:\Users\lenovo\Desktop\medical`. It's a React 19 + Vite frontend (`client/`) and an Express + Prisma/Postgres backend (`server/`).

## Goal

Add **all ~3,150 products** from the supplier site **xelpovsurgical.com** into my catalogue, matching the supplier's own category structure (their taxonomy has two axes: ~20 "Specialty" categories and ~34 "Main Category" instrument-type categories). Each product needs:
- The same **real product photo** as the source site (pulled directly from the live site, not a stock/placeholder image — quality matters, use the highest-res version available).
- An **original, factually-derived description** — written by me/you from the spec sheet, never copied verbatim from the supplier's marketing copy. This is a hard copyright-avoidance requirement: their "shortDesc" marketing prose must be paraphrased into plain factual usage language before it's stored anywhere.

Prices stay hidden for now (`PRICES_ENABLED=false` — no price list yet).

## Current progress (as of this handoff)

- Master catalogue file: `client/public/xelpov_products.json` — currently **262 products**.
- Product images: `client/public/xelpov_images/<category-slug>/<product-slug>.<jpg|png>` — currently only the `microsurgery/` subfolder is populated.
- Of the **Microsurgery** specialty (235 products total across 10 paginated listing pages on the supplier site, 24 products per page except the last), **pages 1–6 are fully done** (144 products, with real images committed). **Pages 7–10 remain** (91 products).
- After Microsurgery, the remaining specialties to do, in ascending size order (do largest last), are approximately:
  Plastic Surgery (240), Urology (430), Ophthalmic (456), Stomach/Intestine & Rectum (489), Neurosurgery/Spine (519), Gynecology & Obstetrics (529), Oral & Maxillofacial (637), Cardiovascular (641), General Surgery (723), ENT (823), Dental (826), Orthopedic (902).
  (Products cross-listed under multiple specialties on the supplier site should only be added once — check for slug collisions before merging.)
- I have permission from the site owner (myself) to **delete the old `ent_instruments.json`/`ent_images/` and `surgical_instruments.json`/`surgical_images/` catalogues** (1,956 legacy products) once the new unified catalogue covers equivalent ground — not done yet.
- The React app's pages/navigation/routes still need to be **rebuilt to read from the new unified `xelpov_products.json`** instead of the old catalogue files — not started yet. This includes updating `App.jsx`, `MainLayout.jsx`, `Products.jsx`, and the `en`/`ar` `translation.json` files for the new category structure.

## Product JSON schema (keep consistent)

```json
{
  "slug": "castroviejo-micro-needle-holder",
  "name": "Castroviejo Micro Needle Holder",
  "specialty": ["Microsurgery", "Ophthalmic"],
  "mainCategory": ["Needle Holders & Passers"],
  "subCategory": ["Micro Needle Holders"],
  "specs": {
    "authorName": "Castroviejo",
    "handleType": "Spring Handle",
    "overallLength": "14 cm – 5 ½”",
    "finish": "Satin",
    "material": "Stainless Steel",
    "ceMarking": true,
    "reusable": true
  },
  "description": "Original, factual sentence(s) derived from the specs and a paraphrased use-case — never the supplier's marketing prose.",
  "image": "/xelpov_images/microsurgery/castroviejo-micro-needle-holder.png",
  "sourceUrl": "https://xelpovsurgical.com/product/castroviejo-micro-needle-holder/"
}
```

Notes on the schema:
- `specs` keys are camelCase versions of the supplier's spec-table row labels (e.g. "Working End Details" → `workingEndDetails`).
- A handful of the supplier's own category names contain commas that must NOT be split when parsing comma-separated specialty/category lists: `Stomach, Intestine & Rectum`, `Knives, Needles & Picks`, `Dissectors, Elevators & Levers`, `Files, Saws & Rasps`.
- Some products legitimately have no real photo — the supplier shows a generic placeholder image at a URL containing `xelpov-placeholder`. Detect this and set `"image": null` rather than downloading the placeholder.
- Slugs should be derived from the last path segment of the supplier's product URL, URL-decoded, with unicode fraction characters (½ ¼ ¾ ⌀) converted to words (half/quarter/three-quarter/diameter) before slugifying to lowercase-hyphenated ASCII.

## The scraping/image pipeline that has worked reliably

I was doing this through a browser automation bridge (Claude's browser tools), running JS directly in a tab open on xelpovsurgical.com. The key technique — **use this same approach regardless of which agent/tool executes it**, since it's what solved reliability problems with plain downloads:

1. **Scrape product pages** with `fetch()` + `DOMParser()` in-page, extracting: page title (`h1.product_title`), gallery image URLs (`.woocommerce-product-gallery img`, prefer `data-large_image` attribute over `src`), the spec table (`table.woocommerce-product-attributes tr`), and the short description block. Do this in parallel across a batch of ~6 product URLs at once with `Promise.all()` (NOT a sequential loop — sequential fetches were flaky and produced truncated/corrupted batches in my testing).

2. **Fetch images as base64**, again via in-page `fetch()` → `blob.arrayBuffer()` → manual base64 encoding, and again in parallel with `Promise.all()` across a batch. Do NOT trigger browser-native file downloads (clicking `<a download>` links) — those downloads landed as stuck, unpredictably-delayed `.tmp` files and were unreliable. The in-page base64 fetch approach was rock solid by comparison. Batch size: ~5 small images (10–40KB raw) per call, or fewer (1–3) large "composite/graphic" images (150–350KB raw) per call — these larger images are a legitimate primary product photo style the supplier uses sometimes (filenames like `Untitled-design-NN.png`), not something to skip.

3. **Decode and save** the base64 payloads to disk with a small Python/Node script, verify each image opens correctly (check dimensions) before treating it as done.

4. **Paraphrase** each product's `shortDesc` marketing text from the scrape into a short, original, factual description before writing it into the raw batch data — never store the supplier's verbatim marketing sentences anywhere, even temporarily, since that data eventually becomes the live product description.

5. **Transform** the raw scraped batch into the final schema above (camelCase specs, slugify, protect comma-containing category names, pick the first non-placeholder image and assign it the local `/xelpov_images/<category>/<slug>.<ext>` path).

6. **Check for slug collisions** against the existing `xelpov_products.json` before merging (products cross-listed under multiple specialties on the supplier site must only be added once).

7. **Merge and save** the updated `xelpov_products.json`, and write the images into `client/public/xelpov_images/<category-slug>/`.

8. Move to the next batch/page and repeat.

## What I need you to do

1. Continue exactly where this left off: **finish Microsurgery pages 7–10** (91 more products) using the pipeline above, sourced from `https://xelpovsurgical.com` (their Microsurgery category is paginated ~24 products per page).
2. Then continue through the remaining specialties listed above, in ascending size order, largest last, applying the same pipeline, until all ~3,150 products are imported with real images and original descriptions.
3. Once the new catalogue covers equivalent ground to the old ENT and General Surgery Instruments catalogues, **delete** `client/public/ent_instruments.json`, `client/public/ent_images/`, `client/public/surgical_instruments.json`, and `client/public/surgical_images/`.
4. **Rebuild the site's navigation, routes, and product pages** in `client/` to read from and display the new unified `xelpov_products.json` catalogue (by specialty and by instrument-type category, matching the supplier's own taxonomy), replacing the old catalogue-specific components. Update both `en` and `ar` translation files as needed for the new category names.
5. Keep prices hidden (`PRICES_ENABLED=false`) — I don't have a price list yet.
6. Work through this incrementally and commit/save progress after each batch/page rather than doing it all in one shot, so nothing is lost if something interrupts you.

Work autonomously through this list without needing to check in after each step — just keep going and let me know if you hit something that genuinely needs my input (e.g. an ambiguous taxonomy conflict, or a decision you can't make safely on your own).
