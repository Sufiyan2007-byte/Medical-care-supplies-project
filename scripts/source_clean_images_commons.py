"""Try Wikimedia Commons for clean product photos (non xelpov/b&b)."""
from __future__ import annotations

import io
import json
import re
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "client" / "public" / "xelpov_products.json"
PUBLIC = ROOT / "client" / "public"
UA = "MedicalCatalogBot/1.0 (internal; educational catalogue)"

NOTE_FAIL = "No clean unbranded photo found online — needs a professional photo taken."
BLOCK_DOMAIN = re.compile(r"xelpov|blackandblack|black-black", re.I)


def commons_search(query: str, limit: int = 5) -> list[str]:
    params = urllib.parse.urlencode(
        {
            "action": "query",
            "format": "json",
            "generator": "search",
            "gssearch": query,
            "gsnamespace": 6,
            "gslimit": limit,
            "prop": "imageinfo",
            "iiprop": "url|mime|size",
        }
    )
    url = f"https://commons.wikimedia.org/w/api.php?{params}"
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode())
    pages = data.get("query", {}).get("pages", {})
    out = []
    for page in pages.values():
        ii = (page.get("imageinfo") or [{}])[0]
        img_url = ii.get("url")
        if not img_url or BLOCK_DOMAIN.search(img_url):
            continue
        if (ii.get("size") or 0) < 8000:
            continue
        out.append(img_url)
    return out


def folder_for_product(p: dict) -> str:
    spec = (p.get("specialty") or ["general-surgery"])[0]
    return re.sub(r"[^a-z0-9]+", "-", spec.lower()).strip("-") or "general-surgery"


def download(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read()


def save_jpg(data: bytes, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    try:
        im = Image.open(io.BytesIO(data))
        if im.mode != "RGB":
            im = im.convert("RGB")
        im.save(dest, format="JPEG", quality=92)
    except Exception:
        dest.write_bytes(data)


def search_query(name: str) -> str:
    # Drop size fragments; focus on eponym + instrument type
    n = re.sub(r"\d+[^a-zA-Z]+", " ", name)
    n = re.sub(r"\s+", " ", n).strip()
    return f"{n} surgical instrument"


def main() -> None:
    products = json.loads(CATALOG.read_text(encoding="utf-8"))
    targets = [p for p in products if not p.get("image")]
    success = 0
    tried = 0
    max_attempts = 40  # cap runtime; extend in follow-up runs

    for p in targets:
        if tried >= max_attempts:
            break
        tried += 1
        q = search_query(p["name"])
        urls = commons_search(q)
        if not urls:
            p["note"] = NOTE_FAIL
            continue
        folder = folder_for_product(p)
        ext = ".jpg"
        rel = f"/xelpov_images/{folder}/{p['slug']}{ext}"
        dest = PUBLIC / rel.lstrip("/")
        try:
            data = download(urls[0])
            save_jpg(data, dest)
            p["image"] = rel
            p.pop("note", None)
            success += 1
        except Exception:
            p["note"] = NOTE_FAIL

    # ensure note on remaining nulls
    for p in products:
        if not p.get("image"):
            p["note"] = NOTE_FAIL

    CATALOG.write_text(json.dumps(products, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"tried={tried} success={success} still_null={sum(1 for p in products if not p.get('image'))}")


if __name__ == "__main__":
    main()
