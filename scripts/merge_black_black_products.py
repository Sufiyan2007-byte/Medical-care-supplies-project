"""Add deduped Black & Black surgical instruments to xelpov_products.json."""
from __future__ import annotations

import html
import json
import re
from difflib import SequenceMatcher
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "client" / "public" / "xelpov_products.json"
BB_CACHE = ROOT / "scripts" / "_bb_products_cache.json"
MAX_ADD = 80
SIM_DUPLICATE = 0.82

SKIP_NAME = re.compile(
    r"vitruvian|liposaber|lipoport|vorotek|contourfoam|cartilageplaner|ceracoat|"
    r"tebbetts|black diamond|microaire|storz\b|"
    r"infiltration pump|ultimate aspirator|counting infiltration|hard foot pedal|"
    r"sterilization tray|power liposuction|luer lock|syringe|canister|pump|"
    r"aspirator|foot switch|tubing|disposable|drape|gown|glove|marker pen|"
    r"cannula|harvester|transfer tube|identification tape|cleaning brush|"
    r"quick change wheel|fenestrated endoscopic forehead|onyx needle holder|onyx forceps|"
    r"endoforehead|accelerator cannula|power hub|left-handed",
    re.I,
)
SKIP_SET = re.compile(
    r"\b(set|tray|procedure set|facelift set|rhinoplasty set|mastectomy set|"
    r"abdominoplasty|comprehensive plastic surgery set|starter set)\b",
    re.I,
)

BB_CAT_MAP = {
    "surgical scissors": "Scissors",
    "needle holders": "Needle Holders & Passers",
    "thumb forceps": "Forceps",
    "ring forceps": "Forceps",
    "retractors": "Retractors",
    "dissectors": "Dissectors",
    "elevators": "Elevators & Levers",
    "speculums": "Speculums",
    "electrosurgical": "Electrosurgical Instruments",
    "headlights": "Lightening & Visualization",
    "hooks": "Hooks & Spatulas",
    "osteotomes": "Osteotomes",
    "rongeurs": "Rongeurs",
    "knives": "Knives",
    "rasps": "Files, Saws & Rasps",
    "morselizers": "Files, Saws & Rasps",
    "micro": "Forceps",
}


def clean_name(raw: str) -> str:
    s = html.unescape(re.sub(r"<[^>]+>", "", raw or ""))
    s = re.sub(r"\s+", " ", s).strip()
    return s


def norm(s: str) -> str:
    s = clean_name(s).lower()
    s = re.sub(r"[^a-z0-9]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def slugify(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", norm(name)).strip("-")[:90]


def best_similarity(name: str, ours: list) -> float:
    n = norm(name)
    return max((SequenceMatcher(None, n, norm(p["name"])).ratio() for p in ours), default=0.0)


def map_main_category(bb_item: dict) -> list[str]:
    cats = [c.get("name", "") for c in bb_item.get("categories", [])]
    joined = " ".join(cats).lower()
    for key, mc in BB_CAT_MAP.items():
        if key in joined:
            return [mc]
    if "forceps" in joined:
        return ["Forceps"]
    if "scissor" in joined:
        return ["Scissors"]
    return ["Ancillary Products and Accessories"]


def infer_specialty(cats: list[str]) -> list[str]:
    joined = " ".join(cats).lower()
    if "micro" in joined:
        return ["Microsurgery", "Plastic Surgery"]
    if "plastic" in joined:
        return ["Plastic Surgery"]
    return ["General Surgery"]


def parse_specs(desc_html: str) -> dict:
    text = html.unescape(re.sub(r"<[^>]+>", " ", desc_html or ""))
    specs = {
        "material": "Stainless Steel",
        "finish": "Satin",
        "ceMarking": True,
        "reusable": True,
    }
    if re.search(r"titanium", text, re.I):
        specs["material"] = "Titanium"
    if re.search(r"tungsten carbide|tc inserts", text, re.I):
        specs["workingEndDetails"] = "Tungsten carbide inserts"
    m = re.search(r"(\d+(?:\.\d+)?)\s*(cm|mm|in)", text, re.I)
    if m:
        specs["length"] = f"{m.group(1)} {m.group(2)}"
    return specs


def write_description(name: str, specs: dict, categories: list[str]) -> str:
    bits = [
        f"{name} for use in {categories[0] if categories else 'open surgical'} procedures.",
        "Manufactured from "
        f"{specs.get('material', 'stainless steel').lower()} with a {specs.get('finish', 'satin').lower()} finish.",
    ]
    if specs.get("length"):
        bits.append(f"Working length approximately {specs['length']}.")
    bits.append("Reusable after standard cleaning and sterilization; CE marked where applicable.")
    return " ".join(bits)


def main() -> None:
    ours = json.loads(CATALOG.read_text(encoding="utf-8"))
    bb = json.loads(BB_CACHE.read_text(encoding="utf-8"))
    existing_slugs = {p["slug"] for p in ours}
    existing_norm = {norm(p["name"]) for p in ours}

    bb_urls = {
        (p.get("sourceUrl") or "").rstrip("/").lower()
        for p in ours
        if "blackandblack" in (p.get("sourceUrl") or "").lower()
    }

    added = []
    for item in bb:
        if len(added) >= MAX_ADD:
            break
        permalink = (item.get("permalink") or "").rstrip("/").lower()
        if permalink and permalink in bb_urls:
            continue
        name = clean_name(item.get("name", ""))
        if not name or len(name) < 8:
            continue
        if SKIP_NAME.search(name) or SKIP_SET.search(name):
            continue
        if norm(name) in existing_norm:
            continue
        if best_similarity(name, ours) >= SIM_DUPLICATE:
            continue

        slug = slugify(name)
        if slug in existing_slugs:
            slug = f"{slug}-bb"
        main_cat = map_main_category(item)
        sub = []
        cat_names = [c.get("name", "") for c in item.get("categories", [])]
        if any("thumb" in c.lower() for c in cat_names):
            sub = ["Thumb Forceps"]
        elif any("ring" in c.lower() for c in cat_names):
            sub = ["Ring Forceps"]

        specs = parse_specs(item.get("description", "") + item.get("short_description", ""))
        product = {
            "slug": slug,
            "name": name,
            "specialty": infer_specialty(cat_names),
            "mainCategory": main_cat,
            "subCategory": sub,
            "specs": specs,
            "description": write_description(name, specs, cat_names),
            "image": None,
            "sourceUrl": item.get("permalink") or "",
            "price": {"amount": None, "currency": "USD", "onRequest": True},
            "note": "No clean unbranded photo found online — needs a professional photo taken.",
        }
        ours.append(product)
        existing_slugs.add(slug)
        existing_norm.add(norm(name))
        added.append(product)

    CATALOG.write_text(json.dumps(ours, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    report = ROOT / "scripts" / "reports" / "bb_merge_report.json"
    report.parent.mkdir(parents=True, exist_ok=True)
    report.write_text(
        json.dumps(
            {
                "added_count": len(added),
                "new_total": len(ours),
                "added_names": [p["name"] for p in added],
                "new_main_categories": sorted({p["mainCategory"][0] for p in added}),
            },
            indent=2,
        ),
        encoding="utf-8",
    )
    print(report.read_text())


if __name__ == "__main__":
    main()
