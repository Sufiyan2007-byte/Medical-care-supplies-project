"""Revert mistaken branding notes from path false-positive (xelpov_images folder name)."""
from __future__ import annotations

import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "client" / "public" / "xelpov_products.json"
PUBLIC = ROOT / "client" / "public"
BRAND_NOTE = "Photo may show supplier branding — needs a clean replacement."
NOTE_FAIL = "No clean unbranded photo found online — needs a professional photo taken."


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


def basename_branded(img: str) -> bool:
    base = img.split("/")[-1].lower()
    return base.startswith("xelpov") or "black-black" in base or "blackandblack" in base


def main() -> None:
    products = json.loads(CATALOG.read_text(encoding="utf-8"))
    flagged = 0
    for p in products:
        if p.get("note") == BRAND_NOTE:
            p.pop("note", None)
        img = p.get("image") or ""
        if not img.startswith("/xelpov_images/"):
            continue
        path = PUBLIC / img.lstrip("/")
        if not path.is_file():
            continue
        if basename_branded(img) or watermark_score(path) >= 0.05:
            p["note"] = BRAND_NOTE
            flagged += 1
        elif not p.get("image"):
            p["note"] = NOTE_FAIL

    for p in products:
        if not p.get("image"):
            p["note"] = NOTE_FAIL

    CATALOG.write_text(json.dumps(products, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("flagged", flagged)


if __name__ == "__main__":
    main()
