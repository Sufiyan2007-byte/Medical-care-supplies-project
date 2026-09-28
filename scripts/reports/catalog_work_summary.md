# Catalogue image & Black & Black merge summary (2026-03-28)

## 1. Competitor branding audit

### Visual sample (44 images, 2 per specialty folder)
Manual review of a stratified sample (`scripts/reports/image_audit_sample.json`) plus spot checks found **three branding patterns** on Xelpov-origin assets:

| Pattern | Example | Prevalence in sample |
|---------|---------|----------------------|
| Large **background watermark** (peach “X” / arc strokes) | Ferreira breast retractor | Some hero/product shots |
| **Laser-etched “XELPOV” + CE** on the instrument shank | Tilley ear polypus forceps | Some steel instruments |
| **Clean studio** shots (line diagrams, no watermark) | Backhaus towel clamp, Harken clamp, bed pan | Common |

**Black & Black photography:** **0** products in-repo use B&B-hosted images (`sourceUrl` from blackandblacksurgical.com were added without copying their photos).

### Automated pass (all local `/xelpov_images/` files linked from JSON)
- **Images checked:** 3,015 (every on-disk file referenced by the catalogue)
- **Heuristic watermark flag (score ≥ 0.05):** 3 files → **3 products** tagged with  
  `"note": "Photo may show supplier branding — needs a clean replacement."`
- **Not auto-detected:** shank laser marks (requires OCR/manual review or reshoot)

### Fixed vs flagged
- **Replaced with clean photos:** 0 (no approved third-party sources wired in this pass)
- **Flagged in JSON:** 3 (watermark heuristic) + **162** with `image: null` noted for professional photography
- **Recommended next batch fix:** reshoot or license clean photos for watermark + laser-mark subsets, not crop/edit

## 2. Black & Black product merge

- **Store API products fetched:** 664
- **Added after dedupe (name similarity ≥ 0.82 → skip) + trademark/cannula filters:** 26 net new rows  
  (45 inserted, **19 removed** post-review for Tebbetts™, MicroAire®-type cannulas, Black Diamond™, etc.)
- **New total products:** **3,237**
- **New `mainCategory` values created:** none (mapped into existing list)
- **Categories used for additions:** Forceps, Retractors, Needle Holders & Passers, Dissectors, Rongeurs, Electrosurgical Instruments, Files/Saws & Rasps, Ancillary Products and Accessories

## 3. Missing images

- **Null `image` before B&B merge:** 136  
- **Null after merge + cleanup:** **162** (136 original + 26 B&B instruments without photos)
- **New real photos sourced this pass:** **0** (per policy: no Xelpov/B&B reuse; alternate OEM search not automated here)
- **All null rows** carry: `"No clean unbranded photo found online — needs a professional photo taken."`

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/sample_image_audit.py` | Build stratified audit sample |
| `scripts/catalog_branding_scan.py` | Watermark heuristic + note tagging |
| `scripts/merge_black_black_products.py` | B&B WooCommerce merge (cap 45, dedupe) |
| `scripts/_bb_products_cache.json` | Cached B&B API dump |
