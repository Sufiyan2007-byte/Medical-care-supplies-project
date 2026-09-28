"""Heuristic scan for Xelpov-style background watermarks on local product images."""
from __future__ import annotations

import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "client" / "public" / "xelpov_products.json"
PUBLIC = ROOT / "client" / "public"
REPORT = ROOT / "scripts" / "reports" / "branding_scan_results.json"

# Soft peach / pink watermark strokes common on xelpovsurgical product photos.
WATERMARK_NOTE = "Photo may show supplier branding — needs a clean replacement."


def watermark_score(path: Path) -> float:
    """Return 0..1 score; higher = more likely branded background watermark."""
    im = Image.open(path).convert("RGB")
    im.thumbnail((400, 400))
    w, h = im.size
    pixels = im.load()
    hits = 0
    total = 0
    for y in range(h):
        for x in range(w):
            r, g, b = pixels[x, y]
            total += 1
            # light background + peach/pink accent strokes
            if r > 210 and g > 170 and b > 150 and r > g > b:
                hits += 1
    return hits / max(total, 1)


def main() -> None:
    products = json.loads(CATALOG.read_text(encoding="utf-8"))
    checked = 0
    flagged_files: dict[str, float] = {}
    missing_files = 0

    for p in products:
        img = p.get("image") or ""
        if not img.startswith("/xelpov_images/"):
            continue
        path = PUBLIC / img.lstrip("/")
        if not path.is_file():
            missing_files += 1
            continue
        checked += 1
        score = watermark_score(path)
        if score >= 0.05:  # tuned: ~0.12 watermarked hero shots; ~0.001 clean studio
            flagged_files[img] = round(score, 4)

    # Apply notes to products using flagged images
    flagged_slugs = []
    for p in products:
        if p.get("image") in flagged_files:
            p["note"] = WATERMARK_NOTE
            flagged_slugs.append(p["slug"])

    CATALOG.write_text(json.dumps(products, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(
        json.dumps(
            {
                "images_checked": checked,
                "missing_image_files": missing_files,
                "heuristic_watermark_flagged": len(flagged_files),
                "products_tagged_with_note": len(flagged_slugs),
                "sample_flagged_paths": list(flagged_files.items())[:20],
            },
            indent=2,
        ),
        encoding="utf-8",
    )
    print(json.dumps(json.loads(REPORT.read_text()), indent=2))


if __name__ == "__main__":
    main()
