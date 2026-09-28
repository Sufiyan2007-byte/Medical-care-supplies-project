"""Watermark heuristic + filename branding flags for xelpov product images."""
from __future__ import annotations

import json
import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "client" / "public" / "xelpov_products.json"
PUBLIC = ROOT / "client" / "public"
REPORT = ROOT / "scripts" / "reports" / "branding_audit_full.json"

BRAND_NOTE = "Photo may show supplier branding — needs a clean replacement."
def basename_branded(img: str) -> bool:
    base = img.split("/")[-1].lower()
    return base.startswith("xelpov") or "black-black" in base or "blackandblack" in base


def watermark_score(path: Path) -> float:
    im = Image.open(path).convert("RGB")
    im.thumbnail((400, 400))
    w, h = im.size
    pixels = im.load()
    hits = total = 0
    for y in range(h):
        for x in range(w):
            r, g, b = pixels[x, y]
            total += 1
            if r > 210 and g > 170 and b > 150 and r > g > b:
                hits += 1
    return hits / max(total, 1)


def main() -> None:
    products = json.loads(CATALOG.read_text(encoding="utf-8"))
    checked = 0
    flagged_slugs = set()

    for p in products:
        img = p.get("image") or ""
        if not img.startswith("/xelpov_images/"):
            continue
        path = PUBLIC / img.lstrip("/")
        if not path.is_file():
            continue
        checked += 1
        reasons = []
        if basename_branded(img):
            reasons.append("filename")
        if watermark_score(path) >= 0.05:
            reasons.append("watermark_heuristic")
        if reasons:
            p["note"] = BRAND_NOTE
            flagged_slugs.add(p["slug"])

    CATALOG.write_text(json.dumps(products, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(
        json.dumps(
            {
                "images_checked": checked,
                "products_flagged": len(flagged_slugs),
            },
            indent=2,
        ),
        encoding="utf-8",
    )
    print(REPORT.read_text())


if __name__ == "__main__":
    main()
