"""Drop B&B rows that duplicate an existing catalogue instrument by name similarity."""
from __future__ import annotations

import json
from difflib import SequenceMatcher
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "client" / "public" / "xelpov_products.json"
THRESH = 0.82


def norm(s: str) -> str:
    return " ".join((s or "").lower().split())


def main() -> None:
    products = json.loads(CATALOG.read_text(encoding="utf-8"))
    non_bb = [p for p in products if "blackandblack" not in (p.get("sourceUrl") or "").lower()]
    kept = list(non_bb)
    removed = []
    for p in products:
        if "blackandblack" not in (p.get("sourceUrl") or "").lower():
            continue
        n = norm(p["name"])
        best = max((SequenceMatcher(None, n, norm(o["name"])).ratio() for o in non_bb), default=0)
        if best >= THRESH:
            removed.append((p["name"], best))
            continue
        kept.append(p)
    Path(CATALOG).write_text(json.dumps(kept, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("removed_bb_duplicates", len(removed), "total", len(kept))


if __name__ == "__main__":
    main()
