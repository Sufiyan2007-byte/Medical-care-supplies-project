# Task completion report (B&B crawl, images, branding)

## 1. Black & Black — additional products

- Re-used cached WooCommerce dump (664 SKUs) + `merge_black_black_products.py` (skips URLs already in catalogue).
- **Second pass added 80** rows; **23 non-instruments/equipment** removed via `cleanup_bb_products.py` (light sources, power strips, basins, cables, promos, etc.).
- **B&B-sourced rows now: 83** (was **26**) → **+57 net new** instruments/accessories.
- **Catalogue total: 3,294** (was 3,237).
- **No new `mainCategory` values** — mapped into existing taxonomy.
- **0** new B&B rows received photos (see §2).

## 2. Images for null-image products

- **219** products have `"image": null` (162 original gap + 57 new B&B rows).
- **0** new photos were saved in this pass.
- Policy blocked reusing Xelpov/B&B photography; automated third-party search (Wikimedia API) was not run at scale because results cannot be spec-verified per SKU.
- All null-image rows keep:  
  `"note": "No clean unbranded photo found online — needs a professional photo taken."`

**Recommended pipeline:** export null list → human/OEM search or in-house photography → `scripts/attach_product_image.py` (to be added) with reviewer sign-off per SKU.

## 3. Logo / watermark audit

### Visual sample (44 images, 2/folder + spot checks)

| Issue | Examples | Pattern |
|-------|----------|---------|
| Peach **background watermark** | Ferreira breast retractor | Some hero shots |
| **Laser “XELPOV” + CE** on steel | Tilley forceps, scalpel handle #3, syringe stand | Common on Xelpov-origin photos |
| **Clean** (no logo/watermark) | Backhaus towel clamp, Harken clamp, bed pan, Fisch dissector diagram | Also common |

**Black & Black:** no B&B-hosted images in `client/public/`.

### Automated scan (corrected)

- **3,015** on-disk `/xelpov_images/` files scanned.
- **3 products flagged** (watermark heuristic ≥ 0.05 and/or branded **filename**, not the `xelpov_images/` folder name):
  - `ferreira-breast-retractor.png` — background watermark
  - `scalpel-handle-no-3-with-graduation.png` — watermark + shank branding visible
  - `xelpov-syringe-stand.jpg` — branded product name on item
- **0** replacements sourced; flagged rows retain branding `note`.
- A bad first pass briefly flagged all 3,015 rows because `xelpov_images/` path matched a regex — **reverted** via `fix_branding_notes.py`.

### Still open (systemic)

Laser-etched **XELPOV** on instruments is **not** detected by the peach watermark heuristic. A **manual/OCR sample** (e.g. 100–200 images) is needed before batch-flagging or batch-reshooting that subset.

## Scripts touched

- `merge_black_black_products.py` — second pass, skip existing B&B URLs
- `cleanup_bb_products.py` — remove equipment/disposables/promos
- `fix_branding_notes.py` / `branding_audit_full.py` — watermark + basename branding
- `dedupe_bb_against_catalog.py` — similarity ≥ 0.82 vs non-B&B (0 removed this run)
