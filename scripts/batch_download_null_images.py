"""Download non-xelpov/non-B&B product images for null-image catalogue rows."""
from __future__ import annotations

import io
import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image

try:
    from ddgs import DDGS
except ImportError:
    try:
        from duckduckgo_search import DDGS  # noqa: F401
    except ImportError:
        DDGS = None

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "client" / "public" / "xelpov_products.json"
PUBLIC = ROOT / "client" / "public"
PROGRESS = ROOT / "scripts" / "reports" / "image_download_progress.json"

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
BLOCK = re.compile(
    r"xelpov|blackandblack|black-and-black|blackandblacksurgical|xelpovsurgical",
    re.I,
)
NOTE_FAIL = "No clean unbranded photo found online — needs a professional photo taken."

STRIP_NAME = re.compile(
    r"\b(B\s*&\s*B|Black\s*&\s*Black|Onyx|Supercut|Softouch|X-?Lite|E\.?P\.?)\b",
    re.I,
)

PREFERRED = (
    "sklar.com",
    "gpcmedical.com",
    "surgipro.com",
    "integracare.co.uk",
    "buschmedical.com",
    "jenseninstruments.com",
    "surgicalholdings.co.uk",
    "myco-medical.com",
    "nile-surgical.com",
    "lawton-instruments.com",
    "wranglersurgical.com",
    "medicalexpo.com",
    "henryschein.com",
    "medline.com",
)


def slugify(s: str) -> str:
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s[:60] or "general-surgery"


def primary_folder(products: list, p: dict) -> str:
    specs = p.get("specialty") or ["General Surgery"]
    for spec in specs:
        counts: dict[str, int] = {}
        for o in products:
            img = o.get("image") or ""
            if not img.startswith("/xelpov_images/"):
                continue
            if spec not in (o.get("specialty") or []):
                continue
            folder = img.split("/")[2]
            counts[folder] = counts.get(folder, 0) + 1
        if counts:
            return max(counts, key=counts.get)
    return slugify(specs[0])


def clean_name(name: str) -> str:
    name = re.sub(r"[™®]", "", name)
    name = STRIP_NAME.sub("", name)
    name = re.sub(r"\s+", " ", name).strip(" ,")
    return name


def build_queries(p: dict) -> list[str]:
    name = clean_name(p.get("name", ""))
    specs = p.get("specs") or {}
    main = (p.get("mainCategory") or [""])[0]
    sub = (p.get("subCategory") or [""])[0]
    bits = [name]
    for k in ("workingEndDetails", "length", "handleType", "authorName"):
        if specs.get(k):
            bits.append(str(specs[k]))
    full = " ".join(bits)
    queries = [
        f"{full} surgical instrument",
        f"{name} {main}".strip(),
        name,
    ]
    if sub:
        queries.append(f"{name} {sub}")
    author = specs.get("authorName")
    if author and author.lower() not in name.lower():
        queries.append(f"{author} {main} surgical instrument")
    # de-dupe preserving order
    seen: set[str] = set()
    out: list[str] = []
    for q in queries:
        q = re.sub(r"\s+", " ", q).strip()
        if q and q not in seen:
            seen.add(q)
            out.append(q)
    return out


def score_url(url: str) -> int:
    u = url.lower()
    if BLOCK.search(u):
        return -100
    for i, host in enumerate(PREFERRED):
        if host in u:
            return 100 - i
    if any(x in u for x in (".edu", ".gov", "wikimedia.org")):
        return 40
    if re.search(r"\.(jpg|jpeg|png|webp)(\?|$)", u, re.I):
        return 10
    return 0


def images_from_page(page_url: str) -> list[str]:
    urls: list[str] = []
    try:
        req = urllib.request.Request(page_url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=35) as resp:
            html = resp.read(350_000).decode(errors="ignore")
        for pat in (
            r'property="og:image"\s+content="([^"]+)"',
            r'name="twitter:image"\s+content="([^"]+)"',
            r'itemprop="image"\s+content="([^"]+)"',
            r'class="[^"]*woocommerce-product-gallery__image[^"]*"[^>]*>.*?src="([^"]+)"',
            r'data-large_image="([^"]+)"',
            r'data-src="(https?://[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"',
        ):
            for m in re.finditer(pat, html, re.I | re.S):
                u = m.group(1).replace("&amp;", "&")
                if score_url(u) >= 0 and u not in urls:
                    urls.append(u)
    except Exception:
        pass
    urls.sort(key=score_url, reverse=True)
    return urls


def search_images(queries: list[str], max_per_query: int = 10) -> list[str]:
    if not DDGS:
        return []
    urls: list[str] = []
    site_clause = " OR ".join(f"site:{h}" for h in PREFERRED[:8])
    for query in queries:
        try:
            for r in DDGS().images(query, max_results=max_per_query, safesearch="off"):
                u = r.get("image") or r.get("thumbnail") or r.get("url") or ""
                if u and score_url(u) >= 0:
                    urls.append(u)
        except Exception:
            pass
        time.sleep(0.8)
        try:
            shop_q = f"{query} ({site_clause})"
            for r in DDGS().text(shop_q, max_results=6):
                page = r.get("href") or ""
                if score_url(page) < 15:
                    continue
                for u in images_from_page(page):
                    if u not in urls:
                        urls.append(u)
                time.sleep(0.4)
        except Exception:
            pass
        time.sleep(0.6)

    urls = list(dict.fromkeys(urls))
    urls.sort(key=score_url, reverse=True)
    return urls


def download(url: str) -> bytes | None:
    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": UA, "Referer": "https://www.google.com/"},
        )
        with urllib.request.urlopen(req, timeout=45) as resp:
            data = resp.read()
        if len(data) < 6000:
            return None
        if BLOCK.search(url):
            return None
        return data
    except Exception:
        return None


def save_image(data: bytes, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    im = Image.open(io.BytesIO(data))
    if im.width < 180 or im.height < 180:
        raise ValueError("too small")
    if im.mode in ("RGBA", "P", "LA"):
        bg = Image.new("RGB", im.size, (255, 255, 255))
        if im.mode == "P":
            im = im.convert("RGBA")
        bg.paste(im, mask=im.split()[-1] if im.mode in ("RGBA", "LA") else None)
        im = bg
    elif im.mode != "RGB":
        im = im.convert("RGB")
    dest = dest.with_suffix(".jpg")
    im.save(dest, format="JPEG", quality=92)


def sort_key(p: dict) -> tuple:
    bb = 0 if "blackandblack" in (p.get("sourceUrl") or "").lower() else 1
    return (bb, p.get("slug", ""))


def main() -> None:
    import sys

    max_items = 9999
    bb_only = False
    retry_fail = False
    for arg in sys.argv[1:]:
        if arg == "--bb-only":
            bb_only = True
        elif arg == "--retry-fail":
            retry_fail = True
        elif arg.isdigit():
            max_items = int(arg)

    products = json.loads(CATALOG.read_text(encoding="utf-8"))
    progress: dict = {"ok": [], "fail": []}
    if PROGRESS.is_file():
        progress = json.loads(PROGRESS.read_text(encoding="utf-8"))
    progress["ok"] = list(dict.fromkeys(progress.get("ok", [])))
    fail_set = set(progress.get("fail", []))
    ok_set = set(progress["ok"])

    targets = [p for p in products if not p.get("image")]
    if bb_only:
        targets = [p for p in targets if "blackandblack" in (p.get("sourceUrl") or "").lower()]
    if retry_fail:
        targets = [p for p in targets if p["slug"] in fail_set]
    targets.sort(key=sort_key)

    slug_to_product = {p["slug"]: p for p in products}
    ok = 0
    fail = 0
    processed = 0
    new_fail: list[str] = []

    for p in targets:
        if processed >= max_items:
            break
        slug = p["slug"]
        if p.get("image"):
            continue
        if slug in ok_set and (PUBLIC / (p.get("image") or "").lstrip("/")).is_file():
            continue

        processed += 1
        folder = primary_folder(products, p)
        dest = PUBLIC / "xelpov_images" / folder / f"{slug}.jpg"
        queries = build_queries(p)
        urls = search_images(queries)
        saved = False
        for url in urls[:14]:
            data = download(url)
            if not data:
                continue
            try:
                save_image(data, dest)
                rel = f"/xelpov_images/{folder}/{slug}.jpg"
                p["image"] = rel
                p.pop("note", None)
                if slug not in progress["ok"]:
                    progress["ok"].append(slug)
                ok_set.add(slug)
                fail_set.discard(slug)
                ok += 1
                saved = True
                print("OK", slug)
                break
            except Exception:
                if dest.is_file():
                    dest.unlink(missing_ok=True)
                continue
        if not saved:
            p["note"] = NOTE_FAIL
            if slug not in fail_set:
                new_fail.append(slug)
            fail_set.add(slug)
            fail += 1
            print("FAIL", slug)
        time.sleep(1.0)

    progress["fail"] = sorted(fail_set)
    CATALOG.write_text(json.dumps(products, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    PROGRESS.write_text(json.dumps(progress, indent=2), encoding="utf-8")
    still = [p["slug"] for p in products if not p.get("image")]
    print("batch_ok", ok, "batch_fail", fail, "still_null", len(still))


if __name__ == "__main__":
    main()
