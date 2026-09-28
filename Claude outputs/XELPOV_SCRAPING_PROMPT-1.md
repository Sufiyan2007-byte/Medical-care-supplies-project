# Prompt — add every remaining product from xelpovsurgical.com, no duplicates

Copy everything below the line into Antigravity (or any agentic tool with browser + file access).

---

## What I need

I'm building a product catalogue at `C:\Users\lenovo\Desktop\medical\client\public\xelpov_products.json` by scraping product data and real photos from the supplier site **https://xelpovsurgical.com**. I need you to add every product from that site that isn't in the catalogue yet — pulling each product's details and its actual photo, then merging them in.

**Do not duplicate anything, and do not drop anything already there.** Before you write to the file at all:

1. Load the current `xelpov_products.json` fresh (don't rely on a cached copy from an earlier run — always re-read it right before you start, and again before each merge, since it may have changed since your last run).
2. Build a set of every existing `slug`.
3. Skip re-scraping or re-downloading anything whose slug is already in that set.
4. When you merge a batch in, **only add genuinely new products** — never replace or rewrite an existing entry, and never drop any field that's already on an existing entry (some entries may have fields beyond this schema, e.g. a `price` object — preserve those untouched, merge only new products, don't round-trip the whole file through a transform that could strip unknown keys).

## Product JSON schema

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
  "images": [
    "/xelpov_images/microsurgery/castroviejo-micro-needle-holder.png",
    "/xelpov_images/microsurgery/castroviejo-micro-needle-holder-2.jpg"
  ],
  "sourceUrl": "https://xelpovsurgical.com/product/castroviejo-micro-needle-holder/"
}
```

Note: newly added products from this pass will **not** have a `price` field — that's intentional and handled separately (xelpovsurgical.com doesn't publish prices; pricing is tracked as a follow-up step in the app, not part of scraping). Don't invent one.

Rules:
- `specs` keys are camelCase versions of the supplier's spec-table row labels (e.g. "Working End Details" → `workingEndDetails`).
- Some of the supplier's own category names contain commas that must NOT be split when parsing comma-separated lists: `Stomach, Intestine & Rectum`, `Knives, Needles & Picks`, `Dissectors, Elevators & Levers`, `Files, Saws & Rasps`.
- Some products legitimately have no real photo — the supplier shows a generic placeholder image at a URL containing `xelpov-placeholder`. Detect this and set `"image": null` and `"images": []` instead of downloading the placeholder.
- Slugs come from the last path segment of the supplier's product URL, URL-decoded, with unicode fraction characters (½ ¼ ¾ ⌀) converted to words (half/quarter/three-quarter/diameter) before slugifying to lowercase-hyphenated ASCII.
- **Never store the supplier's verbatim marketing description.** Paraphrase each product's short description into original, factual language before saving it anywhere — this is a hard copyright-avoidance requirement, not a style preference.
- **Pull every image in the product's gallery, not just one.** Save all of them, numbering extras `<slug>.<ext>`, `<slug>-2.<ext>`, `<slug>-3.<ext>`, and so on. `image` holds the first (primary) one for list/thumbnail views; `images` holds the complete set in gallery order. **Always fetch the full-resolution source, never a downscaled thumbnail** — use the `data-large_image` attribute (or equivalent) so quality never drops from what's on the live site.

## The pipeline that has worked reliably (use this approach)

1. **Scrape product pages** with `fetch()` + `DOMParser()` run in-page (in a browser tab already on xelpovsurgical.com), extracting: title (`h1.product_title`), gallery image URLs (`.woocommerce-product-gallery img`, prefer `data-large_image` over `src`), the spec table (`table.woocommerce-product-attributes tr`), and the short description block. Batch ~6 product URLs per call and fetch them in **parallel** with `Promise.all()` — a sequential loop produced truncated/corrupted results in testing.

2. **Fetch every image in each product's gallery as base64** — not just the first one. Collect every URL from `.woocommerce-product-gallery img` (dedupe repeats), preferring `data-large_image` over `src`. In-page `fetch(url)` → `blob.arrayBuffer()` → base64-encode in chunks. Do this in parallel too. **Do not trigger native browser downloads.** Batch ~5 small images (10–40KB) per call, or fewer (1–3) for large composite images (150–350KB).

3. **Decode and save** the base64 to disk, verify each image opens correctly before treating it as done.

4. **Paraphrase** each scraped short description into original factual language before saving.

5. **Transform** into the schema above: camelCase the specs, slugify, protect comma-containing category names, map the *entire* non-placeholder image set to local paths under `/xelpov_images/<specialty-slug>/`.

6. **Re-check for slug collisions** against a freshly re-read `xelpov_products.json` right before each merge (not just once at the start) — a product cross-listed under multiple specialties on the supplier site should only be added once, and another process may have changed the file since you started.

7. **Merge into `xelpov_products.json`** by appending only the new, non-duplicate entries — never rewrite or overwrite existing entries — and save images to `client/public/xelpov_images/<specialty-slug>/`. Save/commit progress after each batch, not all at once, so nothing is lost if interrupted.

8. Move to the next batch/page and repeat until every specialty on the site has been covered: Microsurgery, Plastic Surgery, Urology, Ophthalmic, Stomach/Intestine & Rectum, Neurosurgery/Spine, Gynecology & Obstetrics, Oral & Maxillofacial, Cardiovascular, General Surgery, ENT, Dental, Orthopedic, Post Mortem, Podiatry Instruments, Dermatology, Diagnostic, Skin Grafting, Anaesthesia Instruments, Mammaplasty, and any other specialty listed on the site's own navigation that isn't in this list yet — check the site itself for the authoritative list rather than assuming this one is complete.

## What to do right now

Re-read `xelpov_products.json` to see exactly what's already there (don't trust any progress note from an earlier session — the file may have changed), then work through every specialty on xelpovsurgical.com, skipping anything already present by slug, until every product on the site has been added — real photos, original descriptions, correct schema, nothing duplicated, nothing dropped. Work in batches and save/commit after each one. Keep going without stopping to check in after each batch.
