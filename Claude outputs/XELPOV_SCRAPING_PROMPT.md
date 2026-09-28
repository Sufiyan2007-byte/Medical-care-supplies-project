# Prompt — scrape product data & images from xelpovsurgical.com

Copy everything below the line into Antigravity (or any agentic tool with browser + file access).

---

## What I need

I'm building a product catalogue at `C:\Users\lenovo\Desktop\medical\client\public\xelpov_products.json` by scraping product data and real photos from the supplier site **https://xelpovsurgical.com**. I need you to continue adding products from that site — pulling each product's details and its actual photo, then writing them into my catalogue.

## Current progress

- Catalogue file: `client/public/xelpov_products.json` — currently **262 products**.
- Images folder: `client/public/xelpov_images/<category-slug>/<product-slug>.<jpg|png>` — currently only `microsurgery/` is populated.
- Within the **Microsurgery** specialty (235 products across 10 pages on the supplier site, ~24 per page), **pages 1–6 are done** (144 products + images). **Pages 7–10 remain** (91 products).
- After Microsurgery, there are ~2,900 more products across the rest of the supplier's specialties (Plastic Surgery, Urology, Ophthalmic, Stomach/Intestine & Rectum, Neurosurgery/Spine, Gynecology & Obstetrics, Oral & Maxillofacial, Cardiovascular, General Surgery, ENT, Dental, Orthopedic).

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

Rules:
- `specs` keys are camelCase versions of the supplier's spec-table row labels (e.g. "Working End Details" → `workingEndDetails`).
- Some of the supplier's own category names contain commas that must NOT be split when parsing comma-separated lists: `Stomach, Intestine & Rectum`, `Knives, Needles & Picks`, `Dissectors, Elevators & Levers`, `Files, Saws & Rasps`.
- Some products legitimately have no real photo — the supplier shows a generic placeholder image at a URL containing `xelpov-placeholder`. Detect this and set `"image": null` and `"images": []` instead of downloading the placeholder.
- Slugs come from the last path segment of the supplier's product URL, URL-decoded, with unicode fraction characters (½ ¼ ¾ ⌀) converted to words (half/quarter/three-quarter/diameter) before slugifying to lowercase-hyphenated ASCII.
- **Never store the supplier's verbatim marketing description.** Paraphrase each product's short description into original, factual language before saving it anywhere — this is a hard copyright-avoidance requirement, not a style preference.
- **Pull every image in the product's gallery, not just one.** Each product page has a full image grid/thumbnail strip (sometimes just one photo, sometimes several — different angles, a zoomed detail callout, a size-comparison graphic, etc.). Save all of them, numbering extras `<slug>.<ext>`, `<slug>-2.<ext>`, `<slug>-3.<ext>`, and so on. `image` holds the first (primary) one for list/thumbnail views; `images` holds the complete set in gallery order for the product detail page. **Always fetch the full-resolution source, never a downscaled thumbnail** — the gallery thumbnails on the page are small preview crops; use the `data-large_image` attribute (or equivalent full-size URL) so quality never drops from what's on the live site.

## The pipeline that has worked reliably (use this approach)

1. **Scrape product pages** with `fetch()` + `DOMParser()` run in-page (in a browser tab already on xelpovsurgical.com), extracting: title (`h1.product_title`), gallery image URLs (`.woocommerce-product-gallery img`, prefer the `data-large_image` attribute over `src`), the spec table (`table.woocommerce-product-attributes tr`), and the short description block. Batch ~6 product URLs per call and fetch them in **parallel** with `Promise.all()` — a sequential loop produced truncated/corrupted results in testing.

2. **Fetch every image in each product's gallery as base64** — not just the first one. On the product page, collect every URL from `.woocommerce-product-gallery img` (dedupe repeats), preferring each image's `data-large_image` attribute (the full-resolution source) over its small `src` thumbnail. Then in-page `fetch(url)` → `blob.arrayBuffer()` → manually base64-encode in chunks, for the whole set. Do this in parallel too. **Do not trigger native browser downloads** (clicking a download link) — those got stuck as pending `.tmp` files unreliably, and **never fetch a resized/thumbnail version when a full-size source URL is available** — always grab the same resolution the live site actually displays in its zoomed/lightbox view. Batch ~5 small images (10–40KB raw) per call, or fewer (1–3) for large "composite" images (150–350KB, filenames like `Untitled-design-NN.png` — these are a legitimate photo style the supplier uses sometimes, not something to skip).

3. **Decode and save** the base64 to disk, verify each image opens correctly before treating it as done.

4. **Paraphrase** each scraped short description into original factual language (see rule above) before saving the raw batch data.

5. **Transform** into the schema above: camelCase the specs, slugify, protect comma-containing category names, and map the *entire* non-placeholder image set to local paths under `/xelpov_images/<specialty-slug>/` — first image becomes `image` + `images[0]`, every additional gallery image gets appended to `images[]` with a numbered suffix on the filename. Don't drop images 2+ to save time; the whole grid matters.

6. **Check for slug collisions** against the existing `xelpov_products.json` before merging — a product cross-listed under multiple specialties on the supplier site should only be added once.

7. **Merge into `xelpov_products.json`** and save the images to `client/public/xelpov_images/<specialty-slug>/`.

8. Move to the next batch/page and repeat.

## What to do right now

Continue from where this left off: finish **Microsurgery pages 7–10** (91 more products), then keep going through the rest of the supplier's specialties in the same way until all ~3,150 products are added — real photos, original descriptions, correct schema. Work in batches and save/commit progress after each one rather than all at once, so nothing is lost if interrupted. Keep going without stopping to check in after each batch — just keep working through the list.
